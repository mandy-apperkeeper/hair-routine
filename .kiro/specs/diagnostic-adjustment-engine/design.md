# Design: Diagnostic Adjustment Engine

## Overview

Replaces the current `AdjustmentEngine` (~320 lines, index.html lines 7610-7930) with a cause-based diagnostic system. Instead of `symptom → fixed response`, the new engine implements `symptom + context → ranked causes → user confirms → targeted intervention`.

**Core insight:** "Frizzy" has 4+ distinct causes. The current engine treats it as one thing. The new engine asks "why are you frizzy?" and adjusts differently based on the answer.

**Architecture:** Mixed Bayesian model combining:
- **Beta-Binomial** for cause selection ranking (binary: user picked this cause or didn't)
- **Normal-Normal** for intervention effectiveness (continuous: 1-5 wash rating)
- **Weighted combination** for final ranking (selection dominates early, outcome gains weight over time)

## Cause Decision Trees

### Symptom: Frizzy / Poofy

| Cause ID | Cause | Mechanism | Context Evidence | Domain Prior | Intervention |
|----------|-------|-----------|-----------------|--------------|--------------|
| `frizz-humidity` | Humidity swelling cortex | Water molecules penetrate cortex via open cuticle, swell hair shaft | Dew point > 60°F | High when humid | Got2b gel (glycerin-free PQ-69) + Wonder Water barrier |
| `frizz-dry-air` | Dry air lifting cuticle | Low moisture air pulls water from cortex, cuticle lifts to compensate | Dew point < 35°F | High when dry | Extended conditioner + heat cap + Wonder Water seal |
| `frizz-buildup` | Product buildup blocking seal | Silicone/product layers prevent conditioner from depositing properly | Days since clarify > 7 | Moderate, increases with days | Clarifying shampoo swap |
| `frizz-friction` | Overnight friction damage | Pillow friction roughens cuticle, especially on regrowth hairs | No satin pillowcase, morning wash | Low (static prior) | Extra leave-in on hairline + smoothing technique |

### Symptom: Dry / Rough

| Cause ID | Cause | Mechanism | Context Evidence | Domain Prior | Intervention |
|----------|-------|-----------|-----------------|--------------|--------------|
| `dry-moisture-deficit` | Moisture deficit (cuticle damage) | Weathered cuticle can't retain moisture, needs deep conditioning | Last rating < 3, no deep condition in 14+ days | High (default for this hair) | Elvive balm + heat cap (10 min) + Wonder Water seal |
| `dry-overwash` | Over-washing stripping lipids | Too-frequent sulfate exposure removes protective lipid layer | Days since last wash < 2 | Moderate when recent wash | Extend wash interval, coconut oil pre-wash |
| `dry-clarify-aftermath` | Post-clarify dryness | Clarifying removed protective silicone layers, hair feels exposed | Clarified within last 2 days | High when recently clarified | Extra conditioning time + leave-in boost |

### Symptom: Stiff / Straw-like

| Cause ID | Cause | Mechanism | Context Evidence | Domain Prior | Intervention |
|----------|-------|-----------|-----------------|--------------|--------------|
| `stiff-moisture` | Moisture deficit | Coarse hair without adequate moisture feels rigid | General (most common for this profile) | High | Elvive balm + heat cap + generous leave-in |
| `stiff-gel-cast` | Residual gel cast | Didn't fully scrunch out the crunch from last wash | Last wash used gel, no SOTC noted | Moderate | Water mist + re-scrunch technique |

### Symptom: Curls Dropping / Not Holding

| Cause ID | Cause | Mechanism | Context Evidence | Domain Prior | Intervention |
|----------|-------|-----------|-----------------|--------------|--------------|
| `curl-hold-weak` | Insufficient hold strength | Current gel can't maintain curl pattern through the day | Moderate/low humidity, NYM gel in plan | Moderate | Upgrade to Got2b |
| `curl-humidity` | Humidity overwhelming barrier | Moisture swelling cortex faster than gel can resist | Dew point > 60°F | High when humid | Got2b + Wonder Water + technique emphasis |
| `curl-weight` | Product weight pulling curls down | Too much leave-in or conditioner weighing hair down | Heavy products in plan | Low | Reduce leave-in, lighter application |
| `curl-buildup` | Buildup preventing gel adhesion | Product layers between hair and gel reduce grip | Days since clarify > 7 | Moderate, increases with days | Clarifying shampoo swap |

### Symptom: Buildup / Heavy

| Cause ID | Cause | Mechanism | Context Evidence | Domain Prior | Intervention |
|----------|-------|-----------|-----------------|--------------|--------------|
| `buildup-overdue` | Overdue for clarify | Silicone and product accumulation from multiple washes | Days since clarify > 7 | High when overdue | Clarifying shampoo swap |
| `buildup-heavy-application` | Over-application last wash | Too much product applied, not buildup over time | Recently clarified (< 5 days) | Moderate when recently clarified | Lighter application instructions, skip finishing oils |

## Mixed Bayesian Model

### Beta-Binomial (Selection Tracking)

For each `(symptom, cause, condition_key)` tuple:

```javascript
{
  symptomId: 'frizzy',
  causeId: 'frizz-humidity',
  conditionKey: 'humid',  // humidity_tier
  alpha: 3,  // initialized from domain prior + user selections
  beta: 1,   // initialized from domain prior + non-selections
  lastUpdated: '2026-05-11'
}
```

**Update rules:**
- User taps cause card → `alpha += 1`
- User selects symptom but taps a DIFFERENT cause → `beta += 1`
- User selects "Not sure — generally off" → NO UPDATE (data stays clean)

**Selection probability:** `P(select) = alpha / (alpha + beta)`

**Prior initialization:** Domain rules set initial alpha/beta based on context:
- `frizz-humidity` when dew point > 60°F: `alpha = 3, beta = 1` (strongly expected)
- `frizz-humidity` when dew point < 35°F: `alpha = 1, beta = 3` (unlikely)
- `frizz-dry-air` when dew point < 35°F: `alpha = 3, beta = 1` (strongly expected)

**Days-since-clarify modifier:** For buildup-related causes, multiply alpha by `min(2.0, daysSinceClarify / 7)`. This makes buildup causes rise in ranking as clarify becomes overdue without creating separate condition buckets.

### Normal-Normal (Outcome Tracking)

For each `(cause, intervention)` tuple (shared across conditions):

```javascript
{
  causeId: 'frizz-humidity',
  mu: 3.0,       // posterior mean (starts at neutral 3.0)
  variance: 2.0, // posterior variance (starts wide, shrinks with data)
  n: 0,          // observation count
  lastUpdated: null
}
```

**Update rules (standard Normal-Normal conjugate):**
- When wash is rated AND this cause was confirmed: update posterior with rating value
- `mu_new = (mu_prior / variance_prior + rating / observation_variance) / (1/variance_prior + 1/observation_variance)`
- `variance_new = 1 / (1/variance_prior + 1/observation_variance)`
- Observation variance fixed at 1.0 (ratings are noisy)

**Outcome expectation:** posterior mean `mu`

**Minimum data:** Outcome data only influences ranking when `n >= 3`

### Mixed Score Calculation

```javascript
function mixedScore(cause, symptom, conditionKey) {
  var selection = getBetaBinomial(symptom, cause.id, conditionKey);
  var outcome = getNormalNormal(cause.id);
  
  var selectionProb = selection.alpha / (selection.alpha + selection.beta);
  var outcomeExpectation = outcome.n >= 3 ? outcome.mu / 5.0 : 0.5; // normalize to 0-1
  
  // Outcome weight grows with data, caps at 0.5
  var w2 = Math.min(0.5, outcome.n / 20);
  var w1 = 1 - w2;
  
  return w1 * selectionProb + w2 * outcomeExpectation;
}
```

**Early behavior (< 3 outcome observations):** Pure selection-based ranking (domain priors + user picks)
**Mature behavior (20+ outcome observations):** 50/50 blend of selection and outcome

### Discrepancy Detection

```javascript
function checkDiscrepancy(symptom, conditionKey) {
  var causes = getCausesForSymptom(symptom);
  var topBySelection = causes.sort(bySelectionProb)[0];
  var topByOutcome = causes.filter(c => c.outcome.n >= 5).sort(byOutcomeMean)[0];
  
  if (!topByOutcome) return null; // not enough data
  if (topBySelection.id === topByOutcome.id) return null; // agreement
  
  var selectionRate = topBySelection.selectionProb;
  var outcomeDelta = topByOutcome.outcome.mu - topBySelection.outcome.mu;
  
  if (selectionRate > 0.6 && outcomeDelta >= 0.8) {
    return {
      type: 'discrepancy',
      message: `You usually think it's "${topBySelection.name}", but your hair does better when you treat for "${topByOutcome.name}"`,
      suggestion: topByOutcome
    };
  }
  return null;
}
```

## Delta-Awareness Logic

Before applying any intervention, the engine checks what the plan already handles:

```javascript
function applyIntervention(plan, intervention) {
  var already = getExistingAdjustments(plan);
  
  // Example: intervention wants to add Wonder Water
  if (intervention.addsGloss && plan.steps.some(s => s.stepType === 'gloss')) {
    // Already has gloss — escalate instead
    return escalate(plan, intervention);
  }
  
  // Example: intervention wants to upgrade conditioner
  if (intervention.upgradesConditioner && already.conditionerUpgraded) {
    // Already upgraded — add heat cap time instead
    return addHeatCapTime(plan);
  }
  
  // No conflict — apply directly
  return directApply(plan, intervention);
}
```

**Escalation hierarchy:**
1. Add product (if not present)
2. Upgrade product (if basic version present)
3. Extend time (if product already upgraded)
4. Add heat cap (if time already extended)
5. Add pre-wash step (maximum escalation)

**Conflict resolution priority:**
1. User-confirmed cause interventions (highest — user explicitly chose this)
2. Context adjustments (short on time, heat styling)
3. Domain-rule defaults (lowest)

## Condition Key Design

**Primary axis:** `humidity_tier` — one of `'dry'`, `'moderate'`, `'humid'`

Derived from dew point:
- Dry: dew point < 35°F
- Moderate: 35-60°F
- Humid: > 60°F

**Modifier (not a separate axis):** Days since clarify multiplies the alpha of buildup-related causes. This avoids creating a 3×N grid of condition buckets that would fragment data.

**Data sharing:**
- Selection data (Beta-Binomial): condition-specific (humid-day frizz selections are separate from dry-day)
- Outcome data (Normal-Normal): shared across conditions (a good rating is good regardless of humidity)

**Fallback:** When a condition key has < 3 observations for a cause, use the global (all-conditions) aggregated prior.

## Integration Points

### With PlanGenerator
- Engine receives `currentPlan` object (same shape as today)
- Engine returns modified plan (same shape — drop-in replacement)
- PlanGenerator calls `DiagnosticEngine.adjust(plan, observations)` instead of `AdjustmentEngine.adjust(plan, observations)`

### With StateManager
- New `diagnosticState` key in localStorage schema (v13)
- Contains: `betaBinomials[]`, `normalNormals[]`, `discrepancies[]`, `version: 1`
- Migration: additive (new key, no existing data changes)

### With Adjust Flow UI
- Current flow: symptom selected → plan immediately adjusts
- New flow: symptom selected → cause cards appear → user taps one → plan adjusts
- "Not sure" option skips cause cards, applies top-ranked intervention

### With BeliefTracker (existing)
- The Normal-Normal outcome tracker reuses the same mathematical pattern as the existing BeliefTracker
- Implementation: ~15 lines of new code for the Beta-Binomial tracker, reuse existing Normal-Normal logic

## State Schema (v13 addition)

```javascript
// Added to localStorage under StateManager
diagnosticState: {
  version: 1,
  betaBinomials: [
    {
      symptomId: 'frizzy',
      causeId: 'frizz-humidity',
      conditionKey: 'humid',
      alpha: 4,
      beta: 1,
      lastUpdated: '2026-05-11T14:30:00Z'
    }
    // ...
  ],
  normalNormals: [
    {
      causeId: 'frizz-humidity',
      mu: 3.8,
      variance: 1.2,
      n: 5,
      lastUpdated: '2026-05-11T14:30:00Z'
    }
    // ...
  ],
  discrepancies: [
    {
      symptomId: 'frizzy',
      conditionKey: 'humid',
      message: 'You usually think it\'s humidity, but...',
      surfacedDate: '2026-05-11',
      dismissed: false
    }
  ]
}
```

## UI Flow

```
User taps "Adjust" → selects symptom(s)
         │
         ▼
