# Optimize Products - Product Quality Audit & Fixes

Find and fix product listing issues: missing descriptions, images, SEO metadata, and more.

## Command Pattern

```
Optimize my products
Find products with quality issues
Fix product listings
Which products need images?
Find products missing descriptions
SEO audit my products
```

## Workflow

### Step 1: Validate Configuration

```bash
node -e "
const { getActiveSiteId, getActiveSiteName } = require('./wix-store-optimizer/lib/site-storage');
const { validateConfig } = require('./lib/config-validator');

const validation = validateConfig();
if (!validation.valid) {
  console.error(validation.message);
  process.exit(1);
}

const siteId = getActiveSiteId();
if (!siteId) {
  console.error('❌ No site selected.');
  process.exit(1);
}

console.error(\`✓ Optimizing products for: \${getActiveSiteName()}\`);
"
```

### Step 2: Run Product Quality Audit

Use the **catalog-optimization** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   PRODUCT QUALITY AUDIT"
echo "======================================"
echo ""

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": true}", "paging": {"limit": 100}}}')

total_products=$(echo "$products" | jq '.products | length')

# Calculate quality scores
quality_scores=$(echo "$products" | jq '[.products[] | {
  id: .id,
  name: .name,
  quality_score: (
    (if (.description != null and (.description | length) >= 50) then 25 else 0 end) +
    (if .media.mainMedia.image != null then 25 else 0 end) +
    (if (.price != null and (.price | tonumber) > 0) then 20 else 0 end) +
    (if (.sku != null and .sku != "") then 15 else 0 end) +
    (if (.media.items | length) >= 3 then 15 else 0 end)
  ),
  issues: [
    (if (.description == null or (.description | length) < 50) then "missing_description" else null end),
    (if .media.mainMedia.image == null then "missing_image" else null end),
    (if (.price == null or (.price | tonumber) == 0) then "missing_price" else null end),
    (if (.sku == null or .sku == "") then "missing_sku" else null end),
    (if (.media.items | length) < 3 then "few_images" else null end)
  ] | map(select(. != null))
}]')

avg_quality=$(echo "$quality_scores" | jq '[.[].quality_score] | add / length')

echo "📊 OVERALL CATALOG HEALTH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Products Analyzed: $total_products"
echo "Average Quality Score: ${avg_quality}/100"
echo ""

# Category breakdown
excellent=$(echo "$quality_scores" | jq '[.[] | select(.quality_score >= 80)] | length')
good=$(echo "$quality_scores" | jq '[.[] | select(.quality_score >= 60 and .quality_score < 80)] | length')
fair=$(echo "$quality_scores" | jq '[.[] | select(.quality_score >= 40 and .quality_score < 60)] | length')
poor=$(echo "$quality_scores" | jq '[.[] | select(.quality_score < 40)] | length')

echo "Quality Distribution:"
echo "  ✅ Excellent (80-100): $excellent products"
echo "  🟢 Good (60-79): $good products"
echo "  🟡 Fair (40-59): $fair products"
echo "  🔴 Poor (0-39): $poor products"
echo ""
```

### Step 3: Identify Specific Issues

```bash
echo "🔍 ISSUE BREAKDOWN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

missing_descriptions=$(echo "$quality_scores" | jq '[.[] | select(.issues | index("missing_description"))] | length')
missing_images=$(echo "$quality_scores" | jq '[.[] | select(.issues | index("missing_image"))] | length')
missing_prices=$(echo "$quality_scores" | jq '[.[] | select(.issues | index("missing_price"))] | length')
missing_skus=$(echo "$quality_scores" | jq '[.[] | select(.issues | index("missing_sku"))] | length')
few_images=$(echo "$quality_scores" | jq '[.[] | select(.issues | index("few_images"))] | length')

echo "Missing Descriptions (< 50 chars): $missing_descriptions"
echo "Missing Main Image: $missing_images"
echo "Missing/Zero Price: $missing_prices"
echo "Missing SKU: $missing_skus"
echo "Few Images (< 3): $few_images"
echo ""
```

### Step 4: Top Priority Products to Fix

```bash
echo "🔴 TOP 10 PRODUCTS NEEDING ATTENTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$quality_scores" | jq -r 'sort_by(.quality_score) | .[0:10][] | "
Product: \(.name)
Quality Score: \(.quality_score)/100
Issues: \(.issues | join(", "))
ID: \(.id)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"'
```

### Step 5: Products Missing Images

```bash
echo "📸 PRODUCTS MISSING IMAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$products" | jq -r '.products[] | select(.media.mainMedia.image == null) | "• \(.name) (ID: \(.id))"'
echo ""

