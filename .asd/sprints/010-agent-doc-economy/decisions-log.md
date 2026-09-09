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

## 2026-09-09 — Scope expanded: AC-10, the authoring side of the documentation-economy rule

- **Decision**: The user requires the documentation rule to reach agents for authoring as well as review. Added `AC-10` to `sprint.md` and `Task 13` to `plan.md`, alone in a new wave 9 as a contract-changing task. Verified state before adding it: `artifact-layout.md` is in every role row of `providers.md` "Role-scoped context", so the rule is readable by every creator and reviewer, and the review side is closed through the documentation reviewer's rubric bullet into the blocking coverage ledger. What is missing is the authoring obligation — `code-style.md` §1's proactive-authoring instruction names only the SSoT iron rule, and `code-style.md` reaches neither `asd-ba` nor `asd-ux`, both of which author agent-facing text under this sprint's accepted wider scope.
- **Rationale**: A rule an agent may read but is never told to apply while writing is enforced only after the fact, one review iteration later, which is the expensive path this sprint exists to shorten. The user's request is the authority for the scope change; the criterion is stated so that reach, not wording, is what gets verified. Audit reevaluation after the expansion leaves `documents.audit` unchanged at true.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/sprint.md` (AC-10), `.asd/sprints/010-agent-doc-economy/plan.md` (Task 13, wave 9), `.asd/sprints/010-agent-doc-economy/state.json`

## 2026-09-09 — D-1 routed back to impl, carried in the same round as Task 13

- **Decision**: `impl-test` returned defect `D-1` — `.asd/sync.js` guards the new Claude `effort` validation behind `if (c.model)` while the field itself is emitted on its own condition, so canon declaring `effort` without `model` renders an unvalidated value into the generated view. Latent today, since all eleven agents declare both. The sprint re-enters `impl`, and D-1 and Task 13 are dispatched as one ordered chain to one agent rather than as two rounds: both are single-agent-sized, they do not collide, and one agent holding both is what stops a later edit contradicting an earlier one it never saw.
- **Rationale**: D-1 is the exact silent-ignore failure C-10 was meant to close, so leaving it is leaving AC-9 half-delivered. Carrying Task 13 in the same chain is a deviation from the fix-mode contract, which scopes a round to its `D-N` rows; it is recorded here rather than taken silently.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/test-plan.md` (`D-1`), `.asd/sprints/010-agent-doc-economy/state.json`

- 2026-09-09 — impl test-fix: defect D-1 resolved (`.asd/sync.js`, commit 7501224); Task 13 completed in the same chain (commit b81fd7e). Suite 177/177. AC-10 verified closed on both sides: every role row that authors persisted text grants `artifact-layout.md`, and the Documentation reviewer is a required reviewer in both review phases with the economy rubric bullet carrying no phase qualifier and no authorized `n/a` predicate in design-review.
- 2026-09-09 — correctness interrupted attempt 1 (host 50-turn limit, no verdict token, no ledger)
- 2026-09-09 - external interrupted attempt 1 (agent returned with its codex subprocess still running in background; no verdict and no availability skip, so an interrupted dispatch per external-review.md "Outcome contract")

## 2026-09-09 — impl-review iteration 1: five CONCERNS, routed to impl review-fix

- **Decision**: Every reviewer returned CONCERNS, so reviewer DoD is not met and the sprint routes to `impl` review-fix mode; the terminal full-suite gate is skipped. `review_fixes_pending = "iter-01"`. No reviewer latches — a latch requires a bare APPROVE, and none was returned. Consolidated fix set, deduplicated across reviewers: `.asd/sync.js` dead fourth argument (EF-2 = EX-1) and the truthy `effort` guard (CR-2 = EX-4); `asd-phase-impl.md` missing `run command` grant for the step-9 diff gate (CR-1 = EX-3); the `Never cut` gap and the three tests being independently sufficient (EX-2); the E-1 collapse's surviving restatements plus the `row_example` paragraph and the efficiency agent's own duplicates (EF-1); the documentation rubric's inline copy of the cut list (DOC-1) and residual intra-file restatement across six agent files (DOC-2); an agent-memory tell that names an out-of-policy command (EX-5); plan bookkeeping for Task 13 (CR-3); and `validateCoverageLedger` silently degrading a malformed `n_a` instead of rejecting it, recorded as `D-2` (T-1b). The tester's own items — T-1a, T-2, T-3 — belong to the following `impl-test` entry, not to this dev round.
- **Rationale**: Three of the five internal ledgers could not be validated, for two orchestrator defects recorded as F-1 and F-2, not for anything the reviewers did. Their verdicts are therefore not counted toward DoD, but their findings do not depend on a ledger and are carried into the fix set on their own evidence; all five reviewers are re-dispatched fresh next iteration against corrected manifests, which the clean-context rule requires regardless. The routing outcome is unchanged either way: `efficiency`'s validated CONCERNS and External Review's ledger-exempt CONCERNS each independently block DoD. EX-2 is the round's most consequential finding — it is the one that says the rule this sprint landed can authorise cutting a gate or ownership obligation — and it is ordered first in the chain.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/reviews/impl/iter-01/*`, `friction-log.md` (F-1, F-2, F-3), `test-plan.md` (`D-2`), `state.json`

