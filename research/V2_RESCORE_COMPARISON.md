# V2 Rubric Re-Score: Hair Routine Research Briefs

**Date:** May 10, 2026
**Scorer:** Kiro (v2 rubric applied to documents originally scored under v1)
**Purpose:** Compare v1 scores (all 100%) against v2 mechanical/judgment split to test calibration

---

## Brief 1: Client-Side Product Discovery Options

**Original v1 score:** 100%

### Source List (numbered by first appearance)

1. codewithseb.com — "Performance Budgets for Frontend Engineers" (2025)
2. Chrome for Developers — Prompt API docs
3. apidog.com — "What Is the Chrome Prompt API?" (2026)
4. The Next Web — Chrome + Gemini Nano at Cloud Next 2026
5. INCI API homepage (inciapi.com)
6. Open Beauty Facts data page
7. WebLLM GitHub (mlc-ai/web-llm)
8. aiweekender.substack.com — on-device LLMs (2026)
9. Hugging Face — cosmetic-ingredients dataset

### Mechanical Checks (positions 1, 3, 5, 7, 9)

| # | Source | URL Resolves | Contains Claimed Info | Fair Representation | Verdict |
|---|--------|-------------|----------------------|--------------------:|---------|
| 1 | codewithseb.com | YES | YES — states "<200KB gzipped" as JS budget | YES | PASS |
| 3 | apidog.com | YES | YES — confirms "No API key, no network round trip, no per-token bill" | YES | PASS |
| 5 | inciapi.com | YES | YES — confirms "100 free API requests/month" and "Request access" for paid | YES | PASS |
| 7 | WebLLM GitHub | YES | YES — confirms in-browser LLM inference with WebGPU | YES | PASS |
| 9 | HuggingFace dataset | YES | YES — cosmetic ingredients dataset exists | YES | PASS |

**Source Fidelity: 5/5 PASS = 100% → 25/25%**

### Factual Currency (3 most recent quantitative claims)

| Claim | Source Date | Domain Recency Limit | Newer Contradicting Data? | Verdict |
|-------|-----------|---------------------|--------------------------|---------|
| "~1.7GB model download" for Gemini Nano | 2026 (apidog) | AI tooling: 6 months | **YES — May 2026 reports confirm 4GB, not 1.7GB** (TechSpot, Yahoo, WindowsCentral) | **FAIL** |
| "100 free requests/month" INCI API | 2026 (fetched live) | Pricing: current session | No newer data found | PASS |
| "<200KB gzipped" JS budget standard | 2025 (codewithseb) | Best practices: 2 years | No newer data found | PASS |

**Factual Currency: 2/3 PASS = 67% → 10/15%**

### Tagging Compliance

| Check | Result |
|-------|--------|
| 3 Verified claims have linked sources? | YES — all Verified tags include URLs |
| 2 Inferred claims have reasoning chains? | YES — "inferred from European focus" has reasoning |
| Any untagged factual claims? | NO — confidence summary is thorough |

**Tagging: PASS = 100% → 5/5%**

### Query Log Completeness

| Check | Result |
|-------|--------|
| Document includes search query log? | **NO** |
| Queries cover multiple angles? | N/A |
| Gaps correspond to attempted queries? | N/A |

**Query Log: FAIL → 0/5%**

---

### Judgment Checks

**5. Reasoning Soundness (3 inferences: 1st, middle, last)**

| Inference | Evidence Cited? | Chain Explicit? | Alternatives Acknowledged? | Adversarial Finding | Verdict |
|-----------|----------------|----------------|---------------------------|--------------------:|---------|
| "Embedded KB is best for this app's constraints" | YES — constraints listed, alternatives compared | YES — single-file + offline + iPad = KB wins | YES — 4 alternatives evaluated | No contradicting approach found in adversarial search | PASS |
| "Chrome Prompt API not viable due to iPad/Safari" | YES — Chrome-only confirmed | YES — primary device is iPad | YES — noted as "future enhancement" | Safari still has no equivalent API (confirmed via WebKit blog search) | PASS |
| "Client-side ML not viable" | YES — model sizes cited | YES — 100KB vs multi-GB comparison | YES — noted custom classifier as "marginal" | No evidence of sub-5MB useful ingredient classifiers found | PASS |

