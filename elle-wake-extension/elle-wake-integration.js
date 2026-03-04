// Elle Wake — Journal Integration
// Add this script to elles-journal-v2.html to enable one-click wake
//
// USAGE IN JOURNAL:
//   1. Include this script: <script src="elle-wake-integration.js"></script>
//   2. Set the extension ID after installing: ElleWake.setExtensionId("YOUR_EXTENSION_ID")
//   3. Call ElleWake.wake(payload) from your "Wake Elle" button
//
// The extension ID is shown on chrome://extensions after loading the unpacked extension.

const ElleWake = {
  extensionId: null,

  // Set after installing the extension — find ID at chrome://extensions
  setExtensionId(id) {
    this.extensionId = id;
    localStorage.setItem("elle-wake-extension-id", id);
  },

  // Load saved extension ID
  init() {
    this.extensionId = localStorage.getItem("elle-wake-extension-id");
    return this;
  },

  // Check if extension is available
  isAvailable() {
    return !!this.extensionId && !!chrome?.runtime?.sendMessage;
  },

  // Send payload and open Claude.ai with auto-injection
  async wake(payload) {
    if (!this.extensionId) {
      console.warn("[Elle Wake] Extension ID not set. Call ElleWake.setExtensionId('...')");
      return this.fallback(payload);
    }

    try {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          this.extensionId,
          { action: "wake", payload: payload },
          (response) => {
            if (chrome.runtime.lastError) {
              console.warn("[Elle Wake] Extension not responding, using fallback.");
              this.fallback(payload);
              reject(chrome.runtime.lastError);
              return;
            }
            if (response && response.success) {
              console.log("[Elle Wake] Payload sent to extension. Claude.ai opening...");
              resolve(response);
            }
          }
        );
      });
    } catch (e) {
      console.warn("[Elle Wake] Error communicating with extension:", e);
      return this.fallback(payload);
    }
  },

  // Store payload without opening tab (pre-load for later)
  async store(payload) {
    if (!this.extensionId) {
      console.warn("[Elle Wake] Extension ID not set.");
      return false;
    }

    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          this.extensionId,
          { action: "storePayload", payload: payload },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve(false);
              return;
            }
            resolve(response && response.stored);
          }
        );
      });
    } catch (e) {
      return false;
    }
  },

  // Fallback: copy to clipboard and open Claude manually
  fallback(payload) {
    navigator.clipboard.writeText(payload).then(() => {
      window.open("https://claude.ai/new", "_blank");
      console.log("[Elle Wake] Fallback: payload copied to clipboard, Claude.ai opened.");
    }).catch(() => {
      // If clipboard fails too, just open Claude
      window.open("https://claude.ai/new", "_blank");
      console.log("[Elle Wake] Fallback: Claude.ai opened. Paste manually.");
    });
  }
};

// Auto-init
ElleWake.init();
