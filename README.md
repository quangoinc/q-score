# Q-Score

Internal team points tracking webapp for **Quango Inc**.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font**: DM Sans (Google Fonts)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
src/
├── app/
│   ├── globals.css    # Global styles, CSS variables, animations
│   ├── layout.tsx     # Root layout with metadata
│   └── page.tsx       # Landing page
```

## Design System

The app uses a dark theme with an electric lime accent:

- **Background**: `#0f0f0f`
- **Foreground**: `#fafafa`
- **Accent**: `#BFFF00` (electric lime)
- **Muted**: `#6b6b6b`
- **Card**: `#1a1a1a`
- **Border**: `#2a2a2a`

CSS variables are defined in `globals.css` and integrated with Tailwind.

## Next Steps

Potential features to build incrementally:

1. **User Authentication** - Login system for team members
2. **Points Dashboard** - View individual and team scores
3. **Leaderboard** - Rankings and competition tracking
4. **Point Assignment** - Admin interface to award points
5. **Activity Feed** - Recent point transactions
6. **Rewards System** - Redeemable rewards for points
7. **Teams/Groups** - Organize users into teams
8. **Analytics** - Charts and insights over time

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```
