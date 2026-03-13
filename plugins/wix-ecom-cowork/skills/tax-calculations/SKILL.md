# Tax Calculations - Tax Calculation Engine

## Overview

Retrieve available tax calculators and perform tax calculations using configured tax providers (automatic or manual tax services).

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`
- **Base URL**: `https://www.wixapis.com/tax-calculators/v1`

## List Tax Calculators

**Endpoint**: `GET https://www.wixapis.com/tax-calculators/v1/tax-calculators`

Get all configured tax calculation providers.

```bash
curl -X GET "https://www.wixapis.com/tax-calculators/v1/tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

**Response**:
```json
{
  "calculators": [
    {
      "id": "calculator-123",
      "name": "Wix Automatic Tax",
      "type": "AUTOMATIC",
      "active": true,
      "provider": "wix"
    },
    {
      "id": "calculator-456",
      "name": "TaxJar Integration",
      "type": "EXTERNAL",
      "active": false,
      "provider": "taxjar"
    }
  ]
}
```

## Calculate Tax

**Endpoint**: `POST https://www.wixapis.com/tax-calculators/v1/calculate-tax`

Perform tax calculation for a cart/order.

```bash
curl -X POST "https://www.wixapis.com/tax-calculators/v1/calculate-tax" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "calculation": {
    "lineItems": [
      {
        "productId": "product-123",
        "quantity": 2,
        "price": 29.99,
        "taxGroupId": "tax-group-456"
      }
    ],
    "shippingAddress": {
      "country": "US",
      "state": "CA",
      "city": "Los Angeles",
      "zipCode": "90001"
    },
    "billingAddress": {
      "country": "US",
      "state": "CA",
      "city": "Los Angeles",
      "zipCode": "90001"
    }
  }
}'
```

**Response**:
```json
{
  "taxCalculation": {
    "totalTax": 5.24,
    "currency": "USD",
    "breakdown": [
      {
        "lineItemId": "item-1",
        "taxAmount": 5.24,
        "taxRate": 0.0875,
        "jurisdiction": "California",
        "taxName": "CA State Sales Tax"
      }
    ]
  }
}
```

## Tax Calculation Scenarios

### 1. Single Product Calculation

Calculate tax for one product:

```bash
curl -X POST "https://www.wixapis.com/tax-calculators/v1/calculate-tax" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "calculation": {
    "lineItems": [{
      "productId": "product-123",
      "quantity": 1,
      "price": 50.00
    }],
    "shippingAddress": {
      "country": "US",
      "state": "NY",
      "zipCode": "10001"
    }
  }
}' | jq '{
  subtotal: 50.00,
  taxAmount: .taxCalculation.totalTax,
  taxRate: (.taxCalculation.breakdown[0].taxRate * 100 | tostring + "%"),
  total: (50.00 + .taxCalculation.totalTax)
}'
```

### 2. Multi-Product Cart

```bash
curl -X POST "https://www.wixapis.com/tax-calculators/v1/calculate-tax" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "calculation": {
    "lineItems": [
      {"productId": "p1", "quantity": 2, "price": 29.99, "taxGroupId": "standard"},
      {"productId": "p2", "quantity": 1, "price": 15.00, "taxGroupId": "standard"},
      {"productId": "p3", "quantity": 3, "price": 8.50, "taxGroupId": "exempt"}
    ],
    "shippingAddress": {
      "country": "US",
      "state": "CA"
    }
  }
}' | jq '{
  subtotal: (29.99 * 2 + 15.00 + 8.50 * 3),
  totalTax: .taxCalculation.totalTax,
  itemBreakdown: [.taxCalculation.breakdown[] | {
    item: .lineItemId,
    tax: .taxAmount,
    rate: (.taxRate * 100 | tostring + "%")
  }]
}'
```

### 3. International Shipping

```bash
# Calculate tax for international order
curl -X POST "https://www.wixapis.com/tax-calculators/v1/calculate-tax" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "calculation": {
    "lineItems": [{
      "productId": "product-123",
      "quantity": 1,
      "price": 100.00
    }],
    "shippingAddress": {
      "country": "DE",
      "city": "Berlin",
      "zipCode": "10115"
    }
  }
}' | jq '{
  country: "Germany",
  subtotal: 100.00,
  VATAmount: .taxCalculation.totalTax,
  VATRate: (.taxCalculation.breakdown[0].taxRate * 100 | tostring + "%"),
  total: (100.00 + .taxCalculation.totalTax)
}'
```

## Automatic vs Manual Tax

### Automatic Tax (Recommended)

**Provider**: Wix Automatic Tax or external (TaxJar, Avalara)

**Benefits**:
- Real-time rate updates
- Jurisdiction detection
- Nexus tracking
- Compliance automation

**Configuration**:
```bash
# Check if automatic tax is enabled
curl -X GET "https://www.wixapis.com/tax-calculators/v1/tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" | jq '[.calculators[] | select(.type == "AUTOMATIC")]'
```

### Manual Tax

**When to Use**:
- Simple tax scenarios
- Single jurisdiction
- Fixed tax rates
- Small business with nexus in one state

**Setup**:
1. Create tax groups with fixed rates
2. Assign products to tax groups
3. Disable automatic tax calculation

## Use Cases

### 1. Validate Tax Calculation

Test tax calculation before checkout:

```bash
echo "🧪 Testing tax calculation..."

result=$(curl -s -X POST "https://www.wixapis.com/tax-calculators/v1/calculate-tax" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "calculation": {
    "lineItems": [{"productId": "test-product", "quantity": 1, "price": 100.00}],
    "shippingAddress": {"country": "US", "state": "CA", "zipCode": "94102"}
  }
}')

tax_amount=$(echo "$result" | jq -r '.taxCalculation.totalTax')
expected_tax=$(echo "100.00 * 0.0875" | bc)

echo "Calculated: $${tax_amount}"
echo "Expected:   $${expected_tax}"

if (( $(echo "$tax_amount == $expected_tax" | bc -l) )); then
  echo "✅ Tax calculation is correct"
else
  echo "⚠️ Tax calculation mismatch"
fi
```

### 2. Check Active Tax Provider

```bash
curl -s -X GET "https://www.wixapis.com/tax-calculators/v1/tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" | jq '[.calculators[] | select(.active == true)] | {
  provider: .[0].provider,
  type: .[0].type,
  name: .[0].name,
  status: "✅ Active"
}'
```

## Best Practices

1. **Use automatic tax** for multi-jurisdiction businesses
2. **Test calculations** before going live
3. **Keep address data accurate** - Tax depends on precise location
4. **Monitor nexus changes** - Expand regions as business grows
5. **Audit regularly** - Verify rates match legal requirements
6. **Document exemptions** - Keep records of tax-exempt sales
