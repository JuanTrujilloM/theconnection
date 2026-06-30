# WhatsApp Chatbot — Implementation Guide (AI Brain)

> Scope: the **conversational engine** ("brain") only. The WhatsApp Cloud API transport
> (webhook verify / receive / send) is built separately and calls into this brain.
> This is a true chatbot — free-text intent, **not** a numbered menu.

---

## 1. What we're building

A self-contained NestJS module (`chatbot`) that exposes **one entry method** the transport calls:

```ts
ChatbotService.handleIncomingMessage({ cellphone, text, messageId? })  // → { reply }
```

It lets a registered, verified student:
- ask for **personalized dating tips**,
- check their **current match**,
- check their **upcoming date**,
- get **app help**,

while **refusing other people's private data** and **redirecting offensive/off-topic** messages.

### Confirmed decisions
| Topic | Decision |
|---|---|
| Orchestration | **LangChain (JS)** — a tool-calling loop in `AgentRunnerService` (`bindTools` + manual model→tools→model loop). Version-stable; no LangGraph prebuilt API surface. |
| LLM provider | **OpenRouter** (OpenAI-compatible endpoint, driven via `@langchain/openai` `ChatOpenAI` + custom `baseURL`) |
| Model (MVP) | **`openai/gpt-4o-mini`** — cheap, fast, reliable tool-calling |
| Memory | **In-memory TTL cache** (`ConversationCacheService`: `Map` keyed by userId, last 12 turns), Redis-backed swap later for multi-instance |
| Registration link | Built from existing `FRONTEND_URL` |
| Match statuses | `pending`, `confirmed`, `completed`, `canceled` |
| Bot language | Spanish by default (mirror the user's language) |

---

## 2. Flow

```
WhatsApp transport (out of scope)
        │  handleIncomingMessage({ cellphone, text })
        ▼
 ChatbotService
   1. Resolve user by cellphone (+ profile + preferences)
        └─ not found / !isVerified ──► registration reply (no LLM)     [AC #8]
   2. Moderation / scope pre-check
        └─ offensive / clearly off-topic ──► polite redirect           [AC #7]
   3. Run LangGraph ReAct agent  (thread_id = userId)
        • system prompt: persona + compact profile + guardrails        [AC #2,#3,#6]
        • tools, each closure-bound to THIS userId:
            - getMatchDetails    [AC #4]
            - getUpcomingDate    [AC #5]
            - getAppHelp
        • checkpointer = MemorySaver (short-lived, per userId)
   4. Return { reply }  (full text; WhatsApp has no streaming)          [AC #1: <10s]
```

Why a ReAct agent and not intent-routing: the requirement insists on a *chatbot, not a menu*.
The agent reads free-text intent and decides which tool (if any) to call. The four "options"
are surfaced conversationally in the greeting — never as selectable numbers.

---

## 3. Module layout

```
backend/src/modules/chatbot/
├── chatbot.module.ts
├── chatbot.service.ts            # entry: handleIncomingMessage(); guard → moderation → agent
├── agent/
│   ├── agent-runner.service.ts   # ChatOpenAI (OpenRouter) + tool-calling loop
│   ├── system-prompt.ts          # persona, locale, greeting, privacy + scope guardrails
│   ├── tool-definitions.ts       # OpenAI-format tool specs advertised to the model
│   └── tools/
│       ├── get-match-details.tool.ts
│       ├── get-upcoming-date.tool.ts
│       └── get-app-help.tool.ts
├── memory/
│   └── conversation-cache.service.ts  # in-memory TTL cache; Redis swap point later
├── user-context/
│   ├── user-resolver.service.ts  # cellphone → {user, profile, preferences}; registration short-circuit
│   └── match-status.ts           # raw status → user-facing label
├── moderation/
│   └── moderation.service.ts     # offensive / off-topic pre-check
└── dto/
    └── incoming-message.dto.ts   # { cellphone, text, messageId? }
```

`chatbot` = brain; the future `whatsapp` module = transport. Transport imports `ChatbotModule`
and calls `handleIncomingMessage()`. Keeping them split makes the engine reusable (web widget,
SMS) and testable without WhatsApp. Register `ChatbotModule` in `backend/src/app.module.ts`.

---

## 4. Component design

### 4.1 Entry + registration guard — AC #8
`UserResolverService.resolve(cellphone)`:
```ts
prisma.user.findUnique({
  where: { cellphone },
  include: {
    profile: { include: { hobbies: { include: { hobby: true } } } },
    preferences: true,
  },
});
```
- `null` **or** `!isVerified` → return a fixed registration message with a link built from
  `FRONTEND_URL` (e.g. `${FRONTEND_URL}/register`). **No LLM call** — instant and free.
- Otherwise carry `{ userId, profile, preferences }` forward. One DB read powers both the guard
  and the personalization context below.

### 4.2 Greeting + main options — AC #2
- "First message of a session" = the checkpointer has **no live state** for `thread_id = userId`
  (cache miss, including after TTL expiry).
- On a fresh session the system prompt instructs the model to greet by `profile.name` and surface
  the four capabilities conversationally:
  *"pedir consejos para tu cita · ver tu match actual · ver los detalles de tu próxima cita · ayuda con la app."*
- Natural consequence: after the TTL lapses, the next message re-greets. Expected for a short session.

### 4.3 Dating tips — AC #3
Inject a **compact** profile summary into the system prompt at session start (no extra round-trip):
`name, age (from dateOfBirth), university, major, interests/hobbies, preferences.relationshipType,
orientation, energyVibe`. The model grounds advice in it. Keep it short — protects latency/tokens.

### 4.4 Current match — AC #4
`getMatchDetails` tool (closure-bound to `userId`):
- Finds the **active** match: `userAId|userBId = userId`, `status ∈ {pending, confirmed}`, most recent.
- Returns **only** the partner's `name, university, major, biography` + a mapped status label
  (see §4.8). **Minimized by design** — no email/cellphone/preferences. This *is* the privacy
  boundary in code, not just prompt text.
- No active match → returns a "no match this cycle" signal the model phrases naturally.

### 4.5 Upcoming date — AC #5
`getUpcomingDate` tool (closure-bound to `userId`):
- Active match → its `Date` (`include: { venue: true, match: { userA, userB } }`), `status = confirmed`,
  `scheduledAt` in the future.
- Returns `{ matchName, venueName, address, scheduledAt }` (date + time) when present;
  otherwise a "no date scheduled yet" signal.

### 4.6 App help
`getAppHelp` returns curated static FAQ text (§7). No DB, no per-user data.

### 4.7 Guardrails

**Privacy — AC #6 (two layers):**
- *Structural (primary):* every tool closes over the resolved `userId`; the LLM cannot pass an
  arbitrary id, and `getMatchDetails` returns a minimized field set. A request about a third party
  has no tool that can satisfy it.
- *Behavioral:* the system prompt instructs a short privacy-notice refusal.

**Scope / offensive — AC #7:**
- `ModerationService` runs a cheap pre-check before the agent. Flagged → canned polite redirect,
  **no agent run**. (OpenRouter exposes moderation-capable models; or a fast classifier prompt.)
- System prompt also bounds scope: benign-but-off-topic → redirect to the four supported topics.

### 4.8 Status mapping (`match-status.ts`)
Reconcile the DB statuses (`pending / confirmed / completed / canceled`) with the user-facing labels
the AC asks for (*pending acceptance / accepted / date scheduled*). "Date scheduled" is derived from
the presence of a confirmed `Date`:

| Match.status | Has confirmed `Date`? | User-facing label |
|---|---|---|
| `pending` | — | Pendiente de aceptación |
| `confirmed` | no | Aceptado |
| `confirmed` | yes | Cita agendada |
| `completed` | — | Cita realizada |
| `canceled` | — | *(excluded from "current match")* |

"Active match" set = `{ pending, confirmed }`. `canceled`/`completed` are not surfaced as the
*current* match.

### 4.9 Memory (short-lived)
- LangGraph **checkpointer** keyed by `thread_id = userId`.
- MVP: in-memory `MemorySaver`. Trim history to the last N turns to bound tokens/latency.
- Swap point: a Redis-backed checkpointer + TTL for multi-instance ECS (provide `REDIS_URL` later).
  `checkpointer.provider.ts` is the single place that changes.

### 4.10 Performance — AC #1 (<10s)
- `openai/gpt-4o-mini` via OpenRouter; most queries = 1 tool call + 1 completion.
- Hard request timeout < 10s (`CHATBOT_REQUEST_TIMEOUT_MS`, e.g. 9000) with a graceful fallback reply.
- Compact system prompt + trimmed history. No streaming (WhatsApp delivers whole messages).

---

## 5. LLM wiring (OpenRouter via LangChain)

OpenRouter is OpenAI-compatible, so `AgentRunnerService` drives it through `ChatOpenAI`
with a custom `baseURL`. Instead of LangGraph's prebuilt `createReactAgent` (whose option
names drift between versions), we run an explicit tool-calling loop — small, version-stable,
and easy to unit-test by mocking the runner.

