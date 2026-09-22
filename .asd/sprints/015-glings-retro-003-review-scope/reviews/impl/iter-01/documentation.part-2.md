[REVIEW-impl-documentation]: CONCERNS

Manifest: [documentation.part-2.manifest.json](./documentation.part-2.manifest.json) · Patch: [documentation.part-2.diff](./documentation.part-2.diff)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `README.md:432` (FAQ "Can I skip PRD/UX-spec/ADR/C4 for a lean sprint?") | The FAQ is stale. It says the only route is toggling `documents.*` in config, frozen at scope time. This sprint added the per-sprint skip, which answers exactly this question, and a user following the FAQ would edit config mid-sprint to no effect. | Add one sentence on the per-sprint skip (scope gate or audit exit, before any draft of that document exists, hard gate, config untouched) that cites `sprint-lifecycle.md` "Optional documents". |
| DOC-2 | low | `.asd/workflows/asd-phase-scope.md` step 3a | The step quotes `"skipped this sprint by user"`, but the rule it cites defines `"<doc> skipped this sprint by user"`. Two skips would then leave ambiguous records. | Quote the full literal or use the audit step's form. |

## Coverage notes

Consistent:
- The per-reviewer list and `.diff` payload match `review-policy.md`.
- `--test-plan` is split on commas.
- The `DISPATCH_CEILING` wave references match.
- The Correctness design bullet matches its agent.
- The audit skip matches `checkpoints.md`.
- The promote git route matches the rules.
- asd-sprint's plain-chat scope matches `core.md`.
- The README roster and folder map match.
- The CHANGELOG claims hold.
- There are no in-body comments in the new tests.
- The memory files are accurate.

## Verdict
CONCERNS: 2

```json
{"manifest_digest":"79c8389b012eba6a58a278dc4553277f0c0b6c7c880992632f3140062e18c5aa","findings":["DOC-1","DOC-2"],"files":[{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-scope.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_json-frontmatter-quotes.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/feedback_fail-first-and-none-honesty.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-2"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-1"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
