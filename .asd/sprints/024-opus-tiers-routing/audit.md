---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md). Verified at HEAD `54e33e3`, sprint 024, workflow `lite`, self-hosting enabled. Paths are relative to the repo root.

## Touched areas
- **AC-1:**
  - `.asd/agents/asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-combined.md`: frontmatter `claude.model`/`effort`.
  - `.asd/agents/asd-dev.md`: `variants.critical.claude` only.
  - `.asd/release-manifest.json`: `canon_hashes` for those four files. `sync.js --apply` also recomputes `upstream_hashes` (102 entries), which AC-1 does not mention.
  - Generated Claude views that change: `.claude/agents/asd-architect.md`, `asd-reviewer-correctness.md`, `asd-reviewer-combined.md`, `asd-dev-critical.md`. No Codex view changes.
  - `README.md` L218 (family list), L228, L244, L248 (rows), L232 (variant sentence).
  - `.asd/rules/providers.md` L123 (variant-tier sentence).
- **AC-2:**
  - `.asd/rules/sprint-lifecycle.md` L372-376 (Material risk declaration).
  - `.asd/rules/providers.md` L127-129.
  - `.asd/templates/t_plan.md` L34, L40 (placeholder phrases).
  - `.asd/workflows/asd-phase-plan.md` step 4.
  - `.asd/runtime.js` L15, L118-126: no edit proposed.
- **AC-3:**
  - `.asd/rules/providers.md` L123 (the only prose home of the inheritance rule).
  - Cite-only sites, no restatement: `asd-phase-impl.md` 5a, `asd-phase-impl-test.md` 1a, `asd-phase-impl-review.md` steps 8 and 9.
  - `.asd/runtime.js` `routeTask` (L289-309): no derived-id logic exists.
  - `tests/run.js` ≈L7562-7577.
- **AC-4:** `.asd/rules/sprint-lifecycle.md` L9; `.asd/workflows/asd-phase-scope.md` steps 2a and 4; the data sources `t_retrospective.html` and the source sprint's `friction-log.md`.
- **AC-5:**
  - `.gitattributes`, which exists at repo root, is tracked and is on the self-hosting write allowlist.
  - `.asd/rules/code-style.md` L143.
  - `.asd/project/commands.yaml` is not edited.
- **AC-6:** `.asd/rules/sprint-lifecycle.md` "Scope amendment" (L400-407) and "Impl phase" Modes (L246-252); `.asd/workflows/asd-phase-impl.md` step 2 (L49-52) and steps 11-12.
- **AC-7:** `.asd/rules/code-style.md` L126 (§17); `.asd/templates/t_test-plan.md` L47 (cell wording); the test pin ≈L7551-7559.
- **Cross-cutting:** README confirmation per AGENTS.md; `CHANGELOG.md` and the `asd_version` bump at `pr` (MINOR); tests that pin changed wording (see Risks).

## Existing docs found
- [sprint.md](./sprint.md) and [decisions-log.001.md](./decisions-log.001.md): the scope evidence, and the note that retro-backlog 016#P-3 was rejected in 019.
- `.asd/rules/providers.md` "Task-class variants and routing":
  - L123: "critical uses sonnet/xhigh or sol/high", and derived ids take "the `Material risk` lines of the plan Tasks whose paths its delta touches (entry 1 and the first terminal run: every Task's)".
  - `resolved_model` is derived by the orchestrator from `model_families`. `route-task` does not return it.
  - L129 holds the reserved-typing rule.
  - "Model family resolution" already lists `opus`.
- `.asd/rules/sprint-lifecycle.md`:
  - L373 lists the five reserved classes as examples inside the `change` bullet. No definition of any class exists anywhere in canon.
  - L376 says "When in doubt … declare `change`" and that a missing line reads `change: unclassified`.
  - "Retro intake" (L9), "Scope amendment" steps 1-3, and "Impl phase" Modes ("Only one fix flag is ever set … All modes return `NEXT: impl-test`").
