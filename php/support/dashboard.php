<?php require_once __DIR__ . '/../config/contract.config.php'; ?>
<!DOCTYPE html>
<html lang="lo">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Dashboard — NFT LAO</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #16161f;
      --surface2: #1e1e2e;
      --border: rgba(255, 255, 255, 0.07);
      --text: #e2e8f0;
      --muted: #64748b;
      --accent: #00aaff;
      --violet: #7c3aed;
      --teal: #06d6a0;
      --red: #ef4444;
      --yellow: #f59e0b;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html,
    body {
      height: 100%;
      font-family: 'Outfit', 'Noto Sans Lao', sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    /* ── Login overlay ──────────────────────────────── */
    #loginOverlay {
      position: fixed;
      inset: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      margin: 1rem;
    }

    .login-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .login-logo svg {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .login-logo-text {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .login-logo-text .lab {
      color: var(--accent);
    }

    .login-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.35rem;
    }

    .login-sub {
      font-size: 0.83rem;
      color: var(--muted);
      margin-bottom: 1.75rem;
    }

    .login-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: .05em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.4rem;
    }

    .login-input {
      width: 100%;
      padding: 0.65rem 0.95rem;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border .2s;
      margin-bottom: 1rem;
    }

    .login-input:focus {
      border-color: rgba(0, 170, 255, .45);
    }

    .login-btn {
      width: 100%;
      padding: 0.72rem;
      border-radius: 11px;
      border: 1px solid rgba(0, 170, 255, .3);
      background: rgba(0, 170, 255, .12);
      color: var(--accent);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background .2s, border .2s;
    }

    .login-btn:hover {
      background: rgba(0, 170, 255, .2);
      border-color: rgba(0, 170, 255, .5);
    }

    .login-btn:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .login-msg {
      font-size: 0.82rem;
      margin-top: 0.75rem;
      padding: 0.45rem 0.8rem;
      border-radius: 8px;
      display: none;
    }

    .login-msg.err {
      background: rgba(239, 68, 68, .1);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, .25);
    }

    .login-msg.ok {
      background: rgba(6, 214, 160, .1);
      color: var(--teal);
      border: 1px solid rgba(6, 214, 160, .25);
    }

    /* ── App shell ──────────────────────────────────── */
    #app {
      display: none;
      height: 100vh;
      overflow: hidden;
    }

    #app.show {
      display: flex;
    }

    /* ── Sidebar ───────────────────────────────────── */
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      overflow-y: auto;
    }

    .sb-logo {
      padding: 0 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .sb-logo-title {
      font-size: 1rem;
      font-weight: 800;
      color: var(--accent);
    }

    .sb-logo-sub {
      font-size: 0.72rem;
      color: var(--muted);
      margin-top: 2px;
    }

    .sb-nav-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--muted);
      padding: 0.75rem 1.25rem 0.3rem;
    }

    .sb-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 1.25rem;
      cursor: pointer;
      font-size: 0.88rem;
      color: var(--muted);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      border-radius: 0;
      transition: color .15s, background .15s;
    }

    .sb-item:hover {
      color: var(--text);
      background: rgba(255, 255, 255, .04);
    }

    .sb-item.active {
      color: var(--text);
      background: rgba(0, 170, 255, .08);
    }

    .sb-item i {
      width: 16px;
      text-align: center;
    }

    .sb-badge {
      margin-left: auto;
      background: var(--red);
      color: #fff;
      border-radius: 99px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }

    .sb-user {
      margin-top: auto;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border);
    }

    .sb-user-name {
      font-size: 0.83rem;
      font-weight: 600;
    }

    .sb-user-role {
      font-size: 0.72rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    .sb-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: var(--muted);
      cursor: pointer;
      background: none;
      border: none;
      font-family: 'Noto Sans Lao';
      padding: 0;
      transition: color .15s;
    }

    .sb-logout:hover {
      color: var(--red);
    }

    /* ── Main content ───────────────────────────────── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.2rem 2rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }

    .page-title {
      font-size: 1.15rem;
      font-weight: 700;
    }

    .page-header-actions {
      display: flex;
      gap: 0.6rem;
    }

    .btn-sm {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: .15s;
      border: 1px solid transparent;
    }

    .btn-ghost {
      border-color: var(--border);
      background: none;
      color: var(--muted);
    }

    .btn-ghost:hover {
      color: var(--text);
      border-color: rgba(255, 255, 255, .2);
    }

    /* ── Stats ──────────────────────────────────────── */
    .stats-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem 1.4rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--muted);
      font-weight: 600;
      letter-spacing: .05em;
      text-transform: uppercase;
    }

    .stat-val {
      font-size: 1.9rem;
      font-weight: 800;
      margin-top: 0.2rem;
      line-height: 1;
    }

    .stat-card.s-total .stat-val {
      color: var(--accent);
    }

    .stat-card.s-new .stat-val {
      color: var(--yellow);
    }

    .stat-card.s-replied .stat-val {
      color: var(--teal);
    }

    /* ── Filter tabs ────────────────────────────────── */
    .filter-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .tk-filter {
      padding: 0.42rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: none;
      color: var(--muted);
      font-family: inherit;
      transition: .15s;
    }

    .tk-filter:hover {
      color: var(--text);
    }

    .tk-filter.active {
      background: rgba(0, 170, 255, .12);
      border-color: rgba(0, 170, 255, .35);
      color: var(--accent);
    }

    /* ── Ticket list + detail ───────────────────────── */
    .tk-panel {
      display: flex;
      gap: 1rem;
      height: calc(100vh - 280px);
    }

    .tk-list-wrap {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow-y: auto;
    }

    .tk-row {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 0.9rem 1.1rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background .12s;
    }

    .tk-row:last-child {
      border-bottom: none;
    }

    .tk-row:hover {
      background: rgba(255, 255, 255, .03);
    }

    .tk-row.active {
      background: rgba(0, 170, 255, .06);
    }

    .tk-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 5px;
    }

    .tk-dot.new {
      background: var(--yellow);
      box-shadow: 0 0 6px var(--yellow);
    }

    .tk-dot.read {
      background: var(--muted);
    }

    .tk-dot.replied {
      background: var(--teal);
    }

    .tk-meta {
      flex: 1;
      min-width: 0;
    }

    .tk-name {
      font-size: 0.88rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tk-info {
      font-size: 0.75rem;
      color: var(--muted);
      margin: 2px 0;
    }

    .tk-msg {
      font-size: 0.78rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tk-time {
      font-size: 0.7rem;
      color: var(--muted);
      flex-shrink: 0;
    }

    .tk-empty {
      padding: 3rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }

    /* ── Ticket detail panel ────────────────────────── */
    .tk-detail {
      width: 360px;
      flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .tk-detail.open {
      display: flex;
    }

    .tk-detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .tk-detail-title {
      font-size: 0.9rem;
      font-weight: 700;
    }

    .tk-detail-actions {
      display: flex;
      gap: 0.4rem;
    }

    .tk-btn {
      width: 30px;
      height: 30px;
      border-radius: 7px;
      border: 1px solid var(--border);
      background: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: .15s;
    }

    .tk-btn:hover {
      color: var(--text);
      border-color: rgba(255, 255, 255, .25);
    }

    .tk-btn.danger:hover {
      color: var(--red);
      border-color: rgba(239, 68, 68, .4);
    }

    .tk-detail-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.1rem;
    }

    .tk-detail-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.55rem;
    }

    .tk-detail-key {
      font-size: 0.75rem;
      color: var(--muted);
      font-weight: 600;
      width: 70px;
      flex-shrink: 0;
      padding-top: 1px;
    }

    .tk-detail-val {
      font-size: 0.82rem;
      flex: 1;
      word-break: break-word;
    }

    .tk-msg-body {
      background: var(--surface2);
      border-radius: 10px;
      padding: 0.8rem 1rem;
      font-size: 0.83rem;
      line-height: 1.7;
      white-space: pre-wrap;
      margin: 0.75rem 0;
      border: 1px solid var(--border);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 9px;
      border-radius: 99px;
    }

    .chip-yellow {
      background: rgba(245, 158, 11, .12);
      color: var(--yellow);
      border: 1px solid rgba(245, 158, 11, .25);
    }

    .chip-blue {
      background: rgba(0, 170, 255, .1);
      color: var(--accent);
      border: 1px solid rgba(0, 170, 255, .25);
    }

    .chip-green {
      background: rgba(6, 214, 160, .1);
      color: var(--teal);
      border: 1px solid rgba(6, 214, 160, .25);
    }

    .tk-reply-prev {
      background: rgba(6, 214, 160, .06);
      border-left: 3px solid var(--teal);
      border-radius: 0 8px 8px 0;
      padding: 0.75rem 0.9rem;
      font-size: 0.8rem;
      line-height: 1.7;
      white-space: pre-wrap;
      margin-bottom: 0.75rem;
      color: rgba(226, 232, 240, .8);
    }

    .reply-section {
      border-top: 1px solid var(--border);
      padding: 1rem 1.1rem;
      flex-shrink: 0;
    }

    .reply-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: .05em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .reply-textarea {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-size: 0.83rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
      outline: none;
      transition: border .2s;
    }

    .reply-textarea:focus {
      border-color: rgba(0, 170, 255, .4);
    }

    .reply-btn {
      margin-top: 0.6rem;
      width: 100%;
      padding: 0.6rem;
      border-radius: 9px;
      border: 1px solid rgba(0, 170, 255, .3);
      background: rgba(0, 170, 255, .1);
      color: var(--accent);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: .15s;
    }

    .reply-btn:hover {
      background: rgba(0, 170, 255, .2);
    }

    .reply-btn:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    .reply-status {
      font-size: 0.78rem;
      margin-top: 0.4rem;
      padding: 0.35rem 0.7rem;
      border-radius: 7px;
      display: none;
    }

    .reply-status.ok {
      display: block;
      background: rgba(6, 214, 160, .1);
      color: var(--teal);
    }

    .reply-status.err {
      display: block;
      background: rgba(239, 68, 68, .1);
      color: #f87171;
    }

    /* ── Toast ──────────────────────────────────────── */
    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      padding: 0.65rem 1.2rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(6, 214, 160, .15);
      color: var(--teal);
      border: 1px solid rgba(6, 214, 160, .3);
      opacity: 0;
      transform: translateY(8px);
      transition: .3s;
      pointer-events: none;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    .toast.err {
      background: rgba(239, 68, 68, .15);
      color: #f87171;
      border-color: rgba(239, 68, 68, .3);
    }

    /* ── Section switching ──────────────────────────── */
    .section {
      display: none;
      flex: 1;
      overflow: hidden;
      flex-direction: column;
    }

    .section.active {
      display: flex;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem 2rem;
    }

    /* ── User table ─────────────────────────────────── */
    .user-search {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 1.25rem;
    }

    .user-search input {
      flex: 1;
      padding: 0.55rem 0.9rem;
      border-radius: 9px;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-size: 0.87rem;
      font-family: inherit;
      outline: none;
      transition: border .2s;
    }

    .user-search input:focus {
      border-color: rgba(0, 170, 255, .4);
    }

    .u-table-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
    }

    .u-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.83rem;
    }

    .u-table thead tr {
      background: var(--surface2);
    }

    .u-table th {
      padding: 0.7rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }

    .u-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    .u-table tr:last-child td {
      border-bottom: none;
    }

    .u-table tr:hover td {
      background: rgba(255, 255, 255, .025);
    }

    .u-addr {
      font-family: 'Space Mono', monospace;
      font-size: 0.72rem;
      color: var(--muted);
      cursor: pointer;
    }

    .u-addr:hover {
      color: var(--accent);
    }

    .badge-v {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 99px;
    }

    .v-ok {
      background: rgba(6, 214, 160, .1);
      color: var(--teal);
      border: 1px solid rgba(6, 214, 160, .25);
    }

    .v-no {
      background: rgba(239, 68, 68, .08);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, .2);
    }

    .v-sup {
      background: rgba(0, 170, 255, .1);
      color: var(--accent);
      border: 1px solid rgba(0, 170, 255, .25);
    }

    .u-empty {
      padding: 3rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 60px;
      }

      .sb-logo-title,
      .sb-logo-sub,
      .sb-nav-label,
      .sb-item span,
      .sb-user-name,
      .sb-user-role {
        display: none;
      }

      .sb-item {
        justify-content: center;
        padding: 0.7rem;
      }

      .sb-item i {
        width: auto;
      }

      .sb-badge {
        display: none;
      }

      .content {
        padding: 1rem;
      }

      .stats-row {
        flex-wrap: wrap;
      }

      .tk-panel {
        flex-direction: column;
        height: auto;
      }

      .tk-detail {
        width: 100%;
      }
    }
  </style>
