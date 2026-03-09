# AI Companion for Livepeer Explorer — Implementation Plan

**Date:** March 2026
**Status:** Draft
**Approach:** Build inside Explorer first (Phase 1–2), then extract to own repo (Phase 3)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Explorer Frontend (Next.js)                            │
│  ┌───────────────────────┐  ┌────────────────────────┐  │
│  │  Existing Pages       │  │  AI Chat Popup         │  │
│  │  (orchestrators,      │  │  ┌──────────────────┐  │  │
│  │   delegating, etc.)   │  │  │ Message Thread   │  │  │
│  │                       │  │  │                  │  │  │
│  │                       │  │  │ Inline Charts    │  │  │
│  │                       │  │  │ Data Tables      │  │  │
│  │                       │  │  │ Navigation Cards │  │  │
│  │                       │  │  └──────────────────┘  │  │
│  │                       │  │  ┌──────────────────┐  │  │
│  │                       │  │  │ Input + Actions  │  │  │
│  └───────────────────────┘  │  └──────────────────┘  │  │
│                             └────────────────────────┘  │
│  [🤖 FAB]                                               │
└─────────────┬───────────────────────────────────────────┘
              │ POST /api/ai/chat (streaming)
              ▼
┌─────────────────────────────────────────────────────────┐
│  API Route: /api/ai/chat                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Vercel AI   │  │ Tool Router  │  │ Rate Limiter  │  │
│  │ SDK         │  │              │  │ (Upstash)     │  │
│  │ (streamText) │  │ ┌──────────┐│  └───────────────┘  │
│  │             │  │ │getOrch   ││                       │
│  │ Gemini 2.5  │  │ │getDeleg  ││  ┌───────────────┐  │
│  │ Flash       │  │ │getProto  ││  │ Semantic Cache│  │
│  │             │  │ │getPerf   ││  │ (Upstash Vec) │  │
│  └─────────────┘  │ │getRound  ││  └───────────────┘  │
│                   │ │getAI     ││                       │
│                   │ │navigate  ││                       │
│                   │ └──────────┘│                       │
│                   └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Livepeer Subgraph   │  │  Livepeer APIs       │
│  (The Graph)         │  │  (livepeer.com,      │
│                      │  │   metrics, etc.)     │
└──────────────────────┘  └──────────────────────┘
```

---

## Tech Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **LLM** | Gemini 2.5 Flash (default) | Fast, cheap, good tool calling |
| **LLM SDK** | Vercel AI SDK (`ai`) | Streaming, tool calling, provider switching built-in |
| **Chat UI** | `@ai-sdk/react` `useChat` hook | Works with Vercel AI SDK streaming out of the box |
| **Styling** | Stitches (existing) | Consistent with Explorer design system |
| **State** | Zustand (existing) | Chat open/close state, preferences |
| **Rate Limiting** | `@upstash/ratelimit` + Redis | Per-IP and per-wallet rate limiting |
| **Semantic Cache** | `@upstash/vector` | Cache similar questions to reduce LLM costs |
| **Charts** | Recharts (existing) | Already used in Explorer for charts |

---

## Issues & Pull Requests

### Phase 1: Chat Panel + Data Query Tools (MVP)

#### Issue #1: Project setup — dependencies and AI API route skeleton

**Scope:** Add dependencies, create API route, configure environment.

**New dependencies:**
```
ai                          # Vercel AI SDK core
@ai-sdk/google              # Gemini provider
@upstash/ratelimit          # Rate limiting
@upstash/redis              # Redis client for rate limiting
```

**New files:**
```
pages/api/ai/chat.ts        # Streaming chat API route
lib/ai/config.ts            # LLM provider config, system prompt
lib/ai/ratelimit.ts         # Rate limiting middleware
.env.example                # Add GOOGLE_GENERATIVE_AI_API_KEY, UPSTASH_REDIS_REST_URL, etc.
```

**Environment variables:**
```
GOOGLE_GENERATIVE_AI_API_KEY  # Gemini API key
UPSTASH_REDIS_REST_URL        # Rate limiting
UPSTASH_REDIS_REST_TOKEN      # Rate limiting
```

**Acceptance criteria:**
- `POST /api/ai/chat` accepts `{ messages }` and returns a streaming response
- System prompt includes Livepeer protocol context (what orchestrators, delegators, rounds are)
- Rate limited to 20 requests/min per IP, 60/min per wallet
- Returns 429 with helpful message when rate limited

---

#### Issue #2: LLM tool definitions — subgraph and API data access

**Scope:** Define tools the LLM can call to fetch Livepeer data. No raw GraphQL — each tool is a predefined, parameterized query.

**New files:**
```
lib/ai/tools/index.ts                  # Tool registry
lib/ai/tools/get-orchestrators.ts      # Fetch orchestrator list/details
lib/ai/tools/get-delegator.ts          # Fetch delegator info
lib/ai/tools/get-protocol.ts           # Fetch protocol stats
lib/ai/tools/get-current-round.ts      # Fetch current round info
lib/ai/tools/get-performance.ts        # Fetch orchestrator performance scores
lib/ai/tools/get-ai-usage.ts           # Fetch AI subnet usage/metrics
lib/ai/tools/get-events.ts             # Fetch recent protocol events
lib/ai/tools/get-treasury.ts           # Fetch treasury proposals
```

**Tool definitions (Vercel AI SDK `tool()` format):**

| Tool | Parameters | Data Source |
|------|-----------|-------------|
| `getOrchestrators` | `{ top?: number, sortBy?: string }` | Subgraph GraphQL |
| `getOrchestrator` | `{ address: string }` | Subgraph GraphQL |
| `getDelegator` | `{ address: string }` | Subgraph GraphQL + API routes |
| `getProtocolStats` | `{}` | Subgraph GraphQL |
| `getCurrentRound` | `{}` | `/api/current-round` |
| `getPerformance` | `{ region?: string }` | Livepeer metrics API |
| `getAIUsage` | `{ orchestratorAddress?: string }` | `/api/score` + pipelines |
| `getEvents` | `{ type?: string, account?: string, limit?: number }` | Subgraph GraphQL |
| `getTreasury` | `{}` | `/api/treasury` |

**Security constraints:**
- Tools use predefined GraphQL queries (no user-controlled query strings)
- All parameters are validated with Zod schemas
- Results are sanitized before being sent to LLM context

**Acceptance criteria:**
- Each tool fetches real data from the subgraph or API routes
- Tools handle errors gracefully (subgraph down, invalid address)
- LLM can chain multiple tool calls to answer complex questions

---

#### Issue #3: Chat UI component — floating button + popup panel

**Scope:** Build the chat UI as a floating action button (FAB) that opens a popup chat panel.

**New files:**
```
components/AiChat/index.tsx            # Main wrapper (FAB + popup)
components/AiChat/ChatPanel.tsx        # Chat panel container
components/AiChat/MessageThread.tsx    # Scrollable message list
components/AiChat/MessageBubble.tsx    # Individual message (user/assistant)
components/AiChat/ChatInput.tsx        # Text input + send button
components/AiChat/SuggestedQuestions.tsx # Pre-built question chips
components/AiChat/DataTable.tsx        # Inline data table for tool results
```

**Zustand store additions** (`hooks/useExplorerStore.tsx`):
```typescript
aiChatOpen: boolean
setAiChatOpen: (open: boolean) => void
```

**Layout integration** (`layouts/main.tsx`):
- Add `<AiChat />` as a sibling to the main layout (not inside content area)
- Positioned fixed bottom-right

**UI specifications:**
- **FAB:** 56px circle, bottom-right corner (24px margin), primary green color, AI icon
- **Panel:** 400px wide × 600px tall (max), anchored to FAB, border-radius 16px, elevated shadow
- **Mobile (<@bp3):** Full-screen overlay with back button
- **Message bubbles:** User = right-aligned, muted background. Assistant = left-aligned, card background
- **Suggested questions:** Horizontal scrollable chips shown when chat is empty
- **Dark mode:** Fully themed via design system tokens

**Suggested questions (initial set):**
- "Who are the top orchestrators by stake?"
- "What's the current round number?"
- "Show me the protocol participation rate"
- "Which orchestrators support AI pipelines?"

**Acceptance criteria:**
- FAB visible on all pages
- Chat opens/closes smoothly with animation
- Messages stream in real-time (token by token)
- Suggested questions populate input and send
- Fully responsive (desktop popup → mobile fullscreen)
- Dark/light mode support
- Chat history persists within session (clears on page reload)

---

#### Issue #4: Tool result rendering — data tables and inline charts

**Scope:** Render structured tool results (tables, charts) inline in chat messages.

**New files:**
```
components/AiChat/renderers/index.ts        # Renderer registry
components/AiChat/renderers/TableRenderer.tsx   # Sortable data table
components/AiChat/renderers/ChartRenderer.tsx   # Inline Recharts chart
components/AiChat/renderers/StatsCard.tsx       # Key-value stats display
components/AiChat/renderers/AddressLink.tsx     # Clickable address with ENS
```

**Rendering rules:**
- Tool results with array data → `TableRenderer` (sortable columns)
- Tool results with time-series data → `ChartRenderer` (line/bar chart)
- Tool results with single-entity data → `StatsCard` (key-value pairs)
- Addresses → `AddressLink` (truncated, clickable, ENS-resolved)

**Acceptance criteria:**
- Tables render with max 5 rows initially, "show more" to expand
- Charts use existing Recharts theme/colors
- Stats cards show formatted numbers (LPT amounts, ETH, percentages)
- All renderers support dark/light mode

---

#### Issue #5: Semantic caching with Upstash Vector

**Scope:** Cache LLM responses for semantically similar questions to reduce costs and latency.

**New dependencies:**
```
@upstash/vector              # Vector database for semantic similarity
```

**New files:**
```
lib/ai/cache.ts              # Semantic cache logic
```

**Environment variables:**
```
UPSTASH_VECTOR_REST_URL      # Vector DB endpoint
UPSTASH_VECTOR_REST_TOKEN    # Vector DB auth
```

**How it works:**
1. On new message, embed the question using the vector DB's built-in embedding
2. Search for similar cached questions (cosine similarity > 0.95)
3. If cache hit: return cached response immediately (no LLM call)
4. If cache miss: call LLM, cache the response with the question embedding
5. Cache entries expire after 5 minutes (data freshness)

**Acceptance criteria:**
- Identical questions return cached response instantly
- Similar questions (rephrased) also hit cache
- Cache miss falls through to normal LLM flow
- TTL ensures data freshness
- Cache can be disabled via env var for development

---

### Phase 2: App-Aware Navigation + Element Highlighting

#### Issue #6: Navigation tool — deep linking from chat

**Scope:** Allow the AI to suggest and trigger navigation to specific Explorer pages.

**New files:**
```
lib/ai/tools/navigate.ts              # Navigation tool definition
components/AiChat/NavigationCard.tsx   # Clickable navigation suggestion card
```

**Tool definition:**
```typescript
navigate: tool({
  description: 'Suggest a page in the Explorer for the user to visit',
  parameters: z.object({
    path: z.string(),        // e.g., "/orchestrators" or "/accounts/0x..."
    label: z.string(),       // e.g., "View Orchestrator Details"
    reason: z.string(),      // e.g., "This orchestrator has the highest performance score"
  }),
})
```

**Rendering:**
- Navigation suggestions render as clickable cards in the chat
- Cards show the label, reason, and a preview of the destination
- Clicking uses Next.js router to navigate (no full page reload)
- Chat stays open after navigation

**Acceptance criteria:**
- AI can suggest navigation to any Explorer page
- Cards are visually distinct from regular messages
- Navigation works without full page reload
- AI uses navigation proactively when relevant (e.g., "let me show you this orchestrator")

---

#### Issue #7: Element highlighting — point to UI elements from chat

**Scope:** Allow the AI to highlight specific elements on the current page.

**New files:**
```
lib/ai/tools/highlight.ts                  # Highlight tool definition
components/AiChat/HighlightOverlay.tsx     # Overlay component for highlighting
hooks/useHighlight.ts                      # Highlight state and logic
```

**How it works:**
1. AI calls `highlight` tool with a CSS selector or data attribute
2. Frontend receives the highlight instruction via tool result
3. `HighlightOverlay` renders a semi-transparent overlay with a cutout around the target element
4. A tooltip arrow points from the chat to the highlighted element
5. Highlight dismisses on click or after 5 seconds

**Tool definition:**
```typescript
highlight: tool({
  description: 'Highlight a UI element on the current page to draw attention to it',
  parameters: z.object({
    selector: z.enum([           // Predefined selectors only (no arbitrary CSS)
      'orchestrator-table',
      'staking-widget',
      'round-info',
      'performance-chart',
      'treasury-balance',
      'voting-section',
    ]),
    message: z.string(),         // Tooltip text
  }),
})
```

**Security:** Only predefined selectors allowed (enum, not free-form string).

**Acceptance criteria:**
- Highlighted element gets a pulsing border + tooltip
- Rest of page gets a subtle dark overlay
- Works across all page layouts
- Dismisses gracefully (click, timeout, or new message)

---

#### Issue #8: Wallet-aware context — personalized queries

**Scope:** When a wallet is connected, inject the user's address into the AI context so it can answer personal questions.

**Modified files:**
```
components/AiChat/ChatPanel.tsx         # Pass wallet address to API
pages/api/ai/chat.ts                    # Include address in system prompt + tools
lib/ai/tools/get-delegator.ts           # Default to connected address
```

**How it works:**
1. Frontend detects connected wallet via `useAccount()` (wagmi)
2. Wallet address is sent as metadata with each chat request
3. System prompt is augmented: "The user's connected wallet is {address}"
4. Tools like `getDelegator` default to the connected address when no address is specified
5. AI can proactively offer personalized insights: "You have X LPT staked with orchestrator Y"

**Acceptance criteria:**
- Without wallet: general questions work, personal questions prompt "connect your wallet"
- With wallet: AI automatically uses the connected address for personal queries
- Address is never exposed in the system prompt to other users (per-request)

---

### Phase 3: Pinnable Cards + Extraction

#### Issue #9: Pinnable insight cards

**Scope:** Allow users to "pin" AI-generated insights as persistent cards on Explorer pages.

**New files:**
```
components/AiChat/PinButton.tsx               # Pin button on tool results
components/PinnedInsights/index.tsx            # Pinned cards container
components/PinnedInsights/InsightCard.tsx      # Individual pinned card
hooks/usePinnedInsights.ts                     # Zustand slice for pinned items
```

**How it works:**
1. Each tool result in chat has a "pin" button (📌 icon)
2. Pinning saves the query + result to Zustand (persisted to localStorage)
3. Pinned cards appear in a collapsible section at the top of relevant pages
4. Cards auto-refresh on a configurable interval (default: every round)
5. Users can unpin, reorder, and resize cards

**Acceptance criteria:**
- Pin button appears on all tool result renderers
- Pinned cards persist across page navigations
- Cards refresh data periodically
- Maximum 6 pinned cards per page
- Unpin removes card with animation

---

#### Issue #10: Extract AI companion to standalone package/repo

**Scope:** Extract the AI companion into its own repository so it can be used as a drop-in widget for any Livepeer app.

**New repository structure:**
```
livepeer-ai-companion/
├── packages/
│   ├── core/                    # LLM logic, tools, caching
│   │   ├── src/
│   │   │   ├── tools/           # Tool definitions
│   │   │   ├── config.ts        # Provider config
│   │   │   ├── cache.ts         # Semantic caching
│   │   │   └── index.ts         # Core exports
│   │   └── package.json         # @livepeer/ai-companion-core
│   │
│   ├── react/                   # React components
│   │   ├── src/
│   │   │   ├── AiChat/          # All UI components
│   │   │   ├── renderers/       # Data renderers
│   │   │   └── index.ts         # React exports
│   │   └── package.json         # @livepeer/ai-companion-react
│   │
│   └── nextjs/                  # Next.js API route handler
│       ├── src/
│       │   └── handler.ts       # createAiChatHandler()
│       └── package.json         # @livepeer/ai-companion-nextjs
│
├── apps/
│   └── demo/                    # Standalone demo app
│
└── package.json                 # Monorepo root (turborepo)
```

**Explorer integration after extraction:**
```typescript
// pages/api/ai/chat.ts
import { createAiChatHandler } from '@livepeer/ai-companion-nextjs'
export default createAiChatHandler({ /* config */ })

