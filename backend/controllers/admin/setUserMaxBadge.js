const { db } = require("../db");
const jwt = require("jsonwebtoken");

const setUserMaxBadge = async (req, res) => {
  const { userId, maxBadge } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });

  try {
    jwt.verify(token, "SECRET_KEY");
    const val = (maxBadge === null || maxBadge === "" || maxBadge === undefined) ? null : parseInt(maxBadge);
    await db.promise().query(
      "UPDATE users SET maxBadge = ? WHERE ID = ?",
      [val, userId]
    );
    res.json({ success: true, userId, maxBadge: val });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

module.exports = setUserMaxBadge;
