import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');

let css = fs.readFileSync(cssPath, 'utf-8');

// 1. Root variables update
const rootRegex = /:root\s*\{[\s\S]*?--transition-slow:[^;]+;\s*\}/;
const newRoot = `:root {
  --color-charcoal: #171717;
  --color-dark-gray: #222222;
  --color-card-dark: #222222;
  --color-medium-gray: #303030;
  --color-light-silver: #BDBDBD;
  --color-border-light: #2E2E2E;
  --color-border-dark: #333333;
  --color-ivory: #171717;
  --color-ivory-light: #1A1A1A;
  --color-white: #222222;
  --color-gold: #B9A27A;
  --color-gold-hover: #D4BE97;
  --color-gold-light: rgba(185, 162, 122, 0.2);
  --color-gold-glow: rgba(185, 162, 122, 0.25);
  --color-text-main: #FFFFFF;
  --color-text-muted: #BDBDBD;
  
  --font-heading: 'Cinzel', serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-arabic-heading: 'Amiri', 'Cinzel', serif;
  --font-arabic-body: 'Cairo', 'Plus Jakarta Sans', sans-serif;
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 6px 20px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 36px rgba(0, 0, 0, 0.7);
  --shadow-gold: 0 4px 20px var(--color-gold-glow);
  
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}`;

css = css.replace(rootRegex, newRoot);

// 2. Base Body Reset
css = css.replace(
  /body\s*\{[\s\S]*?overflow-x:\s*hidden;\s*\}/,
  `body {
  font-family: var(--font-body);
  background-color: #171717;
  color: #FFFFFF;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}`
);

// 3. Category Tiles
css = css.replace(
  /\.category-tile\s*\{[\s\S]*?box-shadow:\s*var\(--shadow-sm\);\s*\}/,
  `.category-tile {
  background-color: #222222;
  border: 1px solid #303030;
  border-radius: var(--radius-md);
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-sm);
}`
);

css = css.replace(
  /\.category-tile-icon\s*\{[\s\S]*?transition:\s*all var\(--transition-fast\);\s*\}/,
  `.category-tile-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #2A2A2A;
  color: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all var(--transition-fast);
}`
);

css = css.replace(
  /\.category-tile-title\s*\{[\s\S]*?margin-bottom:\s*4px;\s*\}/,
  `.category-tile-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #FFFFFF;
  margin-bottom: 4px;
}`
);

css = css.replace(
  /\.category-tile-count\s*\{[\s\S]*?color:\s*var\(--color-medium-gray\);\s*\}/,
  `.category-tile-count {
  font-size: 0.78rem;
  color: #BDBDBD;
}`
);

// 4. Catalog Controls & Search
css = css.replace(
  /\.catalog-section\s*\{[\s\S]*?border-bottom:\s*1px solid var\(--color-border-light\);\s*\}/,
  `.catalog-section {
  background-color: #171717;
  border-top: 1px solid #282828;
  border-bottom: 1px solid #282828;
}`
);

css = css.replace(
  /\.catalog-controls\s*\{[\s\S]*?gap:\s*18px;\s*\}/,
  `.catalog-controls {
  background-color: #222222;
  border: 1px solid #303030;
  border-radius: var(--radius-md);
  padding: 18px 24px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 18px;
}`
);

css = css.replace(
  /\.search-box input\s*\{[\s\S]*?transition:\s*border-color var\(--transition-fast\);\s*\}/,
  `.search-box input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #1A1A1A;
  color: #FFFFFF;
  outline: none;
  transition: border-color var(--transition-fast);
}`
);

css = css.replace(
  /\.search-box input:focus\s*\{[\s\S]*?background-color:\s*var\(--color-white\);\s*\}/,
  `.search-box input:focus {
  border-color: var(--color-gold);
  background-color: #242424;
}`
);

