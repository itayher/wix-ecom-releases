# Store Analysis - Comprehensive Store Audit

## Overview

End-to-end store audit workflows, health scoring, and actionable insights combining product quality, inventory health, and pricing strategy.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Complete Store Health Audit

### Full Store Health Check

```bash
#!/bin/bash

echo "======================================"
echo "   WIX STORE COMPREHENSIVE AUDIT"
echo "======================================"
echo ""
echo "Site: ${SITE_ID}"
echo "Date: $(date)"
echo ""

# 1. CATALOG HEALTH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CATALOG HEALTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

total_products=$(echo "$products" | jq '.products | length')
missing_images=$(echo "$products" | jq '[.products[] | select(.media.mainMedia.image == null)] | length')
missing_descriptions=$(echo "$products" | jq '[.products[] | select(.description == null or (.description | length) < 50)] | length')
missing_prices=$(echo "$products" | jq '[.products[] | select(.price == null or (.price | tonumber) == 0)] | length')

catalog_score=$(echo "scale=0; (($total_products - $missing_images - $missing_descriptions - $missing_prices) / $total_products * 100)" | bc)

echo "Total Products: $total_products"
echo "Missing Images: $missing_images"
echo "Missing Descriptions: $missing_descriptions"
echo "Missing/Zero Prices: $missing_prices"
echo ""
echo "Catalog Health Score: ${catalog_score}%"

if [ "$catalog_score" -ge 80 ]; then
  echo "Status: ✅ EXCELLENT"
elif [ "$catalog_score" -ge 60 ]; then
  echo "Status: ⚠️  GOOD - Some improvements needed"
elif [ "$catalog_score" -ge 40 ]; then
  echo "Status: ⚠️  FAIR - Significant improvements needed"
else
  echo "Status: ❌ POOR - Urgent attention required"
fi

echo ""

# 2. INVENTORY HEALTH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. INVENTORY HEALTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

low_stock=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) <= 10 and (.stock.quantity // 0) > 0)] | length')
out_of_stock=$(echo "$products" | jq '[.products[] | select(.stock.inStock == false and .visible == true)] | length')
not_tracking=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == false)] | length')

inventory_issues=$((low_stock + out_of_stock))
inventory_score=$(echo "scale=0; ((($total_products - $inventory_issues) / $total_products) * 100)" | bc)

echo "Products Tracking Inventory: $(($total_products - $not_tracking))"
echo "Low Stock (≤10 units): $low_stock"
echo "Out of Stock: $out_of_stock"
echo "Not Tracking Inventory: $not_tracking"
echo ""
echo "Inventory Health Score: ${inventory_score}%"

if [ "$inventory_score" -ge 90 ]; then
  echo "Status: ✅ EXCELLENT"
elif [ "$inventory_score" -ge 70 ]; then
  echo "Status: ⚠️  GOOD"
else
  echo "Status: ❌ NEEDS ATTENTION"
fi

echo ""

# 3. PRICING STRATEGY
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. PRICING STRATEGY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

avg_price=$(echo "$products" | jq '[.products[].price | tonumber] | add / length')
min_price=$(echo "$products" | jq '[.products[].price | tonumber] | min')
max_price=$(echo "$products" | jq '[.products[].price | tonumber] | max')

price_range_low=$(echo "$products" | jq '[.products[] | select((.price | tonumber) < 20)] | length')
price_range_mid=$(echo "$products" | jq '[.products[] | select((.price | tonumber) >= 20 and (.price | tonumber) < 100)] | length')
price_range_high=$(echo "$products" | jq '[.products[] | select((.price | tonumber) >= 100)] | length')

echo "Average Product Price: \$$avg_price"
echo "Price Range: \$$min_price - \$$max_price"
echo ""
echo "Price Distribution:"
echo "  Budget (<\$20): $price_range_low products"
echo "  Mid-range (\$20-\$99): $price_range_mid products"
echo "  Premium (\$100+): $price_range_high products"

echo ""

# 4. SALES PERFORMANCE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. SALES PERFORMANCE (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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

order_count=$(echo "$orders" | jq '.orders | length')
total_revenue=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')
avg_order_value=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add / length // 0')

echo "Total Orders: $order_count"
echo "Total Revenue: \$$total_revenue"
echo "Average Order Value: \$$avg_order_value"

if [ "$order_count" -gt 100 ]; then
  echo "Status: ✅ STRONG - 100+ orders/month"
elif [ "$order_count" -gt 30 ]; then
  echo "Status: ⚠️  MODERATE - 30-100 orders/month"
elif [ "$order_count" -gt 10 ]; then
  echo "Status: ⚠️  LOW - 10-30 orders/month"
else
  echo "Status: ❌ CRITICAL - <10 orders/month"
fi

echo ""

# 5. CUSTOMER BASE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. CUSTOMER BASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1000}}}')

total_contacts=$(echo "$contacts" | jq '.pagingMetadata.total')

# Customer purchase frequency
unique_customers=$(echo "$orders" | jq '[.orders[].buyerInfo.email] | unique | length')
repeat_customers=$(echo "$orders" | jq '[.orders[] | .buyerInfo.email] | group_by(.) | map(select(length > 1)) | length')
repeat_rate=$(echo "scale=2; $repeat_customers / $unique_customers * 100" | bc)

echo "Total Contacts: $total_contacts"
echo "Unique Customers (30d): $unique_customers"
echo "Repeat Customers: $repeat_customers"
echo "Repeat Purchase Rate: ${repeat_rate}%"

if (( $(echo "$repeat_rate > 30" | bc -l) )); then
  echo "Status: ✅ EXCELLENT - Strong loyalty"
elif (( $(echo "$repeat_rate > 15" | bc -l) )); then
  echo "Status: ⚠️  GOOD - Building loyalty"
else
  echo "Status: ⚠️  LOW - Focus on retention"
fi

echo ""

# 6. OVERALL STORE HEALTH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. OVERALL STORE HEALTH SCORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

overall_score=$(echo "scale=0; ($catalog_score + $inventory_score) / 2" | bc)

echo "Catalog: ${catalog_score}%"
echo "Inventory: ${inventory_score}%"
echo ""
echo "OVERALL SCORE: ${overall_score}%"

if [ "$overall_score" -ge 80 ]; then
  echo "Status: ✅ EXCELLENT"
elif [ "$overall_score" -ge 60 ]; then
  echo "Status: ⚠️  GOOD"
elif [ "$overall_score" -ge 40 ]; then
  echo "Status: ⚠️  FAIR"
else
  echo "Status: ❌ POOR"
fi

echo ""
echo "======================================"
echo "        END OF AUDIT REPORT"
echo "======================================"
```

