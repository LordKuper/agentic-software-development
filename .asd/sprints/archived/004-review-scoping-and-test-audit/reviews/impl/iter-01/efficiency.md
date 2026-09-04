[REVIEW-impl-efficiency]: CONCERNS

**Sprint** `004-review-scoping-and-test-audit` · **Phase** impl-review · **Iteration** 1 · **Floor** low · `review.scoped_fan_out` absent → disabled → both diff-derived predicates false → no section pre-marked `n/a`.

## Findings

| # | Sev | Cat | Location | Finding | Fix |
|---|---|---|---|---|---|
| 1 | critical | simplify | `.asd/migrations/4.0.0.js:53-57`, `:107-111`, `:217` | **Dead flexibility shipped for a hypothetical future caller.** `OTHER_STALE_RELPATHS = []` plus a dedicated `deleteOtherStaleFiles()` that iterates it plus its call in `migrate()` — a loop whose body provably never executes this release. The comment states the motive outright: *"kept as its own list so a future migration copying this file's structure has a named place for its own leftovers"*. Two checklist hits: **"Dead code left 'in case we need it'"** and **"Abstraction with no second use case"**. AC-13 asks the migration to remove other out-of-`managed_paths` leftovers; `audit.md`/`plan.md` found none, and the correct implementation of an empty set is no code — the header comment already records that the case was considered and is vacuous. | Delete the const (5 comment lines + 1 code line), the 5-line `deleteOtherStaleFiles` function, and its call — 12 lines net. `deleteMarkedView` stays and is reusable verbatim by a future migration that actually has leftovers. No new abstraction introduced by the fix. |
| 2 | critical | simplify | `.asd/skills/asd-update/update.js:265-275` (decl), `:391` (sole caller) | **Optional parameter whose default branch is unreachable.** `writeUpdatedManifest(..., versionOverride)` guards with `versionOverride !== undefined ? versionOverride : newManifest.asd_version`. The function is not exported, has exactly one call site, and that site always passes `migrations.reachedVersion`, which `runMigrations` always returns as a string (both return paths set it). The fallback is **defensive code for an impossible-by-contract case** / a **premature flag no caller chooses**, carrying an 8-line comment to justify optionality that nothing uses. | Make it a required 4th parameter `reachedVersion`; assign `asd_version: reachedVersion` directly. Keep the AC-12 rationale sentence ("version computed from migration outcomes first, so a failed migration never advances past the last success"), drop the "may be lower / override" framing. −1 branch, −4 comment lines. |
| 3 | low | simplify | `.asd/workflows/asd-phase-design-review.md:33` vs `:69` | **Agent dispatched with a structurally empty allowed-section list, and the file contradicts itself about it.** Step 7's correctness bullet concedes *"the reviewer still returns one verdict covering … n/a bookkeeping only"*, while "Agents delegated to" asserts *"a dispatched agent is never section-skipped down to zero work, only the latch skips the whole agent"*. Both cannot be true. Concretely: in any consumer profile with `prd`/`adr`/`c4` enabled but `ux_spec` disabled, design-review spawns a full opus/high agent whose every rubric section is `n/a`, to review nothing and return a guaranteed APPROVE that then counts toward DoD. Cost is bounded to one dispatch per sprint by the new latch — but one guaranteed-no-op opus dispatch per sprint plus a self-contradicting contract is the exact cost class this sprint exists to remove. AC-7's own wording ("Correctness (UI rubric section only, **conditional on a ux-spec/design-system draft being in the set**)") reads as conditioning the roster entry, so skipping is consistent with the AC, not a scope change. | In step 7, skip the `asd-reviewer-correctness` dispatch when its allowed-section list resolves empty, recorded exactly as the retired UI reviewer's conditional dispatch was — "not counted in DoD" per `review-policy.md`'s existing "a section never applicable is not counted as missing". Correct the "Agents delegated to" line to state the one real exception. No new mechanism: this is the conditional the file already had before the merge. |
| 4 | medium | simplify | `.asd/rules/code-style.md:116` + `:118`; `.asd/agents/asd-tester.md:62`; `.asd/workflows/asd-phase-impl-test.md` step 4 | **One behavioural rule stated four times, and the SSoT pointer was narrowed to permit it.** The authoring bar appears as §17 bullet 1, again as §17 bullet 3, again near-verbatim in `asd-tester.md:62`, again near-verbatim in the workflow — the last two each ending "*full criterion at `code-style.md` §17 (SSoT)*" while restating it in full. Evidence this is drift, not convention: `asd-tester.md:64`, two lines below the restatement, says "Check-ladder selection, prune criteria, and fail-first regression proof: §17 (SSoT), **not restated here**" — and this diff *removed* "no-new-test decision rule" from that not-restated list specifically to restate it. Violates `AGENTS.md` "Hard rules" (dedup to SSoT; minimize runtime tokens) and loads the same paragraph into every `asd-tester` dispatch and every impl-test workflow read. *Overlaps `asd-reviewer-documentation`'s SSoT-integrity item — one fix, not two.* | Keep §17 bullet 1 as the sole definition; fold bullet 3's only new fact (record decision `none` + reason in `test-plan.md`) into it and delete the rest. In `asd-tester.md` and the workflow, replace the restated criterion with a pointer, restoring "no-new-test decision rule" to the "not restated here" list. |
| 5 | low | simplify | `.asd/agents/asd-reviewer-efficiency.md:24` (+ `:110`) vs `asd-reviewer-correctness.md:24` | **The two agents created in the same sprint follow opposite conventions for the same predicate.** Correctness links: *"predicate defined once in `asd-phase-impl-review.md` step 5 — this reviewer never restates it"*. Efficiency restates the whole conjunctive predicate inline **and** appends archaeology: *"with `scoped_fan_out: enabled` this used to be the dispatch-time skip … it now degrades to a section-level skip"*. The agent never needs the predicate — the workflow evaluates it and passes the result in the dispatch payload. Pure runtime-token cost in the hottest-loaded file of the impl-review fan-out. | Replace the predicate restatement with correctness's one-line pointer; delete the "used to be" clause (superseded-state narrative, useful to no dispatch). Leave `:110`'s ledger reason list — this agent's own vocabulary, stated nowhere else. ≈6 lines. |

