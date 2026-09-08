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
| 2 | 66a2a1f | delta since entry 1 — `impl` review-fix `iter-01`, test side: the eight dev fix commits `3c4e6c9..eb9034c` (`runtime.js` `coverageManifestDigest`, `artifact-layout.md`, `git-strategy.md`, both `*-review` workflows, `asd-external-review.md`, `external-review.md`, `sprint-lifecycle.md`, `code-style.md`, `checkpoints.md`, `asd-phase-impl.md`), plus the testing/documentation findings aimed at `tests/run.js` and at this file |

Entry 1's two HEAD stamps are one tree (testing `T-6`): both its strategy pass and its suite run were
scoped through `aae30d1`, the `impl` tip. `5e7451b` is that same tree plus this tester's own output
(`git diff --stat aae30d1 5e7451b` → `tests/run.js`, `test-plan.md`, one memory file, nothing else),
so no production or canonical content differs between the analysed surface and the exercised tree.
Entry 2 stamps  — the tree the suite was re-run green on, which is the delta commits plus this entry's own test-authoring commit, so entry 3's delta would exclude it.

## Risk → check decisions

Acceptance-criteria source is `sprint.md` `AC-1`..`AC-18` (`documents.prd` disabled). `AC-9` was closed at
the audit gate with no deliverable and has no change surface; `AC-17` is this file plus the suite gate.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `LEDGER_VOCABULARY` + `rowsById` (AC-5) | published vocabulary and enforced vocabulary drift apart — a reviewer reads statuses off its manifest that the validator then rejects, and the ledger gate becomes unpassable for a correctly-behaving reviewer | unit | add | executable behaviour with a real failure mode; the constant is exported, so the coupling can be proven directly rather than inferred from two literal lists agreeing today |
| `.asd/runtime.js` `coverageManifestDigest` + `manifest-digest --write` (AC-5) | stamping the new field moves the manifest identity (invalidating ledgers already returned against the pre-stamp digest), or the new validation rejects every manifest written before this sprint | unit + CLI contract | add | `backward_compat` is a live constraint here — the tolerance branch (`manifest.vocabulary !== undefined`) is the only thing standing between this change and every existing fixture |
| `.asd/rules/artifact-layout.md` "Agent memory" + its three citers (AC-13a) | a mode-specific restatement grows back and the two copies disagree — the exact condition Task 5 collapsed | static (rewrite of the existing check) | add | the check already existed but asserted a **copy count**, which Task 5 invalidated by design; rewritten to owner-plus-citations so it tracks the property instead of the count |
| `.asd/rules/git-strategy.md` "Commit before review" + both `*-review` workflows' review-file write step + `review-policy.md` "Diff reachability" (AC-13b) | the obligation is stated only where the reviewer reads it and never where the committer acts — a reviewer holds no commit tool, so its memory write never reaches a commit, never reaches a diff and is never reviewed. That is the one-sided-obligation class this whole sprint exists to close | static (three-site literal coupling, the AC-1/AC-2 idiom) | add | **entry 2** (testing `T-2`): at entry 1 this half had no row at all, `add` or `none`. It also had no acting site to bind to — the obligation lived in `review-policy.md` alone and neither review workflow contained the string `memory`. The review-fix round landed both acting sites (`git-strategy.md`'s bookkeeping sentence and both write steps), so the coupling is now three real literal tokens rather than a `none` |
| `.asd/rules/git-strategy.md` + `.asd/agents/asd-dev.md` + `.asd/workflows/asd-phase-impl.md` (AC-1, AC-2) | the prohibition is restated somewhere and the copies diverge; or the rule lands without the tool grant that makes it followable, which is the "correction that lands only in a rule" failure this sprint exists to fix | static | add | three-site coupling (rule ↔ agent grant ↔ workflow citation); each site is a literal token a regex derives |
| `.asd/rules/review-policy.md` correlated interruption / late duplicate return / verify before applying (AC-4, AC-14, AC-11) | a branch is dropped or reworded into its opposite — a late APPROVE displacing a recorded FAIL is a shipped-false-claim path, and a lost correlated-interruption branch re-arms the split trigger per reviewer | static | add | the directional halves ("never the reverse", "raises no reviewer's attempt count") are what make the branches safe; asserted as tokens, not whole sentences. **Entry 2** (testing `T-1`): AC-14's `<reviewer>.late.md` is additionally bound to `artifact-layout.md`'s two reviews rows — an artefact a rule mandates must be one the exhaustive path map admits, or the orchestrator is instructed to write a file the layout contract classifies as stray |
| `.asd/rules/external-review.md` "Outcome contract" + agent Don'ts + `review-policy.md` hand-off (AC-8) | the hand-off narrows back to the unavailability path only, leaving the empty return undisposed on both sides — `F-8` itself | static | add | includes the **negative** assertion on the old scoping line, which is the half a positive-only check would miss |
| `.asd/rules/code-style.md` §19 + `.asd/project/commands.yaml` `lint` (AC-6) | the rule requires the staged lint form while this repo's own configured command stays the blind one | static | add | `.asd/project/**` is outside every review surface, so no reviewer sees that config edit — this assertion is its only automated check |
| `.gitattributes` (AC-7) | a CRLF blob enters the index; invisible in a worktree that shows CRLF for every file anyway | static + index probe (`git ls-files --eol`) | add | the declaration alone is a tautology; the index probe is the check with a real failure mode, and it is the committed form of the `F-7` damage |
| `.asd/rules/sprint-lifecycle.md` scope re-verification + Reachability grammar, `asd-phase-scope.md`, `t_plan.md` (AC-3, AC-12) | the obligation lives only in a rule the acting phase never reads; or the template teaches `Reachability` as per-task mandatory, colliding with `Material risk`'s fail-closed absence semantics | static | add | the template is where a plan author actually reads whether the line is conditional — asserted by block shape, not by counting lines |
| `.asd/rules/checkpoints.md` "Criterion cost surfacing" (AC-15) | the literal `impl fix for iter-NN: findings resolved` that the unit counts is reworded on the emitting side; the count then silently reads zero and nothing fails | static (cross-file literal coupling) | add | the audit rated AC-15 weak, but the *derivation source* half is a hard literal coupling between `checkpoints.md` and `asd-phase-impl.md:112` — the strongest thing here and the one that rots silently |
| `.asd/workflows/asd-phase-impl.md` fix-mode graph (AC-10) | the removed wording is reverted, or the narrowing accidentally serializes the initial dispatch step too (`:64` is shared with initial mode) | static | add | asserted as an absence on the fix-modes bullet plus a presence on the dispatch line, so both directions of the mistake fail |
| `.asd/agents/asd-dev.md`, `asd-external-review.md` → 8 generated provider views (AC-18) | a canonical agent edit lands without its `sync.js --apply`, leaving a stale view | — | none | already gated: `node .asd/sync.js --check` is `build` in `commands.yaml`, runs on every phase gate and in CI (`.github/workflows/sync-check.yml`). A suite assertion would duplicate it exactly |
| `.asd/release-manifest.json` `canon_hashes`/`upstream_hashes` updates (AC-16) | a recorded hash goes stale against its file | — | none | covered by the existing `release-manifest.json: every upstream_hashes entry matches the actual file` test — it fired on every mutation run below, which is direct evidence it is live |
| `README.md`, `core.md` "See also", phase chain, template variables, sprint-artefact path names (AC-16) | a mirror goes stale | static (`<reviewer>.late.md` ↔ `artifact-layout.md` path map) | add | **corrected in entry 2** (testing `T-1`). The entry-1 reason "no change surface" was wrong: AC-14 introduced a new sprint-artefact path name, and a path name IS one of this class's mirrored facts — its mirror is `artifact-layout.md`'s reviews rows, which the sprint also edited. Now asserted in both directions (see the AC-4/AC-11/AC-14 row). The rest of the class is genuinely untouched — no phase, agent, model tier, config key or folder-map change, `README.md` absent from the diff (independently re-verified by the Documentation reviewer) — and the existing §16 phase-chain and §9b roster tests remain its standing guard |
| `.claude/agent-memory/**` — `asd-dev-critical/` (entry 1: `project_crlf-canon-edits.md`, `feedback_sequential-fix-rounds.md`; entry 2: the same CRLF file again plus its `MEMORY.md` hook line) and `asd-tester-critical/` (entry 1: `project_testability-envelope.md`; entry 2: the same file again) | a memory file is written but never indexed, so the agent never loads it and the write was a no-op; or an index entry points at a file that does not exist; or the memory contradicts the rule it cites | static (index ↔ directory bijection) | add | **widened in entry 2** (testing `T-4`): the entry-1 row named `asd-dev-critical/**` only and waived the rest, though `asd-tester-critical/project_testability-envelope.md` was in the same entry's surface. The existing link test was generalized in place over both directories and given its reverse direction (an unindexed file now fails), which is a live failure mode for every entry that writes memory. Deliberately NOT generalized to all of `.claude/agent-memory/**`: `asd-pm/MEMORY.md` carries a dangling link (`feedback_flag-gate-semantics-before-applying.md`, no such file) predating this sprint and outside its change surface. The remainder of each memory is agent guidance prose; what *would* make it assertable is a claim quoting a literal from canon, and the one such claim in scope — the CRLF memory's premise — is covered by the AC-6/AC-7 assertions on `code-style.md` §19 and `.gitattributes` |
| AC-9 (cross-sprint external-review availability record) | — | — | none | closed at the audit gate with no deliverable; there is nothing in the change surface to check |
| Reachability ↔ `route-task` equivalence (assertion proposed by impl) | a plan task carrying a `Reachability` line routes differently from one carrying only `Material risk` | — | none | **premise checked and false** (`review-policy.md` "Verify before applying"): `runtime.js` `routeTask` takes a structured input object and contains no plan-file parser at all — the `Material risk` extraction is the orchestrator's, not the runtime's. A test passing the same `risks` array twice would assert only that a pure function is deterministic. The real claim — that the orchestrator never feeds `Reachability` to `route-task` — is stated in `sprint-lifecycle.md:308` and is covered as prose there; it has no executable surface to bind to. Reported here rather than transcribed |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/run.js` — `T-2: \`.claude/agent-memory/**\` is stated as NOT excluded …` (`assert.strictEqual(totalMatches, 4)`) | implementation-coupled — it asserted how many copies of a statement existed rather than the property itself, so the deliberate collapse to one owner (Task 5) turned it red by design | yes — **rewritten in place, not removed**; see `AC-13a` in Added tests. Coverage is strictly wider afterwards (it now also checks the owner's sole-ownership claim and that each named citer really cites back) |

No other test met a removal criterion (`code-style.md` §17). Nothing trivial, duplicate,
mock-confirming, implementation-coupled or flaky was found among the impacted set. No out-of-scope
deletion was proposed, so the removal gate did not fire.

Entry 2 removed nothing either. Three tests were changed in place and none deleted: the
`manifest-digest` CLI test (renamed, re-pinned — the assertion correctness `F-2` invalidated was
rewritten to the property that holds, not dropped), the backward-tolerance fixture (rebuilt), and
the `asd-dev-critical` index-link test (generalized over both memory directories in scope). Test
count went 170 → 171, and every entry-1 assertion still stands except the one named above.

## Added tests

All in `tests/run.js` (this repo's only runner). New trailing section **§20**, except the two marked
in place — the file's section numbering has pre-existing collisions, so nothing was renumbered.
Every proof below is a targeted mutation of production/canon source, run against the whole suite and
restored byte-for-byte; the assertion named is the one that fired **first** in that test's body.
Mutating a `managed_paths` file additionally fails `release-manifest.json: every upstream_hashes
entry matches the actual file` — that co-failure is an artefact of the mutation, not a second finding.

Entry 2 added one test (`AC-13b`) and amended seven in place; every `tests/run.js:N` stamp below was
re-resolved against entry 2's file, so each line reference points at the assertion it names. Entry 2
also deleted the five in-body comments this sprint had added to `tests/run.js` (documentation `F-3`:
`code-style.md` §7 forbids them and `AGENTS.md` gives framework code no exemption). Verified one by
one before deleting — three were verbatim duplicates of the assertion message beside them, and the
two that carried something the message did not were folded INTO that message rather than dropped.
The file's ~60 pre-existing instances are outside the change surface and were left alone.

| Test | Regression proof |
|---|---|
| `AC-5: LEDGER_VOCABULARY is the single source validateCoverageLedger enforces …` | mutation: `rowsById`'s `new Set(LEDGER_VOCABULARY[label])` replaced by an inline literal copy of the same three status lists (the exact re-hardcoding AC-5 forbids, values identical so every ordinary assertion still passes). First failure: the widening probe — `Error: files status invalid: provisionally-checked` at `tests/run.js:3270` |
| `AC-5: validate-ledger tolerates a manifest predating the vocabulary field …` **(entry 2: fixture rebuilt)** | **Entry 2** (correctness `F-2`, test side). Entry 1's `legacy` fixture stamped its digest with `coverageManifestDigest` itself, so it tracked whatever the digester did and never exercised a legacy stamp — it stayed green straight through the defect it claimed to cover. Rebuilt from the pre-vocabulary algorithm reproduced on the untouched `fingerprint` primitive (`{...manifest}` minus `digest`, hashed), so the fixture cannot move with the function under test. Mutation: the `F-2` fix reverted, as in the CLI row above. First failure in this test: `Error: ledger manifest identity invalid` at `tests/run.js:3293` — the exact defect `F-2` describes, now actually caught. Entry 1's mutation still holds as well: deleting the `manifest.vocabulary !== undefined` tolerance guard fails the same assertion, and reddens three pre-existing ledger tests because every manifest fixture in the repo predates the field |
| `runtime.js CLI: manifest-digest digests a manifest exactly as written, and --write stamps the vocabulary into the file before digesting it` **(entry 2: renamed and re-pinned in place; entry 1 had extended it +2 assertions)** | **Entry 2.** Entry 1's `--write must persist the same digest just printed` pinned a property that stopped holding when correctness `F-2` was fixed: it required stamping to leave the identity still, which is possible only if the digester implies a `vocabulary` the file does not carry — the very thing that invalidated every legacy-stamped manifest. Verified against `runtime.js` at HEAD before rewriting: `--write` stamps the field INTO the file and then digests the file, so the identity moves by design while a manifest that is never stamped keeps its pre-vocabulary identity. Re-pinned to the three properties that do hold — pre-vocabulary identity (`fingerprint` of the manifest as written), print↔persist agreement, and the stamped file's round-trip against its own digest. Mutation: the `F-2` fix reverted, `Object.assign({}, manifest)` → `Object.assign({ vocabulary: LEDGER_VOCABULARY }, manifest)`. First failure: `a manifest carrying no \`vocabulary\` must digest to the plain stable hash of its own content …` at `tests/run.js:2439`. `:2445` (vocabulary published) and `:2450` (second `--write` byte-idempotent) keep passing under that mutation, as they must |
| `AC-13a: artifact-layout.md "Agent memory" is the one owner …` **(rewrite in place)** | mutation: `sprint-lifecycle.md:117` reverted to the pre-sprint restatement ``.claude/agent-memory/** is **not** excluded — hand-authored …``. First failure: `.asd/rules/sprint-lifecycle.md must not restate the property …` at `tests/run.js:3055`. This is the same regression the retired copy-count assertion aimed at, now caught without depending on how many copies exist. **Entry 2** (testing `T-3`): the restatement separator widened from `[^.]` to `[^\n]` — a restatement split across a sentence boundary used to pass unseen. Proven by a mutation the old form provably could not see: `sprint-lifecycle.md:119` extended with ` It is **not** an excluded path under self-hosting.` (old regex → no match, new regex → match, both evaluated against that exact line). First failure: `.asd/rules/sprint-lifecycle.md must not restate the property …` at `tests/run.js:3052`. The residual limit — matching runs inside ONE line — is now stated in the assertion message instead of being implied |
| `AC-1/AC-2: git-strategy.md "Commit before review" is the sole home …` | mutation: `asd-phase-impl.md:80`'s citation replaced by a restatement carrying `git add -A`. First failure: `.asd/workflows/asd-phase-impl.md must not restate the broad-stage prohibition …` at `tests/run.js:3316` |
| `AC-4/AC-11/AC-14: review-policy.md carries the correlated-interruption branch …` | mutation: `**Late duplicate return.**` renamed to `**Late return.**`. First failure: `AC-14: a late-returning replaced dispatch needs a stated disposal` at `tests/run.js:3353` (AC-4's assertions precede it and correctly still pass) |
| `AC-8: external-review.md "Outcome contract" is the sole home …` | mutation: `review-policy.md:144`'s hand-off reverted to `External Review's unavailability path is \`external-review.md\`.` First failure: `the old scoping line handed off only the unavailability path …` at `tests/run.js:3377` |
| `AC-6: code-style.md §19 names the line-ending editing hazard …` | mutation: `commands.yaml`'s `lint` reverted to `git diff --check`. First failure: `commands.yaml must configure the staged form the rule requires …` at `tests/run.js:3395`. `commands.yaml` is outside `managed_paths`, so this run carries no hash co-failure |
| `AC-7: a root .gitattributes normalizes line endings …` | mutation: `.gitattributes` reduced to `* text=auto` (drops `eol=lf`). First failure: `the root .gitattributes must declare \`* text=auto eol=lf\` …` at `tests/run.js:3399`. Limitation recorded rather than overclaimed: the index-probe half was **not** proven by mutation — committing a CRLF blob to prove it would mean rewriting the index, and the probe reads a real, already-true property (every tracked blob reports `i/lf` today) rather than a fixture |
| `AC-3/AC-12: sprint-lifecycle.md owns retro-criterion re-verification …` | mutation: a `Reachability:` line added to **both** remaining example blocks in `t_plan.md` (Task 2 and Task 3), making the line look per-task mandatory. First failure: `t_plan.md must ship at least one example Task without a Reachability line …` at `tests/run.js:3429`. A first attempt that mutated only Task 2 was **not** caught — correctly, since the template still demonstrated the conditionality; recorded because it shows what this assertion does and does not claim |
| `AC-15: checkpoints.md surfaces a criterion's running cost …` | mutation: `asd-phase-impl.md:112`'s emitted entry reworded to `impl fix for iter-NN: findings applied`. First failure: `checkpoints.md counts fix rounds by matching this literal …` at `tests/run.js:3446`. This is the silent-rot case: without the assertion the count reads zero and no gate notices |
| `AC-10: asd-phase-impl.md builds fix modes as one ordered chain …` | mutation: the fix-modes bullet's pre-sprint wording (`parallel where independent, sequential where they collide`) prepended, keeping the new clause as well. First failure: `the fix-modes bullet must authorize no parallelism: "parallel where independent" …` at `tests/run.js:3455`. An earlier draft of this assertion used a bare `/parallel/i` match and went red against unmutated HEAD (the bullet legitimately narrates *why* parallel rounds were dropped) — fixed here as a test defect, not by weakening the contract: the check now names the three removed instruction phrases |

| `AC-13b: git-strategy.md "Commit before review" names the reviewer agent-memory it commits, and both *-review workflows name that commit at the step that writes the review file` **(entry 2, new)** | two mutations, one per site, because the acting-site assertions sit behind the rule-site ones in the same body. (a) the memory clause deleted from `git-strategy.md`'s bookkeeping sentence → first failure `AC-13b: the memory class must be named in the list the committer reads …` at `tests/run.js:3332`. (b) `asd-phase-design-review.md`'s write step stripped of `, and the commit carrying that file also carries any agent memory that reviewer authored (…)` → first failure `.asd/workflows/asd-phase-design-review.md: the review-file write step is the acting site …` at `tests/run.js:3341` |
| `AC-4/AC-11/AC-14 …` **(entry 2: `<reviewer>.late.md` bound to the path map)** and `T-2/AC-3 …` **(entry 2: map assertions extended to the same variant)** | mutation: `, <reviewer>.late.md` removed from `artifact-layout.md`'s impl reviews row. First failure in each test: `artifact-layout.md path map must name every review-file variant under impl reviews` at `tests/run.js:3079`, and `artifact-layout.md's impl reviews row must carry the artefact name review-policy.md mandates …` at `tests/run.js:3358`. Both sites on purpose: the map must name the file, and the rule's literal is checked against the map rather than only against itself |
| `T-2/T-4: in each agent-memory directory this sprint writes, MEMORY.md and the files beside it are a bijection …` **(entry 2: generalized in place from the `asd-dev-critical`-only link check)** | mutation: an unindexed `zz_unindexed-probe.md` dropped into `asd-tester-critical/`. First failure: `asd-tester-critical/zz_unindexed-probe.md is written but not indexed by its MEMORY.md …` at `tests/run.js:3140`. The pre-existing forward direction (index → file exists) keeps its own coverage; the reverse direction is new and is the half that fires on a real authoring mistake |
| `AC-7: a root .gitattributes normalizes line endings …` **(entry 2: spawn precondition made legible, testing `T-5`)** | proof by environment rather than by mutation: the whole suite re-run with `PATH` reduced to node's own directory. The probe now fails with `this assertion is the suite's only call to the \`git\` binary and additionally needs a git work tree at … Underlying: spawnSync git ENOENT` at `tests/run.js:3405`, instead of throwing an opaque `ENOENT` with no statement of what is missing. Recorded honestly: three pre-existing external-CLI preflight tests also fail under that stripped `PATH` — this is the only `git`-binary call, not the only PATH-dependent test. Entry 1's limitation still stands unchanged: the index-probe half is not mutation-proven, since proving it means committing a CRLF blob |

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
- Entry 1 result: **pass — 170/170 passed, 0 failed, 0 skipped** (160 declarations before that entry,
  minus 0 removed, plus 10 new in §20 and the red one rewritten in place; two assertions were added to
  the existing `manifest-digest` CLI test rather than authoring an eleventh)
- Entry 2 opened **1 red**, at `tests/run.js:2444`: `--write must persist the same digest just
  printed`. Not a code defect, so no `D-N`: it is the assertion the correctness `F-2` fix invalidated
  by design (it required stamping to leave the manifest identity still, which holds only if the
  digester implies a field the file does not carry). The dev's reasoning was re-verified against
  `runtime.js` at HEAD before anything was touched, then the assertion was reconciled as a **test
  defect** — re-pinned to the properties that hold, never weakened to assert nothing
- Entry 2 result: **pass — 171/171 passed, 0 failed, 0 skipped** (170 declarations at entry 2's start,
  minus 0 removed, plus 1 new — `AC-13b`; seven existing tests amended in place)
- Lint: `git diff --cached --check` (`lint` from `commands.yaml`, the staged form Task 9 landed) —
  **clean, exit 0**, no output, run against this entry's own staged paths
- Build: `node .asd/sync.js --check` (`build`) — **`"ok": true`**, zero non-`current` targets
- HEAD: entry 2's run verified at `eb9034c` plus this entry's own authored files (`tests/run.js`,
  `test-plan.md`, `.claude/agent-memory/asd-tester-critical/**`); the commit sha carrying them is this
  tester's own commit, not known at authoring time. Nothing else in the worktree changed — every
  mutation above restored its file byte-for-byte (`git checkout -- <file>`, never `sync.js --apply`)
  before the next began
- Skips: none. No entry was added to `.asd/project/stubs.md`
- Manual steps: none. No plan subtask needed a human-only action

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

None, in either entry. Every failure seen was a test defect and was fixed here: entry 1's
pre-existing copy-count assertion (rewritten, see Removed/Added) and one over-tight `/parallel/i`
match in a first draft of the AC-10 test (see its proof row); entry 2's single red, the
`--write must persist the same digest just printed` assertion that correctness `F-2`'s fix
invalidated by design (re-pinned, see Added tests and Suite run). No production or canonical source
was modified by this phase in either entry.

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|

None. No criterion in this sprint has a visual, third-party-live or ux-feel surface — the whole
change surface is rule prose, one Node module and one repository config file, all of which are
either machine-checkable or explicitly recorded as `none` above.
