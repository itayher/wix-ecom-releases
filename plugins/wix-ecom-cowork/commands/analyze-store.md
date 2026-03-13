# Analyze Store - Complete Health Analysis

Full store health analysis with comprehensive scoring across catalog, inventory, pricing, sales, and customer metrics.

## Command Pattern

```
Analyze my Wix store
Run a full store audit
Show me my store health report
What's the health of my store?
```

## Workflow

### Step 1: Validate Configuration and Site Selection

```bash
# Ensure site is selected
node -e "
const { getActiveSiteId, getActiveSiteName, listConfiguredSites } = require('./wix-store-optimizer/lib/site-storage');
const { validateConfig } = require('./lib/config-validator');

// Validate configuration
const validation = validateConfig();
if (!validation.valid) {
  console.error(validation.message);
  process.exit(1);
}

// Check if site is selected
const siteId = getActiveSiteId();
const siteName = getActiveSiteName();

if (!siteId) {
  const sites = listConfiguredSites();
  console.error('❌ No site selected. Available sites:');
  sites.forEach(s => console.error(\`  \${s.number}. \${s.siteName}\`));
  console.error('\\nPlease select a site first by asking: \"Select site 1\"');
  process.exit(1);
}

console.error(\`✓ Analyzing store: \${siteName}\`);
process.exit(0);
"
```

### Step 2: Run Complete Store Health Audit

Use the **store-analysis** skill's complete audit script:

```bash
#!/bin/bash

# Get active site
SITE_ID=$(node -e "
const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage');
console.log(getActiveSiteId());
")

API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   WIX STORE COMPREHENSIVE AUDIT"
echo "======================================"
echo ""

# 1. CATALOG HEALTH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CATALOG HEALTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

total_products=$(echo "$products" | jq '.products | length')
missing_images=$(echo "$products" | jq '[.products[] | select(.media.mainMedia.image == null)] | length')
missing_descriptions=$(echo "$products" | jq '[.products[] | select(.description == null or (.description | length) < 50)] | length')
missing_prices=$(echo "$products" | jq '[.products[] | select(.price == null or (.price | tonumber) == 0)] | length')

if [ "$total_products" -eq 0 ]; then
  echo "⚠️  No products found. Please add products to your store."
  catalog_score=0
else
  catalog_score=$(echo "scale=0; (($total_products - $missing_images - $missing_descriptions - $missing_prices) / $total_products * 100)" | bc)
fi

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

low_stock=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) <= 10 and (.stock.quantity // 0) > 0)] | length')
out_of_stock=$(echo "$products" | jq '[.products[] | select(.stock.inStock == false and .visible == true)] | length')
not_tracking=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == false)] | length')

if [ "$total_products" -eq 0 ]; then
  inventory_score=0
else
  inventory_issues=$((low_stock + out_of_stock))
  inventory_score=$(echo "scale=0; ((($total_products - $inventory_issues) / $total_products) * 100)" | bc)
fi

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

if [ "$total_products" -eq 0 ]; then
  avg_price=0
else
  avg_price=$(echo "$products" | jq '[.products[] | select(.price != null) | .price | tonumber] | add / length')
fi

echo "Average Product Price: \$${avg_price}"
echo ""

# 4. SALES PERFORMANCE (Last 30 Days)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. SALES PERFORMANCE (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

order_count=$(echo "$orders" | jq '.orders | length')
total_revenue=$(echo "$orders" | jq '[.orders[] | .priceSummary.total | tonumber] | add // 0')

if [ "$order_count" -eq 0 ]; then
  aov=0
else
  aov=$(echo "scale=2; $total_revenue / $order_count" | bc)
fi

echo "Total Orders: $order_count"
echo "Total Revenue: \$${total_revenue}"
echo "Average Order Value: \$${aov}"
echo ""

# 5. CUSTOMER BASE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. CUSTOMER BASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1}}}')

total_contacts=$(echo "$contacts" | jq '.pagingMetadata.total // 0')

echo "Total Contacts: $total_contacts"
echo ""

# 6. OVERALL SCORE
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. OVERALL STORE HEALTH SCORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

overall_score=$(echo "scale=0; ($catalog_score * 0.3) + ($inventory_score * 0.2) + 50" | bc)

echo "Overall Score: ${overall_score}%"
echo ""

if [ "$overall_score" -ge 80 ]; then
  echo "Status: ✅ EXCELLENT - Your store is in great shape!"
elif [ "$overall_score" -ge 60 ]; then
  echo "Status: ⚠️  GOOD - Some areas need improvement"
elif [ "$overall_score" -ge 40 ]; then
  echo "Status: ⚠️  FAIR - Multiple areas need attention"
else
  echo "Status: ❌ POOR - Urgent improvements needed"
fi

echo ""
echo "======================================"
```

### Step 3: Generate Actionable Recommendations

Based on the audit results, provide prioritized recommendations:

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Priority 1: Catalog Issues
if [ "$missing_images" -gt 0 ]; then
  echo "🔴 HIGH PRIORITY: $missing_images products missing images"
  echo "   Action: Use 'optimize products' command to fix"
  echo ""
fi

if [ "$missing_descriptions" -gt 0 ]; then
  echo "🔴 HIGH PRIORITY: $missing_descriptions products missing descriptions"
  echo "   Action: Use 'optimize products' command to add descriptions"
  echo ""
fi

# Priority 2: Inventory Issues
if [ "$out_of_stock" -gt 0 ]; then
  echo "🟡 MEDIUM PRIORITY: $out_of_stock products out of stock"
  echo "   Action: Use 'inventory audit' command to review"
  echo ""
fi

if [ "$low_stock" -gt 0 ]; then
  echo "🟡 MEDIUM PRIORITY: $low_stock products low on stock"
  echo "   Action: Use 'inventory audit' command to reorder"
  echo ""
fi

# Priority 3: Sales Opportunities
if [ "$order_count" -lt 10 ]; then
  echo "🟢 LOW PRIORITY: Only $order_count orders in 30 days"
  echo "   Action: Consider running a campaign to boost sales"
  echo ""
fi
```

## Output Format

The command should output:

1. Store name and analysis date
2. Six scored categories (0-100%):
   - Catalog Health
   - Inventory Health
   - Pricing Strategy
   - Sales Performance
   - Customer Base
   - Overall Score
3. Visual status indicators (✅ EXCELLENT, ⚠️ GOOD, ❌ POOR)
4. Prioritized recommendations with action items

## Skills Referenced

- **store-analysis**: Complete store health audit workflows
- **catalog-optimization**: Product quality scoring
- **inventory-management**: Stock level analysis
- **order-analytics**: Revenue and sales metrics

## Example Use Cases

1. **Monthly Health Check**: "Analyze my store to see how we're doing this month"
2. **New Store Setup**: "Run a store audit to see what needs to be fixed"
3. **Pre-Campaign Planning**: "Analyze store health before launching a promotion"
4. **Troubleshooting**: "Why aren't my sales improving? Run a store analysis"

## Common Issues

### No Products Found

```
⚠️  No products found. Please add products to your store first.
```

**Solution**: Use the products command to add products.

### No Recent Orders

```
Total Orders: 0
Total Revenue: $0.00
```

**Solution**: Consider running a marketing campaign or checking if checkout is properly configured.

## Related Commands

- `/wix:optimize-products` - Fix product quality issues
- `/wix:inventory-audit` - Deep dive into inventory problems
- `/wix:create-campaign` - Launch promotions based on insights
- `/wix:revenue-report` - Detailed revenue analysis