- `.asd/rules/code-style.md`: §17 L126 (per-relation bound), §19 L143 (staged form; "a project's configured `lint` command must be the staged form").
- `.asd/rules/git-strategy.md` L43: the compound command `git add -- <paths> && git diff --cached --check -- <paths> && git commit --only -- <paths>`; the orchestrator commits review files.
- `.asd/rules/checkpoints.md`:
  - L7 uses "public contract" as a hard-gate category. That is a different concept from the routing class.
  - L26 "Criterion cost surfacing" already requires stating a criterion's running cost for an included retro candidate before the decision.
  - L49 lists "retro intake dispositions" as hard.
- `.asd/templates/t_retrospective.html`:
  - Analysis table: F-N row with a **Root cause** column.
  - Actions table: Addresses (F-N links), Guardrail, Acts on, Home.
  - Systemic proposals table: Guardrail, Acts on, Home, Expected saving. It has no root-cause column and no F-N link requirement.
  - Source friction entries carry What happened and Impact.
- `.asd/project/retro-backlog.md`: 023#A-2, A-4, P-1, P-2 are `included` in 024; P-3 is `rejected`; 016#P-3 is `rejected` (019).
- `CHANGELOG.md` v13.6.0 (the current `asd_version`) holds the 023 routing and fail-first lines, which are history.
- Archived 023 `plan.md`, `state.json` and `retrospective.html`:
  - 18 of 21 `task_routing` entries are critical; 10 of those 18 are derived ids.
  - Task 7 and Task 9 are declared `change: workflow gate`.
- Non-canonical: `plans/multi-provider-support.md` has a stale opus/sonnet table (agent names such as `asd-pm`). Leave it untouched.
- No open stubs, no `docs/` directory, nothing to migrate.

## Contradictions
Criterion check: all seven ACs are deliverable as stated. No AC conflicts with another. No canonical-vs-canonical conflict and no undeliverable AC was found, so there is nothing unsettled. The entries below are canon that an accepted AC deliberately amends. They resolve by the 022/023 precedent: the later user-accepted scope wins and each site is listed for edit.
- AC-3 vs `providers.md` L123 (the 023 AC-9 inheritance rule) and the test ≈L7562-7577 that pins it. winner=AC-3. Edit L123 and update the test. The CHANGELOG v13.6.0 line is history.
- AC-2 vs `sprint-lifecycle.md` L373 ("…workflow-gate work. Routes `critical`"), L376 (doubt rule) and `providers.md` L129's first sentence. winner=AC-2.
- AC-2 vs retro-backlog 016#P-3 (rejected: allow a `public contract` risk typed `artifact`). winner=AC-2 as constrained by the scope-gate decision.
  - **Kept:** the reserved-typing ban. `RESERVED_CHANGE_RISKS`, the `route-task` rejection, `providers.md` L129's rule and the test at L3474 all stay verbatim.
  - **Changed:** only what each class means. An edit that fails a class definition is declared under a non-reserved name or `none`. Typing a reserved name `artifact` is never the escape.
  - **Nominal equivalence:** a verifiable value swap in a contract surface now reaches `standard`, which is P-3's outcome by reclassification. AC-2's reference case (Task 9, two constants) accepts that outcome explicitly. See Risks.
- AC-6 vs `sprint-lifecycle.md` L246-252 (modes exclusive; "All modes return `NEXT: impl-test`"). winner=AC-6. It runs as two passes in one `impl` entry: review-fix and its finalize (flag cleared), then initial mode for the amendment's Tasks, then one `NEXT: impl-test`. This is consistent with Modes if initial is re-detected after the flag clears.
- AC-1 vs `providers.md` L123 and README L218/L232 text. winner=AC-1; update both. They are machine-pinned (see Risks).

## Existing implementation found
- `.asd/release-manifest.json`: `model_families.claude.opus` is already mapped and mirrored in `providers.md`. Opus is rendered by no agent today. The test comment names "opus after the retier", and README currently omits it from its family list.
- `.asd/sync.js` L161-194 and L949-967:
  - The Claude effort vocabulary is `low|medium|high|xhigh|max` and is family-agnostic.
  - A variant may change only `model` and `effort`.
  - Nothing restricts which family a variant uses, so `opus/high` and `opus/xhigh` pass.
