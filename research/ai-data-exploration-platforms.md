# AI-Powered Data Exploration Platforms — Research for Livepeer Explorer

**Date:** March 2026
**Context:** Research into platforms that use AI/natural language interfaces to provide customizable dashboard experiences, relevant to extending the Livepeer Explorer with a "Data Tab" or chat-based data exploration feature.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Blockchain / Web3 Analytics Platforms](#blockchain--web3-analytics-platforms)
3. [Enterprise BI Platforms with AI](#enterprise-bi-platforms-with-ai)
4. [AI-Native Analytics Startups](#ai-native-analytics-startups)
5. [Key Patterns & Takeaways for Livepeer Explorer](#key-patterns--takeaways-for-livepeer-explorer)

---

## Executive Summary

The convergence of AI and data analytics has accelerated dramatically in 2024–2026. Platforms across both blockchain and traditional BI are adopting **natural language querying (NLQ)** — allowing users to ask questions in plain English and receive structured data, charts, and insights in return. This is enabled by:

- **Text-to-SQL / Text-to-GraphQL** — LLMs translate natural language into database queries
- **AI chat interfaces** — conversational UIs layered on top of existing data warehouses
- **Auto-visualization** — AI selects the right chart type and renders it from query results
- **Agentic data workflows** — AI agents that autonomously fetch, transform, and analyze data

For Livepeer Explorer, the most relevant pattern is blockchain explorers and analytics tools that combine **subgraph/on-chain data + AI chat** to let stakeholders self-serve insights without needing to write GraphQL or SQL.

---

## Blockchain / Web3 Analytics Platforms

### 1. Dune Analytics — Dune AI

- **What it does:** Dune is the leading community-driven blockchain analytics platform. Dune AI lets users generate SQL queries from natural language prompts, turning questions like "show me daily Uniswap volume on Arbitrum" into executable queries against Dune's data warehouse.
- **AI features:** Natural language to SQL generation, AI-assisted query debugging, AI-suggested visualizations.
- **User interaction:** Chat-like prompt box → generates SQL → runs against DuneSQL engine → renders dashboard widgets (charts, tables, counters).
- **Unique approach:** Community-powered — anyone can create and fork dashboards. Dune AI lowers the barrier for non-SQL users to participate.
- **Relevance to Livepeer:** Dune already has Livepeer dashboards. An AI layer on the Explorer could complement this by offering real-time, protocol-specific queries without leaving the Explorer.

### 2. DefiLlama — LlamaAI

- **What it does:** LlamaAI (launched Nov 2025) is an AI research assistant for DeFi that lets users query DefiLlama's entire dataset (6,000+ protocols, 400+ chains) using plain English.
- **AI features:** Natural language → structured query, auto-generated charts and ranked tables, real-time web search integration, source tracking to minimize hallucinations.
- **User interaction:** Chat interface where users type questions → LlamaAI returns data tables, charts, and structured insights with downloadable CSV exports.
- **Unique approach:** Extensively fine-tuned to minimize hallucinations. Data-first output — the AI "spits out data" rather than prose, reducing error risk. Available to LlamaPro subscribers.
- **Relevance to Livepeer:** This is the closest model to what Livepeer could build — a protocol-specific AI that knows the data schema and can answer staking, orchestrator, and usage questions conversationally.

### 3. Allium — Allium AI

- **What it does:** Enterprise blockchain data platform covering 150+ chains. Allium AI turns plain English questions into SQL queries that run against verified, curated blockchain schemas.
- **AI features:** Text-to-SQL across all supported chains, AI assistant for analytics/engineering/accounting teams, MCP Server for AI agents to query blockchain data via structured tool calls.
- **User interaction:** Chat-based querying + API-first for AI agents. Data delivery to Snowflake, BigQuery, Databricks, and AWS S3.
- **Unique approach:** Enterprise-grade verified schemas — trusted by a16z, MetaMask, Uniswap, Visa, Stripe. Focus on "AI-ready" data: reconciled, normalized, temporally consistent data that AI can safely reason over.
- **Relevance to Livepeer:** The concept of "AI-ready data" is key — Livepeer's subgraph data would need to be structured in a way that an AI can reliably query it.

### 4. Space and Time (SxT) — Houston AI Chatbot

- **What it does:** Decentralized data warehouse with a GPT-4-powered chatbot called "Houston" that converts natural language to SQL queries.
- **AI features:** Prompt-to-SQL, natural language exploration of blockchain data, Proof of SQL (ZK proofs ensuring queries and results haven't been tampered with).
- **User interaction:** Users type plain English questions → Houston converts to SQL → runs against SxT warehouse → returns verified results.
- **Unique approach:** **Proof of SQL** — ZK proofs that cryptographically verify query results are tamperproof. Integrated with Microsoft Azure Marketplace and Chainlink for enterprise adoption.
- **Relevance to Livepeer:** The verifiability angle aligns with Livepeer's decentralized ethos. Could be interesting to provide provably correct query results.

### 5. Chainbase — Theia AI Assistant

- **What it does:** Hyperdata network for AI that indexes 200+ blockchains. Theia AI assistant enables natural language queries against on-chain data.
- **AI features:** Theia AI assistant for NLQ, open-source crypto-focused LLM (Theia-Llama-3.1-8B), ElizaOS plugin for AI agent integration, "Tops" product for AI-summarized trending crypto data.
- **User interaction:** Chat-based queries, AI agent integration via plugins, real-time trend summaries.
- **Unique approach:** Open-source, crypto-specialized LLM. DataFi ecosystem for data monetization. Agentics layer connecting data to intelligent agents.
- **Relevance to Livepeer:** The open-source LLM approach is interesting — Livepeer could potentially fine-tune a model on its own protocol data for more accurate responses.

### 6. Nansen

- **What it does:** On-chain analytics platform known for wallet labeling and smart money tracking.
- **AI features:** AI-powered wallet insights, smart money alerts, automated portfolio analysis.
- **User interaction:** Dashboard-based with AI-enhanced insights and alerts.
- **Unique approach:** Labels millions of wallets with entity identification, enabling "follow the smart money" narratives.

### 7. Arkham Intelligence

- **What it does:** Blockchain intelligence platform focused on entity attribution and on-chain investigation.
- **AI features:** AI-powered entity identification, automated transaction tracing, network graph visualization with AI-driven pattern detection.
- **User interaction:** Visual graph explorer with search and AI-enhanced entity resolution.
- **Unique approach:** De-anonymization engine that attributes blockchain addresses to real-world entities.

### 8. Defined.fi

- **What it does:** Real-time analytics and trading terminal supporting 48+ blockchains with customizable "Boards."
- **AI features:** Modular, customizable dashboard experience via shareable "Boards."
- **User interaction:** Fully customizable trading terminal with token charts, wallet tracking, limit orders, and Telegram bot integration.
- **Unique approach:** Gamification layer (DefinedXP) with XP, badges, and leaderboards. Revenue sharing — 30% of trading fees distributed to badge holders.
- **Relevance to Livepeer:** The "Boards" concept (customizable, shareable dashboard layouts) is a strong UX pattern for a data tab.

### 9. Bitquery

- **What it does:** Blockchain data APIs for 40+ chains via GraphQL, WebSockets, SQL, and cloud integrations.
- **AI features:** AI agent integration for natural language queries via Slack (through third-party tools like Runbear), real-time data streams for powering AI models.
- **User interaction:** API-first with GraphQL IDE. AI integration via third-party connectors.
- **Unique approach:** Cross-chain normalized GraphQL API. Streaming architecture for low-latency monitoring.

---

## Enterprise BI Platforms with AI

These platforms demonstrate mature patterns for natural language data exploration that could inform Livepeer Explorer's approach.

### 10. ThoughtSpot — Sage AI

- **What it does:** AI-powered analytics platform built around natural language search from day one.
- **AI features:** Sage AI uses LLMs to understand complex questions, generate queries, and create visualizations. Supports follow-up questions in conversational context.
- **User interaction:** Search bar where users type questions in natural language → instant charts and tables. "SpotIQ" for AI-driven anomaly detection.
- **Unique approach:** Pioneer of search-driven analytics. Embedding-first approach — companies can embed ThoughtSpot's NLQ directly into their own products.
- **Relevance to Livepeer:** ThoughtSpot's embeddable search component could be a model for how a "Data Tab" search bar works within the Explorer.

### 11. Microsoft Power BI — Copilot

- **What it does:** Industry-leading BI tool, now with Copilot AI integration across the entire report creation workflow.
- **AI features:** Natural language report generation, AI-powered Q&A visual, Copilot for creating measures/DAX formulas, narrative summaries of data, and quick insights.
- **User interaction:** Chat sidebar within Power BI Desktop/Service → Copilot generates visuals, writes DAX, summarizes pages, and creates entire report pages from prompts.
- **Unique approach:** Deep integration with Microsoft 365 ecosystem. Copilot can create full report pages from a single prompt.

### 12. Tableau — Tableau AI (Einstein)

- **What it does:** Tableau has integrated Salesforce Einstein AI for natural language querying, automated insights, and predictive analytics.
- **AI features:** "Ask Data" for natural language queries, Einstein Discovery for predictions and recommendations, AI-generated explanations of data patterns.
- **User interaction:** Type questions in plain language → Tableau generates the right visualization. AI highlights interesting patterns automatically.
- **Unique approach:** Combines descriptive analytics (what happened) with predictive (what will happen) and prescriptive (what to do) AI.

### 13. Databricks — AI/BI Dashboards & Genie

- **What it does:** Unified data lakehouse platform with AI/BI dashboard capabilities and "Genie" AI assistant.
- **AI features:** Genie converts natural language questions to SQL queries against the lakehouse. Mosaic AI for automated insights and forecasting. AI-generated dashboard creation.
- **User interaction:** Chat-based Genie interface → generates SQL → runs against lakehouse → renders visualizations.
- **Unique approach:** Unified platform spanning data engineering, ML, and BI. Genie leverages the enterprise's own data models for context-aware answers.

### 14. Snowflake — Cortex AI

- **What it does:** Cloud data platform with Cortex AI for natural language data access.
- **AI features:** Cortex Analyst converts natural language to SQL, Cortex Search for semantic search across unstructured data, built-in LLM functions (summarize, sentiment, translate).
- **User interaction:** Chat interface within Snowflake's UI or via API → Cortex generates and executes SQL → returns structured results.
- **Unique approach:** Runs AI directly on data within Snowflake — no data movement required. Enterprise security and governance built in.

### 15. Hex — Magic AI

- **What it does:** Collaborative data workspace combining SQL, Python, and no-code tools with AI assistant.
- **AI features:** Hex Magic generates SQL and Python code from natural language, auto-creates visualizations, explains existing code, and debugs errors.
- **User interaction:** Notebook-style interface with AI chat sidebar. Real-time multiplayer editing (added 2025).
- **Unique approach:** Bridges the gap between SQL/Python notebooks and dashboards. AI assists both technical and non-technical users.

---

## AI-Native Analytics Startups

These are newer, chat-first platforms purpose-built for AI-driven data exploration.

### 16. Julius AI

- **What it does:** AI-powered data analysis platform where users upload data or connect sources and ask questions in natural language.
- **AI features:** Natural language data analysis, auto-visualization, statistical modeling, handles 8–32GB datasets.
- **User interaction:** Chat-first interface → upload CSV/connect to Snowflake/BigQuery → ask questions → get charts, tables, and analysis in a notebook view.
- **Unique approach:** Bridges conversational analytics with notebook-style transparency — users see the analysis steps and can edit/reuse them. Starting at $29/month.

### 17. Vanna AI

- **What it does:** Open-source text-to-SQL tool that lets you chat with your database using RAG (Retrieval Augmented Generation).
- **AI features:** Trains on your specific database schema for accurate text-to-SQL generation. Vanna 2.0 (late 2025) introduced an agent-based architecture with user-aware components and row-level security.
- **User interaction:** Chat interface → type question → Vanna generates SQL → executes → shows results and visualization.
- **Unique approach:** Open-source and self-hostable. RAG-based approach where the model learns your specific schema, improving accuracy over generic LLMs. Enterprise security with audit logging in v2.0.
- **Relevance to Livepeer:** Vanna's open-source, self-hosted approach could work well for Livepeer — train it on the subgraph schema and Livepeer-specific data models.

### 18. Chat2DB

- **What it does:** AI-powered SQL client that converts natural language to SQL across multiple database types (MySQL, Redis, MongoDB, etc.).
- **AI features:** Text-to-SQL, BI visualization features, multi-database support.
- **User interaction:** Desktop SQL client with integrated AI chat for query generation.
- **Unique approach:** Broad database compatibility including both SQL and NoSQL databases.

### 19. AI2SQL

- **What it does:** One of the first natural-language-to-SQL generators, with a comprehensive toolkit.
- **AI features:** SQL generator, fixer, validator, syntax checker, explainer, formatter. Multi-language support (9 languages). ER diagram generator.
- **User interaction:** Web interface + integrations with Slack, VS Code, Chrome, and ChatGPT plugin.
- **Unique approach:** Breadth of integrations and supplementary tools beyond just query generation.

---

## Key Patterns & Takeaways for Livepeer Explorer

### Common Architectural Patterns

| Pattern | Description | Examples |
|---------|-------------|---------|
| **Chat Sidebar** | A persistent chat panel alongside existing dashboard views | Power BI Copilot, Hex Magic, Databricks Genie |
| **Search Bar NLQ** | A prominent search box for natural language queries on the main page | ThoughtSpot Sage, Dune AI |
| **Dedicated AI Page** | A separate page/tab for AI-powered exploration | DefiLlama LlamaAI (`/ai`), Space and Time Houston |
| **AI-Generated Dashboards** | AI creates entire dashboard layouts from descriptions | Power BI Copilot, Tableau AI |
| **Customizable Boards** | Users build and share modular dashboard layouts | Defined.fi Boards |

### Recommendations for Livepeer Explorer

Based on this research, here are the most relevant approaches for adding AI-powered data exploration to the Livepeer Explorer:

#### 1. **Chat-Based Data Tab (Most Aligned)**
Add a new "Data" or "Insights" tab with a chat interface where stakeholders can ask questions like:
- "What is the current participation rate trend over the last 30 days?"
- "Which orchestrators have the highest performance scores in the US-East region?"
- "Show me the total fees earned by orchestrators this round"
- "Compare AI pipeline latency across regions"

**Implementation approach:**
- Use an LLM (Claude, GPT-4, or an open-source model) with the Livepeer subgraph schema as context
- The LLM translates natural language → GraphQL queries against the Livepeer subgraph
- Results are auto-visualized using the existing Recharts/Lightweight Charts setup
- Add pre-built "suggested questions" for common stakeholder queries

#### 2. **Data Sources to Expose**
The Explorer already aggregates data from multiple sources that could power the AI:
- **The Graph subgraph** — protocol metrics, orchestrator data, delegator data, events
- **RPC endpoints** — current blockchain state (Arbitrum/Ethereum)
- **Livepeer.com Usage API** — volume metrics, fee-derived minutes
- **Performance/metrics servers** — regional AI and transcoding performance scores
- **Smart contracts** — on-chain state (BondingManager, TicketBroker, etc.)

#### 3. **Reducing Hallucinations (Key Lesson)**
Following DefiLlama's approach:
- Make the AI output structured data (tables, charts) rather than prose
- Ground responses in actual query results — show the underlying data
- Add source tracking so users can verify the AI's answers
- Fine-tune or provide extensive schema context to the LLM

#### 4. **Customizable Dashboard Boards**
Following Defined.fi's "Boards" pattern:
- Let stakeholders create custom dashboard layouts from available widgets
- Make boards shareable via URL
- Pre-build common board templates (e.g., "Delegator Overview", "Orchestrator Performance", "Network Health")

#### 5. **AI Agent / MCP Integration**
Following Allium and Chainbase's patterns:
- Expose an MCP (Model Context Protocol) server so external AI agents can query Livepeer data
- This enables integration with tools like Claude, ChatGPT, and autonomous agents

### Technology Choices

| Approach | Pros | Cons |
|----------|------|------|
| **Vanna AI (open-source text-to-SQL)** | Self-hosted, trainable on Livepeer schema, free | Requires hosting, may struggle with complex queries |
| **Claude/GPT-4 API + schema context** | Most capable, best at understanding intent | API costs, latency, requires prompt engineering |
| **Fine-tuned open-source LLM** | Full control, no API costs, protocol-specific | Training effort, hosting costs, less capable |
| **Hybrid: LLM for intent → structured query builder** | Best accuracy, lowest hallucination risk | More engineering effort |

### Competitive Landscape Summary

| Category | Leaders | AI Approach |
|----------|---------|-------------|
| **Blockchain Analytics** | Dune AI, DefiLlama LlamaAI, Allium AI | Text-to-SQL/GraphQL against blockchain data |
| **Blockchain Infrastructure** | Space and Time, Chainbase | Verifiable AI queries with ZK proofs, custom LLMs |
| **Enterprise BI** | Power BI Copilot, ThoughtSpot Sage, Databricks Genie | NLQ across enterprise data warehouses |
| **AI-Native Analytics** | Julius AI, Vanna AI, Hex Magic | Chat-first data exploration with auto-visualization |

---

## Sources

### Blockchain / Web3
- [Dune Analytics](https://dune.com)
- [DefiLlama LlamaAI](https://defillama.com/ai) — [DL News Coverage](https://www.dlnews.com/articles/defi/defillama-launches-ai-tool-for-live-crypto-analysis/)
- [Allium AI](https://www.allium.so/product/allium-ai) — [AI-Ready Onchain Data Blog](https://www.allium.so/blog/ai-ready-onchain-data-why-raw-blockchain-data-breaks-agents-and-how-allium-fixes-it/)
- [Space and Time](https://spaceandtime.io/ai-sql) — [CryptoSlate Coverage](https://cryptoslate.com/space-and-times-latest-ai-integration-enables-natural-language-prompts-for-data-queries-pipelines-and-more/)
- [Chainbase](https://chainbase.com) — [Chainbase in 2025](https://blog.chainbase.com/chainbase-in-2025)
- [Defined.fi](https://www.defined.fi/)
- [Bitquery](https://bitquery.io/solutions/ai-agent)
- [Nansen](https://www.nansen.ai/)

### Enterprise BI
- [ThoughtSpot Sage](https://www.thoughtspot.com)
- [Power BI Copilot](https://powerbi.microsoft.com)
- [Tableau AI](https://www.tableau.com)
- [Databricks AI/BI](https://www.databricks.com)
- [Snowflake Cortex](https://www.snowflake.com)
- [Hex Magic](https://hex.tech)

### AI-Native Analytics
- [Julius AI](https://julius.ai)
- [Vanna AI](https://github.com/vanna-ai/vanna)
- [Chat2DB](https://chat2db.ai)
- [AI2SQL](https://ai2sql.io)
- [Text-to-SQL Tools Comparison 2026](https://www.bytebase.com/blog/top-text-to-sql-query-tools/)
