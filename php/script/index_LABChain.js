
const LABCHAIN_ID = typeof CHAIN_ID !== "undefined" ? CHAIN_ID : "5222";
const LOGIN_PAGE_URL = "./login.php";

let MIGRATE_FEE_PER_NFT = "0";
let RecoveryFeePerNFT = "0";
let MintPrice = "0";
let currentUser = null;
let authToken = null;

let newWalletChecked = false;
let oldWalletForMigrate = null;
let migrateTargetWallet = null;
let oldBadgesForMigrate = [];
let selectedMigrateIds = new Set();

let pullWalletAddr = null;
let pullBadges = [];
let selectedPullIds = new Set();

function ipfsToHttp(url) {
  if (!url) return null;
  let cid = null;
  if (url.startsWith("ipfs://")) cid = url.slice(7);
  else if (url.includes("/ipfs/")) cid = url.split("/ipfs/")[1];
  if (cid) return PINATA_GATEWAY + cid;
  return url;
}

function makeImgTag(url, style) {
  if (!url) return null;
  let cid = null;
  if (url.startsWith("ipfs://")) cid = url.slice(7);
  else if (url.includes("/ipfs/")) cid = url.split("/ipfs/")[1];
  const src = cid ? PINATA_GATEWAY + cid : url;
  const fallback1 = cid ? "https://ipfs.io/ipfs/" + cid : url;
  const fallback2 = cid ? "https://cloudflare-ipfs.com/ipfs/" + cid : url;
  return `<img src="${src}" style="${style}"
    onerror="if(this.dataset.f){this.src=this.dataset.f;this.dataset.f='';}else{this.style.display='none';}"
    data-f="${fallback1}" data-f2="${fallback2}"
    onload="this.dataset.f=this.dataset.f2||''">`;
}

const ABI = CONTRACT_ABI;

function parseEthErr(e) {
  if (!e) return "ເກີດຂໍ້ຜິດພາດ";
  const msg = (e.reason || e.message || "").toLowerCase();
  if (e.code === 4001 || msg.includes("user rejected") || msg.includes("denied")) return "ຍົກເລີກໂດຍຜູ້ໃຊ້";
  if (msg.includes("minting is paused") || msg.includes("paused")) return "ລະບົບຫຍຸດຊົ່ວຄາວ";
  if (msg.includes("insufficient funds") || msg.includes("insufficient balance")) return "ຍອດ LAB ບໍ່ພໍ";
  if (msg.includes("not registered") || msg.includes("not active")) return "Wallet ຍັງບໍ່ໄດ້ລົງທະບຽນ";
  if (msg.includes("blacklisted")) return "Wallet ຖືກໂລກ";
  if (msg.includes("max badge") || msg.includes("maxbadge")) return "ຄົບຈຳນວນ Badge ສູງສຸດແລ້ວ";
  if (msg.includes("call_exception") || msg.includes("missing revert data")) return "Contract ນີ້ໄດ້ປ່ຽນ Wallet ແລ້ວດຳເນິນການບໍ່ໄດ້";
  if (msg.includes("network") || msg.includes("chain")) return "ເຊື່ອມຕໍ່ Network ຜິດ";
  if (e.code === "CALL_EXCEPTION") return "Contract ບໍ່ຮອງຮັບການດຳເນີນການນີ້";
  return e.reason || e.message || "ເກີດຂໍ້ຜິດພາດ — ກະລຸນາລອງໃໝ່";
}

let account = null, provider = null, signer = null, contract = null;
let myBadges = [];
let lastUploadedUri = "";

// ============================================================
//  AUTH
// ============================================================
function loadAuthToken() {
  authToken = localStorage.getItem("authToken") || getCookieByName("authToken") || null;
  return authToken;
}

async function fetchCurrentUser() {
  const token = loadAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) { clearAuthSession(); return null; }
    const data = await res.json();
    currentUser = data;
    MintPrice = String(data.mintPrice ?? 0);
    if (data.recoveryFeePerNFT != null) RecoveryFeePerNFT = String(data.recoveryFeePerNFT);
    return data;
  } catch (e) {
    console.warn("fetchCurrentUser failed:", e.message);
    return null;
  }
}

function clearAuthSession() {
  authToken = null; currentUser = null;
  localStorage.removeItem("authToken");
  setCookie("authToken", "", -1);
}

async function initAuth() {
  const user = await fetchCurrentUser();
  updateMintTabLock(!!user);
  if (user) {
    const userEl = document.getElementById("userLabel");
    if (userEl) { userEl.textContent = user.name || user.email || "User"; userEl.style.display = "inline-block"; }
    const lb = document.getElementById("logoutBtn"); if (lb) lb.style.display = "";
  }
}

function updateMintTabLock(isLoggedIn) {
  const mintTab = document.getElementById("mintTab");
  if (!mintTab) return;
  if (isLoggedIn) { mintTab.classList.remove("tab-locked"); mintTab.title = ""; }
  else { mintTab.classList.add("tab-locked"); mintTab.title = "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ"; }
}

function checkDesignerResult() {
  const data = localStorage.getItem('designerResult');
  if (!data) return;
  try {
    const { gatewayUrl, timestamp } = JSON.parse(data);
    if (Date.now() - timestamp > 300000) { localStorage.removeItem('designerResult'); return; }
    document.getElementById('mintURI').value = gatewayUrl;
    const lbl = document.getElementById('fileNameDisplay');
    if (lbl) lbl.textContent = '  ອອກແບບຈາກ Designer';
    toast('  ມີຮູບຈາກ Designer ພ້ອມ Mint', 'success');
    localStorage.removeItem('designerResult');
  } catch (e) { localStorage.removeItem('designerResult'); }
}

window.addEventListener('storage', (e) => {
  if (e.key === 'designerResult') checkDesignerResult();
});

function handleMintTabClick() {
  if (!currentUser) {
    toast("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນໃຊ້ງານ", "error");
    setTimeout(() => { window.location.href = LOGIN_PAGE_URL; }, 1000);
    return;
  }
  switchTab("mint");
}

// ============================================================
//  COOKIES
// ============================================================
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}
function getCookieByName(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}
function getCookie(APIJWT) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === APIJWT ? decodeURIComponent(parts[1]) : r;
  }, "");
}
function saveToCookie(token) { setCookie("jwt", token, 7); localStorage.setItem("jwt", token); }
function clearCookie() { setCookie("jwt", "", -1); localStorage.removeItem("jwt"); }

// ============================================================
//  PINATA
// ============================================================
function openPinataModal() {}
function closePinataModal() {}
function closePinataModalOutside() {}
function saveJWT() {}
function clearJWT() {}

// ============================================================
//  UPLOAD  (ອັດຕະໂນມັດຕອນ Mint — JWT ດຶງຈາກ Backend DB)
// ============================================================
let _cachedPinataJWT = null;

