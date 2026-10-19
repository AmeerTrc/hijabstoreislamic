/**
 * HIJAB STORE ISLAMIC - FRONTEND CORE APPLICATION
 * Brazilian Portuguese E-Commerce Logic
 */

// Application State
const state = {
  products: [],
  filteredProducts: [],
  categories: [],
  currentCategory: 'todos',
  searchQuery: '',
  currentSort: 'featured',
  cart: JSON.parse(localStorage.getItem('hijabstore_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('hijabstore_wishlist') || '[]'),
  activeProductModal: null,
  activeColor: null,
  activeQuantity: 1,
  config: {
    whatsappNumber: '5511999999999',
    instagramUrl: 'https://instagram.com/hijabstoreislamic',
    tiktokUrl: 'https://tiktok.com/@hijabstoreislamic'
  },
  appliedCoupon: null
};

// Available coupons
const COUPONS = {
  'BEMVINDA10': { discount: 0.10, label: '10% de Desconto de Boas-Vindas' },
  'ISLAMIC15': { discount: 0.15, label: '15% de Desconto Especial' }
};

// Format currency in BRL (Real Brasileiro)
function formatBRL(amount) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  initUIEvents();
  updateCartBadge();
  updateWishlistBadge();
  await loadStoreConfig();
  await loadProducts();
});

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
    console.warn('Usando configuração padrão:', err);
  }
}

function applyConfigToDOM() {
  const whatsappLinks = document.querySelectorAll('.dynamic-whatsapp-link');
  whatsappLinks.forEach(link => {
    link.href = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar dúvidas sobre os produtos da Hijab Store Islamic.')}`;
  });

  const igLinks = document.querySelectorAll('.dynamic-instagram-link');
  igLinks.forEach(link => { link.href = state.config.instagramUrl; });

  const ttLinks = document.querySelectorAll('.dynamic-tiktok-link');
  ttLinks.forEach(link => { link.href = state.config.tiktokUrl; });
}

