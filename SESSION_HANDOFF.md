# Hair Routine — Session Log

Each session entry ends with a state snapshot. Start new sessions by reading the last entry's snapshot.

---

## Session 9: Product Inventory (May 10, 2026) — complete

### Work Done
- Schema v3 migration seeds 24 products from consultation
- InventoryManager module with full CRUD
- Inventory view grouped by tier and routine context
- Gel gap now checks inventory + "Add to inventory" button

### State at End of Session 9

**What's live:** Quick-log, walkthrough, history, status bar, dew point detection, recommendations, compensation card, product inventory.

**What's next:** Logging UX overhaul (landing page feels "choice rather than guide," quick-log needs product selection, clarifying should be wash subtype).

---

## Session 10: Logging UX Overhaul (May 10, 2026) — partially complete

### Work Done
- Landing page redesigned: single recommended action, "Something else?" toggle for alternatives
- Quick-log rebuilt with multi-select activities + inline product selection per activity
- "Log a wash day" button added to History page
- Clarify auto-detected from product selection

### Problem Identified
The product categorization in the quick-log is wrong. Products are mis-assigned to activities because the mapping was guessed instead of properly derived from the Abbey Yung method steps. The ACTIVITY_PRODUCTS mapping needs a complete redo.

Why it's wrong:
1. The Abbey Yung method has 8-11 steps — the logging should reflect that
2. Products can belong to multiple steps (OGX oils = pre-wash oil OR finishing)
3. The Glossing Lamination Mask is NOT a clarifying shampoo — it's its own "glossing" step
4. Heat protection and leave-in are separate steps
5. The goal is gathering data for correlations, not minimizing taps

### Draft: Research-Backed 11-Step Mapping (needs Mandy's confirmation)

1. **Pre-wash oil** — OGX Coconut Oil, OGX Argan Oil
2. **Pre-shampoo treatment** — Olaplex 3, Garnier Hair Filler Pre-Shampoo, OGX Bond Protein Pre-Shampoo, L'Oreal Bond Repair Pre-Shampoo
3. **Shampoo** — EverPure Bond Repair, Dove Bond Strength, Dove Intensive Repair
4. **Clarify** — EverPure Clarifying Shampoo only
5. **Conditioner** — Garnier Color Repair, EverPure Bond Repair Cond, Dove Bond Strength Cond, Dove Intensive Repair Cond
6. **Glossing/Rinse** — Wonder Water, Glossing Lamination Mask, Elvive 5-Minute Gloss Mask
7. **Deep condition** — Dove Bond Strength Mask
8. **Leave-in** — L'Oreal 21-in-1 Spray, Pantene Bond Spray
9. **Heat protection** — Marc Anthony Grow Long Shield
10. **Styling** — NYM Curl Talk Gel, Got2b Gel
11. **Finishing** — Garnier Filler Serum, Dove 10-in-1 Serum, OGX Coconut Oil, OGX Argan Oil

**Multi-category products:** OGX oils (Pre-wash + Finishing), Garnier Filler Serum (Leave-in + Finishing), Dove 10-in-1 Serum (Leave-in + Finishing)

### Open Design Question
How to present 11 steps without being tedious:
- Show all 11 but pre-select the "usual" ones based on last wash (tap to deselect what you skipped)
- Collapse into phases (Pre-wash | Wash | Post-wash | Style) with products under each
- Progressive: show the steps you typically do, "Add step" for unusual ones

### State at End of Session 10

**What's live (GitHub Pages):** https://mandy-apperkeeper.github.io/hair-routine/
- Landing: single recommended action + "Something else?" toggle
- Quick-log: multi-select activities with inline products (CATEGORIZATION IS WRONG)
- Product inventory: 24 products, tier management, CRUD
- Compensation card + gel gap with inventory integration

**What's broken:**
- ACTIVITY_PRODUCTS mapping is incorrect — products in wrong categories
- Need to implement the 11-step Abbey Yung mapping properly
- Need to decide on UX pattern for presenting many steps without tedium

**Decisions made this session:**
- Product inventory stored as full list in localStorage (not sparse overlay)
- Landing page guides with single recommendation, alternatives hidden behind toggle
- Quick-log uses multi-select activities with inline product selection
- Clarify auto-detected from product selection (no separate toggle)
- Products CAN appear in multiple activity categories
- Abbey Yung 11-step method is the reference model for logging (not a simplified 4-category version)
- The goal of logging is data gathering for correlations, not minimal taps

