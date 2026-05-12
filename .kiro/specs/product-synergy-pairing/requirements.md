# Requirements Document — Product Synergy Pairing

## Introduction

The daily wash plan currently picks the best product for each step independently using per-step ranking (domain rules, condition match, Bayesian posteriors, interaction compatibility, inventory status). This produces locally optimal choices but ignores cross-step synergies. A conditioner that "enables" a downstream styling product may be ranked lower individually but produce a better overall plan when considered as part of a system.

Product Synergy Pairing makes plan generation synergy-aware — actively preferring product combinations that complement each other across steps, rather than assembling a plan from isolated per-step winners.

## Glossary

- **Plan_Generator**: The module responsible for assembling a complete wash day plan (product selections across all steps)
- **Synergy_Scorer**: The module that evaluates how well a set of products across steps work together as a system
- **Interaction_Graph**: The existing module encoding product relationships (enables, blocks, neutral) with confidence levels and mechanism explanations
- **Synergy_Bonus**: A numeric score boost applied when a product has an "enables" relationship with another product already in the plan
- **Conflict_Penalty**: A numeric score reduction applied when a product has a "blocks" relationship with another product already in the plan
- **Plan_Score**: The aggregate quality score for a complete plan, combining individual product rankings with cross-step synergy contributions
- **Candidate_Set**: The set of viable products for a given step, filtered by domain rules and inventory availability
- **Synergy_Chain**: A sequence of three or more products across consecutive steps where each enables the next
- **Synergy_Explanation**: A user-facing description of why products were paired together, citing the interaction mechanism

## Requirements

### Requirement 1: Cross-Step Synergy Evaluation

**User Story:** As a user, I want the plan to consider how products work together across steps, so that I get complementary pairings instead of isolated per-step picks.

#### Acceptance Criteria

1. WHEN generating a plan, THE Plan_Generator SHALL evaluate product interactions across all steps in the plan, not only within individual steps.
2. WHEN a product in one step has an "enables" relationship with a product in another step, THE Synergy_Scorer SHALL apply a Synergy_Bonus to the combined Plan_Score.
3. WHEN a product in one step has a "blocks" relationship with a product in another step, THE Synergy_Scorer SHALL apply a Conflict_Penalty to the combined Plan_Score.
4. THE Synergy_Scorer SHALL weight the Synergy_Bonus by the confidence level of the interaction (high > medium > low).
5. THE Synergy_Scorer SHALL weight interactions by step proximity — products in adjacent steps receive a stronger synergy weight than products separated by multiple steps.
6. WHEN two candidate plans have equal individual product rankings, THE Plan_Generator SHALL prefer the plan with the higher synergy score.

### Requirement 2: Plan-Level Optimization

**User Story:** As a user, I want the plan to find the best overall combination of products, so that the full routine works as a cohesive system.

#### Acceptance Criteria

1. THE Plan_Generator SHALL compute a Plan_Score that combines individual per-step product rankings with the Synergy_Scorer output.
2. THE Plan_Generator SHALL evaluate multiple candidate product combinations per plan, not only the single top-ranked product per step.
3. WHEN the top-ranked product for a step has no synergy with the rest of the plan but the second-ranked product has a strong "enables" relationship, THE Plan_Generator SHALL select the second-ranked product if the synergy gain exceeds the individual ranking loss.
4. THE Plan_Generator SHALL preserve hard constraints from domain rules (products that are required or excluded by domain logic are not overridden by synergy scoring).
5. THE Plan_Generator SHALL complete plan optimization within 50ms for a typical inventory of 25 products across 6 steps.
6. THE Plan_Generator SHALL consider at most the top 3 candidates per step when evaluating combinations, to bound computational cost.

### Requirement 3: Synergy Chain Detection

**User Story:** As a user, I want the plan to recognize when three or more products form a complementary chain, so that multi-step synergies are captured.

#### Acceptance Criteria

1. WHEN three or more products across consecutive steps each have an "enables" relationship with the next product in sequence, THE Synergy_Scorer SHALL recognize this as a Synergy_Chain.
2. THE Synergy_Scorer SHALL apply a chain bonus that exceeds the sum of individual pairwise Synergy_Bonuses (super-linear reward for longer chains).
3. IF a candidate product would break an existing Synergy_Chain, THEN THE Plan_Generator SHALL penalize that candidate proportionally to the chain length being broken.
4. THE Synergy_Scorer SHALL detect chains of up to 4 products (pre_wash → wash → post_wash → style).

### Requirement 4: Synergy-Aware Product Rotation

**User Story:** As a user, I want the product alternatives list to show how each alternative affects plan synergy, so that I can make informed swaps.

#### Acceptance Criteria

