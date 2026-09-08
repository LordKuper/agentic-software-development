---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 009-retro-008-remediation

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 5e7451b | full change surface (`git diff main...HEAD`, self-hosting exclusions applied: 17 canonical files + `.gitattributes`, minus `.asd/project/**`, `.asd/sprints/**` and generated views) |

## Risk → check decisions

Acceptance-criteria source is `sprint.md` `AC-1`..`AC-18` (`documents.prd` disabled). `AC-9` was closed at
the audit gate with no deliverable and has no change surface; `AC-17` is this file plus the suite gate.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `LEDGER_VOCABULARY` + `rowsById` (AC-5) | published vocabulary and enforced vocabulary drift apart — a reviewer reads statuses off its manifest that the validator then rejects, and the ledger gate becomes unpassable for a correctly-behaving reviewer | unit | add | executable behaviour with a real failure mode; the constant is exported, so the coupling can be proven directly rather than inferred from two literal lists agreeing today |
| `.asd/runtime.js` `coverageManifestDigest` + `manifest-digest --write` (AC-5) | stamping the new field moves the manifest identity (invalidating ledgers already returned against the pre-stamp digest), or the new validation rejects every manifest written before this sprint | unit + CLI contract | add | `backward_compat` is a live constraint here — the tolerance branch (`manifest.vocabulary !== undefined`) is the only thing standing between this change and every existing fixture |
| `.asd/rules/artifact-layout.md` "Agent memory" + its three citers (AC-13a) | a mode-specific restatement grows back and the two copies disagree — the exact condition Task 5 collapsed | static (rewrite of the existing check) | add | the check already existed but asserted a **copy count**, which Task 5 invalidated by design; rewritten to owner-plus-citations so it tracks the property instead of the count |
| `.asd/rules/git-strategy.md` + `.asd/agents/asd-dev.md` + `.asd/workflows/asd-phase-impl.md` (AC-1, AC-2) | the prohibition is restated somewhere and the copies diverge; or the rule lands without the tool grant that makes it followable, which is the "correction that lands only in a rule" failure this sprint exists to fix | static | add | three-site coupling (rule ↔ agent grant ↔ workflow citation); each site is a literal token a regex derives |
| `.asd/rules/review-policy.md` correlated interruption / late duplicate return / verify before applying (AC-4, AC-14, AC-11) | a branch is dropped or reworded into its opposite — a late APPROVE displacing a recorded FAIL is a shipped-false-claim path, and a lost correlated-interruption branch re-arms the split trigger per reviewer | static | add | the directional halves ("never the reverse", "raises no reviewer's attempt count") are what make the branches safe; asserted as tokens, not whole sentences |
| `.asd/rules/external-review.md` "Outcome contract" + agent Don'ts + `review-policy.md` hand-off (AC-8) | the hand-off narrows back to the unavailability path only, leaving the empty return undisposed on both sides — `F-8` itself | static | add | includes the **negative** assertion on the old scoping line, which is the half a positive-only check would miss |
| `.asd/rules/code-style.md` §19 + `.asd/project/commands.yaml` `lint` (AC-6) | the rule requires the staged lint form while this repo's own configured command stays the blind one | static | add | `.asd/project/**` is outside every review surface, so no reviewer sees that config edit — this assertion is its only automated check |
| `.gitattributes` (AC-7) | a CRLF blob enters the index; invisible in a worktree that shows CRLF for every file anyway | static + index probe (`git ls-files --eol`) | add | the declaration alone is a tautology; the index probe is the check with a real failure mode, and it is the committed form of the `F-7` damage |
| `.asd/rules/sprint-lifecycle.md` scope re-verification + Reachability grammar, `asd-phase-scope.md`, `t_plan.md` (AC-3, AC-12) | the obligation lives only in a rule the acting phase never reads; or the template teaches `Reachability` as per-task mandatory, colliding with `Material risk`'s fail-closed absence semantics | static | add | the template is where a plan author actually reads whether the line is conditional — asserted by block shape, not by counting lines |
| `.asd/rules/checkpoints.md` "Criterion cost surfacing" (AC-15) | the literal `impl fix for iter-NN: findings resolved` that the unit counts is reworded on the emitting side; the count then silently reads zero and nothing fails | static (cross-file literal coupling) | add | the audit rated AC-15 weak, but the *derivation source* half is a hard literal coupling between `checkpoints.md` and `asd-phase-impl.md:112` — the strongest thing here and the one that rots silently |
| `.asd/workflows/asd-phase-impl.md` fix-mode graph (AC-10) | the removed wording is reverted, or the narrowing accidentally serializes the initial dispatch step too (`:64` is shared with initial mode) | static | add | asserted as an absence on the fix-modes bullet plus a presence on the dispatch line, so both directions of the mistake fail |
| `.asd/agents/asd-dev.md`, `asd-external-review.md` → 8 generated provider views (AC-18) | a canonical agent edit lands without its `sync.js --apply`, leaving a stale view | — | none | already gated: `node .asd/sync.js --check` is `build` in `commands.yaml`, runs on every phase gate and in CI (`.github/workflows/sync-check.yml`). A suite assertion would duplicate it exactly |
| `.asd/release-manifest.json` `canon_hashes`/`upstream_hashes` updates (AC-16) | a recorded hash goes stale against its file | — | none | covered by the existing `release-manifest.json: every upstream_hashes entry matches the actual file` test — it fired on every mutation run below, which is direct evidence it is live |
| `README.md`, `core.md` "See also", phase chain, template variables (AC-16) | a mirror goes stale | — | none | **no change surface**: this sprint touched none of the mirrored facts (no phase, agent, model tier, config key or folder-map change), so `README.md` is absent from the diff. The existing §16 phase-chain and §9b roster tests remain the standing guard |
| `.claude/agent-memory/asd-dev-critical/**` | a memory index entry points at a file that does not exist, or the memory contradicts the frontmatter it cites | — | none | the existing `asd-dev-critical/MEMORY.md` index-link test already covers the only machine-checkable property here and still passes; the remainder is agent guidance prose with no token another file must agree with |
| AC-9 (cross-sprint external-review availability record) | — | — | none | closed at the audit gate with no deliverable; there is nothing in the change surface to check |
| Reachability ↔ `route-task` equivalence (assertion proposed by impl) | a plan task carrying a `Reachability` line routes differently from one carrying only `Material risk` | — | none | **premise checked and false** (`review-policy.md` "Verify before applying"): `runtime.js` `routeTask` takes a structured input object and contains no plan-file parser at all — the `Material risk` extraction is the orchestrator's, not the runtime's. A test passing the same `risks` array twice would assert only that a pure function is deterministic. The real claim — that the orchestrator never feeds `Reachability` to `route-task` — is stated in `sprint-lifecycle.md:308` and is covered as prose there; it has no executable surface to bind to. Reported here rather than transcribed |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/run.js` — `T-2: \`.claude/agent-memory/**\` is stated as NOT excluded …` (`assert.strictEqual(totalMatches, 4)`) | implementation-coupled — it asserted how many copies of a statement existed rather than the property itself, so the deliberate collapse to one owner (Task 5) turned it red by design | yes — **rewritten in place, not removed**; see `AC-13a` in Added tests. Coverage is strictly wider afterwards (it now also checks the owner's sole-ownership claim and that each named citer really cites back) |

No other test met a removal criterion (`code-style.md` §17). Nothing trivial, duplicate,
mock-confirming, implementation-coupled or flaky was found among the impacted set. No out-of-scope
deletion was proposed, so the removal gate did not fire.

## Added tests

All in `tests/run.js` (this repo's only runner). New trailing section **§20**, except the two marked
in place — the file's section numbering has pre-existing collisions, so nothing was renumbered.
Every proof below is a targeted mutation of production/canon source, run against the whole suite and
restored byte-for-byte; the assertion named is the one that fired **first** in that test's body.
Mutating a `managed_paths` file additionally fails `release-manifest.json: every upstream_hashes
entry matches the actual file` — that co-failure is an artefact of the mutation, not a second finding.

| Test | Regression proof |
|---|---|
| `AC-5: LEDGER_VOCABULARY is the single source validateCoverageLedger enforces …` | mutation: `rowsById`'s `new Set(LEDGER_VOCABULARY[label])` replaced by an inline literal copy of the same three status lists (the exact re-hardcoding AC-5 forbids, values identical so every ordinary assertion still passes). First failure: the widening probe — `Error: files status invalid: provisionally-checked` at `tests/run.js:3270` |
| `AC-5: validate-ledger tolerates a manifest predating the vocabulary field …` | mutation: the tolerance guard `manifest.vocabulary !== undefined &&` deleted, making the field required. First failure in this test: `Error: manifest vocabulary invalid` at `tests/run.js:3287` (the backward-tolerance assertion). Same mutation also reddens three pre-existing ledger tests, which is the point — every manifest fixture in the repo predates the field |
| `runtime.js CLI: manifest-digest … and --write persists it` **(extended in place, +2 assertions, no new test)** | mutation: `main`'s `Object.assign(JSON.parse(…), { vocabulary: LEDGER_VOCABULARY })` reduced to the bare parse. First failure: `--write must publish the validator's own vocabulary constant …` at `tests/run.js:2449`. The byte-idempotency assertion rides the same fixture rather than a second temp-dir test |
| `AC-13a: artifact-layout.md "Agent memory" is the one owner …` **(rewrite in place)** | mutation: `sprint-lifecycle.md:117` reverted to the pre-sprint restatement ``.claude/agent-memory/** is **not** excluded — hand-authored …``. First failure: `.asd/rules/sprint-lifecycle.md must not restate the property …` at `tests/run.js:3055`. This is the same regression the retired copy-count assertion aimed at, now caught without depending on how many copies exist |
| `AC-1/AC-2: git-strategy.md "Commit before review" is the sole home …` | mutation: `asd-phase-impl.md:80`'s citation replaced by a restatement carrying `git add -A`. First failure: `.asd/workflows/asd-phase-impl.md must not restate the broad-stage prohibition …` at `tests/run.js:3310` |
| `AC-4/AC-11/AC-14: review-policy.md carries the correlated-interruption branch …` | mutation: `**Late duplicate return.**` renamed to `**Late return.**`. First failure: `AC-14: a late-returning replaced dispatch needs a stated disposal` at `tests/run.js:3330` (AC-4's assertions precede it and correctly still pass) |
| `AC-8: external-review.md "Outcome contract" is the sole home …` | mutation: `review-policy.md:144`'s hand-off reverted to `External Review's unavailability path is \`external-review.md\`.` First failure: `the old scoping line handed off only the unavailability path …` at `tests/run.js:3349` |
| `AC-6: code-style.md §19 names the line-ending editing hazard …` | mutation: `commands.yaml`'s `lint` reverted to `git diff --check`. First failure: `commands.yaml must configure the staged form the rule requires …` at `tests/run.js:3369`. `commands.yaml` is outside `managed_paths`, so this run carries no hash co-failure |
| `AC-7: a root .gitattributes normalizes line endings …` | mutation: `.gitattributes` reduced to `* text=auto` (drops `eol=lf`). First failure: `the root .gitattributes must declare \`* text=auto eol=lf\` …` at `tests/run.js:3373`. Limitation recorded rather than overclaimed: the index-probe half was **not** proven by mutation — committing a CRLF blob to prove it would mean rewriting the index, and the probe reads a real, already-true property (every tracked blob reports `i/lf` today) rather than a fixture |
| `AC-3/AC-12: sprint-lifecycle.md owns retro-criterion re-verification …` | mutation: a `Reachability:` line added to **both** remaining example blocks in `t_plan.md` (Task 2 and Task 3), making the line look per-task mandatory. First failure: `t_plan.md must ship at least one example Task without a Reachability line …` at `tests/run.js:3398`. A first attempt that mutated only Task 2 was **not** caught — correctly, since the template still demonstrated the conditionality; recorded because it shows what this assertion does and does not claim |
| `AC-15: checkpoints.md surfaces a criterion's running cost …` | mutation: `asd-phase-impl.md:112`'s emitted entry reworded to `impl fix for iter-NN: findings applied`. First failure: `checkpoints.md counts fix rounds by matching this literal …` at `tests/run.js:3415`. This is the silent-rot case: without the assertion the count reads zero and no gate notices |
| `AC-10: asd-phase-impl.md builds fix modes as one ordered chain …` | mutation: the fix-modes bullet's pre-sprint wording (`parallel where independent, sequential where they collide`) prepended, keeping the new clause as well. First failure: `the fix-modes bullet must authorize no parallelism: "parallel where independent" …` at `tests/run.js:3424`. An earlier draft of this assertion used a bare `/parallel/i` match and went red against unmutated HEAD (the bullet legitimately narrates *why* parallel rounds were dropped) — fixed here as a test defect, not by weakening the contract: the check now names the three removed instruction phrases |

## Suite run

- Command: `node tests/run.js` (`test` from `commands.yaml`)
- Scope: **impacted → full**. `commands.yaml` declares no `test_affected` selector (documented there: one
  flat sequential runner file with no changed-test flag), and the change surface touches framework-wide
  shared infrastructure — `.asd/runtime.js`, `.asd/rules/**`, `.asd/workflows/**`, `.asd/templates/**`,
  `.asd/release-manifest.json`. The shared-infrastructure safety valve (`sprint-lifecycle.md`
  "Impacted test set") therefore fires and degrades this gate to the full suite
- Pre-strategy run (before any authoring, at `aae30d1`): **159/160 passed, 1 failed** — the single red was
  `T-2: .claude/agent-memory/** is stated as NOT excluded …` (`totalMatches === 4`), red by design per
  `plan.md`'s Definition of Done. No other assertion was broken by the eleven impl tasks
- Result: **pass — 170/170 passed, 0 failed, 0 skipped** (160 declarations before this entry, minus 0
  removed, plus 10 new in §20 and the red one rewritten in place; two assertions were added to the
  existing `manifest-digest` CLI test rather than authoring an eleventh)
- Lint: `git diff --cached --check` (`lint` from `commands.yaml`, the staged form Task 9 landed) —
  **clean, exit 0**, no output, run against this entry's own staged paths
- Build: `node .asd/sync.js --check` (`build`) — **`"ok": true`**, zero non-`current` targets
- HEAD: run verified at `aae30d1` plus this entry's two authored files (`tests/run.js`,
  `test-plan.md`); the commit sha carrying them is this tester's own commit, not known at authoring
  time. Nothing else in the worktree changed — the mutation runs above each restored their file
  byte-for-byte before the next began
- Skips: none. No entry was added to `.asd/project/stubs.md`
- Manual steps: none. No plan subtask needed a human-only action

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

None. Every failure seen this entry was a test defect and was fixed here: the pre-existing
copy-count assertion (rewritten, see Removed/Added) and one over-tight `/parallel/i` match in a
first draft of the AC-10 test (see its proof row). No production or canonical source was modified
by this phase.

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|

None. No criterion in this sprint has a visual, third-party-live or ux-feel surface — the whole
change surface is rule prose, one Node module and one repository config file, all of which are
either machine-checkable or explicitly recorded as `none` above.
