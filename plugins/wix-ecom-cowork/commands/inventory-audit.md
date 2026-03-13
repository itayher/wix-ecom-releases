# Inventory Audit - Stock Analysis & Recommendations

Complete inventory health check with slow-mover detection, ABC analysis, and clearance recommendations.

## Command Pattern

```
Run an inventory audit
Check my stock levels
Which products are low on stock?
Show me slow-moving inventory
Find dead inventory that needs clearance
```

## Workflow

### Step 1: Validate Configuration

```bash
node -e "
const { getActiveSiteId, getActiveSiteName } = require('./wix-store-optimizer/lib/site-storage');
const { validateConfig } = require('./lib/config-validator');

const validation = validateConfig();
if (!validation.valid) {
  console.error(validation.message);
  process.exit(1);
}

const siteId = getActiveSiteId();
if (!siteId) {
  console.error('❌ No site selected.');
  process.exit(1);
}

console.error(\`✓ Analyzing inventory for: \${getActiveSiteName()}\`);
"
```

### Step 2: Get Current Inventory Status

Use the **inventory-management** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   INVENTORY AUDIT REPORT"
echo "======================================"
echo ""

# Get all products with inventory data
products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

# Calculate inventory metrics
total_products=$(echo "$products" | jq '.products | length')
tracking_inventory=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true)] | length')
in_stock=$(echo "$products" | jq '[.products[] | select(.stock.inStock == true)] | length')
out_of_stock=$(echo "$products" | jq '[.products[] | select(.stock.inStock == false and .visible == true)] | length')
low_stock=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) > 0 and (.stock.quantity // 0) <= 10)] | length')

echo "📊 INVENTORY OVERVIEW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total Products: $total_products"
echo "Tracking Inventory: $tracking_inventory"
echo "In Stock: $in_stock"
echo "Out of Stock: $out_of_stock"
echo "Low Stock (≤10 units): $low_stock"
echo ""
```

### Step 3: Identify Critical Issues

```bash
echo "🚨 CRITICAL ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Out of stock visible products
if [ "$out_of_stock" -gt 0 ]; then
  echo ""
  echo "❌ OUT OF STOCK PRODUCTS ($out_of_stock):"
  echo "$products" | jq -r '.products[] | select(.stock.inStock == false and .visible == true) | "   • \(.name) (ID: \(.id))"'
  echo ""
fi

# Low stock products
if [ "$low_stock" -gt 0 ]; then
  echo ""
  echo "⚠️  LOW STOCK PRODUCTS ($low_stock):"
  echo "$products" | jq -r '.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) > 0 and (.stock.quantity // 0) <= 10) | "   • \(.name): \(.stock.quantity) units (ID: \(.id))"'
  echo ""
fi
```

### Step 4: ABC Analysis

Use sales data from the last 30 days to classify products:

```bash
echo "📈 ABC ANALYSIS (Last 30 Days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

thirty_days_ago=$(date -u -v-30d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "30 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

# Get orders from last 30 days
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$thirty_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

# Calculate revenue per product
echo "$orders" | jq -r '
.orders[]
| .lineItems[]
| {
    name: .name,
    productId: .productId,
    quantity: .quantity,
    revenue: ((.price | tonumber) * .quantity)
  }
' | jq -s '
group_by(.productId)
| map({
    name: .[0].name,
    productId: .[0].productId,
    totalQuantity: (map(.quantity) | add),
    totalRevenue: (map(.revenue) | add)
  })
| sort_by(-.totalRevenue)
| to_entries
| map(
    if .key < (length * 0.2 | floor) then .value + {category: "A"}
    elif .key < (length * 0.5 | floor) then .value + {category: "B"}
    else .value + {category: "C"}
    end
  )
' > /tmp/abc_analysis.json

# Display A products (top 20% revenue)
echo "🔵 A PRODUCTS (Top 20% Revenue - Focus Here):"
cat /tmp/abc_analysis.json | jq -r '.[] | select(.category == "A") | "   • \(.name): $\(.totalRevenue | floor) revenue, \(.totalQuantity) sold"'
echo ""

# Display C products (bottom 50% revenue - candidates for clearance)
echo "🔴 C PRODUCTS (Bottom 50% Revenue - Clearance Candidates):"
cat /tmp/abc_analysis.json | jq -r '.[] | select(.category == "C") | "   • \(.name): $\(.totalRevenue | floor) revenue, \(.totalQuantity) sold"'
echo ""
```

### Step 5: Detect Slow Movers

Products with inventory but no recent sales:

```bash
echo "🐌 SLOW-MOVING INVENTORY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get products with inventory that haven't sold recently
sold_product_ids=$(echo "$orders" | jq -r '.orders[] | .lineItems[] | .productId' | sort -u)

echo "$products" | jq --argjson sold_ids "$(echo "$sold_product_ids" | jq -R . | jq -s .)" -r '
.products[]
| select(.stock.trackInventory == true and (.stock.quantity // 0) > 0)
| select(.id as $id | ($sold_ids | index($id)) == null)
| {
    name: .name,
    id: .id,
    quantity: .stock.quantity,
    price: .price,
    inventoryValue: ((.stock.quantity // 0) * (.cost.price // .price | tonumber))
  }
| "   • \(.name): \(.quantity) units @ $\(.price) = $\(.inventoryValue | floor) at risk (ID: \(.id))"
'

echo ""
```

### Step 6: Inventory Valuation

```bash
echo "💰 INVENTORY VALUATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

total_inventory_value=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) > 0) | ((.stock.quantity // 0) * ((.cost.price // .price) | tonumber))] | add // 0')
total_inventory_units=$(echo "$products" | jq '[.products[] | select(.stock.trackInventory == true) | (.stock.quantity // 0)] | add // 0')

echo "Total Inventory Value: \$${total_inventory_value}"
echo "Total Units in Stock: $total_inventory_units"
echo ""
```

### Step 7: Actionable Recommendations

```bash
echo "✅ RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Reorder recommendations
if [ "$low_stock" -gt 0 ]; then
  echo "🔴 URGENT: Reorder $low_stock low-stock products"
  echo "   Action: Review low-stock list above and place orders"
  echo ""
fi

# Clearance recommendations
slow_mover_count=$(echo "$products" | jq --argjson sold_ids "$(echo "$sold_product_ids" | jq -R . | jq -s .)" '[.products[] | select(.stock.trackInventory == true and (.stock.quantity // 0) > 0) | select(.id as $id | ($sold_ids | index($id)) == null)] | length')

if [ "$slow_mover_count" -gt 0 ]; then
  echo "🟡 MEDIUM: $slow_mover_count slow-moving products"
  echo "   Action: Create clearance campaign with 20-30% discount"
  echo "   Command: 'create campaign' → Select 'Clearance Sale'"
  echo ""
fi

# Out of stock recommendations
if [ "$out_of_stock" -gt 0 ]; then
  echo "🟡 MEDIUM: Hide or restock $out_of_stock out-of-stock products"
  echo "   Action: Either hide them or update stock quantities"
  echo ""
fi

echo "======================================"
```

## Output Format

```
======================================
   INVENTORY AUDIT REPORT
======================================

📊 INVENTORY OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Products: 156
Tracking Inventory: 142
In Stock: 128
Out of Stock: 14
Low Stock (≤10 units): 8

🚨 CRITICAL ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ OUT OF STOCK PRODUCTS (14):
   • Blue Widget (ID: abc123)
   • Red Gadget (ID: def456)

⚠️  LOW STOCK PRODUCTS (8):
   • Green Tool: 5 units (ID: ghi789)

📈 ABC ANALYSIS (Last 30 Days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 A PRODUCTS (Top 20% Revenue):
   • Best Seller: $1,250 revenue, 42 sold

🔴 C PRODUCTS (Bottom 50% Revenue):
   • Old Stock: $15 revenue, 1 sold

🐌 SLOW-MOVING INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Slow Widget: 25 units @ $29.99 = $749 at risk

💰 INVENTORY VALUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Inventory Value: $12,345
Total Units in Stock: 450

✅ RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 URGENT: Reorder 8 low-stock products
🟡 MEDIUM: 12 slow-moving products (create clearance campaign)
```

## Skills Referenced

- **inventory-management**: Stock tracking, ABC analysis, reorder points
- **order-analytics**: Sales data for slow-mover detection
- **discount-strategy**: Clearance campaign recommendations

## Example Use Cases

1. **Weekly Check**: "Run inventory audit to see what needs attention"
2. **Reorder Planning**: "Which products should I reorder?"
3. **Clearance Planning**: "Find slow-moving inventory for a clearance sale"
4. **Stock Issues**: "Why do I have out-of-stock products showing on my site?"
5. **Valuation**: "What's my total inventory value?"

## Related Commands

- `/wix:create-campaign` - Create clearance campaigns for slow movers
- `/wix:products` - Update stock quantities
- `/wix:analyze-store` - Full store health including inventory
