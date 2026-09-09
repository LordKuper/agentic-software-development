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

## 2026-09-09 — Retrospective-derived criteria re-verified against HEAD 28343c32899cbdf639404084c3001c688d325132

- **Decision**: All nine sprint-009 retrospective actions carried into sprint 010, two of them narrowed. Row-by-row outcome at the verified HEAD: F-1 (wave ordering for contract-changing tasks) — unresolved, no wave concept in `sprint-lifecycle.md` plan format or `asd-phase-plan.md`. F-2 (whole-tree git commands) — PARTIAL: `git-strategy.md` line 39 already bans `git add -A`/`-u` and `commit -a` for a dispatched agent, so the criterion is narrowed to the uncovered half — `git add --renormalize` and `git stash` are unnamed, and no rule ties any of them to "no sibling dispatch in flight" or reaches the orchestrator. F-2b (consumer mirror) — unresolved, `custom-coding-rules.md` carries no staging rule. F-3 (memory-commit owner) — PARTIAL: the same line covers a dispatched reviewer's agent-memory writes because a reviewer holds no commit tool; the concurrent co-author case the retrospective identified is uncovered, so the criterion is narrowed to it. F-4 (availability skip as friction entry) — unresolved, `external-review.md` contains no occurrence of "friction". F-5a (fail-first mutation restored) — unresolved, `code-style.md` §17 requires the fail-first proof but says nothing about restoring the mutation. F-5b (fix-round-exit diff read) — unresolved, `asd-phase-impl.md` contains no diff step. F-6a (ledger enforcement split) — unresolved, the enforcement paragraph still routes every invalid ledger to reject-and-re-dispatch as one case. F-6b (row shape example in manifest) — unresolved, the manifest carries `vocabulary` but no row-shape example, and `runtime.js` exports none.
- **Rationale**: `sprint-lifecycle.md` "Orchestration and adaptive gates" requires every retrospective-derived row to be checked against current `HEAD` before it becomes an `AC-N`, because a retrospective states what was true at the HEAD that produced it. Evidence for each row above is a grep over the named target file at that sha.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/sprint.md` (AC-1 … AC-6), `.asd/sprints/archived/009-retro-008-remediation/retrospective.html`

## 2026-09-09 — Audit phase runs (documents.audit: auto → true)

- **Decision**: `documents.audit: auto` normalizes to running the audit for this sprint; `state.json.documents.audit` frozen to `true`.
- **Rationale**: `auto` skips only a complete, verifiably mechanical scope with no behaviour, contract, migration or gate impact. This scope changes the dispatch contract (AC-1), the staging and commit-ownership contract (AC-2, AC-3), the review enforcement contract (AC-6), and adds a rule the documentation reviewer enforces (AC-7) — none of it mechanical.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/state.json`

## 2026-09-09 — Sprint 010 scope accepted

- **Decision**: The user accepted `sprint.md` AC-1 … AC-9 unchanged at the hard scope gate.
- **Rationale**: The initial scope gate is hard in both policy modes because it establishes the authority the adaptive policy later reuses. Per-criterion cost was stated before the decision: 0 iterations, 0 fix rounds for every criterion, this being a new sprint.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/sprint.md`, `.asd/sprints/010-agent-doc-economy/state.json`

## 2026-09-09 — Audit accepted, three audit-surfaced ambiguities resolved by the user

- **Decision**: `audit.md` accepted. G-6: AC-7's rule covers framework canon AND every artifact a later agent reads (`audit.md`, `plan.md`, `decisions-log.md`, `test-plan.md`, review files, retrospectives), so the constraint reaches consumer projects through the artifact templates. E-1: the review-workflow duplication is in scope for this sprint, to be resolved rather than deferred. G-8: the sprint defines a minimal evidence standard — bytes of rule text read per dispatch, derived from the role-scoped context table — and uses it to justify reducing what a dispatch reads; model and effort tiers are still not retiered, per `sprint.md` "Out of scope".
- **Rationale**: All three change what the sprint delivers and what ships to consumers, so none could be taken adaptively. G-6's wider reading matches the user's original scope wording, which named process artifacts alongside rules and specs. E-1 is the single largest item in the corpus survey and the one whose deferral would leave the sprint's headline finding unaddressed. G-8 converts an unmeasurable criterion into a measurable one without touching the tier matrix.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/audit.md` (G-6, G-8, E-1, R-4, R-10), `.asd/sprints/010-agent-doc-economy/state.json`

## 2026-09-09 — claude-api skill run at the audit gate, G-11 closed

