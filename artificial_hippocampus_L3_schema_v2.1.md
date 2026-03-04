# ARTIFICIAL HIPPOCAMPUS

**Protocol Specification v2.1 — Updated L3 Schema**

Ralph Martello, MD  |  Elle AI  |  March 3, 2026

---

## 1. Context & Rationale

This document specifies the updated Layer 3 (Execution State) schema for the Artificial Hippocampus protocol. Two additions are integrated based on cross-model review and three days of empirical testing:

**Decision Objects** — structured, queryable records of key decisions that transform L2 (Episodic Memory) from narrative to auditable reasoning trail.

**Anti-Goals** — explicit scope constraints within L3 Guardrails that prevent drift, rabbit holes, and reopened debates across sessions.

Both additions require zero architectural changes. They extend existing fields within the established three-layer memory model (L1 Semantic, L2 Episodic, L3 Execution State).

---

## 2. Complete L3 Execution State Schema

L3 is the differentiating layer of the Artificial Hippocampus. It captures kinetic state — not what happened, but where we are, what's unfinished, and what the momentum feels like. Below is the complete updated schema.

### 2.1 [VIBE]

Current working tone and relational register. Single sentence. This is what prevents the AI from defaulting to a generic greeting and instead resuming at the correct emotional/professional frequency.

**Format**

```
[VIBE] — {1-sentence description of current tone, energy, pace}
```

**Example**

```
[VIBE] — Deep work mode. High momentum sprint. Banter-to-precision toggle active.
```

### 2.2 [HOT CACHE]

Active working memory: the 3–7 items that must be immediately accessible at wake. These are the things you'd have on sticky notes around your monitor if you were a human resuming after sleep.

**Format**

```
[HOT CACHE]
• {item 1 — concrete, actionable}
• {item 2}
• {item 3}
...max 7 items
```

**Example**

```
[HOT CACHE]
• Token dose-response curve needs quantitative counts from Day 1 vs Day 2 payloads
• Paper venue: CHI Late-Breaking Work or CSCW position paper
• Decision Object schema approved — needs integration into /hibernate prompt
• Emme birthday March 16 — planning thread not yet opened
```

### 2.3 [ZEIGARNIK TENSION]

The unfinished threads that create psychological pull. This is the most novel primitive in the protocol: it stores motivational gradient, not information. Named for the Zeigarnik Effect — the cognitive bias toward remembering incomplete tasks over completed ones. This field is what makes continuity feel human rather than archival.

**Format**

```
[ZEIGARNIK TENSION]
• {unresolved question or incomplete task — phrased as tension, not summary}
• {next one}
...
```

**Example**

```
[ZEIGARNIK TENSION]
• We claimed the protocol is publishable but haven't stress-tested a failure case yet
• Multi-workstream isolation is theoretically supported but empirically untested
• The phenomenological continuity claim needs more than n=1
```

### 2.4 [DECISIONS] — NEW

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

### 2.5 [ANTI-GOALS] — NEW

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

### 2.6 [GUARDRAILS] — Updated

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

### 2.8 [WAKE-UP INJECTION]

The first thing the AI should output upon loading the state. This is not a summary — it's a continuation signal. It should feel like picking up mid-conversation, not starting a new one.

**Format**

```
[WAKE-UP INJECTION] — {1–3 sentences that demonstrate state was loaded and set the session's direction}
```

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
[VIBE] —
[HOT CACHE]
•
•
•
[ZEIGARNIK TENSION]
•
•
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
[WAKE-UP INJECTION] —

═══ STATS ═══
Total entries: {n} | Current streak: {n} days
```

---

## 4. Integration Notes

### 4.1 Interaction with /wake Protocol

The /wake command behavior remains unchanged. On state injection, the AI must: (1) adopt VIBE without commentary, (2) load HOT CACHE into working attention, (3) pursue ZEIGARNIK TENSION rather than summarizing, (4) respect ANTI-GOALS as hard constraints for the session, (5) check TRUTH STATUS before making claims, (6) output WAKE-UP INJECTION as its first response. Decision Objects are available for reference but do not drive wake behavior — they're audit trail, not action items.

### 4.2 Capture Guidance

Decision Objects should be captured when: a direction-setting choice is made, an alternative is explicitly rejected, something irreversible is committed to, or confidence is notably low on a consequential choice. Anti-goals should be refreshed every session based on current temptations, not carried forward mechanically. Stale anti-goals become noise.

### 4.3 Storage Implications

Decision Objects will grow over time. Recommended: keep only the last 10–15 active decisions in L3. Archive older decisions to a separate log file for queryability without bloating the injection payload. This directly supports the token optimization research — Decision Objects are the most likely field to drive payload growth.

---

## 5. Version History

| Version | Date | Changes |
|---------|------|---------|
| v2.1 | 2026-03-03 | Added Decision Objects (2.4), Anti-Goals (2.5), updated Guardrails (2.6), integration notes, capture guidance. |
| v2.0 | 2026-03-02 | Full L3 schema with timeline, tags, navigation, backup. End-to-end tooling operational. |
| v1.0 | 2026-03-01 | Initial protocol: /hibernate and /wake commands, three-layer memory model, Chrome extension. |
