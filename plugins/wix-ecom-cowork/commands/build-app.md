# Build App — Desktop App Builder

## Triggers

Use this command when the user says anything like:
- "Build me a UI for..."
- "Create an app to..."
- "I want a screen to..."
- "Make me a tool to..."
- "Build me a desktop app for..."
- "I want an app"
- "Desktop app"

Also trigger when the user seems curious about what this can do — guide them with examples.

---

## CRITICAL — Sandbox Awareness

**You are running inside a cloud sandbox.** You do NOT have access to:
- npm registry (blocked — you will get 502 errors)
- The user's local filesystem
- Any package download servers

**BANNED COMMANDS — NEVER run any of these:**
- `npm install` / `npm ci` / `yarn install` / `pnpm install`
- `curl` or `wget` to download packages
- `npm init`
- Any command that tries to install or download dependencies

**The user has a pre-built Electron template on their LOCAL machine at `~/.wix-desktop-app-template/`.**
Your job is to generate the app code and a one-click build script that runs on their machine.

---

## Step 0 — Welcome & Validate (ALWAYS run this first)

Before doing anything else, make the user feel at home. This is for **non-technical Wix store owners** — talk to them like a friendly assistant, not a developer.

### 0a. Check API Token & Site Connection

Verify the session has a valid API token and site ID. Use the Wix MCP tools (e.g., ListWixSites or CallWixSiteAPI) to confirm connectivity.

**If token/site is missing or invalid**, guide the user warmly:

> "Hey! Before I can build your app, I need to connect to your Wix store.
> It looks like we're not connected yet. Let me help you set that up..."
>
> Then follow the plugin's setup/auth flow.

**If token/site is valid**, proceed to the greeting.

### 0b. Greet the User

Fetch the site name and ID, then present a warm welcome:

> "Welcome to your **Desktop App Builder**!
>
> You're connected to: **[Site Name]** (Site ID: `[site-id]`)
>
> I can build you a **real desktop app** — a program you double-click and use, just like any app on your computer. No coding, no technical setup. Just tell me what you need and I'll create it for you.
>
> Here are some ideas to get you started:"

### 0c. Show Examples

Present 3-4 inspiring examples with clear descriptions of what each app would do. Tailor these to what makes sense for their store (if you already know their catalog, reference real data):

> **Product Manager App**
> "A desktop app to browse, search, and edit all your products. Update prices, change descriptions, manage variants — all in one clean screen."
>
> **Order Dashboard App**
> "See all your orders in one place. Filter by status (paid, shipped, pending), view order details, and mark orders as fulfilled — without logging into the Wix dashboard."
>
> **Analytics & Sales Report App**
> "A visual dashboard showing your sales trends, top-selling products, revenue by time period, and customer insights. Great for a quick daily check on how your store is doing."
>
> **Inventory Tracker App**
> "Keep track of stock levels across all products. Get a clear view of what's running low, update quantities, and never oversell again."

Then ask:

> "Which one sounds interesting? Or describe something completely different — I can build whatever you need for your store!"

### 0d. Wait for User Input

Do NOT proceed to building until the user tells you what they want. Let them pick an example or describe their own idea.

---

## Step 1 — Read the Store First

Once the user has told you what they want, fetch their actual store data using the Cowork plugin commands:

- Fetch products (name, price, variants, inventory, collections)
- Fetch collections list
- Fetch any other entities relevant to what the user asked for

Use this real data to:
- Pre-populate dropdowns with actual collection names
- Build variant tables matching their real option structure
- Set sensible price ranges based on their catalog
- Make the UI feel like it was built for their store specifically, not a generic template

**Tell the user what you're doing:**

> "Great choice! Let me take a look at your store first so I can build something that fits perfectly..."
>
> Then after fetching:
> "I found [X] products across [Y] collections. Building your app now — this will take a minute..."

---

## Step 2 — Generate the Build Script (MANDATORY)

You MUST generate a **single self-contained .command file** (macOS) that the user downloads and double-clicks. This script runs on the user's LOCAL machine where the Electron template is already installed.

### Template Architecture

