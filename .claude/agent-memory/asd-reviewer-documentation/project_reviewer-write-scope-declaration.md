---
name: reviewer-write-scope-declaration
description: Resolved shape (sprint 010 iter-05) of review-policy.md "Gate Verdict Format"'s sole-statement declaration — bounded to canon, agent memory excluded; which restating sites are authorized and must not be re-raised
metadata:
  type: project
---

`review-policy.md` "Gate Verdict Format" owns the reviewer read-only reconciliation: what the
artifact-write claim covers plus the one `memory: project` channel it excludes. Since sprint 010
iter-05 the declaration is **bounded to canon** and names hand-authored agent memory as outside its
reach (`artifact-layout.md` "Agent memory"). Sites that legitimately restate or scope it, all verified
true and non-contradicting at that HEAD — do not raise as SSoT duplication:

- `.claude/agent-memory/**` — outside canon by the declaration's own exclusion; a memory file may
  restate both halves. Never fix such a finding by editing another agent's memory directory.
- `README.md` — user-facing mirror, no canonical source under `.asd/`, and it cites
  `review-policy.md` for scope; the AGENTS.md cross-file list authorizes it as a roster mirror.
- `.asd/agents/asd-external-review.md` tool policy — its blanket "no file writes at all" is a
  *different, transport-level* rule, and its carve-out scopes that rule to its own memory directory
  while handing governance to `artifact-layout.md`. Not a second statement of the reviewer-class scope.
- `providers.md` "Reviewer agents carry no artifact-write grant…" — owns the tool-grant fact only and
  cites Gate Verdict Format for the reconciliation; a test pins that it does not restate the sentence.

**Why:** the declaration is used as the premise of SSoT findings, so a false one is a trap; iters 03
and 04 each falsified an earlier, wider version of it (workflows, then a reviewer's own memory file).
Bounding it, not deleting the acting sites, is the accepted fix shape (`asd-dev-critical`'s
`feedback_false-ssot-declarations.md`).

**How to apply:** before flagging a restatement of reviewer write scope, ask whether the site is canon
(`.asd/**`) and whether it states the *class-level* scope or only the write it itself performs. Residual
imprecisions at non-canon sites are sub-critical at best. `tests/run.js` AC-15 pins the substance
(carve-out + pointer, plus `claude.memory === 'project'` on the external agent), deliberately NOT the
"in canon" wording — a correct rewording must stay green. See [[no-shell-doc-review-method]] and
[[external-review-prompt-duplication]].
