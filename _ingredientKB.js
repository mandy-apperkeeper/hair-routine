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
