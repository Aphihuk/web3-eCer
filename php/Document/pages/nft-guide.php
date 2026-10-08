<?php include '../includes/header.php'; ?>

<style>
/* ── NFT card grid ── */
.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin: 20px 0;
}

.nft-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color .2s, transform .2s;
}
.nft-card:hover {
  border-color: rgba(0,170,255,0.35);
  transform: translateY(-2px);
}

.nft-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #1a1f2e 0%, #0d1117 60%, #151b27 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.nft-img::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.18) 0%, transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(0,170,255,0.1) 0%, transparent 55%);
}
.nft-img i {
  font-size: 38px;
  color: rgba(124,58,237,0.5);
  position: relative;
  z-index: 1;
}
.nft-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.nft-badge-status {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  z-index: 2;
}
.nft-badge-status.locked {
  background: rgba(239,68,68,0.2);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.3);
}
.nft-badge-status.unlocked {
  background: rgba(34,197,94,0.15);
  color: #4ade80;
  border: 1px solid rgba(34,197,94,0.25);
}

.nft-meta {
  padding: 12px 14px;
}
.nft-meta .nft-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nft-meta .nft-activity {
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}
.nft-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.nft-token-id {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
}
.nft-issued {
  font-size: 10px;
  color: var(--text-muted);
}

/* ── Mint step visual ── */
.mint-flow {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 20px 0;
  position: relative;
}
.mint-flow::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 28px;
  bottom: 28px;
  width: 2px;
  background: linear-gradient(to bottom, var(--cyan), rgba(0,170,255,0.1));
}
.mint-step {
  display: flex;
  gap: 16px;
  padding: 0 0 28px;
  position: relative;
  z-index: 1;
}
.mint-step:last-child { padding-bottom: 0; }
.mint-num {
  width: 40px;
  height: 40px;
  background: var(--bg);
  border: 2px solid var(--cyan);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--cyan);
  flex-shrink: 0;
}
.mint-body {
  flex: 1;
  padding-top: 8px;
}
.mint-body h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.mint-body p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 8px;
}
.field-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 6px;
}
.field-list li {
  display: flex;
  gap: 10px;
  font-size: 12.5px;
  color: var(--text-muted);
  align-items: flex-start;
}
.field-list li .field-name {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--cyan);
  background: var(--cyan-dim);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── advanced callout ── */
.advanced-box {
  background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(0,170,255,0.05) 100%);
  border: 1px solid rgba(124,58,237,0.3);
  border-radius: var(--radius);
  padding: 20px 22px;
  margin: 28px 0;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.advanced-box-icon {
  width: 40px; height: 40px;
  background: rgba(124,58,237,0.15);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #a78bfa;
  font-size: 17px;
  flex-shrink: 0;
}
.advanced-box h4 { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
.advanced-box p  { font-size: 13px; color: var(--text-muted); line-height: 1.7; margin-bottom: 10px; }
.advanced-box a.adv-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 16px;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.35);
  border-radius: 7px;
  color: #c4b5fd;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: background .15s, border-color .15s;
}
.advanced-box a.adv-link:hover {
  background: rgba(124,58,237,0.25);
  border-color: rgba(124,58,237,0.6);
}
</style>

