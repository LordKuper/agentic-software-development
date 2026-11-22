# Test plan — sprint 039-figma-codex-prompts, entry 4

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, Figma index recovery in Standard design review | An interrupted write leaves the index absent during initial scope enumeration or a later review snapshot | Trace steps 1 and 7, check the recorded recovered-index fixture, and run existing snapshot and manifest tests | none | Step 1 reconciles verified revisions before listing drafts and deciding whether the scope is empty. Step 7 applies that procedure before every snapshot. The local fixture restored a missing index and produced its revision diff in the combined reviewer manifest. [Decisions log](decisions-log.md) |
| AC-7, recovery of unticked Test-only Tasks | A retry can lose sight of the first test commit or bypass the proof check | Trace lifecycle recovery and impl steps 5–7, then run the existing failed-dispatch anchor check | none | The source trace confirmed that normal re-entry and failed dispatch use the first authoring anchor. Recovered commits go to step 7, where missing or invalid proof keeps the Task unticked and the wave open. With no Task commits, authoring resumes. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. Existing tests cover snapshot selection, manifest diffs and failed-dispatch anchors. The local fixture and source trace cover the workflow ordering.
