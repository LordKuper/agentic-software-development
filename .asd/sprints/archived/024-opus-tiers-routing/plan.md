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
- `## Dependencies` opens with the wave table
-->

## Overview
The AC source is `sprint.md` AC-1…AC-7 (lite). The inputs are `audit.md`: "Touched areas" lists every site per AC, and the designs under "Gaps" are binding unless a decision below overrides them. Tasks are cut by file. A rule doc several ACs touch sits in one Task, and no two Tasks in a wave share a path. `tests/run.js` and the test pins listed in `audit.md` "Risks" belong to `impl-test`, not to a Task. Generated views change only through the orchestrator's `sync.js --apply` after each wave.

**Fixed design decisions** (each Task implements the decisions it names; a dev reads the real site text before editing):
- **D1 (AC-1), opus tiers.**
  - Canon frontmatter `claude` values: `asd-architect` gets `"model": "opus", "effort": "xhigh"`. `asd-reviewer-correctness` and `asd-reviewer-combined` get `"model": "opus", "effort": "high"`. `asd-dev` `variants.critical.claude` gets `{ "model": "opus", "effort": "high" }`.
  - Unchanged: every `codex` block, the `asd-tester` variants, every other agent, and `maxTurns`.
  - `providers.md` "Task-class variants and routing" names the critical variant per agent: dev critical opus/high, tester critical sonnet/xhigh, both sol/high on Codex. The sentence that pairs bare "mechanical" and "critical" stays the only such sentence (tier pin test, `audit.md` "Risks").
  - README: the family list reads fable/opus/sonnet/haiku. The architect, correctness and combined rows and the variant sentence follow the frontmatter.
- **D2 (AC-2), risk-class criteria. One home:** `sprint-lifecycle.md` "Plan file format", **Material risk declaration**.
  - The `change` bullet stops listing the reserved classes as automatic examples. It defines `change` as correctness genuinely uncertain, meaning at least one of these holds:
    - the right wording or shape of a rule, gate, contract or schema is not yet decided;
    - the effect has an ordering, failure or parser edge that no named test or grep can establish;
    - it changes trust, identity or persisted-data handling.
  - The `artifact` bullet, or `none` when the file is not high-stakes, applies when all three hold:
    - the target text or value is already decided (in the plan or a gate record);
    - the edit is a deletion of a named surface, a literal or constant swap, or a mechanical prose, citation or mirror edit;
    - a test, grep or `sync.js --check` the Task names verifies the result.
  - The verification clause binds all three edit kinds.
  - One sentence per reserved class says when it applies:
    - `workflow gate`: adds, removes or reorders a gate, verdict or phase transition, or changes its enforcement, with the new behaviour not yet fixed;
    - `public contract`: a signature, field, command or format another phase or a consumer reads, with its shape not yet decided;
    - `migration`: rewrites persisted data or config across a version;
    - `security` and `authentication`: change trust or identity handling.
  - An edit that meets no class definition is declared under a non-reserved name or `none`. A reserved name is never typed `artifact`. The ban in `providers.md` and `runtime.js` `RESERVED_CHANGE_RISKS` stays verbatim, and retro 016#P-3 stays rejected.
  - Doubt bound: "When in doubt" means an uncertainty the author can name in the line itself. A Task whose author cannot name one is not `change`. The `unclassified` fail-closed rule for a missing or off-grammar line is unchanged.
  - Reference: 023 Task 7 (a verified deletion) and Task 9 (two constants) would declare `artifact` or `none`.
  - Citing sites: `providers.md` L127-129 cites the home for what a class means and keeps routing semantics plus the reserved-typing rule. `t_plan.md` placeholders carry the one-phrase gist. `asd-phase-plan.md` step 4 cites the home where it says "note per Task only the material risk".
  - `runtime.js` is unchanged.
- **D3 (AC-3), own-risk routing for derived ids. Home:** `providers.md` "Task-class variants and routing" (L123).
  - An `impl-test entry N`, `review-fix <id>`, `test-fix <D-ids>`, `impl-review <id> test-fix` or `impl-review <id> suite[ <n>]` id takes as `risks` the orchestrator's own declaration for that dispatch's delta, in the `Material risk` grammar and by D2's criteria. `none` means `standard`.
  - The inheritance clause and "(entry 1 and the first terminal run: every Task's)" are deleted.
  - A suite run declares `none` and passes no failed-check input, so it never routes critical.
  - A delta that only edits prose or tests, and passes D2's artifact/none test, routes `standard`. A non-mechanical rewording of rule text is still `change`.
  - The declaration is recorded in the routing decisions-log line. `task_routing[id].reason` already carries the outcome. No state field, no migration.
  - Workflows 5a, 1a and steps 8-9 cite only and are re-checked, not edited, unless one restates the deleted clause.
  - `runtime.js` is unchanged.
