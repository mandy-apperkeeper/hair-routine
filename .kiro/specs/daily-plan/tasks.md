# Implementation Plan: Daily Plan

## Overview

Replaces the current "pick a lane → follow walkthrough" model with "here's today's plan → adjust if you want." The app opens to a pre-generated, scrollable hair plan based on dew point, history, seal state, and timing. User can follow as-is or tap "Adjust" to input observations for a refined plan.

Built directly into `index.html` (single-file architecture). Replaces the landing page lane-selection and step-by-step walkthrough navigation. Preserves all existing data, history, settings, and science content.

**Strategy:** Domain-rules-only for product ranking first (Tier 1). Bayesian personalization (Tiers 2-3) wired in later via Product Intelligence spec. This gets the UX change live fast — domain rules cover 90% of ranking logic for current usage.

## Tasks

- [x] 1. Plan Generation Engine (data layer)
  - [x] 1.1 Implement PlanGenerator module — lane suggestion
    - `PlanGenerator.suggestLane(state, dewPoint)` — returns suggested lane + reasoning
    - Logic:
      - If seal active AND < 4 washes since seal → suggest blowout or refresh (not curly)
      - If days since wash == 0-1 → suggest refresh
      - If days since wash >= user's preferred interval → suggest curly or blowout (based on last wash lane alternation + user tendency from history)
      - Else → suggest refresh or "no wash needed"
    - Returns: `{ lane: string, reason: string, confidence: 'high'|'medium'|'low' }`
    - Lane is a suggestion, not a gate — user can override via Adjust flow

  - [x] 1.2 Implement PlanGenerator module — step sequence builder
    - `PlanGenerator.buildPlan(lane, dewPoint, state)` — returns ordered step array
    - Each step: `{ id, stepType, productId, productName, instruction, scienceBadge?, timer?, phase, skipReason? }`
    - Phase grouping: PREP & WASH | STYLE | DRY & FINISH (curly), PREP & WASH | PROTECT | STYLE | FINISH (blowout)
    - Include "SKIP TODAY" items at end with reasons (treatment not due, seal conflict, etc.)
    - Step count: ~8-10 for curly, ~9-10 for blowout, ~4-6 for refresh

  - [x] 1.3 Implement product ranking per step (domain rules only)
    - `PlanGenerator.rankProducts(stepType, conditions, inventory)` — returns ranked product list for a step
    - Tier 1 domain rules (always active):
      - Amodimethicone conditioner always #1 (Garnier Color Repair or L'Oréal EverPure Bond Repair)
      - Got2b over NYM when dew point > 60°F
      - Don't use curly products while seal is active
      - Pure coconut oil is #1 pre-wash (OGX oils are weak alternatives)
      - Deprioritize "using-up" tier products unless no alternative exists
      - Heat protection required for blowout lane
    - Each ranking includes: productId, rank, reason (human-readable)
    - Stub hook for future Bayesian ranking (Tier 2-3): `// TODO: BeliefTracker integration`

  - [x] 1.4 Implement skip logic
    - `PlanGenerator.getSkipReasons(state)` — returns items to skip today with reasons
    - Skip when: protein < 7 days since last, clarify < 7 days, deep condition < 14 days, Olaplex < 7 days
    - Skip when: product conflicts with seal state
    - Each skip: `{ stepType, productName, reason, lastUsed }`

- [x] 2. Adjustment Engine
  - [x] 2.1 Implement AdjustmentEngine module — observation processing
    - `AdjustmentEngine.adjust(currentPlan, observations)` — returns modified plan
    - Observation types:
      - Layer 1 (quick, single-select): frizzy, flat, holding_well, oily, dry_rough
      - Layer 2 (context, multi-select): exercised, short_on_time, heat_styling, slept_unprotected
      - Layer 3 (detailed, multi-select): tangles, shedding, curl_dropping, stiff, scalp_itchy
    - Adjustment rules per observation (from design doc table):
      - frizzy → stronger hold gel, ensure Wonder Water, ensure amodimethicone conditioner
      - flat → drop heavy leave-in, suggest clarify if overdue, lighter conditioner time
      - oily → suggest clarify, reduce leave-in, skip finishing oils
      - dry_rough → longer conditioner time, add pre-shampoo, extra leave-in
      - holding_well → suggest refresh (minimal intervention)
      - short_on_time → drop optional steps (pre-shampoo, Wonder Water), reduce conditioner time
      - heat_styling → add heat protection, switch to blowout lane
      - exercised → prioritize wash over refresh
      - stiff → reduce protein frequency, extra conditioning

  - [x] 2.2 Implement product swap tracking
    - When user rotates a product via [↻], record the swap
    - `AdjustmentEngine.recordSwap(stepType, fromProductId, toProductId)`
    - Swaps stored on the plan object for logging with the wash event
    - Re-evaluate downstream steps if swap has interaction implications (e.g., swapping conditioner affects what leave-in is optimal)

