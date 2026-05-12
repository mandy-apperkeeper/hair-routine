/**
 * Integration tests for synergy system — end-to-end with real inventory.
 * Task 8.4 of product-synergy-pairing spec.
 * Feature: product-synergy-pairing
 *
 * Tests the full pipeline: real inventory → InteractionLookup → SynergyScorer →
 * PlanOptimizer → PairBeliefTracker → SynergyExplainer
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createSynergyModules } from './extract-modules.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Extract the real DEFAULT_INVENTORY from index.html.
 * This ensures integration tests use actual product data.
 */
function extractRealInventory() {
  const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf-8');
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error('No script tag found');
  const script = scriptMatch[1];

  // Extract DEFAULT_INVENTORY array
  const startMarker = 'const DEFAULT_INVENTORY = [';
  const startIdx = script.indexOf(startMarker);
  if (startIdx === -1) throw new Error('DEFAULT_INVENTORY not found');

  // Find the matching closing bracket
  let depth = 0;
  let i = startIdx + startMarker.length - 1; // position at the '['
  for (; i < script.length; i++) {
    if (script[i] === '[') depth++;
    else if (script[i] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }

  const inventoryStr = script.substring(startIdx + 'const '.length, i + 1);
  // Evaluate it in a sandbox to get the actual array
  const fn = new Function('return (' + inventoryStr.replace('DEFAULT_INVENTORY = ', '') + ')');
  return fn();
}

describe('Feature: product-synergy-pairing — Integration Tests', () => {
  let inventory;
  let modules;

  beforeEach(() => {
    inventory = extractRealInventory();
    modules = createSynergyModules({ inventory, pairBeliefs: {}, version: 15 });
    modules.InteractionLookup.build(inventory);
  });

  describe('Real inventory interaction map', () => {

    it('builds without errors from real inventory', () => {
      // If we got here, build succeeded
      expect(inventory.length).toBeGreaterThan(20);
    });

    it('loreal-21in1 enables nym-curl-talk-gel (real interaction)', () => {
      const interaction = modules.InteractionLookup.get('loreal-21in1', 'nym-curl-talk-gel');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('enables');
      expect(interaction.weight).toBeGreaterThan(0);
    });

    it('nym-curl-talk-gel blocks marc-anthony-shield (real interaction)', () => {
      const interaction = modules.InteractionLookup.get('nym-curl-talk-gel', 'marc-anthony-shield');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('blocks');
      expect(interaction.weight).toBeLessThan(0);
    });

    it('olaplex-3 complements garnier-pre-shampoo (real interaction)', () => {
      const interaction = modules.InteractionLookup.get('olaplex-3', 'garnier-pre-shampoo');
      expect(interaction).not.toBeNull();
      expect(interaction.type).toBe('complements');
      expect(interaction.weight).toBeGreaterThan(0);
    });

    it('loreal-wonder-water has wildcard enhances interaction', () => {
      const wildcards = modules.InteractionLookup.getWildcards();
      const wonderWaterWC = wildcards.find(w => w.productId === 'loreal-wonder-water');
      expect(wonderWaterWC).toBeDefined();
      expect(wonderWaterWC.type).toBe('enhances');
      expect(wonderWaterWC.weight).toBe(0.5);
    });

    it('products with no interactions return null for lookups', () => {
      // garnier-color-repair-cond has no interactions defined
      const result = modules.InteractionLookup.get('garnier-color-repair-cond', 'everpure-bond-shampoo');
      expect(result).toBeNull();
    });

    it('bidirectional lookup works for real products', () => {
      const forward = modules.InteractionLookup.get('loreal-21in1', 'nym-curl-talk-gel');
      const reverse = modules.InteractionLookup.get('nym-curl-talk-gel', 'loreal-21in1');
      expect(forward).toEqual(reverse);
    });
  });

  describe('Optimizer with real inventory candidates', () => {

    it('prefers loreal-21in1 over alternatives when nym-curl-talk-gel is in plan (enables synergy)', () => {
      // Simulate a curly day plan: leave-in step has candidates, styling step is fixed to gel
      const candidates = [
        // leave_in candidates: 21in1 has enables with gel, others don't
        [
          { productId: 'loreal-21in1', score: 75 },
          { productId: 'monday-moisture-leave-in', score: 80 }, // higher individual score
        ],
        // styling: fixed to gel
        [{ productId: 'nym-curl-talk-gel', score: 90 }],
      ];

      const result = modules.PlanOptimizer.optimize(candidates, modules.InteractionLookup, null, {});
      // With SYNERGY_WEIGHT=15, enables (weight 1.0) adds 15 points to 21in1's plan score
      // 75 + 15 = 90 vs monday's 80 + 0 = 80 → 21in1 should win
      expect(result.plan[0].productId).toBe('loreal-21in1');
    });

    it('avoids nym-curl-talk-gel + marc-anthony-shield combination (blocks interaction)', () => {
      // If both are candidates for different steps, the optimizer should avoid the blocking pair
      const candidates = [
        // styling candidates
        [{ productId: 'nym-curl-talk-gel', score: 85 }],
        // heat protection candidates: marc-anthony has blocks with gel
        [
          { productId: 'marc-anthony-shield', score: 80 },
          { productId: 'ogx-bond-heat-spray', score: 75 },
        ],
      ];

      const result = modules.PlanOptimizer.optimize(candidates, modules.InteractionLookup, null, {});
      // blocks interaction (weight -1.0 * 15 = -15) should push optimizer away from marc-anthony
      // marc-anthony: 80 + (-15) = 65 vs ogx: 75 + 0 = 75 → ogx should win
      expect(result.plan[1].productId).toBe('ogx-bond-heat-spray');
    });

    it('optimizer returns rank-1 when all candidates have no interactions', () => {
      const candidates = [
        [
          { productId: 'garnier-color-repair-cond', score: 90 },
          { productId: 'everpure-bond-conditioner', score: 80 },
        ],
        [{ productId: 'everpure-bond-shampoo', score: 85 }],
      ];

      const result = modules.PlanOptimizer.optimize(candidates, modules.InteractionLookup, null, {});
      // No interactions between these products → pure rank-1 selection
      expect(result.plan[0].productId).toBe('garnier-color-repair-cond');
      expect(result.plan[1].productId).toBe('everpure-bond-shampoo');
    });
  });

  describe('Scorer with real inventory plan', () => {

    it('scores a curly day plan with enables chain higher than a plan without', () => {
      // Plan with enables: 21in1 → gel (enables relationship)
      const planWithSynergy = [
        { stepIndex: 0, productId: 'everpure-bond-shampoo' },
        { stepIndex: 1, productId: 'garnier-color-repair-cond' },
        { stepIndex: 2, productId: 'loreal-21in1' },
        { stepIndex: 3, productId: 'nym-curl-talk-gel' },
      ];

      // Plan without enables: replace 21in1 with monday-moisture (no interaction with gel)
      const planWithout = [
        { stepIndex: 0, productId: 'everpure-bond-shampoo' },
        { stepIndex: 1, productId: 'garnier-color-repair-cond' },
        { stepIndex: 2, productId: 'monday-moisture-leave-in' },
        { stepIndex: 3, productId: 'nym-curl-talk-gel' },
      ];

      const scoreWith = modules.SynergyScorer.score(planWithSynergy, modules.InteractionLookup, null);
      const scoreWithout = modules.SynergyScorer.score(planWithout, modules.InteractionLookup, null);

      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });

    it('wonder water wildcard contributes positive score to downstream products', () => {
      const planWithWW = [
        { stepIndex: 0, productId: 'everpure-bond-shampoo' },
        { stepIndex: 1, productId: 'loreal-wonder-water' },
        { stepIndex: 2, productId: 'garnier-color-repair-cond' },
        { stepIndex: 3, productId: 'loreal-21in1' },
      ];

      const planWithoutWW = [
        { stepIndex: 0, productId: 'everpure-bond-shampoo' },
        { stepIndex: 1, productId: 'garnier-color-repair-cond' },
        { stepIndex: 2, productId: 'loreal-21in1' },
      ];

      const scoreWith = modules.SynergyScorer.score(planWithWW, modules.InteractionLookup, null);
      const scoreWithout = modules.SynergyScorer.score(planWithoutWW, modules.InteractionLookup, null);

      // Wonder Water enhances all downstream → should add positive score
      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });
  });

  describe('PairBeliefTracker end-to-end', () => {

    it('wash rating updates pair beliefs for all product combinations', () => {
      const products = ['everpure-bond-shampoo', 'garnier-color-repair-cond', 'loreal-21in1'];
      const rating = 4;

      modules.PairBeliefTracker.update(products, rating);

      const state = modules._state;
      // C(3,2) = 3 pairs should be created
      expect(Object.keys(state.pairBeliefs).length).toBe(3);

      // Check one pair exists with n=1
      const key1 = 'everpure-bond-shampoo|garnier-color-repair-cond';
      const key2 = 'everpure-bond-shampoo|loreal-21in1';
      const key3 = 'garnier-color-repair-cond|loreal-21in1';

      expect(state.pairBeliefs[key1]).toBeDefined();
      expect(state.pairBeliefs[key1].n).toBe(1);
      expect(state.pairBeliefs[key2]).toBeDefined();
      expect(state.pairBeliefs[key3]).toBeDefined();
    });

    it('getAdjustment returns 0 for pairs with fewer than 5 observations', () => {
      const products = ['everpure-bond-shampoo', 'garnier-color-repair-cond'];

      // Rate 4 times — still below threshold
      for (let i = 0; i < 4; i++) {
        modules.PairBeliefTracker.update(products, 5);
      }

      const adj = modules.PairBeliefTracker.getAdjustment('everpure-bond-shampoo', 'garnier-color-repair-cond');
      expect(adj).toBe(0);
    });

    it('getAdjustment returns non-zero after 5+ observations', () => {
      const products = ['everpure-bond-shampoo', 'garnier-color-repair-cond'];

      // Rate 6 times with high rating
      for (let i = 0; i < 6; i++) {
        modules.PairBeliefTracker.update(products, 5);
      }

      const adj = modules.PairBeliefTracker.getAdjustment('everpure-bond-shampoo', 'garnier-color-repair-cond');
      expect(adj).not.toBe(0);
    });

    it('consistently low ratings create a contradiction for an enables pair', () => {
      // olaplex-3 and garnier-pre-shampoo have a 'complements' interaction (positive prior)
      const products = ['olaplex-3', 'garnier-pre-shampoo'];

      // Rate poorly 10 times — should create contradiction (posterior < 0.5 vs positive prior)
      for (let i = 0; i < 10; i++) {
        modules.PairBeliefTracker.update(products, 1);
      }

      const contradictions = modules.PairBeliefTracker.getContradictions();
      // Should flag this pair since learned reality contradicts domain expectation
      const found = contradictions.find(c =>
        c.pair.includes('olaplex-3') && c.pair.includes('garnier-pre-shampoo')
      );
      expect(found).toBeDefined();
    });

    it('consistently high ratings do NOT create a contradiction for a positive pair', () => {
      const products = ['olaplex-3', 'garnier-pre-shampoo'];

      // Rate highly 10 times — should NOT contradict (confirms positive prior)
      for (let i = 0; i < 10; i++) {
        modules.PairBeliefTracker.update(products, 5);
      }

      const contradictions = modules.PairBeliefTracker.getContradictions();
      const found = contradictions.find(c =>
        c.pair.includes('olaplex-3') && c.pair.includes('garnier-pre-shampoo')
      );
      expect(found).toBeUndefined();
    });

    it('belief adjustment influences optimizer selection over time', () => {
      // enables+medium weight = 0.6, synergy = 0.6 * proximity(1.0) * SYNERGY_WEIGHT(15) = 9
      const interaction = modules.InteractionLookup.get('loreal-21in1', 'nym-curl-talk-gel');
      expect(interaction).not.toBeNull();
      expect(interaction.weight).toBe(0.6);

      const products = ['loreal-21in1', 'nym-curl-talk-gel'];
      for (let i = 0; i < 15; i++) {
        modules.PairBeliefTracker.update(products, 5);
      }

      const adj = modules.PairBeliefTracker.getAdjustment('loreal-21in1', 'nym-curl-talk-gel');
      expect(adj).toBeGreaterThan(0);

      // Gap of 8 < synergy(9), so enables alone overcomes it
      const candidates = [
        [
          { productId: 'loreal-21in1', score: 82 },
          { productId: 'monday-moisture-leave-in', score: 90 },
        ],
        [{ productId: 'nym-curl-talk-gel', score: 90 }],
      ];

      const resultWithout = modules.PlanOptimizer.optimize(
        candidates, modules.InteractionLookup, null, {}
      );
      expect(resultWithout.plan[0].productId).toBe('loreal-21in1');

      // With beliefs: synergy = (0.6 + adj) * 15 > 9, wins by more
      const resultWith = modules.PlanOptimizer.optimize(
        candidates, modules.InteractionLookup, modules.PairBeliefTracker, {}
      );
      expect(resultWith.plan[0].productId).toBe('loreal-21in1');
      expect(resultWith.planScore).toBeGreaterThan(resultWithout.planScore);
    });
  });

  describe('Schema migration', () => {

    it('modules initialize correctly with version 15 state', () => {
      const state = { inventory, pairBeliefs: {}, version: 15 };
      const m = createSynergyModules(state);
      m.InteractionLookup.build(inventory);

      // All modules should be functional
      expect(m.InteractionLookup.get('loreal-21in1', 'nym-curl-talk-gel')).not.toBeNull();
      expect(m.SynergyScorer.score([], m.InteractionLookup, null).score).toBe(0);
      expect(m.PairBeliefTracker.getAdjustment('a', 'b')).toBe(0);
    });

    it('modules handle missing pairBeliefs gracefully (pre-v15 state)', () => {
      const state = { inventory, version: 14 };
      const m = createSynergyModules(state);
      m.InteractionLookup.build(inventory);

      // Should not throw — pairBeliefs defaults to empty
      expect(m.PairBeliefTracker.getAdjustment('a', 'b')).toBe(0);
      expect(m.PairBeliefTracker.getContradictions()).toEqual([]);
    });
  });

  describe('SynergyExplainer with real products', () => {

    it('explains loreal-21in1 selection when paired with nym-curl-talk-gel', () => {
      const plan = [
        { stepIndex: 0, productId: 'loreal-21in1' },
        { stepIndex: 1, productId: 'nym-curl-talk-gel' },
      ];

      const result = modules.SynergyExplainer.explainSelection('loreal-21in1', plan, modules.InteractionLookup);
      expect(result).not.toBeNull();
      expect(result.pairedWith).toBe('nym-curl-talk-gel');
      expect(result.text).toContain('Curl Talk');
      expect(result.mechanism).toContain('gel');
    });

    it('explains alternative impact when swapping leave-in on curly day', () => {
      const currentPlan = [
        { stepIndex: 0, productId: 'everpure-bond-shampoo' },
        { stepIndex: 1, productId: 'garnier-color-repair-cond' },
        { stepIndex: 2, productId: 'loreal-21in1' },
        { stepIndex: 3, productId: 'nym-curl-talk-gel' },
      ];

      // Swapping 21in1 (which enables gel) for monday-moisture (no interaction)
      const impact = modules.SynergyExplainer.explainAlternativeImpact(
        'monday-moisture-leave-in', currentPlan, 2, modules.InteractionLookup
      );
      // Should be negative — losing the enables relationship
      expect(impact.impact).toBe('negative');
      expect(impact.score).toBeLessThan(0);
    });
  });
});
