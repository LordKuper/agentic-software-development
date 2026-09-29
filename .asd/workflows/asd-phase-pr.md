# ASD Workflow: PR

The main orchestrator owns this workflow and delegates no orchestration role.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

## Open mode

1. Read config, state, plan, reviews, test-plan with its segments (`artifact-layout.md` "Test plan"), retrospective and stubs. Confirm every plan task, AC trace, required review verdict (reviews-green over every impl-review wave per `sprint-lifecycle.md` "PR phase"; satisfied per its "State recovery", External Review's skip form and legacy values included), full-suite record, lint/build record and stub rule; `pr` requires review DoD plus a completed `retro` (`checkpoints.md`), so `<sprint>/retrospective.html` is a DoD input and its absence blocks. Re-run required checks after a relevant diff. A failed or missing check blocks.
2. Write `phase=pr` inline. For self-hosting, first bump version and changelog, commit them on the sprint branch, then compose the PR title/body.
3. Apply the active policy to publication. Adaptive publication needs recorded scope authority, evidence and host permission; otherwise request the user. Open the PR per `git-strategy.md` "PR creation"; a `gh` failure is `FAILED` naming the fix given there. On successful PR creation, write `state.json.pr` and append the decision/log record, then commit both and push the sprint branch before step 4, so the squash merge carries `pr.number` to base (`sprint-lifecycle.md` "PR phase" "Merged-unclosed"). Do not archive or mark done.
4. Emit `NEXT: await-merge`; the active sprint remains at its normal path while the PR is open.

## Merge mode

1. Re-enter from either active or legacy archived path. Merge the sprint PR through `gh` per `git-strategy.md` "Merging a PR", unless `gh pr view <pr.number> --json state` already reports `MERGED`; a `gh` failure is `FAILED` naming the fix ("PR creation"). Confirm the merge landed before proceeding; a PR that did not merge leaves the sprint active.
2. Write nothing — no state, archive move or tag, on any branch: the closure request belongs to `asd-sprint`, the terminal write and self-hosting tag to the next sprint's scope step 1 (`sprint-lifecycle.md` "PR phase"). Emit `NEXT: await-closure`.

## Artefacts

- `state.json.pr` and decisions-log records (open mode)
- PR when authorized

## Return contract

```
PHASE: pr | SPRINT: <NNN-slug> | STATUS: <pr-open|merged|blocked|aborted> | NEXT: <await-merge|await-closure|halted>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/git-strategy.md`
- `.asd/rules/artifact-layout.md`
