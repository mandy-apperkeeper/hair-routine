# Hair Routine — Next Steps Plan

**Created:** May 10, 2026  
**Status:** Active  
**Context:** Spec is feature-complete. Research is done. v1 is live. This plan covers what remains to bring the app to its full potential.

---

## Session 7: Quick Wins + Foundation (est. 1 session)

These are small, independent items that clear debt and set up future work.

### 7A. Rewrite Requirement 8 (humidity philosophy)
- **What:** Change from "ask the user" to "inform, don't ask"
- **Why:** The app already auto-detects dew point. The spec still says "prompt for humidity level with three options" — that's stale.
- **New philosophy:** Dew point is fetched silently. The app informs ("High humidity today — Got2b recommended") rather than asking. Manual selector is fallback only (offline/API failure).
- **Touches:** `requirements.md` only (the code already does this)
- **Effort:** 15 minutes

### 7B. Create `.kiro/steering/session-context.md`
- **What:** Project steering file with implementation guardrails
- **Content:** Tech stack, key files, aesthetic (book-feel dark), established decisions (no rotation, amodimethicone every wash, dew point not RH, schema v2), anti-patterns from past sessions
- **Why:** Every new session currently has to re-discover project context from scratch
- **Effort:** 20 minutes

### 7C. Complete auto dew point (Item 1 finish)
- **What:** Remove the manual humidity prompt from the quick-log form when dew point was successfully detected
- **Current state:** Detects and stores dew point, but still shows the manual selector alongside it
- **Target:** Manual selector hidden when dew point is available; shown only on API failure
- **Touches:** `index.html` (quick-log form logic)
- **Effort:** 30 minutes

---

## Session 8: Compensation Logic (est. 1 session)

The highest-value feature that's fully ready to build.

### 8A. Define compensation data structure
- **What:** Encode the Phase 5 compensation table as a JS data structure in `index.html`
- **Content:** Product → function lost → compensating product → compensating step → gap status
- **Format:** Array of compensation rules, keyed by product ID

### 8B. Wire into recommendation card
- **What:** When a wash event is logged (or on landing screen load), check which products were used, look up compensation rules, generate contextual statement
- **Examples:**
  - "Using Dove today. L'Oréal 21-in-1 at step 5 compensates — no gap."
  - "No pre-shampoo today. Protein fill paused — acceptable for one wash."
  - "No gel yet — humidity barrier is an uncompensated gap."
- **Touches:** `index.html` (recommendation card rendering + compensation data)

### 8C. Persistent gel gap reminder
- **What:** Until NYM Curl Talk gel is purchased, show a subtle persistent note: "Your one uncompensated gap: humidity barrier (PQ-69 gel). ~$8 to complete the system."
- **Dismissable:** Yes, but resurfaces weekly
- **Touches:** `index.html` (landing screen)

**Effort total:** ~1 full session (data structure + rendering + edge cases)

---

## Session 9: Product Inventory Spec (est. 1 session)

### 9A. Write the spec
- **What:** Formal spec for product inventory management in the app
- **Scope:** Add/remove products, track "using-up" status, bottles remaining estimate, tier assignment (Primary/Supporting/Use-Up), routine context tags (every-wash, curly-only, blowout-only, weekly)
- **Data model:** Already designed in session 4, research validates it
- **Decision needed:** localStorage key — same as wash events or separate?

### 9B. Build it
- **What:** Product inventory UI in `index.html` with CRUD operations
- **Depends on:** Spec approval (9A)

---

## Session 10: v1 Service Worker + PWA (est. 1 session)

### 10A. Create `sw.js` for v1
- **What:** Cache-first service worker for `index.html`
- **Why:** v2 has `hair-sw.js` but v1 (the live app) has no offline support. Mandy uses this in the bathroom.
- **Scope:** Cache HTML + any external API responses (Open-Meteo), versioned cache, graceful update

### 10B. Add install prompt
- **What:** PWA manifest + "Add to Home Screen" support
- **Why:** Native-feeling app on iPad/iPhone without App Store

---

## Session 11: v1→v2 Convergence Planning (est. 1 session, mostly decisions)

### 11A. Audit v2 against v1
- **What:** Compare what v2 (`hair-routine-v2.html`) has vs what v1 (`index.html`) has. Identify gaps in both directions.
- **Key question:** Does v2 have the quick-log? Does it have the treatments model? Does it have dew point detection?

### 11B. Decide switchover strategy
- **Options:**
  - A) Port v1 features into v2, then swap (clean cut)
  - B) Port v2 features into v1 incrementally (evolutionary)
  - C) Merge into a single file taking best of both
- **Decision criteria:** Which path gets Mandy the best app fastest with least regression risk?

### 11C. Execute switchover (or plan it across sessions)

---

## Blocked / Future (needs event data)

These items activate automatically once Mandy has enough wash history:

| Item | Trigger | What it does |
|------|---------|--------------|
| "Why did that work?" card (Improvement #3) | 4-5 star rating + 10+ events | Shows what made a great wash day different |
| 18-MEA maintenance insight (Improvement #6) | 30+ events, stable ratings | Explains plateau = success, not diminishing returns |
| Feedback engine insights | 15+ rated events | Personalized interval recommendations |
| Threshold adjustment proposals | 5+ overrides with good ratings | Suggests relaxing cooldown periods |

These don't need sessions — they need Mandy to use the app for a few weeks.

---

## Not Planned (explicitly deprioritized)

- **Optional property tests from spec** — 14 tests marked `*`. Value is low given the app works correctly. Revisit if bugs emerge.
- **Integration test suite** — Same reasoning. Manual testing + real usage is the validation path.
- **OGX oils in product recommendations** — Research confirmed volatile silicones provide no lasting benefit. Don't recommend them.
- **Product rotation logic** — Research confirmed rotation is a myth. Never build this.

---

## How to Use This Plan

- Each session is independent — you can do them in any order (except 11 depends on having 8-10 done first)
- Sessions 7-8 are the highest leverage right now
- Start each session by reading `SESSION_HANDOFF.md` and this file
- After each session, update `SESSION_HANDOFF.md` with what was done