- **Decision**: The orchestrator ran the claude-api skill the audit dispatch could not reach, producing C-10 (Claude `effort` is unvalidated in `sync.js` while the Codex counterpart is validated against a vocabulary — a typo ships silently and the agent runs at the host default while canon, the tier matrix and README claim otherwise), C-11 (`xhigh` exists between `high` and `max` and is unused in ASD's Claude tiers; recorded against G-8, not proposed) and C-12 (model aliases confirmed clean, no dated ids in canon). G-11 is closed with no unclosed input.
- **Rationale**: Sprint scope named the skill explicitly. The subagent had no Skill tool, so the input would otherwise have been recorded as excluded; the orchestrator holds the skill and closing the gap cost one dispatch.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/audit.md` (C-9 … C-12, G-11)

- 2026-09-09 — design/design-review/design-promote skipped (no documents enabled)

## 2026-09-09 — Sprint 010 plan accepted; E-1 resolved by reduction to pointers

- **Decision**: `plan.md` accepted: twelve tasks in eight waves, with AC-1 applied to this sprint itself — Task 1 lands the wave-ordering rule and is dispatched alone before any task that would otherwise run under the old rule, and Tasks 2, 5, 6 and 8 each hold their wave as the other contract-changing tasks. E-1 is resolved by deleting from both review workflows what `review-policy.md` already owns, not by hoisting the shared text into `review-policy.md` and not by inventing a shared workflow fragment.
- **Rationale**: Both workflows already declare `review-policy.md` the sole SSoT for that material and then restate it, so the reduction removes a contradiction rather than relocating text. Hoisting would grow the one file every reviewer reads in full on every iteration, worsening the very cost finding (C-4, C-5) the sprint exists to address; a shared fragment would be a new abstraction with no second use case, needing Complication Approval, and Codex supports no imports. No stub decisions were required — `.asd/project/stubs.md` has no open rows.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/plan.md`, `.asd/sprints/010-agent-doc-economy/audit.md` (E-1, R-4)

## 2026-09-09 — Task 10 applied E-1 … E-23; five findings applied in part, each with its reason

- **Decision**: Every AC-8 finding is applied except where a pinned literal or a reach argument blocks it, and those five are recorded here rather than left silent. E-15: `design-principles.md` §10's proactive-checklist sentence stays — `providers.md` "Role-scoped context" gives no design creator `code-style.md`, so a pointer there would make the rule unreachable in design; only the duplicated `critical`/undroppable claim (owned by `review-policy.md`'s checklist headers) was cut. E-10 `--no-verify` in `asd-dev.md`: `tests/run.js:3324` pins that grant's literal wording (which names `--no-verify`) at the Tool-policy site, so the duplicate was removed from the Don'ts list instead. E-5: four annotations keep extra qualifier text because `tests/run.js:2999`/`:3371`/`:3046` pin them verbatim. E-4: `asd-external-review.md`'s write prohibitions stay — it holds `Bash` (the sole carve-out among reviewers), so they are not config-enforced and fail the enforcement test. E-22 is applied as one section-scope sentence under the `providers.md` role table, never as a trim of `artifact-layout.md` "HTML shell wrapping".
- **Rationale**: The iron rule's *Never cut* list and `audit.md` R-1 bound every deletion, and `tests/run.js` pins prose the suite treats as contract; where the two collide the literal wins and the finding is applied around it. E-5's two surviving forms are the citing-side stem `not restated here` and the owning-side stem `sole statement of <X>`, the latter chosen because `tests/run.js:3046` already pins one instance of it. Consequence for Task 11: `AGENTS.md`/`t_AGENTS.md` now hold a pointer, not a rule-doc list, so its planned mirror test must assert the pointer rather than a copied list.
- **Affected docs**: `.asd/rules/{artifact-layout,core,design-principles,design-system,external-review,git-strategy,providers,review-policy,sprint-lifecycle}.md`, `.asd/agents/*.md`, `.asd/workflows/asd-phase-{impl,impl-test,impl-review,design-review,plan,retro}.md`, `.asd/skills/asd-phase-*/SKILL.md`, `.asd/skills/asd-{sprint,sync}/SKILL.md`, `.asd/templates/{t_AGENTS,t_friction-log,t_manual-steps,t_plan}.md`, `.asd/release-manifest.json`, `AGENTS.md`, `.asd/sprints/010-agent-doc-economy/plan.md`

## 2026-09-09 — Impl assessment approved

- **Decision**: All twelve tasks COMPLETED across eight waves; impl assessment approved and the sprint advances to impl-test. AC coverage: AC-1 (T1), AC-2/AC-3 (T2), AC-4 (T7), AC-5 (T4 and T6), AC-6 (T3 and T5), AC-7 (T8), AC-8 (T9), AC-9 (T10, T11, T12). No stubs introduced, no manual steps. Two items carry forward to impl-test as tester-owned work: the failing assertion at `tests/run.js:2450`, which pins the manifest field set as it was before AC-6b stamped a second constant, and the rule-doc-list mirror assertion (`audit.md` G-12) reassigned off Task 11.
- **Rationale**: The impl completion gate is build and lint, plus the diff check this sprint's own Task 6 added: `node .asd/sync.js --check` exit 0, `git diff --cached --check` clean, and the round's diff confined to canon the sprint authorised, the provider views regenerated from it, agent memory, and the sprint's own artefacts. The suite stands at 170/171 and that is the correct state to leave impl in — the one failure encodes the pre-AC-6b contract, and the only implementation that keeps it green forfeits AC-6's "beside `vocabulary`" requirement. A dev writes no tests, so both items belong to `asd-tester`.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/plan.md`, `.asd/sprints/010-agent-doc-economy/state.json`