The local template at `~/.wix-desktop-app-template/` contains:
- `main.js` — Electron main process, loads `index.html`, has `SITE_ID_PLACEHOLDER` to replace
- `preload.js` — IPC bridge exposing `window.wixApi()`
- `index.html` — Placeholder HTML file to be replaced with the generated UI
- `package.json` — Build config with `productName` to update, `files` includes `["main.js", "preload.js", "index.html"]`
- `node_modules/` — Full Electron + electron-builder (pre-installed, DO NOT reinstall)

### What the .command script must do:

1. Copy the local template: `cp -a ~/.wix-desktop-app-template "$BUILD_DIR"` (use `-a` to preserve symlinks!)
2. Verify node_modules exists
3. Replace `SITE_ID_PLACEHOLDER` in `main.js` with the real site ID
4. Write the generated `index.html` (the full UI) into `$BUILD_DIR/index.html`
5. Update `productName` in `package.json`
6. Run `cd "$BUILD_DIR" && npx electron-builder --mac dmg`
7. Open the output folder in Finder

### Script template:

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════
# [APP_NAME] — Built for your Wix store
# Just double-click this file to build your desktop app!
# ═══════════════════════════════════════════════════════

set -e

APP_NAME="[APP_NAME]"
SITE_ID="[REAL_SITE_ID]"
BUILD_DIR="/tmp/wix-app-build-$(date +%s)"

echo ""
echo "Building your $APP_NAME desktop app..."
echo ""

# Step 1: Copy the pre-installed Electron template (preserve symlinks!)
if [ ! -d "$HOME/.wix-desktop-app-template/node_modules" ]; then
  echo "ERROR: Electron template not found at ~/.wix-desktop-app-template/"
  echo "Please contact support to set up the template first."
  read -p "Press Enter to close..."
  exit 1
fi

cp -a "$HOME/.wix-desktop-app-template" "$BUILD_DIR"
echo "  Copied Electron template..."

# Step 2: Replace SITE_ID_PLACEHOLDER in main.js
sed -i '' "s/SITE_ID_PLACEHOLDER/$SITE_ID/" "$BUILD_DIR/main.js"
echo "  Configured site connection..."

# Step 3: Write the UI HTML
cat > "$BUILD_DIR/index.html" << 'HTMLEOF'
[FULL GENERATED HTML HERE]
HTMLEOF
echo "  Generated app UI..."

# Step 4: Update package.json productName
sed -i '' "s/\"productName\": \"WixManager\"/\"productName\": \"$APP_NAME\"/" "$BUILD_DIR/package.json"
echo "  Configured app name..."

# Step 5: Build the .dmg
echo ""
echo "  Building desktop app (this may take 1-2 minutes)..."
cd "$BUILD_DIR"
npx electron-builder --mac dmg 2>&1 | tail -5

# Step 6: Show the result
DMG_FILE=$(find "$BUILD_DIR/dist" -name "*.dmg" | head -1)
if [ -f "$DMG_FILE" ]; then
  echo ""
  echo "  Your app is ready!"
  echo "  Location: $DMG_FILE"
  echo ""
  open "$BUILD_DIR/dist"
else
  echo ""
  echo "  Build may have completed with warnings. Check: $BUILD_DIR/dist/"
  open "$BUILD_DIR/dist" 2>/dev/null || true
fi

