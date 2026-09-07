---
name: testability-envelope
description: What is and is not testable in the ASD framework repo, and the two accepted test patterns for its mostly-documentation change surfaces
metadata:
  type: project
---

In this repo (ASD framework source), almost every change is Markdown/YAML/JSON/HTML. `tests/run.js`
is the only runner and there is deliberately no documentation-content harness. Two patterns are the
accepted answer for a mostly-docs change surface:

1. **Explicit `none` decisions** in `test-plan.md` for prose/rule/template edits — first-class per
   `code-style.md` §17, not a gap. Building a doc-content test framework is an over-engineering
   finding, and a new test dependency trips the Simplicity Default.
2. **Static canon-consistency assertions inside `tests/run.js`** where a machine-checkable invariant
   exists across files (derive the value from its SSoT, assert every mirror). Precedents in-file:
   the retired-`asd-pm` canon scan, `upstream_hashes`/`canon_hashes` checks, and (added sprint 007)
   the `PHASE_CHAIN` ↔ skill/workflow bijection + ordered prose mirrors.

**Why:** the repo ships no application code, so the naive reading is "nothing is testable"; the real
line is executable Node (`sync.js`, `update.js`, `.asd/migrations/**`, `.asd/runtime.js`,
`.asd/hooks/**`) plus cross-file invariants that a regex can derive. Sprint 007's audit logged both
gaps that pattern 2 closes (G-11 chain mirrors, G-12 forward-only manifest check).

**How to apply:** during the strategy pass, split the change surface into executable vs prose. Give
executable changes real unit tests; give prose changes a `none` with its reason, unless the prose
encodes an ordered/enumerable invariant that mirrors an SSoT — then pattern 2 applies.

Two traps when proving these by mutation:
- A purely defensive guard may be unmutatable (e.g. `6.0.0.js`'s `ARCHIVE_DIR` skip is a no-op
  because the sprint listing is already non-recursive). Record the limitation instead of claiming
  a proof that did not happen.
- Any mutation of a file under `managed_paths` also fails the `upstream_hashes` test; that extra
  FAIL is expected noise, not signal — look for your own test's name in the output.
