// @ຂໍ້ມູນ Network ທີ່ຮອງຮັບ ແລະ API Alchemy ສໍາລັບແຕ່ລະ Network
const NETWORK_MAP = {
  1: { name: "Ethereum", alchemy: "eth-mainnet", os: "ethereum" },
  11155111: { name: "Sepolia", alchemy: "eth-sepolia", os: "sepolia" },
  137: { name: "Polygon", alchemy: "polygon-mainnet", os: "matic" },
  80002: { name: "Polygon Amoy", alchemy: "polygon-amoy", os: "amoy" },
  10: { name: "Optimism", alchemy: "opt-mainnet", os: "optimism" },
  42161: { name: "Arbitrum One", alchemy: "arb-mainnet", os: "arbitrum" },
  8453: { name: "Base", alchemy: "base-mainnet", os: "base" },
  84532: { name: "Base Sepolia", alchemy: "base-sepolia", os: "base_sepolia" },
  17000: { name: "Holesky", alchemy: "eth-holesky", os: null },
  5222: {
    name: "LAB Chain",
    alchemy: null,
    os: null,
    rpc: "https://rpc.labchain.la",
    explorer: "https://explorer.labchain.la",
    symbol: "LAB",
  },
};



function getNetworkInfo(chainId) {
  const num = toChainNum(chainId);
  return NETWORK_MAP[num] || { name: "Chain " + num, alchemy: null, os: null };
}
