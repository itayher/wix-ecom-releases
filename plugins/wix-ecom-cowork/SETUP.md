# 🚀 Wix Store Optimizer - Setup Guide

## Super Simple Setup (2 Minutes)

### Step 1: Get Your Wix API Key (1 minute)

1. Visit: **https://manage.wix.com/account/api-keys**
2. Click "Create API Key"
3. Name: `Claude Desktop`
4. Select ALL permissions (Products, Orders, Inventory, Coupons, Contacts)
5. Click "Generate"
6. **Copy the long token** (starts with `IST.`)

### Step 2: Install in Claude Desktop (1 minute)

1. **Extract** `wix-store-optimizer.zip`
2. **Open Claude Desktop** → Settings → Connectors
3. **Click "+ Add Connector"**
4. **Fill in:**

   **Name:** `wix-store-optimizer`

   **Command:** `node`

   **Arguments:**
   ```
   /Users/yourname/Downloads/wix-store-optimizer/server.js
   ```
   _(Replace with actual path where you extracted the zip)_

   **Environment Variables:**
   ```
   WIX_ACCESS_TOKEN = IST.eyJ... (paste your token from Step 1)
   ```

5. **Save**

### Step 3: Upload the Plugin

1. **Browse Plugins** → Upload Local Plugin
2. **Select** the `wix-store-optimizer` folder
3. **Upload**

### Step 4: Use It!

1. **Restart Claude Desktop**
2. **Say:** "Show me my Wix sites"
3. **Say:** "Connect to site 1"
4. **Try:** "Analyze my store"

## That's It!

Now you can:
- Manage products
- Check inventory
- Create campaigns
- Analyze revenue
- Switch between sites instantly

---

**Total setup: 2 minutes**
**Configuration: Just paste one token** ✨
