/**
 * Property-based tests for PairBeliefTracker
 * Properties 15-19
 * Feature: product-synergy-pairing
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createSynergyModules } from './extract-modules.js';

describe('Feature: product-synergy-pairing — PairBeliefTracker Properties', () => {

  // Property 15: Pair observation recording
  describe('Property 15: Pair observation recording', () => {
    it('logging N products increments observation count for all C(N,2) pairs by exactly 1', () => {
      fc.assert(fc.property(
        fc.array(fc.string({ minLength: 2, maxLength: 8 }), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 1, max: 5 }),
        (productIds, rating) => {
          // Ensure unique product IDs
          const uniqueIds = [...new Set(productIds)];
          if (uniqueIds.length < 2) return; // skip if not enough unique products

          const inv = uniqueIds.map(id => ({
            id, name: id, brand: '', tier: 'primary',
            intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
          }));

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Record initial state
          const state = m._state;
          state.pairBeliefs = {};

          // Update
          m.PairBeliefTracker.update(uniqueIds, rating);

          // Check all C(N,2) pairs have n=1
          const expectedPairs = (uniqueIds.length * (uniqueIds.length - 1)) / 2;
          const actualPairs = Object.keys(state.pairBeliefs).length;
          expect(actualPairs).toBe(expectedPairs);

          for (const key of Object.keys(state.pairBeliefs)) {
            expect(state.pairBeliefs[key].n).toBe(1);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 16: Pair belief initialization from domain prior
  describe('Property 16: Pair belief initialization from domain prior', () => {
    it('new pairs initialize with correct domain prior based on interaction type', () => {
      const testCases = [
        { type: 'enables', expectedPrior: 0.75 },
        { type: 'blocks', expectedPrior: 0.25 },
        { type: 'enhances', expectedPrior: 0.7 },
        { type: 'reduces', expectedPrior: 0.3 },
        { type: 'complements', expectedPrior: 0.65 },
        { type: 'outclassed_by', expectedPrior: 0.35 },
      ];

      for (const tc of testCases) {
        const inv = [
          {
            id: 'a', name: 'A', brand: '', tier: 'primary',
            intelligence: {
              step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
              interactions: [{ with: 'b', type: tc.type, confidence: 'high', note: '' }],
            },
          },
          {
            id: 'b', name: 'B', brand: '', tier: 'primary',
            intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
          },
        ];

        const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
        m.InteractionLookup.build(inv);

        m.PairBeliefTracker.update(['a', 'b'], 3);

        const belief = m.PairBeliefTracker.getBelief('a', 'b');
        expect(belief).not.toBeNull();
        expect(belief.prior).toBeCloseTo(tc.expectedPrior, 5);
      }
    });

    it('unknown pairs (no interaction) initialize with neutral prior 0.5', () => {
      const inv = [
        { id: 'x', name: 'X', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'y', name: 'Y', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      m.PairBeliefTracker.update(['x', 'y'], 3);

      const belief = m.PairBeliefTracker.getBelief('x', 'y');
      expect(belief.prior).toBeCloseTo(0.5, 5);
    });
  });

  // Property 17: Bayesian update direction
  describe('Property 17: Bayesian update direction', () => {
    it('consistently high ratings push posterior above prior', () => {
      fc.assert(fc.property(
        fc.integer({ min: 5, max: 15 }),
        (numObservations) => {
          const inv = [
            { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
            { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
          ];

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Give consistently high ratings (4-5)
          for (let i = 0; i < numObservations; i++) {
            m.PairBeliefTracker.update(['a', 'b'], 5);
          }

          const belief = m.PairBeliefTracker.getBelief('a', 'b');
          // Posterior should be above prior (0.5 for neutral pair)
          expect(belief.mu).toBeGreaterThan(belief.prior);
        }
      ), { numRuns: 100 });
    });

    it('consistently low ratings push posterior below prior', () => {
      fc.assert(fc.property(
        fc.integer({ min: 5, max: 15 }),
        (numObservations) => {
          const inv = [
            { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
            { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
          ];

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          // Give consistently low ratings (1-2)
          for (let i = 0; i < numObservations; i++) {
            m.PairBeliefTracker.update(['a', 'b'], 1);
          }

          const belief = m.PairBeliefTracker.getBelief('a', 'b');
          // Posterior should be below prior (0.5 for neutral pair)
          expect(belief.mu).toBeLessThan(belief.prior);
        }
      ), { numRuns: 100 });
    });
  });

  // Property 18: Minimum observation threshold
  describe('Property 18: Minimum observation threshold', () => {
    it('returns exactly 0 adjustment for pairs with fewer than 5 observations', () => {
      fc.assert(fc.property(
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 1, max: 5 }),
        (numObservations, rating) => {
          const inv = [
            { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
            { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
          ];

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          for (let i = 0; i < numObservations; i++) {
            m.PairBeliefTracker.update(['a', 'b'], rating);
          }

          const adjustment = m.PairBeliefTracker.getAdjustment('a', 'b');
          expect(adjustment).toBe(0);
        }
      ), { numRuns: 100 });
    });

    it('returns non-zero adjustment after 5+ observations with non-neutral ratings', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Give 6 high ratings (enough to cross threshold and produce non-zero adjustment)
      for (let i = 0; i < 6; i++) {
        m.PairBeliefTracker.update(['a', 'b'], 5);
      }

      const adjustment = m.PairBeliefTracker.getAdjustment('a', 'b');
      expect(adjustment).not.toBe(0);
    });
  });

  // Property 19: Contradiction detection
  describe('Property 19: Contradiction detection', () => {
    it('detects when posterior crosses 0.5 from opposite side of prior', () => {
      // Create a pair with "enables" prior (0.75) and give it consistently low ratings
      // to push posterior below 0.5
      const inv = [
        {
          id: 'a', name: 'A', brand: '', tier: 'primary',
          intelligence: {
            step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
            interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }],
          },
        },
        {
          id: 'b', name: 'B', brand: '', tier: 'primary',
          intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
        },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Give many low ratings to push posterior below 0.5
      for (let i = 0; i < 20; i++) {
        m.PairBeliefTracker.update(['a', 'b'], 1);
      }

      const contradictions = m.PairBeliefTracker.getContradictions();
      expect(contradictions.length).toBeGreaterThanOrEqual(1);
      expect(contradictions[0].domainExpectation).toBe('positive');
      expect(contradictions[0].learnedReality).toBe('negative');
    });

    it('does not flag pairs that stay on the same side of 0.5 as their prior', () => {
      const inv = [
        {
          id: 'a', name: 'A', brand: '', tier: 'primary',
          intelligence: {
            step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
            interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }],
          },
        },
        {
          id: 'b', name: 'B', brand: '', tier: 'primary',
          intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
        },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Give high ratings — posterior stays above 0.5 (same side as prior 0.75)
      for (let i = 0; i < 10; i++) {
        m.PairBeliefTracker.update(['a', 'b'], 5);
      }

      const contradictions = m.PairBeliefTracker.getContradictions();
      expect(contradictions.length).toBe(0);
    });
  });
});
