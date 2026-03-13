# How the Wix Business Manager Plugin Works

## Architecture Overview

The plugin uses a **three-layer architecture** to manage Wix business data through natural conversation with Claude.

---

## 🎯 Layer 1: Commands (User Interface)

**What they are:** Commands are markdown files that define what users can ask for in natural language.

**How they work:**

* Each command (like `/wix:events` or `/wix:analytics`) is a markdown document
* Contains descriptions of capabilities, use cases, and example conversations
* Acts as instructions that Claude reads to understand user intent
* References which skills to use for technical implementation
* No executable code - just documentation that guides Claude's responses

**Example:** When you say "show me my events," Claude reads the `events.md` command file to understand what data you need, which skills to consult, and how to present it.

---

## 📚 Layer 2: Skills (API Knowledge Base)

**What they are:** Skills are markdown files containing expert knowledge about Wix APIs and business logic.

**How they work:**

* Document complete API patterns with curl command templates
* Include authentication headers, endpoint URLs, request/response formats
* Contain business logic formulas (like CLV calculations, margin math)
* Provide analysis patterns (ABC inventory, conversion funnels)
* Are standalone - they don't reference commands or other skills

**Example:** The `events-management` skill contains curl patterns like:

* "To get all events, call this endpoint with these headers"
* "To calculate net revenue, subtract 2.5% Wix fees from gross"
* "To track ticket sales, query orders with these filters"

Claude reads these patterns and constructs the actual API calls dynamically.

---

## 🔧 Layer 3: JavaScript Library (API Execution - Optional)

**What it is:** Helper JavaScript files that handle authentication and API communication.

**How it works:**

* `wix-api.js` - Manages API keys, site IDs, authentication
* `config-validator.js` - Validates configuration before making calls
* Provides reusable functions for common operations
* Handles error responses and retries

**Important:** The JS files are optional helpers. Claude can make API calls directly using curl commands from the skills, or use the JS library for convenience.

**Example:** Instead of Claude constructing a curl command with headers every time, it can call `wixApi.getEvents()` which handles authentication automatically.

---

## 🔄 How They Work Together

### User Request Flow:

1. **User says:** "Show me my events revenue"

2. **Commands layer:** Claude reads `commands/events.md` and understands:
   - User wants event revenue data
   - Should show gross and net revenue
   - Format should include ticket counts
   - Which skills to consult: `events-management`, `analytics-insights`, `wix-api-core`

3. **Skills layer:** Claude reads the referenced skills and finds:
   - From `events-management`: API endpoint `POST /events/v3/events/query`
   - From `wix-api-core`: Authentication pattern `Authorization: ${API_KEY}`
   - From `analytics-insights`: Revenue calculation `Net = Gross - (Gross × 0.025)`

4. **Execution:** Claude either:
   - **Option A:** Constructs curl command from skill patterns
   - **Option B:** Uses JS library functions if available

5. **Response:** Claude formats the data according to command guidelines and presents it naturally

---

## 🎨 Why This Design?

### Pure Markdown Approach:

* **Transparent:** All logic visible in readable markdown
* **Flexible:** Claude can adapt patterns to different scenarios
* **No dependencies:** Works without complex runtime environments
* **Easy to modify:** Change API patterns by editing markdown

### Commands Reference Skills:

* Commands define **what** users want (business goals)
* Skills define **how** to get it (technical implementation)
* Commands orchestrate which skills to use together
* Separation of concerns: UX vs. technical details

### JS Library as Optional Helper:

* Simplifies repetitive tasks (auth, config)
* Provides error handling and validation
* Not required - Claude can work purely from markdown patterns
* Useful for complex operations or performance optimization

---

## 📊 Example: Calculating Customer Lifetime Value

**Command layer** (`analytics.md`):
* "User wants to see CLV"
* "Use: analytics-insights skill, wix-api-core skill"
* "Show segmentation: one-time, repeat, loyal"
* "Format with clear dollar amounts"

**Skills layer** (`analytics-insights/skill.md`):
* Query orders API for all paid orders
* Group by customer email
* Calculate: `CLV = Sum of all order totals / Customer`
* Formula for segments: `One-time = 1 order, Repeat = 2-4, Loyal = 5+`

**Execution:**
* Claude uses the curl pattern from skills to fetch orders
* Applies the CLV formula from skills
* Formats according to command specifications
* Returns: "Your average CLV is $147. Loyal customers are worth $528..."

---

## 🎯 Key Insight

The plugin is essentially a **knowledge base** that teaches Claude:

* What business questions users ask **(Commands)**
* How to answer them using Wix APIs **(Skills)**
* Helper tools for common operations **(JS Library)**

Claude reads and interprets these patterns in real-time, constructing appropriate API calls and calculations dynamically based on the conversation context.

**It's like giving Claude a manual on how to be a Wix business analyst.**

---

**Version:** 1.1.0
**Last Updated:** 2026-02-24
