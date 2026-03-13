# Order Advanced - Advanced Order Operations & Analytics

Advanced order management including aggregation, refund checking, payment status, tips tracking, and fulfillment provider management.

## Command Pattern

```
Show order statistics and breakdowns
Check if order [order ID] can be refunded
Get payment status for order [order ID]
Show fulfillment providers
Get order aggregation by status
Check tips for order [order ID]
Aggregate orders by shipping region
```

## Purpose

Advanced order operations beyond basic queries, including refundability checks, payment collection status, order aggregation statistics, and fulfillment provider management.

## Skills Referenced

- **order-management-advanced**: Advanced order APIs (aggregate, refund, payment)
- **order-analytics**: Order queries and analysis
- **wix-api-core**: Authentication

## Workflow

### Get Order Statistics (Aggregation)

Aggregate orders by various dimensions:

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

echo "📊 Order Statistics"
echo "==================="

# Aggregate by status
curl -s -X POST "https://www.wixapis.com/_api/ecom-orders/v1/orders/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "aggregation": {
    "ordersByStatus": {
      "$count": ["paymentStatus", "fulfillmentStatus"]
    }
  }
}' | jq '{
  paymentStatus: .ordersByStatus.paymentStatus,
  fulfillmentStatus: .ordersByStatus.fulfillmentStatus,
  total: (.ordersByStatus.paymentStatus | to_entries | map(.value) | add)
}'
```

**Output**:
```json
{
  "paymentStatus": {
    "PAID": 156,
    "PENDING": 12,
    "PARTIALLY_REFUNDED": 3,
    "FULLY_REFUNDED": 2
  },
  "fulfillmentStatus": {
    "FULFILLED": 98,
    "NOT_FULFILLED": 45,
    "PARTIALLY_FULFILLED": 28
  },
  "total": 173
}
```

### Check Order Refundability

Before processing a refund, check if the order can be refunded:

```bash
ORDER_ID="order-id-here"

echo "🔍 Checking refundability for order ${ORDER_ID}..."

refund_info=$(curl -s -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"orderId\": \"${ORDER_ID}\"
}")

echo "$refund_info" | jq '{
  refundable: .refundable,
  maxAmount: .maxRefundAmount,
  currency: .currency,
  provider: .paymentProvider,
  status: (if .refundable then "✅ Can be refunded" else "❌ Cannot be refunded" end)
}'
```

**Output**:
```json
{
  "refundable": true,
  "maxAmount": 125.50,
  "currency": "USD",
  "provider": "stripe",
  "status": "✅ Can be refunded"
}
```

### Check Payment Collection Status

For orders with pending payments:

```bash
ORDER_ID="order-id-here"

echo "💳 Checking payment status..."

payment_status=$(curl -s -X GET "https://www.wixapis.com/ecom/v1/payments-collector/orders/${ORDER_ID}/payment-collectability-status" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$payment_status" | jq '{
  collectable: .collectable,
  status: .status,
  method: .paymentMethod,
  amount: .amount,
  message: (if .collectable then "✅ Payment can be collected" else "⚠️ Payment cannot be collected" end)
}'
```

### Get Order Tips/Gratuity

For orders with tips (common in service-based products):

```bash
ORDER_ID="order-id-here"

echo "💵 Checking tips for order..."

tips=$(curl -s -X GET "https://www.wixapis.com/_api/tips-service/v1/tips/order/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$tips" | jq '{
  orderId: .orderId,
  tipAmount: .tipAmount,
  tipPercentage: .tipPercentage,
  currency: .currency,
  message: "Tip: $\(.tipAmount) (\(.tipPercentage)%)"
}'
```

### Get Fulfillment Providers

List all connected fulfillment services:

```bash
echo "📦 Fulfillment Providers"
echo "======================="

