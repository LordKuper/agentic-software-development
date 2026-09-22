[REVIEW-impl-correctness]: APPROVE

Manifest: [correctness.manifest.json](./correctness.manifest.json) · Patch: [correctness.diff](./correctness.diff)

## Findings

None at or above the medium floor.

## Checked

- **runtime.js**
  - The removed helpers have no remaining users, and union coverage still holds through `reviewerFiles`.
  - `draftSnapshot` widens the draft list when the previous snapshot is missing or a path fails to match, writes before it returns, and is idempotent per iteration.
  - `isTest` now matches folders case-insensitively, while basenames stay case-sensitive.
  - The `surfaceCheck` comment moved into the JSDoc.
- **AC-11:** the dispatches count has a single home (`sprint-lifecycle.md:334`), and `DISPATCH_CEILING` is pinned.
- **Workflows**
  - Design-review step 7 draft list is the single input (AC-2).
  - `core.quotePath=false` in step 1 (AC-4).
  - Promote re-dispatch, with BA/UX "never rename or delete" (AC-6).
  - Audit/scope skip is user-initiated and uses the full log literal (AC-8).
- **Tests:** the git-isolated temp repos, the four draft-snapshot cases, the non-ASCII command read from canon, and the fixed message all check out.
- **Security:** no shell, and `gitRef` rejects values starting with `-`.

Below the floor, not raised: neither phase says what happens when an iteration 2+ scope is empty. This predates the sprint.

## Verdict

APPROVE

```json
{"manifest_digest":"28803985430acce7ba2029bd20069ea998350c986ee255e513f4c98a89307aa1","findings":[],"files":[{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
