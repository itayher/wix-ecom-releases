# Product Management - Wix Stores API

## Overview

Complete product CRUD operations including variants, media, collections, and bulk operations using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Query Products

### Basic Query

**Endpoint**: `POST https://www.wixapis.com/stores/v1/products/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
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
}'
```

**Response:**

```json
{
  "products": [
    {
      "id": "abc123",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "visible": true,
      "productType": "physical",
      "stock": {
        "trackInventory": true,
        "inStock": true,
        "quantity": 100
      }
    }
  ],
  "metadata": {
    "count": 50,
    "offset": 0,
    "total": 234
  }
}
```

### Query Visible Products Only

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}'
```

### Query Products by Price Range

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"price\": {\"$gte\": 10, \"$lte\": 100}}",
    "sort": "{\"price\": \"asc\"}",
    "paging": {"limit": 50}
  }
}'
```

### Query Products by Collection

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"collectionIds\": \"collection-abc123\"}",
    "paging": {"limit": 100}
  }
}'
```

## Get Single Product

**Endpoint**: `GET https://www.wixapis.com/stores/v1/products/{productId}`

**API Call:**

```bash
curl -X GET "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "product": {
    "id": "abc123",
    "name": "Product Name",
    "slug": "product-name",
    "visible": true,
    "productType": "physical",
    "description": "Full product description",
    "price": 29.99,
    "comparePrice": 39.99,
    "sku": "PROD-001",
    "weight": 1.5,
    "stock": {
      "trackInventory": true,
      "inStock": true,
      "quantity": 100
    },
    "media": {
      "mainMedia": {
        "image": {
          "url": "https://static.wixstatic.com/media/image.jpg",
          "altText": "Product image"
        }
      },
      "items": []
    },
    "customTextFields": [],
    "productOptions": [],
    "variants": []
  }
}
```

## Create Product

**Endpoint**: `POST https://www.wixapis.com/stores/v1/products`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "New Product",
    "description": "Product description here",
    "priceData": {
      "price": 29.99
    },
    "productType": "physical",
    "visible": true,
    "stock": {
      "trackInventory": true,
      "quantity": 50
    }
  }
}'
```

**Response:**

```json
{
  "product": {
    "id": "new-product-id-123",
    "name": "New Product",
    "slug": "new-product",
    "price": 29.99,
    "visible": true,
    "stock": {
      "trackInventory": true,
      "inStock": true,
      "quantity": 50
    }
  }
}
```

## Update Product

**Endpoint**: `PATCH https://www.wixapis.com/stores/v1/products/{productId}`

**Update Price and Visibility:**

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "price": 24.99,
    "comparePrice": 34.99,
    "visible": true
  }
}'
```

**Update Description and SEO:**

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "description": "Updated product description",
    "seoData": {
      "tags": [
        {
          "type": "title",
          "children": "SEO Title",
          "custom": true
        },
        {
          "type": "meta",
          "props": {
            "name": "description",
            "content": "SEO description"
          }
        }
      ]
    }
  }
}'
```

## Delete Product

**Endpoint**: `DELETE https://www.wixapis.com/stores/v1/products/{productId}`

**API Call:**

```bash
curl -X DELETE "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response:**

```json
{
  "product": {
    "id": "abc123"
  }
}
```

## Product Variants

### Create Product with Variants

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "T-Shirt",
    "description": "Cotton t-shirt",
    "priceData": {
      "price": 19.99
    },
    "productType": "physical",
    "productOptions": [
      {
        "name": "Size",
        "choices": [
          {"value": "Small", "description": "S"},
          {"value": "Medium", "description": "M"},
          {"value": "Large", "description": "L"}
        ]
      },
      {
        "name": "Color",
        "choices": [
          {"value": "Red"},
          {"value": "Blue"},
          {"value": "Green"}
        ]
      }
    ],
    "manageVariants": true
  }
}'
```

### Query Product Variants

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"id\": \"${PRODUCT_ID}\"}",
    "paging": {"limit": 1}
  }
}'
```

**Extract variants from response:**

```json
{
  "products": [
    {
      "id": "product-123",
      "variants": [
        {
          "id": "variant-001",
          "choices": {
            "Size": "Small",
            "Color": "Red"
          },
          "variant": {
            "priceData": {
              "price": 19.99
            },
            "stock": {
              "trackQuantity": true,
              "quantity": 10,
              "inStock": true
            },
            "sku": "TSHIRT-S-RED"
          }
        }
      ]
    }
  ]
}
```

### Update Variant Pricing

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "variants": [
      {
        "id": "variant-001",
        "variant": {
          "priceData": {
            "price": 17.99,
            "comparePrice": 24.99
          }
        }
      }
    ]
  }
}'
```

## Product Media

### Add Main Image

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "media": {
      "mainMedia": {
        "image": {
          "url": "https://static.wixstatic.com/media/your-image.jpg",
          "altText": "Product main image"
        }
      }
    }
  }
}'
```

### Add Multiple Images

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "media": {
      "items": [
        {
          "image": {
            "url": "https://static.wixstatic.com/media/image1.jpg",
            "altText": "First image"
          }
        },
        {
          "image": {
            "url": "https://static.wixstatic.com/media/image2.jpg",
            "altText": "Second image"
          }
        }
      ]
    }
  }
}'
```

