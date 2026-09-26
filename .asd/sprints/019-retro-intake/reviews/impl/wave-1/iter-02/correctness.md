[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | medium | `.asd/rules/review-policy.md:91` (Memory-fix dispatch, now naming "test-fix `D-N`" explicitly); `.asd/workflows/asd-phase-impl.md:56` (test-fix memory `D-N` routing, pending-row collection) and `:77` (test-fix instruction: the fixing agent "set[s] the defect row `Status` to `fixed`"). **AC-14** | This iteration routes a memory `D-N` to the owner's memory-fix dispatch but still names nobody who flips that row's `Status` to `fixed`. The test-fix instruction gives that write to the fixing agent. Here the fixing agent is a reviewer owner, whose declared tool policy (`providers.md:113`, `review-policy.md` "Gate Verdict Format") limits it to its own memory directory, so it cannot touch `test-plan.md`. On the MEMORY-FIX fallback the orchestrator applies the text, and it holds no `test-plan.md` grant either. If nobody flips the row, it stays `pending`, and the next test-fix round's "collect every `D-N` with status `pending`" sends the already-fixed memory defect out again. This sprint already hit it: friction-log F-2 records the orchestrator's ungranted write that set D-1/D-2 to `fixed`. | Add one clause to the Memory-fix dispatch sentence at `review-policy.md:91`: for a `D-N`, the orchestrator also sets that row's `Status` to `fixed` with the commit sha in `test-plan.md`. Mirror it in the `test-fix` bullet of impl step 3 (or cite it from step 6's test-fix instruction), and add `test-plan.md` for this case to step 9's authorised-paths list. |

## Coverage (internal reviewers only)

```json
{"manifest_digest":"804e60d9c0224792fb58dc6022afb5003c82e75b562d9796bf0b26bc0efe9168","findings":["COR-1"],"files":[{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/feedback_check-host-claims-against-own-dispatch.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/project_reviewer-write-scope-declaration.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"finding","f":"COR-1"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"reviewed"}]}
```

Section notes:
- **iter-01 fixes verified on disk:**
  - COR-1 fixed as answer (b), across every site.
  - COR-2 through COR-7 fixed.
- **Bugs:** `retroCandidates` deferred rows now come from the retro, and a deferred row of the latest retro is offered exactly once. A missing deferred sprint dir throws a raw ENOENT; this predates the iteration and is covered by COR-5's exit branch, so it is not raised.
- **Security:** no new input paths.
- **AC trace:** AC-1..AC-17 are met; AC-14 carries the COR-1 caveat.
- **Below floor (low, not raised):**
  - Reviewer bodies do not mention the memory-fix mode.
  - A review-fix tester removal row has no stated pre-rotation reader.

## Verdict
CONCERNS: 1

## Next action
impl review-fix: `asd-dev` adds the COR-1 `D-N` Status clause to `review-policy.md` "Autofix vs escalation" and makes the matching edits in impl steps 3, 6 and 9. It runs the consumer search and pins the clause in `tests/run.js`.

## Escalations (optional)
none

Memory written during this review (committed by the orchestrator with this file): `.claude/agent-memory/asd-reviewer-correctness/feedback_read-deferred-gaps-in-sprint-logs.md`, `.claude/agent-memory/asd-reviewer-correctness/MEMORY.md`.
