# CLAUDE.md — TheConnection

## What is this project

TheConnection is an exclusive dating app for students at private universities in Colombia. Unlike Tinder or similar apps, it operates as a weekly curated service that uses AI to generate a single match per week and drives it all the way to a real in-person date at a physical venue, in an automated and secure way.

**Vision:** Help university students in Colombia meet real, safe people without spending weeks scrolling.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS + React Query |
| Backend | NestJS + Prisma ORM |
| Database | PostgreSQL + pgvector (AI embeddings) |
| WhatsApp Bot | NestJS + Meta WhatsApp Cloud API |
| Weekly Matching | AWS Lambda + EventBridge (cron Sundays 7pm) |
| Queues | AWS SQS |
| Photo Storage | AWS S3 |
| Frontend Deploy | AWS Amplify |
| Backend Deploy | AWS ECS (Fargate) |
| Secrets | AWS Secrets Manager |
| CI/CD | GitHub Actions |
| AI Embeddings | OpenAI text-embedding-ada-002 |

---

## Project Structure

```
theconnection/
├── frontend/                        # Next.js app
│   ├── app/                         # App Router — pages only
│   └── src/
│       ├── components/              # Reusable UI components
│       │   ├── ui/                  # shadcn/ui base components
│       │   ├── forms/               # Domain-specific forms
│       │   └── shared/              # Navbar, layouts, etc.
│       ├── hooks/                   # All state logic
│       ├── lib/
│       │   ├── api/                 # All backend calls
│       │   └── auth/                # Auth logic
│       └── types/                   # Global TypeScript types
│
├── backend/                         # NestJS API
│   ├── src/
│   │   ├── modules/                 # One module per domain
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── profile/
│   │   │   ├── preferences/
│   │   │   ├── matches/
│   │   │   ├── availability/
│   │   │   ├── venues/
│   │   │   ├── feedback/
│   │   │   ├── payments/
│   │   │   └── whatsapp/
│   │   ├── common/
│   │   │   ├── guards/              # JwtAuthGuard, etc.
│   │   │   ├── decorators/          # @CurrentUser, etc.
│   │   │   └── filters/             # Global error handling
│   │   ├── config/                  # PrismaService, app.config.ts
│   │   └── lambdas/                 # Weekly matching Lambda code
│   └── prisma/
│       └── schema.prisma            # Single source of truth for data model
│
└── infrastructure/
    ├── ecs/task-definition.json     # ECS Fargate config
    └── eventbridge-rule.json        # Weekly matching cron
```

---

## Data Model

**User**
- id, email, cellphone, passwordHash, isVerified, createdAt, updatedAt
- Relations: 1 Profile, 1 Preferences, N Matches, N Availability, N Photos

**Profile**
- id, userId, name, dateOfBirth, gender, height, biography, university, major, semester
- Relations: N ProfileInterest → Interest

**Preferences**
- id, userId, relationshipType, orientation, minAge, maxAge, genderInterest, sameUniversity, heightRange, energyVibe

**Match**
- id, userAId, userBId, compatibilityScore (float), status, createdAt, updatedAt
- Relations: 0..1 Date, N VenueOption, N Availability

**Date**
- id, matchId, venueId, scheduledAt, status, createdAt, updatedAt
- Relations: 0..2 Feedback

**Availability**
- id, matchId, userId, date, timeSlot, createdAt, updatedAt

**Venue**
- id, name, type, address, openingHours, description, commissionRate, averageSpentPerPerson
- Relations: N VenueOption

**VenueOption**
- id, matchId, userAId, userBId, venueId, userASelected (bool), userBSelected (bool)

**Feedback**
- id, dateId, userId, occurred (bool), rating (int), comments, noShowReason, amountSpent

**Photo**
- id, userId, url, isPrimary (bool)

**Interest**
- id, name, category
- Relations: N ProfileInterest

**Report**
- id, userAId, userBId, createdAt

---

## User Stories

### HU-01: Registration with university email
Validate that the domain belongs to a supported private university. Send a verification code. Supported domains: eafit.edu.co, upb.edu.co, ces.edu.co, eia.edu.co, javeriana.edu.co, uniandes.edu.co, urosario.edu.co, externado.edu.co.

### HU-02: Personal information
Fields: name, date of birth (>17), gender, height, photos (1–5), biography (max 150 chars), social media (optional), university (auto-detected from email), major, semester, first thing you want your date to know about you.

### HU-03: Interests and preferences
Fields: interests (multi-select, min 3), hobbies (min 3), relationship type, sexual orientation, height and body type preference, facial features (optional), energy/vibe.

### HU-04: AI matching algorithm
Runs weekly. Evaluates: interests, hobbies, relationship type, orientation, physical preferences, energy/vibe, university, semester. Generates exactly 1 match per user without repeating previous matches.

### HU-05: Match notification via WhatsApp
Sends name, age, university, major, photo, bio of the match + unique tokenized link to select availability.

### HU-06: Venue selection
Suggests 3 venues aligned with shared interests and available during selected time slots. User must choose at least 2 of 3.

### HU-07: Accept or reject match
Options: Accept / Reject. 24h timeout with no response = automatic rejection. If one rejects, both move to the next weekly cycle.

### HU-08: Final confirmation
When both accept and there is an overlap in availability and venue, the system automatically confirms and notifies via WhatsApp with: match name, venue, address, date, and time.

### HU-09: Time availability selection
Calendar with the next 7 days, time slots from 12pm to 7pm in 1-hour intervals. At least 1 slot required.

