# Production readiness — what got fixed and what's left

This covers the gaps flagged when the question came up: is RollIQ ready for
real users. Same split as the Firebase/push-notifications work — the code
is all in; a few of these need you to do something in an external console
before they're actually live.

## What's done

### Password reset

Forgot Password → enter email → a 6-digit code is emailed → enter the code
+ a new password in-app. No deep links, no web page to land on — the code
gets typed back into the app, same pattern as most mobile OTP flows.

A password reset also revokes every existing refresh token for that
account, so a reset forces re-login everywhere (the right move if a reset
was needed because of a compromised session).

**To make it actually send email**, set these env vars wherever the backend
runs (same "env var, not committed" convention as `JWT_SECRET`):

```
MAIL_HOST=smtp.gmail.com       # or SendGrid/Mailgun/etc.'s SMTP host
MAIL_PORT=587
MAIL_USERNAME=your-address@gmail.com
MAIL_PASSWORD=an-app-password   # NOT your real password -- see below
MAIL_FROM=noreply@yourdomain.com
```

Until `MAIL_HOST` is set, nothing breaks — the backend logs the code
instead of emailing it (`EmailService.sendPasswordResetCode`), which is
genuinely useful for local testing without any SMTP setup at all.

**Cheapest real option for low volume:** a Gmail account with an [App
Password](https://myaccount.google.com/apppasswords) (not your normal
password — Google blocks plain-password SMTP login). Free, fine for a beta.
For anything beyond a handful of users, move to SendGrid or Mailgun's free
tier (both give you an SMTP host/port/credentials the same way).

### Crash & error reporting (Sentry)

Both the backend (Java SDK) and the app (`@sentry/react-native`) are wired
up. Like the Sentry SDK's own documented behavior, an empty DSN is a
complete no-op — nothing breaks if you skip this, you just won't see errors.

**To turn it on:**
1. Sign up at [sentry.io](https://sentry.io) (free tier is plenty to start).
2. Create two projects: one "React Native", one "Spring Boot" (or reuse one
   org across both — doesn't matter, just grab each project's DSN).
3. Frontend: put the React Native project's DSN in `frontend/.env` as
   `SENTRY_DSN=https://...`.
4. Backend: set the `SENTRY_DSN` env var wherever the backend runs, same as
   `MAIL_HOST`/`JWT_SECRET`.

No native rebuild needed beyond the one already done this session — the
native module is already linked.

### Account deletion

Profile → Delete Account. Requires confirmation, permanently removes the
user row and (via the cascading foreign keys every table already has) every
session, technique, roll, injury, competition, and gym membership tied to
it. This exists because Apple's App Store guideline 5.1.1(v) requires
in-app account deletion for any app that supports account creation — this
was a hard requirement for App Store submission, not just a nice-to-have.

### Privacy Policy & Terms of Service

Static pages served directly by the backend (no separate hosting needed) at:

```
http://<your-backend-host>/legal/privacy.html
http://<your-backend-host>/legal/terms.html
```

Linked from Profile in the app. **Before you actually submit to an app
store**, open both files
(`backend/src/main/resources/static/legal/*.html`) and:
- Replace `support@rolliq.app` with a real address you'll actually check.
- Replace the "Last updated" placeholder date.
- Read them once end to end — they're accurate to what the app currently
  collects, but if you add a feature that changes what's collected, update
  these too.

App Store Connect and Play Console both want a **Privacy Policy URL** in
their listing forms — this is a live URL, and it needs HTTPS for the App
Store (see the HTTPS gap below).

### Database backups & auto-restart

`docker-compose.prod.yml` already had `restart: unless-stopped` on both
containers, so the API and database come back up after a VM reboot or
crash — this was already correct going in. Actual off-VM backups were not
set up; see the new "Backing up the database" section in `deploy-oracle.md`
for a cron script.

## What's still a real gap

These weren't in scope for this pass but are worth knowing about before you
scale past a small closed beta:

- **HTTPS.** The Oracle deployment is plain HTTP against a bare IP. iOS's
  App Transport Security expects HTTPS, and Apple's App Store review does
  too beyond a scoped debug exception. Needs a real domain + a reverse
  proxy (Caddy auto-provisions Let's Encrypt certs with almost no config) —
  flagged in `deploy-oracle.md` already.
- **Rate limiting.** Nothing throttles `/auth/signin`, `/auth/signup`, or
  `/auth/forgot-password` — a script could hammer any of them. Low risk at
  beta scale with a handful of trusted users, worth adding (e.g. a
  per-IP/per-email limiter) before a public launch.
- **Email verification on signup.** Anyone can sign up with an email they
  don't own — fine for a closed beta, worth adding if spam/fake accounts
  become a problem.
- **App store submission itself.** Developer accounts ($99/yr Apple,
  $25 one-time Google), app icons/screenshots, App Store Connect /
  Play Console listing metadata, TestFlight or Internal Testing track setup
  — none of this is code, it's account/console work only you can do.
