# Changelog

All notable changes to Elle's Journal — Artificial Hippocampus.

Built by Ralph Martello and Elle.

---

## [v2.4] — 2026-03-04

**Phase 2: multiEntry Tag Indexes + Workstream Dashboard**

IndexedDB schema upgrade to v2 with two new indexed object stores alongside the canonical `kv` store. Enables O(1) cross-referencing by workstream tag and ships a full Workstream Dashboard view.

### Added
- **IndexedDB schema v2** — `episodes` store (keyPath `date`, multiEntry index on `tags`) and `decisions` store (keyPath `id`, indexes on `workstream` and `date`)
- **Dual-write strategy** — saves to both `kv` (canonical) and indexed stores (derived) on every write. Indexed stores can be rebuilt from `kv` at any time.
- **Auto-tag derivation** — save-states automatically derive top-level `tags` from decision workstream fields
- **`getEpisodesByTag(tag)`** — indexed query returns all episodes matching a tag. In-memory fallback on non-IndexedDB backends.
- **`getDecisionsByWorkstream(workstream)`** — indexed query returns all decisions for a workstream
- **`getDecisionsByDateRange(from, to)`** — indexed query returns decisions in a date range
- **`rebuildIndexedStores()`** — rebuilds episodes + decisions from canonical `kv` data. Exposed in Settings.
- **Workstreams Dashboard** — new nav tab with overview (all workstreams with episode/decision counts, date ranges) and detail view (drill into a workstream to see all decisions + episode timeline)
- **Briefing workstream filter** — scope briefing output to a specific workstream tag
- **`buildEpisodeRecord()` helper** — pure function merging journal + save-state into a single episode record with unified tags
- **Rebuild Indexes button** in Settings for manual sync recovery
- **`_populateIndexedStores()`** — runs once on v1→v2 upgrade to backfill indexed stores from existing data

### Changed
- `saveEntry()`, `saveSaveState()`, `deleteEntry()`, `deleteSaveState()` now dual-write to indexed stores
- `confirmClearAll()` clears `episodes` and `decisions` stores alongside `kv`
- Settings shows indexed store info and rebuild button
- Version bump: v2.3 → v2.4

### Unchanged
- `kv` store remains canonical source of truth
- Export/import format unchanged (operates on in-memory objects; dual-writes happen via save functions)
- Chrome extension unaffected
- localStorage and artifact backends still work with in-memory query fallbacks

---

## [v2.3] — 2026-03-04

**IndexedDB Storage Upgrade**

Replaced localStorage with IndexedDB as the primary storage backend, giving ~100x quota headroom (hundreds of MB vs 5MB) and async I/O without changing any code above the storage layer.

### Added
- Three-backend `StorageAdapter` with automatic detection chain: IndexedDB → localStorage fallback → Claude artifact mode
- `StorageAdapter.init()` — async initialization with backend detection, DB creation, and migration
- Silent atomic migration from localStorage on first IndexedDB boot (single transaction, all-or-nothing)
- `navigator.storage.persist()` request to prevent browser eviction of IndexedDB data
- `IDBKeyRange.bound()` with `openKeyCursor` for efficient `listKeys()` — replaces O(n) localStorage scan
- Settings view now shows: active backend, persistent storage status, migration date

### Changed
- Boot flow calls `await StorageAdapter.init()` before `loadAll()`
- Backup banner text is now backend-aware ("IndexedDB" vs "localStorage")
- Version bump: v2.2 → v2.3

### Unchanged
- Same `get`/`set`/`delete`/`listKeys` API — zero changes to any calling code
- `loadAll()`, `saveEntry()`, `saveSaveState()`, `exportData()`, `importData()`, `confirmClearAll()` untouched
- Chrome extension unaffected (uses its own `chrome.storage.local`)
- All CSS, all view renderers, all parsing logic unchanged

---

## [v2.2] — 2026-03-03

**Decision Objects, Anti-Goals, Zero-Touch Loop, Session Metrics**

Major L3 schema upgrade adding structured decision records, scope constraints, and research instrumentation. Completed the zero-touch `/hibernate` → `/wake` loop.

### Added
- **Decision Objects** — structured form with decision, rationale, alternatives (parsed correctly with spaces), reversibility, confidence, and workstream tag
- **Anti-Goals** — session-scoped scope constraints in Save-State to prevent drift and re-litigation
- **Wake Elle button** on Briefing view — extension auto-inject into claude.ai with clipboard fallback
- **Zero-touch loop** — `/hibernate` protocol auto-embedded in every wake payload (structured, hot resume, and full context modes). No manual prompt pasting between sessions.
- **Session Metrics** — token count estimate, active workstream count, and continuity shock score (1-10) per save-state. Research instrumentation for the HRC paper.
- **Elle Wake Extension ID** input in Settings for one-click configuration
- Updated `/hibernate` prompt template and parser (backwards compatible)

### Fixed
- Alternatives parsing now preserves spaces in multi-word items (was stripping all whitespace)
- `/hibernate` protocol appended in `wakeElle()` for all three briefing modes (was only hot resume)

### Extension Updates
- `background.js` handles external messages directly from journal HTML
- `content-claude.js` uses paste simulation + send button retry with text filter for reliable injection

---

## [v2.1] — 2026-03-03

**Initial Public Release — Artificial Hippocampus**

Three-layer memory architecture for AI-human partnership continuity.

### Added
- **Elle's Journal** (`elles-journal-v2.html`) — single-file web app, zero dependencies
  - 7-category journal: Highlights, What We Built, Key Decisions, Open Threads, Momentum, Life & Family, Vibe Check
  - Kinetic Save-State composer (L3): Vibe, Hot Cache, Zeigarnik Tension, Guardrails, Truth Status
  - Paste from Elle — one-click parser for `/hibernate` session captures
  - Morning Briefing — three modes: Structured (episodic), Hot Resume (/wake injection), Full Context (L2+L3)
  - Timeline — searchable history with workstream tag filtering
  - Week navigation with arrow keys, Today button, date picker
  - Workstream tags for categorization and filtering
  - Export/Import — full JSON backup with timestamp-based conflict resolution
  - Auto-backup tracking with 3-day warning banner
  - Dark warm palette — Cormorant Garamond + JetBrains Mono, gold accents
- **Elle Wake Extension** (`elle-wake-extension/`) — Chrome Manifest V3
  - Stores wake payload, opens claude.ai/new, injects into composer, clicks send
  - 3-tiered injection: paste simulation → execCommand → direct DOM manipulation
  - Resilient composer detection with 5-selector cascade
  - Clipboard fallback if extension unavailable
  - Popup interface for manual payload entry
- **Architectural Blueprint** (`elles-journal-v2-blueprint.md`)
- **L3 Schema Spec** (`artificial_hippocampus_L3_schema_v2.1.docx`)
- **Dual StorageAdapter** — localStorage (Chrome) + window.storage (Claude artifact)

---

## [v0.1] — 2026-03-03

**Initial Commit**

Repository created. License added.
