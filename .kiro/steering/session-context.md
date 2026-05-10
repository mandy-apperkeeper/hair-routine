---
inclusion: always
---

# Hair Routine — Session Context

## What This Is

Adaptive hair care app for Mandy. Single-file HTML app (`index.html`) deployed to GitHub Pages. Used on her iPad in the bathroom with wet hands. Science-backed, personalized to her specific hair profile (2C-3A, coarse, very thick, post-TE recovery, weathered cuticle).

**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/

## Tech Stack

- Single HTML file with embedded CSS + JS (no build step, no framework)
- localStorage for all persistence (schema v3)
- Open-Meteo API for dew point auto-detection
- Service worker (`hair-sw.js`) for v2 offline support (v1 has none yet)
- GitHub Pages deployment (push to main = live)
- No dependencies, no npm, no bundler

## Key Files

| File | Role |
|------|------|
| `index.html` | **Live v1 app** — quick-log, walkthrough, history, status bar, recommendations |
| `hair-routine-v2.html` | Full spec build (walkthrough engine, learn section, settings) — not yet live |
| `hair-sw.js` | Service worker for v2 |
| `NEXT_STEPS.md` | Session plan with prioritized work items |
| `SESSION_HANDOFF.md` | Current state, decisions, what's next |
| `IMPLEMENTATION_IMPROVEMENTS.md` | 15-item roadmap (12 done, 3 remaining) |
| `research/` | 5-phase product relationship research (complete) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference from original consultation |

## Architecture (v1 — the live app)

`index.html` is organized as:
1. **CSS** — dark theme, card-based, touch-friendly
2. **HTML** — semantic sections (landing, walkthrough, history, quick-log)
3. **JS modules** (IIFEs):
   - `StateManager` — localStorage CRUD, schema migration
   - `CooldownSystem` — time-based + state-based warnings
   - `FeedbackEngine` — interval analysis, correlations, threshold proposals
   - `WalkthroughEngine` — step sequences per lane, humidity substitutions
   - `TimerManager` — countdown with visibility-change handling
4. **UI wiring** — event listeners, view switching, rendering functions

## Established Decisions (do not revisit)

- **Amodimethicone conditioner every wash.** Dove is "using-up" only — never recommend it.
- **No product rotation.** Research confirmed rotation is a myth. Never build rotation logic.
- **Dew point, not relative humidity.** Auto-detect via Open-Meteo. Manual selector is fallback only (offline/API failure). The app informs, doesn't ask.
- **Schema v3:** WashEvent includes `treatments: string[]` and `dewPoint: number | null`. State includes inventory.
- **Treatments are separate from products** in the data model (clarify, protein, deep-condition, bond-repair)
- **OGX oils provide no lasting benefit** (volatile silicones). Don't recommend them.
- **"Using-up" protocol:** Track bottles being finished, explain compensation, remove when empty.
- **Hard floors:** wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days — never below these.
- **Inventory tiers:** Primary Rotation, Supporting Cast, Use-Up Queue.
- **Mandy owns NYM Curl Talk gel** (confirmed May 10, 2026).
- **Abbey Yung 11-step method** is the reference model for logging (not a simplified 4-category version).
- **Goal of logging is data gathering for correlations**, not minimal taps.
- **Products CAN appear in multiple activity categories.**
- **Phase-based UI grouping** for quick-log (Pre-wash | Wash | Post-wash | Style).
- **Product intelligence is a system redesign**, not a quick mapping fix. Each product needs: mechanism, cumulative vs single-use, interactions, outcome contribution.
- **Offline-first with online product discovery** for new additions.
- **Both passive and active intelligence surfacing** — post-wash analysis + pre-wash recommendations.

## Aesthetic

- Dark color scheme (bathroom glare reduction)
- Book-feel: serif headings, system-ui body
- Gold accents for active/important elements
- Cards with subtle borders, generous padding
- Large touch targets (48×48dp minimum, 8dp spacing)
- Emoji-based rating (😫 😕 😐 😊 🤩)

## Anti-Patterns (things that went wrong in past sessions)

- Editing `index.html` without reading the full relevant section first (it's ~3800 lines)
- Mixing v1 and v2 concerns — they're separate apps until convergence (Session 11)
- Adding humidity prompts where auto-detection already handles it
- Recommending Dove conditioner or OGX oils
- Building product rotation features
- Using relative humidity instead of dew point
- Treating the spec's optional property tests as blocking work

## Current Status (update after each session)

- **Spec:** Feature-complete (all 16 task groups done, optional tests skipped)
- **v1 (live):** Working — quick-log, walkthrough, history, status bar, dew point detection, recommendations, compensation logic, product inventory
- **Known broken:** ACTIVITY_PRODUCTS mapping in quick-log is incorrect — products in wrong categories. Will be fixed as part of Product Intelligence System, not standalone.
- **Remaining improvements:** 2 of 15 (Items 3 + 6 need usage data)
- **What's next:** Draft Product Intelligence System spec (answer open questions, then formal spec with requirements and tasks). Implementation phases: data model → logging UI → passive intelligence → active recommendations → online discovery. Service worker + PWA deferred until after product intelligence lands.

## Design Principles (testing here first, generalize if effective)

Derived from Sky Guide's approach. Evaluate after Session 9 ships:

1. **Immediate value on open** — no navigation required to see what matters now
2. **Content is the interface** — minimize chrome, maximize the thing itself
3. **Progressive depth** — tap to learn more, never forced to see more
4. **Context-aware defaults** — the app knows what's relevant based on time, history, conditions
5. **Beautiful at rest** — even when idle, it looks intentional
6. **Pre-populated over blank slate** — start with known data, let the user subtract rather than build from zero
7. **Tap anything to go deeper** — any product/concept mentioned anywhere should be a link to its details

Efficacy test: Does applying these to the inventory feature result in fewer "where do I find X?" moments and faster task completion than a traditional CRUD list would?
