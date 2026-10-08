

let isOwner = false;

// ── Theme toggle (light default, dark optional — persisted in localStorage) ──
// Initial state is applied synchronously by the inline <script> in <head> to avoid a flash.
function toggleAdminTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("adminTheme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("adminTheme", "dark");
  }
}

// ── Themed confirm dialog (SweetAlert2) — replaces native confirm() ──
async function adminConfirm({ title, html = "", icon = "warning", danger = false, confirmText = "ຢືນຢັນ" }) {
  const result = await Swal.fire({
    title,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "ຍົກເລີກ",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "admin-swal-popup",
      title: "admin-swal-title",
      htmlContainer: "admin-swal-html",
      actions: "admin-swal-actions",
      confirmButton: danger ? "btn btn-danger" : "btn btn-primary",
      cancelButton: "btn",
    },
  });
  return result.isConfirmed;
}

const ABI = CONTRACT_ABI;

let provider, signer, contract, account;
let txLog = [];
let currentBadgeMeta = null;

// Read-only contract — ອ່ານຈາກ LABChain RPC ໂດຍກົງ, ບໍ່ຂຶ້ນກັບ MetaMask network
function getRC() {
  return new ethers.Contract(
    CONTRACT_ADDRESS, ABI,
    new ethers.JsonRpcProvider("https://rpc.labchain.la")
  );
}


function showReloginModal() {
  document.getElementById("reloginModal").style.display = "flex";
}

async function doRelogin() {
  const email    = document.getElementById("reloginEmail").value.trim();
  const password = document.getElementById("reloginPassword").value;
  const msgEl    = document.getElementById("reloginMsg");
  if (!email || !password) { msgEl.style.color = "var(--text-danger)"; msgEl.textContent="ໃສ່ Email ແລະ Password"; return; }
  try {
    const res  = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || "Login failed");
    localStorage.setItem("authToken", data.token);
    msgEl.style.color = "var(--text-success)";
    msgEl.textContent = " Login ສຳເລັດ";
    setTimeout(() => {
      document.getElementById("reloginModal").style.display = "none";
      document.getElementById("reloginBtn").style.display = "none";
      toast(" Login ສຳເລັດ — ລອງໃໝ່ໄດ້", "ok");
    }, 800);
  } catch (e) {
    msgEl.style.color = "var(--text-danger)";
    msgEl.textContent = " " + e.message;
  }
}

function handleTokenExpired() {
  localStorage.removeItem("authToken");
  document.getElementById("reloginBtn").style.display = "inline-flex";
  toast(" Token ໝົດອາຍຸ — ກົດ Re-login", "err");
}

async function adminLogout() {
  const ok = await adminConfirm({
    title: "ອອກຈາກລະບົບ?",
    icon: "question",
    confirmText: "ອອກຈາກລະບົບ",
  });
  if (!ok) return;
  localStorage.removeItem("authToken");
  toast(" Logout ສຳເລັດ", "ok");
  location.href = "../controllers/learnnbadge-ui.php";
}

function setManualToken() {
  const token = document.getElementById("manualToken").value.trim();
  if (!token || !token.startsWith("eyJ")) { toast("Token ບໍ່ຖືກຕ້ອງ", "err"); return; }
  localStorage.setItem("authToken", token);
  const walletBtn = document.getElementById("overlayConnectBtn");
  if (walletBtn) { walletBtn.disabled = false; walletBtn.style.opacity = "1"; walletBtn.style.cursor = "pointer"; }
  const loginMsg = document.getElementById("loginMsg");
  loginMsg.style.cssText = "display:block;background:rgba(34,197,94,0.1);color:var(--text-success);border:1px solid rgba(34,197,94,0.25);padding:0.4rem 0.75rem;border-radius:8px;font-size:0.82rem;margin-top:0.5rem;";
  loginMsg.textContent = " Token ຕັ້ງແລ້ວ — Connect Wallet ໄດ້ເລີຍ";
  toast(" Token set", "ok");
}

async function adminLogin() {
  const email    = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const btn      = document.getElementById("adminLoginBtn");
  const msgEl    = document.getElementById("loginMsg");
  if (!email || !password) {
    msgEl.style.display = "block";
    msgEl.style.cssText = "display:block;background:rgba(239,68,68,0.1);color:var(--text-danger);border:1px solid rgba(239,68,68,0.25);padding:0.4rem 0.75rem;border-radius:8px;font-size:0.82rem;margin-top:0.5rem;";
    msgEl.textContent = "ໃສ່ Email ແລະ Password"; return;
  }
  btn.disabled = true; btn.textContent = " ກຳລັງ Login...";
  try {
    const res  = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || "Login failed");

    localStorage.setItem("authToken", data.token);
    msgEl.style.cssText = "display:block;background:rgba(34,197,94,0.1);color:var(--text-success);border:1px solid rgba(34,197,94,0.25);padding:0.4rem 0.75rem;border-radius:8px;font-size:0.82rem;margin-top:0.5rem;";
    msgEl.textContent = ` Login ສຳເລັດ — ${data.user?.name || email}`;
    btn.textContent = " Logged in";

    // enable MetaMask button
    const walletBtn = document.getElementById("overlayConnectBtn");
    walletBtn.disabled = false;
    walletBtn.style.cssText = "width:100%;padding:0.75rem;border-radius:12px;border:1px solid rgba(15,111,179,0.5);background:rgba(15,111,179,0.2);color:var(--text-info);font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;opacity:1;";

    document.getElementById("loginSection").style.opacity = "0.6";
  } catch (e) {
    msgEl.style.cssText = "display:block;background:rgba(239,68,68,0.1);color:var(--text-danger);border:1px solid rgba(239,68,68,0.25);padding:0.4rem 0.75rem;border-radius:8px;font-size:0.82rem;margin-top:0.5rem;";
    msgEl.textContent = " " + e.message;
    btn.disabled = false; btn.textContent = " Login";
  }
}

