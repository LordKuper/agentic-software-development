[REVIEW-impl-external]: CONCERNS

Wave 1, iteration 1, floor low. One codex invocation over the whole manifest. The preflight was local-ready and model access worked. The run was foreground with a 600000 ms timeout and no retry was needed.

## Kept findings

| ID | Severity (codex -> ASD) | Location | Description | Fix |
|---|---|---|---|---|
| F1 | medium | .asd/workflows/asd-phase-design.md:59 | The step-10 asd-architect C4 dispatch payload omits `inputs.research`. The steps 6, 8 and 9 payloads (ba, ux, architect) carry it. The new Rules line 52 tells every creator to read `inputs.research` first, so step 10 cannot satisfy that obligation, especially when ADR is disabled. Verified: the step-10 payload list ends at `inputs.template (per diagram_tool)` with no research entry. | Add `inputs.research` to the step-10 payload and check every design dispatch for it. |
| F2 | medium | .asd/workflows/asd-phase-scope.md:31 | BA findings are persisted only after the stage (c) refinement interview. If the session restarts during that interview, no Findings evidence exists. Re-entry then repeats the completed web research and loses the original recommendations. Not verified by execution. | Persist findings and approaches right after stage (b). Stage (c) should only update the refined requirements and the chosen approach. Test recovery with Findings present and Chosen absent. |

## Dropped findings
- Below floor: 0
- Nitpick: 0 per category

## Verdict
CONCERNS: 2 (both medium). Fixable without escalation. No stalemate (iteration 1).

## Next action
Route both to review-fix in `impl`. Codex did not run the suite (git forbidden in the read-only sandbox).
