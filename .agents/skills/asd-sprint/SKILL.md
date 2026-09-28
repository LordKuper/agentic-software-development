---
# ASD generated. Edit .asd/skills/asd-sprint/SKILL.md. source_digest=sha256:6869786d00fed1e30f0f6a557ab4f289137af57e4aea83bd04d9f9ac9869a349 content_digest=sha256:fc767f3710a89ce14cb0e28332c0690ad47cefbb3547235195d6f2b02319289e asd_version=13.3.0 schema=1
name: asd-sprint
description: "Starts a new ASD sprint or resumes the active one, dispatching the matching asd-phase-* skill and routing phase signals back to the user. Use when the user runs $asd-sprint or asks to start, continue, resume, or work on an ASD sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Sprint

## Preconditions
- `.asd/project/config.yaml` exists (else: tell user `$asd-init`)
- ≤1 active sprint. A sprint counts as active while `state.json.phase != "done"`, whether its folder currently lives at `.asd/sprints/<NNN-slug>/` or already at `.asd/sprints/archived/<NNN-slug>/` (the `pr` phase moves the folder before the terminal `phase=done` write — see `sprint-lifecycle.md` "PR phase"). Only `phase=done` entries under `archived/` are excluded.

## Operations used
- Read files / search repo — detect active sprint; read state.json, its frozen workflow definition `.asd/workflows/<workflow>.json` (`sprint-lifecycle.md` "Workflows"), config.yaml, custom-common-rules.md
- Run command — `git status`, `git branch --show-current`; decisions-log rotation (rename, copy template, commit those paths)
- Request user decision — new-sprint confirm, resume/abort choice (never free-form scope text)
- Delegate to skill — phase skills, plus `asd-init` per "Skills dispatched"
- No other writes — phase skills and their inline orchestrator own writes

## Workflow

Before a phase-skill delegation below, rotate the decisions log when `.asd/rules/artifact-layout.md` "Decisions log" requires it.

### Step 1: detect active sprint
- Search repo for `.asd/sprints/*/state.json` (excluding `archived/`) UNION `.asd/sprints/archived/*/state.json` where `phase != "done"` (a sprint the `pr` phase already archived pre-merge, still awaiting merge confirmation)
- 0 active → new-sprint flow
- 1 active → resume flow
- >1 → emit FAILED "multiple active sprints found, manual cleanup needed"

### Step 2A: new-sprint flow
1. Read `.asd/project/config.yaml` (confirm init complete)
2. `git status` — if dirty, request user decision: commit / stash / abort
3. Collect scope as a plain chat message; request user decision only to confirm start or abort
4. Delegate to skill `asd-phase-scope`, passing scope text; its step 1 asks the workflow choice
5. On COMPLETED → advance per Step 3

### Step 2B: resume flow
1. Read `.asd/sprints/<NNN-slug>/state.json` and its frozen workflow definition
2. Show: sprint id, workflow, current phase, review iteration (`reviews.design.iteration` when phase=`design-review`; when phase=`impl-review`, `wave <K>/<n>` = `reviews.impl.wave`/`waves.length` plus that wave's `iteration`, a legacy flat `reviews.impl` read as wave 1 of 1 — `sprint-lifecycle.md` "Review iteration counters"), last review verdict (if any)
3. Request user decision: resume (default) | re-run current phase | re-run earlier phase | abort sprint. Re-run options offer only phases of the definition's `phases`; under the design-block collapse test (`standard` only, `sprint-lifecycle.md` "Workflows"), neither offers `design`, `design-review` or `design-promote`.
4. Delegate to the matching phase skill. *resume* re-enters `phase`, except `phase="design-promote"` under the collapse test (`standard` only; `sprint-lifecycle.md` "Design/design-review/design-promote collapse"): then dispatch `plan`. *re-run earlier phase* = rollback: its inline state update resets the review state per **rollback reset** in `sprint-lifecycle.md`, reading the definition's `rollback_reset` — `reviews.design`'s counter, `reviews.impl` to its seed wave node — with the severity floors.

### Step 3: phase chain advancement
After any phase skill returns:
- `COMPLETED` → read the phase skill's `NEXT:` field; a target outside the frozen definition's `next[<phase>]` → relay FAILED, halt; else dispatch that phase skill. `NEXT:` is authoritative — follows the definition's `phases` order except the design-block collapse (`audit` returns `NEXT: plan` under the collapse test; `design` returns `NEXT: plan` on its defensive-fallback no-op) and the `impl`/`impl-test`/`impl-review` cycle: `impl` always returns `NEXT: impl-test`; `impl-test` returns `NEXT: impl` on code defects (routes to impl test-fix mode) or `NEXT: impl-review` on a green suite; `impl-review` returns `NEXT: impl` on unresolved findings (routes to impl review-fix mode) or the next phase of `phases` on DoD met; `retro` always returns `NEXT: pr`, on its analysed and its empty-log branch alike. The `pr` phase ends the chain in two steps: open mode returns `NEXT: await-merge` (PR opened, sprint folder already archived onto the same branch, `phase` still not `done` — halt, no further dispatch); a later resume re-enters `pr` in merge mode, reading `state.json` from its archived location, and on `NEXT: done` writes the terminal state and the chain ends.
- `FAILED` → relay, halt
- `QUESTION` → relay pending question, halt until reply
- `ABORT — precondition not met` → relay, halt

User may interrupt anytime; asd-sprint re-detects state on next invocation.

## Skills dispatched
Phase skills of the frozen workflow's `phases` (`.asd/workflows/<workflow>.json`), plus `asd-init` sprint-mediated mode for a plan-declared settings change (`asd-phase-impl.md` step 6). No other skill set.

## Return contract (single line)
```
SPRINT: <NNN-slug> | PHASE: <phase> | STATUS: <complete|in-progress|blocked|aborted> | NEXT: <next-phase|done|halted-on-question|halted-on-failure>
```

## References
- `.asd/rules/sprint-lifecycle.md` (phase chain, signals, exit criteria)
- `.asd/rules/checkpoints.md` (precondition chain, auto-abort)
- `.asd/rules/core.md` (interaction protocol)
