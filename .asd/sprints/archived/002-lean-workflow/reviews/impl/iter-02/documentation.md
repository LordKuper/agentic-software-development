[REVIEW-impl-documentation]: CONCERNS

# Review — documentation
- **Phase**: impl-review
- **Iteration**: 2 (floor = medium)

## Findings
| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-impl-test/SKILL.md:5` | Same impl-test Write/Edit gap — fourth independent confirmation. Also recommends re-auditing every phase skill's grant against its workflow's Operations-used block. | Add Write Edit; sync.js --apply; re-audit all skills. |
| 2 | high | `sprint-lifecycle.md:63` vs `asd-phase-impl.md:48`, `asd-backend-dev.md:65`, `README.md:414` | Self-hosting write allowlist declares itself exhaustive and forbids restating, but 3 files restate it anyway and all 3 drop paths (CHANGELOG.md/.gitignore/release-manifest.json). | Replace restated lists with pointers to sprint-lifecycle.md "Self-hosting". |
| 3 | medium | `asd-phase-impl-review.md:11-15` vs `:27,42,44` | Same run-command/diff-computation capability gap as quality.md#2 — independently confirmed. | Add Bash + run-command op, or state where the diff/scope list is supplied from. |
| 4 | medium | `sprint-lifecycle.md:182`, `asd-phase-impl-test.md:63`, `asd-phase-impl-review.md:28` | 3 residual sprint-local-id citations survive the strip pass (same class as simplification.md#7, one extra site). | Drop the parentheticals. |
| 5 | medium | `artifact-layout.md:135-141` | New "Review verdict placeholder namespace" section was inserted between the HTML-shell placeholder table and its own trailing normative blocks (Badge omission, Fragment invariants), so those two rules now sit under the wrong heading. | Move the new section below Fragment invariants. |

## Coverage summary
`files: 51/51 checked, 0 n/a · rules: 15/15, 5 findings`

## Verdict
CONCERNS: 5 (2 high, 3 medium)

## Next action
Route to `impl` review-fix mode. Findings #1 needs sync.js --apply.

## Escalations
None.
