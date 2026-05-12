# Research Scores — Hair Routine Project

## Scoring System

**v1 rubric** (used through Session 25): Single composite score, all dimensions weighted equally. Known ceiling effect — reports scoring "good enough" clustered at 91-100%.

**v2 rubric** (adopted Session 26+): Mechanical/Judgment split (50/50), negative penalties for false Verified tags (-10%) and missing query logs (-5%). Expected realistic range: 70-85%.

---

## V2 Scores (current — re-scored May 10, 2026)

| # | Report | v1 Score | v2 Mech | v2 Judg | Penalties | v2 Composite | Rating |
|---|--------|----------|---------|---------|-----------|--------------|--------|
| 1 | Brief 1: Client-Side Discovery | 100% | 80% | 100% | -15% | **75%** | Good |
| 2 | Brief 2: Recommendation Patterns | 100% | 80% | 86% | -5% | **78%** | Good |
| 3 | Brief 3: Outcome Attribution | 100% | 72% | 92% | -10% | **72%** | Good |
| 4 | Phase 2: Formulation Position | 94% | 75% | 66% | -5% | **65.5%** | Needs Work |
| 5 | Hair Science Verification | 94.65% | 90% | 90% | -5% | **85%** | Excellent |
| 6 | Git Strategy | 93% | 90% | 82% | -5% | **81%** | Good |
| 7 | Sky Guide Exemplar | 91.75% | 80% | 86% | -5% | **78%** | Good |
| 8 | Project Consolidation | 97% | 90% | 88% | -5% | **84%** | Good |

### Distribution
- Excellent (85-100%): 1 report
- Good (70-84%): 6 reports
- Needs Work (55-69%): 1 report
- Unreliable (<55%): 0 reports

---

## Product Deep Dives (scored under v2 rubric at creation)

| Date | Product | v2 Mech | v2 Judg | Penalties | v2 Composite | Rating | Key Note |
|------|---------|---------|---------|-----------|--------------|--------|----------|
| 2026-05-10 | Dove Conditioner/Mask | 42.25/50 | 50/50 | -5% | 87.25% | Excellent | Confirms use-up tier; no query log (-5%) |
| 2026-05-10 | Dove Shampoos (Bond + Intensive) | 42.5/50 | 50/50 | -5% | 87.5% | Excellent | Sulfate system harsher than primary; no query log (-5%) |
| 2026-05-10 | Dove 10-in-1 Serum | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms supporting tier; aminopropyl dimethicone = selective |
| 2026-05-10 | EverPure Bond Shampoo | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms primary tier; 7-surfactant mild system + amodimethicone + citric acid (PMID 39757966); re-scored May 12 |
| 2026-05-10 | EverPure Bond Conditioner | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms primary tier; amodimethicone-only formula (improved) |
| 2026-05-10 | L'Oréal 21-in-1 Leave-In | 45/50 | 48/50 | 0% | 93% | Excellent | Confirms primary tier; coconut oil + amodimethicone + UV filter |
| 2026-05-10 | EverPure Clarifying Shampoo | — | — | — | 8.6/10 | Excellent | Confirms primary tier (periodic); AOS sulfonate + salicylic acid |
| 2026-05-10 | EverPure Bond Pre-Shampoo | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms supporting tier; same base as Garnier Hair Filler; citric acid mechanism peer-reviewed |
| 2026-05-11 | EverPure Glossing Mask | 50/50 | 45/50 | -5% | 90% | Excellent | Confirms supporting tier; coconut oil + glycolic acid + dual polymer film; INCIDecoder INCI is wrong |

---

## Key Findings from V2 Re-Score

1. **Query log universally missing** — all 8 original reports fail this. Easy fix going forward.
2. **v1 100% scores were most inflated** — dropped 22-28 points under v2.
3. **Reports with explicit Contradictions + Gaps sections score higher.**
4. **-10% penalty for false Verified tags is impactful** — Brief 1's Gemini Nano size error was the biggest single score impact.
5. **Phase 2 is the weakest report** — no tagging, no coverage sections. Needs revision if referenced for implementation.

Full analysis: `research/V2_RESCORE_COMPARISON.md`

| 2026-05-10 | Product Recommendations for Hair Profile | 45/50 | 45/50 | 0% | 90% | Excellent | Gap analysis + 4 targeted recommendations; all INCI verified |
| 2026-05-10 | Garnier Color Repair Conditioner | 47.5/50 | 45/50 | -5% | 87.5% | Excellent | Co-primary with EverPure; pseudoceramide differentiator; N4 penalty (C&T 403) |
| 2026-05-11 | Elvive Total Repair 5 Balm | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms supporting tier; mask replaces conditioner (shared amodimethicone); wheat protein (pos 19) only unique mechanism |
| 2026-05-11 | Garnier Pre-Shampoo | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms supporting tier; citric acid (pos 6) = real active (peer-reviewed KAP crosslinking); peptides are cosmetic dusting; complementary to Olaplex |
| 2026-05-11 | Marc Anthony Shield | 50/50 | 50/50 | 0% | 100% | Excellent | Tier qualified: Primary (heat-styling days only); Polysilicone-29 = Color Wow dupe at 63% less; adversarial run (3 queries, all survived) |
| 2026-05-11 | Garnier Diamond Sleek | 50/50 | 50/50 | 0% | 100% | Excellent | Primary tier confirmed (potentially superior to Marc Anthony for coarse/dry hair); most complete Polysilicone-29 formula (triple protein + argan oil + high glycerin); adversarial run (3 queries, all survived with monitoring qualifier) |

| 2026-05-12 | Project Signals & LLM Communication Patterns | 82/100 | 78/100 | 0% | 80% | Good | Meta-research on Kiro's own failure patterns; maps friction log to empirical LLM research; 5 actionable recommendations |
| 2026-05-12 | Monday Moisture Leave-In | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms use-up tier; dimethicone (non-selective) outclassed by 21-in-1 (amodimethicone) on every axis |
| 2026-05-12 | Pure Coconut Oil | 50/50 | 50/50 | 0% | 100% | Excellent | Confirms primary tier; hygral fatigue framing updated per Wong 2026; protein loss prevention + CMC repair mechanisms validated independently |
