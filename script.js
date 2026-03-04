/**
 * ============================================================
 * MANGALAM HDPE PIPES — script.js
 * Professional, Premium, 2026-ready JavaScript
 * Features: Sticky Header, Image Carousel, Zoom, Modals, Toast
 * ============================================================
 */

'use strict';

/* ──────────────────────────────────────────────
   1. DATA — Carousel Images & Use Cases
────────────────────────────────────────────── */

const carouselImages = [
  {
    src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
    alt: 'HDPE pipes coiled for industrial use',
  },
  {
    src: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop',
    alt: 'Underground pipeline infrastructure installation',
  },
  {
    src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    alt: 'Workers installing industrial pipeline',
  },
  {
    src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
    alt: 'Industrial pipe manufacturing close-up',
  },
  {
    src: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=600&fit=crop',
    alt: 'Heavy duty pipeline fittings and joints',
  },
];

const useCasesData = [
  {
    title: 'Fishnet Manufacturing',
    desc: 'High-performance twisting solutions for packaging yarn, strapping materials, and reinforcement threads used in modern packaging applications.',
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=800&fit=crop',
  },
  {
    title: 'Agriculture Irrigation',
    desc: 'Reliable water distribution systems for large-scale agricultural fields ensuring consistent flow and minimal pressure loss over long distances.',
    img: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=800&fit=crop',
  },
  {
    title: 'Municipal Water Supply',
    desc: 'Certified safe for potable water transport. Trusted by municipalities across India for city-wide water distribution infrastructure.',
    img: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600&h=800&fit=crop',
  },
  {
    title: 'Industrial Drainage',
    desc: 'Superior chemical resistance makes these pipes ideal for industrial effluent and drainage systems in manufacturing plants.',
    img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=800&fit=crop',
  },
  {
    title: 'Mining Operations',
    desc: 'Built to handle extreme pressure and abrasive materials in underground mining pipelines with 50+ year service life.',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=800&fit=crop',
  },
  {
    title: 'Gas Distribution',
    desc: 'PE100 rated pipes approved for natural gas and LPG distribution networks in urban and semi-urban infrastructure projects.',
    img: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=800&fit=crop',
  },
];


/* ──────────────────────────────────────────────
   2. CAROUSEL — Build Thumbnails & Logic
────────────────────────────────────────────── */

let currentSlide = 0;

/**
 * Renders carousel thumbnails into the DOM
 */
function buildCarousel() {
  const thumbsContainer = document.getElementById('carouselThumbs');
  if (!thumbsContainer) return;

  thumbsContainer.innerHTML = '';

  carouselImages.forEach((img, index) => {
    const btn = document.createElement('button');
    btn.className = 'thumb-item' + (index === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `View image ${index + 1}: ${img.alt}`);

    const thumbnail = document.createElement('img');
    thumbnail.src = img.src;
    thumbnail.alt = img.alt;
    thumbnail.loading = 'lazy';

    btn.appendChild(thumbnail);
    btn.addEventListener('click', () => goToSlide(index));
    thumbsContainer.appendChild(btn);
  });
}

/**
 * Navigate to a specific carousel slide
 * @param {number} index - Target slide index
 */
function goToSlide(index) {
  const mainImg = document.getElementById('mainCarouselImg');
  const thumbs = document.querySelectorAll('.thumb-item');
  const zoomPreviewImg = document.getElementById('zoomPreviewImg');

  if (!mainImg) return;

  // Fade transition
  mainImg.style.opacity = '0';
  setTimeout(() => {
    currentSlide = (index + carouselImages.length) % carouselImages.length;
    mainImg.src = carouselImages[currentSlide].src;
    mainImg.alt = carouselImages[currentSlide].alt;
    if (zoomPreviewImg) zoomPreviewImg.src = carouselImages[currentSlide].src;
    mainImg.style.opacity = '1';
  }, 180);

  // Update thumbnails
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentSlide);
    thumb.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
  });
}

/**
 * Initialize carousel navigation arrows
 */
function initCarouselArrows() {
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
}

/**
 * Keyboard navigation for carousel
 */
function initCarouselKeyboard() {
  document.addEventListener('keydown', (e) => {
    const focused = document.activeElement;
    const isOnCarousel = focused && focused.closest('#carouselWrapper');
    if (!isOnCarousel) return;

    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  });
}


/* ──────────────────────────────────────────────
   3. IMAGE ZOOM — Lens + Preview Panel
────────────────────────────────────────────── */

