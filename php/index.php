<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NFT LAO ຈຳກັດ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&family=Noto+Serif+Lao:wght@700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
  <link rel="stylesheet" href="./css/serve.css" />
  <link rel="stylesheet" href="./css/chatAI.css" />
  <style>
    .sr-only {
      position: absolute; width: 1px; height: 1px;
      padding: 0; margin: -1px; overflow: hidden;
      clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>

<nav>
  <div class="nav-logo">
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
  </div>
  <div class="serve-nav" id="serveNav">
    <div class="text"><a href="./controllers/NFT.php">ເບີ່ງຮູບ NFT</a></div>
    <div class="text"><a href="./support/support.php">Support</a></div>
    <div class="text"><a href="/Document/index.php">ເອກະສານ</a></div>
    <a class="btn-register" href="./controllers/learnnbadge-ui.php">Mint NFT</a>
  </div>
  <button class="nav-hamburger" type="button" onclick="toggleMobileNav()" aria-label="ເປີດເມນູ" aria-expanded="false" aria-controls="serveNav">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="hero">
  <div class="status-chip"><div class="dot"></div> Network Active — Chain ID 5222</div>
  <h1>NFT ໃບຢັ້ງຢືນດິຈິຕອລ</h1>
  <p>ຮັບຮອງຜົນສຳເລັດດ້ວຍເຕັກໂນໂລຊີ Blockchain ທີ່ໜ້າເຊື່ອຖື</p>
  <p>ຖາວອນ · ໂປ່ງໃສ · ບໍ່ສາມາດປ່ຽນແປງໄດ້</p>
  <div class="hero-btns">
    <a href="./controllers/Organization.php" class="btn-primary">ເລີ່ມໃຊ້ງານ</a>
    <a href="#features" class="btn-outline">ຮຽນຮູ້ເພີ່ມເຕີມ</a>
  </div>
</div>

<div class="quick-links-wrap">
  <!-- <p class="quick-links-label">ທາງລັດ</p> -->
  <div class="quick-links">
    <a href="./controllers/NFT.php" class="quick-link-card">
      <div class="ql-icon"><i class="fa-solid fa-images"></i></div>
      <span>ເບິ່ງຮູບ NFT</span>
    </a>
    <a href="./support/support.php" class="quick-link-card">
      <div class="ql-icon"><i class="fa-solid fa-headset"></i></div>
      <span>Support</span>
    </a>
    <a href="/Document/index.php" class="quick-link-card">
      <div class="ql-icon"><i class="fa-solid fa-book-open"></i></div>
      <span>ເອກະສານ</span>
    </a>
  </div>
</div>

<div class="section" id="features">
  <h2 class="section-title">ສິ່ງທີ່ທ່ານໄດ້ຮັບ</h2>
  <div class="lauo">
    <div class="context" data-aos="fade-up" data-aos-delay="0">
      <div class="context-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
          <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Mint ໃບຢັ້ງຢືນ NFT</h2>
      <p>ບັນທຶກຜົນງານລົງ Blockchain — ຖາວອນ, ໂປ່ງໃສ, ບໍ່ສາມາດປ່ຽນແປງໄດ້</p>
    </div>
    <div class="context" data-aos="fade-up" data-aos-delay="80">
      <div class="context-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
          <path d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>ຜູ້ທີ່ເໝາະສົມ</h2>
      <p>ມອບໃບຢັ້ງຢືນ NFT ເພື່ອເກັບໄວ້ເປັນຄວາມຊົງຈຳ ຫຼື ເກັບສະສົມເປັນປະສົບການ</p>
    </div>
    <div class="context" data-aos="fade-up" data-aos-delay="160">
      <div class="context-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
          <path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>ອອກໃບຢັ້ງຢືນໄວ</h2>
      <p>ສ້າງ NFT Badge ພາຍໃນໄລຍະເວລາສອງສາມວິນາທີ — ບໍ່ຕ້ອງລໍຄອຍ</p>
    </div>
    <div class="context" data-aos="fade-up" data-aos-delay="240">
      <div class="context-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
          <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>ສາມາດໂອນ NFT ໃຫ້ຜູ້ໄດ້</h2>
      <p>ສົ່ງ NFT ໃຫ້ຜູ້ຮັບໂດຍກົງຜ່ານ Wallet Address — ໄວ ແລະ ຖືກຕ້ອງ</p>
    </div>
  </div>
</div>

<div class="pricing-section" id="pricing">
  <div class="pricing-header" data-aos="fade-down" data-aos-duration="800">
    <p class="from">ສິດທິພິເສດ</p>
    <p>ຢັ້ງຢືນດ້ວຍ Blockchain</p>
  </div>

  <div class="pricing-cards">
    <div class="pricing-card featured1" data-aos="fade-up" data-aos-delay="0" data-aos-duration="700">
      <div class="plan-name">ບຸກຄົນທົ່ວໄປ</div>
      <!-- <div class="plan-description">ທົດລອງໃຊ້ຟຣີ ສຳລັບລູກຄ້າໃໝ່</div> -->
      <!-- <div class="plan-price">$0<span> / ເດືອນ</span></div> -->
      <ul class="plan-features">
        <li><i class="fas fa-check"></i> ໃຊ້ງານໄດ້ຟຣີ ບໍ່ຈັດ cota Mint</li>
        <li><i class="fas fa-check"></i> ລົງທະບຽນຜ່ານ Blockchain free</li>
        <li><i class="fas fa-check"></i> ຄ່າ Mint 0.50 LAB ຕໍ່ໃບ</li>
        <li><i class="fas fa-check"></i>ເວລາ Mint ໃຫ້ຄົນອື່ນຈະຂື້ນ "ອອກໂດຍ ບຸກຄົນທົ່ວໄປ"</li>
        

      </ul>
      <!-- <a href="#" class="btn-select-plan secondary">ເລືອກແຜນເລີ່ມຕົ້ນ</a> -->
    </div>

    <div class="pricing-card" data-aos="fade-up" data-aos-delay="100" data-aos-duration="700">
      <div class="plan-name">ສາທາບັນ || ອື່ນໆ</div>
      <!-- <div class="plan-description">ເໝາະສຳລັບບຸກຄົນ ແລະ ໂຄງການຂະໜາດນ້ອຍ</div> -->
      <!-- <div class="plan-price">$10<span> / ເດືອນ</span></div> -->
      <ul class="plan-features">
      <li><i class="fas fa-check"></i> ໃຊ້ງານໄດ້ຟຣີ ບໍ່ຈັດ cota Mint</li>
        <li><i class="fas fa-check"></i> ລົງທະບຽນຜ່ານ Blockchain free</li>
        <li><i class="fas fa-check"></i> ຄ່າ Mint 0.10 LAB ຕໍ່ໃບ</li>
        <li><i class="fas fa-check"></i>ເວລາ Mint ໃຫ້ຄົນອື່ນຈະຂື້ນ "ມຊ || ITLAODEV || ອື່ນໆ"</li>
      </ul>
      <!-- <a href="#" class="btn-select-plan secondary">ເລືອກແຜນພື້ນຖານ</a> -->
    </div>
  </div>

  <!-- <div class="comparison-table" data-aos="fade-up" data-aos-duration="800">
    <h2>ການປຽບທຽບລາຍລະອຽດ</h2>
    <div class="section-divider"></div>
    <table>
      <thead>
        <tr>
          <th>ຄຸນສົມບັດ</th>
          <th>ເລີ່ມຕົ້ນ</th>
          <th>ພື້ນຖານ</th>
          <th>ມືອາຊີບ</th>
          <th>ອົງກອນ</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>ລາຄາຕໍ່ໃບ</td><td>$0</td><td>$10</td><td>$15</td><td>$200/ປີ</td></tr>
        <tr>
          <td>ການຢັ້ງຢືນ Blockchain</td>
          <td><i class="fas fa-check"></i></td><td><i class="fas fa-check"></i></td>
          <td><i class="fas fa-check"></i></td><td><i class="fas fa-check"></i></td>
        </tr>
        <tr>
          <td>ການເກັບຂໍ້ມູນ Pinata</td>
          <td><i class="fas fa-check"></i></td><td><i class="fas fa-check"></i></td>
          <td><i class="fas fa-check"></i></td><td><i class="fas fa-check"></i></td>
        </tr>
        <tr>
          <td>ສ້າງຍີ່ຫໍ້ສ່ວນຕົວ</td>
          <td><i class="fas fa-times"></i></td><td><i class="fas fa-times"></i></td>
          <td><i class="fas fa-check"></i></td><td><i class="fas fa-check"></i></td>
        </tr>
        <tr>
          <td>ການສ້າງຈຳນວນຫຼາຍ</td>
          <td><i class="fas fa-times"></i></td><td><i class="fas fa-times"></i></td>
          <td><i class="fas fa-times"></i></td><td><i class="fas fa-check"></i></td>
        </tr>
        <tr><td>ລະດັບການສະໜັບສະໜູນ</td><td>—</td><td>ອີເມວ</td><td>ດ່ວນ</td><td>24/7 ສ່ວນຕົວ</td></tr>
        <tr><td>ໄລຍະເວລາໃຊ້ງານ</td><td>7 ວັນ</td><td>30 ວັນ</td><td>30 ວັນ</td><td>1 ປີ</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="cta-section">
  <div class="cta-box" data-aos="fade-up">
    <div class="cta-lock"></div>
    <h2>ຕ້ອງ<span>ລົງທະບຽນ</span>ກ່ອນໃຊ້ງານ</h2>
    <p>ເພື່ອຄວາມປອດໄພຂອງຂໍ້ມູນ ແລະ ສິດທິ໌ໃນການ Mint ໃບຢັ້ງຢືນ ກະລຸນາສ້າງບັນຊີກ່ອນ — ໃຊ້ເວລາພຽງ 1 ນາທີ</p>
    <div class="cta-btns">
      <a href="/register.html" class="btn-primary">ລົງທະບຽນດຽວນີ້ — ຟຣີ</a>
      <a href="/login.html" class="btn-outline">ເຂົ້າສູ່ລະບົບ</a>
    </div>
    <p class="cta-note">ມີບັນຊີຢູ່ແລ້ວ? <a href="/login.html">ເຂົ້າສູ່ລະບົບທີ່ນີ້</a></p>
    <div class="perks">
      <div class="perk"><span class="tick"></span> ລົງທະບຽນຟຣີ</div>
      <div class="perk"><span class="tick"></span> ປອດໄພດ້ວຍ JWT</div>
      <div class="perk"><span class="tick"></span> ຮອງຮັບ MetaMask</div>
      <div class="perk"><span class="tick"></span> ໃຊ້ງານໄດ້ທັນທີ</div>
    </div>
  </div>
</div> -->

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
    <a href="/login.php">ເຂົ້າສູ່ລະບົບ</a>
  </div>
  <p> 2025 NFT LAO ຈຳກັດ</p>
</footer>

<button class="chat-toggle" type="button" onclick="toggleChat()" aria-label="ເປີດແຊດ AI Support">
    <span aria-hidden="true">💬</span>
    <div class="badge" aria-hidden="true">1</div>
</button>
<div class="chat-box" id="chatBox">
    <div class="chat-header">
        <div class="header-left">

            <div class="avatar">
                🤖
            </div>

            <div class="header-info">

                <h2>AI Support</h2>

                <div class="status">
                  🟢 Online
                </div>

            </div>

        </div>

        <button class="close-btn" type="button" onclick="toggleChat()" aria-label="ປິດແຊດ">
            <span aria-hidden="true">×</span>
        </button>

    </div>

    <div class="messages" id="messages">

        <div class="message bot">

             ສະບາຍດິ ມີຫຍັງໃຫ້ຂ້ອຍຊ່ວຍບໍ?

            <div class="time">
                ມື້ນີ້
            </div>

        </div>

    </div>


    <div class="chat-input">
        <label for="message" class="sr-only">ພິມພ໌ຂໍ້ຄວາມ</label>
        <input
            type="text"
            id="message"
            placeholder="ພິມພ໌ຂໍ້ຄວາມ..."
            onkeypress="handleEnter(event)"
            class="message-box"
        />
        <button class="send-btn" type="button" onclick="sendMessage()" aria-label="ສົ່ງຂໍ້ຄວາມ">
            <span aria-hidden="true">➤</span>
        </button>
    </div>

</div>


<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
<script src="./script/chatAI/chatAI.js"></script>
<script>
  AOS.init({ once: true, easing: 'ease-out-cubic', offset: 60 });
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