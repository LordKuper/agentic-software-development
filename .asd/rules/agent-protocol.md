# Agent Protocol

Orchestrator↔agent communication: signals, dispatch payload, return shape, relay. JSON keys and return fields stay English (`language-policy.md`).

## Signals

| Token | Emitter | Handler |
|---|---|---|
| `COMPLETED` | creator or workflow finished | dispatcher continues; phase completion → `asd-sprint` Step 3 |
| `QUESTION` | creator needs user input; reviewer uses verdict `question:` (`review-policy.md` "Gate Verdict Format") | "Relay" `QUESTION` |
| `ADVICE_NEEDED` | Dev or Tester on non-gate uncertainty only (`core.md` "Autonomy and escalation") | dispatching workflow's "Relay" `ADVICE_NEEDED` branch |
| `BLOCKED_MANUAL` | Dev or Tester registers a human-only action in `manual-steps.md` | `asd-phase-impl.md` |
| `FAILED` | agent cannot proceed; excludes External Review and `asd-advisor` | dispatcher escalates via "Relay" consult |
| `ABORT` | agent, workflow or skill missing a precondition; first line `ABORT — precondition not met: <artefact>` | dispatcher; phase abort → `asd-sprint` |
| `REVIEW_DONE` | reviewer or External Review returns the verdict line first (`review-policy.md` "Gate Verdict Format") | workflow waits for all dispatched reviewers, then persists |

Returns outside the tokens: External Review's `APPROVE (skipped: …)` and `external review interrupted: <cause>` (`external-review.md` "Outcome contract"); impl-test's `FAILED: stalemate <digest>` (`asd-phase-impl-test.md` step 9); `asd-advisor`'s recommendation, free text with no token.

## Dispatch payload

Return the shell to the repo root before dispatch. Start each `delegate to agent` payload with one fenced JSON object.

```json
{"repo_root": "<absolute path>", "sprint": "<NNN-slug>", "phase": "<phase>", "mode": "<mode|null>", "task": ["<Task N|finding id|D-N>"], "inputs": {"context": "<path>", "<key>": "<path|[paths]>"}, "write_scope": ["<glob>"], "turn_budget": null, "answers": [], "advice": null, "consults_left": null}
```

- `inputs`: resolve `sprint-lifecycle.md` "Input sources", phase keys and applicable `providers.md` "Conditional grants". Build required `inputs.context` with `node .asd/runtime.js context --role <agent> --phase <phase> --out <scratch-dir>/<NNN-slug>-<dispatch id, "/" and spaces as "-">.context.md` (`providers.md` "Role-scoped context"). Build failure blocks dispatch.
- Read your definition, `inputs.context` and all payload inputs. Outside `write_scope` or review manifest, open rules and workflows only at sections the payload names. At each phase entry, the orchestrator builds its own bundle (`--role orchestrator --phase <phase>`) at `<scratch-dir>/<NNN-slug>-orchestrator-<phase>.context.md` or `<scratch-dir>/orchestrator-scope.context.md` in scope `new` mode before the slug exists. It reads the acting workflow whole and other cited sections via `node .asd/runtime.js section --file <path> --heading <text>`.
- `turn_budget`: reviewers, External Review and advisor only, else `null`: `{"max": <maxTurns>, "report_by": <maxTurns − 5>, "plan": null}` from canon frontmatter `maxTurns`. Set `plan` to `{"ledger_by": <maxTurns − 10>}` for an internal reviewer on an impl-review wave listing more than `.asd/runtime.js` `LARGE_WAVE_FILES` files. Under that plan, ledger due by `ledger_by`: read diffs in few large chunks within the call limit, batch independent reads per turn, and shorten analysis per file as needed. Return every ledger row (`review-policy.md` "Coverage ledger"). Host enforcement: `providers.md` "Dispatch payload header".
- `answers` (`[{"question", "answer"}]`), `advice`, `consults_left`: set on a relay re-dispatch ("Relay").
- Role keys a workflow's dispatch names join the same object. Reviewer: `manifest` (its emitted manifest path), `diff` (its `.diff` path, or `null`), `floor` (severity floor), `findings_header` (internal reviewers only, never External Review: the literal findings header row of `t_review.md`), `iteration`, `interrupted` (its own interrupted-attempt record for this iteration, `{"count", "cause"}`, or `null`) — scope per `review-policy.md` "Clean-context review iteration".

## Model quota retry

Applies to every agent delegation, including reviewer and advisor relays. If the host rejects a dispatch at launch with a confirmed quota for the selected model, the orchestrator retries that dispatch once using an available, role-adequate alternate per `providers.md` "Model quota overrides". Preserve the original payload, permissions, provider and review scope. Use a fresh dispatch id and close any rejected attempt's open timing op as interrupted. Record the original model, the retry's resolved model and the terse quota reason in the decisions log and retry timing attrs (`original_model`, `model`, `quota_reason`). Use the original tier for timing.

An unavailable or inadequate alternate, or a failed retry, follows the calling workflow's existing failure path. For a dispatch that already started, follow state recovery for partial work. This retry applies to the External Review agent's launch. Quota from its wrapped CLI follows `external-review.md` "Outcome contract".

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

Main orchestrator only. After either relay, dispatch the same agent fresh with its original task context plus only the additions below. No mid-task resume.

**`ADVICE_NEEDED`** (every relay branch in an `asd-phase-*.md` is this exact sequence):
1. On a creator's `ADVICE_NEEDED`, dispatch `asd-advisor` with only the creator's question and named context paths plus the advisor's `inputs.context`. Keep the round-trip within the phase, with no pause, user contact or log entry.
2. The dispatching workflow owns the count of completed consults, capped at three per task. Increment after each recommendation and carry the count across re-dispatches. Return the recommendation in `advice` and remaining count in `consults_left`.
3. At the cap, stop relaying that task's `ADVICE_NEEDED`. The creator proceeds on its judgment or returns `QUESTION` for gate uncertainty. If advice names a hard gate, return `QUESTION` (`core.md` "Autonomy and escalation").

**`QUESTION`**:
1. Present the question and options via request user decision (`core.md` "User-decision presentation format"). Use chat for free-form input.
2. Write the answer to `decisions-log.md` before continuing (`core.md` "Context hygiene"). Pass it in `answers`.

**Escalation consult** (orchestrator only; no creator or phase-workflow counter): before putting any of these to the user — an agent `QUESTION`, a `FAILED`, a second stall or interruption, a stalemate (impl-test, External Review), a review-cap override, a reviewer FAIL escalation — the orchestrator dispatches `asd-advisor` once per request, batching its items, with the question, options and context paths. It presents the request with the **Advisor** line (`core.md` "User-decision presentation format") and records the advice in the answer's decisions-log entry. Advisor unavailable → present without it, saying so. The advisor never authorizes a hard gate; gate-inventory gates, skill preference menus and `BLOCKED_MANUAL` take no consult.

**Routing consult** (orchestrator only, no user contact): an ambiguous CONCERNS finding's route (`review-policy.md` "Verdict format") takes one batched `asd-advisor` request per review iteration; the orchestrator decides.
