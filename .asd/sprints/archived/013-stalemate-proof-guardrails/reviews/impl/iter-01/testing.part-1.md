[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1 (part 1 of 2)
- **Manifest**: [testing.part-1.manifest.json](testing.part-1.manifest.json)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

Evidence per test-plan decision (condensed): `defectStalemate` identity/edge cases covered (`tests/run.js:4554`, `:4588`, `:4596`), `{{...}}` skip exercised by the shipped template row (`:4581`); D-1 proof meets §17 (command, exit 1, runner test name; symptom matches `assert.throws` output; 203 declarations = 203/203); CLI exit contract asserted; `9.0.0.js` fixture pair LF and CRLF+BOM with re-run, 11-row mapping matches `audit.md` "Migration gaps", skip table covers every risky shape, `REMOVED_KEYS` read from source — only branch without fixture is `9.0.0.js:207` (no `project` group), judged hypothetical under §17; session-start hook cases derived from `t_state.json` incl. legacy `skip_design_phases`; collapse home pinned (`:2837`); preflight `platform`; no `--scoped-fan-out` left in workflow invocations; asd-init steps 13/14 (`:4495`, `:4496`) with no config-side `documents.c4` reader left; manifest `9.0.0.js` registered (hash freshness via §6b/§9); prose-only files covered by the removed-key sweep; no stubs; no manual verification needed. No shell available: files read at HEAD. Note handed to part 2: the `/legacy/i` sweep skip at `tests/run.js:2912` spans whole paragraphs.

## Coverage ledger

```json
{"manifest_digest":"509005ee715d2486247e6a9a786e554aad98345f7da7bff646ad0256a65b8060","findings":[],"files":[{"i":".asd/agents/asd-architect.md","s":"checked"},{"i":".asd/agents/asd-external-review.md","s":"checked"},{"i":".asd/hooks/session-start.js","s":"checked"},{"i":".asd/migrations/9.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/checkpoints.md","s":"checked"},{"i":".asd/rules/code-style.md","s":"checked"},{"i":".asd/rules/core.md","s":"checked"},{"i":".asd/rules/external-review.md","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/review-policy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-init/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-design-review/SKILL.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/skills/asd-update/SKILL.md","s":"checked"},{"i":".asd/sync-state.json","s":"checked"},{"i":".asd/templates/t_AGENTS.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"pass"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Stub-resolution verification","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```
