---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 009-retro-008-remediation

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — normative there, not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Five parallel devs in one worktree each had to invent a pathspec-commit workaround; the rule fixing this was being authored in the same wave | — |
| F-2 | impl | `git add --renormalize .` swept three siblings' in-progress edits into one dev's index | — |
| F-3 | impl | An agent-memory file was co-authored by two concurrent devs and left committable by neither | — |
| F-5 | impl | A session limit killed a tester mid-mutation, leaving a canonical rule file mutated on disk with no restore | — |
| F-6 | impl-review | A reviewer returned a semantically complete coverage ledger in the wrong shape; the rule permits only reject-and-re-dispatch | reviews/impl/iter-05/documentation |
| F-4 | impl-review | External review unavailable for the third consecutive sprint, at the iteration where a second opinion carried the most value | reviews/impl/iter-01/external |

## F-1 — every parallel dev independently invented the same commit workaround

- **Phase**: impl (initial mode, wave 1: Tasks 1, 2, 8, 9, 10)
- **Surface**: workflow — `.asd/workflows/asd-phase-impl.md` step 6 dispatch payload; rule — `.asd/rules/git-strategy.md` "Commit before review"
- **What happened**: five devs were dispatched concurrently into one shared worktree. Each found the shared index already carrying siblings' staged paths at commit time, and each independently reinvented the same escape — `git commit --only <path>` or `git commit -- <paths>` — after the dispatch payload told it only to "commit per Conventional Commits". The staging-ownership sentence that makes this deterministic was itself Task 1 of this same wave, so the wave that proved the need ran without it.
- **Impact**: no wrong commit landed, but the workaround cost each of five dispatches its own discovery pass, and the safety depended on every agent noticing the shared index unprompted. `AC-1` and `AC-2` are the fix; this entry records that the class recurred a third consecutive sprint (008 `F-1`, `F-3`) while being remediated.
- **Refs**: —

## F-2 — a renormalization command staged three siblings' work

- **Phase**: impl (initial mode, Task 10)
- **Surface**: workflow — `.asd/workflows/asd-phase-impl.md` step 6; rule — `.asd/rules/git-strategy.md`
- **What happened**: verifying the `.gitattributes` premise legitimately requires `git add --renormalize .`, a whole-tree command with no path-scoped form that answers the same question. It staged `.asd/agents/asd-dev.md`, `.asd/rules/git-strategy.md` and the sprint's `state.json` — all mid-edit by siblings — and the dev had to detect and `git restore --staged` them before committing.
- **Impact**: caught and reverted by the dev, so nothing shipped wrong. It shows the staging-ownership rule alone is not sufficient: some verification commands are inherently whole-tree, and a parallel wave gives them no safe moment to run.
- **Refs**: —

## F-3 — reviewer- and dev-authored agent memory has no owner under parallel dispatch

- **Phase**: impl (initial mode, wave 1)
- **Surface**: rule — `.asd/rules/artifact-layout.md` "Agent memory", `.asd/rules/review-policy.md` "Change-surface rule"
- **What happened**: two concurrently dispatched devs both appended to `.claude/agent-memory/asd-dev-critical/project_parallel-agent-commit-sweep.md`. Neither could commit it without carrying the other's in-flight edit, so both left it uncommitted; it therefore reaches no reviewed diff. This is the exact ownerless-memory case `AC-13b` assigns an owner to, observed live while that AC was being implemented.
- **Impact**: one source file authored this sprint sits outside every reviewer's change surface unless the orchestrator commits it. Recorded so retro can judge whether `AC-13b`'s fix (the phase workflow commits a reviewer's memory writes) covers the dev-authored, multi-writer case too — it currently does not.
- **Refs**: —

## F-4 — external review unavailable a third consecutive sprint

- **Phase**: impl-review (iteration 1)
- **Surface**: provider tool — wrapped Codex CLI via `.asd/agents/asd-external-review.md`; rule — `.asd/rules/external-review.md` "Detection and negative cache"
- **What happened**: the first dispatch was lost to a session-wide usage limit before returning (recorded as interrupted attempt 1 in `decisions-log.md`). The fresh re-dispatch reached the wrapped CLI, which returned an active quota error on both the review pass and the one permitted retry, so the wrapper returned the availability skip. Preflight had reported `local-ready` — correctly, since local readiness is defined to predict only executable and local auth, never paid-request success.
- **Impact**: the sprint's DoD counts External Review as an independent check, and it has now been absent in the iteration where it was most useful in three consecutive sprints (007, 008, 009). Iteration 1 was judged by internal reviewers alone. Note the machinery behaved exactly as `AC-8` specified: the outcome contract this sprint added is what turned a would-be empty return into a recorded skip, and the availability-skip carve-out kept External Review unlatched so it is re-dispatched next iteration.
- **Refs**: reviews/impl/iter-01/external

## F-5 — an interrupted mutation proof left canonical source corrupted

- **Phase**: impl (review-fix `iter-04`, tester chain)
- **Surface**: rule — `.asd/rules/code-style.md` §17 fail-first proof obligation; workflow — `.asd/workflows/asd-phase-impl.md` fix-mode dispatch
- **What happened**: proving a new assertion fails first requires mutating the file it guards and restoring it byte-for-byte afterwards. A session-wide usage limit killed the tester between those two steps, so `.asd/rules/external-review.md` was left carrying the mutation — "imported here for the 4 internal reviewers" in place of "imported here whole", which is precisely the `DOC4-1` defect the dev chain had just fixed. **Corrected after the re-dispatch measured it**: the suite was *red* (169/171) in that state, not green — the assertion added against the mutation is its own tripwire, and the re-dispatched tester reproduced the exact byte state to confirm it. The orchestrator's first reading of this entry assumed green without measuring.
- **Impact**: the orchestrator caught the mutation by reading the diff before re-dispatching, and restored the file; nothing was committed. The real exposure is narrower than first recorded but still real: a fix round committed without its diff being read would have shipped a re-narrowed contract, and the red suite would have been attributed to unfinished work rather than to a corrupted rule file. The mutate-and-restore obligation has no crash safety: no rule says a mutation must be restored before any other work, or that a fix round ends with a diff of canonical files the agent was not authorised to touch.
- **Refs**: —

## F-6 — a conforming-content, non-conforming-shape ledger has no cheap path

- **Phase**: impl-review (iteration 5)
- **Surface**: rule — `.asd/rules/review-policy.md` "Coverage ledger" enforcement paragraph
- **What happened**: the documentation reviewer returned a coverage ledger that resolved every row — 9 files, 10 rules, 9 sections, each with its status and authorized `n/a` predicate — but shaped as maps rather than the `{i,s,p,f}` row arrays the manifest's own `vocabulary` field mandates. The rule offers exactly one response: reject and re-dispatch the reviewer fresh, its verdict never counting. That would have spent a full critical-tier agent run to re-obtain evidence already present and verifiable, on an APPROVE at the critical floor.
- **Impact**: the phase workflow transcribed the returned content into the mandated shape instead — every identity, status and predicate preserved, nothing added — and `validate-ledger` accepted it. That is a deliberate deviation from the enforcement paragraph, recorded here and in `decisions-log.md` rather than hidden. The gap is that the rule treats "incomplete evidence" and "correct evidence, wrong container" as the same failure, when only the first is a reason to distrust the verdict. Retro should decide whether a transcription clause belongs in the rule, or whether the manifest should carry a shape example the way it now carries the vocabulary.
- **Refs**: reviews/impl/iter-05/documentation
