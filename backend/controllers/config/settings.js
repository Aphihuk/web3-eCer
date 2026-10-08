const { db } = require("../db");
const jwt = require("jsonwebtoken");

const ALLOWED_KEYS = ["pinata_jwt"];

async function ensureTable() {
  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      \`value\` TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

const getSetting = async (req, res) => {
  const { key } = req.params;
  if (!ALLOWED_KEYS.includes(key)) return res.status(403).json({ message: "Key ນີ້ບໍ່ອະນຸຍາດ" });
  try {
    await ensureTable();
    const [rows] = await db.promise().query("SELECT `value` FROM settings WHERE `key` = ?", [key]);
    res.json({ value: rows[0]?.value || null });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const setSetting = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });
  try { jwt.verify(token, "SECRET_KEY"); } catch (_) {
    return res.status(401).json({ message: "Token ໝົດອາຍຸ" });
  }

  const { key } = req.params;
  const { value } = req.body;
  if (!ALLOWED_KEYS.includes(key)) return res.status(403).json({ message: "Key ນີ້ບໍ່ອະນຸຍາດ" });
  if (value === undefined) return res.status(400).json({ message: "ຂໍ້ມູນບໍ່ຄົບ" });

  try {
    await ensureTable();
    await db.promise().query(
      "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()",
      [key, value, value]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getSetting, setSetting };
