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
| 5 | e2c58cd3 | delta since entry 4 |
| 6 | | delta since entry 5 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, iteration allocation during Figma index recovery | A pause can consume an iteration, advance the severity floor and leave a missing prior snapshot | Trace design-review steps 1, 4, 5, 7 and 9 and run the existing workflow, snapshot and manifest contracts | none | Step 4 reconciles and refreshes the draft list before allocating the iteration. Recovery can pause before the counter and floor advance. Step 7 takes the refreshed list and uses the actual prior iteration snapshot. The existing CLI tests cover the unchanged snapshot arguments and delta behavior. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. The source trace covers the reordered workflow steps. Existing tests cover the snapshot and manifest contracts.

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review sync-cli sync-render update`
- Scope: impacted
- Scope evidence: Direct workflow references and canonical Markdown scans select the four contract areas. The existing step 7 check selects `runtime-review`. Release manifest readers and upstream hash validation select `sync-cli`, `sync-render` and `update`. The safety valve keeps the run impacted because the delta is the design-review workflow and its upstream hash.
- Result: pass — 207 passed, 0 failed, 0 skipped (exit 0). HEAD matched and relevant code, test and stub paths were clean before and after the run. Eligible for the impacted gate while those paths remain unchanged.
- Lint / build: pass
- HEAD: ca3b97d880eeb6532388fc4725a7a13faf4c7608

The entry 5, 4 and 3 impacted runs passed at `9457ed99`, `5161f7af` and `4896ebd2` (264/264 each). The entry 2 impacted run passed at `2974ba1d`. The subsequent named check passed at `fd4340a9`. Entry 1's original red run is recorded at `71a70a21`.
- Line delta: tests +28/−2 (net 26); other +139/−56 (net 83)

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