async function connectWallet() {
  if (!window.ethereum) { toast("ຕິດຕັ້ງ MetaMask ກ່ອນ", "err"); return; }
  const overlayBtn = document.getElementById("overlayConnectBtn");
  if (overlayBtn) { overlayBtn.disabled = true; overlayBtn.textContent = " ກຳລັງເຊື່ອມ..."; }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    //  ກວດ + switch ໄປ LABChain (Chain ID 5222) ອັດຕະໂນມັດ
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 5222) {
      if (overlayBtn) overlayBtn.textContent = " ກຳລັງສະໜັບສະໜູນ LABChain...";
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x146E" }], // 5222
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x146E",
              chainName: "LABChain",
              nativeCurrency: { name: "LAB", symbol: "LAB", decimals: 18 },
              rpcUrls: ["https://rpc.labchain.la"],
              blockExplorerUrls: [],
            }],
          });
        } else {
          throw new Error("ກະລຸນາສະໜັບສະໜູນ MetaMask ໄປ LABChain (Chain ID 5222) ກ່ອນ");
        }
      }
      // rebuild provider after switch
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    signer = await provider.getSigner();
    account = await signer.getAddress();
    // LABChain: smart estimateGas override
    const _origEst = provider.estimateGas.bind(provider);
    provider.estimateGas = async (tx) => {
      try {
        const est = await _origEst(tx);
        return est * 150n / 100n;
      } catch (_) {
        const hasValue = tx.value && BigInt(tx.value) > 0n;
        return hasValue ? 1000000n : 300000n;
      }
    };
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        //  AUTH GUARD — ກວດວ່າເປັນ owner ຫຼື operator
    const owner = await getRC().owner();
    isOwner = owner.toLowerCase() === account.toLowerCase();
    const isOperatorAccess = !isOwner && await getRC().operators(account);
    if (!isOwner && !isOperatorAccess) {
      document.getElementById("notOwnerMsg").classList.add("show");
      if (overlayBtn) { overlayBtn.disabled = false; overlayBtn.textContent = " Connect MetaMask"; }
      toast(" Wallet ນີ້ບໍ່ແມ່ນ Owner ຫຼື Operator", "err");
      return;
    }

    //  ຜ່ານ — ເຊື່ອງ overlay
    document.getElementById("authOverlay").classList.add("hidden");

    const btn = document.getElementById("connectBtn");
    btn.textContent = shortenAddr(account);
    btn.classList.add("connected");
    document.getElementById("contractAddr").textContent = "Contract: " + CONTRACT_ADDRESS;

    await loadDashboard();
    toast(" Connected: " + shortenAddr(account), "ok");
  } catch (e) {
    if (overlayBtn) { overlayBtn.disabled = false; overlayBtn.textContent = " Connect MetaMask"; }
    toast(e.message || "Connect failed", "err");
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
async function loadDashboard() {
  try {
    const rc = getRC();
    const [total, price, recFee, paused, myBadges, prof] = await Promise.all([
      rc.totalMinted(),
      rc.mintPrice(),
      rc.recoveryFeePerNFT(),
      rc.mintingPaused(),
      rc.getBadgesOf(account),
      rc.getProfile(account),
    ]);

    document.getElementById("statTotal").textContent     = total.toString();
    document.getElementById("statMyBadges").textContent  = myBadges.length;
    document.getElementById("statPrice").textContent     = ethers.formatEther(price);
    document.getElementById("statRecoveryFee").textContent = ethers.formatEther(recFee);

    // Pause toggle sync + global banner
    document.getElementById("pauseToggle").checked = paused;
    const banner = document.getElementById("pauseBanner");
    paused ? banner.classList.add("show") : banner.classList.remove("show");

    // Profile
    const typeLabel = ["NONE","USER"][Number(prof.userType)] || "NONE";
    document.getElementById("myProfile").innerHTML =
      `<span style="color:var(--text)">ຊື່:</span> <strong>${prof.name || "—"}</strong> &nbsp;|&nbsp;
       <span style="color:var(--text)">Type:</span> <span class="badge-chip ${typeLabel==='USER'?'chip-green':'chip-red'}">${typeLabel}</span> &nbsp;|&nbsp;
       <span style="color:var(--text)">Active:</span> <span class="badge-chip ${prof.active?'chip-green':'chip-red'}">${prof.active?'Active':'Deactivated'}</span><br>
       <span style="color:var(--muted);font-family:var(--mono);font-size:0.78rem;">${account}</span>`;

    // Balance
    refreshBalance();
  } catch (e) {
    console.warn("loadDashboard:", e.message);
  }
}

async function refreshBalance() {
  try {
    const rp = new ethers.JsonRpcProvider("https://rpc.labchain.la");
    const bal = await rp.getBalance(CONTRACT_ADDRESS);
    document.getElementById("contractBalance").textContent = ethers.formatEther(bal) + " LAB";
    const rc = getRC();
    const cr = await rc.fundsReceiver();
    let label = shortenAddr(cr);
    try {
      const prof = await rc.getProfile(cr);
      if (prof.name) label = `${prof.name} (${shortenAddr(cr)})`;
    } catch (_) {}
    document.getElementById("creatorAddr").textContent = label;
  } catch (_) {}
}

async function lookupProfile() {
  const addr = document.getElementById("lookupAddr").value.trim();
  if (!isAddr(addr)) { showStatus("lookupResult", "err", "Address ບໍ່ຖືກຕ້ອງ"); return; }
  showStatus("lookupResult", "info", " ກຳລັງດຶງຂໍ້ມູນ...");
  try {
    // 1. On-chain data
    const rc = getRC();
    const [prof, badges, bl] = await Promise.all([
      rc.getProfile(addr),
      rc.getBadgesOf(addr),
      rc.blacklisted(addr),
    ]);
    const typeLabel = ["NONE","USER"][Number(prof.userType)] || "NONE";

    // 2. DB data (email, wallet history)
    let dbData = null;
    try {
      const authToken = localStorage.getItem("authToken") || "";
      const res = await fetch(`${API_BASE_URL}/api/wallet/user-by-wallet?address=${addr}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) dbData = await res.json();
    } catch (_) {}

    const el = document.getElementById("lookupResult");
    el.className = "status-msg show info";
    el.style.whiteSpace = "normal";
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div>
          <div style="font-size:0.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:0.5rem;"> On-Chain</div>
          <div style="font-size:0.84rem;line-height:1.9;">
            <b>ຊື່:</b> ${prof.name || "<span style='color:var(--muted)'>(ຍັງບໍ່ register)</span>"}<br>
            <b>Type:</b> <span class="badge-chip ${typeLabel==='USER'?'chip-green':'chip-red'}">${typeLabel}</span>
            &nbsp;<b>Active:</b> <span class="badge-chip ${prof.active?'chip-green':'chip-red'}">${prof.active?'Yes':'No'}</span><br>
            <b>Blacklisted:</b> <span class="badge-chip ${bl?'chip-red':'chip-green'}">${bl?'Yes':'No'}</span><br>
            <b>NFT:</b> ${badges.length} ໃບ<br>
            <b>RecoveredTo:</b> <span style="font-family:var(--mono);font-size:0.76rem;">${prof.recoveredTo===ethers.ZeroAddress?"—":shortenAddr(prof.recoveredTo)}</span>
          </div>
        </div>
        <div>
          <div style="font-size:0.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:0.5rem;"> Database</div>
          ${dbData?.found ? `
          <div style="font-size:0.84rem;line-height:1.9;">
            <b>Email:</b> ${dbData.email || "—"}<br>
            <b>ຊື່:</b> ${dbData.name || "—"}<br>
            <b>Verified:</b> <span class="badge-chip ${dbData.verified?'chip-green':'chip-yellow'}">${dbData.verified?' Yes':' No'}</span><br>
            <b>Wallet ເກົ່າ (${dbData.walletHistory?.length||0}):</b><br>
            ${(dbData.walletHistory||[]).map((w,i)=>`<span style="font-family:var(--mono);font-size:0.74rem;color:var(--yellow);">${i+1}. ${w.slice(0,6)}...${w.slice(-4)}</span>`).join("<br>") || "<span style='color:var(--muted)'>ບໍ່ມີ</span>"}
          </div>` : `<div style="color:var(--muted);font-size:0.84rem;">${dbData===null?' ຕ້ອງ login API ກ່ອນ':'ບໍ່ພົບ user ໃນ DB'}</div>`}
        </div>
      </div>`;
  } catch (e) {
    showStatus("lookupResult", "err", e.reason || e.message);
  }
}

// ============================================================
//  USERS
// ============================================================
async function reactivateWallet() {
  const addr = document.getElementById("reactivateAddr").value.trim();
  if (!isAddr(addr)) { showStatus("reactivateStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  await sendTx("reactivateStatus", () => contract.reactivateWallet(addr));
}

async function fetchCurrentName(val) {
  const hint = document.getElementById("currentNameHint");
  const nameInput = document.getElementById("updateProfileName");
  if (!hint) return;
  if (!val || !isAddr(val)) {
    hint.className = "status-msg";
    return;
  }
  try {
    const prof = await getRC().getProfile(val);
    const current = prof.name || "";
    hint.className = "status-msg show info";
    hint.textContent = `ຊື່ປັດຈຸບັນ: ${current || "(ຍັງບໍ່ໄດ້ຕັ້ງ)"}`;
    nameInput.value = current;
  } catch {
    hint.className = "status-msg";
  }
}

async function updateProfile() {
  const addr = document.getElementById("updateProfileAddr").value.trim();
  const name = document.getElementById("updateProfileName").value.trim();
  if (!isAddr(addr)) { showStatus("updateProfileStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  if (!name) { showStatus("updateProfileStatus","err","ໃສ່ຊື່"); return; }
  if (!contract) { toast("ເຊື່ອມຕໍ່ wallet ກ່ອນ","err"); return; }

  showStatus("updateProfileStatus","info"," ກຳລັງສົ່ງ transaction...");
  try {
    const tx = await contract.updateProfile(addr, name);
    showStatus("updateProfileStatus","info",` ລໍຖ້າ confirm...\nTx: ${tx.hash}`);
    await tx.wait();
    addLog(`updateProfile: ${name}`, tx.hash, true);

    // Sync name to DB
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const r = await fetch(`${API_BASE_URL}/api/admin/update-name`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ wallet: addr, name }),
        });
        const d = await r.json();
        if (d.ok) {
          showStatus("updateProfileStatus","ok",` ສຳເລັດ — On-chain + DB sync ແລ້ວ\nTx: ${tx.hash}`);
        } else {
          showStatus("updateProfileStatus","ok",` On-chain ສຳເລັດ — DB: ${d.msg}\nTx: ${tx.hash}`);
        }
      } catch {
        showStatus("updateProfileStatus","ok",` On-chain ສຳເລັດ — DB sync ລົ້ມເຫລວ\nTx: ${tx.hash}`);
      }
    } else {
      showStatus("updateProfileStatus","ok",` On-chain ສຳເລັດ (Login ກ່ອນຈຶ່ງ sync DB ໄດ້)\nTx: ${tx.hash}`);
    }
    toast(" Update Profile ສຳເລັດ","ok");
  } catch (e) {
    const isRevert = e.code === "CALL_EXCEPTION" || (e.message||"").includes("execution reverted");
    showStatus("updateProfileStatus","err", isRevert ? (e.reason || "Transaction reverted") : e.message);
    addLog("updateProfile failed", null, false);
  }
}

async function loadUserBadges() {
  const addr = document.getElementById("userBadgesAddr").value.trim();
  if (!isAddr(addr)) return;
  const res = document.getElementById("userBadgesResult");
  res.innerHTML = '<span style="color:var(--muted)">ກຳລັງດຶງ...</span>';
  try {
    const rc = getRC();
    const ids = await rc.getBadgesOf(addr);
    if (ids.length === 0) { res.innerHTML = '<span style="color:var(--muted)">ບໍ່ມີ Badge</span>'; return; }
    const rows = await Promise.all(ids.map(async id => {
      const [b, tr, uri] = await Promise.all([
        rc.badges(id),
        rc.transferable(id),
        rc.tokenURI(id).catch(() => null),
      ]);
      return { id: Number(id), name: b.badgeName, activity: b.activity, transferable: tr, issuedAt: Number(b.issuedAt), uri };
    }));
    const html = rows.map(b => `<tr>
      <td><div id="badge-img-${b.id}" class="badge-thumb-wrap"><div class="badge-thumb-loading"></div></div></td>
      <td><span class="badge-chip chip-blue">#${b.id}</span></td>
      <td>${b.name}</td>
      <td class="td-activity">${b.activity}</td>
      <td><span class="badge-chip ${b.transferable?'chip-green':'chip-red'}">${b.transferable?'Yes':'No'}</span></td>
      <td>${b.issuedAt ? new Date(b.issuedAt*1000).toLocaleDateString() : '—'}</td>
    </tr>`).join("");
    res.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>ຮູບ</th><th>ID</th><th>ຊື່</th><th>Activity</th><th>Transfer</th><th>ວັນທີ</th></tr></thead>
      <tbody>${html}</tbody>
    </table></div>`;
    rows.forEach(b => { if (b.uri) fetchBadgeThumb(`badge-img-${b.id}`, b.uri); });
  } catch (e) {
    res.innerHTML = `<span style="color:var(--text-danger)">${e.message}</span>`;
  }
}

async function fetchBadgeThumb(containerId, uri) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  try {
    const httpUri = uri.startsWith("ipfs://") ? PINATA_GATEWAY + uri.slice(7) : uri;
    const meta = await fetch(httpUri).then(r => r.json());
    if (!meta?.image) { wrap.innerHTML = '<span style="color:var(--muted);font-size:0.7rem;">—</span>'; return; }
    const imgCid = meta.image.startsWith("ipfs://") ? meta.image.slice(7) : meta.image.split("/ipfs/")[1];
    const imgSrc = imgCid ? PINATA_GATEWAY + imgCid : meta.image;
    wrap.innerHTML = `<img src="${imgSrc}" alt="" class="badge-thumb" onerror="this.parentElement.innerHTML='<span style=\\'color:var(--muted);font-size:0.7rem;\\'>—</span>'">`;
  } catch {
    wrap.innerHTML = '<span style="color:var(--muted);font-size:0.7rem;">—</span>';
  }
}

//  ກວດ student ລົງທະບຽນ real-time
async function checkStudentRegistered(val, hintId) {
  const hint = document.getElementById(hintId);
  if (!hint) return;
  if (!val || !isAddr(val)) { hint.className = "status-msg"; return; }
  try {
    const prof = await getRC().getProfile(val);
    if (Number(prof.userType) === 0) {
      hint.className = "status-msg show err";
      hint.textContent = " Wallet ນີ້ຍັງບໍ່ໄດ້ register() ໃນ contract — Mint ຈະ revert";
    } else if (!prof.active) {
      hint.className = "status-msg show err";
      hint.textContent = " Wallet ນີ້ຖືກ deactivate ແລ້ວ";
    } else {
      hint.className = "status-msg show ok";
      hint.textContent = ` ${prof.name} — ລົງທະບຽນແລ້ວ`;
    }
  } catch (_) { hint.className = "status-msg"; }
}

//  TX LOG helpers
let txLogDbOffset = 0;

function addLog(action, txHash, ok) {
  const now = new Date().toLocaleTimeString();
  txLog.unshift({ action, txHash, ok, time: now });
  renderLog();
  // fire-and-forget save to DB
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    fetch(`${API_BASE_URL}/api/admin/tx-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ action, tx_hash: txHash || null, ok: ok ? 1 : 0, wallet: account || null })
    }).catch(() => {});
  }
}

