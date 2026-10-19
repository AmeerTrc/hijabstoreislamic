/**
 * HIJAB STORE ISLAMIC - FRONTEND CORE APPLICATION
 * Multilingual Engine (pt, ar, fr), RTL Support, and E-Commerce Logic
 */

// Application State
const state = {
  lang: localStorage.getItem('hijabstore_lang') || 'pt',
  products: [],
  filteredProducts: [],
  currentCategory: 'todos',
  searchQuery: '',
  currentSort: 'featured',
  cart: JSON.parse(localStorage.getItem('hijabstore_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('hijabstore_wishlist') || '[]'),
  activeProductModal: null,
  activeColor: null,
  activeQuantity: 1,
  config: {
    whatsappNumber: '',
    instagramUrl: '',
    tiktokUrl: ''
  },
  appliedCoupon: null
};

// Available coupons
const COUPONS = {
  'BEMVINDA10': { discount: 0.10, label: '10% OFF' },
  'ISLAMIC15': { discount: 0.15, label: '15% OFF' }
};

// Format currency in BRL (Real Brasileiro)
function formatBRL(amount) {
  return new Intl.NumberFormat(state.lang === 'ar' ? 'ar-EG' : (state.lang === 'fr' ? 'fr-FR' : 'pt-BR'), {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

// Helper to get localized product fields
function getProductField(product, field) {
  if (state.lang === 'ar') {
    return product[`${field}_ar`] || product[field];
  } else if (state.lang === 'fr') {
    return product[`${field}_fr`] || product[field];
  }
  return product[field];
}

// Current translation dictionary getter
function t() {
  return translations[state.lang] || translations.pt;
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  setLanguage(state.lang, false);
  initUIEvents();
  updateCartBadge();
  updateWishlistBadge();
  await loadStoreConfig();
  await loadProducts();
});

// Set Language & Direction
function setLanguage(lang, reloadUI = true) {
  if (!translations[lang]) lang = 'pt';
  state.lang = lang;
  localStorage.setItem('hijabstore_lang', lang);

  const dict = t();
  document.documentElement.lang = lang === 'ar' ? 'ar' : (lang === 'fr' ? 'fr' : 'pt-BR');
  document.documentElement.dir = dict.dir;

  // Update active state of language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-apply DOM translations
  applyStaticTranslations();

  if (reloadUI) {
    applyFilters();
    renderCart();
    if (state.activeProductModal) {
      openProductModal(state.activeProductModal.id);
    }
  }
}

// Translate all elements with data-i18n attributes
function applyStaticTranslations() {
  const dict = t();

  // Announcement
  const annEl = document.getElementById('announcement-text');
  if (annEl) annEl.innerHTML = dict.announcement;

  // Nav links
  const navKeys = ['home', 'catalog', 'niqabs', 'hijabs', 'abayas', 'khimars', 'prayer', 'about', 'contact'];
  navKeys.forEach(k => {
    const el = document.getElementById(`nav-${k}`);
    if (el) el.textContent = dict.nav[k];
  });

  // Hero
  const heroTag = document.getElementById('hero-tag');
  if (heroTag) heroTag.textContent = dict.hero.tag;
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) heroTitle.innerHTML = dict.hero.title;
  const heroDesc = document.getElementById('hero-desc');
  if (heroDesc) heroDesc.textContent = dict.hero.description;
  const heroBtnShop = document.getElementById('hero-btn-shop');
  if (heroBtnShop) heroBtnShop.textContent = dict.hero.btnShop;
  const heroBtnWa = document.getElementById('hero-btn-wa');
  if (heroBtnWa) heroBtnWa.textContent = dict.hero.btnWhatsApp;

  // Trust Strip
  const trustMap = [
    { title: 'trust-shipping-title', desc: 'trust-shipping-desc', tTitle: dict.trust.shippingTitle, tDesc: dict.trust.shippingDesc },
    { title: 'trust-fabrics-title', desc: 'trust-fabrics-desc', tTitle: dict.trust.fabricsTitle, tDesc: dict.trust.fabricsDesc },
    { title: 'trust-support-title', desc: 'trust-support-desc', tTitle: dict.trust.supportTitle, tDesc: dict.trust.supportDesc },
    { title: 'trust-security-title', desc: 'trust-security-desc', tTitle: dict.trust.securityTitle, tDesc: dict.trust.securityDesc }
  ];
  trustMap.forEach(item => {
    const titleEl = document.getElementById(item.title);
    if (titleEl) titleEl.textContent = item.tTitle;
    const descEl = document.getElementById(item.desc);
    if (descEl) descEl.textContent = item.tDesc;
  });

  // Departments
  const deptSubtitle = document.getElementById('dept-subtitle');
  if (deptSubtitle) deptSubtitle.textContent = dict.departments.subtitle;
  const deptTitle = document.getElementById('dept-title');
  if (deptTitle) deptTitle.textContent = dict.departments.title;
  const deptDesc = document.getElementById('dept-desc');
  if (deptDesc) deptDesc.textContent = dict.departments.desc;

  // Catalog Controls
  const catalogSubtitle = document.getElementById('catalog-subtitle');
  if (catalogSubtitle) catalogSubtitle.textContent = dict.catalog.subtitle;
  const catalogTitle = document.getElementById('catalog-title');
  if (catalogTitle) catalogTitle.textContent = dict.catalog.title;
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = dict.catalog.searchPlaceholder;
  const sortLabel = document.getElementById('sort-label');
  if (sortLabel) sortLabel.textContent = dict.catalog.sortLabel;

  // Sort Options
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.options[0].text = dict.catalog.sortFeatured;
    sortSelect.options[1].text = dict.catalog.sortPriceAsc;
    sortSelect.options[2].text = dict.catalog.sortPriceDesc;
    sortSelect.options[3].text = dict.catalog.sortRating;
    sortSelect.options[4].text = dict.catalog.sortNew;
  }

  // Filter pills
  const pillMap = {
    'todos': dict.catalog.allProducts,
    'niqabs': dict.departments.catNiqabs,
    'hijabs': dict.departments.catHijabs,
    'khimars': dict.departments.catKhimars,
    'abayas': dict.departments.catAbayas,
    'vestidos': dict.departments.catDresses,
    'oracao': dict.departments.catPrayer,
    'acessorios': dict.departments.catAccessories
  };
  Object.keys(pillMap).forEach(cat => {
    const pill = document.querySelector(`.filter-pill[data-category="${cat}"]`);
    if (pill) pill.textContent = pillMap[cat];
  });

  // Promo Banner
  const promoBadge = document.getElementById('promo-badge');
  if (promoBadge) promoBadge.textContent = dict.promo.badge;
  const promoTitle = document.getElementById('promo-title');
  if (promoTitle) promoTitle.textContent = dict.promo.title;
  const promoDesc = document.getElementById('promo-desc');
  if (promoDesc) promoDesc.textContent = dict.promo.desc;
  const promoBtn = document.getElementById('promo-btn-text');
  if (promoBtn) promoBtn.textContent = dict.promo.btnChat;
  const couponTitle = document.getElementById('coupon-banner-title');
  if (couponTitle) couponTitle.textContent = dict.promo.couponTitle;
  const couponDesc = document.getElementById('coupon-banner-desc');
  if (couponDesc) couponDesc.textContent = dict.promo.couponDesc;
  const couponNotice = document.getElementById('coupon-banner-notice');
  if (couponNotice) couponNotice.textContent = dict.promo.couponNotice;

  // About Section
  const aboutSubtitle = document.getElementById('about-subtitle');
  if (aboutSubtitle) aboutSubtitle.textContent = dict.about.subtitle;
  const aboutTitle = document.getElementById('about-title');
  if (aboutTitle) aboutTitle.textContent = dict.about.title;
  const aboutP1 = document.getElementById('about-p1');
  if (aboutP1) aboutP1.innerHTML = dict.about.p1;
  const aboutP2 = document.getElementById('about-p2');
  if (aboutP2) aboutP2.textContent = dict.about.p2;
  const aboutFeat1 = document.getElementById('about-feat-1');
  if (aboutFeat1) aboutFeat1.textContent = dict.about.feat1;
  const aboutFeat2 = document.getElementById('about-feat-2');
  if (aboutFeat2) aboutFeat2.textContent = dict.about.feat2;
  const aboutFeat3 = document.getElementById('about-feat-3');
  if (aboutFeat3) aboutFeat3.textContent = dict.about.feat3;
  const aboutFeat4 = document.getElementById('about-feat-4');
  if (aboutFeat4) aboutFeat4.textContent = dict.about.feat4;

  // Social Sections
  const instaSubtitle = document.getElementById('insta-subtitle');
  if (instaSubtitle) instaSubtitle.textContent = dict.social.instaSubtitle;
  const instaDesc = document.getElementById('insta-desc');
  if (instaDesc) instaDesc.textContent = dict.social.instaDesc;
  document.querySelectorAll('.insta-overlay span').forEach(el => {
    el.textContent = dict.social.instaOverlay;
  });

  const tiktokSubtitle = document.getElementById('tiktok-subtitle');
  if (tiktokSubtitle) tiktokSubtitle.textContent = dict.social.tiktokSubtitle;
  const tiktokTitle = document.getElementById('tiktok-title');
  if (tiktokTitle) tiktokTitle.textContent = dict.social.tiktokTitle;
  const tiktokBtn = document.getElementById('tiktok-btn-text');
  if (tiktokBtn) tiktokBtn.textContent = dict.social.tiktokBtn;
  const ttCap1 = document.getElementById('tiktok-cap-1');
  if (ttCap1) ttCap1.innerHTML = dict.social.tiktok1;
  const ttCap2 = document.getElementById('tiktok-cap-2');
  if (ttCap2) ttCap2.innerHTML = dict.social.tiktok2;
  const ttCap3 = document.getElementById('tiktok-cap-3');
  if (ttCap3) ttCap3.innerHTML = dict.social.tiktok3;

  // Newsletter
  const nlTitle = document.getElementById('nl-title');
  if (nlTitle) nlTitle.textContent = dict.newsletter.title;
  const nlDesc = document.getElementById('nl-desc');
  if (nlDesc) nlDesc.textContent = dict.newsletter.desc;
  const nlEmail = document.getElementById('newsletter-email');
  if (nlEmail) nlEmail.placeholder = dict.newsletter.placeholder;
  const nlBtn = document.getElementById('nl-btn');
  if (nlBtn) nlBtn.textContent = dict.newsletter.btn;

  // Footer
  const footerDesc = document.getElementById('footer-brand-desc');
  if (footerDesc) footerDesc.textContent = dict.footer.brandDesc;
  const colTitle1 = document.getElementById('footer-col-1');
  if (colTitle1) colTitle1.textContent = dict.footer.collectionsTitle;
  const colTitle2 = document.getElementById('footer-col-2');
  if (colTitle2) colTitle2.textContent = dict.footer.serviceTitle;
  const colTitle3 = document.getElementById('footer-col-3');
  if (colTitle3) colTitle3.textContent = dict.footer.contactTitle;
  const footerHuman = document.getElementById('footer-support-human');
  if (footerHuman) footerHuman.textContent = dict.footer.supportHuman;
  const footerHours = document.getElementById('footer-hours');
  if (footerHours) footerHours.textContent = dict.footer.hours;
  const footerRights = document.getElementById('footer-rights');
  if (footerRights) footerRights.innerHTML = dict.footer.rights;
  const pixBadge = document.getElementById('pix-badge-text');
  if (pixBadge) pixBadge.textContent = dict.footer.pixBadge;

  // Floating WhatsApp
  const floatWa = document.getElementById('floating-whatsapp-text');
  if (floatWa) floatWa.textContent = dict.hero.btnWhatsApp;
}

// Load Store Configuration
async function loadStoreConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      state.config = { ...state.config, ...data };
      applyConfigToDOM();
    }
  } catch (err) {
    console.warn('Usando configuração local:', err);
  }
}