async function _getPinataJWT() {
  if (_cachedPinataJWT) return _cachedPinataJWT;
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/pinata_jwt`);
    if (res.ok) {
      const data = await res.json();
      if (data.value) { _cachedPinataJWT = data.value; return _cachedPinataJWT; }
    }
  } catch (_) {}
  return null;
}

function previewMintFile(input) {
  const lbl = document.getElementById("fileNameDisplay");
  if (lbl) lbl.textContent = input.files[0] ? input.files[0].name : "ເລືອກຮູບ...";
}

async function _uploadToIPFS(file, badgeName, activity) {
  const JWT = await _getPinataJWT();
  if (!JWT) return null;
  const formData = new FormData();
  formData.append("file", file);
  const imgRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST", headers: { Authorization: `Bearer ${JWT}` }, body: formData,
  });
  const imgData = await imgRes.json();
  if (!imgData.IpfsHash) throw new Error("Upload image failed");
  const metadata = {
    name: badgeName || "",
    description: `${activity || ""}\nຜູ້ສົ່ງ: ${currentUser?.name || currentUser?.email || account}`,
    image: `ipfs://${imgData.IpfsHash}`,
    issuer: currentUser?.issuerLabel || "ຄົນທົ່ວໄປ",
    attributes: [
      { trait_type: "ອອກໂດຍ", value: currentUser?.issuerLabel || "ຄົນທົ່ວໄປ" },
      { trait_type: "ຜູ້ສົ່ງ",  value: currentUser?.name || currentUser?.email || account },
      { trait_type: "Activity", value: activity || "" }
    ]
  };
  const jsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${JWT}` },
    body: JSON.stringify({ pinataMetadata: { name: "nft.json" }, pinataContent: metadata }),
  });
  const jsonData = await jsonRes.json();
  if (!jsonData.IpfsHash) throw new Error("Upload JSON failed");
  return `${PINATA_GATEWAY}${jsonData.IpfsHash}`;
}

// ============================================================
//  DESIGNER
// ============================================================
function openDesigner() {
  const name = document.getElementById('mintName')?.value?.trim() || 'ໃບຢັ້ງຢືນ NFT';
  const activity = document.getElementById('mintActivity')?.value?.trim() || '';
  const issuer = currentUser?.issuerLabel || 'ບຸກຄົນທົ່ວໄປ';
  const sender = currentUser?.name || currentUser?.email || '';
  localStorage.setItem('designerFormData', JSON.stringify({ name, activity, issuer, sender, timestamp: Date.now() }));
  window.open('../designer/editor.php', 'designer', 'width=1400,height=900,scrollbars=0');
}

// ============================================================
//  WALLET CONNECT
// ============================================================
async function connectWallet() {
  if (!window.ethereum) { toast("install MetaMask", "error"); return; }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    //  ກວດ + switch ໄປ LABChain (Chain ID 5222) ອັດຕະໂນມັດ
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== Number(LABCHAIN_ID)) {
      const targetHex = "0x" + Number(LABCHAIN_ID).toString(16);
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetHex }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: targetHex,
              chainName: "LABChain",
              nativeCurrency: { name: "LAB", symbol: "LAB", decimals: 18 },
              rpcUrls: ["https://rpc.labchain.la"],
              blockExplorerUrls: [],
            }],
          });
        } else {
          throw new Error("ກະລຸນາສະໜັບສະໜູນ MetaMask ໄປ LABChain (Chain ID 5222)");
        }
      }
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    signer = await provider.getSigner();
    // LABChain: smart estimateGas override
    const _origEstimate = provider.estimateGas.bind(provider);
    provider.estimateGas = async (tx) => {
      try {
        const est = await _origEstimate(tx);
        return est * 150n / 100n; // +50% buffer
      } catch (_) {
        // fallback: ETH-valued calls ໃຊ້ gas ຫຼາຍກວ່າ
        const hasValue = tx.value && BigInt(tx.value) > 0n;
        return hasValue ? 1000000n : 300000n;
      }
    };
    account = await signer.getAddress();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    document.getElementById("walletBtn").textContent = shortenAddr(account);
    document.getElementById("walletBtn")?.classList.add("connected");
    document.getElementById("heroSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    await loadContractFees();
    await loadBadges();
    await checkOwner();
    window.ethereum.on("accountsChanged", async (accs) => {
      account = accs[0];
      signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      loadBadges(); checkOwner();
    });
  } catch (e) {
    toast(e.message || "Connection failed", "error");
  }
}

// ============================================================
//  IPFS
// ============================================================
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];
async function fetchIpfsJson(uri) {
  if (!uri || uri.includes("placeholder")) return null;
  const cid = uri.startsWith("ipfs://") ? uri.slice(7) : uri.split("/ipfs/")[1] || uri;
  for (const gw of IPFS_GATEWAYS) {
    try {
      const res = await fetch(gw + cid, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.json();
    } catch (_) {}
  }
  return null;
}

// ============================================================
//  LOAD BADGES
// ============================================================
//  LOAD CONTRACT FEES (admin ຕັ້ງໄດ້ຜ່ານ contract)
// ============================================================
async function loadContractFees() {
  try {
    await fetchCurrentUser();

    const rp = new ethers.JsonRpcProvider("https://rpc.labchain.la");
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, rp);
    const [mintFee, recoveryFee] = await Promise.all([
      c.mintPrice(),
      c.recoveryFeePerNFT(),
    ]);

    const dbMint     = currentUser?.mintPrice         != null ? String(currentUser.mintPrice)         : null;
    const dbRecovery = currentUser?.recoveryFeePerNFT != null ? String(currentUser.recoveryFeePerNFT) : null;

    MintPrice         = dbMint     !== null ? dbMint     : ethers.formatEther(mintFee);
    // per-user DB (ລວມ 0 = ຟຣີ) > contract global
    RecoveryFeePerNFT = dbRecovery !== null ? dbRecovery : ethers.formatEther(recoveryFee);
    MIGRATE_FEE_PER_NFT = RecoveryFeePerNFT;

    const priceEl = document.getElementById("mintPriceDisplay");
    if (priceEl) priceEl.textContent = (parseFloat(MintPrice) > 0 ? MintPrice : "0") + " LAB";

    const tagEl = document.getElementById("recoverFeeTag");
    const feeNum = parseFloat(RecoveryFeePerNFT) || 0;
    if (tagEl) tagEl.textContent = feeNum === 0 ? "ຟຣີ" : RecoveryFeePerNFT + " LAB/ໃบ";
  } catch (_) {}
}

// ============================================================
async function fetchBadgeDetail(c, tid) {
  const b = await c.badges(tid);
  let image = null, isTransferable = false, meta = null;
  try { isTransferable = await c.transferable(tid); } catch (_) {}
  try {
    const uri = await c.tokenURI(tid);
    meta = await fetchIpfsJson(uri);
    image = meta?.image ? ipfsToHttp(meta.image) : null;
  } catch (e) { console.warn("tokenURI skip:", e.message); }
  // ແຍກ sender ຈາກ on-chain activity ກ່ອນ, fallback ໄປ IPFS description
  let sender = null;
  const desc = b.activity || "";
  const senderIdx = desc.indexOf("ຜູ້ສົ່ງ:");
  const sepIdx = senderIdx > -1
    ? (desc.includes("\nຜູ້ສົ່ງ:") ? desc.lastIndexOf("\n") : desc.lastIndexOf("—"))
    : -1;
  const activityText = sepIdx > -1 ? desc.slice(0, sepIdx).trim() : desc;
  if (senderIdx > -1) sender = desc.slice(senderIdx + "ຜູ້ສົ່ງ:".length).trim();
  if (!sender && meta?.description) {
    const metaSenderIdx = meta.description.indexOf("ຜູ້ສົ່ງ:");
    if (metaSenderIdx > -1) sender = meta.description.slice(metaSenderIdx + "ຜູ້ສົ່ງ:".length).split("\n")[0].trim();
  }
  if (!sender && meta?.attributes) {
    const attr = meta.attributes.find(a => a.trait_type === "ຜູ້ສົ່ງ");
    if (attr?.value) sender = attr.value;
  }
  return {
    tokenId: Number(tid), badgeName: b.badgeName,
    activity: activityText, sender,
    issuedAt: Number(b.issuedAt), transferable: isTransferable, image,
    issuer: meta?.issuer || null,
  };
}

async function loadBadges() {
  showStatus("loading");
  try {
    const tokenIds = await contract.getBadgesOf(account);
    document.getElementById("myBadgeCount").textContent = tokenIds.length;
    const profileNftCount = document.getElementById("profileNftCount");
    if (profileNftCount) profileNftCount.textContent = tokenIds.length + " ໃບ";
    try {
      const total = await contract.totalMinted();
      document.getElementById("totalMinted").textContent = total.toString();
    } catch (_) {}
    if (tokenIds.length === 0) { showStatus("empty"); return; }
    myBadges = [];
    const results = await Promise.allSettled(tokenIds.map((tid) => fetchBadgeDetail(contract, tid)));
    myBadges = results.filter(r => r.status === "fulfilled").map(r => r.value);
    showStatus(""); renderBadges(myBadges);
  } catch (e) {
    showStatus("error", "ບໍ່ສາມາດດຶງ NFT ໄດ້");
  }
}

// ============================================================
//  CHECK OWNER — ສະແດງ tabs + populate profile
// ============================================================
async function checkOwner() {
  const mintTab = document.getElementById("mintTab");
  if (mintTab) mintTab.style.display = "block";
  updateMintTabLock(!!currentUser);
  const profileTab = document.getElementById("profileTab");
  if (profileTab) profileTab.style.display = "inline-block";

  // ສະແດງ Admin Lookup card ສຳລັບ contract owner
  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const ownerAddr = await c.owner();
    const adminCard = document.getElementById("adminLookupCard");
    if (adminCard) {
      adminCard.style.display = ownerAddr.toLowerCase() === account.toLowerCase() ? "block" : "none";
    }
  } catch (_) {}

  await populateProfile();
}

// ============================================================
//  REGISTER WALLET IN CONTRACT
// ============================================================
async function doRegisterWallet() {
  const btn = document.getElementById("btnDoRegister");
  const statusEl = document.getElementById("registerStatus");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ກຳລັງລົງທະບຽນ...';
  statusEl.className = "registerStatus show info";
  statusEl.style.display = "block";
  statusEl.textContent = " ກຳລັງສົ່ງ transaction...";

  try {
    const userName = currentUser?.name || currentUser?.email || account.slice(0, 8);
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await c.register(userName, { gasLimit: 200000n });
    statusEl.textContent = ` ລໍຖ້າ confirm...\nTx: ${tx.hash}`;
    await tx.wait();

    statusEl.className = "registerStatus show ok";
    statusEl.textContent = ` ລົງທະບຽນ "${userName}" ສຳເລັດ!`;
    toast(` ລົງທະບຽນສຳເລັດ!`, "success");

    // ຊ່ອນ register card ທັນທີ
    setTimeout(() => {
      document.getElementById("registerCard").style.display = "none";
      // refresh verified badge
      populateProfile();
    }, 1500);

  } catch (e) {
    statusEl.className = "registerStatus show err";
    statusEl.textContent = " " + parseEthErr(e);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus"></i> ລົງທະບຽນດຽວນີ້';
    toast("ລົງທະບຽນບໍ່ສຳເລັດ", "error");
  }
}

// ============================================================
//  PROFILE PANEL
// ============================================================
async function populateProfile() {
  const addrEl = document.getElementById("profileAddrDisplay");
  const badgeEl = document.getElementById("verifiedBadge");
  const emailEl = document.getElementById("profileEmail");

  if (addrEl) addrEl.textContent = account || "—";
  if (emailEl) emailEl.textContent = currentUser?.email || "—";

  //  ກວດ register ໃນ contract — ສະແດງ/ຊ່ອນ register card
  const registerCard = document.getElementById("registerCard");
  const registerNamePreview = document.getElementById("registerNamePreview");
  if (registerCard && contract) {
    try {
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const prof = await c.getProfile(account);
      const isRegistered = Number(prof.userType) !== 0;

      if (!isRegistered) {
        //  ຍັງບໍ່ register — ສະແດງ card
        const userName = currentUser?.name || currentUser?.email || account.slice(0, 8);
        if (registerNamePreview) registerNamePreview.textContent = userName;
        registerCard.style.display = "block";
      } else {
        //  register ແລ້ວ — ຊ່ອນ card
        registerCard.style.display = "none";
      }
    } catch (_) {
      registerCard.style.display = "none";
    }
  }

  //  Wallet history ທັງໝົດ
  const historyRow = document.getElementById("walletHistoryRow");
  const historyList = document.getElementById("walletHistoryList");
  const historyCount = document.getElementById("walletHistoryCount");
  const history = currentUser?.walletHistory || (currentUser?.oldWalletAddress ? [currentUser.oldWalletAddress] : []);
  if (historyRow && historyList) {
    if (history.length > 0) {
      historyCount.textContent = history.length + " ໃບ";
      historyList.innerHTML = history.map((w, i) => `
        <div style="display:flex;align-items:center;gap:6px;font-size:0.76rem;color:#f59e0b;font-family:'Space Mono',monospace;padding:2px 0;">
          <span style="color:var(--muted,#94a3b8);min-width:16px;">${i + 1}.</span>
          <span title="${w}">${w.slice(0, 6)}...${w.slice(-4)}</span>
        </div>
      `).join("");
      historyRow.style.display = "block";
    } else {
      historyRow.style.display = "none";
    }
  }

  //  Verified badge
  if (badgeEl && currentUser) {
    try {
      const token = loadAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/wallet/verify?address=${account}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.verified && data.type === "current") {
          badgeEl.className = "verified-badge yes";
          badgeEl.textContent = " Verified";
        } else if (data.verified && data.type === "history") {
          badgeEl.className = "verified-badge yes";
          badgeEl.textContent = " Verified (wallet ເກົ່າ)";
        } else {
          const isHistory = currentUser?.walletHistory?.some(
            w => w.toLowerCase() === account.toLowerCase()
          );
          const isCurrent = currentUser?.walletAddress?.toLowerCase() === account.toLowerCase();
          if (isCurrent || isHistory) {
            badgeEl.className = "verified-badge yes";
            badgeEl.textContent = isHistory ? " Wallet ເກົ່າ" : " Wallet Linked";
          } else {
            badgeEl.className = "verified-badge no";
            badgeEl.textContent = " Not Verified";
          }
        }
      }
    } catch (_) {
      const isHistory = currentUser?.walletHistory?.some(
        w => w.toLowerCase() === account.toLowerCase()
      );
      const isCurrent = currentUser?.walletAddress?.toLowerCase() === account.toLowerCase();
      badgeEl.className = (isCurrent || isHistory) ? "verified-badge yes" : "verified-badge no";
      badgeEl.textContent = isHistory ? " Wallet ເກົ່າ" : isCurrent ? " Wallet Linked" : " Not Verified";
    }
  } else if (badgeEl) {
    badgeEl.className = "verified-badge no";
    badgeEl.textContent = "ຍັງບໍ່ໄດ້ Login";
  }

  //  NFT count
  const nftCount = document.getElementById("profileNftCount");
  if (nftCount && nftCount.textContent === "—") {
    try {
      const ids = await contract.getBadgesOf(account);
      nftCount.textContent = ids.length + " ໃບ";
    } catch (_) {}
  }

}

// ============================================================
//  WALLET CHANGE
// ============================================================
function onNewWalletInput(val) {
  newWalletChecked = false;
  document.getElementById("btnConfirmChange").disabled = true;
  const hint = document.getElementById("walletCheckHint");
  hint.className = "wallet-check-hint";
  if (!val) return;
  if (!val.startsWith("0x") || val.length !== 42) {
    hint.className = "wallet-check-hint show warn";
    hint.textContent = "Address ບໍ່ຖືກຕ້ອງ (ຕ້ອງ 0x + 40 ຕົວ)";
    return;
  }
  // ກວດກັບ wallet ທີ່ຢູ່ໃນ DB (ບໍ່ແມ່ນ MetaMask ປັດຈຸບັນ)
  const dbWallet = currentUser?.walletAddress;
  if (dbWallet && val.toLowerCase() === dbWallet.toLowerCase()) {
    hint.className = "wallet-check-hint show warn";
    hint.textContent = "Wallet ນີ້ແມ່ນ wallet ປັດຈຸບັນຂອງທ່ານຢູ່ໃນລະບົບ";
    return;
  }
  hint.className = "wallet-check-hint show info";
  hint.textContent = "ກົດ 'ກວດສອບ Wallet' ເພື່ອກວດສອບ";
}

async function checkNewWallet() {
  const val = document.getElementById("newWalletInput").value.trim();
  const hint = document.getElementById("walletCheckHint");
  const btnConfirm = document.getElementById("btnConfirmChange");

  if (!val || !val.startsWith("0x") || val.length !== 42) {
    hint.className = "wallet-check-hint show warn";
    hint.textContent = "ໃສ່ address ທີ່ຖືກຕ້ອງກ່ອນ";
    return;
  }
  // ກວດກັບ DB wallet (ບໍ່ແມ່ນ MetaMask)
  const dbWallet = currentUser?.walletAddress;
  if (dbWallet && val.toLowerCase() === dbWallet.toLowerCase()) {
    hint.className = "wallet-check-hint show warn";
    hint.textContent = "Wallet ນີ້ແມ່ນ wallet ປັດຈຸບັນຂອງທ່ານ — ໃສ່ wallet ໃໝ່";
    return;
  }
  hint.className = "wallet-check-hint show info";
  hint.textContent = " ກຳລັງກວດສອບ...";
  try {
    const token = loadAuthToken();
    // ກວດ linked (ຄົນອື່ນ) + registered (ມີໃນ DB ຫຼືປ່ຽວ)
    const [linkedRes, regRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/wallet/check-linked?address=${val}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/api/wallet/check-registered?address=${val}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
    ]);
    const linked = linkedRes.ok ? await linkedRes.json() : {};
    const reg = regRes.ok ? await regRes.json() : {};

    if (linked.linked) {
      // ຖ້າ link ກັບ email ຕົນເອງ → ອະນຸຍາດ (wallet ເກົ່າຂອງຕົນເອງ)
      if (linked.email && currentUser?.email &&
          linked.email.toLowerCase() === currentUser.email.toLowerCase()) {
        hint.className = "wallet-check-hint show ok";
        hint.textContent = "Wallet ເກົ່າຂອງທ່ານ — ກົດ 'ຢືນຢັນການປ່ຽນ'";
        newWalletChecked = true;
        btnConfirm.disabled = false;
      } else {
        hint.className = "wallet-check-hint show warn";
        hint.textContent = `Wallet ນີ້ເປັນຂອງ email ອື່ນ — ບໍ່ສາມາດ recover ໄດ້`;
        newWalletChecked = false;
        btnConfirm.disabled = true;
      }
    } else if (reg.registered) {
      // Registered ໃນ contract ແຕ່ບໍ່ຢູ່ໃນ DB — ເຕືອນ
      hint.className = "wallet-check-hint show warn";
      hint.textContent = "Wallet ນີ້ລົງທະບຽນໃນ contract ແລ້ວ ບໍ່ສາມາດໃຊ້ໄດ້";
      newWalletChecked = false;
      btnConfirm.disabled = true;
    } else {
      hint.className = "wallet-check-hint show ok";
      hint.textContent = "Wallet ນີ້ໃຊ້ໄດ້ — ກົດ 'ຢືນຢັນການປ່ຽນ'";
      newWalletChecked = true;
      btnConfirm.disabled = false;
    }
  } catch (e) {
    hint.className = "wallet-check-hint show warn";
    hint.textContent = " ບໍ່ສາມາດກວດສອບ API ໄດ້ — ລອງໃໝ່";
    newWalletChecked = false;
    btnConfirm.disabled = true;
  }
}

async function confirmChangeWallet() {
  if (!newWalletChecked) { toast("ກວດສອບ wallet ກ່ອນ", "error"); return; }
  const newAddr = document.getElementById("newWalletInput").value.trim();
  const btnConfirm = document.getElementById("btnConfirmChange");
  btnConfirm.disabled = true;
  setProfileStatus("loading", " ກຳລັງປ່ຽນ wallet...");

  try {
    // 1. ອັບເດດ DB + save old wallet
    const token = loadAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/wallet/change`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ newWalletAddress: newAddr, oldWalletAddress: account }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Change wallet failed");
    }

    setProfileStatus("loading", " ກຳລັງກວດ contract...");
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // 2. ກວດ + register wallet ໃໝ່
    const prof = await c.getProfile(newAddr);
    if (Number(prof.userType) === 0) {
      //  ດຶງຊື່ຈາກ currentUser ໂດຍກົງ
      const userName = currentUser?.name || currentUser?.email || newAddr.slice(0, 8);
      setProfileStatus("loading", ` ກຳລັງລົງທະບຽນ "${userName}"...\nກະລຸນາ switch MetaMask ໄປ wallet ໃໝ່`);

      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (_) {}

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const newSigner = await provider.getSigner();
      const newSignerAddr = await newSigner.getAddress();

      if (newSignerAddr.toLowerCase() !== newAddr.toLowerCase()) {
        throw new Error(`ກະລຸນາ switch MetaMask ໄປ wallet ${newAddr.slice(0,6)}...${newAddr.slice(-4)}`);
      }

      const cNew = new ethers.Contract(CONTRACT_ADDRESS, ABI, newSigner);
      const txReg = await cNew.register(userName);
      setProfileStatus("loading", ` ລໍຖ້າ confirm register...\nTx: ${txReg.hash}`);
      await txReg.wait();
      toast(` ລົງທະບຽນ "${userName}" ສຳເລັດ!`, "success");

      // switch ກັບ wallet ເກົ່າ
      setProfileStatus("loading", " ກະລຸນາ switch ກັບ wallet ເກົ່າ...");
      try {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (_) {}
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    // 3. ດຶງ NFT ທັງໝົດຈາກ wallet ເກົ່າ (ພ້ອມຮູບ)
    oldWalletForMigrate = account;
    setProfileStatus("loading", " ກຳລັງດຶງ NFT ຈາກ wallet ເກົ່າ...");
    try {
      const oldIds = await c.getBadgesOf(oldWalletForMigrate);
      const results = await Promise.allSettled(
        oldIds.map(async (tid) => {
          const b = await c.badges(tid);
          let uri = "";
          let image = null;
          try {
            uri = await c.tokenURI(tid);
            //  ດຶງຮູບດ້ວຍ
            const meta = await fetchIpfsJson(uri);
            image = meta?.image ? ipfsToHttp(meta.image) : null;
          } catch (_) {}
          return {
            tokenId: Number(tid),
            badgeName: b.badgeName,
            activity: b.activity,
            uri,
            image, //  ເກັບຮູບໄວ້ສະແດງໃນ migrate panel
          };
        })
      );
      oldBadgesForMigrate = results.filter(r => r.status === "fulfilled").map(r => r.value);
    } catch (_) { oldBadgesForMigrate = []; }

    //  refresh currentUser ໃຫ້ໄດ້ oldWalletAddress ໃໝ່
    await fetchCurrentUser();

    setProfileStatus("success", `ປ່ຽນ Wallet ສຳເລັດ!\nWallet ໃໝ່: ${newAddr}`);
    document.getElementById("profileAddrDisplay").textContent = newAddr;
    document.getElementById("newWalletInput").value = "";
    document.getElementById("walletCheckHint").className = "wallet-check-hint";
    newWalletChecked = false;
    btnConfirm.disabled = true;

    // refresh old wallet display
    populateProfile();

    if (oldBadgesForMigrate.length > 0) showMigratePanel(newAddr);

  } catch (e) {
    setProfileStatus("error", " " + (e.message || "ບໍ່ສາມາດປ່ຽນ wallet ໄດ້"));
    btnConfirm.disabled = false;
    toast("ປ່ຽນ Wallet ບໍ່ສຳເລັດ", "error");
  }
}

