# Events Management Command

**Invoke with:** `/wix:events`

## Purpose

Manage Wix Events, track ticket sales, calculate revenue, and analyze event performance across your site.

## What This Command Does

When invoked, this command provides comprehensive event management capabilities:

1. **List All Events** - View all upcoming and past events with status
2. **Event Performance Report** - Detailed metrics for specific events
3. **Revenue Summary** - Total ticket sales and revenue across all events
4. **Top Performing Events** - Identify your most successful events
5. **Upcoming Events** - See what's scheduled and expected revenue

## Available Operations

### 1. List All Events

Shows all events with key details:
- Event title and status (SCHEDULED, STARTED, ENDED, CANCELED)
- Date and time
- Registration type (TICKETED vs RSVP)
- Guest limit and current registrations

**Example conversation:**
```
You: /wix:events
Claude: I'll show you all your events...

UPCOMING EVENTS (3):
• Summer Music Festival - Jul 15, 2026 - TICKETED - 245/500 tickets
• Yoga Workshop - Mar 5, 2026 - TICKETED - 18/30 tickets
• Community Meetup - Mar 10, 2026 - RSVP - 45 attendees

PAST EVENTS (2):
• Winter Gala - Jan 20, 2026 - ENDED - 500/500 tickets sold
• Networking Night - Feb 1, 2026 - ENDED - 85 attendees
```

### 2. Event Performance Report

Get detailed analytics for a specific event:
- Tickets sold vs capacity
- Gross and net revenue (after 2.5% Wix fee)
- Order conversion rate
- Average ticket price
- Check-in status

**Example conversation:**
```
You: Show me details for Summer Music Festival
Claude: [Event: Summer Music Festival]

TICKETS & CAPACITY:
- Sold: 245 tickets
- Capacity: 500 (49% full)
- Status: On sale

REVENUE:
- Gross Revenue: $12,250.00
- Service Fees (2.5%): $306.25
- Net Revenue: $11,943.75

ORDERS:
- Total Orders: 89
- Paid Orders: 87
- Conversion Rate: 97.8%
- Average Order: 2.8 tickets

PRICING:
- Average Ticket Price: $50.00

GUESTS:
- Checked In: 0
- Not Checked In: 245
```

### 3. Total Events Revenue

Calculate total revenue across all events:
- Total tickets sold
- Total gross and net revenue
- Number of events
- Average revenue per event

**Example conversation:**
```
You: What's my total events revenue?
Claude: === TOTAL EVENTS REVENUE ===

ALL TICKETED EVENTS:
- Total Events: 5
- Total Tickets Sold: 1,247
- Gross Revenue: $62,350.00
- Net Revenue (after fees): $60,791.25
- Service Fees: $1,558.75

PERFORMANCE:
- Average tickets per event: 249
- Average revenue per event: $12,158.25
- Top event: Winter Gala ($25,000)
```

### 4. Upcoming Events Dashboard

See what's scheduled and projected revenue:
- Events in the next 30/60/90 days
- Expected revenue from confirmed orders
- Capacity utilization
- Recommendations for slow sellers

**Example conversation:**
```
You: Show upcoming events
Claude: === UPCOMING EVENTS (Next 30 Days) ===

1. Yoga Workshop - Mar 5, 2026
   - Tickets: 18/30 (60% capacity)
   - Expected Revenue: $540
   - Status: ⚠ Low sales - consider promotion

2. Community Meetup - Mar 10, 2026
   - RSVP: 45 guests
   - Status: ✓ Good attendance

3. Spring Concert - Mar 25, 2026
   - Tickets: 156/200 (78% capacity)
   - Expected Revenue: $4,680
   - Status: ✓ Strong sales

TOTAL EXPECTED REVENUE: $5,220
```

### 5. Create Event Report

Generate a comprehensive report for business planning:
- Sales trends over time
- Best performing ticket types
- Geographic distribution of attendees
- Marketing attribution (if UTM codes used)

## Use Cases

### Use Case 1: Pre-Event Planning

```
You: I'm planning events for next quarter. Show me my top performing events.
Claude: [Analyzes all past events]

TOP 5 EVENTS BY REVENUE:
1. Winter Gala - $25,000 (500 tickets)
2. Summer Festival - $18,500 (370 tickets)
3. Food & Wine Night - $12,800 (160 tickets)
...

INSIGHTS:
• Gala events have highest revenue per attendee ($50)
• Festival events sell most tickets (avg 350)
• Food events have best profit margin (lower costs)

RECOMMENDATIONS:
• Schedule 2 gala events next quarter
• Consider early bird pricing for festivals
• Add more food & wine themed events
```

### Use Case 2: Event Day Operations

```
You: Show me who's checked in for Summer Music Festival
Claude: [Event: Summer Music Festival - Live Check-in Status]

ATTENDANCE:
- Total Tickets: 245
- Checked In: 187 (76%)
- Not Checked In: 58

NO-SHOWS:
- Expected no-show rate: ~10% (25 guests)
- Current no-shows: 58 guests

REAL-TIME STATUS:
✓ 187 guests enjoying the event
⏰ Still expecting 58 more guests
```

### Use Case 3: Post-Event Analysis

