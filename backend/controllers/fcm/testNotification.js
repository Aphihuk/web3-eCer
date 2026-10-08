const { db } = require("../db");
const admin = require("firebase-admin");

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

const testNotification = async (req, res) => {
  const { wallet, title, body } = req.body;

  if (!wallet) {
    return res.status(400).json({ ok: false, msg: "wallet is required" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT fcm_token FROM users WHERE LOWER(walletAddress) = LOWER(?)",
      [wallet]
    );

    if (!rows.length || !rows[0].fcm_token) {
      return res.status(404).json({ ok: false, msg: "No FCM token found for this wallet" });
    }

    const fcmToken = rows[0].fcm_token;

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: title || "ທົດສອບການແຈ້ງເຕືອນ",
        body: body || "ນີ້ແມ່ນການທົດສອບຈາກ backend",
      },
      android: { priority: "high" },
    });

    res.json({ ok: true, msg: "Notification sent", to: wallet });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
};

module.exports = testNotification;
