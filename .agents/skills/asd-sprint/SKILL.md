---
# ASD generated. Edit .asd/skills/asd-sprint/SKILL.md. source_digest=sha256:ee74b0c897de563347eb3e876352b153d9555013db45a88ec052b3b7af87b7f7 content_digest=sha256:9a88a9cbf90b6fad4114ebe166aa641eee50570e5cac6f29b6c355647f123956 asd_version=2.0.0 schema=1
name: asd-sprint
description: "Starts a new ASD sprint or resumes the active one, dispatching the matching asd-phase-* skill and routing phase signals back to the user. Use when the user runs /asd-sprint or asks to start, continue, resume, or work on an ASD sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Sprint

## Preconditions
- `.asd/project/config.yaml` exists (else: tell user `/asd-init`)
- ≤1 active sprint. A sprint counts as active while `state.json.phase != "done"`, whether its folder currently lives at `.asd/sprints/<NNN-slug>/` or already at `.asd/sprints/archived/<NNN-slug>/` (the `pr` phase moves the folder before the terminal `phase=done` write — see `sprint-lifecycle.md` "PR phase"). Only `phase=done` entries under `archived/` are excluded.

## Operations used
- Read files / search repo — detect active sprint; read state.json, config.yaml, custom-common-rules.md
- Run command — `git status`, `git branch --show-current`
- Request user decision — new-sprint confirm, resume/abort choice
- Delegate to skill — phase skills only
- No direct writes — phase skills + PM own all writes

## Workflow

### Step 1: detect active sprint
- Search repo for `.asd/sprints/*/state.json` (excluding `archived/`) UNION `.asd/sprints/archived/*/state.json` where `phase != "done"` (a sprint the `pr` phase already archived pre-merge, still awaiting merge confirmation)
- 0 active → new-sprint flow
- 1 active → resume flow
- >1 → emit FAILED "multiple active sprints found, manual cleanup needed"

### Step 2A: new-sprint flow
1. Read `.asd/project/config.yaml` (confirm init complete)
2. `git status` — if dirty, request user decision: commit / stash / abort
3. Request user decision: confirm start; collect scope (free-form)
4. Delegate to skill `asd-phase-scope`, passing scope text
5. On COMPLETED → advance per Step 3

### Step 2B: resume flow
1. Read `.asd/sprints/<NNN-slug>/state.json`
2. Show: sprint id, current phase, review iteration (`reviews.design.iteration` when phase=`design-review`, `reviews.impl.iteration` when phase=`impl-review`), last review verdict (if any)
3. Request user decision: resume (default) | re-run current phase | re-run earlier phase | abort sprint
4. Delegate to the matching phase skill. *re-run earlier phase* = rollback: when target phase strictly earlier than a review's input-producing phase, the target phase skill's PM state update resets that review counter + severity floor per **rollback reset** in `sprint-lifecycle.md` (`reviews.design.iteration` resets when rolling back to `scope`/`audit`; `reviews.impl.iteration` resets when rolling back to `scope`…`plan`)

### Step 3: phase chain advancement
After any phase skill returns:
- `COMPLETED` → read the phase skill's `NEXT:` field and dispatch that phase skill. `NEXT:` is authoritative — follows default linear order in `.asd/rules/sprint-lifecycle.md` except the `impl`/`impl-test`/`impl-review` cycle: `impl` always returns `NEXT: impl-test`; `impl-test` returns `NEXT: impl` on code defects (routes to impl test-fix mode) or `NEXT: impl-review` on a green suite; `impl-review` returns `NEXT: impl` on unresolved findings (routes to impl review-fix mode) or `NEXT: pr` on DoD met. The `pr` phase ends the chain in two steps: open mode returns `NEXT: await-merge` (PR opened, sprint folder already archived onto the same branch, `phase` still not `done` — halt, no further dispatch); a later resume re-enters `pr` in merge mode, reading `state.json` from its archived location, and on `NEXT: done` writes the terminal state and the chain ends.
- `FAILED` → relay, halt
- `QUESTION` → relay pending question, halt until reply
- `ABORT — precondition not met` → relay, halt

User may interrupt anytime; asd-sprint re-detects state on next invocation.

## Artefacts produced
None directly. All writes inside phase skills (PM, creators, reviewers).

## Agents dispatched
None directly. Phase skills delegate to agents.

## Skills dispatched
Phase skills listed in `.asd/rules/sprint-lifecycle.md`. No other skill set.

## Return contract (single line)
```
SPRINT: <NNN-slug> | PHASE: <phase> | STATUS: <complete|in-progress|blocked|aborted> | NEXT: <next-phase|done|halted-on-question|halted-on-failure>
```

## References
- `.asd/rules/sprint-lifecycle.md` (phase chain, signals, exit criteria)
- `.asd/rules/checkpoints.md` (precondition chain, auto-abort)
- `.asd/rules/core.md` (interaction protocol)