/**
 * Initializes hover zoom functionality on the main carousel image
 */
function initImageZoom() {
  const carouselMain = document.getElementById('carouselMain');
  const zoomLens     = document.getElementById('zoomLens');
  const zoomPreview  = document.getElementById('zoomPreview');
  const zoomImg      = document.getElementById('zoomPreviewImg');
  const mainImg      = document.getElementById('mainCarouselImg');

  if (!carouselMain || !zoomLens || !zoomPreview || !zoomImg || !mainImg) return;

  // Zoom ratio (how much to magnify)
  const ZOOM_RATIO = 3;

  // Lens size (px)
  const LENS_W = 120;
  const LENS_H = 120;

  // Set lens size
  zoomLens.style.width  = LENS_W + 'px';
  zoomLens.style.height = LENS_H + 'px';

  /**
   * Update zoom preview based on cursor position
   * @param {MouseEvent} e
   */
  function onMouseMove(e) {
    const rect   = carouselMain.getBoundingClientRect();
    const imgEl  = mainImg;

    // Cursor position relative to image
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp lens position so it stays within image bounds
    let lensX = x - LENS_W / 2;
    let lensY = y - LENS_H / 2;
    lensX = Math.max(0, Math.min(lensX, rect.width - LENS_W));
    lensY = Math.max(0, Math.min(lensY, rect.height - LENS_H));

    // Position the lens
    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top  = lensY + 'px';

    // Calculate zoom preview image position
    const previewW = zoomPreview.offsetWidth;
    const previewH = zoomPreview.offsetHeight;

    const bgX = -(lensX / rect.width)  * imgEl.naturalWidth  * (previewW / (LENS_W / ZOOM_RATIO));
    const bgY = -(lensY / rect.height) * imgEl.naturalHeight * (previewH / (LENS_H / ZOOM_RATIO));
    const bgW  = imgEl.naturalWidth  * ZOOM_RATIO;
    const bgH  = imgEl.naturalHeight * ZOOM_RATIO;

    // Use CSS background for zoom preview (better performance)
    zoomPreview.style.backgroundImage    = `url(${mainImg.src})`;
    zoomPreview.style.backgroundSize     = `${bgW}px ${bgH}px`;
    zoomPreview.style.backgroundPosition = `${bgX}px ${bgY}px`;
    zoomPreview.style.backgroundRepeat   = 'no-repeat';

    // Hide the <img> tag inside since we use background
    if (zoomImg) zoomImg.style.display = 'none';
  }

  carouselMain.addEventListener('mouseenter', () => {
    zoomLens.style.display   = 'block';
    zoomPreview.classList.add('active');
    zoomPreview.setAttribute('aria-hidden', 'false');
  });

  carouselMain.addEventListener('mousemove', onMouseMove);

  carouselMain.addEventListener('mouseleave', () => {
    zoomLens.style.display = 'none';
    zoomPreview.classList.remove('active');
    zoomPreview.setAttribute('aria-hidden', 'true');
  });
}


/* ──────────────────────────────────────────────
   4. STICKY BAR — Appears after first fold
────────────────────────────────────────────── */

/**
 * Show/hide sticky product bar based on scroll position
 */
function initStickyBar() {
  const stickyBar   = document.getElementById('stickyBar');
  const heroSection = document.getElementById('heroSection');
  const mainNav     = document.getElementById('mainNav');

  if (!stickyBar || !heroSection) return;

  let ticking = false;

  function updateStickyBar() {
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    const navH       = mainNav ? mainNav.offsetHeight : 72;

    // Show sticky bar when hero bottom scrolls above the viewport fold
    if (heroBottom < navH + 20) {
      stickyBar.classList.add('visible');
      stickyBar.setAttribute('aria-hidden', 'false');
    } else {
      stickyBar.classList.remove('visible');
      stickyBar.setAttribute('aria-hidden', 'true');
    }

    // Add shadow to main nav when scrolled
    if (window.scrollY > 10) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateStickyBar);
      ticking = true;
    }
  }, { passive: true });
}


/* ──────────────────────────────────────────────
   5. USE CASES CAROUSEL — Horizontal Scroll
────────────────────────────────────────────── */

/**
 * Build use case cards and inject into the DOM
 */
