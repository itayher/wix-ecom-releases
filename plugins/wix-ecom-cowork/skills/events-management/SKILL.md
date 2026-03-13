# Events Management - Wix Events API

## Overview

Comprehensive Wix Events management: create/update events, manage tickets, track RSVPs, guest lists, check-ins, and event orders. Includes revenue analytics and CMS integration for custom event data like TonyRobbinsTickets.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Base URLs

```
https://www.wixapis.com/events/v3/
https://www.wixapis.com/events-orders/v1/
https://www.wixapis.com/events/v1/
https://www.wixapis.com/events/v2/
```

## Query Events

### List All Events

```bash
curl -X POST "https://www.wixapis.com/events/v3/events/query" \
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

### Filter Events by Status

```bash
curl -X POST "https://www.wixapis.com/events/v3/events/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "status": "SCHEDULED"
    },
    "paging": {"limit": 100}
  }
}'
```

**Event Status Values:**
- `SCHEDULED` - Event is upcoming
- `STARTED` - Event is currently happening
- `ENDED` - Event has finished
- `CANCELED` - Event was canceled

### Filter Events by Date Range

```bash
curl -X POST "https://www.wixapis.com/events/v3/events/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "scheduling.config.startDate": {
        "$gte": "2026-01-01T00:00:00.000Z",
        "$lte": "2026-12-31T23:59:59.999Z"
      }
    },
    "paging": {"limit": 100}
  }
}'
```

## Event Object Structure

```json
{
  "event": {
    "id": "event-123",
    "title": "Summer Music Festival",
    "description": "Annual music festival",
    "scheduling": {
      "config": {
        "startDate": "2026-07-15T18:00:00.000Z",
        "endDate": "2026-07-15T23:00:00.000Z",
        "timeZoneId": "America/New_York"
      }
    },
    "status": "SCHEDULED",
    "registration": {
      "type": "TICKETED",
      "guestLimit": 500
    },
    "created": "2026-01-10T10:00:00.000Z",
    "updated": "2026-02-20T15:30:00.000Z"
  }
}
```

## Get Single Event

```bash
EVENT_ID="event-id-here"

curl -X GET "https://www.wixapis.com/events/v3/events/${EVENT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Create Event

```bash
curl -X POST "https://www.wixapis.com/events/v3/events" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "event": {
    "title": "New Event Title",
    "description": "Event description here",
    "scheduling": {
      "config": {
        "startDate": "2026-05-01T18:00:00.000Z",
        "endDate": "2026-05-01T22:00:00.000Z",
        "timeZoneId": "America/New_York"
      }
    },
    "location": {
      "name": "Venue Name",
      "type": "VENUE",
      "address": {
        "formatted": "123 Main St, City, State"
      }
    },
    "registration": {
      "type": "TICKETED",
      "guestLimit": 500
    }
  }
}'
```

## Update Event

```bash
EVENT_ID="event-id-here"

curl -X PATCH "https://www.wixapis.com/events/v3/events/${EVENT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "event": {
    "title": "Updated Event Title",
    "description": "Updated description"
  }
}'
```

## Cancel Event

```bash
EVENT_ID="event-id-here"

curl -X POST "https://www.wixapis.com/events/v3/events/${EVENT_ID}/cancel" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json"
```

## Query Event Orders & Tickets

### Get All Orders for an Event

```bash
curl -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "event-123"
    },
    "paging": {"limit": 100}
  }
}'
```

### Filter Orders by Status

**Order Status Values:**
- `PENDING` - Order created but not paid
- `PAID` - Order successfully paid
- `CANCELED` - Order was canceled
- `REFUNDED` - Order was refunded

```bash
curl -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "event-123",
      "status": "PAID"
    },
    "paging": {"limit": 100}
  }
}'
```

### Order Object Structure

```json
{
  "order": {
    "id": "order-456",
    "eventId": "event-123",
    "status": "PAID",
    "ticketQuantity": 3,
    "totalPrice": {
      "amount": "150.00",
      "currency": "USD"
    },
    "netPrice": {
      "amount": "146.25",
      "currency": "USD"
    },
    "serviceFee": {
      "amount": "3.75",
      "currency": "USD"
    },
    "created": "2026-02-15T14:20:00.000Z",
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "ticketDefinitionIds": ["ticket-def-1", "ticket-def-2"]
  }
}
```

## Ticket Definitions

### Query Ticket Types

