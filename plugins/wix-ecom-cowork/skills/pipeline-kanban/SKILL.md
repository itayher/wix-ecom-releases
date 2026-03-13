# Pipeline Kanban - Cart-to-Customer Pipeline Management

## Overview

Build and manage a Pipedrive-style Kanban view that links carts to customers who purchased orders. Define custom columns/stages, move cards between statuses, and document every status change with a full audit trail.

**Implementation**: Uses two CMS Data Collections as the backing store:
- `PipelineCards` - Kanban cards with stage, customer, and order data
- `PipelineAuditLog` - Immutable log of every status change

This approach provides full REST API access (unlike Wix Workflows which has no public REST API), custom fields, and complete audit trails.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Architecture

The Kanban pipeline links three Wix data sources:

1. **Carts/Checkouts** - Active shopping carts and abandoned carts
2. **Orders** - Completed purchases with payment status
3. **Contacts** - Customer profiles linked to carts and orders

Two CMS collections provide the Kanban state:

```
PipelineCards (CMS Collection)
├── _id               (auto)
├── title             (TEXT) - Card display name
├── stage             (TEXT) - Current pipeline stage
├── stageOrder        (NUMBER) - Stage sort order
├── orderId           (TEXT) - Linked Wix order ID
├── cartId            (TEXT) - Linked cart ID (if pre-purchase)
├── contactId         (TEXT) - Linked contact ID
├── customerName      (TEXT) - Customer display name
├── customerEmail     (TEXT) - Customer email
├── orderTotal        (NUMBER) - Order/cart total amount
├── orderNumber       (TEXT) - Wix order number
├── itemCount         (NUMBER) - Number of line items
├── notes             (TEXT) - Free-text notes
├── assignedTo        (TEXT) - Assigned team member
├── priority          (TEXT) - low/medium/high/urgent
├── _createdDate      (auto)
├── _updatedDate      (auto)

PipelineAuditLog (CMS Collection)
├── _id               (auto)
├── cardId            (TEXT) - Reference to PipelineCards._id
├── orderId           (TEXT) - Order ID for cross-reference
├── contactId         (TEXT) - Contact ID
├── fromStage         (TEXT) - Previous stage name
├── toStage           (TEXT) - New stage name
├── movedBy           (TEXT) - Who made the change
├── reason            (TEXT) - Why the change was made
├── timestamp         (DATETIME) - When the change happened
├── _createdDate      (auto)
```

## Step 0: Create Pipeline Collections

### Create PipelineCards Collection

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "id": "PipelineCards",
    "displayName": "Pipeline Cards",
    "fields": [
      { "key": "title", "displayName": "Title", "type": "TEXT" },
      { "key": "stage", "displayName": "Stage", "type": "TEXT" },
      { "key": "stageOrder", "displayName": "Stage Order", "type": "NUMBER" },
      { "key": "orderId", "displayName": "Order ID", "type": "TEXT" },
      { "key": "cartId", "displayName": "Cart ID", "type": "TEXT" },
      { "key": "contactId", "displayName": "Contact ID", "type": "TEXT" },
      { "key": "customerName", "displayName": "Customer Name", "type": "TEXT" },
      { "key": "customerEmail", "displayName": "Customer Email", "type": "TEXT" },
      { "key": "orderTotal", "displayName": "Order Total", "type": "NUMBER" },
      { "key": "orderNumber", "displayName": "Order Number", "type": "TEXT" },
      { "key": "itemCount", "displayName": "Item Count", "type": "NUMBER" },
      { "key": "notes", "displayName": "Notes", "type": "TEXT" },
      { "key": "assignedTo", "displayName": "Assigned To", "type": "TEXT" },
      { "key": "priority", "displayName": "Priority", "type": "TEXT" }
    ]
  }
}'
```

### Create PipelineAuditLog Collection

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "id": "PipelineAuditLog",
    "displayName": "Pipeline Audit Log",
    "fields": [
      { "key": "cardId", "displayName": "Card ID", "type": "TEXT" },
      { "key": "orderId", "displayName": "Order ID", "type": "TEXT" },
      { "key": "contactId", "displayName": "Contact ID", "type": "TEXT" },
      { "key": "fromStage", "displayName": "From Stage", "type": "TEXT" },
      { "key": "toStage", "displayName": "To Stage", "type": "TEXT" },
      { "key": "movedBy", "displayName": "Moved By", "type": "TEXT" },
      { "key": "reason", "displayName": "Reason", "type": "TEXT" },
      { "key": "timestamp", "displayName": "Timestamp", "type": "DATETIME" }
    ]
  }
}'
```

