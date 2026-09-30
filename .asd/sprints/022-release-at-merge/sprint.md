---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 022-release-at-merge

## Goal
Publish the release as soon as the sprint PR merges, and turn sprint closure into mechanical cleanup. A merged PR completes the sprint. The next sprint's scope archives it without asking, and no hard closure gate remains.

## Acceptance
- AC-1: In self-hosting mode, `pr` merge mode publishes the release right after it confirms the merge: annotated tag `v<asd_version>` on the sprint PR's merge commit, pushed, then `gh release create` with the CHANGELOG section. It is idempotent (skipped when the tag exists on `origin`). The closure write no longer tags or releases. `git-strategy.md` "Versioning & Changelog (self-hosting only)", `sprint-lifecycle.md` "PR phase"/"Self-hosting" and `asd-phase-pr.md` state it once and consistently.
- AC-2: The hard `sprint closure` gate is removed. The PR merge completes the sprint; no closure approval is requested at merge, at `/asd-sprint` detection, or at scope. A merged-unclosed sprint is archived mechanically by the next sprint's scope closure write: folder move, terminal state, a `gate_decisions` record with `decision_actor: orchestrator`, committed as the new branch's first commit. It never blocks the one-active-sprint rule. `checkpoints.md` (hard list, inventory), `core.md` (Context-hygiene closure-approval exception, one-active invariant), `t_AGENTS.md`, `asd-sprint` (Step 1A) and `asd-phase-scope.md` are updated accordingly.
- AC-3: Merge mode ends the sprint's chain. The `pr` phase's `NEXT:` exits, both workflow definitions, `runtime.js` `CHAIN_EXITS`, the session-start hook's reported next step and the `asd-sprint` return contract agree on the new terminal token. Every consumer restating the old closure gate or `await-closure` is updated in the same change (README, CHANGELOG with a migration note under `backward_compat: migration`, `tests/run.js`). `node tests/run.js` is green.
- AC-4 (retro 021#A-5): A head-branch PR lookup that cannot reach `gh` outside `phase="pr"` warns and resumes the sprint instead of returning `FAILED`. `FAILED`, where it remains, names "host unreachable, retry online" for that cause. A `CLOSED` (unmerged) hit counts as no hit.
- AC-5 (retro 021#A-3): When a plan wave dispatches more than one Task, devs never edit `plan.md` or a shared memory index. The orchestrator ticks the wave's checkboxes after its last signal.
- AC-6 (retro 021#P-2): A `Reachability` line whose value crosses a push or merge also names the value each interruption point leaves on the receiving branch, before plan acceptance.
- AC-7 (retro 021#A-6): Code added by a scope amendment is reviewed at the severity floor of its own first iteration: its iteration count starts at the amendment, not at the wave's counter.
- AC-8 (scope amendment, user request): The Claude-side model tier moves from `opus`/`haiku` to `sonnet`. `asd-ba` and `asd-ux` become sonnet/`high`. `asd-architect`, all five `asd-reviewer-*` and the `critical` variants of `asd-dev`/`asd-tester` become sonnet/`xhigh`. The `mechanical` variants become sonnet/`low` (clause superseded by AC-9). The `haiku` and `opus` model families stay in `model_families` for future use. Mirrors agree: `providers.md` "Agent tier matrix" and the variants sentence, and the README model-tier table. Verified against the host docs (code.claude.com sub-agents and model-config, 2026-09-30): `effort` accepts `low|medium|high|xhigh|max`, Sonnet 5.5 supports all five, and an unsupported level falls back downward. The field needs Claude Code ≥ v2.1.242.
- AC-9 (scope amendment, user request): The `mechanical` variants of `asd-dev`/`asd-tester` keep `haiku` with no effort override, which reverts AC-8's mechanical clause. Under the Codex host, External Review wraps Claude `sonnet` with `--effort xhigh`, replacing `opus`/`high`. Mirrors agree: `providers.md` "Agent tier matrix" (the wrapped-reviewer row and the variants sentence) and README. Verified against the host docs (code.claude.com cli-reference, 2026-09-30): `--effort` accepts `low|medium|high|xhigh|max`, and `--model` takes the `sonnet` alias.

## Out of scope (optional)
- Every Codex-side tier (sol/luna).
- Changing when the archive move happens. It stays the next sprint's first commit, per sprint 021's one-PR-per-sprint design.
