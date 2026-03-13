# Discount Manager - Coupon & Discount Management

List, create, edit, pause, and delete discount rules and coupons.

**NOTE**: This command VIEWS/MANAGES existing coupons. To CREATE new coupons with AI recommendations, use `/wix:create-campaign`.

## Command Pattern

```
List all discounts
Show me active coupons
Create a new coupon
Update coupon [code]
Delete coupon [code]
Pause coupon [code]
Find expired coupons
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
  console.error('❌ No site selected.');
  process.exit(1);
}

console.error(\`✓ Managing discounts for: \${getActiveSiteName()}\`);
"
```

### Step 2: List All Active Coupons

Use the **discount-strategy** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   ACTIVE DISCOUNT COUPONS"
echo "======================================"
echo ""

coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": false, \"active\": true}",
    "sort": "{\"startTime\": \"desc\"}",
    "paging": {"limit": 50}
  }
}')

coupon_count=$(echo "$coupons" | jq '.coupons | length')

echo "Found $coupon_count active coupons"
echo ""

echo "$coupons" | jq -r '.coupons[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code: \(.code)
Name: \(.name)
Discount: \(
  if .specification.percentOffAmount then "\(.specification.percentOffAmount)%"
  elif .specification.moneyOffAmount then "$\(.specification.moneyOffAmount)"
  elif .specification.freeShipping then "Free Shipping"
  else "Custom"
  end
)
\(if .specification.minimumSubtotal then "Min Spend: $\(.specification.minimumSubtotal)" else "" end)
Usage: \(.usageCount // 0) times
Valid: \(.startTime | split("T")[0]) to \(.endTime | split("T")[0])
ID: \(.id)
"'

echo "======================================"
```

### Step 3: View Expired Coupons

```bash
echo "======================================"
echo "   EXPIRED COUPONS"
echo "======================================"
echo ""

expired_coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": true}",
    "sort": "{\"endTime\": \"desc\"}",
    "paging": {"limit": 20}
  }
}')

echo "$expired_coupons" | jq -r '.coupons[] | "• \(.code): \(.name) (ended \(.endTime | split("T")[0]))"'
echo ""
```

### Step 4: Get Single Coupon Details

```bash
COUPON_ID="abc123-def456"

curl -s -X GET "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json" | jq '{
  id: .coupon.id,
  code: .coupon.code,
  name: .coupon.name,
  active: .coupon.active,
  expired: .coupon.expired,
  startTime: .coupon.startTime,
  endTime: .coupon.endTime,
  usageCount: .coupon.usageCount,
  discount: (
    if .coupon.specification.percentOffAmount then "\(.coupon.specification.percentOffAmount)%"
    elif .coupon.specification.moneyOffAmount then "$\(.coupon.specification.moneyOffAmount)"
    elif .coupon.specification.freeShipping then "Free Shipping"
    else "Custom"
    end
  ),
  minimumSubtotal: .coupon.specification.minimumSubtotal,
  limitedToOneItem: .coupon.limitedToOneItem
}'
```

### Step 5: Create New Coupon

#### Percentage Off

```bash
curl -s -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"coupon\": {
    \"name\": \"Summer Sale 20% Off\",
    \"code\": \"SUMMER20\",
    \"startTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"endTime\": \"$(date -u -v+30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days" +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"specification\": {
      \"percentOffAmount\": 20,
      \"scope\": {
        \"namespace\": \"stores\"
      }
    },
    \"limitedToOneItem\": false
  }
}" | jq '{
  id: .coupon.id,
  code: .coupon.code,
  discount: "\(.coupon.specification.percentOffAmount)%",
  message: "✅ Coupon created successfully"
}'
```

#### Fixed Amount Off

```bash
curl -s -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"coupon\": {
    \"name\": \"$10 Off Any Order\",
    \"code\": \"SAVE10\",
    \"startTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"specification\": {
      \"moneyOffAmount\": \"10.00\",
      \"scope\": {
        \"namespace\": \"stores\"
      }
    }
  }
}" | jq '{
  code: .coupon.code,
  discount: "$\(.coupon.specification.moneyOffAmount)",
  message: "✅ Coupon created"
}'
```

#### Free Shipping (with minimum)

```bash
curl -s -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"coupon\": {
    \"name\": \"Free Shipping Over $50\",
    \"code\": \"FREESHIP50\",
    \"startTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"specification\": {
      \"freeShipping\": true,
      \"minimumSubtotal\": \"50.00\",
      \"scope\": {
        \"namespace\": \"stores\"
      }
    }
  }
}" | jq '{
  code: .coupon.code,
  minSpend: "$\(.coupon.specification.minimumSubtotal)",
  message: "✅ Free shipping coupon created"
}'
```

#### Spend Threshold Discount

```bash
curl -s -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"coupon\": {
    \"name\": \"Spend $100, Save $15\",
    \"code\": \"SPEND100\",
    \"startTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"specification\": {
      \"moneyOffAmount\": \"15.00\",
      \"minimumSubtotal\": \"100.00\",
      \"scope\": {
        \"namespace\": \"stores\"
      }
    }
  }
}" | jq '{
  code: .coupon.code,
  discount: "$\(.coupon.specification.moneyOffAmount)",
  minSpend: "$\(.coupon.specification.minimumSubtotal)",
  message: "✅ Threshold discount created"
}'
```

### Step 6: Update Coupon

```bash
COUPON_ID="abc123-def456"

