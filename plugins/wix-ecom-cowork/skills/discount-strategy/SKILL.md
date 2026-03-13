# Discount Strategy - Wix Coupons API

## Overview

Complete discount and coupon management including all discount types, campaign templates, conflict detection, and margin calculations using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Prerequisites

The site must have one of these apps installed:

- Wix Stores
- Wix Bookings
- Wix Events
- Wix Pricing Plans

## Query Coupons

### Get All Active Coupons

**Endpoint**: `POST https://www.wixapis.com/stores/v2/coupons/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": false}",
    "paging": {"limit": 50}
  }
}'
```

**Response:**

```json
{
  "coupons": [
    {
      "id": "coupon-123",
      "code": "SAVE20",
      "name": "20% Off Sale",
      "startTime": "2026-02-01T00:00:00.000Z",
      "endTime": "2026-03-01T00:00:00.000Z",
      "active": true,
      "expired": false,
      "specification": {
        "percentOffAmount": 20,
        "scope": {
          "namespace": "stores"
        }
      },
      "limitedToOneItem": false,
      "usageCount": 45
    }
  ],
  "metadata": {
    "count": 1,
    "total": 1
  }
}
```

### Get Single Coupon

**Endpoint**: `GET https://www.wixapis.com/stores/v2/coupons/{couponId}`

```bash
curl -X GET "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

### Query Expired Coupons

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": true}",
    "sort": "{\"endTime\": \"desc\"}",
    "paging": {"limit": 50}
  }
}'
```

### Query Coupons by Usage

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": false, \"usageCount\": {\"$gte\": 10}}",
    "sort": "{\"usageCount\": \"desc\"}",
    "paging": {"limit": 20}
  }
}'
```

## Create Coupons

### 1. Fixed Amount Discount

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "$10 Off Any Order",
    "code": "SAVE10",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "moneyOffAmount": "10.00",
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

**Response:**

```json
{
  "coupon": {
    "id": "new-coupon-123",
    "code": "SAVE10",
    "name": "$10 Off Any Order",
    "startTime": "2026-02-21T00:00:00.000Z",
    "active": true,
    "expired": false,
    "specification": {
      "moneyOffAmount": "10.00",
      "scope": {
        "namespace": "stores"
      }
    }
  }
}
```

### 2. Percentage Discount

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "20% Off Everything",
    "code": "SAVE20",
    "startTime": "2026-02-21T00:00:00.000Z",
    "endTime": "2026-03-21T23:59:59.000Z",
    "specification": {
      "percentOffAmount": 20,
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

### 3. Free Shipping

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Free Shipping Promo",
    "code": "FREESHIP",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "freeShipping": true,
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

### 4. Fixed Sale Price

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Fixed $19.99 Sale",
    "code": "FLASH19",
    "startTime": "2026-02-21T00:00:00.000Z",
    "endTime": "2026-02-21T23:59:59.000Z",
    "specification": {
      "fixedPrice": "19.99",
      "scope": {
        "namespace": "stores",
        "group": {
          "entityType": "PRODUCT",
          "entityIds": ["product-abc", "product-xyz"]
        }
      }
    },
    "limitedToOneItem": true
  }
}'
```

### 5. Buy X Get Y (BOGO)

**Buy 1 Get 1 Free:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Buy 1 Get 1 Free",
    "code": "BOGO",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "buyXGetY": {
        "x": {
          "quantity": 1,
          "entityType": "PRODUCT",
          "entityIds": ["product-abc"]
        },
        "y": {
          "quantity": 1,
          "entityType": "PRODUCT",
          "entityIds": ["product-abc"]
        }
      },
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

**Buy 2 Get 1 Free (Any from Collection):**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Buy 2 Get 1 Free - Sale Items",
    "code": "B2G1",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "buyXGetY": {
        "x": {
          "quantity": 2,
          "entityType": "COLLECTION",
          "entityIds": ["collection-sale"]
        },
        "y": {
          "quantity": 1,
          "entityType": "COLLECTION",
          "entityIds": ["collection-sale"]
        }
      },
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

## Advanced Coupon Configuration