function renderLog() {
  const el = document.getElementById("txLogList");
  if (!txLog.length) { el.innerHTML = '<div id="logEmpty">ຍັງບໍ່ມີ transaction ໃນ session ນີ້</div>'; return; }
  el.innerHTML = txLog.map(l => `
    <div class="log-entry">
      <span class="log-dot ${l.ok?'ok':'err'}"></span>
      <div style="flex:1;min-width:0;">
        <div class="log-action">${l.action}</div>
        <div class="log-tx">${l.txHash ? `Tx: ${l.txHash.slice(0,20)}...` : ''}</div>
      </div>
      <span class="log-time">${l.time}</span>
    </div>`).join("");
}

function clearLog() {
  txLog = [];
  renderLog();
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    fetch(`${API_BASE_URL}/api/admin/tx-log`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(() => loadTxLogFromDB(0)).catch(() => {});
  }
  toast("Log cleared", "");
}

async function loadTxLogFromDB(offset = 0) {
  txLogDbOffset = offset;
  const authToken = localStorage.getItem("authToken");
  const el = document.getElementById("txLogDb");
  const totalEl = document.getElementById("txLogTotal");
  const moreBtn = document.getElementById("txLogLoadMore");
  if (!el) return;

  el.innerHTML = '<div style="color:var(--muted);font-size:0.85rem;padding:0.5rem 0;"> ກຳລັງໂຫຼດ...</div>';
  if (!authToken) {
    el.innerHTML = '<div class="status-msg show err"> ຕ້ອງ Login ກ່ອນ</div>';
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/tx-log?limit=50&offset=${offset}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) { el.innerHTML = '<div class="status-msg show err"> ດຶງ log ບໍ່ໄດ້</div>'; return; }
    const data = await res.json();
    if (totalEl) totalEl.textContent = data.total ?? 0;
    if (!data.logs?.length && offset === 0) {
      el.innerHTML = '<div style="color:var(--muted);font-size:0.85rem;padding:0.5rem 0;">ຍັງບໍ່ມີ log ໃນ DB</div>';
      if (moreBtn) moreBtn.style.display = "none";
      return;
    }
    const rows = data.logs.map(l => {
      const dt = new Date(l.created_at).toLocaleString("lo-LA");
      const short = l.tx_hash ? l.tx_hash.slice(0, 20) + "…" : "";
      return `<div class="log-entry">
        <span class="log-dot ${l.ok ? 'ok' : 'err'}"></span>
        <div style="flex:1;min-width:0;">
          <div class="log-action">${l.action}</div>
          ${short ? `<div class="log-tx">Tx: ${short}</div>` : ""}
          ${l.wallet ? `<div class="log-tx" style="font-size:0.72rem;color:var(--muted);">${l.wallet.slice(0,14)}…</div>` : ""}
        </div>
        <span class="log-time">${dt}</span>
      </div>`;
    }).join("");
    if (offset === 0) {
      el.innerHTML = rows;
    } else {
      el.insertAdjacentHTML("beforeend", rows);
    }
    if (moreBtn) {
      moreBtn.style.display = (offset + 50 < data.total) ? "inline-flex" : "none";
    }
  } catch {
    el.innerHTML = '<div class="status-msg show err"> Network error</div>';
  }
}

// ============================================================
//  USER LIMITS
// ============================================================
async function loadAllUsers() {
  const el = document.getElementById("userLimitsResult");
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    el.innerHTML = `<div class="status-msg show err"> ຍັງບໍ່ໄດ້ Login — ໃສ່ Email/Password ໃນ overlay ກ່ອນ Connect Wallet</div>`;
    return;
  }

  el.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;"> ກຳລັງໂຫຼດ...</span>';

  // แสดง global max จาก contract
  try {
    const gMax = await getRC().maxBadgePerUser();
    document.getElementById("globalMaxDisplay").textContent =
      Number(gMax) === 0 ? "ບໍ່ຈຳກັດ" : gMax.toString() + " ໃບ";
  } catch (_) {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { handleTokenExpired(); return; }
      el.innerHTML = `<div class="status-msg show err"> ${data.message || "Server error"}</div>`;
      return;
    }
    if (!data.users?.length) { el.innerHTML = '<span style="color:var(--muted)">ບໍ່ມີ user ໃນ DB</span>'; return; }

    const inp = (type, id, val, placeholder, step='') =>
      `<input type="${type}" id="${id}" value="${val ?? ''}" placeholder="${placeholder}"
       ${step ? `step="${step}"` : ''}
       style="width:100%;padding:0.45rem 0.65rem;border-radius:8px;border:1px solid var(--border);
              background:var(--surface2);color:var(--text);font-size:0.82rem;
              transition:border-color 0.15s;"
       onfocus="this.style.borderColor='var(--accent)'"
       onblur="this.style.borderColor='var(--border)'" />`;

    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        ${data.users.map(u => `
          <div data-userid="${u.ID}"
               data-search="${[u.name,u.email,u.walletAddress,u.issuerLabel].join(' ').toLowerCase()}"
               style="background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem;">

            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap;">

              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.92rem;color:var(--text);">${u.name || "—"}</div>
                <div style="font-size:0.76rem;color:var(--muted);">${u.email || "—"}</div>
              </div>
              <div class="addr" data-full="${u.walletAddress || ''}"
                style="font-family:var(--mono);font-size:0.76rem;color:var(--muted);
                       background:var(--surface);padding:3px 8px;border-radius:6px;border:1px solid var(--border);">
                ${u.walletAddress ? u.walletAddress.slice(0,6)+"..."+u.walletAddress.slice(-4) : "—"}
              </div>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                <button class="btn btn-primary" style="padding:0.4rem 0.9rem;font-size:0.82rem;"
                  onclick="saveUserAll(${u.ID}, '${u.walletAddress || ''}')">ບັນທຶກ</button>
                <button class="btn" style="padding:0.4rem 0.75rem;font-size:0.82rem;color:var(--muted);"
                  onclick="resetUserAll(${u.ID}, '${u.walletAddress || ''}')" title="Reset">Reset</button>
              </div>
            </div>
            <!-- Fields grid -->
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.75rem;">
              <div>
                <div style="font-size:0.7rem;color:var(--muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:.05em;">ຈຳນວນໃບຢັ້ງຢືນ ຕໍ່ບັນຊີ</div>
                ${inp('number', `maxBadgeInput_${u.ID}`, u.maxBadge, 'Global', '')}
              </div>
              <div>
                <div style="font-size:0.7rem;color:var(--muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:.05em;">ລາຄາ Mint</div>
                ${inp('number', `mintPriceInput_${u.ID}`, u.MintPrice, 'Global', '0.001')}
              </div>
              <div>
                <div style="font-size:0.7rem;color:var(--muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:.05em;">ລາຄາ Recovery</div>
                ${inp('number', `recoveryFeeInput_${u.ID}`, u.recoveryFee, 'Global', '0.001')}
              </div>
              <div>
                <div style="font-size:0.7rem;color:var(--muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:.05em;">ອອກໂດຍ</div>
                ${inp('text', `issuerLabelInput_${u.ID}`, u.issuerLabel, 'ຄົນທົ່ວໄປ', '')}
              </div>
            </div>
          </div>
        `).join("")}
      </div>`;
  } catch (e) {
    el.innerHTML = `<span style="color:var(--text-danger)">${e.message}</span>`;
  }
}

function filterUsers(q) {
  const cards = document.querySelectorAll("#userLimitsResult > div > div[data-userid]");
  const query = q.toLowerCase().trim();
  let visible = 0;
  cards.forEach(card => {
    const text = card.dataset.search || "";
    const show = !query || text.includes(query);
    card.style.display = show ? "block" : "none";
    if (show) visible++;
  });
  const countEl = document.getElementById("userSearchCount");
  if (countEl) {
    countEl.style.display = query ? "block" : "none";
    countEl.textContent = `ພົບ ${visible} / ${cards.length} user`;
  }
}

async function setOnChainPrice(userId, wallet) {
  if (!wallet || !isAddr(wallet)) { toast(" ບໍ່ພົບ wallet address", "err"); return; }
  if (!contract) { toast(" Connect Wallet ກ່ອນ", "err"); return; }
  const mintPrice   = document.getElementById(`mintPriceInput_${userId}`)?.value.trim();
  const recoveryFee = document.getElementById(`recoveryFeeInput_${userId}`)?.value.trim();
  const maxBadge    = document.getElementById(`maxBadgeInput_${userId}`)?.value.trim();
  if (mintPrice === "" && recoveryFee === "" && maxBadge === "") { toast("ໃສ່ຄ່າກ່ອນ", "err"); return; }
  try {
    if (mintPrice !== "") {
      toast(` setCustomMintPrice ${mintPrice} LAB → ${shortenAddr(wallet)}`, "");
      const tx = await contract.setCustomMintPrice(wallet, ethers.parseEther(mintPrice));
      await tx.wait();
      toast(` Mint price ${mintPrice} LAB ລົງ contract ສຳເລັດ`, "ok");
    }
    if (recoveryFee !== "") {
      toast(` setCustomRecoveryFee ${recoveryFee} LAB → ${shortenAddr(wallet)}`, "");
      const tx = await contract.setCustomRecoveryFee(wallet, ethers.parseEther(recoveryFee));
      await tx.wait();
      toast(` Recovery fee ${recoveryFee} LAB ລົງ contract ສຳເລັດ`, "ok");
    }
    if (maxBadge !== "") {
      toast(` setCustomMaxBadge ${maxBadge} → ${shortenAddr(wallet)}`, "");
      const tx = await contract.setCustomMaxBadge(wallet, BigInt(maxBadge));
      await tx.wait();
      toast(` Max badge ${maxBadge === "0" ? "unlimited" : maxBadge} ລົງ contract ສຳເລັດ`, "ok");
    }
    // verify
    const [onChainPrice, onChainMax] = await Promise.all([
      getRC().getMintPriceFor(wallet),
      getRC().getMaxBadgeFor(wallet),
    ]);
    toast(` On-chain: price ${ethers.formatEther(onChainPrice)} LAB, max ${Number(onChainMax) === 0 ? "unlimited" : onChainMax}`, "ok");
  } catch (e) {
    toast(" " + (e.reason || e.message || "Failed"), "err");
  }
}

async function saveUserAll(userId, _walletArg) {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) { toast(" Login ກ່ອນ", "err"); return; }
  const maxBadge    = document.getElementById(`maxBadgeInput_${userId}`).value;
  const mintPrice   = document.getElementById(`mintPriceInput_${userId}`).value;
  const recoveryFee = document.getElementById(`recoveryFeeInput_${userId}`).value;
  const issuerLabel = document.getElementById(`issuerLabelInput_${userId}`).value.trim();

  try {
    await fetch(`${API_BASE_URL}/api/admin/set-max-badge`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, maxBadge: maxBadge === "" ? null : parseInt(maxBadge) }),
    });
    await fetch(`${API_BASE_URL}/api/admin/set-user-prices`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        mintPrice:   mintPrice   === "" ? null : mintPrice,
        recoveryFee: recoveryFee === "" ? null : recoveryFee,
        issuerLabel: issuerLabel === "" ? null : issuerLabel,
      }),
    });

    toast(` ບັນທຶກ User #${userId} ສຳເລັດ`, "ok");
    loadAllUsers();
  } catch (e) {
    toast(" " + e.message, "err");
  }
}

