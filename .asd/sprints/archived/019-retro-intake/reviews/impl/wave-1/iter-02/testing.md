[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|

No findings at or above the medium floor.

Reviewed without a shell, by reading `94ae0c496a2aa1b4.diff`, canon at HEAD and the iter-01 reviews:
- **Test count and exemption:** 238 `^test\(` declarations = 238/238. `pendingMemoryFix` has 0 hits, so the sweep compares against `[]`.
- **Fix-id mapping:**
  - Covered with E-series proofs: external #1 (E1–E5, E9), COR-3 (E6–E8), COR-4 (E10–E11), DOC-3 (E13–E14), DOC-5 (E12), COR-6 (E15–E17), COR-2 (E18).
  - Covered by existing pins: COR-5 (M4), external #2 / EFF-1 (P1), COR-1/DOC-1/DOC-2 (P2–P7).
  - `none` rows: COR-7 and DOC-4, both honest.
- **Collateral arithmetic** is consistent for every mutation.
- **First-firing replay by hand** matches for E2–E5, E18, M5/M6, scope step 4 and AC-13b.
- **Fixture rewrite (EFF-1):** `017-b#A-4` differs from its retro in both Acts on and text, which makes the check non-vacuous.
- **Suite-run record:** HEAD `608b417`, then `c43681a` (test-plan only). Consistent, and the TST-1-2 note is corrected.
- **AC coverage:** AC-1..AC-17 each keep an automated check, and the TST-1-1 gap is closed. No manual verification.

Below-floor notes (low, not raised):
- (a) The AC-14/AC-16 sweep regex misses the variant "no memory write tool"; the positive clause pins remain.
- (b) The DOC-3 negative assert is a removed-phrase absence check, paired with a positive assert.
- (c) The COR-2 row cites only `74a25b1`, not the finding id.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"f8f0f99d6763e0b729fabff0e0271871a9a1014a3023bda7e317e40d4e08d586","findings":[],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/019-retro-intake/test-plan.md","s":"checked"},{"i":".asd/sprints/019-retro-intake/test-plan.entry-01.md","s":"checked"},{"i":".asd/sprints/019-retro-intake/test-plan.entry-02.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"pass"},{"i":"Coverage","s":"pass"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
APPROVE

## Next action
None.

## Escalations (optional)
None.

Memory written during this review (committed by the orchestrator with this file): `.claude/agent-memory/asd-reviewer-testing/feedback_sweep-exemption-granularity.md`, `.claude/agent-memory/asd-reviewer-testing/MEMORY.md`.
