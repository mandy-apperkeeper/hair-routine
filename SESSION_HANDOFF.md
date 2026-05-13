# Session Handoff — Erinyes (Hair Routine)

**Date:** May 12, 2026
**Session focus:** Project rename to Erinyes + naming rationale

---

## What Was Done This Session

### Project Rename: Erinyes (commit `2e873e7`)

Renamed the hair routine project to **Erinyes** — after the Greek Furies, serpent-haired enforcers of natural law. The name reflects monster reclamation: what was called "monstrous" (wild, uncontrollable hair) is actually power that demands respect, not taming. Hair symbolism is literal — the Erinyes are depicted with serpents entwined in their hair.

**Subsystem codenames established:**
- **Alecto** ("unceasing") — the diagnostic engine
- **Megaera** ("grudging") — the cooldown system
- **Tisiphone** ("avenger of destruction") — the synergy optimizer

**Files updated:**
- `manifest.json` → name/short_name: "Erinyes"
- `index.html` → `<title>`, apple-mobile-web-app-title
- `hair-sw.js` → cache name `erinyes-cache-v21`, consolidated old cache cleanup
- Cauldron `config.json` → added `/erinyes/` path (keeps `/hair-routine/` during transition)
- Project registry, session context steering, SESSION_HANDOFF, NEXT_STEPS, CHANGE_LOG headers
- Product Intelligence spec tasks.md updated

**Naming convention (until June 23, 2026):** "Erinyes (hair routine)" in docs/steering. After that date, drop the parenthetical.

**NTFS junction created:** `c:\Users\Ben\Apper Keeper\erinyes\` → points to `hair-routine\`. Both paths work.

### Previous Session Work (preserved from prior handoff)

- **Group count badges** — green circular badges on step group buttons (commit `6d89151`)
- **Quick-add for unlisted products** — task 4.3 complete (same commit)

---

## What's Live vs Pending

- **Dev server (primary):** Served locally via Cauldron at `https://192.168.68.36:8443/erinyes/` (also `/hair-routine/`)
- **GitHub Pages:** DO NOT push to origin. Stale/archive only.
- **Schema:** Version 15 (unchanged)
- **SW Cache:** v21 (bumped for rename)
- **Tests:** 81 tests passing across 5 files (`cd hair-routine/tests && npx vitest run`)
- **Cauldron:** STOPPED (was stopped for rename attempt). Restart next session or manually.

---

## Known Issues

1. **Folder rename pending** — `hair-routine/` needs renaming to `erinyes/` on disk. Requires closing Kiro (file locks). Junction exists as bridge. After rename: update Cauldron config path from `../../hair-routine` to `../../erinyes`, remove junction.
2. **Mechanism check is binary (amodimethicone yes/no)** — confirmed correct for current product pairs
3. **`stiff` in Layer 1 symptomMap is unreachable** — harmless, stiff IS handled via Layer 3
4. **Product-aware interventions untested on device** — from prior session
5. **Auto-scroll untested on device** — from prior session
6. **Synergy system untested on device** — all logic verified via property tests but no iPad testing yet
7. **Quick-add products get minimal intelligence** — work for logging but won't contribute to attribution/synergy until enriched

---

## Decisions Made

- **Quick-add creates "supporting" tier products by default.** User can change tier later from inventory view.
- **Quick-add auto-selects the new product** for the current log (saves a tap).
- **Group count badges use green circular style** matching the existing selection highlight color.
- **`stiff` is NOT dead code** — prior handoff note was misleading. Preserved as-is.

### Previous decisions (preserved):
- **Olaplex 3 is Primary and irreplaceable.** Only product in inventory that repairs disulfide bonds.
- **OGX Bond Protein Serum fills the "silicone-free protein" niche.** Use on air-dry days.
- **Pantene Miracle Rescue is functional repair, not structural repair.**
- **All bond builders in the inventory are complementary, not competing.**
- **Synergy optimizer runs AFTER domain rules.**
- **Normal conditioner step is NOT domain-locked.**
- **PairBeliefTracker requires rating + 2+ products.**
- **EverPure Bond Conditioner is "co-primary" with Garnier** (not "second-best").
- **Research drift corrections are data-only changes** — algorithms were already correct.

---

## Next Session Priorities

### Immediate:
1. **Folder rename** — close Kiro, rename `hair-routine/` → `erinyes/`, update Cauldron config path, remove junction, restart Cauldron
2. **Restart Cauldron** — currently stopped from this session's rename attempt
3. **iPad testing** — synergy system, ranking changes, product-aware timers, quick-log improvements (group count badges, quick-add flow)

### Still pending:
4. Update NEXT_STEPS.md to reflect completed items (SW done, everpure re-score done, task 4.3 done)
5. Product Intelligence spec — mark task 4.3 as complete, verify remaining checkpoints
6. **June 23, 2026** — revisit naming convention, drop "(hair routine)" parenthetical from docs if Erinyes is fully internalized

---

## Specs Status

| Spec | Status |
|------|--------|
| adaptive-hair-routine | Complete (original, partially superseded) |
| daily-plan | Complete (all tasks done) |
| product-intelligence | Nearly complete — task 4.3 done this session, only checkpoints 3/5/13 remain unchecked |
| diagnostic-adjustment-engine | Complete (all tasks done, deployed locally) |
| product-synergy-pairing | Complete — 81 tests passing |

---

## Architecture Notes

- **Geolocation:** Removed. Weather comes from `/api/location` (Cauldron) → Open-Meteo API. No browser permissions.
- **Conditioning logic:** Mechanism-aware. Checks mask's `ingredients` array for `amodimethicone`. If present → mask replaces conditioner. If absent → both steps valid.
- **Product timers:** `intelligence.recommendedTime` (seconds) on deep_condition products. `getProductTime(productId, inventory)` helper returns it with 300s fallback.
- **Synergy system:** InteractionLookup → SynergyScorer → PlanOptimizer (bounded exhaustive, max 729 combos) → SynergyExplainer. PairBeliefTracker learns from wash ratings (Normal-Normal conjugate, min 5 observations).
- **Synergy integration point:** After tiered conditioning logic in `buildPlan()`, before return. Domain-locked steps excluded. SYNERGY_WEIGHT = 15.
- **Test infrastructure:** `hair-routine/tests/` — vitest + fast-check. `extract-modules.js` uses Node.js `vm` to sandbox-evaluate synergy modules from the HTML. Run with `cd hair-routine/tests && npx vitest run`.
- **Deployment:** Local only via Cauldron `static_apps`. Commits are live immediately. Do NOT push to origin.
- **Quick-add products:** Created with minimal intelligence stub (no mechanisms/outcomes/ingredients). Appear in quick-log immediately. Can be enriched later via inventory discovery form.
