# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

RollIQ is a monorepo with two top-level projects:

- `frontend/` — a React Native 0.86 app for tracking BJJ (Brazilian Jiu-Jitsu) training progress: sessions, techniques drilled, and rolls/sparring. MVP scope: Dashboard, Training Log, Technique Journal, Roll Tracker, Profile. Every path in the rest of this doc that looks frontend-related (`src/...`, `ios/...`, `android/...`, `App.tsx`, etc.) is relative to `frontend/`, not the repo root.
- `backend/` — a self-hosted Spring Boot + PostgreSQL API (see "Backend" below). The frontend talks to it exclusively — there is no Supabase anywhere in this app anymore.

## Commands

All frontend commands run from `frontend/`:

```sh
cd frontend
npm start              # Start Metro dev server (run this first, in its own terminal)
npm run android        # Build and run on Android (requires Metro running)
npm run ios            # Build and run on iOS (requires Metro running)
npm test               # Run Jest tests
npm test -- App.test   # Run a single test file (Jest pattern match on filename)
npm run lint           # ESLint via @react-native/eslint-config
npx tsc --noEmit       # Type-check without emitting output
```

iOS native deps: after any change to `frontend/ios/Podfile` or native dependencies, run `bundle exec pod install` from `frontend/ios/` (first-time setup also requires `bundle install` from `frontend/`). A native rebuild (`npx react-native run-ios`) is only needed after adding/removing a native module — pure JS/TSX changes hot-reload via Metro.

Backend commands run from `backend/`:

```sh
cd backend
docker compose up -d    # Start local Postgres
./mvnw spring-boot:run  # Run the API (defaults to :8080)
./mvnw test             # Run integration tests (Testcontainers Postgres, needs Docker running)
```

## Architecture

### Entry point and providers

`index.js` imports `react-native-gesture-handler` first (a required side-effect import), then registers `App`. `App.tsx` wraps everything in a Redux `Provider` (`src/redux/store.ts`), a React Query `QueryClientProvider` (`src/api/`, see "Server state" below), `SafeAreaProvider`, and `RootNavigator`.

### Navigation (`src/navigation/`)

`RootNavigator` runs `useAuthListener()` (see below) and gates the whole app on auth state: while the auth slice's `status` isn't `'ready'` it shows a spinner, then renders `AuthStack` (`SignIn`/`SignUp`) if there's no session, or `AppTabs` if there is. `AppTabs` is a bottom-tab navigator with 5 tabs — Home, Log, Techniques, Rolls, Profile (icons from `lucide-react-native`) — where Log/Techniques/Rolls each wrap their own native-stack (`LogStack`, `TechniquesStack`, `RollsStack`) so list screens can push into a create/edit form. Route param types for every stack/tab live in `src/navigation/types.ts`.

### State — Redux Toolkit (`src/redux/`)

Redux now holds exactly one thing: auth/session state. Everything that used to be a CRUD slice (profile, sessions, techniques, rolls, belt promotions) moved to React Query — see "Server state" below.

- `store.ts` — `configureStore`, combines just `authSlice`'s reducer
- `hooks.ts` — `useAppDispatch` / `useAppSelector` (typed wrappers; use these instead of the bare react-redux hooks)
- `authSlice.ts` — `session`/`status`/`authenticating`/`error`, with `createAsyncThunk` actions (`restoreSession`, `signUp`, `signIn`, `signOut`) that call `src/api/auth.ts` and persist tokens via `src/api/tokenStorage.ts`

`state.auth.session` is what `RootNavigator` gates the whole app on, and what the 5+ screens reading `session.user.id`/`session.user.email` depend on — that's the reason it's still Redux instead of React Query: it's genuinely global, synchronously-read state, not "a screen's data." If you're tempted to add a new Redux slice for anything else, it almost certainly belongs in React Query instead.

### Server state — React Query (`src/api/` + per-feature `hooks/`)

Every piece of server data follows one pattern: **screen → feature hook → `useQuery`/`useMutation` → axios function in `src/api/<domain>.ts` → typed response.**

