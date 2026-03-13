# Plugin Architecture Guide

**Wix Business Manager v1.1.0**

This document explains how the plugin works and how its components interact.

---

## 🏗️ Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         USER INTERACTION                │
│   "Show me my events revenue"           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         LAYER 1: COMMANDS               │
│   (User Intent & Presentation)          │
│                                         │
│   • What users can ask for              │
│   • Response formatting                 │
│   • Example conversations               │
│   • References skills ──────┐           │
└─────────────────────────────│───────────┘
                              │
                              ▼
┌─────────────────────────────────────────┐
│         LAYER 2: SKILLS                 │
│   (Technical Knowledge Base)            │
│                                         │
│   • API endpoint patterns               │
│   • Curl command templates              │
│   • Authentication headers              │
│   • Business logic formulas             │
│   • Response structures                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      LAYER 3: EXECUTION (Optional)      │
│   (Helper Library - JS)                 │
│                                         │
│   • Authentication management           │
│   • Configuration validation            │
│   • Reusable API functions              │
└─────────────────────────────────────────┘
```

---

## 📋 Layer 1: Commands (User Interface Layer)

### What Commands Are

Commands are **markdown documentation files** that define what users can do with the plugin.

### Location
```
commands/
  ├── events.md
  ├── bookings.md
  ├── analytics.md
  └── ... (13 total)
```

### What Commands Contain

1. **Purpose Statement**
   - What this command does
   - When to use it

2. **Available Operations**
   - List of capabilities
   - Example conversations

3. **Use Cases**
   - Real-world scenarios
   - Step-by-step examples

4. **Skills Reference** ⭐ KEY SECTION
   ```markdown
   ## Skills Activated

   This command uses:
   - `events-management` - Core Events API patterns
   - `analytics-insights` - Business metrics calculations
   - `wix-api-core` - API authentication
   ```

5. **Response Formatting**
   - How to present data
   - What metrics to highlight

### How Commands Work

Commands are **instructions for Claude**:
- Claude reads the command file when user invokes it
- Understands what the user wants
- Sees which skills to consult
- Knows how to format the response

**Important:** Commands contain **NO executable code** - they're pure documentation.

---

## 📚 Layer 2: Skills (Knowledge Base Layer)

### What Skills Are

Skills are **technical reference manuals** containing API patterns and business logic.

### Location
```
skills/
  ├── events-management/
  │   └── skill.md
  ├── bookings-management/
  │   └── skill.md
  ├── analytics-insights/
  │   └── skill.md
  ├── wix-api-core/
  │   └── skill.md
  └── ... (12 total)
```

### What Skills Contain

1. **API Endpoint Patterns**
   ```markdown
   ## Query Events

   curl -X POST "https://www.wixapis.com/events/v3/events/query" \
     -H "Authorization: ${API_KEY}" \
     -H "wix-site-id: ${SITE_ID}" \
     -H "Content-Type: application/json" \
     -d '{"query": {"paging": {"limit": 100}}}'
   ```

2. **Authentication Headers**
   - Required headers for each API
   - How to pass credentials

3. **Request/Response Structures**
   - JSON schemas
   - Field descriptions

4. **Business Logic Formulas**
   ```markdown
   ## Calculate Net Revenue
   Net Revenue = Gross Revenue - (Gross Revenue × 0.025)
   (Wix charges 2.5% service fee on event tickets)
   ```

5. **Filtering & Sorting Patterns**
   - How to filter by date
   - How to sort results
   - Pagination patterns

6. **Common Operations**
   - Bulk operations
   - Error handling
   - Rate limiting

### How Skills Work

Skills are **reference libraries**:
- Claude reads skills when commands reference them
- Finds the relevant API patterns
- Constructs actual API calls dynamically
- Applies business logic formulas

**Important:**
- Skills are **standalone** - they don't reference commands
- Skills can be **reused** by multiple commands
- Skills contain **NO code** - just curl patterns and formulas

---

## 🔗 How Commands and Skills Connect

### Commands Reference Skills (One-Way Relationship)

```
Command File:                    Skill File:
┌──────────────┐                ┌──────────────┐
│  events.md   │───references──▶│events-mgmt/  │
│              │                │  skill.md    │
│ "Uses:       │                │              │
│  • events-   │                │ API patterns │
│    management│                │ Curl commands│
│              │                │ Formulas     │
└──────────────┘                └──────────────┘
```

**Skills NEVER reference commands** - they're the foundation layer.

### Example: Events Revenue Request

**User says:** "Show me events revenue"

**Step 1:** Claude identifies command
```
Command: /wix:events
```

**Step 2:** Claude reads command file
```markdown
# commands/events.md

