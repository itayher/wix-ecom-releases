# Customers - Customer Management & Segmentation

List customers, view purchase history, segment by behavior, and identify VIPs.

## Command Pattern

```
List my customers
Show customer details for [email]
Find VIP customers
Segment customers by behavior
Customer purchase history
One-time buyers
Repeat customers
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

console.error(\`✓ Analyzing customers for: \${getActiveSiteName()}\`);
"
```

### Step 2: List Recent Customers

Use the **customer-insights** skill patterns:

```bash
SITE_ID=$(node -e "const { getActiveSiteId } = require('./wix-store-optimizer/lib/site-storage'); console.log(getActiveSiteId());")
API_KEY="${WIX_API_KEY}"

echo "======================================"
echo "   CUSTOMER LIST"
echo "======================================"
echo ""

contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "sort": [{"fieldName": "createdDate", "order": "DESC"}],
    "paging": {"limit": 50}
  }
}')

total_contacts=$(echo "$contacts" | jq '.pagingMetadata.total // 0')
showing=$(echo "$contacts" | jq '.contacts | length')

echo "Total Contacts: $total_contacts"
echo "Showing: $showing most recent"
echo ""

echo "$contacts" | jq -r '.contacts[] | "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: \(.info.name.first // "") \(.info.name.last // "")
Email: \(.info.emails[0].email // "No email")
Phone: \(.info.phones[0].phone // "No phone")
Created: \(.createdDate // "Unknown")
ID: \(.id)
"'

echo "======================================"
```

### Step 3: Get Single Customer Details

```bash
CUSTOMER_EMAIL="customer@example.com"

echo "======================================"
echo "   CUSTOMER DETAILS"
echo "======================================"
echo "Email: $CUSTOMER_EMAIL"
echo ""

# Query contact by email
contact=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"info.emails.email\\\": \\\"$CUSTOMER_EMAIL\\\"}\"}}")

contact_id=$(echo "$contact" | jq -r '.contacts[0].id // empty')

if [ -z "$contact_id" ]; then
  echo "❌ Customer not found"
  exit 1
fi

# Get full contact details
curl -s -X GET "https://www.wixapis.com/contacts/v4/contacts/${contact_id}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json" | jq '{
  name: "\(.contact.info.name.first // "") \(.contact.info.name.last // "")",
  email: .contact.info.emails[0].email,
  phone: .contact.info.phones[0].phone,
  addresses: [.contact.info.addresses[] | {
    street: .street,
    city: .city,
    state: .subdivision,
    zip: .postalCode,
    country: .country
  }],
  createdDate: .contact.createdDate,
  lastActivity: .contact.lastActivity.activityDate
}'

echo ""
```

### Step 4: Customer Purchase History

```bash
echo "📦 PURCHASE HISTORY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get all orders for this customer
customer_orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"buyerInfo.email\\\": \\\"$CUSTOMER_EMAIL\\\"}\", \"sort\": \"{\\\"dateCreated\\\": \\\"desc\\\"}\"}}") order_count=$(echo "$customer_orders" | jq '.orders | length')
lifetime_value=$(echo "$customer_orders" | jq '[.orders[] | select(.paymentStatus == "PAID") | .priceSummary.total | tonumber] | add // 0')

echo "Total Orders: $order_count"
echo "Lifetime Value: \$$lifetime_value"
echo ""

if [ "$order_count" -gt 0 ]; then
  echo "Order History:"
  echo "$customer_orders" | jq -r '.orders[] | "   • Order #\(.number) - \(.dateCreated | split("T")[0]) - $\(.priceSummary.total) (\(.paymentStatus))"'
  echo ""

  # Calculate AOV
  aov=$(echo "scale=2; $lifetime_value / $order_count" | bc)
  echo "Average Order Value: \$$aov"
fi

echo ""
```

### Step 5: RFM Customer Segmentation

```bash
echo "======================================"
echo "   CUSTOMER SEGMENTATION (RFM)"
echo "======================================"
echo ""

# Get all paid orders from last 90 days
ninety_days_ago=$(date -u -v-90d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "90 days ago" +"%Y-%m-%dT%H:%M:%S.000Z")

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": {\"filter\": \"{\\\"dateCreated\\\": {\\\"\\$gte\\\": \\\"$ninety_days_ago\\\"}, \\\"paymentStatus\\\": \\\"PAID\\\"}\", \"paging\": {\"limit\": 1000}}}")

# Calculate RFM segments
rfm=$(echo "$orders" | jq -r '
.orders
| group_by(.buyerInfo.email)
| map({
    email: .[0].buyerInfo.email,
    recency: (now - (.[0].dateCreated | fromdateiso8601)) / 86400,
    frequency: length,
    monetary: (map(.priceSummary.total | tonumber) | add)
  })
| map(
    . + {
      segment: (
        if .recency <= 30 and .frequency >= 3 and .monetary >= 300 then "Champions"
        elif .recency <= 60 and .frequency >= 2 then "Loyal Customers"
        elif .recency <= 30 and .frequency <= 2 then "Promising"
        elif .recency > 60 and .frequency >= 3 then "At Risk"
        elif .recency > 60 and .frequency <= 2 then "Lost"
        else "Potential Loyalists"
        end
      )
    }
  )
| group_by(.segment)
| map({segment: .[0].segment, count: length, totalValue: (map(.monetary) | add)})
| sort_by(-.totalValue)
')

echo "$rfm" | jq -r '.[] | "
\(.segment):
  Customers: \(.count)
  Total Value: $\(.totalValue | floor)
"'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
```