┌─────────────────────────────────┐
│ What's causing the frizz?       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌊 Humidity swelling cortex │ │  ← Rank #1 (mixed score: 0.82)
│ │ Dew point is 68°F — moisture│ │
│ │ is penetrating the cuticle  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🧱 Product buildup          │ │  ← Rank #2 (mixed score: 0.61)
│ │ Last clarified 9 days ago — │ │
│ │ layers may be blocking seal │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🌙 Overnight friction       │ │  ← Rank #3 (mixed score: 0.34)
│ │ Pillow friction roughens    │ │
│ │ cuticle on regrowth hairs   │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Not sure — generally off]      │
└─────────────────────────────────┘
         │
         ▼ (user taps cause)
    Plan adjusts with targeted intervention
    Beta-Binomial updates
```

## What This Replaces

The entire `AdjustmentEngine` IIFE (lines 7610-8100 of index.html):
- `applyFrizzyAdjustments()` → replaced by frizzy cause tree
- `applyBuildupAdjustments()` → replaced by buildup cause tree
- `applyCurlNotHoldingAdjustments()` → replaced by curl-dropping cause tree
- `applyDryRoughAdjustments()` → replaced by dry/rough cause tree
- `applyHoldingWellAdjustments()` → preserved as-is (not a diagnostic — it's a positive signal)
- `applyShortOnTimeAdjustments()` → preserved as context adjustment (not cause-based)
- `applyHeatStylingAdjustments()` → preserved as context adjustment
- `applyExercisedAdjustments()` → preserved as context adjustment
- `applyStiffAdjustments()` → replaced by stiff cause tree

Context adjustments (short on time, heat styling, exercised) remain direct adjustments — they're not diagnostic. Only symptom-based adjustments get the cause-card flow.

## Error Handling

- **No diagnostic state in localStorage:** Initialize from domain priors. App works identically to fresh install.
- **Corrupted diagnostic state:** Reset to domain priors, log warning. No user-visible error.
- **No causes score above threshold:** Show all available causes with equal ranking. Never show an empty cause list.
- **Condition key has no data:** Fall back to global prior (all-conditions aggregate).
