# Create Campaign - AI-Powered Discount Recommendations

## Triggers

Use this command when user says anything like:
- "I have a problem with my sales"
- "I need recommendations for discounts"
- "Help me make more money"
- "Recommend a coupon"
- "Create a campaign"
- "Suggest a promotion"
- "I want to boost sales"

## CRITICAL RULE

**When user asks for discount recommendations: call the Wix AI `/build` API. That is the ONLY action.**

Do NOT:
- ❌ Query orders, products, analytics, or customers
- ❌ Calculate or suggest any percentages yourself
- ❌ Analyze store data to invent recommendations
- ❌ Suggest "10% off", "15% off", "$20 off" from your own reasoning
- ❌ Call any API other than `/build` before showing recommendations

## Workflow

### Step 1 — Call Wix AI Recommendations API (first and only action)

```bash
curl -s -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Show the response to the user as-is. The API returns data-driven recommendations — do not modify or supplement them.

### Step 2 — User selects a recommendation

Ask: "Which recommendation would you like to activate? I can create the coupon now."

### Step 3 — Create coupon from API response values

Extract from the selected recommendation and create the coupon:

```bash
# Values come from the API response — never hardcoded
DISCOUNT_AMOUNT=$(echo "$SELECTED_REC" | jq -r '.discountAmount')
INSPECTION_ID=$(echo "$SELECTED_REC" | jq -r '.inspection_id')
COUPON_CODE="WIX$(echo "$SELECTED_REC" | jq -r '.type' | tr '[:lower:]' '[:upper:]' | cut -c1-6)${DISCOUNT_AMOUNT}"

curl -s -X POST "https://www.wixapis.com/stores/v1/discount-rules" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
    \"discountRule\": {
      \"name\": \"AI Recommended\",
      \"trigger\": {\"couponCode\": \"${COUPON_CODE}\"},
      \"discount\": {\"percentage\": ${DISCOUNT_AMOUNT}, \"type\": \"PERCENT\"},
      \"active\": true
    }
  }"
```

### Step 4 — Confirm with /build

After coupon is created, call `/build` again to confirm completion:

```bash
curl -s -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Exception: User specifies exact discount

If user says "Create 20% off coupon" (explicit amount) → skip `/build`, use their amount directly.

## Skills Referenced

- **smart-discount-recommendations**: API details and response structure
