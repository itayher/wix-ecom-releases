# Orders - Order Lookup & Analytics

Query orders, view details, filter by status, and analyze order patterns.

## Command Pattern

```
Show me recent orders
List orders from last 30 days
Get order details for [order ID]
Show paid orders
Show unfulfilled orders
Orders by customer email
Revenue summary
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

console.error(\`✓ Querying orders for: \${getActiveSiteName()}\`);
"
```

### Step 2: Query Recent Orders

Use the **order-analytics** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   RECENT ORDERS"
echo "======================================"
echo ""

# Get orders from last 30 days
thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}}\", \"sort\": \"{\\\"dateCreated\\\": \\\"desc\\\"}\", \"paging\": {\"limit\": 50}}}")

order_count=$(echo "$orders" | jq '.orders | length')

echo "Found $order_count orders in last 30 days"
echo ""

echo "$orders" | jq -r '.orders[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order #\(.number)
ID: \(.id)
Date: \(.dateCreated | split("T")[0])
Customer: \(.billingInfo.contactDetails.firstName) \(.billingInfo.contactDetails.lastName)
Email: \(.buyerInfo.email)
Total: $\(.priceSummary.total)
Payment: \(.paymentStatus)
Fulfillment: \(.fulfillmentStatus)
"'

echo "======================================"
```

### Step 3: Filter Orders by Payment Status

```bash
echo "💰 PAID ORDERS (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

paid_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 100}}}")

paid_count=$(echo "$paid_orders" | jq '.orders | length')
total_revenue=$(echo "$paid_orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add // 0')

echo "Total Paid Orders: $paid_count"
echo "Total Revenue: \$$total_revenue"
echo ""
```

### Step 4: Filter Orders by Fulfillment Status

```bash
echo "📦 UNFULFILLED ORDERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

unfulfilled=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"fulfillmentStatus\\\": \\\"NOT_FULFILLED\\\"}\", \"paging\": {\"limit\": 50}}}")

unfulfilled_count=$(echo "$unfulfilled" | jq '.orders | length')

if [ "$unfulfilled_count" -gt 0 ]; then
  echo "⚠️  $unfulfilled_count orders need fulfillment:"
  echo ""
  echo "$unfulfilled" | jq -r '.orders[] | "• Order #\(.number): \(.buyerInfo.email) - $\(.priceSummary.total) (ID: \(.id))"'
else
  echo "✅ All orders fulfilled"
fi

echo ""
```

### Step 5: Get Single Order Details

```bash
ORDER_ID="abc123-def456"

echo "======================================"
echo "   ORDER DETAILS"
echo "======================================"
echo ""

curl -s -X GET "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json" | jq '{
  orderNumber: .order.number,
  id: .order.id,
  date: .order.dateCreated,
  customer: {
    name: "\(.order.billingInfo.contactDetails.firstName) \(.order.billingInfo.contactDetails.lastName)",
    email: .order.buyerInfo.email,
    phone: .order.billingInfo.contactDetails.phone
  },
  items: [.order.lineItems[] | {
    name: .name,
    quantity: .quantity,
    price: .price,
    total: ((.price | tonumber) * .quantity)
  }],
  pricing: {
    subtotal: .order.priceSummary.subtotal,
    shipping: .order.priceSummary.shipping,
    tax: .order.priceSummary.tax,
    discount: .order.priceSummary.discount,
    total: .order.priceSummary.total
  },
  payment: {
    status: .order.paymentStatus,
    method: .order.paymentMethod
  },
  fulfillment: {
    status: .order.fulfillmentStatus
  },
  shipping: {
    address: .order.shippingInfo.logistics.shippingAddress,
    method: .order.shippingInfo.logistics.shippingMethod
  }
}'
```

### Step 6: Orders by Date Range

```bash
START_DATE="2026-02-01T00:00:00.000Z"
END_DATE="2026-02-28T23:59:59.000Z"

curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\", \\\"\\$lte\\\": \\\"$END_DATE\\\"}}\", \"paging\": {\"limit\": 100}}}" | jq '{
  total: (.orders | length),
  orders: [.orders[] | {
    number: .number,
    date: .dateCreated,
    customer: .buyerInfo.email,
    total: .priceSummary.total
  }]
}'
```

### Step 7: Revenue Summary

```bash
echo "======================================"
echo "   REVENUE SUMMARY (Last 30 Days)"
echo "======================================"
echo ""

