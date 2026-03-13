# 📥 Installation Guide - Wix Store Optimizer

## Super Easy Setup (3 Minutes!)

### Step 1: Get Your Wix API Key (2 minutes)

1. **Visit:** https://manage.wix.com/account/api-keys

2. **Click** "Create API Key"

3. **Name:** `Claude Desktop`

4. **Select permissions** (check ALL these):
   - ✅ Wix Stores - Read Products
   - ✅ Wix Stores - Manage Products
   - ✅ Wix Stores - Read Orders
   - ✅ Wix Stores - Manage Orders
   - ✅ Wix Stores - Read Inventory
   - ✅ Wix Stores - Manage Inventory
   - ✅ Marketing - Read Coupons
   - ✅ Marketing - Manage Coupons
   - ✅ Contacts - Read Contacts

5. **Click** "Generate API Key"

6. **Copy the token** - it looks like:
   ```
   IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0...
   ```

💡 **This token works for ALL your Wix sites!**

### Step 2: Upload Plugin to Claude (30 seconds)

1. **Open Claude Desktop**
2. **Settings** (⚙️) → **Browse Plugins**
3. **Click** "Upload Local Plugin"
4. **Select** `wix-store-optimizer.zip`
5. **Click** "Upload"

### Step 3: Configure - Just ONE Field! (30 seconds)

After upload:

1. **Click** "Customize" button
2. **Add ONLY:**
   ```
   WIX_ACCESS_TOKEN = IST.eyJraWQi... (paste from Step 1)
   ```
3. **Click** "Save"

**That's it!** No site IDs needed - plugin auto-fetches ALL your sites!

### Step 4: Use It! (1 minute)

1. **Restart Claude Desktop** (quit completely and reopen)
2. **Start new conversation**
3. **Say:** "Show me my Wix sites"

Claude will fetch ALL your sites automatically!

4. **Say:** "Connect to site 1"
5. **Try:** "Analyze my store"

## 🎉 You're Done!

## What Makes This Special

✅ **One token for all sites** - No per-site configuration
✅ **Dynamic site discovery** - Plugin fetches your sites automatically
✅ **Unlimited sites** - Works with any number of stores
✅ **Instant switching** - "Connect to site 5" anytime in chat
✅ **No restart needed** - Switch sites during conversation

## Example Flow

```
You: "Show me my Wix sites"

Claude: "I found 3 sites:

1. Joe's Surf Shop (joesurfshop.com)
2. Jane's Boutique (janesboutique.com)
3. Test Store (teststore.com)

Which site would you like to work with?"

You: "Connect to site 2"

Claude: "✓ Connected to: Jane's Boutique"

You: "Show me my products"

Claude: "[Site: Jane's Boutique]
         Found 234 products..."

You: "Actually, switch to site 1"

Claude: "✓ Switched to: Joe's Surf Shop"

You: "Show products"

Claude: "[Site: Joe's Surf Shop]
         Found 102 products..."
```

## 🔄 Switching Sites

Switch anytime during conversation:
- **"Show my sites"** → Lists all sites again
- **"Connect to site 3"** → Instant switch

**No restart, no reconfiguration!**

## 🆘 Troubleshooting

### "Access token not configured"
- Settings → Browse Plugins → wix-store-optimizer → Customize
- Add `WIX_ACCESS_TOKEN`
- Make sure it starts with `IST.`
- Save and restart Claude

### "Invalid token format"
Make sure you copied the FULL token from https://manage.wix.com/account/api-keys
- Should start with `IST.`
- Should be 500+ characters
- Should have dots (.) separating parts

### "No sites found"
- Check you're logged into the correct Wix account
- Verify API key has "Read" permission for at least one area
- Make sure you own or manage at least one Wix site

### Plugin not showing after upload
- Check Settings → Browse Plugins → Local Uploads
- Look for "wix-store-optimizer"
- Restart Claude Desktop completely

---

**Setup: 3 minutes**
**Sites: Unlimited & automatic**
**Switching: Instant in chat**
**Restarts: Only once for initial setup** ✨

**API Keys:** https://manage.wix.com/account/api-keys
