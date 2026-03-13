# Email Labels - Contact Labeling for Targeted Campaigns

## Overview

Manage contact labels for email marketing when segments don't fit the criteria. Labels allow manual or programmatic tagging of contacts for campaign targeting.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Label Format

Labels in Wix use format: `custom.label-name`

**Examples**:
- `custom.itay-test1`
- `custom.high-value-customers`
- `custom.recent-buyers`
- `custom.vip-2024`

## Query Contacts with Filters

**Endpoint**: `POST https://www.wixapis.com/contacts/v4/contacts/query`

Query contacts based on criteria, then assign labels:

```bash
curl -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {},
    "paging": {
      "limit": 100,
      "offset": 0
    }
  }
}'
```

**Response**:
```json
{
  "contacts": [
    {
      "id": "contact-123",
      "emailAddress": "customer@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "labels": ["custom.vip", "custom.newsletter"]
    }
  ],
  "metadata": {
    "count": 100,
    "total": 523
  }
}
```

## Create Label and Assign Contacts

### Step 1: Query Orders to Find Target Contacts

Find contacts who meet USER'S criteria (spend amount and timeframe from user request):

```bash
# Get orders from last week
DAYS_AGO=7
START_DATE=$(date -u -v-${DAYS_AGO}d +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || date -u -d "${DAYS_AGO} days ago" +"%Y-%m-%dT00:00:00.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

# Aggregate by customer email, filter by spend
high_spenders=$(echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
  group_by(.email) |
  map({
    email: .[0].email,
    totalSpent: ([.[].total] | add)
  }) |
  map(select(.totalSpent >= 100)) |
  .[].email
')

echo "Found $(echo "$high_spenders" | wc -l) high spenders"
```

### Step 2: Get Contact IDs from Emails

```bash
contact_ids=()

echo "$high_spenders" | while read -r email; do
  contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"query\": {
      \"filter\": \"{\\\"emailAddress\\\": \\\"${email}\\\"}\"
    }
  }")

  contact_id=$(echo "$contact" | jq -r '.contacts[0].id // empty')
  if [ -n "$contact_id" ]; then
    echo "$contact_id"
  fi
done > /tmp/contact_ids.txt

contact_count=$(cat /tmp/contact_ids.txt | wc -l)
echo "✓ Found ${contact_count} contact IDs"
```

### Step 3: Assign Label to Contacts

```bash
LABEL_ID="custom.high-spenders-last-week"

echo "🏷️ Assigning label '${LABEL_ID}' to ${contact_count} contacts..."

assigned=0

cat /tmp/contact_ids.txt | while read -r contact_id; do
  # Update contact to add label
  curl -s -X PATCH "https://www.wixapis.com/contacts/v4/contacts/${contact_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "contact": {
      "info": {
        "labelKeys": {
          "add": ["'"${LABEL_ID}"'"]
        }
      }
    }
  }' > /dev/null

  assigned=$((assigned + 1))
  echo "  ✅ Contact ${assigned}/${contact_count}"
  sleep 0.1
done

echo "\n✅ Labeled ${assigned} contacts with '${LABEL_ID}'"
```

## Label Naming Best Practices

**Format**: `custom.descriptive-name`

**Good Examples**:
- `custom.vip-customers-2024`
- `custom.abandoned-cart-last-week`
- `custom.spent-{amount}-plus` (amount from user criteria)
- `custom.repeat-buyers`
- `custom.new-subscribers`

**Bad Examples**:
- `custom.label1`
- `custom.test`
- `custom.abc`

## Use Cases

### 1. Create "Recent Big Spenders" Label

Customers who spent ${USER_AMOUNT}+ in last ${USER_DAYS} days:

*Note: USER_AMOUNT and USER_DAYS come from user's request, not hardcoded!*

```bash
LABEL_ID="custom.recent-big-spenders"
MIN_SPEND=200
DAYS=14

# Query orders → filter by spend → get emails → get contact IDs → assign label
```

### 2. Create "Cart Abandoners" Label

Customers who added to cart but didn't purchase:

```bash
LABEL_ID="custom.cart-abandoners-feb"

# Query cart abandonment events
# Get contact IDs
# Assign label
```

### 3. Create "Product Category Buyers" Label

Customers who bought from specific category:

```bash
LABEL_ID="custom.electronics-buyers"
CATEGORY_ID="electronics-cat-id"

# Query orders with products from category
# Extract buyer emails
# Get contact IDs
# Assign label
```

## Remove Label from Contacts

```bash
CONTACT_ID="contact-123"
LABEL_TO_REMOVE="custom.old-label"

curl -X PATCH "https://www.wixapis.com/contacts/v4/contacts/${CONTACT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "contact": {
    "info": {
      "labelKeys": {
        "remove": ["'"${LABEL_TO_REMOVE}"'"]
      }
    }
  }
}'
```

## Best Practices

1. **Use segments when possible** - Dynamic and auto-updating
2. **Labels for one-time campaigns** - Specific, dated campaigns
3. **Descriptive names** - Include criteria and date
4. **Clean up old labels** - Remove after campaign sent
5. **Limit label count** - Too many labels = confusion
6. **Document criteria** - Record how label was created
