# Bookings Management Command

**Invoke with:** `/wix:bookings`

## Purpose

Manage Wix Bookings, track appointments, calculate service revenue, and analyze booking performance for service-based businesses.

## What This Command Does

When invoked, this command provides comprehensive bookings management capabilities:

1. **List All Services** - View all bookable services with pricing
2. **Booking Calendar** - See upcoming appointments and availability
3. **Revenue Analysis** - Calculate earnings by service, time period, or staff member
4. **Service Performance** - Identify top services and optimization opportunities
5. **Customer Analytics** - Track repeat customers and retention

## Available Operations

### 1. List All Services

Shows all bookable services:
- Service name and type (APPOINTMENT, CLASS, COURSE)
- Duration and pricing
- Booking count and revenue
- Availability settings

**Example conversation:**
```
You: /wix:bookings
Claude: I'll show you all your bookable services...

SERVICES (5):

APPOINTMENTS:
• 60-Minute Massage - $75 (1 hour) - 145 bookings - $10,875 revenue
• 30-Minute Consultation - $45 (30 min) - 89 bookings - $4,005 revenue
• Hair Cut & Style - $65 (45 min) - 178 bookings - $11,570 revenue

CLASSES:
• Yoga Class - $20 (1 hour) - 234 bookings - $4,680 revenue
• Spin Class - $25 (45 min) - 198 bookings - $4,950 revenue

TOTAL REVENUE: $36,080 across 844 bookings
```

### 2. Booking Calendar View

See upcoming appointments:
- Today's schedule
- This week's bookings
- Calendar utilization
- Available slots

**Example conversation:**
```
You: Show me today's bookings
Claude: === TODAY'S SCHEDULE - Feb 23, 2026 ===

09:00 - Hair Cut & Style - Jane Smith - $65 ✓ CONFIRMED
10:00 - Yoga Class (12 participants) - $240 ✓ CONFIRMED
11:00 - 60-Minute Massage - John Doe - $75 ✓ CONFIRMED
12:00 - [AVAILABLE]
13:00 - 30-Minute Consultation - Sarah Lee - $45 ⏰ PENDING
14:00 - Hair Cut & Style - Mike Brown - $65 ✓ CONFIRMED
15:00 - [AVAILABLE]
16:00 - Spin Class (18 participants) - $450 ✓ CONFIRMED

TODAY'S STATS:
- Bookings: 6 confirmed, 1 pending
- Capacity Used: 70%
- Revenue: $905 confirmed

OPPORTUNITIES:
• 2 available slots (12pm, 3pm)
• Potential revenue: $130-$150
```

### 3. Revenue Analysis

Calculate earnings by various dimensions:

**By Time Period:**
```
You: What's my bookings revenue this month?
Claude: === BOOKINGS REVENUE - February 2026 ===

SUMMARY:
- Total Bookings: 127 confirmed
- Paid Bookings: 118
- Total Revenue: $8,850
- Payment Rate: 92.9%

BREAKDOWN BY SERVICE:
1. Hair Cut & Style: $2,665 (41 bookings)
2. 60-Minute Massage: $2,250 (30 bookings)
3. Spin Class: $1,575 (63 participants)
4. Yoga Class: $1,380 (69 participants)
5. 30-Minute Consultation: $980 (22 bookings)

DAILY AVERAGE: $397/day
PROJECTED MONTH END: $11,100
```

