---
responsibility:
  owns: current implementation, documentation, gaps and risks for the sprint scope
  excludes: requirements, decisions, plan, code
  delegates_to: plan.md
---

# Audit

## Scope reference

[Sprint criteria](./sprint.md) and [accepted approach](./research.md).

## Touched areas

- Mockup selection, configuration validation and upgrade, authoring, publication, review inputs, and promotion (AC-1 through AC-3 and AC-5).
- Provider decision routing and approval semantics (AC-4 and AC-5).
- Test report capture, Test-only Task completion, and Git scope-list verification (AC-6 through AC-8).

## Existing docs found

- [Design system](../../rules/design-system.md#12-authoring-token-decisions-rule-survival), [artifact layout](../../rules/artifact-layout.md), and [README](../../../README.md) define the existing mockup formats, location, handoff and publication recovery.
- [Sprint lifecycle](../../rules/sprint-lifecycle.md), [scope](../../workflows/asd-phase-scope.md), [design](../../workflows/asd-phase-design.md), and [design-promote](../../workflows/asd-phase-design-promote.md) define the Lite and Standard entry points and promotion.
- [Provider operations](../../rules/providers.md#semantic-operations--host-tools), [core interaction protocol](../../rules/core.md), [checkpoints](../../rules/checkpoints.md), [agent protocol](../../rules/agent-protocol.md), and [language policy](../../rules/language-policy.md) define who asks, which decisions require explicit answers, and how to record them.
- [Codex CLI reference](../../../docs/architecture/tech-reference/codex-0.169.md) covers review and custom agents. [Claude Code reference](../../../docs/architecture/tech-reference/claude-code-2.1.md) covers the wrapped review CLI. Neither is evidence for the Codex App widget.
- [Git reference](../../../docs/architecture/tech-reference/git-2.56.md) covers the review range and paths. [Node reference](../../../docs/architecture/tech-reference/node-24.15.md) covers local runtime and test runner usage. [Code style](../../rules/code-style.md), [implementation](../../workflows/asd-phase-impl.md), and [impl-review](../../workflows/asd-phase-impl-review.md) govern fail-first proofs and scope-list generation.

## Existing implementation found

| Criteria | Evidence |
|---|---|
| AC-1 | `project.claude_design` selects Claude Design when available and HTML otherwise. `asd-init` collects it. `config-check` derives required leaves and accepted values from `t_config.yaml`. `runtime-routing.test.js` covers missing, duplicate and invalid settings. |
| AC-2, AC-3 | Lite calls the mockup rules in scope and can recover deferred Claude Design publication in design-promote. Standard authors mockups in design. Both already have a local folder that can carry a mockup index to review and promotion. Figma documents editable frame creation for remote clients. This session exposes Figma create-file and write tools. |
| AC-4, AC-5 | `providers.md` uses chat for Codex decision requests and `AskUserQuestion` for Claude. This Codex App session delivered actual widget selections at the workflow, requirements, and scope gates. It also returned a free-text clarification without treating it as a decision. |
| AC-6 | `asd-tester.md` requires runner exit and counts for a finished area. `contract-agents.test.js` pins that evidence for area runs. |
| AC-7 | Code style requires a fail-first run or equivalent targeted mutation for a reproducible fixed defect. The Test-only Task dispatch and completion flow does not require that evidence for every new or extended behavioral regression test. `runtime-tools.test.js` covers test-plan proof columns at impl-test close. |
| AC-8 | Impl-review supplies the Git-produced NUL-separated list to its manifests. `runtime-review.test.js` already drives an actual Git list through the external scope path, including a case that uses `writeImplReviewScope`. |

## Gaps

- Figma has no consumer setting, provider operation, destination handling, or Figma-specific handoff and recovery rule. The config schema and upgrade must preserve legacy selections. A search of `tests/` for `claude_design`, `Figma`, and `mockup` found the existing validation test but no three-way selection check.
- The canonical mockup rule assumes HTML/CSS. Figma frames need a native token and component fidelity path. The index must preserve stable remote links through review and promotion. Search for `request_user_input` and `request user decision` found no existing widget contract test. Live host evidence is available from this scope.
- Existing test evidence rules require output details but do not require capture before tool truncation. Search for runner report and exit-code terms found the area-run assertions above but no capture-order requirement.
- No Test-only Task acceptance check requires the proof before initial implementation completion. The searched fail-first and Regression proof tests cover downstream evidence and existing rule language.
- Existing Git-produced scope tests provide an example. The testing rule does not require this input for a change to scope selection.

## Risks

- Config upgrade can block entry if the new leaf is required without migrating legacy settings. Verify both legacy variants and invalid or duplicate inputs.
- Figma access and tool availability are host-specific. A real authoring check needs an authorized editable file or permission to create one. Keep live authoring evidence distinct from docs and tool discovery.
- An uncertain Figma write can duplicate frames on retry. Recover by recorded destination and confirmed frame identities before replaying a write. Keep the scope gate and external-write authorization distinct.
- A widget preselection, free-text clarification, or incomplete answer must not advance a hard gate. Use the available host feature, retain the chat fallback and make gate completion depend on the submitted answer.
- Full runner output belongs in scratch storage. Preserve the runner exit code before printing the bounded summary. Existing fail-first evidence rules and Git fixture helpers can be reused.

Baseline: config validation and generated-view check passed. Seven impacted test areas passed before implementation. No related open stubs or external documentation to migrate were found.
