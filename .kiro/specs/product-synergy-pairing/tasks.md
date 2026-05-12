# Implementation Plan: Product Synergy Pairing

## Overview

Transform plan generation from isolated per-step product selection into a system-aware optimization that prefers complementary product combinations. Adds InteractionLookup (precomputed pair map), SynergyScorer (cross-step evaluation), PlanOptimizer (bounded combination search), PairBeliefTracker (learned pair effectiveness), and SynergyExplainer (user-facing text).

Implementation proceeds: interaction lookup → synergy scoring → plan optimization → belief tracking → UI integration → alternatives enhancement → testing.

**Key constraint:** All computation synchronous on main thread, single-file HTML app. Max 729 combinations (3 candidates × 6 steps), target <50ms.

## Tasks

- [x] 1. InteractionLookup — precomputed pair map
  - [x] 1.1 Implement InteractionLookup.build(inventory)
    - Iterate all products' `interactions` arrays
    - Build bidirectional map: key = alphabetically sorted `"productA|productB"`, value = `{ type, weight, note, confidence, source }`
    - Weight calculation from type + confidence: enables+high → +1.0, enables+medium → +0.6, enables+low → +0.3, blocks+high → −1.0, blocks+medium → −0.6, blocks+low → −0.3, enhances → +0.5, reduces → −0.3, complements → +0.4, outclassed_by → −0.2, neutral → 0
    - Handle `confidence` field (default to "medium" if not specified on the interaction)
    - Skip wildcard interactions (`with: '*'`) — these are handled separately during scoring
    - Store wildcard interactions in a separate `_wildcards` array: `{ productId, type, weight, note }`
    - ~40 lines of code
    - _Requirements: 8.4_

  - [x] 1.2 Implement InteractionLookup.get(productIdA, productIdB)
    - Alphabetically sort the two IDs to form the key
    - Return the interaction object or null if no relationship exists
    - O(1) lookup
    - _Requirements: 7.1_

  - [x] 1.3 Implement InteractionLookup.getAll(productId)
    - Return all interactions involving this product (scan the map for keys containing the ID)
    - Used by SynergyExplainer for generating explanations
    - Also return applicable wildcard interactions from `_wildcards`
    - _Requirements: 5.1_

  - [x] 1.4 Wire InteractionLookup.build() into app initialization
    - Call `InteractionLookup.build(state.inventory)` on app load (after state is loaded)
    - Store result in module-level variable (in-memory only, not persisted)
    - Rebuild when inventory changes (hook into any inventory mutation — currently none exist dynamically, so load-time only is sufficient)
    - _Requirements: 8.4_