- **D4 (AC-4), retro row presentation. Home:** `sprint-lifecycle.md` "Retro intake", at most two sentences.
  - Before asking a row's disposition, the scope gate shows:
    - its root cause: an A-row's from its Addresses F-N in the source retro's Analysis and the friction entry's Impact; a P-row states its Expected saving and says it has no root-cause field;
    - the proposed edits (files and change) from the HEAD re-verification;
    - consequences of including it (cost per `checkpoints.md` "Criterion cost surfacing", risk, saving) and of deferring it;
    - a recommendation.
  - `upstream: true` and `closed` rows are exempt. The new sentences avoid the words "non-zero exit", "empty array", "resolved" and "undecided" so the regex-picked pins stay stable, or they sit after those sentences.
  - `asd-phase-scope.md` step 4 cites the home. No runtime change.
- **D5 (AC-5), review diff whitespace.**
  - `.gitattributes` gains the line `.asd/sprints/**/reviews/**/*.diff -whitespace` with a one-line purpose comment. The existing LF line stays byte-identical (pin at tests L4106).
  - `code-style.md` §19 (L143) gains one clause: a project's configured staged `lint` must not flag generated review diff files (`.asd/sprints/**/reviews/**/*.diff`), for example through a `-whitespace` gitattribute. Its pinned phrase stays.
  - `commands.yaml` is unchanged.
- **D6 (AC-6), amendment during a pending review-fix.**
  - `sprint-lifecycle.md` "Scope amendment" gets a paragraph after step 3, never a renumbered step (pin ≈L7133): an amendment accepted while `review_fixes_pending` is set waits for the fix round. `impl` runs review-fix mode first. Once step 11 clears the flag, the same `impl` entry continues in initial mode for the plan's unticked Tasks only. The impl assessment gate runs once, after that pass, then one `NEXT: impl-test`. The paragraph names the exception to "Impl phase" Modes' exclusivity, so Modes cites it instead of being reworded.
  - `asd-phase-impl.md`:
    - step 5 initial builds the graph from waves holding an unticked Task and skips a wave whose Tasks are all ticked;
    - step 11 cites the "Scope amendment" paragraph: after a review-fix finalize, an unticked Task left by an accepted amendment continues into initial mode (steps 3 initial through 10) before step 12.
  - `test_defects_pending` is not extended (`audit.md` Gaps: outside the written AC).
- **D7 (AC-7), fail-first bound.**
  - `code-style.md` §17 (L126) replaces "per added test: one mutation per asserted relation plus one reword control" with: per entry, one representative mutation per added assert plus one reword control for the entry (the same assert reworded must stay green). The `Regression proof` cell's `runs: <n>` counts the row's mutation runs. The entry's single control is counted in its first content-contract row.
  - Pinned tokens stay: `- A content-contract test pins`, `Regression proof`, "Added tests", mutation, reword, run.
  - `t_test-plan.md` already defers its cell to §17 and is unchanged.

- **D8 (AC-8, amendment), flagged choice vs plan decision.** One sentence in `checkpoints.md` "Gate policy", after the adaptive paragraph's "no unresolved material alternative remains" clause: a flagged choice reporting that a plan decision cannot be met within its Task's files is resolved by meeting the decision, widening the fix to the files it needs; dropping the decision's requirement is a `new or changed scope` decision, never an adaptive acceptance. `asd-phase-impl.md` step 10 already cites "Gate policy" for flagged choices and is not edited.
- **D9 (AC-9, amendment), representative mutation.** `code-style.md` §17 (L126) adds to the fail-first bound: for a pin of a changed rule, the representative mutation restores the superseded rule text, or removes the new clause while keeping its citation, never a token rename the old rule would also satisfy. Pinned tokens of L126 stay.

**New homes cited across Tasks** (exact file and heading):
- `sprint-lifecycle.md` "Plan file format" Material risk declaration (D2), "Retro intake" (D4) and "Scope amendment" (D6), all in Task 2. Cited by Task 1 (`providers.md`), Task 5 (`asd-phase-impl.md`) and Task 6 (`asd-phase-plan.md`, `asd-phase-scope.md`, `t_plan.md`).
- `providers.md` "Task-class variants and routing" (D1, D3), in Task 1. Cited by Task 7 (README).

