# Email Campaign Recipients - Campaign Audience Management

## Overview

Manage email campaign recipients by updating distribution options including segments, labels, contact IDs, and filters using the Wix Email Marketing API.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Update Campaign Recipients

**Endpoint**: `PATCH https://www.wixapis.com/marketing/v1/campaigns/{campaignId}`

Update who receives the campaign using segments, labels, or specific contacts.

```bash
CAMPAIGN_ID="b2c0d8d9-4864-41e1-8cb6-13df639a40be"

curl -X PATCH "https://www.wixapis.com/marketing/v1/campaigns/${CAMPAIGN_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "campaignId": "'"${CAMPAIGN_ID}"'",
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "contactIds": [],
    "labelIds": ["custom.high-value-customers"],
    "segmentIds": ["b7755068-85a6-4113-a5db-0b2727b0b852"],
    "contactsFilter": null,
    "emailSubject": "Exclusive offer for our VIP customers",
    "sendAt": null
  }
}'
```

## Distribution Options

### Option 1: Use Segment (Recommended)

**When to use**: Segment already exists with desired criteria

```json
{
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "segmentIds": ["segment-id-here"],
    "labelIds": [],
    "contactIds": [],
    "contactsFilter": null
  }
}
```

**Benefits**:
- Dynamic (auto-updates as contacts match criteria)
- No manual contact selection
- Reusable across campaigns

### Option 2: Use Labels

**When to use**: No matching segment exists, specific one-time audience

```json
{
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "labelIds": ["custom.recent-big-spenders", "custom.vip-2024"],
    "segmentIds": [],
    "contactIds": [],
    "contactsFilter": null
  }
}
```

**Benefits**:
- Flexible targeting
- Can combine multiple labels
- Good for campaign-specific audiences

### Option 3: Specific Contact IDs

**When to use**: Small, specific list (manual selection)

```json
{
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "contactIds": [
      "contact-id-1",
      "contact-id-2",
      "contact-id-3"
    ],
    "segmentIds": [],
    "labelIds": [],
    "contactsFilter": null
  }
}
```

**Use cases**:
- VIP-only announcements
- Beta testers
- Personal invitations

### Option 4: Contacts Filter (Advanced)

**When to use**: Complex criteria not covered by segments

```json
{
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "contactsFilter": {
      "totalSpent": {"$gte": 500},
      "lastPurchaseDate": {"$gte": "2024-01-01"},
      "location.country": "US"
    },
    "segmentIds": [],
    "labelIds": [],
    "contactIds": []
  }
}
```

## Complete Workflow: Send Campaign to High-Value Customers

### Step 1: Check for Existing Segment

```bash
echo "🔍 Searching for high-value customer segment..."

segments=$(curl -s -X GET "https://www.wixapis.com/_api/contacts-segments-app/v1/segments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

vip_segment=$(echo "$segments" | jq -r '.segments[] | select(
  (.name | test("vip|high value|premium"; "i")) or
  (.filters.totalSpent."$gte" // 0) >= 500
) | {id, name, contactCount}')

if [ -n "$vip_segment" ]; then
  echo "✅ Found existing segment:"
  echo "$vip_segment"
  SEGMENT_ID=$(echo "$vip_segment" | jq -r '.id')
  USE_SEGMENT=true
else
  echo "⚠️ No matching segment found. Will create label."
  USE_SEGMENT=false
fi
```

### Step 2a: If Segment Exists - Use It

```bash
if [ "$USE_SEGMENT" = "true" ]; then
  CAMPAIGN_ID="campaign-id-here"

  curl -s -X PATCH "https://www.wixapis.com/marketing/v1/campaigns/${CAMPAIGN_ID}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"campaignId\": \"${CAMPAIGN_ID}\",
    \"emailDistributionOptions\": {
      \"activeContactsOnly\": true,
      \"segmentIds\": [\"${SEGMENT_ID}\"],
      \"labelIds\": [],
      \"contactIds\": []
    }
  }"

  echo "✅ Campaign updated to use segment"
fi
```

### Step 2b: If No Segment - Create Label

