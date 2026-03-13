# Tax Regions - Geographic Tax Configuration

## Overview

Define and manage tax regions to specify geographical areas with specific tax rules and rates using the Wix Tax Regions API.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Base URL**: `https://www.wixapis.com/tax-regions/v1`

## Query Tax Regions

**Endpoint**: `GET https://www.wixapis.com/tax-regions/v1/tax-regions`

```bash
curl -X GET "https://www.wixapis.com/tax-regions/v1/tax-regions" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
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

## Get Tax Region by ID

**Endpoint**: `GET https://www.wixapis.com/tax-regions/v1/tax-regions/{id}`

```bash
REGION_ID="region-123"

curl -X GET "https://www.wixapis.com/tax-regions/v1/tax-regions/${REGION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Create Tax Region

**Endpoint**: `POST https://www.wixapis.com/tax-regions/v1/tax-regions`

```bash
curl -X POST "https://www.wixapis.com/tax-regions/v1/tax-regions" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxRegion": {
    "name": "New York",
    "code": "NY",
    "country": "US",
    "rate": 0.04,
    "active": true
  }
}'
```

## Update Tax Region

**Endpoint**: `PATCH https://www.wixapis.com/tax-regions/v1/tax-regions/{id}`

```bash
REGION_ID="region-123"

curl -X PATCH "https://www.wixapis.com/tax-regions/v1/tax-regions/${REGION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "taxRegion": {
    "rate": 0.0825
  }
}'
```

## Delete Tax Region

**Endpoint**: `DELETE https://www.wixapis.com/tax-regions/v1/tax-regions/{id}`

```bash
REGION_ID="region-to-delete"

curl -X DELETE "https://www.wixapis.com/tax-regions/v1/tax-regions/${REGION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Use Cases

### Setup US State Tax

```bash
# Create tax regions for all US states where you ship
states=("CA:0.0725" "NY:0.04" "TX:0.0625" "FL:0.06")

for state_data in "${states[@]}"; do
  state_code=${state_data%%:*}
  tax_rate=${state_data##*:}

  curl -s -X POST "https://www.wixapis.com/tax-regions/v1/tax-regions" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"taxRegion\": {
      \"name\": \"${state_code} Sales Tax\",
      \"code\": \"${state_code}\",
      \"country\": \"US\",
      \"rate\": ${tax_rate},
      \"active\": true
    }
  }"

  echo "✅ Created ${state_code} tax region (${tax_rate}%)"
  sleep 0.2
done
```

### Setup EU VAT Regions

```bash
# European Union VAT rates
eu_countries=("DE:0.19" "FR:0.20" "IT:0.22" "ES:0.21" "NL:0.21")

for country_data in "${eu_countries[@]}"; do
  country_code=${country_data%%:*}
  vat_rate=${country_data##*:}

  curl -s -X POST "https://www.wixapis.com/tax-regions/v1/tax-regions" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
    \"taxRegion\": {
      \"name\": \"${country_code} VAT\",
      \"code\": \"${country_code}\",
      \"country\": \"${country_code}\",
      \"rate\": ${vat_rate},
      \"active\": true
    }
  }"

  echo "✅ Created ${country_code} VAT region (${vat_rate}%)"
  sleep 0.2
done
```

## Best Practices

1. **Match legal requirements** - Use official tax rates for each jurisdiction
2. **Keep rates current** - Tax rates change, update regularly
3. **Use standard codes** - ISO state/country codes (CA, NY, US, DE, FR)
4. **Document sources** - Note where tax rates come from
5. **Test calculations** - Verify tax amounts match expectations
6. **Consider nexus** - Only create regions where you have tax obligation