**All active decisions (cumulative):**
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category.
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema version 3: WashEvent includes treatments, dewPoint. State includes inventory.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.

**Repo:** main branch, origin/main in sync.

**What's next:**
1. Session 11: Fix quick-log product mapping — implement corrected step mapping, decide UX pattern, get Mandy's confirmation
2. Session 12: Service worker + PWA — offline support for bathroom use
3. Session 13: v1-v2 convergence — audit and merge

---

## Session 12: Product Intelligence — Research & First Implementation (May 10, 2026) — complete

### Work Done

**Research (autonomous deep-dive, all 3 briefs from RESEARCH_BRIEFS.md):**
- Brief 1: Client-Side Product Discovery → Embedded ingredient knowledge base + structured form recommended. Chrome Prompt API blocked by Safari/iPad. Client-side ML not viable.
- Brief 2: Recommendation Patterns for Small Datasets → Three-tier hybrid: domain rules (day 0) → Bayesian updating (3+ events) → pattern detection (10+ events). N-of-1 trial methodology, not collaborative filtering.
- Brief 3: Outcome Attribution → Mechanism-informed decomposition, not statistical attribution. Natural variation analysis at 5+ events. Guided experimentation at 30+.

**Implementation:**
- Added post-wash attribution card (passive intelligence layer 1). After logging a wash day, shows what the routine targeted (Shine, Definition, Strength, etc.) with contributing products and interaction notes. Auto-dismisses after 10s.
- Confirmed the ACTIVITY_PRODUCTS mapping issue from Session 10 was already fixed — products have `intelligence.phase` metadata and quick-log uses phase-based grouping.

### State at End of Session 12

**What's live (GitHub Pages):** https://mandy-apperkeeper.github.io/hair-routine/
- Landing: single recommended action + "Something else?" toggle
- Quick-log: phase-based product selection (Pre-wash | Wash | Post-wash | Style) — WORKING CORRECTLY
- **NEW:** Post-wash attribution card after logging (mechanism-based "what your routine targeted today")
- Product inventory: 24 products with full intelligence metadata (mechanisms, outcomes, interactions, phase)
- Compensation card + gel gap with inventory integration

**What's working that wasn't before:**
- Quick-log product categorization is correct (phase-based from intelligence metadata)
- Post-wash feedback explains what the routine did mechanistically

**Research files added:**
- `research/BRIEF1_CLIENT_SIDE_DISCOVERY.md` — scored 100%
- `research/BRIEF2_RECOMMENDATION_PATTERNS.md` — scored 100%
- `research/BRIEF3_OUTCOME_ATTRIBUTION.md` — scored 100%
- `research/RESEARCH_SCORES.md` — local tracking

**Decisions made this session:**
- Research confirms this is an N-of-1 personal science problem, not a recommender system problem
- Three-tier hybrid architecture for recommendations (rules → Bayesian → patterns)
- Mechanism-based attribution is the Day 1 approach (no data needed)
- Confidence thresholds: 3/5/10/15/30 events for progressively richer insights
- Embedded ingredient KB (~50-80KB JSON) is the right approach for product discovery (Phase 5)
- Chrome Prompt API is a future progressive enhancement only (Safari/iPad gap)
- Thompson Sampling is wrong for passive observation but right for future active experimentation guidance

**All active decisions (cumulative):**
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category.
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema version 3→4: Products have intelligence metadata (mechanisms, outcomes, interactions, phase).
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.
- Abbey Yung 11-step method is the reference model for logging.
- The goal of logging is data gathering for correlations, not minimal taps.
- Products CAN appear in multiple activity categories.
- Phase-based UI grouping for quick-log (Pre-wash | Wash | Post-wash | Style).
- Product intelligence is a system redesign, not a quick mapping fix.
- Offline-first with online product discovery for new additions.
- Both passive and active intelligence surfacing.

**Repo:** main branch, origin/main in sync.

