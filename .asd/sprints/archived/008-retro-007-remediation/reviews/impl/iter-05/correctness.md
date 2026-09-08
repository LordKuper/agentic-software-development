[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 5 (severity floor: critical)

## Findings

No finding at or above the critical floor.

## Dropped below floor (4, counted)

1. `tests/run.js` §19 section-header comment still names the retired `derived_handoff (AC-11)`.
2. `plan.md` task rows still record the retired AC-11 deliverable as done.
3. The new memory-channel sentence is Claude-specific in a claim written as cross-host: `memory` is a Claude-only frontmatter key, while Codex reviewers run `sandbox_mode: "read-only"`.
4. Two bare "Reviewers stay read-only" restatements in `asd-phase-impl-review.md` do not carry the new scoping citation.

## Verified this iteration

**`derived_handoff` deletion is complete in canon**: `t_state.json` parses as valid JSON with `reviews` and `iteration_heads` intact; `sprint-lifecycle.md` "State recovery" reads coherently with no orphan sentence; impl-review's step numbering 1/1a/1b/2…12 is unbroken and no later step references the removed read; no migration is owed, since the field only ever existed in this unreleased sprint. **AC-15's corrected claim matches config** for the four internal reviewers, and no occurrence of the old absolute form survives in `.asd/` or `README.md`. **Ledger and mirrors**: `upstream_hashes` updated for exactly the nine edited managed paths, no `canon_hashes` entry due, `core.md` "See also", the phase chain, config schema, folder map, agent roster and model tiers untouched. **AC trace**: every live AC's anchor still exists on disk; `ac-4`'s predicate verified rather than accepted.

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against immutable manifest [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 14/14 files, all rules and all sections resolved; `ac-4` and the section predicates verified against source rather than accepted.

## Verdict

APPROVE

## Next action

Reviewer done for this iteration.

## Escalations

None.
