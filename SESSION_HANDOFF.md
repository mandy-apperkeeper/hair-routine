# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 17)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- **Schema version 9** (OGX Pre-Shampoo → 1-Minute Mask swap)
- Landing page: single recommended action + "Something else?" toggle
- Quick-log: **7-group step-based product selection** (Pre-wash | Shampoo | Bond Repair | Condition | Leave-in & Protect | Style | Finishing)
  - Shampoo has sub-menus: Regular / Clarifying
  - Condition has sub-menus: Conditioner 🧢 / Deep Conditioner 🧢 / Gloss 🧢
  - Heat cap badge on Condition group
  - **Products with `additionalSteps` appear in multiple groups**
- Post-wash attribution card: mechanism-based "what your routine targeted today"
- Product inventory: **30 products** with full intelligence metadata
- Walkthrough engine: curly/blowout/refresh with humidity-based product substitution
  - **Correct step order:** coconut oil pre-wash → shampoo → bond repair (wet hair) → conditioner → gloss → style
  - **Product names shown in gold** on each walkthrough step
- **Humidity auto-detection only** — no manual prompt. Defaults to moderate on failure.
- Dew point auto-detection via Open-Meteo API
- History view with export/import
- Compensation engine (Dove use-up cards, protein/olaplex overdue warnings)
- Gel gap card (shows if no PQ-69 gel in inventory)
- Status tracker (compact — reduced padding)

### What Was Done This Session (17)
1. **Updated steering docs** — session-context.md and NEXT_STEPS.md synced to schema v8/v9, all sessions marked complete, Daily Plan added as next phase
2. **Wrote Daily Plan tasks.md** — 11 tasks, ~30 subtasks, domain-rules-first approach (Bayesian later)
3. **Inventory fix: OGX Pre-Shampoo → 1-Minute Mask** — Mandy has the mask, not the pre-shampoo. Schema v9 migration swaps it for existing users.
4. **Fixed walkthrough product display** — each step now shows the actual product name in gold (was only showing ingredient science before)
5. **Fixed 4 mismatched productIds** — walkthrough steps referenced wrong inventory IDs (everpure-bond-repair, garnier-color-repair, loreal-21-in-1, marc-anthony-blowout)
6. **Restructured walkthrough step order** — coconut oil pre-wash (dry hair) → shampoo → bond repair (wet clean hair) → conditioner → gloss. Bond repair moved from step 1 to after shampoo (needs wet clean surface).
7. **Wonder Water promoted to proper Gloss step** — was buried as a tip, now a full step with product ID
8. **Updated Phase 1 research doc** — replaced OGX Pre-Shampoo references with 1-Minute Mask, updated coverage assessments (protein fill no longer single point of failure, humidity barrier resolved, penetrating oil has standalone coconut oil)
9. **Updated HAIR_CONSULTATION_HANDOFF.md** — corrected OGX product listing

### What's NOT Done (carry to next session)

#### Architecture: Product Intelligence System
- IngredientKB + BeliefTracker → pre-wash recommendations → marginal contribution analysis → product discovery form → service worker/PWA
- See `.kiro/specs/product-intelligence/` for full spec

#### Daily Plan Implementation
- `tasks.md` is written and ready at `.kiro/specs/daily-plan/tasks.md`
- Domain-rules-first approach (no Bayesian dependency for launch)
- Estimated 3-4 build sessions

#### Research Documentation
- Write up coconut oil and OGX oil research findings into `research/` folder (sources, methodology, conclusions)

---

## Schema

**Version:** 9 (live)
**Intelligence shape (v8+ with additionalSteps, v9 swaps OGX pre-shampoo for mask):**
```js
intelligence: {
    mechanisms: string[],
    delivery: 'rinse_off' | 'leave_on' | 'unknown',
    step: 'pre_wash' | 'shampoo' | 'bond_repair' | 'conditioner' | 'deep_condition' | 'gloss' | 'leave_in' | 'heat_protection' | 'styling' | 'finishing',
    additionalSteps?: string[],  // Optional — product appears in these groups too
    outcomes: { [key: string]: number },
    cumulative: boolean,
    interactions: Array<{ with: string, type: string, note: string }>
}
```

