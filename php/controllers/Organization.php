<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Register — Issuer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0f;
      --card: #111118;
      --border: #1e1e2e;
      --accent: #7c6af7;
      --accent2: #4ade80;
      --danger: #f87171;
      --text: #e2e2f0;
      --muted: #6b6b80;
      --input-bg: #0d0d16;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Noto Sans Lao', 'Syne', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(124,106,247,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(124,106,247,.04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    body::after {
      content: '';
      position: fixed;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124,106,247,.12) 0%, transparent 70%);
      top: -200px; right: -200px;
      pointer-events: none;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 460px;
      position: relative;
      z-index: 1;
    }

    .card-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .card-header .logo {
      font-size: .75rem;
      font-family: 'Space Mono', monospace;
      color: var(--accent);
      letter-spacing: .15em;
      text-transform: uppercase;
      margin-bottom: .75rem;
    }

    .card-header h1 { font-size: 1.8rem; font-weight: 800; color: #fff; }
    .card-header p  { font-size: .85rem; color: var(--muted); margin-top: .4rem; }


    .steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: .35rem;
      font-size: .75rem;
      font-family: 'Space Mono', monospace;
      color: var(--muted);
      transition: color .3s;
    }

    .step.active { color: var(--accent); }
    .step.done   { color: var(--accent2); }

    .step-dot {
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 1.5px solid currentColor;
      display: flex; align-items: center; justify-content: center;
      font-size: .65rem; font-weight: 700;
      transition: background .3s;
    }

    .step.active .step-dot { background: var(--accent); border-color: var(--accent); color: #fff; }
    .step.done   .step-dot { background: var(--accent2); border-color: var(--accent2); color: #000; }

    .step-line { flex: 1; height: 1px; background: var(--border); max-width: 50px; }


    .form-group { margin-bottom: 1.1rem; }

    label {
      display: block;
      font-size: .78rem;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: .4rem;
      letter-spacing: .05em;
      text-transform: uppercase;
    }

    input[type=text], input[type=email], input[type=password] {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: .75rem 1rem;
      color: var(--text);
      font-family: 'Noto Sans Lao', 'Syne', sans-serif;
      font-size: .95rem;
      outline: none;
      transition: border-color .2s;
    }

    input:focus { border-color: var(--accent); }

    .wallet-box {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: .75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      cursor: pointer;
      transition: border-color .2s;
    }

    .wallet-box:hover { border-color: var(--accent); }
    .wallet-box.connected { border-color: var(--accent2); }

    .wallet-addr {
      font-family: 'Space Mono', monospace;
      font-size: .8rem;
      color: var(--accent2);
    }

    .wallet-placeholder { font-size: .9rem; color: var(--muted); }

    /* Alert */
    .alert {
      border-radius: 10px;
      padding: .75rem 1rem;
      font-size: .85rem;
      margin-bottom: 1rem;
      display: none;
    }
    .alert.show    { display: block; }
    .alert.error   { background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); color: var(--danger); }
    .alert.success { background: rgba(74,222,128,.1);  border: 1px solid rgba(74,222,128,.3);  color: var(--accent2); }
    .alert.info    { background: rgba(124,106,247,.1); border: 1px solid rgba(124,106,247,.3); color: var(--accent); }

    /* Buttons */
    .btn {
      width: 100%;
      padding: .85rem;
      border-radius: 12px;
      border: none;
      font-family: 'Noto Sans Lao', 'Syne', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all .2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .5rem;
    }

    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #6b5ce7; transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
      margin-top: .5rem;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Success */
    .success-state { display: none; text-align: center; padding: 1rem 0; }
    .success-icon  { font-size: 3.5rem; margin-bottom: 1rem; animation: pop .4s ease; }
    @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
    .success-state h2 { font-size: 1.4rem; font-weight: 800; color: var(--accent2); margin-bottom: .5rem; }
    .success-state p  { font-size: .88rem; color: var(--muted); line-height: 1.6; }

    /* Verify state */
    .verify-state { display: none; text-align: center; }
    .verify-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .verify-state h2 { font-size: 1.3rem; font-weight: 800; margin-bottom: .5rem; }
    .verify-state p  { font-size: .85rem; color: var(--muted); line-height: 1.6; margin-bottom: 1.5rem; }

    .divider { text-align: center; color: var(--muted); font-size: .8rem; margin: 1rem 0; }
    .link { color: var(--accent); text-decoration: none; font-size: .85rem; }
    .link:hover { text-decoration: underline; }



    /* Free badge */
    .free-badge {
      display: inline-flex;
      align-items: center;
      gap: .3rem;
      background: rgba(74,222,128,.1);
      border: 1px solid rgba(74,222,128,.3);
      color: var(--accent2);
      font-size: .75rem;
      font-family: 'Space Mono', monospace;
      padding: .25rem .6rem;
      border-radius: 20px;
      margin-top: .5rem;
    }
  </style>
</head>
<body>

<div class="card">
  <div class="card-header">
    <div class="logo"> LearnBadge</div>
    <h1>Issuer Register</h1>
    <p>ລົງທະບຽນເພື່ອອອກໃບຢັ້ງຢືນ NFT</p>
    <div class="free-badge"> ລົງທະບຽນຟຣີ</div>
  </div>


  <div class="alert" id="alertBox"></div>

  <!-- STEP 1 -->
  <div id="step1">

    <!-- Registration form -->
    <div id="registrationForm">
      <div class="form-group">
        <label>ຊື່ / Name</label>
        <input type="text" id="nameInput" placeholder="ຊື່ຂອງທ່ານ / Your name" />
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" id="emailInput" placeholder="example@email.com" autocomplete="email" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" id="passwordInput" placeholder="••••••••" autocomplete="new-password" />
      </div>

      <div class="form-group">
        <label>Wallet Address</label>
        <div class="wallet-box" id="walletBox" onclick="connectWalletForRegister()">
          <span class="wallet-placeholder" id="walletPlaceholder"> Connect MetaMask</span>
          <span class="wallet-addr" id="walletAddrDisplay" style="display:none"></span>
          <span>→</span>
        </div>
      </div>

      <button class="btn btn-primary" id="registerBtn" onclick="submitRegister()">
        <span id="registerBtnText">ລົງທະບຽນ</span>
        <span class="spinner" id="registerSpinner" style="display:none"></span>
      </button>
    </div> <!-- /registrationForm -->

    <div class="divider">ມີບັນຊີແລ້ວ? <a href="./login.php" class="link">ເຂົ້າສູ່ລະບົບ</a></div>
  </div>


  <div class="verify-state" id="step2">
    <div class="icon"></div>
    <h2>ລົງທະບຽນສຳເລັດ!</h2>
    <p>ໄດ້ທຳການສົ່ງໄປທີ່<br><strong id="sentEmail" style="color:var(--text)"></strong><br>ກ່ວດສອບທາງ Email ໄດ້ເລີຍ</p>
  </div>


  <div class="success-state" id="successState">
    <div class="success-icon"></div>
    <h2>ລົງທະບຽນສຳເລັດ!</h2>
    <p>ທ່ານສາມາດ Mint NFT Badge ໄດ້ແລ້ວ<br>ກຳລັງໄປໜ້າ Mint...</p>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
<script src="../config/contract.config.js"></script>
<script>
// CONTRACT_ADDRESS, CHAIN_ID, API_BASE_URL ໂຫຼດຈາກ contract.config.js
const API_BASE    = API_BASE_URL // ??????? contract.config.js;
const LABCHAIN_ID = typeof CHAIN_ID    !== "undefined" ? CHAIN_ID     : "5222";

let walletAddress = null;
let provider = null;
let signer = null;
let registeredEmail = "";


// ===== WALLET =====
async function connectWalletForRegister() {
  if (!window.ethereum) { showAlert("ກະລຸນາຕິດຕັ້ງ MetaMask", "error"); return; }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const network = await provider.getNetwork();
    if (network.chainId.toString() !== LABCHAIN_ID) {
      showAlert("ກະລຸນາ Switch ໄປ LAB Chain (ID: " + LABCHAIN_ID + ")", "error");
      return;
    }

    signer = await provider.getSigner();
    walletAddress = await signer.getAddress();

    document.getElementById("walletPlaceholder").style.display = "none";
    document.getElementById("walletAddrDisplay").style.display = "inline";
    document.getElementById("walletAddrDisplay").textContent = walletAddress.slice(0,6) + "..." + walletAddress.slice(-4);
    document.getElementById("walletBox").classList.add("connected");
    showAlert(" Wallet: " + walletAddress.slice(0,6) + "..." + walletAddress.slice(-4), "success");
  } catch(e) {
    showAlert(e.message || "Connect wallet failed", "error");
  }
}


