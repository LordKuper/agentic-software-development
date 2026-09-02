# ASD Workflow: Scope

Orchestration body for the `asd-phase-scope` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- `.asd/project/config.yaml` exists
- No active sprint OR user explicitly re-runs scope for current sprint
- working tree clean (else: FAILED)

## Operations used
- read: `.asd/project/config.yaml`, `.asd/sprints/` listing
- search repo: count existing sprints (active + archived) for next NNN
- run command: check working-tree status, resolve current branch, create branch
- request user decision: only if raw scope text not provided by the caller
- delegate to agent `asd-pm` (`.asd/agents/asd-pm.md`): refine scope + obtain approval

## Workflow

1. Read `.asd/project/config.yaml` (`git.base_branch`, `git.branch_pattern`, `documents.*`). Normalize per `sprint-lifecycle.md` "Optional documents" (fail-closed defaults). Effective `documents.c4` = `documents.c4 AND project.subsystem_decomposition == enabled`.
2. Run command to check working-tree status; if dirty → FAILED
3. Count existing sprints (`.asd/sprints/*/` + `.asd/sprints/archived/*/`) → NNN = max + 1, zero-padded
4. Derive slug from raw scope (kebab-case, ≤30 chars) — provisional, may change after refinement
5. Construct sprint id `<NNN>-<slug>` + branch from `git.branch_pattern`
6. Run command: `git fetch origin`, check out `git.base_branch`, fast-forward to `origin/<base_branch>` (diverged → FAILED, ask user to resolve), re-verify working tree clean, create branch (`git-strategy.md` "Branch")
7. Create folder `.asd/sprints/<NNN-slug>/`
8. Delegate to agent `asd-pm` with payload:
   - **raw scope text** (draft, not final); sprint id, branch
   - templates: `t_sprint.md`, `t_state.json`
   - instruction (MUST follow in this exact order; skipping any step = protocol violation):
     1. **Refine** raw scope into coherent finished sprint goal (full sentences, `language.docs`, not caveman); preserve every concrete requirement user mentioned. Chat only — DO NOT write any file yet.
     2. **Clarify** via request for user decision when raw text ambiguous/contradictory/missing concrete acceptance signals. Mandatory if any: vague scope verb ("improve", "refactor", "support X"), no measurable outcome, ≥2 plausible interpretations, missing target users/surface/data shape.
     3. **Write-then-review-accept** (`checkpoints.md` mechanic): write `<sprint>/sprint.md` per `t_sprint.md` (top-level Acceptance criteria numbered `AC-1`, `AC-2`, … — stable ids, used as the acceptance-criteria source whenever `documents.prd` is disabled) + initial `state.json` per `t_state.json` (phase=scope, iteration=0, branch, created_at) + `<sprint>/decisions-log.md` from `t_decisions-log.md` (empty entries section — the sprint-local log, created here, archived with the sprint). Fill `documents.{{DOC_AUDIT}}`/`{{DOC_PRD}}`/`{{DOC_UX_SPEC}}`/`{{DOC_ADR}}`/`{{DOC_C4}}` placeholders with the JSON boolean (`true`/`false`) matching each normalized `enabled`/`disabled` value from step 1 — never leave a placeholder literal in the written file (`sprint-lifecycle.md` "Optional documents"). Post the absolute path + a short delta summary in chat — never the artifact body.
     4. User reviews `sprint.md` on disk and replies `accept` (advance) or gives feedback (revise the same file in place — no `-v2`, no duplicate draft — and return to step 3's post-and-summary). Loop until explicit `accept`.
     5. If refined goal implies better slug, propose via request for user decision; rename folder/branch only after confirmation.
     6. **On explicit `accept`**: append decisions-log entry recording the accepted scope (naming `sprint.md`); if any `documents.*` disabled, one line noting which.
     7. Emit COMPLETED.

   Hard gates (any violation → FAILED + halt):
   - This gate is write-then-review-accept (`checkpoints.md`): the write in step 3 legitimately precedes `accept` — that is the mechanic, not a violation.
   - No `COMPLETED` before an explicit `accept` was received on the written file.
   - No advancing phase, and no decisions-log entry, on feedback short of explicit `accept` — loop instead.
   - Never re-summarize from memory in place of posting the actual current file's path — every round (write, and every revision) must point at the real file on disk, never a chat-body dump of its content.
9. On PM COMPLETED → emit COMPLETED with return contract
10. On PM QUESTION → relay, halt
11. On PM FAILED/ABORT → relay, halt
12. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Artefacts produced
- `.asd/sprints/<NNN-slug>/sprint.md` — approved refined scope
- `.asd/sprints/<NNN-slug>/state.json` — initial state
- `.asd/sprints/<NNN-slug>/decisions-log.md` — sprint-local decisions log, seeded from `t_decisions-log.md`
- git branch `sprint/<NNN>-<slug>` (slug may have been renamed during refinement)

## Agents delegated to
- `asd-pm` (single delegation)

## Skills/workflows dispatched
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
- Templates: `t_sprint.md`, `t_state.json`, `t_decisions-log.md`
