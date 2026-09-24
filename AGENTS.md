# AGENTS.md

## Project Context

KRDrama: AI short-drama streaming. React + Vite web app wrapped with Capacitor 8 for iOS.
Backend is Supabase; subscriptions via RevenueCat; rewarded ads via AdMob. See `README.md`
for setup and the security model.

## Key Files

- `src/api/supabaseClient.js`: the only Supabase client.
- `src/lib/`: auth (`AuthContext.jsx`, `socialAuth.js`), coins, purchases, ads, episodes.
- `supabase/migrations/`: schema, RLS, SQL functions. Coin/entitlement logic lives here.
- `supabase/functions/`: edge functions (episode-stream, sync-subscription,
  revenuecat-webhook, admob-ssv, delete-account).
- `ios/`: committed native project (SPM). `capacitor.config.json`, `codemagic.yaml`.

## Rules

- Never let the client write balances, unlocks or subscriptions. Add a SQL function or an
  edge function instead, and keep RLS read-only for those tables.
- Never select video sources for regular users; playback URLs come from `episode-stream`.
- Coin constants in `src/lib/coins.js` are display-only; the SQL functions are authoritative.
- Run `npm run lint` and `npm run build` before finishing code changes.
