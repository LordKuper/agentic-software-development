[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Evidence**: [manifest](./correctness.manifest.json) · [ledger](./correctness.ledger.json) · [findings](./correctness.findings.json). `validate-ledger` returned ok.

## Findings

No findings at or above the floor.

Verified:
- **Audit exit** (`asd-phase-audit.md:3,7`): step 5 is now the only write.
  - Every audit × setting combination lands correctly.
  - An interruption can no longer leave a half-done skip, so EXT-1/COR-1 is closed.
- **Collapse test** (`sprint-lifecycle.md:155`):
  - It reads frozen state only.
  - The plan precondition (`asd-phase-plan.md:7`) and the resume exception (`asd-sprint/SKILL.md:43`) cite it and never read `skipped_phases`, so COR-2 is closed.
- **Design-review wording**: it names both triggers, and the skill's trigger text is unchanged.
- **Tests** (`tests/run.js:2840-2895`): the new locators are unambiguous and do not go vacuous at HEAD.

Observed but below floor or outside this diff:
- Plan step 1 reads only `documents.prd`/`audit`, while step 2 needs the full collapse test. Step 2 still reads `state.json`, so this works.
- The documentation reviewer's agent-memory note (`feedback_no-shell-doc-review-method.md:34-36`) still describes DOC-1 as present.
- The hook branch `phase === 'audit' && skip_design_phases === true` is now unreachable, because audit step 1 no longer writes. It is harmless and outside this diff.

AC trace (this diff): AC-3, AC-4, AC-5 and AC-7 are covered. AC-1, AC-2 and AC-6 are untouched here.

## Coverage

Compact ledger: [correctness.ledger.json](./correctness.ledger.json).
- All files are `checked`.
- All rules `pass`, except UI conformance: `n/a: no UI surface in the iteration scope file list`.
- All sections are `reviewed`.

## Verdict
APPROVE

## Next action
Correctness is done and APPROVE-latched.
