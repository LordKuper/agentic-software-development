# Test plan — sprint 039-figma-codex-prompts, entry 5

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, Figma handoff after interrupted index writes | A recovered link can reach the reviewer without the metadata needed for handoff | Trace the publication rule and review steps 1 and 7, inspect the recorded recovery fixture, and run snapshot and manifest tests | none | The restored row's reviewer patch retained the verified frame revision, screen state, component and unbound token reference. Review pauses if required metadata is pending, before initial enumeration or a later snapshot. [Decisions log](decisions-log.md) |
| AC-7, partially completed Test-only Tasks | A commit for one subtask can conceal unfinished work or let a regression test bypass proof | Trace lifecycle recovery and impl steps 5 and 7 and run the existing failed-dispatch anchor check | none | In the recorded source trace, a completed compile-only subtask reaches step 7 and the unfinished regression subtask returns to authoring using the first dispatch anchor. The completion check compares the full Task diff to its proof and leaves affected subtasks unticked if proof is missing or invalid. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. Existing tests cover the snapshot, manifest and failed-dispatch anchor contracts. The recorded fixture and source trace cover the revised recovery instructions.
