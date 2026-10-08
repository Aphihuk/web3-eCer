<!DOCTYPE html>
<html lang="lo">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ລົງທະບຽນ — NFT LAO ຈຳກັດ</title>
    <link rel="stylesheet" href="../css/auth.css">
    <style>
      .sr-only {
        position: absolute; width: 1px; height: 1px;
        padding: 0; margin: -1px; overflow: hidden;
        clip: rect(0,0,0,0); white-space: nowrap; border: 0;
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    </style>
  <script src="../config/contract.config.js"></script>
</head>

<body>

    <canvas id="bg-canvas"></canvas>

    <main class="auth-page">
        <a href="./learnnbadge-ui.php" class="auth-logo">NFT LAO ຈຳກັດ</a>

        <div class="auth-card">
            <div id="formState">
                <div class="auth-msg" id="alertBox" role="alert"></div>
                <form id="loginForm" onsubmit="return false;">

                    <div class="form-group">
                        <label for="emailInput">ອີເມວ</label>
                        <input type="email" id="emailInput" placeholder="ໃສ່ອີເມວຂອງທ່ານ" autocomplete="email"
                            required />
                    </div>

                    <div class="form-group">
                        <label for="passwordInput">ລະຫັດຜ່ານ</label>
                        <div class="input-wrap">
                            <input type="password" id="passwordInput" placeholder="ໃສ່ລະຫັດຜ່ານ"
                                autocomplete="new-password" required />
                        </div>
                    </div>

                    <button type="button" class="btn-primary" onclick="register()" id="btn">
                        <span id="btnText">ລົງທະບຽນ</span>
                        <span id="spinner" style="display:none;" aria-hidden="true"></span>
                    </button>
                </form>
            </div>

            <div class="success-state" id="successState">
                <div class="success-icon"></div>
                <div class="success-msg">ລົງທະບຽນສຳເລັດ!</div>
                <div class="success-sub">ກວດສອບອີເມວຂອງທ່ານເພື່ອຢັ້ງຢືນ</div>
            </div>

        </div>
    </main>
</body>
<script>
    function showAlert(msg, type = "error") {
        const el = document.getElementById("alertBox");
        el.className = `auth-msg ${type} show`;
        el.innerHTML = msg;
    }
    async function register() {
        const btn = document.getElementById("btn");
        const spinner = document.getElementById("spinner");
        const btnText = document.getElementById("btnText");

        btn.disabled = true;
        spinner.style.display = "inline-block";
        btnText.innerText = "ກຳລັງດຳເນີນການ...";
        try {

            const response = await fetch(API_BASE_URL + "/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: document.getElementById("emailInput").value,
                    password: document.getElementById("passwordInput").value
                }),
            });

            const data = await response.json();
            if (data.status === true) {
                const d = document.getElementById("formState");
                d.style.display = "none";
                const s = document.getElementById("successState");
                s.style.display = "block";
            } else {
                showAlert(data.message, "error");
            }

        } catch (error) {
            console.log(error);
            showAlert("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່", "error");
        }
        btn.disabled = false;
        spinner.style.display = "none";
        btnText.innerText = "ລົງທະບຽນ";
    }
</script>

</html>