// layouts/main.tsx
import { AiChat } from '@livepeer/ai-companion-react'
<AiChat endpoint="/api/ai/chat" />
```

**Acceptance criteria:**
- All AI code extracted from Explorer into the new repo
- Explorer imports from the packages (no code duplication)
- Packages published to npm under `@livepeer/` scope
- Demo app works standalone
- Explorer CI passes with the extracted packages

---

## PR Sequence

```
PR #1: [Phase 1] AI API route + Gemini integration + rate limiting
       ← Issue #1
       Dependencies: ai, @ai-sdk/google, @upstash/ratelimit, @upstash/redis

PR #2: [Phase 1] LLM tool definitions for Livepeer data
       ← Issue #2
       Depends on: PR #1

PR #3: [Phase 1] Chat UI — floating button + popup panel
       ← Issue #3
       Depends on: PR #1 (needs API route to connect to)

PR #4: [Phase 1] Tool result renderers — tables, charts, stats
       ← Issue #4
       Depends on: PR #2 + PR #3

PR #5: [Phase 1] Semantic caching with Upstash Vector
       ← Issue #5
       Depends on: PR #1
       Can be developed in parallel with PR #3 and #4

PR #6: [Phase 2] Navigation tool + deep linking from chat
       ← Issue #6
       Depends on: PR #4

