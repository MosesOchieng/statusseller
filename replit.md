# StatusSeller

A modern, production-ready mobile application that enables businesses to turn their WhatsApp Status, Instagram Stories, and social media content into interactive shopping experiences.

## Run & Operate

- `pnpm --filter @workspace/status-seller run dev` — run the Expo mobile app (port 20683)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `cd lib/db && pnpm run push` — push Drizzle schema changes to the database
- Scan the QR code in the Expo URL bar to test on a physical device via Expo Go

## Stack

- React Native + Expo (SDK 54) for iOS and Android
- Expo Router for file-based navigation
- TypeScript throughout
- Inter font (400/500/600/700) via @expo-google-fonts/inter
- pnpm workspaces monorepo
- **Express 5** API server at `artifacts/api-server/`
- **PostgreSQL** + **Drizzle ORM** database via `lib/db/`
- **JWT** authentication (access tokens 15m, refresh tokens 30d)
- **bcryptjs** password hashing (12 rounds)

## API Server

- Base path: `/api` (proxied at `https://$REPLIT_DEV_DOMAIN/api`)
- Port: 8080
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- Business: `GET /api/business/me`, `PATCH /api/business/me`, `GET /api/business/kyb`, `POST /api/business/kyb`
- Products: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/:id`
- Orders: `GET/POST /api/orders`, `GET/PATCH /api/orders/:id`, `PATCH /api/orders/:id/status`
- Stats: `GET /api/stats`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read`

## Mobile App API Client

The mobile app connects to the API server via `artifacts/status-seller/lib/api.ts`:
- Uses `EXPO_PUBLIC_DOMAIN` env var to construct API base URL
- Automatic JWT token refresh on 401 responses
- Tokens persisted in AsyncStorage under `ss_access_token` / `ss_refresh_token`
- Session restored from `ss_user` AsyncStorage key on app mount

## Where things live

- `artifacts/status-seller/` — Expo mobile app
- `artifacts/status-seller/app/` — all screens (Expo Router file-based routing)
- `artifacts/status-seller/app/(auth)/` — login / register / kyb / verify-phone screens
- `artifacts/status-seller/app/(tabs)/` — 5 main tabs (Home, Products, Orders, AI, Profile)
- `artifacts/status-seller/app/order/[id].tsx` — order detail + status management
- `artifacts/status-seller/app/product/new.tsx` — add product modal
- `artifacts/status-seller/app/link/index.tsx` — shopping link generator
- `artifacts/status-seller/app/analytics/index.tsx` — analytics dashboard
- `artifacts/status-seller/context/AppContext.tsx` — global state; all mutations hit the real API
- `artifacts/status-seller/lib/api.ts` — API client (base URL, auth headers, token refresh)
- `artifacts/status-seller/constants/colors.ts` — brand tokens (primary: #25D366 WhatsApp green)
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/lib/db.ts` — Drizzle connection
- `artifacts/api-server/src/lib/jwt.ts` — token sign/verify (uses SESSION_SECRET)
- `artifacts/api-server/src/lib/hash.ts` — bcryptjs password hashing
- `artifacts/api-server/src/middlewares/auth.ts` — JWT bearer middleware
- `lib/db/src/schema/` — Drizzle table definitions (users, businesses, kyb, products, orders, sessions, notifications, messages)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (health check only; to be expanded)

## Database Schema

Tables: `users`, `businesses`, `kyb`, `products`, `orders`, `refresh_tokens`, `notifications`, `ai_messages`

All primary keys are UUIDs. Schema is pushed to the Replit-managed PostgreSQL via `drizzle-kit push`.

## Architecture decisions

- JWT secret reads from `SESSION_SECRET` env var (already provisioned as a Replit Secret)
- Mobile app uses `EXPO_PUBLIC_DOMAIN` (= `$REPLIT_DEV_DOMAIN`) to reach the API at runtime; no hardcoded localhost
- All product mutations (add/update/delete) and order status changes are now persisted to PostgreSQL via the API
- Splash screen uses `splash-hero.jpg` with `resizeMode: "cover"` for full-background display
- Primary color #25D366 (WhatsApp green) — instantly recognizable to the target Kenyan market

## Product

StatusSeller turns every social media status into a shoppable experience. Merchants post a StatusSeller link in their WhatsApp Status; customers tap the link, see a native product sheet, and check out — all without leaving WhatsApp.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Expo workflow must be restarted when dependencies change (not for normal code changes — HMR handles those).
- API server has no hot-reload — code changes require restarting `artifacts/api-server: API Server` workflow to rebuild and restart.
- The `product/[id]` stack screen is declared in `_layout.tsx` but the detail/edit screen hasn't been built yet — that's a follow-up task.
- All numeric fields from the DB (price, total, etc.) come back as strings from Drizzle+PostgreSQL `numeric` columns — the mobile app mapper functions (`apiProductToProduct`, `apiOrderToOrder`) parse them with `parseFloat`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
- See the `expo` skill for Expo-specific patterns and pitfalls
