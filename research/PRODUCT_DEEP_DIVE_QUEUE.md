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
| 11 | everpure-glossing-mask | Glossing 5-Min Lamination Mask | L'Oréal EverPure | supporting | ✅ DONE | `research/products/everpure-glossing-mask.md` — 90% score, tier confirmed |

## Batch 3: L'Oréal Elvive / Other L'Oréal

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 12 | loreal-21in1 | 21-in-1 Leave-In Spray | L'Oréal EverPure | primary | ✅ DONE | `research/products/loreal-21in1.md` — tier confirmed |
| 13 | loreal-wonder-water | 8 Second Wonder Water | L'Oréal Elvive | supporting | ✅ DONE | `research/products/loreal-wonder-water.md` — 95% score, tier confirmed |
| 14 | elvive-total-repair-5-balm | Total Repair 5 Damage Erasing Balm | L'Oréal Elvive | supporting | ✅ DONE | `research/products/elvive-total-repair-5-balm.md` — tier confirmed (Supporting). Mask replaces conditioner (shared amodimethicone). Wheat protein (pos 19) is only unique mechanism but low concentration. |

## Batch 4: Garnier Fructis Line

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 15 | garnier-color-repair-cond | Color Repair Conditioner | Garnier Fructis | primary | ✅ DONE | `research/products/garnier-color-repair-cond.md` — co-primary with EverPure; pseudoceramide + better value; 87.5% score |
| 16 | garnier-pre-shampoo | Hair Filler Inner Fiber Repair Pre-Shampoo | Garnier Fructis | supporting | ✅ DONE | `research/products/garnier-pre-shampoo.md` — tier confirmed (Supporting). Citric acid (pos 6) is real active — peer-reviewed KAP crosslinking. Peptides are cosmetic dusting. Complementary to Olaplex (different bond types). |
| 17 | garnier-filler-serum | Hair Filler Strength Repair Serum | Garnier Fructis | supporting | ✅ DONE | `research/products/garnier-filler-serum.md` — Tier downgraded to Use-Up. Standard silicone serum outclassed by Dove 10-in-1 and L'Oréal 21-in-1. Vitamin Cg at pos 15 has zero hair evidence. |

## Batch 5: Styling & Heat Protection

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 18 | nym-curl-talk-gel | Curl Talk Flash Freeze Gel | Not Your Mother's | primary | ✅ DONE | `research/products/nym-curl-talk-gel.md` — 95% score, tier confirmed |
| 19 | marc-anthony-shield | Grow Long Anti-Frizz Shield | Marc Anthony | primary | ✅ DONE | `research/products/marc-anthony-shield.md` — tier qualified: Primary (heat-styling days only). Polysilicone-29 (pos 14) = Color Wow dupe at 63% less. Caffeine/biotin are marketing. Adversarial run (3 queries, all survived). |
| 31 | garnier-diamond-sleek | Diamond Sleek Shine-Coat Smoothing Spray | Garnier Fructis | primary | ✅ DONE | `research/products/garnier-diamond-sleek.md` — Primary tier confirmed. Most complete Polysilicone-29 formula (triple protein + argan oil + high glycerin). Superior to Marc Anthony for coarse/dry hair. Adversarial run (3 queries, all survived — one with 3-6 month monitoring qualifier). Marc Anthony recommended to drop to Supporting. |
| 20 | got2b-ultra-glued | Glued Blasting Freeze Spray/Gel | Got2b | supporting | ✅ DONE | `research/products/got2b-ultra-glued.md` — Supporting tier confirmed. Focused 10-ingredient finishing spray (Amphomer rigid film polymer). NOT a curl definer — locks blowouts/updos. Complementary to NYM gel. Skip adversarial. |
| 21 | maui-curl-smoothie | Curl Quench + Coconut Oil Curl Smoothie | Maui Moisture | supporting | ✅ DONE | `research/products/maui-curl-smoothie.md` — Supporting confirmed. Silicone-free moisture cream with coconut oil (pos 4). DMDM Hydantoin concern for leave-on product. No hold, no protein. Legitimate moisture layer for cream-then-gel routine. |
| 22 | ogx-bond-heat-spray | Bond Protein Repair 450°F Heat Protect Spray | OGX | supporting | ✅ DONE | `research/products/ogx-bond-heat-spray.md` — Supporting confirmed. Amodimethicone (selective deposition) + gluconamide/gluconate bond repair + wheat protein. Complementary to Diamond Sleek (different mechanism — no humidity seal). Clean preservative system. |

