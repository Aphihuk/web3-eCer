const { db } = require("../db");

const verifyWallet = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ verified: false });

  try {
    const [results] = await db.promise().query(
      "SELECT verified FROM users WHERE walletAddress = ?", [address]
    );
    if (results.length > 0) {
      return res.json({ verified: results[0].verified == 1, type: "current" });
    }

    const [histResults] = await db.promise().query(
      `SELECT u.verified FROM users u
       JOIN wallet_history wh ON wh.user_id = u.ID
       WHERE wh.wallet_address = ? LIMIT 1`,
      [address]
    );
    if (histResults.length > 0) {
      return res.json({ verified: histResults[0].verified == 1, type: "history" });
    }

    res.json({ verified: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = verifyWallet;
