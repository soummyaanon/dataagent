# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered data science agent that converts natural language questions into SQL queries and provides intelligent data analysis. Built with the Vercel AI SDK, it features a multi-phase agentic workflow (Planning → Building → Execution → Reporting) with real-time streaming results.

**Tech Stack**: Next.js 16, React 19, TypeScript, Vercel AI SDK, Drizzle ORM
**Database Support**: SQLite (default/demo), Snowflake (production), PostgreSQL, MySQL
**Package Manager**: pnpm 8.15.0+
**Node Version**: 20.19.3+

## Common Development Commands

```bash
# Development
pnpm dev                    # Start dev server on port 3000
pnpm dev:tunnel             # Start with ngrok tunnel
pnpm dev:slack              # Start Slack bot integration

# Database
pnpm initDatabase           # Initialize SQLite database with sample data
pnpm db:generate            # Generate Drizzle schema migrations
pnpm db:push                # Push schema changes to database

# Build & Quality
pnpm build                  # Build for production
pnpm start                  # Run production build
pnpm lint                   # Run ESLint
pnpm type-check             # Run TypeScript compiler checks

# Testing & Evaluation
pnpm eval:dev               # Watch mode for evalite test runs
```

## Architecture

### Multi-Phase Agent Workflow

The application implements a sophisticated agentic workflow orchestrated in `src/lib/agent.ts`. The agent automatically transitions through four distinct phases:

1. **Planning Phase** (`src/lib/prompts/planning.ts`)
   - Searches the semantic catalog to find relevant entities
   - Loads entity definitions from `src/semantic/entities/*.yml`
   - Assesses whether the question can be answered with available data
   - Produces a structured plan identifying which entities/fields to use
   - **Key Tools**: `SearchCatalog`, `ReadEntityYamlRaw`, `LoadEntitiesBulk`, `AssessEntityCoverage`, `FinalizePlan`
   - **Transition**: Calls `FinalizePlan` to move to Building phase

2. **Building Phase** (`src/lib/prompts/building.ts`)
   - Constructs SQL query from the plan
   - Validates SQL syntax and security policies
   - Computes join paths between entities using BFS algorithm (`src/lib/sql/joins.ts`)
   - Enforces schema-level security via `ALLOWED_SCHEMAS` environment variable
   - **Key Tools**: `BuildSQL`, `ValidateSQL`, `FinalizeBuild`
   - **Transition**: Calls `FinalizeBuild` to move to Execution phase

3. **Execution Phase** (`src/lib/prompts/execution.ts`)
   - Estimates query cost before execution
   - Executes SQL with automatic error repair if needed
   - Handles database connection and query execution
   - **Key Tools**: `EstimateCost`, `ExecuteSQLWithRepair`
   - **Transition**: Successful execution moves to Reporting phase

4. **Reporting Phase** (`src/lib/prompts/reporting.ts`)
   - Formats query results into tables/JSON
   - Generates visualizations (charts) using Vega-Lite
   - Performs sanity checks on data quality
   - Provides natural language explanations
   - **Key Tools**: `FormatResults`, `SanityCheck`, `ExplainResults`, `generateBarChart`, `generateLineChart`, `FinalizeReport`

**Phase Management**: The `prepareStep` function in `src/lib/agent.ts` detects phase transitions by checking which finalization tools have been called, and dynamically swaps system prompts and available tools for each phase.

### Semantic Layer System

The semantic layer is the intelligence layer that maps business concepts to database schemas:

**Location**: `src/semantic/`
- `catalog.yml` - High-level entity index with descriptions, example questions, and use cases
- `entities/*.yml` - Detailed entity definitions with dimensions, measures, metrics, and join relationships

