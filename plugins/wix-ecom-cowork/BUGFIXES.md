# Bug Fixes - v2.1.1

## Issues Found and Fixed (2026-02-27)

### ✅ Issue 1: Sites List Endpoint - Wrong URL

**Problem**: `GET https://www.wixapis.com/v1/sites` returns 404

**Root Cause**: Incorrect endpoint in lib/wix-api.js

**Fix Applied**:
```javascript
// BEFORE (broken):
fetch(`${WIX_API_BASE}/v1/sites`, { method: 'GET' })

// AFTER (working):
fetch(`${WIX_API_BASE}/site-list/v2/sites/query`, {
  method: 'POST',
  body: JSON.stringify({ query: {} })
})
```

**Files Changed**:
- `lib/wix-api.js` - Updated fetchUserSites() function
- `lib/wix-api.js` - Updated ENDPOINTS.LIST_SITES

**Status**: ✅ Fixed

---

### ✅ Issue 2: Product Creation - Wrong `price` Field

**Problem**: `{"message": "Expected an object", "details": {}}` on product creation

**Root Cause**: Using `"price": 29.99` (number) instead of `"priceData": {"price": 29.99}` (object)

**Fix Applied**:
```json
// BEFORE (broken):
{
  "product": {
    "name": "Product",
    "price": 29.99
  }
}

// AFTER (working):
{
  "product": {
    "name": "Product",
    "priceData": {
      "price": 29.99
    }
  }
}
```

**Files Changed**:
- `skills/product-management/SKILL.md` - Updated CREATE examples (2 instances)

**Status**: ✅ Fixed

---

### ⚠️ Issue 3: Catalog Version Detection - Endpoint Returns 404

**Problem**: `GET https://www.wixapis.com/catalog-versioning/v1/version` returns 404

**Root Cause**: Versioning API may not exist or requires different auth

**Workaround**:
```bash
# Attempt V1 query:
curl POST /stores/v1/products/query

# If successful → V1 catalog
# If error "wrong catalog version" → V3 catalog
```

**Files Changed**: None (this endpoint wasn't in our skills)

**Status**: ⚠️ Documented workaround

**Note**: Our skills use V1 API which works for this site. V3 migration not needed yet.

---

### ⚠️ Issue 4: Image Upload from Chat - Images Not Saved to Disk

**Problem**: Images pasted inline in chat don't get saved to `/mnt/uploads/`

**Root Cause**: Vision context vs file attachments - inline images are base64, not files

**Solution**:
1. **User must save image as file** (drag-and-drop as attachment or save to disk first)
2. **Skill should detect** if image file exists before upload
3. **Provide helpful error** if image only exists as vision context

**Recommended Flow**:
```
User: "Create product from this image: [pastes inline]"

Claude:
  ⚠️ I can see the image but it's not saved as a file.

  To upload to Wix, please:
  1. Save the image to your computer
  2. Provide the file path

  Example: "Create product from ~/Desktop/mug.jpg"
```

**Files Changed**: None (this is a usage pattern, not code issue)

**Status**: ⚠️ Documented limitation

---

### ✅ Issue 5: `compareAtPrice` vs `comparePrice` Field Name

**Problem**: Inconsistent field naming in docs

**Check**: Searched all skills for `compareAtPrice`

**Result**: ✅ All skills already use `comparePrice` consistently

**Status**: ✅ No fix needed (already correct)

---

## Testing Results

### ✅ Working After Fixes:

```bash
# Sites list (Issue 1 fix)
POST /site-list/v2/sites/query
→ ✅ Returns site list

# Product creation (Issue 2 fix)
POST /stores/v1/products with priceData
→ ✅ Creates product successfully
```

### ⚠️ Known Limitations:

1. **Image Upload**: Requires Wix Media Manager API (not yet integrated)
2. **V3 Catalog**: Not supported yet (V1 works for current sites)
3. **Inline Images**: Cannot upload directly from chat vision context

---

## Version Bumps

**Before Fixes**: v2.1.0
**After Fixes**: v2.1.1

**Release Date**: 2026-02-27
**Tested By**: Itay Herskovits
**Critical Fixes**: 2
**Documentation Updates**: 3

---

## Recommended Next Steps

1. ✅ **Test sites list** - Verify POST /site-list/v2/sites/query works
2. ✅ **Test product creation** - Create test product with priceData
3. ⚠️ **Add Wix Media Manager integration** - For proper image uploads
4. ⚠️ **Add V3 catalog support** - For newer Wix sites
5. ⚠️ **Document image upload flow** - Clear instructions for users

---

**All critical bugs fixed!** ✅
