// Elle Wake — Journal Bridge Content Script
// Injected on the journal page (file:// or github.io) to bridge
// communication with the extension background script.
// Solves: chrome.runtime.sendMessage (external) doesn't work on file:// origins.

(function() {
  "use strict";

  window.addEventListener('message', (event) => {
    // Only accept messages from the same window (the journal page)
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'elle-wake') return;

    if (event.data.action === 'wake') {
      // Store payload in extension storage (content scripts have access)
      chrome.storage.local.set({
        elleWakePayload: event.data.payload,
        elleWakeReady: true,
        ellePayloadTimestamp: new Date().toISOString()
      }, () => {
        if (chrome.runtime.lastError) {
          console.log("[Elle Wake Bridge] Storage error:", chrome.runtime.lastError.message);
          window.postMessage({ type: 'elle-wake-response', success: false }, '*');
          return;
        }
        // Ask background to open Claude.ai/new
        chrome.runtime.sendMessage({ action: 'openClaude' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("[Elle Wake Bridge] Background error:", chrome.runtime.lastError.message);
            window.postMessage({ type: 'elle-wake-response', success: false }, '*');
            return;
          }
          window.postMessage({ type: 'elle-wake-response', success: true }, '*');
        });
      });
    }

    if (event.data.action === 'storePayload') {
      chrome.storage.local.set({
        elleWakePayload: event.data.payload,
        elleWakeReady: false,
        ellePayloadTimestamp: new Date().toISOString()
      }, () => {
        if (chrome.runtime.lastError) {
          console.log("[Elle Wake Bridge] Store error:", chrome.runtime.lastError.message);
          return;
        }
        window.postMessage({ type: 'elle-wake-response', stored: true }, '*');
      });
    }
  });

  // Signal to the journal page that the bridge is available
  window.postMessage({ type: 'elle-wake-bridge', ready: true }, '*');
})();
