
# VELORA

### *Today, fate chooses your film.*

An AI-powered cinematic ritual for movie discovery. One click. One film. No paradox of choice.

**[velora-web-pink.vercel.app](https://velora-web-pink.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=flat-square&logo=framer)
![TMDB](https://img.shields.io/badge/TMDB_API-01D277?style=flat-square&logo=themoviedatabase&logoColor=white)

</div>

---

## What is Velora

Velora reframes movie discovery as a ritual rather than a search engine. Instead of browsing endless lists, you spin — and fate surfaces one film chosen for this exact moment.

The algorithm weights quality, cultural resonance, and obscurity. The AI writes a reason why this film found you today. The interface makes the act of choosing feel intentional.

---

## Features

**The Spin**
- One-click random film discovery powered by the TMDB Discover API
- Weighted random selection — higher-rated films surface more often but rarer gems still appear
- Decelerating flash animation with real film posters cycling before the reveal
- 3D poster tilt that follows cursor position on the result card

**Smart Filters**
- Filter by genre, mood, era, language, and minimum rating
- Mood maps to TMDB genre combinations (e.g. "Mind-Bending" → Sci-Fi + Mystery + Thriller)
- Filters persist across spins within a session
- Active filters displayed inline below the navbar

**AI Film Commentary**
- Each spin result includes an AI-generated reason why this film fits your current mood and filters
- Powered by Claude via the Anthropic API
- Falls back to a handwritten template if the API is unavailable

**Browse Page**
- 12 genre rows with horizontal scroll and momentum physics
- Skeleton loaders in exact card dimensions while fetching
- In-view entrance animations per row as you scroll

**Watchlist**
- Add any film to your watchlist from any card with the `+` button
- Persisted to localStorage — survives page refreshes
- Dedicated `/watchlist` page with full card grid

**Trailer Modal**
- Watch trailers in-page without leaving Velora
- YouTube embed with autoplay, ESC to close, backdrop blur overlay
- Spring scale animation from the trigger button

**Cinematic UI System**
- 5-layer atmospheric parallax background (amber → champagne → blush → sky → lavender)
- Each layer drifts on a separate CSS animation loop (24s–38s) with GPU-only transforms
- Custom two-element cursor — gold dot + lagging outer ring that expands with context labels
- Animated film grain overlay at 2.5% opacity — shifts position at 12fps like a real projector
- Lenis smooth scroll across all pages
- Scroll progress bar in the navbar
- All animations respect `prefers-reduced-motion`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion + GSAP |
| Smooth Scroll | Lenis |
| Data | TMDB API |
| AI Commentary | Anthropic Claude API |
| Deployment | Vercel |

---

## Project Structure

```
velora-main/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── api/
│   │   │   │   │   ├── spin/         # Film discovery endpoint
│   │   │   │   │   ├── film-reason/  # AI commentary endpoint
│   │   │   │   │   ├── discover/     # Browse genre rows
│   │   │   │   │   ├── tmdb/         # TMDB proxy
│   │   │   │   │   └── watch-providers/
│   │   │   │   ├── browse/           # Browse page
│   │   │   │   ├── watchlist/        # Watchlist page
│   │   │   │   ├── globals.css       # Design tokens + grain + atmosphere
│   │   │   │   ├── layout.tsx        # Root layout + providers
│   │   │   │   └── page.tsx          # Home page (scene composition)
│   │   │   ├── components/
│   │   │   │   ├── scenes/           # Full-page scene components
│   │   │   │   │   ├── HeroScene.tsx
│   │   │   │   │   ├── SpinRitual.tsx
│   │   │   │   │   ├── ResultScene.tsx
│   │   │   │   │   ├── ConstellationScene.tsx
│   │   │   │   │   ├── CuratedScene.tsx
│   │   │   │   │   ├── MoodClockScene.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── ui/               # Reusable UI components
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── FilterPanel.tsx
│   │   │   │   │   ├── MagneticButton.tsx
│   │   │   │   │   ├── TrailerModal.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── VeloraBackground.tsx  # 5-layer parallax system
│   │   │   │   └── VeloraCursor.tsx      # Custom cursor
│   │   │   ├── context/
│   │   │   │   └── FilterContext.tsx     # Global filter state
│   │   │   ├── hooks/
│   │   │   │   ├── useWatchlist.ts
│   │   │   │   ├── useReducedMotion.ts
│   │   │   │   └── useMagnetHover.ts
│   │   │   ├── lib/
│   │   │   │   ├── velora-background.ts  # Parallax RAF engine
│   │   │   │   └── tmdb.ts
│   │   │   └── styles/
│   │   │       └── velora-background.css # Layer CSS + drift animations
│   │   └── public/
│   │       └── assets/backgrounds/       # 5 processed AVIF gradient images
│   └── api/                          # Express API scaffold (optional)
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- An [Anthropic API key](https://console.anthropic.com/) for AI commentary (optional — falls back gracefully)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/velora.git
cd velora

# Install dependencies
cd apps/web
npm install
```

### Environment Variables

Create `apps/web/.env.local`:

```env
# TMDB — required for all film data
TMDB_API_KEY=your_tmdb_api_key_here
# OR use the read access token (preferred)
TMDB_READ_TOKEN=your_tmdb_read_token_here

# Anthropic — optional, enables AI film commentary
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

> **TMDB_READ_TOKEN vs TMDB_API_KEY:** The read token (Bearer auth) is preferred. If you only have an API key, the app will use query-param auth automatically.

### Run Locally

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
cd apps/web
npm run build
npm run start
```

---

## How the Spin Algorithm Works

The `/api/spin` endpoint does more than pick a random film:

1. **Filter resolution** — Genre names map to TMDB IDs. Mood strings expand into genre ID combinations. Era strings map to release date ranges. Language names map to ISO 639-1 codes.

2. **Dynamic vote floor** — Unfiltered spins require `vote_count ≥ 200` to surface quality films. Filtered spins lower this to `50` (or `25` for classics pre-1980) to access a deeper library.

3. **Randomised sort** — Each request picks randomly from 5 TMDB sort options (`vote_average.desc`, `popularity.desc`, `revenue.desc`, `release_date.desc`, `vote_count.desc`) so results never feel repetitive.

4. **True page randomisation** — The endpoint first probes page 1 to get `total_pages`, then requests a genuinely random page across the full result set (up to TMDB's 500-page cap).

5. **Weighted selection** — From the returned 20 results, a film is chosen by weighted random selection. Weight = `vote_average`. An 8.5-rated film is ~8.5× more likely to be chosen than a 1.0-rated film, but lower-rated films can still surface.

6. **Cascading fallback** — If filters return zero results, the floor drops. If still empty, filters are stripped entirely. A result is always returned.

---

## Background Layer System

The atmospheric background uses 5 stacked AVIF gradient images processed from AI-generated PNGs:

| Layer | Identity | Opacity | Blend Mode | Parallax Speed |
|---|---|---|---|---|
| 1 | Warm Amber | 0.32 | soft-light | 0.05x scroll |
| 2 | Champagne Ivory | 0.28 | soft-light | 0.08x scroll |
| 3 | Blush Pink | 0.22 | overlay | 0.10x scroll |
| 4 | Sky Blue | 0.18 | soft-light | 0.13x scroll |
| 5 | Lavender | 0.15 | soft-light | 0.16x scroll |

Each layer drifts independently on a CSS `::before` pseudo-element (so drift and JS parallax transforms never conflict). Layers 4 and 5 lazy-load 800ms after page load. The JS parallax engine uses linear interpolation (`lerp = 0.06`) for premium smoothness rather than direct scroll event transforms.

---

## Deployment

Velora is deployed on Vercel. The `apps/web` directory is the project root.

**Vercel environment variables to set:**
```
TMDB_READ_TOKEN
ANTHROPIC_API_KEY
```

No build configuration changes needed — Next.js is detected automatically.

---

## Acknowledgements

- Film data from [The Movie Database (TMDB)](https://www.themoviedb.org/)
- AI commentary by [Anthropic Claude](https://anthropic.com/)
- Smooth scroll by [Lenis](https://lenis.darkroom.engineering/)
- Animation by [Framer Motion](https://www.framer.com/motion/) and [GSAP](https://gsap.com/)

---

<div align="center">

*The reel has not ended. It never does.*
*Every film is a life — every viewing, a rebirth.*

**[velora-web-pink.vercel.app](https://velora-web-pink.vercel.app)**

</div>
