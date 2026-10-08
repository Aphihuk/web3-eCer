const { db } = require("../db");
const jwt = require("jsonwebtoken");

const saveFcmToken = async (req, res) => {
  const token    = req.headers.authorization?.split(" ")[1];
  const { fcmToken } = req.body;

  if (!token || !fcmToken) {
    return res.status(400).json({ ok: false, msg: "Missing token or fcmToken" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    try { await db.promise().query("ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255) DEFAULT NULL"); } catch (_) {}
    await db.promise().query(
      "UPDATE users SET fcm_token = ? WHERE ID = ?",
      [fcmToken, decoded.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ ok: false, msg: e.message });
  }
};

module.exports = saveFcmToken;
