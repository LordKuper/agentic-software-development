[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Evidence**: [manifest](./documentation.manifest.json) · [ledger](./documentation.ledger.json) · [findings](./documentation.findings.json). `validate-ledger` returned ok.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | low | `.asd/workflows/asd-phase-design-review.md` step 2 (line 21); `.asd/skills/asd-phase-design-review/SKILL.md` `description` (line 4) | **Two copies of the collapse rule were not updated for the new trigger.** The home is `sprint-lifecycle.md` "Design/design-review/design-promote collapse" (line 155). It now names two collapse sites: the audit exit under `skip_design_phases`, and design's all-disabled check. Line 7 of the workflow was updated to "either trigger". Step 2 of the same file still says the all-disabled case is "handled entirely by `asd-phase-design.md` step 2's collapsed check". The always-loaded skill description still says "the design phase's collapsed no-op check already advanced past it". So the file contradicts itself. It is in scope because the change made this unchanged text wrong. Routing is unaffected. | In step 2, point to the home section or add "(either trigger)". In the skill description, name both triggers or drop the attribution. Then run `node .asd/sync.js --apply .claude/skills/asd-phase-design-review/SKILL.md .agents/skills/asd-phase-design-review/SKILL.md`. |

Checks that passed:
- `sprint-lifecycle.md:125` is the single home for the explicit skip. Other sites state only the part they act on.
- README schema (250) and FAQ (439), `AGENTS.md:60`, the templates and the generated views all match.
- The phase-chain mirrors are unchanged, and `core.md` "See also" needed no edit.
- No in-body comments were added.
- Documentation economy holds.
- The tester agent memory is consistent with HEAD.
- `.asd/project/config.yaml:12` reads `enabled` (AC-6, read-only).

## Coverage

The compact ledger is in [documentation.ledger.json](./documentation.ledger.json):
- All files are `checked`.
- SSoT → DOC-1.
- Template adherence, HTML shell wrapping, Provenance and Traceability are `n/a` on their authorized predicates.
- Persistent actuality, In-code doc comments, Framework mode, Documentation economy and Custom rules consistency all `pass`.
- All sections are `reviewed`.

## Verdict
CONCERNS: 1

## Next action
`impl` review-fix mode: fix both stale copies in canon, re-sync the two generated skill views, and keep `node tests/run.js` green.
