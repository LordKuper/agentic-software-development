---
responsibility:
  owns: task breakdown, task status (checkboxes), sprint-specific DoD additions
  excludes: requirements, design decisions, code, review findings, the standing DoD (owned by sprint-lifecycle.md "Plan file format")
  delegates_to: reviews/ (findings); persistent docs (requirements/design) are named in the impl dispatch payload, not linked here
---

# Plan

## Overview
Sprint 027 makes retro intake an explicit per-row three-way choice (AC-1, AC-2), adds staged solution design to the scope phase of both workflows (AC-3..AC-5), and lands four retro rows (AC-7..AC-10). Inputs: `sprint.md`, `audit.md` (C1-C5, R1-R12).

Plan decisions:
- D1 (AC-1, AC-2, C1): every open candidate row needs one explicit choice — include / reject permanently / defer — each option shown with its consequence, reject's included; the scope gate is not accepted while a row put to the user has none. A row verified resolved at HEAD is written `closed` with its evidence shown at the gate, no question. A deferred row returns at every later intake (`retroCandidates` already does this; no runtime or backlog-format change).
- D2 (AC-3): staged design runs inside scope step 2, before any `AC-N` is written, after the raw scope: (a) the orchestrator interviews the user in chat for functional requirements — problem, actors, functional requirements, constraints, success criteria — at the detail needed to start design; (b) `asd-ba` is dispatched in a new `scope` mode to research best practices for the solution class on the web and returns findings with sources plus 2-3 conceptual approaches, pros/cons and a recommendation; (c) the orchestrator runs a refinement interview from that research and puts the approach choice to the user as a request user decision, folded under `[GATE hard: scope]` (no new gate-inventory row, so adaptive mode never auto-picks an approach). Research covers the raw scope's strands only; retro rows taken in at step 2a are not researched.
- D3 (AC-4): stages (a)-(c) stay at conceptual approaches and functional requirements. Technical detail belongs to design when it runs, else plan (C5). Design creators and plan read `research.md` first and research only the technical delta under `design-principles.md` §11.
- D4 (AC-5): new sprint artifact `<sprint>/research.md` from new `.asd/templates/t_research.md` (responsibility frontmatter; sections Requirements, Findings with sources, Approaches with the chosen one). The orchestrator writes it from the stage (a) answers, the BA return body and the stage (c) answer, like `audit.md`. New `sprint-lifecycle.md` "Input sources" key `research`, read by the audit architect, design creators and plan. Workflow Markdown, outside the HTML-only rule.
- D5 (R6): when `asd-ba` cannot search (offline session, Codex `web_search` unavailable) it returns `FAILED` naming the cause; the user chooses retry / skip / abort. Skip is a user decision recorded in decisions-log, and `research.md` Findings then states "no web research: <cause>".
- D6 (R1): the phase-workflow byte cap (`tests/run.js` sprint-026 AC-15 assert, 125,501 B) is removed by user decision. The standalone-skills cap stays. The D13 load ceilings stay.
- D7 (AC-7): `providers.md` "Task-class variants and routing" states the seven `route-task` input keys with types and enums once and `--input <path|->`; `asd-phase-impl.md` step 5a cites it instead of restating the list.
- D8 (AC-8, R8): `review-policy.md` "Gate Verdict Format": an empty findings table is its header and separator rows only. Templates and the `reviewFindings` JSDoc follow; the parser keeps its legacy `—` row tolerance (`backward_compat: migration`).
- D9 (AC-9, R9): `node tests/run.js --filter <substring>` runs only tests whose name contains the fixed substring (not a regex); it prints the matched count; zero matches exit non-zero. `code-style.md` §17: every content-contract mutation and control run uses the filter on the asserting test.
- D10 (AC-10): home `review-policy.md` "Memory-fix dispatch": an agent-memory finding or leftover-term hit is fixed by the owner's memory-fix dispatch inside the phase that found it — never a test-fix `D-N`, a review-fix route, a phase transition or an extra review iteration; the orchestrator appends `resolved: <ids> — memory-fix, <YYYY-MM-DD>` (new kind in `sprint-lifecycle.md` "User-resolved findings"). impl-test runs it in-entry before the suite gate; impl-review handles memory findings before the low-severity test-only predicate and fixes a memory-caused terminal-suite red in place, then re-runs; design-review fixes in place. `asd-phase-impl.md`'s review-fix/test-fix memory routing is deleted.

