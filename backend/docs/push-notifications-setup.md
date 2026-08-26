# Setting up Firebase Cloud Messaging (push notifications)

All the app/backend code for push notifications is already in place — this
covers the parts that only you can do, in your own Firebase Console and
Apple Developer accounts. Until you finish this, the app runs completely
normally with push notifications silently disabled (see "How this degrades
gracefully" at the bottom).

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) →
   **Add project** → name it (e.g. `RollIQ`) → skip Google Analytics unless
   you want it (not needed for push).

## 2. Register the iOS app

1. Project Overview → **Add app** → iOS.
2. **Bundle ID**: must match `frontend/ios/RollIQ.xcodeproj`'s
   `PRODUCT_BUNDLE_IDENTIFIER` exactly (open the project in Xcode → target
   **RollIQ** → General tab → check "Bundle Identifier" if unsure).
3. Download **`GoogleService-Info.plist`**.
4. In Xcode: drag the downloaded file into the `RollIQ` group in the Project
   Navigator (next to `AppDelegate.swift`). In the dialog, make sure **"Copy
   items if needed"** is checked and the **RollIQ target** is checked under
   "Add to targets." (Dropping the file into `frontend/ios/` on disk without
   also adding it in Xcode does nothing — Xcode only bundles files it knows
   about via the project file.)
5. Still in Xcode, select the **RollIQ target → Signing & Capabilities** →
   **+ Capability** → add:
   - **Push Notifications**
   - **Background Modes**, then check **Remote notifications**

## 3. Generate an APNs key and upload it

1. [developer.apple.com](https://developer.apple.com) → **Certificates,
   Identifiers & Profiles → Keys → +**. Name it anything, check **Apple Push
   Notifications service (APNs)**, create it, and download the `.p8` file
   (Apple only lets you download it once — keep it somewhere safe). Note the
   **Key ID** shown on the same page.
2. Firebase Console → **Project Settings → Cloud Messaging** → under **Apple
   app configuration**, **APNs Authentication Key → Upload**. Provide the
   `.p8` file, the **Key ID**, and your **Team ID** (top-right of the Apple
   Developer site, or Membership Details).

## 4. Register the Android app

1. Project Overview → **Add app** → Android.
2. **Package name**: must match `applicationId` in
   `frontend/android/app/build.gradle` (currently `com.rolliq`).
3. Download **`google-services.json`**, place it at
   `frontend/android/app/google-services.json`. The Gradle plugin is already
   wired to pick it up automatically once the file exists (see
   `android/build.gradle` and `android/app/build.gradle` — the plugin
   application is conditional on this file so the build doesn't break for
   anyone who hasn't done this step).

## 5. Give the backend permission to send

1. Firebase Console → **Project Settings → Service Accounts → Generate new
   private key**. This downloads a JSON file — treat it like a password,
   never commit it.
2. Point the backend at it via the `GOOGLE_APPLICATION_CREDENTIALS`
   environment variable, same "env-var driven, never committed" convention as
   `JWT_SECRET`:
   - **Local dev**: add to `backend/.env` (or however you currently set
     `JWT_SECRET` locally) —
     `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/the-downloaded-file.json`
   - **Oracle VM**: copy the JSON file onto the VM (e.g.
     `scp` it up, outside the git repo), then add the same env var to
     whatever env file `docker-compose.prod.yml` reads on that VM, mounting
     the JSON file into the container if it isn't already accessible at that
     path inside the container.

## 6. Rebuild natively

This is bundled with the Reanimated/drawer-nav rebuild already needed for
this feature set:

```sh
cd frontend
npm install
cd ios && bundle exec pod install && cd ..
npx react-native run-ios      # or run-android
```

A Metro-only reload will **not** pick up the new native Firebase modules —
you need the full native build once.

## How this degrades gracefully

- **Backend**: `FirebaseConfig`'s `FirebaseApp` bean only registers when
  `GOOGLE_APPLICATION_CREDENTIALS` is set (`@ConditionalOnProperty`).
  `PushNotificationService` takes it as `Optional<FirebaseApp>` and no-ops
  if empty — the three scheduled/event-triggered notification jobs keep
  running (harmlessly) whether or not Firebase is configured.
- **Frontend**: `src/lib/pushNotifications.ts` wraps every Firebase call in
  a try/catch — if `GoogleService-Info.plist`/`google-services.json` aren't
  present, registration silently fails and the rest of the app is
  unaffected.
- **Android build**: the `google-services` Gradle plugin only applies if
  `google-services.json` exists on disk (see step 4) — otherwise the build
  just skips it.

## Verifying it works end-to-end

1. Finish steps 1–6 above, sign in on a real device (the FCM/APNs simulator
   support is unreliable — test on physical hardware).
2. Check the device registered: `GET /api/v1/device-tokens` isn't exposed,
   but you can confirm via the backend logs or a direct query against the
   `device_tokens` table for your `user_id`.
3. Easiest trigger to test: as a gym owner/trainer, post a new class recap
   (`POST /api/v1/gyms/{gymId}/classes`) while a second test account is a
   member of that gym and signed in on a device — they should get a push
   within a few seconds.
4. The streak-at-risk and upcoming-class-reminder jobs run on their own
   schedule (see `StreakNotificationService` / `GymScheduleReminderService`)
   — to test those without waiting, temporarily shorten the `@Scheduled`
   cron expression, or just trust the class-recap trigger above since it
   exercises the same `PushNotificationService.sendToUser` path.