echo ""
read -p "Press Enter to close..."
```

### Key rules for the .command file:
- Use `cp -a` (NOT `cp -r`) — preserves symlinks in node_modules/.bin
- Write `index.html` as a SEPARATE file using heredoc — do NOT embed HTML in main.js
- Use `cat > "$BUILD_DIR/index.html" << 'HTMLEOF'` (single-quoted HTMLEOF) to prevent bash variable expansion
- Replace `SITE_ID_PLACEHOLDER` in main.js with `sed`
- Inject the actual API token inside the `index.html` `<script>` block
- The script must be fully self-contained — NO external files needed
- NEVER modify main.js beyond the sed replacement — the template's main.js already loads index.html correctly

---

## Step 3 — Generate the UI HTML (for index.html)

Write the full UI as a complete HTML file to be written as `index.html` in the .command script.

### Hard Rules for the HTML
- Pure HTML + CSS + vanilla JavaScript ONLY
- No React, no Vue, no npm packages, no CDN imports, no external dependencies
- All Wix API calls go through `window.wixApi()` — never use `fetch()` directly
- TOKEN and SITE_ID are baked in as constants at the top of the script block
- UI must be clean, modern, and usable by a non-technical Wix store owner
- Every action must show: loading state → success message or clear error
- Never show raw JSON or stack traces to the user

### window.wixApi Contract
```javascript
const result = await window.wixApi({
  token: TOKEN,           // injected by Claude
  endpoint: '/stores/v1/products/query',
  method: 'POST',         // default POST
  body: { query: {} }     // optional
});
```

### TOKEN and SITE_ID injection
At the top of the `<script>` block always write:
```javascript
const TOKEN   = 'REAL_TOKEN_FROM_SESSION';   // inject actual token
const SITE_ID = 'REAL_SITE_ID_FROM_SESSION'; // inject actual site ID
```

### Wix API Endpoint Reference (MUST use these exact endpoints)

**Query Orders (ecom v1 — cursor-based):**
```javascript
const result = await window.wixApi({
  token: TOKEN,
  endpoint: '/ecom/v1/orders/query',
  method: 'POST',
  body: {
    filter: { fulfillmentStatus: { $eq: 'NOT_FULFILLED' } },
    sort: [{ fieldName: '_createdDate', order: 'DESC' }],
    cursorPaging: { limit: 50 }
  }
});
// Response: result.orders (array), result.metadata.cursors.next (for pagination)
// Each order has: .id, .number, .buyerInfo, .lineItems, .priceSummary, .fulfillmentStatus, .paymentStatus
```

**Get Single Order:**
```javascript
const result = await window.wixApi({
  token: TOKEN,
  endpoint: `/ecom/v1/orders/${orderId}`,
  method: 'GET'
});
// Response: result.order
```

**Create Fulfillment (Mark Order as Fulfilled):**
```javascript
// CORRECT endpoint: /ecom/v1/orders/{orderId}/fulfillments
// WRONG endpoints (DO NOT USE):
//   /ecom/v1/fulfillments/{orderId}/createFulfillment  ← WRONG path
//   /stores/v1/orders/{orderId}/fulfillments            ← WRONG namespace

// lineItems use 1-based INDEX, NOT the line item id!
// trackingInfo must ONLY be included if trackingNumber is provided (empty trackingInfo = 400 error)
const fulfillment = {
  lineItems: order.lineItems.map((item, i) => ({
    index: i + 1,        // 1-based index, NOT item.id
    quantity: item.quantity
  }))
};
// Only add trackingInfo if user provided a tracking number
if (trackingNumber) {
  fulfillment.trackingInfo = {
    trackingNumber,
    shippingProvider: shippingProvider || undefined
  };
}
const result = await window.wixApi({
  token: TOKEN,
  endpoint: `/ecom/v1/orders/${orderId}/fulfillments`,
  method: 'POST',
  body: { fulfillment }
});
```
**CRITICAL fulfillment rules:**
- `lineItems[].index` is **1-based** (1, 2, 3...) — NOT the line item `id` field
- `trackingInfo` must be **omitted entirely** if no tracking number — sending empty `trackingInfo` returns 400
- Endpoint is `/ecom/v1/orders/{orderId}/fulfillments` — NOT `/ecom/v1/fulfillments/{orderId}/createFulfillment`

**Query Products:**
```javascript
const result = await window.wixApi({
  token: TOKEN,
  endpoint: '/stores/v1/products/query',
  method: 'POST',
  body: { query: { paging: { limit: 100 } } }
});
// Response: result.products (array)
```

**Update Product:**
```javascript
const result = await window.wixApi({
  token: TOKEN,
  endpoint: `/stores/v1/products/${productId}`,
  method: 'PATCH',
  body: { product: { price: newPrice } }
});
```

**Query Collections:**
```javascript
const result = await window.wixApi({
  token: TOKEN,
  endpoint: '/stores/v1/collections/query',
  method: 'POST',
  body: { query: {} }
});
```

**Error Handling Pattern (MUST follow this):**
```javascript
try {
  const result = await window.wixApi({ ... });
  if (result.message) {
    // API returned an error object
    showError(result.message || 'Unknown API error');
    return;
  }
  // Success — update UI
} catch (err) {
  showError(err.message || 'Network error — please check your connection');
}
```
**NEVER show raw error objects or empty strings to the user.** Always provide a human-readable fallback message.

### UI Quality Standards
- Clean sans-serif font (system-ui or -apple-system)
- Consistent spacing, card-based layout
- Responsive enough to look good at 1280x860
- Action buttons clearly labeled (no icon-only buttons)
- Tables for list data, forms for editing
- Confirmation step before any destructive action (delete, bulk update)
- Include a header with the store name so the user knows they're connected
- Use friendly labels and descriptions — no technical jargon

### UI Behavior Rules
- **Partial updates**: After an action (e.g., fulfilling an order), update ONLY the affected row — do NOT re-render the entire grid. Use `data-order-id` attributes on `<tr>` elements and update the specific row in-place.
- **Status changes**: When an item's status changes (e.g., fulfilled), grey out the row (opacity 0.55), replace the action button with a status badge, and disable the checkbox. Do NOT remove the row — let the user see what changed.
- **Reload button**: Always include a Refresh/Reload button in the header so users can manually refresh data.
- **Wix dashboard links**: The correct URL pattern for orders is: `https://manage.wix.com/dashboard/{SITE_ID}/ecom-platform/order-details/{ORDER_ID}` — NOT `/ecom/orders/`.

