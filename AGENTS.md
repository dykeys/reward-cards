# AGENTS.md

Children's reward card app — track reading challenges and jump rope sessions, exchange them for cool cards.

## Setup

```sh
cp .env.example .env.local
# 在 .env.local 填入 SILICONFLOW_API_KEY
```

## Commands

```sh
npm run dev    # start dev server
npm run build  # typecheck + production build
npm run start  # production server (use for mobile testing, avoids dev HMR issues)
npm run lint   # ESLint check
```

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4** (no config needed — `@import "tailwindcss"` in CSS)
- **Dexie.js** (IndexedDB) — all data is local per device (no sync), no backend
- **Framer Motion** — reward redemption animation
- **Lucide React** — icons

## Data model (`lib/types.ts`, `lib/db.ts`)

| IndexedDB table | Purpose |
|---|---|
| `rewards` | Reward cards: type (game/pizzahut), source (manual/reading/jump_rope/discipline), status (active/used) |
| `readingChallenges` | Book name + completion date, status (active/redeemed) |
| `jumpRopeDays` | One record per daily 5-min session, `redeemedBatchId` groups 10 for exchange |
| `deductions` | Behavior deduction records, `redeemed` marks 10-point batches used for card elimination |
| `petPoints` | Pet feeding points from jump rope & good behavior, `spent` marks used for feeding |

## Key business rules

- **Reading**: 1 book = 1 reward card. Book marked `redeemed` after exchange.
- **Jump rope**: 10 daily check-ins = 1 reward card. Uses `redeemedBatchId` to track batches.
- **Card usage**: mark a card `used` with celebration animation (random motivational quote).
- **Discipline**: accumulate deduction points; every 10 points allows eliminating one reward card.
- **Cards have no user-defined name** — display label comes from type (游戏卡/美食卡).
- **AI image gen**: requires `SILICONFLOW_API_KEY` in `.env.local`, calls SiliconFlow Kwai-Kolors/Kolors API.
- Card type `pizzahut` displays as "美食卡" in the UI.

## Pages and layout

- `app/layout.tsx` — responsive shell: mobile bottom nav + desktop sidebar (`md:pl-56`, `pb-20 md:pb-4`)
- `app/page.tsx` — dashboard with stats grid and quick links
- `app/cards/page.tsx` — card management (filters, add, use, delete)
- `app/reading/page.tsx` — add books, exchange for cards via CardSelector
- `app/jump-rope/page.tsx` — daily check-in, progress ring, batch exchange
- `app/discipline/page.tsx` — behavior deduction tracking, card elimination
- `app/generate/page.tsx` — AI card image generation (placeholder)

## Client hooks (`hooks/`)

All hooks wrap Dexie CRUD and return reactive state. Pattern: read on mount with error/timeout handling, write then optimistically update local state.

| Hook | Table |
|---|---|
| `useRewards` | `rewards` |
| `useReading` | `readingChallenges` |
| `useJumpRope` | `jumpRopeDays` |
| `useDeductions` | `deductions` |

## Mobile testing

Use `npm run build && npm start` for mobile — dev mode HMR WebSocket can hang on some phones.
