const CONTRACT_ADDRESS = '0xA80ae5b8B672A9C5eF6eBB66c2A151854Ee1eEcD';
const CHAIN_ID         = '5222';
// Port depends on how the backend runs: 3200 when native `node server.js`, 85 when the
// backend is in Docker (its 3200 is expose-only; nginx publishes 85). Browser JS always
// runs on the host, so localhost is correct either way.
const API_BASE_URL     = 'http://localhost:3200';
const PINATA_GATEWAY   = 'https://gateway.pinata.cloud/ipfs/';


const CONTRACT_ABI = [
  // ການລົງທະບຽນ / ໂປຣໄຟລ໌
  "function register(string calldata name) external",
  "function getProfile(address) view returns (tuple(uint8 userType, string name, bool active, address recoveredTo, uint256 registeredAt))",
  "function updateProfile(address, string) external",

  // ສະຖານະລວມຂອງ contract
  "function owner() view returns (address)",
  "function totalMinted() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function recoveryFeePerNFT() view returns (uint256)",
  "function maxBadgePerUser() view returns (uint256)",
  "function mintingPaused() view returns (bool)",
  "function fundsReceiver() view returns (address)",

  // ສະຖານະຕໍ່ແອັດເດຣສ (per-address)
  "function operators(address) view returns (bool)",
  "function blacklisted(address) view returns (bool)",
  "function isActive(address) view returns (bool)",
  "function getBadgesOf(address) view returns (uint256[])",
  "function getMintPriceFor(address) view returns (uint256)",
  "function getRecoveryFeeFor(address) view returns (uint256)",
  "function getMaxBadgeFor(address) view returns (uint256)",

  // ຂໍ້ມູນຕໍ່ token (badge ແຕ່ລະໃບ)
  "function badges(uint256) view returns (string badgeName, string activity, address issuedTo, uint256 issuedAt)",
  "function transferable(uint256) view returns (bool)",
  "function tokenURI(uint256) view returns (string)",
  "function getTokenURIHistory(uint256) view returns (string[])",

  // ການ Mint badge
  "function mintBadge(address, string, string, string, bool) payable returns (uint256)",
  "function batchMintBadge(address[], string, string, string, bool) payable",
  "function mintBadgeWithVoucher(address, string, string, string, bool, uint256, uint256, bytes) payable returns (uint256)",
  "function batchMintBadgeWithVoucher(address[], string, string, string, bool, uint256, uint256, bytes) payable",

  // ການໂອນ / ການກູ້ wallet ຄືນ
  "function safeTransferFrom(address, address, uint256)",
  "function recoverWalletSelected(address, uint256[]) payable",
  "function adminForceRecover(address, address, uint256[]) external",

  // ການຈັດການ badge
  "function updateBadge(uint256, string, string, string) external",
  "function setTransferable(uint256, bool) external",
  "function revokeBadge(uint256) external",

  // Admin: ກຳນົດລາຄາສະເພາະຜູ້ໃຊ້ (per-user)
  "function setCustomMintPrice(address, uint256) external",
  "function setCustomRecoveryFee(address, uint256) external",
  "function setCustomMaxBadge(address, uint256) external",

  // Admin: ການຕັ້ງຄ່າລວມຂອງລະບົບ
  "function setMintPrice(uint256) external",
  "function setRecoveryFee(uint256) external",
  "function setMaxBadgePerUser(uint256) external",
  "function pauseMinting(bool) external",
  "function setFundsReceiver(address) external",
  "function setOperator(address, bool) external",
  "function setBlacklist(address, bool) external",
  "function reactivateWallet(address) external",
  "function transferOwnership(address) external",
  "function withdrawFunds() external",

  // Events (ສັນຍານທີ່ contract ປະກາດອອກມາ)
  "event BadgeMinted(uint256 indexed tokenId, address indexed student, string badgeName, string activity)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];
