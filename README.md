# Shalom Conference

Shalom Conference is a full-stack website and event operations platform for the Shalom Youth Conference. It combines a public conference website with registration, attendee badges, email confirmations, QR-code check-in, merchandise preorders, response forms, and an authenticated administration area.

## What Is In This Repo

- `artifacts/shalom` - the main Shalom Conference web app. This is a Vite React app using Tailwind CSS, Radix UI components, Wouter routing, React Query, Framer Motion, and Lucide icons.
- `artifacts/api-server` - an Express 5 API server for registration, attendee badges, check-in, admin accounts, merchandise orders, testimonies, prayer-chain signups, and response forms.
- `artifacts/mockup-sandbox` - a Vite preview app used for component/mockup rendering.
- `lib/api-spec` - the OpenAPI contract in `openapi.yaml` plus Orval code generation config.
- `lib/api-client-react` - generated React Query API hooks and a custom fetch wrapper.
- `lib/api-zod` - generated Zod schemas/types from the OpenAPI contract.
- `lib/db` - PostgreSQL/Drizzle setup and schemas for registrations, check-in, admin users, merchandise, testimonies, prayer-chain signups, and event response forms.
- `scripts` - small workspace scripts.

## Tech Stack

- Node.js 24
- pnpm workspaces
- TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS 4, Radix UI, Wouter, React Query, Framer Motion
- API: Express 5, Pino logging, CORS
- Data layer: PostgreSQL, Drizzle ORM, Drizzle Kit
- API contract/codegen: OpenAPI 3.1, Orval, Zod

## Prerequisites

Install:

- Node.js 24
- pnpm
- PostgreSQL, only if you are working on database-backed API features

This workspace enforces pnpm. `npm install` and `yarn install` are intentionally blocked by the root `preinstall` script.

## Install Dependencies

From the repo root:

```sh
pnpm install
```

## Run The Frontend

The main app is in `artifacts/shalom`. Its Vite config requires `PORT` and `BASE_PATH`.

```sh
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/shalom dev
```

Open:

```text
http://localhost:5173
```

The frontend includes the public conference site, registration and attendee-badge flow, conference archive, merchandise preorder page, Prayer Charge forms, testimony submission, and the admin/check-in interface.

## Run The API Server

The API server requires a `PORT` environment variable.

```sh
PORT=5000 pnpm --filter @workspace/api-server dev
```

Check the health endpoint:

```sh
curl http://localhost:5000/api/healthz
```

Expected response:

```json
{ "status": "ok" }
```

The API imports the shared database package, so `DATABASE_URL` is required:

```sh
PORT=5000 DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME pnpm --filter @workspace/api-server dev
```

## Database Setup

The database package lives in `lib/db` and uses Drizzle Kit. Set `DATABASE_URL` before running database commands.

```sh
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME pnpm --filter @workspace/db push
```

Schema modules are in `lib/db/src/schema`. The entry point, `lib/db/src/schema/index.ts`, defines testimony and merchandise tables and exports the registration, check-in, prayer-chain, response-form, and admin-user schemas.

## Environment Variables

The API uses the following environment variables:

- `PORT` - required server port.
- `DATABASE_URL` - required PostgreSQL connection string.
- `SESSION_SECRET` - required for authenticated admin sessions.
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` - optional bootstrap credentials used to create the first admin account when no account exists.
- `SITE_URL` - public site URL used in email content; defaults to `https://shalomconference.com`.
- `PRIVATE_OBJECT_DIR` - private object-storage directory used for attendee portraits.
- `LOG_LEVEL` - optional Pino log level; defaults to `info`.

Email delivery uses the Replit `google-mail` connector.

## API Contract And Generated Code

The OpenAPI source of truth is:

```text
lib/api-spec/openapi.yaml
```

After editing the OpenAPI spec, regenerate the React client and Zod schemas:

```sh
pnpm --filter @workspace/api-spec codegen
```

Generated output goes to:

- `lib/api-client-react/src/generated`
- `lib/api-zod/src/generated`

