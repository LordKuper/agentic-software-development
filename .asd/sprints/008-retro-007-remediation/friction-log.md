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
| F-6 | impl-review | A reviewer declared read-only wrote a file, because its agent definition grants Write | — |
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
- **Surface**: agent — `.asd/agents/asd-reviewer-testing.md`; rule — `.asd/rules/providers.md` reviewer read-only contract
- **What happened**: The Testing reviewer wrote `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md` during its dispatch. Both `asd-phase-impl-review.md` ("Reviewers stay read-only") and `review-policy.md` ("Reviewers are read-only: a reviewer never writes its own review file") state the reviewer cannot write, and the workflow relies on that guarantee to justify writing review files itself — but the reviewer agent definitions grant the `Write` tool, so the guarantee is prose, not a host guarantee. The file was left uncommitted and would have tripped the next phase's clean-worktree precondition.
- **Impact**: None this sprint beyond one ownerless file. The concern is the standing claim: `review-policy.md` says reviewers "cannot write at all, by host guarantee", and that is currently false.
- **Root shape**: the read-only property is asserted in three rule/workflow files and contradicted by the tool grant in four agent definitions. Nothing checks the two against each other, and the reviewer needed `Write` for memory while the rules meant it for review artefacts — one tool grant serving two purposes the rules distinguish.
- **Refs**: F-3