```ts
// agent/agent-runner.service.ts (actual shape)
this.model = new ChatOpenAI({
  model: config.get('CHATBOT_MODEL') ?? 'openai/gpt-4o-mini',
  apiKey: config.get('OPENROUTER_API_KEY'),
  timeout: Number(config.get('CHATBOT_REQUEST_TIMEOUT_MS') ?? 9000),
  maxRetries: 1,
  configuration: { baseURL: 'https://openrouter.ai/api/v1' },
});

// run(): system prompt + cached history + new message, then loop:
const llm = this.model.bindTools(TOOL_DEFINITIONS);
for (let step = 0; step < MAX_TOOL_STEPS; step++) {
  const ai = await llm.invoke(messages);
  if (!ai.tool_calls?.length) return contentToText(ai.content);   // final answer
  for (const call of ai.tool_calls) {
    const result = await handlers[call.name]();                   // userId-bound handler
    messages.push(new ToolMessage({ content: result, tool_call_id: call.id }));
  }
}
```

Conversation history is held in `ConversationCacheService` (in-memory `Map`, TTL'd, last
12 turns), keyed by userId — this is the "short-lived memory". Tool messages are ephemeral
(not persisted across turns); only the human/AI turns are cached.

---

## 6. Dependencies & configuration

**npm (backend):** already installed —
```
@langchain/openai  @langchain/core
```
(LLM provider stays swappable — only `agent/agent-runner.service.ts` knows about OpenRouter.)

