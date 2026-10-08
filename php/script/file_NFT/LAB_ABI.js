const LAB_ABI = [
  "function getBadgesOf(address student) view returns (uint256[])",
  "function badges(uint256 tokenId) view returns (string badgeName, string activity, address issuedTo, uint256 issuedAt)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function transferable(uint256 tokenId) view returns (bool)",
];

let currentAccount = null;
let currentChainId = null;
let allNFTs = [];
let fromAddress = null;

function getAlchemyKey() {
  return "YRV0uMkHA_my_jtTieWy4";
}

function getAlchemyBase(chainId) {
  const key = getAlchemyKey();
  const info = getNetworkInfo(chainId);
  if (!key || !info.alchemy) return null;
  return "https://" + info.alchemy + ".g.alchemy.com/nft/v3/" + key;
}

function shortenAddr(addr) {
  if (!addr) return "Unknown";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function ipfsToHttp(url) {
  if (!url) return null;
  let cid = null;
  if (url.startsWith("ipfs://")) cid = url.slice(7);
  else if (url.includes("/ipfs/")) cid = url.split("/ipfs/")[1];
  if (cid) {
    const gw = (typeof PINATA_GATEWAY !== "undefined" && PINATA_GATEWAY)
      ? PINATA_GATEWAY
      : "https://gateway.pinata.cloud/ipfs/";
    return gw + cid;
  }
  return url;
}

async function fetchIpfsJsonNFT(uri) {
  if (!uri) return null;
  var cid = uri.startsWith("ipfs://") ? uri.slice(7) : uri.includes("/ipfs/") ? uri.split("/ipfs/")[1] : null;
  var urls = cid ? [
    ((typeof PINATA_GATEWAY !== "undefined" && PINATA_GATEWAY) || "https://gateway.pinata.cloud/ipfs/") + cid,
    "https://ipfs.io/ipfs/" + cid,
    "https://cloudflare-ipfs.com/ipfs/" + cid,
  ] : [uri];
  for (var i = 0; i < urls.length; i++) {
    try {
      var res = await fetch(urls[i], { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.json();
    } catch (_) {}
  }
  return null;
}

function getImageUrl(imageObj) {
  if (!imageObj) return null;
  const url =
    imageObj.cachedUrl ||
    imageObj.pngUrl ||
    imageObj.originalUrl ||
    imageObj.thumbnailUrl;
  return ipfsToHttp(url);
}

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}

function showStatus(msg, isErr = false) {
  const el = document.getElementById("status");
  if (!msg) {
    el.style.display = "none";
    el.textContent = "";
    el.className = "";
    return;
  }
  // Show empty state UI for "no NFTs" messages
  if (!isErr && (msg.includes("ບໍ່ພົບ") || msg.includes("ຫວ່າງ"))) {
    el.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state-icon"></div>' +
        '<div class="empty-state-title">ຍັງບໍ່ມີໃບຢັ້ງຢືນ</div>' +
        '<div class="empty-state-body">' + msg + '</div>' +
      '</div>';
    el.style.display = "block";
    el.className = "";
  } else {
    el.textContent = msg;
    el.style.display = "block";
    el.className = isErr ? "error" : "";
    el.style.whiteSpace = "pre-line";
  }
}

function clearGrid() {
  const grid = document.getElementById("nftGrid");
  grid.innerHTML = "";
  grid.style.display = "none";
  document.getElementById("nftControls").style.display = "none";
}

// Update the load progress badge ("ໂຫລດ 2/5 ໃບ...")
function updateLoadProgress(loaded, total) {
  const el = document.getElementById("loadProgress");
  if (!el) return;
  if (loaded >= total) {
    el.style.display = "inline-flex";
    el.textContent = " ໂຫລດຄົບ " + total + " ໃບ";
    el.className = "load-progress done";
    setTimeout(function() { el.style.display = "none"; }, 2200);
    return;
  }
  el.style.display = "inline-flex";
  el.className = "load-progress";
  el.textContent = "ໂຫລດ " + loaded + "/" + total + " ໃບ";
}

function onWalletConnected() {
  document.getElementById("heroSection").style.display = "none";
  document.getElementById("walletInfo").style.display = "block";
  document.getElementById("walletAddress").textContent = currentAccount;
  updateNetworkUI(currentChainId);
  fetchNFTs(currentAccount, null, currentChainId);
}

function closeModal(e) {
  if (e.target.id === "modal")
    document.getElementById("modal").classList.remove("open");
}

function link() {
  window.location.href = "../";
}
