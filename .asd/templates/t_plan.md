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
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
-->

## Overview
{{what plan covers, prose}}

## Definition of Done
Standing DoD applies, never restated here (`sprint-lifecycle.md` "Plan file format").
{{sprint-specific DoD additions, if any — prose, NO checkboxes; omit this line entirely when none}}

### Task 1: {{title}}
Material risk: change: {{short risk class — the edit's own correctness is uncertain}}
- [ ] {{subtask}}
- [ ] {{subtask}}

### Task 2: {{title}}
Material risk: artifact: {{short risk class — verifiable edit in a high-stakes file}}
- [ ] {{subtask}}

### Task 3: {{title}}
Material risk: none
- [ ] {{subtask}}

## Risks (optional)
- {{risk}}

## Dependencies (optional)
- Task {{N}} depends on Task {{M}}

## Out of scope (optional)
- {{exclusion}}
