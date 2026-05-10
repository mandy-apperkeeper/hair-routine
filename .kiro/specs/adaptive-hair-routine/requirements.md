# Requirements Document

## Introduction

Adaptive Hair Routine is a full rebuild of the existing hair-routine.html into a science-backed, adaptive hair care guidance app. The app provides personalized wash frequency recommendations, "too soon" warnings based on tracked history, an adaptive feedback loop that learns from user ratings, and a redesigned UX with step-by-step walkthroughs. Built as a single HTML file with localStorage persistence, PWA-capable for offline bathroom use. Designed for Mandy's specific hair profile (2C-3A, coarse, very thick, post-TE recovery, weathered cuticle).

## Glossary

- **App**: The Adaptive Hair Routine single-page web application
- **Tracker**: The persistent data layer that records wash dates, products used, lane choice, humidity level, and feedback ratings in localStorage
- **Feedback_Engine**: The adaptive system that analyzes accumulated wash history and ratings to adjust recommendations and cooldown thresholds
- **Cooldown_System**: The component that enforces minimum intervals between specific actions (washing, clarifying, protein treatments) and issues warnings when actions are attempted too soon
- **Lane**: One of two styling paths — Curly (room-temperature polymers) or Blowout (heat-activated polymers) — each with distinct product sequences
- **Walkthrough**: The step-by-step guided interface that presents one instruction at a time with inline timers
- **Learn_Section**: The reference area containing science explanations, product inventory, and diagnostic tools
- **Wash_Event**: A recorded instance of washing hair, including date, lane, products used, humidity level, and optional feedback rating
- **Cooldown_Threshold**: The minimum number of days between repeated actions, starting at defaults and shifting based on feedback data
- **Humidity_Advisory**: A product recommendation adjustment triggered by current humidity level relative to the 70% glycerin/frizz threshold
- **Seal_State**: Whether the Marc Anthony Polysilicone-29 heat seal is currently active (persists 3+ washes until clarified)

## Requirements

### Requirement 1: Landing Experience

**User Story:** As Mandy, I want to open the app and immediately see three clear choices for what I'm doing today, so that I can start my routine without navigating tabs or reading walls of text.

#### Acceptance Criteria

1. WHEN the App is opened, THE App SHALL display exactly three primary action buttons: Curly, Blowout, and Refresh
2. THE App SHALL size each action button large enough for comfortable touch interaction on mobile devices (minimum 48x48dp touch target)
3. WHEN Mandy taps an action button, THE Walkthrough SHALL begin the step-by-step sequence for the selected lane
4. THE App SHALL display a persistent status summary on the landing screen showing days since last wash, days since last clarify, and current Seal_State
5. IF the Tracker contains fewer than 3 Wash_Events, THEN THE App SHALL display default guidance text ("Every 3-4 days is a good baseline") alongside the status summary

### Requirement 2: Step-by-Step Walkthrough

**User Story:** As Mandy, I want to follow my routine one step at a time with timers built into the relevant steps, so that I can focus on what I'm doing without scrolling through an entire protocol.

#### Acceptance Criteria

1. WHEN a lane is selected, THE Walkthrough SHALL present one step at a time with a "Next" button to advance
2. THE Walkthrough SHALL display the current step number and total step count for progress awareness
3. WHEN a step includes a timed action (conditioner, deep condition, pre-shampoo treatment), THE Walkthrough SHALL display an inline countdown timer with start, pause, and reset controls
4. WHEN a timer completes, THE App SHALL play an audible alert and display a visual notification
5. THE Walkthrough SHALL include a "Back" button to return to the previous step
6. WHEN the final step is completed, THE Walkthrough SHALL prompt Mandy to log the wash event and optionally rate how her hair feels
7. WHILE the Walkthrough is active, THE App SHALL display the current step's product name, application instructions, and relevant science badge

### Requirement 3: Dual-Lane System with Transition Rules

**User Story:** As Mandy, I want the app to enforce the correct transition rules between curly and blowout lanes, so that I don't accidentally layer incompatible products.

#### Acceptance Criteria

