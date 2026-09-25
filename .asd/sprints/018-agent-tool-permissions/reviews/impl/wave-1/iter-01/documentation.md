[REVIEW-impl-documentation]: CONCERNS
Interrupted attempts: 1 (maxTurns 50 reached before a report was returned)

# Review — documentation

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | high | `.asd/sync.js:329` (`transformAgentCodexToml`) | New in-body comment `// Optional; omitted = inherit the parent session's web_search (Codex default "cached").` violates `code-style.md` §7 (only `// TODO(sprint-<NNN-slug>)` allowed in bodies; no framework exemption) and duplicates `providers.md:42` (SSoT). | Delete the comment; `providers.md` stays the only home. |
| DOC-2 | medium | `README.md:197`, `README.md:211` | Mirror drift: (a) 211 says Dev/Tester Bash "unrestricted … (build/lint/test/git commands from `commands.yaml`)" but both agents say "limited to" `commands.yaml` plus `git add`/`git commit`, Dev never runs `test`; (b) 197 says "returns `QUESTION` (creators/advisor)" but the advisor emits only `FAILED` — the caller returns the gate question. | (a) "carry `Bash` limited by their run-command policy (`commands.yaml` commands plus `git add`/`git commit` for their own work; Dev never runs `test`)"; (b) "(creators)". |
| DOC-3 | low | `README.md:211`, `README.md:217` | Web purposes don't match Tool policy: 211 gives all creators "docs/library/framework/runtime lookups" while BA fetch is user-provided URLs only and UX the DESIGN.md spec, neither scoping `WebSearch`; 217 gives Correctness "external contract/security claims" vs its "language/framework best practices and security advisories". | State purposes as the agent files do (or point to Tool policy); add search-scope clauses to BA/UX if intended (AC-9). |
| DOC-4 | low | `.asd/workflows/asd-phase-design-review.md:47-48`, `.asd/workflows/asd-phase-impl-review.md:56-57` | Stalemate "override → stay in fix set" is the opposite of the adjacent generic "on override → mark resolved"; option effects are also defined twice (both workflows) while `external-review.md` "Stalemate detection" lists only names. | Define option effects once in `external-review.md` "Stalemate detection", cite from both workflows; rename the stalemate option or state the generic bullets don't apply to a `Stalemate:` report. |

Passing notes: `stubs.md` unchanged, no `TODO(sprint-018` markers; `t_review.md` question item matches `review-policy.md` carrier; sampled hash lines agree; `tests/run.js` adds no in-body comments.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"545663be3ad023aee594277211892789616bd4e269ed894f46b2999bbf267272","findings":["DOC-1","DOC-2","DOC-3","DOC-4"],"files":[{"i":".asd/agents/asd-advisor.md","s":"checked"},{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-ba.md","s":"checked"},{"i":".asd/agents/asd-dev.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/agents/asd-reviewer-correctness.md","s":"checked"},{"i":".asd/agents/asd-reviewer-documentation.md","s":"checked"},{"i":".asd/agents/asd-reviewer-efficiency.md","s":"checked"},{"i":".asd/agents/asd-reviewer-testing.md","s":"checked"},{"i":".asd/agents/asd-tester.md","s":"checked"},{"i":".asd/agents/asd-ux.md","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/design-principles.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/providers.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-concept/SKILL.md","s":"checked"},{"i":".asd/skills/asd-stack/SKILL.md","s":"checked"},{"i":".asd/sync.js","s":"checked"},{"i":".asd/templates/t_review.md","s":"checked"},{"i":".asd/workflows/asd-phase-audit.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-promote.md","s":"checked"},{"i":".asd/workflows/asd-phase-design-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-design.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".claude/agent-memory/asd-architect/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-architect/reference_codex-agent-config-docs.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/MEMORY.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/project_parallel-agent-commit-sweep.md","s":"checked"},{"i":".claude/agent-memory/asd-dev-critical/reference_codex-agent-toml-probe.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"SSoT","s":"finding","f":"DOC-4"},{"i":"Template adherence","s":"pass"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"DOC-3"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"finding","f":"DOC-1"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"finding","f":"DOC-2"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 4

## Escalations (optional)
None.
