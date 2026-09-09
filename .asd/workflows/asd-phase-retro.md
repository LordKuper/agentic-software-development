# ASD Workflow: Retro

Orchestration body for the `asd-phase-retro` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Review DoD met at `impl-review` (`checkpoints.md` per-phase preconditions); `state.json.phase` advanced from `impl-review`

## Operations used
- read: `.asd/project/config.yaml`, `<sprint>/friction-log.md`, and the sprint's run record — `state.json`, `plan.md`, `decisions-log.md` — as systemic-class evidence; the file behind a cited id (`manual-steps.md`, `reviews/<phase>/iter-NN/<reviewer>`) only when an `F-N` cites it
- write a file: `<sprint>/retrospective.html`; `state.json` inline, for the mechanical non-gate phase-field write (`sprint-lifecycle.md` "State recovery")
- append friction: `F-N` entries to `<sprint>/friction-log.md` per `sprint-lifecycle.md` "Friction log"
- the main orchestrator analyses, authors and logs inline; nothing is delegated

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`); write `state.json` (phase=retro) inline.
2. Read `<sprint>/friction-log.md`. Absent, or present with zero `F-N` entries → **empty-log branch** (step 5).
3. Per `F-N` entry: root cause, and scope (consumer / asd / both). Ids the entry cites (`D-N`, `MS-N`, `reviews/<phase>/iter-NN/<reviewer>`) are read as evidence only — the artefact references ids and never copies what their owner holds (`sprint-lifecycle.md` "Friction log" boundary table).
4. Derive both output classes per `sprint-lifecycle.md` "Retro phase": remediation from the step-3 causes, systemic proposals off the run record in the read list above.
5. **Empty-log branch** — skip step 3 and step 4's remediation class only; the systemic class is still derived. Fragment shape per `t_retrospective.html`'s empty-log comment, semantics per `sprint-lifecycle.md` "Retro phase".
6. Write `<sprint>/retrospective.html` in `language.docs`: `t_retrospective.html` wrapped per `artifact-layout.md` "HTML shell wrapping", `{{DOC_TYPE}}`=`Retrospective`, `{{STATUS}}`=`final`, every other placeholder computed per its "Placeholder fill" table.
7. Post the closing `language.chat` summary — problems observed, then systemic proposals, one line each.
8. Append the decisions-log entry (`<sprint>/retrospective.html` written, entry count, proposal count, branch taken) and emit COMPLETED.

## Artefacts produced
- `<sprint>/retrospective.html` (both branches)
- Updated `state.json` (phase=retro)
- decisions-log entry

## Return contract (single line)
```
PHASE: retro | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: pr
```

## References
- `.asd/rules/sprint-lifecycle.md` (retro phase contract, friction log)
- `.asd/rules/artifact-layout.md` (retrospective ownership, HTML shell wrapping)
- `.asd/rules/checkpoints.md`
- `.asd/rules/language-policy.md`
- Templates: `t_retrospective.html`, `t_friction-log.md`
