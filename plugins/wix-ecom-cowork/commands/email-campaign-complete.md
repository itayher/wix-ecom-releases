# Email Campaign Complete - Full Campaign Setup & Targeting

Complete email campaign workflow: AI-powered discount recommendations, smart audience targeting with segments/labels, automatic coupon creation, email content generation, and campaign recipient assignment. Does EVERYTHING except creating the email design in Wix.

## 🚨🚨🚨 BLOCKING REQUIREMENTS 🚨🚨🚨

**BEFORE doing ANYTHING else, you MUST**:

### Requirement 1: Call Recommendations API FIRST

```bash
# THIS IS THE FIRST LINE OF CODE YOU EXECUTE - NO EXCEPTIONS!
recommendations=$(curl -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"context": {"storeAnalytics": true}}')
```

**Then and only then** can you proceed with:
- Audience targeting
- Email content
- Campaign updates

### Requirement 2: Extract Discount from API Response

```bash
DISCOUNT_AMOUNT=$(echo "$recommendations" | jq -r '.recommendations[0].discountAmount')
```

**NOT from**:
- ❌ Your own analysis
- ❌ Product price analysis
- ❌ "Based on" anything you calculated
- ❌ "I recommend X%"

### Requirement 3: NEVER Suggest Manual Percentages

**If you find yourself typing**:
- "10% off"
- "15% off"
- "$20 off $150+"
- "LOYAL10"
- "MADKATZ20"

**STOP IMMEDIATELY and ask**: Did this come from /build API response?
- If NO → Delete it and call API!
- If YES → Proceed

### Other Rules:

4. **Spend Thresholds**: From USER'S request (e.g., "customers who spent $X+")
5. **Time Periods**: From USER'S intent (e.g., "last week", "last month")
6. **Audience Size**: Calculated from actual data, not guessed

## Command Pattern

```
Help me create a thank-you email campaign for VIP customers with a discount
Set up a campaign for customers who bought Electronics last month
Create campaign targeting high-value customers with AI-recommended discount
Send promotional email to recent buyers
Build a cross-sell campaign for loyal subscribers
```

## Purpose

Complete end-to-end email campaign setup:
1. **Get AI discount recommendation** from Wix (data-driven, not guesswork)
2. **Create the coupon** automatically
3. **Find or create audience** (segments priority 1, labels priority 2)
4. **Generate email content** (subject lines, body, personalization)
5. **Update campaign** with segments/labels and coupon
6. **Provide send tips** (timing, testing, follow-up)

**User only needs to**: Create email design in Wix and click Send!

## Skills Referenced

- **smart-discount-recommendations**: AI-powered discount suggestions from Wix
- **email-segments**: Segment querying and matching
- **email-labels**: Custom label creation
- **email-campaign-recipients**: Campaign audience assignment
- **discount-strategy**: Coupon creation
- **order-analytics**: Customer behavior analysis
- **wix-api-core**: Authentication

## Complete Workflow

### STEP 1: Get AI Discount Recommendation

**CRITICAL**: Always get recommendation from Wix AI, never manually suggest!

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

echo "🤖 Getting AI-powered discount recommendations..."

recommendations=$(curl -s -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "context": {
    "storeAnalytics": true,
    "inventoryData": true,
    "customerBehavior": true
  }
}')

echo "$recommendations" | jq -r '.recommendations[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 \(.type)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Discount:   \(.discountAmount)% off
Target:     \(.targetCategory // "All products")
Duration:   \(.dateRange.start) to \(.dateRange.end)
Expected:   $\(.expectedImpact.revenueIncrease // 0) revenue
Confidence: \((.confidence * 100) | round)% ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"'

echo ""
echo "Which recommendation would you like to use? (Enter ID or number)"
```

### STEP 2: Create Coupon from Recommendation

```bash
# User selects recommendation
SELECTED_REC=$(echo "$recommendations" | jq '.recommendations[0]')  # or user's choice

DISCOUNT_AMOUNT=$(echo "$SELECTED_REC" | jq -r '.discountAmount')
DISCOUNT_TYPE=$(echo "$SELECTED_REC" | jq -r '.discountType')
DATE_START=$(echo "$SELECTED_REC" | jq -r '.dateRange.start')
DATE_END=$(echo "$SELECTED_REC" | jq -r '.dateRange.end')
REC_TYPE=$(echo "$SELECTED_REC" | jq -r '.type')
INSPECTION_ID=$(echo "$SELECTED_REC" | jq -r '.inspection_id')

# Generate coupon code
COUPON_CODE="THANKYOU${DISCOUNT_AMOUNT}"  # or user-specified

echo "💰 Creating coupon: ${COUPON_CODE} for ${DISCOUNT_AMOUNT}% off..."

coupon_response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/discount-rules" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"discountRule\": {
    \"name\": \"AI Recommended: ${REC_TYPE}\",
    \"trigger\": {
      \"couponCode\": \"${COUPON_CODE}\"
    },
    \"discount\": {
      \"percentage\": ${DISCOUNT_AMOUNT},
      \"type\": \"${DISCOUNT_TYPE}\"
    },
    \"active\": true,
    \"validFrom\": \"${DATE_START}T00:00:00.000Z\",
    \"validUntil\": \"${DATE_END}T23:59:59.999Z\"
  }
}")

