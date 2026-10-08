const { db } = require("../db");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const { LABCHAIN_ABI } = require("../config/constants");

async function ensureRecoveryPaymentsTable() {
  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS recovery_payments (
      tx_hash VARCHAR(66) PRIMARY KEY,
      wallet_address VARCHAR(42),
      amount_wei VARCHAR(78),
      used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

const adminRecover = async (req, res) => {
  const { oldWallet, newWallet, tokenIds: requestedIds, paymentTxHash } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!oldWallet || !newWallet) {
    return res.status(400).json({ message: "Missing wallet addresses" });
  }
  if (!process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY.includes("ใส่_")) {
    return res.status(500).json({ message: "Admin private key ยังไม่ได้ตั้งค่า กรุณาแจ้ง admin" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    const [rows] = await db.promise().query(
      `SELECT ID FROM users
       WHERE (walletAddress = ? OR oldWalletAddress = ?) AND ID = ?
       UNION
       SELECT user_id FROM wallet_history
       WHERE wallet_address = ? AND user_id = ?
       LIMIT 1`,
      [oldWallet, oldWallet, decoded.id, oldWallet, decoded.id]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: "Wallet ນີ້ບໍ່ໄດ້ເປັນຂອງ account ຂອງທ່ານ" });
    }

    const rawKey = (process.env.ADMIN_PRIVATE_KEY || "").trim();
    const privateKey = rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;
    const hexPart = privateKey.slice(2);
    console.log(`[adminRecover] key length: ${hexPart.length} chars`);

    if (hexPart.length !== 64) {
      return res.status(500).json({
        message: `ADMIN_PRIVATE_KEY ຕ້ອງມີ 64 ຕົວ hex ແຕ່ໄດ້ ${hexPart.length} ຕົວ — ກວດສອບ .env ອີກຄັ້ງ`,
      });
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, LABCHAIN_ABI, adminWallet);

    let tokenIds;
    if (Array.isArray(requestedIds) && requestedIds.length > 0) {
      const allIds = [...(await contract.getBadgesOf(oldWallet))].map(id => Number(id));
      tokenIds = requestedIds.map(id => Number(id)).filter(id => allIds.includes(id));
    } else {
      tokenIds = [...(await contract.getBadgesOf(oldWallet))];
    }

    if (tokenIds.length === 0) {
      return res.json({ success: true, message: "ບໍ່ມີ NFT ທີ່ຈະ recover", count: 0 });
    }

    // ตรวจค่าธรรมเนียม recovery — per-user override (users.recoveryFee) > global on-chain,
    // ต้องเรียงตามลำดับเดียวกับฝั่ง frontend (ดู RecoveryFeePerNFT ใน index_LABChain.js)
    const [userRows] = await db.promise().query(
      "SELECT recoveryFee FROM users WHERE ID = ?",
      [decoded.id]
    );
    const dbRecoveryFee = userRows[0]?.recoveryFee;
    const feePerNFT = dbRecoveryFee != null
      ? ethers.parseEther(String(dbRecoveryFee))
      : await contract.recoveryFeePerNFT();
    const expectedFee = feePerNFT * BigInt(tokenIds.length);

    if (expectedFee > 0n) {
      if (!paymentTxHash) {
        return res.status(400).json({ message: "ກະລຸນາຈ່າຍຄ່າທຳ Recovery ກ່ອນ" });
      }

      await ensureRecoveryPaymentsTable();
      const [used] = await db.promise().query(
        "SELECT tx_hash FROM recovery_payments WHERE tx_hash = ?",
        [paymentTxHash]
      );
      if (used.length > 0) {
        return res.status(400).json({ message: "Tx ການຈ່າຍເງິນນີ້ຖືກໃຊ້ໄປແລ້ວ" });
      }

      const receipt = await provider.getTransactionReceipt(paymentTxHash);
      if (!receipt || receipt.status !== 1) {
        return res.status(400).json({ message: "ການຈ່າຍຄ່າທຳບໍ່ສຳເລັດ ຫຼື ຍັງບໍ່ confirm" });
      }

      const payTx = await provider.getTransaction(paymentTxHash);
      const fundsReceiver = await contract.fundsReceiver();
      if (
        !payTx ||
        payTx.to?.toLowerCase() !== fundsReceiver.toLowerCase() ||
        payTx.from?.toLowerCase() !== newWallet.toLowerCase() ||
        payTx.value < expectedFee
      ) {
        return res.status(400).json({ message: "ການຈ່າຍຄ່າທຳບໍ່ຖືກຕ້ອງ — ກວດ wallet/ຈຳນວນເງິນອີກຄັ້ງ" });
      }

      await db.promise().query(
        "INSERT INTO recovery_payments (tx_hash, wallet_address, amount_wei) VALUES (?, ?, ?)",
        [paymentTxHash, newWallet, payTx.value.toString()]
      );
    }

    const tx = await contract.adminForceRecover(oldWallet, newWallet, tokenIds);
    await tx.wait();

    res.json({ success: true, count: Number(tokenIds.length), txHash: tx.hash });
  } catch (e) {
    console.error("adminRecover error:", e.message);
    res.status(500).json({ message: e.reason || e.message || "Recovery failed" });
  }
};

module.exports = adminRecover;
