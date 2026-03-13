# Product Creation Workflow Guide - Best Practices

## Overview

Best practices and guided workflows for creating optimized, complete products in Wix Stores.

## Optimal Product Creation Workflow

### Phase 1: Preparation (Before API Calls)

**Step 1: Gather Product Information**
- Product name (clear, descriptive)
- High-quality images (1200x1200px minimum, white background)
- Product description (benefits, features, specifications)
- Pricing (cost, retail price, compare-at price)
- SKU (unique identifier)
- Category assignment
- Weight and dimensions (for shipping)

**Step 2: Define Product Structure**
- Product type: Physical, Digital, or Service
- Variants needed? (size, color, material)
- Custom options? (personalization, gift wrap)
- Subscription offering?

**Step 3: Plan Inventory**
- Track inventory? (yes for physical, optional for digital)
- Starting quantity
- Low stock threshold
- Backorder/preorder policy

### Phase 2: Product Creation API Sequence

**Recommended API Call Order**:

#### 1. Fetch Categories
```bash
GET /_api/wix-ecommerce-renderer-web/store-manager/categories
```
*Purpose*: Get available categories to assign product

#### 2. Fetch Tax Groups
```bash
POST /_api/tax-groups/v1/taxGroups/query
```
*Purpose*: Get tax group ID to assign (usually default tax group)

#### 3. Fetch Shipping Groups (Optional)
```bash
POST /_api/wix-ecommerce-graphql-web/api
# Query: getShippingGroups
```
*Purpose*: Get shipping group if product needs special shipping

#### 4. Create Product
```bash
POST /stores/v1/products
```
*Include*:
- Basic info (name, description, price)
- Cost of goods (for profit tracking)
- Tax group ID
- Category IDs
- Initial inventory quantity
- Visibility (false until ready)

#### 5. Add Product Images
```bash
PATCH /stores/v1/products/{id}
```
*Best practices*:
- Main image: Hero shot, white background
- Additional images: Different angles, lifestyle shots
- Alt text for SEO
- Proper ordering (main image first)

#### 6. Add Variants (If Applicable)
```bash
PATCH /stores/v1/products/{id}
```
*Define*:
- Product options (size, color)
- Option selections (Small, Medium, Large)
- Variant-specific pricing and SKUs
- Variant-specific inventory

#### 7. Set SEO Data
```bash
PATCH /stores/v1/products/{id}
```
*Include*:
- SEO title (60 characters)
- Meta description (160 characters)
- URL slug (keyword-optimized)

#### 8. Make Product Visible
```bash
PATCH /stores/v1/products/{id}
# Set visible: true
```

## Product Quality Checklist

### Must-Have (Required for Professional Store)
- [ ] Clear, descriptive product name
- [ ] High-quality main image
- [ ] Accurate price
- [ ] Product description (minimum 100 characters)
- [ ] SKU assigned
- [ ] Category assigned
- [ ] Tax group assigned
- [ ] Inventory tracking enabled

### Should-Have (Recommended)
- [ ] Compare-at price (for showing discounts)
- [ ] Cost of goods (for profit tracking)
- [ ] 3-5 product images
- [ ] Alt text on all images
- [ ] Product weight (for accurate shipping)
- [ ] SEO title and description
- [ ] Product ribbon (Sale, New, etc.)

### Nice-to-Have (Enhanced Experience)
- [ ] Brand assignment
- [ ] Additional info sections
- [ ] Custom text fields (personalization)
- [ ] Related products
- [ ] Digital downloads (if applicable)
- [ ] Subscription options

## Variant Best Practices

### When to Use Variants

**Use variants when**:
- Same product, different attributes (t-shirt sizes/colors)
- Shared description and images
- Related SKUs
- Example: "T-Shirt" with sizes S/M/L and colors Red/Blue

**Don't use variants when**:
- Completely different products
- Different descriptions needed
- Different categories
- Example: "Mug" and "T-Shirt" should be separate products

### Variant Naming Convention

**Good**:
- Option: "Size", Selections: "Small", "Medium", "Large"
- Option: "Color", Selections: "Red", "Blue", "Green"

**Bad**:
- Option: "S/M/L", Selections: "1", "2", "3"
- Option: "Options", Selections: "Option 1", "Option 2"

### Variant SKU Pattern

Format: `{BASE_SKU}-{OPTION1}-{OPTION2}`

Examples:
- TSHIRT-S-RED
- TSHIRT-M-BLUE
- TSHIRT-L-GREEN

### Variant Pricing Strategies

**Same price for all variants**:
- Set base product price
- All variants inherit

**Different prices by variant**:
- Set variant-specific pricing (common for size-based pricing)
- Example: Small $19.99, Medium $24.99, Large $29.99

## Common Pitfalls to Avoid

### 1. Missing Cost of Goods
**Issue**: Can't track profit margins
**Solution**: Always set `cost.price` when creating products

### 2. Not Setting Compare Price
**Issue**: Can't show discounts effectively
**Solution**: Set `comparePrice` higher than `price` to show savings

### 3. Forgetting Weight
**Issue**: Inaccurate shipping calculations
**Solution**: Always set weight for physical products

### 4. Poor Image Quality
**Issue**: Low conversion rates
**Solution**: Use 1200x1200px minimum, white background, professional photos

### 5. Weak Descriptions
**Issue**: Poor SEO, low customer confidence
**Solution**: Write detailed descriptions (100-500 words) with benefits and features

### 6. Creating Products Visible Immediately
**Issue**: Customers see incomplete products
**Solution**: Create products as `visible: false`, complete all details, then publish

## Advanced Workflows

### Bulk Product Creation

For creating multiple products:
1. Prepare all product data in structured format (JSON/CSV)
2. Create products with `visible: false`
3. Batch process images separately
4. Validate all required fields
5. Bulk update to `visible: true`

### Variant-Heavy Products

For products with many variants (10+ combinations):
1. Create base product
2. Define all options upfront
3. Generate variant SKUs systematically
4. Set inventory per variant carefully
5. Use variant-specific images where needed

### Seasonal Product Management

For seasonal/temporary products:
1. Use product ribbons ("Limited Edition", "Seasonal")
2. Set compare price to show discount
3. Plan inventory carefully (no overstock)
4. Use collections for seasonal grouping
5. Schedule visibility changes if possible
