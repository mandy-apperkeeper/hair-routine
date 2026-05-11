# Product Deep Dive Queue

**Purpose:** Track deep-dive research for every product in the hair-routine inventory. Output documents serve as educational content within the app.
**Protocol:** deep-dive-auto.md (autonomous research flow) + research-data-adherence.md
**Created:** May 10, 2026

---

## Research Question Template

> "What are the active mechanisms, delivery systems, and efficacy of [Product Name] by [Brand] for 2C-3A coarse/thick/dry hair? Full formulation analysis including ingredient positions, molecular weights where relevant, delivery-format validation, and comparison to alternatives in the same step category."

## Output Structure Per Product

### Full Research Document (`research/products/[product-id].md`)

1. Executive Summary (2-3 sentences)
2. Full INCI Analysis (ingredient-by-ingredient for key actives)
3. Mechanism Assessment (what it actually does, with evidence)
4. Delivery Format Validation (does the format support the claimed benefit?)
5. Efficacy for Hair Profile (specific to 2C-3A coarse/thick/dry)
6. Comparison to Alternatives (other products in same step category)
7. Tier Placement Validation (confirm or challenge current tier)
8. **Practical Education Section (for in-app use)**
   - **Why you're using this** — what role it fills, what would be missing without it
   - **How to know it's working** — observable signs (feel, look, behavior) that confirm benefit
   - **How to know it's NOT working** — signs of buildup, incompatibility, or diminishing returns
   - **Why this over alternatives** — what makes it better/worse than other products in the same step
   - **When to reach for something else** — conditions, hair states, or goals where a different product serves better
   - **If you're shopping for a replacement** — key ingredients to seek, formats that matter, red flags to avoid
9. Sources Index
10. Self-Critique
11. Scorecard

### Tone & Audience

- Written for Mandy as the user — science-literate, wants to understand WHY, not just WHAT
- Accurate and mechanism-based but not jargon-heavy — explain the chemistry in plain terms
- Same depth for all tiers (including use-up — understanding WHY something is inferior is educational)
- Citations stay in the research doc; the in-app version can be distilled later if needed

## Execution Model

- **1 product = 1 document = 1 scorecard** (no batched documents)
- Research sessions may cover 2-3 related products (shared source lookups) but each gets its own full write-up
- Documents are standalone — readable without context from other product docs
- Key Takeaways section is written for in-app display (plain language, actionable)
- File naming: `research/products/[PRODUCT_ID].md` (e.g., `research/products/loreal-21in1.md`)

---

## Status Key

- ✅ DONE — research complete, scored
- 🔄 IN PROGRESS — currently being researched
- ⏳ QUEUED — next up
- 📋 PLANNED — in the pipeline

---

## Batch 1: Dove Products (PARTIALLY DONE)

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 1 | dove-bond-conditioner | Bond Strength Repair Conditioner | Dove | use-up | ✅ DONE | DOVE_DEEP_DIVE.md — full analysis |
| 2 | dove-intensive-conditioner | Intensive Repair Conditioner | Dove | use-up | ✅ DONE | DOVE_DEEP_DIVE.md — full analysis |
| 3 | dove-bond-mask | Bond Strength Hair Mask | Dove | use-up | ✅ DONE | DOVE_DEEP_DIVE.md — formulation analyzed (Angle 4) |
| 4 | dove-intensive-shampoo | Intensive Repair Shampoo | Dove | use-up | ✅ DONE | `DOVE_SHAMPOO_DEEP_DIVE.md` — full analysis |
| 5 | dove-bond-shampoo | Bond Strength Repair Shampoo | Dove | use-up | ✅ DONE | `DOVE_SHAMPOO_DEEP_DIVE.md` — full analysis |
| 6 | dove-10in1-serum | Bond Repair 10-in-1 Serum | Dove | supporting | ✅ DONE | `research/products/dove-10in1-serum.md` — confirms supporting tier |

