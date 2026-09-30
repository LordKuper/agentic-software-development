[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

Scope checked: the delta `62c8992bc862d28c.diff` (the iter-01 review-fix commits f9df1c3, 4d6286a, 9e88920, 73745d4 and fcb9d2c, the ledger refresh, the impl-test entry 3 test edits, and the memory writes).
- `.asd/runtime.js:669-671`: `isGeneratedView` now matches only the full-file provider trees (`.claude/{agents,skills,hooks}/`, `.codex/{agents,hooks}/`, `.agents/skills/`). This agrees with every `full-file` target in `sync.js:1229-1257`. The two `json-merge` targets (`sync.js:1275-1283`) now count. The same rule is restated in `external-review.md:62`, `sprint-lifecycle.md:145` and the `artifact-layout.md:52-55` folder map, and all three agree. The test derives the JSON-merge set from the sync plan's `class`, so it cannot drift from it.
- `.asd/runtime.js:386-388`: `isUiSurface` now case-folds its `.asd/` exception. Dropping it from `module.exports` is safe: its only caller is the internal one at `runtime.js:430`, and no test imports it (AC-8, no export without a caller).
- `asd-phase-pr.md` open mode step 3 (commit and push `state.json.pr` before `NEXT: await-merge`) is consistent with `git-strategy.md` "Merging a PR" (`--squash`, merge writes nothing on base) and with the new "Merged-unclosed" sentence. This closes the iter-01 gap where base kept `pr=null` (AC-2).
- The README return-file sentence now matches `review-policy.md:142`: internal reviewers write the return file; the orchestrator writes External Review's text to a file. The AGENTS.md cadence "once per wave or fix round" matches `sprint-lifecycle.md` "Self-hosting" and `custom-coding-rules.md`.
- The release-manifest hash bumps cover exactly the four canon files that changed. Suite: 253/253 green at entry 3 (`test-plan.md` "Suite run"). No manual-verification row is recorded as failing.
- Below floor, not counted: `reference_live-subagent-transcripts.md` hard-codes a machine-specific user path, although its `description` already gives the portable `~/.claude/projects/...` form.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"d63b3e6b60abcc1866032e285cfb3f02cb5c8dd293075f1f9b74dd5999f56c97","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-combined/reference_live-subagent-transcripts.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

## Verdict
APPROVE

## Next action
Combined reviewer done for wave-1/iter-02. The orchestrator persists this return with `persist-review` and continues once every reviewer in the wave is APPROVE.
