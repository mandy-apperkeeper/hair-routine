# Implementation Plan: Product Intelligence System

## Overview

Adds a product intelligence layer to the hair routine app (`index.html`). Builds on the existing `intelligence` field already present on inventory products. Implementation is additive — no existing functionality is removed or broken.

Single-file architecture: all code goes into `index.html`. Deployed to GitHub Pages via push to main.

## Tasks

- [ ] 1. Ingredient Knowledge Base
  - [x] 1.1 Create IngredientKB module with ~100 hair care ingredients
    - Embed as a JavaScript object literal in `index.html`
    - Each entry: INCI name (key), common name, functional roles array, mechanism description, molecular weight class, flags array, interaction flags array, outcome weights object
    - Organize by functional role: cuticle_smoothing, bond_repair, protein_fill, humidity_barrier, conditioning, penetrating_oil, humectant, clarifying, heat_protection, hold
    - Include all ingredients present in Mandy's 24 current products (from HAIR_CONSULTATION_HANDOFF.md and PHASE1_INGREDIENT_FUNCTION_MAP.md)
    - Add ~75 additional common hair care ingredients for the discovery parser
    - Include lookup functions: `getByRole(role)`, `getByName(name)`, `fuzzyMatch(input)`, `getInteractionFlags(ingredientName)`
    - Target size: 40-60KB uncompressed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Add ingredient lists to DEFAULT_INVENTORY products
    - Add an `ingredients` array to each of the 24 default products containing their key INCI ingredients (not full lists — just the functionally relevant ones)
    - Source: INCIDecoder lookups already done in consultation handoff and Phase 1 research
    - This enables the DiscoveryParser to work on existing products as examples
    - _Requirements: 2.1, 8.2_

  - [x] 1.3 Schema migration v4 → v5 (PARTIALLY DONE — step/subStep rename complete, beliefs + ingredients NOT yet added)
    - [x] Rename `intelligence.phase` → `intelligence.step` across all products
    - [x] Add `subStep` property for wash-phase products (shampoo, conditioner, clarify, glossing, deep_condition)
    - [x] Bump schema version to 5
    - [x] v4→v5 migration code (renames phase→step, adds subStep from lookup)
    - [x] Add `state.beliefs` object (initialized from product intelligence priors)
    - [x] Add `state.discoveredInteractions` array (empty)
    - [x] Add `ingredients` field to existing inventory products
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 2. BeliefTracker Module
  - [x] 2.1 Implement BeliefTracker with Bayesian updating
    - `initBeliefs(inventory)` — create prior beliefs for all products from their intelligence.outcomes
    - `updateBeliefs(washEvent)` — after a wash is logged, update beliefs for all products used based on the rating
    - `getBelief(productId, outcome)` — returns { mu, variance, n, confidence }
    - `getConfidence(belief)` — returns 0-1 based on 80% credible interval width
    - `getCredibleInterval(belief, level)` — returns [lower, upper]
    - Normal-Normal conjugate model: prior variance 2.0, observation variance 1.0
    - Store beliefs in state.beliefs (persisted to localStorage)
    - _Requirements: 4.3, 7.4, 9.2_

  - [x] 2.2 Wire BeliefTracker into wash event logging
    - After `StateManager.saveWashEvent()`, call `BeliefTracker.updateBeliefs(event)`
    - Only update beliefs for products that were used in the wash
    - Only update when a rating is provided (skip if rating is null)
    - Map 5-point emoji rating to 1-5 numeric scale for Bayesian update
    - _Requirements: 4.3_

- [ ] 3. Checkpoint — verify data layer
  - Verify schema migration works (fresh state + existing v4 state)
  - Verify IngredientKB loads without errors
  - Verify BeliefTracker initializes and updates correctly
  - Verify existing app functionality is unchanged (walkthrough, history, quick-log still work)

- [x] 4. Phase-Based Quick-Log Redesign (DONE — completed in Sessions 12-13)
  - [x] 4.1 Replace ACTIVITY_PRODUCTS mapping with phase-based grouping
    - Products grouped by `intelligence.step`: pre_wash, wash, post_wash, style
    - Phase headers rendered with products as checkboxes
    - Lane auto-detected from selected style products
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 4.2 Implement smart pre-selection (DEFERRED to Recommendation Engine 8.1-8.2)
    - Pre-selection should be driven by BeliefTracker posteriors + product ratings + current conditions
    - NOT by recency (recency biases toward repeating routines and harms use-up rotation)
    - Will be wired in when RecommendationEngine.getRecommendations() exists
    - _Requirements: 3.4_

  - [ ] 4.3 Add quick-add for unlisted products
    - "Add a product not listed" expandable section at bottom of quick-log
    - Minimal form: name + brand + phase (dropdown)
    - Adds to inventory with minimal intelligence stub
    - Immediately available for selection in current log
    - _Requirements: 3.5, 6.5_

