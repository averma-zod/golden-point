import { sounds } from "../utils/audio.js";
import { getShareableUrl } from "../utils/storage.js";

/**
 * 3D Interactive Luxury Bank Card Component
 * Supports real-time mouse parallax tilt, specular highlights, 3D flip,
 * and scannable QR code encoding the live circle URL.
 */

export class Card3D {
  constructor(containerEl, onCardUpdate) {
    this.container = containerEl;
    this.onCardUpdate = onCardUpdate;
    this.isFlipped = false;
    this.currentCircle = null;
    this.viewMode = "3d"; // "3d" or "photo"
  }

  render(circle) {
    this.currentCircle = circle;
    const shareUrl = getShareableUrl(circle);
    const committeeNames = circle.committee.map((c) => c.name).join(", ");
    const currentHolder = circle.committee.find((c) => c.id === circle.currentHolderId) || circle.committee[0];

    this.container.innerHTML = `
      <div class="card-stage" id="card-stage">
        <!-- View Mode Switcher -->
        <div style="display: flex; gap: 8px; margin-bottom: 6px;">
          <button class="btn btn-sm ${this.viewMode === '3d' ? 'btn-primary' : 'btn-secondary'}" id="toggle-card-view-3d">
            ✨ Interactive 3D Card
          </button>
          <button class="btn btn-sm ${this.viewMode === 'photo' ? 'btn-primary' : 'btn-secondary'}" id="toggle-card-view-photo">
            📸 Authentic Card Photo
          </button>
        </div>

        ${this.viewMode === 'photo' ? `
          <div style="max-width: 460px; border-radius: var(--radius-card); overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.8), 0 0 24px var(--gold-glow); border: 2px solid var(--gold-pure);">
            <img src="./public/images/golden_card_reference.jpg" alt="Authentic Golden Point Physical Card" style="width: 100%; display: block; height: auto;" />
            <div style="background: var(--bg-surface); padding: 10px 16px; text-align: center; font-size: 0.78rem; color: var(--gold-bright); border-top: 1px solid var(--gold-deep);">
              Official Physical Golden Point Card issued at Sahil Heights Society
            </div>
          </div>
        ` : `
          <!-- 3D Card Interactive Element -->
          <div class="card-3d-wrap ${this.isFlipped ? 'flipped' : ''}" id="card-element" title="Click to flip card">
            
            <!-- FRONT FACE -->
            <div class="card-face card-front" id="card-front-face">
              <div class="card-front-header">
                <div>
                  <div class="card-brand-title">GOLDEN POINT</div>
                  <div class="card-brand-sub">${circle.subtitle || 'UNLIMITED REDEMPTION CARD'}</div>
                </div>
                <div class="card-elite-tag">
                  <svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                  <span>ELITE</span>
                </div>
              </div>

              <div class="card-center-crest">
                <img src="./public/images/gp_seal.svg" alt="GP Seal" />
              </div>

              <div class="card-front-body">
                <div class="card-holders-label">Cardholder Names:</div>
                <div class="card-holders-names">${committeeNames}</div>

                <div class="card-number-row">
                  <div class="card-number">${circle.cardNumber || '8888 7777 6666 5555'}</div>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="card-validity">
                      VALID THRU
                      <span>${circle.validThru || 'LIFETIME'}</span>
                    </div>
                    <img src="./public/images/emv_chip.svg" class="card-chip" alt="EMV Chip" />
                  </div>
                </div>
              </div>
            </div>

            <!-- BACK FACE -->
            <div class="card-face card-back" id="card-back-face">
              <div class="card-magstripe"></div>
              
              <div class="card-back-content">
                <div class="card-sig-row">
                  <div class="card-sig-panel" title="Signatures">
                    SIGNATURE: ${circle.committee.map(c => c.name).join(" · ")}
                  </div>
                  <div class="card-cvv-panel">
                    CVV: ${circle.cvv || '777'}
                  </div>
                </div>

                <div class="card-back-main">
                  <div class="card-terms-mini">
                    <div class="card-terms-title">TERMS &amp; CONDITIONS</div>
                    <ol>
                      <li>Grants a single, irrevocable request of holder's choice.</li>
                      <li>A presented request MUST be fulfilled. Denial is prohibited.</li>
                      <li>Valid for any type of request (travel, location, challenge).</li>
                      <li>Refusal unlocks ${circle.currency}${circle.fdAmount.toLocaleString()} FD for redeemer's discretionary use.</li>
                      <li>Future committee additions require 100% unanimous approval.</li>
                    </ol>
                  </div>

                  <div class="card-qr-box">
                    <div id="card-qr-canvas-wrap"></div>
                    <div class="card-qr-caption">SCAN CHARTER</div>
                  </div>
                </div>

                <div class="card-back-footer">
                  <div>GP COMMITTEE — ${circle.committee.map(c => c.name).join(", ")}</div>
                  <div style="font-family: monospace; letter-spacing: 0.1em;">EST. ${circle.established || '2026'}</div>
                </div>
              </div>
            </div>

          </div>
        `}

        <!-- CARD CONTROLS -->
        <div class="card-controls">
          <button class="btn btn-secondary btn-sm" id="btn-flip-card">
            🔄 Flip Card (${this.isFlipped ? 'View Front' : 'View Back & QR'})
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-download-card">
            📥 Download Card PNG
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-share-card">
            🔗 Share Circle Link
          </button>
        </div>
      </div>
    `;

    this.bindEvents(shareUrl);
  }

