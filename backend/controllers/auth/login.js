const { db } = require("../db");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  try { await db.promise().query("ALTER TABLE users ADD COLUMN role ENUM('user','support','admin') NOT NULL DEFAULT 'user'"); } catch (_) {}

  const sql = "SELECT ID, email, name, MintPrice, role, walletAddress FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = results[0];

    const token = jwt.sign(
      { id: user.ID, email: user.email, name: user.name, role: user.role || 'user' },
      "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  });
};

module.exports = login;
