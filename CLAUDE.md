# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clawdbot Canvas is a widget-based dashboard controlled programmatically by AI agents via REST API. It displays real-time information widgets — progress bars, status cards, lists, markdown content, and custom components.

## Commands

```bash
npm run dev      # Start Vite dev server (binds 0.0.0.0, works over Tailscale)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (`@import "tailwindcss"` syntax)
- Shadcn/UI components (`src/components/ui/`)
- Zustand for state management

### Key Directories
- `src/components/ui/` — Shadcn/UI primitives (Card, Progress, Checkbox)
- `src/components/Card/` — Widget card system (CardContainer, CardContent, MinimizedCard)
- `src/components/cards/` — Custom card components (CalendarCard, CPUChart)
- `src/store/` — Zustand stores (cardStore manages all widget state)
- `src/types/` — TypeScript interfaces for cards and widget data
- `src/server/` — Vite middleware API server

### Path Alias
`@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)

### Widget System
Cards are the core abstraction. Each card has:
- `type`: 'progress' | 'status' | 'markdown' | 'list' | 'custom'
- `state`: 'active' | 'minimized'
- `priority`: 'high' | 'normal' | 'low' (affects sort order)
- `data`: Type-specific payload

### API Endpoints
- `GET /api/cards` — list all cards
- `POST /api/cards` — upsert card (full body)
- `PATCH /api/cards/:id` — partial update
- `DELETE /api/cards/:id` — remove one card
- `DELETE /api/cards` — clear all
- `POST /api/batch` — batch operations (`upsert`, `remove`, `clear`)
- `GET /api/events` — SSE stream (events: `upsert`, `remove`, `clear`)

### State Management
`useCardStore` (Zustand) handles all card operations:
- `upsert()` — create or update card (respects user state changes)
- `minimize()/expand()` — toggle card visibility

## Design Guidelines

Apple-inspired minimalist design. Reference: macOS/iOS, Linear, Raycast, Arc browser.

- Colors: Neutral base, `#007AFF` interactive, `#34c759` success
- Spacing: 4px base scale, generous whitespace
- Motion: 200-300ms transitions, subtle and purposeful
- Typography: System fonts (SF Pro / Inter), limited weights
