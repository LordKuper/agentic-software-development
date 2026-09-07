---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-06 — Scope accepted

- **Decision**: User accepted sprint.md (AC-1 through AC-23) and requested continuation. PM removal is unconditional; task-class agent variants and adaptive gates are approved, with explicit user approval required for sprint finalization and archival.
- **Rationale**: Explicit user message: «Принимаю. Идем дальше.» following the final gate-policy revision. Audit remains enabled; PRD, UX-spec, ADR and C4 are disabled.
- **Affected docs**: sprint.md, state.json

## 2026-09-06 — Batch rejected

- **Decision**: Do not implement Batch in this sprint; user explicitly chose «Тогда batch не делаем. Продолжай.» AC-16 feasibility decision is complete.
- **Rationale**: Official OpenAI and Anthropic Batch APIs advertise 50% discounts against synchronous API requests, with asynchronous processing up to 24 hours and possible expiry. This repository has no Batch transport; adapting CLI-driven interactive phases would require submission, recovery and stale-snapshot handling. Rejecting Batch avoids that integration and latency, forgoing its eligible API-request discount. No Batch requests were submitted.
- **Affected docs**: sprint.md (AC-16); sources checked 2026-09-06: https://developers.openai.com/api/docs/guides/batch ; https://platform.claude.com/docs/en/build-with-claude/batch-processing

## 2026-09-06 — audit.md adaptive acceptance

- **Decision**: decision_actor=orchestrator; accepted audit.md, sha256=efd83df76b979ae79e242dd97bab32232d7319577958e3764d2fa8ae47a9b4ab.
- **Rationale**: Explicitly adopted AC-18..AC-23 permits routine audit/plan progression after scope acceptance. Artifact preserves AC-1..AC-23, rejected Batch decision, provider restrictions and closure approval. No new product direction, subsystem, debt waiver or scope expansion; no open stubs. Source inspection and AC mapping are recorded in the artifacts; implementation quality checks remain pending and are not claimed passed.
- **Affected docs**: audit.md, state.json

## 2026-09-06 — plan.md adaptive acceptance

- **Decision**: decision_actor=orchestrator; accepted plan.md, sha256=d258a2f5f57bd76347f5a905d4ef57154d3fa76ad610c9221dce72f60a63f06f.
- **Rationale**: Explicitly adopted AC-18..AC-23 permits routine audit/plan progression after scope acceptance. Artifact preserves AC-1..AC-23, rejected Batch decision, provider restrictions and closure approval. No new product direction, subsystem, debt waiver or scope expansion; no open stubs. Source inspection and AC mapping are recorded in the artifacts; implementation quality checks remain pending and are not claimed passed.
- **Affected docs**: plan.md, state.json

- 2026-09-06 — design/design-review/design-promote skipped (no design documents enabled).

## 2026-09-07 — Resume implementation

- **Decision**: Continue accepted scope from partial canonical edits; no task is yet marked complete. Batch remains rejected.
- **Rationale**: User requested continuation after delegated agents hit usage limits. Bootstrap delegates use the installed asd-dev configuration (Terra/high); new critical variants are not available to the current host registry yet. Plan wording now records this limitation instead of claiming critical-model execution. Strong independent review remains required; no unavailable-agent result counts as review.
- **Affected docs**: plan.md, state.json

## 2026-09-07 — Implementation handed to testing

- **Decision**: decision_actor=orchestrator; implementation tasks complete, adaptive assessment advances to impl-test. Independent testing/review remain outstanding.
- **Rationale**: Canonical edits integrated; 58 generated targets applied, including PM orphan removal. Sync check and diff check exited 0; hook runs clean; canonical JSON and config YAML parse (delta template validated after placeholder substitution). Self-sourced AGENTS.md remains the existing documented modified-foreign exemption, not generated drift.
- **Affected docs**: plan.md, state.json, canonical/provider changes

## 2026-09-07 — Impl-test green; independent review

- Impacted fallback passed 118/118; reviewed implementation HEAD 11333cb2330d689f14de1d116b30236888e09b20. Advance to impl-review iteration 1, floor low. Four internal reviewers required.
- External local preflight: authentication-unavailable; model access unknown; no paid request. Iteration skip does not latch or prove review.

## 2026-09-07 — Impl-review iteration 1: verdicts and routing