## Default Pipeline Stages

| Stage | Order | Description |
|-------|-------|-------------|
| New Cart | 0 | Cart created by visitor |
| Checkout Started | 1 | Customer entered checkout |
| Payment Pending | 2 | Awaiting payment confirmation |
| Paid | 3 | Payment confirmed |
| Fulfillment In Progress | 4 | Preparing shipment |
| Shipped | 5 | Package dispatched with tracking |
| Delivered | 6 | Package received by customer |
| Follow-up | 7 | Post-purchase engagement |
| Refunded | 9 | Order was fully or partially refunded |

Users can define custom stages by using different `stage` and `stageOrder` values.

## View Kanban Board

Query all cards grouped by stage:

```bash
# Get all pipeline cards sorted by stage
cards=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "PipelineCards",
  "query": {
    "sort": [
      { "fieldName": "stageOrder", "order": "ASC" },
      { "fieldName": "_updatedDate", "order": "DESC" }
    ],
    "paging": { "limit": 200 }
  }
}')

# Display as Kanban board
echo "======================================"
echo "  KANBAN BOARD: Cart-to-Customer"
echo "======================================"

# Get unique stages in order
stages=$(echo "$cards" | jq -r '[.items[] | {stage: .data.stage, order: .data.stageOrder}] | unique_by(.stage) | sort_by(.order) | .[].stage')

for stage in $stages; do
  stage_cards=$(echo "$cards" | jq -r --arg s "$stage" '[.items[] | select(.data.stage == $s)]')
  count=$(echo "$stage_cards" | jq 'length')
  echo ""
  echo "━━━ ${stage} (${count}) ━━━"
  echo "$stage_cards" | jq -r '.[] | "  \(.data.title) [$\(.data.orderTotal // 0)] [ID: \(._id)]"'
done

total=$(echo "$cards" | jq '.items | length')
echo ""
echo "Total Cards: $total"
echo "======================================"
```

## Create Pipeline Card from Order

```bash
ORDER_ID="order-id-here"

# Get order details
order=$(curl -s -X GET "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

# Extract order info
NAME=$(echo "$order" | jq -r '"\(.order.billingInfo.contactDetails.firstName) \(.order.billingInfo.contactDetails.lastName)"')
EMAIL=$(echo "$order" | jq -r '.order.buyerInfo.email')
TOTAL=$(echo "$order" | jq -r '.order.priceSummary.total')
ORDER_NUM=$(echo "$order" | jq -r '.order.number')
ITEMS=$(echo "$order" | jq '.order.lineItems | length')

# Create pipeline card
curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "PipelineCards",
  "dataItem": {
    "data": {
      "title": "'"${NAME} - Order #${ORDER_NUM} (\$${TOTAL})"'",
      "stage": "Paid",
      "stageOrder": 3,
      "orderId": "'"${ORDER_ID}"'",
      "customerName": "'"${NAME}"'",
      "customerEmail": "'"${EMAIL}"'",
      "orderTotal": '"${TOTAL}"',
      "orderNumber": "'"${ORDER_NUM}"'",
      "itemCount": '"${ITEMS}"',
      "priority": "medium"
    }
  }
}'
```

## Batch Import Orders to Pipeline

```bash
# Get recent paid orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "sort": "{\"dateCreated\": \"desc\"}", "paging": {"limit": 50}}}')

# Build bulk insert payload
ITEMS=$(echo "$orders" | jq '[.orders[] | {
  "data": {
    "title": "\(.billingInfo.contactDetails.firstName) \(.billingInfo.contactDetails.lastName) - Order #\(.number) ($\(.priceSummary.total))",
    "stage": "Paid",
    "stageOrder": 3,
    "orderId": .id,
    "customerName": "\(.billingInfo.contactDetails.firstName) \(.billingInfo.contactDetails.lastName)",
    "customerEmail": .buyerInfo.email,
    "orderTotal": (.priceSummary.total | tonumber),
    "orderNumber": (.number | tostring),
    "itemCount": (.lineItems | length),
    "priority": "medium"
  }
}]')

# Bulk insert
curl -s -X POST "https://www.wixapis.com/wix-data/v2/bulk/items/insert" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItems\": ${ITEMS}
}"

echo "Imported $(echo "$orders" | jq '.orders | length') orders to pipeline"
```

## Move Card to New Stage

This is the core Kanban operation. Always logs to the audit trail.

