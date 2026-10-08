<?php include '../includes/header.php'; ?>

<main>

  <div class="page-hero">
    <p class="eyebrow"><i class="fa-solid fa-rocket"></i> &nbsp;Getting Started</p>
    <h1>ການຕິດຕັ້ງ</h1>
    <p>ຕິດຕັ້ງ MetaMask, ເພີ່ມ LABChain Network ແລະ ເລີ່ມໃຊ້ງານ NFT LAO ໄດ້ໃນ 5 ນາທີ.</p>
    <div class="tag-row">
      <span class="tag tag-cyan"><i class="fa-solid fa-link"></i> Chain ID 5222</span>
      <span class="tag tag-blue"><i class="fa-brands fa-ethereum"></i> EVM Compatible</span>
    </div>
  </div>

  <hr class="divider">

  <!-- Step 1: MetaMask -->
  <p class="section-title"><i class="fa-solid fa-list-ol"></i> ຂັ້ນຕອນການຕິດຕັ້ງ</p>
  <ol class="steps">

    <li>
      <div class="step-content">
        <h4>ຕິດຕັ້ງ MetaMask</h4>
        <p>ດາວໂຫຼດ MetaMask Extension ສຳລັບ Browser ຂອງທ່ານ (Chrome, Firefox, Brave ຫຼື Edge). MetaMask ແມ່ນ EVM Wallet ທີ່ Platform ຮອງຮັບ.</p>
      </div>
    </li>

    <li>
      <div class="step-content">
        <h4>ເພີ່ມ LABChain Network</h4>
        <p>ໄປທີ່ <a href="https://labchain.la" target="_blank" rel="noopener" style="color:var(--cyan)">labchain.la</a> ແລ້ວກົດ "Add to MetaMask" ເພື່ອເພີ່ມ Network ອັດຕະໂນມັດ. ຫຼື ຕັ້ງຄ່າດ້ວຍຕົນເອງຕາມ Parameter ດ້ານລຸ່ມ.</p>
      </div>
    </li>

    <li>
      <div class="step-content">
        <h4>ລົງທະບຽນໃນ Platform</h4>
        <p>ເຊື່ອມຕໍ່ Wallet ໃນ NFT LAO Platform ແລ້ວ Register ຄັ້ງດຽວ On-chain. ບໍ່ຕ້ອງມີ Email ຫຼື Password — ໃຊ້ Wallet Address ເປັນ Identity.</p>
      </div>
    </li>

    <li>
      <div class="step-content">
        <h4>ຮັບ LAB Token ສຳລັບ Gas</h4>
        <p>ທຸກ Transaction (Mint, Transfer, Recovery) ຕ້ອງໃຊ້ LAB ເປັນ Gas Fee. Gas ຂອງ LABChain ຕໍ່າກວ່າ Ethereum Mainnet ຫຼາຍ. ຮັບ LAB ໄດ້ຈາກ Exchange ຫຼື Faucet ຂອງ Network.</p>
      </div>
    </li>

  </ol>

  <hr class="divider">

  <!-- Manual network config -->
  <p class="section-title"><i class="fa-solid fa-sliders"></i> Manual Network Configuration</p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:16px;">ຖ້າຕ້ອງການຕັ້ງຄ່າ Network ດ້ວຍຕົນເອງໃນ MetaMask:</p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col">Field</th>
        <th scope="col">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Network Name</td><td>LABChain</td></tr>
      <tr><td>RPC URL</td><td><code>https://rpc.labchain.network</code></td></tr>
      <tr><td>Chain ID</td><td><code>5222</code></td></tr>
      <tr><td>Currency Symbol</td><td>LAB</td></tr>
      <tr><td>Block Explorer URL</td><td><code>https://explorer.labchain.la</code></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Block Explorer -->
  <p class="section-title"><i class="fa-solid fa-magnifying-glass"></i> Block Explorer</p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:16px;">
    ໃຊ້ <a href="https://explorer.labchain.la" target="_blank" rel="noopener" style="color:var(--cyan)">explorer.labchain.la</a> ເພື່ອ:
  </p>
  <ul style="font-size:13.5px;color:var(--text-muted);line-height:2;padding-left:20px;margin-bottom:16px;">
    <li>ຕິດຕາມ Transaction ຂອງທ່ານ ດ້ວຍ Tx Hash</li>
    <li>ເບິ່ງ Contract ABI ແລະ ທົດລອງ Call Functions ໂດຍກົງ</li>
    <li>ກວດສອບ NFT Ownership ແລະ Token Metadata</li>
    <li>ເບິ່ງ Event Log ຂອງ Contract ທັງໝົດ</li>
  </ul>

  <div class="callout callout-info" role="note">
    <i class="fa-solid fa-circle-info"></i>
    <div>
      Contract Address ຂອງ NFT LAO ເທິງ LABChain:
      <code>0xadDcFB1a988f199F977D678a3A42650b1740466C</code>
      &mdash; ສາມາດ Verify ໄດ້ທີ່
      <a href="https://explorer.labchain.la" target="_blank" rel="noopener">explorer.labchain.la</a>
    </div>
  </div>

  <hr class="divider">

  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <a href="/Document/pages/smart-contract.php" class="btn-primary" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);">
      <i class="fa-solid fa-file-code"></i> Contract Reference
    </a>
  </div>

</main>

<?php include '../includes/footer.php'; ?>
