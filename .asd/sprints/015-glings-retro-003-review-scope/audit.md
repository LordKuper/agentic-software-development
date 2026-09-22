---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit — Sprint 015-glings-retro-003-review-scope

Audited at `HEAD` 3842a26 by `asd-architect`. No product/domain ambiguity; BA not dispatched. No documentation outside the ASD format or location is in scope.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/rules/core.md`:
  - "Context hygiene" (L72-89), rules 1, 2, 4 and 7 (AC-1).
  - "Request user decision" (L38-40): add "never for free-form input" (AC-7).
- `.asd/rules/review-policy.md`:
  - "Clean-context review iteration" (L28-36): payload contract, the AC-2 single home.
  - "Change-surface rule" (L38-42): the finding-location exception must survive AC-2.
  - "Coverage ledger" (L97-115): AC-5 row class and the AC-2 manifest source.
  - "Split trigger / Partition / Union property" (L155-161): union (a) re-keyed to each reviewer's own list.
  - "DoD per review phase" (L165-180): the AC-3 table goes beside it.
- `.asd/workflows/asd-phase-impl-review.md`:
  - step 1: scope list and diff source.
  - step 6: emit-manifest, per-reviewer bullets and payload. L41 "the diff computed in step 1" (AC-2/AC-4).
  - step 7a: split parts (AC-11 waves).
  - operations list L14-16.
- `.asd/workflows/asd-phase-design-review.md` step 7: emit-manifest input and payload (AC-2/AC-3).
- `.asd/workflows/asd-phase-scope.md`:
  - step 1, "Obtain raw scope" (AC-7).
  - step 2 (AC-10).
  - step 3a, freeze `documents.*` (AC-8).
- `.asd/workflows/asd-phase-audit.md`:
  - step 2, architect payload (AC-9).
  - step 5, audit exit and collapse test (AC-8 skip point).
- `.asd/workflows/asd-phase-design-promote.md` step 4: route for the git rename/delete (AC-6).
- `.asd/skills/asd-sprint/SKILL.md` step 2A.3 and Operations L20 (AC-7).
- `.asd/agents/asd-reviewer-{correctness,efficiency,testing,documentation}.md`:
  - description, "Does NOT handle", Inputs and rubric (AC-3).
  - Inputs lines naming git or a "diff payload" (AC-4): correctness L44, efficiency L41, testing L34, documentation L40.
- `.asd/agents/asd-external-review.md`: needs a row in the AC-3 table. Its scope stays the `external-review.md` manifest.
- `.asd/agents/asd-architect.md` `maxTurns: 50` (AC-9).
- `.asd/agents/asd-ba.md`, `asd-ux.md`: `disallowedTools: ["Bash"]` stays (AC-6).
- `.asd/rules/sprint-lifecycle.md`:
  - "Orchestration and adaptive gates" (L3-11): home for the AC-11 ceiling rule, because the orchestrator always loads it.
  - "Optional documents" (L123-133): AC-8 relaxes "never recomputed".
  - "Plan file format" change surface (L330): AC-11 disclosure.
- `.asd/rules/checkpoints.md`:
  - "Gate policy" hard list (L7): add the AC-8 gate.
  - "Gate inventory" (L37-49): add the AC-8 gate. Change the AC-11 override text.
- `.asd/rules/providers.md`:
  - L32 "delegate in parallel", which today is unbounded.
  - L47: `maxTurns` is emitted on trust.
- `.asd/runtime.js`:
  - `emitCoverageManifests` / `emitManifestCommand` (L348-446): AC-2 selectors, AC-5 per-file authorization, AC-4 diff emission.
  - `standingPredicates`, `NA_PREDICATES`, `NA_TARGETS`.
  - `surfaceCheck` (L420): AC-11.
  - constants L21-23.
- `tests/run.js`:
  - symbol-citation sweep (L4325-4343).
  - split tests (L3002, L4175, L4240).
  - surface-check test (L4698).
  - canon_hashes completeness (L1093).
- `README.md`:
  - reviewer roster table (L213-219).
  - "Diff-scoped rubric-section gating" (L223).
  - runtime.js folder-map line (L297).
  - reviewer phase note (L402).
- `CHANGELOG.md`, `.asd/release-manifest.json` (`asd_version` 10.0.0; `canon_hashes` via `sync.js`) (AC-12).
- `.asd/templates/t_state.json`: no schema change needed.

## Existing docs found
- [core.md "Context hygiene"](../../rules/core.md):
  - Rule 1: "any session is clearable at a phase boundary".
  - Rule 2: "prefer clear over compaction".
  - Rule 4: "Never clear or compact mid-gate".
  - Rule 7: "finish the phase, then clear".
  - AC-1 keeps rules 3 and 5 plus "State recovery".
- [core.md "Request user decision"](../../rules/core.md): "Use whenever a choice is needed rather than free-form input". This is advisory, not a prohibition.
- [review-policy.md "Clean-context review iteration"](../../rules/review-policy.md): payload = "the artifact/diff under review, rule references, severity floor, iteration number, context paths". There is no per-reviewer scope.
- [review-policy.md "Coverage ledger"](../../rules/review-policy.md):
  - `emit-manifest` is the "sole manifest source".
  - Every reviewer gets the same `--files` list.
  - File rows allow `checked`/`n/a`, and `n_a.files` is always `{}`.
- [review-policy.md "Union property"](../../rules/review-policy.md): check (a) says the parts' file ids "union to exactly the scope file list".
- [review-policy.md "DoD per review phase"](../../rules/review-policy.md): an internal reviewer "is NEVER recorded as skipped".
- [external-review.md "Phase-scoped payload"](../../rules/external-review.md):
  - Payload: scope manifest (`files[]`, `exclude_paths[]`, refs), "never a rendered diff".
  - It separates judged scope from readable reference paths. This is the AC-2 precedent.
- [asd-phase-impl-review.md steps 1/6](../../workflows/asd-phase-impl-review.md):
  - One `git diff --name-only` list feeds every reviewer's manifest.
  - The payload adds "the diff", so there are two scope sources.
- [asd-phase-design-review.md step 7](../../workflows/asd-phase-design-review.md): the full draft intersection on every iteration.
- [sprint-lifecycle.md "Optional documents"](../../rules/sprint-lifecycle.md): documents "frozen into `state.json.documents` at `scope`".
- [checkpoints.md "Gate policy"](../../rules/checkpoints.md): the hard list has "deletion of project files during migration" and "change-surface cap override".
- [providers.md L47](../../rules/providers.md):
  - `maxTurns` "may not be relied on as an enforcement boundary".
  - `sync.js` L296 renders it for Claude only.
- [asd-sprint SKILL](../../skills/asd-sprint/SKILL.md):
  - 2A.3 collects free-form scope via a request-user-decision prompt.
  - Step 3 auto-dispatches `NEXT:`, so "moves on itself" already holds mechanically.
- [README.md L406](../../../README.md): SessionStart hook. No clear-context instruction anywhere in README or hooks.
- [CHANGELOG.md L217](../../../CHANGELOG.md): the "clear at phase boundaries" entry is release history and stays.
- Glings retrospective (external data): F-7 was a 1181-file migration split into 192 parts. F-9 is ledger improvisation. The systemic fan-out hit the weekly API limit. The stack is C#/Unity.

## Contradictions
Canonical vs non-canonical: none. The Glings retro is data and agrees with canon.

Canonical vs canonical, hard user decision (`sprint-lifecycle.md` "Audit phase"). Resolutions are recorded below each entry.

- **C-1 Testing reviewer, description vs rubric.**
  - The description delegates AC-coverage to Correctness.
  - The rubric has "**Coverage**: every AC-N has a check asserting observable behaviour".
  - Proposed resolution: Correctness owns the AC→code trace, Testing owns the AC→check coverage, and the AC-3 table is the sole owner.
  - **User decision**: split as proposed.
- **C-2 Incremental diff scoping.**
  - `review-policy.md` L35: "iter 2+ reviews only what changed".
  - `asd-phase-design-review.md` step 7: internal reviewers get the full draft set on every iteration.
  - Proposed resolution: design-review internal reviewers keep the full set, and the L35 wording is fixed.
  - **User decision**: incremental everywhere. On iteration 2+, design-review internal reviewers also get only the changed drafts. This overrides the proposed resolution; L35 stands, and `asd-phase-design-review.md` step 7 changes to match it.
- **C-3 "Codex self-scopes".**
  - `review-policy.md` L99 says Codex.
  - `providers.md` says the wrapped CLI is Claude under Codex.
  - Proposed resolution: "the wrapped CLI self-scopes".
  - **User decision**: reword as proposed.
- **C-4 Mid-gate compaction.**
  - `core.md` rule 4 forbids it.
  - No host exposes agent-initiated compaction, so the rule is unenforceable.
  - Proposed resolution: reword it to "write the gate answer to `decisions-log.md`/`state.json` before any further work".
  - **User decision**: reword as proposed.

## Existing implementation found
- `.asd/runtime.js` `emitCoverageManifests` already filters with `isUiSurface`, `isExecutable` and `isTemplated`, and grants per-id n/a predicates in the digest-covered `n_a`. AC-2 selectors and AC-5 per-file authorization reuse this pattern.
- `validateCoverageLedger` already enforces `n_a.files[<id>]` authorization.
  - AC-5 needs only an emitter-side grant, e.g. `NA_PREDICATES.pureRename`. The validator is unchanged.
  - The row stays `{i,s:"n/a",p}`, already the compact form.
- Split partition and `--halve` run inside `emit-manifest`. Parts of at most 25 files keep per-part `git diff` within argv limits.
- `surfaceCheck` returns `{files, cap, breach}`. The AC-11 dispatch count extends it.
- `asd-sprint` Step 3 auto-dispatches `NEXT:`. The SessionStart hook plus "State recovery" covers resume.
- The hard gate "deletion of project files during migration" covers the AC-6 deletion. Architect has Bash, so only BA/UX docs need the orchestrator route.
- Every fan-out uses the unbounded "delegate in parallel" op. Sites:
  - review workflows: reviewer × parts + External Review.
  - `asd-phase-impl.md` L64: whole wave at once.
  - design-promote step 4: at most 3.

## Gaps

- **AC-1.**
  - The only clear-context text is in `core.md` rules 1, 2, 4 and 7.
  - Rule 3's preserve list stays: sprint id, phase and mode, outstanding signals, any unrecorded gate answer, paths written, remaining ids.
  - Rewrite rules 3 and 7 as properties of host auto-compaction, with disk as the memory. Drop the "~70%" threshold, which nothing can act on.
- **AC-2/AC-3, current flow.** One scope list per phase, shared by all internal reviewers. There is no reviewer selector.
- **AC-2/AC-3, proposed selector** (inside `emit-manifest`):

  | Phase | Reviewer | Files it receives |
  |---|---|---|
  | impl-review | Correctness | full list (default owner; guarantees the union) |
  | impl-review | Efficiency | full list |
  | impl-review | Documentation | full list (doc comments, TODOs, templated artefacts, Framework mode) |
  | impl-review | Testing | test files (new classifier `isTest`) plus `<sprint>/test-plan.md` and its segments, appended explicitly because it sits under the excluded `.asd/sprints/**` |
  | design-review | Correctness | `ux-spec.html` + `design-md-delta.yaml` |
  | design-review | Efficiency, Documentation | all drafts |
  | both | External Review | unchanged; its list is governed by `external-review.md` |

- **AC-2/AC-3, yield.** Only Testing narrows materially. AC-2's value is the single scope source; AC-5 is the real saving on migrations.
- **AC-2/AC-3, scope vs context.** "Unlisted = out of scope" must mean out of the ledger and not a finding location. It must not mean unreadable, as in `external-review.md`. Otherwise:
  - Testing cannot judge no-test decisions.
  - Documentation actuality loses `docs/**`.
  - The Change-surface exception breaks.
- **AC-2/AC-3, owner gaps.**
  - (a) Design-review has no owner for draft correctness (ADR soundness, contracts, PRD AC completeness). Without a UI draft, Correctness dispatches with every section `n/a`. The plan must choose a rubric entry or an accepted empty dispatch, and must never add a skip.
  - (b) Testing "Stub-resolution verification" moves to Documentation.
  - (c) See C-1.
  - (d) Testability in design-review has no owner. The table states this explicitly.
- **AC-2/AC-3, invariants.**
  - Union (a) reads "that reviewer's file list".
  - New cross-reviewer invariant: the union of the lists equals the scope list. It holds by construction when Correctness takes the full list, and is test-asserted.
  - Unchanged: DoD roster, latch, `SURFACE_CAP_FILES`.
- **AC-4.**
  - The payload "the diff" and correctness L44's literal `git diff` assume a shell.
  - Emit one patch per manifest part, `<reviewer>[.part-N].diff`, from `git diff -M <range> -- <part files>`.
  - Deleted files: the patch is their only evidence, which closes a latent gap.
  - Patches under `.asd/sprints/**` never re-enter review.
- **AC-5.**
  - R100 is machine-provable via `git diff --raw -M100%`, and exact renames ignore `renameLimit`.
  - `emit-manifest` gains `--base`/`--head` and runs git itself. Impl-review only.
  - **Namespace/import-only edits are not verifiable language-agnostically**, so they are excluded:
    - Import syntax and side effects vary by language.
    - A rebinding can happen silently.
    - A namespace change breaks FQNs, reflection and serialized type names (Unity `[SerializeReference]`).
    - A project-declared line pattern would be an assertion, not a proof.
  - Glings "move + namespace rewrite" files are R<100 and get no compact row.
- **AC-8.**
  - Offer the skip at the scope gate and at the audit exit, before the collapse test. A skip at design entry would bypass the collapse.
  - Narrow-only (`true`→`false`), before any draft of that document exists, hard gate, one decisions-log line that distinguishes it from config-disabled.
  - Edits: `sprint-lifecycle.md` gets a narrow-only exception; `checkpoints.md` gets the gate.
  - The state shape is unchanged.
  - For the plan: c4 counts as skippable (yes). audit does not, since `off`/`auto` already cover it.
- **AC-9.**
  - There is no diff at audit time. The orchestrator counts `git ls-files -- <touched areas>`.
  - The threshold is a runtime constant cited by symbol.
  - Raising `maxTurns` is trusted emission only, with no Codex counterpart. The batched-read plan is the binding control.
- **AC-11.**
  - Concurrency is unbounded today.
  - `DISPATCH_CEILING = 20` in `.asd/runtime.js`.
  - The rule goes once in `sprint-lifecycle.md` "Orchestration and adaptive gates" and covers review parts and impl waves (sub-waves).
  - `surfaceCheck` returns the implied dispatch upper bound, `internalReviewers × ceil(bound / SPLIT_THRESHOLD_FILES) + external`.
  - Add a pure wave-splitting helper with a test.
- **AC-6.** Design-promote has no rename/delete step. The orchestrator runs `git mv`/`git rm` inline, and the creator fixes content and inbound links.
- **AC-7.** SKILL 2A.3 and scope step 1 say "plain chat message". `core.md` says "never for free-form input".
- **AC-10.** No cleanup/quality-criteria prompt exists in the scope workflow.
- **Migration.**
  - In-flight split parts keep their emitted `files` for union check (a).
  - New manifest fields are optional to `validate-ledger`.
  - No `state.json` schema change.
  - Result: no migration script. `CHANGELOG.md` gets an explicit no-migration note ("finish or re-emit an in-flight review iteration after upgrade"). `asd_version` goes to 11.0.0, because the reviewer payload and scope contract change. `canon_hashes` via `sync.js --apply`.

## Risks
- **Heuristic `isTest` classifier.**
  - Impact: a missed test file has no Testing owner.
  - Mitigation: broad classifier (path segment `test|tests|__tests__|spec|specs`, basename `*.test.*`/`*.spec.*`/`test_*`/`*_test.*`/`*Tests?.*`). Correctness keeps the full list as a backstop.
- **AC-2 wording.**
  - Impact: read as "unlisted = unreadable", it breaks Testing, Documentation actuality and the Change-surface exception.
  - Mitigation: define the list as ledger rows and finding locations. Context paths stay readable.
- **Empty per-reviewer list.**
  - Impact: design-review Correctness without a UI draft makes a wasted dispatch.
  - Mitigation: the plan decides. Never a skip.
- **Rename is neutral for the file, not its referrers.**
  - Impact: stale referrers are not caught by the R100 row.
  - Mitigation: the Change-surface exception, the build/lint gate and impacted tests.
- **Committed patch files.**
  - Impact: bloat on 1000+-file migrations.
  - Mitigation: `-M` keeps R100 hunks header-only. The plan decides between commit and gitignore; patches can be regenerated from `iteration_heads`.
- **Host-driven compaction.**
  - Impact: it can fire mid-gate or mid-dispatch.
  - Mitigation: record the gate answer first (C-4). State recovery is unchanged.
- **Ceiling vs host limits.**
  - Impact: native host caps are unverified, so 20 is mainly a usage-burst bound.
  - Mitigation: document it as an upper bound. Correlated interruption is handled per wave.
- **`maxTurns` not enforced.**
  - Impact: raising it may change nothing.
  - Mitigation: the batched-read plan is binding.
- **AC-6 "owner".**
  - Impact: the BA/UX agent cannot approve deletion.
  - Mitigation: the agent proposes, the user approves under the existing hard deletion gate, and the orchestrator runs git.
- **Mirror drift.**
  - Impact: mirrors drift across README roster, agent descriptions, both workflows, review-policy, the citer sweep and canon_hashes.
  - Mitigation: `node tests/run.js`, `sync.js --check`, and grep the reviewer names across README.
