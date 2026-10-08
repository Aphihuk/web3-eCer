# Backend Security & Structure Refactor — Phase 1

**Date:** 2026-10-08
**Branch:** `refactor/backend-security` (from WIP commit `7350792`)
**Scope:** `backend/` only. PHP changes limited to repointing `support/tickets_api.php`.

## Goals

1. Close the admin privilege-escalation hole (any logged-in user can call `/admin/*`).
2. Remove the hardcoded JWT secret (`"SECRET_KEY"`, 27 call sites in 16 files).
3. Centralize auth, schema setup, and error handling so controllers only contain business logic.
4. Delete dead code.

## Non-goals

- Password hashing (explicitly deferred by user).
- Pinata JWT exposure via public `GET /settings/pinata_jwt` — flagged, deferred to a later phase
  (needs server-side upload + `index_LABChain.js` changes).
- Renaming `verliflie` routes/files (would break PHP + Flutter clients).
- PHP frontend refactor (phase 2).

## Design

### 1. `config/env.js`
Loads `dotenv`, validates required vars at startup, exports a frozen config object.
Required: `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_NAME`, `RPC_URL`, `CONTRACT_ADDRESS`.
`DB_PASSWORD` may be empty. Missing required var → log name and `process.exit(1)`.
`.env.example` added listing all keys with empty values.

### 2. `middleware/auth.js`
- `requireAuth` — reads `Authorization: Bearer <token>`, verifies with `config.JWT_SECRET`,
  sets `req.user` (decoded payload). 401 JSON on missing/invalid token.
- `requireRole(...roles)` — must follow `requireAuth`; 403 JSON if `req.user.role` not in roles.
- Error message bodies keep the existing Lao text and `{ ok:false, msg }` / `{ message }` shapes
  that the PHP/Flutter clients already parse.

`middleware/requireSupport.js` is replaced by `requireRole('support','admin')`.
`login.js` signs with `config.JWT_SECRET` (payload unchanged, includes `role`).

Controllers drop their inline `jwt.verify` blocks and use `req.user`.

### 3. Route protection (declared in router)

| Routes | Middleware |
|---|---|
| `/admin/*` (users, set-max-badge, set-user-prices, set-role, update-name, tx-log GET/POST/DELETE) | `requireAuth, requireRole('admin')` |
| `POST /settings/:key` | `requireAuth, requireRole('admin')` |
| `/support/tickets*` | `requireAuth, requireRole('support','admin')` |
| `/me`, `/wallet/change`, `/wallet/register-for`, `/wallet/user-by-wallet`, `/wallet/admin-recover`, `/mint-voucher`, `/fcm-token` | `requireAuth` (same as today's inline checks) |
| `POST /tickets`, register/verify/login/password reset, public wallet checks, `/nfts*`, `GET /settings/:key` | public (unchanged) |

Removed: unauthenticated `GET /tickets`, `PATCH /tickets/:id/read`, `DELETE /tickets/:id`,
`POST /tickets/:id/reply`. `php/support/tickets_api.php` repointed to `/support/tickets*`
(it already forwards the browser's Bearer token).

Where a controller currently has additional ownership checks (e.g. `adminRecover` role logic),
those remain in the controller.

### 4. `db/migrate.js` + `npm run migrate`
Idempotent: `CREATE DATABASE IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS` for
`users, wallet_history, tickets, recovery_payments, settings, tx_logs`, plus
column-exists checks (via `information_schema.COLUMNS`) for columns previously added by
runtime `ALTER TABLE` (`maxBadge, recoveryFee, issuerLabel, role, fcm_token, oldWalletAddress, MintPrice`).
All runtime `CREATE TABLE` / `ALTER TABLE` statements are removed from controllers.

### 5. `middleware/errorHandler.js`
Express 5 forwards rejected promises from async handlers. Final handler logs the error and
returns `500 { message }`. Controllers may still return specific 4xx responses themselves.

### 6. Cleanup
- Delete `controllers/verliflie.js` (unreferenced legacy monolith).
- Delete `middleware/requireSupport.js`.
- Update `CLAUDE.md` (env vars, migrate command, auth model).

## Rollout notes
- New `JWT_SECRET` invalidates all existing tokens → every user logs in again once.
- Admin accounts must have `users.role = 'admin'`; the user will set this manually.
- `.env` remains tracked in git with live secrets; recommend rotating
  `ADMIN_PRIVATE_KEY`, Firebase key, Gmail app password and untracking `.env`.

## Verification
No test suite exists. Verification = start server, run `npm run migrate` twice (idempotent),
then curl matrix for each protected route group: no token → 401, `user` token → 403 on
admin/support routes, `admin` token → 2xx. Public routes still return as before.
PHP support dashboard loads ticket list via `tickets_api.php`.
