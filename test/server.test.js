import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

// Test against the running server or an internal express instance
test('Store API & Health Check Test Suite', async (t) => {
  // Dynamically import server components or test API via fetch
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
    res.json({ storeName: 'Hijab Store Islamic', currency: 'BRL' });
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
      list = list.filter(p => p.name.toLowerCase().includes(q));
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
    assert.equal(data.service, 'hijabstoreislamic');
  });

  await t.test('GET /api/config returns store settings', async () => {
    const res = await fetch(`${baseUrl}/api/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.storeName, 'Hijab Store Islamic');
    assert.equal(data.currency, 'BRL');
  });

  await t.test('GET /api/products returns all products', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 10);
  });

  await t.test('GET /api/products?category=hijabs filters correctly', async () => {
    const res = await fetch(`${baseUrl}/api/products?category=hijabs`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.length > 0);
    data.forEach(p => assert.equal(p.category, 'hijabs'));
  });

  await t.test('GET /api/products?search=chiffon filters correctly', async () => {
    const res = await fetch(`${baseUrl}/api/products?search=chiffon`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.length > 0);
    data.forEach(p => assert.ok(p.name.toLowerCase().includes('chiffon')));
  });

  server.close();
});