echo "📌 ACTION: Add product images via Wix dashboard or use the products command to update"
echo ""
```

### Step 6: Products with Short/Missing Descriptions

```bash
echo "📝 PRODUCTS WITH POOR DESCRIPTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "$products" | jq -r '.products[] | select(.description == null or (.description | length) < 50) | {
  name: .name,
  id: .id,
  descLength: (if .description then (.description | length) else 0 end)
} | "• \(.name): \(.descLength) chars (ID: \(.id))"'
echo ""

echo "📌 ACTION: Add detailed descriptions (minimum 50 characters recommended)"
echo ""
```

### Step 7: SEO Optimization Check

```bash
echo "🔍 SEO OPTIMIZATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for products with SEO data
products_with_seo=$(echo "$products" | jq '[.products[] | select(.seoData != null)] | length')
products_without_seo=$(echo "$products" | jq '[.products[] | select(.seoData == null)] | length')

echo "Products with SEO Data: $products_with_seo"
echo "Products without SEO Data: $products_without_seo"
echo ""

if [ "$products_without_seo" -gt 0 ]; then
  echo "⚠️  Products missing SEO metadata:"
  echo "$products" | jq -r '.products[] | select(.seoData == null) | "   • \(.name) (ID: \(.id))"'
  echo ""
  echo "📌 ACTION: Add SEO titles and descriptions via Wix dashboard"
  echo ""
fi
```

### Step 8: Pricing Anomaly Detection

```bash
echo "💰 PRICING ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Products with no compare price
no_compare=$(echo "$products" | jq '[.products[] | select(.comparePrice == null or .comparePrice == "")] | length')
echo "Products without compare price: $no_compare"
echo ""

# Products where cost >= price (potential loss)
low_margin=$(echo "$products" | jq '[.products[] | select(.cost != null and .price != null and ((.cost.price | tonumber) >= (.price | tonumber)))] | length')

if [ "$low_margin" -gt 0 ]; then
  echo "⚠️  WARNING: $low_margin products with cost >= price (no profit):"
  echo "$products" | jq -r '.products[] | select(.cost != null and .price != null and ((.cost.price | tonumber) >= (.price | tonumber))) | "   • \(.name): Cost $\(.cost.price), Price $\(.price) (ID: \(.id))"'
  echo ""
fi
```

### Step 9: Bulk Fix - Add Default SKUs

```bash
echo "🔧 BULK OPERATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get products without SKUs
no_sku_products=$(echo "$products" | jq -r '.products[] | select(.sku == null or .sku == "") | .id')

if [ -n "$no_sku_products" ]; then
  echo "Adding default SKUs to products..."

  counter=1
  for pid in $no_sku_products; do
    sku="SKU-$(printf "%05d" $counter)"

    curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${pid}" \
      -H "Authorization: ${API_KEY}" \
      -H "wix-site-id: ${SITE_ID}" \
      -H "Content-Type: application/json" \
      -d "{\"product\": {\"sku\": \"$sku\"}}" > /dev/null

    echo "✅ Added SKU $sku to product $pid"
    counter=$((counter + 1))
    sleep 0.2
  done

  echo ""
  echo "✅ Bulk SKU update complete"
fi
```

## Output Format

```
✓ Optimizing products for: My Store

======================================
   PRODUCT QUALITY AUDIT
======================================

📊 OVERALL CATALOG HEALTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Products Analyzed: 156
Average Quality Score: 68/100

Quality Distribution:
  ✅ Excellent (80-100): 45 products
  🟢 Good (60-79): 67 products
  🟡 Fair (40-59): 32 products
  🔴 Poor (0-39): 12 products

🔍 ISSUE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Missing Descriptions: 23
Missing Main Image: 8
Missing/Zero Price: 2
Missing SKU: 45
Few Images (< 3): 67

🔴 TOP 10 PRODUCTS NEEDING ATTENTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product: Blue Widget
Quality Score: 25/100
Issues: missing_description, missing_image, missing_sku, few_images
ID: abc123
```

## Skills Referenced

- **catalog-optimization**: Product quality scoring, SEO optimization, image analysis
- **product-management**: Bulk update operations

## Example Use Cases

1. **Quality Check**: "Run a product quality audit"
2. **Find Issues**: "Which products are missing images?"
3. **SEO Review**: "Do my products have proper SEO?"
4. **Pricing Check**: "Find products with low margins"
5. **Bulk Fix**: "Add default SKUs to all products"
6. **Before Launch**: "Optimize products before promoting my store"

## Related Commands

- `/wix:products` - Update individual products
- `/wix:analyze-store` - Overall store health including catalog