- **Host facts, checked 2026-10-07 against code.claude.com sub-agents and model-config:**
  - Subagent `model` accepts `sonnet|opus|haiku|fable`.
  - `effort` accepts `low|medium|high|xhigh|max`, depending on model.
  - Opus 5.5, 5, 4.8 and 4.7 support `xhigh`. On Opus 4.6, `xhigh` falls back to `high`.
  - Haiku has no effort.
- `resolved_model` is only the manifest family string. `asd-dev` critical becomes `opus`, `asd-tester` critical stays `sonnet`, and nothing else keys on it.
- `.asd/runtime.js`:
  - `riskEntry` (L119-126) and `RESERVED_CHANGE_RISKS` (L15) already enforce the typing ban.
  - `routeTask` takes `risks` as input and returns `{tier, execution, reason}`. It has no concept of derived ids.
  - The only escalation paths are a `change` risk or a failed check after at least one correction attempt. A `priorTier` clamp applies only to a re-dispatch of the same id.
- `.gitattributes` exists, with one line, `* text=auto eol=lf`. It is repo-only and not in `managed_paths`.
- Test 4106 pins that line.
- `commands.yaml` `lint` is already `git diff --cached --check`.
- `code-style.md` L143 already requires the staged form.
- `code-style.md` L126 already states the per-relation bound and the `runs: <n>` record. `t_test-plan.md` L47 already gives each proof form a `runs: <n>`.
- Scope step 2a/4 and `retro-candidates` already supply `{row, acts_on, guardrail, home}`. A candidate's `row` is `<sprint>#<id>`, which locates the source retro and friction log in `archived/`.
- Task-routing tallies across archived sprints (approximate, id forms vary):
  - Declared Tasks about 80% critical.
  - `impl-test` entries 46 of 47 critical.
  - `review-fix` 24 of 24 critical.
  - Suite runs 6 of 8 critical.
- Material risk declarations: 92 `change` lines (27 `workflow gate`, 13 `public contract`, 3 `migration`, the rest free text), 28 `artifact`, 1 `none`.

## Gaps
- **AC-1**
  - Frontmatter edits in four canon agent files. Tester critical stays `sonnet/xhigh`.
  - README L218 becomes `fable/opus/sonnet/haiku`. Update the rows for architect (`opus/xhigh`), correctness and combined (`opus/high`). Rewrite the L232 sentence.
  - `providers.md` L123 must name both opus (dev critical) and sonnet (tester critical).
  - Manifest ledgers and the four generated Claude views are produced by the orchestrator's `sync --apply`, never by a Dev. No Codex view changes.
- **AC-2: concrete criteria, one home**
  - **Home:** `sprint-lifecycle.md` "Plan file format" Material risk declaration owns the definitions and the doubt bound. It is the authoring side, and AC-3's own-risk declarations reuse it.
  - **Citing sites:**
    - `providers.md` keeps only routing semantics and the reserved-typing rule, and points to the home for what each class means.
    - `asd-phase-plan.md` step 4 gains a citation. It currently only says "note … material risk … as input for impl-test" and never mentions the declaration.
    - `t_plan.md` L34/L40 placeholders mirror the one-phrase gist.
  - **`change` iff** correctness is genuinely uncertain. That means at least one of these holds:
    - the right wording or shape of a rule, gate, contract or schema is not yet decided;
    - the effect has an ordering, failure or parser edge a test or grep cannot establish;
    - it changes trust, identity or persisted-data handling.
  - **`artifact`/`none` iff** all three hold:
    - the target text or value is already decided;
    - the edit is a deletion of a named surface, a literal swap, or a mechanical prose or mirror edit;
    - a named test, grep or `sync --check` verifies the result, and the Task names it.
  - **When in doubt:** doubt means a nameable uncertainty. If the author cannot say what is uncertain, the Task is not `change`. Otherwise declare `change`.
  - **Class definitions:**
    - `workflow gate` = adds, removes or reorders a gate, verdict or phase transition, or its enforcement.
    - `public contract` = a signature, field, command or format another phase or a consumer reads, with its wording not yet decided.
    - The other three follow the same uncertainty pattern.
  - **`artifact` vs `none`:** `artifact` when the file is high-stakes, which records `reason: artifact-risk:<name>`. `none` otherwise.
  - **Ambiguity to fix in the AC's wording:** in "a deletion, a constant change, and a mechanical prose or mirror edit whose result a test or grep verifies", the verification qualifier must bind all three. Otherwise any deletion of a gate clause escapes `workflow gate`.
  - **Reference cases:** Task 7 (a verifiable deletion) and Task 9 (two constants) qualify. Both route `standard` with `risks` of kind `artifact` under a non-reserved name or `none`.
  - **Runtime:** runtime.js needs no edit.
