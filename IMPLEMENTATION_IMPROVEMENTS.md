# Implementation Improvements — Hair Routine App

**Date:** May 9, 2026  
**Source:** Insights from Hair Science Verification Report + research deep dive  
**Status:** Ready to implement. All items fit within existing spec architecture.

---

## Priority Order

Items ordered by value-to-effort ratio. Highest value, least effort first.

---

## 1. Auto Dew Point Tracking (Silent)

**What:** Log dew point from Open-Meteo with every wash event automatically, without requiring manual humidity selection.

**Why:** Dew point is more stable than relative humidity (doesn't fluctuate hour-to-hour) and is what the curly hair community actually uses to predict glycerin behavior. Threshold: dew point above 60°F (15°C) = glycerin risk.

**Implementation:**
- On walkthrough start, fetch current dew point from Open-Meteo (already planned for humidity feature)
- Store `dewPoint` (number, °F) in the WashEvent alongside the existing `humidity` field
- Map dew point to the three-category selector automatically:
  - Below 35°F → "dry"
  - 35-60°F → "moderate"  
  - Above 60°F → "humid"
- Manual selector becomes the **fallback** (shown only when offline or API fails)
- After 15+ events with dew point data, the feedback engine can correlate ratings to actual weather — no user input needed

**Touches:** Weather fetch component, WashEvent interface, Feedback Engine humidity correlation

**Effort:** Low — extends already-planned humidity API work

---

## 2. Science Confidence Badges (Two Tiers)

**What:** Distinguish "peer-reviewed mechanism" from "practitioner best practice" in the Learn section and on walkthrough science badges.

**Why:** The verification report showed a clear split between hard science (amodimethicone binding, 140°C threshold, 18-MEA non-regeneration) and community consensus (glycerin cutoff at 70% RH, 7-day protein interval, polysilicone-29 wash durability). Being transparent about this builds trust.

**Implementation:**
- Two badge styles:
  - `VERIFIED` (green) — peer-reviewed mechanism with cited source
  - `BEST PRACTICE` (gold) — practitioner-validated, mechanism sound, threshold approximate
- Apply to:
  - Verified: amodimethicone selective binding, PQ-69 humidity barrier, 140°C heat threshold, 18-MEA replacement, Olaplex disulfide repair, protein plateau concept, lamellar conditioning
  - Best Practice: glycerin >70% RH swap, 7-day protein minimum, polysilicone-29 multi-day durability, wash frequency recommendations
- In Learn section, each science card gets a one-line source citation beneath the badge

**Touches:** Learn section UI, walkthrough step badges, CSS (two badge variants)

**Effort:** Low — styling + content labeling only

---

## 3. "Why Did That Work?" Retrospective

**What:** After a 5-star rating, show a one-screen breakdown of what made that wash different.

**Why:** The most valuable insight the app can produce is "what correlates with your best days." Making this visible immediately after a great rating reinforces the pattern while it's fresh.

**Implementation:**
- Trigger: user rates 4 or 5 on the emoji scale
- Show a card (dismissable) with:
  - Interval since last wash (e.g., "4 days")
  - Weather/dew point (e.g., "Moderate — 52°F dew point")
  - Lane (e.g., "Curly")
  - Key products used
  - Any overrides dismissed
- Compare to average: "Your average rating is 3.2 — this was above average"
- After 10+ high-rated events, surface the pattern: "Your 4-5 star days share: [common factors]"
- One tap to dismiss, never blocks the flow

**Touches:** Completion screen (post-walkthrough), Feedback Engine (pattern extraction), UI card component

**Effort:** Medium — needs pattern comparison logic

---

## 4. Glossing Lamination Mask Warning Tag

**What:** Add a prominent "⚠️ NOT a conditioner — this is a clarifying treatment" tag to the L'Oréal EverPure Glossing 5-Min Lamination Mask in the product inventory.

**Why:** The name is actively misleading. "Mask" implies conditioning. It contains surfactants + glycolic acid and functions as an exfoliating reset. Misuse (treating it as a deep conditioner) would strip protective layers.

**Implementation:**
- In the Products/Learn section, add a warning-styled card for this product
- If it appears in any walkthrough step, include inline note: "This is a clarifying treatment (surfactants + AHA), not a conditioning mask. Use as occasional reset only."
- Consider a "commonly confused" subsection in Learn

**Touches:** Products section content, potentially weekly treatment walkthrough

**Effort:** Very low — content addition only

---

## 5. Protein + Frizz Protection Insight (Learn Section)

**What:** Add a note explaining that the Garnier Hair Filler pre-shampoo (hydrolyzed keratin) provides frizz protection in addition to bond repair.

**Why:** Croda's 2025 research reveals that low molecular weight proteins stabilize hydrogen bonds inside the cortex AND form a subtle surface barrier against humidity. This means the pre-shampoo step is doing more than users realize — it's not just "repair," it's also "protect."

**Implementation:**
- In the Learn section under protein/bond repair:
  - "Your pre-shampoo treatment does double duty: the hydrolyzed keratin repairs internal bonds AND creates a subtle barrier that helps resist humidity-induced frizz. This is why consistent use matters — the protection builds over multiple applications before plateauing."
- On the pre-shampoo walkthrough step, add a secondary badge: `FRIZZ PROTECTION` alongside existing `BOND REPAIR`
- Source: Croda Beauty, "Protein myths, debunked" (2025)

**Touches:** Learn section content, walkthrough step 1 (curly lane) badge

**Effort:** Very low — content + one badge

---

## 6. 18-MEA Maintenance Framing (Feedback Engine Insight)

**What:** After extended consistent use of amodimethicone conditioner (30+ events), if ratings plateau, surface an insight explaining this is maintenance, not diminishing returns.

**Why:** 18-MEA degrades >10% per year naturally (Thibaut et al. 2010). Amodimethicone replaces it. Once the damaged areas are filled, continued use maintains the replacement layer against ongoing degradation. Users might interpret a rating plateau as "the product stopped working" — the app should reframe this.

**Implementation:**
- New insight type in Feedback Engine: `maintenance_plateau`
- Trigger conditions:
  - 30+ rated events
  - Amodimethicone conditioner used in 80%+ of events
  - Average rating stable (±0.3) for last 15 events
  - No downward trend
- Insight message: "Your ratings have been steady — that's the goal. Your conditioner is replacing the 18-MEA lipid layer that naturally degrades over time. Consistent results = the system is working."
- Only surfaces once (or once per quarter)

**Touches:** Feedback Engine (new insight type + trigger logic)

**Effort:** Medium — new analysis pattern, but follows existing insight architecture

---

## 7. Corrections from Verification Report

**What:** Three factual corrections to apply across all content.

| Current | Corrected | Where |
|---------|-----------|-------|
| "10-12 cuticle layers" | "8-10 cuticle layers" | Learn section, any hair profile reference |
| "lasts 3+ washes" / "persists 3+ washes" | "provides up to 72 hours of humidity resistance (manufacturer tested)" | Blowout lane, Learn section |
| 7-day protein minimum presented as science floor | Keep 7 days as default, but note: "Conservative estimate — the plateau concept is verified but the specific interval is a best practice, not a hard science floor" | Settings threshold display, Learn section |

**Touches:** Content across Learn section, blowout walkthrough, settings

**Effort:** Very low — text edits only

---

## Summary Table

| # | Improvement | Effort | Value | Category |
|---|-------------|--------|-------|----------|
| 1 | Auto dew point tracking | Low | High | Data accuracy |
| 2 | Two-tier science badges | Low | High | Trust/transparency |
| 3 | "Why did that work?" card | Medium | High | Insight delivery |
| 4 | Glossing Mask warning | Very low | Medium | Safety/accuracy |
| 5 | Protein frizz protection note | Very low | Medium | Education |
| 6 | 18-MEA maintenance insight | Medium | Medium | Long-term engagement |
| 7 | Factual corrections | Very low | High | Accuracy |

---

## Dependencies

- Items 1, 3, and 6 depend on the Feedback Engine being built (spec tasks)
- Items 2, 4, 5, and 7 can be implemented in v2's first pass (content + styling)
- Item 1 extends the already-planned Open-Meteo integration

---

## Design Notes (for visual work)

- **Badge styling:** Two variants needed — `VERIFIED` (solid green, high confidence feel) and `BEST PRACTICE` (gold outline or softer treatment, "trusted but approximate" feel)
- **"Why did that work?" card:** Should feel celebratory but calm — not gamified. Think "quiet observation" not "achievement unlocked." Warm background, simple list, one-tap dismiss.
- **Warning tags:** Use existing `.warning` styling (red-left-border cards) for the Glossing Mask and similar "this isn't what you think" callouts


---

## 8–15. Information Architecture Improvements

**Source:** `research/organizing-information-in-app-design.md` (32-source research report, scored 94-100%)  
**Date added:** May 9, 2026  
**Category:** Structural/organizational — how content is arranged, grouped, and revealed  
**Status:** Ready to implement. Items 8-10 are highest leverage and can be done in a single session.

---

### 8. Reduce Primary Tabs from 7 to 5

**Framework:** Dan Brown's Principle #7 (Focused Navigation) + Mobile tab bar research (3-5 items optimal, 72% prefer bottom nav for accessibility)

**Problem:** The current 7-tab bar mixes two content types in one navigation scheme:
- Procedural (Today, Curly, Blowout, Refresh, Weekly) — "what do I do?"
- Reference (Products, Science) — "help me understand"

On narrow screens, 7 tabs wrap to a second line, breaking spatial stability. The user loses their "you are here" signal.

**Implementation:**
- Keep 5 primary tabs: **Today | Curly | Blowout | Refresh | Weekly**
- Move Products and Science to secondary access:
  - Option A: A small book/reference icon in the header that opens a bottom sheet with both sections
  - Option B: Links at the bottom of the Today panel ("View products →" / "How this works →")
  - Option C: A "Reference" tab replacing both (still 6 tabs, but grouped by type)
- Strongest option per research: **5 tabs + contextual links from procedural steps to relevant reference content** (see item 10 below)

**Research backing:**
- "Tab bar (bottom) — best for 3-5 primary destinations of equal importance" (UXPin 2026, moldstud.com Jul 2025)
- "Don't mix apples and oranges in your navigation scheme" (Dan Brown, Principle of Focused Navigation)
- "For complex apps with more than 5 top-level sections: use a tab bar for the 4-5 most-used sections and a 'More' tab or hamburger for the rest" (inferred from UXPin + onething.design + moldstud.com)

**Touches:** Tab bar HTML, panel visibility logic, potentially header UI

**Effort:** Small

**Value:** High — immediate mobile usability improvement, eliminates tab wrapping

---

### 9. Chunk Routines into Phase Cards

**Framework:** Working memory ~4±1 chunks (Cowan 2001) + NN/g Mini-IA (chunked > one long page) + Gestalt common region and proximity

**Problem:** Curly Day has 9 steps in a single card. Blowout has 9 steps in a single card. A user mid-shower with wet hands can't quickly find "where am I?" after scrolling. The 9-step list exceeds working memory capacity for orientation.

**Implementation:**
- Split each routine into 3-4 phase cards with named headers:

**Curly Day:**
```
[Card: Prep & Wash]     Steps 1-4: Pre-shampoo, shampoo, condition, rinse
[Timer: Conditioner]
[Card: Style]           Steps 5-7: Leave-in, gel, hairline
[Card: Dry & Finish]    Steps 8-9: Diffuse/air dry, scrunch out crunch
```

**Blowout Day:**
```
[Card: Prep & Wash]     Steps 1-3: Shampoo, condition, towel dry
[Timer: Conditioner]
[Card: Protect]         Steps 4-5: Leave-in, Marc Anthony spray
[Card: Style]           Steps 6-8: Rough dry, face-framing, section styling
[Card: Finish]          Step 9: Serum/oil
```

- Each phase card gets a subtle phase label (e.g., "STYLE" in small caps above the card)
- Optional: mini progress indicator at top of panel showing phase names, current phase highlighted
- No gates between phases — user scrolls freely. This is visual chunking, not a wizard.

**Research backing:**
- "Human working memory holds approximately 4±1 chunks of information simultaneously" (Cowan 2001)
- "Chunked mini-IA — split into logical units with direct navigation to each; best when structured by a usage-relevant principle" (NN/g 2018)
- "Items within a shared boundary (card, box) are perceived as a group" (Gestalt common region, clay.global Feb 2025)
- "Proximity is the strongest grouping principle" (NN/g Jan 2024)
- Wizards are NOT appropriate here because "steps are arbitrary divisions of what could be one screen" — the user needs to see ahead. Visual chunking without gates is the right pattern.

**Touches:** Curly panel HTML structure, Blowout panel HTML structure, minor CSS for phase labels

**Effort:** Small (restructure existing HTML into multiple cards with headers)

**Value:** High — significant mid-task usability gain, especially with wet hands

---

### 10. Contextual Cross-Links Between Procedural and Reference Content

**Framework:** Dan Brown's Principle #5 (Front Doors) + Principle #6 (Multiple Classification) + Information Scent theory (Pirolli & Card)

**Problem:** Products and Science content is only reachable via their dedicated tabs. A user on the Curly Day panel who sees "PQ-69 HUMIDITY BARRIER" badge can't tap it to learn what PQ-69 is. The reference content has only one entry point — its tab.

**Implementation:**
- Make science badges on walkthrough steps tappable → navigates to the relevant science card
- Examples:
  - `CERAMIDE + AMODIMETHICONE` badge on conditioner step → scrolls to Amodimethicone + Ceramide R science cards
  - `PQ-69 HUMIDITY BARRIER` badge on gel step → scrolls to PQ-69 science card
  - `POLYSILICONE-29 HEAT SEAL` badge on Marc Anthony step → scrolls to Polysilicone-29 science card
- Product names in walkthrough steps could also link to their Products panel entry
- In the Science panel, add "Used in: Curly Day step 6, Blowout Day step 5" back-links

**Research backing:**
- "Assume at least half of the website's visitors will come through some page other than the home page" (Dan Brown, Front Doors) — applied here: assume users arrive at science from a specific question mid-routine, not from browsing
- "Offer users several different classification schemes to browse the site's content" (Dan Brown, Multiple Classification) — same product/science content reachable from multiple paths
- "Users follow 'information scent' — cues from link labels, surrounding context, and prior knowledge — to estimate whether a path will lead to their goal" (NN/g Jan 2024) — the badge IS the scent; making it tappable completes the foraging path

**Touches:** Badge elements (add click handlers + navigation), Science panel (add back-links), Products panel (add anchors)

**Effort:** Small (event handlers + scroll-to-element logic)

**Value:** Medium-High — connects "what to do" with "why" at the moment of curiosity

---

### 11. Conditional Progressive Disclosure on Today Panel

**Framework:** Progressive disclosure (contextual variant, LogRocket Mar 2025) + CLT extraneous load reduction + Dan Brown's Principle #3 (Disclosure)

**Problem:** Today panel shows 4 interaction zones simultaneously (tracker, decision card, humidity check, frizz diagnostic). The user's primary question is "what should I do?" — the humidity and frizz sections are secondary/conditional. Showing everything at once creates extraneous cognitive load.

**Implementation:**
- **Always visible:** Status tracker + "What's today?" decision card
- **Humidity check:** Appears after user selects a wash day option (curly or blowout). Rationale: humidity only matters when you're about to style. On refresh days, it's irrelevant.
- **Frizz diagnostic:** Appears when user selects "Refresh day" OR when returning to Today on a non-wash day. Rationale: "why am I frizzy?" is a day-2/3 question.
- **Lane-switching warning (adaptive, future):** Surfaces inline when tracker data indicates a conflict (last wash was curly → user taps blowout → warning appears before navigation)

**Research backing:**
- "Contextual [progressive disclosure] — shows relevant details based on current context" (LogRocket Mar 2025)
- "Show only enough information to help people understand what kinds of information they'll find as they dig deeper" (Dan Brown, Disclosure)
- "Every element on screen that isn't directly serving the user's current task is consuming limited processing capacity" (CLT design implication, Cowan/Sweller)
- "Information presented to a person who is not interested or ready to process it is effectively noise" (Universal Principles of Design, cited in revelry.co)

**Touches:** Today panel HTML/JS (conditional show/hide based on selection state), localStorage for "last wash type" context

**Effort:** Medium (conditional logic + state management)

**Value:** High — transforms Today from static dashboard to contextual guide

---

### 12. First-Use Empty State

**Framework:** Empty states as organizational teaching moments (Carbon Design System, setproduct.com Jun 2025)

**Problem:** New user sees "—" for all tracker values. No guidance on what the app does, how it works, or what it will become over time. Missed opportunity to build a mental model of the adaptive system.

**Implementation:**
- When ALL tracker values are null/empty, replace the Status box with:

```html
<div class="tracker-box">
  <h3>Welcome</h3>
  <p class="product-note">
    This app tracks your wash days, treatments, and products 
    to help you make better decisions over time.
  </p>
  <p class="product-note" style="margin-top: 0.5rem;">
    Start by choosing what today is below. After a few washes, you'll see:
  </p>
  <ul style="...">
    <li>When treatments are due</li>
    <li>Which products to use based on humidity</li>
    <li>Warnings when product lanes conflict</li>
  </ul>
</div>
```

- Once ANY tracker value is set, switch to normal Status display permanently
- For Products panel collapsed sections, show exemplars in the toggle header: "Supporting Cast — Wonder Water, Dove serum, +4 more" (Dan Brown's Principle #4, Exemplars)

**Research backing:**
- "Empty states are critical organizational moments — they appear at first use... Well-designed empty states guide users toward their first action and communicate the structure of what will eventually appear" (Carbon Design System)
- "Empty states are an underused tool for teaching information architecture — they can show users the shape of the system before it has content" (inferred from Carbon + setproduct.com)
- "Describe the contents of categories by showing examples of their contents" (Dan Brown, Exemplars) — for the collapsed section headers

**Touches:** Today panel (conditional rendering), Products panel toggle headers (text content)

**Effort:** Small

**Value:** Medium — first impression, mental model formation, sets expectations for adaptive features

---

### 13. Sub-Group Products by Routine Context

**Framework:** LATCH (Category as secondary scheme within Hierarchy) + Dan Brown's Principle #6 (Multiple Classification)

**Problem:** Within "Primary Rotation" (7 items), there's no sub-grouping. Items serve different routines (curly-only, blowout-only, universal) but are presented as a flat list. A user looking for "what gel do I use?" scans all 7.

**Implementation:**
- Add subtle category dividers within existing collapsible tiers:

```
Primary Rotation
  EVERY WASH
    • Garnier Color Repair Conditioner
    • L'Oréal EverPure Bond Repair Shampoo
    • L'Oréal 21-in-1 Leave-In Spray

  CURLY DAYS
    • NYM Curl Talk Flash Freeze Gel

  BLOWOUT DAYS
    • Marc Anthony Grow Long Anti-Frizz Shield

  WEEKLY
    • L'Oréal EverPure Clarifying Shampoo
    • Olaplex 3
```

- Implementation: small uppercase labels (same style as `.subtitle`) between product groups within each tier
- No new hierarchy level — just Gestalt proximity (extra whitespace) + a label

**Research backing:**
- LATCH: Category is the most usage-relevant secondary scheme here (not alphabetical, not time-based)
- "Offer users several different classification schemes to browse the site's content" (Dan Brown, Multiple Classification) — products accessible by tier AND by routine context
- "Proximity is the strongest grouping principle and can overpower competing cues" (NN/g Jan 2024) — whitespace between groups creates perceived structure without adding depth

**Touches:** Products panel HTML (add group labels + spacing)

**Effort:** Small (content restructuring only)

**Value:** Low-Medium — faster product lookup, clearer mental model of "what goes with what"

---

### 14. Group Science Cards by User Question

**Framework:** Information Scent + Mini-IA (chunked by usage-relevant principle) + NN/g's criticism of flat unstructured lists

**Problem:** Science panel is 9 cards in a flat list with no grouping. A user wanting to understand "why does my gel stop working in humidity?" must scan all 9 to find the 3 relevant cards (PQ-69, Glycerin & Humidity, Dual-Lane Conflict).

**Implementation:**
- Group science cards under question-based headers:

```
HOW YOUR ROUTINE WORKS
  • Amodimethicone (targeted cuticle repair)
  • Ceramide R (18-MEA replacement)
  • PQ-69 (humidity barrier film)
  • Polysilicone-29 (heat-activated seal)

WHAT CAN GO WRONG
  • Heat Damage Threshold
  • Glycerin & Humidity
  • The Dual-Lane Conflict
  • Protein Overload Is Mostly a Myth

WHAT'S HAPPENING TO YOUR HAIR
  • TE Recovery
  • "Moisture" Is Marketing
```

- Headers use `.section-title` styling (gold, serif, editorial feel)
- Cards remain expandable/collapsible within groups if desired
- Alternative: make the groups themselves collapsible (show headers, expand to reveal cards)

**Research backing:**
- "The chunking scheme must match users' mental models and tasks, not internal organization" (NN/g Mini-IA 2018) — grouping by user question matches the mental model better than flat alphabetical or by-ingredient
- "Every navigation label, section header, and link must emit strong scent — users should be able to predict what they'll find before they tap" (NN/g Information Foraging Jan 2024) — "What Can Go Wrong" is stronger scent than scanning 9 card titles
- "Very flat structures with 30+ items at one level overwhelm users" (NN/g Aug 2024) — 9 items isn't 30, but grouping still aids scanning

**Touches:** Science panel HTML (reorder cards, add section headers)

**Effort:** Small (content reordering + 3 headers)

**Value:** Low-Medium — better reference navigation, faster answers to specific questions

---

### 15. Plan Expandable Containers for Adaptive Content (Growth)

**Framework:** Dan Brown's Principle #8 (Growth) — "assume the content you have today is a small fraction of the content you will have tomorrow"

**Problem:** The Today panel's tracker is 4 fixed rows. The spec describes an adaptive feedback engine that will generate recommendations, insights, and pattern analysis. Where does this new content go? Without planning the containers now, adding adaptive features later requires a redesign.

**Implementation:**
- Structure the Today panel into three semantic zones (even if some start empty/hidden):

```
[STATUS — what happened]
  Last wash: 3 days ago
  Last clarify: 5 days ago
  Last protein: 12 days ago
  Last deep condition: 18 days ago

[SUGGESTIONS — what to do] (hidden until adaptive engine has data)
  "Protein treatment is due — it's been 14 days"
  "Humidity is high today (68°F dew point) — consider Got2b gel"

[INSIGHTS — what you've learned] (hidden until 15+ events)
  "Your best days: curly lane + moderate humidity + 3-4 day interval"
  "Blowouts last longer when you clarify first"
```

- Suggestions zone appears after first adaptive trigger fires
- Insights zone appears after pattern detection has enough data (15+ rated events)
- Both use existing card/tip styling — no new visual language needed
- The zones are semantic `<section>` elements with IDs, hidden by default, shown by JS when content exists

**Research backing:**
- "Assume the content you have today is a small fraction of the content you will have tomorrow" (Dan Brown, Growth)
- "Good information organization minimizes extraneous load while supporting germane load (helping users build accurate mental models of the system)" (CLT applied to UI) — the three-zone model builds a mental model of "the app observes, suggests, and teaches"
- Empty/hidden containers don't add cognitive load — they're invisible until populated

**Touches:** Today panel HTML (add section containers), JS (conditional visibility), Feedback Engine integration points

**Effort:** Small now (just the containers), Medium later (populating them with adaptive content)

**Value:** Low now, High later — prevents structural redesign when adaptive features ship

---

## Updated Summary Table (All Items)

| # | Improvement | Effort | Value | Category | Can Ship in v2 First Pass? |
|---|-------------|--------|-------|----------|---------------------------|
| 1 | Auto dew point tracking | Low | High | Data accuracy | Needs weather API |
| 2 | Two-tier science badges | Low | High | Trust/transparency | Yes |
| 3 | "Why did that work?" card | Medium | High | Insight delivery | Needs feedback engine |
| 4 | Glossing Mask warning | Very low | Medium | Safety/accuracy | Yes |
| 5 | Protein frizz protection note | Very low | Medium | Education | Yes |
| 6 | 18-MEA maintenance insight | Medium | Medium | Long-term engagement | Needs feedback engine |
| 7 | Factual corrections | Very low | High | Accuracy | Yes |
| 8 | Reduce tabs from 7 to 5 | Small | High | IA/navigation | Yes |
| 9 | Chunk routines into phase cards | Small | High | IA/cognitive load | Yes |
| 10 | Cross-links between steps and science | Small | Medium-High | IA/information scent | Yes |
| 11 | Conditional disclosure on Today | Medium | High | IA/progressive disclosure | Partially (full version needs tracker data) |
| 12 | First-use empty state | Small | Medium | IA/onboarding | Yes |
| 13 | Sub-group products by routine | Small | Low-Medium | IA/categorization | Yes |
| 14 | Group science cards by question | Small | Low-Medium | IA/mini-IA | Yes |
| 15 | Expandable containers for growth | Small | Low now / High later | IA/growth planning | Yes (containers only) |

---

## Implementation Order (Recommended)

**Batch 1 — Immediate (content + structure, no new logic):**
Items 7, 2, 4, 5, 8, 9, 13, 14 — all are content edits or HTML restructuring. Can be done in one session.

**Batch 2 — Quick logic (small JS additions):**
Items 10, 12, 15 — add click handlers, conditional rendering, empty containers.

**Batch 3 — Contextual intelligence (needs state management):**
Item 11 — conditional Today panel based on selection + tracker state.

**Batch 4 — Adaptive engine dependent:**
Items 1, 3, 6 — require the feedback engine from the spec to be built first.

---

## Plan Critique (Self-Assessment)

**Date:** May 9, 2026  
**Source:** Cross-referencing this plan against the formal spec (`adaptive-hair-routine/requirements.md` + `design.md`), the Apper Keeper design philosophy, and the IA research.

### The Core Ambiguity: v1 Iteration vs v2 Build

This plan doesn't state whether it targets the **current v1 app** (scrollable panels, tab bar) or the **spec's v2 redesign** (step-by-step walkthrough, landing screen, no tabs). This matters because:

- **Items 8, 9, 11, 15** are improvements to v1's scrollable/tabbed architecture. The spec's v2 eliminates tabs entirely (landing screen + walkthrough + Learn section via quick links) and presents one step at a time (eliminating the "9-step scroll" problem). If v2 is built next, these items are throwaway work.
- **Items 7, 2, 4, 5, 10, 12, 14** survive into v2 — they're content/structure improvements that work regardless of interaction model.
- **Items 1, 3, 6** are v2-only (depend on the feedback engine).

**Resolution:** Items 8, 9, 11, 13, 15 should be marked **"v1 interim only — skip if building v2 from spec."** The spec already solves these problems through its architectural redesign (one-step-at-a-time walkthrough, landing screen with conditional insight cards, Learn section as separate view).

### Conflicts with the Spec

| Item | Conflict | Resolution |
|------|----------|------------|
| 8 (reduce tabs) | Spec eliminates tabs entirely — landing screen has 3 action buttons + quick links | v1 interim only |
| 9 (phase chunking) | Spec uses one-step-at-a-time walkthrough — no scrolling through steps | v1 interim only |
| 11 (conditional Today) | Spec's landing screen already implements this by architecture — humidity prompt appears inside walkthrough, frizz diagnostic lives in Learn | v1 interim only; the *principle* (contextual disclosure) carries forward but the implementation is different |
| 15 (expandable containers) | Spec's landing screen already has: status bar + insight card (appears after 10+ events) | v1 interim only; the *zones* concept maps to spec's existing components |

### Over-Engineering Flags

| Item | Concern |
|------|---------|
| 2 (two-tier badges) | A single user in the shower doesn't need to distinguish "peer-reviewed" from "practitioner consensus." Simplify: just add source citations to science cards. The verification report is where this distinction lives — the app should just be correct. |
| 6 (18-MEA maintenance insight) | Requires 30+ events (~100 days of use) to trigger. By then the user either trusts the routine or has moved on. Low probability of firing at a moment that changes behavior. Keep in plan but deprioritize. |
| 13 (sub-group products) | Solves a problem that barely exists for a single user who knows her products. The Products panel is an occasional reference, not a daily surface. Effort is small but so is value. Optional. |

### Missing from This Plan

1. **The walkthrough redesign itself** — the single biggest UX improvement (one step at a time vs. scrollable list) isn't in this doc because it's in the spec. But this doc should acknowledge that the spec's walkthrough solves items 8, 9, and 11 more completely than the interim fixes proposed here.

2. **Service worker** — the app is used in the bathroom. No service worker = no offline. This is arguably higher priority than any IA improvement. Not in this doc because it's a spec task, but the dependency should be noted.

3. **Rating system** — items 1, 3, and 6 depend on ratings existing. The plan assumes ratings will be built as part of spec tasks but doesn't call out this hard dependency.

4. **"Weekly" tab label** — weak information scent. The content is specifically treatments, not a weekly schedule. Renaming to "Treatments" gives stronger scent. (Trivial fix, omitted from original plan.)

### Revised Priority Assessment

**Items that matter regardless of v1/v2 path (do these):**

| Priority | Item | Rationale |
|----------|------|-----------|
| 1 | 7 (factual corrections) | Accuracy. Do first. Trivial effort. |
| 2 | 4 (Glossing Mask warning) | Safety. Trivial effort. |
| 3 | 5 (protein frizz note) | Education. Trivial effort. |
| 4 | 14 (group science by question) | Better reference nav. Works in both versions. Small effort. |
| 5 | 10 (cross-links) | Connects "what" to "why." Works in both versions. Small effort. |
| 6 | 12 (empty state) | Good first impression. Works in both versions. Small effort. |
| 7 | 1 (auto dew point) | Removes manual friction. Works in both versions. Needs weather API. |
| 8 | 3 ("Why did that work?") | Core adaptive value. Needs feedback engine. |

**Items that are v1-interim only (skip if building v2):**

| Item | What the spec does instead |
|------|---------------------------|
| 8 (reduce tabs) | Spec eliminates tabs → landing screen + walkthrough |
| 9 (phase chunking) | Spec shows one step at a time |
| 11 (conditional Today) | Spec's landing screen is already minimal; humidity prompt is inside walkthrough |
| 13 (sub-group products) | Low value for single user regardless |
| 15 (expandable containers) | Spec's insight card component already handles this |

**Items to simplify:**

| Item | Simplification |
|------|---------------|
| 2 (two-tier badges) | Drop the two-tier system. Just add one-line source citations to science cards. The app should be correct, not meta-correct. |
| 6 (18-MEA insight) | Keep in plan but move to "nice to have after 3+ months of use data." Don't build until the feedback engine is proven. |

### Additional Improvements (from critique)

**16. Rename "Weekly" tab to "Treatments"**

Applies to v1 only (v2 has no tabs). The current label "Weekly" has weak information scent — could mean schedule, habits, or treatments. The content is specifically treatments (clarify, protein, deep condition, gloss). "Treatments" is more predictive.

**Effort:** 1 line of HTML. **Value:** Small but free.

**17. Convivial disclosure: "Show all" affordance on conditional sections**

If item 11 is implemented (conditional disclosure on Today panel), add a subtle "Show all sections" link that reveals humidity + frizz diagnostic regardless of context. The Apper Keeper principle "Convivial Over Controlling" requires that the app never withholds information — it can *deprioritize* but not *hide*. The research's wizard anti-pattern ("over-wizarding") applies: conditional disclosure should reduce noise, not gate access.

**Effort:** One link + toggle. **Value:** Prevents the app from feeling like it's withholding.

**18. Persistent phase indicator for wet-hand orientation (v1 only)**

If item 9 is implemented (phase chunking), add a sticky mini-indicator at the top of the panel showing phase names with the current phase highlighted. The Apper Keeper constraint "eyes alternate — information must be scannable in 1-2 seconds" means the user glancing back at the phone needs instant orientation without scrolling. Phase cards alone aren't enough if the user has scrolled mid-phase.

**Effort:** Small (sticky element + scroll observer). **Value:** Medium — solves the "where am I?" problem for the physical context.

---

## Design Alignment

All IA improvements maintain the Apper Keeper principles:
- **Calm Over Captive:** Conditional disclosure reduces noise, doesn't add pressure
- **Book-Feel Over App-Feel:** Phase headers use editorial typography (serif, gold), not app-style progress bars
- **Convivial Over Controlling:** Cross-links are optional exploration paths, not forced navigation
- **Progressive Mastery:** Empty states teach the system's shape; expandable containers reveal depth over time
- **Offline-First:** All structural changes are static HTML/CSS — no network dependency
- **Accessibility:** Phase cards maintain semantic heading hierarchy; cross-links use proper `<a>` or `<button>` elements with descriptive text


---

## Research Scorecard — Implementation Improvements (QC Evaluation)

**Date:** 2026-05-09  
**Document scored:** `IMPLEMENTATION_IMPROVEMENTS.md`  
**Scoring Level:** Full (15 recommendations, 15+ sources via parent research reports)  
**Evaluator:** Independent QC session

### Document Type Note

This is a synthesis/recommendations document drawing on two scored parent research reports:
- `HAIR_SCIENCE_VERIFICATION_REPORT.md` (scored 94.65%)
- `research/organizing-information-in-app-design.md` (scored 94-100%)

Claims are evaluated against both parent reports and independent verification.

### Mechanical Selection Applied

**Source Fidelity (positions 1, 3, 5, 7, 9 from effective source list):**
1. Source 1 — Open-Meteo (weather API): URL resolves. Provides dew point data via free API. Claim that it can be used for silent dew point tracking is accurate. PASS
2. Source 3 — Thibaut et al. 2010 ("18-MEA degrades >10% per year"): ResearchGate confirms paper exists and discusses 18-MEA decline with chronological aging. Specific "10% per year" figure is a secondary citation within the 2024 Nature paper (PMID 39521885). Cannot independently verify the exact percentage from the abstract alone. UNABLE TO VERIFY (specific figure)
3. Source 5 — Cowan 2001 (working memory ~4±1 chunks): Confirmed via atticusli.com (Dec 2024): "Human working memory can hold approximately four chunks... Nelson Cowan revised Miller's famous number downward." Also confirmed by uxplanet.org and lawsofux.com. PASS
4. Source 7 — NN/g Jan 2024 (Gestalt proximity): Confirmed in parent report QC re-score. "Proximity is the strongest grouping principle and can overpower competing cues." PASS
5. Source 9 — UXPin 2026 / moldstud.com Jul 2025 (tab bar 3-5 items, 72% preference): Confirmed in parent report QC re-score. Both sources verified independently. PASS

**Factual Currency (3 most recent quantitative claims):**
1. "72% prefer bottom navigation" (moldstud.com Jul 2025): Recent. No contradicting data found. Honestly qualified in parent report as lacking linked primary research. PASS
2. "4±1 chunks working memory" (Cowan 2001 via 2024-2025 sources): Remains consensus per multiple current sources. PASS
3. "Protein deposition plateaus at normal concentrations" (Croda 2025): Verified — Croda Beauty 2025 article snippet confirms verbatim: "this process generally plateaus when products are used at normal application concentrations." PASS

**Adversarial Checks:**
- Dew point threshold (60°F): holisticenchilada.com (2026) confirms "High Dew Point (Above 60°F / 15°C)" as the curly hair community standard. No contradicting threshold found.
- Hydrolyzed keratin frizz protection: pioneerbioinc.com confirms "amino acids from hydrolyzed proteins neutralize the negative electrical charge on the hair to eliminate frizz." Malinauskyte et al. (PMC7820954) confirms keratin peptides modify hair properties at different humidity levels. Supports item 5's claim.
- Progressive disclosure types: LogRocket Mar 2025 article confirmed to exist and discuss conditional/contextual/staged variants. No contradicting taxonomy found.

### Dimension Scores

| Dimension | Checks | Pass | Fail | Unable | Score |
|-----------|--------|------|------|--------|-------|
| 1. Source Fidelity (30%) | 15 | 14 | 0 | 1 | 93% |
| 2. Factual Currency (25%) | 6 | 6 | 0 | 0 | 100% |
| 3. Coverage (20%) | 4 | 3 | 0 | 1 | 75% |
| 4. Reasoning (10%) | 9 | 9 | 0 | 0 | 100% |
| 5. Tagging (5%) | 6 | 6 | 0 | 0 | 100% |
| 6. Actionability (7%) | 4 | 4 | 0 | 0 | 100% |
| 7. Presentation (3%) | 2 | 2 | 0 | 0 | 100% |

### Negative Criteria

| Check | Result | Penalty |
|-------|--------|---------|
| N1: Verified without source | None — derivative claims trace to parent reports | 0% |
| N2: Recs despite insufficient evidence | Item 6 trigger thresholds (30+ events) are implementation parameters, not scientific claims | 0% |
| N3: Confidence inflation | None found | 0% |

### Composite Score: 93%
### Rating: Excellent — ship as-is

### Key Strengths
- Every recommendation has explicit research backing with named sources
- Clear separation between science-backed claims and implementation decisions
- Three options presented for tab reduction (item 8) shows alternatives considered
- Explicit rejection of wizard pattern for routines with reasoning (item 9)
- Corrections from parent verification report (item 7) demonstrate intellectual honesty
- Implementation order batched by dependency, not arbitrary sequence
- Design alignment section confirms recommendations don't violate project principles

### Minor Weaknesses
- No explicit "limitations" section for the recommendations themselves (e.g., "these are based on general UX research, not validated with this app's specific users")
- Thibaut 2010 "10% per year" figure is a secondary citation — the exact percentage isn't independently verifiable from the abstract
- Item 6 trigger conditions (30+ events, 80%+ usage) are reasonable heuristics but presented without evidence for those specific thresholds

### Coverage Gap Detail
The document lacks:
- An explicit statement that these recommendations haven't been user-tested with the target audience
- Acknowledgment that IA research is general-purpose and may not perfectly map to a single-user personal tool vs. a multi-user product

These are minor given the document's purpose (implementation plan, not research report), but would strengthen it.

### Remediation Needed
- None required at this score level
- Optional: Add a brief "Limitations" note acknowledging recommendations are derived from general UX research and would benefit from user testing

