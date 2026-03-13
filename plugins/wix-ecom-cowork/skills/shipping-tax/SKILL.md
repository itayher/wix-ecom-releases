# Shipping & Tax Configuration - Wix APIs

## Overview

Shipping rule management, tax configuration, and fulfillment optimization using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Shipping Rules

### Query Shipping Rates

**Endpoint**: `POST https://www.wixapis.com/ecom/v1/shipping-rates/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/ecom/v1/shipping-rates/query" \
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
  "shippingRates": [
    {
      "id": "rate-123",
      "name": "Standard Shipping",
      "code": "STANDARD",
      "logistics": {
        "deliveryTimeMin": 3,
        "deliveryTimeMax": 5,
        "deliveryTimeUnit": "DAYS"
      },
      "cost": {
        "price": "9.99",
        "currency": "USD"
      },
      "region": {
        "countryCode": "US"
      }
    },
    {
      "id": "rate-456",
      "name": "Express Shipping",
      "code": "EXPRESS",
      "logistics": {
        "deliveryTimeMin": 1,
        "deliveryTimeMax": 2,
        "deliveryTimeUnit": "DAYS"
      },
      "cost": {
        "price": "24.99",
        "currency": "USD"
      },
      "region": {
        "countryCode": "US"
      }
    }
  ],
  "metadata": {
    "count": 2,
    "total": 2
  }
}
```

### Get Single Shipping Rate

**Endpoint**: `GET https://www.wixapis.com/ecom/v1/shipping-rates/{rateId}`

```bash
curl -X GET "https://www.wixapis.com/ecom/v1/shipping-rates/${RATE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

### Create Shipping Rate

**Endpoint**: `POST https://www.wixapis.com/ecom/v1/shipping-rates`

**Standard Shipping:**

```bash
curl -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
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
      "price": "9.99",
      "currency": "USD"
    },
    "region": {
      "countryCode": "US"
    }
  }
}'
```

**Free Shipping (Over $50):**

```bash
curl -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Free Shipping",
    "code": "FREE",
    "logistics": {
      "deliveryTimeMin": 3,
      "deliveryTimeMax": 7,
      "deliveryTimeUnit": "DAYS"
    },
    "cost": {
      "price": "0.00",
      "currency": "USD"
    },
    "region": {
      "countryCode": "US"
    },
    "conditions": {
      "minSubtotal": "50.00"
    }
  }
}'
```

**International Shipping:**

```bash
curl -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "International Shipping",
    "code": "INTL",
    "logistics": {
      "deliveryTimeMin": 7,
      "deliveryTimeMax": 14,
      "deliveryTimeUnit": "DAYS"
    },
    "cost": {
      "price": "29.99",
      "currency": "USD"
    },
    "region": {
      "countryCode": "CA"
    }
  }
}'
```

### Update Shipping Rate

**Endpoint**: `PATCH https://www.wixapis.com/ecom/v1/shipping-rates/{rateId}`

```bash
curl -X PATCH "https://www.wixapis.com/ecom/v1/shipping-rates/${RATE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "cost": {
      "price": "12.99"
    }
  }
}'
```

### Delete Shipping Rate

**Endpoint**: `DELETE https://www.wixapis.com/ecom/v1/shipping-rates/{rateId}`

```bash
curl -X DELETE "https://www.wixapis.com/ecom/v1/shipping-rates/${RATE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Shipping Analysis

### Calculate Average Shipping Cost

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

total_shipping=$(echo "$orders" | jq '[.orders[].priceSummary.shipping | tonumber] | add // 0')
order_count=$(echo "$orders" | jq '.orders | length')
avg_shipping=$(echo "$orders" | jq '[.orders[].priceSummary.shipping | tonumber] | add / length // 0')

echo "Shipping Cost Analysis"
echo "====================="
echo "Total Orders: $order_count"
echo "Total Shipping Collected: \$$total_shipping"
echo "Average Shipping per Order: \$$avg_shipping"
```

### Shipping Method Usage

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

