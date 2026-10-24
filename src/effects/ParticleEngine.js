/**
 * ParticleEngine — GPU-Accelerated Gold Dust & Ambient Particle System
 * Uses Canvas 2D with optimized rendering for gold particle effects.
 * Handles: cursor trails, ambient floating dust, click explosions, scroll-triggered bursts.
 */

export class ParticleEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.cursorTrail = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.isActive = true;
    this.frameId = null;
    this.isMobile = typeof navigator !== 'undefined' && (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 920);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.maxParticles = this.isMobile ? 150 : 450;

    // Gold color palette for particles
    this.goldColors = [
      { r: 250, g: 232, b: 168, a: 1 },   // bright gold
      { r: 223, g: 183, b: 88, a: 1 },    // pure gold
      { r: 255, g: 240, b: 170, a: 1 },   // light gold
      { r: 158, g: 116, b: 32, a: 1 },    // deep gold
      { r: 255, g: 255, b: 220, a: 1 },   // white gold
      { r: 200, g: 160, b: 50, a: 1 },    // burnished gold
    ];
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particle-canvas';
    this.canvas.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 9999;
    `;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 920;
      this.resize();
    });

    // Mouse tracking (Desktop)
    document.addEventListener('mousemove', (e) => {
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.spawnCursorDust(e.clientX, e.clientY);
    });

    // Mobile Touch Trails: Golden ember dust on finger drag
    document.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.spawnClickBurst(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!e.touches.length) return;
      const touch = e.touches[0];
      const dx = touch.clientX - this.lastTouchX;
      const dy = touch.clientY - this.lastTouchY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Throttle touch particle creation to preserve locked 60fps
      if (dist > 12) {
        this.spawnCursorDust(touch.clientX, touch.clientY);
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
      }
    }, { passive: true });

    // Click explosions
    document.addEventListener('click', (e) => {
      if (!this.isMobile) {
        this.spawnClickBurst(e.clientX, e.clientY);
      }
    });

    // Scroll sparkle
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      this.spawnScrollSparkles();
      scrollTimeout = setTimeout(() => {}, 120);
    }, { passive: true });

    // Adaptive ambient particle count: 18 on mobile (vs 40 on desktop)
    const ambientCount = this.isMobile ? 18 : 40;
    this.spawnAmbientParticles(ambientCount);

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  randomGold() {
    return this.goldColors[Math.floor(Math.random() * this.goldColors.length)];
  }

  // --- AMBIENT FLOATING PARTICLES ---
  spawnAmbientParticles(count) {
    for (let i = 0; i < count; i++) {
      const color = this.randomGold();
      this.particles.push({
        type: 'ambient',
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        maxAlpha: Math.random() * 0.4 + 0.1,
        color,
        life: 1,
        decay: 0, // ambient particles don't decay, they loop
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        wobbleAmp: Math.random() * 30 + 10,
        wobbleSpeed: Math.random() * 0.01 + 0.003,
      });
    }
  }

  // --- CURSOR GOLD DUST TRAIL ---
  spawnCursorDust(x, y) {
    const dx = x - this.prevMouseX;
    const dy = y - this.prevMouseY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    const count = Math.min(Math.floor(speed * 0.15) + 1, 4);

    for (let i = 0; i < count; i++) {
      const color = this.randomGold();
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
      const vel = Math.random() * 1.5 + 0.5;

      this.particles.push({
        type: 'cursor',
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * vel * -0.5 + (Math.random() - 0.5) * 0.8,
        vy: Math.sin(angle) * vel * -0.5 - Math.random() * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.4,
        color,
        life: 1,
        decay: Math.random() * 0.015 + 0.012,
        gravity: 0.02,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
      });
    }
  }

  // --- CLICK EXPLOSION BURST ---
  spawnClickBurst(x, y) {
    const count = this.isMobile ? 14 : 25;
    for (let i = 0; i < count; i++) {
      const color = this.randomGold();
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const vel = Math.random() * 4 + 2;

      this.particles.push({
        type: 'burst',
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: Math.random() * 4 + 1.5,
        alpha: 1,
        color,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        gravity: 0.04,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        shimmer: Math.random() > 0.5,
      });
    }

    // Add a central flash
    this.particles.push({
      type: 'flash',
      x,
      y,
      vx: 0,
      vy: 0,
      size: 30,
      alpha: 0.6,
      color: { r: 255, g: 240, b: 180, a: 1 },
      life: 1,
      decay: 0.06,
    });
  }

  // --- SCROLL SPARKLES ---
  spawnScrollSparkles() {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const color = this.randomGold();
      this.particles.push({
        type: 'scroll',
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.3,
        color,
        life: 1,
        decay: Math.random() * 0.01 + 0.008,
      });
    }
  }

  // --- EXTERNAL: Spawn celebration burst (for toast/action events) ---
  spawnCelebrationBurst(x, y, count = 40) {
    this.celebrationBurst(x, y, count);
  }

  celebrationBurst(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      const color = this.randomGold();
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 6 + 2;

      this.particles.push({
        type: 'celebration',
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 2,
        size: Math.random() * 5 + 2,
        alpha: 1,
        color,
        life: 1,
        decay: Math.random() * 0.01 + 0.008,
        gravity: 0.05,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shimmer: true,
      });
    }
  }

  // --- ANIMATION LOOP ---
  animate() {
    if (!this.isActive) return;
    this.frameId = requestAnimationFrame(() => this.animate());

    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & draw all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.type === 'ambient') {
        // Ambient particles float and loop
        p.phase += p.pulseSpeed;
        p.alpha = p.maxAlpha * (0.5 + 0.5 * Math.sin(p.phase));
        p.x += p.vx + Math.sin(this.time * p.wobbleSpeed + p.phase) * 0.3;
        p.y += p.vy;

        // Wrap around
        if (p.y < -10) { p.y = this.height + 10; p.x = Math.random() * this.width; }
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;
      } else {
        // All other particles decay
        p.life -= p.decay;
        p.alpha = p.life * (p.alpha > 0 ? 1 : 0);

        if (p.gravity) p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.rotSpeed) p.rotation += p.rotSpeed;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      this.drawParticle(p);
    }

    // Cap particle count
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }

  drawParticle(p) {
    const ctx = this.ctx;
    ctx.save();

    if (p.type === 'flash') {
      // Radial glow flash
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`);
      grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    } else {
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);

      // Shimmer effect — flicker alpha
      let alpha = p.alpha;
      if (p.shimmer) {
        alpha *= 0.6 + 0.4 * Math.sin(this.time * 8 + p.x);
      }

      // Glow
      ctx.shadowBlur = p.size * 3;
      ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.5})`;

      // Draw the particle
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      ctx.beginPath();

      if (p.size > 2.5 && Math.random() > 0.95) {
        // Occasional diamond shape
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.6, 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.6, 0);
      } else {
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      }

      ctx.fill();
    }

    ctx.restore();
  }

  destroy() {
    this.isActive = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