**Assessed, no finding (recorded so a later iteration does not re-litigate):**

- **God/sprawling type — not a hit.** correctness = {bugs, security, contracts, best-practice, AC trace, UI conformance}; efficiency = {over-engineering, structure/cohesion, complexity-value, perf}. All are one responsibility — evaluate a change surface against a rubric and emit one verdict — differing in checklist content, not kind of work. Each concern is separately named, separately phase-gated, with a mandatory ledger row, so no rubric item can silently vanish; predecessor line counts (309→150, 210→147) confirm the merge removed prose rather than accreting it. A split would restore the per-agent dispatch cost AC-7 was approved to remove.
- **Section-ledger duplication — below the bar.** Only the generic sentence repeats (~2 lines); the load-bearing part, the allowed `n/a` reason vocabulary, genuinely differs per agent. Hoisting would net ~2 lines against an extra indirection.
- **Migration/orphan machinery vs AC — no over-engineering hit.** `compareVersions`/`listMigrations`/`pendingMigrations`/`runMigrations`/`loadFreshMigration` each have one production caller but are exported and directly exercised by the four runner tests AC-12 mandates — decomposition for testability, not layering. `ORPHAN_TREES`/`expectedGeneratedTargets`/`hasOwnershipMarker`/`findOrphans` are the minimum satisfying AC-14. No interface-with-one-implementer, factory, plugin system, framework-on-framework, mock-of-mock, or inheritance. Zero-dependency throughout.

**Cross-reviewer guard**: no fix proposed above adds an abstraction, layer, interface, dependency or config flag — all five are deletions, a pointer swap, or a restored conditional. No Complication Approval required. Noted for `asd-reviewer-documentation` (its rubric item, not raised here): `update.js:386-389` is an in-body comment restating the file-header sequencing rule, under the very §7 in-body ban this sprint introduces.

## Coverage

**Summary**: `files: 57/58 checked, 1 n/a · rules: 23 rows, 19 pass, 2 n/a, 5 finding-linked · sections: 7 reviewed, 1 n/a`

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Over-engineering checklist [both phases] | reviewed — findings #1, #2 |
| Structure / cohesion checklist [both phases] | reviewed — no hit (see assessed-no-finding) |
| Complexity-vs-value tradeoff [both phases] | reviewed — findings #3, #4, #5 |
| Perf budget compliance [impl-review] | **n/a: no budgets defined** — `custom-coding-rules.md` carries no perf-budgets section. Executable files *are* in scope, so the conjunctive predicate is false and the other four perf sections apply in full |
| Perf anti-patterns [impl-review] | reviewed — pass |
| Algorithmic complexity [impl-review] | reviewed — pass |
| Regression detection [impl-review] | reviewed — pass (no recorded baseline; no perf-sensitive path altered) |
| Hot path identification [impl-review] | reviewed — pass |

**Perf notes (no findings).** `findOrphans` walks 4 generated trees per `--check`: `expectedGeneratedTargets` builds a `Set` (O(1) lookups) and `hasOwnershipMarker` — the only file *read* — fires solely for files already missing from the plan, so a clean repo costs 4 `readdir` walks over ~45 entries and zero extra reads. `runApply` computes orphans unconditionally up front even when every requested target hits the plan — a wasted walk on the common post-edit apply, microseconds against the render+write it precedes; lazy computation would trade a measurable nothing for an extra branch. Migration walks are one-shot and bounded. `tests/run.js`: the new `runAll()` awaits sequentially exactly as the old loop did; `makeMigrationFixtureRepo()` copies `.asd/sync.js` per fixture × 4 tests, linear and justified. No n+1, unbounded allocation, large-collection copy, or quadratic scan.

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| Perf budget compliance [impl-review] | no budgets defined — `.asd/project/custom-coding-rules.md` has no perf-budgets section |
| Over-engineering — generic with one type param | no generics in scope (JS + Markdown) |
| Over-engineering — inheritance depth ≥3 | no inheritance in scope |
| `.asd/sync-state.json` | generated digest record; no rubric item applicable |
| `custom-common-rules.md` | carries no rule constraining this diff |

**Finding rows (verbatim)**

| Rule item | Finding |
|---|---|
| Abstraction with no second use case | finding #1 |
| Dead code left "in case we need it" | finding #1 |
| Premature config flag | finding #2 |
| Defensive code for impossible case | finding #2 |
| Complexity-vs-value tradeoff | finding #3 |
| Complexity-vs-value tradeoff (SSoT duplication) | finding #4 |
| Complexity-vs-value tradeoff (runtime-token cost) | finding #5 |

## Verdict

CONCERNS — 2 critical (over-engineering checklist, undroppable), 1 medium, 2 low. All five are fixable by the responsible creator without escalation: every fix is a deletion, a pointer swap, or a restored conditional; none adds an abstraction, layer, interface, dependency, or scope.

## Next action

Route to `impl` (review-fix mode) per `review-policy.md` "Autofix vs escalation" — impl-review does not fix in place. Findings #1 and #2 are undroppable on later iterations regardless of severity floor.

## Escalations

None.
