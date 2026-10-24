import { sounds } from "../utils/audio.js";
import { getShareableUrl } from "../utils/storage.js";

/**
 * The Sacred Charter Document View:
 * Full, word-for-word honorary legal document matching the founding charter
 * with dynamic customization for any friend group.
 */

export class CharterView {
  constructor(containerEl) {
    this.container = containerEl;
    this.circle = null;
  }

  render(circle) {
    this.circle = circle;
    const memberNames = circle.committee.map(c => c.name).join(" · ");
    const redeemerName = (circle.committee.find(c => c.id === circle.currentHolderId) || circle.committee[0]).name;
    const shareUrl = getShareableUrl(circle);

    this.container.innerHTML = `
      <div class="charter-doc-container">
        
        <!-- CHARTER ACTION BAR -->
        <div style="background: var(--bg-surface-elevated); padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--gold-deep);">
          <div style="font-family: var(--font-royal); font-size: 0.8rem; color: var(--gold-bright);">
            OFFICIAL CHARTER INSTRUMENT
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" id="btn-print-charter">
              🖨️ Print / Save PDF
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-copy-charter">
              📋 Copy Text
            </button>
          </div>
        </div>

        <!-- CHARTER DOCUMENT HEADER -->
        <header class="charter-header">
          <div class="charter-badge">GP COMMITTEE — ${circle.established || 'EST. 2026'}</div>
          
          <img src="/public/images/gp_seal.svg" class="charter-seal" alt="Charter Seal" />
          
          <h1>The Golden Point Charter</h1>
          <div class="charter-subtitle">Extended Terms &amp; Conditions of Membership</div>
          
          <div style="width: 64px; height: 1px; background: var(--gold-pure); margin: 20px auto; opacity: 0.7;"></div>
          
          <div class="charter-signers">
            Issued by the GP Committee: <b>${memberNames}</b>
            ${circle.society ? `<div style="font-size: 0.78rem; color: var(--ink-subtle); margin-top: 4px;">Registered at ${circle.society}</div>` : ''}
          </div>
        </header>

        <!-- TABLE OF CONTENTS NAV -->
        <nav class="charter-nav" aria-label="Charter Contents">
          <a href="#sec-preamble">1. Preamble</a>
          <a href="#sec-definitions">2. Definitions</a>
          <a href="#sec-rules">3. Rules</a>
          <a href="#sec-deposit">4. Security Deposit</a>
          <a href="#sec-membership">5. Membership</a>
          <a href="#sec-spirit">6. Spirit</a>
          <a href="#sec-governance">7. Governance</a>
          <a href="#sec-disclaimer">8. Disclaimer</a>
        </nav>

        <!-- CHARTER CLAUSES BODY -->
        <div class="charter-content">

          <!-- SECTION 1: PREAMBLE -->
          <section class="charter-section" id="sec-preamble">
            <div class="charter-badge">Section One</div>
            <h2>1. Preamble</h2>
            <p style="font-size: 1.05rem; color: #fff; margin-bottom: 14px;">
              The Golden Point is a single, extraordinary favour extended among the members of this Committee. It exists to formalise trust between friends — a favour significant enough to deserve rules, safeguards, and a name.
            </p>
            <p style="margin-bottom: 14px;">
              This Charter is the extended terms and conditions referenced on the reverse of the physical Golden Point card. It governs how the Point is granted, exercised, protected, and inherited.
            </p>
            <div style="border-left: 2px solid var(--gold-deep); padding-left: 14px; font-style: italic; color: var(--ink-muted); margin-top: 14px;">
              This is a private, honour-based agreement between friends. It is not a legal contract, a registered financial instrument, or a bank product, and no clause here should be read as one.
            </div>
          </section>

          <!-- SECTION 2: DEFINITIONS -->
          <section class="charter-section" id="sec-definitions">
            <div class="charter-badge">Section Two</div>
            <h2>2. Definitions</h2>
            <ol class="charter-clauses">
              <li><strong>“Card” / “Golden Point”</strong> — the single-use favour represented physically by the Golden Point card.</li>
              <li><strong>“Holder” / “Redeemer”</strong> — the Member whose turn it is to present, or who presents, the Golden Point.</li>
              <li><strong>“Member”</strong> — an individual formally inducted per Section 5.</li>
              <li><strong>“Committee”</strong> — the GP Committee, currently ${memberNames}.</li>
              <li><strong>“FD” (Fixed Deposit)</strong> — the ${circle.currency}${circle.fdAmount.toLocaleString()} security commitment each Member maintains under Section 4.</li>
            </ol>
          </section>

          <!-- SECTION 3: RULES OF THE GOLDEN POINT -->
          <section class="charter-section" id="sec-rules">
            <div class="charter-badge">Section Three</div>
            <h2>3. Rules of the Golden Point</h2>
            <p style="margin-bottom: 14px; font-style: italic; color: var(--gold-bright);">Carried forward from the physical card, unchanged:</p>
            <ol class="charter-clauses">
              <li>The Golden Point grants its Holder a single, irrevocable request of their choosing.</li>
              <li>A presented request <strong>MUST be fulfilled</strong>. No designated Member may deny it, subject to the consequences in Section 4 if they do.</li>
              <li>The request may be of any type or nature — it is not limited to travel, destination, or category. Outside the residence, outside ${circle.society || 'the local bounds'}, travel anywhere is fully authorized.</li>
              <li>The Point is valid only among Members formally listed with the Committee.</li>
              <li>Any addition to the Committee itself requires unanimous approval of all current Committee members.</li>
            </ol>
          </section>

          <!-- SECTION 4: THE SECURITY DEPOSIT (FD) -->
          <section class="charter-section" id="sec-deposit">
            <div class="charter-badge">Section Four</div>
            <h2>4. The Security Deposit (FD)</h2>
            
            <div style="background: var(--bg-ivory); color: var(--ink-on-ivory); padding: 20px 24px; border-radius: var(--radius-sm); border: 1px solid var(--gold-deep); margin-bottom: 18px;">
              <div style="font-family: var(--font-royal); font-size: 2.2rem; font-weight: 800; color: var(--gold-deep); line-height: 1;">
                ${circle.currency}${circle.fdAmount.toLocaleString()}
              </div>
              <div style="font-size: 0.72rem; letter-spacing: 0.12em; font-weight: 700; color: var(--ink-on-ivory-muted); text-transform: uppercase;">
                FIXED DEPOSIT PER MEMBER
              </div>
            </div>

            <ol class="charter-clauses">
              <li>Every Member maintains a personal Fixed Deposit (FD) of ${circle.currency}${circle.fdAmount.toLocaleString()} as a standing security commitment tied to their membership of the Golden Point.</li>
              <li>The FD exists to give the “must be fulfilled” rule real weight. It is the cost of saying no.</li>
              <li><strong>Trigger conditions:</strong> A Member's FD is <strong>“unlocked”</strong> (forfeited for the Holder's use) if that Member:
                <ul style="list-style: disc; margin: 8px 0 8px 24px; color: var(--ink-muted);">
                  <li>Denies or refuses a validly presented Golden Point request, or</li>
                  <li>Misuses the Golden Point — for example, by inventing a request in bad faith, or acting outside the spirit of Section 3 and this Charter.</li>
                </ul>
              </li>
              <li><strong>Use of unlocked funds:</strong> Once a Member's FD is unlocked, the Holder who presented the Point may use that ${circle.currency}${circle.fdAmount.toLocaleString()} in any way they choose — it is not restricted to the original request.</li>
              <li><strong>Restoration:</strong> The Committee decides, by unanimous vote, whether and how a Member replenishes their FD after it has been unlocked.</li>
            </ol>

            <!-- ILLUSTRATIVE EXAMPLE VIGNETTE -->
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--gold-deep); padding: 18px 22px; border-radius: var(--radius-sm); margin-top: 16px;">
              <div style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; color: var(--gold-pure); text-transform: uppercase; margin-bottom: 6px;">
                ILLUSTRATIVE EXAMPLE
              </div>
              <p style="font-size: 0.92rem; color: #fff; margin: 0;">
                Suppose ${redeemerName} holds the Golden Point and asks the group to travel from Pune to Goa with him. If a Member refuses, that Member's FD unlocks immediately, and ${redeemerName} may use the ${circle.currency}${circle.fdAmount.toLocaleString()} however he wishes — including, but not limited to, funding the trip himself.
              </p>
            </div>
          </section>

          <!-- SECTION 5: BECOMING A MEMBER -->
          <section class="charter-section" id="sec-membership">
            <div class="charter-badge">Section Five</div>
            <h2>5. Becoming a Member</h2>
            <ol class="charter-clauses">
              <li>A prospective Member must first be included in the group's plans or activities on at least <strong>three (3) separate occasions</strong>.</li>
              <li>Meeting this threshold makes a person an <strong>“eligible contender”</strong> — it does not itself grant membership.</li>
              <li>Eligible contenders are admitted only by <strong>unanimous vote</strong> of the GP Committee.</li>
              <li>Admission adds the new Member's name to the physical card, this Charter, and requires maintaining their ${circle.currency}${circle.fdAmount.toLocaleString()} Fixed Deposit.</li>
            </ol>
          </section>

          <!-- SECTION 6: SPIRIT OF THE CHARTER -->
          <section class="charter-section" id="sec-spirit">
            <div class="charter-badge">Section Six</div>
            <h2>6. Spirit of the Charter</h2>
            <p>
              The Golden Point works because it is rarely, and seriously, invoked. Members are expected to act in good faith — both in presenting requests and in honouring them — and to treat the FD mechanism as a safeguard, not a game to be gamed.
            </p>
          </section>

          <!-- SECTION 7: GOVERNANCE & AMENDMENTS -->
          <section class="charter-section" id="sec-governance">
            <div class="charter-badge">Section Seven</div>
            <h2>7. Governance &amp; Amendments</h2>
            <ol class="charter-clauses">
              <li>This Charter may only be amended by unanimous agreement of the GP Committee.</li>
              <li>The Committee is the final authority on any dispute arising from the use, denial, or misuse of a Golden Point.</li>
            </ol>
          </section>

          <!-- SECTION 8: DISCLAIMER -->
          <section class="charter-section" id="sec-disclaimer">
            <div class="charter-badge">Section Eight</div>
            <h2>8. Disclaimer</h2>
            <p style="font-style: italic; color: var(--ink-muted);">
              This Charter is an informal, honour-based agreement between friends. The “FD” described here is a private commitment between Members, not a regulated bank deposit, and this document creates no legal or financial obligation enforceable outside the group.
            </p>
          </section>

          <!-- OFFICIAL SIGNATURES BLOCK -->
          <div class="charter-signatures-block">
            <img src="/public/images/gp_seal.svg" style="width: 50px; height: 50px; margin: 0 auto 14px;" alt="Seal" />
            <div style="font-family: var(--font-royal); font-size: 1.15rem; color: var(--gold-bright); margin-bottom: 4px;">
              RATIFIED BY THE GP COMMITTEE
            </div>
            <div style="font-size: 0.75rem; color: var(--ink-subtle);">
              Signatures of Record for ${circle.name}
            </div>

            <div class="sig-grid">
              ${circle.committee.map(c => `
                <div class="sig-col">
                  <div class="sig-line">${c.signature || c.name}</div>
                  <div class="sig-label">${c.name} — ${c.role || 'Committee Member'}</div>
                </div>
              `).join("")}
            </div>

            <div style="margin-top: 36px; font-size: 0.72rem; color: var(--ink-subtle);">
              Present this Charter alongside the physical Golden Point card. Scannable verification via reverse QR code.
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const printBtn = document.getElementById("btn-print-charter");
    const copyBtn = document.getElementById("btn-copy-charter");

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        sounds.playClick();
        window.print();
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        sounds.playClick();
        const text = document.querySelector(".charter-content").innerText;
        navigator.clipboard.writeText(text).then(() => {
          window.dispatchEvent(new CustomEvent("show-toast", { detail: { message: "📋 Official Charter text copied to clipboard!" } }));
        });
      });
    }
  }
}
