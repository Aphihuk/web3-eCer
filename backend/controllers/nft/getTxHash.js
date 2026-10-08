const { ethers } = require("ethers");

const ABI = [
  "function badges(uint256) view returns (string badgeName, string activity, address issuedTo, uint256 issuedAt)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

function estimateBlock(issuedAt, latestBlockNum, latestTimestamp, blocksPerSec) {
  if (!issuedAt || !latestTimestamp) return null;
  const secsAgo = latestTimestamp - issuedAt;
  return Math.max(0, Math.round(latestBlockNum - secsAgo * blocksPerSec));
}

const getTxHashController = async (req, res) => {
  const { tokenId } = req.params;
  if (!tokenId) return res.status(400).json({ ok: false, msg: "tokenId required" });

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

    const badge = await contract.badges(tokenId);
    const lb = await provider.getBlock("latest");
    const latestBlockNum = lb.number;
    const latestTimestamp = lb.timestamp;

    let blocksPerSec = 0.5;
    try {
      const old = await provider.getBlock(Math.max(1, lb.number - 500));
      if (old && lb.timestamp > old.timestamp) {
        blocksPerSec = 500 / (lb.timestamp - old.timestamp);
      }
    } catch (_) {}

    const CHUNK = 99000;
    const filter = contract.filters.Transfer(ethers.ZeroAddress, null, tokenId);
    const estimated = estimateBlock(Number(badge.issuedAt), latestBlockNum, latestTimestamp, blocksPerSec);
    const lo = Math.max(0, (estimated ?? latestBlockNum) - 10000);
    const hi = Math.min(latestBlockNum, lo + CHUNK);

    let txHash = null;
    const logs = await contract.queryFilter(filter, lo, hi);
    if (logs.length > 0) {
      txHash = logs[0].transactionHash;
    } else if (lo > 0) {
      const lo2 = Math.max(0, latestBlockNum - CHUNK);
      const logs2 = await contract.queryFilter(filter, lo2, latestBlockNum);
      if (logs2.length > 0) txHash = logs2[0].transactionHash;
    }

    res.json({ ok: true, txHash });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
};

module.exports = getTxHashController;
