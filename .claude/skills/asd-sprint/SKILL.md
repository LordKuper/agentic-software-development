---
# ASD generated. Edit .asd/skills/asd-sprint/SKILL.md. source_digest=sha256:f92640c2fdc99d180d29acc01eb27682587ea10873623ba8bbd130036ed9338c content_digest=sha256:aad25ee6d91b7cf6dc65378d681839b000954a07fd30ad20c9c8af2ca90d6f25 asd_version=14.11.0 schema=1
name: asd-sprint
description: "Starts a new ASD sprint or resumes the active one, dispatching the matching asd-phase-* skill and routing phase signals back to the user. Use when the user runs /asd-sprint or asks to start, continue, resume, or work on an ASD sprint."
allowed-tools: "Read Glob Grep Bash AskUserQuestion Skill Task"
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Sprint

## Purpose

Start a new sprint or resume the active one: dispatch the matching phase skill, route its signal to the user.

## Preconditions

```json
{"requires": ["at most 1 active sprint (Step 1)"], "else": "more than 1 active: Step 1 FAILED", "ops": ["read files: custom-common-rules.md", "run command: git branch --show-current; git fetch, git show, git log, git ls-remote --tags origin, gh release view, gh issue view (release retry check); git status --porcelain, git ls-files, git add/git commit only changed tracked attribution files (Attribution check)", "run command: node .asd/runtime.js attribution-check (writes only attribution and its sync-state record per Attribution check below)", "no other writes: phase skills and their inline orchestrator own writes"]}
```

## Steps

### Step 0: fast-forward the base branch
Before Step 1, fast-forward local `git.base_branch` exactly as `git-strategy.md` "Branch" states: a refusal halts and asks the user; an unreachable remote warns and continues on local state. Rules, workflows and phase skills are read only after this step; this skill's own text and the session-start files are the pre-fetch copy.

### Step 1: detect active sprint
- A sprint is active while `state.json.phase != "done"`, its folder at `.asd/sprints/<NNN-slug>/` or, legacy, `.asd/sprints/archived/<NNN-slug>/` (archived before closure by an older workflow version). Search repo for `.asd/sprints/*/state.json` (excluding `archived/`) UNION `.asd/sprints/archived/*/state.json` where `phase != "done"`
- Each, whatever its `phase`: `gh pr view <pr.number> --json state,mergeCommit` reporting `MERGED` — or, with no `pr.number`, a `MERGED` hit of `gh pr list --head <state.branch> --state all --json number,state,mergeCommit` (`sprint-lifecycle.md` "PR phase" "Merged-unclosed"), its number carried to the closure write — makes it **merged-unclosed**, whatever `pr.state` records (legacy `closure-pending` included) — unless `gh pr list --head chore/finalize-sprint-<NNN-slug> --state all` finds a legacy companion PR: an `OPEN` one is merged per `git-strategy.md` "Merging a PR"; an `OPEN` or `MERGED` one closes the sprint on `git.base_branch`, so it is no longer active and gets no closure write.
- A `CLOSED` head-branch hit counts as no hit. A head-branch lookup that cannot reach `gh` outside `phase="pr"` warns and resumes the sprint ("Merged-unclosed"); any other `gh` failure is FAILED naming the fix for its cause (`git-strategy.md` "PR creation").
- 0 active → new-sprint flow
- 1 active, merged-unclosed, `self_hosting: enabled`, its release commit, `v<asd_version>` tag or release missing, or an included issue still open → release retry ("Merged-unclosed"): request user decision, each time — retry dispatches `asd-phase-pr` with the confirmed PR number, its merge mode running only the missing release and issue-close steps; continue takes the route below, carrying that choice
- 1 active, merged-unclosed otherwise → new-sprint flow (Step 2A), carrying its path and the merged PR's number detection confirmed, whichever copy or lookup it came from; exempt from the one-active limit, the next sprint's scope archives it (`sprint-lifecycle.md` "PR phase")
- 1 active otherwise → resume flow; an `OPEN` head-branch hit changes nothing here, pr open mode adopting it at `phase="pr"` only ("Merged-unclosed")
- >1 → emit FAILED "multiple active sprints found, manual cleanup needed"

### Step 2A: new-sprint flow
1. Read `.asd/project/config.yaml`
2. `git status` — if dirty, request user decision: commit / stash / abort
2a. Unless `self_hosting: enabled`: `node "$(git rev-parse --show-toplevel)/.asd/skills/asd-update/update.js" --check-version`. `newer: true` → request user decision (hard, `checkpoints.md` "Gate policy"): update to v<remote> now, then start | continue on v<local>; carry the answer to scope. A warning → continue.
3. Collect scope as a plain chat message; request user decision only to confirm start or abort
4. Delegate to skill `asd-phase-scope`, passing scope text, any merged-unclosed sprint Step 1 carries and step 2a's answer; its step 1 asks the workflow choice, runs the closure write and, on *update*, the update
5. On COMPLETED → "Attribution check", then advance per Step 3

