---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip or other zero-content decision uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, or `.asd/project/stubs.md`. Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-14 — Retrospective rows 010/011 re-verified against HEAD 62464ac

- **Decision**: 010 F-4 (quota failure suppressing the next dispatch) is closed as already satisfied. `external-record-failure` accepts status `quota` with a bounded retry-after (`.asd/runtime.js` 152-157), preflight returns `negative-cache` while that retry-after stands (`.asd/runtime.js` 144), and both review workflows call it (`asd-phase-impl-review.md` 1a, `asd-phase-design-review.md` 3a). Every other row is still unresolved and is carried as written, as follows.
  - 010 F-1 → AC-1: only `LEDGER_VOCABULARY`/`LEDGER_ROW_EXAMPLE` are published; `n_a` is validated (`runtime.js` 218-238) but has no published shape.
  - 010 F-2 → AC-2: `review-policy.md` 115 has only "immutable manifest" persistence; nothing covers orchestrator re-stamping.
  - 010 F-3 split → AC-3: `review-policy.md` 154 says "No size threshold".
  - 010 F-3 record → AC-4: interrupted attempts are logged (`review-policy.md` 146), but the re-dispatch payload does not carry them.
  - 010 F-5 → AC-5/AC-6: no tool-policy statement in `providers.md`/`core.md`; no pre-write check in `artifact-layout.md` "Agent memory".
  - 011 F-1 → AC-7: `git-strategy.md` 39 says "every path it authored" but never names agent-memory writes.
  - 010 P2/P3/P4/P5/P6 and 011 P1/P2/P3 → AC-3, AC-12, AC-8, AC-9, AC-10, AC-11, AC-12, AC-13: none present (no `emit` subcommand in `runtime.js` 276-298; no sizing in `asd-phase-plan.md`; no non-binding statement in `review-policy.md`; no derive rule in `code-style.md`; no lag note in `t_test-plan.md`; no flagged-choice clause at `asd-phase-impl.md` step 10; no settings-task path).
- **Rationale**: `sprint-lifecycle.md` "Orchestration and adaptive gates" requires re-verification before a retrospective row becomes an AC.
- **Affected docs**: `.asd/sprints/archived/010-agent-doc-economy/retrospective.html`, `.asd/sprints/archived/011-explicit-design-skip/retrospective.html`, `sprint.md`

## 2026-09-14 — Proposal selection and subsystem-file maintenance point

- **Decision**: The user selected three proposal groups: the rule-text edits (010 P4, P5, P6 and 011 P1), the manifest emitter with review-scope sizing (010 P2, P3 and 011 P2), and settings changes through `/asd-init` (011 P3). 010 P1 (agent-memory audit) was not selected. The subsystem Markdown files are written at `design-promote` and backfilled at `audit`.
- **Rationale**: The user answered at scope. Backfilling at audit reaches projects that were decomposed before this change, with no migration script and no placeholder files.
- **Affected docs**: `sprint.md` AC-3, AC-8..AC-13, AC-16

## 2026-09-14 — Audit normalization and design-block freeze

- **Decision**: `documents.audit: auto` freezes as `true`. Frozen `skip_design_phases` is `true`, and `prd`/`ux_spec`/`adr`/`c4` freeze as `false`. No document is suppressed by the skip, because config already disables all four.
- **Rationale**: The scope changes behaviour, contracts and gates, so it is not a mechanical scope.
- **Affected docs**: `state.json`

## 2026-09-14 — Scope revision 2: subsystems.md becomes the subsystem registry

- **Decision**: `docs/architecture/subsystems.md` is the subsystem registry and replaces `docs/architecture/c4/` in that role. When C4 is disabled, `c4/` is neither written nor created. The subsystem criteria are renumbered AC-14..AC-19, and the maintenance-point decision above now maps to AC-17.
- **Rationale**: This is the user's revision at the scope gate. The subsystem registry must not depend on the C4 setting.
- **Affected docs**: `sprint.md` Goal, AC-14..AC-19, Out of scope

## 2026-09-14 — Scope revision 3: mermaid diagram lives in subsystems.md

- **Decision**: In mermaid mode, the diagram is written straight into `docs/architecture/subsystems.md`. No `c4/` folder, `subsystems.yaml` or `architecture.html` is created, and `t_subsystems.yaml` is retired.
- **Rationale**: This is the user's revision at the scope gate. Mermaid mode then needs no file beyond the registry itself.
- **Affected docs**: `sprint.md` AC-16

## 2026-09-14 — Scope accepted

