document.addEventListener('DOMContentLoaded', () => {
  const toggle   = document.getElementById('sidebarToggle');
  const overlay  = document.getElementById('overlay');
  const isMobile = () => window.innerWidth <= 640;
  const isTablet = () => window.innerWidth > 640 && window.innerWidth <= 1024;

  // ── Restore sidebar state ──
  if (!isMobile()) {
    const stored = localStorage.getItem('sidebarMini');
    // Default to mini on tablet unless the user explicitly expanded it
    if (stored === '1' || (isTablet() && stored !== '0')) {
      document.body.classList.add('mini');
    }
  }

  // ── Sidebar toggle ──
  toggle.addEventListener('click', () => {
    if (isMobile()) {
      const open = document.body.classList.toggle('mob-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    } else {
      const mini = document.body.classList.toggle('mini');
      localStorage.setItem('sidebarMini', mini ? '1' : '0');
      toggle.setAttribute('aria-expanded', mini ? 'false' : 'true');
    }
  });

  overlay?.addEventListener('click', () => {
    document.body.classList.remove('mob-open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('mob-open')) {
      document.body.classList.remove('mob-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // ── Sidebar collapsible nav ──
  document.querySelectorAll('.nav-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.nav-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Auto-open active section ──
  const current = location.pathname;
  document.querySelectorAll('.nav-sub a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
      const item = a.closest('.nav-item');
      if (item) {
        item.classList.add('open');
        item.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'true');
      }
    }
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });

  // ── Page accordion ──
  document.querySelectorAll('.accordion-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.accordion-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
});
