[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| T-1 | low | `tests/run.js:157` (AC-1/AC-2; `test-plan.md` row "sync.js Codex regex") | Render assert hand-lists Codex families `(sol\|luna)` — a copy of `manifest.model_families.codex` and of `sync.js:175`; this sprint had to edit it by hand. `code-style.md` §17: a check naming set members derives the set from its source where one exists. | Build the alternation from `Object.keys(manifest.model_families.codex)` (already in scope in that test); amend the `test-plan.md` row. |
| T-2 | low | `test-plan.md` "Risk → check decisions"; `sprint.md` AC-5 | AC-5 (MAJOR bump + CHANGELOG Removed/migration note) has no row; the pr-phase deferral and the existing heading==`asd_version` check (`tests/run.js:5173-5174`) are unrecorded, so the AC→check trace is silent for one AC. | Add an AC-5 row: pr-phase work; `tests/run.js:5173` pins heading == `asd_version`; MAJOR-ness/entry content decision `none` with reason. |

Checked sound: `unknown family` case covers a `terra` agent (`sync.js:172`); `run.js:136` swap still reaches the suffix-mismatch branch; `:2335` still changes the fingerprint; 213 tests matches Suite run; zero live `terra`; no removals, no flaky patterns, no manual verification warranted.

## Coverage

```json
{"manifest_digest":"76650e92d230ffb486a1a4c36064241cf4f40de24aedcb1ead0a2212288dbe7d","findings":["T-1","T-2"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/016-remove-terra-family/test-plan.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"T-1"},{"i":"Coverage","s":"finding","f":"T-2"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 2
