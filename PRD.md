# Clawdbot Canvas - Product Requirements Document

## Overview

Clawdbot Canvas is a widget-based dashboard that Jarvis (AI assistant) controls programmatically. It provides a visual companion to text-based chat, allowing Jarvis to display persistent, real-time information widgets.

## Goals

1. **Visual communication** - Give Jarvis a way to show information visually, not just text
2. **Real-time updates** - Widgets update instantly without page refresh
3. **Minimalist UX** - Apple-inspired design that stays out of the way
4. **AI-controlled** - Jarvis creates, updates, and removes widgets via API

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/UI
- **AI Components**: Vercel AI Elements
- **Real-time**: WebSocket connection to Clawdbot Gateway
- **Hosting**: 
  - Dev: EC2 + Tailscale (instant iteration)
  - Prod: Vercel (stable deployments)

### System Flow
```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Jarvis    │ ─────────────────► │   Canvas    │
│  (Gateway)  │  widget commands   │   (React)   │
└─────────────┘                    └─────────────┘
                                         │
                                         ▼
                                   ┌───────────┐
                                   │  Browser  │
                                   │  (Rowan)  │
                                   └───────────┘
```

## Widget Types

### 1. ProgressBar
Shows progress for long-running tasks.

```typescript
interface ProgressWidget {
  type: 'progress'
  id: string
  label: string
  percent: number        // 0-100
  status?: 'active' | 'complete' | 'error'
  subtitle?: string      // e.g., "Building spotify_player..."
}
```

### 2. StatusCard
Key-value information display.

```typescript
interface StatusCardWidget {
  type: 'status-card'
  id: string
  title: string
  items: Array<{
    label: string
    value: string
    status?: 'normal' | 'success' | 'warning' | 'error'
  }>
}
```

### 3. List
Scrollable list of items.

```typescript
interface ListWidget {
  type: 'list'
  id: string
  title: string
  items: Array<{
    id: string
    primary: string
    secondary?: string
    icon?: string
    action?: { label: string, href: string }
  }>
  maxHeight?: number
}
```

### 4. Markdown
Rendered markdown content.

```typescript
interface MarkdownWidget {
  type: 'markdown'
  id: string
  title?: string
  content: string        // Markdown string
}
```

### 5. Calendar
Day/week event view.

```typescript
interface CalendarWidget {
  type: 'calendar'
  id: string
  title?: string
  view: 'day' | 'week'
  events: Array<{
    id: string
    title: string
    start: string        // ISO datetime
    end: string
    color?: string
  }>
}
```

### 6. Chart
Simple data visualization.

```typescript
interface ChartWidget {
  type: 'chart'
  id: string
  title?: string
  chartType: 'line' | 'bar' | 'pie'
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color?: string
    }>
  }
}
```

## Widget API

### Commands

Jarvis sends commands via WebSocket:

```typescript
// Create or update a widget
{ action: 'upsert', widget: WidgetData }

// Remove a widget
{ action: 'remove', id: string }

// Clear all widgets
{ action: 'clear' }

// Batch operations
{ action: 'batch', operations: Command[] }
```

### WebSocket Protocol

```typescript
// Connect to canvas
ws://localhost:5173/ws   // Dev
wss://canvas.example.com/ws  // Prod

// Jarvis → Canvas
{ type: 'command', payload: Command }

// Canvas → Jarvis (acknowledgment)
{ type: 'ack', commandId: string, success: boolean }
```

## User Stories

### Jarvis (AI) Perspective

1. **As Jarvis**, I want to show a progress bar when running long builds, so Rowan can see progress without me spamming the chat.

2. **As Jarvis**, I want to display today's calendar, so Rowan can glance at their schedule.

3. **As Jarvis**, I want to show a status card with system info (CPU, memory, running services), so Rowan knows the server state.

4. **As Jarvis**, I want to render markdown documentation, so I can show formatted information.

5. **As Jarvis**, I want to remove widgets when they're no longer relevant, keeping the canvas clean.

### Rowan (Human) Perspective

1. **As Rowan**, I want to see my calendar at a glance without asking.

2. **As Rowan**, I want to see build progress visually instead of text updates.

3. **As Rowan**, I want the canvas to be minimalist and not distract from chat.

4. **As Rowan**, I want widgets to update in real-time.

5. **As Rowan**, I want the canvas accessible via Tailscale when working locally.

## UI Layout

```
┌──────────────────────────────────────────────┐
│  Clawdbot Canvas                    [🌙] [⚙️] │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐  ┌─────────────┐           │
│  │  Widget 1   │  │  Widget 2   │           │
│  │             │  │             │           │
│  └─────────────┘  └─────────────┘           │
│                                              │
│  ┌─────────────────────────────┐            │
│  │  Widget 3 (full width)      │            │
│  │                             │            │
│  └─────────────────────────────┘            │
│                                              │
└──────────────────────────────────────────────┘
```

- Responsive grid layout
- Widgets auto-arrange
- Dark mode toggle
- Settings for widget size preferences

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up Shadcn/UI + Tailwind
- [ ] Create basic layout (header, grid)
- [ ] Implement WebSocket connection stub
- [ ] Build ProgressBar widget

### Phase 2: Core Widgets
- [ ] StatusCard widget
- [ ] List widget
- [ ] Markdown widget

### Phase 3: Advanced Widgets
- [ ] Calendar widget
- [ ] Chart widget

### Phase 4: Integration
- [ ] Connect to Clawdbot Gateway WebSocket
- [ ] Add widget persistence (localStorage)
- [ ] Dark mode
- [ ] Settings panel

### Phase 5: Polish
- [ ] Animations and transitions
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Documentation

## Success Metrics

1. Jarvis can create/update widgets in <100ms
2. Canvas loads in <1s
3. Zero layout shift when widgets update
4. Works on mobile (responsive)

---

*Last updated: 2026-01-27*