- 2026-09-09 — external attempt 1 delivered a completed verdict before its replacement returned; attempt 2 is the dispatch of record. Both CONCERNS, routing unchanged. Attempt 2 sharpened the rule finding (EX-6) and added EX-7, a category in the cut list that authorises deleting standalone safety and authority prohibitions. Both are folded into the fix set.

- 2026-09-09 - impl fix for iter-01: findings resolved (EX-1..EX-7, CR-1..CR-3, EF-1, EF-2, DOC-1, DOC-2, D-2). One DOC-2 item deliberately not applied: asd-advisor.md:22 survives because request-user-decision is frontmatter-gated only on Claude, not on Codex, so the removal test fails under the rule corrected in the same round.

- 2026-09-09 - external review skipped at impl-review iteration 2: quota exhaustion on the wrapped Codex CLI, recorded against the preflight fingerprint with a bounded retry-after. Satisfies DoD for this iteration, creates no latch, recorded as friction F-4 per AC-4.

## 2026-09-09 — impl-review iteration 2: one APPROVE, one availability skip, three CONCERNS

- **Decision**: Verdicts recorded for `iter-02`: `correctness` bare APPROVE (latched at iteration 2), `external` `APPROVE (skipped: ...)` on quota (satisfies DoD, never latches), `efficiency`, `testing` and `documentation` CONCERNS. Every ledger validated this iteration. Unresolved findings route the sprint to `impl` review-fix mode; `review_fixes_pending = "iter-02"`. Fix set: EFF-1 and DOC-1 are the same defect found by two reviewers — "not restated here" declarations that are false at HEAD across `review-policy.md` and both review workflows — and are fixed by narrowing the declarations, never by deleting the literals they mis-describe; DOC-2, the one agent file the previous round's restatement cut skipped, including a drifted copy of the nitpick drop list; TST-01, the agent-memory bijection test whose hardcoded directory array no longer spans the directories this sprint writes; EFF-2, duplication and superseded procedure inside `asd-tester-critical`'s own memory. DOC-3 is deferred with a recorded reason.
- **Rationale**: Ownership decides the routing. DOC-1 and DOC-2 are canon text and go to a dev. TST-01 is a test file and EFF-2 is `asd-tester-critical`'s own memory, so both go to the tester — a dev editing another agent's memory would violate the ownership rule this sprint tightened. DOC-3 concerns `asd-external-review`'s memory, and that agent is quota-blocked this iteration (F-4); its file is inert until that agent is next dispatched, and the finding is re-raised automatically at the next iteration that reaches it, so deferring costs nothing and hand-editing it would breach the same ownership rule. Both reviewers agree the corrected economy rule itself needs no further change — every remaining finding is residual application.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/reviews/impl/iter-02/*`, `friction-log.md` (F-4), `state.json`

- 2026-09-09 - impl fix for iter-02: findings resolved (EFF-1/DOC-1 by narrowing the false declarations, DOC-2, plus the companion cut and one below-floor citation). Tester chain resolved TST-01 and EFF-2. TST-01 was fixed by deriving the agent-memory directory set from the agent roster rather than extending the hardcoded list the finding named - a hardcoded list is what failed. DOC-3 deferred: its owning agent is quota-blocked and no other agent may write that memory.

## 2026-09-09 — impl-review iteration 3: three APPROVE, two high CONCERNS

- **Decision**: Verdicts for `iter-03`: `correctness` inherited APPROVE (latched at iteration 2, not dispatched), `efficiency` and `testing` bare APPROVE and now latched, `documentation` CONCERNS with two high findings, `external` `APPROVE (skipped: ...)` — its negative cache was still active on quota at dispatch time, the same cause as F-4. Every dispatched ledger validated. `review_fixes_pending = "iter-03"`. Fix set: DOC-1, two declarations still false at HEAD — the impl-review workflow's clean-worktree precondition restates the trigger and timing its home owns, and `review-policy.md`'s "Sole statement of this claim" is contradicted by three acting sites and a rule doc — and DOC-2, `asd-external-review`'s memory contradicting canon.
- **Rationale**: DOC-1 is the same defect class the previous round was dispatched to close, surviving in two sites that round did not touch, which is why both reviewers now rate it high rather than medium. DOC-2 is owner-only: no agent but `asd-external-review` may write that memory. Its preflight now returns `local-ready` again, so the owner can be dispatched rather than the finding deferred a second time. The orchestrator's own instruction caused the defect, recorded as friction F-5.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/reviews/impl/iter-03/*`, `friction-log.md` (F-5), `state.json`

