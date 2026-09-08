---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 008-retro-007-remediation

<!--
Lifecycle, what qualifies, what never does, the F-N id scheme and who appends:
.asd/rules/sprint-lifecycle.md "Friction log" — normative there, not restated here.
Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | impl | A dispatched dev staged the whole worktree, sweeping a concurrently running dev's in-progress edit into its own commit | — |
| F-3 | impl | A dispatched agent authored its own memory files and left them uncommitted, blocking the next phase gate | F-1 |
| F-4 | impl-review | All five reviewer dispatches of one iteration were lost at once to a session rate limit | — |
| F-5 | impl-review | A reviewer returned a substantively complete ledger using status words the validator rejects | — |
| F-6 | impl-review | A reviewer declared read-only wrote a file through the memory channel the read-only claim does not cover | — |
| F-7 | impl | A scripted edit anchored on a bare newline left a lone CR and turned two-line edits into whole-file rewrites | — |
| F-8 | impl-review | The External Review dispatch returned without a verdict, waiting on a background process | F-4 |
| F-2 | scope | Three of fourteen acceptance criteria were written against a stale premise and only the audit caught it | — |

## F-1 — A dispatched dev staged the whole worktree, sweeping a concurrent dev's edit into its own commit

- **Phase**: impl
- **Surface**: rule — `.asd/rules/git-strategy.md` "Commits"; workflow — `.asd/workflows/asd-phase-impl.md` step 6 dispatch payload
- **What happened**: Tasks 2, 6 and 9 were dispatched in parallel onto one shared worktree, each instructed to commit its own work. The Task 6 dev staged broadly rather than staging only the paths it had edited, so Task 9's in-progress `.asd/runtime.js` change was committed under Task 6's commit `1677d2a` before its own author could stage it. Task 9's remaining seven files landed separately in `44ba8c5`. Nothing was lost and no history was rewritten, but one commit's message does not describe its contents.
- **Impact**: Two commits misattribute their changes, so the sprint's own commit history is a misleading input for the reviewer's per-commit reasoning and for the `pr` phase's self-review checklist item "can explain every changed line". Nothing had to be redone.
- **Root shape**: the workflow dispatches independent tasks in parallel onto one worktree and asks each to commit, but no rule states that a dispatched agent stages only the paths it authored. `git-strategy.md` gained the orchestrator-bookkeeping half of this rule during this very sprint (Task 8, AC-9); the agent-to-agent half is the gap this entry records.
- **Refs**: —

## F-2 — Three acceptance criteria were written against a stale premise

