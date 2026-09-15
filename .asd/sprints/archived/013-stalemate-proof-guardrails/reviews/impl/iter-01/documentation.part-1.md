[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1 (part 1 of 2)
- **Manifest**: [documentation.part-1.manifest.json](documentation.part-1.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-P1-1 | medium | `.asd/rules/core.md:30`; mirrors `.asd/templates/t_AGENTS.md:46`, `.asd/skills/asd-update/SKILL.md:4`, `:20`, `.asd/migrations/9.0.0.js:5-7` | The sanctioned-writer licence ("release-mandated key renames and removals") is narrower than the one migration it covers. `9.0.0.js` also changes values of surviving keys (`documents.audit: enabled → always`, `applyValueChanges` :187; `prd/ux_spec/adr → disabled` under `skip_design_phases` :189-193), inserts keys/groups (`project.diagram_tool` :199-207, `documents` group :204-205) and rewrites shipped template comments (`rewriteShippedComments` :244-263); its own header claims the narrow limit at :6 while describing the wider work at :2-4, :22-25. Code is user-approved (AC-19); the licence wording is wrong and gives future migration authors/reviewers no usable limit. | Widen `core.md:30` first, e.g. "limited to release-mandated key renames and removals, plus the value mappings and key insertions that carry a renamed or removed key's intent" (keep "release-mandated"). Mirror verbatim into `t_AGENTS.md:46` (re-sync root `AGENTS.md`), `asd-update/SKILL.md:4`, `:20`, the `9.0.0.js:5-7` header, and `README.md:86`; `sync.js --apply` the `asd-update` views; refresh hashes. |

Reviewer note (condensed): no shell available; changed lines located via `audit.md` "Gaps" reader lists and `plan.md` citations; `release-manifest.json` hashes checked structurally only (`9.0.0.js` entry present, every changed agent/skill hashed).

## Coverage ledger

```json
{"manifest_digest":"5c8c58d1dedce63b6b5cf0849867adc74f36d4d6da68f975bae795fac1e5c6c4","findings":["DOC-P1-1"],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/migrations/9.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/code-style.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-init/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-design-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/skills/asd-update/SKILL.md","s":"checked"},{"i":".asd/sync-state.json","s":"checked"},{"i":".asd/templates/t_AGENTS.md","s":"checked"}],"rules":[{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"HTML shell wrapping","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"Provenance","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"Traceability","s":"n/a","p":"evidence outside this part; covered by the other parts"},{"i":"Persistent actuality (impl-review)","s":"finding","f":"DOC-P1-1"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
