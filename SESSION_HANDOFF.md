# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 28)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 27 remains working
- Garnier Diamond Sleek added to inventory (primary tier, blowout context)
- Marc Anthony ingredient list corrected (was wrong — now verified from INCI)
- Seal state logic updated to trigger on either Marc Anthony OR Diamond Sleek
- Scoring logic updated for Diamond Sleek
- NYM gel interaction list updated to include Diamond Sleek blocking note

### What Was Done This Session (28)

1. **Product Recommendations Research** (`research/PRODUCT_RECOMMENDATIONS_FOR_HAIR_PROFILE.md`)
   - Full gap analysis of Mandy's product collection vs. stated concerns
   - 4 gaps identified, 4 products recommended
   - After discussion: 3 of 4 gaps already covered by existing inventory (silk pillowcase, Marc Anthony, Diamond Sleek)
   - Only remaining gap: Garnier Frizz Tamer Wand for TE regrowth flyaways (~$9)
   - Scored 90% (Excellent)

2. **Marc Anthony vs Diamond Sleek Comparison**
   - Both contain Polysilicone-29 (same heat-activated humidity barrier)
   - Marc Anthony: + Silicone Quaternium-8 (stronger film), spray, 6.7oz
   - Diamond Sleek: + hydrolyzed proteins + argan oil (lighter, more shine), spray, 4.6oz
   - Interchangeable — use whichever is open, finish one before starting the other
   - OR: alternate for A/B comparison (Mandy's preference)

3. **Inventory Update** (code changes to `index.html`)
   - Added `garnier-diamond-sleek` product entry
   - Fixed `marc-anthony-shield` ingredients (removed incorrect dimethicone/cyclopentasiloxane, added verified INCI)
   - Updated seal state activation: `products.includes('marc-anthony-shield') || products.includes('garnier-diamond-sleek')`
   - Updated scoring logic for both products
   - Added Diamond Sleek to step mapping and PRODUCTS constants
   - Added Diamond Sleek to NYM gel interaction array

4. **Research Scores Updated**
   - `research/RESEARCH_SCORES.md` — new row for Product Recommendations (90%)
   - `RESEARCH_SCORES.md` (global) — same

5. **Product Deep Dive Queue Updated**
   - Diamond Sleek added as #31 in Batch 5
   - Total products: 31

### Decisions Made This Session

- **Marc Anthony and Diamond Sleek are interchangeable** — same active (Polysilicone-29), same role. Don't use both on same wash day.
- **Mandy wants to alternate them for A/B comparison** — not rotation for its own sake, but to gather per-product rating data and determine which performs better. This needs a small code change to the blowout walkthrough (next session).
- **Silk pillowcase is sufficient** — no bonnet needed.
- **Only remaining product gap is Garnier Frizz Tamer Wand** (~$9) for TE regrowth flyaway management at hairline.
- **Virtue Frizz Block ($44) is not worth it** — INCI shows no identifiable humidity-barrier mechanism despite marketing claims.
- **Garnier Sleek & Stay is NOT owned** — was discussed but Mandy doesn't have it. Not needed since Marc Anthony + Diamond Sleek cover the same gap.

### Known Issues (carry to next session)

- **iOS silent mode mutes Web Audio** — expected platform behavior. Vibration still works as fallback.
- **Blowout walkthrough hardcodes Marc Anthony** — needs update to alternate between Marc Anthony and Diamond Sleek for A/B comparison.
- Session 25 commit still needs push (timer alert fix).

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
- **Walkthrough engine**, history, status bar, dew point auto-detection (permission-gated), recommendations, compensation logic, gel gap
- **Learn section** with science cards, frizz diagnostic
- **Accessibility** — ARIA, focus management, keyboard nav, touch targets
- **Geolocation** — only used if permission already granted, never prompts

---

## Schema

**Version:** 11 (Got2b ID unification)

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

---

## Repo State

- **Branch:** main
- **Latest commit:** chore: auto-commit uncommitted changes (Diamond Sleek inventory + research doc)
- **Pushed:** Needs push

---

## Next Session: Start Here

**Quick code fix (15 min):** Update blowout walkthrough to alternate between Marc Anthony and Diamond Sleek. Track which was used last in state, suggest the other next blowout day. Per-product ratings will accumulate data for comparison.

**Research (if preferred):** Product Deep Dive Pipeline — EverPure Pre-Shampoo + Garnier Color Repair Conditioner next.

**Or:** IngredientKB module (Product Intelligence Task 1.1) — the foundation for the intelligence system.
