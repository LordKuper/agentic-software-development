---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 027-staged-design-retro-intake

## Goal
1. Make the retro-intake rule explicit: at scope, the user decides every retro finding with one of three choices — include in the sprint, reject permanently, or defer to the next sprint; a deferred finding is put to the user again when the next sprint's scope is formed.
2. Solution design runs in stages: (a) an interview gathering functional requirements at a detail level sufficient to start design (not a detailed one); (b) a web search collecting best practices for solutions of this class; (c) an interview refining the requirements from that research, proposing recommended approaches.

## Acceptance
- AC-1: Scope retro intake puts each non-upstream candidate row to the user as an explicit three-way choice — include in sprint / reject permanently / defer to next sprint; no row is disposed by default, and the scope gate is not accepted while a row put to the user has no choice.
- AC-2: A `deferred` row is put to the user again at every later sprint's scope intake until it is included, rejected or closed (verified resolved at HEAD, shown at the scope gate with its evidence, no question); a `rejected` row is never offered again.
- AC-3: The scope phase of both workflows (`standard`, `lite`) always runs staged solution design before the `AC-N` are fixed: (a) a requirements interview collecting functional requirements at a detail level sufficient to start design; (b) a web search for best practices of this solution class, with sources; (c) a refinement interview, based on that research, proposing recommended approaches for the user to choose. The main orchestrator conducts both interviews; `asd-ba` performs the web search.
- AC-4: Stages (a)-(c) work at the level of conceptual approaches and functional requirements only; technical implementation details are left to the design phase (`standard`) or plan (`lite`, collapsed design).
- AC-5: The research findings and their sources from stage (b), and the approaches chosen in stage (c), are recorded in a sprint artifact a later phase reads.
- AC-6: README.md and every cross-file mirror reflect AC-1..AC-5 and AC-7..AC-10; `node tests/run.js` is green and `sync.js --check` is clean.
- AC-7 (retro 026#A-1): `providers.md` "Task-class variants and routing" states `route-task`'s input keys once — `kind` (command|mechanical|standard), `objectiveInputs`, `failedObjectiveCheck`, `checks`, `correctionAttempts`, `risks`, optional `priorTier`.
- AC-8 (retro 026#A-2): `review-policy.md` states that an empty findings table is its header row only, never a placeholder row.
- AC-9 (retro 026#P-3): a fail-first mutation run for a content-contract assert runs only the asserting test (a name filter on the runner), never the whole suite; `tests/run.js` offers that filter.
- AC-10 (retro 026#P-2, generalised by the user): any agent-memory edit (`.claude/agent-memory/**`, leftover-term hits included) is made inside the current phase; it never causes a phase transition (no `D-N` routed to impl test-fix) or an extra review iteration.

## Out of scope (optional)
- Technical design inside the staged design stages (AC-4).
