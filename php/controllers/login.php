<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ເຂົ້າສູ່ລະບົບ — NFT LAO ຈຳກັດ</title>
  <link rel="stylesheet" href="../css/auth.css" />
</head>
<body>

<canvas id="bg-canvas"></canvas>

<main class="auth-page">
  <!-- <a href="../index.php" class="auth-brand">
    <span class="auth-brand-name">NFT <em>LAO</em></span>
    <span class="auth-brand-chain">
      <span class="auth-brand-dot"></span>LABChain · 5222
    </span>
  </a> -->

  <div class="auth-card">
    <div id="formState">
      <h1>ເຂົ້າສູ່ລະບົບ</h1>
      <p class="subtitle">ເຊື່ອມຕໍ່ກັບ NFT LAO ຈຳກັດ</p>
      <div class="auth-msg" id="alertBox" role="alert"></div>
      <form id="loginForm" onsubmit="return false;">

        <div class="form-group">
          <label for="emailInput">ອີເມວ</label>
          <input
            type="email"
            id="emailInput"
            placeholder="ໃສ່ອີເມວຂອງທ່ານ"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="passwordInput">ລະຫັດຜ່ານ</label>
          <div class="input-wrap">
            <input
              type="password"
              id="passwordInput"
              placeholder="ໃສ່ລະຫັດຜ່ານ"
              autocomplete="current-password"
              required
            />
            <button type="button" class="eye-btn" id="eyeBtn" onclick="toggleEye()" aria-label="ສະແດງ/ເຊື່ອງລະຫັດຜ່ານ"></button>
          </div>
        </div>

        <div style="text-align:right; margin-bottom:1.25rem;">
          <a href="/auth/Frogotpassword.php" class="forgot-link">ລືມລະຫັດຜ່ານ?</a>
        </div>

        <button type="submit" class="btn-primary" id="loginBtn" onclick="doLogin()">
          <span id="btnText">ເຂົ້າສູ່ລະບົບ</span>
        </button>

      </form>
    </div>

    <div class="success-state" id="successState">
      <div class="success-icon"></div>
      <div class="success-msg">ເຂົ້າສູ່ລະບົບສຳເລັດ!</div>
      <div class="success-sub" id="successSub">ກຳລັງກວດສອບສິດ...</div>
    </div>

    <p class="auth-footer">
      ຍັງບໍ່ມີບັນຊີ? <a href="./Organization.php">ສ້າງບັນຊີໃໝ່</a>
    </p>

  </div>
</main>
<!-- Role selection modal -->
<div id="roleModal" class="role-overlay">
  <div class="role-card">
    <div class="role-chip-wrap" id="roleChipWrap" style="display:flex;justify-content:center;gap:0.45rem;flex-wrap:wrap;margin-bottom:1.2rem;"></div>
    <h2 class="role-greeting">ຍິນດີຕ້ອນຮັບ</h2>
    <p class="role-username" id="roleUserName"></p>
    <p class="role-question">ທ່ານຢາກໄປໜ້າໃດ?</p>
    <div class="role-actions" id="roleActions"></div>
  </div>
</div>

<script src="../config/contract.config.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
<script src="../script/login.js"></script>
</body>
</html>