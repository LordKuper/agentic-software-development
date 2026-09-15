---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 013-stalemate-proof-guardrails

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 629c514edd4b743ee60127b05d27e0e22b21d39b | full change surface |

## Risk → check decisions

Impacted set: full suite (`node tests/run.js`). The change surface touches framework-wide files (`sprint-lifecycle.md`, `core.md`, `runtime.js`, `release-manifest.json`, templates), so the safety valve applies.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `defectStalemate` (AC-1, AC-2) | A repeated defect set is missed, or a stalemate is raised falsely. Cases: line shift in `Location`, row order, `D-N` ids, CRLF, `\|` inside a cell, backticked cells, `impl-review` rows, a superset or subset, one identity field changed. | unit/property | add | Pure function, so table-driven fixtures are enough. The fixtures use the real `t_test-plan.md` Defects header, which guards the column names the runtime hard-codes. A changed `Symptom` must give `stalemate: false`: that is AC-2's verbatim identity, the known fail-open limit, asserted explicitly and not fixed. The digest must not change with row order, ids or line numbers. |
| `defectStalemate` `Entry` cell (AC-1, AC-2) | A row whose `Entry` is neither a number nor `impl-review` (for example `Entry 2`) is skipped, so that entry's set disappears and a real stalemate fails open. | unit | add | Code defect D-1, confirmed by the orchestrator. The regression test fails on HEAD. |
| `runtime.js defect-stalemate` CLI (AC-3) | A malformed plan or table, or a missing `--plan`, still prints a verdict step 9 acts on. | component/contract | add | Step 9 runs the CLI, not the export. Only the CLI has the exit contract: exit 0 with JSON on stdout, or exit 2 with empty stdout. |
| `.asd/migrations/9.0.0.js` on a real config (AC-19) | A config built from the shipped template loses intent, comments or bytes, or a second run changes it again. | component/contract | add | Fixture pair under `tests/fixtures/`: the 8.0.0 `t_config.yaml` must migrate byte-for-byte to the 9.0.0 one, as LF and as CRLF+BOM, and a second run must report `unchanged`. The comment rewrite and the removal of owned comments are only visible on the real shape. Frozen fixtures, not `git show`: squash merges drop sprint shas. |
| `9.0.0.js` value mapping (AC-19) | A wrong mapping: `c4` enabled, disabled, absent from a present group, or with the group absent; `c4: enabled` without `diagram_tool` (→ `likec4`); `skip_design_phases: enabled` with and without a `documents` group; legacy audit `enabled`/`disabled`. A config with no removed key must keep `diagram_tool: likec4`. | unit | add | Table-driven inline YAML in a temp repo. Each row is an AC-19 mapping or an audit.md "Migration gaps" boundary, so the literals are the point. |
| `9.0.0.js` skip path (AC-19) | A shape it does not understand is rewritten by guessing: flow map, duplicate key, mixed EOL, out-of-enum value, tab indent. | unit | add | Audit risk "Migration corrupts consumer YAML", impact high. The file must stay byte-identical and the warning must name the re-run command. A missing config gives `absent`. Same table as above. |
| `9.0.0.js` empties a group (AC-19) | Removing every child of a group leaves an empty header, such as `git:` (null in YAML). | — | none | Accepted as specified by the orchestrator: the result is valid YAML, a re-run reports `unchanged`, and readers tolerate a null group. |
| `9.0.0.js` and sprint state (AC-19) | Active sprint state gets rewritten. | — | none | The script resolves one path, `.asd/project/config.yaml`, and never lists `.asd/sprints/`. No failure mode to test. |
| `.asd/hooks/session-start.js` (AC-14) | After `audit` the hook reports `design` for a collapsed sprint or `plan` for an uncollapsed one. Includes a legacy state with `skip_design_phases: true`. The hook could also throw on a non-object `documents`. | component | adjust | Rewrites the `run.js` hook test "sprint-011 AC-2/AC-5", which read the removed `{{SKIP_DESIGN_PHASES}}` placeholder. Design documents come from `t_state.json` `documents` minus `audit`. `execFileSync` proves exit 0 for every case. |
| `asd-phase-audit.md` exit, `checkpoints.md` plan precondition, `asd-sprint` resume (AC-14) | The collapse route is keyed on a removed field, or the three sites stop agreeing. | static/arch | adjust | Rewrites "sprint-011 AC-3/AC-5/AC-7" to key on the documents-only collapse home in `sprint-lifecycle.md`. Drops the "which trigger fired" decisions-log assertion, since only one trigger is left. Step 1 now reads `documents.*`, so the step that skips a false audit is found by its "false audit" routing. |
| Removed config keys, all sites (AC-13..AC-18, AC-20) | A removed key survives in `t_config.yaml`, the README schema or a canon reader (rule, workflow, skill, agent, hook, runtime). An agent then reads a setting nothing writes. | static/arch | adjust | Replaces "sprint-011 AC-1/AC-2/AC-4/AC-7", which asserted one name for the now-removed field. Two checks. (1) `9.0.0.js` reports `unchanged` on `t_config.yaml` and on the README schema block; the README from `main` reports `migrated`. (2) The key names are parsed from `9.0.0.js` `REMOVED_KEYS`, as §16 parses `PHASE_CHAIN`. None may appear in canon, except state fields `t_state.json` still carries (`documents.c4`) and lines marked legacy. |
| `runtime.js` `standingPredicates` and `emit-manifest` (AC-17) | The n/a predicates are still gated behind a flag, or the CLI rejects its arguments. | unit, component | adjust | "sprint-012 AC-12" and "emit-manifest writes one stamped manifest" drop `scopedFanOut`, `--scoped-fan-out` and the escape-hatch assertion. The remaining assertions then prove always-on. |
| Stale `--scoped-fan-out` in canon (AC-17) | The flag swallows the next argument. | — | none | No canon invocation passes it any more. The parser fails loudly ("flags require values", exit 2), never silently. |
| `t_config.yaml` enumerations and free strings (AC-13, AC-16) | `diagram_tool` lacks `none` in its enumeration, or the README enumeration drifts. | static/arch | adjust | "sprint-012 AC-13" `freeStrings` loses `system.tools.likec4`. Its existing default-in-enumeration and README-enumeration loops then cover `none \| likec4 \| mermaid`. |
| `asd-init` fresh steps 13 and 14 (AC-13) | The c4 seed or the `.gitignore` entry is still keyed on the removed `documents.c4`. | static/arch | adjust | "sprint-012 AC-14..AC-18" keys both conditions on `diagram_tool`. The registry seed stays unconditional and first. |
| `runtime.js` `externalPreflight` (AC-16) | External Review picks its stdin syntax from a `platform` field the preflight does not return. | unit | adjust | One assertion added to "AC-3/4/5: preflight permits only fixed local probes": `platform === process.platform`. `external-review.md` keys its table on that field name. |
| `release-manifest.json` (AC-9) | `9.0.0.js` is never delivered, or a hash is stale. | static/arch | keep | §6b and "AC-5/G-12" reverse coverage pass on HEAD with `9.0.0.js` registered. |
| Phase-chain mirrors | — | static/arch | keep | §16 is green on HEAD. No phase name changed. |
| Prose-only rules: stalemate rule and options (AC-1, AC-3); §17 proof evidence and the `Regression proof` cell (AC-4, AC-5); retro dedup and `Guardrail`/`Home` (AC-6..AC-8); audit completeness, precedence, `t_audit.md` Contradictions, hard list (AC-10..AC-12); gh-only PR and init probe (AC-15); scope blocking legacy audit values (AC-18); sanctioned config-writer wording (AC-19) | Wording drifts between rule, workflow and template. | — | none | Prose read by LLM agents, with no machine consumer. A word-match test would be coupled to wording, and impl-review judges it. Existing guards stay green: §17 restore and set-derivation sentences, retro Actions `F-N` and `consumer \| asd`, hard list `deletion … migration`, `t_audit.md` "Subsystems map", and the runtime subcommand-invocation sweep, which reaches `defect-stalemate`. |
| This repo's `.asd/project/config.yaml` (AC-20) | — | — | none | A one-time result of plan Task 8, verified at impl assessment (second run `unchanged`). `.asd/project/**` is user-owned, so this is not a behaviour that can regress. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-013 AC-1/AC-2: defect-stalemate compares the identity sets of the last two impl-test entries… | n/a |
| `tests/run.js`: sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review… | fail-first vs D-1: `node tests/run.js` → exit 1, `sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review - skipping it drops that entry's set and a real stalemate fails open` |
| `tests/run.js`: sprint-013 AC-3: the defect-stalemate CLI prints {stalemate, digest} and exits 0… | n/a |
| `tests/run.js`: sprint-013 AC-19: the 9.0.0 migration rewrites a config built from the 8.0.0 t_config.yaml… (fixtures `tests/fixtures/migrations/9.0.0/t_config-8.0.0.yaml`, `t_config-9.0.0.yaml`) | n/a |
| `tests/run.js`: sprint-013 AC-19: the 9.0.0 migration maps c4, skip_design_phases and legacy audit values… | n/a |
| `tests/run.js`: sprint-013 AC-19: the 9.0.0 migration leaves a config it cannot read line by line byte-identical… | n/a |
| `tests/run.js`: sprint-013 AC-13..AC-18/AC-20: no config key the 9.0.0 migration removes survives… (replaces sprint-011 AC-1/AC-2/AC-4/AC-7) | n/a |

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: the change surface touches framework-wide files)
- Result: fail, exit 1: 202 passed, 1 failed, 0 skipped. Failing test: `sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review - skipping it drops that entry's set and a real stalemate fails open` (D-1).
- Lint / build: pass. `git diff --cached --check` exit 0 on this entry's staged tests and plan; `node .asd/sync.js --check` exit 0, `"ok": true`, 72/72 targets current.
- HEAD: bc8ea10, worktree carrying this entry's test commit (`tests/**` and this file only; production code as at bc8ea10)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/runtime.js | AssertionError [ERR_ASSERTION]: Missing expected exception (Error): Entry "Entry 2" is off-template (t_test-plan.md: `Entry log` N or impl-review) - read as "not an impl-test entry" it hides entry 2's repeat of entry 1 and the loop runs on uncapped | sprint-013 AC-2 D-1: defect-stalemate rejects a Defects row whose Entry is neither an Entry log number nor impl-review - skipping it drops that entry's set and a real stalemate fails open | fixed | b293de8 |
