[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | medium | `.asd/runtime.js:603-611` (`writeManifestDiff`); claim at `review-policy.md:44` ("named by its inputs") | The fingerprint key covers only the git invocation args, and `existsSync` skips the write. Design-review `--no-index` args are just two paths, so after a rollback reset (nothing deleted on disk, dirs reused "if absent") iter-02 finds the old `<fp>.diff` and serves the pre-rollback change content to every reviewer. impl-review is weakly exposed too: `--base <base_branch>` is a ref name, so a reused dir with the same head serves an old file. | Make the name content-derived (include the diffed pairs' bytes or blob shas, and resolve refs to shas), or always write via `.tmp` + rename without the `existsSync` short-circuit. Add a regression test: emit twice into one design-review dir with a changed draft and assert the new content. |

Verified: COR-6 hook, COR-1 empty scope/cap, COR-5 `wave-files`, COR-3 carried-over drafts, COR-2 late returns, the `snapshot.json` removal, AC-1..AC-8 paths, and security.

## Coverage (internal reviewers only)

Ledger: [correctness.manifest.json](./correctness.manifest.json)

```json
{"manifest_digest":"447c0d0b47044d872d4e483c0aa3af36a207fced5ce9e2d2f8c5d6dba02c8937","findings":["COR-1"],"files":[{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/templates/external-review/t_prompt-external-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_codex-invocation.md","s":"checked"},{"i":".claude/agent-memory/asd-external-review/reference_scope-manifest-transport.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/project_prompt-snapshot-is-base-branch.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/project_external-review-prompt-duplication.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_review-fix-defect-proof.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_temp-repo-git-determinism.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md","s":"checked"},{"i":".claude/agent-memory/asd-tester/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-tester/project_asd-self-hosting-testing.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"finding","f":"COR-1"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```

## Verdict
CONCERNS: 1

## Next action
impl review-fix: COR-1 (runtime `writeManifestDiff` + regression test).