- 2026-09-09 - impl fix for iter-03: findings resolved (DOC-1 both halves by narrowing the declarations; DOC-2 by its owning agent, which also found the same rationalization in a second memory file of its own and corrected both).

- 2026-09-09 - impl-test entry 5 raised D-3 and D-4, two canon citations whose target headings were renamed in an earlier release and never retargeted. Routed to impl test-fix rather than deferred: both live in files this sprint edited, so they are inside its change surface even though outside the last round increment, and the sweep that found them is this sprint own deliverable.

- 2026-09-09 - impl test-fix: D-3 and D-4 resolved at ac3073a. The dev flagged two consequences of emptying the pinned list rather than acting on them, both being test text: the zero-tolerance tier no longer adds coverage over the general tier while the list is empty, and one clause of the assertion message now describes an unreachable failure mode.

## 2026-09-09 — impl-review iteration 4: two high CONCERNS, both in agent memory's blast radius

- **Decision**: Verdicts for `iter-04`: `correctness`, `efficiency` and `testing` inherited APPROVE (latched, not dispatched), `documentation` CONCERNS with one high finding, `external` CONCERNS with one high finding. Both ledgers that exist validated. `review_fixes_pending = "iter-04"`. Fix set: DOC-1, `asd-external-review`'s memory still presenting the retired rendered-diff transport as the live compliant pattern while canon declares the scope manifest the only payload; and EXT-1, `review-policy.md`'s narrowed sole-statement claim still false because a reviewer's memory file restates both halves it denies. EXT-1 is resolved on the canon side alone — narrowing the declaration so it is true makes the memory restatement harmless, without editing another agent's memory or widening a guard for a claim that no longer over-reaches.
- **Rationale**: External Review independently verified all seven of its iteration-1 findings as resolved and states the corrected economy rule has no remaining path to authorise cutting load-bearing text — the sprint's central deliverable is sound. What has not converged is the false-declaration class, and both reviewers point at the same reason: EXT-1 is its sixth instance and sits in agent memory, which the Efficiency reviewer already identified at iteration 2 as a per-dispatch read surface that the AC-8 corpus never covered. Chasing the class file by file inside this sprint is unbounded; a systematic audit of `.claude/agent-memory/**` under the economy rule belongs to a follow-up sprint and is recorded for the retrospective rather than opened here.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/reviews/impl/iter-04/*`, `state.json`

- 2026-09-09 - impl fix for iter-04: findings resolved. EXT-1 fixed on the canon side alone by bounding the declaration to canon and naming agent memory as outside its reach, so no other agent memory needed editing and no guard needed widening. DOC-1 fixed by its owning agent, which also resolved a recorded doubt rather than carrying it forward. One companion canon edit: the external reviewer file said "no file writes at all" while its own frontmatter grants memory writes - now carries the carve-out; the four internal reviewers were checked for the same ambiguity and are already correctly scoped.

## 2026-09-09 — impl-review iteration 5: reviewer DoD met, every reviewer APPROVE

- **Decision**: Verdicts for `iter-05`: `correctness`, `efficiency` and `testing` inherited APPROVE from their latches; `documentation` and `external` both returned bare APPROVE and now latch. No finding at the `critical` floor from either. Reviewer DoD is met, so the phase proceeds to its terminal full-suite gate — the sprint cycle's one unscoped run.
- **Rationale**: The convergence is evidenced rather than assumed. Findings ran 13, then 6, then 2, then 2, then none; every one of External Review's seven iteration-1 findings was independently verified resolved at iteration 4; and the false-declaration class, which produced six instances across five sites in three rounds, was closed at its source this round — both reviewers swept the corpus for a seventh instance independently and neither found one. Documentation additionally confirmed the corrected economy rule adds a case distinction without loosening the prohibition it qualifies, and that both provider views and the manifest moved with the canonical body.
- **Affected docs**: `.asd/sprints/010-agent-doc-economy/reviews/impl/iter-05/*`, `state.json`

- 2026-09-09 - terminal full-suite gate green at d76482b: 184/184, exit 0; sync --check 72/72 current; lint clean. Reviewer DoD plus a green full suite completes impl-review to retro.
