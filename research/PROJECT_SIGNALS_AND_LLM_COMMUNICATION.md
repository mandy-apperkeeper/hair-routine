# Project Signals and Communication Issue Patterns with LLMs

**Research Date:** May 12, 2026  
**Quadrant:** Empirical/Technical  
**Purpose:** Understand why Kiro repeatedly fails at project identification, over-asks, and loses instruction adherence — and what the research says about mitigations  
**Stakes:** Medium — findings inform steering rule refinements  

---

## Executive Summary

The recurring friction patterns documented in Kiro's friction log (missed project signals, over-calibration, premature assumptions, instruction drift) are not idiosyncratic bugs. They map directly to well-documented architectural limitations of transformer-based language models. Three bodies of research converge:

1. **Lost in the Middle** — positional attention bias causes models to under-weight information in the middle of long contexts
2. **Instruction Complexity Cliff** — compliance degrades non-linearly as rule count increases, with a practical limit of ~3 concurrent constraints
3. **Lost in Conversation** — multi-turn interactions cause 39% average performance degradation, driven primarily by increased unreliability rather than reduced capability

The implication for Kiro's steering system: the current architecture (8+ steering files, multiple hooks, long friction log, environment context) is operating well past the empirically-demonstrated reliability threshold. The failures aren't compliance failures — they're architectural inevitabilities given the context load.

---

## Finding 1: The Instruction Complexity Cliff

