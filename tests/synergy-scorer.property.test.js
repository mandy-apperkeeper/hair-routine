/**
 * Property-based tests for SynergyScorer
 * Properties 1-4, 8-10, 14
 * Feature: product-synergy-pairing
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createSynergyModules } from './extract-modules.js';

describe('Feature: product-synergy-pairing — SynergyScorer Properties', () => {
  let modules;

  beforeEach(() => {
    const inventory = buildTestInventory();
    modules = createSynergyModules({ inventory, pairBeliefs: {}, version: 15 });
    modules.InteractionLookup.build(inventory);
  });

  // Property 1: Interaction sign correctness
  describe('Property 1: Interaction sign correctness', () => {
    it('enables and enhances produce positive contributions, blocks and reduces produce negative, neutral produces zero', () => {
      fc.assert(fc.property(
        fc.constantFrom('enables', 'blocks', 'enhances', 'reduces', 'neutral', 'complements', 'outclassed_by'),
        fc.constantFrom('high', 'medium', 'low'),
        (type, confidence) => {
          // Create a minimal inventory with one interaction of the given type
          const inv = [
            {
              id: 'a', name: 'A', brand: '', tier: 'primary',
              intelligence: {
                step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
                interactions: [{ with: 'b', type, confidence, note: 'test' }],
              },
            },
            {
              id: 'b', name: 'B', brand: '', tier: 'primary',
              intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
            },
          ];

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          const plan = [
            { stepIndex: 0, productId: 'a' },
            { stepIndex: 1, productId: 'b' },
          ];

          const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);

          if (type === 'enables' || type === 'enhances' || type === 'complements') {
            expect(result.score).toBeGreaterThan(0);
          } else if (type === 'blocks' || type === 'reduces' || type === 'outclassed_by') {
            expect(result.score).toBeLessThan(0);
          } else if (type === 'neutral') {
            expect(result.score).toBe(0);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 2: Confidence monotonicity
  describe('Property 2: Confidence monotonicity', () => {
    it('high confidence weight > medium > low for enables and blocks types', () => {
      fc.assert(fc.property(
        fc.constantFrom('enables', 'blocks'),
        (type) => {
          const scores = {};
          for (const confidence of ['high', 'medium', 'low']) {
            const inv = [
              {
                id: 'a', name: 'A', brand: '', tier: 'primary',
                intelligence: {
                  step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
                  interactions: [{ with: 'b', type, confidence, note: 'test' }],
                },
              },
              {
                id: 'b', name: 'B', brand: '', tier: 'primary',
                intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
              },
            ];

            const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
            m.InteractionLookup.build(inv);

            const plan = [
              { stepIndex: 0, productId: 'a' },
              { stepIndex: 1, productId: 'b' },
            ];

            const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
            scores[confidence] = Math.abs(result.score);
          }

          expect(scores.high).toBeGreaterThan(scores.medium);
          expect(scores.medium).toBeGreaterThan(scores.low);
        }
      ), { numRuns: 100 });
    });
  });

  // Property 3: Proximity decay
  describe('Property 3: Proximity decay', () => {
    it('synergy contribution decreases monotonically with step distance', () => {
      fc.assert(fc.property(
        fc.constantFrom('enables', 'enhances', 'complements'),
        fc.integer({ min: 1, max: 5 }),
        (type, maxDistance) => {
          const inv = [
            {
              id: 'a', name: 'A', brand: '', tier: 'primary',
              intelligence: {
                step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
                interactions: [{ with: 'b', type, confidence: 'high', note: 'test' }],
              },
            },
            {
              id: 'b', name: 'B', brand: '', tier: 'primary',
              intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
            },
          ];

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          const scores = [];
          for (let dist = 1; dist <= maxDistance; dist++) {
            const plan = [
              { stepIndex: 0, productId: 'a' },
              { stepIndex: dist, productId: 'b' },
            ];
            const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);
            scores.push(Math.abs(result.score));
          }

          // Each score should be >= the next (monotonically decreasing)
          for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Property 4: Synergy tiebreaker
  describe('Property 4: Synergy tiebreaker', () => {
    it('plans with equal individual scores are differentiated by synergy', () => {
      // Create inventory where product-a enables product-b but product-c has no interactions
      const inv = [
        {
          id: 'a', name: 'A', brand: '', tier: 'primary',
          intelligence: {
            step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
            interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'test' }],
          },
        },
        {
          id: 'b', name: 'B', brand: '', tier: 'primary',
          intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
        },
        {
          id: 'c', name: 'C', brand: '', tier: 'primary',
          intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
        },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      // Both candidates have same individual score
      const candidates = [
        [{ productId: 'a', score: 50 }, { productId: 'c', score: 50 }],
        [{ productId: 'b', score: 50 }],
      ];

      const result = m.PlanOptimizer.optimize(candidates, m.InteractionLookup, null, {});

      // Optimizer should pick 'a' because it has synergy with 'b'
      expect(result.plan[0].productId).toBe('a');
    });
  });

  // Property 8: Chain detection
  describe('Property 8: Chain detection', () => {
    it('detects chains of 3+ consecutive enables relationships', () => {
      fc.assert(fc.property(
        fc.integer({ min: 3, max: 4 }),
        (chainLength) => {
          // Create a chain of products where each enables the next
          const inv = [];
          for (let i = 0; i < chainLength; i++) {
            const interactions = [];
            if (i < chainLength - 1) {
              interactions.push({ with: `p${i + 1}`, type: 'enables', confidence: 'high', note: `enables p${i + 1}` });
            }
            inv.push({
              id: `p${i}`, name: `P${i}`, brand: '', tier: 'primary',
              intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions },
            });
          }

          const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
          m.InteractionLookup.build(inv);

          const plan = inv.map((p, idx) => ({ stepIndex: idx, productId: p.id }));
          const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);

          expect(result.chains.length).toBeGreaterThanOrEqual(1);
          expect(result.chains[0].products.length).toBe(chainLength);
        }
      ), { numRuns: 100 });
    });
  });

  // Property 9: Chain super-linearity
  describe('Property 9: Chain super-linearity', () => {
    it('chain bonus exceeds sum of individual pairwise bonuses', () => {
      // Create a 3-product chain
      const inv = [
        {
          id: 'a', name: 'A', brand: '', tier: 'primary',
          intelligence: {
            step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [],
            interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'test' }],
          },
        },
        {
          id: 'b', name: 'B', brand: '', tier: 'primary',
          intelligence: {
            step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [],
            interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: 'test' }],
          },
        },
        {
          id: 'c', name: 'C', brand: '', tier: 'primary',
          intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] },
        },
      ];

      const m = createSynergyModules({ inventory: inv, pairBeliefs: {}, version: 15 });
      m.InteractionLookup.build(inv);

      const plan = [
        { stepIndex: 0, productId: 'a' },
        { stepIndex: 1, productId: 'b' },
        { stepIndex: 2, productId: 'c' },
      ];

      const result = m.SynergyScorer.score(plan, m.InteractionLookup, null);

      // The chain bonus should make the total score greater than just the sum of pairwise
      // Pairwise: a→b (weight 1.0, proximity 1.0) + b→c (weight 1.0, proximity 1.0) = 2.0
      // Chain bonus adds 1.25× multiplier on the chain sum
      // So total should be > 2.0
      expect(result.score).toBeGreaterThan(2.0);
    });
  });

  // Property 10: Chain-breaking penalty scales with length
  describe('Property 10: Chain-breaking penalty scales with length', () => {
    it('breaking a longer chain has greater impact than breaking a shorter one', () => {
      // Score a 4-chain vs a 3-chain, then remove the middle product
      // The 4-chain should lose more score when broken

      // 3-chain: a → b → c
      const inv3 = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'x', name: 'X', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m3 = createSynergyModules({ inventory: inv3, pairBeliefs: {}, version: 15 });
      m3.InteractionLookup.build(inv3);

      const plan3full = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'b' }, { stepIndex: 2, productId: 'c' }];
      const plan3broken = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'x' }, { stepIndex: 2, productId: 'c' }];

      const score3full = m3.SynergyScorer.score(plan3full, m3.InteractionLookup, null).score;
      const score3broken = m3.SynergyScorer.score(plan3broken, m3.InteractionLookup, null).score;
      const loss3 = score3full - score3broken;

      // 4-chain: a → b → c → d
      const inv4 = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'c', name: 'C', brand: '', tier: 'primary', intelligence: { step: 'finishing', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'd', type: 'enables', confidence: 'high', note: '' }] } },
        { id: 'd', name: 'D', brand: '', tier: 'primary', intelligence: { step: 'drying', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
        { id: 'x', name: 'X', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [] } },
      ];

      const m4 = createSynergyModules({ inventory: inv4, pairBeliefs: {}, version: 15 });
      m4.InteractionLookup.build(inv4);

      const plan4full = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'b' }, { stepIndex: 2, productId: 'c' }, { stepIndex: 3, productId: 'd' }];
      const plan4broken = [{ stepIndex: 0, productId: 'a' }, { stepIndex: 1, productId: 'x' }, { stepIndex: 2, productId: 'c' }, { stepIndex: 3, productId: 'd' }];

      const score4full = m4.SynergyScorer.score(plan4full, m4.InteractionLookup, null).score;
      const score4broken = m4.SynergyScorer.score(plan4broken, m4.InteractionLookup, null).score;
      const loss4 = score4full - score4broken;

      // Breaking the 4-chain should lose more than breaking the 3-chain
      expect(loss4).toBeGreaterThan(loss3);
    });
  });

  // Property 14: Chain summary presence
  describe('Property 14: Chain summary presence', () => {
    it('plan with detected chain includes chain data in result', () => {
      const inv = [
        { id: 'a', name: 'A', brand: '', tier: 'primary', intelligence: { step: 'conditioner', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'b', type: 'enables', confidence: 'high', note: 'A enables B' }] } },
        { id: 'b', name: 'B', brand: '', tier: 'primary', intelligence: { step: 'styling', additionalSteps: [], mechanisms: [], ingredients: [], interactions: [{ with: 'c', type: 'enables', confidence: 'high', note: 'B enables C' }] } },
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

      expect(result.chains).toBeDefined();
      expect(result.chains.length).toBeGreaterThanOrEqual(1);
      expect(result.chains[0].products).toContain('a');
      expect(result.chains[0].products).toContain('b');
      expect(result.chains[0].products).toContain('c');
      expect(result.chains[0].bonus).toBeGreaterThan(0);
    });
  });
});

function buildTestInventory() {
  return [
    {
      id: 'garnier-color-repair-cond', name: 'Color Repair Conditioner', brand: 'Garnier', tier: 'primary',
      intelligence: {
        step: 'conditioner', additionalSteps: [], mechanisms: ['cuticle_smoothing'], ingredients: ['amodimethicone'],
        interactions: [{ with: 'nym-curl-talk-gel', type: 'enables', confidence: 'high', note: 'Smooths cuticle for better gel cast' }],
      },
    },
    {
      id: 'nym-curl-talk-gel', name: 'Curl Talk Gel', brand: 'NYM', tier: 'primary',
      intelligence: {
        step: 'styling', additionalSteps: [], mechanisms: ['cast_formation'], ingredients: [],
        interactions: [],
      },
    },
    {
      id: 'got2b-ultra-glued', name: 'Ultra Glued', brand: 'Got2b', tier: 'primary',
      intelligence: {
        step: 'styling', additionalSteps: [], mechanisms: ['cast_formation'], ingredients: [],
        interactions: [{ with: 'marc-anthony-shield', type: 'blocks', confidence: 'medium', note: 'PQ-69 may block polysilicone-29' }],
      },
    },
    {
      id: 'marc-anthony-shield', name: 'Shield', brand: 'Marc Anthony', tier: 'supporting',
      intelligence: {
        step: 'heat_protection', additionalSteps: [], mechanisms: ['heat_seal'], ingredients: ['polysilicone-29'],
        interactions: [],
      },
    },
  ];
}
