/**
 * Configuration Validator
 * Validates that the plugin is properly configured with API key and sites
 */

const { listConfiguredSites } = require('../wix-store-optimizer/lib/site-storage');

/**
 * Validate that WIX_API_KEY is set
 */
function validateApiKey() {
  const apiKey = process.env.WIX_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      message: '❌ WIX_API_KEY is not configured.\n\nTo use this plugin, you must:\n1. Go to Claude Desktop settings\n2. Find the Wix Store Optimizer plugin\n3. Add your Wix API key to WIX_API_KEY environment variable\n\nGet your API key from: https://manage.wix.com/account/api-keys'
    };
  }

  return { valid: true };
}

/**
 * Validate that at least one site is configured
 */
function validateSites() {
  const sites = listConfiguredSites();

  if (sites.length === 0) {
    return {
      valid: false,
      message: '❌ No Wix sites configured.\n\nTo use this plugin, you must:\n1. Go to Claude Desktop settings\n2. Find the Wix Store Optimizer plugin\n3. Add at least one site:\n   - WIX_SITE_1_ID: Your site ID\n   - WIX_SITE_1_NAME: A friendly name for your site\n\nYou can add up to 3 sites (WIX_SITE_1, WIX_SITE_2, WIX_SITE_3).\n\nGet your site ID from: https://support.wix.com/en/article/finding-your-site-id'
    };
  }

  return {
    valid: true,
    sites
  };
}

/**
 * Validate complete configuration
 */
function validateConfig() {
  // Check API key
  const apiKeyValidation = validateApiKey();
  if (!apiKeyValidation.valid) {
    return apiKeyValidation;
  }

  // Check sites
  const sitesValidation = validateSites();
  if (!sitesValidation.valid) {
    return sitesValidation;
  }

  return {
    valid: true,
    apiKey: process.env.WIX_API_KEY,
    sites: sitesValidation.sites,
    message: `✅ Configuration valid\n\nAPI Key: ${process.env.WIX_API_KEY.substring(0, 10)}...\nConfigured Sites: ${sitesValidation.sites.length}\n\n${sitesValidation.sites.map(s => `  ${s.number}. ${s.siteName} (${s.siteId.substring(0, 8)}...)`).join('\n')}`
  };
}

/**
 * Get helpful setup instructions
 */
function getSetupInstructions() {
  return `
═══════════════════════════════════════════════════════
  WIX STORE OPTIMIZER - CONFIGURATION GUIDE
═══════════════════════════════════════════════════════

To use this plugin, you need to configure it in Claude Desktop.

STEP 1: Get Your Wix API Key
────────────────────────────────────────────────────────
1. Go to: https://manage.wix.com/account/api-keys
2. Create a new API key with these permissions:
   - Wix Stores: Manage Products
   - Wix Stores: Manage Orders
   - Wix Stores: Manage Inventory
   - Contacts: Manage Contacts
3. Copy the generated API key

STEP 2: Get Your Site ID
────────────────────────────────────────────────────────
1. Go to: https://www.wix.com/my-account/site-selector
2. Click on your site
3. In the URL, copy the site ID (after "/dashboard/")
   Example: https://manage.wix.com/dashboard/12345678-90ab-cdef-1234-567890abcdef
   Site ID: 12345678-90ab-cdef-1234-567890abcdef

STEP 3: Configure Claude Desktop
────────────────────────────────────────────────────────
1. Open Claude Desktop settings
2. Find "Wix Store Optimizer" plugin
3. Add environment variables:

   Required:
   • WIX_API_KEY = your-api-key-from-step-1
   • WIX_SITE_1_ID = your-site-id-from-step-2
   • WIX_SITE_1_NAME = My Store Name

   Optional (for multiple sites):
   • WIX_SITE_2_ID = second-site-id
   • WIX_SITE_2_NAME = Second Store
   • WIX_SITE_3_ID = third-site-id
   • WIX_SITE_3_NAME = Third Store

STEP 4: Restart Claude Desktop
────────────────────────────────────────────────────────
Restart Claude Desktop for changes to take effect.

STEP 5: Test the Plugin
────────────────────────────────────────────────────────
In Claude, ask:
"Show me my configured Wix sites"

═══════════════════════════════════════════════════════
Need help? https://github.com/your-repo/wix-store-optimizer
═══════════════════════════════════════════════════════
`;
}

module.exports = {
  validateApiKey,
  validateSites,
  validateConfig,
  getSetupInstructions
};
