---
responsibility:
  owns: per-sprint log of workflow friction — a rule, phase, gate, agent, skill, template or provider tool that malfunctioned or could not be followed
  excludes: code defects (test-plan.md D-N), artifact-quality findings and verdicts (reviews/), human operational actions (manual-steps.md MS-N), decisions taken (decisions-log.md)
  delegates_to: test-plan.md (defects), reviews/ (verdicts), manual-steps.md (manual actions), decisions-log.md (decisions), retrospective.html (analysis and recommendations)
---

# Friction log — sprint 007-retrospective-phase

<!--
Created lazily on the first entry. Append-only: never edit, reorder or renumber an existing entry.
What qualifies, what never does, the F-N id scheme and who appends: .asd/rules/sprint-lifecycle.md
"Friction log" — normative there, not restated here. Entry content is language.docs.
Consumed by the retro phase (.asd/rules/sprint-lifecycle.md "Retro phase").
-->

## Summary

| ID | Phase | Problem | Refs |
|---|---|---|---|
| F-1 | audit | Audit agent exhausted its turn budget and returned no usable output; the whole dispatch was wasted | — |
| F-2 | audit | Heredoc write of a large artifact failed in the shell tool, costing a retry through a different tool | — |
| F-3 | impl | Dev agent wrote its agent memory inside the sprint folder, leaving an untracked path that would block the impl-review clean-worktree precondition | — |
| F-4 | impl | `AGENTS.md` and the coding rules describe `sync.js --apply` as taking canonical paths; it takes generated view paths, so every agent editing canon loses a round-trip | — |
| F-5 | impl-review | Correctness reviewer exhausted its turn budget on the full 29-file scope and returned nothing usable — the same failure as F-1, now recurring | — |
| F-6 | impl-review | A session rate limit killed both split correctness dispatches mid-review; their partial work was discarded with no resume path | — |
| F-7 | impl | An agent wrote its memory into the sprint folder a second time, and this occurrence reached version control | — |
| F-8 | pr | `gh pr merge --delete-branch` silently moved HEAD to the base branch, so the next two bookkeeping commits landed directly on `main` | — |

## F-1 — Audit agent exhausted its turn budget and returned no usable output

- **Phase**: audit
- **Surface**: agent — `.asd/agents/asd-architect.md`, dispatched by `.asd/workflows/asd-phase-audit.md`
- **What happened**: the audit dispatch carried seven distinct investigation areas across the whole repository. The agent hit its turn limit mid-investigation and returned a single fragmentary sentence. No host operation exists to resume a subagent from the orchestrator, so the work could not be continued — only re-issued.
- **Impact**: one full dispatch discarded. Recovery required splitting the same audit into two narrower parallel dispatches, which then both completed comfortably. Roughly one wasted dispatch plus the orchestrator round-trips to diagnose and re-plan it.
- **Refs**: —

## F-2 — Heredoc write of a large artifact failed in the shell tool

- **Phase**: audit
- **Surface**: provider tool — shell tool heredoc handling
- **What happened**: writing `audit.md` via a quoted heredoc inside a chained shell command failed with a quoting error the content did not justify. The same content wrote cleanly through the dedicated file-write operation.
- **Impact**: one wasted round-trip and a discarded large payload. Recurs for any artifact the orchestrator composes inline rather than delegating.
- **Refs**: —

## F-3 — Dev agent wrote agent memory inside the sprint folder

- **Phase**: impl
- **Surface**: agent — `asd-dev-critical` memory placement, against `.asd/rules/artifact-layout.md`
- **What happened**: a dispatched dev agent created `<sprint>/.claude/agent-memory/...` instead of writing to the repository-root memory location. The sprint folder is an archived, layout-governed artifact tree with no row for agent memory.
- **Impact**: an untracked path inside the sprint folder. `git status --porcelain` was therefore non-empty, which would have failed the impl-review clean-worktree precondition at phase entry; the orchestrator had to detect the path, relocate the memory file and its index line, and delete the stray tree. The memory itself was worth keeping, so deleting outright would have lost a real finding.
- **Refs**: —

## F-4 — `sync.js --apply` is documented with the wrong argument form

