[REVIEW-impl-documentation]: APPROVE

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 4
- **Evidence**: [manifest](./documentation.manifest.json) · ledger below

I had no shell, so I worked out the iteration surface from file reads of the six manifest files at their current on-disk content. The decisions-log entry "impl review-fix for iter-03: findings resolved" names what changed.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

What I checked, by rubric item (all at or above the `high` floor):

- **SSoT / Framework mode**
  - The `asd-init` sprint-mediated `FAILED` at step 6 now appears in both places it needs to be:
    - `asd-phase-impl.md`'s closed list "A blocker is exactly one of" (line 37).
    - The step-6 bullet where it happens (line 63).
  - The "Escalation" section still points back to that list and does not repeat it, so the list stays whole under the preserve-list.
  - `sprint-lifecycle.md` "Plan file format" (line 318) cites step 6 and does not repeat the halt.
  - Neither the `asd-phase-impl` skill description nor README carries a copy of the blocker list, so no mirror went stale.
- **Persistent actuality**
  - `t_config.yaml` now has `Values` markers (inline `a | b`) for `documents.prd`/`ux_spec`/`adr`/`c4` and `backward_compat`. README's config schema (lines 253-257, 267) matches them word for word.
  - `asd-init/SKILL.md` step 2 accepts both marker forms (`Values:` or inline `a | b`).
  - README line 181 still describes the plan-declared settings path.
  - `tests/run.js` 4386-4400 checks that the template's enumerations match README's, and pins the five free-form string fields.
- **Release manifest**
  - `.asd/release-manifest.json` has `upstream_hashes` entries for `t_config.yaml`, `asd-phase-impl.md`, `asd-init/SKILL.md` and the new `t_subsystem.md`/`t_subsystems.md`, and none for `t_subsystems.yaml`.
  - I could not recompute the sha256 values without a shell; I only confirmed the entries exist.
- **In-code doc comments (§7)**: the test bodies changed in `tests/run.js` (4331-4414) have no comments inside them.
- **Documentation economy**: the step-6 halt text is where the action happens, and the blocker line belongs to a list whose completeness is the rule. Both are kept under the preserve-list, and both are pinned by tests at 4411/4413.
- **Agent memory**: I checked each lasting claim in `feedback_no-shell-doc-review-method.md` against HEAD, and all hold:
  - `emit-manifest` exists.
  - `SPLIT_THRESHOLD_FILES = 25`.
  - The `part-N` file naming is correct.
  - `outOfPart` is added to every rule and section id when there is more than one part (`runtime.js` 336).
  - The file-row vocabulary is `checked`/`n/a`.
  - A row has a single `f` (`review-policy.md` line 109).
  - `providers.md` "Declared tool policy" requires `QUESTION`.
  - "Gate Verdict Format" and "Agent memory" are real section anchors.
  - The economy rule's reach leaves agent memory out.
- **Custom rules**: the glossary in `custom-common-rules.md` and the staging, sync and generated-view rules in `custom-coding-rules.md` are respected.
- **Not applicable**: HTML shell wrapping, Provenance and Traceability, because there is no HTML file in scope.

Below the floor, not raised: the inline comment on `documents.audit` in `t_config.yaml`, "legacy enabled/disabled accepted", describes how the value is read at runtime. Sprint-mediated validation rejects the legacy values, as the flagged-choice decision in the decisions log says. Even if an agent accepted a legacy value, the runtime would still map it correctly, so nothing breaks.

## Coverage (internal reviewers only)

The compact ledger below is bound to manifest digest `8e0ad7776faa64d72f6e99b72589375e34f8720659c0454f9dd273bc3ec9e686`. The phase stores the manifest and ledger next to this report.

## Verdict
APPROVE

## Next action
No fixes are needed from the documentation side. The orchestrator combines this with the other reviewers' verdicts for iter-04.

## Escalations (optional)
None.

```json
{"manifest_digest": "8e0ad7776faa64d72f6e99b72589375e34f8720659c0454f9dd273bc3ec9e686", "findings": [], "files": [{"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/templates/t_config.yaml", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": "README.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "SSoT", "s": "pass"}, {"i": "Template adherence", "s": "pass"}, {"i": "HTML shell wrapping", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Provenance", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Traceability", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Persistent actuality (impl-review)", "s": "pass"}, {"i": "In-code doc comments (impl-review, `code-style.md` §7)", "s": "pass"}, {"i": "Framework mode (`self_hosting: enabled`, impl-review only)", "s": "pass"}, {"i": "Documentation economy", "s": "pass"}, {"i": "Custom rules consistency", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
