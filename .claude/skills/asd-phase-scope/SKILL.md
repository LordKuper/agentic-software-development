---
name: asd-phase-scope
description: "Runs the ASD scope phase of a sprint: creates the sprint folder, state.json, and git branch, then dispatches asd-pm to refine the raw user scope into an approved sprint.md. Use when asd-sprint dispatches the scope phase for a new sprint, or when the user explicitly asks to run or re-run the scope phase for the active sprint."
metadata:
  asd-role: phase
  asd-order: "1"
  version: "0.1"
allowed-tools: "Read Glob Bash AskUserQuestion Task"
---

# ASD Phase: Scope

## Preconditions
- `.asd/project/config.yaml` exists
- No active sprint OR user explicitly re-runs scope for current sprint
- `git status` clean (else: FAILED)

## Tool policy
- Read — `.asd/project/config.yaml`, `.asd/sprints/` listing
- Glob — count existing sprints (active + archived) for next NNN
- Bash — `git status`, `git rev-parse`, `git checkout -b <branch>`
- AskUserQuestion — only if raw scope text not provided by `asd-sprint`
- Task — dispatch `asd-pm` to refine scope + obtain approval

## Workflow

1. Read `.asd/project/config.yaml` (`git.base_branch`, `git.branch_pattern`)
2. Verify `git status` clean; if dirty → FAILED
3. Count existing sprints (`.asd/sprints/*/` + `.asd/sprints/archived/*/`) → NNN = max + 1, zero-padded
4. Derive slug from raw scope (kebab-case, ≤30 chars) — provisional, may change after refinement
5. Construct sprint id `<NNN>-<slug>` + branch from `git.branch_pattern`
6. Checkout `git.base_branch`, pull (optional, confirm with user), create branch
7. Create folder `.asd/sprints/<NNN-slug>/`
8. Dispatch `asd-pm` via Task with payload:
   - **raw scope text** (draft, not final); sprint id, branch
   - templates: `t_sprint.md`, `t_state.json`
   - instruction (MUST follow in this exact order; skipping any step = protocol violation):
     1. **Refine** raw scope into coherent finished sprint goal (full sentences, `language.docs`, not caveman); preserve every concrete requirement user mentioned. Chat only — DO NOT write any file yet.
     2. **Clarify** via AskUserQuestion when raw text ambiguous/contradictory/missing concrete acceptance signals. Mandatory if any: vague scope verb ("improve", "refactor", "support X"), no measurable outcome, ≥2 plausible interpretations, missing target users/surface/data shape.
     3. **Present** refined version for explicit approval via AskUserQuestion options `approve` / `edit` / `reject`. Mandatory even when raw text looked complete — implicit approval NOT allowed.
     4. If `edit`/`reject` → re-refine with feedback; loop to step 3 until explicit `approve`.
     5. If refined goal implies better slug, propose via AskUserQuestion; rename folder/branch only after confirmation.
     6. **Only after explicit `approve`**: write `<sprint>/sprint.md` per `t_sprint.md` + initial `state.json` (phase=scope, iteration=0, branch, created_at) per `t_state.json`. Append decisions-log entry recording approved scope.
     7. Emit COMPLETED.

   Hard gates (any violation → FAILED + halt):
   - No `Write`/`Edit` to `sprint.md`/`state.json` before AskUserQuestion approval returned `approve`.
   - No `COMPLETED` before file write happened.
   - No batching "refine + write" into one turn without intermediate AskUserQuestion.
9. On PM `COMPLETED` → emit COMPLETED with return contract
10. On PM `QUESTION` → relay, halt
11. On PM `FAILED`/`ABORT` → relay, halt

## Artefacts produced
- `.asd/sprints/<NNN-slug>/sprint.md` — approved refined scope
- `.asd/sprints/<NNN-slug>/state.json` — initial state
- git branch `sprint/<NNN>-<slug>` (slug may have been renamed during refinement)

## Agents dispatched
- `asd-pm` (single Task)

## Skills dispatched
None.

## Return contract (single line)
```
PHASE: scope | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: audit
```

## References
- `.asd/rules/sprint-lifecycle.md` (scope phase contract — SSoT)
- `.asd/rules/checkpoints.md` (approval gates)
- `.asd/rules/git-strategy.md` (branch creation, dirty tree rule)
- `.asd/rules/language-policy.md` (refined scope in `language.docs`)
- Templates: `t_sprint.md`, `t_state.json`