- **Phase**: impl
- **Surface**: rule — `AGENTS.md` repo-specific section and `.asd/project/custom-coding-rules.md`
- **What happened**: both documents phrase the sync step as `--apply <canonical file>`, which reads as the `.asd/` source path. `--apply` matches its arguments against generated view targets instead, so a canonical path silently applies nothing while still reporting success unless the per-target results are inspected.
- **Impact**: a wasted round-trip for each agent that edits canonical files and follows the documented form. Two separate dev agents recorded this independently in their own memory during this sprint, which is evidence it recurs rather than being a one-off misread. The silent-success shape makes it easy to believe a sync landed when it did not.
- **Refs**: —

## F-5 — Correctness reviewer exhausted its turn budget on the full change scope

- **Phase**: impl-review
- **Surface**: agent — `.asd/agents/asd-reviewer-correctness.md`, dispatched by `.asd/workflows/asd-phase-impl-review.md`
- **What happened**: dispatched against the full 29-file scope list with every rubric section in force, the reviewer spent its entire turn budget reading and returned one fragmentary sentence. This is the second occurrence of the same failure mode this sprint — F-1 was the audit agent, under the same conditions: a read-only agent, a repository-wide scope, no shell, and a rubric requiring it to open many files before it can conclude anything.
- **Impact**: one dispatch wasted. Recovery required splitting the review into two halves along rubric lines, which the phase workflow has no notion of — so the split, the two half-verdicts, and their merge into one `correctness.md` were all improvised by the orchestrator outside the documented contract. The written review carries a dispatch note recording that deviation.
- **Refs**: —

## F-6 — Session rate limit killed both split correctness dispatches mid-review

- **Phase**: impl-review
- **Surface**: provider tool — model session rate limit
- **What happened**: after the split, both half-A and half-B dispatches terminated with an HTTP 429 session-limit error partway through. Both had already done substantial reading. Because a dispatched agent's partial work is not persisted anywhere, both halves were discarded entirely and re-dispatched from scratch after the limit cleared.
- **Impact**: the full reading cost of two agents paid twice. More structurally: `review-policy.md` requires each reviewer to get fresh context per iteration, so there is no checkpointing to fall back on, and an interrupted reviewer is always a total loss rather than a partial one. The phase has no notion of a resumable or partially-complete review.
- **Refs**: —

## F-7 — Agent memory written into the sprint folder again, this time committed

- **Phase**: impl
- **Surface**: agent — `asd-tester-critical` memory placement, against `.asd/rules/artifact-layout.md`
- **What happened**: a dispatched tester created `<sprint>/.claude/agent-memory/...` instead of writing to the repository-root memory location — the same misplacement as F-3, by a different agent, after F-3 had already been corrected once in this sprint. This occurrence went further than F-3: the files were staged and committed, so they entered the sprint's history rather than sitting untracked.
- **Impact**: the sprint folder is archived read-only at closure, so committed agent memory would have been frozen there and lost to the agent that wrote it. Recovery required relocating both files, merging the index line into the root memory index, removing the tree from version control and deleting it. F-3's recurrence is the finding: correcting the placement once, in one agent's memory, does not prevent the next agent from repeating it, because nothing in the layout rules or the dispatch payload states where agent memory belongs.
- **Refs**: —

## F-8 — Merging with branch deletion silently relocated HEAD to the base branch

- **Phase**: pr
- **Surface**: provider tool — `gh pr merge --delete-branch`, against `.asd/rules/git-strategy.md` "Forbidden"
- **What happened**: merging the sprint PR with branch deletion removed the local sprint branch and moved `HEAD` to `main` without saying so in its output. The orchestrator, believing it was still on the sprint branch, then recorded the merge and the closure approval — two commits that landed directly on the local base branch, which `git-strategy.md` forbids outright. The reflog is the only place the relocation is visible.
- **Impact**: caught before any push, and the two commits' content was preserved because the companion branch was cut from the diverged local `main` and therefore already contained them; the base branch was then reset to the remote. Had the companion branch been cut earlier, or had anything pushed in between, the recovery would not have been free. The general shape is worse than this instance: every phase workflow assumes the orchestrator knows which branch it is on, and nothing verifies that after a Git operation capable of changing it.
- **Refs**: —

<!-- F-8 was recorded after this sprint's retro phase had already run, so retrospective.html does not cover it. Left here for the next sprint's reader. -->