**Entity Definition Structure**:
```yaml
name: EntityName
type: fact_table | dimension_table
table: schema.table_name
grain: "one row per X"
description: "Business description"

dimensions:      # Attributes (text, numbers, dates)
  - name: field_name
    sql: column_name
    type: string | number | time
    description: "Field description"

measures:        # Aggregatable numeric fields
  - name: measure_name
    sql: SUM(column) or COUNT(*) etc.
    type: sum | count | avg | min | max
    description: "Measure description"

metrics:         # Pre-defined business calculations
  - name: metric_name
    sql: complex calculation
    description: "Metric definition"

joins:           # Relationships to other entities
  - target_entity: OtherEntity
    relationship: one_to_many | many_to_one | one_to_one
    join_columns:
      from: this_table_column
      to: other_table_column
```

**Join Path Resolution**: The system automatically finds the shortest path between entities using BFS graph traversal (`src/lib/sql/joins.ts`), enabling queries across multiple related entities without manual join specification.

### Database Switching (SQLite ↔ Snowflake)

The codebase is configured for **SQLite by default** (demo/development) but designed for **Snowflake in production**:

**To switch from SQLite to Snowflake**:
1. Edit `src/lib/agent.ts`:
   - Replace `import { BuildSQL, FinalizeBuild, ValidateSQL } from "./tools/building-sqlite"`
   - With `import { BuildSQL, FinalizeBuild, ValidateSQL } from "./tools/building"`
   - Replace `import { EstimateCost, ExecuteSQL, ExecuteSQLWithRepair } from "./tools/execute-sqlite"`
   - With `import { EstimateCost, ExecuteSQL, ExecuteSQLWithRepair } from "./tools/execute"`

2. Configure Snowflake credentials in `.env.local`:
   ```env
   SNOWFLAKE_ACCOUNT=your_account.region
   SNOWFLAKE_USERNAME=your_username
   SNOWFLAKE_PASSWORD=your_password
   SNOWFLAKE_ROLE=your_role
   SNOWFLAKE_WAREHOUSE=your_warehouse
   SNOWFLAKE_DATABASE=your_database
   SNOWFLAKE_SCHEMA=your_schema
   ALLOWED_SCHEMAS=analytics,crm  # Security whitelist
   ```

3. Update semantic layer entity definitions to use fully-qualified Snowflake table names (e.g., `analytics.companies` instead of `main.companies`)

**SQLite-specific files**: `src/lib/tools/execute-sqlite.ts`, `src/lib/tools/building-sqlite.ts`, `src/lib/sqlite.ts`
**Snowflake-specific files**: `src/lib/tools/execute.ts`, `src/lib/tools/building.ts`, `src/lib/snowflake.ts`, `src/services/snowflake_client.ts`

### Security Model

**Schema-level enforcement** (`src/lib/security/policy.ts`):
- Environment variable `ALLOWED_SCHEMAS` (comma-separated list) defines permitted database schemas
- All entity table references are validated against this whitelist
- SQL validation rejects queries accessing non-whitelisted schemas
- Default allowed schemas: `analytics,crm,main`

**SQL Validation** (`src/lib/sql/validate.ts`):
- Uses `node-sql-parser` to parse and validate SQL syntax
- Prevents execution of non-SELECT statements (no INSERT/UPDATE/DELETE)
- Checks table references against security policy

## Project Structure