### Step 2B: resume flow
1. Read `.asd/sprints/<NNN-slug>/state.json` and its frozen workflow definition. Apply `sprint-lifecycle.md` "Sprint state recovery" where needed. Run `node .asd/runtime.js timing-recover --ledger <sprint>/timing.jsonl`, then "Attribution check"
2. Show: sprint id, workflow, current phase, review iteration (`reviews.design.iteration` when phase=`design-review`; when phase=`impl-review`, `wave <K>/<n>` = `reviews.impl.wave`/`waves.length` plus that wave's `iteration`, a legacy flat `reviews.impl` read as wave 1 of 1 — `sprint-lifecycle.md` "Review iteration counters"), last review verdict (if any)
3. Request user decision: resume (default) | re-run current phase | re-run earlier phase | abort sprint. Offer only phases of the frozen workflow. Exclude `design`, `design-review` and `design-promote` only under the Standard collapse test (`sprint-lifecycle.md` "Design/design-review/design-promote collapse"), which includes the effective mockup format.
4. Delegate to the matching phase skill. *resume* re-enters `phase`, except `phase="design-promote"` under the collapse test (`standard` only; `sprint-lifecycle.md` "Design/design-review/design-promote collapse"): then dispatch `plan`. *re-run earlier phase* = rollback: its inline state update applies **rollback reset** (`sprint-lifecycle.md` "Review iteration counters"), reading the definition's `rollback_reset`.

### Attribution check
Run on the sprint branch only (after scope COMPLETED in Step 2A, at Step 2B step 1), so its edit never reaches `git.base_branch` or Step 2A step 2's gate. Silent unless `git.ai_attribution: disabled`. First `git status --porcelain --untracked-files=no -- .claude/settings.json .claude/settings.local.json .asd/sync-state.json`: a listed file is a user change. Run `node .asd/runtime.js attribution-check [-- <listed settings files>]`, which skips those files with a commit-or-revert warning and still handles the rest and the Codex hint, and inserts the owned `attribution` value into `.claude/settings.json` and records it in `.asd/sync-state.json`; relay its fix, hint and warning lines (a warning never blocks). Commit as `chore(sprint): reset AI attribution` (`git-strategy.md` "Commit before review") only the files that were not listed, are tracked (`git ls-files --error-unmatch -- <file>` succeeds) and that a fix line names; an untracked or ignored file, `settings.local.json` typically, is edited but never staged.

### Step 3: phase chain advancement
After any phase skill returns:
- `COMPLETED` → validate the phase skill's `NEXT:` against the frozen definition's `next[<phase>]`. Missing or disallowed target → relay FAILED, halt. For `NEXT: done`, halt and leave archiving to the next sprint's scope. For `NEXT: await-merge`, halt with the sprint active at `phase="pr"`; resume enters merge mode. Dispatch every other allowed target.
- `FAILED` → take the escalation consult (`agent-protocol.md` "Relay"), then relay with the Advisor line, halt
- `QUESTION` → take the escalation consult, then relay per `agent-protocol.md` "Relay" `QUESTION` with the Advisor line; halt until the reply, then re-delegate the phase skill
- `ABORT — precondition not met` → relay, halt

## Rules

- must: before a phase-skill delegation run `node .asd/runtime.js rotate-decisions --sprint <sprint> --to <phase>` (condition: `.asd/rules/artifact-layout.md` "Decisions log"); when it prints `"rotated": true`, commit the renamed and recreated files as `chore(sprint): rotate log for <phase>`. None for new-sprint scope (no sprint folder yet).
- must: phase ops (`sprint-lifecycle.md` "Operation timing"): before each phase-skill delegation run `node .asd/runtime.js timing --ledger <sprint>/timing.jsonl --open <phase> --kind phase`, Step 3 closing the returned phase in the same call (`--close <phase>`); on return close it `done` on `COMPLETED`, `--outcome interrupted` on `FAILED`/`ABORT`; a `QUESTION` halt leaves it open: the relayed question opens a `user-wait` (`gate`: short question label) closed once the answer is processed, and the re-delegation reuses the open phase op (a repeat open is skipped). None for new-sprint scope (its step 1 opens its own), when pr open mode ran (it closed its own), for merge mode (resume at `phase="pr"`, `pr.state="open"`) or the release retry.
- must: re-detect state on every invocation; the user may interrupt anytime.
- never: delegate to a skill outside `## Delegates`.

## Delegates

```json
{"agents": ["asd-advisor"], "skills": ["asd-phase-* of the frozen workflow's phases (.asd/workflows/<workflow>.json)", "asd-init sprint-mediated mode: sprint.md-declared settings change (asd-phase-scope.md step 2b), plan-declared one (asd-phase-impl.md step 6)", "asd-update sprint-mediated mode: Step 2A update choice (asd-phase-scope.md step 1)"]}
```

## Outputs

```json
["<sprint>/decisions-log.md rotation (artifact-layout.md Decisions log)", "<sprint>/timing.jsonl phase ops (runtime.js timing)"]
```

## Return

```
SKILL: asd-sprint | SPRINT: <NNN-slug> | PHASE: <phase> | STATUS: <complete|in-progress|blocked|aborted> | NEXT: <next-phase|await-merge|done|halted-on-question|halted-on-failure>
```

## References
- `.asd/rules/sprint-lifecycle.md` (exit criteria and "Phase table" for on-demand reference)
- `.asd/rules/agent-protocol.md` (signals, relay)
- `.asd/rules/checkpoints.md` (precondition chain, auto-abort)
- `.asd/rules/core.md` (interaction protocol)