**Reasoning: 3/3 PASS = 100% → 20/20%**

**6. Coverage and Completeness**

| Check | Result |
|-------|--------|
| Contradictions named? | Partial — no explicit "Contradictions" section, but conflicts noted inline (e.g., Chrome API is exciting but Safari-blocked) |
| Gaps named? | YES — Unknown section lists 5 specific gaps |
| 2+ alternative perspectives? | YES — 5 options evaluated |
| Limitations stated? | YES — in critique section |
| Right alternatives considered? | YES — covers the realistic option space for client-side discovery |

**Coverage: PASS = 100% → 20/20%**

**7. Actionability (1st and last recommendations)**

| Recommendation | Next Step Named? | Decision Criteria Explicit? | Reversibility? | Verdict |
|---------------|-----------------|---------------------------|---------------|---------|
| "Embedded KB + structured form" (primary) | YES — Phase 1/2/3 implementation plan | YES — "what would change this" section | Not explicitly stated | PASS |
| "Chrome Prompt API as future enhancement" | YES — "when browser support is universal" | YES — Safari support is the trigger | Implied (progressive enhancement = reversible) | PASS |

**Actionability: 2/2 PASS = 100% → 10/10%**

---

### Negative Criteria

| Check | Result | Penalty |
|-------|--------|---------|
| N1: Verified without source | None found | 0% |
| N2: Recs despite insufficient evidence | None | 0% |
| N3: Confidence inflation | None — tags are accurate | 0% |
| N4: Verified tag fails on re-check | **YES — "~1.7GB" claim is tagged Verified via apidog but actual size is 4GB** | **-10%** |
| N5: Query log missing | YES | -5% |

**Total penalties: -15%**

---

### Brief 1 Final Score

| Component | Score |
|-----------|-------|
| **Mechanical subtotal** | 40/50% |
| **Judgment subtotal** | 50/50% |
| **Penalties** | -15% |
| **Composite** | **75%** |

**Rating:** Good — fix failed items
**Reliability Note:** Mechanical score is 80%, judgment score is 100%. The mechanical failures (currency + missing query log) are fixable. The reasoning and coverage are strong.

**Key Failures:**
- Gemini Nano model size stated as ~1.7GB but is actually 4GB (currency failure + false Verified tag)
- No search query log included

