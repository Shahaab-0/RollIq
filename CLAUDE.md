# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

RollIQ is a React Native 0.86 app for tracking BJJ (Brazilian Jiu-Jitsu) training progress: sessions, techniques drilled, and rolls/sparring, with a Supabase backend (Postgres + auth). MVP scope: Dashboard, Training Log, Technique Journal, Roll Tracker, Profile.

## Commands

```sh
npm start              # Start Metro dev server (run this first, in its own terminal)
npm run android        # Build and run on Android (requires Metro running)
npm run ios            # Build and run on iOS (requires Metro running)
npm test               # Run Jest tests
npm test -- App.test   # Run a single test file (Jest pattern match on filename)
npm run lint           # ESLint via @react-native/eslint-config
npx tsc --noEmit       # Type-check without emitting output
```

iOS native deps: after any change to `ios/Podfile` or native dependencies, run `bundle exec pod install` from `ios/` (first-time setup also requires `bundle install` from the repo root). A native rebuild (`npx react-native run-ios`) is only needed after adding/removing a native module — pure JS/TSX changes hot-reload via Metro.

Supabase schema changes live as versioned SQL in `supabase/migrations/` (`0001_init.sql`, `0002_...`, `0003_...`) — apply them in order via the Supabase SQL Editor. Never hand-edit the schema in the dashboard.

## Architecture

### Entry point and providers

`index.js` imports `react-native-gesture-handler` and `react-native-url-polyfill/auto` first (both required side-effect imports), then registers `App`. `App.tsx` wraps everything in a Redux `Provider` (`src/redux/store.ts`), `SafeAreaProvider`, and `RootNavigator`.

### Navigation (`src/navigation/`)

`RootNavigator` runs `useAuthListener()` (see below) and gates the whole app on auth state: while the auth slice's `status` isn't `'ready'` it shows a spinner, then renders `AuthStack` (`SignIn`/`SignUp`) if there's no session, or `AppTabs` if there is. `AppTabs` is a bottom-tab navigator with 5 tabs — Home, Log, Techniques, Rolls, Profile (icons from `lucide-react-native`) — where Log/Techniques/Rolls each wrap their own native-stack (`LogStack`, `TechniquesStack`, `RollsStack`) so list screens can push into a create/edit form. Route param types for every stack/tab live in `src/navigation/types.ts`.

### State — Redux Toolkit (`src/redux/`)

All Redux code (store, typed hooks, and every slice) lives in one place, separate from the feature UI code that consumes it:

- `store.ts` — `configureStore`, combines every slice's reducer
- `hooks.ts` — `useAppDispatch` / `useAppSelector` (typed wrappers; use these instead of the bare react-redux hooks)
- `authSlice.ts`, `profileSlice.ts`, `sessionsSlice.ts`, `techniquesSlice.ts`, `rollsSlice.ts`, `beltPromotionsSlice.ts` — one per domain, each with `createAsyncThunk` CRUD actions that call Supabase directly

A slice's state type is domain-specific to that slice (not colocated with its feature's UI types) — e.g. `sessionsSlice.ts` imports `Session`/`NewSession` from `src/features/trainingLog/types.ts`. When adding a new slice, put it in `src/redux/`, not inside `src/features/<name>/`.

Screen-local derived data that only one screen needs (e.g. the Dashboard's streak/heatmap/progress-chart math in `useDashboardStats`) is plain component state + direct Supabase queries, not Redux — Redux is reserved for state shared across screens.

### Features (`src/features/<name>/`)

Each feature owns `screens/`, `components/`, `hooks/`, and `types.ts`. Cross-feature UI (`Button`-style primitives, `TagInput`, `PlaceholderScreen`) lives in top-level `src/components/`. Current features: `auth`, `dashboard`, `trainingLog`, `techniques`, `rolls`, `profile`.

Notable cross-feature link: `trainingLog`'s session form uses `TechniquePicker` (in `trainingLog/components/`) to search/create `techniques` records and associate them with a session via the `session_techniques` join table — the session form owns this association (see `sessionTechniques.ts`, which is plain async functions, not a slice, since it's ephemeral to that one screen).

### Backend (Supabase)

`src/lib/supabase.ts` creates the client with `@react-native-async-storage/async-storage`-backed session persistence. Config comes from `.env` (gitignored; see `.env.example`) via `react-native-dotenv`, imported as `from '@env'` (typed in `src/types/env.d.ts`).

