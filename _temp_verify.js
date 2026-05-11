(function() {
"use strict";
  /**
     * Adaptive Hair Routine — v2
     * Single-file app with localStorage persistence.
     * Modules: IngredientKB, StateManager, CooldownSystem, FeedbackEngine, CompensationEngine, UseUpRotation, WalkthroughEngine, TimerManager
     */
    (function() {
        'use strict';

        // ===== StateManager =====
        const STORAGE_KEY = 'hair-routine-data';
        const CURRENT_VERSION = 12;

        /**
         * Default product inventory — pre-populated from consultation.
         * Each product: { id, name, brand, tier, context, usingUp, notes }
         * Tiers: 'primary' | 'supporting' | 'use-up'
         * Context: 'every-wash' | 'curly' | 'blowout' | 'weekly' | 'as-needed'
         */
        const DEFAULT_INVENTORY = [
            // Primary Rotation — Every Wash
            {
                id: 'garnier-color-repair-cond', name: 'Color Repair Conditioner', brand: 'Garnier Fructis',
                tier: 'primary', context: 'every-wash', usingUp: false,
                notes: 'Amodimethicone + synthetic ceramide (18-MEA replacement). Best conditioner — rotate with use-up bottles until they\'re gone. 3-5 min.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'conditioner',
                    outcomes: { shine: 0.8, smoothness: 0.9, strength: 0.3 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'ceramide np', 'cetearyl alcohol', 'behentrimonium chloride']
                }
            },
            {
                id: 'everpure-bond-shampoo', name: 'Bond Repair Shampoo', brand: "L'Oréal EverPure",
                tier: 'primary', context: 'every-wash', usingUp: false,
                notes: 'Daily shampoo. Gentle sulfate-free.',
                intelligence: {
                    mechanisms: ['cleansing'],
                    delivery: 'rinse_off',
                    step: 'shampoo',
                    outcomes: { cleanliness: 0.9 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['cocamidopropyl betaine', 'sodium cocoyl isethionate', 'citric acid']
                }
            },
            {
                id: 'loreal-21in1', name: '21-in-1 Leave-In Spray', brand: "L'Oréal EverPure",
                tier: 'primary', context: 'every-wash', usingUp: false,
                notes: 'Amodimethicone + PQ-37 + coconut oil. Best leave-in in collection.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'penetrating_oil', 'conditioning'],
                    delivery: 'leave_on',
                    step: 'leave_in',
                    outcomes: { shine: 0.9, smoothness: 0.8, strength: 0.2 },
                    cumulative: true,
                    interactions: [{ with: 'nym-curl-talk-gel', type: 'enables', note: 'Apply lightly before gel — heavy application weakens cast' }],
                    ingredients: ['amodimethicone', 'cocos nucifera oil', 'polyquaternium-37', 'panthenol']
                }
            },
            {
                id: 'everpure-bond-conditioner', name: 'Bond Repair Conditioner', brand: "L'Oréal EverPure",
                tier: 'primary', context: 'every-wash', usingUp: false,
                notes: 'Bis-cetearyl amodimethicone + dimethicone. Second-best conditioner.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'conditioner',
                    outcomes: { shine: 0.7, smoothness: 0.8, strength: 0.2 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['bis-cetearyl amodimethicone', 'dimethicone', 'cetearyl alcohol', 'citric acid']
                }
            },
            // Primary Rotation — Curly Days
            {
                id: 'nym-curl-talk-gel', name: 'Curl Talk Flash Freeze Gel', brand: 'Not Your Mother\'s',
                tier: 'primary', context: 'curly', usingUp: false,
                notes: 'PQ-69 humidity barrier. Scrunch into damp hair.',
                intelligence: {
                    mechanisms: ['humidity_barrier'],
                    delivery: 'leave_on',
                    step: 'styling',
                    outcomes: { definition: 0.9, frizz_control: 0.9 },
                    cumulative: false,
                    interactions: [{ with: 'marc-anthony-shield', type: 'blocks', note: 'PQ-69 may block polysilicone-29 deposition (medium confidence)' }],
                    ingredients: ['polyquaternium-69', 'glycerin', 'pvp']
                }
            },
            // Primary Rotation — Blowout Days
            {
                id: 'marc-anthony-shield', name: 'Grow Long Anti-Frizz Shield', brand: 'Marc Anthony',
                tier: 'primary', context: 'blowout', usingUp: false,
                notes: 'Polysilicone-29 heat seal. Activates seal state.',
                intelligence: {
                    mechanisms: ['heat_protection', 'cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'heat_protection',
                    outcomes: { smoothness: 0.8, strength: 0.4, frizz_control: 0.7 },
                    cumulative: false,
                    interactions: [{ with: 'nym-curl-talk-gel', type: 'blocks', note: 'PQ-69 may block polysilicone-29 (medium confidence)' }],
                    ingredients: ['polysilicone-29', 'dimethicone', 'cyclopentasiloxane']
                }
            },
            // Primary Rotation — Weekly
            {
                id: 'everpure-clarifying', name: 'Clarifying Shampoo', brand: "L'Oréal EverPure",
                tier: 'primary', context: 'weekly', usingUp: false,
                notes: 'Weekly reset. Deactivates seal state.',
                intelligence: {
                    mechanisms: ['clarifying'],
                    delivery: 'rinse_off',
                    step: 'shampoo',
                    outcomes: { cleanliness: 1.0 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['sodium c14-16 olefin sulfonate', 'cocamidopropyl betaine']
                }
            },
            {
                id: 'olaplex-3', name: 'Olaplex 3', brand: 'Olaplex',
                tier: 'primary', context: 'weekly', usingUp: false,
                notes: 'Bis-aminopropyl diglycol dimaleate. Only product that reconnects disulfide bonds.',
                intelligence: {
                    mechanisms: ['bond_repair'],
                    delivery: 'rinse_off',
                    step: 'bond_repair',
                    outcomes: { strength: 0.9, elasticity: 0.8 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['bis-aminopropyl diglycol dimaleate']
                }
            },
            // Supporting Cast — Every Wash
            {
                id: 'loreal-wonder-water', name: '8 Second Wonder Water', brand: "L'Oréal Elvive",
                tier: 'supporting', context: 'every-wash', usingUp: false,
                notes: 'Lamellar conditioning rinse. Spray bottle for distribution.',
                intelligence: {
                    mechanisms: ['conditioning'],
                    delivery: 'rinse_off',
                    step: 'gloss',
                    outcomes: { shine: 0.7, smoothness: 0.8 },
                    cumulative: false,
                    interactions: [{ with: '*', type: 'enhances', note: 'Smoother cuticle improves subsequent product distribution' }],
                    ingredients: ['cetrimonium chloride', 'behentrimonium chloride', 'citric acid']
                }
            },
            // Supporting Cast — Weekly/Bond Repair
            {
                id: 'garnier-pre-shampoo', name: 'Hair Filler Inner Fiber Repair Pre-Shampoo', brand: 'Garnier Fructis',
                tier: 'supporting', context: 'weekly', usingUp: false,
                notes: 'Peptides + citric acid. Bond repair + frizz protection. NOT a conditioner.',
                intelligence: {
                    mechanisms: ['bond_repair', 'protein_fill'],
                    delivery: 'rinse_off',
                    step: 'bond_repair',
                    outcomes: { strength: 0.6, smoothness: 0.4 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['citric acid', 'hydrolyzed wheat protein', 'panthenol']
                }
            },
            {
                id: 'ogx-bond-repair-mask', name: 'Bond Protein Repair 1-Minute Mask', brand: 'OGX',
                tier: 'supporting', context: 'weekly', usingUp: false,
                notes: 'Amodimethicone + wheat protein + bond plex film-formers. Rinse-off mask with both cuticle smoothing and protein fill. 1 minute application.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'protein_fill', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'deep_condition',
                    outcomes: { smoothness: 0.7, strength: 0.5, shine: 0.5 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'hydrolyzed wheat protein', 'panthenol', 'cetearyl alcohol']
                }
            },
            {
                id: 'everpure-bond-pre', name: 'Bond Repair Pre-Shampoo Treatment', brand: "L'Oréal EverPure",
                tier: 'supporting', context: 'weekly', usingUp: false,
                notes: 'Citric acid bond support.',
                intelligence: {
                    mechanisms: ['bond_repair'],
                    delivery: 'rinse_off',
                    step: 'bond_repair',
                    outcomes: { strength: 0.4 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['citric acid', 'tartaric acid']
                }
            },
            {
                id: 'everpure-glossing-mask', name: 'Glossing 5-Min Lamination Mask', brand: "L'Oréal EverPure",
                tier: 'supporting', context: 'weekly', usingUp: false,
                notes: '\u26A0\uFE0F NOT a conditioner \u2014 clarifying treatment (surfactants + glycolic acid). Use as occasional reset only.',
                intelligence: {
                    mechanisms: ['clarifying'],
                    delivery: 'rinse_off',
                    step: 'gloss',
                    outcomes: { cleanliness: 0.8, shine: 0.5 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['glycolic acid', 'sodium laureth sulfate', 'citric acid']
                }
            },
            // Supporting Cast — Finishing/As-needed
            {
                id: 'garnier-filler-serum', name: 'Hair Filler Strength Repair Serum', brand: 'Garnier Fructis',
                tier: 'supporting', context: 'as-needed', usingUp: false,
                notes: 'Amodimethicone + citric acid. Leave-in serum.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'finishing',
                    outcomes: { shine: 0.9, smoothness: 0.8 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'citric acid', 'dimethicone']
                }
            },
            {
                id: 'dove-10in1-serum', name: 'Bond Repair 10-in-1 Serum', brand: 'Dove',
                tier: 'supporting', context: 'as-needed', usingUp: false,
                notes: 'Amodimethicone (buried in formula). Better than Dove conditioners.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'finishing',
                    outcomes: { shine: 0.6, smoothness: 0.6 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'dimethicone', 'cyclomethicone']
                }
            },
            {
                id: 'pantene-bond-spray', name: 'Miracle Rescue Instant Repair Leave-In', brand: 'Pantene',
                tier: 'supporting', context: 'every-wash', usingUp: false,
                notes: 'Bis-aminopropyl dimethicone (bond-bridging silicone) + histidine (amino acid cortex fill). Genuine bond repair leave-in.',
                intelligence: {
                    mechanisms: ['bond_repair', 'cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'leave_in',
                    outcomes: { strength: 0.6, smoothness: 0.5, shine: 0.4 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['bis-aminopropyl dimethicone', 'histidine', 'panthenol']
                }
            },
            // Supporting Cast — Humid days
            {
                id: 'got2b-ultra-glued', name: 'Glued Blasting Freeze Spray/Gel', brand: 'Got2b',
                tier: 'supporting', context: 'curly', usingUp: false,
                notes: 'Humid-day substitute for NYM gel. Stronger hold.',
                intelligence: {
                    mechanisms: ['humidity_barrier'],
                    delivery: 'leave_on',
                    step: 'styling',
                    outcomes: { definition: 0.8, frizz_control: 0.95 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['polyquaternium-69', 'vp/va copolymer']
                }
            },
            // Supporting Cast — Curly Days
            {
                id: 'maui-curl-smoothie', name: 'Curl Quench + Coconut Oil Curl Smoothie', brand: 'Maui Moisture',
                tier: 'supporting', context: 'curly', usingUp: false,
                notes: 'Silicone-free curl cream. Coconut oil + shea butter + PQ-37 (light hold). Defines and defrizzes.',
                intelligence: {
                    mechanisms: ['conditioning', 'penetrating_oil'],
                    delivery: 'leave_on',
                    step: 'styling',
                    outcomes: { definition: 0.5, frizz_control: 0.4, smoothness: 0.5 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['cocos nucifera oil', 'butyrospermum parkii butter', 'polyquaternium-37', 'glycerin']
                }
            },
            // Supporting Cast — Weekly Deep Condition
            {
                id: 'elvive-total-repair-5-balm', name: 'Total Repair 5 Damage Erasing Balm', brand: "L'Oréal Elvive",
                tier: 'supporting', context: 'weekly', usingUp: false,
                notes: 'Amodimethicone + hydrolyzed wheat protein + synthetic ceramide (18-MEA). Strong deep conditioner. Use 3-5 min with heat cap.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'protein_fill', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'deep_condition',
                    outcomes: { shine: 0.8, smoothness: 0.8, strength: 0.5 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'hydrolyzed wheat protein', 'ceramide np', 'cetearyl alcohol']
                }
            },
            // Use-Up Queue
            {
                id: 'dove-bond-shampoo', name: 'Bond Strength Repair Shampoo', brand: 'Dove',
                tier: 'use-up', context: 'every-wash', usingUp: true,
                notes: 'Generic silicone. Finish and don\'t repurchase.',
                intelligence: {
                    mechanisms: ['cleansing'],
                    delivery: 'rinse_off',
                    step: 'shampoo',
                    outcomes: { cleanliness: 0.7 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['sodium laureth sulfate', 'cocamidopropyl betaine', 'dimethicone']
                }
            },
            {
                id: 'dove-bond-conditioner', name: 'Bond Strength Repair Conditioner', brand: 'Dove',
                tier: 'use-up', context: 'every-wash', usingUp: true,
                notes: 'Dimethiconol \u2014 not targeted. L\'Or\u00E9al or Garnier conditioner compensates.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'conditioner',
                    outcomes: { shine: 0.4, smoothness: 0.5 },
                    cumulative: false,
                    interactions: [{ with: '*', type: 'reduces', note: 'Dimethiconol coating slightly reduces subsequent product deposition' }],
                    ingredients: ['dimethicone/silsesquioxane copolymer', 'dimethiconol', 'cetearyl alcohol', 'sh-polypeptide-121']
                }
            },
            {
                id: 'dove-bond-mask', name: 'Bond Strength Hair Mask', brand: 'Dove',
                tier: 'use-up', context: 'as-needed', usingUp: true,
                notes: 'Same generic silicone as conditioner. Use as occasional deep treatment while finishing.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'deep_condition',
                    outcomes: { shine: 0.5, smoothness: 0.6 },
                    cumulative: false,
                    interactions: [{ with: '*', type: 'reduces', note: 'Dimethiconol coating slightly reduces subsequent product deposition' }],
                    ingredients: ['dimethicone/silsesquioxane copolymer', 'dimethiconol', 'cetearyl alcohol', 'sh-polypeptide-121']
                }
            },
            {
                id: 'dove-intensive-shampoo', name: 'Intensive Repair Shampoo', brand: 'Dove',
                tier: 'use-up', context: 'every-wash', usingUp: true,
                notes: 'Finish and don\'t repurchase.',
                intelligence: {
                    mechanisms: ['cleansing'],
                    delivery: 'rinse_off',
                    step: 'shampoo',
                    outcomes: { cleanliness: 0.7 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['sodium laureth sulfate', 'cocamidopropyl betaine', 'dimethicone']
                }
            },
            {
                id: 'dove-intensive-conditioner', name: 'Intensive Repair Conditioner', brand: 'Dove',
                tier: 'use-up', context: 'every-wash', usingUp: true,
                notes: 'Weakest conditioner in collection. L\'Or\u00E9al 21-in-1 compensates.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing', 'conditioning'],
                    delivery: 'rinse_off',
                    step: 'conditioner',
                    outcomes: { shine: 0.3, smoothness: 0.4 },
                    cumulative: false,
                    interactions: [{ with: '*', type: 'reduces', note: 'Dimethiconol coating slightly reduces subsequent product deposition' }],
                    ingredients: ['dimethiconol', 'cetearyl alcohol', 'stearamidopropyl dimethylamine']
                }
            },
            {
                id: 'ogx-coconut-oil', name: 'Coconut Miracle Penetrating Oil', brand: 'OGX',
                tier: 'use-up', context: 'as-needed', usingUp: true,
                notes: 'Dimethiconol film + trace coconut oil. Useful as finishing (shine/frizz). Weak pre-wash — use pure coconut oil instead.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'finishing',
                    additionalSteps: ['pre_wash'],
                    outcomes: { shine: 0.5, frizz_control: 0.4, smoothness: 0.4 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['dimethiconol', 'cyclopentasiloxane', 'cocos nucifera oil']
                }
            },
            {
                id: 'ogx-argan-oil', name: 'Moroccan Argan Oil', brand: 'OGX',
                tier: 'use-up', context: 'as-needed', usingUp: true,
                notes: 'Dimethiconol film + trace argan oil. Finishing only — argan does not penetrate hair cortex effectively.',
                intelligence: {
                    mechanisms: ['cuticle_smoothing'],
                    delivery: 'leave_on',
                    step: 'finishing',
                    additionalSteps: ['pre_wash'],
                    outcomes: { shine: 0.4, frizz_control: 0.3, smoothness: 0.3 },
                    cumulative: false,
                    interactions: [],
                    ingredients: ['dimethiconol', 'cyclopentasiloxane', 'argania spinosa kernel oil']
                }
            },
            // Supporting Cast — Heat Protection (Blowout)
            {
                id: 'ogx-bond-heat-spray', name: 'Bond Protein Repair 450°F Heat Protect Spray', brand: 'OGX',
                tier: 'supporting', context: 'blowout', usingUp: false,
                notes: 'Amodimethicone (5th) + wheat protein (7th) + film-formers. Real heat protection with protein fill. Not true bond repair despite branding.',
                intelligence: {
                    mechanisms: ['heat_protection', 'cuticle_smoothing', 'protein_fill'],
                    delivery: 'leave_on',
                    step: 'heat_protection',
                    outcomes: { smoothness: 0.7, strength: 0.5, shine: 0.5 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['amodimethicone', 'hydrolyzed wheat protein', 'panthenol', 'dimethicone']
                }
            },
            // Use-Up Queue — Leave-in
            {
                id: 'monday-moisture-leave-in', name: 'Moisture Leave-In Conditioner', brand: 'Monday Haircare',
                tier: 'use-up', context: 'every-wash', usingUp: true,
                notes: 'Generic dimethicone (2nd) + jojoba oil + PQ-37 (light hold). Outclassed by L\'Or\u00E9al 21-in-1 in every dimension.',
                intelligence: {
                    mechanisms: ['conditioning'],
                    delivery: 'leave_on',
                    step: 'leave_in',
                    outcomes: { smoothness: 0.5, shine: 0.4 },
                    cumulative: false,
                    interactions: [{ with: 'loreal-21in1', type: 'outclassed_by', note: 'Generic dimethicone vs targeted amodimethicone' }],
                    ingredients: ['dimethicone', 'simmondsia chinensis seed oil', 'polyquaternium-37']
                }
            },
            // Supporting Cast — Finishing (Protein)
            {
                id: 'ogx-bond-protein-serum', name: 'Bond Protein Repair Sealing Serum', brand: 'OGX',
                tier: 'supporting', context: 'as-needed', usingUp: false,
                notes: 'NO SILICONES. Wheat protein (6th) + hydrolyzed keratin (9th) + film-formers. Fills cortex with protein. Different tool than Garnier serum (cuticle).',
                intelligence: {
                    mechanisms: ['protein_fill'],
                    delivery: 'leave_on',
                    step: 'finishing',
                    outcomes: { strength: 0.6, smoothness: 0.3 },
                    cumulative: false,
                    interactions: [{ with: 'garnier-filler-serum', type: 'complements', note: 'This fills cortex (protein), Garnier smooths cuticle (amodimethicone)' }],
                    ingredients: ['hydrolyzed wheat protein', 'hydrolyzed keratin', 'panthenol']
                }
            },
            // Primary Rotation — Pre-wash
            {
                id: 'pure-coconut-oil', name: 'Pure Coconut Oil', brand: 'Generic',
                tier: 'primary', context: 'every-wash', usingUp: false,
                notes: 'Penetrates hair cortex (lauric acid affinity for keratin). Prevents hygral fatigue and protein loss during washing. Best pre-wash oil for damaged/weathered hair.',
                intelligence: {
                    mechanisms: ['penetrating_oil', 'hygral_fatigue_protection'],
                    delivery: 'rinse_off',
                    step: 'pre_wash',
                    outcomes: { strength: 0.6, damage_prevention: 0.8 },
                    cumulative: true,
                    interactions: [],
                    ingredients: ['cocos nucifera oil']
                }
            },
        ];

        const DEFAULT_STATE = {
            version: CURRENT_VERSION,
            events: [],
            inventory: JSON.parse(JSON.stringify(DEFAULT_INVENTORY)),
            thresholds: {
                washMinDays: 2,
                clarifyMinDays: 5,
                proteinMinDays: 7,
                treatmentWhileSealed: true
            },
            sealState: {
                active: false,
                appliedDate: null,
                washesSinceApplied: 0
            },
            insights: [],
            proposals: [],
            settings: {
                defaultHumidity: null,
                soundEnabled: true,
                vibrationEnabled: true
            },
            useUpRotation: {
                lastAssignedProductId: null,
                lastAssignedDate: null,
                washCountSinceLastRotation: 0
            },
            lastExport: null
        };

        const HARD_FLOORS = {
            washMinDays: 1,
            clarifyMinDays: 3,
            proteinMinDays: 5
        };

        function generateUUID() {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
            }
            return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11);
        }

        /**
         * Migrate state from older schema versions to current.
         * Mutates the state object in place.
         */
        function migrateState(state) {
            // v1 → v2: Add treatments array to all existing events
            if (!state.version || state.version < 2) {
                if (Array.isArray(state.events)) {
                    state.events.forEach(function(ev) {
                        if (!ev.treatments) {
                            ev.treatments = [];
                            // Infer treatments from products for existing events
                            if (ev.products) {
                                if (ev.products.includes('everpure-clarifying')) {
                                    ev.treatments.push('clarify');
                                }
                                if (ev.products.includes('garnier-pre-shampoo') || ev.products.includes('olaplex-3')) {
                                    ev.treatments.push('protein');
                                }
                            }
                        }
                    });
                }
                state.version = 2;
            }

            // v2 → v3: Add product inventory
            if (state.version < 3) {
                state.inventory = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
                state.version = 3;
            }

            // v3 → v4: Add intelligence metadata to existing inventory products
            if (state.version < 4) {
                // Build lookup from DEFAULT_INVENTORY for known products
                var intelligenceLookup = {};
                DEFAULT_INVENTORY.forEach(function(p) {
                    intelligenceLookup[p.id] = p.intelligence;
                });

                if (Array.isArray(state.inventory)) {
                    state.inventory.forEach(function(product) {
                        if (!product.intelligence) {
                            // Try to match by ID to get pre-built intelligence
                            if (intelligenceLookup[product.id]) {
                                product.intelligence = JSON.parse(JSON.stringify(intelligenceLookup[product.id]));
                            } else {
                                // User-added product — give it a blank intelligence shell
                                product.intelligence = {
                                    mechanisms: [],
                                    delivery: 'unknown',
                                    step: 'leave_in',
                                    outcomes: {},
                                    cumulative: false,
                                    interactions: []
                                };
                            }
                        }
                    });
                }
                state.version = 4;
            }

            // v4 → v5: Rename intelligence.phase to intelligence.step, add subStep for conditioning products
            if (state.version < 5) {
                if (Array.isArray(state.inventory)) {
                    // Build lookup from DEFAULT_INVENTORY for subStep values
                    var subStepLookup = {};
                    DEFAULT_INVENTORY.forEach(function(p) {
                        if (p.intelligence && p.intelligence.subStep) {
                            subStepLookup[p.id] = p.intelligence.subStep;
                        }
                    });

                    state.inventory.forEach(function(product) {
                        if (product.intelligence) {
                            // Rename phase → step
                            if (product.intelligence.phase && !product.intelligence.step) {
                                product.intelligence.step = product.intelligence.phase;
                                delete product.intelligence.phase;
                            }
                            // Add subStep from lookup if available
                            if (!product.intelligence.subStep && subStepLookup[product.id]) {
                                product.intelligence.subStep = subStepLookup[product.id];
                            }
                        }
                    });
                }
                state.version = 5;
            }

            // v5 → v6: Granular step system (replaces step+subStep with specific step values)
            if (state.version < 6) {
                var stepMigration = {
                    'olaplex-3': 'bond_repair',
                    'garnier-pre-shampoo': 'bond_repair',
                    'ogx-bond-repair-mask': 'deep_condition',
                    'everpure-bond-pre': 'bond_repair',
                    'garnier-color-repair-cond': 'conditioner',
                    'everpure-bond-conditioner': 'conditioner',
                    'dove-bond-conditioner': 'conditioner',
                    'dove-intensive-conditioner': 'conditioner',
                    'dove-bond-mask': 'deep_condition',
                    'loreal-wonder-water': 'gloss',
                    'everpure-glossing-mask': 'gloss',
                    'loreal-21in1': 'leave_in',
                    'pantene-bond-spray': 'leave_in',
                    'marc-anthony-shield': 'heat_protection',
                    'nym-curl-talk-gel': 'styling',
                    'got2b-ultra-glued': 'styling',
                    'garnier-filler-serum': 'finishing',
                    'dove-10in1-serum': 'finishing',
                    'ogx-coconut-oil': 'finishing',
                    'ogx-argan-oil': 'finishing',
                    'everpure-bond-shampoo': 'shampoo',
                    'dove-bond-shampoo': 'shampoo',
                    'dove-intensive-shampoo': 'shampoo',
                    'everpure-clarifying': 'shampoo'
                };

                // Remap old step values for products not in the lookup
                var oldToNewStep = {
                    'wash': 'shampoo',
                    'pre_wash': 'bond_repair',
                    'post_wash': 'leave_in',
                    'style': 'styling'
                };

                if (Array.isArray(state.inventory)) {
                    state.inventory.forEach(function(product) {
                        if (product.intelligence) {
                            // Use explicit mapping if available
                            if (stepMigration[product.id]) {
                                product.intelligence.step = stepMigration[product.id];
                            } else if (oldToNewStep[product.intelligence.step]) {
                                // Fallback: map old generic step to new equivalent
                                product.intelligence.step = oldToNewStep[product.intelligence.step];
                            }
                            // Remove subStep — absorbed into granular step system
                            if (product.intelligence.subStep) {
                                delete product.intelligence.subStep;
                            }
                        }
                    });

                    // Add new products if not already present
                    var hasProduct = function(id) {
                        return state.inventory.some(function(p) { return p.id === id; });
                    };

                    if (!hasProduct('maui-curl-smoothie')) {
                        state.inventory.push({
                            id: 'maui-curl-smoothie', name: 'Curl Quench + Coconut Oil Curl Smoothie', brand: 'Maui Moisture',
                            tier: 'supporting', context: 'curly', usingUp: false,
                            notes: 'Silicone-free curl cream. Coconut oil + shea butter + PQ-37 (light hold). Defines and defrizzes.',
                            intelligence: {
                                mechanisms: ['conditioning', 'penetrating_oil'],
                                delivery: 'leave_on',
                                step: 'styling',
                                outcomes: { definition: 0.5, frizz_control: 0.4, smoothness: 0.5 },
                                cumulative: false,
                                interactions: []
                            }
                        });
                    }

                    if (!hasProduct('elvive-total-repair-5-balm')) {
                        state.inventory.push({
                            id: 'elvive-total-repair-5-balm', name: 'Total Repair 5 Damage Erasing Balm', brand: "L'Or\u00E9al Elvive",
                            tier: 'supporting', context: 'weekly', usingUp: false,
                            notes: 'Amodimethicone + hydrolyzed wheat protein + synthetic ceramide (18-MEA). Strong deep conditioner. Use 3-5 min with heat cap.',
                            intelligence: {
                                mechanisms: ['cuticle_smoothing', 'protein_fill', 'conditioning'],
                                delivery: 'rinse_off',
                                step: 'deep_condition',
                                outcomes: { shine: 0.8, smoothness: 0.8, strength: 0.5 },
                                cumulative: true,
                                interactions: []
                            }
                        });
                    }
                    // Deduplicate inventory (gel-gap card may have added a duplicate)
                    var seen = {};
                    state.inventory = state.inventory.filter(function(p) {
                        if (seen[p.id]) return false;
                        seen[p.id] = true;
                        return true;
                    });
                }
                state.version = 6;
            }

            // v6 → v7: Deduplicate inventory (gel-gap card could create duplicates)
            if (state.version < 7) {
                if (Array.isArray(state.inventory)) {
                    var seen = {};
                    state.inventory = state.inventory.filter(function(p) {
                        if (seen[p.id]) return false;
                        seen[p.id] = true;
                        return true;
                    });
                }
                state.version = 7;
            }

            // v7 → v8: Add 4 new products, update OGX oils (step→finishing, add additionalSteps)
            if (state.version < 8) {
                if (Array.isArray(state.inventory)) {
                    var hasProduct = function(id) {
                        return state.inventory.some(function(p) { return p.id === id; });
                    };

                    // Update OGX Coconut Oil: step pre_wash → finishing, add additionalSteps, update notes/mechanisms
                    state.inventory.forEach(function(product) {
                        if (product.id === 'ogx-coconut-oil') {
                            product.notes = 'Dimethiconol film + trace coconut oil. Useful as finishing (shine/frizz). Weak pre-wash \u2014 use pure coconut oil instead.';
                            product.intelligence.mechanisms = ['cuticle_smoothing'];
                            product.intelligence.step = 'finishing';
                            product.intelligence.additionalSteps = ['pre_wash'];
                            product.intelligence.outcomes = { shine: 0.5, frizz_control: 0.4, smoothness: 0.4 };
                        }
                        if (product.id === 'ogx-argan-oil') {
                            product.notes = 'Dimethiconol film + trace argan oil. Finishing only \u2014 argan does not penetrate hair cortex effectively.';
                            product.intelligence.mechanisms = ['cuticle_smoothing'];
                            product.intelligence.step = 'finishing';
                            product.intelligence.additionalSteps = ['pre_wash'];
                            product.intelligence.outcomes = { shine: 0.4, frizz_control: 0.3, smoothness: 0.3 };
                        }
                    });

                    // Add new products
                    if (!hasProduct('ogx-bond-heat-spray')) {
                        state.inventory.push({
                            id: 'ogx-bond-heat-spray', name: 'Bond Protein Repair 450\u00B0F Heat Protect Spray', brand: 'OGX',
                            tier: 'supporting', context: 'blowout', usingUp: false,
                            notes: 'Amodimethicone (5th) + wheat protein (7th) + film-formers. Real heat protection with protein fill. Not true bond repair despite branding.',
                            intelligence: {
                                mechanisms: ['heat_protection', 'cuticle_smoothing', 'protein_fill'],
                                delivery: 'leave_on',
                                step: 'heat_protection',
                                outcomes: { smoothness: 0.7, strength: 0.5, shine: 0.5 },
                                cumulative: true,
                                interactions: []
                            }
                        });
                    }

                    if (!hasProduct('monday-moisture-leave-in')) {
                        state.inventory.push({
                            id: 'monday-moisture-leave-in', name: 'Moisture Leave-In Conditioner', brand: 'Monday Haircare',
                            tier: 'use-up', context: 'every-wash', usingUp: true,
                            notes: 'Generic dimethicone (2nd) + jojoba oil + PQ-37 (light hold). Outclassed by L\'Or\u00E9al 21-in-1 in every dimension.',
                            intelligence: {
                                mechanisms: ['conditioning'],
                                delivery: 'leave_on',
                                step: 'leave_in',
                                outcomes: { smoothness: 0.5, shine: 0.4 },
                                cumulative: false,
                                interactions: [{ with: 'loreal-21in1', type: 'outclassed_by', note: 'Generic dimethicone vs targeted amodimethicone' }]
                            }
                        });
                    }

                    if (!hasProduct('ogx-bond-protein-serum')) {
                        state.inventory.push({
                            id: 'ogx-bond-protein-serum', name: 'Bond Protein Repair Sealing Serum', brand: 'OGX',
                            tier: 'supporting', context: 'as-needed', usingUp: false,
                            notes: 'NO SILICONES. Wheat protein (6th) + hydrolyzed keratin (9th) + film-formers. Fills cortex with protein. Different tool than Garnier serum (cuticle).',
                            intelligence: {
                                mechanisms: ['protein_fill'],
                                delivery: 'leave_on',
                                step: 'finishing',
                                outcomes: { strength: 0.6, smoothness: 0.3 },
                                cumulative: false,
                                interactions: [{ with: 'garnier-filler-serum', type: 'complements', note: 'This fills cortex (protein), Garnier smooths cuticle (amodimethicone)' }]
                            }
                        });
                    }

                    if (!hasProduct('pure-coconut-oil')) {
                        state.inventory.push({
                            id: 'pure-coconut-oil', name: 'Pure Coconut Oil', brand: 'Generic',
                            tier: 'primary', context: 'every-wash', usingUp: false,
                            notes: 'Penetrates hair cortex (lauric acid affinity for keratin). Prevents hygral fatigue and protein loss during washing. Best pre-wash oil for damaged/weathered hair.',
                            intelligence: {
                                mechanisms: ['penetrating_oil', 'hygral_fatigue_protection'],
                                delivery: 'rinse_off',
                                step: 'pre_wash',
                                outcomes: { strength: 0.6, damage_prevention: 0.8 },
                                cumulative: true,
                                interactions: []
                            }
                        });
                    }
                }
                state.version = 8;
            }

            // v8 → v9: Replace OGX Bond Protein Pre-Shampoo with OGX Bond Repair 1-Minute Mask
            if (state.version < 9) {
                if (Array.isArray(state.inventory)) {
                    var preIdx = state.inventory.findIndex(function(p) { return p.id === 'ogx-bond-protein-pre'; });
                    if (preIdx !== -1) {
                        state.inventory[preIdx] = {
                            id: 'ogx-bond-repair-mask', name: 'Bond Protein Repair 1-Minute Mask', brand: 'OGX',
                            tier: 'supporting', context: 'weekly', usingUp: false,
                            notes: 'Amodimethicone + wheat protein + bond plex film-formers. Rinse-off mask with both cuticle smoothing and protein fill. 1 minute application.',
                            intelligence: {
                                mechanisms: ['cuticle_smoothing', 'protein_fill', 'conditioning'],
                                delivery: 'rinse_off',
                                step: 'deep_condition',
                                outcomes: { smoothness: 0.7, strength: 0.5, shine: 0.5 },
                                cumulative: true,
                                interactions: []
                            }
                        };
                    }
                }
                state.version = 9;
            }

            // v9 → v10: Add per-product experience and results ratings
            if (state.version < 10) {
                if (Array.isArray(state.inventory)) {
                    state.inventory.forEach(function(product) {
                        if (!('experienceRating' in product)) product.experienceRating = null;
                        if (!('resultsRating' in product)) product.resultsRating = null;
                        if (!('experienceNote' in product)) product.experienceNote = null;
                        if (!('resultsNote' in product)) product.resultsNote = null;
                    });
                }
                state.version = 10;
            }

            // v10 → v11: Unify Got2b product ID (got2b-gel → got2b-ultra-glued)
            if (state.version < 11) {
                if (Array.isArray(state.inventory)) {
                    state.inventory.forEach(function(product) {
                        if (product.id === 'got2b-gel') {
                            product.id = 'got2b-ultra-glued';
                        }
                    });
                }
                if (Array.isArray(state.events)) {
                    state.events.forEach(function(event) {
                        if (Array.isArray(event.products)) {
                            for (var i = 0; i < event.products.length; i++) {
                                if (event.products[i] === 'got2b-gel') {
                                    event.products[i] = 'got2b-ultra-glued';
                                }
                            }
                        }
                    });
                }
                state.version = 11;
            }

            // v11 → v12: Add use-up rotation state
            if (state.version < 12) {
                if (!state.useUpRotation) {
                    state.useUpRotation = {
                        lastAssignedProductId: null,
                        lastAssignedDate: null,
                        washCountSinceLastRotation: 0
                    };
                }
                state.version = 12;
            }
        }

        
var 
    /**
     * Adaptive Hair Routine — v2
     * Single-file app with localStorage persistence.
     * Modules: IngredientKB, StateManager, CooldownSystem, FeedbackEngine, CompensationEngine, UseUpRotation, WalkthroughEngine, TimerManager
     */
    (function() {
        'use strict';

        // ===== StateManager =====
        const STORAGE_KEY = 'hair-routine-data';
        const CURRENT_VERSION = 12;

        /**
         * Default product inventory — pre-populated from consultation.
         * Each product: { id, name, brand, tier, context, usingUp, notes }
         * Tiers: 'primary' | 'supporting' | 'use-up'
         * Context: 'every-wash' | 'curly' | 'blowout' | 'weekly' | 'as-needed'
         */
        const 
var errors = [];
var totalIngredients = 0;
var productsWithIngredients = 0;

DEFAULT_INVENTORY.forEach(function(product) {
    var ings = product.intelligence && product.intelligence.ingredients;
    if (!ings || ings.length === 0) {
        errors.push(product.id + ': NO ingredients array');
        return;
    }
    productsWithIngredients++;
    ings.forEach(function(ing) {
        totalIngredients++;
        var found = IngredientKB.getByName(ing);
        if (!found) {
            errors.push(product.id + ': "' + ing + '" NOT in KB');
        }
    });
});

console.log('Products with ingredients:', productsWithIngredients + '/' + DEFAULT_INVENTORY.length);
console.log('Total ingredient references:', totalIngredients);

if (errors.length > 0) {
    console.log('\nERRORS (' + errors.length + '):');
    errors.forEach(function(e) { console.log('  ' + e); });
    process.exit(1);
} else {
    console.log('\nALL INGREDIENT REFERENCES VALID');
}

})();