// ============================================================
//  MIGRATE PANEL
// ============================================================
async function showMigratePanel(newAddr) {
  migrateTargetWallet = newAddr;
  const card = document.getElementById("migrateNftCard");
  const oldWalletDisp = document.getElementById("oldWalletDisplay");
  const newWalletDisp = document.getElementById("newWalletDisplay");
  const oldWalletReminder = document.getElementById("oldWalletReminder");
  if (oldWalletDisp) oldWalletDisp.textContent = shortenAddr(oldWalletForMigrate);
  if (newWalletDisp) newWalletDisp.textContent = shortenAddr(newAddr);
  if (oldWalletReminder) oldWalletReminder.textContent = shortenAddr(oldWalletForMigrate);

  const grid = document.getElementById("nftSelectGrid");
  grid.innerHTML = "";
  selectedMigrateIds.clear();

  oldBadgesForMigrate.forEach(b => {
    const chip = document.createElement("div");
    chip.className = "nft-select-chip selected";
    chip.id = `chip_${b.tokenId}`;
    chip.onclick = () => toggleNftChip(b.tokenId);

    const imgTag = b.image ? makeImgTag(b.image, "width:28px;height:28px;border-radius:6px;object-fit:cover;flex-shrink:0;") : null;
    const imgHtml = imgTag ?? `<span style="font-size:1.1rem;">${getBadgeEmoji(b.badgeName)}</span>`;

    chip.innerHTML = `
      ${imgHtml}
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.badgeName}</span>
      <span style="font-size:0.75rem;color:var(--muted,#94a3b8);flex-shrink:0;">#${b.tokenId}</span>`;
    grid.appendChild(chip);
    selectedMigrateIds.add(b.tokenId);
  });

  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const feeWei = await c.recoveryFeePerNFT();
    RecoveryFeePerNFT = ethers.formatEther(feeWei);
  } catch (_) {}
  const feeNum = parseFloat(RecoveryFeePerNFT) || 0;
  const feeEl = document.getElementById("feePerNftDisplay");
  if (feeEl) feeEl.textContent = feeNum === 0 ? "ຟຣີ" : RecoveryFeePerNFT + " LAB";

  updateMigrateFee();
  card.style.display = "block";
  card.scrollIntoView({ behavior: "smooth" });
}