- [ ] 5. Checkpoint — verify quick-log
  - Test phase grouping renders correctly with all 24 products
  - Test pre-selection logic with mock wash history
  - Test quick-add flow
  - Verify logged events still contain correct product arrays

- [x] 6. Attribution Engine (Passive Intelligence)
  - [x] 6.1 Implement mechanism-based attribution
    - `AttributionEngine.explain(washEvent)` — given a wash event's products, return outcome attributions
    - For each outcome dimension, identify which products contribute (from their intelligence.outcomes)
    - Group contributors by outcome, generate human-readable explanations using IngredientKB mechanism descriptions
    - Available from day 1 (no user data needed)
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Implement marginal contribution detection
    - `AttributionEngine.getMarginalInsights(productId)` — compare ratings with/without this product
    - Requires minimum 3 events in each group (with and without)
    - Calculate mean difference + Wilson score lower bound for reliability
    - Flag confounders: note if conditions (dew point, interval) differ between groups
    - _Requirements: 4.4_

  - [x] 6.3 Implement contextual pattern detection
    - `AttributionEngine.getContextualPatterns()` — find product × condition interactions
    - Stratify by dew point category (dry/moderate/humid) and interval bucket
    - Requires 15+ total events with sufficient variation
    - Output: "In humid conditions, Got2b outperforms NYM by X points (n₁ vs n₂ observations)"
    - _Requirements: 4.5_

  - [x] 6.4 Implement interaction detection (future-ready, activates at 30+ events)
    - `AttributionEngine.getInteractions()` — find synergies/interferences
    - For product pairs that vary independently: compare A-alone, B-alone, A+B, neither
    - Synergy: observed(A+B) > expected(A) + expected(B) - baseline by >0.5 points
    - Requires 5+ observations in each cell — will be empty for months of typical use
    - _Requirements: 4.6_

  - [x] 6.5 Build post-wash attribution card UI (DONE — completed in Session 12)
    - Renders after wash logging, shows "What today's routine targeted"
    - Emoji icons per outcome dimension, contributing products listed
    - Auto-dismisses after 10s
    - _Requirements: 4.1, 4.2, 7.1, 7.2, 7.3_

- [ ] 7. Checkpoint — verify passive intelligence
  - Test attribution with a mock wash event (mechanism-based)
  - Test marginal contribution with mock history (5+ events with variation)
  - Verify attribution card renders correctly
  - Verify no performance regression on quick-log or landing page

- [ ] 8. Recommendation Engine (Active Intelligence)
  - [ ] 8.1 Implement domain rule recommendations
    - `RecommendationEngine.getRecommendations(conditions)` — returns product suggestions
    - Tier 1 rules (always active):
      - Amodimethicone conditioner every wash
      - Got2b over NYM when dew point > 60°F
      - Don't use curly products while seal is active
      - Clarify before protein treatment if >7 days since last clarify
    - Each recommendation includes: productId, reason (human-readable), confidence tier, mechanism basis
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 8.2 Implement data-driven recommendations
    - Tier 2 (3+ events): Surface products where Bayesian posterior strongly deviates from prior
    - Tier 3 (10+ events): Surface products that correlate with good outcomes in similar conditions
    - Use BeliefTracker confidence to gate recommendations
    - Include "missing step" warnings: products usually used that correlate with better ratings
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ] 8.3 Implement conflict warnings
    - Check current conditions + selected products against InteractionGraph
    - Warn about: blocking interactions, products that perform poorly in current dew point, seal state conflicts
    - Each warning includes: what's wrong, why, what to do instead
    - _Requirements: 5.4_

  - [ ] 8.4 Build pre-wash recommendation card UI
    - Renders on landing screen when dew point is known
    - Shows current conditions (dew point, days since last wash, seal state)
    - Shows recommended products with explanations
    - Shows warnings if any
    - "Start walkthrough" button at bottom
    - Only shows personalized recommendations after 3+ events (domain rules show immediately)
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 7.1, 7.2_

- [ ] 9. Checkpoint — verify active intelligence
  - Test domain rules fire correctly for various conditions
  - Test that recommendations don't appear with <3 events (except domain rules)
  - Test conflict warnings with seal state active
  - Verify recommendation card renders correctly on landing

