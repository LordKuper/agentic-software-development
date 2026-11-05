---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 032-auto-sync-auto-merge

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 810b23cd | full change surface (`git diff main...HEAD`, excluding `.asd/sprints/**`, `.asd/project/**` and generated views) |
| 2 | f21db5e1 | delta `git diff 810b23cd...HEAD` with the same exclusions: orphan-modified in `sync.js`, `asd-update` never-rule/Outputs, merge that did not land and MERGED scratch pass-through in `asd-phase-pr.md`, `readChecks` order and failure path |

Entry 1's decision, removal and added-test rows are rotated into `test-plan.entry-01.md`; a superseded row of it is named below.

## Risk → check decisions

Pre-strategy run (step 3) of `node tests/run.js` at `87f170ae`: 337/342, five reds, all triaged as test defects. Four orphan tests: the `markedFileContent` fixture wrote a marker whose content digest did not match its body, which `findOrphans` now reads as hand-edited; the fixture's digest now matches its body unless the caller asks for `edited`. The `readChecks` test: its expected message for an empty-stdout `gh` failure predates the unparseable-output path; the case now asserts the `gh pr checks <n> failed:` prefix and the stderr text, not the JSON parser's own message. The `CHAIN_EXITS` assertion message in the sprint-021/022 chain test named the superseded open-mode exit; it now names merge mode's two exits (no red, wording only).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/sync.js` `findOrphans`, `orphanStatus`, `runApply`, `main`; `providers.md` "Orphan detection" (orphan-modified) | a hand-edited marked orphan deleted without `--force`, `--check` not failing on it, the status unnamed in the rule | component, CLI in a child against a mini repo | add | Data-loss path. One test drives `--check` (exit 1, status `orphan-modified`), `--apply` without `--force` (file survives, `applied: false`) and with `--force` (deleted); the providers status is derived from what `--check` reported. Unedited and unmarked orphans stay with the existing sync.js orphan tests, whose fixture was corrected |
| `asd-sync/SKILL.md` (orphan-modified group, Outputs), `asd-update/SKILL.md` (never-rule scope, Outputs) | `--force` reaching an unedited group, a hand-edited orphan applied unforced, the update never-rule contradicting the managed blocks asd-sync writes | content contract | add | Extends the sprint-032 AC-1/AC-2 test: the forced group holds both hand-edited statuses and the unedited one neither, the never-rule names both, and both Outputs lists carry `AGENTS.md` and `CLAUDE.md` |
| `.asd/runtime.js` `readChecks` (no-checks stderr first, unparseable or non-array output is a failure) | a garbled `gh` output read as `none`, which permits the merge | component, canned `gh` preload; CLI exit mapping | add (amends entry 1's `readChecks` and `checks-wait` rows) | The no-checks stderr wins whatever stdout holds, `[]` stays `none`, unparseable and non-array output throw, and `checks-wait` exits 2 with empty stdout on unparseable output. Supersedes the "any other gh failure throws" case of the rotated row |
| `asd-phase-pr.md` merge step 1, `git-strategy.md` "Merging a PR" (merge that did not land, AC-5) | a queued or auto-merge-set PR read as merged, releasing on an unmerged PR | content contract | add | Extends the sprint-032 AC-3/AC-4/AC-5 test: the blocked paragraph names the `MERGED` confirmation, and merge step 1 states it after the "Merging a PR" call as a blocked merge |
| `asd-phase-pr.md` open step 2 (MERGED hit, AC-6) | a MERGED hit skipping the scratch deletion | content contract | add | Extends the sprint-032 AC-6 test: the MERGED sentence continues at the step number of the scratch-deleting step, derived |
| `.asd/runtime.js` `CHAIN_EXITS` doc comment | the superseded open-mode exit surviving in a comment (entry 1 observation) | content sweep | add | The comment line is the one removed line of the delta that stood on `main`; added to the existing leftover-term array. Other removed lines are sprint-own wording or code refactors, not terms. No agent-memory hit |
| `docs/architecture/tech-reference/gh-2.90.md` | — | none | none | Reference doc; unchanged facts are the `readChecks` fixtures |
| `.asd/release-manifest.json` hashes | ledger drift after canon edits | existing | keep | Existing integrity assertion green at 343/343 |

## Removed tests

None. Stale assertions were amended in place, not removed (see the pre-strategy paragraph above).

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Every command is `node tests/run.js --filter "<test-name substring>"`; each run matched 1 test and exited 1 with the named test failing, and every mutated file was restored in the same command (`git status` showed only `tests/run.js` and sprint bookkeeping modified afterwards).

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-032 AC-6: pr open mode deletes the sprint scratch files … (amended) | mutation: open step 2 `continues at step 4, so the scratch deletion runs, then in merge mode` → `continues in merge mode`: exit 1, this test failing; runs: 2 (1 mutation + the entry's one reword control, `continues at step 4, so the scratch deletion runs, then` → `proceeds at step 4, where the scratch deletion runs, then` over `--filter "sprint-032 AC-6"` → exit 0, 1 matched) |
| `tests/run.js`: sprint-032 AC-3/AC-4/AC-5: merge mode is the only producer of await-merge … (amended) | mutation: merge step 1 loses `Confirm the PR is MERGED … blocked merge`; "Merging a PR" loses the did-not-land clause while keeping the blocked paragraph (clause removal, `: never` citation kept): each → exit 1, this test failing; runs: 2 |
| `tests/run.js`: sprint-032 AC-1/AC-2: asd-sync applies its unedited group … (amended) | mutation: forced group loses `orphan-modified`; unedited group gains `orphan-modified`; never-rule loses `orphan-modified`; asd-sync Outputs loses the managed blocks; asd-update Outputs loses them: each → exit 1, this test failing; runs: 5 |
| `tests/run.js`: sprint-032 leftover-term check … (one phrase added) | mutation: `CHAIN_EXITS` comment restored to `` `pr`'s open and merge exits `` → exit 1, this test failing; runs: 1 (an extra reword run, exit 0, 1 matched, not counted) |
| `tests/run.js`: sync.js CLI: a hand-edited marked orphan reports orphan-modified … | fail-first by equivalent mutation (fixed review defect): `edited: false` in `findOrphans` (the pre-fix behaviour); `runApply` deleting without the `forceSet` gate; `--check` exit ignoring `orphan-modified`; the `providers.md` status sentence reworded without the token: each → exit 1, this test failing; runs: 4 |
| `tests/run.js`: sprint-032 AC-4: readChecks maps gh pr checks output … (amended) | fail-first by equivalent mutation (fixed review defect): non-array stdout returns `none`; the no-checks stderr check removed (stdout then wins); unparseable stdout returns `none`: each → exit 1, this test failing; runs: 3 |
| `tests/run.js`: sprint-032 AC-4/AC-5: checks-wait prints {"checks":...} … (amended) | fail-first by equivalent mutation: unparseable stdout returns `none` in `readChecks` → exit 1, this test failing (the `garbled` case: exit 0 instead of 2); runs: 1 |

## Suite run

- Command: `node tests/run.js`
- Scope: full (the delta touches `.asd/runtime.js` and `.asd/sync.js`, framework-wide files, so the shared-infrastructure safety valve degrades the impacted set to the whole suite; `tests/run.js` is also the repo's single test file)
- Result: pass — 343/343 passed, 0 failed, 0 skipped (pre-strategy run: 337/342, the five reds triaged above)
- Lint / build: pass — `git diff --cached --check` on the staged entry commit; `node .asd/sync.js --check` exit 0
- HEAD: 87f170ae plus this entry's test commit (`tests/run.js` and this file with `test-plan.entry-01.md`). Timing ledger: one `suite impl-test#3` (full) op; the pre-strategy and in-progress runs were not bracketed

## Defects

No code defects found at entry 2. Entry 1's observation (the `CHAIN_EXITS` doc comment still naming `pr`'s open exit) is resolved by the delta; the leftover-term test now pins it.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every AC is verified by automation; the `gh pr checks` output shapes the runtime parses are the fixtures recorded in `docs/architecture/tech-reference/gh-2.90.md`, not a live `gh` — a live GitHub run is not required to decide any AC.
