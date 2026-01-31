# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

Q-Score is an internal team points tracking webapp for Quango Inc, built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

### Data Flow

- **State Management**: React useState in `page.tsx` holds the `entries` array as the single source of truth
- **Persistence**: `src/lib/storage.ts` handles localStorage with `qscore_entries` key, converting Date objects to/from ISO strings
- **Data Updates**: Storage functions return the updated entries array, which gets set to state, triggering re-renders of all dependent components (leaderboard, activity feed, team totals)

### Key Files

- `src/lib/types.ts` - Core interfaces: `TeamMember`, `Task`, `PointEntry`
- `src/lib/data.ts` - Static team members and tasks definitions
- `src/lib/storage.ts` - localStorage CRUD operations for point entries
- `src/lib/dates.ts` - Week calculation utilities for filtering entries
- `src/components/WeeklyLeaderboard.tsx` - Recharts line/bar charts with time period toggle
- `src/components/ActivityFeed.tsx` - Entry list with inline edit/delete functionality

### Design System

Dark theme with crimson accent (`#C41E3A`). CSS variables defined in `globals.css` and exposed to Tailwind via `@theme inline` block:
- `bg-background`, `text-foreground`, `text-muted`, `bg-card`, `border-border`, `bg-crimson`, `bg-crimson-dark`

Custom utilities: `.animate-fade-in`, `.stagger-1` through `.stagger-6`, `.crimson-glow`

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json)
