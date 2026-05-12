# Session Handoff — Hair Routine

**Date:** May 12, 2026
**Session focus:** Product Synergy Pairing — implemented tasks 5-8 (integration, explainer, UI, tests)

---

## What Was Done This Session

### Product Synergy Pairing Spec — Tasks 5, 6, 7, 8.1-8.3

**Task 5: Integration into buildPlan()** (commit `abee28a`)
- `buildPlan()` now collects top-3 candidates per step from `rankProducts()` output
- Passes candidates to `PlanOptimizer.optimize()` after domain rules are applied
- Domain-locked steps excluded from optimization: use-up rotation, tiered conditioning overrides, deep_condition steps
- Optimizer's selections applied to plan steps with synergy metadata attached
- Timer updated when optimizer swaps a conditioner/deep_condition product
- `PairBeliefTracker.update()` wired into all 3 rating flows:
  - `savePlanWashEvent()` (plan tab rating)
  - Quick-log wash event
  - Deferred rating banner
- All guarded by `rating && products.length > 1`

**Task 6: SynergyExplainer module** (commit `4faee3f`)
- `explainSelection(productId, plan, interactionLookup)` — finds strongest positive interaction, returns "Pairs with [product] — [mechanism]"
- `explainChain(chain, interactionLookup)` — generates chain summary with product names and benefit text
- `explainAlternativeImpact(alternativeId, currentPlan, stepIndex, interactionLookup)` — computes net synergy impact of swapping, accounts for both gains and losses
- Wired into buildPlan: explanations generated for synergy-selected steps, synergyImpact added to all alternatives with re-sorting by combined score

**Task 7: UI Integration** (commit `872073e`)
- 7.1: Info popup shows synergy explanation (gold accent border, "Chosen over [product] for better pairing")
- 7.2: Alternatives list shows +/- indicators (green/red) with impact text
- 7.3: Chain summary card above plan steps when chains detected
- 7.4: Product swap triggers plan re-evaluation (optimizer re-runs with swapped product fixed, downstream products updated)
- 7.5: Contradiction insight card on landing screen (dismissable, persisted in localStorage)

**Task 8.1-8.3: Property-based tests** (commit `72ff1c7`)
- 26 tests across 3 files, all passing
- vitest + fast-check with vm-based module extraction from single-file HTML
- Covers all 19 correctness properties from the design doc
- Test infrastructure: `hair-routine/tests/` with package.json, vitest.config.js, extract-modules.js

### Previous Session Work (preserved from prior handoff)

- Olaplex No. 3 deep dive (Primary, 95/100)
- OGX Bond Protein Serum deep dive (Supporting, 85/100)
- Pantene Miracle Rescue deep dive (Supporting, 88/100)
- Queue: 29 complete, 2 remaining (monday-moisture-leave-in, pure-coconut-oil)

---

## What's Live vs Pending

- **Dev server (primary):** Served locally via Cauldron at `https://192.168.68.36:8443/hair-routine/` — commits are immediately live
- **GitHub Pages:** DO NOT push to origin. Stale/archive only.
- **Schema:** Version 15 (added pairBeliefs for synergy system)
- **SW Cache:** v20
- **Synergy system:** Fully integrated — optimizer runs on every plan generation
- **Tests:** 26 property-based tests passing (`cd hair-routine/tests && npx vitest run`)

---

## Known Issues

1. **Mechanism check is binary (amodimethicone yes/no)** — confirmed correct for current product pairs
2. **`stiff` in symptomMap is dead code** — Layer 1 has no stiff button
3. **Product-aware interventions untested on device** — from prior session
4. **Auto-scroll untested on device** — from prior session
5. **Synergy system untested on device** — all logic verified via property tests but no iPad testing yet
6. **Task 8.4 (unit tests) not done** — edge cases and integration tests remain (single-candidate skipping, wildcard expansion, schema migration, performance benchmark, end-to-end with real inventory)
7. **Established decision needs update:** "Pre-shampoo treatment is marketing" is too broad — citric acid crosslinking (Garnier pre-shampoo) is a legitimate mechanism with peer-reviewed evidence
8. **Marc Anthony tier should be updated:** Diamond Sleek research recommends Marc Anthony drop to Supporting (backup). This change hasn't been made in the app's inventory yet.
9. **Garnier Filler Serum tier should be updated:** Deep dive recommends downgrade to Use-Up. Not yet reflected in app inventory.
10. **Pantene "bond repair" established decision needs nuance:** Current says "genuine bond repair (bis-aminopropyl dimethicone)." Should say "genuine targeted damage conditioning via electrostatic bridging — functional repair, not structural repair."

