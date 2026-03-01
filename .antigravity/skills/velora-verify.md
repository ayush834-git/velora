# Velora Browser Verification Checklist

Run these checks using browser control after completing any task group.

## Core: ResultScene after spin
1. Open localhost:3000 (or velora-web-pink.vercel.app)
2. Click SPIN NOW in navbar
3. Scroll to the ResultScene (cinematic banner)
VERIFY ALL of the following:
  ✓ Movie poster card is visible (not blank/white)
  ✓ A coloured, blurred backdrop image fills the background (not a plain gradient)
  ✓ Movie title renders in large serif font
  ✓ Overview/synopsis paragraph appears (not "Preparing your next cinematic pick...")
  ✓ Rating badge (golden circle top-right of poster) shows a decimal number like "8.1"
  ✓ Year · rating · language metadata row appears below the title
Take a screenshot of this section as verification artifact.

## Filters: language filter
1. Click Filters button in navbar
2. Select "Japanese" language chip
3. Close panel
4. Click SPIN NOW
5. Scroll to ResultScene
VERIFY: Film shown is Japanese-language (check original_language value, or recognise Japanese cinema)
Take a screenshot.

## Filters: mood filter  
1. Open Filters → select "Dark" mood → close
2. Click SPIN NOW
VERIFY: Result is a horror/thriller/crime film
Take a screenshot.

## Filter Chip Bar
1. With any filter active, look at the area below the navbar
VERIFY: A slim animated bar shows "Filtering by [ChipName ×]  Clear all"
2. Click the × on a chip
VERIFY: Chip disappears with spring animation, bar collapses if no filters remain
Take a screenshot of both states.

## Hero Headline (word-break fix)
1. Open browser devtools → set viewport width to 768px
VERIFY: Hero headline "Tonight, fate chooses your film." wraps cleanly — no mid-word split
Take a screenshot at 768px width.

## Empty Space Fill
1. On full desktop (1280px+), scroll continuously from top to bottom
VERIFY: No large blank gradient zone between the scattered posters and "What story are you craving?"
Content should flow: ChaosScene → Marquee Ticker → Manifesto → How It Works → CuratedScene
Take a scrolled screenshot showing the transition area.

## New Sections Visible
VERIFY the following sections exist when scrolling down:
  ✓ Two rows of scrolling genre/mood text (MarqueeScene)
  ✓ "Every film is a mirror." oversized headline with stats (ManifestoScene)
  ✓ 01 / 02 / 03 three-column step layout (HowItWorksScene)
  ✓ Horizontal draggable film cards with "Essential" badges (DirectorPicksScene)
  ✓ Redesigned footer with giant VELORA watermark letterform
Take one screenshot of each.