async function resetUserAll(userId, _walletArg) {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) { toast(" Login ກ່ອນ", "err"); return; }
  document.getElementById(`maxBadgeInput_${userId}`).value    = "";
  document.getElementById(`mintPriceInput_${userId}`).value   = "";
  document.getElementById(`recoveryFeeInput_${userId}`).value = "";
  document.getElementById(`issuerLabelInput_${userId}`).value = "";
  try {
    await fetch(`${API_BASE_URL}/api/admin/set-max-badge`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, maxBadge: null }),
    });
    await fetch(`${API_BASE_URL}/api/admin/set-user-prices`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, mintPrice: null, recoveryFee: null }),
    });
    toast(` Reset User #${userId} → Global`, "ok");
    loadAllUsers();
  } catch (e) {
    toast(" " + e.message, "err");
  }
}

// ============================================================
//  FORCE TRANSFER
// ============================================================
let ftBadges = [];
let ftSelected = new Set();

function ftClearStatus(side) {
  document.getElementById(side === "from" ? "ftFromStatus" : "ftToStatus").innerHTML = "";
}

function ftProfileBadge(prof) {
  if (Number(prof.userType) === 0) return `<span class="badge-chip chip-red">ບໍ່ໄດ້ລົງທະບຽນ</span>`;
  return prof.active
    ? `<span class="badge-chip chip-green">Active</span>`
    : `<span class="badge-chip chip-yellow">Deactivated</span> <span style="font-size:0.74rem;color:var(--muted);">(ຈະ auto-reactivate ເມື່ອ transfer)</span>`;
}

async function loadFtBadges() {
  const from = document.getElementById("ftFromAddr").value.trim();
  const to   = document.getElementById("ftToAddr").value.trim();
  if (!isAddr(from)) { showStatus("ftStatus","err","ໃສ່ wallet ຕົ້ນທາງ"); return; }
  if (!isAddr(to))   { showStatus("ftStatus","err","ໃສ່ wallet ປາຍທາງ"); return; }
  if (from.toLowerCase() === to.toLowerCase()) { showStatus("ftStatus","err","Wallet ຕ້ອງຕ່າງກັນ"); return; }

  showStatus("ftStatus","info"," ກຳລັງໂຫຼດ...");
  document.getElementById("ftSelectSection").style.display = "none";
  ftBadges = []; ftSelected.clear();

  try {
    // ດຶງ profile ທັງສອງ wallet
    const rc = getRC();
    const [fromProf, toProf, ids] = await Promise.all([
      rc.getProfile(from),
      rc.getProfile(to),
      rc.getBadgesOf(from),
    ]);

    // ສະແດງ status ທັງສອງ wallet
    document.getElementById("ftFromStatus").innerHTML =
      `ສະຖານະ: ${ftProfileBadge(fromProf, from)} &nbsp; NFT: <strong>${ids.length} ໃບ</strong>`;
    document.getElementById("ftToStatus").innerHTML =
      `ສະຖານະ: ${ftProfileBadge(toProf, to)}`;

    if (ids.length === 0) { showStatus("ftStatus","err","ບໍ່ພົບ NFT ໃນ wallet ຕົ້ນທາງ"); return; }

    // ເຕືອນຖ້າ wallet ປາຍທາງ inactive
    if (Number(toProf.userType) === 0) {
      showStatus("ftStatus","err"," Wallet ປາຍທາງຍັງບໍ່ໄດ້ລົງທະບຽນ — transfer ຈະ fail");
      return;
    }
    if (!toProf.active) {
      showStatus("ftStatus","err"," Wallet ປາຍທາງຖືກ deactivate — ກົດ Reactivate ກ່ອນ transfer");
    } else {
      showStatus("ftStatus","info",`ໂຫຼດ NFT ${ids.length} ໃບ ສຳເລັດ`);
    }

    const rows = await Promise.all([...ids].map(async (id) => {
      const [b, uri] = await Promise.all([
        rc.badges(id),
        rc.tokenURI(id).catch(() => null),
      ]);
      return { id: Number(id), name: b.badgeName, activity: b.activity, uri };
    }));
    ftBadges = rows;

    const grid = document.getElementById("ftGrid");
    grid.innerHTML = "";
    rows.forEach(b => {
      const row = document.createElement("div");
      row.id = `ftRow_${b.id}`;
      row.onclick = () => ftToggle(b.id);
      row.style.cssText = "display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;border-radius:10px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;transition:all 0.15s;user-select:none;";
      row.innerHTML = `
        <div style="width:20px;height:20px;border-radius:5px;border:2px solid rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:transparent;flex-shrink:0;transition:all 0.15s;" id="ftChk_${b.id}"></div>
        <div id="ftThumb_${b.id}" class="badge-thumb-wrap" style="width:40px;height:40px;flex-shrink:0;"><div class="badge-thumb-loading" style="width:36px;height:36px;"></div></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.86rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.name}</div>
          <div style="font-size:0.74rem;color:var(--muted);">#${b.id} — ${b.activity}</div>
        </div>`;
      grid.appendChild(row);
      ftSelected.add(b.id);
      ftApplyStyle(b.id, true);
      if (b.uri) fetchBadgeThumb(`ftThumb_${b.id}`, b.uri);
    });

    document.getElementById("ftToDisplay").textContent = shortenAddr(to);
    document.getElementById("ftSelectSection").style.display = "block";
    ftUpdateCount();
  } catch (e) {
    showStatus("ftStatus","err", e.reason || e.message);
  }
}


function ftToggle(id) {
  if (ftSelected.has(id)) { ftSelected.delete(id); ftApplyStyle(id, false); }
  else { ftSelected.add(id); ftApplyStyle(id, true); }
  ftUpdateCount();
}
function ftApplyStyle(id, on) {
  const row = document.getElementById(`ftRow_${id}`);
  const chk = document.getElementById(`ftChk_${id}`);
  if (!row || !chk) return;
  row.style.borderColor = on ? "rgba(15,111,179,0.5)" : "var(--border)";
  row.style.background  = on ? "rgba(15,111,179,0.08)" : "var(--surface2)";
  chk.style.background  = on ? "rgba(15,111,179,0.7)" : "transparent";
  chk.style.borderColor = on ? "var(--violet)" : "rgba(0,0,0,0.15)";
  chk.style.color       = on ? "#fff" : "transparent";
}
function ftSelectAll()   { ftBadges.forEach(b => { ftSelected.add(b.id); ftApplyStyle(b.id, true); }); ftUpdateCount(); }
function ftDeselectAll() { ftBadges.forEach(b => { ftSelected.delete(b.id); ftApplyStyle(b.id, false); }); ftUpdateCount(); }
function ftUpdateCount() {
  document.getElementById("ftCount").textContent = ftSelected.size + " ໃບ";
  document.getElementById("ftExecBtn").disabled = ftSelected.size === 0;
}

async function executeFt() {
  const from = document.getElementById("ftFromAddr").value.trim();
  const to   = document.getElementById("ftToAddr").value.trim();
  const tokenIds = [...ftSelected];
  if (!tokenIds.length) return;
  const ok = await adminConfirm({
    title: `Force Transfer ${tokenIds.length} NFT`,
    html: `ຈາກ ${shortenAddr(from)}\nໄປ ${shortenAddr(to)}\n\nAction ນີ້ບໍ່ສາມາດ undo ໄດ້`,
    danger: true,
  });
  if (!ok) return;

  const btn = document.getElementById("ftExecBtn");
  btn.disabled = true;

  try {
    // 1. ກວດ destination wallet — ຖ້າ deactivated ໃຫ້ auto-reactivate
    const toProf = await getRC().getProfile(to);
    if (Number(toProf.userType) === 0) {
      showStatus("ftStatus","err"," Wallet ປາຍທາງຍັງບໍ່ໄດ້ລົງທະບຽນ — ບໍ່ສາມາດ transfer ໄດ້");
      btn.disabled = false; return;
    }
    if (!toProf.active) {
      showStatus("ftStatus","info",` Wallet ປາຍທາງ Deactivated — ກຳລັງ auto-reactivate...`);
      const rxTx = await contract.reactivateWallet(to, { gasLimit: 200000n });
      showStatus("ftStatus","info",` ລໍຖ້າ reactivate confirm...\nTx: ${rxTx.hash}`);
      await rxTx.wait();
      addLog(`Reactivate ${shortenAddr(to)}`, rxTx.hash, true);
      showStatus("ftStatus","info"," Reactivate ສຳເລັດ — ກຳລັງ transfer NFT...");
    } else {
      showStatus("ftStatus","info"," ກຳລັງ transfer NFT...");
    }

    // 2. Force transfer
    const tx = await contract.adminForceRecover(from, to, tokenIds, { gasLimit: 500000n });
    showStatus("ftStatus","info",` ລໍຖ້າ confirm...\nTx: ${tx.hash}`);
    await tx.wait();

    showStatus("ftStatus","ok",` Force transfer ${tokenIds.length} NFT ສຳເລັດ!\nTx: ${tx.hash}`);
    toast(` Transfer ${tokenIds.length} NFT ສຳເລັດ`, "ok");
    addLog(`Force transfer ${tokenIds.length} NFT: ${shortenAddr(from)} → ${shortenAddr(to)}`, tx.hash, true);

    // reset
    ftBadges = []; ftSelected.clear();
    document.getElementById("ftSelectSection").style.display = "none";
    document.getElementById("ftFromStatus").innerHTML = "";
    document.getElementById("ftToStatus").innerHTML = "";

  } catch (e) {
    const msg = e.reason || e.message || "Transfer failed";
    showStatus("ftStatus","err"," " + msg);
    toast(" " + msg.slice(0,80), "err");
    addLog(" Force transfer: " + msg.slice(0,60), null, false);
  }
  btn.disabled = false;
}