COUPON_ID=$(echo "$coupon_response" | jq -r '.discountRule.id')
echo "✅ Coupon created: ${COUPON_CODE}"
echo "   Valid: ${DATE_START} to ${DATE_END}"

# Confirm with /build
curl -s -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}' > /dev/null
```

### STEP 3: Find or Create Audience

**Priority 1: Search Existing Segments**

```bash
echo ""
echo "👥 Finding target audience: VIP customers..."

segments=$(curl -s -X POST "https://www.wixapis.com/_api/contacts-segments-app/v1/segments/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

# AI matches user criteria to segments
matching_segment=$(echo "$segments" | jq -r '.segments[] | select(
  (.name | test("vip|high value|loyal|subscriber|active"; "i"))
) | {id, name, contactCount}' | head -1)

if [ -n "$matching_segment" ]; then
  SEGMENT_ID=$(echo "$matching_segment" | jq -r '.id')
  SEGMENT_NAME=$(echo "$matching_segment" | jq -r '.name')
  AUDIENCE_SIZE=$(echo "$matching_segment" | jq -r '.contactCount')

  echo "✅ Found segment: ${SEGMENT_NAME} (${AUDIENCE_SIZE} contacts)"
  USE_METHOD="segment"
  AUDIENCE_ID=$SEGMENT_ID
else
  echo "⚠️ No matching segment - will create label"
  USE_METHOD="label"
fi
```

**Priority 2: Create Label (if no segment)**

```bash
if [ "$USE_METHOD" = "label" ]; then
  LABEL_ID="custom.campaign-vip-$(date +%Y%m%d)"

  echo "🏷️ Creating label: ${LABEL_ID}"

  # Query orders to find VIP customers (e.g., $500+ lifetime spend)
  orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "paging": {"limit": 1000}}}')

  vip_emails=$(echo "$orders" | jq -r '
    [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
    group_by(.email) |
    map({email: .[0].email, spent: ([.[].total] | add)}) |
    map(select(.spent >= 500)) |
    .[].email
  ')

  vip_count=$(echo "$vip_emails" | wc -l | tr -d ' ')
  echo "✓ Found ${vip_count} VIP customers"

  # Assign label
  echo "$vip_emails" | while read -r email; do
    contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
      -H "Authorization: ${API_KEY}" \
      -H "wix-site-id: ${SITE_ID}" \
      -H "Content-Type: application/json" \
      -d "{\"query\": {\"filter\": \"{\\\"emailAddress\\\": \\\"${email}\\\"}\"}}"}    )

    contact_id=$(echo "$contact" | jq -r '.contacts[0].id // empty')
    if [ -n "$contact_id" ]; then
      curl -s -X PATCH "https://www.wixapis.com/contacts/v4/contacts/${contact_id}" \
        -H "Authorization: ${API_KEY}" \
        -H "wix-site-id: ${SITE_ID}" \
        -H "Content-Type: application/json" \
        -d "{\"contact\": {\"info\": {\"labelKeys\": {\"add\": [\"${LABEL_ID}\"]}}}}" > /dev/null
    fi
    sleep 0.1
  done

  AUDIENCE_SIZE=$vip_count
  AUDIENCE_ID=$LABEL_ID
  echo "✅ Labeled ${vip_count} contacts"
fi
```

### STEP 4: Calculate Audience Size

```bash
echo ""
echo "📊 Calculating campaign reach..."

if [ "$USE_METHOD" = "segment" ]; then
  audience=$(curl -s -X POST "https://www.wixapis.com/_api/shoutout/v1/contacts/audience/size" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"segmentIds\": [\"${SEGMENT_ID}\"],
    \"activeContactsOnly\": true
  }")

  active_audience=$(echo "$audience" | jq -r '.audienceSize')
  echo "✅ Active contacts: ${active_audience}"
fi
```

### STEP 5: Generate Email Content

```bash
echo ""
echo "✉️ Generating email content..."

# AI generates based on:
# - Campaign type (thank you, promo, cross-sell)
# - Discount (from recommendation)
# - Audience (VIP, new customers, etc.)

cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 SUGGESTED EMAIL CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject Lines (pick one):
1. "You're the reason we do this 💙"
2. "A thank-you from us (+ ${DISCOUNT_AMOUNT}% off inside)"
3. "For our VIP customers — exclusive ${DISCOUNT_AMOUNT}% discount"

Preview Text:
"We wanted to say thank you with an exclusive ${DISCOUNT_AMOUNT}% discount..."

Email Body:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi [First Name],

We wanted to take a moment to say thank you. You're not just
a customer — you're the reason we do what we do.

As a thank-you, here's an exclusive ${DISCOUNT_AMOUNT}% discount:

🎁 Use code: ${COUPON_CODE}
Valid until: ${DATE_END}

[Shop Now Button]

With gratitude,
[Your Store Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Coupon Code: ${COUPON_CODE}
Discount: ${DISCOUNT_AMOUNT}% off
Expires: ${DATE_END}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
```

### STEP 6: Update Campaign Recipients

```bash
echo ""
echo "🎯 Updating campaign recipients..."

# List user's campaigns
campaigns=$(curl -s -X GET "https://www.wixapis.com/_api/shoutout/v1/campaigns" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "Your campaigns:"
echo "$campaigns" | jq -r '.campaigns[] | "\(.id): \(.name)"'

echo ""
echo "Which campaign should I update? (Enter campaign ID or create new)"

# User provides campaign ID
CAMPAIGN_ID="user-selected-campaign-id"

# Update campaign
if [ "$USE_METHOD" = "segment" ]; then
  distribution_options="{
    \"activeContactsOnly\": true,
    \"segmentIds\": [\"${SEGMENT_ID}\"],
    \"labelIds\": [],
    \"contactIds\": []
  }"
else
  distribution_options="{
    \"activeContactsOnly\": true,
    \"labelIds\": [\"${LABEL_ID}\"],
    \"segmentIds\": [],
    \"contactIds\": []
  }"
fi

