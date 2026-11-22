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
| 3 | | delta since entry 2 |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-2/AC-5, Figma frame revisions in Standard design review | An in-place fix preserves the frame URL and can be omitted from rereview | Trace verified write, recovery and snapshot rules. Check the live Figma read-back and local CLI fixture recorded in [the decisions log](decisions-log.md) | none | Live Figma read-back confirmed changed padding with the same file key and node ID. In the local fixture, incrementing only the verified revision with the same URL included the index in `draft-snapshot` output and its diff in `emit-manifest`. Step 1 includes the mockup index and step 7 reconciles verified revisions before snapshotting. Both inline fix paths use the same publication rule. Existing runtime tests cover changed-file selection and snapshot diffs. |
| AC-6, tester output capture | A bounded tool reply drops the failure detail needed for triage | Check the tester's scratch log grant and the capture used for this entry | none | The per-run scratch path is authorized. This entry captured stdout and stderr together, appended exit 0 in the same invocation and then read a bounded result from the log. |
| AC-7, Test-only Task recovery | A commit trailer can advance the wave before the proof is verified, or a proof re-dispatch can change the committed tests | Trace the failed-dispatch rule, impl step 7 and the tester's evidence-only scope | none | Trailer reconstruction reaches the same proof check as a normal completion. Missing or invalid proof leaves the Task unticked and its wave open. The evidence-only dispatch uses the existing commits and authoring anchor, and leaves tracked files untouched. The failed-dispatch parser's existing tokens and command stay valid. |
| AC-1/AC-5, config test citation | The citation misses the test it describes or changes its cases | Inspect the comment move and run the existing `runtime-routing` area | keep | The citation precedes the test declaration. The same assertions exercise all mockup formats, legacy configs and invalid inputs. |
| AC-2/AC-4/AC-5, integration references | Duplicated provider guidance can diverge from the governing rules | Verify relative links and trace native session setup to the recorded Figma smoke | none | Both references link to the live rule files. Their section anchors resolve, and the Figma note records the setup observed during the earlier authorized check. |

## Removed tests

No removals. The affected tests cover separate contracts.

## Added tests

No additions. Existing tests cover the executable snapshot, manifest and config contracts, and the new instructions are checked by the rule trace and recorded integration evidence.

## Suite run

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: The changed test is in `runtime-routing`. Path and consumer searches bound the workflow and rule changes to the contract areas, `runtime-review` and `runtime-tools`. The regenerated tester views and release hashes reach `sync-cli`, `sync-render` and `update`. The runner, shared test setup and executable runtime are outside the delta. The safety valve keeps the run impacted.
- Result: pass — 264 passed, 0 failed, 0 skipped (exit 0). HEAD matched and relevant code, test and stub paths were clean before and after the run.
- Lint / build: pass
- HEAD: 4896ebd2f59bf1ae1ac078cbce5ea04b196d8c90
- Line delta: tests +28/−2 (net 26); other +127/−49 (net 78)

The entry 2 impacted run passed at `2974ba1d`. The subsequent named check passed at `fd4340a9`. Entry 1's original red run is recorded at `71a70a21`.

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
