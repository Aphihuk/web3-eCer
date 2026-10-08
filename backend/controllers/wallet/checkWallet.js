const { db } = require("../db");

const checkWallet = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ registered: false });

  try {
    const [results] = await db.promise().query(
      "SELECT ID FROM users WHERE walletAddress = ?", [address]
    );
    res.json({ registered: results.length > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = checkWallet;
