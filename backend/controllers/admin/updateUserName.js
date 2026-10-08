const { db } = require("../db");
const jwt = require("jsonwebtoken");

const updateUserName = async (req, res) => {
  const { wallet, name } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false, msg: "ກະລຸນາ Login ກ່ອນ" });
  if (!wallet || !name) return res.status(400).json({ ok: false, msg: "wallet ແລະ name ຈຳເປັນ" });

  try {
    jwt.verify(token, "SECRET_KEY");
    const [result] = await db.promise().query(
      "UPDATE users SET name = ? WHERE LOWER(walletAddress) = LOWER(?)",
      [name, wallet]
    );
    if (result.affectedRows === 0) {
      return res.json({ ok: false, msg: "ບໍ່ພົບ user ທີ່ wallet ນີ້ໃນ DB" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ ok: false, msg: e.message });
  }
};

module.exports = updateUserName;
