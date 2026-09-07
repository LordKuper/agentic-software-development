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
