---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 012-retro-010-011-subsystem-docs

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | b7a54c59faa44c1b98eb220bb84d7d944fa887c1 | full change surface |

## Risk → check decisions

Pre-strategy run at `8fa5d97` (entry 1, impacted set = full suite via the shared-infrastructure safety valve): 186/187, one red — `runtime.js CLI: manifest-digest … --write stamps every published constant` failed its fingerprint assertion because AC-1 added a third stamped constant.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `stampManifest`, `LEDGER_NA_SHAPE` (AC-1) | `n_a_shape` not stamped, not digest-covered, or stamped with a field set the identity expectation does not know | unit (CLI) | keep (updated) | Stale test `manifest-digest … (vocabulary, row example, n_a shape)` updated: expected identity now includes `n_a_shape`, plus an exact stamped-field-set assert so a fourth constant cannot move digests silently. Its existing per-field digest-coverage sweep already derives from what `--write` stamps. |
| `validateCoverageLedger` `n_a_shape` equality (AC-1) | a manifest stamped before `n_a_shape` rejected; a divergent `n_a_shape` accepted | unit | keep (updated) | Backward-tolerance test generalized from two hand fixtures to every publication-order prefix of the published constants (§17 derive rule), `n_a_shape` added with its divergence case. |
| `LEDGER_NA_SHAPE` vs validator and `review-policy.md` "Coverage ledger" (AC-1) | published shape is one the validator rejects, or prose names other row types | unit + static relation | add | Same class as sprint 010's row-example test: a filled copy built from the constant's own entries must validate; the policy line's row types derived and compared to the vocabulary's. |
| `emitCoverageManifests` partition, `SPLIT_THRESHOLD_FILES`, `--halve` (AC-3) | wrong part count, overlapping or dropped files, missing out-of-part predicate, part that fails validation, halving a one-file scope | unit | keep (rewritten in place) | The sprint-008 split test hand-built halves and stamped them with `manifest-digest --write` — the procedure `review-policy.md` "Partition" retired. Rewritten against the emitter at threshold, threshold+1, 2×threshold+1 and `--halve`. Its "partial ledger vs unpartitioned manifest rejected" assert was dropped: duplicate of `AC-1/2` `missing row`. |
| `rubricIds`, `standingPredicates`, `isUiSurface`, `isExecutable`, `NA_TARGETS` (AC-12) | ids parsed across the next `##` or from nested bullets; a predicate granted without its condition (scoped fan-out, UI surface incl. `.asd/templates/*.html`, budgets heading, executable file, ux-spec draft); an entry phase-gated in both phases; a rubric heading rename orphaning a predicate target silently | unit, against fixtures and every real internal reviewer rubric | add | Executable logic with a blocking gate downstream; the real-rubric sweep is the only place a canon heading edit meets the emitter before a live review dispatch. |
| sprint-010 documentation-economy test's local rubric parser (AC-12) | test re-implements the derivation `emit-manifest` now owns, so the two can diverge while the test stays green | unit | keep (updated) | Parser replaced by `emitCoverageManifests`; hardcoded reviewer list replaced by `internalReviewers()` derived from `.asd/agents/`. |
| `emit-manifest` CLI, `parseFlagArgs` booleans, part file names, `ledgerFromText` (AC-12) | `--scoped-fan-out` swallows the next flag; file names differ from the ones both review workflows dispatch from; printed and written digests differ; `validate-ledger` cannot read a returned text, or picks one of two ledger blocks | CLI contract | add | End to end through the real CLI, the seam both workflows now call. Bare-JSON input stays covered by the existing `validate-ledger exits 0` test. |
| `emitManifestCommand` `--reviewer` name guard (`^[a-z]+$`) | path traversal via the reviewer name into the rubric read / manifest write | — | none | The name is composed by the phase workflow from its fixed reviewer set, never read from reviewer or user output, so no untrusted input reaches it. Becomes assertable-worthy the day a reviewer name is taken from returned text. |
| canon citations of `.asd/runtime.js` symbols, `node .asd/runtime.js <subcommand>` invocations, quoted `` `n/a: <predicate>` `` literals (AC-3, AC-12) | prose points at a renamed symbol or subcommand; an agent teaches a predicate the emitter never authorizes (ledger rejected at the blocking gate); plan sizing citation deleted | static relation | add | Derived sweeps over all canon Markdown, README and AGENTS.md. Asserts membership, not the "sole home" wording of `review-policy.md`/`NA_PREDICATES`: `outside phase gate` is quoted in 4 canon files as DoD vocabulary and `asd-reviewer-efficiency.md` Stop conditions still restates `no budgets defined` with its condition — a documentation-economy question for impl-review, not a suite defect. |
| `review-policy.md` Immutability, payload list; both review workflows (AC-2, AC-4, AC-12) | re-stamp permitted; attempt record absent from payload or list; hand-stamping instruction survives | static | add | Home + acting-site pairs, citations asserted at the acting line; removed instruction asserted absent. |
| `providers.md` declared tool policy; `core.md`, `artifact-layout.md` "Agent memory" (AC-5, AC-6) | definition or refusal signal deleted; pointer from either consuming site lost | static | add | Single-home rule nothing else pins; pointers are the machine-decidable part of AC-6's pre-write check. |
| `git-strategy.md` "Commit before review" (AC-7) | own agent-memory writes of a committing agent left ownerless | static | add | Assert appended to the existing AC-13b test; reword mutation stays green. |
| `review-policy.md` "Verify before applying", impl review-fix payload, design-review autofix bullet (AC-8) | non-binding statement deleted; payload restatement returns | static | add | Asserts appended to the existing AC-11 test (removed phrases, not topic words). |
| `code-style.md` §17, `sprint-lifecycle.md` "Impacted test set", `t_test-plan.md` "Suite run" (AC-9, AC-10) | rule bullets deleted; template loses its pointer | static | add | Single-home rules nothing pins. |
| `asd-dev.md` COMPLETED ↔ `asd-phase-impl.md` steps 6/10/11 (AC-11) | report field renamed on one side; step 10 loses its gate-policy classification | static relation | add | Literal derived from the agent, asserted at each acting step. |
| settings-change grammar ↔ `t_plan.md`, `asd-phase-impl.md` steps 8/9, `asd-init` modes/return contract/"Always first", `asd-sprint` "Skills dispatched", `core.md` Invariants, `t_AGENTS.md` (AC-13) | grammar drift; mode missing from return contract; asd-sprint forbids the dispatch; config.yaml fails the completion gate; managed-block sync touches unauthorised paths | static relation | add | Token and mode name derived from their homes. Root `AGENTS.md` block: keep — `sync.js --check` test. |
| subsystem registry: `artifact-layout.md`, `core.md`, `sprint-lifecycle.md`, `asd-phase-plan.md`, `asd-phase-design-promote.md`, `t_audit.md`, `asd-architect.md`, `t_subsystems.md`, `t_subsystem.md`, `checkpoints.md`, `asd-init`, README folder map (AC-14..AC-18) | a site still naming `c4/` as registry; architect grant missing the paths it is dispatched to write; reserved ids drift from the occupied `docs/architecture/` names; templates missing or without responsibility frontmatter; `t_subsystems.yaml`/`architecture.html` surviving; legacy `subsystems.yaml` outside audit migration; migration deletion off the hard list; `c4/` seeded without `documents.c4`; README tree drift | static relation | add | Registry path, reserved ids, template names and tree entries all derived from `artifact-layout.md`. |
| `.asd/release-manifest.json` hashes, `t_subsystems.yaml` removal, new templates registered (AC-18) | stale or unregistered entries | static | keep | Existing forward (`every upstream_hashes entry matches`) and reverse (`every file under managed_paths HAS an upstream_hashes entry`) tests, plus `canon_hashes` match. |
| generated views, `.asd/sync-state.json` (AC-19) | canon edited without `--apply` | static | keep | Existing `sync.js --check reports every item current` test. |
| `external-review.md`, `t_prompt-external-design.md`, `asd-phase-design.md`, `t_config.yaml` comments, `README.md` prose rows (runtime.js description, `/asd-init` row, LikeC4 section) | wording drift in descriptions | — | none | Descriptive prose with no token a workflow parses; the retired names they dropped are covered by the registry test's absence sweep, the README tree by its mirror assert. Assertable only if one of them grew an enumeration of a canonical set. |
| `sprint-lifecycle.md` "Audit phase"/"Design-promote phase" registry procedure, `asd-phase-audit.md` step 3a (AC-17) | an agent skipping per-subsystem confirmation or backfill at runtime | — | none | Agent-runtime judgement in audit/promote; the literal contracts (hard-list entry, citation, write grant, registry path) are pinned above. Owner: impl-review Correctness reviewer. |

