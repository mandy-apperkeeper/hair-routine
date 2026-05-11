# Requirements: Diagnostic Adjustment Engine

## Introduction

The Diagnostic Adjustment Engine replaces the current `AdjustmentEngine` module in `index.html` (lines ~7610-8100). The current engine treats symptoms as having fixed responses — "frizzy" always adds Wonder Water and upgrades gel, regardless of cause. In reality, "frizzy" has 4+ distinct causes requiring different interventions, and the current approach creates conflicts (e.g., "frizzy" adds Wonder Water, "short on time" removes it — last writer wins).

The new engine implements a cause-based diagnostic flow: `symptom + context → ranked causes → user confirms → targeted intervention`. It learns which causes are most likely for this user over time using a mixed Bayesian model (Beta-Binomial for cause selection tracking + Normal-Normal for intervention outcome tracking).

## Glossary

- **Symptom**: What the user observes about their hair (frizzy, dry, stiff, curls dropping, etc.)
- **Cause**: The underlying reason for the symptom (e.g., "frizzy" could be dry-air cuticle lift, humidity cortex swell, buildup blocking products, or overnight friction)
- **Cause Card**: A UI element showing a ranked possible cause with a brief explanation citing supporting data (dew point, days since clarify, etc.)
- **Intervention**: The specific plan adjustment applied when a cause is confirmed (e.g., "humidity cortex swell" → Got2b gel + Wonder Water barrier)
- **Cause Confirmation**: The user tapping a cause card to confirm it (binary action — tap or don't tap)
- **Beta-Binomial Tracker**: Tracks how often the user selects each cause for a given symptom. Binary observations (selected/not selected). Used for ranking causes.
- **Normal-Normal Tracker**: Tracks how well the wash turns out when a specific cause's intervention is applied. Continuous observations (1-5 rating). Used for outcome-based ranking.
- **Mixed Score**: The weighted combination of selection probability (Beta-Binomial) and outcome expectation (Normal-Normal) that determines final cause ranking.
- **Condition Key**: The contextual state that modifies cause priors — primarily humidity_tier, with days-since-clarify as a multiplicative modifier on the alpha parameter.
- **Delta-Awareness**: The engine's knowledge of what the current plan already accounts for, so it recommends escalation rather than repetition.
- **Discrepancy Surfacing**: When selection data and outcome data disagree ("you always pick X but your ratings are better when it's actually Y"), the app surfaces this insight.

## Requirements

### Requirement 1: Cause-Based Diagnostic Flow

**User Story:** As Mandy, I want the app to show me *why* my hair might be behaving a certain way (not just what to do about it), so that I understand my hair better over time and the adjustments actually target the right problem.

#### Acceptance Criteria

1. WHEN Mandy selects a symptom in the Adjust flow, THE Engine SHALL display 2-3 ranked cause cards for that symptom, each with a one-sentence explanation citing relevant data (e.g., "Dew point is 68°F — humidity is swelling the cortex")
2. EACH cause card SHALL include: cause name, brief mechanism explanation, supporting evidence from current context (dew point, days since clarify, last wash rating, etc.), and its rank position
3. WHEN Mandy taps a cause card, THE Engine SHALL apply that cause's specific intervention to the plan and dismiss the diagnostic overlay
4. THE Engine SHALL provide a "Not sure — generally off" option that applies the top-ranked cause's intervention WITHOUT updating the Beta-Binomial tracker (keeps data clean)
5. WHEN multiple symptoms are selected, THE Engine SHALL prefer shared root causes (intersect cause sets, score shared causes higher) and fall back to independent cause sets only if no shared cause scores above threshold
6. THE Engine SHALL never display causes that are irrelevant to Mandy's hair profile (e.g., "oily roots" for coarse/thick/2C-3A hair that doesn't produce excess sebum)

### Requirement 2: Cause Decision Trees

**User Story:** As Mandy, I want the possible causes to be scientifically accurate and specific to my hair type, so that the diagnostic is trustworthy and not generic advice.

#### Acceptance Criteria

1. THE Engine SHALL define cause trees for at minimum these symptoms: frizzy/poofy, dry/rough, stiff/straw-like, curls dropping/not holding, and buildup/heavy
2. EACH cause in a tree SHALL have: a unique ID, a mechanism explanation, contextual evidence rules (what data supports this cause being active), a domain-rule prior (base probability before any user data), and a specific intervention
3. THE Engine SHALL use current context to adjust cause priors: humidity_tier as primary axis, days-since-clarify as multiplicative modifier on alpha
4. THE Engine SHALL NOT include "protein overload" as a cause (confirmed not relevant for coarse/high-porosity/damaged hair per Croda Beauty 2025)
5. THE Engine SHALL NOT include "flat/oily" as a primary symptom category (irrelevant for this hair profile), but MAY include it as a deprioritized option with framing "unusual for your hair type"
6. EACH intervention SHALL be specific and actionable — not "add more moisture" but "upgrade to Elvive balm + heat cap (10 min)" with exact product and technique

### Requirement 3: Delta-Aware Adjustments

**User Story:** As Mandy, I want the engine to know what my plan already includes so it doesn't recommend things I'm already doing, and instead escalates when needed.

#### Acceptance Criteria