- **Verdicts** (floor `low`, HEAD 11333cb): correctness CONCERNS:15 · efficiency FAIL:6 · testing FAIL:7 · documentation CONCERNS:12 · external `APPROVE (skipped: quota)`. No reviewer APPROVE, so no latch was written. External Review's Codex CLI hit its usage limit on the full-diff attempt and on a minimal retry; recorded via `runtime.js external-record-failure` (status `quota`, fingerprint `7fdbd8c9…464213`). Availability skip never latches.
- **Ledgers**: all four internal coverage ledgers validated by `node .asd/runtime.js validate-ledger` → `{"ok":true}`, 59 scoped files each, manifests and finding arrays persisted beside each report.
- **Routing**: unresolved findings → `review_fixes_pending = "iter-01"`, phase set to `impl` (review-fix mode). No fix is applied inside impl-review.

## 2026-09-07 — Escalation 1 resolved: `.asd/runtime.js` stays one file

- **Decision**: decision_actor=user; SC-1 (god/sprawling module, efficiency F1, critical/undroppable) is overridden — `.asd/runtime.js` keeps its three responsibility clusters in one file. No split into `.asd/runtime/{preflight,routing,coverage}.js`.
- **Rationale**: the three clusters share no mutable state (only `fail()` and `fingerprint()/stable()` utilities), so the split reduces no coupling. Cost is disproportionate: widening the `sprint-lifecycle.md` "Self-hosting" allowlist from a file to a directory plus matching edits to `release-manifest.json` (`managed_paths`, `upstream_hashes`), `core.md`, `AGENTS.md`, `README.md` and the `require` paths in `tests/run.js`. Matches the reviewer's own recommendation and the repo's existing convention (`sync.js`, `update.js` are comparable monoliths). Revisit when a fourth command or genuine cross-cluster coupling appears.
- **Affected docs**: reviews/impl/iter-01/efficiency.md (F1 marked resolved by override), state.json

## 2026-09-07 — Escalation 2 resolved: drop the self-sourced carve-out for AGENTS.md

- **Decision**: decision_actor=user; the special-case handling of `AGENTS.md` under `self_hosting: enabled` is removed rather than completed. Its managed block must exist and synchronize from `t_AGENTS.md` exactly as in any consumer project — ASD is simultaneously a consumer project in which the framework itself is developed.
- **Consequence to implement**: the managed block currently spans the whole file (markers on lines 1 and 59), so this repo's framework-dev prose moves **below** `<!-- asd:end -->`, where sync never reaches it. `t_AGENTS.md` carries no placeholders and is read raw, so the block applies to this repo unchanged.
- **Scope of the change**: delete `isSelfSourcedAgentsMd`, `statusSelfSourcedManagedBlock`, the `selfSourced` plan branch (`sync.js:1293-1299`), the `runApply` short-circuit (`sync.js:1491-1498`) and the export; re-render the block from `t_AGENTS.md` and re-baseline `.asd/sync-state.json`; update the `providers.md` ownership-table row for `AGENTS.md` (no longer "read directly; no generation") and the paragraph in `AGENTS.md` describing itself as self-sourced; restore the unconditional drift assertion at `tests/run.js:1066` and delete the now-false in-body comment; check `README.md` mirrors. Note for the implementer: `isSelfSourcedAgentsMd` also covered `!isInitializedConsumerProject(repoRoot)` — verify removing that branch does not change `asd-init` bootstrap behaviour on a repo with no config yet.
- **Rationale**: the carve-out disabled generation but kept digest tracking, with no command able to re-baseline a hand-edited block — so the invariant `AGENTS.md` documents for itself ("MUST still be re-baselined after each hand-edit") was unreachable, `--check` was permanently red, and the drift signal was worthless. Narrowing the test assertion (correctness F1 / testing F1 / documentation F9) papered over that. Removing the carve-out restores one uniform ownership model instead of completing a second one.
- **Affected docs**: reviews/impl/iter-01/{correctness,testing,documentation}.md, state.json, and on implementation: `.asd/sync.js`, `AGENTS.md`, `.asd/sync-state.json`, `.asd/rules/providers.md`, `tests/run.js`, `README.md`

## 2026-09-07 — Three additional user-directed changes, added to the iter-01 fix set