- [ ] 10. Product Discovery
  - [ ] 10.1 Implement DiscoveryParser module
    - `DiscoveryParser.parse(ingredientListText)` — parse comma-separated ingredient list
    - Normalize each ingredient (lowercase, trim, remove parentheticals like "(and)" or "(CI 12345)")
    - Match against IngredientKB: exact match first, then fuzzy (Levenshtein distance ≤ 2 for short names, ≤ 3 for long)
    - Aggregate results: collect all roles, flags, outcome weights from matched ingredients
    - Determine phase placement from roles (clarifying → wash, hold → style, protein → pre_wash, etc.)
    - Check for interaction flags against existing inventory products
    - Return: { matched: [...], unmatched: [...], detectedRoles: [...], suggestedPhase: '...', interactions: [...], outcomeProfile: {...} }
    - _Requirements: 6.1, 6.2_

  - [ ] 10.2 Build product discovery form UI
    - Accessible from inventory view ("Add Product" button)
    - Step 1: Name + Brand (text inputs)
    - Step 2: Ingredient list (textarea, "Paste from bottle or type key ingredients")
    - Step 3: Auto-detection results — show matched ingredients with their roles, suggested phase, detected outcomes
    - Step 4: User confirmation — checkboxes to accept/reject each detection, manual phase override dropdown
    - "Save to Inventory" button creates the product with full intelligence metadata
    - If no ingredient list provided: skip to manual assignment (phase dropdown + mechanism checkboxes)
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ] 10.3 Implement Open Beauty Facts lookup (progressive enhancement)
    - When online: "Look up this product?" button after entering name/brand
    - Fetch from Open Beauty Facts API: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=...&json=1`
    - If found: auto-fill ingredient list textarea from API response
    - If not found or offline: graceful fallback ("Product not found in database — paste ingredients manually")
    - This is optional — the app works fully without it
    - _Requirements: 6.4_

- [ ] 11. Checkpoint — verify discovery
  - Test DiscoveryParser with known product ingredient lists (verify correct role detection)
  - Test discovery form end-to-end (add a new product, verify it appears in inventory and quick-log)
  - Test Open Beauty Facts lookup (online) and graceful offline fallback
  - Verify new products integrate with attribution and recommendation engines

- [ ] 12. Integration & Polish
  - [ ] 12.1 Wire all intelligence surfaces into navigation flow
    - Post-wash attribution card appears after logging (before rating)
    - Pre-wash recommendation card appears on landing (when conditions known)
    - Discovery form accessible from inventory
    - Marginal insights appear in history view (per-event detail)
    - Confidence labels consistent across all surfaces
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 12.2 Implement "contradicts domain" surfacing
    - When Bayesian posterior for a product diverges significantly from domain prior (>1.5 SD), surface a special insight
    - "Hair science predicts X helps with shine, but your data suggests otherwise (N wash days)"
    - This validates or challenges the domain knowledge for Mandy's specific hair
    - _Requirements: 7.5_

  - [ ] 12.3 Performance verification
    - Measure IngredientKB size (must be <100KB uncompressed)
    - Measure belief update time (must be <10ms)
    - Measure quick-log render time with full inventory (must be <100ms)
    - Measure total file size increase (target: <100KB added)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 12.4 Accessibility pass on new UI components
    - Attribution card: aria-live for dynamic content, semantic headings
    - Recommendation card: aria-live, clear action buttons with labels
    - Discovery form: proper label associations, error messages, focus management
    - Quick-log phase groups: fieldset/legend or equivalent ARIA grouping
    - All new touch targets: 48×48dp minimum
    - _Requirements: (accessibility standards from original spec)_

- [ ] 13. Final checkpoint
  - Full end-to-end test: fresh install → log 3 washes → verify intelligence surfaces activate
  - Verify schema migration from v4 state
  - Verify existing features unchanged (walkthrough, history, compensation, cooldown)
  - Verify offline functionality (service worker caches new content)
  - Deploy to GitHub Pages and test on iPad

## Notes

- Each task modifies `index.html` (single-file architecture)
- Tasks build on each other sequentially — later tasks depend on earlier ones
- Checkpoints are verification gates, not blocking — if something minor is off, note it and continue
- The IngredientKB (task 1.1) is the largest single addition (~40-60KB of data). Consider whether to embed inline or load from a separate JSON file cached by the service worker. Decision: inline (simpler, guaranteed offline, no async loading complexity).
- The existing `intelligence` field on products is already close to the target schema — migration is mostly additive (adding `ingredients` array and initializing beliefs)
- Open Beauty Facts API (task 10.3) uses the Open Food Facts search endpoint which also covers beauty products. Coverage for US drugstore hair products is uncertain — this is a best-effort enhancement.
