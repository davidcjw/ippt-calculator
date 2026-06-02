# Agent Guide

See [CODEBASE.md](./CODEBASE.md) for the full codebase map (directory layout, entrypoints, key types, key functions, and where to find things).

## Quick orientation

- **Single page app** — all state lives in `app/page.tsx` (`Home`); no API routes, no database.
- **Scoring** — pure lookup tables in `lib/`. Score = pushUpScore + sitUpScore + runScore; award from `getReward()`.
- **Workout history** — saved to `localStorage` key `ippt_workouts` as `SavedWorkout[]`. State is lifted into `page.tsx`; `WorkoutDrawer` receives it as props.
- **UI library** — Chakra UI v2. Use Chakra components and `useToast` for feedback. Tailwind is present but used minimally.

## Key constraints

- No backend — all persistence is localStorage only.
- Score lookup tables are keyed by `ageGroup` (numeric bucket) then reps/seconds. Run slider steps by 10s, matching lookup keys exactly.
- `run` in `page.tsx` is always a multiple of 10 (slider `step={10}`), safe to use as a lookup key directly.
