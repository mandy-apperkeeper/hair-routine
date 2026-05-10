# Implementation Plan: Adaptive Hair Routine

## Overview

Full rebuild of `hair-routine.html` into an adaptive, step-by-step hair care guidance app. Single HTML file (`hair-routine-v2.html`) with embedded CSS/JS, plus a separate `hair-sw.js` service worker. All persistence via localStorage, property-based tests via fast-check (Node.js test harness), deployed to GitHub Pages.

Implementation proceeds bottom-up: data layer → logic modules → UI components → integration → PWA. Each module is testable in isolation before wiring together.

## Tasks

- [x] 1. Project scaffolding and data layer
  - [x] 1.1 Create `hair-routine-v2.html` with base HTML structure, CSS custom properties, and empty JS module pattern
    - Set up the single-file skeleton: `<!DOCTYPE html>`, meta viewport, dark theme CSS variables (from existing v1), semantic HTML landmarks (`<main>`, `<nav>`, `<section>`), and the IIFE/module pattern for JS
    - Include all CSS from the design: touch targets (48×48dp min), typography (serif headings, system-ui body), dark color scheme, card/badge/timer/warning styles
    - Include the first-use empty state markup (hidden by default)
    - _Requirements: 11.1, 11.4, 11.5, 13.1, 13.5, 13.7_

  - [x] 1.2 Implement StateManager module (localStorage CRUD)
    - Implement `getState()`, `saveWashEvent(event)`, `getSealState()`, `setSealState(active)`, `getThresholds()`, `setThreshold(key, value)`
    - Initialize with default schema (`version: 1`, empty events array, default thresholds, inactive seal state, empty insights/proposals, default settings)
    - Handle `QuotaExceededError`, `JSON.parse` failures, and localStorage unavailability (private browsing detection)
    - Include schema version check and migration stub
    - _Requirements: 9.1, 9.6, 7.1_

  - [ ]* 1.3 Write property test: Event storage round-trip (Property 6)
    - **Property 6: Event storage round-trip**
    - Generate arbitrary valid WashEvent objects (random lane, products, humidity, rating, overrides, notes, dates) and verify `saveWashEvent` → `getState().events` round-trips without data loss
    - Use fast-check arbitraries for all WashEvent fields
    - **Validates: Requirements 6.2, 8.4, 9.1**

  - [ ]* 1.4 Write property test: Export/import round-trip (Property 14)
    - **Property 14: Export/import round-trip**
    - Generate arbitrary valid app states (events array, thresholds, seal state, insights, settings) and verify export-to-JSON then import-from-JSON produces identical state
    - **Validates: Requirements 9.4, 9.5**

- [-] 2. Cooldown System and Seal State
  - [-] 2.1 Implement CooldownSystem module
    - Implement `checkWarnings(lane, humidity)`, `getTimeSince(eventType)`, `isOverride(warning)`, `recordOverride(warningType)`
    - Time-based warnings: too-soon-wash (< threshold days), too-soon-clarify, too-soon-protein
    - State-based warnings: lane-conflict-pq69 (blowout after PQ-69 gel), lane-conflict-seal (curly while sealed), seal-blocks-treatment
    - All warnings are dismissable (always `dismissable: true`)
    - _Requirements: 3.1, 3.2, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 2.2 Implement Seal State logic
    - Activate seal on blowout with Marc Anthony spray
    - Deactivate on clarify (EverPure Clarifying or Kinky Curly)
    - Deactivate after 4 non-clarifying washes (degradation)
    - Track `washesSinceApplied` counter
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 2.3 Write property test: Days-since calculation (Property 1)
    - **Property 1: Days-since calculation**
    - For any two dates, verify days-since returns correct non-negative integer, and returns "today" when same calendar day regardless of time
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property test: Seal state machine transitions (Property 2)
    - **Property 2: Seal state machine transitions**
    - Generate arbitrary sequences of wash events (curly, blowout+marc-anthony, blowout-without, clarify) and verify seal state transitions match the state machine spec
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [ ]* 2.5 Write property test: Time-based cooldown warnings (Property 3)
    - **Property 3: Time-based cooldown warnings**
    - For any event history and threshold values, verify warnings fire if and only if time-since < threshold
    - **Validates: Requirements 4.2, 5.1, 5.2, 5.3**

  - [ ]* 2.6 Write property test: State-based warnings (Property 4)
    - **Property 4: State-based warnings**
    - For any app state, verify lane-conflict warnings fire exactly when conditions are met (PQ-69 residue for blowout, active seal for curly, active seal for treatments) and don't fire otherwise
    - **Validates: Requirements 3.1, 3.2, 5.4**

  - [ ]* 2.7 Write property test: Override recording (Property 5)
    - **Property 5: Override recording**
    - For any walkthrough with dismissed warnings, verify the resulting event's overrides array contains exactly the dismissed warning types
    - **Validates: Requirements 5.6**

  - [ ]* 2.8 Write property test: Hard floor enforcement (Property 12)
    - **Property 12: Hard floor enforcement**
    - For any sequence of threshold adjustments (proposals accepted, manual changes), verify wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days — never below floors
    - **Validates: Requirements 4.5, 7.6**

