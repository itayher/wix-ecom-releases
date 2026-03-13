# Order Analytics - Wix Orders API

## Overview

Complete order querying, revenue calculation, trend analysis, and cohort analysis using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Query Orders

### Basic Order Query

**Endpoint**: `POST https://www.wixapis.com/stores/v2/orders/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 50,
      "offset": 0
    }
  }
}'
```

**Response:**

```json
{
  "orders": [
    {
      "id": "order-123",
      "number": "1001",
      "dateCreated": "2026-02-21T10:30:00.000Z",
      "paymentStatus": "PAID",
      "fulfillmentStatus": "FULFILLED",
      "priceSummary": {
        "subtotal": "100.00",
        "shipping": "10.00",
        "tax": "8.50",
        "discount": "15.00",
        "total": "103.50"
      },
      "buyerInfo": {
        "email": "customer@example.com",
        "contactId": "contact-abc123"
      },
      "lineItems": [
        {
          "productName": "Product A",
          "quantity": 2,
          "price": "50.00"
        }
      ]
    }
  ],
  "metadata": {
    "count": 50,
    "offset": 0,
    "total": 450
  }
}
```

### Query Orders by Date Range

```bash
curl -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"dateCreated\": {\"$gte\": \"2026-02-01T00:00:00.000Z\", \"$lte\": \"2026-02-28T23:59:59.000Z\"}}",
    "sort": "{\"dateCreated\": \"desc\"}",
    "paging": {"limit": 100}
  }
}'
```

### Query Paid Orders Only

```bash
curl -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "sort": "{\"dateCreated\": \"desc\"}",
    "paging": {"limit": 100}
  }
}'
```

### Query Orders by Fulfillment Status

```bash
curl -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"fulfillmentStatus\": \"NOT_FULFILLED\", \"paymentStatus\": \"PAID\"}",
    "sort": "{\"dateCreated\": \"asc\"}",
    "paging": {"limit": 50}
  }
}'
```

### Query High-Value Orders

```bash
curl -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"priceSummary.total\": {\"$gte\": \"200.00\"}, \"paymentStatus\": \"PAID\"}",
    "sort": "{\"priceSummary.total\": \"desc\"}",
    "paging": {"limit": 50}
  }
}'
```

## Get Single Order

**Endpoint**: `GET https://www.wixapis.com/stores/v2/orders/{orderId}`

**API Call:**

```bash
curl -X GET "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "order": {
    "id": "order-123",
    "number": "1001",
    "dateCreated": "2026-02-21T10:30:00.000Z",
    "paymentStatus": "PAID",
    "fulfillmentStatus": "FULFILLED",
    "priceSummary": {
      "subtotal": "100.00",
      "shipping": "10.00",
      "tax": "8.50",
      "discount": "15.00",
      "total": "103.50"
    },
    "buyerInfo": {
      "email": "customer@example.com",
      "contactId": "contact-abc123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "shippingInfo": {
      "logistics": {
        "shippingDestination": {
          "address": {
            "addressLine": "123 Main St",
            "city": "San Francisco",
            "subdivision": "CA",
            "postalCode": "94105",
            "country": "US"
          }
        }
      }
    },
    "lineItems": [
      {
        "id": "lineitem-001",
        "productName": "Product A",
        "quantity": 2,
        "price": "50.00",
        "lineItemPrice": "100.00",
        "productId": "product-abc"
      }
    ]
  }
}
```

## Revenue Calculations

### Calculate Total Revenue (Last 30 Days)

```bash
#!/bin/bash

# Get orders from last 30 days
START_DATE=$(date -u -v-30d +"%Y-%m-%dT00:00:00.000Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\", \\\"\\$lte\\\": \\\"$END_DATE\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

# Calculate total revenue
total_revenue=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add')
order_count=$(echo "$orders" | jq '.orders | length')
avg_order_value=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add / length')

echo "30-Day Revenue Report"
echo "===================="
echo "Total Orders: $order_count"
echo "Total Revenue: \$$total_revenue"
echo "Average Order Value: \$$avg_order_value"
```

### Calculate Revenue by Product

