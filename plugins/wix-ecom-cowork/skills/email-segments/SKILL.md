# Email Segments - Contact Segmentation for Campaigns

## Overview

Manage contact segments for email marketing campaigns using the Wix Contacts Segments API. Segments allow dynamic filtering of contacts based on criteria like purchase history, engagement, location, and more.

**IMPORTANT**: All filtering criteria (spend amounts, dates, etc.) should match USER'S intent, not hardcoded values!

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Get All Segments

**Endpoint**: `GET https://www.wixapis.com/_api/contacts-segments-app/v1/segments`

```bash
curl -X GET "https://www.wixapis.com/_api/contacts-segments-app/v1/segments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "segments": [
    {
      "id": "b7755068-85a6-4113-a5db-0b2727b0b852",
      "name": "High Value Customers",
      "description": "Customers who spent $500+",
      "contactCount": 145,
      "type": "DYNAMIC",
      "filters": {
        "totalSpent": {"$gte": 500}
      }
    },
    {
      "id": "segment-456",
      "name": "Newsletter Subscribers",
      "contactCount": 892,
      "type": "STATIC"
    }
  ]
}
```

## Common Segments

### By Purchase Behavior

**High Value Customers**:
- Total spent > ${USER_DEFINED_AMOUNT} (e.g., what user considers "high value")
- Multiple purchases
- Recent purchase activity

*Note: Actual spend threshold should match user's business model*

**New Customers**:
- First purchase in last 30 days
- Single purchase only

**Repeat Customers**:
- 2+ purchases
- Purchase frequency < 90 days

**Dormant Customers**:
- Last purchase > 180 days
- Previously active

### By Engagement

**Newsletter Subscribers**:
- Opted in to marketing
- Email engagement > 20%

**Active Readers**:
- Email open rate > 40%
- Click-through rate > 5%

**Unengaged**:
- No email opens in 90 days
- Should be re-engaged or removed

### By Demographics

**By Location**:
- Country: US, Canada, UK, etc.
- State/Region
- City

**By Product Interest**:
- Purchased from specific category
- Viewed certain products
- Added to cart but didn't buy

## Find Matching Segment

When user requests a campaign to specific audience, search for matching segment:

```bash
echo "🔍 Finding matching segment for: High-value customers who bought recently"

segments=$(curl -s -X GET "https://www.wixapis.com/_api/contacts-segments-app/v1/segments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

# Search by name/description (AI matching)
echo "$segments" | jq '[.segments[] | select(
  (.name | test("high value|vip|premium|big spender"; "i")) or
  (.description | test("spent.*500|high.*spend|premium"; "i"))
)] | {
  matchedSegments: [.[] | {id, name, contactCount}],
  recommendation: (if length > 0 then "✅ Use existing segment" else "⚠️ Create new segment or label" end)
}'
```

## Segment Filter Criteria

**Available Filters**:
- `totalSpent` - Total customer lifetime value
- `orderCount` - Number of orders
- `lastPurchaseDate` - Date of last purchase
- `firstPurchaseDate` - Date of first purchase
- `emailStatus` - Subscribed, unsubscribed, bounced
- `location` - Country, state, city
- `tags` - Custom contact tags
- `customFields` - Custom contact data

**Operators**:
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$eq` - Equals
- `$in` - In array
- `$and` - Logical AND
- `$or` - Logical OR

## Use Cases

### 1. Find VIP Customer Segment

```bash
segments=$(curl -s -X GET "https://www.wixapis.com/_api/contacts-segments-app/v1/segments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

# USER_SPEND_THRESHOLD should match user's request (not hardcoded!)
USER_SPEND_THRESHOLD=${USER_SPEND_THRESHOLD:-100}  # Default, adjust to user intent

vip_segment=$(echo "$segments" | jq -r --arg threshold "$USER_SPEND_THRESHOLD" '.segments[] | select(
  (.filters.totalSpent."$gte" // 0) >= ($threshold | tonumber) or
  (.name | test("vip|premium|high value"; "i"))
) | {id, name, contactCount}')

echo "$vip_segment"
```

### 2. Get Segment Contact Count

```bash
SEGMENT_ID="b7755068-85a6-4113-a5db-0b2727b0b852"

segments=$(curl -s -X GET "https://www.wixapis.com/_api/contacts-segments-app/v1/segments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$segments" | jq --arg id "$SEGMENT_ID" '.segments[] | select(.id == $id) | {
  segmentName: .name,
  contactCount: .contactCount,
  type: .type,
  message: "This segment has \(.contactCount) contacts"
}'
```

## AI Segment Matching

When user says: "Send campaign to customers who bought in last 30 days"

**AI Analysis**:
```
User intent: Recent customers
Criteria: Purchase in last 30 days

Searching segments for matches:
1. "Recent Buyers" → 85% match ✅
2. "New Customers" → 75% match
3. "Active Shoppers" → 60% match

Recommendation: Use segment "Recent Buyers" (id: abc-123)
Contact count: 234
```

## Best Practices

1. **Check existing segments first** - Don't create duplicates
2. **Use descriptive names** - "High Value ($500+)" better than "Segment 1"
3. **Monitor segment size** - Too small (<10) may not be useful
4. **Update dynamic segments** - Filters update automatically
5. **Test before sending** - Review contact count before campaign
