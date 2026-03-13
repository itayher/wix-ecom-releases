# Create Category AI - Smart Category Creation with Auto-Population

Create a new category and automatically populate it with all matching products using AI-powered product analysis.

## Command Pattern

```
Create "Electronics" category and add all matching products
Create category for all my phone accessories
Make a "Summer Collection" category with relevant products
Create "Eco-Friendly" category and find all eco products
```

## Purpose

Streamline category creation by automatically identifying and assigning all relevant products using AI, saving hours of manual product selection.

## Skills Referenced

- **ai-category-matching**: AI product-to-category matching
- **category-management**: Category CRUD operations
- **product-graphql**: Product queries and filtering
- **wix-api-core**: Authentication

## Complete Workflow

### Phase 1: Category Creation

**User Input**: "Create 'Electronics' category and add all matching products"

**Step 1: Create Category**

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

echo "Creating 'Electronics' category..."

category_response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "name": "Electronics",
    "description": "Electronic devices, gadgets, and tech accessories",
    "visible": false
  }
}')

CATEGORY_ID=$(echo "$category_response" | jq -r '.collection.id')
CATEGORY_NAME=$(echo "$category_response" | jq -r '.collection.name')

echo "✅ Created category: ${CATEGORY_ID}"
```

### Phase 2: AI Product Analysis

**Step 2: Fetch All Products**

```bash
echo "\nFetching all products..."

all_products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 100, "offset": 0}
  }
}')

total_products=$(echo "$all_products" | jq '.products | length')
echo "✓ Found ${total_products} products to analyze"
```

**Step 3: AI Analysis**

```
Analyzing products for Electronics match...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI Product Analysis: Electronics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning 45 products...

High Confidence Matches (95%+):
  ✅ "Wireless Bluetooth Headphones" - 98%
     Keywords: wireless, bluetooth, headphones, audio, tech
     Reason: Clear electronics product

  ✅ "USB-C Fast Charger 20W" - 97%
     Keywords: USB, charger, electronics, power
     Reason: Electronic accessory

  ✅ "Smart Watch Fitness Tracker" - 96%
     Keywords: smartwatch, electronics, tech, digital
     Reason: Electronic wearable device

  [... 12 more high-confidence matches ...]

Medium Confidence Matches (70-94%):
  ⚠ "Phone Case - Leather" - 85%
     Keywords: phone, case, accessory
     Reason: Phone accessory (electronics-adjacent)
     Alternative: "Phone Accessories" category

  ⚠ "Bluetooth Speaker Stand" - 82%
     Keywords: bluetooth, speaker, stand, audio
     Reason: Audio accessory
     Alternative: "Audio Accessories" category

Low Confidence (<70%):
  ⚠ "Tech Themed T-Shirt" - 45%
     Keywords: tech (but clothing item)
     Reason: Tech-related but not electronics
     Suggested: Skip or add to "Clothing" instead

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  High Confidence:   15 products (will auto-assign)
  Medium Confidence:  3 products (need confirmation)
  Low Confidence:     1 product (will skip)

Would you like to:
  1. Auto-assign all high-confidence matches (15 products)
  2. Review medium-confidence matches before assigning
  3. Assign all matches including medium confidence
  4. Cancel
```

### Phase 3: Bulk Assignment

**Step 4: Assign Matched Products**

```bash
echo "\nAssigning products to Electronics category..."

# Counter
assigned=0
skipped=0

# Process each matched product
echo "$all_products" | jq -r '.products[] | select(
  .name | test("phone|computer|headphone|gadget|charger|cable|tech|electronic|wireless|bluetooth|usb|smart|digital"; "i")
) | .id' | while read -r product_id; do

  # Get product name for logging
  product_name=$(echo "$all_products" | jq -r --arg id "$product_id" '.products[] | select(.id == $id) | .name')

  # Add to category
  update_response=$(curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "product": {
      "id": "'"${product_id}"'",
      "collectionIds": ["'"${CATEGORY_ID}"'"]
    }
  }')

  if echo "$update_response" | jq -e '.product.id' > /dev/null 2>&1; then
    echo "  ✅ ${product_name}"
    assigned=$((assigned + 1))
  else
    echo "  ⚠ Failed: ${product_name}"
    skipped=$((skipped + 1))
  fi

  sleep 0.2  # Rate limiting
done

echo "\n✅ Assigned ${assigned} products to Electronics"
if [ $skipped -gt 0 ]; then
  echo "⚠ Skipped ${skipped} products (errors)"
fi
```

**Step 5: Make Category Visible**

```bash
echo "\nMaking category visible..."

