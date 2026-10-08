<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel — NFT_DEV</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./admin.css">
  <script>
    if (localStorage.getItem("adminTheme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  </script>
</head>
<body>

<div id="authOverlay">
  <div class="auth-box">
    <div style="font-size:2rem;margin-bottom:0.75rem;"></div>
    <h2>Admin Panel</h2>
    <p>ສະເພາະ <strong>Owner</strong> ຫຼື <strong>Operator</strong> ຂອງ Contract ເທົ່ານັ້ນ</p>
    <div id="loginSection" class="auth-login-section">
      <div class="auth-step-label">Login ລະບົບກ່ອນ</div>
      <input type="text" id="adminEmail" placeholder="Email" autocomplete="off" class="auth-input" />
      <input type="password" id="adminPassword" placeholder="Password" autocomplete="new-password" class="auth-input" />
      <button onclick="adminLogin()" id="adminLoginBtn" class="auth-btn-login">
         Login
      </button>
      <div id="loginMsg" style="display:none;"></div>
    </div>

    <div class="auth-step-label" style="margin-top:0.25rem;">Connect Wallet</div>
    <button id="overlayConnectBtn" onclick="connectWallet()" disabled class="auth-btn-wallet">
       Connect MetaMask
    </button>
    <div class="not-owner" id="notOwnerMsg"> Wallet ນີ້ບໍ່ແມ່ນ Owner ຫຼື Operator — ບໍ່ມີສິດເຂົ້າ Admin Panel</div>
  </div>
</div>

<div class="app">


  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-title"> Admin Panel</div>
      <!-- <div class="logo-sub">NFT_DEV Contract</div> -->
    </div>

    <div class="nav-section">Overview</div>
    <button type="button" class="nav-item active" onclick="showSection('dashboard',this)"> Dashboard</button>

    <div class="nav-section">User</div>
    <button type="button" class="nav-item" onclick="showSection('users',this)">View Users</button>
    <button type="button" class="nav-item" onclick="showSection('blacklist',this)">Blacklist User</button>

    <div class="nav-section">Badge</div>
    <!-- <button type="button" class="nav-item" onclick="showSection('mint',this)">Mint Badge</button> -->
    <button type="button" class="nav-item" onclick="showSection('badges',this)">Update ໃບຢັ້ງຢືນ</button>

    <button type="button" class="nav-item" onclick="showSection('userlimits',this)">User Limits</button>

    <div class="nav-section">Contract</div>
    <button type="button" class="nav-item" onclick="showSection('settings',this)">Settings</button>
    <button type="button" class="nav-item" onclick="showSection('operators',this)">ຕັ້ງเປັນຮອງ Admin</button>
    <button type="button" class="nav-item" onclick="showSection('funds',this)">ເງິນໃນ contract</button>
    <button type="button" class="nav-item" onclick="showSection('txlog',this)">Log</button>

    <div class="nav-section">Support</div>
    <button type="button" class="nav-item" id="navTickets" onclick="showSection('tickets',this)">
     ຄຳຂໍທີ່ສົ່ງເຂົ້າມາ
      <span id="ticketBadge" style="display:none;margin-left:auto;background:#dc2626;color:#fff;border-radius:99px;font-size:0.68rem;font-weight:700;padding:1px 7px;min-width:18px;text-align:center;" aria-live="polite"></span>
    </button>
    <button type="button" class="nav-item" onclick="showSection('support',this)">
      Support Staff
    </button>
  </nav>


  <main class="main">
    <div class="page-header">
      <div>
        <h1 id="pageTitle">Dashboard</h1>
        <div class="sub" id="contractAddr">ເຊື່ອມຕໍ່ wallet ກ່ອນ</div>
      </div>
      <div class="page-header-actions">
        <button type="button" class="theme-toggle-mobile" id="themeToggleBtn" onclick="toggleAdminTheme()" aria-label="Toggle theme">
          <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        <button id="reloginBtn" onclick="showReloginModal()"> Re-login</button>
        <button id="connectBtn" onclick="connectWallet()"> Connect Wallet</button>
        <button id="logoutBtn" onclick="adminLogout()" style="display:none;"> Logout</button>
      </div>
    </div>


    <div id="reloginModal" style="display:none;">
      <div class="relogin-inner">
        <h3> Login ໃໝ່</h3>
        <div class="form-group" style="margin-bottom:0.5rem;">
          <input type="email" id="reloginEmail" placeholder="Email" class="auth-input" style="margin-bottom:0;" />
        </div>
        <div class="form-group" style="margin-bottom:0.75rem;">
          <input type="password" id="reloginPassword" placeholder="Password" class="auth-input" style="margin-bottom:0;" />
        </div>
        <div class="relogin-actions">
          <button onclick="doRelogin()" class="btn btn-primary" style="flex:1;">Login</button>
          <button onclick="document.getElementById('reloginModal').style.display='none'" class="btn">ຍົກເລີກ</button>
        </div>
        <div id="reloginMsg"></div>
      </div>
    </div>
    <div class="pause-banner" id="pauseBanner"> Minting ຖືກ pause ຢູ່ — ໄປ Settings ເພື່ອ resume</div>
    <div id="sec-dashboard" class="section active">
      <div class="stats-row">
        <div class="stat-box"><div class="num" id="statTotal">—</div><div class="lbl">Token ທິ້ງໝົດ</div></div>
        <div class="stat-box"><div class="num" id="statMyBadges" style="color:var(--text-success)">—</div><div class="lbl">ໃບຢັ້ງຢືນ ຂອງທ່ານ</div></div>
        <div class="stat-box"><div class="num" id="statPrice" style="color:var(--text-warning)">—</div><div class="lbl">ລາຄາ Mint ປະຈຸບັນ</div></div>
        <div class="stat-box"><div class="num" id="statRecoveryFee" style="color:var(--text-info)">—</div><div class="lbl">ລາຄາ Recovery ປະຈຸບັນ</div></div>
      </div>

      <div class="card">
        <div class="card-title"> Profile ຂອງທ່ານ</div>
        <div id="myProfile" style="font-size:0.88rem;color:var(--muted);">ກຳລັງດຶງຂໍ້ມູນ...</div>
      </div>

      <div class="card">
        <div class="card-title"> View Profile Wallet</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet Address</label>
            <input class="mono" id="lookupAddr" placeholder="0x..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="lookupProfile()">Lookup</button>
        </div>
        <div class="status-msg" id="lookupResult"></div>
      </div>
    </div>


    <div id="sec-users" class="section">
      <div class="card">
        <div class="card-title"> ເປຶດໃຊ້ງານ Wallet</div>
        <div class="form-group">
          <label>Wallet Address</label>
          <input class="mono" id="reactivateAddr" placeholder="0x..." />
        </div>
        <div class="btn-row">
          <button class="btn btn-success" onclick="reactivateWallet()">ເປຶດໃຊ້ງານ</button>
        </div>
        <div class="status-msg" id="reactivateStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Update Profile Name</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet Address</label>
            <input class="mono" id="updateProfileAddr" placeholder="0x..." oninput="fetchCurrentName(this.value)" />
            <div id="currentNameHint" class="status-msg"></div>
          </div>
          <div class="form-group">
            <label>ຊື່ໃໝ່</label>
            <input id="updateProfileName" placeholder="ຊື່ຜູ້ໃຊ້..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="updateProfile()">Update</button>
        </div>
        <div class="status-msg" id="updateProfileStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Badge ຂອງ User</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet Address</label>
            <input class="mono" id="userBadgesAddr" placeholder="0x..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="loadUserBadges()">ດຶງ Badge</button>
        </div>
        <div id="userBadgesResult" style="margin-top:0.75rem;"></div>
      </div>

      <div class="card">
        <div class="card-title">ດືງໃບຢັ້ງຢືນ</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet (ຕົ້ນທາງ)</label>
            <input class="mono" id="ftFromAddr" placeholder="0x..." oninput="ftClearStatus('from')" />
            <div id="ftFromStatus" style="margin-top:4px;font-size:0.78rem;"></div>
          </div>
          <div class="form-group">
            <label>Wallet (ປາຍທາງ)</label>
            <input class="mono" id="ftToAddr" placeholder="0x..." oninput="ftClearStatus('to')" />
            <div id="ftToStatus" style="margin-top:4px;font-size:0.78rem;"></div>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="loadFtBadges()">ໂຫຼດ NFT</button>
        </div>
        <div id="ftBadgesResult" style="margin-top:0.75rem;"></div>
        <div id="ftSelectSection" style="display:none;margin-top:0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-size:0.82rem;color:var(--muted);">ເລືອກ NFT ທີ່ຕ້ອງການຍ້າຍ</span>
            <div style="display:flex;gap:0.4rem;">
              <button class="btn" style="padding:0.25rem 0.7rem;font-size:0.78rem;" onclick="ftSelectAll()">ທັງໝົດ</button>
              <button class="btn" style="padding:0.25rem 0.7rem;font-size:0.78rem;" onclick="ftDeselectAll()">ລ້າງ</button>
            </div>
          </div>
          <div id="ftGrid" style="display:flex;flex-direction:column;gap:0.4rem;max-height:280px;overflow-y:auto;margin-bottom:0.75rem;"></div>
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:0.75rem 1rem;font-size:0.84rem;margin-bottom:0.75rem;">
            <div style="display:flex;justify-content:space-between;"><span style="color:var(--muted)">ຈຳນວນທີ່ເລືອກ</span><strong id="ftCount">0 ໃບ</strong></div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;"><span style="color:var(--muted)">ປາຍທາງ</span><strong id="ftToDisplay" style="font-family:var(--mono);font-size:0.78rem;color:var(--text-info);">—</strong></div>
          </div>
          <div class="btn-row">
            <button class="btn btn-danger" id="ftExecBtn" onclick="executeFt()" disabled>ຢືນຢັນການໂອນ</button>
          </div>
        </div>
        <div class="status-msg" id="ftStatus"></div>
      </div>
    </div>

    <div id="sec-blacklist" class="section">
      <div class="card">
        <div class="card-title">Blacklist Wallet</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet Address</label>
            <input class="mono" id="blacklistAddr" placeholder="0x..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-danger" onclick="setBlacklist(true)">Blacklist</button>
          <button class="btn btn-success" onclick="setBlacklist(false)">Unblacklist</button>
        </div>
        <div class="status-msg" id="blacklistStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">ກວດ Blacklist Status</div>
        <div class="form-group">
          <label>Wallet Address</label>
          <input class="mono" id="checkBlacklistAddr" placeholder="0x..." />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="checkBlacklist()">ກວດ</button>
        </div>
        <div class="status-msg" id="checkBlacklistResult"></div>
      </div>
    </div>

    <div id="sec-mint" class="section">
      <div class="card">
        <div class="card-title">Mint Badge ໃຫ້ User</div>
        <div class="form-group">
          <label>Wallet Address (student)</label>
          <input class="mono" id="mintStudent" placeholder="0x..." oninput="checkStudentRegistered(this.value,'mintStudentHint')" />
          <div class="status-msg" id="mintStudentHint" style="margin-top:0.4rem;"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Badge Name</label>
            <input id="mintName" placeholder="Blockchain Beginner" />
          </div>
          <div class="form-group">
            <label>Activity</label>
            <input id="mintActivity" placeholder="ຜ່ານການຮຽນ..." />
          </div>
        </div>
        <div class="form-group">
          <label>Token URI (IPFS)</label>
          <input class="mono" id="mintURI" placeholder="ipfs://... or https://..." />
        </div>
        <div class="form-group" style="display:flex;align-items:center;gap:0.75rem;">
          <label class="switch">
            <input type="checkbox" id="mintTransferable" />
            <span class="slider"></span>
          </label>
          <span style="font-size:0.88rem;">Transferable</span>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="mintBtn" onclick="mintBadge()">Mint Badge</button>
        </div>
        <div class="status-msg" id="mintStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Batch Mint</div>
        <div class="form-group">
          <label>Wallet Addresses (ໃສ່ທີລະແຖວ)</label>
          <textarea id="batchAddrs" placeholder="0x111...&#10;0x222...&#10;0x333..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Badge Name</label>
            <input id="batchName" placeholder="Blockchain Beginner" />
          </div>
          <div class="form-group">
            <label>Activity</label>
            <input id="batchActivity" placeholder="ຜ່ານການຮຽນ..." />
          </div>
        </div>
        <div class="form-group">
          <label>Token URI</label>
          <input class="mono" id="batchURI" placeholder="ipfs://..." />
        </div>
        <div class="form-group" style="display:flex;align-items:center;gap:0.75rem;">
          <label class="switch">
            <input type="checkbox" id="batchTransferable" />
            <span class="slider"></span>
          </label>
          <span style="font-size:0.88rem;">Transferable</span>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="batchMintBtn" onclick="batchMintBadge()">Batch Mint</button>
        </div>
        <div class="status-msg" id="batchMintStatus"></div>
      </div>
    </div>

    <div id="sec-badges" class="section">
      <div class="card">
        <div class="card-title">Update Badge</div>
        <div class="form-row">
          <div class="form-group">
            <label>Token ID NFT</label>
            <div style="display:flex;gap:0.5rem;">
              <input id="updateTokenId" type="number" placeholder="0" style="flex:1;" oninput="clearUpdateFields()" />
              <button class="btn btn-primary" onclick="fetchBadgeForUpdate()" style="flex-shrink:0;">ດຶງຂໍ້ມູນ</button>
            </div>
          </div>
          <div class="form-group">
            <label>ເຈົ້າຂອງ Wallet</label>
            <input class="mono" id="updateIssuedTo" readonly style="color:var(--muted);background:var(--surface);" placeholder="—" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>ຊື່ໃບຢັ້ງຢືນ</label>
            <input id="updateBadgeName" placeholder="Blockchain Pro" />
          </div>
          <div class="form-group">
            <label>ກິດຈະກຳ</label>
            <input id="updateActivity" placeholder="ຄຳອະທິບາຍ..." />
          </div>
        </div>

        <div class="form-group">
          <input id="updateDescription" placeholder="ຊະນະການແຂ່ງຂັນ Blockchain — ຜູ້ສົ່ງ: Admin" />
        </div>

        <div style="border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:1rem;">
          <div style="font-size:0.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:0.75rem;">
            ອັບໂຫຼດຮູບໃໝ່
          </div>
          <div id="updateImgPreview" style="display:none;margin-bottom:0.75rem;">
            <div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.35rem;">ຮູບປັດຈຸບັນ:</div>
            <img id="updateImgCurrent" src="" alt=""
              onerror="adminImgFallback(this)"
              style="width:80px;height:80px;object-fit:cover;border-radius:10px;border:1px solid var(--border);" />
          </div>

          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
            <label style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.45rem 0.9rem;border-radius:8px;border:1px dashed rgba(0,0,0,0.15);background:transparent;color:var(--muted);cursor:pointer;font-size:0.82rem;transition:all 0.15s;"
              onmouseover="this.style.borderColor='#0f6fb3';this.style.color='#0f6fb3';"
              onmouseout="this.style.borderColor='rgba(0,0,0,0.15)';this.style.color='var(--muted)';">
              ເລືອກຮູບ
              <input type="file" id="adminImgFile" accept="image/*" style="display:none;" onchange="adminPreviewFile(this)" />
            </label>
            <span id="adminImgFileName" style="font-size:0.8rem;color:var(--muted);">ຍັງບໍ່ໄດ້ເລືອກ</span>
            <button class="btn btn-primary" onclick="adminUploadImage()" id="adminUploadBtn" disabled style="font-size:0.82rem;">
              Upload
            </button>
          </div>
          <div class="status-msg" id="adminUploadStatus" style="margin-top:0.5rem;"></div>
        </div>

        <div class="form-group">
          <label>Link URI<span style="color:var(--muted);font-size:0.75rem;"></span></label>
          <input class="mono" id="updateTokenURI" placeholder="ipfs://..." />
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="updateBadgeBtn" onclick="updateBadge()" disabled>Update ໃບຢັ້ງຢືນ</button>
        </div>
        <div class="status-msg" id="updateBadgeStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Set Transferable</div>
        <div class="form-row">
          <div class="form-group">
            <label>Token ID</label>
            <input id="transferableTokenId" type="number" placeholder="0" />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-success" onclick="setTransferable(true)">Enable Transfer</button>
          <button class="btn btn-danger" onclick="setTransferable(false)">Disable Transfer</button>
        </div>
        <div class="status-msg" id="transferableStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Revoke ໃບຢັ້ງຢືນ</div>
        <div class="form-row">
          <div class="form-group">
            <label>Token ID NFT</label>
            <input id="revokeTokenId" type="number" placeholder="0" />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-danger" onclick="revokeBadge()">Revoke ໃບຢັ້ງຢືນ</button> 
        </div>
        <div class="status-msg" id="revokeStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">URI History ຂອງ Token</div>
        <div class="form-row">
          <div class="form-group">
            <label>Token ID</label>
            <input id="historyTokenId" type="number" placeholder="0" />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="getURIHistory()">ດຶງ History</button>
        </div>
        <div class="status-msg" id="uriHistoryResult"></div>
      </div>
    </div>

    <div id="sec-userlimits" class="section">
      <div class="card">
        <!-- <div class="card-title"></div> -->
        <!-- <p style="font-size:0.82rem;color:var(--muted);margin-bottom:1rem;">
          ກຳນົດ Max Badge ສ່ວນຕົວ — ຖ້າ <strong>—</strong> ໝາຍເຖິງໃຊ້ Global limit ຈາກ contract (<span id="globalMaxDisplay">—</span>)
        </p> -->
        <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="loadAllUsers()">ໂຫຼດ Users</button>
          <div style="flex:1;min-width:200px;position:relative;">
            <input type="text" id="userSearchInput" placeholder="ຄົ້ນຫາ ຊື່, email, wallet..."
              oninput="filterUsers(this.value)"
              style="width:100%;padding:0.5rem 0.9rem;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.85rem;font-family:'Noto Sans Lao','Outfit',sans-serif;transition:border-color 0.15s;"
              onfocus="this.style.borderColor='var(--accent)'"
              onblur="this.style.borderColor='var(--border)'" />
          </div>
        </div>
        <div id="userSearchCount" style="font-size:0.78rem;color:var(--muted);margin-bottom:0.5rem;display:none;"></div>
        <div id="userLimitsResult"></div>
      </div>
    </div>

    <div id="sec-settings" class="section">

      <div class="card">
        <!-- <div class="card-title">Pinata JWT (Global — ໃຊ້ໂດຍທຸກ User)</div> -->
        <!-- <p style="font-size:0.82rem;color:var(--muted);margin-bottom:1rem;">
          JWT ນີ້ຖືກໃຊ້ upload ຮູບຂຶ້ນ IPFS ໃນໜ້າ Mint — ບໍ່ຕ້ອງໃຫ້ user ຕັ້ງເອງ.<br>
          ຫຼັງ Save ຕ້ອງໄປໃສ່ຄ່ານີ້ໃນ <code style="background:rgba(15,111,179,.1);color:var(--text-info);padding:1px 6px;border-radius:4px;">config/contract.config.js</code> → <code style="background:rgba(15,111,179,.1);color:var(--text-info);padding:1px 6px;border-radius:4px;">PINATA_JWT</code>
        </p> -->
        <div id="pinataJWTConfigStatus" style="font-size:0.82rem;margin-bottom:0.75rem;"></div>
        <div class="form-row">
          <div class="form-group" style="flex:3;">
            <label>Pinata JWT</label>
            <input type="password" id="globalPinataJWTInput" placeholder="eyJhbGci..." autocomplete="off"
              style="font-family:'Space Mono',monospace;font-size:0.82rem;" />
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-primary" style="width:100%;" onclick="saveGlobalPinataJWT()">
              Save JWT
            </button>
          </div>
        </div>
        <div class="status-msg" id="globalPinataStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">Contract Settings</div>

        <div class="toggle-row">
          <div class="toggle-label">
            <div>Pause Minting</div>
            <div class="sub">ປິດ/ເປີດການ Mint ທັງລະບົບ</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="pauseToggle" onchange="togglePause()" />
            <span class="slider"></span>
          </label>
        </div>

        <hr class="divider">

        <div class="form-row">
          <div class="form-group">
            <label>ຕັ້ງລາຄາ Mint</label>
            <input id="newMintPrice" type="text" placeholder="0.05" />
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-primary" style="width:100%" onclick="setMintPrice()">Set Price</button>
          </div>
        </div>
        <div class="status-msg" id="mintPriceStatus"></div>

        <hr class="divider">

        <div class="form-row">
          <div class="form-group">
            <label>ຕັ້ງລາຄາ Recovery</label>
            <input id="newRecoveryFee" type="text" placeholder="0.05" />
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-yellow" style="width:100%" onclick="setRecoveryFee()">Set Fee</button>
          </div>
        </div>
        <div class="status-msg" id="recoveryFeeStatus"></div>

        <hr class="divider">

        <div class="form-row">
          <div class="form-group">
            <label>ຈຳນວນໃບຢັ້ງຢືນ ຕໍ່ບັນຊີ</label>
            <input id="newMaxBadge" type="number" placeholder="0" />
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-primary" style="width:100%" onclick="setMaxBadge()">Set Max</button>
          </div>
        </div>
        <div class="status-msg" id="maxBadgeStatus"></div>

        <hr class="divider">

        <div class="form-row">
          <div class="form-group">
            <label>Wallet ຜູ້ຮັບເງິນ <span style="color:var(--muted);font-size:0.75rem;">Contract</span></label>
            <input class="mono" id="newFundsReceiver" placeholder="0x..." />
          </div>
          <div class="form-group" style="display:flex;align-items:flex-end;">
            <button class="btn btn-danger" style="width:100%" onclick="setFundsReceiver()">Set Receiver</button>
          </div>
        </div>
        <div class="status-msg" id="fundsReceiverStatus"></div>

        <hr class="divider">

        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:1rem;margin-bottom:0.25rem;">
          <div style="font-size:0.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-danger);margin-bottom:0.75rem;">ໂອນ Connect</div>
          <div class="form-row">
            <div class="form-group">
              <input class="mono" id="newOwnerAddr" placeholder="0x..." />
            </div>
            <div class="form-group" style="display:flex;align-items:flex-end;">
              <button class="btn btn-danger" style="width:100%" onclick="transferOwnership()">Transfer Ownership</button>
            </div>
          </div>
          <div class="status-msg" id="ownershipStatus"></div>
        </div>
      </div>
    </div>

    <div id="sec-operators" class="section">
      <div class="card">
        <div class="card-title">ຮອງ Admin</div>
        <p style="font-size:0.82rem;color:var(--muted);margin-bottom:1rem;">
          ຮອງ Admin ສາມາດ Update ໃບຢັ້ງຢືນ, ຈັດການໜ້າ View user<strong>ບໍ່</strong>ສາມາດຖອນເງິນ ຫຼື ຕັ້ງເປັນ ຮອງ Admin ໄດ້
        </p>

        <div class="form-row">
          <div class="form-group" style="flex:2;">
            <label>Wallet Address</label>
            <input class="mono" id="operatorAddr" placeholder="0x..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-success" onclick="setOperator(true)">Add Operator</button>
          <button class="btn btn-danger" onclick="setOperator(false)">Remove Operator</button>
        </div>
        <div class="status-msg" id="operatorStatus"></div>
      </div>

      <div class="card">
        <div class="card-title">View ຮອງ Admin</div>
        <div class="form-row">
          <div class="form-group">
            <label>Wallet Address</label>
            <input class="mono" id="checkOperatorAddr" placeholder="0x..." />
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" onclick="checkOperator()">ກວດ</button>
        </div>
        <div class="status-msg" id="checkOperatorResult"></div>
      </div>
    </div>

    <div id="sec-funds" class="section">
      <div class="card">
        <div class="card-title">ເງິນໃນ contract ເດືອນນີ້</div>
        <div class="stats-row">
          <div class="stat-box">
            <div class="num" id="contractBalance" style="color:var(--text-warning)">—</div>
            <div class="lbl">ຈຳນວນ (LAB)</div>
          </div>
        </div>
        <div style="font-size:0.82rem;color:var(--muted);margin:0.5rem 0 1rem;display:flex;align-items:center;gap:0.5rem;">
                    ຜູ້ຮັບເງິນ :
          <span id="creatorAddr" class="mono" style="color:var(--text-info);font-size:0.8rem;">—</span>
        </div>
        <div class="btn-row">
          <button class="btn btn-yellow" onclick="refreshBalance()">Refresh</button>
          <button class="btn btn-success" onclick="withdrawFunds()">ຖອດ</button>
        </div>
        <div class="status-msg" id="fundsStatus"></div>
      </div>
    </div>

    <div id="sec-txlog" class="section">
      <div class="card">
        <div class="card-title">Transaction Log (Session)</div>
        <div style="display:flex;justify-content:flex-end;margin-bottom:0.75rem;">
          <button class="btn btn-danger" onclick="clearLog()">Clear Log</button>
        </div>
        <div id="txLogList"><div id="logEmpty">ຍັງບໍ່ມີ transaction ໃນ session ນີ້</div></div>
      </div>

      <div class="card" style="margin-top:1.5rem;">
        <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;">
          <span>ປະຫວັດ Transaction (DB)</span>
          <span style="font-size:0.8rem;font-weight:400;color:var(--muted);">ທັງໝົດ: <span id="txLogTotal">—</span> ລາຍການ</span>
        </div>
        <div id="txLogDb" style="display:flex;flex-direction:column;gap:0.4rem;min-height:2rem;"></div>
        <div style="display:flex;justify-content:center;margin-top:1rem;">
          <button id="txLogLoadMore" class="btn btn-secondary" style="display:none;"
            onclick="loadTxLogFromDB(txLogDbOffset + 50)">
            ໂຫຼດເພີ່ມ
          </button>
        </div>
      </div>
    </div>

    <div id="sec-tickets" class="section">



      <div class="tk-stats">
        <div class="stat-box">
          <div class="num" id="tkStatTotal">—</div><div class="lbl">Total Tickets</div>
        </div>
        <div class="stat-box">
          <div class="num" id="tkStatNew" style="color:var(--text-danger)">—</div><div class="lbl">ໃໝ່ (ຍັງບໍ່ອ່ານ)</div>
        </div>
        <div class="stat-box">
          <div class="num" id="tkStatReplied" style="color:var(--text-success)">—</div><div class="lbl">ຕອບແລ້ວ</div>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--border);">
          <div class="card-title" style="margin:0;">Support Tickets</div>
          <button class="btn" onclick="loadTickets()">Refresh</button>
        </div>

        <div style="padding:0.75rem 1.25rem;border-bottom:1px solid var(--border);">
          <div class="tk-filter-row">
            <button class="tk-filter active" onclick="filterTickets('all',this)">ທັງໝົດ</button>
            <button class="tk-filter" onclick="filterTickets('new',this)"> ໃໝ່</button>
            <button class="tk-filter" onclick="filterTickets('read',this)"> ອ່ານແລ້ວ</button>
            <button class="tk-filter" onclick="filterTickets('replied',this)"> ຕອບແລ້ວ</button>
          </div>
        </div>

        <div id="tkList"><div style="padding:2rem;text-align:center;color:var(--muted);font-size:0.85rem;">ກຳລັງໂຫຼດ...</div></div>
      </div>

      <div id="tkDetail">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <div style="font-size:0.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);">
            Ticket Detail
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-danger" id="tkDelBtn" onclick="deleteTicket()">ລຶບ</button>
            <button class="btn" onclick="closeTicketDetail()">ປິດ</button>
          </div>
        </div>
        <div id="tkDetailContent"></div>
        <div id="tkReplySection">
          <div style="font-size:0.8rem;font-weight:600;color:var(--muted);margin:1rem 0 0.4rem;text-transform:uppercase;letter-spacing:.06em;">
            ຕອບກັບ
          </div>
          <textarea id="tkReplyText" rows="4" placeholder="ພິມຂໍ້ຄວາມຕອບ..."
            style="width:100%;padding:0.7rem 0.9rem;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:0.88rem;font-family:'Noto Sans Lao','Outfit',sans-serif;resize:vertical;outline:none;transition:border-color 0.15s;"
            onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'"></textarea>
          <div style="margin-top:0.6rem;display:flex;gap:0.5rem;">
            <button class="btn btn-success" id="tkReplyBtn" onclick="sendTicketReply()">
              ສົ່ງ Reply
            </button>
          </div>
          <div class="status-msg" id="tkReplyStatus" style="margin-top:0.6rem;"></div>
        </div>
      </div>

    </div>

    <div id="sec-support" class="section">
      <div class="card" style="margin-bottom:1.25rem;">
        <div class="card-title">Support Staff ປັດຈຸບັນ</div>
        <div id="supportStaffList"><span style="color:var(--muted);font-size:0.85rem;">ກົດ "Refresh" ເພື່ອໂຫຼດ</span></div>
      </div>

      <div class="card">
        <div class="card-title">ຕັ້ງ Role User</div>
        <p style="font-size:0.82rem;color:var(--muted);margin-bottom:1rem;">ຄົ້ນຫາ User</p>
        <div style="display:flex;gap:0.6rem;margin-bottom:1rem;">
          <input type="text" id="supportSearch" placeholder="ຄົ້ນຫາ ຊື່ ຫຼື Email..."
            oninput="filterSupportUsers()"
            style="flex:1;padding:0.55rem 0.85rem;border-radius:9px;border:1px solid var(--border);
                   background:var(--surface2);color:var(--text);font-size:0.87rem;
                   font-family:'Outfit','Noto Sans Lao',sans-serif;outline:none;transition:border .2s;"
            onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border)'" />
          <button class="btn" onclick="loadSupportSection()">Refresh</button>
        </div>
        <div id="supportUserList"><span style="color:var(--muted);font-size:0.85rem;">ກຳລັງໂຫຼດ...</span></div>
        <div class="status-msg" id="supportRoleStatus" style="margin-top:0.75rem;"></div>
      </div>
    </div>

  </main>
</div>

<div class="toast" id="toast"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="../config/contract.config.js"></script>
<script src="./admin.js"></script>
</body>
</html>