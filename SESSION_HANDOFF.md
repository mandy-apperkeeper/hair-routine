# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 24)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 22 remains working (nav fix, geolocation fix, multi-select adjust)
- Garnier Color Repair conditioner note updated to clarify rotation with use-up bottles

### What Was Done This Session (24)

1. **Product Deep Dive Pipeline designed** — Systematic plan to run deep-dive-auto research on every product in the inventory (30 products). Each product gets its own standalone research document with full formulation analysis + practical education section.
2. **Queue file created** — `research/PRODUCT_DEEP_DIVE_QUEUE.md` tracks all 30 products with status, priority order, batch groupings, and pre-fetched INCI data for next 3 products.
3. **Output template finalized** — Each doc includes: INCI analysis, mechanism assessment, delivery validation, efficacy for hair profile, comparison to alternatives, tier validation, AND a "Practical Education" section covering: why you're using it, how to know it's working, how to know it's NOT working, why this over alternatives, when to reach for something else, and what to look for in replacements.
4. **INCI data pre-fetched** for dove-bond-shampoo, dove-intensive-shampoo, and dove-10in1-serum (saved in queue file).
5. **Key finding noted:** Dove 10-in-1 serum contains aminopropyl dimethicone (amine-functionalized, same family as amodimethicone) — likely why it earned supporting tier. Full analysis needed.
6. **Mandy clarified educational intent:** "I want to know why I'm using something, how I can know it's working, why other products are better or worse, when I might want to opt for something else." This drives the Practical Education section structure.

### Decisions Made This Session

- **1 product = 1 document = 1 scorecard** — no batched documents
- **Same depth for all tiers** including use-up (understanding WHY something is inferior is educational)
- **Tone:** science-literate plain language for Mandy as user, not builder-facing jargon
- **File convention:** `research/products/[product-id].md`
- **Existing Dove deep dive:** leave as-is, create separate per-product docs for remaining Dove products
- **Research sessions:** may cover 2-3 related products (shared source lookups) but each gets its own full write-up
- **Priority:** remaining Dove → primary tier daily drivers → supporting → use-up

### Known Issues (carry to next session)

None new.

### What's NOT Done (carry forward)

#### PRODUCT DEEP DIVE PIPELINE (next priority — research)
**Start with:** 3 remaining Dove products (INCI already pulled):
1. `dove-bond-shampoo` — Bond Strength Repair Shampoo
2. `dove-intensive-shampoo` — Intensive Repair Shampoo
3. `dove-10in1-serum` — Bond Repair 10-in-1 Serum

**Then:** L'Oréal 21-in-1 Leave-In + Garnier Color Repair Conditioner (daily drivers, highest educational value)

**Protocol:** deep-dive-auto.md + research-data-adherence.md. Score with v2 rubric. One product at a time.

**Queue file:** `research/PRODUCT_DEEP_DIVE_QUEUE.md` has full tracking, INCI data, and template.

#### FOLD DATA ADHERENCE INTO GLOBAL PROTOCOL
- Add "Data Adherence" section to `~/.kiro/steering/deep-dive-auto.md`
- Keep hair-routine's `research-data-adherence.md` as domain-specific extension

#### USE-UP PRODUCT ROTATION (code — after research pipeline progresses)
Design approach scoped in Session 22. Needs research docs to inform compensation logic.

#### Post-wash texture/curl retention tracking
Future feature — scoped in Session 22.

#### Other carry-forward items
- Daily Plan polish, Product Intelligence system
- Data persistence beyond localStorage (cloud sync/backup)
- Service worker already registered and working (v8)

---

## Full Feature List (live)
- **Daily Plan view** — auto-generated plan, scrollable steps, multi-select adjust overlay, frizzy=Got2b swap, "no wash needed" screen, offline indicator, condensed checklist, end-of-plan rating, lane override
- **PWA support** — service worker v8 (network-first HTML, stale-while-revalidate API), manifest, install capability, update banner, one-time SW migration
- **7-group step-based quick-log** with sub-menus + heat cap badges + multi-group products
- **Product inventory** (30 products) with full intelligence metadata + per-product ratings
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
- **Product deep dives are 1:1** — one product per document, no batching output
- **Same research depth for all tiers** — use-up products get full analysis too
- **Educational content tone:** science-literate plain language for Mandy as user
- **Practical Education section answers:** why using it, how to know it works, how to know it doesn't, why this over alternatives, when to use something else, what to look for in replacements
- **Adjust overlay is multi-select** — all three layers use toggle behavior. No auto-close on Layer 1.
- **Texture/softness is NOT a plan adjustment** — it's a long-term tracking concern for post-wash feedback.
- **Geolocation never prompts** — only uses if permission already granted via Permissions API check.
- **Use-up rotation should be automatic** — the plan cycles use-up products in with compensation, not manual swapping.
- **Mandy's core hair concerns:** frizz, dryness, reduced curl retention/styling hold. Hairstylist attributed to dryness.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~8300+ lines) |
| `hair-sw.js` | Service worker v8 |
| `manifest.json` | PWA manifest |
| `icon-192.svg`, `icon-512.svg` | App icons |
| `research/` | 5-phase product relationship research |
| `research/PRODUCT_DEEP_DIVE_QUEUE.md` | **NEW** — pipeline tracking for all 30 product deep dives |
| `research/DOVE_DEEP_DIVE.md` | Dove conditioner/mask deep dive (complete) |
| `research/products/` | **NEW** — individual product deep dive documents (to be created) |
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
| 24 | **Product deep dive pipeline: queue, template, execution plan** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** Product deep dive queue + updated handoff
- **Pushed:** Needs push
