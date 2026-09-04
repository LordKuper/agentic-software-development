[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency (impl-review, iteration 2, floor `medium`)

- **Scope**: incremental diff `d94c841...HEAD`, 25 files

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| 1 | critical | simplify | `.asd/hooks/session-start.js:102-109` | Over-engineering checklist — **"Comment that restates code"**. The new 8-line doc comment above `lastReviewVerdict` enumerates the three accepted verdict forms (`"APPROVE"`, `"APPROVE (skipped: …)"`, legacy `"skipped: …"`) that the one-line `satisfied` predicate at line 121 already states literally. It additionally reintroduces in-code document references (`sprint-lifecycle.md` "APPROVE latch", "State recovery") and a sprint-scoped `AC-2` label — the exact two things this same delta strips out of `4.0.0.js`, `update.js` and `sync.js`. The fix cycle moved the smell rather than removing it. | Reduce to purpose + invariant, no enumeration, no doc/AC citation: `// Display-only session summary of the latest review round: a latched reviewer counts as satisfied even with no verdicts entry. Never a gate; must not throw on a malformed shape.` The value forms are self-evident from `satisfied`. |
| 2 | critical | simplify | `.asd/agents/asd-reviewer-correctness.md:24` (Stop conditions, clause **(3)**) | Over-engineering checklist — **"Defensive code for impossible-by-contract case"**. Clause (3) (~70 words, in an always-loaded agent file) specifies ABORT-avoidance behaviour for a dispatch this same delta made unreachable: `asd-phase-design-review.md` step 7 now skips the Correctness dispatch entirely when no ux-spec/design-system draft is in scope. The clause concedes this itself ("so this condition is never actually hit in normal operation; if ever dispatched anyway…"). The workflow simplification is real; the agent-side hedge is prose paid for on every dispatch of both review phases. | Replace clause (3) with the pointer only: "design-review with no ux-spec/design-system draft in the set → this agent is not dispatched at all (`asd-phase-design-review.md` step 7), so no ABORT path exists." Drop the empty-allowed-section-list fallback sentence. |
| 3 | medium | simplify | `.asd/templates/t_review.md:28-33` | Complexity-vs-value: the dedup moved the section-ledger contract to `review-policy.md` part 3 (correct), but the template gained a **full** section-coverage table under the heading that says "This file persists only the reduced form below" — contradicting (a) `review-policy.md` "Persistence" (`reviewed` rows are dropped from the written file), (b) the template's own frontmatter (`excludes: … the reviewer's full returned ledger`), and (c) the adjacent n/a table, which already carries section n/a rows verbatim. Net effect: 8-13 zero-information rows per persisted review file, per reviewer, per iteration, plus a per-write ambiguity about which of the two homes wins — against the repo's minimize-runtime-tokens hard rule, in the delta that claims to compress. | Delete the table block. The Summary line's `· sections: {{reviewed}}/{{total}}, none blank` plus the existing n/a rows table is already the complete reduced form. Also repair the malformed nested placeholder on line 28 (double-brace inside double-brace is not resolvable); make it a plain parenthetical. |
| 4 | medium | simplify | `.asd/skills/asd-update/update.js:368, 375, 380, 386` (consumer side: `:534-538`) | Complexity-vs-value: the `reports` map is collected per migration and returned, but has **no production consumer** — the CLI apply branch prints `ran` and `failure` only; the runner "never inspects its shape" (its own contract comment); no other caller reads it. Its single reader today is one test assertion. The contract widening itself (`MigrationReport` return) is earned — `4.0.0.js` already returned a report and its own tests assert it directly — but the per-version collection channel is machinery added in a fix cycle with its use case still hypothetical. | Either give it the obvious consumer (one line next to `Ran N migration(s)`: log each version's report, so an operator sees what a migration actually deleted/changed), or drop `reports` and have the regression test observe the fresh engine the way the test it replaced did (migration writes a file under `ctx.repoRoot`, asserted afterwards). |

**No escalation required.** All four fixes are deletions or a single log line — none adds an abstraction, layer, or dependency. Cross-reviewer guard: verify the same for any Correctness/Documentation fix proposing new prose sections — the change surface already grew in `review-policy.md`, `t_review.md`, `providers.md`, and `sprint-lifecycle.md`.

## Assessed and explicitly kept (no finding)

- **`sync.js` exports `removeIfEmptyDir`, shared by `runApply`'s orphan branch and `4.0.0.js`** — right call, not premature sharing: two live callers, identical semantics, and the alternative is duplicating a delete-side-effect in a *destructive* code path. The migration's local copy is correctly gone.
- **`4.0.0.js` losing `OTHER_STALE_RELPATHS` / `deleteOtherStaleFiles`** — clears two checklist items at once; the file is smaller and its scope comment now matches its behaviour.
- **`writeUpdatedManifest`'s required `reachedVersion`** — a strict reduction: one branch and an 8-line comment removed, no caller lost.
- **`invalidateSyncCache`** — 4 lines closing a real defect class; not defensive-for-impossible (a migration may legitimately rewrite `sync.js`), so per-iteration invalidation inside the loop is the honest contract rather than an optimisation to hoist.
- **`planUpdate`/`printPlan` pending-migration surfacing** — 5 lines, real dry-run value; costs one directory read per invocation.
- **`tests/run.js` (~190 lines)** — no coverage theatre at or above floor. Each new case maps to a behaviour change or stated failure mode in this delta. The `realisticCommandsYaml` fixture replaces a synthetic one and is reused twice — dedup, not scaffolding.
- **Prose dedup, honest tally**: agent files shrank, `4.0.0.js`/`update.js`/`sync.js` shed ~40 lines of narration and doc-citation, `asd-phase-plan.md` dropped a meaningless bullet. Against that, `sprint-lifecycle.md` "State recovery" and `providers.md` "Orphan detection" grew — but they grew where the SSoT *is*, replacing behaviour previously unstated rather than duplicating it. The one place the dedup net-added redundancy is finding #3.

## Coverage

**Summary**: `files: 23/25 checked, 2 n/a · rules: 23 items, 19 pass, 1 n/a, 4 finding-linked · sections: 8/8, 1 n/a`

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Over-engineering checklist | reviewed — findings #1, #2 |
| Structure / cohesion checklist | reviewed — pass (no god/sprawling type; `lastReviewVerdict` keeps one responsibility, `runMigrations` gained a collection but not a second reason to change) |
| Complexity-vs-value tradeoff | reviewed — findings #3, #4 |
| Perf budget compliance | **n/a: no budgets defined** — no perf-budgets section in `.asd/project/custom-coding-rules.md`; executable files in scope, so the other four performance sections were reviewed in full |
| Perf anti-patterns | reviewed — pass |
| Algorithmic complexity | reviewed — pass |
| Regression detection | reviewed — pass (no baseline defined; nothing measurably regresses) |
| Hot path identification | reviewed — pass |

**Perf narrative**: `invalidateSyncCache` costs `existsSync` + `resolve` + a cache delete per migration (N≈1). `removeIfEmptyDir` costs `existsSync` + one `readdirSync` per deleted orphan, bounded by the caller's explicit target list. No sync IO on a hot path (CLI one-shot; the hook runs once per session), no unbounded allocation, no added serialize/parse roundtrip. `findOrphans` walk frequency unchanged; `planUpdate` adds one directory read. The new CLI tests add three `execFileSync` node spawns (~0.1-0.3 s suite growth), consistent with the suite's existing hook tests.

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| `.asd/release-manifest.json` | mechanically regenerated hash ledger; no logic or prose to assess |
| `.asd/sync-state.json` | mechanically regenerated digest ledger |
| PF-1 Perf budget compliance | no perf-budgets section in `.asd/project/custom-coding-rules.md` |

**Finding rows (verbatim)**

| Rule item | Finding |
|---|---|
| OE-12 Comment that restates code | finding #1 |
| OE-7 Defensive code for impossible-by-contract case | finding #2 |
| CV Complexity-vs-value tradeoff | finding #3 |
| CV Complexity-vs-value tradeoff | finding #4 |

## Verdict

CONCERNS: 4 (2 critical checklist hits, 2 medium)

## Next action

`asd-dev` autofixes all four in the next `impl` review-fix pass: compress the `lastReviewVerdict` comment (#1); collapse clause (3) in `asd-reviewer-correctness.md` to the workflow pointer (#2) and re-run `sync.js --apply` for that agent; delete the section-ledger table block and fix the nested placeholder in `t_review.md` (#3); resolve `reports` either way in `update.js`, keeping the suite green (#4). No escalation, no user decision required.

## Escalations

None.
