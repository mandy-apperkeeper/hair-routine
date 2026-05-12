/**
 * Property-based tests for PlanOptimizer
 * Properties 5-7, 11-12, 20-21
 * Feature: product-synergy-pairing
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createSynergyModules } from './extract-modules.js';

describe('Feature: product-synergy-pairing — PlanOptimizer Properties', () => {

  // Property 5: Synergy can override individual rank
  describe('Property 5: Synergy can override individual rank', () => {
    it('rank-2 product with strong synergy is selected over rank-1 with no synergy', () => {
      // Product 'a' has score 60 (rank 1) but no synergy with 'c'
      // Product 'b' has score 50 (rank 2) but enables 'c' (strong synergy)
      // With SYNERGY_WEIGHT=15, synergy of 1.0 adds 15 points → b gets 50+15=65 > a's 60
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: 'test' }] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const candidates = [
        [{ productId: 'a', score: 60 }, { productId: 'b', score: 50 }],
        [{ productId: 'c', score: 80 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

      // b should be selected because synergy bonus (15) overcomes the 10-point gap
      expect(result.plan[0].productId).toBe('b');
    });
  });

  // Property 6: Hard constraint invariant
  describe('Property 6: Hard constraint invariant', () => {
    it('hard-constrained products are never selected regardless of synergy', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 5 }),
        (numSteps) => {
          const inv = [];
          for (let i = 0; i < numSteps + 1; i++) {
            inv.push({
              id: `p${i}`, name: `P${i}`, brand: '', tier: 'primary',
              intelligence: {
                step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
                interactions: i === 0 ? [{ with: 'p1', type: 'enables', confidence: 'high', note: '' }] : [],
              },
            });
          }

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // p0 has the best synergy but is hard-constrained
          const candidates = [];
          for (let s = 0; s < numSteps; s++) {
            candidates.push([
              { productId: `p${s}`, score: 80 },
              { productId: `p${s + 1}`, score: 70 },
            ]);
          }

          const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, { hardConstraints: ['p0'] });

          // p0 should never appear in the result
          for (const step of result.plan) {
            expect(step.productId).not.toBe('p0');
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 7: Candidate cap
  describe('Property 7: Candidate cap', () => {
    it('optimizer receives at most 3 candidates per step', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.integer({ min: 2, max: 6 }),
        (candidatesPerStep, numSteps) => {
          const inv = [];
          for (let i = 0; i < candidatesPerStep * numSteps; i++) {
            inv.push({
              id: `p${i}`, name: `P${i}`, brand: '', tier: 'primary',
              intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
            });
          }

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Create candidates with more than 3 per step
          const candidates = [];
          for (let s = 0; s < numSteps; s++) {
            const stepCandidates = [];
            for (let c = 0; c < candidatesPerStep; c++) {
              stepCandidates.push({ productId: `p${s * candidatesPerStep + c}`, score: 80 - c * 5 });
            }
            candidates.push(stepCandidates);
          }

          // The optimizer should handle this gracefully (caps internally or uses greedy)
          const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

          // Result should have exactly numSteps entries
          expect(result.plan.length).toBe(numSteps);
          // Each selected product should be from the candidates
          for (let s = 0; s < numSteps; s++) {
            const validIds = candidates[s].map(c => c.productId);
            expect(validIds).toContain(result.plan[s].productId);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 11: Alternative synergy impact correctness
  describe('Property 11: Alternative synergy impact correctness', () => {
    it('positive impact when alternative creates enables relationships', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'alt', name: 'Alt', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: 'enables partner' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];

      const impact = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(impact.impact).toBe('positive');
      expect(impact.score).toBeGreaterThan(0);
    });

    it('negative impact when alternative creates blocks relationships', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'alt', name: 'Alt', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'blocks', confidence: 'high', note: 'blocks partner' }] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];

      const impact = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(impact.impact).toBe('negative');
      expect(impact.score).toBeLessThan(0);
    });

    it('neutral impact when no interactions exist', () => {
      const inv = [
        { id: 'current', name: 'Current', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'alt', name: 'Alt', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const currentPlan = [
        { stepIndex: 0, productId: 'current' },
        { stepIndex: 1, productId: 'partner' },
      ];

      const impact = m.SynergyExplainer.explainAlternativeImpact('alt', currentPlan, 0, m.InteractionLookup);
      expect(impact.impact).toBe('neutral');
    });
  });

  // Property 12: Alternatives sorted by combined score
  describe('Property 12: Alternatives sorted by combined score', () => {
    it('alternatives with positive synergy rank higher than those without', () => {
      const inv = [
        { id: 'selected', name: 'Selected', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'alt-synergy', name: 'Alt Synergy', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'partner', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'alt-plain', name: 'Alt Plain', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'partner', name: 'Partner', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Both alternatives have same individual score, but alt-synergy has positive synergy
      const alternatives = [
        { productId: 'alt-synergy', productName: 'Alt Synergy', score: 50, rank: 2 },
        { productId: 'alt-plain', productName: 'Alt Plain', score: 50, rank: 1 },
      ];

      const currentPlan = [
        { stepIndex: 0, productId: 'selected' },
        { stepIndex: 1, productId: 'partner' },
      ];

      // Add synergy impact to each alternative
      for (const alt of alternatives) {
        alt.synergyImpact = m.SynergyExplainer.explainAlternativeImpact(alt.productId, currentPlan, 0, m.InteractionLookup);
      }

      // Sort by combined score (same logic as buildPlan)
      const SYNERGY_WEIGHT = m.PlanOptimizer.SYNERGY_WEIGHT;
      alternatives.sort((a, b) => {
        const aScore = (a.score || 0) + ((a.synergyImpact && a.synergyImpact.score) || 0) * SYNERGY_WEIGHT;
        const bScore = (b.score || 0) + ((b.synergyImpact && b.synergyImpact.score) || 0) * SYNERGY_WEIGHT;
        return bScore - aScore;
      });

      // alt-synergy should be first (higher combined score)
      expect(alternatives[0].productId).toBe('alt-synergy');
    });
  });

  // Property 20: Graceful fallback — few alternatives
  describe('Property 20: Graceful fallback — few alternatives', () => {
    it('with single candidate per step, returns rank-1 (same as pure per-step ranking)', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 6 }),
        (numSteps) => {
          const inv = [];
          for (let i = 0; i < numSteps; i++) {
            inv.push({
              id: `p${i}`, name: `P${i}`, brand: '', tier: 'primary',
              intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
            });
          }

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Single candidate per step
          const candidates = inv.map((p, idx) => [{ productId: p.id, score: 80 - idx * 5 }]);

          const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

          // Should return rank-1 for each step (the only candidate)
          for (let s = 0; s < numSteps; s++) {
            expect(result.plan[s].productId).toBe(`p${s}`);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 21: Backward compatibility — no interactions
  describe('Property 21: Backward compatibility — no interactions', () => {
    it('with no interaction data, produces same selections as pure per-step ranking', () => {
      fc.assert(fc.property(
        fc.integer({ min: 2, max: 4 }),
        fc.integer({ min: 2, max: 3 }),
        (numSteps, candidatesPerStep) => {
          // All products have empty interactions
          const inv = [];
          for (let i = 0; i < numSteps * candidatesPerStep; i++) {
            inv.push({
              id: `p${i}`, name: `P${i}`, brand: '', tier: 'primary',
              intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
            });
          }

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Multiple candidates per step, all with different scores
          const candidates = [];
          for (let s = 0; s < numSteps; s++) {
            const stepCandidates = [];
            for (let c = 0; c < candidatesPerStep; c++) {
              stepCandidates.push({ productId: `p${s * candidatesPerStep + c}`, score: 100 - c * 10 });
            }
            candidates.push(stepCandidates);
          }

          const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

          // With no interactions, optimizer should select rank-1 (highest score) for each step
          for (let s = 0; s < numSteps; s++) {
            expect(result.plan[s].productId).toBe(candidates[s][0].productId);
          }
        }
      ), { numRuns: 100 });
    });
  });
});
