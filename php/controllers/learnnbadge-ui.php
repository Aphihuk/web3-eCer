<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ອອກໃບຢັ້ງຢືນ FNT</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;600;700;800&family=Outfit:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="../css/Contract.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
  <div class="wrap">
    <header>
      <div style="display:flex;align-items:center;gap:2rem;">
        <div class="logo">
          <span class="badge-icon">ອອກໃບຢັ້ງຢືນ</span>FNT<span class="accent"></span>
        </div>
        <nav class="top-nav">
          <a href="../index.php">ໜ້າຫຼັກ</a>
          <a href="./NFT.php">ເບີ່ງຮູບ NFT</a>
          <a href="../support/support.php">Support</a>
          <a href="/Document/index.php">ເອກະສານ</a>
        </nav>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span id="userLabel"></span>
        <button id="logoutBtn" onclick="logout()" style="display:none;">Logout</button>
        <button id="walletBtn" onclick="connectWallet()"> Connect Wallet</button>
      </div>
    </header>

    <!-- ===== HERO ===== -->
    <div id="heroSection">
      <div class="hero">
        <h1>ອອກໃບຢັ້ງຢືນ<br><span class="grad">NFT</span></h1>
        <p>ຍົກລະດັບຄວາມປອດໄພອອກໃບຢັ້ງຢືນໃນໂລກ blockchain</p>
        <button class="btn-primary" onclick="connectWallet()"> Connect MetaMask</button>
      </div>
    </div>

    <!-- ===== APP SECTION ===== -->
    <div id="appSection" style="display:none;">

      <div style="padding:0 2rem;max-width:1100px;margin:0 auto;">
        <div class="tabs">
          <button class="tab active" onclick="switchTab('my')">ໃບຢັ້ງຢືນ</button>
          <button class="tab tab-locked" onclick="handleMintTabClick()" id="mintTab" style="display:none;" title="ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ">ອອກໃບຢັ້ງຢືນ</button>
          <button class="tab" onclick="switchTab('profile')" id="profileTab" style="display:none;"> Profile</button>
          <button class="tab" onclick="switchTab('search')" id="searchTab">ຄົ້ນຫາ NFT ຂອງຄົນອື່ນ</button>
        </div>
      </div>

      <!-- ===== TAB: MY BADGES ===== -->
      <div id="tabMy" class="section">
        <div class="section-title">ໃບຢັ້ງຢືນທັງໝົດ</div>
        <div class="section-sub">NFT on LabChain</div>
        <div class="stats-bar">
          <div class="stat-card">
            <div class="num" id="myBadgeCount">0</div>
            <div class="lbl">ໃບຢັ້ງຢືນທີ່ມີຢູ່</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color:var(--teal)" id="totalMinted">—</div>
            <div class="lbl">ໃບຢັ້ງຢືນທັງໝົດ</div>
          </div>
          <div class="stat-card">
            <div class="num" style="color:var(--cyan);font-size:1.1rem;padding-top:4px;">LabChain</div>
            <div class="lbl">Network</div>
          </div>
        </div>
        <div id="status"></div>
        <div id="badgeGrid" class="badge-grid"></div>
      </div>

      <!-- ===== TAB: MINT ===== -->
      <div id="tabMint" class="section" style="display:none;">
        <div class="section-title">ອອກໃບຢັ້ງຢືນໃໝ່</div>
        <!-- <div class="section-sub">ສະເພາະ admin/owner ເທົ່ານັ້ນທີ່ມີສິດ</div> -->

        <div class="mint-form">
          <div class="mint-price-tag">
            ຄ່າ Mint: <strong id="mintPriceDisplay">LAB</strong>
          </div>

          <!-- Quick Presets -->
          <div style="margin-bottom:1.3rem;">
            <div class="badge-presets-title">Quick Presets</div>
            <div class="badge-presets">
              <button class="preset-btn" onclick="fillPreset('Blockchain Beginner','ຜ່ານການຮຽນຮູ້ Blockchain')"> Blockchain Beginner</button>
              <button class="preset-btn" onclick="fillPreset('Smart Contract Dev','ຂຽນ Smart Contract ສຳເລັດ')"> Smart Contract</button>
              <button class="preset-btn" onclick="fillPreset('Web3 Explorer','ຮຽນຮູ້ Web3 ຄົບທຸກດ້ານ')"> Web3 Explorer</button>
              <button class="preset-btn" onclick="fillPreset('Hackathon Winner','ຊະນະການແຂ່ງຂັນ Blockchain')"> Hackathon Winner</button>
            </div>
          </div>

          <!-- Wallet Address list -->
          <div class="form-group">
            <label>
              Wallet Address
              <span class="wallet-count-badge" id="walletCountBadge">1</span>
            </label>
            <div class="wallet-list" id="walletList">
              <div class="wallet-row" id="walletRow_0">
                <input type="text" id="walletAddr_0" placeholder="0x..." oninput="updateMintPriceCalc()" />
              </div>
            </div>
            <button class="btn-add-wallet" onclick="addWalletRow()">
              <i class="fas fa-plus"></i> ເພີ່ມ Wallet
            </button>
            <div class="mint-price-calc" id="mintPriceCalc"></div>
          </div>

          <div class="form-group">
            <label>ຊື່ ໃບຢັ້ງຢືນ</label>
            <input type="text" id="mintName" placeholder="ຕົວຢ່າງ Blockchain Beginner" />
          </div>

          <div class="form-group">
            <label>ຄຳອະທິບາຍ</label>
            <textarea id="mintActivity" placeholder="ຕົວຢ່າງ ຜ່ານການຮຽນຮູ້ Blockchain"></textarea>
          </div>

          <label class="toggle-wrap" for="mintTransferable">
            <span class="toggle">
              <input type="checkbox" id="mintTransferable" />
              <span class="track"></span>
              <span class="thumb"></span>
            </span>
            <span class="label-text">
              <span class="label-main">ອະນຸຍາດໃຫ້ໂອນໄດ້</span>
              <span class="label-sub">Transferable</span>
            </span>
          </label>

          <!-- Upload Image -->
          <div class="form-group">
            <label>ຮູບໃບຢັ້ງຢືນ <span style="font-size:0.75rem;color:var(--muted);font-weight:400;">(ທາງເລືອກ)</span></label>
            <input type="file" name="file" id="file" class="inputfile" accept="image/*" onchange="previewMintFile(this)" />
            <label for="file" id="fileLbl"><i class="fas fa-image"></i> <span id="fileNameDisplay">ເລືອກຮູບ...</span></label>
          </div>
          <input type="hidden" id="mintURI" />

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">
            <button class="submit-btn outline" onclick="openDesigner()" type="button" style="flex:1;">
              <i class="fas fa-paint-brush"></i> ອອກແບບໃບຢັ້ງຢືນ
            </button>
            <button class="submit-btn" id="mintBtn" onclick="mintBadge()" style="flex:1;">Mint ຢັ້ງຢືນ</button>
          </div>
          <div id="mintStatus"></div>
        </div>
      </div>

      <!-- ===== TAB: PROFILE ===== -->
      <div id="tabProfile" class="section" style="display:none;">
        <div class="section-title">Profile</div>
        <div class="section-sub">ຂໍ້ມູນ Wallet ແລະ ໃບຢັ້ງຢືນ</div>

        <div style="max-width:620px; margin-left: auto; margin-right: auto;">

          <!-- Register Card -->
          <div class="register-card" id="registerCard" style="display:none;">
            <div class="reg-icon"></div>
            <h3>ລົງທະບຽນ Wallet ໃນ Contract</h3>
            <p>Wallet ຂອງທ່ານຍັງບໍ່ໄດ້ລົງທະບຽນ — ກະລຸນາລົງທະບຽນກ່ອນ<br>ຈຶ່ງຈະໄດ້ຮັບ NFT ແລະ ໃຊ້ງານໄດ້ຄົບຖ້ວນ</p>
            <span class="reg-name-box" id="registerNamePreview">—</span>
            <button class="btn-register" id="btnDoRegister" onclick="doRegisterWallet()">
              <i class="fas fa-user-plus"></i> ລົງທະບຽນດຽວນີ້
            </button>
            <div id="registerStatus"></div>
          </div>


          <div class="profile-card">
            <div class="profile-card-title">Wallet ປັດຈຸບັນ</div>
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
              <div class="profile-avatar" id="profileAvatar">🦊</div>
              <div style="flex:1;min-width:0;">
                <div class="profile-addr" id="profileAddrDisplay">—</div>
                <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
                  <span class="verified-badge no" id="verifiedBadge"> ກຳລັງກວດ...</span>
                </div>
              </div>
            </div>
            <hr class="profile-divider">
            <div class="profile-stat-row">
              <span>NFT ໃນ wallet ນີ້</span>
              <strong id="profileNftCount">—</strong>
            </div>
            <div style="margin-top:0.65rem;">
              <button class="btn-profile primary" onclick="switchTab('my');loadBadges();">
                <i class="fas fa-th"></i> ເບິ່ງ NFT ທັງໝົດ
              </button>
            </div>
            <div class="profile-stat-row" style="margin-top:0.65rem;">
              <span>Email linked</span>
              <strong id="profileEmail">—</strong>
            </div>
            <div id="walletHistoryRow" style="display:none;">
              <div class="profile-stat-row">
                <span>Wallet ເກົ່າທັງໝົດ</span>
                <span id="walletHistoryCount" style="font-size:0.75rem;color:var(--muted);">—</span>
              </div>
              <div id="walletHistoryList" style="display:flex;flex-direction:column;gap:3px;margin-top:0.2rem;padding-left:0.2rem;"></div>
            </div>
            <div class="profile-stat-row">
              <span>Network</span>
              <strong>LabChain (5222)</strong>
            </div>
          </div>

          <!-- Change Wallet -->
          <div class="profile-card">
            <div class="profile-card-title">ປ່ຽນ Wallet</div>
            <div class="step-pills">
              <span class="step-pill s1">① ກວດ wallet ໃໝ່</span>
              <span class="step-pill s2">② ຢືນຢັນການປ່ຽນ</span>
              <span class="step-pill s3">③ ດຶງ NFT</span>
            </div>

            <div class="form-group" style="margin-bottom:0.7rem;">
              <label style="font-size:0.82rem;color:var(--muted);margin-bottom:0.3rem;display:block;">Wallet Address ໃໝ່</label>
              <input type="text" id="newWalletInput" placeholder="0x..."
                style="width:100%;padding:0.55rem 0.85rem;border-radius:9px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:0.85rem;font-family:'Space Mono',monospace;outline:none;transition:border-color .14s;"
                oninput="onNewWalletInput(this.value)" />
              <div class="wallet-check-hint" id="walletCheckHint">ໃສ່ address wallet ໃໝ່</div>
            </div>

            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              <button class="btn-profile primary" onclick="checkNewWallet()" id="btnCheckWallet">
                <i class="fas fa-search"></i> ກວດສອບ Wallet
              </button>
              <button class="btn-profile" onclick="confirmChangeWallet()" id="btnConfirmChange" disabled>
                <i class="fas fa-exchange-alt"></i> ຢືນຢັນການປ່ຽນ
              </button>
            </div>
            <div id="profileStatus"></div>
          </div>

          <!-- Admin Recovery -->
          <div class="profile-card" id="adminRecoverCard">
            <div class="profile-card-title" style="display:flex;align-items:center;justify-content:space-between;">
              <span>ຂໍຄືນ NFT ຈາກ Wallet ທີ່ສູນຫາຍ</span>
              <span style="background:rgba(124,58,237,.12);color:#c4b5fd;border:1px solid rgba(124,58,237,.28);border-radius:99px;padding:2px 9px;font-size:0.7rem;font-weight:700;" id="recoverFeeTag">—</span>
            </div>
            <p style="font-size:0.82rem;color:var(--muted);margin-bottom:0.7rem;line-height:1.65;">
              ສຳລັບ wallet ທີ່<strong style="color:var(--warning);"> ເຂົ້າບໍ່ໄດ້ / ຈື່ private key ບໍ່ໄດ້</strong><br>
              ລະບົບ verify email ແລ້ວດຳເນີນການ — <strong style="color:var(--teal);">ໃສ່ wallet ເກົ່າ</strong>
            </p>

            <div class="pull-input-row" style="margin-bottom:0.7rem;">
              <input type="text" id="recoverWalletInput" placeholder="0x... wallet address ທີ່ຈື່ໄດ້" />
              <button class="btn-profile primary" id="btnCheckRecover" onclick="checkAdminRecover()">
                <i class="fas fa-shield-alt"></i> ກວດສອບ
              </button>
            </div>

            <div id="recoverVerifyResult"></div>

            <div id="recoverNftSection" style="display:none;">
              <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(6,214,160,.06);border:1px solid rgba(6,214,160,.22);border-radius:8px;padding:0.55rem 0.75rem;margin-bottom:0.7rem;font-size:0.8rem;color:var(--teal);">
                <span></span>
                <span>Wallet ນີ້ຢືນຢັນແລ້ວວ່າເປັນຂອງ email: <strong id="recoverVerifiedEmail">—</strong></span>
              </div>

              <div id="recoverNftListWrap"></div>

              <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.14);border-radius:9px;padding:0.6rem 0.85rem;margin-bottom:0.7rem;font-size:0.82rem;">
                <span style="color:var(--muted);">ດຶງໄປທີ່:</span>
                <span style="font-family:'Space Mono',monospace;color:#c4b5fd;" id="recoverTargetWallet">—</span>
                <span style="font-size:0.72rem;color:var(--teal);margin-left:auto;">(wallet ປັດຈຸບັນ)</span>
              </div>

              <div class="fee-summary" style="margin-bottom:0.7rem;">
                <div class="fee-line"><span>ຈຳນວນ NFT</span><strong id="recoverNftCount">—</strong></div>
                <div class="fee-line"><span>ຄ່ານຳໃຊ້ / ໃບ</span><strong id="recoverFeePerNft">ກຳລັງໂຫຼດ...</strong></div>
                <div class="fee-line total"><span>ລວມທັງໝົດ</span><strong id="recoverTotalFee">—</strong></div>
              </div>
              <div style="font-size:0.78rem;color:var(--muted);margin-bottom:0.7rem;">ຈ່າຍຈາກ wallet ປັດຈຸບັນ — Admin ດຳເນີນການ recover NFT ໃຫ້ຫຼັງຈາກຊຳລະ</div>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <button class="btn-profile primary" onclick="executeAdminRecover()" id="btnAdminRecover">
                  <i class="fas fa-magic"></i> ຊຳລະ &amp; ຂໍຄືນ NFT
                </button>
                <button class="btn-profile" onclick="cancelAdminRecover()">ຍົກເລີກ</button>
              </div>
              <div id="recoverStatus" style="display:none;font-size:0.83rem;margin-top:0.7rem;white-space:pre-line;padding:0.55rem 0.85rem;border-radius:9px;"></div>
            </div>
          </div>

          <!-- Migrate NFT -->
          <div class="profile-card" id="migrateNftCard" style="display:none;">
            <div class="profile-card-title">ຍ້າຍ NFT ໄປ Wallet ໃໝ່</div>

            <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(124,58,237,.05);border:1px solid rgba(124,58,237,.14);border-radius:11px;padding:0.7rem 0.95rem;margin-bottom:0.7rem;flex-wrap:wrap;">
              <div style="display:flex;flex-direction:column;gap:1px;">
                <span style="font-size:0.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">ຈາກ</span>
                <span style="font-family:'Space Mono',monospace;font-size:0.78rem;color:var(--warning);" id="oldWalletDisplay">—</span>
              </div>
              <span style="color:var(--muted);font-size:1.2rem;margin:0 0.2rem;">→</span>
              <div style="display:flex;flex-direction:column;gap:1px;">
                <span style="font-size:0.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">ໄປ</span>
                <span style="font-family:'Space Mono',monospace;font-size:0.78rem;color:var(--teal);" id="newWalletDisplay">—</span>
              </div>
            </div>

            <div style="display:flex;align-items:flex-start;gap:0.5rem;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.22);border-radius:8px;padding:0.55rem 0.75rem;margin-bottom:0.7rem;font-size:0.8rem;color:rgba(245,158,11,.9);">
              <span style="flex-shrink:0;margin-top:1px;"></span>
              <span>MetaMask ຕ້ອງ switch ໄປ <strong style="font-family:'Space Mono',monospace;" id="oldWalletReminder">wallet ເກົ່າ</strong> ກ່ອນກົດ Migrate</span>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem;">
              <span style="font-size:0.8rem;color:var(--muted);">ເລືອກ NFT ທີ່ຕ້ອງການຍ້າຍ</span>
              <div style="display:flex;gap:0.4rem;">
                <button class="btn-profile" style="padding:0.22rem 0.65rem;font-size:0.75rem;" onclick="selectAllNft()">ທັງໝົດ</button>
                <button class="btn-profile" style="padding:0.22rem 0.65rem;font-size:0.75rem;" onclick="deselectAllNft()">ລ້າງ</button>
              </div>
            </div>

            <div class="nft-select-grid" id="nftSelectGrid"></div>

            <div class="fee-summary" id="feeSummary">
              <div class="fee-line"><span>ຈຳນວນ NFT ທີ່ເລືອກ</span><strong id="selectedNftCount">0 ໃບ</strong></div>
              <div class="fee-line"><span>ຄ່ານຳໃຊ້ / ໃບ</span><strong id="feePerNftDisplay">ກຳລັງໂຫຼດ...</strong></div>
              <div class="fee-line total"><span>ລວມທັງໝົດ</span><strong id="totalMigrateFee">—</strong></div>
            </div>

            <div style="display:flex;gap:0.5rem;margin-top:0.9rem;flex-wrap:wrap;">
              <button class="btn-profile primary" onclick="executeMigrate()" id="btnMigrate" disabled>
                <i class="fas fa-arrow-right"></i> Migrate NFT
              </button>
              <button class="btn-profile" onclick="skipMigrate()">ຂ້າມ (ຍ້າຍທີຫຼັງ)</button>
            </div>

            <div id="migrateStatus" style="font-size:0.83rem;margin-top:0.7rem;display:none;white-space:pre-line;"></div>
          </div>

        </div>
      </div>

      <!-- ===== TAB: SEARCH OTHER WALLET ===== -->
      <div id="tabSearch" class="section" style="display:none;">
        <div class="section-title">ຄົ້ນຫາ NFT ຂອງຄົນອື່ນ</div>
        <div class="section-sub">ໃສ່ wallet address ເພື່ອເບິ່ງ NFT Gallery ຂອງ wallet ນັ້ນ</div>

        <div style="max-width:620px; margin-left: auto; margin-right: auto;">
          <div class="profile-card">
            <div class="profile-card-title">Wallet Address</div>
            <div class="pull-input-row" style="margin-bottom:0.3rem;">
              <input type="text" id="searchWalletInput" placeholder="0x... wallet address ທີ່ຕ້ອງການຄົ້ນຫາ"
                onkeydown="if(event.key==='Enter')searchOtherWallet();" />
              <button class="btn-profile primary" id="btnSearchWallet" onclick="searchOtherWallet()">
                <i class="fas fa-search"></i> ຄົ້ນຫາ
              </button>
            </div>
          </div>

          <div class="profile-card" id="searchResultCard" style="display:none;">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
              <div class="profile-avatar">🦊</div>
              <div style="flex:1;min-width:0;">
                <div class="profile-addr" id="searchUserName">—</div>
                <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
                  <span class="verified-badge no" id="searchUserStatus">—</span>
                </div>
              </div>
            </div>
            <hr class="profile-divider">
            <div class="profile-stat-row">
              <span>NFT ໃນ wallet ນີ້</span>
              <strong id="searchNftCount">—</strong>
            </div>
          </div>
        </div>

        <div id="searchStatus"></div>
        <div id="searchBadgeGrid" class="badge-grid"></div>
      </div>

    </div><!-- /appSection -->

    <!-- ===== BADGE MODAL ===== -->
    <div id="modal" onclick="closeModal(event)">
      <div class="modal-inner">
        <div class="modal-img" id="modalImgWrap"></div>
        <div class="modal-body">
          <div class="modal-badge-name" id="modalName"></div>
          <div class="modal-activity" id="modalActivity"></div>
          <div id="modalSender" style="display:none;font-size:0.78rem;color:rgba(0,170,255,.7);margin-top:-0.5rem;margin-bottom:0.75rem;"></div>
          <div class="modal-verify">
            <h4>VERIFICATION</h4>
            <div class="modal-verify-row">
              <span class="vkey">ວັນທີ່ໄດ້ຮັບ</span>
              <span id="modalIssuedAt">—</span>
            </div>
            <div class="modal-verify-row">
              <span class="vkey">Token ID</span>
              <span id="modalTokenId">—</span>
            </div>
            <div class="modal-verify-row">
              <span class="vkey">Contract Address</span>
              <a id="modalEtherscan" href="#" target="_blank" rel="noopener noreferrer">—</a>
            </div>
            <div class="modal-verify-row">
              <span class="vkey">Network</span>
              <span id="modalVerified">—</span>
            </div>
            <div class="modal-verify-row">
              <span class="vkey">ອອກໂດຍ</span>
              <span id="modalIssuedBy">—</span>
            </div>
            <div class="modal-verify-row">
              <span class="vkey">ສະຖານະ</span>
              <span id="modalTrans">—</span>
            </div>
          </div>
          <div id="modalTransferSection"></div>
          <button class="modal-close" onclick="document.getElementById('modal').classList.remove('open')"> &nbsp;ປິດ</button>
        </div>
      </div>
    </div>

    <div class="toast" id="toast"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
    <script src="../config/contract.config.js"></script>
    <script src="../script/index_LABChain.js"></script>
  </div>
</body>
</html>