decision_actor=user. These are not reviewer findings; they are directed changes that `impl` (review-fix mode) implements alongside `reviews/impl/iter-01/`.

### A. Audit `AGENTS.md` for duplication and contradiction after the managed block lands

Follows the escalation-2 decision above (managed block generated from `t_AGENTS.md`, framework-dev prose below `<!-- asd:end -->`). Once both halves sit in one file they can restate or contradict each other — the block is consumer-facing prose written for "a project built with ASD", the tail describes this repo.

- Read the merged file as one document. Every fact the block already states is removed from the tail, or kept only as an explicit delta ("in this repo, X instead").
- Named risk points to check, not an exhaustive list: the "read `core.md` first" instruction, language policy, the slash-command/skill table, and above all the infrastructure-read-only rule — the block states `.asd/rules/`, `.asd/templates/`, `.claude/`, `.codex/`, `.agents/skills/` are read-only, while the tail states that in self-hosting mode this lifts for the canonical paths. That is a direct contradiction unless the tail is worded as an explicit override of the block.
- Applies `.asd/rules/code-style.md`'s SSoT rule and this repo's token-minimisation rule: one home per fact, link instead of restating.

### B. impl-review requires a clean worktree at entry

New precondition: `impl-review` refuses to start while `git status --porcelain` is non-empty — every change must be committed first.

- **Why**: the iteration diff is computed from commits (`git diff <base>...HEAD`, or since the previous `iteration_heads` sha). Uncommitted work is invisible to every reviewer, so a review can pass over code nobody read. Iteration 1 demonstrated it — the testing reviewer noted that `test-plan.md`'s recorded suite-run HEAD `d046e01` was stamped with an uncommitted worktree present.
- **Where**: add the precondition to `.asd/workflows/asd-phase-impl-review.md` "Preconditions" (violation → `FAILED`, naming the dirty paths), and one line to `.asd/rules/sprint-lifecycle.md`'s impl-review contract (line ~22 / phase table row) as the SSoT statement. `.asd/rules/git-strategy.md` gets the commit-before-review obligation on the `impl` side if it is not already implied there.
- **Scope of "clean"**: measured at phase entry, before any dispatch. The phase's own subsequent writes (review files, `state.json`, `decisions-log.md`, `test-plan.md`) are produced after the gate and are not subject to it. Decide and document whether the pre-existing sprint bookkeeping files count — recommendation: yes, they must be committed too, since a half-written `state.json` is exactly the kind of drift this gate exists to catch.
- Consider the same precondition for `design-review`; apply it only if it holds there without further change.

### C. External Review receives a structured scope file, not a diff payload

The external reviewer has direct read access to the repository and fetches its own content. Stop shipping it a rendered diff; hand it a machine-readable scope manifest and let it read the files or commits itself.