paid_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

order_count=$(echo "$paid_orders" | jq '.orders | length')

if [ "$order_count" -eq 0 ]; then
  echo "No paid orders found in last 30 days"
  total_revenue=0
  aov=0
  total_discount=0
else
  total_revenue=$(echo "$paid_orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add')
  aov=$(echo "scale=2; $total_revenue / $order_count" | bc)
  total_discount=$(echo "$paid_orders" | jq '[.orders[] | .priceSummary.discount | tonumber] | add // 0')
fi

echo "Total Orders: $order_count"
echo "Total Revenue: \$$total_revenue"
echo "Average Order Value: \$$aov"
echo "Total Discounts Given: \$$total_discount"
echo ""

# Daily revenue
echo "📈 DAILY REVENUE BREAKDOWN:"
echo ""
echo "$paid_orders" | jq -r '.orders | group_by(.dateCreated | split("T")[0]) | map({
  date: .[0].dateCreated | split("T")[0],
  orders: length,
  revenue: (map(.priceSummary.total | tonumber) | add)
}) | sort_by(.date) | reverse | .[] | "• \(.date): \(.orders) orders, $\(.revenue | floor) revenue"'
echo ""
```

### Step 8: Top Selling Products

```bash
echo "🏆 TOP SELLING PRODUCTS (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$paid_orders" | jq -r '
.orders[]
| .lineItems[]
| {name, quantity, revenue: ((.price | tonumber) * .quantity)}
' | jq -s 'group_by(.name) | map({
  name: .[0].name,
  totalQuantity: (map(.quantity) | add),
  totalRevenue: (map(.revenue) | add)
}) | sort_by(-.totalRevenue) | .[0:10][] | "• \(.name): \(.totalQuantity) sold, $\(.totalRevenue | floor) revenue"'

echo ""
```

### Step 9: Customer Order History

```bash
CUSTOMER_EMAIL="customer@example.com"

echo "======================================"
echo "   CUSTOMER ORDER HISTORY"
echo "======================================"
echo "Customer: $CUSTOMER_EMAIL"
echo ""

customer_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"buyerInfo.email\\\": \\\"$CUSTOMER_EMAIL\\\"}\", \"sort\": \"{\\\"dateCreated\\\": \\\"desc\\\"}\", \"paging\": {\"limit\": 50}}}")

customer_order_count=$(echo "$customer_orders" | jq '.orders | length')
customer_lifetime_value=$(echo "$customer_orders" | jq '[.orders[] | select(.paymentStatus == "PAID") | .priceSummary.total | tonumber] | add // 0')

echo "Total Orders: $customer_order_count"
echo "Lifetime Value: \$$customer_lifetime_value"
echo ""

echo "Order History:"
echo "$customer_orders" | jq -r '.orders[] | "• Order #\(.number) - \(.dateCreated | split("T")[0]) - $\(.priceSummary.total) (\(.paymentStatus))"'
echo ""
```

## Output Format

```
✓ Querying orders for: My Store

======================================
   RECENT ORDERS
======================================

Found 23 orders in last 30 days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order #1234
ID: abc123-def456
Date: 2026-02-20
Customer: John Doe
Email: john@example.com
Total: $89.99
Payment: PAID
Fulfillment: FULFILLED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order #1235
ID: def456-ghi789
Date: 2026-02-19
Customer: Jane Smith
Email: jane@example.com
Total: $145.50
Payment: PAID
Fulfillment: NOT_FULFILLED
```

## Skills Referenced

- **order-analytics**: Order querying, revenue calculations, cohort analysis
- **customer-insights**: Customer lifetime value, purchase history

## Example Use Cases

1. **Recent Activity**: "Show me orders from last week"
2. **Fulfillment Check**: "Which orders need to be shipped?"
3. **Order Details**: "Get full details for order #1234"
4. **Revenue Check**: "What's my revenue this month?"
5. **Top Products**: "What are my best sellers?"
6. **Customer History**: "Show all orders from john@example.com"
7. **Date Range**: "Orders between Feb 1 and Feb 15"

## Related Commands

- `/wix:revenue-report` - Detailed revenue analytics
- `/wix:customers` - Customer segmentation and insights
- `/wix:analyze-store` - Overall store performance
