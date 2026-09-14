---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 011-explicit-design-skip

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface |

Pre-strategy run (existing tests, before authoring): `node tests/run.js` at `7f3ccf7`, exit 0, 184/184 passed. Full suite by the safety valve: the surface touches rule docs, templates, the hook and `release-manifest.json`, all framework-wide; `tests/run.js` is a single runner with no `test_affected` selector anyway.

## Risk → check decisions

The field name is fail-closed everywhere (config absent → `disabled`, state absent → `false`), so a misnamed or deleted site does not error: the setting silently does nothing. That shapes the `add` rows. Assertions derive the key from `t_state.json` and the phase names from `PHASE_CHAIN`, never from restated literals.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `session-start.js` next-phase branch (AC-5, AC-2) | The hook reports `design` after `audit` under the setting. A truthy check treats an unseeded `"{{SKIP_DESIGN_PHASES}}"` as on. The branch leaks to other phases. | unit (the hook is executed on temp-root state fixtures) | add | Executable code. One test runs five fixtures (audit + true/absent/false/placeholder, scope + true), with the field name taken from `t_state.json`, so the hook is checked against the key scope actually writes. |
| `session-start.js` never throws on any state shape (Task 3) | A new comparison throws on an odd state and blocks the session. | unit | keep | Existing hook tests run it through `execFileSync`, which throws on a non-zero exit. The new branch is a strict comparison on a property of an object `addState` already validated. The new fixture adds a non-boolean value. |
| `asd-phase-audit.md` step 5 and return contract (AC-3) | `NEXT: plan` is dropped from the contract, becomes unconditioned, lands `phase` on a subsumed phase other than the last, or appends an incomplete `skipped_phases`. | static | add | These are literal tokens. `phase="…"` must be the chain predecessor of `plan`. The appended array must equal the `PHASE_CHAIN` slice between `audit` and `plan`. The existing §16 test only asserts the `design` successor. |
| `asd-phase-plan.md` preconditions, `checkpoints.md` `plan` clause (AC-3) | `plan` ABORTs on the state the audit skip writes. | static | add | Plan's precondition line must name `skipped_phases` together with the phase audit lands on (a derived relation). The checkpoints `plan` clause must name the key. |
| `asd-sprint` resume step 4 (AC-5, G-7) | Resume re-enters `phase=design-promote` and loads that workflow, which AC-3 forbids. | static | add | The resume flow is the only site stating that a phase recorded in `skipped_phases` advances. That makes deletion the live risk. |
| `asd-sprint` step 3 exception list | A stale list of routes. | — | none | `NEXT:` is authoritative at that same step, so the list names routes without choosing them. Deleting it changes no dispatch. The route it names is pinned at the audit contract (row above). |
| `asd-sprint` step 2B.3 re-run menu exclusion | The user is offered a design-block re-run under the setting. | — | none | This is agent-runtime judgement over an interactive menu, with no enumerable token. The consequence is benign by construction: with the setting on, scope freezes every design document `false`, so a re-run design collapses again. That freeze is pinned by the `t_state.json`/scope row below. |
| `t_state.json` field, `t_config.yaml` declaration, README schema line (AC-1, AC-2, AC-7) | The key is missing or misspelt at one site. The shipped default is not `disabled`. The template stops parsing as JSON. | static | add | The key is derived from the `t_state.json` placeholder. `t_config.yaml` and the README must declare it at top level with default `disabled`. `JSON.parse` of the template is the parse check. |
| `asd-init` re-init step 2a (AC-1, AC-6 path) | Diff mode never offers a field the current config lacks, so AC-6 has no allowed write path. | static | add | The re-init section must consult `t_config.yaml`. It is the only site that makes a newly shipped field offerable. |
| `asd-init` fresh-mode mentions (steps 2, 8a, 9, artefact list), self-hosting recommendation | The field is not prompted on fresh init. | — | none | Step 9 writes config from `t_config.yaml`, so the field reaches config through the template declaration pinned above. The mentions describe the prompt set, and the recommendation is agent-runtime judgement with no routing effect. |
| `asd-phase-scope.md` step 3a (AC-2, AC-4) | The placeholder is never seeded. The design documents are not frozen `false`. The suppressed-documents log line is lost. | static | add | Scope is the site that writes `state.json`. After `{{SKIP_DESIGN_PHASES}}`, the seeding line must name `config.<key>`, every `{{DOC_*}}` placeholder of the no-op table's design documents, and `decisions-log`. |
| `sprint-lifecycle.md` home paragraph and no-op table design row (AC-2, AC-4, AC-7) | The home drops the `state.json` freeze. The no-op row loses the trigger. The home freezes fewer documents than the table's other trigger names. | static | add | The document set is derived from the no-op table's design row, and the home must name each document (a relation between two lines of the same file). The row-count guard (`>= 4`) keeps the derivation from going vacuous. |
| `sprint-lifecycle.md` "Multi-phase skip" "either of its triggers" and the collapse line naming two sites | Rule narrative drifts from the acting site. | — | none | The mechanics are pinned at the acting workflow (audit row) and at the no-op row. These sentences choose no dispatch and write no state. |
| `asd-phase-design-review.md`, `asd-phase-design-promote.md` collapse wording (G-9) | Stale wording implies a documents-only trigger. | — | none | Both phases are never dispatched after a collapse, so no agent evaluates the text in the case it describes. Their documents-case routing is unchanged and still asserted by §16. |
| `asd-phase-audit.md` step 1 "recorded reason" removal (G-12) | The phrase is reintroduced. | — | none | `t_state.json` has no reason key for any reader to act on, so reintroducing the phrase routes nothing. |
| `release-manifest.json` hashes, generated views (R-8) | Stale hashes or generated views. | static | keep | The existing `upstream_hashes`/`canon_hashes` and `sync.js --check` tests fire on any drift. The mutation runs below show them firing. |
| `PHASE_CHAIN` and "Eleven mandatory" count words (R-4) | Rewording turns the chain mirrors red. | static | keep | Existing §16 chain and count-word tests, unchanged and green. |
| README FAQ "Can I skip PRD/UX-spec/ADR/C4" paragraph | The prose explanation goes stale. | — | none | The schema block is the machine-readable mirror (pinned above). The paragraph restates mechanics pinned at their acting workflows. |
| `AGENTS.md` tail sentence, `.asd/project/config.yaml` `skip_design_phases: enabled` (AC-6) | The repo's claim disagrees with its config. | — | none | Owner is `pr`: `plan.md`'s sprint-specific DoD verifies AC-6 by reading the config, which sits outside the review surface. The suite deliberately never reads this repo's live `.asd/project/config.yaml` (only a temp mini-repo stands in for it, `tests/run.js` `buildSyncPlan` test). |

