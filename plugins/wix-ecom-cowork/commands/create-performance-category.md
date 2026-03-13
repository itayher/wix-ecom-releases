# Create Performance Category - Flexible Sales-Based Dynamic Categories

Create categories based on various performance metrics from order analytics. Supports multiple ranking criteria, time periods, and product counts.

## Command Pattern

```
Create category with top 20 products by units sold from last week
Create "Trending" category with top 10 products by revenue from last 7 days
Make a "High Profit" category with top 15 products by margin from last month
Create "Most Popular" category with top 30 products by order count from last 90 days
Create "New Bestsellers" category with top 25 products from last 14 days ranked by revenue
```

## Purpose

Dynamically create categories based on actual sales performance using flexible criteria. Perfect for showcasing bestsellers, trending items, high-revenue products, frequently purchased items, or high-margin products.

## Skills Referenced

- **order-analytics**: Product sales aggregation, ranking, and performance metrics
- **category-management**: Category creation and product assignment
- **product-graphql**: Product queries and details
- **analytics-insights**: Business metrics and calculations
- **wix-api-core**: Authentication

## Supported Ranking Metrics

### 1. By Units Sold (Volume)
**Best for**: "Bestsellers", "Most Popular", "Customer Favorites"
```bash
sort_by(-.unitsSold)
```

### 2. By Revenue (Dollar Value)
**Best for**: "Top Revenue", "Biggest Earners", "Revenue Stars"
```bash
sort_by(-.revenue)
```

### 3. By Order Count (Purchase Frequency)
**Best for**: "Frequently Bought", "Repeat Purchases", "Staples"
```bash
sort_by(-.orderCount)
```

### 4. By Profit Margin (Profitability)
**Best for**: "High Margin", "Profit Leaders", "Best ROI"
```bash
sort_by(-.profitMargin)
```

### 5. By Growth Rate (Trending)
**Best for**: "Trending Up", "Rising Stars", "Momentum"
```bash
sort_by(-.growthRate)
```

## Complete Flexible Workflow

### Step 1: Parse User Intent

Extract parameters from user request:
- **Ranking metric**: units/revenue/orders/margin/growth
- **Time period**: days ago, date range
- **Product count**: top N products
- **Category name**: custom or suggested

**Example Parsing**:
```
User: "Create 'Trending' category with top 15 products by revenue from last 7 days"

Parsed:
  categoryName: "Trending"
  rankingMetric: "revenue"
  productCount: 15
  timePeriod: 7 days ago
```

### Step 2: Query Orders

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

# Parse time period
DAYS_AGO=${DAYS_AGO:-7}  # Default to 7 days
START_DATE=$(date -u -v-${DAYS_AGO}d +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || date -u -d "${DAYS_AGO} days ago" +"%Y-%m-%dT00:00:00.000Z")
END_DATE=$(date -u +"%Y-%m-%dT23:59:59.999Z")

echo "📊 Analyzing performance from last ${DAYS_AGO} days..."
echo "Period: $(echo $START_DATE | cut -d'T' -f1) to $(echo $END_DATE | cut -d'T' -f1)"
echo ""

# Query paid orders
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

total_orders=$(echo "$orders" | jq '.orders | length')
echo "✓ Analyzed ${total_orders} paid orders"
```

### Step 3: Aggregate and Rank

**Universal Aggregation** (calculates all metrics):

```bash
RANK_BY=${RANK_BY:-"unitsSold"}  # Default ranking
TOP_N=${TOP_N:-20}               # Default count

echo ""
echo "📈 Ranking products by ${RANK_BY}..."

# Get products with costs for profit calculation
products_data=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1000}}}')

