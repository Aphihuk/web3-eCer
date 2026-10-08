const { db } = require("../db");
const FormData = require("form-data");
const https = require("https");

async function getPinataJWT() {
  await db.promise().query(`CREATE TABLE IF NOT EXISTS settings (\`key\` VARCHAR(100) PRIMARY KEY, \`value\` TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
  const [rows] = await db.promise().query("SELECT `value` FROM settings WHERE `key` = ?", ["pinata_jwt"]);
  return rows[0]?.value || null;
}

async function pinFileToPinata(buffer, filename, mimetype, jwt) {
  const form = new FormData();
  form.append("file", buffer, { filename, contentType: mimetype });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: "api.pinata.cloud",
        path: "/pinning/pinFileToIPFS",
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${jwt}`,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(body));
          }
        });
      }
    );
    req.on("error", reject);
    form.pipe(req);
  });
}

const uploadFile = async (req, res) => {
  try {
    const jwt = await getPinataJWT();
    if (!jwt) return res.status(400).json({ message: "Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ" });

    const file = req.files?.file;
    if (!file) return res.status(400).json({ message: "ກະລຸນາເລືອກໄຟລ໌" });

    const data = await pinFileToPinata(file.data, file.name, file.mimetype, jwt);
    if (!data.IpfsHash) throw new Error(data.message || "Upload failed");

    res.json({ cid: data.IpfsHash, ipfsUri: `ipfs://${data.IpfsHash}`, gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const uploadBase64 = async (req, res) => {
  try {
    const jwt = await getPinataJWT();
    if (!jwt) return res.status(400).json({ message: "Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ" });

    const { image, name } = req.body;
    if (!image) return res.status(400).json({ message: "ກະລຸນາສົ່ງ base64 image" });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const data = await pinFileToPinata(buffer, name || "certificate.png", "image/png", jwt);
    if (!data.IpfsHash) throw new Error(data.message || "Upload failed");

    res.json({ cid: data.IpfsHash, ipfsUri: `ipfs://${data.IpfsHash}`, gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { uploadFile, uploadBase64 };