echo "Shipping Method Distribution"
echo "==========================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {
    method: (.shippingInfo.logistics.shippingOption.title // "Unknown"),
    cost: (.priceSummary.shipping | tonumber)
  }] |
  group_by(.method) |
  map({
    method: .[0].method,
    count: length,
    total_revenue: ([.[].cost] | add)
  }) |
  sort_by(-.count) |
  .[] |
  "\(.method): \(.count) orders | Revenue: $\(.total_revenue)"
'
```

### Free Shipping Usage Rate

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

total_orders=$(echo "$orders" | jq '.orders | length')
free_shipping=$(echo "$orders" | jq '[.orders[] | select((.priceSummary.shipping | tonumber) == 0)] | length')
free_shipping_rate=$(echo "scale=2; $free_shipping / $total_orders * 100" | bc)

echo "Free Shipping Usage"
echo "==================="
echo "Total Orders: $total_orders"
echo "Free Shipping Orders: $free_shipping ($free_shipping_rate%)"
```

## Tax Configuration

### Query Tax Regions

**Endpoint**: `POST https://www.wixapis.com/tax-regions/v1/regions/query`

```bash
curl -X POST "https://www.wixapis.com/tax-regions/v1/regions/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 50
    }
  }
}'
```

**Response:**

```json
{
  "taxRegions": [
    {
      "id": "region-123",
      "country": "US",
      "subdivision": "CA",
      "name": "California",
      "rate": 9.5,
      "includeInPrice": false
    }
  ]
}
```

### Calculate Tax Collected

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

total_tax=$(echo "$orders" | jq '[.orders[].priceSummary.tax | tonumber] | add // 0')
total_revenue=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')
effective_rate=$(echo "scale=2; $total_tax / $total_revenue * 100" | bc)

echo "Tax Collection Summary"
echo "====================="
echo "Total Tax Collected: \$$total_tax"
echo "Total Revenue: \$$total_revenue"
echo "Effective Tax Rate: $effective_rate%"
```

### Tax by State/Region

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

echo "Tax Collected by Region"
echo "======================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {
    state: (.shippingInfo.logistics.shippingDestination.address.subdivision // "Unknown"),
    tax: (.priceSummary.tax | tonumber),
    subtotal: (.priceSummary.subtotal | tonumber)
  }] |
  group_by(.state) |
  map({
    state: .[0].state,
    orders: length,
    tax_collected: ([.[].tax] | add),
    subtotal: ([.[].subtotal] | add),
    effective_rate: ([.[].tax] | add) / ([.[].subtotal] | add) * 100
  }) |
  sort_by(-.tax_collected) |
  .[] |
  "\(.state): \(.orders) orders | Tax: $\(.tax_collected) | Rate: \(.effective_rate | floor)%"
'
```

## Fulfillment Configuration

### Query Fulfillment Centers

**Note**: This is a placeholder. Wix may have different APIs for fulfillment centers.

```bash
curl -X GET "https://www.wixapis.com/stores/v1/fulfillment-centers" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

### Calculate Shipping Zones Performance

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

echo "Orders by Shipping Destination"
echo "=============================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {
    country: (.shippingInfo.logistics.shippingDestination.address.country // "Unknown"),
    total: (.priceSummary.total | tonumber)
  }] |
  group_by(.country) |
  map({
    country: .[0].country,
    orders: length,
    revenue: ([.[].total] | add)
  }) |
  sort_by(-.orders) |
  .[] |
  "\(.country): \(.orders) orders | $\(.revenue) revenue"
'
```

## Shipping Optimization Strategies

### Free Shipping Threshold Analysis

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

avg_subtotal=$(echo "$orders" | jq '[.orders[].priceSummary.subtotal | tonumber] | add / length')

echo "Free Shipping Threshold Recommendation"
echo "======================================"
echo ""
echo "Current Average Subtotal: \$$avg_subtotal"
echo ""
echo "Recommended Thresholds:"
echo "  Conservative (10% lift): \$$(echo "$avg_subtotal * 1.1" | bc | cut -d. -f1)"
echo "  Moderate (20% lift): \$$(echo "$avg_subtotal * 1.2" | bc | cut -d. -f1)"
echo "  Aggressive (30% lift): \$$(echo "$avg_subtotal * 1.3" | bc | cut -d. -f1)"
```

### Identify Orders Near Free Shipping Threshold

```bash
#!/bin/bash

