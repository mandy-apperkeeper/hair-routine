# Research Briefs — Product Intelligence System

These are focused research questions to run in separate sessions. None are blocking implementation — they inform future phases.

---

## Brief 1: Client-Side Product Discovery Options

**Question:** What are the viable approaches for AI-assisted or structured product discovery that work within a single-file HTML app (no backend, localStorage, GitHub Pages)?

**Why it matters:** Phase 5 of the Product Intelligence System (online discovery) needs a mechanism for users to add new products with full intelligence metadata. The current architecture has no backend.

**Research angles:**
- Pre-computed ingredient databases that ship as JSON (size constraints?)
- Client-side inference (ONNX.js, TensorFlow.js, WebLLM) — feasibility for a single-file app
- Structured form approach with ingredient lookup tables
- Hybrid: structured form + optional API call to a free/cheap service for enrichment
- What CosDNA, INCIDecoder, or similar databases offer via API (if any)
- Size budget: how large can a bundled knowledge base be before it hurts load time on iPad?

**Success criteria:** A recommended approach with size/complexity tradeoffs quantified.

**Recency requirement:** Sources from 2024-2026 only (client-side ML is evolving fast).

---

## Brief 2: Recommendation Engine Patterns for Small Datasets

**Question:** What recommendation/correlation patterns work well with very small datasets (5-50 logged events) and domain-specific rules?

**Why it matters:** The app needs to make useful recommendations early (not after 100+ data points). The domain knowledge (hair science) is rich but the user data is sparse.

**Research angles:**
- Rule-based vs statistical vs hybrid recommendation for small N
- Bayesian approaches that incorporate strong priors (our mechanism knowledge)
- How fitness/health apps handle early recommendations before sufficient data
- Cold-start problem solutions that leverage domain expertise
- Confidence calibration — when to surface recommendations vs stay silent

**Success criteria:** A pattern recommendation with confidence threshold logic.

---

## Brief 3: Outcome Attribution in Multi-Variable Routines

**Question:** When a wash day uses 5-8 products in sequence, how do you attribute outcomes (shine, definition, frizz) to individual products or combinations?

**Why it matters:** The passive intelligence layer needs to explain "why did today work?" — but with 5+ variables changing between wash days, simple correlation is noisy.

**Research angles:**
- Factorial experiment design adapted for personal tracking
- Causal inference methods for observational data with few observations
- How skincare tracking apps (Skin+Me, Curology) handle multi-product attribution
- Whether "hold one variable constant, vary another" guidance is practical for real users
- Interaction effects: when it's the combination, not individual products

**Success criteria:** A practical attribution approach that works with realistic user behavior (not requiring controlled experiments).

---

## Notes

- These briefs are independent — run in any order
- Brief 1 is lowest priority (Phase 5 is last to implement)
- Brief 2 and 3 inform the passive/active intelligence layers but don't block the data model or logging UI work
