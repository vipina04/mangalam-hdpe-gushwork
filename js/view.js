/**
 * ============================================================
 *  VIEW — All DOM Rendering & Visual Updates
 *  Reads data, renders HTML, applies CSS classes.
 *  Never modifies application state directly.
 * ============================================================
 */

const AppView = (() => {

  /* ─── ELEMENT CACHE — lazy getters ─── */
  const el = {
    get mainImg()       { return document.getElementById('mainCarouselImg'); },
    get carouselMain()  { return document.getElementById('carouselMain'); },
    get thumbsTrack()   { return document.getElementById('carouselThumbs'); },
    get zoomLens()      { return document.getElementById('zoomLens'); },
    get zoomPreview()   { return document.getElementById('zoomPreview'); },
    get zoomPreviewImg(){ return document.getElementById('zoomPreviewImg'); },
    get stickyBar()     { return document.getElementById('stickyBar'); },
    get processTabs()   { return document.getElementById('processTabs'); },
    get processContent(){ return document.getElementById('processContent'); },
    get faqList()       { return document.getElementById('faqList'); },
    get toastContainer(){ return document.getElementById('toastContainer'); },
    get usecasesTrack() { return document.getElementById('usecasesTrack'); },
  };

  /* ─── UTILITIES ─── */
  const CHECK_ICON = `<svg class="check-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#1E3A8A"/><path d="M8 12.5L10.5 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`;

  /* ══════════════════════════════════════════════
     1. IMAGE CAROUSEL
  ══════════════════════════════════════════════ */

  /**
   * Render thumbnail strip from slide data.
   * Called once on init.
   */
  function renderThumbnails(slides) {
    const track = el.thumbsTrack;
    if (!track) return;

    track.innerHTML = slides.map((s, i) => `
      <button
        class="thumb-btn${i === 0 ? ' active' : ''}"
        data-index="${i}"
        role="tab"
        aria-label="View image ${i + 1}"
        aria-selected="${i === 0}"
      >
        <img src="${s.src}" alt="${s.alt}" loading="lazy" draggable="false" />
      </button>
    `).join('');
  }

  /**
   * Update carousel to show target slide.
   * Swaps main image src with a smooth fade.
   */
  function updateCarouselSlide(index, slides) {
    const img    = el.mainImg;
    const thumbs = el.thumbsTrack ? el.thumbsTrack.querySelectorAll('.thumb-btn') : [];
    const slide  = slides[index];
    if (!img || !slide) return;

    // Fade out → swap → fade in
    img.style.opacity = '0';
    setTimeout(() => {
      img.src           = slide.src;
      img.alt           = slide.alt;
      img.style.opacity = '1';
    }, 180);

    // Update thumbnails
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === index);
      t.setAttribute('aria-selected', i === index);
    });
  }

  /* ══════════════════════════════════════════════
     2. ZOOM LENS + PREVIEW PANEL
     Zoom lens moves with cursor inside the main image.
     Zoom preview panel displays a magnified region
     to the right of the carousel (Figma spec).
  ══════════════════════════════════════════════ */

  const LENS_SIZE   = 120; // px — size of the moving crosshair lens
  const ZOOM_FACTOR = 2.5; // magnification multiplier

  /**
   * Position zoom lens and update preview panel.
   * @param {MouseEvent} e
   */
  function updateZoom(e) {
    const img     = el.mainImg;
    const lens    = el.zoomLens;
    const preview = el.zoomPreview;
    const prevImg = el.zoomPreviewImg;
    if (!img || !lens || !preview || !prevImg || !img.complete) return;

    const rect    = img.getBoundingClientRect();
    const wrapRect= el.carouselMain.getBoundingClientRect();

    // Cursor position relative to the image
    let cx = e.clientX - rect.left;
    let cy = e.clientY - rect.top;

    // Clamp so lens stays inside image
    const halfLens = LENS_SIZE / 2;
    cx = Math.max(halfLens, Math.min(cx, rect.width  - halfLens));
    cy = Math.max(halfLens, Math.min(cy, rect.height - halfLens));

    // Position the lens
    lens.style.cssText = `
      display: block;
      width: ${LENS_SIZE}px;
      height: ${LENS_SIZE}px;
      left: ${cx - halfLens}px;
      top:  ${cy - halfLens}px;
    `;

    // Calculate background position for zoom preview
    const scaleX  = img.naturalWidth  / rect.width;
    const scaleY  = img.naturalHeight / rect.height;
    const bgX     = -(cx * scaleX * ZOOM_FACTOR - preview.offsetWidth  / 2);
    const bgY     = -(cy * scaleY * ZOOM_FACTOR - preview.offsetHeight / 2);
    const bgW     = img.naturalWidth  * ZOOM_FACTOR;
    const bgH     = img.naturalHeight * ZOOM_FACTOR;

    // Show preview to the right of carousel
    prevImg.style.cssText = `
      width:  ${bgW}px;
      height: ${bgH}px;
      transform: translate(${bgX}px, ${bgY}px);
    `;

    if (prevImg.src !== img.src) prevImg.src = img.src;
    preview.classList.add('active');
  }

  /** Hide both zoom lens and preview panel. */
  function hideZoom() {
    const lens    = el.zoomLens;
    const preview = el.zoomPreview;
    if (lens)    lens.style.display = 'none';
    if (preview) preview.classList.remove('active');
  }

  /* ══════════════════════════════════════════════
     3. STICKY BAR
     Slides down from above the nav on scroll,
     slides back up when user scrolls to top.
  ══════════════════════════════════════════════ */

  /**
   * Show or hide the sticky product bar.
   * @param {boolean} show
   */
  function setStickyBar(show) {
    const bar = el.stickyBar;
    if (!bar) return;
    bar.classList.toggle('visible', show);
    bar.setAttribute('aria-hidden', String(!show));
  }

  /* ══════════════════════════════════════════════
     4. USE CASES CAROUSEL
  ══════════════════════════════════════════════ */

  /**
   * Render use-case cards into the horizontal scroll track.
   */
  function renderUseCases(useCases) {
    const track = el.usecasesTrack;
    if (!track) return;

    track.innerHTML = useCases.map(uc => `
      <article class="use-case-card">
        <div class="use-case-img">
          <img src="${uc.img}" alt="${uc.title}" loading="lazy" />
        </div>
        <div class="use-case-body">
          <h3>${uc.title}</h3>
          <p>${uc.desc}</p>
        </div>
      </article>
    `).join('');
  }

  /**
   * Scroll use-cases track one card.
   * @param {'prev'|'next'} dir
   */
  function scrollUseCases(dir) {
    const track = el.usecasesTrack;
    if (!track) return;
    const card   = track.querySelector('.use-case-card');
    const amount = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  }

  /* ══════════════════════════════════════════════
     5. PROCESS TABS
  ══════════════════════════════════════════════ */

  /**
   * Render tab buttons and content panels from model data.
   * Called once on init.
   */
  function renderProcessTabs(tabs) {
    const tabsEl    = el.processTabs;
    const contentEl = el.processContent;
    if (!tabsEl || !contentEl) return;

    tabsEl.innerHTML = tabs.map((t, i) => `
      <button
        class="process-tab${i === 0 ? ' active' : ''}"
        role="tab"
        aria-selected="${i === 0}"
        aria-controls="panel-${t.id}"
        id="tab-${t.id}"
        data-tab="${t.id}"
      >${t.label}</button>
    `).join('');

    contentEl.innerHTML = tabs.map((t, i) => `
      <div
        class="process-panel${i === 0 ? ' active' : ''}"
        role="tabpanel"
        id="panel-${t.id}"
        aria-labelledby="tab-${t.id}"
        ${i !== 0 ? 'hidden' : ''}
      >
        <div class="process-panel-inner">
          <div class="process-text">
            <h3>${t.title}</h3>
            <p>${t.desc}</p>
            <ul class="process-points">
              ${t.points.map(p => `<li>${CHECK_ICON}${p}</li>`).join('')}
            </ul>
          </div>
          <div class="process-img">
            <img src="${t.img}" alt="${t.label}" loading="lazy" />
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Switch active process tab.
   * @param {string} tabId
   */
  function activateProcessTab(tabId) {
    const tabsEl    = el.processTabs;
    const contentEl = el.processContent;
    if (!tabsEl || !contentEl) return;

    tabsEl.querySelectorAll('.process-tab').forEach(t => {
      const active = t.dataset.tab === tabId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });

    contentEl.querySelectorAll('.process-panel').forEach(p => {
      const active = p.id === `panel-${tabId}`;
      p.classList.toggle('active', active);
      active ? p.removeAttribute('hidden') : p.setAttribute('hidden', '');
    });
  }

  /* ══════════════════════════════════════════════
     6. FAQ ACCORDION
  ══════════════════════════════════════════════ */

  /**
   * Render FAQ accordion items from model data.
   * Called once on init.
   */
  function renderFAQs(faqs) {
    const list = el.faqList;
    if (!list) return;

    list.innerHTML = faqs.map((f, i) => `
      <div class="faq-item${i === 0 ? ' open' : ''}" data-index="${i}">
        <button
          class="faq-question"
          aria-expanded="${i === 0}"
          aria-controls="faq-ans-${i}"
          id="faq-q-${i}"
        >
          <span>${f.q}</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path class="faq-chevron" d="${i === 0 ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="faq-answer" id="faq-ans-${i}" role="region" aria-labelledby="faq-q-${i}">
          <p>${f.a}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Toggle FAQ item open or closed.
   * @param {number} clickedIndex
   * @param {boolean} isCurrentlyOpen
   */
  function toggleFAQ(clickedIndex, isCurrentlyOpen) {
    const list  = el.faqList;
    if (!list) return;

    list.querySelectorAll('.faq-item').forEach((item, i) => {
      const shouldBeOpen = i === clickedIndex && !isCurrentlyOpen;
      item.classList.toggle('open', shouldBeOpen);

      const btn    = item.querySelector('button');
      const path   = item.querySelector('.faq-chevron');
      if (btn)  btn.setAttribute('aria-expanded', String(shouldBeOpen));
      if (path) path.setAttribute('d', shouldBeOpen ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9');
    });
  }

  /* ══════════════════════════════════════════════
     7. MODALS
  ══════════════════════════════════════════════ */

  /** Open a modal by its DOM id. */
  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = overlay.querySelector('input, button:not(.modal-close), textarea, select');
      if (focusable) focusable.focus();
    });
  }

  /** Close a modal by its DOM id. */
  function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /** Close every open modal. */
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.visible').forEach(m => {
      m.classList.remove('visible');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════
     8. MOBILE MENU
  ══════════════════════════════════════════════ */

  /** Toggle mobile hamburger menu open/closed. */
  function toggleMobileMenu(open) {
    const menu = document.getElementById('mobileMenu');
    const btn  = document.getElementById('hamburger');
    if (!menu || !btn) return;

    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';

    // Animate spans to X shape
    const spans = btn.querySelectorAll('span');
    if (spans.length === 3) {
      spans[0].style.transform = open ? 'translateY(8px) rotate(45deg)'   : '';
      spans[1].style.opacity   = open ? '0'                                : '1';
      spans[2].style.transform = open ? 'translateY(-8px) rotate(-45deg)' : '';
    }
  }

  /* ══════════════════════════════════════════════
     9. TOAST NOTIFICATIONS
  ══════════════════════════════════════════════ */

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration ms
   */
  function showToast(message, type = 'success', duration = 4500) {
    const container = el.toastContainer;
    if (!container) return;

    const id   = 'toast-' + Date.now();
    const bg   = { success: '#059669', error: '#DC2626', info: '#1E3A8A' };
    const icon = { success: 'M20 6L9 17L4 12', error: 'M18 6L6 18M6 6L18 18', info: 'M12 8v4M12 16h.01' };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id        = id;
    toast.setAttribute('role', 'alert');
    toast.style.background = bg[type];
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="${icon[type]}" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${message}</span>
      <button class="toast-close" aria-label="Dismiss">×</button>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    const timer = setTimeout(() => _dismissToast(id), duration);
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timer);
      _dismissToast(id);
    });
  }

  function _dismissToast(id) {
    const t = document.getElementById(id);
    if (!t) return;
    t.classList.remove('show');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }

  /* ══════════════════════════════════════════════
     10. FORM FIELD VALIDATION FEEDBACK
  ══════════════════════════════════════════════ */

  /** Mark a field as invalid with an error message. */
  function setFieldError(field, message) {
    if (!field) return;
    field.classList.add('field-error');
    let errEl = field.parentNode.querySelector('.field-err-msg');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-err-msg';
      errEl.setAttribute('role', 'alert');
      field.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
    field.focus();
  }

  /** Clear validation error from a field. */
  function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('field-error');
    const errEl = field.parentNode.querySelector('.field-err-msg');
    if (errEl) errEl.remove();
  }

  /** Reset a form to blank state. */
  function resetForm(form) {
    if (!form) return;
    form.reset();
    form.querySelectorAll('.field-error').forEach(f => f.classList.remove('field-error'));
    form.querySelectorAll('.field-err-msg').forEach(e => e.remove());
  }

  /* ─── PUBLIC API ─── */
  return {
    el,
    renderThumbnails,
    updateCarouselSlide,
    updateZoom,
    hideZoom,
    setStickyBar,
    renderUseCases,
    scrollUseCases,
    renderProcessTabs,
    activateProcessTab,
    renderFAQs,
    toggleFAQ,
    openModal,
    closeModal,
    closeAllModals,
    toggleMobileMenu,
    showToast,
    setFieldError,
    clearFieldError,
    resetForm,
  };

})();