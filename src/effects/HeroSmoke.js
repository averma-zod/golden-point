/**
 * HeroSmokeEffect — Dark velvet ambient smoke/fog in the hero background
 * Creates layered translucent smoke clouds that drift slowly.
 */

export class HeroSmokeEffect {
  constructor(containerEl) {
    this.container = containerEl;
    this.canvas = null;
    this.ctx = null;
    this.clouds = [];
    this.isActive = true;
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hero-smoke-canvas';
    this.canvas.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 0; opacity: 0.65;
    `;
    this.container.style.position = 'relative';
    this.container.insertBefore(this.canvas, this.container.firstChild);
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse & Touch influence on smoke
    const updatePointer = (clientX, clientY) => {
      const rect = this.container.getBoundingClientRect();
      this.mouseX = (clientX - rect.left) / rect.width;
      this.mouseY = (clientY - rect.top) / rect.height;
    };

    this.container.addEventListener('mousemove', (e) => {
      updatePointer(e.clientX, e.clientY);
    });

    this.container.addEventListener('touchmove', (e) => {
      if (e.touches.length) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Create cloud blobs: 6 on mobile, 12 on desktop
    const isMobile = window.innerWidth <= 920;
    const cloudCount = isMobile ? 6 : 12;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 180 + 80,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.12 + 0.03,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.008 + 0.003,
        color: Math.random() > 0.6
          ? { r: 30, g: 24, b: 12 }  // dark amber smoke
          : { r: 18, g: 14, b: 8 },   // near-black smoke
      });
    }

    this.animate();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    const isMobile = window.innerWidth <= 920;
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  animate() {
    if (!this.isActive) return;
    requestAnimationFrame(() => this.animate());

    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Mouse repulsion influence
    const mxWorld = this.mouseX * this.width;
    const myWorld = this.mouseY * this.height;

    for (const c of this.clouds) {
      c.phase += c.pulseSpeed;
      const pulseAlpha = c.alpha * (0.7 + 0.3 * Math.sin(c.phase));

      // Move with subtle drift
      c.x += c.vx + Math.sin(this.time * 0.5 + c.phase) * 0.2;
      c.y += c.vy + Math.cos(this.time * 0.3 + c.phase) * 0.15;

      // Mouse influence — push smoke away
      const dx = c.x - mxWorld;
      const dy = c.y - myWorld;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        const force = (250 - dist) / 250 * 0.5;
        c.x += (dx / dist) * force;
        c.y += (dy / dist) * force;
      }

      // Wrap around
      if (c.x < -c.radius) c.x = this.width + c.radius;
      if (c.x > this.width + c.radius) c.x = -c.radius;
      if (c.y < -c.radius) c.y = this.height + c.radius;
      if (c.y > this.height + c.radius) c.y = -c.radius;

      // Draw radial gradient cloud
      const grad = this.ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
      grad.addColorStop(0, `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${pulseAlpha})`);
      grad.addColorStop(0.5, `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${pulseAlpha * 0.4})`);
      grad.addColorStop(1, `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0)`);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2);
    }

    // Add subtle golden haze at bottom
    const bottomGrad = this.ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
    bottomGrad.addColorStop(0, 'rgba(223, 183, 88, 0)');
    bottomGrad.addColorStop(1, `rgba(223, 183, 88, ${0.03 + 0.02 * Math.sin(this.time * 0.5)})`);
    this.ctx.fillStyle = bottomGrad;
    this.ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);
  }

  destroy() {
    this.isActive = false;
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
