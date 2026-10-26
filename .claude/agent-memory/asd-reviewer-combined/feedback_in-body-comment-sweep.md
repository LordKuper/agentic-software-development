---
name: in-body-comment-sweep
description: Sweep every added JS line for a // comment inside a function body; the Quality rubric rates it high, not a nitpick
metadata:
  type: feedback
---

On every diff that touches Node source (`.asd/*.js`, migrations, hooks, `tests/run.js`), check each added `//` line and decide whether it sits inside a function body. Any in-body comment except a `// TODO(sprint-<slug>): <reason>` marker is a finding. The Quality rubric entry "In-code doc comments" rates it `high`, so it survives a high floor.

**Why:** a review-fix that adds a rationale comment (for example, explaining a lazy `require`) slips past a reviewer who treats comments as style. The fix is to move the reason into the member's JSDoc, where a WHY clause is allowed.
**How to apply:** use Grep `-n` on the diff for `^\+\s+//`, then open each hit's function. Comment banners and JSDoc at top level are fine. Related: [[feedback_doc-economy-pinned-clauses]].
