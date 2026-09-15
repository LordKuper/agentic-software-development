[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2
- **Manifest**: [documentation.manifest.json](documentation.manifest.json) · **Diff**: [iteration.diff](iteration.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | `.asd/migrations/9.0.0.js:22-26` (header, "No YAML parser" paragraph) | After this iteration removed three `SHIPPED_DIAGRAM_COMMENTS` entries (old `design/architecture/` likec4 line, both mermaid `subsystems.yaml` lines), the header states the comment exception twice and inconsistently: :6-8 (updated) limits rewrites to shipped comments carrying a renamed/removed key's or value's intent; :23-26 (not updated) still says any line an earlier template shipped verbatim "now stating a wrong contract" gets today's wording — covering lines the code no longer rewrites. `code-style.md` §7: update doc comments when code changes. | Narrow :23-26 to the :6-8 reach, or cut the clause and point back to the bound so the exception is stated once. |

Checked and consistent (condensed): migration-writer wording identical across `core.md`, `t_AGENTS.md`, `AGENTS.md` managed block, `asd-update` skill, both README rows, `9.0.0.js` header, synced views and digests; External Review host-shell table matches agent, view and `providers.md`; consecutive stalemate wording matches `runtime.js`, JSDoc, tests, README:155, AC-1; impl-test resume step fits steps 4/9 and `t_test-plan.md`; README SSoT pointer and folder map; no in-body comments added; agent memory claims true at HEAD, links resolve.

## Coverage ledger

```json
{"manifest_digest":"c08e60abcdc55e40f6def06dad3f924fa422cc57e360995d5bb27e6ad69c6771","findings":["F-1"],"files":[{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/migrations/9.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-init/SKILL.md","s":"checked"},{"i":".asd/skills/asd-update/SKILL.md","s":"checked"},{"i":".asd/sync-state.json","s":"checked"},{"i":".asd/templates/t_AGENTS.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-correctness/project_os-is-not-shell.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/feedback_sweep-exemption-granularity.md","s":"checked"},{"i":".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md","s":"checked"},{"i":"AGENTS.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"F-1"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
