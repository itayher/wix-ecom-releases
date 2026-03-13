# Update Fulfillment - Order Fulfillment Management with Wix SDK

Update order fulfillment status using Wix SDK. Generates ready-to-run scripts for non-technical users (no deployment, no Wix editor needed!).

## 🚨 CRITICAL: Never Use Wix Editor/Velo

**NEVER suggest**:
- ❌ Wix site editor
- ❌ Velo code
- ❌ Dev Mode
- ❌ "Add to your Wix site"

**ALWAYS provide**:
- ✅ Wix SDK scripts that run locally
- ✅ Simple `node script.js` execution
- ✅ Works from user's computer
- ✅ No deployment required

## Wix SDK Setup (Complete Guide for Claude Cowork Users)

### Install Wix SDK (One-Time)

User runs this ONCE on their computer:

```bash
npm install @wix/api-client @wix/stores
```

Or using npx (no installation):
```bash
npx @wix/api-client
```

### Wix SDK Authentication

The SDK needs an API key (same one used in Claude Cowork plugin):

```javascript
import { createClient } from '@wix/api-client';
import { orders } from '@wix/stores';

const wixClient = createClient({
  auth: {
    apiKey: 'IST.your-api-key-here'  // Same IST key from plugin config
  }
});
```

### SDK Method - Create Fulfillment

```javascript
const { fulfillment } = await wixClient.orders.createFulfillment(
  orderId,
  {
    trackingInfo: {
      trackingNumber: "TRACK123456",
      shippingProvider: "USPS"
    }
  }
);
```

## Complete Node.js Script (For Non-Technical Users)

When user says: "Generate fulfillment update script" or "I need to update multiple orders"

### Generate This Script:

```javascript
// fulfillment-updater.js
// Run with: node fulfillment-updater.js
// No deployment, no server, just run locally!

import { createClient } from '@wix/api-client';
import { orders } from '@wix/stores';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Wix Order Fulfillment Updater');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get API key
  const apiKey = await ask('Enter your Wix API key (IST.): ');

  // Initialize Wix client
  const wixClient = createClient({
    auth: { apiKey: apiKey.trim() }
  });

  // Get order IDs
  const orderIdsInput = await ask('Enter order IDs (comma-separated): ');
  const orderIds = orderIdsInput.split(',').map(id => id.trim());

  // Get tracking number (optional)
  const trackingNumber = await ask('Tracking number (or press Enter to skip): ');

  console.log(`\nProcessing ${orderIds.length} orders...\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each order
  for (const orderId of orderIds) {
    try {
      const fulfillment = await wixClient.orders.createFulfillment(
        orderId,
        {
          trackingInfo: trackingNumber ? {
            trackingNumber: trackingNumber,
            shippingProvider: "USPS",
            trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
          } : undefined
        }
      );

      console.log(`✅ Order ${orderId} - Fulfilled`);
      successCount++;

    } catch (error) {
      console.log(`❌ Order ${orderId} - Error: ${error.message}`);
      errorCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`Total: ${orderIds.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  rl.close();
}

main().catch(console.error);
```

**Save as**: `fulfillment-updater.js`

**Run**: `node fulfillment-updater.js`

**User experience**:
1. Runs `node fulfillment-updater.js`
2. Enters API key (same from Claude config)
3. Pastes order IDs: `order1, order2, order3`
4. Enters tracking number (or skips)
5. Sees real-time results!

**No deployment, no Wix editor, works from terminal!**

---

## Command Pattern

```
Generate fulfillment update script
Create a tool to update order fulfillments
I need to mark 20 orders as fulfilled
Help me bulk update fulfillments
```

## When User Asks for UI

**User**: "Generate fulfillment UI" or "I have many orders to update"

**Claude generates**:
1. Complete Node.js script (fulfillment-updater.js)
2. Instructions: npm install, node run
3. Copy-paste ready code
4. No Wix editor, no Velo, no deployment!

## Quick Single-Order CLI

For one order, use direct curl (no script needed):

```bash
ORDER_ID="order-id-here"
TRACKING="TRACK123"

curl -X POST "https://www.wixapis.com/stores/v2/orders/${ORDER_ID}/fulfillments" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"fulfillment\": {
    \"trackingInfo\": {
      \"trackingNumber\": \"${TRACKING}\",
      \"shippingProvider\": \"USPS\"
    }
  }
}"
```

## Wix SDK Reference (For Scripts)

### Installation

```bash
npm install @wix/api-client @wix/stores
```

### Client Setup

```javascript
import { createClient } from '@wix/api-client';

const wixClient = createClient({
  auth: {
    apiKey: process.env.WIX_ACCESS_TOKEN  // From env or prompt user
  }
});
```

### Create Fulfillment

```javascript
await wixClient.orders.createFulfillment(orderId, {
  trackingInfo: {
    trackingNumber: "TRACK123",
    shippingProvider: "USPS|FedEx|UPS|DHL"
  }
});
```

### Query Unfulfilled Orders

```javascript
const { orders } = await wixClient.orders.queryOrders({
  query: {
    filter: { fulfillmentStatus: "NOT_FULFILLED" },
    paging: { limit: 50 }
  }
});
```

## Output Format

```
User: "Generate fulfillment update script"

Claude:
  ✅ Generated fulfillment-updater.js

  📋 Setup (one-time):
    npm install @wix/api-client @wix/stores

  🚀 Usage:
    node fulfillment-updater.js

  The script will:
    • Prompt for API key
    • Ask for order IDs
    • Request tracking number
    • Update all orders
    • Show results

  💡 No deployment needed - runs locally!
  💡 No Wix editor - standalone script!
  💡 No CORS issues - uses Wix SDK!

  [Code saved to: fulfillment-updater.js]
```

## Related Commands

- `/wix:orders` - Order queries
- `/wix:order-advanced` - Advanced order operations
