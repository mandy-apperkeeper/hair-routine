# Hair Routine — Session Handoff (May 10, 2026, Session 9)

## What Happened This Session

### Session 9: Product Inventory (complete)

- **Schema v3** — Added `inventory: []` to app state
- **Inventory UI** — Tier-grouped product cards (Primary Rotation, Supporting Cast, Use-Up Queue) with expand/collapse, badges (using-up, science tags), and touch-friendly layout
- **Gel gap integration** — Gel gap reminder now checks inventory; added "add to inventory" button on the card
- **Research scoring consolidation** — Moved per-project `RESEARCH_SCORES.md` files to a single workspace-level file; created two `userTriggered` hooks ("Score Unscored Research" and "Audit Research Scores")

### Files Changed
- `index.html` — Inventory UI (CSS + HTML + JS), gel gap inventory check
- `research/RESEARCH_SCORES.md` — Deleted (migrated to workspace root)

### Commits
- `44e2663` feat: bump schema to v3 for product inventory feature
- `6f626f9` feat(inventory): add product inventory UI with tier grouping and expand/collapse cards
- `60f493d` fix: gel gap checks inventory and adds 'add to inventory' button
- `352dde0` refactor: remove per-project RESEARCH_SCORES.md in favor of workspace-level consolidated file

## Current State

### What's Live (GitHub Pages)
- `index.html` — quick-log, walkthrough, history, status bar, dew point detection, recommendations, compensation card, **product inventory**
- **URL:** https://mandy-apperkeeper.github.io/hair-routine/

### Spec Status
- **Adaptive Hair Routine spec** — feature-complete (all 16 task groups done)
- Optional items remaining: ~14 property tests + 1 integration test (all marked `*` = skippable)

### Implementation Improvements (`IMPLEMENTATION_IMPROVEMENTS.md`)
- **13 of 15 items done**
- Remaining: Item 3 (retrospective card, needs 15+ events) and Item 6 (18-MEA insight, needs 30+ events)

## What's Next (Priority Order)

1. **Service worker for v1 (Session 10)** — `index.html` has no offline support yet. `hair-sw.js` exists for v2 but needs adaptation.
2. **v1→v2 convergence planning (Session 11)** — Audit differences, decide switchover strategy, execute.
3. **Items 3 + 6** — Blocked on usage data (will auto-activate once Mandy has enough wash events logged).

## Decisions Made (Cumulative, Still Active)

- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed. Never recommend inferior product for "variety."
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema v3: WashEvent includes `treatments: string[]` and `dewPoint: number | null`; state includes `inventory: []`.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Product inventory pre-populated from consultation handoff. Mandy subtracts what she doesn't have.
- Research scores consolidated at workspace root (cross-project).

## Repo State

- **Branch:** main
- **Last commit:** `60f493d` — fix: gel gap checks inventory and adds 'add to inventory' button
- **Uncommitted:** None
- **Remote:** origin/main in sync
- **Pages URL:** https://mandy-apperkeeper.github.io/hair-routine/
