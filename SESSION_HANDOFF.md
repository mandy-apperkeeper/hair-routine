# Hair Routine — Session Handoff (May 10, 2026, Session 9)

## What Happened This Session

### Session 9: Product Inventory (complete)

**9A. Product inventory feature** — Schema v3 migration seeds 24 products from consultation. InventoryManager module with full CRUD. UI grouped by tier (Primary Rotation → Supporting Cast → Use-Up Queue) and sub-grouped by routine context. Tap-to-expand with notes and action buttons. Add product form. "Products" nav button.

**9B. Gel gap / inventory integration** — `hasGelInInventory()` now checks actual product inventory (not just wash history). Gel gap card shows "I have this — add to inventory" button that adds NYM gel and dismisses the warning.

### Feedback Captured (for Session 10)
- Landing page feels "choice rather than guide" — presents equal options instead of recommending
- Quick-log needs product selection (multi-select from inventory)
- Clarifying is a sub-type of wash, not a separate treatment category
- These three form a coherent "make logging actually work" improvement

### Files Changed
- `hair-routine/index.html` — Schema v3, DEFAULT_INVENTORY, InventoryManager module, inventory view UI, gel gap integration, nav button
- `hair-routine/NEXT_STEPS.md` — Session 9 marked complete, Session 10 reprioritized
- `hair-routine/SESSION_HANDOFF.md` — This file

## Current State

### What's Live (GitHub Pages)
- `index.html` — quick-log form with multi-select treatments, emoji rating, lane-specific products, refresh lane
- Auto dew point detection (Open-Meteo) with manual fallback
- Smart recommendation card on landing screen
- **Compensation card** — contextual product statements based on last wash + gel gap reminder
- Status bar tracks: last wash, last clarify, last protein, last deep condition, seal state
- Treatment badges on history event cards
- **URL:** https://mandy-apperkeeper.github.io/hair-routine/

### Spec Status
- **Adaptive Hair Routine spec** — feature-complete (all 16 task groups done)
- Optional items remaining: ~14 property tests + 1 integration test (all marked `*` = skippable)
- `design.md` — up to date (WashEvent has `treatments`, `dewPoint`, schema v2)
- `requirements.md` — up to date (Requirement 8 rewritten for "inform, don't ask" philosophy)

### Research (Complete)
| File | Content | QC Score |
|------|---------|----------|
| `research/PHASE1_INGREDIENT_FUNCTION_MAP.md` | 8 functional roles, coverage matrix | — |
| `research/PHASE2_FORMULATION_POSITION_RULES.md` | INCI position rules, delivery format effects | 94% |
| `research/PHASE3_INTERACTION_MATRIX.md` | Product interaction matrix (all compatible) | — |
| `research/PHASE4_ROTATION_RULES.md` | Rotation science (none needed) | — |
| `research/PHASE5_COMPENSATION_TABLE.md` | Master compensation table for app logic | — |
| `RESEARCH_PLAN_PRODUCT_RELATIONSHIPS.md` | Original 5-phase plan (now complete) | — |

### Implementation Improvements (`IMPLEMENTATION_IMPROVEMENTS.md`)
- **13 of 15 items done** (✅)
- **Remaining:**
  - Item 3 ("Why did that work?" retrospective card) — needs feedback engine data (15+ events)
  - Item 6 (18-MEA maintenance insight) — needs feedback engine data (30+ events)

### Key Files
| File | Role |
|------|------|
| `index.html` | Live v1 app (quick-log + history + status) |
| `hair-routine-v2.html` | Full spec build (walkthrough engine, learn section, settings) |
| `hair-sw.js` | Service worker for v2 offline support |
| `index-v1-backup.html` | Pre-redesign backup |
| `HAIR_APP_SESSION_HANDOFF.md` | Historical — session 3 handoff (design application) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science/product reference from consultation |
| `HAIR_SCIENCE_VERIFICATION_REPORT.md` | Science claims verification |
| `IMPLEMENTATION_IMPROVEMENTS.md` | 15-item improvement roadmap with status |

## What's Next (Priority Order)

1. **Logging UX overhaul (Session 10)** — Landing page guides instead of presenting equal choices. Quick-log gets product selection from inventory. Clarifying becomes a wash subtype, not a treatment toggle. This is the highest priority because the app can't build useful history without usable logging.
2. **Service worker for v1 (Session 11)** — Offline support for the live app (bathroom use case)
3. **v1→v2 convergence planning (Session 12)** — Audit, decide switchover strategy, execute

### Session 10 Design Decisions (need confirmation at session start)

1. **Landing page model:** Single recommended action prominent, alternatives behind "Something else?" link? Or contextual guidance with soft recommendation?
2. **Product selection in quick-log:** Multi-select from inventory (grouped by context)? Or simplified "which shampoo + which conditioner" approach?
3. **Clarifying wash:** Radio button "Regular / Clarifying" as part of lane selection? Or auto-detect from product selection (if clarifying shampoo is selected, mark as clarify)?

## Decisions Made (Cumulative, Still Active)

- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category. Never recommend inferior product for "variety."
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model (clarify, protein, deep-condition, bond-repair).
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema version 3: WashEvent includes `treatments: string[]` and `dewPoint: number | null`. State includes `inventory: Product[]`.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Product inventory: full list stored in localStorage (not sparse overlay). Pre-populated from consultation, user modifies directly.
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue. Context tags: every-wash, curly, blowout, weekly, as-needed.

## Open Questions

- When does v2 (`hair-routine-v2.html`) replace v1 (`index.html`) as the live app? What's the switchover criteria?

## Repo State

- **Branch:** main
- **Last commit:** `3fdc8f4` — docs(steering): add Sky Guide design principles for inventory feature evaluation
- **Uncommitted:** None (this handoff file will be committed next)
- **Remote:** origin/main in sync with HEAD
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/
