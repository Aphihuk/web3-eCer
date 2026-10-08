const { db } = require("../db");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const { LABCHAIN_ABI } = require("../config/constants");

const registerWallet = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });

  let decoded;
  try {
    decoded = jwt.verify(token, "SECRET_KEY");
  } catch (e) {
    return res.status(401).json({ message: "Token ໝົດອາຍຸ" });
  }

  const { wallet, name } = req.body;
  if (!wallet || !name) return res.status(400).json({ message: "ໃສ່ wallet ແລະ name" });
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return res.status(400).json({ message: "Wallet address ບໍ່ຖືກຕ້ອງ" });
  }

  if (!process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY.includes("ใส่_")) {
    return res.status(500).json({ message: "Admin key ຍັງບໍ່ໄດ້ຕັ້ງ" });
  }

  try {
    // ກວດວ່າ wallet ນີ້ເປັນຂອງ user ທີ່ login ຢູ່
    const [rows] = await db.promise().query(
      "SELECT ID, name, email FROM users WHERE ID = ? AND walletAddress = ? LIMIT 1",
      [decoded.id, wallet]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: "Wallet ນີ້ບໍ່ໄດ້ link ກັບ account ຂອງທ່ານ" });
    }

    const rawKey = (process.env.ADMIN_PRIVATE_KEY || "").trim();
    const privateKey = rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, LABCHAIN_ABI, adminWallet);

    // ກວດວ່າ wallet ລົງທະບຽນໃນ contract ແລ້ວຫຼືຍັງ
    const profile = await contract.getProfile(wallet);
    if (Number(profile.userType) !== 0) {
      return res.json({ success: true, alreadyRegistered: true, message: "ລົງທະບຽນໃນ contract ແລ້ວ" });
    }

    const tx = await contract.registerFor(wallet, name);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash, message: "ລົງທະບຽນສຳເລັດ" });
  } catch (e) {
    console.error("registerWallet error:", e.message);
    res.status(500).json({ message: e.reason || e.message || "Register failed" });
  }
};

module.exports = registerWallet;
