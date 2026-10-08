// ຕັ້ງ recoveryFeePerNFT = 0.05 LAB ໃນ contract
// ເປີດໃນ browser console ຫຼັງ connect wallet (owner)

async function setRecoveryFee() {
  if (!window.ethereum) { alert("ຕິດຕັ້ງ MetaMask ກ່ອນ"); return; }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  // CONTRACT_ADDRESS ໂຫຼດຈາກ /config/contract.config.js
  const ABI = ["function setRecoveryFee(uint256 newFee) external"];
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const feeWei = ethers.parseEther("0.05");
  const tx = await contract.setRecoveryFee(feeWei);
  console.log("Tx sent:", tx.hash);
  await tx.wait();
  console.log(" Recovery fee ຕັ້ງເປັນ 0.05 LAB ສຳເລັດ");
}

setRecoveryFee();