## Product Collections

### Query Collections

**Endpoint**: `POST https://www.wixapis.com/stores/v1/collections/query`

```bash
curl -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 50}
  }
}'
```

**Response:**

```json
{
  "collections": [
    {
      "id": "collection-123",
      "name": "Summer Collection",
      "slug": "summer-collection",
      "description": "Hot summer items",
      "visible": true,
      "numberOfProducts": 25
    }
  ],
  "metadata": {
    "count": 1,
    "total": 1
  }
}
```

### Add Product to Collection

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "collectionIds": ["collection-123", "collection-456"]
  }
}'
```

### Remove Product from Collection

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "collectionIds": []
  }
}'
```

## Bulk Operations

### Bulk Update Product Visibility

**Endpoint**: `POST https://www.wixapis.com/stores/v1/bulk/products/update`

**Maximum**: 100 products per request

```bash
curl -X POST "https://www.wixapis.com/stores/v1/bulk/products/update" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "set": [
    {
      "id": "product-1",
      "property": "visible",
      "value": true
    },
    {
      "id": "product-2",
      "property": "visible",
      "value": true
    },
    {
      "id": "product-3",
      "property": "visible",
      "value": false
    }
  ]
}'
```

**Response:**

```json
{
  "bulkActionMetadata": {
    "totalSuccesses": 3,
    "totalFailures": 0,
    "undetailedFailures": 0
  },
  "results": [
    {
      "itemMetadata": {
        "id": "product-1",
        "originalIndex": 0,
        "success": true
      },
      "item": {
        "id": "product-1"
      }
    }
  ]
}
```

### Bulk Update Prices

```bash
curl -X POST "https://www.wixapis.com/stores/v1/bulk/products/update" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "set": [
    {
      "id": "product-1",
      "property": "price",
      "value": 19.99
    },
    {
      "id": "product-2",
      "property": "price",
      "value": 29.99
    }
  ]
}'
```

### Bulk Update Multiple Properties

**Note**: Use `Bulk Adjust Product Properties` endpoint for multiple properties per product

```bash
curl -X POST "https://www.wixapis.com/stores/v1/bulk/products/adjust" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "products": [
    {
      "id": "product-1",
      "price": 19.99,
      "visible": true,
      "stock": {
        "quantity": 50
      }
    },
    {
      "id": "product-2",
      "price": 29.99,
      "visible": false
    }
  ]
}'
```

## Common Product Patterns

### Get All Products (Paginated)

```bash
#!/bin/bash

OFFSET=0
LIMIT=100
TOTAL=999999

while [ $OFFSET -lt $TOTAL ]; do
  response=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": {\"paging\": {\"limit\": $LIMIT, \"offset\": $OFFSET}}}")

  echo "$response" | jq '.products[]'

  TOTAL=$(echo "$response" | jq '.metadata.total')
  COUNT=$(echo "$response" | jq '.metadata.count')

  OFFSET=$((OFFSET + COUNT))

  if [ $COUNT -eq 0 ]; then
    break
  fi
done
```

### Find Products Below Reorder Point

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.trackInventory\": true, \"stock.quantity\": {\"$lte\": 10}}",
    "sort": "{\"stock.quantity\": \"asc\"}",
    "paging": {"limit": 100}
  }
}'
```

### Find Out of Stock Products

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"stock.inStock\": false, \"visible\": true}",
    "paging": {"limit": 100}
  }
}'
```

### Find High-Priced Products

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"price\": {\"$gte\": 100}}",
    "sort": "{\"price\": \"desc\"}",
    "paging": {"limit": 50}
  }
}'
```

## Product Schema Reference

### Minimal Product

```json
{
  "name": "Product Name",
  "price": 29.99,
  "productType": "physical"
}
```

### Complete Product

```json
{
  "name": "Product Name",
  "description": "Full product description",
  "price": 29.99,
  "comparePrice": 39.99,
  "cost": 15.00,
  "sku": "PROD-001",
  "productType": "physical",
  "visible": true,
  "slug": "product-name",
  "weight": 1.5,
  "stock": {
    "trackInventory": true,
    "quantity": 100,
    "inStock": true
  },
  "media": {
    "mainMedia": {
      "image": {
        "url": "https://static.wixstatic.com/media/main.jpg",
        "altText": "Main product image"
      }
    },
    "items": []
  },
  "collectionIds": ["collection-123"],
  "ribbon": "Sale",
  "brand": "Brand Name",
  "customTextFields": [],
  "productOptions": [],
  "manageVariants": false,
  "variants": []
}
```

## Documentation References

- Query Products: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/query-products
- Get Product: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/get-product
- Create Product: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/create-product
- Update Product: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/update-product
- Bulk Update: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/bulk-update-product-property
- Query Collections: https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/query-collections
- Catalog V3 (Preview): https://dev.wix.com/docs/rest/business-solutions/stores/catalog-v3/products-v3/introduction
