# Agent Protocol

## Signals

| Token | Emitter | Handler |
|---|---|---|
| `COMPLETED` | agent or workflow finished | dispatcher continues; phase exit → `asd-sprint` Step 3 |
| `QUESTION` | creator needs user decision; reviewer uses verdict `question:` | "Relay" |
| `ADVICE_NEEDED` | Dev/Tester non-gate uncertainty | "Relay" |
| `BLOCKED_MANUAL` | Dev or Tester registers a human-only action in `manual-steps.md` | `asd-phase-impl.md` |
| `FAILED` | agent cannot proceed; excludes External Review and `asd-advisor` | dispatcher escalates via "Relay" consult |
| `ABORT` | agent, workflow or skill missing a precondition; first line `ABORT — precondition not met: <artefact>` | dispatcher; phase abort → `asd-sprint` |
| `REVIEW_DONE` | reviewers return verdict first (`review-policy.md` "Gate Verdict Format") | workflow waits for all, then persists |

Returns outside the tokens: External Review's `APPROVE (skipped: …)` and `external review interrupted: <cause>` (`external-review.md` "Outcome contract"); impl-test's `FAILED: stalemate <digest>` (`asd-phase-impl-test.md` step 9); `asd-advisor`'s recommendation, free text with no token.

## Dispatch payload

Dispatch from repo root with one leading fenced JSON object.

```json
{"repo_root": "<absolute path>", "sprint": "<NNN-slug>", "phase": "<phase>", "mode": "<mode|null>", "task": ["<Task N|finding id|D-N>"], "inputs": {"context": "<path>", "<key>": "<path|[paths]>"}, "write_scope": ["<glob>"], "turn_budget": null, "answers": [], "advice": null, "consults_left": null}
```

- Resolve "Input sources" (`sprint-lifecycle.md`), phase keys and "Conditional grants" (`providers.md`). Build `inputs.context` via `node .asd/runtime.js context --role <agent> --phase <phase> --out <scratch-dir>/<NNN-slug>-<dispatch id, "/" and spaces as "-">.context.md`. Failure blocks dispatch.
- Agents read definition, bundle and inputs. Beyond scope/manifest, read only named rule/workflow sections.
- Only reviewers, External Review and advisor get `turn_budget`: `{"max": <maxTurns>, "report_by": <maxTurns − 5>, "plan": null}` from canon. Internal impl-review waves over `LARGE_WAVE_FILES` (.asd/runtime.js) set `plan: {"ledger_by": <maxTurns − 10>}`: batch large diff reads and shorten per-file analysis to return every ledger row on time. Host enforcement: `providers.md` "Dispatch payload header".
- `answers` (`[{"question", "answer"}]`), `advice`, `consults_left`: set on a relay re-dispatch ("Relay").
- Role keys a workflow's dispatch names join the same object. Reviewer: `manifest` (its emitted manifest path), `diff` (its `.diff` path, or `null`), `floor` (severity floor), `findings_header` (internal reviewers only, never External Review: the literal findings header row of `t_review.md`), `iteration`, `interrupted` (its own interrupted-attempt record for this iteration, `{"count", "cause"}`, or `null`) — scope per `review-policy.md` "Clean-context review iteration".

### Orchestrator phase entry

Build the required bundle with `node .asd/runtime.js context --role orchestrator --phase <phase> --out <scratch-dir>/<NNN-slug>-orchestrator-<phase>.context.md` (new scope before slug: `<scratch-dir>/orchestrator-scope.context.md`). On build failure, return `FAILED` before executing phase steps. Read only the freshly built bundle; never fall back to a stale file. Read the acting workflow whole. Resolve cited sections via `node .asd/runtime.js section --file <path> --heading <text>`; reuse text already in the loaded bundle.

## Model quota retry

On confirmed model-quota rejection at launch, retry once with an available role-adequate alternate (`providers.md` "Model quota overrides"). Preserve payload, permissions, provider and review scope. Close the rejected timing op as interrupted; retry with new ID and original tier. Log `original_model`, retry `model` and `quota_reason` in decisions and timing attrs. No adequate alternate or failed retry → workflow failure path. Started → state recovery. Applies to all delegations including External Review's agent, whose CLI quota uses `external-review.md` "Outcome contract".

## Return

Line 1: signal token (full `ABORT` line or reviewer verdict line where applicable). Then one fenced JSON object for the signal and an optional Markdown body.

| Signal | Object |
|---|---|
| `COMPLETED` | `{"changed": [], "commits": [], "resolved": [], "flagged": [{"choice", "departs_from"}], "memory_index": null}` |
| `QUESTION` | `{"problem", "options": [{"id", "label", "consequence"}], "recommended": {"id", "reason"}, "complication": null}` |
| `ADVICE_NEEDED` | `{"question", "context": []}` |
| `BLOCKED_MANUAL` | `{"task", "manual_step"}` |
| `FAILED` | `{"cause", "fix", "committed": []}` |
| `ABORT` | `{"missing"}` |

- `resolved`: closed AC-N, finding or `D-N` IDs. `flagged`: choices for orchestrator review (`[]` if none); `departs_from`: earlier decisions-log disposition or `null`. In a multi-Task wave return the `MEMORY.md` index line as `memory_index` instead of editing the shared file.
- `QUESTION` renders `core.md` "User-decision presentation format"; `complication` is `{"what", "why", "justification", "alternatives"}` for a Complication Approval.
- `ADVICE_NEEDED` `context`: paths the advisor reads.
- `FAILED` `committed`: SHAs landed before failure.
- Stop all background processes you started before signalling. Name any you could not stop in the body.
- Reviewer and External Review returns: `review-policy.md` "Gate Verdict Format" and `external-review.md` "Outcome contract" (verdict line, findings table, one ledger JSON block).

## Relay

Orchestrator only. Re-dispatch fresh to the same agent with original context plus the additions below.

**`ADVICE_NEEDED`** (every relay branch in an `asd-phase-*.md` is this exact sequence):
1. Give `asd-advisor` only the creator's question, named paths and advisor bundle. No pause, user contact or log.
2. The workflow counts completed consults across re-dispatches, at most three per task. Pass `advice` and remaining `consults_left`.
3. At the cap the creator proceeds on its judgment. Gate uncertainty, including a hard gate named by advice, returns `QUESTION`.

**`QUESTION`**:
1. Present the question and options via request user decision (`core.md` "User-decision presentation format"). Use chat for free-form input.
2. Write the answer to `decisions-log.md` before continuing (`core.md` "Context hygiene"). Pass it in `answers`.

**Escalation consult.** Before presenting agent `QUESTION`/`FAILED`, second stall/interruption, impl-test or External Review stalemate, review-cap override or reviewer FAIL escalation, dispatch `asd-advisor` once per batched request with question, options and paths. Show **Advisor** (advice or unavailable) and log advice with the answer. No creator counter applies. Skip for inventory gates, skill preference menus and `BLOCKED_MANUAL`.

**Routing consult** (orchestrator only, no user contact): an ambiguous CONCERNS finding's route (`review-policy.md` "Verdict format") takes one batched `asd-advisor` request per review iteration; the orchestrator decides.
