# Test plan — sprint 030-english-only-asd-issues, entry 1 segment

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `rotate-decisions` (AC-9) | rotation predicate edges: unchanged phase, impl-cycle transition, template-only log, next ordinal, template recreation, missing flags | unit (CLI behaviour, fixture sprint dirs) | add | the only new executable logic with branches; a wrong edge loses or duplicates decisions-log history |
| `.asd/migrations/14.2.0.js` (AC-7) | deletes a consumer file across a version; must touch nothing else and re-run clean | unit (fixture project root) | add | persisted-data handling; cheapest proof is the migration run against a fixture |
| `.asd/skills/asd-update/update.js` `fetchUpstreamTarball` staging (AC-12) | download staged outside the project, or left behind on failure | — | none | staging and cleanup are reachable only through a live download from codeload.github.com (no injection seam); the off-OS-temp reach is pinned instead by the `tmpdir(` sweep below |
| `tests/run.js` fixture root (Task 7, AC-12) | fixtures resolving the live repo, or surviving the run | — | none | Test-only Task, existing test change (never re-authored); the runner exercises its own isolation on every run and no `asd-test-run-*` directory remained after the gate run; two guards keep a fixture off the live repo: `GIT_CEILING_DIRECTORIES` stops git's upward search only, and an empty `.asd/` marker in the fixture root stops the `.asd` walk-ups (`sync.js` `findRepoRoot`, `update.js`, the session-start hook `findUp`) |
| `language-policy.md` Matrix row, retro 7.1/7.2, scope 2a rewrite and step 2 (a), git-strategy close comment (AC-1/2/3/6) | an issue-writing site stops citing the row, the rewrite step loses its command or runs after rules 1-4, the decisions-log token drops | content contract | add | rule text is the behaviour; the writer set is derived from `gh issue create\|close` sites, never enumerated |
| `custom-common-rules.md`, `custom-coding-rules.md` lines (AC-4/5) | rows outside impl-review's change surface silently dropped | content contract | add | plan Risks line routes the pin here |
| `external-review.md` cache path (AC-7), tester suite-op duty and sole home (AC-8), safety-valve reach in three places (AC-10), scratch rule and no OS-temp call in any ASD script (AC-12) | superseded wording restored, a workflow restating the duty, a script re-adopting `os.tmpdir()` | content contract | add | one test per fact family; script set derived by walking `.asd` and `tests` |
| `asd-sprint` SKILL, `artifact-layout.md` "Decisions log", README, runtime usage line (AC-9, AC-11) | docs name a command line the runtime does not parse | content contract + run as written | add | the documented command is executed against a fixture sprint |
| leftover terms of the sprint's removed lines (AC-7/8/10/9) | a removed path or sentence survives in canon, README, `.gitignore` or agent memory | content contract (sweep) | add | `artifact-layout.md` "Leftover-term check"; one memory hit found, reported and fixed at step 7a |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test duplicates or contradicts the sprint's changes; the sprint-029 literals Task 1 edited around still pass | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-030 AC-1/AC-2/AC-3/AC-6 … | mutation per assert (Matrix row, row text, git-strategy citation, retro English render, scope `-F` form, `rewrote #…` token, term clause): `node tests/run.js --filter "sprint-030 AC-1/AC-2/AC-3/AC-6"` → exit 1, same test failing, matched 1; runs: 7; control: the term clause reworded keeps the assert green, exit 0, matched 1 |
| tests/run.js: sprint-030 AC-9: rotate-decisions … | mutation, cycle guard removed from `rotateDecisions`: `node tests/run.js --filter "sprint-030 AC-9: rotate-decisions"` → exit 1, that test failing, matched 1; runs: 1 |
| tests/run.js: sprint-030 AC-9/AC-11 … | mutation per assert (skill result token, layout command, dispatch renamed, usage line, README): `node tests/run.js --filter "sprint-030 AC-9/AC-11"` → exit 1, that test failing, matched 1; runs: 5 |
| tests/run.js: sprint-030 AC-7: the 14.2.0 migration … | mutation, `fs.rmSync` removed from the migration: `node tests/run.js --filter "sprint-030 AC-7: the 14.2.0"` → exit 1, that test failing, matched 1; runs: 1 |
| tests/run.js: sprint-030 AC-4/AC-5 … | mutation per assert (file-edit phrase, target-repo clause): `node tests/run.js --filter "sprint-030 AC-4/AC-5"` → exit 1, that test failing, matched 1; runs: 2 |
| tests/run.js: sprint-030 AC-7/AC-8/AC-10/AC-12 … | mutation per assert (cache path, tester scope attr, `--kind suite` restated in impl-test, valve home exemption, tester valve, impl-test step 2 valve, impl-test Rules valve, scratch rule, `os` temp call added to `update.js`): `node tests/run.js --filter "sprint-030 AC-7/AC-8/AC-10/AC-12"` → exit 1, that test failing, matched 1; runs: 9 |
| tests/run.js: sprint-030 leftover-term check … | mutation, a removed bracketing sentence restored in README: `node tests/run.js --filter "sprint-030 leftover-term"` → exit 1, that test failing, matched 1, hit list gains `README.md:1`; runs: 1 |

All mutations were applied and restored inside one command each; the worktree held no source diff afterwards.