// ============================================================
//  BLACKLIST
// ============================================================
async function setBlacklist(status) {
  const addr = document.getElementById("blacklistAddr").value.trim();
  if (!isAddr(addr)) { showStatus("blacklistStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  await sendTx("blacklistStatus", () => contract.setBlacklist(addr, status),
    status ? `Blacklisted ${shortenAddr(addr)}` : `Unblacklisted ${shortenAddr(addr)}`);
  // ກວດຢືນຢັນ on-chain ທັນທີ
  try {
    const actual = await getRC().blacklisted(addr);
    if (status && !actual) showStatus("blacklistStatus","err"," Transaction ສຳເລັດ ແຕ່ on-chain ຍັງ false — ກວດສອບ wallet permission");
  } catch (_) {}
}

async function checkBlacklist() {
  const addr = document.getElementById("checkBlacklistAddr").value.trim();
  if (!isAddr(addr)) { showStatus("checkBlacklistResult","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  try {
    const bl = await getRC().blacklisted(addr);
    showStatus("checkBlacklistResult", bl ? "err" : "ok",
      bl ? ` ${shortenAddr(addr)} ຖືກ Blacklist ຢູ່` : ` ${shortenAddr(addr)} ບໍ່ໄດ້ຢູ່ໃນ Blacklist`);
  } catch (e) {
    showStatus("checkBlacklistResult","err",e.message);
  }
}

// ============================================================
//  MINT
// ============================================================
async function mintBadge() {
  const student  = document.getElementById("mintStudent").value.trim();
  const name     = document.getElementById("mintName").value.trim();
  const activity = document.getElementById("mintActivity").value.trim();
  const uri      = document.getElementById("mintURI").value.trim() || "ipfs://placeholder";
  const isTr     = document.getElementById("mintTransferable").checked;

  if (!isAddr(student)) { showStatus("mintStatus","err","Wallet address ບໍ່ຖືກຕ້ອງ"); return; }
  if (!name || !activity) { showStatus("mintStatus","err","ໃສ່ຊື່ ແລະ Activity"); return; }

  const price = await getRC().mintPrice();
  await sendTx("mintStatus",
    () => contract.mintBadge(student, name, activity, uri, isTr, { value: price, gasLimit: 300000n }),
    "Mint ສຳເລັດ!"
  );
}

async function batchMintBadge() {
  const raw      = document.getElementById("batchAddrs").value.trim();
  const students = raw.split("\n").map(s => s.trim()).filter(s => s.length > 0);
  const name     = document.getElementById("batchName").value.trim();
  const activity = document.getElementById("batchActivity").value.trim();
  const uri      = document.getElementById("batchURI").value.trim() || "ipfs://placeholder";
  const isTr     = document.getElementById("batchTransferable").checked;

  if (students.length === 0) { showStatus("batchMintStatus","err","ໃສ່ wallet ຢ່າງໜ້ອຍ 1"); return; }
  const invalid = students.filter(a => !isAddr(a));
  if (invalid.length > 0) { showStatus("batchMintStatus","err","Address ບໍ່ຖືກ: " + invalid[0]); return; }
  if (!name || !activity) { showStatus("batchMintStatus","err","ໃສ່ຊື່ ແລະ Activity"); return; }

  const price = await getRC().mintPrice();
  const total = price * BigInt(students.length);
  await sendTx("batchMintStatus",
    () => contract.batchMintBadge(students, name, activity, uri, isTr, { value: total }),
    `Batch Mint ${students.length} ໃບ ສຳເລັດ!`
  );
}

// ============================================================
//  BADGES
// ============================================================
// ============================================================
//  ADMIN PINATA UPLOAD
// ============================================================
// PINATA_GATEWAY ໂຫຼດຈາກ contract.config.js

async function saveGlobalPinataJWT() {
  const jwtVal = document.getElementById("globalPinataJWTInput").value.trim();
  if (!jwtVal || !jwtVal.startsWith("eyJ")) {
    showStatus("globalPinataStatus","err"," JWT ບໍ່ຖືກຕ້ອງ (ຕ້ອງຂຶ້ນຕົ້ນດ້ວຍ eyJ...)"); return;
  }
  const token = localStorage.getItem("authToken");
  if (!token) { showStatus("globalPinataStatus","err"," ກະລຸນາ Login ກ່ອນ"); return; }
  showStatus("globalPinataStatus","info"," ກຳລັງບັນທຶກ...");
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/pinata_jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value: jwtVal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Save failed");
    showStatus("globalPinataStatus","ok"," ບັນທຶກ Pinata JWT ສຳເລັດ — ທຸກ User ຈະ Upload ຮູບໄດ້ທັນທີ");
    document.getElementById("pinataJWTConfigStatus").innerHTML =
      `<span style="color:var(--text-success);"> Pinata JWT ຕັ້ງໄວ້ໃນ DB ແລ້ວ</span>`;
    document.getElementById("globalPinataJWTInput").value = "";
    toast(" Pinata JWT saved to DB", "ok");
  } catch (e) {
    showStatus("globalPinataStatus","err"," " + e.message);
  }
}

let cachedAdminPinataJWT = "";

function adminGetJWT() {
  return cachedAdminPinataJWT;
}

function adminPreviewFile(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById("adminImgFileName").textContent = file.name;
  document.getElementById("adminUploadBtn").disabled = false;
}

async function adminUploadImage() {
  const jwt  = adminGetJWT();
  if (!jwt) { toast("ໃສ່ Pinata JWT ກ່ອນ", "err"); return; }
  const file = document.getElementById("adminImgFile").files[0];
  if (!file) { toast("ເລືອກຮູບກ່ອນ", "err"); return; }

  const id       = document.getElementById("updateTokenId").value;
  const name     = document.getElementById("updateBadgeName").value.trim() || "Badge";
  const activity = document.getElementById("updateActivity").value.trim() || "";
  const btn      = document.getElementById("adminUploadBtn");
  btn.disabled   = true;
  btn.innerHTML  = 'Uploading...';
  showStatus("adminUploadStatus","info"," (1/2) ກຳລັງ upload ຮູບ...");

  try {
    // 1. Upload image
    const formData = new FormData();
    formData.append("file", file);
    const imgRes  = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
    });
    const imgData = await imgRes.json();
    if (!imgData.IpfsHash) throw new Error("Upload image failed: " + JSON.stringify(imgData));

    showStatus("adminUploadStatus","info"," (2/2) ສ້າງ metadata JSON...");

    // 2. Upload metadata JSON — preserve original fields, override only changed ones
    const description = document.getElementById("updateDescription")?.value.trim() || activity;
    const baseAttrs = currentBadgeMeta?.attributes || [];
    const mergedAttrs = [
      ...baseAttrs.filter(a => a.trait_type !== "Activity"),
      { trait_type: "Activity", value: activity },
    ];
    // ຮັກສາ sender ໃນ description
    const senderAttrImg = baseAttrs.find(a => a.trait_type === "ຜູ້ສົ່ງ");
    const descWithSenderImg = senderAttrImg?.value ? `${description}\nຜູ້ສົ່ງ: ${senderAttrImg.value}` : description;
    const metadata = {
      ...currentBadgeMeta,
      name,
      description: descWithSenderImg,
      image: `ipfs://${imgData.IpfsHash}`,
      attributes: mergedAttrs,
    };
    const jsonRes  = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ pinataMetadata: { name: `badge_${id}.json` }, pinataContent: metadata }),
    });
    const jsonData = await jsonRes.json();
    if (!jsonData.IpfsHash) throw new Error("Upload JSON failed");

    const tokenURI = `${PINATA_GATEWAY}${jsonData.IpfsHash}`;
    document.getElementById("updateTokenURI").value = tokenURI;

    // อัปเดต currentBadgeMeta ให้มีรูปใหม่ — ป้องกัน updateBadge() ใช้รูปเก่า
    currentBadgeMeta = metadata;

    // Preview new image
    const preview = document.getElementById("updateImgPreview");
    const img     = document.getElementById("updateImgCurrent");
    img.src = `${PINATA_GATEWAY}${imgData.IpfsHash}`;
    preview.style.display = "block";

    showStatus("adminUploadStatus","ok",` Upload ສຳເລັດ!\nImage CID: ${imgData.IpfsHash}\nJSON CID:  ${jsonData.IpfsHash}`);
    toast(" Upload ສຳເລັດ — Token URI auto-filled", "ok");
  } catch (e) {
    showStatus("adminUploadStatus","err"," " + e.message);
    toast("Upload failed", "err");
  } finally {
    btn.disabled  = false;
    btn.innerHTML = 'Upload → IPFS';
  }
}