```bash
#!/bin/bash

# Get all paid orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

# Extract line items and calculate revenue by product
echo "$orders" | jq -r '
  [.orders[].lineItems[]] |
  group_by(.productName) |
  map({
    product: .[0].productName,
    quantity_sold: ([.[].quantity] | add),
    revenue: ([.[].lineItemPrice | tonumber] | add)
  }) |
  sort_by(-.revenue) |
  .[] |
  "\(.product) | Qty: \(.quantity_sold) | Revenue: $\(.revenue)"
'
```

### Calculate Discount Impact

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

# Calculate discount metrics
total_discount=$(echo "$orders" | jq '[.orders[].priceSummary.discount | tonumber] | add')
orders_with_discount=$(echo "$orders" | jq '[.orders[] | select(.priceSummary.discount | tonumber > 0)] | length')
total_orders=$(echo "$orders" | jq '.orders | length')
discount_rate=$(echo "scale=2; $orders_with_discount / $total_orders * 100" | bc)

echo "Discount Impact Analysis"
echo "======================="
echo "Orders with discounts: $orders_with_discount / $total_orders ($discount_rate%)"
echo "Total discount given: \$$total_discount"
echo "Average discount per order: \$$(echo "scale=2; $total_discount / $total_orders" | bc)"
```

## Trend Analysis

### Daily Revenue Trend

```bash
#!/bin/bash

# Get last 30 days of orders
START_DATE=$(date -u -v-30d +"%Y-%m-%dT00:00:00.000Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\", \\\"\\$lte\\\": \\\"$END_DATE\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

# Group by date and calculate daily revenue
echo "$orders" | jq -r '
  [.orders[] | {
    date: (.dateCreated | split("T")[0]),
    revenue: (.priceSummary.total | tonumber)
  }] |
  group_by(.date) |
  map({
    date: .[0].date,
    orders: length,
    revenue: ([.[].revenue] | add)
  }) |
  sort_by(.date) |
  .[] |
  "\(.date) | Orders: \(.orders) | Revenue: $\(.revenue)"
'
```

### Month-over-Month Growth

```bash
#!/bin/bash

# Current month
CURRENT_MONTH_START=$(date -u +"%Y-%m-01T00:00:00.000Z")
CURRENT_MONTH_END=$(date -u +"%Y-%m-%dT23:59:59.999Z")

# Previous month
PREV_MONTH_START=$(date -u -v-1m +"%Y-%m-01T00:00:00.000Z")
PREV_MONTH_END=$(date -u -v-1m +"%Y-%m-%dT23:59:59.999Z")

# Get current month orders
current=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$CURRENT_MONTH_START\\\", \\\"\\$lte\\\": \\\"$CURRENT_MONTH_END\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

# Get previous month orders
previous=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$PREV_MONTH_START\\\", \\\"\\$lte\\\": \\\"$PREV_MONTH_END\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

current_revenue=$(echo "$current" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')
previous_revenue=$(echo "$previous" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')

growth=$(echo "scale=2; ($current_revenue - $previous_revenue) / $previous_revenue * 100" | bc)

echo "Month-over-Month Growth"
echo "======================"
echo "Previous month: \$$previous_revenue"
echo "Current month: \$$current_revenue"
echo "Growth: $growth%"
```

### Top Selling Products (Last 30 Days)

```bash
#!/bin/bash

START_DATE=$(date -u -v-30d +"%Y-%m-%dT00:00:00.000Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\", \\\"\\$lte\\\": \\\"$END_DATE\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"paging\": {\"limit\": 1000}
  }
}")

echo "Top 10 Best Sellers (Last 30 Days)"
echo "==================================="
echo ""

echo "$orders" | jq -r '
  [.orders[].lineItems[]] |
  group_by(.productName) |
  map({
    product: .[0].productName,
    units_sold: ([.[].quantity] | add),
    revenue: ([.[].lineItemPrice | tonumber] | add)
  }) |
  sort_by(-.units_sold) |
  .[:10] |
  to_entries |
  .[] |
  "\(.key + 1). \(.value.product) - \(.value.units_sold) units - $\(.value.revenue)"
'
```

## Cohort Analysis

### First-Time vs Repeat Customers

```bash
#!/bin/bash

# Get all paid orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "sort": "{\"dateCreated\": \"asc\"}",
    "paging": {"limit": 1000}
  }
}')