- **AC-3: minimum consistent change set**
  - **Edit:** `providers.md` L123 only. A derived id's `risks` are the orchestrator's own declaration for that delta, in the `Material risk` grammar and by AC-2's criteria, with `none` meaning `standard`. Delete the Task-inheritance clause and "(entry 1 and the first terminal run: every Task's)".
  - **Suite runs:** state that `impl-review <id> suite[ <n>]` declares none and passes no failed-check input, so it never routes critical.
  - **Record:** `task_routing[id].reason` already records the declaration. There is no new state field and no migration.
  - **Wording to make explicit:** a review-fix or test-fix that "only edits prose or tests" reaches `standard` unless its own declaration is `change` under AC-2. A non-mechanical rewording of rule text is `change`.
  - **No change needed, but confirm in the plan:**
    - `runtime.js`, since it has no derived-id logic and the AC lists it only as an agreement site.
    - Workflows 5a, 1a, 8 and 9, which cite only.
    - README.
  - **Test:** the sprint-023 AC-9 test must be updated.
  - **Unstated default:** the AC does not state the tier for `impl-test` entries or the in-place test fix. Fix both to own-risk, `standard` by default.
- **AC-4**
  - **Home:** `sprint-lifecycle.md` L9 gains the presentation contract, in two sentences at most. Scope step 4 cites it only; do not restate it.
  - **Root cause:**
    - A-rows have root cause via their Addresses F-N, in the retro's Analysis table, plus the friction entry's Impact.
    - P-rows have no root-cause field. They have Expected saving and an optional F-N link. State this at the gate; never invent a cause.
  - **Orchestrator reads:** `retro-candidates` omits Addresses and Expected saving. The orchestrator reads the source `retrospective.html` and `friction-log.md` by the row's sprint prefix. No runtime change is required.
  - **Proposed edits:** the files-and-changes content is not stored in rows. It comes from the HEAD re-verification the orchestrator already does.
  - **Cost field:** reference `checkpoints.md` "Criterion cost surfacing" rather than duplicate it. It already requires cost before the decision for an included retro candidate.
  - **Scope of the rule:** `upstream: true` and `closed` rows stay exempt, since there is no question.
  - **README:** L182 can stay; record "confirmed accurate".
- **AC-5**
  - **Entry:** append `.asd/sprints/**/reviews/**/*.diff -whitespace` to `.gitattributes`.
  - **Verified:** on git 2.55.0, a staged `.diff` with trailing whitespace under both the active and the `archived/` path gave exit 0 for `git diff --cached --check`, including the pathspec form, while a same-named file outside `reviews/` still reported errors. `git check-attr` shows `whitespace: unset`. gitattributes(5) defines Unset as "do not notice anything as error".
  - **Docs:** `code-style.md` L143 gets one clause, keeping the pinned phrase "a project's configured `lint` command must be the staged form".
  - **Consumers:** `.gitattributes` is not shipped, so a consumer's `lint` relies on that clause alone.
  - **Backlog row:** row 023#A-2's wording (a pathspec exclusion) differs from AC-5's mechanism. The AC governs.
- **AC-6**
  - **Home:** a new step 4, or a paragraph after step 3, in "Scope amendment". Do not renumber steps 1-3: the test at ≈L7133 reads step 3.
  - **Acting site:** `asd-phase-impl.md` step 2 cites it.
  - **Sequencing:**
    - review-fix and its finalize clear the flag;
    - initial mode re-detects and dispatches only the amendment's Tasks, taken from the `gate_decisions`/decisions-log record that names AC, Task and wave;
    - the assessment gate (step 10) fires once, after the initial pass;
    - one `NEXT: impl-test`.
  - **Missing language:** initial mode has no rule for skipping already-ticked Tasks. Without it, a re-entry could re-dispatch completed waves.
  - **Optional extension:** `test_defects_pending` has the same exclusivity gap. One extra clause would cover it, but that is outside the written AC (a hard-scope question). Leave it, or ask at plan.
  - **No re-entry rule:** "Scope amendment" never says how `impl` is re-entered when no fix flag is set.
