const LABCHAIN_ABI = [
  "function getBadgesOf(address student) view returns (uint256[])",
  "function adminForceRecover(address oldWallet, address newWallet, uint256[] calldata tokenIds) external",
  "function registerFor(address wallet, string calldata name) external",
  "function getProfile(address) view returns (tuple(uint8 userType, string name, bool active, address recoveredTo, uint256 registeredAt))",
  "function recoveryFeePerNFT() view returns (uint256)",
  "function fundsReceiver() view returns (address)",
];

module.exports = { LABCHAIN_ABI };
