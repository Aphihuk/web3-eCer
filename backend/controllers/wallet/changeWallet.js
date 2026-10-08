const { db } = require("../db");
const jwt = require("jsonwebtoken");

const changeWallet = async (req, res) => {
  const { newWalletAddress, oldWalletAddress } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!newWalletAddress || !oldWalletAddress) {
    return res.status(400).json({ message: "Missing wallet address" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    const [existing] = await db.promise().query(
      "SELECT ID FROM users WHERE walletAddress = ? AND ID != ?",
      [newWalletAddress, decoded.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Wallet already linked to another account" });
    }

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

    await db.promise().query(`
      DELETE wh1 FROM wallet_history wh1
      INNER JOIN wallet_history wh2
      WHERE wh1.id > wh2.id
        AND wh1.user_id = wh2.user_id
        AND wh1.wallet_address = wh2.wallet_address
    `).catch(() => {});

    const [already] = await db.promise().query(
      "SELECT id FROM wallet_history WHERE user_id = ? AND LOWER(wallet_address) = LOWER(?)",
      [decoded.id, oldWalletAddress]
    );
    if (already.length === 0) {
      await db.promise().query(
        "INSERT INTO wallet_history (user_id, wallet_address) VALUES (?, ?)",
        [decoded.id, oldWalletAddress.toLowerCase()]
      );
    }

    await db.promise().query(
      "UPDATE users SET walletAddress = ?, oldWalletAddress = ? WHERE ID = ?",
      [newWalletAddress, oldWalletAddress, decoded.id]
    );

    res.json({ success: true, message: "Wallet changed successfully" });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

module.exports = changeWallet;
