# NombaLens local runbook

## Prerequisites
- Node.js 20+
- pnpm 10+
- A Nomba sandbox account with client_id and client_secret
- A Supabase project with DATABASE_URL
- An Upstash Redis instance with REDIS_URL
- A Resend account with RESEND_API_KEY

## First-time setup
1. Clone the repo.
2. Run pnpm install from the repo root.
3. Copy apps/backend/.env.example to apps/backend/.env and fill in all values.
4. Copy apps/dashboard/.env.example to apps/dashboard/.env.local and fill in all values.
5. Run pnpm --filter backend check:env to verify backend env.
6. Run pnpm --filter backend check:db to verify database connection.
7. Run pnpm --filter backend check:redis to verify Redis connection.
8. Run pnpm --filter backend check:nomba to verify Nomba API auth.
9. Run pnpm --filter backend db:migrate to run Drizzle migrations.

## Running locally
- Start backend: pnpm dev:backend (port 4000)
- Start dashboard: pnpm dev:dashboard (port 3000)
- Build widget: pnpm --filter widget build
- Run all: pnpm dev (starts backend and dashboard concurrently)

## Verifying connections
- Backend health: GET http://localhost:4000/health
- Dashboard health page: http://localhost:3000/health
- Widget test: open apps/widget/test.html in a browser (backend must be running)

## Running smoke tests
- pnpm --filter backend test:webhook (tests checkout_created → payment_success flow)
- pnpm --filter backend test:recovery (tests abandoned checkout recovery — takes ~70 seconds)

## Exposing webhooks for Nomba sandbox
Use ngrok to expose the local backend:

```bash
ngrok http 4000
```

Register the resulting URL + /webhooks/nomba in your Nomba sandbox dashboard. Update your .env NOMBA_WEBHOOK_URL accordingly.

## Common issues
- "Cannot reach backend" on dashboard health page → backend is not running on port 4000
- Redis connection failed → check REDIS_URL is the full Upstash connection string including password
- Nomba auth failed → confirm NOMBA_BASE_URL ends with /v1 and credentials are from sandbox not production
- BullMQ jobs not firing → confirm Redis is connected and the worker in jobs/recoveryJob.ts is imported and started in server.ts
- Widget not reordering → open test.html with debug: true and check browser console for NombaLens logs
