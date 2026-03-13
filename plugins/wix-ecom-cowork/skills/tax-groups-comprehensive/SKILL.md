# Tax Groups - Complete Tax Group Management API

## Overview

Comprehensive tax group management using Wix Tax Groups API for creating, updating, querying, and managing tax groups that define specific tax treatments and exemptions for products and customers.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Base URL**: `https://www.wixapis.com/tax-groups/v1`

## Authentication

```bash
-H "Authorization: ${API_KEY}"
-H "wix-site-id: ${SITE_ID}"
-H "Content-Type: application/json"
```

## Query Tax Groups

**Endpoint**: `GET https://www.wixapis.com/tax-groups/v1/tax-groups`

List all tax groups for the site.

```bash
curl -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "taxGroups": [
    {
      "id": "tax-group-123",
      "name": "Standard Tax",
      "rate": 0.08,
      "description": "Standard sales tax rate",
      "default": true,
      "appId": "app-123"
    }
  ]
}
```

## Get Tax Group by ID

**Endpoint**: `GET https://www.wixapis.com/tax-groups/v1/tax-groups/{id}`

```bash
TAX_GROUP_ID="tax-group-123"

curl -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups/${TAX_GROUP_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Create Tax Group

**Endpoint**: `POST https://www.wixapis.com/tax-groups/v1/tax-groups`

```bash
curl -X POST "https://www.wixapis.com/tax-groups/v1/tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxGroup": {
    "name": "California Sales Tax",
    "description": "CA state sales tax for physical goods",
    "rate": 0.0875
  }
}'
```

**Response**:
```json
{
  "taxGroup": {
    "id": "new-tax-group-id",
    "name": "California Sales Tax",
    "description": "CA state sales tax for physical goods",
    "rate": 0.0875,
    "default": false
  }
}
```

## Update Tax Group

**Endpoint**: `PATCH https://www.wixapis.com/tax-groups/v1/tax-groups/{id}`

```bash
TAX_GROUP_ID="tax-group-123"

curl -X PATCH "https://www.wixapis.com/tax-groups/v1/tax-groups/${TAX_GROUP_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxGroup": {
    "name": "Updated Tax Group Name",
    "rate": 0.095,
    "description": "Updated description"
  }
}'
```

## Delete Tax Group

**Endpoint**: `DELETE https://www.wixapis.com/tax-groups/v1/tax-groups/{id}`

```bash
TAX_GROUP_ID="tax-group-to-delete"

curl -X DELETE "https://www.wixapis.com/tax-groups/v1/tax-groups/${TAX_GROUP_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Note**: Cannot delete tax group if products are still assigned to it.

## Get Default Tax Groups

**Endpoint**: `GET https://www.wixapis.com/tax-groups/v1/tax-groups/default`

Get system default tax groups.

```bash
curl -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups/default" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Get Default Tax Groups by App IDs

**Endpoint**: `GET https://www.wixapis.com/tax-groups/v1/tax-groups/by-app-ids`

Get default tax groups for specific apps.

```bash
curl -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups/by-app-ids?appIds=app-id-1,app-id-2" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Assign Tax Group to Product

After creating or identifying the right tax group, assign it to products:

```bash
PRODUCT_ID="product-123"
TAX_GROUP_ID="tax-group-456"

curl -X PATCH "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "product": {
    "id": "'"${PRODUCT_ID}"'",
    "taxGroupId": "'"${TAX_GROUP_ID}"'"
  }
}'
```

## Query Products by Tax Group

Find all products assigned to a specific tax group:

```bash
TAX_GROUP_ID="tax-group-123"

curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"taxGroupId\": \"'"${TAX_GROUP_ID}"'\"}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | {
  id,
  name,
  price,
  taxGroupId
}]'
```

## Use Cases

### 1. List All Tax Groups

```bash
curl -s -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" | jq '[.taxGroups[] | {
  id,
  name,
  rate,
  default,
  description
}]'
```

### 2. Create Region-Specific Tax Group

```bash
# Create tax group for EU VAT
curl -s -X POST "https://www.wixapis.com/tax-groups/v1/tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxGroup": {
    "name": "EU VAT",
    "description": "European Union Value Added Tax",
    "rate": 0.20
  }
}' | jq '{
  taxGroupId: .taxGroup.id,
  name: .taxGroup.name,
  rate: .taxGroup.rate,
  message: "✅ Tax group created"
}'
```

### 3. Update Tax Rate

```bash
# Update tax rate (e.g., when rates change)
TAX_GROUP_ID="tax-group-123"

curl -s -X PATCH "https://www.wixapis.com/tax-groups/v1/tax-groups/${TAX_GROUP_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxGroup": {
    "rate": 0.0925
  }
}' | jq '{
  taxGroupId: .taxGroup.id,
  name: .taxGroup.name,
  oldRate: "8.75%",
  newRate: (.taxGroup.rate * 100 | tostring + "%"),
  message: "✅ Tax rate updated"
}'
```

### 4. Find Products Without Tax Groups

```bash
# Find products missing tax assignment
curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"taxGroupId\": null}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | {
  id,
  name,
  price,
  warning: "⚠️ No tax group assigned"
}]'
```

### 5. Bulk Assign Tax Group

```bash
# Assign default tax group to all products without tax
DEFAULT_TAX_ID=$(curl -s -X GET "https://www.wixapis.com/tax-groups/v1/tax-groups/default" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" | jq -r '.taxGroups[0].id')

echo "Default tax group: ${DEFAULT_TAX_ID}"

# Get products without tax
products_without_tax=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"taxGroupId\": null}", "paging": {"limit": 100}}}')

# Assign tax group to each
echo "$products_without_tax" | jq -r '.products[].id' | while read -r pid; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${pid}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"product\": {
      \"id\": \"${pid}\",
      \"taxGroupId\": \"${DEFAULT_TAX_ID}\"
    }
  }" > /dev/null

  echo "✅ Assigned tax to product ${pid}"
  sleep 0.2
done
```

## Best Practices

1. **Always have a default tax group** - Assign to most products
2. **Create specific groups for exemptions** - Tax-exempt items, reduced rates
3. **Regional tax groups** - For multi-jurisdiction compliance
4. **Update rates annually** - Tax rates change, keep groups current
5. **Audit regularly** - Check for products without tax assignments
6. **Document tax rules** - Include compliance notes in descriptions

## Tax Group Naming Conventions

**Good Examples**:
- "Standard Sales Tax (8.75%)"
- "EU VAT (20%)"
- "Tax Exempt - Digital Goods"
- "Reduced Rate - Food Items (4%)"

**Bad Examples**:
- "Tax 1"
- "Group A"
- "Default"