New rule homes cited across Tasks (exact file and heading): `.asd/rules/sprint-lifecycle.md` "Staged solution design" (new section; D2-D5); `.asd/rules/sprint-lifecycle.md` "Input sources" `research` key (D4); `.asd/rules/sprint-lifecycle.md` "User-resolved findings" `memory-fix` kind (D10); `.asd/rules/artifact-layout.md` "Research" (new section, path map entry; D4); `.asd/rules/review-policy.md` "Memory-fix dispatch" (D10); `.asd/rules/review-policy.md` "Gate Verdict Format" (D8); `.asd/rules/providers.md` "Task-class variants and routing" (D7); `.asd/rules/code-style.md` §17 (D9).

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
`node "$(git rev-parse --show-toplevel)/.asd/sync.js" --check` is clean, and this sprint's leftover-term check finds no mention of the removed terms ("undecided → `deferred`", the `| — | — | — | no findings | — |` placeholder row, memory `D-N` routing) outside archived sprints.

### Task 1: Rule docs — staged design, research artifact, memory-fix kind
Material risk: change: staged-design rule shape and memory-fix phase boundary
- [ ] `sprint-lifecycle.md`: new "Staged solution design" section holding D2-D5 (stages, roles, conceptual boundary, research scope, offline retry/skip/abort, approach choice under the scope gate); "Orchestration and adaptive gates" — delegation list adds research, the BA line scoped to audit, the retro-intake line states D1 (explicit three-way choice, `closed` with evidence); Phase table scope row (owner "Main orchestrator (BA research)", inputs, output `research.md`); "Input sources" `research` key; "User-resolved findings" `memory-fix` kind; "Phases" line and impl-review row exceptions per D10 (AC-1..AC-5, AC-10)
- [ ] `artifact-layout.md`: path map entry and new "Research" section for `<sprint>/research.md`; "Agent memory" "Leftover-term check" and "Test plan" memory `D-N` clause per D10 (AC-5, AC-10)
- [ ] `checkpoints.md`: scope gate inventory row names the stage (c) approach choice and the explicit retro dispositions (AC-1, AC-3)
- [ ] `git-strategy.md` "Commit before review" "Memory content check": the memory-fix runs in the current phase (AC-10)
- [ ] new `.asd/templates/t_research.md` per D4; confirm `.asd/release-manifest.json` `managed_paths` covers it (AC-5)

### Task 2: Rule docs — routing keys, empty findings table, fail-first filter, memory-fix home
Material risk: change: memory-fix in-phase rule wording
- [ ] `review-policy.md`: "Memory-fix dispatch" and "Where the fix happens" per D10; "Gate Verdict Format" "Findings table." per D8 (AC-8, AC-10)
- [ ] `providers.md` "Task-class variants and routing" per D7 (AC-7)
- [ ] `code-style.md` §17 content-contract bullet per D9 (AC-9)
- [ ] `t_review.md` and `external-review/t_review-report.md`: drop the placeholder-row instruction per D8 (AC-8)
- [ ] `runtime.js` `reviewFindings` JSDoc: the `—` row is legacy tolerance, not the empty-table form (AC-8)

