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
| 6 | f81ab280 | delta since entry 5 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, iteration allocation during Figma index recovery | A pause can consume an iteration, advance the severity floor and leave a missing prior snapshot | Trace design-review steps 1, 4, 5, 7 and 9 and run the existing workflow, snapshot and manifest contracts | none | Step 4 reconciles and refreshes the draft list before allocating the iteration. Recovery can pause before the counter and floor advance. Step 7 takes the refreshed list and uses the actual prior iteration snapshot. The existing CLI tests cover the unchanged snapshot arguments and delta behavior. [Decisions log](decisions-log.md) |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. The source trace covers the reordered workflow steps. Existing tests cover the snapshot and manifest contracts.

## Suite run

- Command: `node tests/run.js`
- Scope: full
- Result: pass — 316 passed, 0 failed, 0 skipped (exit 0).
- Lint / build: pass — `git diff --cached --check`; `node .asd/sync.js --check`
- HEAD: 4ea1a1031f89749d9e0b1cb98098cbe3cf120627
- Slowest tests: sprint-017 AC-8 (D9e), sprint-038 AC-20 draft-snapshot and emit-manifest patch — 1,949 ms; sprint-020 AC-9 persist-review validation — 1,616 ms; sprint-023 AC-2 git-strategy branch behavior — 1,429 ms; sprint-036 AC-14 agent-liveness return-file checks — 1,337 ms; sprint-026 AC-14 role grant-table resolution — 1,331 ms; sprint-037 AC-1 context-check — 1,311 ms; sprint-019 AC-8 one-command commit form — 1,118 ms; AC-4 Windows .cmd metacharacter path preflight — 1,067 ms; sprint-021 AC-7 agentLiveness — 1,056 ms; sprint-034 AC-14 record-verdicts validation — 1,018 ms.

The entry 5, 4 and 3 impacted runs passed at `9457ed99`, `5161f7af` and `4896ebd2` (264/264 each). The entry 2 impacted run passed at `2974ba1d`. The subsequent named check passed at `fd4340a9`. Entry 1's original red run is recorded at `71a70a21`.
- Line delta: tests +28/−2 (net 26); other +141/−58 (net 83)

**Terminal failure triage**

- Named run `node tests/run.js migrations --filter "AC-14: PM migration"` reproduced `EPERM` from the Windows file symlink (0/1 passed, exit 1). The same command passed with the directory junction fixture (1/1, exit 0), including the `skippedUnsafe` and outside file preservation assertions. The POSIX fixture still uses a file symlink.
- Impacted run `node tests/run.js contract-rules runtime-routing runtime-timing` passed (58/58, exit 0), including all three tests that failed on Git ownership. The invocation set `safe.directory` for this repository through the inherited Git environment. Both green runs checked clean relevant paths and matching HEAD `a846ba8d1408bd2c9251043eba218648e52e0413` before and after.
- Entry 6's green impacted run included `contract-rules`. The migration, routing and timing failures were outside its area list.

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
