---
name: StatusSeller backend architecture
description: Key decisions and gotchas for the StatusSeller API server and mobile app integration
---

## JWT Secret
Uses `SESSION_SECRET` env var (already a Replit Secret). Falls back to `JWT_SECRET` then a dev default.
Access tokens expire in 15m, refresh tokens in 30d.

**Why:** SESSION_SECRET was already provisioned; no new secret needed.

## Drizzle numeric columns return strings
PostgreSQL `numeric` columns (price, total, subtotal, totalRevenue, etc.) come back as strings from drizzle-orm. The mobile app mapper functions (`apiProductToProduct`, `apiOrderToOrder`, `apiBusinessToStore`) all call `parseFloat()` on these fields.

**How to apply:** Any new DB read that maps a `numeric` field to a JS `number` must call `parseFloat()` or `Number()`.

## pg must be externalized in api-server esbuild
`pg` is a native-module package. It must appear in the `external` array in `artifacts/api-server/build.mjs` AND be listed as a dependency in `artifacts/api-server/package.json`.

**Why:** esbuild bundles workspace packages transitively; without externalizing pg it fails to resolve.

## API server has no hot-reload
The dev command is `build && start`. Every code change requires restarting the `artifacts/api-server: API Server` workflow.

**How to apply:** Always restart the API Server workflow after editing any file under `artifacts/api-server/src/`.

## Mobile API base URL
`artifacts/status-seller/lib/api.ts` constructs the URL as `https://${EXPO_PUBLIC_DOMAIN}/api`. `EXPO_PUBLIC_DOMAIN` is set to `$REPLIT_DEV_DOMAIN` in the Expo dev script. Never hardcode localhost in app code.

## Development database schema
The development database may be provisioned but have no application tables until the existing Drizzle push workflow is run.

**Why:** Auth and public-shop smoke tests returned `relation "users" does not exist` even though the API could connect to PostgreSQL.

**How to apply:** When a fresh development database is used, apply the checked-in `lib/db` schema before testing auth or seeded demo data. Do not add startup-time DDL.
