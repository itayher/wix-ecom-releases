# Smart Discount Recommendations - Wix AI Recommendations API

## When to use

User asks for discount recommendations, coupon ideas, or help boosting sales.

**Rule: Do NOT query orders, products, analytics, or any other data. Call `/build` directly — Wix AI has the data it needs server-side.**

## Configuration

- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Endpoint**: `POST https://manage.wix.com/recommendations/v1/recommendations/build`

## Get Recommendations (first and only step)

**Call this immediately. Do not gather any store data first.**

```bash
curl -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Show the raw API response to the user.

## After Coupon Created — Call /build Again

Always use `/build` — do not use any feedback endpoint:

```bash
curl -X POST "https://manage.wix.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Create Coupon

Values come from the API response — never use hardcoded amounts:

```bash
curl -X POST "https://www.wixapis.com/stores/v1/discount-rules" \
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