function toggleNftChip(tokenId) {
  if (selectedMigrateIds.has(tokenId)) {
    selectedMigrateIds.delete(tokenId);
    document.getElementById(`chip_${tokenId}`)?.classList.remove("selected");
  } else {
    selectedMigrateIds.add(tokenId);
    document.getElementById(`chip_${tokenId}`)?.classList.add("selected");
  }
  updateMigrateFee();
}

function selectAllNft() {
  oldBadgesForMigrate.forEach(b => {
    selectedMigrateIds.add(b.tokenId);
    document.getElementById(`chip_${b.tokenId}`)?.classList.add("selected");
  });
  updateMigrateFee();
}

function deselectAllNft() {
  oldBadgesForMigrate.forEach(b => {
    selectedMigrateIds.delete(b.tokenId);
    document.getElementById(`chip_${b.tokenId}`)?.classList.remove("selected");
  });
  updateMigrateFee();
}

function updateMigrateFee() {
  const count = selectedMigrateIds.size;
  const feeNum = parseFloat(RecoveryFeePerNFT) || 0;
  const total = feeNum * count;
  const countEl = document.getElementById("selectedNftCount");
  const totalEl = document.getElementById("totalMigrateFee");
  const btnMigrate = document.getElementById("btnMigrate");
  if (countEl) countEl.textContent = count + " ໃບ";
  if (totalEl) totalEl.textContent = total === 0 ? "ຟຣີ" : total.toFixed(4) + " LAB";
  if (btnMigrate) btnMigrate.disabled = count === 0;
}

async function executeMigrate() {
  if (selectedMigrateIds.size === 0) { toast("ເລືອກ NFT ກ່ອນ", "error"); return; }
  if (!signer) { toast("ກະລຸນາ connect wallet ກ່ອນ", "error"); return; }

  const newAddr = migrateTargetWallet;
  if (!newAddr) { toast("ບໍ່ພົບ wallet ໃໝ່ ກະລຸນາລອງໃໝ່", "error"); return; }

  // ກວດ MetaMask ຕ້ອງຢູ່ wallet ເກົ່າ
  const signerAddr = await signer.getAddress();
  if (signerAddr.toLowerCase() !== oldWalletForMigrate.toLowerCase()) {
    const statusEl = document.getElementById("migrateStatus");
    statusEl.style.cssText = "display:block;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";
    statusEl.textContent = ` MetaMask ຕ້ອງ switch ໄປ wallet ເກົ່າກ່ອນ\n${oldWalletForMigrate}`;
    toast(` Switch MetaMask ໄປ: ${shortenAddr(oldWalletForMigrate)}`, "error");
    return;
  }

  const selected = oldBadgesForMigrate.filter(b => selectedMigrateIds.has(b.tokenId));
  const count = selected.length;
  const tokenIds = selected.map(b => b.tokenId);

  const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const feePerNFT = await c.recoveryFeePerNFT();
  const totalFee = feePerNFT * BigInt(count);

  const statusEl = document.getElementById("migrateStatus");
  const btnMigrate = document.getElementById("btnMigrate");
  btnMigrate.disabled = true;
  statusEl.style.cssText = "display:block;color:#60a5fa;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);padding:0.6rem 0.9rem;border-radius:10px;";
  statusEl.textContent = ` ກຳລັງ migrate ${count} NFT...`;

  try {
    const tx = await c.recoverWalletSelected(newAddr, tokenIds, { value: totalFee, gasLimit: 500000n });
    statusEl.textContent = ` ລໍຖ້າ confirm...\nTx: ${tx.hash}`;
    await tx.wait();

    //  ອັບເດດ account ເປັນ wallet ໃໝ່
    account = newAddr;
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    document.getElementById("walletBtn").textContent = shortenAddr(newAddr);

    statusEl.style.cssText = "display:block;color:#4ade80;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);padding:0.6rem 0.9rem;border-radius:10px;";
    statusEl.textContent = ` Migrate ສຳເລັດ ${count} ໃບ!`;
    toast(` Migrate ${count} NFT ສຳເລັດ!`, "success");
    document.getElementById("migrateNftCard").style.display = "none";
    setTimeout(() => { switchTab("my"); loadBadges(); }, 2500);

  } catch (e) {
    statusEl.style.cssText = "display:block;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:0.6rem 0.9rem;border-radius:10px;";
    statusEl.textContent = ` ${parseEthErr(e)}`;
    toast("Migrate ບໍ່ສຳເລັດ", "error");
    btnMigrate.disabled = false;
  }
}

function skipMigrate() {
  document.getElementById("migrateNftCard").style.display = "none";
  toast("ຂ້າມການ migrate", "");
}

function setProfileStatus(type, msg) {
  const el = document.getElementById("profileStatus");
  el.style.display = "block";
  el.style.padding = "0.6rem 0.9rem";
  el.style.borderRadius = "10px";
  el.style.fontSize = "0.85rem";
  el.style.marginTop = "0.75rem";
  el.style.whiteSpace = "pre-line";
  if (type === "loading") {
    el.style.background = "rgba(59,130,246,0.1)"; el.style.color = "#60a5fa"; el.style.border = "1px solid rgba(59,130,246,0.2)";
  } else if (type === "success") {
    el.style.background = "rgba(34,197,94,0.1)"; el.style.color = "#4ade80"; el.style.border = "1px solid rgba(34,197,94,0.2)";
  } else if (type === "error") {
    el.style.background = "rgba(239,68,68,0.1)"; el.style.color = "#f87171"; el.style.border = "1px solid rgba(239,68,68,0.2)";
  }
  el.textContent = msg;
}

