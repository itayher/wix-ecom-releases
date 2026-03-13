# Store Manager API - Wix Stores Backend

## Overview

Store provisioning, configuration, categories, and business manager integration APIs.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Provision Store

Initialize or provision the Wix store for a site.

**Endpoint**: `POST /_api/wix-ecommerce-renderer-web/store-manager/provision-store`

```bash
curl -X POST "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/provision-store" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Use Case**: Called when first setting up a store or ensuring store infrastructure exists.

## Get Business Manager Info

Retrieve business manager configuration and settings for the store.

**Endpoint**: `GET /_api/wix-ecommerce-renderer-web/store-manager/business-manager-info`

```bash
curl -X GET "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/business-manager-info" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response Contains**:
- Store configuration
- Business manager settings
- Enabled features
- Integration status

## Get Store Notifications

Retrieve system notifications, alerts, and updates for the store.

**Endpoint**: `GET /_api/wix-ecommerce-renderer-web/store-manager/get-notifications`

```bash
curl -X GET "https://www.wixapis.com/_api/wix-ecommerce-renderer-web/store-manager/get-notifications" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Use Cases**:
- Check for important store updates
- View pending actions
- See feature announcements
- Monitor store health alerts

## Get Product Categories

Retrieve all product categories configured in the store.

**Endpoint**: `GET /_api/wix-ecommerce-renderer-web/store-manager/categories`

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
      "visible": true,
      "parentId": null,
      "numberOfProducts": 45
    }
  ]
}
```

**Use Cases**:
- List all categories
- Check category hierarchy
- Count products per category
- Validate category assignments

## Error Handling

Standard HTTP error codes:
- `200` - Success
- `401` - Unauthorized (check API key)
- `403` - Forbidden (check permissions)
- `404` - Store not found or not provisioned
- `500` - Server error

## Best Practices

1. **Store Provisioning**: Always call provision-store before other operations on new stores
2. **Category Management**: Fetch categories before creating products to enable proper categorization
3. **Notifications**: Check regularly for important store updates
4. **Caching**: Cache business-manager-info response (changes infrequently)