THRESHOLD=50

# Get recent carts or orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 100}
  }
}')

echo "Orders Within \$10 of Free Shipping Threshold (\$$THRESHOLD)"
echo "========================================================="
echo ""

echo "$orders" | jq -r --argjson threshold "$THRESHOLD" '
  [.orders[] | {
    number: .number,
    email: .buyerInfo.email,
    subtotal: (.priceSummary.subtotal | tonumber),
    gap: ($threshold - (.priceSummary.subtotal | tonumber))
  }] |
  map(select(.subtotal < $threshold and .gap <= 10 and .gap > 0)) |
  .[] |
  "Order #\(.number) - \(.email) - $\(.subtotal) subtotal (add $\(.gap) for free shipping)"
'
```

## Shipping Rate Templates

### Flat Rate by Country

```bash
#!/bin/bash

# US: $9.99
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "US Shipping",
    "code": "US_FLAT",
    "logistics": {"deliveryTimeMin": 3, "deliveryTimeMax": 5, "deliveryTimeUnit": "DAYS"},
    "cost": {"price": "9.99", "currency": "USD"},
    "region": {"countryCode": "US"}
  }
}' > /dev/null

# Canada: $14.99
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Canada Shipping",
    "code": "CA_FLAT",
    "logistics": {"deliveryTimeMin": 5, "deliveryTimeMax": 10, "deliveryTimeUnit": "DAYS"},
    "cost": {"price": "14.99", "currency": "USD"},
    "region": {"countryCode": "CA"}
  }
}' > /dev/null

echo "✓ Created flat rate shipping for US and Canada"
```

### Tiered Shipping (Free over $50, Standard $9.99)

```bash
#!/bin/bash

# Free shipping over $50
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Free Shipping",
    "code": "FREE_50",
    "logistics": {"deliveryTimeMin": 3, "deliveryTimeMax": 7, "deliveryTimeUnit": "DAYS"},
    "cost": {"price": "0.00", "currency": "USD"},
    "region": {"countryCode": "US"},
    "conditions": {"minSubtotal": "50.00"}
  }
}' > /dev/null

# Standard shipping
curl -s -X POST "https://www.wixapis.com/ecom/v1/shipping-rates" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "shippingRate": {
    "name": "Standard Shipping",
    "code": "STANDARD",
    "logistics": {"deliveryTimeMin": 3, "deliveryTimeMax": 7, "deliveryTimeUnit": "DAYS"},
    "cost": {"price": "9.99", "currency": "USD"},
    "region": {"countryCode": "US"}
  }
}' > /dev/null

echo "✓ Created tiered shipping rates"
```

## Shipping Configuration Best Practices

### 1. Recommended Shipping Structure

**Domestic (US):**

- Free Shipping: $0 (orders $50+)
- Standard: $9.99 (3-5 days)
- Express: $19.99 (1-2 days)

**Canada:**

- Standard: $14.99 (5-10 days)
- Express: $29.99 (3-5 days)

**International:**

- Standard: $29.99 (7-14 days)

### 2. Free Shipping Threshold Formula

```bash
# Set free shipping threshold at 1.2× average order value
AVG_ORDER_VALUE=42.50
THRESHOLD=$(echo "$AVG_ORDER_VALUE * 1.2" | bc)

echo "Recommended free shipping threshold: \$$(echo "$THRESHOLD" | cut -d. -f1)"
```

### 3. Shipping Cost Recovery

```bash
#!/bin/bash

# Calculate shipping cost vs collected
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

# Assume actual cost is $7 per order average
ACTUAL_COST_PER_ORDER=7.00
order_count=$(echo "$orders" | jq '.orders | length')
collected=$(echo "$orders" | jq '[.orders[].priceSummary.shipping | tonumber] | add // 0')
actual_cost=$(echo "$order_count * $ACTUAL_COST_PER_ORDER" | bc)
profit_loss=$(echo "$collected - $actual_cost" | bc)

