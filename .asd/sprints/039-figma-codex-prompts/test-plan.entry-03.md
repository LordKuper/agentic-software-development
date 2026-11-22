# Test plan — sprint 039-figma-codex-prompts, entry 3

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
