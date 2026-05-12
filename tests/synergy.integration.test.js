/**
 * Integration tests for synergy system — end-to-end with real inventory.
 * Task 8.4 of product-synergy-pairing spec.
 * Feature: product-synergy-pairing
 *
 * Tests the full pipeline: real product interactions → InteractionLookup → SynergyScorer →
 * PlanOptimizer → SynergyExplainer, plus PairBeliefTracker learning and schema migration.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createSynergyModules, extractRealInventory } from './extract-modules.js';

// Extract real inventory once for all integration tests
const REAL_INVENTORY = extractRealInventory();

describe('Feature: product-synergy-pairing — Integration Tests', () => {

  // ===== Real Inventory Interaction Map =====

  describe('Real inventory interaction map', () => {
    let m;

    beforeEach(() => {
      m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);
    });

    it('loreal-21in1 enables nym-curl-talk-gel (leave-in → gel synergy)', () => {
      const interaction = m.InteractionLookup.get('loreal-21in1', 'nym-curl-talk-gel');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('enables');
      // No confidence specified in inventory → defaults to medium → weight 0.6
      expect(interaction.weight).toBe(0.6);
    });

    it('nym-curl-talk-gel blocks marc-anthony-shield (PQ-69 vs polysilicone-29)', () => {
      const interaction = m.InteractionLookup.get('nym-curl-talk-gel', 'marc-anthony-shield');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('blocks');
      expect(interaction.weight).toBe(-0.6); // blocks + medium confidence
    });

    it('nym-curl-talk-gel blocks garnier-diamond-sleek (PQ-69 vs polysilicone-29)', () => {
      const interaction = m.InteractionLookup.get('nym-curl-talk-gel', 'garnier-diamond-sleek');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('blocks');
    });

    it('olaplex-3 complements garnier-pre-shampoo (different bond types)', () => {
      const interaction = m.InteractionLookup.get('olaplex-3', 'garnier-pre-shampoo');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('complements');
      expect(interaction.weight).toBe(0.4); // complements = weight 0.4 (all confidence levels)
    });

    it('garnier-pre-shampoo complements olaplex-3 (bidirectional)', () => {
      // Both products define the same interaction — first definition wins
      const forward = m.InteractionLookup.get('garnier-pre-shampoo', 'olaplex-3');
      const reverse = m.InteractionLookup.get('olaplex-3', 'garnier-pre-shampoo');
      expect(forward).toEqual(reverse);
      expect(forward.type).toBe('complements');
    });

    it('loreal-wonder-water has wildcard enhances interaction', () => {
      const wildcards = m.InteractionLookup.getWildcards();
      const wonderWater = wildcards.find(w => w.productId === 'loreal-wonder-water');
      expect(wonderWater).toBeDefined();
      expect(wonderWater.type).toBe('enhances');
      expect(wonderWater.weight).toBe(0.5); // enhances = weight 0.5
    });

    it('everpure-glossing-mask complements everpure-bond-conditioner', () => {
      const interaction = m.InteractionLookup.get('everpure-glossing-mask', 'everpure-bond-conditioner');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('complements');
    });

    it('products with no interactions return null from lookup', () => {
      // everpure-bond-shampoo has no interactions defined
      const interaction = m.InteractionLookup.get('everpure-bond-shampoo', 'garnier-color-repair-cond');
      expect(interaction).toBeNull();
    });
  });


  // ===== Optimizer with Real Product Candidates =====

  describe('Optimizer with real product candidates', () => {

    it('synergy override: loreal-21in1 selected over higher-ranked leave-in when nym-curl-talk-gel is in plan', () => {
      // Simulate a curly day plan where gel is fixed and leave-in is variable
      const inv = [...REAL_INVENTORY, {
        id: 'fake-leave-in', name: 'Fake Leave-In', brand: 'Test', tier: 'primary',
        intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] }
      }];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // loreal-21in1 enables nym-curl-talk-gel (weight 0.6 at medium confidence)
      // SYNERGY_WEIGHT=15, synergy contribution = 0.6 * 15 = 9
      // Score gap must be < 9 for synergy to override
      const candidates = [
        [
          { productId: 'fake-leave-in', score: 83 }, // 8 points higher (< 9 synergy gain)
          { productId: 'loreal-21in1', score: 75 },  // has enables with gel
        ],
        [{ productId: 'nym-curl-talk-gel', score: 90 }], // fixed (single candidate)
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      expect(result.plan[0].productId).toBe('loreal-21in1');
      expect(result.plan[0].selectedOverHigherRank).toBe(true);
    });

    it('blocking avoidance: optimizer avoids nym-curl-talk-gel + marc-anthony-shield in same plan', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      // Both are real products with a blocks interaction
      // If gel is fixed and heat protection has marc-anthony as highest-ranked,
      // the blocking penalty should push optimizer to garnier-diamond-sleek... but both block gel.
      // So the optimizer should still pick the highest-ranked heat protectant since both block equally.
      const candidates = [
        [{ productId: 'nym-curl-talk-gel', score: 90 }], // fixed
        [
          { productId: 'marc-anthony-shield', score: 80 },
          { productId: 'garnier-diamond-sleek', score: 78 },
        ],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      // Both heat protectants block the gel equally, so highest individual score wins
      expect(result.plan[1].productId).toBe('marc-anthony-shield');
      // Synergy score should be negative (blocking)
      expect(result.synergyScore).toBeLessThan(0);
    });

    it('rank-1 fallback when no interactions exist between candidates', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      // Products with no interactions between them
      const candidates = [
        [
          { productId: 'everpure-bond-shampoo', score: 85 },
          { productId: 'everpure-clarifying', score: 70 },
        ],
        [
          { productId: 'garnier-color-repair-cond', score: 90 },
          { productId: 'everpure-bond-conditioner', score: 80 },
        ],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      // No interactions → rank-1 (highest individual score) wins
      expect(result.plan[0].productId).toBe('everpure-bond-shampoo');
      expect(result.plan[1].productId).toBe('garnier-color-repair-cond');
      expect(result.synergyScore).toBe(0);
    });
  });


  // ===== SynergyScorer with Real Plans =====

  describe('SynergyScorer with real plans', () => {

    it('enables chain: loreal-21in1 → nym-curl-talk-gel produces positive score', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const plan = [
        { stepIndex: 0, productId: 'loreal-21in1' },
        { stepIndex: 1, productId: 'nym-curl-talk-gel' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.score).toBeGreaterThan(0);
      expect(result.pairContributions.length).toBeGreaterThan(0);
      // enables has positive baseWeight (0.6 at medium confidence)
      expect(result.pairContributions[0].baseWeight).toBe(0.6);
      expect(result.pairContributions[0].contribution).toBeGreaterThan(0);
    });

    it('blocking pair: nym-curl-talk-gel + marc-anthony-shield produces negative score', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const plan = [
        { stepIndex: 0, productId: 'nym-curl-talk-gel' },
        { stepIndex: 1, productId: 'marc-anthony-shield' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.score).toBeLessThan(0);
      // blocks has negative baseWeight (-0.6 at medium confidence)
      expect(result.pairContributions.some(c => c.baseWeight < 0)).toBe(true);
    });

    it('wildcard contribution: loreal-wonder-water enhances all downstream products', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const plan = [
        { stepIndex: 0, productId: 'loreal-wonder-water' },
        { stepIndex: 1, productId: 'garnier-color-repair-cond' },
        { stepIndex: 2, productId: 'loreal-21in1' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.score).toBeGreaterThan(0);
      // Should have wildcard contributions for both downstream products
      const wcContribs = result.pairContributions.filter(c => c.note && c.note.includes('wildcard'));
      expect(wcContribs.length).toBe(2);
    });

    it('complements pair: olaplex-3 + garnier-pre-shampoo produces positive score', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const plan = [
        { stepIndex: 0, productId: 'olaplex-3' },
        { stepIndex: 1, productId: 'garnier-pre-shampoo' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.score).toBeGreaterThan(0);
      // complements has positive baseWeight (0.4)
      expect(result.pairContributions[0].baseWeight).toBe(0.4);
    });

    it('multi-step plan with mixed interactions scores correctly', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      // Wonder water (wildcard enhances) + leave-in (enables gel) + gel (blocks heat protectant)
      const plan = [
        { stepIndex: 0, productId: 'loreal-wonder-water' },
        { stepIndex: 1, productId: 'loreal-21in1' },
        { stepIndex: 2, productId: 'nym-curl-talk-gel' },
        { stepIndex: 3, productId: 'marc-anthony-shield' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      // Has both positive (wonder-water wildcards, 21in1→gel enables) and negative (gel→shield blocks)
      expect(result.pairContributions.length).toBeGreaterThan(2);
      const positives = result.pairContributions.filter(c => c.contribution > 0);
      const negatives = result.pairContributions.filter(c => c.contribution < 0);
      expect(positives.length).toBeGreaterThan(0);
      expect(negatives.length).toBeGreaterThan(0);
    });
  });


  // ===== PairBeliefTracker End-to-End =====

  describe('PairBeliefTracker end-to-end', () => {

    it('update records beliefs for product pairs from a wash rating', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      m.PairBeliefTracker.update(['loreal-21in1', 'nym-curl-talk-gel'], 5);

      const belief = m.PairBeliefTracker.getBelief('loreal-21in1', 'nym-curl-talk-gel');
      expect(belief).not.toBeNull();
      expect(belief.n).toBe(1);
      expect(belief.mu).toBeGreaterThan(0); // 5/5 = 1.0 observation, should push mu up
    });

    it('getAdjustment returns 0 below MIN_OBSERVATIONS threshold (5)', () => {
      const m = createSynergyModules({ inventory: [], pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build([]);

      // 4 observations — below threshold
      for (let i = 0; i < 4; i++) {
        m.PairBeliefTracker.update(['product-a', 'product-b'], 5);
      }

      const adj = m.PairBeliefTracker.getAdjustment('product-a', 'product-b');
      expect(adj).toBe(0);
    });

    it('getAdjustment returns non-zero after MIN_OBSERVATIONS threshold', () => {
      const m = createSynergyModules({ inventory: [], pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build([]);

      // 6 observations of high rating — above threshold
      for (let i = 0; i < 6; i++) {
        m.PairBeliefTracker.update(['product-a', 'product-b'], 5);
      }

      const adj = m.PairBeliefTracker.getAdjustment('product-a', 'product-b');
      expect(adj).not.toBe(0);
      expect(adj).toBeGreaterThan(0); // high ratings → positive adjustment
    });

    it('contradictions detected when posterior crosses 0.5 from opposite side of prior', () => {
      // Create a pair with enables interaction (prior = 0.75, above 0.5)
      // Then feed it consistently low ratings to push posterior below 0.5
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'test' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Feed 20 low ratings (1/5 = 0.2) to push posterior well below 0.5
      for (let i = 0; i < 20; i++) {
        m.PairBeliefTracker.update(['a', 'b'], 1);
      }

      const contradictions = m.PairBeliefTracker.getContradictions();
      expect(contradictions.length).toBe(1);
      expect(contradictions[0].productA).toBe('a');
      expect(contradictions[0].productB).toBe('b');
      expect(contradictions[0].domainExpectation).toBe('positive');
      expect(contradictions[0].learnedReality).toBe('negative');
    });

    it('belief-influenced optimization: learned positive pair gets boosted', () => {
      // Products need an interaction defined for beliefs to apply (scorer only adds
      // learnedAdjustment when interaction exists in lookup)
      const inv = [
        { id: 'top', name: 'Top', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'learned', name: 'Learned', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'neutral', note: 'No inherent synergy' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Feed 15 high ratings for learned+partner pair (above RAMP threshold for full confidence)
      for (let i = 0; i < 15; i++) {
        m.PairBeliefTracker.update(['learned', 'partner'], 5);
      }

      const candidates = [
        [
          { productId: 'top', score: 82 },
          { productId: 'learned', score: 80 },
        ],
        [{ productId: 'partner', score: 70 }],
      ];

      // With beliefs, the learned pair should get a positive adjustment
      const resultWithBeliefs = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, m.PairBeliefTracker, {});
      // Without beliefs, top should win (higher individual score, neutral interaction = 0 weight)
      const resultWithout = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

      // The belief adjustment should make the plan scores differ
      expect(resultWithBeliefs.planScore).not.toBe(resultWithout.planScore);
      // With strong positive beliefs, learned should be boosted
      expect(resultWithBeliefs.plan[0].productId).toBe('learned');
    });
  });


  // ===== Schema Migration =====

  describe('Schema migration', () => {

    it('v15 state loads correctly with pairBeliefs', () => {
      const state = {
        inventory: [
          { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        ],
        pairBeliefs: {
          'a|b': { mu: 0.8, variance: 0.5, n: 10, prior: 0.75 }
        },
        version: 15,
      };
      const m = createSynergyModules(state);
      m.InteractionLookup.build(state.inventory);

      const belief = m.PairBeliefTracker.getBelief('a', 'b');
      expect(belief).not.toBeNull();
      expect(belief.mu).toBe(0.8);
      expect(belief.n).toBe(10);
    });

    it('pre-v15 state without pairBeliefs is handled gracefully', () => {
      const state = {
        inventory: [
          { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        ],
        version: 14,
        // No pairBeliefs field
      };
      const m = createSynergyModules(state);
      m.InteractionLookup.build(state.inventory);

      // Should not throw — graceful handling of missing pairBeliefs
      const belief = m.PairBeliefTracker.getBelief('a', 'b');
      expect(belief).toBeNull();

      const adj = m.PairBeliefTracker.getAdjustment('a', 'b');
      expect(adj).toBe(0);

      const contradictions = m.PairBeliefTracker.getContradictions();
      expect(contradictions).toEqual([]);
    });

    it('PairBeliefTracker.update initializes pairBeliefs if missing from state', () => {
      const state = {
        inventory: [
          { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
          { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        ],
        version: 14,
        // No pairBeliefs
      };
      const m = createSynergyModules(state);
      m.InteractionLookup.build(state.inventory);

      // Should not throw — creates pairBeliefs on first update
      m.PairBeliefTracker.update(['a', 'b'], 4);

      const belief = m.PairBeliefTracker.getBelief('a', 'b');
      expect(belief).not.toBeNull();
      expect(belief.n).toBe(1);
    });
  });


  // ===== SynergyExplainer with Real Products =====

  describe('SynergyExplainer with real products', () => {

    it('explains loreal-21in1 selection when paired with nym-curl-talk-gel', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const plan = [
        { stepIndex: 0, productId: 'loreal-21in1' },
        { stepIndex: 1, productId: 'nym-curl-talk-gel' },
      ];

      const result = m.SynergyExplainer.explainSelection('loreal-21in1', plan, m.InteractionLookup);
      expect(result).not.toBeNull();
      expect(result.pairedWith).toBe('nym-curl-talk-gel');
      expect(result.text).toContain("Not Your Mother's Curl Talk Flash Freeze Gel");
      expect(result.mechanism).toContain('Apply lightly before gel');
    });

    it('explains alternative impact: replacing loreal-21in1 with a non-synergy leave-in is negative', () => {
      const inv = [...REAL_INVENTORY, {
        id: 'generic-leave-in', name: 'Generic Leave-In', brand: 'Generic', tier: 'primary',
        intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] }
      }];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'loreal-21in1' },
        { stepIndex: 1, productId: 'nym-curl-talk-gel' },
      ];

      // Replacing loreal-21in1 (which enables gel) with generic (no interactions) = negative
      const result = m.SynergyExplainer.explainAlternativeImpact('generic-leave-in', currentPlan, 0, m.InteractionLookup);
      expect(result.impact).toBe('negative');
      expect(result.score).toBeLessThan(0);
    });

    it('explains alternative impact: adding synergy where none existed is positive', () => {
      const m = createSynergyModules({ inventory: REAL_INVENTORY, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(REAL_INVENTORY);

      const currentPlan = [
        { stepIndex: 0, productId: 'everpure-bond-conditioner' }, // no interactions with gel
        { stepIndex: 1, productId: 'nym-curl-talk-gel' },
      ];

      // loreal-21in1 enables nym-curl-talk-gel — swapping it in should be positive
      const result = m.SynergyExplainer.explainAlternativeImpact('loreal-21in1', currentPlan, 0, m.InteractionLookup);
      expect(result.impact).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });
  });

});
