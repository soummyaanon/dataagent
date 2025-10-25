# 💼 OSS Data Analyst - Real-World Use Cases

Complete guide with real-world use cases, example databases, and queries you can use immediately.

## 📚 Table of Contents

1. [Sales & Revenue Analysis](#1-sales--revenue-analysis)
2. [HR & People Operations](#2-hr--people-operations)
3. [Customer Success & Account Management](#3-customer-success--account-management)
4. [Product & Operations](#4-product--operations)
5. [Financial & Compliance](#5-financial--compliance)
6. [Marketing & Growth](#6-marketing--growth)

---

## 1️⃣ Sales & Revenue Analysis

### 🎯 Business Problem

Sales teams need real-time insights into revenue, regional performance, product profitability, and sales pipeline to make data-driven decisions.

### 📊 Database Schema

```sql
-- Sales Transactions Table
CREATE TABLE sales_transactions (
  transaction_id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  salesperson_id INTEGER NOT NULL,
  region VARCHAR(50) NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount_percent DECIMAL(5, 2),
  transaction_date DATE NOT NULL,
  fiscal_quarter VARCHAR(10),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (salesperson_id) REFERENCES salespeople(id)
);

-- Products Table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  product_line VARCHAR(50),
  cost DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  margin_percent DECIMAL(5, 2),
  supplier_id INTEGER
);

-- Salespeople Table
CREATE TABLE salespeople (
  id INTEGER PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  region VARCHAR(50),
  territory VARCHAR(100),
  manager_id INTEGER,
  commission_rate DECIMAL(5, 2),
  hire_date DATE
);

-- Regions Table
CREATE TABLE regions (
  region_id INTEGER PRIMARY KEY,
  region_name VARCHAR(50),
  country VARCHAR(50),
  sales_manager_id INTEGER,
  annual_target DECIMAL(12, 2)
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Sales
    grain: one row per transaction
    description: >-
      Sales transactions with product information, regional data, and revenue metrics
      for business intelligence and performance tracking.
    
    fields:
      - transaction_id (unique identifier)
      - product_id (product reference)
      - salesperson_id (sales rep reference)
      - region (geographic region)
      - revenue (transaction amount in USD)
      - quantity (units sold)
      - transaction_date (date of sale)
      - fiscal_quarter (Q1-Q4)
    
    example_questions:
      - What is our total revenue by region?
      - Which product line has the highest revenue?
      - Show me revenue trends by month
      - Which product categories have the highest margin?
      - What is the top-performing region this quarter?
    
    use_cases: >-
      Revenue analysis by geography and product
      Sales forecasting and trend analysis
      Product performance tracking
      Pricing optimization and margin analysis

  - name: Products
    grain: one row per product
    description: Product catalog with pricing and margin information
    fields: [id, name, category, product_line, cost, selling_price, margin_percent]
    example_questions:
      - Which products have the highest margin?
      - Show me profitability by product line
      - What is our average price point by category?
    use_cases: >-
      Product profitability analysis
      Pricing strategy optimization
      Inventory management decisions
```

### 💬 Example Queries

```
"What is our total revenue by region?"
→ Shows revenue breakdown across North, South, East, West regions

"Which product line generated the most revenue this quarter?"
→ Compares revenue by Enterprise, Mid-Market, SMB product lines

"Show me revenue trends by month"
→ Line chart showing revenue growth or decline over time

"Which product categories have the highest margin?"
→ Identifies most profitable product categories for strategy

"Show me top 10 products by revenue"
→ Lists best-selling products with revenue amounts

"What is the average deal size by region?"
→ Calculates mean transaction value per region

"Which salesperson has the highest commission?"
→ Performance ranking of sales representatives

"Show me revenue vs cost by product line"
→ Visualizes profitability across product lines
```

### 📈 Key Metrics Tracked

- **Total Revenue**: Sum of all sales
- **Revenue by Region**: Regional performance comparison
- **Revenue by Product Line**: Product category performance
- **Margin %**: Profitability percentage
- **Deal Size**: Average transaction value
- **Growth Rate**: Month-over-month or YoY growth
- **Sales Velocity**: How fast deals are closing

### 🔧 Configuration

```env
# .env.local for Sales Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=sales_analytics
SNOWFLAKE_SCHEMA=revenue
ALLOWED_SCHEMAS=revenue,products,sales
```

---

## 2️⃣ HR & People Operations

### 🎯 Business Problem

HR teams need visibility into workforce composition, compensation equity, talent retention, performance metrics, and organizational structure for strategic planning.

### 📊 Database Schema

```sql
-- Employees Table
CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  department VARCHAR(50),
  job_title VARCHAR(100),
  seniority_level VARCHAR(20),
  salary DECIMAL(10, 2),
  bonus DECIMAL(10, 2),
  stock_options DECIMAL(12, 2),
  hire_date DATE,
  promotion_date DATE,
  performance_rating INTEGER,
  manager_id INTEGER,
  location VARCHAR(50),
  employment_status VARCHAR(20)
);

-- Teams Table
CREATE TABLE teams (
  team_id INTEGER PRIMARY KEY,
  team_name VARCHAR(100),
  department VARCHAR(50),
  manager_id INTEGER,
  headcount INTEGER,
  annual_budget DECIMAL(12, 2),
  created_date DATE
);

-- Performance Reviews Table
CREATE TABLE performance_reviews (
  review_id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  reviewer_id INTEGER,
  review_date DATE,
  rating INTEGER,
  comments TEXT,
  goals_met BOOLEAN,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

-- Compensation History Table
CREATE TABLE compensation_history (
  history_id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  effective_date DATE,
  salary DECIMAL(10, 2),
  bonus DECIMAL(10, 2),
  adjustment_percent DECIMAL(5, 2),
  reason VARCHAR(100),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Employees
    grain: one row per employee
    description: >-
      Employee records with compensation, department, and performance data
      for workforce analysis and human capital reporting.
    
    fields:
      - employee_id (unique identifier)
      - first_name, last_name
      - department
      - job_title
      - seniority_level (junior, mid, senior, lead, director, vp)
      - salary (annual salary in USD)
      - bonus (annual bonus in USD)
      - hire_date
      - performance_rating (1-5 scale)
      - manager_id (manager reference)
    
    example_questions:
      - How many engineers do we have by seniority level?
      - What is the average salary by department?
      - Show me salary distribution by job title
      - Who are our top performers?
      - Create an organizational chart with headcount
    
    use_cases: >-
      Compensation analysis and equity reviews
      Workforce planning and headcount forecasting
      Talent retention and engagement
      Organizational structure visualization

  - name: Teams
    grain: one row per team
    description: Team structure and headcount information
    fields: [team_id, team_name, department, manager_id, headcount]
    example_questions:
      - Which teams are understaffed?
      - Show me headcount by team
      - What is the span of control per manager?
    use_cases: >-
      Organizational planning
      Resource allocation
      Team structure optimization
```

### 💬 Example Queries

```
"How many engineers do we have by seniority level?"
→ Breakdown: 3 Junior, 5 Mid-level, 2 Senior, 1 Lead

"What is the average salary by department?"
→ Engineering: $145K, Sales: $120K, Marketing: $95K

"Show me salary distribution by job title and experience"
→ Box plot showing salary ranges for each position

"Who are our top performers and what are they paid?"
→ List of employees with 5-star ratings and their compensation

"Create an organizational chart with headcount by team"
→ Hierarchical view of organization with team sizes

"Show me average tenure by department"
→ Engineering: 4.2 years, Sales: 2.1 years, Marketing: 3.5 years

"What is the salary range for a Senior Engineer?"
→ Range: $140K - $180K, Average: $162K

"Show me compensation by level across all departments"
→ Comparative view of leveling structure and pay

"Which managers have the highest performing teams?"
→ Manager rankings by team performance ratings

"What is our voluntary turnover rate?"
→ Percentage of employees who left vs total employees
```

### 📈 Key Metrics Tracked

- **Headcount**: Total employees by department/team
- **Average Salary**: By department, role, level
- **Salary Range**: Min/max/median by position
- **Performance Rating**: Distribution of ratings
- **Tenure**: Average time at company by department
- **Turnover Rate**: Voluntary and involuntary departures
- **Promotion Rate**: Career progression metrics
- **Salary Growth**: YoY increases by level

### 🔧 Configuration

```env
# .env.local for HR Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=hr_analytics
SNOWFLAKE_SCHEMA=people
ALLOWED_SCHEMAS=people,compensation,teams
```

---

## 3️⃣ Customer Success & Account Management

### 🎯 Business Problem

Customer Success teams need to monitor account health, predict churn, forecast revenue, track manager performance, and identify expansion opportunities for growth and retention.

### 📊 Database Schema

```sql
-- Accounts Table
CREATE TABLE accounts (
  account_id INTEGER PRIMARY KEY,
  account_name VARCHAR(200),
  company_name VARCHAR(200),
  industry VARCHAR(50),
  company_size VARCHAR(20),
  status VARCHAR(20),
  account_type VARCHAR(20),
  monthly_recurring_revenue DECIMAL(12, 2),
  annual_contract_value DECIMAL(12, 2),
  account_manager_id INTEGER,
  contract_start_date DATE,
  contract_end_date DATE,
  health_score INTEGER,
  churn_risk VARCHAR(20),
  last_interaction_date DATE,
  nps_score INTEGER,
  onboarding_completed BOOLEAN,
  feature_adoption_score INTEGER,
  FOREIGN KEY (account_manager_id) REFERENCES account_managers(id)
);

-- Account Managers Table
CREATE TABLE account_managers (
  id INTEGER PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  region VARCHAR(50),
  total_accounts INTEGER,
  total_mrr DECIMAL(12, 2),
  retention_rate DECIMAL(5, 2),
  average_health_score INTEGER,
  tenure_months INTEGER
);

-- Account Activities Table
CREATE TABLE account_activities (
  activity_id INTEGER PRIMARY KEY,
  account_id INTEGER,
  activity_type VARCHAR(50),
  activity_date DATE,
  details TEXT,
  user_engaged BOOLEAN,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Contracts Table
CREATE TABLE contracts (
  contract_id INTEGER PRIMARY KEY,
  account_id INTEGER,
  start_date DATE,
  end_date DATE,
  value DECIMAL(12, 2),
  terms TEXT,
  renewal_date DATE,
  auto_renewal BOOLEAN,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Accounts
    grain: one row per customer account
    description: >-
      Customer accounts with contract details, revenue metrics, and health indicators
      for analyzing customer success, retention, and growth.
    
    fields:
      - account_id (unique identifier)
      - account_name
      - status (active, inactive, at_risk, churned)
      - monthly_recurring_revenue (MRR in USD)
      - annual_contract_value (ACV in USD)
      - account_manager_id (manager reference)
      - contract_start_date, contract_end_date
      - health_score (0-100)
      - churn_risk (high, medium, low)
      - nps_score (-100 to 100)
    
    example_questions:
      - Which accounts are at risk of churn?
      - What is the total MRR and projected growth?
      - Show me top 10 accounts by ACV
      - Which account manager has the highest retention?
      - What accounts expire in the next 90 days?
    
    use_cases: >-
      Account health monitoring and alerts
      Churn prediction and prevention
      Revenue forecasting and planning
      Account manager performance tracking
      Expansion opportunity identification

  - name: AccountManagers
    grain: one row per manager
    description: Account manager performance and territory metrics
    fields: [id, first_name, last_name, region, total_accounts, total_mrr, retention_rate]
    example_questions:
      - Which managers have the highest retention?
      - Show me MRR by manager
      - Who has the most accounts?
    use_cases: >-
      Manager performance ranking
      Territory planning
      Commission calculation
```

### 💬 Example Queries

```
"Which accounts are at risk of churn?"
→ Lists accounts with health_score < 50 or churn_risk = high

"What is our total MRR and projected growth?"
→ Current MRR: $2.5M, Projected Q4: $2.8M (12% growth)

"Show me top 10 accounts by annual contract value"
→ ACV ranking from $500K down to $150K

"Which account manager has the highest retention rate?"
→ John Smith: 95%, Jane Doe: 92%, Bob Johnson: 88%

"What accounts expire in the next 90 days?"
→ Shows renewal dates and which need attention

"Show me account health distribution"
→ Pie chart: 70% Healthy, 20% At Risk, 10% Critical

"What is our projected revenue for next quarter?"
→ $2.75M MRR × 3 months = $8.25M expected

"Show me expansion opportunities"
→ Accounts with high health but low feature adoption

"Which industries have the highest churn?"
→ Breakdown by industry showing risk levels

"Show me account onboarding completion rate"
→ 85% completed, 15% in progress
```

### 📈 Key Metrics Tracked

- **Total MRR/ARR**: Monthly/Annual Recurring Revenue
- **Health Score**: Account wellness indicator (0-100)
- **Churn Risk**: Probability of account leaving
- **NPS Score**: Customer satisfaction (-100 to 100)
- **Retention Rate**: % of accounts retained YoY
- **ACV**: Average Contract Value per account
- **Account Expansion**: Upsell/cross-sell revenue
- **Time to Renewal**: Days until contract renewal
- **Feature Adoption**: Usage metrics

### 🔧 Configuration

```env
# .env.local for Customer Success Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=customer_analytics
SNOWFLAKE_SCHEMA=accounts
ALLOWED_SCHEMAS=accounts,contracts,activities
```

---

## 4️⃣ Product & Operations

### 🎯 Business Problem

Product and Operations teams need real-time visibility into inventory, production metrics, quality control, cycle times, and capacity utilization for operational excellence.

### 📊 Database Schema

```sql
-- Inventory Table
CREATE TABLE inventory (
  inventory_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  warehouse_id INTEGER,
  warehouse_name VARCHAR(100),
  quantity_on_hand INTEGER,
  quantity_reserved INTEGER,
  reorder_level INTEGER,
  reorder_quantity INTEGER,
  last_stock_date DATE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Production Table
CREATE TABLE production (
  production_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  facility_id INTEGER,
  facility_name VARCHAR(100),
  batch_size INTEGER,
  cycle_time_hours DECIMAL(6, 2),
  defect_count INTEGER,
  defect_rate DECIMAL(5, 2),
  production_date DATE,
  shift VARCHAR(20),
  supervisor_id INTEGER,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Quality Control Table
CREATE TABLE quality_control (
  qc_id INTEGER PRIMARY KEY,
  production_id INTEGER,
  inspection_date DATE,
  pass_count INTEGER,
  fail_count INTEGER,
  failure_reason VARCHAR(200),
  quality_score DECIMAL(5, 2),
  FOREIGN KEY (production_id) REFERENCES production(id)
);

-- Warehouses Table
CREATE TABLE warehouses (
  warehouse_id INTEGER PRIMARY KEY,
  warehouse_name VARCHAR(100),
  location VARCHAR(100),
  capacity INTEGER,
  current_inventory INTEGER,
  manager_id INTEGER
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Inventory
    grain: one row per product per warehouse
    description: >-
      Inventory levels across warehouses with stock status
      for supply chain and warehouse management.
    
    fields:
      - product_id, warehouse_id
      - quantity_on_hand (current stock)
      - quantity_reserved (committed)
      - reorder_level (minimum stock)
      - last_stock_date
    
    example_questions:
      - What products are low in stock?
      - Show me inventory by warehouse
      - Which products need reordering?
      - What is our total inventory value?
    
    use_cases: >-
      Inventory management and forecasting
      Warehouse capacity planning
      Stock-out prevention
      Supply chain optimization

  - name: Production
    grain: one row per production batch
    description: Production metrics with quality and efficiency data
    fields:
      - product_id, facility_id
      - cycle_time_hours (production time)
      - defect_count, defect_rate (quality)
      - production_date, batch_size
    
    example_questions:
      - What is the defect rate by facility?
      - Show me cycle time trends
      - Which facility is most efficient?
      - What is our production capacity?
    
    use_cases: >-
      Production efficiency tracking
      Quality control monitoring
      Capacity utilization planning
      Facility performance comparison
```

### 💬 Example Queries

```
"What products are low in stock?"
→ Shows products below reorder_level with urgency

"What is the defect rate by manufacturing facility?"
→ Facility A: 2.1%, Facility B: 3.5%, Facility C: 1.8%

"Show me average cycle time by product"
→ Product X: 4.2 hours, Product Y: 5.1 hours, Product Z: 3.8 hours

"Which facilities have the lowest quality?"
→ Ranking by defect rate and quality score

"What is our production capacity utilization?"
→ Current: 78%, Target: 85%

"Show me inventory status across all warehouses"
→ Warehouse 1: 85% full, Warehouse 2: 92% full, Warehouse 3: 65% full

"Which products need reordering?"
→ Shows items below reorder level with suggested order quantities

"What is our production cost per unit?"
→ Breakdown by product and facility

"Show me warehouse capacity by location"
→ Available space and utilization rates

"What is the trend in defect rates?"
→ Line chart showing improvement or decline over time
```

### 📈 Key Metrics Tracked

- **Inventory Levels**: Stock by product and warehouse
- **Defect Rate**: Quality percentage (lower is better)
- **Cycle Time**: Hours to produce one unit
- **Capacity Utilization**: % of available capacity used
- **Warehouse Capacity**: Used vs available space
- **Stock-out Risk**: Items near reorder level
- **Production Cost**: Per unit or batch
- **Efficiency Score**: Cycle time vs target
- **Quality Score**: Pass rate percentage

### 🔧 Configuration

```env
# .env.local for Operations Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=operations_db
SNOWFLAKE_SCHEMA=production
ALLOWED_SCHEMAS=production,inventory,quality
```

---

## 5️⃣ Financial & Compliance

### 🎯 Business Problem

Finance and Compliance teams need comprehensive expense tracking, budget monitoring, variance analysis, and audit reporting for fiscal responsibility and regulatory requirements.

### 📊 Database Schema

```sql
-- Expenses Table
CREATE TABLE expenses (
  expense_id INTEGER PRIMARY KEY,
  department VARCHAR(50),
  cost_center VARCHAR(50),
  category VARCHAR(50),
  amount DECIMAL(10, 2),
  expense_date DATE,
  vendor_id INTEGER,
  vendor_name VARCHAR(100),
  approved_by INTEGER,
  approval_date DATE,
  status VARCHAR(20),
  receipt_url VARCHAR(255)
);

-- Budget Table
CREATE TABLE budget (
  budget_id INTEGER PRIMARY KEY,
  department VARCHAR(50),
  cost_center VARCHAR(50),
  budget_year INTEGER,
  budget_quarter VARCHAR(10),
  budgeted_amount DECIMAL(12, 2),
  actual_amount DECIMAL(12, 2),
  variance DECIMAL(12, 2),
  variance_percent DECIMAL(5, 2)
);

-- Transactions Table
CREATE TABLE transactions (
  transaction_id INTEGER PRIMARY KEY,
  vendor_id INTEGER,
  vendor_name VARCHAR(100),
  amount DECIMAL(12, 2),
  transaction_date DATE,
  category VARCHAR(50),
  approval_status VARCHAR(20),
  compliance_flag BOOLEAN,
  notes TEXT
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  log_id INTEGER PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  action VARCHAR(50),
  user_id INTEGER,
  timestamp DATETIME,
  old_value TEXT,
  new_value TEXT
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Expenses
    grain: one row per expense
    description: >-
      Expense records with approval status and category classification
      for budget tracking and financial reporting.
    
    fields:
      - expense_id (unique identifier)
      - department, cost_center
      - category (type of expense)
      - amount (in USD)
      - expense_date
      - vendor_name
      - status (pending, approved, rejected)
    
    example_questions:
      - How much have we spent vs budget this quarter?
      - Show me expenses by cost center
      - Which departments are over budget?
      - What is our spending trend?
    
    use_cases: >-
      Budget variance analysis
      Expense category reporting
      Department cost tracking
      Compliance and audit reporting

  - name: Budget
    grain: one row per budget period
    description: Budget allocations and actual spending by department
    fields: [department, budget_year, budgeted_amount, actual_amount, variance]
    example_questions:
      - Which departments exceeded budget?
      - What is the variance percentage?
      - Show me budget vs actual by quarter
    use_cases: >-
      Financial forecasting
      Budget reallocation decisions
      Departmental accountability
```

### 💬 Example Queries

```
"How much have we spent vs budget this quarter?"
→ Budgeted: $5M, Actual: $4.8M, Variance: -3.8% (under budget)

"Show me expenses by cost center"
→ Breakdown of spending across all cost centers

"Which departments are over budget?"
→ Marketing: +5%, Operations: +2%, Others: on track

"What is our spending trend?"
→ Line chart showing monthly spend vs target

"Generate a compliance report"
→ Report of flagged transactions and exceptions

"Show me top vendors by spending"
→ Vendor ranking by total spend

"What is our headcount spend as % of revenue?"
→ Salary expense ratio analysis

"Show me category breakdown of expenses"
→ Pie chart: Salaries 60%, Tech 20%, Operations 15%, Other 5%

"Which transactions need approval?"
→ List of pending approval transactions

"Show me expense trends by department"
→ YoY comparison of spending by department
```

### 📈 Key Metrics Tracked

- **Budget Variance**: Actual vs budgeted amount
- **Department Spending**: Total by department
- **Cost Center Distribution**: Spending breakdown
- **Variance %**: Percentage over/under budget
- **Vendor Spending**: Top vendors by amount
- **Category Breakdown**: Spending by expense type
- **Approval Rate**: % of expenses approved
- **Compliance Exceptions**: Flagged transactions
- **Monthly Trend**: Spending over time

### 🔧 Configuration

```env
# .env.local for Finance Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=finance_db
SNOWFLAKE_SCHEMA=accounting
ALLOWED_SCHEMAS=accounting,budget,audit
```

---

## 6️⃣ Marketing & Growth

### 🎯 Business Problem

Marketing teams need data on campaign performance, lead quality, conversion funnel, customer acquisition cost, and lifetime value to optimize marketing spend and growth strategy.

### 📊 Database Schema

```sql
-- Campaigns Table
CREATE TABLE campaigns (
  campaign_id INTEGER PRIMARY KEY,
  campaign_name VARCHAR(100),
  campaign_type VARCHAR(50),
  channel VARCHAR(50),
  launch_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  spend DECIMAL(10, 2),
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  revenue DECIMAL(12, 2),
  owner_id INTEGER
);

-- Leads Table
CREATE TABLE leads (
  lead_id INTEGER PRIMARY KEY,
  lead_name VARCHAR(100),
  email VARCHAR(100),
  source VARCHAR(50),
  campaign_id INTEGER,
  created_date DATE,
  status VARCHAR(20),
  estimated_value DECIMAL(10, 2),
  converted_date DATE,
  qualified BOOLEAN,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Customers Table
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  customer_name VARCHAR(100),
  email VARCHAR(100),
  acquisition_source VARCHAR(50),
  acquisition_campaign_id INTEGER,
  acquisition_date DATE,
  lifetime_value DECIMAL(12, 2),
  total_purchases INTEGER,
  last_purchase_date DATE,
  customer_segment VARCHAR(50),
  FOREIGN KEY (acquisition_campaign_id) REFERENCES campaigns(id)
);

-- Funnel Table
CREATE TABLE funnel (
  funnel_id INTEGER PRIMARY KEY,
  campaign_id INTEGER,
  stage VARCHAR(50),
  stage_order INTEGER,
  count INTEGER,
  conversion_rate DECIMAL(5, 2),
  average_time_in_stage_days INTEGER,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

### 🗂️ Semantic Catalog

```yaml
entities:
  - name: Campaigns
    grain: one row per campaign
    description: >-
      Marketing campaigns with performance metrics, spend tracking,
      and ROI calculation for campaign management and optimization.
    
    fields:
      - campaign_id (unique identifier)
      - campaign_name
      - channel (email, social, paid search, etc)
      - budget, spend
      - impressions, clicks, conversions
      - revenue (generated revenue)
    
    example_questions:
      - What is ROI by marketing channel?
      - Which campaigns have the highest ROI?
      - Show me cost per acquisition by channel?
      - What is our conversion rate?
    
    use_cases: >-
      Campaign performance analysis
      Marketing spend optimization
      Channel effectiveness comparison
      ROI tracking and reporting

  - name: Leads
    grain: one row per lead
    description: Lead records with source and conversion data
    fields:
      - lead_id, lead_name
      - source (campaign, referral, organic)
      - status (open, qualified, converted, lost)
      - estimated_value, converted_date
    
    example_questions:
      - Which lead sources convert best?
      - What is our lead conversion rate?
      - Show me leads by source and status
    
    use_cases: >-
      Lead quality analysis
      Source attribution
      Conversion funnel tracking

  - name: Customers
    grain: one row per customer
    description: Customer records with acquisition and lifetime value
    fields:
      - customer_id, customer_name
      - acquisition_source, acquisition_date
      - lifetime_value (total revenue from customer)
      - customer_segment
    
    example_questions:
      - What is our customer lifetime value by source?
      - Which acquisition channels have highest LTV?
      - Show me customer segments by value
    
    use_cases: >-
      Customer segmentation
      LTV analysis by channel
      Acquisition channel comparison
```

### 💬 Example Queries

```
"What is ROI by marketing channel?"
→ Email: 420% ROI, Social: 350%, Paid Search: 280%

"Which campaigns have the highest ROI?"
→ Campaign ranking by return on investment

"Show me cost per acquisition by channel"
→ Email: $15 CPA, Social: $25 CPA, Paid Search: $45 CPA

"What is our conversion rate?"
→ Overall: 3.2%, Email: 4.5%, Social: 2.8%, Search: 3.1%

"Show me conversion funnel"
→ Awareness: 10,000 → Interest: 5,000 → Decision: 1,200 → Purchase: 300

"Which lead sources convert best?"
→ Referral: 8%, Direct: 5%, Paid: 3%, Organic: 4%

"What is our customer lifetime value by acquisition source?"
→ Referral: $2,500, Direct: $1,800, Paid: $1,200, Organic: $1,500

"Show me CAC payback period by channel"
→ Email: 2 months, Social: 4 months, Search: 6 months

"Which campaigns need optimization?"
→ List underperforming campaigns with recommendations

"Show me customer segments by lifetime value"
→ High Value: 15%, Medium: 45%, Low: 40%
```

### 📈 Key Metrics Tracked

- **CAC**: Customer Acquisition Cost per channel
- **LTV**: Lifetime Value of customer
- **ROI**: Return on Investment percentage
- **Conversion Rate**: % of leads that convert
- **Cost Per Lead**: Amount spent to acquire each lead
- **Channel Performance**: Effectiveness of each channel
- **Payback Period**: Time to recover acquisition cost
- **ROAS**: Return on Ad Spend
- **Lead Quality**: Score or status of leads

### 🔧 Configuration

```env
# .env.local for Marketing Use Case
OPENAI_API_KEY=sk-your-key
SNOWFLAKE_DATABASE=marketing_db
SNOWFLAKE_SCHEMA=campaigns
ALLOWED_SCHEMAS=campaigns,leads,customers,funnel
```

---

## 🚀 Quick Reference: Choose Your Use Case

| Use Case | Best For | Key Tables | Main Questions |
|----------|----------|-----------|-----------------|
| **Sales** | Revenue insights | sales, products | Revenue by region? Top products? |
| **HR** | People analytics | employees, teams | Headcount by level? Salary ranges? |
| **Customer Success** | Account health | accounts, contracts | At-risk accounts? MRR growth? |
| **Operations** | Production quality | inventory, production | Defect rates? Capacity usage? |
| **Finance** | Budget tracking | expenses, budget | Budget variance? Spending trends? |
| **Marketing** | Campaign ROI | campaigns, leads, customers | CAC? LTV? Conversion rate? |

---

## 📚 Additional Resources

- [Connection Guide](./CONNECTION_GUIDE.md) - Step-by-step database setup
- [Main README](./README.md) - Project overview
- [Configuration Guide](./CONNECTION_GUIDE.md#-configuration-examples) - Database configs

---

## 🤝 Need Help?

- **Not sure which use case applies?** - Read the Business Problem section
- **Want to customize?** - Use the Database Schema as a template
- **Need example data?** - Modify the seed script in `scripts/seed-database.ts`
- **Connection issues?** - Check [Troubleshooting Guide](./CONNECTION_GUIDE.md#-troubleshooting)

---

**Start analyzing your data now! 🚀**

Pick your use case above, set up your database, and ask your first question to the agent!