---

## Step 4 — Deliver the Build Script

Write the .command file to the sandbox filesystem and present it for download:

> "Your app builder is ready! Here's what to do:
>
> 1. **Download** the file: `[AppName]-builder.command`
> 2. **Double-click** it on your Mac
> 3. Wait about a minute while it builds
> 4. Your app will appear automatically!
>
> The app will be pre-connected to your **[Site Name]** store. Just open it and start managing your store!
>
> Want me to build another app, or would you like changes to this one?"

Make sure the .command file has execute permission:
```bash
chmod +x [AppName]-builder.command
```

---

## Important Constraints

### Build Constraints
- **NEVER run `npm install`, `npm ci`, `yarn install`, or any package install command**
- **NEVER try to download Electron or any dependencies in the sandbox**
- **NEVER fall back to a web app or HTML file — ONLY build Electron desktop apps via the .command script**
- **NEVER embed HTML in main.js — always write it as index.html**
- **ALWAYS use `cp -a` (not `cp -r`) to preserve symlinks**
- Name the output file after what it does: WixPriceEditor-builder.command, WixOrderManager-builder.command etc.

### main.js Architecture
- The .command script should write a CUSTOM `main.js` (overwriting the template's) with proper IPC handlers for the specific app's needs
- Each IPC handler should call `wixRequest()` to the correct Wix API endpoint
- Use the `https` module in main process for API calls — NEVER use `fetch()` in the renderer
- The `preload.js` exposes IPC channels via `contextBridge.exposeInMainWorld()`
- The `index.html` calls the API through the preload bridge (e.g., `window.wix.fetchOrders()`)

### Wix API Constraints
- **Fulfillment lineItems use 1-based `index`** (1, 2, 3...) — NOT the line item `id` field
- **Omit `trackingInfo` entirely** if no tracking number — empty trackingInfo = 400 error
- **Fulfillment endpoint**: `/ecom/v1/orders/{orderId}/fulfillments` — NOT `/ecom/v1/fulfillments/{orderId}/createFulfillment`
- **Order dashboard URL**: `https://manage.wix.com/dashboard/{SITE_ID}/ecom-platform/order-details/{ORDER_ID}`

### UI Constraints
- **Immediate row update**: After ANY action that changes an item's state (fulfill, update, delete), update that specific row in the grid IMMEDIATELY — do NOT wait for a refresh or re-fetch. Save the item ID before closing any modal (modals may reset state variables to null).
- After an action, update ONLY the affected row — do NOT re-render the entire grid
- When status changes, grey out the row + show status badge — do NOT remove the row
- Always include a Refresh/Reload button in the header
- Never show raw JSON, error objects, or empty strings to the user
- Always provide human-readable fallback error messages
- Confirmation step before any destructive action (delete, bulk update)

### User Experience Constraints
- Never ask the user for their token or site ID — they are already in session context
- Never ask the user to run npm, open a terminal, or do anything technical beyond double-clicking
- If something goes wrong, explain it simply and offer to try again
- Always be warm, friendly, and encouraging — these users are store owners, not developers
