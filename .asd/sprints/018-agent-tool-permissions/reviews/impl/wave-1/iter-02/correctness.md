[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02 (floor medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/agents/asd-ux.md:70` (AC-8); `.asd/workflows/asd-phase-design-promote.md:8`; `.asd/rules/design-system.md:75,81`; `.asd/templates/t_commands.yaml:23-29` | iter-01 #3's fix moved `designmd-install` to "the orchestrator", but no phase workflow has that step (grep of `.asd/workflows/` for `designmd` is empty; only the inline `/asd-design-system` skill `SKILL.md:90` installs). On Windows `designmd-lint` needs `node_modules\.bin\design.md.cmd`; a design-promote DESIGN.md patch then hits a lint UX can neither run nor fix. | Add the install step where needed (e.g. design-promote step 4: orchestrator runs `designmd-install` once per session on Windows before dispatching `asd-ux` when `DESIGN.md` is patched); `asd-ux.md:70` cites that step. |

Iter-01 re-check: #1 fixed (`review-policy.md:154`, both workflows); #2 fixed (template `## Stalemate`, options home `external-review.md:98-100`, no `accept as-is` left); #3 partially fixed (finding 1 above); #4 fixed; #5 fixed. Generated views and hash ledgers in sync. New tests (stalemate options, carve-out sweep, BA/UX allowlist) correct on current canon.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"05a868807c3ba2a226faed44e4dc2ce31ae3f3f2474d65ccc0d8f06535b4ce4c","findings":["1"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/sync.js","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_parallel-agent-commit-sweep.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_sync-apply-ledger-gotcha.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_review-fix-defect-proof.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"finding","f":"1"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"}]}
```

## Verdict
CONCERNS: 1

## Escalations (optional)
None.
