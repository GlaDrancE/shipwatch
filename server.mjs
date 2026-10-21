// ShipWatch: serves the page and a small JSON API in front of ParcelPost + NWS.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { listShipments, createShipment } from './src/parcel.js';
import { describe, track } from './src/view.js';

const page = readFileSync(new URL('./public/index.html', import.meta.url));

const send = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });

async function handle(req, res) {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(page);
  }
  if (pathname === '/api/shipments' && req.method === 'GET') {
    return send(res, 200, (await listShipments(5)).map(describe));
  }
  if (pathname === '/api/shipments' && req.method === 'POST') {
    const { recipient, city } = await readBody(req);
    return send(res, 201, describe(await createShipment(recipient, city)));
  }
  const m = pathname.match(/^\/api\/track\/([A-Za-z0-9]+)$/);
  if (m) return send(res, 200, await track(m[1]));
  send(res, 404, { error: 'not found' });
}

const port = Number(process.env.PORT) || 3000;
createServer((req, res) =>
  // Upstream failures surface as 502 with the courier's message, so a breaking change is visible on the page.
  handle(req, res).catch((err) => send(res, 502, { error: err.message })),
).listen(port, () => console.log(`ShipWatch on http://localhost:${port}`));