## Removed tests

None.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js`: `runtime.js CLI: manifest-digest … (vocabulary, row example, n_a shape) …` (updated) | fail-first: red at `8fa5d97` pre-strategy (`the persisted digest must be the hash of the stamped manifest…`). Mutation `stampManifest` drops `n_a_shape` → first FAIL `sprint-012 AC-1: --write must stamp exactly the published constants…` |
| `tests/run.js`: `AC-5/AC-6b/sprint-012 AC-1: validate-ledger tolerates … every publication-order prefix …` (updated) | mutation validator requires `n_a_shape` → thrown `manifest n_a shape invalid` at the zero-constant prefix; mutation `false &&` on the equality check → `Missing expected exception: a hand-edited manifest publishing a \`n_a_shape\`…` |
| `tests/run.js`: `sprint-012 AC-1: the published n_a shape keys exactly …` | mutation `LEDGER_NA_SHAPE` values keyed without ids → `the shape is published so an n_a written to it is one the validator reads back…`; mutation `review-policy.md` `"<files\|rules\|sections>"` → `"<files\|rules>"` → `review-policy.md's published shape must name the row types…` |
| `tests/run.js`: `AC-1/6/sprint-012 AC-3: emit-manifest partitions a scope above SPLIT_THRESHOLD_FILES …` (rewritten in place) | mutation `Math.ceil` → `Math.floor` → `26 file(s): AC-3 fixes the part count…`; slice end `+ 1` → `26 file(s): the parts' file lists must concatenate back…`; out-of-part concat removed → `26 file(s) part 1: rules "Alpha" must carry the out-of-part predicate…` |
| `tests/run.js`: `sprint-012 AC-12: emit-manifest derives rule and section ids …` | mutations, each first FAIL: rubric body not cut at next `##` → `review-policy.md "Rubric ID derivation": a sectioned rubric yields…`; `.asd/templates/` carve-out removed → `.asd/templates/t_prd.html is a UI surface…`; UI predicate without `scopedFanOut` → `without --scoped-fan-out no entry degrades to n/a…`; perf predicate without `!hasBudgets` → `a perf-budgets heading in custom-coding-rules.md defeats both predicates`; phase gate by other-phase name only → `a ux-spec draft in design-review scope must lift exactly the UI conformance entry…`; missing target filtered instead of failing → `Missing expected exception: renaming a rubric entry a standing predicate targets…` |
| `tests/run.js`: `sprint-010 AC-7/G-9: … Documentation economy …` (updated) | mutation runtime bold-label regex requires `:**` → `G-9: review-policy.md derives every manifest's rubric ids…` |
| `tests/run.js`: `runtime.js CLI: emit-manifest writes one stamped manifest per part …` | mutation `scoped-fan-out` dropped from boolean flags → thrown `Command failed: … emit-manifest … --scoped-fan-out --files …`; part name `part-N` → `partN` → `a scope above the threshold must be written as numbered parts…`; `blocks.length !== 1` → `< 1` → `returned text carrying two ledger blocks must be rejected… Got: {"ok":true}`; `ledgerFromText` bypassed → `AC-12: --ledger must take the reviewer's returned text as-is…` |
| `tests/run.js`: `sprint-012 AC-3/AC-12: every \`.asd/runtime.js\` symbol canon cites …` | mutation impl-review workflow `emit-manifest` → `emit-manifests` → `every subcommand canon tells an orchestrator to run…`; `review-policy.md` `SPLIT_THRESHOLD_FILES` → `SPLIT_THRESHOLD` → `canon hands member lists and predicate text to named runtime.js symbols…`; efficiency agent `n/a: no budgets defined` → `no budget defined` → `a reviewer copies a quoted \`n/a: <predicate>\`…`; `asd-phase-plan.md` citation removed → `AC-3: .asd/workflows/asd-phase-plan.md must cite the split threshold…` |
| `tests/run.js`: `sprint-012 AC-2/AC-4/AC-12: both review workflows emit manifests …` | mutation `**Immutability**` → `**Persistence**` → `AC-2: "Coverage ledger" must make a dispatched manifest immutable…`; hand-stamp instruction re-added to design-review split bullet → `…the hand-stamping instruction the emitter replaced must be gone…`; attempt record removed from impl-review payload → `…AC-4 - a re-dispatched reviewer's payload must carry…`. The same `emit-manifests` mutation above also fires `…AC-12 - manifests must come from emit-manifest…` here |
| `tests/run.js`: `sprint-012 AC-5/AC-6: providers.md "Role-scoped context" defines the declared tool policy …` | mutation `core.md` citation removed → `.asd/rules/core.md "Autonomy and escalation" must point at the declared tool policy…`; `` `QUESTION` `` → `a question` → `AC-5: the refusal must name the signal an agent returns…` |
| `tests/run.js`: `AC-13b/sprint-010 AC-3: git-strategy.md "Commit before review" …` (AC-7 assert added) | mutation sentence deleted → `sprint-012 AC-7: the orchestrator clause names only a memory write…`; reword mutation (same substance, different wording) → green |
| `tests/run.js`: `AC-4/AC-11/AC-14: review-policy.md carries …` (AC-8 asserts added) | mutation `The suggested fix is non-binding.` removed → `sprint-012 AC-8: the suggested fix must be non-binding at its home…`; `suggested fix` re-added to impl review-fix payload → `sprint-012 AC-8: the review-fix payload must no longer hand the dev a suggested fix…` |
| `tests/run.js`: `sprint-012 AC-9/AC-10: code-style.md §17 obliges …` | mutation §17 derive bullet deleted → `AC-9: §17 must require deriving a named set…`; `t_test-plan.md` pointer removed → `AC-10: t_test-plan.md "Suite run", where the record is written, must carry the lag as a pointer to its home` |
| `tests/run.js`: `sprint-012 AC-11: the report field asd-dev.md COMPLETED carries …` | mutation `asd-dev.md` `Flagged choices:` → `Flagged decisions:` → `asd-phase-impl.md step 6 must read the literal \`Flagged decisions:\`…`; step 10 gate citation removed → `step 10 must classify a flagged choice under the gate policy…` |
| `tests/run.js`: `sprint-012 AC-13: the settings-change line …` | mutation return contract drops `sprint-mediated` → `asd-init's return contract must enumerate exactly the modes it declares`; asd-sprint clause removed → `asd-sprint "Skills dispatched" must admit asd-init in that mode…`; step 9 `config.yaml` clause removed → `the completion gate must count config.yaml as authorised…`; `mode skips it` → `mode runs it too` → `the managed-block sync writes AGENTS.md/CLAUDE.md…` |
| `tests/run.js`: `sprint-012 AC-14..AC-18: docs/architecture/subsystems.md is the one subsystem registry …` | mutation `core.md` Glossary registry → `c4/` → `AC-14/AC-17: core.md Glossary "Subsystem" must name docs/architecture/subsystems.md…`; reserved list drops `c4` → `AC-14: subsystem files sit flat in docs/architecture/…`; README tree drops `<subsystem>.md` → `AC-18: README.md's folder map mirrors…`; architect grant removed → `AC-17: audit and design-promote dispatch asd-architect…`; `t_subsystem.md` `excludes:` removed → `.asd/templates/t_subsystem.md: a persistent Markdown doc declares ownership…`; `architecture.html` added to README → `AC-16: the mermaid registry template and the architecture.html build output are retired everywhere…`; hard-list migration deletion removed → `deleting a legacy c4/ at audit removes project files…`; asd-init `Only if \`documents.c4\` is also enabled:` → `Also:` → `AC-16/AC-18: asd-init must seed c4/ only under the documents.c4 condition…` |

Every mutation above ran in one call with an in-memory byte restore verified by buffer compare; canon mutations additionally fail the `upstream_hashes` ledger test (agent files also `canon_hashes` and `sync.js --check`) — expected artefact of the mutation, not a finding.

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once every reviewer is APPROVE/latched. The `pr` gate
always reads whatever is recorded here last — the full-suite record, by the time `pr` runs. Each
per-entry record measures only the tree that entry analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (impacted set = full suite: the shared-infrastructure safety valve fired — framework-wide canon and `.asd/runtime.js` changed)
- Scope: impacted
- Result: pass — 197 passed, 0 failed, 0 skipped (exit 0)
- Lint / build: pass — `git diff --cached --check` exit 0 on each staged commit; `node .asd/sync.js --check` exit 0, 72/72 items `current`
- HEAD: 4b3b966 — includes this entry's own test commit; the impl-review terminal full-suite run remains the only record of the final tree

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

None.
