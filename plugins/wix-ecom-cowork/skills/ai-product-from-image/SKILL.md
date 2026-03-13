# AI Product Creation from Image - Vision-Powered Product Generation

## Overview

Create complete product listings automatically by analyzing product images using Claude's vision capabilities. Upload a product image and generate name, description, category, pricing suggestions, and more.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Claude Vision**: Enabled (analyze images to extract product details)

## Workflow

### Step 1: Image Analysis

Claude will analyze the uploaded product image to identify:

**Visual Attributes**:
- Product type (clothing, electronics, home goods, etc.)
- Colors and materials
- Style and design elements
- Product condition (new, vintage, handmade)
- Notable features or details

**Suggested Metadata**:
- Product name (descriptive, keyword-rich)
- Product description (compelling, SEO-optimized)
- Category recommendations
- Suggested price range (based on product type and quality)
- Target audience
- Keywords and tags

### Step 2: Generate Product Data

Based on image analysis, create structured product data:

```json
{
  "name": "Vintage Denim Jacket - Classic Blue",
  "description": "Classic vintage-style denim jacket featuring a timeless blue wash, button closure, and multiple pockets. Perfect for casual everyday wear. Made from durable cotton denim with a comfortable fit.",
  "price": 79.99,
  "comparePrice": 99.99,
  "productType": "physical",
  "category": "Outerwear",
  "tags": ["denim", "jacket", "vintage", "blue", "casual"],
  "sku": "DENIM-JACKET-BLUE-001"
}
```

### Step 3: Create Product via API

**Using REST API**:
```bash
curl -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "AI_GENERATED_NAME",
    "description": "AI_GENERATED_DESCRIPTION",
    "price": AI_SUGGESTED_PRICE,
    "comparePrice": AI_SUGGESTED_COMPARE_PRICE,
    "productType": "physical",
    "visible": false,
    "categoryIds": ["AI_SUGGESTED_CATEGORY_ID"],
    "ribbon": "AI_SUGGESTED_RIBBON",
    "stock": {
      "trackInventory": true,
      "quantity": 0
    }
  }
}'
```

### Step 4: Upload Product Image

After creating the product, upload the original image:

```bash
# First, get the product ID from creation response
PRODUCT_ID="created-product-id"

# Upload image to Wix Media Manager (requires separate API call)
# Then attach to product
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
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
}'
```

## AI Analysis Capabilities

### Product Type Detection

Claude can identify:
- **Clothing**: Tops, bottoms, dresses, outerwear, shoes, accessories
- **Electronics**: Phones, computers, accessories, smart devices
- **Home Goods**: Furniture, decor, kitchen items, bedding
- **Beauty**: Skincare, makeup, haircare, fragrances
- **Jewelry**: Rings, necklaces, bracelets, earrings
- **Art**: Prints, paintings, sculptures, photography
- **Books**: Fiction, non-fiction, educational, children's
- **Toys**: Educational, collectibles, games, outdoor
- **Food**: Packaged goods, beverages, specialty items

### Attribute Extraction

**Visual Attributes**:
- Primary colors
- Materials (cotton, metal, plastic, wood, glass)
- Patterns (solid, striped, floral, geometric)
- Style (modern, vintage, minimalist, bohemian)
- Size indicators (if visible in image)

**Quality Indicators**:
- Professional product photography → higher price point
- Handmade/artisan appearance → unique pricing
- Brand visibility → premium pricing
- Condition assessment → pricing adjustment

## Pricing Suggestions

### Pricing Formula

Based on visual analysis:
```
Base Price = Product Type Base × Quality Multiplier × Uniqueness Factor

Quality Multiplier:
- Professional photography: 1.2x
- Handmade/artisan: 1.3x
- Premium materials: 1.4x
- Mass-produced: 1.0x

Uniqueness Factor:
- Common item: 1.0x
- Moderately unique: 1.1x
- Highly unique/rare: 1.3x
- Custom/one-of-a-kind: 1.5x
```

**Compare-at Price**: Suggested price × 1.25 (to show 20% savings)

## Description Generation

### Template Structure

```
[Opening Hook - What makes this product special]

[Key Features - Bullet points]
• Feature 1
• Feature 2
• Feature 3

[Benefits - Why customer should buy]

[Specifications - Concrete details]
- Material: [detected from image]
- Color: [detected from image]
- Style: [detected from image]

[Use Cases - How to use/wear/display]

[Care Instructions - If applicable]
```

### SEO Optimization

**Title Format**: `[Adjective] [Product Type] - [Key Feature] [Color/Material]`

Examples:
- Vintage Denim Jacket - Classic Blue Wash
- Handcrafted Ceramic Mug - Minimalist White Design
- Premium Leather Wallet - RFID Protection Black

**Description Keywords**: Include relevant search terms naturally
- Product type keywords
- Material keywords
- Style keywords
- Use case keywords