fulfillers=$(curl -s -X GET "https://www.wixapis.com/_api/wix-ecommerce-fulfillment/v1/fulfillers/unified" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$fulfillers" | jq '[.fulfillers[] | {
  id,
  name,
  type,
  orderCount,
  active
}]'
```

**Output**:
```json
[
  {
    "id": "printful-123",
    "name": "Printful",
    "type": "PRINT_ON_DEMAND",
    "orderCount": 145,
    "active": true
  },
  {
    "id": "shippo-456",
    "name": "Shippo",
    "type": "SHIPPING_INTEGRATION",
    "orderCount": 892,
    "active": true
  }
]
```

### Get Payment Providers

List configured payment gateways:

```bash
echo "💳 Payment Providers"
echo "===================="

providers=$(curl -s -X GET "https://www.wixapis.com/ambassador/payment-settings-web/v2/settings/provider-accounts" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

echo "$providers" | jq '[.providers[] | {
  type,
  accountId,
  active,
  capabilities
}]'
```

## Complete Refund Workflow

### Step 1: Verify Order Exists
```bash
ORDER_ID="4ce0e1eb-1375-4c3d-a5a3-d7102bdf59bb"

order=$(curl -s -X GET "https://www.wixapis.com/stores/v1/orders/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

order_number=$(echo "$order" | jq -r '.order.number')
order_total=$(echo "$order" | jq -r '.order.priceSummary.total')

echo "Order #${order_number} - Total: $${order_total}"
```

### Step 2: Check Refundability
```bash
refund_check=$(curl -s -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\": \"${ORDER_ID}\"}")

can_refund=$(echo "$refund_check" | jq -r '.refundable')
max_refund=$(echo "$refund_check" | jq -r '.maxRefundAmount')

if [ "$can_refund" = "true" ]; then
  echo "✅ Order can be refunded (max: $${max_refund})"
else
  echo "❌ Order cannot be refunded"
  exit 1
fi
```

### Step 3: Process Refund
```bash
# Use Wix public API for actual refund
curl -s -X POST "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}/refunds" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "refund": {
    "amount": '"${max_refund}"',
    "reason": "Customer request"
  }
}'

echo "✅ Refund processed: $${max_refund}"
```

## Order Analytics Dashboard

Combine multiple APIs for comprehensive view:

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ORDER MANAGEMENT DASHBOARD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Get aggregated stats
stats=$(curl -s -X POST "https://www.wixapis.com/_api/ecom-orders/v1/orders/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"aggregation": {"byStatus": {"$count": ["paymentStatus"]}}}')

paid=$(echo "$stats" | jq -r '.byStatus.paymentStatus.PAID // 0')
pending=$(echo "$stats" | jq -r '.byStatus.paymentStatus.PENDING // 0')
refunded=$(echo "$stats" | jq -r '.byStatus.paymentStatus.FULLY_REFUNDED // 0')

# 2. Get fulfillment providers
fulfillers=$(curl -s -X GET "https://www.wixapis.com/_api/wix-ecommerce-fulfillment/v1/fulfillers/unified" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

fulfiller_count=$(echo "$fulfillers" | jq '.fulfillers | length')

# 3. Get payment providers
payments=$(curl -s -X GET "https://www.wixapis.com/ambassador/payment-settings-web/v2/settings/provider-accounts" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

payment_count=$(echo "$payments" | jq '.providers | length')

echo ""
echo "ORDER STATUS:"
echo "  Paid:    ${paid}"
echo "  Pending: ${pending}"
echo "  Refunded: ${refunded}"
echo ""
echo "INTEGRATIONS:"
echo "  Fulfillment Providers: ${fulfiller_count}"
echo "  Payment Gateways:      ${payment_count}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Example Use Cases

1. **Refund Check**: "Can order ABC123 be refunded?"
2. **Payment Status**: "Check payment status for order XYZ"
3. **Order Stats**: "Show me order statistics by status"
4. **Tips Analysis**: "Show tips for all orders this month"
5. **Fulfillment Check**: "What fulfillment providers are connected?"
6. **Provider Stats**: "Show orders by fulfillment provider"

## Related Commands

- `/wix:orders` - Basic order queries
- `/wix:shipping-tax` - Shipping and fulfillment
- `/wix:analytics` - Business intelligence
- `/wix:revenue-report` - Revenue analysis
