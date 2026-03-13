# Customer Insights - Wix Contacts API

## Overview

Complete contact queries, purchase history analysis, customer segmentation, and RFM analysis using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Query Contacts

### Basic Contact Query

**Endpoint**: `POST https://www.wixapis.com/contacts/v4/contacts/query`

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 50,
      "offset": 0
    }
  }
}'
```

**Response:**

```json
{
  "contacts": [
    {
      "id": "contact-123",
      "revision": 1,
      "source": {
        "sourceType": "OTHER",
        "appId": "df7c18eb-009b-4868-9891-15e19dddbe67"
      },
      "createdDate": "2026-01-15T10:00:00.000Z",
      "updatedDate": "2026-02-21T14:30:00.000Z",
      "lastActivity": {
        "activityDate": "2026-02-21T14:30:00.000Z"
      },
      "primaryInfo": {
        "email": "customer@example.com",
        "phone": "+1-555-0123"
      },
      "info": {
        "name": {
          "first": "John",
          "last": "Doe"
        },
        "emails": {
          "items": [
            {
              "email": "customer@example.com",
              "tag": "MAIN"
            }
          ]
        }
      }
    }
  ],
  "pagingMetadata": {
    "count": 50,
    "offset": 0,
    "total": 1250
  }
}
```

### Query Contacts by Email

```bash
curl -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "primaryInfo.email": "customer@example.com"
    },
    "paging": {"limit": 10}
  }
}'
```

### Query Recent Contacts

```bash
curl -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "sort": [
      {
        "fieldName": "createdDate",
        "order": "DESC"
      }
    ],
    "paging": {"limit": 50}
  }
}'
```

### Query Contacts by Activity Date

```bash
curl -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "lastActivity.activityDate": {
        "$gte": "2026-02-01T00:00:00.000Z"
      }
    },
    "sort": [
      {
        "fieldName": "lastActivity.activityDate",
        "order": "DESC"
      }
    ],
    "paging": {"limit": 100}
  }
}'
```

## Get Single Contact

**Endpoint**: `GET https://www.wixapis.com/contacts/v4/contacts/{contactId}`

**API Call:**

```bash
curl -X GET "https://www.wixapis.com/contacts/v4/contacts/${CONTACT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "contact": {
    "id": "contact-123",
    "revision": 5,
    "createdDate": "2026-01-15T10:00:00.000Z",
    "updatedDate": "2026-02-21T14:30:00.000Z",
    "lastActivity": {
      "activityDate": "2026-02-21T14:30:00.000Z"
    },
    "primaryInfo": {
      "email": "customer@example.com",
      "phone": "+1-555-0123"
    },
    "info": {
      "name": {
        "first": "John",
        "last": "Doe"
      },
      "emails": {
        "items": [
          {
            "email": "customer@example.com",
            "tag": "MAIN",
            "primary": true
          }
        ]
      },
      "phones": {
        "items": [
          {
            "phone": "+1-555-0123",
            "tag": "MOBILE",
            "primary": true
          }
        ]
      },
      "addresses": {
        "items": [
          {
            "address": {
              "addressLine1": "123 Main St",
              "city": "San Francisco",
              "subdivision": "CA",
              "postalCode": "94105",
              "country": "US"
            },
            "tag": "HOME"
          }
        ]
      }
    }
  }
}
```

## Purchase History Analysis

### Get Customer Purchase History

**Note**: Combine Contacts API with Orders API to build purchase history

```bash
#!/bin/bash

CONTACT_EMAIL="customer@example.com"

# Get contact orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"query\": {
    \"filter\": \"{\\\"buyerInfo.email\\\": \\\"$CONTACT_EMAIL\\\", \\\"paymentStatus\\\": \\\"PAID\\\"}\",
    \"sort\": \"{\\\"dateCreated\\\": \\\"desc\\\"}\",
    \"paging\": {\"limit\": 100}
  }
}")

order_count=$(echo "$orders" | jq '.orders | length')
total_spent=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add // 0')
avg_order_value=$(echo "$orders" | jq '[.orders[].priceSummary.total | tonumber] | add / length // 0')

echo "Customer: $CONTACT_EMAIL"
echo "======================="
echo "Total Orders: $order_count"
echo "Total Spent: \$$total_spent"
echo "Average Order Value: \$$avg_order_value"
echo ""
echo "Recent Orders:"
echo "$orders" | jq -r '.orders[:5][] | "- Order #\(.number) (\(.dateCreated | split("T")[0])): $\(.priceSummary.total)"'
```

