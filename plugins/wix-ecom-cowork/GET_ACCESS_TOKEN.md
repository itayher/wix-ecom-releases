# 🔑 How to Get Your Access Token

## Simple 3-Step Process

### Step 1: Go to API Keys Page

**Visit:** https://manage.wix.com/account/api-keys

### Step 2: Create API Key

1. **Click** "Create API Key"
2. **Name:** `Claude Desktop`
3. **Select these permissions:**
   - ✅ **Wix Stores** - Read Products
   - ✅ **Wix Stores** - Manage Products
   - ✅ **Wix Stores** - Read Orders
   - ✅ **Wix Stores** - Manage Orders
   - ✅ **Wix Stores** - Read Inventory
   - ✅ **Wix Stores** - Manage Inventory
   - ✅ **Marketing** - Read Coupons
   - ✅ **Marketing** - Manage Coupons
   - ✅ **Contacts** - Read Contacts (for customer insights)

4. **Click** "Generate API Key"

### Step 3: Copy the Token

You'll see a long token that looks like:

```
IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjp...
```

**Copy the entire token** - this is your `WIX_ACCESS_TOKEN`!

## What This Token Does

✅ Works for **ALL your Wix sites** (in this account)
✅ No need to configure sites - plugin fetches them automatically
✅ Lasts indefinitely (doesn't expire)
✅ Can be revoked anytime from the same page

## Add to Claude Desktop

1. **Settings → Browse Plugins → wix-store-optimizer**
2. **Click "Customize"**
3. **Add:**
   ```
   WIX_ACCESS_TOKEN = IST.eyJraWQi...
   ```
4. **Save**
5. **Restart Claude Desktop**

## Verify It Works

After restart:
```
You: "Show me my Wix sites"

Claude: "I found 3 sites:
1. Joe's Surf Shop
2. Jane's Boutique
3. Test Store

Which would you like to connect to?"
```

If you see your sites - **it's working!** ✅

## Token Format

**✅ CORRECT:**
- Starts with `IST.`
- Three parts separated by dots
- Very long (500+ characters)

**❌ WRONG:**
- No `IST.` prefix
- Short hex string
- Anything else

## For Multiple Wix Accounts

If you manage sites in different Wix accounts:
- Create one API key per account
- Configure as `WIX_ACCESS_TOKEN`, `WIX_ACCESS_TOKEN_2`, etc.

---

**Direct link:** https://manage.wix.com/account/api-keys

**Takes 2 minutes!** ✨

