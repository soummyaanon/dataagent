# Data Agent - AI-Powered Data Science Agent

Data Agent is an intelligent AI agent that converts natural language questions into SQL queries and provides data analysis. Built with the Vercel AI SDK, it features multi-phase reasoning (planning, building, execution, reporting) and streams results in real-time.

## Features

- **Multi-Phase AI Agent**: Planning → Building → Execution → Reporting workflow
- **Real-time Streaming**: Live updates during query processing
- **Smart Data Analysis**: Automated insights and visualizations
- **Chart Generation**: AI-powered automatic chart creation (bar, line, pie, scatter, area charts)
- **Interactive Visualizations**: Charts rendered on interactive canvas with drag-and-drop
- **Dark Mode**: Beautiful dark theme with persistent preferences
- **SQL Validation**: Syntax checking and security policy enforcement
- **Natural Language**: Ask questions in plain English
- **Modern UI**: Built with Next.js 16, React 19, and TailwindCSS v4
- **Extensible Tools**: Easy to add custom tools and capabilities

## 📖 Documentation

- **[Quick Start](#quick-start)** - Get running in 5 minutes
- **[Connection Guide](./CONNECTION_GUIDE.md)** - Connect your database & use cases
- **[Database Setup](#using-with-production-databases)** - Production database configuration

## Quick Start

### Prerequisites

- Node.js 20.19.3+
- pnpm 8.15.0+
- AI Gateway API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd dataagent
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   ```
   Edit `.env.local` and add your Vercel AI Gateway key

4. **Initialize the database**
   ```bash
   pnpm initDatabase
   ```
   This creates a SQLite database with sample data (Companies, People, Accounts)

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## Database Schema

This application includes a database schema with three main entities:

### **Companies**
Represents organizations in your database. Each company has:
- Basic information (name, industry, employee count)
- Business metrics (founded date, status)
- Example: Technology companies, Healthcare organizations, etc.

### **Accounts**
Represents customer accounts or subscriptions tied to companies. Each account includes:
- Account identification (account number, status)
- Financial metrics (monthly recurring value, contract details)
- Relationship to parent company
- Example: Active subscriptions with monthly values ranging from $10k-$50k

### **People**
Represents individual employees or contacts within companies. Each person has:
- Personal information (name, email)
- Employment details (department, title, salary)
- Relationship to their company
- Example: Engineers, Sales representatives, Managers across different departments


## How It Works

Data Agent uses a multi-phase agentic workflow:

1. **Planning Phase**
   - Analyzes natural language query
   - Searches semantic catalog for relevant entities
   - Identifies required data and relationships
   - Generates execution plan

2. **Building Phase**
   - Constructs SQL query from plan
   - Validates syntax and security policies
   - Optimizes query structure
   - Finds join paths between tables

3. **Execution Phase**
   - Estimates query cost
   - Executes SQL against database
   - Handles errors with automatic repair
   - Streams results

4. **Reporting Phase**
   - Formats query results
   - Generates visualizations (charts, tables)
   - Provides natural language explanations
   - Performs sanity checks on data

## Extending Data Agent

### Customizing Prompts

Modify system prompts in `src/lib/prompts/`:
- `planning.ts` - Planning phase behavior
- `building.ts` - SQL generation logic
- `execution.ts` - Query execution handling
- `reporting.ts` - Results interpretation

## Example Queries

Try asking Data Agent (using your database):

- "How many companies are in the Technology industry?"
- "What is the average salary by department?"
- "Show me the top 5 accounts by monthly value"
- "Which companies have the most employees?"
- "What is the total revenue for Active accounts?"
- "How many people work in Engineering?"

## Using with Production Databases

The default setup uses SQLite for demonstration. To use with Snowflake or other databases:

1. Update `src/lib/agent.ts` to import from `./tools/execute` instead of `./tools/execute-sqlite`
2. Configure your database credentials in `.env.local`
3. Update the semantic catalog in `src/lib/semantic/` with your schema definitions

## Troubleshooting

**Database Not Found**
- Run `pnpm initDatabase` to create and seed the database
- Check that `data/data-agent.db` exists (or your configured database)

**AI Gateway API Errors**
- Verify your API key is valid in `.env.local`
- Check API rate limits and credits

**Build Errors**
- Run `pnpm install`