// Apply Social and Contact Config without creating fake links
function applyConfigToDOM() {
  const dict = t();

  // WhatsApp links
  const whatsappElements = document.querySelectorAll('.dynamic-whatsapp-link');
  whatsappElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.config.whatsappNumber && state.config.whatsappNumber.trim() !== '') {
        const text = state.lang === 'ar'
          ? 'السلام عليكم! أود الاستفسار عن منتجات متجر Hijab Store Islamic.'
          : (state.lang === 'fr'
            ? 'Bonjour ! Je souhaite obtenir des informations sur les produits de Hijab Store Islamic.'
            : 'Olá! Gostaria de tirar dúvidas sobre os produtos da Hijab Store Islamic.');
        window.open(`https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
      } else {
        showToast(dict.socialNotice);
      }
    });
  });

  // Instagram links
  const igElements = document.querySelectorAll('.dynamic-instagram-link');
  igElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.config.instagramUrl && state.config.instagramUrl.trim() !== '') {
        window.open(state.config.instagramUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast(dict.socialNotice);
      }
    });
  });

  // TikTok links
  const ttElements = document.querySelectorAll('.dynamic-tiktok-link');
  ttElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.config.tiktokUrl && state.config.tiktokUrl.trim() !== '') {
        window.open(state.config.tiktokUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast(dict.socialNotice);
      }
    });
  });
}

// Fetch products from API
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-medium-gray);">${t().catalog.loading}</div>`;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Falha ao carregar produtos');
    state.products = await res.json();
    state.filteredProducts = [...state.products];
    renderProducts();
  } catch (err) {
    console.error('Erro na requisição da API de produtos:', err);
    grid.innerHTML = `
      <div class="empty-catalog">
        <p>${t().catalog.emptyTitle}</p>
        <button class="btn-primary" style="margin-top: 14px;" onclick="loadProducts()">${t().catalog.btnClear}</button>
      </div>
    `;
  }
}

