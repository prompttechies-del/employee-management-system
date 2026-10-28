# EMS on Cloudflare (Workers + D1)

Serverless port of the Employee Management System: a Cloudflare Worker (JavaScript) with a D1 (SQLite) database. Always on, no server to run.

**Live:** https://ems.prompttechies.workers.dev

## Features
- Admin login with signed, HttpOnly, Secure, SameSite cookie sessions (8 h)
- Login lockout after 5 failed attempts per IP in 15 minutes
- CSRF tokens on every state-changing form
- Server-side validation, duplicate-email detection, HTML-escaped output
- Strict CSP, HSTS, X-Frame-Options and other security headers

## Deploy your own
```bash
npm install
npx wrangler login
npx wrangler d1 create ems            # copy the database_id into wrangler.toml
npm run db:init                       # creates tables in the remote D1
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET   # any long random string
npm run deploy
```
Optional: set `ADMIN_USER` (default `admin`) under `[vars]` in `wrangler.toml`.

## Run locally
Create `.dev.vars` (git-ignored):
```
ADMIN_PASSWORD=choose-a-password
SESSION_SECRET=any-long-random-string
```
then `npm run db:init:local` and `npm run dev`.
