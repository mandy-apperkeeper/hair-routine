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

## Session 10: Logging UX Overhaul ✅ (completed)

### 10A. Landing page: guide, don't choose ✅
- Single prominent recommended action + "Something else?" toggle
- First-use empty state

### 10B. Quick-log product selection ✅
- 7-group step-based product selection with sub-menus and heat cap badges
- Multi-select from inventory, feeds feedback engine

### 10C. Clarifying as wash subtype ✅
- Shampoo group has sub-menus: Regular / Clarifying

---

## Sessions 11–16: Product Intelligence + Step Reorganization + Research ✅

### What was done (Sessions 11–16):
- Product Intelligence spec scoped and partially implemented (phase-based quick-log, attribution card)
- Research briefs completed (3 briefs, 5 phases)
- Schema renamed phase→step, added subStep (v4→v5)
- Full step reorganization: replaced step+subStep with 10 granular step values (v6)
- Added 2 new products (Maui Moisture Curl Smoothie, L'Oréal Elvive Total Repair 5 Balm)
- Replaced 4-phase quick-log with 7-group system + sub-menus + heat cap badges
- Removed humidity manual prompt (silent default to moderate on failure)
- Compacted status tracker
- Researched and updated Pantene spray (genuine bond repair)
- Schema v7: inventory deduplication fix
- Updated lane detection (checks both styling and heat_protection)
- Added deep-condition treatment auto-detection in quick-log save
- Coconut oil pre-wash research (peer-reviewed: Rele & Mohile 2003, Ruetsch 2001, Lourenço 2024)
- OGX oils re-evaluation — reclassified as finishing products (dimethiconol delivery, not pre-wash)
- Added 4 new products (OGX Heat Spray, Monday Leave-In, OGX Serum, Pure Coconut Oil)
- Implemented `additionalSteps` field — products appear in multiple quick-log groups
- Schema v8: new products + additionalSteps + OGX oil reclassification
- **30 products total in inventory**

---

## Session 11: Service Worker + PWA (not yet started)

### 11A. Create `sw.js` for v1
- **What:** Cache-first service worker for `index.html`
- **Why:** The live app has no offline support. Mandy uses this in the bathroom.
- **Scope:** Cache HTML + any external API responses (Open-Meteo), versioned cache, graceful update

### 11B. Add install prompt
- **What:** PWA manifest + "Add to Home Screen" support
- **Why:** Native-feeling app on iPad/iPhone without App Store

---

## Next Major Phase: Daily Plan

**Spec:** `.kiro/specs/daily-plan/design.md` (complete)  
**Tasks:** Not yet written — this is the next planning step.

### What it is
The app opens and immediately shows today's hair plan — a complete, scrollable walkthrough generated from dew point, history, seal state, and timing. No lane selection required. User can follow as-is or tap "Adjust" to input observations for a refined plan.

### What it replaces
- The 3-button lane selection on landing
- The one-step-at-a-time walkthrough navigation (→ scrollable single-page)
- The humidity prompt (→ auto-detection + Adjust flow)

### Dependencies
- **Product Intelligence spec** (IngredientKB, BeliefTracker, RecommendationEngine) — the daily plan USES these for product ranking. Can be built in parallel or sequentially.
- **Step reorganization** — ✅ complete (schema v8, granular steps + additionalSteps)
- **New products** — ✅ complete (30 products in inventory)
- **Multi-step architecture** — ✅ resolved via `additionalSteps` field (schema v8)
- **Coconut oil research** — ✅ complete (confirmed cortex penetration, added as primary pre-wash product)
- **OGX oils re-evaluation** — ✅ complete (reclassified as finishing products, weak pre-wash)

### Open decisions (need Mandy input before tasks.md)
1. Should condensed view be default on repeat visits?
2. How to handle "no wash needed" days — minimal screen or refresh plan?
3. Timer UX in scrollable view — sticky bar or inline?
4. Animation when plan adjusts after observation input?

---

## Session 12: v1→v2 Convergence (SUPERSEDED)

The v1→v2 convergence question is now moot. v1 (`index.html`) is the live app and has evolved well past v2. The Daily Plan redesign will be built directly into v1. v2 (`hair-routine-v2.html`) is archived reference only.

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

## Planned: Per-Product Experience & Results Ratings

**Scope:** Small, self-contained. No spec needed. ~1 session.

### What
Two subjective ratings per product, accessible from the product inventory view:
- **Experience** — how much you enjoy using it (smell, texture, ease of application, sensory feel)
- **Results** — how well you think it works for your hair (your subjective sense, separate from wash-level rating)

Both use the existing 5-point emoji scale (😫 😕 😐 😊 🤩). Ratable anytime, updatable as opinions change. Optional notes field per product.

### Why
The app currently only has wash-level ratings (correlated to products via BeliefTracker). This adds the user's direct opinion of each product — a different and complementary signal. A product might correlate with good outcomes but feel terrible to use, or vice versa.

### How it influences the app
- Daily Plan product ranking factors in both objective correlation AND subjective preference
- Products rated low on experience get flagged: "effective but unpleasant — want to find an alternative?"
- Products rated high on experience but low on results get a gentle note: "this one's fun but may not be doing much"
- Products with no rating yet behave as today (no penalty, no boost)

### Implementation shape
- Two new fields on product data: `experienceRating: number|null`, `resultsRating: number|null`
- Optional `experienceNote: string|null` and `resultsNote: string|null`
- Schema migration (additive — new fields default to null)
- Inventory UI: tap a product → see/set both ratings + notes
- Wire into Daily Plan's `PlanGenerator.rankProducts()` as a ranking factor
- Wire into Product Intelligence's `RecommendationEngine` for the "effective but unpleasant" / "fun but ineffective" insights

### Dependencies
- None for the data model + inventory UI (can build standalone)
- Daily Plan integration: after Daily Plan task 1.3 is built
- Intelligence integration: after Product Intelligence task 8.1 is built

### When to build
- Anytime after the inventory UI exists (it does). Can be done before or after Daily Plan.
- Recommended: build the data model + inventory UI as a quick win, wire into ranking later.

---

## Not Planned (explicitly deprioritized)

- **Optional property tests from spec** — 14 tests marked `*`. Value is low given the app works correctly. Revisit if bugs emerge.
- **Integration test suite** — Same reasoning. Manual testing + real usage is the validation path.
- **Product rotation logic** — Research confirmed rotation is a myth. Never build this.

## Pending Research

- **Research documentation** — Write up coconut oil and OGX oil findings into `research/` folder (sources, methodology, conclusions). Not blocking anything, just good hygiene.

---

## How to Use This Plan

- Start each session by reading `SESSION_HANDOFF.md` and this file
- After each session, update `SESSION_HANDOFF.md` with what was done
- The Daily Plan is the next major feature — needs tasks.md written before implementation begins
- Service Worker (Session 11) can be done independently at any time
- Product Intelligence spec tasks feed into Daily Plan but can be built in parallel
