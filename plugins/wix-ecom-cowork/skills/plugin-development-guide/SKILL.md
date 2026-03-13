# Plugin Development Guide - Building Wix eCommerce Commands & Skills

## Overview

Comprehensive guide for AI developers (Claude Code, Cursor, etc.) to systematically discover Wix APIs and build new commands/skills for the wix-ecom-cowork plugin using Playwright automation, API documentation, and user guidance.

## Methodology: Three-Source Approach

### Source 1: Playwright UI Automation (Discover Real APIs)

**Purpose**: Capture actual API calls made by Wix Business Manager

**Tools**: `/playwright/` directory with automation scripts

**Process**:

1. Navigate to target Wix page (e.g., products, orders, tax settings)
2. Interact with UI elements (buttons, forms, tabs)
3. Capture all network requests
4. Filter for Wix API calls
5. Extract endpoints, methods, request/response structures
6. Save to JSON for analysis

**Example**:

```bash
cd playwright
npm run capture:product    # Discover product APIs
npm run capture:category   # Discover category APIs
npm run capture:order      # Discover order APIs
npm run capture:tax        # Discover tax APIs
```

**Output**:
- `output/{workflow}-mapping.json` - UI actions → API correlations
- `output/{workflow}-apis.json` - All captured API calls
- `screenshots/` - Visual proof of interactions

### Source 2: Official Wix API Documentation

**Purpose**: Understand complete API specifications

**Tools**: WebFetch tool to retrieve docs

**Process**:
1. Find relevant API docs at https://dev.wix.com/docs/api-reference/
2. Extract all endpoints, methods, parameters
3. Note request/response structures
4. Identify authentication requirements
5. Document rate limits and best practices

**Example**:
```
WebFetch: https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/extensions/tax/introduction
→ Extract: Tax Groups, Tax Regions, Tax Calculations endpoints
```

### Source 3: User Guidance & Business Logic

**Purpose**: Understand business requirements and workflows

**Sources**:
- User requests ("I want to do X")
- Business rules ("Use segments first, labels second")
- Wix recommendations ("Use /build API for discounts")
- Real-world examples (actual payloads, workflows)

**Example**:
User provides: "Campaign payload looks like {campaignId, emailDistributionOptions...}"
→ Build skill around this structure

## Discovery Process (Step-by-Step)

### Phase 1: Define Scope

**Questions to answer**:
1. What Wix feature are we building? (e.g., Tax Management, Email Campaigns)
2. What user tasks should be supported? (e.g., create, query, update, delete)
3. What Wix UI pages are relevant? (URLs)
4. What official API docs exist? (Links)
5. What business logic applies? (User guidance)

**Example**:
```
Feature: Tax Management
Tasks: Query tax groups, create regions, assign to products
UI: https://manage.wix.com/.../ecom-platform/tax
Docs: https://dev.wix.com/docs/.../tax/introduction
Logic: Use /billing/v1/ endpoints (not /tax-groups/v1/)
```

### Phase 2: Discover APIs

#### Step 1: Create Playwright Capture Script

Template: `playwright/scripts/capture-{feature}.ts`

```typescript
// Key components:
- Load auth from /Users/itayhe/.yoshi/auth.json
- Navigate to Wix page
- Find and interact with elements
- Capture API calls with request/response
- Save to output/ directory
```

**Add to package.json**:
```json
{
  "scripts": {
    "capture:{feature}": "ts-node scripts/capture-{feature}.ts"
  }
}
```

#### Step 2: Run Automation

```bash
npm run capture:{feature}
```

**Watch for**:
- Browser opens (headless: false)
- Elements are clicked
- APIs are captured
- Screenshots are saved

#### Step 3: Analyze Captured APIs

```bash
# Check what was captured
cat output/{feature}-apis.json | jq '[.[] | .endpoint] | unique'

# Find feature-specific APIs
cat output/{feature}-apis.json | jq '[.[] | select(.endpoint | contains("tax") or contains("segment"))]'
```

#### Step 4: Fetch Official Documentation

```bash
# Use WebFetch in Claude Code
WebFetch: https://dev.wix.com/docs/api-reference/.../[feature]
```

