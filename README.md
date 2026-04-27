# pot-split

Poker table payout calculator — quickly split the pot and settle up after a game.

**Live demo:** [pot-split.vercel.app](https://pot-split.vercel.app)

## What it does

- Track players, buy-ins, and ending chip counts.
- Choose **fixed** buy-ins (everyone pays the same per re-buy) or **free** mode (per-player buy-in amounts).
- Add shared expenses (snacks, drinks, the host's pizza) with custom payer + split.
- Get a minimal list of settlements: who pays whom, and how much.
- The full session state lives in the URL — hit **Share** to copy a link that restores everything.

## Stack

- Next.js 16 + React 19 (App Router)
- TypeScript, Tailwind CSS v4
- `lz-string` for compact URL-encoded state
- pnpm

## Run locally

```bash
cd my-app
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project layout

```
my-app/app/
  _components/   UI (PlayersSection, ExpensesSection, SettlementsSection, …)
  _lib/          calc.ts (settlement math), types.ts, url.ts (state ↔ URL)
  page.tsx       entry
```

## Deploy

Deployed on Vercel. Push to `main` redeploys.
