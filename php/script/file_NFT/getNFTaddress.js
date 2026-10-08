async function fetchNFTs(address, contractAddress, chainId) {
  if (chainId === undefined || chainId === null) chainId = currentChainId;
  showLoading(true);
  showStatus("");
  clearGrid();
  const chainNum = toChainNum(chainId);
  const netInfo = getNetworkInfo(chainNum);
  const base = getAlchemyBase(chainNum);
  if (chainNum === LAB_CHAIN_ID) {
    await fetchFromLabChain(address, contractAddress);
    return;
  }
  if (base) {
    try {
      let url =
        base +
        "/getNFTsForOwner?owner=" +
        address +
        "&withMetadata=true&pageSize=100";
      if (contractAddress) url += "&contractAddresses[]=" + contractAddress;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Alchemy HTTP " + res.status);
      const data = await res.json();
      if (!data.ownedNfts || !data.ownedNfts.length) {
        showLoading(false);
        showStatus("ບໍ່ພົບ NFT ໃນ " + netInfo.name);
        document.getElementById("nftCount").textContent = 0;
        return;
      }
      allNFTs = await Promise.all(
        data.ownedNfts.map(async (nft) => {
          let txHash = null;
          let issuedAt = null;
          try {
            const transferRes = await fetch(
              `https://${getNetworkInfo(chainNum).alchemy}.g.alchemy.com/v2/${getAlchemyKey()}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jsonrpc: "2.0",
                  method: "alchemy_getAssetTransfers",
                  params: [{
                    fromBlock: "0x0",
                    toBlock: "latest",
                    toAddress: address,
                    contractAddresses: [nft.contract?.address],
                    category: ["erc721"],
                    withMetadata: true,
                    maxCount: "0x64",
                  }],
                  id: 1,
                }),
              },
            );
            const transferData = await transferRes.json();
            const transfers = transferData.result?.transfers || [];
            const match = transfers.find(
              (t) => t.erc721TokenId && parseInt(t.erc721TokenId, 16) === parseInt(nft.tokenId),
            );
            if (match) {
              txHash = match.hash;
              issuedAt = match.metadata?.blockTimestamp
                ? Math.floor(new Date(match.metadata.blockTimestamp).getTime() / 1000)
                : null;
            }
          } catch (_) {}
          return {
            tokenId: nft.tokenId,
            name: nft.name || "Token #" + nft.tokenId,
            description: nft.description || "",
            image: getImageUrl(nft.image),
            collection: nft.contract?.name || shortenAddr(nft.contract?.address),
            contractAddress: nft.contract?.address,
            attributes: nft.raw?.metadata?.attributes || [],
            issuedAt,
            txHash,
          };
        }),
      );
      showLoading(false);
      renderGrid(allNFTs);
      document.getElementById("nftCount").textContent = allNFTs.length;
      return;
    } catch (err) {
      console.warn("Alchemy failed, fallback OpenSea:", err.message);
    }
  }
  if (!getAlchemyKey()) {
    showLoading(false);
    showStatus("Please connect Alchemy Key first", true);
    return;
  }
  await fetchFromOpenSea(address, contractAddress, netInfo.os);
}

async function fetchFromContract() {
  const contractAddr = document.getElementById("contractInput").value.trim();
  if (!contractAddr || !contractAddr.startsWith("0x")) {
    showStatus("Contract Address ບໍ່ຖືກຕ້ອງ", true);
    return;
  }
  await fetchNFTs(currentAccount, contractAddr, currentChainId);
}

// ── Lazy-fetch txHash for one token (called when modal opens) ────────────────
// mintedBy already loaded from IPFS — this only fetches txHash.
// Two-step block estimation: linear interpolation then correction from the
// real timestamp of the estimated block, then tries ±50/300/1000/3000.
async function fetchTxInfoForToken(contractAddr, tokenId, issuedAt) {
  const rpc = "https://rpc.labchain.la";
  const paddedId = "0x" + BigInt(tokenId).toString(16).padStart(64, "0");

  if (!issuedAt) return { txHash: null, mintedBy: null };

  async function fetchBlockMeta(tag) {
    const r = await fetch(rpc, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: [tag, false] }),
    });
    const d = await r.json();
    return { number: parseInt(d.result?.number, 16), timestamp: parseInt(d.result?.timestamp, 16) };
  }

  async function queryLogs(fromBlock, toBlock, topics) {
    const r = await fetch(rpc, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 2, method: "eth_getLogs",
        params: [{ fromBlock: "0x" + fromBlock.toString(16), toBlock: "0x" + toBlock.toString(16), address: contractAddr, topics }],
      }),
    });
    const d = await r.json();
    if (d.error) console.warn("[fetchTxInfo] getLogs error:", d.error.message, "range:", fromBlock, "-", toBlock);
    return Array.isArray(d.result) ? d.result : [];
  }

  try {
    // Step 1: coarse estimate via linear interpolation
    const [latest, genesis] = await Promise.all([
      fetchBlockMeta("latest"),
      fetchBlockMeta("0x1"),
    ]);
    const { number: latestBlock, timestamp: latestTime } = latest;
    const { timestamp: genesisTime } = genesis;

    const frac = Math.max(0, Math.min(1, (issuedAt - genesisTime) / (latestTime - genesisTime)));
    let est = Math.max(1, Math.round(1 + frac * (latestBlock - 1)));

    // Step 2: fetch the coarse estimate block, read its real timestamp, correct
    const midBlock = await fetchBlockMeta("0x" + est.toString(16));
    if (!isNaN(midBlock.timestamp) && !isNaN(midBlock.number) && latestBlock > midBlock.number) {
      const localBlockTime = (latestTime - midBlock.timestamp) / (latestBlock - midBlock.number);
      if (localBlockTime > 0) {
        const correction = Math.round((issuedAt - midBlock.timestamp) / localBlockTime);
        console.log("[fetchTxInfo] tokenId=" + tokenId + " coarse=" + est +
          " midTime=" + midBlock.timestamp + " issuedAt=" + issuedAt +
          " blockTime=" + localBlockTime.toFixed(2) + "s correction=" + correction);
        est = Math.max(1, Math.min(latestBlock, est + correction));
      }
    }
    console.log("[fetchTxInfo] tokenId=" + tokenId + " refined est=" + est);

    const badgeTopics    = [ethers.id("BadgeMinted(uint256,address,string,string)"), paddedId];
    const transferTopics = [ethers.id("Transfer(address,address,uint256)"), null, null, paddedId];

    // Expand outward until found
    for (const half of [50, 300, 1000, 3000]) {
      const from = Math.max(1, est - half);
      const to   = Math.min(latestBlock, est + half);
      let logs = await queryLogs(from, to, badgeTopics);
      if (!logs.length) logs = await queryLogs(from, to, transferTopics);
      if (logs.length) {
        const txHash = logs[0].transactionHash;
        console.log("[fetchTxInfo] found at ±" + half + " txHash:", txHash,
          "block:", parseInt(logs[0].blockNumber, 16));
        // Get tx.from — the actual wallet that sent the mint transaction
        try {
          const txRes = await fetch(rpc, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "eth_getTransactionByHash", params: [txHash] }),
          });
          const txData = await txRes.json();
          const senderWallet = txData.result?.from || null;
          return { txHash, senderWallet };
        } catch (_) {
          return { txHash, senderWallet: null };
        }
      }
      console.log("[fetchTxInfo] ±" + half + " empty (range " + from + "-" + to + ")");
    }

    return { txHash: null, senderWallet: null };
  } catch (e) {
    console.warn("[fetchTxInfo] exception:", e);
    return { txHash: null, senderWallet: null };
  }
}

// ── LABChain loader — auto-discover all NFTs via Transfer event scan ──────────
const RPC_LAB = "https://rpc.labchain.la";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function _rpcCall(method, params) {
  const res = await fetch(RPC_LAB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

async function _rpcLogs(filter, latest) {
  const CHUNK = 99000;
  const promises = [];
  for (let from = 1; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);
    promises.push(_rpcCall("eth_getLogs", [{
      ...filter,
      fromBlock: "0x" + from.toString(16),
      toBlock:   "0x" + to.toString(16),
    }]));
  }
  const results = await Promise.all(promises);
  return results.flat();
}

async function fetchFromLabChain(address, contractAddress) {
  const inputContract = document.getElementById("contractInput")?.value.trim();
  const targetContract = contractAddress || (inputContract && inputContract.startsWith("0x") ? inputContract : null);

  const labProvider = new ethers.JsonRpcProvider(RPC_LAB);
  const padded = "0x000000000000000000000000" + address.slice(2).toLowerCase();

  try {
    let tokenList; // [{contractAddr, tokenId}]

    if (targetContract) {
      // Specific contract — use fast getBadgesOf path
      const c = new ethers.Contract(targetContract, LAB_ABI, labProvider);
      const ids = await c.getBadgesOf(address);
      tokenList = ids.map(id => ({ contractAddr: targetContract, tokenId: id }));
    } else {
      // Auto-discover: scan all ERC-721 Transfer events for this wallet
      const latest = parseInt(await _rpcCall("eth_blockNumber", []), 16);
      const [received, sent] = await Promise.all([
        _rpcLogs({ topics: [TRANSFER_TOPIC, null, padded] }, latest),
        _rpcLogs({ topics: [TRANSFER_TOPIC, padded, null] }, latest),
      ]);

      // ERC-721 Transfer has 4 topics (tokenId is indexed); ERC-20 has 3 — filter accordingly
      const isERC721 = l => l.topics.length === 4;
      const toKey = l => l.address.toLowerCase() + ":" + BigInt(l.topics[3]).toString();

      const sentSet = new Set(sent.filter(isERC721).map(toKey));
      const ownedMap = new Map();
      for (const log of received.filter(isERC721)) {
        const key = toKey(log);
        if (!sentSet.has(key)) ownedMap.set(key, { contractAddr: log.address, tokenId: BigInt(log.topics[3]) });
      }
      tokenList = [...ownedMap.values()];
    }

    if (!tokenList.length) {
      showLoading(false);
      showStatus("ບໍ່ພົບໃບຢັ້ງຢືນໃນ LAB Chain");
      const el = document.getElementById("nftCount"); if (el) el.textContent = 0;
      return;
    }

    const total = tokenList.length;
    showLoading(false);
    renderSkeletonGrid(total);
    updateLoadProgress(0, total);

    const nftCountEl = document.getElementById("nftCount");
    const countBadge = document.getElementById("nftCountBadge");
    if (nftCountEl) nftCountEl.textContent = total;
    if (countBadge) countBadge.textContent = total;

    allNFTs = new Array(total).fill(null);
    let loadedCount = 0;

    await Promise.allSettled(
      tokenList.map(async ({ contractAddr, tokenId }, idx) => {
        let nft;
        try {
          const contract = new ethers.Contract(contractAddr, LAB_ABI, labProvider);
          const [b, isTransferable] = await Promise.all([
            contract.badges(tokenId).catch(() => null),
            contract.transferable(tokenId).catch(() => false),
          ]);

          let image = null, description = b?.activity || "", attributes = [], issuerName = null, mintedBy = null;
          try {
            const uri = await contract.tokenURI(tokenId);
            const meta = await fetchIpfsJsonNFT(uri);
            if (meta) {
              image = ipfsToHttp(meta.image || null);
              description = meta.description || description;
              attributes = meta.attributes || [];
              if (meta.issuer) issuerName = meta.issuer;
              const senderAttr = attributes.find(a => a.trait_type === "ຜູ້ສົ່ງ");
              if (senderAttr?.value) {
                mintedBy = senderAttr.value;
              } else {
                const si = description.lastIndexOf("ຜູ້ສົ່ງ:");
                if (si > -1) mintedBy = description.slice(si + "ຜູ້ສົ່ງ:".length).trim();
              }
            }
          } catch (_) {}

          nft = {
            tokenId: Number(tokenId),
            name: b?.badgeName || "Badge #" + tokenId,
            isTransferable,
            description,
            image,
            collection: "ອອກໂດຍ " + (issuerName || "ຄົນທົ່ວໄປ"),
            contractAddress: contractAddr,
            attributes,
            issuedAt: b ? Number(b.issuedAt) || null : null,
            issuedTo: b ? b[2] || null : null,
            mintedBy,
            txHash: null,
            senderWallet: null,
          };
        } catch (_) {
          nft = {
            tokenId: Number(tokenId), name: "Badge #" + tokenId,
            description: "", image: null, isTransferable: false,
            collection: "ຄົນທົ່ວໄປ", contractAddress: contractAddr,
            attributes: [], issuedAt: null, mintedBy: null, txHash: null, senderWallet: null,
          };
        }

        allNFTs[idx] = nft;
        replaceSkeletonCard(idx, nft);
        loadedCount++;
        updateLoadProgress(loadedCount, total);
      })
    );

    allNFTs = allNFTs.filter(n => n !== null);
    if (nftCountEl) nftCountEl.textContent = allNFTs.length;
    if (countBadge) countBadge.textContent = allNFTs.length;

  } catch (err) {
    showLoading(false);
    showStatus("ດຶງຂໍ້ມູນຈາກ LAB Chain ບໍ່ສຳເລັດ\n" + (err.message || ""), true);
  }
}

async function fetchFromOpenSea(address, contractAddress, osChain) {
  if (!osChain) {
    showLoading(false);
    showStatus('Network ບໍ່ຮອງຮັບ\nກະລຸນາໃສ່ Contract Address ແລ້ວກົດ "ດຶງ NFT"', true);
    return;
  }
  try {
    let url =
      "https://testnets-api.opensea.io/v2/chain/" +
      osChain +
      "/account/" +
      address +
      "/nfts?limit=50";
    if (contractAddress)
      url =
        "https://testnets-api.opensea.io/v2/chain/" +
        osChain +
        "/contract/" +
        contractAddress +
        "/nfts?limit=50";
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await res.json();
    const items = data.nfts || data.results || [];
    if (!items.length) {
      showLoading(false);
      showStatus("ບໍ່ພົບ NFT");
      document.getElementById("nftCount").textContent = 0;
      return;
    }
    allNFTs = items.map((nft) => ({
      tokenId: nft.identifier || nft.token_id,
      name: nft.name || "Token #" + nft.identifier,
      description: nft.description || "",
      image: nft.image_url || nft.display_image_url || null,
      collection: nft.collection || shortenAddr(nft.contract),
      contractAddress: nft.contract,
      attributes: nft.traits || [],
      issuedAt: null,
      txHash: null,
    }));
    showLoading(false);
    renderGrid(allNFTs);
    document.getElementById("nftCount").textContent = allNFTs.length;
  } catch (err) {
    showLoading(false);
    showStatus("ດຶງ NFT ບໍ່ສຳເລັດ: " + (err.message || ""), true);
  }
}