```
src/
├── app/api/chat/route.ts          # Main API endpoint for agent chat
├── lib/
│   ├── agent.ts                   # Core agent orchestration & phase management
│   ├── prompts/                   # System prompts for each phase
│   │   ├── planning.ts
│   │   ├── building.ts
│   │   ├── execution.ts
│   │   └── reporting.ts
│   ├── tools/                     # AI SDK tool definitions for each phase
│   │   ├── planning.ts            # Semantic search & catalog tools
│   │   ├── building.ts            # SQL generation tools (Snowflake)
│   │   ├── building-sqlite.ts     # SQL generation tools (SQLite)
│   │   ├── execute.ts             # Query execution tools (Snowflake)
│   │   ├── execute-sqlite.ts      # Query execution tools (SQLite)
│   │   ├── reporting.ts           # Formatting & explanation tools
│   │   └── visualization-tools.ts # Chart generation tools
│   ├── semantic/                  # Semantic layer I/O & validation
│   │   ├── io.ts                  # YAML loading & caching
│   │   ├── schemas.ts             # Zod validation schemas
│   │   └── types.ts               # TypeScript types
│   ├── sql/                       # SQL utilities
│   │   ├── joins.ts               # BFS join path algorithm
│   │   ├── validate.ts            # SQL validation & security
│   │   └── macros.ts              # SQL macro substitution
│   ├── security/policy.ts         # Schema-level security enforcement
│   └── reporting/                 # Result processing
│       ├── viz.ts                 # Vega-Lite visualization generation
│       ├── sanity.ts              # Data quality checks
│       └── csv.ts                 # CSV export utilities
├── semantic/                      # Semantic layer definitions (YAML)
│   ├── catalog.yml                # Entity catalog index
│   └── entities/                  # Individual entity definitions
│       ├── Company.yml
│       ├── People.yml
│       └── Accounts.yml
├── components/                    # React components
│   ├── chat/                      # Chat UI components
│   ├── canvas/                    # Visualization canvas
│   ├── charts/                    # Chart rendering components
│   └── ai-elements/               # AI SDK UI elements
└── types/                         # Shared TypeScript types
    ├── chat.ts
    ├── stream.ts
    └── visualization.ts

scripts/
├── init-database.ts               # Create SQLite database schema
└── seed-database.ts               # Populate with sample data
```

## Development Workflow

### Adding New Database Connections

See `CONNECTION_GUIDE.md` for detailed instructions on connecting Snowflake, PostgreSQL, or other databases.

### Extending the Semantic Layer

To add new entities (tables) to the data model:

1. Create a new YAML file in `src/semantic/entities/YourEntity.yml` following the structure in existing entity files
2. Add an entry to `src/semantic/catalog.yml` with entity name, description, example questions, and use cases
3. Define dimensions (attributes), measures (aggregations), and joins (relationships) in the entity YAML
4. Run `pnpm dev` - the semantic layer is hot-reloaded and cached automatically

**Key Considerations**:
- Use fully-qualified table names (e.g., `schema.table`) for Snowflake
- Define join relationships bidirectionally when entities reference each other
- Keep descriptions concise but informative - they're sent to the LLM
- Add example questions that guide the planning phase

### Customizing AI Behavior

**System Prompts**: Edit files in `src/lib/prompts/` to modify agent behavior:
- `planning.ts` - How the agent searches and selects entities
- `building.ts` - SQL generation style and validation logic
- `execution.ts` - Query execution and error handling strategy
- `reporting.ts` - Result interpretation and visualization preferences

**Tools**: Add new tools in `src/lib/tools/` and register them in `src/lib/agent.ts`:
- Define tool using `tool()` from `ai` package
- Add input schema validation with Zod
- Implement `execute` function
- Register in phase-specific `activeTools` array in `prepareStep`

### Testing with Sample Queries

The codebase includes verified query examples in `src/lib/sample-queries.ts` that are injected into the planning phase prompt. These serve as few-shot examples to improve query accuracy.

## Important Implementation Details

### Path Aliasing

The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`
- `@/types/*` → `src/types/*`
- `@/hooks/*` → `src/hooks/*`

Always use these aliases in imports rather than relative paths.

### Streaming Response Pattern

The agent uses Vercel AI SDK's streaming capabilities:
- `streamText()` returns a stream that's converted to UI messages via `toUIMessageStreamResponse()`
- Agent state (tool calls, reasoning) streams to client in real-time
- Phase transitions and tool calls are logged via `onStepFinish` callback

### Entity Caching

The semantic layer implements a caching strategy in `src/lib/semantic/io.ts`:
- Entity YAML files are parsed once and cached in-memory
- Catalog is loaded once per server process
- Cache is automatically invalidated on file changes in development

### Next.js 16 Specific

This project uses Next.js 16 with:
- React Server Components (RSC) by default
- `verbatimModuleSyntax: true` in tsconfig.json
- Tailwind CSS v4 via `@tailwindcss/postcss`
- App Router (`src/app/`)

When adding new API routes, use `export const runtime = "nodejs"` to ensure Node.js runtime for database connections.
