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

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, Figma index recovery in Standard design review | An interrupted write leaves the index absent during initial scope enumeration or a later review snapshot | Trace steps 1 and 7, check the recorded recovered-index fixture, and run existing snapshot and manifest tests | none | Step 1 reconciles verified revisions before listing drafts and deciding whether the scope is empty. Step 7 applies that procedure before every snapshot. The local fixture restored a missing index and produced its revision diff in the combined reviewer manifest. [Decisions log](decisions-log.md) |
| AC-7, recovery of unticked Test-only Tasks | A retry can lose sight of the first test commit or bypass the proof check | Trace lifecycle recovery and impl steps 5–7, then run the existing failed-dispatch anchor check | none | The source trace confirmed that normal re-entry and failed dispatch use the first authoring anchor. Recovered commits go to step 7, where missing or invalid proof keeps the Task unticked and the wave open. With no Task commits, authoring resumes. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. Existing tests cover snapshot selection, manifest diffs and failed-dispatch anchors. The local fixture and source trace cover the workflow ordering.

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: Path and consumer searches bound the two workflow documents and the lifecycle rule to the contract areas and `runtime-review`, `runtime-routing` and `runtime-tools`. The release hash changes reach `sync-cli`, `sync-render` and `update`. The runner, shared test setup and executable runtime are outside the delta. The safety valve keeps the run impacted.
- Result: pass — 264 passed, 0 failed, 0 skipped (exit 0). HEAD matched and relevant code, test and stub paths were clean before and after the run.
- Lint / build: pass
- HEAD: 5161f7af11f3599a62007287c9855325b8ce73be
- Line delta: tests +28/−2 (net 26); other +139/−56 (net 83)

The entry 3 impacted run passed at `4896ebd2` (264/264). The entry 2 impacted run passed at `2974ba1d`. The subsequent named check passed at `fd4340a9`. Entry 1's original red run is recorded at `71a70a21`.

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
