[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 3
- **Evidence**: [manifest](./correctness.manifest.json) · ledger below

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

I had no shell, so I rebuilt the change from the files on disk. I used the manifest's 19 scoped files, plus the `decisions-log.md` entries "impl-review iter-02" and "impl review-fix for iter-02" to see what changed. Nothing I found reaches the `high` floor.

- **AC-13 fix (COR-2):** I ran 011 P3's own case through the rules as they stand now. That case is 011 MS-1: a sprint adds `skip_design_phases` to `t_config.yaml` and then turns it on.
  - `sprint-lifecycle.md:318` places the settings Task in a wave after every Task that adds one of its keys.
  - `asd-phase-impl.md:62` applies the change when that Task's wave opens, and checks it against the working-tree `t_config.yaml`.
  - `asd-init` sprint-mediated step 2 (`SKILL.md:91`) accepts `skip_design_phases=enabled` through the `Values: enabled | disabled` comment at `t_config.yaml:11`.
  - No manual step is left. This matches decisions-log "Wave 3 flagged choices resolved", which states keys are not checked against `t_config.yaml` because that would block the sprint-011 case. The iter-02 re-widening keeps that intent.
  - Re-running is safe: a pair that already has its value changes nothing (step 3), so resuming after the write is harmless.
- **external #1 (type check):** step 2 now checks booleans, integers and strings. `tests/run.js:4356-4361` finds the value types from `t_config.yaml`'s leaf fields rather than listing them by hand. For the current template that yields boolean, integer and string, so the loop is not empty.
- **Test replay:** I traced `tests/run.js:4331-4385` by hand against the current canon.
  - The step 6 line has no "wave 1" in it, so the check at 4371 holds.
  - `asd-init` sprint-mediated mode is named before the first dev delegation, so 4369 holds.
  - The step citation `asd-phase-impl.md` step 6 appears in `asd-init` "Modes", `asd-sprint` "Skills dispatched" and "Plan file format".
  - `asd-init` "Always first" says sprint-mediated mode skips the managed-block sync.
- **Mirrors:** the generated views are in sync.
  - `.agents/skills/asd-init/SKILL.md` carries the new step 2 text.
  - The root `AGENTS.md` hard rule names `impl`.
  - In `.asd/release-manifest.json`, `canon_hashes` and `upstream_hashes` hold the same value for `asd-init`. I checked this by comparing the entries, not by recomputing the hashes.
- **DOC-2 (review-policy / impl-review n/a predicate wording):** `review-policy.md:101` and `asd-phase-impl-review.md:28` now match. Both say the member lists live in `runtime.js` and the text is owned by `NA_PREDICATES`. Neither claims more than that.
- **Payload (DOC-1 root cause):** step 6 of `asd-phase-impl-review.md` passes the step-1 diff to reviewers as data, not as a command to run. This agrees with `providers.md:107` "Declared tool policy".
- **Agent memories (AC-6):** I checked the testing, documentation and correctness no-shell memories against `providers.md:107`, and they agree. Every file linked from the correctness, efficiency and testing `MEMORY.md` indexes exists.

Below floor, not raised:
- **Values that pass unchecked:** `documents.prd`, `ux_spec`, `adr` and `c4` have no enumerated values in `t_config.yaml`. The type check therefore accepts any string for them, such as `prd=yes` (medium).
- **Wave placement wording:** `asd-phase-plan.md:39` says "wave 1, or a wave after every Task adding one of its keys". That reads looser than `sprint-lifecycle.md`, which puts the Task in wave 1 when every key already exists (low).
- **Efficiency memory:** `feedback_no-shell-incremental-scope.md` does not say to return `QUESTION` when a payload instructs a command. It describes git diff ranges as data, so it does not contradict its agent's definition (low).

## Coverage (internal reviewers only)

The compact ledger is below. It is bound to manifest digest `a959acb938e6d5bc389447990f6569740f4e4c94fb6f3bc443304d62e62263cb`.

## Verdict
APPROVE

## Next action
Correctness is done for impl-review. The orchestrator validates the ledger, writes `reviews/impl/iter-03/correctness.md`, and records the APPROVE latch.

```json
{"manifest_digest": "a959acb938e6d5bc389447990f6569740f4e4c94fb6f3bc443304d62e62263cb", "findings": [], "files": [{"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_trace-ac-to-motivating-case.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-efficiency/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-efficiency/feedback_no-shell-incremental-scope.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_removed-flag-vacuity.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "Bugs [impl-review]", "s": "pass"}, {"i": "Security [impl-review]", "s": "pass"}, {"i": "Contracts [impl-review]", "s": "pass"}, {"i": "Best practices [impl-review]", "s": "pass"}, {"i": "AC coverage trace [impl-review]", "s": "pass"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": [{"i": "Bugs [impl-review]", "s": "reviewed"}, {"i": "Security [impl-review]", "s": "reviewed"}, {"i": "Contracts [impl-review]", "s": "reviewed"}, {"i": "Best practices [impl-review]", "s": "reviewed"}, {"i": "AC coverage trace [impl-review]", "s": "reviewed"}, {"i": "UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]", "s": "n/a", "p": "no UI surface in scope"}]}
```