- `src/api/client.ts` — the one axios instance (`apiClient`), with a request interceptor that attaches the access token (read from `tokenStorage`, async — not from Redux, to avoid an `api/` ↔ `redux/` import cycle) and a response interceptor that retries once on a 401 via `/auth/refresh`, then dispatches `sessionChanged(null)` into the auth slice if that also fails.
- `src/api/<domain>.ts` (`profile.ts`, `sessions.ts`, `techniques.ts`, `rolls.ts`, `beltPromotions.ts`) — thin functions wrapping `apiClient` calls, typed against that feature's `types.ts`. No field remapping needed: the backend emits/accepts snake_case JSON matching these types directly (the one exception is the auth response, mapped once in `api/auth.ts` into the local `Session` shape).
- `features/<name>/hooks/use<Domain>.ts` — one `useQuery` (list) plus one `useMutation` per write (create/update/delete/etc.), each mutation invalidating the relevant query key(s) on success. Query keys double as cache-sharing: `useSessions()` is called from both Training Log and the Dashboard's `useDashboardStats`, so saving a session in one refreshes the other for free.

**Every save/delete handler awaits `mutateAsync(...)` inside try/catch** before treating it as success — this replaces the old "await and check `result.type === thunk.fulfilled.type`" Redux-thunk rule with the same intent (`mutateAsync` rejects on failure, so a failed save can never fall through to a success path). A real bug shipped once from skipping the equivalent check with plain thunks: a belt-promotion save showed "Congratulations!" and closed its modal even though the underlying insert had failed. Match the try/catch pattern in every `handleSave`-style function.

**Toasts: success is global, errors are per-mutation.** Every toast renders through `src/components/ToastHost.tsx` (mounted once in `App.tsx`), driven by the module-level `showToast`/`subscribeToast` pub-sub in `src/lib/toast.ts` — that part is shared. But the two directions are wired differently, deliberately:
- **Success** is automatic: `App.tsx`'s `QueryClient` has a global `MutationCache.onSuccess` that reads `meta.toastSuccess` (typed via `MutationMeta` in `src/types/reactQuery.d.ts`) off whichever mutation just ran and shows it. Omit `toastSuccess` for low-stakes/frequent actions where the UI itself is the feedback (e.g. `useIncrementDrillCount` — the on-screen counter updating is enough).
- **Error** is explicit: each `useMutation` in `features/*/hooks/use<Domain>.ts` has its own `onError: error => showToast(getApiErrorMessage(error, '<fallback message>'), 'error')` right next to the mutation it describes, rather than a global fallback — so the message is specific and discoverable by reading the hook, not hidden in `App.tsx`. `getApiErrorMessage` (`src/lib/apiError.ts`) prefers the backend's actual message when there is one, falling back to the string you pass.
- A mutation deliberately has **no `onError`** only when its call site already shows its own richer error UI — currently just `useLogMilestone` (ProfileScreen's contextual belt-promotion `Alert`s cover it). Adding one there would report the same failure twice. Every other mutation, including auth (`useAuth.ts`'s `useSignIn`/`useSignUp`/`useSignOut`), gets both an explicit `onSuccess` and `onError` — auth doesn't rely on the global `meta.toastSuccess` mechanism since it calls `showToast` directly in the same callback shape as its `onError`.
- Never call `Alert.alert` for a generic "something went wrong" message anymore; that's what the mutation's `onError` toast is for. Reach for `Alert.alert` only for things a toast can't do — a yes/no confirmation (delete dialogs) or a message that genuinely needs to block until acknowledged (the belt-promotion congratulations flow).

Screen-local derived data that only one screen needs (e.g. the Dashboard's streak/heatmap/progress-chart math in `useDashboardStats`, or the belt-duration math in `useBeltTimeline`) stays a dedicated hook that layers computation on top of the shared query hooks — it doesn't own its own fetching.

### Features (`src/features/<name>/`)

Each feature owns `screens/`, `components/`, `hooks/`, and `types.ts`. Cross-feature UI (`Button`-style primitives, `TagInput`, `PlaceholderScreen`) lives in top-level `src/components/`. Current features: `auth`, `dashboard`, `trainingLog`, `techniques`, `rolls`, `profile`.

Notable cross-feature link: `trainingLog`'s session form uses `TechniquePicker` (in `trainingLog/components/`) to search/create `techniques` records and associate them with a session via the session-techniques join — the session form owns this association (see `trainingLog/hooks/useSessionTechniques.ts` and `api/sessions.ts`'s `getSessionTechniques`/`replaceSessionTechniques`).

