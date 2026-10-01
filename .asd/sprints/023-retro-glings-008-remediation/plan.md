---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

<!--
Format rules (parser-critical):
- Overview, Definition of Done — prose only, NO checkboxes
- Checkboxes (- [ ]/- [x]) appear ONLY inside `### Task N:` sections
- Every task carries a `Material risk:` line, plain text, never a checkbox (see sprint-lifecycle.md "Plan file format")
- Overview carries one required `Change surface: <n> files` line; `## Dependencies` opens with the wave table
-->

## Overview
The AC source is `sprint.md` AC-1…AC-9 (lite). The inputs are `audit.md` ("Touched areas" lists every site per AC; the designs under "Gaps" are binding unless a Task notes otherwise) and its settled Contradictions (AC-2, AC-4, AC-7 amended by the user). Tasks are cut by file. A file touched by several ACs sits in one Task, and no two Tasks in a wave share a path. `tests/run.js` and the test pins named in `audit.md` "Risks" belong to `impl-test`, not to a Task. Generated views change only through the orchestrator's `sync.js --apply` after each wave.

**Fixed design decisions** (each Task implements the one it names; a dev reads the real site text before editing):
- **D1 (AC-1), wave division and turn plan.**
  - `.asd/runtime.js` gains `WAVE_THRESHOLD_FILES = Math.ceil(SURFACE_CAP_FILES / MAX_REVIEW_WAVES)` (34), `WAVE_THRESHOLD_BYTES = 300000` and `LARGE_WAVE_FILES = 20`, all exported.
  - `reviewWaveCount(lines, files, bytes = 0)` = `min(MAX_REVIEW_WAVES, max(1, files), max(1, ceil(lines/L), ceil(files/F), ceil(bytes/B)))`. Two-argument callers stay valid; `MAX_REVIEW_WAVES` stays 3.
  - `review-waves` measures bytes with one `git --literal-pathspecs diff -M --no-color <range> -- <scope>` (`Buffer.byteLength`), reports `{lines, files, bytes, thresholds, waves}`, and `waves.json` gains the same fields. Readers keep using only `waves` and `head`.
  - The turn plan lives inside the existing `Turn budget:` header line of `providers.md` "Dispatch payload header", no new key. For a wave listing more than `LARGE_WAVE_FILES` files it adds: ledger due by turn `<maxTurns − 10>`; read the diff file in few large reads sized to the per-call token limit; batch independent reads in one turn; a short complete return beats a thorough unfinished one — "short" means shallower analysis per file, never fewer ledger rows (`review-policy.md` "Coverage ledger").
  - Internal reviewers only: the wrapped CLI is bounded by files and bytes division; Codex renders no `maxTurns`, so the plan is advisory there. `maxTurns` is not raised.
- **D2 (AC-2), Step 0.**
  - `asd-sprint` gains `### Step 0` before Step 1, after the config precondition, citing `git-strategy.md` "Branch" (sole home of the mechanics).
  - Base not checked out: `git fetch origin <base>:<base>`. Base checked out: `git fetch origin`, then `git merge --ff-only origin/<base>`. Never `--update-head-ok`. A refusal (diverged, overlapping dirty file) halts and asks the user, per "Branch". An unreachable remote warns and continues on local state.
  - One sentence in Step 0 states that the skill's own text and the session-start files are the pre-fetch copy; rules, workflows and phase skills read after Step 0 are current. `asd-phase-scope.md` step 1 keeps its own fast-forward.
