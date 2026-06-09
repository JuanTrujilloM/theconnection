# TheConnection

Exclusive dating app for students at private universities in Colombia. Delivers one AI-curated match per week and drives it all the way to a confirmed in-person date.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [PostgreSQL 16](https://www.postgresql.org/) via Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
```

---

## 1. Clone the repository

```bash
git clone https://github.com/JuanTrujilloM/theconnection.git
cd theconnection
```

---

## 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 3. Create the database

```bash
createdb theconnection
```

---

## 4. Configure environment variables

### Backend — `backend/.env`

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://<your-mac-username>@localhost:5432/theconnection"

# Optional for local dev (leave empty if not testing these features)
JWT_SECRET=any-random-string-for-local-dev
JWT_EXPIRES_IN=7d
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
OPENAI_API_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_SQS_QUEUE_URL=
```

> Replace `<your-mac-username>` with your system username (e.g. `juantrujillo`). No password required locally.

### Frontend — `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

This creates all tables in the local database.

---

## 6. Start the development servers

**Terminal 1 — Backend** (port 3001):

```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend** (port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## What's running

The home page at `http://localhost:3000` shows:

- **Frontend** status (Next.js)
- **Backend** status (NestJS on `:3001`)
- **Database** status (PostgreSQL — connected / disconnected)
- List of **registered users** in the database

### Available API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend and database status |
| GET | `/users` | User list (without `passwordHash`) |

---

## Useful commands

```bash
# Add a migration after changing the schema
cd backend && npx prisma migrate dev --name <name>

# Regenerate the Prisma client
cd backend && npx prisma generate

# Visual database explorer
cd backend && npx prisma studio

# Lint
cd backend && npm run lint
cd frontend && npm run lint
```

---

## Project structure

```
theconnection/
├── frontend/
│   └── src/
│       ├── app/                 # Pages (Next.js App Router)
│       ├── components/shared/   # Reusable components
│       ├── hooks/               # State management with React Query
│       └── lib/api/             # Backend API calls
└── backend/
    ├── prisma/
    │   ├── schema/              # One .prisma file per model
    │   └── migrations/          # SQL migration history
    └── src/
        ├── config/              # PrismaService, PrismaModule
        └── modules/
            ├── health/          # GET /health
            └── users/           # GET /users
```

See [CLAUDE.md](CLAUDE.md) for full architecture, data model, and code conventions.