echo "Shipping P&L"
echo "============"
echo "Orders: $order_count"
echo "Collected: \$$collected"
echo "Actual Cost: \$$actual_cost"
echo "Profit/Loss: \$$profit_loss"
```

## Documentation References

- Shipping Rates API: https://dev.wix.com/docs/rest/business-management/shipping-rates/introduction
- Tax Regions API: https://dev.wix.com/docs/rest/business-management/tax/tax-regions/introduction
- Shipping Settings: https://support.wix.com/en/article/wix-stores-setting-up-shipping
- Tax Configuration: https://support.wix.com/en/article/wix-stores-setting-up-tax

## Order Fulfillment Tracking

### Query Fulfillments

**Endpoint**: `POST https://www.wixapis.com/stores/v1/fulfillments/query`

```bash
curl -X POST "https://www.wixapis.com/stores/v1/fulfillments/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "orderId": "order-123"
    },
    "paging": {"limit": 100}
  }
}'
```

### Fulfillment Object Structure

```json
{
  "fulfillment": {
    "id": "fulfillment-789",
    "orderId": "order-123",
    "lineItems": [
      {
        "id": "line-item-1",
        "quantity": 2
      }
    ],
    "trackingInfo": {
      "trackingNumber": "1Z999AA10123456784",
      "shippingProvider": "UPS",
      "trackingLink": "https://www.ups.com/track?tracknum=1Z999AA10123456784"
    },
    "status": "FULFILLED",
    "createdDate": "2026-02-20T10:00:00.000Z"
  }
}
```

### Create Fulfillment with Tracking

**Endpoint**: `POST https://www.wixapis.com/stores/v1/fulfillments`

```bash
curl -X POST "https://www.wixapis.com/stores/v1/fulfillments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "fulfillment": {
    "orderId": "order-123",
    "lineItems": [
      {
        "id": "line-item-1",
        "quantity": 2
      }
    ],
    "trackingInfo": {
      "trackingNumber": "1Z999AA10123456784",
      "shippingProvider": "UPS"
    }
  }
}'
```

### Update Tracking Information

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/fulfillments/${FULFILLMENT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "fulfillment": {
    "trackingInfo": {
      "trackingNumber": "NEW-TRACKING-NUMBER",
      "shippingProvider": "FedEx"
    }
  }
}'
```

## Fulfillment Analytics

### Orders Awaiting Fulfillment

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "NOT_FULFILLED"
    },
    "paging": {"limit": 100}
  }
}')

count=$(echo "$orders" | jq '.orders | length')
total_value=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')

echo "=== ORDERS AWAITING FULFILLMENT ==="
echo "Count: $count orders"
echo "Total Value: \$$total_value"
echo ""
echo "$orders" | jq -r '.orders[] | "Order #\(.number) - \(.buyerInfo.email) - $\(.priceSummary.total)"'
```

### Fulfillment Time Analysis

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "FULFILLED"
    },
    "paging": {"limit": 100}
  }
}')

echo "=== FULFILLMENT TIME ANALYSIS ==="
echo ""

# Note: This requires fulfillment timestamps
echo "$orders" | jq -r '
  [.orders[] | {
    order_date: .dateCreated,
    fulfilled_date: .fulfilledDate,
    hours: (((.fulfilledDate | fromdateiso8601) - (.dateCreated | fromdateiso8601)) / 3600)
  }] |
  {
    avg_hours: ([.[].hours] | add / length),
    min_hours: ([.[].hours] | min),
    max_hours: ([.[].hours] | max)
  } |
  "Average Fulfillment Time: \(.avg_hours | floor) hours\nFastest: \(.min_hours | floor) hours\nSlowest: \(.max_hours | floor) hours"
'
```

### Tracking Number Coverage

```bash
#!/bin/bash

fulfilled=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "FULFILLED"
    },
    "paging": {"limit": 100}
  }
}')

total_fulfilled=$(echo "$fulfilled" | jq '.orders | length')
with_tracking=$(echo "$fulfilled" | jq '[.orders[] | select(.shippingInfo.trackingNumber != null)] | length')
without_tracking=$((total_fulfilled - with_tracking))
coverage=$(echo "scale=1; $with_tracking / $total_fulfilled * 100" | bc)

