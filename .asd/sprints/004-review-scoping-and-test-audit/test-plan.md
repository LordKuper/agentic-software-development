---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 004-review-scoping-and-test-audit

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | `21d342022868d5a35b15a87a8418782713164eb0` | full change surface |
| 2 | `42c00fe65114be2d30aa13d9241b9df24f7962b0` | delta since entry 1: impl-review iter-01 findings routed to `asd-tester` — testing #1–#9, correctness #8/#9/#12 |
| 3 | | delta since entry 1 (`git diff 21d342022868...HEAD`) — review-fix for iter-01 is now fully finalized (D-1 fixed; every remaining critical/finding resolved by `impl`, `decisions-log.md` 2026-09-04 "impl review-fix for iter-01: findings resolved"). This pass judges the handful of production-code changes in that full span not already covered by entry 2's own rows: `invalidateSyncCache`, the newly-shared `removeIfEmptyDir`, `--apply`'s `hashLedger: null`, `session-start.js`'s `latched`/legacy-`skipped:` awareness, and the migration contract's `MigrationReport`/`reports[version]` widening |
| 4 | | delta since entry 3 — impl-review iteration 2 review-fix for `testing.md` #1-#3, plus test-side coverage of the other iter-2 fix groups' production changes: `session-start.js` rolled back to its pre-sprint shape (one widening kept: `APPROVE (skipped: …)` recognised), `update.js`'s `planUpdate` migration-preview union, `4.0.0.js`'s `removeIfEmptyDir` local fallback, `update.js`'s `main()` per-migration report line |
| 5 | `d4489b7c7f939942be23ec00f96dca84c7357ab2` | delta since entry 4's own authoring commit (`git diff 0d67c96...HEAD`): the D-2 ledger-recompute finalize commit (`7d21dd5`), plus fresh judgment — not itemized by entry 4's own rows — on the prose-group edits landed earlier in the same iter-02 fix cycle (`review-policy.md` DoD row/paragraph, `asd-phase-design-review.md` step 7 section names, `t_review.md` table removal, `t_test-plan.md` "(name, path)" wording) and confirmation the APPROVE-latch invariant's aggregation consequence and `session-start.js`'s rolled-back fixture coverage still hold after the cycle's final wording |

**Impacted-set derivation (AC-5 safety valve, `sprint-lifecycle.md` "Impacted test set"):** change surface = 57 non-generated files; only three carry executable code (`.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/migrations/4.0.0.js`) — everything else is prose/rule/template/config. `commands.yaml` has no `test_affected` selector (by design — see its own comment). The change surface touches framework-wide shared infrastructure (`sync.js`, the update driver, agent roster) — the mandatory safety valve (`sprint-lifecycle.md`) fires: impacted set **degrades to the full suite**, i.e. `node tests/run.js` exactly. This is the first real exercise of the valve this sprint's own change wrote.

**Pre-strategy impacted run (step 3, before any authoring — not a gate):**

- Command: `node tests/run.js`
- Result: **73/83 passed, 10 failed** — matches the expected count carried forward from the impl assessment (decisions-log 2026-09-04).
- Failures:
  1. `read-only agents (8 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only` — hardcoded `assert.strictEqual(readOnlyNames.length, 9, ...)`; actual = 6 (`asd-advisor`, `asd-external-review`, `asd-reviewer-correctness`, `asd-reviewer-documentation`, `asd-reviewer-efficiency`, `asd-reviewer-testing`).
  2. `README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count` — `WORD_TO_NUMBER` map has no `Twelve` entry; README correctly says "Twelve specialized agents" and `.asd/agents/` has 12 files (verified: `ls .asd/agents/*.md` = 12).
  3. `update driver: new upstream file with nothing local -> add, written on apply` — `TypeError: Cannot read properties of undefined (reading 'some')`.
  4. `update driver: local hand-edited vs old release hash -> conflict, never overwritten` — same `TypeError`.
  5. `update driver: --force overwrites a conflict only when the caller explicitly names it` — same `TypeError`.
  6. `update driver: upstream removed the file, local untouched -> deleted on apply` — same `TypeError`.
  7. `update driver: --dry-run mode reports the full plan but writes nothing at all` — `AssertionError`, `result.dryRun` undefined.
  8. `update driver: sync.js --check runs automatically after a real apply` — `AssertionError`, `result.syncCheck` not an array.
  9. `update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache` — `AssertionError`, `result.syncCheck` undefined.
  10. `update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine` — `AssertionError: Missing expected exception`.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Roster test `read-only agents (8 reviewers + asd-advisor)` (`tests/run.js:1002`) | Test defect, not code defect: the directory-driven enumeration mechanism (derives the read-only set from `.asd/agents/` filenames) is still correct and still the cheapest reliable check for "every reviewer + advisor is tool-locked read-only" — it just hardcodes the pre-AC-7/AC-11 count (9) and comment. Actual roster (12 agents: 6 creators, 4 internal reviewers + external, 1 advisor) makes the read-only set 6, by design of AC-7/AC-11, not a regression. | unit | keep | Existing check is the right mechanism; only its literal `9` and stale "8 reviewers" wording need updating to match the intentionally new roster. Fixed in step 7, re-run at step 8. |
| Roster test `README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count` (`tests/run.js:1051`) | Test defect: `WORD_TO_NUMBER` is a literal guard map (`Fourteen..Eighteen`), never meant to be a general number-word parser — it is missing a `Twelve` entry because the roster shrank below its prior range. README's own claim ("Twelve specialized agents", 12 canonical agent specs) is verified correct against the actual 12-file `.asd/agents/` directory — no doc defect. | unit | keep | Existing check remains the right mechanism (guards against count drift); the map needs one added entry (`Twelve: 12`). Fixed in step 7. |
| `update.js`'s `applyPlan` became `async function` in Task 13 (must `await runMigrations`, itself async per the migration script contract `(ctx) => void \| Promise<void>`) — 8 update-driver tests at `tests/run.js:1126-1415` all call `update.applyPlan(...)` synchronously, without `await`, and read properties off the returned (unresolved) Promise. | Test defect, not code defect, confirmed by tracing: `applyClassifications`/`buildNextUpstreamHashes` (the file-write half) run synchronously *before* `applyPlan`'s first `await`, which is why the 6 update-driver tests that only assert on-disk file state (never on `result.*`) still pass unaffected. The 8 that fail all read `result.applied`/`result.dryRun`/`result.syncCheck` — properties that only exist after the `await runMigrations(...)` point, i.e. on the resolved value, not the Promise object. `main()` (the real CLI entry, line 514) already correctly `await`s `applyPlan(...)` — production behaviour is correct and matches the plan's mandated async migration contract (AC-12). | unit | keep | Existing tests remain the right check for `applyPlan`'s contract; they need `await` added to each call and to be declared as async test functions. This requires a small, mechanical extension to `tests/run.js`'s own runner loop (currently `for (const t of tests) { t.fn(); }`, no `async`/`await` anywhere in the file today) so it can `await` an async test body — judged in-scope test-code maintenance (adapting the existing zero-dependency runner to a legitimate async production signature already shipped and already used correctly by `main()`), not "new test infrastructure" in the Complication-Approval sense (no new framework, library, or dependency). Flagged explicitly for visibility since it touches the runner itself, not just individual test bodies. Fixed in step 7. |
| `.asd/sync.js` orphan detection (Task 12, `findOrphans`/`hasOwnershipMarker`/`runCheck`/`runApply` marker-gated delete path) — brand-new capability, zero existing coverage. | Real, material: this is the sprint's explicitly-flagged riskiest new logic (plan.md Task 12: "deletion logic that walks generated trees can remove a consumer's custom `.claude/agents/*.md`; ownership markers must be verified before any removal"). Untested marker-gate or fail-closed-on-symlink logic could silently delete a consumer's own hand-authored agent/skill, or silently leave a real orphan behind. | unit | add | No existing check exercises `findOrphans`/marker-gated delete at all — confirmed by grep (no `orphan` hits in `tests/run.js`). Cheapest reliable check is a unit test against `makeMiniRepo()`-style fixtures (existing pattern in `tests/run.js` §3b), asserting `runCheck`/`runApply` behaviour directly — no e2e/CLI spawn needed, matching how the rest of `sync.js` is already tested. |
| `.asd/skills/asd-update/update.js`'s unplanned fail-open fix (an `applyClassifications`/`runApply`-equivalent target matching no plan entry now reports `not-found`/`ok:false`, whole batch aborted) — carried forward from the impl assessment (decisions-log 2026-09-04) as explicitly needing coverage. | Real: this is a correctness fix to a previously-silent failure mode (a caller-side typo used to report `applied: true` — a false-green). No existing test exercises a bogus/unmatched target in `runApply`'s batch (existing tests only cover invalid-canon-JSON aborting the batch, a different trigger). | unit | add | Cheapest reliable check: one unit test asserting a batch containing one bogus relPath alongside a good one aborts the whole batch (mirrors the existing "preflight aborts the WHOLE batch" pattern already used for invalid JSON, `tests/run.js:342`). |
| `update.js` migration runner (`listMigrations`/`pendingMigrations`/`runMigrations`, Task 13) — new mechanism, zero existing coverage. | Real, material, and explicitly mandated: sprint.md AC-12 states outright "Tests in `tests/run.js` cover the runner and its ordering logic: ascending order, skip already-applied, stop-on-failure, and the no-migrations-needed path." Plus one risk this sprint's own audit named (loading migrations from a freshly-written tree, same trap class `loadFreshSync` already solves for `sync.js`). | unit | add | Same fixture pattern already used for the update driver (`mkTempDir` + local-fixture-as-upstream), per audit.md's own stated reuse plan. Five tests cover: ascending order, skip-already-applied, stop-on-first-failure pinning `reachedVersion`, no-pending-migrations path, and fresh-tree loading (never a stale require-cache copy of a migration script shipped in the same apply). |
| `.asd/migrations/4.0.0.js` (Task 14) — the sprint's one piece of destructive, outside-`managed_paths` code; zero existing coverage. | Real, material, explicitly flagged by the audit as "the only destructive code in the sprint, and it runs outside `managed_paths` where `update.js`'s own `delete` classification cannot reach." Untested behaviour here could delete more than the explicit nine-name list, fail non-idempotently on re-run, mis-handle a missing target, silently rewrite consumer-owned `commands.yaml`/config/sprint content, or fail to warn on a mid-review-phase active sprint. | unit | add | Unit tests against a fixture consumer tree (same `mkTempDir` pattern), asserting `migrate(ctx)`'s returned `report` object directly (no stdout-capture needed — `report.deleted`/`report.missing`/`report.skippedUnmarked`/`report.commandsYaml`/`report.activeReviewSprints` are all inspectable return values, consistent with the existing suite's assert-on-return-value convention). Four tests cover: delete+missing-is-success+idempotent-rerun, unmarked-file-left-untouched, additive `commands.yaml` field + consumer-content-preservation, and the review-phase warning (asserted via `report.activeReviewSprints`, not console capture). |
| The other ~50 files in the change surface: `.asd/rules/*.md`, `.asd/workflows/asd-phase-*.md`, `.asd/agents/*.md` frontmatter/prose (reviewer merges, dev merge, renames, tier bumps), `.asd/templates/t_*`, README.md, AGENTS.md, `.asd/release-manifest.json`, `.asd/project/commands.yaml`, `.asd/project/custom-*-rules.md` | None executable. These are Markdown rule/workflow/agent prose interpreted by dispatched agents at runtime, plus config/template files. No Node code in this repo executes their content — `tests/run.js` has no parser for rule/workflow prose and none is warranted (inventing one would be a coverage-number-only test, forbidden by `code-style.md` §17). | n/a | none | No behaviour added that this repo's own test runner can observe: correctness of the rename/merge sweep is verified by the AC-15 repo-wide grep (manual/scripted verification step, not a `tests/run.js` unit) and by `node .asd/sync.js --check` (already an existing, still-passing check — build gate, not this pass's job to add). `release-manifest.json`'s `canon_hashes`/`managed_paths` and `t_state.json`'s new latch shape are already covered by existing, still-green checks (`release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file`, `every .asd/templates/*.json file parses as valid JSON`) — no new test earns its place on top of those per the hypothetical-risk criterion. |