## Skills Activated
- events-management
- analytics-insights
- wix-api-core
```

**Step 3:** Claude reads the referenced skills
```
1. skills/events-management/skill.md
   → How to query events API
   → How to query event orders API

2. skills/analytics-insights/skill.md
   → How to calculate revenue metrics
   → Revenue formulas (gross vs net)

3. skills/wix-api-core/skill.md
   → Authentication patterns
   → Header requirements
```

**Step 4:** Claude executes
- Constructs curl command from skill patterns
- Makes API call to get events
- Makes API call to get event orders
- Applies revenue formulas from analytics skill
- Formats response per command guidelines

---

## 🔄 Complete Execution Flow

```
1. USER INPUT
   "What's my events revenue?"

   ↓

2. COMMAND IDENTIFICATION
   Claude recognizes: /wix:events intent
   Reads: commands/events.md

   ↓

3. SKILL LOOKUP
   Command says: "Use these skills:"
   - events-management
   - analytics-insights
   - wix-api-core

   ↓

4. KNOWLEDGE SYNTHESIS
   Claude reads all referenced skills:

   From events-management:
   ✓ API endpoint for events
   ✓ API endpoint for orders
   ✓ Filter patterns

   From analytics-insights:
   ✓ Revenue calculation formulas
   ✓ Metric aggregation patterns

   From wix-api-core:
   ✓ Authentication headers
   ✓ Pagination logic

   ↓

5. API EXECUTION
   Claude constructs curl commands:

   Call 1: Get all events
   Call 2: Get event orders
   Call 3: Calculate revenue

   ↓

6. RESPONSE FORMATTING
   Command specifies format:
   - Show gross vs net revenue
   - Include ticket counts
   - Highlight top events

   ↓

7. USER RESPONSE
   "Your events revenue: $62,350 gross,
    $60,791 net (after 2.5% fees)"
```

---

## 🎯 Skill Reusability

One skill can be used by multiple commands:

```
analytics-insights skill
         ▲
         │
         │ Referenced by:
         │
    ┌────┼────┬────────┬──────────┐
    │    │    │        │          │
/wix:   /wix: /wix:   /wix:    /wix:
events  bookings analytics revenue customers
```

**Example:**
- `analytics-insights` skill contains CLV formula
- Used by: `/wix:analytics`, `/wix:customers`, `/wix:bookings`, `/wix:events`
- The skill doesn't know which command is using it
- Each command formats the CLV data differently for their context

---

## 🔧 Layer 3: JavaScript Library (Optional Helpers)

### What It Is

Helper JavaScript files for common operations.

### Location
```
lib/
  ├── wix-api.js            (API call helpers)
  └── config-validator.js   (Configuration validation)
```

### What It Provides

**wix-api.js:**
- Authentication management
- API key storage and retrieval
- Site ID management
- Reusable API call functions

**config-validator.js:**
- Validate API key format
- Check site configuration
- Verify permissions

### When It's Used

The JS library is **optional**. Claude can work in two modes:

**Mode 1: Pure Markdown (Default)**
- Claude reads curl patterns from skills
- Constructs API calls dynamically
- No JS execution needed

**Mode 2: With JS Helpers**
- Claude calls JS functions for common operations
- Faster for repeated operations
- Better error handling

### Example Comparison

**Without JS Library:**
```
Claude reads skill:
"To get events, run this curl command..."

Claude constructs:
curl -X POST "https://..." -H "Authorization: ${API_KEY}"...
```

**With JS Library:**
```
Claude reads skill:
"To get events, use wixApi.getEvents()"

Claude calls:
wixApi.getEvents()
  → JS handles auth, headers, error handling automatically
```

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────┐
│  USER: "Show me events with over 100 tickets"   │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  COMMAND: events.md                                │
│  • Understands: User wants filtered event list    │
│  • References: events-management, wix-api-core     │
│  • Format: Show as table with ticket counts       │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  SKILL: events-management                          │
│  • Provides: Query events API pattern              │
│  • Provides: Filter syntax for ticket counts      │
│  • Provides: Response structure                    │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  SKILL: wix-api-core                               │
│  • Provides: Authentication headers                │
│  • Provides: Pagination pattern                    │
│  • Provides: Error handling                        │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  EXECUTION                                         │
│  Claude constructs:                                │
│  curl -X POST ".../events/query"                   │
│    -H "Authorization: ${API_KEY}"                  │
│    -d '{"filter": {"ticketsSold": {"$gt": 100}}}'│
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  RESPONSE                                          │
│  "Found 3 events with 100+ tickets:               │
│   • Summer Festival - 245 tickets                  │
│   • Winter Gala - 500 tickets                     │
│   • Spring Concert - 156 tickets"                 │
└────────────────────────────────────────────────────┘
```

