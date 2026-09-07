# ASD Workflow: Retro

Orchestration body for the `asd-phase-retro` skill. Operation-mapping to host tools: `.asd/rules/providers.md`.

## Preconditions
- Active sprint at `.asd/sprints/<NNN-slug>/`
- Review DoD met at `impl-review` (`checkpoints.md` per-phase preconditions); `state.json.phase` advanced from `impl-review`
- Unconditional phase — no `documents.*` field gates it, no no-op branch (`sprint-lifecycle.md` "Retro phase")

## Operations used
- read: `.asd/project/config.yaml`, `state.json`, `<sprint>/friction-log.md`, the ids its entries cite, and the sprint's own run record (`plan.md`, `decisions-log.md`, `manual-steps.md`, `reviews/`) as systemic-class evidence
- write a file: `<sprint>/retrospective.html`; `state.json` inline, for the mechanical non-gate phase-field write (`sprint-lifecycle.md` "State recovery")
- the main orchestrator analyses, authors and logs inline; nothing is delegated

## Workflow

1. Read `.asd/project/config.yaml` (`language.chat`, `language.docs`); write `state.json` (phase=retro) inline.
2. Read `<sprint>/friction-log.md`. Absent, or present with zero `F-N` entries → **empty-log branch** (step 5). Reaching it appends nothing to the log and mutates no sprint state.
3. Per `F-N` entry: root cause, and scope (consumer / asd / both). Ids the entry cites (`D-N`, `MS-N`, `reviews/<phase>/iter-NN/<reviewer>`) are read as evidence only — the artefact references ids and never copies what their owner holds (`sprint-lifecycle.md` "Friction log" boundary table).
4. Derive both output classes per `sprint-lifecycle.md` "Retro phase": remediation from the step-3 causes; systemic proposals from how this sprint actually ran (review iterations, rework loops, gate waits, task churn) read off the run record above. Each row names its acting side and target path.
5. **Empty-log branch** — skip step 3 and step 4's remediation class only; the systemic class is still derived. Fragment shape per `t_retrospective.html`'s empty-log comment, semantics per `sprint-lifecycle.md` "Retro phase".
6. Write `<sprint>/retrospective.html` in `language.docs`: `t_retrospective.html` wrapped per `artifact-layout.md` "HTML shell wrapping", `{{DOC_TYPE}}`=`Retrospective`, `{{STATUS}}`=`final`, every other placeholder computed per its "Placeholder fill" table.
7. Post the closing `language.chat` summary — problems observed, then systemic proposals, one line each.
8. Append the decisions-log entry (`<sprint>/retrospective.html` written, entry count, proposal count, branch taken) and emit COMPLETED.
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
