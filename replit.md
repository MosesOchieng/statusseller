# StatusSeller

A modern, production-ready mobile application that enables businesses to turn their WhatsApp Status, Instagram Stories, and social media content into interactive shopping experiences.

## Run & Operate

- `pnpm --filter @workspace/status-seller run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Scan the QR code in the Expo URL bar to test on a physical device via Expo Go

## Stack

- React Native + Expo (SDK 54) for iOS and Android
- Expo Router for file-based navigation
- AsyncStorage for local data persistence (first build)
- TypeScript throughout
- Inter font (400/500/600/700) via @expo-google-fonts/inter
- pnpm workspaces monorepo

## Where things live

- `artifacts/status-seller/` — Expo mobile app
- `artifacts/status-seller/app/` — all screens (Expo Router file-based routing)
- `artifacts/status-seller/app/(auth)/` — login / register screens
- `artifacts/status-seller/app/(tabs)/` — 5 main tabs (Home, Products, Orders, AI, Profile)
- `artifacts/status-seller/app/order/[id].tsx` — order detail + status management
- `artifacts/status-seller/app/product/new.tsx` — add product modal
- `artifacts/status-seller/app/link/index.tsx` — shopping link generator
- `artifacts/status-seller/app/analytics/index.tsx` — analytics dashboard
- `artifacts/status-seller/context/AppContext.tsx` — global state (auth, products, orders, AI chat)
- `artifacts/status-seller/constants/colors.ts` — brand tokens (primary: #25D366 WhatsApp green)
- `artifacts/status-seller/constants/mockData.ts` — demo data (Kenyan market: KSh, M-Pesa)
- `artifacts/api-server/` — Express 5 API server (future backend)
- `lib/db/` — PostgreSQL + Drizzle ORM (future database)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (future API contracts)

## Architecture decisions

- First build is frontend-only with AsyncStorage + mock data. Backend (API server + PostgreSQL) exists in the monorepo and is ready to wire up when server-side persistence is needed.
- Primary color #25D366 (WhatsApp green) — chosen because StatusSeller is a WhatsApp Status commerce platform; this color is instantly recognizable to the target market.
- Mock data uses Kenyan market defaults (KSh currency, M-Pesa payment, Nairobi locations) to match the target audience seen in the product screenshots.
- NativeTabs (liquid glass) on iOS 26+, classic BlurView tabs on older iOS, solid background on Android/web.

## Product

StatusSeller turns every social media status into a shoppable experience. Merchants post a StatusSeller link in their WhatsApp Status; customers tap the link, see a native product sheet, and check out — all without leaving WhatsApp. Key features:
- Merchant dashboard with revenue stats, order management, and analytics
- Product catalog with AI-generated descriptions
- Smart shopping link generator with customizable button styles
- AI Sales Agent that answers customer questions 24/7
- M-Pesa + Card checkout support

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Expo workflow must be restarted when dependencies change (not for normal code changes — HMR handles those).
- The `product/[id]` stack screen is declared in `_layout.tsx` but the detail/edit screen hasn't been built yet — that's a follow-up task.
- All data is currently stored in-memory (AppContext). A full backend integration is the highest-priority follow-up.

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
- See the `expo` skill for Expo-specific patterns and pitfalls