#### Step 5: Compare Sources

**Create comparison**:
- APIs discovered in UI vs documented APIs
- Endpoint paths (UI might use different paths than docs!)
- Request/response structures
- Required vs optional fields

**Example Discovery**:
```
Docs say: GET /tax-groups/v1/tax-groups
UI uses:  POST /billing/v1/tax-groups/query

→ Use /billing/v1/ (what UI actually uses!)
```

### Phase 3: Build Skills

#### Skill Structure

**Location**: `skills/{feature-name}/SKILL.md`

**Template**:
```markdown
# {Feature Name} - {Description}

## Overview
[What this skill covers]

## Configuration
- App ID, API Key, Site ID

## {Operation Name}

**Endpoint**: METHOD https://www.wixapis.com/path

**API Call**:
```bash
curl -X METHOD "https://www.wixapis.com/path" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Response**:
```json
{...}
```

**Use Cases**:
- When to use this endpoint
- What it returns
- How to process the data

## Best Practices
[Recommendations, gotchas, tips]
```

**Critical Rules for Skills**:
1. ✅ Use `${API_KEY}` and `${SITE_ID}` variables (not hardcoded)
2. ✅ Show curl commands (Claude will execute them)
3. ✅ Include jq parsing examples
4. ✅ Document response structures
5. ✅ Add use cases and examples
6. ❌ NO hardcoded business values (discounts, amounts, thresholds)
7. ❌ NO "I recommend X" - only API-driven or user-specified
8. ✅ Use variables: `${DISCOUNT_AMOUNT}`, `${USER_THRESHOLD}`, etc.

### Phase 4: Build Commands

#### Command Structure

**Location**: `commands/{feature-name}.md`

**Template**:
```markdown
# {Feature Name} - {User-Friendly Description}

[Intro paragraph for non-technical users]

## Command Pattern

```
Show me [feature]
Create [thing]
Help me [task]
```

## Purpose
[What this command does in plain English]

## Skills Referenced
- skill-name-1: What it provides
- skill-name-2: What it provides

## Workflow

### Step 1: [First Action]
[bash script using skill patterns]

### Step 2: [Second Action]
[bash script]

## Output Format
[What user sees]

## Example Use Cases
1. [Real-world scenario]
2. [Another scenario]

## Related Commands
- Other relevant commands
```

**Critical Rules for Commands**:
1. ✅ User-friendly language (not technical jargon)
2. ✅ Natural language command patterns
3. ✅ Step-by-step workflows
4. ✅ Clear output format examples
5. ✅ Reference skills (one-way dependency)
6. ❌ NO hardcoded values
7. ✅ Show user confirmations
8. ✅ Include error handling

### Phase 5: Critical Checks

#### Check 1: No Hardcoded Business Values

**Search for**:
```bash
grep -r "15%" skills/ commands/
grep -r "20%" skills/ commands/
grep -r "\$100" skills/ commands/
grep -r "\$500" skills/ commands/
```

**If found**: Replace with `${VARIABLES}` or API extractions

#### Check 2: API Usage Enforced

**For discount/recommendations**:
- ✅ Must call `/recommendations/v1/recommendations/build`
- ✅ Must extract from response
- ✅ Must submit feedback with inspection_id
- ❌ NEVER manually suggest percentages

**For data-driven features**:
- ✅ Query actual data (orders, customers, products)
- ✅ Calculate from real numbers
- ❌ NEVER guess or estimate

#### Check 3: User Intent Honored

**User-specified values**:
```
User: "Create 20% off"
→ Use exactly 20%
→ Don't call recommendations API
```

**User asks for recommendation**:
```
User: "Recommend a discount"
→ MUST call recommendations API
→ NEVER manually suggest
```

#### Check 4: Correct Endpoints

**Verify**:
- Endpoint paths match what UI actually uses (not always what docs say!)
- Request structure matches captured examples
- Response parsing handles actual API structure

**Example**:
```
❌ Docs: GET /v1/sites
✅ Reality: POST /site-list/v2/sites/query

Use what works, not what docs say!
```

## Common Patterns

### Pattern 1: Query and Display

```markdown
## List {Resources}

