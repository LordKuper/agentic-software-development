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
The AC source is `sprint.md` AC-1…AC-7 (lite). The inputs are `audit.md` (every site per AC under "Touched areas"; the wording proposals under "Gaps" are binding unless a Task notes otherwise) and its settled Contradictions. Tasks are cut by file. A rule doc touched by several ACs sits in one Task, and no two Tasks in a wave share a path.

**Fixed design decisions:**
- **D1 (AC-3), token.** The terminal token is `done`. `pr`'s exits are `["await-merge", "done"]`. `NEXT: done` names completion, not a write: `phase` stays `pr` on base until the next scope's closure write. That note is written once, in "PR phase".
- **D2 (AC-1), release.**
  - Merge mode: confirm the merge, then `git fetch origin <git.base_branch>`, then the self-hosting release, then `NEXT: done`.
  - Release steps, each idempotent: skip the tag when it is on `origin`, skip the release when `gh release view v<x>` succeeds.
  - The release is not a branch write.
  - Retry route: `asd-sprint` Step 1 routes a merged-unclosed self-hosting sprint whose `v<asd_version>` (read at the merge commit) is absent on `origin` back to merge mode, which runs only the release.
  - An open-mode `MERGED` hit continues in merge mode.
  - The closure write no longer tags.
- **D3 (AC-2), closure.**
  - No closure gate anywhere.
  - `asd-sprint` Step 1A is deleted. A merged-unclosed sprint (release done) goes to the new-sprint flow, carrying its path and PR number.
  - The closure write records `gate: sprint-closure`, `decision_actor: orchestrator`, `evidence: <merge_commit>`.
- **D4 (AC-7), amendment floor base.**
  - An amendment accepted after the impl-review division point records `floor_base=wave-<K>/<A>` in its `new or changed scope` `gate_decisions` evidence, where A is wave K's counter at that moment.
  - impl-review computes floor and cap for wave K on `iteration − A` (latest record; none → A = 0).
  - The same write clears wave K's `latched`, listed as a route in "APPROVE latch".
- **D5 (AC-5), plan ticking.**
  - The orchestrator ticks the wave's `plan.md` checkboxes after the wave's last signal, every wave.
  - In a wave of more than one Task, devs also leave a shared `MEMORY.md` untouched. They return their index line in COMPLETED, and the orchestrator appends it.
- **D6 (audit contradiction, user).** `asd-init` sprint-mediated mode, when it writes a pair, also carries the template's inline comment for that key. `.asd/project/config.yaml`'s stale `user_gates` comment is then refreshed by a same-value `Settings change: user_gates=adaptive` in its own wave (Task 7).

New homes cited across parallel Tasks: `sprint-lifecycle.md` "PR phase" ("Merged-unclosed", "Closure write", the D1 note), "Impl phase" (D5), "Plan file format" Reachability (AC-6), "Scope amendment" and "APPROVE latch" (D4), all in Task 1. `git-strategy.md` "Versioning & Changelog (self-hosting only)" (D2 release) and "PR creation" (AC-4 fixes), both in Task 2.

Reachability (AC-6, applied to this plan):
- D2: open mode writes and pushes `pr.number` before step 3. If a push fails, merge mode's remote check recovers it.
- The squash merge carries `pr.number` to base.
- If the session stops after the merge but before the release, base has `phase="pr"` and no `v<x>` tag, and the retry route recovers it.

Change surface: 37 files

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific: this sprint's own merge mode publishes its release under the new rule (audit risk "transition release gap").

### Task 1: sprint-lifecycle.md — all AC homes
Material risk: change: workflow gate
Reachability: pr merge mode writes the tag/release after the merge; asd-sprint Step 1 reads tag presence on origin at detection; interrupted after merge, base holds phase="pr" and no tag, and the retry route reads that
- [x] AC-1/AC-2/AC-3/AC-4 (D1–D3): "Orchestration and adaptive gates" L13, Phase table pr row, "Self-hosting" L143, "PR phase" (opening, "Merged-unclosed" with the `CLOSED`/offline outcomes and the retry route, "Closure write" minus step 5 with `decision_actor: orchestrator`, "Legacy shapes"), "State recovery"
- [x] AC-5 (D5): "Impl phase", one sentence
- [x] AC-6: "Plan file format" Reachability declaration, interruption-point clause (keep the L4113 substring)
- [x] AC-7 (D4): "Review iteration counters" L58, "Scope amendment" step 3, "APPROVE latch" route list

### Task 2: git-strategy, checkpoints, core, artifact-layout, review-policy, templates
Material risk: change: workflow gate
- [x] `git-strategy.md`: "PR creation" gets per-cause fixes, with "host unreachable, retry online" (AC-4). "Merging a PR" L66/L68 (AC-2). "Versioning & Changelog (self-hosting only)": the trigger moves to merge mode after the base fetch, with per-step idempotency (D2).
- [x] `checkpoints.md`: remove sprint closure from the hard list L7 and the inventory row L52 (AC-2).
- [x] `core.md`: L31 exemption without approval, and delete the item 4 closure exception (AC-2).
- [x] `artifact-layout.md`: L249 drops "after explicit closure approval" (AC-2).
- [x] `review-policy.md` "Iteration severity floor" L16: N minus the wave's amendment base (D4).
- [x] Templates: `t_AGENTS.md` L48 (AC-2), the `t_config.yaml` L1 inline comment (AC-2), and `t_plan.md` L18/L37 Reachability mirror (AC-6).

