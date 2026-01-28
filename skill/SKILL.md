---
name: clawdbot-canvas
description: Display real-time cards and widgets on a persistent visual dashboard. Use when presenting information to users as cards, widgets, status displays, progress indicators, task lists, or any visual dashboard content. Supports active cards (visible), archived cards (recoverable), and various card types including progress bars, status entries, markdown, lists, and custom components.
---

# Clawdbot Canvas

Push cards to display information on the user's visual dashboard. You are the curator — decide what shows and what gets archived.

## Setup

```bash
export CANVAS_URL="http://localhost:5173"  # Or deployed URL
export CLAWDBOT_CANVAS_TOKEN="your-token"
```

## Helper Script

Use `scripts/canvas.sh` for quick operations:

```bash
./scripts/canvas.sh list              # Active cards
./scripts/canvas.sh list-all          # Include archived
./scripts/canvas.sh upsert '<json>'   # Create/update
./scripts/canvas.sh archive <id>      # Archive
./scripts/canvas.sh restore <id>      # Restore
./scripts/canvas.sh delete <id>       # Permanent delete
./scripts/canvas.sh clear-archive     # Clear all archived
./scripts/canvas.sh demo              # Load demo cards
```

## Card Types

**progress** — Progress bar with status
```json
{"type": "progress", "data": {"label": "Building...", "progress": 42, "status": "active"}}
```

**status** — Key-value pairs
```json
{"type": "status", "data": {"entries": [{"key": "Location", "value": "Tel Aviv"}]}}
```

**markdown** — Rich text content
```json
{"type": "markdown", "data": {"content": "# Title\n\nSome **bold** text."}}
```

**list** — Checklist items
```json
{"type": "list", "data": {"items": [{"id": "1", "text": "Task", "done": false}]}}
```

**custom** — Built-in components (WorldClock, CalendarCard, CPUChart)
```json
{"type": "custom", "data": {"component": "WorldClock", "props": {"cities": [{"name": "NYC", "timezone": "America/New_York"}]}}}
```

## Full Card Schema

```json
{
  "id": "unique-id",
  "type": "markdown",
  "title": "Card Title",
  "icon": "📊",
  "priority": "normal",
  "state": "active",
  "data": { ... }
}
```

| Field | Required | Values |
|-------|----------|--------|
| id | yes | Unique string (use descriptive names) |
| type | yes | progress, status, markdown, list, custom |
| title | yes | Display title |
| icon | no | Emoji |
| priority | yes | high, normal, low |
| state | yes | active, minimized, archived |
| data | yes | Type-specific (see above) |

## API Reference

All endpoints require `Authorization: Bearer $TOKEN` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cards | Active/minimized cards |
| GET | /api/cards?include=archived | All cards |
| GET | /api/cards?state=archived | Only archived |
| POST | /api/cards | Upsert card (full JSON body) |
| PATCH | /api/cards/:id | Partial update |
| POST | /api/cards/:id/archive | Archive card |
| POST | /api/cards/:id/restore | Restore from archive |
| DELETE | /api/cards/:id | Permanent delete |
| DELETE | /api/archive | Clear all archived cards |
| POST | /api/batch | Batch operations |
| POST | /api/demo | Load demo cards |

## Curl Examples

**Create a card:**
```bash
curl -X POST "$CANVAS_URL/api/cards" \
  -H "Authorization: Bearer $CLAWDBOT_CANVAS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"weather","type":"status","title":"Weather","icon":"🌤️","priority":"low","state":"active","data":{"entries":[{"key":"SF","value":"68°F Sunny"}]}}'
```

**Update card data:**
```bash
curl -X PATCH "$CANVAS_URL/api/cards/weather" \
  -H "Authorization: Bearer $CLAWDBOT_CANVAS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"entries":[{"key":"SF","value":"72°F Clear"}]}}'
```

**Archive:**
```bash
curl -X POST "$CANVAS_URL/api/cards/weather/archive" \
  -H "Authorization: Bearer $CLAWDBOT_CANVAS_TOKEN"
```

## Best Practices

1. **Use stable, descriptive IDs** — `travel-status` not `card-123`
2. **Archive > Delete** — let users recover cards from archive
3. **Keep cards fresh** — stale info erodes trust
4. **Priority matters** — high cards sort first

## Card Lifecycle

```
Create (POST /api/cards) → Active on dashboard
Update (PATCH) → Refresh content
Archive (POST .../archive) → Hidden, recoverable
Restore (POST .../restore) → Back to active
Delete (DELETE) → Gone forever
```