async function submitRegister() {
  const name     = document.getElementById("nameInput").value.trim();
  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  if (!name)          return showAlert("ກະລຸນາໃສ່ຊື່", "error");
  if (!email)         return showAlert("ກະລຸນາໃສ່ Email", "error");
  if (!password)      return showAlert("ກະລຸນາໃສ່ Password", "error");
  if (!walletAddress) return showAlert("ກະລຸນາ Connect Wallet ກ່ອນ", "error");

  setLoading("register", true);
  try {
    // Step 1: Register กับ API
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, wallet: walletAddress })
    });
    const data = await res.json();

    if (data.status !== true) {
      showAlert(data.message || "ລົງທະບຽນບໍ່ສຳເລັດ", "error");
      setLoading("register", false);
      return;
    }

    // Step 2: Register บน Blockchain (เช็คก่อนว่าลงทะเบียนแล้วหรือยัง)
    const REGISTER_ABI = [
      "function register(string calldata name) external",
      "function getProfile(address) view returns (tuple(uint8 userType, string name, bool active, address recoveredTo, uint256 registeredAt))"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTER_ABI, signer);

    const prof = await contract.getProfile(walletAddress);
    if (Number(prof.userType) === 0) {
      // ยังไม่ได้ register → register
      showAlert("ກຳລັງລົງທະບຽນໃນ Blockchain... ກະລຸນາຢືນຢັນໃນ MetaMask", "info");
      const tx = await contract.register(name);
      showAlert("ກຳລັງລໍຖ້າ Blockchain confirm...", "info");
      await tx.wait();
    } else {
      // ລົງທະບຽນແລ້ວ → ຂ້າມ
      showAlert(" Wallet ລົງທະບຽນໃນ Blockchain ແລ້ວ", "info");
    }

    // Step 3: ผ่านทั้งคู่แล้ว
    registeredEmail = email;
    document.getElementById("sentEmail").textContent = email;
    goToStep(2);

  } catch(e) {
    if (e.code === 4001 || e.code === "ACTION_REJECTED") {
      showAlert(" ທ່ານປະຕິເສດການ Confirm ໃນ MetaMask", "error");
    } else {
      showAlert("Error: " + (e.reason || e.message || "Unknown error"), "error");
    }
  }

  setLoading("register", false);
}


