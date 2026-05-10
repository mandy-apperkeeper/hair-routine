# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 23)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 21 remains working
- Nav buttons fit in single row on iPhone (flex:1, reduced padding)
- Geolocation never triggers permission prompt (checks permission state first, only uses if already granted)
- Adjust overlay is now multi-select (Layer 1 behaves like Layers 2/3 — toggle multiple states, hit Done)
- Soft/mushy option removed from adjust overlay (texture tracking belongs in post-wash feedback, not plan adjustment)
- Garnier Color Repair conditioner note updated to clarify rotation with use-up bottles

### What Was Done This Session (23)
1. **Dove product placement discussion** — Mandy asked why Dove Bond Repair and Intensive Repair conditioners are ranked low. Explained the silicone chemistry (dimethiconol = non-selective, temporary vs. amodimethicone = selective, cumulative, self-limiting). Confirmed no unique benefit for her hair type that other products don't do better.
2. **Created research-data-adherence.md steering file** — `.kiro/steering/research-data-adherence.md` (auto-inclusion on research files). Enforces that product tier changes require: specific mechanism + peer-reviewed source + delivery-format validation + not contradicted by existing findings. Prevents drift from evidence.
3. **Scoped Dove deep-dive research** — Defined 4 research angles: (a) dimethiconol benefits for coarse hair specifically, (b) SH-Polypeptide-121 efficacy at low concentration in rinse-off, (c) non-selective coating for frizz management, (d) full formulation analysis beyond hero ingredients. NOT YET EXECUTED — queued for next session.
4. **Identified steering improvement** — Data adherence rules should be folded into the global `deep-dive-auto.md` protocol (not just project-specific). Next session: add "Data Adherence" section to global research protocol, keep hair-routine version as domain-specific extension.

### What Was Done Session 22
1. **Fixed nav buttons overflowing on iPhone** — removed flex-wrap, added flex:1 so all 5 buttons share width equally
2. **Fixed geolocation prompt blocking the app** — now checks `navigator.permissions.query()` first; only calls geolocation if permission is already granted. Never shows the browser prompt.
3. **Made adjust overlay multi-select** — Layer 1 (hair state) is now multi-select like Layers 2/3. Removed auto-close behavior. Toast shows on Done with all selections summarized.
4. **Added then removed soft/limp/mushy option** — through conversation, determined that texture observation is a spectrum and belongs in post-wash feedback (long-term tracking), not in plan adjustment (today's changes).
5. **Updated Garnier conditioner note** — changed from "Use every wash" to "Best conditioner — rotate with use-up bottles until they're gone"

### Known Issues (carry to next session)

#### iPhone Safari caching — RESOLVED
The iPhone is now loading the current version. The previous session's caching issue resolved itself (likely iCloud Private Relay cache expired).

### What's NOT Done (carry forward)

#### DOVE DEEP-DIVE RESEARCH (next priority — research)
**Question:** Do Dove Bond Strength Repair and Intensive Repair conditioners offer any meaningful benefits for 2C-3A coarse/thick/dry hair that the current research undervalues?

**Angles to investigate:**
1. Dimethiconol/silsesquioxane — is a heavier non-selective film *preferable* for coarse hair (more cuticle layers, more surface area)?
2. SH-Polypeptide-121 — actual MW, penetration data, efficacy at low concentration in rinse-off format
3. Non-selective coating for frizz — amodimethicone targets damage sites, but frizz happens on healthy cuticle too. Does non-selective coating help?
4. Full formulation — what else is in these products beyond the hero ingredients?

**Constraint:** `research-data-adherence.md` steering file is active. Any tier change requires mechanism + source + delivery validation.

**Protocol:** Use `deep-dive-auto.md` (autonomous research flow). Score with v2 rubric.

#### FOLD DATA ADHERENCE INTO GLOBAL PROTOCOL
- Add "Data Adherence" section to `~/.kiro/steering/deep-dive-auto.md`
- Principle: no recommendation changes without mechanism + source + delivery-format validation
- Keep hair-routine's `research-data-adherence.md` as domain-specific extension (hair-specific tier criteria)

#### USE-UP PRODUCT ROTATION (next priority — code)
**What Mandy wants:** The Daily Plan should automatically cycle use-up products into the routine, compensated by keeping other steps at high-quality products. Not manual swapping — the plan should do this for her.

**Design approach (Mandy's direction):** Use the research files to build balanced product combinations. When a use-up product is assigned to one step, the other steps should use primary-tier products to maintain overall wash quality.

**What this needs:**
- Read research files (product mechanisms, interactions, delivery systems) to understand which products compensate for which
- Define "balanced combinations" — sets of products across all steps where weak products in one slot are offset by strong products in others
- Modify `PlanGenerator.buildPlan()` to rotate through these combinations rather than always defaulting to primary products
- Track rotation state (which combination was used last)
- Respect the established rule: never RECOMMEND Dove, but DO use it up by cycling it in with compensation

**Research files to consult:**
- `research/` folder — 5-phase product relationship research
- `HAIR_CONSULTATION_HANDOFF.md` — product mechanisms and interactions
- `HAIR_SCIENCE_VERIFICATION_REPORT.md` — verified science claims
- Product `intelligence` metadata already in inventory (mechanisms, outcomes, interactions)

**Use-up conditioners to cycle:**
- `dove-bond-conditioner` — Dove Bond Strength Repair (dimethiconol, not targeted)
- `dove-intensive-conditioner` — Dove Intensive Repair (weakest conditioner)

**Compensation principle:** When Dove conditioner is assigned, ensure leave-in (L'Oréal 21-in-1 with PQ-37) and other steps are primary-tier to maintain overall protection.

#### Post-wash texture/curl retention tracking
- Mandy's core concerns: frizz, dryness, difficulty with styling/curl retention
- Hairstylist attributed styling difficulty to dryness
- Texture is a spectrum, not a binary — needs a different UI than toggle buttons
- Future feature: track how well style holds over time to see if routine is improving things

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
- **Adjust overlay is multi-select** — all three layers use toggle behavior. No auto-close on Layer 1.
- **Texture/softness is NOT a plan adjustment** — it's a long-term tracking concern for post-wash feedback.
- **Geolocation never prompts** — only uses if permission already granted via Permissions API check.
- **Use-up rotation should be automatic** — the plan cycles use-up products in with compensation, not manual swapping.
- **Mandy's core hair concerns:** frizz, dryness, reduced curl retention/styling hold. Hairstylist attributed to dryness.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~7200+ lines) |
| `hair-sw.js` | Service worker v8 |
| `manifest.json` | PWA manifest |
| `icon-192.svg`, `icon-512.svg` | App icons |
| `research/` | 5-phase product relationship research |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference |
| `HAIR_SCIENCE_VERIFICATION_REPORT.md` | Verified science claims |
| `.kiro/specs/daily-plan/` | Daily Plan spec (design + tasks) |
| `.kiro/specs/product-intelligence/` | Intelligence system spec |

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
| 23 | **Dove placement discussion, research-data-adherence steering, deep-dive scoped** | Complete |

---

## Repo State

- **Branch:** main
- **Latest commit:** `5cc8726` — Clarify Garnier conditioner note
- **Pushed:** Yes
- **GitHub Pages:** Serving current version (iPhone caching resolved)