## Category Suggestions

### Category Mapping

Based on product type detected:
- Clothing → "Apparel", "Fashion", "Clothing"
- Electronics → "Electronics", "Technology", "Gadgets"
- Home Goods → "Home & Living", "Decor", "Furniture"
- Beauty → "Beauty", "Skincare", "Cosmetics"
- Art → "Art", "Prints", "Wall Decor"

### Multi-Category Assignment

Some products fit multiple categories:
- Yoga Mat → "Fitness", "Health & Wellness", "Sports Equipment"
- Coffee Mug → "Kitchen", "Drinkware", "Home Goods"

## Variant Recommendations

### When Image Shows Variants

If image shows multiple colors/sizes:
- Suggest creating variant options
- Recommend color options based on visible colors
- Suggest standard size options based on product type

**Example for Clothing**:
```json
{
  "options": [
    {
      "name": "Size",
      "selections": ["Small", "Medium", "Large", "X-Large"]
    },
    {
      "name": "Color",
      "selections": ["Blue", "Black", "Gray"]
    }
  ]
}
```

### Single Product Image

If only one variant visible:
- Create single product (no variants)
- Mention in description if other colors/sizes available
- Recommend uploading additional variant images

## AI-Suggested Ribbons

Based on product analysis:
- **"New Arrival"**: Fresh/modern products, trending items
- **"Bestseller"**: Popular product types
- **"Limited Edition"**: Unique/rare items
- **"Handmade"**: Artisan/craft products
- **"Eco-Friendly"**: Sustainable materials visible
- **"Sale"**: If suggesting compare-at price discount

## Inventory Recommendations

### Initial Stock Quantity

**Conservative Approach** (default):
- Unique/handmade items: 1-5 units
- Standard products: 10-20 units
- Popular/fast-moving: 50-100 units

**Based on Product Type**:
- Digital products: 999 (unlimited)
- Made-to-order: 0 (backorder enabled)
- Limited edition: Actual count
- Vintage/one-of-a-kind: 1

### Stock Management

**Track Inventory**:
- Yes: Physical products, limited quantities
- No: Digital products, services, infinite supply

**Preorder Settings**:
- Enable for: Upcoming releases, made-to-order
- Preorder message: "Ships in 2-3 weeks" or custom timeline

## Complete Example Workflow

### Input: Product Image of Blue Ceramic Mug

**AI Analysis Output**:
```json
{
  "productType": "physical",
  "name": "Handcrafted Blue Ceramic Mug - Artisan Coffee Cup",
  "description": "Beautiful handcrafted ceramic mug featuring a unique blue glaze finish. Perfect for your morning coffee or afternoon tea. Each mug is individually made, making yours truly one-of-a-kind.\n\nKey Features:\n• Handmade ceramic construction\n• Vibrant blue glaze finish\n• Comfortable handle design\n• Microwave and dishwasher safe\n• 12 oz capacity\n\nIdeal for:\n• Daily coffee enjoyment\n• Thoughtful gifts\n• Home or office use\n\nCare: Dishwasher safe, though hand washing recommended to preserve glaze brilliance.",
  "suggestedPrice": 24.99,
  "comparePrice": 32.99,
  "category": "Kitchen & Dining",
  "tags": ["mug", "ceramic", "handmade", "blue", "coffee", "tea", "artisan"],
  "ribbon": "Handmade",
  "sku": "MUG-CERAMIC-BLUE-001",
  "inventory": {
    "quantity": 5,
    "trackInventory": true
  },
  "weight": 0.8,
  "seo": {
    "title": "Handcrafted Blue Ceramic Mug | Artisan Coffee Cup",
    "description": "Unique handmade blue ceramic mug perfect for coffee or tea. Dishwasher safe, 12 oz capacity. Each piece is one-of-a-kind artisan crafted."
  }
}
```

**API Call Sequence**:
```bash
# 1. Get categories
curl -X GET "/_api/wix-ecommerce-renderer-web/store-manager/categories"

# 2. Get tax groups
curl -X POST "/_api/tax-groups/v1/taxGroups/query"

# 3. Create product
curl -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "Handcrafted Blue Ceramic Mug - Artisan Coffee Cup",
    "description": "[AI_GENERATED_DESCRIPTION]",
    "price": 24.99,
    "comparePrice": 32.99,
    "cost": {"price": 12.00},
    "productType": "physical",
    "sku": "MUG-CERAMIC-BLUE-001",
    "visible": false,
    "ribbon": "Handmade",
    "weight": 0.8,
    "stock": {
      "trackInventory": true,
      "quantity": 5
    },
    "categoryIds": ["CATEGORY_ID_FROM_STEP_1"],
    "taxGroupId": "TAX_GROUP_ID_FROM_STEP_2"
  }
}'

# 4. Upload and attach image
# [Image upload workflow]

# 5. Make visible
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"product": {"visible": true}}'
```
