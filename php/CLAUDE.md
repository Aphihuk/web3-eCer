# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NFT LAO** is a Lao-first digital certificate platform that mints tamper-proof NFT certificates on **LABChain** (EVM-compatible, Chain ID 5222). Organizations (schools, companies, government) issue certificates as NFTs; recipients own and share them via wallet.

The project spans three layers:
- **PHP frontend** (`d:\NFT\php`) — server-side rendered admin + user UI
- **Node.js backend** (`D:\NFT\backend`) — REST API, MySQL, email, blockchain
- **Flutter mobile** (`d:\NFT\application`) — early-stage, template only

## Development Commands

### PHP Frontend (Apache, port 90)
```bash
cd d:\NFT\php
docker-compose up --build      # Start container
docker-compose down            # Stop
```
Access at `http://localhost:90`. No PHP CLI dev server — Docker only.

### Node.js Backend (Express, port 3200)
```bash
cd D:\NFT\backend
npm install
npm start                      # nodemon watch mode (port 3200)
```

### Database
MySQL database `nft_vreliflie` must be running locally. No migration files exist — schema must be set up manually. Connection config lives in `D:\NFT\backend\.env`.

## Architecture

### PHP Frontend
- Apache + PHP 8.2 in Docker; `.htaccess` handles URL rewriting
- Pages are standalone PHP files — no MVC framework, no database connection
- PHP never calls MySQL directly; it proxies to the Node.js backend via `file_get_contents()` (see `support/tickets_api.php` for the pattern)
- Blockchain interaction is **client-side only** via ethers.js — PHP server never touches the chain
- `config/contract.config.js` holds contract address, chain ID, API base URL, and Pinata gateway — loaded as a `<script>` before other JS files
- `config/contract.config.php` — PHP mirror of `contract.config.js`; exposes `_API_BASE_URL`, `_API_URL`, `_CONTRACT_ADDRESS`, `_CHAIN_ID`, `_PINATA_GATEWAY` constants for server-side PHP files (include this instead of hard-coding values)

### JavaScript modules (`script/`)
- `script/index_LABChain.js` — main blockchain logic (wallet connect, mint, transfer, register); contains the **full ABI** used in the minting UI
- `script/file_NFT/` — modular helpers: `connect_Wallet.js`, `Network_chain.js`, `JWT.js`, `LAB_ABI.js`, `contractaddress.js`, `modalNFT.js`, `selectNFTINModal.js`, `setFee.js`, `getNFTaddress.js`
  - `LAB_ABI.js` is a combined file: minimal read-only ABI (4 functions) **plus** shared utilities (`ipfsToHttp`, `getImageUrl`, `shortenAddr`, `getAlchemyBase`). It also holds global state (`currentAccount`, `currentChainId`, `allNFTs`). Used by the NFT browse page, not the minting UI.
- `script/chatAI/chatAI.js` — floating AI support chat widget
- `script/login.js` — auth flow

### Node.js Backend
- `server.js` auto-loads every file in `router/` via `fs.readdirSync` — adding a file to `router/` registers new routes automatically under `/api`
- Only one router file exists: `router/verliflie.js`
- Controllers are organized by domain: `controllers/auth/`, `controllers/wallet/`, `controllers/admin/`, `controllers/password/`, `controllers/tickets/`
- `controllers/index.js` re-exports all controllers as named exports
- `controllers/db.js` exports a MySQL connection pool — import this in any controller that needs DB access
- `controllers/config/mailer.js` — nodemailer setup; `controllers/config/constants.js` — shared constants

### Active API Routes (`/api/*`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register` |  | User registration + email verification send |
| GET | `/verliflie/:token` |  | Email verification |
| POST | `/login` |  | Login → JWT |
| GET | `/me` | JWT | Current user |
| POST | `/get_password` |  | Send password reset email |
| GET/POST | `/reset/:token` |  | Password reset |
| GET | `/wallet/verify` |  | Verify wallet signature |
| GET | `/wallet/check-linked` |  | Check if wallet is linked to account |
| GET | `/wallet/check-registered` |  | Check if wallet registered on-chain |
| POST | `/wallet/change` |  | Change linked wallet |
| POST | `/wallet/admin-recover` |  | Admin wallet recovery |
| GET | `/wallet/user-by-wallet` |  | Lookup user by wallet address |
| GET | `/wallet/history-dedup` |  | Wallet history deduplication |
| GET | `/admin/users` | JWT | List all users |
| POST | `/admin/set-max-badge` | JWT | Set user badge limit |
| POST | `/admin/set-user-prices` | JWT | Set per-user mint pricing |
| POST/GET | `/tickets` |  | Create / list support tickets |
| PATCH | `/tickets/:id/read` |  | Mark ticket read |
| DELETE | `/tickets/:id` |  | Delete ticket |
| POST | `/tickets/:id/reply` |  | Reply to ticket |

