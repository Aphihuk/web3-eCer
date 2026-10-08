var canvas, selObj = null;
var undoStack = [], undoIdx = -1;
var templateStates = {}, currentTemplateId = null;
var clipboard = null;
var lastDesignName = null;
var _layerVersion = 0;
const MAX_HISTORY = 40;

// Shared inline icons. One stroke vocabulary (24x24, stroke-width 2, currentColor)
// so toolbar, inspector and layers read as the same set.
const SAVE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';

const TRASH_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

const ALIGN_ICONS = {
  left:   '<line x1="3" y1="3" x2="3" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="6" y="14" width="8" height="4" rx="1"/>',
  center: '<line x1="12" y1="3" x2="12" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="8" y="14" width="8" height="4" rx="1"/>',
  right:  '<line x1="21" y1="3" x2="21" y2="21"/><rect x="6" y="6" width="12" height="4" rx="1"/><rect x="10" y="14" width="8" height="4" rx="1"/>',
  top:    '<line x1="3" y1="3" x2="21" y2="3"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="6" width="4" height="8" rx="1"/>',
  middle: '<line x1="3" y1="12" x2="21" y2="12"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="8" width="4" height="8" rx="1"/>',
  bottom: '<line x1="3" y1="21" x2="21" y2="21"/><rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="10" width="4" height="8" rx="1"/>'
};

const ALIGN_LABELS = {
  left: 'ຈັດຊ້າຍ', center: 'ຈັດກາງແນວນ', right: 'ຈັດຂ້າງ',
  top: 'ຈັດເທິງ', middle: 'ຈັດກາງແນວນຕັ້ງ', bottom: 'ຈັດລຸ່ມ'
};

const EYE_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';

const EYE_OFF_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

const LOCK_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

const UNLOCK_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';

function layerTypeIcon(type) {
  var shapes = {
    'textbox': '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    'i-text':  '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    'rect':    '<rect x="3" y="5" width="18" height="14" rx="1"/>',
    'line':    '<line x1="4" y1="20" x2="20" y2="4"/>',
    'circle':  '<circle cx="12" cy="12" r="8"/>',
    'triangle':'<polygon points="12,3 21,19 3,19"/>',
    'image':   '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'
  };
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    (shapes[type] || '<rect x="4" y="4" width="16" height="16" rx="2"/>') + '</svg>';
}

function alignBtn(action) {
  return '<button class="tb-btn" onclick="alignObjects(\'' + action + '\')" title="' + ALIGN_LABELS[action] +
    '" aria-label="' + ALIGN_LABELS[action] + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2">' + ALIGN_ICONS[action] + '</svg></button>';
}

function distributeBtn(axis) {
  var horizontal = axis === 'h';
  var icon = horizontal
    ? '<line x1="3" y1="12" x2="21" y2="12"/><polyline points="7 8 3 12 7 16"/><polyline points="17 8 21 12 17 16"/>'
    : '<line x1="12" y1="3" x2="12" y2="21"/><polyline points="8 7 12 3 16 7"/><polyline points="8 17 12 21 16 17"/>';
  var label = horizontal ? 'ຈັດຈະຍາງແນວນ' : 'ຈັດຈະຍາງຕັ້ງ';
  return '<button class="tb-btn" onclick="distributeObjects(\'' + axis + '\')" title="' + label +
    '" aria-label="' + label + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2">' + icon + '</svg></button>';
}

function init() {
  canvas = new fabric.Canvas('canvas', {
    width: DESIGNER_CONFIG.canvasWidth,
    height: DESIGNER_CONFIG.canvasHeight,
    backgroundColor: '#1a1a2e',
    selection: true,
    defaultCursor: 'default',
  });

  canvas.on('selection:created', onSelect);
  canvas.on('selection:updated', onSelect);
  canvas.on('selection:cleared', function() { selObj = null; renderProps(); renderLayers(); });
  canvas.on('object:modified', saveHistory);
  canvas.on('object:moving', function() {
    var obj = canvas.getActiveObject();
    if (!obj || !selObj) return;
    // Snap to grid
    if (snapEnabled) {
      var grid = 10;
      obj.set({ left: Math.round(obj.left / grid) * grid, top: Math.round(obj.top / grid) * grid });
    }
    var inputs = document.querySelectorAll('#props-panel input[type="number"]');
    if (inputs.length >= 2) {
      inputs[0].value = Math.round(obj.left || 0);
      inputs[1].value = Math.round(obj.top || 0);
    }
  });
  // Context menu on canvas
  var canvasWrap = document.getElementById('canvas-wrap');
  canvasWrap.addEventListener('contextmenu', showContextMenu);
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#ctxMenu')) hideContextMenu();
  });
  // Patch renderProps to style font select
  var _origRenderProps = renderProps;
  renderProps = function() {
    _origRenderProps();
    setTimeout(styleFontSelect, 10);
  };

  document.addEventListener('keydown', function(e) {
    var t = document.activeElement ? document.activeElement.tagName : '';
    var inInput = (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT');

    if (e.key === 'Escape') {
      closeColorPicker();
      if (document.getElementById('previewOverlay').style.display === 'flex') { closePreview(); e.preventDefault(); return; }
      hideContextMenu(); return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
      deleteSelected(); e.preventDefault(); return;
    }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z': e.preventDefault(); if (e.shiftKey) redo(); else undo(); return;
        case 'y': e.preventDefault(); redo(); return;
        case 'c': if (!inInput) { e.preventDefault(); copySelected(); } return;
        case 'x': if (!inInput) { e.preventDefault(); cutSelected(); } return;
        case 'v': if (!inInput) { e.preventDefault(); pasteClipboard(); } return;
        case 'd': if (!inInput) { e.preventDefault(); duplicateSelected(); } return;
        case 'a': if (!inInput) { e.preventDefault(); selectAll(); } return;
        case 'g': if (e.shiftKey) { e.preventDefault(); ungroupSelected(); } else { e.preventDefault(); groupSelected(); } return;
        case 's': e.preventDefault(); saveDesign(); return;
      }
    }
    if (!inInput) {
      var step = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); nudge(0, -step); break;
        case 'ArrowDown': e.preventDefault(); nudge(0, step); break;
        case 'ArrowLeft': e.preventDefault(); nudge(-step, 0); break;
        case 'ArrowRight': e.preventDefault(); nudge(step, 0); break;
      }
    }
  });

  renderTemplates();
  renderLayers();
  if (CERT_TEMPLATES.length) applyTemplate(CERT_TEMPLATES[0].id);
  updateSaveBtn();

  initDragLayer();

  var as = localStorage.getItem('designer-autosave-latest');
  if (as) {
    try {
      var d = JSON.parse(as);
      var elapsed = Date.now() - (d.savedAt || 0);
      if (elapsed > 10000 && elapsed < 86400000 && canvas.getObjects().length === 0) {
        var el = document.createElement('div');
        el.id = 'restoreBanner';
        el.innerHTML = '<span>ພົບງານທີ່ບັນທຶກອັດຕະໂນມັດ</span>' +
          '<button class="tb-btn action" onclick="restoreAutoSave()">ກູ້ຄືນ</button>' +
          '<button class="tb-btn action" onclick="dismissAutoSave()">ຖິ້ມ</button>';
        document.body.appendChild(el);
      }
    } catch(e) {}
  }
}