- **AC-7**
  - **Edit:** replace the §17 L126 bound with "one representative mutation per added assert plus one reword control per entry; run count recorded in the `Regression proof` cell".
  - **Keep:** the pinned tokens: `Regression proof`, "Added tests", mutation, reword, run, and the bullet start `- A content-contract test pins`.
  - **Recording gap:** the cell is per row, but the control is per entry. Record the control in the first content-contract row's `runs`. Alternatively give the entry a one-line record. Either way the template cell keeps `runs: <n>` for every form.
  - **Test:** retitle the test and its message.
  - **Restating site:** no agent or workflow restates the bound.
- **Shared**
  - **Decomposition:** apply the rule that every edit several ACs make to one rule doc sits in one Task. Concretely:
    - `providers.md`: AC-1, AC-2, AC-3.
    - `sprint-lifecycle.md`: AC-2, AC-4, AC-6.
    - `code-style.md`: AC-5, AC-7.
    - `README.md`: AC-1 plus confirmations.
  - **Migration:** none. No config key or state shape changes (`task_routing` and the `Material risk` grammar are unchanged).
  - **Release:** `pr` bumps MINOR (from 13.6.0) and writes a `CHANGELOG.md` section. Consumer-facing: opus tiers, routing, the Material risk criteria, the retro gate, the fail-first bound, and the §19 lint requirement.

## Risks
- **Test pins that will redden or constrain edits:**
  - ≈L7194-7256, the tier test:
    - README rows and the family list must equal the rendered tiers.
    - `providers.md` must have exactly one sentence containing bare "mechanical" and "critical". Do not add a second one in AC-1/2/3 prose.
    - The word sets in that sentence and README's variant sentence are exact (opus, high, sonnet, xhigh, haiku, luna, low, sol; README adds medium).
  - ≈L7562-7577, AC-3.
  - ≈L7551, AC-7.
  - L6232-6271, retro intake: sentences are picked by regex ("non-zero exit", "empty array", "resolved", "undecided"). A new sentence containing those words before the existing ones breaks them.
  - ≈L7133, "Scope amendment" step 3 must stay step 3.
  - L4098-4103, L4106 and L3474 stay green if the wording is kept.
- **Opus rolling alias:** `opus` resolves to the newest Opus, and `xhigh` silently degrades to `high` on a model that lacks it. Cost and quota impact are unmeasured. Correctness and combined drop xhigh to high, so the `lite` combined reviewer, which carries two rubrics, loses effort while gaining model.
- **AC-2/AC-3 are judgment criteria, not machine-checked.** The runtime ban catches only an exact reserved name typed `artifact`, so under-classification yields a `standard` dev on a risky edit. Mitigations: criteria require a named verifying check, `reason` is recorded per dispatch, escalation on a failed check remains, reviewers move to opus, and retro tracks the critical share.
- **P-3 equivalence:** this is the nominal-equivalence risk from the 016#P-3 entry in Contradictions. Criteria keyed to "genuinely uncertain" plus a named check keep it from becoming a name-swap loophole.
- **Self-hosting bootstrap:** sprint 024's own plan is authored under the old "when in doubt, declare change" rule, so its Tasks will mostly route critical, now on opus, at the worst cost. AC-1's sync and the AC-2/AC-3 rule edits apply to dispatches after their wave lands. Keep each dispatch's tier in the routing line, which already records it.
- **Name collision:** `checkpoints.md` L7's "public contract" hard-gate category is a different concept from the routing class. Do not edit or conflate it.
- **AC-4 gate length:** more orchestrator tokens at each scope gate. The user asked for it; keep the field set compact in one home.
- **AC-5:** `-whitespace` hides real whitespace errors only in review diff files, which nobody authors. Verified on one git version and platform; the attribute semantics are long-standing.