curl -s -X PATCH "https://www.wixapis.com/stores/v1/collections/${CATEGORY_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "visible": true
  }
}' | jq '{
  categoryId: .collection.id,
  name: .collection.name,
  productCount: .collection.numberOfProducts,
  message: "✅ Category is now live!"
}'
```

### Phase 4: Verification

**Step 6: Verify Results**

```bash
echo "\nVerifying category population..."

product_count=$(curl -s -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsTotalCount($filters: ProductFilters) { catalog { products(filters: $filters) { totalCount } } }",
  "variables": {
    "filters": {"categoryIds": ["'"${CATEGORY_ID}"'"]}
  },
  "operationName": "getProductsTotalCount",
  "source": "WixStoresWebClient"
}' | jq -r '.data.catalog.products.totalCount')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SUCCESS!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Category: Electronics"
echo "Products: ${product_count} items"
echo "Status: Live"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Advanced Use Cases

### Example 1: Seasonal Category

**Command**: "Create 'Summer Collection' category and add matching products"

**AI Analysis**:
- Scans product names/descriptions for summer keywords
- Looks for: summer, beach, sun, swimwear, outdoor, vacation
- Checks seasonal tags
- Considers product types (beachwear, outdoor furniture, sun protection)

**Result**: Auto-populated category with all summer-related products

### Example 2: Attribute-Based Category

**Command**: "Create 'Eco-Friendly' category for sustainable products"

**AI Analysis**:
- Scans for: organic, sustainable, eco-friendly, recycled, green, natural
- Checks product descriptions for sustainability claims
- Looks for eco-related product attributes

**Result**: Category with all environmentally-conscious products

### Example 3: Price-Based Category

**Command**: "Create 'Luxury' category for premium products over $200"

**AI Analysis**:
- Filters products by price range
- Checks for premium indicators (luxury, premium, high-end, designer)
- Considers brand names associated with luxury

**Result**: Curated luxury products category

### Example 4: Multi-Criteria Category

**Command**: "Create 'Bestsellers' category with top 20 selling products"

**AI Analysis** (requires order data):
- Queries order history
- Ranks products by sales volume
- Selects top 20 performers
- Creates dynamic bestsellers category

**Result**: Category automatically updated with best performers

## Smart Category Suggestions

AI can suggest new categories based on unorganized products:

```
Analyzing your catalog...

💡 Suggested New Categories:

1. "Phone Accessories" (18 products)
   Currently in: Electronics, Accessories, Uncategorized
   Products: cases, chargers, screen protectors, cables

2. "Handmade Items" (12 products)
   Currently in: Various categories
   Products: All contain "handmade" or "handcrafted" in descriptions

3. "Sale Items" (23 products)
   Currently scattered
   Products: All have comparePrice > price (on sale)

4. "New Arrivals" (8 products)
   Products added in last 30 days
   Helps highlight fresh inventory

Create these categories? (yes/no)
```

## Output Format

### Creation Progress

```
🏗️ Creating Category: "Electronics"

Phase 1: Category Creation ✓
  ✅ Created category ID: cat-elec-123
  ✅ Name: Electronics
  ✅ Slug: electronics
  ✅ Status: Draft (not visible)

Phase 2: AI Product Analysis ✓
  🔍 Scanning 45 products...
  ✅ Found 15 high-confidence matches
  ⚠ Found 3 medium-confidence matches
  ⚠ Skipped 1 low-confidence match

Phase 3: Product Assignment ✓
  ✅ Assigned 15 products (100% success rate)
  ⏱️ Completed in 4.2 seconds

Phase 4: Category Publication ✓
  ✅ Made category visible
  ✅ SEO-friendly slug generated
  ✅ Category is now live!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Category Created & Populated!

  Category: Electronics
  Products: 15 items
  URL: https://yourstore.com/shop/electronics

  Browse category: [View in Store]
  Edit category: [Open Business Manager]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Best Practices

1. **Start with broad categories** - Electronics, Clothing, Home, etc.
2. **Create subcategories later** - Phones, Tablets, Computers under Electronics
3. **Use clear names** - "Running Shoes" better than "Footwear Type A"
4. **Add descriptions** - Helps AI matching and SEO
5. **Review AI suggestions** - Especially medium-confidence matches
6. **Keep categories balanced** - Aim for 10-50 products per category
7. **Use multiple categories** - Products can be in sale, new, and type category

## Related Commands

- `/wix:categories` - View and manage categories
- `/wix:auto-categorize` - Auto-assign products to existing categories
- `/wix:products` - Product management
