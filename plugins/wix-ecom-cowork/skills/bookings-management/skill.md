# Wix Bookings Management - API Patterns

## Overview

This skill provides comprehensive patterns for managing Wix Bookings, tracking appointments, calculating service revenue, and analyzing booking performance. Use these APIs to manage services, staff, bookings, and business metrics.

## Base URLs

```
https://www.wixapis.com/bookings/v2/
https://www.wixapis.com/bookings-reader/v2/
```

## Authentication

All requests require:

```bash
-H "Authorization: ${API_KEY}" \
-H "wix-site-id: ${SITE_ID}" \
-H "Content-Type: application/json"
```

## Query Bookings

### List All Bookings

```bash
curl -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {
      "limit": 100,
      "offset": 0
    },
    "sort": [{"fieldName": "created", "order": "DESC"}]
  }
}'
```

### Filter Bookings by Status

```bash
curl -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "CONFIRMED"
    },
    "paging": {"limit": 100}
  }
}'
```

**Booking Status Values:**
- `PENDING` - Booking requested but not confirmed
- `CONFIRMED` - Booking confirmed and scheduled
- `CANCELED` - Booking was canceled
- `DECLINED` - Booking was declined

### Filter by Date Range

```bash
curl -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "startDate": {
        "$gte": "2026-01-01T00:00:00.000Z",
        "$lte": "2026-12-31T23:59:59.999Z"
      }
    },
    "paging": {"limit": 100}
  }
}'
```

### Filter by Service

```bash
curl -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "serviceId": "service-123"
    },
    "paging": {"limit": 100}
  }
}'
```

## Booking Object Structure

```json
{
  "booking": {
    "id": "booking-456",
    "serviceId": "service-123",
    "status": "CONFIRMED",
    "startDate": "2026-02-25T14:00:00.000Z",
    "endDate": "2026-02-25T15:00:00.000Z",
    "duration": 60,
    "numberOfParticipants": 1,
    "contactDetails": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1-555-0123"
    },
    "payment": {
      "status": "PAID",
      "price": {
        "amount": "75.00",
        "currency": "USD"
      },
      "paidDate": "2026-02-20T10:30:00.000Z"
    },
    "created": "2026-02-20T10:25:00.000Z",
    "updated": "2026-02-20T10:30:00.000Z"
  }
}
```

## Query Services

### List All Services

```bash
curl -X POST "https://www.wixapis.com/bookings/v2/services/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "paging": {"limit": 100}
  }
}'
```

### Get Service Details

```bash
curl -X GET "https://www.wixapis.com/bookings/v2/services/${SERVICE_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Service Object Structure

```json
{
  "service": {
    "id": "service-123",
    "name": "60-Minute Massage",
    "description": "Relaxing full-body massage",
    "type": "APPOINTMENT",
    "payment": {
      "price": {
        "amount": "75.00",
        "currency": "USD"
      },
      "deposit": {
        "amount": "25.00",
        "currency": "USD"
      },
      "paymentOptions": ["IN_PERSON", "ONLINE"]
    },
    "schedule": {
      "duration": 60,
      "availability": "BUSINESS_HOURS"
    },
    "capacity": {
      "maxParticipants": 1
    },
    "category": {
      "id": "cat-1",
      "name": "Spa Services"
    }
  }
}
```

## Calculate Booking Revenue

### Revenue by Date Range

```bash
#!/bin/bash

START_DATE="2026-02-01T00:00:00.000Z"
END_DATE="2026-02-28T23:59:59.999Z"

# Query all confirmed bookings in date range
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "CONFIRMED",
      "startDate": {
        "$gte": "'"${START_DATE}"'",
        "$lte": "'"${END_DATE}"'"
      }
    },
    "paging": {"limit": 100}
  }
}')

# Calculate metrics
total_bookings=$(echo "$bookings" | jq '.bookings | length')
paid_bookings=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID")] | length')
total_revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')
total_participants=$(echo "$bookings" | jq '[.bookings[].numberOfParticipants] | add // 0')

echo "=== BOOKING REVENUE SUMMARY ==="
echo "Period: ${START_DATE} to ${END_DATE}"
echo ""
echo "Total Bookings: $total_bookings"
echo "Paid Bookings: $paid_bookings"
echo "Total Participants: $total_participants"
echo "Total Revenue: \$$total_revenue"
echo "Average Revenue per Booking: \$$(echo "scale=2; $total_revenue / $paid_bookings" | bc)"
```

### Revenue by Service

```bash
#!/bin/bash

