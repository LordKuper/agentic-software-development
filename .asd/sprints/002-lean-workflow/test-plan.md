---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 002-lean-workflow

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | b13d77c70e171e34abea6e3a52ed777fa51e3577 | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Task 1: ledger-summary review compression (`t_review.md`, 8 agent files regenerated) | `sync.js --check` goes dirty if `--apply` didn't run for all 8 regenerated agent files | static (existing `sync.js --check` CLI test) | none | `tests/run.js`'s `` `node .asd/sync.js --check` reports every item current `` test already asserts every agent-derived target is `current` — this is a generic drift check, not hardcoded per-file, so it automatically covers these 8 files with no test change needed |
| Task 2/16: `t_audit.md` section removal, BA/Architect parallel dispatch | prose/workflow-dispatch change only — no code path in `sync.js`/`update.js`/`session-start.js` reads `t_audit.md` structure | none | none | no behaviour change in tested code; `audit.md` assembly is agent-authored prose, outside `tests/run.js` scope per `sprint-lifecycle.md` gap G-13 |
| Task 3: `t_plan.md` compression, DoD moved to rule doc | none — parser-critical checkbox format explicitly re-confirmed unchanged in the task itself | none | none | no code parses `plan.md` in this repo (task parsing is agent behaviour, not `tests/run.js`); format re-verified by inspection in Task 20 |
| Task 4/17: `t_test-plan.md` compression, incremental re-entry | none — template/workflow prose only | none | none | no code path |
| Task 5: `t_state.json` — delete `subsystems_touched`/`new_subsystems`, document `archived_at` | schema drift: a stale `canon_hashes`/`upstream_hashes` entry would misclassify the file on the next `sync.js --check` or `update.js` run | unit (existing hash-consistency tests) | keep | `release-manifest.json: every canon_hashes entry matches the actual file` and the matching `upstream_hashes` test recompute the digest from the live file and fail if the recorded hash is stale — this is the real regression risk for a schema-affecting edit, already covered generically (not hardcoded to a field list), confirmed green this run |
| Task 6: decisions-log moved from `.asd/project/decisions-log.md` to `<sprint>/decisions-log.md` | none machine-checkable — no code reads or writes this path in `sync.js`/`update.js`/hooks | none | none | grep of `tests/` and `tests/fixtures/` for `decisions-log` returns no hits; purely a workflow-dispatch/rule-doc convention |
| Task 7/8: `t_prd.html`/`t_ux-spec.html`/`t_accessibility.html` section compression | none — HTML artifact templates are agent-authored content, never parsed by `sync.js` | none | none | no code path |
| Task 9: delete `.asd/templates/t_api.html`; remove its `release-manifest.json` `canon_hashes`/`managed_paths`/`upstream_hashes` entries | (a) a stale reference to the deleted file left in the manifest would be caught by nothing generic; (b) full-file sync-plan enumeration could silently miss a target if hardcoded | (a) unit — hash-consistency tests; (b) static — sync-plan enumeration test | keep | (a) the hash-consistency tests iterate `Object.entries(manifest.upstream_hashes)`/`canon_hashes` and assert the file exists on disk for each entry — since Task 9 removed `t_api.html`'s entries cleanly, there is nothing to go stale, and the test passing green confirms no dangling entry was left; (b) the sync-plan enumeration test derives its expected-target set by walking `.asd/agents`/`.asd/skills` from disk, not from a hardcoded list, so a deleted *template* (not an agent/skill) was never in its scope to begin with — no fixture or assertion hardcodes `t_api.html`, confirmed by grep |
| Task 10: stop committing C4 `dist/`+`architecture.html`; add `.gitignore` entries; seed a build-to-view command in `asd-init`'s `commands.yaml` template | none machine-checkable — `.gitignore` and template seeding aren't exercised by `tests/run.js` | none | none | no code path; the seeded command only ever lands in a future consumer's own `commands.yaml`, never this repo's |
| Task 11/12: trim `t_html-shell.html`; change design-system regen cadence | none — HTML shell trimming and regen-cadence wording are agent-followed rules, not code | none | none | no code path |
| Task 13: `review.scoped_fan_out` config field added to `t_config.yaml`; new `state.json.reviews.impl.verdicts["iter-NN"]` value `"skipped: <predicate>"` | new config surface and new verdict value, but consumed only by workflow prose (`asd-phase-impl-review.md`, `asd-phase-pr.md`) — no `sync.js`/`update.js`/hook code parses `config.yaml` fields or verdict strings | none | none | grep of `tests/` for `scoped_fan_out` returns no hits; `session-start.js`'s `PHASE_CHAIN` (the only hook under test) is untouched by this task; the new verdict value is read by an agent, not by tested code |
| Task 14: collapse three no-op design phases; write `phase="design-promote"` + `skipped_phases` | `PHASE_CHAIN`/`nextPhase()` in `session-start.js` unchanged per task's own note (verified — task explicitly does not touch them) | static (existing `SessionStart hook` tests) | none | the two `SessionStart hook` tests already exercise `session-start.js` end-to-end and stay green because this task never edits that file; no new phase-chain behaviour was introduced into tested code |
| Task 15: phase workflows write `state.json` inline for non-gate writes | none — no hook/CLI code writes or validates `state.json` shape in this repo (that happens at runtime inside a dispatched agent) | none | none | no code path |
| Task 18/19: conditional PR DoD checks; dedupe review-edge ownership | none — workflow/rubric prose only | none | none | no code path |
| Task 20: consistency sweep | verification-only task, no canonical file changes | none | none | task itself states "Affected canonical files: none" |
| `AGENTS.md` line 2 wording tweak (self-hosting exemption text) | none — the `sync.js --check` test's `SELF_SOURCED_ALLOWLIST` already expects `AGENTS.md` to report `modified-foreign` regardless of its content | static (existing test) | none | test asserts allowlist membership, not content, so unaffected |

