---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 036-codex-sol-6-2

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | dcd77aa6 | full change surface |
| 2 | c41f7a35 | delta since dcd77aa6: the D-1 fix, `renderOwnedArray` in `.asd/sync.js` (2d190ca6); the re-render of `.claude/settings.json` (7478e40a) |
| 3 | eb329004 | delta since c41f7a35: review-fix commits 76b90101 (commit contract), 5c3af791 (attribution settings writes), d9fba3c2 (workflow gates), a44f5e38 (liveness); views 4ea39611; tester 843c0199 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `misplacedTrailers` (76b90101, AC-12) | A message with no blank line is all subject paragraph, so `ASD-Task:` glued to the header passed the check | component (`commit-check --message-file` CLI) | add | one case in the AC-12 test; the existing glued case has a later blank line and never reached the no-blank-line branch |
| `aiCoAuthorTrailers` parses the identity (76b90101, AC-16) | A human whose address contains `codex` is rejected; a name-only `Claude` or a `noreply@anthropic.com`/`noreply@openai.com` trailer under another name passes | component (CLI) | add | three cases in the AC-16 commit-check test; the existing name-plus-address cases stay |
| `asd-dev`/`asd-tester` `## Tools` carry the dispatch-scoped `.commit-msg` file (76b90101, AC-12) | The one-command commit form obliges the write while the grant denies writes elsewhere in `.asd/` | static grant check, committers derived from the roster | add | no behaviour to run; one test over every agent granted the commit command |
| `spliceTopLevelKey` pad (5c3af791, AC-15) | A four-space file gets two-space members; a compact or empty object gets a bad pad | unit | add | one test, exact strings for four-space, compact and empty |
| `cleanSettingsFile` splices only the reset keys (5c3af791, AC-16) | A re-serialisation reformats a compact layout, expands an inline array, drops CRLF | component (`attribution-check` CLI over `settings.local.json`) | add | one test, three layouts, expected text derived by substituting the one value |
| `cleanSettingsFile` realpath guard (5c3af791, AC-16) | The check rewrites a file behind a link that leaves the repo, or refuses one that stays inside | component (CLI; directory junction, file symlink where the host allows) | add | one test with a real-directory control, an outside junction, an inside junction and an outside file link; the file-link case logs and returns on a host without symlink support (as the repo's other symlink tests do) |
| `disableAttribution` inserts the owned value in `.claude/settings.json` (5c3af791, AC-15/AC-16) | A missing key is never inserted, or lands in `settings.local.json`, or sync still reads the file stale | component (CLI over a sync-applied mini repo, then `runCheck`) | add | one test |
| `readAiAttribution` (5c3af791, AC-15) | A nested key, a quoted duplicate or an empty `git:` group reads `disabled` or throws | unit table | add | rows for a nested key, a double- and a single-quoted duplicate, an empty group; an unquoted duplicate, a quoted or differently-cased value are existing rows; an unknown value is not added (the existing "Disabled" row exercises the same branch) |
| `findObjectKeySpan` last occurrence (5c3af791, AC-15) | A repeated `attribution` key is spliced at its first occurrence and apply never reaches `current` | component (`runApply`, `runCheck`) | add | one test |
| `renderOwnedArray` leaves an equal owned array alone (5c3af791, AC-15) | An attribution-only re-render rebuilds the hooks array and reorders an owned hook ahead of a foreign one | component (`renderJsonMerge`) | add | one test with an owned hook followed by a foreign one |
| asd-sprint `### Attribution check` (d9fba3c2, AC-16) | Wrong placement (base branch, Step 0), no skip for a user-modified tracked file, no commit, or a grant missing `git add`/`git commit` | content-contract pin | add | the procedure is orchestrator prose with no runnable form; the test pins the heading, the two call sites, the `git status` command, a skip token, the commit subject (length-checked) and the `ops` grant |
| scope step 3a checks the frozen audit (d9fba3c2, AC-10) | The audit as step 3 froze it is not checked against the scope | content-contract pin | add | one assert (`audit` in step 3a) in the AC-10 test |
| `isReviewReturned` binds a return to its manifest (a44f5e38, AC-14) | A verdict line naming another reviewer or phase than the dispatch's manifest finishes the agent | component (CLI, real manifest and ledger, fake transcripts) | add | two cases and one control in the AC-14 test: another reviewer against the quality manifest, an External Review return against its scope manifest (control), and an impl-phase External verdict against a design-phase scope manifest (a manifest without `reviewer` expects External Review) |
| same, another phase against an internal manifest | The same | component | none | tried with a quality manifest re-labelled `design-review` and a valid impl-quality return: the pre-fix tree already read it as not finished (no `STALL` line missing), so the case proves nothing h8 does not |
| `ATTRIBUTION_OFF` constant, `releasedKeys` (5c3af791) | Drops a user-set `attribution` under `enabled`; stale after the flip back | component | none new | covered by 843c0199's AC-15 assertions (flip back drops the owned value, a user value stays byte-identical) |
| views 4ea39611, `t_config.yaml` comment, asd-init step 6 text, README, the tech-reference FAILED wording (76b90101..d9fba3c2) | Stale view; reworded prose | static | none | `node .asd/sync.js --check` proves the views; the prose carries no new contract beyond the AC-8 and AC-6/15/16 pins that 843c0199 already updated |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Pre-fix tree = `git archive c41f7a35` (HEAD of entry 2, before the dev commits 76b90101, 5c3af791, d9fba3c2, a44f5e38) extracted to `.asd/tmp/prefix-c41f7a35/` with this entry's `tests/run.js` copied in; each run is `node tests/run.js --filter "<substring>"`, matched count 1 of 413, and exits 1 there and 0 on the live tree. A content-contract row's `runs: <n>` counts its pre-fix runs; the entry's reword control (run on the live tree with the pinned phrase reworded, restored in a `finally`, `git status` then showing only `tests/run.js`) is counted in the first content-contract row: `AC-8/AC-10/AC-11/AC-13` exit 0 and `asd-sprint runs its attribution check` exit 0, both 1/413.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-12: commit-check --message-file ...` (added case) | fail-first: filter `sprint-036 AC-12: commit-check --message-file`, exit 1, `AC-12: a message with no blank line is all subject paragraph, so a trailer directly under the header is misplaced` |
| tests/run.js:`sprint-036 AC-16: under git.ai_attribution disabled commit-check ...` (added cases) | fail-first: filter `sprint-036 AC-16: under git.ai_attribution disabled commit-check`, exit 1, `AC-16: a human whose address merely contains the word codex is not an AI trailer` |
| tests/run.js:`sprint-036 AC-12: every agent granted the commit command ...` | fail-first: filter `AC-12: every agent granted`, exit 1, `AC-12: the one-command commit form obliges these agents to write the message file, so the grant must allow what the form requires`; runs: 1 |
| tests/run.js:`sprint-036 AC-15: spliceTopLevelKey appends ...` | fail-first: filter `AC-15: spliceTopLevelKey appends`, exit 1, that test failing on the pre-fix two-space pad |
| tests/run.js:`sprint-036 AC-16: attribution-check splices only ...` | fail-first: filter `AC-16: attribution-check splices only`, exit 1, `AC-16: the reset changes the value span of each re-enabling key and nothing else, the file keeping its layout and line endings` |
| tests/run.js:`sprint-036 AC-16: attribution-check leaves a settings file untouched ...` | fail-first: filter `AC-16: attribution-check leaves a settings file untouched`, exit 1, `AC-16: a .claude directory linked outside the repo is refused with a warning and the file behind it is untouched`; the control (real `.claude`) is green on both trees |
| tests/run.js:`sprint-036 AC-15/AC-16: under disabled attribution-check inserts ...` | fail-first: filter `AC-15/AC-16: under disabled attribution-check inserts`, exit 1, `AC-16: the sync-managed file gains the owned value, the local file is not given a key, and sync --check reads current` |
| tests/run.js:`sprint-036 AC-15: readAiAttribution ...` (added rows) | fail-first: filter `sprint-036 AC-15: readAiAttribution`, exit 1, `AC-15: a missing, malformed or ambiguous config never turns attribution off` (pre-fix reads the nested key and both quoted duplicates `disabled`) |
| tests/run.js:`sprint-036 AC-15: a repeated attribution key ...` | fail-first: filter `AC-15: a repeated attribution key`, exit 1, `AC-15: the last occurrence is replaced, the first stays as written, and apply reaches current` |
| tests/run.js:`sprint-036 AC-15: an attribution-only json-merge ...` | fail-first: filter `AC-15: an attribution-only json-merge`, exit 1, that test failing on the rebuilt array |
| tests/run.js:`sprint-036 AC-14: agent-liveness ...` (added cases e5, g7, h8) | fail-first: filter `AC-14: agent-liveness`, exit 1, `AC-14: a1 is done by its valid return file ...`; the pre-fix run reports e5 and h8 as finished (no `STALL` line), g7 passes on both trees |
| tests/run.js:`sprint-036 AC-16: asd-sprint runs its attribution check ...` | fail-first: filter `AC-16: asd-sprint runs its attribution check`, exit 1, `the "Attribution check" subhead must still exist`; runs: 3 (one pre-fix, two control) |
| tests/run.js:`sprint-036 AC-8/AC-10/AC-11/AC-13 ...` (added assert) | fail-first: the pre-fix tree with the live `artifact-layout.md`, `asd-phase-impl.md`, `asd-phase-impl-test.md` and `asd-dev.md` copied in (so 843c0199's earlier assert passes), filter `AC-8/AC-10/AC-11/AC-13`, exit 1, `AC-10: step 3a checks the audit step 3 froze, not only the documents`; runs: 1 |

## Suite run

- Command: `node tests/run.js`
- Scope: full — one file with no native selector, framework-wide shared infrastructure
- Result: pass — 413 passed, 0 failed of 413 (entry 3: the 405 existing plus 8 added tests); step 3 pre-authoring run: 405/405
- Lint / build: pass — build `node .asd/sync.js --check` exit 0; lint `git diff --cached --check` run on the staged entry
- HEAD: fb92c218 — the run measured this tree plus the uncommitted `tests/run.js` change this entry commits next

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/sync.js | AssertionError [ERR_ASSERTION]: AC-15: adding the attribution key must not re-indent the hooks.SessionStart array it did not change | sprint-036 AC-15 (D-1): a json-merge re-render that only adds the owned attribution key keeps the owned hooks array as it was indented - the file reads as JSON.stringify with two spaces writes it | fixed | 2d190ca6 |

## Manual verification

| AC | Steps | Expected observation |
|---|---|---|
| AC-5 | `echo "Reply with exactly: PROBE OK" \| codex exec --model gpt-6.2-sol -c model_reasoning_effort="high" --sandbox read-only -` (third-party live integration: the model is served only by the provider) | a reply, exit 0 |

result: pass — 2026-11-18 04:14, codex-cli 0.169.1, exit 0, reply `PROBE OK` (21 563 tokens). An attempt at 03:09 was refused by the account's usage limit, which is not a model-access error.