- [x] 3. Checkpoint — verify plan generation
  - Generate plans for all 3 lanes with mock state data
  - Verify product ranking matches domain rules
  - Verify skip logic fires correctly for various timing scenarios
  - Verify adjustment rules modify plans as expected

- [x] 4. Plan View UI (scrollable single-page)
  - [x] 4.1 Implement plan header and metadata bar
    - "Today's Plan" heading
    - Subtitle: lane + dew point + days since wash (e.g., "Curly Day · Dew point 52°F · Day 4")
    - "Adjust — tell me about your hair →" button (opens adjustment overlay)
    - Condensed view toggle (collapses to checklist mode)

  - [x] 4.2 Implement scrollable step list with phase grouping
    - Phase headers (PREP & WASH, STYLE, DRY & FINISH) as section dividers
    - Each step card: product name, instruction text, [ℹ] info button, [↻] rotate button
    - Timer badge on steps that need timing (e.g., "⏱ 5 min")
    - Heat cap badge where applicable (🧢)
    - Science badge (tappable → info popup)
    - SKIP TODAY section at bottom with greyed-out items + reasons

  - [x] 4.3 Implement [ℹ] info popup (bottom-sheet overlay)
    - Triggered by tapping info icon on any step
    - Shows: why this product is recommended today, what it does (mechanism), science confidence badge, source citation
    - Dismiss: tap outside or X button
    - Does NOT navigate away from plan view

  - [x] 4.4 Implement [↻] product rotation (ranked alternatives)
    - Triggered by tapping rotate icon on any step
    - Shows ranked list of alternatives for that step from inventory
    - Each alternative: name + one-line reason why it's ranked lower
    - Tapping an alternative swaps it into the plan
    - Records swap for wash event logging

  - [x] 4.5 Implement inline timers
    - Timer starts on tap of the time badge
    - Visual countdown in-place on the step card
    - Pause/reset controls appear when timer is active
    - Completion: subtle visual change + optional sound (respects settings toggle)
    - Only one timer active at a time
    - Timer persists across scroll (sticky mini-bar at top when timer step scrolls out of view)

  - [x] 4.6 Implement condensed checklist view
    - Toggle at top of plan switches between full and condensed
    - Condensed: single line per step (checkbox + product name + time if applicable)
    - Checkboxes optional (for tracking progress mid-shower)
    - Timers still accessible (tap time to start)
    - Remember preference in localStorage

- [x] 5. Adjustment UI (progressive disclosure overlay)
  - [x] 5.1 Implement Layer 1 — quick observation (single-select)
    - Bottom-sheet overlay triggered by "Adjust" button
    - 5 large tap targets with emoji + label:
      - 🌊 Frizzy / poofy
      - 🪨 Flat / limp
      - ✨ Holding well
      - 🧴 Oily / heavy
      - 🌿 Dry / rough
    - Selecting one immediately re-generates plan (visible changes)
    - "More →" link to Layer 2

  - [x] 5.2 Implement Layer 2 — context (optional toggles)
    - Appears below Layer 1 on tap of "More"
    - Toggle buttons (multi-select):
      - 🏃 Exercised / sweaty
      - ⏰ Short on time
      - 🔥 Planning to heat style
      - 🌙 Slept without protection
    - Each toggle immediately adjusts plan
    - "More detail →" link to Layer 3

  - [x] 5.3 Implement Layer 3 — specific observations (optional multi-select)
    - Appears below Layer 2 on tap of "More detail"
    - Checkbox list:
      - Tangles worse than usual
      - More shedding than normal
      - Curl pattern dropping faster
      - Stiff / straw-like
      - Scalp itchy / flaky
    - Submit adjusts plan
    - Overlay dismisses, plan view shows updated steps

- [x] 6. Checkpoint — verify plan UI
  - Test full plan renders correctly for curly/blowout/refresh
  - Test adjustment flow: select observation → plan visibly changes
  - Test product rotation: tap [↻] → alternatives show → swap works
  - Test timer: start → countdown → completion notification
  - Test condensed view toggle
  - Test on mobile viewport (320px width)