- **Decision**: The user accepted `sprint.md` revision 3 (AC-1..AC-19) at the hard scope gate.
- **Rationale**: An explicit `accept` was given after two revisions. Every criterion is new, and its cost is 0 iterations and 0 fix rounds.
- **Affected docs**: `sprint.md`, `state.json` gate_decisions

## 2026-09-14 — Audit accepted (adaptive)

- **Decision**: `audit.md` is accepted by the orchestrator under adaptive gates. BA was not dispatched.
- **Rationale**: The audit is findings only and stays inside the accepted scope, and Architect reported no product/domain ambiguity. The open architecture, migration and gate tradeoffs it raises are decided in plan: registry bootstrap without C4, the fate of consumers' existing `c4/`, the mermaid draft path, the settings-task gate, and the split threshold.
- **Affected docs**: `audit.md`, `state.json` gate_decisions

- 2026-09-14 — design/design-review/design-promote skipped (skip_design_phases enabled)

## 2026-09-14 — Plan inputs: registry bootstrap, legacy c4/ removal, settings-task approval

- **Decision**: Registry bootstrap:
  - When decomposition is enabled, `/asd-init` creates an empty `docs/architecture/subsystems.md`, and `design-promote` fills it.
  - If decomposition is already enabled but there is no registry, `audit` creates the registry and does the first fill.
  - Every subsystem added to the registry needs explicit user confirmation.

  A legacy `docs/architecture/c4/` that the new rules make redundant (C4 disabled, or mermaid mode) is deleted at `audit` after its content has moved to the registry. A plan task that declares a settings change is approved by plan acceptance; `/asd-init` then applies only the declared key/value pairs and shows the diff, with no second `accept-all`.
- **Rationale**: The user decided all three at the plan phase.
- **Affected docs**: `plan.md` Tasks 5 and 6

## 2026-09-14 — Split threshold value and partition shape (adaptive)

- **Decision**: The split threshold is a `.asd/runtime.js` constant of 25 scope files, applied when a manifest is emitted. A manifest above it is partitioned before its first dispatch into `ceil(files / 25)` disjoint parts in manifest order, never recursively. The existing trigger of two interruptions still halves a manifest that is below the threshold.
- **Rationale**: Sprint 010 evidence: a 56-file scope exhausted a whole dispatch, and a 21-file scope ran cleanly. An N-part partition closes the "above 2× threshold" gap that `audit.md` raised, without recursion.
- **Affected docs**: `plan.md` Task 2

## 2026-09-14 — `.asd/sprints/012-retro-010-011-subsystem-docs/plan.md` accepted

- **Decision**: The user accepted plan.md: 7 tasks in 5 waves, covering AC-1..AC-19. AC-3 is kept whole.
- **Rationale**: The user gave an explicit `accept` at the plan gate. There were no open stubs, so no stub decisions were needed.
- **Affected docs**: `plan.md`

## 2026-09-14 — Task 1 flagged choices resolved

- **Decision**: Accepted: step 11 also resolves a flagged choice in fix modes, and `suggested fix` is removed from the review-fix payload. Routed back and fixed in `2b5580a`: the non-binding sentence in `review-policy.md` "Verify before applying" is merged with the existing sentence, so the permission is stated once.
- **Rationale**: Choice 1 closes the audit risk "AC-11 — fix modes skip the gate". Choice 2 is what the plan asked for, and the reviewer files stay in the payload's context paths. Choice 3 would have left a duplicate statement that impl-review flags under the documentation-economy rule.
- **Affected docs**: `.asd/workflows/asd-phase-impl.md`, `.asd/rules/review-policy.md`

## 2026-09-14 — Wave 2 flagged choices resolved (Tasks 2, 3)

- **Decision**: All accepted. Task 3: the suite-record lag has its sole home in `sprint-lifecycle.md` "Impacted test set", and `t_test-plan.md` cites it. Task 2, choices 1-9:
  - a custom rule's id is its `--custom-rules` path;
  - sectioned rubrics use their `###` headings as both rule ids and section ids;
  - executable-by-default classification;
  - `.asd/templates/*.html` counts as UI surface;
  - the phase-gate predicate is assigned by name;
  - `no budgets defined` is allowed whenever there is no budgets heading;
  - the out-of-part predicate is generalised to N parts;
  - halving on interruption uses `emit-manifest --halve`;
  - emit fails closed on a missing predicate target or more parts than files.
