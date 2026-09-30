---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/rules/sprint-lifecycle.md` "Audit phase").

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
Each entry names the home of the change, then every other site that restates the rule. The restating sites were found by repo grep, applying the 020#P-1 guardrail to this sprint's own plan.

- **AC-1…AC-5 (deferred archival)**
  - `sprint-lifecycle.md`: "Orchestration and adaptive gates" (L13, archived-active recovery), the phase-table `pr` row (L133, "PR, then terminal archive"), "Self-hosting" (L143, "tag/release only after closure finalization"), "PR phase" (L315, companion PR), "Sprint immutability" (L369, legacy in-place terminal write), "State recovery" (L373, `closure-pending`).
  - `git-strategy.md`: "Merging a PR" (L64, L66), "Finalize after closure" (L70-72, the whole section is deleted), "Versioning & Changelog" (L84, tag after the companion PR merges).
  - `artifact-layout.md`: "Sprint archival" (L243).
  - `checkpoints.md`: L52, "hard approve-before-finalize/archive" (wording only).
  - `asd-phase-pr.md`: "Merge and closure mode" steps 1-5 and the return contract.
  - `asd-phase-scope.md`: step 1 (gains the closure write).
  - `.asd/skills/asd-sprint/SKILL.md`: Preconditions L15, Step 1 L29, Step 3 L49 (all three already stale, see Contradictions 1).
  - `.asd/hooks/session-start.js`: `findActiveSprints` (L73-106) and `next` (L201).
  - `tests/run.js`: L2044, L2233, L2250.
  - README: L192, L345, L448.
  - Restating sites not listed in AC-5:
    - `core.md` L14 and L31 ("New sprint blocked until current archived");
    - `t_AGENTS.md` L48, and the root `AGENTS.md` managed block via sync;
    - the `.asd/skills/asd-phase-pr/SKILL.md` description;
    - `t_state.json`, where `pr: null` has no sub-key schema (sprint 020 wrote an ad-hoc `pr.merge_commit`);
    - CHANGELOG;
    - ownerless memory `.claude/agent-memory/asd-pm/feedback_escalate-structural-git-conflicts.md` and `reference_pr-phase-push-blocked.md`.
  - If a new `NEXT:` token is introduced, it also touches `standard.json`/`lite.json` `next.pr`, `runtime.js` L42 `CHAIN_EXITS` and the §16 chain tests.
- **AC-6**: already delivered at scope (`retro-backlog.md` holds 11 rows decided in 021). No impl work.
- **AC-7 (liveness)**
  - Homes: a new semantic operation pair (observe and stop an in-flight agent) in `providers.md` "Semantic operations -> host convention", and a rule paragraph beside "Failed dispatch" in `sprint-lifecycle.md` "State recovery".
  - `review-policy.md` "Interrupted dispatch" cites the new paragraph. Its existing "second consecutive interruption" escalation already covers the second stall.
  - The wait steps in `asd-phase-impl.md` step 7, `asd-phase-impl-review.md` step 7, `asd-phase-design-review.md` step 8 and `asd-phase-impl-test.md` inherit the rule without restating it.
- **AC-8 (plan authoring)**
  - Homes: `sprint-lifecycle.md` "Plan file format" (the rule home) and `asd-phase-plan.md` step 4, "Task decomposition rules" plus the "Stub inclusion step" (L27-40), which is the acting site.
  - `t_plan.md` restates the rules in its format-rules comment (L10-22).
  - Stub bullets: they amend `asd-phase-plan.md` L31. That line conflicts internally with L38 ("no test-authoring Tasks") when a stub's Owner is `asd-tester`.
  - External-API bullet: `artifact-layout.md` "Tech reference docs" and `code-style.md` §14.
  - No-helper-without-caller bullet: overlaps `code-style.md` §1 and §3.
  - Memory: `asd-dev-critical/project_parallel-wave-home-citations.md`, `project_parallel-agent-commit-sweep.md`.
- **AC-9 (scope and audit)**
  - Host-behaviour verification: `sprint-lifecycle.md` L7 and `asd-phase-scope.md` step 2.
  - Deliverability and consistency check: `sprint-lifecycle.md` "Audit phase" and the `asd-phase-audit.md` step 2 payload.
  - Split offer: `asd-phase-scope.md` step 2/4.
  - Authority ambiguity to the user: `sprint-lifecycle.md` L11, restated in `asd-phase-audit.md` step 3 and Delegates, `t_audit.md` L12, `asd-architect.md` Outputs L40 and `asd-ba.md` L16.
  - Mid-sprint amendment: `checkpoints.md` "Gate policy" and `sprint-lifecycle.md` L11. No procedure exists.
  - Memory: `asd-reviewer-correctness/feedback_check-host-claims-against-own-dispatch.md`.
- **AC-10 (review and fix)**
  - `|` escape: home `review-policy.md`, beside the table shape; also `t_review.md` "## Findings" and the reviewer return sections. The runtime already unescapes `\|` (`tableCells` L477), so this is prose only.
  - Designated return file:
    - `review-policy.md` Persistence (L138) and "Gate Verdict Format" (L152);
    - `providers.md` L46;
    - `asd-phase-impl-review.md` L17, L49 and `asd-phase-design-review.md` L13, L37;
    - the Output sections of the 6 reviewer agents, and `external-review.md` L13;
    - memory `asd-reviewer-documentation/project_reviewer-write-scope-declaration.md`, `asd-reviewer-correctness/reference_persist-review-return-shape.md`.
  - Ledger skeleton: `runtime.js` `emitCoverageManifest` and `review-policy.md` "Manifest vocabulary" (L126-130).
  - Dedup: `asd-phase-impl.md` step 3 (review-fix grouping).
  - Reach per branch: `review-policy.md` "Autofix vs escalation" and `asd-phase-impl.md` step 6. Memory: `asd-dev-critical/feedback_fix-the-class.md`, `feedback_false-ssot-declarations.md`.
  - Earlier disposition: `asd-phase-impl.md` steps 10-11 and `asd-dev.md` L93.
  - Smoke check timing: moves from `asd-phase-impl-review.md` step 6 (L45) to `asd-phase-impl-test.md`. It is restated in `artifact-layout.md` "Test plan" (L193) and in the Inputs of `asd-reviewer-testing.md` and `asd-reviewer-combined.md`.
- **AC-11 (dispatch robustness)**
  - Sync:
    - `asd-phase-impl.md` step 1 (L48);
    - step 9 (L100): the authorised-paths gate flags "a hand-edited generated view", so orchestrator-regenerated views must be admitted;
    - `sprint-lifecycle.md` "Self-hosting" (L139) and the root `AGENTS.md` repo-local tail;
    - memory `asd-dev-critical/project_sync-apply-target-form.md`, `project_sync-apply-ledger-gotcha.md`.
  - Denied command → `FAILED`: the `asd-phase-impl.md` "Execution mode" blocker list and the `asd-dev.md` Signals.
  - Wrapped-CLI timeout: `external-review.md` "Outcome contract" and `asd-external-review.md` L59, L66, L103. Memory: `asd-external-review/reference_codex-invocation.md`.
  - Retry-after:
    - `external-review.md` L31;
    - `runtime.js` L10 (`NEGATIVE_TTL_MS = 300000`), L257 (the 5-minute default), L258 (throws above 1 h instead of capping);
    - `tests/run.js` L2438-2439 asserts that throw.
  - Creator/tester failed dispatch: `sprint-lifecycle.md` "State recovery" "Failed dispatch" (L375), with `review-policy.md` "Correlated interruption" (L176) as the model.
  - Notification versus output file: the `providers.md` `delegate to agent` row.
  - Helper inputs: every site that says "temp file outside the repo" moves. These are `asd-phase-plan.md` L40, `asd-phase-impl-review.md` L9, L17, L24, L25, L49 and `asd-phase-design-review.md` L13, L37.
- **AC-12 (runtime classifiers)**: `.asd/runtime.js` `isUiSurface` (L377-381, not exported), `isTest` (L452-455) and `surfaceCheck` (L660-666). The consumer pathspec is in `external-review.md` "Phase-scoped payload" (L62), restated in `asd-phase-impl-test.md` L33.
- **AC-13 (test contracts)**: home `code-style.md` §17 (L111-128). Memory: `asd-dev-critical/project_tests-pin-literal-prose.md`, `asd-reviewer-testing/feedback_sweep-exemption-granularity.md`, `asd-tester-critical/feedback_fail-first-and-none-honesty.md`.

## Existing docs found
The repo has no `docs/` tree. Under self-hosting, the canonical rule docs are the persistent docs.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md) "PR phase": "only explicit closure approval allows a companion PR"
- [git-strategy.md](../../rules/git-strategy.md) "Finalize after closure": "creates `chore/finalize-sprint-<NNN-slug>`"; "Branch": "Never commit or push directly to `git.base_branch`" (the new flow keeps this, since it makes no base write)
- [asd-phase-pr.md](../../workflows/asd-phase-pr.md) open mode step 3: "Do not archive or mark done"
- [providers.md](../../rules/providers.md) L46: reviewers are config-enforced read-only; Claude `memory: project` adds `Write`
- [review-policy.md](../../rules/review-policy.md) "Interrupted dispatch" / "Correlated interruption": re-dispatch fresh; a second consecutive interruption escalates
- [external-review.md](../../rules/external-review.md) "Detection and negative cache": retry-after "at most one hour"
- [code-style.md](../../rules/code-style.md) §17: fail-first rules; no leftover-term or token-pinning rule yet
- [CHANGELOG.md](../../../CHANGELOG.md) v13.3.0: tagged on companion commit `5354056`, not on sprint PR #55's merge `598615d`
- Git evidence: when PR #55 merged, base carried the 020 state `phase:"pr"`, `pr.state:"open"`, `archived_at:null`. The companion commit added the terminal state. Glings' archived states carry ad-hoc `pr.merge_commit`/`companion_branch`/`merged_at` keys. Glings 007 is at `impl` on ASD 13.3.0 and has no closure in flight.

## Contradictions
1. `asd-sprint/SKILL.md` L15/L29/L49 vs `sprint-lifecycle.md` "PR phase": the skill says the folder is archived when the PR opens; the rule says "Do not archive or mark done". winner = `sprint-lifecycle.md` (canonical); the skill is rewritten in the AC-1…AC-5 Task.
2. README L448 vs `sprint-lifecycle.md` "PR phase": the same stale claim. winner = `sprint-lifecycle.md`.
3. `.claude/agent-memory/asd-pm/*` vs `git-strategy.md` "Merging a PR": the memory describes the finalize PR and "step-6 archival". winner = `git-strategy.md`; the owner agent no longer exists, so the files are deleted as ownerless.
4. sprint.md AC-11 bullet 6 ("under the sprint folder") vs `artifact-layout.md` L73 ("Nothing else is written under `.asd/sprints/<NNN-slug>/`"). winner = `artifact-layout.md`. The AC's own alternative, "a git-ignored repo path", satisfies both, so no gate is needed.
5. sprint.md AC-10 bullet 2 (the reviewer writes its return file) vs `providers.md` L46, `review-policy.md` "Gate Verdict Format", and Codex `sandbox_mode: "read-only"` on all reviewers. On Claude it is a policy-only change, because `memory: project` already grants `Write`. On Codex it needs `workspace-write`, which cannot be path-scoped. winner = unsettled → user: Codex reviewers go `workspace-write`, policy-bounded to their memory dir plus the designated return file (user, 2026-09-29); the host-enforced read-only guarantee on Codex is knowingly traded away.
6. sprint.md AC-7 ("no progress since the previous check" at a ≤5-minute cadence) vs AC-11 bullet 2 (wrapped-CLI timeout ≥10 minutes). Verified live: a subagent transcript does not grow while a tool call is in flight, so a healthy 10-minute CLI run or a long suite run would be stopped as stalled. winner = unsettled → user: "progress" excludes an in-flight tool call still inside its own declared timeout; elapsed-vs-per-agent budget as backstop (user, 2026-09-29).
7. sprint.md AC-7 ("at least every 5 minutes … verified against host docs") vs host reality:
   - Claude: `Monitor` is unavailable on Bedrock/Vertex/Foundry or with telemetry disabled, and `CronCreate` can be disabled.
   - Codex: no documented progress read, and `wait_agent` timeouts are not enforced under a runtime stall (openai/codex#24951, open).

   winner = unsettled → user: per-host degraded mode: Claude Monitor, fallback CronCreate; Codex wait_agent(timeout_ms ≤ 300000) best-effort; when neither is available, check at completion notifications only and log the degraded mode once per sprint in friction-log (user, 2026-09-29).

## Existing implementation found
- AC-12 defects confirmed at HEAD with `node -e`:
  - `isTest` is false for `src/Core.Tests/Helpers.cs`, `Core.Tests/Foo.cs` and `Game.Tests.Unit/Foo.cs` (regex L454).
  - `isUiSurface` is false for `.uxml`/`.uss`/`.tss` and for `src/UI/Button.cs`, and true for `src/ui/Button.cs`: the L380 regex has no `i` flag.
  - `surfaceCheck` counts generated views and takes no rename input.
- AC-10: `\|` unescape exists (`tableCells` L477). `numstatLines` already counts a pure rename as 0.
- AC-7: interrupted/failed-dispatch recovery and second-occurrence escalation exist. There is no liveness check, no stop operation in `providers.md` and no stall concept.
- AC-1/AC-4: after a sprint PR merges, the base-branch state already carries `pr.number`, which is enough for detection. The tag commands exist (`git-strategy.md` L84); only their target commit changes.
- AC-9: `asd-phase-audit.md` already routes BA only for evidenced product/domain ambiguity.

## Gaps
- **AC-1/AC-2 merged-unclosed detection** without a base write:
  - Authoritative: `gh pr view <state.pr.number> --json state,mergeCommit` returns `MERGED`.
  - Offline, for the hook: a sprint folder at `phase=pr` whose `state.branch` differs from the current branch can only be on base because its PR merged. A worktree `.git` file degrades silently.
- **AC-2 closure placement**: at `asd-sprint` Step 1, before new-sprint or resume, with the terminal write done by scope. Scope must fast-forward base, create the branch, `git mv` the folder, write the terminal state plus the `sprint-closure` gate record, and commit, all before seeding the new sprint. Approving closure and then aborting scope before the branch exists writes nothing; the question is asked again next time.
- **AC-3 legacy shapes**:
  - `closure-pending` only ever existed as uncommitted local state (base holds `open`), so it resolves via the same path.
  - An archived-non-done sprint gets its terminal write in place on the new branch; `sprint-lifecycle.md` "Sprint immutability" must say so.
  - An open legacy `chore/finalize-sprint-*` PR is detected via `gh pr list --head`: merged as already approved, else closed and folded into the new branch.
  - The one-active-sprint rule needs an exemption for an approved merged-unclosed sprint (`asd-sprint` Preconditions/Step 1, `core.md` L31, `t_AGENTS.md` L48).
- **AC-4**:
  - Tag `pr.mergeCommit` from `gh pr view`.
  - Read `asd_version` via `git show <merge>:.asd/release-manifest.json`.
  - Make it idempotent: check whether the tag exists first.
  - Run it at closure approval.
- **`NEXT:` token**: merge mode no longer ends at `done`. The options are to reuse `done`, which is misleading, or to add a new token (e.g. `await-closure`), which ripples to both workflow JSONs, `runtime.js` `CHAIN_EXITS`, `asd-sprint` Step 3, the hook L201 and the §16 tests. This is a plan decision.
- **AC-10 ledger skeleton**: `emitCoverageManifest` emits no pre-filled skeleton today.
- **AC-11 bullet 6**: there is no git-ignored helper path. `.gitignore` holds only `.asd/project/external-cache.json`, and `asd-init` seeds only the likec4 `dist/` entry. A new path (e.g. `.asd/project/scratch/`) needs four things: an `artifact-layout.md` path-map entry, an `asd-init` `.gitignore` seed, this repo's `.gitignore`, and an existing-consumer step. The AC-10 return file belongs there too, so every review is not duplicated in git.
- **AC-12 surface-check renames**: a path list cannot express renames, and the plan-time estimate cannot know them. The fix is deliverable at impl-review's division-point check by giving `surface-check` a range input (reusing `numstatLines`, or `--name-status -M` dropping `R100`). `isUiSurface` needs an export, or a test through `emitCoverageManifest`'s `n_a` output.
- **AC-8 stub inclusion**: a test-owned stub routes to impl-test with no plan Task. This resolves the `asd-phase-plan.md` L31 vs L38 conflict.
- **AC-9 mid-sprint amendment procedure**: missing entirely.
- External dependency gaps:
  - AC-7 host facts, verified:
    - Claude subagent docs (https://code.claude.com/docs/en/sub-agents): results arrive "inside a completion notification"; transcripts are at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`; `ScheduleWakeup` is removed from subagents.
    - Claude tools reference (https://code.claude.com/docs/en/tools-reference):
      - `TaskStop` stops a background agent.
      - `Monitor`'s deadline is 5 minutes by default, 30 at most and 10 under `-p`, and it can be re-armed. It is unavailable on Bedrock/Vertex/Foundry or with telemetry disabled.
      - Bash's default timeout is 2 minutes and its maximum 10 minutes; a timed-out command is moved to the background.
    - Claude scheduled tasks (https://code.claude.com/docs/en/scheduled-tasks): `CronCreate` fires only while idle between turns, at 1-minute granularity, and is disabled by `CLAUDE_CODE_DISABLE_CRON`.
    - Live observations:
      - The subagent transcript grows once per tool call and does not grow during an in-flight call.
      - `tasks/<id>.output` is 0 bytes at every point (friction F-2).
      - `ListAgents` shows `running` plus elapsed time only.
    - Codex config reference (https://learn.chatgpt.com/docs/config-file/config-reference): `spawn_agent`/`send_input`/`resume_agent`/`wait_agent`/`close_agent` under `features.multi_agent`.
    - Codex subagents page: read-only Active/Done UI; to stop an agent, "ask Codex directly". No progress API is documented.
  - AC-7 host facts, unverified:
    - Codex `wait_agent(timeout_ms)` semantics (third-party sources only).
    - openai/codex#24951 (open): `wait_agent` overran by about 7.5 h.
    - Whether a Codex rollout file can serve as a progress signal.
    - The Codex shell-tool timeout parameter.
  - Proposed stall signal:
    - Claude: progress = the transcript's size or mtime advanced. A stall = no advance while no open tool call is still inside its own timeout, with an elapsed-vs-budget backstop.
    - Claude wake-up: a `Monitor` script that emits only on a stall, re-armed at each deadline. Fallback: `CronCreate */5`. Otherwise: check at completion notifications only, and record the degraded mode once.
    - Claude stop: `TaskStop`, then the existing recovery path.
    - Codex: `wait_agent(timeout_ms ≤ 300000)` for the cadence, stalled = elapsed beyond budget, stop via `close_agent`. Best-effort only (#24951).
- Migration gaps:
  - AC-1…AC-5 need no `.asd/migrations/<version>.js`. The rules keep reading the legacy shapes, and the CHANGELOG migration note plus the `/asd-update` delivery of `t_AGENTS.md` suffice.
  - A migration, or an `/asd-init` diff-mode step, is needed only for AC-11's new `.gitignore` entry. The allowed migration scope covers config keys, not `.gitignore`.

## Risks
- Closure refused, or approved with no following sprint: impact = base shows a merged-unclosed sprint indefinitely and no self-hosting tag until the next scope. mitigation = detection is idempotent, the hook reports it every session, and CHANGELOG documents it. A closure-only branch would reintroduce the second CI run.
- No next sprint ever started (a project's last sprint): impact = never archived on base. mitigation = accept and document it; the user may still archive by hand.
- Offline detection misfires on a branch derived from an unmerged sprint: impact = a false report. mitigation = the hook only reports, and `asd-sprint` confirms via `gh pr view` before asking.
- Tag lands at the wrong commit or version: mitigation = tag `pr.mergeCommit`, read the version from that commit, check whether the tag exists first.
- An in-flight legacy companion PR during the upgrade: impact = a double archive move. mitigation = detect `chore/finalize-sprint-<slug>` first.
- AC-7 false stalls (Contradiction 6): impact = a healthy External Review or a long test run is stopped and re-dispatched, doubling its cost. mitigation = exempt an in-flight tool call inside its timeout.
- AC-7 check cost: impact = tokens per wake-up across long waves. mitigation = a `Monitor` script that emits only on a stall.
- AC-10 on Codex (Contradiction 5): a security regression if reviewers become writable.
- Sync moves to the orchestrator (AC-11): the impl step 9 authorised-paths gate would fail regenerated views. mitigation = admit orchestrator sync outputs in the same Task.
- The retry-after clamp breaks `tests/run.js` L2438. mitigation = change the test with the runtime, fail-first.
- Surface and cohesion: three independent strands, and about 15 files touched by 3+ ACs each (`sprint-lifecycle.md` alone by AC-1…5, 7, 8, 9, 11). impact = large single Tasks under AC-8's own rules, and likely 2-3 review waves. mitigation = one Task each for `sprint-lifecycle.md`, `review-policy.md`, `providers.md`, README, `asd-phase-impl.md` and `asd-phase-impl-review.md`.
- Tests pin literal prose: impact = rewording breaks tests. mitigation = AC-13; test edits route to impl-test.
- Stale memory restating superseded flows (asd-pm, asd-dev-critical sync notes, asd-external-review invocation): mitigation = listed as restating sites; the ownerless asd-pm files are deleted.
- Change surface: about 48-58 paths inside the impl-review pathspec, under `SURFACE_CAP_FILES` = 100. Generated views add about 20-25 more, outside the pathspec.
