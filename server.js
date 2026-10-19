import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Load products data
let products = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf-8');
  products = JSON.parse(data);
} catch (err) {
  console.error('Error loading products.json:', err);
}

// Load store configuration
let storeConfig = {
  storeName: 'Hijab Store Islamic',
  whatsappNumber: '',
  instagramUrl: '',
  tiktokUrl: ''
};

try {
  const configData = fs.readFileSync(path.join(__dirname, 'data', 'config.json'), 'utf-8');
  storeConfig = { ...storeConfig, ...JSON.parse(configData) };
} catch (err) {
  console.warn('Could not read data/config.json, using defaults.');
}

// Categories list
const categories = [
  { id: 'todos', name: 'Todos os Produtos', name_ar: 'جميع المنتجات', name_fr: 'Tous les Produits', slug: 'todos' },
  { id: 'niqabs', name: 'Niqabs', name_ar: 'النقاب', name_fr: 'Niqabs', slug: 'niqabs' },
  { id: 'hijabs', name: 'Hijabs', name_ar: 'الحجابات', name_fr: 'Hijabs', slug: 'hijabs' },
  { id: 'khimars', name: 'Khimars', name_ar: 'الخمار', name_fr: 'Khimars', slug: 'khimars' },
  { id: 'abayas', name: 'Abayas', name_ar: 'العبايات', name_fr: 'Abayas', slug: 'abayas' },
  { id: 'vestidos', name: 'Vestidos Modestos', name_ar: 'الفساتين المحتشمة', name_fr: 'Robes Modestes', slug: 'vestidos' },
  { id: 'oracao', name: 'Roupas de Oração', name_ar: 'ملابس الصلاة', name_fr: 'Tenues de Prière', slug: 'oracao' },
  { id: 'acessorios', name: 'Acessórios', name_ar: 'الإكسسوارات', name_fr: 'Accessoires', slug: 'acessorios' }
];

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'hijabstoreislamic'
  });
});

// Store configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    storeName: storeConfig.storeName,
    // Prefer environment variable if set, otherwise config file, otherwise empty string
    whatsappNumber: process.env.WHATSAPP_NUMBER || storeConfig.whatsappNumber || '',
    instagramUrl: process.env.INSTAGRAM_URL || storeConfig.instagramUrl || '',
    tiktokUrl: process.env.TIKTOK_URL || storeConfig.tiktokUrl || '',
    currency: 'BRL',
    currencySymbol: 'R$'
  });
});

// Products API
app.get('/api/products', (req, res) => {
  const { category, search, sort, isNew, isBestSeller, limit } = req.query;
  let result = [...products];

  if (category && category !== 'todos') {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (isNew === 'true') {
    result = result.filter(p => p.isNew);
  }

  if (isBestSeller === 'true') {
    result = result.filter(p => p.isBestSeller);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.name_ar && p.name_ar.includes(q)) ||
      (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  }

  if (sort) {
    if (sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  if (limit) {
    result = result.slice(0, parseInt(limit, 10));
  }

  res.json(result);
});

// Single product API
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(product);
});

// Categories API
app.get('/api/categories', (req, res) => {
  const categoriesWithCounts = categories.map(cat => {
    const count = cat.id === 'todos'
      ? products.length
      : products.filter(p => p.category === cat.id).length;
    return { ...cat, count };
  });
  res.json(categoriesWithCounts);
});

// Fallback to index.html for SPA-like navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ Hijab Store Islamic Server rodando na porta ${PORT}`);
  console.log(`🌐 Health check em http://localhost:${PORT}/health`);
});