curl -s -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"coupon\": {
    \"name\": \"Updated Coupon Name\",
    \"endTime\": \"$(date -u -v+60d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "60 days" +"%Y-%m-%dT%H:%M:%S.000Z")\"
  }
}" | jq '{
  id: .coupon.id,
  code: .coupon.code,
  name: .coupon.name,
  endTime: .coupon.endTime,
  message: "✅ Coupon updated"
}'
```

### Step 7: Deactivate (Pause) Coupon

```bash
COUPON_ID="abc123-def456"

curl -s -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "active": false
  }
}' | jq '{
  code: .coupon.code,
  active: .coupon.active,
  message: "✅ Coupon deactivated"
}'
```

### Step 8: Reactivate Coupon

```bash
COUPON_ID="abc123-def456"

curl -s -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "active": true
  }
}' | jq '{
  code: .coupon.code,
  active: .coupon.active,
  message: "✅ Coupon reactivated"
}'
```

### Step 9: Delete Coupon

```bash
COUPON_ID="abc123-def456"

curl -s -X DELETE "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"

echo "✅ Coupon deleted successfully"
```

### Step 10: Usage Analytics

```bash
echo "======================================"
echo "   COUPON PERFORMANCE"
echo "======================================"
echo ""

coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": false}",
    "sort": "{\"usageCount\": \"desc\"}",
    "paging": {"limit": 50}
  }
}')

echo "📊 TOP PERFORMING COUPONS (by usage):"
echo ""
echo "$coupons" | jq -r '.coupons[] | select(.usageCount > 0) | "• \(.code): \(.usageCount) uses"'
echo ""

echo "⚠️  UNUSED COUPONS:"
echo ""
echo "$coupons" | jq -r '.coupons[] | select(.usageCount == 0 or .usageCount == null) | "• \(.code): \(.name)"'
echo ""
```

## Output Format

```
✓ Managing discounts for: My Store

======================================
   ACTIVE DISCOUNT COUPONS
======================================

Found 5 active coupons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code: SUMMER20
Name: Summer Sale 20% Off
Discount: 20%
Usage: 45 times
Valid: 2026-02-01 to 2026-03-01
ID: abc123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code: FREESHIP50
Name: Free Shipping Over $50
Discount: Free Shipping
Min Spend: $50.00
Usage: 23 times
Valid: 2026-02-15 to 2026-03-15
ID: def456
```

## Skills Referenced

- **discount-strategy**: All coupon types, margin calculations, conflict detection
- **order-analytics**: Performance tracking

## Example Use Cases

1. **Review Discounts**: "List all active coupons"
2. **Quick Create**: "Create a 15% off coupon"
3. **Pause Campaign**: "Deactivate coupon SUMMER20"
4. **Performance Check**: "Which coupons are being used the most?"
5. **Cleanup**: "Show me expired coupons to delete"
6. **Extend Campaign**: "Update coupon SUMMER20 to expire in 60 days"

## Related Commands

- `/wix:create-campaign` - Guided workflow for campaign creation
- `/wix:revenue-report` - Measure discount impact on revenue
- `/wix:analyze-store` - Overall health including discount strategy
