[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none (verdict dispatch, not an availability skip)

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | .asd/runtime.js:971 | codex F1: the sprint-start check follows symlinks and junctions when rewriting Claude settings; a project linking to shared settings can have them modified outside the repository. | Verify that the settings directory and target resolve inside the repository before writing; apply the replacement atomically. |
| 2 | high | .asd/skills/asd-init/SKILL.md:97 | codex F2: switching an existing project to git.ai_attribution: disabled writes the config alone; the next sprint-start check only resets existing attribution fields, so a standard Claude settings file without them stays unchanged and fails the new sync check. | Reconcile Claude settings when applying the config change; test the transition from a standard installation. |
| 3 | high | .asd/skills/asd-sprint/SKILL.md:26 | codex F3: step 0 can modify tracked .claude/settings.json before the new-sprint and impl-review clean-tree checks, so the workflow can block on a change it just made. | Reconcile tracked settings on the sprint branch and record that change before the clean-tree gate; keep existing user changes under the normal gate. |
| 4 | high | .asd/rules/git-strategy.md:44 | codex F4: the mandatory commit form requires dev and tester agents to write a scratch message file, but their declared policies deny writes elsewhere in .asd/; an agent following both rules cannot commit. | Grant both roles write and cleanup access to their own dispatch-scoped message file. |
| 5 | high | .asd/runtime.js:1542 | codex F5: liveness trusts the reviewer identity in the return; a quality dispatch returning an external-review verdict is marked finished without ledger validation, though persist-review rejects the same return. | Bind the expected phase and reviewer to the dispatch; validate the return against those values and its manifest. |
| 6 | high | .asd/runtime.js:900 | codex F6: a subject followed immediately by ASD-Task: passes because the whole message is treated as its last paragraph; the required trailer paragraph has no blank separator. | Require a blank line before the final trailer paragraph; test a subject followed immediately by an ASD-Task line. |
| 7 | high | .asd/workflows/asd-phase-scope.md:54 | codex F7: the disabled-document check covers the flags seeded in step 3a and omits documents.audit, which step 3 freezes separately; a scope requiring an audit can pass with documents.audit: off unsurfaced. | Include the effective audit flag in the check; the gate resolves a conflict by changing the setting or narrowing the scope. |
| 8 | high | .asd/rules/artifact-layout.md:188 | codex F8: the command check specifies a tech-and-version failure signal, but AC-8 requires a failure per missing command; the generic impl FAILED route escalates and halts before the orchestrator writes the reference. | Return the command-specific failure and route it to the orchestrator for reference completion before re-dispatch. |
| 9 | high | .asd/sync.js:1192 | codex F9: the config scanner treats any indented ai_attribution line under git: as a direct child and ignores duplicates whose values fail its regex; a nested or ambiguous setting can trigger Claude settings writes without a valid choice. | Match direct children only; count every matching key before validating its value; add nested and mixed-format duplicate cases. |
| 10 | medium | .asd/runtime.js:906 | codex F10: the co-author check searches the whole line, so a human whose email domain contains codex or claude is rejected. | Parse the trailer identity and match the author name or a known bot address; add a human co-author with a matching domain word. |
| 11 | medium | .asd/sync.js:786 | codex F11: with repeated attribution keys, sync replaces the first occurrence while the last stays effective; apply can leave attribution active and the target perpetually stale. | Reject duplicate owned keys before writing, or consolidate them into one effective value. |
| 12 | medium | .asd/sync.js:774 | codex F12: an attribution-only sync rebuilds the hook array even when owned entries are current; an owned hook followed by a foreign hook is reordered. | Preserve the hook array verbatim when owned entries already match; test interleaved owned and foreign hooks. |
| 13 | medium | tests/run.js:10966 | codex F13: the test title and search needle contain the retired model ID literally, so the tracked test file violates AC-4 even when the sweep passes. | Remove the literal from the title; build the exact search needle from fragments. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none reported by the wrapped CLI: 0

## Verdict
CONCERNS: 13

## Next action
Orchestrator persists this return via persist-review (external, floor low). Routing: review-fix for wave-1 (F1 critical and F2-F9 high are in framework source; only F13 is a test file). Single codex invocation over the whole files[] (exit 0, no retry used); no failure to record.
dropped: 0