curl -s -X PATCH "https://www.wixapis.com/marketing/v1/campaigns/${CAMPAIGN_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"campaignId\": \"${CAMPAIGN_ID}\",
  \"emailDistributionOptions\": ${distribution_options}
}" | jq '{
  campaignId,
  audience: "'"${AUDIENCE_SIZE}"' contacts",
  method: "'"${USE_METHOD}"'",
  message: "✅ Campaign updated"
}'
```

### STEP 7: Final Summary & Tips

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CAMPAIGN SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "   Coupon:     ${COUPON_CODE} (${DISCOUNT_AMOUNT}% off)"
echo "   Valid:      ${DATE_START} to ${DATE_END}"
echo "   Audience:   ${AUDIENCE_SIZE} contacts"
echo "   Method:     $([ "$USE_METHOD" = "segment" ] && echo "Segment: ${SEGMENT_NAME}" || echo "Label: ${LABEL_ID}")"
echo "   Campaign:   ${CAMPAIGN_ID}"
echo ""
echo "📧 Next Steps in Wix Dashboard:"
echo "   1. Go to Email Marketing"
echo "   2. Open your campaign"
echo "   3. Add the email content (subject, body provided above)"
echo "   4. Include coupon code: ${COUPON_CODE}"
echo "   5. Preview and test send"
echo "   6. Schedule or send now"
echo ""
echo "💡 Best Practices:"
echo "   • Test send to yourself first"
echo "   • Send Tue-Thu, 9-11am or 5-7pm for best open rates"
echo "   • Personalize with [First Name] if available"
echo "   • Set up reminder email 3 days before expiry"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Complete Example: Thank-You Campaign

**User Request**: "Help me create a thank-you campaign for VIP customers with a discount"

**Full Execution**:

```
🤖 Getting AI discount recommendations...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Customer Appreciation Sale (AI RECOMMENDED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Discount:   ${DISCOUNT_AMOUNT}% off (from Wix AI)
Target:     VIP customers
Duration:   ${DATE_START} - ${DATE_END}
Expected:   $${EXPECTED_REVENUE} revenue
Confidence: ${CONFIDENCE}% ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this AI recommendation? (yes/no)

[User: yes]

💰 Creating coupon: ${COUPON_CODE} for ${DISCOUNT_AMOUNT}% off...
✅ Coupon created (discount from Wix AI, not manually set)
   Valid: ${DATE_START} - ${DATE_END}

👥 Finding VIP customers...
✅ Found segment: "High Value Customers" (145 contacts)

📊 Calculating campaign reach...
✅ Active contacts: 142 (3 unsubscribed)

✉️ Generating email content...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 SUGGESTED EMAIL CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: You're the reason we do this 💙

Preview: We wanted to say thank you with an exclusive 15% discount...

Body:
Hi [First Name],

We wanted to take a moment to step back and simply say — thank you.

You're not just a customer. You're the reason we show up every day
and pour our heart into what we do.

As a thank-you, here's an exclusive 15% discount:

🎁 Use code: THANKYOU15 at checkout
   Valid for 14 days — expires March 15

[Shop Now]

With gratitude,
[Your Store Name]

Unsubscribe | View in browser
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your campaigns:
1. b2c0d8d9-4864-41e1-8cb6-13df639a40be: Spring Sale 2024
2. 23f923e4-3da5-47c1-adb4-9d5171bbcf4c: Weekly Newsletter

Which campaign? (Enter number or ID)

[User: 1]

🎯 Updating campaign recipients...
✅ Campaign updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CAMPAIGN READY!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Coupon:     THANKYOU15 (15% off) ✅
Audience:   142 VIP contacts ✅
Campaign:   Spring Sale 2024 ✅
Content:    Subject + body provided above

📧 Next: Go to Wix Email Marketing Dashboard
   1. Open "Spring Sale 2024" campaign
   2. Paste email content (provided above)
   3. Add [THANKYOU15] coupon code in email
   4. Preview → Test Send → Schedule!

💡 Best send time: Tuesday or Wednesday, 10am
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Email Content Templates

### Thank You + Cross-Sell

```
Subject: You're the reason we do this 💙
Discount: ${AI_DISCOUNT}% off (from Wix AI)
Audience: Active subscribers
Products: Recommend 3 related items
CTA: Shop now with discount
```

### VIP Exclusive

```
Subject: Something special for our VIP customers
Discount: ${AI_DISCOUNT}% off (from Wix AI)
Audience: High-value segment ($500+ spend)
Products: Premium/new items
CTA: Exclusive access
```

### Win-Back Dormant

```
Subject: We miss you! Here's ${AI_DISCOUNT}% off to come back
Discount: ${AI_DISCOUNT}% (from Wix AI recommendations)
Audience: Label "no-purchase-90-days"
Products: Bestsellers
CTA: Welcome back offer
```

### Category Promotion

```
Subject: New arrivals in [Category] + ${AI_DISCOUNT}% off
Discount: ${AI_DISCOUNT}% (from Wix AI)
Audience: Label "[category]-buyers"
Products: Category items
CTA: Shop new items
```

## Audience Targeting Examples

| User Request | Segment/Label Solution | Implementation |
|--------------|------------------------|----------------|
| "VIP customers" | Segment: "High Value Customers" | Existing segment |
| "Recent buyers" | Label: "custom.buyers-last-30d" | From order data |
| "Electronics shoppers" | Label: "custom.electronics-buyers" | From category purchases |
| "Newsletter subscribers" | Segment: "Active Subscribers" | Existing segment |
| "Abandoned carts" | Label: "custom.cart-abandoners" | From cart data |
| "California customers" | Segment: "Location: California" | Location segment |

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EMAIL CAMPAIGN SETUP COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Discount (AI Recommended):
   Code:       THANKYOU15
   Amount:     15% off
   Valid:      Mar 1 - Mar 15 (14 days)
   Type:       Customer Appreciation
   Status:     ✅ Created

👥 Audience:
   Method:     Segment "High Value Customers"
   Size:       142 active contacts
   Targeting:  VIP customers ($500+ lifetime)
   Status:     ✅ Assigned to campaign

📧 Campaign:
   ID:         b2c0d8d9-4864-41e1-8cb6-13df639a40be
   Name:       Spring Sale 2024
   Recipients: ✅ Updated
   Status:     Ready for email content

📝 Email Content:
   Subject:    "You're the reason we do this 💙"
   Body:       [Provided above - copy to Wix]
   Coupon:     Include THANKYOU15 in email

🎯 Next Steps:
   1. Open Wix Email Marketing Dashboard
   2. Go to "Spring Sale 2024" campaign
   3. Paste email content (subject + body above)
   4. Preview and test send
   5. Send Tuesday 10am for best results

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Everything is ready except the email design in Wix!
```

## Related Commands

- `/wix:customers` - Customer segmentation
- `/wix:analytics` - Customer behavior
- `/wix:create-performance-category` - Similar targeting logic
- `/wix:discount-manager` - Coupon management
## ⚠️ CRITICAL: Discount Amounts

**NEVER manually suggest discount percentages\!**

✅ **Always use**: `POST https://manage.wix.com/recommendations/v1/recommendations/build`
✅ **Extract discount**: `$(echo "$recommendations" | jq -r '.recommendations[0].discountAmount')`
❌ **Never hardcode**: "15%", "20%", "25%" - these are data-driven from Wix AI\!
