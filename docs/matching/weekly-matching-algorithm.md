# Weekly Matching Algorithm — Implementation Guide (HU-04)

> Scope: the **weekly matching engine** that generates one match per student per week.
> It is a **deterministic, explainable, non-AI algorithm** — no LLM calls, no embeddings.
> (The "AI model" wording in the original user story is a naming leftover.) The engine
> only produces `Match` rows; the venue-selection flow (HU-06) reacts to them separately.

---

## 1. What we're building

A self-contained piece of the `matches` module that, once a week, pairs eligible students
into mutually-compatible couples and writes one `Match` row per pair.

### Confirmed decisions

| Topic | Decision |
|---|---|
| Algorithm | **Stable matching (Gale–Shapley)**, realized as greedy maximum-weight edge selection over a symmetric score (see §7) |
| Determinism | Fully deterministic — same input pool → same matches, every run |
| Scoring | Weighted sum of 8 soft signals, each normalized to ~[0,1] (see §6) |
| Eligibility | Bidirectional hard filters = the "mutual compatibility" check (see §5) |
| No repeats | Any prior partner (any past week, any status) is excluded |
| Trigger | `@nestjs/schedule` `@Cron` — **Sundays 19:00 America/Bogota** |
| Match status written | `pending` (mirrors the vocabulary consumers already read) |
| Venue flow | Pull-based; inserting the `Match` row is the only integration point (see §10) |

### The 9 acceptance-criteria inputs → where each is used

| # | Input | Used in |
|---|---|---|
| 1 | Interests / hobbies | scoring — `sharedHobbyTerm` |
| 2 | Relationship type | scoring — `relationshipTerm` |
| 3 | Orientation / gender preference | eligibility — `attractedTo` (hard, mutual) |
| 4 | Age range | eligibility — `agesMutuallyInRange` (hard, mutual) |
| 5 | University / major | eligibility — `universityConstraintMet` + scoring — `majorTerm` |
| 6 | Semester | scoring — `semesterTerm` |
| 7 | Biography | scoring — `biographyTerm` (keyword overlap) |
| 8 | Physical (height + vibe) | scoring — `heightTerm`, `vibeTerm` |
| 9 | Historical feedback | scoring — `feedbackTerm` (attendance reliability) |

> Note on AC #8: "facial features" and "body build" have no field in the data model, so
> they are intentionally out of scope. Physical matching uses `Profile.height` +
> `Preferences.heightRange` and `Preferences.energyVibe`.

---

## 2. Pipeline

```
Cron (Sun 19:00 COT)  ──►  WeeklyMatchingService.runWeeklyMatching()
                              │
             1. loadCandidates()  ── verified · SEARCHING · onboarded · not in an active match
                              │        + priorPartners + feedback reliability
                              ▼
             2. stableMatch(candidates)   (pure engine)
                   ├─ build edges: areMutuallyEligible(a, b)   ← hard filters (mutual)
                   ├─ score edges: compatibilityScore(a, b)    ← soft signals
                   ├─ sort by score desc (deterministic ties)
                   └─ greedily take best still-free edge        ← stable matching
                              ▼
             3. persist()  ── Match{ userAId, userBId, compatibilityScore, status: 'pending' }
                              ▼
             (later, on demand) MatchesService.getVenueSuggestions()  ← HU-06 reacts to the row
```

The **engine** (steps building/scoring/matching) is pure — no Prisma, no NestJS — so it is
unit-testable in isolation. The **service** does I/O only.

---

## 3. Module layout

```
backend/src/modules/matches/
├── engine/                         # pure, infra-free — unit-tested
│   ├── types.ts                    # MatchCandidate, MatchPair
│   ├── eligibility.ts              # areMutuallyEligible() — hard filters
│   ├── scoring.ts                  # compatibilityScore() — soft signals
│   ├── stable-matching.ts          # stableMatch() — greedy stable pairing
│   └── *.spec.ts                   # engine unit tests + test-helpers.ts
├── weekly-matching.service.ts      # orchestration: load → engine → persist + @Cron
├── weekly-matching.constants.ts    # cron expr, timezone, status, score weights
├── weekly-matching.integration.spec.ts   # match generated → venue flow triggered
└── matches.module.ts               # registers ScheduleModule + WeeklyMatchingService

backend/src/scripts/run-weekly-matching.ts   # manual on-demand trigger
```

---

## 4. `MatchCandidate` — the engine's view of a student

The service flattens each `User` (+ `Profile`, `Preferences`, hobbies, feedback, match
history) into this infra-free shape so the engine never touches the DB:

```ts
interface MatchCandidate {
  userId: string;
  // hard-filter inputs
  gender: string; genderInterest: string;
  age: number; minAge: number; maxAge: number;
  university: string; requiresSameUniversity: boolean;
  // soft-score inputs
  relationshipType: string; major: string; semester: string;
  height: number; heightRange: string; vibes: string[];
  hobbies: string[]; biographyTokens: string[]; reliability: number;
  // no-repeat
  priorPartnerIds: Set<string>;
}
```