## Removed tests

None. No existing test is duplicated by the additions: the §16 successor test asserts audit's `design` target, and the new test asserts the `plan` target plus the skip write.

## Added tests

Proof procedure: back up the file in memory, mutate, run the full suite, and restore in the same `finally` (one tool call per batch). Every run reported `restored=true` (byte comparison). Afterwards `git status` showed no production change. The quoted assertion is the first one that fired in the named test, transcribed from the runner output. Every canon mutation also failed `release-manifest.json: every upstream_hashes entry matches` (and `sync.js --check` / `canon_hashes` for the hook and skills). That is expected ledger noise.

| Test | Regression proof |
|---|---|
| `tests/run.js`: `sprint-011 AC-2/AC-5: SessionStart reports "Next phase: plan" after audit only when the frozen design-skip field is the boolean true …` | M1 hook branch disabled (`(false) ? 'plan'`): `audit + skip_design_phases=true -> design` vs expected `plan`. M2 `=== true` dropped (truthy): `audit + skip_design_phases="{{SKIP_DESIGN_PHASES}}" -> plan` vs `design`. M3 `phase === 'audit' &&` dropped: `scope + skip_design_phases=true -> plan` vs `audit`. M11 `t_state.json` key renamed to `skip_design_phase`: `audit + skip_design_phase=true -> design` vs `plan` (the name relation between hook and template). |
| `tests/run.js`: `sprint-011 AC-3/AC-5/AC-7: the audit exit that emits NEXT: plan is keyed on skip_design_phases, …` | M4 contract `NEXT: <design>`: "asd-phase-audit.md's return contract must offer NEXT: plan". M7 condition reworded away from `` `skip_design_phases` ``: "the audit step emitting NEXT: plan must be conditioned on the frozen `skip_design_phases`". M5 `phase="design"`: "the skip write must land phase on the PHASE_CHAIN predecessor of plan". M6 array without `"design-review"`: "the skip write must record exactly the phases PHASE_CHAIN places between audit and plan". M8 plan precondition clause removed: "asd-phase-plan.md preconditions must accept skipped_phases containing `design-promote`". M9 checkpoints clause without the key: "checkpoints.md's plan precondition must accept the `skip_design_phases` collapse". M10 resume clause removed: "the asd-sprint resume flow must dispatch the successor of a phase recorded in skipped_phases". Reword checks (substance kept, wording changed): R1 audit step 5 rewritten end to end, R2 checkpoints `plan` clause rewritten, both GREEN for this test. |
| `tests/run.js`: `sprint-011 AC-1/AC-2/AC-4/AC-7: the design-skip field is one name across t_state.json, t_config.yaml, …` | M12 `t_config.yaml` default `enabled`: "t_config.yaml must declare top-level `skip_design_phases` with the shipped default disabled" (M11's rename fires the same assertion first, with `<not declared at top level>`). M13 README key renamed: "README's config schema must mirror `skip_design_phases`". M14 `asd-init` step 2a without `t_config.yaml`: "asd-init diff mode must consult t_config.yaml". M15 scope `from config`: "asd-phase-scope.md must seed "{{SKIP_DESIGN_PHASES}}" from `config.skip_design_phases`". M16 home without `state.json.skip_design_phases`: "sprint-lifecycle.md "Optional documents" must hold the home statement". M17 no-op row without the trigger: "the no-op table's design row must name `skip_design_phases` as a trigger". M18 home without `` `adr` ``: "the `skip_design_phases` home must freeze every design document" (actual `['adr']`). M19 scope freeze without `{{DOC_ADR}}`: "asd-phase-scope.md, the site that writes state.json, must write every design-document placeholder as false" (actual `['adr']`). M20 scope decisions-log clause removed: "asd-phase-scope.md must log the design documents `skip_design_phases` suppresses". Reword check R3, the scope freeze clause rewritten with a reordered placeholder list: GREEN. Limits: `c4` cannot prove M18, because the home names it twice ("like effective `c4`"), so `adr` was used. The `t_state.json` key guard and the `designDocs.length >= 4` guard are vacuity guards, not mutation-proven. |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once every reviewer is APPROVE/latched. The `pr` gate
always reads whatever is recorded here last — the full-suite record, by the time `pr` runs.

- Command: pending (suite gate runs after the test commit)
- Scope: impacted (degraded to full by the safety valve)
- Result: pending
- Lint / build: pending
- HEAD: pending

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
