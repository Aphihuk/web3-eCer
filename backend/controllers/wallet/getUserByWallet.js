const { db } = require("../db");
const jwt = require("jsonwebtoken");

const getUserByWallet = async (req, res) => {
  const { address } = req.query;
  const token = req.headers.authorization?.split(" ")[1];
  if (!address) return res.status(400).json({ message: "Missing address" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    const [results] = await db.promise().query(
      `SELECT u.ID, u.name, u.email, u.walletAddress, u.verified, u.maxBadge,
              GROUP_CONCAT(wh.wallet_address ORDER BY wh.changed_at DESC) as history
       FROM users u
       LEFT JOIN wallet_history wh ON wh.user_id = u.ID
       WHERE u.walletAddress = ?
          OR wh.wallet_address = ?
       GROUP BY u.ID LIMIT 1`,
      [address, address]
    );

    if (results.length === 0) return res.json({ found: false });

    const u = results[0];
    res.json({
      found: true,
      name: u.name,
      email: u.email,
      walletAddress: u.walletAddress,
      verified: u.verified == 1,
      maxBadge: u.maxBadge ?? null,
      walletHistory: u.history ? u.history.split(",") : [],
    });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

module.exports = getUserByWallet;
