[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"333abadf087a4b198166baee7ba37e70972515f912f287a7b6d63b67c7ba0759","findings":[],"files":[{"i":".asd/agents/asd-reviewer-combined.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_codex-invocation.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/project_020-workflow-definition-keys.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_workflow-definition-sprints.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```

Iter-01 findings re-verified against the incremental diff (`eca23c748ae6fcce.diff`):
- Correctness 1 (AC-6 lite resume stuck) — resolved: `.asd/skills/asd-sprint/SKILL.md` step 2B now scopes both the re-run menu and the resume exception "(`standard` only …)", so a `lite` sprint resumed at design-promote re-enters design-promote (emits `NEXT: retro`) instead of dispatching `plan`; agrees with the hook's `phases.includes('design')` gate. The new AC-6 test in `tests/run.js` pins every collapse clause to exactly the workflows whose phases include design.
- Correctness 2 (AC-3 tester AC source) — resolved: `.asd/agents/asd-tester.md` Inputs gains the lite `sprint.md` clause; a new AC-3 test sweeps every agent Inputs line reading `docs/product/requirements/`.
- Correctness 3 (AC-9 skip persistence) — resolved: the External availability skip is persisted through `persist-review` in review-policy.md "Coverage ledger" Persistence, the `external-review.md` skip bullet, design-review step 9 and impl-review step 8. Runtime: `APPROVE \(skipped: .+\)` is accepted for `external` only and bypasses the table parse (`findings` = `[]`); `external` is in both rosters so `reviewerKeys` admits it — the skip now yields an `external.findings.json` the AC-8 route can read.
- Correctness 4 (README persistence sentence) — resolved.
- External 1 (bare APPROVE listing findings) — resolved: `runtime.js:514` `fail('APPROVE verdict lists findings')`; consistent with review-policy.md "Verdict format" (APPROVE = no issues at/above floor). The skip form returns `[]` before this check and a `—` placeholder row is still filtered. Refusal-case test added.
- External 2 (lite Persistent actuality) — resolved: `asd-reviewer-combined.md` adds a "Persistent actuality before promotion" bullet scoping judgment to this sprint's diff for docs design-promote step 4 writes; step 4 of `asd-phase-design-promote.md` is indeed the lite creator-write step.

Runtime/hook refactors traced — behaviour-preserving where intended:
- `session-start.js` collapsed archived-sprint filter is equivalent (skip when chain resolved and phase outside it, or phase `done`; unresolvable definition drops only the chain check). New 780/781/782 fixture pins all three branches.
- `loadWorkflow`/`reviewerKeys` `dir` removal: the only external caller (`tests/run.js:2864`) never passed it.
- `standingPredicates`: `Object.fromEntries(Object.keys(composed).map((name, i) => [name, rubrics[i].rules]))` key/index pairing holds because `rubrics = Object.values(composed).map(rubricIds)` iterates in the same order; the whole composed Documentation part gets the n/a when a combined manifest has no docs in scope (replacing the hand-listed `NA_TARGETS.docs` ids); a combined rubric without a documentation part fails closed. Matches the agent's "Conditional Documentation rubric" and AC-4.

No-finding checks:
- Test-plan reach: the narrowed `artifact-layout.md` "Test plan" wording (in-place tester "same reach", reports anything outside it unfixed) keeps an exit — an unfixed report routes the iteration to review-fix (review-policy.md "Low-severity test-only findings") where the next `impl-test` owner can fix a row outside the grant; no deadlock.
- Release manifest: `canon_hashes`/`upstream_hashes` rows changed for exactly the edited canon files (combined + tester agents, hook, four rules, `runtime.js`, asd-sprint skill, both review workflows). Hash values not recomputed (no shell) — structural check only; impl-test entry 3 recorded the full suite green 246/246.
- Security: workflow-name guard `^[a-z]+$` unchanged in runtime and hook; the name-guard test case now targets a real resolvable path (`../workflows/lite`).

AC coverage trace (`sprint.md`): AC-1/AC-2 unchanged since iter-01, covered. AC-3 now fully covered incl. tester. AC-4 covered (combined composition, docs-conditional n/a, actuality carve-out). AC-5 covered; promote inputs (`audit.md`) now agree across rule and acting sites, pinned by a new test. AC-6 now fully covered. AC-7 covered (README mirrors, manifest hashes). AC-8 covered. AC-9 now fully covered incl. the skip path.

No decisions-log/friction-log gap deferred to impl-review; F-5 (host delivers the return in context, not a file) is already absorbed by step 7's temp-file write.

## Verdict
APPROVE

## Next action
None for correctness — latch APPROVE for wave-1. This dispatch wrote one memory file the orchestrator must commit per git-strategy.md "Commit before review": `.claude/agent-memory/asd-reviewer-correctness/reference_persist-review-return-shape.md` (+ its index line in `.claude/agent-memory/asd-reviewer-correctness/MEMORY.md`).

## Escalations (optional)
- none
