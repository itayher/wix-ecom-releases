# Wix Analytics & Business Insights

## Overview

This skill provides comprehensive patterns for calculating business metrics, conversion rates, customer lifetime value, and cross-channel analytics across eCommerce, Events, and Bookings. While Wix doesn't have a direct Analytics REST API, we can calculate powerful insights from available data.

## Key Business Metrics

### 1. Total Business Revenue

Calculate total revenue across all channels:

```bash
#!/bin/bash

echo "=== TOTAL BUSINESS REVENUE ==="
echo ""

# 1. eCommerce Revenue
ecom_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "PAID"},
    "paging": {"limit": 100}
  }
}')

ecom_revenue=$(echo "$ecom_orders" | jq '[.orders[].totals.total | tonumber] | add // 0')
ecom_count=$(echo "$ecom_orders" | jq '.orders | length')

# 2. Events Revenue
events_orders=$(curl -s -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "PAID"},
    "paging": {"limit": 100}
  }
}')

events_revenue=$(echo "$events_orders" | jq '[.orders[].netPrice.amount | tonumber] | add // 0')
events_tickets=$(echo "$events_orders" | jq '[.orders[].ticketQuantity] | add // 0')

# 3. Bookings Revenue
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "CONFIRMED"},
    "paging": {"limit": 100}
  }
}')

bookings_revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')
bookings_count=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID")] | length')

# Calculate totals
total_revenue=$(echo "$ecom_revenue + $events_revenue + $bookings_revenue" | bc)

cat <<EOF
ECOMMERCE:
- Orders: $ecom_count
- Revenue: \$$ecom_revenue

EVENTS:
- Tickets Sold: $events_tickets
- Revenue: \$$events_revenue

BOOKINGS:
- Appointments: $bookings_count
- Revenue: \$$bookings_revenue

TOTAL REVENUE: \$$total_revenue
EOF
```

### 2. Customer Lifetime Value (CLV)

Calculate average customer value:

```bash
#!/bin/bash

# Get all eCommerce orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "PAID"},
    "paging": {"limit": 100}
  }
}')

# Calculate per-customer metrics
echo "$orders" | jq -r '.orders[] | "\(.buyerInfo.email)|\(.totals.total)"' | \
  awk -F'|' '{
    customer[$1] += $2
    orders[$1]++
  }
  END {
    total_customers = 0
    total_value = 0
    total_orders = 0

    for (email in customer) {
      total_customers++
      total_value += customer[email]
      total_orders += orders[email]
    }

    avg_clv = total_value / total_customers
    avg_orders = total_orders / total_customers
    avg_order_value = total_value / total_orders

    print "=== CUSTOMER LIFETIME VALUE ==="
    print ""
    print "Total Customers: " total_customers
    print "Average CLV: $" sprintf("%.2f", avg_clv)
    print "Average Orders per Customer: " sprintf("%.1f", avg_orders)
    print "Average Order Value: $" sprintf("%.2f", avg_order_value)
  }'
```

### 3. Conversion Funnel Analysis

Track customer journey from product views to purchase:

```bash
#!/bin/bash

echo "=== CONVERSION FUNNEL ANALYSIS ==="
echo ""

# 1. Total Products (Catalog Size)
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

total_products=$(echo "$products" | jq '.products | length')

# 2. Products with Recent Orders (Conversion)
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "PAID"},
    "paging": {"limit": 100}
  }
}')

products_sold=$(echo "$orders" | jq '[.orders[].lineItems[].productId] | unique | length')
total_orders=$(echo "$orders" | jq '.orders | length')

# Calculate conversion metrics
product_conversion=$(echo "scale=2; ($products_sold / $total_products) * 100" | bc)

cat <<EOF
CATALOG:
- Total Active Products: $total_products
- Products with Sales: $products_sold
- Product Conversion Rate: ${product_conversion}%

ORDERS:
- Total Orders: $total_orders
- Products per Order: $(echo "scale=1; $products_sold / $total_orders" | bc)

INSIGHTS:
- $(echo "$total_products - $products_sold" | bc) products have no sales
- Focus on promoting low-conversion products
EOF
```

### 4. Revenue Trends & Growth

Calculate month-over-month growth:

```bash
#!/bin/bash

# Current month
current_start=$(date -u -v1d +"%Y-%m-%dT00:00:00.000Z")
current_end=$(date -u +"%Y-%m-%dT23:59:59.999Z")

# Previous month
prev_start=$(date -u -v-1m -v1d +"%Y-%m-%dT00:00:00.000Z")
prev_end=$(date -u -v-1m -v+1m -v-1d +"%Y-%m-%dT23:59:59.999Z")

# Current month revenue
current_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "PAID",
      "dateCreated": {"$gte": "'"${current_start}"'", "$lte": "'"${current_end}"'"}
    },
    "paging": {"limit": 100}
  }
}')

current_revenue=$(echo "$current_orders" | jq '[.orders[].totals.total | tonumber] | add // 0')
current_count=$(echo "$current_orders" | jq '.orders | length')

# Previous month revenue
prev_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "PAID",
      "dateCreated": {"$gte": "'"${prev_start}"'", "$lte": "'"${prev_end}"'"}
    },
    "paging": {"limit": 100}
  }
}')

prev_revenue=$(echo "$prev_orders" | jq '[.orders[].totals.total | tonumber] | add // 0')
prev_count=$(echo "$prev_orders" | jq '.orders | length')

# Calculate growth
revenue_growth=$(echo "scale=2; (($current_revenue - $prev_revenue) / $prev_revenue) * 100" | bc)
order_growth=$(echo "scale=2; (($current_count - $prev_count) / $prev_count) * 100" | bc)

cat <<EOF
=== REVENUE TRENDS ==='

CURRENT MONTH:
- Orders: $current_count
- Revenue: \$$current_revenue

PREVIOUS MONTH:
- Orders: $prev_count
- Revenue: \$$prev_revenue

GROWTH:
- Revenue Growth: ${revenue_growth}%
- Order Growth: ${order_growth}%

$([ $(echo "$revenue_growth > 0" | bc) -eq 1 ] && echo "✓ Revenue is growing!" || echo "⚠ Revenue declined")
EOF
```

### 5. Customer Acquisition Cost (CAC)

Estimate CAC by tracking new vs returning customers:

```bash
#!/bin/bash

# Get all orders
all_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "PAID"},
    "paging": {"limit": 100}
  }
}')

# Analyze customer behavior
echo "$all_orders" | jq -r '.orders[] | "\(.buyerInfo.email)|\(.dateCreated)|\(.totals.total)"' | \
  sort -t'|' -k1,1 -k2,2 | \
  awk -F'|' '
  {
    email = $1
    date = $2
    value = $3

    if (!(email in first_order)) {
      first_order[email] = date
      first_value[email] = value
      new_customers++
      new_revenue += value
    } else {
      returning_customers++
      returning_revenue += value
    }
  }
  END {
    total_customers = new_customers + returning_customers
    total_orders = NR

    print "=== CUSTOMER ACQUISITION ==="
    print ""
    print "NEW CUSTOMERS:"
    print "- Count: " new_customers
    print "- Revenue: $" sprintf("%.2f", new_revenue)
    print "- Avg First Order: $" sprintf("%.2f", new_revenue / new_customers)
    print ""
    print "RETURNING CUSTOMERS:"
    print "- Repeat Orders: " returning_customers
    print "- Revenue: $" sprintf("%.2f", returning_revenue)
    print ""
    print "RETENTION:"
    print "- Repeat Purchase Rate: " sprintf("%.1f", (returning_customers / total_orders) * 100) "%"
    print "- New vs Returning: " sprintf("%.0f", (new_customers / total_orders) * 100) "% / " sprintf("%.0f", (returning_customers / total_orders) * 100) "%"
  }'
```

### 6. Churn & Retention Analysis

Identify customer churn patterns:

