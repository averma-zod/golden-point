import { sounds } from "../utils/audio.js";

/**
 * Operations Dashboard View:
 * Manages live Golden Point invocations, Member response actions (Honor vs Forfeit),
 * FD Security Vault, and 3-Strike Contender Pipeline.
 */

export class Dashboard {
  constructor(containerEl, handlers) {
    this.container = containerEl;
    this.handlers = handlers; // { onInvoke, onHonor, onForfeit, onAddPlan, onVoteInduct, onAddContender, onResolveInvocation }
    this.circle = null;
  }

  render(circle) {
    this.circle = circle;
    const inv = circle.activeInvocation;
    const currentHolder = circle.committee.find((c) => c.id === circle.currentHolderId) || circle.committee[0];
    const totalVault = circle.committee.length * circle.fdAmount;
    const unlockedTotal = circle.committee.filter(c => c.fdStatus === "UNLOCKED").length * circle.fdAmount;

    this.container.innerHTML = `
      <div class="dashboard-grid">
        
        <!-- LEFT COLUMN: ACTIVE INVOCATION & VAULT -->
        <div class="dash-left-col">
          
          <!-- ACTIVE INVOCATION PANEL -->
          <div class="glass-panel">
            <div class="panel-head">
              <div class="panel-title">
                <span>⚡</span>
                <span>Sovereign Invocation</span>
              </div>
              <span class="panel-badge ${inv ? 'active' : ''}">
                ${inv ? 'ACTIVE INVOCATION' : 'STANDBY'}
              </span>
            </div>

            ${inv ? `
              <div class="invocation-card active">
                <div class="invocation-status-banner">
                  <div class="redeemer-badge">
                    <div class="avatar-dot">${inv.redeemerName.split(" ").map(n=>n[0]).join("")}</div>
                    <span>Invoked by <strong>${inv.redeemerName}</strong></span>
                  </div>
                  <span class="status-pill awaiting">DECISION PENDING</span>
                </div>

                <h3 class="invocation-title">${inv.title}</h3>
                <p class="invocation-desc">${inv.description}</p>

                <div class="invocation-meta">
                  <div><strong>Category:</strong> ${inv.category || 'Sacred Favour'}</div>
                  <div><strong>Stakes:</strong> ${circle.currency}${circle.fdAmount.toLocaleString()} FD Forfeiture on Denial</div>
                </div>

                <!-- RESPONSES LIST -->
                <div style="margin-top: 18px;">
                  <h4 style="font-size: 0.82rem; letter-spacing: 0.1em; color: var(--gold-bright); text-transform: uppercase; margin-bottom: 8px;">
                    Member Directives (${Object.keys(inv.responses).length} Designated):
                  </h4>
                  <div class="member-responses-list">
                    ${Object.entries(inv.responses).map(([memberId, resp]) => {
                      const member = circle.committee.find(c => c.id === memberId) || { name: memberId };
                      return `
                        <div class="response-row">
                          <div class="response-user">
                            <div class="avatar-dot" style="width: 24px; height: 24px; font-size: 0.65rem;">
                              ${member.name.split(" ").map(n=>n[0]).join("")}
                            </div>
                            <div>
                              <div class="response-user-name">${member.name}</div>
                              <div class="response-user-role">${member.role || 'Member'}</div>
                            </div>
                          </div>

                          <div style="display: flex; align-items: center; gap: 8px;">
                            ${resp.status === 'AWAITING' ? `
                              <button class="btn btn-primary btn-sm btn-honor" data-id="${memberId}">
                                🤝 Honor Pact
                              </button>
                              <button class="btn btn-danger btn-sm btn-forfeit" data-id="${memberId}">
                                ⚠️ Refuse &amp; Forfeit
                              </button>
                            ` : resp.status === 'HONORED' ? `
                              <span class="status-pill honored">✅ Pact Honored</span>
                            ` : `
                              <span class="status-pill forfeited">❌ FD Forfeited (${circle.currency}${circle.fdAmount.toLocaleString()})</span>
                            `}
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>

                <!-- RESOLVE INVOCATION ACTION -->
                <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
                  <button class="btn btn-secondary btn-sm" id="btn-resolve-inv">
                    🏁 Mark Completed &amp; Pass Card
                  </button>
                </div>
              </div>
            ` : `
              <div style="text-align: center; padding: 36px 20px; background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); border: 1px dashed var(--gold-border);">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">👑</div>
                <h3 style="font-size: 1.1rem; color: var(--gold-bright); margin-bottom: 6px;">The Golden Point is in Reserve</h3>
                <p style="font-size: 0.88rem; color: var(--ink-muted); max-width: 420px; margin: 0 auto 20px;">
                  Current Custodian: <strong>${currentHolder.name}</strong>. The holder may invoke one irrevocable sovereign demand upon the circle.
                </p>
                <button class="btn btn-primary" id="btn-trigger-invoke">
                  ⚡ Invoke The Golden Point
                </button>
              </div>
            `}
          </div>

          <!-- THE FD SECURITY VAULT -->
          <div class="fd-vault-card">
            <div class="fd-vault-header">
              <div>
                <h3>THE FIXED DEPOSIT (FD) VAULT</h3>
                <div class="fd-large-amount">${circle.currency}${(totalVault).toLocaleString()}</div>
                <div class="fd-large-sub">TOTAL COMMITTED HONOR CAPITAL</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.75rem; font-weight: 700; color: ${unlockedTotal > 0 ? 'var(--accent-forfeit)' : 'var(--accent-safe)'};">
                  ${unlockedTotal > 0 ? `⚠️ UNLOCKED BOUNTY: ${circle.currency}${unlockedTotal.toLocaleString()}` : '🛡️ VAULT INTACT'}
                </div>
                <div style="font-size: 0.65rem; color: var(--ink-on-ivory-muted);">
                  ${circle.currency}${circle.fdAmount.toLocaleString()} per cardholder standing commitment
                </div>
              </div>
            </div>

            <div class="fd-members-grid">
              ${circle.committee.map(c => `
                <div class="fd-member-tile">
                  <div class="fd-tile-name">${c.name}</div>
                  <div class="fd-tile-amt">${circle.currency}${circle.fdAmount.toLocaleString()}</div>
                  <span class="status-pill ${c.fdStatus === 'UNLOCKED' ? 'forfeited' : 'honored'}">
                    ${c.fdStatus === 'UNLOCKED' ? 'FORFEITED' : 'LOCKED & SAFE'}
                  </span>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: CONTENDER PIPELINE & LEDGER -->
        <div class="dash-right-col">
          
          <!-- 3-STRIKE CONTENDER PIPELINE -->
          <div class="glass-panel" style="margin-bottom: 24px;">
            <div class="panel-head">
              <div class="panel-title">
                <span>🎯</span>
                <span>Contender Pipeline</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-add-contender" style="font-size: 0.68rem; padding: 4px 10px;">
                + Add Contender
              </button>
            </div>

            <p style="font-size: 0.8rem; color: var(--ink-muted); margin-bottom: 16px;">
              Per Section 5 of Charter: A prospective member must participate in <strong>3 group plans</strong> before eligible for unanimous committee induction.
            </p>

            <div class="contenders-list">
              ${circle.contenders && circle.contenders.length > 0 ? circle.contenders.map(cont => {
                const isEligible = cont.plansCount >= 3;
                return `
                  <div class="contender-item">
                    <div class="contender-head">
                      <div>
                        <div class="contender-name">${cont.name}</div>
                        <div style="font-size: 0.72rem; color: var(--ink-subtle);">
                          ${isEligible ? '🌟 ELIGIBLE FOR INDUCTION' : `${cont.plansCount} of 3 Required Plans`}
                        </div>
                      </div>
                      <div class="strike-tracker">
                        <div class="strike-node ${cont.plansCount >= 1 ? 'completed' : ''}">1</div>
                        <div class="strike-node ${cont.plansCount >= 2 ? 'completed' : ''}">2</div>
                        <div class="strike-node ${cont.plansCount >= 3 ? 'completed' : ''}">3</div>
                      </div>
                    </div>

                    <ul class="plans-history">
                      ${cont.plans.map(p => `
                        <li>
                          <span>${p.title}</span>
                          <span style="color: var(--ink-subtle);">${p.date}</span>
                        </li>
                      `).join("")}
                    </ul>

                    <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px;">
                      ${!isEligible ? `
                        <button class="btn btn-secondary btn-sm btn-add-plan" data-id="${cont.id}">
                          + Log Attended Plan
                        </button>
                      ` : `
                        <button class="btn btn-primary btn-sm btn-vote-induct" data-id="${cont.id}">
                          👑 Call Induction Vote
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join("") : `
                <div style="text-align: center; padding: 20px; color: var(--ink-subtle); font-size: 0.85rem;">
                  No contenders currently tracking. Click "+ Add Contender" to register a candidate.
                </div>
              `}
            </div>
          </div>

          <!-- SACRED AUDIT LEDGER -->
          <div class="glass-panel">
            <div class="panel-head">
              <div class="panel-title">
                <span>📜</span>
                <span>Sacred Audit Ledger</span>
              </div>
              <span style="font-size: 0.72rem; color: var(--ink-subtle);">Official Record</span>
            </div>

            <div class="ledger-timeline" style="max-height: 280px; overflow-y: auto;">
              ${circle.ledger.map(item => `
                <div style="padding: 10px 0; border-bottom: 1px dashed rgba(223, 183, 88, 0.12);">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span class="panel-badge" style="font-size: 0.62rem; padding: 2px 6px;">${item.badge || item.type}</span>
                    <span style="font-size: 0.68rem; color: var(--ink-subtle);">${new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p style="font-size: 0.82rem; color: var(--ink-on-dark); margin: 0;">${item.text}</p>
                </div>
              `).reverse().join("")}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Invoke trigger
    const invokeBtn = document.getElementById("btn-trigger-invoke");
    if (invokeBtn) {
      invokeBtn.addEventListener("click", () => {
        sounds.playClick();
        this.handlers.onInvoke();
      });
    }

    // Resolve trigger
    const resolveBtn = document.getElementById("btn-resolve-inv");
    if (resolveBtn) {
      resolveBtn.addEventListener("click", () => {
        sounds.playClick();
        this.handlers.onResolveInvocation();
      });
    }

    // Honor directive buttons
    this.container.querySelectorAll(".btn-honor").forEach(btn => {
      btn.addEventListener("click", (e) => {
        sounds.playClick();
        const memberId = e.currentTarget.getAttribute("data-id");
        this.handlers.onHonor(memberId);
      });
    });

    // Forfeit directive buttons
    this.container.querySelectorAll(".btn-forfeit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const memberId = e.currentTarget.getAttribute("data-id");
        this.handlers.onForfeit(memberId);
      });
    });

    // Add Contender
    const addContenderBtn = document.getElementById("btn-add-contender");
    if (addContenderBtn) {
      addContenderBtn.addEventListener("click", () => {
        sounds.playClick();
        this.handlers.onAddContender();
      });
    }

    // Add Plan to contender
    this.container.querySelectorAll(".btn-add-plan").forEach(btn => {
      btn.addEventListener("click", (e) => {
        sounds.playClick();
        const contId = e.currentTarget.getAttribute("data-id");
        this.handlers.onAddPlan(contId);
      });
    });

    // Vote induct
    this.container.querySelectorAll(".btn-vote-induct").forEach(btn => {
      btn.addEventListener("click", (e) => {
        sounds.playClick();
        const contId = e.currentTarget.getAttribute("data-id");
        this.handlers.onVoteInduct(contId);
      });
    });
  }
}
