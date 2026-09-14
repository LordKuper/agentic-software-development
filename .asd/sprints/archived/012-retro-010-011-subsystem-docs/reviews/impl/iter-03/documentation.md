[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3
- **Evidence**: [manifest](./documentation.manifest.json) · ledger below

I had no shell, so I worked out the diff by reading the manifest files as they are on disk. To find what changed this iteration I used the `decisions-log.md` entries "impl review-fix for iter-02: findings resolved" and impl-test entry 4. I did not recompute the hashes in `release-manifest.json`. I only checked their structure: `skills/asd-init/SKILL.md` has the same hex in `canon_hashes` and `upstream_hashes`, `t_subsystems.yaml` is gone and `t_subsystems.md` is registered.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | high | `.asd/workflows/asd-phase-impl.md` "Execution mode" (the "A blocker is exactly one of" list, ~34-37), "Escalation" (~119) and step 6 (~62); `.asd/skills/asd-init/SKILL.md` "Workflow (sprint-mediated)" step 2 | The COR-2 fix lets a settings-change Task sit in a later wave, and it validates that Task's pairs against the working-tree `t_config.yaml` when its wave opens. So when a key is still missing, `asd-init` returning `FAILED` is now an expected result. The accepted flagged choice says this is a phase blocker ("A key still missing when its wave opens → `asd-init` `FAILED` → phase blocker"). That decision never reached the workflow that acts on it. Step 6 does not say what to do on `FAILED`. The Execution-mode list says a blocker is "exactly one of" three things: dev `QUESTION`, dev `FAILED`/`ABORT`, or a Simplicity Default trigger. It also says "Pausing mid-impl for anything other than a blocker above … is a protocol violation", and the "Escalation" section says the listed blockers and the manual-steps gate are "the only reasons" impl contacts the user. Read literally, the orchestrator is not allowed to halt on a failed settings change. It would open the wave anyway and dispatch the Task's remaining subtasks without the setting applied. That is the wrong behavior on AC-13's main case. The change made this unchanged list incomplete, so it counts under the change-surface exception. | Add one entry to the "exactly one of" list: `asd-init` sprint-mediated `FAILED` (a declared pair failed validation). In step 6, add a short clause: on `FAILED`, halt as a blocker before any of that wave's dispatch. Do not add a second statement of the validation rule; `asd-init` step 2 stays its home. |

Checked and not raised:
- **Mirror wording.** `t_plan.md:19` ("a wave after the task adding its key") and `asd-phase-plan.md:39` shorten `sprint-lifecycle.md` "Settings change declaration" and drop its "when `t_config.yaml` already carries every key" condition. Both cite or mirror the grammar and do not contradict it. Medium at most, so below the floor.
- **Settings-change wording across sites.** The step-6 citations in the `asd-init` "Modes" list, `asd-sprint` "Skills dispatched" and `sprint-lifecycle.md` agree. So do the `core.md` Invariants line, the `t_AGENTS.md` hard rule, the root `AGENTS.md` block and README row 181.
- **DOC-2 fix.** The narrowed wording in `review-policy.md:101` and `asd-phase-impl-review.md` step 5 matches `runtime.js` (`NA_PREDICATES`, `NA_TARGETS`, `isUiSurface`, `isExecutable`). The only predicate canon quotes, `outside phase gate`, matches `NA_PREDICATES.phaseGate`.
- **Reviewer memory files.** They are now consistent with `providers.md` "Declared tool policy": a payload instruction to run a command gets `QUESTION`, a diff range passed as data is fine.
- **Memory claims checked at HEAD.**
  - `parseFlagArgs` fails with "flags require values" and exits 2.
  - Every `MEMORY.md` link resolves.
  - `managed_paths` includes `sync.js`/`runtime.js`.
  - The efficiency memory's claim that economy does not reach agent memory matches `artifact-layout.md` "Documentation economy".
- **Documentation comments in the AC-13 test** (`tests/run.js:4331-4385`): no in-body comments.

## Coverage (internal reviewers only)

The compact JSON ledger is below, bound to manifest digest `a91be793…`.

## Verdict
CONCERNS: 1

## Next action
A dev adds the missing blocker entry and the `FAILED` handling to `asd-phase-impl.md` (DOC-1), then syncs the generated views and refreshes `upstream_hashes`. A test assertion tying step 6's failure branch to the Execution-mode list is up to impl-test.

## Escalations (optional)
None.

I also added one check to my own memory file, `D:\Projects\agentic-software-development\.claude\agent-memory\asd-reviewer-documentation\feedback_no-shell-doc-review-method.md`: compare accepted flagged choices against closed lists such as blocker lists. I did not edit any other file.

```json
{"manifest_digest": "a91be7933c308f19c9405c6344a2d0f6148e382cdaa44bff6a9d21835ab0e97b", "findings": ["DOC-1"], "files": [{"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_trace-ac-to-motivating-case.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_removed-flag-vacuity.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "SSoT", "s": "pass"}, {"i": "Template adherence", "s": "pass"}, {"i": "HTML shell wrapping", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Provenance", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Traceability", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Persistent actuality (impl-review)", "s": "pass"}, {"i": "In-code doc comments (impl-review, `code-style.md` §7)", "s": "pass"}, {"i": "Framework mode (`self_hosting: enabled`, impl-review only)", "s": "finding", "f": "DOC-1"}, {"i": "Documentation economy", "s": "pass"}, {"i": "Custom rules consistency", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
