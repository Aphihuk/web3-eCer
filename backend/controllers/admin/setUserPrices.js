const { db } = require("../db");
const jwt = require("jsonwebtoken");

const setUserPrices = async (req, res) => {
  const { userId, mintPrice, recoveryFee, issuerLabel } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });

  try {
    jwt.verify(token, "SECRET_KEY");
    const mp = (mintPrice   === null || mintPrice   === "" || mintPrice   === undefined) ? null : parseFloat(mintPrice);
    const rf = (recoveryFee === null || recoveryFee === "" || recoveryFee === undefined) ? null : parseFloat(recoveryFee);
    const il = (issuerLabel === null || issuerLabel === "" || issuerLabel === undefined) ? null : issuerLabel;
    try { await db.promise().query("ALTER TABLE users ADD COLUMN issuerLabel VARCHAR(255) DEFAULT NULL"); } catch (_) {}
    await db.promise().query(
      "UPDATE users SET MintPrice = ?, recoveryFee = ?, issuerLabel = ? WHERE ID = ?",
      [mp, rf, il, userId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

module.exports = setUserPrices;
