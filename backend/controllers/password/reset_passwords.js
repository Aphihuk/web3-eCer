const { db } = require("../db");
const { get_passwords } = require("../config/store");

const reset_passwords = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const get = get_passwords.get(token);

    if (!get) return res.send("Invalid token");

    console.log(get);

    if (password !== confirmPassword) return res.send("Passwords do not match");

    const { email } = get;
    const sql = "UPDATE users SET password = ? WHERE email = ?";

    db.query(sql, [password, email], (err) => {
      if (err) return res.send(err);
      get_passwords.delete(token);
      res.send(`
        <script>
          window.location.href = "https://nft.devlaos.com/controllers/login.php";
        </script>
      `);
    });
  } catch (error) {
    console.error(error);
    return res.send("Internal Server Error");
  }
};

module.exports = reset_passwords;