function clearUpdateFields() {
  ["updateBadgeName","updateActivity","updateTokenURI","updateIssuedTo","updateDescription"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  document.getElementById("updateBadgeBtn").disabled = true;
  document.getElementById("updateBadgeStatus").className = "status-msg";
}

async function fetchIpfsMeta(uri) {
  if (!uri || uri.includes("placeholder")) return null;
  const gateways = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
  ];
  const cid = uri.startsWith("ipfs://") ? uri.slice(7) : uri.split("/ipfs/")[1] || uri;
  for (const gw of gateways) {
    try {
      const res = await fetch(gw + cid, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.json();
    } catch (_) {}
  }
  return null;
}

function adminImgFallback(el) {
  const tried = el.dataset.gwTried ? el.dataset.gwTried.split(",") : [];
  const fallbacks = ["https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/"];
  const src = el.src || "";
  const ipfsIdx = src.indexOf("/ipfs/");
  const cid = ipfsIdx > -1 ? src.slice(ipfsIdx + 6) : null;
  if (!cid) { el.style.display = "none"; return; }
  const next = fallbacks.find(gw => !tried.includes(gw));
  if (next) {
    el.dataset.gwTried = [...tried, next].join(",");
    el.src = next + cid;
  } else {
    el.style.display = "none";
  }
}

async function fetchBadgeForUpdate() {
  const id = document.getElementById("updateTokenId").value;
  if (id === "") { showStatus("updateBadgeStatus","err","ໃສ່ Token ID ກ່ອນ"); return; }
  showStatus("updateBadgeStatus","info"," ກຳລັງດຶງຂໍ້ມູນ...");
  try {
    const [badge, uri] = await Promise.all([
      contract.badges(Number(id)),
      contract.tokenURI(Number(id)).catch(() => ""),
    ]);

    // ດຶງ metadata JSON ຈາກ IPFS ແລ້ວເກັບໄວ້ໃຊ້ຕອນ update
    currentBadgeMeta = null;
    let meta = null;
    if (uri) {
      showStatus("updateBadgeStatus","info"," ກຳລັງດຶງ metadata ຈາກ IPFS...");
      meta = await fetchIpfsMeta(uri);
      currentBadgeMeta = meta;
    }

    // fill on-chain fields
    document.getElementById("updateBadgeName").value = badge.badgeName;
    document.getElementById("updateActivity").value  = badge.activity;
    document.getElementById("updateTokenURI").value  = uri;
    document.getElementById("updateIssuedTo").value  = badge.issuedTo;

    // fill metadata fields — strip "ຜູ້ສົ່ງ:" suffix before showing in input
    const descEl = document.getElementById("updateDescription");
    if (descEl) {
      let cleanDesc = meta?.description || "";
      const senderIdx = cleanDesc.indexOf("ຜູ້ສົ່ງ:");
      if (senderIdx > -1) {
        const nlIdx  = cleanDesc.lastIndexOf("\n", senderIdx);
        const dshIdx = cleanDesc.lastIndexOf("—", senderIdx);
        const sepIdx = Math.max(nlIdx, dshIdx);
        cleanDesc = sepIdx > -1 ? cleanDesc.slice(0, sepIdx).trim() : cleanDesc.slice(0, senderIdx).trim();
      }
      descEl.value = cleanDesc;
    }

    // preview image
    const preview = document.getElementById("updateImgPreview");
    const img     = document.getElementById("updateImgCurrent");
    if (meta?.image) {
      const imgCid = meta.image.startsWith("ipfs://") ? meta.image.slice(7) : meta.image.split("/ipfs/")[1];
      img.dataset.gwTried = "";
      img.src = imgCid ? PINATA_GATEWAY + imgCid : meta.image;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }

    document.getElementById("updateBadgeBtn").disabled = false;
    showStatus("updateBadgeStatus","ok",
      ` Token #${id} — ${badge.badgeName}` +
      (meta ? `\nDescription: ${descEl?.value || "—"}` : "\n ດຶງ IPFS metadata ບໍ່ໄດ້")
    );
  } catch (e) {
    showStatus("updateBadgeStatus","err", " ບໍ່ພົບ Token #" + id + " : " + e.message);
  }
}

async function updateBadge() {
  const id   = document.getElementById("updateTokenId").value;
  const name = document.getElementById("updateBadgeName").value.trim();
  const act  = document.getElementById("updateActivity").value.trim();
  let   uri  = document.getElementById("updateTokenURI").value.trim();
  const desc = document.getElementById("updateDescription")?.value.trim() || "";

  if (id === "" || !name || !act || !uri) {
    showStatus("updateBadgeStatus","err","ໃສ່ຂໍ້ມູນໃຫ້ຄົບ"); return;
  }
  if (!contract) { toast("ເຊື່ອມຕໍ່ wallet ກ່ອນ","err"); return; }

  const jwt = adminGetJWT();
  let finalMeta = currentBadgeMeta;

  // ຖ້າ description ຖືກໃສ່ → re-upload JSON ໃໝ່ (ຮູບເກົ່າ)
  if (desc) {
    showStatus("updateBadgeStatus","info"," ກຳລັງ upload metadata ໃໝ່ (description ປ່ຽນ)...");
    try {
      const cachedMeta = currentBadgeMeta || await fetchIpfsMeta(uri);
      const imageField = cachedMeta?.image || "";

      if (!jwt) {
        showStatus("updateBadgeStatus","err"," ໃສ່ Pinata JWT ກ່ອນ — ຕ້ອງໃຊ້ upload metadata ໃໝ່");
        return;
      }

      const baseAttrs = cachedMeta?.attributes || [];
      const mergedAttrs = [
        ...baseAttrs.filter(a => a.trait_type !== "Activity"),
        { trait_type: "Activity", value: act },
      ];
      const senderAttr = baseAttrs.find(a => a.trait_type === "ຜູ້ສົ່ງ");
      const descWithSender = senderAttr?.value ? `${desc}\nຜູ້ສົ່ງ: ${senderAttr.value}` : desc;
      finalMeta = { ...cachedMeta, name, description: descWithSender, image: imageField, attributes: mergedAttrs };

      const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          pinataMetadata: { name: `badge_${id}_updated.json` },
          pinataContent: finalMeta,
        }),
      });
      const jsonData = await jsonRes.json();
      if (!jsonData.IpfsHash) throw new Error("Upload JSON failed");
      uri = `${PINATA_GATEWAY}${jsonData.IpfsHash}`;
      document.getElementById("updateTokenURI").value = uri;
      showStatus("updateBadgeStatus","info",` JSON ໃໝ່: ${jsonData.IpfsHash}\nກຳລັງ update on-chain...`);
    } catch (e) {
      showStatus("updateBadgeStatus","err"," Upload metadata failed: " + e.message);
      return;
    }
  }

  // Inline tx — ຕ້ອງການ sync currentBadgeMeta ຫຼັງ success
  showStatus("updateBadgeStatus","info"," ກຳລັງສົ່ງ transaction...");
  try {
    const tx = await contract.updateBadge(Number(id), name, act, uri);
    showStatus("updateBadgeStatus","info",` ລໍຖ້າ confirm...\nTx: ${tx.hash}`);
    await tx.wait();

    // Sync state ຫຼັງ success
    currentBadgeMeta = finalMeta;
    const descEl = document.getElementById("updateDescription");
    if (descEl) descEl.value = "";   // description ຖືກ apply ໄປ IPFS ແລ້ວ — ລ້າງເພື່ອບໍ່ double-upload

    addLog(`updateBadge #${id}: ${name}`, tx.hash, true);
    showStatus("updateBadgeStatus","ok",` Update Token #${id} ສຳເລັດ\nTx: ${tx.hash}`);
    toast(` Update Token #${id} ສຳເລັດ`, "ok");
  } catch (e) {
    const isRevert = e.code === "CALL_EXCEPTION" || (e.message||"").includes("execution reverted");
    showStatus("updateBadgeStatus","err", isRevert ? (e.reason || "Transaction reverted") : e.message);
    addLog(`updateBadge #${id} failed`, null, false);
  }
}

async function setTransferable(status) {
  const id = document.getElementById("transferableTokenId").value;
  if (id === "") { showStatus("transferableStatus","err","ໃສ່ Token ID"); return; }
  await sendTx("transferableStatus",
    () => contract.setTransferable(Number(id), status),
    `Token #${id} transferable = ${status}`
  );
}

async function revokeBadge() {
  const id = document.getElementById("revokeTokenId").value;
  if (id === "") { showStatus("revokeStatus","err","ໃສ່ Token ID"); return; }
  const ok = await adminConfirm({
    title: `Burn Token #${id}?`,
    html: "ບໍ່ສາມາດ undo ໄດ້",
    danger: true,
    confirmText: "Burn",
  });
  if (!ok) return;
  await sendTx("revokeStatus", () => contract.revokeBadge(Number(id)), `Token #${id} ຖືກ Burn ແລ້ວ`);
}

async function getURIHistory() {
  const id = document.getElementById("historyTokenId").value;
  if (id === "") { showStatus("uriHistoryResult","err","ໃສ່ Token ID"); return; }
  try {
    const hist = await getRC().getTokenURIHistory(Number(id));
    if (hist.length === 0) { showStatus("uriHistoryResult","info","ຍັງບໍ່ມີ URI history (URI ຍັງບໍ່ຖືກ update)"); return; }
    showStatus("uriHistoryResult","info", "URI History:\n" + hist.map((u,i)=>`[${i}] ${u}`).join("\n"));
  } catch (e) {
    showStatus("uriHistoryResult","err", e.reason || e.message);
  }
}

// ============================================================
//  SETTINGS
// ============================================================
async function togglePause() {
  const status = document.getElementById("pauseToggle").checked;
  await sendTx(null, () => contract.pauseMinting(status),
    status ? " Minting Paused" : " Minting Resumed");
  const banner = document.getElementById("pauseBanner");
  status ? banner.classList.add("show") : banner.classList.remove("show");
}

async function setMintPrice() {
  const val = document.getElementById("newMintPrice").value.trim();
  if (!val) { showStatus("mintPriceStatus","err","ໃສ່ລາຄາ (LAB) ເຊັ່ນ 0.05"); return; }
  await sendTx("mintPriceStatus",
    () => contract.setMintPrice(ethers.parseEther(val)),
    `Mint price ຕັ້ງເປັນ ${val} LAB`
  );
  loadDashboard();
}

async function setRecoveryFee() {
  const val = document.getElementById("newRecoveryFee").value.trim();
  if (!val) { showStatus("recoveryFeeStatus","err","ໃສ່ fee (LAB) ເຊັ່ນ 0.05"); return; }
  await sendTx("recoveryFeeStatus",
    () => contract.setRecoveryFee(ethers.parseEther(val)),
    `Recovery fee ຕັ້ງເປັນ ${val} LAB`
  );
  loadDashboard();
}

async function setMaxBadge() {
  const val = document.getElementById("newMaxBadge").value;
  if (val === "") { showStatus("maxBadgeStatus","err","ໃສ່ຄ່າ"); return; }
  await sendTx("maxBadgeStatus",
    () => contract.setMaxBadgePerUser(BigInt(val)),
    `Max badge/user = ${val === "0" ? "unlimited" : val}`
  );
  loadDashboard();
}

async function setFundsReceiver() {
  const addr = document.getElementById("newFundsReceiver").value.trim();
  if (!isAddr(addr)) { showStatus("fundsReceiverStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  const ok = await adminConfirm({
    title: "ຜູ້ຮັບເງິນ ?",
    html: `ເງິນໃນ contract ທັງໝົດຈະໄປຫາ ${addr}`,
    icon: "question",
  });
  if (!ok) return;
  await sendTx("fundsReceiverStatus",
    () => contract.setFundsReceiver(addr),
    "Funds Receiver ອັບເດດແລ້ວ"
  );
  refreshBalance();
}