function restoreAutoSave() {
  try {
    var d = JSON.parse(localStorage.getItem('designer-autosave-latest'));
    if (!d) return;
    canvas.loadFromJSON(d.json, function() {
      canvas.renderAll();
      saveHistory();
      renderLayers();
      selObj = null;
      renderProps();
      lastDesignName = null;
      updateSaveBtn();
    });
  } catch(e) {}
  dismissAutoSave();
}

function dismissAutoSave() {
  var el = document.getElementById('restoreBanner');
  if (el) el.remove();
}

// ── Clipboard & Nudge (Phase 1) ──
function copySelected() {
  var obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone(function(cloned) {
    clipboard = cloned;
    toast('Copied');
  });
}
function cutSelected() {
  var obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone(function(cloned) {
    clipboard = cloned;
    deleteSelected();
    toast('Cut');
  });
}
function pasteClipboard() {
  if (!clipboard) return;
  clipboard.clone(function(cloned) {
    canvas.discardActiveObject();
    cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20, evented: true, selectable: true });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    saveHistory();
  });
}
function duplicateSelected() {
  var obj = canvas.getActiveObject();
  if (!obj) return;
  obj.clone(function(cloned) {
    canvas.discardActiveObject();
    cloned.set({ left: (cloned.left || 0) + 30, top: (cloned.top || 0) + 30, evented: true, selectable: true });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
    saveHistory();
  });
}
function nudge(dx, dy) {
  var obj = canvas.getActiveObject();
  if (!obj) return;
  obj.set({ left: (obj.left || 0) + dx, top: (obj.top || 0) + dy });
  obj.setCoords();
  canvas.renderAll();
  var inputs = document.querySelectorAll('#props-panel input[type="number"]');
  if (inputs.length >= 2) { inputs[0].value = Math.round(obj.left || 0); inputs[1].value = Math.round(obj.top || 0); }
}
function selectAll() {
  canvas.discardActiveObject();
  var objs = canvas.getObjects().filter(function(o) { return o.selectable !== false && o.visible !== false; });
  if (!objs.length) return;
  var sel = new fabric.ActiveSelection(objs, { canvas: canvas });
  canvas.setActiveObject(sel);
  canvas.renderAll();
}

function saveHistory() {
  const json = JSON.stringify(canvas.toJSON(['id', 'src']));
  if (undoStack[undoIdx] === json) return;
  undoStack = undoStack.slice(0, undoIdx + 1);
  undoStack.push(json);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  undoIdx = undoStack.length - 1;
  saveDesignAuto();
}

function undo() {
  if (undoIdx <= 0) return;
  undoIdx--;
  canvas.loadFromJSON(JSON.parse(undoStack[undoIdx]), () => {
    canvas.renderAll(); renderLayers();
  });
}

function redo() {
  if (undoIdx >= undoStack.length - 1) return;
  undoIdx++;
  canvas.loadFromJSON(JSON.parse(undoStack[undoIdx]), () => {
    canvas.renderAll(); renderLayers();
  });
}

function zoomIn() {
  let z = canvas.getZoom();
  z = Math.min(z + 0.1, 3);
  canvas.setZoom(z);
  document.getElementById('zoomLabel').textContent = Math.round(z * 100) + '%';
}

function zoomOut() {
  let z = canvas.getZoom();
  z = Math.max(z - 0.1, 0.3);
  canvas.setZoom(z);
  document.getElementById('zoomLabel').textContent = Math.round(z * 100) + '%';
}

