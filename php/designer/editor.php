<!DOCTYPE html>
<html lang="lo">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ອອກແບບໃບຢັ້ງຢືນ - NFT LAO</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!--
  Five families are loaded on purpose. Only three are used for the interface chrome
  (see css/tokens.css: --font-lao, --font-display, --font-mono). The other two,
  Outfit and Noto Serif Lao, are offered in DESIGNER_CONFIG.fontOptions so the
  canvas can actually render the typeface the user picks. Dropping them would
  silently fall back and misrepresent the certificate.
-->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;700&family=Noto+Serif+Lao:wght@400;700&family=Outfit:wght@400;700&family=Space+Mono:wght@400;700&family=Syne:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="editor.css">
</head>
<body>
<div id="app">
  <header id="topbar">
    <div class="topbar-left">
      <button class="tb-btn drawer-toggle" id="drawerLeftBtn" onclick="toggleDrawer('left')" aria-label="ເປີດເຄື່ອງມື" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      </button>
      <span class="logo">NFT LAO</span>
      <span class="page-title">ອອກແບບໃບຢັ້ງຢືນ</span>
    </div>

    <div class="topbar-center">
      <div class="tool-cluster">
        <button class="tb-btn" onclick="undo()" title="ກັບຄືນ (Ctrl+Z)" aria-label="ກັບຄືນ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13a4 4 0 0 1 0 8H7"/><path d="M3 10l4-4M3 10l4 4"/></svg>
        </button>
        <button class="tb-btn" onclick="redo()" title="ໄປໜ້າ (Ctrl+Shift+Z)" aria-label="ໄປໜ້າ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H8a4 4 0 0 0 0 8h9"/><path d="M21 10l-4-4M21 10l-4 4"/></svg>
        </button>
      </div>

      <span class="divider"></span>

      <div class="tool-cluster" role="group" aria-label="ຈັດຕຳແຫນ່ງອົງປະກອບ">
        <button class="tb-btn" onclick="alignObjects('left')" title="ຈັດຊ້າຍ" aria-label="ຈັດຊ້າຍ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="3" x2="3" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="6" y="14" width="8" height="4" rx="1"/></svg>
        </button>
        <button class="tb-btn" onclick="alignObjects('center')" title="ຈັດກາງແນວນ" aria-label="ຈັດກາງແນວນ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="3" x2="12" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="8" y="14" width="8" height="4" rx="1"/></svg>
        </button>
        <button class="tb-btn" onclick="alignObjects('right')" title="ຈັດຂ້າງ" aria-label="ຈັດຂ້າງ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="3" x2="21" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="10" y="14" width="8" height="4" rx="1"/></svg>
        </button>
        <span class="divider"></span>
        <button class="tb-btn" onclick="alignObjects('top')" title="ຈັດເທິງ" aria-label="ຈັດເທິງ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="3" x2="21" y2="3"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="6" width="4" height="8" rx="1"/></svg>
        </button>
        <button class="tb-btn" onclick="alignObjects('middle')" title="ຈັດກາງແນວນຕັ້ງ" aria-label="ຈັດກາງແນວນຕັ້ງ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="8" width="4" height="8" rx="1"/></svg>
        </button>
        <button class="tb-btn" onclick="alignObjects('bottom')" title="ຈັດລຸ່ມ" aria-label="ຈັດລຸ່ມ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="21" x2="21" y2="21"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="10" width="4" height="8" rx="1"/></svg>
        </button>
      </div>

      <span class="divider"></span>

      <div class="tool-cluster" role="group" aria-label="ຈັດກຸດແລະລຳດັບ">
        <button class="tb-btn" onclick="groupSelected()" title="ຈັບກຸດ (Ctrl+G)" aria-label="ຈັບກຸດ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2.5"/><rect x="6.5" y="6.5" width="5" height="5" rx="1"/><rect x="12.5" y="12.5" width="5" height="5" rx="1"/></svg>
        </button>
        <button class="tb-btn" onclick="ungroupSelected()" title="ແຍແບງກຸດ (Ctrl+Shift+G)" aria-label="ແຍແບງກຸດ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="8" height="8" rx="1"/><rect x="13.5" y="13.5" width="8" height="8" rx="1"/><path d="M10.5 6.5h3a2 2 0 012 2v3"/></svg>
        </button>
        <span class="divider"></span>
        <button class="tb-btn" onclick="bringForward()" title="ນຳຂຶ້ນໜ້າ" aria-label="ນຳຂຶ້ນໜ້າ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 14 12 8 18 14"/><line x1="12" y1="8" x2="12" y2="19"/></svg>
        </button>
        <button class="tb-btn" onclick="sendBackward()" title="ສົ່ງຫຼັງ" aria-label="ສົ່ງຫຼັງ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 10 12 16 18 10"/><line x1="12" y1="5" x2="12" y2="16"/></svg>
        </button>
      </div>

      <span class="divider"></span>

      <div class="tool-cluster" role="group" aria-label="ຂະຫຍາຍ">
        <button class="tb-btn" onclick="zoomOut()" title="ຂະຫຍາຍອອກ" aria-label="ຂະຫຍາຍອອກ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <span id="zoomLabel" class="zoom-label">100%</span>
        <button class="tb-btn" onclick="zoomIn()" title="ຂະຫຍາຍເຂົ້າ" aria-label="ຂະຫຍາຍເຂົ້າ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>
        </button>
      </div>
    </div>

    <div class="topbar-right">
      <button class="tb-btn" id="snapBtn" onclick="toggleSnap()" aria-pressed="false" title="ຕິດເຂັຍ" aria-label="ຕິດເຂັຍ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
      </button>
      <button class="tb-btn" onclick="showPreview()" title="ເບິ່ງຕົວຢ່າງ (Esc)" aria-label="ເບິ່ງຕົວຢ່າງ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>

      <span class="divider"></span>

      <button class="tb-btn action" onclick="saveDesign()" title="ບັນທຶກງານອອກແບບ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span>ບັນທຶກ</span>
      </button>
      <button class="tb-btn action" onclick="loadDesign()" title="ເປີດງານທີ່ບັນທຶກໄວ້">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"/><path d="M3 10h18l-2 8a2 2 0 0 1-2 1H5a2 2 0 0 1-2-1z"/></svg>
        <span>ເປີດ</span>
      </button>
      <button class="tb-btn action" onclick="exportPNG()" title="ດາວໂຫຼດເປັນ PNG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>PNG</span>
      </button>

      <button class="tb-btn primary" onclick="uploadToIPFS()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.4 17.5A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 3 16.4"/><polyline points="8 17 12 13 16 17"/><line x1="12" y1="13" x2="12" y2="22"/></svg>
        <span>ອັບໂຫຼດ IPFS</span>
      </button>

      <button class="tb-btn drawer-toggle" id="drawerRightBtn" onclick="toggleDrawer('right')" aria-label="ເປີດຄຸນສົມບັດ" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
      </button>
    </div>
  </header>

  <div id="main">
    <aside id="sidebar-left" aria-label="ເຄື່ອງມື">
      <div class="panel-section">
        <h2 class="panel-title">ເຄື່ອງມື</h2>
        <div class="tool-group" role="group" aria-label="ເຄື່ອງມື">
          <button class="tool-btn active" data-tool="select" onclick="setTool('select')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
            <span>ເລືອກ</span>
          </button>
          <button class="tool-btn" data-tool="text" onclick="addText()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            <span>ຂໍ້ຄວາມ</span>
          </button>
          <button class="tool-btn" data-tool="image" onclick="document.getElementById('bgUpload').click()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span>ຮູບພື້ນ</span>
          </button>
          <button class="tool-btn" data-tool="shape" onclick="addRect()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            <span>ສີ່ຫຼ່ຽມ</span>
          </button>
          <button class="tool-btn" data-tool="line" onclick="addLine()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="20" x2="21" y2="4"/></svg>
            <span>ເສັ້ນ</span>
          </button>
          <button class="tool-btn" data-tool="circle" onclick="addCircle()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
            <span>ວົງກົມ</span>
          </button>
          <button class="tool-btn" data-tool="triangle" onclick="addTriangle()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,22 2,22"/></svg>
            <span>ສາມແຈ</span>
          </button>
          <button class="tool-btn" data-tool="image-element" onclick="document.getElementById('imgUpload').click()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>ຮູບ</span>
          </button>
          <button class="tool-btn" data-tool="draw" onclick="toggleDraw()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            <span>ວາດ</span>
          </button>
        </div>
      </div>

      <div class="panel-section">
        <h2 class="panel-title">ແມ່ແບບ</h2>
        <div class="template-grid" id="templateGrid"></div>
      </div>

      <div class="panel-section">
        <h2 class="panel-title">ຊັ້ນ</h2>
        <div class="layer-list" id="layerList"></div>
      </div>

      <div class="panel-section">
        <h2 class="panel-title">ປະຫວັດການໃຊ້ງານ</h2>
        <div id="historyPanel"></div>
      </div>
    </aside>

    <main id="canvas-area">
      <div id="canvas-wrap">
        <canvas id="canvas"></canvas>
      </div>
    </main>

    <aside id="sidebar-right" aria-label="ຄຸນສົມບັດ">
      <div class="panel-section">
        <h2 class="panel-title">ຄຸນສົມບັດ</h2>
        <div id="props-panel"></div>
      </div>

      <div class="panel-section">
        <h2 class="panel-title">ການຕັ້ງຄ່າ</h2>
        <div id="settings-panel">
          <label class="prop-row" for="canvasW">
            <span>ຄວາມກວ້າງ</span>
            <input type="number" id="canvasW" value="800" min="200" max="2000" onchange="resizeCanvas()">
          </label>
          <label class="prop-row" for="canvasH">
            <span>ຄວາມສູງ</span>
            <input type="number" id="canvasH" value="600" min="200" max="2000" onchange="resizeCanvas()">
          </label>
          <div class="prop-row">
            <span>ສີພື້ນຫຼັງ</span>
            <span class="color-pill" id="bgColorPill" style="background:#1a1a2e" role="button" tabindex="0" aria-label="ເລືອກສີພື້ນຫຼັງ" onclick="this.nextElementSibling.click()" onkeydown="if(event.key==='Enter'||event.key===' '){this.nextElementSibling.click();}"></span>
            <input type="color" value="#1a1a2e" aria-label="ສີພື້ນຫຼັງ" oninput="this.previousElementSibling.style.background=this.value" onchange="this.previousElementSibling.style.background=this.value;setCanvasBg(this.value)" style="position:absolute;width:1px;height:1px;padding:0;border:none;overflow:hidden;clip:rect(0,0,0,0);">
          </div>
          <label class="prop-row" for="snapToggle">
            <span>ຕິດເຂັຍ</span>
            <input type="checkbox" id="snapToggle" onchange="toggleSnap()">
          </label>
        </div>
      </div>
    </aside>
  </div>
