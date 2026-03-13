# Analytics & Business Intelligence Command

**Invoke with:** `/wix:analytics`

## Purpose

Get comprehensive business intelligence across all channels (eCommerce, Events, Bookings) with advanced metrics like CLV, conversion rates, churn analysis, and growth forecasting.

## What This Command Does

When invoked, this command provides deep business analytics:

1. **Total Business Overview** - Revenue across all channels
2. **Customer Lifetime Value** - Calculate CLV and customer segments
3. **Conversion Funnel** - Track customer journey and conversion rates
4. **Growth Trends** - Month-over-month and year-over-year growth
5. **Customer Acquisition & Retention** - CAC, churn, retention cohorts
6. **Cross-Channel Analysis** - Customer behavior across eCommerce, Events, Bookings

## Available Operations

### 1. Total Business Dashboard

Comprehensive overview of your entire business:

**Example conversation:**
```
You: /wix:analytics
Claude: === TOTAL BUSINESS INTELLIGENCE ===

REVENUE BY CHANNEL:
📦 eCommerce:  $128,400 (856 orders)      - 57% of revenue
🎫 Events:     $62,350  (1,247 tickets)   - 27% of revenue
📅 Bookings:   $36,080  (844 appointments) - 16% of revenue
─────────────────────────────────────────────────────────
💰 TOTAL:      $226,830 across all channels

GROWTH (vs Last Month):
eCommerce: +12% 📈
Events: +8% 📈
Bookings: +15% 📈
Overall: +11% 📈

CUSTOMERS:
Total Unique: 1,547
Multi-Channel: 184 (12%)
Average Spend: $147

TOP INSIGHTS:
✓ Bookings showing strongest growth
✓ Multi-channel customers spend 3.2x more
⚠ 68% of customers use only one channel
```

### 2. Customer Lifetime Value (CLV)

Calculate how much each customer is worth:

**Example conversation:**
```
You: What's my customer lifetime value?
Claude: === CUSTOMER LIFETIME VALUE ANALYSIS ===

OVERALL CLV:
- Average CLV: $147
- Median CLV: $89
- Top 10% CLV: $625+

CUSTOMER SEGMENTS:
One-Time Buyers (58%):
- Count: 897 customers
- CLV: $48 average
- Revenue: $43,056 (19%)

Repeat Customers (30%):
- Count: 464 customers
- CLV: $185 average
- Revenue: $85,840 (38%)

Loyal Customers (12%):
- Count: 186 customers
- CLV: $528 average
- Revenue: $98,208 (43%)

KEY INSIGHTS:
• Loyal customers are 11x more valuable than one-timers
• Moving 10% of one-timers to repeat = +$13,700 revenue
• Retaining loyal customers is critical (43% of revenue)

RECOMMENDATIONS:
1. Create loyalty program for repeat customers
2. Re-engage one-time buyers with targeted offers
3. VIP program for top 10% customers
4. Focus on retention over acquisition
```

### 3. Conversion Funnel Analysis

Track the customer journey:

**Example conversation:**
```
You: Analyze my conversion funnel
Claude: === CONVERSION FUNNEL ANALYSIS ===

ECOMMERCE FUNNEL:
1. Catalog: 245 products
2. With Sales: 187 products (76% conversion)
3. Total Orders: 856
4. Paid Orders: 834 (97% payment rate)

CATALOG INSIGHTS:
✓ 187 products generating sales
⚠ 58 products with zero sales
• Product-to-order ratio: 1:4.5

CART INSIGHTS:
- Average items per order: 2.3
- Multi-item orders: 64%
- Single-item orders: 36%

OPPORTUNITIES:
• 58 non-selling products need promotion or removal
• Increase cross-sells to boost items per order
• Target: 2.5 items per order = +$12,500 revenue

CONVERSION RATES:
- Product View → Add to Cart: ~35% (estimated)
- Cart → Checkout: ~80%
- Checkout → Payment: 97%
- Overall: ~27% view-to-purchase

BENCHMARKS:
Industry avg: 2-3% for eCommerce
Your performance: EXCELLENT (27%)
```

### 4. Growth Trends & Forecasting

Analyze business growth:

**Example conversation:**
```
You: Show me growth trends
Claude: === GROWTH TRENDS & FORECAST ===

MONTH-OVER-MONTH (Feb vs Jan 2026):
Revenue:     $226,830 vs $204,200  (+11%)
Orders:      856 vs 782            (+9%)
Customers:   645 vs 598            (+8%)
AOV:         $265 vs $261          (+2%)

QUARTER-OVER-QUARTER (Q1 vs Q4 2025):
Revenue:     +18%
Customers:   +15%
Retention:   +22%

YEAR-OVER-YEAR (Feb 2026 vs Feb 2025):
Revenue:     +34%
Customers:   +28%
AOV:         +5%

GROWTH DRIVERS:
✓ Events revenue up 45% YoY
✓ Bookings new channel (launched Q3 2025)
✓ Customer retention improved 22%
✓ Average order value steady growth

FORECAST (March 2026):
Conservative: $235,000 (+4%)
Expected:     $245,000 (+8%)
Optimistic:   $260,000 (+15%)

Based on:
- Current trend (+11%/month)
- Seasonal factors (spring uptick)
- Planned promotions
```

### 5. Customer Acquisition & Churn

**Customer Acquisition Cost (CAC):**
```
You: What's my customer acquisition cost?
Claude: === CUSTOMER ACQUISITION ANALYSIS ===

NEW CUSTOMERS (February):
- New: 247 customers
- Returning: 398 customers
- Total: 645 customers

NEW CUSTOMER REVENUE:
- First Purchase Average: $65
- Total from New: $16,055
- Revenue % from New: 7%

NEW vs RETURNING:
- New: 247 customers → $16,055 (38%)
- Returning: 398 customers → $210,775 (93%)

RETENTION RATE: 62%

CAC ESTIMATION:
(Assuming marketing spend of $3,000/month)
- CAC: ~$12 per customer
- First Purchase: $65
- ROI on First Purchase: 5.4x

LIFETIME VALUE:
- After 3 purchases: $195 (16x CAC)
- After 6 purchases: $390 (33x CAC)

INSIGHTS:
✓ Strong CAC ratio (< $20 is excellent)
✓ High retention (62% is good)
✓ Quick payback (first purchase covers CAC 5x)

RECOMMENDATIONS:
• Continue current marketing spend
• Focus on retention (cheaper than acquisition)
• Target lookalike audiences of loyal customers
```

**Churn Analysis:**
```
You: Show me customer churn
Claude: === CHURN & RETENTION ANALYSIS ===

CUSTOMER COHORTS (Last Purchase):
Active (0-30 days):  567 customers (37%)
At Risk (31-60 days): 423 customers (27%)
Churning (61-90 days): 298 customers (19%)
Churned (90+ days):   259 customers (17%)

CHURN RATE: 17% (industry avg: 20-25%)
Your performance: BETTER THAN AVERAGE

REVENUE AT RISK:
- At Risk segment: Potential $62,145
- Churning segment: Potential $43,702
- Total at risk: $105,847

RE-ENGAGEMENT OPPORTUNITY:
If we recover:
- 25% of "At Risk": +$15,536
- 15% of "Churning": +$6,555
- Total recovery: +$22,091

RETENTION BY CHANNEL:
- eCommerce: 65% retention
- Events: 45% retention (one-time events common)
- Bookings: 72% retention (highest!)

RECOMMENDATIONS:
1. Win-back campaign for 61-90 day cohort
2. At-risk alerts for 31-60 day segment
3. Loyalty rewards for active customers
4. Learn from Bookings' high retention
```

### 6. Cross-Channel Intelligence

Track customers across all channels:

**Example conversation:**
```
You: Show me cross-channel behavior
Claude: === CROSS-CHANNEL CUSTOMER ANALYSIS ===

CUSTOMER DISTRIBUTION:
- eCommerce Only: 987 customers (64%)
- Events Only: 312 customers (20%)
- Bookings Only: 64 customers (4%)
- eCommerce + Events: 112 customers (7%)
- eCommerce + Bookings: 58 customers (4%)
- Events + Bookings: 7 customers (<1%)
- All Three Channels: 7 VIP customers (<1%)

MULTI-CHANNEL CUSTOMERS: 184 (12%)

VALUE BY CHANNEL USAGE:
Single-Channel:   $89 average CLV
Two-Channel:      $285 average CLV  (3.2x)
Three-Channel:    $725 average CLV  (8.1x!)

MULTI-CHANNEL REVENUE:
12% of customers → 38% of revenue!

CROSS-SELL OPPORTUNITIES:
eCommerce → Events:   875 customers ($87,500 potential)
eCommerce → Bookings: 929 customers ($92,900 potential)
Events → eCommerce:   305 customers ($30,500 potential)
Events → Bookings:    305 customers ($30,500 potential)
Bookings → eCommerce: 786 customers ($78,600 potential)
Bookings → Events:    837 customers ($83,700 potential)

Total Opportunity: $403,700

TOP RECOMMENDATIONS:
1. Bundle products with event tickets
2. Offer post-appointment product discounts
3. Event attendees → booking consultations
4. Create VIP program for multi-channel customers
5. Target: Increase multi-channel from 12% to 20%
   = +$45,000 revenue
```

### 7. Product Performance Matrix

Categorize products by performance:

**Example conversation:**
```
You: Analyze my product performance
Claude: === PRODUCT PERFORMANCE MATRIX ===

STARS (High Sales, High Revenue):
- Premium Headphones: 145 units, $21,750
- Designer Sunglasses: 98 units, $19,600
- Leather Jacket: 34 units, $17,000
Strategy: ✓ Keep promoting, increase inventory

WORKHORSES (High Sales, Lower Revenue):
- Basic T-Shirt: 234 units, $4,680
- Phone Case: 189 units, $3,780
- Water Bottle: 167 units, $3,340
Strategy: Volume drivers, consider bundles

NICHE (Low Sales, High Revenue):
- Luxury Watch: 8 units, $12,000
- Custom Artwork: 6 units, $9,000
Strategy: Exclusive positioning, VIP marketing

UNDERPERFORMERS (Low Sales, Low Revenue):
- Generic Mug: 12 units, $180
- Basic Pen: 8 units, $80
- Keychain: 15 units, $75
Strategy: Clearance or discontinue

RECOMMENDATIONS:
• Focus marketing on Stars
• Bundle Workhorses with Stars
• Create VIP collection for Niche items
• Clear out or remove Underperformers
• Potential revenue optimization: +$15,000
```

### 8. Business Health Score

Get an overall health assessment:

**Example conversation:**
```
You: How healthy is my business?
Claude: === BUSINESS HEALTH SCORE ===

OVERALL SCORE: 82/100 (STRONG) 🟢

CATEGORY SCORES:

Revenue Growth (85/100):
✓ +11% MoM growth (target: >5%)
✓ +34% YoY growth
✓ All channels growing
Recommendation: Maintain momentum

Customer Acquisition (78/100):
✓ CAC: $12 (excellent)
✓ New customers: 38% of total
⚠ Could improve acquisition rate
Recommendation: Increase marketing by 20%

Customer Retention (88/100):
✓ Retention rate: 62% (above avg)
✓ Churn: 17% (below avg)
✓ Loyal customers: 12%
Recommendation: Loyalty program

Profitability (80/100):
✓ Average order value trending up
✓ Multi-item purchases increasing
⚠ Product costs not tracked in API
Recommendation: Track margins separately

Channel Diversification (75/100):
✓ Three active channels
⚠ Only 12% multi-channel customers
Recommendation: Cross-sell strategy

Operational Excellence (85/100):
✓ 97% payment success rate
✓ Low cancellation rates
✓ Good fulfillment speed
Recommendation: Maintain standards

STRENGTHS:
• Strong customer retention
• Healthy growth across all channels
• Excellent operational metrics
• Growing loyal customer base

AREAS FOR IMPROVEMENT:
• Increase multi-channel engagement (12% → 20%)
• Scale marketing investment (+20%)
• Develop VIP/loyalty program
• Expand product assortment in Star category

NEXT 90 DAYS GOALS:
1. Launch loyalty program
2. Cross-channel promotion campaign
3. +15% revenue growth
4. +25% multi-channel customers
```

## Key Metrics Explained

### Financial Metrics
- **CLV (Customer Lifetime Value)**: Average revenue per customer over their lifetime
- **AOV (Average Order Value)**: Average amount spent per order
- **CAC (Customer Acquisition Cost)**: Cost to acquire one new customer
- **ROAS (Return on Ad Spend)**: Revenue generated per dollar spent on ads

