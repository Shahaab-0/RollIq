# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

RollIQ is a React Native 0.86 app currently at the freshly-bootstrapped stage: `App.tsx` still renders the default `@react-native/new-app-screen` template with no custom screens, navigation, or business logic yet. There is no `src/` directory — new application code should be organized there as it's added.

## Commands

```sh
npm start              # Start Metro dev server (run this first, in its own terminal)
npm run android        # Build and run on Android (requires Metro running)
npm run ios            # Build and run on iOS (requires Metro running)
npm test               # Run Jest tests
npm test -- App.test   # Run a single test file (Jest pattern match on filename)
npm run lint           # ESLint via @react-native/eslint-config
```

iOS native deps: after any change to `ios/Podfile` or native dependencies, run `bundle exec pod install` from `ios/` (first-time setup also requires `bundle install` from the repo root).

## Architecture

- **Entry point**: `index.js` registers `App` (from `App.tsx`) as the root component via `AppRegistry`.
- **App.tsx**: wraps the app in `SafeAreaProvider` and reads `useColorScheme()` for light/dark `StatusBar` styling. Safe area insets are computed via `useSafeAreaInsets()` and passed down explicitly rather than relying on `SafeAreaView`.
- **TypeScript config** extends `@react-native/typescript-config`; Jest types are added on top.
- **Jest** uses `@react-native/jest-preset`; tests live under `__tests__/` (e.g. `App.test.tsx` renders `App` via `react-test-renderer`).
- **ESLint/Prettier** extend the `@react-native` presets (`.eslintrc.js`, `.prettierrc.js`) — don't add custom lint rules without reason, stay on the RN community defaults.
- Native projects live in `android/` and `ios/` (Swift `AppDelegate` on iOS); avoid hand-editing generated build artifacts (`android/build`, `android/.gradle`, `ios/build`, `ios/Pods`).
