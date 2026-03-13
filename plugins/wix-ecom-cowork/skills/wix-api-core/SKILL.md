# Wix API Core - Direct REST API Calls

## Overview

This skill provides foundational patterns for making direct Wix REST API calls without using MCP tools. All requests use curl commands with proper authentication and headers.

## Authentication & Headers

### Required Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67` (hard-coded)
- **API Key**: `${API_KEY}` (environment variable)
- **Site ID**: `${SITE_ID}` (environment variable)

### Header Patterns

**Site-level requests (most common):**

```bash
-H "Authorization: ${API_KEY}"
-H "wix-site-id: ${SITE_ID}"
-H "Content-Type: application/json"
```

**Account-level requests (rare):**

```bash
-H "Authorization: ${API_KEY}"
-H "wix-account-id: ${ACCOUNT_ID}"
-H "Content-Type: application/json"
```

### Important Rules

- Use `wix-site-id` OR `wix-account-id`, NOT both
- Most APIs operate at site level
- Site-level calls only work with keys from the site owner's account
- All POST/PATCH requests require `Content-Type: application/json`

## Base URLs

### Wix Stores Catalog V1 (Current)

```
https://www.wixapis.com/stores/v1/
https://www.wixapis.com/stores-reader/v1/
```

### Wix Stores Catalog V2

```
https://www.wixapis.com/stores/v2/
```

### Wix Stores Catalog V3 (Preview, Q4 2025)

```
https://www.wixapis.com/stores/v3/
```

**Note**: Each site supports either V1 or V3, not both. Use Catalog Versioning API to determine which version a site uses.

## Common Request Patterns

### GET Request

```bash
curl -X GET "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

### POST Request with Query

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 50, "offset": 0}
  }
}'
```

### PATCH Request (Update)

```bash
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "name": "Updated Product Name",
    "price": 29.99
  }
}'
```

### POST Request (Bulk Operation)

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
    }
  ]
}'
```

## Pagination

### Standard Pagination Pattern

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 100,
      "offset": 0
    }
  }
}'
```

**Response includes pagination metadata:**

```json
{
  "products": [...],
  "metadata": {
    "count": 100,
    "offset": 0,
    "total": 450
  }
}
```

**Iterate through pages:**

- First page: `"offset": 0`
- Second page: `"offset": 100`
- Third page: `"offset": 200`
- Continue until `offset + count >= total`

## Filtering & Sorting

### Filter Syntax

Filters use JSON string format inside query:

```bash
-d '{
  "query": {
    "filter": "{\"price\": {\"$gte\": 10, \"$lte\": 100}}"
  }
}'
```

**Common filter operators:**

- `$eq` - equals
- `$ne` - not equals
- `$gt` - greater than
- `$gte` - greater than or equal
- `$lt` - less than
- `$lte` - less than or equal
- `$in` - value in array
- `$and` - logical AND
- `$or` - logical OR

### Sort Syntax

```bash
-d '{
  "query": {
    "sort": "{\"price\": \"asc\"}",
    "paging": {"limit": 50}
  }
}'
```

**Sort directions:**

- `"asc"` - ascending
- `"desc"` - descending

## Error Handling

### Standard HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "Product ID is required",
    "details": {
      "applicationError": {
        "description": "Product ID cannot be empty",
        "code": "MISSING_REQUIRED_FIELD"
      }
    }
  }
}
```

### Error Handling Pattern

```bash
response=$(curl -s -w "\n%{http_code}" -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -ge 400 ]; then
  echo "Error: HTTP $http_code"
  echo "$body" | jq '.error'
  exit 1
fi

echo "$body" | jq '.'
```

## Rate Limits

**Wix API Rate Limits:**

- Standard tier: 50 requests/second
- Burst capacity: 100 requests
- Per-site limits apply to site-level calls
- Per-account limits apply to account-level calls

**Best Practices:**

- Implement exponential backoff on 429 errors
- Use bulk endpoints when updating multiple resources
- Cache responses when appropriate
- Monitor `X-RateLimit-*` headers in responses

## Common Response Structures

### Single Resource Response

```json
{
  "product": {
    "id": "abc123",
    "name": "Product Name",
    "price": 29.99,
    "visible": true
  }
}
```

### Collection Response

```json
{
  "products": [
    {
      "id": "abc123",
      "name": "Product 1"
    }
  ],
  "metadata": {
    "count": 1,
    "offset": 0,
    "total": 1
  }
}
```

### Bulk Operation Response

```json
{
  "bulkActionMetadata": {
    "totalSuccesses": 10,
    "totalFailures": 0,
    "undetailedFailures": 0
  },
  "results": [
    {
      "itemMetadata": {
        "id": "product-1",
        "originalIndex": 0,
        "success": true
      }
    }
  ]
}
```

## Testing API Calls

### Test Connection

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1}}}'
```

**Expected response**: HTTP 200 with product data

### Validate Permissions

```bash
# Test read permission
curl -X GET "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"

# Test write permission
curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"product": {"name": "Test Update"}}'
```

## Documentation References

- Wix Stores Catalog API: https://dev.wix.com/docs/rest/business-solutions/stores/catalog/introduction
- Query Products: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/query-products
- API Keys: https://dev.wix.com/docs/go-headless/develop-your-project/admin-operations/make-rest-api-calls-with-an-api-key
- OAuth Authentication: https://dev.wix.com/docs/build-apps/develop-your-app/access/authentication/authenticate-using-oauth
- Standard Errors: https://dev.wix.com/docs/rest/articles/getting-started/errors

## Quick Reference

### Environment Setup

```bash
export API_KEY="your-api-key-here"
export SITE_ID="your-site-id-here"
export APP_ID="df7c18eb-009b-4868-9891-15e19dddbe67"
```

### Common Headers Template

```bash
-H "Authorization: ${API_KEY}" \
-H "wix-site-id: ${SITE_ID}" \
-H "Content-Type: application/json"
```

### JSON Pretty Print

```bash
curl ... | jq '.'
```

### Save Response to File

```bash
curl ... > response.json
```

### Debug Mode (Show Headers)

```bash
curl -v ...
```
