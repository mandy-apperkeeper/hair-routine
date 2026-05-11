# Session Handoff — Hair Routine

**Date:** May 11, 2026
**Session focus:** Fix conditioner ranking, product-aware timers, dual conditioning text

---

## What Was Done This Session

### 1. Fixed mechanism name mismatch in rankProducts (commit d6cbc8f)
- The +30 amodimethicone bonus checked for `'amodimethicone_conditioning'` and `'ceramide_repair'` — mechanism names that NO product uses. The bonus was completely dead code.
- Fixed: now checks actual `ingredients` array for `'amodimethicone'` (+30) and `'ceramide np'` (+15 separate bonus).
- Result: Garnier Color Repair (95) > Elvive (85) > OGX (70) > Dove (25). Elvive correctly ranks above OGX due to ceramide.

### 2. Product-aware mask timers (commit d6cbc8f)
- Added `recommendedTime` and `extendedTime` to deep_condition product intelligence:
  - Elvive: 300s / 600s (5 min recommended, 10 min extended with heat cap)
  - OGX: 60s / 180s (1-minute mask, 3 min extended)
  - Dove: 300s / 600s
- `buildPlan` and `upgradeConditioner` now use `getProductTime()` helper instead of hardcoded 600s.
- `recordSwap` updates the timer when user picks a different mask from alternatives.

### 3. Fixed dual conditioning text (commit 27cbf58)
- Conditioner step no longer described as "brief sealant" — it's a full 5-min conditioning step.
- Updated instruction: "Full 5 min — amodimethicone selectively fills damaged cuticle gaps."
- Updated tip: explains why it's not redundant with the mask (different mechanism).
- Fixed misleading code comments.

### 4. Fixed stiff symptom double-application (commit 1c6233c)
- When `stiff` selected in Layer 3 (detailed), it was added to diagnosticSymptoms but also left in `contextOnly.detailed`. Could be processed by both DiagnosticEngine and AdjustmentEngine.
- Now removed from contextOnly when routed to diagnostics.

---

## What's Live vs Pending

- **Dev server (primary):** Served locally via Cauldron at `https://192.168.68.36:8443/hair-routine/` — commits are immediately live
- **GitHub Pages:** DO NOT push to origin. Stale/archive only.
- **Schema:** Version 14 (unchanged)
- **SW Cache:** v20

---

## Known Issues

1. **Brand name display scope unclear** — currently added to all product displays. User questioned "all? why" — may need to scope down to specific places only.
2. **`stiff` in symptomMap is dead code** — Layer 1 has no stiff button, so the symptomMap entry for 'stiff' never fires from quick observations. Harmless but unnecessary. The detailed layer check handles it correctly.
3. **Product-aware interventions untested on device** — from prior session
4. **Auto-scroll untested on device** — from prior session

---

## Decisions Made

- Conditioner ranking now uses actual ingredient lists (amodimethicone, ceramide np) rather than mechanism names. This is more reliable since mechanism names are inconsistent across products.
- Ceramide gets its own separate +15 bonus (not bundled with amodimethicone). This correctly differentiates Elvive (has both) from OGX (amodimethicone only).
- Mask timers are product-aware via `intelligence.recommendedTime`. Default fallback is 300s if not set.
- Dual conditioning: conditioner step is a full 5-min step, not a brief sealant. Both products do their own work.

---

## Next Session Priorities

### Needs user input:
1. **Brand name scope** — should brand names show everywhere (plan steps, alternatives, swap lists, quick-log buttons) or only in specific places? Current: everywhere.
2. **Dual conditioning order** — is mask always first, or does order depend on products?

### Still pending from prior sessions:
3. **iPad testing** — ranking changes, product-aware timers, dual conditioning display, dew point, no geolocation prompt
4. **Product deep dives** — everpure-glossing-mask, loreal-wonder-water, nym-curl-talk-gel in queue
5. **Re-score everpure-bond-shampoo.md**
6. **A6 adversarial pass**
7. **Verify-mode: research drift audit**

---

## Specs Status

| Spec | Status |
|------|--------|
| adaptive-hair-routine | Complete (original, partially superseded) |
| daily-plan | Complete (all tasks done) |
| product-intelligence | Partially implemented |
| diagnostic-adjustment-engine | Complete (all tasks done, deployed locally) |

---

## Architecture Notes

- **Geolocation:** Removed. Weather comes from `/api/location` (Cauldron) → Open-Meteo API. No browser permissions.
- **Conditioner ranking:** Uses `ingredients` array to check for amodimethicone (+30) and ceramide np (+15). Deep conditioners get -10 base penalty (upgrades, not default) but +20 in dry air (dewPoint < 35).
- **Product timers:** `intelligence.recommendedTime` (seconds) on deep_condition products. `getProductTime(productId, inventory)` helper returns it with 300s fallback.
- **Dual conditioning:** Mask step (deep_condition) inserted before conditioner step. Both get full timers. `recordSwap` updates timer when user picks different mask from alternatives.
- **Deployment:** Local only via Cauldron `static_apps`. Commits are live immediately. Do NOT push to origin.
