# TheConnection

Exclusive dating app for students at private universities in Colombia. Delivers one AI-curated match per week and drives it all the way to a confirmed in-person date.

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+

---

## 1. Clone the repository

```bash
git clone https://github.com/JuanTrujilloM/theconnection.git
cd theconnection
```

---

## 2. Install dependencies

Run this in two separate terminals (or sequentially):

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 3. Configure environment variables

### Backend — create `backend/.env`

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=<your-local-key>"
JWT_SECRET=any-random-string-for-local-dev
JWT_EXPIRES_IN=7d

# Optional for local dev (leave empty if not testing these features)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
OPENAI_API_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_SQS_QUEUE_URL=
```

> The `DATABASE_URL` is already set in the `.env` file included in the repo. No need to change it.

### Frontend — create `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

---

## 5. Start the development servers

This project requires **3 terminals** open at the same time:

**Terminal 1 — Database** (must be running before the backend starts):

```bash
cd backend
npx prisma dev
```

> This starts a local Postgres database managed by Prisma. No separate PostgreSQL installation needed. Keep this terminal open the entire time you work.

**Terminal 2 — Backend** (runs on port 3001):

```bash
cd backend
npm run start:dev
```

**Terminal 3 — Frontend** (runs on port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The API is available at [http://localhost:3001](http://localhost:3001).

---

## Useful commands

```bash
# Regenerate Prisma client after schema changes
cd backend && npx prisma generate

# Open the visual database explorer
cd backend && npx prisma studio

# Lint
cd backend && npm run lint
cd frontend && npm run lint

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

---

## Project structure

```
theconnection/
├── frontend/    # Next.js 14 + Tailwind CSS
└── backend/     # NestJS + Prisma ORM
```

See [CLAUDE.md](CLAUDE.md) for full architecture, data model, and code conventions.