function buildUseCases() {
  const track = document.getElementById('usecasesTrack');
  if (!track) return;

  track.innerHTML = '';

  useCasesData.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'usecase-card';
    card.setAttribute('aria-label', item.title);

    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}" loading="lazy" />
      <div class="usecase-overlay">
        <h3 class="usecase-title">${item.title}</h3>
        <p class="usecase-desc">${item.desc}</p>
      </div>
    `;

    track.appendChild(card);
  });
}

/**
 * Initialize use cases carousel scroll buttons
 */
function initUseCasesArrows() {
  const track     = document.getElementById('usecasesTrack');
  const leftBtn   = document.getElementById('usecasesLeft');
  const rightBtn  = document.getElementById('usecasesRight');

  if (!track || !leftBtn || !rightBtn) return;

  const SCROLL_AMOUNT = 320; // px per click

  leftBtn.addEventListener('click', () => {
    track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  });
}


/* ──────────────────────────────────────────────
   6. MOBILE NAVIGATION — Hamburger Toggle
────────────────────────────────────────────── */

/**
 * Toggle mobile navigation menu
 */
function initMobileNav() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}


/* ──────────────────────────────────────────────
   7. MODALS — Open, Close, Backdrop, Keyboard
────────────────────────────────────────────── */

/**
 * Open a modal by its ID
 * @param {string} modalId - The ID of the modal element
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scroll

  // Focus first input
  const firstInput = modal.querySelector('input, select, button');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

/**
 * Close a modal by its ID
 * @param {string} modalId - The ID of the modal element
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Close modal when clicking backdrop (outside modal box)
 */
function initModalBackdropClose() {
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });
}

/**
 * Close modal with Escape key
 */
function initModalEscapeKey() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach((modal) => {
        closeModal(modal.id);
      });
    }
  });
}


/* ──────────────────────────────────────────────
   8. FORM SUBMISSION — Toast Notification
────────────────────────────────────────────── */

/**
 * Handle form submission — show success toast
 * @param {Event} event - Form submit event
 * @param {string} modalId - Modal to close after submit
 */
function handleFormSubmit(event, modalId) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Button loading state
  if (submitBtn) {
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
  }

  // Simulate API call delay
  setTimeout(() => {
    closeModal(modalId);
    form.reset();

    if (submitBtn) {
      submitBtn.disabled = false;
    }

    showToast('✅ Your request was submitted successfully! We\'ll reach out shortly.');
  }, 1200);
}

/**
 * Show a toast notification message
 * @param {string} message - Message to display
 */
function showToast(message) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');
  toast.setAttribute('aria-hidden', 'false');

  // Auto-hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.setAttribute('aria-hidden', 'true');
  }, 4000);
}


/* ──────────────────────────────────────────────
   9. INIT — Run everything on DOM ready
────────────────────────────────────────────── */

/**
 * Main initialization function — runs when DOM is ready
 */
function init() {
  // Build dynamic content
  buildCarousel();
  buildUseCases();

  // Initialize all features
  initCarouselArrows();
  initCarouselKeyboard();
  initImageZoom();
  initStickyBar();
  initUseCasesArrows();
  initMobileNav();
  initModalBackdropClose();
  initModalEscapeKey();

  // Set initial zoom preview image
  const zoomPreviewImg = document.getElementById('zoomPreviewImg');
  if (zoomPreviewImg && carouselImages.length > 0) {
    zoomPreviewImg.src = carouselImages[0].src;
  }
}

// Wait for full DOM before initializing
document.addEventListener('DOMContentLoaded', init);

/* ──────────────────────────────────────────────
   10. MANUFACTURING PROCESS TABS
────────────────────────────────────────────── */
function initProcessTabs() {
  const tabs = document.querySelectorAll('.process-tab');
  const panels = document.querySelectorAll('.process-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const target = document.querySelector('[data-panel="' + tab.dataset.tab + '"]');
      if (target) target.classList.add('active');
    });
  });
}

/* ──────────────────────────────────────────────
   11. FAQ ACCORDION
────────────────────────────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-question');
        if (b) b.setAttribute('aria-expanded','false');
        const icon = i.querySelector('.faq-icon path');
        if (icon) icon.setAttribute('d','M6 9L12 15L18 9');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        const icon = item.querySelector('.faq-icon path');
        if (icon) icon.setAttribute('d','M18 15L12 9L6 15');
      }
    });
  });
}

// Add to init
document.addEventListener('DOMContentLoaded', () => {
  initProcessTabs();
  initFAQ();
});