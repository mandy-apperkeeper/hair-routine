# Hair Routine — Session Log

Each session entry ends with a state snapshot. Start new sessions by reading the last entry's snapshot.

---

## Session 9: Product Inventory (May 10, 2026) — complete

### Work Done
- Schema v3 migration seeds 24 products from consultation
- InventoryManager module with full CRUD
- Inventory view grouped by tier and routine context
- Gel gap now checks inventory + "Add to inventory" button

### State at End of Session 9

**What's live:** Quick-log, walkthrough, history, status bar, dew point detection, recommendations, compensation card, product inventory.

**What's next:** Logging UX overhaul (landing page feels "choice rather than guide," quick-log needs product selection, clarifying should be wash subtype).

---

## Session 10: Logging UX Overhaul (May 10, 2026) — partially complete

### Work Done
- Landing page redesigned: single recommended action, "Something else?" toggle for alternatives
- Quick-log rebuilt with multi-select activities + inline product selection per activity
- "Log a wash day" button added to History page
- Clarify auto-detected from product selection

### Problem Identified
The product categorization in the quick-log is wrong. Products are mis-assigned to activities because the mapping was guessed instead of properly derived from the Abbey Yung method steps. The ACTIVITY_PRODUCTS mapping needs a complete redo.

Why it's wrong:
1. The Abbey Yung method has 8-11 steps — the logging should reflect that
2. Products can belong to multiple steps (OGX oils = pre-wash oil OR finishing)
3. The Glossing Lamination Mask is NOT a clarifying shampoo — it's its own "glossing" step
4. Heat protection and leave-in are separate steps
5. The goal is gathering data for correlations, not minimizing taps

### Draft: Research-Backed 11-Step Mapping (needs Mandy's confirmation)

1. **Pre-wash oil** — OGX Coconut Oil, OGX Argan Oil
2. **Pre-shampoo treatment** — Olaplex 3, Garnier Hair Filler Pre-Shampoo, OGX Bond Protein Pre-Shampoo, L'Oreal Bond Repair Pre-Shampoo
3. **Shampoo** — EverPure Bond Repair, Dove Bond Strength, Dove Intensive Repair
4. **Clarify** — EverPure Clarifying Shampoo only
5. **Conditioner** — Garnier Color Repair, EverPure Bond Repair Cond, Dove Bond Strength Cond, Dove Intensive Repair Cond
6. **Glossing/Rinse** — Wonder Water, Glossing Lamination Mask, Elvive 5-Minute Gloss Mask
7. **Deep condition** — Dove Bond Strength Mask
8. **Leave-in** — L'Oreal 21-in-1 Spray, Pantene Bond Spray
9. **Heat protection** — Marc Anthony Grow Long Shield
10. **Styling** — NYM Curl Talk Gel, Got2b Gel
11. **Finishing** — Garnier Filler Serum, Dove 10-in-1 Serum, OGX Coconut Oil, OGX Argan Oil

**Multi-category products:** OGX oils (Pre-wash + Finishing), Garnier Filler Serum (Leave-in + Finishing), Dove 10-in-1 Serum (Leave-in + Finishing)

### Open Design Question
How to present 11 steps without being tedious:
- Show all 11 but pre-select the "usual" ones based on last wash (tap to deselect what you skipped)
- Collapse into phases (Pre-wash | Wash | Post-wash | Style) with products under each
- Progressive: show the steps you typically do, "Add step" for unusual ones

### State at End of Session 10

**What's live (GitHub Pages):** https://mandy-apperkeeper.github.io/hair-routine/
- Landing: single recommended action + "Something else?" toggle
- Quick-log: multi-select activities with inline products (CATEGORIZATION IS WRONG)
- Product inventory: 24 products, tier management, CRUD
- Compensation card + gel gap with inventory integration

**What's broken:**
- ACTIVITY_PRODUCTS mapping is incorrect — products in wrong categories
- Need to implement the 11-step Abbey Yung mapping properly
- Need to decide on UX pattern for presenting many steps without tedium

**Decisions made this session:**
- Product inventory stored as full list in localStorage (not sparse overlay)
- Landing page guides with single recommendation, alternatives hidden behind toggle
- Quick-log uses multi-select activities with inline product selection
- Clarify auto-detected from product selection (no separate toggle)
- Products CAN appear in multiple activity categories
- Abbey Yung 11-step method is the reference model for logging (not a simplified 4-category version)
- The goal of logging is data gathering for correlations, not minimal taps

**All active decisions (cumulative):**
- Use amodimethicone conditioner EVERY wash. Dove is "using-up" only — never recommend it.
- OGX oils provide no lasting benefit (volatile silicones). Deprioritize.
- No product rotation needed for any category.
- "Using-up" protocol: track bottles being finished, explain compensation, remove when empty.
- Treatments are separate from products in the data model.
- Dew point is the weather metric (not relative humidity). Auto-detect, don't ask.
- Schema version 3: WashEvent includes treatments, dewPoint. State includes inventory.
- Mandy owns NYM Curl Talk gel (confirmed May 10, 2026).
- Inventory tiers: Primary Rotation, Supporting Cast, Use-Up Queue.

**Repo:** main branch, origin/main in sync.

**What's next:**
1. Session 11: Fix quick-log product mapping — implement corrected step mapping, decide UX pattern, get Mandy's confirmation
2. Session 12: Service worker + PWA — offline support for bathroom use
3. Session 13: v1-v2 convergence — audit and merge