- [ ] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Feedback Engine
  - [ ] 4.1 Implement FeedbackEngine module — interval analysis and insight generation
    - Implement `analyze()`, `getInsights()`, `getIntervalRatings()`
    - Calculate average rating per interval bucket (1-day through 7-day+)
    - Generate insights when a bucket has 5+ rated events
    - Confidence scoring: `min(1.0, dataPoints / 15)`
    - Only surface insights with confidence ≥ 0.2 (3+ data points)
    - _Requirements: 6.3, 6.4, 4.4_

  - [ ] 4.2 Implement FeedbackEngine — correlation detection (humidity + product)
    - Implement `getHumidityCorrelations()`, `getProductCorrelations()`
    - Humidity: flag levels with 3+ events averaging below 3.0
    - Product: flag products where |avg_with - avg_without| > 0.5 (both sets need 3+ events)
    - _Requirements: 6.5, 6.6, 8.5_

  - [ ] 4.3 Implement FeedbackEngine — threshold adjustment proposals
    - Implement `proposeThresholdChange(type, direction)`, `checkOverridePatterns()`
    - Propose decrease when 5+ overrides average ≥ 4.0 rating
    - Propose increase when 5+ events at threshold average < 2.5 rating
    - Enforce hard floors on all proposals (wash ≥ 1, clarify ≥ 3, protein ≥ 5)
    - Store proposals with status (pending/accepted/rejected)
    - _Requirements: 6.7, 7.2, 7.3, 7.4, 7.6_

  - [ ]* 4.4 Write property test: Interval average calculation (Property 7)
    - **Property 7: Interval average calculation**
    - For any set of 10+ rated events, verify calculated average per bucket equals arithmetic mean (within floating-point tolerance)
    - **Validates: Requirements 6.3**

  - [ ]* 4.5 Write property test: Insight surfacing threshold (Property 8)
    - **Property 8: Insight surfacing threshold**
    - For any event set, verify insights are generated for buckets with 5+ rated events and not generated for buckets with fewer
    - **Validates: Requirements 6.4**

  - [ ]* 4.6 Write property test: Humidity correlation detection (Property 9)
    - **Property 9: Humidity correlation detection**
    - For any 10+ rated events where a humidity level has 3+ events averaging below 3.0, verify a humidity insight is generated
    - **Validates: Requirements 6.5, 8.5**

  - [ ]* 4.7 Write property test: Product correlation detection (Property 10)
    - **Property 10: Product correlation detection**
    - For any 10+ rated events where a product's with/without rating difference exceeds 0.5 (both sets 3+ events), verify a product correlation insight is generated
    - **Validates: Requirements 6.6**

  - [ ]* 4.8 Write property test: Threshold adjustment proposals (Property 11)
    - **Property 11: Threshold adjustment proposals**
    - Verify proposals are generated when override count ≥ 5 with avg rating ≥ 4.0 (decrease) or when interval events ≥ 5 with avg rating < 2.5 (increase)
    - **Validates: Requirements 6.7, 7.2, 7.3**

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Walkthrough Engine and Timer
  - [ ] 6.1 Implement WalkthroughEngine module
    - Implement `start(lane, humidity)`, `getCurrentStep()`, `next()`, `back()`, `getProgress()`, `getStepsForLane(lane, humidity)`
    - Define step data for all three lanes (curly: 9 steps, blowout: 9 steps, refresh: context-dependent)
    - Include product substitution logic: humid + curly → Got2b replaces NYM gel
    - Include refresh variant selection based on most recent wash lane
    - Include science badges on relevant steps (CERAMIDE + AMODIMETHICONE, PQ-69 HUMIDITY BARRIER, POLYSILICONE-29 HEAT SEAL, BOND REPAIR, FRIZZ PROTECTION)
    - Include timer metadata on conditioner/treatment steps (5 min conditioner, 10 min pre-shampoo)
    - _Requirements: 2.1, 2.2, 2.7, 8.2, 8.3, 12.1, 12.2, 12.3_

  - [ ] 6.2 Implement TimerManager module
    - Implement `start(durationSeconds, onComplete)`, `pause(timerId)`, `resume(timerId)`, `reset(timerId, durationSeconds)`, `getRemaining(timerId)`
    - Use `requestAnimationFrame` + timestamp comparison for accuracy across tab backgrounding
    - Handle `visibilitychange` event for phone lock/unlock recalculation
    - Only one timer active at a time per walkthrough
    - _Requirements: 2.3, 2.4_

  - [ ]* 6.3 Write property test: Humidity-based product substitution (Property 13)
    - **Property 13: Humidity-based product substitution**
    - For any curly walkthrough with humidity "humid", verify gel step references Got2b; for "dry"/"moderate", verify NYM Curl Talk Gel
    - **Validates: Requirements 8.2**

  - [ ]* 6.4 Write property test: Refresh walkthrough variant selection (Property 16)
    - **Property 16: Refresh walkthrough variant selection**
    - For any event history, verify refresh walkthrough presents post-curly guidance when last wash was curly, post-blowout when last was blowout
    - **Validates: Requirements 12.3**

