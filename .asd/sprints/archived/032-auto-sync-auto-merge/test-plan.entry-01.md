# Test plan — sprint 032-auto-sync-auto-merge — entry 01 (rotated)

Rows of `Entry log` entry 1, rotated out of `test-plan.md` at entry 2 (`artifact-layout.md` "Test plan"). Never edited.

## Risk → check decisions

Pre-strategy run (step 3) of `node tests/run.js` at `49c75e13`: 328/330, two reds, both triaged as test defects. `T-2, sprint-021 AC-11`: stale assertion — `asd-update` no longer names the `--apply <generated-view-path...>` target form (Task 1 removed that wording), which is what its `providers.md` citation requirement existed for; the same test's sole-home assertion still bars a restatement, so `asd-update` was dropped from the citing list. `sprint-021 AC-1/AC-2 (D1), sprint-022 …` pr chain test: stale pin — open mode no longer ends at `NEXT: await-merge` (AC-3); the assertion now locates open mode's hand-over to merge mode and asserts open mode emits no exit of its own.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `waitForChecks` (AC-4, AC-5) | wrong bound, off-by-one at grace or limit, `fail` not returning at once, a read failure swallowed | unit, injected read/sleep/fake clock | add | Pure loop with injected seams; table covers pass, fail, pending-then-fail, none-then-pass, last-poll-inside-grace/limit, none past grace, timeout past limit, rejected read. No real sleep |
| `.asd/runtime.js` `readChecks` (AC-4) | `gh` output mis-mapped (`skipping`, `cancel`, empty list, the no-checks stderr), a `gh` failure read as a state | component, canned `gh` through a `spawnSync` preload in a child | add | A real `gh` is neither available nor deterministic; the preload also logs argv so the exact `gh pr checks <n> --json bucket` call is pinned |
| `.asd/runtime.js` `checks-wait` subcommand (AC-4, AC-5) | exit-code mapping (0 pass/none, 1 fail/timeout, 2 gh failure), `--pr` validation reaching `gh` | component, CLI in a child with the `gh` preload plus a fake clock | add | Exit codes are the contract the merge rule branches on; `none` and `timeout` ride the fake clock, not a real 60 s / 30 min |
| `asd-phase-pr.md`, `sprint-lifecycle.md` "PR phase", `git-strategy.md` "Merging a PR", `asd-sprint` Step 3, README pr row (AC-3, AC-4, AC-5) | open mode still exiting at `await-merge`, merge mode not the producer of the blocked exit, rule naming outcomes or bounds the runtime does not run, a mirror left behind | content contract, outcomes and bounds derived from the runtime | add | One test: Exit table routes `await-merge` from merge mode alone, Modes sentence, outcomes derived by running the wait, bounds derived from the exported constants and mirrored in README, `asd-sprint` halts on both exits. Chain exits vs `standard.json`/`lite.json`/`CHAIN_EXITS` stay with the existing sprint-021/022 test (adjusted) |
| `workflows/standard.json`, `lite.json`, `CHAIN_EXITS`, `session-start.js` | none changed | existing | keep | `next.pr` still `[await-merge, done]`; hook's `await-merge` still means "PR open" |
| `artifact-layout.md` "Scratch directory", `asd-phase-pr.md` open step 4 (AC-6) | deletion glob not matching what the payload writes | content contract | add | The glob is only correct if every context bundle path the payload writes starts with `<scratch-dir>/<NNN-slug>-`; derived from the payload section |
| `asd-sync/SKILL.md` (AC-1) | `--force` reaching an unedited file, or the confirmed group missing it; the never-rule left broader than the behaviour | content contract | add | Data-loss-relevant pairing of the two `--apply` groups with `--force`; status vocabulary left to the existing `sync.js` orphan/status tests |
| `asd-update/SKILL.md`, `asd-phase-scope.md` step 1 (AC-2) | a manual sync step surviving, `--dry-run` delegating, scope running its own `--apply` | content contract | add | Delegation, Delegates list, Return and the scope clause are the four places the old behaviour could remain |
| `asd-external-review.md` (AC-7) | floor taken from the CLI, sixth column from the CLI id | content contract | add | Two pins only; the template header and `reviewFindings` parse stay with the existing sprint-021 F-4/F-5 and sprint-031 AC-10 tests |
| `asd-phase-audit.md` (AC-9, AC-10) | skip-only `phase` write, criterion change read as a contradiction, in-place criterion edit | content contract | add | One pin per changed clause; step 3b cites `Scope amendment`, whose section existence is asserted |
| `t_prd.html` (AC-11) | connectives left literal English | content contract | add | Placeholders and absence of the literal connectives |
| `git-strategy.md`, `providers.md` grants (AC-12) | dev/tester memory commit ungated, or the rule never loaded by them | content contract | add | The rule helps only if `asd-dev` and `asd-tester` are granted "Commit before review"; derived via `grantedRefs` |
| `review-policy.md` "Iteration severity floor" (AC-13) | below-floor observations in the table or ledger | content contract | add | Pins the two changed clauses |
| `custom-coding-rules.md` (AC-8) | parser-of-translated-artifact rule lost | content contract | add | The criterion is that line; pinned by its three structure tokens |
| README `/asd-update`, `/asd-sync` rows (Task 5) | wording drift | none | none | Prose mirrors of skills; no token the contract hangs on beyond the pr row, which is pinned above |
| `docs/architecture/tech-reference/gh-2.90.md` | — | none | none | Reference doc; the facts it records are the fixtures of the `readChecks` test |
| `.asd/release-manifest.json` hashes | ledger drift after canon edits | existing | keep | Existing integrity assertion green at 342/342 |
| Leftover terms of the sprint's removed sentences (first entry) | a removed sentence surviving in canon, README, hook, runtime, workflow definitions or agent memory | content sweep | add | Exact removed sentences from `git diff main...HEAD`, swept over canon, README, AGENTS.md, hook, runtime, both workflow definitions and every agent-memory file (`.claude/agent-memory/**`, all agent directories); no hit in memory, so no memory-fix dispatch |