function setTool(tool) {
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tool="${tool}"]`)?.classList.add('active');
  canvas.isDrawingMode = false;
  canvas.selection = tool === 'select';
  canvas.defaultCursor = tool === 'select' ? 'default' : 'crosshair';
  if (tool !== 'select') canvas.discardActiveObject().renderAll();
}

function addText(text) {
  const t = new fabric.Textbox(text || 'ຂໍ້ຄວາມ', {
    left: 100 + Math.random() * 100,
    top: 100 + Math.random() * 100,
    width: 300, fontSize: 28, fontFamily: DESIGNER_CONFIG.fonts.body, fill: '#ffffff',
    fontWeight: 400, textAlign: 'left', id: 'text-' + Date.now(),
  });
  canvas.add(t).setActiveObject(t);
  canvas.renderAll();
  saveHistory();
  setTool('select');
}

function addRect() {
  const r = new fabric.Rect({
    left: 100 + Math.random() * 100, top: 100 + Math.random() * 100,
    width: 200, height: 150, fill: 'transparent', stroke: '#7c3aed', strokeWidth: 2,
    rx: 4, ry: 4, id: 'rect-' + Date.now(),
  });
  canvas.add(r).setActiveObject(r);
  canvas.renderAll();
  saveHistory();
  setTool('select');
}

function addLine() {
  const l = new fabric.Line([0, 0, 200, 0], {
    left: 100 + Math.random() * 100, top: 100 + Math.random() * 100,
    stroke: '#ffffff', strokeWidth: 2, id: 'line-' + Date.now(),
  });
  canvas.add(l).setActiveObject(l);
  canvas.renderAll();
  saveHistory();
  setTool('select');
}

function addCircle() {
  const c = new fabric.Ellipse({
    left: 100 + Math.random() * 100, top: 100 + Math.random() * 100,
    rx: 80, ry: 80, fill: 'transparent', stroke: '#06d6a0', strokeWidth: 2,
    id: 'circle-' + Date.now(),
  });
  canvas.add(c).setActiveObject(c);
  canvas.renderAll();
  saveHistory();
  setTool('select');
}

function addTriangle() {
  const t = new fabric.Triangle({
    left: 100 + Math.random() * 100, top: 100 + Math.random() * 100,
    width: 160, height: 140, fill: 'transparent', stroke: '#f59e0b', strokeWidth: 2,
    id: 'triangle-' + Date.now(),
  });
  canvas.add(t).setActiveObject(t);
  canvas.renderAll();
  saveHistory();
  setTool('select');
}

function addImageElement(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    fabric.Image.fromURL(ev.target.result, function(img) {
      img.set({
        id: 'img-' + Date.now(), left: 100 + Math.random() * 100, top: 100 + Math.random() * 100,
        scaleX: 1, scaleY: 1, evented: true, selectable: true,
      });
      img.scaleToWidth(200);
      canvas.add(img).setActiveObject(img);
      canvas.renderAll();
      saveHistory();
      setTool('select');
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
  input.value = '';
}

var drawModeActive = false;
function toggleDraw() {
  drawModeActive = !drawModeActive;
  canvas.isDrawingMode = drawModeActive;
  var btn = document.querySelector('.tool-btn[data-tool="draw"]');
  if (drawModeActive) {
    canvas.freeDrawingBrush.color = '#ffffff';
    canvas.freeDrawingBrush.width = 4;
    document.getElementById('drawIndicator').style.display = 'block';
    if (btn) btn.classList.add('active');
  } else {
    document.getElementById('drawIndicator').style.display = 'none';
    if (btn) btn.classList.remove('active');
    saveHistory();
  }
}

function uploadBg(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    fabric.Image.fromURL(ev.target.result, function(img) {
      img.set({ id: 'bg-' + Date.now(), evented: false, selectable: false, lockMovementX: true, lockMovementY: true, });
      const s = Math.max(canvas.width / img.width, canvas.height / img.height);
      img.set({ scaleX: s, scaleY: s, left: 0, top: 0, originX: 'left', originY: 'top' });
      canvas.sendToBack(img);
      canvas.renderAll();
      saveHistory();
      renderLayers();
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function buildTemplateFromDef(tplId) {
  const tpl = CERT_TEMPLATES.find(t => t.id === tplId);
  if (!tpl) return;
  canvas.setWidth(DESIGNER_CONFIG.canvasWidth);
  canvas.setHeight(DESIGNER_CONFIG.canvasHeight);
  canvas.backgroundColor = tpl.elements.find(e => e.type === 'rect' && e.left === 0 && e.top === 0)?.fill || '#1a1a2e';
  tpl.elements.forEach(el => {
    switch (el.type) {
      case 'rect': {
        const r = new fabric.Rect({
          left: el.left, top: el.top, width: el.width, height: el.height,
          fill: el.fill || 'transparent', stroke: el.stroke, strokeWidth: el.strokeWidth || 0,
          rx: el.rx || 0, ry: el.rx || 0, id: 'rect-' + Date.now() + '-' + Math.random(),
        });
        canvas.add(r);
        break;
      }
      case 'textbox': {
        const t = new fabric.Textbox(el.text, {
          left: el.left, top: el.top, width: el.width || 300, fontSize: el.fontSize || 24,
          fontFamily: el.fontFamily || DESIGNER_CONFIG.fonts.body, fill: el.fill || '#ffffff',
          fontWeight: el.fontWeight || 400, textAlign: el.textAlign || 'left',
          originX: el.originX || 'left', lineHeight: el.lineHeight || 1.3,
          id: 'text-' + Date.now() + '-' + Math.random(),
          fontStyle: el.fontStyle || 'normal',
        });
        canvas.add(t);
        break;
      }
      case 'polygon': {
        const pts = el.points.split(' ').map(p => p.split(',').map(Number));
        const p = new fabric.Polygon(pts.map(([x, y]) => ({ x, y })), {
          left: el.left, top: el.top, fill: el.fill,
          id: 'poly-' + Date.now() + '-' + Math.random(),
        });
        canvas.add(p);
        break;
      }
      case 'circle': {
        const c = new fabric.Circle({
          left: el.left - el.radius, top: el.top - el.radius,
          radius: el.radius, fill: el.fill || 'transparent',
          stroke: el.stroke, strokeWidth: el.strokeWidth || 0,
          id: 'circ-' + Date.now() + '-' + Math.random(),
        });
        canvas.add(c);
        break;
      }
      case 'line': {
        const ln = new fabric.Line([el.x1 || 0, el.y1 || 0, el.x2 || 100, el.y2 || 0], {
          left: el.left, top: el.top,
          stroke: el.stroke || '#ffffff', strokeWidth: el.strokeWidth || 1,
          id: 'line-' + Date.now() + '-' + Math.random(),
        });
        canvas.add(ln);
        break;
      }
    }
  });
}

function applyTemplate(tplId) {
  if (tplId === currentTemplateId) return;
  const tpl = CERT_TEMPLATES.find(t => t.id === tplId);
  if (!tpl) return;

  // Save outgoing template state
  if (currentTemplateId && canvas.getObjects().length > 0) {
    saveHistory();
    templateStates[currentTemplateId] = canvas.toJSON(['id', 'src']);
  }

  // Check for saved state of incoming template
  document.querySelectorAll('.template-item').forEach(el => el.classList.toggle('active', el.dataset.id === tplId));
  canvas.clear();
  if (templateStates[tplId]) {
    canvas.loadFromJSON(templateStates[tplId], () => {
      canvas.renderAll();
      saveHistory();
      renderLayers();
    });
  } else {
    buildTemplateFromDef(tplId);
    canvas.renderAll();
    saveHistory();
    renderLayers();
  }
  currentTemplateId = tplId;
  lastDesignName = null;
  updateSaveBtn();
}

var DESIGNS_KEY = 'designer-saved-designs';

function saveDesign(name) {
  if (!name && lastDesignName) name = lastDesignName;
  if (!name) {
    name = prompt('  ຊື່ງານອອກແບບ (Design name):');
    if (!name || !name.trim()) return;
    name = name.trim();
  }
  var list;
  try { list = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]'); } catch(e) { list = []; }
  var json = JSON.stringify(canvas.toJSON(['id', 'src']));
  var existing = list.find(function(d) { return d.name === name; });
  if (existing) {
    existing.json = json;
    existing.updated = Date.now();
  } else {
    list.push({ name: name, json: json, created: Date.now(), updated: Date.now() });
  }
  localStorage.setItem(DESIGNS_KEY, JSON.stringify(list));
  lastDesignName = name;
  updateSaveBtn();
  toast('  ບັນທຶກ "' + name + '" ແລ້ວ (Saved!)');
}

function saveDesignAuto(suffix) {
  try {
    localStorage.setItem('designer-autosave-' + (suffix || 'latest'), JSON.stringify({
      json: canvas.toJSON(['id', 'src']),
      savedAt: Date.now(),
    }));
  } catch(e) {}
}

function loadDesign(name) {
  var list;
  try { list = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]'); } catch(e) { list = []; }
  var entry;
  if (name) {
    entry = list.find(function(d) { return d.name === name; });
    if (!entry) { toast('  ບໍ່ພົບງານ (Not found)'); return; }
  } else {
    if (!list.length) { toast('  ຍັງບໍ່ມີງານທີ່ບັນທຶກໄວ້ (No saved designs)'); return; }
    showDesignDialog();
    return;
  }

  if (canvas.getObjects().length > 0) {
    if (!confirm('  ງານປັດຈຸບັນຈະສູນເສຍ — ບັນທຶກກ່ອນ? (Current work will be lost — save first?)')) return;
    saveHistory();
  }

  currentTemplateId = null;
  try {
      canvas.loadFromJSON(JSON.parse(entry.json), function() {
        canvas.renderAll();
        saveHistory();
        renderLayers();
        selObj = null;
        renderProps();
        lastDesignName = entry.name;
        updateSaveBtn();
        toast('  ໂຫຼດ "' + entry.name + '" ແລ້ວ (Loaded!)');
      });
  } catch(e) {
    toast('  ໂຫຼດບໍ່ສຳເລັດ (Load failed): ' + e.message);
  }
}

function deleteDesign(name) {
  if (!name) return;
  if (!confirm('  ລົບ "' + name + '" ຖາວອນ? (Delete permanently?)')) return;
  var list;
  try { list = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]'); } catch(e) { list = []; }
  list = list.filter(function(d) { return d.name !== name; });
  localStorage.setItem(DESIGNS_KEY, JSON.stringify(list));
  showDesignDialog();
  toast('  ລົບ "' + name + '" ແລ້ວ (Deleted)');
}

function showDesignDialog() {
  var list;
  try { list = JSON.parse(localStorage.getItem(DESIGNS_KEY) || '[]'); } catch(e) { list = []; }
  var el = document.getElementById('designList');
  if (!list.length) {
    el.innerHTML = '<div class="prop-empty"><strong>ຍັງບໍ່ມີງານທີ່ບັນທຶກໄວ້</strong>ກົດ ບັນທຶກ ເພື່ອເກັບງານນີ້</div>';
  } else {
    el.innerHTML = list.slice().reverse().map(function(d) {
      var t = new Date(d.updated).toLocaleString();
      return '<div class="prop-row" style="border-bottom:1px solid var(--border);">' +
        '<div style="min-width:0;"><strong style="color:var(--text);">' + d.name + '</strong><br><span style="font-size:0.72rem;color:var(--muted);">' + t + '</span></div>' +
        '<div style="display:flex;gap:0.25rem;flex-shrink:0;">' +
        '<button class="tb-btn action" onclick="loadDesign(\'' + d.name.replace(/'/g, "\\'") + '\')">ເປີດ</button>' +
        '<button class="tb-btn" onclick="deleteDesign(\'' + d.name.replace(/'/g, "\\'") + '\')" style="color:var(--danger);">ລຶບ</button>' +
        '</div></div>';
    }).join('');
  }
  document.getElementById('designModal').style.display = 'flex';
}

function closeDesignModal() {
  document.getElementById('designModal').style.display = 'none';
}

function updateSaveBtn() {
  var btn = document.querySelector('.tb-btn[onclick*="saveDesign"]');
  if (btn) {
    btn.title = lastDesignName ? 'ບັນທຶກໃນ "' + lastDesignName + '"' : 'ບັນທຶກງານອອກແບບ';
    btn.innerHTML = SAVE_ICON + '<span>' + (lastDesignName ? lastDesignName.substring(0, 12) : 'ບັນທຶກ') + '</span>';
  }
}

function toast(msg) {
  var el = document.getElementById('toastMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toastMsg';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(el._hide);
  el._hide = setTimeout(function() { el.classList.remove('is-visible'); }, 2500);
}

function onSelect() {
  const obj = canvas.getActiveObject();
  selObj = obj;
  renderProps();
  renderLayers();
}

function renderProps() {
  var panel = document.getElementById('props-panel');
  if (!selObj) {
    panel.innerHTML =
      '<div class="prop-empty"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>' +
      '<strong>ຍັງບໍ່ໄດ້ເລືອກອົງປະກອບ</strong>' +
      'ເລືອກອົງປະກອບໃນແຜ໇ນ ຫຼື ໃຊ້ເຄື່ອງມືສ້າງອົງໃໝ່</div>';
    return;
  }

  // ── Multi‑select (ActiveSelection) ──
  if (selObj._objects) {
    var n = selObj._objects.length;
    var first = selObj._objects[0];
    panel.innerHTML =
      '<div class="prop-section-title">ເລືອກ ' + n + ' ອັນ</div>' +
      '<div class="prop-empty" style="font-size:0.8rem;">' + n + ' ອົງປະກອບ</div>' +
      '<div class="prop-section-title">ຕຳແໜ່ງ</div>' +
      makeInput('X', Math.round(first.left || 0), function(v) { var dx = Number(v) - Math.round(first.left || 0); selObj._objects.forEach(function(o) { o.left = (o.left || 0) + dx; o.setCoords(); }); canvas.renderAll(); saveHistory(); }, 'number') +
      makeInput('Y', Math.round(first.top || 0), function(v) { var dy = Number(v) - Math.round(first.top || 0); selObj._objects.forEach(function(o) { o.top = (o.top || 0) + dy; o.setCoords(); }); canvas.renderAll(); saveHistory(); }, 'number') +
      '<div class="prop-section-title">ການຈັດຮຽງ</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:3px;padding:4px 0;">' +
        alignBtn('left') + alignBtn('center') + alignBtn('right') +
        alignBtn('top') + alignBtn('middle') + alignBtn('bottom') +
        (n >= 3 ? distributeBtn('h') + distributeBtn('v') : '') +
      '</div>';
    panel.innerHTML += '<button class="prop-delete" onclick="deleteSelected()">' + TRASH_ICON + '<span>ລຶບ</span></button>';
    return;
  }

  var o = selObj;
  var html = '';

  if (o.type === 'textbox' || o.type === 'i-text') {
    html += '<div class="prop-section-title">ຂໍ້ຄວາມ</div>';
    html += makeInput('ຂໍ້ຄວາມ', o.text || '', function(v) { selObj.text = v; canvas.renderAll(); saveHistory(); });
    html += makeSelect('ຟອນ', DESIGNER_CONFIG.fontOptions.map(function(f) { return { v: f.family, l: f.family }; }), o.fontFamily, function(v) { selObj.fontFamily = v; canvas.renderAll(); saveHistory(); });
    html += makeInput('ຂະໜາດ', o.fontSize, function(v) { selObj.fontSize = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
    html += makeSelect('ນ້ຳໜັກ', [{ v: 400, l: 'ປົກປົງ' }, { v: 700, l: 'ຫນາ' }], o.fontWeight, function(v) { selObj.fontWeight = Number(v); canvas.renderAll(); saveHistory(); });
    html += makeSelect('ຈັດຮຽງ', [{ v: 'left', l: 'ຊ້າຍ' }, { v: 'center', l: 'ກາງ' }, { v: 'right', l: 'ຂວາ' }], o.textAlign, function(v) { selObj.textAlign = v; canvas.renderAll(); saveHistory(); });
    html += makeColor('ສີ', o.fill, function(v) { selObj.fill = v; canvas.renderAll(); saveHistory(); });
  } else if (o.type === 'rect') {
    html += '<div class="prop-section-title">ສີ່ຫຼ່ຽມ</div>';
    html += makeColor('ສີພື້ນ', o.fill, function(v) { selObj.fill = v; canvas.renderAll(); saveHistory(); });
    html += makeColor('ຂອບ', o.stroke || '#000000', function(v) { selObj.stroke = v; canvas.renderAll(); saveHistory(); });
    html += makeInput('ໜາຂອບ', o.strokeWidth || 0, function(v) { selObj.strokeWidth = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
    html += makeInput('ມົນມຸມ', o.rx || 0, function(v) { selObj.rx = Number(v); selObj.ry = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
  } else if (o.type === 'line') {
    html += '<div class="prop-section-title">ເສັ້ນ</div>';
    html += makeColor('ສີ', o.stroke || '#ffffff', function(v) { selObj.stroke = v; canvas.renderAll(); saveHistory(); });
    html += makeInput('ໜາ', o.strokeWidth || 1, function(v) { selObj.strokeWidth = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
  } else if (o.type === 'circle') {
    html += '<div class="prop-section-title">ວົງກົມ</div>';
    html += makeColor('ສີພື້ນ', o.fill, function(v) { selObj.fill = v; canvas.renderAll(); saveHistory(); });
    html += makeColor('ຂອບ', o.stroke || '#000000', function(v) { selObj.stroke = v; canvas.renderAll(); saveHistory(); });
    html += makeInput('ຂະໜາດ', o.radius, function(v) { selObj.radius = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
  } else if (o.type === 'image') {
    html += '<div class="prop-section-title">ຮູບພາບ</div>';
    html += makeInput('ຄວາມກວ້າງ', Math.round(o.width * o.scaleX), function(v) { selObj.scaleX = Number(v) / selObj.width; canvas.renderAll(); saveHistory(); }, 'number');
    html += makeInput('ຄວາມສູງ', Math.round(o.height * o.scaleY), function(v) { selObj.scaleY = Number(v) / selObj.height; canvas.renderAll(); saveHistory(); }, 'number');
    html += makeInput('ໝູນ', o.angle || 0, function(v) { selObj.angle = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
  }

  html += '<div class="prop-section-title">ຕຳແໜ່ງ</div>';
  html += makeInput('X', Math.round(o.left || 0), function(v) { selObj.left = Number(v); selObj.setCoords(); canvas.renderAll(); saveHistory(); }, 'number');
  html += makeInput('Y', Math.round(o.top || 0), function(v) { selObj.top = Number(v); selObj.setCoords(); canvas.renderAll(); saveHistory(); }, 'number');
  html += makeInput('ໝູນ', o.angle || 0, function(v) { selObj.angle = Number(v); canvas.renderAll(); saveHistory(); }, 'number');
  html += makeInput('ຄວາມກວ້າງ', o.width ? Math.round(o.width * (o.scaleX || 1)) : '—', null, 'number', true);
  html += makeInput('ຄວາມສູງ', o.height ? Math.round(o.height * (o.scaleY || 1)) : '—', null, 'number', true);

  // ── Opacity (Phase 3) ──
  html += '<div class="prop-section-title">ຄວາມໂປ່ງໃສ</div>';
  html += '<label class="prop-row"><span>Opacity</span><input type="range" min="0" max="1" step="0.05" value="' + (o.opacity != null ? o.opacity : 1) + '" oninput="selObj.opacity=Number(this.value);canvas.renderAll()" onchange="saveHistory()" style="flex:1;"></label>';

  // ── Group context buttons ──
  if (o.type === 'group') {
    html += '<button class="prop-delete" onclick="ungroupSelected()" style="margin-top:0.4rem;">  ແຍກກຸ່ມ (Ungroup)</button>';
  }

  html += '<button class="prop-delete" onclick="deleteSelected()"><i class="fas fa-trash"></i> ລົບ</button>';
  panel.innerHTML = html;
}

function makeInput(label, val, onChange, type, readonly) {
  const disabled = readonly ? ' disabled' : '';
  const ro = readonly ? ' readonly' : '';
  return `<label class="prop-row"><span>${label}</span><input type="${type || 'text'}" value="${val ?? ''}"${ro}${disabled} onchange="${onChange ? 'propSetter(this,' + onChange + ')' : ''}" oninput="${onChange ? 'propSetter(this,' + onChange + ')' : ''}"></label>`;
}

function makeColor(label, val, onChange) {
  var col = val || '#000000';
  var prop = (onChange + '').match(/selObj\.(\w+)/);
  var propName = prop ? prop[1] : 'fill';
  return `<div class="prop-row"><span>${label}</span><span class="color-pill" style="background:${col}" onclick="openColorPicker(this,'${col}','${propName}')"></span></div>`;
}

function makeSelect(label, opts, val, onChange) {
  const optHtml = opts.map(o => `<option value="${o.v}"${o.v === val ? ' selected' : ''}>${o.l}</option>`).join('');
  return `<label class="prop-row"><span>${label}</span><select onchange="propSetter(this,${onChange})">${optHtml}</select></label>`;
}

function propSetter(el, fn) {
  fn(el.value);
}

// ── Custom Color Picker (replaces native input[type=color]) ──
var _cpPopup = null;

function hsvToHex(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));
  var c = v * s;
  var x = c * (1 - Math.abs((h / 60) % 2 - 1));
  var m = v - c;
  var r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return '#' + [r, g, b].map(function(c) {
    var n = Math.round((c + m) * 255);
    var hx = n.toString(16);
    return hx.length === 1 ? '0' + hx : hx;
  }).join('');
}

function hexToHsv(hex) {
  if (!hex || typeof hex !== 'string') return { h: 0, s: 0, v: 1 };
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
  var r = parseInt(hex.substr(0, 2), 16) / 255;
  var g = parseInt(hex.substr(2, 2), 16) / 255;
  var b = parseInt(hex.substr(4, 2), 16) / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  var h = 0, s = (max === 0 ? 0 : d / max), v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return { h: h, s: s, v: v };
}

function drawSvCanvas(sv, hue, sat, val) {
  var w = sv.width, h = sv.height;
  var ctx = sv.getContext('2d');
  var img = ctx.createImageData(w, h);
  var d = img.data;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var s = x / w;
      var v = 1 - y / h;
      var c = v * s;
      var xc = c * (1 - Math.abs((hue / 60) % 2 - 1));
      var m = v - c;
      var r = 0, g = 0, b = 0;
      if (hue < 60) { r = c; g = xc; }
      else if (hue < 120) { r = xc; g = c; }
      else if (hue < 180) { g = c; b = xc; }
      else if (hue < 240) { g = xc; b = c; }
      else if (hue < 300) { r = xc; b = c; }
      else { r = c; b = xc; }
      var idx = (y * w + x) * 4;
      d[idx] = Math.round((r + m) * 255);
      d[idx + 1] = Math.round((g + m) * 255);
      d[idx + 2] = Math.round((b + m) * 255);
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // indicator circle
  var ix = sat * w, iy = (1 - val) * h;
  ctx.beginPath();
  ctx.arc(ix, iy, 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ix, iy, 5, 0, Math.PI * 2);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawHueCanvas(hueCanvas, hue) {
  var w = hueCanvas.width, h = hueCanvas.height;
  var ctx = hueCanvas.getContext('2d');
  for (var y = 0; y < h; y++) {
    var hx = hsvToHex((1 - y / h) * 360, 1, 1);
    ctx.fillStyle = hx;
    ctx.fillRect(0, y, w, 1);
  }
  // indicator triangle
  var iy = (1 - hue / 360) * h;
  ctx.beginPath();
  ctx.moveTo(0, iy - 5);
  ctx.lineTo(w, iy);
  ctx.lineTo(0, iy + 5);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function openColorPicker(pillEl, initialColor, propName) {
  closeColorPicker();
  var hsv = hexToHsv(initialColor);
  var hue = hsv.h, sat = hsv.s, val = hsv.v;
  var target = typeof selObj !== 'undefined' ? selObj : null;

  var popup = document.createElement('div');
  popup.className = 'color-picker-popup';
  var presets = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff6b6b','#ffa94d','#ffd43b','#69db7c','#4dabf7','#9775fa','#f783ac','#868e96'];
  popup.innerHTML =
    '<div class="cp-body">' +
      '<div class="cp-main">' +
        '<canvas class="cp-sv" width="150" height="150"></canvas>' +
        '<canvas class="cp-hue" width="16" height="150"></canvas>' +
      '</div>' +
      '<div class="cp-bottom">' +
        '<div class="cp-preview" style="background:' + initialColor + '"></div>' +
        '<input class="cp-hex" type="text" value="' + initialColor + '" spellcheck="false">' +
      '</div>' +
      '<div class="cp-presets">' + presets.map(function(c) {
        return '<span class="cp-swatch" style="background:' + c + '" data-color="' + c + '"></span>';
      }).join('') + '</div>' +
    '</div>';
  document.body.appendChild(popup);

  // position near pill
  var pr = pillEl.getBoundingClientRect();
  var pw = 230, ph = 280;
  var px = Math.min(pr.left, window.innerWidth - pw - 10);
  var py = pr.bottom + 4;
  if (py + ph > window.innerHeight) py = pr.top - ph - 4;
  popup.style.left = Math.max(4, px) + 'px';
  popup.style.top = Math.max(4, py) + 'px';

  var svCanvas = popup.querySelector('.cp-sv');
  var hueCanvas = popup.querySelector('.cp-hue');
  var preview = popup.querySelector('.cp-preview');
  var hexInput = popup.querySelector('.cp-hex');

  function applyColor(h, s, v) {
    var hex = hsvToHex(h, s, v);
    pillEl.style.background = hex;
    preview.style.background = hex;
    hexInput.value = hex;
    if (target) { target[propName] = hex; canvas.renderAll(); }
  }

  function redrawSV() { drawSvCanvas(svCanvas, hue, sat, val); }
  function redrawHue() { drawHueCanvas(hueCanvas, hue); }

  redrawSV(); redrawHue();

  // SV drag
  var svDrag = { active: false };
  svCanvas.addEventListener('mousedown', function(e) {
    svDrag.active = true;
    var r = svCanvas.getBoundingClientRect();
    sat = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    val = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
    redrawSV(); applyColor(hue, sat, val);
  });
  var _svMove = function(e) {
    if (!svDrag.active) return;
    if (!svCanvas.parentNode) { svDrag.active = false; return; }
    var r = svCanvas.getBoundingClientRect();
    sat = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    val = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
    redrawSV(); applyColor(hue, sat, val);
  };
  var _svUp = function() { svDrag.active = false; };
  document.addEventListener('mousemove', _svMove);
  document.addEventListener('mouseup', _svUp);

  // Hue drag
  var hueDrag = { active: false };
  hueCanvas.addEventListener('mousedown', function(e) {
    hueDrag.active = true;
    var r = hueCanvas.getBoundingClientRect();
    hue = Math.max(0, Math.min(360, (1 - (e.clientY - r.top) / r.height) * 360));
    redrawSV(); redrawHue(); applyColor(hue, sat, val);
  });
  var _hueMove = function(e) {
    if (!hueDrag.active) return;
    if (!hueCanvas.parentNode) { hueDrag.active = false; return; }
    var r = hueCanvas.getBoundingClientRect();
    hue = Math.max(0, Math.min(360, (1 - (e.clientY - r.top) / r.height) * 360));
    redrawSV(); redrawHue(); applyColor(hue, sat, val);
  };
  var _hueUp = function() { hueDrag.active = false; };
  document.addEventListener('mousemove', _hueMove);
  document.addEventListener('mouseup', _hueUp);

  // Hex input
  hexInput.addEventListener('input', function() {
    var v = this.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      var h2 = hexToHsv(v);
      hue = h2.h; sat = h2.s; val = h2.v;
      redrawSV(); redrawHue();
      pillEl.style.background = v;
      preview.style.background = v;
      if (target) { target[propName] = v; canvas.renderAll(); }
    }
  });

  // Preset clicks
  popup.querySelectorAll('.cp-swatch').forEach(function(el) {
    el.addEventListener('click', function() {
      var c = this.dataset.color;
      var h2 = hexToHsv(c);
      hue = h2.h; sat = h2.s; val = h2.v;
      redrawSV(); redrawHue(); applyColor(hue, sat, val);
    });
  });

  // Close popup on click-outside or Escape
  function onDocDown(e) {
    if (!popup.contains(e.target) && e.target !== pillEl) {
      closeColorPicker();
      saveHistory();
    }
  }
  function onDocKey(e) {
    if (e.key === 'Escape') { closeColorPicker(); saveHistory(); }
  }
  setTimeout(function() {
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onDocKey);
  }, 10);

  _cpPopup = { popup: popup, onDocDown: onDocDown, onDocKey: onDocKey, _svMove: _svMove, _svUp: _svUp, _hueMove: _hueMove, _hueUp: _hueUp };
}

function closeColorPicker() {
  if (_cpPopup) {
    document.removeEventListener('mousedown', _cpPopup.onDocDown);
    document.removeEventListener('keydown', _cpPopup.onDocKey);
    document.removeEventListener('mousemove', _cpPopup._svMove);
    document.removeEventListener('mouseup', _cpPopup._svUp);
    document.removeEventListener('mousemove', _cpPopup._hueMove);
    document.removeEventListener('mouseup', _cpPopup._hueUp);
    if (_cpPopup.popup && _cpPopup.popup.parentNode) {
      _cpPopup.popup.parentNode.removeChild(_cpPopup.popup);
    }
    _cpPopup = null;
  }
}

// ── Group / Ungroup (Phase 3) ──
function groupSelected() {
  var sel = canvas.getActiveObject();
  if (!sel || !sel._objects || sel._objects.length < 2) { toast('Select 2+ objects to group'); return; }
  sel.toGroup();
  canvas.renderAll();
  saveHistory();
}
function ungroupSelected() {
  var sel = canvas.getActiveObject();
  if (!sel || sel.type !== 'group') { toast('Select a grouped object to ungroup'); return; }
  sel.toActiveSelection();
  canvas.renderAll();
  saveHistory();
}

// ── Lock / Unlock (Phase 3) ──
function toggleLock() {
  var obj = canvas.getActiveObject();
  if (!obj) { toast('Select an object to lock/unlock'); return; }
  var locked = obj.selectable === false;
  if (locked) {
    obj.set({ selectable: true, evented: true, lockMovementX: false, lockMovementY: false, lockRotation: false, lockScalingX: false, lockScalingY: false });
  } else {
    obj.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true, lockRotation: true, lockScalingX: true, lockScalingY: true });
  }
  canvas.renderAll();
  renderLayers();
  renderProps();
}

// ── Z‑order helpers (Phase 3) ──
function bringForward() { var o = canvas.getActiveObject(); if (!o) { toast('Select an object'); return; } canvas.bringForward(o); canvas.renderAll(); saveHistory(); renderLayers(); }
function sendBackward() { var o = canvas.getActiveObject(); if (!o) { toast('Select an object'); return; } canvas.sendBackwards(o); canvas.renderAll(); saveHistory(); renderLayers(); }
function bringToFront() { var o = canvas.getActiveObject(); if (!o) { toast('Select an object'); return; } canvas.bringToFront(o); canvas.renderAll(); saveHistory(); renderLayers(); }
function sendToBack() { var o = canvas.getActiveObject(); if (!o) { toast('Select an object'); return; } canvas.sendToBack(o); canvas.renderAll(); saveHistory(); renderLayers(); }

// ── Align & Distribute (Phase 2) ──
function alignObjects(dir) {
  var sel = canvas.getActiveObject();
  if (!sel) { toast('Select 2+ objects to align'); return; }
  var objs = sel._objects || [sel];
  if (objs.length < 2) { toast('Select 2+ objects to align'); return; }
  var bounds = objs.map(function(o) { return o.getBoundingRect(); });
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  bounds.forEach(function(b) { minX = Math.min(minX, b.left); maxX = Math.max(maxX, b.left + b.width); minY = Math.min(minY, b.top); maxY = Math.max(maxY, b.top + b.height); });
  var allBounds = { left: minX, right: maxX, top: minY, bottom: maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  canvas.discardActiveObject();
  objs.forEach(function(o) {
    var b = o.getBoundingRect();
    switch (dir) {
      case 'left':   o.set({ left: allBounds.left }); break;
      case 'center': o.set({ left: allBounds.cx - b.width / 2 }); break;
      case 'right':  o.set({ left: allBounds.right - b.width }); break;
      case 'top':    o.set({ top: allBounds.top }); break;
      case 'middle': o.set({ top: allBounds.cy - b.height / 2 }); break;
      case 'bottom': o.set({ top: allBounds.bottom - b.height }); break;
    }
    o.setCoords();
  });
  canvas.renderAll();
  saveHistory();
}
function distributeObjects(dir) {
  var sel = canvas.getActiveObject();
  if (!sel || !sel._objects || sel._objects.length < 3) { toast('Select 3+ objects to distribute'); return; }
  var objs = sel._objects.slice().sort(function(a, b) { return dir === 'h' ? a.left - b.left : a.top - b.top; });
  var first = objs[0].getBoundingRect();
  var last = objs[objs.length - 1].getBoundingRect();
  var totalSpace = dir === 'h' ? (last.left + last.width) - first.left : (last.top + last.height) - first.top;
  var sumSize = objs.reduce(function(s, o) { var b = o.getBoundingRect(); return s + (dir === 'h' ? b.width : b.height); }, 0);
  var gap = (totalSpace - sumSize) / (objs.length - 1);
  canvas.discardActiveObject();
  var pos = dir === 'h' ? first.left : first.top;
  objs.forEach(function(o) {
    if (dir === 'h') { o.set({ left: pos }); } else { o.set({ top: pos }); }
    o.setCoords();
    var b = o.getBoundingRect();
    pos += (dir === 'h' ? b.width : b.height) + gap;
  });
  canvas.renderAll();
  saveHistory();
}

function deleteSelected() {
  const obj = canvas.getActiveObject();
  if (!obj) return;
  canvas.remove(obj);
  canvas.discardActiveObject();
  canvas.renderAll();
  selObj = null;
  renderProps();
  renderLayers();
  saveHistory();
}

function renderTemplates() {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = CERT_TEMPLATES.map(t =>
    `<div class="template-item" data-id="${t.id}" onclick="applyTemplate('${t.id}')">
      <img src="${t.thumbnail}" alt="${t.name}">
      <div class="tname">${t.name} <small>${t.nameEn}</small></div>
    </div>`
  ).join('');
  if (CERT_TEMPLATES.length) grid.firstElementChild.classList.add('active');
}

var _lastLayerVersion = 0;
function renderLayers() {
  const list = document.getElementById('layerList');
  const objs = canvas.getObjects().slice().reverse();
  if (!objs.length) { list.innerHTML = '<div style="font-size:0.72rem;color:#555;padding:0.3rem 0;">ບໍ່ມີອົງປະກອບ</div>'; return; }
  const sel = canvas.getActiveObject();
  const existing = list.querySelectorAll('.layer-item');
  if (existing.length === objs.length && _layerVersion === _lastLayerVersion) {
    existing.forEach((el, i) => {
      const o = objs[i];
      const active = !!(sel && (sel === o || (sel._objects && sel._objects.includes(o))));
      el.classList.toggle('active', active);
    });
    return;
  }
  _lastLayerVersion = _layerVersion;
  list.innerHTML = objs.map((o, i) => {
    const active = sel && (sel === o || (sel._objects && sel._objects.includes(o))) ? ' active' : '';
    const typeIcon = layerTypeIcon(o.type);
    const label = o.text || o.type || 'element';
    const vis = o.visible !== false;
    var locked = o.selectable === false;
    return `<div class="layer-item${active}" draggable="true" onclick="event.stopPropagation();selectLayer(${i})" data-idx="${i}">
      <span class="ltype">${typeIcon}</span>
      <span class="lname">${label.substring(0, 16)}</span>
