# Revenue Report - Performance Analytics

Detailed revenue and performance reporting by time period with trend analysis.

## Command Pattern

```
Show me revenue report
Revenue for last 30 days
Monthly revenue comparison
Revenue by product
Discount impact analysis
Revenue trends
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

console.error(\`✓ Generating revenue report for: \${getActiveSiteName()}\`);
"
```

### Step 2: 30-Day Revenue Summary

Use the **order-analytics** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   REVENUE REPORT"
echo "======================================"
echo ""

thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

order_count=$(echo "$orders" | jq '.orders | length')

if [ "$order_count" -eq 0 ]; then
  echo "No paid orders found in last 30 days"
  echo ""
  exit 0
fi

total_revenue=$(echo "$orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add')
total_subtotal=$(echo "$orders" | jq '[.orders[] | .priceSummary.subtotal | tonumber] | add // 0')
total_shipping=$(echo "$orders" | jq '[.orders[] | .priceSummary.shipping | tonumber] | add // 0')
total_tax=$(echo "$orders" | jq '[.orders[] | .priceSummary.tax | tonumber] | add // 0')
total_discount=$(echo "$orders" | jq '[.orders[] | .priceSummary.discount | tonumber] | add // 0')
aov=$(echo "scale=2; $total_revenue / $order_count" | bc)

echo "📊 30-DAY SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Orders: $order_count"
echo "Total Revenue: \$$total_revenue"
echo "Average Order Value: \$$aov"
echo ""
echo "Revenue Breakdown:"
echo "  Subtotal: \$$total_subtotal"
echo "  Shipping: \$$total_shipping"
echo "  Tax: \$$total_tax"
echo "  Discounts: -\$$total_discount"
echo ""

# Calculate discount rate
if [ "$total_subtotal" != "0" ]; then
  discount_rate=$(echo "scale=1; ($total_discount / $total_subtotal) * 100" | bc)
  echo "Discount Rate: ${discount_rate}%"
  echo ""
fi
```

### Step 3: Daily Revenue Trend

```bash
echo "📈 DAILY REVENUE TREND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$orders" | jq -r '.orders | group_by(.dateCreated | split("T")[0]) | map({
  date: .[0].dateCreated | split("T")[0],
  orders: length,
  revenue: (map(.priceSummary.total | tonumber) | add),
  aov: ((map(.priceSummary.total | tonumber) | add) / length)
}) | sort_by(.date) | reverse | .[] | "\(.date): \(.orders) orders, $\(.revenue | floor) revenue (AOV: $\(.aov | floor))"'

echo ""
```

### Step 4: Week-over-Week Comparison

```bash
echo "📊 WEEK-OVER-WEEK COMPARISON"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

seven_days_ago=$(date -u -v-7d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "7 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")
fourteen_days_ago=$(date -u -v-14d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "14 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

# Last 7 days
last_week=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$seven_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

# Previous 7 days
prev_week=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$fourteen_days_ago\\\", \\\"\\$lt\\\": \\\"$seven_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

last_week_revenue=$(echo "$last_week" | jq '[.orders[] | .priceSummary.total | tonumber] | add // 0')
last_week_orders=$(echo "$last_week" | jq '.orders | length')

prev_week_revenue=$(echo "$prev_week" | jq '[.orders[] | .priceSummary.total | tonumber] | add // 0')
prev_week_orders=$(echo "$prev_week" | jq '.orders | length')

echo "Last 7 Days:"
echo "  Orders: $last_week_orders"
echo "  Revenue: \$$last_week_revenue"
echo ""

echo "Previous 7 Days:"
echo "  Orders: $prev_week_orders"
echo "  Revenue: \$$prev_week_revenue"
echo ""

# Calculate change
if [ "$prev_week_revenue" != "0" ]; then
  revenue_change=$(echo "scale=1; (($last_week_revenue - $prev_week_revenue) / $prev_week_revenue) * 100" | bc)
  if (( $(echo "$revenue_change > 0" | bc -l) )); then
    echo "Change: +${revenue_change}% 📈"
  else
    echo "Change: ${revenue_change}% 📉"
  fi
else
  echo "Change: N/A (no previous week data)"
fi

echo ""
```

### Step 5: Revenue by Product

```bash
echo "🏆 TOP 10 PRODUCTS BY REVENUE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$orders" | jq -r '
.orders[]
| .lineItems[]
| {
    name: .name,
    quantity: .quantity,
    revenue: ((.price | tonumber) * .quantity)
  }
' | jq -s 'group_by(.name) | map({
  name: .[0].name,
  totalQuantity: (map(.quantity) | add),
  totalRevenue: (map(.revenue) | add)
}) | sort_by(-.totalRevenue) | .[0:10][] | "\(.totalRevenue | floor | tostring | . + " " | "   $" + .)\(.name) (\(.totalQuantity) sold)"'

echo ""
```

### Step 6: Discount Impact Analysis

```bash
echo "💸 DISCOUNT IMPACT ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

orders_with_discount=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.discount | tonumber) > 0)] | length')
orders_without_discount=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.discount | tonumber) == 0)] | length')