PR #7: [Phase 2] Element highlighting from chat
       ← Issue #7
       Depends on: PR #4

PR #8: [Phase 2] Wallet-aware personalized queries
       ← Issue #8
       Depends on: PR #4

PR #9: [Phase 3] Pinnable insight cards
       ← Issue #9
       Depends on: PR #4

PR #10: [Phase 3] Extract to standalone repo
        ← Issue #10
        Depends on: All previous PRs
```

**Dependency graph:**
```
PR #1 ──┬──→ PR #2 ──┐
        │             ├──→ PR #4 ──┬──→ PR #6
        ├──→ PR #3 ──┘             ├──→ PR #7
        │                          ├──→ PR #8
        └──→ PR #5                 ├──→ PR #9
                                   └──→ PR #10
```

---

## Security Considerations

| Threat | Mitigation |
|--------|------------|
| **Prompt injection** | System prompt hardening, no user-controlled tool parameters beyond validated enums/strings |
| **Data exfiltration** | Tools only access public subgraph data + user's own wallet data |
| **XSS via LLM output** | Sanitize all LLM text output before rendering (no `dangerouslySetInnerHTML`) |
| **Cost abuse** | Rate limiting (IP + wallet), semantic caching, Gemini Flash (cheapest tier) |
| **Raw query injection** | No raw GraphQL/SQL — all queries are predefined with parameterized inputs |
| **Wallet spoofing** | Wallet address passed from frontend is used for data queries only (no transactions) |

---

## Open Questions

1. **Should the AI be able to initiate transactions?** (e.g., "Stake 100 LPT with this orchestrator")
   - Recommendation: **No** for MVP. Read-only data access only.
   - Future: Could generate transaction previews that link to the existing staking UI.

2. **Should conversations persist across sessions?**
   - Recommendation: **No** for MVP. Session-only (clears on reload).
   - Future: Could persist to localStorage or a backend with wallet-based auth.

3. **Should there be a feedback mechanism?**
   - Recommendation: **Yes** — thumbs up/down on AI responses for quality monitoring.

4. **Analytics/observability?**
   - Recommendation: Log queries (anonymized) to understand usage patterns.
   - Track: cache hit rate, avg response time, tool usage frequency, error rate.