- **D3 (AC-3), manifest by path.** The two prompt templates replace the `{{SCOPE_MANIFEST_JSON}}` block with a path slot `{{SCOPE_MANIFEST_PATH}}` naming `external.scope.json`, told to be read first. The wrapper writes nothing: the orchestrator's `emit-manifest` already wrote the file. Rows in `external-review.md` "OS-specific invocation" keep their `<<'EOF'` and `@'` tokens; the Codex-block `-p` string drops "provided via stdin above" and keeps `--effort xhigh`.
- **D4 (AC-4), memory rule and check.**
  - `artifact-layout.md` "Agent memory" states: memory holds method only; it never records a sprint id, a Task, a wave, an iteration or a review verdict.
  - `node .asd/runtime.js memory-check` scans the added lines of `git diff --cached -U0 --no-color -- .claude/agent-memory` plus new file names, prints a JSON array of `{path, line, token}`, exits 1 on a hit and 2 on bad input. It patterns concrete ordinals only (placeholders like `iter-NN`, `Task <N>` pass): sprint id `\b\d{3}-[a-z][a-z0-9]*(-[a-z0-9]+)+\b` and `\bsprint[ -]?\d+\b` (case-insensitive); `\bTask \d+\b`; `\bwave[- ]\d+\b`; `\biter-\d+\b` and `\biteration \d+\b`; a recorded verdict token `\[REVIEW-(design|impl)-[a-z]+\]: *(APPROVE|CONCERNS|FAIL)`. Bare verdict words are not scanned.
  - `git-strategy.md` "Commit before review" calls it where the orchestrator commits memory writes: a violating write is not committed and returns to its owner's memory-fix dispatch (`review-policy.md` "Memory-fix dispatch"). A dev's or tester's own memory commit is not gated; legacy memory text is not swept.
- **D5 (AC-5), test-only Task.**
  - One conditional plain-text line directly under the `Material risk` line(s), `Test-only: <test paths or globs>`, defined once in `sprint-lifecycle.md` "Plan file format" and cited elsewhere.
  - `impl` dispatches that Task to `asd-tester` (`asd-tester-<tier>` through `route-task`), never a dev. It touches only test files, never `test-plan.md`; the no-overlap-in-a-wave rule covers its paths. It sits in a wave after every Task whose code it covers.
  - It adapts existing tests to the code change and adds a test only where `code-style.md` §17 qualifies one. Its commits carry `ASD-Task: Task N`.
  - `impl-test` entry 1 treats those commits as existing tests in the change surface and does not re-author them; it still owns strategy, pruning and the suite gate. The "impl writes no tests" sentences gain this one carve-out, each citing the single home.
- **D6 (AC-6), bounded proof.** `code-style.md` §17 states that a static content-contract assert's fail-first proof is bounded to one mutation per asserted relation plus one reword control (the same relation reworded must stay green), per added test; `t_test-plan.md` "Added tests" `Regression proof` cell gains `; runs: <n>`.
- **D7 (AC-7, narrowed), no matrix.**
  - Delete `providers.md` "Agent tier matrix". The home of a tier fact becomes the agent frontmatter (`claude`/`codex` blocks and `variants`) plus `release-manifest.json` `model_families`. A matrix fact with no frontmatter source (the policy-bounded reviewer sandbox, the standard-workflow "no variant, dispatches base" note, the wrapped-reviewer pairing) moves to its single prose home, never dropped. Every citation of the matrix is repointed.
  - The README model-tier table stays, the one mirror, under its existing pin test.
- **D8 (AC-8), upstream rows.** In consumer mode `retroCandidates` stops dropping the latest retro's `asd` rows, tags each `upstream: true`, still drops `covered by:` rows; self-hosting output is unchanged and the `deferred` branch keeps its filter. "Retro intake" says a row with `upstream: true` is shown inside the scope gate as an upstream proposal for the framework repo (row id, guardrail, home), no question, never an `AC-N`, written to no backlog. The empty-array sentence keeps its words (`no question`, `no backlog write`, `decisions-log`) for a list with nothing to disposition.
- **D9 (AC-9), per-delta routing.** `providers.md` "Task-class variants and routing" states: `priorTier` is the tier recorded under the same `task_routing` key, a re-dispatch of that id. An `impl-test entry N`, `review-fix <id>` or `impl-review <id> suite` id is new each time and carries no `priorTier`; its tier comes from the declared `Material risk` lines of the plan Tasks whose paths its delta touches (entry 1 and the first terminal run use every Task; none declared → standard). `routeTask` is unchanged. The sites restating the clamp cite it.

**New homes cited across parallel Tasks** (exact file and heading):
- `.asd/runtime.js` symbols `WAVE_THRESHOLD_FILES`, `WAVE_THRESHOLD_BYTES`, `LARGE_WAVE_FILES`, subcommand `memory-check` and the `upstream` field (Task 1), cited by Tasks 2, 3.
- `sprint-lifecycle.md` "Review iteration counters" (Division point, Division), "Retro intake", "Plan file format" (the `Test-only` declaration) (Task 2); `providers.md` "Dispatch payload header" and "Task-class variants and routing" (Task 2); `git-strategy.md` "Branch" and "Commit before review", `artifact-layout.md` "Agent memory", `code-style.md` §17 (Task 3). Wave 2 and 3 Tasks cite these.

Dispatch note: no Task changes the dispatch or commit contract the sprint's own remaining Tasks run under. D4 gates only the orchestrator's memory commit, D5's Task shape is unused by this plan, and D9 governs `impl-test` entries and terminal runs, not Task dispatch.

Reachability (applied to this plan): Task 4 pairs `asd-sprint` Step 0 (writes the local base ref at detection) with `asd-phase-scope.md` step 1 (branches from it). The review-wave fields Task 1 adds are read only through `waves` and `head`, so existing `waves.json` files stay valid.

Change surface: 21 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific: every site `audit.md` "Touched areas" lists for an AC is updated or recorded as unchanged; `README.md` is confirmed accurate against every edit (`AGENTS.md` hard rule); this sprint's own impl-review runs under the new division thresholds.

### Task 1: runtime.js — wave division, memory-check, upstream rows
Material risk: change: workflow gate
Reachability: `review-waves` writes `waves.json` with the added `lines/files/bytes/thresholds` fields at the division point; `wave-files` and impl-review read only `waves` and `head`; interrupted after the write, the file holds the added fields and every reader still works
- [x] AC-1 (D1): add `WAVE_THRESHOLD_FILES`, `WAVE_THRESHOLD_BYTES`, `LARGE_WAVE_FILES` (after `SURFACE_CAP_FILES` and `MAX_REVIEW_WAVES`), extend `reviewWaveCount`, measure bytes and report the new fields in `reviewWavesCommand`, extend `waves.json`, update the `review-waves` usage and the exports
- [x] AC-4 (D4): add the `memory-check` subcommand with its patterns and exit codes, dispatch it from `main()`, add it to the usage string and exports
- [x] AC-8 (D8): `retroCandidates` keeps `asd` rows outside self-hosting tagged `upstream: true`; update its doc comment

### Task 2: sprint-lifecycle.md and providers.md — division, plan shape, retro intake, routing, matrix
Material risk: change: workflow gate
- [x] AC-1 (D1): `sprint-lifecycle.md` "Review iteration counters" Division point and Division (files and bytes, cite the `runtime.js` symbols, `waves.json` fields); `providers.md` "Dispatch payload header" (the turn plan inside the `Turn budget:` line, "maxTurns is not the lever" wording kept consistent)
- [x] AC-5 (D5): `sprint-lifecycle.md` "Plan file format" (the `Test-only` declaration beside Material risk, Reachability and Settings change, Wave declaration and Decomposition rules), "Phases" (L40 and the cycle bullets), phase-table rows L131-132, "Impl phase" L244, "Impl-test phase" entry-1 handover L258-266; `providers.md` role-context row for `asd-tester` (L120)
- [x] AC-7 (D7): `providers.md` delete "Agent tier matrix", rehome any matrix fact with no frontmatter source, repoint every citation of the matrix found by repo grep (L42 and any other)
- [x] AC-8 (D8): `sprint-lifecycle.md` "Retro intake", "Retro phase" Home line, phase-table scope row
- [x] AC-9 (D9): `providers.md` "Task-class variants and routing" (L134 re-entry sentence, L140 `priorTier` sentence, the scope rule)

### Task 3: git-strategy, artifact-layout, external-review, code-style
Material risk: change: workflow gate
- [x] AC-2 (D2): `git-strategy.md` "Branch" states the Step 0 mechanics (two cases, refusal halts, offline warns)
- [x] AC-4 (D4): `artifact-layout.md` "Agent memory" content rule; `git-strategy.md` "Commit before review" runs `memory-check` at the orchestrator's memory commit
- [x] AC-3 (D3): `external-review.md` "OS-specific invocation" (L13, L21-23, keep the `<<'EOF'` and `@'` tokens), "Phase-scoped payload" (L53, L65): the manifest by path, the wrapper writes nothing
- [x] AC-5 (D5): `code-style.md` §17 L113 the test-only carve-out sentence
- [x] AC-6 (D6): `code-style.md` §17 the bounded-proof sentence at the content-contract bullet

