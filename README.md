# Shalom Conference

Shalom Conference is a TypeScript pnpm workspace for a youth conference website and its supporting API/tooling. The main user-facing app is a Vite + React landing page for the Shalom Youth Conference, with shared packages for an Express API, OpenAPI-generated clients, Zod schemas, and a future PostgreSQL/Drizzle data layer.

## What Is In This Repo

- `artifacts/shalom` - the main Shalom Conference web app. This is a Vite React app using Tailwind CSS, Radix UI components, Wouter routing, React Query, Framer Motion, and Lucide icons.
- `artifacts/api-server` - an Express 5 API server. It currently exposes `GET /api/healthz`.
- `artifacts/mockup-sandbox` - a Vite preview app used for component/mockup rendering.
- `lib/api-spec` - the OpenAPI contract in `openapi.yaml` plus Orval code generation config.
- `lib/api-client-react` - generated React Query API hooks and a custom fetch wrapper.
- `lib/api-zod` - generated Zod schemas/types from the OpenAPI contract.
- `lib/db` - PostgreSQL/Drizzle setup and schema entry point. The schema is currently a placeholder.
- `scripts` - small workspace scripts.
- `attached_assets` - shared static assets, including the Shalom logo used by the frontend.

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

The current frontend is a mostly static conference landing page with sections for the hero, event vibe, expectations, lineup, schedule, details, and CTA.

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

If you add routes that use the shared database package, also set `DATABASE_URL`:

```sh
PORT=5000 DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME pnpm --filter @workspace/api-server dev
```

## Database Setup

The database package lives in `lib/db` and uses Drizzle Kit. Set `DATABASE_URL` before running database commands.

```sh
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME pnpm --filter @workspace/db push
```

The current schema file is `lib/db/src/schema/index.ts`. It is a placeholder with comments showing the expected pattern for new tables, insert schemas, and types.

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

## How The Pieces Fit Together

The frontend currently renders the conference site from `artifacts/shalom/src/pages/home.tsx`. Routing is handled in `artifacts/shalom/src/App.tsx`, with `/` mapped to the home page and a fallback not-found route.

The API starts from `artifacts/api-server/src/index.ts`, creates the Express app in `artifacts/api-server/src/app.ts`, and mounts routes under `/api`. The health route is implemented in `artifacts/api-server/src/routes/health.ts` and validates its response with the generated Zod schema from `@workspace/api-zod`.

The API contract flows from `lib/api-spec/openapi.yaml` into generated TypeScript clients and validators. That keeps the backend response shapes, frontend API hooks, and runtime validation tied to the same contract.

The database package exports a Drizzle client from `lib/db/src/index.ts`. It requires `DATABASE_URL` when imported, so only import it in code paths that actually need database access.

## Notes And Gotchas

- Vite commands for `artifacts/shalom` and `artifacts/mockup-sandbox` require both `PORT` and `BASE_PATH`.
- The root `build` command runs typechecking first, then builds all packages with build scripts.
- The frontend does not currently make API calls, so you can run it without the API server.
- The API currently has only a health endpoint. Most product behavior is in the frontend landing page.
- Do not hand-edit generated files under `lib/api-client-react/src/generated` or `lib/api-zod/src/generated`; update `lib/api-spec/openapi.yaml` and run codegen instead.