# Aggregate with all metrics
top_products=$(echo "$orders" | jq --argjson products "$products_data" '
  [.orders[].lineItems[]] as $items |
  $items |
  group_by(.catalogReference.catalogItemId) |
  map({
    productId: .[0].catalogReference.catalogItemId,
    productName: .[0].productName.original,

    # Volume metrics
    unitsSold: ([.[].quantity] | add),
    orderCount: length,

    # Revenue metrics
    revenue: ([.[].lineItemPrice | tonumber] | add),
    avgOrderValue: (([.[].lineItemPrice | tonumber] | add) / length),

    # Profit metrics (if cost data available)
    cost: (
      $products.products[] |
      select(.id == (.[0].catalogReference.catalogItemId)) |
      .cost.price // 0
    ),

    # Calculate profit margin
    profitMargin: (
      (.[0].lineItemPrice | tonumber) -
      (
        $products.products[] |
        select(.id == (.[0].catalogReference.catalogItemId)) |
        .cost.price // 0
      )
    )
  }) |

  # Sort by specified metric
  if "'$RANK_BY'" == "revenue" then
    sort_by(-.revenue)
  elif "'$RANK_BY'" == "orderCount" then
    sort_by(-.orderCount)
  elif "'$RANK_BY'" == "profitMargin" then
    sort_by(-.profitMargin)
  elif "'$RANK_BY'" == "avgOrderValue" then
    sort_by(-.avgOrderValue)
  else
    sort_by(-.unitsSold)
  end |

  .[:'"$TOP_N"']
')

# Display results
echo "$top_products" | jq -r '
  to_entries |
  .[] |
  if "'$RANK_BY'" == "revenue" then
    "\(.key + 1). \(.value.productName)\n   Revenue: $\(.value.revenue | round) | Units: \(.value.unitsSold) | Orders: \(.value.orderCount)"
  elif "'$RANK_BY'" == "orderCount" then
    "\(.key + 1). \(.value.productName)\n   Orders: \(.value.orderCount) | Units: \(.value.unitsSold) | Revenue: $\(.value.revenue | round)"
  elif "'$RANK_BY'" == "profitMargin" then
    "\(.key + 1). \(.value.productName)\n   Profit: $\(.value.profitMargin | round) | Units: \(.value.unitsSold) | Revenue: $\(.value.revenue | round)"
  else
    "\(.key + 1). \(.value.productName)\n   Units: \(.value.unitsSold) | Revenue: $\(.value.revenue | round) | Orders: \(.value.orderCount)"
  end
'

product_ids=$(echo "$top_products" | jq -r '.[].productId')
product_count=$(echo "$product_ids" | wc -l | tr -d ' ')

echo ""
echo "✅ Identified top ${product_count} products by ${RANK_BY}"
```

### Step 4: Create Category

```bash
CATEGORY_NAME=${CATEGORY_NAME:-"Top Performers"}  # Default name

# Generate smart description based on ranking metric
if [ "$RANK_BY" = "revenue" ]; then
  DESCRIPTION="Our highest revenue-generating products from the last ${DAYS_AGO} days. These items drive the most sales dollars."
elif [ "$RANK_BY" = "orderCount" ]; then
  DESCRIPTION="Most frequently purchased products from the last ${DAYS_AGO} days. Customer staples that keep selling."
elif [ "$RANK_BY" = "profitMargin" ]; then
  DESCRIPTION="Highest profit margin products from the last ${DAYS_AGO} days. Our most profitable items."
else
  DESCRIPTION="Best-selling products from the last ${DAYS_AGO} days. Our most popular items by units sold."
fi

echo ""
echo "🏗️ Creating '${CATEGORY_NAME}' category..."

category_response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"collection\": {
    \"name\": \"${CATEGORY_NAME}\",
    \"description\": \"${DESCRIPTION}\",
    \"visible\": false
  }
}")

CATEGORY_ID=$(echo "$category_response" | jq -r '.collection.id')

if [ "$CATEGORY_ID" = "null" ] || [ -z "$CATEGORY_ID" ]; then
  echo "❌ Failed to create category"
  exit 1
fi

echo "✅ Created: ${CATEGORY_ID}"
```

### Step 5: Bulk Assign Products

```bash
echo ""
echo "📦 Adding ${product_count} products to ${CATEGORY_NAME}..."

assigned=0
failed=0

echo "$product_ids" | while read -r product_id; do
  if [ -z "$product_id" ] || [ "$product_id" = "null" ]; then
    continue
  fi

  product_name=$(echo "$top_products" | jq -r --arg id "$product_id" '.[] | select(.productId == $id) | .productName')

  # Get current categories
  current_product=$(curl -s -X GET "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}")

  current_categories=$(echo "$current_product" | jq -r '.product.collectionIds // []')

  # Add new category to existing list
  updated_categories=$(echo "$current_categories" | jq ". + [\"${CATEGORY_ID}\"] | unique")

  # Update product
  update_response=$(curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"product\": {
      \"id\": \"${product_id}\",
      \"collectionIds\": ${updated_categories}
    }
  }")

  if echo "$update_response" | jq -e '.product.id' > /dev/null 2>&1; then
    echo "  ✅ ${product_name}"
    assigned=$((assigned + 1))
  else
    failed=$((failed + 1))
  fi

  sleep 0.2
done

echo ""
echo "✅ Assigned ${assigned} products"
```

### Step 6: Publish Category

```bash
echo ""
echo "🌟 Publishing category..."

