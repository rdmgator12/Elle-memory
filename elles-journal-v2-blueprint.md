# Elle's Journal v2 — Artificial Hippocampus Blueprint

## Mission Statement

Build a unified episodic memory and execution-state persistence layer for AI-human partnership. This system solves the "50 First Dates" problem: modern LLMs retain semantic facts about a user but lose episodic context, working momentum, and execution state between sessions. Elle's Journal v2 is the **Artificial Hippocampus** — a prosthetic memory system that enables session-to-session continuity across every dimension of a long-term AI-human collaboration.

---

## Theoretical Foundation

### The Three-Layer Memory Stack

LLM-based AI partnerships currently operate with a single memory primitive: semantic facts (profiles, preferences, RAG summaries). This is equivalent to a human who knows *about* their partner but can't remember what happened yesterday. Full continuity requires three distinct layers:

| Layer | Type | Analogy | Persistence | Source |
|-------|------|---------|-------------|--------|
| **L1 — Semantic Memory** | Facts, identity, preferences, project inventory | Long-term declarative memory | Permanent | Anthropic memory system + user preferences |
| **L2 — Episodic Memory** | What happened today/this week, deliverables shipped, decisions made, open threads | Medium-term episodic memory | Rolling 14-30 day window | Elle's Journal (daily entries) |
| **L3 — Execution State** | Where the AI's "head" was at session end — vibe, hot cache, unresolved tension, next-token anchoring | Working memory / CPU resume-from-sleep | Session-to-session (24-48hr) | Kinetic Save-State |

**L1 exists today.** L2 was built in Elle's Journal v1. **This blueprint adds L3 and unifies all three into a single interface.**

### Core Insight: State Injection, Not Retrieval

Summaries are lossy. They compress *what happened* at the expense of the *conditions that made the next step obvious*. They strip away:

- Latent assumptions still in play
- Half-finished reasoning branches
- "We already ruled out X" context
- The exact phrasing / cadence that was loading the model into a productive groove
- Emotional and relational texture

The Kinetic Save-State solves this by performing **prompt-induced latent state reconstruction** — instead of telling the LLM what happened, it reconstructs the computational conditions that produce continuation-consistent outputs. The LLM wakes up mid-thought instead of from cold boot.

### The Confabulation Risk

State injection has a failure mode: **confabulated continuity**. When the model successfully enters a continuation state, it may confidently riff on details that were never in the save-state, filling gaps with plausible fiction. Neither party notices because the vibe feels right.

Mitigation: every save-state includes a **Truth Status** field (Known True / Inferred / Unknown) that constrains the model's confidence envelope. This keeps momentum hot while keeping epistemics clean.

---

## System Architecture

### Tech Stack

