class VeloraBackground {
  private layers: Array<{ el: HTMLElement; speed: number; targetOpacity: number }> = [];
  private currentY = 0;
  private targetY  = 0;
  private lerp     = 0.06;
  private rafId: number | null = null;

  private readonly config = [
    { selector: '.velora-bg-layer--amber',      speed: 0.05, targetOpacity: 0.32 },
    { selector: '.velora-bg-layer--champagne',  speed: 0.08, targetOpacity: 0.28 },
    { selector: '.velora-bg-layer--blush',      speed: 0.10, targetOpacity: 0.22 },
    { selector: '.velora-bg-layer--sky',        speed: 0.13, targetOpacity: 0.18 },
    { selector: '.velora-bg-layer--lavender',   speed: 0.16, targetOpacity: 0.15 },
  ];

  init() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) { this.lazyLoad(); return; }

    this.layers = this.config
      .map(c => ({ ...c, el: document.querySelector<HTMLElement>(c.selector)! }))
      .filter(l => l.el);

    if (window.innerWidth < 768) {
      this.layers = this.layers.map(l => ({ ...l, speed: l.speed * 0.4 }));
      this.lerp = 0.04;
    }

    window.addEventListener('scroll', () => { this.targetY = window.scrollY; }, { passive: true });
    this.tick();
    if (document.readyState === 'complete') {
      setTimeout(() => this.lazyLoad(), 800);
    } else {
      window.addEventListener('load', () => setTimeout(() => this.lazyLoad(), 800), { once: true });
    }
  }

  private tick() {
    this.currentY += (this.targetY - this.currentY) * this.lerp;
    for (const { el, speed } of this.layers) {
      el.style.transform = `translate3d(0,${(this.currentY * speed).toFixed(2)}px,0)`;
    }
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  private lazyLoad() {
    const lazy = [
      { selector: '.velora-bg-layer--sky',      opacity: 0.18 },
      { selector: '.velora-bg-layer--lavender', opacity: 0.15 },
    ];
    lazy.forEach(({ selector, opacity }) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = String(opacity);
      }));
    });
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

export default VeloraBackground;
