# Catalog Optimization - Product Quality & SEO

## Overview

Product listing quality audit, SEO improvements, missing field detection, and catalog health scoring using direct Wix REST API calls.

## Configuration

- **App ID**: `df7c18eb-009b-4868-9891-15e19dddbe67`
- **API Key**: `${API_KEY}`
- **Site ID**: `${SITE_ID}`

## Product Quality Audit

### Find Products Missing Descriptions

**API Call:**

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.description == null or .description == "" or (.description | length) < 50)] | map({id, name, description_length: (.description // "" | length)})'
```

### Find Products Missing Images

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.media.mainMedia == null or .media.mainMedia.image == null)] | map({id, name, has_image: false})'
```

### Find Products Missing Prices

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.price == null or (.price | tonumber) == 0)] | map({id, name, price})'
```

### Find Products Missing SKUs

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.sku == null or .sku == "")] | map({id, name, sku})'
```

## Comprehensive Catalog Health Score

### Calculate Product Quality Score

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "CATALOG HEALTH REPORT"
echo "===================="
echo ""

# Calculate quality scores
echo "$products" | jq -r '
  [.products[] | {
    id,
    name,
    has_description: ((.description // "" | length) >= 50),
    has_image: (.media.mainMedia.image != null),
    has_price: ((.price // 0 | tonumber) > 0),
    has_sku: (.sku != null and .sku != ""),
    has_brand: (.brand != null and .brand != ""),
    has_ribbon: (.ribbon != null and .ribbon != ""),
    description_length: (.description // "" | length)
  }] |
  map(. + {
    quality_score: (
      (if .has_description then 25 else 0 end) +
      (if .has_image then 25 else 0 end) +
      (if .has_price then 20 else 0 end) +
      (if .has_sku then 15 else 0 end) +
      (if .has_brand then 10 else 0 end) +
      (if .has_ribbon then 5 else 0 end)
    )
  }) |

  # Overall catalog metrics
  {
    total_products: length,
    avg_quality_score: ([.[].quality_score] | add / length),
    excellent: ([.[] | select(.quality_score >= 80)] | length),
    good: ([.[] | select(.quality_score >= 60 and .quality_score < 80)] | length),
    needs_improvement: ([.[] | select(.quality_score >= 40 and .quality_score < 60)] | length),
    poor: ([.[] | select(.quality_score < 40)] | length),

    missing_descriptions: ([.[] | select(.has_description == false)] | length),
    missing_images: ([.[] | select(.has_image == false)] | length),
    missing_skus: ([.[] | select(.has_sku == false)] | length),
    missing_brands: ([.[] | select(.has_brand == false)] | length)
  } |

  "Total Products: \(.total_products)",
  "Average Quality Score: \(.avg_quality_score | floor)/100",
  "",
  "Score Distribution:",
  "  Excellent (80-100): \(.excellent) products",
  "  Good (60-79): \(.good) products",
  "  Needs Improvement (40-59): \(.needs_improvement) products",
  "  Poor (0-39): \(.poor) products",
  "",
  "Missing Fields:",
  "  Descriptions: \(.missing_descriptions)",
  "  Images: \(.missing_images)",
  "  SKUs: \(.missing_skus)",
  "  Brands: \(.missing_brands)"
'
```

### Identify Top Priority Fixes

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "TOP PRIORITY PRODUCTS TO FIX"
echo "============================"
echo ""

echo "$products" | jq -r '
  [.products[] | {
    id,
    name,
    has_description: ((.description // "" | length) >= 50),
    has_image: (.media.mainMedia.image != null),
    has_price: ((.price // 0 | tonumber) > 0),
    quality_score: (
      (if ((.description // "" | length) >= 50) then 25 else 0 end) +
      (if (.media.mainMedia.image != null) then 25 else 0 end) +
      (if ((.price // 0 | tonumber) > 0) then 20 else 0 end) +
      (if (.sku != null and .sku != "") then 15 else 0 end) +
      (if (.brand != null and .brand != "") then 10 else 0 end) +
      (if (.ribbon != null and .ribbon != "") then 5 else 0 end)
    ),
    issues: [
      (if ((.description // "" | length) < 50) then "❌ Missing/short description" else null end),
      (if (.media.mainMedia.image == null) then "❌ No product image" else null end),
      (if ((.price // 0 | tonumber) == 0) then "❌ No price set" else null end),
      (if (.sku == null or .sku == "") then "⚠️  Missing SKU" else null end),
      (if (.brand == null or .brand == "") then "⚠️  Missing brand" else null end)
    ] | map(select(. != null))
  }] |
  map(select(.quality_score < 60)) |
  sort_by(.quality_score) |
  .[:10] |
  .[] |
  "\(.name) (Score: \(.quality_score)/100)",
  (.issues | map("  " + .) | .[]),
  ""
'
```

## SEO Optimization

### Find Products Missing SEO Data

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.seoData == null or .seoData.tags == null or (.seoData.tags | length) == 0)] | map({id, name, has_seo: false})'
```

### Generate SEO Title and Description

```bash
#!/bin/bash

# Get product
PRODUCT_ID="product-abc123"

product=$(curl -s -X GET "https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}")

product_name=$(echo "$product" | jq -r '.product.name')
product_desc=$(echo "$product" | jq -r '.product.description // ""')

# Generate SEO metadata (example - use AI or template)
seo_title="${product_name} - Buy Online | Your Store Name"
seo_desc=$(echo "$product_desc" | cut -c1-155)

echo "Generated SEO for: $product_name"
echo "Title: $seo_title"
echo "Description: $seo_desc"
echo ""
echo "Apply with:"
echo "curl -X PATCH \"https://www.wixapis.com/stores/v1/products/${PRODUCT_ID}\" \\"
echo "  -H \"Authorization: \${API_KEY}\" \\"
echo "  -H \"wix-site-id: \${SITE_ID}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
  \"product\": {
    \"seoData\": {
      \"tags\": [
        {\"type\": \"title\", \"children\": \"'"$seo_title"'\", \"custom\": true},
        {\"type\": \"meta\", \"props\": {\"name\": \"description\", \"content\": \"'"$seo_desc"'\"}}
      ]
    }
  }
}'"
```

### Optimize Product Slugs

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Products with Non-Optimized Slugs"
echo "================================="
echo ""

echo "$products" | jq -r '
  .products[] |
  select(.slug | contains("product-") or contains("_") or contains("--")) |
  "❌ \(.name) → /product-page/\(.slug)"
'
```

## Image Optimization

### Find Products with Multiple Images

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | {id, name, image_count: ((.media.items // []) | length)}] | sort_by(.image_count)'
```

### Find Products Needing More Images

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Products Needing More Images (< 3 images)"
echo "========================================="
echo ""

echo "$products" | jq -r '
  .products[] |
  {
    id,
    name,
    price,
    image_count: ((.media.items // []) | length)
  } |
  select(.image_count < 3) |
  "• \(.name) - \(.image_count) image(s) - $\(.price)"
'
```

### Check Image Alt Text

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Products Missing Image Alt Text"
echo "==============================="
echo ""

echo "$products" | jq -r '
  .products[] |
  select(.media.mainMedia.image != null) |
  select(.media.mainMedia.image.altText == null or .media.mainMedia.image.altText == "") |
  "• \(.name) - Main image has no alt text"
'
```

## Pricing Optimization

### Find Products with No Compare Price

```bash
curl -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}' | jq '[.products[] | select(.comparePrice == null or (.comparePrice | tonumber) == 0)] | map({id, name, price, comparePrice})'
```

### Identify Pricing Anomalies

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Pricing Issues"
echo "=============="
echo ""

echo "$products" | jq -r '
  .products[] |
  {
    name,
    price: (.price // 0 | tonumber),
    comparePrice: (.comparePrice // 0 | tonumber),
    cost: (.cost // 0 | tonumber)
  } |

  # Check for various pricing issues
  if (.price == 0) then
    "❌ \(.name) - Price is $0"
  elif (.comparePrice > 0 and .comparePrice <= .price) then
    "⚠️  \(.name) - Compare price (\(.comparePrice)) not higher than price (\(.price))"
  elif (.cost > 0 and .price < .cost) then
    "❌ \(.name) - Selling below cost! Price: $\(.price), Cost: $\(.cost)"
  elif (.cost > 0 and ((.price - .cost) / .price * 100) < 20) then
    "⚠️  \(.name) - Low margin: \(((.price - .cost) / .price * 100) | floor)%"
  else
    empty
  end
'
```

### Calculate Average Margins by Collection

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

collections=$(curl -s -X POST "https://www.wixapis.com/stores/v1/collections/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 50}}}')

echo "Average Margins by Collection"
echo "============================="
echo ""

echo "$products" | jq -r --argjson cols "$(echo "$collections" | jq '.collections')" '
  [.products[] | {
    name,
    price: (.price // 0 | tonumber),
    cost: (.cost // 0 | tonumber),
    margin: (if (.cost // 0 | tonumber) > 0 and (.price // 0 | tonumber) > 0 then ((.price - .cost) / .price * 100) else null end),
    collectionIds: .collectionIds // []
  }] |
  map(select(.margin != null)) |
  # Group by first collection
  group_by(.collectionIds[0]) |
  map({
    collection_id: (.[0].collectionIds[0] // "No Collection"),
    avg_margin: ([.[].margin] | add / length),
    products: length
  }) |
  .[] |
  "\(.collection_id): \(.avg_margin | floor)% avg margin (\(.products) products)"
'
```

## Content Improvements

### Find Short Descriptions

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Products with Short Descriptions (< 100 chars)"
echo "=============================================="
echo ""

echo "$products" | jq -r '
  .products[] |
  {
    name,
    desc_length: (.description // "" | length)
  } |
  select(.desc_length < 100) |
  "• \(.name) - \(.desc_length) characters"
'
```

### Find Missing Product Details

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "Products Missing Key Fields"
echo "==========================="
echo ""

echo "$products" | jq -r '
  .products[] |
  {
    name,
    missing: [
      (if (.description == null or (.description | length) < 50) then "description" else null end),
      (if (.brand == null or .brand == "") then "brand" else null end),
      (if (.weight == null or (.weight | tonumber) == 0) then "weight" else null end),
      (if (.ribbon == null or .ribbon == "") then "ribbon/badge" else null end),
      (if (.sku == null or .sku == "") then "SKU" else null end)
    ] | map(select(. != null))
  } |
  select(.missing | length > 0) |
  "• \(.name): Missing \(.missing | join(", "))"
'
```

## Bulk Optimization Operations

### Bulk Add Default SEO Data

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "$products" | jq -r '.products[] | select(.seoData == null) | .id' | while read product_id; do
  # Get product details
  product=$(curl -s -X GET "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}")

  name=$(echo "$product" | jq -r '.product.name')
  desc=$(echo "$product" | jq -r '.product.description // ""' | cut -c1-155)

  # Update with SEO data
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
      \"product\": {
        \"seoData\": {
          \"tags\": [
            {\"type\": \"title\", \"children\": \"$name - Buy Online\", \"custom\": true},
            {\"type\": \"meta\", \"props\": {\"name\": \"description\", \"content\": \"$desc\"}}
          ]
        }
      }
    }" > /dev/null

  echo "✓ Added SEO data to: $name"
  sleep 0.2
done
```

### Bulk Add Alt Text to Images

```bash
#!/bin/bash

products=$(curl -s -X POST "https://www.wixapis.com/stores/v1/products/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
  "query": {
    "filter": "{\"visible\": true}",
    "paging": {"limit": 100}
  }
}')

echo "$products" | jq -r '.products[] | select(.media.mainMedia.image != null and (.media.mainMedia.image.altText == null or .media.mainMedia.image.altText == "")) | {id, name, image: .media.mainMedia.image.url}' | jq -c '.' | while read product; do
  product_id=$(echo "$product" | jq -r '.id')
  product_name=$(echo "$product" | jq -r '.name')
  image_url=$(echo "$product" | jq -r '.image')

  # Update with alt text
  curl -s -X PATCH "https://www.wixapis.com/stores/v1/products/${product_id}" \
    -H "Authorization: ${API_KEY}" \
    -H "wix-site-id: ${SITE_ID}" \
    -H "Content-Type: application/json" \
    -d "{
      \"product\": {
        \"media\": {
          \"mainMedia\": {
            \"image\": {
              \"url\": \"$image_url\",
              \"altText\": \"$product_name\"
            }
          }
        }
      }
    }" > /dev/null

  echo "✓ Added alt text to: $product_name"
  sleep 0.2
done
```

## Documentation References

- Products API: https://dev.wix.com/docs/rest/api-reference/wix-stores/catalog/query-products
- SEO Best Practices: https://support.wix.com/en/article/wix-stores-optimizing-your-product-pages-for-seo
- Product Images: https://support.wix.com/en/article/wix-stores-adding-product-images
- Alt Text Guide: https://moz.com/learn/seo/alt-text
