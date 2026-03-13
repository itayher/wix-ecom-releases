# Tax Complete - Comprehensive Tax Management

Complete tax configuration and management including automatic/manual tax setup, tax groups, regions, calculations, and product tax assignment.

## Command Pattern

```
Show me my tax configuration
List all tax groups
Query tax regions
Check active tax calculator
Show products without tax assignments
Assign default tax to all products
Check if Avalara is available
Get tax calculation for [product] in [region]
```

## Purpose

Comprehensive tax management covering automatic tax setup, manual tax configuration, tax group and region management, tax calculations, and ensuring all products have proper tax assignments.

## Skills Referenced

- **tax-management**: Tax groups, regions, calculators (UPDATED with correct endpoints)
- **tax-groups-comprehensive**: Complete tax group CRUD
- **tax-regions**: Geographic tax configuration
- **tax-calculations**: Tax calculation engine
- **product-management**: Product tax assignment
- **wix-api-core**: Authentication

## Complete Tax Dashboard

### Show Full Tax Configuration

```bash
SITE_ID="${SITE_ID}"
API_KEY="${API_KEY}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 TAX CONFIGURATION DASHBOARD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Active Tax Calculator
echo "\n📊 Active Tax Calculator:"
calculators=$(curl -s -X GET "https://www.wixapis.com/billing/v1/list-tax-calculators" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

active_calc=$(echo "$calculators" | jq -r '.calculators[] | select(.active == true) | "\(.name) (\(.type))"')
echo "  ${active_calc}"

# 2. Tax Groups
echo "\n📋 Tax Groups:"
tax_groups=$(curl -s -X POST "https://www.wixapis.com/billing/v1/tax-groups/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

echo "$tax_groups" | jq -r '.taxGroups[] | "  • \(.name) - \((.rate * 100) | round)% \(if .default then "(default)" else "" end)"'

tax_group_count=$(echo "$tax_groups" | jq '.taxGroups | length')

# 3. Tax Regions
echo "\n🌍 Tax Regions:"
tax_regions=$(curl -s -X POST "https://www.wixapis.com/billing/v1/tax-regions/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {}}')

echo "$tax_regions" | jq -r '.taxRegions[] | "  • \(.name) (\(.code)) - \((.rate * 100) | round)%"'

region_count=$(echo "$tax_regions" | jq '.taxRegions | length')

# 4. Product Tax Assignment Status
echo "\n📦 Product Tax Status:"
all_products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1000}}}')

total_products=$(echo "$all_products" | jq '.products | length')
with_tax=$(echo "$all_products" | jq '[.products[] | select(.taxGroupId != null)] | length')
without_tax=$((total_products - with_tax))
compliance_rate=$(echo "scale=1; ($with_tax * 100) / $total_products" | bc)

echo "  Total Products:   ${total_products}"
echo "  With Tax Group:   ${with_tax} (${compliance_rate}%)"
echo "  Missing Tax:      ${without_tax}"

if [ $without_tax -gt 0 ]; then
  echo "  ⚠️  ${without_tax} products need tax assignment"
fi

# 5. Manual Tax Mappings
echo "\n🗺️ Manual Tax Mappings:"
mappings=$(curl -s -X GET "https://www.wixapis.com/_api/manual-tax-mappings/v1/manual-tax-mappings" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

mapping_count=$(echo "$mappings" | jq '.mappings | length // 0')
echo "  Active Mappings:  ${mapping_count}"

# 6. Avalara Status
echo "\n⭐ Premium Tax Features:"
avalara=$(curl -s -X GET "https://www.wixapis.com/premium-features-manager-service/v1/features/avalara_tax_calculation/is-eligible" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

avalara_eligible=$(echo "$avalara" | jq -r '.eligible // false')
if [ "$avalara_eligible" = "true" ]; then
  echo "  Avalara:          ✅ Eligible"
else
  echo "  Avalara:          ⚠️  Not eligible"
fi

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY:"
echo "  Tax Calculator: ${active_calc}"
echo "  Tax Groups:     ${tax_group_count}"
echo "  Tax Regions:    ${region_count}"
echo "  Compliance:     ${compliance_rate}% of products configured"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Assign Default Tax to All Products

```bash
echo "🔧 Assigning default tax to all products..."

# Get default tax group
default_tax=$(curl -s -X GET "https://www.wixapis.com/billing/v1/tax-groups/default-tax-groups" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

DEFAULT_TAX_ID=$(echo "$default_tax" | jq -r '.taxGroups[0].id')
DEFAULT_TAX_NAME=$(echo "$default_tax" | jq -r '.taxGroups[0].name')

echo "Using tax group: ${DEFAULT_TAX_NAME} (${DEFAULT_TAX_ID})"

# Get products without tax
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"taxGroupId\": null}", "paging": {"limit": 100}}}')

product_count=$(echo "$products" | jq '.products | length')
echo "Found ${product_count} products without tax"

# Assign tax to each
assigned=0
echo "$products" | jq -r '.products[].id' | while read -r pid; do
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

  assigned=$((assigned + 1))
  echo "  ✅ Product ${assigned}/${product_count}"
  sleep 0.2
done

echo "\n✅ Assigned tax to ${product_count} products!"
```

## Output Format

### Tax Dashboard

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 TAX CONFIGURATION DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Active Tax Calculator:
  Wix Automatic Tax (AUTOMATIC)

📋 Tax Groups:
  • Standard Tax - 9% (default)
  • Tax Exempt - 0%
  • Reduced Rate - 4%

🌍 Tax Regions:
  • California (CA) - 7%
  • New York (NY) - 4%
  • Texas (TX) - 6%

📦 Product Tax Status:
  Total Products:   102
  With Tax Group:   98 (96%)
  Missing Tax:      4
  ⚠️  4 products need tax assignment

🗺️ Manual Tax Mappings:
  Active Mappings:  0

⭐ Premium Tax Features:
  Avalara:          ⚠️  Not eligible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY:
  Tax Calculator: Wix Automatic Tax (AUTOMATIC)
  Tax Groups:     3
  Tax Regions:    3
  Compliance:     96% of products configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Example Use Cases

1. **Tax Overview**: "Show me my tax configuration"
2. **Compliance Check**: "Which products don't have tax assigned?"
3. **Bulk Assignment**: "Assign default tax to all products"
4. **Tax Groups**: "List all my tax groups"
5. **Tax Regions**: "Show tax regions I'm configured for"
6. **Calculator Check**: "What tax calculator am I using?"
7. **Avalara Check**: "Am I eligible for Avalara?"

## Related Commands

- `/wix:products` - Product management (for tax assignment)
- `/wix:shipping-tax` - Shipping and tax configuration
- `/wix:analytics` - Business intelligence
