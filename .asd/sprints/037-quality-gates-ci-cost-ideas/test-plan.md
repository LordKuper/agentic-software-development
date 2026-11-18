---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 037-quality-gates-ci-cost-ideas

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface |

## Risk → check decisions

Pre-strategy run (step 3) at `13292f6a`: `node tests/run.js` 416/430, 14 failures, every one a pin of text or behaviour this sprint changed on purpose (triage below). Leftover-term check (entry 1): the removed `sandbox_mode` sentences and terms (`invalid sandbox mode`, `Codex sandbox` in the tier sentence, the reviewers' `workspace-write` trade-off, the README scout `sandbox_mode: "read-only"`) were searched repo-wide with `.claude/agent-memory/**` included: no memory hit; the only hits are the two test fixtures `tests/fixtures/canon/agents/demo-agent.md` and `demo-wraps-agent.md`, which keep a stray `codex.sandbox_mode` on purpose (AC-21 "ignored"). No `temporary(` test exists from an earlier sprint; no `Stub <ref> → impl-test` line in `plan.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/sync.js`, agent canon: `codex.sandbox_mode` validation and rendering removed (AC-21) | the renderer validates or emits the removed key again, or a consumer's stray key breaks a render | component (fixture render) | none | `canonical agent -> Codex .toml matches fixture` owns it: `demo-agent.md` keeps a stray `sandbox_mode: workspace-write`, the expected TOML has no `sandbox_mode` line (re-pinned, digest recomputed). Seeded defect re-adding the render line → that test red (record below). Two obsolete assertions and the `invalid sandbox` case removed |
| Reworded canon prose: scope step 2a/4 (PRs, stubs), gate inventory, `code-style.md` §17 and §5, `t_test-plan.md` columns, `asd-tester.md` `Suite revision` section, `providers.md` Codex reviewer sentence | a content-contract pin on a changed token goes stale and reddens, or a machine-parsed token (a heading, a table header, a quoted gate phrase) drifts unseen | content contract (existing owners) | keep | Seven existing pins re-pinned to the new token: scope step 4 acceptance clause, scope Inputs string, gate-inventory ungated-writes clause, `Gap proof` column header and the cell split of the `Regression proof` forms, `Suite revision` in `FORM_DOMAIN_SECTIONS`, `code-style.md` in the QUESTION-route exempt set, the standalone-skills cap (62,351 B: asd-init grew 1,300 B for AC-8, a deliberate requirement). No new content-contract test: no further machine-parsed token changed (AC-15) |
| `.asd/runtime.js` `context-check`, `--seed`, `.asd/project/context-ceilings.json` (AC-1) | a bundle grows past its recorded ceiling unnoticed, a role or phase added with no ceiling, a seeded file the check rejects | component (CLI) | add | replaces the removed D13 ratio test; derives the key set from a fresh seed, never a hand list |
| `timing` dispatch `context_bytes` fill, `timing-summary` `context_bytes` and `suite_full` (AC-2, AC-18) | bundle bytes lost or mis-summed, a baseline from under three samples, `over` mis-judged, an impacted run counted as the full suite | unit (pure functions via `timingAppend`, `timingSummary`) | add | one test, no I/O |
| `test-delta`, `impl-test-close` gap-proof and `--green` allowance refusals, Line delta (AC-3, AC-13) | a gap-proof-less row closes, a required allowance missing closes green, test and other lines split wrongly | component (CLI over a temp git repo) | add | extends nothing: the existing `impl-test-close` test owns only the HEAD fill |
| `stubs-due` (AC-5) | a past, missing or impossible date reads as not due, a due date today or later flagged | component (CLI) | add | |
| `retro-candidates` / `retroRows` zero-row section (AC-11) | a no-table section fails or drops rows | component | none | `sprint-019 AC-4: the live retro backlog parses…` goes red on the seeded defect (the live data holds sprint 036's no-table retrospective); a direct run of `node .asd/runtime.js retro-candidates --sprints .asd/sprints --backlog .asd/project/retro-backlog.md --self-hosting` returns the seven rows `036-codex-sol-6-2#A-1`..`A-7` |
| `tests/run.js` per-test ms and slowest-ten summary (AC-16) | duration report missing | observed run | none | verified on every run in this entry: each `ok -`/`FAIL -` line carries `(N ms)`, the summary follows the pass count; no machine-parsed token, a failing report is visible in the run itself |
| AC-4, 6, 7, 8, 9, 12, 14, 15, 17, 19 (rules, workflows, skills, templates, README) | prose only | none | none | no changed token is machine-parsed beyond the pins re-pinned above |
| `commands.yaml` `checks` (`context`, `agnix`), `.agnix.toml` (AC-1, AC-21) | `checks.context` regresses | component | none | `checks.context` is `context-check`, covered by the AC-1 row; `agnix` is a pinned external tool run at the impl gate (0 errors, 0 warnings in the decisions log), not re-run here |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| tests/run.js: `sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline` | redundant: survivor tests/run.js:`sprint-037 AC-1: context-check exits 0 over the committed ceilings…`, branch a bundle over its recorded ceiling fails, the ceilings seeded after this sprint's changes covering every role-phase pair including the four D13 pairs (decisions-log 2026-11-18 "D13 load ceiling superseded by AC-1") | yes |
| tests/run.js: `AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context`, case `invalid sandbox` | redundant: survivor tests/run.js:`canonical agent -> Codex .toml matches fixture`, branch a stray `codex.sandbox_mode` is neither validated nor rendered | yes |
| tests/run.js: `AC-3/6/7: every canonical Codex agent renders a supported delegate config`, assertion `supported sandbox` | redundant: survivor tests/run.js:`canonical agent -> Codex .toml matches fixture`, branch no `sandbox_mode` line in the rendered TOML | yes |
| tests/run.js: `read-only agents (every workflow reviewer + asd-advisor)…`, the per-agent `codex.sandbox_mode` assertion | redundant: survivor tests/run.js:`canonical agent -> Codex .toml matches fixture`, branch as above; the Claude tool-allowlist and return-file-policy halves stay | yes |
| tests/run.js: `sprint-033 AC-1/AC-2/AC-3/AC-8: the runner variant renders…`, assertion `scout.codex.sandbox_mode` | redundant: survivor tests/run.js:`canonical agent -> Codex .toml matches fixture`, branch as above; the scout's Claude read-only tool list stays | yes |
| tests/run.js: `AC-15/sprint-019 AC-14: review-policy.md is sole SSoT…`, the `providers.md` `sandbox_mode: "workspace-write"` sentence assertion | implementation-coupled: a five-conjunct sentence-shape pin of prose AC-21 rewrote, which no machine parses (code-style.md §17 content-contract bullet); the surviving assertions in the test still pin the host grant and the citation | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

Gap-proof run for every row below, taken before the new tests existed: a scratch mutation script applying the seeded defects to `.asd/runtime.js` together, restoring it in a `finally`, then `node tests/run.js` → exit 1, 427/429; the only failures `release-manifest.json: every upstream_hashes entry matches the actual file` (red on any byte edit of a hashed file, unrelated to behaviour) and `sprint-019 AC-4: the live retro backlog parses…` (caused by the retro seeded defect alone, reproduced by `--filter "sprint-019 AC-4: the live retro backlog"` → exit 1, 11/12). The retro defect is excluded from the Added tests rows below, so every defect named in them left every behaviour test green.

| Test | Gap proof | Regression proof |
|---|---|---|
| tests/run.js:`sprint-037 AC-1: context-check exits 0 over the committed ceilings…` | seeded over-ceiling filter always empty (`.filter(() => false)` in `contextCheckCommand`): `node tests/run.js` → only the upstream_hashes byte-ledger test red, every behaviour test green; search `context-check\|context-ceilings\|contextCheck` in tests/: no test of the unit | mutation over-ceiling filter always empty: `node tests/run.js --filter "sprint-037 AC-1:"` → exit 1, `sprint-037 AC-1: context-check exits 0 over the committed ceilings…` (1/433 matched); runs: 1. Seeded violation per `code-style.md` §17 (a lowered ceiling): `node .asd/runtime.js context-check --ceilings <copy with asd-dev@impl = 1>` → exit 1, `{"over":[{"key":"asd-dev@impl","bytes":92465,"ceiling":1}]}`; the unlowered `node .asd/runtime.js context-check` → exit 0, `{"over":[]}`; the copy lived in the scratchpad, `.asd/project/context-ceilings.json` untouched |
| tests/run.js:`sprint-037 AC-2/AC-18: a dispatch open takes context_bytes…` | seeded defects: bundle size never assigned in `fillDispatchAttrs`, summary `total` fixed 0 in `contextByteTotals`, `SUITE_OVER_FACTOR` 100: same combined `node tests/run.js` → only the byte-ledger test red; search `context_bytes\|suite_full\|timingSummary` in tests/: timingSummary tests exist for other fields, none read `context_bytes` or `suite_full` | mutation bundle size never assigned: `node tests/run.js --filter "sprint-037 AC-2/AC-18"` → exit 1, `sprint-037 AC-2/AC-18: a dispatch open takes context_bytes…` (1/433); mutation summary total 0: same command → exit 1, same test (1/433); mutation `SUITE_OVER_FACTOR` 100: same command → exit 1, same test (1/433); runs: 3 |
| tests/run.js:`sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` | seeded defects: allowance never required (`test.net > TEST_ALLOWANCE_LINES && test.net > other.net` → `false`), empty-Gap-proof refusal removed in `checkGapProof`: same combined run → only the byte-ledger test red; search `test-delta\|testDelta\|Gap proof\|allowance_required` in tests/: no test of the unit (the existing `impl-test-close` test covers the HEAD fill only) | mutation allowance never required: `node tests/run.js --filter "sprint-037 AC-3/AC-13"` → exit 1, `sprint-037 AC-3/AC-13: test-delta splits the sprint diff…` (1/433); mutation empty-Gap-proof refusal removed: same command → exit 1, same test (1/433); runs: 2 |
| tests/run.js:`sprint-037 AC-5: stubs-due lists an accepted-debt row…` | seeded defect expiry comparison inverted (`date < today` → `date > today` in `stubsDue`): same combined run → only the byte-ledger test red; search `stubs-due\|stubsDue` in tests/: no test of the unit | mutation expiry inverted: `node tests/run.js --filter "sprint-037 AC-5:"` → exit 1, `sprint-037 AC-5: stubs-due lists an accepted-debt row…` (1/433); runs: 1 |

Decision `none`, existing test red on the seeded defect (admission, `code-style.md` §17): AC-21 stray `sandbox_mode` — seeded defect re-adding the `sandbox_mode` render line in `.asd/sync.js` `transformAgentCodexToml`: `node tests/run.js --filter "canonical agent -> Codex .toml matches fixture"` → exit 1, `canonical agent -> Codex .toml matches fixture` (0/1 passed; restored, `git status` clean of `.asd/sync.js`).

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The review-fix tester also records here the check a finding requires; `impl-test`
step 8 reuses it per "Impacted test set". The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (`test` and `test_durations` from commands.yaml)
- Scope: full — one file with no native selector
- Result: pass — 433 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` clean on the staged paths, `node .asd/sync.js --check` ok (66 items, all current)
- Slowest tests: 7222 ms sprint-031 AC-9 (issue #74) emit-manifest command-line budget split; 2573 ms AC-5 negative-cache recovers on fingerprint change; 2531 ms sprint-035 AC-15 latch-refresh clears per manifest; 2504 ms sprint-036 AC-9 latch-refresh comment-only change; 2462 ms sprint-017 AC-4/AC-8 emit-manifest --full-files/--full-base; 2167 ms sprint-036 AC-14 agent-liveness --returns; 2156 ms sprint-023 AC-2 asd-sprint Step 0 order; 2098 ms sprint-021 AC-7 agentLiveness transcript verdicts; 1679 ms sprint-020 AC-1/AC-6 SessionStart chain; 1662 ms sprint-017 AC-1 review-waves git range
- HEAD: 984cd797447f662ed4dd27cb7c4576e73952d7ec

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Suite revision (optional)

Only when the sprint's accepted scope asks for one (`.asd/agents/asd-tester.md` "Suite revision"). The ledger is the resume point: the orchestrator dispatches again until no area is `pending`.

- Before: 430 tests (416 passing, 14 failing on pins this sprint changed), 11573 `tests/run.js` lines, 70.7 s full run (`node tests/run.js`, one file, at `13292f6a`, before this entry's edits)
- After: (written when no area is `pending`)

| Area | State | Tests before → after | Seeded-defect proof |
|---|---|---|---|