async function transferOwnership() {
  const addr = document.getElementById("newOwnerAddr").value.trim();
  if (!isAddr(addr)) { showStatus("ownershipStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  const ok = await adminConfirm({
    title: `ໂອນ Ownership ໄປ ${shortenAddr(addr)}?`,
    html: "ທ່ານຈະສູນເສຍສິດ Owner ທັນທີ ແລະ ບໍ່ສາມາດຍ້ອນກັບໄດ້!",
    danger: true,
    confirmText: "ໂອນ Ownership",
  });
  if (!ok) return;
  await sendTx("ownershipStatus",
    () => contract.transferOwnership(addr),
    "Ownership ໂອນສຳເລັດ — ທ່ານບໍ່ແມ່ນ Owner ອີກຕໍ່ໄປ"
  );
}


async function setOperator(status) {
  const addr = document.getElementById("operatorAddr").value.trim();
  if (!isAddr(addr)) { showStatus("operatorStatus","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  const action = status ? "ເພີ່ມ" : "ຖອດ";
  const ok = await adminConfirm({
    title: `${action} Operator?`,
    html: shortenAddr(addr),
    icon: status ? "question" : "warning",
    danger: !status,
  });
  if (!ok) return;
  await sendTx("operatorStatus",
    () => contract.setOperator(addr, status),
    status ? ` ເພີ່ມ ${shortenAddr(addr)} ເປັນ Operator ແລ້ວ` : ` ຖອດ ${shortenAddr(addr)} ອອກຈາກ Operator ແລ້ວ`
  );
}

async function checkOperator() {
  const addr = document.getElementById("checkOperatorAddr").value.trim();
  if (!isAddr(addr)) { showStatus("checkOperatorResult","err","Address ບໍ່ຖືກຕ້ອງ"); return; }
  try {
    const isOp = await getRC().operators(addr);
    showStatus("checkOperatorResult",
      isOp ? "ok" : "warn",
      isOp
        ? ` ${shortenAddr(addr)} ແມ່ນ Operator`
        : ` ${shortenAddr(addr)} ບໍ່ໄດ້ເປັນ Operator`
    );
  } catch (e) {
    showStatus("checkOperatorResult","err","ເກີດຂໍ້ຜິດພາດ: " + e.message);
  }
}

// ============================================================
//  FUNDS
// ============================================================
async function withdrawFunds() {
  await sendTx("fundsStatus", () => contract.withdrawFunds(), "Withdraw ສຳເລັດ!");
  refreshBalance();
}

// ============================================================
//  HELPERS
// ============================================================
async function sendTx(statusId, txFn, successMsg) {
  if (!contract) { toast("ເຊື່ອມຕໍ່ wallet ກ່ອນ", "err"); return; }
  if (statusId) showStatus(statusId, "info", " ກຳລັງສົ່ງ transaction...");
  try {
    const tx = await txFn();
    if (statusId) showStatus(statusId, "info", ` ລໍຖ້າ confirm...\nTx: ${tx.hash}`);
    await tx.wait();
    const msg = successMsg || " ສຳເລັດ!";
    if (statusId) showStatus(statusId, "ok", " " + msg + `\nTx: ${tx.hash}`);
    toast(msg, "ok");
    addLog(msg, tx.hash, true); 
  } catch (e) {
    const msg = e.reason || e.shortMessage || e.message || "Transaction failed";
    if (statusId) showStatus(statusId, "err", " " + msg);
    toast(" " + msg, "err");
    addLog(" " + (successMsg || "Tx") + ": " + msg, null, false);
  }
}

function showStatus(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = "status-msg show " + type;
  el.textContent = msg;
}

function showSection(name, el) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById("sec-" + name).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  if (el) el.classList.add("active");
  const titles = {
    dashboard:"Dashboard", users:"User Management",
    blacklist:"Blacklist", mint:"Mint Badge",
    badges:"Manage Badges", settings:"Settings", funds:"Funds",
    txlog:"Transaction Log", userlimits:"User Limits",
    operators:"Operators", tickets:"Support Tickets", support:"Support Staff"
  };
  document.getElementById("pageTitle").textContent = titles[name] || name;
  if (name === 'tickets') loadTickets();
  if (name === 'support') loadSupportSection();
  if (name === 'txlog') loadTxLogFromDB(0);
  if (name === 'settings') {
    const statusEl = document.getElementById("pinataJWTConfigStatus");
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--muted);"> ກຳລັງກວດສອບ...</span>`;
      fetch(`${API_BASE_URL}/api/settings/pinata_jwt`)
        .then(r => r.json())
        .then(d => {
          statusEl.innerHTML = d.value
            ? `<span style="color:var(--text-success);"> Pinata JWT ຕັ້ງໄວ້ໃນ DB ແລ້ວ</span>`
            : `<span style="color:var(--text-danger);"> Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງ — user ຈະ Mint ໂດຍບໍ່ມີຮູບ</span>`;
        })
        .catch(() => { statusEl.innerHTML = `<span style="color:var(--text-danger);"> ດຶງຂໍ້ມູນ API ບໍ່ໄດ້</span>`; });
    }
  }
}

function isAddr(a) { return a && a.startsWith("0x") && a.length === 42; }

window.addEventListener("load", () => {
  // โหลด Pinata JWT จาก DB (global) สำหรับใช้ upload รูป/metadata ใน Update Badge
  fetch(`${API_BASE_URL}/api/settings/pinata_jwt`)
    .then(r => r.json())
    .then(d => { cachedAdminPinataJWT = d.value || ""; })
    .catch(() => {});

  // ถ้า login แล้ว enable MetaMask button ทันที
  const token = localStorage.getItem("authToken");
  if (token) {
    const loginBtn = document.getElementById("adminLoginBtn");
    const loginMsg = document.getElementById("loginMsg");
    const walletBtn = document.getElementById("overlayConnectBtn");
    const loginSection = document.getElementById("loginSection");
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) logoutBtn.style.display = "inline-flex";
    if (loginBtn) { loginBtn.textContent = " Already Logged in"; loginBtn.disabled = true; }
    if (loginMsg) {
      loginMsg.style.cssText = "display:block;background:rgba(34,197,94,0.1);color:var(--text-success);border:1px solid rgba(34,197,94,0.25);padding:0.4rem 0.75rem;border-radius:8px;font-size:0.82rem;margin-top:0.5rem;";
      loginMsg.textContent = " Session ມີຢູ່ — Connect Wallet ໄດ້ເລີຍ";
    }
    if (walletBtn) {
      walletBtn.disabled = false;
      walletBtn.style.cssText = "width:100%;padding:0.75rem;border-radius:12px;border:1px solid rgba(15,111,179,0.5);background:rgba(15,111,179,0.2);color:var(--text-info);font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'Outfit',sans-serif;opacity:1;";
    }
    if (loginSection) loginSection.style.opacity = "0.6";

    //  ຖ້າ wallet ນີ້ເຄີຍ connect ໄວ້ແລ້ວ (site ໄດ້ຮັບອະນຸຍາດ) — reconnect ອັດຕະໂນມັດ ບໍ່ຕ້ອງກົດໃໝ່
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
        if (accounts && accounts.length > 0) connectWallet();
      }).catch(() => {});
    }
  }
});
function shortenAddr(a) { return a.slice(0,6)+"..."+a.slice(-4); }

function toast(msg, type="") {
  const el = document.getElementById("toast");
  el.textContent = msg; el.className = "toast " + type + " show";
  setTimeout(() => el.classList.remove("show"), 3500);
}

// ============================================================
//  SUPPORT TICKETS
// ============================================================
const TICKETS_API = '../support/tickets_api.php';
let _allTickets = [];
let _activeTicketId = null;
let _ticketFilter = 'all';