**Remediation Needed:**
- Update Gemini Nano size to 4GB (doesn't change the recommendation — still too large)
- Add query log as appendix (or note it wasn't maintained)

---

---

## Brief 2: Recommendation Patterns for Small Datasets

**Original v1 score:** 100%

### Source List (numbered by first appearance)

1. Frontiers in Big Data, 2024 — "Knowledge-based recommender systems"
2. PubMed 32969513 — Bayesian adaptive N-of-1 trials (2020)
3. hollow.observing.me — Bayesian N-of-1 methodological review (2025)
4. metricgate.com — Thompson Sampling explained (2025)
5. Quantified Self — "A Framework for Personal Science" (2020)
6. n=1 Tracker app (Apple App Store, 2026) — referenced but no URL

### Mechanical Checks (positions 1, 3, 5)

Only 6 sources — checking positions 1, 3, 5 (can't reach 7, 9).

| # | Source | URL Resolves | Contains Claimed Info | Fair Representation | Verdict |
|---|--------|-------------|----------------------|--------------------:|---------|
| 1 | Frontiers in Big Data | YES | YES — covers KBR as cold-start solution | YES | PASS |
| 3 | hollow.observing.me | YES | YES — confirms Bayesian analysis for N-of-1, quotes about prior information | YES — direct quote matches | PASS |
| 5 | quantifiedself.com | YES | YES — "using empirical methods to pursue personal health questions" + five activities | YES | PASS |

**Source Fidelity: 3/3 PASS = 100% → 25/25%**

### Factual Currency

| Claim | Source Date | Domain Recency Limit | Newer Contradicting Data? | Verdict |
|-------|-----------|---------------------|--------------------------|---------|
| N-of-1 Bayesian methodology (2020 paper) | 2020 | Academic: 5 years | No newer contradicting methodology found | PASS |
| Knowledge-based recommenders for cold-start (2024) | 2024 | Academic: 5 years | No newer data found | PASS |
| Confidence thresholds (3/5/10/15/30 events) | N/A — these are the author's design, not sourced claims | N/A | N/A | N/A |

Only 2 checkable quantitative claims from external sources. Both pass.

**Factual Currency: 2/2 PASS = 100% → 15/15%**

### Tagging Compliance

| Check | Result |
|-------|--------|
| 3 Verified claims have linked sources? | YES |
| 2 Inferred claims have reasoning chains? | YES — "logical synthesis" and "logical consequence of design assumptions" |
| Any untagged factual claims? | **YES — "Wilson score lower bound" is stated as fact without source or tag** |

**Tagging: FAIL → 0/5%**

### Query Log Completeness

| Check | Result |
|-------|--------|
| Document includes search query log? | **NO** |

**Query Log: FAIL → 0/5%**

---

### Judgment Checks

**5. Reasoning Soundness**

| Inference | Evidence Cited? | Chain Explicit? | Alternatives? | Adversarial Finding | Verdict |
|-----------|----------------|----------------|--------------|--------------------:|---------|
| "Three-tier hybrid is the right architecture" | YES — N-of-1 + KBR sources | YES — constraints → approach | YES — Thompson Sampling rejected with reasoning | No contradicting approach found for single-user, small-N, rich-domain scenario | PASS |
| "Thompson Sampling is inappropriate for passive observation" | YES — design assumption cited | YES — "user controls routine, app doesn't assign" | YES — noted as appropriate for future active experimentation | Correct — TS requires action selection by the system | PASS |
| "Confidence thresholds at 3/5/10/15/30" | Partial — statistical reasoning stated but not sourced | YES — credible interval width argument | NO — no alternative threshold schemes discussed | Could argue 5 is too few for any signal; some N-of-1 literature suggests minimum 6 crossover periods | **PARTIAL** |

**Reasoning: 2.5/3 = 83% → 17/20%**

**6. Coverage and Completeness**

| Check | Result |
|-------|--------|
| Contradictions named? | NO — no explicit contradictions section |
| Gaps named? | YES — Unknown section lists 3 gaps |
| 2+ alternative perspectives? | YES — Thompson Sampling, collaborative filtering, regression all discussed |
| Limitations stated? | YES — "What This Optimizes For vs. What It Sacrifices" |
| Right alternatives considered? | YES — the relevant approaches for this problem space |

**Coverage: 4/5 checks pass = 80% → 16/20%**

**7. Actionability**

| Recommendation | Next Step Named? | Decision Criteria Explicit? | Verdict |
|---------------|-----------------|---------------------------|---------|
| "Three-tier hybrid" | YES — implementation sketch with code | YES — "what would change this recommendation" section | PASS |
| "Start with prior variance 2.0" | YES — "could tune based on first 20 events" | Partial — no explicit criteria for when to change it | PASS |

**Actionability: 2/2 PASS = 100% → 10/10%**

---

### Negative Criteria

| Check | Result | Penalty |
|-------|--------|---------|
| N1: Verified without source | None found | 0% |
| N2: Recs despite insufficient evidence | None | 0% |
| N3: Confidence inflation | None | 0% |
| N4: Verified tag fails on re-check | None — all verified tags hold | 0% |
| N5: Query log missing | YES | -5% |

**Total penalties: -5%**

---

### Brief 2 Final Score

| Component | Score |
|-----------|-------|
| **Mechanical subtotal** | 40/50% |
| **Judgment subtotal** | 43/50% |
| **Penalties** | -5% |
| **Composite** | **78%** |

**Rating:** Good — fix failed items
**Reliability Note:** Mechanical score is 80%, judgment score is 86%. Both are solid. The main gaps are process (no query log, one untagged claim) rather than substance.

**Key Failures:**
- No search query log
- "Wilson score lower bound" stated without source or confidence tag
- No explicit contradictions section
- Confidence thresholds not compared against alternative schemes

**Remediation Needed:**
- Add query log
- Tag or source the Wilson score claim
- Add a brief contradictions note (even if "no contradictions found across sources")

---

---

## Brief 3: Outcome Attribution in Multi-Variable Routines

**Original v1 score:** 100%

### Source List (numbered by first appearance)

1. Oxford Academic (Bayesynergy) — mechanism-informed interaction modeling (2021)
2. MetricGate — Leave-One-Out Meta-Analysis (2025)
3. PubMed 32969513 — Bayesian adaptive N-of-1 trials (2020)
4. Quantified Self — "A Framework for Personal Science" (2020)
5. n=1 Tracker app (Apple App Store, 2026) — referenced but no URL

### Mechanical Checks (positions 1, 3, 5)

Only 5 sources — checking positions 1, 3, 5.

| # | Source | URL Resolves | Contains Claimed Info | Fair Representation | Verdict |
|---|--------|-------------|----------------------|--------------------:|---------|
| 1 | Oxford Academic (Bayesynergy) | YES | YES — describes Bayesian modeling of synergistic interaction effects | Fair — paper is about drug synergy, applied analogically to product interactions | PASS |
| 3 | PubMed 32969513 | YES | YES — N-of-1 adaptive design, carryover handling | YES | PASS |
| 5 | n=1 Tracker app | **NO URL PROVIDED** — referenced as "Apple App Store, 2026" | UNABLE TO VERIFY | N/A | **UNABLE TO VERIFY** |

**Source Fidelity: 2 PASS + 1 UNABLE = (2 + 0.5)/3 = 83% → 21/25%**

### Factual Currency

| Claim | Source Date | Domain Recency Limit | Newer Contradicting Data? | Verdict |
|-------|-----------|---------------------|--------------------------|---------|
| "Propensity score methods need hundreds of observations minimum" | Not sourced to a specific paper | Academic: 5 years | General statistical consensus — no contradicting data | PASS (but borderline — no specific source) |
| "Bayesynergy interaction modeling" (2021) | 2021 | Academic: 5 years | No newer contradicting methodology | PASS |
| "30+ events for interaction detection" | Author's calculation, not sourced | N/A | N/A | N/A (design choice, not factual claim) |

**Factual Currency: 2/2 PASS = 100% → 15/15%**

### Tagging Compliance

| Check | Result |
|-------|--------|
| 3 Verified claims have linked sources? | 2/3 — n=1 Tracker has no URL | 
| 2 Inferred claims have reasoning chains? | YES — "logical synthesis" and "based on needing 5+ observations in each of 4 cells" |
| Any untagged factual claims? | **YES — "Shapley values need 2^n evaluations" stated without tag or source** |

**Tagging: FAIL → 0/5%**

### Query Log Completeness

**Query Log: FAIL (not present) → 0/5%**

---

### Judgment Checks

**5. Reasoning Soundness**

| Inference | Evidence Cited? | Chain Explicit? | Alternatives? | Adversarial Finding | Verdict |
|-----------|----------------|----------------|--------------|--------------------:|---------|
| "Mechanism-based decomposition is most practical" | YES — statistical limitations cited | YES — "can't isolate statistically, so use what we know" | YES — regression, Shapley, propensity all rejected | No alternative approach found that works better at N<50 with 5+ variables | PASS |
| "Don't build Shapley values" | YES — subset count argument | YES — "never have enough observations of each subset" | Partial — doesn't acknowledge that approximate Shapley exists | Approximate Shapley (SHAP) still needs a trained model, which needs data — rejection holds | PASS |
| "Guided experimentation for disambiguation" | YES — N-of-1 methodology | YES — "change one variable, compare to baseline" | YES — noted as optional, user-initiated | Valid approach per N-of-1 literature | PASS |

**Reasoning: 3/3 PASS = 100% → 20/20%**

**6. Coverage and Completeness**

| Check | Result |
|-------|--------|
| Contradictions named? | NO — no explicit section |
| Gaps named? | YES — Unknown section lists 4 gaps |
| 2+ alternative perspectives? | YES — multiple rejected approaches discussed |
| Limitations stated? | YES — "What NOT to Build" + unknowns |
| Right alternatives considered? | YES |

**Coverage: 4/5 = 80% → 16/20%**

**7. Actionability**

| Recommendation | Next Step Named? | Decision Criteria Explicit? | Verdict |
|---------------|-----------------|---------------------------|---------|
| "Mechanism-informed attribution from day 1" | YES — implementation priority list | YES — data thresholds for each layer | PASS |
| "Guided experimentation after 30+ events" | YES — specific flow described | YES — "when natural variation isn't enough" | PASS |

**Actionability: 2/2 PASS = 100% → 10/10%**

---

### Negative Criteria

| Check | Result | Penalty |
|-------|--------|---------|
| N1: Verified without source | **YES — n=1 Tracker app cited as Verified but no URL** | -5% |
| N2: Recs despite insufficient evidence | None | 0% |
| N3: Confidence inflation | None | 0% |
| N4: Verified tag fails on re-check | UNABLE TO VERIFY (n=1 Tracker) — not penalized as N4, already counted in N1 | 0% |
| N5: Query log missing | YES | -5% |

**Total penalties: -10%**

---

### Brief 3 Final Score

| Component | Score |
|-----------|-------|
| **Mechanical subtotal** | 36/50% |
| **Judgment subtotal** | 46/50% |
| **Penalties** | -10% |
| **Composite** | **72%** |

**Rating:** Good — fix failed items
**Reliability Note:** Mechanical score is 72%, judgment score is 92%. The reasoning is strong but the documentation discipline (query log, source URLs, tagging) has gaps.

**Key Failures:**
- No search query log
- n=1 Tracker app cited as Verified but has no URL (can't verify)
- "Shapley values need 2^n evaluations" untagged
- No explicit contradictions section

**Remediation Needed:**
- Add URL for n=1 Tracker or downgrade to Inferred
- Tag the Shapley claim
- Add query log
- Add contradictions note

---

---

## Comparison Summary

| Report | v1 Score | v2 Mechanical | v2 Judgment | v2 Penalties | v2 Composite | Delta |
|--------|----------|---------------|-------------|--------------|--------------|-------|
| Brief 1: Client-Side Discovery | 100% | 80% (40/50) | 100% (50/50) | -15% | **75%** | -25 |
| Brief 2: Recommendation Patterns | 100% | 80% (40/50) | 86% (43/50) | -5% | **78%** | -22 |
| Brief 3: Outcome Attribution | 100% | 72% (36/50) | 92% (46/50) | -10% | **72%** | -28 |

### Key Findings

1. **The v1 100% scores were inflated.** All three reports drop to the 72-78% range under v2. This is within the v2 calibration's "expected realistic range" (70-85%) and confirms the v2 rubric is better calibrated.

2. **Judgment scores remain high (86-100%).** The reasoning, coverage, and actionability in these reports is genuinely strong. The v2 rubric confirms this — the adversarial searches didn't find contradicting evidence for the core recommendations.

3. **Mechanical scores reveal consistent process gaps:**
   - **No query logs** in any report (all three fail this dimension)
   - **Tagging discipline** is inconsistent — some factual claims lack tags
   - **One factual currency failure** (Gemini Nano size) that also triggers the heavier -10% penalty for a false Verified tag

4. **The mechanical/judgment split is the key insight.** These reports think well but document poorly. The v1 rubric couldn't distinguish between "good research with sloppy process" and "perfect research" — it scored both 100%. The v2 rubric separates them clearly.

5. **The -10% penalty for false Verified tags works.** Brief 1's Gemini Nano claim was tagged Verified and is wrong. Under v1, this was invisible. Under v2, it's the single biggest score impact (-10% penalty + currency FAIL).

### Process Recommendations

For future research under the v2 system:
- **Always maintain a query log.** This is the easiest fix — just log searches as you go.
- **Tag every factual claim.** If it's not sourced this session, it's Unverified. Don't leave claims naked.
- **Include URLs for all Verified citations.** "Apple App Store, 2026" is not verifiable.
- **Add a Contradictions section** even if empty ("No contradictions found across sources").
- **Re-verify quantitative claims** in fast-moving domains (AI tooling) even if a source said X last week.
