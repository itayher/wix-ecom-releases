# Product from Image - AI-Powered Product Creation

Create complete product listings automatically by uploading product images. Claude analyzes the image to generate product names, descriptions, pricing suggestions, categories, and more.

## Command Pattern

```
Create a product from this image: [image path or URL]
Analyze this product photo and create a listing
Generate product details from image
Upload product image and create listing
Create product from: /path/to/image.jpg
```

## Purpose

Leverage Claude's vision capabilities to automatically generate complete, optimized product listings from product images. Saves time and ensures professional, SEO-optimized product descriptions.

## Skills Referenced

- **ai-product-from-image**: Vision analysis and product data generation
- **product-workflow-guide**: Best practices for product creation
- **product-management**: Product CRUD API operations
- **store-manager**: Categories and store configuration
- **tax-management**: Tax group assignment
- **wix-api-core**: Authentication

## Workflow

### Step 1: Image Analysis

Claude analyzes the product image to identify:

**Visual Attributes**:
- Product type and category
- Colors and materials
- Style and design elements
- Quality indicators
- Notable features

**Generated Metadata**:
- Optimized product name
- Compelling product description (SEO-friendly)
- Suggested price range
- Category recommendations
- Keywords and tags
- Target audience

### Step 2: AI Analysis Output

```
📸 Analyzing product image...

🔍 Product Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product Type:     Ceramic Mug
Primary Color:    Deep Blue
Material:         Ceramic/Pottery
Style:            Handmade, Artisan
Quality:          High (professional product photo)
Notable Features: Unique glaze pattern, comfortable handle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Generated Product Data:

Name:
  "Handcrafted Blue Ceramic Mug - Artisan Coffee Cup"

Description:
  "Beautiful handcrafted ceramic mug featuring a unique blue
  glaze finish. Perfect for your morning coffee or afternoon tea.
  Each mug is individually made, making yours truly one-of-a-kind.

  Key Features:
  • Handmade ceramic construction
  • Vibrant blue glaze finish
  • Comfortable handle design
  • Microwave and dishwasher safe
  • 12 oz capacity

  Perfect for coffee lovers, tea enthusiasts, or as a thoughtful gift."

Pricing:
  Suggested Price:     $24.99
  Compare-at Price:    $32.99
  Suggested Cost:      $12.00
  Profit Margin:       52%

Category:
  Primary:   Kitchen & Dining
  Secondary: Home & Living, Gifts

Tags:
  mug, ceramic, handmade, blue, coffee, tea, artisan, pottery

Ribbon:
  "Handmade"

SKU:
  "MUG-CERAMIC-BLUE-001"

Inventory:
  Suggested Quantity: 5 (handmade item)
  Track Inventory:    Yes

Weight:
  0.8 lbs (for shipping)

SEO:
  Title: "Handcrafted Blue Ceramic Mug | Artisan Coffee Cup"
  Meta:  "Unique handmade blue ceramic mug perfect for coffee or tea.
          Dishwasher safe, 12 oz capacity. Each piece is one-of-a-kind."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like to:
  1. Create product with these details
  2. Modify any details before creating
  3. Add variants or options
```

### Step 3: User Confirmation and Adjustments

Allow user to review and modify AI-generated data before creation.

### Step 4: Product Creation

Execute the optimal API sequence:

**4.1 Get Categories and Tax Groups**
```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

# Get categories
categories=$(curl -s -X GET "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/categories" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

# Get tax groups
tax_groups=$(curl -s -X POST "https://www.wixapis.com/_api/tax-groups/v1/taxGroups/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

# Extract default tax group
TAX_GROUP_ID=$(echo "$tax_groups" | jq -r '.taxGroups[] | select(.default == true) | .id')
```

**4.2 Create Product**
```bash
product_response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "AI_GENERATED_NAME",
    "description": "AI_GENERATED_DESCRIPTION",
    "price": AI_SUGGESTED_PRICE,
    "comparePrice": AI_SUGGESTED_COMPARE_PRICE,
    "cost": {"price": AI_SUGGESTED_COST},
    "productType": "physical",
    "sku": "AI_GENERATED_SKU",
    "visible": false,
    "ribbon": "AI_SUGGESTED_RIBBON",
    "weight": AI_SUGGESTED_WEIGHT,
    "stock": {
      "trackInventory": true,
      "quantity": AI_SUGGESTED_QUANTITY
    },
    "categoryIds": ["MATCHED_CATEGORY_ID"],
    "taxGroupId": "'"${TAX_GROUP_ID}"'"
  }
}')

PRODUCT_ID=$(echo "$product_response" | jq -r '.product.id')
echo "✅ Created product: $PRODUCT_ID"
```

**4.3 Upload and Attach Image**
```bash
# Attach the analyzed image as main product image
curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "media": {
      "mainMedia": {
        "image": {
          "url": "UPLOADED_IMAGE_URL",
          "altText": "AI_GENERATED_ALT_TEXT"
        }
      }
    }
  }
}' | jq '{message: "✅ Image added"}'
```

