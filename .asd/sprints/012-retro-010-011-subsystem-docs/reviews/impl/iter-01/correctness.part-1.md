[REVIEW-impl-correctness]: CONCERNS

# Review — correctness (part 1 of 2)

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low)
- **Evidence**: [manifest](./correctness.part-1.manifest.json) · ledger below

How I reviewed: I have no shell, so I did not run the `git diff main...HEAD` command named in the payload. That command is outside my declared tool policy (`providers.md` "Declared tool policy"). I read the current on-disk content of the 20 files in `correctness.part-1.manifest.json` instead. I also read the related workflows, templates and sprint artifacts for context: `asd-phase-impl-review.md`, `asd-phase-audit.md`, `asd-phase-impl.md`, the part-2 manifest, `audit.md` and `decisions-log.md`. I could not run `node tests/run.js` or `sync.js --check`, so I did not re-check AC-19 or the hash values in `release-manifest.json`. The impl-test record says both are green.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1-1 | medium | `.asd/rules/sprint-lifecycle.md:169` ("Audit phase"); `.asd/rules/artifact-layout.md:98`; `.asd/agents/asd-architect.md:42`; `.asd/skills/asd-init/SKILL.md:62` (fresh step 13) | Audit only builds the registry when it is **absent**. But fresh `/asd-init` always writes an empty `docs/architecture/subsystems.md` when decomposition is enabled, and `artifact-layout.md:5` says that seed does not count as a placeholder. So a freshly initialised brownfield project never gets a registry proposal from its code. `asd-init` step 16 sends exactly that project to an audit-only first sprint, and audit sees an existing (empty) registry. The only other way in is `design-promote`, which never runs when design collapses (`skip_design_phases`, or no drafts). The registry then stays empty, and audit and plan (AC-17) find no subsystem code. This breaks the plan decision "an enabled project that has no registry gets it built at audit". | Make the audit trigger "registry absent **or has no entries**" in all four places: `sprint-lifecycle.md` "Audit phase", `artifact-layout.md` "Subsystem registry", `asd-architect.md` Authority/Outputs, and `core.md` Glossary "Subsystem". The per-subsystem hard confirmation stays as it is. |
| COR-1-2 | medium | `.asd/rules/sprint-lifecycle.md:169`; `.asd/agents/asd-architect.md:42` | Migrating a legacy **mermaid** project with `documents.c4` enabled loses its diagram. The Architect proposal copies only id, purpose and key paths from `c4/subsystems.yaml`. Nothing writes the inline Mermaid block into `subsystems.md`, which AC-16 makes the diagram's only home in mermaid mode. The same paragraph then offers to delete the legacy `c4/` as redundant (`diagram_tool: mermaid`), so the relations stored in `subsystems.yaml` are gone. The next c4-full treats the diagram as missing and redraws the full schema from scratch. `decisions-log.md` (line 94) says `c4/` is deleted "after its content has moved to the registry", and `audit.md:290` names this move ("→ `subsystems.md` with an inline diagram"). Neither is bound anywhere. | In "Audit phase" (and the Architect's audit output line), when the legacy source is mermaid `subsystems.yaml` and config `documents.c4` is enabled, have the migration also write the registry's `## Diagram` block from it (`t_subsystems.md`). Offer the `c4/` deletion only after that write lands. |
| COR-1-3 | low | `.asd/skills/asd-init/SKILL.md:91` (sprint-mediated step 2) | Sprint-mediated mode writes each declared `<key>=<value>` without checking it. Nothing confirms the key exists in `t_config.yaml` or that the value is one of its `Values:`. The pairs come from plan text that the user approved but nothing parsed. A typo (`user_gates=adaptve`, `review.scoped_fan_out=enabeld`) is written silently. Readers of those keys fail closed, so the bad value takes effect later: `checkpoints.md` "Gate policy" blocks every later sprint on an invalid `user_gates`, and an unknown fan-out value is read as disabled. This is far from the plan gate that approved it. | Before step 3, reject any pair whose dotted key is missing from `t_config.yaml`, or whose value is outside that field's `Values:` comment. Report `FAILED` naming the pair and write nothing. |

## Coverage (internal reviewers only)

The compact ledger is below, bound to the part-1 manifest digest. Every file was checked. UI conformance is n/a: no scope file in either part is a UI surface (`isUiSurface`). The phase writes the manifest and ledger evidence beside this report.

Notes on AC coverage for this half:
- **Fully traced in part-1 files:** AC-1 through AC-10, AC-12 through AC-16, and AC-18.
- **AC-11:** the dev report field is in `asd-dev.md:92`. The classification is bound at `asd-phase-impl.md` step 10, citing `checkpoints.md` "Gate policy". `checkpoints.md` itself was not edited, which is how the plan read it.
- **AC-17:** traced, apart from COR-1-1 and COR-1-2.
- **Runtime:** I found no defect in `.asd/runtime.js`. I checked the emitter partition (disjoint, near-even, in order), stamping, the per-phase gate predicates, the fenced-ledger extraction and the validator's constant-equality checks.

## Verdict
CONCERNS: 3

## Next action
Route to impl review-fix mode. The owning dev fixes COR-1-1..3 in canon, runs `sync.js --apply` on the `asd-architect` and `asd-init` generated views, and refreshes `canon_hashes`/`upstream_hashes`.

## Escalations (optional)
- None. All three fixes stay inside the accepted AC-13/AC-17 scope and add no abstraction or contract change.

```json
{"manifest_digest": "e38c55cdd5c1867567d86125e9b98b3a2fb0ce291b4a83660485856580ed2a3a", "findings": ["COR-1-1", "COR-1-2", "COR-1-3"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-dev.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/artifact-layout.md", "s": "checked"}, {"i": ".asd/rules/checkpoints.md", "s": "checked"}, {"i": ".asd/rules/code-style.md", "s": "checked"}, {"i": ".asd/rules/core.md", "s": "checked"}, {"i": ".asd/rules/external-review.md", "s": "checked"}, {"i": ".asd/rules/git-strategy.md", "s": "checked"}, {"i": ".asd/rules/providers.md", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/sync-state.json", "s": "checked"}, {"i": ".asd/templates/external-review/t_prompt-external-design.md", "s": "checked"}, {"i": ".asd/templates/t_AGENTS.md", "s": "checked"}], "rules": [{"i": "Bugs [impl-review]", "s": "finding", "f": "COR-1-2"}, {"i": "Security [impl-review]", "s": "pass"}, {"i": "Contracts [impl-review]", "s": "pass"}, {"i": "Best practices [impl-review]", "s": "finding", "f": "COR-1-3"}, {"i": "AC coverage trace [impl-review]", "s": "finding", "f": "COR-1-1"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": [{"i": "Bugs [impl-review]", "s": "reviewed"}, {"i": "Security [impl-review]", "s": "reviewed"}, {"i": "Contracts [impl-review]", "s": "reviewed"}, {"i": "Best practices [impl-review]", "s": "reviewed"}, {"i": "AC coverage trace [impl-review]", "s": "reviewed"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}]}
```