- [ ] 7. Landing Screen UI
  - [ ] 7.1 Implement Landing Screen with status bar, action buttons, and conditional content
    - Status bar: days since last wash, days since last clarify, current seal state indicator
    - Three action buttons (Curly, Blowout, Refresh) — 64px height minimum, large touch targets
    - First-use empty state: welcome message + explanation of what the app will track (shown when all tracker values are null)
    - Insight card area (hidden until Feedback Engine has data, appears after 10+ events)
    - Quick links: History, Learn, Settings
    - Default guidance text when < 3 events: "Every 3-4 days is a good baseline"
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.4_

  - [ ] 7.2 Implement humidity prompt and warning overlay
    - Three-button humidity selector shown at walkthrough start (Dry <40%, Moderate 40-70%, Humid >70%)
    - Warning overlay: non-blocking banner at top for cooldown/lane-conflict warnings
    - Warning dismiss button (records override)
    - _Requirements: 5.5, 5.6, 8.1_

- [ ] 8. Walkthrough UI and Completion Flow
  - [ ] 8.1 Implement step-by-step walkthrough UI
    - Single step visible at a time with step counter ("Step 3 of 9")
    - Step display: product name, instruction text, science badge (tappable → links to Learn section), optional tip
    - Navigation: Back button + Next button (large, bottom of screen for thumb reach)
    - Inline timer component with start/pause/reset buttons and visual countdown
    - Timer completion: audible alert + visual notification
    - Phase card grouping with subtle phase labels (PREP & WASH, STYLE, DRY & FINISH for curly; PREP & WASH, PROTECT, STYLE, FINISH for blowout)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 13.4_

  - [ ] 8.2 Implement walkthrough completion and event logging
    - Completion screen: rating prompt (5 emoji scale — terrible, meh, okay, good, amazing), event summary
    - Rating is optional (can skip → null)
    - Auto-record: date, lane, products used, humidity, interval days, overrides
    - Update seal state based on products used
    - Trigger Feedback Engine analysis after event save
    - _Requirements: 2.6, 6.1, 6.2, 9.2_

- [ ] 9. History View
  - [ ] 9.1 Implement History view with event list and export/import
    - Reverse chronological event list showing: date, lane, rating (emoji), interval since previous wash
    - Summary stats: average interval, most common lane, rating trend
    - Export button: JSON download of full app state
    - Import button: file picker, validate JSON against schema before merging, reject malformed data with specific error
    - _Requirements: 9.3, 9.4, 9.5_

  - [ ]* 9.2 Write property test: History chronological ordering (Property 15)
    - **Property 15: History chronological ordering**
    - For any set of wash events with distinct dates, verify history presents them in strictly reverse chronological order
    - **Validates: Requirements 9.3**

