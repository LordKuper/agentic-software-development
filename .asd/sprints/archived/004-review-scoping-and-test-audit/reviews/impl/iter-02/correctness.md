[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2 (severity floor `medium`)
- **Scope**: incremental diff `d94c841...HEAD`, 25 files

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl-review.md:58` (interacts with `.asd/workflows/asd-phase-pr.md:34`) | **New defect introduced by this fix cycle.** Step 9's *test-defect* red path now clears BOTH `latched` maps sprint-wide, then loops in place and can reach the green branch → `NEXT: pr`. Unlike the code-defect path (which routes to `impl`, guaranteeing a fresh impl-review entry that re-dispatches everyone), this path leaves the sprint with `verdicts["iter-NN"]` missing every latch-skipped reviewer's key (step 8: "a latch-skipped reviewer gets no entry here") **and** `reviews.impl.latched = {}`. `asd-phase-pr.md` step 4 "Reviews green" then reads that state: an absent key satisfies only when `latched` carries it — otherwise it blocks. Concrete path: iter 2+, Correctness latched at iter 1 → not dispatched at iter 2 → step 9 red (test defect) → latches cleared → tester fixes → green → `NEXT: pr` → pr blocks permanently on a missing `correctness` key with no review file to fall back on (a latch-skipped reviewer writes no file). `sprint-lifecycle.md` "Red-full-suite invalidation" only reasons about the route "before the sprint routes back to `impl`" — the in-place test-fix route has no next impl-review entry to re-dispatch into. | Either (a) clear latches on the test-defect path only when it ultimately exits to `impl`, or (b) before clearing, materialise each latch-satisfied reviewer's key into `verdicts["iter-NN"]` as `"APPROVE"` so satisfied-vs-blocking survives the clear, or (c) have the green branch after a red event re-enter step 6 with the now-empty latch map instead of proceeding to `pr`. State the choice in `sprint-lifecycle.md` "APPROVE latch" so the pr gate and the latch contract agree. |
| 2 | medium | `.asd/skills/asd-update/update.js:207-208` | `planUpdate` computes `pendingMigrationVersions` from `path.join(repoRoot, '.asd', 'migrations')` — the **consumer's pre-update** tree — while `runMigrations` reads the same dir **after** the managed-path write. `.asd/migrations` is a managed path, so the migrations an update *delivers* are absent at plan time. For the first real use (consumer at `3.1.0` → `4.0.0`) the dir does not exist at all → `listMigrations` returns `[]` → `printPlan` prints no "Migrations that will run" line, then `applyPlan` runs `4.0.0.js` anyway. The new preview is silently empty in exactly the case it was added for, and `--dry-run` misreports that no migration will execute. | Derive the preview from the plan's own classifications or from `sourceRoot`, unioned with the local dir so a migration present only locally still shows. Add a runner test case where the migration exists only in `upstreamRoot`. |
| 3 | medium | `.asd/migrations/4.0.0.js:77` (helper now at `.asd/sync.js:759`) | The fix replaced the migration's self-contained `removeIfEmptyDir` with `sync.removeIfEmptyDir(...)`, where `sync` is `require(<consumerRoot>/.asd/sync.js)`. That symbol exists **only in ≥4.0.0** sync.js, but `applyPlan` legitimately leaves `.asd/sync.js` unwritten whenever `classifyUpdateItem` returns `conflict`, `conflict-foreign`, `keep-local-modified`, `foreign`, or `reject` — a consumer who edited sync.js, or whose manifest has no `upstream_hashes` entry for it, keeps the old engine and the migration still runs. Result: `TypeError: sync.removeIfEmptyDir is not a function` thrown *after* `fs.rmSync` already deleted the first marked view — a half-applied destructive migration, an error naming neither cause nor fix, and a re-run that deletes one more file before throwing again. Before this delta the migration's only ≥4.0.0 dependency was `hasOwnershipMarker`, which pre-exists. | Make the dependency defensive in the migration (`typeof sync.removeIfEmptyDir === 'function' ? … : localFallback`, 3 lines), or have `runMigrations` fail fast with an explicit message when `.asd/sync.js` was not written by this apply (its classification is available in the plan). |
| 4 | medium | `.asd/workflows/asd-phase-design-review.md:35` vs `.asd/rules/review-policy.md` "DoD per review phase" (design-review row) | The delta changed the DoD table's design-review Efficiency scope to "**complexity-vs-value tradeoff** sections", matching the agent's real rubric heading. The design-review workflow still builds the **allowed-section list** from the old name ("Efficiency = over-engineering + structure/cohesion + design-principles sections", explicitly citing the DoD table as its source; step 7's bullet at line 32 likewise). "design-principles" matches no `###` section in the agent file, so the payload's allowed-section list and step 8's section-ledger gate now hold two disagreeing lists — a section-row rejection or a silently unreviewed section, depending on how the reviewer resolves the name. | Update `asd-phase-design-review.md` step 7 (both the Efficiency bullet and the payload sentence) to name `Complexity-vs-value tradeoff`, keeping `design-principles.md` only as the rule input that section reads. |
| 5 | medium | `.asd/hooks/session-start.js:102-109` | The doc comment added above `lastReviewVerdict` cites project documents throughout ("AC-2 APPROVE latch, sprint-lifecycle.md \"APPROVE latch\"", "same doc's \"State recovery\"", "legacy pre-4.0.0"), violating `code-style.md` §8 (the new §8 exception covers only an `AC-N` id in a *test file's* name/path). It also narrates implementation rather than purpose (§7). This same delta stripped exactly this class of reference from `sync.js`, `update.js` and `4.0.0.js`, and amended `AGENTS.md` to state code-style governs this repo's Node code with no exemption — so the new comment contradicts the rule the delta itself just extended to this file. | Reduce to a standalone rationale with no document names, e.g. "Display-only session summary. A verdict counts as satisfied when it is an APPROVE token (bare or availability-skip form), a legacy skipped value, or a latch entry with no verdict of its own. Never throws." |

## Coverage

**Summary**: `files: 25/25 checked, 0 n/a · rules: 18/28 pass, 5 findings, 7 n/a · sections: 6/6 reviewed, none blank`

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Bugs [impl-review] | reviewed — findings #1, #2, #3 |
| Security [impl-review] | reviewed — pass (1 item n/a: no auth surface) |
| Contracts [impl-review] | reviewed — finding #4 |
| Best practices [impl-review] | reviewed — finding #5 |
| AC coverage trace [impl-review] | reviewed — finding #1 (partial-AC row); AC-2/5/7/12/13/14/15 traced |
| UI conformance [impl-review] | reviewed in full (predicate `false`: `scoped_fan_out` absent → disabled) — no UI surface exists in the iteration's diff, so all seven UI rubric items resolve `n/a: no UI surface in scope`; no findings, not pre-marked n/a |

**`n/a` rows (full list)**

| Rule item | Reason |
|---|---|
| Security — auth/authorization bypass | no auth surface in this repo |
| UI — token usage (`design-system.md` §6) | no UI surface in the delta (no `.html`, stylesheet, template markup or view code among the 25 scoped files) |
| UI — token comment (§4) | no UI surface in the delta |
| UI — component fidelity / states | no UI surface in the delta |
| UI — design-system completeness | no UI surface in the delta |
| UI — lint exclusions (§11) | no UI surface in the delta |
| UI — UX principles | no UI surface in the delta |
| UI — accessibility | no UI surface in the delta |

**Finding rows (verbatim)**

| Rule item | Finding |
|---|---|
| Bugs — unhandled errors / unhandled state paths | finding #1 |
| Bugs — unhandled errors / unhandled state paths | finding #2 |
| Bugs — unhandled errors / unhandled state paths | finding #3 |
| Contracts — API/interface drift | finding #4 |
| Best practices — idiomatic patterns / cited source rule | finding #5 |
| AC coverage — no partial AC without explicit follow-up | finding #1 |

**Residuals recorded below the `medium` floor (not findings this iteration)**: deleting the last file in `.claude/agents` would prune that tracked directory itself (self-healing on the next apply); `t_review.md`'s nested `{{ · sections: {{reviewed}}/… }}` placeholder is unusual but not parser-critical; the `--check` CLI test's name claims an unmarked-orphan case its body never constructs (Testing reviewer's domain).

## Verdict

CONCERNS: 5 (1 high, 4 medium)

## Next action

Route all five to `impl` review-fix — none requires escalation. Priority: finding #1 first (it can strand the sprint at the `pr` gate with no in-phase recovery), then #3 and #2 (both are `asd-update` consumer-facing paths shipping with this release), then #4 and #5. Findings #1 and #4 each need a matching edit on their SSoT side (`sprint-lifecycle.md` "APPROVE latch" for #1, `asd-phase-design-review.md` step 7 for #4) so the mirrors stay consistent. Finding #2 warrants one added runner-test case (migration present only upstream at plan time).

## Escalations

None — every finding is autofixable by the responsible creator within the existing sprint scope.
