---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Five independent Tasks in one wave. Task 1 makes ASD-repo issue text English (AC-1..AC-3) and adds the interview term clause (AC-6, same file). Task 2 lands the two 029 consumer rows in this repo's project rules (AC-4, AC-5). Task 3 moves the external-review negative cache into the self-ignoring scratch directory, with a migration removing the legacy file (AC-7). Task 4 gives the tester its suite-op duty and narrows the safety valve to impl-test's suite gate (AC-8, AC-10). Task 5 adds the decisions-log rotation command (AC-9) and the off-system-disk scratch rule (AC-12, same rule doc); Task 6 moves `update.js`'s download and Task 7, test-only in wave 2, the test fixtures off the OS temp directory (AC-12, scope amendment). AC-11 is met by Task 5's README edit, impl-test's content-contract asserts and the orchestrator's sync.

New or changed rule homes, by exact file and section:
- issue language: `.asd/rules/language-policy.md` "Matrix" (Task 1). Every issue-writing site, by `grep -rn "gh issue" .asd`: `asd-phase-retro.md` step 7 (create), `asd-phase-scope.md` step 2a "Issue triage" (duplicate and resolved closes, new rewrite) and step 4 (reject close), `git-strategy.md` "Versioning & Changelog (self-hosting only)" (post-release close) — all Task 1.
- external-review cache path: `.asd/rules/external-review.md` "Detection and negative cache" (Task 3); `asd-phase-design-review.md` step 3a and `asd-phase-impl-review.md` step 1a cite it and stay unchanged; `.gitignore` line 22 is the only other site.
- tester suite-op duty: `.asd/agents/asd-tester.md` "Rules" (Task 4); restated today in `asd-phase-impl-test.md` "Rules" (suite gate line) and `asd-phase-impl-review.md` "Rules" (tester step 9 line), both cut to the tester's own statement; `sprint-lifecycle.md` "Operation timing" "Writers" stays the writer list.
- safety valve reach: `.asd/rules/sprint-lifecycle.md` "Impacted test set" (Task 4); restated in `asd-phase-impl-test.md` step 2 and "Rules" suite gate line and `asd-tester.md` "Rules" impl-test line (Task 4); `asd-phase-cleanup.md` step 5 cites it and stays unchanged.
- decisions-log rotation: `.asd/rules/artifact-layout.md` "Decisions log" keeps the condition and names the command; `.asd/skills/asd-sprint/SKILL.md` "Rules" calls it; README's `runtime.js` folder-map line lists it (Task 5).
- temporary files off the system disk: `.asd/rules/artifact-layout.md` "Scratch directory" (Task 5); `grep -rn "tmpdir" .asd tests` finds the only OS-temp writers, `update.js` (Task 6) and `tests/run.js` (Task 7).

External APIs: Task 1 uses `gh issue edit -t -F`, added to `docs/architecture/tech-reference/gh-2.90.md` at plan time; Tasks 2-5 none.