</div>

<div class="drawer-scrim" id="drawerScrim" onclick="closeDrawers()"></div>

<div id="ctxMenu" style="display:none">
  <div class="ctx-item" onclick="ctxExec('copy')">ຄັດລອກ <span class="ctx-key">Ctrl+C</span></div>
  <div class="ctx-item" onclick="ctxExec('paste')">ວາງ <span class="ctx-key">Ctrl+V</span></div>
  <div class="ctx-item" onclick="ctxExec('cut')">ຕັດ <span class="ctx-key">Ctrl+X</span></div>
  <div class="ctx-divider"></div>
  <div class="ctx-item" onclick="ctxExec('duplicate')">ສຳເລດ <span class="ctx-key">Ctrl+D</span></div>
  <div class="ctx-item" onclick="ctxExec('delete')">ລຶບ <span class="ctx-key">Del</span></div>
  <div class="ctx-divider"></div>
  <div class="ctx-item" onclick="ctxExec('lock')">ລັອກ / ປົດລັອກ</div>
  <div class="ctx-divider"></div>
  <div class="ctx-item" onclick="ctxExec('bringForward')">ນຳຂຶ້ນໜ້າ</div>
  <div class="ctx-item" onclick="ctxExec('sendBackward')">ສົ່ງຫຼັງ</div>
  <div class="ctx-item" onclick="ctxExec('bringToFront')">ນຳໜ້າສຸດ</div>
  <div class="ctx-item" onclick="ctxExec('sendToBack')">ສົ່ງຫຼັງສຸດ</div>
