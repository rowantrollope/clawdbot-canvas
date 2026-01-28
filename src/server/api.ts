import type { IncomingMessage, ServerResponse } from 'http';
import type { Card } from '../types/card';

// Auth & CORS config
const TOKEN = process.env.CLAWDBOT_CANVAS_TOKEN;
const CORS_ORIGIN = process.env.CLAWDBOT_CORS_ORIGIN;
const MAX_BODY = 1024 * 1024; // 1MB
const COOKIE_NAME = 'clawdbot_canvas_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

if (!TOKEN) {
  console.warn('[clawdbot] CLAWDBOT_CANVAS_TOKEN not set — API is unauthenticated');
}

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

function html(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, { 'Content-Type': 'text/html' });
  res.end(body);
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookies: Record<string, string> = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      cookies[name] = rest.join('=');
    });
  }
  return cookies;
}

function setAuthCookie(res: ServerResponse) {
  // Set a cookie that proves the user authenticated
  // Value is the token hash (so we can verify without exposing token)
  const cookieValue = Buffer.from(TOKEN!).toString('base64');
  res.setHeader('Set-Cookie', 
    `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
  );
}

function verifyAuth(req: IncomingMessage, url: URL): boolean {
  if (!TOKEN) return true; // No token configured = no auth required
  
  // Check Authorization header (for API calls)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ') && authHeader.slice(7) === TOKEN) {
    return true;
  }
  
  // Check URL query param (for initial page load)
  if (url.searchParams.get('token') === TOKEN) {
    return true;
  }
  
  // Check cookie (for subsequent requests)
  const cookies = parseCookies(req);
  const cookieValue = cookies[COOKIE_NAME];
  if (cookieValue && Buffer.from(TOKEN).toString('base64') === cookieValue) {
    return true;
  }
  
  return false;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        req.destroy();
        reject(new Error('Body too large'));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export function apiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method!;

  // CORS headers
  if (CORS_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Auth check for ALL routes when TOKEN is configured
  if (TOKEN) {
    const isAuthed = verifyAuth(req, url);
    
    if (!isAuthed) {
      // For API routes, return JSON error
      if (path.startsWith('/api/')) {
        json(res, 401, { error: 'Unauthorized' });
        return;
      }
      // For page routes, return HTML error with hint
      html(res, 401, `
        <!DOCTYPE html>
        <html>
        <head><title>Unauthorized</title></head>
        <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f7;">
          <div style="text-align: center;">
            <h1 style="font-size: 48px; margin: 0;">🔒</h1>
            <p style="color: #86868b; margin-top: 16px;">Access denied. Add <code>?token=xxx</code> to URL.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }
    
    // If authenticated via URL token, set cookie for future requests
    if (url.searchParams.get('token') === TOKEN) {
      setAuthCookie(res);
      // Redirect to clean URL (remove token from URL)
      if (!path.startsWith('/api/')) {
        res.writeHead(302, { 'Location': path || '/' });
        res.end();
        return;
      }
    }
  }

  // --- API Routes (only reached if authenticated) ---

  // SSE endpoint
  if (path === '/api/events' && method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(':\n\n');
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

  // PATCH /api/cards/:id
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

  // DELETE /api/cards
  if (path === '/api/cards' && method === 'DELETE') {
    cards.clear();
    broadcast('clear', {});
    json(res, 200, { ok: true });
    return;
  }

  // DELETE /api/cards/:id
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
      const ops = JSON.parse(body) as Array<{ action: string; card?: Card; id?: string }>;
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
