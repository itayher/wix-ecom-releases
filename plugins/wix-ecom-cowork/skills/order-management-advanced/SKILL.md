# Order Management Advanced - eCommerce Orders V1 API

## Overview

Advanced order operations using Wix's ecom-orders V1 API for aggregation, advanced filtering, payment status, refundability, and fulfillment management.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Order Aggregation

**Endpoint**: `POST /_api/ecom-orders/v1/orders/aggregate`

Get order statistics and aggregated data (counts, totals, breakdowns).

```bash
curl -X POST "https://www.wixapis.com/_api/ecom-orders/v1/orders/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "aggregation": {
    "deliveryMethodPerShippingRegion": {
      "$count": ["shippingRegion", "deliveryMethod"]
    }
  }
}'
```

**Use Cases**:
- Count orders by delivery method
- Break down orders by shipping region
- Aggregate by payment status
- Count by fulfillment status

### Example: Count Orders by Status

```bash
curl -X POST "https://www.wixapis.com/_api/ecom-orders/v1/orders/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "aggregation": {
    "ordersByStatus": {
      "$count": ["paymentStatus", "fulfillmentStatus"]
    }
  }
}'
```

## Advanced Order Query

**Endpoint**: `POST /_api/ecom-orders/v1/orders/query`

Query orders with advanced filters beyond the public API.

```bash
curl -X POST "https://www.wixapis.com/_api/ecom-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "filter": {
    "$and": [
      {
        "lineItems.catalogReference.appId": {
          "$eq": "PRODUCT_APP_ID"
        }
      }
    ]
  },
  "paging": {
    "limit": 50,
    "offset": 0
  }
}'
```

**Advanced Filters**:
- Filter by product app ID
- Filter by catalog reference
- Complex AND/OR conditions
- Nested product filters

## Check Order Refundability

**Endpoint**: `POST /_api/order-billing/v1/get-order-refundability`

Check if an order can be refunded and get refund details.

```bash
curl -X POST "https://www.wixapis.com/_api/order-billing/v1/get-order-refundability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "orderId": "ORDER_ID_HERE"
}'
```

**Response**:
```json
{
  "refundable": true,
  "maxRefundAmount": 125.50,
  "currency": "USD",
  "reasons": [],
  "paymentProvider": "stripe"
}
```

**Use Cases**:
- Check if order can be refunded before processing
- Get maximum refund amount
- Identify non-refundable orders
- Validate refund requests

## Get Payment Collectability Status

**Endpoint**: `GET /ecom/v1/payments-collector/orders/{orderId}/payment-collectability-status`

Check if payment can be collected for an order (for pending payments).

```bash
ORDER_ID="order-id-here"

curl -X GET "https://www.wixapis.com/ecom/v1/payments-collector/orders/${ORDER_ID}/payment-collectability-status" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "collectable": true,
  "status": "PENDING",
  "paymentMethod": "credit_card",
  "amount": 125.50
}
```

**Use Cases**:
- Check pending payment status
- Identify orders waiting for payment
- Validate payment collection capability
- Payment reminder workflows

## Get Order Tips/Gratuity

**Endpoint**: `GET /_api/tips-service/v1/tips/order/{orderId}`

Retrieve tip/gratuity information for an order (if applicable).

```bash
ORDER_ID="order-id-here"

curl -X GET "https://www.wixapis.com/_api/tips-service/v1/tips/order/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "orderId": "order-123",
  "tipAmount": 15.00,
  "currency": "USD",
  "tipPercentage": 20.0
}
```

**Use Cases**:
- Track tip amounts for service orders
- Calculate average tip percentage
- Analyze tip patterns
- Service staff compensation tracking

## Get Fulfillment Providers

**Endpoint**: `GET /_api/wix-ecommerce-fulfillment/v1/fulfillers/unified`

Get all connected fulfillment providers (dropshipping, POD, etc.).

```bash
curl -X GET "https://www.wixapis.com/_api/wix-ecommerce-fulfillment/v1/fulfillers/unified" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "fulfillers": [
    {
      "id": "fulfiller-123",
      "name": "Printful",
      "type": "PRINT_ON_DEMAND",
      "orderCount": 145,
      "active": true
    }
  ]
}
```

## Check Draft Order Status

**Endpoint**: `GET /ecom/v1/draft-orders/{draftOrderId}/draftability`

Check if a draft order can still be modified.

```bash
DRAFT_ORDER_ID="draft-order-id"

curl -X GET "https://www.wixapis.com/ecom/v1/draft-orders/${DRAFT_ORDER_ID}/draftability" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Use Cases**:
- Validate draft order before editing
- Check if draft expired
- Draft order management workflows

## Get Payment Provider Accounts

**Endpoint**: `GET /ambassador/payment-settings-web/v2/settings/provider-accounts`

Get configured payment providers and accounts.

```bash
curl -X GET "https://www.wixapis.com/ambassador/payment-settings-web/v2/settings/provider-accounts" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "providers": [
    {
      "type": "STRIPE",
      "accountId": "acct_123",
      "active": true,
      "capabilities": ["card", "apple_pay", "google_pay"]
    }
  ]
}
```

## Query Products (Catalog Reader)

**Endpoint**: `POST /_api/catalog-reader-server/v1/products/query`

Query products using the catalog reader service (optimized for reads).

```bash
curl -X POST "https://www.wixapis.com/_api/catalog-reader-server/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {},
    "paging": {
      "limit": 50,
      "offset": 0
    }
  }
}'
```

**Benefit**: Potentially faster reads than the standard products API.

## Complete Order Management Workflow

### 1. Get Order Details
Use public API: `GET /stores/v1/orders/{id}`

### 2. Check Refundability
```bash
POST /_api/order-billing/v1/get-order-refundability
```

### 3. Check Payment Status
```bash
GET /ecom/v1/payments-collector/orders/{id}/payment-collectability-status
```

### 4. Check Tips (if applicable)
```bash
GET /_api/tips-service/v1/tips/order/{id}
```

### 5. Get Aggregated Stats
```bash
POST /_api/ecom-orders/v1/orders/aggregate
```

## Best Practices

1. **Use aggregation API** for statistics instead of querying all orders
2. **Check refundability** before processing refund requests
3. **Validate payment status** for pending orders
4. **Cache fulfillment providers** (changes infrequently)
5. **Rate limit**: 200ms between order queries