### HU-10: Post-date feedback
24h after the date: did it happen? (Yes / No / I didn't go), 1–5 rating, comments. If no response within 48h, one reminder then the window closes.

---

## Product Flow

```
1. Register with .edu.co email → email verification code
2. Onboarding: personal info → interests → preferences
3. Every Sunday 7pm → matching Lambda runs
4. WhatsApp: match notification + availability link
5. User A and B select time slots (HU-09)
6. System suggests 3 venues based on shared interests (HU-06)
7. Users accept or reject match (HU-07)
8. Both accept + overlap found → date confirmed (HU-08)
9. 24h after date → bot asks for feedback (HU-10)
10. Feedback feeds the AI model to improve future matches
```

---

## System Actors

- **Student (primary user):** registers, receives matches, confirms dates, gives feedback
- **Match (secondary user):** the other student in the pair, identical flow
- **AI Matching Engine:** weekly Lambda that generates matches
- **WhatsApp Bot:** handles all communication outside the web platform
- **Partner Venue:** café/restaurant that pays commission per confirmed reservation
- **System Administrator:** moderates profiles, manages university domains and venues

---

## Business Model

- **Revenue:** commission from venues per generated reservation
- **Main costs:** AWS infrastructure, AI model, data compliance (Habeas Data), moderation and security
- **Channels:** university marketing (events, posters), digital campaigns, referrals
- **Direct competitors:** Tinder, Hinge (global, unverified), Colombian Cupid (universities only)
- **Reference apps:** Ditto AI (USA), Iris (physical only), Stitch (USA, small pool)

---

## Code Architecture

### Core rule
**One single responsibility per layer.** If you need the word "and" to describe what something does, it needs to be split.

### Backend — NestJS

```
Request → Controller → Service → Prisma → Response
```

| Layer | Responsibility | What it must NOT do |
|---|---|---|
| Controller | Receive request, call service, return response | Business logic, DB queries |
| Service | All business logic | Direct DB queries, handle HTTP |
| Prisma | Database access | Business logic |
| DTO | Validate and type the input | Business logic |
| Guard | Verify authentication/authorization | Business logic |

**Module structure:**
```
modules/users/
├── users.module.ts       # Registers the module in NestJS
├── users.controller.ts   # Routes and responses only
├── users.service.ts      # All business logic
└── dto/
    ├── create-user.dto.ts
    └── update-user.dto.ts
```

### Frontend — Next.js

```
Page (app/) → Hook (hooks/) → API client (lib/api/) → Backend
```

| Layer | Responsibility | What it must NOT do |
|---|---|---|
| app/ (pages) | Assemble components, define layout | Logic, direct fetch calls |
| components/ | Render UI, receive props | Backend calls, global state |
| hooks/ | State logic with React Query | Render UI |
| lib/api/ | HTTP calls to the backend | State management, rendering |

---

## Code Conventions

### Naming
- Functions: descriptive verbs → `findUserByEmail`, `generateWeeklyMatches`, `sendWhatsAppNotification`
- Components: PascalCase → `MatchCard`, `AvailabilityCalendar`
- Hooks: `use` prefix → `useCurrentUser`, `useMatchDetails`
- Variables: descriptive camelCase → `compatibilityScore`, `isVerified`
- No abbreviations → `userId` not `uid`, `availability` not `avail`

### TypeScript
- No `any` — always type correctly
- Interfaces for domain objects, types for unions
- DTOs with class-validator on the backend
- Zod for form validation on the frontend

### General
- Short functions — if it doesn't fit on screen, split it
- No obvious comments — the code explains itself
- Comment the **why**, not the **what**
- No logic in controllers
- No direct fetch calls inside components or pages

---

## Environment Variables

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/theconnection
JWT_SECRET=...
JWT_EXPIRES_IN=7d
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
OPENAI_API_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=theconnection-media
AWS_SQS_QUEUE_URL=...
```

---

## Common Commands

```bash
# Development
npm run dev              # Runs frontend (3000) and backend (3001) in parallel
npm run dev:front        # Frontend only
npm run dev:back         # Backend only

# Database
npm run prisma:migrate   # Creates and applies a new migration
npm run prisma:generate  # Regenerates the Prisma client
npm run prisma:studio    # Opens the visual DB explorer

# Build
npm run build:all        # Builds frontend and backend
```

---

## AWS Deploy

| Service | Purpose |
|---|---|
| Amplify | Next.js frontend — auto-deploy from GitHub |
| ECS Fargate | NestJS backend in Docker container |
| ECR | Docker image registry |
| RDS PostgreSQL | Main database |
| S3 | Profile photo storage |
| SQS | WhatsApp message queue |
| Lambda | Weekly matching (cron Sundays 7pm Colombia) |
| EventBridge | Triggers Lambda: `cron(0 0 ? * MON *)` |
| Secrets Manager | Sensitive env vars in production |
| CloudWatch | Backend and Lambda logs |

**Deploy flow:**
```
git push origin main
→ GitHub Actions: lint → test
→ Backend: docker build → push ECR → deploy ECS
→ Frontend: trigger Amplify build
```

**Required GitHub Actions secrets:**
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AMPLIFY_APP_ID
```

---

## Supported Universities

**Phase 1 — Medellín**
- EAFIT → eafit.edu.co
- UPB → upb.edu.co
- CES → ces.edu.co
- EIA → eia.edu.co

**Phase 2 — Bogotá**
- Javeriana → javeriana.edu.co
- Uniandes → uniandes.edu.co
- Rosario → urosario.edu.co
- Externado → externado.edu.co