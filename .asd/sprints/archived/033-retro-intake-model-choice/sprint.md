---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 033-retro-intake-model-choice

## Goal
Triage open `asd-retro` issues and retro rows; review https://claude.dev/blog/which-claude-model-should-you-build-with/ and apply its relevant recommendations to ASD (approach B, `research.md`): token savings without noticeable quality loss, Claude side only.

## Acceptance

Model choice (research.md F1-F12):
- AC-1: `asd-tester` gains a haiku task variant used for suite runs and log reading without test authoring (impl-review terminal full suite, impacted re-runs); authoring and triage stay on the base agent.
- AC-2: External Review's own Claude model (the wrapper, not the wrapped CLI) is `haiku`.
- AC-3: `route-task` has a tier above `standard` on the opus family for change risks migration, broad repository reasoning and unfamiliar cross-domain work, dispatched as an `asd-dev` variant; other risks keep `standard`.
- AC-4: The routing escalation ladder follows the article: a task failing its objective check is re-dispatched at one effort level higher before moving to the next tier.
- AC-5: A haiku read-only scout agent returns path-cited summaries of code and documents for orchestrator scans (audit, plan, cleanup); judgment and every artifact stay with the orchestrator.
- AC-6: README states the recommended orchestrator session model (Opus `medium` default, Fable for long unattended or large runs) and the `haiku` alias note (Haiku 4.5 on Bedrock/Vertex/Foundry unless `ANTHROPIC_DEFAULT_HAIKU_MODEL` is set); the model-tier table matches canon.
- AC-7: Every article recommendation F1-F12 is either reflected in canon or rejected with a one-line reason in `audit.md`.
- AC-8: Codex families, effort and columns are unchanged; a new agent or variant takes the existing Codex family of its base (`sol`, or `luna` for haiku-class).

Retro rows and issues:
- AC-9: impl-review's external `emit-manifest` call passes `--iteration <N>`, the plain integer (032#A-1).
- AC-10: In review-fix mode a finding whose fix lies outside the dev allowlist is applied by the orchestrator, and impl step 9's round diff names that path by finding id (032#A-2).
- AC-11: A plan moving a responsibility between roles, adding a delegation or removing a routing clause lists, per affected file, each sentence attributing it to a role, the delegate's write classes read from its code, and each case the clause routed (032#P-1, 031#P-2).
- AC-12: Templated commit subjects fit 50 characters for every phase and slug, the rule states the header limit, and the one-command commit form checks it (issue #91).
- AC-13: An agent stops every background process it started before returning its signal and names any it could not stop (issue #97).
- AC-14: impl-review routes a FAIL whose findings all lie in agent memory to memory-fix without the user gate, as design-review does (issue #102).
- AC-15: A tester records an AC deviation found without a failing test as a `D-N` row and never rates it acceptable (issue #88).
- AC-16: Each test removed as redundant names the surviving test exercising the same branch (issue #98).
- AC-17: A scope amendment accepted after design-review and before plan resets `reviews.design`, and every review reset moves the existing iteration folders aside before the first new iteration (issues #95, #96).
- AC-18: The timing ledger closes a recovered op as a continuation, skips a repeat close with a warning, and cascade-closes open children of a closed op with a warning; a repeat suite run opens a new id (issues #100, #108, #111).
- AC-19: A release retiring an agent removes or reassigns its `.claude/agent-memory/<agent>/` directory in its migration (issue #92).
- AC-20: A checklist finding whose every location is a test file and which changes no behaviour takes the minor test-only path whatever its severity (issue #90).
- AC-21: The one-command commit form runs `memory-check` before `git commit`, and the orchestrator uses that form (issue #99).
- AC-22: retired by AC-35 (audit contradiction, 2026-11-12).
- AC-23: An earlier green run at or above the needed scope counts as the next required impl-test or terminal suite run when no code, test or stub path changed since its HEAD (issues #76, #86).
- AC-24: A plan may declare a rename map; the review manifest diff collapses hunks that only apply its substitutions into one line per file with the count (issue #75).
- AC-25: `persist-review` applies the external reviewer's severity floor in code and records the dropped count (issue #94).
- AC-26: A build or acceptance handoff to the user opens a user-wait, and `timing-summary` gaps list every phase window over 30 minutes covered by no child op (issue #101).
- AC-27: A runtime command closes an impl-test entry: it fills `HEAD analysed` in the Entry log and appends the decisions-log line (issue #109).
- AC-28: A reviewer returns FAIL only for a finding whose fix needs a design decision changing requirements or complicating the architecture; every other finding is CONCERNS, decided by the orchestrator, which consults the advisor on ambiguous cases (issue #107).
- AC-29: retired by AC-36 (audit contradiction, 2026-11-12).
- AC-30: With subsystem decomposition enabled, `DESIGN.md` allows a per-subsystem token group prefixed by the subsystem, described in the design-system rule (issue #105).
- AC-31: The DESIGN.md delta template has a prose section, and the rule allows a recorded `orphaned-tokens` exclusion list for tokens selected at runtime (issue #106).
- AC-32: A generator rebuilds the token tables and CSS variables of `design-system.html` from `DESIGN.md`, used by design promotion (issue #113).
- AC-33: `designmd-install` is a no-save install that never changes the project's package manifest, with a migration for existing `commands.yaml` (issue #112).
- AC-34: UI mockups live in `<sprint>/design/mockups/` beside the sprint ux-spec draft and are promoted to `docs/ux/mockups/` beside the persistent ux-spec; under Claude Code each mockup is a Claude Design artifact whose source files sit in its own subfolder there, published from it, with an index linking every artifact; under any other host each screen or state is a separate HTML file in the same folder, split as Claude Design frames, outside ux-spec; under `lite` mockups are made at scope; dev and reviewers receive the folder as an input (issue #104).
- AC-35: The review manifest diff collapses every whole-file deletion into one line naming the path and its deleted line count, and wave sizing counts only the remainder (issue #93).
- AC-36: `sprint.md` may declare a `Settings change` for a key audit or design read (e.g. `project.subsystem_decomposition`); scope applies it through `asd-init` sprint-mediated mode before the step 3a freeze, the scope gate being its approval; a plan-declared settings change keeps its impl timing for other keys (issue #103).