- **Phase**: scope
- **Surface**: rule — `.asd/rules/sprint-lifecycle.md` "Retro phase" / `.asd/templates/t_retrospective.html`
- **What happened**: The sprint 007 retrospective's Actions table drove this sprint's AC list. Three of its rows had already been resolved at HEAD by the time the sprint started: `sync.js` had failed closed on an unmatched `--apply` target since v4.0.0 (AC-4), `tests/run.js` already asserted that behaviour twice (AC-13), and one named wording target contained no such wording (AC-5's `t_AGENTS.md`). The audit phase caught all three, but only after they had been written into `sprint.md` and accepted at the scope gate, which then required a hard gate to revise.
- **Impact**: One extra hard gate and one scope revision. Had the audit not caught it, the impl phase would have re-implemented a working fail-closed path and added a third assertion of an already-doubly-asserted behaviour.
- **Root shape**: a retrospective's recommendations are written against the HEAD of the sprint that produced them and carry no recorded verification that they are still unresolved when a later sprint picks them up. F-4's root cause in that retrospective was itself derived from a stale agent-memory note rather than from the current source.
- **Refs**: —

## F-3 — A dispatched agent authored its own memory files and left them uncommitted

- **Phase**: impl (review-fix mode)
- **Surface**: rule — `.asd/rules/git-strategy.md` "Commit before review"
- **What happened**: Three dev agents wrote to `.claude/agent-memory/asd-dev-critical/` during the review-fix round and left the files unstaged, each explicitly declining to stage them because a sibling had the same directory modified concurrently. The orchestrator found them dirty at the impl completion gate and had to commit files it did not author — the exact act the rule added this sprint (AC-9) forbids in the other direction.
- **Impact**: One extra orchestrator commit of agent-authored content, and a near-miss on impl-review's clean-worktree precondition, which would have refused entry.
- **Root shape**: AC-9 assigns orchestrator-owned bookkeeping to the orchestrator and forbids an agent committing what it did not author. Neither half covers the converse — an agent that authored a file and did not commit it. Under parallel dispatch onto one worktree, agents correctly avoid a directory another agent is also writing, so the files reliably end up ownerless. Same root as F-1: parallel dispatch onto a shared worktree has no staging-ownership rule.
- **Refs**: F-1

## F-4 — All five reviewer dispatches of one iteration were lost at once to a session rate limit

- **Phase**: impl-review (iteration 2)
- **Surface**: provider tool — the host session rate limit; rule — `.asd/rules/review-policy.md` "Interrupted dispatch and split dispatch"
- **What happened**: All five reviewers were dispatched in parallel for iteration 2 and every one of them died mid-run on a single session-wide rate limit, each having read its inputs and produced nothing. The contract this sprint wrote for exactly this case applied cleanly: no verdict recorded, no latch, the interruption logged to `decisions-log.md` at the moment it happened, and each reviewer re-dispatched fresh on the same manifest digest.
- **Impact**: One full parallel review round of work discarded and repeated. No artefact was corrupted and no gate was bypassed, because the contract had a defined outcome for it.
- **Root shape**: the contract treats interruption as a per-reviewer event, but the actual failure mode here was correlated — a session-wide limit takes every concurrent dispatch at once. The split trigger counts consecutive interruptions per reviewer per digest, so a repeated correlated failure escalates five separate reviewers independently rather than being recognised as one condition. Worth noting for the retro: sprint 007 lost dispatches to the same class of limit (F-6), and this sprint fixed the record-keeping without addressing the correlation.
- **Refs**: —

## F-5 — A reviewer returned a substantively complete ledger using status words the validator rejects

- **Phase**: impl-review (iteration 2)
- **Surface**: rule — `.asd/rules/review-policy.md` "Coverage ledger"; runtime — `.asd/runtime.js` `rowsById`
- **What happened**: The Testing reviewer returned four well-evidenced findings and a ledger covering every scoped file, rule and section — but wrote `finding` as a *file* row status (files accept only `checked`/`n/a`) and `covered` as a *rule* row status (rules accept only `pass`/`finding`/`n/a`). `validate-ledger` rejected it with `files status invalid: finding`, so by contract the verdict does not count and the reviewer is re-dispatched fresh.
- **Impact**: A complete review discarded and repeated over a vocabulary slip, not a coverage gap. The findings themselves were sound and three of them converged with other reviewers.
- **Root shape**: the per-row-type status vocabulary is stated once, in one sentence of `review-policy.md` prose, and nowhere in the machine artefact the reviewer is handed. The dispatcher supplies a manifest listing every id but nothing about which statuses each row type accepts, so the reviewer has to recall the sentence rather than read it off its own input. The validator knows the vocabulary; the manifest could carry it.
- **Refs**: —

## F-6 — A reviewer declared read-only wrote a file, because its agent definition grants Write

- **Phase**: impl-review (iteration 2)
- **Surface**: rule — `.asd/rules/review-policy.md` "Enforcement" / `providers.md` reviewer read-only contract; agent config — the `memory: project` grant in every reviewer definition
- **What happened**: The Testing reviewer produced `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md` during its dispatch and left it uncommitted, where it would have tripped the next phase's clean-worktree precondition. `review-policy.md` states reviewers "cannot write at all, by host guarantee", and both review workflows rely on that to justify writing review files themselves.
- **Impact**: None this sprint beyond one ownerless file, committed by the orchestrator. The concern is the standing claim.
- **Root shape**: the tool grant is **not** the contradiction — canon and the generated view both give reviewers `Read`/`Glob`/`Grep`/`AskUserQuestion` and explicitly disallow `Edit`/`Bash`, with `sandbox_mode: read-only` on the Codex side. The write channel is `memory: project`, a separate host capability every reviewer definition grants. So "cannot write at all, by host guarantee" is false as an absolute while being true of the tool surface it was written about: reviewers cannot write **artifacts**, but can write **memory**, and the rule does not distinguish the two. A reviewer's memory is also loaded on its every later dispatch, which is what iteration 3 then found (three false durable statements in that same file), so the unaccounted channel is not merely a bookkeeping gap.
- **Refs**: F-3

## F-7 — A scripted edit anchored on a bare newline left a lone CR, turning two-line edits into whole-file rewrites

- **Phase**: impl (review-fix mode, iteration 3)
- **Surface**: rule — .asd/rules/code-style.md; the repo has CRLF-normalized canon on Windows and no rule about editing it programmatically
- **What happened**: A dev applying a two-line deletion to two workflow files used a scripted replacement anchored on a bare newline. Because the files are CRLF on disk, the anchor matched mid-sequence and left a lone carriage return, which suppressed git CRLF normalization and rendered both edits as whole-file rewrites in the diff. Caught by git diff --check before staging and fixed; the dev recorded it as durable memory.
- **Impact**: None shipped — the guard caught it. Without that check the round would have produced two whole-file diffs, which would have made the review diff unreadable and the iteration scope meaningless.
- **Root shape**: canon on this platform is CRLF, agents edit it with newline-anchored scripted replacements by default, and nothing in the rules says so. The lint command (git diff --check) happens to catch the symptom, but only if the agent runs it before staging, and it reports it as a whitespace error rather than as the encoding hazard it is.
- **Refs**: —

## F-8 — The External Review dispatch returned without a verdict, waiting on a background process

- **Phase**: impl-review (iteration 5)
- **Surface**: agent — .asd/agents/asd-external-review.md; the wrapped-CLI invocation path
- **What happened**: The dispatch ran for some minutes, then returned a single sentence about waiting for a background process to notify completion. No verdict token, no report, no availability skip. The interrupted-dispatch contract handled it cleanly — no verdict recorded, no latch, re-dispatched fresh in the same iteration — but the cause is that the wrapper started long-running work in a mode where its own completion notification never reached it.
- **Impact**: One external review round repeated. The internal verdicts were already in, so nothing else was blocked.
- **Root shape**: the external reviewer wraps another provider CLI whose run can outlast the wrapping dispatch. This sprint saw the wrapper lose a round to a session rate limit (F-4), twice to a provider quota, and now once to its own background-wait pattern. Three distinct failure modes, one shared consequence: at the iterations where a second opinion is most useful, the external check is the least likely to produce one.
- **Refs**: F-4