**Source:** Tian Pan, "The Instruction Complexity Cliff: Why LLMs Follow 5 Rules Reliably but Not 15" ([tianpan.co](https://tianpan.co/blog/2026-04-17-instruction-complexity-cliff-llm-compliance), April 17, 2026). References: [arxiv.org/abs/2310.20410](https://arxiv.org/abs/2310.20410), [arxiv.org/abs/2307.03172](https://arxiv.org/abs/2307.03172), [arxiv.org/html/2601.03269](https://arxiv.org/html/2601.03269), [arxiv.org/html/2512.14754v1](https://arxiv.org/html/2512.14754v1)

**Verified findings:**

- LLMs can reliably satisfy approximately **3 concurrent constraints** on average. GPT-4 averaged 3.3; GPT-3.5 averaged 2.9; open-source models ranged 1.4–2.4.
- Compliance degradation follows three patterns depending on architecture:
  - **Threshold decay** (reasoning models like o3, Gemini 2.5 Pro): near-perfect until ~150–250 instructions, then sharp cliff
  - **Linear decay**: steady, predictable reduction across the spectrum
  - **Exponential decay**: rapid collapse after 50–100 instructions, then stabilizes at a low floor
- At 500 instructions: Gemini 2.5 Pro held 68.9%, Claude 3.7 Sonnet at 52.7%, GPT-4o at 15.4%
- **Positional bias (U-shaped curve):** Models attend most reliably to the beginning and end of prompts. Middle-positioned content receives 30%+ less attention. This is architectural (Rotary Position Embeddings + causal attention), not a fixable bug.
- **Primacy bias dominates:** Present in 70% of 104 model-task combinations tested. The first third of an instruction list captures >40% of model attention.

**Confidence:** High — multiple peer-reviewed sources, consistent findings across architectures.

### Implication for Kiro

Kiro's current steering load per turn:
- System prompt (identity, rules, capabilities) — ~2000 tokens
- 8 global steering files — ~8000+ tokens  
- 2 workspace steering files — ~2000+ tokens
- Friction log — ~15000+ tokens
- 2 hooks (ADDITIONAL_INSTRUCTIONS) — ~500 tokens
- Environment context (open files, active editor) — ~500 tokens
- Conversation history — variable

The project identification rule ("Explicit project name in the user's message — this ALWAYS wins") sits in a hook instruction that appears **after** the system prompt, **after** all steering files, and **after** the friction log. By positional bias research, this is in the attention valley. The rule is correct and clear — but it's positioned where the model is least likely to attend to it.

---

## Finding 2: Lost in Conversation — Multi-Turn Unreliability

**Source:** Laban et al., "LLMs Get Lost In Multi-Turn Conversation" ([arxiv.org/html/2505.06120v1](https://arxiv.org/html/2505.06120v1), May 2025, Microsoft Research + Salesforce). Published at ICML 2025 ([openreview.net](https://openreview.net/forum?id=VKGTGGcwl6)).

**Verified findings (200,000+ simulated conversations, 15 LLMs):**

- **Average 39% performance degradation** from single-turn to multi-turn on identical tasks
- Degradation occurs even in **two-turn conversations** — any underspecification triggers it
- The degradation is primarily **increased unreliability** (112% average increase), not reduced capability (only 16% aptitude loss)
- **Root causes identified:**
  1. LLMs make assumptions in early turns and prematurely attempt final solutions
  2. They overly rely on previous (incorrect) answer attempts ("answer bloat")
  3. They over-adjust based on first and last turns, forgetting middle turns ("loss-in-middle-turns")
  4. They produce overly verbose responses that introduce assumptions
- **Reasoning models (o3, Deepseek-R1) are equally unreliable** in multi-turn settings — additional test-time compute doesn't help
- **Lowering temperature is ineffective** for multi-turn reliability (unreliability remains ~30% even at T=0.0 for both user and assistant)
- **Mitigation experiments:**
  - "Recap" (consolidate all info in final turn): recovers 15-20% of lost performance
  - "Snowball" (repeat all prior info each turn): similar partial recovery
  - Neither fully closes the gap — native multi-turn support is needed

**Confidence:** High — large-scale controlled experiment, peer-reviewed, reproducible methodology.

### Implication for Kiro

The friction log's most common pattern — "presented options instead of acting on the obvious" (10 instances) — maps directly to the "premature assumption + over-reliance on prior response" mechanism. When Kiro generates a response that includes options, it has already committed to the "options" frame. Subsequent turns where the user says "just do it" require the model to override its own prior output — which the research shows LLMs are bad at.

The "missed project signal" pattern (5 instances) maps to "loss-in-middle-turns" — the project name appears in the user's message (most recent turn), but the active editor file appears in the environment context (which is positioned differently). The model anchors on whichever signal has higher positional salience, not higher semantic priority.

---

## Finding 3: Context Engineering as Mitigation

**Source:** Tian Pan, "Effective Context Engineering for AI Agents" ([tianpan.co](https://tianpan.co/blog/2026-02-23-effective-context-engineering-for-ai-agents), Feb 23, 2026). Also: Microsoft Research ACE framework, LangChain context engineering docs, Weaviate context engineering guide.

**Verified findings:**

- 65% of enterprise AI failures in 2025 traced to context drift or memory loss — not model capability
- Four core strategies for production agents:
  1. **Write** — externalize state to reduce context window load
  2. **Select** — just-in-time context loading instead of pre-loading everything
  3. **Compress** — structured summarization of accumulated history
  4. **Isolate** — distribute work across clean context windows (sub-agents)
- **Tiered context model** (mature implementations):
  - Working context: per-invocation compiled prompt
  - Session store: durable event log
  - Memory store: long-lived searchable knowledge
  - Artifact store: named, versioned large objects referenced by handle
- **Failure modes to design against:**
  - Context poisoning (hallucination enters window, corrupts downstream)
  - Context distraction (volume exceeds effective attention span)
  - Context confusion (tangential info causes anchoring on irrelevant details)
  - Context clash (conflicting info produces inconsistent outputs)

**Confidence:** High for the framework; medium for specific percentage claims (industry reports, not peer-reviewed).

### Implication for Kiro

The friction log itself is a context engineering anti-pattern. At ~15,000 tokens, it's the single largest piece of context loaded every turn. It contains 30+ entries documenting failure patterns — but by the positional bias research, only the first few and last few entries receive full attention. The middle entries (which contain the most relevant patterns for any given session) are in the attention valley.

The "Consolidate before retrying" recommendation from the Lost in Conversation paper directly maps to what SESSION_HANDOFF.md does — but the handoff is loaded alongside the friction log, steering files, and hooks, diluting its signal.

---

## Finding 4: Alignment Drift in Long Interactions

**Source:** "Alignment Drift in CEFR-prompted LLMs for Interactive Spanish Tutoring" ([arxiv.org/abs/2505.08351](https://arxiv.org/abs/2505.08351), June 2025). Also: "Measuring and Controlling Instruction (In)Stability in Language Model Dialogs" ([arxiv.org/html/2402.10962v2](https://arxiv.org/html/2402.10962v2)).

**Verified findings:**

- System prompting alone is "too brittle for sustained, long-term interactional contexts" — termed "alignment drift"
- Significant instruction drift occurs within **8 rounds** of conversation (attention decay mechanism)
- The transformer attention mechanism plays a causal role — attention to system prompt tokens decays over long exchanges
- "Lost-in-Conversation" (LiC) phenomenon: LLMs struggle to recover from early incorrect assumptions, particularly with ambiguous initial instructions

**Confidence:** High — peer-reviewed, consistent with the other findings.

### Implication for Kiro

The steering system relies on system-prompt-level instructions remaining effective across an entire session (potentially 15+ turns). The research shows this assumption is false — instruction adherence degrades within 8 rounds. The hooks that fire on every turn (project identification, dev notes check) partially mitigate this by re-injecting instructions, but they add to the total context load, creating a tension: more reminders = more tokens = more context distraction.

---

## Finding 5: The "Prospective Memory" Failure

**Source:** "Did You Forget What I Asked? Prospective Memory Failures in Large Language Models" ([arxiv.org/html/2603.23530v1](https://arxiv.org/html/2603.23530v1), 2026).

**Verified (from search snippet — full paper inaccessible):**

- LLMs exhibit "prospective memory failures" — forgetting to execute previously-agreed actions when the triggering context arrives
- Related to dual-task interference, prompt salience, and long-context retrieval failures
- Distinct from factual recall — the model "knows" the rule but fails to activate it at the right moment

**Confidence:** Medium — only snippet available, but the concept directly explains the friction log patterns.

### Implication for Kiro

This explains why the project identification rule exists, is clear, and is still violated. The model "knows" the rule (it can recite it when asked) but fails to activate it when processing the user's message. The rule requires prospective memory: "when you see a project name, do X." The research suggests this type of conditional-trigger instruction is particularly vulnerable to failure under cognitive load (high context volume).

---

## Synthesis: Why Kiro's Friction Patterns Are Predictable

| Friction Pattern | Frequency | Root Mechanism | Research Source |
|---|---|---|---|
| Missed project signal | 5 instances | Positional bias + prospective memory failure | Lost in Middle + Prospective Memory |
| Over-calibration / presented options | 10 instances | Premature assumption + answer bloat | Lost in Conversation |
| Failed friction review | 3 instances | Instruction complexity cliff (too many concurrent constraints) | Complexity Cliff |
| Stale context / wrong file | 4 instances | Context confusion + primacy bias toward recent/salient tokens | Context Engineering failures |
| Tool failure circuit breaker violation | 3 instances | Alignment drift (rule known but not activated) | Alignment Drift + Prospective Memory |
| Deferred action when user said "do it" | 3 instances | Over-reliance on prior response frame | Lost in Conversation (answer bloat) |

---

## Actionable Recommendations

Based on the research, these are the highest-leverage changes to Kiro's steering architecture:

### 1. Reduce Total Context Load (addresses: Complexity Cliff, Positional Bias)

The friction log at 15,000+ tokens is counterproductive. Research shows that beyond ~5 rules, compliance degrades. The friction log contains 30+ entries — the model cannot reliably attend to all of them.

**Proposed:** Replace the friction log with a **distilled rules file** of max 10 rules, derived from the log's patterns. Archive the full log for human reference. The distilled rules go in the system prompt's high-attention zone (beginning or end).

### 2. Position Critical Rules at Boundaries (addresses: U-shaped attention)

The project identification rule and bias-to-action rule are the two most-violated. They should be positioned at the **very beginning** or **very end** of the steering context — not buried in the middle of a hook instruction that fires after 20,000 tokens of other content.

**Proposed:** Move the 3 most critical rules (project identification, bias-to-action, circuit breaker) into a "CRITICAL RULES" section at the top of the system prompt or as the final section before the user's message.

### 3. Consolidate Per-Turn (addresses: Lost in Conversation, Multi-turn Unreliability)

The "Snowball" mitigation from the Lost in Conversation paper (repeating key info each turn) partially works. The hooks already do this for project identification — but they add context rather than replacing stale context.

**Proposed:** Instead of accumulating conversation history, implement structured state summarization at turn boundaries. Each turn should start with a compiled "current state" block (active project, current task, key constraints) rather than relying on the model to extract this from the full history.

### 4. Reduce Concurrent Constraints Per Rule File (addresses: 3-Constraint Threshold)

Each steering file currently bundles 10-20 rules. The research shows models can reliably satisfy ~3 concurrent constraints. 

**Proposed:** Restructure steering files to present max 3-5 rules per logical section, with clear structural markers between sections. Use the "examples are worth more than specification" principle — show desired behavior rather than listing prohibitions.

### 5. Accept the Reliability Floor (addresses: all findings)

The research is clear: multi-turn LLM interactions have an irreducible unreliability floor of ~30% even under optimal conditions. No amount of steering will achieve 100% compliance across a 15-turn session. The friction log's expectation of zero-defect performance is unrealistic given current model architectures.

**Proposed:** Shift the quality bar from "never violate rules" to "detect and recover within 1 turn." Design the system for fast recovery rather than perfect prevention. The hooks that re-inject rules each turn are the right architectural pattern — but they need to be lighter (fewer tokens) and more targeted (only the rules relevant to the current context).

---

## Search Query Log

| Query | Looking For | Found |
|---|---|---|
| `LLM instruction following failures attention context window research 2025` | Academic research on why LLMs fail to follow instructions | Multiple arxiv papers on instruction drift, complexity cliffs, context degradation |
| `large language models lost in the middle problem context prioritization` | Positional bias research | Extensive literature on U-shaped attention curves |
| `LLM instruction drift system prompt adherence degradation long conversations 2024 2025` | Multi-turn instruction drift | Key papers: Measuring Instruction Instability, Alignment Drift, Lost in Conversation |
| `"lost in the middle" LLM positional bias mitigation strategies system prompt` | Mitigation approaches | Calibration mechanisms, found-in-the-middle technique |
| `AI agent project context switching signal detection system prompt engineering patterns` | Context engineering for agents | Extensive 2026 literature on context engineering as a discipline |
| `LLM multi-turn conversation lost information degradation mitigation strategies 2025` | Multi-turn mitigations | Lost in Conversation paper (Microsoft), State-Update prompting, curriculum RL |
| `context engineering AI agents state management instruction consolidation patterns 2025 2026` | Practical patterns | Tiered context model, Write/Select/Compress/Isolate framework |
| `"intent mismatch" LLM multi-turn conversation early assumptions wrong turn recovery` | Intent mismatch research | Intent Mismatch paper (Feb 2026), Cooperative Breakdowns paper |

---

## Confidence Summary

**Verified (read from source this session):**
- Instruction complexity cliff numbers (3.3 constraint average, degradation curves)
- Lost in Conversation findings (39% degradation, 112% unreliability increase, root causes)
- Context engineering four-strategy framework (Write/Select/Compress/Isolate)
- Positional bias U-shaped curve (30%+ accuracy drop for middle-positioned content)
- Alignment drift within 8 rounds

**Inferred (reasoning from verified facts):**
- The mapping between friction log patterns and research mechanisms (the research doesn't study IDE agents specifically, but the mechanisms are general)
- The recommendation to reduce friction log size (follows from complexity cliff + positional bias, but hasn't been A/B tested)
- The claim that hooks partially implement "Snowball" mitigation (structural similarity, not empirically validated)

**Unknown:**
- Whether Kiro's specific model (Claude) exhibits the same degradation curves as the models tested in the papers (likely yes based on Claude 3.7 Sonnet's inclusion in some studies, but not verified for the exact version)
- The optimal token budget for steering files given Kiro's specific context window size
- Whether the friction log's presence actively causes the failures it documents (correlation is clear, causation is inferred)

---

## Scorecard

| Dimension | Score | Notes |
|---|---|---|
| Mechanistic Rigor | 82/100 | Strong empirical sources, clear causal mechanisms identified. Gap: no direct study of IDE-agent context specifically. |
| Judgment Quality | 78/100 | Recommendations follow logically from findings. Gap: no A/B testing of proposed mitigations. |
| **Composite** | **80/100** | Solid research with clear actionable implications. The mapping from general LLM research to Kiro-specific patterns is well-supported but not empirically validated in this specific context. |

### Key Failures:
- Could not access full text of several arxiv papers (rendering errors) — relied on abstracts and search snippets for some claims
- No research found specifically on IDE-agent project signal detection — this is a novel application domain
- The "65% of enterprise AI failures" claim from the context engineering article lacks a primary source citation

---

*Content was rephrased for compliance with licensing restrictions. All sources linked inline.*

---

## Addendum: Review Findings and Updates (May 12, 2026)

The following sections address gaps identified during peer review of the original document.

---

## Limitations

This research maps general LLM behavioral findings to a specific IDE-agent context. Key limitations:

1. **Benchmark ≠ behavioral rules.** The "3 concurrent constraints" finding (IFEval) measures formatting constraints on a single output (e.g., "write in all caps AND include 3 bullets AND end with a question"). Kiro's steering rules are behavioral constraints across a session — a different cognitive demand. The 3-constraint limit is a useful heuristic for understanding degradation, but it is not a hard ceiling for behavioral rule adherence. Behavioral rules that align with the model's training distribution (e.g., "read before editing") may have much higher natural compliance than arbitrary formatting constraints.

2. **Degradation varies by task type.** The 39% degradation from Lost in Conversation is measured on benchmark tasks (math, logic, coding challenges) with deliberately underspecified multi-turn prompts. Kiro's tasks span a spectrum:
   - **Mechanical tasks** (read file, edit function, run command): likely much lower degradation — these are well-specified, single-step, and don't require judgment
   - **Judgment tasks** (project identification, scope decisions, when to ask vs. act): likely higher degradation — these require integrating multiple signals under ambiguity
   - **Meta-tasks** (friction review, self-monitoring): likely highest degradation — these require the model to evaluate its own prior outputs against rules, which compounds the multi-turn reliability problem

3. **No direct study of IDE-agent context.** The research covers general LLMs in conversation, tutoring, and benchmark settings. No paper studies the specific pattern of: system prompt + steering files + hooks + environment context + conversation history that characterizes IDE agents. The mechanisms are general, but the specific interaction effects in this architecture are inferred, not measured.

4. **Finding 5 (Prospective Memory) is under-sourced.** Only a search snippet was available for the arxiv paper. The concept is plausible and consistent with the other findings, but the specific claims about "dual-task interference" and "prompt salience" as mechanisms are not independently verified. This finding should be treated as a hypothesis that explains the observed pattern, not as established fact.

5. **The "65% of enterprise AI failures" claim** from the context engineering article lacks a primary source citation. It may be an industry estimate rather than a measured statistic. Treat as directional, not precise.

---

## Positional Analysis: Where Violated Rules Sit in Kiro's Context

The U-shaped attention curve predicts that content at the beginning and end of the context window receives the most attention, while middle content receives 30%+ less. Here's where Kiro's most-violated rules actually sit in the token stream:

### Approximate Token Position Map (per turn)

| Position | Content | Approx Tokens | Attention Zone |
|---|---|---|---|
| 0–2000 | System prompt (identity, rules, capabilities) | ~2000 | HIGH (beginning) |
| 2000–4000 | Platform guidelines, key features | ~2000 | HIGH→MEDIUM |
| 4000–12000 | Global steering files (8 files) | ~8000 | MEDIUM→LOW (middle) |
| 12000–14000 | Workspace steering files (2 files) | ~2000 | LOW (deep middle) |
| 14000–29000 | Friction log | ~15000 | LOW (deepest middle) |
| 29000–29500 | User's message | ~variable | MEDIUM→HIGH |
| 29500–30000 | Hook instructions (project ID, dev notes) | ~500 | HIGH (end, adjacent to user message) |
| 30000+ | Environment context (open files, active editor) | ~500 | HIGH (very end) |

### Correlation with Failure Frequency

| Rule | Location in Stream | Violations | Prediction Matches? |
|---|---|---|---|
| Project identification ("explicit name wins") | Hook instruction (~29500) | 5 | PARTIAL — positioned at end (high attention), but competes with environment context (also at end, also high attention). The conflict is between two high-attention signals, not a middle-position problem. |
| Bias-to-action ("low stakes = act silently") | Global steering (~6000) | 12 | YES — deep in the middle zone. Most-violated rule sits in lowest-attention position. |
| Circuit breaker ("2 attempts max") | Global steering (~8000) + Friction log (~20000) | 3 | YES — both instances are in the middle zone. |
| "Read before edit" | Global steering (~5000) | 0 violations logged | YES — early in the middle zone but reinforced by system prompt patterns. Also aligns with training distribution (models naturally read before acting). |
| Failed friction review | Hook instruction (~29500) | 3 | NO — positioned at end (high attention) but still fails. This suggests the failure isn't positional — it's a meta-cognitive task that's inherently harder regardless of position. |

### Key Insight

The positional analysis reveals two distinct failure mechanisms:

1. **Positional failures** (bias-to-action, circuit breaker): Rules in the middle zone that are simply under-attended. Fix: reposition to boundaries.

2. **Cognitive-load failures** (project identification, friction review): Rules at high-attention positions that still fail because they require integrating multiple competing signals or evaluating one's own output. Fix: reduce competing signals, not reposition.

This distinction means Recommendation 2 (reposition critical rules) will help for category 1 but not category 2. Category 2 needs Recommendation 1 (reduce total load) and structural changes to how competing signals are presented.

---

## Degradation by Task Type: A Refined Model

The flat "30% unreliability floor" oversimplifies. Based on the research mechanisms, here's a more nuanced prediction:

| Task Type | Expected Degradation | Dominant Mechanism | Mitigation Leverage |
|---|---|---|---|
| File read/edit (well-specified) | 5–10% | Minimal — single-step, clear target | Low (already reliable) |
| Tool selection | 10–15% | Mild positional bias on tool docs | Low |
| Project identification | 30–40% | Competing signals + prospective memory | HIGH — reduce competing signals |
| Scope/judgment decisions | 35–50% | Multi-constraint integration + answer bloat | HIGH — reduce concurrent constraints |
| Self-monitoring (friction review) | 50–60% | Meta-cognitive + alignment drift | MEDIUM — structural (checklist vs. open evaluation) |
| Multi-step planning | 25–35% | Lost-in-middle-turns + premature commitment | MEDIUM — consolidation per turn |

### Implication for Steering Architecture

The steering system should be designed differently for each task type:

- **Mechanical tasks:** Minimal steering needed. The model's training distribution handles these well. Don't add rules that create noise for tasks that are already reliable.
- **Judgment tasks:** Maximum 3 rules, positioned at boundaries, with examples rather than specifications. These are where the complexity cliff bites hardest.
- **Meta-tasks:** Replace open-ended evaluation ("review for friction") with structured checklists that reduce the cognitive load. Instead of "did anything go wrong?" → "check: did you act on the right project? did you ask when you should have acted? did a tool fail twice?"

---

## Transition Plan: Friction Log → Distilled Rules

### The Problem

The friction log at ~15,000 tokens serves two functions:
- (a) In-context reminder of failure patterns (for the model)
- (b) Historical record for steering refinement (for the human)

Function (a) is counterproductive at this size — the research shows the model can't reliably attend to 30+ entries. Function (b) is valuable but doesn't need to be in-context every turn.

### Proposed Architecture

**Replace with a two-tier system:**

**Tier 1: Active Rules (in-context every turn) — max 500 tokens**

A file called `critical-rules.md` positioned at the END of steering (high-attention zone), containing max 10 rules distilled from the friction log's most frequent patterns:

1. When user names a project → that's the project. Ignore open editor files.
2. When next step is obvious from handoff/context → state intent and act. Don't present options.
3. When a tool fails twice with the same error → switch approach immediately. Don't retry.
4. When removing a mechanism → preserve its effect through another means in the same change.
5. When fixing a running service you can access → restart is part of the fix, not a separate step.
6. When implementing from SESSION_HANDOFF notes → verify domain claims against research before implementing.
7. When dealing with platform-specific behavior → web search before implementing. Don't guess.
8. Before writing code that depends on a function's return value → read the return statement.
9. For interactive UI changes → enumerate all states (open/closed × dragging/not × adjacent states) before coding.
10. Meta-work (friction logging, steering updates) → max 2 turns per session. Start real work by turn 3.

**Tier 2: Full Friction Log (archived, human-readable, NOT in-context)**

The current friction log moves to a file that is NOT loaded every turn. It's referenced:
- During steering refinement sessions (manual inclusion)
- When a new pattern needs to be checked against history
- When updating the Tier 1 rules

### Promotion/Demotion Criteria

- **Promote to Tier 1:** Pattern occurs 3+ times in the friction log with the same root cause
- **Demote from Tier 1:** Rule hasn't been violated in 10+ sessions (it's been internalized or the context has changed)
- **Review cadence:** Every 5 work sessions or 2 weeks, whichever comes first

### Migration Steps

1. Create `critical-rules.md` with the 10 rules above
2. Move current `friction-log.md` to `friction-log-archive.md`
3. Create new `friction-log.md` that's empty (for new entries going forward)
4. Update steering inclusion: `critical-rules.md` = always, `friction-log-archive.md` = manual
5. After 5 sessions: review whether the distilled rules are reducing the documented patterns

---

## Updated Confidence Summary

**Verified (this addendum):**
- Positional analysis is based on actual Kiro context structure (observed this session)
- The distinction between positional failures and cognitive-load failures follows logically from the research + observed violation patterns
- The task-type degradation estimates are inferred from the research mechanisms (not directly measured)

**Inferred:**
- The 10 distilled rules are derived from frequency analysis of the friction log (30+ entries → 10 most common patterns)
- The two-tier architecture follows from the Context Engineering "Select" strategy (just-in-time loading)
- The promotion/demotion criteria are proposed heuristics, not empirically validated thresholds

**Unknown:**
- Whether reducing the friction log from context will actually reduce the over-calibration pattern (needs A/B testing across sessions)
- Whether the positional analysis holds for Kiro's specific model version (attention patterns may differ from the studied models)
- The optimal token budget for Tier 1 rules (500 tokens is a guess based on "10 rules × ~50 tokens each")
- Whether the structured checklist approach for meta-tasks (friction review) will outperform open-ended evaluation
