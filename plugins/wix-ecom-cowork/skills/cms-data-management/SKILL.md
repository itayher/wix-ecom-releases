# CMS Data Management - Wix Data Collections API

## Overview

Manage Wix CMS Data Collections: query, create, update, and delete items in data collections. Supports custom collections like `TonyRobbinsTickets` and standard Wix collections. Full CRUD operations with filtering, sorting, and aggregation.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## List Data Collections

**Endpoint**: `GET /wix-data/v2/collections`

Get all data collections on the site.

```bash
curl -X GET "https://www.wixapis.com/wix-data/v2/collections" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "collections": [
    {
      "id": "TonyRobbinsTickets",
      "displayName": "Tony Robbins Tickets",
      "fields": [
        {
          "key": "title",
          "displayName": "Title",
          "type": "TEXT"
        },
        {
          "key": "eventDate",
          "displayName": "Event Date",
          "type": "DATETIME"
        },
        {
          "key": "ticketType",
          "displayName": "Ticket Type",
          "type": "TEXT"
        },
        {
          "key": "price",
          "displayName": "Price",
          "type": "NUMBER"
        },
        {
          "key": "status",
          "displayName": "Status",
          "type": "TEXT"
        }
      ],
      "permissions": {
        "read": "ANYONE",
        "write": "ADMIN"
      }
    }
  ]
}
```

## Get Collection Schema

**Endpoint**: `GET /wix-data/v2/collections/{collectionId}`

Get the schema/fields for a specific collection.

```bash
COLLECTION_ID="TonyRobbinsTickets"

curl -X GET "https://www.wixapis.com/wix-data/v2/collections/${COLLECTION_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Query Collection Items

**Endpoint**: `POST /wix-data/v2/items/query`

Query items with filtering, sorting, and pagination.

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "query": {
    "paging": {
      "limit": 50,
      "offset": 0
    },
    "sort": [
      {
        "fieldName": "_createdDate",
        "order": "DESC"
      }
    ]
  }
}'
```

**Response**:
```json
{
  "items": [
    {
      "_id": "item-123",
      "_createdDate": "2026-03-01T10:00:00.000Z",
      "_updatedDate": "2026-03-05T15:30:00.000Z",
      "title": "Tony Robbins UPW - VIP",
      "eventDate": "2026-04-15T18:00:00.000Z",
      "ticketType": "VIP",
      "price": 2995,
      "status": "Available",
      "seatsRemaining": 50
    }
  ],
  "totalCount": 15
}
```

### Filter by Field Value

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "query": {
    "filter": {
      "ticketType": {
        "$eq": "VIP"
      }
    },
    "paging": {
      "limit": 50
    }
  }
}'
```

### Multiple Conditions

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "query": {
    "filter": {
      "$and": [
        { "status": { "$eq": "Available" } },
        { "price": { "$lte": 500 } }
      ]
    },
    "sort": [
      { "fieldName": "price", "order": "ASC" }
    ],
    "paging": { "limit": 50 }
  }
}'
```

## Insert Item

**Endpoint**: `POST /wix-data/v2/items`

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "dataItem": {
    "data": {
      "title": "Tony Robbins DWD - Premium",
      "eventDate": "2026-06-20T09:00:00.000Z",
      "ticketType": "Premium",
      "price": 1495,
      "status": "Available",
      "seatsRemaining": 100
    }
  }
}'
```

## Update Item

**Endpoint**: `PUT /wix-data/v2/items/{itemId}`

```bash
ITEM_ID="item-id-here"

curl -X PUT "https://www.wixapis.com/wix-data/v2/items/${ITEM_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "dataItem": {
    "_id": "'"${ITEM_ID}"'",
    "data": {
      "status": "Sold Out",
      "seatsRemaining": 0
    }
  }
}'
```

## Delete Item

**Endpoint**: `DELETE /wix-data/v2/items/{itemId}`

```bash
ITEM_ID="item-id-here"

curl -X DELETE "https://www.wixapis.com/wix-data/v2/items/${ITEM_ID}?dataCollectionId=TonyRobbinsTickets" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}"
```

## Bulk Insert

**Endpoint**: `POST /wix-data/v2/bulk/items/insert`

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/bulk/items/insert" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "dataItems": [
    {
      "data": {
        "title": "Ticket Tier A",
        "ticketType": "General",
        "price": 99,
        "status": "Available"
      }
    },
    {
      "data": {
        "title": "Ticket Tier B",
        "ticketType": "VIP",
        "price": 299,
        "status": "Available"
      }
    }
  ]
}'
```

## Bulk Update

**Endpoint**: `POST /wix-data/v2/bulk/items/update`

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/bulk/items/update" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "dataItems": [
    {
      "_id": "item-1",
      "data": { "status": "Sold Out" }
    },
    {
      "_id": "item-2",
      "data": { "status": "Sold Out" }
    }
  ]
}'
```

## Aggregate Data

**Endpoint**: `POST /wix-data/v2/items/aggregate`

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/aggregate" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "initialFilter": {
    "status": { "$eq": "Available" }
  },
  "aggregation": {
    "groupingFields": ["ticketType"],
    "operations": [
      {
        "resultFieldName": "totalSeats",
        "sum": {
          "itemFieldName": "seatsRemaining"
        }
      },
      {
        "resultFieldName": "avgPrice",
        "average": {
          "itemFieldName": "price"
        }
      },
      {
        "resultFieldName": "count",
        "itemCount": {}
      }
    ]
  }
}'
```

## Count Items

**Endpoint**: `POST /wix-data/v2/items/count`

```bash
curl -X POST "https://www.wixapis.com/wix-data/v2/items/count" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "dataCollectionId": "TonyRobbinsTickets",
  "filter": {
    "status": { "$eq": "Available" }
  }
}'
```

## Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal to | `{"field": {"$eq": "value"}}` |
| `$ne` | Not equal | `{"field": {"$ne": "value"}}` |
| `$lt` | Less than | `{"field": {"$lt": 100}}` |
| `$lte` | Less than or equal | `{"field": {"$lte": 100}}` |
| `$gt` | Greater than | `{"field": {"$gt": 0}}` |
| `$gte` | Greater than or equal | `{"field": {"$gte": 50}}` |
| `$in` | In array | `{"field": {"$in": ["a","b"]}}` |
| `$contains` | Contains string | `{"field": {"$contains": "VIP"}}` |
| `$startsWith` | Starts with | `{"field": {"$startsWith": "Tony"}}` |
| `$and` | Logical AND | `{"$and": [cond1, cond2]}` |
| `$or` | Logical OR | `{"$or": [cond1, cond2]}` |

## Best Practices

1. **Use paging** for large collections (max 1000 items per query)
2. **Filter on indexed fields** for performance
3. **Use aggregation** instead of fetching all items for statistics
4. **Bulk operations** for inserting/updating multiple items (max 1000 per batch)
5. **Rate limit**: 200ms between queries
6. **Schema awareness**: Always check collection schema before querying
7. **System fields**: `_id`, `_createdDate`, `_updatedDate`, `_owner` are always present
