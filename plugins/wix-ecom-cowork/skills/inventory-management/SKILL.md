# Inventory Management - Wix Stores API

## Overview

Complete inventory tracking, stock updates, ABC analysis patterns, and slow-mover detection using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Get Inventory Items

### Query All Inventory Items

**Endpoint**: `POST https://www.wixapis.com/stores/v2/inventoryItems/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v2/inventoryItems/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 100,
      "offset": 0
    }
  }
}'
```

**Response:**

```json
{
  "inventoryItems": [
    {
      "id": "inv-item-123",
      "productId": "product-abc",
      "trackQuantity": true,
      "variants": [
        {
          "variantId": "variant-001",
          "inStock": true,
          "quantity": 50
        }
      ]
    }
  ],
  "metadata": {
    "count": 100,
    "offset": 0,
    "total": 450
  }
}
```

### Get Inventory for Specific Product

```bash
curl -X GET "https://www.wixapis.com/stores/v2/inventoryItems/product/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "inventoryItem": {
    "id": "inv-item-123",
    "productId": "product-abc",
    "trackQuantity": true,
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "inStock": true,
        "quantity": 75,
        "availableForPreorder": false
      }
    ],
    "lastUpdated": "2026-02-21T10:30:00.000Z"
  }
}
```

## Update Inventory

### Update Product Inventory

**Endpoint**: `PATCH https://www.wixapis.com/stores/v2/inventoryItems/product/{productId}`

**Update Quantity:**

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "inventoryItem": {
    "trackQuantity": true,
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "quantity": 100,
        "inStock": true
      }
    ]
  }
}'
```

**Response:**

```json
{
  "inventoryItem": {
    "id": "inv-item-123",
    "productId": "product-abc",
    "trackQuantity": true,
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "inStock": true,
        "quantity": 100
      }
    ]
  }
}
```

### Update Multiple Variants Inventory

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "inventoryItem": {
    "trackQuantity": true,
    "variants": [
      {
        "variantId": "variant-001",
        "quantity": 50,
        "inStock": true
      },
      {
        "variantId": "variant-002",
        "quantity": 25,
        "inStock": true
      },
      {
        "variantId": "variant-003",
        "quantity": 0,
        "inStock": false
      }
    ]
  }
}'
```

### Mark Product as Out of Stock

```bash
curl -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "inventoryItem": {
    "trackQuantity": true,
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "quantity": 0,
        "inStock": false
      }
    ]
  }
}'
```

## Increment/Decrement Inventory

### Increment Inventory

**Endpoint**: `POST https://www.wixapis.com/stores/v2/inventoryItems/increment`

```bash
curl -X POST "https://www.wixapis.com/stores/v2/inventoryItems/increment" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "incrementData": {
    "productId": "product-abc",
    "variantId": "00000000-0000-0000-0000-000000000000",
    "quantity": 10
  }
}'
```

**Response:**

```json
{
  "inventoryItem": {
    "productId": "product-abc",
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "quantity": 85,
        "inStock": true
      }
    ]
  }
}
```

### Decrement Inventory

**Endpoint**: `POST https://www.wixapis.com/stores/v2/inventoryItems/decrement`

```bash
curl -X POST "https://www.wixapis.com/stores/v2/inventoryItems/decrement" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "decrementData": {
    "productId": "product-abc",
    "variantId": "00000000-0000-0000-0000-000000000000",
    "quantity": 5
  }
}'
```

**Response:**

```json
{
  "inventoryItem": {
    "productId": "product-abc",
    "variants": [
      {
        "variantId": "00000000-0000-0000-0000-000000000000",
        "quantity": 80,
        "inStock": true
      }
    ]
  }
}
```

## Inventory Analysis Patterns

### Find Low Stock Products

**Query products with inventory below threshold (10 units):**

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": true, \"stock.quantity\": {\"$lte\": 10}, \"stock.inStock\": true}",
    "sort": "{\"stock.quantity\": \"asc\"}",
    "paging": {"limit": 100}
  }
}'
```

**Response includes products sorted by lowest stock first:**

```json
{
  "products": [
    {
      "id": "product-001",
      "name": "Product A",
      "price": 29.99,
      "stock": {
        "trackInventory": true,
        "quantity": 3,
        "inStock": true
      }
    },
    {
      "id": "product-002",
      "name": "Product B",
      "price": 39.99,
      "stock": {
        "trackInventory": true,
        "quantity": 7,
        "inStock": true
      }
    }
  ]
}
```

### Find All Out of Stock Products

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.inStock\": false, \"visible\": true}",
    "paging": {"limit": 100}
  }
}'
```