### Entry 2 (impl-review iter-01 findings: `testing.md` #1–#9, `correctness.md` #8/#9/#12)

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `applyPlan`'s wiring of `runMigrations().reachedVersion` into `writeUpdatedManifest` (testing #1) | Real: the five migration-runner tests exercise `runMigrations` in isolation only; nothing asserted the WRITTEN `release-manifest.json` actually carries the pinned version after a failed migration — a wrong argument here leaves a consumer's manifest recording a version it never reached, silently (`main()` writes before `die()`). | unit | add | Extends the existing update-driver fixture family (`mkTempDir` + local-fixture-upstream): one migration succeeds, the next throws; asserts the ON-DISK manifest's `asd_version` and `result.migrations.failure.version`. |
| `4.0.0.js`'s `.agents/skills/<name>/SKILL.md` delete branch and the `removeIfEmptyDir` per-skill-directory prune (testing #2) | Real: both branches are destructive and untested; the directory-delete path in particular has no rubric-scoped test for "deletes only the emptied per-skill dir, never a surviving sibling". | unit | add | Extended the existing delete test in place with a second retired target (`asd-test-engineer`'s skill dir) plus a surviving non-retired `.claude/agents/asd-dev.md` sibling. |
| 5 un-awaited `update.applyPlan(...)` call sites on a now-async function (testing #3) | Real: each left a floating promise; the continuation (manifest write, post-apply check) ran AFTER the test was already reported `ok`, silently narrowing coverage and racing later tests. `code-style.md` §17 determinism. | unit | keep | Added `await` + `async` to all five test bodies; no new assertions needed, the existing ones now observe the full `applyPlan` contract. |
| `max(.asd/migrations/*.js version) <= release-manifest.asd_version` invariant (testing #4 / correctness #12) | Real in principle, but **not automatable at this HEAD**: `.asd/release-manifest.json.asd_version` is still `3.1.0` (the bump to `4.0.0` is explicitly the `pr` phase's job, per decisions-log 2026-09-03 "AC-12 sequencing"/2026-09-04 impl-assessment carry-forward) — an assertion added now would be red for a reason outside this dispatch's scope (a phase-ordering fact, not a code defect), and §17 forbids landing a test that is not green against the current implementation. | unit (deferred) | none | Recorded as the sprint's Manual-verification item instead (see below), naming the exact assertion to add to `tests/run.js` once the `pr`-phase bump lands — matches `testing.md` finding #4's own suggested fix ("add the corresponding unit assertion … once the bump lands"). |
| AC-15's "none" row substitute — retired-agent-name grep result (testing #5) | The `none` decision (see Entry 1's "other ~50 files" row) leans on this grep as its evidence; the result was previously not recorded anywhere. | n/a | none | Re-ran the grep (see `Suite run` below for command + outcome) and recorded it, so the substitute check has evidence, not just an assertion. |
| `sync.js` CLI (`main`'s `--check`/`--apply` exit-code contract) (testing #6); aborted-`--apply`-batch ledger/manifest/sync-state atomicity (correctness #8) | Real: the green path was covered (existing test spawns the real CLI); both red paths — `--check` exit 1 on a marked orphan, `--apply` exit 1 on a not-found target — were untested, and nothing asserted that an aborted `--apply` batch skips the hash-ledger recompute and leaves `release-manifest.json`/`sync-state.json` untouched (the fix `main`'s `hashLedger: hasInvalidTargets ? null : …` exists to guarantee). | unit (CLI subprocess) | add | Two new tests spawn the real `.asd/sync.js` CLI (same `execFileSync` pattern as the existing green-path test) against a `makeMiniRepo()` fixture: one for `--check`, one for `--apply` (which also asserts `hashLedger === null` and both files byte-for-byte unchanged). |
| `4.0.0.js`'s `commands.yaml` fixture shape (testing #8) | Real: the prior fixture had no commented `# test_affected:` line, so it never exercised the exact active-vs-comment distinction `/^test_affected\s*:/m` encodes — the branch every real `/asd-init`-generated consumer file hits. Two report statuses (`undetectable`, `missing`) were also uncovered. | unit | fix + add | Replaced the fixture with a `t_commands.yaml`-shaped one (commented placeholder line present); added one test each for `undetectable` (no supported runner detected) and `missing` (no file at all). |
| "a migration script … loads fresh" test naming the migration's OWN require-cache poisoning (testing #7) | Judged against this sprint's own hypothetical-risk bar: in production a migration path is `require`d at most once per process, so that cache can never actually go stale — the only poisoner was the test's own prior `require()` call. The REAL risk (confirmed by external review, `impl-review/iter-01/external.md`) is the ENGINE's cache: `update.js`'s module-level `sync` and a migration's own `require(ctx.repoRoot + '/.asd/sync.js')` can resolve to the same already-cached path in a real consumer process. | unit | fix (replace) | Deleted the hypothetical-risk test; added a genuine regression test that poisons `require.cache` for the fixture's own `<repoRoot>/.asd/sync.js` path, then drives a real `applyPlan` that overwrites that same file and runs a migration requiring it — proving `invalidateSyncCache` (the fix) is what makes it pass. Fail-first proof in `Added tests` below. |
| `test-plan.md`'s own `Suite run` shape (testing #9) | The prior record didn't follow this sprint's own template shape (`t_test-plan.md`): no `Scope:` bullet, `HEAD` nested under the gate subsection instead of the bullet list. | n/a | fix | Rewritten below to match `t_test-plan.md`'s `Suite run` shape exactly. |
| `SessionStart hook: an all-"skipped:" verdict map … is "mixed"` (discovered while re-running the impacted set — the code changed under this entry) | The `impl` review-fix pass landed `lastReviewVerdict`'s legacy carve-out (correctness finding #7's fix, `sprint-lifecycle.md` "State recovery": every consumer of the verdict map, including this display-only hook, treats a legacy `"skipped: <predicate>"` string as satisfied identically to `APPROVE`). That is a deliberate, documented behaviour change; this pre-existing test's fixture (all-legacy-skip, no bare `APPROVE`) now legitimately reads `"green"`, and the old assertion (`must NOT print "green"`) is stale against the new contract, not a code defect. | unit | fix | Test defect, not a code defect (traced against the new, explicitly documented rule) — renamed and flipped the assertion to expect `"green"`, matching the carve-out's stated "identically to APPROVE" semantics. |

### Entry 3 (review-fix finalization confirmation pass — delta since entry 1, `git diff 21d342022868...HEAD`)

Pre-strategy impacted run (step 3, before authoring): `node tests/run.js` → **101/101 passed** — confirms `decisions-log.md` 2026-09-04's "Suite is 101/101" and D-1's `fixed` status in this file's own `Defects` section; nothing new is red going into this pass. Impacted-set derivation unchanged from entry 1/2: the delta again touches shared infrastructure (`sync.js`, `update.js`, `session-start.js`, `.asd/migrations/*.js`), `commands.yaml` still carries no `test_affected` selector, so the mandatory safety valve fires and the impacted set is `node tests/run.js` (the full suite) again.

