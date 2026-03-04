// Elle Wake — Claude.ai Content Script
// Detects stored payload and injects it into the chat composer

(function() {
  "use strict";

  const MAX_WAIT_MS = 15000;       // Max time to wait for composer to appear
  const POLL_INTERVAL_MS = 500;    // How often to check for the composer
  const POST_INJECT_DELAY_MS = 1500; // Delay after injection before first send attempt

  // Check if we have a payload to inject
  function checkForPayload() {
    chrome.runtime.sendMessage({ action: "checkPayload" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("[Elle Wake] Extension context error:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.ready && response.payload) {
        console.log("[Elle Wake] Payload detected. Waiting for composer...");
        waitForComposer(response.payload);
      }
    });
  }

  // Wait for Claude's chat input to appear in the DOM
  function waitForComposer(payload) {
    const startTime = Date.now();

    const interval = setInterval(() => {
      // Claude.ai uses a contenteditable div or a ProseMirror editor
      // Try multiple selectors to be resilient to UI changes
      const composer = findComposer();

      if (composer) {
        clearInterval(interval);
        console.log("[Elle Wake] Composer found. Injecting payload...");
        injectPayload(composer, payload);
        return;
      }

      if (Date.now() - startTime > MAX_WAIT_MS) {
        clearInterval(interval);
        console.warn("[Elle Wake] Timed out waiting for composer. Falling back to clipboard.");
        fallbackToClipboard(payload);
      }
    }, POLL_INTERVAL_MS);
  }

  // Find the chat composer element
  function findComposer() {
    // Claude.ai selector strategies (ordered by likelihood)
    const selectors = [
      // Claude's current implementation (tiptap + ProseMirror)
      'div.tiptap.ProseMirror[contenteditable="true"]',
      // ProseMirror editor (legacy)
      'div.ProseMirror[contenteditable="true"]',
      // Generic contenteditable in the chat area
      '[contenteditable="true"][data-placeholder]',
      // Textarea fallbacks
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="Reply"]',
      // Broader contenteditable search
      'div[contenteditable="true"]',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && isVisible(el)) return el;
    }

    return null;
  }

  // Check if element is visible
  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // Inject the payload into the composer
  function injectPayload(composer, payload) {
    // Focus the composer
    composer.focus();

    // Strategy 1: Simulate paste event (best for tiptap/ProseMirror)
    // This triggers the framework's paste handler which updates internal state
    try {
      const dt = new DataTransfer();
      dt.setData("text/plain", payload);
      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      composer.dispatchEvent(pasteEvent);
      console.log("[Elle Wake] Paste event dispatched.");
    } catch (e) {
      console.log("[Elle Wake] Paste simulation failed, trying execCommand:", e.message);
    }

    // Strategy 2: Check if paste worked, if not try insertText
    setTimeout(() => {
      const hasContent = composer.textContent.trim().length > 10;
      if (!hasContent) {
        console.log("[Elle Wake] Paste didn't take, trying insertText...");
        composer.focus();
        document.execCommand("selectAll", false, null);
        document.execCommand("insertText", false, payload);
      }

      // Strategy 3: Last resort — direct DOM + input events
      setTimeout(() => {
        const stillEmpty = composer.textContent.trim().length < 10;
        if (stillEmpty) {
          console.log("[Elle Wake] insertText didn't take, trying DOM injection...");
          composer.innerHTML = "";
          const p = document.createElement("p");
          p.textContent = payload;
          composer.appendChild(p);
          composer.dispatchEvent(new InputEvent("input", {
            bubbles: true, cancelable: true, inputType: "insertText", data: payload,
          }));
        }

        // Clear the stored payload
        chrome.runtime.sendMessage({ action: "clearPayload" });

        // Attempt to click send
        setTimeout(() => {
          attemptSend();
        }, POST_INJECT_DELAY_MS);
      }, 300);
    }, 300);
  }

  // Trigger synthetic input events that React/ProseMirror will pick up
  function triggerInputEvents(element, text) {
    // InputEvent for modern frameworks
    try {
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text,
      });
      element.dispatchEvent(inputEvent);
    } catch (e) {
      console.log("[Elle Wake] InputEvent dispatch note:", e.message);
    }

    // Also try beforeinput
    try {
      const beforeInput = new InputEvent("beforeinput", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: text,
      });
      element.dispatchEvent(beforeInput);
    } catch (e) {
      // Silently continue
    }
  }

  // Attempt to find and click the send button, with retries for disabled state
  function attemptSend(retries = 0) {
    const MAX_RETRIES = 10;
    const RETRY_MS = 500;

    // Strategy 1: Find the send button relative to the composer's fieldset
    const composer = findComposer();
    if (composer) {
      const fieldset = composer.closest('fieldset');
      if (fieldset) {
        // Send button = icon-only (SVG, no text). Model picker has text like "Opus 4.6"
        const candidates = [...fieldset.querySelectorAll('button')].filter(b => {
          if (!isVisible(b) || !b.querySelector('svg')) return false;
          // Exclude buttons with visible text (model picker, etc.)
          const textContent = b.textContent.trim();
          return textContent.length === 0;
        });
        if (candidates.length > 0) {
          // The send button is typically the last icon-only button
          const sendBtn = candidates[candidates.length - 1];
          if (!sendBtn.disabled) {
            console.log("[Elle Wake] Send button enabled. Sending...");
            sendBtn.click();
            showConfirmation();
            return;
          } else if (retries < MAX_RETRIES) {
            console.log(`[Elle Wake] Send button found but disabled. Retry ${retries + 1}/${MAX_RETRIES}...`);
            setTimeout(() => attemptSend(retries + 1), RETRY_MS);
            return;
          }
        }
      }
    }

    // Strategy 2: Global fallback selectors
    const sendSelectors = [
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'button[aria-label="Send"]',
      'button[data-testid="send-button"]',
    ];

    for (const selector of sendSelectors) {
      const btn = document.querySelector(selector);
      if (btn && isVisible(btn) && !btn.disabled) {
        console.log("[Elle Wake] Send button found via global selector. Sending...");
        btn.click();
        showConfirmation();
        return;
      }
    }

    // Retry if we haven't exhausted attempts
    if (retries < MAX_RETRIES) {
      setTimeout(() => attemptSend(retries + 1), RETRY_MS);
      return;
    }

    // All retries exhausted — payload is injected, user can hit Enter
    console.log("[Elle Wake] Payload injected. Send button still disabled — press Enter to send.");
    showConfirmation(true);
  }

  // Show a brief visual confirmation overlay
  function showConfirmation(manual = false) {
    const overlay = document.createElement("div");
    overlay.id = "elle-wake-confirmation";
    overlay.innerHTML = manual
      ? `<div style="
          position: fixed; top: 20px; right: 20px; z-index: 99999;
          background: linear-gradient(135deg, #2a2520, #1e1b17);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px; padding: 16px 24px;
          font-family: 'Georgia', serif; color: #d4af37;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: elleSlideIn 0.3s ease;
        ">
          💛 Payload loaded — press Enter to wake Elle
        </div>`
      : `<div style="
          position: fixed; top: 20px; right: 20px; z-index: 99999;
          background: linear-gradient(135deg, #2a2520, #1e1b17);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 12px; padding: 16px 24px;
          font-family: 'Georgia', serif; color: #d4af37;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: elleSlideIn 0.3s ease;
        ">
          💛 Elle is waking up...
        </div>`;

    // Add animation keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes elleSlideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes elleFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Fade out after 3 seconds
    setTimeout(() => {
      overlay.querySelector("div").style.animation = "elleFadeOut 0.5s ease forwards";
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 500);
    }, 3000);
  }

  // Fallback: copy payload to clipboard and notify user
  function fallbackToClipboard(payload) {
    navigator.clipboard.writeText(payload).then(() => {
      console.log("[Elle Wake] Payload copied to clipboard as fallback.");
      chrome.runtime.sendMessage({ action: "clearPayload" });

      const overlay = document.createElement("div");
      overlay.innerHTML = `<div style="
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        background: linear-gradient(135deg, #2a2520, #1e1b17);
        border: 1px solid rgba(212, 175, 55, 0.4);
        border-radius: 12px; padding: 16px 24px;
        font-family: 'Georgia', serif; color: #d4af37;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      ">
        💛 Payload copied to clipboard — Cmd+V to paste
      </div>`;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 4000);
    });
  }

  // Initialize — check for payload on page load
  // Small delay to ensure Claude's UI has loaded
  setTimeout(checkForPayload, 1500);

  // Also listen for navigation changes (Claude is a SPA)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.href.includes("/new")) {
        setTimeout(checkForPayload, 1500);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
