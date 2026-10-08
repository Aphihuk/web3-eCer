const { db } = require("../db");

async function getPinataJWT() {
  const [rows] = await db.promise().query("SELECT `value` FROM settings WHERE `key` = ?", ["pinata_jwt"]);
  return rows[0]?.value || null;
}

const uploadMetadata = async (req, res) => {
  try {
    const jwt = await getPinataJWT();
    if (!jwt) return res.status(400).json({ message: "Pinata JWT ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ" });

    const { name, description, image, issuer, sender, attributes } = req.body;
    if (!name || !image) return res.status(400).json({ message: "ກະລຸນາສົ່ງ name ແລະ image" });

    const descWithSender = sender ? `${description || ""}\nຜູ້ສົ່ງ: ${sender}` : (description || "");
    const metaAttrs = attributes || [];
    if (issuer && !metaAttrs.find(a => a.trait_type === "ອອກໂດຍ")) {
      metaAttrs.unshift({ trait_type: "ອອກໂດຍ", value: issuer });
    }
    if (sender && !metaAttrs.find(a => a.trait_type === "ຜູ້ສົ່ງ")) {
      metaAttrs.push({ trait_type: "ຜູ້ສົ່ງ", value: sender });
    }

    const metadata = {
      name,
      description: descWithSender,
      image: image.startsWith("ipfs://") ? image : `ipfs://${image}`,
      issuer: issuer || "ບຸກຄົນທົ່ວໄປ",
      attributes: metaAttrs,
    };

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({
        pinataMetadata: { name: `badge_${name.replace(/\s+/g, "_")}.json` },
        pinataContent: metadata,
      }),
    });
    const data = await response.json();
    if (!data.IpfsHash) throw new Error(data.message || "Upload metadata failed");

    res.json({
      cid: data.IpfsHash,
      ipfsUri: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      metadata,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { uploadMetadata };