### Customer Metrics
- **Retention Rate**: % of customers who make repeat purchases
- **Churn Rate**: % of customers who stop buying
- **Purchase Frequency**: How often customers buy
- **Customer Segments**: One-time, Repeat, Loyal

### Conversion Metrics
- **Conversion Rate**: % of visitors who make a purchase
- **Cart Conversion**: % of carts that complete checkout
- **Payment Success**: % of orders successfully paid

### Growth Metrics
- **MoM Growth**: Month-over-month revenue change
- **YoY Growth**: Year-over-year revenue change
- **Customer Growth**: Rate of new customer acquisition

## Use Cases

### Use Case 1: Monthly Business Review

```
You: Give me a complete business review for February
Claude: [Generates comprehensive 10-section report covering:
- Revenue by channel
- Growth trends
- Customer metrics
- Top products/services
- Opportunities
- Health score]
```

### Use Case 2: Strategic Planning

```
You: I'm planning Q2 strategy. What should I focus on?
Claude: [Analyzes data and provides:]

Q2 STRATEGY RECOMMENDATIONS:

HIGH PRIORITY:
1. Launch loyalty program (projected +$15K/mo)
2. Cross-channel marketing campaign
3. Expand bookings services (highest retention)

MEDIUM PRIORITY:
4. Product line expansion in Star category
5. Win-back campaign for churned customers
6. Weekend event schedule (underutilized)

LOW PRIORITY:
7. Clearance sale for underperformers
8. Staff training for cross-selling

PROJECTED IMPACT: +$45,000 revenue in Q2
```

### Use Case 3: Investor/Stakeholder Presentation

```
You: I need metrics for an investor presentation
Claude: === KEY BUSINESS METRICS FOR INVESTORS ===

[Provides clean, professional metrics:]

REVENUE: $226,830 (Feb 2026)
GROWTH: +34% YoY, +11% MoM
CUSTOMERS: 1,547 total, 247 new (Feb)
CLV: $147 average
CAC: $12
RETENTION: 62%
CHANNELS: 3 (eCommerce, Events, Bookings)
HEALTH SCORE: 82/100

[Plus charts and trends]
```

## Important Notes

### Data Accuracy
- Calculations based on API data only
- Marketing spend not tracked in Wix API (estimate separately)
- Profit margins require manual cost tracking
- Website traffic needs Google Analytics integration

### Limitations
- No direct traffic/visitor data from Wix API
- Marketing attribution requires UTM tracking
- Historical data limited to API retention period
- Some calculations are estimates (e.g., CAC)

### Best Practices
- Run analytics weekly for trends
- Track marketing spend externally
- Document assumptions in calculations
- Compare against industry benchmarks
- Set goals and track progress

## Command Patterns

```
"business analytics"
"show me my CLV"
"growth trends"
"customer churn"
"conversion funnel"
"business health"
"cross-channel analysis"
"what should I focus on"
```

## Skills Activated

- `analytics-insights` - Core analytics calculations
- `events-management` - Events data
- `bookings-management` - Bookings data
- `wix-api-core` - eCommerce data

## API Permissions Required

- ✅ Read Orders (eCommerce)
- ✅ Read Products
- ✅ Read Events
- ✅ Read Event Orders
- ✅ Read Bookings

## Related Commands

- `/wix:revenue-report` - Simple revenue view
- `/wix:events` - Events-specific analytics
- `/wix:bookings` - Bookings-specific analytics
- `/wix:customers` - Customer segmentation

---

**Pro Tip:** Run `/wix:analytics` monthly for strategic planning and weekly for tactical adjustments!

## Sources

Based on research from:
- [Wix Analytics Overview](https://support.wix.com/en/article/wix-analytics-about-the-marketing-overview)
- [Wix Marketing Reports](https://support.wix.com/en/article/wix-analytics-about-your-marketing-reports)
- [Conversion Tracking](https://support.wix.com/en/article/about-conversion-tracking)
- [Campaign Tracking](https://support.wix.com/en/article/tracking-campaigns-and-traffic-sources-in-wix-analytics)