- [x] 2. SynergyScorer — cross-step evaluation
  - [x] 2.1 Implement SynergyScorer.score(plan, interactionLookup, pairBeliefs)
    - Input: array of `{ stepIndex, productId }` (one product per step)
    - For each pair (i, j) where i < j in the plan:
      - Look up interaction via InteractionLookup.get()
      - Calculate proximity factor: `1.0 / stepDistance(i, j)` (adjacent=1.0, 2-apart=0.5, etc.)
      - Get learned adjustment from PairBeliefTracker (0 if < 5 observations)
      - Pair contribution = `(baseWeight + learnedAdjustment) * proximityFactor`
    - Handle wildcard interactions: for each product with a wildcard, apply its weight × proximityFactor to all downstream products in the plan
    - Sum all pair contributions → synergyScore
    - Add chain bonuses (from detectChains)
    - Return `{ score, chains, pairContributions }`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Implement SynergyScorer.detectChains(plan, interactionLookup)
    - Scan consecutive steps for "enables" chains (A enables B, B enables C, ...)
    - A chain requires each product to have an "enables" relationship with the next product in step order
    - Detect chains of length 3-4 (max 4 per Requirement 3.4)
    - Chain bonus = sum of pairwise bonuses × (1 + 0.25 × (chainLength − 2))
      - Length 3: 1.25× sum
      - Length 4: 1.5× sum
    - Return array of `{ products: [id, id, ...], bonus: number }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. PlanOptimizer — bounded combination search
  - [x] 3.1 Implement PlanOptimizer.optimize(candidatesPerStep, interactionLookup, pairBeliefs, options)
    - Input: array of arrays (top 3 candidates per step from rankProducts), each candidate has `{ productId, score }`
    - Cap candidates at 3 per step (Requirement 2.6)
    - Fix steps with only 1 candidate (skip synergy for those)
    - Respect hard constraints from `options.hardConstraints` (products that must be excluded — e.g., seal-active curly products already filtered by rankProducts, but verify)
    - Generate all combinations of variable steps (max 3^6 = 729)
    - For each combination:
      - `individualScore = Σ(candidate.score)` (from rankProducts)
      - `synergyResult = SynergyScorer.score(combination, lookup, beliefs)`
      - `planScore = individualScore + (synergyResult.score × SYNERGY_WEIGHT)`
    - SYNERGY_WEIGHT = 15 (synergy can override a ~15-point individual ranking gap)
    - Return the combination with highest planScore
    - Return value: `{ plan: [{ stepIndex, productId, productName }], planScore, synergyScore, explanations }`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 1.6_

  - [x] 3.2 Implement greedy fallback for >729 combinations
    - If candidate space exceeds 729 (unlikely with top-3 cap, but defensive):
    - Greedy forward selection: fix steps left-to-right, choosing the candidate that maximizes cumulative synergy with already-fixed steps
    - O(steps × candidates) = O(18)
    - _Requirements: 8.3_

  - [x] 3.3 Implement graceful degradation checks
    - If average candidates per step < 2: skip optimization, return rank-1 per step (pure per-step ranking)
    - If InteractionLookup has no data (all interactions empty): return rank-1 per step
    - If a step has only 1 candidate: fix it, don't include in combination search
    - Never select a product that violates a hard constraint regardless of synergy
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. PairBeliefTracker — learned pair effectiveness
  - [x] 4.1 Implement PairBeliefTracker state and schema migration
    - Add `state.pairBeliefs = {}` (key: "productA|productB" alphabetically sorted)
    - Each entry: `{ mu, variance, n, prior }`
    - Schema migration: additive (add pairBeliefs and interactionLookupVersion if missing)
    - Determine current schema version (handoff says v14) and increment appropriately
    - _Requirements: 6.2_

  - [x] 4.2 Implement PairBeliefTracker.update(products, rating)
    - Input: array of product IDs used in a wash day + the rating (1-5)
    - Generate all C(N,2) pairs from the products array
    - For each pair: Normal-Normal conjugate update (same math as existing BeliefTracker)
      - Prior variance: 2.0, observation variance: 1.0
      - Observation value: rating / 5.0 (normalize to 0-1)
    - Initialize new pairs on first observation: mu from domain prior (enables→0.75, blocks→0.25, neutral→0.5), variance 2.0, n 0
    - Increment n for each pair
    - Save updated pairBeliefs to state
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.3 Implement PairBeliefTracker.getAdjustment(productIdA, productIdB)
    - Return 0 if pair has < 5 observations (minimum threshold)
    - Otherwise: `(posteriorMu - priorMu) × confidenceFactor`
    - confidenceFactor = `min(1.0, (n - 5) / 10)` — ramps from 0 to 1 over observations 5-15
    - _Requirements: 6.5_

  - [x] 4.4 Implement PairBeliefTracker.getContradictions()
    - Scan all pairs with 5+ observations
    - Flag pairs where posterior mu crossed to opposite side of 0.5 from prior
      - e.g., prior was 0.75 (enables) but posterior dropped below 0.5 after many low ratings
    - Return array of `{ pair, domainExpectation, learnedReality, observations }`
    - _Requirements: 6.6_

- [x] 5. Integration into buildPlan()
  - [x] 5.1 Modify buildPlan() to use PlanOptimizer
    - After getting baseSteps from WalkthroughEngine, collect top-3 candidates per step via rankProducts()
    - Pass candidates to PlanOptimizer.optimize()
    - Use optimizer's selected products instead of hardcoded walkthrough product IDs
    - Preserve existing logic: use-up rotation overrides, tiered conditioning, domain hard constraints
    - The optimizer runs AFTER domain rules filter candidates (seal-active, use-up, etc.)
    - Attach synergy metadata to each plan step (explanation, pairedWith, selectedOverHigherRank)
    - _Requirements: 2.1, 2.4, 7.3_

  - [x] 5.2 Wire PairBeliefTracker.update() into wash rating flow
    - When a wash is rated: extract all product IDs from the logged event
    - Call PairBeliefTracker.update(productIds, rating)
    - This happens after the existing BeliefTracker.updateBeliefs() call
    - _Requirements: 6.1_

  - [x] 5.3 Wire InteractionLookup rebuild on inventory change
    - Currently inventory doesn't change dynamically (loaded from hardcoded data)
    - Add a rebuild call after any future inventory mutation (defensive)
    - For now: build once on load is sufficient
    - _Requirements: 8.4_

- [x] 6. SynergyExplainer — user-facing text
  - [x] 6.1 Implement SynergyExplainer.explainSelection(productId, plan, interactionLookup)
    - If the product was selected over a higher-ranked alternative due to synergy:
      - Return `{ text, pairedWith, mechanism, overriddenProduct }`
      - Text format: "Pairs with [product] — [mechanism note]"
    - If no synergy influenced selection: return null
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 6.2 Implement SynergyExplainer.explainChain(chain, interactionLookup)
    - Input: a detected chain from SynergyScorer
    - Return `{ products: [names], benefit: "These products form a complementary chain: [A] enables [B] enables [C]" }`
    - _Requirements: 5.5_

  - [x] 6.3 Implement SynergyExplainer.explainAlternativeImpact(alternativeId, currentPlan, stepIndex, interactionLookup)
    - Compute what would happen if this alternative replaced the current product at stepIndex
    - Return `{ impact: 'positive'|'negative'|'neutral', score: number, text: string }`
    - Positive: creates new enables relationships
    - Negative: breaks existing synergy pairings
    - Neutral: no interactions with current plan
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. UI integration — plan display and alternatives
  - [x] 7.1 Add synergy explanation to plan step info popup
  - [x] 7.2 Add synergy impact indicators to alternatives list
  - [x] 7.3 Add chain summary display
  - [x] 7.4 Wire product swap to trigger plan re-evaluation
  - [x] 7.5 Add contradiction insight card

- [x] 8. Testing
  - [x] 8.1 Property-based tests for SynergyScorer (Properties 1-4, 8-10, 14)
  - [x] 8.2 Property-based tests for PlanOptimizer (Properties 5-7, 11-12, 20-21)
  - [x] 8.3 Property-based tests for PairBeliefTracker (Properties 15-19)
  - [ ] 8.4 Unit tests — edge cases and integration

## Notes

- All tasks modify `index.html` (the single-file app) except testing tasks (separate test files)
- Schema migration is additive only — no risk to existing data
- The InteractionLookup is rebuilt on each app load (~40 products × ~3 interactions each = trivial)
- Current inventory has ~10 products with non-empty interactions; the system gracefully degrades for the ~18 with empty arrays (zero synergy contribution, pure per-step ranking)
- SYNERGY_WEIGHT = 15 is a tuning parameter — may need adjustment after real-world testing. Start conservative.
- The PlanOptimizer's bounded exhaustive search (729 max) is well within the 50ms budget on any modern device
- Wildcard interactions (`with: '*'`) are currently used by Wonder Water (enhances all downstream) and OGX oils (reduces all downstream) — these need special handling in the scorer, not the lookup
- The `complements` and `outclassed_by` interaction types exist in current data but aren't in the design doc's weight table — added weights: complements → +0.4, outclassed_by → −0.2
- Tasks 1-4 are pure logic (testable without UI). Tasks 5-7 wire into the app. Task 8 is testing. This allows incremental verification.