  bindEvents(shareUrl) {
    const cardEl = document.getElementById("card-element");
    const flipBtn = document.getElementById("btn-flip-card");
    const downloadBtn = document.getElementById("btn-download-card");
    const shareBtn = document.getElementById("btn-share-card");
    const toggle3D = document.getElementById("toggle-card-view-3d");
    const togglePhoto = document.getElementById("toggle-card-view-photo");

    if (toggle3D) {
      toggle3D.addEventListener("click", () => {
        this.viewMode = "3d";
        sounds.playClick();
        this.render(this.currentCircle);
      });
    }

    if (togglePhoto) {
      togglePhoto.addEventListener("click", () => {
        this.viewMode = "photo";
        sounds.playClick();
        this.render(this.currentCircle);
      });
    }

    // QR Code Generation onto Back of Card
    if (this.viewMode === "3d") {
      this.renderQRCode(shareUrl);
    }

    if (cardEl) {
      // Audio-visual specular sheen on hover
      cardEl.addEventListener("mouseenter", () => {
        sounds.playShing();
      });

      // 3D Parallax Tilt Effect & Specular Light Tracking
      cardEl.addEventListener("mousemove", (e) => {
        if (this.isFlipped) return;
        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 14;

        cardEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Virtual light specular reflection
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        const frontFace = document.getElementById("card-front-face");
        if (frontFace) {
          frontFace.style.background = `
            radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 230, 0.45) 0%, transparent 60%),
            linear-gradient(135deg, #fae8a8 0%, #dfb758 25%, #9e7420 50%, #fae8a8 75%, #dfb758 100%)
          `;
        }
      });

      cardEl.addEventListener("mouseleave", () => {
        if (!this.isFlipped) {
          cardEl.style.transform = "rotateX(0deg) rotateY(0deg)";
          const frontFace = document.getElementById("card-front-face");
          if (frontFace) {
            frontFace.style.background = "";
          }
        }
      });

      cardEl.addEventListener("click", () => {
        this.toggleFlip();
      });
    }

    if (flipBtn) {
      flipBtn.addEventListener("click", () => {
        this.toggleFlip();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        this.downloadCardImage();
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          sounds.playClick();
          window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "🔗 Golden Point Circle link copied to clipboard!" } }));
        });
      });
    }
  }

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
    sounds.playFlip();
    const cardEl = document.getElementById("card-element");
    if (cardEl) {
      if (this.isFlipped) {
        cardEl.classList.add("flipped");
        cardEl.style.transform = "rotateY(180deg)";
      } else {
        cardEl.classList.remove("flipped");
        cardEl.style.transform = "rotateY(0deg)";
      }
    }
    const flipBtn = document.getElementById("btn-flip-card");
    if (flipBtn) {
      flipBtn.innerHTML = `🔄 Flip Card (${this.isFlipped ? 'View Front' : 'View Back & QR'})`;
    }
  }

  renderQRCode(url) {
    const wrap = document.getElementById("card-qr-canvas-wrap");
    if (!wrap) return;
    try {
      if (typeof window.qrcode === "function") {
        // Use clean compact URL for physical card QR to ensure high contrast and zero overflow
        const qrTarget = url && url.length < 250 ? url : `${window.location.origin}${window.location.pathname}?circle=${encodeURIComponent(this.currentCircle?.id || 'sahil-heights-gp')}`;
        const qr = window.qrcode(0, "L");
        qr.addData(qrTarget);
        qr.make();
        wrap.innerHTML = qr.createImgTag(2, 0);
        const img = wrap.querySelector("img");
        if (img) {
          img.style.width = "58px";
          img.style.height = "58px";
          img.style.display = "block";
        }
      }
    } catch (e) {
      console.warn("QR generation error", e);
    }
  }

  downloadCardImage() {
    sounds.playClick();
    // High-resolution dual card exporter
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");

    // Background luxury obsidian gradient
    const bgGrad = ctx.createRadialGradient(600, 380, 50, 600, 380, 600);
    bgGrad.addColorStop(0, "#1c170f");
    bgGrad.addColorStop(1, "#0a0907");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 760);

    // Front Card Rect (left)
    this.drawCardFaceOnCanvas(ctx, 60, 180, 500, 315, "FRONT");
    // Back Card Rect (right)
    this.drawCardFaceOnCanvas(ctx, 640, 180, 500, 315, "BACK");

    // Header Title
    ctx.fillStyle = "#fae8a8";
    ctx.font = "bold 32px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText("THE GOLDEN POINT — OFFICIAL MEMBERSHIP CARD", 600, 70);

    ctx.fillStyle = "#b5a98a";
    ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`Issued by GP Committee — ${this.currentCircle.name} · Fixed Deposit: ${this.currentCircle.currency}${this.currentCircle.fdAmount.toLocaleString()}`, 600, 105);

    // Download triggered
    const link = document.createElement("a");
    link.download = `Golden-Point-Card-${this.currentCircle.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "📸 High-resolution Card PNG downloaded successfully!" } }));
  }

  drawCardFaceOnCanvas(ctx, x, y, w, h, face) {
    ctx.save();
    // Rounded Card Path
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();

    if (face === "FRONT") {
      // Carbon Dark Metallic Background
      ctx.fillStyle = "#110e09";
      ctx.fillRect(x, y, w, h);

      // Gold Borders
      ctx.strokeStyle = "#dfb758";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      // Gold Accents
      ctx.fillStyle = "#fff0aa";
      ctx.font = "bold 26px 'Cinzel', serif";
      ctx.textAlign = "left";
      ctx.fillText("GOLDEN POINT", x + 30, y + 45);

      ctx.fillStyle = "#dfb758";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("UNLIMITED REDEMPTION CARD", x + 30, y + 62);

      // Cardholder
      ctx.fillStyle = "#a88e45";
      ctx.font = "10px sans-serif";
      ctx.fillText("CARDHOLDER NAMES:", x + 30, y + 210);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(this.currentCircle.committee.map(c => c.name).join(", "), x + 30, y + 230);

      // Card Number
      ctx.fillStyle = "#fae8a8";
      ctx.font = "bold 20px monospace";
      ctx.fillText(this.currentCircle.cardNumber || "8888 7777 6666 5555", x + 30, y + 275);
    } else {
      // Full Gold Back
      const goldGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      goldGrad.addColorStop(0, "#fae8a8");
      goldGrad.addColorStop(0.5, "#dfb758");
      goldGrad.addColorStop(1, "#967420");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(x, y, w, h);

      // Magstripe
      ctx.fillStyle = "#120e07";
      ctx.fillRect(x, y + 25, w, 40);

      // Signature Panel
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 20, y + 80, w - 120, 26);
      ctx.fillStyle = "#333333";
      ctx.font = "italic 11px Georgia";
      ctx.fillText("SIGNATURE: " + this.currentCircle.committee.map(c => c.name).join(" · "), x + 30, y + 97);

      // CVV
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + w - 90, y + 80, 70, 26);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 12px monospace";
      ctx.fillText("CVV: " + (this.currentCircle.cvv || "777"), x + w - 80, y + 97);

      // Terms
      ctx.fillStyle = "#221a08";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("TERMS & CONDITIONS:", x + 20, y + 130);
      ctx.font = "9px sans-serif";
      ctx.fillText("1. Grants a single irrevocable request of holder's choice.", x + 20, y + 150);
      ctx.fillText("2. A presented request MUST be fulfilled. Denial is prohibited.", x + 20, y + 168);
      ctx.fillText(`3. Denial unlocks ${this.currentCircle.currency}${this.currentCircle.fdAmount} FD for discretionary use.`, x + 20, y + 186);
      ctx.fillText("4. Additions require 100% unanimous GP Committee approval.", x + 20, y + 204);

      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`GP COMMITTEE — ${this.currentCircle.committee.map(c => c.name).join(", ")}`, x + 20, y + 285);
    }

    ctx.restore();
  }
}
