# iPad Testing Checklist

**Date:** May 12, 2026  
**URL:** https://192.168.68.36:8443/hair-routine/  
**What's being tested:** Synergy system, ranking corrections, product-aware timers, mask-replaces-conditioner, dew point weather

---

## Pass 1: Synergy System

### 1.1 Plan Generation — Synergy Selections

Open the app and let it generate a plan (any lane).

- [ ] Plan generates without errors or blank screen
- [ ] Products are selected for each step (no empty steps)
- [ ] If a product was chosen *because of synergy* with another product, does it show an explanation? (Look for text mentioning "pairs with" or naming another product)
- [ ] Does the explanation make sense? (e.g., conditioner pairs with gel, not random)

### 1.2 Synergy Chain Card

If the plan contains 3+ products that form a chain (each enables the next):

- [ ] A chain summary card appears (lists the products in sequence with a combined benefit description)
- [ ] The chain description is readable and makes sense

*Note: This may not trigger every time — depends on which products are selected. If no chain appears, skip this section.*

### 1.3 Alternatives — Synergy Impact Indicators

Tap on a step to see alternative products:

- [ ] Alternatives list appears
- [ ] Each alternative shows a synergy indicator: **+** (positive), **−** (negative), or neutral
- [ ] A "+" alternative is one that would create good pairings with the rest of the plan
- [ ] A "−" alternative is one that would break existing synergy
- [ ] Tapping an alternative to swap it in works (plan updates)

### 1.4 Contradiction Card

This only appears if the PairBeliefTracker has detected a pair where real-world results contradict the expected interaction (e.g., two products that "should" work well together but consistently get low ratings).

- [ ] If it appears: is the message clear about which pair and what the contradiction is?
- [ ] If it doesn't appear: expected (needs 5+ rated wash days with the same pair)

---

## Pass 2: Ranking & Product Intelligence

### 2.1 Product-Aware Timers

Start a walkthrough that includes a deep conditioning step:

- [ ] Timer appears for the deep conditioning product
- [ ] Timer shows the correct recommended time for that specific product (not a generic 5 minutes for everything)
- [ ] Timer counts down correctly
- [ ] Timer works after locking/unlocking iPad (visibility change handling)

### 2.2 Mask Replaces Conditioner

On a day where a mask/deep conditioner is recommended:

- [ ] If the mask contains amodimethicone (same active as conditioner), the normal conditioner step is **skipped** or marked as unnecessary
- [ ] The explanation mentions that the mask already provides the same conditioning mechanism
- [ ] If the mask does NOT contain amodimethicone, both mask and conditioner steps appear

### 2.3 Ranking Changes Visible

Check the plan's product selections:

- [ ] Garnier Color Repair Conditioner and EverPure Bond Conditioner should both rank highly (they're "co-primary" now)
- [ ] Dove conditioners should only appear if in use-up rotation (never as a recommendation)
- [ ] Product notes/descriptions match what you'd expect (no stale info)

---

## Pass 3: Weather & Environment

### 3.1 Dew Point Auto-Detection

- [ ] On app open, dew point info appears (subtle line like "💧 72°F dew point · humid")
- [ ] **No geolocation permission prompt** fires (weather comes from Cauldron API, not browser)
- [ ] If Cauldron/network is unavailable: app still loads, silently defaults to moderate (no error popup, no manual selector forced on you)

### 3.2 Weather Influence on Plan

- [ ] On a high dew point day: plan should favor anti-humectant products / stronger hold
- [ ] On a low dew point day: plan should favor moisture / lighter products
- [ ] The influence is subtle — it shouldn't completely change the plan, just nudge selections

---

## Pass 4: General UX (while you're in there)

### 4.1 Touch & Responsiveness

- [ ] All buttons/cards have adequate touch targets (no tiny tap zones)
- [ ] No accidental taps on adjacent elements
- [ ] Scrolling is smooth, no jank
- [ ] Text is readable without zooming

### 4.2 Auto-Scroll

- [ ] During walkthrough, does the view auto-scroll to the current step?
- [ ] Is the scroll smooth (not jarring)?

### 4.3 Quick-Log

- [ ] Can log a wash day without issues
- [ ] Product selection works (multi-select from inventory)
- [ ] Rating emoji scale works

---

## How to Report Issues

For each issue found, note:
1. **What you tapped / what screen you were on**
2. **What you expected**
3. **What actually happened**
4. **Screenshot if possible** (send via Local Drop)

Use the dev notes system to send findings back — or just tell Ben and he'll log them.

---

## After Testing

Once testing is complete, update SESSION_HANDOFF.md with:
- Which items passed
- Which items failed (with details)
- Any new observations or UX friction points
