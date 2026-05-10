# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 20)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- **Schema version 10** (per-product experience & results ratings)
- **Daily Plan view** — replaces lane-selection on landing page for users with history
  - Auto-generated plan based on dew point, history, seal state, timing
  - Scrollable step list — no first phase header (starts directly with steps)
  - Shows both step name AND product brand name on each step
  - [ℹ] info popup with "Learn more" link to science cards
  - [swap] button for steps with alternatives in inventory
  - Science badges are tappable — link directly to Learn section cards
  - Timer buttons prominent ("⏱ 5 min — tap to start"), counts down cleanly in whole seconds
  - Adjust overlay (3-layer progressive disclosure) — **auto-closes on Layer 1 selection with confirmation toast**
  - **Changed steps highlighted with gold border animation after adjustment**
  - **Frizzy adjustment actually swaps NYM gel → Got2b** (not just a tip)
  - **"No wash needed" minimal screen** when washed today (with Refresh/Wash Anyway buttons)
  - **Offline indicator** ("☁️ Weather unavailable") in plan subtitle
  - Condensed checklist toggle (remembers preference)
  - End-of-plan rating + deferred next-day rating
  - Lane override ("Something else?" button)
  - Compact top spacing (reduced body padding, nav, tracker, headers)
- **PWA support** — service worker (stale-while-revalidate + network-first for API), manifest.json, Apple meta tags, install capability, update banner
- **Dew point auto-detection on app load**
- **Status tracker** renamed: "Protein" → "Bond Repair" for clarity
- **Learn section** — new cards: Coconut Oil (cortex penetration), Bond Repair, Lamellar Conditioning
- Quick-log, product inventory (30 products), walkthrough engine, history, compensation, gel gap

### What Was Done This Session (20)
1. **Adjust overlay UX fix** — auto-closes after Layer 1 selection, shows confirmation toast ("🌊 Adjusted for frizz" etc.)
2. **Changed step highlighting** — steps modified by adjustment get gold border animation (2s fade)
3. **Frizzy adjustment upgraded** — actually swaps NYM Curl Talk gel to Got2b Ultra Glued (PQ-69 without glycerin) instead of just adding a tip
4. **"No wash needed" screen** — shows when washed today and suggestion is refresh. Minimal card with "Refresh plan" and "Wash anyway" buttons
5. **Offline indicator** — "☁️ Weather unavailable" in plan subtitle when dew point is null
6. **Accessibility improvements** — role="list"/role="listitem" on plan steps, aria-labels, Escape key closes overlay, focus management, aria-live on toast
7. **Service worker v7** — switched HTML to network-first (always fresh when online), added controllerchange auto-reload
8. **Dew point caching** — localStorage cache for 3 hours to avoid repeated geolocation prompts
9. **Compact UI** — nav buttons (48→36px), header, subtitle, tracker, plan header, first-use buttons (64→48px), welcome section, tip boxes all tightened
10. **Debugging Safari caching issue** — unresolved, see Known Issues

### Known Issues (carry to next session)

#### iPhone Safari not loading latest version — FIXED
- Added one-time SW migration: on first load, unregisters ALL old service workers, clears all hair-routine caches, re-registers fresh SW, then reloads
- Uses localStorage flag (`sw-force-refresh-v7`) so it only runs once per device
- After migration, normal SW registration resumes with periodic update checks
- Service worker bumped to v8

#### Service worker caching friction (partially fixed)
- Switched to network-first for HTML (v7) — new visits will always get fresh content
- Added `controllerchange` auto-reload — when new SW takes control, page reloads automatically
- The problem is the OLD SW (v5/v6) on existing devices won't update until it can fetch the new SW file

#### Got2b product ID inconsistency — FIXED
- Unified to `got2b-ultra-glued` everywhere (inventory, step map, walkthrough, daily plan)
- Schema v11 migration renames `got2b-gel` → `got2b-ultra-glued` in stored inventory and event history

### What's NOT Done (carry forward)

#### Daily Plan Polish (remaining)
- Remove dead old UI code (old lane-selection, old walkthrough nav) — deferred: still needed for first-use flow
- Full end-to-end test on iPad viewport
- Verify all existing features still work (history, products, settings, export/import)

#### Product Intelligence System
- IngredientKB + BeliefTracker → smarter product ranking
- See `.kiro/specs/product-intelligence/`

#### Research Documentation
- Write up coconut oil and OGX oil findings into `research/`

---

## Schema

**Version:** 11 (Got2b ID unification)

---

## Cumulative Decisions (Do Not Revisit)

All previous decisions remain. New this session:
- **Adjust overlay auto-close:** Layer 1 selection closes overlay immediately (no need to tap "Done")
- **Confirmation toast:** Green pill at bottom of screen, 2.5s duration, aria-live for screen readers
- **Frizzy = Got2b swap:** Not just a tip — actually replaces NYM gel in the plan with Got2b Ultra Glued
- **"No wash needed" threshold:** Shows when washDays === 0 AND suggestion is refresh

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~7200+ lines) |
| `hair-sw.js` | Service worker (cache v6) |
| `manifest.json` | PWA manifest |
| `icon-192.svg`, `icon-512.svg` | App icons |
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
| 20 | **Daily Plan polish: adjust UX, frizzy upgrade, no-wash, a11y** | Complete |

---

## Repo State

- **Branch:** main
- **Pushed:** All code changes pushed (commit `4daef9b`)
- **GitHub Pages:** Verified deployed and serving latest code (confirmed via API fetch from ben-o-matic)
- **UNRESOLVED:** Ben's iPhone Safari is showing an old cached version despite cache-buster URL, private tab, and clearing site data. The server IS serving the correct file (verified programmatically). This is a client-side caching issue that needs debugging in the next session — possibly iOS Safari's aggressive back-forward cache, or a DNS-level cache.
- **Uncommitted:** SESSION_HANDOFF.md, NEXT_STEPS.md, .kiro/steering/session-context.md, plus deletions from prior session
- **Local HTTP server** running on port 8080 (python) — can be used to bypass GitHub Pages caching for testing
