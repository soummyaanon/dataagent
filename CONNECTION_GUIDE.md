# 🔌 OSS Data Analyst - Database Connection Guide

A complete guide for connecting your databases to the AI Data Analyst Agent and asking questions across all business domains.

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [Supported Databases](#-supported-databases)
3. [Step-by-Step Setup](#-step-by-step-setup)
4. [Use Case Examples](#-use-case-examples)
5. [Configuration Examples](#-configuration-examples)
6. [Example Queries](#-example-queries)
7. [Troubleshooting](#-troubleshooting)
8. [FAQ](#-faq)

---

## 🚀 Quick Start

Get your database connected in 5 minutes:

```bash
# 1. Clone and setup
git clone https://github.com/vercel/oss-data-analyst.git
cd oss-data-analyst
pnpm install

# 2. Configure your database
cp env.local.example .env.local
# Edit .env.local with your credentials

# 3. Define your schema
# Edit src/semantic/catalog.yml

# 4. Run
pnpm dev

# 5. Ask questions at http://localhost:3000
```

---

## 💾 Supported Databases

| Database | Status | Best For |
|----------|--------|----------|
| **Snowflake** | ✅ Recommended | Enterprise, large datasets, multi-region |
| **PostgreSQL** | ✅ Supported | On-premises, relational data |
| **SQLite** | ✅ Supported | Testing, local development |
| **MySQL** | ✅ Supported | LAMP stacks, legacy systems |
| **Google BigQuery** | 🔄 In Progress | Analytics, massive scale |
| **Redshift** | 🔄 In Progress | AWS data warehouses |

---

## 📋 Step-by-Step Setup

### Step 1: Configure Your Database Connection

Edit `.env.local` in the project root:

#### **For Snowflake (Recommended)**

```env
# AI Provider
OPENAI_API_KEY=sk-your-key-here

# Snowflake Connection
SNOWFLAKE_ACCOUNT=xy12345.us-east-1
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=analytics_db
SNOWFLAKE_SCHEMA=public
SNOWFLAKE_ROLE=analyst

# Security
ALLOWED_SCHEMAS=sales,finance,marketing
STRICT_SQL_VALIDATION=true
```

#### **For PostgreSQL**

```env
# AI Provider
OPENAI_API_KEY=sk-your-key-here

# PostgreSQL Connection
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
DB_SCHEMA=public
ALLOWED_SCHEMAS=public

# Connection Pooling
DB_POOL_MIN=2
DB_POOL_MAX=10
```

#### **For SQLite (Development)**

```env
# AI Provider
OPENAI_API_KEY=sk-your-key-here

# SQLite
SQLITE_DB_PATH=./data/my_database.db
```

### Step 2: Define Your Data Schema

Edit `src/semantic/catalog.yml` to describe your tables:

```yaml
entities:
  - name: Sales
    grain: one row per transaction
    description: >-
      Sales transactions with product information, regional data,
      and revenue metrics for business intelligence.
    
    fields:
      - id (transaction ID)
      - product_id
      - product_name
      - region
      - revenue
      - transaction_date
      - salesperson_id
    
    example_questions:
      - What is our total revenue by region?
      - Which product has the highest revenue?
      - Show me revenue trends by month?
    
    use_cases: >-
      Revenue analysis by geography
      Sales forecasting
      Product performance tracking
```

### Step 3: Create Entity Definitions

Create YAML files in `src/semantic/entities/` for detailed field descriptions:

**Example: `src/semantic/entities/Sales.yml`**

```yaml
table_name: sales_transactions
description: All sales transactions with product and regional data
warehouse: snowflake

fields:
  - name: transaction_id
    type: integer
    description: Unique transaction identifier
    hidden: false
    
  - name: product_id
    type: integer
    description: Foreign key to products table
    hidden: false
    
  - name: region
    type: string
    description: Geographic region (North, South, East, West)
    hidden: false
    
  - name: revenue
    type: numeric
    description: Revenue in USD
    hidden: false
    
  - name: transaction_date
    type: date
    description: Date of transaction
    hidden: false

relationships:
  - target_table: products
    join_key: product_id
    join_type: left
    
  - target_table: salespeople
    join_key: salesperson_id
    join_type: left

indexes:
  - columns: [region, transaction_date]
  - columns: [product_id]
```

### Step 4: Update Database Connection Code

Edit `src/lib/agent.ts` to use your database:

#### **For Production (Snowflake/PostgreSQL):**

Change imports from:
```typescript
import { BuildSQL, FinalizeBuild, ValidateSQL } from "./tools/building-sqlite";
import { EstimateCost, ExecuteSQL, ExecuteSQLWithRepair } from "./tools/execute-sqlite";
```

To:
```typescript
import {
  BuildSQL,
  FinalizeBuild,
  JoinPathFinder,
  ValidateSQL,
} from "./tools/building";

import {
  EstimateCost,
  ExecuteSQL,
  ExecuteSQLWithRepair,
  ExplainSnowflake,
} from "./tools/execute";
```

#### **For Development (SQLite):**

Keep existing imports as-is.

### Step 5: Start the Server

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Then open `http://localhost:3000` and start asking questions!

---

## 🎯 Use Case Examples

### 1️⃣ Sales & Revenue Analysis

**Database Schema:**

```sql
CREATE TABLE sales_transactions (
  transaction_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  product_category VARCHAR,
  product_line VARCHAR,
  region VARCHAR,
  revenue DECIMAL,
  quantity INTEGER,
  transaction_date DATE,
  salesperson_id INTEGER,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (salesperson_id) REFERENCES salespeople(id)
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  category VARCHAR,
  product_line VARCHAR,
  cost DECIMAL,
  selling_price DECIMAL,
  margin_percent DECIMAL
);
```

**Catalog Definition:**

```yaml
entities:
  - name: Sales
    grain: one row per transaction
    description: Sales transactions with product and regional data
    fields: [transaction_id, product_id, product_category, 
             product_line, region, revenue, transaction_date, salesperson_id]
    example_questions:
      - What is our total revenue by region?
      - Which product line has the highest revenue?
      - Show me revenue trends by month
      - Which product categories have the highest margin?
    use_cases: >-
      Revenue analysis by geography and product
      Sales forecasting and trend analysis
      Product performance tracking
      Pricing optimization and margin analysis
```

**Questions to Ask:**

```
"What is our total revenue by region?"
"Which product line generated the most revenue this quarter?"
"Show me revenue trends by month"
"Which product categories have the highest margin?"
"What is the top-performing region?"
"Show me sales by salesperson"
```

---

### 2️⃣ HR & People Operations

**Database Schema:**

```sql
CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR UNIQUE,
  department VARCHAR,
  job_title VARCHAR,
  seniority_level VARCHAR,
  salary DECIMAL,
  bonus DECIMAL,
  hire_date DATE,
  performance_rating INTEGER,
  manager_id INTEGER
);

CREATE TABLE teams (
  team_id INTEGER PRIMARY KEY,
  team_name VARCHAR,
  department VARCHAR,
  manager_id INTEGER,
  headcount INTEGER
);
```

**Catalog Definition:**

```yaml
entities:
  - name: Employees
    grain: one row per employee
    description: Employee records with compensation and performance data
    fields: [employee_id, first_name, last_name, department, job_title, 
             seniority_level, salary, hire_date, performance_rating]
    example_questions:
      - How many engineers do we have by seniority level?
      - What is the average salary by department?
      - Show me salary distribution by job title
      - Who are our top performers?
    use_cases: >-
      Compensation analysis
      Workforce planning
      Talent review
      Organizational structure
```

**Questions to Ask:**

```
"How many engineers do we have by seniority level?"
"What is the average salary by department?"
"Show me salary distribution by job title and experience"
"Who are our top performers and what are they paid?"
"Create an organizational chart with headcount by team"
"Show me average tenure by department"
"What is the salary range for a Senior Engineer?"
```

---

### 3️⃣ Customer Success & Account Management

**Database Schema:**

```sql
CREATE TABLE accounts (
  account_id INTEGER PRIMARY KEY,
  account_name VARCHAR,
  company_name VARCHAR,
  status VARCHAR,
  monthly_recurring_revenue DECIMAL,
  annual_contract_value DECIMAL,
  account_manager_id INTEGER,
  contract_start_date DATE,
  contract_end_date DATE,
  health_score INTEGER,
  churn_risk VARCHAR,
  last_interaction_date DATE
);

CREATE TABLE account_managers (
  manager_id INTEGER PRIMARY KEY,
  manager_name VARCHAR,
  total_accounts INTEGER,
  total_mrr DECIMAL,
  retention_rate DECIMAL
);
```

**Catalog Definition:**

```yaml
entities:
  - name: Accounts
    grain: one row per customer account
    description: Customer accounts with revenue and health metrics
    fields: [account_id, account_name, status, monthly_recurring_revenue, 
             annual_contract_value, account_manager_id, health_score, churn_risk]
    example_questions:
      - Which accounts are at risk of churn?
      - What is the total MRR?
      - Show me top 10 accounts by ACV
      - Which account manager has the highest productivity?
    use_cases: >-
      Account health monitoring
      Churn prediction
      Revenue forecasting
      Account manager performance
```

**Questions to Ask:**

```
"Which accounts are at risk of churn?"
"What is our total MRR and projected growth?"
"Show me top 10 accounts by annual contract value"
"Which account manager has the highest retention rate?"
"What accounts expire in the next 90 days?"
"Show me account health distribution"
"What is our projected revenue for next quarter?"
```

---

### 4️⃣ Product & Operations

**Database Schema:**

```sql
CREATE TABLE inventory (
  product_id INTEGER,
  warehouse_id INTEGER,
  quantity_on_hand INTEGER,
  reorder_level INTEGER,
  last_updated DATE
);

CREATE TABLE production (
  production_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  facility_id INTEGER,
  cycle_time_hours DECIMAL,
  defect_rate DECIMAL,
  production_date DATE
);
```

**Questions to Ask:**

```
"What products are low in stock?"
"What is the defect rate by manufacturing facility?"
"Show me average cycle time by product"
"Which facilities have the lowest quality?"
"What is our production capacity utilization?"
```

---

### 5️⃣ Financial & Compliance

**Database Schema:**

```sql
CREATE TABLE expenses (
  expense_id INTEGER PRIMARY KEY,
  department VARCHAR,
  cost_center VARCHAR,
  amount DECIMAL,
  expense_date DATE,
  category VARCHAR,
  vendor_id INTEGER
);

CREATE TABLE budget (
  budget_id INTEGER PRIMARY KEY,
  department VARCHAR,
  budget_year INTEGER,
  budgeted_amount DECIMAL,
  actual_amount DECIMAL
);
```

**Questions to Ask:**

```
"How much have we spent vs budget this quarter?"
"Show me expenses by cost center"
"Which departments are over budget?"
"What is our spending trend?"
"Generate a compliance report"
```

---

### 6️⃣ Marketing & Growth

**Database Schema:**

```sql
CREATE TABLE campaigns (
  campaign_id INTEGER PRIMARY KEY,
  campaign_name VARCHAR,
  channel VARCHAR,
  launch_date DATE,
  budget DECIMAL,
  spend DECIMAL,
  conversions INTEGER
);

CREATE TABLE leads (
  lead_id INTEGER PRIMARY KEY,
  source VARCHAR,
  created_date DATE,
  status VARCHAR,
  value DECIMAL
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  acquisition_source VARCHAR,
  lifetime_value DECIMAL,
  acquisition_date DATE
);
```

**Questions to Ask:**

```
"What is ROI by marketing channel?"
"Show me conversion rate at each funnel stage"
"Which lead sources convert best?"
"What is our customer lifetime value by acquisition source?"
"Which campaigns have the highest ROI?"
```

---

## ⚙️ Configuration Examples

### Full Snowflake Configuration

```env
# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Snowflake
SNOWFLAKE_ACCOUNT=xy12345.us-east-1
SNOWFLAKE_USERNAME=analytics_user
SNOWFLAKE_PASSWORD=SecurePassword123!
SNOWFLAKE_WAREHOUSE=ANALYTICS_WH
SNOWFLAKE_DATABASE=analytics_db
SNOWFLAKE_SCHEMA=public
SNOWFLAKE_ROLE=analyst

# Connection Settings
SNOWFLAKE_STATEMENT_TIMEOUT=120
SNOWFLAKE_POOL_MAX=10

# Security
ALLOWED_SCHEMAS=sales,finance,marketing,operations
STRICT_SQL_VALIDATION=true

# Performance
TABLE_CHUNK_SIZE=500
MAX_TOOL_ROUNDTRIPS=10
```

### PostgreSQL Configuration

```env
OPENAI_API_KEY=sk-proj-xxxxx
DATABASE_URL=postgresql://user:password@db.example.com:5432/analytics
DB_SCHEMA=public
DB_POOL_MIN=2
DB_POOL_MAX=10
ALLOWED_SCHEMAS=public,analytics
```

### Multi-Database Configuration

```env
# Primary Database
PRIMARY_DB=snowflake
SNOWFLAKE_ACCOUNT=xy12345.us-east-1
SNOWFLAKE_USERNAME=user1
SNOWFLAKE_PASSWORD=pass1

# Secondary Database (PostgreSQL)
SECONDARY_DB=postgresql
DATABASE_URL=postgresql://user2:pass2@localhost/db2

# AI
OPENAI_API_KEY=sk-proj-xxxxx
```

---

## 💬 Example Queries by Use Case

### Sales Manager

```
"Show me top 10 accounts by revenue"
"What is the sales pipeline by stage?"
"Which regions need support?"
"Show me revenue forecast for Q4"
```

### HR Manager

```
"How many people do we have by level?"
"Show me our compensation benchmarks"
"Who are our top performers?"
"What is our turnover rate by department?"
```

### CFO

```
"What is our quarterly revenue?"
"Show me expenses vs budget"
"What is our cash flow projection?"
"Which products are most profitable?"
```

### VP of Product

```
"What features are most used?"
"Show me user engagement by segment"
"What is our churn rate?"
"Where is the product demand?"
```

### Marketing Director

```
"What is our CAC by channel?"
"Show me conversion funnel"
"What campaigns have the best ROI?"
"What is our LTV by acquisition source?"
```

---

## 🔧 Troubleshooting

### Connection Issues

**Error: "Database connection failed"**

```bash
# Check credentials in .env.local
# Verify database is running
# Test connection manually:
psql postgresql://user:pass@localhost/db
# or
snowsql -c your_snowflake_connection
```

**Error: "Schema not found"**

```bash
# Verify schema name in .env.local
# Make sure you have permissions
# Update ALLOWED_SCHEMAS in .env.local
```

### Query Errors

**Error: "Table not found"**

```bash
# 1. Verify table name in your database
# 2. Update src/semantic/catalog.yml with correct table names
# 3. Check ALLOWED_SCHEMAS includes the schema
```

**Error: "Column not found"**

```bash
# 1. Verify column exists in your table
# 2. Update field definitions in src/semantic/entities/YourTable.yml
# 3. Restart server: pnpm dev
```

### Performance Issues

**Slow queries**

```env
# Increase query timeout
SNOWFLAKE_STATEMENT_TIMEOUT=300

# Reduce data
TABLE_CHUNK_SIZE=1000
```

---

## ❓ FAQ

**Q: Can I use multiple databases?**

A: Yes! Update `.env.local` with multiple database URLs and configure tools accordingly.

**Q: How do I add new tables?**

A: 
1. Add to your database
2. Create YAML in `src/semantic/entities/TableName.yml`
3. Update `src/semantic/catalog.yml`
4. Restart server

**Q: How secure is this?**

A: 
- Credentials stored in `.env.local` (never committed)
- SQL validation enforced
- Schema restrictions via ALLOWED_SCHEMAS
- Query authorization checks

**Q: What if the agent generates wrong SQL?**

A: 
- It has automatic repair capabilities
- Falls back to interactive clarification
- You can review queries before execution

**Q: Can I customize the AI behavior?**

A: Yes! Edit prompts in `src/lib/prompts/`:
- `planning.ts` - Planning phase
- `building.ts` - SQL generation
- `execution.ts` - Query execution
- `reporting.ts` - Result analysis

**Q: How do I switch databases?**

A: Update `.env.local` with new credentials and restart.

**Q: Does it support real-time data?**

A: Yes, queries always run against current database state.

**Q: Can I use this in production?**

A: Yes! Build with `pnpm build` and deploy with `pnpm start`.

---

## 📚 Resources

- [Main README](./README.md)
- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [Snowflake Docs](https://docs.snowflake.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 🤝 Support

Need help? 

- Check [Troubleshooting](#-troubleshooting) section
- Open an issue on [GitHub](https://github.com/vercel/oss-data-analyst/issues)
- Review [Main README](./README.md)

---

## 📝 License

MIT - See [LICENSE](./LICENSE) for details

---

**Happy analyzing! 🚀**