## Batch 2: L'Oréal EverPure Line (Primary + Supporting)

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 7 | everpure-bond-shampoo | Bond Repair Shampoo | L'Oréal EverPure | primary | ✅ DONE | `research/products/everpure-bond-shampoo.md` — tier confirmed |
| 8 | everpure-bond-conditioner | Bond Repair Conditioner | L'Oréal EverPure | primary | ✅ DONE | `research/products/everpure-bond-conditioner.md` — tier confirmed |
| 9 | everpure-clarifying | Clarifying Shampoo | L'Oréal EverPure | primary | ✅ DONE | `research/products/everpure-clarifying.md` — tier confirmed (periodic use) |
| 10 | everpure-bond-pre | Bond Repair Pre-Shampoo Treatment | L'Oréal EverPure | supporting | ✅ DONE | `research/products/everpure-bond-pre.md` — tier confirmed (Supporting Cast) |
| 11 | everpure-glossing-mask | Glossing 5-Min Lamination Mask | L'Oréal EverPure | supporting | 📋 PLANNED | |

## Batch 3: L'Oréal Elvive / Other L'Oréal

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 12 | loreal-21in1 | 21-in-1 Leave-In Spray | L'Oréal EverPure | primary | ✅ DONE | `research/products/loreal-21in1.md` — tier confirmed |
| 13 | loreal-wonder-water | 8 Second Wonder Water | L'Oréal Elvive | supporting | 📋 PLANNED | |
| 14 | elvive-total-repair-5-balm | Total Repair 5 Damage Erasing Balm | L'Oréal Elvive | supporting | 📋 PLANNED | |

## Batch 4: Garnier Fructis Line

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 15 | garnier-color-repair-cond | Color Repair Conditioner | Garnier Fructis | primary | 📋 PLANNED | **ELEVATED PRIORITY** — adversarial finding (A4) confirms near-identical formula to EverPure with amodimethicone at higher position + pseudoceramide. May be co-primary or replacement. |
| 16 | garnier-pre-shampoo | Hair Filler Inner Fiber Repair Pre-Shampoo | Garnier Fructis | supporting | 📋 PLANNED | |
| 17 | garnier-filler-serum | Hair Filler Strength Repair Serum | Garnier Fructis | supporting | 📋 PLANNED | |

## Batch 5: Styling & Heat Protection

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 18 | nym-curl-talk-gel | Curl Talk Flash Freeze Gel | Not Your Mother's | primary | 📋 PLANNED | |
| 19 | marc-anthony-shield | Grow Long Anti-Frizz Shield | Marc Anthony | primary | 📋 PLANNED | |
| 31 | garnier-diamond-sleek | Diamond Sleek Shine-Coat Smoothing Spray | Garnier Fructis | primary | 📋 PLANNED | Same active (Polysilicone-29) as Marc Anthony — interchangeable |
| 20 | got2b-ultra-glued | Glued Blasting Freeze Spray/Gel | Got2b | supporting | 📋 PLANNED | |
| 21 | maui-curl-smoothie | Curl Quench + Coconut Oil Curl Smoothie | Maui Moisture | supporting | 📋 PLANNED | |
| 22 | ogx-bond-heat-spray | Bond Protein Repair 450°F Heat Protect Spray | OGX | supporting | 📋 PLANNED | |

## Batch 6: OGX Products (Oils + Serums)

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 23 | ogx-coconut-oil | Coconut Miracle Penetrating Oil | OGX | use-up | 📋 PLANNED | Batch with argan oil (same base) |
| 24 | ogx-argan-oil | Moroccan Argan Oil | OGX | use-up | 📋 PLANNED | Batch with coconut oil |
| 25 | ogx-bond-repair-mask | Bond Protein Repair 1-Minute Mask | OGX | supporting | 📋 PLANNED | |
| 26 | ogx-bond-protein-serum | Bond Protein Repair Sealing Serum | OGX | supporting | 📋 PLANNED | |

