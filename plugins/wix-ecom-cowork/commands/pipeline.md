# Pipeline - Cart-to-Customer Kanban Board

Build and manage a Pipedrive-style Kanban view linking carts to customers. Define columns, move cards between stages, and document every status change with a full audit trail.

## Command Pattern

```
Show me the pipeline board
Set up a new pipeline
Show kanban view
Move [card/order] to [stage]
What's in the "Paid" column?
Show pipeline for [customer]
Pipeline history for [order]
Add [order] to pipeline
Define pipeline stages
Refund order on card [card ID]
Can this order be refunded?
Add note to card [card ID]
Assign card to [customer email]
```

## Workflow

### Step 1: Validate Configuration

```bash
node -e "
const { getActiveSiteId, getActiveSiteName } = require('./wix-store-optimizer/lib/site-storage');
const { validateConfig } = require('./lib/config-validator');

const validation = validateConfig();
if (!validation.valid) {
  console.error(validation.message);
  process.exit(1);
}

const siteId = getActiveSiteId();
if (!siteId) {
  console.error('No site selected.');
  process.exit(1);
}

console.error(\`Pipeline for: \${getActiveSiteName()}\`);
"
```

### Step 2: Show Pipeline Board (Kanban View)

Use the **pipeline-kanban** skill patterns (CMS-backed):

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "  PIPELINE KANBAN BOARD"
echo "======================================"

# Get all pipeline cards from CMS
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

# Get unique stages in order and display as Kanban
stages=$(echo "$cards" | jq -r '[.items[] | {stage: .data.stage, order: .data.stageOrder}] | unique_by(.stage) | sort_by(.order) | .[].stage')

for stage in $stages; do
  stage_cards=$(echo "$cards" | jq --arg s "$stage" '[.items[] | select(.data.stage == $s)]')
  count=$(echo "$stage_cards" | jq 'length')
  echo ""
  echo "━━━ ${stage} (${count}) ━━━"
  echo "$stage_cards" | jq -r '.[] | "  \(.data.title) [ID: \(._id)]"'
done

echo ""
total_cards=$(echo "$cards" | jq '.items | length')
echo "Total Cards: $total_cards"
echo "======================================"
```

### Step 3: Initialize Pipeline (Create CMS Collections)

```bash
echo "======================================"
echo "  INITIALIZE PIPELINE"
echo "======================================"

# Create PipelineCards collection
curl -s -X POST "https://www.wixapis.com/wix-data/v2/collections" \
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

echo "PipelineCards collection created"

# Create PipelineAuditLog collection
curl -s -X POST "https://www.wixapis.com/wix-data/v2/collections" \
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

echo "PipelineAuditLog collection created"
echo ""
echo "Default stages: New Cart | Checkout Started | Payment Pending | Paid | Fulfillment In Progress | Shipped | Delivered | Follow-up"
```

### Step 4: Populate Pipeline from Orders

```bash
# Get recent paid orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "sort": "{\"dateCreated\": \"desc\"}", "paging": {"limit": 50}}}')

echo "Importing orders to pipeline..."
echo ""

echo "$orders" | jq -r '.orders[] | "\(.id)|\(.billingInfo.contactDetails.firstName) \(.billingInfo.contactDetails.lastName)|\(.priceSummary.total)|\(.number)|\(.buyerInfo.email)|\(.lineItems | length)"' | while IFS='|' read orderId name total orderNum email items; do
  curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"dataCollectionId\": \"PipelineCards\",
    \"dataItem\": {
      \"data\": {
        \"title\": \"${name} - Order #${orderNum} (\$${total})\",
        \"stage\": \"Paid\",
        \"stageOrder\": 3,
        \"orderId\": \"${orderId}\",
        \"customerName\": \"${name}\",
        \"customerEmail\": \"${email}\",
        \"orderTotal\": ${total},
        \"orderNumber\": \"${orderNum}\",
        \"itemCount\": ${items},
        \"priority\": \"medium\"
      }
    }
  }" > /dev/null

  echo "  + ${name} - Order #${orderNum} (\$${total})"
done

echo ""
echo "Import complete!"
```

### Step 5: Move Card to New Stage

```bash
CARD_ID="card-id-here"
NEW_STAGE="Shipped"
NEW_STAGE_ORDER=5
REASON="Tracking: 1Z999AA10123456784"

# 1. Get current card to know the old stage
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

OLD_STAGE=$(echo "$card" | jq -r '.items[0].data.stage')

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

# 3. Log the change to audit trail
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
      \"fromStage\": \"${OLD_STAGE}\",
      \"toStage\": \"${NEW_STAGE}\",
      \"movedBy\": \"User\",
      \"reason\": \"${REASON}\",
      \"timestamp\": \"${NOW}\"
    }
  }
}"

echo "Moved: ${OLD_STAGE} -> ${NEW_STAGE}"
echo "Reason: ${REASON}"
echo "Logged to audit trail"
```

### Step 6: View Card History (Audit Trail)

```bash
CARD_ID="card-id-here"

echo "======================================"
echo "  CARD HISTORY"
echo "======================================"
echo ""

history=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineAuditLog\", \"query\": {\"filter\": {\"cardId\": {\"\$eq\": \"${CARD_ID}\"}}, \"sort\": [{\"fieldName\": \"timestamp\", \"order\": \"ASC\"}], \"paging\": {\"limit\": 100}}}")

echo "$history" | jq -r '.items[] | "\(.data.timestamp | split("T")[0]) \(.data.timestamp | split("T")[1] | split(".")[0]) | \(.data.fromStage) -> \(.data.toStage) | By: \(.data.movedBy) | \(.data.reason)"'
```

### Step 7: Pipeline Summary Statistics

```bash
echo "======================================"
echo "  PIPELINE SUMMARY"
echo "======================================"
echo ""

