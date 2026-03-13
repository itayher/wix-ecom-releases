# Wix Store Optimizer Skills

## Overview

This directory contains comprehensive skills for the Wix Store Optimizer Cowork plugin. All skills use **direct REST API calls** (NO MCP tools) for maximum compatibility and control.

## Available Skills

### 1. wix-api-core

**Purpose**: Core Wix API patterns and authentication

**Location**: `/skills/wix-api-core/SKILL.md`

**Covers**:

- Authentication headers (API key, site ID)
- Base URLs (V1, V2, V3 APIs)
- Request patterns (GET, POST, PATCH, DELETE)
- Pagination mechanisms
- Filtering and sorting syntax
- Error handling
- Rate limits
- Response structures

**Use when**: You need to understand Wix API fundamentals or troubleshoot API calls

### 2. product-management

**Purpose**: Complete product CRUD operations

**Location**: `/skills/product-management/SKILL.md`

**Covers**:

- Query products (with filters, sorting, pagination)
- Create/update/delete products
- Product variants (options, choices, pricing)
- Product media (images, videos)
- Product collections
- Bulk operations (100 products at once)
- Common patterns (out of stock, low inventory, price ranges)

**Use when**: Building product catalog features or managing inventory at the product level

### 3. inventory-management

**Purpose**: Stock tracking, updates, and analysis

**Location**: `/skills/inventory-management/SKILL.md`

**Covers**:

- Get/update inventory items
- Increment/decrement stock
- Low stock detection
- Out of stock identification
- ABC analysis (high/medium/low value items)
- Slow-mover detection
- Reorder point calculations
- Bulk inventory updates
- Stock valuation reports

**Use when**: Building inventory tracking, alerts, or optimization features

### 4. discount-strategy

**Purpose**: Coupon and discount management

**Location**: `/skills/discount-strategy/SKILL.md`

**Covers**:

- All 5 discount types (fixed amount, percentage, free shipping, fixed price, BOGO)
- Create/update/delete coupons
- Query active/expired coupons
- Campaign templates (flash sale, first-time customer, clearance, VIP)
- Advanced configuration (minimum subtotal, usage limits, product/collection scope)
- Conflict detection (overlapping campaigns)
- Margin calculations (safe discount %, revenue impact)
- Performance analysis

**Use when**: Building discount campaigns, analyzing promotion effectiveness, or preventing margin erosion

### 5. order-analytics

**Purpose**: Order querying, revenue calculation, and trend analysis

**Location**: `/skills/order-analytics/SKILL.md`

**Covers**:

- Query orders (by date, payment status, fulfillment status)
- Get single order details
- Revenue calculations (total, by product, by period)
- Trend analysis (daily, monthly, MoM growth)
- Top selling products
- Cohort analysis (first-time vs repeat customers)
- Customer lifetime value (CLV)
- Average order value (AOV) segmentation
- Fulfillment time analysis

**Use when**: Building dashboards, revenue reports, or analyzing sales performance

### 6. customer-insights

**Purpose**: Contact queries, purchase history, and customer segmentation

**Location**: `/skills/customer-insights/SKILL.md`

**Covers**:

- Query contacts (by email, activity date, creation date)
- Get single contact details
- Purchase history analysis
- Customer lifetime value (CLV) calculation
- RFM analysis (Recency, Frequency, Monetary)
- Customer segmentation (Champions, Loyal, At Risk, Lost)
- One-time buyers identification
- High-value customer identification
- Email marketing segments

**Use when**: Building customer profiles, loyalty programs, or targeted marketing campaigns

### 7. catalog-optimization

**Purpose**: Product listing quality audit and SEO improvements

**Location**: `/skills/catalog-optimization/SKILL.md`

**Covers**:

- Product quality audit (missing descriptions, images, prices, SKUs)
- Catalog health scoring (0-100 scale)
- SEO optimization (missing metadata, slugs, alt text)
- Image optimization (multi-image check, alt text validation)
- Pricing optimization (compare price, anomaly detection, margin analysis)
- Content improvements (short descriptions, missing details)
- Bulk optimization operations

**Use when**: Auditing catalog quality, improving SEO, or preparing for marketing campaigns

### 8. shipping-tax

**Purpose**: Shipping rule management and tax configuration

**Location**: `/skills/shipping-tax/SKILL.md`

**Covers**:

- Query/create/update/delete shipping rates
- Shipping analysis (average cost, method usage, free shipping rate)
- Tax configuration and collection tracking
- Fulfillment center management
- Shipping zone performance
- Free shipping threshold optimization
- Shipping rate templates (flat rate, tiered, international)

**Use when**: Setting up shipping, optimizing costs, or managing tax compliance

### 9. store-analysis

**Purpose**: End-to-end store audit and health scoring

**Location**: `/skills/store-analysis/SKILL.md`

**Covers**:

