# Hair Routine — Session Handoff (May 10, 2026, Session 4)

## What Happened This Session

### Critique & Design Discussion (no code changes by Kiro)

1. **Full app critique delivered** — reviewed the entire codebase (index.html ~3500 lines), spec, design doc, improvements doc, and session handoff. Identified 8 specific issues ranging from architecture (single-file strain) to missing features (service worker, property tests) to UX philosophy (humidity prompt).

2. **Humidity UX redesign agreed** — Current flow asks Mandy "How's the humidity?" with three buttons. Ben wants the app to *inform*, not ask. New approach: fetch weather silently, show conditions card (dew point, humidity, temp) as education, make product substitutions automatically. Manual selector becomes offline-only fallback. Spec Requirement 8 needs rewriting to reflect "inform, don't ask" philosophy.

3. **Spec process improvement identified** — The humidity prompt was specced as a specific UI interaction when the intent was "Mandy understands weather's effect on her hair." Root cause: spec encoded a solution, not the intent. Proposed fixes:
   - Add "philosophy" section per feature in specs (why it exists, what it should feel like)
   - Review specs against Apper Keeper principles before implementation
   - Create project-level steering file with implementation guardrails

4. **Product inventory model designed** — Ben wants:
   - Ability to manage owned products (add/edit/retire)
   - Discovery of new products worth trying
   - Key active ingredients identified with science-based purpose
   - INCIDecoder links for full ingredient profiles
   - Filterable by role, key ingredient, and problem-solved
   - Status tracking: own | wishlist | retired | trying

   Product model fields agreed:
   - Name, Brand, Status, Role, Key active ingredients, Delivery/formulation note, Why it's here (hair-specific purpose), INCIDecoder link, Science badge tier, Notes

5. **Ingredient database research** — Investigated COSMILE Europe, INCI API, Dermalytics, INCIDecoder, Roots by Benda. None have a free hair-specific API. Recommendation: link out to INCIDecoder for reference, keep curated "purpose for Mandy's hair" field locally.

6. **Smart lane recommendation committed** — Ben had already made changes adding a context-aware recommendation card to the landing screen. Committed as `63d8405`.

## Current State

### What's Live
- `index.html` on GitHub Pages with smart recommendation card, walkthrough, timers, warnings, completion flow
- Auto dew point detection (Open-Meteo) with manual fallback
- Service worker skeleton (`hair-sw.js`) — not yet caching

### Decisions Made This Session
- Humidity: inform, don't ask (spec needs update)
- Product inventory: spec-worthy feature (touches data model, UI, walkthrough integration)
- Steering file for project: should be created to encode "never ask for info the app can detect" and similar guardrails

## What's Next (Priority Order)

1. **Update Requirement 8** — Rewrite to reflect "inform, don't ask" weather philosophy
2. **Create project steering file** — `.kiro/steering/` with implementation guardrails derived from Apper Keeper principles
3. **Product inventory spec** — New spec for the inventory/discovery feature (model agreed, needs requirements + design + tasks)
4. **Service worker** — Still the highest-impact missing infrastructure
5. **Verify end-to-end feedback loop** — Rating → storage → insight surfacing

## Open Questions
- Ben mentioned "other changes too" for the inventory model — what else beyond the fields listed above?
- Does the product inventory live in localStorage alongside wash events, or separate storage key?
- Should discovery/wishlist products be pre-populated from the consultation handoff, or start empty?

## Repo State
- **Branch:** main
- **Last commit:** `63d8405` — feat(landing): add smart lane recommendation
- **Uncommitted:** None at session end
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/
