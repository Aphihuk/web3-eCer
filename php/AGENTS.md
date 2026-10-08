# AGENTS.md — NFT LAO (`blockchain-nft`)

Lao-first NFT certificate platform on LABChain (chain ID 5222). PHP/Apache serves the UI;
a **separate** Node/Express backend owns the API and MySQL.

Branch `main-nft`, single remote `origin` (github.com/mito-299-gif/blockchain-nft).

## Commands

```bash
docker-compose up --build    # http://localhost:90
docker-compose down
```

Or run PHP natively on Windows (no Apache installed, uses the built-in dev server):

```bash
php -S localhost:80 -t D:\NFT\php      # then open http://localhost/
```

The PHP port is your choice and nothing in the app hardcodes it — no link, redirect
or config points at a specific PHP port. Only the *backend* port is fixed (3200, see
below). Pick 80 for clean URLs or 8000 if 80 is taken; the URLs you visit change with it,
nothing else does.

Both modes work against the same code — nothing needs reconfiguring when you switch.

**Run both servers from your own terminal for anything longer than ~20 minutes.**
Background processes started by an agent session are killed when that session's task
times out, which silently kills `node server.js` and leaves the frontend showing
"Cannot connect to API: Failed to fetch". `restart: always` does not help, because the
containers are fine; it is the native process that died. To detach on Windows:

```bash
cd D:\NFT\backend
start /b node server.js
```

- **There is no build, test, lint, typecheck, or formatter in this repo.** No `package.json`,
  no `composer.json`, no test runner. Don't invent `npm test` / `composer` / `php artisan`.
- The volume is `.:/var/www/html` (live bind mount) — PHP/JS/CSS edits apply on browser
  reload. Only `dockerfile` changes need `--build`.
- Docker Desktop must be running or every `docker` command fails with a named-pipe error.
- **Case gotcha:** `docker-compose.yml` says `dockerfile: Dockerfile`, but the file on disk
  is `dockerfile` (lowercase). Fine on Windows, breaks on Linux/CI.
- `dockerfile` installs only the `curl` extension. (`pdo_mysql` is *not* installed — CLAUDE.md's
  claim that it is, is wrong. It is also unused: no PHP file references PDO or mysqli.)
- **`php -S` has no Apache.** `apache_request_headers()` is undefined under the CLI server, so
  never call it unguarded — read `$_SERVER['HTTP_AUTHORIZATION']` first and guard the Apache
  fallback with `function_exists()`. See `support/tickets_api.php` for the correct pattern.

## Architecture

**PHP never touches MySQL.** Zero PDO/mysqli usage anywhere. All data flows to a Node/Express
backend in a **different repo** (`D:\NFT\backend`) — API changes require editing *that* repo.

The backend's reachable URL depends on **how the backend is run** — this is the single most
error-prone thing in the repo:

| Backend mode | Base URL | Why |
|---|---|---|
| native `node server.js` (current) | `http://localhost:3200` | `server.js:37` hardcodes `app.listen(3200)` |
| `docker compose` (backend repo) | `http://localhost:85` | Node's 3200 is only `expose`d, never published; nginx container `nginx-database_nft` publishes 85 and proxies `/` -> `node-app:3200` |

Prefer the native run — the Docker containers can hold a **stale env** (they were built when
`.env` said `DB_HOST=172.17.0.7` and `CONTRACT_ADDRESS=0x3c9c9CB…`), which yields
`/api/tickets` → 500 and a blockchain listener watching the wrong contract. Natively, dotenv
loads all of `.env` (11 vars) and both problems disappear. If you do use Docker, recreate with
`docker compose up -d --force-recreate` so it picks up the current `.env`.

Smoke-test either mode with `curl http://localhost:<port>/api/me` (expects 401
`{"message":"No token"}`) and `curl http://localhost:<port>/api/tickets` (expects 200 — this one
actually exercises the DB, so it catches the stale-env failure). Backend CORS is `origin: "*"`, so
this repo's port needs no change.

`server.js:29` uses `fs.readdirSync("./router")`, a **relative** path — always `cd` into
`D:\NFT\backend` before starting it, or it throws. `npm start` runs it under nodemon.

**Blockchain is client-side only.** PHP never touches the chain. ethers.js 6.7.0 UMD from cdnjs
via plain `<script src>` tags — no bundler, no npm, no ES modules, everything lands in global scope.

### Config is duplicated in two files — keep them in sync

| File | Exposes | Consumer | Base URL |
|---|---|---|---|
| `config/contract.config.js` | `API_BASE_URL`, contract address, chain ID, Pinata gateway | browser (always on host) | `http://localhost:3200` native / `:85` Docker |
| `config/contract.config.php` | `_API_BASE_URL`, `_API_URL`, `_CONTRACT_ADDRESS`, `_CHAIN_ID`, `_PINATA_GATEWAY` | PHP (container *or* native) | auto-detected, see below |

### The PHP config host is auto-detected — do not hard-code it

`config/contract.config.php` picks host *and* port by sniffing the runtime, so the same file works
whether PHP runs in Docker or natively, and regardless of how the backend is hosted:

```php
$__nftInDocker = file_exists('/.dockerenv') || preg_match('/^[0-9a-f]{12}$/', (string) gethostname()) === 1;
define('_API_BASE_URL', $__nftInDocker ? 'http://host.docker.internal:85' : 'http://localhost:3200');
```

- PHP inside `learnbadge_web` → `host.docker.internal:85`. `localhost` there means the *container
  itself*, so `curl http://localhost:85` from inside returns **Connection refused**.
- PHP native on Windows → `localhost:3200`, because it shares the host network namespace and the
  native backend listens there.

`host.docker.internal` resolves on Docker Desktop (Windows/macOS); on plain Linux it needs
`--add-host=host.docker.internal:host-gateway` in `docker-compose.yml`. The symptom of getting this
wrong is a PHP `Warning: file_get_contents(... Connection refused)` plus a misleading `HTTP 200`
with a Lao "cannot connect" body — `backend_call()` exits 503 but the mirrored status can still read
as success upstream.

The browser file has no such auto-detection — browser JS always runs on the host, so it must track
whichever backend mode you chose (currently `3200`). It is the one value you edit by hand.

Change one → change the other for contract address, chain ID, and gateway. The API base URL is the
one exception: it is per-runtime, and the PHP side auto-detects. Include the PHP mirror rather than
hard-coding values.

### Script load order matters

`contract.config.js` must load **before** any script that reads its globals. In
`controllers/learnnbadge-ui.php` the order is ethers → `contract.config.js` → `index_LABChain.js`.
Plain sequential script tags, no `defer`, no `type="module"`.

### Duplicate-globals trap

`script/index_LABChain.js` (88 KB, the mint UI) is self-contained and carries **its own copies** of
`ipfsToHttp` (:21), `shortenAddr` (:1378), `connectWallet` (:241), `loadAuthToken` (:68).
`script/file_NFT/` carries separate copies of the same names — `LAB_ABI.js` (`ipfsToHttp` :29,
`shortenAddr` :24) and `connect_Wallet.js` (`connectWallet` :1).

The two bundles load on **disjoint pages** (`learnnbadge-ui.php` → `index_LABChain.js` only;
`NFT.php` → `file_NFT/*` only). Never add both to one page — duplicate global function declarations
resolve last-wins, silently. And a fix applied to one copy does not exist in the other.

### PHP → backend proxy pattern

Copy `support/tickets_api.php`: a `backend_call($method, $path, $body)` helper wrapping
`file_get_contents` + `stream_context_create`, forwarding `Authorization: Bearer` (read from
`HTTP_AUTHORIZATION`, falling back to `apache_request_headers()`), and mirroring the upstream
status code. Add new server-side calls in this shape.

## Auth — two independent layers

- `loadAuthToken()` reads `localStorage.authToken` with a cookie fallback. That is the auth read path.
- The Admin panel needs **both** a JWT login **and** MetaMask connected as `contract.owner()`.
  A valid JWT alone is not admin, and there is no role field in the database.
- The tickets API is currently **unauthenticated server-side** — anyone can list/reply/delete
  tickets by hitting the endpoint directly. Do not assume ticket mutations are protected.

## Conventions

- **All user-facing strings are Lao**, including error messages in PHP JSON responses.
  English UI text breaks convention.
- `Admin/admin.{php,css,js}` intentionally uses a **light** theme; every other page is dark-mode.
- No Font Awesome in the Admin section — plain text labels by explicit request.
- `lib/PHPMailer/` is vendored into the repo (no composer, no autoloader). Do not expect composer
  packages to resolve.

## Repo hygiene

- `.gitignore` is **empty**. Generated graphify artifacts (`graphify-out/`, including
  `graphify-out/cache/`) and the vendored `.claude/skills/impeccable/` tree are all tracked, so
  ordinary commits carry thousands of lines of regenerated graph churn. Expect it in diffs.
- The graphify knowledge graph is at `graphify-out/`. (`CLAUDE.md` claims `.graphify/` — that
  directory does not exist.) Prefer `graphify query "<question>"` over grepping for codebase
  questions.

## Verification

No automated tests exist, so browser verification is the only real check. Load
`http://localhost:90/<page>` with playwright before claiming a UI change works. The Admin page is
wallet-gated — MetaMask cannot be driven headlessly, so verify the non-wallet sections in the
browser and review the wallet-gated branches by reading the code.

## Project Rules

### Anti-Hallucination
- Never guess. If unsure about any fact, API, or behavior, research first with
  wigolo (web search/fetch) before answering.
- Verify frontend/UI claims with playwright against the real page before
  saying a change works.
- Admit uncertainty explicitly instead of fabricating answers or file contents.

### Code Style
- No emoji anywhere in code: identifiers, strings, comments, commit messages.
  The code must not look AI-generated.

### Language
- Respond only in Thai or English.
- Never use Chinese characters, Pinyin, or Chinese-English mixed phrases —
  not even in reasoning or thinking.

### Debugging
- When code has an error or must be fixed, use the Stack Overflow MCP first
  to find known solutions.
- If the Stack Overflow MCP daily quota (100 calls/day) is exhausted, or the
  MCP is unavailable, fall back to wigolo: first search with
  `include_domains: ["stackoverflow.com"]` to target Stack Overflow itself,
  then search the general web if needed.