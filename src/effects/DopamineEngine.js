import { sounds } from "../utils/audio.js";

/**
 * DopamineEngine — High-Engagement Sensory & Behavioral Mechanics
 * 1. Live Dopamine Ticker: Real-time scrolling high-stakes activity marquee.
 * 2. Collectible Golden Tokens: 3 hidden interactive coins unlocking the "Vault Bonus".
 * 3. Scarcity & FOMO Radar: Ticking countdown, diminishing supply bar, classified locked tier.
 * 4. Audio-Visual Sync: Luxury watch scroll ticks, metallic hover shings.
 */

export class DopamineEngine {
  constructor(particleEngine) {
    this.particleEngine = particleEngine;
    this.collectedTokens = new Set(JSON.parse(localStorage.getItem("gp_collected_tokens") || "[]"));
    this.lastScrollY = window.scrollY;
    this.scrollTickDistance = 0;
    this.tickerEl = null;
    this.radarEl = null;
  }

  init() {
    this.injectTicker();
    this.injectHiddenTokens();
    this.initScrollAudio();
    this.initScarcityRadar();
    this.initCardAudioSync();
  }

  /* --------------------------------------------------------------------------
     1. LIVE DOPAMINE TICKER
     -------------------------------------------------------------------------- */
  injectTicker() {
    if (document.getElementById("gp-live-ticker")) return;

    this.tickerEl = document.createElement("div");
    this.tickerEl.id = "gp-live-ticker";
    this.tickerEl.className = "dopamine-ticker-strip";

    const items = [
      { tag: "LIVE PACT", text: "Akash Verma invoked Golden Point: 'Escape from Sahil Heights: Pune to Goa Road Trip'", icon: "⚡" },
      { tag: "VAULT SECURED", text: "₹75,000 Standing Fixed Deposit Collateral verified in escrow", icon: "🔒" },
      { tag: "CARD CUSTODY", text: "Physical Ingot #8888 7777 6666 5555 verified in active circulation", icon: "👑" },
      { tag: "SOVEREIGN RULE", text: "Golden Point CANNOT be denied under any sovereign circumstance", icon: "🛡️" },
      { tag: "CONTENDER WATCH", text: "Rohan Sharma submitted 2 of 3 mandatory plans for Committee Entry", icon: "🏆" },
      { tag: "SCARCITY ALERT", text: "1 of 1 Card minted · Lifetime supply capped · Sahil Heights Society", icon: "💎" },
      { tag: "COMMITTEE AUDIT", text: "Moniv Nautiyal & Sahil Malik review pending for Goa departure window", icon: "📍" },
    ];

    const trackContent = items.map(it => `
      <div class="ticker-pill">
        <span class="ticker-badge">${it.icon} ${it.tag}</span>
        <span class="ticker-text">${it.text}</span>
      </div>
    `).join("");

    this.tickerEl.innerHTML = `
      <div class="ticker-pulse-indicator">
        <span class="pulse-dot"></span>
        <span class="pulse-label">LIVE FEED</span>
      </div>
      <div class="ticker-track">
        <div class="ticker-items">${trackContent}</div>
        <div class="ticker-items" aria-hidden="true">${trackContent}</div>
      </div>
    `;

    // Insert directly below top-nav
    const topNav = document.querySelector(".top-nav");
    if (topNav && topNav.nextSibling) {
      topNav.parentNode.insertBefore(this.tickerEl, topNav.nextSibling);
    } else {
      document.body.prepend(this.tickerEl);
    }
  }