Dispatch note: Task 4 changes the dispatch tier contract: `asd-dev-critical` becomes opus after wave 1's sync. Tasks 1 and 2 change how later derived ids are routed. All three sit in wave 1, so every wave-2 Task and every impl-test entry is routed and dispatched under the new rules. This sprint's own wave-1 Tasks are still declared under the old rule.

## Definition of Done
Standing DoD applies (`sprint-lifecycle.md` "Plan file format") — not restated here.
Sprint-specific:
- every site `audit.md` "Touched areas" lists for an AC is updated or recorded as unchanged;
- `README.md` is confirmed accurate against every edit (`AGENTS.md` hard rule);
- `sync.js --check` is clean after the last wave;
- every impl-test entry and suite run after wave 1 is routed by its own declaration (D3), shown in its decisions-log routing line.

### Task 1: providers.md — critical variant tiers, risk-class citation, own-risk derived ids
Material risk: change: workflow gate
- [x] AC-1 (D1): rewrite the variant-tier clause in "Task-class variants and routing" (L123) to name dev critical opus/high and tester critical sonnet/xhigh, both sol/high on Codex. Keep exactly one sentence pairing bare "mechanical" and "critical".
- [x] AC-3 (D3): in the same paragraph, replace the derived-id inheritance clause with the own-declaration rule. Delete "(entry 1 and the first terminal run: every Task's)". State that a suite run declares `none` and never routes critical. Keep the `priorTier` and fresh-id sentences.
- [x] AC-2 (D2): in L127-129, cite `sprint-lifecycle.md` "Plan file format" Material risk declaration for what each class means. Keep the reserved-typing rule, `RESERVED_CHANGE_RISKS` and the escalation semantics verbatim.
- [x] grep `providers.md` for any other restatement of the inheritance rule or of "sonnet/xhigh" for the critical variant, and update each hit.

### Task 2: sprint-lifecycle.md — risk-class criteria, retro row presentation, amendment ordering
Material risk: change: workflow gate
- [x] AC-2 (D2): rewrite the Material risk declaration bullets (L372-376): the `change` and `artifact`/`none` criteria, one definition sentence per reserved class, and the doubt bound. Keep the `unclassified` rule and the line grammar unchanged.
- [x] AC-4 (D4): add the presentation contract to "Retro intake" (L9), at most two sentences, placed so the regex-picked sentences (`audit.md` Risks L6232-6271) keep matching.
- [x] AC-6 (D6): add the paragraph after "Scope amendment" step 3. Do not renumber steps 1-3. Make "Impl phase" Modes' exclusivity sentence cite it only if a citation is needed for consistency.
- [x] grep the file for other sites stating the old doubt rule, inheritance or mode exclusivity, and align or cite each.

### Task 3: code-style.md and .gitattributes — review diff whitespace, fail-first bound
Material risk: artifact: rule wording
- [x] AC-5 (D5): append `.asd/sprints/**/reviews/**/*.diff -whitespace` with a one-line comment to `.gitattributes`, keeping the existing lines byte-identical. Verify with `git check-attr whitespace -- .asd/sprints/x/reviews/impl/a.diff` (expect `unset`).
- [x] AC-5 (D5): add the consumer clause to `code-style.md` §19 (L143), keeping "a project's configured `lint` command must be the staged form".
- [x] AC-7 (D7): replace the §17 (L126) bound per D7, keeping the pinned tokens.

