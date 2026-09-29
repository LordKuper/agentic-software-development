---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 021-deferred-archival-retro-sweep

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | f4ccc40 | full change surface |

## Risk → check decisions

Mutation ids (M-N) are listed under Added tests. Every mutation of a `managed_paths` file also fails the `upstream_hashes` ledger test (and, for a canon agent/skill/hook, `sync.js --check` and `canon_hashes`): expected noise, not recorded as the failing test.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `isTest` (AC-12) | a dotted test dir (`Core.Tests/`) never reaches Testing | unit/property | add | three dotted fixtures plus two dotted non-test negatives appended to the sprint-015 AC-2/AC-3 fixture lists; M1 is main's regex |
| `runtime.js` `isUiSurface` (AC-12) | Unity UI Toolkit files and an upper-case `UI/` segment n/a UI conformance | unit/property | add | five surfaces appended to the sprint-012 AC-12 loop, asserted through the emitted manifest's n/a rows rather than the helper |
| `runtime.js` `surfaceCheck` generated views (AC-12) | regenerated views count against the change-surface cap | unit + contract | add | view set derived from `sync.buildSyncPlan` targets; root managed blocks, agent memory and `settings.local.json` still count; the consumer pathspec row in `external-review.md` "Phase-scoped payload" must exclude every view |
| `surface-check --base/--head` (AC-12) | a pure move inflates the division-point count, or an edited move is dropped | component (CLI in sandbox git repo) | add | pure rename dropped, edited rename and new file kept |
| `recordExternalFailure` (AC-11) | a reset past 1 h is refused and the quota failure goes unrecorded; the default re-hits the quota after 5 min | unit | add | old loop asserted the superseded throw above 1 h; rewritten in place (AC-3/4/5 test) to clamp, default and in-hour cases, with a NaN refusal added |
| `NEGATIVE_TTL_MS` removal | the 5-minute default survives | static sweep | add | pinned in the leftover sweep (AC-13 row) |
| `emitCoverageManifest` ledger skeleton (AC-10) | skeleton missing, wrong digest or ids; skeleton inside the digest breaks every validation | component (CLI) | add | emit-manifest CLI test: stamped-key filter admits `ledger`, the skeleton is asserted whole, the digest identity excludes it, and the validate-ledger fixture is now filled from the skeleton, so the skeleton itself validates |
| `persist-review --in` reads the D6 return file | none; `persist-review` is unchanged this sprint | — | none | behaviour unchanged. Existing sprint-020 AC-9 persist-review tests cover `--in`; the path relation is covered by the literal-mirrors row |
| `scratch-dir` (D5) | helper files committed, or the path depends on cwd | component (CLI in sandbox git repo) | add | runtime copied into a temp repo and run from another cwd; `git status --porcelain --untracked-files=all` must be empty |
| `agentLiveness` / `agent-liveness` (D7, AC-7) | a healthy agent stopped (long tool call, first miss), a hung one never flagged, a finished one flagged | unit + component (CLI) | add | 12 pure cases with ceiling and budget boundaries; CLI run over `$CLAUDE_CONFIG_DIR` fixtures (1 s interval). Live evidence, not a test: over this session's 21 real transcripts under `~/.claude/projects/.../subagents/`, the 20 finished ones read `done`, and this dispatch's own, with an open `tool_use` and `stop_reason: null`, reads `running` |
| Liveness host wiring (`Monitor`/`CronCreate`, `wait_agent`) | the orchestrator never arms the check | — | none | orchestrator runtime behaviour on the live host, not assertable offline. Owner: the orchestrator; `providers.md` "Agent liveness per host" records its live verification. The literal cadence is asserted (literal-mirrors row) |
| `CHAIN_EXITS` / `next.pr` (D1, AC-1) | a chain exit asd-sprint cannot relay; `done` returns as a pr exit | contract | add | exits derived from both definitions; asd-sprint's return contract and its Step 1A routing line must take each one. The pr return contract ↔ `next.pr` relation is already asserted by the sprint-020 AC-6 NEXT-targets test (keep) |
| `asd-phase-pr.md` merge mode, `asd-phase-scope.md` step 1 (AC-1, AC-2, AC-4) | merge mode writes on base; scope drops a closure-write field or the tag | contract | add | tokens derived from `sprint-lifecycle.md` "PR phase" "Closure write"; merge mode carries `NEXT: await-closure` and none of `git mv`/`phase="done"`/`archived_at`; scope step 1 carries every token (gate name hyphenated as its `gate_decisions` value) |
| `session-start.js` merged-unclosed (D3, AC-3) | a false closure prompt, or a throw on an odd `.git` | component (hook in temp root) | keep (rewritten in place) | the old AC-21 test asserted the retired `await-user-closure`. Rewritten into six cases: merged on base, legacy `closure-pending`, still on the sprint branch, no PR number, detached HEAD, worktree `.git` file |
| Reviewer Codex sandbox (D6) | the frontmatter disagrees with `providers.md`, or the only bound on reviewer writes is lost | static | keep (rewritten in place) | the read-only-agents test pinned `read-only` for all. It now reads the expected sandbox per agent from `providers.md` "Agent tier matrix", limits `workspace-write` to `asd-reviewer-*`, and requires each such reviewer's Outputs policy line to name the return file and its own memory |
| `providers.md` reviewer-grant paragraph (D6) | the trade-off statement is lost | static | keep (rewritten in place) | L3583 and L3622 pinned the superseded sentence "no artifact-write grant on either host". Replaced by a sentence-level check: `sandbox_mode: "workspace-write"`, the "Coverage ledger" pointer, and `policy` and `read-only` outside code spans. The sentence lock at L3622 is dropped. M18r rewords the sentence and it stays green |
| Smoke check move (AC-10) | results collected twice or never, or read from a payload no step fills | contract | keep (rewritten in place) | the sprint-018 test asserted impl-review collection. It now asserts impl-test step 10, the absence of an impl-review collection, and exactly one impl-roster reader per workflow reading `test-plan.md` |
| T-2 `--apply` target-form SSoT (AC-11) | view path shapes restated; custom-coding-rules keeps a dev `--apply` | static | keep (rewritten in place) | the AGENTS.md parenthetical it pinned is gone. The shape's one home is now `providers.md`, derived by a sweep over canon, README, AGENTS.md and custom-coding-rules. custom-coding-rules leaves the citation list (it no longer names a target form) and instead must carry no target form and cite "Self-hosting" |
| Dev `--apply` in dev memory and README (AC-11) | a dev runs `--apply`, rewriting the ledgers repo-wide under a sibling's commits | static sweep | add | How-to-apply sentences of `asd-dev*` memory plus README's `self_hosting: enabled` line. A sentence naming `--apply` must deny it or name the orchestrator. Red at HEAD: D-1, D-2, D-3 |
| Removed mechanisms (AC-13 leftover-term check) | a surviving restatement of a removed flow | static sweep | add | 18 exact strings taken from the diff's removed lines, swept over canon, README, AGENTS.md, custom-coding-rules, hook, runtime, both workflow JSONs and every agent-memory directory. Hits on a `legacy` line are compared to the exact exemption set |
| Two-site literals (AC-7, AC-10, AC-11) | the reviewer writes one return path while persist-review reads another; the timeout floor, stall line or cadence drift | static | add | return-file path at home, README and both review workflows, each instantiated with its own `--phase`; `at least N minutes` in rule and wrapper; stall line in rule and `t_decisions-log.md`; cadence minutes × 60 = `--interval` |
| `\|` escaping in Findings cells (AC-10) | a pipe shifts the location column | — | none | parser unchanged: `tableCells` `\|` handling is pinned by sprint-019 AC-4 (`backlogRows`) and the defect-stalemate malformed-row test. The new text is reviewer instruction |
| AC-8 plan rules (`sprint-lifecycle.md` "Plan file format", `asd-phase-plan.md` step 4, `t_plan.md`) | the acting site drifts from the rule | — | none | each rule is a paraphrase at both sites, with no token. A true/false relation between paraphrases has no derivable proxy (sprint 010 iter-03 measurement). Would be assertable once a rule carries a parsed plan-grammar line |
| AC-9 scope/audit rules (`asd-phase-scope.md` step 2/4, `asd-phase-audit.md`, `t_audit.md`, architect/BA) | the split offer, deliverability check or BA routing is dropped at one site | — | none | same class as AC-8: procedural paraphrase judged by the orchestrator at runtime, no token |
| AC-10 dedupe/reach/prior-disposition rules (`review-policy.md` "Autofix vs escalation", `asd-phase-impl.md` steps 3/6/10–11, `asd-dev.md`) | findings routed twice; a reach fix covers one branch | — | none | agent-runtime judgement on finding content, no token. Would be assertable only with a finding-merge helper in the runtime |
| AC-11 wrapper stdout/notification rules (`asd-external-review.md`, `providers.md` delegate row) | stdout redirected; a return read from the task output file | — | none | host-tool behaviour of a live dispatch. The timeout floor, the one numeric literal, is asserted (literal-mirrors row) |
| README mirrors (pr row, flowchart, folder map, runtime command list) | the phase chain mirror drifts | static | keep | §16 README chain tests and the canon-subcommand test (sprint-012 AC-3/AC-12) re-ran green at this HEAD. The folder-map `tmp/` line is display prose |
| `code-style.md` §17 token rule, `artifact-layout.md` "Leftover-term check" (AC-13) | none executable | — | none | a rule for authoring tests. This entry is its first application (the sweep above), and `asd-reviewer-testing` judges conformance |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| — | none removed. Five tests pinning superseded behaviour were rewritten in place (Risk rows "keep (rewritten in place)"). Two superseded sentence-lock asserts were dropped inside them: providers.md L3583/L3622 "no artifact-write grant on either host" | — |

