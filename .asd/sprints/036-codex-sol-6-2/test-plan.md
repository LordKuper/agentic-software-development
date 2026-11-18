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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `commit-check --message-file` (Task 1, AC-12) | A trailer outside the last paragraph, a CRLF message or a header over 50 code points passes; both or neither flag accepted | component/contract (CLI over a sandbox repo) | add | `sprint-036 AC-12: commit-check --message-file ...`; the runtime is the only enforcement of the trailer paragraph |
| One-command commit form in `git-strategy.md` (Task 1, AC-12) | The published compound no longer commits exactly the agent's paths, or drops the message file's trailer paragraph | component (run as written) | keep (adapted) | `sprint-019 AC-8` rewritten to the message-file form: header-length and misplaced-trailer failures stop at `commit-check`, the reset leaves nothing staged, the commit carries the file whole |
| Codex `sol` → `gpt-6.2-sol` (Tasks 2, AC-1..AC-4) | Stale ID in a manifest, view, fixture or README; luna moved with it | unit + static sweep | add + keep | `canonical agent -> Codex .toml matches fixture` (kept, fixture regenerated to the 6.2 ID and digest) covers AC-2; `sprint-022 AC-10` (kept) covers the providers/README mirror; added `sprint-036 AC-1/AC-3` for the literal values and the 0.167.0 minimum, and the leftover sweep for AC-4 |
| `timing --open` refusal, next free `#<n>`, `task_routing` strip, repeated-flag warning (Task 7, AC-7) | A held id reopened (corrupts the ledger's pairing); a repeat op routed without its entry; a doubled `--attrs` silently overridden | component (CLI over a temp ledger and `state.json`) | add | `sprint-036 AC-7: timing --open ...`; the existing `timingAppend` unit test only covers the still-open duplicate |
| `agent-liveness --returns` (Task 7, AC-14) | A reviewer that returned is stopped as `STALL`, or an invalid return suppresses a real stall | component (CLI, real manifest + ledger, fake transcripts) | add | `sprint-036 AC-14`: valid return with no transcript is done and silent; interrupted, missing, manifest-less returns and an unparseable returns file change nothing |
| Latch clear counts comment-only changes (Task 7, AC-9) | A comment-only or blank-only edit to a production file keeps a reviewer's APPROVE latch | component (`latch-refresh` over a sandbox repo) | add | `sprint-036 AC-9`; the kept `sprint-035 AC-15` latch-refresh test still covers listed, unlisted, inert and no-head cases |
| Comment lexer removal (Task 7, AC-9) | Dead tests of deleted `isCommentOnlyChange`/`projectExecutable`/`COMMENT_LEXERS` | static (leftover sweep) | add | `sprint-036 leftover-term check` pins the removed sentence, the three names, the old commit form and `gpt-6.1-sol` across canon, README, runtime, sync, docs, views, manifest and agent memory |
| `attribution-check` (Task 8, AC-16) | Silent rewrite of a user's settings; a re-enabling entry left; malformed file clobbered; Codex hint on a Claude-only repo | component (CLI over sandbox repos) | add | `sprint-036 AC-16: attribution-check ...` covers enabled/absent silence, per-entry fixes with indentation kept, local file, idempotence, malformed and non-object files, the `.codex/` gate |
| `Co-authored-by` rejection (Task 8, AC-16) | An AI trailer commits under `disabled`; a human co-author or `enabled` rejected | component (CLI) | add | `sprint-036 AC-16: under git.ai_attribution disabled commit-check ...` |
| `readAiAttribution` (Task 8, AC-15) | A malformed, duplicated or commented config line turns attribution off | unit (table) | add | `sprint-036 AC-15: readAiAttribution ...`; the fail-closed reading is the contract |
| sync json-merge `attribution` key (Task 8, AC-15) | `enabled` churns `.claude/settings.json`; `disabled` never lands, never settles to `current`, or clobbers neighbours | component (`runCheck`/`runApply`, `renderJsonMerge`) | add | `sprint-036 AC-15: sync json-merge ...`. Its re-render also exposed D-1 (re-indented hooks array), pinned by `sprint-036 AC-15 (D-1)` |
| Plan/scope/pr/dev workflow prose and templates (Tasks 3-6, AC-6, AC-8, AC-10, AC-11, AC-13; Task 8 surfaces, AC-15, AC-16) | A gate token, heading or command quietly reworded away | content-contract (tokens only) | add | three `sprint-036 AC-...` pin tests; tokens are headings, field names, commands and parsed literals only |
| `providers.md` `--returns` and README command list (Tasks 1, 7, AC-7, AC-12, AC-14) | Canon stops telling the orchestrator to pass `--returns`; README lists a form the runtime lacks | content-contract | add | `sprint-036 AC-7/AC-12/AC-14`; the existing sprint-035 AC-9 test already proves each documented flag is read by its command |
| `checkReview` extraction from `persistReview` (Task 7) | Shared checks drift from the persist path | component | none | `sprint-020 AC-9` (persist-review) and the new `AC-14` test both run the shared function |
| Config value `git.ai_attribution: disabled` in this repo (Task 9, AC-17) | Value absent or the view not synced | static | none | a config value is not behaviour; `node .asd/sync.js --check` (build) proves `.claude/settings.json` carries `attribution`, and `node .asd/runtime.js attribution-check` on this repo printed only the Codex hint, no fix |
| Live `codex exec --model gpt-6.2-sol` (AC-5) | The model ID is refused by the live service | live probe | orchestrator | not automatable here; recorded below |
| Leftover-term check, agent memory | Memory teaching the removed comment-only exception | static | report only | no exact removed sentence or name occurs in `.claude/agent-memory/**`. Borderline hits, owner `asd-reviewer-combined`, not edited: `feedback_lexer-ceiling-claims.md` and its `MEMORY.md` line 34 (generic method for reviewing a hand-written comment/string lexer, the removed mechanism being its example), `feedback_fix-overcorrection-vs-ac.md` line 12 (an example of a classifier that stops reading doc blocks as comments while an AC says a comment-only change keeps something) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| tests/run.js:`sprint-035 AC-15: a changed file counts as code unless its executable projection is unchanged ...` | implementation-coupled: it drove only `isCommentOnlyChange` and the latch's comment-only branch, both removed by AC-9; the branch it covered no longer exists, and its latch-level half is replaced by `sprint-036 AC-9` | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Pre-fix tree = `git archive main` extracted to a scratch directory with this entry's `tests/run.js` and `tests/fixtures/expected` copied in; each run is `node tests/run.js --filter "<name prefix>"`, matched count 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-1/AC-3: the sol family maps ...` | fail-first vs pre-fix tree: `--filter "sprint-036 AC-1/AC-3"` → exit 1, `AC-1: only the sol family moved`; mutation (live tree, restored by a finally block): README `Codex CLI 0.167.0 or later` → `0.166.0` exit 1, `` `model_not_found` `` → `` `not_found` `` exit 1, manifest sol → `gpt-6.1-sol` exit 1, manifest luna → `gpt-6.1-luna` exit 1, each failing `sprint-036 AC-1/AC-3: the sol family maps ...`; control: README `older clients get HTTP 400` → `an older client is refused with HTTP 400` → exit 0, same test green; runs: 5 |
| tests/run.js:`sprint-036 AC-8/AC-10/AC-11/AC-13: the refuse-to-implement rule ...` | fail-first vs pre-fix tree: exit 1, `AC-8: the rule names every command or subcommand ...`; mutations (one per assert, each exit 1, failing `sprint-036 AC-8/AC-10/AC-11/AC-13: ...`): rule scope clause, asd-dev clause, scope 3a `Settings change:`, scope step 4 `step 3a`, plan `commands.yaml` `build`, plan `## Decision coverage`, `t_plan.md` table header; runs: 7 |
| tests/run.js:`sprint-036 AC-6/AC-15/AC-16: pr open mode lists ...` | fail-first vs pre-fix tree: exit 1, `AC-6: pr open mode step 2 lists each skipped wave ...`; mutations (each exit 1, failing `sprint-036 AC-6/AC-15/AC-16: ...`): pr `"External Review skipped"`, pr `Unreviewed files`, pr `git.ai_attribution: disabled`, `t_pr-description.md` section, git-strategy `commit-check` rejects, asd-sprint `attribution-check`, asd-init key, `t_config.yaml` key, README config row; runs: 9 |
| tests/run.js:`sprint-036 AC-7/AC-12/AC-14: providers.md passes --returns ...` | fail-first vs pre-fix tree: exit 1, `AC-14: the Claude Code wake-up bullet passes --returns ...`; mutations (each exit 1): providers `--returns <json>`, README `[--returns <json>]`, README `commit-check --message-file <file> -- <paths>`; runs: 3 |
| tests/run.js:`sprint-036 leftover-term check: ...` | fail-first vs pre-fix tree: exit 1, `each entry is a sentence or name this sprint removed`; the pre-fix tree restores every superseded text at once; runs: 1 |
| tests/run.js:`sprint-036 AC-12: commit-check --message-file ...` | fail-first vs pre-fix tree: exit 1, `AC-12: every ASD-Task line in the final paragraph, beside a Co-Authored-By line, passes`; n/a for mutation (behavioural, whole runtime pre-fix) |
| tests/run.js:`sprint-036 AC-16: under git.ai_attribution disabled commit-check ...` | fail-first vs pre-fix tree: exit 1, `TypeError: Cannot read properties of null (reading 'ok')` (pre-fix `commit-check` refuses `--message-file`, no report) |
| tests/run.js:`sprint-036 AC-15: readAiAttribution ...` | fail-first vs pre-fix tree: exit 1, `TypeError: sync.readAiAttribution is not a function` |
| tests/run.js:`sprint-036 AC-16: attribution-check ...` | fail-first vs pre-fix tree: exit 1, `AC-16: ai_attribution enabled prints nothing, warns of nothing and rewrites nothing, ...` (pre-fix runtime has no such command) |
| tests/run.js:`sprint-036 AC-15: sync json-merge ...` | fail-first vs pre-fix tree: exit 1, `AC-15: the carried key is part of what current means` |
| tests/run.js:`sprint-036 AC-15 (D-1): a json-merge re-render ...` | fail-first vs D-1: `node tests/run.js --filter "sprint-036 AC-15 (D-1)"` on the live tree → exit 1, `sprint-036 AC-15 (D-1): a json-merge re-render that only adds the owned attribution key keeps the owned hooks array as it was indented ...` (the test is expected red until D-1 is fixed) |
| tests/run.js:`sprint-036 AC-7: timing --open ...` | fail-first vs pre-fix tree: exit 1, `AC-7: an open of an id still open appends nothing and names the next free id` |
| tests/run.js:`sprint-036 AC-14: agent-liveness --returns ...` | fail-first vs pre-fix tree: exit 1, `AC-14: a1 is done by its valid return file though no transcript exists ...` |
| tests/run.js:`sprint-036 AC-9: latch-refresh counts a comment-only ...` | fail-first vs pre-fix tree: exit 1, `AC-9: no change to a production executable file keeps the latch, a comment or blank line included` |

## Suite run

- Command: `node tests/run.js`
- Scope: full — the runner is one file with no native selector (`commands.yaml` has no `test_affected`), the change surface is framework-wide shared infrastructure (`safety_valve` absent = enabled), so the impacted set is every test
- Result: fail — 403 passed, 1 failed, 0 skipped of 404; the one failure is `sprint-036 AC-15 (D-1)`, a code defect (below). Step 3 baseline before any test edit: 388/391 passed, the three expected reds (`canonical agent -> Codex .toml matches fixture`, `sprint-019 AC-8`, `sprint-035 AC-15` lexer test)
- Lint / build: pass — build `node .asd/sync.js --check` exit 0 (every view `current`); lint `git diff --cached --check` exit 0 on the staged entry commit
- HEAD: fc3e672a — the run measured this tree plus the uncommitted `tests/run.js` and fixture changes this entry commits next
- AC-5 live probe: pending (orchestrator)

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/sync.js | AssertionError [ERR_ASSERTION]: AC-15: adding the attribution key must not re-indent the hooks.SessionStart array it did not change | sprint-036 AC-15 (D-1): a json-merge re-render that only adds the owned attribution key keeps the owned hooks array as it was indented - the file reads as JSON.stringify with two spaces writes it | pending |  |