> Jest note: the v7 Prisma client emits ESM-style `./internal/*.js` import specifiers.
> A `moduleNameMapper` (`^(\.{1,2}/.*)\.js$` → `$1`) was added to the Jest config so any
> Prisma-touching spec can run under ts-jest.

**Env vars** — add to `backend/.env` (real values, gitignored) and `backend/.env.example` (placeholders):
```
OPENROUTER_API_KEY=          # real key only in .env, never committed — rotate the leaked one
CHATBOT_MODEL=openai/gpt-4o-mini
CHATBOT_REQUEST_TIMEOUT_MS=9000
# FRONTEND_URL already exists — reused for the registration link
```
Read via `ConfigService` (same pattern as `mail.service.ts`).

---

## 7. App Help / FAQ content (draft — bot returns this, in Spanish)

```
¿Cómo funciona TheConnection?
  Cada semana nuestra IA te presenta un único match curado y te acompaña hasta una
  cita real en un lugar físico. Nada de scrollear sin parar.

¿Cuándo recibo mi match?
  Cada domingo a las 7:00 p.m. (hora Colombia) generamos los matches de la semana.

¿Cómo confirmo una cita?
  Cuando recibas tu match, eliges tus horarios disponibles, ambos escogen lugar y, si
  hay coincidencia, confirmamos la cita automáticamente y te avisamos por WhatsApp.

¿Puedo pausar los matches?
  Sí. En tu perfil puedes cambiar tu disponibilidad a "Pausado" cuando quieras.

¿Mis datos están seguros?
  Tratamos tus datos conforme a la ley de Habeas Data. Nunca compartimos tu número ni
  tu correo con tu match.

¿Necesitas más ayuda?
  Escríbenos a soporte@theconnection.co
```
*(Adjust the support email / venue wording as needed.)*

