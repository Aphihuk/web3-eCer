const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const { db } = require("./db");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const verifyEmailTemplate = require("../templates/verifyEmailTemplate");
const resetPasswordEmailTemplate = require("../templates/resetPasswordEmailTemplate");
const resetPasswordFormTemplate = require("../templates/resetPasswordFormTemplate");

const LABCHAIN_ABI = [
  "function getBadgesOf(address student) view returns (uint256[])",
  "function adminForceRecover(address oldWallet, address newWallet, uint256[] calldata tokenIds) external",
];

// database teable users email , password , verliflie

const pendingUsers = new Map();
const get_passwords = new Map();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {

  const {name , email, password , wallet   } = req.body;

  const Check = "SELECT * FROM users WHERE email = ? ";

  db.query(Check, [email], async (err1, results) => {
    if (err1) return res.send(err1);

    if (results.length > 0) {
      return res.json({
        success: false,
        message: "Email already exists",
      });
    }
    if (results.length > 0) {
      return res.json({
        success: true,
        message: "check your email",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    pendingUsers.set(token, { name ,email, password , wallet });

    const verliflie = `${process.env.BASE_URL}/verliflie/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ຢືນຢັນທີ່ຢູ່ວ່ານຳໃຊ້ຂອງທ່ານ - Verify Your Email",
      html: verifyEmailTemplate(verliflie),
    });
    return res.send({
      status: true,
      message: "Email sent successfully",
    });
  });
};

const verliflie = async (req, res) => {
  const { token } = req.params;
  const get = pendingUsers.get(token);

  if (!get) return res.send("Invalid or expired token");

  const { name , email, password , wallet  } = get;

  const sql = "INSERT INTO users (name , email, password, verified , walletAddress ) VALUES (? , ?, ?, ? , ? )";


  db.query(sql, [name, email, password, true, wallet], async (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    pendingUsers.delete(token);

    // ບັນທຶກ wallet ເລີ່ມຕົ້ນລົງ wallet_history
    if (wallet && result.insertId) {
      try {
        await db.promise().query(`
          CREATE TABLE IF NOT EXISTS wallet_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            wallet_address VARCHAR(42) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_wallet (wallet_address)
          )
        `);
        await db.promise().query(
          "INSERT IGNORE INTO wallet_history (user_id, wallet_address) VALUES (?, ?)",
          [result.insertId, wallet.toLowerCase()]
        );
      } catch (_) {}
    }

    res.send(`
    <script>
        window.location.href = "https://nft.devlaos.com/controllers/login.php";
    </script>
`);
  });
};

const get_password = async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.send({
        status: false,
        message: "Email not found",
      });
    }

    const token_reset = crypto.randomBytes(20).toString("hex");

    get_passwords.set(token_reset, { email });

    const verliflie_password = `${process.env.BASE_URL}/reset/${token_reset}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: resetPasswordEmailTemplate(verliflie_password),
    });

    return res.send({
      status: true,
      message: "Check your email to reset your password",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const reset_password = async (req, res) => {
  try {
    const { token } = req.params;
    const get = get_passwords.get(token);

    if (!get) {
      return res.status(404).send("Token not found");
    }
    res.send(resetPasswordFormTemplate(token, process.env.BASE_URL));
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const reset_passwords = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    const get = get_passwords.get(token);

    if (!get) {
      return res.send("Invalid token");
    }
    console.log(get);
    if (password !== confirmPassword) {
      return res.send("Passwords do not match");
    }

    const { email } = get;

    const sql = "UPDATE users SET password = ? WHERE email = ?";

    db.query(sql, [password, email], (err) => {
      if (err) {
        return res.send(err);
      }
      get_passwords.delete(token);
       res.send(`
    <script>
        window.location.href = "https://nft.devlaos.com/controllers/login.php";
    </script>
`);
    });
  } catch (error) {
    console.error(error);
    return res.send("Internal Server Error");
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT ID, email, name, MintPrice FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = results[0];

    const token = jwt.sign(
      {
        id: user.ID,
        email: user.email,
        name: user.name,
      },
      "SECRET_KEY",
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      token,
      user,
    });
  });
};

const getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    // ສ້າງ columns ຖ້າຍັງບໍ່ມີ
    try { await db.promise().query("ALTER TABLE users ADD COLUMN recoveryFee DECIMAL(18,8) DEFAULT NULL"); } catch (_) {}
    try { await db.promise().query("ALTER TABLE users ADD COLUMN issuerLabel VARCHAR(255) DEFAULT NULL"); } catch (_) {}

    const [results] = await db.promise().query(
      "SELECT ID, email, name, MintPrice, recoveryFee, issuerLabel, walletAddress, oldWalletAddress, verified FROM users WHERE ID = ?",
      [decoded.id]
    );
    if (!results.length) return res.status(404).json({ message: "User not found" });

    const user = results[0];

    // ດຶງ wallet history ທັງໝົດ
    let walletHistory = [];
    try {
      const [hist] = await db.promise().query(
        "SELECT wallet_address FROM wallet_history WHERE user_id = ? ORDER BY changed_at DESC",
        [user.ID]
      );
      walletHistory = hist.map(h => h.wallet_address);
    } catch (_) {}

    res.json({
      id: user.ID,
      email: user.email,
      mintPrice: user.MintPrice,
      recoveryFeePerNFT: user.recoveryFee,
      issuerLabel: user.issuerLabel || null,
      name: user.name,
      oldWalletAddress: user.oldWalletAddress,
      walletAddress: user.walletAddress,
      verified: user.verified,
      walletHistory,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const changeWallet = async (req, res) => {
  const { newWalletAddress, oldWalletAddress } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!newWalletAddress || !oldWalletAddress) {
    return res.status(400).json({ message: "Missing wallet address" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    // ກວດ wallet ໃໝ່ link ຄົນອື່ນຫຼືບໍ່
    const [existing] = await db.promise().query(
      "SELECT ID FROM users WHERE walletAddress = ? AND ID != ?",
      [newWalletAddress, decoded.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Wallet already linked to another account" });
    }

    // ສ້າງ wallet_history table ຖ້າຍັງບໍ່ມີ
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS wallet_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wallet_address VARCHAR(42) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_wallet (wallet_address)
      )
    `);

    // ລຶບ duplicate ທີ່ມີຢູ່ແລ້ວ (ເກັບອັນທຳອິດ)
    await db.promise().query(`
      DELETE wh1 FROM wallet_history wh1
      INNER JOIN wallet_history wh2
      WHERE wh1.id > wh2.id
        AND wh1.user_id = wh2.user_id
        AND wh1.wallet_address = wh2.wallet_address
    `).catch(() => {});

    // ເກັບ wallet ເກົ່າລົງ history
    if (!oldWalletAddress) {
      return res.status(400).json({ message: "oldWalletAddress ຫວ່າງ — ສົ່ງຂໍ້ມູນບໍ່ຄົບ" });
    }
    const [already] = await db.promise().query(
      "SELECT id FROM wallet_history WHERE user_id = ? AND LOWER(wallet_address) = LOWER(?)",
      [decoded.id, oldWalletAddress]
    );
    if (already.length === 0) {
      await db.promise().query(
        "INSERT INTO wallet_history (user_id, wallet_address) VALUES (?, ?)",
        [decoded.id, oldWalletAddress.toLowerCase()]
      );
    }

    // ອັບເດດ wallet ໃໝ່ (oldWalletAddress ເກັບ wallet ລ່າສຸດສຳລັບ backward compat)
    await db.promise().query(
      "UPDATE users SET walletAddress = ?, oldWalletAddress = ? WHERE ID = ?",
      [newWalletAddress, oldWalletAddress, decoded.id]
    );

    res.json({ success: true, message: "Wallet changed successfully" });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};
const verifyWallet = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ verified: false });
  try {
    // ກວດ wallet ປັດຈຸບັນ
    const [results] = await db.promise().query(
      "SELECT verified FROM users WHERE walletAddress = ?", [address]
    );
    if (results.length > 0) {
      return res.json({ verified: results[0].verified == 1, type: "current" });
    }
    // ກວດ wallet history (wallet ເກົ່າຂອງ user ທີ່ verified)
    const [histResults] = await db.promise().query(
      `SELECT u.verified FROM users u
       JOIN wallet_history wh ON wh.user_id = u.ID
       WHERE wh.wallet_address = ? LIMIT 1`,
      [address]
    );
    if (histResults.length > 0) {
      return res.json({ verified: histResults[0].verified == 1, type: "history" });
    }
    res.json({ verified: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const checkWalletLinked = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ linked: false });
  try {
    // ກວດທັງ walletAddress ປັດຈຸບັນ ແລະ history ທັງໝົດ
    const [results] = await db.promise().query(
      `SELECT u.email FROM users u WHERE u.walletAddress = ?
       UNION
       SELECT u.email FROM users u
         JOIN wallet_history wh ON wh.user_id = u.ID
         WHERE wh.wallet_address = ?
       LIMIT 1`,
      [address, address]
    );
    if (results.length === 0) return res.json({ linked: false });
    res.json({ linked: true, email: results[0].email });
  } catch (e) {
    // fallback ຖ້າ wallet_history ຍັງບໍ່ມີ
    try {
      const [r2] = await db.promise().query(
        "SELECT email FROM users WHERE walletAddress = ? OR oldWalletAddress = ?",
        [address, address]
      );
      if (r2.length === 0) return res.json({ linked: false });
      res.json({ linked: true, email: r2[0].email });
    } catch (e2) {
      res.status(500).json({ error: e2.message });
    }
  }
};

const checkWallet = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.json({ registered: false });
  try {
    const [results] = await db.promise().query(
      "SELECT ID FROM users WHERE walletAddress = ?", [address]
    );
    res.json({ registered: results.length > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const adminRecover = async (req, res) => {
  const { oldWallet, newWallet, tokenIds: requestedIds } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!oldWallet || !newWallet) {
    return res.status(400).json({ message: "Missing wallet addresses" });
  }
  if (!process.env.ADMIN_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY.includes("ใส่_")) {
    return res.status(500).json({ message: "Admin private key ยังไม่ได้ตั้งค่า กรุณาแจ้ง admin" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");

    // ກວດ oldWallet ວ່າ link ກັບ user ນີ້ (walletAddress + oldWalletAddress + wallet_history)
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

    // ເຊື່ອມຕໍ່ LABChain ດ້ວຍ admin key
    const rawKey = (process.env.ADMIN_PRIVATE_KEY || "").trim();
    const privateKey = rawKey.startsWith("0x") ? rawKey : "0x" + rawKey;
    const hexPart = privateKey.slice(2);
    console.log(`[adminRecover] key length: ${hexPart.length} chars`);
    if (hexPart.length !== 64) {
      return res.status(500).json({
        message: `ADMIN_PRIVATE_KEY ຕ້ອງມີ 64 ຕົວ hex ແຕ່ໄດ້ ${hexPart.length} ຕົວ — ກວດສອບ .env ອີກຄັ້ງ`
      });
    }
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    // LABChain: smart estimateGas override
    const _origEst = provider.estimateGas.bind(provider);
    provider.estimateGas = async (tx) => {
      try {
        const est = await _origEst(tx);
        return est * 150n / 100n;
      } catch (_) {
        const hasValue = tx.value && BigInt(tx.value) > 0n;
        return hasValue ? 1000000n : 500000n;
      }
    };
    const adminWallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, LABCHAIN_ABI, adminWallet);

    // ໃຊ້ tokenIds ທີ່ user ເລືອກ ຫຼື ດຶງທັງໝົດຈາກ wallet ຖ້າບໍ່ໄດ້ສົ່ງມາ
    let tokenIds;
    if (Array.isArray(requestedIds) && requestedIds.length > 0) {
      // ກວດ security: ທຸກ tokenId ຕ້ອງເປັນຂອງ oldWallet
      const allIds = [...(await contract.getBadgesOf(oldWallet))].map(id => Number(id));
      tokenIds = requestedIds
        .map(id => Number(id))
        .filter(id => allIds.includes(id));
    } else {
      tokenIds = [...(await contract.getBadgesOf(oldWallet))];
    }
    if (tokenIds.length === 0) {
      return res.json({ success: true, message: "ບໍ່ມີ NFT ທີ່ຈະ recover", count: 0 });
    }

    // Admin force recover (onlyOwner function) — gasLimit ສຳລັບ LABChain
    const tx = await contract.adminForceRecover(oldWallet, newWallet, tokenIds, { gasLimit: 1000000n });
    const receipt = await tx.wait();
    if (receipt.status === 0) throw new Error("Transaction reverted on-chain");

    res.json({ success: true, count: Number(tokenIds.length), txHash: tx.hash });
  } catch (e) {
    console.error("adminRecover error:", e.message);
    res.status(500).json({ message: e.reason || e.message || "Recovery failed" });
  }
};


const getUserByWallet = async (req, res) => {
  const { address } = req.query;
  const token = req.headers.authorization?.split(" ")[1];
  if (!address) return res.status(400).json({ message: "Missing address" });
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    // ກວດ admin: walletAddress ຕ້ອງຕົງກັບ contract owner (ຫຼື verified = 2)
    const [adminCheck] = await db.promise().query(
      "SELECT ID FROM users WHERE ID = ? AND (role = 'admin' OR MintPrice IS NOT NULL)",
      [decoded.id]
    );
    // simple check — ໃຜ login ໄດ້ກໍ່ query ໄດ້ (admin ຈະ restrict ໃນ frontend)

    const [results] = await db.promise().query(
      `SELECT u.ID, u.name, u.email, u.walletAddress, u.verified,
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
      walletHistory: u.history ? u.history.split(",") : [],
    });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

const getAllUsers = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ລະບົບກ່ອນ" });
  try {
    jwt.verify(token, "SECRET_KEY");
  } catch (e) {
    return res.status(401).json({ message: "Token ໝົດອາຍຸ — Login ໃໝ່" });
  }
  try {
    // ສ້າງ maxBadge column (ບໍ່ crash ຖ້າມີຢູ່ແລ້ວ)
    try {
      await db.promise().query("ALTER TABLE users ADD COLUMN maxBadge INT DEFAULT NULL");
    } catch (_) {}

    // ສ້າງ recoveryFee column ຖ້າຍັງບໍ່ມີ
    try { await db.promise().query("ALTER TABLE users ADD COLUMN recoveryFee DECIMAL(18,8) DEFAULT NULL"); } catch (_) {}

    const [users] = await db.promise().query(
      "SELECT ID, name, email, walletAddress, verified, maxBadge, MintPrice, recoveryFee, issuerLabel FROM users ORDER BY ID ASC"
    );
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const setUserMaxBadge = async (req, res) => {
  const { userId, maxBadge } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });
  try {
    jwt.verify(token, "SECRET_KEY");
    // NULL = ໃຊ້ global limit ຈາກ contract
    const val = (maxBadge === null || maxBadge === "" || maxBadge === undefined) ? null : parseInt(maxBadge);
    await db.promise().query(
      "UPDATE users SET maxBadge = ? WHERE ID = ?",
      [val, userId]
    );
    res.json({ success: true, userId, maxBadge: val });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

const setUserPrices = async (req, res) => {
  const { userId, mintPrice, recoveryFee, issuerLabel } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "ກະລຸນາ Login ກ່ອນ" });
  try {
    jwt.verify(token, "SECRET_KEY");
    const mp  = (mintPrice   === null || mintPrice   === "" || mintPrice   === undefined) ? null : parseFloat(mintPrice);
    const rf  = (recoveryFee === null || recoveryFee === "" || recoveryFee === undefined) ? null : parseFloat(recoveryFee);
    const il  = (issuerLabel === null || issuerLabel === "" || issuerLabel === undefined) ? null : issuerLabel;
    try { await db.promise().query("ALTER TABLE users ADD COLUMN issuerLabel VARCHAR(255) DEFAULT NULL"); } catch (_) {}
    await db.promise().query(
      "UPDATE users SET MintPrice = ?, recoveryFee = ?, issuerLabel = ? WHERE ID = ?",
      [mp, rf, il, userId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
};

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

module.exports = {
  register,
  verliflie,
  get_password,
  reset_password,
  reset_passwords,
  login,
  getMe,
  changeWallet,
  verifyWallet,
  checkWalletLinked,
  checkWallet,
  adminRecover,
  getUserByWallet,
  dedupWalletHistory,
  getAllUsers,
  setUserMaxBadge,
  setUserPrices,
};
