---
name: site-management
description: Manage Wix site selection and switching. Fetch sites dynamically from Wix API based on access token permissions.
---

# Site Management Skill

## Purpose

Dynamically fetch and manage Wix sites that the user's access token has permission for. No pre-configuration needed!

## Core Concepts

### One Token, All Sites
A single WIX_ACCESS_TOKEN (from app installation) can access ALL sites in that Wix account. No need to configure sites manually!

### Dynamic Site Discovery
On first use, call the Wix API to get all sites the token has access to. Cache this list for the conversation.

### In-Chat Site Selection
User can switch sites anytime by saying "connect to site 3" - no restart needed!

## API: List User's Sites

**Endpoint:** `GET https://www.wixapis.com/v1/sites`

**Headers:**
```bash
Authorization: {ACCESS_TOKEN}
Content-Type: application/json
```

**Full curl command:**
```bash
curl -X GET "https://www.wixapis.com/v1/sites" \
  -H "Authorization: ${WIX_ACCESS_TOKEN}" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "sites": [
    {
      "siteId": "331d0c05-2ab0-4edb-91a6-4078c7e500b9",
      "siteName": "Joe's Surf Shop",
      "url": "https://joesurfshop.com",
      "namespace": "wix",
      "isActive": true
    },
    {
      "siteId": "d3942804-aa4a-4d96-909b-57867c27e8ff",
      "siteName": "Jane's Boutique",
      "url": "https://janesboutique.com",
      "namespace": "wix",
      "isActive": true
    }
  ]
}
```

## Workflow

### First Time Use

1. **Check if site selected** (read from `~/.claude/wix-selected-site.json`)
2. **If no site:** Automatically fetch and display site list
3. **User selects:** "connect to site 2"
4. **Save selection** to `~/.claude/wix-selected-site.json`
5. **Proceed** with the user's original request

### Switching Sites

User can switch anytime:
```
User: "Show me my sites"
Claude: [Calls API, displays numbered list]

User: "Connect to site 3"
Claude: [Saves selection] ✓ Connected to: Jane's Boutique

User: "Show me products"
Claude: [Uses site 3 for API calls]
```

## Site Selection Storage

**File:** `~/.claude/wix-selected-site.json`

**Format:**
```json
{
  "siteId": "d3942804-aa4a-4d96-909b-57867c27e8ff",
  "siteName": "Jane's Boutique",
  "selectedAt": 1708598400000,
  "url": "https://janesboutique.com"
}
```

**Functions:**
```javascript
const { getSelectedSite, saveSelectedSite } = require('../lib/site-storage');

// Get current selection
const site = getSelectedSite();

// Save new selection
saveSelectedSite(siteId, siteName, url);
```

## Display Format

When showing sites to user:

```
Your Wix Sites:

1. Joe's Surf Shop
   ID: 331d0c05-2ab0-4edb-91a6-4078c7e500b9
   URL: joesurfshop.com
   Status: Active

2. Jane's Boutique
   ID: d3942804-aa4a-4d96-909b-57867c27e8ff
   URL: janesboutique.com
   Status: Active

3. Test Store
   ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   URL: teststore.com
   Status: Active

To connect to a site, say: "connect to site 2"
```

## Always Show Active Site

**CRITICAL:** Before ANY response involving store data, display:
```
[Site: Jane's Boutique]
```

This ensures user always knows which store they're working with.

## Error Handling

### No access token configured
```
Error: WIX_ACCESS_TOKEN not found.

Please configure in Claude Desktop:
1. Settings → Browse Plugins → wix-store-optimizer
2. Click "Customize"
3. Add: WIX_ACCESS_TOKEN = (your token from app installation)
4. Save and restart Claude
```

### API call fails
```
Unable to fetch sites. Please check:
- Access token is valid
- Token hasn't expired
- You have permission to view sites

Create a new API key: https://manage.wix.com/account/api-keys
```

### No sites found
```
No sites found for this access token.

Make sure:
- You installed the app on at least one site
- The token is from the correct Wix account
```

## Common Patterns

### Check if Site Selected
```bash
# Read selection file
cat ~/.claude/wix-selected-site.json 2>/dev/null
```

If empty/missing → Show site list

### Get Site Name for Display
```bash
# Extract site name from selection
SITE_NAME=$(cat ~/.claude/wix-selected-site.json | jq -r '.siteName')
echo "[Site: $SITE_NAME]"
```

### Save User's Selection
```bash
# After user says "connect to site 2"
# Get site 2 from the fetched list, then save:
echo '{"siteId":"d3942804...","siteName":"Jane's Boutique","selectedAt":...}' > ~/.claude/wix-selected-site.json
```

## Integration with Commands

Every command should:

1. **Check selection:**
   ```bash
   SELECTED_SITE=$(cat ~/.claude/wix-selected-site.json 2>/dev/null)
   ```

2. **If empty:** Run site selection flow

3. **Extract site ID:**
   ```bash
   SITE_ID=$(echo "$SELECTED_SITE" | jq -r '.siteId')
   SITE_NAME=$(echo "$SELECTED_SITE" | jq -r '.siteName')
   ```

4. **Display site name:**
   ```
   [Site: $SITE_NAME]
   ```

5. **Use in API calls:**
   ```bash
   curl ... -H "wix-site-id: $SITE_ID"
   ```

## Benefits

✅ **No manual site configuration** - Fetched automatically
✅ **Works with unlimited sites** - Not limited to 3
✅ **Easy switching** - "connect to site 5"
✅ **Always up-to-date** - Fetches latest site list
✅ **One token** - Access all sites in account
✅ **No restart needed** - Switch sites in chat

This is MUCH better UX than pre-configuring sites! 🎉
