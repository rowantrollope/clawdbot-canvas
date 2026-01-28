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