css = css.replace(
  /\.sort-select-wrapper select\s*\{[\s\S]*?cursor:\s*pointer;\s*\}/,
  `.sort-select-wrapper select {
  padding: 10px 14px;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #1A1A1A;
  color: #FFFFFF;
  outline: none;
  cursor: pointer;
}

.sort-select-wrapper select option {
  background-color: #222222;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.sort-select-wrapper label\s*\{[\s\S]*?white-space:\s*nowrap;\s*\}/,
  `.sort-select-wrapper label {
  font-size: 0.88rem;
  color: #BDBDBD;
  white-space: nowrap;
}`
);

// 5. Filter Pills
css = css.replace(
  /\.filter-pill\s*\{[\s\S]*?transition:\s*all var\(--transition-fast\);\s*\}/,
  `.filter-pill {
  padding: 8px 18px;
  background-color: #222222;
  border: 1px solid #303030;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  color: #BDBDBD;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}`
);

css = css.replace(
  /\.filter-pill\.active\s*\{[\s\S]*?font-weight:\s*600;\s*\}/,
  `.filter-pill.active {
  background-color: var(--color-gold);
  color: #171717;
  border-color: var(--color-gold);
  font-weight: 700;
}`
);

// 6. Product Cards & Card Media
css = css.replace(
  /\.product-card\s*\{[\s\S]*?transition:\s*all var\(--transition-normal\);\s*\}/,
  `.product-card {
  background-color: #222222;
  border: 1px solid #2E2E2E;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-normal);
}`
);

css = css.replace(
  /\.card-media\s*\{[\s\S]*?background-color:\s*#f0ede6;\s*\}/,
  `.card-media {
  position: relative;
  width: 100%;
  padding-top: 125%; /* 4:5 luxury ratio */
  overflow: hidden;
  background-color: #1A1A1A;
}`
);

css = css.replace(
  /\.card-wishlist-btn\s*\{[\s\S]*?box-shadow:\s*var\(--shadow-sm\);\s*\}/,
  `.card-wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(34, 34, 34, 0.85);
  backdrop-filter: blur(4px);
  color: #BDBDBD;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`
);

css = css.replace(
  /\.card-wishlist-btn:hover\s*\{[\s\S]*?transform:\s*scale\(1\.1\);\s*\}/,
  `.card-wishlist-btn:hover {
  background-color: #303030;
  color: #FF5252;
  transform: scale(1.1);
}`
);

css = css.replace(
  /\.card-title\s*\{[\s\S]*?margin-bottom:\s*8px;\s*\}/,
  `.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}`
);

css = css.replace(
  /\.price-current\s*\{[\s\S]*?color:\s*var\(--color-charcoal\);\s*\}/,
  `.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.price-original\s*\{[\s\S]*?text-decoration:\s*line-through;\s*\}/,
  `.price-original {
  font-size: 0.88rem;
  color: #888888;
  text-decoration: line-through;
}`
);

css = css.replace(
  /\.card-colors-text\s*\{[\s\S]*?color:\s*var\(--color-medium-gray\);\s*\}/,
  `.card-colors-text {
  font-size: 0.75rem;
  color: #BDBDBD;
}`
);

// 7. Empty Catalog State
css = css.replace(
  /\.empty-catalog\s*\{[\s\S]*?border:\s*1px dashed var\(--color-border-light\);\s*\}/,
  `.empty-catalog {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background-color: #222222;
  border-radius: var(--radius-md);
  border: 1px dashed #3A3A3A;
  color: #BDBDBD;
}`
);

// 8. About Section
css = css.replace(
  /\.about-section\s*\{[\s\S]*?padding:\s*80px 0;\s*\}/,
  `.about-section {
  background-color: #171717;
  padding: 80px 0;
}`
);

css = css.replace(
  /\.about-content h2\s*\{[\s\S]*?margin-bottom:\s*20px;\s*\}/,
  `.about-content h2 {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  color: #FFFFFF;
  line-height: 1.3;
  margin-bottom: 20px;
}`
);

css = css.replace(
  /\.about-content p\s*\{[\s\S]*?margin-bottom:\s*20px;\s*\}/,
  `.about-content p {
  color: #BDBDBD;
  margin-bottom: 20px;
  font-size: 1rem;
}`
);

css = css.replace(
  /\.about-feature-title\s*\{[\s\S]*?margin-bottom:\s*4px;\s*\}/,
  `.about-feature-title {
  font-weight: 600;
  font-size: 1rem;
  color: #FFFFFF;
  margin-bottom: 4px;
}`
);

css = css.replace(
  /\.about-feature-desc\s*\{[\s\S]*?color:\s*var\(--color-medium-gray\);\s*\}/,
  `.about-feature-desc {
  font-size: 0.88rem;
  color: #BDBDBD;
}`
);

css = css.replace(
  /\.about-floating-badge\s*\{[\s\S]*?box-shadow:\s*var\(--shadow-lg\);\s*\}/,
  `.about-floating-badge {
  position: absolute;
  bottom: -20px;
  right: -20px;
  background-color: #222222;
  border: 2px solid var(--color-gold);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #FFFFFF;
}`
);

// 9. Social Media Showcase & TikTok
css = css.replace(
  /\.social-showcase-section\s*\{[\s\S]*?padding:\s*80px 0;\s*\}/,
  `.social-showcase-section {
  background-color: #1A1A1A;
  padding: 80px 0;
}`
);

css = css.replace(
  /\.tiktok-play-btn\s*\{[\s\S]*?justify-content:\s*center;\s*\}/,
  `.tiktok-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(34, 34, 34, 0.85);
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
}`
);

// 10. Newsletter Section
css = css.replace(
  /\.newsletter-section\s*\{[\s\S]*?background-color:\s*var\(--color-charcoal\);\s*\}/,
  `.newsletter-section {
  background-color: #171717;
}`
);

css = css.replace(
  /\.newsletter-box\s*\{[\s\S]*?box-shadow:\s*var\(--shadow-md\);\s*\}/,
  `.newsletter-box {
  background: linear-gradient(135deg, #222222 0%, #1A1A1A 100%);
  border: 1px solid #303030;
  border-radius: var(--radius-lg);
  padding: 50px 30px;
  text-align: center;
  max-width: 780px;
  margin: 0 auto;
  box-shadow: var(--shadow-md);
}`
);

css = css.replace(
  /\.newsletter-box h3\s*\{[\s\S]*?margin-bottom:\s*12px;\s*\}/,
  `.newsletter-box h3 {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: #FFFFFF;
  margin-bottom: 12px;
}`
);

css = css.replace(
  /\.newsletter-box p\s*\{[\s\S]*?margin-bottom:\s*24px;\s*\}/,
  `.newsletter-box p {
  color: #BDBDBD;
  margin-bottom: 24px;
}`
);

css = css.replace(
  /\.newsletter-form input\s*\{[\s\S]*?outline:\s*none;\s*\}/,
  `.newsletter-form input {
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #1A1A1A;
  color: #FFFFFF;
  outline: none;
}`
);

// 11. Modal Dialog & Details
css = css.replace(
  /\.modal-dialog\s*\{[\s\S]*?visibility:\s*hidden;\s*\}/,
  `.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -46%) scale(0.96);
  background-color: #222222;
  border: 1px solid #303030;
  border-radius: var(--radius-md);
  max-width: 900px;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 201;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
}`
);

css = css.replace(
  /\.modal-close-btn\s*\{[\s\S]*?z-index:\s*10;\s*\}/,
  `.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #303030;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}`
);

