<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Profile & Support — NFT LAO</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&family=Noto+Serif+Lao:wght@700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="../css/support.css" />
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>


<nav>
  <a class="nav-logo" href="../index.php">
    <div class="dots">
      <svg viewBox="0 0 28 28" fill="none">
        <circle cx="6"  cy="6"  r="3" fill="#00aaff"/>
        <circle cx="14" cy="6"  r="3" fill="#00aaff" opacity=".6"/>
        <circle cx="22" cy="6"  r="3" fill="#00aaff" opacity=".3"/>
        <circle cx="6"  cy="14" r="3" fill="#00aaff" opacity=".6"/>
        <circle cx="14" cy="14" r="4" fill="#00aaff"/>
        <circle cx="22" cy="14" r="3" fill="#00aaff" opacity=".6"/>
        <circle cx="6"  cy="22" r="3" fill="#00aaff" opacity=".3"/>
        <circle cx="14" cy="22" r="3" fill="#00aaff" opacity=".6"/>
        <circle cx="22" cy="22" r="3" fill="#00aaff"/>
      </svg>
    </div>
    <span><span class="lab">NFT LAO</span> ຈຳກັດ</span>
  </a>
  <div class="serve-nav" id="serveNav">
    <div class="text"><a href="../controllers/NFT.php">ເບີ່ງຮູບ NFT</a></div>
    <div class="text"><a href="./support.php" class="active">Support</a></div>
    <a class="btn-nav" href="../controllers/learnnbadge-ui.php">Mint NFT</a>
  </div>
  <button class="nav-hamburger" type="button" onclick="toggleMobileNav()" aria-label="ເປີດເມນູ" aria-expanded="false" aria-controls="serveNav">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="page-wrap">


  <div class="profile-hero">
    <div class="hero-banner"></div>
    <div class="hero-body">
      <div class="hero-avatar">
        <img src="./imgs/Artificial.png" alt="avatar">
      </div>
      <h2 class="hero-name">Chindavan</h2>
      <span class="badge-tag green" id="badgeStatus">
        <i class="fas fa-circle" style="font-size:7px;margin-right:5px;"></i>Offline
      </span>
      <div class="hero-actions">
        <a href="../controllers/NFT.php" class="ha-btn outline">
          <i class="fas fa-images"></i> ເບິ່ງ NFT
        </a>
        <a href="../controllers/learnnbadge-ui.php" class="ha-btn primary">
          <i class="fas fa-plus"></i> Mint NFT
        </a>
      </div>
    </div>
  </div>


    <div class="ticket-wrap">
    <div class="ticket-header">
      <div class="icon"><i class="fas fa-headset"></i></div>
      <div>
        <div class="ticket-title">ສົ່ງ Support Ticket</div>
        <div class="ticket-sub">ທີມງານຈະຕອບກັບພາຍໃນ 24 ຊົ່ວໂມງ</div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>ຊື່ຂອງທ່ານ</label>
        <input type="text" id="ticketName" placeholder="ຊື່ ແລະ ນາມສະກຸນ" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="ticketEmail" placeholder="example@email.com" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>ປະເພດບັນຫາ</label>
        <select id="ticketType">
          <option value="">— ເລືອກປະເພດ —</option>
          <option value="wallet">Wallet / MetaMask</option>
          <option value="mint">ການ Mint NFT</option>
          <option value="transfer">ການໂອນ NFT</option>
          <option value="contract">Contract Address</option>
          <option value="account">ບັນຊີ / ລະຫັດ</option>
          <option value="other">ອື່ນໆ</option>
        </select>
      </div>
      <div class="form-group">
        <label>Wallet Address (ຖ້າມີ)</label>
        <input type="text" id="ticketWallet" placeholder="0x..." />
      </div>
    </div>

    <div class="form-group">
      <label>ລາຍລະອຽດບັນຫາ</label>
      <textarea id="ticketMsg" rows="4" placeholder="ອະທິບາຍບັນຫາ ຫຼື ຄຳຖາມຂອງທ່ານ..."></textarea>
    </div>

    <button class="btn-submit" id="submitTicket" onclick="submitTicket()">
      <i class="fas fa-paper-plane" style="margin-right:7px;"></i>ສົ່ງ Ticket
    </button>
  </div>


  <div class="main-grid">


    <div class="col-left">

    


      <div class="s-card">
        <div class="s-card-title">
          <div class="icon"><i class="fas fa-bolt"></i></div>
          Quick Links
        </div>
        <a class="qlink" href="../controllers/NFT.php">
          <span class="qlink-icon"><i class="fas fa-images"></i></span>
          <span class="qlink-text">NFT Gallery</span>
          <i class="fas fa-chevron-right qlink-arrow"></i>
        </a>
        <a class="qlink" href="../controllers/learnnbadge-ui.php">
          <span class="qlink-icon"><i class="fas fa-certificate"></i></span>
          <span class="qlink-text">Mint NFT</span>
          <i class="fas fa-chevron-right qlink-arrow"></i>
        </a>
        <a class="qlink" href="../index.php">
          <span class="qlink-icon"><i class="fas fa-house"></i></span>
          <span class="qlink-text">ໜ້າຫຼັກ</span>
          <i class="fas fa-chevron-right qlink-arrow"></i>
        </a>
        <!-- <a class="qlink danger" href="../controllers/logout.php">
          <span class="qlink-icon"><i class="fas fa-right-from-bracket"></i></span>
          <span class="qlink-text">ອອກຈາກລະບົບ</span>
          <i class="fas fa-chevron-right qlink-arrow"></i>
        </a> -->
      </div>


      <div class="s-card" style="margin-top:1.25rem;">
        <div class="s-card-title">
          <div class="icon"><i class="fas fa-satellite-dish"></i></div>
          ຊ່ອງທາງຕິດຕໍ່
        </div>
        <a class="channel-row" href="mailto:support@nftlao.com">
          <div class="ch-dot email"></div>
          <div class="ch-info">
            <div class="ch-name">Email</div>
            <div class="ch-desc">support@nftlao.com</div>
          </div>
          <i class="fas fa-arrow-up-right-from-square ch-ext"></i>
        </a>
        <a class="channel-row" href="#" target="_blank">
          <div class="ch-dot telegram"></div>
          <div class="ch-info">
            <div class="ch-name">Telegram</div>
            <div class="ch-desc">@nftlao_support</div>
          </div>
          <i class="fas fa-arrow-up-right-from-square ch-ext"></i>
        </a>
        <a class="channel-row" href="#" target="_blank">
          <div class="ch-dot discord"></div>
          <div class="ch-info">
            <div class="ch-name">Discord</div>
            <div class="ch-desc">NFT LAO Community</div>
          </div>
          <i class="fas fa-arrow-up-right-from-square ch-ext"></i>
        </a>
      </div>

    </div>


    <div class="col-right">
      <div class="s-card" style="height:100%;">
        <div class="s-card-title">
          <div class="icon"><i class="fas fa-circle-question"></i></div>
          ຄຳຖາມທີ່ພົບຫຼາຍທີ່ສຸດ
        </div>

        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-q">
            ວິທີ Mint NFT ໃຫ້ຜູ້ອື່ນ?
            <span class="faq-arrow"><i class="fas fa-chevron-down"></i></span>
          </div>
          <div class="faq-a">ໄປທີ່ໜ້າ "Mint NFT" ແລ້ວເຊື່ອມຕໍ່ MetaMask ຂອງທ່ານ. ໃສ່ Address ຜູ້ຮັບ ແລະ ຂໍ້ມູນ NFT ຄ່າ Mint ຈະຖືກຫັກຈາກ Wallet ຂອງທ່ານໂດຍອັດຕະໂນມັດ.</div>
        </div>

        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-q">
            ລືມ Private Key / Seed Phrase ຕ້ອງເຮັດແນວໃດ
            <span class="faq-arrow"><i class="fas fa-chevron-down"></i></span>
          </div>
          <div class="faq-a">ຖ້າລືມ Seed Phrase ໃຫ້ຕິດຕໍ່ທີມງານ NFT LAO ຜ່ານ Email ຫຼື Telegram ເພື່ອຊ່ວຍຈັດການ NFT ຂອງທ່ານໂດຍກົງຜ່ານລະບົບ.</div>
        </div>

        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-q">
            ຄ່າ Mint NFT ເທົ່າໃດ?
            <span class="faq-arrow"><i class="fas fa-chevron-down"></i></span>
          </div>
          <div class="faq-a">ບຸກຄົນທົ່ວໄປ = <strong>0.50 LAB</strong> ຕໍ່ໃບ · ສາທາລະນະ / ອົງກອນ = <strong>0.10 LAB</strong> ຕໍ່ໃບ. LAB Token ໃຊ້ເປັນ Gas Fee ໃນ LABChain (Chain ID 5222).</div>
        </div>

        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-q">
            ວິທີ Deploy Contract ສ່ວນຕົວ?
            <span class="faq-arrow"><i class="fas fa-chevron-down"></i></span>
          </div>
          <div class="faq-a">ສຳລັບອົງກອນທີ່ຕ້ອງການ Contract ຂອງຕົນເອງ ຕິດຕໍ່ທີມງານ NFT LAO ຜ່ານ Email ຫຼື Telegram ເພື່ອຂໍ Deploy Contract ສ່ວນຕົວ.</div>
        </div>

        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-q">
            NFT ທີ່ Mint ແລ້ວສາມາດໂອນໃຫ້ຄົນອື່ນໄດ້ບໍ?
            <span class="faq-arrow"><i class="fas fa-chevron-down"></i></span>
          </div>
          <div class="faq-a">ໄດ້ ຖ້າ Contract ຮອງຮັບ Transfer. ໃຊ້ MetaMask ຫຼື NFT Gallery ຂອງ NFT LAO. ບາງ NFT ອາດຖືກ Lock ການໂອນໂດຍ Contract ຂຶ້ນຢູ່ກັບການຕັ້ງຄ່າຂອງຜູ້ Mint.</div>
        </div>

      </div>
    </div>

  </div>