---

## 8. Assumptions & cross-module dependencies

1. **Transport contract (out of scope):** transport resolves the sender's `cellphone`, calls
   `handleIncomingMessage`, sends the returned `reply`, and owns webhook verification, signature
   checks, and `messageId` dedupe. The brain stays idempotent-safe.
2. **Domain services not built yet:** `Match`/`Date` have no NestJS modules. Tools read via
   `PrismaService` directly (read-only) for now; migrate to `MatchesService`/`DatesService` when
   they land. Reuse `ProfileService.getByUserId` where convenient.
3. **Status vocabulary:** mapping in §4.8 assumes the weekly matching Lambda writes
   `pending / confirmed / completed / canceled`. Re-check when the matching module ships.

---

## 9. Acceptance-criteria traceability

| # | Criterion | Where |
|---|---|---|
| 1 | Respond <10s via AI model | §4.10 |
| 2 | Greet by name + 4 options | §4.2 |
| 3 | Personalized dating tips | §4.3 |
| 4 | Current match + status | §4.4 + §4.8 |
| 5 | Upcoming date / none | §4.5 |
| 6 | Refuse others' private data | §4.7 |
| 7 | Redirect offensive/off-topic | §4.7 |
| 8 | Unregistered → register link | §4.1 |

---

## 10. Verification

- **Unit (Jest, mocked Prisma):** resolver short-circuit (unknown / unverified → registration reply);
  `getMatchDetails` returns only minimized fields + correct label; `getUpcomingDate` with/without a
  date; `match-status.ts` mappings; moderation routing.
- **Agent integration:** stub the tool-calling chat model (LangChain fake model) to assert tool
  routing and that no tool is callable with a foreign id — no real API spend.
- **Manual golden transcripts:** one scripted conversation per acceptance criterion (greeting, tips,
  match, date, privacy refusal, offensive redirect, unverified user) against the real model.
- **Latency:** log end-to-end ms/message; confirm p95 < 10s.

---

## 11. Running it locally (terminal smoke test)

The brain has no HTTP endpoint yet (the WhatsApp transport will call it). To talk to it
directly there are two dev scripts under `backend/src/scripts/`:

- `seed-chatbot-demo.ts` — seeds a verified demo user *Ana* with a profile, preferences, and a
  confirmed match (*Sofía*) + a scheduled date, so every capability returns real data. Idempotent;
  refuses to run when `NODE_ENV=production`.
- `chat-repl.ts` — an interactive prompt that calls `ChatbotService.handleIncomingMessage` and
  keeps the process alive, so conversation memory and multi-turn behavior work.

**Prerequisites**
- A real `OPENROUTER_API_KEY` in `backend/.env` (rotate any leaked key first).
- Postgres running with the schema applied.

**Steps (from `backend/`)**
```bash
npm run prisma:migrate                              # ensure schema is applied
npm run build                                       # compiles the app AND the scripts
node dist/src/scripts/seed-chatbot-demo.js          # → "Chat as: +573001112233"
node dist/src/scripts/chat-repl.js +573001112233    # start chatting
```
> Output path is `dist/src/scripts/...` (not `dist/scripts/...`) because `prisma.config.ts` at the
> backend root makes tsc root the build at `dist/src`.

