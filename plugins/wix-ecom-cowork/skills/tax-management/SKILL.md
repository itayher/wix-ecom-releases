# Tax Management - Complete Tax Configuration

## Overview

Comprehensive tax management using Wix Tax APIs including tax groups, regions, calculations, and manual mappings for full tax compliance.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Query Tax Groups

**Endpoint**: `POST https://www.wixapis.com/billing/v1/tax-groups/query`

```bash
curl -X POST "https://www.wixapis.com/billing/v1/tax-groups/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {}
}'
```

**Response**:
```json
{
  "taxGroups": [
    {
      "id": "tax-group-123",
      "name": "Standard Tax",
      "rate": 0.08,
      "description": "Standard sales tax",
      "default": true
    }
  ],
  "metadata": {
    "count": 1,
    "total": 5
  }
}
```

## Get Default Tax Groups

**Endpoint**: `GET https://www.wixapis.com/billing/v1/tax-groups/default-tax-groups`

```bash
curl -X GET "https://www.wixapis.com/billing/v1/tax-groups/default-tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Query Tax Regions

**Endpoint**: `POST https://www.wixapis.com/billing/v1/tax-regions/query`

```bash
curl -X POST "https://www.wixapis.com/billing/v1/tax-regions/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {}
}'
```

**Response**:
```json
{
  "taxRegions": [
    {
      "id": "region-123",
      "name": "California",
      "code": "CA",
      "country": "US",
      "rate": 0.0725,
      "active": true
    }
  ]
}
```

## List Tax Calculators

**Endpoint**: `GET https://www.wixapis.com/billing/v1/list-tax-calculators`

```bash
curl -X GET "https://www.wixapis.com/billing/v1/list-tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "calculators": [
    {
      "id": "wix-auto-tax",
      "name": "Wix Automatic Tax",
      "type": "AUTOMATIC",
      "active": true,
      "provider": "wix"
    }
  ]
}
```

## Get Manual Tax Mappings

**Endpoint**: `GET https://www.wixapis.com/_api/manual-tax-mappings/v1/manual-tax-mappings`

```bash
curl -X GET "https://www.wixapis.com/_api/manual-tax-mappings/v1/manual-tax-mappings" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "mappings": [
    {
      "id": "mapping-123",
      "region": "CA",
      "taxRate": 0.0875,
      "productIds": ["product-1", "product-2"]
    }
  ]
}
```

## Assign Tax Group to Product

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

## Check Avalara Eligibility

**Endpoint**: `GET https://www.wixapis.com/premium-features-manager-service/v1/features/avalara_tax_calculation/is-eligible`

```bash
curl -X GET "https://www.wixapis.com/premium-features-manager-service/v1/features/avalara_tax_calculation/is-eligible" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Use Case**: Check if site is eligible for Avalara premium tax calculation

## Complete Tax Setup Workflow

### Step 1: Check Active Tax Calculator

```bash
calculators=$(curl -s -X GET "https://www.wixapis.com/billing/v1/list-tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

active_calculator=$(echo "$calculators" | jq -r '.calculators[] | select(.active == true) | .name')
calc_type=$(echo "$calculators" | jq -r '.calculators[] | select(.active == true) | .type')

echo "Active Tax Calculator: ${active_calculator} (${calc_type})"
```

### Step 2: Query Tax Groups

```bash
tax_groups=$(curl -s -X POST "https://www.wixapis.com/billing/v1/tax-groups/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

echo "$tax_groups" | jq '[.taxGroups[] | {id, name, rate, default}]'
```

### Step 3: Get Default Tax Group

```bash
default_groups=$(curl -s -X GET "https://www.wixapis.com/billing/v1/tax-groups/default-tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

DEFAULT_TAX_ID=$(echo "$default_groups" | jq -r '.taxGroups[0].id')
echo "Default tax group ID: ${DEFAULT_TAX_ID}"
```

### Step 4: Query Tax Regions

```bash
regions=$(curl -s -X POST "https://www.wixapis.com/billing/v1/tax-regions/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

echo "$regions" | jq '[.taxRegions[] | {id, name, code, country, rate}]'
```

### Step 5: Assign Tax to Unconfigured Products

```bash
# Find products without tax
products_no_tax=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"taxGroupId\": null}", "paging": {"limit": 100}}}')

# Assign default tax to all
echo "$products_no_tax" | jq -r '.products[].id' | while read -r pid; do
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${pid}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{\"product\": {\"id\": \"${pid}\", \"taxGroupId\": \"${DEFAULT_TAX_ID}\"}}" > /dev/null
  echo "✅ Assigned tax to product ${pid}"
  sleep 0.2
done
```

## API Endpoint Summary

**Actual Working Endpoints** (from UI capture):
```
POST /billing/v1/tax-groups/query          (Query tax groups)
GET  /billing/v1/tax-groups/default-tax-groups (Get defaults)
POST /billing/v1/tax-regions/query         (Query regions)
GET  /billing/v1/list-tax-calculators      (List calculators)
GET  /_api/manual-tax-mappings/v1/manual-tax-mappings (Manual mappings)
```

**Documented Endpoints** (may also work):
```
GET    /tax-groups/v1/tax-groups           (Query)
POST   /tax-groups/v1/tax-groups           (Create)
PATCH  /tax-groups/v1/tax-groups/{id}      (Update)
DELETE /tax-groups/v1/tax-groups/{id}      (Delete)
```

## Best Practices

1. **Use `/billing/v1/` endpoints** - These are what the UI uses
2. **Always query tax groups** before creating products
3. **Use default tax group** for most products
4. **Create specific groups** for exemptions or special rates
5. **Regional compliance** - Set up appropriate tax for each jurisdiction
6. **Audit regularly** - Check for products without tax assignments