```bash
CARD_ID="card-id-here"
NEW_STAGE="Shipped"
NEW_STAGE_ORDER=5
REASON="Tracking number: 1Z999AA10123456784"
MOVED_BY="User"

# 1. Get current card to know the old stage
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

OLD_STAGE=$(echo "$card" | jq -r '.items[0].data.stage')
ORDER_ID=$(echo "$card" | jq -r '.items[0].data.orderId')
CONTACT_ID=$(echo "$card" | jq -r '.items[0].data.contactId')

# 2. Update the card's stage
curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${CARD_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItem\": {
    \"_id\": \"${CARD_ID}\",
    \"data\": {
      \"stage\": \"${NEW_STAGE}\",
      \"stageOrder\": ${NEW_STAGE_ORDER}
    }
  }
}"

# 3. Log to audit trail
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineAuditLog\",
  \"dataItem\": {
    \"data\": {
      \"cardId\": \"${CARD_ID}\",
      \"orderId\": \"${ORDER_ID}\",
      \"contactId\": \"${CONTACT_ID}\",
      \"fromStage\": \"${OLD_STAGE}\",
      \"toStage\": \"${NEW_STAGE}\",
      \"movedBy\": \"${MOVED_BY}\",
      \"reason\": \"${REASON}\",
      \"timestamp\": \"${NOW}\"
    }
  }
}"

echo "Moved: ${OLD_STAGE} -> ${NEW_STAGE}"
echo "Reason: ${REASON}"
```

## View Card History (Audit Trail)

```bash
CARD_ID="card-id-here"

echo "======================================"
echo "  CARD HISTORY"
echo "======================================"

history=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineAuditLog\",
  \"query\": {
    \"filter\": { \"cardId\": { \"\$eq\": \"${CARD_ID}\" } },
    \"sort\": [{ \"fieldName\": \"timestamp\", \"order\": \"ASC\" }],
    \"paging\": { \"limit\": 100 }
  }
}")

echo "$history" | jq -r '.items[] | "\(.data.timestamp | split("T")[0]) \(.data.timestamp | split("T")[1] | split(".")[0]) | \(.data.fromStage) -> \(.data.toStage) | By: \(.data.movedBy) | \(.data.reason)"'
```

## Filter Cards by Stage

```bash
STAGE="Paid"

cards=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"query\": {
    \"filter\": { \"stage\": { \"\$eq\": \"${STAGE}\" } },
    \"sort\": [{ \"fieldName\": \"_updatedDate\", \"order\": \"DESC\" }],
    \"paging\": { \"limit\": 50 }
  }
}")

echo "Cards in ${STAGE}:"
echo "$cards" | jq -r '.items[] | "  \(.data.title) | $\(.data.orderTotal) | \(.data.customerEmail)"'
```

## Pipeline Summary Statistics

```bash
# Get all cards
cards=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"dataCollectionId": "PipelineCards", "query": {"paging": {"limit": 500}}}')

echo "======================================"
echo "  PIPELINE SUMMARY"
echo "======================================"

total=$(echo "$cards" | jq '.items | length')
echo "Total Cards: $total"
echo ""

# Aggregate by stage using CMS aggregation
agg=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "PipelineCards",
  "aggregation": {
    "groupingFields": ["stage"],
    "operations": [
      { "resultFieldName": "count", "itemCount": {} },
      { "resultFieldName": "totalValue", "sum": { "itemFieldName": "orderTotal" } }
    ]
  }
}')

echo "By Stage:"
echo "$agg" | jq -r '.results[] | "  \(.stage): \(.count) cards ($\(.totalValue // 0))"'

total_value=$(echo "$cards" | jq '[.items[] | .data.orderTotal // 0] | add')
echo ""
echo "Total Pipeline Value: \$$total_value"
```

## Cart Integration

### Import Abandoned Carts

```bash
# Get abandoned checkouts
abandoned=$(curl -s -X POST "https://www.wixapis.com/ecom/v1/abandoned-checkouts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 50}, "sort": [{"fieldName": "abandonedDate", "order": "DESC"}]}}')

# Create pipeline cards for abandoned carts
echo "$abandoned" | jq -r '.abandonedCheckouts[] | "\(.id)|\(.buyerInfo.email // "Unknown")|\(.subtotal // 0)"' | while IFS='|' read cartId email total; do
  curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"dataCollectionId\": \"PipelineCards\",
    \"dataItem\": {
      \"data\": {
        \"title\": \"Abandoned Cart - ${email} (\$${total})\",
        \"stage\": \"Checkout Started\",
        \"stageOrder\": 1,
        \"cartId\": \"${cartId}\",
        \"customerEmail\": \"${email}\",
        \"orderTotal\": ${total},
        \"priority\": \"high\"
      }
    }
  }"
  echo "  + Abandoned cart: ${email} (\$${total})"
done
```