- **Rationale**: Choices 1 and 2 follow the existing "Rubric ID derivation" text, where sectioned rubrics derive ids from `###` headings. Choices 3, 6 and 9 fail toward reviewing more. Choices 7 and 8 keep split halves emitter-produced, as AC-12 requires. The one red test, the stamp test at ~2461, is an expected break for impl-test to update. Release-manifest hashes were refreshed by the orchestrator after the wave.
- **Affected docs**: `.asd/runtime.js`, `.asd/rules/review-policy.md`, `.asd/rules/sprint-lifecycle.md`

## 2026-09-14 — Wave 3 flagged choices resolved (Tasks 4, 5)

- **Decision**: All accepted.
  - Task 4:
    - The attempt record goes into the payload only when the reviewer has one of its own.
    - The payload list is the single statement of that record.
    - Plan sizing lives only in `asd-phase-plan.md` step 4, via `## Risks`.
  - Task 5:
    - A settings change is applied when wave 1 opens.
    - A declared key is not validated against `t_config.yaml`.
    - No special adaptive-plan rule.
    - The frozen-vs-live nuance is stated.
    - No bullet in `asd-phase-plan.md`.
    - `asd-phase-impl` gets no `Skill` allowed-tools change, because the orchestrator session holds `Skill`.
    - `.asd/sync-state.json` is committed.
- **Rationale**: Each choice follows existing contracts or the plan's own wording. Validating keys against the template would reject the sprint-011 case this path replaces, and plan acceptance is the recorded approval.
- **Affected docs**: `.asd/rules/review-policy.md`, `.asd/workflows/asd-phase-plan.md`, `.asd/rules/sprint-lifecycle.md`, `.asd/skills/asd-init/SKILL.md`, `.asd/workflows/asd-phase-impl.md`

## 2026-09-14 — Wave 4 flagged choices resolved (Task 6)

- **Decision**: Accepted choices 1-4, 6, 8 and 9:
  - two templates, `t_subsystems.md` and `t_subsystem.md`;
  - the redundant legacy `c4/` is detected from live config, not frozen state;
  - the deletion also removes the orphaned `c4-build` and `.gitignore` entries, and the orchestrator performs it after the hard gate;
  - registry writes happen at audit step 3a;
  - re-init does not seed the registry;
  - `c4-full` is always a delta;
  - README rows go to Task 7.

  Choice 5 was decided by the user: leave as is. Audit fills only an absent registry, and an empty seeded registry is filled only at design-promote. Choice 7 was routed back: the legacy `c4/` deletion is added to the `checkpoints.md` hard list.
- **Rationale**: The user answered choice 5 explicitly. Choice 7 applies the rule that `checkpoints.md` "Gate policy" is the single home of hard gates. Choice 2 avoids deleting a live likec4 model when `skip_design_phases` forces frozen c4 to false. Choice 3 closes the orphan migration gap raised in audit.
- **Affected docs**: `.asd/rules/sprint-lifecycle.md`, `.asd/rules/checkpoints.md`, `.asd/workflows/asd-phase-audit.md`

## 2026-09-14 — impl assessment approved (adaptive)

- **Decision**: Initial impl is accepted at HEAD 3c800d3: Tasks 1-7 are complete, the build (`sync.js --check`) and lint are clean, the authorised-paths check passed, and no stubs were added. The sprint advances to impl-test.
- **Rationale**: Every flagged choice is resolved (entries above), so no material alternative is open. The one red test, the manifest-digest stamp assertion, is stale after AC-1 added `n_a_shape`; impl-test owns updating it.
- **Affected docs**: `plan.md`, `state.json` gate_decisions

- 2026-09-14 — impl-test: impacted set green (full suite via safety valve, 197/197; sync --check 72/72 current), 10/0 tests added/removed (6 updated in place incl. sprint-008 split test rewritten for emitter-produced parts)

## 2026-09-14 — impl-review iter-01: CONCERNS → impl review-fix

- **Decision**: Verdicts are correctness, efficiency, testing and external CONCERNS. Documentation has no verdict: its merge is blocked by union property (c). Every internal part ledger passed `validate-ledger`, and no reviewer returned FAIL. Findings are routed to impl review-fix (`review_fixes_pending=iter-01`), with these dispositions:
  - Excluded, by existing user authorization: COR-1-1 and external #1 (audit filling an empty seeded registry). The user decided "leave as is" for exactly this case (entry "Wave 4 flagged choices resolved").
  - Invalid under the change-surface rule: external #3. Its cited line in `t_prompt-external-design.md:97` dates from the initial commit and was not made incorrect by this sprint.
  - Duplicates merged: COR-2-1 into COR-1-2; DOC-2-1 and external #4 into COR-2-2; DOC-2-2 into COR-2-4.
  - Dev chain, in order: EFF-1-1, ORC-1, EFF-2-1, DOC-1-1, DOC-2-4, COR-2-4, COR-2-2, COR-2-3, COR-1-2, COR-1-3, external #2, DOC-1-2.
    - ORC-1 is orchestrator-observed: `emit-manifest` authorises no scope-derived `n/a`, such as no user-facing HTML in scope or PRD/ADR disabled. Every part of a split therefore marks such rubric ids out-of-part, which makes union (c) fail by construction. Sprint 011's hand-built manifests authorised these predicates.
  - Tester chain, after the dev chain: TST-1-1, TST-1-2, TST-1-3, TST-2-1, TST-2-2, DOC-2-3.
