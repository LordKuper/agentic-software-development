---
responsibility:
  owns: per-sprint registry of manual operational actions a human must perform for the sprint plan to complete
  excludes: code todo stubs (stubs.md), manual QA verification of behaviour (reviews testing.md), plan tasks (plan.md)
  delegates_to: stubs.md (code stubs), plan.md (tasks + BLOCKED markers), reviews/ (manual verification of behaviour)
---

# Manual Steps

Definition, boundary against `stubs.md` and manual verification, validation duty, status transition and lifecycle: `artifact-layout.md` "Manual steps" (sole SSoT, not restated here). Entries are append-only; entry content is `language.docs`.

## Summary

| ID | Title | Blocks | Performed by | Status |
|---|---|---|---|---|
| MS-1 | Enable `skip_design_phases` via `/asd-init` diff mode | Task 6 — both subtasks | user | done |

## MS-1 — Enable `skip_design_phases` via `/asd-init` diff mode

- **Blocks**: Task 6 — register and review subtasks
- **Why**: AC-6. Only `/asd-init` may edit project settings, and `asd-sprint` dispatches phase skills only, so no agent in the chain can run it (`audit.md` R-1).
- **When**: before `impl-test`, on branch `sprint/011-explicit-design-skip`, after commit 19a7299 (synced `/asd-init` view)
- **Prerequisites**: Tasks 1-5 committed; clean worktree
- **Performed by**: user
- **Status**: done

### Steps

1. Run `/asd-init` in this repo (re-init diff mode).
2. Set `skip_design_phases: enabled`; leave every other field unchanged.

### Verification

`.asd/project/config.yaml` contains top-level `skip_design_phases: enabled`; `git diff` touches only that file plus managed-block drift that is already current (`audit.md` R-2).
