# Research Plan: Product Relationship Modeling

## Goal

Build a verified knowledge base that enables the app to:
1. Pick ONE product per routine step (no "X or Y")
2. Explain why that product was chosen today
3. Identify what function is lost when using a weaker product
4. Name which later step compensates for the gap
5. Flag when no compensation exists (gap in inventory)

## Constraints

- Mandy's hair: 2C-3A, coarse (80-120+ μm), very thick, post-TE, weathered cuticle
- Products: only those in verified inventory (HAIR_CONSULTATION_HANDOFF.md)
- Science bar: same as verification report — peer-reviewed > cosmetic chemist > practitioner consensus > brand claims
- Recency: discard sources >2 years unless foundational

---

## Phase 1: Ingredient Function Taxonomy

**Question:** What are the distinct functional roles ingredients play in a hair routine, and which ingredients in Mandy's inventory fill each role?

**Deliverable:** A function map — each role (cuticle smoothing, humidity barrier, bond repair, protein fill, conditioning, film-forming hold, heat protection, clarifying) mapped to specific ingredients and which products contain them.

**Sources to check:**
- Lab Muffin (Wong) — ingredient function articles
- Robbins, Chemical and Physical Behavior of Human Hair (textbook)
- Cosmetic chemist sources (Perry Romanowski, Tonya McKay)
- COSMILE Europe — official function classifications
- INCIDecoder — per-ingredient function tags

**Key sub-questions:**
- Which functions are redundant across products? (e.g., multiple amodimethicone sources)
- Which functions have only one product covering them? (single point of failure)
- Which functions are missing entirely from inventory?

---

## Phase 2: Formulation Position & Delivery Systems

**Question:** How much does INCI list position and delivery vehicle affect real-world performance of the same ingredient?

**Deliverable:** Rules for when "has ingredient X" actually means "delivers ingredient X effectively" vs "contains a negligible amount."

**Sources to check:**
- Cosmetic chemist blogs on INCI list reading (concentration thresholds)
- Lab Muffin on formulation vs ingredient lists
- Specific studies on amodimethicone delivery (emulsion type matters)
- Silicone deposition studies (which formulation types deposit more)

**Key sub-questions:**
- At what INCI position does amodimethicone become functionally irrelevant?
- Does conditioner vs leave-in vs serum delivery change how much deposits?
- Are there ingredients where position doesn't matter (binary: present or not)?

---

## Phase 3: Sequential Interaction Rules

**Question:** How do products applied at step N affect products applied at step N+1, N+2, etc.?

**Deliverable:** An interaction matrix — which ingredient classes block, enhance, or are neutral to subsequent applications.

**Sources to check:**
- Silicone layering studies (does silicone A block silicone B?)
- Cationic surfactant deposition on pre-treated hair
- PQ-69 / polysilicone-29 incompatibility (already known — verify mechanism)
- Protein + silicone interaction (does protein pre-treatment affect silicone deposition?)
- Leave-in + gel layering (does leave-in type affect gel cast formation?)

**Key sub-questions:**
- Known: PQ-69 blocks polysilicone-29. Are there other blocking pairs?
- Does amodimethicone from conditioner reduce gel adhesion?
- Does Wonder Water (lamellar) affect subsequent leave-in deposition?
- Does pre-shampoo protein treatment affect conditioner absorption?

---

## Phase 4: Rotation & Accumulation Science

**Question:** Is there a science-based reason to rotate products, beyond "use it up"?

**Deliverable:** Rotation rules — which product types benefit from rotation, which should be consistent, and why.

**Sources to check:**
- Silicone buildup studies (does amodimethicone actually build up? Lab Muffin says self-limiting)
- Protein overload — real or myth? (cosmetic chemist perspectives)
- Surfactant tolerance / scalp adaptation
- Bond repair diminishing returns (Olaplex plateau)

**Key sub-questions:**
- If amodimethicone is self-limiting, is there any reason to rotate conditioners?
- Does alternating protein treatments (Olaplex vs Garnier pre-shampoo) provide different benefits, or is it redundant?
- Is "use it up" the only valid rotation reason, or are there efficacy reasons?

---

## Phase 5: Compensation Logic Verification

**Question:** For each "weaker" product in inventory, what specific function is lost, and does a later step actually cover it?

**Deliverable:** A compensation table for Mandy's specific inventory — verified claims like "Dove conditioner lacks targeted amodimethicone; L'Oréal 21-in-1 leave-in at step 5 provides it."

**Sources to check:**
- Product INCI lists (INCIDecoder, verified in consultation handoff)
- Phase 1 function map (which functions each product covers)
- Phase 3 interaction rules (does the compensating step actually work after the weaker product?)

**Key sub-questions:**
- Does the L'Oréal 21-in-1 leave-in actually deposit enough amodimethicone to compensate for a non-amodimethicone conditioner?
- If using Dove conditioner (generic silicone), does the generic silicone interfere with subsequent amodimethicone deposition from leave-in?
- Are there gaps where NO later step compensates? (These become shopping list items)

---

## Execution Plan

| Phase | Session | Depends On | Output |
|-------|---------|------------|--------|
| 1 | Next session | None | Function map |
| 2 | Same session if time | Phase 1 | Position rules |
| 3 | Following session | Phase 1 | Interaction matrix |
| 4 | Same session as 3 | Phase 1 | Rotation rules |
| 5 | After 1-4 complete | All prior phases | Compensation table |

Phases 1+2 can run in one session (broad survey + formulation deep-dive).
Phases 3+4 can run in one session (interaction + rotation are related).
Phase 5 is synthesis — applies all prior findings to Mandy's specific inventory.

## Success Criteria

The research is complete when the app can generate a statement like:

> "Today: Dove Bond Strength Conditioner (using up — 3 washes remaining). This provides generic smoothing but lacks targeted cuticle repair. Step 5 (L'Oréal 21-in-1) delivers amodimethicone directly to damaged sites. No gap in today's routine."

...and every claim in that statement is verified against the research.
