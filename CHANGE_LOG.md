# Erinyes (Hair App) — Requested Changes

Changes to make after the current spec work is complete. Add items as they come up.

## Format

```
### [Short title]
- **Priority:** high / medium / low
- **Area:** [UI, logic, data, content, etc.]
- **Description:** What should change and why
```

---

## Changes

<!-- Add new entries below this line -->

### Hair photo upload with image recognition
- **Priority:** high
- **Area:** feature / AI integration
- **Description:** Add ability to upload hair photos for review and input. Big-picture vision: image recognition analyzes the photo to inform routine suggestions (e.g., detecting frizz, curl pattern, damage). This is a major new capability — will need its own spec when we get to it.

### Condense the "last done" status display
- **Priority:** medium
- **Area:** UI / landing screen
- **Description:** The rundown of when things were last done (days since wash, clarify, etc.) is useful but takes up too much space. Condense it — tighter layout, fewer words, same information density.

### Auto-detect humidity instead of manual input + show on landing
- **Priority:** high
- **Area:** logic / UI
- **Description:** Two related changes: (1) The curly day walkthrough currently asks the user to select humidity — it should auto-detect using a weather API or device location instead. (2) Show current humidity/dew point on the landing screen as ambient information so it's visible before starting any walkthrough.