## Refund Order from Card

Check refundability and process a refund directly from a pipeline card.

### Check Refundability

```bash
CARD_ID="card-id-here"

# 1. Get order ID from the card
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

ORDER_ID=$(echo "$card" | jq -r '.items[0].data.orderId')
CARD_TITLE=$(echo "$card" | jq -r '.items[0].data.title')

if [ "$ORDER_ID" = "null" ] || [ -z "$ORDER_ID" ]; then
  echo "No order linked to this card"
  exit 1
fi

# 2. Check refundability
refund_check=$(curl -s -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"${ORDER_ID}\"}")

can_refund=$(echo "$refund_check" | jq -r '.refundable')
max_refund=$(echo "$refund_check" | jq -r '.maxRefundAmount')

echo "Card: ${CARD_TITLE}"
echo "Order: ${ORDER_ID}"
echo "Refundable: ${can_refund}"
echo "Max Refund: \$${max_refund}"
```

### Process Refund and Update Card

```bash
CARD_ID="card-id-here"
REFUND_AMOUNT="full"  # or a specific amount like "50.00"
REASON="Customer request"

# 1. Get card details
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

ORDER_ID=$(echo "$card" | jq -r '.items[0].data.orderId')
OLD_STAGE=$(echo "$card" | jq -r '.items[0].data.stage')
CONTACT_ID=$(echo "$card" | jq -r '.items[0].data.contactId')
OLD_NOTES=$(echo "$card" | jq -r '.items[0].data.notes // ""')

# 2. Check refundability and get max amount
refund_check=$(curl -s -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"${ORDER_ID}\"}")

max_refund=$(echo "$refund_check" | jq -r '.maxRefundAmount')
can_refund=$(echo "$refund_check" | jq -r '.refundable')

if [ "$can_refund" != "true" ]; then
  echo "Order cannot be refunded"
  exit 1
fi

# Determine refund amount
if [ "$REFUND_AMOUNT" = "full" ]; then
  REFUND_AMOUNT="${max_refund}"
fi

# 3. Process the refund
curl -s -X POST "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}/refunds" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"refund\": {
    \"amount\": ${REFUND_AMOUNT},
    \"reason\": \"${REASON}\"
  }
}"

# 4. Update card stage to "Refunded" and append note
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
REFUND_NOTE="[${NOW}] Refunded \$${REFUND_AMOUNT} - ${REASON}"
UPDATED_NOTES="${OLD_NOTES}\n${REFUND_NOTE}"

curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${CARD_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItem\": {
    \"_id\": \"${CARD_ID}\",
    \"data\": {
      \"stage\": \"Refunded\",
      \"stageOrder\": 9,
      \"notes\": \"${UPDATED_NOTES}\"
    }
  }
}"

# 5. Log refund to audit trail
curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineAuditLog\",
  \"dataItem\": {
    \"data\": {
      \"cardId\": \"${CARD_ID}\",
      \"orderId\": \"${ORDER_ID}\",
      \"contactId\": \"${CONTACT_ID}\",
      \"fromStage\": \"${OLD_STAGE}\",
      \"toStage\": \"Refunded\",
      \"movedBy\": \"User\",
      \"reason\": \"Refund \$${REFUND_AMOUNT}: ${REASON}\",
      \"timestamp\": \"${NOW}\"
    }
  }
}"

echo "Refund processed: \$${REFUND_AMOUNT}"
echo "Card moved: ${OLD_STAGE} -> Refunded"
echo "Audit trail updated"
```

## Update Card Notes

Add documentation notes to a card without changing its stage.

```bash
CARD_ID="card-id-here"
NEW_NOTE="Customer called to confirm delivery address change"

# 1. Get current notes
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

OLD_NOTES=$(echo "$card" | jq -r '.items[0].data.notes // ""')
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# 2. Append timestamped note
UPDATED_NOTES="${OLD_NOTES}\n[${NOW}] ${NEW_NOTE}"

curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${CARD_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItem\": {
    \"_id\": \"${CARD_ID}\",
    \"data\": {
      \"notes\": \"${UPDATED_NOTES}\"
    }
  }
}"

echo "Note added to card ${CARD_ID}"
```