**Separation of concerns**, concretely, in this codebase: `screens/` render UI and call hooks but hold no axios/query logic of their own; `api/*.ts` own the actual HTTP calls; `features/*/hooks/use<Domain>.ts` own the `useQuery`/`useMutation` wiring and cache invalidation; `types.ts` per feature owns the shape of that feature's data. If you're adding a new API call, it belongs in an `api/*.ts` function plus a hook that wraps it — never inline an axios call directly inside a component's render body.

### Backend (Spring Boot API, `backend/`)

Layered architecture (not package-by-feature): `controller/`, `service/`, `repository/`, `model/` (JPA entities), `dto/`, `security/`, `exception/` — see `backend/CLAUDE.md`-equivalent context in the plan history, or just follow the existing pattern per domain (e.g. `RollController` + `RollService` + `RollRepository` + `Roll`).

Auth is stateless JWT: `POST /api/v1/auth/signup|signin` return a short-lived access token + a rotating opaque refresh token (`POST /api/v1/auth/refresh` rotates both, `POST /api/v1/auth/signout` revokes). `JwtAuthFilter` validates the `Authorization: Bearer` header on every request; `CurrentUser` resolves the authenticated user id from it. There is no Postgres RLS — every read/write is ownership-checked in the service layer (`repository.findByIdAndUserId(id, userId)`), returning 404 (not 403) on a cross-user access attempt so existence isn't leaked.

