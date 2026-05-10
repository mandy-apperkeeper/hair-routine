# Daily Plan — Design

## Vision

The app opens and immediately shows today's hair plan — a complete, scrollable walkthrough generated from dew point, history, seal state, and timing. No lane selection required. The user can follow it as-is with zero interaction, or tap "Adjust" to input hair observations and context for a refined plan.

This replaces the current "pick a lane → follow walkthrough" model with "here's what I recommend → tell me more if you want."

## Core Interaction Model

```
┌─────────────────────────────────────────────┐
│  OPEN APP                                    │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │ Today's Plan                            │ │
│  │ Curly Day • Dew point 52°F • Day 4      │ │
│  │                                         │ │
│  │ [Adjust — tell me about your hair →]    │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ PREP & WASH ──────────────────────────┐ │
│  │ 1. Garnier Pre-Shampoo         [ℹ] [↻] │ │
│  │    Bond repair + frizz protection       │ │
│  │    ⏱ 5 min                              │ │
│  │                                         │ │
│  │ 2. EverPure Bond Repair Shampoo [ℹ] [↻]│ │
│  │                                         │ │
│  │ 3. Garnier Color Repair Cond    [ℹ] [↻]│ │
│  │    ⏱ 5 min • 🧢 heat cap helps         │ │
│  │                                         │ │
│  │ 4. Wonder Water                 [ℹ] [↻]│ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ STYLE ────────────────────────────────┐ │
│  │ 5. L'Oréal 21-in-1 Leave-In    [ℹ] [↻]│ │
│  │                                         │ │
│  │ 6. NYM Curl Talk Gel            [ℹ] [↻]│ │
│  │    Moderate humidity — NYM is fine      │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ DRY & FINISH ────────────────────────┐ │
│  │ 7. Diffuse or air dry                  │ │
│  │                                         │ │
│  │ 8. Scrunch out the crunch              │ │
│  │                                         │ │
│  │ ── SKIP TODAY ──────────────────────── │ │
│  │ ✗ Olaplex 3 — not due (last: 5d ago)  │ │
│  │ ✗ Clarify — not due (last: 4d ago)    │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ DONE ─────────────────────────────────┐ │
│  │ How'd it turn out?                      │ │
│  │ 😫 😕 😐 😊 🤩        [Skip for now]   │ │
│  │                                         │ │
│  │ (We'll check in tomorrow too)           │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Key Interactions

### [ℹ] Info Popup (in-place, doesn't navigate away)
Tapping the info icon on any step opens a modal/bottom-sheet overlay showing:
- Why this product is recommended today
- What it does (mechanism, one sentence)
- Science confidence badge (Verified / Best Practice)
- Source citation
- Dismiss with tap outside or X

### [↻] Rotate Product (ranked alternatives)
Tapping the rotate icon shows a ranked list of alternatives for that step:
- #2, #3, etc. — each with a one-line reason why it's ranked lower
- Tapping an alternative swaps it into the plan
- The plan re-evaluates downstream steps if the swap has interaction implications

Example for step 6 (gel):
```
┌─────────────────────────────────────┐
│ Alternatives for: Styling Gel       │
│                                     │
│ 1. NYM Curl Talk Gel ← current     │
│    Best for moderate humidity       │
│                                     │
│ 2. Got2b Ultra Glued               │
│    Better humidity hold (PQ-69)     │
│    Overkill for today's dew point   │
│                                     │
│ 3. Maui Curl Smoothie              │
│    Light hold only — won't last     │
│    all day in current conditions    │
└─────────────────────────────────────┘
```

### Adjust Flow (progressive disclosure)
Tapping "Adjust — tell me about your hair" opens an overlay:

**Layer 1 — Quick observation (single-select):**
- 🌊 Frizzy / poofy
- 🪨 Flat / limp
- ✨ Holding well
- 🧴 Oily / heavy
- 🌿 Dry / rough

**Layer 2 — Context (optional toggles, tap "More"):**
- 🏃 Exercised / sweaty
- ⏰ Short on time
- 🔥 Planning to heat style
- 🌙 Slept without protection

**Layer 3 — Specific observations (optional multi-select, tap "More detail"):**
- Tangles worse than usual
- More shedding than normal
- Curl pattern dropping faster
- Stiff / straw-like
- Scalp itchy / flaky

Submitting any layer immediately re-generates the plan. Changes are visible (products swap, steps add/remove, skip reasons update).

### Condensed View
A toggle to collapse the plan into a compact checklist:
```
☐ Garnier Pre-Shampoo (5 min)
☐ EverPure Shampoo
☐ Garnier Conditioner (5 min 🧢)
☐ Wonder Water
☐ 21-in-1 Leave-In
☐ NYM Gel
☐ Diffuse
☐ Scrunch
```
Timers still accessible (tap the time to start). Checkboxes optional (for tracking progress mid-shower).

### Outcome Collection
**Immediate (end of plan):** Emoji rating row at the bottom. Can skip ("Skip for now").

**Deferred (next day):** If skipped, a gentle prompt appears next time the app is opened: "How did yesterday's wash turn out?" Same emoji scale. Disappears after rating or after 48 hours.

This two-pass approach captures:
- Immediate impression (how does it feel right now)
- Next-day assessment (how did it hold up overnight / through the day)

Both feed the Bayesian system. Next-day rating is arguably more valuable (tests durability, not just initial feel).

## Plan Generation Logic

### Inputs (automatic, no user action needed)
- Current dew point (Open-Meteo API, cached)
- Days since last wash
- Days since last clarify
- Days since last protein treatment
- Days since last deep condition
- Last wash lane (curly/blowout)
- Seal state (active/inactive, washes since applied)
- Product inventory (what's available, what's being used up)
- Historical ratings (Bayesian beliefs per product per condition)

### Lane Suggestion Algorithm
```
IF seal active AND < 4 washes since seal:
  suggest blowout OR refresh (not curly — seal blocks)