### Calculate Customer Lifetime Value

```bash
#!/bin/bash

# Get all contacts
contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1000}}}')

# Get all orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": "{\"paymentStatus\": \"PAID\"}", "paging": {"limit": 1000}}}')

# Calculate CLV by customer
echo "$orders" | jq -r --argjson contacts "$(echo "$contacts" | jq '.contacts')" '
  [.orders[] | {
    email: .buyerInfo.email,
    contactId: .buyerInfo.contactId,
    total: (.priceSummary.total | tonumber),
    date: .dateCreated
  }] |
  group_by(.email) |
  map({
    email: .[0].email,
    contactId: .[0].contactId,
    order_count: length,
    total_spent: ([.[].total] | add),
    first_order: (.[0].date | split("T")[0]),
    last_order: (.[-1].date | split("T")[0])
  }) |
  sort_by(-.total_spent) |
  .[:20] |
  to_entries |
  .[] |
  "\(.key + 1). \(.value.email) | Orders: \(.value.order_count) | CLV: $\(.value.total_spent) | First: \(.value.first_order) | Last: \(.value.last_order)"
'
```

## Customer Segmentation

### RFM Analysis (Recency, Frequency, Monetary)

**RFM Model:**

- **Recency**: Days since last purchase
- **Frequency**: Number of purchases
- **Monetary**: Total spend

```bash
#!/bin/bash

# Get all paid orders
orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

# Calculate RFM scores
echo "$orders" | jq -r '
  [.orders[] | {
    email: .buyerInfo.email,
    date: .dateCreated,
    total: (.priceSummary.total | tonumber)
  }] |
  group_by(.email) |
  map({
    email: .[0].email,
    recency: ((now - (.[0].date | fromdateiso8601)) / 86400 | floor),
    frequency: length,
    monetary: ([.[].total] | add)
  }) |
  map(. + {
    r_score: (if .recency <= 30 then 5 elif .recency <= 60 then 4 elif .recency <= 90 then 3 elif .recency <= 180 then 2 else 1 end),
    f_score: (if .frequency >= 10 then 5 elif .frequency >= 5 then 4 elif .frequency >= 3 then 3 elif .frequency >= 2 then 2 else 1 end),
    m_score: (if .monetary >= 1000 then 5 elif .monetary >= 500 then 4 elif .monetary >= 200 then 3 elif .monetary >= 100 then 2 else 1 end)
  }) |
  map(. + {
    rfm_score: (.r_score + .f_score + .m_score),
    segment: (
      if (.r_score >= 4 and .f_score >= 4 and .m_score >= 4) then "Champions"
      elif (.r_score >= 3 and .f_score >= 3) then "Loyal Customers"
      elif (.r_score >= 4 and .f_score <= 2) then "Promising"
      elif (.r_score <= 2 and .f_score >= 3) then "At Risk"
      elif (.r_score <= 2 and .f_score <= 2) then "Lost"
      else "Potential Loyalists"
      end
    )
  }) |
  group_by(.segment) |
  map({
    segment: .[0].segment,
    count: length,
    avg_recency: ([.[].recency] | add / length | floor),
    avg_frequency: ([.[].frequency] | add / length),
    avg_monetary: ([.[].monetary] | add / length),
    total_value: ([.[].monetary] | add)
  }) |
  sort_by(-.total_value) |
  .[] |
  "\(.segment): \(.count) customers | Avg Recency: \(.avg_recency)d | Avg Orders: \(.avg_frequency) | Total Value: $\(.total_value)"
'
```

### Segment Breakdown

**Customer Segments:**