echo "=== TRACKING NUMBER COVERAGE ==="
echo "Total Fulfilled Orders: $total_fulfilled"
echo "With Tracking: $with_tracking (${coverage}%)"
echo "Without Tracking: $without_tracking"
echo ""
[ $without_tracking -gt 0 ] && echo "⚠ Add tracking numbers to $without_tracking orders"
```

### Shipping Provider Distribution

```bash
#!/bin/bash

fulfillments=$(curl -s -X POST "https://www.wixapis.com/stores/v1/fulfillments/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "=== SHIPPING PROVIDER DISTRIBUTION ==="
echo ""

echo "$fulfillments" | jq -r '
  [.fulfillments[] | .trackingInfo.shippingProvider // "Unknown"] |
  group_by(.) |
  map({provider: .[0], count: length}) |
  sort_by(-.count) |
  .[] |
  "\(.provider): \(.count) shipments"
'
```

### Late Fulfillments (SLA Violations)

```bash
#!/bin/bash

SLA_HOURS=24

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "NOT_FULFILLED"
    },
    "paging": {"limit": 100}
  }
}')

now_epoch=$(date +%s)

echo "=== LATE FULFILLMENTS (>${SLA_HOURS}h) ==="
echo ""

echo "$orders" | jq -r --arg sla "$SLA_HOURS" --arg now "$now_epoch" '
  [.orders[] | {
    number: .number,
    email: .buyerInfo.email,
    date: .dateCreated,
    hours: (($now | tonumber) - (.dateCreated | fromdateiso8601)) / 3600
  }] |
  map(select(.hours > ($sla | tonumber))) |
  sort_by(-.hours) |
  .[] |
  "Order #\(.number) - \(.email) - \(.hours | floor) hours old"
' | head -20
```

## Advanced Fulfillment Features

### Partial Fulfillment Support

```bash
# Fulfill only some items from an order
curl -X POST "https://www.wixapis.com/stores/v1/fulfillments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "fulfillment": {
    "orderId": "order-123",
    "lineItems": [
      {
        "id": "line-item-1",
        "quantity": 1
      }
    ],
    "trackingInfo": {
      "trackingNumber": "TRACKING-1",
      "shippingProvider": "UPS"
    }
  }
}'
```

### Bulk Fulfillment Operations

```bash
#!/bin/bash

# Get all unfulfilled orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "NOT_FULFILLED"
    },
    "paging": {"limit": 10}
  }
}')

# Process each order
echo "$orders" | jq -r '.orders[] | .id' | while read order_id; do
  echo "Processing order: $order_id"
  
  # Create fulfillment (you'd need actual tracking numbers)
  curl -s -X POST "https://www.wixapis.com/stores/v1/fulfillments" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "fulfillment": {
      "orderId": "'"$order_id"'",
      "trackingInfo": {
        "trackingNumber": "AUTO-'"$order_id"'",
        "shippingProvider": "USPS"
      }
    }
  }' > /dev/null
  
  echo "✓ Fulfilled order $order_id"
done
```

## Fulfillment Best Practices

### 1. Same-Day Fulfillment Target

Aim to fulfill orders within 24 hours of payment:

```bash
# Monitor unfulfilled orders older than 12 hours
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "paymentStatus": "PAID",
      "fulfillmentStatus": "NOT_FULFILLED"
    }
  }
}')

# Alert on orders > 12 hours old
echo "$orders" | jq -r '
  [.orders[] | select(
    (now - (.dateCreated | fromdateiso8601)) > 43200
  )] |
  length as $count |
  if $count > 0 then
    "⚠ ALERT: \($count) orders need immediate fulfillment"
  else
    "✓ All orders within fulfillment window"
  end
'
```

### 2. Always Add Tracking Numbers

Tracking numbers improve customer satisfaction by 40%:

- UPS: `1Z + 16 characters`
- FedEx: `12-14 digits`
- USPS: `20-22 digits`
- DHL: `10-11 digits`

### 3. Automated Email Notifications

Wix automatically sends tracking emails when you add tracking numbers via API.

## Documentation References

- Fulfillments API: https://dev.wix.com/docs/rest/business-solutions/stores/fulfillments/introduction
- Orders API: https://dev.wix.com/docs/rest/business-solutions/stores/orders/introduction
- Shipping Best Practices: https://support.wix.com/en/article/wix-stores-fulfilling-orders
