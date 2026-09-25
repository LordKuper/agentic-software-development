---
name: reviewer-write-scope-declaration
description: Resolved shape (sprint 010 iter-05, updated sprint 019 AC-14) of review-policy.md "Gate Verdict Format"'s sole-statement declaration — bounded to canon, agent memory excluded, reviewer memory changed only via memory-fix dispatch; which restating sites are authorized and must not be re-raised
metadata:
  type: project
---

`review-policy.md` "Gate Verdict Format" owns the reviewer read-only reconciliation: what the
read-only claim covers and how a reviewer's memory is written. Since sprint 019 AC-14 a reviewer
writes no memory either. `memory: project` only loads it, the host gives a reviewer no write tool,
and any change goes through the memory-fix dispatch (`review-policy.md` "Autofix vs escalation").
Since sprint 010 iter-05 the declaration is **bounded to canon** and names hand-authored agent memory
as outside its reach (`artifact-layout.md` "Agent memory"). These sites legitimately restate or scope
it and are non-contradicting at sprint 019 HEAD. Do not raise them as SSoT duplication:

- `.claude/agent-memory/**`: outside canon by the declaration's own exclusion, so a memory file may
  restate it. A real finding there routes to the memory's owner through the memory-fix dispatch. A
  non-owner never authors memory text.
- `README.md`: a user-facing mirror with no canonical source under `.asd/`. It cites
  `review-policy.md` for scope and names the memory-fix dispatch. The AGENTS.md cross-file list
  authorizes it as a roster mirror.
- `.asd/agents/asd-external-review.md` tool policy: its "no file writes at all" is a separate,
  transport-level rule for the review itself. The same bullet says `memory: project` only loads its
  memory and sends a change through the memory-fix dispatch. It points at "Autofix vs escalation" and
  cites "Gate Verdict Format" for scope, so it is not a second statement of the reviewer-class scope.
  External Review's `Bash` runs only the wrapped CLI and gives it no memory carve-out.
- `providers.md` "Reviewer agents carry no artifact-write grant…": owns only the tool-grant fact and
  cites Gate Verdict Format for what the read-only claim covers, including the reviewer's own memory
  directory. A test checks that citation and checks that the file holds no copy of the MEMORY-FIX
  contract.

**Why:** SSoT findings use this declaration as their premise, so a false declaration is a trap. Iters 03
and 04 each disproved an earlier, wider version of it (first the workflows, then a reviewer's own
memory file). The accepted fix is to narrow the declaration, not to delete the acting sites
(`asd-dev-critical`'s `feedback_false-ssot-declarations.md`).

**How to apply:** before flagging a restatement of reviewer write scope, check whether the site is canon
(`.asd/**`). Also check whether it states the *class-level* scope or only the write it performs itself.
Leftover imprecision at a non-canon site is below critical at most. `tests/run.js` AC-15 checks the
substance, not the "in canon" wording, so a correct rewording stays green. It checks the agent-memory
carve-out plus the `artifact-layout.md` pointer, the memory-fix dispatch plus the "Autofix vs escalation"
pointer, and `claude.memory === 'project'` on the external agent. The sprint 019 AC-14/AC-16 sweep
fails on any canon, README or agent-memory line that still calls reviewer memory a write path. See
[[no-shell-doc-review-method]] and [[external-review-prompt-duplication]].
