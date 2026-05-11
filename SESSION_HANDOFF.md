# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 26)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 25 remains working
- **Seal state indicator** in status bar — shows "🔒 X washes left" when seal is active, hidden when inactive
- **Export reminder card** — appears when 5+ events logged and 30+ days since last export (or never exported). Dismissable per month. "Export now" triggers JSON download.

### What Was Done This Session (26)

1. **Committed seal state indicator + export reminder** — These were uncommitted changes from Session 25. Auto-committed and pushed.
2. **Orientation / next-build assessment** — Reviewed all specs, handoffs, and project state to determine next code build.

### What Was NOT Built (session was orientation-only)

No new code was written this session. The session was spent assessing what's next.

### Decisions Made This Session

- **Next code build is Product Intelligence** — specifically Task 1.1 (IngredientKB module, ~40-60KB of ingredient data). Everything else in the intelligence spec depends on it.
- **Product Deep Dive Pipeline remains the research priority** — but that's research writing, not code.
- **Hair photo upload needs its own spec** — it's in CHANGE_LOG as high priority but is a major new capability (AI integration, new UI, new data flow).

### Known Issues (carry to next session)

- **iOS silent mode mutes Web Audio** — expected platform behavior. Vibration still works as fallback.
- If the app is fully backgrounded when timer expires, the chime plays when you return to the app. No way to play audio from a backgrounded web app without a native wrapper.

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
| 24 | Product deep dive pipeline: queue, template, execution plan | Complete |
| 25 | **Timer alert sound fix — Web Audio chime + Audible compatibility** | Complete |
| 26 | **Orientation — seal indicator + export reminder committed, next-build assessed** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** chore: auto-commit uncommitted changes (seal indicator + export reminder)
- **Pushed:** Yes

---

## Next Session: Start Here

**Code build:** Product Intelligence Task 1.1 — IngredientKB module. This is the foundation for the entire intelligence system. ~100 ingredients as a JS object literal embedded in `index.html`. Sources: `HAIR_CONSULTATION_HANDOFF.md`, `research/PHASE1_INGREDIENT_FUNCTION_MAP.md`, INCIDecoder.

**Research (if preferred over code):** Product Deep Dive Pipeline — 3 Dove products next (INCI already pulled). Protocol in `deep-dive-auto.md` + `research-data-adherence.md`.

**Quick alternative:** Hair photo upload spec (high priority in CHANGE_LOG, needs its own spec before building).