- **Rationale**: Every remaining finding is CONCERNS within scope. None requires escalation, since each is a deletion or a clarification with no new abstraction.
- **Affected docs**: `reviews/impl/iter-01/`, `state.json`

## 2026-09-14 — impl review-fix for iter-01: findings resolved

- **Decision**: The dev chain resolved all 12 fix-set findings (`de7d9f9..686b03e`) and the tester chain resolved all 6 test-file findings (`f3238d5`). Build (`sync.js --check`) and lint are clean, the authorised-paths check passed, and the suite is 197/197.
  - Accepted flagged choices from the dev chain:
    - ORC-1: a single `noHtml` path predicate covers `HTML shell wrapping`/`Provenance`/`Traceability`. `Template adherence` is not covered. With `scoped_fan_out: disabled`, a split scope without UI or executable files can still fail union (c) for the UI/perf ids; that edge is left as the existing escape-hatch semantics.
    - The `--files` list is written to a scratch file outside the repo.
    - COR-1-3 rejects keys not present in `t_config.yaml` and checks values only for enumerated fields, so legacy values are rejected.
    - The remaining subtasks of a settings-change task dispatch in wave 1 after `asd-init`.
  - Accepted flagged choices from the tester chain:
    - three redundant asserts pruned (reasons in `test-plan.md` row 22);
    - the AC-13 order check is anchored on `delegate to \`asd-dev\``;
    - a note added to the tester's memory.
  - The tester chain appended `test-plan.md` Entry log row 2, covering the review-fix delta.
- **Rationale**: Every premise verified at HEAD, and each choice stays within the finding it fixes.
- **Affected docs**: `.asd/runtime.js`, rule docs, workflows, reviewer/architect agents, `asd-init`/`asd-sprint`, `tests/run.js`, `test-plan.md`

- 2026-09-14 — impl-test: impacted set green (full suite via safety valve, 197/197; sync --check 72/72 current), 0/0 tests added/removed (entry 3, delta since entry 2)

## 2026-09-14 — impl-review iter-02: CONCERNS → impl review-fix

- **Decision**: Verdicts: efficiency and testing APPROVE (both latched at 2); correctness, documentation and external CONCERNS. Every internal ledger passed `validate-ledger`. There was no split (22 files), and there is no FAIL. Routed to review-fix (`review_fixes_pending=iter-02`).
  - Duplicates merged:
    - COR-1 = DOC-1 (correctness-memory half) = external #2.
    - DOC-2 = external #3.
  - Dev chain, in order:
    - COR-2 (widen the settings-change placement so a declared key added by a same-sprint Task is allowed; validate against the working-tree `t_config.yaml` when the settings wave opens). This reverses the orchestrator's acceptance of dev choice COR-1-3 in "impl review-fix for iter-01", which had silently contradicted "Wave 3 flagged choices resolved". AC-13 is not narrowed.
    - external #1 (type/shape validation for un-enumerated boolean/integer fields in sprint-mediated step 2).
    - DOC-2.
  - Memory chain: DOC-1/COR-1 goes to the owning agents only. `asd-reviewer-correctness` fixes `feedback_review-method-no-shell.md` and `asd-reviewer-testing` fixes `feedback_no-shell-review-method.md`, each within its own memory directory (`artifact-layout.md` "Agent memory"; a dev may not write another agent's memory). The orchestrator commits both, per `git-strategy.md` "Commit before review".
  - Root cause of DOC-1: the orchestrator's own payloads instructed `git diff` runs (friction F-4). From this point on, reviewer payloads carry the diff range as data, with review from reads, never as a command to run.
- **Rationale**: Every finding is within scope and CONCERNS, with no new abstraction. Iteration 3 floor is `high`.
- **Affected docs**: `reviews/impl/iter-02/`, `state.json`
