# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 29)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 28 remains working
- **IngredientKB module** — 84 hair care ingredients, 17 functional roles, lookup functions (getByRole, getByName, fuzzyMatch, analyzeIngredientList), ~57KB
- **BeliefTracker module** — Bayesian Normal-Normal conjugate belief system, wired into all wash event save paths + deferred rating
- **Schema v13** — adds state.beliefs (initialized from product outcomes), state.discoveredInteractions, and ingredients arrays to inventory products
- **Ingredients arrays** on all 31 inventory products (97 INCI references, all validated against KB)

### What Was Done This Session (29)

1. **Product Intelligence Task 1.1** — IngredientKB module (84 ingredients, 17 roles, fuzzy matching, ingredient list analysis)
2. **Product Intelligence Task 1.2** — Added ingredients arrays to all 31 DEFAULT_INVENTORY products
3. **Product Intelligence Task 1.3** — Schema v12→v13 migration (beliefs, discoveredInteractions, ingredients)
4. **Product Intelligence Task 2.1** — BeliefTracker module (initBeliefs, updateBeliefs, getBelief, getProductBeliefs, getConfidence, getCredibleInterval, checkDivergence)
5. **Product Intelligence Task 2.2** — Wired BeliefTracker into all 3 wash event save paths + deferred rating
6. **Task 3 Checkpoint** — Verified data layer complete and working
7. **V2 Rescore Comparison** — Completed and updated RESEARCH_SCORES.md with v2 composite scores

### Decisions Made This Session

- **Silicone Quaternium-8 added to KB** — present in Marc Anthony shield
- **Rating normalization: 1-5 → 0-1** for belief updates (1→0, 5→1.0)
- **BeliefTracker placed after InventoryManager** in module order
- **Prior variance 2.0, observation variance 1.0** — wide priors that converge after ~10 observations

### Known Issues (carry to next session)

- **iOS silent mode mutes Web Audio** — expected platform behavior. Vibration still works as fallback.
- **Blowout walkthrough hardcodes Marc Anthony** — needs update to alternate between Marc Anthony and Diamond Sleek for A/B comparison.
- **File size: 486KB** — still fine for single-file architecture but worth monitoring.

### What's NOT Done (carry forward)

#### IMMEDIATE NEXT: Blowout Walkthrough A/B Alternation
- The blowout walkthrough step currently hardcodes `productId: 'marc-anthony-shield'`
- Needs logic to alternate between Marc Anthony and Diamond Sleek on successive blowout days
- Per-product ratings already exist — this just needs the walkthrough to suggest the other product next time
- Small change: track which was used last, suggest the other

#### PRODUCT DEEP DIVE PIPELINE (research)
**Next batch:** EverPure Pre-Shampoo + Garnier Color Repair Conditioner
**Queue file:** `research/PRODUCT_DEEP_DIVE_QUEUE.md` has full tracking (10/31 complete).

#### FOLD DATA ADHERENCE INTO GLOBAL PROTOCOL
- Add "Data Adherence" section to `~/.kiro/steering/deep-dive-auto.md`

#### USE-UP PRODUCT ROTATION (code — after research pipeline progresses)
Design approach scoped in Session 22.

#### PRODUCT INTELLIGENCE (next code build — Tasks 1-3 DONE)
- Tasks 1.1-1.3, 2.1-2.2 complete (IngredientKB + BeliefTracker + schema v13)
- **Next:** Task 6 — AttributionEngine (mechanism-based attribution from day 1)
- Then: Task 8 — RecommendationEngine (domain rules + Bayesian recommendations)
- Then: Task 10 — DiscoveryParser (ingredient list parsing for new products)

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
- **Walkthrough engine**, history, status bar, dew point auto-detection (permission-gated), recommendations, compensation logic, gel gap
- **Learn section** with science cards, frizz diagnostic
- **Accessibility** — ARIA, focus management, keyboard nav, touch targets
- **Geolocation** — only used if permission already granted, never prompts

---

## Schema

**Version:** 13 (beliefs + discoveredInteractions + ingredients)

---

## Cumulative Decisions (Do Not Revisit)

All previous decisions remain, plus:
- **Marc Anthony and Diamond Sleek are interchangeable** — same Polysilicone-29 mechanism, same tier, same step. Alternate for A/B comparison.
- **Garnier Sleek & Stay is NOT owned** — don't recommend purchasing (existing products cover the gap).
- **Virtue Frizz Block is overpriced** — no identifiable humidity-barrier mechanism in INCI despite $44 price.
- **Only remaining product gap: Garnier Frizz Tamer Wand** (~$9) for TE regrowth flyaways.
- **Silk pillowcase is sufficient nighttime protection** — no bonnet needed.

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
| `research/PRODUCT_RECOMMENDATIONS_FOR_HAIR_PROFILE.md` | **NEW** — gap analysis + product recs for hair profile |
| `research/products/` | Individual product deep dive documents |
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
| 28 | **Product recs research + Diamond Sleek added to inventory + A/B comparison scoped** | Complete |
| 29 | **Product Intelligence data layer: IngredientKB + BeliefTracker + schema v13** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** chore: auto-commit uncommitted changes (Diamond Sleek inventory + research doc)
- **Pushed:** Needs push

---

## Next Session: Start Here

**Quick code fix (15 min):** Update blowout walkthrough to alternate between Marc Anthony and Diamond Sleek for A/B comparison.

**Product Intelligence (next major build):** Task 6 — AttributionEngine. Mechanism-based attribution (explains which products contributed to which outcomes after a wash). Uses IngredientKB data. Available from day 1 (no user data needed). Post-wash card already exists — just needs the engine behind it.

**Research (if preferred):** Product Deep Dive Pipeline — EverPure Pre-Shampoo + Garnier Color Repair Conditioner next.