async function checkVerified() {
  setLoading("verify", true);
  try {
    const res = await fetch(`${API_BASE}/api/check-verified`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: registeredEmail })
    });
    const data = await res.json();

    if (data.verified === true) {
      showSuccess();
    } else {
      showAlert("ຍັງບໍ່ໄດ້ verify Email ກະລຸນາກົດລິ້ງໃນ Email ກ່ອນ", "error");
    }
  } catch(e) {
    showAlert("Server Error: " + e.message, "error");
  }
  setLoading("verify", false);
}

async function resendEmail() {
  try {
    await fetch(`${API_BASE}/api/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: registeredEmail })
    });
    showAlert("ສົ່ງ Email ໃໝ່ແລ້ວ ️", "success");
  } catch(e) {
    showAlert("ສົ່ງ Email ໃໝ່ບໍ່ສຳເລັດ", "error");
  }
}

// ===== UI HELPERS =====
function goToStep(n) {
  document.getElementById("step1").style.display = n === 1 ? "block" : "none";
  document.getElementById("step2").style.display = n === 2 ? "block" : "none";
  document.getElementById("successState").style.display = "none";
  clearAlert();
}

function showSuccess() {
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("stepsBar").style.display = "none";
  document.getElementById("successState").style.display = "block";
  clearAlert();
  setTimeout(() => { window.location.href = "./learnnbadge-ui.php"; }, 3000);
}

function showAlert(msg, type = "error") {
  const el = document.getElementById("alertBox");
  el.className = `alert ${type} show`;
  el.textContent = msg;
}

function clearAlert() {
  const el = document.getElementById("alertBox");
  el.className = "alert";
  el.textContent = "";
}

function setLoading(btn, loading) {
  const map = {
    register: ["registerBtn","registerBtnText","registerSpinner","ລົງທະບຽນ"],
    verify:   ["verifyCheckBtn","verifyBtnText","verifySpinner"," ຢືນຢັນແລ້ວ ໄປຕໍ່"],
  };
  const [btnId, textId, spinnerId, label] = map[btn];
  document.getElementById(btnId).disabled = loading;
  document.getElementById(textId).textContent = loading ? "ກຳລັງດຳເນີນການ..." : label;
  document.getElementById(spinnerId).style.display = loading ? "inline-block" : "none";
}
</script>
</body>
</html>
