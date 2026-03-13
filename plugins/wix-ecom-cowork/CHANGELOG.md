# Changelog - Wix eCommerce Cowork Plugin

## Version 2.0.0 (2026-02-27) - AI-Powered Product Management

### 🎉 Major New Features

#### 1. AI-Powered Product Creation from Images
- **New Command**: `/wix:product-from-image`
- Upload product photos and automatically generate:
  - Optimized product names
  - SEO-friendly descriptions
  - Price suggestions based on visual quality analysis
  - Category recommendations
  - Keywords and tags
  - Complete product metadata
- Uses Claude's vision capabilities for intelligent product analysis
- Supports batch processing of multiple product images

#### 2. Guided Product Creation Workflow
- **New Command**: `/wix:guided-product-creation`
- Interactive step-by-step product setup
- Built-in best practices enforcement
- Quality validation at each step
- Optimal API call sequencing
- Professional product creation guidance

#### 3. Advanced GraphQL Product Operations
- **New Command**: `/wix:product-advanced`
- Full variant control and management
- Complete product schemas including:
  - Options and variants
  - Subscription plans
  - Fulfillment providers
  - Shipping groups
  - Custom fields
  - Digital file attachments
- Premium features detection
- Advanced querying capabilities

### 🔧 New Skills

1. **`product-graphql`** - GraphQL API patterns for advanced product operations
2. **`store-manager`** - Store provisioning, categories, and business manager integration
3. **`tax-management`** - Tax groups query and assignment
4. **`product-workflow-guide`** - Best practices and quality checklists for product creation
5. **`ai-product-from-image`** - Vision-powered product data generation

### 🛠️ Infrastructure

- **Playwright automation framework** for API discovery
- Captured 380+ API calls across multiple workflows
- Discovered 44 unique endpoints not previously documented
- GraphQL endpoint integration
- Store manager backend APIs

### 📊 API Coverage

- **Total Skills**: 17 (was 12)
- **Total Commands**: 16 (was 13)
- **API Endpoints**: 60+ covered (was ~20)
- **New Categories**: GraphQL, Store Manager, Tax Groups, AI Vision

### 🔄 Breaking Changes

None - all existing commands remain fully compatible.

### 🐛 Bug Fixes

- Improved error handling for expired tokens
- Better network request filtering
- Enhanced modal detection in automation

---

## Version 1.0.0 (Previous) - Foundation

- 13 commands for eCommerce, Events, and Bookings
- 12 domain-specific skills
- 2 specialized agents
- REST API integration for Products, Orders, Inventory, Discounts
- Analytics and reporting capabilities

