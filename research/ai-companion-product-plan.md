# AI Companion for Livepeer Explorer — Product & Implementation Plan

**Date:** March 2026
**Status:** RFC (Request for Comments)
**Scope:** Single MVP Pull Request

---

## Context

The Livepeer Explorer is the primary interface for orchestrators, delegators, and community members to interact with the Livepeer protocol. Today, understanding protocol data requires navigating multiple pages and interpreting raw numbers — there's no way to simply *ask a question* and get an answer.

An AI companion would let anyone — from first-time visitors to power users — ask natural language questions like "Who are the top orchestrators by performance?" or "What's the current participation rate?" and get immediate, structured answers with tables and charts. This dramatically lowers the barrier to understanding protocol health and making informed staking decisions.

This plan covers an MVP that ships in a **single pull request** — focused, read-only, and cost-conscious.

---

## MVP Scope (This PR)

### What We're Building

A floating chat panel that lets users ask questions about the Livepeer protocol and get answers backed by real data from **The Graph subgraph** and the Explorer's **existing API routes**.

### Core Capabilities

1. **Natural language Q&A** — Ask questions, get structured data responses (tables, charts, stats cards)
2. **Rich data sources** — The Graph subgraph for on-chain state + existing Explorer API routes for performance metrics, AI usage, and aggregated data
3. **Semantic caching** — Cache similar questions to avoid redundant LLM calls (saves cost)
4. **Strictly read-only** — No transactions, no raw queries, no user-controlled query strings

### What We're NOT Building (Yet)

- Navigation guidance (deep linking from chat to Explorer pages)
- Pinnable dashboards (saving AI-generated insights as persistent cards)
- Wallet-aware personalized queries
- Dune Analytics integration (historical time-series data)

