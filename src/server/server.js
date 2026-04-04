// src/server/server.js
// npm i express cors

import express from 'express';
import cors from 'cors';

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const DEVICE_TOKEN = process.env.SWING_TOKEN || 'super-secret-token-123';

// In-memory swing store + SSE clients
const swings = [];
const MAX_SWINGS = 200;
const clients = new Set(); // SSE clients

// Middleware
app.use(cors());          // ok for dev; tighten for prod
app.use(express.json());

// Simple health / debug endpoint
app.get('/', (req, res) => {
  res.send('Swing API is running');
});

// ----------------- POST /api/swing  (ESP32 + curl send here) -----------------
app.post('/api/swing', (req, res) => {
  console.log('--- Incoming POST /api/swing ---');
  console.log('  x-device-token:', req.get('x-device-token'));
  console.log('  body:', req.body);

  if (req.get('x-device-token') !== DEVICE_TOKEN) {
    console.log('  -> Token mismatch! Expected:', DEVICE_TOKEN);
    return res.sendStatus(401);
  }

  const now = Date.now();
  const swing = {
    ...req.body,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: now,
  };

  swings.push(swing);
  if (swings.length > MAX_SWINGS) swings.shift();

  console.log('  -> New swing stored. Total swings:', swings.length);

  // Broadcast to SSE clients
  const data = `data: ${JSON.stringify(swing)}\n\n`;
  for (const c of clients) {
    c.write(data);
  }

  res.sendStatus(204); // ESP / curl see 204 No Content on success
});

// ----------------- GET /api/last -----------------
app.get('/api/last', (req, res) => {
  const last = swings[swings.length - 1] || {};
  res.json(last);
});

// ----------------- GET /api/swings?limit=20 -----------------
app.get('/api/swings', (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, MAX_SWINGS));
  const slice = swings.slice(-limit).reverse(); // newest first
  res.json(slice);
});

// ----------------- GET /api/stream (SSE) -----------------
app.get('/api/stream', (req, res) => {
  console.log('Client connected to /api/stream');

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  if (res.flushHeaders) res.flushHeaders();

  // Send last swing immediately if we have one
  if (swings.length) {
    const last = swings[swings.length - 1];
    res.write(`data: ${JSON.stringify(last)}\n\n`);
  }

  clients.add(res);

  req.on('close', () => {
    console.log('Client disconnected from /api/stream');
    clients.delete(res);
  });
});

// ----------------- Start server -----------------
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Expecting x-device-token: ${DEVICE_TOKEN}`);
});
