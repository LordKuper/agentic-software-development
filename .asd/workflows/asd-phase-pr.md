# ASD Workflow: PR

Orchestration body for the `asd-phase-pr` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl-review DoD met (all required reviewers APPROVE same iteration)
- `state.json.phase` advanced from `impl-review`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, plan.md, reviews/, `.asd/project/stubs.md`
- search repo: scan code for `// TODO(sprint-<NNN-slug>):` markers; verify against stubs.md
- request user decision: final PR-opening confirmation, rollback on failure
- run command: `git`/`gh` operations, `commands.yaml` `test`/`lint`
- delegate to agent `asd-pm` for DoD check, PR creation, merge check, archival, decisions-log

## Mode detection

Read `<sprint>/state.json` first:
- `pr` absent/null → **open mode** (DoD + create PR; no archival)
- `pr.state = "open"` → **merge mode** (check merge; archive when merged)
- `pr.state = "merged"` → already archived; emit COMPLETED, NEXT=done

Archival never happens at PR creation — only on a later re-entry after the PR is merged. Re-entry is driven by the sprint-resume dispatch (sprint stays active while `pr.state="open"`).

## Workflow — open mode

1. Read `.asd/project/config.yaml` (`git.base_branch`, `git.branch_pattern`, `git.gh_enabled`, `git.auto_pr`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → confirm impl-review DoD met
3. Delegate to agent `asd-pm`: update `state.json` (phase=pr)
4. **DoD verification** — delegate to agent `asd-pm` with payload (config, sprint paths, stubs path, commands.yaml):
   - **Plan completion**: read `<sprint>/plan.md`, verify every `- [ ]` is `- [x]`
   - **AC coverage**: cross-check PRD AC-N references in plan tasks against impl-review documentation verdict
   - **Reviews green**: read latest `<sprint>/reviews/impl/iter-NN/` (highest `reviews.impl.iteration`), parse first-line gate verdict tokens for all required reviewers; ALL must be `APPROVE`
   - **Stub block**:
     - read `.asd/project/stubs.md`; filter `Sprint = <current-NNN-slug>` AND Reason NOT starting with `(accepted-debt)` → must be empty
     - search code for `// TODO(sprint-<current-NNN-slug>):` markers; cross-check every marker has matching stubs.md entry (orphan markers = block)
   - **Tests pass**: run command `commands.yaml` `test`; non-zero exit = block
   - **Lint clean**: run command `commands.yaml` `lint`; non-zero exit = block
   - **PR self-review checklist** (per `git-strategy.md`): PM confirms each item explicitly (studied existing code, can explain every line, scoped to feature, why-not-what commits)
   - on ANY block: relay specific failure; halt phase until fixed (user may dispatch fix or accept-debt)
5. **PR creation confirmation** — delegate to agent `asd-pm`:
   - compose PR title + body via `t_pr-description.md`
   - request user decision in `language.chat`: confirm open PR / edit body / abort
   - on confirm:
     - **`git.gh_enabled=true` and `git.auto_pr=true`**: stage uncommitted (none should remain), push branch, run command `gh pr create --title <title> --body <body> --base <base_branch>`
     - **`git.gh_enabled=true` and `git.auto_pr=false`**: push branch, print PR-ready summary (title, body, compare URL); wait for user to open PR manually
     - **`git.gh_enabled=false`**: push branch, print PR-ready summary (title, body, compare URL hint)
   - on edit: re-compose with feedback, loop
   - on abort: emit ABORT
   - on success: write `state.json.pr` = `{ number, url, state: "open" }` (number null when `gh_enabled=false`); keep `phase=pr`; append decisions-log entry ("sprint <NNN-slug> PR opened: <url-or-summary>")
6. Emit COMPLETED, STATUS=pr-open, NEXT=await-merge. Sprint stays active awaiting merge; do NOT archive.

## Workflow — merge mode

1. **Merge check** — delegate to agent `asd-pm`:
   - `git.gh_enabled=true`: run command `gh pr view <pr.number> --json state -q .state`. `MERGED` → proceed to archival. Any other state (`OPEN`/`CLOSED`) → relay "PR #<number> not merged yet (state: <state>)" and halt (re-run pr after merging). `CLOSED` without merge → relay; user decides reopen or abort.
   - `git.gh_enabled=false`: request user decision in `language.chat` — "PR merged?" yes / not yet. `not yet` → halt. `yes` → proceed.
2. **Sprint archival** — delegate to agent `asd-pm`:
   - move folder `.asd/sprints/<NNN-slug>/` → `.asd/sprints/archived/<NNN-slug>/` (`git mv`)
   - commit move with message `chore: archive sprint <NNN-slug>` and push to sprint branch
   - update `state.json` (`pr.state="merged"`, phase=done, archived_at)
   - append decisions-log entry ("sprint <NNN-slug> completed, archived, PR <url-or-summary>")
   - emit COMPLETED, STATUS=complete, NEXT=done

## Block-on-fail behaviour

Any DoD check failing → halt with structured message:

```
PR BLOCKED — reason: <which check>
Details: <specific failure>
Action: <suggested next step>
```

User decides: fix and retry, accept-debt (stubs only), or abort sprint.

## Artefacts produced
Open mode:
- Pushed git branch (and PR when `gh_enabled+auto_pr`)
- `state.json.pr` = `{number, url, state:"open"}`; decisions-log PR-opened entry

Merge mode:
- Archived sprint at `.asd/sprints/archived/<NNN-slug>/`
- Archive commit on sprint branch
- decisions-log final entry
- Updated `state.json` (`pr.state="merged"`, phase=done, archived_at)

## Agents delegated to
- `asd-pm` (DoD verification, PR composition, merge check, archival, decisions-log)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: pr | SPRINT: <NNN-slug> | STATUS: <pr-open|complete|blocked|aborted> | NEXT: <await-merge|done|halted> | PR: <url-or-summary-or-none>
```
`pr-open` (open mode success): PR opened, sprint awaits merge, NEXT=await-merge. `complete` (merge mode success): merged + archived, NEXT=done.

## References
- `.asd/rules/sprint-lifecycle.md` (pr phase contract, sprint immutability)
- `.asd/rules/git-strategy.md` (PR self-review checklist, branch ops, stubs block rule)
- `.asd/rules/checkpoints.md` (final PR confirmation gate)
- `.asd/rules/artifact-layout.md` (sprint archival path)
- `.asd/rules/language-policy.md` (PR title English, body docs-lang)
- Templates: `t_pr-description.md`, `t_decisions-log.md`
