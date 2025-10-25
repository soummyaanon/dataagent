# 📚 OSS Data Analyst - Complete Documentation Index

Welcome! Here's everything you need to know about using the AI Data Analyst.

## 🚀 Getting Started

- **[README.md](./README.md)** - Project overview, features, and quick start
- **[CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md)** - Complete guide to connect your databases
- **[USE_CASES.md](./USE_CASES.md)** - Real-world examples for your business domain

---

## 📖 Documentation Structure

### 1. **Main README** (`README.md`)
- What is OSS Data Analyst?
- Features overview
- Quick installation
- Multi-phase workflow explanation
- Sample queries

**Start here if:** You're new to the project

---

### 2. **Connection Guide** (`CONNECTION_GUIDE.md`)
- Step-by-step setup for your database
- Configuration examples (Snowflake, PostgreSQL, SQLite)
- How to define your data schema
- Troubleshooting common issues
- FAQ

**Start here if:** You want to connect your database

---

### 3. **Use Cases Guide** (`USE_CASES.md`)
Complete examples for 6 business domains:

1. **Sales & Revenue Analysis**
   - Database schema
   - Example queries
   - Key metrics
   - Sample questions

2. **HR & People Operations**
   - Employee data structure
   - Compensation analysis
   - Organizational queries

3. **Customer Success & Account Management**
   - Account health monitoring
   - Churn prediction
   - Revenue forecasting

4. **Product & Operations**
   - Inventory management
   - Production quality
   - Capacity planning

5. **Financial & Compliance**
   - Budget tracking
   - Expense reporting
   - Variance analysis

6. **Marketing & Growth**
   - Campaign ROI
   - Customer acquisition
   - Conversion funnels

**Start here if:** You want real-world examples for your industry

---

## 🎯 Quick Navigation by Role