---

## 5. Eligibility — hard filters (mutual)

`areMutuallyEligible(a, b)` returns `true` only if **every** rule passes in **both
directions**. That bidirectional check *is* the acceptance criterion "both users must have
expressed compatible preferences with each other".

| Rule | Logic |
|---|---|
| Not self / not a repeat | `a.userId !== b.userId`, and neither is in the other's `priorPartnerIds` |
| Attraction (AC #3) | `attractedTo(a, b) && attractedTo(b, a)` |
| Age (AC #4) | `b.age ∈ [a.minAge, a.maxAge]` **and** `a.age ∈ [b.minAge, b.maxAge]` |
| University (AC #5) | if either sets `requiresSameUniversity`, both must share `university` |

`attractedTo(viewer, target)`: `true` if `viewer.genderInterest === 'Todos'`, else the
target's gender must map to the viewer's interest bucket:

```
Masculino → Hombres    Femenino → Mujeres    No binario → No binario
```

`Prefiero no decir` has no bucket, so such a profile only matches partners open to `Todos`.

> **Why genderInterest, not orientation?** `genderInterest` is the enumerable "who I want"
> field; it operationally encodes AC #3 ("orientation + gender preference"). The free-form
> `orientation` label is not used as a hard filter to avoid contradictions.

Only pairs that pass eligibility become **edges** in the matching graph.

---

## 6. Scoring — soft signals

`compatibilityScore(a, b)` is a weighted sum of eight terms, each normalized to ~[0,1] and
**symmetric** (either it treats both sides the same, or averages the two one-directional
views), so both users receive one identical score. Weights live in
`weekly-matching.constants.ts`:

| Term | Weight | Formula (normalized to [0,1]) | AC |
|---|---|---|---|
| Shared hobbies | 5 | `min(sharedCount, 4) / 4` | 1 |
| Relationship type | 3 | `1` exact · `0.5` if either is "Abierto a todo" · else `0` | 2 |
| Same major | 1 | `1` if equal else `0` | 5 |
| Semester proximity | 1 | numeric: `max(0, 1 − |sa − sb| / 9)`; non-numeric: `1` if equal else `0` | 6 |
| Biography overlap | 2 | `sharedTokens / min(|tokensA|, |tokensB|)` (0 if either empty) | 7 |
| Height preference | 1 | average of each side's `heightPreferenceMet` (0/1) | 8 |
| Energy / vibe | 2 | `sharedVibes / min(|vibesA|, |vibesB|)` | 8 |
| Feedback reliability | 1 | `((reliabilityA + reliabilityB) / 2 + 1) / 2` | 9 |

`heightPreferenceMet(viewer, target)` with `delta = target.height − viewer.height`:
`Más alta → delta > 0` · `Más baja → delta < 0` · `Similar → |delta| ≤ 5 cm` ·
`Indiferente → always true`.

`reliability ∈ [−1, 1]` per user = `(2·attendedDates − totalDates) / totalDates`
(0 with no feedback). Reliable attendees score higher than chronic no-shows.

The final score is **rounded to 4 decimals** for stable, comparable values.
**Maximum possible score = sum of weights = 16.0.**

Tuning is centralized: change `SCORE_WEIGHTS`, `MAX_SCORED_SHARED_HOBBIES` (4) or
`SIMILAR_HEIGHT_CM` (5) and only ranking changes — eligibility is unaffected.

---

## 7. Stable matching — why greedy = stable here

`stableMatch(candidates)`:

1. Build every eligible **edge** `(a, b)` with its `compatibilityScore`. The pair is
   ordered by id (`aId < bId`) so the same two users always yield the same `Match` row.
2. Sort edges by **score descending**, tie-broken by `aId` then `bId` (deterministic).
3. Walk the sorted list; take an edge only if **both** endpoints are still free; mark them
   taken. Continue to the end.

**Why this is a stable matching (no blocking pair).** Preferences here are *symmetric*: `a`
ranks `b` and `b` ranks `a` by the **same** score. When `(a, b)` is the highest-scoring edge
still available, neither can prefer some other still-available partner who also prefers them
back — every alternative scores lower for both. Removing them and recursing preserves the
property, so the result has no blocking pair. This gives Gale–Shapley's stability guarantee
at `O(E log E)`, which is ample for a few-hundred-student cohort.

Students with no eligible partner this week (odd pool, or heavily constrained) are simply
left unmatched and roll into the next cycle.

---

## 8. No-repeat + idempotency

- **No repeats:** `loadCandidates()` queries every `Match` row touching each candidate
  (any week, any status) and fills `priorPartnerIds`. Eligibility then excludes those pairs.
- **Idempotency / one-per-week:** the eligible pool excludes anyone already in an *active*
  match (`status ∈ { pending, confirmed }`) and any profile whose `status !== SEARCHING`
  (i.e. `PAUSED`). A double cron-fire therefore creates no duplicates — the freshly-paired
  users are already "busy" on the second pass.

No schema changes are required for either rule. *(Optional future optimization: indexes on
`Match.userAId` / `Match.userBId` to speed the history lookup at large volume.)*

---

## 9. Weekly trigger

Registered in `matches.module.ts` via `ScheduleModule.forRoot()`:

```ts
@Cron(WEEKLY_MATCHING_CRON, { timeZone: WEEKLY_MATCHING_TIMEZONE })
async handleWeeklyCron() { await this.runWeeklyMatching(); }
```

`WEEKLY_MATCHING_CRON = '0 19 * * 0'` (Sunday 19:00), `WEEKLY_MATCHING_TIMEZONE =
'America/Bogota'`. Colombia has no DST, so the zone is a stable UTC−5. `runWeeklyMatching()`
is **public** so it can be invoked on demand by the manual script or a test without waiting
for the clock.

---

## 10. Integration with the venue-selection flow (HU-06)

The venue flow is **pull-based and decoupled** — there is no event or method to call. It
keys entirely off the existence of an active `Match` row:

1. Matching inserts `Match{ userAId, userBId, compatibilityScore, status: 'pending' }`.
2. When a user opens venue selection, `MatchesService.getVenueSuggestions()` lazily creates
   the 3 `VenueOption` rows from the pair's shared interests.

So **the only integration is producing the row.** The matcher does **not** import or modify
`VenuesService` or `MatchesService`. Precondition surfaced by that flow: at least 3 active
venues must exist, else `getVenueSuggestions()` throws.

---

## 11. Data model touchpoints

| Entity | Read | Written |
|---|---|---|
| `User` | isVerified | — |
| `Profile` | gender, dateOfBirth, height, biography, university, major, semester, status, hobbies | — |
| `Preferences` | relationshipType, orientation*, minAge, maxAge, genderInterest, sameUniversity, heightRange, energyVibe | — |
| `Match` | userAId/userBId (history), status (active check) | **inserts** `pending` rows with `compatibilityScore` |
| `Feedback` | occurred (reliability) | — |

`*orientation` is loaded but not used as a hard filter (see §5).

---

## 12. Acceptance-criteria traceability

| Criterion | Satisfied by |
|---|---|
| Analyzes the 9 inputs | eligibility (§5) + scoring (§6) — see the §1 table |
| Runs weekly, Sunday 7pm | `@Cron` (§9) |
| Exactly 1 match/week | Gale–Shapley gives ≤1 partner; active-match exclusion prevents extras (§8) |
| Maximizes compatibility | greedy on the symmetric score yields a stable matching (§7) |
| Mutual compatibility | bidirectional eligibility edge (§5) |
| No repeat matches | `priorPartnerIds` excluded from edges (§8) |

---

## 13. Running it

**Manually (on demand):**

```bash
cd backend
npm run build
node dist/src/scripts/run-weekly-matching.js
# prints the created pairs + scores; new matches appear in /admin/matches as "Pendiente"
```

Prerequisites: DB running, migrations applied (`npx prisma migrate deploy`), and an eligible
pool (verified, `SEARCHING`, onboarded, not already in an active match).

**Tests:**

```bash
cd backend
npx jest src/modules/matches
# engine unit tests (eligibility incl. mutual + no-repeat, scoring, stable pairing)
# + integration test: a generated match triggers venue suggestions
```

---

## 14. Edge cases & limitations

- **Odd / over-constrained pool** → leftover students roll to next week (by design).
- **Incomplete profiles** (no profile or preferences) are filtered out of the pool.
- **`Prefiero no decir` gender** only matches partners open to `Todos` (§5).
- **Facial features / body build** are not modeled (§1 note); only height + vibe.
- **Global optimum vs. stability:** the algorithm optimizes for *stability* (no blocking
  pair), not the maximum *sum* of scores across the cohort — the right call for a two-sided
  dating market.
- **Feedback signal is thin** early on (few completed dates); its weight (1) is deliberately
  the smallest so it nudges rather than dominates.

---

## 15. Extension points

- **Tuning:** adjust `SCORE_WEIGHTS` / caps in `weekly-matching.constants.ts`.
- **New signals:** add a term in `scoring.ts` + a field on `MatchCandidate`; eligibility and
  stable-matching stay untouched.
- **Scale:** add `Match.userAId/userBId` indexes; if the cohort grows into the thousands per
  run, the `O(n²)` edge build can move to a pre-filtered candidate query.
- **Deploy target:** the CLAUDE.md vision is AWS Lambda + EventBridge. `runWeeklyMatching()`
  is already infra-agnostic, so a Lambda handler can call it instead of the in-process cron.