</div>


<footer>
  <div class="footer-logo">
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
      <circle cx="6" cy="6" r="3" fill="#00aaff"/>
      <circle cx="14" cy="14" r="4" fill="#00aaff"/>
      <circle cx="22" cy="22" r="3" fill="#00aaff"/>
    </svg>
    <span><span class="lab">NFT LAO</span> ຈຳກັດ</span>
  </div>
  <div class="chain-badge">Chain ID <span>5222</span> · EVM Compatible</div>
  <div class="footer-links">
    <a href="#">ນະໂຍບາຍ</a>
    <a href="#">ຕິດຕໍ່</a>
    <a href="../controllers/login.php">ເຂົ້າສູ່ລະບົບ</a>
  </div>
  <p>2025 NFT LAO ຈຳກັດ</p>
</footer>

<div class="toast" id="toast"></div>

<script>
  function toggleFaq(el) {
    const wasOpen = el.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) el.classList.add('open');
  }

  function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (isError ? ' error' : '');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  async function submitTicket() {
    const name   = document.getElementById('ticketName').value.trim();
    const email  = document.getElementById('ticketEmail').value.trim();
    const type   = document.getElementById('ticketType').value;
    const msg    = document.getElementById('ticketMsg').value.trim();
    const wallet = document.getElementById('ticketWallet').value.trim();

    if (!name || !email || !type || !msg) {
      showToast('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບ', true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Email ບໍ່ຖືກຕ້ອງ', true);
      return;
    }

    const btn = document.getElementById('submitTicket');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:7px;"></i>ກຳລັງສົ່ງ...';

    try {
      const res  = await fetch('./send_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, msg, wallet })
      });
      const data = await res.json();

      if (data.ok) {
        showToast('ສົ່ງ Ticket ສຳເລັດ ກວດເບິ່ງ Inbox ຂອງທ່ານ');
        ['ticketName','ticketEmail','ticketType','ticketMsg','ticketWallet'].forEach(id =>
          document.getElementById(id).value = ''
        );
      } else {
        showToast(data.msg || 'ເກີດຂໍ້ຜິດພາດ', true);
      }
    } catch (e) {
      showToast('ບໍ່ສາມາດເຊື່ອມຕໍ່ Server ໄດ້', true);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:7px;"></i>ສົ່ງ Ticket';
  }
  function toggleMobileNav() {
    var nav = document.getElementById('serveNav');
    var btn = document.querySelector('.nav-hamburger');
    var open = nav.classList.toggle('mobile-open');
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'ປິດເມນູ' : 'ເປີດເມນູ');
  }
</script>
</body>
</html>