## Removed tests

None. Two stale assertions were amended in place, not removed (see the pre-strategy paragraph above).

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Every command is `node tests/run.js --filter "<test-name prefix>"`; each run matched 1 test and exited 1 with the named test failing, and every mutated file was restored in the same command (`git status` clean outside `tests/run.js` and sprint bookkeeping afterwards).

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-032 AC-3/AC-4/AC-5: merge mode is the only producer of await-merge … | mutation: step 1 blocked exit removed; Exit table await-merge routed from open mode; Modes sentence restored to the open-mode exit; `timeout` dropped from the rule; merge call gated on `pass` only; blocked paragraph loses `NEXT: await-merge`; README loses the 60 s bound; asd-sprint stops halting on await-merge: each → exit 1, this test failing at the matching assert; runs: 9 (8 mutations + the entry's one reword control, the control `Delete every` → `Remove every` over `--filter "sprint-032"` → exit 0, 12 matched) |
| `tests/run.js`: sprint-032 AC-6: pr open mode deletes the sprint scratch files … | mutation: payload context prefix drops the slug; orchestrator bundle prefix drops it; open step 4 loses the glob; artifact-layout loses the glob: each → exit 1, this test failing; runs: 4. The first draft of the prefix assert passed under the payload mutation (the orchestrator path still held the substring) and was strengthened to every context path before these runs |
| `tests/run.js`: sprint-032 AC-1/AC-2: asd-sync applies its unedited group … | mutation: unedited group carries `--force`; forced group also takes `stale`; never-rule restored to every file; update step 5 stops naming `asd-sync`; step 5 stops excluding `--dry-run`; Delegates drops `asd-sync`; Return restores `NEXT: <asd-sync\|none>`; scope step 1 restores `sync.js --apply`: each → exit 1, this test failing; runs: 8 |
| `tests/run.js`: sprint-032 AC-7: asd-external-review takes its severity floor from the payload … | mutation: floor no longer from `payload.floor`; CLI id leaves the Description cell: each → exit 1, this test failing; runs: 2 |
| `tests/run.js`: sprint-032 AC-9/AC-10: audit writes phase="audit" on every non-collapse exit … | mutation: skip-only clause restored; planned-change sentence removed; step 3b clause removed; step 3b keeps its citation and drops `with a new id` (a clause removal with the citation kept): each → exit 1, this test failing; runs: 4 |
| `tests/run.js`: sprint-032 AC-11: t_prd.html renders the story connectives … | mutation: `{{story_as}}` back to literal `as`; literal connective placed beside the placeholders: each → exit 1, this test failing; runs: 2 |
| `tests/run.js`: sprint-032 AC-12/AC-13: a dev or tester runs memory-check … | mutation: dev/tester clause removed; `not gated` restored; the "Commit before review" grant mangled in `providers.md` (all rows); APPROVE-empty-table clause removed; ledger clause removed: each → exit 1, this test failing; runs: 5 |
| `tests/run.js`: sprint-032 AC-8: custom-coding-rules.md states … | mutation: structure list shortened to `(column count)` → exit 1, this test failing; runs: 1 |
| `tests/run.js`: sprint-032 leftover-term check … | mutation: a removed sentence (`run sync next`) restored in `asd-update/SKILL.md` → exit 1, this test failing; runs: 1 |
| `tests/run.js`: sprint-032 AC-4/AC-5: waitForChecks returns pass and fail at once … | n/a (new behaviour, no fixed defect); sanity mutation: `none` ignores the grace; pending timeout stretched to twice the limit: each → exit 1, this test failing; runs: 2 |
| `tests/run.js`: sprint-032 AC-4: readChecks maps gh pr checks output … | n/a (new behaviour); sanity mutation: `cancel` dropped from the fail buckets → exit 1, this test failing; runs: 1 |
| `tests/run.js`: sprint-032 AC-4/AC-5: checks-wait prints {"checks":...} … | n/a (new behaviour); sanity mutation: `none` exits 1; `timeout` exits 0; `fail` exits 0; `--pr` accepts `0`: each → exit 1, this test failing; runs: 4. The first draft had no `none`/`timeout` case and a `none`-exits-1 mutation was not caught; the two cases were added on a fake clock (preload advances `Date.now` and `timers/promises` `setTimeout`), then the mutation failed |