</div>

<div id="previewOverlay" style="display:none" onclick="closePreview()">
  <img id="previewImg" alt="ຕົວຢ່າງໃບຢັ້ງຢືນ">
</div>

<input type="file" id="bgUpload" accept="image/*" hidden onchange="uploadBg(event)">
<input type="file" id="imgUpload" accept="image/*" hidden onchange="addImageElement(this)">

<div id="drawIndicator" style="display:none">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
  <span>ກຳລັງວາດ &mdash; ກົດປຸ່ມວາດອີກຄັ້ງເພື່ອອອກ</span>
</div>

<div id="ipfsModal" class="modal-overlay" style="display:none">
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="ipfsTitle">
    <h2 class="modal-title is-success" id="ipfsTitle">ອັບໂຫຼດສຳເລັດ</h2>
    <div id="ipfsResult"></div>
    <div id="ipfsActions"></div>
    <button class="modal-close-btn" onclick="document.getElementById('ipfsModal').style.display='none'">ປິດ</button>
  </div>
</div>

<div id="designModal" class="modal-overlay" style="display:none" onclick="closeDesignModal()">
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="designTitle" onclick="event.stopPropagation()">
    <h2 class="modal-title" id="designTitle">ງານທີ່ບັນທຶກໄວ້</h2>
    <div id="designList"></div>
    <button class="modal-close-btn" onclick="closeDesignModal()">ປິດ</button>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<script src="../config/contract.config.js"></script>
<script src="../config/designer.config.js"></script>
<script src="templates.js"></script>
<script src="editor.js"></script>
<script>
// Mobile drawers: the panels leave the flow on narrow screens, so they need a
// way in and out. Escape and the scrim both close.
function toggleDrawer(side) {
  var el = document.getElementById(side === 'left' ? 'sidebar-left' : 'sidebar-right');
  var btn = document.getElementById(side === 'left' ? 'drawerLeftBtn' : 'drawerRightBtn');
  var open = !el.classList.contains('is-open');
  closeDrawers();
  if (open) {
    el.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    document.getElementById('drawerScrim').classList.add('is-open');
  }
}
function closeDrawers() {
  ['sidebar-left', 'sidebar-right'].forEach(function(id) {
    document.getElementById(id).classList.remove('is-open');
  });
  ['drawerLeftBtn', 'drawerRightBtn'].forEach(function(id) {
    document.getElementById(id).setAttribute('aria-expanded', 'false');
  });
  document.getElementById('drawerScrim').classList.remove('is-open');
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeDrawers();
});
window.addEventListener('resize', function() {
  if (window.innerWidth > 900) closeDrawers();
});
</script>
</body>
</html>