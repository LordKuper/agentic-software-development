---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 033-retro-intake-model-choice

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 |  | full change surface |

## Risk → check decisions

Runner: `tests/run.js` is the one runner (Node sources and content contracts), so the impacted set is the whole runner; behaviour risks get a fixture-driven runtime or migration test, rule-prose risks a content pin only where a token cannot be reworded.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `routeTask` tier `escalated`, `effortRaised`/`raiseEffort`, reserved classes (AC-3, AC-4) | ladder edge: effort step before climb, cap at the top, priorTier clamp, mistyped reserved class routing cheap | unit | add | One table-style test over every edge; five existing routing pins re-pointed at the new result shape (`raiseEffort`, `effort-step`) |
| `VARIANT_SUFFIXES`, `asd-dev-escalated`, `asd-tester-runner`, `asd-scout`, wrapper haiku/high (AC-1, AC-2, AC-5, AC-8) | wrong family/effort rendered, Codex column changed, scout gaining a write tool | contract | add | Tier test reads the rendered sync plan; existing README-tier, suffix, web-grant, creator and Codex-render pins re-pointed at the new roster |
| scout dispatch rows in audit, plan, cleanup (AC-5) | a workflow naming the scout without a Dispatch row, or a fourth phase using it | contract | add | One pin over the Dispatch JSON; cleanup's existing inline-only pin re-pointed |
| `emit-manifest` whole-file deletion and `--rename-map` collapse, `review-waves` remainder (AC-35, AC-24) | reviewer reads a wrong or empty diff; wave count over- or under-counts | component (real git repo) | add | Real range over a deleted file, a pure and a mixed substitution file; lines and bytes asserted against the emitted diff |
| `persist-review --floor` (AC-25) | wrong rows dropped, an all-dropped CONCERNS stays a verdict, internal reviewer floored | component | add | Floor edges, skip form, refusals; the file written is what later readers parse |
| design-review UI predicate for `design/mockups/**` (AC-34) | mockup drafts reviewed without UI conformance | component | add | Real `emit-manifest` over a mockup path at two depths and three near-miss paths |
| `positiveInteger` leading zeros (AC-9) | `--iteration 02` refused | component | add | Through the external scope manifest the workflow actually writes; `0`, `00` stay refused |
| `commit-check`, one-command commit form, templated header limit (AC-12, AC-21) | an over-long header or a memory hit committed; a sibling's staged hit blocking the agent | component | add | CLI run in a sandbox repo; the existing literal-form test now runs the compound command as written and gains the over-50 case; one pin that every templated header fits the longest phase |
| `impl-test-close` (AC-27) | wrong row filled, log line lost, partial write on bad input | component | add | Real HEAD in a sandbox repo; each refusal asserted to write neither file |
| `timingAppend` continuation, cascade, repeat close, `timingSummary` idle gaps (AC-18, AC-26) | double close, orphaned child, wrong continuation start, idle stretch mis-measured | unit | add | Ledger-text fixtures; the old handover fixture re-pointed (its open child now cascades) |
| `design-tokens` generator (AC-32) | wrong rows or variables, touching bytes outside the two regions, unsupported YAML read silently | component | add | Byte-exact output for LF and CRLF, idempotence, six unsupported constructs naming the line, marker and empty-front-matter failures with nothing written |
| migration `14.5.0.js` (AC-19, AC-33) | live agent memory deleted, customised `designmd-install` overwritten, non-idempotent | component | add | Names derived from the earlier migrations' own constants and the canonical agents; survivors, unrelated memory, re-run, three untouched value shapes, missing agents dir |
| README tiers, session-model guidance and haiku alias note (AC-6, AC-8) | README states a tier canon does not render | contract | keep + add | Existing tier/roster/count pins re-pointed; one pin for the alias variable and the session-model paragraph |
| leftover terms: old rotate subject, `duplicate of <test>`, one-suffix variant sentence, wrapper-applied floor, severity-driven iron-rule FAIL | a surviving statement of a removed rule, agent memory included | contract | add | Leftover sweep reaching canon, README, runtime, sync, hooks and every agent-memory file; one memory hit found (see report); README wrapper-floor wording pinned separately, red against D-4 |
| review-policy FAIL boundary, minor test-only path, impl-review/impl/scope/design workflow prose, rule-doc homes (AC-10, AC-11, AC-13, AC-14, AC-15, AC-16, AC-17, AC-20, AC-23, AC-28, AC-30, AC-31, AC-34, AC-36) | behaviour of orchestrator and reviewers following new prose | none | none | No parsed token or contract another file reads is introduced beyond the ones pinned above; the surviving pins (sprint-010 AC-10 iron-rule consequence, sprint-020 AC-6, sprint-027 scope dispatch, sprint-028 cleanup, workflow/agent form sweeps) already run over these files, and impl-review's quality reviewer judges the prose |
| AC-7 dispositions F1-F12 | missing line | none | none | A sprint artifact (`audit.md` "Gaps"), present and checked by the orchestrator, not code |
| AC-26 handoff user-wait, AC-21 cleanup mirror, AC-36 settings change | prose in workflows | none | none | Same reason as the prose row; `asd-phase-*` form and tool-grant sweeps cover the files |
| sprint-026 AC-16 load ceiling | token budget exceeded by the sprint's additions | contract | keep | Unchanged pin, red: see D-3 |