Schema (Flyway, `backend/src/main/resources/db/migration/`): `users`/`refresh_tokens` (auth), `profiles` (belt/stripes/name, created transactionally alongside the user on signup — no DB trigger), `training_sessions` (date/gi/duration/rounds/productivity rating/submissions-landed count), `techniques` (free-text `position`, not an enum, with a drill counter), `rolls` (submissions landed/received arrays, effort rating), `session_techniques` (many-to-many join), `belt_promotions` (append-only belt-change log: belt + date; feeds the Dashboard's belt timeline).

`profiles.current_belt`/`current_stripes` is the editable "current state" shown everywhere (avatar, header, accent) — `belt_promotions` is a separate history log. Logging a new promotion (`POST /api/v1/belt-promotions`, `BeltPromotionService.createPromotion`) updates both in one `@Transactional` server-side — the client just invalidates its `beltPromotions`/`profile` queries, it doesn't need to make two calls. `position` on `techniques` is free text (not an enum) so users can add positions beyond the built-in presets (`POSITION_PRESETS` in `src/features/techniques/types.ts`) — group/sort by whatever distinct strings exist in the data, don't assume a fixed set.

JSON is snake_case both directions (`JacksonConfig`'s global `PropertyNamingStrategies.SNAKE_CASE`) specifically so the RN `types.ts` shapes don't need a mapping layer — keep that convention when adding fields/endpoints.

### Theme (`src/theme/colors.ts`)

Never hardcode a hex color in a component. Reuse or extend the constants here:

- `BELT_COLORS` — the 5 real belt colors, only for belt-dependent UI (avatar ring, belt dot/label). Don't repurpose for generic chrome.
- `UI_ACCENT` — the app's generic accent (buttons, active tab, active chips). Currently cyan.
- `UI_ACCENT_MUTED` — low-opacity accent tint for *inactive* selectable controls (chips, rating dots), so they read as interactive instead of flat gray before selection.
- `UI_ACCENT_TEXT` — text/icon color for content drawn on top of `UI_ACCENT` or a belt color.
- `darkTheme` / `lightTheme` via `getTheme(scheme)` — background/surface/border/text/success/danger, resolved from `useColorScheme()`. Screens build their `StyleSheet` from a `createStyles(theme)` function called with `useMemo`, rather than a static `StyleSheet.create` at module scope, since colors must react to theme changes.

**Buttons must be visually consistent across every screen.** Any primary action button (filled) uses `backgroundColor: UI_ACCENT` + `color: UI_ACCENT_TEXT`; any secondary/outline button uses `borderColor: UI_ACCENT` + `color: UI_ACCENT`. Never style a button with the belt-based `BELT_COLORS[belt]` accent — that color is reserved for belt-representing UI only (avatar ring, belt dot/label). A prior bug had the Dashboard's "Log Session"/"Log Roll" buttons tinted by belt color instead of `UI_ACCENT`, so for a white-belt user they rendered pale gray while every other button in the app was cyan — check new buttons against an existing one (e.g. Profile's "Save Changes") before considering the styling done.

This applies to icon-only buttons too, not just labeled ones. A list row's quick-action icon (e.g. the trash icon to delete-from-list in Training Log/Roll Tracker/Technique Journal) needs the same `padding: 8, borderRadius: 10, borderWidth: 1, borderColor: <accent>` treatment as everything else — a bare icon with no border/background reads as broken, not minimal. Full-destructive-action buttons (e.g. "Delete Session" at the bottom of an edit form) use the same bordered-pill shape as `signOutButton` in Profile, just with `theme.danger` instead of `UI_ACCENT`.

### Dates (`src/lib/dateFormat.ts`)

Two shared helpers — use them instead of ad hoc `Date`/`toLocaleDateString`/`toISOString` calls:

- `toLocalDateString(date: Date)` → `"YYYY-MM-DD"` in the *device's local* timezone. Never use `date.toISOString().slice(0, 10)` for this — `toISOString` converts to UTC first, which silently shifts the date by a day for users behind UTC, especially near midnight.
- `formatDisplayDate(dateStr: string)` → `"15 Jul 2026"`, spelled out manually rather than via `toLocaleDateString` so the format is fixed regardless of device locale (a device set to a different region won't reorder it to `"Jul 15, 2026"` or similar).

**Date pickers** follow one pattern everywhere (see `LogSessionFormScreen`, `BeltHistorySection`, `BeltDatePromptModal`): on iOS, render `@react-native-community/datetimepicker` inline (`display="compact"` for a small tappable field, `display="spinner"` inside a modal); on Android, render a `Pressable` showing `formatDisplayDate(...)` that calls `DateTimePickerAndroid.open(...)` imperatively (Android's picker isn't a persistent inline component). Both branches convert the picked `Date` back to a string with `toLocalDateString`, never `toISOString`.

### Typography (`src/theme/typography.ts`)

Never hardcode a `fontSize` number or `fontWeight` string in a component. Use `FONT_SIZE.<name>` (`tiny`/`xs`/`sm`/`label`/`body`/`base`/`md`/`lg`/`xl`/`xxl`/`title`/`display`/`streak`) and `FONT_WEIGHT.<name>` (`semibold`/`bold`/`extrabold`) instead. If a new screen genuinely needs a size/weight not already in the scale, add it there with a comment on what it's for — don't inline a raw number.

### Component size limit

No component file should exceed ~400 lines. When a screen grows past that, split it into sub-components under that feature's `components/` folder rather than shrinking via unrelated tricks (e.g. don't move styles to a separate file just to dodge the count — the split should track a real UI/logic boundary). Two patterns already in use:

- **Self-contained chunk** — owns its own query hooks/mutations and only reports back through a callback prop (e.g. `BeltHistorySection`, `BeltTimelineCard`). Best when the chunk is a fully independent feature area.
- **Presentational chunk** — takes all its data via props, parent keeps the state/handlers (e.g. `SessionTypeFields`, `SessionProgressFields`, `BeltDatePromptModal`). Best when the fields are tightly coupled to the parent form's save logic.

### Other conventions

- **Jest** uses `@react-native/jest-preset`; tests live under `__tests__/`.
- **ESLint/Prettier** extend the `@react-native` presets — stay on the RN community defaults rather than adding custom rules. Two rules from that preset come up often enough to call out explicitly:
  - `react/no-unstable-nested-components` — don't define a component function inside another component's render body (e.g. a `renderItem` closure that returns JSX referencing local variables is fine as a plain callback, but an actual `function Foo() { return <View>... }` declared inside another component is not). Hoist it to module scope, or accept the data it needs as props.
  - `react-native/no-inline-styles` — never pass a literal style object (`style={{ color: 'red' }}`) to a component; add it to that file's `createStyles(theme)` return value instead, even for a one-off wrapper `View`.
  - Run `npx tsc --noEmit && npm run lint` after any change — both must be clean before considering a change done.
- Native projects live in `android/` and `ios/` (Swift `AppDelegate` on iOS); avoid hand-editing generated build artifacts (`android/build`, `android/.gradle`, `ios/build`, `ios/Pods`).
- **Flyway applies `backend/src/main/resources/db/migration/` automatically** on `./mvnw spring-boot:run` startup, against whatever `spring.datasource.url` is active for the current profile — unlike the old Supabase workflow, nobody has to run migrations by hand. If a feature touching new schema "doesn't work," check that the backend is actually running against the Postgres you think it is (`docker compose ps` from `backend/`, and confirm `frontend/.env`'s `API_BASE_URL` points at that backend instance) before suspecting the schema itself.