// ============================================================
//  RENDER BADGES
// ============================================================
function renderBadges(badges, gridId = "badgeGrid") {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  badges.forEach((b, i) => {
    const card = document.createElement("div");
    card.className = "badge-card";
    card.style.animationDelay = `${i * 0.07}s`;
    card.onclick = () => openModal(b);
    const emoji = getBadgeEmoji(b.badgeName);
    const dateStr = b.issuedAt ? new Date(b.issuedAt * 1000).toLocaleDateString("lo-LA") : "—";
    const _imgSrc = b.image ? ipfsToHttp(b.image) : null;
    const _imgFb  = b.image && b.image.includes("ipfs") ? "https://ipfs.io/ipfs/" + (b.image.startsWith("ipfs://") ? b.image.slice(7) : b.image.split("/ipfs/")[1]) : _imgSrc;
    const imgHtml = _imgSrc
      ? `<img src="${_imgSrc}" alt="${b.badgeName}" style="width:100%;height:100%;object-fit:contain;border-radius:12px;background:var(--surface);"
           onerror="if(this.dataset.f){this.src=this.dataset.f;this.dataset.f='';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}" data-f="${_imgFb}">`
      : "";
    const emojiHtml = `<div class="placeholder" style="${b.image ? "display:none" : ""}">${emoji}</div>`;
    card.innerHTML = `
      <div class="badge-img-wrap">${imgHtml}${emojiHtml}<div class="token-chip">#${b.tokenId}</div></div>
      <div class="badge-body">
        <div class="badge-name">${b.badgeName}</div>
        <div class="badge-activity">${b.activity}</div>
        ${b.sender ? `<div class="badge-sender">ຜູ້ສົ່ງ: ${b.sender}</div>` : ""}
        <div class="badge-date">${dateStr}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ============================================================
//  WALLET LIST (mint form)
// ============================================================
let walletRowCount = 1;
function addWalletRow() {
  const list = document.getElementById("walletList");
  const idx = walletRowCount++;
  const row = document.createElement("div");
  row.className = "wallet-row"; row.id = `walletRow_${idx}`;
  row.innerHTML = `<input type="text" id="walletAddr_${idx}" placeholder="0x..." oninput="updateMintPriceCalc()" /><button class="btn-remove-wallet" onclick="removeWalletRow(${idx})" title="ລຶບ"></button>`;
  list.appendChild(row);
  updateWalletCount(); updateMintPriceCalc();
}
function removeWalletRow(idx) {
  const row = document.getElementById(`walletRow_${idx}`);
  if (row) row.remove();
  updateWalletCount(); updateMintPriceCalc();
}
function getWalletAddresses() {
  return Array.from(document.querySelectorAll("#walletList input[type=text]")).map(el => el.value.trim()).filter(a => a.length > 0);
}
function updateWalletCount() {
  const count = document.querySelectorAll("#walletList input[type=text]").length;
  const badge = document.getElementById("walletCountBadge");
  if (badge) badge.textContent = count;
}
function updateMintPriceCalc() {
  const addresses = getWalletAddresses();
  const count = addresses.length;
  const calc = document.getElementById("mintPriceCalc");
  const priceDisplay = document.getElementById("mintPriceDisplay");
  const total = (parseFloat(MintPrice) * Math.max(count, 1)).toFixed(2);
  if (priceDisplay) priceDisplay.textContent = `${total} LAB`;
  if (calc) calc.textContent = count > 1 ? `${count} wallets × ${MintPrice} LAB = ${total} LAB` : "";
}

// ============================================================
//  MINT
// ============================================================
async function mintBadge() {
  if (!currentUser) {
    toast("ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ", "error");
    setTimeout(() => { window.location.href = LOGIN_PAGE_URL; }, 1000);
    return;
  }

  const students = getWalletAddresses();
  const name = document.getElementById("mintName").value.trim();
  const activity = document.getElementById("mintActivity").value.trim();
  const isTransferable = document.getElementById("mintTransferable").checked;

  if (students.length === 0 || !name || !activity) { toast("ກອບຂໍ້ມູນບໍ່ຄົບ", "error"); return; }
  const invalid = students.filter(a => !a.startsWith("0x") || a.length !== 42);
  if (invalid.length > 0) { toast(`Wallet address ບໍ່ຖືກຕ້ອງ: ${invalid[0]}`, "error"); return; }

  const btn = document.getElementById("mintBtn");
  btn.disabled = true;

  // Check for pre-set designer URI or auto-upload image
  let uri = "ipfs://placeholder";
  const mintURIEl = document.getElementById("mintURI");
  const existingURI = mintURIEl?.value?.trim();
  const file = document.getElementById("file")?.files[0];

  if (existingURI) {
    uri = existingURI;
  } else if (file) {
    btn.textContent = " ກຳລັງ upload ຮູບ...";
    setMintStatus("loading", " (1/2) ກຳລັງ upload ຮູບໄປ IPFS...");
    try {
      const jwt = await _getPinataJWT();
      if (!jwt) {
        toast(" Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງ — ແຈ້ງ Admin ຕັ້ງທີ່ Settings", "error");
        setMintStatus("error", " Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງ\nAdmin ຕ້ອງໄປ Settings → ໃສ່ Pinata JWT ກ່ອນ");
        btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
      }
      const uploaded = await _uploadToIPFS(file, name, activity);
      if (uploaded) {
        uri = uploaded;
        setMintStatus("loading", " (1/2) Upload ສຳເລັດ — ກຳລັງ Mint...");
      } else {
        setMintStatus("error", " Upload ຮູບລົ້ມເຫລວ — ກວດ Pinata JWT ທີ່ Admin Settings");
        btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
      }
    } catch (e) {
      setMintStatus("error", ` Upload ຮູບລົ້ມເຫລວ: ${e.message}`);
      btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
    }
  }

  btn.textContent = " ກຳລັງກວດ wallet...";
  setMintStatus("loading", "ກຳລັງກວດ wallet ໃນລະບົບ...");

  if (!signer || !account) {
    setMintStatus("error", " ກະລຸນາ Connect Wallet ກ່ອນ Mint");
    toast("ກະລຸນາ Connect Wallet ກ່ອນ", "error");
    btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
  }

  try {
    const token = loadAuthToken();
    const rc = new ethers.Contract(CONTRACT_ADDRESS, ABI, new ethers.JsonRpcProvider("https://rpc.labchain.la"));

    // ກວດ caller ກ່ອນ
    const callerBlacklisted = await rc.blacklisted(account);
    if (callerBlacklisted) {
      setMintStatus("error", " Wallet ຂອງທ່ານຖືກ Blacklist — ບໍ່ສາມາດ Mint ໄດ້");
      toast("Wallet ຂອງທ່ານຖືກ Blacklist", "error");
      btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
    }

    for (const addr of students) {
      const res = await fetch(`${API_BASE_URL}/api/wallet/check-registered?address=${addr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.registered) {
        setMintStatus("error", ` Wallet ${addr.slice(0,6)}...${addr.slice(-4)} ຍັງບໍ່ໄດ້ລົງທະບຽນ`);
        toast("Wallet ບໍ່ໄດ້ລົງທະບຽນ", "error");
        btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
      }
      const recipientBlacklisted = await rc.blacklisted(addr);
      if (recipientBlacklisted) {
        setMintStatus("error", ` Wallet ${addr.slice(0,6)}...${addr.slice(-4)} ຖືກ Blacklist`);
        toast("Wallet ຜູ້ຮັບຖືກ Blacklist", "error");
        btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
      }
      // ກວດ max badge (DB) — ບໍ່ຕ້ອງ on-chain
      const [userInfo, currentBadges] = await Promise.all([
        fetch(`${API_BASE_URL}/api/wallet/user-by-wallet?address=${addr}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).catch(() => ({})),
        rc.getBadgesOf(addr).catch(() => []),
      ]);
      if (userInfo.maxBadge != null && currentBadges.length >= userInfo.maxBadge) {
        setMintStatus("error", ` Wallet ${addr.slice(0,6)}...${addr.slice(-4)} ຄົບ Badge ສູງສຸດ ${userInfo.maxBadge} ໃບແລ້ວ`);
        toast("ຜູ້ຮັບຄົບ Badge ສູງສຸດແລ້ວ", "error");
        btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ"; return;
      }
    }
  } catch (e) {
    setMintStatus("error", " ກວດ wallet ບໍ່ໄດ້ ກະລຸນາລອງໃໝ່");
    toast("ກວດ wallet ບໍ່ສຳເລັດ", "error");
    btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ";
    return;
  }

  const isBatch = students.length > 1;
  btn.textContent = isBatch ? `ກຳລັງ Mint ${students.length} ຄົນ...` : "ກຳລັງ Mint...";
  setMintStatus("loading", isBatch ? `ກຳລັງ Batch Mint ${students.length} ຄົນ...` : "");

  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const hasCustomPrice = currentUser?.mintPrice != null;
    let tx;

    if (hasCustomPrice) {
      setMintStatus("loading", " ກຳລັງດຶງ voucher...");
      const token = loadAuthToken();
      const voucherRes = await fetch(`${API_BASE_URL}/api/mint-voucher?wallet=${account}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!voucherRes.ok) throw new Error("ດຶງ voucher ບໍ່ໄດ້ — ກະລຸນາລອງໃໝ່");
      const voucher = await voucherRes.json();
      const mintValue = ethers.parseEther(voucher.price || "0");
      if (isBatch) {
        tx = await c.batchMintBadgeWithVoucher(
          students, name, activity, uri, isTransferable,
          mintValue, BigInt(voucher.expiry), voucher.signature,
          { value: mintValue * BigInt(students.length) }
        );
      } else {
        tx = await c.mintBadgeWithVoucher(
          students[0], name, activity, uri, isTransferable,
          mintValue, BigInt(voucher.expiry), voucher.signature,
          { value: mintValue }
        );
      }
    } else {
      const mintValue = ethers.parseEther(MintPrice || "0");
      if (isBatch) {
        tx = await c.batchMintBadge(students, name, activity, uri, isTransferable, { value: mintValue * BigInt(students.length) });
      } else {
        tx = await c.mintBadge(students[0], name, activity, uri, isTransferable, { value: mintValue });
      }
    }
    setMintStatus("loading", `confirm... Tx: ${tx.hash}`);
    await tx.wait();
    const successMsg = isBatch
      ? `Batch Mint ສຳເລັດ ${students.length} ຄົນ!\nTx: ${tx.hash}`
      : `Mint success!\nTx: ${tx.hash}`;
    setMintStatus("success", successMsg);
    toast(isBatch ? ` Mint ${students.length} ໃບ ສຳເລັດ!` : "Mint ໃບຢັ້ງຢືນ success!", "success");
    document.getElementById("walletList").innerHTML = `<div class="wallet-row" id="walletRow_0"><input type="text" id="walletAddr_0" placeholder="0x..." oninput="updateMintPriceCalc()" /></div>`;
    walletRowCount = 1; updateWalletCount(); updateMintPriceCalc();
    document.getElementById("mintName").value = "";
    document.getElementById("mintActivity").value = "";
    document.getElementById("mintURI").value = "";
    document.getElementById("mintTransferable").checked = false;
    const fileEl = document.getElementById("file");
    if (fileEl) { fileEl.value = ""; previewMintFile(fileEl); }
    setTimeout(() => { switchTab("my"); loadBadges(); }, 2000);
  } catch (e) {
    setMintStatus("error", " " + parseEthErr(e));
    toast("Mint ບໍ່ສຳເລັດ", "error");
  } finally {
    btn.disabled = false; btn.textContent = "Mint ຢັ້ງຢືນ";
  }
}

// ============================================================
//  TRANSFER
// ============================================================
async function transferBadge(tokenId) {
  if (!account) { toast("ກະລຸນາ Connect Wallet", "error"); return; }
  const toAddr = document.getElementById(`transferTo_${tokenId}`)?.value.trim();
  if (!toAddr || !toAddr.startsWith("0x") || toAddr.length !== 42) { toast("Wallet address ປາຍທາງບໍ່ຖືກຕ້ອງ", "error"); return; }

  //  ກວດ recipient ລົງທະບຽນ
  try {
    const token = loadAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/wallet/check-registered?address=${toAddr}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.registered) { toast(" Wallet ປາຍທາງຍັງບໍ່ໄດ້ລົງທະບຽນ", "error"); return; }
  } catch (e) {
    toast(" ກວດ wallet ບໍ່ໄດ້", "error"); return;
  }

  const btn = document.getElementById(`transferBtn_${tokenId}`);
  if (btn) { btn.disabled = true; btn.textContent = "ກຳລັງໂອນ..."; }
  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await c.safeTransferFrom(account, toAddr, tokenId, { gasLimit: 200000n });
    toast("ກຳລັງລໍຖ້າການຢືນຢັນ...", "");
    await tx.wait();
    toast(` ໂອນ #${tokenId} ສຳເລັດ!`, "success");
    document.getElementById("modal")?.classList.remove("open");
    setTimeout(() => loadBadges(), 1500);
  } catch (e) {
    toast(" " + (e.reason || e.message || "Transfer failed"), "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "ໂອນ Badge"; }
  }
}

// ============================================================
//  MODAL
// ============================================================
function openModal(b) {
  document.getElementById("modalName").textContent = b.badgeName;
  document.getElementById("modalActivity").textContent = b.activity;

  const modalSender = document.getElementById("modalSender");
  if (modalSender) {
    modalSender.textContent = b.sender ? "ຜູ້ສົ່ງ: " + b.sender : "";
    modalSender.style.display = b.sender ? "block" : "none";
  }

  const imgWrap = document.getElementById("modalImgWrap");
  if (b.image) {
    imgWrap.innerHTML = makeImgTag(b.image, "width:100%;height:100%;object-fit:contain;");
  } else { imgWrap.textContent = getBadgeEmoji(b.badgeName); }

  // Token ID
  const tokenIdEl = document.getElementById("modalTokenId");
  if (tokenIdEl) tokenIdEl.textContent = b.tokenId !== undefined ? "#" + b.tokenId : "—";

  // Issued at
  const issuedAtEl = document.getElementById("modalIssuedAt");
  if (issuedAtEl) {
    issuedAtEl.textContent = b.issuedAt
      ? new Date(b.issuedAt * 1000).toLocaleDateString("lo-LA", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" })
      : "—";
  }

  // Issuer
  const issuedByEl = document.getElementById("modalIssuedBy");
  if (issuedByEl) issuedByEl.textContent = b.issuer || "—";

  // Transfer status
  const transEl = document.getElementById("modalTrans");
  if (transEl) {
    if (b.transferable === true)       transEl.innerHTML = '<span style="color:var(--teal)"> ໂອນໄດ້</span>';
    else if (b.transferable === false)  transEl.innerHTML = '<span style="color:var(--danger)"> ໂອນບໍ່ໄດ້</span>';
    else transEl.textContent = "—";
  }

  // Contract Address
  const ethEl = document.getElementById("modalEtherscan");
  if (ethEl) {
    const addr = CONTRACT_ADDRESS;
    ethEl.textContent = addr.slice(0, 10) + "..." + addr.slice(-6);
    ethEl.title = addr;
    ethEl.href = "https://explorer.labchain.la/address/" + addr;
  }

  // Network
  const verifiedEl = document.getElementById("modalVerified");
  if (verifiedEl) {
    provider.getNetwork().then(network => {
      const names = { 5222n:"LAB Chain", 1n:"Ethereum", 137n:"Polygon", 11155111n:"Sepolia" };
      verifiedEl.textContent = " " + (names[network.chainId] || "Chain " + network.chainId);
      verifiedEl.style.color = "var(--teal)";
    });
  }

  document.getElementById("modal")?.classList.add("open");
}
function closeModal(e) { if (e.target.id === "modal") document.getElementById("modal")?.classList.remove("open"); }

// ============================================================
//  TABS
// ============================================================
function switchTab(tab) {
  document.getElementById("tabMy").style.display = tab === "my" ? "block" : "none";
  document.getElementById("tabMint").style.display = tab === "mint" ? "block" : "none";
  document.getElementById("tabProfile").style.display = tab === "profile" ? "block" : "none";
  document.getElementById("tabSearch").style.display = tab === "search" ? "block" : "none";
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active",
      (i === 0 && tab === "my") ||
      (i === 1 && tab === "mint") ||
      (i === 2 && tab === "profile") ||
      (i === 3 && tab === "search")
    );
  });
  if (tab === "mint") checkDesignerResult();
  if (tab === "profile" && account) populateProfile();
}

