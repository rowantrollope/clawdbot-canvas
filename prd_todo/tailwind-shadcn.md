# PRD: Tailwind CSS v4 + Shadcn/UI Integration

## Overview
Properly integrate Tailwind CSS v4 and Shadcn/UI into the Clawdbot Canvas project.

## Current State
- Vite + React + TypeScript project
- Tailwind v4 installed but broken (PostCSS plugin issue)
- App.tsx uses inline styles as workaround
- Design: Apple-esque, minimal, clean

## Tasks

### Task 1: Fix Tailwind CSS v4 [HIGH PRIORITY] [ ]
- Ensure `@tailwindcss/postcss` is installed
- Fix `postcss.config.js` to use `@tailwindcss/postcss` 
- Update `src/index.css` with proper Tailwind v4 imports
- Verify Tailwind classes work

### Task 2: Install Shadcn/UI [HIGH PRIORITY] [ ]
- Follow Vite installation: https://ui.shadcn.com/docs/installation/vite
- Use TypeScript, neutral color palette
- Initialize with `npx shadcn@latest init`

### Task 3: Add Shadcn Card Component [MEDIUM PRIORITY] [ ]
- Install Card component: `npx shadcn@latest add card`
- Install any other useful base components

### Task 4: Refactor App.tsx [MEDIUM PRIORITY] [ ]
- Replace inline styles with Tailwind classes
- Use Shadcn Card for the white card containers
- Keep exact same visual design (Apple-esque)
- Maintain: header, progress bar, todo list sections

### Task 5: Verify Everything Works [HIGH PRIORITY] [ ]
- Dev server should show updated UI
- No build errors
- Visual design preserved

## Design Requirements
- Apple-esque aesthetic
- Clean white cards with subtle shadows
- Lots of whitespace
- Neutral/gray color palette
- SF-style typography (-apple-system font stack)

## Success Criteria
- Tailwind classes work throughout the app
- Shadcn/UI components available
- Same visual appearance as before
- No console errors
