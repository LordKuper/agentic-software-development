---
name: asd-sprint
description: "Starts a new ASD sprint or resumes the active one, dispatching the matching asd-phase-* skill and routing phase signals back to the user. Use when the user runs /asd-sprint or asks to start, continue, resume, or work on an ASD sprint."
metadata:
  asd-role: dispatcher
  version: "0.1"
allowed-tools: "Read Glob Grep Bash AskUserQuestion Skill"
---

# ASD Sprint

## Preconditions
- `.asd/project/config.yaml` exists (else: tell user `/asd-init`)
- ≤1 active sprint in `.asd/sprints/<NNN-slug>/` (archived/ excluded)

## Tool policy
- Read/Glob/Grep — detect active sprint; read state.json, config.yaml, custom-common-rules.md
- Bash — `git status`, `git branch --show-current`
- AskUserQuestion — new-sprint confirm, resume/abort choice
- Skill — dispatch phase skills only
- No Write/Edit — phase skills + PM own all writes

## Workflow

### Step 1: detect active sprint
- Glob `.asd/sprints/*/state.json` (skip `archived/`)
- 0 active → new-sprint flow
- 1 active → resume flow
- >1 → emit FAILED "multiple active sprints found, manual cleanup needed"

### Step 2A: new-sprint flow
1. Read `.asd/project/config.yaml` (confirm init complete)
2. `git status` — if dirty, AskUserQuestion: commit / stash / abort
3. AskUserQuestion: confirm start; collect scope (free-form)
4. Dispatch `asd-phase-scope` via Skill, passing scope text
5. On COMPLETED → advance per Step 3

### Step 2B: resume flow
1. Read `.asd/sprints/<NNN-slug>/state.json`
2. Show: sprint id, current phase, review iteration (`reviews.design.iteration` when phase=`design-review`, `reviews.impl.iteration` when phase=`impl-review`), last review verdict (if any)
3. AskUserQuestion: resume (default) | re-run current phase | re-run earlier phase | abort sprint
4. Dispatch matching phase skill via Skill. *re-run earlier phase* = rollback: when target phase strictly earlier than a review's input-producing phase, the target phase skill's PM state update resets that review counter + severity floor per **rollback reset** in `sprint-lifecycle.md` (`reviews.design.iteration` resets when rolling back to `scope`/`audit`; `reviews.impl.iteration` resets when rolling back to `scope`…`plan`)

### Step 3: phase chain advancement
After any phase skill returns:
- `COMPLETED` → read the phase skill's `NEXT:` field and dispatch that phase skill. `NEXT:` is authoritative — follows default linear order in `.asd/rules/sprint-lifecycle.md` except `impl`/`impl-review` cycle: `impl-review` returns `NEXT: impl` on unresolved findings (routes to impl fix mode) or `NEXT: pr` on DoD met; `impl` always returns `NEXT: impl-review`. On `pr` COMPLETED the sprint archives and chain ends.
- `FAILED` → relay, halt
- `QUESTION` → relay pending question, halt until reply
- `ABORT — precondition not met` → relay, halt

User may interrupt anytime; asd-sprint re-detects state on next invocation.

## Artefacts produced
None directly. All writes inside phase skills (PM, creators, reviewers).

## Agents dispatched
None directly. Phase skills dispatch agents via Task.

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
