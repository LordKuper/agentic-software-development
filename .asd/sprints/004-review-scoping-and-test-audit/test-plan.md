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
| 1 | *(unfilled — written at step 10, after prune/author commit + suite recording)* | full change surface |

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

## Removed tests

None. Grepped `tests/run.js` for all nine retired agent names (`asd-reviewer-quality`, `-implementation`, `-ui`, `-simplification`, `-performance`, `asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`, `asd-ux-designer`) — zero hits, so no test in the suite hardcodes anything about the old roster beyond the two count-based tests already covered above (fixed in place, not removed — the checks themselves still earn their keep). No out-of-scope removal is being proposed; the removal gate (workflow step 6) does not fire this entry.

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
| `update.js migration runner: a migration script shipped in this same apply loads fresh, never a stale require-cache copy` | n/a — new capability, no prior defect |
| `4.0.0 migration (AC-7/AC-10/AC-11): deletes marked generated views of a retired agent; a missing target is success; re-running is a no-op` | n/a — new capability, no prior defect |
| `4.0.0 migration: leaves an unmarked (consumer-owned) file sharing a retired agent name untouched` | n/a — new capability, no prior defect |
| `4.0.0 migration (AC-5): adds test_affected to commands.yaml additively when a supported test runner is detected; never touches config.yaml/sprints/custom rules` | n/a — new capability, no prior defect |
| `4.0.0 migration: reports (never rewrites) an active sprint sitting in a review phase` | n/a — new capability, no prior defect |

None of the 13 correspond to a code-defect fix (all four `add` rows target already-implemented, never-tested production code — see `Risk → check decisions`), so `code-style.md` §17's fail-first proof requirement (which applies to regression tests proving a fix) does not apply; each was, however, run and read against the real production code above before being counted as passing (no vacuous assertions — each reads an observable return value or on-disk file state, never an implementation detail).

Plus, as **fixes to existing tests** (test-defect fixes, not new authoring — see `Risk → check decisions` above), done in the same pass — fail-first proof is the step-3 pre-strategy run recorded above (all 10 failed pre-fix, for the documented reason) versus the step-7/8 all-green run (Suite run below):
- `read-only agents (8 reviewers + asd-advisor)` → renamed to `read-only agents (5 reviewers + asd-advisor)`, hardcoded count `9` → `6`, message updated, banner comment (§9a) updated to name the actual 6-agent set.
- `README.md / AGENTS.md agent-count claims match the actual .asd/agents/*.md file count` → added `Twelve: 12` to `WORD_TO_NUMBER`.
- The 8 update-driver tests → added `await` to each `update.applyPlan(...)` call, declared the enclosing `test(...)` bodies `async`; the 10th (`... fails loud, never masked by the old engine`) additionally needed `assert.throws` → `await assert.rejects` since that call's throw happens after `applyPlan`'s first internal `await`, so it rejects the returned promise rather than throwing synchronously. Extended `tests/run.js`'s runner loop into an `async function runAll()` that `await`s each test body (sync bodies unaffected — `await`ing a non-Promise is a no-op); output shape (`ok -`/`FAIL -`, `N/M passed`, `process.exitCode`) unchanged.

## Suite run

- Command: `node tests/run.js`
- Result: **96/96 passed** (73 pre-existing + 10 fixed test-defects + 13 newly authored). Zero failures.
- Also run per `commands.yaml` this pass (not the step-8 gate, informational): `lint` (`git diff --check`) — clean, exit 0. `build` (`node .asd/sync.js --check`) — `ok: true`, 0 non-`current` items, exit 0.
- The formal impacted-set suite gate (workflow step 8, full suite per the safety valve above) is a separate dispatch; this run is evidence that the prune + author pass left the suite green, not that gate's own record.

## Defects

None filed. All 10 pre-strategy failures triaged as test defects (see `Risk → check decisions`), not code defects — nothing routes back to `impl` this entry.

## Manual verification (optional)

None. This change surface has no visual UI, third-party live integration, or UX-feel risk — it is framework rule/workflow prose, agent frontmatter, and zero-dependency Node scripts, all covered by automated checks (this file's `Added tests` plus the existing `sync.js --check` / AC-15 grep verification steps).