## Common Commands

Run a full typecheck:

```sh
pnpm run typecheck
```

Build everything:

```sh
pnpm run build
```

Build only the frontend:

```sh
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/shalom build
```

Preview the built frontend:

```sh
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/shalom serve
```

Build and start only the API server:

```sh
pnpm --filter @workspace/api-server build
PORT=5000 pnpm --filter @workspace/api-server start
```

Run the API test suite:

```sh
pnpm --filter @workspace/api-server test
```

## How The Pieces Fit Together

Frontend routing is defined in `artifacts/shalom/src/App.tsx`. It includes the home page, registration, Prayer Charge, conference archive and year pages, about, partnership, shop, testimonies, legal pages, and admin interface. Current and archived conference content is maintained in `artifacts/shalom/src/data/conferences.ts`.

The API starts from `artifacts/api-server/src/index.ts`, creates the Express app in `artifacts/api-server/src/app.ts`, and mounts routes under `/api`. Route modules live in `artifacts/api-server/src/routes` and validate request and response shapes with generated schemas from `@workspace/api-zod`.

The API contract flows from `lib/api-spec/openapi.yaml` into generated TypeScript clients and validators. That keeps the backend response shapes, frontend API hooks, and runtime validation tied to the same contract.

The database package exports a Drizzle client from `lib/db/src/index.ts`. It requires `DATABASE_URL` as soon as it is imported.

Registration creates database records and sends confirmation emails with QR-code check-in credentials. Attendees can optionally upload a portrait through private object storage and receive a generated shareable badge. Admin and check-in accounts use signed, HTTP-only cookie sessions with role-based access.

## Notes And Gotchas

- Vite commands for `artifacts/shalom` and `artifacts/mockup-sandbox` require both `PORT` and `BASE_PATH`.
- The root `build` command runs typechecking first, then builds all packages with build scripts.
- Public informational pages can render without the API, but registration, forms, merchandise orders, testimonies, and admin features require the API and database.
- Admin authentication requires `SESSION_SECRET`; without it, login cannot establish a session.
- The first admin can be bootstrapped with `ADMIN_USERNAME` and `ADMIN_PASSWORD`. After that, full administrators can create additional admin or check-in accounts.
- Do not hand-edit generated files under `lib/api-client-react/src/generated` or `lib/api-zod/src/generated`; update `lib/api-spec/openapi.yaml` and run codegen instead.

### New believers follow-up

`/newconverts` welcomes new believers and submits consented contact details to `POST /api/new-converts`. Signed-in administrators can view them in the New believers section of `/admin`; the GET endpoint requires the existing admin session.

Before deploying this feature, apply `lib/db/migrations/20261007_new_converts.sql` to the target PostgreSQL database (or use the existing Drizzle schema push workflow). The migration only adds the `new_converts` table. No email is sent automatically.

The new believers form also records whether someone already has a local church. Before deploying this update, apply `lib/db/migrations/20261007_new_converts_local_church.sql` (or use Drizzle schema push). Existing records keep an unanswered status.

### Staff access and conference feedback

Full administrators can create accounts in `/admin` with these access levels:

- Full admin: all admin sections and account management.
- Registration count only: total registered people, without attendee details.
- New converts only: new believer follow-up records, including local church status.
- Check-in only: minimal attendee roster, QR scanning, manual check-in and undo.
- Registrations and check-in: registration details and count, plus the check-in desk.

Only full admins can create/delete check-in sessions, send replacement QR emails, delete registrations, manage accounts, or read conference feedback. Create conference check-in sessions with a full admin account before staff use the check-in desk.

`/survey` collects anonymous feedback for Shalom Conference 2026 (overall rating, highlights, improvements, and whether attendees would return). Full admins can read responses in the Conference survey section. Apply `lib/db/migrations/20261007_conference_survey.sql` and the local-church migration above before deploying, or use the existing Drizzle schema push workflow. New roles use the existing text role column and need no role-column migration.