These are planned for follow-up PRs (see [Future Roadmap](#future-roadmap) below).

---

## Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **LLM** | [Gemini 2.5 Flash](https://ai.google.dev/) | Fast, cost-effective ($0.15/1M input tokens), strong tool-calling support |
| **LLM SDK** | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` + `@ai-sdk/google`) | Framework-agnostic streaming, built-in tool calling, provider-swappable (can switch to Claude/GPT later without code changes) |
| **Chat UI** | [`@ai-sdk/react`](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot) `useChat` hook | Zero-config streaming UI that pairs with Vercel AI SDK backend |
| **Rate Limiting** | [`@upstash/ratelimit`](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview) + Upstash Redis | Serverless-friendly, per-IP rate limiting to prevent abuse |
| **Semantic Cache** | [`@upstash/vector`](https://upstash.com/docs/vector/overall/getstarted) | Caches LLM responses by semantic similarity — "top orchestrators" and "best orchestrators" hit the same cache entry |
| **Protocol Data** | [The Graph](https://thegraph.com/) (existing) | Real-time on-chain data via the Livepeer subgraph already used by Explorer |
| **Charts** | [Recharts](https://recharts.org/) (existing) | Already used in Explorer — consistent charting |
| **Validation** | [Zod](https://zod.dev/) (existing) | All tool parameters validated, no raw user input reaches data sources |
| **Styling** | Stitches + @livepeer/design-system (existing) | Consistent with Explorer's design language |

### Why Vercel AI SDK?

The [Vercel AI SDK](https://sdk.vercel.ai/) is the key enabler for this project:

- **`streamText()`** — Streams LLM responses token-by-token over HTTP, so users see answers appearing in real-time rather than waiting for a full response
- **`tool()` definitions** — Declarative tool/function-calling with Zod schemas. The LLM decides which data to fetch, but the actual queries are predefined and validated — the user can never run arbitrary queries
- **Provider abstraction** — We start with Gemini 2.5 Flash for cost, but can swap to Claude Sonnet, GPT-4o, or any provider by changing one line — no code refactor needed
- **`useChat()` React hook** — Handles the entire client-side chat lifecycle (message state, streaming, error handling, loading states) with zero boilerplate
- **Structured tool results** — Tool call results flow back into the chat as structured data that we can render as tables/charts rather than plain text

This means the entire streaming chat infrastructure — from API route to UI — is handled by the SDK, letting us focus on the Livepeer-specific data tools and UI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Explorer Frontend (Next.js)                                 │
│                                                              │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │  Existing Pages      │    │  AI Chat Panel            │  │
│  │  (orchestrators,     │    │  ┌─────────────────────┐  │  │
│  │   delegating,        │    │  │ Suggested Questions  │  │  │
│  │   leaderboard, etc.) │    │  │ Message Thread       │  │  │
│  │                      │    │  │   - Text responses   │  │  │
│  │                      │    │  │   - Data tables      │  │  │
│  │                      │    │  │   - Inline charts    │  │  │
│  │                      │    │  │   - Stats cards      │  │  │
│  │                      │    │  │ Text Input           │  │  │
│  └──────────────────────┘    │  └─────────────────────┘  │  │
│                               └───────────────────────────┘  │
│  [AI FAB Button]                                             │
└───────────────┬──────────────────────────────────────────────┘
                │ POST /api/ai/chat (streaming)
                ▼
┌──────────────────────────────────────────────────────────────┐
│  API Route: /api/ai/chat                                      │
│                                                               │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Rate       │  │ Semantic     │  │ Vercel AI SDK        │  │
│  │ Limiter    │→ │ Cache Check  │→ │ streamText()         │  │
│  │ (Upstash)  │  │ (Upstash Vec)│  │                      │  │
│  └────────────┘  └──────────────┘  │  Gemini 2.5 Flash    │  │
│                                     │  + Tool Definitions   │  │
│                                     └──────────┬───────────┘  │
│                                                │              │
│  ┌─────────────────────────────────────────────┘              │
│  │  Tools (predefined, read-only)                             │
│  │  ┌────────────────┐  ┌────────────────┐                   │
│  │  │ getOrchestrators│  │ getProtocol    │                   │
│  │  │ getDelegator    │  │ getCurrentRound│                   │
│  │  │ getPerformance  │  │ getAIUsage     │                   │
│  │  │ getEvents       │  │ getTreasury    │                   │
│  │  └────────────────┘  └────────────────┘                   │
│  └────────────────────────────────────────────────────────────│
└───────────────────────────────────────────────────────────────┘
                │                        │
                ▼                        ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  Livepeer Subgraph   │  │  Explorer API Routes     │
│  (The Graph)         │  │  (existing Next.js API)  │
│  - Orchestrators     │  │  - Performance scores    │
│  - Delegators        │  │  - AI pipeline metrics   │
│  - Protocol stats    │  │  - Usage data            │
│  - Events            │  │  - Current round         │
└──────────────────────┘  └──────────────────────────┘
```

---

## Data Flow

### Request Lifecycle

1. **User sends message** → `useChat()` POSTs to `/api/ai/chat`
2. **Rate limit check** → Upstash Redis checks per-IP limit (20 req/min)
3. **Semantic cache check** → Upstash Vector searches for similar past questions (cosine similarity > 0.95)
   - **Cache hit** → Return cached response immediately (no LLM call, no cost)
   - **Cache miss** → Continue to LLM
4. **LLM processes** → Gemini 2.5 Flash reads the question + system prompt
5. **Tool calls** → LLM decides which data tools to call (e.g., `getOrchestrators`, `getPerformance`)
6. **Data fetch** → Tools execute predefined queries against The Graph subgraph and Explorer API routes
7. **LLM responds** → Streams a natural language response with structured data
8. **Cache store** → Response is cached in Upstash Vector for future similar questions (5-min TTL)
9. **UI renders** → `useChat()` renders streaming text + structured data (tables/charts)

### Caching Strategy (Cost Control)

The semantic cache is the primary cost-saving mechanism:

- **Identical questions** → Exact cache hit, instant response
- **Rephrased questions** → "top orchestrators" ≈ "best orchestrators" ≈ "leading orchestrators" → same cache entry
- **5-minute TTL** → Data stays fresh (protocol state changes per round, ~24h)
- **Expected cache hit rate** → 40-60% based on patterns from similar products (common questions repeat frequently)
- **Cost without cache** → ~$0.001-0.003 per question (Gemini Flash pricing)
- **Cost with cache** → ~$0.0005 per question average

---

## Implementation Details

### New Files

```
pages/api/ai/chat.ts                          # Streaming chat API route
lib/ai/config.ts                               # LLM provider config + system prompt
lib/ai/ratelimit.ts                            # Rate limiting middleware
lib/ai/cache.ts                                # Semantic caching logic
lib/ai/tools/index.ts                          # Tool registry (exports all tools)
lib/ai/tools/get-orchestrators.ts              # Orchestrator data (subgraph)
lib/ai/tools/get-delegator.ts                  # Delegator info (subgraph + API)
lib/ai/tools/get-protocol.ts                   # Protocol stats (subgraph)
lib/ai/tools/get-current-round.ts              # Round info (subgraph)
lib/ai/tools/get-performance.ts                # Performance scores (metrics API)
lib/ai/tools/get-ai-usage.ts                   # AI pipeline metrics
lib/ai/tools/get-events.ts                     # Protocol events (subgraph)
lib/ai/tools/get-treasury.ts                   # Treasury proposals (subgraph)
components/AiChat/index.tsx                    # Main wrapper (FAB + panel)
components/AiChat/ChatPanel.tsx                # Chat panel container
components/AiChat/MessageThread.tsx            # Scrollable message list
components/AiChat/MessageBubble.tsx            # Individual message rendering
components/AiChat/ChatInput.tsx                # Text input + send button
components/AiChat/SuggestedQuestions.tsx        # Pre-built question chips
components/AiChat/renderers/TableRenderer.tsx  # Data table for tool results
components/AiChat/renderers/ChartRenderer.tsx  # Inline Recharts chart
components/AiChat/renderers/StatsCard.tsx      # Key-value stats display
```

### Modified Files

```
hooks/useExplorerStore.tsx                     # Add aiChatOpen state
layouts/main.tsx                               # Mount <AiChat /> component
.env.example                                  # Add new env vars
package.json                                   # Add new dependencies
```

### New Dependencies

```
ai                          # Vercel AI SDK core
@ai-sdk/google              # Gemini provider for Vercel AI SDK
@ai-sdk/react               # React hooks (useChat)
@upstash/ratelimit          # Rate limiting
@upstash/redis              # Redis client for rate limiting
@upstash/vector             # Semantic cache (vector similarity)
```

### Environment Variables

```
GOOGLE_GENERATIVE_AI_API_KEY   # Gemini API key
UPSTASH_REDIS_REST_URL         # Rate limiting Redis
UPSTASH_REDIS_REST_TOKEN       # Rate limiting Redis auth
UPSTASH_VECTOR_REST_URL        # Semantic cache vector DB
UPSTASH_VECTOR_REST_TOKEN      # Semantic cache vector DB auth
```

### Tool Definitions

Each tool is a Vercel AI SDK `tool()` with Zod-validated parameters. Tools reuse existing server-side data fetching logic wherever possible.

| Tool | Parameters | Data Source | Reuses |
|------|-----------|-------------|--------|
| `getOrchestrators` | `{ top?: number, sortBy?: "stake" \| "fees" }` | Subgraph | `getOrchestrators()` from `lib/api/ssr.ts` |
| `getOrchestrator` | `{ address: string }` | Subgraph | `getAccount()` from `lib/api/ssr.ts` |
| `getDelegator` | `{ address: string }` | Subgraph + API | `getAccount()` from `lib/api/ssr.ts` |
| `getProtocolStats` | `{}` | Subgraph | `getProtocol()` from `lib/api/ssr.ts` |
| `getCurrentRound` | `{}` | Subgraph | `getCurrentRound()` from `lib/api/ssr.ts` |
| `getPerformance` | `{ region?: string }` | Metrics API | Fetches from `NEXT_PUBLIC_METRICS_SERVER_URL` |
| `getAIUsage` | `{ orchestrator?: string }` | AI Metrics API | Fetches from `NEXT_PUBLIC_AI_METRICS_SERVER_URL` |
| `getEvents` | `{ type?: string, limit?: number }` | Subgraph | `getEvents()` from `lib/api/ssr.ts` |
| `getTreasury` | `{}` | Subgraph + Contract | Existing treasury API logic |

### Security Model

| Threat | Mitigation |
|--------|------------|
| **Prompt injection** | System prompt hardening; tools use validated enums/schemas, not raw user input |
| **Raw query injection** | No raw GraphQL or SQL — all queries are predefined with Zod-validated parameters |
| **Data exfiltration** | Tools only access public subgraph data (all on-chain, already public) |
| **XSS via LLM output** | All LLM text rendered via React (auto-escaped), no `dangerouslySetInnerHTML` |
| **Cost abuse** | Rate limiting (20 req/min per IP) + semantic caching (skip LLM for repeated questions) |
| **Write operations** | Zero — no transaction signing, no state mutations, no POST/PUT to external services |
| **Wallet spoofing** | Not applicable in MVP — no wallet-aware features |

### Chat UI

- **FAB (Floating Action Button):** 56px circle, bottom-right corner, uses design system primary color
- **Panel:** 400px wide x 600px tall, anchored to FAB, border-radius 16px
- **Mobile:** Full-screen overlay with close button
- **Suggested questions** shown when chat is empty:
  - "Who are the top orchestrators by stake?"
  - "What's the current round number?"
  - "What are the current protocol stats?"
  - "Which orchestrators support AI pipelines?"
- **Data rendering:** Tool results render as tables (sortable), charts (Recharts), or stats cards depending on data shape
- **Streaming:** Messages appear token-by-token via Vercel AI SDK streaming

---

## Future Roadmap

These features are **not** in the MVP but are planned for follow-up PRs:

### Phase 2: App-Aware Navigation
- **Navigation tool** — AI suggests and triggers deep links to Explorer pages (e.g., "View this orchestrator" → navigates to `/accounts/0x.../orchestrating`)
- **Element highlighting** — AI can point to specific UI elements on the current page with a tooltip overlay

### Phase 3: Dune Analytics Integration
- **Dune data source** — Add a `getDuneData` tool that queries pre-built Livepeer dashboards on Dune for historical analytics (fee revenue over time, participation trends, network growth)
- **Richer charts** — Time-series historical data enables more powerful chart visualizations

### Phase 4: Personalization & Persistence
- **Wallet-aware context** — When a wallet is connected, AI can answer personal questions ("How much do I have staked?")
- **Pinnable dashboards** — Users can "pin" AI-generated data cards to Explorer pages as persistent widgets
- **Session persistence** — Chat history saved to localStorage across page reloads

---

## Verification Plan

### Manual Testing
1. Start the dev server with all env vars configured
2. Open Explorer → verify FAB button appears bottom-right on all pages
3. Click FAB → verify chat panel opens with suggested questions
4. Ask "Who are the top orchestrators?" → verify table renders with real data
5. Ask the same question again → verify faster response (cache hit)
6. Ask "Show me the protocol stats" → verify stats card renders with real data
7. Send 21+ messages rapidly → verify rate limit kicks in with friendly message
8. Test on mobile viewport → verify full-screen layout
9. Toggle dark/light mode → verify chat panel themes correctly
10. Check browser console → verify no errors, no dangerouslySetInnerHTML

### Automated Testing
- Unit tests for each tool (mock subgraph/API responses, verify Zod validation)
- Unit tests for semantic cache (mock Upstash Vector, verify hit/miss logic)
- Unit tests for rate limiter (mock Upstash Redis, verify limit enforcement)
- Component tests for ChatPanel, MessageBubble, renderers

### Security Checks
- Verify no raw GraphQL/SQL reaches data sources (all parameterized)
- Verify rate limiting works per-IP
- Verify LLM output is React-rendered (no raw HTML injection)
- Verify all tool parameters are Zod-validated
