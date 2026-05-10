# Hair Routine — Session Handoff (May 10, 2026, Session 5)

## What Happened This Session

### Design Discussion (no code changes)

1. **Event model redesign agreed** — A wash day is composable. Clarifying IS shampooing. Deep conditioning and bond repair can happen in the same session. New model: keep `lane` (styling outcome) + add `treatments` array (`['clarify', 'deep-condition', 'bond-repair', 'protein']`). Cooldown tracking checks `treatments` for timing, not just lane.

2. **Manual history entry** — When adding past events, user should be able to select multiple activities for that day (lane + treatments), not just one lane. One entry per wash day, not separate events per activity.

3. **Implementation gap identified** — Session 4 produced design decisions (inform-don't-ask humidity, fully suggested routine, single-page walkthrough) but none were implemented. The spec's v2 was built from the original spec, not from the Session 4 redesign decisions. The live app still asks humidity, still uses paginated walkthrough, still doesn't proactively suggest a routine.

## Current State

### What's Live
- `index.html` on GitHub Pages — walkthrough, timers, warnings, completion flow, smart recommendation card, auto dew point detection (Open-Meteo) with manual fallback
- Service worker skeleton (`hair-sw.js`) — not yet caching
- All core spec tasks complete (data layer, cooldown, feedback engine, walkthrough, UI, history, learn, settings, accessibility, PWA registration, integration wiring)

### What's NOT Live (Agreed But Unbuilt)
These were decided in Sessions 4-5 but never implemented:

1. **"Inform, don't ask" humidity** — App should detect weather silently, show conditions as education, make product substitutions automatically. Manual selector = offline fallback only.
2. **Proactive routine suggestion** — Landing screen shows today's recommended routine fully assembled. One tap to start. App decides lane, products, timing, substitutions.
3. **Single-page walkthrough** — All steps visible at once, scrollable, no pagination. Compact but thorough. Glanceable in the shower.
4. **Product rotation + compensation logic** — App picks ONE product per step and explains why. Routine is a system where steps compensate for each other.
5. **Composable wash events** — `treatments` array alongside `lane`. Cooldowns track per-treatment.
6. **Manual history entry with multi-select** — Add past events with lane + multiple treatments in one entry.

### Repo State
- **Branch:** main
- **Last commit:** `63d8405` — feat(landing): add smart lane recommendation
- **Uncommitted:** None
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/

---

## Next Steps — Implementation Plan

### Philosophy

The current app was built from the original spec. The Session 4 redesign decisions represent a significant UX philosophy shift that the spec doesn't yet reflect. Rather than patching the existing app piecemeal, this plan addresses the gap systematically.

### Priority 1: Event Model Rework (Foundation)

**Why first:** Everything else depends on the data model being right. The composable event model affects history, cooldowns, feedback engine, and walkthrough completion.

**Changes:**
- Add `treatments: string[]` to WashEvent (values: `'clarify'`, `'deep-condition'`, `'bond-repair'`, `'protein'`)
- Add `dewPoint: number | null` to WashEvent (already partially there)
- Cooldown system checks `treatments` array for clarify/protein timing, not just lane
- Seal state logic: clarify in `treatments` resets seal (not just "clarify lane")
- Migration: existing events get `treatments: []` (empty = wash-only)
- History view shows treatments as tags/badges on each event

**Scope:** ~3 files worth of logic changes within the single HTML file (StateManager, CooldownSystem, FeedbackEngine, History UI, Completion flow)

### Priority 2: Weather as Information (Remove Humidity Prompt)

**Why second:** Removes the most obvious "asking when it should inform" friction point.

**Changes:**
- On app load (not walkthrough start), fetch dew point from Open-Meteo silently
- Show weather conditions card on landing screen: dew point, humidity %, temperature — as education
- Product substitutions happen automatically based on detected conditions
- Manual humidity selector only appears if: offline AND no cached weather data
- Remove the humidity prompt from walkthrough start flow entirely
- Store `dewPoint` and derived `humidity` on every event automatically

**Spec update needed:** Requirement 8 acceptance criteria 1 changes from "prompt for humidity" to "detect and display conditions"

### Priority 3: Proactive Routine Suggestion

**Why third:** This is the biggest UX transformation — from "pick a lane" to "here's what to do today."

**Changes:**
- Landing screen shows a fully assembled routine recommendation:
  - Recommended lane (based on: days since last wash, seal state, last lane used, treatment schedule)
  - Treatments due today (protein if 7+ days, clarify if 5+ days, deep condition if 14+ days)
  - Weather-adjusted product picks
  - One-tap "Start" button
- Override available: "Not today" or tap a different lane
- Recommendation logic:
  - If seal active + 4+ washes → suggest clarify day
  - If protein 7+ days → suggest adding protein treatment
  - If last wash was curly → default to curly (unless blowout signals present)
  - Weather: humid → Got2b substitution noted in recommendation

**Spec update needed:** New requirement or rewrite of Requirement 1 to reflect proactive suggestion

### Priority 4: Single-Page Walkthrough Redesign

**Why fourth:** Depends on the event model and weather detection being in place.

**Changes:**
- Replace paginated one-step-at-a-time with scrollable single page
- All steps visible, grouped by phase (PREP & WASH, STYLE, DRY & FINISH)
- Each step: product name, instruction, science badge (tappable → Learn), optional timer
- Timers inline — tap to start, visual countdown, audible alert on completion
- Current step highlighted/tracked as user scrolls (optional: auto-scroll to next after timer completes)
- Every step names ONE product explicitly (no "X or Y" choices)
- Treatments (clarify, protein, deep condition) appear as additional steps when selected

**Tradeoff:** Loses the "one thing at a time" calm of pagination. Gains glanceability and shower-friendliness (no tapping Next with wet hands). Session 4 decision was clear: single-page wins for this physical context.

### Priority 5: Manual History Entry

**Why fifth:** Useful for backfilling data, but not blocking daily use.

**Changes:**
- "Add past wash" button in History view
- Date picker (defaults to today)
- Lane selector (curly / blowout / refresh)
- Treatment multi-select toggles: clarify, deep condition, bond repair, protein
- Optional rating (emoji scale)
- Optional notes
- Save creates a WashEvent with all fields populated

### Priority 6: Product Inventory & Rotation Logic

**Why sixth:** Requires the most new infrastructure. Spec-worthy on its own.

**Changes (from Session 4 design):**
- Product model: Name, Brand, Status (own/wishlist/retired/trying/using-up), Role, Key ingredients, Purpose, INCIDecoder link, Science badge tier, Notes
- Walkthrough references products from inventory
- Rotation logic: app picks ONE product per step, explains compensation ("Using Dove to finish bottle. L'Oréal 21-in-1 at step 5 covers the amodimethicone gap.")
- Status field includes `using-up` for "not first choice but finish the bottle"

**This should be a separate spec** — touches data model, UI, walkthrough integration, and introduces new concepts (product relationships, compensation logic).

---

## Spec Updates Needed

The formal spec (requirements.md, design.md, tasks.md) needs updating to reflect Session 4-5 decisions:

1. **Requirement 8** — Rewrite for "inform, don't ask" weather philosophy
2. **WashEvent interface** — Add `treatments: string[]` field
3. **Walkthrough design** — Single-page scrollable replaces paginated
4. **Landing screen** — Proactive suggestion replaces three equal buttons
5. **New requirement** — Manual history entry with composable events
6. **New spec** — Product inventory & rotation (separate from this spec)

---

## Open Questions (Carried Forward + New)

1. Does the product inventory live in localStorage alongside wash events, or separate storage key?
2. Should discovery/wishlist products be pre-populated from the consultation handoff, or start empty?
3. How does the app know product relationships (which compensates for which)? Manual tagging per product, or inferred from ingredient overlap?
4. For the proactive suggestion: how aggressive should it be? Always suggest, or only when it's confident? (Lean: always suggest, with "I'm guessing" qualifier when < 5 events)
5. Single-page walkthrough: should timers auto-start when scrolled into view, or always require manual tap?

---

## Design Decisions Log (All Sessions)

| Session | Decision | Status |
|---------|----------|--------|
| 3 | Book-feel aesthetic (serif headings, warm dark palette) | Implemented |
| 3 | GitHub Pages deployment | Implemented |
| 3 | Open-Meteo for weather (free, no key) | Implemented |
| 4 | Humidity: inform, don't ask | **Not implemented** |
| 4 | Fully suggested routine (app decides) | **Not implemented** |
| 4 | Single-page walkthrough (scrollable, no pagination) | **Not implemented** |
| 4 | Product rotation + compensation logic | **Not implemented** |
| 4 | Product inventory model (name, brand, status, role, ingredients...) | **Not implemented** |
| 4 | `using-up` status for products | **Not implemented** |
| 5 | Composable events (lane + treatments array) | **Not implemented** |
| 5 | Manual history entry with multi-select | **Not implemented** |
