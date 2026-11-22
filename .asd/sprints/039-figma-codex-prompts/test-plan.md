---
responsibility:
  owns: test approach, runner evidence, defects and manual verification
  excludes: requirements, production code and review verdicts
  delegates_to: sprint.md, plan.md and impl-review
---

# Test plan — sprint 039-figma-codex-prompts

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 71a70a21 | full change surface |
| 2 | 6f4bbe3a | delta since entry 1 |
| 3 | 30a0a48c | delta since entry 2 |
| 4 | 5b1a1ec7 | delta since entry 3 |
| 5 | 9457ed99 | delta since entry 4 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, Figma handoff after interrupted index writes | A recovered link can reach the reviewer without the metadata needed for handoff | Trace the publication rule and review steps 1 and 7, inspect the recorded recovery fixture, and run snapshot and manifest tests | none | The restored row's reviewer patch retained the verified frame revision, screen state, component and unbound token reference. Review pauses if required metadata is pending, before initial enumeration or a later snapshot. [Decisions log](decisions-log.md) |
| AC-7, partially completed Test-only Tasks | A commit for one subtask can conceal unfinished work or let a regression test bypass proof | Trace lifecycle recovery and impl steps 5 and 7 and run the existing failed-dispatch anchor check | none | In the recorded source trace, a completed compile-only subtask reaches step 7 and the unfinished regression subtask returns to authoring using the first dispatch anchor. The completion check compares the full Task diff to its proof and leaves affected subtasks unticked if proof is missing or invalid. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. Existing tests cover the snapshot, manifest and failed-dispatch anchor contracts. The recorded fixture and source trace cover the revised recovery instructions.

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: Searches for the changed design-system and lifecycle rules, workflow paths, snapshot and manifest commands and failed-dispatch anchor bound the impact to the contract areas and `runtime-review`, `runtime-routing` and `runtime-tools`. The release hash changes reach `sync-cli`, `sync-render` and `update`. The safety valve keeps the run impacted because the runner, shared test setup and executable runtime are outside the delta.
- Result: pass — 264 passed, 0 failed, 0 skipped (exit 0). HEAD matched and relevant code, test and stub paths were clean before and after the run.
- Lint / build: pass
- HEAD: 9457ed9947c285dc6c1e6011c9c72be51a209b63

The entry 4 and 3 impacted runs passed at `5161f7af` and `4896ebd2` (264/264 each). The entry 2 impacted run passed at `2974ba1d`. The subsequent named check passed at `fd4340a9`. Entry 1's original red run is recorded at `71a70a21`.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/skills/asd-init/SKILL.md | AssertionError [ERR_ASSERTION]: standalone skills total 62390 B, cap 62351 | sprint-026 AC-15: the standalone skills total at most their baseline of 62,351 bytes (61,051 on main plus the asd-init adoption text of sprint 037) | fixed | 0b4d860258c72558979a65b06069ca776a84324b |

## Manual verification

| AC | Steps | Expected observation |
|---|---|---|
| AC-2/AC-5 | In an authorized Figma Design draft, use the remote MCP file session to create a native frame, read its node structure back and open the stable node link. | Live Figma remote MCP passed. An independently inspected 480 × 198 native frame had one child FRAME, three editable TEXT descendants, a bound background variable and zero image nodes. The stable link resolved and the frame was visually inspected. |
| AC-4/AC-5 | Present a choice in the Codex App async widget, observe enqueue and wait for the explicit choice. | Live Codex App passed. The widget delivered the explicit draft-creation answer after enqueue. The orchestrator used that answer to run the authorized Figma check. |

- result: pass — AC-2/AC-5, independent Figma canvas read-back and visual inspection.
- result: pass — AC-4/AC-5, explicit authorization received through the live Codex App widget.