```bash
curl -X POST "https://www.wixapis.com/{endpoint}/query" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": {"paging": {"limit": 100}}}' | jq '[.{resources}[] | {
  id,
  name,
  relevantField
}]'
```
```

### Pattern 2: AI-Powered Recommendation

```markdown
## Get AI Recommendation

**MANDATORY**: Call Wix AI API first!

```bash
recommendations=$(curl -X POST "https://www.wixapis.com/recommendations/v1/recommendations/build" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{"context": {...}}')

# Extract AI values
VALUE=$(echo "$recommendations" | jq -r '.recommendations[0].{value}')

# Use AI value (not hardcoded!)
```
```

### Pattern 3: Create with User Values

```markdown
## Create {Resource}

```bash
# Extract from user request
NAME="${USER_PROVIDED_NAME}"
AMOUNT=${USER_PROVIDED_AMOUNT}  # From "create X% off"

curl -X POST "https://www.wixapis.com/{endpoint}" \
  -H "Authorization: ${API_KEY}" \
  -H "wix-site-id: ${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d "{
  \"{resource}\": {
    \"name\": \"${NAME}\",
    \"amount\": ${AMOUNT}
  }
}"
```
```

### Pattern 4: Priority Waterfall

```markdown
## Smart Selection Logic

Priority 1: Check existing {resource}
Priority 2: Create new {resource} if needed

```bash
# Try to find existing
existing=$(curl GET .../query)

if [ -n "$existing" ]; then
  echo "✅ Using existing {resource}"
  ID=$(echo "$existing" | jq -r '.id')
else
  echo "Creating new {resource}"
  new=$(curl POST .../create)
  ID=$(echo "$new" | jq -r '.id')
fi
```
```

## File Naming Conventions

**Skills**: `skills/{feature-domain}/SKILL.md`
- `product-management/` - Product operations
- `tax-groups-comprehensive/` - Tax group CRUD
- `email-segments/` - Segment management
- `smart-discount-recommendations/` - AI recommendations

**Commands**: `commands/{feature-action}.md`
- `product-advanced.md` - Advanced product ops
- `tax-complete.md` - Complete tax management
- `email-campaign-complete.md` - Full email workflow
- `create-performance-category.md` - Performance-based categories

**Playwright Scripts**: `playwright/scripts/capture-{feature}.ts`
- `capture-product-creation.ts`
- `capture-category-flow.ts`
- `capture-tax-settings.ts`

## Testing & Verification

### Test 1: API Call Verification

```bash
# Verify API is called when user asks for recommendation
echo "TEST: Discount recommendation"

# Should call:
curl POST /recommendations/v1/recommendations/build

# Should NOT:
# - Manually suggest percentages
# - Skip API call
# - Use "educated guesses"
```

### Test 2: User Value Extraction

```bash
# Verify user-specified values are honored
User: "Create 20% off Electronics"

# Extract:
DISCOUNT=20  # From "20% off"
CATEGORY="Electronics"  # From user

# Verify used exactly, not changed
```

### Test 3: No Hardcoding

```bash
# Search for hardcoded values
grep -r "15%" commands/ skills/
grep -r "\$100" commands/ skills/

# All findings should be:
# - In API response examples (OK)
# - As ${VARIABLES} (OK)
# - NOT as actual suggestions (BAD)
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Manual Recommendations

```
WRONG:
User: "Recommend discount"
Claude: "I recommend 15% off"

RIGHT:
User: "Recommend discount"
Claude: [Calls API] "Wix AI recommends: 18% off"
```

### ❌ Mistake 2: Hardcoded Thresholds

```
WRONG:
curl query -d '{"filter": "{\"totalSpent\": {\"$gte\": 500}}"}'

RIGHT:
USER_THRESHOLD=${USER_THRESHOLD:-100}  # From user intent
curl query -d "{\"filter\": \"{\\\"totalSpent\\\": {\\\"\\$gte\\\": ${USER_THRESHOLD}}}\"}"
```

### ❌ Mistake 3: Skipping API Documentation

