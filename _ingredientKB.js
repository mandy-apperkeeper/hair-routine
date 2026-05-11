        // ===== IngredientKB (Ingredient Knowledge Base) =====
        // ~100 hair care ingredients indexed by normalized INCI name.
        // Sources: PHASE1_INGREDIENT_FUNCTION_MAP.md, HAIR_CONSULTATION_HANDOFF.md, INCIDecoder, Lab Muffin (Wong 2024)
        // Functional roles: cuticle_smoothing, bond_repair, protein_fill, humidity_barrier,
        //   conditioning, penetrating_oil, humectant, clarifying, heat_protection, hold,
        //   film_forming, chelating, surfactant, emollient, antioxidant, uv_filter, preservative
        const INGREDIENT_KB = {
            // ===== Cuticle Smoothing / Silicones =====
            'amodimethicone': {
                inci: 'Amodimethicone',
                commonName: 'Amodimethicone',
                roles: ['cuticle_smoothing'],
                mechanism: 'Amine-functionalized silicone that selectively binds damaged cuticle via electrostatic attraction. Self-limiting — positive charges repel additional deposition, preventing buildup. Crosslinks after deposition for durability.',
                mwClass: 'high',
                flags: ['cumulative', 'selective_binding', 'self_limiting'],
                interactionFlags: ['blocks_penetration_after'],
                outcomeWeights: { shine: 0.8, smoothness: 0.9, frizz_control: 0.6 }
            },
            'bis-cetearyl amodimethicone': {
                inci: 'Bis-Cetearyl Amodimethicone',
                commonName: 'Bis-Cetearyl Amodimethicone',
                roles: ['cuticle_smoothing'],
                mechanism: 'Amodimethicone variant with cetearyl chains for enhanced deposition from emulsion systems. Same selective binding mechanism as amodimethicone.',
                mwClass: 'high',
                flags: ['cumulative', 'selective_binding', 'self_limiting'],
                interactionFlags: ['blocks_penetration_after'],
                outcomeWeights: { shine: 0.8, smoothness: 0.9, frizz_control: 0.6 }
            },
            'dimethicone': {
                inci: 'Dimethicone',
                commonName: 'Dimethicone',
                roles: ['cuticle_smoothing'],
                mechanism: 'Non-selective uniform silicone coating. Provides slip and shine but deposits on all surfaces equally (healthy and damaged). Can build up without clarifying.',
                mwClass: 'high',
                flags: ['non_selective', 'buildup_risk'],
                interactionFlags: ['blocks_penetration_after'],
                outcomeWeights: { shine: 0.6, smoothness: 0.7, frizz_control: 0.4 }
            },
            'dimethiconol': {
                inci: 'Dimethiconol',
                commonName: 'Dimethiconol',
                roles: ['cuticle_smoothing'],
                mechanism: 'Hydroxyl-terminated silicone. Heavier film than dimethicone, more substantive deposition. Non-selective coating.',
                mwClass: 'high',
                flags: ['non_selective', 'buildup_risk', 'heavy_film'],
                interactionFlags: ['blocks_penetration_after', 'reduces_subsequent_deposition'],
                outcomeWeights: { shine: 0.5, smoothness: 0.6, frizz_control: 0.4 }
            },
            'cyclomethicone': {
                inci: 'Cyclomethicone',
                commonName: 'Cyclomethicone (volatile)',
                roles: ['cuticle_smoothing'],
                mechanism: 'Volatile cyclic silicone (D4/D5). Evaporates after application — provides temporary slip during styling but leaves no lasting film.',
                mwClass: 'low',
                flags: ['volatile', 'no_residue'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3 }
            },
            'cyclopentasiloxane': {
                inci: 'Cyclopentasiloxane',
                commonName: 'Cyclopentasiloxane (D5)',
                roles: ['cuticle_smoothing'],
                mechanism: 'Volatile cyclic silicone carrier. Evaporates completely — used as a vehicle for heavier silicones or as a dry-touch emollient.',
                mwClass: 'low',
                flags: ['volatile', 'no_residue', 'carrier'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.2 }
            },
            'dimethicone/silsesquioxane copolymer': {
                inci: 'Dimethicone/Silsesquioxane Copolymer',
                commonName: 'Dimethicone/Silsesquioxane Copolymer',
                roles: ['cuticle_smoothing'],
                mechanism: 'Branched silicone network. Heavier film than linear dimethicone, non-selective coating. Used in Dove products.',
                mwClass: 'high',
                flags: ['non_selective', 'buildup_risk', 'heavy_film'],
                interactionFlags: ['blocks_penetration_after', 'reduces_subsequent_deposition'],
                outcomeWeights: { shine: 0.5, smoothness: 0.6 }
            },
            'bis-aminopropyl dimethicone': {
                inci: 'Bis-Aminopropyl Dimethicone',
                commonName: 'Bis-Aminopropyl Dimethicone',
                roles: ['cuticle_smoothing', 'bond_repair'],
                mechanism: 'Amine-functionalized silicone with bond-bridging capability. Selectively binds damaged sites AND can bridge between keratin chains (weaker than Olaplex but genuine bond repair).',
                mwClass: 'high',
                flags: ['cumulative', 'selective_binding', 'bond_bridging'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.7, strength: 0.5, shine: 0.5 }
            },
            'polysilicone-29': {
                inci: 'Polysilicone-29',
                commonName: 'Polysilicone-29 (heat-activated seal)',
                roles: ['heat_protection', 'cuticle_smoothing'],
                mechanism: 'Heat-activated silicone that polymerizes at blow-dry temperatures (>100°C), forming a durable seal lasting up to 72 hours. Activates seal state in the app.',
                mwClass: 'high',
                flags: ['heat_activated', 'durable_seal', 'activates_seal_state'],
                interactionFlags: ['blocks_penetration_after'],
                outcomeWeights: { smoothness: 0.8, frizz_control: 0.7, strength: 0.3 }
            },

            // ===== Bond Repair =====
            'bis-aminopropyl diglycol dimaleate': {
                inci: 'Bis-Aminopropyl Diglycol Dimaleate',
                commonName: 'Olaplex bond builder',
                roles: ['bond_repair'],
                mechanism: 'Maleate groups react with cysteine residues to reform disulfide bridges in cortex. True covalent bond reconnection — the only ingredient class that does this.',
                mwClass: 'low',
                flags: ['cumulative', 'penetrating', 'covalent_repair'],
                interactionFlags: ['requires_clean_surface'],
                outcomeWeights: { strength: 0.9, elasticity: 0.8 }
            },
            'citric acid': {
                inci: 'Citric Acid',
                commonName: 'Citric Acid',
                roles: ['bond_repair', 'chelating'],
                mechanism: 'pH-mediated cuticle closure + non-covalent protein network reinforcement. Chelates hard water minerals. NOT true disulfide bond repair despite marketing claims.',
                mwClass: 'low',
                flags: ['ph_adjuster', 'chelating', 'non_covalent'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.3, shine: 0.2 }
            },
            'malic acid': {
                inci: 'Malic Acid',
                commonName: 'Malic Acid',
                roles: ['bond_repair'],
                mechanism: 'Alpha-hydroxy acid. pH adjustment and mild cuticle smoothing. Similar to citric acid but weaker chelation.',
                mwClass: 'low',
                flags: ['ph_adjuster', 'non_covalent'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.2, shine: 0.2 }
            },
            'tartaric acid': {
                inci: 'Tartaric Acid',
                commonName: 'Tartaric Acid',
                roles: ['bond_repair'],
                mechanism: 'Dicarboxylic acid. pH adjustment, mild chelation. Used in "bond repair" formulas as supporting acid.',
                mwClass: 'low',
                flags: ['ph_adjuster', 'non_covalent'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.2 }
            },

            // ===== Protein Fill =====
            'hydrolyzed wheat protein': {
                inci: 'Hydrolyzed Wheat Protein',
                commonName: 'Wheat Protein',
                roles: ['protein_fill'],
                mechanism: 'Hydrolyzed peptides that penetrate the cortex to fill structural gaps left by damage. Increases strand diameter and reduces breakage. MW varies by hydrolysis degree.',
                mwClass: 'mid',
                flags: ['penetrating', 'temporary_fill'],
                interactionFlags: ['benefits_from_clean_surface'],
                outcomeWeights: { strength: 0.7, elasticity: 0.4 }
            },
            'hydrolyzed keratin': {
                inci: 'Hydrolyzed Keratin',
                commonName: 'Keratin Protein',
                roles: ['protein_fill'],
                mechanism: 'Keratin peptides with amino acid profile matching hair protein. Penetrates cortex, fills gaps. Slightly different profile than wheat protein.',
                mwClass: 'mid',
                flags: ['penetrating', 'temporary_fill'],
                interactionFlags: ['benefits_from_clean_surface'],
                outcomeWeights: { strength: 0.7, elasticity: 0.5 }
            },
            'hydrolyzed silk': {
                inci: 'Hydrolyzed Silk',
                commonName: 'Silk Protein',
                roles: ['protein_fill', 'conditioning'],
                mechanism: 'Silk fibroin peptides. Smaller MW than keratin — penetrates well. Adds shine and smoothness in addition to structural fill.',
                mwClass: 'low',
                flags: ['penetrating', 'temporary_fill'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.5, shine: 0.4, smoothness: 0.3 }
            },
            'hydrolyzed collagen': {
                inci: 'Hydrolyzed Collagen',
                commonName: 'Collagen Protein',
                roles: ['protein_fill', 'humectant'],
                mechanism: 'Collagen peptides. Primarily surface-adsorbing due to larger MW. Provides moisture retention and mild structural support.',
                mwClass: 'high',
                flags: ['surface_adsorbing', 'moisture_binding'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.3, smoothness: 0.3 }
            },
            'hydrolyzed rice protein': {
                inci: 'Hydrolyzed Rice Protein',
                commonName: 'Rice Protein',
                roles: ['protein_fill'],
                mechanism: 'Small peptides from rice. Good penetration due to low MW. Strengthens without heaviness.',
                mwClass: 'low',
                flags: ['penetrating', 'temporary_fill', 'lightweight'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.5, elasticity: 0.3 }
            },
            'sh-polypeptide-121': {
                inci: 'SH-Polypeptide-121',
                commonName: 'SH-Polypeptide-121',
                roles: ['protein_fill'],
                mechanism: 'Synthetic peptide. Likely high MW — primarily surface-level protein adsorption rather than cortex penetration.',
                mwClass: 'high',
                flags: ['surface_adsorbing'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.3, smoothness: 0.2 }
            },
            'histidine': {
                inci: 'Histidine',
                commonName: 'Histidine (amino acid)',
                roles: ['protein_fill'],
                mechanism: 'Free amino acid that penetrates cortex due to very small size. Fills gaps at the molecular level. Used in Pantene bond repair products.',
                mwClass: 'low',
                flags: ['penetrating', 'amino_acid'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.4, elasticity: 0.3 }
            },

            // ===== Humidity Barrier / Hold Polymers =====
            'polyquaternium-69': {
                inci: 'Polyquaternium-69',
                commonName: 'PQ-69',
                roles: ['humidity_barrier', 'hold'],
                mechanism: 'Cationic polymer (vinyl caprolactam + vinylpyrrolidone + DMAPMA + lauryldimonium chloride). Forms a continuous film that resists plasticization by moisture — maintains integrity in high humidity unlike older polymers.',
                mwClass: 'high',
                flags: ['humidity_resistant', 'film_forming', 'cationic'],
                interactionFlags: ['may_block_subsequent_silicone'],
                outcomeWeights: { definition: 0.9, frizz_control: 0.9, hold: 0.8 }
            },
            'polyquaternium-37': {
                inci: 'Polyquaternium-37',
                commonName: 'PQ-37',
                roles: ['conditioning', 'hold'],
                mechanism: 'Conditioning polymer with light hold. NOT humidity-resistant — softens in moisture. Provides slip and light definition.',
                mwClass: 'high',
                flags: ['conditioning_polymer', 'light_hold'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.4, definition: 0.3, hold: 0.3 }
            },
            'polyquaternium-11': {
                inci: 'Polyquaternium-11',
                commonName: 'PQ-11',
                roles: ['hold', 'conditioning'],
                mechanism: 'Film-forming conditioning polymer. Moderate hold with conditioning properties. Common in styling products.',
                mwClass: 'high',
                flags: ['film_forming', 'conditioning_polymer'],
                interactionFlags: [],
                outcomeWeights: { hold: 0.5, definition: 0.4, smoothness: 0.3 }
            },
            'polyquaternium-4': {
                inci: 'Polyquaternium-4',
                commonName: 'PQ-4',
                roles: ['hold'],
                mechanism: 'Cellulose-based cationic polymer. Provides hold and body. Less conditioning than PQ-11.',
                mwClass: 'high',
                flags: ['film_forming'],
                interactionFlags: [],
                outcomeWeights: { hold: 0.6, definition: 0.4 }
            },
            'polyquaternium-7': {
                inci: 'Polyquaternium-7',
                commonName: 'PQ-7',
                roles: ['conditioning'],
                mechanism: 'Cationic conditioning polymer. Improves wet combing and reduces static. Minimal hold.',
                mwClass: 'high',
                flags: ['conditioning_polymer'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.4, definition: 0.2 }
            },
            'polyquaternium-10': {
                inci: 'Polyquaternium-10',
                commonName: 'PQ-10',
                roles: ['conditioning'],
                mechanism: 'Cellulose-based cationic polymer. Improves wet combing, reduces static. Very common in shampoos and conditioners.',
                mwClass: 'high',
                flags: ['conditioning_polymer'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3 }
            },
            'vp/va copolymer': {
                inci: 'VP/VA Copolymer',
                commonName: 'VP/VA Copolymer',
                roles: ['hold', 'film_forming'],
                mechanism: 'Vinylpyrrolidone/vinyl acetate copolymer. Classic film-forming hold polymer. Moderate humidity resistance. Used in many styling products.',
                mwClass: 'high',
                flags: ['film_forming', 'moderate_humidity_resistance'],
                interactionFlags: [],
                outcomeWeights: { hold: 0.7, definition: 0.5 }
            },
            'pvp': {
                inci: 'PVP',
                commonName: 'Polyvinylpyrrolidone',
                roles: ['hold', 'film_forming'],
                mechanism: 'Film-forming polymer providing strong hold. Hygroscopic — absorbs moisture and can become tacky in high humidity.',
                mwClass: 'high',
                flags: ['film_forming', 'hygroscopic', 'humidity_sensitive'],
                interactionFlags: [],
                outcomeWeights: { hold: 0.8, definition: 0.5 }
            },

            // ===== Conditioning (Cationic Surfactants) =====
            'cetrimonium chloride': {
                inci: 'Cetrimonium Chloride',
                commonName: 'Cetrimonium Chloride',
                roles: ['conditioning'],
                mechanism: 'Cationic surfactant. Attracted to negatively-charged hair surface, forms monolayer that smooths cuticle, reduces friction, neutralizes static.',
                mwClass: 'low',
                flags: ['cationic', 'detangling'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.6, shine: 0.3 }
            },
            'behentrimonium chloride': {
                inci: 'Behentrimonium Chloride',
                commonName: 'Behentrimonium Chloride',
                roles: ['conditioning'],
                mechanism: 'Long-chain (C22) cationic surfactant. More substantive than cetrimonium due to longer alkyl chain. Excellent detangling and conditioning.',
                mwClass: 'low',
                flags: ['cationic', 'detangling', 'substantive'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.7, shine: 0.4 }
            },
            'stearamidopropyl dimethylamine': {
                inci: 'Stearamidopropyl Dimethylamine',
                commonName: 'Stearamidopropyl Dimethylamine',
                roles: ['conditioning'],
                mechanism: 'Fatty acid amidoamine. Becomes cationic at low pH — conditions hair similarly to quats but milder. Common in "natural" conditioners.',
                mwClass: 'low',
                flags: ['cationic_at_low_ph', 'mild'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.5, shine: 0.3 }
            },
            'cetearyl alcohol': {
                inci: 'Cetearyl Alcohol',
                commonName: 'Cetearyl Alcohol (fatty alcohol)',
                roles: ['conditioning', 'emollient'],
                mechanism: 'Fatty alcohol blend (cetyl + stearyl). Provides slip, softness, and body. NOT a drying alcohol — this is an emollient. Forms the base of most conditioner formulas.',
                mwClass: 'mid',
                flags: ['emollient', 'thickener', 'non_drying'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.4, softness: 0.5 }
            },
            'cetyl alcohol': {
                inci: 'Cetyl Alcohol',
                commonName: 'Cetyl Alcohol (fatty alcohol)',
                roles: ['conditioning', 'emollient'],
                mechanism: 'C16 fatty alcohol. Emollient and thickener. Provides slip and softness.',
                mwClass: 'mid',
                flags: ['emollient', 'thickener', 'non_drying'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3, softness: 0.4 }
            },
            'stearyl alcohol': {
                inci: 'Stearyl Alcohol',
                commonName: 'Stearyl Alcohol (fatty alcohol)',
                roles: ['conditioning', 'emollient'],
                mechanism: 'C18 fatty alcohol. Heavier than cetyl — more conditioning, more body.',
                mwClass: 'mid',
                flags: ['emollient', 'thickener', 'non_drying'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.4, softness: 0.5 }
            },

            // ===== Penetrating Oils =====
            'cocos nucifera oil': {
                inci: 'Cocos Nucifera (Coconut) Oil',
                commonName: 'Coconut Oil',
                roles: ['penetrating_oil'],
                mechanism: 'Lauric acid has small molecular structure and high affinity for hair proteins, allowing cortex penetration. Reduces hygral fatigue and protein loss during washing. Unique among oils.',
                mwClass: 'mid',
                flags: ['penetrating', 'cortex_access', 'hygral_fatigue_protection'],
                interactionFlags: ['best_on_clean_surface'],
                outcomeWeights: { strength: 0.6, damage_prevention: 0.8 }
            },
            'argania spinosa kernel oil': {
                inci: 'Argania Spinosa Kernel Oil',
                commonName: 'Argan Oil',
                roles: ['emollient'],
                mechanism: 'Surface emollient only — does NOT penetrate hair cortex. Stays in outer 5µm. Provides shine and softness on the surface.',
                mwClass: 'mid',
                flags: ['surface_only', 'emollient'],
                interactionFlags: [],
                outcomeWeights: { shine: 0.4, smoothness: 0.3 }
            },
            'simmondsia chinensis seed oil': {
                inci: 'Simmondsia Chinensis (Jojoba) Seed Oil',
                commonName: 'Jojoba Oil',
                roles: ['emollient'],
                mechanism: 'Liquid wax ester (not a true oil). Mimics sebum composition. Surface emollient — does not penetrate cortex.',
                mwClass: 'mid',
                flags: ['surface_only', 'emollient', 'sebum_mimic'],
                interactionFlags: [],
                outcomeWeights: { shine: 0.3, smoothness: 0.3 }
            },
            'helianthus annuus seed oil': {
                inci: 'Helianthus Annuus (Sunflower) Seed Oil',
                commonName: 'Sunflower Oil',
                roles: ['emollient'],
                mechanism: 'Surface emollient. High in linoleic acid. Does not penetrate cortex (per Rele & Mohile 2003).',
                mwClass: 'mid',
                flags: ['surface_only', 'emollient'],
                interactionFlags: [],
                outcomeWeights: { shine: 0.3, smoothness: 0.2 }
            },
            'persea gratissima oil': {
                inci: 'Persea Gratissima (Avocado) Oil',
                commonName: 'Avocado Oil',
                roles: ['emollient', 'penetrating_oil'],
                mechanism: 'Monounsaturated fatty acids with some cortex penetration ability (less than coconut oil). Provides both surface emolliency and mild internal lubrication.',
                mwClass: 'mid',
                flags: ['partial_penetration', 'emollient'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.4, strength: 0.2 }
            },
            'ricinus communis seed oil': {
                inci: 'Ricinus Communis (Castor) Seed Oil',
                commonName: 'Castor Oil',
                roles: ['emollient', 'humectant'],
                mechanism: 'Ricinoleic acid (90%) is hygroscopic — attracts moisture. Very thick/viscous. Surface emollient with humectant properties.',
                mwClass: 'mid',
                flags: ['surface_only', 'humectant', 'viscous'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3, shine: 0.4 }
            },
            'butyrospermum parkii butter': {
                inci: 'Butyrospermum Parkii (Shea) Butter',
                commonName: 'Shea Butter',
                roles: ['emollient', 'conditioning'],
                mechanism: 'Rich emollient with stearic and oleic acids. Seals moisture, provides softness and weight. Surface-level — does not penetrate cortex.',
                mwClass: 'high',
                flags: ['surface_only', 'emollient', 'heavy'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.5, softness: 0.6, frizz_control: 0.3 }
            },

            // ===== Humectants =====
            'panthenol': {
                inci: 'Panthenol',
                commonName: 'Pro-Vitamin B5',
                roles: ['humectant', 'protein_fill'],
                mechanism: 'Penetrates hair shaft due to small molecular size. Converts to pantothenic acid inside hair. Attracts and retains water, increasing strand diameter by up to 10%. Effective at 1-5% concentration.',
                mwClass: 'low',
                flags: ['penetrating', 'hygroscopic', 'diameter_increasing'],
                interactionFlags: [],
                outcomeWeights: { strength: 0.4, elasticity: 0.5, smoothness: 0.3 }
            },
            'glycerin': {
                inci: 'Glycerin',
                commonName: 'Glycerin',
                roles: ['humectant'],
                mechanism: 'Polyol humectant. Attracts water from environment. In high humidity (>65°F dew point), can attract excess moisture causing frizz. In low humidity, can draw moisture FROM hair.',
                mwClass: 'low',
                flags: ['hygroscopic', 'humidity_sensitive', 'dew_point_dependent'],
                interactionFlags: ['counterproductive_in_high_humidity'],
                outcomeWeights: { smoothness: 0.3, frizz_control: -0.3 }
            },
            'propylene glycol': {
                inci: 'Propylene Glycol',
                commonName: 'Propylene Glycol',
                roles: ['humectant'],
                mechanism: 'Small-molecule humectant and solvent. Penetrates hair shaft. Less humidity-sensitive than glycerin.',
                mwClass: 'low',
                flags: ['penetrating', 'solvent', 'humectant'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.2 }
            },
            'butylene glycol': {
                inci: 'Butylene Glycol',
                commonName: 'Butylene Glycol',
                roles: ['humectant'],
                mechanism: 'Lightweight humectant and solvent. Less hygroscopic than glycerin — less humidity sensitivity.',
                mwClass: 'low',
                flags: ['humectant', 'solvent', 'lightweight'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.2 }
            },
            'sodium hyaluronate': {
                inci: 'Sodium Hyaluronate',
                commonName: 'Hyaluronic Acid (salt)',
                roles: ['humectant'],
                mechanism: 'High MW polysaccharide. Holds up to 1000x its weight in water. Too large to penetrate hair — forms a moisture-retaining film on surface.',
                mwClass: 'high',
                flags: ['surface_only', 'moisture_film', 'non_penetrating'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3, softness: 0.3 }
            },
            'aloe barbadensis leaf juice': {
                inci: 'Aloe Barbadensis Leaf Juice',
                commonName: 'Aloe Vera',
                roles: ['humectant', 'conditioning'],
                mechanism: 'Polysaccharide-rich gel. Provides moisture retention and mild conditioning. Primarily surface-level.',
                mwClass: 'high',
                flags: ['surface_only', 'mild'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3, softness: 0.2 }
            },
            'honey': {
                inci: 'Mel (Honey)',
                commonName: 'Honey',
                roles: ['humectant', 'emollient'],
                mechanism: 'Natural humectant rich in sugars. Attracts and retains moisture. Can be heavy on fine hair.',
                mwClass: 'mid',
                flags: ['humectant', 'emollient', 'heavy_on_fine_hair'],
                interactionFlags: [],
                outcomeWeights: { smoothness: 0.3, softness: 0.4 }
            },