### Find Products Not Tracking Inventory

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": false}",
    "paging": {"limit": 100}
  }
}'
```

### Find Overstocked Products

**Query products with inventory above threshold (500 units):**

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": true, \"stock.quantity\": {\"$gte\": 500}}",
    "sort": "{\"stock.quantity\": \"desc\"}",
    "paging": {"limit": 50}
  }
}'
```

## ABC Analysis Pattern

ABC analysis categorizes inventory based on value and turnover:

- **A items**: High value, 20% of products, 80% of revenue
- **B items**: Medium value, 30% of products, 15% of revenue
- **C items**: Low value, 50% of products, 5% of revenue

### Step 1: Get All Products with Stock and Price

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | {id, name, price, quantity: .stock.quantity, value: (.price * .stock.quantity)}]'
```

### Step 2: Calculate Inventory Value

```bash
#!/bin/bash

# Get all products
response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true}", "paging": {"limit": 100}}}')

# Calculate total inventory value
total_value=$(echo "$response" | jq '[.products[] | .price * .stock.quantity] | add')

echo "Total inventory value: $total_value"

# Sort products by inventory value (price × quantity)
echo "$response" | jq '[.products[] | {
  id,
  name,
  price,
  quantity: .stock.quantity,
  value: (.price * .stock.quantity),
  value_pct: ((.price * .stock.quantity) / '"$total_value"' * 100)
}] | sort_by(-.value)'
```

### Step 3: Categorize A/B/C Items

```bash
#!/bin/bash

# A items: Top 20% by value (cumulative 80% revenue)
# B items: Next 30% by value (cumulative 15% revenue)
# C items: Bottom 50% by value (cumulative 5% revenue)

response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true}", "paging": {"limit": 100}}}')

echo "$response" | jq -r '
  [.products[] | {
    id,
    name,
    price,
    quantity: .stock.quantity,
    value: (.price * .stock.quantity)
  }] |
  sort_by(-.value) |
  to_entries |
  map(. + {cumulative_pct: ([.[:(.key + 1)][] | .value.value] | add) / ([.[] | .value.value] | add) * 100}) |
  map(.value + {
    category: (
      if .cumulative_pct <= 80 then "A"
      elif .cumulative_pct <= 95 then "B"
      else "C"
      end
    ),
    cumulative_pct: (.cumulative_pct | tostring | .[0:5])
  }) |
  .[]
' | jq -s 'group_by(.category) | map({category: .[0].category, count: length, items: .})'
```

## Slow-Mover Detection

**Note**: This requires combining API data with sales analytics. Use product query + external sales data.

### Identify Products with High Stock but Low Sales

```bash
#!/bin/bash

# Get products with high inventory (>100 units)
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": true, \"stock.quantity\": {\"$gte\": 100}}",
    "sort": "{\"stock.quantity\": \"desc\"}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | {
  id,
  name,
  price,
  quantity: .stock.quantity,
  value: (.price * .stock.quantity)
}]'
```

**Recommendation**: Cross-reference with Trino analytics:

```sql
-- Get products with high stock but low 90-day sales
SELECT
  p.product_id,
  p.product_name,
  p.current_stock,
  COALESCE(s.units_sold_90d, 0) as units_sold_90d,
  p.current_stock / NULLIF(s.units_sold_90d, 0) as months_of_supply
FROM inventory_snapshot p
LEFT JOIN sales_90d s ON p.product_id = s.product_id
WHERE p.current_stock > 100
  AND COALESCE(s.units_sold_90d, 0) < 10
ORDER BY months_of_supply DESC;
```

## Reorder Point Calculation

**Formula**: `Reorder Point = (Average Daily Sales × Lead Time Days) + Safety Stock`

### Example: Calculate Reorder Points

```bash
#!/bin/bash

# Get current inventory
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true}", "paging": {"limit": 100}}}')

# Calculate reorder points (requires sales data)
# Example: Average daily sales = 2 units, Lead time = 7 days, Safety stock = 5 units
# Reorder point = (2 × 7) + 5 = 19 units

echo "$products" | jq '[.products[] | {
  id,
  name,
  current_stock: .stock.quantity,
  reorder_point: 19,
  status: (if .stock.quantity <= 19 then "REORDER NOW" else "OK" end)
}] | sort_by(.current_stock)'
```

## Bulk Inventory Updates

### Update Stock Levels for Multiple Products

```bash
#!/bin/bash

