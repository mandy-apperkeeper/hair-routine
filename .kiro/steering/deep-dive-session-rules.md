---
inclusion: auto
fileMatchPattern: "research/products/*"
---

# Deep Dive Session Rules

## Context Budget Management

Product deep dives are large documents (~500-600 lines). A single session can produce 1-2 deep dives maximum. Plan accordingly:

1. **Serialize, don't parallelize.** Research product A → write product A → then move to product B. Never research multiple products before writing any.

2. **Write in chunks.** Use fsWrite for the first ~50 lines (header through Executive Summary), then fsAppend for each subsequent section. Never attempt to write a 500+ line file in a single tool call.

3. **Orientation budget: 2 turns max.** Read the queue file + one existing deep dive for template reference. Do NOT re-read protocol files if the format is already established from prior sessions.

4. **Research budget: 3-4 searches per product.** INCI verification (1-2 sources), mechanism research (1-2 key ingredients), pricing (1 source). Don't over-verify — if the search snippet confirms the INCI, you don't need to fetch the full page.

5. **If research notes already exist** (files named `*_RESEARCH_NOTES.md`), skip all web research and go straight to writing the document from those notes.

## Tool Failure Rule

If fsWrite or any tool fails twice with the same error, immediately switch approach:
- Try writing in smaller chunks (fsWrite header, fsAppend body)
- Try shell echo/redirect as fallback
- If all file writing fails, delegate to a sub-agent

Never retry the same failing approach more than twice.

## Session Planning

At session start, if the task is "product deep dives":
1. Check how many products are queued
2. Commit to completing 1-2 documents this session (not more)
3. State which products you'll cover and in what order
4. Start writing immediately after minimal research
