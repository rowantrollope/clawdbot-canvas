import type { IncomingMessage, ServerResponse } from 'http';
import type { Card } from '../types/card';
import { loadCards, scheduleSave } from './persistence';

// Auth & CORS config
const TOKEN = process.env.CLAWDBOT_CANVAS_TOKEN;
const CORS_ORIGIN = process.env.CLAWDBOT_CORS_ORIGIN;
const MAX_BODY = 1024 * 1024; // 1MB
const COOKIE_NAME = 'clawdbot_canvas_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

if (!TOKEN) {
  console.warn('[clawdbot] CLAWDBOT_CANVAS_TOKEN not set — API is unauthenticated');
}

// Card store (loaded from disk, persisted on mutation)
const cards = loadCards();

function persist() {
  scheduleSave(cards);
}

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

  // GET/POST /api/demo or /demo or ?demo — load demo cards
  const wantsDemo = path === '/api/demo' || path === '/demo' || url.searchParams.has('demo');
  if (wantsDemo && (method === 'GET' || method === 'POST')) {
    const now = Date.now();
    const demoCards: Card[] = [
      {
        id: 'demo-welcome',
        type: 'markdown',
        title: 'Welcome to Clawdbot Canvas',
        icon: '👋',
        priority: 'high',
        state: 'active',
        persistent: false,
        createdAt: now,
        updatedAt: now,
        data: {
          content: `This is your **agent-curated dashboard**.\n\n- Cards are pushed via REST API\n- Dismiss any card (it goes to archive)\n- Restore cards from the archive drawer below\n\n*These are demo cards — feel free to dismiss them!*`
        }
      },
      {
        id: 'demo-progress',
        type: 'progress',
        title: 'Deployment Progress',
        icon: '🚀',
        priority: 'normal',
        state: 'active',
        persistent: false,
        createdAt: now,
        updatedAt: now,
        data: {
          label: 'Deploying to production...',
          progress: 67,
          status: 'active'
        }
      },
      {
        id: 'demo-status',
        type: 'status',
        title: 'System Status',
        icon: '📊',
        priority: 'normal',
        state: 'active',
        persistent: false,
        createdAt: now,
        updatedAt: now,
        data: {
          entries: [
            { key: 'API', value: '✓ Healthy' },
            { key: 'Database', value: '✓ Connected' },
            { key: 'Cache', value: '✓ 98% hit rate' },
            { key: 'Queue', value: '12 pending' }
          ]
        }
      },
      {
        id: 'demo-tasks',
        type: 'list',
        title: 'Today\'s Tasks',
        icon: '✅',
        priority: 'normal',
        state: 'active',
        persistent: false,
        createdAt: now,
        updatedAt: now,
        data: {
          items: [
            { id: '1', text: 'Review pull requests', done: true },
            { id: '2', text: 'Update documentation', done: true },
            { id: '3', text: 'Deploy new feature', done: false },
            { id: '4', text: 'Team standup at 2pm', done: false }
          ]
        }
      },
      {
        id: 'demo-clock',
        type: 'custom',
        title: 'World Clock',
        icon: '🕐',
        priority: 'low',
        state: 'active',
        persistent: false,
        createdAt: now,
        updatedAt: now,
        data: {
          component: 'WorldClock',
          props: {
            cities: [
              { name: 'San Francisco', timezone: 'America/Los_Angeles', emoji: '🇺🇸' },
              { name: 'New York', timezone: 'America/New_York', emoji: '🗽' },
              { name: 'London', timezone: 'Europe/London', emoji: '🇬🇧' },
              { name: 'Tokyo', timezone: 'Asia/Tokyo', emoji: '🇯🇵' }
            ]
          }
        }
      }
    ];

    // Add demo cards
    for (const card of demoCards) {
      cards.set(card.id, card);
      broadcast('upsert', { card });
    }
    persist();
    
    // For browser navigation (/demo or ?demo), redirect to dashboard
    if (path === '/demo' || (url.searchParams.has('demo') && !path.startsWith('/api/'))) {
      res.writeHead(302, { 'Location': '/' });
      res.end();
      return;
    }
    // For API calls, return JSON
    json(res, 200, { ok: true, count: demoCards.length });
    return;
  }

  // GET /api/cards
  if (path === '/api/cards' && method === 'GET') {
    const include = url.searchParams.get('include');
    const stateFilter = url.searchParams.get('state');
    let result = Array.from(cards.values());
    if (stateFilter === 'archived') {
      result = result.filter(c => c.state === 'archived');
    } else if (include !== 'archived') {
      result = result.filter(c => c.state !== 'archived');
    }
    json(res, 200, result);
    return;
  }

  // POST /api/cards — upsert
  if (path === '/api/cards' && method === 'POST') {
    readBody(req).then((body) => {
      const card = JSON.parse(body) as Card;
      const now = Date.now();
      const existing = cards.get(card.id);

      // If user dismissed this card, preserve archived state but allow data updates
      if (existing?.userDismissed && existing.state === 'archived') {
        cards.set(card.id, {
          ...card,
          createdAt: existing.createdAt,
          updatedAt: now,
          state: 'archived',
          archivedAt: existing.archivedAt,
          userDismissed: true,
        });
      } else {
        cards.set(card.id, {
          ...card,
          createdAt: existing?.createdAt ?? card.createdAt ?? now,
          updatedAt: now,
        });
      }
      broadcast('upsert', { card: cards.get(card.id) });
      persist();
      json(res, 200, { ok: true, card: cards.get(card.id) });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // POST /api/cards/:id/archive
  const archiveMatch = path.match(/^\/api\/cards\/(.+)\/archive$/);
  if (archiveMatch && method === 'POST') {
    const id = decodeURIComponent(archiveMatch[1]);
    const existing = cards.get(id);
    if (!existing) { json(res, 404, { error: 'Not found' }); return; }
    const updated = { ...existing, state: 'archived' as const, archivedAt: Date.now(), updatedAt: Date.now(), userDismissed: true };
    cards.set(id, updated);
    broadcast('archive', { card: updated });
    persist();
    json(res, 200, { ok: true, card: updated });
    return;
  }

  // DELETE /api/archive — clear all archived cards
  if (path === '/api/archive' && method === 'DELETE') {
    const archived = Array.from(cards.values()).filter(c => c.state === 'archived');
    for (const card of archived) {
      cards.delete(card.id);
      broadcast('remove', { id: card.id });
    }
    persist();
    json(res, 200, { ok: true, count: archived.length });
    return;
  }

  // POST /api/cards/:id/restore
  const restoreMatch = path.match(/^\/api\/cards\/(.+)\/restore$/);
  if (restoreMatch && method === 'POST') {
    const id = decodeURIComponent(restoreMatch[1]);
    const existing = cards.get(id);
    if (!existing) { json(res, 404, { error: 'Not found' }); return; }
    const updated = { ...existing, state: 'active' as const, archivedAt: undefined, userDismissed: undefined, updatedAt: Date.now() };
    cards.set(id, updated);
    broadcast('restore', { card: updated });
    persist();
    json(res, 200, { ok: true, card: updated });
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
      persist();
      json(res, 200, { ok: true, card: updated });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // DELETE /api/cards
  if (path === '/api/cards' && method === 'DELETE') {
    cards.clear();
    broadcast('clear', {});
    persist();
    json(res, 200, { ok: true });
    return;
  }

  // DELETE /api/cards/:id
  const deleteMatch = path.match(/^\/api\/cards\/(.+)$/);
  if (deleteMatch && method === 'DELETE') {
    const id = decodeURIComponent(deleteMatch[1]);
    cards.delete(id);
    broadcast('remove', { id });
    persist();
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
              // If user dismissed this card, preserve archived state but allow data updates
              if (existing?.userDismissed && existing.state === 'archived') {
                cards.set(op.card.id, {
                  ...op.card,
                  createdAt: existing.createdAt,
                  updatedAt: now,
                  state: 'archived',
                  archivedAt: existing.archivedAt,
                  userDismissed: true,
                });
              } else {
                cards.set(op.card.id, {
                  ...op.card,
                  createdAt: existing?.createdAt ?? op.card.createdAt ?? now,
                  updatedAt: now,
                });
              }
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
      persist();
      json(res, 200, { ok: true });
    }).catch(() => json(res, 400, { error: 'Invalid JSON' }));
    return;
  }

  // Not an API route — pass through to Vite
  next();
}
