# ASD Workflow: Design Promote

Owner: inline orchestrator; dispatches none.

## Entry

```json
{"requires": ["standard: design-review done", "lite: impl-review DoD met (review-policy.md 'DoD per review phase') and state.json phase advanced from impl-review, else ABORT — precondition not met: impl-review DoD"], "modes": {"standard": "frozen workflow=standard: promote approved drafts after design-review", "lite": "frozen workflow=lite: promote from the accepted implementation after impl-review, no draft, no review"}, "ops": ["context: agent-protocol.md 'Orchestrator phase entry'", "append friction: F-N to <sprint>/friction-log.md per sprint-lifecycle.md 'Friction log'", "timing: user-wait ops only (sprint-lifecycle.md 'Operation timing')"]}
```

## Inputs

```json
["state.json frozen workflow, documents.* and mockup_format", "standard: approved drafts in <sprint>/design/", "lite: sprint.md, plan.md, sprint diff (<base_branch>...HEAD), audit.md when present", "in-scope mockups: <sprint>/design/mockups/, sprint decisions log and rotated segments", "legacy state only: .asd/project/config.yaml mockup settings", "audit.md"]
```

## Steps

1. Read frozen `workflow`, documents and the effective mockup format (`sprint-lifecycle.md` "Mockup format", including its legacy fallback). Document scope: `standard` — enabled documents intersected with approved drafts; `lite` — enabled documents. With an effective format other than `none`, include existing mockups and any recorded publication pending recovery independently. Empty combined scope is a mechanical no-op: record skipped phase and advance per step 5.
2. Compute decomposition and migration targets. Under `checkpoints.md`, execute an already approved/in-bounds decomposition adaptively with evidence [GATE adaptive: decomposition]; a new subsystem or material boundary is hard and waits for the user [GATE hard: new subsystem]. Record the decision before mutation.
3. For an approved new or a changed subsystem, write it to `docs/architecture/subsystems.md` and its `<id>.md` and create its folders (`sprint-lifecycle.md` "Design-promote phase"; `artifact-layout.md` "Subsystem registry").
3a. **Mockup publication** — check the index and publication records using `providers.md` "Conditional grants". Reconcile `figma` entries and await required recovery. Resolve deferred `claude_design` publication in `lite`. Carry the verified links or local previews into step 4.
4. Promote in-scope persistent docs per `sprint-lifecycle.md` "Design-promote phase" step 4. `lite` uses its `## Inputs` and, with `design_system` enabled, runs `asd-phase-design.md` step 7 before the UX write. Observe its hard gates ("Workflows"). When promoting the design system, on Windows run `designmd-install` once per session before patching `DESIGN.md` (tokens and `prose`). Regenerate `design-system.html` with `node .asd/runtime.js design-tokens --design docs/ux/DESIGN.md --html docs/ux/design-system.html` (`design-system.md` §12 "Regeneration"). Copy the mockups prepared at step 3a with their links per §12 "Mockups", independently of UX-spec. Approve any persistent doc deletion or rename before `git rm`/`git mv` and update content and inbound links before step 5 [GATE hard: doc deletion] [GATE adaptive: doc rename].
5. Append artifact records and update `state.json` inline. `lite`: commit the promoted docs (`git-strategy.md` "Commits"). Post a non-blocking summary; exit per `## Exit`.

## Exit

```json
{"writes": ["persistent docs per enabled document", "docs/ux/mockups/ (in-scope mockups)", "docs/architecture/subsystems.md, <id>.md and folders (step 3)", "mockup publication recovery: sprint decisions log and <sprint>/design/mockups/index.md (step 3a)", "state.json", "artifact records", "lite: promoted-docs commit"], "next": [{"if": "standard", "next": "plan"}, {"if": "lite", "next": "cleanup"}]}
```

## Return

```
PHASE: design-promote | SPRINT: <NNN-slug> | STATUS: <complete|blocked|aborted> | NEXT: <plan|cleanup>
```

## References

- `.asd/rules/checkpoints.md`
- `.asd/rules/sprint-lifecycle.md`
- `.asd/rules/artifact-layout.md`
- `.asd/rules/git-strategy.md`
