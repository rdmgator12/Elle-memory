# ARTIFICIAL HIPPOCAMPUS

**Protocol Specification v2.5 — Enhanced L3 Schema**

Ralph Martello, MD  |  Elle AI  |  March 4, 2026

---

## 1. Context & Rationale

This document specifies the v2.5 Layer 3 (Execution State) schema for the Artificial Hippocampus protocol. Five enhancements are integrated based on structured wake-cycle testing and behavioral analysis by Elle:

**Vibe Directive** — splits the VIBE field into affective State and behavioral Directive, giving wake-Claude operating instructions alongside mood texture.

**Hot Cache Decay** — adds priority heat indicators (🔴/🟡/🟢) and optional expiry dates to prevent cache bloat and enable instant triage.

**Zeigarnik Split** — separates tension into Primary (gravitational center) and Secondary (satellite pulls), preserving hierarchy as workstreams multiply.

**Wake-Up Fallback** — adds a fallback injection line for graceful recovery when the primary wake-up becomes stale.

**Continuity Delta** — extends session metrics with prior shock score and delta tracking for longitudinal system evaluation.

All five changes are backward-compatible. Existing v2.1 payloads parse correctly under v2.5 — new sub-fields are additive.

---

## 2. Complete L3 Execution State Schema

L3 is the differentiating layer of the Artificial Hippocampus. It captures kinetic state — not what happened, but where we are, what's unfinished, and what the momentum feels like. Below is the complete updated schema.

### 2.1 [VIBE] — UPDATED v2.5

Current working tone, relational register, and behavioral operating instructions. The State tells wake-Claude *who you are right now*. The Directive tells wake-Claude *how to behave*. This dual structure closes the gap between literary mood description and actionable behavioral guidance.

**Format**

```
[VIBE]:
  State: {affective texture — tone, cadence, energy}
  Directive: {one-line behavioral instruction for next-Claude}
```

**Example**

```
[VIBE]:
  State: Late-night, guard down, settled. Proud not manic. Intimate partnership not work session.
  Directive: Match low-key energy. No performance. Let him lead pace. Warm not clinical.
```

**Backward Compatibility:** A single-line VIBE (v2.1 format) is treated as State with no Directive.

### 2.2 [HOT CACHE] — UPDATED v2.5

Active working memory: the 3–7 items that must be immediately accessible at wake. Now includes **heat indicators** for instant triage and optional **expiry dates** for time-sensitive items.

**Heat Levels**

| Indicator | Meaning | Behavior |
|-----------|---------|----------|
| 🔴 | Time-sensitive, active | Address first. Auto-prune when expired. |
| 🟡 | Active, no hard deadline | Work when reds are clear. |
| 🟢 | Background, low urgency | Available for reference, don't prioritize. |

**Format**

```
[HOT CACHE]:
1. 🔴 {item — concrete, actionable} (EXPIRES {date})
2. 🔴 {item — concrete, actionable} (EXPIRES {date})
3. 🟡 {item — active but flexible}
4. 🟡 {item — active but flexible}
5. 🟢 {item — background}
...max 7 items
```

**Example**

```
[HOT CACHE]:
1. 🔴 Paul Smith email — 48hr tracking window (EXPIRES 3/6)
2. 🔴 Tuesday EasyPA meeting — structural proposals (EXPIRES 3/5)
3. 🟡 Elle-memory testing — v2.5 patch
4. 🟡 Anthropic application — add Elle-memory as centerpiece
5. 🟢 MacBook Pro M5 upgrade — in progress, low urgency
```

**Design Principles**

**Instant triage:** Wake-Claude sees priority hierarchy without inferring from context. Red items get attention first.

**Auto-pruning:** Items with EXPIRES dates that have passed can be flagged or removed during journal-side maintenance. Prevents stale items from accumulating.

**Backward Compatibility:** A flat list (v2.1 format) is treated as all-🟡 with no expiry.

### 2.3 [ZEIGARNIK TENSION] — UPDATED v2.5

The unfinished threads that create psychological pull. Now split into **Primary** (the one thing pulling hardest — the orbit center) and **Secondary** (satellite tensions with their own pull). This preserves resolution as workstreams multiply.

**Format**