### With Minimum Subtotal

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "$20 Off Orders $100+",
    "code": "SAVE20ON100",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "moneyOffAmount": "20.00",
      "scope": {
        "namespace": "stores"
      },
      "minimumSubtotal": "100.00"
    }
  }
}'
```

### With Usage Limit

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Limited 50% Off - First 100 Customers",
    "code": "FLASH50",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "percentOffAmount": 50,
      "scope": {
        "namespace": "stores"
      }
    },
    "usageLimit": 100
  }
}'
```

### Limited to One Item

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "50% Off One Item",
    "code": "HALF",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "percentOffAmount": 50,
      "scope": {
        "namespace": "stores"
      }
    },
    "limitedToOneItem": true
  }
}'
```

### Specific Product/Collection Scope

**Specific Products:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "30% Off Select Products",
    "code": "SELECT30",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "percentOffAmount": 30,
      "scope": {
        "namespace": "stores",
        "group": {
          "entityType": "PRODUCT",
          "entityIds": ["product-001", "product-002", "product-003"]
        }
      }
    }
  }
}'
```

**Specific Collection:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "25% Off Summer Collection",
    "code": "SUMMER25",
    "startTime": "2026-06-01T00:00:00.000Z",
    "endTime": "2026-08-31T23:59:59.000Z",
    "specification": {
      "percentOffAmount": 25,
      "scope": {
        "namespace": "stores",
        "group": {
          "entityType": "COLLECTION",
          "entityIds": ["collection-summer"]
        }
      }
    }
  }
}'
```

## Update Coupon

**Endpoint**: `PATCH https://www.wixapis.com/stores/v2/coupons/{couponId}`

### Extend Expiration Date

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "endTime": "2026-04-30T23:59:59.000Z"
  }
}'
```

### Update Discount Amount

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "specification": {
      "percentOffAmount": 30
    }
  }
}'
```

### Deactivate Coupon

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "active": false
  }
}'
```

## Delete Coupon

**Endpoint**: `DELETE https://www.wixapis.com/stores/v2/coupons/{couponId}`

```bash
curl -X DELETE "https://www.wixapis.com/stores/v2/coupons/${COUPON_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Campaign Templates

### Flash Sale (24 Hours)

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "24-Hour Flash Sale - 40% Off",
    "code": "FLASH40",
    "startTime": "2026-02-21T00:00:00.000Z",
    "endTime": "2026-02-21T23:59:59.000Z",
    "specification": {
      "percentOffAmount": 40,
      "scope": {
        "namespace": "stores"
      }
    },
    "usageLimit": 500
  }
}'
```

### First-Time Customer

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Welcome - 15% Off First Order",
    "code": "WELCOME15",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "percentOffAmount": 15,
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

### Clearance Sale

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Clearance - 60% Off Final Sale Items",
    "code": "CLEAR60",
    "startTime": "2026-02-21T00:00:00.000Z",
    "endTime": "2026-03-31T23:59:59.000Z",
    "specification": {
      "percentOffAmount": 60,
      "scope": {
        "namespace": "stores",
        "group": {
          "entityType": "COLLECTION",
          "entityIds": ["collection-clearance"]
        }
      }
    }
  }
}'
```

### VIP Customer Exclusive

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "VIP Exclusive - $50 Off $200+",
    "code": "VIP50",
    "startTime": "2026-02-21T00:00:00.000Z",
    "specification": {
      "moneyOffAmount": "50.00",
      "scope": {
        "namespace": "stores"
      },
      "minimumSubtotal": "200.00"
    }
  }
}'
```

### Abandoned Cart Recovery

```bash
curl -X POST "https://www.wixapis.com/stores/v2/coupons" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "coupon": {
    "name": "Come Back - 10% Off Your Cart",
    "code": "COMEBACK10",
    "startTime": "2026-02-21T00:00:00.000Z",
    "endTime": "2026-02-28T23:59:59.000Z",
    "specification": {
      "percentOffAmount": 10,
      "scope": {
        "namespace": "stores"
      }
    }
  }
}'
```

## Conflict Detection

