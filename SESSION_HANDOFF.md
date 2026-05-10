# Hair Routine — Session Handoff

**Last updated:** May 10, 2026 (Session 15)
**Live URL:** https://mandy-apperkeeper.github.io/hair-routine/
**Repo:** `mandy-apperkeeper/hair-routine` — main branch

---

## Current State

### What's Live & Working
- **Schema version 7** (deduplication migration)
- Landing page: single recommended action + "Something else?" toggle
- Quick-log: **7-group step-based product selection** (Pre-wash | Shampoo | Bond Repair | Condition | Leave-in & Protect | Style | Finishing)
  - Shampoo has sub-menus: Regular / Clarifying
  - Condition has sub-menus: Conditioner 🧢 / Deep Conditioner 🧢 / Gloss 🧢
  - Heat cap badge on Condition group
- Post-wash attribution card: mechanism-based "what your routine targeted today"
- Product inventory: **26 products** with full intelligence metadata
- Walkthrough engine: curly/blowout/refresh with humidity-based product substitution
- **Humidity auto-detection only** — no manual prompt. Defaults to moderate on failure.
- Dew point auto-detection via Open-Meteo API
- History view with export/import
- Compensation engine (Dove use-up cards, protein/olaplex overdue warnings)
- Gel gap card (shows if no PQ-69 gel in inventory)
- Status tracker (compact — reduced padding)

### What Was Done This Session
1. **v6: Full product step reorganization** — replaced step+subStep with 10 granular step values
2. **Added 2 new products:** Maui Moisture Curl Smoothie, L'Oréal Elvive Total Repair 5 Balm
3. **Wrote v5→v6 migration** — remaps all user inventory, removes subStep, adds new products
4. **Replaced 4-phase quick-log UI** with 7-group system + sub-menus + heat cap badges
5. **Removed humidity manual prompt** — silently defaults to moderate on auto-detect failure
6. **Compacted status tracker** — less vertical space on landing
7. **Removed garnier-serum-only compensation rule** — was noise, not actionable
8. **Updated Pantene spray** — researched via INCIDecoder, renamed to "Miracle Rescue Instant Repair Leave-In", updated mechanisms to bond_repair + cuticle_smoothing (bis-aminopropyl dimethicone)
9. **v7: Inventory deduplication** — fixes gel-gap card creating duplicate NYM gel entries
10. **Updated lane detection** — now checks both `styling` and `heat_protection` step products
11. **Added deep-condition treatment auto-detection** in quick-log save

### What's NOT Done (carry to next session)

#### Products to Add (3 researched, ready to code)

**OGX Bond Protein Repair 450°F Heat Protect Spray**
- Step: `heat_protection`
- Tier: supporting
- Context: blowout
- Mechanisms: `['heat_protection', 'cuticle_smoothing', 'protein_fill']`
- Delivery: leave_on
- Key ingredients: Amodimethicone (5th), Wheat Protein (7th), "bond plex" film-formers (not true bond repair)
- Outcomes: { smoothness: 0.7, strength: 0.5, shine: 0.5 }
- Cumulative: true (amodimethicone)
- Source: [INCIDecoder](https://incidecoder.com/products/ogx-bond-protein-repair-450of-heat-protect-spray)

**Monday Haircare Moisture Leave-In Conditioner**
- Step: `leave_in`
- Tier: supporting (or use-up — ask Mandy)
- Context: every-wash
- Mechanisms: `['conditioning']`
- Delivery: leave_on
- Key ingredients: Dimethicone (2nd, generic), Jojoba Oil (4th), PQ-37 (9th, light hold), Wheat Protein derivative (10th), Shea Butter, Sodium Hyaluronate
- Outcomes: { smoothness: 0.5, shine: 0.4 }
- Cumulative: false (dimethicone washes off)
- Notes: Outclassed by L'Oréal 21-in-1 in every dimension. Generic dimethicone vs targeted amodimethicone.
- Source: [INCIDecoder](https://incidecoder.com/products/monday-haircare-moisture-leave-in-conditioner)

**OGX Bond Protein Repair Sealing Serum**
- Step: `finishing`
- Tier: supporting (or use-up — ask Mandy)
- Context: as-needed
- Mechanisms: `['protein_fill']`
- Delivery: leave_on
- Key ingredients: Wheat Protein (6th), "bond plex" film-formers (7th-8th), Hydrolyzed Keratin (9th), Camellia Oil, Arginine
- **NO SILICONES** — purely protein-based. Different tool than Garnier Filler Serum (amodimethicone cuticle) — this fills cortex.
- Outcomes: { strength: 0.6, smoothness: 0.3 }
- Cumulative: false (no silicone to seal protein in)
- Source: [INCIDecoder](https://incidecoder.com/products/ogx-bond-protein-repair-serum)

#### Research Needed (requested by Mandy, not yet done)

1. **Pure coconut oil as pre-wash** — Mandy wants to add actual coconut oil. Research WHY it's the best pre-wash oil for her hair type (2C-3A, coarse, very thick, weathered cuticle, post-TE recovery). The science: coconut oil is one of few oils that penetrates the cortex (lauric acid affinity for hair protein). Needs proper research with sources.

2. **OGX oils: pre-wash AND post-wash/styling use** — Mandy says the OGX Coconut Oil and Argan Oil may be useful both pre-wash (on dry hair) AND post-wash/styling (on damp/styled hair). Currently they're tagged `pre_wash` only. Research whether volatile-silicone-based oil products provide different benefits at different application points. The current notes say "no lasting benefit" — verify if that's true for ALL use cases or just post-wash.

3. **Product tier decisions** — Ask Mandy: are Monday leave-in and OGX serum "supporting cast" or "use-up queue"?

#### Architecture Note: Products in Multiple Steps
The current system assumes one step per product. Mandy's point about OGX oils being useful both pre AND post challenges this. Options:
- A) Allow `step` to be an array (breaking change, touches UI grouping logic)
- B) Create separate inventory entries for different use contexts (e.g., "OGX Coconut Oil (pre-wash)" and "OGX Coconut Oil (finishing)")
- C) Show products in multiple groups based on a new `additionalSteps` field