### Blockchain
- **LABChain RPC**: `https://rpc.labchain.la`
- **Contract**: `LearnBadge.sol` deployed at `0xA80ae5b8B672A9C5eF6eBB66c2A151854Ee1eEcD` (source of truth: `config/contract.config.js`). Note: the Solidity class is named `test` — the file name and deployment name are the canonical references.
- Minting calls go through ethers.js in the browser using the user's MetaMask wallet
- Admin panel (`Admin/admin.php`) requires both: ① JWT login AND ② MetaMask connect as contract Owner

**Mint paths** (two variants of each):
| Function | Who can call | Payment |
|----------|-------------|---------|
| `mintBadge` / `batchMintBadge` | Any registered user | global `mintPrice` or per-user `customMintPrice` |
| `mintBadgeWithVoucher` / `batchMintBadgeWithVoucher` | Registered user + admin-signed voucher | `voucherPrice` in the signed voucher |

Vouchers are ECDSA signatures produced server-side with `ADMIN_PRIVATE_KEY`. The contract verifies `keccak256(contractAddress, user, price, expiry)` signed by `owner()`. Use vouchers when the admin has set a per-user custom price via `/api/admin/set-user-prices`.

**`_forwardFunds` is a no-op** — the internal function that should route payment to `fundsReceiver` has an empty body. Funds sent with `mintBadge` calls remain in the contract until `withdrawFunds()` is called by the owner.

**`tokenURIHistory`** — every call to `updateBadge()` on-chain pushes the old `tokenURI` to `tokenURIHistory[tokenId]` before overwriting. Use `getTokenURIHistory(tokenId)` to audit badge metadata changes.

### IPFS Badge Metadata

Every badge has an on-chain `Badge` struct (`badgeName`, `activity`, `issuedTo`, `issuedAt`) and an off-chain IPFS JSON at `tokenURI`. The canonical metadata schema is:

```json
{
  "name": "Badge Name",
  "description": "Activity text\nຜູ້ສົ່ງ: Sender Name",
  "image": "ipfs://<CID>",
  "issuer": "ຄົນທົ່ວໄປ",
  "attributes": [
    { "trait_type": "ອອກໂດຍ", "value": "ຄົນທົ່ວໄປ" },
    { "trait_type": "ຜູ້ສົ່ງ",  "value": "Sender Name" },
    { "trait_type": "Activity", "value": "Activity text" }
  ]
}
```

**Sender parsing** (`loadBadges()` in `index_LABChain.js`): looks for `"ຜູ້ສົ່ງ:"` in on-chain `badge.activity` first; if not found, falls back to `meta.description` fetched from IPFS. Both paths must be preserved when updating.

**Metadata preservation rule** (`Admin/admin.js`): when re-uploading IPFS JSON (image upload or description edit), always spread the cached old metadata and override only changed fields — never construct a bare object. Missing fields cause permanent data loss since old IPFS pins cannot be modified.

### Admin.js State

`Admin/admin.js` uses three module-level variables that persist across function calls:
- `currentBadgeMeta` — IPFS metadata fetched by `fetchBadgeForUpdate()`; reused by `updateBadge()` and `adminUploadImage()` to avoid a second IPFS fetch and to preserve original fields (`issuer`, `ຜູ້ສົ່ງ` attribute, etc.). **Must be updated** after `adminUploadImage()` succeeds so subsequent description re-uploads use the new image.
- `txLog` — session-only transaction history shown in the Tx Log section.
- `lastBadgesData` — cached badge list for the Manage Badges section.

### Page Map
| File | Route / Purpose |
|------|----------------|
| `index.php` | Landing page |
| `controllers/learnnbadge-ui.php` | NFT minting interface (main user tool) |
| `controllers/Organization.php` | Issuer registration multi-step form |
| `controllers/NFT.php` | Browse/view NFTs |
| `controllers/login.php` | Login page |
| `auth/register.php` | Registration page |
| `auth/Frogotpassword.php` | Forgot password page |
| `Admin/admin.php` | Admin dashboard (owner-only) |
| `support/support.php` | Support ticket submission UI |
| `support/tickets_api.php` | PHP proxy → backend tickets API |
| `support/send_ticket.php` | Send ticket handler |
| `Document/index.php` | Documentation landing |
| `Document/pages/` | about.php, contact.php, services.php |

## Authorization Model

Understanding the two-layer access model is critical before touching anything auth-related.