### Check for Overlapping Campaigns

```bash
#!/bin/bash

# Get all active coupons
active_coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"expired\": false, \"active\": true}", "paging": {"limit": 100}}}')

count=$(echo "$active_coupons" | jq '.coupons | length')

echo "Active coupons: $count"

if [ "$count" -ge 3 ]; then
  echo "⚠️  WARNING: $count active coupons may cause confusion"
  echo "Consider consolidating overlapping promotions"
fi

# Show coupon details
echo "$active_coupons" | jq -r '.coupons[] | "- \(.code): \(.specification | if .percentOffAmount then "\(.percentOffAmount)% off" elif .moneyOffAmount then "$\(.moneyOffAmount) off" else "Special offer" end)"'
```

### Detect Discount Stacking Issues

```bash
#!/bin/bash

# Check if multiple percentage discounts are active
active_coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"expired\": false, \"active\": true}", "paging": {"limit": 100}}}')

percent_discounts=$(echo "$active_coupons" | jq '[.coupons[] | select(.specification.percentOffAmount != null)] | length')

if [ "$percent_discounts" -ge 2 ]; then
  echo "⚠️  ALERT: Multiple percentage discounts active"
  echo "Customers may attempt to stack discounts"
  echo ""
  echo "$active_coupons" | jq -r '.coupons[] | select(.specification.percentOffAmount != null) | "- \(.code): \(.specification.percentOffAmount)%"'
fi
```

## Margin Math Calculations

### Calculate Effective Margin After Discount

```bash
#!/bin/bash

# Input variables
COST=10.00
PRICE=29.99
DISCOUNT_PERCENT=20

# Calculate margin before discount
margin_before=$(echo "scale=2; (($PRICE - $COST) / $PRICE) * 100" | bc)

# Calculate price after discount
price_after=$(echo "scale=2; $PRICE * (100 - $DISCOUNT_PERCENT) / 100" | bc)

# Calculate margin after discount
margin_after=$(echo "scale=2; (($price_after - $COST) / $price_after) * 100" | bc)

echo "Product Analysis:"
echo "- Cost: \$$COST"
echo "- Price: \$$PRICE"
echo "- Discount: $DISCOUNT_PERCENT%"
echo "- Price after discount: \$$price_after"
echo ""
echo "Margin Analysis:"
echo "- Before discount: ${margin_before}%"
echo "- After discount: ${margin_after}%"
echo "- Margin reduction: $(echo "scale=2; $margin_before - $margin_after" | bc)%"
```

### Maximum Safe Discount Calculator

```bash
#!/bin/bash

# Input: Target minimum margin %
COST=10.00
PRICE=29.99
TARGET_MARGIN=30

# Calculate maximum discount to maintain target margin
# Formula: max_discount = 100 - ((cost / (1 - target_margin/100)) / price * 100)
max_price_for_margin=$(echo "scale=2; $COST / (1 - $TARGET_MARGIN/100)" | bc)
max_discount=$(echo "scale=2; 100 - ($max_price_for_margin / $PRICE * 100)" | bc)

echo "Safe Discount Calculator:"
echo "- Cost: \$$COST"
echo "- Price: \$$PRICE"
echo "- Target margin: $TARGET_MARGIN%"
echo ""
echo "Result: Maximum safe discount = ${max_discount}%"
echo "Price after max discount: \$$max_price_for_margin"
```

### Discount Impact on Revenue