**By Service:**
```
You: Which service makes the most money?
Claude: === SERVICE PERFORMANCE RANKING ===

1. Hair Cut & Style
   - Bookings: 178
   - Revenue: $11,570
   - Avg per booking: $65
   - Status: ⭐ TOP EARNER

2. 60-Minute Massage
   - Bookings: 145
   - Revenue: $10,875
   - Avg per booking: $75
   - Status: ⭐ HIGH VALUE

3. Spin Class
   - Bookings: 198 sessions (3,564 participants)
   - Revenue: $4,950
   - Avg per session: $25
   - Status: 🔥 HIGH VOLUME

4. Yoga Class
   - Bookings: 234 sessions (4,212 participants)
   - Revenue: $4,680
   - Avg per session: $20
   - Status: 🔥 POPULAR

5. 30-Minute Consultation
   - Bookings: 89
   - Revenue: $4,005
   - Avg per booking: $45
   - Status: 💡 LEAD GENERATOR

INSIGHTS:
• Individual services ($65-75) have highest per-booking value
• Classes drive volume but lower per-participant revenue
• Consultations convert to full services 68% of the time
```

### 4. Customer Analytics

Track customer behavior and retention:

**Repeat Customer Analysis:**
```
You: How many repeat customers do I have?
Claude: === CUSTOMER RETENTION ANALYSIS ===

CUSTOMER SEGMENTS:
- One-time customers: 245 (58%)
- Repeat customers (2-4 visits): 128 (30%)
- Loyal customers (5+ visits): 49 (12%)

TOTAL UNIQUE CUSTOMERS: 422

REVENUE BY SEGMENT:
- One-time: $11,025 (31% of revenue)
- Repeat: $15,340 (42% of revenue)
- Loyal: $9,715 (27% of revenue)

AVERAGE VALUE:
- One-time: $45 per customer
- Repeat: $120 per customer
- Loyal: $198 per customer

INSIGHTS:
✓ Loyal customers are 4.4x more valuable
⚠ 58% never return - improve follow-up
💡 Move repeat customers to loyal status
```

**Booking Frequency:**
```
You: How often do customers book?
Claude: === BOOKING FREQUENCY PATTERNS ===

AVERAGE TIME BETWEEN BOOKINGS:
- Hair services: 6 weeks
- Massage services: 4 weeks
- Fitness classes: 2x per week
- Consultations: One-time (converts to other services)

RETENTION BY SERVICE:
- Massage: 68% rebook within 8 weeks
- Hair: 72% rebook within 10 weeks
- Classes: 45% attend multiple times per month

CHURN RISK:
- 87 customers haven't booked in 90+ days
- Potential lost revenue: $3,915
- Recommendation: Send re-engagement offers
```

### 5. Service Optimization

Get recommendations to improve bookings:

**Capacity Analysis:**
```
You: Am I fully booked?
Claude: === CAPACITY UTILIZATION ANALYSIS ===

CURRENT WEEK:
- Total Available Hours: 40 hours
- Booked Hours: 28 hours
- Utilization: 70%
- Available Revenue: $450-600 (12 hours)

PEAK HOURS:
- Monday-Friday 9am-12pm: 95% booked
- Monday-Friday 1pm-5pm: 65% booked
- Weekends: 45% booked

OPPORTUNITIES:
• Weekday afternoons have availability
• Weekend slots underutilized
• Early morning (8am) slots available

RECOMMENDATIONS:
1. Offer discount for off-peak hours
2. Add weekend-only service packages
3. Create early bird appointments (7-8am)
4. Potential revenue increase: $2,400/month
```

**Pricing Optimization:**
```
You: Should I adjust my pricing?
Claude: === PRICING ANALYSIS ===

CURRENT PRICING:
Service             Price    Bookings   Revenue    Demand
Hair Cut           $65      High       $11,570    ⭐⭐⭐⭐⭐
Massage (60min)    $75      High       $10,875    ⭐⭐⭐⭐⭐
Consultation       $45      Medium     $4,005     ⭐⭐⭐
Yoga Class         $20      High       $4,680     ⭐⭐⭐⭐
Spin Class         $25      High       $4,950     ⭐⭐⭐⭐

COMPETITIVE ANALYSIS:
- Hair services: Industry avg $55-75 ✓ COMPETITIVE
- Massage: Industry avg $70-90 ✓ GOOD VALUE
- Classes: Industry avg $18-30 ✓ COMPETITIVE

RECOMMENDATIONS:
1. Hair Cut: High demand + competitive price = consider +$5 increase
2. Massage: Premium service, could increase to $80-85
3. Classes: Price is right, focus on volume
4. Add premium tiers (90-min massage at $110)

PROJECTED IMPACT: +$450/month with modest increases
```

