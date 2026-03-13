# AI Category Matching - Intelligent Product Categorization

## Overview

AI-powered product categorization using Claude's natural language understanding to automatically assign products to the most appropriate categories based on product names, descriptions, and attributes.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## How AI Category Matching Works

### Step 1: Analyze Product

Claude analyzes multiple product attributes:

**Primary Signals**:
- Product name (strongest signal)
- Product description
- Product type (physical/digital/service)
- Price range
- Existing tags/keywords

**Secondary Signals**:
- SKU patterns
- Brand information
- Product images (if using vision)
- Similar products' categories

### Step 2: Analyze Available Categories

For each category in the store:
- Extract category name and description
- Identify category keywords
- Analyze existing products in category
- Understand category theme/purpose

### Step 3: Match Products to Categories

**Matching Algorithm**:

```
For each product:
  1. Extract keywords from name + description
  2. For each category:
     a. Calculate keyword overlap
     b. Check semantic similarity
     c. Consider category product patterns
     d. Generate confidence score
  3. Rank categories by score
  4. Return top match with confidence level
```

**Confidence Levels**:
- **High (90-100%)**: Clear match, highly confident
- **Medium (70-89%)**: Good match, some ambiguity
- **Low (50-69%)**: Possible match, needs review
- **Uncertain (<50%)**: No clear match, manual review needed

## Example Matching Scenarios

### Scenario 1: Clear Match

**Product**: "Wireless Bluetooth Headphones - Premium Sound"

**Analysis**:
```
Keywords: wireless, bluetooth, headphones, audio, sound, premium
Product Type: Electronics
Price: $89.99 (mid-to-high range)

Category Matching:
1. Electronics → 95% (keywords: bluetooth, wireless, tech)
2. Audio & Music → 88% (keywords: headphones, sound)
3. Accessories → 45% (generic match)

✅ Best Match: Electronics (95% confidence - HIGH)
```

### Scenario 2: Multi-Category Product

**Product**: "Yoga Mat - Eco-Friendly Exercise Mat with Carrying Strap"

**Analysis**:
```
Keywords: yoga, mat, exercise, fitness, eco-friendly, workout
Product Type: Physical
Price: $45.00

Category Matching:
1. Sports & Fitness → 92% (yoga, exercise, fitness)
2. Yoga & Meditation → 90% (yoga, mat)
3. Eco-Friendly Products → 75% (eco-friendly)

✅ Best Match: Sports & Fitness (92% confidence - HIGH)
💡 Suggestion: Also add to "Yoga & Meditation" and "Eco-Friendly Products"
```

### Scenario 3: Ambiguous Product

**Product**: "Gift Set - Assorted Items"

**Analysis**:
```
Keywords: gift, set, assorted
Product Type: Physical
Price: $50.00

Category Matching:
1. Gifts & Bundles → 65% (gift keyword)
2. Special Offers → 45% (set, bundle)
3. Uncategorized → 40%

⚠️ Best Match: Gifts & Bundles (65% confidence - MEDIUM)
💡 Recommendation: Add more specific description or create custom category
```

## Workflow: Auto-Categorize All Products

### Full Automation Sequence

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

echo "Step 1: Fetching all categories..."
categories=$(curl -s -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "Found $(echo "$categories" | jq '.collections | length') categories"

echo "\nStep 2: Fetching all products..."
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "Found $(echo "$products" | jq '.products | length') products"

echo "\nStep 3: AI analyzing and matching..."

# For each product
echo "$products" | jq -r '.products[] | @json' | while read -r product_json; do
  product_id=$(echo "$product_json" | jq -r '.id')
  product_name=$(echo "$product_json" | jq -r '.name')
  product_desc=$(echo "$product_json" | jq -r '.description // ""')

  # Claude analyzes product against all categories
  # Returns best matching category ID and confidence
  # (This would be done via Claude's analysis capabilities)

  echo "  📦 ${product_name}"
  echo "     → Matched to: [CATEGORY_NAME] (confidence: XX%)"

  # Assign product to category
  # curl PATCH to update product.collectionIds
done

echo "\n✅ Auto-categorization complete!"
```

## Bulk Category Creation + Smart Assignment

### Create Category and Auto-Populate

**Use Case**: Create "Electronics" category and automatically add all electronic products

```bash
echo "Creating 'Electronics' category..."

# Step 1: Create category
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
echo "✅ Created category: $CATEGORY_ID"

# Step 2: Get all products
all_products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

# Step 3: AI filters products that match "Electronics"
# Claude identifies products with keywords: phone, computer, gadget, headphone, charger, cable, etc.

echo "\nStep 3: AI analyzing products for Electronics match..."

# Step 4: Bulk assign matched products
matched_count=0

echo "$all_products" | jq -r '.products[] | select(.name | test("phone|computer|headphone|gadget|charger|cable|tech|electronic"; "i")) | .id' | while read -r pid; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${pid}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "product": {
      "id": "'"${pid}"'",
      "collectionIds": ["'"${CATEGORY_ID}"'"]
    }
  }' > /dev/null

  matched_count=$((matched_count + 1))
  echo "  ✅ Added product to Electronics"
  sleep 0.2
done

echo "\n✅ Added ${matched_count} products to Electronics category"

# Step 5: Make category visible
curl -s -X PATCH "https://www.wixapis.com/stores/v1/collections/${CATEGORY_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "visible": true
  }
}' > /dev/null

echo "✅ Category is now visible with all matched products!"
```

## Category Optimization Strategies

### 1. Consolidate Similar Categories

If you have: "Tech", "Electronics", "Gadgets" → Merge into single "Electronics"

### 2. Create Missing Categories

AI can identify underserved product groups:
- Products with no category
- Products in "Uncategorized"
- Clusters of similar products without a home

### 3. Category Performance Analysis

Track which categories drive sales:
```bash
# Get products by category with revenue data
# Identify high-performing categories
# Suggest creating similar categories
```

## Advanced Features

### Multi-Category Assignment

Products can belong to multiple categories:
```json
{
  "collectionIds": [
    "electronics",
    "sale-items",
    "new-arrivals",
    "bestsellers"
  ]
}
```

**Recommended Multi-Category Patterns**:
- Primary category (product type)
- Secondary categories (characteristics):
  - Sale Items
  - New Arrivals
  - Bestsellers
  - Seasonal (Summer Collection, Holiday Gifts)
  - Special (Eco-Friendly, Handmade, Local)

### Category Hierarchy

Create nested categories:
```
Electronics
  ├─ Phones & Tablets
  ├─ Computers
  ├─ Audio & Video
  └─ Accessories
```

Use `parentId` field in category creation.
