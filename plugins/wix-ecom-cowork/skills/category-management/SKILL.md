# Category Management - Wix Collections & Categories API

## Overview

Complete category (collection) management including creation, product assignment, organization, and AI-powered product categorization.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Get All Categories

**REST API Endpoint**: `GET /_api/wix-ecommerce-renderer-web/store-manager/categories`

```bash
curl -X GET "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/categories" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response Structure**:
```json
{
  "categories": [
    {
      "id": "category-123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "visible": true,
      "numberOfProducts": 45,
      "parentId": null
    }
  ]
}
```

## Query Categories (GraphQL)

**GraphQL Endpoint**: `POST /_api/wix-ecommerce-graphql-web/api`

**Query**: `categories`

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "{site { categoriesComponents {success categorySettings {categoryId connected} }}}",
  "operationName": "categories",
  "source": "WixStoresWebClient"
}'
```

**Response**:
```json
{
  "data": {
    "site": {
      "categoriesComponents": {
        "success": true,
        "categorySettings": [
          {
            "categoryId": "category-123",
            "connected": true
          }
        ]
      }
    }
  }
}
```

## Query Collections (REST)

**Endpoint**: `POST https://www.wixapis.com/stores/v1/collections/query`

```bash
curl -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 50, "offset": 0}
  }
}'
```

**Response**:
```json
{
  "collections": [
    {
      "id": "collection-123",
      "name": "Summer Collection",
      "slug": "summer-collection",
      "description": "Hot summer items",
      "visible": true,
      "numberOfProducts": 25,
      "media": {
        "mainMedia": {
          "image": {
            "url": "https://static.wixstatic.com/media/image.jpg"
          }
        }
      }
    }
  ],
  "metadata": {
    "count": 1,
    "offset": 0,
    "total": 5
  }
}
```

## Create Category/Collection

**Endpoint**: `POST https://www.wixapis.com/stores/v1/collections`

```bash
curl -X POST "https://www.wixapis.com/stores/v1/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "name": "New Category Name",
    "description": "Category description here",
    "visible": true
  }
}'
```

**Response**:
```json
{
  "collection": {
    "id": "new-collection-123",
    "name": "New Category Name",
    "slug": "new-category-name",
    "description": "Category description here",
    "visible": true,
    "numberOfProducts": 0
  }
}
```

## Update Category

**Endpoint**: `PATCH https://www.wixapis.com/stores/v1/collections/{id}`

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/collections/${COLLECTION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "collection": {
    "name": "Updated Category Name",
    "description": "Updated description",
    "visible": true
  }
}'
```

## Add Products to Category

**Method 1: Update Product (Add Category ID)**

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "id": "'"${PRODUCT_ID}"'",
    "collectionIds": ["collection-123", "collection-456"]
  }
}'
```

**Method 2: Bulk Assignment (GraphQL)**

Use `getProductsList` to query products, then update multiple products:

```bash
# First, get products that should be in this category
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsList($offset: Int, $limit: Int, $filters: ProductFilters) { catalog { products(offset: $offset, limit: $limit, filters: $filters) { list { id name categoryIds } } } }",
  "variables": {"limit": 100, "offset": 0},
  "operationName": "getProductsList",
  "source": "WixStoresWebClient"
}'

# Then bulk update products to add category
# (Use REST API PATCH in a loop or bulk endpoint)
```

## Get Products by Category

**GraphQL with Filters**:

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsList($offset: Int, $limit: Int, $filters: ProductFilters) { catalog { products(offset: $offset, limit: $limit, filters: $filters) { totalCount list { id name price categoryIds } } } }",
  "variables": {
    "limit": 100,
    "offset": 0,
    "filters": {"categoryIds": ["CATEGORY_ID"]}
  },
  "operationName": "getProductsList",
  "source": "WixStoresWebClient"
}' | jq '{
  category: "CATEGORY_NAME",
  totalProducts: .data.catalog.products.totalCount,
  products: [.data.catalog.products.list[] | {id, name, price}]
}'
```

## Count Products in Category

**GraphQL**: `getProductsTotalCount`

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
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
}'
```

## Remove Products from Category

Update product and remove category ID from `collectionIds`:

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "id": "'"${PRODUCT_ID}"'",
    "collectionIds": []
  }
}'
```

## Delete Category

**Endpoint**: `DELETE https://www.wixapis.com/stores/v1/collections/{id}`

```bash
curl -X DELETE "https://www.wixapis.com/stores/v1/collections/${COLLECTION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Note**: Deleting a category does NOT delete the products, only the category assignment.

## AI-Powered Product Categorization

### Category Matching Algorithm

For each product, analyze:
1. **Product name** - Extract keywords
2. **Product description** - Identify product type
3. **Existing tags** - Match with category names
4. **Product type** - Physical/digital/service
5. **Price range** - Category price patterns

### Example Matching Logic

```javascript
// Pseudo-code for AI category matching
function matchProductToCategory(product, categories) {
  const productKeywords = extractKeywords(product.name + ' ' + product.description);

  const scores = categories.map(category => {
    const categoryKeywords = extractKeywords(category.name + ' ' + category.description);
    const matchScore = calculateSimilarity(productKeywords, categoryKeywords);

    return {
      categoryId: category.id,
      categoryName: category.name,
      score: matchScore,
      confidence: matchScore > 0.7 ? 'high' : matchScore > 0.4 ? 'medium' : 'low'
    };
  });

  return scores.sort((a, b) => b.score - a.score)[0];
}
```

### Category Keyword Patterns

**Clothing**: shirt, dress, pants, jacket, shoes, apparel, fashion, wear
**Electronics**: phone, computer, gadget, tech, device, electronic
**Home & Living**: furniture, decor, kitchen, bedding, home
**Beauty**: skincare, makeup, cosmetic, beauty, fragrance
**Food & Beverage**: food, drink, snack, beverage, organic
**Sports & Fitness**: fitness, sports, exercise, gym, outdoor
**Books & Media**: book, ebook, audiobook, media, magazine
**Toys & Games**: toy, game, puzzle, kids, children

## Bulk Category Assignment

### Assign Multiple Products to One Category

```bash
# Get all products
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

# Loop and assign
for product_id in $(echo "$products" | jq -r '.products[].id'); do
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "product": {
      "id": "'"${product_id}"'",
      "collectionIds": ["TARGET_CATEGORY_ID"]
    }
  }' > /dev/null

  echo "✅ Added product ${product_id} to category"
  sleep 0.2  # Rate limiting
done
```

## Best Practices

1. **Category Naming**: Clear, specific names (avoid "Other", "Misc")
2. **Category Hierarchy**: Use parent categories for organization
3. **Product Limits**: Keep categories under 100 products for performance
4. **Visibility**: Set new categories to invisible until fully configured
5. **SEO**: Add descriptions to categories for better search ranking
6. **Multiple Categories**: Products can belong to multiple categories