## Removed tests

None. Every existing test either still covers a live contract or was re-pointed at the changed one; none is redundant with a surviving test.

| Test | Reason | In change scope |
|---|---|---|
| — | — | — |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Proof for a behaviour test of new code is a targeted mutation of the runtime or canon line (restored in the same command), the control a reword that must stay green.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-033 AC-3/AC-4: route-task sends migration… | mutation climb capped at no tier (`Math.min(baseRank + 1, 2)` → `baseRank`): `node tests/run.js --filter "sprint-033 AC-3/AC-4"` → exit 1, that test (1 matched); mutation escalated list drops `cross domain` → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-1/AC-2/AC-3/AC-8: runner variant renders… | mutation scout model haiku → sonnet in `asd-scout.md`: `--filter "sprint-033 AC-1/AC-2"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-033 AC-5: audit step 2, plan step 4 and cleanup step 4… | mutation plan Dispatch row agent `asd-scout` → `asd-scoutx`: `--filter "sprint-033 AC-5"` → exit 1, that test (2 matched); control reword of the row's `when` text → exit 0; runs: 1 |
| tests/run.js: sprint-033 AC-9: positiveInteger accepts a zero-padded integer… | mutation `/^0*[1-9]\d*$/` → `/^[1-9]\d*$/`: `--filter "sprint-033 AC-9"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-033 AC-34: a design-review manifest lifts the UI conformance entry… | mutation drops the `design/mockups/` alternative: `--filter "sprint-033 AC-34"` → exit 1, that test (1 matched); control equivalent non-capturing regex → exit 0; runs: 1 |
| tests/run.js: sprint-033 AC-35, AC-24: emit-manifest collapses a whole-file deletion… | mutation skips the deleted-file branch: `--filter "sprint-033 AC-35, AC-24"` → exit 1, that test (1 matched); mutation discount `2 * total` → `total` → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-25: persist-review --floor drops each external finding… | mutation keeps the CONCERNS verdict when every row dropped: `--filter "sprint-033 AC-25"` → exit 1, that test (2 matched); mutation lets an internal reviewer take `--floor` → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-12/AC-21: commit-check passes a header… | mutation header check → `true`: `--filter "sprint-033 AC-12/AC-21"` → exit 1, that test (1 matched); mutation drops the named-path filter → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-27: impl-test-close fills the Entry log HEAD analysed… | mutation accepts two rows for one entry: `--filter "sprint-033 AC-27"` → exit 1, that test (1 matched); mutation drops the newline guard → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-32: design-tokens rewrites only the two marked regions… (and the failure test) | mutation never turns a reference into `var()`: `--filter "sprint-033 AC-32"` → exit 1, both tests (2 matched); mutation drops the duplicate-key check → exit 1, failure test; control rewording the unsupported-YAML message → exit 0; runs: 3 |
| tests/run.js: sprint-033 AC-19/AC-33: the 14.5.0 migration deletes… | mutation deletes every retired name without the live filter: `--filter "sprint-033 AC-19/AC-33"` → exit 1, that test (1 matched); mutation rewrites to `--save` → exit 1, same test; runs: 2 |
| tests/run.js: sprint-033 AC-18 (issues #100, #108, #111): a close of an open op cascades… | mutation drops child cascade: `--filter "sprint-033 AC-18"` → exit 1, that test (1 matched); mutation never continues a recovered close → exit 1, same test; mutation never skips a repeat close → exit 1, same test; runs: 3 |
| tests/run.js: sprint-033 AC-26 (issue #101): timingSummary lists as idle… | mutation doubles the idle limit: `--filter "sprint-033 AC-26"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-033 AC-12: every commit header the canon templates… | mutation `rotate log for <phase>` → `rotate the decisions log for <phase>` in the asd-sprint skill: `--filter "sprint-033 AC-12"` → exit 1, that test (2 matched); control reword `when it prints` → exit 0; runs: 1 |
| tests/run.js: sprint-033 AC-6: README names the orchestrator session-model… | mutation env var renamed in README: `--filter "sprint-033 AC-6"` → exit 1, that test (1 matched); control reword in the session paragraph → exit 0; runs: 1 |
| tests/run.js: sprint-033 leftover-term check… | mutation restores the old rotate subject in the asd-sprint skill: `--filter "sprint-033 leftover-term"` → exit 1, that test (1 matched), hit `asd-sprint/SKILL.md:61`; mutation restores `duplicate of <test>` in `t_test-plan.md` → exit 1, hit `t_test-plan.md:39`; red today on the agent-memory hit (below); runs: 2 |
| tests/run.js: sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor… | fail-first vs D-4: `node tests/run.js --filter "sprint-033 AC-25"` → exit 1, that test; control dropping `, applies severity floor` from the README row → exit 0; runs: 1 |
| tests/run.js: sprint-019 AC-8 (re-pointed to the new compound form, adds the over-50 case) | mutation removes the `commit-check` step from the form: `--filter "sprint-019 AC-8"` → exit 1, that test (1 matched); control reword `exits 1 on` → exit 0; runs: 1 |
| tests/run.js: re-pointed pins — AC-10 routing set, sprint-010 AC-10, sprint-020 AC-6, sprint-022 AC-8, sprint-025 AC-1/AC-4, sprint-027 AC-3/AC-4/AC-5 and AC-7, sprint-028 AC-2/AC-4, agent-count | mutation restores the superseded text: sprint-010 AC-10 `Violation = \`FAIL\` from` → exit 1 (control `Cut on sight` reword → exit 0); sprint-020 AC-6 adds "the default" for `standard` → exit 1; sprint-022 AC-8 drops the `escalated` variant → exit 1 (control reword of the standard-variant sentence → exit 0); sprint-027 AC-3 `asd-init (skill)` → exit 1; sprint-027 AC-7 `effortRaised` renamed in providers.md → exit 1; sprint-028 AC-2 scout row renamed → exit 1; AC-10 routing drops `raiseEffort` → exit 1; agent count `Eight` → `Seven` → exit 1; runs: 8 |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (the one runner holds every impacted test; the shared-infrastructure valve would give the same set)
- Result: fail — 356 passed, 5 failed, 0 skipped of 361; every failure is one of D-1..D-4 or the memory hit reported with this entry
- Lint / build: build pass (`node .asd/sync.js --check`, 66 targets current); lint runs at commit (`git diff --cached --check` passed for the test commit)
- HEAD: 4b9d3eb0

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/workflows/asd-phase-impl-test.md` step 9). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: sprint-018 AC-3: asd-scout must render web_search = "disabled" - Codex parity with its canonical Claude web grant, variants inheriting the base key | AC-3/6/7: every canonical Codex agent renders a supported delegate config | pending |  |
| D-2 | 1 | .asd/agents/asd-scout.md | AssertionError [ERR_ASSERTION]: AC-2: asd-scout keeps WebFetch in disallowedTools | sprint-018 AC-1/AC-2/AC-4/AC-8/AC-9: no agent grants AskUserQuestion, web access is granted whole or withheld whole with every grant scoped by policy, and every shell is bounded with commit holders matching git-strategy.md | pending |  |
| D-3 | 1 | .asd/rules/providers.md | AssertionError [ERR_ASSERTION]: orchestrator/impl: 148496 B is 0.7211 of 205926 B, ceiling 0.7 | sprint-026 AC-16 (D13): per-dispatch load of dev (impl), tester (impl-test), combined reviewer (impl-review) and the orchestrator (impl) is at most 0.70 of its main baseline | pending |  |
| D-4 | 1 | README.md | AssertionError [ERR_ASSERTION]: AC-25: persist-review --floor applies the floor, but the README roster row of asd-external-review still says the wrapper does | sprint-033 AC-25: README no longer says the External Review wrapper applies the severity floor - persist-review does, so its roster row names no wrapper-applied floor | pending |  |
