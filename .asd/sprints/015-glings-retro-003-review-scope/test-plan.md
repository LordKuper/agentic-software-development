---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 015-glings-retro-003-review-scope

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `isTest` | a test file is not classified as one (Testing never receives it), or a name that only contains "test" is (Testing reviews code it does not own) | unit | add | every path-segment and basename convention the plan names, positive and negative, `test-plan.md` included as a non-test |
| `runtime.js` `reviewerFiles` + `--test-plan` | Testing loses its test-plan paths, or another reviewer gets narrowed | unit + CLI | add | selector called directly for every reviewer/phase; CLI proves emit-manifest builds Testing's list through it |
| `runtime.js` `INTERNAL_REVIEWERS` | list drifts from the reviewer agents, and the union guard and `dispatches` then count the wrong roster | static | add | derived from the `asd-reviewer-*` agent set |
| `runtime.js` `assertReviewerUnion` | a scope file lands in nobody's list | none | none | unreachable while Correctness receives the whole scope. Deleting the guard (M5) keeps every test green, a recorded limitation. Narrowing every reviewer (M8) shows the guard fires on existing CLI emits: `scope files in no internal reviewer's list`. The reviewerFiles unit test already pins that non-Testing reviewers get the whole scope, which is what makes the guard unreachable |
| `emit-manifest --base/--head` pure-rename grant | the compact row is granted to an edited rename, a mode-changing rename or a plain edit | CLI in a temp git repo | add | real `git mv` fixture with one pure, one edited and one `+x` rename |
| `validate-ledger` on the pure-rename row | a reviewer asserts the row on a file the runtime did not prove | unit on the emitted manifest | add | accepts it on the proven file only and rejects it on every other scope file |
| `.diff` per manifest/part | patch misses a listed file, shows a rename as an add, includes the appended test-plan path, or diffs the whole range for an empty list | CLI in a temp git repo | add | `diff --git` headers compared per manifest and per `--halve` part |
| `--base/--head` outside impl-review | a design-review emit accepts a range | CLI | add | exit 2 before any file is written |
| review workflows' emit-manifest flags | a workflow passes a flag the CLI never reads (`--test-plan`, `--base`) and it is dropped silently | static | add | every flag on both workflows' emit line has to be one `runtime.js` reads |
| `surfaceCheck.dispatches` | the override request states fewer dispatches than impl-review actually runs | unit against real emitted parts | add | compared against `emitCoverageManifests` parts for every internal reviewer, with Testing's `--test-plan` path as the workflow passes it. **Red, D-1** |
| sprint-014 AC-5 surface-check test | pinned the old `{files,cap,breach}` shape | unit + CLI | keep (adjusted) | expected objects now carry `dispatches`; its value is asserted by the AC-11 test, not restated here |
| sprint-012 emit-manifest CLI test | used reviewer `testing` over non-test files, which Testing now filters out | CLI | keep (adjusted) | switched to `correctness`, the reviewer that still receives the full scope, which restores the test's intent (part naming, digests, ledger read) |
| `dispatchWaves` | waves split wrongly | none | none | nothing calls it: no CLI subcommand, and no canon cites it (only `DISPATCH_CEILING`). A test would pin unreachable code. Waves are orchestrator prose (`sprint-lifecycle.md` "Dispatch ceiling"), and the citer sweep pins the constant it cites. Flagged to impl-review as a possible dead export |
| `DISPATCH_CEILING`, `AUDIT_BATCH_THRESHOLD_FILES`, `reviewerFiles` citations | canon restates a number or selector instead of citing the symbol, and the two drift | static | add | three asserts added to the existing sprint-012 citer sweep |
| constant values 20 / 200, architect `maxTurns` 150 | — | none | none | a literal-equals-literal assert restates the AC with no failure mode. Citation is covered above |
| `core.md` Context hygiene (AC-1) | a clear instruction returns anywhere in canon/README; the preserve list, gate-answer-to-disk rule or State recovery path is deleted | static | add | sweep over every canon markdown file plus README/AGENTS; preserve-list items asserted |
| `core.md` "Request user decision", asd-sprint, scope step 1 (AC-7) | free-form scope goes back through a decision prompt | static | add | clause-level assert, proven reword-safe (C6) |
| design-promote step 4 + BA/UX config (AC-6) | the git operation route is deleted, or BA/UX gain a shell | static | add | route asserted on step 4, reword-safe (C8). Bound to the `claude.tools`/`disallowedTools` config, not to prose |
| per-sprint document skip (AC-8) | the gate drops off the hard list or out of the inventory; the log literal drifts between sprint-lifecycle and the scope workflow | static | add | same pattern as sprint-014's cap-override gate check |
| scope cleanup criteria (AC-10) | the question is deleted | static | add | the three criteria asserted on step 2 |
| CHANGELOG / asd_version (AC-12) | a version bump ships without its changelog heading | static | add | newest `## v` heading = `release-manifest.json` `asd_version` |
| review-policy "Reviewer responsibility" (AC-3) | a reviewer has no row or a phase cell is empty; the Testing cell stops naming the selector | static | add | rows derived from the reviewer agent set plus External Review |
| reviewer agents' Inputs (AC-4) | a shell-less reviewer is told to run git, or loses its `.diff` | static | add | every `asd-reviewer-*` Inputs section |
| AC-3 agent descriptions and "Does NOT handle" wording agree with the table | reviewers' ownership prose drifts | none | none | this is a judgement about the semantic agreement of free-text concern lists, with no shared literal to compare. Owned by impl-review Documentation/Correctness |
| AC-9 batched-read plan content | the plan is ineffective | none | none | agent-runtime judgement; the threshold citation is pinned above |
| AC-13 README and doc economy | — | none | none | owned by the impl-review Documentation reviewer. Existing README mirror tests stay green |

