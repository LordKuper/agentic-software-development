[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3 (severity floor `high`)
- **Scope**: incremental diff `654f8fb...HEAD`, 13 files
- **Method note**: this reviewer has no shell; the diff was read from the supplied payload and corroborated by direct file reads plus ledger/test-count arithmetic.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above the `high` floor | — |

Nothing at or above `high` survives. The four dispatch questions were checked against the actual code and all resolve in the tester's favour — detail below, deliberately not inflated into findings.

**1. The latest entry's all-`none` outcome is honest.** Its five rows are verifiable against the delta. The APPROVE-latch invariant genuinely has no Node surface: the whole chain (`sprint-lifecycle.md` "APPROVE latch"/"State recovery", both review workflows, `asd-phase-pr.md` step 4) is Markdown consumed by a dispatched agent, and the one Node reader of `verdicts` — `session-start.js` — no longer reads `latched` at all after the rollback, so pointing a test at it would not exercise the invariant. `session-start.js`'s rolled-back branch set is genuinely covered: the three behaviour-bearing predicates (`approved`, `isSkipped`, and the `some/every` combinator) are each driven end-to-end by a distinct spawned-subprocess fixture, and the availability-skip fixture is discriminating rather than vacuous — `"APPROVE (skipped: …)"` fails `isSkipped`, so a strict equality predicate would turn that test red. The untested `red`/`yellow`/`n/a` guards are byte-identical pre-sprint lines in a display-only hook; leaving them fixtureless is inside the risk bar, and the entry names them rather than hiding them.

**2. The `mixed` flip is the honest reading and the right call.** Against the current predicate an all-legacy-`skipped:` map has zero `approved` values, so the code returns `mixed` — the test now asserts what the code does, under a name that states it. Weakening the hook to keep the old expectation would have deleted the "at least one genuine approval" invariant the rollback deliberately restored. Reachability: not producible by any current-workflow dispatch (post-4.0.0 every reviewer either returns a real token or is latch-materialised as a literal `"APPROVE"`), only by an untouched pre-4.0.0 `state.json` — degenerate, and `mixed` is the right word for a degenerate map in a display-only summary. One sub-floor nuance for the record: `sprint-lifecycle.md` describes the hook as counting a legacy `"skipped: …"` value as satisfied without mentioning the `some(approved)` precondition, so prose and code diverge for that one degenerate shape. Wording-level, display-only, no gate impact.

**3. The four new/fixed tests fit their risks.** All unit-level, the cheapest level that catches the defect, all deterministic (per-fixture temp roots, no clocks, no network, no shared state, no ordering dependence). The migration-preview union test's fail-first arithmetic checks out independently. The `4.0.0.js` fallback test's stub engine omits `removeIfEmptyDir` only, so the pre-fix call throws the reported `TypeError` — a real fail-first against the real failure mode. The `--check` CLI fix names the original test's failure as green-for-the-wrong-reason and re-proves the fixed version by hand-toggling the marker check; the second invocation now runs against a repo holding exactly one unmarked orphan and asserts the `orphan-unmarked` item its name claims. The `"APPROVE (skipped: …)"` fixture is new coverage of already-shipped code and correctly records `n/a` on fail-first rather than claiming a proof it does not have.

**4. The agent-memory registry is complete and honest.** Enumerated `.claude/agent-memory/` directly: the stranded trees are `asd-reviewer-performance/`, `asd-reviewer-quality/`, `asd-backend-dev/`, plus one `asd-pm/` file — all four are `(accepted-debt)` rows in `stubs.md`. `asd-test-engineer/` is gone and `asd-tester/` holds the two migrated files, consistent with a pure 1:1 rename, which is a migration rather than a stranding and correctly not registered as debt. No other retired name ever had a memory tree, so nothing is silently missing. Zero in-code `TODO(sprint-…)` markers exist repo-wide.

**5. Ledger-drift class — there IS a variant the tests would miss, but no live instance.** The two integrity tests assert *listed entry → actual file hash*, i.e. staleness only. They cannot see an **omission**: a canonical file added under a `managed_paths` tree but never given an `upstream_hashes`/`canon_hashes` entry is invisible to them, since completeness is asserted for `.asd/agents/*.md` alone. Checked for a live instance and found none — every file on disk under the managed trees is ledgered (13/13 rules, 10/10 workflows, 1/1 hook, 33/33 templates, 12/12 agents, 17/17 skills, plus `update.js`, `sync.js`, `4.0.0.js`). Freshness at HEAD corroborated structurally: every dual-mapped file carries identical hex in both maps, which a hand-patched entry would desync, and the only commits after the last suite HEAD are sprint-artifact writes outside `managed_paths`. So no fourth drift occurrence is shipping. A second copy of the same assertion would not close the class — the completeness direction belongs with whatever `sync.js --check` change resolves it.

## Coverage

**Summary**: `files: 5/13 checked, 8 n/a · rules: 12/12 resolved, 0 findings`

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| `.asd/agents/asd-reviewer-correctness.md` | non-executable agent prose (stop-condition rewording); no Node code parses agent prose, and mirror correctness is `sync.js --check` + the ledger tests' job, both green |
| `.asd/rules/review-policy.md` | non-executable rule prose (DoD table row + paragraph); no parser exists or is warranted |
| `.asd/rules/sprint-lifecycle.md` | non-executable rule prose (APPROVE-latch invariant, State recovery); its only Node reader, `session-start.js`, is covered separately |
| `.asd/templates/t_review.md` | template prose (section-ledger table folded into the summary line); no behaviour a test can observe |
| `.asd/templates/t_test-plan.md` | template prose ("(name, path)" wording) |
| `.asd/workflows/asd-phase-design-review.md` | workflow prose interpreted by a dispatched agent at runtime |
| `.asd/workflows/asd-phase-impl-review.md` | workflow prose interpreted by a dispatched agent at runtime |
| `.asd/workflows/asd-phase-pr.md` | workflow prose; the gate it describes has no Node implementation |

**Finding rows**: none.

## Verdict

APPROVE — nothing at or above `high` survives, stated plainly rather than manufacturing a finding: the all-`none` entry is defensible row by row, the `mixed` flip is the correct call, the four new/fixed tests are risk-fitted, meaningful, deterministic and fail-first where owed, and the stub/agent-memory registry is a complete account of what this sprint stranded.

## Next action

Advance. Two items for the `pr` phase to carry, neither blocking this gate:

1. `.asd/release-manifest.json` still records `asd_version: "3.1.0"` while `.asd/migrations/4.0.0.js` exists — the bump is the `pr` phase's job, and until it lands `pendingMigrations`' upper bound excludes the migration for every consumer. Run the recorded manual-verification step, then land the deferred `max(.asd/migrations/*.js version) <= manifest.asd_version` assertion in the next impl-test entry that touches `tests/run.js`.
2. The ledger-drift design gap already routed to reviewers has a testing-side corollary for the follow-up, not this sprint: the integrity tests validate listed-entry → file, never file → listed-entry, so an omitted ledger entry for a newly added canonical file would go undetected. No live instance today.

## Escalations

None.
