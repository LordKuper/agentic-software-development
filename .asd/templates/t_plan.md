---
responsibility:
  owns: task breakdown, dod, task status (checkboxes)
  excludes: requirements, design decisions, code, review findings
  delegates_to: docs/ docs (requirements/design), reviews/ (findings)
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Context, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Checkboxes in any non-task section break orchestrator task parsing
- Subtask deferred for a manual action stays `- [ ]`, suffixed ` — BLOCKED: MS-N` (see manual-steps.md)
- No test-authoring tasks or subtasks: tests are selected and written in impl-test, after the code exists
-->

## Overview
{{what plan covers, prose}}

## Context
- [requirements/{{subsystem}}.html](../../docs/product/requirements/{{subsystem}}.html)
- [adr-{{NNNN}}-{{slug}}.html](../../docs/architecture/adr/{{subsystem}}/adr-{{NNNN}}-{{slug}}.html)
- [ux/{{subsystem}}.html](../../docs/ux/{{subsystem}}.html)

## Definition of Done
{{prose checklist of completion criteria — NO checkboxes here}}

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