<button type="button" class="leye" onclick="event.stopPropagation();toggleLayerVis(${i})" title="ສະແດງການເບິ່ງ" aria-label="ສະແດງການເບິ່ງ">${vis ? EYE_ICON : EYE_OFF_ICON}</button>
      <button type="button" class="llock" onclick="event.stopPropagation();toggleLayerLock(${i})" title="${locked ? 'ປົດລັອກ' : 'ລັອກ'}" aria-label="${locked ? 'ປົດລັອກ' : 'ລັອກ'}">${locked ? LOCK_ICON : UNLOCK_ICON}</button>
    </div>`;
  }).join('');
}

function initDragLayer() {
  const ll = document.getElementById('layerList');
  ll.addEventListener('dragstart', e => {
    const item = e.target.closest('.layer-item');
    if (!item) { e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.idx);
    item.style.opacity = '0.4';
  });
  ll.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    ll.querySelectorAll('.drag-indicator').forEach(el => el.remove());
    const item = e.target.closest('.layer-item');
    if (!item) return;
    const rect = item.getBoundingClientRect();
    const ind = document.createElement('div');
    ind.className = 'drag-indicator';
    if (e.clientY < rect.top + rect.height / 2) {
      item.parentNode.insertBefore(ind, item);
    } else {
      item.parentNode.insertBefore(ind, item.nextSibling);
    }
  });
  ll.addEventListener('dragleave', e => {
    if (!ll.contains(e.relatedTarget)) {
      ll.querySelectorAll('.drag-indicator').forEach(el => el.remove());
    }
  });
  ll.addEventListener('dragend', () => {
    ll.querySelectorAll('.drag-indicator').forEach(el => el.remove());
    ll.querySelectorAll('.layer-item').forEach(el => el.style.opacity = '');
  });
  ll.addEventListener('drop', e => {
    e.preventDefault();
    ll.querySelectorAll('.drag-indicator').forEach(el => el.remove());
    ll.querySelectorAll('.layer-item').forEach(el => el.style.opacity = '');
    const from = parseInt(e.dataTransfer.getData('text/plain'));
    const item = e.target.closest('.layer-item');
    if (!item || isNaN(from)) return;
    const rect = item.getBoundingClientRect();
    const toIdx = parseInt(item.dataset.idx);
    const targetVisual = e.clientY < rect.top + rect.height / 2 ? toIdx : toIdx + 1;
    if (targetVisual === from) return;
    const objs = canvas.getObjects().slice().reverse();
    const obj = objs[from];
    if (!obj) return;
    const n = canvas.getObjects().length;
    canvas.moveTo(obj, n - 1 - Math.min(targetVisual, n - 1));
    canvas.renderAll();
    saveHistory();
    renderLayers();
  });
}

function selectLayer(idx) {
  const objs = canvas.getObjects().slice().reverse();
  const obj = objs[idx];
  if (!obj) return;
  canvas.setActiveObject(obj);
  canvas.renderAll();
}

function toggleLayerVis(idx) {
  var objs = canvas.getObjects().slice().reverse();
  var obj = objs[idx];
  if (!obj) return;
  obj.visible = !(obj.visible !== false);
  canvas.renderAll();
  _layerVersion++;
  renderLayers();
}
function toggleLayerLock(idx) {
  var objs = canvas.getObjects().slice().reverse();
  var obj = objs[idx];
  if (!obj) return;
  var locked = obj.selectable === false;
  obj.set({ selectable: locked, evented: locked, lockMovementX: !locked, lockMovementY: !locked, lockRotation: !locked, lockScalingX: !locked, lockScalingY: !locked });
  canvas.renderAll();
  _layerVersion++;
  renderLayers();
  if (selObj === obj) renderProps();
}

function resizeCanvas() {
  const w = parseInt(document.getElementById('canvasW').value) || 800;
  const h = parseInt(document.getElementById('canvasH').value) || 600;
  canvas.setWidth(w);
  canvas.setHeight(h);
  canvas.renderAll();
  saveHistory();
}

function setCanvasBg(color) {
  canvas.backgroundColor = color;
  canvas.renderAll();
  saveHistory();
}

function exportPNG() {
  const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
  const link = document.createElement('a');
  link.download = 'certificate.png';
  link.href = dataURL;
  link.click();
}

async function uploadToIPFS() {
  const btn = document.querySelector('.tb-btn.primary');
  btn.disabled = true;
  btn.textContent = '  ກຳລັງ Upload...';

  const formData = JSON.parse(localStorage.getItem('designerFormData') || '{}');
  const dName = formData.name || 'ໃບຢັ້ງຢືນ NFT';
  const dActivity = formData.activity || '';
  const dIssuer = formData.issuer || 'ບຸກຄົນທົ່ວໄປ';
  const dSender = formData.sender || '';

  try {
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    btn.textContent = '  Upload ຮູບ...';
    const imgRes = await fetch(`${API_BASE_URL}/api/ipfs/upload-base64`, {
      method: 'POST', headers,
      body: JSON.stringify({ image: dataURL, name: 'certificate.png' }),
    });
    const imgData = await imgRes.json();
    if (!imgRes.ok) throw new Error(imgData.message || 'Upload image failed');

    btn.textContent = '  ສ້າງ metadata...';
    const metaRes = await fetch(`${API_BASE_URL}/api/ipfs/metadata`, {
      method: 'POST', headers,
      body: JSON.stringify({
        name: dName,
        description: dActivity,
        image: `ipfs://${imgData.cid}`,
        issuer: dIssuer,
        sender: dSender,
      }),
    });
    const metaData = await metaRes.json();
    if (!metaRes.ok) throw new Error(metaData.message || 'Upload metadata failed');

    const modal = document.getElementById('ipfsModal');
    document.getElementById('ipfsResult').innerHTML =
      `<div style="font-family:var(--font-mono);font-size:0.8rem;">ຮູບ: ${imgData.cid}</div>
       <div style="word-break:break-all;font-family:var(--font-mono);font-size:0.8rem;">Metadata: ${metaData.cid}</div>
       <div style="margin-top:0.4rem;font-size:0.75rem;color:var(--muted);word-break:break-all;">${metaData.gatewayUrl}</div>`;
    document.getElementById('ipfsActions').innerHTML =
      `<a href="${metaData.gatewayUrl}" target="_blank" rel="noopener" class="tb-btn action" style="text-decoration:none;">ເບິ່ງ Metadata</a>
       <button class="tb-btn action" onclick="copyCID('${metaData.gatewayUrl}')">ກຳເນີດ URL</button>
       <button class="tb-btn primary" onclick="useForMint('${metaData.gatewayUrl}')">ໃຊ້ສຳລັບ Mint</button>`;
    modal.style.display = 'flex';
  } catch (e) {
    alert('ອັບໂຫຼດບໍ່ສຳເລັດ: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '  Upload IPFS';
  }
}

