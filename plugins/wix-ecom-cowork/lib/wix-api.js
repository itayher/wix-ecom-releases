/**
 * Wix API Configuration and Helpers
 * For Cowork Plugin - No MCP Server
 *
 * SECURITY: App ID is hard-coded for Wix app installation
 * USER CONFIG: Only WIX_ACCESS_TOKEN needed! Sites are fetched dynamically.
 *
 * Users create API key at: https://manage.wix.com/account/api-keys
 * They get an access token (starts with IST.) that works for ALL their sites.
 * Plugin fetches site list from API, user selects in chat.
 */

const WIX_APP_ID = 'df7c18eb-009b-4868-9891-15e19dddbe67'; // Hard-coded - identifies our app
const WIX_API_BASE = 'https://www.wixapis.com';

// ONLY configuration needed from user: the access token
const ACCESS_TOKEN = process.env.WIX_ACCESS_TOKEN || process.env.WIX_API_KEY || '';

/**
 * Fetch all sites the access token has permission for
 * This is called dynamically, no need to pre-configure sites!
 */
async function fetchUserSites() {
  if (!ACCESS_TOKEN) {
    throw new Error('WIX_ACCESS_TOKEN not configured. Please add it in plugin settings.');
  }

  try {
    const response = await fetch(`${WIX_API_BASE}/site-list/v2/sites/query`, {
      method: 'POST',
      headers: {
        'Authorization': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: {} })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sites: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.sites || [];
  } catch (error) {
    throw new Error(`Error fetching sites: ${error.message}`);
  }
}

/**
 * API Endpoints Reference
 */
const ENDPOINTS = {
  QUERY_PRODUCTS: '/stores/v1/products/query',
  GET_PRODUCT: '/stores/v1/products/{id}',
  CREATE_PRODUCT: '/stores/v1/products',
  UPDATE_PRODUCT: '/stores/v1/products/{id}',
  DELETE_PRODUCT: '/stores/v1/products/{id}',

  QUERY_INVENTORY: '/stores/v1/inventoryItems/query',
  UPDATE_INVENTORY: '/stores/v1/inventoryItems/{id}',

  QUERY_ORDERS: '/stores/v1/orders/query',
  GET_ORDER: '/stores/v1/orders/{id}',

  QUERY_DISCOUNT_RULES: '/stores/v1/discount-rules/query',
  CREATE_DISCOUNT_RULE: '/stores/v1/discount-rules',

  QUERY_CONTACTS: '/contacts/v4/contacts/query'
};

/**
 * API Endpoints Reference
 */
const ENDPOINTS = {
  // Site Management
  LIST_SITES: '/site-list/v2/sites/query',

  // Products
  QUERY_PRODUCTS: '/stores/v1/products/query',
  GET_PRODUCT: '/stores/v1/products/{id}',
  CREATE_PRODUCT: '/stores/v1/products',
  UPDATE_PRODUCT: '/stores/v1/products/{id}',

  // Inventory
  QUERY_INVENTORY: '/stores/v1/inventoryItems/query',
  UPDATE_INVENTORY: '/stores/v1/inventoryItems/{id}',

  // Orders
  QUERY_ORDERS: '/stores/v1/orders/query',
  GET_ORDER: '/stores/v1/orders/{id}',

  // Discounts
  QUERY_DISCOUNT_RULES: '/stores/v1/discount-rules/query',
  CREATE_DISCOUNT_RULE: '/stores/v1/discount-rules',

  // Contacts
  QUERY_CONTACTS: '/contacts/v4/contacts/query'
};

module.exports = {
  WIX_APP_ID,
  WIX_API_BASE,
  ACCESS_TOKEN,
  ENDPOINTS,
  fetchUserSites
};
