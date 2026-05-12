/**
 * Unit tests for synergy system — edge cases and specific scenarios.
 * Task 8.4 of product-synergy-pairing spec.
 * Feature: product-synergy-pairing
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createSynergyModules } from './extract-modules.js';

describe('Feature: product-synergy-pairing — Unit Tests', () => {

  // === InteractionLookup ===

  describe('InteractionLookup', () => {

    it('single-candidate steps are fixed and skipped by optimizer', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'A enables B' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Each step has only 1 candidate — optimizer should return rank-1 without scoring
      const candidates = [
        [{ productId: 'a', score: 80 }],
        [{ productId: 'b', score: 70 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      expect(result.plan[0].productId).toBe('a');
      expect(result.plan[1].productId).toBe('b');
      // With only single candidates, no synergy override is possible
      expect(result.plan[0].selectedOverHigherRank).toBe(false);
      expect(result.plan[1].selectedOverHigherRank).toBe(false);
    });

    it('wildcard interactions are stored separately and not in the pair map', () => {
      const inv = [
        { id: 'wonder-water', name: 'Wonder Water', brand: 'LOreal', tier: 'primary', intelligence: { step: 'gloss', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: '*', type: 'enhances', confidence: 'high', note: 'Enhances all downstream products' }] } },
        { id: 'gel', name: 'Gel', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Wildcard should NOT create a specific pair entry
      expect(m.InteractionLookup.get('wonder-water', 'gel')).toBeNull();

      // But wildcards should be accessible
      const wildcards = m.InteractionLookup.getWildcards();
      expect(wildcards.length).toBe(1);
      expect(wildcards[0].productId).toBe('wonder-water');
      expect(wildcards[0].type).toBe('enhances');
      expect(wildcards[0].weight).toBe(0.5);
    });

    it('wildcard interactions contribute to synergy score for downstream products', () => {
      const inv = [
        { id: 'wonder-water', name: 'Wonder Water', brand: 'LOreal', tier: 'primary', intelligence: { step: 'gloss', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: '*', type: 'enhances', confidence: 'high', note: 'Enhances all downstream' }] } },
        { id: 'gel', name: 'Gel', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'oil', name: 'Oil', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'wonder-water' },
        { stepIndex: 1, productId: 'gel' },
        { stepIndex: 2, productId: 'oil' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      // Wonder Water enhances both downstream products
      expect(result.score).toBeGreaterThan(0);
      // Should have wildcard contributions in pairContributions
      const wcContribs = result.pairContributions.filter(c => c.note && c.note.includes('wildcard'));
      expect(wcContribs.length).toBe(2); // gel + oil
    });

    it('wildcard does NOT apply to upstream products', () => {
      const inv = [
        { id: 'shampoo', name: 'Shampoo', brand: '', tier: 'primary', intelligence: { step: 'shampoo', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'wonder-water', name: 'Wonder Water', brand: 'LOreal', tier: 'primary', intelligence: { step: 'gloss', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: '*', type: 'enhances', confidence: 'high', note: 'Enhances all downstream' }] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'shampoo' },
        { stepIndex: 1, productId: 'wonder-water' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      // Shampoo is upstream of wonder-water, so no wildcard contribution
      expect(result.score).toBe(0);
    });

    it('bidirectional lookup works regardless of query order', () => {
      const inv = [
        { id: 'alpha', name: 'Alpha', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'beta', type: 'enables', confidence: 'high', note: 'test' }] } },
        { id: 'beta', name: 'Beta', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const forward = m.InteractionLookup.get('alpha', 'beta');
      const reverse = m.InteractionLookup.get('beta', 'alpha');
      expect(forward).not.toBeNull();
      expect(reverse).not.toBeNull();
      expect(forward).toEqual(reverse);
    });

    it('first definition wins when both products define the same interaction', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'A says enables' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'a', type: 'blocks', confidence: 'high', note: 'B says blocks' }] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const result = m.InteractionLookup.get('a', 'b');
      // 'a' comes first in inventory iteration, so its definition wins
      expect(result.type).toBe('enables');
      expect(result.note).toBe('A says enables');
    });
  });


  // === PlanOptimizer Edge Cases ===

  describe('PlanOptimizer', () => {

    it('graceful fallback: returns rank-1 when no interactions exist', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const candidates = [
        [{ productId: 'a', score: 80 }, { productId: 'c', score: 60 }],
        [{ productId: 'b', score: 70 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      // With no interactions, rank-1 (highest individual score) should win
      expect(result.plan[0].productId).toBe('a');
      expect(result.plan[1].productId).toBe('b');
    });

    it('hard constraints exclude products regardless of synergy', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'strong synergy' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const candidates = [
        [{ productId: 'a', score: 90 }, { productId: 'c', score: 50 }],
        [{ productId: 'b', score: 70 }],
      ];

      // Exclude 'a' via hard constraint — even though it has synergy with 'b'
      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, { hardConstraints: ['a'] });
      expect(result.plan[0].productId).toBe('c');
    });

    it('candidate cap at 3 per step', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'd', name: 'D', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'e', name: 'E', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'd', type: 'enables', confidence: 'high', note: 'test' }] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // 5 candidates for step 0 — only top 3 should be considered
      const candidates = [
        [{ productId: 'a', score: 90 }, { productId: 'b', score: 80 }, { productId: 'c', score: 70 }, { productId: 'd', score: 60 }],
        [{ productId: 'e', score: 50 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      // 'd' has synergy with 'e' but is the 4th candidate — should be excluded by cap
      expect(result.plan[0].productId).not.toBe('d');
    });

    it('synergy can override individual rank when gain exceeds score gap', () => {
      const inv = [
        { id: 'top-ranked', name: 'Top', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'synergy-pick', name: 'Synergy', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: 'strong synergy' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // top-ranked has 10 more individual points, but synergy-pick has enables (weight 1.0)
      // with SYNERGY_WEIGHT=15, synergy contribution = 1.0 * 15 = 15 > 10 point gap
      const candidates = [
        [{ productId: 'top-ranked', score: 80 }, { productId: 'synergy-pick', score: 70 }],
        [{ productId: 'partner', score: 60 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      expect(result.plan[0].productId).toBe('synergy-pick');
      expect(result.plan[0].selectedOverHigherRank).toBe(true);
    });

    it('synergy does NOT override when gap exceeds synergy gain', () => {
      const inv = [
        { id: 'top-ranked', name: 'Top', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'synergy-pick', name: 'Synergy', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'low', note: 'weak synergy' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // top-ranked has 20 more individual points, synergy-pick has enables+low (weight 0.3)
      // synergy contribution = 0.3 * 15 = 4.5 < 20 point gap
      const candidates = [
        [{ productId: 'top-ranked', score: 90 }, { productId: 'synergy-pick', score: 70 }],
        [{ productId: 'partner', score: 60 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      expect(result.plan[0].productId).toBe('top-ranked');
    });

    it('empty step candidates are handled gracefully', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const candidates = [
        [{ productId: 'a', score: 80 }],
        [], // empty step
      ];

      // Should not throw
      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      expect(result.plan.length).toBe(1);
      expect(result.plan[0].productId).toBe('a');
    });
  });


  // === SynergyExplainer ===

  describe('SynergyExplainer', () => {

    it('explainSelection returns null when product has no positive interactions in plan', () => {
      const inv = [
        { id: 'a', name: 'A', brand: 'BrandA', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: 'BrandB', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'b' }];
      const result = m.SynergyExplainer.explainSelection('a', plan, m.InteractionLookup);
      expect(result).toBeNull();
    });

    it('explainSelection returns text with partner name and mechanism for positive interaction', () => {
      const inv = [
        { id: 'a', name: 'Leave-In', brand: 'LOreal', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'Preps cuticle for gel' }] } },
        { id: 'b', name: 'Gel', brand: 'NYM', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'b' }];
      const result = m.SynergyExplainer.explainSelection('a', plan, m.InteractionLookup);
      expect(result).not.toBeNull();
      expect(result.text).toContain('NYM Gel');
      expect(result.text).toContain('Preps cuticle for gel');
      expect(result.pairedWith).toBe('b');
      expect(result.mechanism).toBe('Preps cuticle for gel');
    });

    it('explainSelection picks the strongest interaction when multiple exist', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [
          { with: 'b', type: 'enhances', confidence: 'high', note: 'Weak synergy' },
          { with: 'c', type: 'enables', confidence: 'high', note: 'Strong synergy' }
        ] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'a' },
        { stepIndex: 1, productId: 'b' },
        { stepIndex: 2, productId: 'c' },
      ];
      const result = m.SynergyExplainer.explainSelection('a', plan, m.InteractionLookup);
      // enables (weight 1.0) > enhances (weight 0.5)
      expect(result.pairedWith).toBe('c');
      expect(result.mechanism).toBe('Strong synergy');
    });

    it('explainSelection returns null for blocking interactions (negative weight)', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'blocks', confidence: 'high', note: 'Conflict' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'b' }];
      const result = m.SynergyExplainer.explainSelection('a', plan, m.InteractionLookup);
      expect(result).toBeNull();
    });

    it('explainChain returns null for chains shorter than 3', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      expect(m.SynergyExplainer.explainChain({ products: ['a', 'b'], bonus: 1 }, m.InteractionLookup)).toBeNull();
      expect(m.SynergyExplainer.explainChain(null, m.InteractionLookup)).toBeNull();
      expect(m.SynergyExplainer.explainChain({ products: [], bonus: 0 }, m.InteractionLookup)).toBeNull();
    });

    it('explainChain returns product names and benefit text for valid chain', () => {
      const inv = [
        { id: 'a', name: 'Shampoo', brand: 'Brand', tier: 'primary', intelligence: { step: 'shampoo', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'Cleanses for conditioner' }] } },
        { id: 'b', name: 'Conditioner', brand: 'Brand', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: 'Smooths for leave-in' }] } },
        { id: 'c', name: 'Leave-In', brand: 'Brand', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const chain = { products: ['a', 'b', 'c'], bonus: 2.5 };
      const result = m.SynergyExplainer.explainChain(chain, m.InteractionLookup);
      expect(result).not.toBeNull();
      expect(result.productNames).toEqual(['Brand Shampoo', 'Brand Conditioner', 'Brand Leave-In']);
      expect(result.benefit).toContain('Brand Shampoo');
      expect(result.benefit).toContain('\u2192'); // arrow character
      expect(result.benefit).toContain('Cleanses for conditioner');
    });

    it('explainAlternativeImpact returns positive for alternative with enables interaction', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'alt', name: 'Alternative', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: 'Enables partner' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];
      const result = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(result.impact).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
      expect(result.text).toBe('Enables partner');
    });

    it('explainAlternativeImpact returns negative when replacing a product that has synergy', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: 'Current enables partner' }] } },
        { id: 'alt', name: 'Alternative', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];
      const result = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(result.impact).toBe('negative');
      expect(result.score).toBeLessThan(0);
      expect(result.text).toContain('break');
    });

    it('explainAlternativeImpact returns neutral when no interactions exist', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'alt', name: 'Alternative', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];
      const result = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(result.impact).toBe('neutral');
      expect(result.score).toBe(0);
      expect(result.text).toBe('No known interaction');
    });
  });


  // === Performance Benchmark ===

  describe('Performance', () => {

    it('optimizer completes within 50ms for max candidate space (3^6 = 729 combinations)', () => {
      // Build a 6-step plan with 3 candidates each — worst case
      const inv = [];
      const steps = ['shampoo', 'conditioner', 'leave_in', 'styling', 'heat_protection', 'finishing'];
      let id = 0;

      for (const step of steps) {
        for (let c = 0; c < 3; c++) {
          const productId = `p${id}`;
          const interactions = [];
          // Add some interactions to make scoring non-trivial
          if (c === 0 && id > 0) {
            interactions.push({ with: `p${id - 3}`, type: 'enables', confidence: 'high', note: 'test' });
          }
          if (c === 1 && id > 3) {
            interactions.push({ with: `p${id - 4}`, type: 'enhances', confidence: 'medium', note: 'test' });
          }
          inv.push({
            id: productId,
            name: `Product ${id}`,
            brand: '',
            tier: 'primary',
            intelligence: { step, additionalSteps: [], mechanisms: [], ingredients: [], interactions }
          });
          id++;
        }
      }

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const candidates = steps.map((_, stepIdx) => {
        const base = stepIdx * 3;
        return [
          { productId: `p${base}`, score: 90 - stepIdx * 5 },
          { productId: `p${base + 1}`, score: 80 - stepIdx * 5 },
          { productId: `p${base + 2}`, score: 70 - stepIdx * 5 },
        ];
      });

      const start = performance.now();
      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50);
      expect(result.plan.length).toBe(6);
    });

    it('InteractionLookup.build completes within 10ms for 40 products', () => {
      const inv = [];
      for (let i = 0; i < 40; i++) {
        const interactions = [];
        // ~3 interactions per product (realistic density)
        for (let j = 0; j < 3 && j + i + 1 < 40; j++) {
          interactions.push({ with: `p${i + j + 1}`, type: 'enables', confidence: 'high', note: 'test' });
        }
        inv.push({
          id: `p${i}`,
          name: `Product ${i}`,
          brand: '',
          tier: 'primary',
          intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions }
        });
      }

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });

      const start = performance.now();
      m.InteractionLookup.build(inv);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(10);
    });
  });


  // === SynergyScorer Edge Cases ===

  describe('SynergyScorer', () => {

    it('chain detection caps at length 4', () => {
      // Create a 5-product enables chain — should be capped at 4
      const inv = [
        { id: 'p0', name: 'P0', brand: '', tier: 'primary', intelligence: { step: 'shampoo', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'p1', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'p1', name: 'P1', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'p2', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'p2', name: 'P2', brand: '', tier: 'primary', intelligence: { step: 'leave_in', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'p3', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'p3', name: 'P3', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'p4', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'p4', name: 'P4', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'p0' },
        { stepIndex: 1, productId: 'p1' },
        { stepIndex: 2, productId: 'p2' },
        { stepIndex: 3, productId: 'p3' },
        { stepIndex: 4, productId: 'p4' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.chains.length).toBeGreaterThanOrEqual(1);
      // Chain should be capped at 4 products
      expect(result.chains[0].products.length).toBeLessThanOrEqual(4);
    });

    it('no chains detected for plans with fewer than 3 products', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'a' },
        { stepIndex: 1, productId: 'b' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.chains.length).toBe(0);
    });

    it('empty plan returns zero score', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const result = m.SynergyScorer.score([], m.InteractionLookup, null);
      expect(result.score).toBe(0);
      expect(result.chains.length).toBe(0);
    });

    it('single-product plan returns zero score', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const result = m.SynergyScorer.score([{ stepIndex: 0, productId: 'a' }], m.InteractionLookup, null);
      expect(result.score).toBe(0);
    });

    it('products with no interactions contribute zero to synergy', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];
      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'a' },
        { stepIndex: 1, productId: 'b' },
        { stepIndex: 2, productId: 'c' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
      expect(result.score).toBe(0);
      expect(result.pairContributions.length).toBe(0);
    });
  });

});