## Batch 7: Standalone Products

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 27 | olaplex-3 | Olaplex 3 | Olaplex | primary | 📋 PLANNED | |
| 28 | pantene-bond-spray | Miracle Rescue Instant Repair Leave-In | Pantene | supporting | 📋 PLANNED | |
| 29 | monday-moisture-leave-in | Moisture Leave-In Conditioner | Monday Haircare | use-up | 📋 PLANNED | |
| 30 | pure-coconut-oil | Pure Coconut Oil | Generic | primary | 📋 PLANNED | |

---

## Priority Order

1. **Remaining Dove products** (finish what's started — 3 products)
2. **L'Oréal EverPure primary** (shampoo + conditioner — these are the daily drivers)
3. **Garnier Color Repair + L'Oréal 21-in-1** (best conditioner + best leave-in — highest educational value)
4. **Olaplex 3** (unique mechanism, high user interest)
5. **Styling products** (NYM gel, Marc Anthony, Got2b)
6. **Remaining supporting products**
7. **Remaining use-up products** (lowest priority — being finished anyway)

---

## Progress

- **Total products:** 31
- **Completed:** 11 (Dove conditioners/mask + shampoos + 10-in-1 serum + EverPure shampoo + conditioner + 21-in-1 + clarifying + pre-shampoo)
- **Remaining:** 20
- **Estimated sessions:** ~7-8 (2-3 products per session)

## Next Session Starts With

1. `garnier-color-repair-cond` — Color Repair Conditioner (Garnier Fructis, primary tier — **HIGHEST PRIORITY**: adversarial finding A4 shows near-identical formula to EverPure with potentially superior amodimethicone concentration + pseudoceramide. Full deep dive needed to confirm.)
2. `everpure-glossing-mask` — Glossing 5-Min Lamination Mask (L'Oréal EverPure, supporting tier)
3. `loreal-wonder-water` — 8 Second Wonder Water (L'Oréal Elvive, supporting tier)

**Rationale:** Garnier conditioner remains #1 because the adversarial pass (A4) revealed it's a near-identical formula to EverPure Bond Repair Conditioner — same amodimethicone-only system, same behentrimonium chloride, same citric acid + arginine, but with amodimethicone at position 3 (vs EverPure's position 4) and a pseudoceramide that EverPure lacks. Full deep dive will determine if it should be co-primary or replace EverPure as the primary conditioner. EverPure clarifying and pre-shampoo are now complete — glossing mask finishes the EverPure line.

---

## Adversarial Research Queue

These are adversarial angles identified during v2 scoring (May 10, 2026) that challenge assumptions in existing deep dives. Each should be run as a targeted adversarial search and appended to the relevant product report.

| # | Question | Challenges | Target Report | Priority | Status |
|---|----------|-----------|---------------|----------|--------|
| A1 | Do sulfate-free shampoos have downsides for thick/coarse hair? (insufficient cleansing, product buildup, scalp issues) | EverPure Shampoo's "sulfate-free is always better for coarse hair" framing | `everpure-bond-shampoo.md` | Medium | ✅ DONE — concern valid but mitigated by clarifying step |
| A2 | Does dimethicone in leave-in sprays actually build up meaningfully at spray concentrations? Or is the amount per application too small to matter? | 21-in-1's dimethicone/dimethiconol concern — may be overstated OR understated | `loreal-21in1.md` | Medium | ✅ DONE — unresolved (no direct data found either way) |
| A3 | Are there competing leave-in products (mass-market, $5-15) with amodimethicone + coconut oil + UV filter that would challenge the 21-in-1's "best in category" claim? | 21-in-1's "no other leave-in matches it" conclusion | `loreal-21in1.md` | High | ✅ DONE — Matrix Miracle Creator found (same formula, no dimethicone, no UV, higher price) |

**Protocol:** Each adversarial search should:
1. Log the actual search queries used (per Anti-Inflation Rule 3)
2. Report findings honestly — if the adversarial angle has merit, update the report's conclusion
3. Append findings as a new section ("Adversarial Appendix — [date]") to the target report
4. Re-score the report if findings change the assessment

