<?php include 'includes/header.php'; ?>

<main>

  <!-- Hero -->
  <div class="page-hero">
    <h1>NFT LAO Platform</h1>
    <p>NFT LAO ແມ່ນ Platform ສຳລັບ Mint, ໂອນ ແລະ ຈັດການ NFT ເທິງ LABChain — Blockchain EVM ທ້ອງຖິ່ນຂອງລາວ. ລະບົບອອກແບບໂດຍສະເພາະສຳລັບ Badge ດ້ານການສຶກສາ ແລະ ໃບຢັ້ງຢືນ Digital.</p>
    <div class="tag-row">
      <span class="tag tag-cyan"><i class="fa-solid fa-link" aria-hidden="true"></i> Chain ID 5222</span>
      <span class="tag tag-blue"><i class="fa-brands fa-ethereum" aria-hidden="true"></i> EVM Compatible</span>
      <span class="tag tag-green"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Mainnet Live</span>
    </div>
  </div>

  <hr class="divider">

  <!-- What users can do -->
  <p class="section-title"><i class="fa-solid fa-layer-group" aria-hidden="true"></i> ສິ່ງທີ່ທ່ານເຮັດໄດ້</p>
  <div class="cards">

    <a href="/Document/pages/nft-guide.php#mint" class="card">
      <div class="card-icon"><i class="fa-solid fa-image" aria-hidden="true"></i></div>
      <h3>Mint NFT</h3>
      <p>ສ້າງ NFT Badge ໃໝ່ ພ້ອມ Metadata, Badge Name ແລະ Activity. ຮອງຮັບ Single ແລະ Batch Mint.</p>
    </a>

    <a href="/Document/pages/nft-guide.php#transfer" class="card">
      <div class="card-icon"><i class="fa-solid fa-right-left" aria-hidden="true"></i></div>
      <h3>Transfer NFT</h3>
      <p>ໂອນ NFT ໄປຫາ Wallet ທ່ານອື່ນ ທີ່ລົງທະບຽນໃນລະບົບ. ຕ້ອງໃຊ້ Gas ຢ່າງດຽວ.</p>
    </a>

    <a href="/Document/pages/smart-contract.php#transferable" class="card">
      <div class="card-icon"><i class="fa-solid fa-lock" aria-hidden="true"></i></div>
      <h3>Disable Transfer</h3>
      <p>Admin ສາມາດລ໋ອກ NFT ໃຫ້ Soulbound (ໂອນບໍ່ໄດ້) ຫຼື Unlock ໄດ້ຕາມຕ້ອງການ ຕໍ່ Token.</p>
    </a>

    <a href="/Document/pages/nft-guide.php#view" class="card">
      <div class="card-icon"><i class="fa-solid fa-table-cells" aria-hidden="true"></i></div>
      <h3>View NFTs</h3>
      <p>ເບິ່ງ Collection ທັງໝົດຂອງ Wallet, Badge Details, ແລະ ປະຫວັດ Token URI.</p>
    </a>

    <a href="/Document/pages/smart-contract.php#recovery" class="card">
      <div class="card-icon"><i class="fa-solid fa-rotate" aria-hidden="true"></i></div>
      <h3>Wallet Recovery</h3>
      <p>ຍ້າຍ NFT ຈາກ Wallet ເກົ່າໄປ Wallet ໃໝ່ ໂດຍຜ່ານ On-chain Recovery ທີ່ປອດໄພ.</p>
    </a>

    <a href="/Document/pages/smart-contract.php#admin" class="card">
      <div class="card-icon"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i></div>
      <h3>Admin Controls</h3>
      <p>Operator ສາມາດ Revoke Badge, Blacklist Wallet, Force Recover ແລະ ຄຸ້ມຄອງ User Profile.</p>
    </a>

  </div>

  <hr class="divider">

  <!-- Network info -->
  <p class="section-title"><i class="fa-solid fa-network-wired" aria-hidden="true"></i> Network Information</p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col">Parameter</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Network Name</td><td>LABChain</td></tr>
      <tr><td>Chain ID</td><td><code>5222</code></td></tr>
      <tr><td>Currency Symbol</td><td>LAB</td></tr>
      <tr><td>RPC URL</td><td><code>https://rpc.labchain.network</code></td></tr>
      <tr><td>Block Explorer</td><td><a href="https://explorer.labchain.la" target="_blank" rel="noopener">explorer.labchain.la</a></td></tr>
      <tr><td>Contract Address</td><td><code>0xadDcFB1a988f199F977D678a3A42650b1740466C</code></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Where to go next -->
  <p class="section-title"><i class="fa-solid fa-map-signs" aria-hidden="true"></i> ຂັ້ນຕໍ່ໄປ</p>
  <div class="cards">
    <a href="/Document/pages/installation.php" class="card">
      <div class="card-icon"><i class="fa-solid fa-rocket" aria-hidden="true"></i></div>
      <h3>Getting Started</h3>
      <p>ຕິດຕັ້ງ MetaMask, ເພີ່ມ LABChain Network ແລະ ເລີ່ມໃຊ້ງານໃນ 5 ນາທີ.</p>
    </a>
    <a href="/Document/pages/smart-contract.php" class="card">
      <div class="card-icon"><i class="fa-solid fa-file-code" aria-hidden="true"></i></div>
      <h3>Contract Reference</h3>
      <p>ABI, Functions, Events ແລະ Access Control Matrix ສຳລັບ Engineer.</p>
    </a>
  </div>

  <div class="callout callout-info" role="note">
    <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
    <div>ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ? ສົ່ງ Support Ticket ໄດ້ທີ່ <a href="/support/support.php">Support</a> ຫຼື ຕິດຕາມ Transaction ເທິງ <a href="https://explorer.labchain.la" target="_blank" rel="noopener">explorer.labchain.la</a></div>
  </div>

</main>

<?php include 'includes/footer.php'; ?>