1. WHEN Mandy selects the Blowout lane AND the Tracker shows the previous wash used NYM gel (PQ-69), THEN THE Cooldown_System SHALL display a warning: "Clarify first — PQ-69 residue blocks Polysilicone-29 adhesion"
2. WHEN Mandy selects the Curly lane AND the Seal_State is active, THEN THE Cooldown_System SHALL display a warning: "Clarify first — Polysilicone-29 residue blocks gel from working properly"
3. WHEN a clarifying wash is logged, THE Tracker SHALL reset the Seal_State to inactive
4. WHEN a Blowout lane wash is completed with Marc Anthony spray, THE Tracker SHALL set the Seal_State to active
5. THE App SHALL track the number of washes since the last Marc Anthony application and reset Seal_State after 4 washes without clarifying (conservative estimate of seal degradation)

### Requirement 4: Wash Frequency Guidance

**User Story:** As Mandy, I want science-backed reasoning about when to wash — specific to my hair type that never gets oily — so that I understand the actual signals rather than following arbitrary schedules.

#### Acceptance Criteria

1. THE App SHALL explain that wash timing for Mandy's hair is driven by product buildup removal, not oil control, because her sebum production is low relative to her hair density and coarseness
2. WHEN the Tracker shows a wash occurred within the last 24 hours, THE Cooldown_System SHALL warn: "Back-to-back sulfate washes strip the cuticle — your hair needs time to rebuild its protective layer"
3. THE App SHALL present wash signals as a checklist: hair feels heavy/stiff from buildup, frizz is unmanageable despite styling, desire to restyle, or product absorption has declined
4. WHEN the Feedback_Engine has accumulated 10 or more rated Wash_Events, THE App SHALL display a personalized insight: "Based on your last N washes, you feel best washing every X-Y days"
5. THE App SHALL never recommend washing more frequently than every 2 days unless Mandy explicitly overrides

### Requirement 5: Too-Soon Warnings

**User Story:** As Mandy, I want the app to warn me when I'm about to do something too soon based on my history, so that I don't accidentally damage my hair by over-processing.

#### Acceptance Criteria

1. WHEN Mandy initiates a wash AND the Tracker shows a wash within the last 36 hours, THEN THE Cooldown_System SHALL display a warning with the specific risk (sulfate cuticle stripping)
2. WHEN Mandy initiates a clarifying wash AND the Tracker shows a clarify within the last 5 days, THEN THE Cooldown_System SHALL display a warning: "Clarified X days ago — too frequent strips protective silicone layers that take multiple washes to rebuild"
3. WHEN Mandy initiates a protein treatment AND the Tracker shows protein within the last 7 days, THEN THE Cooldown_System SHALL display a warning: "Protein treatment X days ago — more frequent application doesn't help (plateaus at normal use levels)"
4. WHEN Mandy initiates a treatment (Olaplex, protein, deep condition) AND the Seal_State is active, THEN THE Cooldown_System SHALL display a warning: "Marc Anthony seal is active — blocks absorption. Do treatments on clarifying day"
5. THE Cooldown_System SHALL allow Mandy to dismiss any warning and proceed with the action
6. WHEN a warning is dismissed, THE Tracker SHALL record that the override occurred for future Feedback_Engine analysis

### Requirement 6: Adaptive Feedback Loop

**User Story:** As Mandy, I want the app to learn from my ratings over time and adjust its recommendations, so that the guidance becomes increasingly personalized to my actual results.

#### Acceptance Criteria

1. WHEN a Walkthrough is completed, THE App SHALL prompt Mandy to rate how her hair feels on a 5-point scale (emoji-based: terrible, meh, okay, good, amazing)
2. THE Tracker SHALL store each rating alongside the full Wash_Event context: date, lane, products used, days since previous wash, humidity level, and whether any warnings were overridden
3. WHEN the Feedback_Engine has 10 or more rated events, THE Feedback_Engine SHALL calculate the average rating for each wash interval (1-day, 2-day, 3-day, 4-day, 5-day, 6-day, 7-day+)
4. WHEN a statistically meaningful pattern emerges (5+ events at a given interval with consistent ratings), THE Feedback_Engine SHALL surface an insight on the landing screen
5. THE Feedback_Engine SHALL identify correlations between humidity levels and ratings, and adjust Humidity_Advisory thresholds accordingly
6. THE Feedback_Engine SHALL identify correlations between specific products and ratings, surfacing which products correlate with good days versus bad days
7. WHEN the Feedback_Engine detects that overridden warnings consistently result in good ratings, THE Feedback_Engine SHALL propose adjusting the relevant Cooldown_Threshold

