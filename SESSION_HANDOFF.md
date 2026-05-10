# Hair Routine — Session Handoff (May 10, 2026, Session 11)

## What Happened

### Session 11: Product Intelligence System — Scoping

No code was written this session. The session was spent scoping a major new feature: a **Product Intelligence System** that gives the app deep understanding of what each product does, how products interact, and how they contribute to outcomes.

**Problem identified:** The quick-log product categorization from Session 10 was wrong because the app treats products as interchangeable items in generic buckets. It doesn't understand mechanisms, interactions, or outcome contributions. This limits the correlation engine's ability to explain *why* a wash day went well or poorly.

**Vision agreed:**

1. **Offline core (localStorage):** Full product intelligence for current inventory — each product has mechanism, interactions, step placement, outcome contributions. Correlation engine uses this to reason about outcomes. Quick-log groups by mechanism-based phases.

2. **Online discovery:** A way to evaluate new products, understand how they fit the routine, check for conflicts, and add them to inventory with full intelligence metadata. Once added, works offline.

3. **Intelligence surfaces both passively and actively:**
   - Passive: smarter correlations, better "why did today work?" explanations after logging
   - Active: recommendations before a wash day ("based on dew point and last wash, consider adding X because Y")

### Design Decisions Made
- Product intelligence = full system, not just a mapping fix
- Each product needs: mechanism (what it physically does), cumulative vs single-use, interactions (enables/blocks), outcome contribution (shine, definition, volume, strength, smoothness)
- Offline-first with online product discovery for new additions
- Both passive (post-wash analysis) and active (pre-wash recommendations) intelligence surfacing
- The 11-step Abbey Yung mapping is still the reference for logging steps, but products are grouped by mechanism-based phases in the UI

### Open Questions for Next Session (spec drafting)
1. **Online product discovery mechanism:** AI-assisted (needs backend/API — breaks current architecture) vs structured form (pure client-side, more user effort) vs hybrid? This is the biggest architectural decision.
2. **Product data model specifics:** What fields exactly? How granular are mechanisms? (e.g., "seals cuticle" vs "deposits aminosilicone film on cuticle surface via electrostatic attraction")
3. **Interaction rules:** Hardcoded knowledge graph? Or derivable from mechanism tags? (e.g., "anything that coats the shaft blocks anything that needs to penetrate")
4. **Recommendation confidence:** How much data before the app recommends actively? Same thresholds as current feedback engine (5+ events)?
5. **Migration path:** How does this integrate with existing inventory (24 products in schema v3)? Additive metadata or restructure?

## Current State

### What's Live (GitHub Pages)
- Landing: single recommended action + "Something else?" toggle
- Quick-log: multi-select activities with inline products (**CATEGORIZATION STILL WRONG** — not fixed this session)
- Product inventory: 24 products, tier management, CRUD
- Compensation card + gel gap with inventory integration
- **URL:** https://mandy-apperkeeper.github.io/hair-routine/

### What's Broken / Needs Fixing
- ACTIVITY_PRODUCTS mapping is incorrect — products in wrong categories
- This will be fixed as part of the Product Intelligence System spec, not as a standalone patch

## What's Next

1. **Session 12: Draft Product Intelligence System spec** — Answer the open questions above, then draft a formal spec with requirements and tasks. This is complex enough for a spec (touches data model, inventory, quick-log, feedback engine, walkthrough recommendations, potentially needs a backend).
2. **After spec:** Implement in phases — data model first, then logging UI, then passive intelligence, then active recommendations, then online discovery last.
3. **Service worker + PWA** — Still needed but deferred until after product intelligence lands (it affects what gets cached).

## Decisions Made (New This Session)
- Product intelligence is a full system redesign, not a quick mapping fix
- Intelligence surfaces both passively (post-wash) and actively (pre-wash)
- Offline-first with online discovery for new products
- Products need mechanism, interaction, and outcome metadata
- This warrants a formal spec before implementation begins

## Decisions Made (Cumulative, Still Active)
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

## Repo State
- **Branch:** main
- **Remote:** origin/main in sync (no changes this session)
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/