# Use CMS aggregation for statistics
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
echo "$agg" | jq -r '.results | sort_by(.stageOrder) | .[] | {stage, count, totalValue} | "  \(.stage): \(.count) cards ($\(.totalValue // 0))"'

total_count=$(echo "$agg" | jq '[.results[].count] | add')
total_value=$(echo "$agg" | jq '[.results[].totalValue // 0] | add')
echo ""
echo "Total Cards: $total_count"
echo "Total Pipeline Value: \$$total_value"
```

### Step 8: Refund Order from Card

```bash
CARD_ID="card-id-here"
REASON="Customer request"

# 1. Get order ID from card
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

ORDER_ID=$(echo "$card" | jq -r '.items[0].data.orderId')
OLD_STAGE=$(echo "$card" | jq -r '.items[0].data.stage')
CONTACT_ID=$(echo "$card" | jq -r '.items[0].data.contactId')
OLD_NOTES=$(echo "$card" | jq -r '.items[0].data.notes // ""')

# 2. Check refundability
refund_check=$(curl -s -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"${ORDER_ID}\"}")

can_refund=$(echo "$refund_check" | jq -r '.refundable')
max_refund=$(echo "$refund_check" | jq -r '.maxRefundAmount')

echo "Refundable: ${can_refund} | Max: \$${max_refund}"

if [ "$can_refund" != "true" ]; then
  echo "Order cannot be refunded"
  exit 1
fi

# 3. Process the refund
curl -s -X POST "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}/refunds" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"refund\": {\"amount\": ${max_refund}, \"reason\": \"${REASON}\"}}"

# 4. Update card stage and add refund note
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
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
      \"notes\": \"${OLD_NOTES}\n[${NOW}] Refunded \$${max_refund} - ${REASON}\"
    }
  }
}"

# 5. Log to audit trail
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
      \"reason\": \"Refund \$${max_refund}: ${REASON}\",
      \"timestamp\": \"${NOW}\"
    }
  }
}"

echo "Refund processed: \$${max_refund}"
echo "Card moved: ${OLD_STAGE} -> Refunded"
```

### Step 9: Add Notes to Card

```bash
CARD_ID="card-id-here"
NOTE="Customer called - confirmed address change to 123 Main St"

# Get current notes and append
card=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"PipelineCards\", \"query\": {\"filter\": {\"_id\": {\"\$eq\": \"${CARD_ID}\"}}}}")

OLD_NOTES=$(echo "$card" | jq -r '.items[0].data.notes // ""')
NOW=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${CARD_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"dataCollectionId\": \"PipelineCards\",
  \"dataItem\": {
    \"_id\": \"${CARD_ID}\",
    \"data\": {
      \"notes\": \"${OLD_NOTES}\n[${NOW}] ${NOTE}\"
    }
  }
}"

echo "Note added to card"
```

### Step 10: Assign Card to Contact

```bash
CARD_ID="card-id-here"
CONTACT_EMAIL="customer@example.com"

# Find contact by email
contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": {\"info.emails.email\": {\"\$eq\": \"${CONTACT_EMAIL}\"}}, \"paging\": {\"limit\": 1}}}")

CONTACT_ID=$(echo "$contact" | jq -r '.contacts[0].id')
CONTACT_NAME=$(echo "$contact" | jq -r '"\(.contacts[0].info.name.first) \(.contacts[0].info.name.last)"')

# Update card with contact link
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

echo "Card assigned to: ${CONTACT_NAME} (${CONTACT_EMAIL})"
```

## Output Format

```
======================================
  PIPELINE KANBAN BOARD
======================================
Pipeline: Cart-to-Customer Pipeline

━━━ New Cart (2) ━━━
  Jane S. - Cart $89.99 [ID: card-001]
  Mike R. - Cart $245.00 [ID: card-002]

━━━ Checkout Started (1) ━━━
  Sarah L. - Cart $167.50 [ID: card-003]

━━━ Payment Pending (0) ━━━
  (empty)

━━━ Paid (5) ━━━
  John D. - Order #1234 ($289.50) [ID: card-004]
  Lisa M. - Order #1235 ($125.00) [ID: card-005]
  ...

━━━ Shipped (3) ━━━
  Tom K. - Order #1230 ($450.00) [ID: card-006]
  ...

━━━ Delivered (8) ━━━
  ...

━━━ Refunded (1) ━━━
  Amy W. - Order #1228 ($89.00) [ID: card-010]

Total Cards: 20
======================================
```

## Skills Referenced

- **pipeline-kanban**: Workflow/card CRUD, cart integration, audit trail, refunds
- **cms-data-management**: Audit log storage in CMS
- **order-management-advanced**: Order data, refundability checks, refund processing

## Example Use Cases

1. **View Board**: "Show me the pipeline kanban"
2. **Setup**: "Create a new cart-to-customer pipeline"
3. **Import**: "Populate pipeline from recent orders"
4. **Move**: "Move Order #1234 to Shipped with tracking 1Z999..."
5. **History**: "Show the history for card X"
6. **Stats**: "Pipeline summary - how many in each stage?"
7. **Custom Stages**: "Add a 'VIP Review' stage between Paid and Shipped"
8. **Abandoned**: "Show abandoned carts in the pipeline"
9. **Refund**: "Refund the order on card X" / "Can this order be refunded?"
10. **Notes**: "Add a note to card X: customer wants express shipping"
11. **Assign**: "Assign card X to customer john@example.com"

## Related Commands

- `/wix:orders` - Order management
- `/wix:events` - Event management
- `/wix:cms` - CMS data management
- `/wix:customers` - Customer insights