**4.4 Set SEO Data**
```bash
curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "seoData": {
      "tags": [
        {
          "type": "title",
          "children": "AI_GENERATED_SEO_TITLE",
          "custom": true
        },
        {
          "type": "meta",
          "props": {
            "name": "description",
            "content": "AI_GENERATED_META_DESCRIPTION"
          }
        }
      ]
    }
  }
}' | jq '{message: "✅ SEO data added"}'
```

**4.5 Make Visible**
```bash
curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"product": {"visible": true}}' | jq '{
  productId: .product.id,
  name: .product.name,
  slug: .product.slug,
  message: "🎉 Product is now live in your store!"
}'
```

## AI Analysis Examples

### Example 1: Clothing Item

**Image**: Photo of a red cotton t-shirt

**AI Output**:
```json
{
  "name": "Classic Red Cotton T-Shirt - Unisex Crew Neck",
  "description": "Comfortable 100% cotton t-shirt in vibrant red...",
  "price": 19.99,
  "comparePrice": 24.99,
  "category": "Apparel > T-Shirts",
  "tags": ["t-shirt", "red", "cotton", "casual", "unisex"],
  "variants": {
    "suggested": true,
    "options": [
      {"name": "Size", "values": ["XS", "S", "M", "L", "XL", "XXL"]}
    ]
  }
}
```

### Example 2: Electronics

**Image**: Photo of wireless earbuds in case

**AI Output**:
```json
{
  "name": "Wireless Bluetooth Earbuds - Premium Sound Quality",
  "description": "High-fidelity wireless earbuds with active noise cancellation...",
  "price": 89.99,
  "comparePrice": 129.99,
  "category": "Electronics > Audio",
  "tags": ["earbuds", "wireless", "bluetooth", "audio", "headphones"],
  "ribbon": "Tech"
}
```

### Example 3: Home Decor

**Image**: Photo of a decorative wall print

**AI Output**:
```json
{
  "name": "Abstract Mountain Landscape Art Print - Modern Wall Decor",
  "description": "Stunning abstract interpretation of mountain landscapes...",
  "price": 45.00,
  "comparePrice": 65.00,
  "category": "Home & Living > Wall Art",
  "tags": ["art print", "wall decor", "mountain", "landscape", "modern"],
  "ribbon": "Art",
  "variants": {
    "suggested": true,
    "options": [
      {"name": "Size", "values": ["8x10", "11x14", "16x20", "24x36"]}
    ]
  }
}
```

## Advanced Features

### Multi-Image Analysis

Upload multiple product images for enhanced analysis:
- Main image → product name and primary description
- Lifestyle image → use case suggestions
- Detail shots → feature highlights
- Variant images → color/style options

### Batch Product Creation

Upload multiple product images to create multiple products:
```bash
for image in /path/to/images/*.jpg; do
  # Claude analyzes each image
  # Generates unique product data
  # Creates products automatically
done
```

### Image Quality Assessment

Claude evaluates image suitability:
- Resolution check (minimum 800x800)
- Background quality (white/clean preferred)
- Lighting assessment
- Angle and composition
- Professional vs amateur quality

**Output**:
```
📸 Image Quality Assessment:
  Resolution:    1200x1200px ✓ (Excellent)
  Background:    White ✓ (Professional)
  Lighting:      Well-lit ✓
  Composition:   Centered ✓
  Overall Grade: A (Professional quality)

  💡 Recommendation: Perfect for main product image
```

## Output Format

### Success Response

```json
{
  "analysis": {
    "productType": "Ceramic Mug",
    "confidence": 0.95,
    "primaryColor": "Blue",
    "materials": ["Ceramic", "Pottery"],
    "style": "Handmade"
  },
  "generatedProduct": {
    "id": "new-product-id-123",
    "name": "Handcrafted Blue Ceramic Mug",
    "price": 24.99,
    "status": "created",
    "visible": true
  },
  "recommendations": [
    "Consider creating variants for different colors",
    "Add product to 'Handmade' collection",
    "Enable gift wrapping option"
  ],
  "message": "🎉 Product created successfully from image analysis!"
}
```

## Best Practices

1. **Image Quality**: Use high-resolution, professional photos for best analysis results
2. **Review Before Publishing**: Always review AI-generated content before making product visible
3. **Adjust Pricing**: AI provides suggestions; adjust based on your market and costs
4. **Add Personal Touch**: Enhance AI descriptions with your brand voice
5. **Multiple Images**: Upload 3-5 images for complete product representation

## Limitations

- **Pricing**: AI suggests based on visual quality; doesn't know your actual costs
- **Quantities**: AI suggests conservative inventory; adjust based on your stock
- **Variants**: AI can suggest but cannot see all variant images
- **Specifications**: Cannot detect technical specs not visible in image (battery life, dimensions beyond visual estimate)

## Example Use Cases

1. **Quick Upload**: "Create product from this image: /Downloads/product.jpg"
2. **Batch Import**: "Analyze all images in /Products folder and create listings"
3. **Variant Detection**: "This image shows 3 colors - create variants"
4. **Quality Check**: "Is this image good enough for a product photo?"
5. **Comparison**: "Compare these two product images and suggest which to use"
