// @open NFT ໃນ Modal
function openModal(nft) {
  document.getElementById("modalName").textContent = nft.name;
  document.getElementById("modalCollection").textContent = nft.collection;
  var d = nft.description || "";
  var sep = d.includes("\nຜູ້ສົ່ງ:")   ? "\nຜູ້ສົ່ງ:"
          : d.includes("— ຜູ້ສົ່ງ:") ? "— ຜູ້ສົ່ງ:"
          : d.includes("—ຜູ້ສົ່ງ:")  ? "—ຜູ້ສົ່ງ:"
          : d.includes("- ຜູ້ສົ່ງ:")  ? "- ຜູ້ສົ່ງ:"
          : null;
  var descEl = document.getElementById("modalDesc");
  if (sep && d) {
    var parts = d.split(sep);
    descEl.innerHTML = parts[0].trim()
      + '<br><span style="font-size:0.78rem;color:#94a3b8;">ຜູ້ສົ່ງ: ' + parts[1].trim() + '</span>';
  } else {
    descEl.textContent = d || "ບໍ່ມີຄຳອະທິບາຍ";
  }

  const imgEl = document.getElementById("modalImg");
  if (nft.image) {
    imgEl.src = nft.image;
    imgEl.style.display = "block";
  } else imgEl.style.display = "none";

  // const attrsEl = document.getElementById("modalAttrs");
  // attrsEl.innerHTML = "";
  // (nft.attributes || []).forEach(function (attr) {
  //   const tag = document.createElement("div");
  //   tag.className = "attr-tag";
  //   tag.innerHTML =
  //     "<span>" + (attr.trait_type || attr.type || "") + "</span>" + attr.value;
  //   attrsEl.appendChild(tag);
  // });

  // Contract Address
  const ethEl = document.getElementById("modalEtherscan");
  if (ethEl) {
    const ethAddr = nft.contractAddress || LAB_CONTRACT_DEFAULT;
    ethEl.textContent = `${ethAddr.slice(0, 10)}...${ethAddr.slice(-6)}`;
    ethEl.title = ethAddr;
    const netInfo = getNetworkInfo(currentChainId);
    const explorerBase = {
      1: `https://etherscan.io/address/${ethAddr}`,
      11155111: `https://sepolia.etherscan.io/address/${ethAddr}`,
      137: `https://polygonscan.com/address/${ethAddr}`,
      80002: `https://amoy.polygonscan.com/address/${ethAddr}`,
      10: `https://optimistic.etherscan.io/address/${ethAddr}`,
      42161: `https://arbiscan.io/address/${ethAddr}`,
      8453: `https://basescan.org/address/${ethAddr}`,
      84532: `https://sepolia.basescan.org/address/${ethAddr}`,
      17000: `https://holesky.etherscan.io/address/${ethAddr}`,
      5222: `https://explorer.labchain.la/address/${ethAddr}?tab=txs`,
    };
    ethEl.href =
      explorerBase[currentChainId] ||
      `https://sepolia.etherscan.io/address/${ethAddr}`;
    ethEl.target = "_blank";
    ethEl.rel = "noopener noreferrer";
  }

  // Token ID
  const tokenIdEL = document.getElementById("modalTokenId");
  if (tokenIdEL) {
    tokenIdEL.textContent =
      nft.tokenId !== undefined && nft.tokenId !== null
        ? `#${nft.tokenId}`
        : "—";
  }

  // Transfer status
  const transEl = document.getElementById("modalTrans");
  if (transEl) {
    if (nft.isTransferable === true) {
      transEl.innerHTML = '<span style="color:var(--green)"> ໂອນໄດ້</span>';
    } else if (nft.isTransferable === false) {
      transEl.innerHTML =
        '<span style="color:var(--danger)"> ໂອນບໍ່ໄດ້</span>';
    } else {
      transEl.textContent = "—";
    }
  }

  // Issued at
  const issuedAtEl = document.getElementById("modalIssuedAt");
  if (issuedAtEl) {
    if (nft.issuedAt) {
      const date = new Date(Number(nft.issuedAt) * 1000);
      issuedAtEl.textContent = date.toLocaleDateString("lo-LA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      issuedAtEl.textContent = "—";
    }
  }

  // Verified
  const verifiedEl = document.getElementById("modalVerified");
  if (verifiedEl) {
    const netInfo = getNetworkInfo(currentChainId);
    verifiedEl.textContent = ` contract Network: ${netInfo.name}`;
    verifiedEl.style.color = "#22c55e";
  }

  // Contract Hash — show immediately if cached, else lazy-load
  const hashEl = document.getElementById("modalHash");
  const mintedByEl = document.getElementById("modalMintedBy");

  function applyTxHash(txHash) {
    if (!hashEl) return;
    if (txHash) {
      const short = `${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
      hashEl.textContent = short;
      hashEl.style.cursor = "pointer";
      hashEl.style.color = "#a78bfa";
      hashEl.style.textDecoration = "underline";
      const txExplorer = {
        1: `https://etherscan.io/tx/${txHash}`,
        11155111: `https://sepolia.etherscan.io/tx/${txHash}`,
        137: `https://polygonscan.com/tx/${txHash}`,
        80002: `https://amoy.polygonscan.com/tx/${txHash}`,
        10: `https://optimistic.etherscan.io/tx/${txHash}`,
        42161: `https://arbiscan.io/tx/${txHash}`,
        8453: `https://basescan.org/tx/${txHash}`,
        84532: `https://sepolia.basescan.org/tx/${txHash}`,
        17000: `https://holesky.etherscan.io/tx/${txHash}`,
        5222: `https://explorer.labchain.la/tx/${txHash}`,
      };
      const txUrl = txExplorer[currentChainId] || `https://sepolia.etherscan.io/tx/${txHash}`;
      hashEl.onclick = () => window.open(txUrl, "_blank");
    } else {
      hashEl.textContent = "—";
      hashEl.onclick = null;
      hashEl.style.cursor = "default";
      hashEl.style.textDecoration = "none";
    }
  }

  function applySenderWallet(wallet) {
    if (!mintedByEl) return;
    if (wallet) {
      mintedByEl.textContent = shortenAddr(wallet);
      mintedByEl.title = wallet;
      mintedByEl.style.cursor = "pointer";
      mintedByEl.style.color = "#a78bfa";
      mintedByEl.style.textDecoration = "underline";
      const explorerUrl = {
        1: `https://etherscan.io/address/${wallet}`,
        11155111: `https://sepolia.etherscan.io/address/${wallet}`,
        137: `https://polygonscan.com/address/${wallet}`,
        80002: `https://amoy.polygonscan.com/address/${wallet}`,
        5222: `https://explorer.labchain.la/address/${wallet}`,
      };
      mintedByEl.onclick = () =>
        window.open(explorerUrl[currentChainId] || `https://etherscan.io/address/${wallet}`, "_blank");
    } else {
      mintedByEl.textContent = "—";
      mintedByEl.onclick = null;
      mintedByEl.style.cursor = "default";
      mintedByEl.style.textDecoration = "none";
      mintedByEl.title = "";
    }
  }

  if (nft.txHash !== null) {
    applyTxHash(nft.txHash);
  } else {
    if (hashEl) { hashEl.textContent = ""; hashEl.onclick = null; hashEl.style.cursor = "default"; hashEl.style.textDecoration = "none"; }
  }

  // senderWallet is loaded lazily (requires txHash from chain)
  applySenderWallet(nft.senderWallet || null);
  if (!nft.senderWallet && nft.txHash === null) {
    if (mintedByEl) { mintedByEl.textContent = ""; mintedByEl.style.cursor = "default"; mintedByEl.style.textDecoration = "none"; mintedByEl.onclick = null; }
  }

  document.getElementById("modal").classList.add("open");

  // Lazy-load txHash + senderWallet (the on-chain sender wallet address)
  if (nft.txHash === null && nft.contractAddress && typeof fetchTxInfoForToken === "function") {
    fetchTxInfoForToken(nft.contractAddress, nft.tokenId, nft.issuedAt).then(({ txHash, senderWallet }) => {
      nft.txHash = txHash;
      nft.senderWallet = senderWallet;
      if (document.getElementById("modal").classList.contains("open")) {
        applyTxHash(txHash);
        applySenderWallet(senderWallet);
      }
    });
  }
}
