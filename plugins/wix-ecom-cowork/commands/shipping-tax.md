# Shipping & Tax - Shipping and Tax Configuration

View and manage shipping rules and tax settings for your store.

## Command Pattern

```
Show shipping settings
List shipping rates
Add shipping rate
Update shipping rate
Show tax configuration
Analyze shipping costs
Free shipping optimization
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

console.error(\`✓ Managing shipping/tax for: \${getActiveSiteName()}\`);
"
```

### Step 2: List Shipping Rates

Use the **shipping-tax** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   SHIPPING RATES"
echo "======================================"
echo ""

shipping_rates=$(curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

rate_count=$(echo "$shipping_rates" | jq '.shippingRates | length')

echo "Total Shipping Rates: $rate_count"
echo ""

if [ "$rate_count" -eq 0 ]; then
  echo "⚠️  No shipping rates configured"
  echo ""
  echo "📌 ACTION: Add shipping rates to enable checkout"
  exit 0
fi

echo "$shipping_rates" | jq -r '.shippingRates[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: \(.name)
Code: \(.code // "N/A")
Cost: $\(.cost.price) \(.cost.currency)
Region: \(.region.countryCode // "All Countries")
Delivery Time: \(.logistics.deliveryTimeMin // "?")-\(.logistics.deliveryTimeMax // "?") \(.logistics.deliveryTimeUnit // "days")
\(if .conditions.minSubtotal then "Min Order: $\(.conditions.minSubtotal)" else "Min Order: None" end)
ID: \(.id)
"'

echo "======================================"
```

### Step 3: Create Shipping Rate

#### Standard Shipping

```bash
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Standard Shipping",
    "code": "STANDARD",
    "logistics": {
      "deliveryTimeMin": 3,
      "deliveryTimeMax": 5,
      "deliveryTimeUnit": "DAYS"
    },
    "cost": {
      "price": "5.99",
      "currency": "USD"
    },
    "region": {
      "countryCode": "US"
    }
  }
}' | jq '{
  id: .shippingRate.id,
  name: .shippingRate.name,
  cost: "$\(.shippingRate.cost.price)",
  message: "✅ Shipping rate created"
}'
```

#### Express Shipping

```bash
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Express Shipping",
    "code": "EXPRESS",
    "logistics": {
      "deliveryTimeMin": 1,
      "deliveryTimeMax": 2,
      "deliveryTimeUnit": "DAYS"
    },
    "cost": {
      "price": "12.99",
      "currency": "USD"
    },
    "region": {
      "countryCode": "US"
    }
  }
}' | jq '{
  name: .shippingRate.name,
  cost: "$\(.shippingRate.cost.price)",
  delivery: "\(.shippingRate.logistics.deliveryTimeMin)-\(.shippingRate.logistics.deliveryTimeMax) days",
  message: "✅ Express shipping created"
}'
```

#### Free Shipping (with minimum)

```bash
# Calculate recommended threshold (1.2x AOV)
thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

aov=$(echo "$orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add / length // 50')
free_ship_threshold=$(echo "scale=0; $aov * 1.2 / 1" | bc)

echo "Current AOV: \$$aov"
echo "Recommended free shipping threshold: \$$free_ship_threshold"
echo ""

curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"shippingRate\": {
    \"name\": \"Free Shipping\",
    \"code\": \"FREE_${free_ship_threshold}\",
    \"logistics\": {
      \"deliveryTimeMin\": 3,
      \"deliveryTimeMax\": 7,
      \"deliveryTimeUnit\": \"DAYS\"
    },
    \"cost\": {
      \"price\": \"0.00\",
      \"currency\": \"USD\"
    },
    \"region\": {
      \"countryCode\": \"US\"
    },
    \"conditions\": {
      \"minSubtotal\": \"${free_ship_threshold}.00\"
    }
  }
}" | jq '{
  name: .shippingRate.name,
  minOrder: "$\(.shippingRate.conditions.minSubtotal)",
  message: "✅ Free shipping rate created"
}'
```

### Step 4: Update Shipping Rate

```bash
RATE_ID="abc123-def456"

curl -s -X PATCH "https://www.wixapis.com/ecom/v1/shipping-rates/${RATE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "cost": {
      "price": "7.99",
      "currency": "USD"
    }
  }
}' | jq '{
  id: .shippingRate.id,
  name: .shippingRate.name,
  newCost: "$\(.shippingRate.cost.price)",
  message: "✅ Shipping rate updated"
}'
```

### Step 5: Delete Shipping Rate

```bash
RATE_ID="abc123-def456"

curl -s -X DELETE "https://www.wixapis.com/ecom/v1/shipping-rates/${RATE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"

echo "✅ Shipping rate deleted"
```

### Step 6: Shipping Cost Analysis

```bash
echo "======================================"
echo "   SHIPPING COST ANALYSIS"
echo "======================================"
echo ""

# Get recent orders with shipping data
thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

order_count=$(echo "$orders" | jq '.orders | length')

if [ "$order_count" -eq 0 ]; then
  echo "No orders found in last 30 days"
  exit 0
fi

total_shipping=$(echo "$orders" | jq '[.orders[] | .priceSummary.shipping | tonumber] | add // 0')
avg_shipping=$(echo "scale=2; $total_shipping / $order_count" | bc)
free_shipping_count=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.shipping | tonumber) == 0)] | length')
paid_shipping_count=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.shipping | tonumber) > 0)] | length')