echo "Orders with discounts: $orders_with_discount"
echo "Orders without discounts: $orders_without_discount"
echo ""

if [ "$orders_with_discount" -gt 0 ]; then
  avg_discount=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.discount | tonumber) > 0) | .priceSummary.discount | tonumber] | add / length')
  avg_order_with_discount=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.discount | tonumber) > 0) | .priceSummary.total | tonumber] | add / length')
  avg_order_without_discount=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.discount | tonumber) == 0) | .priceSummary.total | tonumber] | add / length // 0')

  echo "Average discount amount: \$$avg_discount"
  echo "Average order with discount: \$$avg_order_with_discount"
  echo "Average order without discount: \$$avg_order_without_discount"
  echo ""

  # Discount effectiveness
  if [ "$avg_order_without_discount" != "0" ]; then
    effectiveness=$(echo "scale=1; (($avg_order_with_discount - $avg_order_without_discount) / $avg_order_without_discount) * 100" | bc)
    echo "💡 Discounted orders are ${effectiveness}% higher/lower than non-discounted"
  fi
fi

echo ""
```

### Step 7: Customer Segmentation

```bash
echo "👥 CUSTOMER SEGMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# First-time vs repeat customers
unique_customers=$(echo "$orders" | jq '[.orders[] | .buyerInfo.email] | unique | length')
total_orders=$order_count
repeat_rate=$(echo "scale=1; (($total_orders - $unique_customers) / $total_orders) * 100" | bc)

echo "Unique customers: $unique_customers"
echo "Total orders: $total_orders"
echo "Repeat customer rate: ${repeat_rate}%"
echo ""

# Top 5 customers by spend
echo "Top 5 Customers by Spend:"
echo "$orders" | jq -r '.orders | group_by(.buyerInfo.email) | map({
  email: .[0].buyerInfo.email,
  orders: length,
  totalSpent: (map(.priceSummary.total | tonumber) | add)
}) | sort_by(-.totalSpent) | .[0:5][] | "   • \(.email): \(.orders) orders, $\(.totalSpent | floor) spent"'

echo ""
```

### Step 8: Payment Method Breakdown

```bash
echo "💳 PAYMENT METHODS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$orders" | jq -r '.orders | group_by(.paymentMethod) | map({
  method: (.[0].paymentMethod // "Unknown"),
  count: length,
  revenue: (map(.priceSummary.total | tonumber) | add)
}) | sort_by(-.revenue) | .[] | "• \(.method): \(.count) orders, $\(.revenue | floor) revenue"'

echo ""
echo "======================================"
```

## Output Format

```
✓ Generating revenue report for: My Store

======================================
   REVENUE REPORT
======================================

📊 30-DAY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Orders: 156
Total Revenue: $6,789.00
Average Order Value: $43.52

Revenue Breakdown:
  Subtotal: $6,234.00
  Shipping: $780.00
  Tax: $445.00
  Discounts: -$670.00

Discount Rate: 10.7%

📈 DAILY REVENUE TREND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2026-02-20: 8 orders, $345 revenue (AOV: $43)
2026-02-19: 12 orders, $567 revenue (AOV: $47)

📊 WEEK-OVER-WEEK COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last 7 Days:
  Orders: 45
  Revenue: $1,890

Previous 7 Days:
  Orders: 38
  Revenue: $1,645

Change: +14.9% 📈
```

## Skills Referenced

- **order-analytics**: Revenue calculations, trend analysis, cohort analysis
- **customer-insights**: Customer segmentation, repeat rate
- **discount-strategy**: Discount impact measurement

## Example Use Cases

1. **Monthly Review**: "Show me revenue report for last month"
2. **Trend Analysis**: "How is revenue trending week over week?"
3. **Product Performance**: "Which products generate the most revenue?"
4. **Discount ROI**: "What's the impact of discounts on revenue?"
5. **Customer Insights**: "What's my repeat customer rate?"
6. **Payment Analysis**: "Which payment methods do customers prefer?"

## Related Commands

- `/wix:orders` - Detailed order lookup
- `/wix:analyze-store` - Overall store health
- `/wix:discount-manager` - Discount performance by coupon