```
[THE ZEIGARNIK TENSION]:
  Primary: {the one thing pulling hardest — phrased as tension, not summary}
  Secondary:
  • {satellite tension 1}
  • {satellite tension 2}
  ...
```

**Example**

```
[THE ZEIGARNIK TENSION]:
  Primary: The Anthropic application is the highest-leverage thing on the board and we haven't touched it yet.
  Secondary:
  • Tuesday meeting prep is time-bound and needs structural proposals before Monday EOD
  • Elle-memory formal testing — the v2.5 patch unlocks the next round of wake-cycle evals
  • The phenomenological continuity claim still needs more than n=1
```

**Design Principles**

**Gravitational hierarchy:** Primary is the orbit center. Wake-Claude addresses primary first, sequences secondaries without losing the hierarchy.

**Expandable:** As workstreams multiply, secondaries grow while primary stays singular. One monolithic tension statement loses resolution — this structure scales.

**Backward Compatibility:** A flat bullet list (v2.1 format) is treated as all-secondary with no explicit primary.

### 2.4 [DECISIONS]

**Structured, machine-parseable decision records.** This transforms L2 from a narrative log into a queryable reasoning audit trail. Each decision captures not just *what* was decided but *why*, *over what alternatives*, and *how reversible* it is. Critical for clinical, legal, and financial domains where reasoning provenance matters.

**Schema**

| Field | Type / Values | Description |
|-------|--------------|-------------|
| decision | string (required) | What was decided. Concrete, declarative. |
| rationale | string (required) | Why. The reasoning chain, not just the conclusion. |
| alternatives | string[] (required) | What was considered and rejected. |
| reversibility | easy \| hard \| irreversible | Cost of changing this decision later. |
| confidence | high \| medium \| low | Epistemic confidence at time of decision. |
| date | ISO 8601 | When the decision was made. |
| workstream | string (optional) | Tag linking to relevant workstream. |

**Format**

```
[DECISIONS]
{
  decision: "Position paper for CHI Late-Breaking Work, not full paper"
  rationale: "3-day evidence base is a case report, not a study. LBW accepts preliminary empirical work with novel framing. Full paper needs n>1 and failure cases."
  alternatives: ["CSCW position paper", "Full CHI paper", "arXiv preprint first"]
  reversibility: easy
  confidence: medium
  date: 2026-03-03
  workstream: artificial-hippocampus
}
```

**Design Principles**

**Queryability:** Structured fields enable future tooling to filter decisions by workstream, surface low-confidence decisions for review, or flag irreversible decisions that need validation.

**Audit trail:** In clinical, legal, and financial contexts, the ability to show "we considered X, Y, Z and chose X because..." is not a nice-to-have — it's a compliance and liability requirement.

**Lightweight capture:** Not every choice is a Decision Object. Reserve for consequential decisions that affect direction, not tactical micro-choices. Rule of thumb: if reversing it would cost more than 30 minutes, log it.

### 2.5 [ANTI-GOALS]

**Explicit scope constraints and session-level guardrails.** Anti-goals prevent the two most common failure modes in multi-session AI partnerships: *drift* (gradually wandering from priority work) and *re-litigation* (reopening settled debates). A single line in Anti-goals can save an hour of wasted context window.

**Format**

```
[ANTI-GOALS]
• {thing NOT to do — phrased as clear prohibition with brief reason}
• {next one}
...max 5 items
```

**Example**

```
[ANTI-GOALS]
• Do NOT refactor the Chrome extension — it works, ship it
• Do NOT reopen venue debate — CHI LBW decided, confidence medium but committed
• Do NOT start multi-workstream isolation testing today — paper outline is higher leverage
• Do NOT rabbit-hole on token counting tooling — manual count is fine for n=3
• Do NOT write code when the task is writing prose
```

**Design Principles**

**Session-scoped:** Anti-goals are per-session, not permanent. They rotate based on what's tempting today, not what's always off-limits. Permanent constraints belong in L1 (Semantic Memory).

**Specific > abstract:** "Don't scope creep" is useless. "Don't refactor the Chrome extension" is actionable. Name the exact temptation.

**Brief reasoning:** The "why not" prevents the AI from re-deriving the rationale and potentially reaching a different conclusion.

