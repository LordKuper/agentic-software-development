---
name: tests-pin-literal-prose
description: tests/run.js pins both literal rule-doc sentences and exact runtime output shapes, so a reworded step or a new manifest field fails a test the dev role may not edit
metadata:
  type: project
---

`tests/run.js` content-contract tests assert exact substrings of rule-doc and workflow prose (e.g. `asd-phase-impl.md` step 6 must contain `sequential where dependent; parallel where independent`, scoped by `initial mode only`). Rewording such a line fails the suite even when the new wording is correct.

**Why:** those literals encode a past regression's fix; the test is the only guard that a later edit does not silently undo it. `asd-dev` may never edit or weaken a test, so the test wins the tie.

**How to apply:** before rewording any workflow/rule sentence, grep `tests/run.js` for a distinctive phrase from the line. If it is pinned, build the new sentence *around* the pinned literal instead of replacing it, or escalate — never edit the assertion. Related: [[feedback_fix-the-class]].

**Second class, not workaroundable — pinned output shapes.** The same suite also pins the exact *shape* runtime code emits, not just prose: the `manifest-digest --write` test recomputes the expected digest from a hand-written field set (`{...manifest, vocabulary}`), so any AC that adds a stamped manifest field fails it by construction while its neighbouring invariants (digest = hash of what was written, round-trip, idempotence) still pass. No rewording dodges it. Grep `runtime.` in `tests/run.js` before changing anything a manifest carries; when the collision is unavoidable, implement the spec, leave the test red, and hand impl-test the exact superseded assertion (file:line, what it enumerates, what replaces it) — the sprint plan's DoD is a green suite at the *last* task, not every task.