# Get all services
services=$(curl -s -X POST "https://www.wixapis.com/bookings/v2/services/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "=== REVENUE BY SERVICE ==="
echo ""

echo "$services" | jq -r '.services[] | "\(.id)|\(.name)"' | while IFS='|' read service_id service_name; do
  # Get bookings for this service
  bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "query": {
      "filter": {
        "serviceId": "'"${service_id}"'",
        "status": "CONFIRMED"
      },
      "paging": {"limit": 100}
    }
  }')

  count=$(echo "$bookings" | jq '.bookings | length')
  revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')

  printf "%-40s | Bookings: %-6s | Revenue: \$%.2f\n" "$service_name" "$count" "$revenue"
done
```

## Business Metrics & Analytics

### Monthly Performance Report

```bash
#!/bin/bash

MONTH_START="2026-02-01T00:00:00.000Z"
MONTH_END="2026-02-28T23:59:59.999Z"

# Get all bookings for the month
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "startDate": {
        "$gte": "'"${MONTH_START}"'",
        "$lte": "'"${MONTH_END}"'"
      }
    },
    "paging": {"limit": 100}
  }
}')

# Calculate metrics
total_bookings=$(echo "$bookings" | jq '.bookings | length')
confirmed=$(echo "$bookings" | jq '[.bookings[] | select(.status == "CONFIRMED")] | length')
canceled=$(echo "$bookings" | jq '[.bookings[] | select(.status == "CANCELED")] | length')
pending=$(echo "$bookings" | jq '[.bookings[] | select(.status == "PENDING")] | length')

paid=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID")] | length')
unpaid=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status != "PAID")] | length')

total_revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')
total_participants=$(echo "$bookings" | jq '[.bookings[].numberOfParticipants] | add // 0')

# Calculate rates
confirmation_rate=$(echo "scale=2; ($confirmed / $total_bookings) * 100" | bc)
cancellation_rate=$(echo "scale=2; ($canceled / $total_bookings) * 100" | bc)
payment_rate=$(echo "scale=2; ($paid / $total_bookings) * 100" | bc)

cat <<EOF
=== MONTHLY BOOKING PERFORMANCE ===

BOOKING STATUS:
- Total Bookings: $total_bookings
- Confirmed: $confirmed (${confirmation_rate}%)
- Canceled: $canceled (${cancellation_rate}%)
- Pending: $pending

PAYMENT STATUS:
- Paid: $paid (${payment_rate}%)
- Unpaid: $unpaid

REVENUE:
- Total Revenue: \$$total_revenue
- Total Participants: $total_participants
- Average per Booking: \$$(echo "scale=2; $total_revenue / $paid" | bc)
- Average per Participant: \$$(echo "scale=2; $total_revenue / $total_participants" | bc)

EOF
```

### Peak Hours Analysis

```bash
#!/bin/bash

# Get all confirmed bookings
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "CONFIRMED"},
    "paging": {"limit": 100}
  }
}')

echo "=== PEAK BOOKING HOURS ==="
echo ""

# Extract hours and count
echo "$bookings" | jq -r '.bookings[] | .startDate' | while read datetime; do
  hour=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$(echo $datetime | cut -d'.' -f1)" "+%H" 2>/dev/null || echo "00")
  echo "$hour"
done | sort | uniq -c | sort -rn | head -10 | while read count hour; do
  printf "%02d:00 - %02d:59 | %s bookings\n" "$hour" "$hour" "$count"
done
```

### Service Popularity Ranking

```bash
#!/bin/bash

