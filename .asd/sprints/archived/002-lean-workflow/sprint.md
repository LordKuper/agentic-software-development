---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), docs/ (decisions), audit.md (audit)
---

# Sprint 002-lean-workflow

## Goal
Conduct a full revision of the ASD framework in its own self-hosting repository, aimed at reducing sprint duration and the volume of generated artifacts without a material loss of quality. The revision evaluates three axes and then implements the approved reductions as changes to the canonical `.asd/` sources within this same sprint.

1. **Artifact axis.** Assess the practical usefulness of every artifact the framework produces or mandates — `prd.html`, `ux-spec.html`, `adr.html`, `c4-full/`, `docs/ux/DESIGN.md`, `design-system.html`, `accessibility.html`, `sprint.md`, `plan.md`, `audit.md`, `test-plan.md`, review files, `decisions-log.md`, `manual-steps.md`, `state.json` — specifically from the standpoint of agent-driven (not human-driven) development. For each artifact decide: keep as is, compress its mandated structure, merge it into another artifact, or drop it entirely.
2. **Phase axis.** Assess the usefulness of each of the ten workflow phases (`scope`, `audit`, `design`, `design-review`, `design-promote`, `plan`, `impl`, `impl-test`, `impl-review`, `pr`). Determine whether phases can be merged, reordered, made conditional, or otherwise optimized for wall-clock and token cost, and whether the phase count itself can be reduced.
3. **Agent axis.** Assess the necessity of each of the 15 agents (7 creators, 8 reviewers). Determine whether roles can be merged or removed, and whether reviewer dispatch can be narrowed — for example, fan-out scoped by change surface rather than always-parallel.

The audit must produce concrete, individually decidable recommendations — each naming the affected canonical files, the expected saving, and the quality risk accepted. Approved recommendations are then implemented as edits to canonical `.asd/` sources in this sprint, including structural phase and agent removals, with all cross-file mirrors kept consistent (`README.md`, `.asd/rules/core.md`, `.asd/rules/sprint-lifecycle.md`, `.asd/rules/review-policy.md`, `.asd/release-manifest.json`, `.asd/hooks/session-start.js` `PHASE_CHAIN`, templates) and provider views regenerated via `.asd/sync.js --apply`.

This sprint modifies the framework that is executing it. The current sprint is played out under the rules in force at its start; canonical edits made here take effect for subsequent sprints.

## Acceptance
- AC-1: `audit.md` contains a per-artifact verdict (keep / compress / merge / drop) for every artifact listed in the Goal, each with rationale grounded in agent-driven development and an estimate of the saving.
- AC-2: `audit.md` contains a per-phase verdict for all ten phases, including any proposed merges, conditional-skip rules, or reordering, with the effect on sprint duration stated.
- AC-3: `audit.md` contains a per-agent verdict for all 15 agents, including any proposed merges or removals and the review-coverage impact.
- AC-4: Every recommendation names the exact canonical files it would change and the cross-file mirrors that must move with it.
- AC-5: The user has explicitly accepted or rejected each recommendation; accepted ones are recorded in `decisions-log.md`.
- AC-6: Accepted recommendations are implemented in canonical `.asd/` sources in this sprint, all mirrors listed in `AGENTS.md` "Cross-file consistency" are verified consistent, `node .asd/sync.js --check` is clean, and `node tests/run.js` is green.

## Out of scope
- Hand-editing generated provider views (`.claude/`, `.codex/`, `.agents/skills/`) — these are regenerated via `sync.js` only.
- Consumer-owned content (`.asd/project/`, `docs/`, archived sprints).
- Any reduction that removes a user approval gate mandated by `checkpoints.md` without explicit user sign-off.
