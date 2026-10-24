/**
 * HapticFeedback Engine — Web Vibration API Integration
 * Provides synchronized luxury tactile feedback on mobile devices.
 */

class HapticFeedback {
  constructor() {
    this.enabled = true;
    this.supported = typeof navigator !== "undefined" && "vibrate" in navigator;
  }

  vibrate(pattern) {
    if (!this.supported || !this.enabled) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration error on unsupported / restricted contexts
    }
  }

  // Subtle tap haptic (button presses, tab switches, toggles)
  light() {
    this.vibrate(12);
  }

  // Medium tactile pulse (card flips, token collection, slider snaps)
  medium() {
    this.vibrate([18, 25, 20]);
  }

  // Heavy tactile thud (seal break, point invocation, vault lock)
  heavy() {
    this.vibrate([45, 30, 70]);
  }

  // Rejection / Warning buzz (locked tier, forfeit action, confirmation)
  error() {
    this.vibrate([40, 50, 40, 50, 60]);
  }

  // Triumphant multi-pulse burst (vault bonus unlocked, member inducted)
  celebration() {
    this.vibrate([25, 35, 30, 40, 50, 40, 90]);
  }
}

export const haptics = new HapticFeedback();