echo "📊 SHIPPING METRICS (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Orders: $order_count"
echo "Total Shipping Revenue: \$$total_shipping"
echo "Average Shipping per Order: \$$avg_shipping"
echo ""
echo "Orders with Free Shipping: $free_shipping_count ($(echo "scale=1; $free_shipping_count / $order_count * 100" | bc)%)"
echo "Orders with Paid Shipping: $paid_shipping_count ($(echo "scale=1; $paid_shipping_count / $order_count * 100" | bc)%)"
echo ""

# Shipping method distribution
echo "📦 SHIPPING METHOD DISTRIBUTION:"
echo ""
echo "$orders" | jq -r '.orders | group_by(.shippingInfo.logistics.shippingMethod // "Unknown") | map({
  method: (.[0].shippingInfo.logistics.shippingMethod // "Unknown"),
  count: length,
  percentage: ((length / '$order_count') * 100 | floor)
}) | .[] | "   • \(.method): \(.count) orders (\(.percentage)%)"'

echo ""
```

### Step 7: Free Shipping Optimization

```bash
echo "💡 FREE SHIPPING OPTIMIZATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate current AOV
aov=$(echo "$orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add / length')

echo "Current AOV: \$$aov"
echo ""

# Recommended threshold (1.2x AOV)
recommended_threshold=$(echo "scale=0; $aov * 1.2 / 1" | bc)

echo "✅ RECOMMENDATION:"
echo "   Set free shipping threshold at: \$$recommended_threshold"
echo "   This is 1.2x your current AOV"
echo ""

# Calculate impact
orders_near_threshold=$(echo "$orders" | jq --argjson threshold "$recommended_threshold" '[.orders[] | select((.priceSummary.total | tonumber) >= ($threshold * 0.9) and (.priceSummary.total | tonumber) < $threshold)] | length')

echo "📈 POTENTIAL IMPACT:"
echo "   $orders_near_threshold orders ($(echo "scale=1; $orders_near_threshold / $order_count * 100" | bc)%) within 10% of threshold"
echo "   These customers could add more items to qualify"
echo ""
```

### Step 8: Tax Configuration Overview

```bash
echo "======================================"
echo "   TAX CONFIGURATION"
echo "======================================"
echo ""

# Note: Wix Stores API doesn't have direct tax configuration endpoints
# Tax is typically managed through Wix dashboard

echo "⚠️  Tax configuration is managed through Wix Dashboard:"
echo ""
echo "1. Go to your Wix dashboard"
echo "2. Navigate to Settings → Taxes"
echo "3. Configure tax regions and rates"
echo ""
echo "📊 TAX DATA FROM ORDERS (Last 30 Days):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

total_tax=$(echo "$orders" | jq '[.orders[] | .priceSummary.tax | tonumber] | add // 0')
total_subtotal=$(echo "$orders" | jq '[.orders[] | .priceSummary.subtotal | tonumber] | add')

if [ "$total_subtotal" != "0" ]; then
  effective_rate=$(echo "scale=2; ($total_tax / $total_subtotal) * 100" | bc)
  echo "Total Tax Collected: \$$total_tax"
  echo "Total Subtotal: \$$total_subtotal"
  echo "Effective Tax Rate: ${effective_rate}%"
else
  echo "No tax data available"
fi

echo ""
echo "======================================"
```

## Output Format

```
✓ Managing shipping/tax for: My Store

======================================
   SHIPPING RATES
======================================

Total Shipping Rates: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Standard Shipping
Code: STANDARD
Cost: $5.99 USD
Region: US
Delivery Time: 3-5 DAYS
Min Order: None
ID: abc123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: Free Shipping
Code: FREE_50
Cost: $0.00 USD
Region: US
Delivery Time: 3-7 DAYS
Min Order: $50.00
ID: def456

📊 SHIPPING METRICS (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Orders: 156
Total Shipping Revenue: $789.00
Average Shipping per Order: $5.06

Orders with Free Shipping: 45 (28.8%)
Orders with Paid Shipping: 111 (71.2%)

💡 FREE SHIPPING OPTIMIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current AOV: $43.52

✅ RECOMMENDATION:
   Set free shipping threshold at: $52
   This is 1.2x your current AOV

📈 POTENTIAL IMPACT:
   23 orders (14.7%) within 10% of threshold
```

## Skills Referenced

- **shipping-tax**: Shipping rate management, free shipping optimization, tax analysis
- **order-analytics**: AOV calculation, shipping cost analysis

## Example Use Cases

1. **View Settings**: "Show me my shipping rates"
2. **Add Shipping**: "Create a standard shipping rate"
3. **Free Shipping**: "Add free shipping over $50"
4. **Cost Analysis**: "What's my average shipping cost?"
5. **Optimization**: "Should I offer free shipping?"
6. **Update Rate**: "Change standard shipping to $7.99"
7. **Tax Review**: "Show me tax collection data"

## Common Shipping Rate Templates

### Flat Rate by Region

```bash
# US Domestic
{"name": "US Standard", "cost": "5.99", "country": "US", "days": "3-5"}

# International
{"name": "International", "cost": "15.99", "country": "CA", "days": "7-14"}
```

### Tiered Rates by Order Value

```bash
# Orders < $50: $5.99
# Orders $50-$100: $3.99
# Orders > $100: Free
```

## Related Commands

- `/wix:analyze-store` - Overall store health including shipping
- `/wix:revenue-report` - Shipping revenue contribution
- `/wix:create-campaign` - Free shipping campaigns
