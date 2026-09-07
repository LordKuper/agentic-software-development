---
name: external-review-prompt-duplication
description: Accepted SSoT precedent — t_prompt-external-{impl,design}.md may restate exclude_paths semantics that live in external-review.md; do not raise it as a duplication finding
metadata:
  type: project
---

The `exclude_paths[]` scope-vs-readability rule has its single home in `.asd/rules/external-review.md` § Phase-scoped payload. The two external-review prompt templates restate it verbatim-in-substance; the agent file (`.asd/agents/asd-external-review.md`) states a compressed variant plus a citation. This is accepted, not an SSoT violation.

**Why:** the prompt templates are runtime payload piped over stdin into the *other* provider's CLI, which receives only that text — a link to a rule doc is not a reliable instruction carrier for an external process. Sprint 006 iter-04 reviewed this arrangement deliberately after an earlier iteration flagged contradictory paraphrases (the defect was contradiction, not duplication).

**How to apply:** in a documentation review, treat drift/contradiction between the four sites as the finding, never the duplication itself. `tests/run.js` pins the exact carve-out sentence in the rule doc and both prompts (test `AC-2/4/6/7: exclude_paths[] scope-vs-readability distinction ...`); the agent-file variant is the only unpinned site, so check it by hand.
