/**
 * ScrollReveal — Intersection Observer-based scroll-triggered animations
 * Reveals elements with staggered, cinematic entrance animations on scroll.
 */

export class ScrollReveal {
  constructor() {
    this.observer = null;
    this.revealQueue = [];
    this.staggerDelay = 80;
  }

  init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.revealDelay || '0', 10);
            const style = el.dataset.revealStyle || 'fade-up';

            setTimeout(() => {
              el.classList.add('revealed');
              el.classList.add(`reveal-${style}`);
            }, delay);

            this.observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe all elements with [data-reveal]
    this.scan();

    // MutationObserver to pick up dynamically added elements
    this.mutObserver = new MutationObserver(() => this.scan());
    this.mutObserver.observe(document.body, { childList: true, subtree: true });
  }

  scan() {
    document.querySelectorAll('[data-reveal]:not(.reveal-observed)').forEach((el) => {
      el.classList.add('reveal-observed');
      this.observer.observe(el);
    });
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    if (this.mutObserver) this.mutObserver.disconnect();
  }
}

/**
 * SmoothCountUp — Animated number counter with easing
 */
export class SmoothCountUp {
  static animate(element, target, duration = 1200, prefix = '', suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (target - start) * easeOutExpo(progress));

      element.textContent = `${prefix}${value.toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }
}

/**
 * MagneticButton — Elements that subtly pull toward cursor on hover
 */
export class MagneticEffect {
  static apply(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const pull = 0.25;

        el.style.transform = `translate(${x * pull}px, ${y * pull}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });
  }
}

/**
 * TypewriterFX — Character-by-character reveal for hero text
 */
export class TypewriterFX {
  static run(element, speed = 40) {
    if (!element) return;
    const text = element.textContent;
    element.textContent = '';
    element.style.visibility = 'visible';
    element.style.borderRight = '2px solid var(--gold-pure)';

    let i = 0;
    const interval = setInterval(() => {
      element.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // Blink cursor then remove
        setTimeout(() => {
          element.style.borderRight = 'none';
        }, 1500);
      }
    }, speed);
  }
}

/**
 * ParallaxLayer — Depth-based scroll parallax for background elements
 */
export class ParallaxLayer {
  constructor() {
    this.layers = [];
    this.ticking = false;
  }

  register(element, speed = 0.3) {
    this.layers.push({ element, speed });
  }

  init() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          this.layers.forEach(({ element, speed }) => {
            if (element) {
              element.style.transform = `translateY(${scrollY * speed}px)`;
            }
          });
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }
}

/**
 * GlowPulse — Applies a pulsing golden glow animation to elements
 */
export function applyGlowPulse(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('glow-pulse-active');
  });
}

/**
 * RippleEffect — Material-style ripple on click for buttons
 */
export function initRippleButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}
