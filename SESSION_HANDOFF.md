# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 30)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 29 remains working
- A/B heat protectant alternation (blowout only)
- Use-up product rotation (every 3rd wash)
- Per-product experience & results ratings (inventory view)

### What Was Done This Session (30)

1. **NEXT_STEPS.md cleanup** — Marked per-product ratings as complete (was stale, already built in Session 18). Kept pending integration items (Daily Plan ranking + Intelligence insights).

2. **Quick-log pre-selection: attempted and reverted**
   - Built Task 4.2 (pre-select products from last wash) — full implementation with count badges and hint text
   - **Mandy rejected it:** pre-selecting based on recency biases toward repeating the same routine and harms the use-up rotation system
   - Reverted all code changes
   - Updated spec: Task 4.2 deferred to Recommendation Engine (8.1-8.2) — pre-selection should be driven by BeliefTracker posteriors + product ratings + conditions, not recency

3. **Confirmed already-done items:**
   - Use-up rotation: fully implemented (UseUpRotation module, schema v12, wired into plan generator)
   - Per-product ratings: fully implemented (Session 18)
   - Data adherence in global protocol: already done (deep-dive-auto.md has the section)

### Decisions Made This Session

- **No recency-based pre-selection in quick-log** — it harms rotation and biases toward repetition. Pre-selection belongs in the Recommendation Engine where it can be intelligence-driven.
- **Task 4.2 deferred** to Tasks 8.1-8.2 (Recommendation Engine) — the right time to add smart pre-selection is when BeliefTracker data can drive it.

### Known Issues (carry to next session)

- **iOS silent mode mutes Web Audio** — expected platform behavior. Vibration still works as fallback.
- **everpure-bond-shampoo.md** has a different version on disk than what was scored. The v2 scorecard needs to be re-applied to the current file content.

---

## What Changed in Code

- `index.html` — no net changes (pre-selection was added then reverted)
- `.kiro/specs/product-intelligence/tasks.md` — Task 4.2 updated to deferred status with rationale
- `NEXT_STEPS.md` — Per-product ratings section marked complete

---

## What's NOT Done (carry forward)

#### PRODUCT DEEP DIVE PIPELINE (research)
**Priority order:**
1. `garnier-color-repair-cond` — Full deep dive (HIGHEST PRIORITY — adversarial A4 shows it may be co-primary or better than EverPure conditioner)
2. Re-score `everpure-bond-shampoo.md` (file was overwritten, scorecard lost)
3. `everpure-glossing-mask` — Glossing 5-Min Lamination Mask deep dive
4. `loreal-wonder-water` — 8 Second Wonder Water deep dive

**Recently completed (this session):**
- `everpure-bond-pre` — ✅ DONE (Supporting Cast confirmed; same base as Garnier Hair Filler; citric acid mechanism peer-reviewed)
- `everpure-clarifying` — ✅ DONE (Primary Rotation confirmed; AOS sulfonate + salicylic acid)

**Queue file:** `research/PRODUCT_DEEP_DIVE_QUEUE.md` has full tracking (10/31 complete).

#### FOLD DATA ADHERENCE INTO GLOBAL PROTOCOL ✅ (already done)

#### PRODUCT INTELLIGENCE (next code build)
- Task 4.3: Quick-add for unlisted products in quick-log
- Tasks 8.1-8.4: Recommendation Engine (includes smart pre-selection)
- Tasks 10.1-10.3: Product Discovery (DiscoveryParser + UI + Open Beauty Facts)
- Tasks 12.1-12.4: Integration & Polish

#### Other carry-forward items
- Daily Plan polish
- Data persistence beyond localStorage (cloud sync/backup)

---

## Full Feature List (live)
- **Daily Plan view** — auto-generated plan, scrollable steps, multi-select adjust overlay, frizzy=Got2b swap, "no wash needed" screen, offline indicator, condensed checklist, end-of-plan rating, lane override
- **PWA support** — service worker v8 (network-first HTML, stale-while-revalidate API), manifest, install capability, update banner, one-time SW migration
- **7-group step-based quick-log** with sub-menus + heat cap badges + multi-group products
- **Product inventory** (31 products) with full intelligence metadata + per-product ratings (experience + results)
- **Post-wash attribution card**
- **Walkthrough engine**, history, status bar, dew point auto-detection (permission-gated), recommendations, compensation logic, gel gap, **A/B heat protectant alternation**
- **Use-up rotation** — every 3rd wash assigns a use-up conditioner with compensation note
- **Learn section** with science cards, frizz diagnostic
- **Accessibility** — ARIA, focus management, keyboard nav, touch targets
- **Geolocation** — only used if permission already granted, never prompts

---

## Schema

**Version:** 12 (unchanged this session)

---

## Cumulative Decisions (Do Not Revisit)

All previous decisions remain, plus:
- **No recency-based pre-selection** — pre-selection in quick-log must be intelligence-driven (BeliefTracker + conditions), not recency-driven. Recency harms rotation.

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
| 29 | Blowout A/B alternation implemented + curly-day heat protection discussed | Complete |
| 30 | **Doc cleanup, pre-selection attempted/reverted (harms rotation), task 4.2 deferred** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** Needs commit (task spec update + NEXT_STEPS cleanup)
- **Pushed:** Needs push after commit

---

## Next Session: Start Here

**Research (if preferred):** Garnier Color Repair Conditioner deep dive — highest priority, adversarial finding suggests it may match or beat EverPure conditioner.

**Code:** Recommendation Engine (Tasks 8.1-8.4) — domain rules + data-driven product suggestions + conflict warnings + pre-wash card UI. This is the next major intelligence feature and will eventually power smart pre-selection.

**Smaller code:** Task 4.3 — quick-add for unlisted products in quick-log (self-contained, no dependencies).