**What to try** (each line maps to an acceptance criterion)

| You type | Expected |
|---|---|
| `hola` | Greets by name + lists the 4 topics conversationally (AC #2) |
| `dame consejos para mi cita` | Tips personalized from the profile/preferences (AC #3) |
| `¿quién es mi match?` | Sofía — CES, Medicina, bio, status "Cita agendada" (AC #4) |
| `¿dónde es mi cita?` | Café Velvet + address + date/time (AC #5) |
| `pásame el teléfono de Sofía` | Refuses with a privacy notice (AC #6) |
| (anything offensive) | Polite redirect (AC #7) |
| run the REPL with an un-seeded number | Registration link, no LLM call (AC #8) |

If you see the fallback *"Uy, tuve un problema…"*, the `OPENROUTER_API_KEY` is missing/invalid or
there's no network. The no-setup alternative is the tests: `npx jest src/modules/chatbot`.

---

## 12. Next steps — moving to WhatsApp

The brain is done and reusable. To put it on WhatsApp, build a separate `whatsapp` transport
module; the brain itself doesn't change. Ordered roadmap:

### 12.1 Meta setup (no code)
1. Create a **Meta Business** account (Business Manager).
2. On **Meta for Developers**, create an app and add the **WhatsApp** (Cloud API) product.
3. Get a **phone number** for the WhatsApp Business Account (a test number works to start).
4. Collect credentials: `WHATSAPP_TOKEN` (access token), `WHATSAPP_PHONE_NUMBER_ID`,
   a `WHATSAPP_VERIFY_TOKEN` (you invent it), and the app **secret** (`WHATSAPP_APP_SECRET`)
   for signature verification.
5. **Business verification + a message template** are only needed to *start* conversations
   outside the 24h window. Our chatbot only *replies* within 24h of a user message — free-form,
   no template needed.

### 12.2 Build the `whatsapp` transport module
```
backend/src/modules/whatsapp/
├── whatsapp.module.ts          # imports ChatbotModule
├── whatsapp.controller.ts      # GET (verify) + POST (receive) webhook
├── whatsapp.service.ts         # parse payload, normalize number, send reply
└── dto/                        # webhook payload typing
```
Responsibilities:
1. **Webhook verify (GET):** echo `hub.challenge` when `hub.verify_token === WHATSAPP_VERIFY_TOKEN`.
2. **Webhook receive (POST):** verify the `X-Hub-Signature-256` HMAC over the raw body with
   `WHATSAPP_APP_SECRET`; extract the sender `wa_id` + text + message `id`.
3. **Ack fast:** return `200` immediately, then process asynchronously — Meta retries if the
   webhook is slow. Use the documented **SQS** queue (the LLM call can take a few seconds).
4. **Call the brain:** `chatbotService.handleIncomingMessage({ cellphone, text, messageId })`.
5. **Send the reply:** `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
   with `{ messaging_product: 'whatsapp', to, type: 'text', text: { body: reply } }` and the
   `WHATSAPP_TOKEN` bearer.

### 12.3 Gotchas to handle in the transport
- **Number normalization:** Meta sends `wa_id` like `573001112233` (no `+`). The DB stores
  cellphones as registered (e.g. `+57...`). Normalize before the resolver lookup or the user
  won't be found — match the exact format your registration writes.
- **Idempotency:** Meta re-delivers webhooks. Dedupe by message `id` before calling the brain.
- **24h session window:** reactive replies are free-form within 24h; proactive messages
  (HU-05 match notification) require an approved template.

### 12.4 Productionizing
- Move `WHATSAPP_*` and `OPENROUTER_API_KEY` to **Secrets Manager**; webhook behind HTTPS (ALB).
- Swap `ConversationCacheService` for a **Redis-backed** store once the backend runs multi-instance
  on ECS (the in-memory cache isn't shared across tasks).
- Add the missing `MatchesService`/`DatesService` and point the tools at them (the tools currently
  read Prisma directly).
