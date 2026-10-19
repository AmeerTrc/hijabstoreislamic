import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

test('Store API, i18n & Modest Catalog Test Suite', async (t) => {
  const { default: express } = await import('express');
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '..');

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(rootDir, 'public')));

  const rawData = fs.readFileSync(path.join(rootDir, 'data', 'products.json'), 'utf-8');
  const products = JSON.parse(rawData);

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'hijabstoreislamic' });
  });

  // Config endpoint
  app.get('/api/config', (req, res) => {
    res.json({
      storeName: 'Hijab Store Islamic',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
      instagramUrl: process.env.INSTAGRAM_URL || '',
      tiktokUrl: process.env.TIKTOK_URL || '',
      currency: 'BRL'
    });
  });

  // Products endpoint
  app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let list = [...products];
    if (category && category !== 'todos') {
      list = list.filter(p => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.name_ar && p.name_ar.includes(q)) ||
        (p.name_fr && p.name_fr.toLowerCase().includes(q))
      );
    }
    res.json(list);
  });

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  await t.test('GET /health returns 200 and status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });

  await t.test('GET /api/config returns safe empty default links when unset', async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(typeof data.whatsappNumber, 'string');
    assert.equal(typeof data.instagramUrl, 'string');
    assert.equal(typeof data.tiktokUrl, 'string');
  });

  await t.test('GET /api/products returns modest Islamic products with Arabic and French translations', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.length >= 8);
    // Verify each product has Arabic and French fields
    data.forEach(p => {
      assert.ok(p.name, 'Product has Portuguese name');
      assert.ok(p.name_ar, `Product ${p.id} has Arabic name`);
      assert.ok(p.name_fr, `Product ${p.id} has French name`);
      assert.ok(p.image, `Product ${p.id} has an image`);
    });
  });

  await t.test('GET /api/products?category=niqabs filters Niqab category correctly', async () => {
    const res = await fetch(`${baseUrl}/api/products?category=niqabs`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.length > 0);
    assert.equal(data[0].category, 'niqabs');
  });

  await t.test('Search works with Arabic keywords', async () => {
    const res = await fetch(`${baseUrl}/api/products?search=${encodeURIComponent('نقاب')}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.length > 0);
  });

  await t.test('All images in public/images are accessible locally', async () => {
    const resHero = await fetch(`${baseUrl}/images/hero-niqab.jpg`);
    assert.equal(resHero.status, 200);
    const resNiqab = await fetch(`${baseUrl}/images/niqab-saudi.jpg`);
    assert.equal(resNiqab.status, 200);
    const resAbaya = await fetch(`${baseUrl}/images/abaya-embroidery.jpg`);
    assert.equal(resAbaya.status, 200);
  });

  await t.test('All 6 individual product images in /assets are accessible', async () => {
    const assets = [
      'abaya-black-gold-embroidery.jpg',
      'abaya-mauve-rose-embroidery.jpg',
      'abaya-black-layered-luxury.jpg',
      'hijab-chiffon-dusty-pink.jpg',
      'hijab-chiffon-olive-green.jpg',
      'hijab-chiffon-slate-blue.jpg'
    ];
    for (const file of assets) {
      const res = await fetch(`${baseUrl}/assets/${file}`);
      assert.equal(res.status, 200, `Asset ${file} should return HTTP 200`);
      const contentType = res.headers.get('content-type') || '';
      assert.ok(contentType.includes('image'), `Asset ${file} should be image, got ${contentType}`);
    }
  });

  server.close();
});