```
You: Analyze the results from Winter Gala
Claude: === WINTER GALA - POST-EVENT ANALYSIS ===

TICKETS:
- Capacity: 500
- Sold: 500 (100% sellout!)
- Revenue: $25,000

EFFICIENCY:
- Sold out in: 12 days
- Average order size: 2.3 tickets
- Peak sales: First 3 days (65% of tickets)

ATTENDEES:
- Checked in: 487 (97.4% attendance)
- No-shows: 13 (2.6%)

SUCCESS FACTORS:
✓ Early bird pricing drove initial sales
✓ Group discounts increased order size
✓ Email campaigns converted well

RECOMMENDATIONS:
- Replicate this format for future galas
- Consider raising capacity to 600
- Implement waitlist for next event
```

### Use Case 4: Revenue Forecasting

```
You: What's my expected events revenue for next month?
Claude: === EVENTS REVENUE FORECAST - March 2026 ===

CONFIRMED EVENTS (3):
1. Yoga Workshop (Mar 5) - $540 confirmed
2. Community Meetup (Mar 10) - RSVP only
3. Spring Concert (Mar 25) - $4,680 confirmed

TOTAL CONFIRMED REVENUE: $5,220

PROJECTED SALES (based on trends):
- Yoga Workshop may reach 25/30 capacity: +$210
- Spring Concert may sell out: +$1,320

OPTIMISTIC FORECAST: $6,750

RECOMMENDATIONS:
• Create promotional campaign for Yoga Workshop
• Add late registration fee to Community Meetup
• Consider adding one more event (avg: $12k revenue)
```

## Key Metrics Tracked

### Event Metrics
- Ticket sales count
- Revenue (gross & net)
- Capacity utilization
- Sell-through rate
- Days to sell out

### Financial Metrics
- Gross revenue
- Net revenue (after Wix 2.5% fee)
- Average ticket price
- Revenue per attendee
- Service fees paid

### Customer Metrics
- Total orders
- Conversion rate (orders → paid)
- Average order size (tickets per order)
- Check-in rate
- No-show rate

### Performance Indicators
- Tickets sold per day
- Peak sales periods
- Event-to-event comparisons
- Year-over-year growth

## Integration with Other Features

### Cross-Sell with eCommerce
```
You: Do my event attendees buy products too?
Claude: [Analyzes customer overlap]

CROSS-CHANNEL CUSTOMERS:
- Event attendees: 487
- Also bought products: 156 (32%)
- Average product revenue: $45

OPPORTUNITY:
- 331 event attendees haven't shopped
- Potential revenue: $14,895
- Recommendation: Send post-event product offers
```

### Combine with Bookings
```
You: Compare events vs bookings revenue
Claude: === REVENUE COMPARISON ===

EVENTS: $62,350 (1,247 tickets)
BOOKINGS: $45,800 (612 appointments)
ECOMMERCE: $128,400 (856 orders)

TOTAL BUSINESS: $236,550

Events are 26% of total revenue!
```

## Important Notes

### Wix Service Fees
- Wix charges 2.5% per ticket sold
- This can be passed to customer or absorbed
- `netPrice` = revenue after fees
- Always report both gross and net

### Event Types
- **TICKETED** - Paid events with revenue tracking
- **RSVP** - Free events (no revenue, just headcount)
- **EXTERNAL** - Registration handled elsewhere

### Refunds
- Refunded tickets are excluded from revenue
- Track refund rates separately
- High refunds may indicate event issues

## Tips for Success

1. **Create Events Early** - Give 30+ days for sales
2. **Use Early Bird Pricing** - Drives initial momentum
3. **Set Capacity Wisely** - Sellouts create urgency
4. **Add Multiple Ticket Types** - VIP, General, Student
5. **Track Marketing** - Use UTM codes in promotional links
6. **Monitor Daily** - Check sales velocity
7. **Send Reminders** - Email campaigns boost late sales

## Command Patterns

The command recognizes natural language requests:

```
"show my events"
"events revenue"
"analyze Summer Music Festival"
"upcoming events"
"which events make the most money"
"events dashboard"
"event check-in status"
"events this month"
"compare event performance"
```

### CMS Integration for Custom Event Data

Link events with custom CMS collections like TonyRobbinsTickets:

```
You: Show me Tony Robbins ticket data from CMS
Claude: [Queries TonyRobbinsTickets collection]

CMS DATA: TonyRobbinsTickets
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• UPW - VIP: $2,995 (50 seats remaining)
• UPW - Premium: $1,495 (100 seats remaining)
• UPW - General: $495 (200 seats remaining)
• DWD - Premium: $1,495 (75 seats remaining)

Use /wix:cms to manage CMS data directly.
```

## Skills Activated

This command uses:
- `events-management` - Core Events API patterns (create, update, tickets, guests, check-ins)
- `cms-data-management` - CMS integration for custom event data (TonyRobbinsTickets)
- `analytics-insights` - Business metrics calculations
- `wix-api-core` - API authentication and pagination

## API Permissions Required

Your Wix API key needs these permissions:
- ✅ Read Events
- ✅ Read Event Orders
- ✅ Read Event Guests
- ✅ Read Data Items (CMS)
- ✅ Write Data Items (CMS)

## Related Commands

- `/wix:cms` - CMS data collections management
- `/wix:pipeline` - Cart-to-customer pipeline kanban
- `/wix:bookings` - Manage appointments and services
- `/wix:revenue-report` - Cross-channel revenue analysis
- `/wix:analytics` - Full business intelligence dashboard
- `/wix:customers` - Analyze event attendee behavior

---

**Pro Tip:** Run `/wix:events` weekly to track sales velocity and identify events that need promotional support!