- Complete store health audit (6 categories)
- Catalog health scoring
- Inventory health scoring
- Pricing strategy analysis
- Sales performance (30-day trends)
- Customer base analysis
- Overall store health score (0-100)
- Actionable recommendations
- Month-over-month comparison

**Use when**: Performing comprehensive store audits or generating executive reports

## Configuration

All skills use these standard variables:

```bash
export API_KEY="your-api-key-here"
export SITE_ID="your-site-id-here"
export APP_ID="df7c18eb-009b-4868-9891-15e19dddbe67"
```

**App ID** is hard-coded in all examples. **API Key** and **Site ID** must be provided via environment variables.

## Quick Start

### 1. Set Environment Variables

```bash
export API_KEY="<your-wix-api-key>"
export SITE_ID="<your-wix-site-id>"
```

### 2. Test Connection

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1}}}'
```

**Expected**: HTTP 200 with product data

### 3. Use Skills

Copy-paste curl commands from skill files, or reference them when building features:

```bash
# Example: Get low stock products
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

## Skill Structure

Each skill follows this format:

- **Overview**: Purpose and scope
- **Configuration**: Required credentials
- **API Sections**: Organized by operation type
- **Code Examples**: Full curl commands with request/response
- **Common Patterns**: Real-world use cases
- **Best Practices**: Recommendations and guidelines
- **Documentation References**: Official Wix docs links

## Best Practices

### Authentication

- Never commit API keys to version control
- Use environment variables for credentials
- Rotate API keys regularly
- Use site-level permissions (not account-level) when possible

### Rate Limiting

- Wix allows 50 requests/second per site
- Use bulk endpoints for multiple updates
- Implement exponential backoff on 429 errors
- Add `sleep 0.2` between requests in loops

### Error Handling

- Always check HTTP status codes
- Parse error messages for debugging
- Log failed requests for investigation
- Implement retries for transient failures

### Pagination

- Maximum 100 items per page for most endpoints
- Always check `metadata.total` to determine total pages
- Use `offset` to iterate through pages
- Exit loops when `count` returns 0

## Common Workflows

### Daily Inventory Check

1. Use **inventory-management** skill to find low stock products
2. Use **product-management** skill to get product details
3. Send alerts or create reorder reports

### Flash Sale Campaign

1. Use **product-management** skill to identify target products
2. Use **discount-strategy** skill to create time-limited coupon
3. Use **product-management** skill to update product visibility/ribbons

### ABC Analysis for Reordering

1. Use **product-management** skill to get all products with stock and price
2. Use **inventory-management** ABC analysis pattern
3. Categorize products as A/B/C items
4. Prioritize A items for reordering

### Margin Protection

1. Use **product-management** skill to get product costs and prices
2. Use **discount-strategy** margin calculator
3. Determine maximum safe discount percentage
4. Create coupons within safe margin limits

## Troubleshooting

### "Unauthorized" Error (401)

- Verify API key is correct
- Check that API key has "Manage Products" permission
- Ensure API key is not expired

### "Forbidden" Error (403)

- Verify site ID is correct
- Check that API key belongs to site owner's account
- Ensure required Wix app is installed (Stores, Bookings, etc.)

### "Not Found" Error (404)

- Verify resource ID exists (product ID, coupon ID, etc.)
- Check that endpoint URL is correct
- Ensure API version (V1/V2/V3) is supported by the site

### Rate Limit Error (429)

- Wait 1 second and retry
- Implement exponential backoff
- Reduce request frequency
- Use bulk endpoints to reduce request count

## Documentation References

### Official Wix Docs

- Wix Stores Catalog API: https://dev.wix.com/docs/rest/business-solutions/stores/catalog/introduction
- Wix Inventory API: https://dev.wix.com/docs/rest/business-solutions/stores/inventory/introduction
- Wix Coupons API: https://dev.wix.com/docs/rest/business-management/marketing/coupons/coupons/introduction
- API Authentication: https://dev.wix.com/docs/go-headless/develop-your-project/admin-operations/make-rest-api-calls-with-an-api-key
- Standard Errors: https://dev.wix.com/docs/rest/articles/getting-started/errors

### Catalog V3 (Preview)

- Products V3: https://dev.wix.com/docs/rest/business-solutions/stores/catalog-v3/products-v3/introduction
- Inventory Items V3: https://dev.wix.com/docs/rest/business-solutions/stores/catalog-v3/inventory-items-v3/introduction

**Note**: V3 APIs are in early preview (Q4 2025 rollout). Each site supports either V1 or V3, not both.

## Contributing

When adding or updating skills:

1. Follow the established format (Overview → Configuration → API Sections → Examples)
2. Include full curl commands with headers
3. Provide both request and response examples
4. Add practical use cases and patterns
5. Update this README with new skills

## Related Documentation

- `/wix-store-optimizer/agents/` - Agent definitions using these skills
- `/wix-store-optimizer/commands/` - CLI commands leveraging these skills
- `/wix-store-optimizer/lib/` - Shared utilities for API calls