This is a design decision — don't implement without discussing with Mandy.

---

## Schema

**Version:** 7 (live)
**Intelligence shape (v6+, no subStep):**
```js
intelligence: {
    mechanisms: string[],
    delivery: 'rinse_off' | 'leave_on' | 'unknown',
    step: 'pre_wash' | 'shampoo' | 'bond_repair' | 'conditioner' | 'deep_condition' | 'gloss' | 'leave_in' | 'heat_protection' | 'styling' | 'finishing',
    outcomes: { [key: string]: number },
    cumulative: boolean,
    interactions: Array<{ with: string, type: string, note: string }>
}
```

---

## Cumulative Decisions (Do Not Revisit)

### Hair Science
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils: volatile silicones + oil. Current assessment "no lasting benefit" — PENDING RE-EVALUATION per Mandy's request.
- No product rotation needed for any category.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask. Default moderate on failure.
- Abbey Yung 11-step method is the reference model for logging.
- Hard floors: wash ≥ 1 day, clarify ≥ 3 days, protein ≥ 5 days.
- "Pre-shampoo treatment" is a marketing term — bond repair products work best on a clean surface (after shampoo) and get sealed in by conditioner.
- Heat cap benefits all conditioning-step products (conditioner, deep conditioner, gloss).
- Pantene Miracle Rescue Leave-In is a genuine bond repair product (bis-aminopropyl dimethicone).
- OGX Bond Protein Repair Sealing Serum is silicone-free protein fill (different tool than Garnier serum).

### Architecture
- Single-file HTML app, localStorage, no backend, offline-first, GitHub Pages.
- Schema version 7. Intelligence uses granular `step` values (no subStep).
- Treatments are separate from products in the data model.
- Products CAN appear in multiple activity categories (but currently limited to one step — needs design decision).
- No humidity prompt — auto-detect only, silent fallback to moderate.

### Product
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.
- Mandy owns: NYM Curl Talk gel, Maui Moisture Curl Smoothie, L'Oréal Elvive Total Repair 5 Balm, OGX Bond Protein Repair Heat Spray, Monday Moisture Leave-In, OGX Bond Protein Repair Sealing Serum, pure coconut oil.
- Elvive Glycolic Gloss 5-Min Lamination = same product as EverPure Glossing Lamination Mask. One entry only.
- Goal of logging is data gathering for correlations, not minimal taps.

---

## Key Files

| File | Role |
|------|------|
| `index.html` | Live app (~5300 lines, single-file architecture) |
| `hair-sw.js` | Service worker (not yet registered in v1) |
| `.kiro/specs/product-intelligence/` | Active spec for intelligence system |
| `.kiro/specs/adaptive-hair-routine/` | Original spec (complete) |
| `research/` | 5 research phases + 3 briefs (all complete) |
| `HAIR_CONSULTATION_HANDOFF.md` | Hair science + product reference |

---

## Session History (abbreviated)

| Session | What | Status |
|---------|------|--------|
| 1-8 | Core app build | Complete |
| 9 | Product inventory (24 products, CRUD, tiers) | Complete |
| 10 | Logging UX overhaul | Complete |
| 11 | Product Intelligence scoping | Complete (design) |
| 12 | Research briefs + attribution card + spec | Complete |
| 13 | Schema rename (phase→step, added subStep) | Complete |
| 14 | Step reorganization planning + new product research | Complete (design) |
| 15 | **Step reorganization implementation, humidity fix, tracker compact, Pantene research, dedup fix** | Complete |

---

## Repo State

- **Branch:** main
- **Clean:** All changes committed and pushed.
- **GitHub Pages:** Live and working at schema v7.