### Task 4: workflows and skills
Material risk: change: workflow gate
Reachability: `asd-sprint` Step 0 writes the local base ref when `/asd-sprint` is invoked; `asd-phase-scope.md` step 1 reads the local base to create the branch; interrupted at the fetch (offline or a refusal), the local base holds its prior value and the user is told
- [x] AC-2 (D2): `.asd/skills/asd-sprint/SKILL.md` Step 0 (Preconditions L13-15, Operations L19, the pre-fetch limit sentence); `asd-phase-scope.md` step 1 cites "Branch"
- [x] AC-8 (D8): `asd-phase-scope.md` step 2a and step 4: show `upstream: true` rows as upstream proposals, no disposition
- [x] AC-1 (D1): `asd-phase-impl-review.md` step 1c (the n>1 decisions-log entry names `lines`, `files`, `bytes`)
- [x] AC-9 (D9): `asd-phase-impl-test.md` step 1a, `asd-phase-impl.md` step 5a, `asd-phase-impl-review.md` step 8 (tester test-fix) and step 9 (terminal run): cite the routing scope rule
- [x] AC-5 (D5): `asd-phase-impl.md` L16, L24, L61, L65, L76, L127, L139-140 (dispatch to "the Task's agent", the `Test-only` Task); `asd-phase-impl-test.md` L38-43, L46-48, L75-76 (entry-1 handover); `asd-phase-plan.md` L31, L38, L42, L43 (the carve-out and the `Test-only` rule); `.asd/skills/asd-phase-impl/SKILL.md` description L4

