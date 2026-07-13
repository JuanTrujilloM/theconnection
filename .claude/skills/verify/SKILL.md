---
name: verify
description: How to run and drive TheConnection locally to verify changes end-to-end (servers, test login, browser driving).
---

# Verifying TheConnection changes

## Servers
The developer usually already has both dev servers running — check before starting your own:
- Frontend: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` (Next.js dev)
- Backend: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/auth/me` (401 = up)
- Backend `npm run start:dev` runs in watch mode, so backend code edits hot-reload into an already-running server. A guarded route answers 401 when registered, 404 when the server predates it.
- If not running: `npm run dev` at the repo root starts both (3000 + 3001).

## Database
Local Postgres: `postgresql://theconnection:theconnection@localhost:5432/theconnection`.
`npm run db:seed` (backend) creates verified students with profiles/preferences/matches. Seeded users have NO password — auth is passwordless (email code).

## Getting a session as a seeded user
Codes are bcrypt-hashed in `EmailVerificationCode`. Issue one, overwrite its hash with a known code, then verify:
```bash
curl -s -X POST http://localhost:3001/auth/login -H 'Content-Type: application/json' -d '{"email":"camila.herrera@uniandes.edu.co"}'
HASH=$(node -e "console.log(require('/path/to/backend/node_modules/bcryptjs').hashSync('123456',10))")
psql "postgresql://theconnection:theconnection@localhost:5432/theconnection" -c "UPDATE \"EmailVerificationCode\" SET \"codeHash\"='$HASH' WHERE \"userId\"=(SELECT id FROM \"User\" WHERE email='camila.herrera@uniandes.edu.co') AND \"consumedAt\" IS NULL;"
curl -s -c cookies.txt -X POST http://localhost:3001/auth/verify -H 'Content-Type: application/json' -d '{"email":"camila.herrera@uniandes.edu.co","code":"123456"}'
```
Session cookies are `access_token` / `refresh_token` on `localhost`; `curl -b cookies.txt` hits guarded API routes.

## Driving the UI
Playwright works headless (install `playwright` + `npx playwright install chromium` in the scratchpad). Load the curl cookie jar into the browser context (domain `localhost` — cookies ignore ports, so the 3001 session works on the 3000 app). Use a ~480px viewport: the app is phone-shaped (PhoneShell).

## Gotchas
- `npx tsc --noEmit` in frontend can fail on stale `.next/types/routes` after adding a route — run `npx next typegen` first.
- Pre-existing failures unrelated to most changes: backend `app.controller.spec.ts` (references removed `getHello`) breaks backend tsc/lint; `main.ts` has a no-floating-promises lint warning.
- If you mutate seeded rows while testing, restore them (or rerun `npm run db:seed`, which wipes domain tables).