```bash
#!/bin/bash

# Get orders from last 90 days
ninety_days_ago=$(date -u -v-90d +"%Y-%m-%dT00:00:00.000Z")

recent_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "PAID",
      "dateCreated": {"$gte": "'"${ninety_days_ago}"'"}
    },
    "paging": {"limit": 100}
  }
}')

# Analyze customer last purchase date
echo "$recent_orders" | jq -r '.orders[] | "\(.buyerInfo.email)|\(.dateCreated)"' | \
  awk -F'|' '
  {
    email = $1
    date = $2
    last_purchase[email] = (last_purchase[email] > date) ? last_purchase[email] : date
  }
  END {
    now = systime()
    active_30 = 0
    active_60 = 0
    at_risk = 0

    for (email in last_purchase) {
      # Convert ISO date to epoch (approximation)
      days_since = 30  # Simplified - in real implementation, calculate actual days

      if (days_since <= 30) active_30++
      else if (days_since <= 60) active_60++
      else at_risk++
    }

    total = active_30 + active_60 + at_risk

    print "=== CUSTOMER RETENTION COHORTS ==="
    print ""
    print "Active (last 30 days): " active_30 " (" int(active_30/total*100) "%)"
    print "At Risk (31-60 days): " active_60 " (" int(active_60/total*100) "%)"
    print "Churned (60+ days): " at_risk " (" int(at_risk/total*100) "%)"
    print ""
    print "⚠ " at_risk " customers may be churning - consider re-engagement campaign"
  }'
```

### 7. Product Performance Matrix

Categorize products by sales volume and revenue:

```bash
#!/bin/bash

# Get all products
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

# Get all orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"status": "PAID"}, "paging": {"limit": 100}}}')

# Calculate per-product metrics
echo "$orders" | jq -r '.orders[].lineItems[] | "\(.productId)|\(.quantity)|\(.price.amount)"' | \
  awk -F'|' '
  {
    product = $1
    qty = $2
    price = $3

    sales[product] += qty
    revenue[product] += (qty * price)
  }
  END {
    print "=== PRODUCT PERFORMANCE MATRIX ==="
    print ""
    print "Stars (High Sales, High Revenue):"
    for (p in sales) {
      if (sales[p] > 10 && revenue[p] > 500) {
        printf "  Product %s: %d units, $%.2f\n", p, sales[p], revenue[p]
      }
    }

    print "\nWorkhorses (High Sales, Lower Revenue):"
    for (p in sales) {
      if (sales[p] > 10 && revenue[p] <= 500) {
        printf "  Product %s: %d units, $%.2f\n", p, sales[p], revenue[p]
      }
    }

    print "\nNiche (Low Sales, High Revenue):"
    for (p in sales) {
      if (sales[p] <= 10 && revenue[p] > 500) {
        printf "  Product %s: %d units, $%.2f\n", p, sales[p], revenue[p]
      }
    }

    print "\nUnderperformers (Low Sales, Low Revenue):"
    for (p in sales) {
      if (sales[p] <= 10 && revenue[p] <= 500) {
        printf "  Product %s: %d units, $%.2f\n", p, sales[p], revenue[p]
      }
    }
  }'
```

### 8. Cross-Channel Customer Journey

Track customers across eCommerce, Events, and Bookings:

```bash
#!/bin/bash

echo "=== CROSS-CHANNEL CUSTOMER JOURNEY ==="
echo ""

# Get all customer emails from orders
ecom_customers=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"status": "PAID"}, "paging": {"limit": 100}}}' | \
  jq -r '.orders[].buyerInfo.email' | sort -u)

# Get event customers
event_customers=$(curl -s -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"status": "PAID"}, "paging": {"limit": 100}}}' | \
  jq -r '.orders[].contact.email' | sort -u)

# Get booking customers
booking_customers=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"status": "CONFIRMED"}, "paging": {"limit": 100}}}' | \
  jq -r '.bookings[].contactDetails.email' | sort -u)

# Analyze overlap
total_ecom=$(echo "$ecom_customers" | wc -l | tr -d ' ')
total_events=$(echo "$event_customers" | wc -l | tr -d ' ')
total_bookings=$(echo "$booking_customers" | wc -l | tr -d ' ')

# Cross-channel customers
cross_channel=$(comm -12 <(echo "$ecom_customers") <(echo "$event_customers") | wc -l | tr -d ' ')

cat <<EOF
CUSTOMER DISTRIBUTION:
- eCommerce Only: $total_ecom customers
- Events Only: $total_events customers
- Bookings Only: $total_bookings customers
- Cross-Channel: $cross_channel customers

INSIGHTS:
- Cross-channel customers are more valuable
- Consider bundling products/events/services
- Target single-channel customers with other offerings
EOF
```

### 9. Revenue per Channel per Day

Track daily performance across channels:

```bash
#!/bin/bash

TODAY=$(date -u +"%Y-%m-%d")

# eCommerce today
ecom_today=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "PAID",
      "dateCreated": {"$gte": "'"${TODAY}T00:00:00.000Z"'"}
    },
    "paging": {"limit": 100}
  }
}')

ecom_rev=$(echo "$ecom_today" | jq '[.orders[].totals.total | tonumber] | add // 0')
ecom_orders=$(echo "$ecom_today" | jq '.orders | length')

echo "=== TODAY'S REVENUE ==="
echo ""
echo "eCommerce: \$$ecom_rev ($ecom_orders orders)"
echo "Events: (query separately)"
echo "Bookings: (query separately)"
```

### 10. Conversion Rate Optimization (CRO) Metrics

Key metrics for improving conversion:

```bash
#!/bin/bash

# Products viewed (products with inventory tracking)
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

visible_products=$(echo "$products" | jq '.products | length')

# Products purchased
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"status": "PAID"}, "paging": {"limit": 100}}}')

unique_products_sold=$(echo "$orders" | jq '[.orders[].lineItems[].productId] | unique | length')
total_orders=$(echo "$orders" | jq '.orders | length')
total_items=$(echo "$orders" | jq '[.orders[].lineItems[].quantity] | add // 0')

# Calculate metrics
catalog_conversion=$(echo "scale=2; ($unique_products_sold / $visible_products) * 100" | bc)
items_per_order=$(echo "scale=1; $total_items / $total_orders" | bc)

cat <<EOF
=== CONVERSION RATE OPTIMIZATION ==='

CATALOG PERFORMANCE:
- Visible Products: $visible_products
- Products with Sales: $unique_products_sold
- Catalog Conversion: ${catalog_conversion}%

ORDER METRICS:
- Total Orders: $total_orders
- Items per Order: $items_per_order
- Cart Size Opportunity: $([ $(echo "$items_per_order < 2" | bc) -eq 1 ] && echo "Increase cross-sells" || echo "Good")

RECOMMENDATIONS:
- $([ $(echo "$catalog_conversion < 50" | bc) -eq 1 ] && echo "50% of catalog not selling - review and optimize" || echo "Catalog performing well")
- $([ $(echo "$items_per_order < 2" | bc) -eq 1 ] && echo "Add product bundles and upsells" || echo "Strong multi-item purchases")
EOF
```

## Important Notes

### Data Freshness
- All metrics calculated in real-time from API data
- No historical analytics stored by Wix APIs
- For time-series analysis, query multiple date ranges

### Calculation Accuracy
- Always use pagination to get complete datasets
- Filter by `status == "PAID"` for revenue calculations
- Handle edge cases (zero division, null values)

### Performance
- Combine multiple API calls for comprehensive reports
- Cache results for dashboards (refresh every 5-15 minutes)
- Use date filters to limit data volume

### Marketing Attribution
- Wix supports UTM parameters in URLs
- Track campaign performance via order metadata
- Integrate with Meta Pixel/Google Analytics for traffic data

## Integration Opportunities

### Google Analytics
- Connect via Wix dashboard for traffic data
- Track page views, sessions, bounce rate
- Combine with revenue data for ROI

### Meta Pixel
- Track conversions and retargeting
- Measure ad campaign effectiveness
- Calculate ROAS (Return on Ad Spend)

### Email Marketing
- Track campaign performance via UTM codes
- Measure email-to-purchase conversion
- Calculate email marketing ROI

## Business Intelligence Formulas

```bash
# Customer Lifetime Value
CLV = (Average Order Value) × (Purchase Frequency) × (Customer Lifespan)

# Customer Acquisition Cost
CAC = (Total Marketing Spend) / (New Customers Acquired)

# Return on Ad Spend
ROAS = (Revenue from Ads) / (Ad Spend)

# Gross Margin
Margin = ((Revenue - Cost of Goods) / Revenue) × 100

# Churn Rate
Churn = (Customers Lost) / (Total Customers at Start) × 100

# Net Promoter Score (requires survey data)
NPS = (% Promoters) - (% Detractors)
```

## API References

- Wix Analytics Help: https://support.wix.com/en/wix-analytics
- Marketing Integrations: https://support.wix.com/en/marketing-integrations-and-tracking
- Conversion Tracking: https://support.wix.com/en/article/about-conversion-tracking
- UTM Parameters: https://support.wix.com/en/article/tracking-campaigns-and-traffic-sources-in-wix-analytics