# Update inventory for multiple products
products=("product-001" "product-002" "product-003")
quantities=(50 75 100)

for i in "${!products[@]}"; do
  product_id="${products[$i]}"
  quantity="${quantities[$i]}"

  curl -s -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
      \"inventoryItem\": {
        \"trackQuantity\": true,
        \"variants\": [
          {
            \"variantId\": \"00000000-0000-0000-0000-000000000000\",
            \"quantity\": $quantity,
            \"inStock\": true
          }
        ]
      }
    }" | jq '{id: .inventoryItem.productId, quantity: .inventoryItem.variants[0].quantity}'

  sleep 0.2  # Rate limiting
done
```

### Bulk Zero Out Discontinued Products

```bash
#!/bin/bash

# Get all discontinued products (tagged as "discontinued")
discontinued=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"ribbon\": \"Discontinued\"}", "paging": {"limit": 100}}}')

# Set inventory to 0 and mark as out of stock
echo "$discontinued" | jq -r '.products[].id' | while read product_id; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "inventoryItem": {
        "trackQuantity": true,
        "variants": [
          {
            "variantId": "00000000-0000-0000-0000-000000000000",
            "quantity": 0,
            "inStock": false
          }
        ]
      }
    }' > /dev/null

  echo "Zeroed out: $product_id"
  sleep 0.2
done
```

## Inventory Reports

### Stock Valuation Report

```bash
#!/bin/bash

curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true}", "paging": {"limit": 100}}}' | \
jq -r '
  [.products[] | {
    name,
    quantity: .stock.quantity,
    price,
    value: (.price * .stock.quantity)
  }] |
  "INVENTORY VALUATION REPORT",
  "=" * 80,
  "Product Name | Quantity | Price | Total Value",
  "-" * 80,
  (.[] | "\(.name) | \(.quantity) | $\(.price) | $\(.value)"),
  "-" * 80,
  "TOTAL VALUE: $\([.[] | .value] | add)"
'
```

### Stock Movement Report

**Note**: Requires historical data. Use Trino analytics:

```sql
SELECT
  product_id,
  product_name,
  DATE(created_date) as date,
  SUM(quantity_change) as net_movement,
  SUM(CASE WHEN quantity_change > 0 THEN quantity_change ELSE 0 END) as stock_in,
  SUM(CASE WHEN quantity_change < 0 THEN ABS(quantity_change) ELSE 0 END) as stock_out
FROM inventory_transactions
WHERE created_date >= CURRENT_DATE - INTERVAL '30' DAY
GROUP BY product_id, product_name, DATE(created_date)
ORDER BY date DESC;
```

## Common Inventory Patterns

### Daily Stock Check Alert

```bash
#!/bin/bash

# Check for critical stock levels daily
critical_products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true, \"stock.quantity\": {\"$lte\": 5}}", "paging": {"limit": 100}}}')

count=$(echo "$critical_products" | jq '.products | length')

if [ "$count" -gt 0 ]; then
  echo "⚠️  ALERT: $count products at critical stock levels!"
  echo "$critical_products" | jq -r '.products[] | "- \(.name): \(.stock.quantity) units remaining"'
fi
```

### Enable Inventory Tracking for All Products

```bash
#!/bin/bash

# Get all products not tracking inventory
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": false}", "paging": {"limit": 100}}}')

# Enable tracking with default quantity
echo "$products" | jq -r '.products[].id' | while read product_id; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v2/inventoryItems/product/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "inventoryItem": {
        "trackQuantity": true,
        "variants": [
          {
            "variantId": "00000000-0000-0000-0000-000000000000",
            "quantity": 0,
            "inStock": false
          }
        ]
      }
    }' > /dev/null

  echo "Enabled tracking: $product_id"
  sleep 0.2
done
```

## Documentation References

- Inventory API Overview: https://dev.wix.com/docs/rest/business-solutions/stores/inventory/introduction
- Update Inventory: https://dev.wix.com/docs/rest/business-solutions/stores/inventory/update-inventory-variants
- Query Inventory: https://dev.wix.com/api/rest/wix-stores/inventory
- Increment Inventory: https://dev.wix.com/docs/rest/business-solutions/stores/inventory/increment-inventory
- Decrement Inventory: https://dev.wix.com/docs/rest/business-solutions/stores/inventory/decrement-inventory
- Inventory Items V3 (Preview): https://dev.wix.com/docs/rest/business-solutions/stores/catalog-v3/inventory-items-v3/introduction