curl -s -X PATCH "https://www.wixapis.com/stores/v1/collections/${CATEGORY_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {"visible": true}
}' > /dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Performance Category Created!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Category: ${CATEGORY_NAME}"
echo "Products: ${assigned} items"
echo "Ranked by: ${RANK_BY}"
echo "Period: Last ${DAYS_AGO} days"
echo "Status: Live"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Use Case Examples

### Example 1: Bestsellers by Volume

```
User: "Create bestsellers category with top 20 products by units sold from last week"

Parameters:
  CATEGORY_NAME = "Bestsellers"
  RANK_BY = "unitsSold"
  TOP_N = 20
  DAYS_AGO = 7

Result:
  ✅ Category "Bestsellers" with 20 highest-volume products
```

### Example 2: Top Revenue Generators

```
User: "Create 'Revenue Stars' category with top 15 products by revenue from last 30 days"

Parameters:
  CATEGORY_NAME = "Revenue Stars"
  RANK_BY = "revenue"
  TOP_N = 15
  DAYS_AGO = 30

Result:
  ✅ Category "Revenue Stars" with 15 highest-revenue products
```

### Example 3: Frequently Purchased

```
User: "Make 'Customer Staples' category with top 25 products by order count from last month"

Parameters:
  CATEGORY_NAME = "Customer Staples"
  RANK_BY = "orderCount"
  TOP_N = 25
  DAYS_AGO = 30

Result:
  ✅ Category "Customer Staples" with 25 most frequently ordered products
```

### Example 4: High Profit Items

```
User: "Create 'Premium Picks' category with top 10 products by profit margin from last quarter"

Parameters:
  CATEGORY_NAME = "Premium Picks"
  RANK_BY = "profitMargin"
  TOP_N = 10
  DAYS_AGO = 90

Result:
  ✅ Category "Premium Picks" with 10 highest-margin products
```

### Example 5: Trending Items

```
User: "Create 'Trending Now' category with top 12 products from last 3 days"

Parameters:
  CATEGORY_NAME = "Trending Now"
  RANK_BY = "unitsSold"
  TOP_N = 12
  DAYS_AGO = 3

Result:
  ✅ Category "Trending Now" with 12 hot-selling recent items
```

## Advanced Options

### Combined Metrics

Rank by composite score (units × average price):

```bash
# Calculate composite performance score
top_products=$(echo "$orders" | jq '
  [.orders[].lineItems[]] |
  group_by(.catalogReference.catalogItemId) |
  map({
    productId: .[0].catalogReference.catalogItemId,
    productName: .[0].productName.original,
    unitsSold: ([.[].quantity] | add),
    revenue: ([.[].lineItemPrice | tonumber] | add),
    avgPrice: (([.[].lineItemPrice | tonumber] | add) / ([.[].quantity] | add)),
    performanceScore: (([.[].quantity] | add) * (([.[].lineItemPrice | tonumber] | add) / ([.[].quantity] | add)))
  }) |
  sort_by(-.performanceScore) |
  .[:'"$TOP_N"']
')
```

### Weighted Ranking

Balance multiple factors:

```bash
# 50% units, 30% revenue, 20% order count
performanceScore: (
  (.unitsSold * 0.5) +
  ((.revenue / 100) * 0.3) +
  (.orderCount * 0.2)
)
```

### Minimum Thresholds

Only include products that meet minimums:

```bash
# Only products with 10+ units sold
select(.unitsSold >= 10)

# Only products with $500+ revenue
select(.revenue >= 500)

# Only products in 5+ orders
select(.orderCount >= 5)
```

## Smart Category Naming

AI suggests category names based on ranking metric:

| Ranking Metric | Suggested Names |
|----------------|-----------------|
| **unitsSold** | Bestsellers, Most Popular, Customer Favorites, Top Sellers |
| **revenue** | Top Revenue, Biggest Earners, Revenue Leaders, Money Makers |
| **orderCount** | Frequently Bought, Customer Staples, Repeat Favorites, Essentials |
| **profitMargin** | High Margin, Profit Stars, Premium Picks, Best ROI |
| **recent** | Trending Now, Hot Items, Rising Stars, What's Hot |

## Output Format

### Analysis Summary

```
📊 Performance Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Period:        Last 7 days (Feb 20 - Feb 27)
Orders:        156 paid orders
Ranking:       By Units Sold
Showing:       Top 20 products

Top Performers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. Wireless Bluetooth Headphones
    Units: 45 | Revenue: $3,599 | Orders: 42 | Margin: 58%

 2. USB-C Fast Charger
    Units: 38 | Revenue: $759 | Orders: 35 | Margin: 62%

 3. Smart Watch Fitness Tracker
    Units: 32 | Revenue: $2,879 | Orders: 30 | Margin: 54%

[... 17 more ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Units:     428
Total Revenue:   $18,456
Avg Units/Item:  21.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Creation Progress

```
🏗️ Creating Category
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:        Bestsellers
Description: Best-selling products from the last 7 days
Products:    20 items
Status:      Creating...