### Task 4: agent frontmatter — opus tiers
Material risk: artifact: agent frontmatter tiers
- [x] AC-1 (D1): set `claude.model`/`effort` in `.asd/agents/asd-architect.md` (opus/xhigh), `asd-reviewer-correctness.md` (opus/high), `asd-reviewer-combined.md` (opus/high), and `variants.critical.claude` in `asd-dev.md` (opus/high). Edit frontmatter values only, the JSON stays valid. Touch no `codex` block and no other agent. Verify the result with `node .asd/sync.js --check` (expect only these four generated views stale, before the orchestrator's apply).

### Task 5: asd-phase-impl.md — skip ticked waves, amendment continues after review-fix
Material risk: change: workflow gate
- [x] AC-6 (D6): in step 5 initial, build the graph from waves holding an unticked Task and skip fully ticked waves.
- [x] AC-6 (D6): in step 11, cite `sprint-lifecycle.md` "Scope amendment" for the continue-into-initial pass before step 12. Step 12 still emits one `NEXT: impl-test`.
- [x] AC-3 (D3): re-check step 5a against `providers.md` "Task-class variants and routing". Cite only, and remove any restated inheritance.

### Task 6: plan and scope workflows, plan template — citations
Material risk: artifact: citation wording
- [x] AC-2 (D2): in `.asd/workflows/asd-phase-plan.md` step 4, cite `sprint-lifecycle.md` "Plan file format" Material risk declaration at "note per Task only the material risk".
- [x] AC-2 (D2): in `.asd/templates/t_plan.md` L34/L40, make the `change`/`artifact` placeholders carry the D2 gist in one phrase each.
- [x] AC-4 (D4): in `.asd/workflows/asd-phase-scope.md` step 4, cite `sprint-lifecycle.md` "Retro intake" for the per-row presentation before the disposition question. Cite only, do not restate.
- [x] AC-3 (D3): grep `.asd/workflows/asd-phase-impl-test.md` 1a and `asd-phase-impl-review.md` steps 8-9 for restated inheritance or "every Task's". Cite only, and record the result.

### Task 7: README.md mirror
Material risk: artifact: mirror doc
- [x] AC-1 (D1): update the family list (L218) to fable/opus/sonnet/haiku, the `asd-architect` (opus/xhigh), `asd-reviewer-correctness` and `asd-reviewer-combined` (opus/high) rows, and the variant sentence (L232): dev critical Opus high, tester critical Sonnet xhigh, Sol high on Codex.
- [x] AC-2..AC-7: confirm every README mention of routing, retro intake, scope amendment, lint and fail-first is accurate, and edit only stale text. List each section checked.
### Task 8: checkpoints.md — flagged choice meets the plan decision
Material risk: artifact: rule wording
- [x] AC-8 (D8): add the sentence to `checkpoints.md` "Gate policy" as D8 states; keep the `public contract` hard-gate category and every other sentence verbatim. Verification: `node tests/run.js` (impl-test pins it).

### Task 9: code-style.md — representative mutation for a changed rule
Material risk: artifact: rule wording
- [x] AC-9 (D9): extend the §17 fail-first bound (L126) as D9 states, keeping its pinned tokens. Verification: `node tests/run.js`.

## Risks (optional)
- The tier pin test (`tests/run.js` ≈L7194-7256) checks exact word sets in the `providers.md` and README variant sentences. Task 1 and Task 7 wording must be mutually consistent, and impl-test repoints the test.
- Under-classification after D2 and D3 is unchecked by the runtime. The mitigations are listed in `audit.md` "Risks". Retro should track the critical share.
- CRLF hazard on this Windows host: use the Edit tool and check that `git diff --stat` is the size of the change (`code-style.md` §19).

## Dependencies

| Wave | Tasks |
|---|---|
| 1 | Task 1, Task 2, Task 3, Task 4 |
| 2 | Task 5, Task 6, Task 7 |
| 3 | Task 8, Task 9 |

- Task 5 depends on Task 2 (cites "Scope amendment") and Task 1 (cites "Task-class variants and routing").
- Task 6 depends on Task 2 (cites "Plan file format" and "Retro intake").
- Task 7 depends on Tasks 1, 2, 3 and 4: it mirrors their edits.
- Tasks 8 and 9 (scope amendment AC-8, AC-9, new last wave) depend on Tasks 1-7: Task 9 edits the §17 sentence Task 3 rewrote.

Orchestrator-only (outside every Task):
- After each wave, once: `node "$(git rev-parse --show-toplevel)/.asd/sync.js" --apply <generated-view-path...>` for the generated views of the canon that wave edited. Wave 1: `.claude/agents/asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-combined.md`, `asd-dev-critical.md`, plus the `.codex`/`.agents` views `sync.js --check` reports. Wave 2: the `asd-phase-impl`, `asd-phase-plan` and `asd-phase-scope` skill views it reports. Then `sync.js --check`, which also refreshes `release-manifest.json` hashes.
- `impl-test` owns the `tests/run.js` repoints (`audit.md` "Risks").

## Out of scope (optional)
- Any `runtime.js` change to `route-task` or `RESERVED_CHANGE_RISKS`.
- Extending AC-6 to `test_defects_pending`.
- Codex model or effort changes.
