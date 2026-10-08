const { db } = require("../db");
const jwt = require("jsonwebtoken");

const getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    try { await db.promise().query("ALTER TABLE users ADD COLUMN recoveryFee DECIMAL(18,8) DEFAULT NULL"); } catch (_) {}
    try { await db.promise().query("ALTER TABLE users ADD COLUMN issuerLabel VARCHAR(255) DEFAULT NULL"); } catch (_) {}
    try { await db.promise().query("ALTER TABLE users ADD COLUMN role ENUM('user','support','admin') DEFAULT 'user'"); } catch (_) {}

    const [results] = await db.promise().query(
      "SELECT ID, email, name, MintPrice, recoveryFee, maxBadge, issuerLabel, walletAddress, oldWalletAddress, verified, role FROM users WHERE ID = ?",
      [decoded.id]
    );

    if (!results.length) return res.status(404).json({ message: "User not found" });

    const user = results[0];

    let walletHistory = [];
    try {
      const [hist] = await db.promise().query(
        "SELECT wallet_address FROM wallet_history WHERE user_id = ? ORDER BY changed_at DESC",
        [user.ID]
      );
      walletHistory = hist.map(h => h.wallet_address);
    } catch (_) {}

    res.json({
      id: user.ID,
      email: user.email,
      mintPrice: user.MintPrice,
      recoveryFeePerNFT: user.recoveryFee,
      maxBadge: user.maxBadge ?? null,
      issuerLabel: user.issuerLabel || null,
      name: user.name,
      oldWalletAddress: user.oldWalletAddress,
      walletAddress: user.walletAddress,
      verified: user.verified,
      role: user.role || "user",
      walletHistory,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = getMe;
