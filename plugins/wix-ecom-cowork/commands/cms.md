# CMS - Data Collections Management

Query, create, update, and manage Wix CMS data collections and items. Supports custom collections like TonyRobbinsTickets.

## Command Pattern

```
Show me all CMS collections
List items in [collection name]
Query TonyRobbinsTickets
Add a new item to [collection]
Update [item] in [collection]
Show collection schema for [collection]
How many items in [collection]?
Filter [collection] where [field] = [value]
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

console.error(\`Querying CMS for: \${getActiveSiteName()}\`);
"
```

### Step 2: List All Collections

Use the **cms-data-management** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   CMS DATA COLLECTIONS"
echo "======================================"
echo ""

collections=$(curl -s -X GET "https://www.wixapis.com/wix-data/v2/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$collections" | jq -r '.collections[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection: \(.displayName)
ID: \(.id)
Fields: \(.fields | length)
Read: \(.permissions.read)
Write: \(.permissions.write)
"'
```

### Step 3: Get Collection Schema

```bash
COLLECTION_ID="TonyRobbinsTickets"

echo "======================================"
echo "   COLLECTION SCHEMA: ${COLLECTION_ID}"
echo "======================================"
echo ""

schema=$(curl -s -X GET "https://www.wixapis.com/wix-data/v2/collections/${COLLECTION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$schema" | jq -r '.collection.fields[] | "  \(.key) (\(.type)): \(.displayName)"'
```

### Step 4: Query Collection Items

```bash
COLLECTION_ID="TonyRobbinsTickets"

echo "======================================"
echo "   ITEMS: ${COLLECTION_ID}"
echo "======================================"
echo ""

items=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"${COLLECTION_ID}\", \"query\": {\"paging\": {\"limit\": 50}, \"sort\": [{\"fieldName\": \"_createdDate\", \"order\": \"DESC\"}]}}")

total=$(echo "$items" | jq '.totalCount // (.items | length)')
echo "Total items: $total"
echo ""

echo "$items" | jq '.items[]'
```

### Step 5: Filter Items

```bash
COLLECTION_ID="TonyRobbinsTickets"
FIELD="ticketType"
VALUE="VIP"

filtered=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"${COLLECTION_ID}\", \"query\": {\"filter\": {\"${FIELD}\": {\"\$eq\": \"${VALUE}\"}}, \"paging\": {\"limit\": 50}}}")

echo "$filtered" | jq '.items[] | {_id, title, ticketType, price, status}'
```

### Step 6: Add Item

```bash
COLLECTION_ID="TonyRobbinsTickets"

result=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "'"${COLLECTION_ID}"'",
  "dataItem": {
    "data": {
      "title": "New Ticket Tier",
      "ticketType": "Premium",
      "price": 499,
      "status": "Available"
    }
  }
}')

echo "$result" | jq '.dataItem._id'
echo "Item created successfully"
```

### Step 7: Update Item

```bash
COLLECTION_ID="TonyRobbinsTickets"
ITEM_ID="item-id-here"

curl -s -X PUT "https://www.wixapis.com/wix-data/v2/items/${ITEM_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "'"${COLLECTION_ID}"'",
  "dataItem": {
    "_id": "'"${ITEM_ID}"'",
    "data": {
      "status": "Sold Out",
      "seatsRemaining": 0
    }
  }
}'

echo "Item updated successfully"
```

### Step 8: Collection Statistics

```bash
COLLECTION_ID="TonyRobbinsTickets"

count=$(curl -s -X POST "https://www.wixapis.com/wix-data/v2/items/count" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"dataCollectionId\": \"${COLLECTION_ID}\"}")

echo "Total items in ${COLLECTION_ID}: $(echo $count | jq '.totalCount')"
```

## Output Format

```
======================================
   CMS DATA COLLECTIONS
======================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection: Tony Robbins Tickets
ID: TonyRobbinsTickets
Fields: 8
Read: ANYONE
Write: ADMIN
```

## Skills Referenced

- **cms-data-management**: Full CMS CRUD operations, filtering, aggregation
- **events-management**: Cross-reference with events data

## Example Use Cases

1. **Browse Collections**: "Show me all CMS collections"
2. **View Data**: "List items in TonyRobbinsTickets"
3. **Filter**: "Show VIP tickets that are still available"
4. **Create**: "Add a new premium ticket tier"
5. **Update**: "Mark ticket X as sold out"
6. **Aggregate**: "How many available tickets by type?"

## Related Commands

- `/wix:events` - Event management
- `/wix:pipeline` - Pipeline kanban view
- `/wix:analytics` - Business analytics
