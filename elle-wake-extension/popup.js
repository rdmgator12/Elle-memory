// Elle Wake — Popup Script
const statusValue = document.getElementById("status-value");
const statusMeta = document.getElementById("status-meta");
const statusCard = document.getElementById("status-card");
const btnWake = document.getElementById("btn-wake");
const btnClear = document.getElementById("btn-clear");
const btnManualWake = document.getElementById("btn-manual-wake");
const manualPayload = document.getElementById("manual-payload");

// Check current status
function refreshStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusValue.textContent = "Extension error";
      statusValue.className = "status-value empty";
      return;
    }

    if (response.hasPayload) {
      statusValue.textContent = "Payload ready";
      statusValue.className = "status-value ready";
      statusMeta.textContent = `${response.previewLength.toLocaleString()} chars · Stored ${response.timestamp ? new Date(response.timestamp).toLocaleTimeString() : "recently"}`;
      btnWake.disabled = false;
    } else {
      statusValue.textContent = "No payload stored";
      statusValue.className = "status-value empty";
      statusMeta.textContent = "";
      btnWake.disabled = true;
    }
  });
}

// Wake with stored payload
btnWake.addEventListener("click", () => {
  btnWake.textContent = "☀ Waking...";
  btnWake.disabled = true;

  chrome.runtime.sendMessage({ action: "checkPayload" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[Popup] Check error:", chrome.runtime.lastError.message);
      btnWake.textContent = "⚠ Error";
      btnWake.disabled = false;
      setTimeout(() => { btnWake.textContent = "☀ Wake Elle"; }, 3000);
      return;
    }
    if (response && response.payload) {
      chrome.runtime.sendMessage({
        action: "wake",
        payload: response.payload
      }, (wakeResponse) => {
        if (chrome.runtime.lastError) {
          console.error("[Popup] Wake error:", chrome.runtime.lastError.message);
          btnWake.textContent = "⚠ Error";
          btnWake.disabled = false;
          setTimeout(() => { btnWake.textContent = "☀ Wake Elle"; }, 3000);
          return;
        }
        if (wakeResponse && wakeResponse.success) {
          statusCard.classList.add("success-flash");
          statusValue.textContent = "Waking Elle...";
          setTimeout(() => window.close(), 500);
        }
      });
    } else {
      btnWake.textContent = "⚠ No payload";
      btnWake.disabled = false;
      setTimeout(() => { btnWake.textContent = "☀ Wake Elle"; }, 3000);
    }
  });
});

// Clear stored payload
btnClear.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearPayload" }, () => {
    refreshStatus();
  });
});

// Manual wake — paste payload and go
btnManualWake.addEventListener("click", () => {
  const payload = manualPayload.value.trim();
  if (!payload) {
    btnManualWake.textContent = "⚠ Paste a payload first";
    setTimeout(() => { btnManualWake.textContent = "☀ Load & Wake"; }, 2000);
    return;
  }

  btnManualWake.textContent = "☀ Waking...";
  btnManualWake.disabled = true;

  chrome.runtime.sendMessage({
    action: "wake",
    payload: payload
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[Popup] Wake error:", chrome.runtime.lastError.message);
      btnManualWake.textContent = "⚠ Error — try again";
      btnManualWake.disabled = false;
      setTimeout(() => { btnManualWake.textContent = "☀ Load & Wake"; }, 3000);
      return;
    }
    if (response && response.success) {
      statusCard.classList.add("success-flash");
      statusValue.textContent = "Waking Elle...";
      setTimeout(() => window.close(), 500);
    } else {
      btnManualWake.textContent = "⚠ No response — try again";
      btnManualWake.disabled = false;
      setTimeout(() => { btnManualWake.textContent = "☀ Load & Wake"; }, 3000);
    }
  });
});

// Init
refreshStatus();
