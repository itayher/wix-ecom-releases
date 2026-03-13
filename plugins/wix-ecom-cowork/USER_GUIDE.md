# 👋 User Guide - Wix eCommerce Plugin for Non-Technical Users

**Welcome!** This plugin helps you manage your Wix store through simple conversations with Claude. No coding required!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Wix API Key

1. Go to: **https://manage.wix.com/account/api-keys**
2. Click **"Create API Key"**
3. Name it: `Claude Desktop`
4. Check these boxes:
   - ✅ Read Products, Write Products
   - ✅ Read Orders, Write Orders
   - ✅ Read Inventory, Write Inventory
   - ✅ Read Collections, Write Collections
   - ✅ Read Coupons, Write Coupons
5. Click **"Generate"**
6. **Copy the long code** that starts with `IST.`

### Step 2: Add to Claude

1. In Claude Desktop, go to **Settings**
2. Find **Plugins** section
3. Find **wix-ecom-cowork** plugin
4. Click **"Customize"**
5. Add:
   ```
   WIX_ACCESS_TOKEN = IST.paste-your-key-here
   ```
6. **Save** and **Restart Claude**

### Step 3: Try It!

Just talk naturally to Claude:
```
"Show me my products"
"What were my sales last week?"
"Create a bestsellers category"
```

That's it! 🎉

---

## 💬 How to Talk to Claude

### ✅ Good Examples (Natural Language)

```
"Show me my products"
"Create a new product"
"Which products are out of stock?"
"Make a category for my best-selling items from last month"
"Help me organize my products into categories"
"What's my tax configuration?"
"Check if this order can be refunded"
```

### ❌ Don't Worry About Commands

You don't need to remember command names! Just ask naturally:
```
❌ Don't say: "/wix:products query limit 50"
✅ Instead say: "Show me my products"

❌ Don't say: "/wix:create-performance-category --metric revenue --days 7"
✅ Instead say: "Create a category with my top sellers from last week"
```

Claude will understand and ask for any details it needs!

---

## 🎯 Common Tasks (Step-by-Step)

### 📦 Add a New Product

**You say**: "Help me add a new product"

**Claude will ask**:
1. What's the product name?
2. How much does it cost?
3. Do you want to upload a photo? (Claude can describe it for you!)
4. What category should it go in?
5. How many do you have in stock?

**Claude will**: Create the product with all the right settings!

**Result**: ✅ Professional product listing created

---

### 📸 Create Product from Photo (EASY!)

**You say**: "Create a product from this photo" *(attach image)*

**Claude will**:
1. Analyze the photo
2. Suggest a product name
3. Write a description
4. Recommend a price
5. Pick the right category

**You**: Just review and say "yes" or suggest changes!

**Result**: ✅ Complete product listing from just a photo!

---

### 🏷️ Organize Products into Categories

**You say**: "Help me organize my products"

**Claude will**:
1. Look at all your products
2. Suggest categories based on product names
3. Show you which products go where
4. Ask if you approve

**You**: Say "yes" to auto-categorize everything!

**Result**: ✅ Organized store with proper categories

---

### 📈 Create a Bestsellers Section

**You say**: "Make a bestsellers category with my top 20 products from last week"

**Claude will**:
1. Check your sales from last week
2. Rank products by sales
3. Show you the top 20
4. Create "Bestsellers" category
5. Add those products

**Result**: ✅ Dynamic bestsellers section in your store!

---

### 💰 Check Tax Setup

**You say**: "Show me my tax configuration"

**Claude will**:
1. Check your active tax calculator
2. List your tax groups
3. Show tax regions you're configured for
4. Tell you if any products are missing tax
5. Offer to fix missing tax assignments

**Result**: ✅ Complete tax compliance overview

---

### 💵 Check if Order Can Be Refunded

**You say**: "Can I refund order #12345?"

**Claude will**:
1. Look up the order
2. Check refund eligibility
3. Tell you the max refund amount
4. Show payment provider
5. Confirm if you want to proceed

**Result**: ✅ Know exactly if refund is possible

---

## 🎨 What Claude Can Do for You

### 🤖 AI-Powered (No Work!)

