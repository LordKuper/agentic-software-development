---
responsibility:
  owns: task breakdown, task status, sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, standing DoD
  delegates_to: reviews and implementation dispatches
---

# Plan

## Overview

Use native Figma Design authoring and the Codex App's native choice widget. Reuse ASD's settings validation, mockup index, phase recovery, and decision recording.

Provider operations stay in `.asd/rules/providers.md` under "Semantic operations -> host convention". Mockup behavior stays in `.asd/rules/design-system.md` §12 "Mockups". The Figma integration uses the existing host plugin. Native prompt routing uses the active host's exposed choice tool.

## Definition of Done

Standing DoD applies per `sprint-lifecycle.md` "Plan file format".

Record the host, scenario, and result for live checks. Record fixture and rule checks separately. Verify preselected choices never advance a gate before a reply, a free-text clarification retains the gate, and an unavailable widget uses the chat fallback.

### Task 1: Require fail-first proof before Test-only Task acceptance
Material risk: change: workflow gate
Reachability: Test-only Task tester returns the fail-first or mutation proof with completion; impl checks the proof before ticking the Task and advancing its wave.

AC-7.

- [x] Define the completion check in `.asd/workflows/asd-phase-impl.md`. Reuse the proof fields and mutation allowance of `code-style.md` §17. Compile-only adaptations do not add a behavior regression test.
- [x] Have `.asd/agents/asd-tester.md` return that proof for a new or extended behavior regression test during a Test-only Task. Keep its existing write scope.

### Task 2: Select mockup format with legacy compatibility
Material risk: change: public contract

AC-1 and AC-5.

- [ ] In `t_config.yaml` and `asd-init`, expose `project.mockup_format` with `html`, `claude_design`, and `figma`, defaulting new projects to `html`. Config validation accepts legacy-only `project.claude_design: enabled|disabled` as the corresponding Claude Design or HTML value. Validate both keys if present, with the explicit format taking precedence. A subsequent init edit can write the explicit format using the resolved selection. Keep the working self-hosted config valid through the same compatibility read.
- [ ] Update `.asd/runtime.js` using the existing scalar-map validator. Avoid a new parser or a prerequisite consumer migration. Enable selection through fresh init and repair or diff mode. Coordinate the README config mirror and behavior in Task 3.

### Task 3: Author and hand off Figma mockups
Material risk: change: cross-domain
Material risk: change: workflow gate
Reachability: Lite scope or Standard design records the authorized destination, write status and frame identities, then writes index links; re-entry reads the live and rotated log before any retry, and design-promote reads the index and recorded publication status before preserving the links.

AC-1 through AC-3 and AC-5.

- [ ] Define the provider operation in `providers.md` and route the selected format in `design-system.md` §12. Update the references in `asd-phase-scope.md`, `asd-phase-design.md`, `asd-phase-design-promote.md`, and README. Refresh mockup index and fidelity references in artifact-layout, reviewer and template paths only where the canonical grep shows a format-specific assumption.
- [ ] Use the supported Figma integration to write editable frames to the supplied file or create a file after the user approves. Follow the external-action gate and the Figma author's applicable skills. Reuse existing tokens and linked components where available. Record stable frame links in `design/mockups/index.md`, and preserve links through review, implementation handoff and promotion.
- [ ] When write access fails, offer temporary local HTML or wait. Record the choice and status before leaving the phase. Reuse a confirmed result and recover uncertain writes by destination and identity before retry. Keep Claude Design's existing deferred publish and HTML paths working.

### Task 4: Route Codex choices through the native widget
Material risk: change: workflow gate

AC-4 and AC-5.

- [ ] Update the central `providers.md` decision mapping and any structured-decision callers that bypass it. Sweep `.asd/rules`, `.asd/workflows`, and `.asd/skills` for `request user decision`, `AskUserQuestion`, `ask in chat`, and explicit choice prompts. Reference the canonical mapping from the core interaction protocol where needed.
- [ ] Use the exposed Codex choice tool for configured options, including phase decisions. With an asynchronous tool, wait for the actual reply. Preserve language, timing, existing approval semantics and open-ended chat prompts. When no widget is available or delivery definitively fails, carry the same options into chat and wait for the reply.

### Task 5: Capture runner evidence before summary output
Material risk: change: runner evidence

AC-6.

- [ ] Update `.asd/agents/asd-tester.md` to capture full runner output and its exit code in one invocation before emitting a bounded summary. Apply the rule to area, impacted and full suite runs. Keep the scope, reuse and existing failure classification.

### Task 6: Test review paths with the Git-produced scope list
Material risk: none

AC-8.

- [ ] In `.asd/rules/code-style.md` §17 require tests of review scope selection to exercise the same Git-generated list the workflow passes to the manifest. Reuse `tests/runtime-review.test.js`'s real Git list path as the repository example.

### Task 7: Adapt config validation test inputs
Material risk: none
Test-only: tests/runtime-routing.test.js

AC-1 and AC-5.

- [ ] Adapt the config-check test's template-derived fixture to the new primary setting while preserving its missing, invalid and duplicate assertions. Keep legacy compatibility coverage in impl-test as appropriate.

Orchestrator at implementation wave exits: regenerate affected provider views from canonical sources once per wave and check the synchronized repository.

Orchestrator during verification: exercise native Figma authoring only with an authorized editable destination or approval for a scratch file. Record the live Codex App widget answer and verify the unavailable-widget path as a separate check. Keep Figma publication identity out of tracked application fixtures.

## Risks

- A configured Figma integration can lack write permissions for a particular file. Persist the actual outcome before retry or HTML fallback.
- Lack of a widget response is a pending decision. Gate recording continues to require a submitted answer.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1 |
| 2 | Task 2, Task 4, Task 5, Task 6 |
| 3 | Task 7 |
| 4 | Task 3 |

- Task 7 follows the configuration contract update in Task 2. The repository build is the sync check and does not compile the test caller, so its input adaptation can follow in the next wave. Tasks 1 and 5 share the tester rule and run in different waves.
- Task 3 reads Task 2's format and shares the provider operation file with Task 4.
- External APIs: [Figma remote MCP](../../../docs/architecture/tech-reference/figma-mcp-remote.md) for Task 3 and the [Codex App question widget](../../../docs/architecture/tech-reference/codex-app-questions.md) for Task 4. Task 6 reuses the [Git reference](../../../docs/architecture/tech-reference/git-2.56.md) and existing fixture helper.

## Decision coverage

| Decision | Covered by |
|---|---|
| Editable Figma Design screens; use a supplied file or approve creation | AC-2, Task 3 |
| Offer temporary HTML or wait when Figma cannot write | AC-3, Task 3 |
| Codex widget for all predefined choices; chat and explicit reply without the widget | AC-4, Task 4 |
