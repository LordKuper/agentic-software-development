---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 026-structured-specs

## Goal
Make the specifications of skills, agents and workflow phases, and agent↔orchestrator communication, structured, maximally compact and deterministic. One unified structure per category (agents one, skills another, phase workflows another), covering role, goal, inputs, outputs, rules, constraints, failure/success/clarification signals and whatever else is relevant per category; the structures are proposed for user approval. Beyond the explicit request, propose further workflow optimizations.

Baseline (HEAD aafbdf13): agents 103 KB over 12 files (one shared heading set, overlapping sections: Role vs description, Operating contract vs Do's/Don'ts/Tool policy/Signals); phase workflows 125 KB in four shapes (audit, design-promote, pr, scope lack Preconditions/Operations used); standalone skills 70 KB in three shapes; agent `description` fields 10.1 KB (plus 4 task variants), loaded into every session's agent list; dispatch payload has only a header rule (`providers.md` "Dispatch payload header"), agent returns are free text after the signal token.

## Form (accepted at scope gate)
Specs stay Markdown with a fixed section set per category; inside a section, declarative facts (inputs, outputs, modes, escalation, signals, dispatch, gates, routing, ops, payload, return) take a JSON structure where it fits; procedure and judgment stay terse prose lists. Exact keys and types are settled in plan.

- Agent: `# Role` (who + goal, 1-2 lines) → `## Inputs` → `## Outputs` → `## Rules` (must / never) → `## Tools` → `## Escalation` (trigger → signal) → `## Signals` → closed-list domain sections (Rubric, Coverage ledger, Severity mapping, Invocation, Triage, Evidence routing, Diagram modes, Tech reference).
- Phase workflow: owner line → `## Entry` (preconditions, mode detection) → `## Inputs` → `## Steps` (gates marked) → `## Rules` (agent-facing phase rules, granted to dispatched agents) → `## Dispatch` → `## Signals` (protocol deviations only) → `## Exit` (writes, condition → NEXT) → `## Return` → `## References`.
- Standalone skill: `## Purpose` → `## Preconditions` → `## Modes` → `## Steps` → `## User decisions` → `## Delegates` → `## Outputs` → `## Return` → `## References`. `asd-phase-*` triggers unchanged.
- Protocol (home: new `.asd/rules/agent-protocol.md`, loaded by every role): JSON dispatch payload (repo root, sprint, phase, mode, task, inputs, write scope, turn budget, answers, advice, consults left); return = first-line signal token, then a JSON object with fixed fields per signal; reviewer verdict first line unchanged.

## Acceptance
- AC-1: Every `.asd/agents/*.md` body follows the agent form; the body never restates the frontmatter `description`; `description` is a routing line ≤300 chars (O1).
- AC-2: Every `.asd/workflows/asd-phase-*.md` follows the phase form.
- AC-3: Every standalone skill (`asd-sprint`, `asd-init`, `asd-concept`, `asd-design-system`, `asd-stack`, `asd-sync`, `asd-update`) follows the skill form; `asd-phase-*` triggers keep the thin-trigger shape.
- AC-4: Orchestrator↔agent communication is one canonical protocol in `.asd/rules/agent-protocol.md` (signal vocabulary, payload, per-signal return structures, QUESTION and ADVICE_NEEDED protocols, absorbing `sprint-lifecycle.md` "Signal vocabulary" and `providers.md` "Dispatch payload header"); `providers.md` "Role-scoped context" makes every role load it; every agent and workflow cites it instead of restating it.
- AC-5: Return-contract lines of phase workflows and skills share one format.
- AC-6: Signal vocabulary pruned of tokens with no emitter or handler (`PLAN_DRAFT`, `PLAN_READY`) (O3); `ABORT` joins the vocabulary; reviewers never emit `ADVICE_NEEDED` (their questions ride the `question:` carrier), creators list it, every phase dispatching a creator has the relay branch and plan loses its dead one (audit C-4).
- AC-7: Requirement inputs that vary by `documents.*`, workflow and `self_hosting` resolve through one table in one rule home, cited by name, instead of per-agent conditional prose (O2).
- AC-8: `sprint-lifecycle.md` split (O4): a section moves to its phase workflow (orchestrator procedure to `## Steps`, agent-facing rules to `## Rules`) only when every reader and executor is that phase's workflow or an agent it dispatches (audit C-1, C-2); cross-phase sections ("PR phase" minus open-mode DoD, "Plan file format", "Retro phase" row-id grammar, "Design-promote phase" fold rule) stay; `providers.md` rows name the moved `## Rules`; every citation of a moved section is repointed.
- AC-9: Retro 025#A-1: the closure write's gate entry is named `sprint-closure` in `sprint-lifecycle.md` "PR phase" and every other home.
- AC-10: Retro 025#A-3: `git-strategy.md` forbids a dispatched agent to move HEAD in the shared worktree (`reset`, `commit --amend`, `rebase`); it corrects a wrong commit with a follow-up commit of its own paths.
- AC-11: Retro 025#P-1: a plan decision defining a computed metric or a bounded fetch states its edge semantics (interval overlap, nesting vs concurrency, re-entry of an open operation, total vs idle deadline) before plan acceptance.
- AC-12: `tests/run.js` machine-checks each form (section set and order per category, JSON blocks parse and carry their keys, description cap); suite green, `sync.js --check` clean, README and every cross-file mirror accurate.
- AC-13: No behaviour change beyond AC-6, AC-9..AC-11: every rule, gate, signal and constraint present at baseline is still stated once (moved, merged or cited) — AC-4/AC-5 change only carriage (audit C-3); total bytes of agents + phase workflows + standalone skills + `sprint-lifecycle.md` + `agent-protocol.md` + the AC-7 home drop measurably against the baseline 376,476 B (audit).
