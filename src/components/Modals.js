import { sounds } from "../utils/audio.js";

/**
 * Modals Manager:
 * Handles Minting new circles, Invocations, Refusal/Forfeiture warnings,
 * Contender creation, Plan logging, and Unanimous Committee Induction voting.
 */

export class ModalsManager {
  constructor(overlayEl, callbacks) {
    this.overlay = overlayEl;
    this.callbacks = callbacks;
  }

  close() {
    this.overlay.classList.remove("open");
    this.overlay.innerHTML = "";
  }

  openMintCircleModal() {
    sounds.playClick();
    this.overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; color: var(--gold-bright);">👑 Mint a New Golden Circle</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 18px;">
            Establish an honour-bound pact for your circle of friends. Customize stakes, committee members, and mint your digital card and live scannable QR charter.
          </p>

          <form id="form-mint-circle">
            <div class="form-group">
              <label class="form-label">Circle / Club Name</label>
              <input type="text" class="form-control" id="mint-name" placeholder="e.g. The Mumbai Syndicate" required />
            </div>

            <div class="form-group">
              <label class="form-label">Society / Location / Tagline</label>
              <input type="text" class="form-control" id="mint-society" placeholder="e.g. Sahil Heights Society or Bandra Crew" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Currency</label>
                <select class="form-control" id="mint-currency">
                  <option value="₹">₹ (INR)</option>
                  <option value="$">$ (USD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">FD Security Deposit</label>
                <input type="number" class="form-control" id="mint-fd" value="25000" min="1000" step="500" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Committee Founders (Comma-separated)</label>
              <input type="text" class="form-control" id="mint-members" placeholder="e.g. Akash Verma, Moniv Nautiyal, Sahil Malik" required />
              <div style="font-size: 0.72rem; color: var(--ink-subtle); margin-top: 4px;">
                All listed members will be minted onto the card and committed to the FD vault.
              </div>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0; border-top: 1px solid rgba(223, 183, 88, 0.15);">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Mint Circle &amp; Card</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.overlay.classList.add("open");
    this.bindCommonEvents();

    const form = document.getElementById("form-mint-circle");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("mint-name").value.trim();
      const society = document.getElementById("mint-society").value.trim();
      const currency = document.getElementById("mint-currency").value;
      const fd = parseInt(document.getElementById("mint-fd").value, 10) || 25000;
      const membersRaw = document.getElementById("mint-members").value.trim();

      const memberNames = membersRaw.split(",").map(m => m.trim()).filter(Boolean);
      if (memberNames.length < 2) {
        alert("Please specify at least 2 friends to form a committee.");
        return;
      }

      const id = "gp-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(1000 + Math.random() * 9000);
      const committee = memberNames.map((mName, i) => ({
        id: "m-" + i + "-" + Math.floor(Math.random() * 1000),
        name: mName,
        role: i === 0 ? "Committee Founder & Custodian" : "Committee Founder",
        avatar: mName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
        fdStatus: "LOCKED",
        signature: mName
      }));

      // Random luxury card number
      const cardNum = `${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)}`;

      const newCircle = {
        id,
        name,
        subtitle: "UNLIMITED REDEMPTION CARD",
        society: society || "The Inner Circle",
        location: "Global",
        established: new Date().getFullYear().toString(),
        currency,
        currencyCode: currency === "₹" ? "INR" : currency === "$" ? "USD" : "EUR",
        fdAmount: fd,
        cardNumber: cardNum,
        cvv: "777",
        validThru: "LIFETIME",
        theme: "gold-carbon",
        committee,
        currentHolderId: committee[0].id,
        activeInvocation: null,
        contenders: [],
        ledger: [
          {
            id: "leg-init",
            type: "CREATION",
            badge: "Circle Minted",
            text: `The Golden Point Charter formally minted for ${name} by ${memberNames.join(", ")}.`,
            timestamp: new Date().toISOString()
          },
          {
            id: "leg-vault",
            type: "VAULT",
            badge: "Vault Sealed",
            text: `Total standing security commitment of ${currency}${(fd * memberNames.length).toLocaleString()} committed to the Vault.`,
            timestamp: new Date().toISOString()
          }
        ]
      };

      sounds.playFanfare();
      this.close();
      this.callbacks.onCircleCreated(newCircle);
    });
  }

  openInvocationModal(circle) {
    sounds.playClick();
    const currentHolder = circle.committee.find(c => c.id === circle.currentHolderId) || circle.committee[0];
    const otherMembers = circle.committee.filter(c => c.id !== currentHolder.id);

    this.overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; color: var(--gold-bright);">⚡ Invoke The Golden Point</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="background: rgba(223, 183, 88, 0.1); border-left: 3px solid var(--gold-pure); padding: 10px 14px; font-size: 0.8rem; color: var(--ink-on-dark); margin-bottom: 16px;">
            <strong>Sacred Injunction:</strong> You hold the sovereign Point. This request is irrevocable and MUST be fulfilled. Any refusal triggers an immediate <strong>${circle.currency}${circle.fdAmount.toLocaleString()} FD forfeiture</strong> to your purse.
          </div>

          <form id="form-invoke-gp">
            <div class="form-group">
              <label class="form-label">Title of Sacred Request</label>
              <input type="text" class="form-control" id="inv-title" placeholder="e.g. Pune to Goa Weekend Road Trip" required />
            </div>

            <div class="form-group">
              <label class="form-label">Full Directive &amp; Terms</label>
              <textarea class="form-control" id="inv-desc" rows="3" placeholder="Describe the terms, departure time, itinerary, and non-negotiables..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control" id="inv-cat">
                <option value="Epic Travel">✈️ Epic Travel &amp; Road Trip</option>
                <option value="Sacred Challenge">⚔️ Sacred Challenge / Rite</option>
                <option value="Milestone Celebration">🎉 Milestone Celebration</option>
                <option value="Unconditional Favour">🤝 Unconditional Favour</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Designated Member Directives</label>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                ${otherMembers.map(m => `
                  <label style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; cursor: pointer;">
                    <input type="checkbox" name="inv-targets" value="${m.id}" checked />
                    <span>${m.name} (${m.role || 'Member'})</span>
                  </label>
                `).join("")}
              </div>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0; border-top: 1px solid rgba(223, 183, 88, 0.15);">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Proclaim Sovereign Request</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.overlay.classList.add("open");
    this.bindCommonEvents();

    const form = document.getElementById("form-invoke-gp");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("inv-title").value.trim();
      const description = document.getElementById("inv-desc").value.trim();
      const category = document.getElementById("inv-cat").value;

      const checked = Array.from(document.querySelectorAll("input[name='inv-targets']:checked")).map(el => el.value);
      if (checked.length === 0) {
        alert("Please designate at least one member to receive the request.");
        return;
      }

      const responses = {};
      checked.forEach(id => {
        responses[id] = { status: "AWAITING", note: "", timestamp: null };
      });

      const invocation = {
        id: "inv-" + Date.now(),
        redeemerId: currentHolder.id,
        redeemerName: currentHolder.name,
        title,
        description,
        category,
        timestamp: new Date().toISOString(),
        deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
        targetMemberIds: checked,
        responses,
        unlockedFdTotal: 0
      };

      sounds.playClick();
      this.close();
      this.callbacks.onInvocationCreated(invocation);
    });
  }

  openForfeitModal(circle, memberId) {
    sounds.playForfeitAlarm();
    const member = circle.committee.find(c => c.id === memberId);
    const redeemer = circle.committee.find(c => c.id === circle.activeInvocation.redeemerId) || { name: "The Redeemer" };

    this.overlay.innerHTML = `
      <div class="modal-dialog danger">
        <div class="modal-header" style="border-bottom-color: rgba(224, 59, 59, 0.3);">
          <h3 style="font-size: 1.15rem; color: var(--accent-forfeit);">⚠️ High-Stakes Refusal Warning</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div style="text-align: center; font-size: 3rem; margin-bottom: 10px;">🚨</div>
          
          <h4 style="text-align: center; color: #fff; margin-bottom: 12px; font-size: 1.1rem;">
            Breach of Section 4: Fixed Deposit Forfeiture
          </h4>

          <p style="font-size: 0.9rem; color: #f5eedb; line-height: 1.6; margin-bottom: 16px;">
            You are choosing to <strong>refuse</strong> the validly presented Golden Point request by <strong>${redeemer.name}</strong>.
          </p>

          <div style="background: rgba(224, 59, 59, 0.15); border: 1px solid var(--accent-forfeit); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 18px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #ff8080; margin-bottom: 6px;">
              CONSEQUENCES OF FORFEITURE:
            </div>
            <ul style="font-size: 0.8rem; color: #fdd; padding-left: 18px; line-height: 1.5;">
              <li>Your standing Fixed Deposit of <strong>${circle.currency}${circle.fdAmount.toLocaleString()}</strong> will be immediately <strong>UNLOCKED</strong>.</li>
              <li>${redeemer.name} may spend the unlocked ${circle.currency}${circle.fdAmount.toLocaleString()} in any way they choose (including funding their own trip or favours).</li>
              <li>This breach is recorded permanently into the Sacred Audit Ledger.</li>
            </ul>
          </div>

          <div class="modal-footer" style="padding: 12px 0 0; border-top: 1px solid rgba(224, 59, 59, 0.2);">
            <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Back Down &amp; Honor Pact</button>
            <button type="button" class="btn btn-danger" id="confirm-forfeit-btn">
              I Refuse &amp; Forfeit ${circle.currency}${circle.fdAmount.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    `;

    this.overlay.classList.add("open");
    this.bindCommonEvents();

    const confirmBtn = document.getElementById("confirm-forfeit-btn");
    confirmBtn.addEventListener("click", () => {
      this.close();
      this.callbacks.onMemberForfeited(memberId);
    });
  }

  openInductionVoteModal(circle, contenderId) {
    sounds.playClick();
    const cont = circle.contenders.find(c => c.id === contenderId);
    const votes = { ...cont.votes };

    // Initialize all as null if not voted
    circle.committee.forEach(m => {
      if (votes[m.id] === undefined) votes[m.id] = true; // default Aye for convenience
    });

    const renderVoteBody = () => {
      const allAye = circle.committee.every(m => votes[m.id] === true);
      this.overlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 style="font-size: 1.15rem; color: var(--gold-bright);">👑 Committee Induction Vote</h3>
            <button class="modal-close" id="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="font-size: 2.2rem;">🌟</div>
              <h4 style="color: var(--gold-bright); font-size: 1.1rem; margin-top: 4px;">Candidate: ${cont.name}</h4>
              <p style="font-size: 0.8rem; color: var(--ink-subtle);">
                Candidate has completed <strong>3 of 3</strong> required group plans. Per Section 5 of Charter, admission requires <strong>100% Unanimous Approval</strong>.
              </p>
            </div>

            <div style="background: var(--bg-subtle); border: 1px solid var(--gold-border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 18px;">
              <div style="font-size: 0.76rem; font-weight: 700; color: var(--gold-bright); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;">
                Founder Ballots:
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${circle.committee.map(m => `
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(223, 183, 88, 0.12); padding-bottom: 8px;">
                    <div>
                      <div style="font-weight: 600; font-size: 0.88rem;">${m.name}</div>
                      <div style="font-size: 0.7rem; color: var(--ink-subtle);">${m.role || 'Committee Member'}</div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-vote-toggle ${votes[m.id] === true ? 'btn-primary' : 'btn-secondary'}" data-id="${m.id}" data-val="true">
                        AYE (Approve)
                      </button>
                      <button class="btn btn-sm btn-vote-toggle ${votes[m.id] === false ? 'btn-danger' : 'btn-secondary'}" data-id="${m.id}" data-val="false">
                        NAY (Veto)
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="modal-footer" style="padding: 12px 0 0; border-top: 1px solid rgba(223, 183, 88, 0.15);">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Close</button>
              <button type="button" class="btn btn-primary" id="btn-ratify-induction" ${!allAye ? 'disabled style="opacity: 0.5;"' : ''}>
                ${allAye ? '🎉 Ratify & Induct into Circle' : 'Unanimity Required (Veto Active)'}
              </button>
            </div>
          </div>
        </div>
      `;

      this.bindCommonEvents();

      this.overlay.querySelectorAll(".btn-vote-toggle").forEach(btn => {
        btn.addEventListener("click", (e) => {
          sounds.playClick();
          const mId = e.currentTarget.getAttribute("data-id");
          const val = e.currentTarget.getAttribute("data-val") === "true";
          votes[mId] = val;
          renderVoteBody();
        });
      });

      const ratifyBtn = document.getElementById("btn-ratify-induction");
      if (ratifyBtn && allAye) {
        ratifyBtn.addEventListener("click", () => {
          sounds.playFanfare();
          if (typeof window.confetti === "function") {
            window.confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.6 },
              colors: ["#dfb758", "#fae8a8", "#ffffff", "#8c6a1e"]
            });
          }
          this.close();
          this.callbacks.onContenderInducted(contenderId);
        });
      }
    };

    this.overlay.classList.add("open");
    renderVoteBody();
  }

  openAddPlanModal(circle, contenderId) {
    sounds.playClick();
    const cont = circle.contenders.find(c => c.id === contenderId);

    this.overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; color: var(--gold-bright);">🎯 Log Attended Plan for ${cont.name}</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 16px;">
            Log an official group plan or trip attended by <strong>${cont.name}</strong> to progress towards the 3-strike requirement.
          </p>

          <form id="form-add-plan">
            <div class="form-group">
              <label class="form-label">Plan / Event Title</label>
              <input type="text" class="form-control" id="plan-title" placeholder="e.g. Goa Beach Villa Weekend" required />
            </div>

            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" id="plan-date" value="${new Date().toISOString().split('T')[0]}" required />
            </div>

            <div class="modal-footer" style="padding: 16px 0 0; border-top: 1px solid rgba(223, 183, 88, 0.15);">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Log Plan (+1 Strike)</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.overlay.classList.add("open");
    this.bindCommonEvents();

    const form = document.getElementById("form-add-plan");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("plan-title").value.trim();
      const date = document.getElementById("plan-date").value;
      sounds.playClick();
      this.close();
      this.callbacks.onPlanAdded(contenderId, { title, date });
    });
  }

  openAddContenderModal(circle) {
    sounds.playClick();
    this.overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 1.15rem; color: var(--gold-bright);">👤 Propose New Contender</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 16px;">
            Register a candidate who wishes to earn eligibility for membership into ${circle.name}.
          </p>

          <form id="form-add-contender">
            <div class="form-group">
              <label class="form-label">Candidate Name</label>
              <input type="text" class="form-control" id="cont-name" placeholder="e.g. Tanvi Desai" required />
            </div>

            <div class="form-group">
              <label class="form-label">Initial Attended Plan (Optional)</label>
              <input type="text" class="form-control" id="cont-init-plan" placeholder="e.g. First Dinner at Pune Club" />
            </div>

            <div class="modal-footer" style="padding: 16px 0 0; border-top: 1px solid rgba(223, 183, 88, 0.15);">
              <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Register Contender</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.overlay.classList.add("open");
    this.bindCommonEvents();

    const form = document.getElementById("form-add-contender");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cont-name").value.trim();
      const initPlan = document.getElementById("cont-init-plan").value.trim();
      sounds.playClick();
      this.close();
      this.callbacks.onContenderCreated({ name, initPlan });
    });
  }

  bindCommonEvents() {
    const closeBtn = document.getElementById("modal-close-btn");
    const cancelBtn = document.getElementById("modal-cancel-btn");
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    if (cancelBtn) cancelBtn.addEventListener("click", () => this.close());
  }
}