### Task 3: Scope workflow, BA scope mode, research readers
Material risk: change: staged-design workflow steps and BA scope mode
Reachability: scope writes `<sprint>/research.md` at step 2 stage (c); audit, design and plan read it at entry via the `research` input key
- [ ] `asd-phase-scope.md`: owner line names `asd-ba`; Entry ops add `context --role asd-ba` and a timing dispatch op; step 2 runs stages (a)-(c) citing `sprint-lifecycle.md` "Staged solution design" and writes `research.md`; step 2a/4 per D1 (explicit three-way choice, consequences per option, gate blocked while a row lacks a choice, `closed` shown with evidence); Re-entry skip list keyed on on-disk evidence per stage; `## Dispatch` row for `asd-ba` with relay branches for `QUESTION`/`ADVICE_NEEDED` and `FAILED`/`ABORT` (D5); Inputs/Exit writes (AC-1..AC-5)
- [ ] `.asd/skills/asd-phase-scope/SKILL.md` description names the staged design (AC-3)
- [ ] `asd-ba.md`: `scope` mode (no audit input or `AC-N` required; "missing audit input → ABORT" not firing there), conceptual-only research rule with sources, options, pros/cons, recommendation, `FAILED` on no web access; Tools `web` widened to best-practice research; description reworded within 300 chars (AC-3, AC-4)
- [ ] `t_retro-backlog.md` comment: dispositions as D1 states (AC-1)
- [ ] `asd-phase-audit.md`, `asd-phase-design.md`, `asd-phase-plan.md` Inputs: `research` (D3, D4) (AC-4, AC-5)

### Task 4: Phase workflows — memory fixes stay in phase, routing citation
Material risk: change: memory-fix routing inside impl-test and impl-review
- [ ] `asd-phase-impl-test.md`: leftover-term and memory hits fixed by the owner's memory-fix dispatch in-entry before the suite gate; step 9 triage memory class; Owner line and Dispatch row (AC-10)
- [ ] `asd-phase-impl-review.md`: line 17 exceptions; step 8 memory branch ahead of the low-severity test-only predicate; step 9 memory-caused red fixed in place then re-run; Dispatch row (AC-10)
- [ ] `asd-phase-design-review.md`: memory finding fixed in place with a `resolved:` line (AC-10)
- [ ] `asd-phase-impl.md`: delete the review-fix/test-fix memory routing (owner line clause, step 3 clauses, step 5 ordering, step 9 memory-path allowances, `<owner>` Dispatch row); step 5a cites `providers.md` "Task-class variants and routing" (AC-7, AC-10)
- [ ] `asd-tester.md`: leftover-term check line and "Failure triage" route memory hits per D10; description untouched (AC-10)

### Task 5: Test runner name filter and cap removal
Material risk: artifact: runner filter edge semantics, verified by running the filter
Test-only: tests/run.js
- [ ] `--filter <substring>` in `runAll` per D9 (fixed substring, matched count printed, zero matches exit non-zero) (AC-9)
- [ ] remove the phase-workflow byte-cap assertion and `CAP_PHASE_WORKFLOWS_BYTES`; keep the standalone-skills cap (D6)

### Task 6: README mirrors
Material risk: artifact: README mirror rows, verified by `node tests/run.js` §16
- [ ] README: flowchart scope node (Orchestrator · BA), scope row (staged design, explicit retro choice), impl-review row (memory fixes in phase), `asd-ba` roster role, creator web grants, folder map `research.md` (AC-6)

## Risks
- R7: staged design is mandatory for every sprint, small ones included; cost is one BA dispatch and two interviews per sprint, accepted by the user at scope.
- R10: this sprint removes terms with hits in agent memory; the owner memory-fix line below runs before impl-test entry 1.
- R12: the scope BA dispatch loads the full BA `*` bundle; accepted.

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 5 |
| 2 | Task 3, Task 4 |
| 3 | Task 6 |

- Tasks 3 and 4 cite the rule homes Tasks 1 and 2 create.
- Task 6 mirrors the final wording of Tasks 1-4.

Orchestrator, after wave 2 and its sync: owner memory-fix dispatches for `asd-reviewer-correctness` (`reference_persist-review-return-shape.md`, `MEMORY.md` index line), `asd-reviewer-combined` (`feedback_rereview-no-shell-checks.md`) and `asd-tester-critical` (`project_testability-envelope.md`), one at a time, each committed by the orchestrator.

Orchestrator, after each wave: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply` over the generated views `--check` reports stale.

## Out of scope
- Impacted-set subset runs through the new filter (D9 covers fail-first runs only).
- AGENTS.md repo-local mirror of the filter.
