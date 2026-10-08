<?php include '../includes/header.php'; ?>

<main>

  <div class="page-hero">
    <p class="eyebrow"><i class="fa-solid fa-envelope"></i> &nbsp;Contact</p>
    <h1>ຕິດຕໍ່ພວກເຮົາ</h1>
    <p>ມີຄຳຖາມ ຫຼື ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ? ທີມງານຂອງພວກເຮົາພ້ອມຊ່ວຍທ່ານ.</p>
  </div>

  <hr class="divider">

  <div class="callout callout-info" style="margin-bottom:28px;">
    <i class="fa-solid fa-headset"></i>
    <div>ສຳລັບ Technical Support ແນະນຳໃຫ້ໃຊ້ <a href="/support/support.php" style="color:#00aaff;">Support Ticket System</a> ເພື່ອໃຫ້ທີມງານ Track ໄດ້ດີຂຶ້ນ.</div>
  </div>

  <p class="section-title"><i class="fa-solid fa-paper-plane"></i> ສົ່ງຂໍ້ຄວາມ</p>
  <form class="contact-form" action="/Document/includes/contact_handler.php" method="POST">
    <div class="form-group">
      <label for="name">ຊື່</label>
      <input type="text" id="name" name="name" placeholder="ຊື່ຂອງທ່ານ" required>
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="email@example.com" required>
    </div>
    <div class="form-group">
      <label for="message">ຂໍ້ຄວາມ</label>
      <textarea id="message" name="message" placeholder="ລາຍລະອຽດ..." required></textarea>
    </div>
    <button type="submit" class="btn-primary">
      <i class="fa-solid fa-paper-plane"></i> ສົ່ງຂໍ້ຄວາມ
    </button>
  </form>

</main>

<?php include '../includes/footer.php'; ?>
