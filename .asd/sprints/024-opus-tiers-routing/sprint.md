---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 024-opus-tiers-routing

## Goal
Move the agents whose errors cost the most onto the opus family, and stop routing nearly every task to the critical tier. From sprint 009 to 023, about 80–90% of `task_routing` entries routed critical. In 023, 18 of 21 did, all with `risk:workflow gate`. With dev-critical on opus, every unneeded escalation costs more, so both changes ship together.

## Acceptance
- AC-1: four agents move to the opus family on the Claude side. `asd-architect` gets opus/xhigh. `asd-reviewer-correctness`, `asd-reviewer-combined` and the `asd-dev` `critical` variant get opus/high. The Codex side is unchanged, since Codex has no opus family. Every other agent and variant is unchanged. The README model-tier table, the `release-manifest.json` `canon_hashes` and the generated provider views follow.
- AC-2: the reserved `change` risk classes (`security`, `authentication`, `migration`, `public contract`, `workflow gate`) get definitions narrow enough that an edit to workflow rule text is not reserved by that fact alone. The plan phase gets concrete criteria. `change` means the edit's own correctness is genuinely uncertain. `artifact` or `none` covers a deletion, a constant change, and a mechanical prose or mirror edit whose result a test or grep verifies. The "when in doubt, declare change" rule is bounded the same way. Reference cases: 023 Task 7 (deleting a cap) and Task 9 (changing two constants) both declared `change: workflow gate` and would not route critical under the new criteria.
- AC-3 (also retro 023#P-1): a derived dispatch id routes on its own work, not on the inherited `Material risk` of every plan Task whose paths its delta touches. Derived ids are impl-test entries, `review-fix`, `test-fix`, the in-place low-severity test fix and impl-review suite runs. An impl-review suite run (deterministic full-suite execution plus triage) never routes critical. A review-fix or test-fix delta that only edits prose or tests declares its own risk and reaches the standard tier. `runtime.js` `route-task`, `providers.md` "Task-class variants and routing" and every site restating the inheritance rule agree.
- AC-4 (user request at the scope gate): before asking for a retro intake disposition, the scope gate shows each candidate row with its root cause (from the source retro and friction entry), the concrete proposed edits (files and what changes), the consequences of including it and of deferring it (cost, risk, saving), and a recommendation. A bare row id and guardrail is not enough for the decision. Home: `sprint-lifecycle.md` "Retro intake", cited by `asd-phase-scope.md` step 4.
- AC-5 (retro 023#A-2): the staged whitespace lint ignores the generated review diff files `.asd/sprints/**/reviews/**/*.diff`, so a review commit reads lint-green. This repo gets the cheapest native mechanism, a `.gitattributes` `-whitespace` entry, which every `git diff --check` honours, the agents' compound commit command included. `code-style.md` states the same requirement for a consumer project's configured `lint`.
- AC-6 (retro 023#A-4): when a scope amendment is accepted while `review_fixes_pending` is set, `impl` first runs the fix round in review-fix mode, then dispatches the amendment's Tasks in initial mode, before the next impl-test entry. Home: `sprint-lifecycle.md` "Scope amendment", cited where `asd-phase-impl.md` detects the mode.
- AC-7 (retro 023#P-2): a content-contract test entry's fail-first proof is bounded to one representative mutation per added assert plus one reword control per entry, replacing the per-relation bound in `code-style.md` §17. The run count stays recorded in `test-plan.md`.
- AC-8 (scope amendment, retro 024#P-1, user request): a dev's flagged choice reporting that a plan decision cannot be met within its Task's files is resolved by meeting the decision (widening the fix to the files it needs), never by dropping the decision's requirement; dropping a plan decision is a `new or changed scope` decision. Home: `checkpoints.md` "Gate policy".
- AC-9 (scope amendment, retro 024#P-2, user request): for a content-contract pin of a changed rule, the representative fail-first mutation restores the superseded rule text, or removes the new clause while keeping its citation, never a token rename the old rule would also satisfy. Home: `code-style.md` §17.

## Out of scope (optional)
- Codex model or effort changes.
- Tier changes for agents not named in AC-1.
- Retro 023#P-3 (per-file severity floor after a scope amendment): rejected by the user.