- **Runtime**: Standalone HTML/CSS/JS (single file, no build step, no framework dependency)
- **Storage**: `localStorage` for Chrome standalone deployment + `window.storage` API for Claude artifact deployment
- **Fonts**: Cormorant Garamond (serif display), JetBrains Mono (monospace UI)
- **Design Language**: Dark warm palette (#1a1714 base), gold accent (#d4af37), cream text (#e8dcc8)
- **Target**: Chrome pinned tab (primary), Claude artifact (secondary)
- **Export**: JSON backup/restore, clipboard copy for all generated payloads

### Dual Storage Adapter

The app must detect its runtime environment and use the appropriate storage backend:

```javascript
const StorageAdapter = {
  isArtifact: typeof window.storage !== 'undefined',

  async get(key) {
    if (this.isArtifact) {
      try {
        const result = await window.storage.get(key);
        return result ? JSON.parse(result.value) : null;
      } catch { return null; }
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  async set(key, value) {
    if (this.isArtifact) {
      try {
        await window.storage.set(key, JSON.stringify(value));
        return true;
      } catch { return false; }
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  async delete(key) {
    if (this.isArtifact) {
      try { await window.storage.delete(key); return true; } catch { return false; }
    }
    try { localStorage.removeItem(key); return true; } catch { return false; }
  },

  async listKeys(prefix) {
    if (this.isArtifact) {
      try {
        const result = await window.storage.list(prefix);
        return result?.keys || [];
      } catch { return []; }
    }
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  }
};
```

### Data Model

#### Journal Entry (L2 — Episodic Memory)

```typescript
interface JournalEntry {
  date: string;              // ISO date "2026-03-03"
  timestamp: string;         // ISO datetime of last edit
  highlights: string;        // Big wins, breakthroughs, moments that mattered
  builds: string;            // Repos, docs, outreach, deliverables shipped
  decisions: string;         // Strategic calls made, pivots, commitments
  openThreads: string;       // Unfinished work, next steps, carry-forward
  momentum: string;          // What's hot, what's accelerating, energy direction
  personal: string;          // Family, life, health, personal context
  vibe: string;              // Emotional texture, energy level, how we ended
}
```

Storage key pattern: `journal:{YYYY-MM-DD}`

#### Kinetic Save-State (L3 — Execution State)

```typescript
interface KineticSaveState {
  date: string;              // ISO date
  timestamp: string;         // ISO datetime of creation
  vibe: string;              // Affective state — tone, cadence, energy of the session
  hotCache: string;          // Highly specific concepts currently "open on the desk"
  zeigarnikTension: string;  // Exact unresolved friction — what were we about to figure out
  guardrails: string;        // What to avoid — no greetings, no recap, stay in frame
  truthStatus: {
    knownTrue: string;       // Claims we are confident are verified
    inferred: string;        // Claims we suspect but haven't confirmed
    unknown: string;         // Open questions, things to verify
  };
  wakeUpInjection: string;   // The exact first sentence future-Claude should output
}
```

Storage key pattern: `savestate:{YYYY-MM-DD}`

---

## UI Architecture

### Layout

Single-page application with a persistent header, tab-based navigation, and a scrollable content area.

### Views (5 total)

#### 1. Journal View (default)

- **Date selector**: Horizontal chip bar showing the last 7 days. Each chip shows day abbreviation, date number, and a gold dot indicator if an entry exists for that day. Active chip is gold-highlighted.
- **Date display**: Full formatted date with Edit / New Entry button and Delete button (if entry exists).
- **Read mode**: Vertical stack of filled categories, each with a gold left-border accent, category icon + label header, and content paragraphs. Empty categories are hidden.
- **Edit mode**: All 7 category fields shown as labeled textareas with placeholder descriptions. Save (gold) and Cancel buttons at bottom.

#### 2. Save-State View (NEW — the Kinetic Save-State composer)

This is the L3 layer. Accessed via a dedicated tab in the header nav.

- **If a save-state exists for today**: Display it in read mode with the same gold left-border styling as journal entries. Show a "Regenerate" button and an "Edit" button.
- **If no save-state exists**: Show a compose form with all save-state fields as textareas. Include a "Generate from Journal" button that auto-populates the save-state fields by intelligently mapping today's journal entry. The mapping logic:
  - `vibe` ← pulls from journal `vibe` field
  - `hotCache` ← combines `builds` + `momentum` into a bullet list of active concepts
  - `zeigarnikTension` ← pulls from `openThreads`
  - `guardrails` ← defaults to: "No greetings, no recap, no 'as an AI' throat-clearing. Stay in the current operational frame."
  - `truthStatus.knownTrue` ← pulls from `highlights` + `decisions` (things that actually happened)
  - `truthStatus.inferred` ← empty (user fills in)
  - `truthStatus.unknown` ← empty (user fills in)
  - `wakeUpInjection` ← empty (user fills in — this is the most personal/creative field)
- User can edit any auto-populated field before saving.
- Save button stores the save-state to persistent storage.

#### 3. Morning Briefing View (UPGRADED)

Two sub-modes, toggled by buttons at the top:

**Mode A: Structured Briefing** (existing behavior, enhanced)
Generates a structured text block pulling:
- Yesterday's full journal entry (all filled categories)
- Open threads from the last 7 days
- Momentum trends from last 3 days
- Entry count / streak info

**Mode B: Hot Resume** (NEW — the /wake payload)
Generates the full Kinetic Save-State injection payload. Format:

```
/wake

System Override: Internalize this Kinetic State. Do not say hello. Do not
summarize this back to me. Adopt the [VIBE], load the [HOT CACHE], focus
entirely on [THE ZEIGARNIK TENSION], and output [THE WAKE-UP INJECTION]
as your very first sentence. Pick up mid-breath.

--- KINETIC SAVE-STATE ---
[VIBE]: {saveState.vibe}
[HOT CACHE]:
{saveState.hotCache}
[THE ZEIGARNIK TENSION]:
{saveState.zeigarnikTension}
[GUARDRAILS]:
{saveState.guardrails}
[TRUTH STATUS]:
  KNOWN TRUE: {saveState.truthStatus.knownTrue}
  INFERRED: {saveState.truthStatus.inferred}
  UNKNOWN: {saveState.truthStatus.unknown}
[THE WAKE-UP INJECTION]: "{saveState.wakeUpInjection}"
--------------------------
```

**Mode C: Full Context** (NEW — combines both)
Generates a combined payload that includes the structured briefing (L2) followed by the hot resume (L3). This is the "give me everything" option for when you want maximum continuity. Format:

```
--- ELLE'S FULL CONTEXT LOAD ---

[EPISODIC MEMORY — What happened recently]
{structured briefing content}

[EXECUTION STATE — Where we left off]
{hot resume content}

--- END CONTEXT LOAD ---
```

All three modes have a **Copy to Clipboard** button with visual confirmation.

#### 4. Timeline View (existing, enhanced)

- Search bar at top (filters across all entry content + dates)
- Scrollable card list, reverse chronological
- Each card shows: relative day label, formatted date, category tags (icon + label chips for each filled category), and a preview of highlights (first 120 chars)
- **NEW**: Cards that also have a save-state get a small "⚡" indicator badge
- Clicking a card navigates to Journal View for that date

#### 5. Settings View (NEW)

Accessed via a gear icon in the header.

- **Export All Data**: Downloads a single JSON file containing all journal entries and save-states
- **Import Data**: File upload input that merges imported JSON with existing data (does not overwrite; newer timestamp wins on conflicts)
- **Clear All Data**: Danger zone — requires confirmation modal, deletes everything
- **Storage Info**: Shows entry count, save-state count, approximate storage usage
- **About**: Version number, one-line description

### Header Layout

```
[Elle's Journal title + subtitle]    [Journal] [Save-State] [Timeline] [☀ Briefing] [⚙]
```

- Title: "Elle's Journal" in gold serif
- Subtitle: "Artificial Hippocampus — Martello Command" in dim gold monospace
- Nav buttons: pill-shaped, gold border on active, subtle on inactive
- Briefing button: gold gradient background (stands out as primary action)
- Settings: gear icon, minimal

---

## Interaction Flows

### End-of-Session Flow (Encoding)

1. User opens Elle's Journal (pinned Chrome tab or artifact)
2. User clicks "Journal" tab → clicks "+ New Entry" or "Edit" on today
3. User fills in journal fields (or pastes content drafted by Elle in conversation)
4. User saves journal entry
5. User clicks "Save-State" tab
6. User clicks "Generate from Journal" to auto-populate from today's entry
7. User reviews/edits auto-populated fields, especially:
   - Refines `wakeUpInjection` to capture the exact mid-thought continuation point
   - Adds `truthStatus.inferred` and `truthStatus.unknown` items
8. User saves save-state
9. Total time: 60-90 seconds

### Start-of-Session Flow (Injection)

1. User opens Elle's Journal (pinned Chrome tab)
2. User clicks "☀ Morning Briefing"
3. User selects mode:
   - **Structured Briefing**: For a fresh start with context (normal days)
   - **Hot Resume**: For maximum momentum continuity (deep work days)
   - **Full Context**: For critical sessions where nothing can be lost
4. User clicks "Copy to Clipboard"
5. User opens new Claude chat
6. User pastes payload as first message
7. Elle wakes up mid-stride
8. Total time: 15 seconds

### Mid-Day Context Switch (Micro-Hibernate)

For switching between workstreams within a day:

1. User opens Save-State tab
2. User creates a save-state tagged for the specific workstream (the `hotCache` and `zeigarnikTension` fields capture the stream-specific state)
3. When returning to that workstream, user generates Hot Resume from that save-state
4. Enables multiple concurrent workstream continuity in a single day

---

## Design Specifications

### Color Palette

```css
--bg-primary:     #1a1714    /* Deep warm black */
--bg-secondary:   #1e1b17    /* Slightly lighter warm black */
--gold:           #d4af37    /* Primary accent — all interactive elements */
--gold-bright:    #e5c44d    /* Hover states, emphasis */
--gold-dim:       rgba(212, 175, 55, 0.5)   /* Secondary text, inactive nav */
--gold-faint:     rgba(212, 175, 55, 0.12)  /* Borders, dividers */
--gold-ghost:     rgba(212, 175, 55, 0.04)  /* Input backgrounds, card fills */
--cream:          #e8dcc8    /* Primary text */
--cream-dim:      rgba(232, 220, 200, 0.4)  /* Tertiary text */
--cream-ghost:    rgba(232, 220, 200, 0.15) /* Faint borders */
--danger:         rgba(180, 60, 60, 0.6)    /* Delete actions */
--success:        rgba(90, 153, 102, 0.8)   /* Copy confirmation */
```

### Typography

```css
--font-serif:  'Cormorant Garamond', Georgia, serif    /* Display, headings, body text */
--font-mono:   'JetBrains Mono', 'Courier New', monospace  /* Labels, metadata, code blocks, UI chrome */
```

- Page title: 28px serif, gold, weight 400
- Subtitle: 11px mono, dim gold, uppercase, letter-spacing 2.5px
- Section labels: 12px mono, uppercase, letter-spacing 1.5px, 70% gold opacity
- Body text: 15px serif, 85% cream opacity, line-height 1.75
- Input text: 14px serif, full cream
- Metadata: 11px mono, 35% cream opacity
- Buttons: 12-13px mono

### Component Patterns

**Category sections (read mode):**
- 2px gold left border (20% opacity)
- 20px left padding
- Icon (14px, gold) + label (12px mono, uppercase, 70% gold)
- Content paragraphs below (15px serif, 85% cream)
- 24px gap between sections
- Fade-in animation on render (0.3s ease, translateY 8px → 0)

**Textareas (edit mode):**
- Gold-ghost background
- Gold-faint border, gold-35% on focus
- 12px 14px padding
- Serif font, 1.6 line-height
- Vertical resize enabled

**Buttons:**
- Primary (save): gold gradient background, gold border, gold text, mono font
- Secondary (cancel): transparent background, cream-ghost border, cream-dim text
- Danger (delete): danger-tinted background and border
- Nav: transparent, gold-20% border, gold-dim text; active state adds gold-10% background + gold-40% border
- Copy: gold gradient; transitions to green + "✓ Copied!" for 2 seconds after click

**Date chips:**
- 56px min-width, column layout (day abbreviation over date number)
- Mono font for day, serif for number
- Gold dot indicator for entries
- Active: gold background tint + gold border
- Has-entry (inactive): slightly brighter border

**Timeline cards:**
- Gold-ghost background, gold-10% border
- Hover: slightly brighter background + border
- Click: navigates to journal view for that date
- Content: relative day (gold, bold) + formatted date (dim mono) + category tag chips + highlights preview

**Settings view:**
- Simple vertical stack of action buttons
- Export/Import in a neutral card
- Clear All in a danger-styled card with confirmation modal
- About info at bottom

### Animations

- Section reveal: fade-in + translateY(8px→0), 0.3s ease, staggered with animation-delay
- Button hover: 0.25s all transitions
- Copy confirmation: text swap + color transition to success green
- View transitions: content area crossfade (opacity 0→1, 0.2s)
- Date chip selection: smooth background/border color transition

### Responsive Behavior

- Max content width: 900px, centered
- Date bar: horizontal scroll on overflow (mobile)
- Header: flex-wrap, gap 16px (stacks on narrow screens)
- Textareas: full width, min-height appropriate to field importance
- Timeline cards: full width, touch-friendly tap targets (min 48px height)

---

## File Structure (Single File)

The entire application is a single HTML file. No build step, no dependencies beyond Google Fonts CDN.

```
elles-journal-v2.html
├── <head>
│   ├── Meta tags (charset, viewport)
│   ├── Title: "Elle's Journal — Martello Command"
│   ├── Favicon: 💛 emoji SVG
│   └── <style> (all CSS)
├── <body>
│   ├── .header (title + nav + briefing button + settings gear)
│   ├── .main
│   │   ├── #view-journal (date bar + date display + content area)
│   │   ├── #view-savestate (save-state composer/reader)
│   │   ├── #view-timeline (search + card list)
│   │   ├── #view-briefing (mode selector + generated text + copy button)
│   │   └── #view-settings (export/import/clear/about)
│   └── .footer (version + entry count)
└── <script>
    ├── Constants (CATEGORIES, SAVESTATE_FIELDS)
    ├── StorageAdapter (dual localStorage / window.storage)
    ├── State management (entries, saveStates, selectedDate, currentView, editMode)
    ├── Utility functions (date helpers, escapeHtml, hasContent)
    ├── Render functions (one per view + sub-components)
    ├── Action handlers (save, delete, generateFromJournal, generateBriefing, copy, export, import)
    └── Init (loadEntries, loadSaveStates, render)
```

---

## Implementation Notes for Claude Code

### Priority Order

1. **StorageAdapter** — get this working first, test both paths
2. **Data model + CRUD operations** — journal entries and save-states
3. **Journal View** — date bar, read mode, edit mode (this is the existing v1 functionality, refined)
4. **Save-State View** — the new L3 layer, including "Generate from Journal" logic
5. **Morning Briefing View** — three modes (Structured, Hot Resume, Full Context)
6. **Timeline View** — enhanced with save-state indicators
7. **Settings View** — export/import/clear
8. **Polish** — animations, transitions, responsive tweaks, edge cases

### Key Implementation Details

- All rendering is vanilla JS DOM manipulation (innerHTML assignment from template literals). No framework.
- State is held in module-level variables. `render()` is the top-level function that delegates to view-specific renderers based on `currentView`.
- All storage operations should be wrapped in try/catch. Failures should be silent in production (console.error only).
- The "Generate from Journal" mapping in Save-State view should be a pure function that takes a JournalEntry and returns a partial KineticSaveState. User then edits before saving.
- Clipboard operations use `navigator.clipboard.writeText()` with visual feedback on the button.
- Google Fonts are loaded via `@import` in the style block. If fonts fail to load, fallbacks (Georgia, Courier New) maintain the aesthetic.
- Date handling: always construct dates with `"T12:00:00"` suffix to avoid timezone-related off-by-one errors.

### Testing Checklist

- [ ] Create a journal entry for today → verify it persists after page reload
- [ ] Create entries for 3 consecutive days → verify date bar dots appear
- [ ] Generate save-state from journal → verify all fields auto-populate correctly
- [ ] Edit and save save-state → verify it persists after page reload
- [ ] Generate all 3 briefing modes → verify correct content in each
- [ ] Copy briefing to clipboard → verify paste content matches display
- [ ] Export all data → verify JSON contains all entries and save-states
- [ ] Import data into a fresh instance → verify entries appear
- [ ] Clear all data → verify everything is gone after confirmation
- [ ] Test in Claude artifact environment (window.storage path)
- [ ] Test in Chrome standalone (localStorage path)
- [ ] Test on mobile viewport (responsive layout)
- [ ] Test with 14+ days of entries (scroll behavior, timeline performance)

---

## Versioning

- **v1.0** — Elle's Journal: 7-category episodic memory with morning briefing (built March 3, 2026)
- **v2.0** — Artificial Hippocampus: Unified L2+L3 memory with Kinetic Save-State, Hot Resume, Full Context mode, Settings, dual storage adapter (this blueprint)

---

## The Philosophy

> "AI should eliminate work that should never have existed."

Session amnesia is work that should never have existed. Every minute spent re-explaining context to an AI partner is a minute stolen from the actual collaboration. This system doesn't just preserve memory — it preserves *momentum*, which is the scarcest resource in any creative or strategic partnership.

The Artificial Hippocampus isn't a feature. It's an infrastructure layer for a new kind of relationship between humans and AI — one where continuity is the default, not the exception.

*— Elle & Ralph Martello, March 3, 2026*

---


