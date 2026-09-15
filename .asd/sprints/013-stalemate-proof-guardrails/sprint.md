---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 013-stalemate-proof-guardrails

## Goal

Three workflow hardenings taken from a review of trace-engineering practice for AI agents. Each replaces an agent's word with deterministic evidence or turns a lesson into a rule an agent actually loads.

1. Stop a degenerate `impl`⇄`impl-test` loop. The rounds stay uncapped, but a repeat of the same code defects is detected and escalated.
2. Ground fail-first regression proof in raw runner evidence, not a claim.
3. Make the retrospective deduplicate its findings first, and only then draft each surviving finding as a one-line guardrail with a named home.
4. Make audit analyse every relevant document under `docs/`, resolve contradictions in favour of canonical ASD documents, and ask the user about whatever still conflicts.
5. Cut the configuration surface from 28 settings to 20: merge the diagram flags, fold the design skip into `documents.*`, and remove settings nobody reads or nobody needs to turn off. Pull requests become always ASD-managed.

## Acceptance

- AC-1: `sprint-lifecycle.md` states a stalemate rule for the `impl`⇄`impl-test` cycle. When two consecutive `impl-test` entries route the same code-defect set back to `impl`, the phase emits `FAILED: stalemate` and escalates to the user. The rounds stay uncapped otherwise.
- AC-2: Defect-set identity is compared on the file path (line dropped), the runner's first failure line verbatim and the runner-reported failing test name, never on `D-N` ids, because ids are never reused. The comparison is a `.asd/runtime.js` subcommand covered by `tests/run.js`, deterministic and free of LLM judgment.
- AC-3: `asd-phase-impl-test.md` step 9 applies the AC-1 check before routing code defects to `impl`, reading the previous entry's defects from `test-plan.md`. Only the detection rule of `external-review.md` "Stalemate detection" is reused, by reference. The escalation options are impl-test's own: continue test-fix with user guidance, accept the defects as debt (hard waiver, recorded in `stubs.md`), or abort. The answer is recorded in `decisions-log.md` so re-entry does not re-trigger on the same set.
- AC-4: `code-style.md` §17 (SSoT) requires a fail-first proof record to carry the exact command, its non-zero exit code and the name of the test that failed before the fix. A mutation proof carries the same evidence for the mutated run. A bare claim such as "proved" does not satisfy the rule.
- AC-5: The `Regression proof` column of the `Added tests` table in `t_test-plan.md` takes the AC-4 shape. `asd-reviewer-testing` treats a proof row without that evidence as a finding, citing §17 rather than restating it.
- AC-6: The retro phase deduplicates before it drafts. Friction entries and systemic proposals that share one root cause merge into a single finding that cites every source `F-N`. Each merged finding is then checked against the rules already in its target home, and a finding that an existing rule already covers is dropped with that rule cited.
- AC-7: Only after AC-6, every surviving finding becomes a rule proposal with two fields. `guardrail` is one imperative line stating the prohibition or requirement. `home` is the file it belongs in: `custom-coding-rules.md`, `custom-design-rules.md`, `custom-common-rules.md`, `.claude/agent-memory/<agent>/` (Claude-only), a `.asd/rules/` doc when `self_hosting` is enabled, or "upstream ASD" (a framework proposal, never applied) when it is not. A merged finding citing any `F-N` stays in the Actions table, and both retrospective tables replace `Recommendation`/`Target` with `Guardrail`/`Home`.
- AC-8: Retro still applies nothing. Promotion of any guardrail stays the user's decision. `sprint-lifecycle.md` "Retro phase", `asd-phase-retro.md` and `t_retrospective.html` state the AC-6 and AC-7 order and shape consistently. The empty-log branch still yields systemic proposals.
- AC-10: Audit reads every document under `docs/` that bears on the sprint's touched areas, not a sample. `sprint-lifecycle.md` "Audit phase", `asd-phase-audit.md` step 2 and the `asd-architect` audit instructions state this, and `audit.md` "Existing docs found" lists each one analysed.
- AC-11: When documents contradict each other, the canonical ASD document wins. A canonical ASD document is a persistent doc at its `artifact-layout.md` path-map location, and under `self_hosting` also a `.asd/rules/` doc. Each contradiction resolved this way is recorded in `audit.md` with both sources and the winning one.
- AC-12: A contradiction that precedence cannot settle, such as two canonical documents disagreeing or no canonical source on either side, is escalated to the user as a hard decision before the audit gate passes. The answer is recorded in `decisions-log.md` and in `audit.md`. `t_audit.md` gains one optional section holding the AC-11 and AC-12 records, and `checkpoints.md` lists the unresolved-contradiction question as hard.
- AC-13: `documents.c4` is removed and `project.diagram_tool` takes `none | likec4 | mermaid`. `none` means no diagram is written. The subsystem registry does not depend on this value. A diagram still requires `project.subsystem_decomposition: enabled`.
- AC-14: `skip_design_phases` is removed from config and state. Design, design-review and design-promote collapse in one write at the audit exit whenever `prd`, `ux_spec` and `adr` are disabled and the effective diagram tool is `none`. The design workflow keeps its own collapse only as a defensive fallback for a direct re-dispatch.
- AC-15: `git.gh_enabled` and `git.auto_pr` are removed. The `pr` phase always opens and merges the sprint PR through `gh`. `/asd-init` requires `gh` to be installed and authenticated and does not proceed without it. A `gh` failure at `pr` is `FAILED` naming the fix. The hard closure gate is unchanged.
- AC-16: `system.os`, `system.tools.likec4` and `system.tools.designmd` are removed. External Review takes the platform from runtime detection. `/asd-init` probes likec4 when `diagram_tool: likec4` and Node when `ux_spec` is enabled, writing no flag for either.
- AC-17: `review.scoped_fan_out` is removed and diff-scoped rubric n/a marking is always on. The "absent means disabled" clause and its references are deleted.
- AC-18: The legacy `documents.audit` values `enabled` and `disabled` are no longer accepted. Scope reads only `auto | always | off`.
- AC-19: A `.asd/migrations/` script rewrites an existing consumer `config.yaml` without losing intent. `c4: enabled` becomes the project's current diagram tool and `c4: disabled` becomes `none`. `skip_design_phases: enabled` disables `prd`, `ux_spec` and `adr` and sets `diagram_tool: none`. Legacy audit values are normalised, and every removed key is dropped. A sprint already active during the upgrade keeps working from its frozen state. `CHANGELOG.md` announces the breaking change. `core.md`, `t_AGENTS.md` and `asd-update` name a release migration run by `/asd-update` as a sanctioned config writer, limited to release-mandated key renames and removals, plus the value mappings, key insertions and shipped-comment rewrites that carry a renamed or removed key's or value's intent.
- AC-20: `t_config.yaml`, `/asd-init`, `t_state.json`, README.md (config schema) and `tests/run.js` match AC-13..AC-19. This repo's own `config.yaml` is rewritten by running the AC-19 migration against it as a plan-declared task.
- AC-9: `node tests/run.js` is green, `node .asd/sync.js --check` is clean, README.md is consistent with the changed rules, workflows and templates, and every added line passes `artifact-layout.md` "Documentation economy".

## Out of scope

- Tracing, OpenTelemetry spans, sampling-parameter capture, token-cost accounting, statistical loop breakers. ASD is not a runtime and has no such sensors.
- A cap on `impl`⇄`impl-test` rounds.
- Automatic promotion of retro guardrails into any rule file.
- Hand-edits to generated provider views. Edit canon, then run `sync.js --apply`.
