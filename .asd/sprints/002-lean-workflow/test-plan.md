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
| 2 | 2837b31e0be63b4cbcddfdcb7724f5564fd9446d | delta since entry 1 — impl-review iter-01 review-fix (62 files, 4 review-fix batches: phase-skill Write/Edit grants, external-review pathspec fix, architect.md contract corrections, t_html-shell.html/t_adr.html dead-code cleanup + color tokens + dark-mode + TOC_ASSETS conditional + multi-ADR id fixes, residual api/adr reference removal, write-allowlist widening, AC-source pointer fixes, pr-phase gate fixes, ~25 misc text/citation corrections) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Task 1: ledger-summary review compression (`t_review.md`, 8 agent files regenerated) | `sync.js --check` goes dirty if `--apply` didn't run for all 8 regenerated agent files | static (existing `sync.js --check` CLI test) | none | `tests/run.js`'s `` `node .asd/sync.js --check` reports every item current `` test already asserts every agent-derived target is `current` — this is a generic drift check, not hardcoded per-file, so it automatically covers these 8 files with no test change needed |
| Task 2/16: `t_audit.md` section removal, BA/Architect parallel dispatch | prose/workflow-dispatch change only — no code path in `sync.js`/`update.js`/`session-start.js` reads `t_audit.md` structure | none | none | no behaviour change in tested code; `audit.md` assembly is agent-authored prose, outside `tests/run.js` scope per `sprint-lifecycle.md` gap G-13 |
| Task 3: `t_plan.md` compression, DoD moved to rule doc | none — parser-critical checkbox format explicitly re-confirmed unchanged in the task itself | none | none | no code parses `plan.md` in this repo (task parsing is agent behaviour, not `tests/run.js`); format re-verified by inspection in Task 20 |
| Task 4/17: `t_test-plan.md` compression, incremental re-entry | none — template/workflow prose only | none | none | no code path |
| Task 5: `t_state.json` — delete `subsystems_touched`/`new_subsystems`, document `archived_at` | schema drift: a stale `canon_hashes`/`upstream_hashes` entry would misclassify the file on the next `sync.js --check` or `update.js` run | unit (existing hash-consistency tests) | keep | *(corrected entry 2, per reviewer finding #2)* `t_state.json`'s digest lives only in `upstream_hashes` (matched via `managed_paths`'s `.asd/templates` expansion) — templates are never part of `canon_hashes` (`computeCanonHashes` only walks `.asd/agents`/`.asd/skills`). Neither ledger is actually read by `sync.js --check`'s drift classification (`statusFullFile` etc. re-render straight from canon at runtime); the real risk is `--apply`'s `recomputeAndWriteHashLedgers` going stale if a canon/template edit isn't followed by a re-run. The `upstream_hashes` test recomputes the sha256 straight from the live file and fails if the recorded digest doesn't match — since Task 5 changed `t_state.json`'s bytes, that recompute only stays green if the ledger was correctly refreshed alongside the edit, which it was; confirmed green this run |
| Task 6: decisions-log moved from `.asd/project/decisions-log.md` to `<sprint>/decisions-log.md` | none machine-checkable — no code reads or writes this path in `sync.js`/`update.js`/hooks | none | none | grep of `tests/` and `tests/fixtures/` for `decisions-log` returns no hits; purely a workflow-dispatch/rule-doc convention |
| Task 7/8: `t_prd.html`/`t_ux-spec.html`/`t_accessibility.html` section compression | none — HTML artifact templates are agent-authored content, never parsed by `sync.js` | none | none | no code path |
| Task 9: delete `.asd/templates/t_api.html`; remove its `release-manifest.json` `canon_hashes`/`managed_paths`/`upstream_hashes` entries | (a) a stale reference to the deleted file left in the manifest would be caught by nothing generic; (b) full-file sync-plan enumeration could silently miss a target if hardcoded | (a) unit — hash-consistency tests; (b) static — sync-plan enumeration test | keep | *(corrected entry 2, per reviewer finding #2)* (a) only the `upstream_hashes` hash-consistency test applies — templates (including the deleted `t_api.html`) are never tracked in `canon_hashes` (`computeCanonHashes` only walks `.asd/agents`/`.asd/skills`), so there was never a `canon_hashes` entry to clean up. The `upstream_hashes` test explicitly `fs.existsSync`-checks each entry's path and reports it stale/missing if absent; since Task 9 deleted the file and its manifest entry together, there is nothing left to flag, confirmed green. (b) unchanged: the sync-plan enumeration test (`` `node .asd/sync.js --check` reports every item current `` ) derives its expected-target set by walking `.asd/agents`/`.asd/skills` from disk, not from a hardcoded list or `.asd/templates`, so a deleted template was never in its scope to begin with — confirmed by grep that no fixture or assertion names `t_api.html` |
| Task 10: stop committing C4 `dist/`+`architecture.html`; add `.gitignore` entries; seed a build-to-view command in `asd-init`'s `commands.yaml` template | none machine-checkable — `.gitignore` and template seeding aren't exercised by `tests/run.js` | none | none | no code path; the seeded command only ever lands in a future consumer's own `commands.yaml`, never this repo's |
| Task 11/12: trim `t_html-shell.html`; change design-system regen cadence | none — HTML shell trimming and regen-cadence wording are agent-followed rules, not code | none | none | no code path |
| Task 13: `review.scoped_fan_out` config field added to `t_config.yaml`; new `state.json.reviews.impl.verdicts["iter-NN"]` value `"skipped: <predicate>"` | new config surface and new verdict value, but consumed only by workflow prose (`asd-phase-impl-review.md`, `asd-phase-pr.md`) — no `sync.js`/`update.js`/hook code parses `config.yaml` fields or verdict strings | none | none | grep of `tests/` for `scoped_fan_out` returns no hits; `session-start.js`'s `PHASE_CHAIN` (the only hook under test) is untouched by this task; the new verdict value is read by an agent, not by tested code |
| Task 14: collapse three no-op design phases; write `phase="design-promote"` + `skipped_phases` | `PHASE_CHAIN`/`nextPhase()` in `session-start.js` unchanged per task's own note (verified — task explicitly does not touch them) | static (existing `SessionStart hook` tests) | none | *(corrected entry 2, per reviewer finding #2)* grep of `tests/run.js` for `PHASE_CHAIN`/`nextPhase` returns no hits — no test exercises `session-start.js`'s phase-chain logic at all. The two `SessionStart hook` tests that do exist only assert on the printed skill form (`/asd-*` vs `$asd-*`), unrelated to `PHASE_CHAIN`/`nextPhase()`; their staying green is not evidence covering this task's phase-chain claim. The `none` decision instead rests on direct code inspection: `session-start.js`'s `PHASE_CHAIN` array and `nextPhase()` function are untouched by this task's diff, so there is no code-level change to verify in the first place |
| Task 15: phase workflows write `state.json` inline for non-gate writes | none — no hook/CLI code writes or validates `state.json` shape in this repo (that happens at runtime inside a dispatched agent) | none | none | no code path |
| Task 18/19: conditional PR DoD checks; dedupe review-edge ownership | none — workflow/rubric prose only | none | none | no code path |
| Task 20: consistency sweep | verification-only task, no canonical file changes | none | none | task itself states "Affected canonical files: none" |
| `AGENTS.md` line 2 wording tweak (self-hosting exemption text) | none — the `sync.js --check` test's `SELF_SOURCED_ALLOWLIST` already expects `AGENTS.md` to report `modified-foreign` regardless of its content | static (existing test) | none | test asserts allowlist membership, not content, so unaffected |
| **Entry 2 delta (impl-review iter-01 review-fix, 62 files):** phase-skill `Write`/`Edit` tool grants (`asd-phase-*/SKILL.md`); external-review pathspec fix; `architect.md` contract corrections; `t_html-shell.html`/`t_adr.html` dead-code cleanup + color tokens + dark-mode + `TOC_ASSETS` conditional + multi-ADR id fixes; residual api/adr reference removal; write-allowlist widening; AC-source pointer fixes; pr-phase gate fixes (`asd-phase-pr.md`, `asd-phase-impl-test.md`); ~25 misc text/citation corrections across rule docs, agent files, workflows, `README.md`, `t_stack.html`, `t_tech-reference.md`, `t_review.md`, `t_plan.md`, external-review templates | none — every touched item is prose/frontmatter tool-grants/HTML-template markup/agent-contract wording; nothing edits `.asd/sync.js`, `.asd/skills/asd-update/update.js`, or `.asd/hooks/session-start.js` (confirmed by `git diff --stat` over the delta — none of those three paths appear), so no code path exercised by `tests/run.js` is touched | none | none | `sync.js --check`'s generic drift check (same mechanism as Task 1) already covers the 8 agent/skill files regenerated for the tool-grant and text fixes; the HTML/markdown/rule-doc/workflow edits have no parser in this repo (agent-authored content); `git diff --stat` for the pathspec confirms zero hits on the three files `tests/run.js` actually exercises |
| `.asd/release-manifest.json` hash-ledger resync (134 lines, batch-91e8143) — recomputed `canon_hashes`/`upstream_hashes` after the agent/text edits above | a stale ledger entry (edited file, un-refreshed hash) would fail the existing hash-consistency tests | unit (existing hash-consistency tests) | keep | same generic, non-hardcoded assertions as Task 5/Task 9 (`release-manifest.json: every canon_hashes/upstream_hashes entry matches the actual file`) — these tests recompute every digest from live file bytes on every run, so any ledger drift from this batch's edits is automatically caught with no test change; confirmed green this run |
| `t_test-plan.md` gains a `- HEAD: {{sha}}` line under Suite run (pr-phase gate fix: sha-based suite-skip instead of HEAD-based) | template/prose schema addition only — no code in `sync.js`/`update.js`/`session-start.js` parses `test-plan.md`'s Suite run section (it's read by the `pr` phase workflow as agent-authored prose, not a machine parser under `tests/run.js`) | none | none | no code path; this test-plan's own Suite run section below is updated to include the new `HEAD:` line for consistency with the amended template, satisfying the schema change by example rather than by a new automated check |
| Finding #1 (`impl-review` iter-01 testing.md): `.asd/templates/t_state.json` has no machine check that it still parses as valid JSON after Task 5 deleted two fields — `sync.js --check` never reads `.asd/templates/` | a template edit that breaks JSON syntax (e.g. a stray trailing comma) would go undetected by every existing gate | unit (new, zero-dependency `JSON.parse` guard in `tests/run.js`) | add | declining was considered (citing `AGENTS.md`'s "no template content" verification charter) but rejected: charter covers *content* correctness (agent-authored prose/HTML), not basic *syntax* validity of a machine-parsed format (JSON) — that gap is exactly what the reviewer flagged, and a 3-line guard costs nothing and stays zero-dependency (`custom-coding-rules.md`) |

## Removed tests

None. No test in `tests/` targets code, config shape, or fixture content this sprint's 20 tasks touched — the whole change surface is prose/workflow/agent/template edits plus two generic, self-verifying `release-manifest.json` bookkeeping updates (Tasks 5 and 9), both of which the existing hash-consistency and drift-check tests already cover without modification.

**Entry 2:** None. The delta (62 review-fix files) is entirely prose/frontmatter/HTML-template edits plus a hash-ledger resync — no test targets any of it.

## Added tests

None. Every material, machine-checkable risk in this sprint's change surface (state.json schema drift, release-manifest.json ledger integrity after `t_api.html`'s deletion, sync-plan target enumeration) is already covered by existing, non-hardcoded assertions in `tests/run.js` (see Risk → check decisions). No sprint task touched `.asd/sync.js`, `.asd/skills/asd-update/update.js`, or `.asd/hooks/session-start.js` — the only files `tests/run.js` exercises — so there is no new code path requiring a new test. The remaining 18 tasks are prose/structure edits to rule docs, templates, workflows and agent instructions verified by Task 20's cross-file consistency sweep (not automatable — `sprint-lifecycle.md` gap G-13), which is inspection already performed and recorded in `plan.md`, not test-engineer scope to redo.

