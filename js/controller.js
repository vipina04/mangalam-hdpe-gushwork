/**
 * ============================================================
 *  CONTROLLER — Event Handling & App Orchestration
 *  Connects Model ↔ View. Handles all user interactions.
 *  The only layer allowed to call both Model and View APIs.
 * ============================================================
 */

const AppController = (() => {

  /* ─── private timers & refs ─── */
  let _carouselTimer  = null;
  let _rafScheduled   = false;

  /* ══════════════════════════════════════════════
     1. RESPONSIVE PADDING
     Applies Figma-spec padding as CSS custom properties,
     so every section auto-adjusts on window resize.
  ══════════════════════════════════════════════ */

  function _applyResponsivePadding() {
    const { paddingInline, paddingBlock } = AppModel.getCurrentPadding();
    const root = document.documentElement;
    root.style.setProperty('--section-padding-inline', paddingInline + 'px');
    root.style.setProperty('--section-padding-block',  paddingBlock  + 'px');
  }

  function initResponsive() {
    _applyResponsivePadding();
    window.addEventListener('resize', _debounce(_applyResponsivePadding, 80), { passive: true });
  }

  /* ══════════════════════════════════════════════
     2. IMAGE CAROUSEL + ZOOM
  ══════════════════════════════════════════════ */

  function initCarousel() {
    const { slides } = AppModel;

    // Render thumbnail strip from model data
    AppView.renderThumbnails(slides);

    // Prev / Next arrow buttons
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener('click', () => _navigate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => _navigate(+1));

    // Thumbnail click (event delegation — one listener)
    const thumbsTrack = document.getElementById('carouselThumbs');
    if (thumbsTrack) {
      thumbsTrack.addEventListener('click', e => {
        const btn = e.target.closest('.thumb-btn');
        if (btn) _goToSlide(parseInt(btn.dataset.index, 10));
      });
    }

    // Touch swipe on main image
    const carouselMain = document.getElementById('carouselMain');
    if (carouselMain) {
      _attachSwipe(carouselMain, dir => _navigate(dir === 'left' ? 1 : -1));
      // Keyboard arrows (when carousel is focused)
      carouselMain.setAttribute('tabindex', '0');
      carouselMain.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { _navigate(-1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { _navigate(+1); e.preventDefault(); }
      });
    }

    // Zoom: mousemove + mouseleave on carouselMain
    if (carouselMain) {
      carouselMain.addEventListener('mousemove', e => AppView.updateZoom(e));
      carouselMain.addEventListener('mouseleave', () => AppView.hideZoom());
    }

    // Auto-play
    _startAutoPlay();
  }

  function _navigate(delta) {
    const total   = AppModel.slides.length;
    const current = AppModel.getState('activeSlide');
    const next    = (current + delta + total) % total;
    _goToSlide(next);
  }

  function _goToSlide(index) {
    AppModel.setState('activeSlide', index);
    AppView.updateCarouselSlide(index, AppModel.slides);
    _resetAutoPlay();
  }

  function _startAutoPlay() {
    _carouselTimer = setInterval(() => _navigate(+1), 5000);
  }

  function _resetAutoPlay() {
    clearInterval(_carouselTimer);
    _startAutoPlay();
  }

  function _attachSwipe(el, cb) {
    let startX = 0;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) cb(diff > 0 ? 'left' : 'right');
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     3. STICKY BAR
     • Appears when user scrolls PAST the hero section fold
     • Disappears when user scrolls BACK to top
     • Slides from above the nav (position: fixed; top: 0)
     • Smooth CSS transition (translateY)
  ══════════════════════════════════════════════ */

  function initStickyBar() {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection) return;

    // Bind sticky bar CTA buttons (already in HTML)
    const stickyQuoteBtn = document.getElementById('sticky-quote-btn');
    const stickySpecsBtn = document.getElementById('sticky-specs-btn');
    if (stickyQuoteBtn) stickyQuoteBtn.addEventListener('click', () => _openModal('quoteModal'));
    if (stickySpecsBtn) stickySpecsBtn.addEventListener('click', () => _openModal('catalogueModal'));

    // rAF-throttled scroll handler for maximum performance
    window.addEventListener('scroll', () => {
      if (_rafScheduled) return;
      _rafScheduled = true;
      requestAnimationFrame(() => {
        const threshold  = heroSection.offsetHeight;
        const scrolled   = window.scrollY > threshold;
        const wasVisible = AppModel.getState('isStickyVisible');

        if (scrolled !== wasVisible) {
          AppModel.setState('isStickyVisible', scrolled);
          AppView.setStickyBar(scrolled);
        }
        _rafScheduled = false;
      });
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     4. USE CASES CAROUSEL
  ══════════════════════════════════════════════ */

  function initUseCases() {
    // Render cards from model
    AppView.renderUseCases(AppModel.useCases);

    // Arrow buttons
    const leftBtn  = document.getElementById('usecasesLeft');
    const rightBtn = document.getElementById('usecasesRight');
    if (leftBtn)  leftBtn.addEventListener('click',  () => AppView.scrollUseCases('prev'));
    if (rightBtn) rightBtn.addEventListener('click', () => AppView.scrollUseCases('next'));

    // Touch swipe
    const track = document.getElementById('usecasesTrack');
    if (track) _attachSwipe(track, dir => AppView.scrollUseCases(dir === 'left' ? 'next' : 'prev'));
  }

  /* ══════════════════════════════════════════════
     5. PROCESS TABS
  ══════════════════════════════════════════════ */

  function initProcessTabs() {
    AppView.renderProcessTabs(AppModel.processTabs);

    const tabsContainer = document.getElementById('processTabs');
    if (!tabsContainer) return;

    // Click — event delegation
    tabsContainer.addEventListener('click', e => {
      const tab = e.target.closest('.process-tab');
      if (!tab) return;
      AppModel.setState('activeTab', tab.dataset.tab);
      AppView.activateProcessTab(tab.dataset.tab);
    });

    // Keyboard: ← → arrow keys between tabs
    tabsContainer.addEventListener('keydown', e => {
      const tabs    = [...tabsContainer.querySelectorAll('.process-tab')];
      const current = tabs.findIndex(t => t === document.activeElement);
      if (current === -1) return;
      let next = -1;
      if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
      if (e.key === 'ArrowLeft')  next = (current - 1 + tabs.length) % tabs.length;
      if (next !== -1) { tabs[next].focus(); tabs[next].click(); e.preventDefault(); }
    });
  }

  /* ══════════════════════════════════════════════
     6. FAQ ACCORDION
  ══════════════════════════════════════════════ */

  function initFAQ() {
    AppView.renderFAQs(AppModel.faqs);

    const list = document.getElementById('faqList');
    if (!list) return;

    // Event delegation
    list.addEventListener('click', e => {
      const btn  = e.target.closest('.faq-question');
      if (!btn) return;
      const item   = btn.closest('.faq-item');
      const index  = parseInt(item.dataset.index, 10);
      const isOpen = item.classList.contains('open');
      AppModel.setState('openFaqIndex', isOpen ? -1 : index);
      AppView.toggleFAQ(index, isOpen);
    });
  }

  /* ══════════════════════════════════════════════
     7. MODALS (global delegation)
  ══════════════════════════════════════════════ */

  function initModals() {
    // data-modal="modalId" triggers open
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-modal]');
      if (trigger) _openModal(trigger.dataset.modal);
    });

    // data-close-modal="modalId" closes specific modal
    document.addEventListener('click', e => {
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) AppView.closeModal(closeBtn.dataset.closeModal);
    });

    // Click outside modal box closes
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        AppView.closeAllModals();
        AppModel.setState('openModal', null);
      }
    });

    // Escape key closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && AppModel.getState('openModal')) {
        AppView.closeAllModals();
        AppModel.setState('openModal', null);
      }
    });
  }

  function _openModal(id) {
    AppModel.setState('openModal', id);
    AppView.openModal(id);
  }

  /* ══════════════════════════════════════════════
     8. FORMS
  ══════════════════════════════════════════════ */

  function initForms() {
    // Quote / call-back modal form
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
      quoteForm.addEventListener('submit', _handleQuoteSubmit);
      quoteForm.querySelectorAll('input').forEach(f => {
        f.addEventListener('input', () => AppView.clearFieldError(f));
      });
    }

    // Catalogue email modal form
    const catalogueForm = document.getElementById('catalogueForm');
    if (catalogueForm) {
      catalogueForm.addEventListener('submit', _handleCatalogueSubmit);
    }

    // CTA section contact form
    const ctaForm = document.getElementById('ctaForm');
    if (ctaForm) {
      ctaForm.addEventListener('submit', _handleCTASubmit);
    }

    // Inline email catalogue banner
    const bannerBtn = document.getElementById('bannerCatalogueBtn');
    if (bannerBtn) {
      bannerBtn.addEventListener('click', _handleBannerEmail);
    }
  }

  function _handleQuoteSubmit(e) {
    e.preventDefault();
    const form   = e.target;
    const name   = form.querySelector('[name="fullName"]');
    const email  = form.querySelector('[name="email"]');
    let   valid  = true;

    if (!name || !name.value.trim()) {
      AppView.setFieldError(name, 'Please enter your full name');
      valid = false;
    }
    if (!email || !AppModel.validateEmail(email.value)) {
      AppView.setFieldError(email, 'Please enter a valid email address');
      valid = false;
    }
    if (!valid) return;

    _setLoading(form.querySelector('[type="submit"]'), true);
    setTimeout(() => {
      _setLoading(form.querySelector('[type="submit"]'), false);
      AppView.resetForm(form);
      AppView.closeModal('quoteModal');
      AppModel.setState('openModal', null);
      AppView.showToast('Request submitted! Our team will call you within 24 hours.', 'success');
    }, 1200);
  }

  function _handleCatalogueSubmit(e) {
    e.preventDefault();
    const form  = e.target;
    const email = form.querySelector('[name="catEmail"]');
    if (!email || !AppModel.validateEmail(email.value)) {
      AppView.setFieldError(email, 'Please enter a valid email address');
      return;
    }
    _setLoading(form.querySelector('[type="submit"]'), true);
    setTimeout(() => {
      _setLoading(form.querySelector('[type="submit"]'), false);
      AppView.resetForm(form);
      AppView.closeModal('catalogueModal');
      AppModel.setState('openModal', null);
      AppView.showToast('Catalogue is on its way to your inbox!', 'success');
    }, 1000);
  }

  function _handleCTASubmit(e) {
    e.preventDefault();
    const form  = e.target;
    const email = form.querySelector('[name="ctaEmail"]');
    if (!email || !AppModel.validateEmail(email.value)) {
      AppView.setFieldError(email, 'Please enter a valid email address');
      return;
    }
    _setLoading(form.querySelector('[type="submit"]'), true);
    setTimeout(() => {
      _setLoading(form.querySelector('[type="submit"]'), false);
      AppView.resetForm(form);
      AppView.showToast('Your inquiry has been sent! We\'ll get back to you soon.', 'success');
    }, 1200);
  }

  function _handleBannerEmail() {
    const input = document.getElementById('bannerEmailInput');
    if (!input || !AppModel.validateEmail(input.value)) {
      if (input) AppView.setFieldError(input, 'Please enter a valid email address');
      return;
    }
    _setLoading(document.getElementById('bannerCatalogueBtn'), true);
    setTimeout(() => {
      _setLoading(document.getElementById('bannerCatalogueBtn'), false);
      if (input) { AppView.clearFieldError(input); input.value = ''; }
      AppView.showToast('Catalogue will be emailed to you shortly!', 'success');
    }, 1000);
  }

  function _setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.dataset.orig = btn.textContent;
      btn.textContent  = 'Sending…';
    } else {
      btn.textContent = btn.dataset.orig || 'Submit';
    }
  }

  /* ══════════════════════════════════════════════
     9. MOBILE MENU
  ══════════════════════════════════════════════ */

  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    if (!hamburger) return;

    hamburger.addEventListener('click', () => {
      const isOpen = !AppModel.getState('isMobileMenuOpen');
      AppModel.setState('isMobileMenuOpen', isOpen);
      AppView.toggleMobileMenu(isOpen);
    });

    // Close on nav link click
    document.querySelectorAll('#mobileMenu a').forEach(link => {
      link.addEventListener('click', () => {
        AppModel.setState('isMobileMenuOpen', false);
        AppView.toggleMobileMenu(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (AppModel.getState('isMobileMenuOpen') &&
          !e.target.closest('#mobileMenu') &&
          !e.target.closest('#hamburger')) {
        AppModel.setState('isMobileMenuOpen', false);
        AppView.toggleMobileMenu(false);
      }
    });
  }

  /* ══════════════════════════════════════════════
     10. UTILITY
  ══════════════════════════════════════════════ */

  function _debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ══════════════════════════════════════════════
     INIT — Bootstrap the entire application
  ══════════════════════════════════════════════ */

  function init() {
    // 1. Apply responsive padding immediately before anything renders
    initResponsive();

    // 2. Dynamic components
    initCarousel();
    initUseCases();
    initProcessTabs();
    initFAQ();

    // 3. Interactions
    initStickyBar();
    initModals();
    initForms();
    initMobileMenu();

    // 4. Expose openModal & closeModal globally (used by HTML onclick attributes)
    window.openModal  = id => { AppModel.setState('openModal', id); AppView.openModal(id); };
    window.closeModal = id => { AppModel.setState('openModal', null); AppView.closeModal(id); };

    console.info('%c✅ Mangalam HDPE — MVC App Ready', 'color:#1E3A8A;font-weight:700;');
  }

  /* ─── Public API ─── */
  return { init };

})();

/* ─── Bootstrap on DOM ready ─── */
document.addEventListener('DOMContentLoaded', AppController.init);