# Analyze customer purchase frequency
echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, date: .dateCreated, total: .priceSummary.total}] |
  group_by(.email) |
  map({
    email: .[0].email,
    order_count: length,
    first_order_date: .[0].date,
    last_order_date: .[-1].date,
    total_spent: ([.[].total | tonumber] | add)
  }) |
  group_by(if .order_count == 1 then "first_time" else "repeat" end) |
  map({
    segment: .[0] | if .order_count == 1 then "First-Time" else "Repeat" end,
    customers: length,
    total_revenue: ([.[].total_spent] | add),
    avg_revenue_per_customer: ([.[].total_spent] | add / length)
  }) |
  .[] |
  "\(.segment) Customers: \(.customers) | Revenue: $\(.total_revenue) | Avg: $\(.avg_revenue_per_customer)"
'
```

### Customer Lifetime Value (CLV)

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "Top 20 Customers by Lifetime Value"
echo "==================================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
  group_by(.email) |
  map({
    email: .[0].email,
    order_count: length,
    total_spent: ([.[].total] | add)
  }) |
  sort_by(-.total_spent) |
  .[:20] |
  to_entries |
  .[] |
  "\(.key + 1). \(.value.email) - \(.value.order_count) orders - $\(.value.total_spent)"
'
```

### Purchase Frequency Distribution

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "Purchase Frequency Distribution"
echo "==============================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | .buyerInfo.email] |
  group_by(.) |
  map(length) |
  group_by(.) |
  map({
    orders: .[0],
    customers: length
  }) |
  sort_by(.orders) |
  .[] |
  "\(.orders) order(s): \(.customers) customers"
'
```

## Order Fulfillment Analysis

### Fulfillment Time Analysis

```bash
#!/bin/bash

# Get fulfilled orders from last 30 days
START_DATE=$(date -u -v-30d +"%Y-%m-%dT00:00:00.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"fulfillmentStatus\\\": \\\"FULFILLED\\\", \\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$START_DATE\\\"}}\",
    \"paging\": {\"limit\": 1000}
  }
}")

# Note: This requires fulfillment timestamp data
echo "Fulfillment Performance"
echo "======================"
echo "Total fulfilled orders: $(echo "$orders" | jq '.orders | length')"
```

### Pending Fulfillment Report

```bash
#!/bin/bash

pending=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"fulfillmentStatus\": \"NOT_FULFILLED\", \"paymentStatus\": \"PAID\"}",
    "sort": "{\"dateCreated\": \"asc\"}",
    "paging": {"limit": 100}
  }
}')

count=$(echo "$pending" | jq '.orders | length')

echo "⚠️  PENDING FULFILLMENT: $count orders"
echo ""
echo "$pending" | jq -r '.orders[] | "Order #\(.number) - \(.dateCreated | split("T")[0]) - $\(.priceSummary.total)"'
```

## Average Order Value (AOV) Segmentation

### AOV by Customer Segment

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "AOV by Customer Type"
echo "===================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
  group_by(.email) |
  map({
    email: .[0].email,
    order_count: length,
    total_spent: ([.[].total] | add),
    avg_order_value: ([.[].total] | add / length),
    segment: (if length == 1 then "First-Time" elif length <= 3 then "Occasional" else "Loyal" end)
  }) |
  group_by(.segment) |
  map({
    segment: .[0].segment,
    customers: length,
    avg_order_value: ([.[].avg_order_value] | add / length)
  }) |
  .[] |
  "\(.segment): \(.customers) customers | AOV: $\(.avg_order_value)"
'
```

## Documentation References

- Orders API Overview: https://dev.wix.com/docs/rest/business-solutions/stores/orders/introduction
- Query Orders: https://dev.wix.com/docs/rest/api-reference/wix-stores/orders/query-orders
- Get Order: https://dev.wix.com/docs/rest/api-reference/wix-stores/orders/get-order
- Order Object: https://dev.wix.com/docs/rest/business-solutions/stores/orders/the-order-object
- Payment Status Values: https://dev.wix.com/docs/rest/business-solutions/stores/orders/order-payment-status
- Fulfillment Status Values: https://dev.wix.com/docs/rest/business-solutions/stores/orders/order-fulfillment-status
