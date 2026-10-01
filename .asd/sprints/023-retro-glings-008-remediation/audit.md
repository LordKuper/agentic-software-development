---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

Read at HEAD f8d4c64 (line numbers `L` at that HEAD). Host facts checked against the Claude Code docs `sub-agents` (maxTurns, memory), `hooks`, `tools-reference` (Read, Bash), plus a scratch-repo git experiment on this Windows host for AC-2.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
A file shared by several ACs is listed under each; the plan puts each in one Task.

**AC-1 (wave division by files and bytes, turn plan)**
- `.asd/runtime.js`: L24-28 constants; L708-713 `reviewWaveCount`; L893-906 `reviewWavesCommand` (measure output and `waves.json` write); L1087 usage; L1094 exports.
- `sprint-lifecycle.md`: L62 "Division point" (one per `WAVE_THRESHOLD_LINES` begun); L63 "Division" (`waves.json` fields `base, head, lines, threshold`).
- `providers.md` L52 "Dispatch payload header": the `Turn budget:` line and "wave division, never resume, is the lever" (home of the turn plan).
- `asd-phase-impl-review.md` L29 step 1c (n>1 decisions-log entry names measured `lines`); L46 step 6 already opens every payload with the header.
- `review-policy.md` L33 and `external-review.md` L53 list the header keys; `tests/run.js` L6367-6381 forces both to admit any new backticked `Key:` header line. Folding the plan into the existing `Turn budget:` line avoids both edits.
- `README.md` L190 ("up to 3 sequential review waves") stays true; L327 runtime.js description may add files and bytes.
- `tests/run.js`: L3300-3335 (`reviewWaveCount` table, cap pin); L4686-4690 (canon-cited symbols must exist and be exported; `review-waves` invoked by impl-review); L5518-5560 (CLI measure, `waves.json` shape); L6367-6392 (header keys, `report by turn <maxTurns − N>` regex).
- Agent frontmatter `maxTurns` (reviewers 50) needs no body edit.

**AC-2 (fetch and fast-forward before detection)**
- `.asd/skills/asd-sprint/SKILL.md`: L13-15 Preconditions; L19 Operations (`git fetch` already listed for release retry); L28 Step 1, where a new Step 0 goes (tests split on `### Step 1:` and `### Step 2B`, so Step 0 breaks nothing).
- `git-strategy.md` L7 "Branch" (sole home of fetch, fast-forward, "diverged → halt"); L74 "Pre-existing uncommitted changes".
- `asd-phase-scope.md` step 1 L5 repeats "fast-forward the base branch" at branch creation.
- `sprint-lifecycle.md` "Merged-unclosed" L325 and "Closure write" L327 need no change.
- Generated views: `.claude/skills/asd-sprint/SKILL.md`, `.agents/skills/asd-sprint/SKILL.md`.

**AC-3 (scope manifest by path)**
- `external-review.md`: L13; L21-22 table rows (`<rendered prompt + scope manifest>`); L23; L53; L65.
- `asd-external-review.md`: L4 description; L15 Codex-block `wraps_invoke_args` ("scope manifest provided via stdin above"); L47; L58; L65, L68, L74, L76, L77, L79 (stdin-only wording); L107 ("Never write the prompt or scope manifest to disk").
- `t_prompt-external-impl.md` and `t_prompt-external-design.md` L12-16 (`{{SCOPE_MANIFEST_JSON}}` fenced block) and L20. `t_review-scope.json` unchanged.
- Already path-based, no edit: `asd-phase-impl-review.md` L38, L46; `asd-phase-design-review.md` L34-35. README L249 unchanged.
- `tests/run.js`: L3528-3530 pin the `<<'EOF'` and `@'` rows (heredoc form of the prompt stays); L2078-2122 and L5883 pin `files[]`, `diff` and the hand-off link; L7236 reads `--effort` (keep `--effort xhigh`); nothing pins `SCOPE_MANIFEST_JSON`.
- Generated views: `.claude/agents/asd-external-review.md`; `.codex/agents/asd-external-review.toml` (the `-p` string appears 4 times).
- Hand-authored memory `.claude/agent-memory/asd-external-review/` (`reference_scope-manifest-transport.md`, `reference_codex-invocation.md`, `reference_bash-tool-limits.md`) describes the old transport.

