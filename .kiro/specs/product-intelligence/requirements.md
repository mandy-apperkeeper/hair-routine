# Product Intelligence System — Requirements

## Problem Statement

The hair routine app treats products as interchangeable items in generic buckets. It doesn't understand what each product physically does, how products interact in sequence, or how they contribute to outcomes. This limits the correlation engine's ability to explain *why* a wash day went well or poorly, and makes the quick-log product categorization incorrect.

## Vision

A system that gives the app deep understanding of product mechanisms, interactions, and outcome contributions — enabling it to:
- Group products by mechanism-based phases in the quick-log (replacing the broken ACTIVITY_PRODUCTS mapping)
- Explain post-wash outcomes in terms of what products did ("Today's shine came from Wonder Water + Garnier conditioner sealing the cuticle")
- Recommend products before a wash day based on conditions and history
- Help evaluate new products against the existing routine
- Surface insights about which products/combinations work best for Mandy's specific hair

## Architecture Constraint

Single-file HTML app, localStorage, no backend, offline-first, deployed to GitHub Pages. All intelligence runs client-side. Online features are progressive enhancements only.

---

## Requirements

### 1. Ingredient Knowledge Base

1.1 The app SHALL include an embedded ingredient knowledge base as a JavaScript object covering the ~100 most common hair care ingredients relevant to Mandy's routine.

1.2 Each ingredient entry SHALL include: INCI name, common name, functional role(s), mechanism description, molecular weight class (where relevant), and interaction flags.

1.3 The knowledge base SHALL be organized by functional role (cuticle smoothing, bond repair, protein fill, humidity barrier, conditioning, penetrating oil, humectant, clarifying, heat protection, hold).

1.4 The knowledge base SHALL be extensible — users can add custom ingredients not in the default set.

1.5 The knowledge base size SHALL NOT exceed 100KB uncompressed (target: 50-80KB).

### 2. Enhanced Product Data Model

2.1 Each product SHALL have an `intelligence` field containing: mechanisms (array of functional role tags), delivery method, phase placement, outcome contributions (weighted 0-1 per dimension), cumulative flag, interactions array, and ingredient list.

2.2 The outcome dimensions SHALL be: shine, smoothness, definition, frizz_control, strength, elasticity, volume, cleanliness.

2.3 Products SHALL support multiple phase placements (e.g., OGX oils can be pre-wash OR finishing).

2.4 The interaction model SHALL support three relationship types: `enables` (A makes B work better), `blocks` (A prevents B from working), and `neutral` (no interaction).

2.5 Each interaction SHALL include a confidence level (high, medium, low) and a mechanism explanation.

2.6 The existing 24 products in inventory SHALL be migrated to the enhanced model via schema migration (v4 → v5), preserving all existing data.

### 3. Phase-Based Quick-Log

3.1 The quick-log SHALL group products by mechanism-based phases: Pre-wash, Wash, Post-wash, Style.

3.2 Within each phase, products SHALL be ordered by their typical application sequence (derived from the Abbey Yung 11-step method).

3.3 Products that can appear in multiple phases SHALL show in their most common phase by default, with the ability to move them.

3.4 The quick-log SHALL pre-select products from the user's last wash of the same type (curly/blowout), allowing deselection of skipped products.

3.5 The quick-log SHALL support adding products not in inventory (one-time use, gifts, salon products) via a quick-add field.

### 4. Passive Intelligence (Post-Wash Analysis)

4.1 After logging a wash day, the app SHALL display a mechanism-based outcome attribution: which products contributed to which outcome dimensions.

4.2 Attribution SHALL use mechanism knowledge (from day 1) combined with statistical evidence (as data accumulates).

4.3 The app SHALL track per-product Bayesian beliefs about outcome contributions, starting from domain-informed priors and updating with each logged wash.

4.4 The app SHALL detect and surface marginal contribution when a product's presence/absence correlates with rating differences (minimum: 3 events in each group).

4.5 The app SHALL detect contextual patterns (product × condition interactions) after 15+ events.

4.6 The app SHALL detect product synergies/interferences after 30+ events (when both "alone" and "together" have 5+ observations each).

### 5. Active Intelligence (Pre-Wash Recommendations)

5.1 Before a wash day, the app SHALL recommend products based on: current conditions (dew point), days since last wash, seal state, and historical performance.

5.2 Recommendations SHALL be tiered by confidence: "Based on hair science" (domain rules, day 0), "Early signal" (3-4 events), "Based on your data" (5+ events), "Strong evidence" (15+ events).

5.3 The app SHALL explain WHY each product is recommended, citing the mechanism or data that supports it.

5.4 The app SHALL warn about potential issues: products that conflict with current state, products that perform poorly in current conditions (based on data), missing steps that usually correlate with good outcomes.

5.5 Active recommendations SHALL NOT appear until the user has logged at least 3 wash events (domain rules appear immediately, but personalized recommendations need data).

### 6. Product Discovery (Adding New Products)

6.1 The app SHALL provide a structured form for adding new products: name, brand, ingredient list (textarea for pasting from bottle).

6.2 When an ingredient list is provided, the app SHALL parse it against the knowledge base and auto-detect: functional roles, mechanism tags, phase placement, likely outcome contributions, and potential interactions with existing inventory.

6.3 Auto-detected properties SHALL be presented to the user for confirmation/override before saving.

6.4 When online, the app MAY offer to look up the product via Open Beauty Facts API to auto-fill the ingredient list (progressive enhancement, not required).

6.5 Products added without an ingredient list SHALL still be usable — the user can manually assign phase and mechanism tags.

### 7. Confidence & Transparency

7.1 Every recommendation and insight SHALL display its confidence level and data basis.

7.2 The app SHALL distinguish between domain knowledge ("hair science says...") and personal data ("your last 8 wash days show...").

7.3 The app SHALL never present a statistical finding without stating the sample size.

7.4 Bayesian beliefs SHALL use informative priors from domain knowledge (not flat priors), with prior variance of 2.0 (high uncertainty about individual response).

7.5 The app SHALL surface when personal data contradicts domain expectations (e.g., "Hair science predicts X, but your data shows Y — your hair may respond differently").

### 8. Migration & Compatibility

8.1 Schema migration from v4 to v5 SHALL be automatic and non-destructive — no user data is lost.

8.2 The migration SHALL enrich existing products with ingredient lists and enhanced intelligence metadata from the knowledge base.

8.3 Products added by the user (not in DEFAULT_INVENTORY) SHALL receive a minimal intelligence stub that the user can enrich later.

8.4 The existing FeedbackEngine, CompensationEngine, and CooldownSystem SHALL continue to work unchanged — the Product Intelligence System is additive.

8.5 The existing walkthrough product references SHALL continue to work (product IDs are stable).

### 9. Performance

9.1 The ingredient knowledge base + intelligence logic SHALL add no more than 100KB uncompressed to the HTML file.

9.2 Bayesian belief updates SHALL complete in <10ms per product (arithmetic only, no ML libraries).

9.3 The quick-log SHALL render in <100ms even with 50+ products in inventory.

9.4 All intelligence computations SHALL run synchronously (no web workers needed at this scale).