1. BEFORE applying an intervention, THE Engine SHALL check what the current plan already contains (products, timers, techniques)
2. IF the plan already includes the intervention's primary action (e.g., already has Wonder Water), THE Engine SHALL escalate rather than duplicate (e.g., upgrade conditioner time, add heat cap, or add pre-wash oil)
3. THE Engine SHALL track which adjustments have already been applied this session to prevent circular conflicts (e.g., "frizzy" adds Wonder Water → "short on time" removes it → engine doesn't re-add)
4. WHEN an intervention conflicts with a previously applied adjustment, THE Engine SHALL resolve by priority: user-confirmed causes outrank context adjustments, and more specific interventions outrank generic ones

### Requirement 4: Bayesian Cause Ranking (Beta-Binomial)

**User Story:** As Mandy, I want the app to learn which causes are most common for me over time, so that the most likely cause appears first and I spend less time diagnosing.

#### Acceptance Criteria

1. THE Engine SHALL maintain a Beta-Binomial tracker for each (symptom, cause, condition_key) tuple
2. WHEN Mandy taps a cause card (confirms a cause), THE Engine SHALL increment that cause's alpha parameter by 1 (observation: selected)
3. WHEN Mandy selects a symptom and does NOT tap a particular cause, THE Engine SHALL increment that cause's beta parameter by 1 (observation: not selected)
4. WHEN Mandy selects "Not sure — generally off", THE Engine SHALL NOT update any Beta-Binomial parameters (keeps data clean — uncertain selections don't train the model)
5. THE Engine SHALL use the condition key (humidity_tier + days-since-clarify modifier) to maintain separate priors for different environmental contexts
6. THE Engine SHALL initialize each cause's prior from domain rules (e.g., "humidity cortex swell" starts with higher alpha when dew point > 60°F)
7. THE Engine SHALL calculate selection probability as `alpha / (alpha + beta)` for ranking purposes

### Requirement 5: Outcome-Based Ranking (Normal-Normal)

**User Story:** As Mandy, I want the app to track whether the interventions actually work (not just whether I pick them), so that causes with effective interventions rise in ranking over time.

#### Acceptance Criteria

1. THE Engine SHALL maintain a Normal-Normal tracker for each (cause, intervention, condition_key) tuple
2. WHEN a wash event is rated AND a cause was confirmed during that wash's Adjust flow, THE Engine SHALL update the Normal-Normal posterior for that cause's intervention with the rating value (1-5)
3. THE Engine SHALL use the existing BeliefTracker pattern (Normal-Normal with prior variance 2.0) for the outcome half of the mixed model
4. THE Engine SHALL calculate outcome expectation as the posterior mean of the Normal-Normal distribution
5. THE Engine SHALL require a minimum of 3 rated events before outcome data influences ranking (prevents single-event noise from dominating)

### Requirement 6: Mixed Score and Final Ranking

**User Story:** As Mandy, I want causes ranked by a combination of "how often I pick this" and "how well it works when I do", so that the ranking reflects both my intuition and actual results.

#### Acceptance Criteria

1. THE Engine SHALL calculate a mixed score for each cause: `score = w1 * selectionProbability + w2 * outcomeExpectation`
2. THE Engine SHALL weight selection probability higher early (when outcome data is sparse) and increase outcome weight as data accumulates
3. THE Engine SHALL use weight formula: `w2 = min(0.5, outcomeDataPoints / 20)` and `w1 = 1 - w2` (selection dominates until 10+ outcome observations, then converges to 50/50)
4. THE Engine SHALL rank causes by mixed score descending, showing the top 2-3 to the user
5. WHEN selection and outcome data disagree significantly (user picks cause A but ratings are better when cause B is confirmed), THE Engine SHALL surface a discrepancy insight: "You usually think it's [A], but your hair does better when you treat for [B]"
6. THE Engine SHALL define "significant disagreement" as: cause A is top-ranked by selection (>60% selection rate) AND cause B has outcome mean > cause A's outcome mean by ≥ 0.8 points, with both having ≥ 5 outcome observations

### Requirement 7: Integration with Existing Modules

**User Story:** As Mandy, I want the diagnostic engine to work seamlessly with the existing plan generation and adjustment flow, not feel like a bolted-on feature.

#### Acceptance Criteria

1. THE Engine SHALL integrate with PlanGenerator — receiving the current plan state and returning a modified plan
2. THE Engine SHALL integrate with StateManager — reading wash history, dew point, days-since-clarify, and product inventory
3. THE Engine SHALL integrate with the Adjust flow UI — replacing the current direct-adjustment behavior with the diagnostic cause-card step
4. THE Engine SHALL store its Bayesian state (Beta-Binomial alphas/betas, Normal-Normal posteriors) in localStorage via StateManager, under a new `diagnosticState` key
5. THE Engine SHALL be backwards-compatible — if no diagnostic state exists (first use), it initializes from domain-rule priors and behaves identically to a fresh install
6. THE Engine SHALL include a schema version for its state, allowing future migrations

### Requirement 8: Condition Key Design

**User Story:** As Mandy, I want the engine to understand that causes have different likelihoods in different conditions (humid vs dry days, recently clarified vs overdue), without fragmenting the data into too many buckets.

#### Acceptance Criteria

1. THE Engine SHALL use humidity_tier (dry/moderate/humid) as the primary condition axis
2. THE Engine SHALL use days-since-clarify as a multiplicative modifier on the alpha parameter of buildup-related causes (not as a separate bucket)
3. THE Engine SHALL NOT create more than 3 condition buckets (dry/moderate/humid) to avoid data fragmentation (27-cell problem)
4. THE Engine SHALL share outcome data across condition keys (a good rating for an intervention is good regardless of humidity) while keeping selection data condition-specific
5. WHEN insufficient data exists for the current condition key (<3 observations), THE Engine SHALL fall back to the global (all-conditions) prior for that cause
