const { db } = require("../db");
const { pendingUsers } = require("../config/store");

const finalizeVerification = (token, res, onSuccess) => {
  const get = pendingUsers.get(token);

  if (!get) return res.send("Invalid or expired token");

  const { name, email, password, wallet } = get;

  const sql = "INSERT INTO users (name, email, password, verified, walletAddress) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, email, password, true, wallet], async (err, result) => {
    if (err) return res.status(500).send(err);

    pendingUsers.delete(token);

    if (wallet && result.insertId) {
      try {
        await db.promise().query(`
          CREATE TABLE IF NOT EXISTS wallet_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            wallet_address VARCHAR(42) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_wallet (wallet_address)
          )
        `);
        await db.promise().query(
          "INSERT IGNORE INTO wallet_history (user_id, wallet_address) VALUES (?, ?)",
          [result.insertId, wallet.toLowerCase()]
        );
      } catch (_) {}
    }

    onSuccess(res);
  });
};

// browser
const verliflie = async (req, res) => {
  finalizeVerification(req.params.token, res, (res) => {
    res.send(`
      <script>
        window.location.href = "https://nft.devlaos.com/controllers/login.php";
      </script>
    `);
  });
};

// mobile
const verliflieMobile = async (req, res) => {
  finalizeVerification(req.params.token, res, (res) => {
    res.send(`
      <html>
        <body style="font-family:sans-serif;text-align:center;padding-top:50px;">
          <h>verliflie email ສຳເລັດແລ້ວ</h>
          <p>Your email has been verified. You can now return to the app and log in.</p>
        </body>
      </html>
    `);
  });
};

module.exports = { verliflie, verliflieMobile };
