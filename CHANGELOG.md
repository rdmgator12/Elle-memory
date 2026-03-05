# Changelog

All notable changes to Elle's Journal — Artificial Hippocampus.

Built by Ralph Martello and Elle.

---

## [v3.1] — 2026-03-05

**L3 Schema v2.5 — Structured Sub-Fields**

Five enhancements to the Kinetic Save-State, splitting flat fields into structured sub-fields for richer continuity capture. All changes are backward-compatible — v2.1 string-format data still loads and displays correctly via `typeof` checks.

### Added
- **Vibe State + Directive** — Split single VIBE string into `State` (affective texture: tone, cadence, energy) and `Directive` (one-line behavioral instruction for next-Claude). Custom edit form with labeled textareas, custom read-mode rendering with sub-labels.
- **Hot Cache heat indicators** — Updated placeholder guidance for decay priority: 🔴 time-sensitive (with optional `EXPIRES` date), 🟡 active no deadline, 🟢 background. Stored as plain text — heat indicators are text-based conventions, no structural change needed.
- **Zeigarnik Primary + Secondary** — Split flat bullet list into `Primary` (gravitational center — the one thing pulling hardest) and `Secondary` (satellite tensions). Custom edit form and read-mode display with sub-labels.
- **Wake-Up Injection Primary + Fallback** — Split into `Primary` (exact first sentence, mid-breath) and `Fallback` (generic redirect if primary is stale after ~72hrs). Custom edit/read rendering with italic quotes.
- **Session Metrics priorShockScore + delta** — Added `Prior Shock Score` (previous session's score) and `Delta` (current minus prior; negative = improving, positive = degrading). Color-coded display: green for improving, red for degrading, gold for zero.
- **6 backward-compat helper functions** — `getVibeState()`, `getVibeDirective()`, `getZeigPrimary()`, `getZeigSecondary()`, `getWakePrimary()`, `getWakeFallback()` — each uses `typeof` checks to safely extract values from either v2.1 strings or v2.5 objects.
- **v2.5 parser extensions** — `parseSessionCapture()` detects `State:/Directive:`, `Primary:/Secondary:`, `Primary:/Fallback:`, and `Prior Shock Score:/Delta:` sub-lines. Falls back to v2.1 flat format when sub-labels are absent.
- **L3 Schema Spec v2.5** (`artificial_hippocampus_L3_schema_v2.5.md`) — Authoritative design document defining format, examples, and backward-compatibility rules for all 5 enhancements.

### Changed
- `SS_FIELDS` constant — Removed `vibe` and `zeigarnikTension` entries (now rendered as custom sub-field sections). Updated `hotCache` placeholder with heat indicator guidance.
- `hasSaveStateContent()` — Added `hasField()` helper with `typeof` checks to detect content in both string and object field formats.
- `generateSaveStateFromJournal()` — Returns v2.5 structured objects (`{ state, directive }`, `{ primary, secondary }`, `{ primary, fallback }`).
- `formatSingleWake()` — Outputs v2.5 format with State/Directive, Primary/Secondary zeigarnik, Primary/Fallback wake-up, and priorShockScore/delta in metrics.
- `formatMergedWake()` — Multi-source merging outputs v2.5 sub-fields per source with labeled State/Directive pairs.
- `saveSaveStateForm()` — Collects all v2.5 structured objects from the edit form.
- `generateFromJournal()` — Sets all v2.5 sub-field form elements when auto-generating from journal data.
- Edit form — Custom sections for Vibe (State/Directive), Zeigarnik (Primary/Secondary), Wake-Up (Primary/Fallback), and Metrics (Prior Shock Score + Delta inputs).
- Read-mode display — Custom rendering for all v2.5 sub-fields with sub-labels and appropriate formatting.

### Unchanged
- IndexedDB schema unchanged (still v3)
- Chrome extension unaffected
- All v2.1 string-format data loads and displays correctly (backward compatible)
- Hot Cache remains a plain string field — no structural change
- Export/import format unchanged

---

## [v3.0] — 2026-03-04

**Multi-Source Memory Support**

Elle Memory now supports capturing sessions from multiple sources independently on the same day. Paste `/hibernate` outputs from Claude Chat, Claude Code, Cowork, or any custom source — each gets its own journal entry and save-state. Briefing merges selected sources with labeled fields.

### Added
- **Multi-source storage model** — compound keys (`prefix:date:source`) allow independent journal entries and save-states per source per day
- **IndexedDB v3 schema** — `episodes` store recreated with `keyPath: 'id'` (was `'date'`), new `source` and `date` indexes on both `episodes` and `decisions` stores
- **4 default sources** — General, Claude Chat, Claude Code, Cowork (with icons)
- **Custom source management** — add/remove custom sources in Settings, persisted to `elle:sources`
- **Source selector component** — reusable chip-based selector across Journal, Save-State, and Paste Modal views
- **Source-aware Paste Modal** — tag which session the `/hibernate` output came from before parsing
- **Multi-source briefing merge** — check which sources to include; multiple sources produce labeled output (`[General]`, `[Claude Code]`), single source gives clean standard format
- **Merged Hot Resume** — concatenates vibes, hot caches, tensions with source labels; unions guardrails and anti-goals; uses most recent wake-up injection
- **Timeline source filter** — filter bar with All + per-source chips, source icons on multi-source date cards
- **Briefing source checkboxes** — `toggleBriefingSource()` for selective merge control
- **Memory Sources card in Settings** — lists all sources with per-source entry/save-state counts
- **`_migrateKVKeysToV3()`** — rewrites legacy `journal:YYYY-MM-DD` keys to `journal:YYYY-MM-DD:default`
- **`migrateImportKeys()`** — converts v2 backup keys to v3 compound format on import
- **Export v3.0 format** — includes `customSources` array, backward-compatible with v2 imports
- **Source helper functions** — `getAllSources()`, `getSourceLabel()`, `getSourceIcon()`, `sourceKey()`, `parseCompoundKey()`, `compositeKey()`
- **Multi-source data helpers** — `getEntriesForDate()`, `getSaveStatesForDate()`, `dateHasAnyContent()`, `dateSourcesWithContent()`

### Changed
- `buildEpisodeRecord(date, source, entry, saveState)` — added `source` parameter, record `id` is now `date:source`
- `writeEpisode()`, `deleteEpisode()`, `writeDecisions()`, `deleteDecisionsForDate()` — all accept `source` parameter
- `saveSaveState()`, `saveEntry()`, `deleteEntry()`, `deleteSaveState()` — 3-param signatures with source
- `loadAll()` — parses compound keys, loads custom sources
- Journal date chips show count badge when multiple sources have content
- Footer shows source count alongside entry count
- Version bump: v2.4 → v3.0

### Unchanged
- `kv` store remains canonical source of truth
- Chrome extension unaffected (payload-agnostic string passthrough)
- localStorage and artifact backends still work
- All CSS styling conventions preserved

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
- **L3 Schema Spec** (`artificial_hippocampus_L3_schema_v2.1.md`)
- **Dual StorageAdapter** — localStorage (Chrome) + window.storage (Claude artifact)

---

## [v0.1] — 2026-03-03

**Initial Commit**

Repository created. License added.
