# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 29)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 28 remains working
- Blowout walkthrough now alternates between Marc Anthony and Diamond Sleek for A/B comparison

### What Was Done This Session (29)

1. **Blowout Walkthrough A/B Alternation** (code changes to `index.html`)
   - Added `lastHeatProtectant: null` to `DEFAULT_STATE.settings`
   - Added `getNextHeatProtectant()` helper function — reads state, returns the alternate product
   - Updated blowout steps array (step 7) to use `getNextHeatProtectant()` instead of hardcoded Marc Anthony
   - Updated dynamic heat protection step (lane override to blowout) — same change
   - Added tracking in all 3 save paths (`savePlanWashEvent`, `saveWashEventAndReturn`, `submitQuickLog`) — records which heat protectant was actually used after each blowout event
   - Logic: first blowout defaults to Marc Anthony (null state). After logging, state records the product used. Next blowout suggests the other. Respects manual swaps during walkthrough.

2. **Discussion: Heat Protection on Curly Days**
   - Confirmed diffusing IS listed as an option on curly days (step 9)
   - Decided NOT to add heat protection to curly lane because:
     - Gel cast (PQ-69) serves as the humidity barrier on curly days
     - Marc Anthony/Diamond Sleek may interfere with gel cast formation (interaction data already in app)
     - Mandy hasn't done enough curly days to have experience data yet
   - Revisit if diffusing becomes regular and frizz issues emerge that gel alone doesn't handle

### Decisions Made This Session

- **A/B alternation is blowout-only** — curly days don't need heat protectant because gel cast handles humidity protection and the two products potentially conflict.
- **Default first suggestion is Marc Anthony** (when no history exists).
- **Swaps during walkthrough are respected** — if user manually swaps to the other product, that's what gets recorded for alternation purposes.

### Known Issues (carry to next session)

- **iOS silent mode mutes Web Audio** — expected platform behavior. Vibration still works as fallback.
- Session 25 commit still needs push (timer alert fix).

### What's NOT Done (carry forward)

#### PRODUCT DEEP DIVE PIPELINE (research)
**Next batch:** EverPure Pre-Shampoo + Garnier Color Repair Conditioner
**Queue file:** `research/PRODUCT_DEEP_DIVE_QUEUE.md` has full tracking (10/31 complete).

#### FOLD DATA ADHERENCE INTO GLOBAL PROTOCOL
- Add "Data Adherence" section to `~/.kiro/steering/deep-dive-auto.md`

#### USE-UP PRODUCT ROTATION (code — after research pipeline progresses)
Design approach scoped in Session 22.

#### PRODUCT INTELLIGENCE (next code build)
- Task 1.1: IngredientKB module (~40-60KB ingredient data)

#### Other carry-forward items
- Daily Plan polish
- Data persistence beyond localStorage (cloud sync/backup)
- Hair photo upload (needs its own spec)

---

## Full Feature List (live)
- **Daily Plan view** — auto-generated plan, scrollable steps, multi-select adjust overlay, frizzy=Got2b swap, "no wash needed" screen, offline indicator, condensed checklist, end-of-plan rating, lane override
- **PWA support** — service worker v8 (network-first HTML, stale-while-revalidate API), manifest, install capability, update banner, one-time SW migration
- **7-group step-based quick-log** with sub-menus + heat cap badges + multi-group products
- **Product inventory** (31 products) with full intelligence metadata + per-product ratings
- **Post-wash attribution card**
- **Walkthrough engine**, history, status bar, dew point auto-detection (permission-gated), recommendations, compensation logic, gel gap, **A/B heat protectant alternation**
- **Learn section** with science cards, frizz diagnostic
- **Accessibility** — ARIA, focus management, keyboard nav, touch targets
- **Geolocation** — only used if permission already granted, never prompts

---

## Schema

**Version:** 12 (unchanged — `lastHeatProtectant` added to settings, no migration needed since it defaults to null)

---

## Cumulative Decisions (Do Not Revisit)

All previous decisions remain, plus:
- **A/B alternation is blowout-only** — gel cast handles curly days, heat protectant and gel may conflict.
- **First blowout defaults to Marc Anthony** when no history exists.
- **Walkthrough swaps are respected** in alternation tracking.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~8400+ lines) |
| `hair-sw.js` | Service worker v8 |
| `manifest.json` | PWA manifest |
| `icon-192.svg`, `icon-512.svg` | App icons |
| `research/` | 5-phase product relationship research |
| `research/PRODUCT_DEEP_DIVE_QUEUE.md` | Pipeline tracking for all 31 product deep dives |
| `research/PRODUCT_RECOMMENDATIONS_FOR_HAIR_PROFILE.md` | Gap analysis + product recs for hair profile |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference |
| `HAIR_SCIENCE_VERIFICATION_REPORT.md` | Verified science claims |
| `.kiro/specs/daily-plan/` | Daily Plan spec (design + tasks) |
| `.kiro/specs/product-intelligence/` | Intelligence system spec |
| `.kiro/steering/research-data-adherence.md` | Research constraint rules |

---

## Session History

| Session | What | Status |
|---------|------|--------|
| 1-8 | Core app build | Complete |
| 9 | Product inventory | Complete |
| 10 | Logging UX overhaul | Complete |
| 11-16 | Intelligence + step reorg + research | Complete |
| 17 | Doc sync, Daily Plan tasks.md, walkthrough fixes | Complete |
| 18 | Per-product ratings | Complete |
| 19 | PWA + Daily Plan + UX polish | Complete |
| 20 | Daily Plan polish: adjust UX, frizzy upgrade, no-wash, a11y | Complete |
| 21 | iPhone Safari debugging — narrowed to device-level proxy/relay | Complete |
| 22 | Nav fix, geolocation fix, multi-select adjust, use-up rotation scoped | Complete |
| 23 | Dove placement discussion, research-data-adherence steering, deep-dive scoped | Complete |
| 24 | Product deep dive pipeline: queue, template, execution plan | Complete |
| 25 | Timer alert sound fix — Web Audio chime + Audible compatibility | Complete |
| 26 | Orientation, seal state commit, next-build assessment | Complete |
| 27 | Product deep dives: EverPure shampoo + conditioner + 21-in-1 leave-in | Complete |
| 28 | Product recs research + Diamond Sleek added to inventory + A/B comparison scoped | Complete |
| 29 | **Blowout A/B alternation implemented + curly-day heat protection discussed** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** Needs commit (A/B alternation code changes)
- **Pushed:** Needs push

---

## Next Session: Start Here

**Research (if preferred):** Product Deep Dive Pipeline — EverPure Pre-Shampoo + Garnier Color Repair Conditioner next.

**Or:** IngredientKB module (Product Intelligence Task 1.1) — the foundation for the intelligence system.

**Or:** Use-up product rotation implementation (scoped in Session 22).
