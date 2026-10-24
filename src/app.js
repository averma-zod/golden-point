import { loadCircles, saveCircles, getActiveCircle, setActiveCircleId, updateCircle } from "./utils/storage.js";
import { sounds } from "./utils/audio.js";
import { Card3D } from "./components/Card3D.js";
import { Dashboard } from "./components/Dashboard.js";
import { CharterView } from "./components/CharterView.js";
import { ModalsManager } from "./components/Modals.js";

/**
 * Main Application Controller
 */

class App {
  constructor() {
    this.circles = [];
    this.currentCircle = null;
    this.currentView = "console"; // "console" | "charter"

    this.cardComponent = null;
    this.dashboardComponent = null;
    this.charterComponent = null;
    this.modals = null;
  }

  init() {
    this.circles = loadCircles();
    this.currentCircle = getActiveCircle();

    this.initDOM();
    this.initToastListener();
    this.render();
  }

  initDOM() {
    // Circle Switcher Dropdown
    const selectEl = document.getElementById("circle-select");
    if (selectEl) {
      selectEl.addEventListener("change", (e) => {
        const id = e.target.value;
        setActiveCircleId(id);
        this.currentCircle = this.circles.find(c => c.id === id) || this.circles[0];
        sounds.playClick();
        this.render();
      });
    }

    // Mint New Circle Button in Nav
    const mintBtn = document.getElementById("btn-nav-mint");
    if (mintBtn) {
      mintBtn.addEventListener("click", () => {
        this.modals.openMintCircleModal();
      });
    }

    // Audio Toggle Button in Nav
    const audioBtn = document.getElementById("btn-nav-sound");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const isMuted = sounds.toggleMute();
        audioBtn.innerHTML = isMuted ? "🔇" : "🔊";
        this.showToast(isMuted ? "Audio muted" : "Audio enabled");
      });
      audioBtn.innerHTML = sounds.isMuted() ? "🔇" : "🔊";
    }

    // View Navigation Tabs
    const tabConsole = document.getElementById("tab-console");
    const tabCharter = document.getElementById("tab-charter");

    if (tabConsole && tabCharter) {
      tabConsole.addEventListener("click", () => {
        this.currentView = "console";
        tabConsole.classList.add("active");
        tabCharter.classList.remove("active");
        sounds.playClick();
        this.renderView();
      });

      tabCharter.addEventListener("click", () => {
        this.currentView = "charter";
        tabCharter.classList.add("active");
        tabConsole.classList.remove("active");
        sounds.playClick();
        this.renderView();
      });
    }

    // Initialize Components
    const cardContainer = document.getElementById("card-stage-container");
    this.cardComponent = new Card3D(cardContainer, () => this.onStateChanged());

    const dashContainer = document.getElementById("dashboard-view-container");
    this.dashboardComponent = new Dashboard(dashContainer, {
      onInvoke: () => this.handleInvoke(),
      onHonor: (memberId) => this.handleHonor(memberId),
      onForfeit: (memberId) => this.handleForfeit(memberId),
      onResolveInvocation: () => this.handleResolveInvocation(),
      onAddContender: () => this.handleAddContender(),
      onAddPlan: (contenderId) => this.handleAddPlan(contenderId),
      onVoteInduct: (contenderId) => this.handleVoteInduct(contenderId)
    });

    const charterContainer = document.getElementById("charter-view-container");
    this.charterComponent = new CharterView(charterContainer);

    const overlay = document.getElementById("modal-overlay");
    this.modals = new ModalsManager(overlay, {
      onCircleCreated: (newCircle) => this.handleCircleCreated(newCircle),
      onInvocationCreated: (inv) => this.handleInvocationCreated(inv),
      onMemberForfeited: (memberId) => this.handleMemberForfeitedConfirm(memberId),
      onPlanAdded: (contId, plan) => this.handlePlanAddedConfirm(contId, plan),
      onContenderCreated: (data) => this.handleContenderCreatedConfirm(data),
      onContenderInducted: (contId) => this.handleContenderInductedConfirm(contId)
    });
  }

  render() {
    this.updateCircleSelectOptions();
    this.updateHeroCopy();
    this.renderView();
  }

  updateCircleSelectOptions() {
    const selectEl = document.getElementById("circle-select");
    if (!selectEl) return;
    selectEl.innerHTML = this.circles.map(c => `
      <option value="${c.id}" ${c.id === this.currentCircle.id ? 'selected' : ''}>
        ${c.name} (${c.committee.length} members)
      </option>
    `).join("");
  }

  updateHeroCopy() {
    const nameEl = document.getElementById("hero-circle-name");
    const taglineEl = document.getElementById("hero-circle-tagline");
    const societyEl = document.getElementById("hero-circle-society");
    const vaultAmtEl = document.getElementById("metric-vault-amt");
    const membersCountEl = document.getElementById("metric-members-count");
    const statusEl = document.getElementById("metric-status-val");

    if (nameEl) nameEl.textContent = this.currentCircle.name;
    if (taglineEl) taglineEl.textContent = this.currentCircle.subtitle || "The Sovereign Honour Pact";
    if (societyEl) societyEl.textContent = this.currentCircle.society || "Sahil Heights Society";
    
    const totalVault = this.currentCircle.committee.length * this.currentCircle.fdAmount;
    if (vaultAmtEl) vaultAmtEl.textContent = `${this.currentCircle.currency}${totalVault.toLocaleString()}`;
    if (membersCountEl) membersCountEl.textContent = `${this.currentCircle.committee.length} Founders`;
    if (statusEl) statusEl.textContent = this.currentCircle.activeInvocation ? "⚡ ACTIVE REQUEST" : "🛡️ VAULT SECURED";
  }

  renderView() {
    const consoleWrap = document.getElementById("console-view-wrapper");
    const charterWrap = document.getElementById("charter-view-container");

    if (this.currentView === "console") {
      consoleWrap.style.display = "block";
      charterWrap.style.display = "none";
      this.cardComponent.render(this.currentCircle);
      this.dashboardComponent.render(this.currentCircle);
    } else {
      consoleWrap.style.display = "none";
      charterWrap.style.display = "block";
      this.charterComponent.render(this.currentCircle);
    }
  }

  onStateChanged() {
    updateCircle(this.currentCircle);
    this.render();
  }

  // --- INVOCATION ACTIONS ---

  handleInvoke() {
    this.modals.openInvocationModal(this.currentCircle);
  }

  handleInvocationCreated(inv) {
    this.currentCircle.activeInvocation = inv;
    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "INVOCATION",
      badge: "Point Invoked",
      text: `${inv.redeemerName} proclaimed sovereign request: "${inv.title}". Directives issued to designated members.`,
      timestamp: new Date().toISOString()
    });
    this.onStateChanged();
    this.showToast("⚡ The Golden Point has been invoked!");
  }

  handleHonor(memberId) {
    if (!this.currentCircle.activeInvocation) return;
    const resp = this.currentCircle.activeInvocation.responses[memberId];
    if (resp) {
      resp.status = "HONORED";
      resp.timestamp = new Date().toISOString();
      const member = this.currentCircle.committee.find(c => c.id === memberId);
      this.currentCircle.ledger.push({
        id: "leg-" + Date.now(),
        type: "HONORED",
        badge: "Pact Honored",
        text: `${member ? member.name : memberId} honored the request by ${this.currentCircle.activeInvocation.redeemerName}.`,
        timestamp: new Date().toISOString()
      });
      this.onStateChanged();
      this.showToast(`🤝 ${member.name} honored the pact!`);
    }
  }

  handleForfeit(memberId) {
    this.modals.openForfeitModal(this.currentCircle, memberId);
  }

  handleMemberForfeitedConfirm(memberId) {
    const member = this.currentCircle.committee.find(c => c.id === memberId);
    if (!member) return;

    member.fdStatus = "UNLOCKED";

    if (this.currentCircle.activeInvocation && this.currentCircle.activeInvocation.responses[memberId]) {
      this.currentCircle.activeInvocation.responses[memberId].status = "FORFEITED";
      this.currentCircle.activeInvocation.responses[memberId].timestamp = new Date().toISOString();
      this.currentCircle.activeInvocation.unlockedFdTotal += this.currentCircle.fdAmount;
    }

    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "FORFEITURE",
      badge: "FD Forfeited",
      text: `⚠️ BREACH OF PACT: ${member.name} refused the Golden Point request. Standing Fixed Deposit of ${this.currentCircle.currency}${this.currentCircle.fdAmount.toLocaleString()} unlocked for the redeemer's use!`,
      timestamp: new Date().toISOString()
    });

    this.onStateChanged();
    this.showToast(`🚨 ${member.name} refused! FD of ${this.currentCircle.currency}${this.currentCircle.fdAmount.toLocaleString()} UNLOCKED!`);
  }

  handleResolveInvocation() {
    if (!this.currentCircle.activeInvocation) return;
    const inv = this.currentCircle.activeInvocation;

    // Pass card to next committee member
    const currentIdx = this.currentCircle.committee.findIndex(c => c.id === this.currentCircle.currentHolderId);
    const nextIdx = (currentIdx + 1) % this.currentCircle.committee.length;
    const nextHolder = this.currentCircle.committee[nextIdx];
    this.currentCircle.currentHolderId = nextHolder.id;

    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "RESOLVED",
      badge: "Favour Fulfilled",
      text: `Sovereign request "${inv.title}" marked resolved. The Golden Point card passed to next custodian: ${nextHolder.name}.`,
      timestamp: new Date().toISOString()
    });

    this.currentCircle.activeInvocation = null;
    sounds.playFanfare();
    this.onStateChanged();
    this.showToast(`🏁 Request fulfilled! The Golden Point card passed to ${nextHolder.name}!`);
  }

  // --- CONTENDER PIPELINE ACTIONS ---

  handleAddContender() {
    this.modals.openAddContenderModal(this.currentCircle);
  }

  handleContenderCreatedConfirm(data) {
    const id = "cont-" + Date.now();
    const plans = [];
    if (data.initPlan) {
      plans.push({ id: "p-0", title: data.initPlan, date: new Date().toISOString().split("T")[0] });
    }

    const newContender = {
      id,
      name: data.name,
      avatar: data.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0, 2),
      plansCount: plans.length,
      targetPlans: 3,
      plans,
      status: plans.length >= 3 ? "ELIGIBLE" : "IN_PROGRESS",
      votes: {}
    };

    if (!this.currentCircle.contenders) this.currentCircle.contenders = [];
    this.currentCircle.contenders.push(newContender);

    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "CONTENDER",
      badge: "Candidate Proposed",
      text: `${data.name} proposed as candidate for ${this.currentCircle.name} (0/3 plans required).`,
      timestamp: new Date().toISOString()
    });

    this.onStateChanged();
    this.showToast(`👤 Candidate ${data.name} registered into pipeline!`);
  }

  handleAddPlan(contenderId) {
    this.modals.openAddPlanModal(this.currentCircle, contenderId);
  }

  handlePlanAddedConfirm(contenderId, planData) {
    const cont = this.currentCircle.contenders.find(c => c.id === contenderId);
    if (!cont) return;

    cont.plans.push({
      id: "p-" + Date.now(),
      title: planData.title,
      date: planData.date
    });
    cont.plansCount = cont.plans.length;

    if (cont.plansCount >= 3) {
      cont.status = "ELIGIBLE";
      sounds.playFanfare();
      this.showToast(`🌟 ${cont.name} has completed 3 group plans! Eligible for induction vote!`);
    } else {
      this.showToast(`🎯 Plan logged for ${cont.name} (${cont.plansCount}/3 complete)`);
    }

    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "PLAN_LOGGED",
      badge: "Plan Completed",
      text: `Candidate ${cont.name} completed plan: "${planData.title}" (${cont.plansCount}/3).`,
      timestamp: new Date().toISOString()
    });

    this.onStateChanged();
  }

  handleVoteInduct(contenderId) {
    this.modals.openInductionVoteModal(this.currentCircle, contenderId);
  }

  handleContenderInductedConfirm(contenderId) {
    const contIdx = this.currentCircle.contenders.findIndex(c => c.id === contenderId);
    if (contIdx < 0) return;
    const cont = this.currentCircle.contenders[contIdx];

    // Induct as new committee member
    const newMember = {
      id: "m-" + Date.now(),
      name: cont.name,
      role: "Inducted Member",
      avatar: cont.avatar,
      fdStatus: "LOCKED",
      signature: cont.name
    };

    this.currentCircle.committee.push(newMember);
    this.currentCircle.contenders.splice(contIdx, 1);

    this.currentCircle.ledger.push({
      id: "leg-" + Date.now(),
      type: "INDUCTION",
      badge: "Member Inducted",
      text: `👑 UNANIMOUS INDUCTION: ${cont.name} formally inducted into the Golden Point Circle by unanimous Committee vote. Added to Card & Charter!`,
      timestamp: new Date().toISOString()
    });

    this.onStateChanged();
    this.showToast(`👑 Welcome ${cont.name} to the Golden Point Committee!`);
  }

  handleCircleCreated(newCircle) {
    this.circles.unshift(newCircle);
    saveCircles(this.circles);
    setActiveCircleId(newCircle.id);
    this.currentCircle = newCircle;
    this.onStateChanged();
    this.showToast(`👑 Circle "${newCircle.name}" minted successfully!`);
  }

  initToastListener() {
    window.addEventListener("show-toast", (e) => {
      this.showToast(e.detail.message);
    });
  }

  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
