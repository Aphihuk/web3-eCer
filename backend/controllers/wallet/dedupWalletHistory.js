const { db } = require("../db");

const dedupWalletHistory = async (req, res) => {
  try {
    const [result] = await db.promise().query(`
      DELETE wh1 FROM wallet_history wh1
      INNER JOIN wallet_history wh2
      WHERE wh1.id > wh2.id
        AND wh1.user_id = wh2.user_id
        AND wh1.wallet_address = wh2.wallet_address
    `);
    res.json({ success: true, deleted: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = dedupWalletHistory;
