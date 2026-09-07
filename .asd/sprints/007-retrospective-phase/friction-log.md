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