## Use Cases

### Use Case 1: Morning Revenue Check

```
You: Good morning! How are bookings looking today?
Claude: ☀️ GOOD MORNING - Here's your day ahead:

TODAY (Feb 23):
- 8 confirmed bookings
- $905 revenue scheduled
- 70% capacity

HIGHLIGHTS:
✓ Fully booked 9am-11am
✓ Spin class at 4pm (18/20 spots filled)
⚠ 2 open slots: 12pm & 3pm

YESTERDAY:
- 9 bookings completed
- $1,015 revenue earned
- 2 no-shows (refunded)

THIS WEEK SO FAR:
- 34 bookings
- $3,127 revenue
- Tracking 5% ahead of last week!
```

### Use Case 2: End of Month Review

```
You: Show me February performance
Claude: === FEBRUARY 2026 - MONTHLY REVIEW ===

BOOKINGS:
- Total: 127 confirmed
- Completed: 118
- No-shows: 6 (4.7%)
- Canceled: 3

REVENUE:
- Total: $8,850
- vs. January: +12%
- vs. Feb 2025: +24%
- Daily average: $397

TOP SERVICES:
1. Hair: $2,665 (30% of revenue)
2. Massage: $2,250 (25%)
3. Classes: $2,955 (33%)

CUSTOMER INSIGHTS:
- New customers: 34
- Returning customers: 68%
- Average booking value: $70

CAPACITY:
- Utilization: 68%
- Peak days: Tuesday, Thursday
- Slow days: Monday, Sunday

NEXT MONTH TARGETS:
- Bookings goal: 140 (+10%)
- Revenue goal: $9,735 (+10%)
- Focus: Increase Monday/Sunday bookings
```

### Use Case 3: Service Launch Analysis

```
You: I just added a new facial service last month. How's it doing?
Claude: === NEW SERVICE PERFORMANCE: FACIAL TREATMENT ===

LAUNCH DATE: Jan 15, 2026
TIME ACTIVE: 38 days

ADOPTION:
- Total Bookings: 23
- Unique Customers: 19 (4 repeat)
- Revenue: $1,725
- Average price: $75

TRENDS:
Week 1-2: 3 bookings (slow start)
Week 3-4: 8 bookings (gaining traction)
Week 5-6: 12 bookings (strong growth!)

CUSTOMER FEEDBACK:
- 4 customers rebooked
- 2 referrals generated
- Average rating: 4.8/5 (estimated from rebookings)

BENCHMARKS vs Other Services:
- Hair Cut took 45 days to reach 23 bookings
- Massage took 30 days
- Facial: 38 days ✓ GOOD PACE

MARKETING:
- Promoted on Instagram: 12 bookings
- Email campaign: 6 bookings
- Walk-in/website: 5 bookings

RECOMMENDATIONS:
✓ Service is performing well
• Continue Instagram promotion
• Consider intro package (3 facials for $200)
• Add to loyalty program
• Target customers who book massage (complementary service)

FORECAST: 40-45 bookings in Month 2 at current trend
```

### Use Case 4: Staff Performance

```
You: Compare performance by staff member
Claude: === STAFF PERFORMANCE - February 2026 ===

SARAH (Hair Stylist):
- Bookings: 67
- Revenue: $4,355
- Avg per booking: $65
- Utilization: 82%
- Customer rating: ⭐⭐⭐⭐⭐

MIKE (Massage Therapist):
- Bookings: 51
- Revenue: $3,825
- Avg per booking: $75
- Utilization: 78%
- Customer rating: ⭐⭐⭐⭐⭐

CLASSES (Various Instructors):
- Sessions: 98
- Revenue: $2,955
- Avg per session: $30
- Capacity: 68%

INSIGHTS:
• Sarah is top revenue generator
• Mike has highest per-booking value
• Classes need marketing boost
• All staff have excellent ratings

OPPORTUNITIES:
• Cross-promote: Massage clients → Hair services
• Bundle packages: Hair + Facial combo
• Increase class capacity from 20 to 25
```

