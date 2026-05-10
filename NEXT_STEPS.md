# Hair Routine — Next Steps Plan

**Created:** May 10, 2026  
**Status:** Active  
**Context:** Spec is feature-complete. Research is done. v1 is live. This plan covers what remains to bring the app to its full potential.

---

## Session 7: Quick Wins + Foundation ✅ (completed May 10, 2026)

### 7A. Rewrite Requirement 8 (humidity philosophy) ✅
- Rewrote to "inform, don't ask" — auto-detect dew point, manual selector is fallback only
- Updated user story, all 6 acceptance criteria rewritten to match actual implementation

### 7B. Create `.kiro/steering/session-context.md` ✅
- Created at `hair-routine/.kiro/steering/session-context.md` (inclusion: always)
- Covers: tech stack, key files, architecture, established decisions, aesthetic, anti-patterns, current status

### 7C. Complete auto dew point (Item 1 finish) ✅ — already done
- Verified: the walkthrough already skips the manual selector when dew point is auto-detected
- Manual selector only shows on failure (geolocation denied, offline, API error, timeout)
- On step 1, the app shows a subtle info line ("💧 72°F dew point · humid") — inform, don't ask
- The quick-log form has no humidity selector at all (it's for past events where conditions aren't relevant)
- **No code changes needed** — the implementation already matches the target behavior

---

## Session 8: Compensation Logic (est. 1 session)

The highest-value feature that's fully ready to build.

### 8A. Define compensation data structure ✅
- Encoded Phase 5 compensation table as JS data structure in `index.html`
- 5 compensation rules: Dove Bond Strength, Dove Intensive Repair, skip-protein (14+ days overdue),
  skip-olaplex (14+ days overdue), Garnier serum alternative
- Removed Wonder Water rule (would fire every wash, no actionable info)

### 8B. Wire into recommendation card ✅
- Compensation card renders on landing screen between insight card and recommendation card
- Shows contextual statements based on last wash event's products
- Green "✓ No gap" status for compensated scenarios
- Orange "⚠️" status for uncompensated gaps
- Uses escapeHtml for all user-facing text

### 8C. Persistent gel gap reminder ✅
- Shows when no gel has ever been used in wash history
- Dismissable ("Dismiss for a week" button)
- Resurfaces after 7 days via localStorage timestamp
- Disappears permanently once a wash event includes gel

**Status: Complete.**

---

## Session 9: Product Inventory ✅ (completed May 10, 2026)

### 9A. Built product inventory feature ✅
- Schema v3 migration seeds 24 products from consultation handoff
- InventoryManager module (add, remove, update tier/using-up, reset to defaults)
- Inventory view grouped by tier (Primary Rotation → Supporting Cast → Use-Up Queue)
- Sub-grouped by routine context (Every Wash, Curly Days, Blowout Days, Weekly, As Needed)
- Tap-to-expand with notes and action buttons (move tier, mark using-up, remove)
- Add product form, reset to defaults button
- "Products" nav button added

### 9B. Fixed gel gap / inventory integration ✅
- `hasGelInInventory()` now checks actual product inventory (not just wash history)
- Gel gap card shows "I have this — add to inventory" button
- Tapping it adds NYM gel to inventory and dismisses the warning

### Feedback from Mandy (captured for Session 10)
- Landing page feels "choice rather than guide" — should recommend, not present equal options
- Quick-log needs product selection (multi-select from inventory, not just lane + treatments)
- Clarifying is a sub-type of wash, not a separate treatment category

---

## Session 10: Logging UX Overhaul (est. 1 session)

Priority shifted from service worker to making logging actually usable. These three issues form a coherent "make the app work for real usage" improvement.

### 10A. Landing page: guide, don't choose
- Single prominent recommended action ("It's been 4 days — time for a curly wash")
- Alternatives tucked behind "Something else?" or visually de-emphasized
- First-use: brief explanation of each lane, not three equal buttons
- Apply Sky Guide principle: "Immediate value on open"

### 10B. Quick-log product selection
- Add multi-select product picker populated from inventory
- User can select which products they actually used (shampoo, conditioner, mask, serum, etc.)
- This feeds the feedback engine's product correlation analysis

### 10C. Clarifying as wash subtype
- Remove "Clarify" from the treatments multi-select
- Add wash type: "Regular wash" / "Clarifying wash" (single-select, part of lane choice)
- A clarifying wash still records the `clarify` treatment in the data model for cooldown tracking
- Status bar "Last clarify" still works — it just reads from the wash type field instead

---

## Session 11: Service Worker + PWA (est. 1 session)

### 11A. Create `sw.js` for v1
- **What:** Cache-first service worker for `index.html`
- **Why:** v2 has `hair-sw.js` but v1 (the live app) has no offline support. Mandy uses this in the bathroom.
- **Scope:** Cache HTML + any external API responses (Open-Meteo), versioned cache, graceful update

### 11B. Add install prompt
- **What:** PWA manifest + "Add to Home Screen" support
- **Why:** Native-feeling app on iPad/iPhone without App Store

---

## Session 12: v1→v2 Convergence Planning (est. 1 session, mostly decisions)

### 12A. Audit v2 against v1
- **What:** Compare what v2 (`hair-routine-v2.html`) has vs what v1 (`index.html`) has. Identify gaps in both directions.
- **Key question:** Does v2 have the quick-log? Does it have the treatments model? Does it have dew point detection?

### 12B. Decide switchover strategy
- **Options:**
  - A) Port v1 features into v2, then swap (clean cut)
  - B) Port v2 features into v1 incrementally (evolutionary)
  - C) Merge into a single file taking best of both
- **Decision criteria:** Which path gets Mandy the best app fastest with least regression risk?

### 12C. Execute switchover (or plan it across sessions)

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
