# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clawdbot Canvas is a widget-based dashboard controlled programmatically by an AI assistant (Jarvis). It displays persistent, real-time information widgets alongside text-based chat - things like progress bars, status cards, lists, and markdown content.

## Commands

```bash
npm run dev      # Start Vite dev server (accessible via Tailscale)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (uses `@import "tailwindcss"` syntax, not `@tailwind` directives)
- Shadcn/UI components (in `src/components/ui/`)
- Zustand for state management

### Key Directories
- `src/components/ui/` - Shadcn/UI primitives (Card, Progress, Checkbox)
- `src/components/Card/` - Widget card system (CardContainer, CardContent, MinimizedCard)
- `src/store/` - Zustand stores (cardStore manages all widget state)
- `src/types/` - TypeScript interfaces for cards and widget data

### Path Alias
`@/` maps to `src/` (configured in vite.config.ts and tsconfig.json)

### Widget System
Cards are the core abstraction. Each card has:
- `type`: 'progress' | 'status' | 'markdown' | 'list'
- `state`: 'active' | 'minimized' (user state changes are preserved on updates)
- `priority`: 'high' | 'normal' | 'low' (affects sort order)
- `data`: Type-specific payload (ProgressData, StatusData, etc.)

Type guards in `src/types/card.ts` help narrow card data types.

### State Management
`useCardStore` (Zustand) handles all card operations:
- `upsert()` - Create or update card (respects user state changes)
- `minimize()/expand()` - Toggle card visibility
- `getActiveCards()/getMinimizedCards()` - Sorted card lists

## Design Guidelines

Apple-inspired minimalist design. Reference: macOS/iOS, Linear, Raycast, Arc browser.

- Colors: Neutral base, `#007AFF` for interactive elements, `#34c759` for success
- Spacing: 4px base scale, generous whitespace
- Motion: 200-300ms transitions, subtle and purposeful
- Typography: System fonts (SF Pro / Inter), limited weights

## Future Integration

The canvas will connect to Clawdbot Gateway via WebSocket to receive widget commands (`upsert`, `remove`, `clear`, `batch`). See PRD.md for the full protocol spec.
