# Product Intelligence System — Design

## Architecture Overview

The Product Intelligence System is a set of new modules added to `index.html` that sit between the existing data layer (StateManager, InventoryManager) and the UI layer. It does NOT replace existing modules — it enriches them.

```
┌─────────────────────────────────────────────────────────┐
│                        UI Layer                          │
│  Quick-Log (phase-based) │ Post-Wash Card │ Pre-Wash    │
│  Product Discovery Form  │ Insight Cards  │ Recs Card   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Intelligence Layer (NEW)                     │
│  IngredientKB │ AttributionEngine │ RecommendationEngine │
│  BeliefTracker │ InteractionGraph │ DiscoveryParser      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              Existing Data Layer (unchanged)              │
│  StateManager │ InventoryManager │ FeedbackEngine        │
│  CooldownSystem │ CompensationEngine                     │
└─────────────────────────────────────────────────────────┘
```

## New Modules

### IngredientKB (Ingredient Knowledge Base)

A static JavaScript object embedded in the HTML file. Contains ~100-150 ingredients organized by functional role.

**Data structure:**
```javascript
const INGREDIENT_KB = {
  // Indexed by normalized INCI name (lowercase, trimmed)
  'amodimethicone': {
    inci: 'Amodimethicone',
    commonName: 'Amodimethicone',
    roles: ['cuticle_smoothing'],
    mechanism: 'Amine-functionalized silicone that selectively binds damaged cuticle via electrostatic attraction. Self-limiting, crosslinks after deposition.',
    mwClass: 'high',  // low (<1kDa), mid (1-10kDa), high (>10kDa)
    flags: ['cumulative', 'selective_binding', 'self_limiting'],
    interactionFlags: ['blocks_penetration_after'],  // blocks penetrating ingredients applied after
    outcomeWeights: { shine: 0.8, smoothness: 0.9, frizz_control: 0.6 }
  },
  'bis-aminopropyl diglycol dimaleate': {
    inci: 'Bis-Aminopropyl Diglycol Dimaleate',
    commonName: 'Olaplex bond builder',
    roles: ['bond_repair'],
    mechanism: 'Maleate groups react with cysteine residues to reform disulfide bridges in cortex.',
    mwClass: 'low',
    flags: ['cumulative', 'penetrating'],
    interactionFlags: ['requires_clean_surface'],
    outcomeWeights: { strength: 0.9, elasticity: 0.8 }
  },
  // ... ~100-150 more entries
};
```

**Note:** Products use `intelligence.step` (not `phase`) as of schema v5. Valid values: `pre_wash`, `wash`, `post_wash`, `style`. Products in the `wash` step also have `intelligence.subStep` for finer grouping.

**Size estimate:** 150 ingredients × ~250 bytes = ~37KB. Well within budget.

### BeliefTracker

Maintains Bayesian beliefs about each product's effect on each outcome dimension. Stored in localStorage as part of app state.

**Data structure (in state):**
```javascript
state.beliefs = {
  'garnier-color-repair-cond': {
    shine: { mu: 0.8, variance: 2.0, n: 0 },      // prior from domain
    smoothness: { mu: 0.9, variance: 2.0, n: 0 },
    definition: { mu: 0.1, variance: 2.0, n: 0 },
    // ...
  },
  // ... per product
};
```

**Update logic (Normal-Normal conjugate):**
```javascript
function updateBelief(belief, observedRating, observationVariance) {
  belief.n++;
  var priorPrecision = 1 / belief.variance;
  var likePrecision = 1 / observationVariance;
  var postPrecision = priorPrecision + likePrecision;
  belief.mu = (belief.mu * priorPrecision + observedRating * likePrecision) / postPrecision;
  belief.variance = 1 / postPrecision;
}
```

**Confidence calculation:**
```javascript
function getConfidence(belief) {
  var ciWidth = 2 * 1.28 * Math.sqrt(belief.variance); // 80% CI
  return Math.max(0, Math.min(1, 1 - ciWidth / 4));    // 0-1 scale
}
```