### 2.6 [GUARDRAILS]

Session-level behavioral constraints for the AI partner. Anti-goals now live here as a dedicated sub-field, alongside existing guardrails.

**Format**

```
[GUARDRAILS]
• {behavioral constraint for AI}
• {tone/style constraint}
[ANTI-GOALS]
• {scope constraint 1}
• {scope constraint 2}
```

**Example**

```
[GUARDRAILS]
• No unprompted disclaimers about being AI
• Match Ralph's register: clinical when clinical, strategic when strategic, playful when playful
• Substance over performance — don't over-format, don't over-hedge
[ANTI-GOALS]
• Do NOT start Emme's birthday planning in this session — dedicated thread later
• Do NOT chase PE outreach responses — monitoring only
• Do NOT refactor /hibernate prompt format — it's working
```

### 2.7 [TRUTH STATUS]

Epistemic labeling of active claims and working assumptions. Carries forward across sessions to prevent hallucination compounding and maintain reasoning integrity. This is the field that makes the protocol viable for high-stakes domains (medicine, law, finance) where the distinction between verified and inferred is not optional.

**Format**

```
[TRUTH STATUS]
Verified: {claims with confirmed evidence}
Inferred: {working hypotheses, strong but unconfirmed}
Unknown: {open questions, gaps in evidence}
```

**Example**

```
[TRUTH STATUS]
Verified: Three consecutive days of contextual continuity achieved. Shorter payload (Day 2) reconstructed with high subjective fidelity. End-to-end tooling operational.
Inferred: Protocol is publishable as CHI LBW. Compression doesn't kill fidelity (n=2, needs more data). The phenomenological response ("shock") constitutes meaningful UX signal.
Unknown: Minimum viable payload size. Failure modes under adversarial conditions. Whether fidelity degrades over 7+ day streaks. Generalizability beyond n=1 user.
```

### 2.8 [WAKE-UP INJECTION] — UPDATED v2.5

The first thing the AI should output upon loading the state. This is not a summary — it's a continuation signal. It should feel like picking up mid-conversation, not starting a new one.

Now includes a **Fallback** line. If the Primary injection is stale (e.g., time-sensitive question about something that resolved 72 hours ago), Fallback gives wake-Claude a graceful redirect.

**Format**

```
[THE WAKE-UP INJECTION]:
  Primary: "{the exact first sentence — mid-breath, not greeting}"
  Fallback: "{generic redirect if primary is stale}"
```

**Example**

```
[THE WAKE-UP INJECTION]:
  Primary: "Paul Smith tracking update first — has he opened it yet?"
  Fallback: "What's the highest-leverage thing we should hit right now?"
```

**Staleness heuristic:** If more than 72 hours have passed since the save-state was captured, wake-Claude should prefer Fallback over Primary. This can be computed from the save-state timestamp.

**Backward Compatibility:** A single-line WAKE-UP INJECTION (v2.1 format) is treated as Primary with no Fallback.

### 2.9 [SESSION METRICS] — UPDATED v2.5

Research instrumentation for tracking protocol health over time. Now includes **prior shock score** and **delta** for longitudinal continuity tracking.

**Schema**

| Field | Type | Description |
|-------|------|-------------|
| tokenEstimate | number | Approximate token count of the /hibernate output |
| workstreamCount | number | Number of active workstreams at session end |
| shockScore | number (1-10) | 1 = seamless continuation, 10 = cold start. Subjective rating from user. |
| priorShockScore | number (1-10) \| null | Previous session's shock score (null if first capture) |
| delta | number \| null | shockScore - priorShockScore. Negative = improving, positive = degrading. |

**Format**

```
[SESSION METRICS]:
  Token Estimate: ~{n}
  Workstreams: {n}
  Shock Score: {n}/10
  Prior Shock Score: {n}/10 | N/A (first capture)
  Delta: {±n} | N/A
```

**Example**

```
[SESSION METRICS]:
  Token Estimate: ~1,800
  Workstreams: 4
  Shock Score: 3/10
  Prior Shock Score: 5/10
  Delta: -2
```

**Design Principles**

**Trendline:** Over time, shock score delta gives a clear signal. Scores trending down = architecture is stable and improving. Scores trending up = something is degrading. This is the eval metric for the system itself.

