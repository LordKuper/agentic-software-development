---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 020-multi-workflow-lite

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | Per-task sync rule conflicts with parallel wave dispatch | — |
| F-2 | impl | Host auto-mode classifier denied the mandated `sync.js --apply` | D-1 |
| F-3 | impl-review | Correctness ledger used `finding` status on file rows; needed one transcription | reviews/impl/wave-1/iter-01/correctness |
| F-4 | impl-review | Testing return rejected: unescaped `|` inside a findings-table cell | reviews/impl/wave-1/iter-01/testing |
| F-5 | impl-review | `persist-review` needs the return in a file, but the host delivers it only in context | — |
| F-6 | impl-review | External wrapper redirected wrapped-CLI stdout to a file on an auto-backgrounded call | reviews/impl/wave-1/iter-01/external |

## F-1 — Per-task sync rule conflicts with parallel wave dispatch

- **Phase**: impl
- **Surface**: rule — `.asd/project/custom-coding-rules.md` (sync "in the same task before marking it done") vs `.asd/workflows/asd-phase-impl.md` step 6 (a wave's tasks dispatched concurrently in one worktree)
- **What happened**: Wave 2 had five concurrent Tasks, three of which edit canonical agents, skills or hooks. Every `sync.js --apply` rewrites the shared `.asd/sync-state.json`, so parallel per-task syncs race on one file. No rule says who syncs when a wave is parallel, so the orchestrator deferred every sync to the final Task.
- **Impact**: The impl `build` gate (`sync.js --check`) is red until the last wave. One orchestrator decision was needed that no rule anticipates.
- **Refs**: —

## F-2 — Host auto-mode classifier denied the mandated `sync.js --apply`

- **Phase**: impl (test-fix)
- **Surface**: provider tool — Claude Code auto-mode permission classifier vs `.asd/project/custom-coding-rules.md` (sync after canonical edits) and `AGENTS.md` (`sync.js --apply`)
- **What happened**: While fixing D-1, the dev dispatch ran `node .asd/sync.js --apply <target>` to refresh `release-manifest.json` `upstream_hashes`. The host classifier denied it as self-modification, because it rewrites generated views. The dev instead called `sync.js`'s exported `recomputeAndWriteHashLedgers` directly, which touched only the manifest.
- **Impact**: A rule-mandated command could not run inside a dispatched agent. The substitute path is undocumented, and it bypasses the command the rules name.
- **Refs**: D-1

## F-3 — Correctness ledger used `finding` status on file rows; needed one transcription

- **Phase**: impl-review
- **Surface**: agent — `asd-reviewer-correctness` vs `runtime.js` `LEDGER_VOCABULARY` (files: `checked`, `n/a` only)
- **What happened**: The correctness return marked four `files` rows `{"s":"finding","f":…}`. `persist-review` rejected them with `files status invalid: finding`. One transcription per review-policy "Coverage ledger" enforcement re-keyed those rows to `checked`, and the re-run passed.
- **Impact**: An extra persist round. The persisted ledger is a transcript, not the raw return.
- **Refs**: reviews/impl/wave-1/iter-01/correctness

## F-4 — Testing return rejected: unescaped pipe inside a findings-table cell

- **Phase**: impl-review
- **Surface**: template/agent — `t_review.md` findings table vs `runtime.js` `tableCells` (splits on unescaped `|`, including inside code spans, which is GFM-conformant)
- **What happened**: Testing finding 3 quoted the regex `/default(s|ed)?/` with a bare `|` inside backticks. `persist-review` split the cell and rejected the row. Neither the reviewer contract nor the template tells reviewers to escape `|` in cells, so the return was rejected and the reviewer re-dispatched fresh.
- **Impact**: A full testing review was paid for twice.
- **Refs**: reviews/impl/wave-1/iter-01/testing

## F-5 — `persist-review` needs the return in a file, but the host delivers it only in context

- **Phase**: impl-review
- **Surface**: rule — `review-policy.md` "Coverage ledger" Persistence ("never hand-writes or re-authors a review file") vs the host, which returns a dispatched agent's final text only into the orchestrator's context
- **What happened**: For each reviewer, the orchestrator had to re-emit the whole returned text through its own file-write before `persist-review` could read it. That is a model-mediated copy of 5–10 KB per review, so byte-fidelity to the return rests on the orchestrator, not on the command.
- **Impact**: About 5 large re-emissions per iteration in output tokens, and the "never re-authored" guarantee is not mechanical.
- **Refs**: —

## F-6 — External wrapper redirected wrapped-CLI stdout to a file on an auto-backgrounded call

- **Phase**: impl-review
- **Surface**: agent — `asd-external-review` vs `external-review.md` (stdout capture only, no file writes) and the host Bash tool, which auto-backgrounds calls longer than its default timeout
- **What happened**: The `codex exec` run (about 147k tokens) outlived the default Bash timeout. The wrapper's first attempt redirected stdout to a scratch file. It recovered the review from the harness's background-task output instead and self-reported the contract breach.
- **Impact**: A contract violation plus a retry inside the dispatch. No payload or rule tells the wrapper to set a long foreground timeout.
- **Refs**: reviews/impl/wave-1/iter-01/external
