---
name: tests-pin-literal-prose
description: tests/run.js content contracts assert literal sentences inside rule docs and workflows, so rewording a step can fail a test the dev role may not edit
metadata:
  type: project
---

`tests/run.js` content-contract tests assert exact substrings of rule-doc and workflow prose (e.g. `asd-phase-impl.md` step 6 must contain `sequential where dependent; parallel where independent`, scoped by `initial mode only`). Rewording such a line fails the suite even when the new wording is correct.

**Why:** those literals encode a past regression's fix; the test is the only guard that a later edit does not silently undo it. `asd-dev` may never edit or weaken a test, so the test wins the tie.

**How to apply:** before rewording any workflow/rule sentence, grep `tests/run.js` for a distinctive phrase from the line. If it is pinned, build the new sentence *around* the pinned literal instead of replacing it, or escalate — never edit the assertion. Related: [[feedback_fix-the-class]].