- [ ] 10. Learn Section
  - [ ] 10.1 Implement Learn section with science cards, product inventory, and frizz diagnostic
    - Science cards grouped by user question: "How Your Routine Works" (Amodimethicone, Ceramide R, PQ-69, Polysilicone-29), "What Can Go Wrong" (Heat Damage, Glycerin & Humidity, Dual-Lane Conflict, Protein Overload Myth), "What's Happening to Your Hair" (TE Recovery, "Moisture" Is Marketing)
    - Two-tier science confidence badges: VERIFIED (green, peer-reviewed) and BEST PRACTICE (gold, practitioner-validated)
    - Source citations on each science card
    - Cross-links: tappable badges on walkthrough steps navigate to relevant science card
    - Back-links on science cards: "Used in: Curly Day step 6, Blowout Day step 5"
    - Frizz diagnostic: interactive tap-a-symptom → see cause and fix (6 causes)
    - Product inventory grouped by tier (Primary Rotation, Supporting Cast, Use-Up Queue) with sub-groups by routine context (Every Wash, Curly Days, Blowout Days, Weekly)
    - Glossing Mask warning tag: "⚠️ NOT a conditioner — this is a clarifying treatment (surfactants + AHA)"
    - Protein frizz protection badge on pre-shampoo step
    - Factual corrections applied: "8-10 cuticle layers", "up to 72 hours humidity resistance", 7-day protein interval noted as best practice not science floor
    - Expandable/collapsible sections
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Settings and Threshold Management
  - [ ] 11.1 Implement Settings view
    - Current threshold display (wash min, clarify min, protein min) with manual override capability
    - Reset to defaults button
    - Pending proposals from Feedback Engine with accept/reject buttons
    - Data management: export, import, reset all data (with confirmation)
    - Sound/vibration toggle for timer alerts
    - _Requirements: 7.1, 7.4, 7.5, 9.4, 9.5_

- [ ] 12. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Accessibility, responsive design, and visual polish
  - [ ] 13.1 Implement accessibility and responsive layout
    - WCAG 2.1 AA contrast ratios (4.5:1 body text, 3:1 large text/UI components)
    - Keyboard navigation for all interactive elements with visible focus indicators (gold outline)
    - Touch targets: 48×48dp minimum with 8dp spacing
    - Semantic HTML: `<nav>`, `<main>`, `<section>`, `<button>`, ARIA labels where needed
    - Screen reader compatibility: step announcements, timer status, warning alerts via `aria-live`
    - Responsive layout: single-column mobile (320px–767px), wider layout tablet/desktop (768px+)
    - Minimum 16px body text on mobile
    - Reduced motion support (`prefers-reduced-motion`)
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 14. Service Worker and PWA
  - [ ] 14.1 Create `hair-sw.js` service worker for offline capability
    - Cache-first strategy with version number in cache name
    - Cache the HTML file and any referenced assets on install
    - New version → new cache → old cache deleted on activation
    - Registration in main HTML file with graceful failure (app works without SW)
    - Full offline functionality after initial load
    - _Requirements: 11.3, 11.6_

- [ ] 15. Integration wiring and final assembly
  - [ ] 15.1 Wire all modules together and implement navigation flow
    - Landing screen → humidity prompt → walkthrough → completion → back to landing
    - Connect action buttons to WalkthroughEngine.start()
    - Connect CooldownSystem warnings to warning overlay UI
    - Connect FeedbackEngine insights to landing screen insight card
    - Connect walkthrough completion to StateManager.saveWashEvent()
    - Connect Settings UI to threshold management
    - Connect Learn section cross-links (badge tap → science card scroll)
    - Connect History view to StateManager event data
    - Verify all navigation paths work end-to-end
    - _Requirements: 1.3, 2.6, 6.1, 6.2, 9.2_

  - [ ]* 15.2 Write integration tests
    - Test full flow: landing → select lane → humidity → walkthrough → rate → event saved
    - Test warning flow: trigger cooldown → dismiss → override recorded
    - Test feedback flow: add 10+ events → insights appear on landing
    - Test export/import: export → clear → import → state restored
    - Test seal state flow: blowout with Marc Anthony → seal active → curly warns → clarify → seal reset
    - _Requirements: 1.1–1.5, 2.1–2.7, 3.1–3.5, 6.1–6.7_

- [ ] 16. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 16 universal correctness properties defined in the design document using fast-check
- Unit/integration tests validate specific scenarios and UI behavior
- The single-file architecture means most tasks modify `hair-routine-v2.html` — later tasks build on earlier ones
- Implementation improvements from `IMPLEMENTATION_IMPROVEMENTS.md` are incorporated into tasks 6.1 (frizz protection badge), 7.1 (first-use empty state), 8.1 (phase card grouping), 10.1 (science card grouping, cross-links, confidence badges, glossing mask warning, factual corrections, source citations)
