# Product Advanced - GraphQL Product Management

Advanced product operations using Wix's GraphQL API for comprehensive product management including complete variant control, subscription plans, fulfillment, and detailed product schemas.

## Command Pattern

```
Show me complete product details for [product ID]
Get full product schema with variants
Show me products with premium features
Get fulfillment providers
Show shipping groups
Query products using GraphQL
```

## Purpose

Use GraphQL API for advanced product operations that require complete product schemas, variant details, subscription management, or fulfillment integration.

## Skills Referenced

- **product-graphql**: GraphQL queries for products, variants, options, and advanced features
- **store-manager**: Store provisioning, categories, business manager info
- **tax-management**: Tax groups for product tax configuration
- **wix-api-core**: Authentication and base patterns

## Workflow

### Get Complete Product Details

Retrieve full product information including all variants, options, media, and configurations:

```bash
PRODUCT_ID="abc123-def456"
API_KEY="${WIX_API_KEY}"
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")

curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductByIdPreOrder($productId: String!) { catalog { product(productId: $productId) { id name price currency inventory { status quantity } media { url altText } options { title selections { value } } productItems { optionsSelections inventory { quantity status } sku } } } }",
  "variables": {"productId": "'"${PRODUCT_ID}"'"},
  "operationName": "getProductByIdPreOrder",
  "source": "WixStoresWebClient"
}' | jq '{
  id: .data.catalog.product.id,
  name: .data.catalog.product.name,
  price: .data.catalog.product.price,
  inventory: .data.catalog.product.inventory.quantity,
  variants: [.data.catalog.product.productItems[] | {
    combination: .optionsSelections,
    sku: .sku,
    stock: .inventory.quantity
  }],
  options: [.data.catalog.product.options[] | {
    name: .title,
    values: [.selections[].value]
  }]
}'
```

### Query Products List

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getProductsList($offset: Int, $limit: Int) { catalog { products(offset: $offset, limit: $limit) { totalCount list { id name price inventory { status quantity } sku } } } }",
  "variables": {"limit": 50, "offset": 0},
  "operationName": "getProductsList",
  "source": "WixStoresWebClient"
}' | jq '{
  total: .data.catalog.products.totalCount,
  showing: (.data.catalog.products.list | length),
  products: [.data.catalog.products.list[] | {id, name, price, stock: .inventory.quantity}]
}'
```

### Get Fulfillment Providers

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-graphql-web/api" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": "query getUnifiedFulfillers { unifiedFulfillers { id name managedProductsAssociations dashboardUrl appDetails { logoUrl duplicateProduct changePrice changeInventory } } }",
  "variables": {},
  "operationName": "getUnifiedFulfillers",
  "source": "WixStoresWebClient"
}' | jq '[.data.unifiedFulfillers[] | {
  id,
  name,
  productCount: .managedProductsAssociations,
  canDuplicate: .appDetails.duplicateProduct,
  canChangePrice: .appDetails.changePrice
}]'
```

### Get Shipping Groups

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
}' | jq '{
  default: .data.shippingProductGroups.defaultGroup,
  custom: [.data.shippingProductGroups.userDefinedGroups[] | {id, name}]
}'
```

## Output Format

### Complete Product Details

```json
{
  "id": "abc123",
  "name": "T-Shirt",
  "price": 19.99,
  "inventory": 100,
  "variants": [
    {
      "combination": {"Size": "Small", "Color": "Red"},
      "sku": "TSHIRT-S-RED",
      "stock": 15
    },
    {
      "combination": {"Size": "Medium", "Color": "Blue"},
      "sku": "TSHIRT-M-BLUE",
      "stock": 25
    }
  ],
  "options": [
    {"name": "Size", "values": ["Small", "Medium", "Large"]},
    {"name": "Color", "values": ["Red", "Blue", "Green"]}
  ]
}
```

## Example Use Cases

1. **Variant Analysis**: "Show me all variants and their stock levels for product XYZ"
2. **Fulfillment Check**: "Which fulfillment providers are connected to my store?"
3. **Shipping Configuration**: "Show me all shipping groups"
4. **Complete Schema**: "Get the full product structure for product ABC123"
5. **Premium Features**: "What premium eCommerce features are enabled?"

## Related Commands

- `/wix:products` - Basic product operations (REST API)
- `/wix:inventory-audit` - Inventory analysis
- `/wix:optimize-products` - Product quality improvements