Schema: `profiles` (belt/stripes/name, auto-created on sign-up via a Postgres trigger), `sessions` (date/gi/duration/rounds/productivity rating/submissions-landed count), `techniques` (free-text `position`, not an enum — see below — with a drill counter), `rolls` (submissions landed/received arrays, effort rating), `session_techniques` (many-to-many join), `belt_promotions` (append-only belt-change log: belt + date; feeds the Dashboard's belt timeline). Every table has RLS enabled with owner-only policies (`auth.uid() = user_id`) — see `supabase/migrations/` for the exact policies and constraints, and follow that same pattern for new tables.

`profiles.current_belt`/`current_stripes` is the editable "current state" shown everywhere (avatar, header, accent) — `belt_promotions` is a separate history log. Logging a new promotion (`beltPromotionsSlice.createBeltPromotion`) also dispatches `updateProfile` to keep the two in sync (stripes reset to 0 on a new belt), so don't let them drift by writing one without the other. `position` on `techniques` was originally a fixed enum but was changed to free text (migration `0004`) so users can add positions beyond the built-in presets (`POSITION_PRESETS` in `src/features/techniques/types.ts`) — group/sort by whatever distinct strings exist in the data, don't assume a fixed set.

### Theme (`src/theme/colors.ts`)

Never hardcode a hex color in a component. Reuse or extend the constants here:

- `BELT_COLORS` — the 5 real belt colors, only for belt-dependent UI (avatar ring, belt dot/label). Don't repurpose for generic chrome.
- `UI_ACCENT` — the app's generic accent (buttons, active tab, active chips). Currently cyan.
- `UI_ACCENT_MUTED` — low-opacity accent tint for *inactive* selectable controls (chips, rating dots), so they read as interactive instead of flat gray before selection.
- `UI_ACCENT_TEXT` — text/icon color for content drawn on top of `UI_ACCENT` or a belt color.
- `darkTheme` / `lightTheme` via `getTheme(scheme)` — background/surface/border/text/success/danger, resolved from `useColorScheme()`. Screens build their `StyleSheet` from a `createStyles(theme)` function called with `useMemo`, rather than a static `StyleSheet.create` at module scope, since colors must react to theme changes.

**Buttons must be visually consistent across every screen.** Any primary action button (filled) uses `backgroundColor: UI_ACCENT` + `color: UI_ACCENT_TEXT`; any secondary/outline button uses `borderColor: UI_ACCENT` + `color: UI_ACCENT`. Never style a button with the belt-based `BELT_COLORS[belt]` accent — that color is reserved for belt-representing UI only (avatar ring, belt dot/label). A prior bug had the Dashboard's "Log Session"/"Log Roll" buttons tinted by belt color instead of `UI_ACCENT`, so for a white-belt user they rendered pale gray while every other button in the app was cyan — check new buttons against an existing one (e.g. Profile's "Save Changes") before considering the styling done.

This applies to icon-only buttons too, not just labeled ones. A list row's quick-action icon (e.g. the trash icon to delete-from-list in Training Log/Roll Tracker/Technique Journal) needs the same `padding: 8, borderRadius: 10, borderWidth: 1, borderColor: <accent>` treatment as everything else — a bare icon with no border/background reads as broken, not minimal. Full-destructive-action buttons (e.g. "Delete Session" at the bottom of an edit form) use the same bordered-pill shape as `signOutButton` in Profile, just with `theme.danger` instead of `UI_ACCENT`.

### Typography (`src/theme/typography.ts`)

Never hardcode a `fontSize` number or `fontWeight` string in a component. Use `FONT_SIZE.<name>` (`tiny`/`xs`/`sm`/`label`/`body`/`base`/`md`/`lg`/`xl`/`xxl`/`title`/`display`/`streak`) and `FONT_WEIGHT.<name>` (`semibold`/`bold`/`extrabold`) instead. If a new screen genuinely needs a size/weight not already in the scale, add it there with a comment on what it's for — don't inline a raw number.

### Component size limit

No component file should exceed ~400 lines. When a screen grows past that, split it into sub-components under that feature's `components/` folder rather than shrinking via unrelated tricks (e.g. don't move styles to a separate file just to dodge the count — the split should track a real UI/logic boundary). Two patterns already in use:

- **Self-contained chunk** — owns its own Redux reads/dispatches and only reports back through a callback prop (e.g. `BeltHistorySection`, `BeltTimelineCard`). Best when the chunk is a fully independent feature area.
- **Presentational chunk** — takes all its data via props, parent keeps the state/handlers (e.g. `SessionTypeFields`, `SessionProgressFields`, `BeltDatePromptModal`). Best when the fields are tightly coupled to the parent form's save logic.

### Other conventions

- **Jest** uses `@react-native/jest-preset`; tests live under `__tests__/`.
- **ESLint/Prettier** extend the `@react-native` presets — stay on the RN community defaults rather than adding custom rules.
- Native projects live in `android/` and `ios/` (Swift `AppDelegate` on iOS); avoid hand-editing generated build artifacts (`android/build`, `android/.gradle`, `ios/build`, `ios/Pods`).
