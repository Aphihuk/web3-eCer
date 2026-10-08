const { db } = require("../db");

const checkWalletLinked = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ linked: false });

  try {
    const [results] = await db.promise().query(
      `SELECT u.email FROM users u WHERE u.walletAddress = ?
       UNION
       SELECT u.email FROM users u
         JOIN wallet_history wh ON wh.user_id = u.ID
         WHERE wh.wallet_address = ?
       LIMIT 1`,
      [address, address]
    );
    if (results.length === 0) return res.json({ linked: false });
    res.json({ linked: true, email: results[0].email });
  } catch (e) {
    try {
      const [r2] = await db.promise().query(
        "SELECT email FROM users WHERE walletAddress = ? OR oldWalletAddress = ?",
        [address, address]
      );
      if (r2.length === 0) return res.json({ linked: false });
      res.json({ linked: true, email: r2[0].email });
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
};

module.exports = checkWalletLinked;
