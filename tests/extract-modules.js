/**
 * Extracts synergy modules from the single-file HTML app for testing.
 * Creates a sandboxed environment with mocked dependencies.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createContext, runInContext } from 'vm';

const HTML_PATH = resolve(import.meta.dirname, '../index.html');

/**
 * Extract and evaluate the synergy modules from index.html.
 * Returns { InteractionLookup, SynergyScorer, PlanOptimizer, PairBeliefTracker, SynergyExplainer }
 */
export function createSynergyModules(mockState = null) {
  const html = readFileSync(HTML_PATH, 'utf-8');

  // Extract the script content
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error('No script tag found in index.html');
  const scriptContent = scriptMatch[1];

  // Extract just the synergy-related modules (InteractionLookup through SynergyExplainer)
  // They're between "// ===== InteractionLookup =====" and "// ===== AttributionEngine"
  const startMarker = '// ===== InteractionLookup =====';
  const endMarker = '// ===== AttributionEngine (Passive Intelligence) =====';
  const startIdx = scriptContent.indexOf(startMarker);
  const endIdx = scriptContent.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Could not find synergy module boundaries in script');
  }

  const moduleCode = scriptContent.substring(startIdx, endIdx);

  // Create a mock state for testing
  const state = mockState || {
    inventory: [],
    pairBeliefs: {},
    version: 15,
  };

  // Create sandbox with mocked dependencies
  const sandbox = {
    console,
    Math,
    Object,
    Array,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    String,
    Number,
    // Mock StateManager
    StateManager: {
      getState: () => state,
      saveState: (s) => { Object.assign(state, s); },
    },
    // These will be populated by the module code
    InteractionLookup: null,
    SynergyScorer: null,
    PlanOptimizer: null,
    PairBeliefTracker: null,
    SynergyExplainer: null,
  };

  const context = createContext(sandbox);

  // Wrap in a function to capture the var declarations
  const wrappedCode = `
    ${moduleCode}
    // Export to sandbox
    this.InteractionLookup = InteractionLookup;
    this.SynergyScorer = SynergyScorer;
    this.PlanOptimizer = PlanOptimizer;
    this.PairBeliefTracker = PairBeliefTracker;
    this.SynergyExplainer = SynergyExplainer;
  `;

  runInContext(wrappedCode, context);

  return {
    InteractionLookup: sandbox.InteractionLookup,
    SynergyScorer: sandbox.SynergyScorer,
    PlanOptimizer: sandbox.PlanOptimizer,
    PairBeliefTracker: sandbox.PairBeliefTracker,
    SynergyExplainer: sandbox.SynergyExplainer,
    _state: state,
    _updateState: (newState) => Object.assign(state, newState),
  };
}

/**
 * Create a test inventory with configurable interaction density.
 */
export function createTestInventory(productCount = 10, interactionDensity = 0.3) {
  const products = [];
  const stepTypes = ['pre_wash', 'shampoo', 'conditioner', 'bond_repair', 'gloss', 'leave_in', 'styling', 'heat_protection', 'finishing', 'drying'];
  const interactionTypes = ['enables', 'blocks', 'enhances', 'reduces', 'complements', 'neutral'];
  const confidenceLevels = ['high', 'medium', 'low'];

  for (let i = 0; i < productCount; i++) {
    const id = `product-${i}`;
    const interactions = [];

    // Add interactions based on density
    for (let j = 0; j < productCount; j++) {
      if (j === i) continue;
      if (Math.random() < interactionDensity) {
        interactions.push({
          with: `product-${j}`,
          type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
          confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
          note: `Interaction between product-${i} and product-${j}`,
        });
      }
    }

    products.push({
      id,
      name: `Product ${i}`,
      brand: `Brand ${i}`,
      tier: 'primary',
      intelligence: {
        step: stepTypes[i % stepTypes.length],
        additionalSteps: [],
        mechanisms: [],
        ingredients: [],
        interactions,
      },
    });
  }

  return products;
}