- [x] 7. Outcome Collection
  - [x] 7.1 Implement end-of-plan rating
    - "How'd it turn out?" section at bottom of plan (below SKIP TODAY)
    - Emoji rating row: 😫 😕 😐 😊 🤩
    - "Skip for now" option
    - On rate: save wash event with all plan data (products, lane, dew point, observations, swaps)

  - [x] 7.2 Implement deferred rating (next-day prompt)
    - If rating skipped, store a pending prompt in localStorage
    - Next app open (after 12+ hours): gentle banner "How did yesterday's wash turn out?"
    - Same emoji scale
    - Disappears after rating OR after 48 hours
    - Stored as `deferredRating` on the wash event

  - [x] 7.3 Update WashEvent schema for daily plan data
    - Schema v9 migration (additive — new fields default to null/empty):
      - `observations: { quick: string|null, context: string[], detailed: string[] }`
      - `planAdjusted: boolean`
      - `productSwaps: Array<{ step: string, from: string, to: string }>`
      - `deferredRating: number|null`
      - `deferredRatingDate: string|null`
    - Existing events unchanged (new fields absent = null behavior)

- [x] 8. Navigation and Integration
  - [x] 8.1 Replace landing page with daily plan
    - On app open: auto-generate today's plan (PlanGenerator.suggestLane + buildPlan)
    - Plan view IS the landing page (no navigation required to see it)
    - Preserve "Something else?" toggle for manual lane override
    - Preserve nav links: History, Products, Settings

  - [x] 8.2 Wire plan completion into existing systems
    - On rate/skip: call StateManager.saveWashEvent() with full plan data
    - Update seal state based on products in plan
    - Update cooldown timers
    - Trigger existing FeedbackEngine analysis
    - Show existing post-wash attribution card (mechanism-based)

  - [x] 8.3 Preserve existing quick-log as fallback
    - Quick-log remains accessible (for logging past washes, not today's plan)
    - Accessible from History view or a "Log a past wash" link
    - No changes to quick-log functionality

  - [x] 8.4 Connect science content
    - [ℹ] popups link to existing Learn section content where available
    - Science badges on steps use existing badge data from walkthrough engine
    - "Learn more" link in info popup navigates to full science card

- [x] 9. Checkpoint — verify integration
  - Test full flow: open app → plan shows → follow plan → rate → event saved
  - Test deferred rating: skip → reopen next day → prompt appears → rate → saved
  - Test quick-log still works for past washes
  - Test history shows daily-plan events correctly
  - Test compensation engine still fires on landing
  - Test on iPad viewport (primary target device)

- [x] 10. Polish and Edge Cases
  - [x] 10.1 Handle "no wash needed" state
    - When days since wash < preferred interval AND no observations suggest washing:
    - Show minimal screen: "Your hair is doing fine. Next wash suggested: [date]"
    - "Wash anyway" button generates a plan if user overrides
    - Refresh plan available as lighter alternative

  - [x] 10.2 Handle offline/API failure gracefully
    - If dew point unavailable: generate plan with "moderate" default
    - Show subtle indicator: "☁️ Weather unavailable — using moderate defaults"
    - Plan still fully functional without weather data

  - [x] 10.3 Accessibility pass
    - Plan steps: semantic list with aria-labels
    - Phase headers: proper heading hierarchy
    - Timer: aria-live region for countdown announcements
    - Adjustment overlay: focus trap, escape to dismiss
    - All touch targets: 48×48dp minimum
    - Condensed checkboxes: proper label associations
    - Rating emojis: aria-labels with text descriptions

  - [x] 10.4 Transition from old UI
    - Remove old 3-button lane selection from landing
    - Remove old step-by-step walkthrough navigation
    - Keep walkthrough engine module (PlanGenerator uses its step data)
    - Ensure no dead code left behind

- [x] 11. Final checkpoint
  - Full end-to-end test on iPad viewport
  - Verify all existing features still work (history, products, settings, export/import)
  - Verify schema v9 migration from v8 state
  - Verify offline behavior
  - Deploy to GitHub Pages and test live

## Notes

- All tasks modify `index.html` (single-file architecture)
- Tasks build sequentially — later tasks depend on earlier ones
- The PlanGenerator reuses data from the existing WalkthroughEngine (step sequences, product metadata) — it's a new interface on top of existing intelligence, not a rewrite
- Domain rules for product ranking are sufficient for launch. Bayesian personalization (BeliefTracker) is a future enhancement that slots into task 1.3's stub hook
- The 4 open UX questions from the design doc are resolved in this plan:
  1. Condensed view: NOT default on first use, remembers preference after toggle (task 4.6)
  2. "No wash needed" days: minimal screen with override option (task 10.1)
  3. Timer UX: inline with sticky mini-bar when scrolled away (task 4.5)
  4. Animation on adjust: immediate re-render, no animation (simpler, faster, less to break)
- Estimated effort: 3-4 build sessions
