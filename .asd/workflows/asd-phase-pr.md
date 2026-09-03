# ASD Workflow: PR

Orchestration body for the `asd-phase-pr` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- impl-review DoD met (all required reviewers APPROVE or APPROVE-latched, `sprint-lifecycle.md` "APPROVE latch")
- `state.json.phase` advanced from `impl-review`

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, plan.md, reviews/, `.asd/project/stubs.md`
- search repo: scan code for `// TODO(sprint-<NNN-slug>):` markers; verify against stubs.md
- request user decision: final PR-opening confirmation, rollback on failure
- run command: `git`/`gh` operations, `commands.yaml` `test`/`lint`
- delegate to agent `asd-pm` for DoD check, PR creation, merge check, archival, decisions-log

## Mode detection

Read `<sprint>/state.json` first — check both the active path `<sprint>/state.json` and, if absent there, `.asd/sprints/archived/<NNN-slug>/state.json` (the folder may already be archived pre-merge; see below):
- `pr` absent/null → **open mode** (DoD + create PR + pre-merge archival)
- `pr.state = "open"` → **merge mode** (check merge; on merged, finalize terminal state + tag/release)
- `pr.state = "merged"` → already finalized; emit COMPLETED, NEXT=done

The sprint folder physically moves to `.asd/sprints/archived/<NNN-slug>/` as part of **open mode**, immediately after the PR is created — bundled into the same PR as a dedicated commit, so it merges atomically with the sprint's own changes and survives squash-merge + auto-delete-branch strategies that would otherwise make a later "push to sprint branch" impossible. The terminal signal (`phase=done`, `pr.state="merged"`) is still gated on a confirmed merge and is written in **merge mode**, re-entered via the sprint-resume dispatch (sprint counts as active — see `sprint-lifecycle.md` "PR phase" — while `phase != done`, regardless of which of the two folder locations its `state.json` currently lives in).

## Workflow — open mode