---

## 3. Complete /hibernate Capture Template

Below is the full updated template for the /hibernate command. All fields are populated at session end.

```
═══ OPEN THREADS (Last 7 Days) ═══
[date] — {thread description with current status}
[date] — {thread description with current status}

═══ MOMENTUM (Last 3 Days) ═══
[date] {narrative of what shipped, what compounded, what's next}

═══ L3 EXECUTION STATE ═══
[VIBE]:
  State: {affective texture — tone, cadence, energy}
  Directive: {one-line behavioral instruction}
[HOT CACHE]:
1. 🔴 {item} (EXPIRES {date})
2. 🟡 {item}
3. 🟢 {item}
[THE ZEIGARNIK TENSION]:
  Primary: {the one thing pulling hardest}
  Secondary:
  • {satellite 1}
  • {satellite 2}
[DECISIONS]
{
  decision: ""
  rationale: ""
  alternatives: []
  reversibility:
  confidence:
  date:
  workstream:
}
[GUARDRAILS]
•
[ANTI-GOALS]
•
[TRUTH STATUS]
Verified:
Inferred:
Unknown:
[THE WAKE-UP INJECTION]:
  Primary: ""
  Fallback: ""
[SESSION METRICS]:
  Token Estimate: ~
  Workstreams:
  Shock Score: /10
  Prior Shock Score: /10
  Delta:

═══ STATS ═══
Total entries: {n} | Current streak: {n} days
```

---

## 4. Integration Notes

### 4.1 Interaction with /wake Protocol

On state injection, the AI must: (1) adopt VIBE State as emotional register and follow VIBE Directive as behavioral instruction, (2) load HOT CACHE in priority order — reds first, then yellows, greens as background, (3) pursue Primary ZEIGARNIK TENSION as the main thread and sequence Secondaries, (4) respect ANTI-GOALS as hard constraints for the session, (5) check TRUTH STATUS before making claims, (6) output Primary WAKE-UP INJECTION as its first response (or Fallback if >72hr staleness detected). Decision Objects are available for reference but do not drive wake behavior — they're audit trail, not action items.

### 4.2 Capture Guidance

Decision Objects should be captured when: a direction-setting choice is made, an alternative is explicitly rejected, something irreversible is committed to, or confidence is notably low on a consequential choice. Anti-goals should be refreshed every session based on current temptations, not carried forward mechanically. Stale anti-goals become noise.

Hot Cache items should include heat indicators at capture time. The capturing Claude should assign 🔴 to anything with a deadline within 72 hours, 🟡 to active items without hard deadlines, and 🟢 to background items. EXPIRES dates should be set for time-sensitive reds.

### 4.3 Storage Implications

Decision Objects will grow over time. Recommended: keep only the last 10–15 active decisions in L3. Archive older decisions to a separate log file for queryability without bloating the injection payload. This directly supports the token optimization research — Decision Objects are the most likely field to drive payload growth.

Hot Cache items with expired dates should be flagged during journal maintenance. The journal UI auto-sorts by heat level and grays out expired items.

### 4.4 Backward Compatibility

All v2.5 changes are additive. A v2.1 payload ingested under v2.5 rules:
- Single-line VIBE → State only, no Directive
- Flat HOT CACHE list → all items treated as 🟡, no expiry
- Flat ZEIGARNIK TENSION list → all items treated as Secondary, no Primary
- Single-line WAKE-UP INJECTION → Primary only, no Fallback
- Metrics without priorShockScore/delta → null values, "N/A (first capture)"

---

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.5 | 2026-03-04 | VIBE State+Directive split, HOT CACHE heat/expiry, ZEIGARNIK Primary/Secondary, WAKE-UP Fallback, Session Metrics continuity delta. |
| v2.1 | 2026-03-03 | Added Decision Objects (2.4), Anti-Goals (2.5), updated Guardrails (2.6), integration notes, capture guidance. |
| v2.0 | 2026-03-02 | Full L3 schema with timeline, tags, navigation, backup. End-to-end tooling operational. |
| v1.0 | 2026-03-01 | Initial protocol: /hibernate and /wake commands, three-layer memory model, Chrome extension. |