### Task 5: agents and templates
Material risk: change: workflow gate
- [x] AC-3 (D3): `asd-external-review.md` description L4, the Codex-block `wraps_invoke_args` `-p` string (keep `--effort xhigh`), L47, L58, L65, L68, L74, L76, L77, L79, L107; `t_prompt-external-impl.md` and `t_prompt-external-design.md` L12-16 and L20 (path slot)
- [x] AC-5 (D5): `asd-tester.md` description L4, Role L20, Operating contract L24-26 (a plan-declared test-only Task); `t_plan.md` format-rule line L16 and L22 plus one `Test-only:` example Task block
- [x] AC-3 (D3): `providers.md` "External review symmetry" (~L91) says "stdin-piped prompt+diff": reword to the prompt alone on stdin with the scope manifest and diff by path (added after wave 1 from Task 3's consumer search; `providers.md` is otherwise untouched in wave 2)
- [x] AC-6 (D6): `t_test-plan.md` "Added tests" `Regression proof` cell format (L45-47)

### Task 6: README.md mirror
Material risk: artifact: mirror doc
- [x] AC-5 (D5): `sprint-lifecycle.md` "Impl phase" (~L242, the wave-of-several-Tasks rule that says devs leave `plan.md` and a shared `MEMORY.md` untouched): read "devs" as the Task's agent, so a `Test-only` tester is covered (added after wave 2 from Tasks 4 and 5; `sprint-lifecycle.md` is otherwise untouched in wave 3)
- [x] Confirm and update every README site the other Tasks affect: wave division and the `review-waves` description (L190, L327), the `memory-check` and `retro-candidates` descriptions (L327), the retro intake wording (L182), test-only Tasks (L178, L188, L229), and any citation of the removed matrix; the tier table stays. Record "README confirmed accurate" for each AC in the completion signal

## Risks (optional)
- AC-3 may not fully cure the heredoc failure: the fixed prompt (about 4.3 KB) stays in the heredoc and the Bash length cliff is only a memory note; the Codex-host path read is unverified in this repo (manual live check after merge).
- `asd-external-review`'s three transport memory files describe the old transport and cite sprint ordinals. Only the owner edits them, through a memory-fix dispatch.
- Dogfooding AC-1: this sprint edits `runtime.js`, so its own impl-review divides under the new thresholds. A combined-reviewer overrun is possible; budget one retry.
- CRLF hazard on this Windows host: the tree is LF with one paragraph per line, so a CRLF write is a whole-file diff. Use the Edit tool and check `git diff --stat` is the size of the change (`code-style.md` §19).

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3 |
| 2 | Task 4, Task 5 |
| 3 | Task 6 |

- Task 4 depends on Tasks 1–3: it cites the `runtime.js` symbols, `Retro intake`, `Plan file format`, "Branch" and "Commit before review".
- Task 5 depends on Tasks 2 and 3: it cites `Plan file format` (`Test-only`), `code-style.md` §17 and `external-review.md`.
- Task 6 depends on Tasks 1–5: it mirrors every other edit.

Orchestrator-only (outside every Task):
- After each wave, once: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated-view-path...>` for the generated views of the canon that wave edited (`asd-sprint`, `asd-phase-impl`, `asd-tester`, `asd-external-review`), then `sync.js --check`.
- After wave 2's sync, before wave 3: dispatch `asd-external-review` (the memory owner) to rewrite its three transport memory files (`reference_scope-manifest-transport.md`, `reference_codex-invocation.md`, `reference_bash-tool-limits.md`) method-only for the new transport, and run `memory-check` before the orchestrator commits them.
- `impl-test` owns the `tests/run.js` repoints and new asserts (`audit.md` "Risks").

## Out of scope (optional)
- A generator for the tier tables (AC-7 narrowed) and any `sync.js` change.
- A hook-based, write-time memory block; a range mode for `memory-check`.
- A `--base/--head` memory scan for dev and tester self-commits.
- Raising `asd-reviewer-combined` `maxTurns`.