- **Create products from photos** - Just upload, Claude does the rest
- **Auto-categorize your catalog** - Claude figures out where products go
- **Generate product descriptions** - Professional, SEO-friendly text
- **Suggest pricing** - Based on product quality and type
- **Create bestseller categories** - Automatically from your sales data

### 📊 Analytics Made Simple

- **"How's my store doing?"** - Get complete health report
- **"What sold best last week?"** - Top performers ranked
- **"Who are my best customers?"** - Customer value analysis
- **"What's trending?"** - Recent sales trends
- **"Where's my revenue coming from?"** - Channel breakdown

### 🛠️ Store Management

- **"Show out of stock items"** - Inventory alerts
- **"What needs restocking?"** - Low stock warnings
- **"Create a sale"** - Guided discount creation
- **"Organize my categories"** - Auto-categorization
- **"Check my tax setup"** - Tax compliance overview

---

## 🆘 If You Get Stuck

### Common Issues:

**❓ "Claude says it can't find my site"**
- Make sure you added `WIX_ACCESS_TOKEN` in Settings
- Restart Claude Desktop after adding the key
- Check the key starts with `IST.`

**❓ "Commands aren't working"**
- You don't need to type commands! Just ask naturally
- Example: Instead of `/wix:products`, say "Show me my products"

**❓ "How do I upload a product photo?"**
- Drag and drop the image into the chat, OR
- Save it to your computer and say: "Create product from ~/Desktop/mug.jpg"

**❓ "Can Claude actually change my store?"**
- Yes, but only when you approve!
- Claude will always show you what it's going to do first
- You can say "no" or "cancel" anytime

---

## 💡 Pro Tips

### 1. Be Specific with Time Periods

```
✅ "Show sales from last week"
✅ "Top products from last 30 days"
✅ "Orders from yesterday"

Instead of:
❌ "Show recent sales" (Claude will ask for clarification)
```

### 2. Use Numbers

```
✅ "Top 20 products"
✅ "Create category with 15 items"
✅ "Show last 50 orders"
```

### 3. Describe What You Want to Achieve

```
✅ "I want to highlight my best sellers"
→ Claude creates a bestsellers category

✅ "I need to organize my messy catalog"
→ Claude auto-categorizes everything

✅ "Help me create professional product listings"
→ Claude guides you step-by-step
```

### 4. Ask for Help!

```
"What can you help me with?"
"How do I create a sale?"
"What's the best way to organize products?"
"Can you explain tax groups?"
```

Claude will explain in simple terms!

---

## 📱 Mobile-Friendly

You can use this plugin from:
- 💻 Claude Desktop (Mac/Windows)
- 🌐 Claude Web (browser)
- 📱 Claude Mobile App (with limitations)

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Connect your store
- [ ] View your products
- [ ] Check recent orders
- [ ] Look at your categories

### Week 2: Organization
- [ ] Auto-categorize products
- [ ] Create bestsellers category
- [ ] Check tax configuration
- [ ] Review store health

### Week 3: Growth
- [ ] Create promotional campaigns
- [ ] Analyze customer behavior
- [ ] Track top performers
- [ ] Optimize product listings

### Week 4: Advanced
- [ ] Create products from photos
- [ ] Set up automatic categorization
- [ ] Configure advanced tax rules
- [ ] Build custom reports

---

## 🤝 Remember

- **Claude is your assistant** - Ask questions, try things, experiment!
- **You're in control** - Claude asks before making changes
- **No wrong questions** - If confused, just ask "help me with..."
- **Start simple** - Begin with "Show me my products" and explore from there

---

## 📞 Quick Reference

### Most Common Requests:

| What You Want | Just Say |
|---------------|----------|
| See products | "Show me my products" |
| Add product | "Help me add a product" |
| Check sales | "What sold best last week?" |
| Make category | "Create a category for [type of products]" |
| Check stock | "What's out of stock?" |
| Create sale | "Help me create a discount" |
| See orders | "Show recent orders" |
| Check tax | "Show my tax setup" |
| Organize store | "Help me organize my catalog" |
| Get help | "What can you do?" |

---

**🎉 You're ready! Just start chatting with Claude about your store!**

*No technical knowledge required - just describe what you want to do!*
