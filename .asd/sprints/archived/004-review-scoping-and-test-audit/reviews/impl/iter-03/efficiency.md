[REVIEW-impl-efficiency]: APPROVE

# Review — efficiency (impl-review, iteration 3, floor `high`)

- **Scope**: incremental diff `654f8fb...HEAD`, 13 files

## Findings

| # | Severity | Category | Location | Finding | Fix |
|---|---|---|---|---|---|
| — | — | — | — | *(none — no finding at or above the `high` floor, and no over-engineering or structure/cohesion checklist hit at any severity)* | — |

Empty by result, not by omission. The items flagged for scrutiny were each examined against a specific checklist line and each cleared.

## Judgment on the four questions asked

**1. Did the rewrite reduce complexity or relocate it? — Reduced.** Counted by *decision sites*, not lines:

- **`latched` read-for-satisfaction sites deleted: 5 → 0** — `asd-phase-pr.md` (absent key now "always blocks, no exception"), `asd-phase-impl-review.md` aggregation, `asd-phase-design-review.md` aggregation, `sprint-lifecycle.md` "State recovery", and `session-start.js`'s `lastReviewVerdict`. Every one previously had to combine two state sources; none does now.
- **`latched` sites remaining: 4, all single-purpose** — two dispatch filters and two latch writes. That is the whole mechanism, one responsibility.
- **Branches deleted in code**: `session-start.js` lost four `hasLatched ?` fallbacks and one input shape; its function now reads exactly one map. Net −8 lines *and* −1 parameter shape. The 8-line explanatory comment collapsing to one is a consequence of the mechanism no longer needing explanation — the right direction.
- **Ambiguity deleted**: `sprint-lifecycle.md`'s absent-key bullet went from two meanings to one. That two-meaning bullet was the defect generator.
- **Added**: exactly one Invariant paragraph in the SSoT plus one always-write clause at each of the two write sites — the clause sits where the write happens, not as a second mechanism.

No residual dual reasoning survives at any *consuming* site. Unchanged latch references outside the diff were checked under the change-surface exception: all are dispatch-skip statements (correct and unchanged in meaning) or outcome summaries ("roster APPROVE/latched") that stay true under the invariant, since a latch-skipped reviewer's `verdicts` entry now *is* `APPROVE`. The phrase "or latched" there is redundant rather than contradictory — `low` at worst, below floor, not a checklist hit. Noted, not raised.

Structurally this is the good outcome of the structure/cohesion checklist: `latched` previously carried two independent reasons to change (dispatch optimisation + satisfaction evidence); it now carries one.

**2. `removeIfEmptyDir` fallback in `4.0.0.js` — justified duplication, not a smell.** Checked against the two items it could trip and cleared both. *"Helper wrapping one stdlib call"* — no: it wraps three calls behind a capability probe, and the added value is version tolerance in a destructive path. *"Defensive code for an impossible-by-contract case"* — no, the case is reachable: `applyPlan` runs migrations after `applyClassifications`, and a `.asd/sync.js` classified `conflict`/`conflict-foreign` without `--force` stays unwritten, so the migration's `require` can legitimately return the pre-4.0.0 engine. Without the fallback that is a `TypeError` thrown between `fs.rmSync` and the report push — a half-applied destructive delete with the manifest pinned at `reachedVersion`. The SSoT tension against `sync.js`'s copy is real but correctly resolved: a migration must not depend on the consumer's engine version, and the duplicated body is three lines.

**3. `unionMigrationsByVersion` — earned, not machinery.** A named pure function, not an abstraction, layer, interface, factory or plugin point; no checklist item reaches it. It carries real logic (merge, local-wins dedupe by version, sort), fixes a genuine preview defect (`.asd/migrations` is itself a managed path, so a migration this release delivers is absent from the pre-update tree at plan time), and matches the file's existing exported-pure-helper convention. Single production caller plus a direct unit test is the normal shape for that convention. `runMigrations` correctly keeps reading the local dir alone — post-write it already contains the incoming scripts — so this is not two implementations of one rule.

**4. Per-migration report logging — a real consumer, not a token one.** `reports` was constructed and returned with no reader at all: dead payload. The new loop gives it the only consumer that can act on it — the operator running `asd-update` now sees `deleted` / `skippedUnmarked` / `missing` / `commandsYaml` / `activeReviewSprints`, and `skippedUnmarked` in particular is a "your own file was left in place, deal with it" signal previously reachable only via the migration's own warning. Output is bounded (27 paths max) and printed once per migration on the CLI path.

## Performance sections

Budgets: `custom-coding-rules.md` defines none, so **Perf budget compliance** alone is `n/a`; the scope contains executable files, so the other four sections were reviewed in full.

- **Anti-patterns** — none. No n+1, unbounded allocation, copy-on-large-collection, or serialize/parse roundtrip on a repeated path. Sync IO throughout is the codebase's deliberate zero-dependency CLI convention, and every added call sits on a once-per-invocation path.
- **Algorithmic complexity** — `unionMigrationsByVersion` is O(n log n) over the release count (single digits); `lastReviewVerdict` now makes two passes instead of one over ≤5 entries. Nothing nested on a user-sized collection.
- **Regression detection** — no baseline harness exists, so this is delta reasoning: +1 `readdirSync` of a small directory per `planUpdate`; +1 `existsSync`/`readdirSync` per deleted view on the fallback path only; +2 forked-node tests matching the file's existing pattern. State growth from the invariant is bounded at ≈5 short strings × ≤15 iterations. All negligible.
- **Hot paths** — none in this diff. The hook runs once per session over ≤5 values with no IO added; `update.js` and `4.0.0.js` run once per update.

## Coverage

**Summary**: `files: 13/13 checked, 0 n/a · rules: 30/34 pass, 4 n/a, 0 findings · sections: 7/8 reviewed, 1 n/a`

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Over-engineering checklist | reviewed — pass |
| Structure / cohesion checklist | reviewed — pass |
| Complexity-vs-value tradeoff | reviewed — pass |
| Perf budget compliance | n/a: no budgets defined |
| Perf anti-patterns | reviewed — pass |
| Algorithmic complexity | reviewed — pass |
| Regression detection | reviewed — pass |
| Hot path identification | reviewed — pass |

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| Rule: generic with exactly one concrete type parameter | no generic types in scope (JS) |
| Rule: inheritance depth ≥ 3 without polymorphic dispatch | no classes or inheritance in scope |
| Rule: `custom-design-rules.md` | outside phase gate (design/design-review only) |
| Section: Perf budget compliance | no budgets defined |

**Note on one sub-floor item**: two in-body comments inside test callbacks were judged by this reviewer as matching the surrounding file convention and below the `high` floor. `code-style.md` §7 enforcement is owned by `asd-reviewer-documentation` under AC-8 at severity `high`, and that reviewer raised them this iteration — its ruling governs.

## Verdict

APPROVE. The mechanism rewrite is the correct call over a fourth patch and it delivers: five two-source reconciliation sites deleted, zero added, one invariant stated once in its SSoT. The three items flagged for scrutiny each clear the checklist item they most plausibly trip, on evidence rather than benefit of the doubt.

## Next action

Reviewer done. No fix routes to `impl` from this reviewer.

## Escalations

None. No finding proposes a new abstraction, layer, or dependency.