  /* --------------------------------------------------------------------------
     2. HIDDEN COLLECTIBLE GOLDEN TOKENS ("VAULT BONUS")
     -------------------------------------------------------------------------- */
  injectHiddenTokens() {
    // Remove existing tokens if any
    document.querySelectorAll(".vault-collectible-token").forEach(el => el.remove());

    const tokenLocations = [
      { id: "token-hero", parent: "#card-stage-container", label: "Founders Sigil", top: "15px", right: "20px" },
      { id: "token-vault", parent: "#dashboard-view-container", label: "Escrow Mint Mark", top: "25px", right: "30px" },
      { id: "token-charter", parent: ".site-footer", label: "Charter Seal", top: "-18px", left: "50%" },
    ];

    tokenLocations.forEach((loc, index) => {
      const parentEl = document.querySelector(loc.parent);
      if (!parentEl) return;

      const isCollected = this.collectedTokens.has(loc.id);

      const tokenEl = document.createElement("div");
      tokenEl.id = loc.id;
      tokenEl.className = `vault-collectible-token ${isCollected ? "collected" : ""}`;
      tokenEl.title = isCollected ? "Token Collected ✓" : "Collect Secret Golden Token!";
      tokenEl.setAttribute("data-token-idx", index + 1);
      tokenEl.style.position = "absolute";
      if (loc.top) tokenEl.style.top = loc.top;
      if (loc.right) tokenEl.style.right = loc.right;
      if (loc.left) tokenEl.style.left = loc.left;

      tokenEl.innerHTML = `
        <div class="token-coin">
          <span class="token-glyph">🪙</span>
          <span class="token-ping"></span>
        </div>
      `;

      if (!isCollected) {
        tokenEl.addEventListener("click", (e) => {
          e.stopPropagation();
          this.collectToken(loc.id, tokenEl, e.clientX, e.clientY);
        });
      }

      // Ensure parent has position relative
      if (getComputedStyle(parentEl).position === "static") {
        parentEl.style.position = "relative";
      }

      parentEl.appendChild(tokenEl);
    });
  }

  collectToken(tokenId, tokenEl, clickX, clickY) {
    if (this.collectedTokens.has(tokenId)) return;

    this.collectedTokens.add(tokenId);
    localStorage.setItem("gp_collected_tokens", JSON.stringify(Array.from(this.collectedTokens)));

    tokenEl.classList.add("collected", "collect-anim");
    sounds.playCoinCollect();

    try {
      if (this.particleEngine) {
        if (typeof this.particleEngine.spawnCelebrationBurst === "function") {
          this.particleEngine.spawnCelebrationBurst(clickX, clickY);
        } else if (typeof this.particleEngine.celebrationBurst === "function") {
          this.particleEngine.celebrationBurst(clickX, clickY);
        }
      }
    } catch (err) {
      console.warn("Celebration burst error", err);
    }

    const count = this.collectedTokens.size;

    // Toast HUD
    this.showTokenToast(`🪙 COLLECTIBLE FOUND! (${count}/3)`);

    if (count === 3) {
      setTimeout(() => {
        this.unlockVaultBonusModal();
      }, 700);
    }
  }

