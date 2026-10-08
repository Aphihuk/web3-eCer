const resetPasswordEmailTemplate = (resetUrl) => `
<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <title>Verify Email</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, sans-serif; }
    body {
      margin: 0; height: 100vh; display: flex;
      justify-content: center; align-items: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    .card {
      background: #fff; padding: 40px; border-radius: 18px;
      width: 360px; text-align: center;
      box-shadow: 0 15px 40px rgba(0,0,0,0.25);
      animation: fadeIn 0.6s ease;
    }
    @keyframes fadeIn {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    h2 { margin-bottom: 10px; color: #333; }
    p  { color: #666; font-size: 14px; margin-bottom: 25px; }
    .verify-btn {
      display: inline-block; padding: 12px 22px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff; text-decoration: none; border-radius: 12px;
      font-weight: bold; box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }
    .verify-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(0,0,0,0.25); }
    .verify-btn:active { transform: scale(0.97); }
    .small { margin-top: 15px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Verify Your Email</h2>
    <p>ກົດປຸ່ມຂ້າງລຸ່ມເພື່ອຢືນຢັນອີເມລຂອງທ່ານ</p>
    <a href="${resetUrl}" class="verify-btn">ຢືນຢັນອີເມລດຽວນີ້</a>
    <div class="small">If you did not request this, please ignore this email.</div>
  </div>
</body>
</html>
`;

module.exports = resetPasswordEmailTemplate;