### Step 6: VIP Customers (Top 10%)

```bash
echo "⭐ VIP CUSTOMERS (Top 10% by Spend)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

vip_customers=$(echo "$orders" | jq -r '
.orders
| group_by(.buyerInfo.email)
| map({
    email: .[0].buyerInfo.email,
    name: "\(.[0].billingInfo.contactDetails.firstName // "") \(.[0].billingInfo.contactDetails.lastName // "")",
    orders: length,
    totalSpent: (map(.priceSummary.total | tonumber) | add)
  })
| sort_by(-.totalSpent)
| .[0:(length * 0.1 | floor)]
')

vip_count=$(echo "$vip_customers" | jq 'length')
vip_total_value=$(echo "$vip_customers" | jq '[.[].totalSpent] | add // 0')

echo "VIP Count: $vip_count customers"
echo "VIP Total Value: \$$vip_total_value"
echo ""

echo "$vip_customers" | jq -r '.[] | "   • \(.email): \(.orders) orders, $\(.totalSpent | floor) spent"'

echo ""
```

### Step 7: One-Time Buyers

```bash
echo "🔵 ONE-TIME BUYERS (Conversion Opportunity)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

one_time_buyers=$(echo "$orders" | jq -r '
.orders
| group_by(.buyerInfo.email)
| map(select(length == 1))
| map({
    email: .[0].buyerInfo.email,
    date: .[0].dateCreated | split("T")[0],
    spent: .[0].priceSummary.total
  })
| sort_by(.date) | reverse
')

one_time_count=$(echo "$one_time_buyers" | jq 'length')

echo "One-Time Buyers: $one_time_count customers"
echo ""

if [ "$one_time_count" -gt 0 ]; then
  echo "Recent one-time buyers (first 20):"
  echo "$one_time_buyers" | jq -r '.[0:20][] | "   • \(.email) - Last purchase: \(.date) ($\(.spent))"'
  echo ""
  echo "💡 RECOMMENDATION: Send re-engagement campaign to these customers"
fi

echo ""
```

### Step 8: Repeat Customers

```bash
echo "💚 REPEAT CUSTOMERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

repeat_customers=$(echo "$orders" | jq -r '
.orders
| group_by(.buyerInfo.email)
| map(select(length > 1))
| map({
    email: .[0].buyerInfo.email,
    orders: length,
    totalSpent: (map(.priceSummary.total | tonumber) | add),
    lastOrder: .[0].dateCreated | split("T")[0]
  })
| sort_by(-.orders)
')

repeat_count=$(echo "$repeat_customers" | jq 'length')
total_customers=$(echo "$orders" | jq '[.orders[] | .buyerInfo.email] | unique | length')
repeat_rate=$(echo "scale=1; ($repeat_count / $total_customers) * 100" | bc)

echo "Repeat Customers: $repeat_count"
echo "Total Customers: $total_customers"
echo "Repeat Rate: ${repeat_rate}%"
echo ""

echo "Top 10 Repeat Customers:"
echo "$repeat_customers" | jq -r '.[0:10][] | "   • \(.email): \(.orders) orders, $\(.totalSpent | floor) spent"'

echo ""
echo "======================================"
```

### Step 9: Export Customer List for Email Marketing

```bash
echo "📧 EMAIL EXPORT FOR MARKETING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Export all customer emails from orders
echo "$orders" | jq -r '[.orders[] | .buyerInfo.email] | unique | .[]' > /tmp/customer_emails.txt

email_count=$(wc -l < /tmp/customer_emails.txt | tr -d ' ')

echo "✅ Exported $email_count unique customer emails to /tmp/customer_emails.txt"
echo ""
echo "Use this list for:"
echo "  • Email marketing campaigns"
echo "  • Re-engagement promotions"
echo "  • Newsletter signups"
echo ""
```

## Output Format

```
✓ Analyzing customers for: My Store

======================================
   CUSTOMER LIST
======================================

Total Contacts: 345
Showing: 50 most recent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: John Doe
Email: john@example.com
Phone: +1-555-0123
Created: 2026-02-15T10:30:00.000Z
ID: abc123

⭐ VIP CUSTOMERS (Top 10% by Spend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIP Count: 12 customers
VIP Total Value: $4,567

   • john@example.com: 8 orders, $567 spent
   • jane@example.com: 6 orders, $445 spent

💚 REPEAT CUSTOMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Repeat Customers: 45
Total Customers: 123
Repeat Rate: 36.6%
```

## Skills Referenced

- **customer-insights**: RFM segmentation, purchase history, CLV calculation
- **order-analytics**: Order history, spend analysis

## Example Use Cases

1. **Browse Customers**: "Show me my customer list"
2. **Customer Details**: "Get details for john@example.com"
3. **VIP Analysis**: "Who are my VIP customers?"
4. **Segmentation**: "Segment customers by behavior"
5. **Re-engagement**: "Find one-time buyers for a re-engagement campaign"
6. **Loyalty Analysis**: "What's my repeat customer rate?"
7. **Email Export**: "Export customer emails for marketing"

## Related Commands

- `/wix:orders` - View customer order history
- `/wix:revenue-report` - Customer revenue contribution
- `/wix:analyze-store` - Overall customer base metrics
