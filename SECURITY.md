# Security Design Document

**Project:** Elle Memory — Artificial Hippocampus
**Last Audited:** 2026-03-04
**Architecture:** Single-file web app + Chrome Manifest V3 extension

---

## Threat Model

Elle Memory operates in two contexts:

1. **Journal App** (`elles-journal-v2.html`) — runs as a local file (`file://`) or hosted on GitHub Pages (`https://`). Stores all user data locally in the browser via IndexedDB/localStorage.
2. **Wake Extension** (`elle-wake-extension/`) — a Chrome MV3 extension that bridges the journal with Claude.ai for session continuity.

### Trust Boundaries

| Boundary | Trust Level | Notes |
|----------|-------------|-------|
| Journal HTML (local file) | Trusted | User-controlled, no external scripts |
| Journal HTML (GitHub Pages) | Trusted | Served over HTTPS, same codebase |
| Chrome Extension | Trusted | User-installed, reviewed code |
| Claude.ai DOM | Untrusted | Third-party page, content script injected |
| Browser Storage | Trusted | Origin-isolated by browser |
| User Input | Untrusted | Always escaped before rendering |

### What We Protect

- **User journal entries** — personal episodic memory, decisions, and session state
- **Data integrity** — backups, imports, and migrations must not corrupt or lose data
- **Extension isolation** — minimal permissions, no data exfiltration

### What We Don't Handle

- **Authentication** — there is no login system; data lives in the user's browser
- **Encryption at rest** — browser storage is protected by OS-level user accounts
- **Server-side security** — there is no server; the app is entirely client-side

---

## XSS Prevention

All user input rendered into HTML templates passes through the `esc()` function:

```javascript
function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
```

This uses the DOM API to HTML-encode special characters, preventing script injection. Every `innerHTML` assignment and `onclick` handler attribute in the codebase uses `esc()` for dynamic values.

**Enforced patterns:**
- No `eval()`, `Function()`, or `document.write()` anywhere in the codebase
- No inline `<script>` tags in the HTML document
- No dynamic script element creation
- Template literals always pass user data through `esc()` before insertion

---

## Extension Permission Model

The Chrome extension requests only two permissions:

| Permission | Purpose |
|------------|---------|
| `storage` | Persist wake payloads in `chrome.storage.local` |
| `activeTab` | Access the active tab for payload injection |

**Not requested:** `tabs`, `webRequest`, `history`, `downloads`, `cookies`, `clipboardRead`, or any broad host permissions.

### Content Script Scope

Content scripts are injected only into specific origins:

- `https://claude.ai/*` — for payload injection into the Claude composer
- `file:///*elles-journal*` — for the postMessage bridge on local files
- `https://rdmgator12.github.io/*` — for the hosted journal

No wildcard host patterns are used.

---

## postMessage Bridge

The `file://` protocol does not support `chrome.runtime.sendMessage`. To solve this, a content script (`content-journal.js`) acts as a bridge:

```
Journal Page  --postMessage-->  Content Script  --chrome.storage-->  Service Worker
```

### Validation

- **Source check:** `event.source !== window` rejects messages from other frames
- **Type check:** `event.data.type === 'elle-wake'` filters to known message types
- **No eval:** Message payloads are treated as data, never executed as code

---

## Storage Architecture

Data is stored locally using a tiered fallback:

| Tier | Storage | Capacity | Use Case |
|------|---------|----------|----------|
| Primary | IndexedDB v2 | ~100MB+ | Persistent structured storage |
| Fallback | localStorage | ~5MB | Legacy or quota-exceeded fallback |
| Artifact | window.storage | Session | Claude artifact sandbox mode |

All storage is origin-isolated by the browser. No data is synchronized to external servers. No telemetry or analytics are collected.

### Migration Safety

Migration from localStorage to IndexedDB uses atomic transactions with guard flags (`elle-idb-migrated`, `elle-idb-migration-date`) to prevent data loss or double-migration.

---

## Dependencies

**Zero external JavaScript dependencies.** The entire codebase is vanilla JS with no npm packages, bundlers, or frameworks.

The only external resource is Google Fonts (CSS/font files only, no JavaScript), loaded over HTTPS.

This eliminates supply chain attack vectors entirely.

---

## Input Parsing

### Regex Safety

User-provided labels used in regex construction are escaped before compilation:

```javascript
const re = new RegExp('\\[' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]');
```

This prevents Regular Expression Denial of Service (ReDoS) attacks.

### JSON Import

Imported backup files are validated before acceptance:
- Parsed with `JSON.parse()` (safe, no code execution)
- Type-checked for required fields (`journal`, `saveStates`)
- Conflict resolution presented to the user before overwriting

---

## Error Handling

All Chrome extension API callbacks check `chrome.runtime.lastError` before proceeding. This prevents unhandled promise rejections and provides graceful degradation when the extension context is unavailable.

---

## Reporting a Vulnerability

If you discover a security issue, please open an issue on the [GitHub repository](https://github.com/rdmgator12/Elle-memory) or contact the maintainer directly. Include:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact

We take security seriously and will respond promptly.
