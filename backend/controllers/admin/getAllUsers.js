const { db } = require("../db");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ລະບົບກ່ອນ" });

  try {
    jwt.verify(token, "SECRET_KEY");
  } catch (e) {
    return res.status(401).json({ message: "Token ໝົດອາຍຸ — Login ໃໝ່" });
  }

  try {
    try { await db.promise().query("ALTER TABLE users ADD COLUMN maxBadge INT DEFAULT NULL"); } catch (_) {}
    try { await db.promise().query("ALTER TABLE users ADD COLUMN recoveryFee DECIMAL(18,8) DEFAULT NULL"); } catch (_) {}

    const [users] = await db.promise().query(
       "SELECT ID, name, email, walletAddress, verified, maxBadge, MintPrice, recoveryFee, issuerLabel, role FROM users ORDER BY ID ASC"
    );
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = getAllUsers;
