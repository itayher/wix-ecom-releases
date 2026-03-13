# Wix Manager — Claude Cowork Plugin

Manage your entire Wix business by having a conversation with Claude.
Products, orders, events, bookings, content — no dashboards, no forms. Just ask.

-----

## Installation

In Claude Desktop, go to **+** → **Add marketplace from GitHub** and enter:

```
itayher/wix-ecom-cowork
```

Then create your Wix API key at [manage.wix.com/account/api-keys](https://manage.wix.com/account/api-keys) and share it with Claude when prompted.

> **Developers?** See the [developer guide](plugins/wix-ecom-cowork/README.md) for CLI installation and contributing.

-----

## What It Does

### Ask About Your Business

Get instant answers about your products, orders, customers, and content — no digging through dashboards.

> *"How many orders did I get this week?"*
> *"Which products are out of stock?"*
> *"Who are my top customers?"*

-----

### Get Recommendations

Claude connects to Wix AI to surface data-driven suggestions — for discounts, promotions, and growth opportunities.

> *"What discount should I run to boost sales this weekend?"*
> *"Which products should I put on clearance?"*
> *"Suggest a campaign for my VIP customers"*

-----

### Analytics

Understand how your business is performing without building a single report.

> *"Give me a business health summary for this month"*
> *"What are my top 5 products by revenue?"*
> *"How is my business doing compared to last month?"*

-----

### Events & Bookings

Track ticket sales, manage guest lists, view appointments, and understand service performance.

> *"How did my last event perform?"*
> *"Show me this week's bookings"*
> *"Which service has the most appointments this month?"*

-----

### Content (CMS)

Query and manage your Wix CMS collections — blog posts, custom data, and any structured content you've built.

> *"Show me all published blog posts"*
> *"How many items are in my Portfolio collection?"*
> *"Add a new entry to my Testimonials collection"*

-----

### Build a Desktop App

Turn your Wix data into a standalone desktop application — no code required.

> *"Build me a desktop app to manage my orders"*
> *"Create an app to track my inventory"*

-----

## Questions You Can Ask

Here are some examples to get started. You can ask anything — these are just to spark ideas.

**At a glance**

- How is my business doing this month?
- What's my total revenue for the last 30 days?
- Give me a full business health summary
- How does this week compare to last week?

**Products**

- Which products are selling the most?
- What's my lowest-margin product?
- Show me everything that's out of stock
- Update the price of [product] to $X
- Create a new product from this image

**Orders**

- Show me today's orders
- Which orders haven't shipped yet?
- Can I refund order #1042?
- How many orders did I get this week?

**Customers**

- Who are my top 10 customers?
- Which customers haven't ordered in 60 days?
- How many repeat customers do I have?
- What's my average customer lifetime value?

**Discounts & Campaigns**

- What discount should I run right now?
- Create a clearance campaign for slow-moving products
- Build a campaign for my top customers with a special offer
- How are my current coupons performing?

**Categories**

- List all my categories and how many products are in each
- Create a Bestsellers category from my top 20 products
- Add all tea products to my Beverages category

**Shipping, Tax & Operations**

- What tax groups do I have?
- Show me my shipping zones
- Which fulfillment providers am I using?

**Events**

- How did my last event perform in ticket sales?
- Which event brought in the most revenue?
- Show me the guest list for my upcoming event
- Compare ticket sales across my last 3 events

**Bookings**

- Show me this week's bookings
- Which service has the most appointments?
- How many bookings did I get this month?
- Are there any cancellations today?

**Content (CMS)**

- Show me all published blog posts
- How many items are in my Portfolio collection?
- Add a new entry to my Testimonials collection
- Which CMS collections do I have?

-----

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.

-----

## Changelog

### v0.3.5 — March 13, 2026

- Events management with ticket sales, guest check-ins, revenue analytics
- CMS data collections CRUD with filtering and aggregation
- Pipeline Kanban with cart-to-customer tracking, audit trails, and refunds
- CLAUDE.md with builder skill reference for developers

### v0.3.0 — March 5, 2026

- AI discount recommendations now call Wix `/build` API directly

### v0.2.4 — March 3, 2026

- Email campaigns with segment targeting

### v0.2.3 — March 1, 2026

- Tax management and advanced order operations

### v0.2.0 — February 26, 2026

- AI vision product creation, performance-based categories

### v0.1.0 — February 21, 2026

- Initial release
