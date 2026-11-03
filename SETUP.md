# Drizzle + Neon + Better Auth setup

Copy the files in this folder into your project root (they mirror your `src/` layout).
`src/modules/dashboard/view/dashboard-view.tsx` replaces your current dashboard view.

## 1. Install

```bash
pnpm add drizzle-orm @neondatabase/serverless better-auth
pnpm add -D drizzle-kit dotenv
```

## 2. Environment

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL`: Neon dashboard -> your project -> Connect -> pooled connection string
- `BETTER_AUTH_SECRET`: run `openssl rand -base64 32`
- `BETTER_AUTH_URL`: `http://localhost:3000` locally

## 3. Add scripts to package.json

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

## 4. Create the tables

```bash
pnpm db:push
```

(Use `pnpm db:generate` then `pnpm db:migrate` instead if you want migration files.)

## 5. Run it

```bash
pnpm dev
```

Open `/sign-up`, create an account, and you land on `/dashboard`.
Add `<SignOutButton />` from `src/modules/auth/sign-out-button.tsx` to your navbar.

## How it fits together

- `src/lib/db/schema.ts`: Better Auth tables (user, session, account, verification) plus `summaries` for history
- `src/lib/auth.ts` / `auth-client.ts`: Better Auth server and client
- `src/app/api/auth/[...all]/route.ts`: Better Auth endpoints
- `src/app/(protected)/layout.tsx`: redirects signed-out users to `/sign-in`
- `src/app/(auth)/layout.tsx`: redirects signed-in users to `/dashboard`
- `src/app/api/summaries/*`: per-user history (list, save, delete one, clear all)
