/**
 * VELORA — Background Parallax Engine
 *
 * Controls scroll-based parallax for the 5 atmospheric gradient layers.
 * Uses RAF + linear interpolation for premium smoothness.
 * Drift animations live in CSS (::before) — no conflict with this transform.
 *
 * Opacity tuning guide:
 *   If muddy:      reduce amber 0.03 at a time
 *   If washed out: increase amber toward 0.35 max
 *   If unreadable: reduce ALL layers by 0.04 simultaneously
 *   Never exceed:  0.38 on any single layer
 */

class VeloraBackground {
  constructor() {
    // Layer config — speed = fraction of scrollY this layer travels
    // Lower speed = feels heavier/further away (depth illusion)
    this.layerConfig = [
      { selector: '.velora-bg-layer--amber',      speed: 0.05, targetOpacity: 0.32 },
      { selector: '.velora-bg-layer--champagne',  speed: 0.08, targetOpacity: 0.28 },
      { selector: '.velora-bg-layer--blush',      speed: 0.10, targetOpacity: 0.22 },
      { selector: '.velora-bg-layer--sky',        speed: 0.13, targetOpacity: 0.18 },
      { selector: '.velora-bg-layer--lavender',   speed: 0.16, targetOpacity: 0.15 },
    ];

    // Lerp state
    this.currentY  = 0;
    this.targetY   = 0;
    this.lerpFactor = 0.06; // 0.04 = ultra-smooth, 0.09 = snappier
    this.rafId     = null;
    this.layers    = [];
  }

  init() {
    // Hard abort — respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Still trigger lazy load so images appear
      this._lazyLoadUpperLayers();
      return;
    }

    // Resolve DOM elements
    this.layers = this.layerConfig
      .map(cfg => ({ ...cfg, el: document.querySelector(cfg.selector) }))
      .filter(({ el }) => el !== null);

    if (this.layers.length === 0) {
      console.warn('[VeloraBackground] No layer elements found in DOM.');
      return;
    }

    // Mobile: reduce all speeds to 40% — parallax is subtler, saves battery
    if (window.innerWidth < 768) {
      this.layers = this.layers.map(l => ({ ...l, speed: l.speed * 0.4 }));
      this.lerpFactor = 0.04;
    }

    // Passive scroll — never blocks scroll thread
    window.addEventListener('scroll', this._onScroll.bind(this), { passive: true });

    // Start animation loop
    this.rafId = requestAnimationFrame(this._tick.bind(this));

    // Lazy load sky and lavender after all critical resources loaded
    window.addEventListener('load', () => this._lazyLoadUpperLayers(), { once: true });
  }

  _onScroll() {
    this.targetY = window.scrollY;
  }

  _tick() {
    // Lerp: smoothly chase the target scroll position
    this.currentY += (this.targetY - this.currentY) * this.lerpFactor;

    for (const { el, speed } of this.layers) {
      // translate3d ONLY — never animate top/left/margin (triggers layout + paint)
      el.style.transform = `translate3d(0, ${(this.currentY * speed).toFixed(2)}px, 0)`;
    }

    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }

  _lazyLoadUpperLayers() {
    // Sky and Lavender are lazy — they contribute least at LCP time
    const lazyTargets = [
      { selector: '.velora-bg-layer--sky',      src: '/assets/backgrounds/velora-bg-sky.avif',      opacity: 0.18 },
      { selector: '.velora-bg-layer--lavender', src: '/assets/backgrounds/velora-bg-lavender.avif', opacity: 0.15 },
    ];

    // Small delay so lazy layers don't compete with LCP paint
    setTimeout(() => {
      lazyTargets.forEach(({ selector, src, opacity }) => {
        const el = document.querySelector(selector);
        if (!el) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
          // Background image is already set in CSS
          // Just need to animate opacity in
          // Double RAF guarantees transition fires after next paint
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.opacity = String(opacity);
            });
          });
        };
      });
    }, 800); // 800ms — after TTI
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('scroll', this._onScroll.bind(this));
  }
}

export default VeloraBackground;