// Filter and Sort Products
function applyFilters() {
  let list = [...state.products];
  const dict = t();

  // Category filter
  if (state.currentCategory !== 'todos') {
    list = list.filter(p => p.category === state.currentCategory);
  }

  // Search filter
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => {
      const name = getProductField(p, 'name').toLowerCase();
      const desc = getProductField(p, 'description').toLowerCase();
      const fabric = getProductField(p, 'fabric').toLowerCase();
      const cat = getProductField(p, 'categoryName').toLowerCase();
      return name.includes(q) || desc.includes(q) || fabric.includes(q) || cat.includes(q);
    });
  }

  // Sort
  if (state.currentSort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.currentSort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.currentSort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (state.currentSort === 'new') {
    list.sort((a, b) => (b.isNew === true ? 1 : 0) - (a.isNew === true ? 1 : 0));
  }

  state.filteredProducts = list;
  renderProducts();
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countSpan = document.getElementById('catalog-results-count');
  const dict = t();

  if (countSpan) {
    countSpan.textContent = `${state.filteredProducts.length} ${state.filteredProducts.length === 1 ? dict.catalog.countSingle : dict.catalog.countPlural}`;
  }

  if (state.filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-catalog">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">${dict.catalog.emptyTitle}</h3>
        <p style="color: var(--color-medium-gray); margin-bottom: 16px;">${dict.catalog.emptyDesc}</p>
        <button class="btn-primary" onclick="resetFilters()">${dict.catalog.btnClear}</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.filteredProducts.map(product => {
    const isWishlisted = state.wishlist.includes(product.id);
    const localizedName = getProductField(product, 'name');
    const localizedCat = getProductField(product, 'categoryName');

    const swatchesHtml = (product.colors || []).slice(0, 4).map(c => {
      const colorName = state.lang === 'ar' ? (c.name_ar || c.name) : (state.lang === 'fr' ? (c.name_fr || c.name) : c.name);
      return `<span class="swatch-dot" style="background-color: ${c.hex};" title="${colorName}"></span>`;
    }).join('');

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-media">
          <img src="${product.image}" alt="${localizedName}" loading="lazy">
          
          <div class="card-badges">
            ${product.isNew ? `<span class="badge badge-new">${dict.catalog.badgeNew}</span>` : ''}
            ${product.isBestSeller ? `<span class="badge badge-bestseller">${dict.catalog.badgeBestSeller}</span>` : ''}
          </div>

          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  onclick="toggleWishlist('${product.id}')" 
                  aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button class="card-overlay-btn" onclick="openProductModal('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            ${dict.catalog.quickView}
          </button>
        </div>

        <div class="card-info">
          <span class="card-category">${localizedCat}</span>
          <h3 class="card-title" onclick="openProductModal('${product.id}')" style="cursor: pointer;">${localizedName}</h3>

          <div class="card-rating">
            <span>★</span> <strong>${product.rating.toFixed(1)}</strong>
            <span class="card-rating-count">(${product.reviewsCount})</span>
          </div>

          ${swatchesHtml ? `<div class="card-swatches">${swatchesHtml}</div>` : ''}

          <div class="card-bottom">
            <div class="card-price-wrapper">
              ${product.originalPrice ? `<span class="card-original-price">${formatBRL(product.originalPrice)}</span>` : ''}
              <div class="card-price">${formatBRL(product.price)}</div>
            </div>

            <button class="btn-add-cart" onclick="quickAddToCart('${product.id}')" title="${dict.catalog.addToBag}" aria-label="${dict.catalog.addToBag}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Quick View Modal
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeProductModal = product;
  state.activeQuantity = 1;
  state.activeColor = (product.colors && product.colors.length > 0) ? (state.lang === 'ar' ? (product.colors[0].name_ar || product.colors[0].name) : product.colors[0].name) : null;

  const dict = t();
  const modal = document.getElementById('product-modal');
  const backdrop = document.getElementById('modal-backdrop');

  const localizedName = getProductField(product, 'name');
  const localizedCat = getProductField(product, 'categoryName');
  const localizedDesc = getProductField(product, 'description');
  const localizedFabric = getProductField(product, 'fabric');
  const localizedDim = getProductField(product, 'dimensions');

  const galleryMain = document.getElementById('modal-main-img');
  galleryMain.src = product.image;
  galleryMain.alt = localizedName;

  const thumbsContainer = document.getElementById('modal-thumbs');
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  thumbsContainer.innerHTML = images.map((img, idx) => `
    <div class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="changeModalImage('${img}', this)">
      <img src="${img}" alt="${localizedName}">
    </div>
  `).join('');

  document.getElementById('modal-category').textContent = localizedCat;
  document.getElementById('modal-title').textContent = localizedName;
  document.getElementById('modal-price').textContent = formatBRL(product.price);
  
  const origPriceEl = document.getElementById('modal-original-price');
  if (product.originalPrice) {
    origPriceEl.textContent = formatBRL(product.originalPrice);
    origPriceEl.style.display = 'inline';
  } else {
    origPriceEl.style.display = 'none';
  }

  document.getElementById('modal-desc').textContent = localizedDesc;
  document.getElementById('modal-spec-label-fabric').textContent = dict.modal.fabricLabel;
  document.getElementById('modal-spec-fabric').textContent = localizedFabric;
  document.getElementById('modal-spec-label-dim').textContent = dict.modal.dimensionsLabel;
  document.getElementById('modal-spec-dimensions').textContent = localizedDim;
  document.getElementById('modal-spec-label-avail').textContent = dict.modal.availabilityLabel;
  document.getElementById('modal-spec-avail').textContent = dict.modal.inStock;
  document.getElementById('modal-colors-title').textContent = dict.modal.selectColor;
  document.getElementById('modal-btn-add-text').textContent = dict.modal.addToBag;
  document.getElementById('modal-btn-wa-text').textContent = dict.modal.buyWhatsApp;

  // Render colors
  const colorsContainer = document.getElementById('modal-colors');
  if (product.colors && product.colors.length > 0) {
    colorsContainer.innerHTML = product.colors.map((c, idx) => {
      const cName = state.lang === 'ar' ? (c.name_ar || c.name) : (state.lang === 'fr' ? (c.name_fr || c.name) : c.name);
      return `
        <button class="color-option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectModalColor('${cName}', this)">
          <span class="color-option-dot" style="background-color: ${c.hex};"></span>
          ${cName}
        </button>
      `;
    }).join('');
    document.getElementById('modal-colors-wrapper').style.display = 'block';
  } else {
    document.getElementById('modal-colors-wrapper').style.display = 'none';
  }

  document.getElementById('modal-qty-input').value = '1';

  modal.classList.add('active');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function changeModalImage(src, thumbEl) {
  document.getElementById('modal-main-img').src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

function selectModalColor(colorName, btnEl) {
  state.activeColor = colorName;
  document.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('selected'));
  btnEl.classList.add('selected');
}

function adjustModalQty(delta) {
  const input = document.getElementById('modal-qty-input');
  let val = parseInt(input.value, 10) + delta;
  if (val < 1) val = 1;
  if (val > 10) val = 10;
  input.value = val;
  state.activeQuantity = val;
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('active');
  document.getElementById('modal-backdrop').classList.remove('active');
  document.body.style.overflow = '';
}

// Add to Cart from Modal
function addModalProductToCart() {
  if (!state.activeProductModal) return;

  addToCart(
    state.activeProductModal.id,
    state.activeQuantity,
    state.activeColor
  );

  closeModal();
  openCart();
}

// Buy Direct via WhatsApp from Modal
function buyViaWhatsAppModal() {
  if (!state.activeProductModal) return;
  const dict = t();
  if (!state.config.whatsappNumber || state.config.whatsappNumber.trim() === '') {
    showToast(dict.socialNotice);
    return;
  }

  const p = state.activeProductModal;
  const localizedName = getProductField(p, 'name');
  const colorText = state.activeColor ? (state.lang === 'ar' ? ` - اللون: *${state.activeColor}*` : ` - Cor: *${state.activeColor}*`) : '';

  let message = '';
  if (state.lang === 'ar') {
    message = `السلام عليكم! أود شراء المنتج التالي:\n- *${localizedName}* (الكمية: ${state.activeQuantity})${colorText}\n- القيمة: ${formatBRL(p.price * state.activeQuantity)}\n\nيرجى إفادتي بخيارات الشحن وطريقة الدفع. شكراً لكم! ✨`;
  } else if (state.lang === 'fr') {
    message = `Bonjour ! Je souhaite commander :\n- *${localizedName}* (Quantité: ${state.activeQuantity})${colorText}\n- Total: ${formatBRL(p.price * state.activeQuantity)}\n\nMerci de m'indiquer les modalités d'expédition et de paiement. ✨`;
  } else {
    message = `Olá! Tenho interesse em comprar:\n- *${localizedName}* (Quantidade: ${state.activeQuantity})${colorText}\n- Valor: ${formatBRL(p.price * state.activeQuantity)}\n\nPoderia me informar as opções de frete e pagamento? ✨`;
  }
  
  const url = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Quick Add to Cart from Card
function quickAddToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const defaultColor = (product.colors && product.colors.length > 0)
    ? (state.lang === 'ar' ? (product.colors[0].name_ar || product.colors[0].name) : product.colors[0].name)
    : null;
  addToCart(productId, 1, defaultColor);

  const localizedName = getProductField(product, 'name');
  const toastMsg = state.lang === 'ar'
    ? `تمت إضافة "${localizedName}" إلى السلة!`
    : (state.lang === 'fr' ? `"${localizedName}" ajouté au panier !` : `"${localizedName}" adicionado à sacola!`);
  showToast(toastMsg);
}

// Core Cart Operations
function addToCart(productId, quantity = 1, color = null) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = state.cart.findIndex(item => item.id === productId && item.color === color);

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += quantity;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      name_ar: product.name_ar,
      name_fr: product.name_fr,
      price: product.price,
      image: product.image,
      categoryName: product.categoryName,
      color: color,
      quantity: quantity
    });
  }

  saveCart();
  renderCart();
  updateCartBadge();
}

function updateCartItemQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    renderCart();
    updateCartBadge();
  }
}

function removeCartItem(index) {
  if (state.cart[index]) {
    const item = state.cart[index];
    state.cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartBadge();

    const name = getProductField(item, 'name');
    const toastMsg = state.lang === 'ar'
      ? `تم حذف "${name}" من السلة.`
      : (state.lang === 'fr' ? `"${name}" retiré du panier.` : `"${name}" removido da sacola.`);
    showToast(toastMsg);
  }
}

function saveCart() {
  localStorage.setItem('hijabstore_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }
}

// Render Cart Drawer
function renderCart() {
  const dict = t();
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  const cartTitle = document.getElementById('cart-header-title');
  if (cartTitle) cartTitle.innerHTML = dict.cart.title;

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h4 style="font-family: var(--font-heading); margin-bottom: 8px;">${dict.cart.emptyTitle}</h4>
        <p style="font-size: 0.88rem; margin-bottom: 18px;">${dict.cart.emptyDesc}</p>
        <button class="btn-primary" onclick="closeCart()">${dict.cart.btnExplore}</button>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  body.innerHTML = state.cart.map((item, idx) => {
    const localizedName = getProductField(item, 'name');
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${localizedName}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${localizedName}</div>
          <div class="cart-item-meta">
            ${item.color ? `${item.color} • ` : ''}${formatBRL(item.price)}
          </div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button onclick="updateCartItemQty(${idx}, -1)" aria-label="Diminuir">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartItemQty(${idx}, 1)" aria-label="Aumentar">+</button>
            </div>
            <div class="cart-item-price">${formatBRL(item.price * item.quantity)}</div>
            <button class="cart-item-remove" onclick="removeCartItem(${idx})" title="Remover">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Calculations
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (state.appliedCoupon) {
    discount = subtotal * state.appliedCoupon.discount;
  }

  const shipping = subtotal >= 199 ? 0 : 25.00;
  const total = subtotal - discount + (shipping === 0 ? 0 : shipping);

  document.getElementById('cart-subtotal-label').textContent = dict.cart.subtotal;
  document.getElementById('cart-subtotal').textContent = formatBRL(subtotal);
  
  const discountRow = document.getElementById('cart-discount-row');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('cart-discount-label').textContent = dict.cart.discount;
    document.getElementById('cart-discount').textContent = `-${formatBRL(discount)}`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('cart-shipping-label').textContent = dict.cart.shipping;
  const shippingEl = document.getElementById('cart-shipping');
  if (shipping === 0) {
    shippingEl.innerHTML = `<span style="color: #2e7d32; font-weight: 700;">${dict.cart.freeShipping}</span>`;
  } else {
    shippingEl.textContent = formatBRL(shipping);
  }

  document.getElementById('cart-total-label').textContent = dict.cart.total;
  document.getElementById('cart-total').textContent = formatBRL(total);
  document.getElementById('coupon-input').placeholder = dict.cart.couponPlaceholder;
  document.getElementById('btn-apply-coupon').textContent = dict.cart.applyCoupon;
  document.getElementById('cart-checkout-btn-text').textContent = dict.cart.btnCheckout;
  document.getElementById('cart-checkout-notice').textContent = dict.cart.checkoutNotice;
}

function openCart() {
  renderCart();
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('modal-backdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('modal-backdrop').classList.remove('active');
  document.body.style.overflow = '';
}

// Coupon Application
function applyCoupon() {
  const dict = t();
  const input = document.getElementById('coupon-input');
  const code = (input.value || '').trim().toUpperCase();

  if (!code) {
    showToast(dict.cart.couponInvalid);
    return;
  }

  if (COUPONS[code]) {
    state.appliedCoupon = COUPONS[code];
    renderCart();
    showToast(dict.cart.couponSuccess);
    input.value = '';
  } else {
    showToast(dict.cart.couponInvalid);
  }
}

// Checkout via WhatsApp
function checkoutWhatsApp() {
  const dict = t();
  if (state.cart.length === 0) return;

  if (!state.config.whatsappNumber || state.config.whatsappNumber.trim() === '') {
    showToast(dict.socialNotice);
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = state.appliedCoupon ? (subtotal * state.appliedCoupon.discount) : 0;
  const shipping = subtotal >= 199 ? 0 : 25.00;
  const total = subtotal - discount + (shipping === 0 ? 0 : shipping);

  let msg = '';
  if (state.lang === 'ar') {
    msg = `🛍️ *طلب جديد - HIJAB STORE ISLAMIC*\n\nالسلام عليكم! أود إتمام شراء المنتجات التالية:\n\n`;
    state.cart.forEach((item, index) => {
      msg += `*${index + 1}. ${getProductField(item, 'name')}*\n`;
      if (item.color) msg += `   - اللون: ${item.color}\n`;
      msg += `   - الكمية: ${item.quantity} × ${formatBRL(item.price)}\n`;
      msg += `   - الإجمالي الفرعي: ${formatBRL(item.price * item.quantity)}\n\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*المجموع:* ${formatBRL(subtotal)}\n`;
    if (discount > 0) msg += `*الخصم:* -${formatBRL(discount)}\n`;
    msg += `*الشحن:* ${shipping === 0 ? 'مجاني' : formatBRL(shipping)}\n`;
    msg += `*الإجمالي النهائي:* ${formatBRL(total)}\n`;
    msg += `--------------------------------\n\nيرجى تأكيد تفاصيل الدفع والعنوان. بارك الله فيكم! ✨`;
  } else if (state.lang === 'fr') {
    msg = `🛍️ *NOUVELLE COMMANDE - HIJAB STORE ISLAMIC*\n\nBonjour ! Je souhaite finaliser la commande des articles suivants :\n\n`;
    state.cart.forEach((item, index) => {
      msg += `*${index + 1}. ${getProductField(item, 'name')}*\n`;
      if (item.color) msg += `   - Couleur: ${item.color}\n`;
      msg += `   - Qté: ${item.quantity} × ${formatBRL(item.price)}\n`;
      msg += `   - Sous-total: ${formatBRL(item.price * item.quantity)}\n\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*Sous-total:* ${formatBRL(subtotal)}\n`;
    if (discount > 0) msg += `*Remise:* -${formatBRL(discount)}\n`;
    msg += `*Livraison:* ${shipping === 0 ? 'GRATUITE' : formatBRL(shipping)}\n`;
    msg += `*TOTAL:* ${formatBRL(total)}\n`;
    msg += `--------------------------------\n\nMerci de me communiquer les modalités de règlement. ✨`;
  } else {
    msg = `🛍️ *NOVO PEDIDO - HIJAB STORE ISLAMIC*\n\nOlá! Gostaria de concluir a compra dos seguintes itens:\n\n`;
    state.cart.forEach((item, index) => {
      msg += `*${index + 1}. ${getProductField(item, 'name')}*\n`;
      if (item.color) msg += `   - Cor: ${item.color}\n`;
      msg += `   - Qtd: ${item.quantity}x | ${formatBRL(item.price)}\n`;
      msg += `   - Subtotal: ${formatBRL(item.price * item.quantity)}\n\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*Subtotal:* ${formatBRL(subtotal)}\n`;
    if (discount > 0) msg += `*Desconto:* -${formatBRL(discount)}\n`;
    msg += `*Frete:* ${shipping === 0 ? 'GRÁTIS' : formatBRL(shipping)}\n`;
    msg += `*TOTAL DO PEDIDO:* ${formatBRL(total)}\n`;
    msg += `--------------------------------\n\nPor favor, me confirme as opções para pagamento. Obrigada! ✨`;
  }

  const url = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Wishlist Functionality
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);
  const name = product ? getProductField(product, 'name') : '';

  if (index > -1) {
    state.wishlist.splice(index, 1);
    const msg = state.lang === 'ar' ? `تم حذف "${name}" من المفضلة.` : (state.lang === 'fr' ? `"${name}" retiré des favoris.` : `"${name}" removido dos favoritos.`);
    showToast(msg);
  } else {
    state.wishlist.push(productId);
    const msg = state.lang === 'ar' ? `تمت إضافة "${name}" إلى المفضلة! ❤️` : (state.lang === 'fr' ? `"${name}" ajouté aux favoris ! ❤️` : `"${name}" salvo nos favoritos! ❤️`);
    showToast(msg);
  }

  localStorage.setItem('hijabstore_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadge();
  renderProducts();
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    badge.textContent = state.wishlist.length;
    badge.style.display = state.wishlist.length > 0 ? 'flex' : 'none';
  }
}

// Toast Alert
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = document.documentElement.dir === 'rtl' ? 'translateX(20px)' : 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3400);
}

// Reset Filters
function resetFilters() {
  state.currentCategory = 'todos';
  state.searchQuery = '';
  state.currentSort = 'featured';

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === 'todos');
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) clearBtn.style.display = 'none';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  applyFilters();
}

// UI Event Handlers
function initUIEvents() {
  // Language Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang && lang !== state.lang) {
        setLanguage(lang);
      }
    });
  });

  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('btn-mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
    });
  });

  // Category filter pills
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCategory = btn.dataset.category || 'todos';
      applyFilters();
    });
  });

  // Quick category cards
  document.querySelectorAll('.category-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const cat = tile.dataset.category;
      if (cat) {
        state.currentCategory = cat;
        document.querySelectorAll('.filter-pill').forEach(b => {
          b.classList.toggle('active', b.dataset.category === cat);
        });
        applyFilters();
        const catalogEl = document.getElementById('catalogo');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Search Input
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      }
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      applyFilters();
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.currentSort = e.target.value;
      applyFilters();
    });
  }

  // Backdrop click to close modals
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeModal();
      closeCart();
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        showToast(t().newsletter.success);
        emailInput.value = '';
      }
    });
  }
}