### Task 3: asd-sprint, asd-phase-pr, asd-phase-scope
Material risk: change: workflow gate
- [x] `asd-sprint` SKILL: Preconditions, Operations, Step 1 (merged-unclosed → Step 2A, D2 retry route, AC-4 offline and `CLOSED`), delete Step 1A, Step 2A.4, Step 3 (`NEXT: done` → halt), return contract (D1).
- [x] `asd-phase-pr.md`: open-mode `MERGED` hit → merge mode; merge mode steps 1-2 (fetch base, release per `git-strategy.md`, "write no state, archive move or commit, on any branch"); return contract `<await-merge|done|halted>`. The `asd-phase-pr` SKILL description changes to match. Keep `git mv`, `phase="done"` and `archived_at` spans out of merge mode (test L6842).
- [x] `asd-phase-scope.md` step 1: closure write for a passed merged-unclosed sprint, `decision_actor: orchestrator`, keep the `sprint-closure` name (test L6860). Delete the release bullet and Artefacts L25.

### Task 4: runtime, workflow definitions, hook
Material risk: change: public contract
- [x] `runtime.js` `CHAIN_EXITS = ['await-merge', 'done']` and its comment; `standard.json`/`lite.json` `next.pr` (D1).
- [x] `session-start.js` L221 reports `done` for merged-unclosed (D1). Exit 0, never throw.

### Task 5: impl and impl-review workflows, asd-init
Material risk: change: workflow gate
- [x] `asd-phase-impl.md`: drop step 6 L82's dev tick; step 7 has the orchestrator tick after the wave's last signal, plus the D5 index lines; step 8 L94 and Artefacts L130 change to match (AC-5).
- [x] `asd-phase-impl-review.md` step 3: floor and cap on `iteration − A` per D4, citing the home (AC-7).
- [x] `asd-init` SKILL sprint-mediated workflow: a written pair's line carries the template's inline comment for that key (D6).

### Task 6: README
Material risk: artifact: documentation mirror
- [x] README L192 (pr row, `done`), L269 (drop the closure sentence), L276, L346, L449 FAQ; confirm the rest is accurate.

### Task 7: refresh project config comment
Material risk: artifact: project config comment
Settings change: user_gates=adaptive
- [x] Applied by the orchestrator through `asd-init` sprint-mediated mode as wave 3 opens (value unchanged; the line takes the template's new comment, D6).

### Task 8: opus/haiku → sonnet tiers (AC-8, scope amendment)
Material risk: change: public contract
- [x] `.asd/agents/asd-ba.md`, `asd-ux.md`: `claude.model` sonnet, `effort` high
- [x] `.asd/agents/asd-architect.md`, `asd-reviewer-{correctness,efficiency,testing,documentation,combined}.md`: sonnet / xhigh
- [x] `.asd/agents/asd-dev.md`, `asd-tester.md` variants: mechanical `{"model":"sonnet","effort":"low"}`, critical `{"model":"sonnet","effort":"xhigh"}`; Codex sides unchanged
- [x] `.asd/rules/providers.md` "Agent tier matrix" rows and the "Task-class variants and routing" variants sentence; README model-tier table (both-provider columns); `model_families` untouched

### Task 9: revert mechanical to haiku; Codex-host wrapped Claude sonnet/xhigh (AC-9, scope amendment)
Material risk: change: public contract
- [x] `.asd/agents/asd-dev.md`, `asd-tester.md`: `mechanical.claude` back to `{"model": "haiku"}` (no effort)
- [x] `.asd/agents/asd-external-review.md`: `codex.wraps_model` "sonnet"; `codex.wraps_invoke_args` `--effort xhigh`
- [x] `.asd/rules/providers.md` "Agent tier matrix" (variants row, wrapped-reviewer row) and variants sentence; README mirrors

### Task 10: sol resolves to gpt-6.1-sol (AC-10, scope amendment)
Material risk: change: public contract
- [ ] `.asd/release-manifest.json` `model_families.codex.sol`: `gpt-6-sol` → `gpt-6.1-sol`; no other key changes (the hash ledgers are recomputed by the orchestrator's `sync.js --apply`)
- [ ] `.asd/rules/providers.md` model-family table row `sol`; README line naming `sol` → the concrete ID (keep the `luna` ID and the unsuffixed-ID warning); leave a search-derived sweep of `gpt-6-sol` in non-archived, non-generated docs clean
- Tests pinning `gpt-6-sol` in `tests/run.js` are updated by the tester in impl-test entry 4, not by the dev.

## Orchestrator lines (not dev Tasks)
- After each wave: tick the wave's checkboxes (D5); `sync.js --apply` on changed views, or `--apply AGENTS.md`; `--check`; commit.
- At pr open mode: `asd_version` bump plus CHANGELOG, with a migration note (`await-closure` removed, closure gate gone, stale shipped `user_gates` comment in existing configs, self-hosting forks release at merge).

## Risks
- Transition release gap: this sprint must release in its own merge mode (DoD addition).
- Test pins L6842/L6860 are kept by wording choice; the L6964-6965 sweep entries and L6830 are removed or reworded in impl-test.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | 1, 2, 3, 4, 5 |
| 2 | 6 |
| 3 | 7 |
| 4 | 8 |
| 5 | 9 |
| 6 | 10 |

- Task 6 mirrors wave 1. Task 7 needs Task 2's `t_config.yaml` comment and Task 5's `asd-init` change, synced.
