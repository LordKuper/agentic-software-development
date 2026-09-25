[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02 (floor medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-5 | medium | `.asd/agents/asd-ux.md:70` (mirror `README.md:211`) | The fix moved `designmd-install` to "the orchestrator … once per session on Windows", but no workflow/skill step makes the orchestrator run it: `asd-phase-design.md` step 8 has none, and `asd-design-system/SKILL.md:90` still assigns it to the Designer (`asd-ux`). On Windows UX's lint then fails or UX breaks its own "never"; README:211 repeats the unbacked rule. | Put the orchestrator step where it acts (e.g. `asd-phase-design.md` step 8 and `asd-design-system` before Phase 3; name the orchestrator at `SKILL.md:90`), or cite that single step from the Do's line. |

Iter-01 fixes resolved: DOC-1, DOC-2, DOC-3, DOC-4. Carrier rule, ADVICE_NEEDED carve-out, generated views, stubs, hash-ledger structure pass. Out-of-scope note (not a finding): `.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md:16` still says "return `QUESTION`".

## Coverage (internal reviewers only)

```json
{"manifest_digest":"837a12227cab52c5027c428a877c6e5b47a4ced59fc90280104d53456f5c0d35","findings":["DOC-5"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/sync.js","s":"checked"},{"i":".asd/templates/external-review/t_review-report.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_parallel-agent-commit-sweep.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_sync-apply-ledger-gotcha.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_review-fix-defect-proof.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-5"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 1

## Escalations (optional)
None.
