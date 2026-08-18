# Deploying the backend to Oracle Cloud (Always Free)

One-time setup to get the RollIQ API running on a free, persistent Oracle
Cloud VM, plus the steps to redeploy after future changes.

> **If you ever test `docker-compose.prod.yml` locally** (not just on the
> VM): it shares a directory with the plain `docker-compose.yml` used for
> local dev, and neither file sets an explicit project name, so Compose
> derives the same project (`backend`) for both — meaning they'll fight over
> the *same* `backend_rolliq-postgres-data` volume and container names. If
> you bring up the prod compose file locally while a dev Postgres volume
> already exists, the new `.env` credentials won't take (Postgres only sets
> the user/password on first init of an empty volume) and you'll see
> `password authentication failed`. Fix: `docker compose -f
> docker-compose.prod.yml -p rolliq-prod-test up -d --build` (explicit `-p`
> keeps it in its own namespace) if you want to test locally, or just don't
> — this collision doesn't exist on a fresh VM, which never runs the dev
> compose file at all.

## 1. Create the VM (Oracle Cloud Console)

1. Sign up / log in at [cloud.oracle.com](https://cloud.oracle.com) (a payment
   method is required on file, but Always Free resources are never charged).
2. **Compute → Instances → Create Instance.**
3. Image: **Ubuntu 22.04**. Shape: click "Change shape" → **Ampere** → pick
   `VM.Standard.A1.Flex`, set **2 OCPU / 12 GB RAM** (the current Always Free
   allowance) — keeping it at/under this stays free.
4. Add your SSH public key (or let Oracle generate a key pair for you and
   download the private key — you'll need it to connect).
5. Create the instance, then note its **public IP address** from the instance
   details page.

## 2. Open the port (the step almost everyone misses)

Oracle blocks inbound traffic at **two** layers — both need to allow it:

1. **Cloud side:** Instance details → the subnet link → the attached
   **Security List** → **Add Ingress Rule**: source CIDR `0.0.0.0/0`,
   destination port `8080` (TCP).
2. **OS side (on the VM itself, after SSHing in — see step 3):**
   ```sh
   sudo ufw allow 8080/tcp
   sudo ufw reload
   ```
   (Ubuntu 22.04 images on Oracle also ship `iptables` rules that block
   everything but SSH by default — if `ufw` isn't active, check
   `sudo iptables -L` and add an ACCEPT rule for port 8080 there instead.)

## 3. SSH in and install Docker

```sh
ssh -i /path/to/your/key ubuntu@<vm-ip>

sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# log out and back in for the group change to take effect
```

## 4. Clone the repo and configure secrets

```sh
git clone <your-repo-url> rolliq
cd rolliq/backend
cp .env.example .env
nano .env   # fill in DATABASE_PASSWORD and a real JWT_SECRET
            # generate one with: openssl rand -base64 48
```

## 5. Build and start

```sh
docker compose -f docker-compose.prod.yml up -d --build
```

First run builds the image (a few minutes on the Ampere VM), applies all
Flyway migrations against the fresh Postgres, then starts the API on port
8080.

Watch it come up:

```sh
docker compose -f docker-compose.prod.yml logs -f api
```

Look for `Started RollIqApiApplication` and the Flyway migration lines
(`Successfully applied 9 migrations`).

## 6. Verify from your own machine

```sh
curl -i http://<vm-ip>:8080/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"wrong"}'
```

Expect a `401` with a JSON error body — that's the server correctly running
and rejecting bad credentials, not a connection failure. A connection
refused/timeout means the port isn't actually open (recheck step 2).

## 7. Point the app at it

In `frontend/.env`, set:

```
API_BASE_URL=http://<vm-ip>:8080/api/v1
```

Rebuild the app (or restart Metro) for a TestFlight/device build to pick it
up.

## Redeploying after future changes

Before deploying, run the test suite locally first — the Docker build itself
**skips tests** (Testcontainers needs a Docker daemon the build container
doesn't have access to), so this is the actual gate:

```sh
# on your machine, from backend/
./mvnw test
```

Then, on the VM:

```sh
cd rolliq/backend
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

This rebuilds the `api` image and restarts just that container; `postgres`
and its data volume are untouched, so any new Flyway migrations run
automatically against the existing database on startup.

## Not covered here (see the plan this came from)

- **HTTPS.** This setup is plain HTTP against a bare IP — fine for testing,
  but iOS's App Transport Security expects HTTPS by default and Apple's
  review process does too for anything beyond a scoped debug exception.
  Needs a real domain (Let's Encrypt can't issue a cert for a bare IP) — a
  `Caddy` reverse proxy in front of `api` is the natural next step once you
  have one.
