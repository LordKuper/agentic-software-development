[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Evidence**: [manifest](./correctness.manifest.json) · [ledger](./correctness.ledger.json) · [findings](./correctness.findings.json). `validate-ledger` ok.

The main route is consistent with the ACs across:

- templates, scope step 3a, "Optional documents", audit step 5, the plan precondition, `checkpoints.md:62`, the hook, `/asd-init`, README and `AGENTS.md`;
- `.asd/project/config.yaml:12`, which holds `skip_design_phases: enabled` (AC-6).

Both findings concern the new resume sentence.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| COR-1 | low | `.asd/skills/asd-sprint/SKILL.md:43` vs `.asd/hooks/session-start.js:159`, `.asd/workflows/asd-phase-audit.md:3,7` (AC-5, AC-3) | **Resume and the hook disagree when audit is skipped and the setting is on.** Audit step 1 records its own skip (`phase="audit"`, `"audit"` appended) before step 5's design-block write. A session interrupted between the two writes behaves inconsistently: the hook reports `plan`, but resume 2B.4 sees `phase` as the last `skipped_phases` entry and dispatches its chain successor, `design`. That breaks AC-5 and loads `asd-phase-design`, which AC-3 forbids. The design collapse then runs and logs the wrong reason. `tests/run.js:2868-2870` checks only that the word `skipped_phases` appears. | Fold audit step 1's skip record into the step 5 write when `skip_design_phases` is `true`, so audit never sits as the last skip entry under the setting. Alternatively, align 2B.4 with the hook rule. |
| COR-2 | low | `.asd/skills/asd-sprint/SKILL.md:43`, `.asd/workflows/asd-phase-plan.md:7`, `.asd/rules/sprint-lifecycle.md:129` | **The resume rule and the plan precondition read a historical list as current status.** `skipped_phases` is "a historical record, not current status": a phase skipped, rolled back, then re-run for real keeps its old entry. Example: an earlier no-op leaves `"design-promote"` in `skipped_phases`, the user rolls back, and a real promotion is interrupted at `phase="design-promote"`. Resume then dispatches `plan`, and plan's precondition ("`skipped_phases` contains `design-promote`") accepts the stale entry. It fails open: plan runs on unpromoted docs. | Apply the exception only when the skip is newer than the current entry into `phase` (e.g. no rollback recorded after that skip), or scope it to the collapse state. Tighten plan's precondition to the same condition. |

## Coverage

Compact ledger: [correctness.ledger.json](./correctness.ledger.json). All files `checked`; Security, Contracts and Best practices `pass`; Bugs → COR-2; AC coverage trace → COR-1; UI conformance `n/a: no UI surface in the iteration scope file list`; all sections `reviewed`.

## Verdict
CONCERNS: 2

## Next action
`impl` review-fix mode. Make one-sentence canon edits in `asd-sprint` resume and audit step 1, and tighten plan's precondition for COR-2. Sync the `asd-sprint` views. Then have the tester strengthen the resume assertion at `tests/run.js:2868` so it checks the successor rule itself.