---

## Cumulative Decisions (Do Not Revisit)

### Hair Science
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils: volatile silicones + dimethiconol film + trace oil. Reclassified as finishing products (shine/frizz). Weak pre-wash — pure coconut oil is the right tool for that job. Argan oil specifically does NOT penetrate hair cortex (stays in outer 5µm, increases water affinity).
- No product rotation needed for any category.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask. Default moderate on failure.
- Abbey Yung 11-step method is the reference model for logging.
- Hard floors: wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days.
- "Pre-shampoo treatment" is a marketing term — bond repair products work best on a clean surface (after shampoo) and get sealed in by conditioner.
- Heat cap benefits all conditioning-step products (conditioner, deep conditioner, gloss).
- Pantene Miracle Rescue Leave-In is a genuine bond repair product (bis-aminopropyl dimethicone).
- OGX Bond Protein Repair Sealing Serum is silicone-free protein fill (different tool than Garnier serum).

### Architecture
- Single-file HTML app, localStorage, no backend, offline-first, GitHub Pages.
- Schema version 9. Intelligence uses granular `step` values (no subStep). Optional `additionalSteps` array for multi-group products.
- Treatments are separate from products in the data model.
- Products CAN appear in multiple activity categories via `additionalSteps` field.
- No humidity prompt — auto-detect only, silent fallback to moderate.
- Walkthrough step order: coconut oil pre-wash (dry) → shampoo → bond repair (wet) → conditioner → gloss → style.
- Bond repair goes AFTER shampoo (needs wet clean surface, gets sealed by conditioner).

### Product
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.
- Mandy owns: NYM Curl Talk gel, Maui Moisture Curl Smoothie, L'Oréal Elvive Total Repair 5 Balm, OGX Bond Protein Repair Heat Spray, Monday Moisture Leave-In, OGX Bond Protein Repair Sealing Serum, pure coconut oil.
- Pure coconut oil is the correct pre-wash oil (penetrates cortex, prevents hygral fatigue). OGX oils are finishing products, not pre-wash tools.
- Elvive Glycolic Gloss 5-Min Lamination = same product as EverPure Glossing Lamination Mask. One entry only.
- Goal of logging is data gathering for correlations, not minimal taps.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~5300 lines, single-file architecture) |
| `hair-sw.js` | Service worker (not yet registered in v1) |
| `.kiro/specs/product-intelligence/` | Active spec for intelligence system |
| `.kiro/specs/adaptive-hair-routine/` | Original spec (complete) |
| `research/` | 5 research phases + 3 briefs (all complete) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference |

---

## Session History (abbreviated)

| Session | What | Status |
|---------|------|--------|
| 1-8 | Core app build | Complete |
| 9 | Product inventory (24 products, CRUD, tiers) | Complete |
| 10 | Logging UX overhaul | Complete |
| 11 | Product Intelligence scoping | Complete (design) |
| 12 | Research briefs + attribution card + spec | Complete |
| 13 | Schema rename (phase→step, added subStep) | Complete |
| 14 | Step reorganization planning + new product research | Complete (design) |
| 15 | **Step reorganization implementation, humidity fix, tracker compact, Pantene research, dedup fix** | Complete |
| 16 | **Coconut oil research, OGX oil re-evaluation, 4 new products, additionalSteps feature, schema v8** | Complete |
| 17 | **Doc sync, Daily Plan tasks.md, inventory fix (OGX mask), walkthrough reorder + product display, Phase 1 research update** | Complete |

---

## Repo State

- **Branch:** main
- **Clean:** Uncommitted changes from Session 17 (ready to commit).
- **GitHub Pages:** Live and working at schema v8 (v9 not yet pushed).
