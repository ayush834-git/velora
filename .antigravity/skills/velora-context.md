# Velora Project Context

## Stack
Next.js 14 App Router · TypeScript strict mode · Framer Motion · GSAP ScrollTrigger
Tailwind CSS · TMDB API (proxied via Next.js API routes) · Deployed on Vercel

## Architecture
Monorepo. Frontend lives at apps/web/src/. All paths below are relative to that.

## Critical File Map
app/page.tsx                      — orchestrates all scene components, loads movies
app/api/spin/route.ts             — returns ONE random movie, applies filters
app/api/discover/route.ts         — returns movie list for discover/grid sections  
app/api/tmdb/route.ts             — proxy for trending, details, discover
types/movie.ts                    — Movie, BackendMovie, TMDBResponse interfaces
lib/movie-utils.ts                — normalizeBackendMovie(), getBackdropPath(), getPosterPath()
lib/tmdb.ts                       — getImageUrl(), getDiscover(), getTrending()
lib/constants.ts                  — IMAGE_SIZES, TMDB_IMAGE_BASE, MOODS, DEMO_MOVIES
lib/api.ts                        — fetchSpinMovie(), fetchDiscoverMovies() (client-side)
context/FilterContext.tsx          — FiltersState, useFilters(), FilterProvider
components/scenes/HeroScene.tsx   — hero headline + ghost posters
components/scenes/ChaosScene.tsx  — scattered poster explosion
components/scenes/MarqueeScene.tsx — dual-row genre ticker
components/scenes/ManifestoScene.tsx — "Every film is a mirror." + stats
components/scenes/HowItWorksScene.tsx — 01/02/03 ritual steps
components/scenes/CuratedScene.tsx — 6 mood cards grid
components/scenes/DirectorPicksScene.tsx — horizontal drag carousel
components/scenes/SpinRitual.tsx  — main spin interaction
components/scenes/SpinScene.tsx   — (secondary spin scene)
components/scenes/ResultScene.tsx — cinematic result banner after spin
components/scenes/GridScene.tsx   — "Continue Exploring" grid
components/scenes/FooterScene.tsx — 3-column footer with watermark
components/ui/FilterPanel.tsx     — glassmorphic filter drawer
components/ui/Navbar.tsx          — top navigation with animated filter chips
components/ui/ParallaxBackground.tsx — ambient background layer

## Design Tokens (globals.css CSS variables)
--color-golden-warm   warm amber, primary accent colour
--color-ink           near-black, main text
--color-ink-soft      medium grey, body text
--color-ink-muted     light grey, labels/captions
--color-cream         lightest background
--color-cream-warm    warm off-white background
--font-display        cinematic serif (variable)
--font-body           sans-serif (variable)
--text-hero           responsive hero size
--text-headline       responsive h2 size
--text-subheadline    responsive h3 size
--text-body           responsive body size

## MOODS constant (from lib/constants.ts) — use THESE id strings
{ id: "mind-bending", label: "Mind-Bending", genreIds: [878, 9648, 53] }
{ id: "comfort",      label: "Comfort",      genreIds: [35, 10751, 16] }
{ id: "dark",         label: "Dark",         genreIds: [27, 53, 80]    }
{ id: "romantic",     label: "Romantic",     genreIds: [10749, 18]     }
{ id: "epic",         label: "Epic",         genreIds: [28, 12, 14]    }
{ id: "underrated",   label: "Underrated",   genreIds: [18, 36, 10402] }

## Coding Conventions
- All new components: "use client" directive unless purely static
- Animations: Framer Motion for component-level, GSAP for scroll-triggered
- Images: ALWAYS use Next.js <Image> from "next/image" — NEVER use <img>
- Tailwind classes preferred; inline styles only for CSS variable/dynamic values
- Scroll reveals: useInView from framer-motion (once: true, margin: "-10%")
- GSAP: always useLayoutEffect + gsap.context(); always return ctx.revert()
- New scene components: accept `movies: Movie[]` prop, added to app/page.tsx
- TypeScript: fix ALL type errors before committing, run npm run build to verify
