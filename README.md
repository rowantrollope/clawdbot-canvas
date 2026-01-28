# 🦀 Clawdbot Canvas

A real-time widget dashboard controlled programmatically by AI agents via REST API.

## What It Does

Clawdbot Canvas displays persistent, real-time information widgets — progress bars, status cards, lists, markdown content, and custom components. An AI agent (or any HTTP client) creates and updates cards through a simple REST API, and the dashboard updates instantly via Server-Sent Events.

Cards persist across server restarts. Users can dismiss any card (which archives it), and restore cards from the archive drawer.

## Quick Start

```bash
git clone https://github.com/rowantrollope/clawdbot-canvas.git
cd clawdbot-canvas
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — or visit `/demo` to see sample cards.

## Demo Mode

Visit `/demo` or append `?demo` to load sample cards showcasing each card type.

## Clawdbot Integration

The `skill/` directory contains everything needed to integrate with [Clawdbot](https://github.com/clawdbot/clawdbot):

```
skill/
├── SKILL.md              # Agent skill definition
└── scripts/
    └── canvas.sh         # Helper script for API calls
```

### Installation

1. **Copy the skill to your Clawdbot workspace:**

```bash
cp -r skill /path/to/your/clawd/skills/clawdbot-canvas
```

2. **Add to your `TOOLS.md`:**

```markdown
## Clawdbot Canvas

Visual dashboard at `http://localhost:5173`

\`\`\`bash
export CANVAS_URL="http://localhost:5173"
export CLAWDBOT_CANVAS_TOKEN="your-token-here"
\`\`\`

**Helper script:** `./skills/clawdbot-canvas/scripts/canvas.sh`
```

3. **Start the canvas server:**

```bash
CLAWDBOT_CANVAS_TOKEN=your-token-here npm run dev
```

The skill will be automatically discovered by Clawdbot. The agent can now push cards to display information on your dashboard.

### What the Agent Can Do

- **Push cards** with status updates, progress bars, task lists, markdown content
- **Update cards** to keep information fresh
- **Archive cards** when no longer relevant
- **Restore cards** from the archive
- Use the **helper script** for quick operations:

```bash
./scripts/canvas.sh list              # List active cards
./scripts/canvas.sh upsert '<json>'   # Create/update card
./scripts/canvas.sh archive <id>      # Archive a card
./scripts/canvas.sh restore <id>      # Restore from archive
./scripts/canvas.sh demo              # Load demo cards
```

## API Reference

Base URL: `http://localhost:5173`

All endpoints require `Authorization: Bearer <token>` header when auth is enabled.

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | Get active/minimized cards |
| GET | `/api/cards?include=archived` | Get all cards including archived |
| GET | `/api/cards?state=archived` | Get only archived cards |
| POST | `/api/cards` | Create or update a card |
| PATCH | `/api/cards/:id` | Partial update |
| DELETE | `/api/cards/:id` | Permanently delete a card |
| DELETE | `/api/cards` | Delete all cards |

### Archive

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cards/:id/archive` | Archive a card |
| POST | `/api/cards/:id/restore` | Restore from archive |
| DELETE | `/api/archive` | Clear all archived cards |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | SSE event stream |
| POST | `/api/batch` | Batch operations |
| GET/POST | `/api/demo` | Load demo cards |
| GET | `/demo` or `?demo` | Load demo cards + redirect |

### Card Schema

```json
{
  "id": "unique-id",
  "type": "progress|status|markdown|list|custom",
  "title": "Card Title",
  "icon": "📊",
  "priority": "high|normal|low",
  "state": "active|minimized|archived",
  "data": { ... }
}
```

### Card Types

| Type | Data Shape | Description |
|------|------------|-------------|
| `progress` | `{ label, progress (0-100), status }` | Progress bar |
| `status` | `{ entries: [{ key, value }] }` | Key-value pairs |
| `markdown` | `{ content }` | Rendered markdown |
| `list` | `{ items: [{ id, text, done }] }` | Checklist |
| `custom` | `{ component, props }` | Built-in component |

**Built-in custom components:** `WorldClock`, `CalendarCard`, `CPUChart`

### Examples

**Create a card:**
```bash
curl -X POST http://localhost:5173/api/cards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "status",
    "type": "status",
    "title": "System Status",
    "icon": "📊",
    "priority": "normal",
    "state": "active",
    "data": {
      "entries": [
        { "key": "API", "value": "✓ Healthy" },
        { "key": "Database", "value": "✓ Connected" }
      ]
    }
  }'
```

**Archive a card:**
```bash
curl -X POST http://localhost:5173/api/cards/status/archive \
  -H "Authorization: Bearer $TOKEN"
```

**Restore a card:**
```bash
curl -X POST http://localhost:5173/api/cards/status/restore \
  -H "Authorization: Bearer $TOKEN"
```

### SSE Events

Connect to `/api/events` to receive real-time updates:

| Event | Payload | Description |
|-------|---------|-------------|
| `upsert` | `{ card }` | Card created/updated |
| `remove` | `{ id }` | Card deleted |
| `archive` | `{ card }` | Card archived |
| `restore` | `{ card }` | Card restored |
| `clear` | `{}` | All cards cleared |

## Security

### Enabling Authentication

Set `CLAWDBOT_CANVAS_TOKEN` to require auth:

```bash
CLAWDBOT_CANVAS_TOKEN=mysecrettoken npm run dev
```

| Client | Auth Method |
|--------|-------------|
| API/curl | `Authorization: Bearer <token>` header |
| Browser | Visit with `?token=<token>` (sets cookie) |
| SSE | `?token=<token>` query param |

### CORS

Allow cross-origin requests:

```bash
CLAWDBOT_CORS_ORIGIN=https://example.com CLAWDBOT_CANVAS_TOKEN=xxx npm run dev
```

## Deployment

### With Tailscale

```bash
npm run build
npx serve dist -l 3000
tailscale funnel 3000
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAWDBOT_CANVAS_TOKEN` | Auth token (optional, enables security) |
| `CLAWDBOT_CORS_ORIGIN` | Allowed CORS origin |

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (state management)
- Server-Sent Events for real-time sync

## License

[MIT](LICENSE)