  showTokenToast(msg) {
    const toast = document.createElement("div");
    toast.className = "vault-token-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  unlockVaultBonusModal() {
    sounds.playFanfare();
    if (typeof window.confetti === "function") {
      window.confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#fad961", "#f76b1c", "#ffd700", "#ffffff"],
      });
    }

    const overlay = document.getElementById("modal-overlay");
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal-dialog modal-vault-bonus">
        <div class="bonus-header">
          <div class="bonus-crown">👑</div>
          <h2 class="bonus-title">THE VAULT BONUS UNLOCKED</h2>
          <div class="bonus-subtitle">Founders' Sovereign Privilege #007</div>
        </div>

        <div class="bonus-body">
          <div class="bonus-perk-card">
            <div class="perk-badge">EXCLUSIVE HONOUR BENEFIT</div>
            <div class="perk-title">The Sovereign Chai &amp; Midnight Council Veto</div>
            <p class="perk-desc">
              By collecting all three Sovereign Seals across the vault, you have unlocked the
              unwritten <strong>Clause §9.4 of Sahil Heights</strong>:
            </p>
            <div class="perk-quote">
              "In any dispute or deadlock between Moniv Nautiyal, Sahil Malik, and Akash Verma, the bearer may declare an immediate Midnight Chai &amp; Poker Council. All other social obligations are suspended."
            </div>
          </div>

          <div class="bonus-stats-row">
            <div class="bonus-stat">
              <span class="bonus-stat-num">3 / 3</span>
              <span class="bonus-stat-lbl">Seals Discovered</span>
            </div>
            <div class="bonus-stat">
              <span class="bonus-stat-num">100%</span>
              <span class="bonus-stat-lbl">Pact Mastery</span>
            </div>
            <div class="bonus-stat">
              <span class="bonus-stat-num">LIFETIME</span>
              <span class="bonus-stat-lbl">Perk Duration</span>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: center;">
          <button class="btn btn-primary" id="btn-close-bonus">
            ⚡ CLAIM SOVEREIGN STATUS
          </button>
        </div>
      </div>
    `;

    overlay.classList.add("open");
    document.getElementById("btn-close-bonus").addEventListener("click", () => {
      sounds.playClick();
      overlay.classList.remove("open");
    });
  }

  /* --------------------------------------------------------------------------
     3. SCARCITY & FOMO RADAR
     -------------------------------------------------------------------------- */
  initScarcityRadar() {
    const heroMetrics = document.querySelector(".hero-metrics");
    if (!heroMetrics || document.getElementById("scarcity-radar-module")) return;

    this.radarEl = document.createElement("div");
    this.radarEl.id = "scarcity-radar-module";
    this.radarEl.className = "scarcity-radar-bar";
    this.radarEl.innerHTML = `
      <div class="radar-header">
        <div class="radar-title-group">
          <span class="radar-live-blip"></span>
          <span class="radar-title">SOVEREIGN SCARCITY RADAR</span>
        </div>
        <div class="radar-countdown" id="radar-live-clock">
          <span class="clock-unit" id="clock-days">04</span><span class="clock-sep">:</span>
          <span class="clock-unit" id="clock-hours">18</span><span class="clock-sep">:</span>
          <span class="clock-unit" id="clock-mins">22</span><span class="clock-sep">:</span>
          <span class="clock-unit clock-sec" id="clock-secs">41</span>
          <span class="clock-label">CUSTODY WINDOW</span>
        </div>
      </div>

      <div class="radar-meter-track">
        <div class="radar-meter-fill" style="width: 100%;"></div>
        <div class="radar-meter-glow"></div>
      </div>

      <div class="radar-footer">
        <div class="radar-stat-item">
          <span class="stat-bullet">●</span>
          <span>INGOT SUPPLY: <strong>1 / 1 MINTED</strong> (CAPPED)</span>
        </div>
        <div class="radar-classified-btn" id="radar-locked-tier" title="Click to inspect Sovereign Black Tier">
          <span>🔒 CLASSIFIED TIER</span>
          <span class="classified-tag">SOVEREIGN OBSIDIAN</span>
        </div>
      </div>
    `;

    heroMetrics.parentNode.insertBefore(this.radarEl, heroMetrics.nextSibling);

    // Live ticking countdown
    this.startLiveClock();

    // Locked tier click interaction
    const lockedBtn = document.getElementById("radar-locked-tier");
    if (lockedBtn) {
      lockedBtn.addEventListener("click", () => {
        sounds.playLockedBuzz();
        lockedBtn.classList.add("vibrate-error");
        setTimeout(() => lockedBtn.classList.remove("vibrate-error"), 500);

        this.showTokenToast("🔒 CLASSIFIED: Requires Unanimous Committee Consent (Manav, Sahil & Akash)!");
      });
    }
  }

  startLiveClock() {
    let seconds = 41;
    let minutes = 22;
    let hours = 18;
    let days = 4;

    setInterval(() => {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 23;
            days--;
            if (days < 0) days = 7;
          }
        }
      }

      const secEl = document.getElementById("clock-secs");
      const minEl = document.getElementById("clock-mins");
      const hrEl = document.getElementById("clock-hours");
      const dayEl = document.getElementById("clock-days");

      if (secEl) secEl.textContent = String(seconds).padStart(2, "0");
      if (minEl) minEl.textContent = String(minutes).padStart(2, "0");
      if (hrEl) hrEl.textContent = String(hours).padStart(2, "0");
      if (dayEl) dayEl.textContent = String(days).padStart(2, "0");
    }, 1000);
  }

  /* --------------------------------------------------------------------------
     4. AUDIO-VISUAL IMMERSION & SCROLL TICKS
     -------------------------------------------------------------------------- */
  initScrollAudio() {
    let ticking = false;
    window.addEventListener("scroll", () => {
      const currentY = window.scrollY;
      const diff = Math.abs(currentY - this.lastScrollY);
      this.scrollTickDistance += diff;
      this.lastScrollY = currentY;

      // Play tick every 220px of scroll
      if (this.scrollTickDistance >= 220) {
        this.scrollTickDistance = 0;
        if (!ticking) {
          ticking = true;
          sounds.playTick();
          setTimeout(() => { ticking = false; }, 80);
        }
      }
    }, { passive: true });
  }

  initCardAudioSync() {
    // When hovering over the 3D card or showroom elements, trigger metallic shing
    setTimeout(() => {
      const cardEl = document.querySelector(".card-3d-wrap") || document.querySelector(".card-stage");
      if (cardEl) {
        cardEl.addEventListener("mouseenter", () => {
          sounds.playShing();
        });
      }
    }, 1000);
  }
}