// ============================================================
//  SEARCH OTHER WALLET'S NFT GALLERY
// ============================================================
async function searchOtherWallet() {
  const addr = (document.getElementById("searchWalletInput")?.value || "").trim();
  const resultCard = document.getElementById("searchResultCard");
  const nameEl = document.getElementById("searchUserName");
  const statusBadgeEl = document.getElementById("searchUserStatus");
  const countEl = document.getElementById("searchNftCount");

  if (!ethers.isAddress(addr)) {
    toast("Wallet address ບໍ່ຖືກຕ້ອງ", "error");
    return;
  }

  resultCard.style.display = "block";
  nameEl.textContent = "ກຳລັງຄົ້ນຫາ...";
  statusBadgeEl.className = "verified-badge no";
  statusBadgeEl.textContent = "—";
  countEl.textContent = "—";
  document.getElementById("searchBadgeGrid").innerHTML = "";
  showStatus("loading", "", "searchStatus");

  try {
    const c = contract || new ethers.Contract(CONTRACT_ADDRESS, ABI, new ethers.JsonRpcProvider("https://rpc.labchain.la"));
    const profile = await c.getProfile(addr);
    const isRegistered = Number(profile.userType) !== 0;
    nameEl.textContent = isRegistered ? (profile.name || shortenAddr(addr)) : shortenAddr(addr);
    statusBadgeEl.className = "verified-badge " + (isRegistered ? "yes" : "no");
    statusBadgeEl.textContent = isRegistered ? " ລົງທະບຽນແລ້ວ" : " ບໍ່ໄດ້ລົງທະບຽນ";

    const tokenIds = await c.getBadgesOf(addr);
    countEl.textContent = tokenIds.length + " ໃບ";

    if (tokenIds.length === 0) { showStatus("empty", "", "searchStatus"); return; }

    const results = await Promise.allSettled(tokenIds.map((tid) => fetchBadgeDetail(c, tid)));
    const badges = results.filter(r => r.status === "fulfilled").map(r => r.value);
    showStatus("", "", "searchStatus");
    renderBadges(badges, "searchBadgeGrid");
  } catch (e) {
    showStatus("error", "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້: " + parseEthErr(e), "searchStatus");
  }
}


function fillPreset(name, activity) {
  document.getElementById("mintName").value = name;
  document.getElementById("mintActivity").value = activity;
}
function getBadgeEmoji(name = "") {
  const n = name.toLowerCase();
  if (n.includes("winner") || n.includes("hackathon")) return "\u{1F3C6}";
  if (n.includes("smart") || n.includes("contract")) return "\u26A1";
  if (n.includes("web3") || n.includes("explorer")) return "\u{1F310}";
  if (n.includes("blockchain")) return "\u{1F517}";
  return "\u{1F393}";
}
function shortenAddr(addr) { return addr.slice(0, 6) + "..." + addr.slice(-4); }
function showStatus(type, msg = "", elId = "status") {
  const el = document.getElementById(elId);
  if (type === "loading") { el.style.display = "block"; el.className = ""; el.innerHTML = '<div class="spinner"></div><p>loading...</p>'; }
  else if (type === "empty") { el.style.display = "block"; el.className = ""; el.innerHTML = '<div class="empty"><div class="icon"></div><p>ຍັງບໍ່ມີ ໃບຢັ້ງຢືນ</p></div>'; }
  else if (type === "error") { el.style.display = "block"; el.className = "error"; el.textContent = msg; }
  else { el.style.display = "none"; el.textContent = ""; }
}
function setMintStatus(type, msg = "") {
  const el = document.getElementById("mintStatus");
  el.style.display = type ? "block" : "none";
  if (type === "loading") { el.innerHTML = '<div class="spinner" style="width:28px;height:28px;border-width:2px"></div>' + (msg || "ກຳລັງ Mint..."); el.style.color = "var(--muted)"; }
  else if (type === "success") { el.textContent = msg; el.style.color = "var(--accent2)"; }
  else if (type === "error") { el.textContent = msg; el.style.color = "var(--danger)"; }
}
function toast(msg, type = "") {
  const el = document.getElementById("toast");
  el.textContent = msg; el.className = "toast " + type + " show";
  setTimeout(() => el.classList.remove("show"), 3500);
}
async function logout() {
  const result = await Swal.fire({
    title: "ອອກຈາກລະບົບ?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ອອກຈາກລະບົບ",
    cancelButtonText: "ຍົກເລີກ",
    reverseButtons: true,
    background: "var(--card)",
    color: "var(--text)",
    confirmButtonColor: "var(--violet)",
    cancelButtonColor: "var(--surface)",
  });
  if (!result.isConfirmed) return;
  localStorage.removeItem("authToken");
  window.location.href = "./logout.php";
}


let recoverOldWallet = null;
let recoverBadges = [];
let recoverFeeWei = 0n;
let selectedRecoverIds = new Set();

// ============================================================
//  ADMIN LOOKUP
// ============================================================
async function adminLookupUser() {
  const addr = document.getElementById("adminLookupInput").value.trim();
  if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
    toast("ໃສ່ address ທີ່ຖືກຕ້ອງ", "error"); return;
  }
  const btn = document.getElementById("btnAdminLookup");
  const resultEl = document.getElementById("adminLookupResult");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  resultEl.innerHTML = "";
  try {
    const token = loadAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/wallet/user-by-wallet?address=${addr}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.found) {
      resultEl.innerHTML = `<div style="color:var(--muted,#94a3b8);font-size:0.85rem;padding:0.5rem 0;">ບໍ່ພົບ user ທີ່ໃຊ້ wallet ນີ້</div>`;
      return;
    }
    const histHtml = data.walletHistory?.length
      ? data.walletHistory.map((w, i) => `<div style="font-size:0.75rem;color:#f59e0b;font-family:'Space Mono',monospace;">${i+1}. ${w.slice(0,6)}...${w.slice(-4)}</div>`).join("")
      : '<div style="font-size:0.75rem;color:var(--muted,#94a3b8);">ບໍ່ມີ</div>';
    resultEl.innerHTML = `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.9rem 1rem;">
        <div class="profile-stat-row"><span>ຊື່</span><strong>${data.name || "—"}</strong></div>
        <div class="profile-stat-row"><span>Email</span><strong>${data.email || "—"}</strong></div>
        <div class="profile-stat-row"><span>Wallet ປັດຈຸບັນ</span><strong style="font-family:'Space Mono',monospace;font-size:0.78rem;">${data.walletAddress?.slice(0,6)}...${data.walletAddress?.slice(-4)}</strong></div>
        <div class="profile-stat-row"><span>Verified</span><strong>${data.verified ? " Yes" : " No"}</strong></div>
        <div class="profile-stat-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
          <span>Wallet History</span>${histHtml}
        </div>
      </div>`;
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:0.85rem;">${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> ຄົ້ນຫາ';
  }
}

