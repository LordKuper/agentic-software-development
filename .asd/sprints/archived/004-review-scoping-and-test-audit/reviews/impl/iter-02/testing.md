[REVIEW-impl-testing]: CONCERNS

# Review — testing (impl-review, iteration 2, floor `medium`)

- **Scope**: incremental diff `d94c841...HEAD`, 25 files

## Findings

| # | Severity | Location | Finding |
|---|---|---|---|
| 1 | medium | `tests/run.js:1571-1593` (`sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is`) | The test name claims both halves of `main()`'s exit-code discrimination, but the body never constructs the second one. `makeMiniRepo()` plants no files in any generated tree, and the only fixture file created is the *marked* orphan, which line 1590 then deletes. The second `execFileSync` therefore runs against a repo with **zero** orphans and proves only "no orphan → exit 0" — not "an `orphan-unmarked` present → still exit 0". That is the branch with real consumer impact: if the predicate ever widened to `status.startsWith('orphan')`, every consumer holding one hand-authored `.claude/agents/*.md` would get a permanently red `sync.js --check` build gate. Not hypothetical — `providers.md` in this same diff now reads "`--check` is what enumerates every orphan — reports each, exits non-zero", wording a future editor could implement literally. The unit-level sibling covers *status* discrimination but never `main()`'s exit code or `ok` flag. Fix: write an unmarked file into `.claude/agents/` before the second CLI invocation and assert `error === null` / `ok: true` with the `orphan-unmarked` item present. As written the second assertion is coverage theatre against its own name. |
| 2 | medium | `test-plan.md` Entry 3 row 3 (`session-start.js` → `none`); `.asd/hooks/session-start.js:121`; `tests/run.js:1937-1995` | The `none` decision is honest about two of the three value forms the rewritten `satisfied` predicate admits, and silently omits the third. The row reasons about (a) `hasLatched` (independently confirmed unreachable: `asd-phase-impl-review.md` step 8 writes `latched[<key>]` in the *same* state update that records that reviewer's `APPROVE` into `verdicts["iter-NN"]`, so `latched` non-empty implies the latest map is non-empty; step 2 never pre-creates an empty map) and (b) the legacy `/^skipped:/` carve-out (covered twice). It never mentions **`v.indexOf('APPROVE') === 0`**, which newly admits External Review's availability-skip value `"APPROVE (skipped: <reason>)"` — the *current-workflow* form, mandated by `sprint-lifecycle.md` "State recovery" and `asd-phase-pr.md` step 4, produced on every impl-review iteration in any consumer lacking the other provider's CLI. The prior predicate (`v === 'APPROVE'`) did **not** match it, so this is a real behaviour change on a routinely-reachable shape, and neither hook fixture exercises it. Cost of the check is one fixture line in an existing family. Either add it, or record the form explicitly in the `none` row with a stated reason — as it stands the row reads as covering all of `session-start.js`'s delta when it does not. This is also AC-2's only executable surface, so the omission leaves that AC's code-level trace partially unasserted. |
| 3 | medium | `.asd/project/stubs.md:16-17` | The two `(accepted-debt)` rows are individually honest, but the enumeration is incomplete for this sprint's own retirements. Three further agent-memory trees for agents retired this sprint are stranded and unregistered: `.claude/agent-memory/asd-reviewer-quality/`, `.claude/agent-memory/asd-backend-dev/`, `.claude/agent-memory/asd-test-engineer/`. The last matters most: `asd-test-engineer` was *renamed* to `asd-tester` (not merged away), so live testing context now sits under a name no agent will ever load again, while `.claude/agent-memory/asd-tester/` does not exist. Register all leftovers under the same `(accepted-debt)` reason (or migrate the renamed agents' memory), so the registry is a complete account of what this sprint stranded rather than a sample of it. No in-code `TODO(sprint-004-…)` marker exists anywhere, so no orphan marker and no undeleted stub. |

## Judgments on the items put to this review

**Fail-first proof of the migration-cache regression test — genuine, not fixture self-construction.** The test pre-`require`s the fixture's own `<repoRoot>/.asd/sync.js` before `applyPlan` overwrites it. That is a faithful stand-in for production: `update.js` ships at `<repoRoot>/.asd/skills/asd-update/update.js` (a managed path) and its module-level `require` resolves to the *exact same absolute path* a migration reaches via `require(path.join(ctx.repoRoot, '.asd', 'sync.js'))`. Node keys `require.cache` by resolved path, so the stale entry exists in every real `asd-update` run whose plan includes `.asd/sync.js`; before `invalidateSyncCache` there was no bust anywhere on that path (`loadFreshMigration` busts only the migration file; `loadFreshSync` runs after `runMigrations`). The recorded failure shape is exactly what a stale engine missing a new export produces, and the assertion reads an observable return value. The proof stands.

