const { ethers } = require("ethers");
const { db } = require("../controllers/db");
const admin = require("firebase-admin");

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

const ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

async function sendFCM(fcmToken, tokenId) {
  await admin.messaging().send({
    token: fcmToken,
    notification: {
      title: "ໄດ້ຮັບ NFT ໃໝ່!",
      body: `ມີຄົນສົ່ງໃບຢັ້ງຢືນ NFT #${tokenId} ໃຫ້ທ່ານ`,
    },
    android: { priority: "high" },
  });
  console.log(`[FCM] sent to ${fcmToken.slice(0, 12)}... — NFT #${tokenId}`);
}

let _retryTimer;

async function startListener() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

    contract.on("Transfer", async (from, to, tokenId) => {
      try {
        const [rows] = await db.promise().query(
          "SELECT fcm_token FROM users WHERE LOWER(walletAddress) = LOWER(?)",
          [to]
        );
        if (rows.length > 0 && rows[0].fcm_token) {
          await sendFCM(rows[0].fcm_token, tokenId.toString());
        }
      } catch (e) {
        console.error("[blockchain] Transfer handler error:", e.message);
      }
    });

    provider.on("error", () => {
      console.warn("[blockchain] connection lost — retrying in 10s");
      contract.removeAllListeners();
      _retryTimer = setTimeout(startListener, 10_000);
    });

    console.log("[blockchain] Transfer listener active on", process.env.CONTRACT_ADDRESS);
  } catch (e) {
    console.error("[blockchain] start failed:", e.message, "— retrying in 10s");
    _retryTimer = setTimeout(startListener, 10_000);
  }
}

function stopListener() {
  if (_retryTimer) clearTimeout(_retryTimer);
}

module.exports = { startListener, stopListener };
