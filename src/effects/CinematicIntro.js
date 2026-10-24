import { sounds } from "../utils/audio.js";

/**
 * CinematicIntro — Full-screen high-dopamine landing experience
 * Features: Dark-to-gold transition, interactive break-the-seal gate,
 * screen-shaking particle burst, text reveal, spatial audio cue.
 */

export class CinematicIntro {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.phase = 0;
    this.startTime = 0;
    this.duration = 3200; // ms
    this.isActive = true;
  }

  shouldShow() {
    // Show once per session
    if (sessionStorage.getItem('gp-intro-shown')) return false;
    return true;
  }

  init() {
    if (!this.shouldShow()) {
      if (this.onComplete) this.onComplete();
      return;
    }

    sessionStorage.setItem('gp-intro-shown', 'true');

    this.overlay = document.createElement('div');
    this.overlay.id = 'cinematic-intro';
    this.overlay.innerHTML = `
      <canvas id="intro-canvas"></canvas>
      <div class="intro-content">
        <div class="intro-seal-wrap" id="intro-seal-interactive" title="Tap to Break the Sovereign Seal">
          <img src="./public/images/gp_seal.svg" class="intro-seal pulse-glow" alt="GP Seal" />
          <div class="seal-ring-pulse"></div>
        </div>
        <div class="intro-text-stack">
          <div class="intro-kicker">CLASSIFIED VAULT ACCESS · EST. 2026</div>
          <h1 class="intro-title">THE GOLDEN POINT</h1>
          <div class="intro-tagline">Fortune Favors the Obsessed · Touch the Gold</div>
        </div>
        <div class="intro-enter-cta">
          <button class="intro-enter-btn heartbeat-btn" id="intro-enter-btn">
            <span class="intro-btn-icon">⚡</span>
            <span>BREAK THE SOVEREIGN SEAL</span>
          </button>
          <div class="intro-hint-text">One favour. Zero excuses. Permanent honour.</div>
        </div>
      </div>
    `;
    document.body.prepend(this.overlay);

    this.canvas = document.getElementById('intro-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Allow clicking the seal or the button to trigger explosive reveal
    const triggerBreak = () => this.breakSealAndDismiss();
    document.getElementById('intro-enter-btn').addEventListener('click', triggerBreak);
    document.getElementById('intro-seal-interactive').addEventListener('click', triggerBreak);

    this.startTime = performance.now();
    this.spawnIntroParticles();
    this.animate();

    // Auto-reveal content after a beat
    setTimeout(() => {
      this.overlay.querySelector('.intro-seal-wrap').classList.add('visible');
    }, 300);
    setTimeout(() => {
      this.overlay.querySelector('.intro-kicker').classList.add('visible');
    }, 700);
    setTimeout(() => {
      this.overlay.querySelector('.intro-title').classList.add('visible');
    }, 1000);
    setTimeout(() => {
      this.overlay.querySelector('.intro-tagline').classList.add('visible');
    }, 1500);
    setTimeout(() => {
      this.overlay.querySelector('.intro-enter-cta').classList.add('visible');
    }, 2000);
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  spawnIntroParticles() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const goldColors = [
      { r: 250, g: 232, b: 168 },
      { r: 223, g: 183, b: 88 },
      { r: 255, g: 240, b: 170 },
      { r: 200, g: 160, b: 50 },
    ];

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 2 + 0.5;
      const color = goldColors[Math.floor(Math.random() * goldColors.length)];

      this.particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.4,
        color,
        life: 1,
        decay: Math.random() * 0.003 + 0.002,
        gravity: 0.01,
      });
    }
  }

  animate() {
    if (!this.isActive) return;
    requestAnimationFrame(() => this.animate());

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.995;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = p.alpha * p.life;
      this.ctx.save();
      this.ctx.shadowBlur = p.size * 4;
      this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.5})`;
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Refill slowly
    if (this.particles.length < 30 && Math.random() > 0.7) {
      const cx = w / 2;
      const cy = h / 2;
      const angle = Math.random() * Math.PI * 2;
      const goldColors = [
        { r: 250, g: 232, b: 168 },
        { r: 223, g: 183, b: 88 },
      ];
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5 - 0.3,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.2,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        life: 1,
        decay: Math.random() * 0.005 + 0.003,
        gravity: 0.005,
      });
    }
  }

  breakSealAndDismiss() {
    if (!this.overlay || this.isBreaking) return;
    this.isBreaking = true;

    // Trigger audio impact
    sounds.playSealBreak();

    // Trigger screen-shake
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 600);

    // Spawn massive particle explosion from seal center
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    const goldColors = [
      { r: 255, g: 240, b: 180 },
      { r: 250, g: 215, b: 90 },
      { r: 255, g: 255, b: 230 },
      { r: 212, g: 175, b: 55 },
    ];

    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        alpha: 1,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.12,
      });
    }

    // Explode seal visual
    const sealWrap = this.overlay.querySelector('.intro-seal-wrap');
    if (sealWrap) {
      sealWrap.style.transform = 'scale(1.4)';
      sealWrap.style.filter = 'drop-shadow(0 0 50px rgba(255, 215, 0, 1))';
      sealWrap.style.opacity = '0';
      sealWrap.style.transition = 'all 0.5s cubic-bezier(0.1, 1, 0.1, 1)';
    }

    setTimeout(() => {
      this.overlay.classList.add('dismissing');
      sounds.playFanfare();
    }, 350);

    setTimeout(() => {
      this.isActive = false;
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      if (this.onComplete) this.onComplete();
    }, 900);
  }

  dismiss() {
    this.breakSealAndDismiss();
  }
}
