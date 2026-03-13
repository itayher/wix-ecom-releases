# Product GraphQL API - Advanced Wix Stores

## Overview

Advanced product management using Wix's GraphQL API for comprehensive product operations including variants, options, media, fulfillment, subscriptions, and complete product schemas.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Endpoint**: `POST /_api/wix-ecommerce-graphql-web/api`

## Authentication

```bash
-H "Authorization: ${API_KEY}"
-H "wix-site-id: ${SITE_ID}"
-H "Content-Type: application/json"
```

## Get Complete Product Details (Including Variants)

**GraphQL Query: `getProductByIdPreOrder`**

Retrieves the complete product schema including variants, options, inventory, media, custom fields, subscription plans, and fulfillment details.

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductByIdPreOrder($productId: String!) { catalog { product(productId: $productId) { id name price discount { mode value } costAndProfitData { itemCost } currency inventory { status quantity preOrderInfoView { message preOrder limit } } isVisible media { id title url mediaType width height altText } productItemsSummary { productItemsCount inStockProductItemsCount inventoryQuantity } productItems { inventory { quantity status } costAndProfitData { itemCost } optionsSelections sku surcharge weight isVisible } sku productType isManageProductItems isTrackingInventory description options { id title optionType selections { id description value linkedMediaItems { url mediaType } } } customTextFields { title isMandatory inputLimit } categoryIds ribbon brand taxGroupId fulfillerId subscriptionPlans { list { id name discount { value mode } frequency duration } } } } }",
  "variables": {
    "productId": "PRODUCT_ID_HERE"
  },
  "operationName": "getProductByIdPreOrder",
  "source": "WixStoresWebClient"
}'
```

**Response Structure:**
- `product.id` - Product ID
- `product.name` - Product name
- `product.price` - Product price
- `product.options[]` - Product options (size, color, etc.)
  - `options[].selections[]` - Option values
- `product.productItems[]` - Variants with inventory
  - `productItems[].optionsSelections` - Variant combination
  - `productItems[].inventory` - Variant-specific stock
- `product.media[]` - Product images/videos
- `product.subscriptionPlans` - Subscription configurations
- `product.fulfillerId` - Fulfillment provider

## Query Products List

**GraphQL Query: `getProductsList`**

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsList($offset: Int, $limit: Int, $filters: ProductFilters, $sort: ProductSort) { catalog { products(offset: $offset, limit: $limit, filters: $filters, sort: $sort) { totalCount list { id name price currency inventory { status quantity } isVisible media { url } sku productType } } } }",
  "variables": {
    "limit": 100,
    "offset": 0
  },
  "operationName": "getProductsList",
  "source": "WixStoresWebClient"
}'
```

## Get Premium Features

**GraphQL Query: `getPremiumFeatures`**

Check which premium eCommerce features are enabled for the store.

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getPremiumFeatures($offset: Int, $limit: Int) { premiumFeatures(offset: $offset, limit: $limit) { name } storeInfo { hasActiveRecurringPaymentMethods } }",
  "variables": {
    "limit": 100,
    "offset": 0
  },
  "operationName": "getPremiumFeatures",
  "source": "WixStoresWebClient"
}'
```

## Get Fulfillment Providers

**GraphQL Query: `getUnifiedFulfillers`**

Retrieve all fulfillment providers (dropshipping, print-on-demand, etc.) connected to the store.

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getUnifiedFulfillers { unifiedFulfillers { id name managedProductsAssociations dashboardUrl appDetails { logoUrl duplicateProduct changePrice changeInventory manageOptions } emailNotifications { email automaticNotificationsConfiguration } } }",
  "variables": {},
  "operationName": "getUnifiedFulfillers",
  "source": "WixStoresWebClient"
}'
```

## Get Shipping Groups

**GraphQL Query: `getShippingGroups`**

Retrieve shipping groups for organizing products by shipping requirements.

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getShippingGroups { shippingProductGroups { defaultGroup { id name } userDefinedGroups { id name } } }",
  "variables": {},
  "operationName": "getShippingGroups",
  "source": "WixStoresWebClient"
}'
```

## Get Product Page URL

**GraphQL Query: `PageUrlForShoutout`**

Get the public storefront URL for a product.

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "{ product(productId: \"PRODUCT_ID\") { pageUrl } }",
  "operationName": "PageUrlForShoutout",
  "source": "WixStoresWebClient"
}'
```

## GraphQL Best Practices

### Error Handling

GraphQL returns 200 even with errors. Check the response structure:

```json
{
  "data": { ... },
  "errors": [
    {
      "message": "Error description",
      "path": ["catalog", "product"],
      "extensions": { "code": "ERROR_CODE" }
    }
  ]
}
```

### Pagination

Use `offset` and `limit` variables:
- Default limit: 100
- Max limit: 100
- Increment offset by limit for next page

### Performance

- Request only needed fields in GraphQL query
- Use fragments for reusable field sets
- Batch multiple queries in single request

## Common Variant Patterns

### Create Product with Variants

1. Define product options (size, color, etc.)
2. Generate product items (variants) for each combination
3. Set inventory and pricing per variant

### Query Variant Inventory

```bash
# From getProductByIdPreOrder response
jq '.data.catalog.product.productItems[] | {
  variant: .optionsSelections,
  sku: .sku,
  inventory: .inventory.quantity,
  price: .pricePerUnit
}'
```
