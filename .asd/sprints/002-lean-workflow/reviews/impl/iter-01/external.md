[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Wrapped CLI**: codex-cli 0.150.1, `codex exec --sandbox read-only`, model gpt-5.6-sol — ran successfully, full diff payload (~262 KB, 59 files, self-hosting pathspec). Raw wrapped-CLI verdict: `FAIL: 11` — normalised to `CONCERNS` per review-policy.md (all findings creator-autofixable, no escalation trigger met).

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `asd-phase-pr.md:33` | PR AC-coverage gate still relies on the Documentation verdict, but this diff makes Implementation the exclusive AC-to-code owner. | Validate AC coverage against the Implementation reviewer verdict/trace instead. |
| 2 | high | `asd-phase-pr.md:38` | HEAD-equality can skip tests despite uncommitted code/test changes; the sha compared is not guaranteed to be the one that recorded the successful suite run. | Record the verified commit explicitly after the suite gate; skip reruns only when relevant paths are unchanged since it. |
| 3 | high | `asd-init/SKILL.md:55` | Mermaid mode promises a c4-build command but defines neither a concrete command nor a renderer. | Retain direct rendering or ship a managed renderer with an exact command. |
| 4 | high | `CHANGELOG.md:5` | Removed persistent ADR/API layout and t_api.html have no migration procedure for existing consumers — violates `backward_compat: migration`. | Add an explicit migration procedure before release. |
| 5 | high | `asd-architect.md:65` | Write allowlist forbids documents invented by the Architect, while the new fold contract permits a new fold target after Complication Approval. | Allow writing the exact approved new path. |
| 6 | high | `asd-architect.md:22,56` | Architect still mandates per-decision ADR approval, contradicting the design workflow's single approval for the sprint's whole ADR set. | Replace with one approval for the complete set. |
| 7 | high | `asd-architect.md:74` | Agent must run `likec4 build` before completion even though the new C4 contract forbids building draft output. | Validate the composed model without emitting build output. |
| 8 | medium | `t_adr.html:12` | Repeated ADR articles have no ADR-specific id while line 44 links to `#adr-N` — broken/ambiguous intra-document links. | Give each article an `adr-N` id, prefix child section ids. |
| 9 | medium | `t_adr.html:10` | Numbering contract says sprint-local AND never reused across sprints — mutually contradictory. | State numbers unique only within the sprint, may repeat across sprints. |
| 10 | medium | `asd-phase-impl-test.md:41` | "HEAD analysed" captured before step 6 commits new/pruned tests — next re-entry delta wrongly includes the previous entry's test changes. | Write/update the entry-log sha after the prune/author commit. |
| 11 | medium | `README.md:207` | Roster still says Testing reviewer captures manual verification, contradicting the new single-home contract. | Update to describe judgment + reporting, not authoring. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: none: 0

## Verdict
CONCERNS: 11

## Next action
Route to `impl` review-fix mode; creators autofix findings 1-11, re-enter via impl-test. Caution: if fixing #3 introduces a new dependency, that trips Complication Approval.
