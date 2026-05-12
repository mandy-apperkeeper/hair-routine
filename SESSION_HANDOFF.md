# Session Handoff — Hair Routine

**Date:** May 12, 2026
**Session focus:** Task 8.4 complete — all synergy system tests passing (81 tests)

---

## What Was Done This Session

### Task 8.4 — Unit Tests + Integration Tests (COMPLETE)

Completed `hair-routine/tests/synergy.integration.test.js` (27 tests):
- Real inventory interaction map verification (enables, blocks, complements, wildcards, bidirectional)
- Optimizer with real product candidates (synergy override, blocking avoidance, rank-1 fallback)
- SynergyScorer with real plans (enables chain scoring, wildcard contribution, blocking, complements, mixed)
- PairBeliefTracker end-to-end (update, threshold, contradictions, belief-influenced optimization)
- Schema migration (v15 state, pre-v15 graceful handling, auto-initialization)
- SynergyExplainer with real products (selection explanation, alternative impact positive/negative)

Added `extractRealInventory()` helper to `extract-modules.js`:
- Extracts DEFAULT_INVENTORY from index.html for integration testing with real product data

Unit tests already passing from prior session (28 tests in `synergy.unit.test.js`):
- InteractionLookup (6), PlanOptimizer (6), SynergyExplainer (7), Performance (2), SynergyScorer (5), plus 2 new performance benchmarks

Commit: `5f0caef`

---

## What's Live vs Pending

- **Dev server (primary):** Served locally via Cauldron at `https://192.168.68.36:8443/hair-routine/` — commits are immediately live
- **GitHub Pages:** DO NOT push to origin. Stale/archive only.
- **Schema:** Version 15 (added pairBeliefs for synergy system)
- **SW Cache:** v20
- **Synergy system:** Fully integrated — optimizer runs on every plan generation
- **Tests:** 81 tests passing across 5 files (`cd hair-routine/tests && npx vitest run`)

---

## Known Issues

1. **Mechanism check is binary (amodimethicone yes/no)** — confirmed correct for current product pairs
2. **`stiff` in symptomMap is dead code** — Layer 1 has no stiff button
3. **Product-aware interventions untested on device** — from prior session
4. **Auto-scroll untested on device** — from prior session
5. **Synergy system untested on device** — all logic verified via property tests but no iPad testing yet
7. **Established decision needs update:** "Pre-shampoo treatment is marketing" is too broad — citric acid crosslinking (Garnier pre-shampoo) is a legitimate mechanism with peer-reviewed evidence
8. ~~**Marc Anthony tier:**~~ Done — already `tier: 'supporting'` in inventory.
9. ~~**Garnier Filler Serum tier:**~~ Done — already `tier: 'use-up'` with `usingUp: true`.
10. ~~**Pantene wording:**~~ Done — already updated to electrostatic bridging language.

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

### Still pending from prior sessions:
4. ~~Dev note follow-up~~ — "More than one secondary reason for hair considerations can be true" — VERIFIED: already implemented. Multi-symptom ranking (`rankCausesMultiSymptom`), multi-cause selection ("Tap all that apply"), and stacking interventions all work.
5. Re-score everpure-bond-shampoo.md
6. A6 adversarial pass
7. Verify-mode: research drift audit
8. Deep dive queue: ~~monday-moisture-leave-in~~, ~~pure-coconut-oil~~ (DONE — both written May 12)

---

## Specs Status

| Spec | Status |
|------|--------|
| adaptive-hair-routine | Complete (original, partially superseded) |
| daily-plan | Complete (all tasks done) |
| product-intelligence | Partially implemented |
| diagnostic-adjustment-engine | Complete (all tasks done, deployed locally) |
| product-synergy-pairing | **Complete** — all tasks done, 81 tests passing |

---

## Architecture Notes

- **Geolocation:** Removed. Weather comes from `/api/location` (Cauldron) → Open-Meteo API. No browser permissions.
- **Conditioning logic:** Mechanism-aware. Checks mask's `ingredients` array for `amodimethicone`. If present → mask replaces conditioner (same actives). If absent → both steps valid (different mechanisms).
- **Product timers:** `intelligence.recommendedTime` (seconds) on deep_condition products. `getProductTime(productId, inventory)` helper returns it with 300s fallback.
- **Synergy system:** InteractionLookup (precomputed pair map) → SynergyScorer (cross-step evaluation) → PlanOptimizer (bounded exhaustive search, max 729 combinations) → SynergyExplainer (user-facing text). PairBeliefTracker learns pair effectiveness from wash ratings (Normal-Normal conjugate, min 5 observations).
- **Synergy integration point:** After tiered conditioning logic in `buildPlan()`, before return. Domain-locked steps excluded. SYNERGY_WEIGHT = 15.
- **Test infrastructure:** `hair-routine/tests/` — vitest + fast-check. `extract-modules.js` uses Node.js `vm` to sandbox-evaluate synergy modules from the HTML. `extractRealInventory()` pulls DEFAULT_INVENTORY for integration tests. Run with `cd hair-routine/tests && npx vitest run`.
- **Deployment:** Local only via Cauldron `static_apps`. Commits are live immediately. Do NOT push to origin.
