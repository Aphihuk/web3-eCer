// ໃຊ້ CONTRACT_ADDRESS ຈາກ /config/contract.config.js
const LAB_CHAIN_ID = 5222;
const LAB_CONTRACTS = [
  { address: typeof CONTRACT_ADDRESS !== "undefined" ? CONTRACT_ADDRESS : "", name: "LABchain" }
];
const LAB_CONTRACT_DEFAULT = LAB_CONTRACTS[0].address;