```bash
if [ "$USE_SEGMENT" = "false" ]; then
  LABEL_ID="custom.high-value-customers-$(date +%Y%m%d)"

  echo "🏷️ Creating label: ${LABEL_ID}"

  # Get high-value customers from orders
  orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "paging": {"limit": 1000}}}')

  # Aggregate by email, filter $500+
  high_value_emails=$(echo "$orders" | jq -r '
    [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
    group_by(.email) |
    map({email: .[0].email, totalSpent: ([.[].total] | add)}) |
    map(select(.totalSpent >= 500)) |
    .[].email
  ')

  # Get contact IDs and assign label
  echo "$high_value_emails" | while read -r email; do
    contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
      -H "Authorization: ${API_KEY}" \
      -H "wix-site-id: ${SITE_ID}" \
      -H "Content-Type: application/json" \
      -d "{\"query\": {\"filter\": \"{\\\"emailAddress\\\": \\\"${email}\\\"}\"}}") contact_id=$(echo "$contact" | jq -r '.contacts[0].id // empty')

    if [ -n "$contact_id" ]; then
      curl -s -X PATCH "https://www.wixapis.com/contacts/v4/contacts/${contact_id}" \
        -H "Authorization: ${API_KEY}" \
        -H "wix-site-id: ${SITE_ID}" \
        -H "Content-Type: application/json" \
        -d "{\"contact\": {\"info\": {\"labelKeys\": {\"add\": [\"${LABEL_ID}\"]}}}}" > /dev/null
      echo "  ✅ Labeled: ${email}"
    fi
    sleep 0.1
  done

  # Update campaign to use label
  curl -s -X PATCH "https://www.wixapis.com/marketing/v1/campaigns/${CAMPAIGN_ID}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"campaignId\": \"${CAMPAIGN_ID}\",
    \"emailDistributionOptions\": {
      \"activeContactsOnly\": true,
      \"labelIds\": [\"${LABEL_ID}\"],
      \"segmentIds\": [],
      \"contactIds\": []
    }
  }"

  echo "✅ Campaign updated to use label"
fi
```

## Payload Structure Reference

```json
{
  "campaignId": "campaign-uuid",
  "emailDistributionOptions": {
    // Only send to active (not unsubscribed) contacts
    "activeContactsOnly": true,

    // Specific contact IDs (manual selection)
    "contactIds": ["contact-1", "contact-2"],

    // Label IDs (must start with "custom.")
    "labelIds": ["custom.label-name"],

    // Segment IDs (from segments API)
    "segmentIds": ["segment-uuid"],

    // Advanced filter (alternative to segments)
    "contactsFilter": {
      "field": {"$operator": "value"}
    },

    // Email subject line
    "emailSubject": "Your campaign subject",

    // Send immediately (null) or schedule (ISO date)
    "sendAt": null
  }
}
```

## Combining Options

You can combine segments + labels + contactIds:

```json
{
  "emailDistributionOptions": {
    "activeContactsOnly": true,
    "segmentIds": ["vip-segment"],
    "labelIds": ["custom.recent-buyers"],
    "contactIds": ["special-contact-1"],
    "emailSubject": "VIP + Recent Buyers + Special Contacts"
  }
}
```

**Behavior**: Sends to union (OR) of all three groups

## Schedule Campaign

Set `sendAt` to schedule for later:

```json
{
  "emailDistributionOptions": {
    "sendAt": "2024-03-15T10:00:00.000Z",
    "emailSubject": "Scheduled for March 15 at 10 AM UTC"
  }
}
```

## Best Practices

1. **Priority order**:
   - ✅ First: Check existing segments
   - ✅ Second: Create label if needed
   - ❌ Last resort: Manual contact IDs
2. **Always use `activeContactsOnly: true`** - Respect unsubscribes
3. **Test with small label first** - Verify targeting before full send
4. **Use descriptive labels** - Include date and criteria
5. **Clean up labels** - Remove after campaign sent
6. **Monitor deliverability** - Check bounce rates

## Example Targeting Scenarios

| User Request | Solution | Implementation |
|--------------|----------|----------------|
| "Customers who spent $100+ last month" | Check segment → Create label if needed | Filter orders, assign label |
| "Newsletter subscribers" | Use existing segment | Segment ID in payload |
| "Bought from Electronics category" | Create label | Filter by category, assign label |
| "VIP customers in California" | Combine segment + filter | Use contactsFilter |
| "Abandoned cart last 7 days" | Create label | Query carts, assign label |
