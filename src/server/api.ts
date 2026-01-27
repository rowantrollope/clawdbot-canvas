import type { IncomingMessage, ServerResponse } from 'http';
import type { Card } from '../types/card';

// In-memory card store (source of truth)
const cards = new Map<string, Card>();

// SSE clients
const sseClients = new Set<ServerResponse>();

function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export function apiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method!;

  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // SSE endpoint
  if (path === '/api/events' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(':\n\n'); // comment to flush
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // GET /api/cards
  if (path === '/api/cards' && method === 'GET') {
    json(res, 200, Array.from(cards.values()));
    return;
  }

  // POST /api/cards — upsert
  if (path === '/api/cards' && method === 'POST') {
    readBody(req).then((body) => {
      const card = JSON.parse(body) as Card;
      const now = Date.now();
      const existing = cards.get(card.id);
      cards.set(card.id, {
        ...card,
        createdAt: existing?.createdAt ?? card.createdAt ?? now,
        updatedAt: now,
      });
      broadcast('upsert', { card: cards.get(card.id) });
      json(res, 200, { ok: true, card: cards.get(card.id) });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // PATCH /api/cards/:id — partial update
  const patchMatch = path.match(/^\/api\/cards\/(.+)$/);
  if (patchMatch && method === 'PATCH') {
    const id = decodeURIComponent(patchMatch[1]);
    const existing = cards.get(id);
    if (!existing) { json(res, 404, { error: 'Not found' }); return; }
    readBody(req).then((body) => {
      const updates = JSON.parse(body);
      const updated = { ...existing, ...updates, id, updatedAt: Date.now() };
      cards.set(id, updated);
      broadcast('upsert', { card: updated });
      json(res, 200, { ok: true, card: updated });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // DELETE /api/cards — clear all
  if (path === '/api/cards' && method === 'DELETE') {
    cards.clear();
    broadcast('clear', {});
    json(res, 200, { ok: true });
    return;
  }

  // DELETE /api/cards/:id — remove one
  const deleteMatch = path.match(/^\/api\/cards\/(.+)$/);
  if (deleteMatch && method === 'DELETE') {
    const id = decodeURIComponent(deleteMatch[1]);
    cards.delete(id);
    broadcast('remove', { id });
    json(res, 200, { ok: true });
    return;
  }

  // POST /api/batch
  if (path === '/api/batch' && method === 'POST') {
    readBody(req).then((body) => {
      const ops = JSON.parse(body) as Array<{ action: string; card?: Card; id?: string; updates?: Partial<Card> }>;
      const now = Date.now();
      for (const op of ops) {
        switch (op.action) {
          case 'upsert':
            if (op.card) {
              const existing = cards.get(op.card.id);
              cards.set(op.card.id, {
                ...op.card,
                createdAt: existing?.createdAt ?? op.card.createdAt ?? now,
                updatedAt: now,
              });
              broadcast('upsert', { card: cards.get(op.card.id) });
            }
            break;
          case 'remove':
            if (op.id) {
              cards.delete(op.id);
              broadcast('remove', { id: op.id });
            }
            break;
          case 'clear':
            cards.clear();
            broadcast('clear', {});
            break;
        }
      }
      json(res, 200, { ok: true });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // Not an API route — pass through to Vite
  next();
}
