# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 13)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Landing page: single recommended action + "Something else?" toggle
- Quick-log: phase-based product selection (Pre-wash | Wash | Post-wash | Style) using `intelligence.step`
- Post-wash attribution card: mechanism-based "what your routine targeted today"
- Product inventory: 24 products with full intelligence metadata (mechanisms, outcomes, interactions, step, subStep)
- Walkthrough engine: curly/blowout/refresh with humidity-based product substitution
- Compensation card + gel gap with inventory integration
- Dew point auto-detection via Open-Meteo API
- History view with export/import
- Schema version 5

### What's Broken
- Nothing currently broken. The ACTIVITY_PRODUCTS mapping issue from Session 10 was resolved by switching to `intelligence.step`-based grouping.

### Schema v5 Intelligence Shape
```js
intelligence: {
    mechanisms: string[],           // functional roles: cuticle_smoothing, bond_repair, etc.
    delivery: 'rinse_off' | 'leave_on' | 'pre_shampoo' | 'unknown',
    step: 'pre_wash' | 'wash' | 'post_wash' | 'style',
    subStep?: 'shampoo' | 'conditioner' | 'clarify' | 'glossing' | 'deep_condition',
    outcomes: { [key: string]: number },  // 0-1 weights per dimension
    cumulative: boolean,
    interactions: Array<{ with: string, type: string, note: string }>
}
```

---

## What's Next

### PRIORITY: Product Step Reorganization (not yet implemented)

The current `intelligence.step` values are WRONG. Products are mis-categorized. The correct mapping (discussed but not coded) is:

**New step structure (replaces current pre_wash/wash/post_wash/style):**

1. **pre_wash** = Oils ONLY (OGX Coconut Oil, OGX Argan Oil) — applied to dry hair before wetting
2. **shampoo** = Cleansing step (EverPure Bond Repair, Dove Bond Strength, Dove Intensive Repair, EverPure Clarifying)
3. **bond_repair** = RENAMED from "pre-shampoo treatment" — applied BETWEEN shampoo and conditioner, NOT before shampoo
   - Olaplex 3, Garnier Hair Filler Pre-Shampoo, OGX Bond Protein Pre-Shampoo, L'Oréal Bond Repair Pre-Shampoo
   - These are currently tagged `step: 'pre_wash'` which is WRONG — they go after shampoo, before conditioner
4. **conditioner** = Garnier Color Repair, EverPure Bond Repair Cond, Dove Bond Strength Cond, Dove Intensive Repair Cond
5. **glossing** = Wonder Water, Glossing Lamination Mask, Elvive 5-Minute Gloss Mask
6. **deep_condition** = Dove Bond Strength Mask
7. **leave_in** = L'Oréal 21-in-1 Spray, Pantene Bond Spray
8. **heat_protection** = Marc Anthony Grow Long Shield
9. **styling** = NYM Curl Talk Gel, Got2b Gel
10. **finishing** = Garnier Filler Serum, Dove 10-in-1 Serum, OGX Coconut Oil, OGX Argan Oil

**Key changes from current code:**
- Current `step: 'pre_wash'` products (Olaplex, Garnier Filler, OGX Bond Protein, L'Oréal Bond Repair Pre-Shampoo) → move to `step: 'bond_repair'`
- Current `step: 'pre_wash'` should ONLY contain oils
- OGX oils currently tagged `step: 'post_wash'` → should appear in BOTH `pre_wash` AND `finishing` (multi-step products)
- The 4-phase UI grouping (Pre-wash | Wash | Post-wash | Style) may need to expand or the sub-grouping within phases needs to reflect this order
- "Pre-shampoo treatment" label should be renamed to "Bond Repair" in the UI

**This also involves proper education/research integration** — the app should teach Mandy WHY bond repair goes between shampoo and conditioner (clean surface for absorption, conditioner seals it in).

### Product Intelligence System — Remaining Implementation

Spec at `.kiro/specs/product-intelligence/`. Research complete (3 briefs, all scored 100%). Some implementation already done (attribution card, schema v5, phase-based quick-log). Remaining work:

1. **Product step reorganization** (above) — MUST happen first, fixes the data model
2. **IngredientKB** — Embedded knowledge base (~100-150 ingredients, ~40-60KB). Enables product discovery parser.
3. **BeliefTracker** — Bayesian updating of per-product outcome beliefs. Normal-Normal conjugate, arithmetic only.
4. **Pre-wash recommendation card** — Tier 1 active intelligence (domain rules + dew point). Landing page.
5. **Marginal contribution analysis** — Compare ratings with/without each product (needs 3+ events per group).
6. **Product discovery form** — Structured input + ingredient parsing against KB. Open Beauty Facts as progressive enhancement.
7. **Service worker + PWA** — Offline support for bathroom use. Deferred until after intelligence system.

### Confidence Thresholds (from Brief 2)
- 0-2 events: Domain rules only
- 3-4 events: Early signal (strong personal deviation from prior)
- 5-9 events: Growing confidence
- 10-14 events: Established patterns + conditional averages
- 15-29 events: Contextual patterns (product × condition)
- 30+ events: Interaction detection + active suggestions

---

## Cumulative Decisions (Do Not Revisit)

### Hair Science
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Abbey Yung 11-step method is the reference model for logging.
- Hard floors: wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days.

### Architecture
- Single-file HTML app, localStorage, no backend, offline-first, GitHub Pages.
- Schema version 5. Intelligence uses `step` + optional `subStep`.
- Treatments are separate from products in the data model.
- Products CAN appear in multiple activity categories.
- Phase-based UI grouping for quick-log (Pre-wash | Wash | Post-wash | Style).
- Embedded ingredient KB inline in HTML (not separate file).
- Bayesian belief tracking with domain-informed priors (variance 2.0).
- Three-tier recommendation: domain rules → Bayesian → pattern detection.
- Offline-first with online product discovery as progressive enhancement.

### Product
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Goal of logging is data gathering for correlations, not minimal taps.
- Both passive (post-wash analysis) and active (pre-wash recommendations) intelligence surfacing.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~4000+ lines, single-file architecture) |
| `hair-routine-v2.html` | Original spec build (superseded by v1 which absorbed its features) |
| `hair-sw.js` | Service worker (not yet registered in v1) |
| `.kiro/specs/product-intelligence/` | Active spec for intelligence system |
| `.kiro/specs/adaptive-hair-routine/` | Original spec (complete, all tasks done) |
| `research/` | 5 research phases + 3 briefs (all complete) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference |

---

## Session History (abbreviated)

| Session | What | Status |
|---------|------|--------|
| 1-8 | Core app build (walkthrough, history, feedback, compensation, dew point) | Complete |
| 9 | Product inventory (24 products, CRUD, tiers) | Complete |
| 10 | Logging UX overhaul (landing redesign, quick-log rebuild) | Complete |
| 11 | Product Intelligence scoping (vision, open questions) | Complete (design only) |
| 12 | Research briefs + attribution card + spec draft | Complete |
| 13 | Schema rename (phase→step, added subStep) | Complete |

---

## Repo State

- **Branch:** main
- **Last commit status:** Session 13 changes may not be committed yet. Verify with `git status` before starting work.
- **GitHub Pages:** Auto-deploys on push to main.