## Added tests

All proofs: command `node tests/run.js`, restored byte-for-byte in the same call (`.asd/tmp/mutate.js`). Each failing test is the runner-reported name, and the quoted message is the first assertion that fired in it.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-015 AC-2/AC-3 (isTest dotted fixtures added) | M1 isTest reverted to main's regex → exit 1, FAIL sprint-015 AC-2/AC-3, "each path-segment and basename convention the plan names must classify as a test file …" |
| tests/run.js: sprint-012 AC-12 (UI surfaces added) | M2 drop `uxml\|uss\|tss` → exit 1, FAIL sprint-012 AC-12, "Assets/Menu.uxml is a UI surface …"; M3 drop the segment regex's `i` flag → exit 1, same test, "Assets/Scripts/UI/HudPresenter.cs is a UI surface …" |
| tests/run.js: sprint-021 AC-12: surface-check never counts a generated provider view or a pure rename … | M4 main's `new Set(files).size` → exit 1, "every provider-tree file sync.js writes is regenerated from canon …"; M5 range ignored → exit 1, "with --base/--head the pure rename drops out …"; M5b every rename dropped → exit 1, same assert |
| tests/run.js: AC-3/4/5, sprint-021 AC-11: preflight … negative cache is bounded (rewritten in place) | M6 refuse past 1 h (main's behaviour) → exit 1, first failure "Error: retryAfter outside bounded future" thrown by the clamp case; M6b default `now + 300000` (main's) → exit 1, "sprint-021 AC-11: with no provider-reported reset the retry-after is one hour …" |
| tests/run.js: runtime.js CLI: emit-manifest writes one stamped manifest … (skeleton asserts added) | M9c skeleton `files: []` → exit 1, "sprint-021 AC-10: correctness.manifest.json must carry the full ledger skeleton …"; M9b `delete copy.ledger` removed → exit 1, "correctness.manifest.json: a written manifest must carry its own digest …" (also reddens sprint-015 AC-4/AC-5 and sprint-020 AC-9) |
| tests/run.js: sprint-021 AC-10/AC-11 (D5): scratch-dir creates .asd/tmp/ … | M8 no `.gitignore` write → exit 1, "the directory and its own .gitignore must be ignored …" |
| tests/run.js: sprint-021 AC-7 (D7): agentLiveness … agent-liveness prints one STALL line … | M7 no open-call allowance → exit 1, "open tool call inside the host command ceiling: …"; M7b `<` → `<=` → "open tool call at the host command ceiling: …"; M7c `>` → `>=` → "growing at exactly the elapsed budget: …"; M7d done check removed → "final answer, unchanged and over budget: …"; M7e first miss unobservable → "transcript missing on the first check: …"; M7f transcript lookup one level shallow → "the command resolves each transcript under $CLAUDE_CONFIG_DIR/projects/<project>/<session>/subagents/ …"; each exit 1 |
| tests/run.js: sprint-021 AC-1/AC-2 (D1): pr ends at await-merge or await-closure … | M13 asd-sprint contract drops `await-closure` → exit 1, "asd-sprint must offer every chain exit in its return contract …"; M11 merge mode emits another token → exit 1, "AC-1: pr merge mode returns `NEXT: await-closure` …"; M11b merge mode names `git mv` → exit 1, "AC-1: pr merge mode makes no write on git.base_branch …"; M12 scope drops `archived_at` → exit 1, "AC-2: asd-phase-scope.md step 1 performs the closure write …" |
| tests/run.js: sprint-021 AC-3 (D3): SessionStart reports "Next phase: await-closure" … (rewritten in place) | M10 hook drops `branch !== null` → exit 1, "detached HEAD: merged-unclosed is phase pr + pr.number + …"; M10b hook never emits await-closure → exit 1, "merged, back on the base branch: …" |
| tests/run.js: read-only agents … Codex sandbox providers.md "Agent tier matrix" states … (rewritten in place) | M15 matrix reviewer row says read-only → exit 1, "asd-reviewer-combined: codex.sandbox_mode must be the "read-only" …"; M15b testing frontmatter read-only → exit 1, "asd-reviewer-testing: codex.sandbox_mode must be the "workspace-write" …"; M15c efficiency Outputs drops its memory → exit 1, "asd-reviewer-efficiency: Codex cannot scope workspace-write to a path …" |
| tests/run.js: AC-15/sprint-019 AC-14 (providers trade-off sentence, rewritten in place) | M18 drop "and policy alone bounds their writes" → exit 1, "sprint-021 D6: providers.md owns the artifact-level grant fact …". A first version tested `\bpolicy\b` on the raw sentence and stayed green under M18, because `review-policy.md` in the citation matched; it now strips code spans. M18r rewords the sentence end to end, keeping the substance → the assert stays green (the run's only other failures are the hash-ledger noise and the known D-1–D-3 test) |
| tests/run.js: sprint-018 AC-4/AC-5/AC-7 (smoke-check block, rewritten in place) | M17 step 10 asks nobody → exit 1, "AC-7/sprint-021 AC-10: impl-test's green exit (step 10) runs the smoke check …"; M17b testing reads a payload → exit 1, "sprint-021 AC-10: asd-reviewer-testing reads the results where impl-test records them …" |
| tests/run.js: T-2, sprint-021 AC-11: providers.md "Canonical path -> per-provider path" is the one home … (rewritten in place) | M16 README names `.codex/agents/<name>.toml` → exit 1, "the generated view path shapes live in providers.md's path table alone …" |
| tests/run.js: sprint-021 AC-13: no canon, README, AGENTS.md, runtime, hook … keeps a sentence or term the sprint removed … | M14 memory line "merge the companion PR after closure" → exit 1, "each phrase is a line this sprint deleted …"; M14b memory line labelled legacy → exit 1, "the exemption is exactly D2's legacy-recovery sentence …" |
| tests/run.js: sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply … | fail-first vs D-1/D-2/D-3: `node tests/run.js` at a38a72b plus this entry's tests → exit 1, this test, "… D-1/D-2/D-3 (test-plan.md): .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md, .claude/agent-memory/asd-dev/project_asd-self-hosting.md, README.md" |
| tests/run.js: sprint-021 AC-7/AC-10/AC-11: each literal the sprint states at two sites agrees … | M19 impl-review return file with `design` phase → exit 1, ".asd/workflows/asd-phase-impl-review.md: the payload names the return file persist-review --in reads …"; M19b README path drifts → "README.md must name the return file exactly as its home does"; M20 wrapper floor 5 → "AC-11: the wrapped CLI's shell-timeout floor …"; M21 template stall line drifts → "AC-7: a second stall of a dispatch is counted from its decisions-log lines …"; M22 `--interval 60` → "AC-7: providers.md "Agent liveness per host" must run agent-liveness at the cadence …"; each exit 1 |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js` (unscoped)
- Scope: full. The shared-infrastructure safety valve fires because the change surface touches framework-wide files (`.asd/runtime.js`, `.asd/hooks/session-start.js`, `.asd/rules/*`, both workflow definitions), so the impacted set degrades to the full suite. The pre-strategy run was full too: 238/246 passed, 8 failed, all triaged as test defects (tests pinning superseded behaviour or prose) and rewritten above
- Result: fail — 252/253 passed, 1 failed (sprint-021 AC-11 dev `--apply` sweep: D-1, D-2, D-3), 0 skipped
- Lint / build: pass. `git diff --cached --check` is clean at commit; `node .asd/sync.js --check` exits 0 with every item current
- HEAD: a38a72b, plus this entry's uncommitted test and tester-memory edits, committed right after this record

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .claude/agent-memory/asd-dev/project_agents-md-sync-state-drift.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-2 | 1 | .claude/agent-memory/asd-dev/project_asd-self-hosting.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-3 | 1 | README.md | AssertionError [ERR_ASSERTION]: a memory's How-to-apply is the instruction a dev acts on, and README's self-hosting answer tells a reader who resyncs the views, so a sentence there naming --apply must deny it to the dev or give it to the orchestrator - D-1/D-2/D-3 (test-plan.md) | sprint-021 AC-11: no dev memory, nor README's self-hosting answer, has a dev run sync.js --apply | fixed | 4d3a7d3 |
| D-4 | 1 | .claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md | leftover-term sweep (manual, no runner line): "Always a test/repo-state defect for a dev to fix via `sync-apply`" routes a stale hash ledger to a dev, who never runs `--apply` since this sprint | none (manual leftover-term check, `artifact-layout.md` "Leftover-term check") | pending |  |
