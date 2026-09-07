[REVIEW-impl-efficiency]: APPROVE

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high
- **Scope**: incremental, 22 paths (`60a991a…08ea5d1`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above the `high` floor; no over-engineering (`OE-1`..`OE-13`) or structure/cohesion (`SC-1`) hit in the change surface | — |

## Judgment notes (no finding raised)

- **`buildInvocation` seam** (`.asd/runtime.js:34-43`) — not `OE-5`/`OE-6`. Two real runtime call sites (direct shape; forced-PowerShell retry), returns plain data, adds no indirection layer or dispatch, and retires an open stub. `viaPowerShell` is not a premature flag: the retry path is a real caller choosing the non-default. `platform` is environment-supplied, not a fixed-default knob. Net weight removed, not moved.
- **Deletions verified as real removal, not relocation**: `runLocal` returns exactly `{ok}` and both consumers read only `.ok`; `5.0.0.js` calls the exported `sync.removeIfEmptyDir` instead of a private copy, with the `update.js` write-then-require ordering pinned by an existing regression test; `renderFullFileItem` states the `item.source` invariant instead of an unreachable branch; `t_review-scope.json` carries exactly the six fields the rule doc enumerates, with no `mode`/`commits[]` residue.
- **`SC-1` on `.asd/runtime.js`** — `pass` by standing user override (the file stays one file); only new code judged. Nothing added this wave introduces a second responsibility cluster.
- **`5.0.0.js` dual symlink guard** — `staysWithinRepo` (realpath containment, catching a symlinked *parent*) is not subsumed by `intactGeneratedView`'s `isSymlink(target)`; both guard a destructive delete. Not `OE-7`, not `CV-1`.
- **Performance sections reviewed** (executables in scope). No `PA-*`: IO is bounded (fixed probe timeout, at most two `spawnSync` per preflight, negative cache with a 1 h ceiling), entries filtered on read, no n+1, no large-collection copy, no deep clone, no serialize/parse roundtrip beyond the JSON stdin payload that is the transport itself. No `ALG-*`: `runApply` indexes plan and orphans through `Map`s. `HP-1`: nothing here is a measured hot path.

## Coverage

Manifest: [`efficiency.manifest.json`](efficiency.manifest.json) (digest `bb663058…bd114`). Validated ledger: [`efficiency.ledger.json`](efficiency.ledger.json). `validate-ledger` → `{"ok":true}`. `PERF_BUDGET`/`PB-1`/`RG-1` are `n/a: no budgets defined`, confirmed against `custom-coding-rules.md`.

## Verdict
APPROVE

## Next action
Reviewer done — efficiency contributes an `APPROVE` to this iteration's DoD roster and latches.

## Escalations
None.

## Out-of-rubric observation (outside this ledger, recorded for the orchestrator)
This wave's deletion of `isSelfHostingRepo` from `.asd/sync.js` left two canonical skill files citing it by name — `.asd/skills/asd-init/SKILL.md:23` and `.asd/skills/asd-update/SKILL.md:14`, plus their four generated views. Neither file is in this iteration's scope list, so it falls outside this ledger; flagged because the change itself is what made those references stale.