### 👨‍💼 Sales Manager
- Read: [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) + [USE_CASES.md#1️⃣-sales--revenue-analysis)
- Setup: Sales database with transactions, products, salespeople
- Ask: "What is our total revenue by region?"

### 👥 HR Manager
- Read: [USE_CASES.md#2️⃣-hr--people-operations](./USE_CASES.md)
- Setup: Employee, team, and compensation tables
- Ask: "What is average salary by department?"

### 🎯 Customer Success Manager
- Read: [USE_CASES.md#3️⃣-customer-success--account-management](./USE_CASES.md)
- Setup: Accounts, contracts, activities tables
- Ask: "Which accounts are at risk of churn?"

### 📊 Finance Manager
- Read: [USE_CASES.md#5️⃣-financial--compliance](./USE_CASES.md)
- Setup: Expenses, budget, transactions tables
- Ask: "How much have we spent vs budget?"

### 📈 Marketing Manager
- Read: [USE_CASES.md#6️⃣-marketing--growth](./USE_CASES.md)
- Setup: Campaigns, leads, customers tables
- Ask: "What is ROI by marketing channel?"

### ⚙️ Operations Manager
- Read: [USE_CASES.md#4️⃣-product--operations](./USE_CASES.md)
- Setup: Inventory, production, quality tables
- Ask: "What is our defect rate by facility?"

---

## 📋 Step-by-Step Setup

### For Any Use Case:

1. **Choose your use case** from [USE_CASES.md](./USE_CASES.md)

2. **Follow [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) with these steps:**
   - Step 1: Configure database connection (`.env.local`)
   - Step 2: Define data schema (`src/semantic/catalog.yml`)
   - Step 3: Create entity definitions (`.yml` files)
   - Step 4: Update code (`src/lib/agent.ts`)
   - Step 5: Start server (`pnpm dev`)

3. **Ask your first question** at `http://localhost:3000`

---

## 🔍 How to Use Each Guide

### README.md
```
Perfect for: Understanding WHAT the project does
Contains: Features, workflow, examples
Time to read: 5 minutes
```

### CONNECTION_GUIDE.md
```
Perfect for: Learning HOW to set up your database
Contains: Step-by-step instructions, configs, troubleshooting
Time to read: 15 minutes
```

### USE_CASES.md
```
Perfect for: Seeing REAL EXAMPLES for your business
Contains: Complete schemas, queries, configurations
Time to read: 20 minutes (pick your use case)
```

---

## 💡 Common Questions

**Q: Where do I start?**
A: Start with [README.md](./README.md), then pick your use case from [USE_CASES.md](./USE_CASES.md)

**Q: I have Snowflake, what do I do?**
A: Follow [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) Step 1 with Snowflake config

**Q: I don't know my schema, how do I define it?**
A: Look at your use case in [USE_CASES.md](./USE_CASES.md) and adapt the schema

**Q: How do I ask questions?**
A: Just type in the UI at `http://localhost:3000` - ask naturally!

**Q: What if the agent generates wrong SQL?**
A: It has auto-repair - if it fails, it will try to fix it

**Q: Can I use multiple databases?**
A: Yes - see [CONNECTION_GUIDE.md#multi-database-configuration](./CONNECTION_GUIDE.md)

---

## 📊 File Size Reference

| File | Size | Purpose |
|------|------|---------|
| README.md | 5KB | Project overview |
| CONNECTION_GUIDE.md | 16KB | Setup instructions |
| USE_CASES.md | 30KB | Real-world examples |
| DOCUMENTATION_INDEX.md | This file | Navigation guide |

---

## 🎓 Learning Path

### Beginner (30 min)
1. Read [README.md](./README.md)
2. Run `pnpm install` and `pnpm dev`
3. Try sample questions on demo data

### Intermediate (1-2 hours)
1. Pick your use case from [USE_CASES.md](./USE_CASES.md)
2. Follow [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) Step 1-2
3. Configure your database connection

### Advanced (2-4 hours)
1. Complete [CONNECTION_GUIDE.md](./CONNECTION_GUIDE.md) all steps
2. Define your semantic catalog
3. Deploy to production with `pnpm build && pnpm start`

---

## 🚀 Example Workflows

### Workflow 1: Quick Demo (5 minutes)
```
1. Clone repo
2. pnpm install
3. pnpm dev
4. Ask a question at http://localhost:3000
Done! ✓
```

### Workflow 2: Connect Your Sales Data (30 minutes)
```
1. Read [USE_CASES.md#1️⃣-sales--revenue-analysis]
2. Follow [CONNECTION_GUIDE.md] steps 1-4
3. Update .env.local with Snowflake credentials
4. Define catalog.yml with your sales tables
5. Ask: "What is our revenue by region?"
Done! ✓
```

### Workflow 3: Full Enterprise Setup (2 hours)
```
1. Read all three docs
2. Prepare database credentials
3. Map your schema to use cases
4. Configure .env.local
5. Update semantic definitions
6. Build for production
7. Deploy
Done! ✓
```

---

## 📞 Support

- 🐛 **Bug?** Check [CONNECTION_GUIDE.md#-troubleshooting](./CONNECTION_GUIDE.md#-troubleshooting)
- ❓ **Question?** See [CONNECTION_GUIDE.md#-faq](./CONNECTION_GUIDE.md#-faq)
- 📖 **Need help?** Re-read the relevant guide
- 🔗 **GitHub?** Open issue on repository

---

## ✨ Quick Links

- [Main README](./README.md)
- [Connection Guide](./CONNECTION_GUIDE.md)
- [Use Cases Guide](./USE_CASES.md)
- [GitHub Repository](https://github.com/vercel/oss-data-analyst)
- [Vercel AI SDK Docs](https://sdk.vercel.ai)

---

## 📝 Documentation Updates

Last Updated: October 25, 2025
Version: 1.0

---

**Happy analyzing! 🚀**

Pick a guide above and start exploring your data!
