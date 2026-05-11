---
inclusion: always
---

# Hair Routine — Session Context

## What This Is

Adaptive hair care app for Mandy. Single-file HTML app (`index.html`) deployed to GitHub Pages. Used on her iPad in the bathroom with wet hands. Science-backed, personalized to her specific hair profile (2C-3A, coarse, very thick, post-TE recovery, weathered cuticle).

**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/

## Tech Stack

- Single HTML file with embedded CSS + JS (no build step, no framework)
- localStorage for all persistence (schema v12)
- Open-Meteo API for dew point auto-detection
- Service worker (`hair-sw.js`) — exists but not registered in v1
- GitHub Pages deployment (push to main = live)
- No dependencies, no npm, no bundler

## Key Files

| File | Role |
|------|------|
| `index.html` | **Live app** (~5300 lines) — quick-log, walkthrough, history, status bar, recommendations, product inventory |
| `hair-routine-v2.html` | Original spec build (superseded by v1 for live use) |
| `hair-sw.js` | Service worker (registered, handles offline caching) |
| `NEXT_STEPS.md` | Session plan with prioritized work items |
| `SESSION_HANDOFF.md` | Current state, decisions, what's next |
| `research/` | 5-phase product relationship research (complete) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference from original consultation |
| `.kiro/specs/daily-plan/design.md` | Next major feature — auto-generated daily plan UX |
| `.kiro/specs/product-intelligence/` | Intelligence system spec (partially implemented) |

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
- **Schema v12.** Intelligence uses granular `step` values (no subStep). Optional `additionalSteps` array for multi-group products. Per-product `experienceRating`, `resultsRating`, `experienceNote`, `resultsNote` fields. Got2b unified to `got2b-ultra-glued`. Use-up rotation state (washCountSinceLastRotation, lastAssignedProductId, lastAssignedDate).
- **Treatments are separate from products** in the data model (clarify, protein, deep-condition, bond-repair)
- **OGX oils are finishing products** (volatile silicones + dimethiconol film + trace oil). Legitimate shine/frizz tool. Weak pre-wash — pure coconut oil is the right tool for cortex penetration.
- **Pure coconut oil is the correct pre-wash oil** — penetrates cortex (lauric acid protein affinity), prevents hygral fatigue. Argan oil does NOT penetrate (stays in outer 5µm).
- **"Using-up" protocol:** Track bottles being finished, explain compensation, remove when empty.
- **Hard floors:** wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days — never below these.
- **Inventory tiers:** Primary Rotation, Supporting Cast, Use-Up Queue.
- **Mandy owns NYM Curl Talk gel** (confirmed May 10, 2026).
- **Abbey Yung 11-step method** is the reference model for logging (not a simplified 4-category version).
- **Goal of logging is data gathering for correlations**, not minimal taps.
- **Products CAN appear in multiple activity categories** via `additionalSteps` field (resolved — implemented in v8).
- **7-group step-based quick-log** (Pre-wash | Shampoo | Bond Repair | Condition | Leave-in & Protect | Style | Finishing) with sub-menus and heat cap badges.
- **Product intelligence is a system redesign**, not a quick mapping fix. Each product needs: mechanism, cumulative vs single-use, interactions, outcome contribution.
- **Offline-first with online product discovery** for new additions.
- **Both passive and active intelligence surfacing** — post-wash analysis + pre-wash recommendations.
- **"Pre-shampoo treatment" is marketing** — bond repair works best after shampoo, sealed by conditioner.
- **Heat cap benefits all conditioning-step products** (conditioner, deep conditioner, gloss).
- **Pantene Miracle Rescue Leave-In is genuine bond repair** (bis-aminopropyl dimethicone).
- **OGX Bond Protein Repair Sealing Serum is silicone-free protein fill** (different tool than Garnier serum).
- **No humidity manual prompt** — silently defaults to moderate on auto-detect failure.

## Aesthetic

- Dark color scheme (bathroom glare reduction)
- Book-feel: serif headings, system-ui body
- Gold accents for active/important elements
- Cards with subtle borders, generous padding
- Large touch targets (48×48dp minimum, 8dp spacing)
- Emoji-based rating (😫 😕 😐 😊 🤩)

## Anti-Patterns (things that went wrong in past sessions)

- Editing `index.html` without reading the full relevant section first (it's ~5300 lines)
- Adding humidity prompts where auto-detection already handles it
- Recommending Dove conditioner or OGX oils
- Building product rotation features
- Using relative humidity instead of dew point
- Treating the spec's optional property tests as blocking work
- Assuming schema version without checking (it's v12 now)

## Current Status (update after each session)

- **Spec:** Original spec complete. Product Intelligence spec partially implemented. Daily Plan spec has design.md (no tasks.md yet).
- **v1 (live):** Working — 7-group step-based quick-log with sub-menus + heat cap badges + multi-group products via additionalSteps, walkthrough, history, status bar, dew point auto-detection (no manual prompt), recommendations, compensation logic, product inventory (30 products) with full intelligence metadata + per-product experience/results ratings, post-wash attribution card, deep-condition auto-detection, use-up rotation (every 3rd wash cycles Dove conditioners with compensation).
- **Schema:** Version 12. Intelligence uses granular `step` values + optional `additionalSteps` array. Per-product experience/results ratings (v10). Use-up rotation state (v12).
- **Known broken:** Nothing currently broken.
- **Pending:** Research documentation write-up (coconut oil + OGX oil findings into research/ folder).
- **What's next:** iPad testing of DiagnosticEngine adjust flow. Product deep dives. A6 adversarial pass.

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
