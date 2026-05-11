# Implementation Plan: Diagnostic Adjustment Engine

## Overview

Replace the current `AdjustmentEngine` in `index.html` with a cause-based diagnostic system. The engine uses a mixed Bayesian model (Beta-Binomial + Normal-Normal) to rank causes, presents them as tappable cards, and applies targeted interventions based on user confirmation.

Implementation proceeds: data layer → Bayesian trackers → cause trees → delta-awareness → UI → integration → replace old engine.

## Tasks

- [x] 1. Diagnostic state data layer
  - [x] 1.1 Add `diagnosticState` to StateManager (schema v14)
    - Add new localStorage key `diagnosticState` with structure: `{ version: 1, betaBinomials: [], normalNormals: [], discrepancies: [] }`
    - Schema migration from v12 → v13: additive only (new key, no existing data changes)
    - CRUD functions: `getDiagnosticState()`, `saveBetaBinomial(entry)`, `saveNormalNormal(entry)`, `saveDiscrepancy(entry)`, `resetDiagnosticState()`
    - Handle missing state gracefully (first use → initialize empty)
    - _Requirements: 7.4, 7.5, 7.6_

  - [x] 1.2 Implement Beta-Binomial tracker
    - Function: `BetaBinomialTracker.get(symptomId, causeId, conditionKey)` → returns `{ alpha, beta }`
    - Function: `BetaBinomialTracker.recordSelection(symptomId, causeId, conditionKey)` → increments alpha
    - Function: `BetaBinomialTracker.recordNonSelection(symptomId, causeId, conditionKey)` → increments beta
    - Function: `BetaBinomialTracker.getSelectionProbability(symptomId, causeId, conditionKey)` → `alpha / (alpha + beta)`
    - Initialize from domain-rule priors when no data exists
    - Fallback to global prior when condition-specific data has < 3 observations
    - ~15 lines of core logic
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 8.5_

  - [x] 1.3 Implement Normal-Normal outcome tracker
    - Function: `OutcomeTracker.get(causeId)` → returns `{ mu, variance, n }`
    - Function: `OutcomeTracker.recordOutcome(causeId, rating)` → conjugate update
    - Function: `OutcomeTracker.getExpectation(causeId)` → posterior mean (or 0.5 if n < 3)
    - Reuse existing BeliefTracker mathematical pattern (Normal-Normal conjugate with prior variance 2.0, observation variance 1.0)
    - Shared across condition keys (good rating is good regardless of humidity)
    - Minimum 3 observations before influencing ranking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.4 Implement mixed score calculation
    - Function: `DiagnosticEngine.mixedScore(symptomId, causeId, conditionKey)` → number 0-1
    - Weight formula: `w2 = min(0.5, n / 20)`, `w1 = 1 - w2`
    - Score: `w1 * selectionProbability + w2 * (outcomeExpectation / 5.0)`
    - Selection dominates early, converges to 50/50 at 20+ outcome observations
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2. Cause decision trees and condition keys
  - [x] 2.1 Define cause trees as data structures
    - Define all cause trees from design.md as JS data: frizzy (4 causes), dry/rough (3 causes), stiff (2 causes), curls dropping (4 causes), buildup (2 causes)
    - Each cause: `{ id, symptomId, name, mechanism, evidenceRules, domainPrior, intervention }`
    - Evidence rules are functions that take current context and return supporting text
    - Domain priors are functions that take condition key and return initial `{ alpha, beta }`
    - No protein overload cause. No flat/oily as primary symptom.
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [x] 2.2 Implement condition key derivation
    - Function: `getConditionKey(dewPoint)` → `'dry'` | `'moderate'` | `'humid'`
    - Thresholds: dry < 35°F, moderate 35-60°F, humid > 60°F
    - Function: `getClarifyModifier(daysSinceClarify)` → `min(2.0, daysSinceClarify / 7)`
    - Modifier multiplies alpha of buildup-related causes only
    - No more than 3 condition buckets (dry/moderate/humid)
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 2.3 Implement cause ranking
    - Function: `DiagnosticEngine.rankCauses(symptomId, context)` → sorted cause array with scores and evidence text
    - Uses mixed score for ranking
    - Generates evidence text from current context (dew point value, days since clarify, last rating, etc.)
    - Returns top 2-3 causes (all causes scoring above a minimum threshold, max 3)
    - Handles shared root causes when multiple symptoms selected (intersect cause sets, boost shared causes)
    - _Requirements: 1.1, 1.2, 1.5, 6.4_

- [x] 3. Delta-awareness and intervention application
  - [x] 3.1 Implement delta-awareness checker
    - Function: `getExistingAdjustments(plan)` → object describing what plan already contains
    - Checks: has gloss, conditioner upgraded, heat cap present, pre-wash present, gel upgraded, finishing oils present
    - Tracks which adjustments were applied this session (prevents circular conflicts)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Implement intervention application with escalation
    - Function: `DiagnosticEngine.applyIntervention(plan, cause, context)` → modified plan
    - Escalation hierarchy: add product → upgrade product → extend time → add heat cap → add pre-wash
    - If plan already has the intervention's primary action, escalate to next level
    - Conflict resolution: user-confirmed causes > context adjustments > domain defaults
    - _Requirements: 3.2, 3.4_

  - [x] 3.3 Implement specific interventions for each cause
    - `frizz-humidity`: Got2b gel swap + Wonder Water barrier (or escalate)
    - `frizz-dry-air`: Extended conditioner + heat cap + Wonder Water seal (or escalate)
    - `frizz-buildup`: Clarifying shampoo swap
    - `frizz-friction`: Extra leave-in on hairline + smoothing technique tip
    - `dry-moisture-deficit`: Elvive balm + heat cap (10 min) + Wonder Water
    - `dry-overwash`: Extend interval tip, coconut oil pre-wash
    - `dry-clarify-aftermath`: Extra conditioning time + leave-in boost
    - `stiff-moisture`: Elvive balm + heat cap + generous leave-in
    - `stiff-gel-cast`: Water mist + re-scrunch technique
    - `curl-hold-weak`: Got2b upgrade
    - `curl-humidity`: Got2b + Wonder Water + technique emphasis
    - `curl-weight`: Reduce leave-in, lighter application
    - `curl-buildup`: Clarifying shampoo swap
    - `buildup-overdue`: Clarifying shampoo swap
    - `buildup-heavy-application`: Lighter application instructions, skip finishing oils
    - Each intervention is a function that takes plan + context and returns modified plan
    - _Requirements: 2.6, 3.2_

