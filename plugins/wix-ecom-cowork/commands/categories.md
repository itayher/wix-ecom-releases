# Categories - Product Category & Collection Management

Manage product categories (collections), create new categories, assign products, and organize your store catalog.

## Command Pattern

```
Show me all categories
List my product categories
Create a new category called "Electronics"
Add products to category [category name]
Show products in category [category name]
How many products are in [category name]?
```

## Purpose

Manage product categories/collections for better store organization, easier customer navigation, and improved SEO.

## Skills Referenced

- **category-management**: Category CRUD, product assignment, GraphQL queries
- **product-graphql**: Product queries with category filters
- **store-manager**: Category settings and configuration
- **wix-api-core**: Authentication and pagination

## Workflow

### List All Categories

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

curl -s -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 50}
  }
}' | jq '[.collections[] | {
  id,
  name,
  productCount: .numberOfProducts,
  visible,
  slug
}]'
```

### Create New Category

```bash
curl -s -X POST "https://www.wixapis.com/stores/v1/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "name": "NEW_CATEGORY_NAME",
    "description": "CATEGORY_DESCRIPTION",
    "visible": true
  }
}' | jq '{
  categoryId: .collection.id,
  name: .collection.name,
  slug: .collection.slug,
  message: "✅ Category created successfully"
}'
```

### Add Product to Category

```bash
PRODUCT_ID="product-id-here"
CATEGORY_ID="category-id-here"

curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "id": "'"${PRODUCT_ID}"'",
    "collectionIds": ["'"${CATEGORY_ID}"'"]
  }
}' | jq '{
  productId: .product.id,
  productName: .product.name,
  categories: .product.collectionIds,
  message: "✅ Product added to category"
}'
```

### Get Products in Category

**Using GraphQL**:

```bash
CATEGORY_ID="category-id-here"

curl -s -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsList($filters: ProductFilters) { catalog { products(filters: $filters) { totalCount list { id name price inventory { quantity } } } } }",
  "variables": {
    "filters": {"categoryIds": ["'"${CATEGORY_ID}"'"]}
  },
  "operationName": "getProductsList",
  "source": "WixStoresWebClient"
}' | jq '{
  categoryId: "'"${CATEGORY_ID}"'",
  totalProducts: .data.catalog.products.totalCount,
  products: [.data.catalog.products.list[] | {id, name, price}]
}'
```

### Count Products in Category

```bash
curl -s -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsTotalCount($filters: ProductFilters) { catalog { products(filters: $filters) { totalCount } } }",
  "variables": {
    "filters": {"categoryIds": ["CATEGORY_ID"]}
  },
  "operationName": "getProductsTotalCount",
  "source": "WixStoresWebClient"
}' | jq '{
  categoryId: "CATEGORY_ID",
  productCount: .data.catalog.products.totalCount
}'
```

### Update Category

```bash
CATEGORY_ID="category-id-here"

curl -s -X PATCH "https://www.wixapis.com/stores/v1/collections/${CATEGORY_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "name": "UPDATED_NAME",
    "description": "UPDATED_DESCRIPTION",
    "visible": true
  }
}' | jq '{
  categoryId: .collection.id,
  name: .collection.name,
  message: "✅ Category updated"
}'
```

## Output Format

### Category List

```json
[
  {
    "id": "cat-123",
    "name": "Electronics",
    "productCount": 45,
    "visible": true,
    "slug": "electronics"
  },
  {
    "id": "cat-456",
    "name": "Clothing",
    "productCount": 78,
    "visible": true,
    "slug": "clothing"
  }
]
```

### Products in Category

```json
{
  "categoryId": "cat-123",
  "categoryName": "Electronics",
  "totalProducts": 45,
  "products": [
    {"id": "p1", "name": "Wireless Headphones", "price": 89.99},
    {"id": "p2", "name": "USB Charger", "price": 19.99}
  ]
}
```

## Example Use Cases

1. **List Categories**: "Show me all my product categories"
2. **Create Category**: "Create a new category called 'Summer Collection'"
3. **Add Products**: "Add product XYZ to Electronics category"
4. **View Category**: "Show me all products in Clothing category"
5. **Category Stats**: "How many products are in each category?"
6. **Update Category**: "Rename 'Tech' category to 'Electronics'"

## Related Commands

- `/wix:auto-categorize` - AI-powered automatic categorization
- `/wix:create-category-ai` - Create category and auto-populate with matching products
- `/wix:products` - Product management
- `/wix:optimize-products` - Product quality improvements
