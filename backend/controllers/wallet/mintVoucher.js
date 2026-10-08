const { db } = require("../db");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

const mintVoucher = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });

  try {
    jwt.verify(token, "SECRET_KEY");
  } catch (e) {
    return res.status(401).json({ message: "Token ໝົດອາຍຸ" });
  }

  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ message: "ໃສ່ wallet address" });

  try {
    const [rows] = await db.promise().query(
      "SELECT ID, MintPrice FROM users WHERE walletAddress = ? LIMIT 1",
      [wallet]
    );

    if (rows.length === 0) return res.status(404).json({ message: "ບໍ່ພົບ user" });

    const user = rows[0];

    if (user.MintPrice === null || user.MintPrice === undefined) {
      return res.status(400).json({ message: "no_custom_price" });
    }

    const priceEther = String(user.MintPrice);
    const priceWei = ethers.parseEther(priceEther);
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    const rawKey = (process.env.ADMIN_PRIVATE_KEY || "").trim();
    const privateKey = rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;
    const signer = new ethers.Wallet(privateKey);
    const contractAddress = process.env.CONTRACT_ADDRESS;

    const msgHash = ethers.solidityPackedKeccak256(
      ["address", "address", "uint256", "uint256"],
      [contractAddress, wallet, priceWei, BigInt(expiry)]
    );

    const signature = await signer.signMessage(ethers.getBytes(msgHash));

    res.json({ price: priceEther, priceWei: priceWei.toString(), expiry, signature });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = mintVoucher;