css = css.replace(
  /\.modal-gallery-main\s*\{[\s\S]*?background-color:\s*#f2efe9;\s*\}/,
  `.modal-gallery-main {
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 12px;
  background-color: #1A1A1A;
}`
);

css = css.replace(
  /\.modal-details h2\s*\{[\s\S]*?color:\s*var\(--color-charcoal\);\s*\}/,
  `.modal-details h2 {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  margin-bottom: 8px;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.modal-price\s*\{[\s\S]*?color:\s*var\(--color-charcoal\);\s*\}/,
  `.modal-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.modal-desc\s*\{[\s\S]*?margin-bottom:\s*20px;\s*\}/,
  `.modal-desc {
  font-size: 0.92rem;
  color: #BDBDBD;
  line-height: 1.7;
  margin-bottom: 20px;
}`
);

css = css.replace(
  /\.modal-spec-list\s*\{[\s\S]*?font-size:\s*0\.85rem;\s*\}/,
  `.modal-spec-list {
  background-color: #1A1A1A;
  border: 1px solid #2C2C2C;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
  font-size: 0.85rem;
}`
);

css = css.replace(
  /\.modal-spec-item\s*\{[\s\S]*?border-bottom:\s*1px solid rgba\(0,0,0,0\.06\);\s*\}/,
  `.modal-spec-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}`
);

css = css.replace(
  /\.modal-spec-label\s*\{[\s\S]*?color:\s*var\(--color-charcoal\);\s*\}/,
  `.modal-spec-label {
  font-weight: 600;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.color-option-btn\s*\{[\s\S]*?background-color:\s*var\(--color-white\);\s*\}/,
  `.color-option-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  cursor: pointer;
  background-color: #1A1A1A;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.color-option-btn\.selected\s*\{[\s\S]*?font-weight:\s*600;\s*\}/,
  `.color-option-btn.selected {
  border-color: var(--color-gold);
  background-color: rgba(185, 162, 122, 0.2);
  color: #FFFFFF;
  font-weight: 600;
}`
);

css = css.replace(
  /\.quantity-picker\s*\{[\s\S]*?background-color:\s*var\(--color-white\);\s*\}/,
  `.quantity-picker {
  display: flex;
  align-items: center;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #1A1A1A;
}`
);

css = css.replace(
  /\.qty-btn\s*\{[\s\S]*?cursor:\s*pointer;\s*\}/,
  `.qty-btn {
  width: 36px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #FFFFFF;
  cursor: pointer;
}`
);

css = css.replace(
  /\.qty-input\s*\{[\s\S]*?outline:\s*none;\s*\}/,
  `.qty-input {
  width: 44px;
  text-align: center;
  border: none;
  font-weight: 600;
  outline: none;
  background-color: #1A1A1A;
  color: #FFFFFF;
}`
);

// 12. Cart Drawer & Elements
css = css.replace(
  /\.cart-drawer\s*\{[\s\S]*?transition:\s*right var\(--transition-normal\), left var\(--transition-normal\);\s*\}/,
  `.cart-drawer {
  position: fixed;
  top: 0;
  right: -460px;
  width: 450px;
  max-width: 95vw;
  height: 100vh;
  background-color: #222222;
  border-left: 1px solid #303030;
  z-index: 210;
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  transition: right var(--transition-normal), left var(--transition-normal);
}`
);

css = css.replace(
  /\[dir="rtl"\] \.cart-drawer\s*\{[\s\S]*?box-shadow:\s*8px 0 30px rgba\(0, 0, 0, 0\.25\);\s*\}/,
  `[dir="rtl"] .cart-drawer {
  right: auto;
  left: -460px;
  border-left: none;
  border-right: 1px solid #303030;
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.7);
}`
);

css = css.replace(
  /\.cart-header\s*\{[\s\S]*?color:\s*var\(--color-white\);\s*\}/,
  `.cart-header {
  padding: 22px 24px;
  border-bottom: 1px solid #303030;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #171717;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.cart-item\s*\{[\s\S]*?border-bottom:\s*1px solid var\(--color-border-light\);\s*\}/,
  `.cart-item {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #2C2C2C;
}`
);

css = css.replace(
  /\.cart-item-title\s*\{[\s\S]*?margin-bottom:\s*4px;\s*\}/,
  `.cart-item-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
}`
);

css = css.replace(
  /\.cart-item-meta\s*\{[\s\S]*?margin-bottom:\s*8px;\s*\}/,
  `.cart-item-meta {
  font-size: 0.78rem;
  color: #BDBDBD;
  margin-bottom: 8px;
}`
);

css = css.replace(
  /\.cart-item-price\s*\{[\s\S]*?font-size:\s*0\.98rem;\s*\}/,
  `.cart-item-price {
  font-weight: 700;
  color: #FFFFFF;
  font-size: 0.98rem;
}`
);

css = css.replace(
  /\.cart-qty-ctrl\s*\{[\s\S]*?background-color:\s*var\(--color-ivory-light\);\s*\}/,
  `.cart-qty-ctrl {
  display: flex;
  align-items: center;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #1A1A1A;
  color: #FFFFFF;
}`
);

css = css.replace(
  /\.cart-empty\s*\{[\s\S]*?color:\s*var\(--color-medium-gray\);\s*\}/,
  `.cart-empty {
  text-align: center;
  padding: 60px 10px;
  color: #BDBDBD;
}`
);

css = css.replace(
  /\.cart-footer\s*\{[\s\S]*?background-color:\s*var\(--color-ivory-light\);\s*\}/,
  `.cart-footer {
  padding: 20px 24px;
  border-top: 1px solid #303030;
  background-color: #171717;
}`
);

css = css.replace(
  /\.cart-coupon-row input\s*\{[\s\S]*?text-transform:\s*uppercase;\s*\}/,
  `.cart-coupon-row input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #303030;
  border-radius: var(--radius-sm);
  background-color: #222222;
  color: #FFFFFF;
  font-size: 0.85rem;
  text-transform: uppercase;
}`
);

css = css.replace(
  /\.cart-summary-line\s*\{[\s\S]*?margin-bottom:\s*8px;\s*\}/,
  `.cart-summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #BDBDBD;
  margin-bottom: 8px;
}`
);

css = css.replace(
  /\.cart-summary-line\.total\s*\{[\s\S]*?margin-top:\s*10px;\s*\}/,
  `.cart-summary-line.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
  border-top: 1px solid #303030;
  padding-top: 10px;
  margin-top: 10px;
}`
);

// 13. Toast Notification
css = css.replace(
  /\.toast\s*\{[\s\S]*?animation:\s*slideInLeft 0\.3s ease-out;\s*\}/,
  `.toast {
  background-color: #222222;
  color: #FFFFFF;
  border: 1px solid #303030;
  border-left: 4px solid var(--color-gold);
  padding: 14px 20px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.88rem;
  animation: slideInLeft 0.3s ease-out;
}`
);

// 14. Section Header Titles
css = css.replace(
  /\.section-title\s*\{[\s\S]*?margin-bottom:\s*12px;\s*\}/,
  `.section-title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12px;
}`
);

css = css.replace(
  /\.section-desc\s*\{[\s\S]*?margin:\s*0 auto;\s*\}/,
  `.section-desc {
  color: #BDBDBD;
  font-size: 1rem;
  max-width: 650px;
  margin: 0 auto;
}`
);

// 15. Disable Light Mode Overrides Permanently
if (!css.includes('/* PERMANENT DARK THEME ENFORCEMENT */')) {
  css += `

/* PERMANENT DARK THEME ENFORCEMENT */
@media (prefers-color-scheme: light) {
  body {
    background-color: #171717 !important;
    color: #FFFFFF !important;
  }
}
`;
}

fs.writeFileSync(cssPath, css, 'utf-8');
console.log('style.css updated successfully!');