// ── Context Menu (Phase 4) ──
function showContextMenu(e) {
  e.preventDefault();
  var menu = document.getElementById('ctxMenu');
  menu.style.display = 'block';
  menu.style.left = Math.min(e.clientX, window.innerWidth - 160) + 'px';
  menu.style.top = Math.min(e.clientY, window.innerHeight - 240) + 'px';
}
function hideContextMenu() {
  document.getElementById('ctxMenu').style.display = 'none';
}
function ctxExec(action) {
  hideContextMenu();
  switch (action) {
    case 'copy': copySelected(); break;
    case 'paste': pasteClipboard(); break;
    case 'cut': cutSelected(); break;
    case 'duplicate': duplicateSelected(); break;
    case 'delete': deleteSelected(); break;
    case 'lock': toggleLock(); break;
    case 'bringForward': bringForward(); break;
    case 'sendBackward': sendBackward(); break;
    case 'bringToFront': bringToFront(); break;
    case 'sendToBack': sendToBack(); break;
  }
}

// ── Snap to Grid (Phase 4) ──
var snapEnabled = false;
function toggleSnap() {
  snapEnabled = !snapEnabled;
  document.getElementById('snapToggle').checked = snapEnabled;
  var btn = document.getElementById('snapBtn');
  if (btn) btn.setAttribute('aria-pressed', snapEnabled ? 'true' : 'false');
  toast(snapEnabled ? 'ເປີດຕິດເຂັຍ (10px)' : 'ປິດຕິດເຂັຍ');
}

