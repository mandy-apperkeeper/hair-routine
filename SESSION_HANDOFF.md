# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 21)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- Everything from Session 20 remains working (see below for full list)
- Deploy timestamp comment added to force CDN purge
- Service worker v8 with one-time migration code
- Schema v11 (Got2b ID unification)

### What Was Done This Session (21)
1. **Diagnosed iPhone Safari caching issue** — NOT a service worker problem
   - Private tab on iPhone also shows old 3-button version → rules out SW
   - `manifest.json` loads correctly on phone → phone CAN reach current deployment
   - `/index.html?v=20260510` returns 404 on phone but 200 from ben-o-matic → phone is getting different responses
   - Fresh deploy + CDN purge (commit `652d602`) confirmed working from ben-o-matic but phone still shows old version
   - **Conclusion: Something on the phone is intercepting/proxying Safari requests** — most likely iCloud Private Relay or a content blocker/VPN profile

2. **Added deploy timestamp** to index.html (line 2: `<!-- deploy: 2026-05-10T21:30 -->`)

### Known Issues (carry to next session)

#### iPhone Safari showing old version — UNRESOLVED
**Root cause narrowed down:** NOT service worker, NOT CDN caching, NOT GitHub Pages deployment.

Evidence:
- Private tab shows old version (rules out SW + local cache)
- `manifest.json` loads current version on phone (phone reaches correct server for other files)
- `/index.html?v=20260510` returns 404 on phone but 200 from ben-o-matic
- Fresh deploy confirmed serving new content from ben-o-matic immediately
- Same WiFi network for both devices

**Most likely cause:** iCloud Private Relay (Apple's proxy) serving cached/stale HTML responses. Private Relay is known to cache aggressively and can serve stale content even in private tabs.

**Next steps to try:**
1. Check Settings → [Apple ID name] → iCloud → Private Relay — turn OFF
2. If no Private Relay, check Settings → General → VPN & Device Management for profiles
3. If neither, try: Settings → Safari → Advanced → Experimental Features → NSURLSession WebSocket (toggle)
4. Nuclear: restart the phone, then try private tab
5. If ALL of the above fail: test from a completely different device (Mandy's iPad, another phone) to confirm it's device-specific

**Whose phone:** Not confirmed — need to establish if this is Ben's iPhone or another device

### What's NOT Done (carry forward)
- Same as Session 20 (Daily Plan polish, Product Intelligence, research docs)
- iPhone caching resolution

---

## Full Feature List (live)
- **Daily Plan view** — auto-generated plan, scrollable steps, adjust overlay (auto-close + toast), frizzy=Got2b swap, "no wash needed" screen, offline indicator, condensed checklist, end-of-plan rating, lane override
- **PWA support** — service worker v8 (network-first HTML, stale-while-revalidate API), manifest, install capability, update banner, one-time SW migration
- **7-group step-based quick-log** with sub-menus + heat cap badges + multi-group products
- **Product inventory** (30 products) with full intelligence metadata + per-product ratings
- **Post-wash attribution card**
- **Walkthrough engine**, history, status bar, dew point auto-detection, recommendations, compensation logic, gel gap
- **Learn section** with science cards, frizz diagnostic
- **Accessibility** — ARIA, focus management, keyboard nav, touch targets

---

## Schema

**Version:** 11 (Got2b ID unification)

---

## Cumulative Decisions (Do Not Revisit)

All previous decisions remain. No new decisions this session.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~7200+ lines) |
| `hair-sw.js` | Service worker v8 |
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
| 20 | Daily Plan polish: adjust UX, frizzy upgrade, no-wash, a11y | Complete |
| 21 | **iPhone Safari debugging — narrowed to device-level proxy/relay** | In Progress |

---

## Repo State

- **Branch:** main
- **Latest commit:** `652d602` — Force CDN cache purge (deploy timestamp)
- **Pushed:** Yes, confirmed deployed and serving from ben-o-matic
- **GitHub Pages:** Serving correct content (verified from ben-o-matic)
- **iPhone:** Still showing old version — device-level issue, not server-side