# Get all services
services=$(curl -s -X POST "https://www.wixapis.com/bookings/v2/services/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "=== SERVICE POPULARITY RANKING ==="
echo ""

echo "$services" | jq -r '.services[] | "\(.id)|\(.name)|\(.payment.price.amount)"' | while IFS='|' read service_id service_name price; do
  # Count bookings for this service
  bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{
    "query": {
      "filter": {
        "serviceId": "'"${service_id}"'",
        "status": "CONFIRMED"
      },
      "paging": {"limit": 100}
    }
  }')

  count=$(echo "$bookings" | jq '.bookings | length')
  revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')

  echo "$count|$revenue|$service_name|$price"
done | sort -t'|' -k1 -nr | nl | while read rank data; do
  IFS='|' read count revenue name price <<< "$data"
  printf "#%-2s | %-40s | Bookings: %-6s | Revenue: \$%.2f | Price: \$%s\n" "$rank" "$name" "$count" "$revenue" "$price"
done
```

### Customer Retention Analysis

```bash
#!/bin/bash

# Get all bookings
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "CONFIRMED"},
    "paging": {"limit": 100}
  }
}')

# Count bookings per customer email
echo "$bookings" | jq -r '.bookings[] | .contactDetails.email' | sort | uniq -c | awk '{
  if ($1 == 1) one_time++;
  else if ($1 >= 2 && $1 <= 4) repeat++;
  else loyal++;
  total++;
}
END {
  print "=== CUSTOMER RETENTION ==="
  print ""
  print "One-time customers: " one_time " (" int(one_time/total*100) "%)"
  print "Repeat customers (2-4 bookings): " repeat " (" int(repeat/total*100) "%)"
  print "Loyal customers (5+ bookings): " loyal " (" int(loyal/total*100) "%)"
  print ""
  print "Total unique customers: " total
}'
```

## Advanced Use Cases

### No-Show Tracking

```bash
#!/bin/bash

# Get bookings that passed but weren't marked as complete
bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "CONFIRMED",
      "endDate": {"$lt": "'"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"'"}
    },
    "paging": {"limit": 100}
  }
}')

no_shows=$(echo "$bookings" | jq '[.bookings[] | select(.attended != true)] | length')
total=$(echo "$bookings" | jq '.bookings | length')
no_show_rate=$(echo "scale=2; ($no_shows / $total) * 100" | bc)

echo "No-shows: $no_shows / $total (${no_show_rate}%)"
```

### Revenue Forecast

```bash
#!/bin/bash

# Get upcoming confirmed bookings
upcoming=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "CONFIRMED",
      "startDate": {"$gte": "'"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"'"}
    },
    "paging": {"limit": 100}
  }
}')

upcoming_count=$(echo "$upcoming" | jq '.bookings | length')
upcoming_revenue=$(echo "$upcoming" | jq '[.bookings[] | .payment.price.amount | tonumber] | add // 0')

echo "=== REVENUE FORECAST ==="
echo "Upcoming Bookings: $upcoming_count"
echo "Expected Revenue: \$$upcoming_revenue"
```

### Average Booking Value (ABV)

```bash
#!/bin/bash

bookings=$(curl -s -X POST "https://www.wixapis.com/bookings-reader/v2/bookings/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {"status": "CONFIRMED"},
    "paging": {"limit": 100}
  }
}')

total_revenue=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID") | .payment.price.amount | tonumber] | add // 0')
paid_count=$(echo "$bookings" | jq '[.bookings[] | select(.payment.status == "PAID")] | length')

abv=$(echo "scale=2; $total_revenue / $paid_count" | bc)
echo "Average Booking Value: \$$abv"
```

## Important Notes

### Payment Status
- Bookings can be confirmed but not yet paid
- Always filter by `payment.status == "PAID"` for revenue calculations
- Deposit amounts are tracked separately from full payment

### Time Zones
- All dates in API responses are in UTC
- Convert to local time zone for reporting
- Services have time zone settings for display

### Pagination
- Max 100 results per query
- Use `offset` for pagination
- Always handle pagination for complete data

### Service Types
- `APPOINTMENT` - One-on-one bookings (e.g., massage, consultation)
- `CLASS` - Group sessions (e.g., yoga class, workshop)
- `COURSE` - Multi-session programs

### Rate Limits
- 50 requests/second per site
- Implement retry logic with exponential backoff
- Use bulk queries when possible

## API References

- Bookings V2: https://dev.wix.com/docs/rest/business-solutions/bookings/bookings/introduction
- Services V2: https://dev.wix.com/docs/rest/business-solutions/bookings/services/services-v2/introduction
- Query Bookings: https://dev.wix.com/api/rest/wix-bookings/bookings/bookings-reader/query-bookings
- Availability: https://dev.wix.com/docs/rest/business-solutions/bookings/time-slots/introduction
