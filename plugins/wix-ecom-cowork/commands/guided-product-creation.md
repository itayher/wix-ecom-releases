# Guided Product Creation - Step-by-Step Product Setup

Interactive guided workflow for creating optimized, complete products following eCommerce best practices.

## Command Pattern

```
Guide me through creating a product
Help me add a new product the right way
Create a product with best practices
Walk me through product setup
What's the best way to add a product?
```

## Purpose

Provides an interactive, guided workflow for creating products with all required information, proper configuration, and eCommerce best practices. Ensures products are complete, optimized, and professional.

## Skills Referenced

- **product-workflow-guide**: Best practices and optimal product creation sequences
- **product-management**: Core CRUD operations
- **product-graphql**: Advanced product features
- **store-manager**: Categories and store configuration
- **tax-management**: Tax group assignment
- **catalog-optimization**: Product quality checks
- **wix-api-core**: Authentication and pagination

## Guided Workflow

### Phase 1: Product Information Gathering

**Interactive Questions**:

1. **Product Type**
   - Physical product (ships to customer)
   - Digital product (downloadable)
   - Service (booking/appointment)

2. **Basic Details**
   - Product name (clear, descriptive, keyword-rich)
   - Product description (benefits, features, specifications)
   - Primary category

3. **Pricing**
   - Retail price
   - Cost of goods (for profit tracking)
   - Compare-at price (optional, for showing discounts)

4. **Inventory**
   - Track inventory? (yes/no)
   - Starting quantity
   - Low stock alert threshold

5. **Variants Needed?**
   - Does this product come in different sizes, colors, or options?
   - If yes: Define options (Size: S/M/L, Color: Red/Blue/Green)

6. **Images**
   - Upload product images (recommended: 3-5 images)
   - Main image (hero shot)
   - Additional angles and lifestyle shots

### Phase 2: Validation and Recommendations

**Quality Checks**:

- [ ] Product name is descriptive (30-60 characters)
- [ ] Description is detailed (minimum 100 characters)
- [ ] At least one high-quality image
- [ ] Price is set and realistic
- [ ] SKU is unique
- [ ] Category assigned
- [ ] Tax group assigned (for compliance)
- [ ] Weight set (for shipping calculation)

**Recommendations Based on Input**:

```
✓ Excellent product name!
⚠ Consider adding compare-at price to show value ($XX.XX suggested)
✓ Good description length
⚠ Recommended: Add product weight for accurate shipping
✓ Inventory tracking enabled
💡 Tip: Add product ribbon "New Arrival" for first 30 days
```

### Phase 3: Product Creation

Execute the API calls in optimal order:

**Step 1: Fetch Required Data**
```bash
# Get categories
curl -X GET "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/categories" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"

# Get tax groups
curl -X POST "https://www.wixapis.com/_api/tax-groups/v1/taxGroups/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}'
```

**Step 2: Create Product (Invisible)**
```bash
curl -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "USER_PROVIDED_NAME",
    "description": "USER_PROVIDED_DESCRIPTION",
    "price": USER_PROVIDED_PRICE,
    "comparePrice": SUGGESTED_COMPARE_PRICE,
    "cost": {"price": USER_PROVIDED_COST},
    "productType": "physical",
    "sku": "GENERATED_SKU",
    "visible": false,
    "ribbon": "SUGGESTED_RIBBON",
    "weight": USER_PROVIDED_WEIGHT,
    "stock": {
      "trackInventory": true,
      "quantity": USER_PROVIDED_QUANTITY
    },
    "categoryIds": ["SELECTED_CATEGORY_ID"],
    "taxGroupId": "DEFAULT_TAX_GROUP_ID"
  }
}' | jq '{
  productId: .product.id,
  name: .product.name,
  message: "✅ Product created! Now adding details..."
}'
```

**Step 3: Add Images**
```bash
PRODUCT_ID="created-product-id"

curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "media": {
      "mainMedia": {
        "image": {
          "url": "IMAGE_URL",
          "altText": "PRODUCT_NAME"
        }
      }
    }
  }
}'
```

**Step 4: Add Variants (If Applicable)**
```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "productOptions": [
      {
        "name": "Size",
        "choices": [
          {"value": "Small"},
          {"value": "Medium"},
          {"value": "Large"}
        ]
      }
    ],
    "manageVariants": true
  }
}'
```

**Step 5: Set SEO Data**
```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "seoData": {
      "tags": [
        {
          "type": "title",
          "children": "OPTIMIZED_SEO_TITLE",
          "custom": true
        },
        {
          "type": "meta",
          "props": {
            "name": "description",
            "content": "OPTIMIZED_META_DESCRIPTION"
          }
        }
      ]
    }
  }
}'
```

**Step 6: Make Product Visible**
```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"product": {"visible": true}}' | jq '{
  productId: .product.id,
  name: .product.name,
  visible: .product.visible,
  message: "🎉 Product is now live in your store!"
}'
```

### Phase 4: Verification

**Verify Product Completeness**:
```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "{ product(productId: \"'${PRODUCT_ID}'\") { id name price media { url } options { title selections { value } } productItems { sku inventory { quantity } } } }",
  "source": "WixStoresWebClient"
}' | jq '{
  name: .data.product.name,
  price: .data.product.price,
  hasImages: (.data.product.media | length > 0),
  hasOptions: (.data.product.options | length > 0),
  variantCount: (.data.product.productItems | length),
  status: "✅ Product created successfully with all details"
}'
```

## Output Format

### Creation Progress

```
🏗️ Creating Product: "Vintage Denim Jacket"

Phase 1: Validation ✓
  ✓ Product name: Good length (45 characters)
  ✓ Description: Detailed (245 characters)
  ✓ Price: $79.99
  ✓ Cost: $35.00 (Margin: 56%)
  ✓ Category: Clothing > Outerwear
  ✓ Tax group: Standard Tax
  💡 Suggested: Add compare-at price $99.99 (20% off)

Phase 2: Product Creation ✓
  ✓ Created product ID: abc123-def456
  ✓ Status: Draft (not visible)

Phase 3: Media Upload ✓
  ✓ Added main image
  ✓ Added 3 additional images
  ✓ Set alt text for SEO

Phase 4: Variants Setup ✓
  ✓ Added Size option (S, M, L, XL)
  ✓ Added Color option (Blue, Black)
  ✓ Generated 8 variants
  ✓ Assigned SKUs: JACKET-S-BLUE, JACKET-M-BLUE, etc.
  ✓ Set inventory per variant

Phase 5: SEO Optimization ✓
  ✓ SEO title: "Vintage Denim Jacket - Classic Blue | YourStore"
  ✓ Meta description (155 characters)
  ✓ URL slug: vintage-denim-jacket-classic-blue

Phase 6: Publication ✓
  ✓ Made product visible
  🎉 Product is now live!
  🔗 View: https://yourstore.com/product/vintage-denim-jacket-classic-blue
```

## Example Use Cases

1. **First Product**: "Guide me through creating my first product"
2. **Complex Variant Product**: "Help me set up a t-shirt with 4 sizes and 6 colors"
3. **Digital Product**: "Walk me through adding a digital download"
4. **Subscription Product**: "Create a subscription product with monthly/yearly options"

## Related Commands

- `/wix:products` - Quick product operations
- `/wix:product-from-image` - AI-powered image analysis creation
- `/wix:optimize-products` - Product quality improvements
