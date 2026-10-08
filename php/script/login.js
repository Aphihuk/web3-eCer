
const MINT_URL    = "/controllers/learnnbadge-ui.php";
const ADMIN_URL   = "/Admin/admin.php";
const SUPPORT_URL = "/support/dashboard.php";
const _RPC        = "https://rpc.labchain.la";

function setCookie(name, value, days) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/`;
}

function showAlert(msg, type = "error") {
  const el = document.getElementById("alertBox");
  el.className = `auth-msg ${type} show`;
  el.innerHTML = msg;
}
function hideAlert() {
  const el = document.getElementById("alertBox");
  el.className = "auth-msg";
  el.innerHTML = "";
}


async function detectRole(token) {
  try {
    const meRes = await fetch(`${API_BASE_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return { roles: ["user"], name: "" };
    const me = await meRes.json();

    const roles = new Set();
    const name  = me.name || me.email || "";


    if (me.role === "support") roles.add("support");
    if (me.role === "admin")   roles.add("owner");

    const wallet = me.walletAddress;
    if (wallet) {
      const provider = new ethers.JsonRpcProvider(_RPC);
      const c = new ethers.Contract(CONTRACT_ADDRESS, [
        "function owner() view returns (address)",
        "function operators(address) view returns (bool)",
      ], provider);

      const [owner, isOp] = await Promise.all([
        c.owner().catch(() => null),
        c.operators(wallet).catch(() => false),
      ]);

      if (owner && owner.toLowerCase() === wallet.toLowerCase()) roles.add("owner");
      if (isOp) roles.add("operator");
    }

    return { roles: roles.size ? [...roles] : ["user"], name };
  } catch {
    return { roles: ["user"], name: "" };
  }
}

// ── Role modal ────────────────────────────────────────────────────
const ROLE_CONFIG = {
  owner: {
    chipLabel: "Owner",
    chipClass: "chip-owner",
    destinations: [
      { label: "Admin Panel",  icon: "️", url: ADMIN_URL,   cls: "btn-violet" },
      { label: "Mint Page",    icon: "", url: MINT_URL,    cls: "" },
    ],
  },
  operator: {
    chipLabel: "Operator",
    chipClass: "chip-operator",
    destinations: [
      { label: "Admin Panel",  icon: "️", url: ADMIN_URL,   cls: "btn-teal" },
      { label: "Mint Page",    icon: "", url: MINT_URL,    cls: "" },
    ],
  },
  support: {
    chipLabel: "Support",
    chipClass: "chip-support",
    destinations: [
      { label: "Support Dashboard", icon: "", url: SUPPORT_URL, cls: "btn-cyan" },
      { label: "Mint Page",         icon: "", url: MINT_URL,    cls: "" },
    ],
  },
};

function showRoleModal(roles, name) {
  // Chips — one per role
  document.getElementById("roleChipWrap").innerHTML = roles
    .map(r => {
      const cfg = ROLE_CONFIG[r];
      return cfg ? `<span class="role-chip ${cfg.chipClass}">${cfg.chipLabel}</span>` : "";
    }).join("");

  document.getElementById("roleUserName").textContent = name || "";

  // Merge destinations across all roles, deduplicate by URL
  const seen = new Set();
  const destinations = [];
  for (const r of roles) {
    for (const d of (ROLE_CONFIG[r]?.destinations || [])) {
      if (!seen.has(d.url)) { seen.add(d.url); destinations.push(d); }
    }
  }

  document.getElementById("roleActions").innerHTML = destinations
    .map(d => `<a href="${d.url}" class="role-btn ${d.cls}">
        <span>${d.icon}&nbsp; ${d.label}</span>
        <span class="role-btn-arrow">→</span>
      </a>`).join("");

  document.getElementById("roleModal").classList.add("open");
}

async function checkRoleAndRedirect(token) {
  const { roles, name } = await detectRole(token);
  if (roles.length === 1 && roles[0] === "user") {
    window.location.href = MINT_URL;
    return;
  }
  document.getElementById("successState").style.display = "none";
  showRoleModal(roles, name);
}


async function doLogin() {
  const email    = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value;
  const btn      = document.getElementById("loginBtn");
  const btnText  = document.getElementById("btnText");

  hideAlert();

  if (!email || !password) {
    showAlert(" Please enter your Email and Password.", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert(" Invalid email format.", "error");
    return;
  }

  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span>Signing in...';

  try {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.message || data.error || data.msg || "Login failed.";
      showAlert(` ${errMsg}`, "error");
      btn.disabled = false;
      btnText.textContent = "Sign In";
      return;
    }

    const token =
      data.token        ||
      data.authToken    ||
      data.access_token ||
      data.jwt          ||
      data?.data?.token ||
      null;

    if (!token) {
      showAlert("No token found in response — please check the API.", "error");
      btn.disabled = false;
      btnText.textContent = "Sign In";
      return;
    }

    localStorage.setItem("authToken", token);
    setCookie("authToken", token, 7);

    document.getElementById("formState").style.display    = "none";
    document.getElementById("successState").style.display = "block";

    await checkRoleAndRedirect(token);

  } catch (err) {
    showAlert(`Cannot connect to API: ${err.message}`, "error");
    btn.disabled = false;
    btnText.textContent = "Sign In";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});

// ── Already signed in — redirect silently, no modal ──────────────
const PRIMARY_URL = { owner: ADMIN_URL, operator: ADMIN_URL, support: SUPPORT_URL, user: MINT_URL };

(function checkExisting() {
  const existing = localStorage.getItem("authToken");
  if (!existing) return;

  fetch(`${API_BASE_URL}/api/me`, {
    headers: { Authorization: `Bearer ${existing}` },
  })
    .then(async r => {
      if (!r.ok) { localStorage.removeItem("authToken"); return; }
      document.getElementById("formState").style.display    = "none";
      document.getElementById("successState").style.display = "block";
      document.getElementById("successSub").textContent     = "ກຳລັງກວດສອບສິດ...";
      const { roles } = await detectRole(existing);
      const primaryRole = roles.find(r => r !== "user") || "user";
      window.location.replace(PRIMARY_URL[primaryRole] || MINT_URL);
    })
    .catch(() => {});
})();

// ── Particle canvas ───────────────────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById("bg-canvas");
  const ctx    = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.vx    = (Math.random() - 0.5) * 0.3;
      this.vy    = (Math.random() - 0.5) * 0.3;
      this.r     = Math.random() * 1.4 + 0.4;
      this.a     = Math.random() * 0.4 + 0.1;
      const roll = Math.random();
      this.color = roll < 0.45 ? "#a78bfa"
                 : roll < 0.80 ? "#38bdf8"
                 : "#f472b6";
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle   = this.color;
      ctx.globalAlpha = this.a;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function connectLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(167,139,250,${0.10 * (1 - dist / 120)})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectLines();
    requestAnimationFrame(loop);
  }
  loop();
})();
