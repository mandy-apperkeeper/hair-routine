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
