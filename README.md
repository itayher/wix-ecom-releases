# 🛒 Wix eCommerce Cowork — Claude Plugin

**Manage your entire Wix store through natural conversation with Claude Desktop Cowork.**
No dashboards. No clicking around. Just tell Claude what you need.

---

## 📥 Releases

| Version | Date | Download |
|---------|------|----------|
| **v2.5.0** ⭐ Latest | 2026-03-05 | [wix-ecom-cowork-v2.5.0.zip](https://github.com/itayher/wix-ecom-releases/releases/download/v2.5.0/wix-ecom-cowork-v2.5.0.zip) |
| v1.1.0 | 2026-02-23 | [Release page](https://github.com/itayher/wix-ecom-releases/releases/tag/v1.1.0) |
| v1.0.1 | 2026-02-23 | [Release page](https://github.com/itayher/wix-ecom-releases/releases/tag/v1.0.1) |

---

## ⚡ Getting Started

1. Download **[wix-ecom-cowork-v2.5.0.zip](https://github.com/itayher/wix-ecom-releases/releases/download/v2.5.0/wix-ecom-cowork-v2.5.0.zip)** to your computer
2. In **Claude Desktop Cowork**, go to **Settings → Plugins** and add the zip file
3. Create your Wix API key at [manage.wix.com/account/api-keys](https://manage.wix.com/account/api-keys) and share it with Claude when prompted

Once loaded, just start a conversation — Claude will know how to manage your store.

---

## 🤖 AI-Powered

Upload a photo, describe what you need, and Claude handles the rest. No forms, no manual entry.

> *"Create a product listing from this image"*
> *"Auto-categorize all my uncategorized products"*
> *"Create a Bestsellers category from my top 20 products by revenue"*

- Create a product listing from a photo
- Batch import products from an image folder
- Auto-categorize your entire catalog
- Match products to best-fit categories with confidence scores
- Create a category and auto-populate it by keywords
- Create a "Bestsellers" category ranked by units sold
- Create a "Top Revenue" category ranked by sales
- Create a "Trending" category based on recent orders
- Create a "High Margin" category ranked by profitability
- Create a "Customer Favorites" category by order count

---

## 📦 Products

Browse, create, and update your catalog without opening the dashboard.

> *"Show me all products under $20"*
> *"Update the price of my Yoga Mat to $35"*
> *"Help me create a new product step by step"*

- Search and filter products
- Create a new product with all details
- Update pricing and inventory
- Bulk update product visibility
- Archive or delete products
- Full variant management (options + inventory)
- Configure subscription plans
- Assign fulfillment providers and shipping groups
- Step-by-step guided product setup with quality scoring
- Fix missing images, optimize descriptions for SEO
- Fix low-margin products, improve quality scores

---

## 🗂️ Categories

Organize your catalog and keep your store easy to browse.

> *"List all my categories and how many products are in each"*
> *"Add all tea products to my Beverages category"*
> *"Create a Summer Sale category and fill it automatically"*

- List all categories
- Create, update, and delete categories
- Add or remove products from a category
- Count products per category
- Auto-categorize all uncategorized products
- Create a category and auto-populate by keywords or sales data

---

## 🛒 Orders

Track, filter, and act on orders without clicking through the dashboard.

> *"Show me my orders from today"*
> *"Which orders are still unfulfilled?"*
> *"Can I refund order #1042?"*

- View recent orders and filter by status or date
- Track fulfillment progress and add tracking numbers
- Search orders by customer
- Get order statistics and aggregations
- Check if an order can be refunded
- Check payment collection status
- Track tips and gratuity
- List connected fulfillment providers (Printful, Shippo, etc.)
- Check configured payment gateways
- Validate draft order status

---

## 👥 Customers

Understand who your customers are and how to keep them coming back.

> *"Who are my top 10 customers by lifetime value?"*
> *"How many customers bought more than once this month?"*
> *"Which customers haven't ordered in 60 days?"*

- Identify one-time vs repeat customers
- Calculate customer lifetime value (CLV)
- Calculate customer acquisition cost (CAC)
- Identify VIP customers
- Analyze churn rate and retention cohorts
- Find re-engagement opportunities
- Discover cross-sell patterns and purchase frequency

---

## 💰 Discounts & Campaigns

Claude asks Wix AI for data-driven recommendations — no guessing, no manual percentages.

> *"I need a discount recommendation to boost sales"*
> *"Create a clearance campaign for slow-moving inventory"*
> *"Send an email campaign to my top customers with a special offer"*

- Get AI-powered discount recommendations (via Wix AI — no guessing)
- Create clearance campaigns
- Create AOV booster campaigns
- Run seasonal promotions
- Track coupon performance and campaign ROI
- Build and send email campaigns with segment targeting

---

## 📊 Analytics

Get a clear picture of your store's health without building reports.

> *"Give me a business health summary for this month"*
> *"What are my top 5 products by revenue?"*
> *"How is my store doing compared to last month?"*

- Full business intelligence dashboard (CLV, CAC, growth, health)
- Revenue trends across all channels
- Top products by units, revenue, and margin
- Store health audit with recommendations

---

## 💼 Tax, Shipping & Operations

Configure the operational side of your store through conversation.

> *"What tax groups do I have set up?"*
> *"Show me my shipping zones"*

- Configure tax groups and regions
- Manage shipping zones and rates
- Track fulfillment across providers

---

## 🎫 Events & Bookings

Track performance for services, appointments, and events.

> *"How did my last event perform in ticket sales?"*
> *"Show me this week's bookings"*

- Track event ticket sales and revenue (gross & net after fees)
- Manage guest lists and compare event performance
- View appointment analytics and service performance

---

## 📋 Changelog

### [v2.5.0](https://github.com/itayher/wix-ecom-releases/releases/tag/v2.5.0) (2026-03-05)
- AI discount recommendations now call Wix `/build` API directly — no manual analysis, no invented percentages
- Removed broken feedback endpoint from all workflows

### v2.4.0 (2026-03-03)
- Email campaign with segment targeting and AI discount integration

### v2.3.x (2026-03-01)
- Tax management: groups, regions, calculations
- Order advanced: refunds, payment status, tips, aggregation

### v2.0.0–v2.2.0 (2026-02-26–28)
- AI vision product creation from images
- GraphQL advanced product operations
- Performance-based and AI-powered categories
- Guided product creation workflows

### v1.0.0 (2026-02-21)
- Initial release