**Entry 2:** one test added, resolving Finding #1 from `impl-review` iter-01 `testing.md` (see Risk → check decisions row above).

| Test | Regression proof |
|---|---|
| `tests/run.js`: `every .asd/templates/*.json file parses as valid JSON` | n/a — no `D-N` defect; this is a coverage-gap fix (closes finding #1), not a regression fix. Proven fail-first: mutated `t_state.json` locally to inject invalid JSON, reran `node tests/run.js`, confirmed this new test failed with `SyntaxError: Expected double-quoted property name in JSON` while the rest of the suite stayed green, then reverted the mutation (`git diff` confirmed zero residual diff) |

## Suite run

**Entry 1** (HEAD `b13d77c70e171e34abea6e3a52ed777fa51e3577`):
- Test — command: `node tests/run.js` (per `commands.yaml` `test`)
  Result: exit 0, pass — 77/77 passed, 0 failed, 0 skipped
- Lint — command: `git diff --check` (per `commands.yaml` `lint`)
  Result: exit 0, clean — no output (no whitespace errors in the diff)
- Build — command: `node .asd/sync.js --check` (per `commands.yaml` `build`)
  Result: exit 0, `"ok": true` — 68 items reported, all `status: "current"` except `AGENTS.md: "modified-foreign"` (expected self-hosting exemption per `SELF_SOURCED_ALLOWLIST`, asserted by an existing `tests/run.js` test, not a failure)

**Entry 2** (HEAD `27ef1ffd90d2027c838b8ded5785357d7c5ce01e`):
- Test — command: `node tests/run.js` (per `commands.yaml` `test`)
  Result: exit 0, pass — 78/78 passed, 0 failed, 0 skipped (77 pre-existing + 1 new, resolving finding #1)
- Lint — command: `git diff --check` (per `commands.yaml` `lint`)
  Result: exit 0, clean — only CRLF-normalization advisory warnings (not whitespace errors), no failures
- Build — command: `node .asd/sync.js --check` (per `commands.yaml` `build`)
  Result: exit 0, `"ok": true` — 68 items reported, all `status: "current"` except `AGENTS.md: "modified-foreign"` (expected self-hosting exemption, unchanged from entry 1)
- HEAD: `27ef1ffd90d2027c838b8ded5785357d7c5ce01e` — the code commit (`tests/run.js`'s new guard) the suite was verified at; committed separately from this doc-only test-plan update so the sha is a real, stable value rather than a self-reference to a commit that doesn't exist yet

## Defects

None found.

## Manual verification (optional)

None. Every change in this sprint's scope is Markdown/YAML/JSON/HTML prose or config with no visual UI, third-party live integration, or UX-feel surface — nothing here is genuinely impossible to automate, and the automatable surface is already fully covered above.
