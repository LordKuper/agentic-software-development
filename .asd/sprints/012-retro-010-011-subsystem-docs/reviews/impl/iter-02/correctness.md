[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2
- **Evidence**: [manifest](./correctness.manifest.json) · ledger below

I had no shell, so I could not run the diff command. I reviewed the current on-disk content of all 22 manifest files instead; the payload allowed this. I read no earlier `reviews/impl/iter-*/` directory. Hash freshness in `.asd/release-manifest.json` was checked by structure only, not recomputed; the §6b hash tests in `tests/run.js` cover it.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | medium | `.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md:14` | This memory entry was written this sprint and gets loaded on every correctness dispatch. It tells the reviewer that when a payload instruction is outside its tool policy, it should "state the contradiction in the report instead of halting". `.asd/rules/providers.md:107` ("Declared tool policy") says the opposite: the agent "returns `QUESTION` naming the contradiction and does not comply", and `asd-phase-impl-review.md` step 11 halts on a `QUESTION`. So the memory records, as standing guidance, a practice that contradicts the agent's own declared policy. AC-6 (`artifact-layout.md` "Agent memory") exists to stop exactly that, after sprint 010 F-5. | Rewrite the sentence. A payload that only names a diff source, or offers a read-files fallback, is inside policy: review from on-disk reads. A payload that instructs a command the agent cannot run gets `QUESTION` naming the contradiction, per `providers.md` "Declared tool policy". Also check `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8` ("Do not stall or ABORT on that"), which has the same problem, if that line is in this iteration's change surface. |
| COR-2 | medium | AC-13; `.asd/rules/sprint-lifecycle.md:318`, `.asd/skills/asd-init/SKILL.md:91`, `.asd/workflows/asd-phase-impl.md:62` | AC-13 is only partly implemented, and the case it was written for no longer fits. It cites 011 P3, whose one evidenced case is "any sprint whose deliverable includes a project setting (MS-1 here)": sprint 011 added `skip_design_phases` to `t_config.yaml` and then enabled it. The fix for iter-01's COR-1-3 changed two things. (1) Sprint-mediated mode now fails on any key that `t_config.yaml` does not already carry. (2) The grammar now allows only a key "`t_config.yaml` already carries, never one a same-sprint task adds". The change is also applied before wave 1, by a Task that must sit alone in wave 1. So a same-sprint template edit can never come first, and the 011 case still needs an `MS-N` halt. The decisions-log entry "Wave 3 flagged choices resolved" had rejected key validation for exactly this reason ("would reject the sprint-011 case this path replaces"). The later "impl review-fix for iter-01" entry accepted the opposite without recording the reversal, and no stub or follow-up records the gap. | Allow a declared key that a same-sprint Task adds. Let the plan place the settings-change Task in the wave after the Task that adds the key to `t_config.yaml`. `impl` then applies the change when that wave opens and validates against the working-tree `t_config.yaml` at that moment, which keeps COR-1-3's unknown-key protection. Update the "alone in wave 1" wording in `sprint-lifecycle.md`, `t_plan.md` and `asd-phase-plan.md` step 4 to match. If the narrowing is intended instead, it changes the meaning of an accepted AC, so the user must approve the narrowing of AC-13 and it must be recorded. |

Items I checked that turned up nothing at or above the medium floor:
- **`runtime.js` emitter:** the new `noHtml` grant, phase-gate matching by name, the N-part slicing (disjoint and complete), and the fail-closed paths for a missing predicate target and for more parts than files.
- **`runtime.js` ledger reading:** `ledgerFromText` (CRLF input, a bare-JSON return, more than one ledger block) and the flag parsing for `--custom-rules`, `--scoped-fan-out` and `--halve`.
- **Split and immutability wording:** matches between both review workflows and `review-policy.md`.
- **Registry migration:** the steps agree across the audit workflow, `sprint-lifecycle.md` "Audit phase", `asd-architect.md` write access and `asd-init` step 13.
- **Settings-change references:** step references (step 6) and ordering agree across `asd-init`, `asd-sprint` and `asd-phase-impl.md`.

AC trace for this iteration's change surface: AC-1, AC-2, AC-3, AC-4, AC-8, AC-11, AC-12 and AC-14..AC-18 are satisfied at their acting sites. AC-6 is broken at one memory site (COR-1). AC-13 is partial (COR-2). AC-19 rests on the decisions-log impl-test entry 3 (197/197, `sync --check` 72/72).

## Coverage (internal reviewers only)

The compact ledger below is bound to manifest digest `cabd0e34…fe6b`.

## Verdict
CONCERNS: 2

## Next action
Route to impl review-fix. The dev fixes COR-1 in the correctness reviewer's memory file. For COR-2, the dev either widens the settings-change placement rule, or the orchestrator gets the user's approval to narrow AC-13 and records it.

## Escalations (optional)
- finding #COR-2: needs user approval only if the fix narrows AC-13 instead of widening the rule (change to an accepted acceptance criterion).

One memory write this dispatch, for the orchestrator to commit with this review file: I added `.claude/agent-memory/asd-reviewer-correctness/feedback_trace-ac-to-motivating-case.md` and one index line in `MEMORY.md`. I did not edit the file named in COR-1.

```json
{"manifest_digest": "cabd0e34c4625a9af7acadf2e4b029e7f16dbbf356ff337db627f0fa84c7fe6b", "findings": ["COR-1", "COR-2"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-audit.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "Bugs [impl-review]", "s": "pass"}, {"i": "Security [impl-review]", "s": "pass"}, {"i": "Contracts [impl-review]", "s": "finding", "f": "COR-1"}, {"i": "Best practices [impl-review]", "s": "pass"}, {"i": "AC coverage trace [impl-review]", "s": "finding", "f": "COR-2"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": [{"i": "Bugs [impl-review]", "s": "reviewed"}, {"i": "Security [impl-review]", "s": "reviewed"}, {"i": "Contracts [impl-review]", "s": "reviewed"}, {"i": "Best practices [impl-review]", "s": "reviewed"}, {"i": "AC coverage trace [impl-review]", "s": "reviewed"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}]}
```
