# Test plan entry 01 — sprint 034-open-issue-triage

Rotated narrative rows of `Entry log` entry 1 (HEAD analysed 5922badb). Never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `record-verdicts` (AC-14) | a wrong latch rule or a rewritten state file corrupts the recovery point every review gate reads | unit (CLI over a state fixture) | add | three tests: latch semantics, wave-node targeting with byte-exact surroundings and CRLF, refusal that writes nothing (with a valid-call control so a missing command cannot pass) |
| `.asd/runtime.js` timing dispatch-attr fill (AC-9) | a wrong source order, an overwritten caller attr or a wrong host model mis-records every dispatch | unit (injected lookups) + CLI (real state.json, real agent canon, host env) | add | the injected-lookup test pins order, no-overwrite and warnings; the CLI test pins the `CLAUDECODE` host rule the unit cannot see |
| `.asd/runtime.js` never-opened close (AC-13) | an unpaired close line has no start and breaks the summary | unit (existing timingAppend test) + CLI case | keep | the sprint-025 test's superseded "recorded" assertion updated to append nothing; the CLI test adds the stderr warning and exit 0 |
| scope step 2a / step 4 project-issue triage (AC-1, AC-2, AC-3, AC-5, AC-6, AC-7) | an LLM-executed rule: an unpinned token drops a project from triage, auto-closes an issue or writes before the one authorisation | content contract | add | pins the commands, the every-project clause, the no-close property, the logged authorisation line and the step 4 write forms; AC-7's deliverability check can only be pinned by its three key terms |
| pr open and merge mode, `t_pr-description.md` (AC-4) | `Closes #N` under self-hosting would close an issue before the release; a consumer close that is gated or `FAILED` stops the merge | content contract | add | merge-mode clause, its gh calls against the tech reference, gate inventory and Exit writes; the open-mode `Closes`/`Refs` split is in the updated sprint-029 test |
| `language-policy.md` Matrix consumer row (AC-3) | a second ASD-repo issue row, or the consumer row missing | content contract | keep | sprint-030 Matrix test updated to one ASD-repo row plus one consumer `language.docs` row |
| `checkpoints.md` Gate inventory (AC-2, AC-4, AC-6) | the project-issue disposition or the ungated closes dropped from the inventory | content contract | keep | the sprint-019 gate-inventory assert updated; the pr and scope tests pin the new Gate inventory sentences |
| Suite run Scope `full` and review-fix reuse (AC-10, AC-11) | the terminal full-suite reuse fails silently when an impacted-invoked whole-suite run is recorded `impacted` | content contract | add | lifecycle rule, template line and tester agent pinned together; the review-fix grant assert in sprint-019 updated to include `Suite run` |
| reviewer payload `findings_header` (AC-12) | an internal reviewer without the header row writes a malformed findings table; External Review given it | content contract | add | derived from both workflows' Dispatch JSON and the agent-protocol key definition |
| External Review Claude Code prompt file (AC-8) | the wrapper without a write grant or a delete step leaves a prompt file or fails to run; Codex forms regress | content contract | add | rule table, agent Invocation, tool policy and the `memory: project` Write source; the sprint-021 table assert updated |
| removed heredoc-only, hand-written-write and retro-only-triage wording | a surviving sentence states the superseded rule as current | leftover-term sweep | add | `artifact-layout.md` "Leftover-term check", canon, README, docs and agent memory; 7 memory hits reported, none edited |
| `release-manifest.json` hashes, README, `gh-2.90.md` (AC-15) | stale ledger or mirror | existing tests | keep | `upstream_hashes` test red: D-2; the gh reference is covered by the new scope and pr tests: D-4 |
| per-dispatch context load | the sprint grew the orchestrator/impl load past the sprint-026 ceiling | existing test | keep | red: D-1 |
| AC-9 `agent` attr | the AC lists `agent` among the filled attrs; neither named source holds it | none | none | no test can pass: D-5 |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test is trivial, redundant, mock-confirming, implementation-coupled or flaky on this change surface | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-034 AC-1/AC-2/AC-5/AC-6/AC-7 (issue #110): scope step 2a triages the project repository's open issues… | fail-first vs pre-sprint tree 4c1f6e66 (git archive plus the new run.js): `node tests/run.js --filter "sprint-034"` → exit 1, 0/12 passed, this test among the failing; mutation C1 (project bullet back to `self_hosting: enabled` only): `node tests/run.js --filter "scope step 2a triages the project repository"` → exit 1, this test (1 matched); reword control (`a short summary` → `a brief summary`): same filter → exit 0; runs: 2 |
| tests/run.js: sprint-034 AC-4 (issue #110): pr merge mode closes a consumer project's included issues… | fail-first: same pre-fix run → exit 1, failing; mutation C2 (`never retried and never FAILED` → `retried, then FAILED`): `node tests/run.js --filter "pr merge mode closes a consumer"` → exit 1, this test, `AC-4: the comment is language.docs, a failure is reported never retried or FAILED, and no gate applies` (1 matched); runs: 1 |
| tests/run.js: sprint-034 AC-10/AC-11 (033#P-1, issues #86, #119): "Impacted test set" defines Suite run Scope full… | fail-first: same pre-fix run → exit 1, failing; mutation C3 (`whole suite` → `command is unscoped`): `node tests/run.js --filter "defines Suite run Scope full"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-034 AC-12 (issue #114): every internal reviewer dispatch entry… | fail-first: same pre-fix run → exit 1, failing; mutation C4 (`findings_header` dropped from the design-review Dispatch payload): `node tests/run.js --filter "every internal reviewer dispatch entry"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-034 AC-8 (033#A-3): the External Review Claude Code form feeds the prompt from one named scratch file… | fail-first: same pre-fix run → exit 1, failing; mutation C5 (Claude form back to `<<'EOF'`): `node tests/run.js --filter "External Review Claude Code form feeds the prompt"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-034 leftover-term check… | fail-first: same pre-fix run → exit 1, failing (the removed sentences are present there); the check is red at HEAD on 7 agent-memory lines, reported for the owner's memory-fix, never edited; runs: 0 |
| tests/run.js: sprint-034 AC-14 record-verdicts merges an iteration into the design node… | fail-first: same pre-fix run → exit 1, failing (command absent); mutation M1 (re-latch moves an existing latch): `node tests/run.js --filter "record-verdicts merges an iteration into the design node"` → exit 1, this test (1 matched); mutation M2 (only `CONCERNS` deletes a latch): same filter → exit 1, this test; runs: 2 |
| tests/run.js: sprint-034 AC-14 record-verdicts writes the current impl wave node only… | fail-first: same pre-fix run → exit 1, failing; mutation M3 (`waves[0]` for the current wave): `node tests/run.js --filter "record-verdicts writes the current impl wave node only"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-034 AC-14 record-verdicts exits non-zero and writes nothing… | fail-first: against the pre-fix tree the first run passed vacuously (an unknown command also exits non-zero and writes nothing); a valid-call control and a per-case refusal message were added, then `node tests/run.js --filter "record-verdicts exits non-zero"` in the pre-fix tree → exit 1, this test (`sanity: the same command with a valid verdict succeeds…`); runs: 0 |
| tests/run.js: sprint-034 AC-9 a dispatch open fills its missing tier and model… | fail-first: same pre-fix run → exit 1, failing; mutation M4 (fill overwrites a given attr): `node tests/run.js --filter "a dispatch open fills its missing tier and model"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-034 AC-9/AC-13 the timing command fills a dispatch open from the state.json beside the ledger… | fail-first: same pre-fix run → exit 1, failing; mutation M5 (host rule always `claude`): `node tests/run.js --filter "the timing command fills a dispatch open from the state.json"` → exit 1, this test (1 matched); runs: 1 |
| tests/run.js: sprint-025 AC-1/AC-4 (D2, D4), sprint-034 AC-13: timingAppend … appends nothing for an unmatched close… (updated) | fail-first: same pre-fix run → exit 1, failing; mutation M6 (the unpaired close entry restored): `node tests/run.js --filter "sprint-034 AC-13: timingAppend"` → exit 1, this test (1 matched); runs: 1 |

Contract tests updated to the new text, each red on the pre-fix tree by name: `preflight permits only fixed local probes` (sprint-013 AC-16 table rows), `scope step 2a runs retro intake` (gate-inventory row), `each review-fix, rotation and tester-lifecycle rule` (grant gains `Suite run`), sprint-029 issue-shape (labels sentence, consumer-only closing keyword), sprint-030 Matrix (one ASD-repo row plus the consumer row). Prior sprints' `upstream_hashes` ledger is recomputed by the orchestrator's `sync.js --apply` after the canon-editing dispatches (`asd-phase-impl.md` step 7), never by a test edit.