### Requirement 7: Personalized Cooldown Thresholds

**User Story:** As Mandy, I want the cooldown periods to start with safe defaults but shift based on my actual feedback data, so that the app doesn't permanently nag me about intervals that work fine for my hair.

#### Acceptance Criteria

1. THE Cooldown_System SHALL initialize with these default thresholds: wash minimum 2 days, clarify minimum 5 days, protein minimum 7 days, treatment-while-sealed always warn
2. WHEN the Feedback_Engine accumulates 5 or more events where a specific threshold was overridden AND the average rating for those events is 4.0 or higher, THEN THE Feedback_Engine SHALL propose reducing that threshold by 1 day
3. WHEN the Feedback_Engine accumulates 5 or more events at a specific interval AND the average rating is below 2.5, THEN THE Feedback_Engine SHALL propose increasing the relevant threshold by 1 day
4. THE App SHALL present threshold adjustment proposals to Mandy for confirmation before applying them
5. THE App SHALL display current thresholds in a settings area with the ability to manually reset to defaults
6. THE Cooldown_System SHALL never reduce the wash threshold below 1 day or the clarify threshold below 3 days (hard science floors)

### Requirement 8: Humidity-Aware Product Guidance

**User Story:** As Mandy, I want the app to factor humidity into its product suggestions, so that I avoid glycerin-induced frizz on humid days without having to remember the science myself.

#### Acceptance Criteria

1. WHEN Mandy begins a Walkthrough, THE App SHALL prompt for current humidity level with three options: Dry (<40%), Moderate (40-70%), Humid (>70%)
2. WHEN humidity is above 70% AND the Curly lane is selected, THE Walkthrough SHALL substitute "Got2b Ultra Glued" for "NYM Curl Talk Gel" in the gel step with explanation: "NYM gel's glycerin pulls excess moisture in humid conditions — Got2b has the same PQ-69 hold without glycerin"
3. WHEN humidity is above 70% AND the Blowout lane is selected, THE Walkthrough SHALL emphasize the Marc Anthony spray step: "Extra important today — the Polysilicone-29 seal blocks humidity penetration"
4. THE Tracker SHALL record the humidity level selected for each Wash_Event
5. WHEN the Feedback_Engine detects that Mandy consistently rates humid-day washes poorly despite product swaps, THE Feedback_Engine SHALL surface this pattern as an insight

### Requirement 9: Wash Event Tracking and History

**User Story:** As Mandy, I want a persistent record of my wash history with all relevant context, so that the adaptive system has data to learn from and I can see my own patterns.

#### Acceptance Criteria

1. THE Tracker SHALL persist all data in localStorage with a structured schema: array of Wash_Events, current Cooldown_Thresholds, Seal_State, and Feedback_Engine insights
2. WHEN a Walkthrough is completed, THE Tracker SHALL automatically record: date/time, lane selected, products used, humidity level, and feedback rating
3. THE App SHALL provide a History view showing past Wash_Events in reverse chronological order with ratings, lane, and interval since previous wash
4. THE App SHALL provide a data export function (JSON download) for backup purposes
5. THE App SHALL provide a data import function to restore from a previously exported backup
6. IF localStorage is unavailable or full, THEN THE App SHALL display a clear error message explaining the limitation and suggesting data export

### Requirement 10: Science and Learn Section

**User Story:** As Mandy, I want access to the verified science behind the recommendations without it cluttering my daily routine flow, so that I can reference it when curious but ignore it when busy.

#### Acceptance Criteria