## Product Quality Deep Dive

### Identify Top 10 Products Needing Attention

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

echo "TOP 10 PRODUCTS NEEDING ATTENTION"
echo "=================================="
echo ""

echo "$products" | jq -r '
  [.products[] | {
    name,
    price: (.price // 0 | tonumber),
    quality_score: (
      (if (.description // "" | length) >= 50 then 30 else 0 end) +
      (if .media.mainMedia.image != null then 30 else 0 end) +
      (if (.price // 0 | tonumber) > 0 then 20 else 0 end) +
      (if .sku != null and .sku != "" then 10 else 0 end) +
      (if .brand != null and .brand != "" then 10 else 0 end)
    ),
    issues: [
      (if (.description == null or (.description | length) < 50) then "No/short description" else null end),
      (if .media.mainMedia.image == null then "No image" else null end),
      (if (.price // 0 | tonumber) == 0 then "No price" else null end),
      (if .sku == null or .sku == "" then "No SKU" else null end)
    ] | map(select(. != null))
  }] |
  sort_by(.quality_score) |
  .[:10] |
  to_entries |
  .[] |
  "\(.key + 1). \(.value.name) (Score: \(.value.quality_score)/100)",
  "   Issues: \(.value.issues | join(", "))",
  ""
'
```

## Inventory Optimization

### Calculate Inventory Turnover Rate

```bash
#!/bin/bash

# Get products with inventory
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": true}", "paging": {"limit": 100}}}')

# Get sales data (last 90 days)
START_DATE=$(date -u -v-90d +"%Y-%m-%dT00:00:00.000Z")
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

echo "INVENTORY TURNOVER ANALYSIS"
echo "==========================="
echo ""

# Calculate total inventory value
total_inventory_value=$(echo "$products" | jq '[.products[] | (.price | tonumber) * (.stock.quantity // 0)] | add')

# Calculate COGS (cost of goods sold)
total_cogs=$(echo "$orders" | jq '[.orders[].priceSummary.subtotal | tonumber] | add // 0')

# Annualize COGS (90 days → 365 days)
annualized_cogs=$(echo "$total_cogs * 365 / 90" | bc)

# Calculate turnover rate
turnover_rate=$(echo "scale=2; $annualized_cogs / $total_inventory_value" | bc)

echo "Total Inventory Value: \$$total_inventory_value"
echo "90-Day COGS: \$$total_cogs"
echo "Annualized COGS: \$$annualized_cogs"
echo ""
echo "Inventory Turnover Rate: ${turnover_rate}x per year"

if (( $(echo "$turnover_rate > 4" | bc -l) )); then
  echo "Status: ✅ EXCELLENT - Healthy turnover"
elif (( $(echo "$turnover_rate > 2" | bc -l) )); then
  echo "Status: ⚠️  GOOD - Acceptable turnover"
else
  echo "Status: ❌ SLOW - Too much dead inventory"
fi
```

## Revenue Analysis

### Monthly Revenue Trend

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

echo "MONTHLY REVENUE TREND"
echo "===================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {
    month: (.dateCreated | split("T")[0] | split("-") | "\(.[0])-\(.[1])"),
    revenue: (.priceSummary.total | tonumber)
  }] |
  group_by(.month) |
  map({
    month: .[0].month,
    orders: length,
    revenue: ([.[].revenue] | add)
  }) |
  sort_by(.month) |
  reverse |
  .[:6] |
  .[] |
  "\(.month): \(.orders) orders | $\(.revenue) revenue"
'
```

## Pricing Strategy Analysis

### Price Point Performance

```bash
#!/bin/bash

# Get all products and orders
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "paging": {"limit": 1000}}}')

echo "PRICE POINT PERFORMANCE"
echo "======================="
echo ""

# Extract sales by product
echo "$orders" | jq -r --argjson products "$(echo "$products" | jq '.products')" '
  [.orders[].lineItems[]] |
  group_by(.productId) |
  map({
    product_id: .[0].productId,
    product_name: .[0].productName,
    units_sold: ([.[].quantity] | add),
    revenue: ([.[].lineItemPrice | tonumber] | add)
  }) |
  # Add price from products
  map(. + {
    price: ($products[] | select(.id == .product_id) | .price | tonumber)
  }) |
  # Group by price range
  group_by(
    if .price < 20 then "Budget (<$20)"
    elif .price < 50 then "Value ($20-$49)"
    elif .price < 100 then "Mid-range ($50-$99)"
    else "Premium ($100+)"
    end
  ) |
  map({
    price_range: .[0] | if .price < 20 then "Budget (<$20)" elif .price < 50 then "Value ($20-$49)" elif .price < 100 then "Mid-range ($50-$99)" else "Premium ($100+)" end,
    products: length,
    units_sold: ([.[].units_sold] | add),
    revenue: ([.[].revenue] | add)
  }) |
  .[] |
  "\(.price_range): \(.products) products | \(.units_sold) units sold | $\(.revenue) revenue"
'
```

## Actionable Recommendations

### Generate Action Plan

```bash
#!/bin/bash

echo "RECOMMENDED ACTIONS"
echo "==================="
echo ""

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

# 1. Catalog issues
missing_images=$(echo "$products" | jq '[.products[] | select(.media.mainMedia.image == null)] | length')
missing_descriptions=$(echo "$products" | jq '[.products[] | select(.description == null or (.description | length) < 50)] | length')

if [ "$missing_images" -gt 0 ]; then
  echo "📷 PRIORITY 1: Add images to $missing_images products"
fi

if [ "$missing_descriptions" -gt 0 ]; then
  echo "📝 PRIORITY 2: Write descriptions for $missing_descriptions products"
fi

# 2. Inventory issues
low_stock=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) <= 10 and (.stock.quantity // 0) > 0)] | length')
out_of_stock=$(echo "$products" | jq '[.products[] | select(.stock.inStock == false and .visible == true)] | length')

if [ "$low_stock" -gt 0 ]; then
  echo "📦 PRIORITY 3: Reorder $low_stock products with low stock"
fi

if [ "$out_of_stock" -gt 0 ]; then
  echo "⚠️  URGENT: $out_of_stock products are out of stock but still visible"
fi

# 3. SEO issues
no_seo=$(echo "$products" | jq '[.products[] | select(.seoData == null or .seoData.tags == null)] | length')

if [ "$no_seo" -gt 0 ]; then
  echo "🔍 PRIORITY 4: Add SEO metadata to $no_seo products"
fi

echo ""
echo "Run individual audits for detailed action items."
```

## Store Comparison (Multi-Period)

### Compare This Month vs Last Month

```bash
#!/bin/bash

# Current month
CURRENT_START=$(date -u +"%Y-%m-01T00:00:00.000Z")
CURRENT_END=$(date -u +"%Y-%m-%dT23:59:59.999Z")

# Previous month
PREV_START=$(date -u -v-1m +"%Y-%m-01T00:00:00.000Z")
PREV_END=$(date -u -v-1m +"%Y-%m-%dT23:59:59.999Z")

current=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$CURRENT_START\\\", \\\"\\$lte\\\": \\\"$CURRENT_END\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

previous=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$PREV_START\\\", \\\"\\$lte\\\": \\\"$PREV_END\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

current_orders=$(echo "$current" | jq '.orders | length')
previous_orders=$(echo "$previous" | jq '.orders | length')
current_revenue=$(echo "$current" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')
previous_revenue=$(echo "$previous" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')

order_growth=$(echo "scale=2; ($current_orders - $previous_orders) / $previous_orders * 100" | bc)
revenue_growth=$(echo "scale=2; ($current_revenue - $previous_revenue) / $previous_revenue * 100" | bc)

echo "MONTH-OVER-MONTH COMPARISON"
echo "==========================="
echo ""
echo "Previous Month: $previous_orders orders | \$$previous_revenue"
echo "Current Month:  $current_orders orders | \$$current_revenue"
echo ""
echo "Order Growth: $order_growth%"
echo "Revenue Growth: $revenue_growth%"
```

## Documentation References

- Store Analytics: https://support.wix.com/en/article/wix-analytics-viewing-your-stores-analytics
- Best Practices: https://support.wix.com/en/article/wix-stores-best-practices-for-your-online-store
- Product Optimization: https://support.wix.com/en/article/wix-stores-optimizing-your-product-pages
