// server/server.js
// npm i express cors
const express = require('express');
const cors = require('cors');
const app = express();

const DEVICE_TOKEN = process.env.SWING_TOKEN || 'super-secret-token-123';
const swings = [];
const MAX_SWINGS = 200;
const clients = new Set(); // SSE clients

app.use(express.json());
app.use(cors()); // ok for dev; tighten for prod

app.post('/api/swing', (req, res) => {
  if (req.get('x-device-token') !== DEVICE_TOKEN) return res.sendStatus(401);

  const now = Date.now();
  const swing = {
    ...req.body,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: now,
  };
  swings.push(swing);
  if (swings.length > MAX_SWINGS) swings.shift();

  const data = `data: ${JSON.stringify(swing)}\n\n`;
  for (const c of clients) c.write(data);

  res.sendStatus(204);
});

app.get('/api/last', (req, res) => res.json(swings[swings.length - 1] || {}));

app.get('/api/swings', (req, res) => {
  const limit = Math.max(1, Math.min(+req.query.limit || 50, MAX_SWINGS));
  res.json(swings.slice(-limit).reverse());
});

app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();
  if (swings.length) res.write(`data: ${JSON.stringify(swings[swings.length - 1])}\n\n`);
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));
