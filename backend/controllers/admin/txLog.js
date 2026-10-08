/*
  SQL (run once):
  CREATE TABLE tx_logs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    action     VARCHAR(500) NOT NULL,
    tx_hash    VARCHAR(100) DEFAULT NULL,
    ok         TINYINT(1)  NOT NULL DEFAULT 1,
    wallet     VARCHAR(100) DEFAULT NULL,
    created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
  );
*/
const { db } = require("../db");
const jwt    = require("jsonwebtoken");

const saveTxLog = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false });
  const { action, tx_hash, ok, wallet } = req.body;
  if (!action) return res.status(400).json({ ok: false, msg: "action required" });
  try {
    jwt.verify(token, "SECRET_KEY");
    await db.promise().query(
      "INSERT INTO tx_logs (action, tx_hash, ok, wallet) VALUES (?, ?, ?, ?)",
      [action, tx_hash || null, ok ? 1 : 0, wallet || null]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ ok: false, msg: e.message });
  }
};

const getTxLogs = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false });
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  try {
    jwt.verify(token, "SECRET_KEY");
    const [rows] = await db.promise().query(
      "SELECT id, action, tx_hash, ok, wallet, created_at FROM tx_logs ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ total }]] = await db.promise().query("SELECT COUNT(*) as total FROM tx_logs");
    res.json({ ok: true, logs: rows, total });
  } catch (e) {
    res.status(401).json({ ok: false, msg: e.message });
  }
};

const clearTxLogs = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false });
  try {
    jwt.verify(token, "SECRET_KEY");
    await db.promise().query("DELETE FROM tx_logs");
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ ok: false, msg: e.message });
  }
};

module.exports = { saveTxLog, getTxLogs, clearTxLogs };
