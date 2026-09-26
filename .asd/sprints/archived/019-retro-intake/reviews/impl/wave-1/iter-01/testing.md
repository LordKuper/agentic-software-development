[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| TST-1-1 | low | `.asd/rules/sprint-lifecycle.md:9` ("Retro intake" disposition clauses); `.asd/workflows/asd-phase-scope.md:10` (step 4 backlog write); `tests/run.js:6020-6036` (the only test that reads "Retro intake"); `test-plan.entry-01.md:30` (AC-3/AC-5 `none` row) | The intake home's rules on what gets written have neither a check nor a `none` row: "undecided → `deferred`", "a resolved candidate is written `closed` without asking", "empty → no question, no backlog write" (AC-3/AC-5), and scope step 4's backlog write (AC-4 persistence). The only test that reads the section compares its flags and citation. Row 30 excuses only HEAD verification, the recommendation and the one-line log, as "orchestrator runtime judgement". "Undecided → deferred" is a rule literal, not a judgement, and nothing guards it. If it is dropped, an undecided fresh row is never written, and `retroCandidates` stops offering it once the next retro archives, so it is lost for good. If step 4's write is dropped, included and rejected rows come back at every scope. Sibling single-home rules in this sprint (AC-11/12/13/15/16) are pinned clause by clause; this one is not. | Add clause-level asserts in the style of the AC-11..16 test: the "Retro intake" sentence pairs `undecided` with `deferred` and names `closed`, and scope step 4 names the backlog write. Otherwise record a `none` row in `test-plan.md` with an honest reason. |
| TST-1-2 | low | `test-plan.md:73` (Suite run HEAD `d7a9e68`) vs `test-plan.md:28` (Entry log HEAD analysed `66bcd9b`) | The entry-2 run was recorded at `d7a9e68`, and its note says the only later commit "changes only `.asd/sprints/**`, which no test reads". But `66bcd9b` (the entry's HEAD analysed) edited `.claude/agent-memory/asd-tester-critical/project_mutation-runs-trip-the-hash-ledger.md`, a tree read by two tests (the AC-14/AC-16 sweep and the T-2/T-4 index bijection). Replayed statically: the file triggers no sweep match and is still indexed in `MEMORY.md`, so no red is expected, and the terminal full-suite run supersedes this record. The inaccuracy is in the record only. | Correct the note to name `66bcd9b` (tester memory, statically inert for both readers), or re-stamp the run at `66bcd9b`. |

Checked by reading files, without running anything:
- **Test count:** 238 `^test\(` declarations = 238/238. The arithmetic holds: 229 + 9 added = 238, and entry 1's 237/238 is D-1/D-2 only.
- **Fail-first proof:** the D-1/D-2 reverts each produce one FAIL and no ledger collateral.
- **Mutation proofs:** M1, M2, M4-M8, M10, M12-M14, M16-M18, M31, M32, M34 and M36 were replayed in body order; each first-firing assertion matches its transcript.
- **Sprint-015 AC-8 test:** the `retro intake dispositions` inventory row (`checkpoints.md:50`) satisfies its form.
- **Hand-listed sets:** the turn-budget set mirrors `providers.md:50`. The seed map is AC-4's own spec, and the live backlog is non-vacuous (15 rows).
- **Determinism:** the git sandbox isolates host config.
- **Entry 2:** the entry-2 `none` rows are honest.
- **AC coverage:** AC-1..AC-17 each have an automated check, except the gap in TST-1-1. No manual verification is needed.

## Coverage (internal reviewers only)

```json
{"manifest_digest":"f599089aa8200022d7ba81da2058585a85228153b67940c86344a69ae39ea45b","findings":["TST-1-1","TST-1-2"],"files":[{"i":"tests/run.js","s":"checked"},{"i":".asd/sprints/019-retro-intake/test-plan.md","s":"checked"},{"i":".asd/sprints/019-retro-intake/test-plan.entry-01.md","s":"checked"}],"rules":[{"i":"Rule-set conformance","s":"finding","f":"TST-1-2"},{"i":"Coverage","s":"finding","f":"TST-1-1"},{"i":"Edge cases","s":"pass"},{"i":"Manual verification (last resort)","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[]}
```

## Verdict
CONCERNS: 2

## Next action
Send TST-1-1 and TST-1-2 to impl review-fix, handled by the tester. For TST-1-1, add the clause-level asserts with a fail-first mutation record, or add a `none` row with a reason. For TST-1-2, correct the Suite run note. No source change is needed.

## Escalations (optional)
None.
