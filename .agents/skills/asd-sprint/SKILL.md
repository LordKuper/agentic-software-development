---
# ASD generated. Edit .asd/skills/asd-sprint/SKILL.md. source_digest=sha256:ee04f30982c1f99b921c8792db5061ef019d3afc34f833a0d4bc5a6d519a039e content_digest=sha256:0df563e2ef51c1996a8b7c75448b4c1e98f6cefda6f4f16de5529e25bfaaff9a asd_version=7.2.0 schema=1
name: asd-sprint
description: "Starts a new ASD sprint or resumes the active one, dispatching the matching asd-phase-* skill and routing phase signals back to the user. Use when the user runs $asd-sprint or asks to start, continue, resume, or work on an ASD sprint."
---

Operation mapping: see `.asd/rules/providers.md`.

# ASD Sprint

## Preconditions
- `.asd/project/config.yaml` exists (else: tell user `$asd-init`)
- ≤1 active sprint. A sprint counts as active while `state.json.phase != "done"`, whether its folder currently lives at `.asd/sprints/<NNN-slug>/` or already at `.asd/sprints/archived/<NNN-slug>/` (the `pr` phase moves the folder before the terminal `phase=done` write — see `sprint-lifecycle.md` "PR phase"). Only `phase=done` entries under `archived/` are excluded.

## Operations used
- Read files / search repo — detect active sprint; read state.json, config.yaml, custom-common-rules.md
- Run command — `git status`, `git branch --show-current`
- Request user decision — new-sprint confirm, resume/abort choice
- Delegate to skill — phase skills only
- No direct writes — phase skills and their inline orchestrator own writes

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
3. Request user decision: resume (default) | re-run current phase | re-run earlier phase | abort sprint. When frozen `skip_design_phases` is `true`, neither re-run option offers `design`, `design-review` or `design-promote`.
4. Delegate to the matching phase skill. *resume* re-enters `phase`, except `phase="design-promote"` under the collapse test (`sprint-lifecycle.md` "Design/design-review/design-promote collapse"): then dispatch `plan`. *re-run earlier phase* = rollback: its inline state update resets the review counter + severity floor per **rollback reset** in `sprint-lifecycle.md`.

### Step 3: phase chain advancement
After any phase skill returns:
- `COMPLETED` → read the phase skill's `NEXT:` field and dispatch that phase skill. `NEXT:` is authoritative — follows default linear order in `.asd/rules/sprint-lifecycle.md` except the design-block collapse (`audit` returns `NEXT: plan` when frozen `skip_design_phases` is `true`; `design` returns `NEXT: plan` on its documents-disabled no-op) and the `impl`/`impl-test`/`impl-review` cycle: `impl` always returns `NEXT: impl-test`; `impl-test` returns `NEXT: impl` on code defects (routes to impl test-fix mode) or `NEXT: impl-review` on a green suite; `impl-review` returns `NEXT: impl` on unresolved findings (routes to impl review-fix mode) or `NEXT: retro` on DoD met; `retro` always returns `NEXT: pr`, on its analysed and its empty-log branch alike. The `pr` phase ends the chain in two steps: open mode returns `NEXT: await-merge` (PR opened, sprint folder already archived onto the same branch, `phase` still not `done` — halt, no further dispatch); a later resume re-enters `pr` in merge mode, reading `state.json` from its archived location, and on `NEXT: done` writes the terminal state and the chain ends.
- `FAILED` → relay, halt
- `QUESTION` → relay pending question, halt until reply
- `ABORT — precondition not met` → relay, halt

User may interrupt anytime; asd-sprint re-detects state on next invocation.

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