**What's next:**
1. Session 13: Pre-wash recommendation on landing page (Tier 1 active intelligence — uses dew point + domain rules to suggest what to do today)
2. Session 14: Bayesian updating engine (Tier 2 — starts tracking per-product beliefs after 3+ events, surfaces "early signal" insights)
3. Session 15: Natural variation analysis (Brief 3 Layer 2 — compare days with/without a product after 5+ events)
4. Later: Product discovery form (Brief 1 — structured input + embedded KB), service worker/PWA

---

## Session 11: Product Intelligence System — Scoping (May 10, 2026) — no code, design only

### Work Done
No code written. Session spent scoping a major new feature: a **Product Intelligence System** that gives the app deep understanding of what each product does, how products interact, and how they contribute to outcomes.

**Problem reframed:** The quick-log categorization issue from Session 10 isn't just a mapping fix — the app fundamentally doesn't understand product roles. It treats products as interchangeable items in generic buckets rather than understanding mechanisms, interactions, and outcome contributions. This limits the correlation engine's ability to explain *why* a wash day went well or poorly.

### Vision Agreed

1. **Offline core (localStorage):** Full product intelligence for current inventory — each product has mechanism, interactions, step placement, outcome contributions. Correlation engine uses this to reason about outcomes. Quick-log groups by mechanism-based phases.

2. **Online discovery:** A way to evaluate new products, understand how they fit the routine, check for conflicts, and add them to inventory with full intelligence metadata. Once added, works offline.

3. **Intelligence surfaces both passively and actively:**
   - Passive: smarter correlations, better "why did today work?" explanations after logging
   - Active: recommendations before a wash day ("based on dew point and last wash, consider adding X because Y")

4. **UX for quick-log:** Phase-based grouping (Pre-wash | Wash | Post-wash | Style) chosen over "show all 11" or "progressive reveal."

### Open Questions for Next Session (spec drafting)
1. **Online product discovery mechanism:** AI-assisted (needs backend/API — breaks current architecture) vs structured form (pure client-side, more user effort) vs hybrid?
2. **Product data model specifics:** What fields exactly? How granular are mechanisms? (e.g., "seals cuticle" vs "deposits aminosilicone film on cuticle surface via electrostatic attraction")
3. **Interaction rules:** Hardcoded knowledge graph? Or derivable from mechanism tags? (e.g., "anything that coats the shaft blocks anything that needs to penetrate")
4. **Recommendation confidence:** How much data before the app recommends actively? Same thresholds as current feedback engine (5+ events)?
5. **Migration path:** How does this integrate with existing inventory (24 products in schema v3)? Additive metadata or restructure?

### State at End of Session 11

**What's live (GitHub Pages):** https://mandy-apperkeeper.github.io/hair-routine/
- Landing: single recommended action + "Something else?" toggle
- Quick-log: multi-select activities with inline products (CATEGORIZATION STILL WRONG — not fixed this session)
- Product inventory: 24 products, tier management, CRUD
- Compensation card + gel gap with inventory integration

**What's broken:**
- ACTIVITY_PRODUCTS mapping is incorrect — will be fixed as part of Product Intelligence System, not standalone

**Decisions made this session:**
- Product intelligence is a full system redesign, not a quick mapping fix
- Each product needs: mechanism (what it physically does), cumulative vs single-use, interactions (enables/blocks), outcome contribution (shine, definition, volume, strength, smoothness)
- Offline-first with online product discovery for new additions
- Both passive (post-wash analysis) and active (pre-wash recommendations) intelligence surfacing
- Phase-based UI grouping for quick-log (Pre-wash | Wash | Post-wash | Style)
- This warrants a formal spec before implementation begins

**All active decisions (cumulative):**
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category.
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema version 3: WashEvent includes treatments, dewPoint. State includes inventory.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.
- Abbey Yung 11-step method is the reference model for logging.
- The goal of logging is data gathering for correlations, not minimal taps.
- Products CAN appear in multiple activity categories.
- Phase-based UI grouping for quick-log (Pre-wash | Wash | Post-wash | Style).

**Repo:** main branch, origin/main in sync.

**What's next:**
1. Session 12: Draft Product Intelligence System spec — answer open questions, then formal spec with requirements and tasks
2. After spec: Implement in phases — data model → logging UI → passive intelligence → active recommendations → online discovery
3. Service worker + PWA — deferred until after product intelligence lands