1. **Champions**: R=5, F=5, M=5 (Best customers)
2. **Loyal Customers**: R≥3, F≥3 (Regular buyers)
3. **Promising**: R≥4, F≤2 (Recent, low frequency)
4. **At Risk**: R≤2, F≥3 (Used to buy, now inactive)
5. **Lost**: R≤2, F≤2 (Haven't purchased in 180+ days)
6. **Potential Loyalists**: Others

### One-Time Buyers

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "One-Time Buyers (Re-engagement Opportunity)"
echo "==========================================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, date: .dateCreated, total: .priceSummary.total}] |
  group_by(.email) |
  map({
    email: .[0].email,
    order_count: length,
    first_order_date: .[0].date,
    days_since: ((now - (.[0].date | fromdateiso8601)) / 86400 | floor)
  }) |
  map(select(.order_count == 1 and .days_since >= 30)) |
  sort_by(.days_since) |
  reverse |
  .[:20] |
  .[] |
  "\(.email) | \(.days_since) days ago"
'
```

### High-Value Customers

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "High-Value VIP Customers (Top 10%)"
echo "==================================="
echo ""

echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
  group_by(.email) |
  map({
    email: .[0].email,
    order_count: length,
    total_spent: ([.[].total] | add)
  }) |
  sort_by(-.total_spent) |
  .[0:((.  | length) * 0.1 | floor)] |
  to_entries |
  .[] |
  "\(.key + 1). \(.value.email) | \(.value.order_count) orders | $\(.value.total_spent)"
'
```

## Customer Activity Analysis

### Active vs Inactive Customers

```bash
#!/bin/bash

contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 1000}}}')

# Define active as activity within last 90 days
cutoff_date=$(date -u -v-90d +"%Y-%m-%dT00:00:00.000Z")

echo "$contacts" | jq -r --arg cutoff "$cutoff_date" '
  [.contacts[] | {
    email: .primaryInfo.email,
    lastActivity: .lastActivity.activityDate,
    isActive: (.lastActivity.activityDate >= $cutoff)
  }] |
  group_by(.isActive) |
  map({
    status: (if .[0].isActive then "Active (Last 90 Days)" else "Inactive (90+ Days)" end),
    count: length
  }) |
  .[] |
  "\(.status): \(.count) contacts"
'
```

### Customer Acquisition by Month

```bash
#!/bin/bash

contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "sort": [{"fieldName": "createdDate", "order": "DESC"}],
    "paging": {"limit": 1000}
  }
}')

echo "Customer Acquisition by Month"
echo "============================="
echo ""

echo "$contacts" | jq -r '
  [.contacts[] | {
    month: (.createdDate | split("T")[0] | split("-") | "\(.[0])-\(.[1])")
  }] |
  group_by(.month) |
  map({
    month: .[0].month,
    new_contacts: length
  }) |
  sort_by(.month) |
  reverse |
  .[:12] |
  .[] |
  "\(.month): \(.new_contacts) new contacts"
'
```

## Email Marketing Segments

### Export Active Subscribers

```bash
#!/bin/bash

# Get contacts with email consent
contacts=$(curl -s -X POST "https://www.wixapis.com/contacts/v4/contacts/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 1000}
  }
}')

# Extract emails for export
echo "$contacts" | jq -r '[.contacts[] | .primaryInfo.email] | .[]' > active_subscribers.txt

echo "Exported $(wc -l < active_subscribers.txt) email addresses to active_subscribers.txt"
```

### Segment by Purchase Behavior

```bash
#!/bin/bash

orders=$(curl -s -X POST "https://www.wixapis.com/stores/v2/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"paymentStatus\": \"PAID\"}",
    "paging": {"limit": 1000}
  }
}')

echo "Email Segments for Campaigns"
echo "============================"
echo ""

# High spenders (AOV > $150)
echo "[High Spenders] AOV > \$150:"
echo "$orders" | jq -r '
  [.orders[] | {email: .buyerInfo.email, total: (.priceSummary.total | tonumber)}] |
  group_by(.email) |
  map({email: .[0].email, aov: ([.[].total] | add / length)}) |
  map(select(.aov >= 150)) |
  .[].email
' | head -20

echo ""

# Frequent buyers (5+ orders)
echo "[Frequent Buyers] 5+ Orders:"
echo "$orders" | jq -r '
  [.orders[] | .buyerInfo.email] |
  group_by(.) |
  map({email: .[0], count: length}) |
  map(select(.count >= 5)) |
  .[].email
' | head -20
```

## Documentation References

- Contacts API Overview: https://dev.wix.com/docs/rest/business-management/contacts/contacts/introduction
- Query Contacts: https://dev.wix.com/docs/rest/api-reference/contacts/contacts-v4/contacts/query-contacts
- Get Contact: https://dev.wix.com/docs/rest/api-reference/contacts/contacts-v4/contacts/get-contact
- Contact Object: https://dev.wix.com/docs/rest/business-management/contacts/contacts/contact-object
- Filtering & Sorting: https://dev.wix.com/docs/rest/business-management/contacts/contacts/filtering-and-sorting
- RFM Analysis Guide: https://en.wikipedia.org/wiki/RFM_(market_research)