### AttributionEngine

After a wash day is logged, explains which products contributed to which outcomes.

**Three layers (per Brief 3):**
1. **Mechanism-based (day 0):** Uses IngredientKB to map products → outcome channels. Always available.
2. **Marginal contribution (5+ events):** Compares ratings with/without each product. Requires natural variation.
3. **Interaction detection (30+ events):** Identifies synergies/interferences between product pairs.

**Output format:**
```javascript
{
  attribution: [
    { outcome: 'shine', contributors: ['garnier-color-repair-cond', 'loreal-wonder-water'], basis: 'mechanism', explanation: 'Both seal the cuticle surface, reflecting light.' },
    { outcome: 'definition', contributors: ['nym-curl-talk-gel'], basis: 'mechanism', explanation: 'PQ-69 film maintains curl shape.' }
  ],
  marginalInsights: [
    { product: 'loreal-wonder-water', effect: +0.92, basis: 'data', n_with: 4, n_without: 3, caveat: 'Humid days overrepresented in "with" group.' }
  ],
  interactions: [] // empty until 30+ events
}
```

### RecommendationEngine

Before a wash day, suggests products based on conditions + history + beliefs.

**Three tiers (per Brief 2):**
1. **Domain rules (day 0):** "Use amodimethicone conditioner every wash", "Got2b in humid conditions"
2. **Bayesian recommendations (3+ events):** Products where posterior belief is strong
3. **Pattern-based (10+ events):** Products that correlate with good outcomes in similar conditions

**Output format:**
```javascript
{
  recommended: [
    { productId: 'garnier-color-repair-cond', reason: 'Amodimethicone conditioner every wash — builds cumulative cuticle repair.', confidence: 'domain', tier: 1 },
    { productId: 'got2b-ultra-glued', reason: 'Dew point is 68°F (humid). Got2b has PQ-69 without glycerin — better humidity hold.', confidence: 'domain', tier: 1 }
  ],
  warnings: [
    { type: 'missing_step', message: 'You usually use Wonder Water — skipping it correlates with -0.9 rating.', confidence: 'data', n: 7 }
  ]
}
```

### InteractionGraph

Encodes known product interactions (from Phase 3 research) plus discovered interactions from data.

**Data structure:**
```javascript
const INTERACTION_RULES = [
  { a: 'nym-curl-talk-gel', b: 'marc-anthony-shield', type: 'blocks', direction: 'a_blocks_b', confidence: 'medium', mechanism: 'PQ-69 film may prevent polysilicone-29 deposition' },
  { a: 'everpure-clarifying', b: '*protein*', type: 'enables', direction: 'a_enables_b', confidence: 'high', mechanism: 'Clean surface absorbs protein better' },
  // Derivable rules from mechanism tags:
  // Any product with 'blocks_penetration_after' flag → blocks subsequent products with 'penetrating' flag
];

// Plus dynamic interactions discovered from data (stored in state)
state.discoveredInteractions = [];
```

### DiscoveryParser

Parses a pasted ingredient list against IngredientKB to auto-detect product properties.

**Algorithm:**
1. Split ingredient list by commas
2. Normalize each ingredient (lowercase, trim, remove parentheticals)
3. Match against IngredientKB keys (exact match first, then fuzzy)
4. Aggregate: collect all roles, flags, outcome weights from matched ingredients
5. Determine phase from roles (clarifying → wash, hold → style, etc.)
6. Check for interaction flags against existing inventory
7. Present results to user for confirmation

## Schema Migration (v4 → v5)

**What changes:**
- `state.beliefs` added (initialized from product intelligence priors)
- `state.discoveredInteractions` added (empty array)
- `state.schemaVersion` bumps to 5
- Existing product `intelligence` fields are preserved (they already have the right structure from v4)
- Products gain an `ingredients` field (array of INCI names) — populated for known products, empty for user-added

**Migration is additive:** No existing fields are removed or renamed. All existing functionality continues to work.