```bash
curl -X POST "https://www.wixapis.com/events/v1/ticket-definitions/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "event-123"
    },
    "paging": {"limit": 100}
  }
}'
```

### Create Ticket Definition

```bash
curl -X POST "https://www.wixapis.com/events/v2/ticket-definitions" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "definition": {
    "eventId": "EVENT_ID_HERE",
    "name": "General Admission",
    "price": {
      "amount": "99.00",
      "currency": "USD"
    },
    "limitPerCheckout": 10,
    "salePeriod": {
      "startDate": "2026-03-01T00:00:00.000Z",
      "endDate": "2026-04-14T23:59:59.000Z"
    }
  }
}'
```

## Guests & Check-In

### Query Guests

```bash
curl -X POST "https://www.wixapis.com/events/v1/guests/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "event-123"
    },
    "paging": {"limit": 100}
  }
}'
```

### Filter by Check-In Status

```bash
curl -X POST "https://www.wixapis.com/events/v1/guests/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "event-123",
      "checkedIn": true
    },
    "paging": {"limit": 100}
  }
}'
```

### Check In a Guest

```bash
GUEST_ID="guest-id-here"

curl -X POST "https://www.wixapis.com/events/v1/guests/${GUEST_ID}/check-in" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json"
```

## RSVPs (Non-Ticketed Events)

```bash
curl -X POST "https://www.wixapis.com/events/v1/rsvps/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": {
      "eventId": "EVENT_ID_HERE"
    },
    "paging": {"limit": 100}
  }
}'
```

## Revenue Analytics

### Event Revenue Summary

```bash
EVENT_ID="event-123"

orders=$(curl -s -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"filter": {"eventId": "'"${EVENT_ID}"'", "status": "PAID"}, "paging": {"limit": 100}}}')

total_tickets=$(echo "$orders" | jq '[.orders[].ticketQuantity] | add // 0')
gross_revenue=$(echo "$orders" | jq '[.orders[].totalPrice.amount | tonumber] | add // 0')
net_revenue=$(echo "$orders" | jq '[.orders[].netPrice.amount | tonumber] | add // 0')
service_fees=$(echo "$orders" | jq '[.orders[].serviceFee.amount | tonumber] | add // 0')

echo "Tickets Sold: $total_tickets"
echo "Gross Revenue: \$$gross_revenue"
echo "Net Revenue: \$$net_revenue"
echo "Service Fees: \$$service_fees"
```

### Multi-Event Revenue Report

```bash
events=$(curl -s -X POST "https://www.wixapis.com/events/v3/events/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}')

echo "$events" | jq -r '.events[] | "\(.id)|\(.title)"' | while IFS='|' read event_id event_title; do
  orders=$(curl -s -X POST "https://www.wixapis.com/events-orders/v1/orders/query" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d '{"query": {"filter": {"eventId": "'"${event_id}"'", "status": "PAID"}}}')

  tickets=$(echo "$orders" | jq '[.orders[].ticketQuantity] | add // 0')
  revenue=$(echo "$orders" | jq '[.orders[].netPrice.amount | tonumber] | add // 0')

  printf "%-40s | Tickets: %-6s | Revenue: \$%.2f\n" "$event_title" "$tickets" "$revenue"
done
```

## CMS Integration

Events can link to custom CMS collections for extended data.

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "query": {
    "paging": {"limit": 50}
  }
}'
```

## Service Fee Notes

- Wix charges a 2.5% ticket service fee on ticketed events
- `totalPrice` = price paid by customer
- `netPrice` = revenue after service fee
- `serviceFee` = 2.5% of ticket price

## Best Practices

1. **Pagination**: Max 100 results per query, use `offset` for more
2. **Rate limit**: 50 requests/second per site
3. **Time zones**: API dates are UTC, use `timeZoneId` for display
4. **Cross-reference contacts** using contactId for customer insights
5. **Use CMS collections** for custom event metadata
6. **Track check-ins** for real-time attendance monitoring

## API References

- Events V3: https://dev.wix.com/docs/rest/business-solutions/events/events-v3/introduction
- Event Orders: https://dev.wix.com/docs/rest/business-solutions/events/orders-and-checkout/orders/introduction
- Event Guests: https://dev.wix.com/docs/rest/business-solutions/events/event-guests/introduction
- Ticket Definitions: https://dev.wix.com/docs/rest/business-solutions/events/event-management/ticket-definitions-v3/introduction