Most of this entry's delta is test code entry 2 already authored, or production fixes made specifically to satisfy findings that already carry tests (`invalidateSyncCache` ← testing #7's replacement regression test; `hashLedger: null` ← testing #6/correctness #8's CLI test; the `MigrationReport`/`reports[version]` contract ← testing #1's manifest test plus the same regression test). The honest strategy-pass outcome for those is `none`, confirmed rather than re-derived. Two items are genuinely new, uncovered code paths judged real by tracing the actual production code (not the diff alone):

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `update.js`'s `invalidateSyncCache(repoRoot)` (the fix underlying testing #7's replacement test) | Traced directly: guarded by `fs.existsSync(syncPath)`, so busting a cache entry for a `.asd/sync.js` that doesn't exist yet on disk is a safe no-op, not a failure mode. Its only consumer-visible effect (a migration `require`-ing `.asd/sync.js` seeing the just-written engine) is already exhaustively proven by the existing regression test, which pre-poisons `require.cache` exactly as production would and asserts the post-fix behaviour. Interaction with `loadFreshSync` (called once more, after `runMigrations`, at `applyPlan`'s own post-apply-check step) is a second `delete require.cache[...]` on an already-deleted key — a documented no-op in Node, not a new failure mode. | n/a | none | No unexercised branch, no interaction risk beyond what the existing regression test already proves end-to-end; adding another test here would duplicate an existing check (`code-style.md` §17 hypothetical-risk criterion). |
| `.asd/sync.js`'s newly-exported `removeIfEmptyDir`, now shared verbatim between `runApply`'s orphan-delete branch (`sync.js:1407`, `removeIfEmptyDir(path.dirname(absOrphan))`) and `.asd/migrations/4.0.0.js`'s `deleteMarkedView` (`sync.removeIfEmptyDir(path.dirname(absPath))`, since `cd5e49c` dropped 4.0.0.js's own duplicate copy) | Real: one shared implementation, but two independently-constructed call sites. `ORPHAN_TREES` includes `.claude/skills` and `.agents/skills` — both per-name-subdirectory trees `walkDir` recurses into — so `runApply`'s own orphan-apply path (a consumer running plain `sync.js --apply` after a canonical skill is retired) can reach a nested, now-to-be-emptied skill directory exactly like the 4.0.0 migration's hardcoded target list does. Entry 2's extended 4.0.0-migration test already proves the *migration's* call site prunes a now-empty skill directory; nothing proved `runApply`'s own orphan-delete branch does the same — its existing orphan tests (`sync.js orphan detection: --apply deletes an explicitly-requested marked orphan…`) only ever target flat `.claude/agents/*.md` files with surviving siblings, so `removeIfEmptyDir`'s actual-removal branch was never reached via *this* caller. | unit | add | Cheapest reliable check: one more `sync.js orphan detection` unit test, same `makeMiniRepo()`/`markedFileContent` fixture family already used by the sibling tests, targeting a marked orphan at `.agents/skills/asd-reviewer-quality/SKILL.md` via `sync.runApply` directly (not through the migration) and asserting the now-empty `.agents/skills/asd-reviewer-quality/` directory is gone too. Verified fail-first by hand: temporarily commenting out `sync.js:1407`'s `removeIfEmptyDir(...)` call turned this new test red (`FAIL`, directory still present) while every other test stayed green; restoring the line (`git checkout -- .asd/sync.js`) turned it green again — proof the test genuinely exercises this caller's own call site, not just the shared function in isolation. |
| `session-start.js`'s `latched`/legacy-`skipped:` awareness (`a14c19f`, `2e3906c`, `05fd101`, `26525b1`) | Traced against `sprint-lifecycle.md`'s own documented contract (line "an absent key for the current iteration… the reviewer carries an entry in `reviews.impl.latched[<key>]`… satisfied, counts exactly as APPROVE"): the realistic production shape is a *non-empty* `verdicts["iter-NN"]` object missing a key for the latched reviewer — and `lastReviewVerdict`'s `Object.values(latest)` already ignores absent keys entirely, routing through the exact same `verdicts.every(satisfied)` branch the existing `"skipped: <predicate>" verdict counts as satisfied` test already exercises. The only code genuinely gated on the new `hasLatched` variable (lines checking `hasLatched` when `verdicts`/`verdictsByIter`/`latest` is empty or missing outright) requires *every* required reviewer for that iteration to already be latched at the moment a *new* iteration opens — traced against `asd-phase-impl-review.md` step 8/9 and `sprint-lifecycle.md`'s latch-clear rule (a red terminal suite clears every latch before the next iteration opens; DoD being met by an earlier iteration means no further iteration opens at all) and found **not reachable** through any documented flow — a hypothetical shape, not a real one. **Correction (impl-review iter-02, `testing.md` #2):** this analysis is honest about `hasLatched` and the legacy carve-out but never named the third admitted value form, `v.indexOf('APPROVE') === 0` — External Review's availability-skip `"APPROVE (skipped: <reason>)"`, the current-workflow shape every consumer lacking the other provider's CLI produces routinely. It had zero fixture coverage at this entry. Superseded before a fixture could be added: the very next fix cycle rolled `session-start.js` back to its pre-sprint shape, removing `hasLatched` entirely and keeping only this one widening — see Entry 4, which adds the missing fixture against the current code. | n/a | none (superseded — see Entry 4) | The reachable shape is already proven by an existing check (`code-style.md` §17 "whose behavior an existing check already covers"); the only genuinely-new branch fails §17's hypothetical-risk criterion outright — authoring a test for it would be manufacturing coverage, the first-class "no new test needed" outcome applies. The missed `APPROVE (skipped: …)` form is fixed at Entry 4, not here, since `hasLatched` no longer exists to reason about. |

### Entry 4 (impl-review iter-02 review-fix: `testing.md` #1-#3, plus test-side coverage of the other fix groups)

Pre-strategy impacted run (step 3, before authoring): the code changed under this entry per the three fix groups named in the dispatch (APPROVE-latch invariant, `session-start.js` rollback, `update.js`/`4.0.0.js` fixes). Re-ran `node tests/run.js` first: **101/102 passed** (102 = entry 3's 102, minus a net zero since nothing was added yet) — one pre-existing red: `SessionStart hook: an all-legacy-"skipped:" verdict map … still reads "green"` now fails, because `session-start.js`'s rollback restored the pre-sprint requirement that `lastReviewVerdict` see at least one bare-APPROVE-shaped value before declaring "green" — the fixture (all values legacy-`skipped:`, no bare `APPROVE`) no longer satisfies that. Impacted-set derivation unchanged: shared infrastructure again fires the safety valve, full suite.

**Red-test decision (dispatch item 1):** traced against the current, rolled-back `satisfied` predicate (`session-start.js:113,116`) and `sprint-lifecycle.md`'s own documented value-form list ("State recovery"): the legacy carve-out gives a `"skipped: <predicate>"` value satisfied status **per-key**, but never on its own establishes that a review round produced any genuine verdict. The rolled-back code requires `verdicts.some(approved)` — at least one bare-APPROVE-shaped entry — before summarizing "green"; an all-legacy-skip map (every dispatched reviewer bypassed via the retired pre-4.0.0 `scoped_fan_out` agent-level skip, zero of them actually reviewing anything) is a degenerate case that invariant is designed to catch, not a state this display-only hook should ever call fully green. It is also not reachable through any *current*-workflow dispatch (every reviewer in the post-4.0.0 regime is either dispatched for real or latch-materialized as a literal `"APPROVE"` string per the rewritten invariant — never `"skipped:"`), so its only real-world source is a genuinely legacy, pre-4.0.0 `state.json` a consumer has not yet touched this sprint's workflow against. Decision: **`mixed` is the honest reading** — the test's fixture and name were flipped at entry 2 for a contract this rollback superseded; flipped back, renamed to state the `mixed` outcome directly. Not a hook change (`session-start.js` untouched by this entry) — a test-defect fix, traced against the current, intentional code.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `sync.js` CLI `--check` exit-code test never constructing its own "unmarked orphan present, marked orphan absent" case (testing #1) | Real, per the reviewer's own finding: the second `execFileSync` call ran against a repo with zero orphans at all, proving only "no orphans → exit 0", not the branch the test's name claims ("only an unmarked one" present still exits 0). | unit (CLI subprocess) | fix | Extended the existing test in place: write an unmarked file into `.claude/agents/` alongside the marked one from the start, so after the marked orphan is removed the second invocation runs against a repo holding exactly one unmarked orphan; assert `ok: true` and the `orphan-unmarked` item is present. |
| Entry-3 `session-start.js` `none` row omitting the `"APPROVE (skipped: …)"` value form (testing #2) | Real: this is External Review's availability-skip shape, mandated by `sprint-lifecycle.md`/`asd-phase-pr.md`, and the *current-workflow* form every consumer lacking the other provider's CLI produces routinely — the only one of the three admitted value forms with zero fixture coverage. | unit | add | One new fixture: a verdicts map mixing a bare `APPROVE` with an `"APPROVE (skipped: <reason>)"` entry, asserting the summary reads `green` — proves `indexOf('APPROVE') === 0` (not just `=== 'APPROVE'`) is what the `approved` predicate actually checks. Entry-3's `none` row reasoning corrected below. |
| `.asd/project/stubs.md` registering only 2 of 5 stranded agent-memory trees (testing #3) | Real: `asd-reviewer-quality`/`asd-backend-dev` have no clean 1:1 successor (accepted-debt, same reasoning as the two already-registered rows); `asd-test-engineer` is a pure 1:1 rename to `asd-tester` (this agent's own former identity) with live testing-context memory worth carrying forward, not stranding. | n/a | fix | Migrated `.claude/agent-memory/asd-test-engineer/`'s two files to `.claude/agent-memory/asd-tester/` (updating one stale claim about `sync.js --check` always exiting 0, now false for marked orphans since this sprint), deleted the old directory, and registered the other two trees as `(accepted-debt)` rows in `stubs.md` matching the existing entries' reasoning and owner. |
| `update.js`'s `planUpdate` pending-migration preview (`pendingMigrationVersions`, correctness #2) — now unions local + incoming migration trees | Real, traced directly: before the fix, the preview was computed from the *pre-update* local `.asd/migrations` dir only; for the first real bootstrap (`.asd/migrations` didn't exist locally yet, itself a managed path) the preview was silently empty. Zero existing test exercised a migration present ONLY upstream at plan time. | unit | add | One test: a migration written only into the fixture `upstreamRoot`'s `.asd/migrations`, another written only into `localRoot`'s (a consumer-authored-ahead-of-upstream case) — asserts `plan.pendingMigrationVersions` contains both, ascending. |
| `4.0.0.js`'s `removeIfEmptyDir` local fallback (correctness #3) — used when the consumer's `sync.js` predates the exported helper | Real, traced directly: `applyPlan` legitimately leaves `.asd/sync.js` unwritten on several classifications (`conflict`, `keep-local-modified`, etc.), so a migration can run against an engine lacking `removeIfEmptyDir` entirely; before the fix this threw mid-delete, a half-applied destructive migration. Zero existing test drove this branch — the existing migration fixtures all copy the current, full-featured `sync.js`. | unit | add | One test: a stub `sync.js` exporting only what `deleteMarkedView` needs minus `removeIfEmptyDir`, proving the migration's own local fallback still prunes the emptied directory and the delete completes without throwing. |
| `update.js`'s `main()` logging each migration's report (`result.migrations.reports[version]`) after apply (efficiency #4's resolution) | Traced directly: `main()` is this file's own documented untested surface ("Not exercised by tests/run.js - tests point planUpdate/applyPlan at a second local fixture directory standing in for upstream instead") — it requires a real network fetch (`fetchUpstreamTarball`) with no fixture seam, and the value it logs (`reports[version]`) is already asserted directly by the existing manifest test and the engine-cache regression test. Exercising this one `log()` line would mean building CLI/network-mocking infrastructure for a straight `JSON.stringify` of an already-proven value. | n/a | none | Fails the hypothetical-risk/no-coverage-theatre bar (`code-style.md` §17): the underlying value is already covered; the only uncovered part is string formatting behind an untestable, out-of-fixture-reach entry point. New test infrastructure to reach it would itself need Complication Approval for a near-zero risk payoff. |
| The APPROVE-latch invariant's executable consequence — "aggregation reads `verdicts` alone" (dispatch item 6) | The invariant itself (a latch-skipped reviewer's key is always materialized into `verdicts["iter-NN"]`) is implemented across `asd-phase-impl-review.md`/`asd-phase-design-review.md`/`asd-phase-pr.md` — workflow prose consumed by a dispatched agent at runtime, not Node code this repo's own test runner parses. `session-start.js`'s `lastReviewVerdict` is a different, explicitly non-gating display reader (`latched` awareness was removed from it entirely by the rollback) — it is not "aggregation" in the DoD-gate sense the invariant is about, so pointing a test at it would not exercise the invariant at all. | n/a | none | No Node code in this repo implements the gate-aggregation the invariant describes — same reasoning as the "other ~50 files" `none` row (Entry 1): prose interpreted by a dispatched agent, no parser exists or is warranted. |

### Entry 5 (post iter-02 fix-cycle: D-2 ledger recompute confirmed, prose group + latch invariant judged fresh)

Pre-strategy impacted run (step 3, before authoring): `node tests/run.js` → **105/105 passed** — confirms D-2's `fixed (ledger recompute)` status (the `upstream_hashes` integrity test, previously red, now green) and that nothing regressed since entry 4's own 3 additions. Impacted-set derivation unchanged: this delta's own diff (`.asd/release-manifest.json`, `decisions-log.md`, `state.json`, `test-plan.md`) still touches shared infrastructure (the release manifest's hash ledgers, read by both `sync.js` and `update.js`), `commands.yaml` still carries no `test_affected` selector, so the mandatory safety valve fires and the impacted set is `node tests/run.js` (the full suite) again.

Most of the iter-02 fix cycle was already judged at entry 4; this pass covers only what entry 4's own rows did not name and what the dispatch instructed to re-verify:

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/release-manifest.json`'s `upstream_hashes` recompute (`7d21dd5`, D-2's fix) | None beyond what D-2's own dedicated test already guards: this commit only updates four hash strings to match the four already-reviewed prose files; no schema or logic change. | unit | none | Already covered — the pre-strategy 105/105 run above IS the fail-first→pass proof (this exact test was the one red entry in entry 4's gate); no second test would add coverage. |
| The prose group's own edits, judged fresh (`c9867cb` `review-policy.md` DoD row/paragraph; `0819911` `asd-phase-design-review.md` step 7 section name; `fa744e7` `t_review.md` redundant table; `f3cc268` `t_test-plan.md` "(name, path)" wording) | None executable: verified each commit's diff directly (`git show --stat`) — all four touch only `.asd/rules/*.md` / `.asd/workflows/*.md` / `.asd/templates/*.md` prose, zero lines of Node. Same class as Entry 1's "other ~50 files" row: interpreted by a dispatched agent at runtime, no parser in `tests/run.js` reads rule/workflow/template prose and none is warranted. | n/a | none | No behaviour added that this repo's own test runner can observe; inventing a prose-content assertion would be coverage theatre (`code-style.md` §17). Cross-file mirror correctness for these four is `sync.js --check`'s and the `canon_hashes`/`upstream_hashes` integrity tests' job (already green, confirmed above), not a new test's. |
| APPROVE-latch invariant's "aggregation reads `verdicts` alone" consequence, re-checked against the cycle's FINAL landed wording (`sprint-lifecycle.md` "APPROVE latch" + "State recovery" lines 44-56, 268-272, all four workflow files) | Traced directly, fresh: `sprint-lifecycle.md`'s `verdicts["iter-NN"]` value-form enumeration (four forms: bare token, external's availability-skip, legacy `skipped:`, absent-key-always-blocking) and the latch-write/no-second-mechanism prose are internally consistent across `sprint-lifecycle.md`, `asd-phase-impl-review.md`, `asd-phase-design-review.md`, `asd-phase-pr.md` — grepped all four for `latched`/`verdicts\["iter` to confirm no drift. Still zero Node code in this repo implements or aggregates against this invariant (same conclusion as Entry 4's own row). | n/a | none | Reconfirms Entry 4's row rather than superseding it — the wording that landed after entry 4's dispatch (this cycle's finalize commit) added no executable surface, only ledger-hash bookkeeping. |
| `session-start.js`'s rolled-back `lastReviewVerdict` shape — fixture-completeness check (dispatch instruction: "confirm the hook's rolled-back shape is fully covered by the fixtures you have") | Traced against the current function (`.asd/hooks/session-start.js:102-118`): three branches exist beyond the pre-existing red/yellow/`n/a` guards — `approved` (bare `"green"`/`APPROVE`-prefixed, covers both bare `APPROVE` and the availability-skip form), `isSkipped` (legacy `skipped:` carve-out), and the `some(approved) && every(approved‖isSkipped)` combinator that requires at least one genuine approval before reading "green". All three existing SessionStart hook tests (`a "skipped: <predicate>" verdict counts as satisfied`, `an availability-skip "APPROVE (skipped: <reason>)" value counts as satisfied`, `an all-legacy-"skipped:" verdict map … reads "mixed"`) each drive a distinct one of these branches end-to-end against the real hook via a spawned subprocess. | n/a | none | Fixture coverage confirmed complete for the rolled-back shape — no branch of the current `lastReviewVerdict` lacks a driving fixture; adding a fourth would duplicate an existing check. |
| `D-2`'s ledger-drift class itself — hash-ledger drift after a canon prose edit is missing its `sync.js --apply <file>` housekeeping follow-up, three occurrences this sprint (D-1, D-2, and the dev-reported self-sourced `AGENTS.md` gap; `decisions-log.md` 2026-09-04 "carried to iter-03 reviewers") | Real as a recurring pattern, but not something a test authored today can close: the only thing that already catches every occurrence is the dedicated `canon_hashes`/`upstream_hashes` integrity tests (they caught both D-1 and D-2, and the pre-strategy 105/105 run above confirms D-2's instance is now clean). Closing the CLASS — e.g. making `sync.js --check`'s own exit code gate ledger drift, or giving `--apply` a recompute-only no-target mode — is a production-code change (`sync.js`'s CLI contract), which this agent has no authority to write regardless of the outcome. | n/a | none (design gap, not a test gap) | The existing check is already the cheapest reliable one and already proved itself twice; authoring a second copy of the same assertion would not close the recurring class, only duplicate coverage. Whether `sync.js`'s own gate should widen is a design decision already routed to the iter-03 reviewers (`decisions-log.md` 2026-09-04) — outside this agent's authority to resolve by writing a test against behaviour that does not exist yet. |

## Removed tests

**Entry 5**: None — every item this entry judged resolved to `none`; nothing proposed for removal.

**Entry 4**: None — the red-test fix (dispatch item 1) is an in-place assertion/name flip on an existing test, not a removal (see `Added tests` Entry 4).

**Entry 3**: None — no removal proposed this entry.

**Entry 1**: None. Grepped `tests/run.js` for all nine retired agent names (`asd-reviewer-quality`, `-implementation`, `-ui`, `-simplification`, `-performance`, `asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`, `asd-ux-designer`) — zero hits, so no test in the suite hardcodes anything about the old roster beyond the two count-based tests already covered above (fixed in place, not removed — the checks themselves still earn their keep). No out-of-scope removal is being proposed; the removal gate (workflow step 6) does not fire this entry.

**Entry 2**:

| Test | Reason | In change scope |
|---|---|---|
| `update.js migration runner: a migration script shipped in this same apply loads fresh, never a stale require-cache copy` | Hypothetical risk (testing #7): the only cache it poisoned was the test's own `require()` call, unreachable in a real single-`require`-per-process consumer run — fails `code-style.md` §17's hypothetical-risk criterion once judged against the sprint's own bar. Replaced by `update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran`, which targets the genuine engine-cache risk external review confirmed. | yes — same file, same dispatch (`impl-review/iter-01/testing.md` #1) |

## Added tests

Authored in the prune + author pass (step 7), all 13 planned tests plus the 3 test-defect fixes. Level and AC/risk covered are visible in each test's own name/comment per `code-style.md` §17. All new tests unit-level, all pass against the current implementation (`node tests/run.js` → 96/96, see Suite run).

| Test (as authored) | Regression proof |
|---|---|
| `sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)` | n/a — new capability, no prior defect |
| `sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives` | n/a — new capability, no prior defect |
| `sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted` | n/a — new capability, no prior defect |
| `sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)` | n/a — new capability (fail-open fix), no prior defect on this exact branch |
| `update.js migration runner (AC-12): pending migrations execute in ascending version order` | n/a — new capability, no prior defect |
| `update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run` | n/a — new capability, no prior defect |
| `update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target` | n/a — new capability, no prior defect |
| `update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target` | n/a — new capability, no prior defect |
| ~~`update.js migration runner: a migration script shipped in this same apply loads fresh, never a stale require-cache copy`~~ | Removed at entry 2 (hypothetical risk, `testing.md` #1) — see `Removed tests` / Entry 2's `Added tests` row for its replacement |
| `4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent; a missing target is success; re-running is a no-op` | n/a — new capability, no prior defect |
| `4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched` | n/a — new capability, no prior defect |
| `4.0.0 migration (AC-5): adds test_affected to commands.yaml additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules` | n/a — new capability, no prior defect |
| `4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase` | n/a — new capability, no prior defect |

None of the 13 correspond to a code-defect fix (all four `add` rows target already-implemented, never-tested production code — see `Risk → check decisions`), so `code-style.md` §17's fail-first proof requirement (which applies to regression tests proving a fix) does not apply; each was, however, run and read against the real production code above before being counted as passing (no vacuous assertions — each reads an observable return value or on-disk file state, never an implementation detail).

Plus, as **fixes to existing tests** (test-defect fixes, not new authoring — see `Risk → check decisions` above), done in the same pass — fail-first proof is the step-3 pre-strategy run recorded above (all 10 failed pre-fix, for the documented reason) versus the step-7/8 all-green run (Suite run below):
- `read-only agents (8 reviewers + asd-advisor)` → renamed to `read-only agents (5 reviewers + asd-advisor)`, hardcoded count `9` → `6`, message updated, banner comment (§9a) updated to name the actual 6-agent set.
- `README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count` → added `Twelve: 12` to `WORD_TO_NUMBER`.
- The 8 update-driver tests → added `await` to each `update.applyPlan(...)` call, declared the enclosing `test(...)` bodies `async`; the 10th (`... fails loud, never masked by the old engine`) additionally needed `assert.throws` → `await assert.rejects` since that call's throw happens after `applyPlan`'s first internal `await`, so it rejects the returned promise rather than throwing synchronously. Extended `tests/run.js`'s runner loop into an `async function runAll()` that `await`s each test body (sync bodies unaffected — `await`ing a non-Promise is a no-op); output shape (`ok -`/`FAIL -`, `N/M passed`, `process.exitCode`) unchanged.

### Entry 2 (impl-review iter-01 findings)

| Test (as authored) | Regression proof |
|---|---|
| `update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed` (testing #1) | n/a — new capability (wiring gap), no prior defect on this exact path |
| `4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op` (testing #2, extended in place) | n/a — new capability, no prior defect |
| `sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is` (testing #6) | n/a — new capability, no prior defect |
| `sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched` (testing #6, correctness #8) | n/a — new capability, no prior defect |
| `4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules` (testing #8, replaces prior unrealistic-fixture version) | n/a — new capability, no prior defect (the prior test's fixture never exercised the real branch — see `Risk → check decisions`) |
| `4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched` (testing #8) | n/a — new capability, no prior defect |
| `4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all` (testing #8) | n/a — new capability, no prior defect |
| `update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran` (testing #7 replacement) | **fail-first, proven**: temporarily reverted the fix (commented out `invalidateSyncCache(repoRoot)` in `update.js`'s `runMigrations` loop) and reran this test in isolation — failed with `AssertionError: migration must succeed against the freshly-written engine: {"version":"9.9.9","error":"sync.newHelper is not a function"}`, the exact shape of the real defect (a stale engine missing an export it should carry). Restored the fix (`git diff .asd/skills/asd-update/update.js` clean afterward) and reran — passes; full suite unaffected by the temporary revert/restore cycle. |
| `SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) still reads "green" - the legacy carve-out treats every "skipped: <predicate>" value identically to APPROVE` (test-defect fix, not one of the nine — discovered because the code changed under this entry) | Fail-first is the observed regression itself: this test failed (`100/101`) immediately after `impl`'s correctness-#7 fix landed (`lastReviewVerdict`'s legacy carve-out), because the fixture's expected behaviour was the OLD contract. Traced to the new, explicitly documented rule (not a code defect) and flipped; passes now. |

### Entry 3 (review-fix finalization confirmation pass)

| Test (as authored) | Regression proof |
|---|---|
| `sync.js orphan detection: --apply on a NESTED per-skill orphan (.agents/skills/<name>/SKILL.md) removes the now-emptied skill directory too, via sync.js's OWN removeIfEmptyDir call - not just the 4.0.0 migration's` | New capability coverage on already-correct production code, no prior defect — but verified fail-first by hand-mutation anyway (see `Risk → check decisions` above): commenting out `sync.js:1407`'s `removeIfEmptyDir(...)` call turned this test red (directory left behind) while the rest of the suite stayed green; restoring the line turned it green again. |

### Entry 4 (impl-review iter-02 review-fix)

| Test (as authored) | Regression proof |
|---|---|
| `update driver: planUpdate's pending-migration preview unions migrations from BOTH the pre-update local tree and the incoming upstream tree` (correctness #2) | **fail-first, proven**: temporarily reverted `planUpdate` to compute `pendingMigrationVersions` from `localMigrations` alone (the pre-fix shape) and reran — failed, `plan.pendingMigrationVersions` came back `['6.2.0']` only, missing the upstream-only `'6.1.0'`. Restored the union — passes. |
| `4.0.0 migration: falls back to a local removeIfEmptyDir when the consumer's sync.js predates the helper - delete still completes, directory still pruned` (correctness #3) | **fail-first, proven**: temporarily reverted `4.0.0.js`'s local fallback (called `sync.removeIfEmptyDir` unconditionally, no `typeof` guard) and reran against the stub engine — failed with `TypeError: sync.removeIfEmptyDir is not a function`, the exact shape of the real defect. Restored the fallback — passes. |
| `SessionStart hook: an availability-skip "APPROVE (skipped: <reason>)" value counts as satisfied - verdict map reads "green"` (testing #2) | n/a — new fixture coverage of already-correct, already-shipped code (the widening predates this entry); no prior defect on this exact fixture. |

Plus, as **fixes to existing tests** (test-defect fixes, not new authoring), done in the same pass:
- `sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is` (testing #1) — extended in place: writes an unmarked file alongside the marked one from the start, asserts `ok: true` and the `orphan-unmarked` item is present on the second invocation, instead of running that invocation against a zero-orphan repo. **Fail-first**: reverting the fixture back to its pre-fix shape (marked orphan simply deleted, no unmarked file ever written) still passes today's production code trivially — confirming the ORIGINAL test's own failure mode was coverage theatre (green for the wrong reason), not a code defect; the new fixture is what actually exercises the `orphan-unmarked` branch, verified by hand-toggling `sync.js`'s marker check to always report `orphan` (never `orphan-unmarked`) — turned this test red as expected, reverted, green again.
- `SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) reads "mixed", not "green"` (red-test decision, dispatch item 1) — renamed and flipped back to `mixed`, matching `session-start.js`'s rolled-back, current `satisfied` predicate (see `Risk → check decisions` Entry 4 above for the full decision). Fail-first is the observed regression itself: this test failed pre-fix (green-expecting assertion against code now requiring at least one genuine approval); passes now against the current, intentional contract.

### Entry 5

No tests added, modified, or removed — every item this entry judged (the D-2 ledger recompute, the prose-group edits, the latch-invariant final wording, `session-start.js`'s fixture-completeness check) resolved to `none` (see `Risk → check decisions` Entry 5 above for reasons). `code-style.md` §17's no-new-test decision rule applies to all five rows; none is regression-shaped, so no fail-first proof is owed.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, `sprint-lifecycle.md` "Impacted test set" — shared infrastructure, same as every prior entry)
- Result: **GREEN** — 105/105 passed (unchanged from entry 4's 105 total: entry 5 added zero tests; D-2's previously-failing test now passes, confirming its ledger-recompute fix)
- Lint / build: pass — `lint` (`git diff --check`) exit 0; `build` (`node .asd/sync.js --check`) `ok: true`, exit 0, all 62 items `current`
- HEAD: `d4489b7c7f939942be23ec00f96dca84c7357ab2`

**AC-15 no-test-decision evidence (testing #5)** — the `none` row (Entry 1, "the other ~50 files") leans on this grep; recording the command and its result so the substitute check has evidence, not just an assertion:

```
grep -rnE "asd-reviewer-quality|asd-reviewer-implementation|asd-reviewer-ui\b|asd-reviewer-simplification|asd-reviewer-performance|asd-backend-dev|asd-frontend-dev|asd-test-engineer|asd-ux-designer" .asd/rules .asd/workflows .asd/agents .asd/skills .asd/templates .claude/agents .codex/agents .agents/skills README.md AGENTS.md
```

Result: **clean, zero hits.** (Legitimate hits outside this scope, confirmed separately: `.asd/migrations/4.0.0.js`'s hardcoded retirement list, `tests/run.js` fixture names, this sprint's own record + archived sprint records, `plans/*.md`.)

### Impacted-set suite gate (step 8, entry 1)

- HEAD: `21d342022868d5a35b15a87a8418782713164eb0`

**`test` — `node tests/run.js`**

```
ok - canonical agent -> Claude .md matches fixture
ok - canonical agent -> Codex .toml matches fixture
ok - canonical skill -> Claude SKILL.md matches fixture
ok - canonical skill -> Codex SKILL.md matches fixture
ok - substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched
ok - agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively
ok - asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers
ok - agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)
ok - CRLF+BOM canonical input normalizes to the same output as LF/no-BOM
ok - full-file status: missing target
ok - full-file status: current after apply, then idempotent (zero byte diff) on re-check
ok - full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)
ok - full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)
ok - full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)
ok - full-file status: invalid JSON frontmatter fails closed before any write
ok - runApply: force overwrites a modified-foreign target only after explicit confirmation
ok - runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid
ok - buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale
ok - buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it
ok - buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced
ok - readSelfHostingField: config.yaml absent -> disabled
ok - readSelfHostingField: config.yaml exists but field absent -> disabled
ok - readSelfHostingField: self_hosting: disabled -> disabled
ok - readSelfHostingField: self_hosting: enabled -> enabled
ok - readSelfHostingField: malformed/unknown value fails closed to disabled
ok - readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)
ok - isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists
ok - managed-block: missing file -> apply creates it containing just the block
ok - managed-block: inserted into existing foreign content without touching it
ok - managed-block: stale when tracked block content no longer matches a fresh render
ok - managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break
ok - managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)
ok - managed-block: modified-foreign when block was hand-edited after last tracked write
ok - json-merge: missing file -> apply creates it with only the owned entries
ok - json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting
ok - json-merge: a leading BOM on the target file survives untouched
ok - json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting
ok - json-merge: missing key path is spliced in, not a whole-document reformat
ok - json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write
ok - json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws
ok - json-merge: stale when tracked owned entries differ from a fresh render
ok - json-merge: modified-foreign when owned-looking entries exist but sync-state has no record
ok - json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)
ok - isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths
ok - symlinked target is treated as foreign for full-file, managed-block and json-merge
ok - unknown release-manifest schema_version fails closed
ok - unknown sync-state schema_version fails closed
ok - this repo's own release-manifest.json and sync-state.json load cleanly
ok - update state machine: upstream unchanged / local untouched -> noop
ok - update state machine: new upstream file, not present locally -> add
ok - update state machine: local unchanged since last release, upstream changed -> update
ok - update state machine: local changed vs old release hash -> conflict (must not silently overwrite)
ok - update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign
ok - update state machine: upstream removed the file, local matches old release -> delete
ok - update state machine: upstream removed the file, local diverged -> keep-local-modified
ok - update state machine: unsafe manifest path is rejected regardless of hashes
ok - `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md
ok - read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only
ok - README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count
ok - release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file
ok - update driver: new upstream file with nothing local -> add, written on apply
ok - update driver: local unchanged since last release, upstream changed -> update overwrites
ok - update driver: local hand-edited vs old release hash -> conflict, never overwritten
ok - update driver: --force overwrites a conflict only when the caller explicitly names it
ok - update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign
ok - update driver: upstream removed the file, local untouched -> deleted on apply
ok - update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted
ok - update driver: --dry-run mode reports the full plan but writes nothing at all
ok - update driver: order of operations - every conflict is knowable from the plan before any write occurs
ok - update driver: unsafe managed_paths entry aborts the whole run before any write
ok - update driver: case-collision between managed paths is rejected fail-closed
ok - update driver: symlinked local target is treated as foreign, never overwritten
ok - update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes
ok - update driver: sync.js --check runs automatically after a real apply
ok - update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache
ok - update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine
ok - sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)
ok - sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives
ok - sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted
ok - sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)
ok - update.js migration runner (AC-12): pending migrations execute in ascending version order
ok - update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run
ok - update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target
ok - update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target
ok - update.js migration runner: a migration script shipped in this same apply loads fresh, never a stale require-cache copy
ok - 4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent; a missing target is success; re-running is a no-op
asd-migration 4.0.0: warning: left 1 unmarked file(s) untouched (not ASD-generated, likely a consumer's own agent/skill sharing a retired name): .claude/agents/asd-ux-designer.md
ok - 4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched
ok - 4.0.0 migration (AC-5): adds test_affected to commands.yaml additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules
asd-migration 4.0.0: warning: sprint "999-fixture" is mid-"impl-review" and may hold retired reviewer keys under state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that review iteration before relying on the APPROVE latch for this sprint.
ok - 4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase
ok - release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)
ok - release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)
ok - every .asd/templates/*.json file parses as valid JSON
ok - SessionStart hook: Claude gets /asd-* slash-command form
ok - SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command
ok - SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"
ok - SessionStart hook: an all-"skipped:" verdict map (no genuine approval) is "mixed", not "green"

96/96 passed
```

Exit code: `0`

**`lint` — `git diff --check`**

```
(no output)
```

Exit code: `0`

**`build` — `node .asd/sync.js --check`**

```json
{
  "ok": true,
  "items": [
    { "target": ".claude/agents/asd-advisor.md", "status": "current" },
    { "target": ".codex/agents/asd-advisor.toml", "status": "current" },
    { "target": ".claude/agents/asd-architect.md", "status": "current" },
    { "target": ".codex/agents/asd-architect.toml", "status": "current" },
    { "target": ".claude/agents/asd-ba.md", "status": "current" },
    { "target": ".codex/agents/asd-ba.toml", "status": "current" },
    { "target": ".claude/agents/asd-dev.md", "status": "current" },
    { "target": ".codex/agents/asd-dev.toml", "status": "current" },
    { "target": ".claude/agents/asd-external-review.md", "status": "current" },
    { "target": ".codex/agents/asd-external-review.toml", "status": "current" },
    { "target": ".claude/agents/asd-pm.md", "status": "current" },
    { "target": ".codex/agents/asd-pm.toml", "status": "current" },
    { "target": ".claude/agents/asd-reviewer-correctness.md", "status": "current" },
    { "target": ".codex/agents/asd-reviewer-correctness.toml", "status": "current" },
    { "target": ".claude/agents/asd-reviewer-documentation.md", "status": "current" },
    { "target": ".codex/agents/asd-reviewer-documentation.toml", "status": "current" },
    { "target": ".claude/agents/asd-reviewer-efficiency.md", "status": "current" },
    { "target": ".codex/agents/asd-reviewer-efficiency.toml", "status": "current" },
    { "target": ".claude/agents/asd-reviewer-testing.md", "status": "current" },
    { "target": ".codex/agents/asd-reviewer-testing.toml", "status": "current" },
    { "target": ".claude/agents/asd-tester.md", "status": "current" },
    { "target": ".codex/agents/asd-tester.toml", "status": "current" },
    { "target": ".claude/agents/asd-ux.md", "status": "current" },
    { "target": ".codex/agents/asd-ux.toml", "status": "current" },
    { "target": ".claude/skills/asd-concept/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-concept/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-design-system/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-design-system/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-init/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-init/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-audit/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-audit/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-design/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-design/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-design-promote/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-design-promote/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-design-review/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-design-review/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-impl/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-impl/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-impl-review/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-impl-review/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-impl-test/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-impl-test/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-plan/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-plan/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-pr/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-pr/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-phase-scope/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-phase-scope/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-sprint/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-sprint/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-stack/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-stack/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-sync/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-sync/SKILL.md", "status": "current" },
    { "target": ".claude/skills/asd-update/SKILL.md", "status": "current" },
    { "target": ".agents/skills/asd-update/SKILL.md", "status": "current" },
    { "target": ".claude/hooks/session-start.js", "status": "current" },
    { "target": ".codex/hooks/session-start.js", "status": "current" },
    { "target": "CLAUDE.md", "status": "current" },
    { "target": "AGENTS.md", "status": "current" },
    { "target": ".claude/settings.json", "status": "current" },
    { "target": ".codex/hooks.json", "status": "current" }
  ]
}
```

Exit code: `0`

**Gate verdict: GREEN.** `test` 96/96 passed (exit 0), `lint` clean (exit 0), `build` all 62 items `current` (exit 0). No failures, no code defects surfaced — triage (step 9) has nothing to act on this entry.

### Impacted-set suite gate (step 8, entry 2)

- HEAD: `42c00fe65114be2d30aa13d9241b9df24f7962b0`

**`test` — `node tests/run.js`** (101 tests: 96 from entry 1 − 1 removed (testing #7) + 6 added (testing #1, #2 in place, #6 ×2, #8 ×2) — see `Added tests`/`Removed tests` above)

```
ok - canonical agent -> Claude .md matches fixture
ok - canonical agent -> Codex .toml matches fixture
ok - canonical skill -> Claude SKILL.md matches fixture
ok - canonical skill -> Codex SKILL.md matches fixture
ok - substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched
ok - agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively
ok - asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers
ok - agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)
ok - CRLF+BOM canonical input normalizes to the same output as LF/no-BOM
ok - full-file status: missing target
ok - full-file status: current after apply, then idempotent (zero byte diff) on re-check
ok - full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)
ok - full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)
ok - full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)
ok - full-file status: invalid JSON frontmatter fails closed before any write
ok - runApply: force overwrites a modified-foreign target only after explicit confirmation
ok - runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid
ok - buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale
ok - buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it
ok - buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced
ok - readSelfHostingField: config.yaml absent -> disabled
ok - readSelfHostingField: config.yaml exists but field absent -> disabled
ok - readSelfHostingField: self_hosting: disabled -> disabled
ok - readSelfHostingField: self_hosting: enabled -> enabled
ok - readSelfHostingField: malformed/unknown value fails closed to disabled
ok - readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)
ok - isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists
ok - managed-block: missing file -> apply creates it containing just the block
ok - managed-block: inserted into existing foreign content without touching it
ok - managed-block: stale when tracked block content no longer matches a fresh render
ok - managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break
ok - managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)
ok - managed-block: modified-foreign when block was hand-edited after last tracked write
ok - json-merge: missing file -> apply creates it with only the owned entries
ok - json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting
ok - json-merge: a leading BOM on the target file survives untouched
ok - json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting
ok - json-merge: missing key path is spliced in, not a whole-document reformat
ok - json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write
ok - json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws
ok - json-merge: stale when tracked owned entries differ from a fresh render
ok - json-merge: modified-foreign when owned-looking entries exist but sync-state has no record
ok - json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)
ok - isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths
ok - symlinked target is treated as foreign for full-file, managed-block and json-merge
ok - unknown release-manifest schema_version fails closed
ok - unknown sync-state schema_version fails closed
ok - this repo's own release-manifest.json and sync-state.json load cleanly
ok - update state machine: upstream unchanged / local untouched -> noop
ok - update state machine: new upstream file, not present locally -> add
ok - update state machine: local unchanged since last release, upstream changed -> update
ok - update state machine: local changed vs old release hash -> conflict (must not silently overwrite)
ok - update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign
ok - update state machine: upstream removed the file, local matches old release -> delete
ok - update state machine: upstream removed the file, local diverged -> keep-local-modified
ok - update state machine: unsafe manifest path is rejected regardless of hashes
FAIL - `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md
   AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
   + actual - expected

   + [
   +   {
   +     status: 'modified-foreign',
   +     target: 'AGENTS.md'
   +   }
   + ]
   - []

       at Object.fn (D:\Projects\agentic-software-development\tests\run.js:993:10)
       at runAll (D:\Projects\agentic-software-development\tests\run.js:1984:15)
ok - read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only
ok - README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count
ok - release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file
ok - update driver: new upstream file with nothing local -> add, written on apply
ok - update driver: local unchanged since last release, upstream changed -> update overwrites
ok - update driver: local hand-edited vs old release hash -> conflict, never overwritten
ok - update driver: --force overwrites a conflict only when the caller explicitly names it
ok - update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign
ok - update driver: upstream removed the file, local untouched -> deleted on apply
ok - update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted
ok - update driver: --dry-run mode reports the full plan but writes nothing at all
ok - update driver: order of operations - every conflict is knowable from the plan before any write occurs
ok - update driver: unsafe managed_paths entry aborts the whole run before any write
ok - update driver: case-collision between managed paths is rejected fail-closed
ok - update driver: symlinked local target is treated as foreign, never overwritten
ok - update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes
ok - update driver: sync.js --check runs automatically after a real apply
ok - update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache
ok - update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine
ok - update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed
ok - sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)
ok - sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives
ok - sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted
ok - sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)
ok - sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is
ok - sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched
ok - update.js migration runner (AC-12): pending migrations execute in ascending version order
ok - update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run
ok - update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target
ok - update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target
ok - update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran
ok - 4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op
asd-migration 4.0.0: warning: left 1 unmarked file(s) untouched (not ASD-generated, likely a consumer's own agent/skill sharing a retired name): .claude/agents/asd-ux-designer.md
ok - 4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched
ok - 4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules
ok - 4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched
ok - 4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all
asd-migration 4.0.0: warning: sprint "999-fixture" is mid-"impl-review" and may hold retired reviewer keys under state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that review iteration before relying on the APPROVE latch for this sprint.
ok - 4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase
ok - release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)
ok - release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)
ok - every .asd/templates/*.json file parses as valid JSON
ok - SessionStart hook: Claude gets /asd-* slash-command form
ok - SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command
ok - SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"
ok - SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) still reads "green" - the legacy carve-out treats every "skipped: <predicate>" value identically to APPROVE

100/101 passed
```

Exit code: `1`

**`lint` — `git diff --check`**

```
(no output)
```

Exit code: `0`

**`build` — `node .asd/sync.js --check`**

Same 62 items as entry 1's record above, `ok: true`, with exactly one status change:

```json
{ "target": "AGENTS.md", "status": "modified-foreign" }
```

Exit code: `0` (`--check`'s exit code gates only marker-owned orphans, not `modified-foreign` drift — see D-1)

**Gate verdict: RED.** `test` 100/101 (1 failed, filed as D-1), `lint` clean (exit 0), `build` `ok: true` (exit 0, but see D-1 for the drift its own coarser exit code misses). D-1 is unrelated to entry 2's nine testing findings — it is a repo-state drift (a self-sourced `AGENTS.md` hand-edit whose `sync.js --apply AGENTS.md` follow-up was not yet run) surfaced independently by re-running the impacted set. Routes to `impl`.

### Impacted-set suite gate (step 8, entry 3)

- HEAD: `62f0d266a05da22d6ad4967bf24503c9c77c4470`

**`test` — `node tests/run.js`** (102 tests: 101 from entry 2 + 1 added at entry 3 — see `Added tests` Entry 3)

```
ok - canonical agent -> Claude .md matches fixture
ok - canonical agent -> Codex .toml matches fixture
ok - canonical skill -> Claude SKILL.md matches fixture
ok - canonical skill -> Codex SKILL.md matches fixture
ok - substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched
ok - agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively
ok - asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers
ok - agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)
ok - CRLF+BOM canonical input normalizes to the same output as LF/no-BOM
ok - full-file status: missing target
ok - full-file status: current after apply, then idempotent (zero byte diff) on re-check
ok - full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)
ok - full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)
ok - full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)
ok - full-file status: invalid JSON frontmatter fails closed before any write
ok - runApply: force overwrites a modified-foreign target only after explicit confirmation
ok - runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid
ok - buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale
ok - buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it
ok - buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced
ok - readSelfHostingField: config.yaml absent -> disabled
ok - readSelfHostingField: config.yaml exists but field absent -> disabled
ok - readSelfHostingField: self_hosting: disabled -> disabled
ok - readSelfHostingField: self_hosting: enabled -> enabled
ok - readSelfHostingField: malformed/unknown value fails closed to disabled
ok - readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)
ok - isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists
ok - managed-block: missing file -> apply creates it containing just the block
ok - managed-block: inserted into existing foreign content without touching it
ok - managed-block: stale when tracked block content no longer matches a fresh render
ok - managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break
ok - managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)
ok - managed-block: modified-foreign when block was hand-edited after last tracked write
ok - json-merge: missing file -> apply creates it with only the owned entries
ok - json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting
ok - json-merge: a leading BOM on the target file survives untouched
ok - json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting
ok - json-merge: missing key path is spliced in, not a whole-document reformat
ok - json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write
ok - json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws
ok - json-merge: stale when tracked owned entries differ from a fresh render
ok - json-merge: modified-foreign when owned-looking entries exist but sync-state has no record
ok - json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)
ok - isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths
ok - symlinked target is treated as foreign for full-file, managed-block and json-merge
ok - unknown release-manifest schema_version fails closed
ok - unknown sync-state schema_version fails closed
ok - this repo's own release-manifest.json and sync-state.json load cleanly
ok - update state machine: upstream unchanged / local untouched -> noop
ok - update state machine: new upstream file, not present locally -> add
ok - update state machine: local unchanged since last release, upstream changed -> update
ok - update state machine: local changed vs old release hash -> conflict (must not silently overwrite)
ok - update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign
ok - update state machine: upstream removed the file, local matches old release -> delete
ok - update state machine: upstream removed the file, local diverged -> keep-local-modified
ok - update state machine: unsafe manifest path is rejected regardless of hashes
ok - `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md
ok - read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only
ok - README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count
ok - release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file
ok - update driver: new upstream file with nothing local -> add, written on apply
ok - update driver: local unchanged since last release, upstream changed -> update overwrites
ok - update driver: local hand-edited vs old release hash -> conflict, never overwritten
ok - update driver: --force overwrites a conflict only when the caller explicitly names it
ok - update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign
ok - update driver: upstream removed the file, local untouched -> deleted on apply
ok - update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted
ok - update driver: --dry-run mode reports the full plan but writes nothing at all
ok - update driver: order of operations - every conflict is knowable from the plan before any write occurs
ok - update driver: unsafe managed_paths entry aborts the whole run before any write
ok - update driver: case-collision between managed paths is rejected fail-closed
ok - update driver: symlinked local target is treated as foreign, never overwritten
ok - update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes
ok - update driver: sync.js --check runs automatically after a real apply
ok - update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache
ok - update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine
ok - update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed
ok - sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)
ok - sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives
ok - sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted
ok - sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)
ok - sync.js orphan detection: --apply on a NESTED per-skill orphan (.agents/skills/<name>/SKILL.md) removes the now-emptied skill directory too, via sync.js's OWN removeIfEmptyDir call - not just the 4.0.0 migration's
ok - sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is
ok - sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched
ok - update.js migration runner (AC-12): pending migrations execute in ascending version order
ok - update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run
ok - update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target
ok - update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target
ok - update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran
ok - 4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op
asd-migration 4.0.0: warning: left 1 unmarked file(s) untouched (not ASD-generated, likely a consumer's own agent/skill sharing a retired name): .claude/agents/asd-ux-designer.md
ok - 4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched
ok - 4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules
ok - 4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched
ok - 4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all
asd-migration 4.0.0: warning: sprint "999-fixture" is mid-"impl-review" and may hold retired reviewer keys under state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that review iteration before relying on the APPROVE latch for this sprint.
ok - 4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase
ok - release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)
ok - release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)
ok - every .asd/templates/*.json file parses as valid JSON
ok - SessionStart hook: Claude gets /asd-* slash-command form
ok - SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command
ok - SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"
ok - SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) still reads "green" - the legacy carve-out treats every "skipped: <predicate>" value identically to APPROVE

102/102 passed
```

Exit code: `0`

**`lint` — `git diff --check`**

```
(no output)
```

Exit code: `0`

**`build` — `node .asd/sync.js --check`**

Same 62 items as entry 1/entry 2's record above, all `status: "current"` (`AGENTS.md` included — D-1's drift confirmed fixed), `ok: true`.

Exit code: `0`

**Gate verdict: GREEN.** `test` 102/102 passed (exit 0), `lint` clean (exit 0), `build` all 62 items `current` (exit 0). D-1 confirmed fixed. No new failures, no code defects surfaced — triage (step 9) has nothing to act on this entry.

### Impacted-set suite gate (step 8, entry 4)

- HEAD: `f3cc26861509a821adc1832ac24635b7b35508bb`

**`test` — `node tests/run.js`** (105 tests: 102 from entry 3 + 3 added at entry 4 — see `Added tests` Entry 4)

```
ok - canonical agent -> Claude .md matches fixture
ok - canonical agent -> Codex .toml matches fixture
ok - canonical skill -> Claude SKILL.md matches fixture
ok - canonical skill -> Codex SKILL.md matches fixture
ok - substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched
ok - agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively
ok - asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers
ok - agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)
ok - CRLF+BOM canonical input normalizes to the same output as LF/no-BOM
ok - full-file status: missing target
ok - full-file status: current after apply, then idempotent (zero byte diff) on re-check
ok - full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)
ok - full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)
ok - full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)
ok - full-file status: invalid JSON frontmatter fails closed before any write
ok - runApply: force overwrites a modified-foreign target only after explicit confirmation
ok - runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid
ok - buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale
ok - buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it
ok - buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced
ok - readSelfHostingField: config.yaml absent -> disabled
ok - readSelfHostingField: config.yaml exists but field absent -> disabled
ok - readSelfHostingField: self_hosting: disabled -> disabled
ok - readSelfHostingField: self_hosting: enabled -> enabled
ok - readSelfHostingField: malformed/unknown value fails closed to disabled
ok - readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)
ok - isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists
ok - managed-block: missing file -> apply creates it containing just the block
ok - managed-block: inserted into existing foreign content without touching it
ok - managed-block: stale when tracked block content no longer matches a fresh render
ok - managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break
ok - managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)
ok - managed-block: modified-foreign when block was hand-edited after last tracked write
ok - json-merge: missing file -> apply creates it with only the owned entries
ok - json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting
ok - json-merge: a leading BOM on the target file survives untouched
ok - json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting
ok - json-merge: missing key path is spliced in, not a whole-document reformat
ok - json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write
ok - json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws
ok - json-merge: stale when tracked owned entries differ from a fresh render
ok - json-merge: modified-foreign when owned-looking entries exist but sync-state has no record
ok - json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)
ok - isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths
ok - symlinked target is treated as foreign for full-file, managed-block and json-merge
ok - unknown release-manifest schema_version fails closed
ok - unknown sync-state schema_version fails closed
ok - this repo's own release-manifest.json and sync-state.json load cleanly
ok - update state machine: upstream unchanged / local untouched -> noop
ok - update state machine: new upstream file, not present locally -> add
ok - update state machine: local unchanged since last release, upstream changed -> update
ok - update state machine: local changed vs old release hash -> conflict (must not silently overwrite)
ok - update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign
ok - update state machine: upstream removed the file, local matches old release -> delete
ok - update state machine: upstream removed the file, local diverged -> keep-local-modified
ok - update state machine: unsafe manifest path is rejected regardless of hashes
ok - `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md
ok - read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only
ok - README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count
ok - release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file
ok - update driver: new upstream file with nothing local -> add, written on apply
ok - update driver: local unchanged since last release, upstream changed -> update overwrites
ok - update driver: local hand-edited vs old release hash -> conflict, never overwritten
ok - update driver: --force overwrites a conflict only when the caller explicitly names it
ok - update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign
ok - update driver: upstream removed the file, local untouched -> deleted on apply
ok - update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted
ok - update driver: --dry-run mode reports the full plan but writes nothing at all
ok - update driver: order of operations - every conflict is knowable from the plan before any write occurs
ok - update driver: unsafe managed_paths entry aborts the whole run before any write
ok - update driver: case-collision between managed paths is rejected fail-closed
ok - update driver: symlinked local target is treated as foreign, never overwritten
ok - update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes
ok - update driver: sync.js --check runs automatically after a real apply
ok - update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache
ok - update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine
ok - update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed
ok - update driver: planUpdate's pending-migration preview unions migrations from BOTH the pre-update local tree and the incoming upstream tree
ok - sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)
ok - sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives
ok - sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted
ok - sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)
ok - sync.js orphan detection: --apply on a NESTED per-skill orphan (.agents/skills/<name>/SKILL.md) removes the now-emptied skill directory too, via sync.js's OWN removeIfEmptyDir call - not just the 4.0.0 migration's
ok - sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is
ok - sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched
ok - update.js migration runner (AC-12): pending migrations execute in ascending version order
ok - update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run
ok - update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target
ok - update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target
ok - update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran
ok - 4.0.0 migration: falls back to a local removeIfEmptyDir when the consumer's sync.js predates the helper - delete still completes, directory still pruned
ok - 4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op
asd-migration 4.0.0: warning: left 1 unmarked file(s) untouched (not ASD-generated, likely a consumer's own agent/skill sharing a retired name): .claude/agents/asd-ux-designer.md
ok - 4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched
ok - 4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules
ok - 4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched
ok - 4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all
asd-migration 4.0.0: warning: sprint "999-fixture" is mid-"impl-review" and may hold retired reviewer keys under state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that review iteration before relying on the APPROVE latch for this sprint.
ok - 4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase
ok - release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)
FAIL - release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)
   AssertionError [ERR_ASSERTION]: upstream_hashes entries out of date (recompute after editing): .asd/rules/review-policy.md, .asd/templates/t_review.md, .asd/templates/t_test-plan.md, .asd/workflows/asd-phase-design-review.md
   + actual - expected

   + [
   +   '.asd/rules/review-policy.md',
   +   '.asd/templates/t_review.md',
   +   '.asd/templates/t_test-plan.md',
   +   '.asd/workflows/asd-phase-design-review.md'
   + ]
   - []

       at Object.fn (D:\Projects\agentic-software-development\tests\run.js:1939:10)
       at runAll (D:\Projects\agentic-software-development\tests\run.js:2086:15)
ok - every .asd/templates/*.json file parses as valid JSON
ok - SessionStart hook: Claude gets /asd-* slash-command form
ok - SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command
ok - SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"
ok - SessionStart hook: an availability-skip "APPROVE (skipped: <reason>)" value counts as satisfied - verdict map reads "green"
ok - SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) reads "mixed", not "green"

104/105 passed
```

Exit code: `1`

**`lint` — `git diff --check`**

```
(no output)
```

Exit code: `0`

**`build` — `node .asd/sync.js --check`**

Same 62 items as entry 1/2/3's record, all `status: "current"` (`--check` gates only marker-owned orphans, never `upstream_hashes` ledger drift — same coarser-exit-code class as D-1), `ok: true`.

Exit code: `0`

**Gate verdict: RED.** `test` 104/105 (1 failed, filed as D-2), `lint` clean (exit 0), `build` `ok: true` (exit 0, but see D-2 — its own coarser exit code misses this class of drift too). D-2 is unrelated to entry 4's own test authoring — a repo-state drift left behind by the OTHER iter-2 fix groups (correctness #4/#5, efficiency #3 edits to `review-policy.md`/`t_review.md`/`t_test-plan.md`/`asd-phase-design-review.md`) whose `node .asd/sync.js --apply <file...>` housekeeping follow-up was never run. `.asd/release-manifest.json` is outside this agent's write scope (`.asd/` write access limited to `test-plan.md`/`stubs.md`/`manual-steps.md`) — routes to `impl` for a dev to run `sync-apply` and recompute the ledger.

### Impacted-set suite gate (step 8, entry 5)

- HEAD: `d4489b7c7f939942be23ec00f96dca84c7357ab2`

**`test` — `node tests/run.js`** (105 tests, unchanged from entry 4's total — entry 5 added none)

```
ok - canonical agent -> Claude .md matches fixture
ok - canonical agent -> Codex .toml matches fixture
ok - canonical skill -> Claude SKILL.md matches fixture
ok - canonical skill -> Codex SKILL.md matches fixture
ok - substitutePlaceholders: known key substituted, unknown/typo placeholders left untouched
ok - agent-claude / agent-codex transforms resolve {{wraps_cli}}/{{wraps_config_key}} from claude{}/codex{} respectively
ok - asd-external-review: the wrapped CLI subprocess carries an explicit read-only flag on both providers
ok - agents whose meta never sets wraps_cli/wraps_config_key are unaffected (substitution is a no-op)
ok - CRLF+BOM canonical input normalizes to the same output as LF/no-BOM
ok - full-file status: missing target
ok - full-file status: current after apply, then idempotent (zero byte diff) on re-check
ok - full-file status: stale when an UNTAMPERED body just needs re-render (canon changed)
ok - full-file status: modified-foreign when body no longer matches ITS OWN marker digest (tampered)
ok - full-file status: modified-foreign when target has no ownership marker (conflict, refuse to overwrite)
ok - full-file status: invalid JSON frontmatter fails closed before any write
ok - runApply: force overwrites a modified-foreign target only after explicit confirmation
ok - runApply: preflight aborts the WHOLE batch before any write when one canon source is invalid
ok - buildSyncPlan: CLAUDE.md tracks t_CLAUDE.md - editing the template makes it stale
ok - buildSyncPlan: an INITIALIZED CONSUMER project generates AGENTS.md from t_AGENTS.md, and tracks edits to it
ok - buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md stays self-sourced
ok - readSelfHostingField: config.yaml absent -> disabled
ok - readSelfHostingField: config.yaml exists but field absent -> disabled
ok - readSelfHostingField: self_hosting: disabled -> disabled
ok - readSelfHostingField: self_hosting: enabled -> enabled
ok - readSelfHostingField: malformed/unknown value fails closed to disabled
ok - readSelfHostingField: duplicated top-level key is ambiguous, fails closed to disabled (never "first" or "last" wins)
ok - isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists
ok - managed-block: missing file -> apply creates it containing just the block
ok - managed-block: inserted into existing foreign content without touching it
ok - managed-block: stale when tracked block content no longer matches a fresh render
ok - managed-block: CRLF around a pre-existing block does not corrupt the boundary or double the line break
ok - managed-block: modified-foreign when block exists but sync-state has no record (refuse to overwrite)
ok - managed-block: modified-foreign when block was hand-edited after last tracked write
ok - json-merge: missing file -> apply creates it with only the owned entries
ok - json-merge: unrelated keys are preserved BYTE-FOR-BYTE, including unusual formatting
ok - json-merge: a leading BOM on the target file survives untouched
ok - json-merge: EACH foreign array element keeps its own exact bytes, even with unusual internal formatting
ok - json-merge: missing key path is spliced in, not a whole-document reformat
ok - json-merge: invalid pre-existing JSON with --force still aborts the WHOLE runApply batch before any write
ok - json-merge: statusJsonMerge stays safe (modified-foreign) on invalid JSON even though renderJsonMerge throws
ok - json-merge: stale when tracked owned entries differ from a fresh render
ok - json-merge: modified-foreign when owned-looking entries exist but sync-state has no record
ok - json-merge: invalid JSON target fails closed (treated as foreign, never parsed/written)
ok - isSafeRelPath rejects traversal, absolute, drive, and UNC paths; accepts plain relative paths
ok - symlinked target is treated as foreign for full-file, managed-block and json-merge
ok - unknown release-manifest schema_version fails closed
ok - unknown sync-state schema_version fails closed
ok - this repo's own release-manifest.json and sync-state.json load cleanly
ok - update state machine: upstream unchanged / local untouched -> noop
ok - update state machine: new upstream file, not present locally -> add
ok - update state machine: local unchanged since last release, upstream changed -> update
ok - update state machine: local changed vs old release hash -> conflict (must not silently overwrite)
ok - update state machine: new upstream path lands on pre-existing untracked local file -> conflict-foreign
ok - update state machine: upstream removed the file, local matches old release -> delete
ok - update state machine: upstream removed the file, local diverged -> keep-local-modified
ok - update state machine: unsafe manifest path is rejected regardless of hashes
ok - `node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md
ok - read-only agents (5 reviewers + asd-advisor): no Write/Edit tool, codex sandbox_mode read-only
ok - README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count
ok - release-manifest.json canon_hashes has an entry for every .asd/agents/*.md file
ok - update driver: new upstream file with nothing local -> add, written on apply
ok - update driver: local unchanged since last release, upstream changed -> update overwrites
ok - update driver: local hand-edited vs old release hash -> conflict, never overwritten
ok - update driver: --force overwrites a conflict only when the caller explicitly names it
ok - update driver: new upstream path lands on a pre-existing untracked local file -> conflict-foreign
ok - update driver: upstream removed the file, local untouched -> deleted on apply
ok - update driver: upstream removed the file, local diverged -> kept + reported, nothing deleted
ok - update driver: --dry-run mode reports the full plan but writes nothing at all
ok - update driver: order of operations - every conflict is knowable from the plan before any write occurs
ok - update driver: unsafe managed_paths entry aborts the whole run before any write
ok - update driver: case-collision between managed paths is rejected fail-closed
ok - update driver: symlinked local target is treated as foreign, never overwritten
ok - update driver: unknown schema_version in fetched upstream manifest fails closed, zero writes
ok - update driver: sync.js --check runs automatically after a real apply
ok - update driver: post-apply check loads the FRESHLY WRITTEN sync.js, never a stale require() cache
ok - update driver: a genuinely BROKEN freshly-written sync.js fails loud, never masked by the old engine
ok - update driver: applyPlan writes the manifest at the LAST SUCCESSFUL migration version, never the unreached target, and names which migration failed
ok - update driver: planUpdate's pending-migration preview unions migrations from BOTH the pre-update local tree and the incoming upstream tree
ok - sync.js orphan detection (AC-14): --check reports a marked orphan as "orphan" (fails) and an unmarked one as "orphan-unmarked" (informational, never a failure)
ok - sync.js orphan detection: --apply deletes an explicitly-requested marked orphan but refuses an unmarked one, unmarked file survives
ok - sync.js orphan detection: a symlinked orphan target fails closed - treated as unmarked, never deleted
ok - sync.js runApply (fail-open fix, decisions-log 2026-09-04): a target matching no plan entry and no orphan reports not-found, aborts the WHOLE batch (no partial write)
ok - sync.js orphan detection: --apply on a NESTED per-skill orphan (.agents/skills/<name>/SKILL.md) removes the now-emptied skill directory too, via sync.js's OWN removeIfEmptyDir call - not just the 4.0.0 migration's
ok - sync.js CLI: --check exits 1 when a marked orphan is present, 0 when only an unmarked one is
ok - sync.js CLI: --apply on a not-found target aborts the whole batch (exit 1) and skips the hash-ledger recompute - manifest and sync-state.json stay byte-for-byte untouched
ok - update.js migration runner (AC-12): pending migrations execute in ascending version order
ok - update.js migration runner (AC-12): a migration at or below the consumer's current version is skipped, never run
ok - update.js migration runner (AC-12): stop-on-first-failure pins reachedVersion at the last success, not the target
ok - update.js migration runner (AC-12): no pending migrations advances reachedVersion straight to the target
ok - update.js applyPlan (regression): a migration requiring .asd/sync.js from ctx.repoRoot sees the JUST-WRITTEN engine, never a require.cache copy poisoned before this same apply ran
ok - 4.0.0 migration: falls back to a local removeIfEmptyDir when the consumer's sync.js predates the helper - delete still completes, directory still pruned
ok - 4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent, including the per-skill directory once emptied; a missing target is success; a surviving non-retired sibling is untouched; re-running is a no-op
asd-migration 4.0.0: warning: left 1 unmarked file(s) untouched (not ASD-generated, likely a consumer's own agent/skill sharing a retired name): .claude/agents/asd-ux-designer.md
ok - 4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched
ok - 4.0.0 migration (AC-5): adds test_affected to a realistic commands.yaml (commented placeholder line present) additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules
ok - 4.0.0 migration: commands.yaml test_affected -> "undetectable" when no supported test runner is present, file left byte-for-byte untouched
ok - 4.0.0 migration: commands.yaml test_affected -> "missing" status when the file does not exist at all
asd-migration 4.0.0: warning: sprint "999-fixture" is mid-"impl-review" and may hold retired reviewer keys under state.json.reviews.*.verdicts (agent roster changed in ASD 4.0.0) - finish or re-run that review iteration before relying on the APPROVE latch for this sprint.
ok - 4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase
ok - release-manifest.json: every canon_hashes entry matches the actual file (relative to .asd/)
ok - release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)
ok - every .asd/templates/*.json file parses as valid JSON
ok - SessionStart hook: Claude gets /asd-* slash-command form
ok - SessionStart hook: Codex gets $asd-* form, never a Claude-only slash command
ok - SessionStart hook: a "skipped: <predicate>" verdict counts as satisfied, not "mixed"
ok - SessionStart hook: an availability-skip "APPROVE (skipped: <reason>)" value counts as satisfied - verdict map reads "green"
ok - SessionStart hook: an all-legacy-"skipped:" verdict map (no bare APPROVE anywhere) reads "mixed", not "green"

105/105 passed
```

Exit code: `0`

**`lint` — `git diff --check`**

```
(no output)
```

Exit code: `0`

**`build` — `node .asd/sync.js --check`**

Same 62 items as entry 1/2/3/4's record, all `status: "current"`, `ok: true`.

Exit code: `0`

**Gate verdict: GREEN.** `test` 105/105 passed (exit 0) — D-2's previously-failing `upstream_hashes` integrity test now passes, confirming the ledger recompute. `lint` clean (exit 0), `build` all 62 items `current` (exit 0). No new failures, no code defects surfaced — triage (step 9) has nothing to act on this entry.

## Defects

None filed against entry 1 (all 10 pre-strategy failures triaged as test defects — see `Risk → check decisions`).

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| D-1 | `AGENTS.md` (self-sourced managed-block target, `.asd/sync-state.json`'s tracked digest for it) | `sync.js --check` reports `AGENTS.md` as `modified-foreign` — a self-sourced hand-edit to `AGENTS.md` (content is correct, verified by reading the file) whose required `sync.js --apply AGENTS.md` follow-up (`AGENTS.md`'s own "Hard rules": run `sync.js --apply` after editing canon) was never run, so `sync-state.json`'s tracked digest is stale. Not one of the nine testing findings; not a logic bug in test or production code — a one-line missed housekeeping step from earlier in this same review-fix cycle. `sync.js --check`'s own CLI exit code stays green regardless (it gates only marker-owned orphans), so only this dedicated repo-integrity unit test catches the drift. | "`node .asd/sync.js --check` reports every item current (no drift), including AGENTS.md" | fixed | `c8e0756` |
| D-2 | `.asd/release-manifest.json`'s `upstream_hashes` ledger (four entries: `.asd/rules/review-policy.md`, `.asd/templates/t_review.md`, `.asd/templates/t_test-plan.md`, `.asd/workflows/asd-phase-design-review.md`) | The dedicated `upstream_hashes` integrity test reports all four entries stale — the four files were edited by the OTHER iter-2 review-fix groups (correctness #4/#5, efficiency #3) but the required `node .asd/sync.js --apply <file...>` housekeeping follow-up (`AGENTS.md` "Hard rules": run `sync.js --apply` after editing canon) was never run afterward, so the ledger recompute never happened. Same defect class and same root cause as D-1, on a different ledger and different files. Confirmed by direct trace: this repo's own `sync.js --check` stays `ok: true`/exit 0 regardless (its exit code gates only marker-owned orphans, never `upstream_hashes`/`canon_hashes` ledger drift) — only this dedicated `tests/run.js` assertion catches it. Not a logic bug in test or production code; `.asd/release-manifest.json` is outside this agent's write scope, so the recompute (`sync-apply`) must be run by a dev. | "release-manifest.json: every upstream_hashes entry matches the actual file (relative to repo root)" | fixed (ledger recompute), confirmed green at entry 5's pre-strategy run (105/105) | `7d21dd5` |

## Manual verification (optional)

Only where automation is impossible, or — per this entry's decision on testing #4/correctness #12 — where automation is currently blocked by a fact outside this dispatch's scope (the `pr`-phase version bump), not by the visual/UX-feel criterion this section normally gates on:

| AC | Steps | Expected observation |
|---|---|---|
| AC-12, AC-13 | At the `pr` phase, after `asd-phase-pr.md` bumps `.asd/release-manifest.json`'s `asd_version` to the release's SemVer-inferred target: verify `max(version for every .asd/migrations/*.js file) <= release-manifest.json`'s new `asd_version` (concretely, at this release, `4.0.0 <= asd_version`). | `asd_version` is `>= 4.0.0`, so `pendingMigrations`' `<= newVersion` bound includes `4.0.0.js` for every consumer running `asd-update` after this release — the migration is not silently excluded. Once observed true, add the corresponding `tests/run.js` unit assertion (`max(.asd/migrations/*.js version) <= manifest.asd_version`, `testing.md` #4 / `correctness.md` #12) in the next `impl-test` entry that touches this file — it would be red before the bump lands, so it is deferred rather than landed now. |