## UI Components

### Quick-Log (redesigned)

```
┌─────────────────────────────────────┐
│ Log a Wash Day          [May 10]    │
├─────────────────────────────────────┤
│ ▼ PRE-WASH                          │
│   ☑ Garnier Pre-Shampoo             │
│   ☐ Olaplex 3                       │
│   ☐ OGX Bond Protein Pre-Shampoo   │
├─────────────────────────────────────┤
│ ▼ WASH                              │
│   ☑ EverPure Bond Repair Shampoo    │
│   ☑ Garnier Color Repair Cond       │
│   ☐ EverPure Clarifying Shampoo     │
│   ☑ Wonder Water                    │
├─────────────────────────────────────┤
│ ▼ POST-WASH                         │
│   ☑ L'Oréal 21-in-1 Leave-In       │
│   ☐ Dove 10-in-1 Serum             │
├─────────────────────────────────────┤
│ ▼ STYLE                             │
│   ☑ NYM Curl Talk Gel               │
│   ☐ Got2b Ultra Glued               │
│   ☐ Marc Anthony Shield             │
├─────────────────────────────────────┤
│ + Add a product not listed          │
│                                     │
│ [Log This Wash Day]                 │
└─────────────────────────────────────┘
```

Pre-selected products come from the last wash of the same type. User deselects what they skipped.

### Post-Wash Attribution Card

Appears after logging, before the rating prompt:

```
┌─────────────────────────────────────┐
│ What today's routine targeted:      │
│                                     │
│ ✨ Shine — Wonder Water + Garnier   │
│    conditioner (cuticle sealing)    │
│                                     │
│ 🌀 Definition — NYM gel (PQ-69     │
│    humidity barrier film)           │
│                                     │
│ 💪 Strength — Garnier pre-shampoo  │
│    (peptide + citric acid repair)   │
│                                     │
│ Based on hair science               │
└─────────────────────────────────────┘
```

### Pre-Wash Recommendation Card

Appears on landing screen when conditions are known:

```
┌─────────────────────────────────────┐
│ 💧 Dew point: 68°F (humid)         │
│ 📅 3 days since last wash           │
│                                     │
│ Today's recommendation:             │
│ • Got2b gel instead of NYM          │
│   (no glycerin — better in humidity)│
│ • Don't skip Wonder Water           │
│   (your rating is +0.9 with it)    │
│                                     │
│ [Start Curly Day Walkthrough →]     │
└─────────────────────────────────────┘
```

## Implementation Phases

1. **Data model + knowledge base** — IngredientKB, schema migration, BeliefTracker initialization
2. **Quick-log redesign** — Phase-based grouping, pre-selection from last wash, product discovery form
3. **Passive intelligence** — AttributionEngine, post-wash card, mechanism-based explanations
4. **Active intelligence** — RecommendationEngine, pre-wash card, condition-based suggestions
5. **Online discovery** — DiscoveryParser, Open Beauty Facts integration (progressive enhancement)

Each phase is independently deployable and testable.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Embedded KB over API | Offline-first, zero cost, fits single-file architecture (Brief 1) |
| Normal-Normal conjugate Bayesian | Arithmetic only, no dependencies, stores in localStorage (Brief 2) |
| Mechanism-based attribution first, statistical second | Useful from day 1, honest about data limitations (Brief 3) |
| Additive schema migration | No data loss, existing features unchanged |
| Phase-based quick-log grouping | Matches Abbey Yung method, fixes broken ACTIVITY_PRODUCTS mapping |
| Three confidence tiers | Transparent about what's domain knowledge vs personal data |
| Interaction graph: hardcoded + derivable + discovered | Covers known interactions immediately, learns new ones over time |

## What This Does NOT Include

- Backend/server components (stays client-side)
- ML model inference (arithmetic Bayesian only)
- Barcode scanning (would need camera API + library — future enhancement)
- Multi-user data sharing (single-user app)
- Automated A/B testing (passive observation only; guided experimentation is future work)