**The replacement removal — justified.** The removed test's cache entry could only ever be created by its own prior `require()`; `update.js`'s own comment concedes as much. Valid hypothetical-risk removal, in scope, reason recorded. One caveat stated precisely: the replacement does **not** cover strictly more — it covers a different, genuine axis (engine cache) and leaves `loadFreshMigration`'s own cache-delete unasserted. That residue is acceptable, being precisely the risk judged hypothetical. The `Removed tests` row does not overclaim, so no finding.

**Other Entry-3 `none` decisions — sound.** `invalidateSyncCache` (proven end-to-end by the regression test), `hashLedger: null` (asserted directly), and the `MigrationReport`/`reports[version]` widening (asserted) all correctly resolve to "an existing check already covers this". Only the `session-start.js` row is incomplete (finding #2).

**New tests' quality — good, one exception.** Nested-orphan prune is at the right level, asserts both file and directory absence, and carries a hand-mutation fail-first proof — legitimately non-redundant with the migration's own prune test because the two callers construct absolute paths independently. The `--apply` CLI test earns its subprocess level: exit code, `ok`, `hashLedger === null` and byte-for-byte immutability of both ledgers are only observable from `main()`. Manifest-after-failed-migration asserts on-disk state. The `commands.yaml` rework is a real improvement: the fixture now mirrors the commented placeholder, and `activeLines.length === 1` is the assertion that actually exercises the active-vs-comment distinction the old fixture could never reach. Determinism is clean throughout — per-test temp dirs, no sleeps, no clock, no ordering dependence, symlink case degrades explicitly, CLI subprocesses bound to the fixture cwd.

**D-1 — no regression test warranted.** The defect was stale `sync-state.json` housekeeping, not logic, and the existing repo-integrity test is what caught it — red at the entry-2 gate (100/101), green at entry-3 (102/102). That red→green pair *is* the fail-first evidence; a second test would duplicate an existing check.

**Manual verification — right call, with a note.** Automating `max(.asd/migrations/*.js) <= manifest.asd_version` now would land a red test (manifest still `3.1.0`), which §17 forbids. Stronger than the test-plan claims: `asd-phase-pr.md` step 4 already encodes this invariant as a **blocking** DoD check, so the item is workflow-gated, not reliant on a human remembering. The deferred `tests/run.js` assertion has no durable home outside this soon-to-be-archived `test-plan.md` — worth carrying into the pr-phase changelog, but below the medium floor as a finding.

## Coverage

**Summary**: `files: 15/25 checked, 10 n/a · rules: 10 items, 7 pass, 3 findings`

**`n/a` rows (full list)**

| File | Reason |
|---|---|
| `.asd/agents/asd-reviewer-correctness.md` | reviewer prose, no executable behaviour |
| `.asd/agents/asd-reviewer-efficiency.md` | reviewer prose, no executable behaviour |
| `.asd/rules/core.md` | glossary prose |
| `.asd/rules/review-policy.md` | review-process prose, no test surface |
| `.asd/skills/asd-init/SKILL.md` | setup prose |
| `.asd/templates/t_review.md` | artifact template, no executable behaviour |
| `.asd/workflows/asd-phase-design-review.md` | workflow prose outside this sprint's executable surface |
| `.asd/workflows/asd-phase-plan.md` | workflow prose |
| `AGENTS.md` | doc; count claims and sync digest already guarded by existing green tests |
| `README.md` | doc; agent-count claim guarded by the `WORD_TO_NUMBER` test |

**Finding rows (verbatim)**

| Rubric item | Finding |
|---|---|
| No-test-decision honesty (§17) | finding #2 |
| Meaningfulness / no coverage theatre | finding #1 |
| Edge cases | finding #1 |
| Stub-resolution verification | finding #3 |

## Verdict

CONCERNS — three `medium` findings, none blocking. The sprint's headline regression test is sound and its proof is real; the removal is justified; determinism and edge-case coverage are strong. What holds this short of APPROVE is one assertion that does not test what its name promises (#1), one incomplete `none` justification on the sprint's only executable trace of AC-2 (#2), and an incomplete accepted-debt registry (#3).

## Next action

Route to `impl` review-fix, then back through `impl-test`: #1 and #2 are test-side work for `asd-tester` (one fixture addition each, or for #2 an explicit recorded reason in the Entry-3 `none` row); #3 is a `stubs.md` edit. All three are small and none requires new production code.

## Escalations

None.
