<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frogotpassword</title>
    <link rel="stylesheet" href="../css/auth.css">
  <script src="../config/contract.config.js"></script>
</head>
<body>

    <canvas id="bg-canvas"></canvas>

    <main class="auth-page">
        <!-- <a href="./learnnbadge-ui.php" class="auth-logo">reset password</a> -->

        <div class="auth-card">
            <div id="formState">
                <div class="auth-msg" id="alertBox" role="alert"></div>
                <form id="loginForm" onsubmit="return false;">

                    <div class="form-group">
                        <label for="emailInput">Email</label>
                        <input type="email" id="emailInput" placeholder="enter your email" autocomplete="email"
                            required />
                    </div>


                    <button type="button" class="btn-primary" onclick="register()" id="btn">
                        <span id="btnText">Sign In</span>
                        <span id="spinner" style="display:none;"></span>
                    </button>
                </form>
            </div>

            <div class="success-state" id="successState">
                <div>check Email to verify</div>
            </div>

            <!-- <p class="auth-footer">
      Don't have an account? <a href="/auth/register.php">Create one</a>
    </p> -->

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
        btnText.innerText = "Loading...";
        try {

            const response = await fetch(API_BASE_URL + "/api/get_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: document.getElementById("emailInput").value,
                }),
            });

            const data = await response.json();
            if (data.status === true) {
                const d = document.getElementById("formState");
                d.style.display = "none";
                const s = document.getElementById("successState");
                s.style.display = "block";
            } else {
                showAlert(data.message, "error");;

            }

        } catch (error) {
            console.log(error);
            alert("Server Error");

        }
        btn.disabled = false;
        spinner.style.display = "none";
        btnText.innerText = "Sign In";

    }

</script>
</html>