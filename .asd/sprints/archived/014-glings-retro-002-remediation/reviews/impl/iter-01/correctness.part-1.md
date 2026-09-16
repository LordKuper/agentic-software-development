[REVIEW-impl-correctness]: CONCERNS

# Review — correctness (part 1 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Manifest**: [correctness.part-1.manifest.json](correctness.part-1.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | medium | `.asd/rules/sprint-lifecycle.md:342` (AC-2); `.asd/project/custom-coding-rules.md:12`; `.asd/rules/git-strategy.md:40` | Failed-dispatch reconstruction's `git status --porcelain` is whole-repo, so the re-dispatch payload names orchestrator bookkeeping (`state.json`, `decisions-log.md`, review files) and concurrent same-wave tasks' in-progress edits "for the agent to finish or revert" — breaks author-only staging; can undo orchestrator state or a sibling's work. | Limit leftovers to the `git log` pathspec (`':!.asd/sprints/**'`) and exclude paths owned by in-flight dispatches (or reconstruct only when none is in flight); agent finishes/reverts only its own paths. |
| COR-2 | medium | `.asd/rules/git-strategy.md:15`; `.asd/rules/sprint-lifecycle.md:342` (AC-2) | Every tester commit uses `impl-test entry N`; once step 7's commit lands, the entry reads landed and is dropped though step 8's suite gate never ran; strategy-only `test-plan.md` commits are hidden by the pathspec. | Treat an impl-test trailer as tests-committed only; resume from the first step lacking on-disk output (no `Suite run` for entry N → re-run step 8), or per-step ids. |
| COR-3 | low | `.asd/rules/git-strategy.md:14-15` | "one trailer line" conflicts with grouped commits and multi-finding/`D-N` fix commits; unnamed ids re-dispatch though landed. | Allow one `ASD-Task:` line per covered id (`%(trailers:key=ASD-Task,valueonly)` prints all). |
| COR-4 | medium | `.asd/rules/external-review.md:91` vs `:35`/`:46` (AC-1) | Skip iteration must record `Unreviewed files` in `external.md`, but on a skip no agent runs, both workflows defer skip persistence to "Outcome contract", which lists only decisions-log and `F-N`; no step writes the list, so a skipped iteration's files never reach External Review. | Add to the skip's persistence duties (`external-review.md:35`): write `Unreviewed files` = would-be `files[]` (scope list ∪ previous unreviewed); point both workflows' skip-recording steps at it. |

## Coverage

```json
{"manifest_digest":"a353485a49eebc6e0ddf5ff734f4393b5697e58428bc6006d9fdc75ca437e0ec","findings":["COR-1","COR-2","COR-3","COR-4"],"files":[{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"}],"rules":[{"i":"Bugs [impl-review]","s":"finding","f":"COR-2"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"finding","f":"COR-3"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"finding","f":"COR-4"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"finding","f":"COR-1"}],"sections":[{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```