// Fetch products from API
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-medium-gray);">Carregando coleção exclusiva...</div>';

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
        <p>Não foi possível carregar os produtos no momento.</p>
        <button class="btn-primary" style="margin-top: 14px;" onclick="loadProducts()">Tentar Novamente</button>
      </div>
    `;
  }
}

// Filter and Sort Products
function applyFilters() {
  let list = [...state.products];

  // Category filter
  if (state.currentCategory !== 'todos') {
    list = list.filter(p => p.category === state.currentCategory);
  }

  // Search filter
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
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

  if (countSpan) {
    countSpan.textContent = `${state.filteredProducts.length} ${state.filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
  }

  if (state.filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="empty-catalog">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">Nenhum produto encontrado</h3>
        <p style="color: var(--color-medium-gray); margin-bottom: 16px;">Tente ajustar sua busca ou selecionar outra categoria.</p>
        <button class="btn-primary" onclick="resetFilters()">Limpar Filtros</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.filteredProducts.map(product => {
    const isWishlisted = state.wishlist.includes(product.id);
    const swatchesHtml = (product.colors || []).slice(0, 4).map(c => 
      `<span class="swatch-dot" style="background-color: ${c.hex};" title="${c.name}"></span>`
    ).join('');

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          
          <div class="card-badges">
            ${product.isNew ? '<span class="badge badge-new">Novidade</span>' : ''}
            ${product.isBestSeller ? '<span class="badge badge-bestseller">Mais Vendido</span>' : ''}
          </div>

          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  onclick="toggleWishlist('${product.id}')" 
                  aria-label="Adicionar aos favoritos" 
                  title="${isWishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button class="card-overlay-btn" onclick="openProductModal('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></line>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Visualização Rápida
          </button>
        </div>

        <div class="card-info">
          <span class="card-category">${product.categoryName}</span>
          <h3 class="card-title" onclick="openProductModal('${product.id}')" style="cursor: pointer;">${product.name}</h3>

          <div class="card-rating">
            <span>★</span> <strong>${product.rating.toFixed(1)}</strong>
            <span class="card-rating-count">(${product.reviewsCount} avaliações)</span>
          </div>

          ${swatchesHtml ? `<div class="card-swatches">${swatchesHtml}</div>` : ''}

          <div class="card-bottom">
            <div class="card-price-wrapper">
              ${product.originalPrice ? `<span class="card-original-price">${formatBRL(product.originalPrice)}</span>` : ''}
              <div class="card-price">${formatBRL(product.price)}</div>
            </div>

            <button class="btn-add-cart" onclick="quickAddToCart('${product.id}')" title="Adicionar ao Carrinho" aria-label="Adicionar ao Carrinho">
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
  state.activeColor = (product.colors && product.colors.length > 0) ? product.colors[0].name : null;

  const modal = document.getElementById('product-modal');
  const backdrop = document.getElementById('modal-backdrop');

  const galleryMain = document.getElementById('modal-main-img');
  galleryMain.src = product.image;
  galleryMain.alt = product.name;

  const thumbsContainer = document.getElementById('modal-thumbs');
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  thumbsContainer.innerHTML = images.map((img, idx) => `
    <div class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="changeModalImage('${img}', this)">
      <img src="${img}" alt="${product.name}">
    </div>
  `).join('');

  document.getElementById('modal-category').textContent = product.categoryName;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-price').textContent = formatBRL(product.price);
  
  const origPriceEl = document.getElementById('modal-original-price');
  if (product.originalPrice) {
    origPriceEl.textContent = formatBRL(product.originalPrice);
    origPriceEl.style.display = 'inline';
  } else {
    origPriceEl.style.display = 'none';
  }

  document.getElementById('modal-desc').textContent = product.description;
  document.getElementById('modal-spec-fabric').textContent = product.fabric || 'Premium';
  document.getElementById('modal-spec-dimensions').textContent = product.dimensions || 'Padrão';

  // Render colors
  const colorsContainer = document.getElementById('modal-colors');
  if (product.colors && product.colors.length > 0) {
    colorsContainer.innerHTML = product.colors.map((c, idx) => `
      <button class="color-option-btn ${idx === 0 ? 'selected' : ''}" onclick="selectModalColor('${c.name}', this)">
        <span class="color-option-dot" style="background-color: ${c.hex};"></span>
        ${c.name}
      </button>
    `).join('');
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
  const p = state.activeProductModal;
  const colorText = state.activeColor ? ` na cor *${state.activeColor}*` : '';
  const message = `Olá! Tenho interesse em comprar:\n- *${p.name}* (Quantidade: ${state.activeQuantity})${colorText}\n- Valor: ${formatBRL(p.price * state.activeQuantity)}\n\nPoderia me informar as opções de frete e pagamento?`;
  
  const url = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Quick Add to Cart from Card
function quickAddToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const defaultColor = (product.colors && product.colors.length > 0) ? product.colors[0].name : null;
  addToCart(productId, 1, defaultColor);
  showToast(`"${product.name}" adicionado ao carrinho!`);
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
    showToast(`"${item.name}" removido do carrinho.`);
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
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h4 style="font-family: var(--font-heading); margin-bottom: 8px;">Seu carrinho está vazio</h4>
        <p style="font-size: 0.88rem; margin-bottom: 18px;">Que tal explorar nossa coleção de hijabs e abayas?</p>
        <button class="btn-primary" onclick="closeCart()">Ver Coleção</button>
      </div>
    `;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';

  body.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">
          ${item.color ? `Cor: <strong>${item.color}</strong> • ` : ''}${formatBRL(item.price)}
        </div>
        <div class="cart-item-bottom">
          <div class="cart-qty-ctrl">
            <button onclick="updateCartItemQty(${idx}, -1)" aria-label="Diminuir">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartItemQty(${idx}, 1)" aria-label="Aumentar">+</button>
          </div>
          <div class="cart-item-price">${formatBRL(item.price * item.quantity)}</div>
          <button class="cart-item-remove" onclick="removeCartItem(${idx})" title="Remover item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Calculations
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discount = 0;

  if (state.appliedCoupon) {
    discount = subtotal * state.appliedCoupon.discount;
  }

  const shipping = subtotal >= 199 ? 0 : 25.00;
  const total = subtotal - discount + (shipping === 0 ? 0 : shipping);

  document.getElementById('cart-subtotal').textContent = formatBRL(subtotal);
  
  const discountRow = document.getElementById('cart-discount-row');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('cart-discount').textContent = `-${formatBRL(discount)}`;
  } else {
    discountRow.style.display = 'none';
  }

  const shippingEl = document.getElementById('cart-shipping');
  if (shipping === 0) {
    shippingEl.innerHTML = '<span style="color: #2e7d32; font-weight: 700;">Grátis ✨</span>';
  } else {
    shippingEl.textContent = formatBRL(shipping);
  }

  document.getElementById('cart-total').textContent = formatBRL(total);
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
  const input = document.getElementById('coupon-input');
  const code = (input.value || '').trim().toUpperCase();

  if (!code) {
    showToast('Por favor, digite um código de cupom.');
    return;
  }

  if (COUPONS[code]) {
    state.appliedCoupon = COUPONS[code];
    renderCart();
    showToast(`Cupom "${code}" aplicado com sucesso!`);
    input.value = '';
  } else {
    showToast('Cupom inválido ou expirado.');
  }
}

// Checkout via WhatsApp with full formatted Brazilian Portuguese message
function checkoutWhatsApp() {
  if (state.cart.length === 0) return;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = state.appliedCoupon ? (subtotal * state.appliedCoupon.discount) : 0;
  const shipping = subtotal >= 199 ? 0 : 25.00;
  const total = subtotal - discount + (shipping === 0 ? 0 : shipping);

  let msg = `🛍️ *NOVO PEDIDO - HIJAB STORE ISLAMIC*\n\n`;
  msg += `Olá! Gostaria de concluir a compra dos seguintes itens:\n\n`;

  state.cart.forEach((item, index) => {
    msg += `*${index + 1}. ${item.name}*\n`;
    if (item.color) msg += `   - Cor: ${item.color}\n`;
    msg += `   - Qtd: ${item.quantity}x | ${formatBRL(item.price)} cada\n`;
    msg += `   - Subtotal: ${formatBRL(item.price * item.quantity)}\n\n`;
  });

  msg += `--------------------------------\n`;
  msg += `*Subtotal:* ${formatBRL(subtotal)}\n`;
  if (discount > 0) {
    msg += `*Desconto (${state.appliedCoupon.label}):* -${formatBRL(discount)}\n`;
  }
  msg += `*Frete:* ${shipping === 0 ? 'GRÁTIS (compras acima de R$ 199)' : formatBRL(shipping)}\n`;
  msg += `*TOTAL DO PEDIDO:* ${formatBRL(total)}\n`;
  msg += `--------------------------------\n\n`;
  msg += `Por favor, me confirme os dados para pagamento via Pix ou Cartão e o prazo de entrega. Obrigada! ✨`;

  const url = `https://wa.me/${state.config.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Wishlist Functionality
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  const product = state.products.find(p => p.id === productId);

  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast(`"${product ? product.name : 'Produto'}" removido dos favoritos.`);
  } else {
    state.wishlist.push(productId);
    showToast(`"${product ? product.name : 'Produto'}" salvo nos favoritos! ❤️`);
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
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
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
        showToast('Obrigada por se inscrever! Você receberá ofertas exclusivas no e-mail.');
        emailInput.value = '';
      }
    });
  }
}
