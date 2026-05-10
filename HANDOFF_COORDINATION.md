# Hair Routine — Handoff Document Coordination

## Problem

The `SESSION_HANDOFF.md` file has two competing formats:

1. **Original format (Sessions 1–10):** Single-state document that gets overwritten each session. Only shows the most recent session's work + cumulative decisions + what's next.

2. **Cumulative log format (introduced externally):** Appends each session as a new entry. Preserves history but grows indefinitely.

The file currently has the cumulative format (Sessions 9, 10, 11 as separate entries). Session 11 was appended by this session after the format was changed externally.

## What Needs Deciding

1. **Which format going forward?**
   - **Overwrite (original):** Simpler, always current, but loses session history. Works well with `session-context.md` steering file handling the persistent context.
   - **Cumulative log:** Preserves history, useful for "what did we try before," but gets long. Needs periodic pruning.
   - **Hybrid:** Keep last 3 sessions in the log, archive older ones to a separate file.

2. **What's the relationship between `SESSION_HANDOFF.md` and `.kiro/steering/session-context.md`?**
   - Currently: `session-context.md` has project-level persistent context (tech stack, decisions, anti-patterns). `SESSION_HANDOFF.md` has session-specific state (what happened, what's next).
   - They overlap on "cumulative decisions" — both track them.
   - Proposal: `session-context.md` owns permanent decisions and project context. `SESSION_HANDOFF.md` owns session-to-session state transitions only.

3. **Should `session-context.md` be updated to reflect Session 11 decisions?**
   - Yes — the Product Intelligence System scoping decisions (mechanism model, offline-first + online discovery, passive + active surfacing) should be added to the "Current Status" and "Established Decisions" sections.

## Current State of Each File

### `SESSION_HANDOFF.md` (cumulative log format)
- Session 9: Product Inventory (complete)
- Session 10: Logging UX Overhaul (partially complete, product mapping broken)
- Session 11: Product Intelligence System scoping (no code, design only)
- Last entry has full state snapshot + open questions for spec drafting

### `.kiro/steering/session-context.md`
- Last updated: reflects spec feature-complete status
- Current Status section says "Remaining improvements: 2 of 15"
- Does NOT yet reflect Session 11 decisions (product intelligence system, phase-based logging)
- Needs update to "What's Next" and "Established Decisions"

## Action for Next Session

1. Pick a format for `SESSION_HANDOFF.md` (recommend: cumulative with 3-session window)
2. Update `session-context.md` to reflect:
   - Current status: Product Intelligence System spec needed before further code work
   - New decisions: mechanism model, offline+online, passive+active surfacing, phase-based quick-log
   - What's next: Draft spec → implement in phases
3. Then proceed with spec drafting for the Product Intelligence System

## Open Questions from Session 11 (for spec)

1. Online product discovery: AI-assisted (needs backend) vs structured form (client-side) vs hybrid?
2. Product data model: How granular are mechanisms?
3. Interaction rules: Hardcoded knowledge graph or derivable from mechanism tags?
4. Recommendation confidence: How much data before active recommendations?
5. Migration path: Additive metadata on existing inventory or restructure?