```
WRONG:
Assume endpoint is /tax-groups/v1/tax-groups

RIGHT:
1. Check Playwright capture → Found /billing/v1/tax-groups/query
2. Use what UI actually uses!
```

### ❌ Mistake 4: Wrong Endpoint Paths

```
WRONG (from docs):
GET /v1/sites → Returns 404

RIGHT (from Playwright):
POST /site-list/v2/sites/query → Works!
```

### ❌ Mistake 5: Incorrect Field Names

```
WRONG (from docs):
{"price": 29.99}  → Returns "Expected an object"

RIGHT (from testing):
{"priceData": {"price": 29.99}}  → Works!
```

## Knowledge Captured in This Session

### Critical API Discoveries

| Feature | Documented Path | Actual Path (from UI) | Use This |
|---------|----------------|----------------------|----------|
| Sites List | GET /v1/sites | POST /site-list/v2/sites/query | ✅ Actual |
| Tax Groups | GET /tax-groups/v1/... | POST /billing/v1/tax-groups/query | ✅ Actual |
| Product Price | "price": number | "priceData": {object} | ✅ Actual |
| Segments | Not in docs | POST /_api/contacts-segments-app/v1/segments/query | ✅ Actual |
| Recommendations | Not in public docs | POST /recommendations/v1/recommendations/build | ✅ Actual |

### Wix AI APIs (Use When Available)

**Always check for Wix AI first**:
- `/recommendations/v1/recommendations/build` - Discount recommendations
- Future: Product recommendations, pricing optimization, etc.

**Pattern**:
1. Call AI API
2. Get recommendation with `inspection_id`
3. Show to user
4. Create resource with AI values
5. Submit feedback with `inspection_id`

**NEVER**:
- Skip AI API when user asks for recommendations
- Manually suggest values
- Use "general strategy" or "educated guesses"

### Bug Fixes Applied

| Issue | Wrong | Right |
|-------|-------|-------|
| Sites endpoint | GET /v1/sites (404) | POST /site-list/v2/sites/query |
| Product price | `"price": 29.99` | `"priceData": {"price": 29.99}` |
| Setup guide | Visit wix.to/Ri8ggW4 | Create API key at manage.wix.com/account/api-keys |
| Discount amounts | Hardcoded 15%, 20% | From Recommendations API or user |

## Playwright Automation Examples

### Example 1: Product Creation Flow

```typescript
// Navigate to products page
await page.goto('.../wix-stores/products');

// Click "+ New Product"
await page.locator('[data-hook="newProductBtn"]').click();

// Wait for form
await page.waitForTimeout(3000);

// Fill fields dynamically
const inputs = await page.locator('input:visible').all();
for (const input of inputs) {
  await input.fill('test value');
  // Capture APIs triggered
}
```

### Example 2: Category Management

```typescript
// Navigate to categories
await page.goto('.../store/categories/list');

// Click "+ New Category"
// Fill category name
// Click "+ Add Products"
// Explore product selection
// Capture all APIs
```

### Example 3: Tax Settings

```typescript
// Navigate to tax settings
await page.goto('.../ecom-platform/tax');

// Explore tabs (Groups, Regions, Settings)
// Click buttons
// Capture tax-related APIs
```

## Command/Skill Architecture

### Separation of Concerns

**Commands** (User-facing):
- Natural language patterns
- Business workflows
- User-friendly output
- References skills

**Skills** (Technical):
- API patterns (curl commands)
- Request/response structures
- Error handling
- Reusable across commands

**One-Way Dependency**:
```
Commands → Reference → Skills
     (one-way)
Skills ✗ DO NOT reference Commands
```

### Example

**Command**: `create-campaign.md`
```markdown
## Skills Referenced
- smart-discount-recommendations
- discount-strategy
- email-segments
```

**Skill**: `smart-discount-recommendations/SKILL.md`
```markdown
# Contains only technical API patterns
# Does NOT reference any commands
```

## Versioning Rules

**Every change requires new version + zip**:

**Minor (2.3.x)**:
- Bug fixes
- Documentation updates
- Small refinements
- Command text improvements

**Major (2.x.0)**:
- New commands
- New skills
- New features
- Breaking changes

