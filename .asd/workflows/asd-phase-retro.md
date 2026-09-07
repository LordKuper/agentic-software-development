# ASD Workflow: Retro

Orchestration body for the `asd-phase-retro` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Review DoD met at `impl-review` (`checkpoints.md` per-phase preconditions); `state.json.phase` advanced from `impl-review`
- Unconditional phase — no `documents.*` field gates it, no no-op branch (`sprint-lifecycle.md` "Retro phase")

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `<sprint>/friction-log.md`, the ids its entries cite
- write a file: `<sprint>/retrospective.html`; `state.json` inline, for the mechanical non-gate phase-field write (`sprint-lifecycle.md` "State recovery")
- the main orchestrator analyses, authors and logs inline; nothing is delegated

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`); write `state.json` (phase=retro) inline.
2. Read `<sprint>/friction-log.md`. Absent, or present with zero `F-N` entries → **empty-log branch** (step 5). Reaching it appends nothing to the log and mutates no sprint state.
3. Per `F-N` entry: root cause, and scope (consumer / asd / both). Ids the entry cites (`D-N`, `MS-N`, `reviews/<phase>/iter-NN/<reviewer>`) are read as evidence only — the artefact references ids and never copies what their owner holds (`sprint-lifecycle.md` "Friction log" boundary table).
4. Derive recommendations from those causes, split consumer-project vs ASD-framework, each addressing the entry id it answers and naming its target path. Proposals only: never executed here, never promoted to a persistent doc, never carried across sprints.
5. **Empty-log branch** — skip steps 3-4 and go to step 6; fragment shape per `t_retrospective.html`'s empty-log comment, semantics per `sprint-lifecycle.md` "Retro phase".
6. Write `<sprint>/retrospective.html` in `language.docs`: `t_retrospective.html` wrapped per `artifact-layout.md` "HTML shell wrapping", `{{DOC_TYPE}}`=`Retrospective`, `{{STATUS}}`=`final`, every other placeholder computed per its "Placeholder fill" table.
7. Post the closing `language.chat` summary — the problems observed and the approaches proposed, one line each.
8. Append the decisions-log entry (`<sprint>/retrospective.html` written, entry count, branch taken) and emit COMPLETED.
9. On `ADVICE_NEEDED` from any dispatched agent → relay per `sprint-lifecycle.md`'s `ADVICE_NEEDED` protocol; execution resumes, no halt.

## Artefacts produced
- `<sprint>/retrospective.html` (both branches)
- Updated `state.json` (phase=retro)
- decisions-log entry

## Agents delegated to
- None; orchestration is inline.

## Skills/workflows dispatched
None.

## Return contract (single line)
```
PHASE: retro | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: pr
```
`NEXT: pr` on both branches — an empty log completes the phase exactly like an analysed one.

## References
- `.asd/rules/sprint-lifecycle.md` (retro phase contract, friction log)
- `.asd/rules/artifact-layout.md` (retrospective ownership, HTML shell wrapping)
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- Templates: `t_retrospective.html`, `t_friction-log.md`