1. THE Learn_Section SHALL be accessible from the landing screen but separate from the Walkthrough flow
2. THE Learn_Section SHALL contain explanations for: sebum and wash frequency, sulfate exposure and cuticle state, Polysilicone-29 heat seal mechanism, amodimethicone cumulative binding, glycerin and humidity interaction, protein treatment plateau effect, 140°C critical heat threshold, and 18-MEA lipid layer replacement
3. THE Learn_Section SHALL contain a "Why am I frizzy?" diagnostic tool with the six verified causes (no humidity barrier, weathered cuticle, overnight friction, TE regrowth halo, directional hold failure, product buildup)
4. THE Learn_Section SHALL contain a product inventory showing each product's role, key active ingredients, and science badge
5. THE Learn_Section SHALL organize content into expandable/collapsible sections to avoid overwhelming the user

### Requirement 11: Responsive Design and Offline Capability

**User Story:** As Mandy, I want to use this app on my phone in the bathroom, on my iPad, and on desktop, with offline support so it works regardless of wifi, so that it's always available when I need it.

#### Acceptance Criteria

1. THE App SHALL render correctly on viewport widths from 320px (phone portrait) to 1440px (desktop)
2. THE App SHALL use touch-friendly interaction targets (minimum 44x44px) on all interactive elements
3. THE App SHALL function fully offline after initial load by using a service worker to cache all assets
4. THE App SHALL use a mobile-first responsive layout with single-column on phone and optional wider layout on tablet/desktop
5. THE App SHALL maintain readable text sizes without requiring zoom (minimum 16px body text on mobile)
6. WHILE offline, THE App SHALL continue to read and write to localStorage without degradation

### Requirement 12: Corrected Protocol Integration

**User Story:** As Mandy, I want the app to contain the verified, corrected protocol from the session handoff — including Marc Anthony blowout spray, Garnier Color Repair conditioner, NYM gel, and the dual-lane system — so that the guidance is accurate and up to date.

#### Acceptance Criteria

1. THE Walkthrough SHALL present the Curly lane steps in verified order: optional pre-shampoo, shampoo, Garnier Color Repair conditioner (sectioned, 5 min), optional Wonder Water rinse, L'Oréal 21-in-1 leave-in (poured not sprayed), NYM Curl Talk gel (scrunched into soaking hair), hairline regrowth gel, dry (diffuse or air), scrunch out the crunch
2. THE Walkthrough SHALL present the Blowout lane steps in verified order: shampoo (clarify if switching from curly), Garnier Color Repair conditioner (sectioned, 5 min), towel dry to damp, L'Oréal 21-in-1 leave-in, Marc Anthony Blowout Spray (saturate each section), rough dry to 70-80%, face-framing pieces first (FlexStyle round brush, direct toward face, cool shot), section and style remaining hair, finishing serum
3. THE Walkthrough SHALL present the Refresh flow with separate guidance for post-curly (water mist, re-scrunch, spot gel) and post-blowout (root lift, end serum)
4. THE App SHALL include the weekly treatment schedule: clarify 1x/week, protein every 7-14 days (alternate OGX Bond Protein / Olaplex 3), optional deep condition with Garnier Color Repair + heat
5. THE App SHALL reference only products from the verified inventory in the session handoff document

### Requirement 13: Visual Design and Accessibility

**User Story:** As Mandy, I want the app to look polished and be easy to use in a steamy bathroom with wet hands, so that it feels like a real tool rather than a prototype.

#### Acceptance Criteria

1. THE App SHALL use a dark color scheme to reduce glare in bathroom lighting
2. THE App SHALL maintain WCAG 2.1 AA contrast ratios (minimum 4.5:1 for body text, 3:1 for large text and UI components)
3. THE App SHALL support keyboard navigation for all interactive elements
4. THE App SHALL use large, well-spaced touch targets suitable for wet-hand interaction (minimum 48x48dp with 8dp spacing between targets)
5. THE App SHALL use clear visual hierarchy to distinguish primary actions from secondary information
6. THE App SHALL provide visible focus indicators for keyboard navigation
7. THE App SHALL use semantic HTML elements (nav, main, section, button) for screen reader compatibility