## Removed tests

None. Neither adjusted test was trivial or a duplicate. Each still pins behaviour nothing else asserts.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-015 AC-2/AC-3 reviewerFiles/isTest/table/Inputs/workflow flags | mutation M2 (drop `.concat(testPlan)` in `reviewerFiles`): `node tests/run.js` → exit 1, `impl-review Testing receives the scope test files in scope order, then the --test-plan paths the scope pathspec excludes`. M4b (`Tests?` → `Xyzzy?` in `isTest`) → exit 1, `each path-segment and basename convention the plan names must classify as a test file, or Testing never receives it`. M8 (every reviewer narrowed) → exit 1, `design-review correctness: every reviewer but impl-review Testing receives the whole scope, never the test-plan paths`. C3 (efficiency Inputs → "run `git diff`") → exit 1, `AC-4: asd-reviewer-efficiency has no shell, so its Inputs must read the manifest's .diff and never a git command or a diff payload`. C5 (runtime stops reading `flags['test-plan']`) → exit 1, `.asd/workflows/asd-phase-impl-review.md: every emit-manifest flag the workflow passes must be one the CLI reads - …` |
| `tests/run.js`: sprint-015 AC-4/AC-5 emit-manifest --base/--head | M1 (drop `&& srcMode === dstMode` in `rangeRenames`) → exit 1, `AC-5: only the identical-content, identical-mode rename is behaviour-neutral by proof - …`. M3 (unpair the rename source in `patchPaths`) → exit 1, `AC-4: the patch covers every listed file, each rename paired with its source so the reviewer sees a rename, not an add`. M6 (drop the impl-review-only check) → exit 1, `design-review has no git range, so --base/--head must exit 2 before writing anything. Got: null`. M7 (diff even an empty path list) → exit 1, `an empty list still gets its .diff, empty, so the payload path always resolves`. M2 also fails it at `AC-2: the CLI builds Testing's list through reviewerFiles, test-plan path appended` |
| `tests/run.js`: sprint-015 AC-11 surface-check dispatches | fail-first against D-1 at HEAD 082cd31: `node tests/run.js` → exit 1, `bound 25: a scope of 25 test files emits 5 internal-review parts plus External Review, above the 5 dispatches the cap-override request tells the user to approve`. Red until D-1 is fixed |
| `tests/run.js`: sprint-015 AC-1/AC-6/AC-7/AC-8/AC-10/AC-12 canon contracts | C1 (add "Prefer clear over compaction" to core.md) → exit 1, `AC-1: context compaction is automatic and host-driven - no canon or README line may tell anyone to clear the session`. C2 (drop the skip from the checkpoints hard list) → exit 1, `AC-8: the per-sprint document skip is hard in both modes and in the inventory - …`. C4 (drop the free-form clause) → exit 1, `AC-7: "Request user decision" must never be used for free-form input`. Reword-safety: C6 (core.md clause reworded, "never" after "free-form") and C8 (design-promote step 4 reworded) → no failure in this test. The first draft of the AC-7 assert failed C6 and was loosened to clause level |
| `tests/run.js`: sprint-012 AC-3/AC-12 citer sweep, three new citations | C7 (audit workflow says "200 files" instead of the symbol) → exit 1, `sprint-015 AC-2/AC-9/AC-11: .asd/workflows/asd-phase-audit.md must cite \`AUDIT_BATCH_THRESHOLD_FILES\` by its runtime symbol rather than restate the value or selector it holds` |

Every mutation ran as mutate → suite → restore inside one script, with a byte compare after each restore. Each canon or runtime mutation also fails `release-manifest.json: every upstream_hashes entry matches the actual file` (ledger noise). C3 additionally fails the `canon_hashes` and `sync.js --check` tests. While D-1 is open, every run also fails the AC-11 test. Neither is counted as a proof above.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: `.asd/runtime.js` and rule docs are framework-wide infrastructure)
- Result: fail — 210/211 passed, 1 failed (`sprint-015 AC-11: …`, D-1), 0 skipped. Pre-strategy run at the same HEAD: 205/207, with the two pinned tests failing (both adjusted above)
- Lint / build: lint (`git diff --cached --check`) pass. Build (`node .asd/sync.js --check`) pass: exit 0, `ok: true`, 72/72 items `current`
- HEAD: 082cd31 (tests uncommitted at run time; the commit adds only `tests/run.js` and this file)

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/runtime.js | AssertionError [ERR_ASSERTION]: bound 25: a scope of 25 test files emits 5 internal-review parts plus External Review, above the 5 dispatches the cap-override request tells the user to approve | sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies - every internal reviewer's emitted parts, Testing's --test-plan path included, plus External Review - and the override request quotes that field | pending |  |