function tkH() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}` };
}

async function loadTickets() {
  try {
    const res  = await fetch(TICKETS_API + '?action=list', { headers: tkH() });
    const data = await res.json();
    if (!data.ok) { toast('ໂຫຼດ Tickets ບໍ່ສຳເລັດ', 'err'); return; }

    _allTickets = data.tickets || [];
    const s = data.stats || {};
    document.getElementById('tkStatTotal').textContent   = s.total   ?? 0;
    document.getElementById('tkStatNew').textContent     = s.new     ?? 0;
    document.getElementById('tkStatReplied').textContent = s.replied ?? 0;

    // sidebar badge
    const badge = document.getElementById('ticketBadge');
    if ((s.new ?? 0) > 0) { badge.textContent = s.new; badge.style.display = 'inline-block'; }
    else { badge.style.display = 'none'; }

    renderTickets();
  } catch (e) {
    document.getElementById('tkList').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-danger);font-size:0.85rem;">ໂຫຼດ Tickets ບໍ່ສຳເລັດ</div>';
  }
}

function renderTickets() {
  const list = _ticketFilter === 'all'
    ? _allTickets
    : _allTickets.filter(t => t.status === _ticketFilter);

  if (!list.length) {
    document.getElementById('tkList').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--muted);font-size:0.85rem;">ບໍ່ມີ Ticket ໃນໝວດນີ້</div>';
    return;
  }

  const typeIcons = { wallet:'Wallet', mint:'Badge', transfer:'Transfer', contract:'Contract', account:'Account', other:'Other' };
  const html = list.map(t => {
    const d    = new Date(t.created_at * 1000);
    const time = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'});
    const icon = typeIcons[t.type] || '';
    const preview = (t.msg || '').slice(0, 80) + ((t.msg||'').length > 80 ? '…' : '');
    return `<div class="tk-row" onclick="openTicket('${t.id}')">
      <div class="tk-dot ${t.status}"></div>
      <div class="tk-meta">
        <div class="tk-name">${escHtml(t.name)} <span style="color:var(--muted);font-weight:400;font-size:0.76rem;">&lt;${escHtml(t.email)}&gt;</span></div>
        <div class="tk-info">${icon} ${escHtml(t.type_label || t.type)}${t.wallet ? ' · <span style="font-family:monospace;font-size:0.73rem;">'+t.wallet.slice(0,8)+'…</span>' : ''}</div>
        <div class="tk-msg">${escHtml(preview)}</div>
      </div>
      <div class="tk-time">${time}</div>
    </div>`;
  }).join('');
  document.getElementById('tkList').innerHTML = html;
}

function filterTickets(f, btn) {
  _ticketFilter = f;
  document.querySelectorAll('.tk-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTickets();
  closeTicketDetail();
}

async function openTicket(id) {
  const t = _allTickets.find(x => x.id === id);
  if (!t) return;
  _activeTicketId = id;

  // mark read
  if (t.status === 'new') {
    await fetch(TICKETS_API, { method:'POST', headers: tkH(),
      body: JSON.stringify({ action:'read', id }) });
    t.status = 'read';
    renderTickets();
    const newCount = _allTickets.filter(x => x.status === 'new').length;
    document.getElementById('tkStatNew').textContent = newCount;
    const badge = document.getElementById('ticketBadge');
    if (newCount > 0) { badge.textContent = newCount; badge.style.display = 'inline-block'; }
    else badge.style.display = 'none';
  }

  const d          = new Date(t.created_at * 1000);
  const typeLabels = { wallet:'Wallet / MetaMask', mint:'ການ Mint NFT', transfer:'ການໂອນ NFT',
    contract:'Contract Address', account:'ບັນຊີ / ລະຫັດ', other:'ອື່ນໆ' };
  const statusChip = {
    new:     '<span class="badge-chip chip-red"> ໃໝ່</span>',
    read:    '<span class="badge-chip chip-yellow"> ອ່ານແລ້ວ</span>',
    replied: '<span class="badge-chip chip-green"> ຕອບແລ້ວ</span>',
  }[t.status] || t.status;

  document.getElementById('tkDetailContent').innerHTML = `
    <div class="tk-detail-row"><span class="tk-detail-key">ສະຖານະ</span><span class="tk-detail-val">${statusChip}</span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">ຊື່</span><span class="tk-detail-val">${escHtml(t.name)}</span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">Email</span><span class="tk-detail-val"><a href="mailto:${escHtml(t.email)}" style="color:var(--accent2);">${escHtml(t.email)}</a></span></div>
    <div class="tk-detail-row"><span class="tk-detail-key">ປະເພດ</span><span class="tk-detail-val">${escHtml(typeLabels[t.type] || t.type_label || t.type)}</span></div>
    ${t.wallet ? `<div class="tk-detail-row"><span class="tk-detail-key">Wallet</span><span class="tk-detail-val" style="font-family:monospace;font-size:0.8rem;">${escHtml(t.wallet)}</span></div>` : ''}
    <div class="tk-detail-row"><span class="tk-detail-key">ວັນທີ</span><span class="tk-detail-val">${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB')}</span></div>
    <div class="tk-body">${escHtml(t.msg)}</div>
    ${t.status === 'replied' && t.reply ? `
      <div style="font-size:0.78rem;color:var(--text-success);font-weight:600;margin-bottom:4px;">ຄຳຕອບຂອງທ່ານ:</div>
      <div class="tk-replied-box">${escHtml(t.reply)}</div>
    ` : ''}`;

  // hide reply section if already replied
  document.getElementById('tkReplySection').style.display = t.status === 'replied' ? 'none' : 'block';
  document.getElementById('tkReplyText').value = '';
  document.getElementById('tkReplyStatus').className = 'status-msg';
  document.getElementById('tkDetail').classList.add('open');
  document.getElementById('tkDetail').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function closeTicketDetail() {
  _activeTicketId = null;
  document.getElementById('tkDetail').classList.remove('open');
}

async function deleteTicket() {
  if (!_activeTicketId) return;
  const ok = await adminConfirm({ title: "ລຶບ Ticket ນີ້?", danger: true, confirmText: "ລຶບ" });
  if (!ok) return;
  const res  = await fetch(TICKETS_API, { method:'POST', headers: tkH(),
    body: JSON.stringify({ action:'delete', id:_activeTicketId }) });
  const data = await res.json();
  if (data.ok) {
    _allTickets = _allTickets.filter(t => t.id !== _activeTicketId);
    const s = { total:_allTickets.length, new:_allTickets.filter(t=>t.status==='new').length,
      replied:_allTickets.filter(t=>t.status==='replied').length };
    document.getElementById('tkStatTotal').textContent   = s.total;
    document.getElementById('tkStatNew').textContent     = s.new;
    document.getElementById('tkStatReplied').textContent = s.replied;
    closeTicketDetail();
    renderTickets();
    toast('ລຶບ Ticket ສຳເລັດ', 'ok');
  } else { toast(data.msg || 'ລຶບບໍ່ສຳເລັດ', 'err'); }
}

async function sendTicketReply() {
  if (!_activeTicketId) return;
  const reply = document.getElementById('tkReplyText').value.trim();
  if (!reply) { showStatus('tkReplyStatus','err','ໃສ່ຂໍ້ຄວາມ Reply ກ່ອນ'); return; }
  const btn = document.getElementById('tkReplyBtn');
  btn.disabled = true;
  btn.innerHTML = 'ກຳລັງສົ່ງ...';
  showStatus('tkReplyStatus','info',' ກຳລັງສົ່ງ Email...');
  try {
    const res  = await fetch(TICKETS_API, { method:'POST', headers: tkH(),
      body: JSON.stringify({ action:'reply', id:_activeTicketId, reply }) });
    const data = await res.json();
    if (data.ok) {
      showStatus('tkReplyStatus','ok',' ສົ່ງ Reply ສຳເລັດ');
      toast(' Reply ສົ່ງໄປຫາ user ແລ້ວ', 'ok');
      const t = _allTickets.find(x => x.id === _activeTicketId);
      if (t) { t.status = 'replied'; t.reply = reply; t.replied_at = Date.now()/1000; }
      renderTickets();
      // re-open to show replied state
      openTicket(_activeTicketId);
      document.getElementById('tkStatReplied').textContent =
        _allTickets.filter(x => x.status === 'replied').length;
    } else {
      showStatus('tkReplyStatus','err',' ' + (data.msg || 'ສົ່ງບໍ່ສຳເລັດ'));
    }
  } catch(e) {
    showStatus('tkReplyStatus','err',' ເຊື່ອມຕໍ່ Server ບໍ່ໄດ້');
  }
  btn.disabled = false;
  btn.innerHTML = 'ສົ່ງ Reply';
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
//  SUPPORT STAFF MANAGEMENT
// ============================================================
let _supportUsers = [];

async function loadSupportSection() {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    showStatus('supportRoleStatus', 'err', ' ຍັງບໍ່ໄດ້ Login');
    return;
  }
  document.getElementById('supportUserList').innerHTML = '<span style="color:var(--muted);font-size:0.85rem;"> ກຳລັງໂຫຼດ...</span>';
  document.getElementById('supportStaffList').innerHTML = '<span style="color:var(--muted);font-size:0.85rem;"> ກຳລັງໂຫຼດ...</span>';

  try {
    const res  = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${authToken}` } });
    const data = await res.json();
    if (!res.ok) { if (res.status === 401) handleTokenExpired(); return; }

    _supportUsers = data.users || [];
    renderSupportStaffList();
    renderSupportUserList(_supportUsers);
  } catch (e) {
    document.getElementById('supportUserList').innerHTML = `<span style="color:var(--text-danger);font-size:0.85rem;">ໂຫຼດບໍ່ສຳເລັດ: ${escHtml(e.message)}</span>`;
  }
}

function renderSupportStaffList() {
  const staff = _supportUsers.filter(u => u.role === 'support' || u.role === 'admin');
  const el = document.getElementById('supportStaffList');
  if (!staff.length) {
    el.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;">ຍັງບໍ່ມີ Support Staff — promote user ຈາກລາຍການລຸ່ມ</span>';
    return;
  }
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      ${staff.map(u => `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.65rem 1rem;
                    background:var(--surface2);border:1px solid var(--border);border-radius:10px;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.88rem;font-weight:600;">${escHtml(u.name || '—')}</div>
            <div style="font-size:0.75rem;color:var(--muted);">${escHtml(u.email)}</div>
          </div>
          <span class="badge-chip ${u.role === 'admin' ? 'chip-red' : 'chip-blue'}"
                style="font-size:0.72rem;">${u.role}</span>
          ${u.role === 'support' ? `
            <button class="btn btn-danger" style="padding:0.35rem 0.75rem;font-size:0.78rem;"
              onclick="setStaffRole(${u.ID},'user','${escHtml(u.name)}')">
              Revoke
            </button>` : ''}
        </div>`).join('')}
    </div>`;
}

function filterSupportUsers() {
  const q = document.getElementById('supportSearch').value.toLowerCase().trim();
  const filtered = q ? _supportUsers.filter(u =>
    (u.name||'').toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q)
  ) : _supportUsers;
  renderSupportUserList(filtered);
}

function renderSupportUserList(users) {
  const el = document.getElementById('supportUserList');
  if (!users.length) { el.innerHTML = '<span style="color:var(--muted);font-size:0.85rem;">ບໍ່ພົບ User</span>'; return; }

  const roleChip = {
    user:    { cls:'chip-blue',  label:'user' },
    support: { cls:'chip-green', label:'support' },
    admin:   { cls:'chip-red',   label:'admin' },
  };
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.4rem;">
      ${users.map(u => {
        const chip = roleChip[u.role] || roleChip.user;
        const isSupport = u.role === 'support';
        return `
          <div style="display:flex;align-items:center;gap:0.65rem;padding:0.6rem 0.85rem;
                      background:var(--surface2);border:1px solid var(--border);border-radius:9px;">
            <div style="flex:1;min-width:0;">
              <span style="font-size:0.87rem;font-weight:600;">${escHtml(u.name || '—')}</span>
              <span style="font-size:0.75rem;color:var(--muted);margin-left:8px;">${escHtml(u.email)}</span>
            </div>
            <span class="badge-chip ${chip.cls}" style="font-size:0.7rem;">${chip.label}</span>
            ${u.role !== 'admin' ? `
              <button class="btn ${isSupport ? 'btn-danger' : 'btn-primary'}"
                style="padding:0.33rem 0.75rem;font-size:0.78rem;"
                onclick="setStaffRole(${u.ID},'${isSupport ? 'user' : 'support'}','${escHtml(u.name)}')">
                                ${isSupport ? 'Revoke' : 'Promote'}
              </button>` : ''}
          </div>`;
      }).join('')}
    </div>`;
}

async function setStaffRole(userId, role, name) {
  const authToken = localStorage.getItem('authToken');
  const label = role === 'support' ? `Promote "${name}" ເປັນ Support Staff?` : `Revoke Support ຂອງ "${name}"?`;
  const ok = await adminConfirm({
    title: label,
    icon: role === 'support' ? 'question' : 'warning',
    danger: role !== 'support',
  });
  if (!ok) return;

  showStatus('supportRoleStatus', 'info', ' ກຳລັງບັນທຶກ...');
  try {
    const res  = await fetch(`${API_BASE_URL}/api/admin/set-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    if (data.ok) {
      showStatus('supportRoleStatus', 'ok', ` ${data.msg}`);
      toast(` ${data.msg}`, 'ok');
      await loadSupportSection();
    } else {
      showStatus('supportRoleStatus', 'err', ` ${data.msg}`);
    }
  } catch (e) {
    showStatus('supportRoleStatus', 'err', ` ${e.message}`);
  }
}