<main>

  <div class="page-hero">
    <p class="eyebrow"><i class="fa-solid fa-image"></i> &nbsp;NFT Guide</p>
    <h1>NFT Guide</h1>
    <p>ຄູ່ມືການ Mint, ໂອນ ແລະ ເບິ່ງ NFT Badge ເທິງ NFT LAO Platform.</p>
    <div class="tag-row">
      <span class="tag tag-cyan"><i class="fa-solid fa-link"></i> LABChain</span>
      <span class="tag tag-green"><i class="fa-solid fa-circle-check"></i> Mainnet</span>
    </div>
  </div>

  <hr class="divider">

  <!-- ══ MINT ══ -->
  <p class="section-title" id="mint">
    <i class="fa-solid fa-image"></i> Mint NFT Badge
  </p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:20px;max-width:620px;">
    ການ Mint ຈະສ້າງ NFT Badge ໃໝ່ On-chain ແລະ ສົ່ງໃຫ້ Wallet ຂອງ Student ທັນທີ. Badge ທຸກອັນຖືກ Store ຢ່າງຖາວອນເທິງ LABChain.
  </p>

  <div class="mint-flow">

    <div class="mint-step">
      <div class="mint-num"><i class="fa-solid fa-wallet" style="font-size:15px;"></i></div>
      <div class="mint-body">
        <h4>ເຊື່ອມຕໍ່ Wallet</h4>
        <p>ກົດ "Connect Wallet" ແລ້ວ Approve ຜ່ານ MetaMask. Wallet ຂອງທ່ານຕ້ອງ<br>ລົງທະບຽນ (<code>register()</code>) ໃນ Platform ກ່ອນ ຈຶ່ງສາມາດ Mint ໄດ້.</p>
      </div>
    </div>

    <div class="mint-step">
      <div class="mint-num">2</div>
      <div class="mint-body">
        <h4>ກຳນົດຂໍ້ມູນ Badge</h4>
        <p>ປ້ອນຂໍ້ມູນຂອງ Badge ທີ່ຕ້ອງການ Mint:</p>
        <ul class="field-list">
          <li><span class="field-name">Badge Name</span> ຊື່ Badge / ໃບຢັ້ງຢືນ (ເຊັ່ນ "Web3 Fundamentals")</li>
          <li><span class="field-name">Activity</span> ກິດຈະກຳ ຫຼື ຫຼັກສູດທີ່ Complete (ເຊັ່ນ "Completed Lab 1")</li>
          <li><span class="field-name">Description</span> ຄຳອະທິບາຍເພີ່ມເຕີມ ແລະ ຜູ້ສົ່ງ</li>
          <li><span class="field-name">Image</span> ຮູບ Badge (PNG, JPG, GIF, SVG, MP4 — ສູງສຸດ 100 MB)</li>
        </ul>
      </div>
    </div>

    <div class="mint-step">
      <div class="mint-num">3</div>
      <div class="mint-body">
        <h4>ກຳນົດ Student ແລະ ການໂອນ</h4>
        <p>ໃສ່ Wallet Address ຂອງ Student ທີ່ຈະຮັບ Badge. ເລືອກວ່າ Badge ນີ້ <strong style="color:var(--text)">ໂອນໄດ້</strong> ຫຼື <strong style="color:var(--text)">Soulbound (ໂອນບໍ່ໄດ້)</strong>:</p>
        <ul class="field-list">
          <li><span class="field-name"> ໂອນໄດ້</span> Student ສາມາດໂອນ Badge ໃຫ້ Wallet ທ່ານອື່ນໄດ້</li>
          <li><span class="field-name"> Soulbound</span> Badge ຜູກກັບ Wallet ນັ້ນຕະຫຼອດ — ບໍ່ສາມາດໂອນໄດ້</li>
        </ul>
      </div>
    </div>

    <div class="mint-step">
      <div class="mint-num">4</div>
      <div class="mint-body">
        <h4>Upload Metadata ໄປ IPFS</h4>
        <p>ລະບົບຈະ Upload ຮູບ ແລະ Metadata ໄປ IPFS ຜ່ານ Pinata ໂດຍອັດຕະໂນມັດ. Token URI ທີ່ໄດ້ (format: <code>ipfs://Qm...</code>) ຈະຖືກ Store On-chain ພ້ອມກັບ Badge.</p>
      </div>
    </div>

    <div class="mint-step">
      <div class="mint-num">5</div>
      <div class="mint-body">
        <h4>Sign Transaction ແລະ ຢືນຢັນ</h4>
        <p>MetaMask ຈະສະແດງ Popup ຂໍ Confirm Transaction. ກວດ Gas Fee ແລ້ວກົດ Confirm. ຈາກນັ້ນລໍຖ້າ Block Confirmation (~2–5 ວິນາທີ ເທິງ LABChain). Badge ຈະປະກົດໃນ Collection ຂອງ Student ທັນທີ.</p>
      </div>
    </div>

  </div>

  <div class="callout callout-info" role="note">
    <i class="fa-solid fa-layer-group"></i>
    <div><strong>Batch Mint:</strong> ຕ້ອງການ Mint Badge ດຽວກັນໃຫ້ຫຼາຍ Student ພ້ອມກັນ? ໃຊ້ Batch Mint — ເລືອກ Wallet ຫຼາຍ Address ໃນ Transaction ດຽວ ເພື່ອປະຫຍັດ Gas.</div>
  </div>

  <hr class="divider">

  <!-- ══ TRANSFER ══ -->
  <p class="section-title" id="transfer">
    <i class="fa-solid fa-right-left"></i> ໂອນ NFT
  </p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:20px;max-width:620px;">
    Badge ທີ່ <strong style="color:var(--text)">ໂອນໄດ້</strong> ສາມາດ Transfer ຈາກ Wallet ໜຶ່ງໄປຫາ Wallet ອື່ນໄດ້. ທັງ Sender ແລະ Receiver ຕ້ອງລົງທະບຽນ ແລະ Active ໃນ Platform.
  </p>

  <ol class="steps">
    <li>
      <div class="step-content">
        <h4>ເລືອກ Badge ທີ່ຕ້ອງການໂອນ</h4>
        <p>ກົດ Badge ໃນ Collection ຂອງທ່ານ ແລ້ວກວດສອບວ່າ Status ເປັນ " ໂອນໄດ້"</p>
      </div>
    </li>
    <li>
      <div class="step-content">
        <h4>ໃສ່ Wallet Address ຜູ້ຮັບ</h4>
        <p>Wallet Address ຂອງຜູ້ຮັບຕ້ອງຖືກຕ້ອງ ແລະ ຕ້ອງລົງທະບຽນໃນ Platform ກ່ອນ</p>
      </div>
    </li>
    <li>
      <div class="step-content">
        <h4>Confirm Transaction</h4>
        <p>Approve ຜ່ານ MetaMask — ຈ່າຍພຽງແຕ່ Gas Fee (LAB Token). Badge ຈະຖືກໂອນທັນທີຫຼັງ Confirm.</p>
      </div>
    </li>
  </ol>

  <div class="callout callout-warn" role="note">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <div>Badge ທີ່ Status ເປັນ <strong> Soulbound</strong> ບໍ່ສາມາດໂອນໄດ້ໂດຍ User. ສຳລັບກໍລະນີພິເສດ ເຊັ່ນ ການໂອນ Wallet Recovery — ເບິ່ງ <a href="/Document/pages/smart-contract.php#recovery">Wallet Recovery</a>.</div>
  </div>

  <hr class="divider">

  <!-- ══ VIEW COLLECTION ══ -->
  <p class="section-title" id="view">
    <i class="fa-solid fa-table-cells"></i> ເບິ່ງ Collection
  </p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:20px;max-width:620px;">
    Collection ສະແດງ Badge ທັງໝົດທີ່ Wallet ນັ້ນຖືຢູ່. ກົດ Badge ໃດໆ ເພື່ອເບິ່ງລາຍລະອຽດເຕັມ.
  </p>

  <!-- NFT card grid (visual demo) -->
  <div class="nft-grid">

    <div class="nft-card">
      <div class="nft-img">
        <i class="fa-solid fa-certificate"></i>
        <span class="nft-badge-status locked"> Soulbound</span>
      </div>
      <div class="nft-meta">
        <div class="nft-name">Web3 Fundamentals</div>
        <div class="nft-activity">Completed Lab 1</div>
        <div class="nft-meta-row">
          <span class="nft-token-id">#0</span>
          <span class="nft-issued">LABChain</span>
        </div>
      </div>
    </div>

    <div class="nft-card">
      <div class="nft-img">
        <i class="fa-solid fa-award"></i>
        <span class="nft-badge-status unlocked"> ໂອນໄດ້</span>
      </div>
      <div class="nft-meta">
        <div class="nft-name">Hackathon 2025</div>
        <div class="nft-activity">Participant</div>
        <div class="nft-meta-row">
          <span class="nft-token-id">#1</span>
          <span class="nft-issued">LABChain</span>
        </div>
      </div>
    </div>

    <div class="nft-card">
      <div class="nft-img">
        <i class="fa-solid fa-medal"></i>
        <span class="nft-badge-status locked"> Soulbound</span>
      </div>
      <div class="nft-meta">
        <div class="nft-name">Smart Contract Dev</div>
        <div class="nft-activity">Module 3 Complete</div>
        <div class="nft-meta-row">
          <span class="nft-token-id">#2</span>
          <span class="nft-issued">LABChain</span>
        </div>
      </div>
    </div>

    <div class="nft-card">
      <div class="nft-img">
        <i class="fa-solid fa-star"></i>
        <span class="nft-badge-status locked"> Soulbound</span>
      </div>
      <div class="nft-meta">
        <div class="nft-name">Blockchain Basics</div>
        <div class="nft-activity">Foundation Course</div>
        <div class="nft-meta-row">
          <span class="nft-token-id">#3</span>
          <span class="nft-issued">LABChain</span>
        </div>
      </div>
    </div>

  </div>

  <p style="font-size:12px;color:var(--text-muted);margin-top:-4px;margin-bottom:24px;">
    <i class="fa-solid fa-circle-info" style="color:var(--cyan);margin-right:5px;"></i>
    ຕົວຢ່າງ Badge ຮູບແບບທີ່ປາກົດໃນ Collection. ຮູບຈິງມາຈາກ IPFS Metadata ຂອງແຕ່ລະ Token.
  </p>

  <!-- Modal detail preview -->
  <p class="section-title" style="font-size:15px;margin-top:8px;">
    <i class="fa-solid fa-expand"></i> ລາຍລະອຽດ Badge
  </p>
  <p style="font-size:13.5px;color:var(--text-muted);margin-bottom:16px;max-width:600px;">
    ເມື່ອກົດ Badge ຈະສະແດງ Panel ລາຍລະອຽດ ທີ່ປະກອບດ້ວຍ:
  </p>
  <table class="doc-table">
    <thead><tr><th>Field</th><th>ຄຳອະທິບາຍ</th></tr></thead>
    <tbody>
      <tr><td>ຊື່ Badge</td><td>Badge Name ທີ່ຕັ້ງຕອນ Mint</td></tr>
      <tr><td>Collection</td><td>ຊື່ Collection / Contract</td></tr>
      <tr><td>Activity</td><td>ກິດຈະກຳ ຫຼື ຫຼັກສູດ</td></tr>
      <tr><td>ຜູ້ສົ່ງ</td><td>Wallet ທີ່ Mint Badge ນີ້</td></tr>
      <tr><td>Token ID</td><td>ID ເປັນເອກະລັກຂອງ Token On-chain (#0, #1, ...)</td></tr>
      <tr><td>ສະຖານະ</td><td> ໂອນໄດ້ ຫຼື  Soulbound</td></tr>
      <tr><td>Contract</td><td>Address ຂອງ Smart Contract (link ໄປ Explorer)</td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- ══ ADVANCED ══ -->
  <div class="advanced-box">
    <div class="advanced-box-icon">
      <i class="fa-solid fa-flask"></i>
    </div>
    <div>
      <h4>Advanced — Contract Explorer</h4>
      <p>
        ສຳລັບ Developer ທີ່ຕ້ອງການ Interact ກັບ Contract ໂດຍກົງ — ກວດສອບ Token Holders,
        ອ່ານ State Variables, ທົດລອງ Call Functions ຜ່ານ Read/Write tab ໃນ Explorer.
        ທຸກ Transaction ແລະ Event ຂອງ NFT LAO Contract ຈະສະແດງ Real-time.
      </p>
      <a href="https://explorer.labchain.la/token/0xadDcFB1a988f199F977D678a3A42650b1740466C"
         target="_blank" rel="noopener" class="adv-link">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
        ເປີດ Contract ໃນ Explorer
      </a>
    </div>
  </div>

</main>

<?php include '../includes/footer.php'; ?>