## Assign Card to Contact

Link a pipeline card to a specific Wix contact for customer tracking.

```bash
CARD_ID="card-id-here"
CONTACT_EMAIL="customer@example.com"

# 1. Find the contact by email
contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": { \"info.emails.email\": { \"\$eq\": \"${CONTACT_EMAIL}\" } },
    \"paging\": { \"limit\": 1 }
  }
}")

CONTACT_ID=$(echo "$contact" | jq -r '.contacts[0].id')
CONTACT_NAME=$(echo "$contact" | jq -r '"\(.contacts[0].info.name.first) \(.contacts[0].info.name.last)"')

if [ "$CONTACT_ID" = "null" ] || [ -z "$CONTACT_ID" ]; then
  echo "No contact found for ${CONTACT_EMAIL}"
  exit 1
fi

# 2. Update the card with contact details
curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${CARD_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItem\": {
    \"_id\": \"${CARD_ID}\",
    \"data\": {
      \"contactId\": \"${CONTACT_ID}\",
      \"customerName\": \"${CONTACT_NAME}\",
      \"customerEmail\": \"${CONTACT_EMAIL}\"
    }
  }
}"

echo "Card ${CARD_ID} assigned to ${CONTACT_NAME} (${CONTACT_EMAIL})"
echo "Contact ID: ${CONTACT_ID}"
```

## Contact Lookup

### Get Contact for Card

```bash
CONTACT_ID="contact-id-here"

curl -s -X GET "https://www.wixapis.com/contacts/v4/contacts/${CONTACT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" | jq '{
  name: "\(.contact.info.name.first) \(.contact.info.name.last)",
  email: .contact.info.emails[0].email,
  phone: .contact.info.phones[0].phone,
  labels: [.contact.info.labelKeys[]],
  created: .contact.createdDate
}'
```

### Search Contact by Email

```bash
EMAIL="customer@example.com"

curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": { \"info.emails.email\": { \"\$eq\": \"${EMAIL}\" } },
    \"paging\": { \"limit\": 5 }
  }
}"
```

## Add Custom Pipeline Stage

```bash
# To add a custom stage, simply create cards with a new stage name and order
# Example: Add "VIP Review" between "Paid" (3) and "Fulfillment In Progress" (4)

NEW_STAGE="VIP Review"
NEW_ORDER=3.5

# Or reorder all stages:
# New Cart: 0, Checkout Started: 1, Payment Pending: 2, Paid: 3,
# VIP Review: 4, Fulfillment In Progress: 5, Shipped: 6, Delivered: 7, Follow-up: 8

# Bulk update stageOrder for cards after the insertion point
curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"dataCollectionId": "PipelineCards", "query": {"filter": {"stageOrder": {"$gte": 4}}, "paging": {"limit": 500}}}' | \
  jq -r '.items[] | ._id' | while read cardId; do
    curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${cardId}" \
      -H "Authorization: ${API_KEY}" \
      -H "wix-site-id: ${SITE_ID}" \
      -H "Content-Type: application/json" \
      -d "{\"dataCollectionId\": \"PipelineCards\", \"dataItem\": {\"_id\": \"${cardId}\", \"data\": {\"stageOrder\": \$(echo \"scale=0; $(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" -H "Authorization: ${API_KEY}" -H "wix-site-id: ${SITE_ID}" -H "Content-Type: application/json" -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${cardId}\"}}}}" | jq '.items[0].data.stageOrder') + 1\" | bc)}}}"
  done
```

## Wix Pipelines Dashboard Integration

The Wix Pipelines dashboard at:
`https://manage.wix.com/dashboard/{siteId}/pipelines`

provides a visual Kanban UI. While it doesn't have a public REST API, Playwright capture scripts can discover the internal APIs. Run:

```bash
cd playwright && npm run capture:pipelines
```

This will open the Pipelines page and record all API calls for documentation.

## Best Practices

1. **Always log status changes** to the PipelineAuditLog collection
2. **Link cards to contacts** via contactId for full customer context
3. **Use stageOrder** for sorting stages in the Kanban view
4. **Batch card creation** when importing from existing orders
5. **Keep card titles descriptive**: "Name - Order #XXX ($Total)"
6. **Rate limit**: 200ms between API calls
7. **Clean up completed cards** periodically (archive delivered + follow-up)
8. **Use priority field** to highlight urgent cards
9. **Use notes field** for manual annotations
10. **Use assignedTo** for team member assignment
