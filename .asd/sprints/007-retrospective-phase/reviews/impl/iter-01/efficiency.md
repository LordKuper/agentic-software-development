[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low)
- **Change surface**: 29 scoped files, `main...bb9b760`
- **Section scoping**: five performance sections in force (executables in scope); *perf budget compliance* alone `n/a` — `custom-coding-rules.md` defines no perf-budgets section.

## Findings

| # | Sev | Location | Description | Fix |
|---|---|---|---|---|
| EFF-1 | critical | `.asd/workflows/asd-phase-retro.md:25` | Defensive code for an impossible-by-contract case, also dead code. Step 9 handles `ADVICE_NEEDED` "from any dispatched agent" in a workflow that by its own contract dispatches nothing (`:13` "nothing is delegated", `:33` "Agents delegated to: None", `:36` "Skills/workflows dispatched: None"). The branch can never fire. `asd-phase-audit.md`, which does dispatch agents, carries no such step, so this is not a universal house line. | Delete step 9 and renumber. Nothing references it. Secondary, non-blocking: `Task` in `asd-phase-retro/SKILL.md:5` then has no caller; left as-is only because every other phase skill grants it uniformly. |
| EFF-2 | high | `.asd/workflows/asd-phase-impl.md:88` | New duplicate channel introduced where `escalations` was removed. The line records the manual-steps halt as an `F-N` entry unconditionally. A validated `MS-N` halt is a by-design outcome, not a malfunction: `sprint-lifecycle.md:237` scopes the log to workflow malfunction only, and the boundary table at `:245` permits only "the step was unexpected or unworkable". As written, every sprint with any manual step auto-generates friction entries mirroring `manual-steps.md`, and retro then derives remediation for a non-problem — the second-channel duplication retiring `escalations` was meant to prevent. | Make it conditional: record an `F-N` citing the `MS-N` only when the orchestrator judged the step unexpected or unworkable. A routine validated halt gets the decisions-log entry only. |
| EFF-3 | medium | `.asd/migrations/6.0.0.js:30-73`; tests `tests/run.js:2563-2592` | Complexity vs value: ~45 lines of hand-rolled line scanning to delete one key from a machine-written JSON file whose formatting has no consumer — every reader is `JSON.parse`. The safety fallback declines exactly the case most likely to exist: an `escalations` array that actually accumulated entries is pretty-printed across lines, so the migration leaves the dead key and asks for a hand-edit. The regex is also depth-blind, matching the first `"escalations": [...]` line at any nesting level while the guard checks only the top-level key. | Parse, `delete state.escalations`, re-serialize with the file's original EOL and trailing newline. Handles every shape, drops ~35 production lines and the shape-`skipped` bucket, shrinks the second test to the unparsable case. |
| EFF-4 | medium | `.asd/workflows/asd-phase-retro.md:11`, `:20` | Unbounded, largely redundant read on the phase's only path. Systemic-class evidence is specified as `plan.md`, `decisions-log.md`, `manual-steps.md`, `reviews/`. `reviews/` grows with every iteration of both review phases and each file carries full findings plus a ledger — the single largest read in the sprint, loaded on both branches including the empty-log one. The signals step 4 names (review iterations, rework loops, gate waits, task churn) are already in `state.json`, which the workflow reads anyway. | Narrow to `state.json` + `plan.md` + `decisions-log.md`; read a review file only when a specific `F-N` cites it (step 3 already covers that). Drop `manual-steps.md` unless a cited `MS-N` requires it. |
| EFF-5 | medium | `.asd/rules/sprint-lifecycle.md:254`, `:263`; `.asd/workflows/asd-phase-retro.md:8`, `:18`, `:42`; `.asd/skills/asd-phase-retro/SKILL.md:4`; `.asd/templates/t_retrospective.html:11` | SSoT-by-volume in the highest-traffic rule doc. Two facts are restated five to six times. (a) unconditional / never no-op: `sprint-lifecycle.md:254` states it three ways in one sentence, while `:147` already lists retro among never-no-op phases and `:102` states it again; `asd-phase-retro.md:8` restates it and cites the rule it is restating. (b) empty log still completes to `pr`: rule `:263`, workflow `:18`, `:21`, `:42`, the skill description and the template comment. Same pattern on the friction log's lazy/append-only/sprint-scoped properties across `sprint-lifecycle.md:235`, `artifact-layout.md:172` and `t_friction-log.md:11-14` — the last under a comment promising "not restated here". All of it loads into every future agent's context. | Cut rule `:254` to "Unconditional (never no-op)."; delete the redundant clause of `:263`, workflow `:8`, the second sentence of `:18`, and `:42`; trim the skill description's clause; drop the restatement from `t_friction-log.md:11-12`. |
| EFF-6 | low | `.asd/templates/t_retrospective.html:30-52` | Two structurally identical tables (`#consumer-actions`, `#asd-actions`) differ only in which side acts — the same split the sibling `#systemic-proposals` table models correctly with one `Acts on` chip column. Duplicated scaffolding, a second section to fill, a longer empty-log instruction. AC-4 is satisfied by the column form equally. | Merge into one `#actions` table with an `Acts on` chip column; update the empty-log comment and the README wording. |

No finding requires escalation: every fix is a deletion or narrowing; none adds an abstraction, layer or dependency.

## Verdict

CONCERNS: 6 (1 critical, 1 high, 3 medium, 1 low)

## Next action

Route to `impl` review-fix mode. EFF-3 also requires updating `tests/run.js:2563-2592` in the same fix.

## Escalations

None.

## Coverage ledger

No dispatcher coverage manifest was supplied in this dispatch (only `scope.json`), so `manifest_digest` is unset and ids are the reviewer's stable rubric/scope ids.

```json
{"manifest_digest":null,"findings":["EFF-1","EFF-2","EFF-3","EFF-4","EFF-5","EFF-6"],
"files":[{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/migrations/6.0.0.js","s":"checked","f":"EFF-3"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked","f":"EFF-5"},{"i":".asd/skills/asd-phase-impl-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_html-shell.html","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked","f":"EFF-6"},{"i":".asd/templates/t_state.json","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked","f":"EFF-2"},{"i":".asd/workflows/asd-phase-plan.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked","f":"EFF-1"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],
"rules":[{"i":"OE-interface-one-impl","s":"pass"},{"i":"OE-generic-one-type","s":"pass"},{"i":"OE-factory-lt3","s":"pass"},{"i":"OE-plugin-no-plugin","s":"pass"},{"i":"OE-abstraction-no-2nd-use","s":"pass"},{"i":"OE-premature-config-flag","s":"pass"},{"i":"OE-defensive-impossible","s":"finding","f":"EFF-1"},{"i":"OE-helper-wraps-stdlib","s":"pass"},{"i":"OE-inheritance-depth3","s":"pass"},{"i":"OE-framework-wraps-framework","s":"pass"},{"i":"OE-mock-of-mock","s":"pass"},{"i":"OE-comment-restates-code","s":"pass"},{"i":"OE-dead-code-just-in-case","s":"pass"},{"i":"SC-1-god-type","s":"pass"}],
"sections":[{"i":"over-engineering","s":"reviewed"},{"i":"structure-cohesion","s":"reviewed"},{"i":"complexity-vs-value","s":"reviewed"},{"i":"perf-budget-compliance","s":"n/a","p":"no budgets defined"},{"i":"perf-anti-patterns","s":"reviewed"},{"i":"algorithmic-complexity","s":"reviewed"},{"i":"regression-detection","s":"reviewed"},{"i":"hot-path-identification","s":"reviewed"}]}
```
