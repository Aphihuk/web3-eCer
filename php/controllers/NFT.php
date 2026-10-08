<!DOCTYPE html>
<html lang="lo">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ໃບຢັ້ງຢືນ NFT — NFT LAO ຈຳກັດ</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="../css/index.css">
</head>

<body>

<noscript>
  <div style="text-align:center;padding:1.5rem 2rem;background:#16161f;color:#e8e8f0;font-family:'Noto Sans Lao',sans-serif;border-bottom:1px solid #2a2a3a;font-size:0.95rem;line-height:1.7;">
    ໜ້ານີ້ຕ້ອງການ JavaScript ເພື່ອເຊື່ອມຕໍ່ Wallet ແລະ ເບິ່ງ NFT. ກະລຸນາເປີດໃຊ້ JavaScript ໃນ browser ຂອງທ່ານ.
  </div>
</noscript>

<header>
    <div class="logo">NFT<span>.</span>Gallery</div>
    <div class="network-badge" role="status" aria-live="polite" aria-label="ສະຖານະເຄືອຂ່າຍ">
        <span class="dot" aria-hidden="true"></span>
        <span id="networkName">—</span>
    </div>
    <div class="butt">
        <button id="linkBtn" onclick="link()" type="button" aria-label="ກັບໄປໜ້າຫຼັກ">ໜ້າຫຼັກ</button>
    </div>
</header>

<div class="hero" id="heroSection">
    <div class="hero-network-badge">
        <span class="hero-dot" aria-hidden="true"></span>
        LAB Chain · Chain ID 5222
    </div>
    <h1>ໃບຢັ້ງຢືນ NFT ຂອງທ່ານ</h1>
    <p>ເຊື່ອມຕໍ່ MetaMask ເພື່ອເບິ່ງໃບຢັ້ງຢືນທີ່ບໍ່ສາມາດປ່ຽນແປງໄດ້ ທີ່ຖືກເກັບໄວ້ຢ່າງຖາວອນໃນ LAB Chain</p>
    <button id="connectBtn" onclick="connectWallet()" type="button" aria-label="ເຊື່ອມຕໍ່ MetaMask Wallet">
        <svg viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M32.9582 1L18.6349 11.6769L21.3298 5.30603L32.9582 1Z" fill="#E17726" />
            <path d="M2.04102 1L16.2335 11.7826L13.6694 5.30603L2.04102 1Z" fill="#E27625" />
            <path d="M28.2141 23.5185L24.3736 29.2511L32.0948 31.3965L34.3229 23.6389L28.2141 23.5185Z" fill="#E27625" />
            <path d="M0.689453 23.6389L2.90315 31.3965L10.6244 29.2511L6.78387 23.5185L0.689453 23.6389Z" fill="#E27625" />
        </svg>
        ເຊື່ອມຕໍ່ MetaMask
    </button>
    <!-- <div class="hero-steps" aria-label="ຂັ້ນຕອນການໃຊ້ງານ">
        <div class="hero-step">
            <div class="hero-step-num">1</div>
            <span>ເຊື່ອມຕໍ່ Wallet</span>
        </div>
        <div class="hero-step-sep" aria-hidden="true"></div>
        <div class="hero-step">
            <div class="hero-step-num">2</div>
            <span>ໂຫລດໃບຢັ້ງຢືນ</span>
        </div>
        <div class="hero-step-sep" aria-hidden="true"></div>
        <div class="hero-step">
            <div class="hero-step-num">3</div>
            <span>ກວດສອບ on-chain</span>
        </div>
    </div> -->
</div>

<div id="noMetamask" style="display:none;" role="alert" aria-live="assertive">
    <div class="no-metamask-icon"></div>
    <h3>ບໍ່ພົບ MetaMask</h3>
    <p>ກະລຸນາຕິດຕັ້ງ <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask extension</a> ໃນ browser ຂອງທ່ານ ແລ້ວ reload ໜ້ານີ້ ເພື່ອເຊື່ອມຕໍ່ wallet</p>
</div>