- **Format**: a new template `.asd/templates/external-review/t_review-scope.json` (t_ prefix, templates dir, per this repo's conventions). Carries at minimum: `phase`, `iteration`, `base_ref`, `head_ref`, `mode` (`files` | `commits`), and the corresponding `files[]` or `commits[]` array. The reviewer resolves content from the repo, never from the payload.
- **Iteration semantics**: iteration 1 passes the complete set of changed files (or commits) since the start of the sprint; iteration 2+ passes only the delta since the previous iteration's recorded head (`state.json.reviews.<phase>.iteration_heads["iter-(NN-1)"]`). This mirrors the existing incremental rule; only the transport changes.
- **Where**: rewrite `.asd/rules/external-review.md` "Phase-scoped payload" and "Iteration-aware diff" around the scope file (that rule doc stays the SSoT); update `.asd/agents/asd-external-review.md` inputs and behaviour (it prepares/consumes the scope file rather than assembling a diff); update the payload steps in `.asd/workflows/asd-phase-impl-review.md` and `.asd/workflows/asd-phase-design-review.md`; adjust `t_prompt-external-impl.md` and `t_prompt-external-design.md`, which currently frame a piped diff; check the `README.md` external-review description.
- **Supporting evidence from iteration 1**: the full-diff payload for this sprint was 59 files / ~3.5k diff lines piped into `codex exec` on stdin, and both that attempt and a `--stat`-only retry died on the Codex usage limit. A file/commit list costs a fraction of the tokens and lets the reviewer pull only what it decides to read.

## 2026-09-07 — Directive D: impl-test may commit to git

decision_actor=user. Added to the iter-01 fix set after directive B landed; implemented as task T6 (T3 held the affected rule files when the directive arrived, and inter-agent messaging is unavailable this session).

- **Rule**: `impl-test` commits its own work — authored/pruned tests and `<sprint>/test-plan.md` — before signalling COMPLETED, under the unchanged commit conventions (Conventional Commits, one logical change per commit).
- **Why it is required, not optional**: directive B put a clean-worktree precondition on `impl-review` entry, and `impl-test` runs immediately before it. `impl-test` always writes tests and rewrites `test-plan.md`, so without commit rights the next phase blocks on a dirty tree every cycle. The two rules only compose if `impl-test` commits its own output.
- **Where**: `.asd/rules/sprint-lifecycle.md` impl-test contract (home statement, placed beside the impl-review clean-worktree rule); `.asd/rules/git-strategy.md` (extend the commit obligation from `impl` to `impl-test`); `.asd/workflows/asd-phase-impl-test.md` (tester dispatch instruction + no COMPLETED with a dirty worktree); `.asd/agents/asd-tester.md` (verify its operating contract does not imply the tester never commits).
- Dedupe to one home with links per the repo's token rule; do not restate the rationale in four places.

## 2026-09-07 — Impl fix for iter-01: findings resolved

- **Dispatch**: six tasks across three waves, partitioned by exclusive file ownership because `providers.md`, `README.md`, `sync.js`, `tests/run.js` and both review workflows were each wanted by several findings. `route-task` raised T1 to `critical` on the recorded risk "sync ownership-model change affects every consumer's AGENTS.md"; T2/T3/T4/T6 ran `standard`, T5 was the tester. Records in `state.json.task_routing`.
- **Resolved**: all 40 findings from `reviews/impl/iter-01/` — correctness F1-F15, efficiency F2-F6 (F1 resolved by user override, not fixed), testing F1-F7, documentation F1-F12 — plus user directives A (AGENTS.md duplication audit), B (clean worktree at impl-review entry), C (External Review scope manifest) and D (impl-test commits its own output).
- **Two reviewer suggestions corrected during implementation**, both verified rather than taken on trust: correctness F1's proposed `sync.js --apply AGENTS.md` could not work (`runApply` short-circuited self-sourced targets), and the deleted predicate's uninitialized-repo half turned out to be a live bug rather than a behaviour to preserve — with the carve-out gone, `--apply AGENTS.md` now creates the file for a fresh consumer, which `asd-init` step 0a always assumed but could never achieve. A second latent bug closed with it: a missing `t_AGENTS.md` used to throw `ENOENT` from `runCheck`; the target now simply drops out of the plan.
- **Two deliberate narrowings, both recorded with reasons**: `mode: "commits"` stays a reserved value in `t_review-scope.json` because the Claude-wrapped CLI has no git access, so only `mode: "files"` is wired; and the clean-worktree precondition applies to `impl-review` only — `design-review` builds its manifest from on-disk drafts, so the git-invisibility blind spot does not exist there.
- **documentation F7 decision**: the "and reason" requirement for the frozen audit value was dropped rather than given a `t_state.json` field — normalization is deterministic, so the reason string carries no information and the field would ripple into every `documents.audit` consumer.
- **Gate**: `node .asd/sync.js --check` exit 0, 70 generated targets `current`; `node tests/run.js` 127/127 green. This repo has no build/lint command — these two are the verification surface. 20 commits, Conventional Commits.
- **Suite state**: the tester replaced the two obsolete carve-out tests, restored the unfiltered drift assertion (testing F1), and added nine tests plus three assertions covering the closure-gate branch, negative-cache identity recovery, persisted-entry shape, ledger anti-forgery, and the previously untested `runtime.js` CLI contract. D-2's three sub-defects now carry recorded equivalent targeted mutations, each verified by reverting the production line and observing the expected test fail.
- **One open stub** registered: the AC-4 Windows `.cmd` preflight check remains platform-bound and now prints an explicit skip off-Windows instead of passing silently.
- **Agent memory corrected**: `asd-dev`'s `project_agents-md-sync-state-drift` memory described the removed carve-out as current fact and prescribed hand-patching `sync-state.json`; rewritten to the new model. The orphaned `asd-dev-standard` memory directory was merged into `asd-dev` after the `standard` variant was dropped.
- **Routing**: `review_fixes_pending` cleared; phase exits to `impl-test`.

## 2026-09-07 — impl-test entry 3: impacted set green (127/127), 0 added / 0 removed

- **Delta since entry 2** (`55292d1...e8dea42`) carries no production source — only `tests/run.js` from entry 2's own authoring, sprint bookkeeping, and agent-memory corrections. No new material risk, so the strategy and prune passes had nothing to analyse; the suite gate still re-ran, per the phase's every-entry rule.
- **Routing**: `node .asd/runtime.js route-task` returned `tier: mechanical`, `execution: command`, `reason: deterministic-command`, so the entry ran directly with no `asd-tester` dispatch. First use of the cost-routing path this sprint added, on a case that genuinely qualifies: the "no new risk" conclusion follows from an objective input (the delta file list), leaving only a deterministic run-and-record.
- **Result**: `node tests/run.js` 127/127 at `e8dea4225fcf97efbd8e95de8ea87b7e9ab23853`; `node .asd/sync.js --check` exit 0. `test_defects_pending` stays null.
- Routes to `impl-review` iteration 2, where the severity floor rises to `medium`.

## 2026-09-07 — Impl-review iteration 2: verdicts and routing

- **Verdicts** (floor `medium`, HEAD `60a991a`, incremental scope of 32 paths since `11333cb`): correctness CONCERNS:6 · efficiency CONCERNS:4 · testing CONCERNS:4 · documentation CONCERNS:8 · external `APPROVE (skipped: quota)`. No FAIL, so no escalation gate fired; no APPROVE either, so no latch was written.
- **Ledgers**: all four validated by `runtime.js validate-ledger` → `{"ok":true}`, 32 scoped files each.
- **External Review skipped a second time** on the same Codex account limit. The scope-manifest transport is therefore still unvalidated end-to-end: the request died at the provider's quota gate before reading a single `files[]` path. Its invoking-side cost did drop sharply (~3.8 KB prompt + manifest versus a 3.5k-line piped diff), but whether `files[]` without a diff is sufficient for a good external review remains unproven.
- **Character of the findings shifted**: iteration 1 found defects in the original implementation; iteration 2 finds debris left by iteration 1's own deletions (dead `isSelfHostingRepo`, unreachable `renderFullFileItem` fallback, vestigial `runLocal` return fields) plus inconsistencies the six parallel tasks introduced relative to each other. Expected for a wave of this size, and the reason the review loop exists.
- **Routing**: `review_fixes_pending = "iter-02"`, phase `impl` (review-fix mode). Iteration 3's floor will be `high`.

## 2026-09-07 — Decision: `execution` is AC-11's selector of record

- **Decision**: decision_actor=user; the `selector` field stays removed from `routeTask`. AC-11's "selector" evidence requirement is satisfied by the persisted `{execution, tier, reason, resolved_model}` record.
- **Rationale**: AC-11 wants a resumable trace of how the executor was chosen. `execution` (`command` vs `agent`) plus `tier` and `reason` determine that completely, while the removed field only ever held the constant `"orchestrator"` and so carried no information per record — in a repo whose hard rule is to minimise runtime tokens. Raised by correctness F5, which correctly refused to let an explicitly named AC element be narrowed silently.
- **Implementation**: one clause in `providers.md` "Task-class variants and routing" naming `execution` as the selector of record. No code change.

## 2026-09-07 — Decision: drop `mode`/`commits[]` from the scope manifest

- **Decision**: decision_actor=orchestrator; efficiency F3 is accepted and it **supersedes** this sprint's earlier narrowing ("`mode: "commits"` stays a reserved value"), recorded 2026-09-07 under the impl fix entry.
- **Rationale**: the earlier note explained why only `files` is *wired*; it never justified shipping the unused branch. A two-valued enum with one producer, plus an array no caller populates and a field-list rule that exists only to describe the empty branch, is exactly the premature-config-flag pattern `review-policy.md` makes critical and undroppable. Reintroduce a discriminator when a second producer actually exists. No user gate: this is deletion, not a new abstraction or a scope change.
- **Affected**: `t_review-scope.json`, `external-review.md` field list and its `mode: "commits"` paragraph, both review workflows' manifest steps, `asd-external-review.md` prose.

## 2026-09-07 — Orchestrator finding: the preflight cache path is undefined

Recorded by the phase orchestrator because no reviewer can see it — `.asd/project/**` is excluded from every review scope by design, so this gap is structurally invisible to the fan-out.

- **Defect**: `cachePath` for the external-review negative cache appears **nowhere** in canon — not in `external-review.md`, not in `asd-external-review.md`, not in `runtime.js`'s own docs. Only `tests/run.js` exercises it, against a throwaway temp path. Each caller therefore invents a location: this phase used `.asd/project/.external-cache.json` in iteration 1, the External Review agent used `.asd/project/external-cache.json` in iteration 2. A negative cache keyed by fingerprint is worthless if writers and readers disagree on where it lives — the iteration-1 quota entry could never have suppressed an iteration-2 probe.
- **Second defect**: the machine-local cache — retry windows and failure statuses for one developer's account — would be committed and shipped to every other machine and consumer.
- **Fix**: name the canonical path once in `external-review.md` (SSoT) and reference it from the agent and both review workflows; add a `.gitignore` entry for it.
- **Correction to this entry**: it originally claimed the repo had no `.gitignore` at all. That was the orchestrator's own error — inferred from a grep for "cache" that found nothing in a file which does exist. The `.gitignore` was extended, not created. Flagged independently by the External Review agent in its iteration-2 report.

## 2026-09-07 — Impl fix for iter-02: findings resolved

- **Dispatch**: six tasks. W1/W2/W3 ran in parallel on disjoint file sets (code dead-weight · external-review contract · dispatch mapping and mirrors), then W4 (tests), then W5+W6 as a pair to close a testability gap the tester surfaced rather than papered over.
- **Resolved**: all 22 findings from `reviews/impl/iter-02/` — correctness F1-F6, efficiency F1-F4, testing F1-F4, documentation F1-F8 — plus the orchestrator's cache-path finding and the two recorded decisions (`execution` as AC-11's selector of record; `mode`/`commits[]` dropped from the scope manifest).
- **The open stub is gone, and not by waiver.** testing F4 offered two routes: accept the platform-bound check as debt (a user hard gate) or make it host-independent. W5 extracted `buildInvocation(platform, command, args, viaPowerShell)` from `runLocal` — a pure seam, no behaviour change — and W6 then asserted all four shapes on any host, including the `ENOENT`-retry branch that was previously unreachable off Windows and was the stub's whole reason for existing. Stub row and its paired in-code marker were removed together; no `(accepted-debt)` prefix was needed, so the pr-phase stub gate is clear.
- **Fail-first discipline held**: W4 and W6 proved every added assertion by mutating production, observing the expected failure, and reverting, with a clean worktree verified after each revert. Four such mutations back the D-2 security property alone.
- **W2 corrected the brief it was given**: the repo already had a `.gitignore`; it was extended, not created. The orchestrator's contrary claim came from a grep that searched the file for the wrong word, and the earlier decisions-log entry has been corrected.
- **Design choice worth recording** (documentation F6): rather than inventing `base_ref`/`head_ref` for design-review manifests, the "every manifest" claim was scoped to impl-review. Design-review scopes by on-disk draft snapshot, not a commit range, so there is no ref to name — the alternative would have been two empty fields carried for symmetry alone.
- **Gate**: `node .asd/sync.js --check` exit 0; `node tests/run.js` 126/126; worktree clean; no open stubs. 19 commits.
- **Routing**: `review_fixes_pending` cleared; phase exits to `impl-test`.

## 2026-09-07 — impl-test entry 6: impacted set green (126/126), 0 added / 0 removed

- Delta since entry 5 (`b8b801b...d646c50`) carries no production source — only `tests/run.js` from entry 5's own authoring and sprint bookkeeping. Routed `tier: mechanical`, `execution: command` (`deterministic-command`), so the entry ran with no `asd-tester` dispatch — the second time this sprint's cost routing has avoided an agent on a case that genuinely qualifies.
- `node tests/run.js` 126/126 at `d646c5009052cea39a490fffa6c74e9cb3295a57`; `node .asd/sync.js --check` exit 0. `test_defects_pending` null.
- Routes to `impl-review` iteration 3, floor `high`.