1. WHEN displaying alternative products for a step (the rotate/swap UI), THE Plan_Generator SHALL show the synergy impact of each alternative on the overall plan.
2. WHEN an alternative product would create a new "enables" relationship with products in other steps, THE Plan_Generator SHALL display a synergy indicator (positive) next to that alternative.
3. WHEN an alternative product would break an existing synergy pairing, THE Plan_Generator SHALL display a conflict indicator (negative) next to that alternative.
4. THE Plan_Generator SHALL re-rank alternatives by combined score (individual rank + synergy contribution) rather than individual rank alone.
5. WHEN the user swaps a product via the rotate UI, THE Plan_Generator SHALL re-evaluate synergy for all other steps and suggest downstream adjustments if the swap creates new synergy opportunities or breaks existing ones.

### Requirement 5: Synergy Explanation in Plan Display

**User Story:** As a user, I want to understand why products were paired together, so that I can learn how my products interact.

#### Acceptance Criteria

1. WHEN a product was selected partly due to synergy with another product in the plan, THE Plan_Generator SHALL display a Synergy_Explanation on that step.
2. THE Synergy_Explanation SHALL name the paired product and cite the interaction mechanism (from the Interaction_Graph).
3. WHEN a product was selected over a higher-individually-ranked alternative due to synergy, THE Plan_Generator SHALL indicate this in the explanation (e.g., "Chosen over [alternative] because it enables [other product]").
4. THE Synergy_Explanation SHALL be accessible via the existing info popup ([ℹ] icon) on each plan step.
5. WHEN a Synergy_Chain exists in the plan, THE Plan_Generator SHALL display a chain summary showing the full sequence and its combined benefit.

### Requirement 6: Synergy Learning from Outcomes

**User Story:** As a user, I want the system to learn which product pairings actually work well for my hair, so that synergy scoring improves over time.

#### Acceptance Criteria

1. WHEN a wash day is logged with a rating, THE Synergy_Scorer SHALL record which product pairings were present in that plan.
2. THE Synergy_Scorer SHALL maintain a Bayesian belief per product pair about their combined effectiveness, starting from the Interaction_Graph prior (enables = positive prior, blocks = negative prior, neutral = flat prior).
3. WHEN a product pair consistently appears in high-rated wash days, THE Synergy_Scorer SHALL increase the Synergy_Bonus for that pair beyond the domain-knowledge baseline.
4. WHEN a product pair consistently appears in low-rated wash days, THE Synergy_Scorer SHALL decrease the Synergy_Bonus (or increase the Conflict_Penalty) for that pair.
5. THE Synergy_Scorer SHALL require a minimum of 5 observations of a pair before adjusting its bonus beyond the domain prior.
6. IF a pair's learned synergy contradicts the Interaction_Graph prior (e.g., an "enables" pair consistently correlates with poor outcomes), THEN THE Synergy_Scorer SHALL surface this contradiction to the user as an insight.

### Requirement 7: Graceful Degradation

**User Story:** As a user, I want the plan to still work well when synergy data is limited, so that the feature doesn't make plans worse for small inventories or new users.

#### Acceptance Criteria

1. WHEN the Interaction_Graph has no interaction data for a product pair, THE Synergy_Scorer SHALL treat the pair as neutral (zero bonus, zero penalty).
2. WHEN a step has only one viable candidate (after domain rule filtering), THE Plan_Generator SHALL skip synergy evaluation for that step.
3. THE Plan_Generator SHALL never select a product that violates a domain hard constraint, regardless of synergy score.
4. WHEN the inventory contains fewer than 2 products per step on average, THE Plan_Generator SHALL fall back to pure per-step ranking (synergy evaluation adds no value with no alternatives).
5. THE Plan_Generator SHALL produce identical results to the current per-step ranking when no interaction data exists in the Interaction_Graph (backward compatible).

### Requirement 8: Performance and Computational Bounds

**User Story:** As a user, I want plan generation to remain instant, so that synergy evaluation doesn't slow down the app.

#### Acceptance Criteria

1. THE Plan_Generator SHALL complete synergy-aware plan generation within 50ms for an inventory of 25 products and 6 plan steps.
2. THE Synergy_Scorer SHALL evaluate at most 3^6 (729) candidate combinations in the worst case (top 3 per step × 6 steps).
3. WHEN the candidate space exceeds 729 combinations, THE Plan_Generator SHALL use greedy forward selection with synergy look-ahead rather than exhaustive search.
4. THE Synergy_Scorer SHALL store precomputed interaction lookups (product pair → interaction type + weight) to avoid repeated Interaction_Graph traversal during plan generation.
5. THE Plan_Generator SHALL run synchronously on the main thread without blocking UI rendering (no web workers required at this scale).