async function checkAdminRecover() {
  const addr = document.getElementById("recoverWalletInput").value.trim();
  if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
    toast("ໃສ່ address ທີ່ຖືກຕ້ອງ", "error"); return;
  }
  if (addr.toLowerCase() === account?.toLowerCase()) {
    toast("ນີ້ແມ່ນ wallet ປັດຈຸບັນ — ໃສ່ wallet ເກົ່າທີ່ສູນຫາຍ", "error"); return;
  }

  const btn = document.getElementById("btnCheckRecover");
  const resultEl = document.getElementById("recoverVerifyResult");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  resultEl.innerHTML = '<div style="color:var(--muted,#94a3b8);font-size:0.85rem;padding:0.4rem 0;"> ກຳລັງກວດສອບ...</div>';
  document.getElementById("recoverNftSection").style.display = "none";

  try {
    const token = loadAuthToken();

    // 1. ກວດວ່า wallet ນີ້ຢູ່ໃນ email ຂອງ user
    const checkRes = await fetch(`${API_BASE_URL}/api/wallet/check-linked?address=${addr}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const checkData = await checkRes.json();

    // linked = true ໝາຍຄວາມວ່າ wallet ນີ້ link ກັບ email ໃດໜຶ່ງ
    // ຕ້ອງກວດຕໍ່ວ່າ email ນັ້ນຕົງກັບ currentUser
    if (!checkData.linked) {
      resultEl.innerHTML = `<div style="color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:0.6rem 0.8rem;font-size:0.83rem;">
         Wallet ນີ້ບໍ່ໄດ້ link ກັບ account ຂອງທ່ານ<br>
        <span style="font-size:0.76rem;color:var(--muted,#94a3b8);">ກວດສອບວ່າ address ຖືກຕ້ອງ ຫຼື ຕິດຕໍ່ admin</span>
      </div>`;
      return;
    }
    if (checkData.email && currentUser?.email &&
        checkData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      resultEl.innerHTML = `<div style="color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:0.6rem 0.8rem;font-size:0.83rem;">
        Wallet ນີ້ເປັນຂອງ email ອື່ນ — ບໍ່ສາມາດ recover ໄດ້
      </div>`;
      return;
    }

    resultEl.innerHTML = '<div style="color:var(--muted,#94a3b8);font-size:0.82rem;padding:0.3rem 0;"> ກຳລັງໂຫຼດ NFT...</div>';

    // 2. ໂຫຼດ NFT ຈາກ wallet ເກົ່າ
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const tokenIds = await c.getBadgesOf(addr);
    recoverOldWallet = addr;
    recoverBadges = [];

    if (tokenIds.length === 0) {
      resultEl.innerHTML = `<div style="color:#fbbf24;background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:0.6rem 0.8rem;font-size:0.83rem;">
        ️ Wallet ນີ້ link ກັບ email ຂອງທ່ານ <br>ແຕ່ບໍ່ມີ NFT ໃນ wallet ນີ້ແລ້ວ
      </div>`;
      return;
    }

    const results = await Promise.allSettled(tokenIds.map(async (tid) => {
      const b = await c.badges(tid);
      let image = null;
      try {
        const uri = await c.tokenURI(tid);
        const meta = await fetchIpfsJson(uri);
        image = meta?.image ? ipfsToHttp(meta.image) : null;
      } catch (_) {}
      return { tokenId: Number(tid), badgeName: b.badgeName, activity: b.activity, image };
    }));
    recoverBadges = results.filter(r => r.status === "fulfilled").map(r => r.value);

    resultEl.innerHTML = "";
    document.getElementById("recoverVerifiedEmail").textContent = checkData.email || currentUser?.email || "—";
    document.getElementById("recoverTargetWallet").textContent = shortenAddr(account);

    // per-user DB (ລວມ 0 = ຟຣີ) > contract global
    recoverFeeWei = ethers.parseEther(RecoveryFeePerNFT || "0");

    // render NFT list แบบ selectable + auto-select ทั้งหมด
    selectedRecoverIds.clear();
    const listWrap = document.getElementById("recoverNftListWrap");
    listWrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <span style="font-size:0.82rem;color:var(--muted,#94a3b8);">ເລືອກ NFT ທີ່ຕ້ອງການດຶງ</span>
        <div style="display:flex;gap:0.4rem;">
          <button class="btn-profile" style="padding:0.2rem 0.6rem;font-size:0.76rem;" onclick="selectAllRecover()">ທັງໝົດ</button>
          <button class="btn-profile" style="padding:0.2rem 0.6rem;font-size:0.76rem;" onclick="deselectAllRecover()">ລ້າງ</button>
        </div>
      </div>
      <div class="pull-nft-list" style="max-height:220px;margin-bottom:0.75rem;" id="recoverNftGrid"></div>
    `;
    const grid = document.getElementById("recoverNftGrid");
    recoverBadges.forEach(b => {
      const row = document.createElement("div");
      row.className = "pull-nft-row selected";
      row.id = `recoverRow_${b.tokenId}`;
      row.onclick = () => toggleRecoverNft(b.tokenId);
      selectedRecoverIds.add(b.tokenId);
      const imgEl = b.image
        ? makeImgTag(b.image, "width:38px;height:38px;border-radius:7px;object-fit:cover;flex-shrink:0;")
        : `<div style="width:38px;height:38px;border-radius:7px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">${getBadgeEmoji(b.badgeName)}</div>`;
      row.innerHTML = `
        ${imgEl}
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.86rem;font-weight:600;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.badgeName}</div>
          <div style="font-size:0.74rem;color:var(--muted,#94a3b8);">#${b.tokenId}</div>
        </div>
        <div class="pull-check" id="recoverCheck_${b.tokenId}"></div>
      `;
      grid.appendChild(row);
    });
    updateRecoverFee();

    document.getElementById("recoverNftSection").style.display = "block";
    document.getElementById("recoverNftSection").scrollIntoView({ behavior: "smooth" });

  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:0.85rem;padding:0.4rem 0;"> ${e.message || "ກວດສອບບໍ່ສຳເລັດ"}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-shield-alt"></i> ກວດສອບ';
  }
}