### Layer 1 — JWT (API-level)
Standard email/password login at `POST /api/login` returns a JWT (7-day expiry). JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>`. Used to gate `/api/me` and `/api/admin/*` routes. **No role field exists in the `users` table** — any valid JWT can call admin endpoints.

### Layer 2 — Wallet ownership (admin panel gate)
`Admin/admin.php` has a second gate after JWT login: MetaMask must be connected and `contract.owner()` must match the connected wallet. This is the real admin check — the JWT alone is insufficient. There are no roles in the database.

### Roles table
| Role | Where defined | What it unlocks |
|------|--------------|-----------------|
| Contract Owner | `contract.owner()` on-chain | Full admin panel |
| Operator | `contract.operators(address)` on-chain | On-chain badge ops only; no panel access |
| Regular user | Row in `users` table | Minting UI |
| Support staff | **Not yet implemented** | Planned: ticket management without wallet |

## Support / Tickets System

**Current state**: All ticket API endpoints are completely unauthenticated — anyone can list, delete, or reply to tickets by calling the API directly.

**Flow**: User submits via `support/support.php` → `send_ticket.php` → `POST /api/tickets` → row inserted in `tickets` table → email notification sent to `EMAIL_USER`.

**Ticket schema** (DB table `tickets`):
```
id (CHAR 16), name, email, type, type_label, msg, wallet,
status ENUM('new','read','replied'), reply, replied_at, created_at
```

**Admin management**: Tickets are viewable/replyable from the Admin panel (wallet-owner only). A reply sends email back to the submitter.

### Planned: Support Staff Portal
A dedicated `support/` dashboard is planned so support staff can manage tickets **without** MetaMask or contract-owner access. This requires:
1. Add `role ENUM('user','support','admin') DEFAULT 'user'` to the `users` table
2. Add `POST /api/support/login` (or reuse `/api/login`) + a `requireSupport` JWT middleware that checks `role IN ('support','admin')`
3. Protect ticket mutation endpoints (`PATCH`, `DELETE`, `POST /reply`) with that middleware
4. Build `support/dashboard.php` — ticket list with filter/reply/delete UI, no MetaMask dependency

## Design System

**Colors** (dark-mode only) — applies to every page except `Admin/admin.php` (see exception below):
- `#00aaff` — Chain Cyan (network states, logo)
- `#7c3aed` — Deep Violet (primary actions: mint, connect wallet)
- `#06d6a0` — Verify Teal (on-chain success)
- `#0a0a0f` / `#16161f` — background base / card surface

**Fonts**: Noto Sans Lao (body, Lao-first), Space Mono (wallet addresses/hashes), Outfit (headings/UI)

**Tone**: Institutional credibility over crypto spectacle — no neon gradients, no speculative language.

### Exception: Admin panel (light theme)

`Admin/admin.php` / `Admin/admin.css` intentionally deviate from the dark-mode system above. By explicit request, the admin panel was restyled to a light theme inspired by `https://labchain.la/`, and all Font Awesome icons were removed in favor of plain text labels. This applies only to the Admin section — `support/dashboard.php`, the mint UI, and every other page remain dark-mode per the system above.

**Colors** (`Admin/admin.css` `:root` tokens):
- `#0f6fb3` / `#0c5a91` — primary action blue / hover (`--violet` / `--violet-hi`, repurposed from the site's violet role)
- `#16a34a` — success / chain-state green (`--cyan` / `--teal` / `--green`)
- `#dc2626` — danger (`--red`)
- `#f59e0b` — warning (`--amber`, decorative use only — dots/solid fills; use `#b45309` for any warning text on a light tint)
- `#f7fafc` / `#ffffff` / `#f1f5f9` — page background / card surface / secondary surface
- `#1a1f2e` / `#4a5568` — text / muted text
- `#e2e8f0` / `#cbd5e1` — border / strong border

All accent colors were chosen/darkened to clear AA contrast (≥4.5:1) against white — do not reintroduce the lighter `#1489d5`/`#22c55e` shades scraped directly off labchain.la as text or button-fill colors, they fail contrast on white.

## Environment

Backend requires `D:\NFT\backend\.env`:
```
EMAIL_USER, EMAIL_PASS
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
RPC_URL, CONTRACT_ADDRESS, ADMIN_PRIVATE_KEY
BASE_URL
```

Frontend API calls target `API_BASE_URL` in `config/contract.config.js` (currently `http://localhost:3200`).

The backend lives in a different repo (`D:\NFT\backend`) and can run two ways, with **different
reachable URLs**:

- native `node server.js` → `http://localhost:3200` (`server.js:37` hardcodes `app.listen(3200)`)
- `docker compose` → `http://localhost:85` — Node's 3200 is only `expose`d inside container `api-NFT`, never published; nginx container `nginx-database_nft` publishes 85 and proxies `/` -> `node-app:3200`

Prefer native. The running Docker containers can hold a stale env (built when `.env` said
`DB_HOST=172.17.0.7` and `CONTRACT_ADDRESS=0x3c9c9CB…`), which makes `/api/tickets` return 500 and
leaves the blockchain listener watching the wrong contract. Natively dotenv loads all 11 vars of
`.env`. If you must use Docker: `docker compose up -d --force-recreate`.

Verify with `curl http://localhost:<port>/api/me` (expects 401 `{"message":"No token"}`) and
`curl http://localhost:<port>/api/tickets` (expects 200 — that one exercises the DB).

`server.js:29` reads `./router` via a relative path, so always `cd D:\NFT\backend` before starting
it. `npm start` runs it under nodemon.

CORS in the backend allows origin `*` (`server.js` `cors({ origin: "*" })`), so localhost:90 works
without changes.

The PHP mirror in `config/contract.config.php` auto-detects: `host.docker.internal:85` when PHP runs
inside the `learnbadge_web` container (`localhost` there means the container itself → Connection
refused), and `localhost:3200` when PHP runs natively via `php -S`. `host.docker.internal` resolves
on Docker Desktop (Windows/macOS); on Linux add
`--add-host=host.docker.internal:host-gateway`.

## Current State

**Functional:** Landing page, admin dashboard, NFT minting UI, email verification, all API routes active, support ticket system, blockchain integration (ethers.js + LABChain), smart contract deployed.

**Incomplete:** No tests, no linter. Flutter app is template-only. PHP `pdo`/`pdo_mysql` extensions are installed in Docker but unused (PHP proxies to backend instead of direct DB). Support staff role not yet implemented (tickets currently admin-panel only).

## Work Log

<!-- เพิ่มบันทึกงานที่ทำเสร็จแล้วตรงนี้ รูปแบบ: - YYYY-MM-DD — สิ่งที่ทำ -->

- 2026-06-07 — ตั้งค่า CLAUDE.md สำหรับทีม, เพิ่ม Work Log section, คุยเรื่อง memory system และ token saving
- 2026-06-07 — เพิ่ม `contract.config.php` แยกออกมา เพื่อให้อัปเดต URL ได้สะดวกโดยไม่ต้องแก้หลายที่
- 2026-06-26 — Restyle `Admin/admin.php`/`admin.css` เป็น light theme ตาม labchain.la (เฉพาะหน้า Admin, หน้าอื่นยังเป็น dark-mode ตามเดิม) + เอาไอคอน Font Awesome ออกทั้งหมดจากหน้า Admin
- 2026-06-08 — แก้ bug หลายจุดใน Admin Update Badge: (1) sender ไม่ขึ้นหลัง update → `loadBadges()` fallback อ่าน sender จาก IPFS description, (2) Description field มี "ຜູ້ສົ່ງ:" ปน → strip ออกก่อนแสดง, (3) image หายหลัง update → ใช้ `currentBadgeMeta` cache แทน re-fetch, (4) fields `issuer`/attributes หายหลัง update → spread old metadata เมื่อ re-upload, (5) รูปใหม่ไม่เปลี่ยนหลัง upload → อัปเดต `currentBadgeMeta` หลัง `adminUploadImage()` สำเร็จ


## graphify

This project has a graphify knowledge graph at .graphify/.

Rules:
- For codebase or architecture questions, when `.graphify/graph.json` exists, first run `graphify query "<question>"` (or `graphify path "<A>" "<B>"` / `graphify explain "<concept>"`); these return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output
- If .graphify/wiki/index.md exists, navigate it instead of reading raw files
- If .graphify/graph.json is missing but graphify-out/graph.json exists, run `graphify migrate-state --dry-run` first; if tracked legacy artifacts are reported, ask before using the recommended `git mv -f graphify-out .graphify` and commit message
- If .graphify/needs_update exists or .graphify/branch.json has stale=true, warn before relying on semantic results and run /graphify . --update when appropriate
- Before proposing or committing .graphify artifacts, run `graphify portable-check .graphify`; commit-safe graph artifacts must use repo-relative paths, and never commit .graphify/branch.json, .graphify/worktree.json, .graphify/needs_update, or .graphify/cache/. If a repo already tracks any of them, first add them to .gitignore, then propose `git rm --cached .graphify/branch.json .graphify/worktree.json .graphify/needs_update` and `git rm -r --cached .graphify/cache`; never mutate git state without asking
- Before deep graph traversal, prefer `graphify summary --graph .graphify/graph.json` for compact first-hop orientation
- For review impact on changed files, use `graphify review-delta --graph .graphify/graph.json` instead of generic traversal
- Read `.graphify/GRAPH_REPORT.md` only for broad architecture review or when `query` / `path` / `explain` do not surface enough context
- After modifying code files in this session, run `npx graphify hook-rebuild` to keep the graph current
