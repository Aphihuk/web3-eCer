async function connectWallet() {
  if (!window.ethereum) {
    document.getElementById("noMetamask").style.display = "block";
    document.getElementById("heroSection").style.display = "none";
    return;
  }
  try {
    document.getElementById("connectBtn").textContent = "Connecting...";

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    currentAccount = accounts[0];
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    currentChainId = toChainNum(chainIdHex);
    onWalletConnected();
    window.ethereum.on("accountsChanged", async (accs) => {
      if (!accs.length) {
        location.reload();
        return;
      }
      currentAccount = accs[0];
      document.getElementById("walletAddress").textContent = currentAccount;
      await fetchNFTs(currentAccount, null, currentChainId);
    });
    window.ethereum.on("chainChanged", async (chainId) => {
      currentChainId = toChainNum(chainId);
      updateNetworkUI(currentChainId);
      await fetchNFTs(currentAccount, null, currentChainId);
    });
  } catch (err) {
    showStatus("Connection failed: " + (err.message || ""), true);
    document.getElementById("connectBtn").textContent = "Connect MetaMask";
  }
}
// @update Network
function updateNetworkUI(chainId) {
  const info = getNetworkInfo(chainId);
  document.getElementById("networkName").textContent = info.name;
  document.getElementById("statNetwork").textContent = info.name;
}