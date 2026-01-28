# 🦀 Clawdbot Canvas

A real-time widget dashboard controlled programmatically by AI agents via REST API.

<!-- ![Screenshot](docs/screenshot.png) -->

## What It Does

Clawdbot Canvas displays persistent, real-time information widgets — progress bars, status cards, lists, markdown content, and custom components. An AI agent (or any HTTP client) creates and updates cards through a simple REST API, and the dashboard updates instantly via Server-Sent Events.

## Quick Start

```bash
git clone https://github.com/rowantrollope/clawdbot-canvas.git
cd clawdbot-canvas
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — or append `?demo` to see sample cards.

## Deploy with Tailscale

```bash
npm run build
npx serve dist            # or any static file server
tailscale funnel 3000     # expose via Tailscale Funnel
```

The Vite dev server also binds `0.0.0.0` with `allowedHosts: 'all'`, so `npm run dev` works over Tailscale directly during development.

## API Reference

Base URL: `http://localhost:5173`

### Get all cards

```bash
curl http://localhost:5173/api/cards
```

### Upsert a card

```bash
curl -X POST http://localhost:5173/api/cards \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "build",
    "type": "progress",
    "title": "Building",
    "icon": "🔨",
    "priority": "normal",
    "state": "active",
    "persistent": true,
    "data": { "label": "Compiling...", "progress": 42, "status": "active" }
  }'
```

### Partial update

```bash
curl -X PATCH http://localhost:5173/api/cards/build \
  -H 'Content-Type: application/json' \
  -d '{ "data": { "progress": 100, "status": "done", "label": "Complete" } }'
```

### Delete a card

```bash
curl -X DELETE http://localhost:5173/api/cards/build
```

### Delete all cards

```bash
curl -X DELETE http://localhost:5173/api/cards
```

### Batch operations

```bash
curl -X POST http://localhost:5173/api/batch \
  -H 'Content-Type: application/json' \
  -d '[
    { "action": "upsert", "card": { "id": "a", "type": "markdown", "title": "Note", "icon": "📝", "priority": "normal", "state": "active", "data": { "content": "Hello" } } },
    { "action": "remove", "id": "old-card" }
  ]'
```

### SSE events

```bash
curl -N http://localhost:5173/api/events
```

Events: `upsert`, `remove`, `clear`.

## Security

### Enabling authentication

Set the `CLAWDBOT_CANVAS_TOKEN` environment variable to require a shared secret on all API and page requests:

```bash
CLAWDBOT_CANVAS_TOKEN=mysecrettoken npm run dev
```

When the token is not set, the API is open and unauthenticated (convenient for local development). A warning is logged to the console in this case.

### How it works

| Client | Authentication method |
|--------|----------------------|
| **API / curl** | `Authorization: Bearer <token>` header |
| **SSE (EventSource)** | `?token=<token>` query parameter |
| **Browser** | Visit with `?token=<token>` once — a cookie is set and the URL is cleaned up automatically |

The dashboard shows a small lock icon in the header indicating whether the server is running in secure or unsecure mode. Clicking the unlocked icon shows instructions for enabling auth.

### API examples with auth

```bash
# Get cards
curl -H "Authorization: Bearer mysecrettoken" http://localhost:5173/api/cards

# Upsert a card
curl -X POST http://localhost:5173/api/cards \
  -H "Authorization: Bearer mysecrettoken" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","type":"markdown","title":"Hello","icon":"👋","priority":"normal","state":"active","data":{"content":"world"}}'

# SSE stream
curl -N "http://localhost:5173/api/events?token=mysecrettoken"

# Open dashboard in browser
open "http://localhost:5173?token=mysecrettoken"
```

### CORS

By default, when auth is enabled the server does not send an `Access-Control-Allow-Origin` header (same-origin only). To allow cross-origin requests from a specific domain:

```bash
CLAWDBOT_CORS_ORIGIN=https://example.com CLAWDBOT_CANVAS_TOKEN=xxx npm run dev
```

### Deployment models

| Model | Setup |
|-------|-------|
| **Co-located** (agent + server on same machine, Tailscale Funnel to browser) | `CLAWDBOT_CANVAS_TOKEN=xxx npm run dev`. Agent uses bearer header on localhost. Browser loads with `?token=xxx`. |
| **Standalone** (server on separate machine) | Same token used by both agent and browser. |
| **Local dev** (no auth needed) | `npm run dev` without setting the env var. |

## Card Types

| Type | `data` shape | Description |
|------|-------------|-------------|
| `progress` | `{ label, progress (0-100), status }` | Progress bar with label |
| `status` | `{ entries: [{ key, value }] }` | Key-value status pairs |
| `markdown` | `{ content }` | Rendered markdown |
| `list` | `{ items: [{ id, text, done }] }` | Checklist |
| `custom` | `{ component, props }` | Registered React component |

## Using with Clawdbot

Clawdbot (or any AI agent) sends HTTP requests to the API to create, update, and remove cards. The dashboard reflects changes in real time via SSE. No WebSocket setup required — just `curl`-compatible REST calls.

## Demo Mode

Append `?demo` to the URL (or navigate to `/demo`) to load sample cards showcasing each card type.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (state management)
- Radix UI primitives
- Server-Sent Events for real-time sync

## License

[MIT](LICENSE)
