const resetPasswordFormTemplate = (token, apiBaseUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Reset Password</title>
  <style>
    * { box-sizing: border-box; font-family: "Arial", sans-serif; }
    body {
      margin: 0; height: 100vh; display: flex;
      justify-content: center; align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    .box {
      background: #fff; padding: 35px; border-radius: 16px;
      width: 340px; box-shadow: 0 15px 40px rgba(0,0,0,0.2);
      animation: fadeIn 0.6s ease;
    }
    @keyframes fadeIn {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    h2 { text-align: center; margin-bottom: 20px; color: #333; }
    input {
      width: 100%; padding: 12px; margin-top: 12px;
      border: 1px solid #ddd; border-radius: 10px;
      outline: none; transition: 0.3s;
    }
    input:focus { border-color: #667eea; box-shadow: 0 0 8px rgba(102,126,234,0.3); }
    button {
      width: 100%; padding: 12px; margin-top: 18px;
      border: none; border-radius: 10px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white; font-size: 16px; cursor: pointer; transition: 0.3s;
    }
    button:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
    .note { text-align: center; font-size: 12px; color: #888; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Reset Password</h2>
    <form action="${apiBaseUrl}/reset/${token}" method="POST">
      <input type="password" name="password" placeholder="New Password" required />
      <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
      <button type="submit">Change Password</button>
    </form>
    <div class="note">NTL_labchain System</div>
  </div>
</body>
</html>
`;

module.exports = resetPasswordFormTemplate;