1. Read `.asd/project/config.yaml` (`git.base_branch`, `git.branch_pattern`, `git.gh_enabled`, `git.auto_pr`, `language.chat`, `language.docs`)
2. Read `<sprint>/state.json` → confirm impl-review DoD met
3. Delegate to agent `asd-pm`: update `state.json` (phase=pr)
4. **DoD verification** — delegate to agent `asd-pm` with payload (config, sprint paths, stubs path, commands.yaml):
   - **Plan completion**: read `<sprint>/plan.md`, verify every `- [ ]` is `- [x]`
   - **AC coverage**: cross-check AC-N references in plan tasks (PRD AC-N if `documents.prd` enabled, else `sprint.md`'s own AC-N — `sprint-lifecycle.md` "Optional documents") against impl-review Correctness reviewer's verdict/AC→code trace (exclusive owner of this trace — `asd-reviewer-correctness`)
   - **Reviews green**: read `state.json.reviews.impl.verdicts["iter-NN"]` for the highest `reviews.impl.iteration` (fallback: parse first-line gate verdict tokens from `<sprint>/reviews/impl/iter-NN/` review files if `state.json` verdicts are stale or absent); for the reviewers actually required this sprint (`review-policy.md` DoD table — a reviewer never dispatched, e.g. design-review UI with no ux-spec, is not counted), satisfied-vs-blocking semantics per `sprint-lifecycle.md` "State recovery" (sole SSoT, not restated here): a bare `APPROVE` satisfies; External Review's `"APPROVE (skipped: <reason>)"` availability-skip verdict satisfies identically to a bare `APPROVE`; a **legacy branch** — a pre-4.0.0 `"skipped: <predicate>"` string (no `APPROVE` prefix), persisted by a consumer that upgraded mid-sprint from the retired `scoped_fan_out` agent-level dispatch skip — also counts as satisfied; an absent key satisfies only when `reviews.impl.latched` carries that reviewer's key (`sprint-lifecycle.md` "APPROVE latch"), otherwise it blocks; `CONCERNS`, `FAIL`, or `null` always blocks
   - **Stub block**:
     - read `.asd/project/stubs.md`; filter `Sprint = <current-NNN-slug>` AND Reason NOT starting with `(accepted-debt)` → must be empty
     - search code for `// TODO(sprint-<current-NNN-slug>):` markers; cross-check every marker has matching stubs.md entry (orphan markers = block)
   - **Tests pass / Lint clean**: content-scoped, not sha-equality (raw `git rev-parse HEAD` equality never holds — the recording commit itself, plus later phase-transition commits, always move HEAD past the recorded sha). Run `git diff --quiet <recorded HEAD>...HEAD -- . ':(exclude).asd/sprints/**' ':(exclude).asd/project/**'`, where `<recorded HEAD>` is the `HEAD` field in `<sprint>/test-plan.md`'s `Suite run` section — the sha impl-review's terminal full-suite step (`sprint-lifecycle.md` "Impacted test set") last verified the full suite at, which is also the last point any code/test/stub file can change before `pr`. Empty diff (exit 0) → nothing changed since that recording, whatever the source; trust the recorded `Suite run` pass, skip re-running. The check is sha-independent, not read-only-dependent: it re-runs on ANY non-empty diff since the recording (exit 1) — a review-fix commit, or the rare in-phase test-defect fix inside impl-review's terminal step — via `commands.yaml` `test` then `lint`; non-zero exit on either = block
   - **PR self-review checklist** (per `git-strategy.md`): PM confirms each item explicitly (studied existing code, can explain every line, scoped to feature, why-not-what commits)
   - **Version + Changelog** (`self_hosting: enabled` only, `git-strategy.md` "Versioning & Changelog"): bump `asd_version` in `.asd/release-manifest.json` per SemVer inferred from this sprint's commit types; add matching `## v<version>` section to root `CHANGELOG.md`. Then verify `max(.asd/migrations/*.js` filename-derived version`) <= asd_version` — a migration shipped this sprint whose target version the SemVer bump doesn't reach would never go pending for any consumer; on violation, block same as any other DoD check below rather than silently under-bumping
   - on ANY block: relay specific failure; halt phase until fixed (user may dispatch fix or accept-debt)
5. **PR creation confirmation** — delegate to agent `asd-pm`:
   - compose PR title (Conventional Commits format) + body via `t_pr-description.md` (fill Version section when `self_hosting: enabled`, drop it otherwise)
   - request user decision in `language.chat`: confirm open PR / edit body / abort
   - on confirm:
     - **`git.gh_enabled=true` and `git.auto_pr=true`**: stage uncommitted (none should remain), push branch, run command `gh pr create --title <title> --body <body> --base <base_branch>`
     - **`git.gh_enabled=true` and `git.auto_pr=false`**: push branch, print PR-ready summary (title, body, compare URL); wait for user to open PR manually
     - **`git.gh_enabled=false`**: push branch, print PR-ready summary (title, body, compare URL hint)
   - on edit: re-compose with feedback, loop
   - on abort: emit ABORT
   - on success: write `state.json.pr` = `{ number, url, state: "open" }` (number null when `gh_enabled=false`); keep `phase=pr`; append decisions-log entry ("sprint <NNN-slug> PR opened: <url-or-summary>"); commit and push this to the sprint branch
6. **Pre-merge archival** — delegate to agent `asd-pm`, immediately after PR creation succeeds (DoD already passed, this is not a new gate):
   - `git mv .asd/sprints/<NNN-slug>/` → `.asd/sprints/archived/<NNN-slug>/`
   - in the moved `state.json`: add `archived_at` = now (ISO8601); leave `phase` and `pr.state` unchanged (still `pr` / `"open"` — the sprint is not yet actually merged, only its folder has moved)
   - append decisions-log entry ("sprint <NNN-slug> files archived pre-merge, pending PR #<number> merge")
   - commit (`chore: archive sprint <NNN-slug>`), push to the same sprint branch — this lands as an additional commit on the already-open PR, so it squash-merges together with the sprint's own changes
7. Emit COMPLETED, STATUS=pr-open, NEXT=await-merge. Sprint stays active awaiting merge (`phase` is still `pr`, not `done`) even though its folder already lives under `archived/`.

## Workflow — merge mode

Read `state.json` from `.asd/sprints/archived/<NNN-slug>/` — open mode's step 6 archives the folder unconditionally (regardless of `git.gh_enabled`/`git.auto_pr`; step 5 writes `state.json.pr` in every branch, including `gh_enabled=false`, which is what step 6 keys off), so by the time merge mode ever re-enters, the folder is always already there.

1. **Merge check** — delegate to agent `asd-pm`:
   - `git.gh_enabled=true`: run command `gh pr view <pr.number> --json state -q .state`. `MERGED` → proceed. Any other state (`OPEN`/`CLOSED`) → relay "PR #<number> not merged yet (state: <state>)" and halt (re-run pr after merging). `CLOSED` without merge → relay; user decides reopen or abort (an abort here leaves the folder pre-archived with `phase != done` — still detected as active on the next `/asd-sprint` invocation, so nothing is lost; a manual folder move back to the active path is a legitimate recovery action if the user wants to resume work under the original sprint id).
   - `git.gh_enabled=false`: request user decision in `language.chat` — "PR merged?" yes / not yet. `not yet` → halt. `yes` → proceed.
2. **Terminal state update** — delegate to agent `asd-pm`: update the already-archived `state.json` — `pr.state="merged"`, `phase=done`, `updated_at`=now. This is the one deliberate exception to "archived sprints never modified" (`artifact-layout.md` "Sprint archival") — only this terminal transition, nothing else. Lands on `git.base_branch` via a PR like every other change (`git-strategy.md` "Finalize PR (autonomous)") — commit on a short-lived `chore/finalize-sprint-<NNN-slug>` branch, `gh pr create` a `chore(sprint-<NNN-slug>): finalize terminal state — PR #<N> merged` PR containing only this file, then `gh pr merge --squash` it immediately — no new user confirmation gate, no wait for a reply. On merge failure, halt and report the open PR for manual merge. No decisions-log append: `<sprint>/decisions-log.md` already lives inside the archived, immutable folder — the merge fact is recorded in `state.json.pr.state`/`phase` and in both merged PRs.
3. **Tag + release** (`self_hosting: enabled` only, `git-strategy.md` "Versioning & Changelog") — delegate to agent `asd-pm`:
   - create annotated tag `v<asd_version>` on the merge commit; push tag
   - `gh release create v<asd_version> --title v<asd_version> --notes-file` the matching `CHANGELOG.md` section
4. Emit COMPLETED, STATUS=complete, NEXT=done.

## Block-on-fail behaviour

Any DoD check failing → halt with structured message:

```
PR BLOCKED — reason: <which check>
Details: <specific failure>
Action: <suggested next step>
```

User decides: fix and retry, accept-debt (stubs only), or abort sprint.

## Escalation

On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Artefacts produced
Open mode:
- Pushed git branch (and PR when `gh_enabled+auto_pr`)
- `state.json.pr` = `{number, url, state:"open"}`; decisions-log PR-opened entry
- Self-hosting only: bumped `asd_version` in `.asd/release-manifest.json`, new `CHANGELOG.md` section
- Sprint folder moved to `.asd/sprints/archived/<NNN-slug>/` (dedicated commit on the sprint branch, part of the same PR); `state.json.archived_at` set; decisions-log pre-merge-archival entry

Merge mode:
- Self-hosting only: annotated tag `v<asd_version>`, GitHub Release
- Updated `state.json` (already at the archived path): `pr.state="merged"`, `phase=done`, `updated_at` — the one write an archived sprint's `state.json` still receives after its folder move

## Agents delegated to
- `asd-pm` (DoD verification, PR composition, merge check, tag/release, archival, decisions-log)

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: pr | SPRINT: <NNN-slug> | STATUS: <pr-open|complete|blocked|aborted> | NEXT: <await-merge|done|halted> | PR: <url-or-summary-or-none>
```
`pr-open` (open mode success): PR opened, sprint folder already archived on the branch, awaits merge confirmation, NEXT=await-merge. `complete` (merge mode success): merge confirmed, terminal state finalized, NEXT=done.

## References
- `.asd/rules/sprint-lifecycle.md` (pr phase contract, sprint immutability, self-hosting versioning, impacted test set)
- `.asd/rules/git-strategy.md` (PR self-review checklist, branch ops, stubs block rule, versioning & changelog)
- `.asd/rules/checkpoints.md` (final PR confirmation gate)
- `.asd/rules/artifact-layout.md` (sprint archival path)
- `.asd/rules/language-policy.md` (PR title English, body docs-lang)
- Templates: `t_pr-description.md`, `t_decisions-log.md`
