[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/templates/t_design-system.html:98 | codex F1 (codex gpt-6.1-sol, read-only): HTML comment markers inside the stylesheet produce the invalid selector `asd:vars:start --> :root`, so browsers discard the generated CSS variables (confirmed by CSS parsing). | Place the variable region in the shell stylesheet using CSS comments; update the generator's marker matching. |
| 2 | high | .asd/workflows/asd-phase-impl-review.md:37 | codex F2: the persistence command omits `--floor` although the wrapper keeps below-floor findings. design-review's persistence command has the same omission. | Pass the computed `--floor` for external returns in both workflows, including late returns. |
| 3 | high | .asd/runtime.js:617 | codex F3: filtering every finding from a FAIL report keeps FAIL with an empty findings array, forcing escalation with no qualifying finding. | Return and persist APPROVE whenever filtering leaves no findings; test an all-dropped FAIL. |
| 4 | high | .asd/runtime.js:1041 | codex F4: when every text hunk matches the rename map, compression discards the whole patch header, including executable-bit and rename metadata. A reproduced 100644 to 100755 change disappears from review. | Preserve semantic header changes while collapsing substitution hunks. |
| 5 | high | .asd/workflows/asd-phase-design-review.md:31 | codex F5: mockups are added only as context inputs; the snapshot and manifest list still come from the document-file intersection. Extracted mockup files lack valid finding locations, and mockup-only revisions can drop out of incremental review. | Recursively include ux_spec-enabled mockup files in the draft list before snapshotting and emitting manifests. |
| 6 | high | .asd/rules/review-policy.md:106 | codex F6: the escalation rule still requires a user decision whenever any over-engineering check trips, contradicting the rule that simplify and keep-as-is findings are CONCERNS decided by the orchestrator. | Limit the requirement to category escalate and the stated requirements- or architecture-complicating decisions. |
| 7 | medium | .asd/runtime.js:1022 | codex F7: for quoted Git paths, sectionPath returns both encoded header paths as one key; deleting é.js leaves its deleted line counted because the key cannot match the literal numstat path. | Decode and select one repository path consistently before computing collapse discounts. |
| 8 | medium | .claude/agent-memory/asd-tester/feedback_edit-tool-for-regex-and-mutation-script.md:12 | codex F8: the memory tells testers to keep mutation helpers outside the repository, contradicting the mandatory .asd/tmp scratch location and cleanup rule. | Store the helper in .asd/tmp and remove it after use. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): dropped: 0 (the wrapper keeps every finding; `persist-review --floor low` applies the floor)
- Nitpick, by category: none reported (codex emitted no nitpick category lines)

## Verdict
CONCERNS: 8
dropped: 0
