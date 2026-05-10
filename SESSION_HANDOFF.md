# Hair Routine — Session Handoff (May 10, 2026, Sessions 9+10)

## What Happened

### Session 9: Product Inventory (complete)
- Schema v3 migration seeds 24 products from consultation
- InventoryManager module with full CRUD
- Inventory view grouped by tier and routine context
- Gel gap now checks inventory + "Add to inventory" button

### Session 10: Logging UX Overhaul (partially complete, needs redesign)

**Done:**
- Landing page redesigned: single recommended action, "Something else?" toggle for alternatives
- Quick-log rebuilt with multi-select activities + inline product selection per activity
- "Log a wash day" button added to History page
- Clarify auto-detected from product selection

**Problem identified (not yet solved):**
The product categorization in the quick-log is wrong. Products are mis-assigned to activities because I was guessing instead of properly mapping them to the Abbey Yung method steps. The current ACTIVITY_PRODUCTS mapping needs a complete redo based on:

1. The Abbey Yung method has 8-11 steps — the logging should reflect that
2. Products can belong to multiple steps (OGX oils = pre-wash oil OR finishing)
3. The Glossing Lamination Mask is NOT a clarifying shampoo — it's its own "glossing" step (alongside Wonder Water and the 5-minute mask)
4. Heat protection and leave-in are separate steps
5. The goal is gathering data for correlations, not minimizing taps

### Research-Backed Step Mapping (draft, needs Mandy's confirmation)

From Phase 1 research + consultation + Mandy's feedback:

1. **Pre-wash oil** — OGX Coconut Oil, OGX Argan Oil, (pure coconut oil is science-backed per Rele & Mohile 2003)
2. **Pre-shampoo treatment** — Olaplex 3, Garnier Hair Filler Pre-Shampoo, OGX Bond Protein Pre-Shampoo, L'Oreal Bond Repair Pre-Shampoo
3. **Shampoo** — EverPure Bond Repair, Dove Bond Strength, Dove Intensive Repair
4. **Clarify** — EverPure Clarifying Shampoo only
5. **Conditioner** — Garnier Color Repair, EverPure Bond Repair Cond, Dove Bond Strength Cond, Dove Intensive Repair Cond
6. **Glossing/Rinse** — Wonder Water, Glossing Lamination Mask, Elvive 5-Minute Gloss Mask (own category — quick treatments that aren't conditioning masks)
7. **Deep condition** — Dove Bond Strength Mask
8. **Leave-in** — L'Oreal 21-in-1 Spray, Pantene Bond Spray
9. **Heat protection** — Marc Anthony Grow Long Shield
10. **Styling** — NYM Curl Talk Gel, Got2b Gel
11. **Finishing** — Garnier Filler Serum, Dove 10-in-1 Serum, OGX Coconut Oil, OGX Argan Oil

**Multi-category products:**
- OGX oils: Pre-wash oil + Finishing
- Garnier Filler Serum: Leave-in + Finishing
- Dove 10-in-1 Serum: Leave-in + Finishing

**Open design question:** How to present 11 steps without being tedious. Options:
- Show all 11 but pre-select the "usual" ones based on last wash (tap to deselect what you skipped)
- Collapse into phases (Pre-wash | Wash | Post-wash | Style) with products under each
- Progressive: show the steps you typically do, "Add step" for unusual ones

### Files Changed
- `hair-routine/index.html` — Landing redesign, quick-log rebuild (3 iterations), history log button, product categorization fix
- `hair-routine/NEXT_STEPS.md` — Session 9 complete, Session 10 plan
- `hair-routine/SESSION_HANDOFF.md` — This file
- `hair-routine/.kiro/steering/session-context.md` — Status updated

## Current State

### What's Live (GitHub Pages)
- Landing: single recommended action + "Something else?" toggle
- Quick-log: multi-select activities with inline products (CATEGORIZATION IS WRONG — needs Session 11 fix)
- Product inventory: 24 products, tier management, CRUD
- Compensation card + gel gap with inventory integration
- **URL:** https://mandy-apperkeeper.github.io/hair-routine/

### What's Broken / Needs Fixing
- ACTIVITY_PRODUCTS mapping is incorrect — products in wrong categories
- Need to implement the 11-step Abbey Yung mapping properly
- Need to decide on UX pattern for presenting many steps without tedium

## What's Next

1. **Session 11: Fix quick-log product mapping** — Implement the corrected step mapping, decide on UX pattern (pre-select usual, collapse into phases, or progressive), get Mandy's confirmation on step list
2. **Session 12: Service worker + PWA** — Offline support for bathroom use
3. **Session 13: v1-v2 convergence** — Audit and merge

## Decisions Made (New This Session)
- Product inventory stored as full list in localStorage (not sparse overlay)
- Landing page guides with single recommendation, alternatives hidden behind toggle
- Quick-log uses multi-select activities with inline product selection
- Clarify auto-detected from product selection (no separate toggle)
- Products CAN appear in multiple activity categories
- Abbey Yung 11-step method is the reference model for logging (not a simplified 4-category version)
- The goal of logging is data gathering for correlations, not minimal taps

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

## Repo State
- **Branch:** main
- **Remote:** origin/main in sync
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/
