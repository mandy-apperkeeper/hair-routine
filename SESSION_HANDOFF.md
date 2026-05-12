# Session Handoff — Hair Routine

**Date:** May 12, 2026
**Session focus:** Research drift audit complete — ingredient data corrected to match deep dives

---

## What Was Done This Session

### Research Drift Audit (COMPLETE)

Compared implemented code (DEFAULT_INVENTORY ingredients, notes, ranking logic) against all product deep dive research files. Found and corrected 5 discrepancies:

1. **Dove 10-in-1 Serum** — ingredients corrected from `['amodimethicone', 'dimethicone', 'cyclomethicone']` to `['aminopropyl dimethicone', 'dimethiconol', 'phenyl trimethicone', 'cyclopentasiloxane']`. Notes updated. Shine outcome bumped to 0.8.
2. **EverPure Bond Conditioner** — updated from stale OLD formula (bis-cetearyl amodimethicone + dimethicone) to current May 2026 formula (amodimethicone only). Notes updated to "co-primary."
3. **Garnier Color Repair Conditioner** — pseudoceramide INCI corrected from `'ceramide np'` to `'2-oleamido-1,3-octadecanediol'`. Added citric acid + arginine.
4. **Elvive Total Repair 5 Balm** — same pseudoceramide correction.
5. **Ranking logic** — ceramide boost check updated to match new INCI name.

Added 3 new ingredient dictionary entries: `aminopropyl dimethicone`, `phenyl trimethicone`, `2-oleamido-1,3-octadecanediol`.

Commit: `a8a8242`

### Adversarial Pass Status Confirmed

All adversarial passes (A1–A7) were already complete from prior sessions. No A6 work needed this session.

---

## What's Live vs Pending

- **Dev server (primary):** Served locally via Cauldron at `https://192.168.68.36:8443/hair-routine/` — commits are immediately live
- **GitHub Pages:** DO NOT push to origin. Stale/archive only.
- **Schema:** Version 15 (unchanged)
- **SW Cache:** v20 (unchanged)
- **Tests:** 81 tests passing across 5 files (`cd hair-routine/tests && npx vitest run`)

---

## Known Issues

1. **Mechanism check is binary (amodimethicone yes/no)** — confirmed correct for current product pairs
2. **`stiff` in symptomMap is dead code** — Layer 1 has no stiff button
3. **Product-aware interventions untested on device** — from prior session
4. **Auto-scroll untested on device** — from prior session
5. **Synergy system untested on device** — all logic verified via property tests but no iPad testing yet
7. **Established decision needs update:** "Pre-shampoo treatment is marketing" is too broad — citric acid crosslinking (Garnier pre-shampoo) is a legitimate mechanism with peer-reviewed evidence

---

## Decisions Made

- **Research drift corrections are data-only changes.** No logic changes were needed — the ranking algorithms and synergy system were already correct in their behavior. The drift was in metadata (ingredient names, notes text), not in the algorithms.
- **EverPure Bond Conditioner is now "co-primary" with Garnier** (not "second-best"). Both are amodimethicone-only formulas. Garnier has the pseudoceramide edge; EverPure has betaine for moisture.

### Previous decisions (preserved):
- **Olaplex 3 is Primary and irreplaceable.** Only product in inventory that repairs disulfide bonds.
- **OGX Bond Protein Serum fills the "silicone-free protein" niche.** Use on air-dry days.
- **Pantene Miracle Rescue is functional repair, not structural repair.**
- **All bond builders in the inventory are complementary, not competing.**
- **Synergy optimizer runs AFTER domain rules.**
- **Normal conditioner step is NOT domain-locked.**
- **PairBeliefTracker requires rating + 2+ products.**

---

## Next Session Priorities

### Immediate:
1. **iPad testing** — synergy system in action (verify optimizer selections make sense, chain cards display, alternatives show +/- indicators, contradiction card works)
2. **iPad testing** — ranking changes, product-aware timers, mask-replaces-conditioner display, dew point, no geolocation prompt

### Still pending from prior sessions:
3. Re-score everpure-bond-shampoo.md
4. Verify-mode: ~~research drift audit~~ DONE

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
