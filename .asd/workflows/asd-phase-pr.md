# ASD Workflow: PR

The main orchestrator owns this workflow and delegates no orchestration role.

Append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log".

## Open mode

1. Read config, state, plan, reviews, test-plan, retrospective and stubs. Confirm every plan task, AC trace, required review verdict, full-suite record, lint/build record and stub rule; `pr` requires review DoD plus a completed `retro` (`checkpoints.md`), so `<sprint>/retrospective.html` is a DoD input and its absence blocks. Re-run required checks after a relevant diff. A failed or missing check blocks.
2. Write `phase=pr` inline. For self-hosting, first bump version and changelog, commit them on the sprint branch, then compose the PR title/body.
3. Apply the active policy to publication. Adaptive publication needs recorded scope authority, evidence and host permission; otherwise request the user. On successful PR creation/preparation, write `state.json.pr` and append the decision/log record. Do not archive or mark done.
4. Emit `NEXT: await-merge`; the active sprint remains at its normal path while the PR is open.

## Merge and closure mode

1. Re-enter from either active or legacy archived path. Merge the sprint PR per `git-strategy.md` "Merging a PR" — the orchestrator merges it where the host allows, otherwise it reports the ready state and reads the configured human merge evidence. Confirm the merge landed before proceeding; a PR that did not merge leaves the sprint active.
2. Set `pr.state="closure-pending"`, retain `phase="pr"`, then present completion evidence and request explicit closure approval. PR publication, merge, `auto_pr`, or an adaptive policy never satisfies it. On refusal or feedback, leave the sprint active and unarchived.
3. Only after recording closure approval in the active checkpoint, prepare a companion branch from the updated `git.base_branch` in an isolated checkout; retain the original active checkpoint until the companion is confirmed merged. On resume, locate the existing companion PR before creating another; move the sprint folder to archive and write `pr.state="merged"`, `phase="done"`, `updated_at`, `archived_at` there. Open and merge that companion PR through the configured Git flow. A merge failure leaves the original checkpoint closure-pending and records the companion PR identifier there; never record terminal state only on the already-merged sprint branch.
4. After the companion PR merges, create the self-hosting tag/release from that merge commit.
5. Emit `NEXT: done`.

## Artefacts

- `state.json.pr` and decisions-log records
- PR/release when configured and authorized
- terminal archived sprint only after the hard closure gate

## Return contract

```
PHASE: pr | SPRINT: <NNN-slug> | STATUS: <pr-open|complete|blocked|aborted> | NEXT: <await-merge|done|halted>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/git-strategy.md`
- `.asd/rules/artifact-layout.md`