ELSE IF days since wash == 0-1:
  suggest refresh
ELSE IF days since wash >= user's preferred interval:
  suggest curly OR blowout (based on last wash pattern + user tendency)
ELSE:
  suggest refresh OR "no wash needed"
```

Lane is a suggestion, not a gate. User can override via Adjust ("Planning to heat style" → switches to blowout plan).

### Product Ranking Per Step
For each step in the plan, rank available products by:
1. Domain rules (hard requirements — e.g., amodimethicone conditioner always #1)
2. Condition match (dew point → Got2b over NYM in humidity)
3. Bayesian posterior (personal data — which product correlates with better ratings in similar conditions)
4. Interaction compatibility (doesn't conflict with other products in today's plan)
5. Inventory status (deprioritize "using-up" products unless no alternative)

### Skip Logic
A step is marked "SKIP TODAY" when:
- Treatment not due (protein < 7 days, clarify < 7 days, deep condition < 14 days)
- Product conflicts with current state (curly products while seal active)
- Time constraint selected in Adjust (drops optional steps)

Each skip shows the reason: "not due (last: 5d ago)" or "seal active — would conflict"

### Adjustment Rules
When user inputs observations, the plan adjusts:

| Observation | Plan Adjustment |
|---|---|
| Frizzy | Upgrade to stronger hold gel, add Wonder Water if missing, ensure amodimethicone conditioner |
| Flat/limp | Drop heavy leave-in, suggest clarify if overdue, lighter conditioner application |
| Oily/heavy | Suggest clarify, reduce leave-in, skip finishing oils |
| Dry/rough | Longer conditioner time, add pre-shampoo, extra leave-in |
| Holding well | Suggest refresh (minimal intervention), skip full wash |
| Short on time | Drop optional steps (pre-shampoo, Wonder Water), reduce conditioner time |
| Heat styling | Add heat protection step, switch to blowout lane |
| Exercised | Prioritize wash over refresh |
| Stiff/straw-like | Reduce protein frequency, add extra conditioning |

## Data Model Changes

### New fields on WashEvent
```javascript
{
  // Existing fields preserved
  date: '2026-05-10',
  lane: 'curly',
  products: [...],
  dewPoint: 52,
  rating: 4,
  
  // NEW
  observations: {
    quick: 'frizzy',           // single-select from layer 1 (or null)
    context: ['short_on_time'], // array from layer 2 (or [])
    detailed: ['tangles'],      // array from layer 3 (or [])
  },
  planAdjusted: true,           // whether user used Adjust flow
  productSwaps: [               // products rotated in by user (tracks overrides)
    { step: 'styling', from: 'nym-curl-talk-gel', to: 'got2b-gel' }
  ],
  deferredRating: 4,            // next-day rating (or null)
  deferredRatingDate: '2026-05-11'
}
```

### Schema migration
Additive — new fields default to null/empty. No existing data changes.

## Relationship to Existing Specs

- **Product Intelligence spec:** The daily plan USES the RecommendationEngine, IngredientKB, and BeliefTracker designed there. This spec defines the UX layer on top of that intelligence.
- **Step Reorganization (SESSION_HANDOFF priority):** The daily plan uses the new granular step system (shampoo, bond_repair, conditioner, etc.) for its step ordering. That work should complete first.
- **Adaptive Hair Routine spec (original):** Superseded by this design for the walkthrough UX. The data layer, cooldown system, and feedback engine from that spec remain.

## What This Replaces

- The 3-button lane selection on the landing page
- The one-step-at-a-time walkthrough navigation (replaced by scrollable single-page)
- The humidity prompt (replaced by auto-detection + Adjust flow)

## What This Preserves

- All existing data (history, events, ratings, inventory)
- The science/Learn section (accessible via [ℹ] popups and a nav link)
- Settings and threshold management
- Export/import
- Timer functionality (embedded in the scrollable plan)

## Design Principles Applied

1. **Immediate value on open** — the plan is there, ready, no navigation needed
2. **Content is the interface** — the plan IS the screen, not a menu leading to it
3. **Progressive depth** — quick observation → context → detailed → plan adjusts
4. **Context-aware defaults** — dew point + history + timing generate the plan automatically
5. **Beautiful at rest** — even without interaction, the plan is useful and complete
6. **Pre-populated over blank slate** — products are pre-selected, user subtracts/swaps rather than builds
7. **Tap anything to go deeper** — every product is tappable for info, every step has alternatives

## Open Questions (for implementation)

1. Should the condensed view be the default on repeat visits (user already knows the routine)?
2. How to handle "no wash needed" days — show a minimal screen, or still show a refresh plan?
3. Timer UX in scrollable view — sticky timer bar at top when active? Inline countdown?
4. Animation/transition when plan adjusts after observation input — subtle reorder, or full re-render?
