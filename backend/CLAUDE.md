# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node.js/Express REST API backend for **NFT LAO** — a Lao digital certificate platform on LABChain (Chain ID 5222). Handles user auth, wallet management, support tickets, and admin operations. The PHP frontend at `d:\NFT\php` calls this API; it never touches MySQL directly.

## Development Commands

```bash
npm install
npm start          # nodemon watch mode on port 3200
```

No tests, no linter configured.

## Architecture

### Entry Point
`server.js` auto-loads every `.js` file in `router/` via `fs.readdirSync` and mounts all routes under `/api`. To add new routes: create a file in `router/` — it registers automatically.

Currently only one router file exists: `router/verliflie.js`.

### Controller Structure
```
controllers/
  index.js          ← re-exports all controllers as named exports
  db.js             ← MySQL2 connection pool (import this for DB access)
  auth/             ← register, verliflie (email verify), login, getMe
  password/         ← get_password, reset_password, reset_passwords
  wallet/           ← changeWallet, verifyWallet, checkWallet*, adminRecover, getUserByWallet, dedupWalletHistory
  admin/            ← getAllUsers, setUserMaxBadge, setUserPrices
  tickets/index.js  ← createTicket, listTickets, readTicket, deleteTicket, replyTicket
  test/test.js      ← health check endpoint
  config/
    mailer.js       ← nodemailer transporter (Gmail via EMAIL_USER/EMAIL_PASS)
    store.js        ← in-memory Maps: pendingUsers (registration), get_passwords (reset tokens)
    constants.js    ← shared constants
```

### Adding a Controller
1. Create file in the appropriate `controllers/` subdomain folder
2. Export the handler function
3. Add it to `controllers/index.js`
4. Add the route to `router/verliflie.js`

### Database
- Import pool: `const { db } = require("../db")`
- Callback style: `db.query(sql, [params], (err, results) => {})`
- Promise style: `await db.promise().query(sql, [params])`
- Database name: `nft_vreliflie`
- No migration files — schema must be created manually

**Tables used:** `users`, `wallet_history`, `tickets`

The `tickets` table CREATE statement is commented out in `controllers/tickets/index.js:15` — run it manually if the table doesn't exist yet.

### Authentication
JWT tokens signed/verified with `"SECRET_KEY"` (hardcoded — should be `process.env.JWT_SECRET`).
Token format in requests: `Authorization: Bearer <token>`

### In-Memory Token Storage
`pendingUsers` and `get_passwords` in `controllers/config/store.js` are plain `Map()` objects — tokens are lost on server restart. This is intentional: unverified users are not inserted into DB until email verification completes.

## Environment Variables

Required in `.env`:
```
EMAIL_USER=
EMAIL_PASS=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=nft_vreliflie
RPC_URL=https://rpc.labchain.la
CONTRACT_ADDRESS=0x8458eF57B56C92091B99CbE371443D49ECC190d2
ADMIN_PRIVATE_KEY=
BASE_URL=
```

## Known Issues

| Issue | Location |
|-------|---------|
| JWT secret hardcoded as `"SECRET_KEY"` | `login.js`, `changeWallet.js`, `getAllUsers.js` |
| Passwords stored as plaintext (no bcrypt) | `auth/register.js`, `auth/login.js` |
| Ticket list/delete/read/reply endpoints have no auth | `tickets/index.js` |
| `ALTER TABLE users ADD COLUMN` runs on every `/admin/users` request | `admin/getAllUsers.js:15` |
| `CREATE TABLE wallet_history` runs on every wallet change + every registration | `wallet/changeWallet.js`, `auth/verliflie.js` |
| Email verification redirects to hardcoded `http://localhost:90` | `auth/verliflie.js:40` |

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` v5 | HTTP framework |
| `mysql2` | MySQL driver (callback + promise API) |
| `jsonwebtoken` | JWT sign/verify |
| `nodemailer` | Email sending |
| `ethers` v6 | Blockchain interaction (available but usage is mainly client-side) |
| `dotenv` | `.env` loading |
| `morgan` | Request logging |
| `nodemon` | Dev watch mode |