**Process**:
1. Make changes to files
2. Update version in `.claude-plugin/plugin.json` and `package.json`
3. Create new zip: `wix-ecom-cowork-v{VERSION}.zip`
4. Exclude playwright, node_modules, .git

**Zip command**:
```bash
zip -r wix-ecom-cowork-v{VERSION}.zip wix-ecom-cowork \
  -x "wix-ecom-cowork/playwright/*" \
  -x "wix-ecom-cowork/.git/*" \
  -x "wix-ecom-cowork/node_modules/*" \
  -x "wix-ecom-cowork/.DS_Store"
```

## Quick Start for New Feature

### Checklist

- [ ] Define feature scope (what, where, why)
- [ ] Find Wix UI URL for feature
- [ ] Find official API docs (if they exist)
- [ ] Create Playwright capture script
- [ ] Run capture and analyze APIs
- [ ] Compare UI APIs vs documented APIs
- [ ] Build skill(s) with API patterns
- [ ] Build command(s) with workflows
- [ ] Remove any hardcoded values
- [ ] Add to README.md commands table
- [ ] Update version (minor or major)
- [ ] Create new zip file
- [ ] Test with actual Wix store

## Tools & Resources

### Available Tools

**Playwright Framework** (`/playwright/`):
- `scripts/capture-*.ts` - Automation scripts
- `utils/wix-api-filter.ts` - API detection
- `utils/element-finder.ts` - Element discovery
- `output/` - Captured data
- `package.json` - Run scripts

**Wix Resources**:
- **API Keys**: https://manage.wix.com/account/api-keys
- **API Docs**: https://dev.wix.com/docs/api-reference/
- **Test Store**: Site ID from dashboard URL
- **Auth**: `/Users/itayhe/.yoshi/auth.json` (for Playwright)

**Claude Tools**:
- WebFetch - Get API documentation
- Playwright - Can be used via MCP if needed
- Grep/Read - Analyze existing skills
- Edit/Write - Update files

### Session Knowledge

**What we learned building this plugin**:

1. **UI ≠ Docs**: Wix UI uses different endpoints than documented
2. **Capture First**: Always run Playwright before coding
3. **Test Everything**: API docs can be wrong (404s, field names)
4. **Wix AI Exists**: Check for `/recommendations/` endpoints
5. **Priority Patterns**: Segments > Labels > Contact IDs
6. **Field Structure**: Price, cost, etc. are objects not numbers
7. **Query Patterns**: Most use POST with {query: {}} not GET

**APIs Discovered** (70+ endpoints):
- Products: GraphQL + REST
- Categories: GraphQL queries
- Orders: Aggregation, refunds, payments
- Tax: Groups, regions, calculations
- Email: Segments, labels, campaigns
- Recommendations: AI-powered suggestions

## Next Features to Build

**Priority List** (based on user requests):

1. **Inventory Management** - Restock alerts, ABC analysis
2. **Customer Segments** - Advanced customer filtering
3. **Shipping Rules** - Shipping zones and rates
4. **Abandoned Cart** - Recovery campaigns
5. **Product Reviews** - Review management
6. **Gift Cards** - Gift card operations
7. **Subscriptions** - Subscription management
8. **Analytics Reports** - Custom report builder
9. **Loyalty Programs** - Points and rewards
10. **Multi-currency** - Currency conversion

**For each**:
1. Find Wix UI page
2. Run Playwright capture
3. Check API docs
4. Build skill + command
5. Test and verify
6. New version + zip

## Final Checklist Before Release

- [ ] All curl commands use `${API_KEY}` and `${SITE_ID}`
- [ ] No hardcoded percentages, amounts, or thresholds
- [ ] API calls mandatory when user asks for recommendations
- [ ] User-specified values honored exactly
- [ ] Feedback submitted for AI recommendations
- [ ] Examples use `${VARIABLES}` not literal values
- [ ] Commands reference skills (not vice versa)
- [ ] README updated with new commands
- [ ] Version bumped
- [ ] New zip created
- [ ] Tested with real store data

---

**This guide contains the complete methodology used to build 23 commands and 26 skills over 700+ API discoveries!**
