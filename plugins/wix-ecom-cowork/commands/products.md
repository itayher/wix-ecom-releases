# Products - Interactive Product Management

Search, view, edit, and manage products in your Wix store with interactive workflows.

## Command Pattern

```
Show me my products
List all products
Search for products with "blue"
Show me product details for [product ID]
Update product [product ID]
Create a new product
Archive product [product ID]
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
  console.error('❌ No site selected. Use: \"Select site 1\"');
  process.exit(1);
}

console.error(\`✓ Active store: \${getActiveSiteName()}\`);
"
```

### Step 2: Query Products

Use the **product-management** skill patterns:

#### List All Products (Paginated)

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 50,
      "offset": 0
    }
  }
}' | jq '{
  total: .metadata.total,
  showing: .metadata.count,
  products: [.products[] | {
    id: .id,
    name: .name,
    price: .price,
    visible: .visible,
    inStock: .stock.inStock,
    quantity: .stock.quantity
  }]
}'
```

#### Search Products by Name

```bash
SEARCH_TERM="blue"

curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"name\\\": {\\\"\\$contains\\\": \\\"$SEARCH_TERM\\\"}}\",
    \"paging\": {\"limit\": 20}
  }
}" | jq '[.products[] | {
  id: .id,
  name: .name,
  price: .price,
  inStock: .stock.inStock
}]'
```

#### Filter Visible Products Only

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 50}
  }
}' | jq '[.products[] | {id, name, price}]'
```

#### Filter by Price Range

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"price\": {\"$gte\": 20, \"$lte\": 100}}",
    "sort": "{\"price\": \"asc\"}",
    "paging": {"limit": 50}
  }
}' | jq '[.products[] | {name, price, id}]'
```

### Step 3: Get Single Product Details

```bash
PRODUCT_ID="abc123-def456"

curl -s -X GET "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json" | jq '{
  id: .product.id,
  name: .product.name,
  description: .product.description,
  price: .product.price,
  comparePrice: .product.comparePrice,
  costPrice: .product.cost.price,
  visible: .product.visible,
  productType: .product.productType,
  stock: {
    trackInventory: .product.stock.trackInventory,
    inStock: .product.stock.inStock,
    quantity: .product.stock.quantity
  },
  images: [.product.media.items[] | select(.image != null) | .image.url],
  variants: .product.variants
}'
```

### Step 4: Create New Product

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "New Product Name",
    "description": "<p>Detailed product description goes here.</p>",
    "price": 29.99,
    "comparePrice": 39.99,
    "cost": {
      "price": 15.00,
      "currency": "USD"
    },
    "visible": true,
    "productType": "physical",
    "stock": {
      "trackInventory": true,
      "quantity": 100,
      "inStock": true
    }
  }
}' | jq '{
  id: .product.id,
  name: .product.name,
  price: .product.price,
  message: "✅ Product created successfully"
}'
```

### Step 5: Update Product

```bash
PRODUCT_ID="abc123-def456"

curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "Updated Product Name",
    "description": "<p>Updated description</p>",
    "price": 34.99,
    "visible": true
  }
}' | jq '{
  id: .product.id,
  name: .product.name,
  price: .product.price,
  message: "✅ Product updated successfully"
}'
```

### Step 6: Bulk Update Visibility

```bash
# Get all hidden products
hidden_products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"visible\": false}", "paging": {"limit": 100}}}' | jq -r '.products[].id')

# Make all visible
for pid in $hidden_products; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${pid}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{"product": {"visible": true}}' > /dev/null

  echo "✅ Made product ${pid} visible"
  sleep 0.2
done

echo "✅ Bulk update complete"
```

### Step 7: Delete (Archive) Product

```bash
PRODUCT_ID="abc123-def456"

curl -s -X DELETE "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"

echo "✅ Product archived successfully"
```

## Output Format

### Product List Output

```json
{
  "total": 156,
  "showing": 50,
  "products": [
    {
      "id": "abc123",
      "name": "Blue Widget",
      "price": 29.99,
      "visible": true,
      "inStock": true,
      "quantity": 45
    }
  ]
}
```

### Product Details Output

```json
{
  "id": "abc123",
  "name": "Blue Widget",
  "description": "<p>High quality widget</p>",
  "price": 29.99,
  "comparePrice": 39.99,
  "costPrice": 15.00,
  "visible": true,
  "productType": "physical",
  "stock": {
    "trackInventory": true,
    "inStock": true,
    "quantity": 45
  },
  "images": [
    "https://static.wixstatic.com/media/abc123.jpg"
  ],
  "variants": []
}
```

## Skills Referenced

- **product-management**: Complete CRUD operations, variants, media management
- **catalog-optimization**: Product quality checks and recommendations

## Common Query Patterns

### 1. Find Out of Stock Products

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.inStock\": false, \"visible\": true}", "paging": {"limit": 100}}}' | jq '[.products[] | {id, name, quantity: .stock.quantity}]'
```

### 2. Find Products Without Images

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}' | jq '[.products[] | select(.media.mainMedia.image == null) | {id, name}]'
```

### 3. Find Products with Low Margins

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}' | jq '[.products[] | select(.cost != null and .price != null) | {
  id,
  name,
  price: .price,
  cost: .cost.price,
  margin: (((.price | tonumber) - (.cost.price | tonumber)) / (.price | tonumber) * 100)
} | select(.margin < 30)]'
```

### 4. Find Products Not Tracking Inventory

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"stock.trackInventory\": false}", "paging": {"limit": 100}}}' | jq '[.products[] | {id, name}]'
```

## Example Use Cases

1. **Browse Catalog**: "Show me all my products"
2. **Search**: "Find products with 'organic' in the name"
3. **Inventory Check**: "Which products are out of stock?"
4. **Price Review**: "Show me products under $50"
5. **Product Details**: "Get full details for product abc123"
6. **Quick Update**: "Update product abc123 price to $34.99"
7. **Bulk Operations**: "Make all hidden products visible"

## Related Commands

- `/wix:optimize-products` - Fix product quality issues
- `/wix:inventory-audit` - Stock level analysis
- `/wix:create-campaign` - Create promotions for products