// ── Preview (Phase 4) ──
function showPreview() {
  var img = document.getElementById('previewImg');
  img.src = canvas.toDataURL({ format: 'png', multiplier: 2 });
  document.getElementById('previewOverlay').style.display = 'flex';
}
function closePreview() {
  document.getElementById('previewOverlay').style.display = 'none';
}

// ── History Panel (Phase 4) ──
function renderHistoryPanel() {
  var panel = document.getElementById('historyPanel');
  if (!panel) return;
  panel.innerHTML = undoStack.map(function(json, i) {
    var isCurrent = i === undoIdx;
    return '<div class="' + (isCurrent ? 'is-current' : '') + '" onclick="jumpToHistory(' + i + ')">' +
      (isCurrent ? '<span class="hmark" aria-hidden="true"></span>' : '<span class="hmark"></span>') +
      'ຂັ້ນ ' + (i + 1) + '</div>';
  }).join('');
}
function jumpToHistory(idx) {
  if (idx < 0 || idx >= undoStack.length) return;
  undoIdx = idx;
  canvas.loadFromJSON(JSON.parse(undoStack[undoIdx]), function() {
    canvas.renderAll();
    selObj = null;
    renderProps();
    renderLayers();
    renderHistoryPanel();
  });
}

// ── Font preview: style the font select ──
function styleFontSelect() {
  var sel = document.querySelector('#props-panel select');
  if (sel && sel.closest('.prop-row').querySelector('span').textContent === 'ຟອນ') {
    sel.style.fontFamily = sel.value;
    sel.onchange = function() {
      var fn = function(v) { selObj.fontFamily = v; canvas.renderAll(); saveHistory(); };
      fn(sel.value);
      sel.style.fontFamily = sel.value;
    };
  }
}

// ── Patch renderHistory into saveHistory ──
var _origSaveHistory = saveHistory;
saveHistory = function() {
  _origSaveHistory();
  setTimeout(renderHistoryPanel, 10);
};

function copyCID(cid) {
  navigator.clipboard.writeText(cid).then(() => alert('  CID ຖືກກຳເນີດແລ້ວ'));
}

function useForMint(gatewayUrl) {
  localStorage.setItem('designerResult', JSON.stringify({
    gatewayUrl,
    timestamp: Date.now(),
  }));
  alert('  ພ້ອມ Mint! ກັບໄປໜ້າ Mint ແລ້ວກົດ Mint');
  window.close();
}

init();
