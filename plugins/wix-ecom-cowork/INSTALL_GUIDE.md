# 📥 Installation Guide - Wix Store Optimizer

## For Non-Technical Users (5 Minutes Total)

### Step 1: Get Your Wix API Key (2 minutes)

1. Visit: **https://manage.wix.com/account/api-keys**
2. Click **"Create API Key"**
3. Name it: `Claude Desktop`
4. Select ALL these permissions:
   - ✅ Read Products
   - ✅ Write Products
   - ✅ Read Orders
   - ✅ Write Orders
   - ✅ Read Inventory
   - ✅ Write Inventory
   - ✅ Read Coupons
   - ✅ Write Coupons
5. Click **"Generate Key"**
6. **Copy the key** - you'll need it in Step 3

💡 The API key is a long text starting with `IST.`

### Step 2: Find Your Site ID (1 minute)

1. Go to: **https://manage.wix.com**
2. Click on your store
3. Look at the URL in your browser:
   ```
   https://manage.wix.com/dashboard/331d0c05-2ab0-4edb-91a6-4078c7e500b9/home
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your Site ID - copy it!
   ```
4. **Copy that GUID**

### Step 3: Upload Plugin to Claude Desktop (2 minutes)

1. **Open Claude Desktop**
2. Click **⚙️ Settings**
3. Click **"Browse Plugins"**
4. Click **"Upload Local Plugin"**
5. **Select** the `wix-store-optimizer.zip` file
6. **Click "Upload"**

Claude will install the plugin and show a configuration form.

### Step 4: Configure the Plugin (in Claude UI)

After upload, you'll see a form. Fill in:

```
WIX_API_KEY:
  └─ [Paste your API key from Step 1]

WIX_SITE_1_ID:
  └─ [Paste your Site ID from Step 2]

WIX_SITE_1_NAME:
  └─ [Type your store name, e.g., "Joe's Surf Shop"]
```

**For multiple stores**, also fill in:
```
WIX_SITE_2_ID: [Another site ID]
WIX_SITE_2_NAME: [Another store name]
```

Click **"Save"**

### Step 5: Restart & Use

1. **Quit Claude Desktop completely** (not just close window)
2. **Reopen Claude Desktop**
3. **Start a new conversation**
4. **Say:** "Show me my Wix sites"
5. **Say:** "Connect to site 1"
6. **Try:** "Analyze my store"

## 🎉 You're Done!

Now you can ask Claude:
- "Show me my products"
- "What orders came in today?"
- "I need help with revenue"
- "Create a clearance campaign"
- "Check my inventory"

## 📱 What You'll See

When you ask questions, Claude will always show which store it's working with:

```
[Site: Joe's Surf Shop]

Store Health Analysis
=====================

Products: 102 items
  ✅ 89 active
  ⚠️  13 need attention (missing descriptions)

Inventory: $34,521 value
  ✅ Most items in stock
  ⚠️  15 slow-movers detected

Orders: 45 this month
  Revenue: $12,350
  AOV: $274

Health Score: 78/100 (Good)
```

## 🔄 Switching Between Stores

If you have multiple stores:

```
"Show me my sites"
→ 1. Joe's Surf Shop
→ 2. Jane's Boutique

"Connect to site 2"
→ [Site: Jane's Boutique]
```

## ❓ Troubleshooting

### Plugin doesn't show after upload
- Check Settings → Browse Plugins → Local Uploads
- Look for "wix-store-optimizer"
- Make sure you restarted Claude Desktop

### "API Key not configured" error
- Go to Settings → Browse Plugins → wix-store-optimizer
- Click the ⚙️ icon to configure
- Add your WIX_API_KEY
- Save and restart

### "No site selected" message
Say: `"Show me my Wix sites"` then `"Connect to site 1"`

### Can't find Settings
- Look for ⚙️ icon in Claude Desktop
- Or menu: Claude → Settings (Mac)

### API permission errors
- Make sure you're the store owner (not co-owner)
- Check your API key has all required permissions
- Regenerate API key if needed

## 📚 Need More Help?

See the `README.md` file in the plugin folder for complete documentation.

---

**Installation complete in 5 minutes!**

**No technical knowledge required** ✨