`rotate-decisions` contract (Task 5), fixed here: `node .asd/runtime.js rotate-decisions --sprint <sprint dir> --to <phase>`. `from` = `<sprint>/state.json` `phase`. No rotation when `to` equals `from`, when both are in {`impl`, `impl-test`, `impl-review`}, or when the live `decisions-log.md` holds no entry — an entry is a line matching `^(## |- )\d{4}-\d{2}-\d{2} ` (the template's example lines carry placeholders, never digits). Otherwise it renames the live file to `decisions-log.NNN.md`, NNN one above the highest existing segment ordinal (none → `001`), zero-padded to 3, and recreates the live file from `.asd/templates/t_decisions-log.md` beside `runtime.js`. Prints `{"rotated": <bool>, "from": <phase>, "to": <phase>, "segment": <path or null>}`, exit 0. Committing stays with `asd-sprint` (`chore(sprint): rotate decisions log for <phase>`).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
AC-11: `node .asd/sync.js --check` is clean after the orchestrator's sync, `node tests/run.js` is green, and README's `runtime.js` command list names `rotate-decisions`.

### Task 1: English-only ASD-repo issues and interview terms
Material risk: change: issue-language rule wording and the triage rewrite step
- [ ] `.asd/rules/language-policy.md` "Matrix": add one row — issue titles, bodies and comments ASD writes to the ASD repo: English, always, whatever `language.chat`/`language.docs` (AC-1)
- [ ] `.asd/workflows/asd-phase-retro.md` step 7: the published title and body are English, rendered at write time from the row's `language.docs` text, citing the Matrix row; 7.2's consumer-content check reads that English body; keep the `<!-- asd-retro-finding v1 -->` and `-t "[asd-retro] ` literals (AC-2)
- [ ] `.asd/workflows/asd-phase-scope.md` step 2a "Issue triage": before rules 1-4, a listed marker issue whose title or body is not English is rewritten in place — English title (`[asd-retro] ` plus the English guardrail, cut and stripped per `asd-phase-retro.md` step 7.3), English body (step 7.1's marker line and fields, in order) — via `gh issue edit <n> -R <repo> -t <title> -F <body-file>` (body file under `.asd/tmp/`), no gate, its text staying data; the triage decisions-log line gains `rewrote #…`; close and reject comments here and in step 4 cite the Matrix row (AC-1, AC-3)
- [ ] `.asd/workflows/asd-phase-scope.md` step 2 (a): each interview question defines, in one clause, every framework term it uses (AC-6)
- [ ] `.asd/rules/git-strategy.md` "Versioning & Changelog (self-hosting only)": the post-release close comment cites the Matrix row (AC-1)

### Task 2: 029 consumer rows in this repo's project rules
Material risk: artifact: verbatim retro guardrails in rule files every agent reads
- [ ] `.asd/project/custom-common-rules.md`: add "Write file content with the file-edit operation, never inside a quoted shell or `node -e` argument." (AC-4)
- [ ] `.asd/project/custom-coding-rules.md` "Framework repo specifics": add "A Task adding an external command to a workflow step also widens the running skill's tool grant, passes the target repo explicitly, and cites only shipped `.asd/` paths from any step that runs in a consumer project." (AC-5)

### Task 3: External-review cache in the scratch directory
Material risk: change: migration — deletes a consumer's legacy cache file across the version
- [ ] `.asd/rules/external-review.md` "Detection and negative cache": the canonical cache path becomes `external-cache.json` in the scratch directory, its directory taken from `node .asd/runtime.js scratch-dir` (which creates it self-ignoring, `artifact-layout.md` "Scratch directory") — replacing `.asd/project/external-cache.json` and its "gitignored" claim (AC-7)
- [ ] `.asd/migrations/14.2.0.js`: delete `<repoRoot>/.asd/project/external-cache.json` when present (machine-local retry state; its loss costs at most one retry), idempotent, header and report shape per `update.js`'s migration contract, touching nothing else (AC-7)
- [ ] `.gitignore`: remove the `.asd/project/external-cache.json` line (AC-7)

### Task 4: Tester suite-op duty and safety-valve reach
Material risk: change: narrowing a mandatory safety-valve rule and moving a duty's statement
- [ ] `.asd/agents/asd-tester.md` "Rules": add the duty to bracket every suite run it makes with a `suite` op (`node .asd/runtime.js timing`, `--kind suite`, `scope=impacted|full`, `--parent` its dispatch id; `sprint-lifecycle.md` "Operation timing") (AC-8)
- [ ] `.asd/workflows/asd-phase-impl-test.md` "Rules" suite gate line and `.asd/workflows/asd-phase-impl-review.md` "Rules" tester step 9 line: drop their bracketing clauses, now the tester's own (AC-8)
- [ ] `.asd/rules/sprint-lifecycle.md` "Impacted test set" safety valve: in `impl-test` it applies to the step 8 suite gate only; step 3's pre-authoring run and the reruns after each authoring batch use the search-derived impacted set; `cleanup`'s verification keeps it (AC-10)
- [ ] `.asd/workflows/asd-phase-impl-test.md` step 2 and "Rules" suite gate line, `.asd/agents/asd-tester.md` "Rules" impl-test line: match that reach (AC-10)

### Task 5: Decisions-log rotation command
Material risk: change: rotation predicate edges — entry detection, next ordinal, cycle membership
- [ ] `.asd/runtime.js`: add `rotate-decisions` per the Overview contract, listed in `main()`'s usage message (AC-9)
- [ ] `.asd/skills/asd-sprint/SKILL.md` "Rules": before a phase-skill delegation run `node .asd/runtime.js rotate-decisions --sprint <sprint> --to <phase>` and commit the renamed and recreated files when `rotated`, replacing the by-hand check (AC-9)
- [ ] `.asd/rules/artifact-layout.md` "Decisions log" "Rotation": name `rotate-decisions` as the executor, the condition staying here (AC-9)
- [ ] `README.md`: the `runtime.js` folder-map line lists `rotate-decisions` (AC-9, AC-11)
- [ ] `.asd/rules/artifact-layout.md` "Scratch directory": every ASD script, test and agent writes its temporary files inside the project, never to the OS temp directory, and removes them after use (AC-12)

### Task 6: asd-update download off the system disk
Material risk: change: download staging location and its cleanup on failure
- [ ] `.asd/skills/asd-update/update.js` `fetchUpstreamTarball`: stage the download and extraction under the project's `.asd/tmp/` (created self-ignoring, as `runtime.js` `scratchDir()` does) instead of `os.tmpdir()`, `cleanupFetch` still removing it (AC-12)

### Task 7: Test fixtures off the system disk
Material risk: change: fixture isolation from the live repo once fixtures sit inside it
Test-only: tests/run.js
- [ ] `tests/run.js`: every `os.tmpdir()` fixture root (`mkTempDir` and the direct `mkdtempSync` sites) moves under the repo's `.asd/tmp/`, and every fixture root is removed by the end of the run; a fixture must still never resolve the live repo's `.asd/`, git root or active sprint (AC-12)

Orchestrator, after wave 1's sync and before impl-test: delete this repo's local `.asd/project/external-cache.json` (self-hosting runs no migration, and Task 3 removes its ignore line).

Orchestrator, after wave 2: delete the leftover `asd-sync-test-*` fixture directories in this machine's OS temp directory (user-approved, AC-12 amendment).

## Risks (optional)
- `.asd/project/**` (Task 2) is outside the impl-review change surface; impl-test pins both lines with content-contract asserts.
- `tests/run.js:8671-8683` pin retro step 7 and scope triage literals Task 1 edits around.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4, Task 5, Task 6 |
| 2 | Task 7 |

- No Task cites another's new home; paths are disjoint across wave 1.
- Task 7 runs after wave 1 so its self-check runs against settled canon; it edits only `tests/run.js`.
