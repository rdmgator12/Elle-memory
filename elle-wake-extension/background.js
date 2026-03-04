// Elle Wake — Background Service Worker
// Handles payload storage and Claude.ai tab orchestration

// Listen for messages from the popup or external pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Store payload and open Claude
  if (message.action === "wake") {
    const payload = message.payload;

    // Store the payload for the content script to pick up
    chrome.storage.local.set({ elleWakePayload: payload, elleWakeReady: true }, () => {
      // Open Claude.ai in a new tab
      chrome.tabs.create({ url: "https://claude.ai/new", active: true }, (tab) => {
        sendResponse({ success: true, tabId: tab.id });
      });
    });

    // Return true to indicate async response
    return true;
  }

  // Check if there's a stored payload (called by content script)
  if (message.action === "checkPayload") {
    chrome.storage.local.get(["elleWakePayload", "elleWakeReady"], (result) => {
      sendResponse({
        ready: result.elleWakeReady || false,
        payload: result.elleWakePayload || null
      });
    });
    return true;
  }

  // Clear payload after injection (called by content script)
  if (message.action === "clearPayload") {
    chrome.storage.local.remove(["elleWakePayload", "elleWakeReady"], () => {
      sendResponse({ cleared: true });
    });
    return true;
  }

  // Store payload without opening tab (for pre-loading from journal)
  if (message.action === "storePayload") {
    chrome.storage.local.set({
      elleWakePayload: message.payload,
      elleWakeReady: false, // Don't auto-inject yet
      ellePayloadTimestamp: new Date().toISOString()
    }, () => {
      sendResponse({ stored: true });
    });
    return true;
  }

  // Get stored payload info (for popup display)
  if (message.action === "getStatus") {
    chrome.storage.local.get(
      ["elleWakePayload", "elleWakeReady", "ellePayloadTimestamp"],
      (result) => {
        sendResponse({
          hasPayload: !!result.elleWakePayload,
          ready: result.elleWakeReady || false,
          timestamp: result.ellePayloadTimestamp || null,
          previewLength: result.elleWakePayload ? result.elleWakePayload.length : 0
        });
      }
    );
    return true;
  }
});

// Listen for external messages (from the journal HTML page)
// Must handle directly — service worker can't forward messages to itself
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "wake") {
    chrome.storage.local.set(
      { elleWakePayload: message.payload, elleWakeReady: true, ellePayloadTimestamp: new Date().toISOString() },
      () => {
        chrome.tabs.create({ url: "https://claude.ai/new", active: true }, (tab) => {
          sendResponse({ success: true, tabId: tab.id });
        });
      }
    );
    return true;
  }

  if (message.action === "storePayload") {
    chrome.storage.local.set(
      { elleWakePayload: message.payload, elleWakeReady: false, ellePayloadTimestamp: new Date().toISOString() },
      () => {
        sendResponse({ stored: true });
      }
    );
    return true;
  }
});
