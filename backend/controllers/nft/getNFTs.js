const { ethers } = require("ethers");

const ABI = [
  "function getBadgesOf(address) view returns (uint256[])",
  "function badges(uint256) view returns (string badgeName, string activity, address issuedTo, uint256 issuedAt)",
  "function tokenURI(uint256) view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

// cache IPFS metadata in-memory (CID → { data, ts })
const _metaCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที

// run at most `limit` Promises at once
async function pLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

function ipfsToHttp(uri, gateway = GATEWAYS[0]) {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return gateway + uri.slice(7);
  if (uri.includes("/ipfs/"))   return gateway + uri.split("/ipfs/")[1];
  return uri;
}

async function fetchMetadata(tokenURI) {
  const cid = tokenURI?.startsWith("ipfs://")
    ? tokenURI.slice(7)
    : tokenURI?.includes("/ipfs/") ? tokenURI.split("/ipfs/")[1] : null;

  // serve from cache
  const key = cid || tokenURI;
  if (key) {
    const cached = _metaCache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  }

  for (const gw of GATEWAYS) {
    const url = cid ? gw + cid : ipfsToHttp(tokenURI, gw);
    if (!url) break;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        if (key) _metaCache.set(key, { data, ts: Date.now() });
        return data;
      }
    } catch (_) {}
  }
  return null;
}

function parseDescription(desc, attributes) {
  // 1. ลอง attributes ก่อน (trait_type = "ຜູ້ສົ່ງ")
  if (Array.isArray(attributes)) {
    const attr = attributes.find((a) => a.trait_type === "ຜູ້ສົ່ງ");
    if (attr?.value) {
      const body = desc?.trim() || null;
      return { body, senderName: String(attr.value).trim() };
    }
  }
  // 2. ลอง description text
  if (!desc) return { body: null, senderName: null };
  const seps = ["\nຜູ້ສົ່ງ:", "— ຜູ້ສົ່ງ:", "—ຜູ້ສົ່ງ:", "- ຜູ້ສົ່ງ:"];
  for (const sep of seps) {
    if (desc.includes(sep)) {
      const [body, sender] = desc.split(sep);
      return { body: body.trim(), senderName: sender.trim() };
    }
  }
  return { body: desc.trim(), senderName: null };
}

// estimate block number at a given unix timestamp
function estimateBlock(issuedAt, latestBlockNum, latestTimestamp, blocksPerSec) {
  if (!issuedAt || !latestTimestamp) return null;
  const secsAgo = latestTimestamp - issuedAt;
  return Math.max(0, Math.round(latestBlockNum - secsAgo * blocksPerSec));
}

async function getTxHash(contract, provider, tokenId, issuedAt, latestBlockNum, latestTimestamp, blocksPerSec) {
  const CHUNK = 99000;
  const filter = contract.filters.Transfer(ethers.ZeroAddress, null, tokenId);

  // estimate block from issuedAt, pad ±10k to be safe
  const estimated = estimateBlock(issuedAt, latestBlockNum, latestTimestamp, blocksPerSec);
  const lo = Math.max(0, (estimated ?? latestBlockNum) - 10000);
  const hi = Math.min(latestBlockNum, lo + CHUNK);

  const logs = await contract.queryFilter(filter, lo, hi);
  if (logs.length > 0) return logs[0].transactionHash;

  // if not found in estimated range, try the most recent chunk as fallback
  if (lo > 0) {
    const lo2 = Math.max(0, latestBlockNum - CHUNK);
    const logs2 = await contract.queryFilter(filter, lo2, latestBlockNum);
    if (logs2.length > 0) return logs2[0].transactionHash;
  }

  return null;
}

const getNFTs = async (req, res) => {
  const { wallet } = req.query;
  if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return res.status(400).json({ ok: false, msg: "Invalid wallet address" });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);

    const tokenIds = await contract.getBadgesOf(wallet);

    // fetch latest block info once — used to estimate block numbers from timestamps
    let latestBlockNum = 0;
    let latestTimestamp = 0;
    let blocksPerSec = 0.5; // default: 2s block time
    try {
      const lb = await provider.getBlock("latest");
      latestBlockNum = lb.number;
      latestTimestamp = lb.timestamp;
      if (lb.number > 500) {
        const old = await provider.getBlock(Math.max(1, lb.number - 500));
        if (old && lb.timestamp > old.timestamp) {
          blocksPerSec = 500 / (lb.timestamp - old.timestamp);
        }
      }
    } catch (_) {
      latestBlockNum = await provider.getBlockNumber();
    }

    const nfts = await pLimit(
      tokenIds.map((tokenId) => async () => {
        const [badge, tokenURI] = await Promise.all([
          contract.badges(tokenId),
          contract.tokenURI(tokenId).catch(() => null),
        ]);

        const meta = await fetchMetadata(tokenURI);
        const { body: descBody, senderName } = parseDescription(
          meta?.description || null,
          meta?.attributes || null,
        );

        const image = meta?.image ? ipfsToHttp(meta.image) : null;

        return {
          tokenId:     tokenId.toString(),
          badgeName:   badge.badgeName,
          activity:    badge.activity,
          issuedTo:    badge.issuedTo,
          issuedAt:    Number(badge.issuedAt),
          tokenURI,
          image,
          metaName:    meta?.name || null,
          collection:  meta?.issuer
                         ? ("ອອກໂດຍ " + meta.issuer)
                         : (meta?.collection || null),
          description: descBody,
          senderName,
          txHash:      null,
        };
      }),
      10  // max 10 NFTs in parallel
    );

    res.json({ ok: true, nfts });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
};

module.exports = getNFTs;