📦 Assigning Products
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Wireless Bluetooth Headphones
  ✅ USB-C Fast Charger
  ✅ Smart Watch Fitness Tracker
  [... 17 more ...]

Progress: 20/20 ✅

🌟 Publishing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Category is now live in your store!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Success!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Category:    Bestsellers
URL:         /shop/bestsellers
Products:    20 top performers
Rank:        By Units Sold
Period:      Last 7 days
Status:      Live ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Parameter Reference

### Time Period Options

```bash
# Recent performance
DAYS_AGO=3    # Last 3 days (trending)
DAYS_AGO=7    # Last week
DAYS_AGO=14   # Last 2 weeks
DAYS_AGO=30   # Last month
DAYS_AGO=90   # Last quarter

# Custom date range
START_DATE="2026-02-01T00:00:00.000Z"
END_DATE="2026-02-28T23:59:59.999Z"
```

### Ranking Metrics

```bash
RANK_BY="unitsSold"        # Volume (default)
RANK_BY="revenue"          # Dollar value
RANK_BY="orderCount"       # Purchase frequency
RANK_BY="profitMargin"     # Profitability
RANK_BY="avgOrderValue"    # High-value items
RANK_BY="performanceScore" # Composite score
```

### Product Count

```bash
TOP_N=10    # Top 10
TOP_N=20    # Top 20 (default)
TOP_N=30    # Top 30
TOP_N=50    # Top 50
TOP_N=100   # Top 100
```

### Category Names

```bash
CATEGORY_NAME="Bestsellers"
CATEGORY_NAME="Trending Now"
CATEGORY_NAME="Customer Favorites"
CATEGORY_NAME="Top Revenue"
CATEGORY_NAME="High Margin"
CATEGORY_NAME="Frequently Bought"
CATEGORY_NAME="This Week's Hits"
```

## Automation & Scheduling

### Weekly Refresh

Run weekly to keep category updated:

```bash
#!/bin/bash
# weekly-bestsellers-refresh.sh

echo "🔄 Refreshing Bestsellers category..."

# 1. Query last 7 days
# 2. Rank top 20 products
# 3. Get current "Bestsellers" category
# 4. Clear existing products
# 5. Add new top 20
# 6. Report changes

echo "✅ Bestsellers refreshed with this week's data!"
```

### Multi-Category Strategy

Create multiple performance categories:

```bash
# Bestsellers (by volume)
CATEGORY_NAME="Bestsellers" RANK_BY="unitsSold" TOP_N=20 DAYS_AGO=7

# Top Revenue (by dollars)
CATEGORY_NAME="Top Revenue" RANK_BY="revenue" TOP_N=15 DAYS_AGO=30

# Trending (recent + volume)
CATEGORY_NAME="Trending Now" RANK_BY="unitsSold" TOP_N=10 DAYS_AGO=3

# Profit Leaders (by margin)
CATEGORY_NAME="Premium Picks" RANK_BY="profitMargin" TOP_N=12 DAYS_AGO=30
```

## Example Conversations

### Interactive Mode

```
User: "Create a performance category"

Claude:
  Let me help you create a data-driven category!

  1. What should we rank by?
     • Units Sold (volume - most popular)
     • Revenue (highest earning)
     • Order Count (most frequently bought)
     • Profit Margin (most profitable)

  You: Units sold

  2. How many products?
     • Top 10
     • Top 20 (recommended)
     • Top 30
     • Custom number

  You: Top 20

  3. Time period?
     • Last 3 days (trending)
     • Last week (current hits)
     • Last month (consistent sellers)
     • Custom range

  You: Last week

  4. Category name?
     Suggested: "Bestsellers", "Weekly Favorites", "Hot Items"

  You: Bestsellers

  Perfect! Creating category with:
  - Top 20 products
  - By units sold
  - From last 7 days
  - Named "Bestsellers"

  Proceed? (yes/no)

User: yes

Claude:
  📊 Analyzing 156 orders...
  ✅ Ranked top 20 products
  🏗️ Created category
  📦 Assigned all products
  ✅ Category is live!
```

## Related Commands

- `/wix:orders` - Order analysis
- `/wix:analytics` - Business intelligence
- `/wix:categories` - Category management
- `/wix:create-category-ai` - AI text-based categorization
- `/wix:revenue-report` - Revenue analysis
