# Auto-Categorize - AI-Powered Product Category Assignment

Automatically assign products to the best matching categories using AI analysis of product names, descriptions, and attributes.

## Command Pattern

```
Auto-categorize all my products
Match products to best categories
Review my product categorization
Find uncategorized products and assign them
Suggest category for product [product ID]
```

## Purpose

Use AI to intelligently match products with appropriate categories, saving time and ensuring consistent, logical catalog organization.

## Skills Referenced

- **ai-category-matching**: AI-powered product-to-category matching algorithm
- **category-management**: Category CRUD and product assignment
- **product-graphql**: Product queries for analysis
- **wix-api-core**: Authentication

## Workflow

### Step 1: Analyze Current State

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

# Get all categories
echo "Fetching categories..."
categories=$(curl -s -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

category_count=$(echo "$categories" | jq '.collections | length')
echo "✓ Found ${category_count} categories"

# Get all products
echo "Fetching products..."
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

product_count=$(echo "$products" | jq '.products | length')
uncategorized=$(echo "$products" | jq '[.products[] | select(.collectionIds == [] or .collectionIds == null)] | length')

echo "✓ Found ${product_count} products"
echo "⚠ ${uncategorized} products are uncategorized"
```

### Step 2: AI Analysis and Matching

```
Claude analyzes each product:

📦 Product: "Wireless Bluetooth Headphones"
   Keywords: wireless, bluetooth, headphones, audio
   Type: Electronics

   Category Matching:
   1. Electronics    → 95% ✅ (high confidence)
   2. Audio & Music  → 88%
   3. Accessories    → 45%

   ✅ Recommended: Electronics

📦 Product: "Organic Cotton T-Shirt - Blue"
   Keywords: cotton, t-shirt, clothing, apparel, blue
   Type: Clothing

   Category Matching:
   1. Clothing       → 98% ✅ (high confidence)
   2. Apparel        → 92%
   3. Fashion        → 75%

   ✅ Recommended: Clothing

📦 Product: "Handmade Ceramic Mug"
   Keywords: handmade, ceramic, mug, coffee, kitchen
   Type: Home & Living

   Category Matching:
   1. Kitchen & Dining → 92% ✅ (high confidence)
   2. Handmade Items   → 85%
   3. Home & Living    → 78%

   ✅ Recommended: Kitchen & Dining
   💡 Suggested: Also add to "Handmade Items"
```

### Step 3: Review and Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-Categorization Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Products Analyzed: 45
Uncategorized Products: 12

Suggested Assignments:

High Confidence (10 products):
  • "Wireless Headphones" → Electronics
  • "Cotton T-Shirt" → Clothing
  • "Ceramic Mug" → Kitchen & Dining
  • [7 more...]

Medium Confidence (2 products):
  ⚠ "Gift Set Assorted" → Gifts & Bundles (65%)
  ⚠ "Starter Pack" → Bundles (62%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like to:
  1. Apply all high-confidence assignments (10 products)
  2. Review each assignment individually
  3. Apply all assignments (including medium confidence)
  4. Cancel
```

### Step 4: Execute Assignments

```bash
# For each confirmed assignment
while read -r assignment; do
  product_id=$(echo "$assignment" | jq -r '.productId')
  category_id=$(echo "$assignment" | jq -r '.categoryId')
  product_name=$(echo "$assignment" | jq -r '.productName')
  category_name=$(echo "$assignment" | jq -r '.categoryName')

  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "product": {
      "id": "'"${product_id}"'",
      "collectionIds": ["'"${category_id}"'"]
    }
  }' > /dev/null

  echo "✅ ${product_name} → ${category_name}"
  sleep 0.2
done

echo "\n🎉 Auto-categorization complete! ${assigned_count} products categorized."
```

## Output Format

### Analysis Summary

```json
{
  "totalProducts": 45,
  "categorized": 33,
  "uncategorized": 12,
  "multiCategory": 8,
  "suggestions": [
    {
      "productId": "p123",
      "productName": "Wireless Headphones",
      "currentCategories": [],
      "suggestedCategory": {
        "id": "cat-electronics",
        "name": "Electronics",
        "confidence": 0.95,
        "reason": "Keywords match: wireless, bluetooth, headphones"
      },
      "alternativeCategories": [
        {"name": "Audio & Music", "confidence": 0.88}
      ]
    }
  ]
}
```

### Assignment Results

```
✅ Auto-Categorization Complete

Assigned 12 products:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Wireless Headphones         → Electronics
  ✅ Cotton T-Shirt Blue          → Clothing
  ✅ Ceramic Coffee Mug           → Kitchen & Dining
  ✅ Yoga Mat                     → Sports & Fitness
  ✅ Face Cream                   → Beauty & Skincare
  ✅ Novel Book                   → Books & Media
  ✅ Wooden Desk                  → Furniture
  ✅ iPhone Case                  → Phone Accessories
  ✅ Running Shoes                → Footwear
  ✅ Green Tea                    → Food & Beverage
  ✅ Art Print                    → Wall Art & Decor
  ✅ Scented Candle               → Home Fragrance

Skipped (low confidence):
  ⚠ "Bundle Set" - Manual review needed
  ⚠ "Mystery Box" - Ambiguous product type

Category Summary:
  Electronics:        3 products added
  Clothing:           2 products added
  Kitchen & Dining:   2 products added
  [...]
```

## Example Use Cases

1. **Auto-Categorize All**: "Auto-categorize all my uncategorized products"
2. **Single Product**: "What category should 'Wireless Mouse' be in?"
3. **Review Current**: "Review my product categorization and suggest improvements"
4. **Fix Uncategorized**: "Find and categorize all products without categories"
5. **Multi-Category**: "Suggest additional categories for my bestselling products"

## Advanced Features

### Confidence Thresholds

- **Auto-assign**: >= 90% confidence
- **Suggest with confirmation**: 70-89% confidence
- **Manual review required**: < 70% confidence

### Category Suggestions

If no suitable category exists:
```
⚠ No good category match for "Vintage Record Player"

💡 Suggestions:
  1. Create new category: "Vintage Audio"
  2. Add to existing "Electronics" (76% match)
  3. Create "Retro & Vintage" category for similar items
```

### Batch Operations

Process products in batches of 20 for performance:
```bash
total_products=156
batch_size=20
batches=$((total_products / batch_size + 1))

for i in $(seq 0 $batches); do
  offset=$((i * batch_size))
  echo "Processing batch $((i+1))/$batches..."

  # Fetch batch, analyze, assign
  # Rate limit: 200ms between requests
done
```

## Related Commands

- `/wix:categories` - Basic category management
- `/wix:create-category-ai` - Create category and auto-populate
- `/wix:products` - Product management
- `/wix:optimize-products` - Product quality improvements