---

## Decisions Made

- **Synergy optimizer runs AFTER domain rules.** Use-up rotation, tiered conditioning, and deep_condition steps are locked before the optimizer sees them. The optimizer only affects steps where product selection is purely from rankProducts.
- **Normal conditioner step is NOT domain-locked.** When tiered conditioning selects garnier-color-repair-cond (the default), the optimizer can override it if synergy warrants a different conditioner. Timer updates to match the new product.
- **PairBeliefTracker requires rating + 2+ products.** No pair beliefs are recorded for unrated washes or single-product events.
- **Contradiction cards persist dismissal in localStorage.** Once dismissed, a contradiction won't resurface unless the user clears site data.
- **Product swap triggers full re-optimization.** After a user swaps a product, the optimizer re-runs with the swapped product fixed, and downstream products may change silently (no confirmation prompt — the spec said "subtle prompt" but silent application is cleaner for the single-file app UX).

### Previous decisions (preserved):
- **Olaplex 3 is Primary and irreplaceable.** Only product in inventory that repairs disulfide bonds.
- **OGX Bond Protein Serum fills the "silicone-free protein" niche.** Use on air-dry days.
- **Pantene Miracle Rescue is functional repair, not structural repair.**
- **All bond builders in the inventory are complementary, not competing.**

---

## Next Session Priorities

### Immediate:
1. **iPad testing** — synergy system in action (verify optimizer selections make sense, chain cards display, alternatives show +/- indicators, contradiction card works)
2. **iPad testing** — ranking changes, product-aware timers, mask-replaces-conditioner display, dew point, no geolocation prompt
3. **Task 8.4 unit tests** — edge cases (single-candidate skipping, wildcard expansion, schema migration, performance benchmark <50ms, end-to-end with real inventory)

### Still pending from prior sessions:
4. Dev note follow-up — "More than one secondary reason for hair considerations can be true" (diagnostic engine logic)
5. Re-score everpure-bond-shampoo.md
6. A6 adversarial pass
7. Verify-mode: research drift audit
8. Deep dive queue: monday-moisture-leave-in, pure-coconut-oil (2 remaining)

---

## Specs Status

| Spec | Status |
|------|--------|
| adaptive-hair-routine | Complete (original, partially superseded) |
| daily-plan | Complete (all tasks done) |
| product-intelligence | Partially implemented |
| diagnostic-adjustment-engine | Complete (all tasks done, deployed locally) |
| product-synergy-pairing | **Nearly complete** — tasks 1-7 done, 8.1-8.3 done, 8.4 remaining |

---

## Architecture Notes

- **Geolocation:** Removed. Weather comes from `/api/location` (Cauldron) → Open-Meteo API. No browser permissions.
- **Conditioning logic:** Mechanism-aware. Checks mask's `ingredients` array for `amodimethicone`. If present → mask replaces conditioner (same actives). If absent → both steps valid (different mechanisms).
- **Product timers:** `intelligence.recommendedTime` (seconds) on deep_condition products. `getProductTime(productId, inventory)` helper returns it with 300s fallback.
- **Synergy system:** InteractionLookup (precomputed pair map) → SynergyScorer (cross-step evaluation) → PlanOptimizer (bounded exhaustive search, max 729 combinations) → SynergyExplainer (user-facing text). PairBeliefTracker learns pair effectiveness from wash ratings (Normal-Normal conjugate, min 5 observations).
- **Synergy integration point:** After tiered conditioning logic in `buildPlan()`, before return. Domain-locked steps excluded. SYNERGY_WEIGHT = 15.
- **Test infrastructure:** `hair-routine/tests/` — vitest + fast-check. `extract-modules.js` uses Node.js `vm` to sandbox-evaluate synergy modules from the HTML. Run with `cd hair-routine/tests && npx vitest run`.
- **Deployment:** Local only via Cauldron `static_apps`. Commits are live immediately. Do NOT push to origin.