```bash
#!/bin/bash

# Scenario analysis: What if we apply 20% discount?
AVG_ORDER_VALUE=100.00
ORDERS_PER_DAY=10
DISCOUNT_PERCENT=20
EXPECTED_LIFT=30  # Expected % increase in orders

# Calculate current revenue
current_revenue=$(echo "scale=2; $AVG_ORDER_VALUE * $ORDERS_PER_DAY * 30" | bc)

# Calculate discounted AOV
discounted_aov=$(echo "scale=2; $AVG_ORDER_VALUE * (100 - $DISCOUNT_PERCENT) / 100" | bc)

# Calculate new order volume
new_orders=$(echo "scale=2; $ORDERS_PER_DAY * (100 + $EXPECTED_LIFT) / 100" | bc)

# Calculate new revenue
new_revenue=$(echo "scale=2; $discounted_aov * $new_orders * 30" | bc)

# Calculate difference
revenue_diff=$(echo "scale=2; $new_revenue - $current_revenue" | bc)

echo "Discount Impact Analysis (30 days):"
echo ""
echo "Current State:"
echo "- AOV: \$$AVG_ORDER_VALUE"
echo "- Orders/day: $ORDERS_PER_DAY"
echo "- Monthly revenue: \$$current_revenue"
echo ""
echo "With $DISCOUNT_PERCENT% Discount:"
echo "- New AOV: \$$discounted_aov"
echo "- Expected orders/day: $new_orders (+$EXPECTED_LIFT%)"
echo "- Projected revenue: \$$new_revenue"
echo ""
echo "Impact: \$$revenue_diff ($(echo "scale=2; $revenue_diff / $current_revenue * 100" | bc)%)"
```

## Discount Performance Analysis

### Coupon Usage Report

```bash
#!/bin/bash

# Get all coupons sorted by usage
coupons=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"sort": "{\"usageCount\": \"desc\"}", "paging": {"limit": 50}}}')

echo "COUPON PERFORMANCE REPORT"
echo "=" | head -c 80
echo ""
echo "Code | Name | Usage | Status"
echo "-" | head -c 80
echo ""

echo "$coupons" | jq -r '.coupons[] | "\(.code) | \(.name) | \(.usageCount // 0) | \(if .expired then "Expired" elif .active then "Active" else "Inactive" end)"'
```

### Identify Underperforming Coupons

```bash
#!/bin/bash

# Find active coupons with low usage
underperforming=$(curl -s -X POST "https://www.wixapis.com/stores/v2/coupons/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"expired\": false, \"active\": true, \"usageCount\": {\"$lte\": 5}}",
    "paging": {"limit": 50}
  }
}')

count=$(echo "$underperforming" | jq '.coupons | length')

if [ "$count" -gt 0 ]; then
  echo "⚠️  Found $count underperforming coupons:"
  echo ""
  echo "$underperforming" | jq -r '.coupons[] | "- \(.code) (\(.name)): \(.usageCount // 0) uses"'
  echo ""
  echo "Consider: Promoting these codes or discontinuing them"
fi
```

## Best Practices

### 1. Discount Hierarchy

**Recommended priority:**

1. Free Shipping (low margin impact, high conversion)
2. Percentage Off (10-20% for general promos)
3. Fixed Amount Off (for high AOV orders)
4. Deep Discounts (30-60% for clearance only)

### 2. Minimum Subtotal Guidelines

```bash
# Formula: Minimum subtotal should be 3-5× discount amount
DISCOUNT_AMOUNT=20
MIN_SUBTOTAL=$(echo "$DISCOUNT_AMOUNT * 4" | bc)

echo "For a \$$DISCOUNT_AMOUNT discount, set minimum subtotal: \$$MIN_SUBTOTAL"
```

### 3. Active Coupon Limits

**Recommendation**: Keep active coupons to 2-3 maximum

- 1 general site-wide promotion
- 1 targeted collection/product promotion
- 1 customer acquisition (first-time buyer)

### 4. Expiration Best Practices

- Flash sales: 24-48 hours
- Seasonal: 30-60 days
- Welcome offers: No expiration (usage-limited)
- Abandoned cart: 7-14 days

## Documentation References

- Coupons API Overview: https://dev.wix.com/docs/rest/business-management/marketing/coupons/coupons/introduction
- Create Coupon: https://dev.wix.com/api/rest/coupons/coupons/create-coupon
- Query Coupons: https://dev.wix.com/api/rest/coupons/coupons/query-coupons
- Update Coupon: https://dev.wix.com/api/rest/coupons/coupons/update-coupon
- Use Cases: https://dev.wix.com/api/rest/coupons/coupons/use-cases
- About Wix Coupons: https://dev.wix.com/api/rest/coupons/about-wix-coupons