## Batch 6: OGX Products (Oils + Serums)

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 23 | ogx-coconut-oil | Coconut Miracle Penetrating Oil | OGX | use-up | ✅ DONE | `research/products/ogx-coconut-oil.md` — Use-Up confirmed. Volatile silicone serum (cyclopentasiloxane + dimethiconol) with trace coconut oil (~1-3%). "Penetrating" claim debunked — coconut oil too dilute to penetrate. Redundant with Dove 10-in-1. Do not repurchase. |
| 24 | ogx-argan-oil | Moroccan Argan Oil | OGX | use-up | ✅ DONE | `research/products/ogx-argan-oil.md` — Use-Up confirmed. Functionally identical to OGX Coconut Oil (same silicone base, different trace oil). Argan oil does NOT penetrate hair cortex at any concentration. Redundant. Do not repurchase. |
| 25 | ogx-bond-repair-mask | Bond Protein Repair 1-Minute Mask | OGX | supporting | ✅ DONE | `research/products/ogx-bond-repair-mask.md` — Supporting confirmed. Behentrimonium chloride + amodimethicone + gluconamide/gluconate bond repair + dual PQ film (PQ-47 + PQ-37). 1-min contact limits depth but provides genuine weekly bond maintenance. Unique in inventory for speed + bond repair combo. Score: 87/100. |
| 26 | ogx-bond-protein-serum | Bond Protein Repair Sealing Serum | OGX | supporting | ✅ DONE | `research/products/ogx-bond-protein-serum.md` — Supporting confirmed. Silicone-free protein-focused leave-in serum. 5 wheat-derived ingredients + hydrolyzed keratin + gluconamide/gluconate bond repair. Unique niche (only silicone-free leave-in in inventory). High cost ($6.17/oz). No humidity protection. Best for targeted protein days 2-3x/week. Score: 84/100. |

## Batch 7: Standalone Products

| # | Product ID | Name | Brand | Tier | Status | Notes |
|---|-----------|------|-------|------|--------|-------|
| 27 | olaplex-3 | Olaplex 3 | Olaplex | primary | ✅ DONE | `research/products/olaplex-3.md` — Primary confirmed (95/100). BADGD at position 2 (unprecedented concentration). Unique disulfide bond repair via Michael addition — only product in inventory with this mechanism. Complementary to all other bond builders. Irreplaceable at this price point. Adversarial passed (3 angles, all survived). |
| 28 | pantene-bond-spray | Miracle Rescue Instant Repair Leave-In | Pantene | supporting | ✅ DONE | `research/products/pantene-bond-spray.md` — Supporting confirmed (77/100). Bis-Aminopropyl Dimethicone (pos 5) — unique amino silicone that bonds selectively to damage sites, resists washing out. Histidine (pos 9) — amino acid with peer-reviewed cortex penetration evidence. Minimalist 16-ingredient formula. No protein, no UV, no humidity protection. Niche: targeted damage conditioning between washes. |
| 29 | monday-moisture-leave-in | Moisture Leave-In Conditioner | Monday Haircare | use-up | ✅ DONE | `research/products/monday-moisture-leave-in.md` — Use-Up confirmed (100%). Dimethicone (non-selective, pos 2) outclassed by 21-in-1 (amodimethicone) on every axis. Jojoba/almond oils are surface-only. PQ-37 provides light hold. Finish bottle, don't repurchase. |
| 30 | pure-coconut-oil | Pure Coconut Oil | Generic | primary | ✅ DONE | `research/products/pure-coconut-oil.md` — Primary confirmed (100%). Only oil with peer-reviewed cortex penetration + protein loss prevention. Hygral fatigue framing updated per Wong 2026 — mechanism is CMC repair + protein shielding, not water-blocking. Irreplaceable. |

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
- **Completed:** 31/31 ✅ SERIES COMPLETE
- **Research notes complete (ready for write session):** 0
- **Remaining (no research):** 0

## Series Complete

All 31 products in the inventory have been researched and documented. The deep dive series is finished.

**Final session (May 11, 2026):** Completed `pure-coconut-oil` (Primary, 95/100) and rewrote `monday-moisture-leave-in` (Use-Up, 80/100).

**Tier changes identified during the series:**
- `garnier-filler-serum` — Downgraded from Supporting to Use-Up (outclassed by Dove 10-in-1 and 21-in-1)
- `marc-anthony-shield` — Recommended drop to Supporting (Diamond Sleek is superior for coarse/dry hair)

**Adversarial research (A1-A3):** All complete. No tier changes resulted.

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