async function executeAdminRecover() {
  if (!recoverOldWallet || recoverBadges.length === 0) return;
  if (!signer) { toast("ກະລຸນາ connect wallet ກ່ອນ", "error"); return; }

  const count = selectedRecoverIds.size;
  if (count === 0) return;
  const totalFee = recoverFeeWei * BigInt(count);

  // ① ຢືນຢັນ + ຈ່າຍຄ່າທຳ (ຖ້າມີ) ຈາກ wallet ໃໝ່ກ່ອນຂໍ recover
  let paymentTxHash = null;
  if (totalFee > 0n) {
    const totalFeeStr = ethers.formatEther(totalFee);
    const confirmResult = await Swal.fire({
      title: "ຢືນຢັນຄ່າທຳ Recovery",
      html: `ດຶງ NFT ${count} ໃບ — ຄ່າທຳ ${ethers.formatEther(recoverFeeWei)} LAB/ໃບ\n\nລວມ <b>${totalFeeStr} LAB</b> ຈະຖືກໂອນອອກຈາກ wallet ໃໝ່ຂອງທ່ານ`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `ຈ່າຍ ${totalFeeStr} LAB`,
      cancelButtonText: "ຍົກເລີກ",
      reverseButtons: true,
      background: "var(--card)",
      color: "var(--text)",
      confirmButtonColor: "var(--violet)",
      cancelButtonColor: "var(--surface)",
    });
    if (!confirmResult.isConfirmed) return;
  } else {
    const confirmResult = await Swal.fire({
      title: "ຢືນຢັນຂໍຄືນ NFT?",
      html: `ດຶງ NFT ${count} ໃບ — ບໍ່ມີຄ່າທຳ (ຟຣີ)`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ຢືນຢັນ",
      cancelButtonText: "ຍົກເລີກ",
      reverseButtons: true,
      background: "var(--card)",
      color: "var(--text)",
      confirmButtonColor: "var(--violet)",
      cancelButtonColor: "var(--surface)",
    });
    if (!confirmResult.isConfirmed) return;
  }

  const btn = document.getElementById("btnAdminRecover");
  const statusEl = document.getElementById("recoverStatus");
  btn.disabled = true;
  statusEl.style.cssText = "display:block;color:#60a5fa;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";

  try {
    // ② ໂອນຄ່າທຳໄປ fundsReceiver ກ່ອນ (ຖ້າມີ)
    if (totalFee > 0n) {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ກຳລັງຈ່າຍຄ່າທຳ...';
      statusEl.textContent = " ກຳລັງໂອນຄ່າທຳ — ກະລຸນາຢືນຢັນໃນ MetaMask...";
      const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const receiver = await c.fundsReceiver();
      const payTx = await signer.sendTransaction({ to: receiver, value: totalFee });
      statusEl.textContent = " ກຳລັງລໍຄອຍ tx ການຈ່າຍຄ່າທຳ confirm...";
      await payTx.wait();
      paymentTxHash = payTx.hash;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ກຳລັງດຳເນີນການ...';
    statusEl.textContent = " ກຳລັງ recover NFT...";

    // ③ ເອີ້ນ backend ດຳເນີນການ recover
    const token = loadAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/wallet/admin-recover`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        oldWallet: recoverOldWallet,
        newWallet: account,
        tokenIds: [...selectedRecoverIds],
        paymentTxHash,
      }),
    });
    let data = {};
    try { data = await res.json(); } catch (_) {
      throw new Error("Backend endpoint ຍັງບໍ່ໄດ້ implement\nກະລຸນາຕິດຕໍ່ developer ໃຫ້ສ້າງ POST /api/wallet/admin-recover");
    }
    if (!res.ok) throw new Error(data.message || "Recovery failed");

    statusEl.style.cssText = "display:block;color:#4ade80;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";
    const doneCount = selectedRecoverIds.size;
    statusEl.textContent = ` ດຶງ NFT ສຳເລັດ ${doneCount} ໃບ!\n${data.txHash ? "Tx: " + data.txHash : ""}`;
    toast(` ຄືນ NFT ສຳເລັດ ${doneCount} ໃບ!`, "success");

    recoverBadges = [];
    selectedRecoverIds.clear();
    recoverOldWallet = null;
    document.getElementById("recoverWalletInput").value = "";
    setTimeout(() => { switchTab("my"); loadBadges(); }, 2500);

  } catch (e) {
    statusEl.style.cssText = "display:block;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";
    statusEl.textContent = ` ${parseEthErr(e)}`;
    toast("Recovery ບໍ່ສຳເລັດ", "error");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> ຂໍຄືນ NFT ທັງໝົດ';
  }
}

function toggleRecoverNft(tokenId) {
  const row = document.getElementById(`recoverRow_${tokenId}`);
  if (selectedRecoverIds.has(tokenId)) {
    selectedRecoverIds.delete(tokenId);
    row?.classList.remove("selected");
  } else {
    selectedRecoverIds.add(tokenId);
    row?.classList.add("selected");
  }
  updateRecoverFee();
}

function selectAllRecover() {
  recoverBadges.forEach(b => {
    selectedRecoverIds.add(b.tokenId);
    document.getElementById(`recoverRow_${b.tokenId}`)?.classList.add("selected");
  });
  updateRecoverFee();
}

function deselectAllRecover() {
  recoverBadges.forEach(b => {
    selectedRecoverIds.delete(b.tokenId);
    document.getElementById(`recoverRow_${b.tokenId}`)?.classList.remove("selected");
  });
  updateRecoverFee();
}

function updateRecoverFee() {
  const count = selectedRecoverIds.size;
  let feeNum = 0;
  try { feeNum = parseFloat(ethers.formatEther(recoverFeeWei)) || 0; } catch (_) {
    feeNum = parseFloat(RecoveryFeePerNFT) || 0;
  }
  const total = feeNum * count;
  const countEl = document.getElementById("recoverNftCount");
  const feeEl = document.getElementById("recoverFeePerNft");
  const totalEl = document.getElementById("recoverTotalFee");
  const tagEl = document.getElementById("recoverFeeTag");
  const btn = document.getElementById("btnAdminRecover");
  if (countEl) countEl.textContent = count + " ໃບ";
  if (feeEl) feeEl.textContent = feeNum === 0 ? "ຟຣີ" : feeNum + " LAB";
  if (totalEl) totalEl.textContent = total === 0 ? "ຟຣີ" : total.toFixed(4) + " LAB";
  if (tagEl) tagEl.textContent = feeNum === 0 ? "ຟຣີ" : feeNum + " LAB/ໃບ";
  if (btn) btn.disabled = count === 0;
}

function cancelAdminRecover() {
  document.getElementById("recoverNftSection").style.display = "none";
  document.getElementById("recoverVerifyResult").innerHTML = "";
  document.getElementById("recoverWalletInput").value = "";
  recoverOldWallet = null;
  recoverBadges = [];
}

// ============================================================
//  PULL NFT FROM OLD WALLET
// ============================================================
async function loadPullWallet() {
  const addr = document.getElementById("pullWalletInput").value.trim();
  if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
    toast("ໃສ່ address ທີ່ຖືກຕ້ອງ (0x + 40 ຕົວ)", "error"); return;
  }
  if (addr.toLowerCase() === account?.toLowerCase()) {
    toast("ນີ້ແມ່ນ wallet ປັດຈຸບັນ — ໃສ່ wallet ເກົ່າ", "error"); return;
  }

  const btn = document.getElementById("btnLoadPull");
  const resultEl = document.getElementById("pullNftResult");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  resultEl.innerHTML = '<div style="color:var(--muted,#94a3b8);font-size:0.85rem;padding:0.5rem 0;"> ກຳລັງໂຫຼດ NFT...</div>';
  document.getElementById("pullMigrateSection").style.display = "none";
  document.getElementById("pullStatus").style.display = "none";

  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const tokenIds = await c.getBadgesOf(addr);
    pullWalletAddr = addr;
    selectedPullIds.clear();
    pullBadges = [];

    if (tokenIds.length === 0) {
      resultEl.innerHTML = '<div style="color:var(--muted,#94a3b8);font-size:0.85rem;text-align:center;padding:1.5rem;">ບໍ່ພົບ NFT ໃນ wallet ນີ້</div>';
      return;
    }

    resultEl.innerHTML = `<div style="color:var(--muted,#94a3b8);font-size:0.82rem;padding:0.3rem 0 0.6rem;"> ກຳລັງໂຫຼດຂໍ້ມູນ ${tokenIds.length} ໃບ...</div>`;

    // ດຶງ fee ຈາກ contract ກ່ອນສະແດງ
    try {
      const feeWei = await c.recoveryFeePerNFT();
      RecoveryFeePerNFT = ethers.formatEther(feeWei);
    } catch (_) {}
    const feeNum = parseFloat(RecoveryFeePerNFT) || 0;
    const feeEl = document.getElementById("pullFeePerNft");
    if (feeEl) feeEl.textContent = feeNum === 0 ? "ຟຣີ" : RecoveryFeePerNFT + " LAB";

    const results = await Promise.allSettled(tokenIds.map(async (tid) => {
      const b = await c.badges(tid);
      let image = null;
      try {
        const uri = await c.tokenURI(tid);
        const meta = await fetchIpfsJson(uri);
        image = meta?.image ? ipfsToHttp(meta.image) : null;
      } catch (_) {}
      return { tokenId: Number(tid), badgeName: b.badgeName, activity: b.activity, image };
    }));
    pullBadges = results.filter(r => r.status === "fulfilled").map(r => r.value);

    renderPullList();
    document.getElementById("pullReminderWallet").textContent = shortenAddr(addr);
    document.getElementById("pullMigrateSection").style.display = "block";
  } catch (e) {
    resultEl.innerHTML = `<div style="color:#f87171;font-size:0.85rem;padding:0.5rem 0;"> ${e.message || "ໂຫຼດບໍ່ສຳເລັດ"}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> ໂຫຼດ NFT';
  }
}

function renderPullList() {
  const el = document.getElementById("pullNftResult");
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
      <span style="font-size:0.82rem;color:var(--muted,#94a3b8);">ພົບ <strong style="color:#e2e8f0;">${pullBadges.length} ໃບ</strong></span>
      <div style="display:flex;gap:0.4rem;">
        <button class="btn-profile" style="padding:0.25rem 0.7rem;font-size:0.78rem;" onclick="selectAllPull()">ທັງໝົດ</button>
        <button class="btn-profile" style="padding:0.25rem 0.7rem;font-size:0.78rem;" onclick="deselectAllPull()">ລ້າງ</button>
      </div>
    </div>
    <div class="pull-nft-list" id="pullNftGrid"></div>
  `;

  const grid = document.getElementById("pullNftGrid");
  pullBadges.forEach(b => {
    const row = document.createElement("div");
    row.className = "pull-nft-row selected";
    row.id = `pullRow_${b.tokenId}`;
    row.onclick = () => togglePullNft(b.tokenId);
    selectedPullIds.add(b.tokenId);

    const imgEl = b.image
      ? makeImgTag(b.image, "width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;")
      : `<div style="width:44px;height:44px;border-radius:8px;background:rgba(124,58,237,0.15);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${getBadgeEmoji(b.badgeName)}</div>`;

    row.innerHTML = `
      ${imgEl}
      <div style="flex:1;min-width:0;">
        <div style="font-size:0.88rem;font-weight:600;color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.badgeName}</div>
        <div style="font-size:0.75rem;color:var(--muted,#94a3b8);">#${b.tokenId}</div>
      </div>
      <div class="pull-check" id="pullCheck_${b.tokenId}"></div>
    `;
    grid.appendChild(row);
  });
  updatePullCount();
}

function togglePullNft(tokenId) {
  if (selectedPullIds.has(tokenId)) {
    selectedPullIds.delete(tokenId);
    document.getElementById(`pullRow_${tokenId}`)?.classList.remove("selected");
  } else {
    selectedPullIds.add(tokenId);
    document.getElementById(`pullRow_${tokenId}`)?.classList.add("selected");
  }
  updatePullCount();
}

function selectAllPull() {
  pullBadges.forEach(b => {
    selectedPullIds.add(b.tokenId);
    document.getElementById(`pullRow_${b.tokenId}`)?.classList.add("selected");
  });
  updatePullCount();
}

function deselectAllPull() {
  pullBadges.forEach(b => {
    selectedPullIds.delete(b.tokenId);
    document.getElementById(`pullRow_${b.tokenId}`)?.classList.remove("selected");
  });
  updatePullCount();
}

function updatePullCount() {
  const count = selectedPullIds.size;
  const feeNum = parseFloat(RecoveryFeePerNFT) || 0;
  const total = feeNum * count;
  const btn = document.getElementById("btnPullMigrate");
  const countEl = document.getElementById("pullSelectedCount");
  const totalEl = document.getElementById("pullTotalFee");
  const btnFeeEl = document.getElementById("pullBtnFee");
  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = total === 0 ? "ຟຣີ" : total.toFixed(4) + " LAB";
  if (btnFeeEl) btnFeeEl.textContent = total === 0 ? "" : `(${total.toFixed(4)} LAB)`;
  if (btn) btn.disabled = count === 0;
}

async function executePullMigrate() {
  if (selectedPullIds.size === 0) { toast("ເລືອກ NFT ກ່ອນ", "error"); return; }
  if (!signer || !pullWalletAddr) return;

  const signerAddr = await signer.getAddress();
  const statusEl = document.getElementById("pullStatus");

  if (signerAddr.toLowerCase() !== pullWalletAddr.toLowerCase()) {
    statusEl.style.cssText = "display:block;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:0.6rem 0.9rem;border-radius:10px;";
    statusEl.textContent = ` MetaMask ຕ້ອງ switch ໄປ wallet:\n${pullWalletAddr}`;
    toast(` Switch MetaMask ໄປ: ${shortenAddr(pullWalletAddr)}`, "error");
    return;
  }

  const tokenIds = pullBadges.filter(b => selectedPullIds.has(b.tokenId)).map(b => b.tokenId);
  const btn = document.getElementById("btnPullMigrate");
  btn.disabled = true;
  statusEl.style.cssText = "display:block;color:#60a5fa;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";
  statusEl.textContent = ` ກຳລັງດຶງ ${tokenIds.length} NFT ໄປ ${shortenAddr(account)}...`;

  try {
    const c = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const feeWei = await c.recoveryFeePerNFT();
    const totalFee = feeWei * BigInt(tokenIds.length);
    const tx = await c.recoverWalletSelected(account, tokenIds, { value: totalFee, gasLimit: 500000n });
    statusEl.textContent = ` ລໍຖ້າ confirm...\nTx: ${tx.hash}`;
    await tx.wait();

    statusEl.style.cssText = "display:block;color:#4ade80;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);padding:0.6rem 0.9rem;border-radius:10px;";
    statusEl.textContent = ` ດຶງ ${tokenIds.length} NFT ສຳເລັດ!`;
    toast(` ດຶງ ${tokenIds.length} NFT ສຳເລັດ!`, "success");

    pullBadges = [];
    selectedPullIds.clear();
    pullWalletAddr = null;
    document.getElementById("pullNftResult").innerHTML = "";
    document.getElementById("pullMigrateSection").style.display = "none";
    document.getElementById("pullWalletInput").value = "";
    setTimeout(() => { switchTab("my"); loadBadges(); }, 2000);
  } catch (e) {
    statusEl.style.cssText = "display:block;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:0.6rem 0.9rem;border-radius:10px;white-space:pre-line;";
    statusEl.textContent = ` ${parseEthErr(e)}`;
    toast("ດຶງ NFT ບໍ່ສຳເລັດ", "error");
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => { initAuth(); });