## Key Metrics Tracked

### Booking Metrics
- Total bookings (confirmed, pending, canceled)
- Booking count by service
- Booking frequency (daily, weekly, monthly)
- No-show rate
- Cancellation rate

### Financial Metrics
- Revenue by service
- Revenue by time period
- Revenue by staff member
- Average booking value
- Payment vs unpaid bookings

### Customer Metrics
- New vs returning customers
- Customer retention rate
- Lifetime value
- Booking frequency
- Churn risk

### Operational Metrics
- Capacity utilization
- Peak/off-peak hours
- Average service duration
- Staff productivity

## Integration with Other Features

### Cross-Sell with eCommerce
```
You: Do booking customers buy products?
Claude: === CROSS-SELL ANALYSIS ===

OVERLAP:
- Booking customers: 422
- Also buy products: 127 (30%)
- eCommerce-only customers: 729

OPPORTUNITY:
- 295 booking customers never bought products
- Average product order: $48
- Potential revenue: $14,160

RECOMMENDATIONS:
• Offer retail products after appointments
• Create "take-home" product bundles
• Email product recommendations to booking customers
• In-studio product display
```

### Combine with Events
```
You: Compare bookings vs events
Claude: === REVENUE COMPARISON ===

BOOKINGS: $36,080 (844 appointments)
EVENTS: $62,350 (1,247 tickets)
ECOMMERCE: $128,400 (856 orders)

TOTAL: $226,830

Bookings are 16% of total revenue!

CUSTOMER OVERLAP:
- Booking + Events: 45 customers
- Booking + eCommerce: 127 customers
- All three channels: 12 VIP customers!

VIP customers average: $425 total spend
```

## Important Notes

### Booking Status
- **CONFIRMED** - Booking is scheduled and confirmed
- **PENDING** - Awaiting confirmation or payment
- **CANCELED** - Booking was canceled
- **COMPLETED** - Service was provided

### Payment Timing
- Some services require upfront payment
- Others allow "pay at appointment"
- Always filter by `payment.status == "PAID"` for revenue

### Service Types
- **APPOINTMENT** - One-on-one (massage, consultation)
- **CLASS** - Group sessions (yoga, spin)
- **COURSE** - Multi-session programs

### Time Zones
- All times in API are UTC
- Convert to business local time for reports
- Consider customer time zones for reminders

## Tips for Success

1. **Optimize Schedule** - Identify and fill slow periods
2. **Reduce No-Shows** - Send automated reminders
3. **Encourage Rebooking** - Book next appointment before leaving
4. **Package Deals** - Bundle services for higher value
5. **Off-Peak Discounts** - Fill slow hours
6. **Loyalty Program** - Reward repeat customers
7. **Cross-Sell** - Recommend related services

## Command Patterns

The command recognizes natural language:

```
"show my bookings"
"bookings revenue"
"today's schedule"
"which service is most popular"
"repeat customers"
"booking calendar"
"capacity utilization"
"compare services"
```

## Skills Activated

This command uses:
- `bookings-management` - Core Bookings API patterns
- `analytics-insights` - Business metrics calculations
- `wix-api-core` - API authentication

## API Permissions Required

Your Wix API key needs:
- ✅ Read Bookings
- ✅ Read Services
- ✅ Read Availability

## Related Commands

- `/wix:events` - Manage ticketed events
- `/wix:revenue-report` - Cross-channel revenue
- `/wix:analytics` - Full business intelligence
- `/wix:customers` - Customer behavior analysis

---

**Pro Tip:** Run `/wix:bookings` daily to monitor your schedule and identify revenue opportunities!