**AC-4 (agent-memory content rule and runtime check)**
- `artifact-layout.md` L94 "Agent memory" (home of the rule); L100 "Leftover-term check" related.
- `git-strategy.md` L41 "Commit before review" (the orchestrator commits reviewer memory, a co-author's, and memory-fix text; home of the check call).
- Citing sites, no edit: `asd-phase-impl-review.md` L47, `asd-phase-design-review.md` L36, `asd-phase-impl.md` L14/L55/L60/L84/L100, `review-policy.md` L53/L95.
- `.asd/runtime.js`: new subcommand, usage L1087, exports. `README.md` L327 (runtime.js description).
- `tests/run.js` L4686-4690 auto-checks that a subcommand canon tells the orchestrator to run is dispatched by `main()`; new subcommand tests.

**AC-5 (test-only Tasks)** — every site that says impl writes no tests or the plan has no test-authoring Tasks:
- `sprint-lifecycle.md`: L40; L131-132 phase rows; L244 "Impl phase"; L258-266 "Impl-test phase" (entry-1 handover); "Plan file format" L368-398 (Task shape beside Material risk L372-376, Reachability L378, Settings change L382; Wave declaration L384; Decomposition rules L388-396, stub rule L396 stays).
- `t_plan.md` L16, L22 and one example Task block; `asd-phase-plan.md` L31, L38, L42, L43.
- `asd-phase-impl.md` L16, L24, L61 (5a assumes `asd-dev-<tier>`), L65 (step 6), L76, L127, L139-140; L100 gate needs no change.
- `asd-phase-impl-test.md` L38-43 step 4, L46-48 step 7, L75-76.
- `asd-tester.md` L4, L20, L24-26; `asd-dev.md` L24 stays.
- `code-style.md` L113; `providers.md` L120 (tester role-context row); `artifact-layout.md` L193 (`test-plan.md` owned by impl-test alone); `.asd/skills/asd-phase-impl/SKILL.md` L4; `README.md` L178, L188, L229.
- Already generic: `git-strategy.md` L16 (`ASD-Task: Task N` valid for a tester commit); `route-task` has no per-agent logic.
- `tests/run.js` L4126-4129 (`t_plan.md` example blocks), L4750-4760 (Settings-change pin), L7155 (devs never edit `plan.md`).
- Generated views: `asd-tester` plus `-mechanical`/`-critical` (6 files across both providers), `asd-phase-impl` skill views.

**AC-6 (bounded fail-first proof)**
- `code-style.md` §17: L120 (fail-first bullet), L126 (content-contract bullet, home of the bound).
- `t_test-plan.md` L45-47 "Added tests", the `Regression proof` cell format (run count).
- No edit: `asd-tester.md` L63, `asd-reviewer-testing.md` L52, `asd-phase-impl-test.md` L47, `sprint-lifecycle.md` L260 (all delegate to §17). `tests/run.js` L4294-4313 pins §17 restore-obligation substrings; they stay.

**AC-7 (tier tables, narrowed)**
- `providers.md`: L84-95 "Agent tier matrix" (removed); L73-80 "Model family resolution" (separate mirror of `release-manifest.json`, covered by the AC-10 pin test); L42 cites the matrix.
- `README.md` L218 families list, L224-263 Creators/Reviewers/Advisor tables, L232 variant sentence: stay as the one mirror.
- `tests/run.js`: L7225-7290 (one large pin: matrix rows, README rows, families, variants, wrapped reviewer); L1037-1066 (reads the matrix sandbox column; repoint to frontmatter); L7292-7305 family-table pin unchanged.
- `.asd/sync.js` (`buildSyncPlan`, `managed-block`, `agentVariants`) not touched by the narrowed form.

**AC-8 (upstream proposals in consumer mode)**
- `.asd/runtime.js` L630-641 `retroCandidates` (final `filter` drops `asd` rows unless `selfHosting`); CLI L1077-1081; `ACTS_ON` L71.
- `sprint-lifecycle.md`: L9 "Retro intake"; L315 "Retro phase" Home "upstream ASD"; L125 phase table.
- `asd-phase-scope.md` L11 step 2a, L14 step 4. `README.md` L182, L327. Templates `t_retro-backlog.md`, `t_retrospective.html` unchanged. `checkpoints.md` L7/L26/L50 dispositions unaffected.
- `tests/run.js`: L6154-6165 fixture; L6222-6262 pins "a consumer project gets only consumer rows" (expected list and consumer CLI `every(acts_on === 'consumer')`); L6264-6293 pins rule sentences (`/non-zero exit/`, `/empty array/` with "no question", "no backlog write", "decisions-log", `/\bresolved\b/`, `/\bundecided\b/`, "never offered again").

**AC-9 (per-delta routing)**
- `providers.md` L134 (re-entry passes prior `tier` as `priorTier`), L140 (`priorTier` prevents downgrade, reason precedence).
- `asd-phase-impl-test.md` L32 step 1a ("reuse its tier on re-entry … never later downgraded"); `asd-phase-impl.md` L61 step 5a; `asd-phase-impl-review.md` L61 step 8 (tester test-fix), L66 step 9 (terminal run names no routing).
- `.asd/runtime.js` `routeTask` L273-293: pure function, clamp correct per unit, no change. `tests/run.js` L2436-2445 and L3355-3416 pin runtime clamp semantics (stay green); a new prose pin is needed.
- Evidence: archived `task_routing` in 021 and 022 shows `impl-test entry 2…7` and `review-fix` records with reason `no-downgrade`; 021 retro: five critical-tier tester dispatches (~600k tokens) on README, memory or one-sentence workflow deltas.

**Cross-cutting**: `.asd/release-manifest.json` (version bump, `canon_hashes` for edited agents/skills, `upstream_hashes`); `CHANGELOG.md` v13.6.0 MINOR at pr phase; `.asd/sync-state.json` untouched.

## Existing docs found
- `sprint-lifecycle.md` L7 "Orchestration and adaptive gates": retro-derived criteria re-verified at scope; a host-behaviour row needs host docs or a live dispatch.
- Glings 008 retro rows: F-1/F-2 (active-sprint check reads only the local tree; rule text read before base fast-forward), F-5 (the wave with the fewest diff lines but the most files overran 50 turns), F-7, F-9 (whole manifest rendered inline into a heredoc), P-2 (test-only Tasks), P-3 (a ~100-file wave overran at 50 turns without a plan; the re-dispatch with a plan finished in 65 tool uses).
- 022 retro P-1, P-2, P-3; 021 retro A-1 and P-1. `retro-backlog.md` carries the five 023 rows as `included`.
- `providers.md` L52, L56: `maxTurns` is host-enforced on Claude and absent on Codex; a cap stop is an interrupted dispatch; "wave division, never resume, is the lever". L46: artifact writes never use a shell heredoc; stdin to a command is a separate permitted operation.
- `artifact-layout.md` L98 and `review-policy.md` L53: agent memory is in the review surface; the orchestrator commits it when the author cannot.
- `AUDIT_BATCH_THRESHOLD_FILES` (`asd-phase-audit.md` step 2) is the precedent: a runtime constant is the home of a number, prose cites it by symbol, a conditional payload clause fires above it.
- Host docs fetched 2026-10-01: `sub-agents` — `maxTurns` documented, default unlimited, a cap stop returns partial resumable output (v2.1.246+); `memory: project` enables Read, Write, Edit under `.claude/agent-memory/<name>/`. `hooks` — PreToolUse/PostToolUse fire for subagent tool calls; a `Write|Edit` matcher can block via exit 2 or `permissionDecision: deny`; no memory-specific hook. `tools-reference` — Read returns a PARTIAL view past a per-call token limit (offset/limit chunks are the lever); no Bash command-length cap documented.
- Agent memory `asd-external-review/reference_bash-tool-limits.md` (2026-09-04, memory only): a heredoc command of ~9 KB fails with a bogus quote-EOF error; ~3 KB passes. `t_prompt-external-impl.md` is 4,296 bytes before slots are filled.
- No open stubs.

## Contradictions
Canonical rules that an accepted AC deliberately amends are resolved by the 022 precedent: the later user-accepted scope wins and the canon site is listed for edit.
- **AC-2 wording vs what a fast-forward can reach**: AC-2 said "rule, workflow and skill text is read only after that fast-forward"; the skill's own text and AGENTS.md/CLAUDE.md/`core.md` are loaded before Step 0, and with a sprint branch checked out Step 0 moves only the base ref, not the working tree. winner=user: narrowed to "rules, workflows and phase skills read after Step 0", with one sentence in Step 0 stating the pre-fetch limit; scope step 1's fast-forward stays (user, 2026-10-01).
- **AC-4 premise vs Claude docs**: "no persist-time hook" is false (a PreToolUse hook on `Write|Edit` fires for subagents). A hook needs a new script, a `.claude/settings.json` json-merge entry, sync-class and consumer rollout, and would be the first blocking hook. winner=user: runtime check at the orchestrator's memory commit; premise corrected in the AC; a dev's or tester's self-commit is gated only if a later range check scans it (user, 2026-10-01).
- **AC-5 vs canon "impl writes no tests"**: winner=AC-5. Reconcile: a plan-declared test-only Task goes to `asd-tester`, never a dev; it sits in a wave after every prod Task it covers, so selection still happens after the code exists; impl-test still owns strategy, pruning, the suite gate and new risk-based tests. Sites listed under AC-5.
- **AC-3 vs `external-review.md` and the agent**: winner=AC-3. The wrapper writes nothing; `emit-manifest` run by the orchestrator already wrote `external.scope.json`, which the wrapped CLI reads with its read-only tools as it already reads `files[]` and the `.diff` beside it.
- **AC-9 vs `providers.md` L134/L140, impl-test 1a, impl 5a**: winner=AC-9 (all carry the previous tier across entries).
- **AC-8 vs `sprint-lifecycle.md` L9 and the `retroCandidates` filter**: winner=AC-8; the 019 AC-2 test pins the drop and changes.
- **AC-1 vs `providers.md` L52 and `sprint-lifecycle.md` L62**: winner=AC-1 (the lever is no longer wave division alone; the formula counts lines only).
- **AC-7**: as written it was disproportionate (see Risks); winner=user: narrowed (user, 2026-10-01). A hard `new or changed scope` approval.

## Existing implementation found
- AC-1: division machinery exists (`review-waves`, `--division`, `waves.json`, `wave-files`, cap 3); the header carries `Turn budget:` and the `report by turn <maxTurns − 5>` regex is test-pinned.
- AC-2: `git-strategy.md` L7 already states fetch, fast-forward, "diverged → halt". The skill's only fetch is the release-retry check. Step 2A.2 already prompts commit, stash or abort on a dirty tree.
- AC-3: the manifest file is already on disk beside the `.diff` and is already passed to the wrapper by path; the wrapper renders it into the heredoc. Prior `external.md` files show the wrapped CLI reading `files[]` and the diff by path (Claude-host direction). The Codex-host direction has no live run in this repo, so it stays unverified, as the existing diff read is.
- AC-4: `isTest` and `isDocumentation` helpers and the `surface-check` convention (JSON stdout, exit 1 on breach, 2 on bad input) exist; memory commit points already cite `git-strategy.md` "Commit before review".
- AC-5: `ASD-Task: Task N` trailers already allow a tester commit; `route-task` is agent-agnostic; the impacted-set definition already includes test files; impl-test's `asd-tester` is already dispatched fresh per entry.
- AC-6: §17 L120/L126 and the `Added tests` proof cell exist.
- AC-8: `acts_on` carries the consumer/asd discriminator; `--self-hosting` is already passed.
- AC-9: `route-task` takes a per-call `priorTier`; `task_routing` is keyed per entry (`impl-test entry N`, `review-fix <id>`, `impl-review <id> suite`).

## Gaps
Per-AC recommended minimal design.

- **AC-1.** Evidence: 022 wave-1 iter-01 passed at 26 files, 395 changed lines, 146 KB diff; iter-02 hit the 50-turn cap at 23 files (23 + 29 rules + 16 sections = 68 ledger rows), ~262 lines, 111 KB. At ~424 bytes/line the 3000-line threshold is ~1.27 MB of diff. Glings: a wave over ~100 files overran; with a plan the re-dispatch finished in 65 tool uses. Turn use is not a clean function of files or bytes (26 passed, 23 failed); batching reads in one turn is the real lever.
  - `runtime.js` constants: `WAVE_THRESHOLD_FILES = Math.ceil(SURFACE_CAP_FILES / MAX_REVIEW_WAVES)` (34); `WAVE_THRESHOLD_BYTES = 300000` (~2x the largest passing diff); `LARGE_WAVE_FILES = 20` (below the smallest known overrun).
  - `reviewWaveCount(lines, files, bytes = 0)` = `min(MAX_REVIEW_WAVES, max(1, files), max(1, ceil(lines/L), ceil(files/F), ceil(bytes/B)))`; two-arg callers stay valid. `review-waves` measures bytes with one `git --literal-pathspecs diff -M --no-color <range> -- <scope>` via `runGit` and `Buffer.byteLength`, reports `{lines, files, bytes, thresholds, waves}`; `waves.json` gains the same fields (only `waves` and `head` are read back).
  - Turn plan goes in the existing `Turn budget:` line, not a new key. For a wave listing more than `LARGE_WAVE_FILES` files (cited `` `.asd/runtime.js` `LARGE_WAVE_FILES` ``) the line adds: ledger due by turn `<maxTurns − 10>` (derives AC-1's "turn 40" from canon and stays consistent with report-by `maxTurns − 5`); read the diff file in few large reads sized to the per-call token limit; batch independent reads in one turn; a short complete return beats a thorough unfinished one.
  - The ledger stays complete: `review-policy.md` "Coverage ledger" makes a verdict with any missing row INVALID, so "short" means shallower analysis per file, never fewer rows. The turn-plan text says so.
  - The plan reaches internal reviewers only: the wrapped CLI's turns are not capped by ASD (its bound is the wrapper's 10-minute run timeout), so files/bytes division is the only lever there; Codex renders no `maxTurns`, so the plan is advisory there.
  - Raising `maxTurns` is viable on Claude (one `claude.maxTurns` number in the combined agent) but not recommended now: no effect on Codex, doubles the cost of an interrupted attempt (~230k tokens, 7 min at 50), and does not bound a scope that `MAX_REVIEW_WAVES = 3` cannot divide. Kept as fallback for `asd-reviewer-combined` only. `MAX_REVIEW_WAVES = 3` stays (its pin and README "up to 3" depend on it); a scope above 3×34 files still gets 3 large waves covered by the plan only.
- **AC-2.** Add `### Step 0` before Step 1, after the config precondition (needs `git.base_branch`, a config read). Mechanics verified in a scratch repo on this host: base not checked out (sprint branch or detached HEAD) → `git fetch origin <base>:<base>` updates the ref only, works with a dirty tree, refuses non-fast-forward (exit 1); base checked out → git refuses the refspec form, so `git fetch origin` then `git merge --ff-only origin/<base>` (git refuses when an incoming change overlaps a dirty file; never `--update-head-ok`). Any refusal → halt and ask the user to resolve, per `git-strategy.md` "Branch"; no pre-checks. Mechanics live in `git-strategy.md` "Branch" (sole home); Step 0 cites it. Unreachable remote: warn and continue on local state, mirroring the Merged-unclosed lookup rule. The plan needs a `Reachability:` line pairing Step 0 (writes local base) with scope step 1 (branches from it).
- **AC-3.** Replace the prompt's fenced JSON block with a path slot (for example `{{SCOPE_MANIFEST_PATH}}`) telling the CLI to read that file first. Fix the Codex-block `-p` string ("provided via stdin above" → named in the prompt). Reword the `external-review.md` rows, the agent lines and L107 so the wrapper never writes the manifest and the prompt alone goes to stdin; table rows keep their `<<'EOF'` and `@'` tokens (tests L3528-3530).
- **AC-4.** State the content rule in `artifact-layout.md` "Agent memory": memory holds method only; it never records a sprint id, a Task, a wave, an iteration or a review verdict (that history belongs in the sprint's artefacts). Add `node .asd/runtime.js memory-check` over the staged diff, called from `git-strategy.md` "Commit before review": a violating memory write is not committed and returns to its owner's memory-fix dispatch. It scans added lines of `.claude/agent-memory/**` only (`git diff --cached -U0 --no-color -- .claude/agent-memory`) plus new file names; prints JSON `{path, line, token}`, exit 1 on a hit, 2 on bad input; no-op on Codex (no memory). Patterns on concrete ordinals so placeholders (`iter-NN`, `Task <N>`) pass: sprint id `\b\d{3}-[a-z][a-z0-9]*(-[a-z0-9]+)+\b` and `\bsprint[ -]?\d+\b` (case-insensitive); `\bTask \d+\b`; `\bwave[- ]\d+\b`; `\biter-\d+\b` and `\biteration \d+\b`; verdict only as a recorded token `\[REVIEW-(design|impl)-[a-z]+\]: *(APPROVE|CONCERNS|FAIL)`. Bare verdict words are not scanned. Current memory has `sprint 0NN` in 147 lines of 40 files, `iter-NN` with digits in 49 lines of 21 files, `wave N` in 11, `Task N` in 3, `[REVIEW-` in 9 (format docs with placeholders); the rule changes existing practice, added-line scanning leaves legacy text alone, no sweep in the AC. False positives rare (a note quoting `ASD-Task: Task 3`); false negatives: a reworded violation passes. Staged-only mode suffices; a `--base/--head` range mode for the impl completion gate (`asd-phase-impl.md` L100) is the upgrade path for dev/tester self-commits.
- **AC-5.** One conditional plain-text line directly under the `Material risk` line, for example `Test-only: <test paths or globs>`, written once in "Plan file format". The Task is dispatched to `asd-tester` (`asd-tester-<tier>` via `route-task`), touches only test files, never `test-plan.md`; the no-overlap-in-a-wave rule applies to its paths. It sits in a wave after every Task whose code it covers and stays within §17 (adapt existing tests to the code change; add tests only where §17 already qualifies them). Handover: its commits carry `ASD-Task: Task N`; impl-test entry 1 treats them as existing tests in the change surface (the pre-strategy impacted run already includes test files), does not re-author them, and still owns strategy, pruning and the suite gate. `asd-phase-impl.md` 5a and 6 say "the Task's agent"; `t_plan.md`, `asd-phase-plan.md`, the carve-out sentences, `asd-tester.md` and README cite the one home. This sprint's own plan cannot use the feature (it lands inside the sprint).
- **AC-6.** Append to §17 L126: a static content-contract assert's fail-first proof is bounded to one mutation per asserted relation plus one reword control (the same relation reworded must stay green), read per added test (per `Added tests` row); the row records the run count. Edit the `Regression proof` cell format to add `; runs: <n>`.
- **AC-7 (narrowed).** Delete `providers.md` "Agent tier matrix" and point to the agent frontmatter plus manifest `model_families` as the home; keep the README tier cells under the existing pin test; repoint the L1037 sandbox read to frontmatter; rewrite the L7225 pin to compare README cells to frontmatter. Removes the providers.md half of 022's pain (three providers.md edits and one of two pin tests). Every `providers.md` site citing the matrix (L42 and others found by plan-time grep) is repointed.
- **AC-8.** In consumer mode `retroCandidates` stops dropping `asd` rows from the latest retro (`fresh`); still drops `covered by:` rows; tags each shown `asd` row `upstream: true` (array contract kept, no new top-level key); self-hosting output unchanged; the `deferred` branch keeps its filter (a consumer cannot have a deferred `asd` row because upstream rows are never dispositioned). Rule text in "Retro intake": a row with `upstream: true` is shown inside the scope gate as an upstream proposal for the framework repo, not part of this sprint; the block lists row id, guardrail and home, no question; it gets no include/reject/defer, is never an `AC-N`, and is written to no backlog; each retro is the latest at one scope, so it shows once. Gap: "An empty array is a no-op: one decisions-log line, no question, no backlog write" must still hold for a list with nothing to disposition while the block is shown; keep the words the test greps (`no question`, `no backlog write`, `decisions-log`).
- **AC-9.** Canon leaves undefined which `risks` feed an impl-test entry or terminal run (in practice the orchestrator feeds the Task risks of the work in play; 022 entry 3 got `risk:public contract`). Add a scope rule in `providers.md` "Task-class variants and routing": `priorTier` is the tier recorded under the same `task_routing` key, a re-dispatch of that id; an `impl-test entry N`, `review-fix <id>` or terminal-suite `impl-review <id> suite` id is new each time and carries no `priorTier`; its tier comes from the declared `Material risk` lines of the plan Tasks whose paths its delta touches (entry 1 and the first terminal run use every Task; none declared → standard). Edit `providers.md` L134/L140, impl-test 1a and impl 5a to cite it; add a routing clause to impl-review step 9 and the step 8 tester fix. `routeTask` unchanged. In this self-hosting repo most deltas are workflow-gate changes, so the saving lands on README, memory, CHANGELOG and test-only deltas.

## Risks
- **AC-3 residual**: only the manifest leaves the heredoc; the template (4.3 KB) plus context slots stay in it. The Bash command-length cliff is a memory-only note (3.1–9 KB, not documented by Claude Code); if it applies, the prompt alone may still fail on this host. Impact=AC-3 may not fully cure F-9; mitigation=optional one-step extension (pass the template by path too, cutting the heredoc to ~1 KB), not in the AC; live check of the Codex-host path read is manual.
- **Stale agent memory**: `asd-external-review` memory files describe the old transport and cite "sprint 006/007/010". Only the owner edits them through a memory-fix dispatch (`review-policy.md` L95); a plan Task must not edit them; the rewrite must be method-only to pass the new AC-4 check. Impact=wrong transport guidance pays per dispatch; mitigation=orchestrator-run memory-fix dispatch after the wave, leftover-term check pinning exact removed sentences.
- **Cross-file consistency** (`AGENTS.md`): edits several ACs make to one file belong in one Task — `sprint-lifecycle.md` (AC-1, 5, 8, 9); `providers.md` (AC-1, 5, 7, 9); `code-style.md` (AC-5, 6); `git-strategy.md` (AC-2, 4); `asd-phase-impl.md` (AC-5, 9); `asd-phase-impl-test.md` (AC-5, 9); `asd-phase-impl-review.md` (AC-1, 9); `asd-phase-scope.md` (AC-2, 8); `runtime.js` (AC-1, 4, 8); `README.md` (AC-1, 4, 5, 7, 8). Any runtime symbol canon cites by `` `.asd/runtime.js` `SYM` `` must be exported (L4686 sweep); the new `memory-check` subcommand must be dispatched by `main()`; keep `--effort xhigh` and the `<<'EOF'`/`@'` tokens (L7236, L3528).
- **Tests red by design, owned by impl-test, not a Task**: L3300-3335 and L5518-5560 (AC-1); L6222-6262 and L6264-6293 (AC-8); L4126-4129 (AC-5); L7225-7290 and L1037-1066 (AC-7). New asserts needed for AC-2 (Step 0 before Step 1), AC-3, AC-4, AC-6, AC-9.
- **Dogfooding AC-1**: this sprint edits `runtime.js`, so its own impl-review divides under the new thresholds (~24 files, prose-heavy diff bytes) into one wave with the turn plan. A combined-reviewer overrun is possible again; budget a retry.
- **Windows host**: working tree is LF (`.gitattributes` `* text=auto eol=lf`, `core.autocrlf=true`); canon is one paragraph per line, so a CRLF write is a whole-file diff. Prefer the Edit tool and check `git diff --stat` is the size of the change (`code-style.md` §19). Edits to `asd-sprint`, `asd-phase-impl`, `asd-tester`, `asd-external-review` change 15+ generated views (4 skill views; `asd-tester` plus 2 variants under each agent tree for both providers); only the orchestrator runs `sync.js --apply` once per wave, passing generated view paths; `release-manifest.json` hashes update then. Devs never run it.
- **Offline**: AC-2's fetch needs the network; the Codex default sandbox may block it, hence warn-and-continue.
- **`backward_compat: migration`**: new fields are additive (`waves.json` readers use `waves` and `head` only; `review-waves` keeps its flags; the `retro-candidates` array contract is kept); no migration script; CHANGELOG notes the output changes; MINOR bump 13.6.0.
- **Change surface**: ~24 distinct paths in the impl-review pathspec (generated views and `.asd/project/**` excluded), first estimate; ~25 with a memory-fix; well under `SURFACE_CAP_FILES = 100`; measure with `surface-check` at plan time.
- **Task/wave grouping hint** (one Task per rule doc several ACs touch; tests belong to impl-test): wave 1, disjoint files, homes named in the plan Overview — T1 `runtime.js` (AC-1, 4, 8); T2 `sprint-lifecycle.md` plus `providers.md` (AC-1, 5, 7, 8, 9); T3 `git-strategy.md`, `artifact-layout.md`, `external-review.md`, `code-style.md` (AC-2, 3, 4, 5, 6). Wave 2, cite the wave-1 homes — T4 workflows and skills (`asd-phase-impl-review.md`, `asd-phase-impl.md`, `asd-phase-impl-test.md`, `asd-phase-plan.md`, `asd-phase-scope.md`, `asd-sprint` SKILL, `asd-phase-impl` SKILL description); T5 agents and templates (`asd-external-review.md`, `asd-tester.md`, `t_plan.md`, `t_test-plan.md`, the two prompt templates). Wave 3 — T6 `README.md`, last as the mirror. CHANGELOG and version bump belong to the pr phase. Orchestrator-only lines outside every Task: `sync.js --apply` per wave; a possible memory-fix dispatch to the `asd-external-review` owner; a live check of AC-3's Codex-host read (manual). A `Reachability:` line is warranted for AC-2 (Step 0 and scope step 1); AC-4's check and its commit sites may warrant one.