---

## 🔑 Key Principles

### 1. Separation of Concerns

- **Commands** = User experience layer (what & how to present)
- **Skills** = Technical layer (how to fetch & calculate)
- **JS Library** = Helper layer (optional optimizations)

### 2. One-Way Dependencies

```
Commands ──reference──▶ Skills
       (one-way arrow)

Skills ✗ DO NOT reference Commands
```

### 3. Reusability

- One skill can serve many commands
- Skills are modular and independent
- Commands can mix multiple skills

### 4. Transparency

- All logic visible in markdown
- No hidden code or black boxes
- Easy to understand and modify

### 5. Flexibility

- Claude interprets patterns dynamically
- Can adapt to different scenarios
- Not rigidly programmed

### 6. Declarative Design

- Commands declare intent, not implementation
- Skills declare patterns, not procedures
- Claude synthesizes both into dynamic behavior

---

## 📝 How to Extend the Plugin

### Adding a New Feature

**Step 1: Create or Update a Skill**
```markdown
# skills/new-feature/skill.md

## API Endpoint
POST https://www.wixapis.com/new-api/v1/...

## Request Pattern
curl -X POST "..." -H "Authorization: ${API_KEY}"...

## Response Structure
{...}

## Business Logic
Formula for calculating X = Y + Z
```

**Step 2: Create or Update a Command**
```markdown
# commands/new-command.md

## Skills Activated
- new-feature (main functionality)
- analytics-insights (for metrics)
- wix-api-core (for auth)

## Available Operations
1. Operation A
2. Operation B

## Example Conversations
User: "Do X"
Claude: [Uses new-feature skill to...]
```

**Step 3: Test**
- Invoke the command
- Claude reads command + referenced skills
- Executes API patterns
- Returns formatted results

---

## ❓ Common Questions

### Q: Can skills call other skills?
**A:** No. Skills are standalone. Commands orchestrate which skills to use together.

### Q: Why separate commands and skills?
**A:**
- **Commands** change based on UX (how to present data)
- **Skills** change based on APIs (how Wix works)
- Separating them makes both easier to maintain

### Q: When should I use the JS library?
**A:**
- For repeated operations
- When you need better error handling
- For complex authentication flows
- It's optional - pure markdown works too

### Q: Can one command use multiple skills?
**A:** Yes! Most commands use 3-4 skills. Example:
```
/wix:analytics uses:
- analytics-insights (calculations)
- events-management (event data)
- bookings-management (booking data)
- wix-api-core (auth)
```

### Q: How does Claude know which command to use?
**A:** Claude reads all command files and matches user intent to the best command based on the purpose statements and example conversations.

---

## 📚 File Structure Summary

```
wix-ecom-cowork/
│
├── commands/                    ← Layer 1: User Interface
│   ├── events.md               (References skills)
│   ├── bookings.md             (References skills)
│   ├── analytics.md            (References skills)
│   └── ...
│
├── skills/                      ← Layer 2: Knowledge Base
│   ├── events-management/      (Standalone API patterns)
│   ├── bookings-management/    (Standalone API patterns)
│   ├── analytics-insights/     (Standalone formulas)
│   └── wix-api-core/          (Standalone auth patterns)
│
├── lib/                         ← Layer 3: Optional Helpers
│   ├── wix-api.js              (Helper functions)
│   └── config-validator.js     (Validation)
│
├── README.md                    ← User documentation
├── FEATURES.md                  ← Feature inventory
└── ARCHITECTURE.md              ← This file
```

---

## 🎓 Summary

**The plugin is a knowledge base that teaches Claude:**

1. **Commands** tell Claude what users want and which skills to consult
2. **Skills** teach Claude how to interact with Wix APIs and calculate business metrics
3. **JS Library** provides optional helper functions for common operations

**Claude acts as an interpreter:**
- Reads the documentation (commands + skills)
- Synthesizes the knowledge
- Constructs API calls dynamically
- Formats responses naturally

**It's like giving Claude a comprehensive manual on being a Wix business analyst.**

---

**Version:** 1.1.0
**Last Updated:** 2026-02-24