- [x] 4. Discrepancy detection
  - [x] 4.1 Implement discrepancy surfacing
    - Function: `DiagnosticEngine.checkDiscrepancy(symptomId, conditionKey)` → discrepancy object or null
    - Triggers when: top-by-selection has > 60% selection rate AND top-by-outcome has mean > top-by-selection mean by ≥ 0.8, both with ≥ 5 outcome observations
    - Returns message: "You usually think it's [A], but your hair does better when you treat for [B]"
    - Stores discrepancy in diagnosticState for UI surfacing
    - Discrepancies are dismissable
    - _Requirements: 6.5, 6.6_

- [x] 5. Cause card UI
  - [x] 5.1 Implement cause card overlay in Adjust flow
    - When symptom is selected, show cause card overlay instead of immediately adjusting
    - Display 2-3 ranked cause cards with: cause name, mechanism explanation, supporting evidence from context, rank indicator
    - Cards are tappable — tap confirms cause and dismisses overlay
    - "Not sure — generally off" button at bottom
    - Overlay matches existing dark theme, card-based aesthetic
    - Touch targets: 48×48dp minimum, generous padding
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 5.2 Wire cause confirmation to Bayesian updates
    - On cause tap: increment alpha for selected cause, increment beta for non-selected causes, apply intervention, dismiss overlay
    - On "Not sure": apply top-ranked intervention, NO Bayesian updates, dismiss overlay
    - After wash rating: update Normal-Normal for confirmed cause (if any)
    - _Requirements: 4.2, 4.3, 4.4, 5.2_

  - [x] 5.3 Implement discrepancy insight card
    - Show on landing screen (or in Adjust flow) when a discrepancy is detected
    - Dismissable with "Got it" button
    - Styled as insight card (matches existing insight card pattern)
    - _Requirements: 6.5_

- [x] 6. Integration and replacement
  - [x] 6.1 Wire DiagnosticEngine into existing Adjust flow
    - Replace `AdjustmentEngine.adjust(plan, observations)` call with `DiagnosticEngine.adjust(plan, observations)`
    - Preserve context adjustments (short on time, heat styling, exercised) as direct adjustments — these don't get cause cards
    - Preserve "holding well" as direct adjustment (positive signal, not diagnostic)
    - Only symptom-based observations (frizzy, dry, stiff, curls dropping, buildup) trigger the cause-card flow
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 6.2 Wire outcome tracking into wash rating flow
    - When wash is rated AND a cause was confirmed during Adjust: call `OutcomeTracker.recordOutcome(causeId, rating)`
    - Store confirmed cause ID on the wash event (new field: `confirmedCause: { symptomId, causeId }`)
    - Schema v13 already supports this via the diagnosticState structure
    - _Requirements: 5.2, 7.2_

  - [x] 6.3 Remove old AdjustmentEngine
    - Old symptom functions (frizzy, buildup, curl_not_holding, dry_rough, stiff) are now bypassed — diagnostic symptoms route through DiagnosticEngine cause cards instead
    - Context adjustments (short_on_time, heat_styling, exercised, holding_well) still use AdjustmentEngine.adjust() as designed
    - Old symptom functions retained as dead code for safety — can be removed in a cleanup pass
    - Delete the `AdjustmentEngine` IIFE (lines 7610-8100)
    - Remove: `applyFrizzyAdjustments`, `applyBuildupAdjustments`, `applyCurlNotHoldingAdjustments`, `applyDryRoughAdjustments`, `applyStiffAdjustments`
    - Keep: `applyShortOnTimeAdjustments`, `applyHeatStylingAdjustments`, `applyExercisedAdjustments`, `applyHoldingWellAdjustments` (move into DiagnosticEngine as context adjustments)
    - Keep: `recordSwap` (move into DiagnosticEngine)
    - Verify no other code references the old `AdjustmentEngine` variable
    - _Requirements: 7.1_

  - [x] 6.4 Backwards compatibility verification
    - Verify app works with no diagnosticState in localStorage (fresh install)
    - Verify existing wash events are preserved
    - Verify context adjustments (short on time, heat styling, exercised) still work identically
    - Verify "holding well" still switches to refresh plan
    - Verify product swap recording still works
    - _Requirements: 7.5_

## Notes

- All tasks modify `index.html` (the single-file app)
- Schema migration v12 → v13 is additive only — no risk to existing data
- The Beta-Binomial tracker is ~15 lines of new code
- The Normal-Normal tracker reuses the existing BeliefTracker pattern
- Context adjustments are preserved unchanged — only symptom-based adjustments get the diagnostic flow
- The cause trees are data-driven — adding new causes or symptoms later is just adding entries to the data structure
- Deprioritized "flat/oily" is handled by the cause tree simply not including it as a primary symptom (can be added later with "unusual for your hair type" framing if needed)
