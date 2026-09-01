---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
-->

## Overview
{{what plan covers, prose}}

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format"): all AC-N covered by Tasks, full suite green at impl-test, all reviewers green at impl-review.
{{sprint-specific DoD additions, if any — prose, NO checkboxes; omit this line entirely when none}}

### Task 1: {{title}}
- [ ] {{subtask}}
- [ ] {{subtask}}

### Task 2: {{title}}
- [ ] {{subtask}}

## Risks (optional)
- {{risk}}

## Dependencies (optional)
- Task {{N}} depends on Task {{M}}

## Out of scope (optional)
- {{exclusion}}