## Removed tests

None. No test in `tests/` targets code, config shape, or fixture content this sprint's 20 tasks touched — the whole change surface is prose/workflow/agent/template edits plus two generic, self-verifying `release-manifest.json` bookkeeping updates (Tasks 5 and 9), both of which the existing hash-consistency and drift-check tests already cover without modification.

## Added tests

None. Every material, machine-checkable risk in this sprint's change surface (state.json schema drift, release-manifest.json ledger integrity after `t_api.html`'s deletion, sync-plan target enumeration) is already covered by existing, non-hardcoded assertions in `tests/run.js` (see Risk → check decisions). No sprint task touched `.asd/sync.js`, `.asd/skills/asd-update/update.js`, or `.asd/hooks/session-start.js` — the only files `tests/run.js` exercises — so there is no new code path requiring a new test. The remaining 18 tasks are prose/structure edits to rule docs, templates, workflows and agent instructions verified by Task 20's cross-file consistency sweep (not automatable — `sprint-lifecycle.md` gap G-13), which is inspection already performed and recorded in `plan.md`, not test-engineer scope to redo.

## Suite run

- Test — command: `node tests/run.js` (per `commands.yaml` `test`)
  Result: exit 0, pass — 77/77 passed, 0 failed, 0 skipped
- Lint — command: `git diff --check` (per `commands.yaml` `lint`)
  Result: exit 0, clean — no output (no whitespace errors in the diff)
- Build — command: `node .asd/sync.js --check` (per `commands.yaml` `build`)
  Result: exit 0, `"ok": true` — 68 items reported, all `status: "current"` except `AGENTS.md: "modified-foreign"` (expected self-hosting exemption per `SELF_SOURCED_ALLOWLIST`, asserted by an existing `tests/run.js` test, not a failure)

## Defects

None found.

## Manual verification (optional)

None. Every change in this sprint's scope is Markdown/YAML/JSON/HTML prose or config with no visual UI, third-party live integration, or UX-feel surface — nothing here is genuinely impossible to automate, and the automatable surface is already fully covered above.