<div class="container">
    <div id="walletInfo" style="display:none;" role="region" aria-label="ຂໍ້ມູນ Wallet">
        <div class="wallet-info-row">
            <div class="wallet-info-left">
                <div class="wallet-info-label">CONNECTED WALLET</div>
                <div class="wallet-info-addr" id="walletAddress">—</div>
            </div>
            <div class="wallet-info-stats">
                <!-- <div class="wallet-stat">
                    <div class="wallet-stat-num" id="nftCount">—</div>
                    <div class="wallet-stat-label">ໃບຢັ້ງຢືນ</div>
                </div> -->
                <div class="wallet-stat">
                    <div class="wallet-stat-num" style="color:var(--cyan);font-size:1rem;padding-top:4px;" id="statNetwork">—</div>
                    <div class="wallet-stat-label">ເຄືອຂ່າຍ</div>
                </div>
            </div>
        </div>
    </div>

    <div id="status" role="status" aria-live="polite" aria-atomic="true"></div>

    <div id="loading" style="display:none;" aria-live="polite" aria-atomic="true">
        <div class="spinner" aria-hidden="true"></div>
        <p>ກຳລັງໂຫລດ NFT...</p>
    </div>
</div>

<div id="nftControls" class="container" style="display:none;">
    <div class="controls-row">
        <div class="section-title">
            ໃບຢັ້ງຢືນ
            <span id="nftCountBadge" class="count-chip" aria-live="polite"></span>
        </div>
        <!-- <div id="loadProgress" class="load-progress" style="display:none;" aria-live="polite" aria-atomic="true"></div> -->
    </div>

    <details class="advanced-toggle">
        <summary>ຄົ້ນຫາຈາກ Contract Address ສະເພາະ</summary>
        <div class="advanced-body">
            <div class="input-row">
                <label for="contractInput" class="sr-only">Contract Address</label>
                <input type="text" id="contractInput" placeholder="0x... Contract address ສະເພາະ (ວ່າງ = ດຶງທຸກ contract)" />
                <button type="button" onclick="fetchFromContract()">ດຶງ NFT</button>
            </div>
        </div>
    </details>
</div>

<div id="nftGrid" role="list" aria-label="ລາຍການໃບຢັ້ງຢືນ NFT"></div>

<div id="modal" onclick="closeModal(event)" role="dialog" aria-modal="true" aria-labelledby="modalName">
    <div class="modal-inner" id="modalInner">
        <img id="modalImg" class="modal-img" src="" alt="" loading="lazy">
        <div class="modal-body">
            <div class="modal-name" id="modalName"></div>
            <div class="modal-collection" id="modalCollection"></div>
            <div class="modal-desc" id="modalDesc"></div>

            <div class="modal-verify">
                <h4>VERIFICATION</h4>
                <div class="modal-verify-row">
                    <span class="vkey">ວັນທີ່ໄດ້ຮັບ</span>
                    <span id="modalIssuedAt">—</span>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">Contract Hash</span>
                    <span id="modalHash">—</span>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">Contract Verified</span>
                    <span id="modalVerified">—</span>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">Contract Address</span>
                    <a id="modalEtherscan" href="#" target="_blank" rel="noopener noreferrer">—</a>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">Token ID</span>
                    <span id="modalTokenId">—</span>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">ຜູ້ສົ່ງ</span>
                    <span id="modalMintedBy">—</span>
                </div>
                <div class="modal-verify-row">
                    <span class="vkey">ສະຖານະ</span>
                    <span id="modalTrans">—</span>
                </div>
            </div>

            <!-- <div class="modal-attrs" id="modalAttrs"></div> -->

            <button class="modal-close" type="button"
                onclick="document.getElementById('modal').classList.remove('open')"
                aria-label="ປິດລາຍລະອຽດ">
                 &nbsp;ປິດ
            </button>
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
<script src="../config/contract.config.js"></script>
<script src="../script/file_NFT/connect_Wallet.js"></script>
<script src="../script/file_NFT/contractaddress.js"></script>
<script src="../script/file_NFT/Network_chain.js"></script>
<script src="../script/file_NFT/JWT.js"></script>
<script src="../script/file_NFT/getNFTaddress.js"></script>
<script src="../script/file_NFT/selectNFTINModal.js"></script>
<script src="../script/file_NFT/modalNFT.js"></script>
<script src="../script/file_NFT/LAB_ABI.js"></script>
<script>
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('modal');
      if (modal && modal.classList.contains('open')) {
        modal.classList.remove('open');
      }
    }
  });
</script>

</body>
</html>