</head>

<body>

  <!-- ═══ Login Overlay ═══════════════════════════════════ -->
  <div id="loginOverlay">
    <div class="login-box">
      <div class="login-logo">
        <svg viewBox="0 0 28 28" fill="none">
          <circle cx="6" cy="6" r="3" fill="#00aaff" />
          <circle cx="14" cy="6" r="3" fill="#00aaff" opacity=".6" />
          <circle cx="22" cy="6" r="3" fill="#00aaff" opacity=".3" />
          <circle cx="6" cy="14" r="3" fill="#00aaff" opacity=".6" />
          <circle cx="14" cy="14" r="4" fill="#00aaff" />
          <circle cx="22" cy="14" r="3" fill="#00aaff" opacity=".6" />
          <circle cx="6" cy="22" r="3" fill="#00aaff" opacity=".3" />
          <circle cx="14" cy="22" r="3" fill="#00aaff" opacity=".6" />
          <circle cx="22" cy="22" r="3" fill="#00aaff" />
        </svg>
        <div class="login-logo-text"><span class="lab">NFT LAO</span> ຈຳກັດ</div>
      </div>
      <div class="login-title">Support Dashboard</div>
      <div class="login-sub">ສຳລັບທີມ Support ເທົ່ານັ້ນ — ເຂົ້າສູ່ລະບົບດ້ວຍ Email ຂອງທ່ານ</div>
      <label class="login-label" for="loginEmail">Email</label>
      <input class="login-input" type="email" id="loginEmail" placeholder="support@example.com" autocomplete="email">
      <label class="login-label" for="loginPassword">Password</label>
      <input class="login-input" type="password" id="loginPassword" placeholder="••••••••"
        autocomplete="current-password">
      <button class="login-btn" id="loginBtn" onclick="doLogin()">
        <i class="fas fa-right-to-bracket" style="margin-right:6px;"></i>ເຂົ້າສູ່ລະບົບ
      </button>
      <div class="login-msg" id="loginMsg"></div>
    </div>
  </div>

  <!-- ═══ App ══════════════════════════════════════════════ -->
  <div id="app">
    <nav class="sidebar">
      <div class="sb-logo">
        <div class="sb-logo-title"><i class="fas fa-headset" style="margin-right:6px;"></i>Support</div>
        <div class="sb-logo-sub">NFT LAO</div>
      </div>
      <div class="sb-nav-label">ຈັດການ</div>
      <button class="sb-item active" id="nav-tickets" onclick="showSection('tickets',this)">
        <i class="fas fa-ticket"></i> <span>Tickets</span>
        <span class="sb-badge" id="sbNewBadge" style="display:none;"></span>
      </button>
      <button class="sb-item" id="nav-users" onclick="showSection('users',this)">
        <i class="fas fa-users"></i> <span>Users</span>
      </button>
      <div class="sb-user">
        <div class="sb-user-name" id="sbUserName">—</div>
        <div class="sb-user-role" id="sbUserRole">support</div>
        <button class="sb-logout" onclick="doLogout()">
          <i class="fas fa-right-from-bracket"></i> <span>ອອກຈາກລະບົບ</span>
        </button>
      </div>
    </nav>

    <main class="main">
      <div class="page-header">
        <div class="page-title" id="pageTitle">Support Tickets</div>
        <div class="page-header-actions" id="headerActions">
          <button class="btn-sm btn-ghost" onclick="loadTickets()">
            <i class="fas fa-rotate-right"></i> Refresh
          </button>
        </div>
      </div>

      <div class="section active" id="contentTickets">
        <div class="content">
          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-card s-total">
              <div class="stat-label">ທັງໝົດ</div>
              <div class="stat-val" id="statTotal">—</div>
            </div>
            <div class="stat-card s-new">
              <div class="stat-label">ໃໝ່</div>
              <div class="stat-val" id="statNew">—</div>
            </div>
            <div class="stat-card s-replied">
              <div class="stat-label">ຕອບແລ້ວ</div>
              <div class="stat-val" id="statReplied">—</div>
            </div>
          </div>

          <!-- Filter -->
          <div class="filter-row">
            <button class="tk-filter active" onclick="filterTickets('all',this)">ທັງໝົດ</button>
            <button class="tk-filter" onclick="filterTickets('new',this)"> ໃໝ່</button>
            <button class="tk-filter" onclick="filterTickets('read',this)"> ອ່ານແລ້ວ</button>
            <button class="tk-filter" onclick="filterTickets('replied',this)"> ຕອບແລ້ວ</button>
          </div>

          <!-- Ticket list + detail side-by-side -->
          <div class="tk-panel">
            <div class="tk-list-wrap" id="tkList">
              <div class="tk-empty"><i class="fas fa-spinner fa-spin"></i> ກຳລັງໂຫຼດ...</div>
            </div>

            <!-- Detail panel -->
            <div class="tk-detail" id="tkDetail">
              <div class="tk-detail-header">
                <div class="tk-detail-title">ລາຍລະອຽດ Ticket</div>
                <div class="tk-detail-actions">
                  <button class="tk-btn danger" title="ລຶບ" onclick="deleteTicket()"><i
                      class="fas fa-trash-can"></i></button>
                  <button class="tk-btn" title="ປິດ" onclick="closeDetail()"><i class="fas fa-xmark"></i></button>
                </div>
              </div>
              <div class="tk-detail-body" id="tkDetailBody"></div>
              <div class="reply-section" id="tkReplySection">
                <div class="reply-label">ຕອບກັບ</div>
                <textarea class="reply-textarea" id="tkReplyText" rows="4" placeholder="ພິມຄຳຕອບ..."></textarea>
                <button class="reply-btn" id="tkReplyBtn" onclick="sendReply()">
                  <i class="fas fa-paper-plane" style="margin-right:5px;"></i>ສົ່ງ Reply
                </button>
                <div class="reply-status" id="tkReplyStatus"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Users section ──────────────────────────────── -->
      <div class="section" id="contentUsers">
        <div class="content">
          <div class="user-search">
            <input type="text" id="userSearchInput" placeholder="ຄົ້ນຫາ ຊື່, Email ຫຼື Wallet..."
              oninput="filterUsers()">
            <button class="btn-sm btn-ghost" onclick="loadUsers()"><i class="fas fa-rotate-right"></i> Refresh</button>
          </div>
          <div class="u-table-wrap">
            <table class="u-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>ຊື່ / Email</th>
                  <th>Wallet</th>
                  <th>ຢັ້ງຢືນ</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody id="userTableBody">
                <tr>
                  <td colspan="5" class="u-empty"><i class="fas fa-spinner fa-spin"></i> ກຳລັງໂຫຼດ...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div id="userCount" style="font-size:0.75rem;color:var(--muted);margin-top:0.75rem;text-align:right;"></div>
        </div>
      </div>

    </main>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const API = '<?= _API_URL ?>';
    const SUPPORT_API = `${API}/support`;

    let _token = null;
    let _user = null;
    let _all = [];
    let _filter = 'all';
    let _activeId = null;

    // ── Auth ───────────────────────────────────────────────
    function authH() {
      return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_token}` };
    }

    async function doLogin() {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const msg = document.getElementById('loginMsg');
      const btn = document.getElementById('loginBtn');

      if (!email || !password) { showMsg(msg, 'err', 'ກະລຸນາໃສ່ Email ແລະ Password'); return; }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>ກຳລັງເຂົ້າສູ່ລະບົບ...';

      try {
        const res = await fetch(`${API}/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message || 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ');

        // Decode role from JWT
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        if (!['support', 'admin'].includes(payload.role)) {
          throw new Error('ບັນຊີນີ້ບໍ່ມີສິດ Support — ຕິດຕໍ່ Admin');
        }

        _token = data.token;
        _user = payload;
        sessionStorage.setItem('supportToken', _token);

        showMsg(msg, 'ok', ` ສຳເລັດ — ສະບາຍດີ ${payload.name}`);
        setTimeout(enterDashboard, 600);

      } catch (e) {
        showMsg(msg, 'err', e.message);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket" style="margin-right:6px;"></i>ເຂົ້າສູ່ລະບົບ';
      }
    }

    function enterDashboard() {
      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('app').classList.add('show');
      document.getElementById('sbUserName').textContent = _user.name || _user.email;
      document.getElementById('sbUserRole').textContent = _user.role;
      loadTickets();
    }

    async function doLogout() {
      const result = await Swal.fire({
        title: 'ອອກຈາກລະບົບ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ອອກຈາກລະບົບ',
        cancelButtonText: 'ຍົກເລີກ',
        reverseButtons: true,
        background: 'var(--surface)',
        color: 'var(--text)',
        confirmButtonColor: 'var(--accent)',
        cancelButtonColor: 'var(--surface2)',
      });
      if (!result.isConfirmed) return;
      sessionStorage.removeItem('supportToken');
      localStorage.removeItem('authToken');
      location.href = '../controllers/learnnbadge-ui.php';
    }

    // ── Tickets ────────────────────────────────────────────
    async function loadTickets() {
      document.getElementById('tkList').innerHTML = '<div class="tk-empty"><i class="fas fa-spinner fa-spin"></i> ກຳລັງໂຫຼດ...</div>';
      try {
        const res = await fetch(`${SUPPORT_API}/tickets`, { headers: authH() });
        if (res.status === 401 || res.status === 403) { doLogout(); return; }
        const data = await res.json();
        if (!data.ok) throw new Error(data.msg);

        _all = data.tickets || [];
        const s = data.stats || {};
        document.getElementById('statTotal').textContent = s.total ?? 0;
        document.getElementById('statNew').textContent = s.new ?? 0;
        document.getElementById('statReplied').textContent = s.replied ?? 0;

        const badge = document.getElementById('sbNewBadge');
        if ((s.new ?? 0) > 0) { badge.textContent = s.new; badge.style.display = 'inline-block'; }
        else { badge.style.display = 'none'; }

        renderList();
      } catch (e) {
        document.getElementById('tkList').innerHTML = `<div class="tk-empty" style="color:#f87171;">ໂຫຼດ Tickets ບໍ່ສຳເລັດ: ${e.message}</div>`;
      }
    }

    function renderList() {
      const list = _filter === 'all' ? _all : _all.filter(t => t.status === _filter);
      if (!list.length) {
        document.getElementById('tkList').innerHTML = '<div class="tk-empty">ບໍ່ມີ Ticket ໃນໝວດນີ້</div>';
        return;
      }
      const icons = { wallet: '', mint: '🏅', transfer: '', contract: '', account: '', other: '' };
      document.getElementById('tkList').innerHTML = list.map(t => {
        const d = new Date(t.created_at * 1000);
        const time = d.toLocaleDateString('en-GB');
        const prev = (t.msg || '').slice(0, 70) + ((t.msg || '').length > 70 ? '…' : '');
        return `<div class="tk-row${_activeId === t.id ? ' active' : ''}" onclick="openTicket('${t.id}')">
      <div class="tk-dot ${t.status}"></div>
      <div class="tk-meta">
        <div class="tk-name">${esc(t.name)} <span style="color:var(--muted);font-weight:400;font-size:0.73rem;">&lt;${esc(t.email)}&gt;</span></div>
        <div class="tk-info">${icons[t.type] || ''} ${esc(t.type_label || t.type)}</div>
        <div class="tk-msg">${esc(prev)}</div>
      </div>
      <div class="tk-time">${time}</div>
    </div>`;
      }).join('');
    }

    function filterTickets(f, btn) {
      _filter = f;
      document.querySelectorAll('.tk-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList();
      closeDetail();
    }

    async function openTicket(id) {
      const t = _all.find(x => x.id === id);
      if (!t) return;
      _activeId = id;
      renderList();

      // mark read
      if (t.status === 'new') {
        await fetch(`${SUPPORT_API}/tickets/${id}/read`, { method: 'PATCH', headers: authH() });
        t.status = 'read';
        renderList();
        const newCnt = _all.filter(x => x.status === 'new').length;
        document.getElementById('statNew').textContent = newCnt;
        const badge = document.getElementById('sbNewBadge');
        if (newCnt > 0) { badge.textContent = newCnt; badge.style.display = 'inline-block'; }
        else { badge.style.display = 'none'; }
      }

      const labels = {
        wallet: 'Wallet / MetaMask', mint: 'ການ Mint NFT', transfer: 'ການໂອນ NFT',
        contract: 'Contract Address', account: 'ບັນຊີ / ລະຫັດ', other: 'ອື່ນໆ'
      };
      const chipMap = {
        new: '<span class="chip chip-yellow"> ໃໝ່</span>',
        read: '<span class="chip" style="background:rgba(100,116,139,.1);color:var(--muted);border:1px solid rgba(100,116,139,.25);"> ອ່ານແລ້ວ</span>',
        replied: '<span class="chip chip-green"> ຕອບແລ້ວ</span>',
      };
      const d = new Date(t.created_at * 1000);

      document.getElementById('tkDetailBody').innerHTML = `
    <div class="tk-detail-row"><span class="tk-detail-key">ສະຖານະ</span><span class="tk-detail-val">${chipMap[t.status] || t.status}</span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">ຊື່</span><span class="tk-detail-val">${esc(t.name)}</span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">Email</span><span class="tk-detail-val"><a href="mailto:${esc(t.email)}" style="color:var(--accent);">${esc(t.email)}</a></span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">ປະເພດ</span><span class="tk-detail-val">${esc(labels[t.type] || t.type_label || t.type)}</span></div>
    ${t.wallet ? `<div class="tk-detail-row"><span class="tk-detail-key">Wallet</span><span class="tk-detail-val" style="font-family:'Space Mono',monospace;font-size:0.72rem;">${esc(t.wallet)}</span></div>` : ''}
    <div class="tk-detail-row"><span class="tk-detail-key">ວັນທີ</span><span class="tk-detail-val">${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div class="tk-msg-body">${esc(t.msg)}</div>
    ${t.status === 'replied' && t.reply ? `
      <div style="font-size:0.75rem;color:var(--teal);font-weight:600;margin-bottom:5px;"><i class="fas fa-reply"></i> ຄຳຕອບທີ່ໄດ້ສົ່ງ:</div>
      <div class="tk-reply-prev">${esc(t.reply)}</div>` : ''}`;

      document.getElementById('tkReplySection').style.display = t.status === 'replied' ? 'none' : 'block';
      document.getElementById('tkReplyText').value = '';
      document.getElementById('tkReplyStatus').className = 'reply-status';
      document.getElementById('tkDetail').classList.add('open');
    }

    function closeDetail() {
      _activeId = null;
      renderList();
      document.getElementById('tkDetail').classList.remove('open');
    }

    async function deleteTicket() {
      if (!_activeId) return;
      if (!confirm('ຢືນຢັນລຶບ Ticket ນີ້?')) return;
      const res = await fetch(`${SUPPORT_API}/tickets/${_activeId}`, { method: 'DELETE', headers: authH() });
      const data = await res.json();
      if (data.ok) {
        _all = _all.filter(t => t.id !== _activeId);
        const s = { total: _all.length, new: _all.filter(t => t.status === 'new').length, replied: _all.filter(t => t.status === 'replied').length };
        document.getElementById('statTotal').textContent = s.total;
        document.getElementById('statNew').textContent = s.new;
        document.getElementById('statReplied').textContent = s.replied;
        closeDetail();
        renderList();
        toast('ລຶບ Ticket ສຳເລັດ');
      } else { toast(data.msg || 'ລຶບບໍ່ສຳເລັດ', true); }
    }

    async function sendReply() {
      if (!_activeId) return;
      const reply = document.getElementById('tkReplyText').value.trim();
      if (!reply) { setReplyStatus('err', 'ໃສ່ຂໍ້ຄວາມ Reply ກ່ອນ'); return; }

      const btn = document.getElementById('tkReplyBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>ກຳລັງສົ່ງ...';
      setReplyStatus('', '');

      try {
        const res = await fetch(`${SUPPORT_API}/tickets/${_activeId}/reply`, {
          method: 'POST', headers: authH(), body: JSON.stringify({ reply })
        });
        const data = await res.json();
        if (data.ok) {
          setReplyStatus('ok', ' ສົ່ງ Reply ສຳເລັດ');
          toast('Reply ສົ່ງໄປຫາ User ແລ້ວ ');
          const t = _all.find(x => x.id === _activeId);
          if (t) { t.status = 'replied'; t.reply = reply; }
          renderList();
          setTimeout(() => openTicket(_activeId), 400);
          document.getElementById('statReplied').textContent = _all.filter(t => t.status === 'replied').length;
        } else {
          setReplyStatus('err', data.msg || 'ສົ່ງ Reply ບໍ່ສຳເລັດ');
        }
      } catch (e) {
        setReplyStatus('err', 'ເຊື່ອມຕໍ່ Server ບໍ່ໄດ້');
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:5px;"></i>ສົ່ງ Reply';
    }

    // ── Section switching ──────────────────────────────────
    const _sectionTitles = { tickets: 'Support Tickets', users: 'Users (Read-only)' };
    const _sectionRefresh = {
      tickets: `<button class="btn-sm btn-ghost" onclick="loadTickets()"><i class="fas fa-rotate-right"></i> Refresh</button>`,
      users: `<button class="btn-sm btn-ghost" onclick="loadUsers()"><i class="fas fa-rotate-right"></i> Refresh</button>`,
    };
    let _currentSection = 'tickets';

    function showSection(name, btn) {
      _currentSection = name;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('content' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
      document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      document.getElementById('pageTitle').textContent = _sectionTitles[name] || name;
      document.getElementById('headerActions').innerHTML = _sectionRefresh[name] || '';
      if (name === 'users') loadUsers();
    }

    // ── Users (read-only) ──────────────────────────────────
    let _usersAll = [];

    async function loadUsers() {
      const tbody = document.getElementById('userTableBody');
      tbody.innerHTML = '<tr><td colspan="5" class="u-empty"><i class="fas fa-spinner fa-spin"></i> ກຳລັງໂຫຼດ...</td></tr>';
      try {
        const res = await fetch(`${API}/admin/users`, { headers: authH() });
        if (res.status === 401 || res.status === 403) { doLogout(); return; }
        const data = await res.json();
        _usersAll = data.users || [];
        renderUsers(_usersAll);
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="u-empty" style="color:#f87171;">ໂຫຼດບໍ່ສຳເລັດ: ${esc(e.message)}</td></tr>`;
      }
    }

    function filterUsers() {
      const q = document.getElementById('userSearchInput').value.toLowerCase().trim();
      const filtered = q ? _usersAll.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.walletAddress || '').toLowerCase().includes(q)
      ) : _usersAll;
      renderUsers(filtered);
    }

    function renderUsers(list) {
      const tbody = document.getElementById('userTableBody');
      document.getElementById('userCount').textContent = list.length ? `ທັງໝົດ ${list.length} User` : '';
      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="u-empty">ບໍ່ພົບ User</td></tr>';
        return;
      }
      const roleChip = {
        admin: `<span class="badge-v v-no">admin</span>`,
        support: `<span class="badge-v v-sup">support</span>`,
        user: `<span class="badge-v" style="background:rgba(100,116,139,.1);color:var(--muted);border:1px solid rgba(100,116,139,.2);">user</span>`,
      };
      tbody.innerHTML = list.map(u => {
        const wallet = u.walletAddress || '';
        const short = wallet ? wallet.slice(0, 6) + '…' + wallet.slice(-4) : '—';
        return `<tr>
      <td style="color:var(--muted);font-size:0.78rem;">#${u.ID}</td>
      <td>
        <div style="font-weight:600;font-size:0.85rem;">${esc(u.name || '—')}</div>
        <div style="font-size:0.74rem;color:var(--muted);">${esc(u.email)}</div>
      </td>
      <td>
        ${wallet
            ? `<span class="u-addr" title="${esc(wallet)}" onclick="copyAddr('${esc(wallet)}',this)">${short}</span>`
            : '<span style="color:var(--muted);font-size:0.75rem;">—</span>'}
      </td>
      <td>${u.verified ? '<span class="badge-v v-ok"> ຢັ້ງຢືນ</span>' : '<span class="badge-v v-no"> ຍັງບໍ່</span>'}</td>
      <td>${roleChip[u.role] || roleChip.user}</td>
    </tr>`;
      }).join('');
    }

    function copyAddr(addr, el) {
      navigator.clipboard.writeText(addr).then(() => {
        const orig = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(() => { el.textContent = orig; }, 1200);
      });
    }

    function esc(s) {
      return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toast(msg, isErr = false) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast' + (isErr ? ' err' : '');
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3200);
    }

    function setReplyStatus(type, msg) {
      const el = document.getElementById('tkReplyStatus');
      el.className = 'reply-status' + (type ? ' ' + type : '');
      el.textContent = msg;
    }

    function showMsg(el, type, msg) {
      el.className = 'login-msg ' + type;
      el.textContent = msg;
      el.style.display = 'block';
    }

    // ── Keyboard shortcuts ─────────────────────────────────
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDetail();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && _activeId) sendReply();
    });

    // ── Enter key on login ─────────────────────────────────
    document.getElementById('loginPassword').addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });

    // ── Auto-login — ใช้ session ของหน้านี้ ถ้าไม่มีลอง token หลักของเว็บ (จาก login.php) ──
    (function init() {
      const saved = sessionStorage.getItem('supportToken') || localStorage.getItem('authToken');
      if (!saved) return;
      try {
        const payload = JSON.parse(atob(saved.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) { sessionStorage.removeItem('supportToken'); return; }
        if (!['support', 'admin'].includes(payload.role)) { sessionStorage.removeItem('supportToken'); return; }
        _token = saved;
        _user = payload;
        sessionStorage.setItem('supportToken', saved);
        enterDashboard();
      } catch (_) { sessionStorage.removeItem('supportToken'); }
    })();
  </script>
</body>

</html>