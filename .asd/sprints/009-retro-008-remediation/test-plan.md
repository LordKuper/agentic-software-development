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
| 3 | 1fcf059 | delta since entry 2 — `impl` review-fix `iter-02`, test side: the dev chain's five commits `f4d518f`..`25492b0` (`asd-phase-impl.md` steps 5 and 6, both `*-review` workflows' step 7a/8a + `Artefacts produced`, `checkpoints.md` fix-round match, `sprint-lifecycle.md` ordinal), plus testing `T-1`/`T-2`, both aimed at `tests/run.js` |
| 4 | 6ae1f7a | delta since entry 3 — `impl` review-fix `iter-03`, test side: the dev chain's single commit `6ae1f7a`, two lines in each of the two `*-review` workflows (step 7a/8a header now scopes `internal reviewers only` to split mechanics; the `Late duplicate return` sub-bullet now opens with its own reach, `applies to any replaced dispatch, External Review included`), plus correctness's test-side recommendation aimed at `tests/run.js` |
| 5 | 79d3f81 | delta since entry 4 — `impl` review-fix `iter-04`, test side: the dev chain's `96d9c55` (both `*-review` workflows, step 7a/8a — the header's reach removed outright, `Interrupted dispatch` and `Split dispatch` written out as their own bullets, each stating its own reach) and `b32be9d` (one `asd-dev-critical` memory file plus its `MEMORY.md` index line), plus the partial, uncommitted `tests/run.js` inherited from the tester dispatch a session limit killed mid-run (`friction-log.md` `F-5`) |

Entry 1's two HEAD stamps are one tree (testing `T-6`): both its strategy pass and its suite run were
scoped through `aae30d1`, the `impl` tip. `5e7451b` is that same tree plus this tester's own output
(`git diff --stat aae30d1 5e7451b` → `tests/run.js`, `test-plan.md`, one memory file, nothing else),
so no production or canonical content differs between the analysed surface and the exercised tree.
Entry 2 stamps 66a2a1f — the tree the suite was re-run green on, which is the delta commits plus this entry's own test-authoring commit, so entry 3's delta would exclude it.
Entry 3 stamps `25492b0`, the dev chain's tip: the tester chain is dispatched only after the dev chain
completes (`asd-phase-impl.md` step 5, the ordering this very round landed), so the tree analysed, the
tree every mutation below ran against and the tree the suite ran green on are one and the same, with
this entry's own test-authoring commit on top of it.
Entry 4 stamps `6ae1f7a`, again the dev chain's tip and again for the same reason. Its delta is two
lines per review workflow and nothing else — no rule doc, no Node source, no template — so the scoped
strategy pass covers exactly one existing test; the impacted-set gate still ran the whole suite below.

Entry 5 stamps `79d3f81` — the dev chain's tip `b32be9d` plus the orchestrator's restore commit for
`F-5`. Its delta is three lines per review workflow and one memory file. The inherited `tests/run.js`
was treated as evidence to re-verify, not as reasoning already done: every assertion in it was
re-checked against source at this HEAD, and every mutation proof below was run from scratch, because
none of the interrupted run's proofs survived it.

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
| `.asd/rules/review-policy.md` correlated interruption / late duplicate return / verify before applying (AC-4, AC-14, AC-11) | a branch is dropped or reworded into its opposite — a late APPROVE displacing a recorded FAIL is a shipped-false-claim path, and a lost correlated-interruption branch re-arms the split trigger per reviewer | static | add | the directional halves ("never the reverse", "raises no reviewer's attempt count") are what make the branches safe; asserted as tokens, not whole sentences. **Entry 2** (testing `T-1`): AC-14's `<reviewer>.late.md` is additionally bound to `artifact-layout.md`'s two reviews rows — an artefact a rule mandates must be one the exhaustive path map admits, or the orchestrator is instructed to write a file the layout contract classifies as stray. **Entry 3** (testing `T-2`, plus this round's own dev delta): two more halves bound. (a) The latch-clearing clause — `sprint-lifecycle.md` "APPROVE latch" claims to name *every* route that clears a latch, and the late-return route is one of them; `latch` appeared in the suite exactly once, unrelated, so the claim guarded nothing. Pinned by the route's **citation**, never by its ordinal, since the dev chain renamed "A THIRD" → "A further" this very round and an ordinal-keyed match would have gone red on a correct edit. (b) Both `*-review` workflows: the rule names the phase workflow as the actor, so the acting sites are step 7a/8a's `Late duplicate return` sub-bullet and each `Artefacts produced` list — the same three-site idiom, now rule ↔ path map ↔ acting workflow. **Entry 4** (correctness's iter-03 recommendation, verified before acting): with the reach carve-out now stated in each workflow's own bullet, the suite still pinned only the citation substring — and by a file-level `includes`, not even line-scoped — so a future edit re-narrowing the bullet back to the step header's `internal reviewers only` would have passed green, discarding exactly the late External Review return AC-14 exists to admit. Bound as a three-site relation instead: `review-policy.md` states the carve-out attached to the branch it widens, and each workflow's late-duplicate line must carry the same reach on the same line as the citation. **Entry 5** (iter-04 dev delta, `96d9c55`): the fix removed the step header's reach outright rather than widening it, so all three branches now state their own reach on their own line and the header governs nothing. That moves the risk twice over. First, the interrupted branch's reach is now asserted only at the two acting bullets, while its two **sources** were unpinned — `review-policy.md:144`'s `Applies to the 4 internal reviewers, except where a branch states its own reach` and `external-review.md:51`'s `imported here whole`, both landed at `636c7b4` and neither read by any test. Both are pinned now: without the delegation clause the bullets' wider reach contradicts its own SSoT, and without the whole import there is nothing placing External Review inside a branch whose default is the 4 internal reviewers, so the bullets become unsourced claims a compressor deletes on sight — which is exactly the edit `F-5` left on disk. Second, the three bullets are bound line-scoped like the late-duplicate one already was: `Interrupted dispatch` must carry `External Review included` **and** its `external-review.md` "Outcome contract" citation in the same sentence, and `Split dispatch` must keep `internal reviewers only` — that branch's narrowness is the real one (an External Review dispatch returns no ledger to merge and is exempt from `validate-ledger`), and with both neighbours now reading "External Review included", harmonizing the third is the plausible wrong edit. |
| `.asd/rules/external-review.md` "Outcome contract" + agent Don'ts + `review-policy.md` hand-off (AC-8) | the hand-off narrows back to the unavailability path only, leaving the empty return undisposed on both sides — `F-8` itself | static | add | includes the **negative** assertion on the old scoping line, which is the half a positive-only check would miss. **Entry 3** (testing `T-1`): the two-site abort carve-out the iter-01 round landed was still unasserted — `external-review.md`'s "a precondition missing before any invocation … aborts the dispatch instead" and the agent's `ABORT — precondition not met: <artefact>` scoped "only before any `{{wraps_cli}}` invocation" with its citation back to "Outcome contract". Silent both ways, which is why it is an `add` and not a `none`: drop the rule clause and the agent emits a third outcome the contract forbids; drop the agent's scoping and a missing prompt template returns an availability skip that passes a gate on an artefact nobody reviewed — `F-8`'s own class. Both halves are literal tokens in tracked files, so "it is prose" would not survive inspection. **Entry 5**: the "Outcome contract" side of the hand-off — that it imports `review-policy.md` "Interrupted dispatch" **whole** — is now pinned, in the `AC-4/AC-11/AC-14` test body where the mirrors derived from it are checked rather than here. This test's own assertion is `external.includes('"Interrupted dispatch"')`: it checks the boundary is *named*, never that it is imported unnarrowed. That is the hole `F-5` exposed — the interrupted tester's leftover mutation (`imported here for the 4 internal reviewers`, the `DOC4-1` defect verbatim) leaves this AC-8 test green, verified directly by re-running that exact byte state (proof (b) below). |
| `.asd/rules/code-style.md` §19 + `.asd/project/commands.yaml` `lint` (AC-6) | the rule requires the staged lint form while this repo's own configured command stays the blind one | static | add | `.asd/project/**` is outside every review surface, so no reviewer sees that config edit — this assertion is its only automated check |
| `.gitattributes` (AC-7) | a CRLF blob enters the index; invisible in a worktree that shows CRLF for every file anyway | static + index probe (`git ls-files --eol`) | add | the declaration alone is a tautology; the index probe is the check with a real failure mode, and it is the committed form of the `F-7` damage |
| `.asd/rules/sprint-lifecycle.md` scope re-verification + Reachability grammar, `asd-phase-scope.md`, `t_plan.md` (AC-3, AC-12) | the obligation lives only in a rule the acting phase never reads; or the template teaches `Reachability` as per-task mandatory, colliding with `Material risk`'s fail-closed absence semantics | static | add | the template is where a plan author actually reads whether the line is conditional — asserted by block shape, not by counting lines |
| `.asd/rules/checkpoints.md` "Criterion cost surfacing" (AC-15) | the entry the unit counts is reworded on the emitting side; the count then silently reads zero and nothing fails | static (cross-file literal coupling) | add | the audit rated AC-15 weak, but the *derivation source* half is a hard literal coupling between `checkpoints.md` and `asd-phase-impl.md:112` — the strongest thing here and the one that rots silently. **Entry 3** (correctness `F-1`, test side): the entry-2 assertion pinned **string equality** on the whole heading `impl fix for iter-NN: findings resolved`, which the dev chain's fix deliberately removed — `checkpoints.md` now matches on the stable tail `for iter-NN: findings resolved` "however the mode is named", because the orchestrator really wrote `impl review-fix for iter-01: findings resolved` and the old literal did not select it. Verified against `decisions-log.md:104` before touching the test: the dev's premise is true on real data. Re-pinned to the property equality only approximated — the emitted literal is **derived** from the workflow and must END WITH the tail `checkpoints.md` matches on, so either side may be reworded freely as long as the counter still selects the emitter, and neither may be reworded out of containment. Both directions plus the step-citation locator are proven separately below |
| `.asd/workflows/asd-phase-impl.md` fix-mode graph (AC-10) | the removed wording is reverted, or the narrowing accidentally serializes the initial dispatch step too (`:64` is shared with initial mode) | static | add | asserted as an absence on the fix-modes bullet plus a presence on the dispatch line, so both directions of the mistake fail. **Entry 3**: the dev chain widened AC-10 from "no parallelism *within* a chain" to "one agent in flight *across the round*" (dev chain then tester chain) — the reading sprint 009 `iter-01` actually ran, and the reason this very entry runs after the dev chain. The new literals sit on the two lines this test already isolates, so they cost three assertions and no new test: the ordering clause and the round-level invariant on the fix-modes bullet, and the `initial mode only` scope clause on the dispatch line whose preserved parallel-where-independent phrase the same test still requires to survive |
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

Entry 3 removed nothing either, and added no declaration: four tests changed in place. One assertion
was replaced rather than deleted — the AC-15 whole-heading equality, superseded by six assertions that
pin the same coupling as containment (`code-style.md` §17: an implementation-coupled check is
rewritten to the property it was reaching for, not dropped). Nothing else met a removal criterion; no
out-of-scope deletion was proposed, so the removal gate did not fire in this entry either.

Entry 5 removed nothing either and added no declaration: one existing test amended in place, plus two
assertion **messages** reworded (see Added tests). No inherited assertion was dropped — each was
re-verified against source at `79d3f81` before being kept, since the working tree it arrived in was
authored by a dispatch that did not survive to record why. No out-of-scope deletion was proposed, so
the removal gate did not fire in this entry either.

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

Entry 3 added **no** test and removed none: four existing tests were amended in place (`AC-15`
re-pinned, `AC-8`, `AC-4/AC-11/AC-14` and `AC-10` extended), +13 assertions, declaration count
unchanged at 171. Every one of the 13 is proven by its own mutation below, each run against the whole
suite and restored with `git checkout -- <file>`; the assertion named in each proof is the one that
fired **first** in that test's body under that mutation, transcribed from the runner output. Line
stamps below are entry-3 line numbers. No in-body comment was added (`code-style.md` §7) — every
reason lives in the `assert` message, where it is read at the moment of failure.

Entry 4 added **no** test and removed none: one existing test (`AC-4/AC-11/AC-14`) amended in place,
declaration count unchanged at 171, net +2 assertions. One of the three is a conversion rather than an
addition — the entry-1 file-level `reviewFlow.includes(citation)` became a line-scoped `find` plus two
asserts, which is strictly stronger (the citation and the reach must now be one sentence) and drops
nothing. The other two are new: the SSoT-side carve-out in `review-policy.md`, and the reach on each
workflow's acting bullet. All three are proven by their own mutation below.

One companion assertion the dev chain floated was **declined**: pinning that step 7a/8a's header no
longer claims a blanket `internal reviewers only`. Two reasons, and since this is the third round on
the same AC the reasoning is recorded, not just the outcome.
(a) It cannot be written as a relation. The header still contains the literal `internal reviewers
only`; the only thing making it narrow is the scope prefix `split and re-dispatch mechanics:`, so the
assertion would have to pin that exact phrase on a single site, with no second site to derive it from.
That is the shape that went red on a *correct* edit in entry 3 (`A THIRD` → `A further`) and had to be
re-pinned — any faithful rewording of the prefix reddens it.
(b) It adds no true positive the reach assertion misses. The finding's mechanism was a bullet
**silent** on reach inheriting the header's scope; with the bullet explicit, a header that re-broadened
would read worse but could not silently govern, because the orchestrator acts from the bullet — the
same acting-site reasoning the `AC-13b` test already uses. A regression that actually re-narrows the
binding has to strip the bullet, which is exactly what the added assertion catches, proven twice below.
Cost of being wrong is bounded: the header carries no other obligation, and the bullet's reach is now
checked against its SSoT in both workflows.

Entry 5 added **no** test and removed none: one existing test (`AC-4/AC-11/AC-14`) amended in place,
declaration count unchanged at 171, +6 assertions. Provenance matters here, because this entry inherits
work it did not do: the six assertions arrived as an uncommitted `tests/run.js` from the tester dispatch
`F-5` killed. Each was re-derived against source at this HEAD before being kept — the four locators
re-read (`review-policy.md:144`, `external-review.md:51`, both workflows' step 7a/8a bullets, checked
for a second line either `find` could select), the `AC-8` test re-read to confirm the `importedWhole`
message's claim about what it does and does not check, and the historical claim in the late-duplicate
message checked against `git show 96d9c55^` (the header did read `split and re-dispatch mechanics:
internal reviewers only`). All six held and all six were kept; none of the interrupted run's proofs
survived, so all seven mutations below were run fresh.

One inherited assertion was kept despite an apparent overlap, and the overlap is worth stating: a
pre-existing file-level test already asserts the interrupted-routing sentence in both workflows, and it
co-fires when the bullet is deleted (proof (c)). It is not a substitute — it passed on the **pre-fix**
shape, where that sentence lived in the step header's prose. The new assertion requires the branch to
be a bullet at the acting step, which is the property the iter-04 fix actually established.

Two assertion **messages** were reworded rather than assertions added, for one reason: both argued
from the step header's *current wording*, which has now been rewritten under them twice in four
iterations. A message that quotes a neighbouring site goes stale silently — nothing fails, and the next
reader is told why an assertion exists by a sentence that is no longer true, which is how the iter-03
message came to argue from a header that no longer said what it claimed. Both now argue from the
delegation rule itself (`review-policy.md` states the 4-internal default and delegates reach to each
branch), which the same test pins one assertion earlier, so the messages cannot outlive their premise.

The header pin stays **declined**, and entry 4's reason (a) is superseded rather than re-affirmed: the
header no longer contains `internal reviewers only` at all, so "the literal is still there, only a
prefix narrows it" is no longer the argument. The argument at this HEAD is:
(a) *It reddens on a correct edit.* Pinning "the header carries no reach" means either a fresh
single-site literal (`The step header carries no reach; each branch below states its own.`) or a
line-scoped absence of `internal reviewers only` on the header line. A future header that correctly
summarizes all three branches — "interrupted and late-duplicate reach any dispatch; split is internal
reviewers only" — is right and fails both forms. That is the entry-3 shape that had to be re-pinned
after going red on a correct fix, and the reason `code-style.md` §17 work here pins relations between
two sites rather than fresh literals on one.
(b) *No true positive is left for it.* The header has no acting force: the orchestrator acts from the
bullets, and all three bullets now carry their own reach, each pinned line-scoped and each proven
below. A header that re-broadened or re-narrowed while the bullets stand is a contradiction on the same
screen — a Documentation finding, not a silent behaviour change. Behaviour changes only when a bullet
is stripped, narrowed, or cut loose from its source, and those are the six things that now fail. Every
regression this sprint actually shipped on this section was bullet-side or source-side: a bullet silent
on reach (iter-03) and a narrowed import (`F-5` / `DOC4-1`).
(c) *Four iterations have gone to one rule section.* An assertion whose only distinct failure mode is
a redundant restatement drifting is maintenance the next real re-narrowing does not pay for.

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
| `AC-15: checkpoints.md surfaces a criterion's running cost …` | mutation: `asd-phase-impl.md:112`'s emitted entry reworded to `impl fix for iter-NN: findings applied`. First failure: `checkpoints.md counts fix rounds by matching this literal …` at `tests/run.js:3446`. This is the silent-rot case: without the assertion the count reads zero and no gate notices. **Superseded at entry 3** — that assertion no longer exists (it pinned whole-heading equality, which correctness `F-1` invalidated); its replacement and proofs are in the entry-3 rows below |
| `AC-10: asd-phase-impl.md builds fix modes as one ordered chain …` | mutation: the fix-modes bullet's pre-sprint wording (`parallel where independent, sequential where they collide`) prepended, keeping the new clause as well. First failure: `the fix-modes bullet must authorize no parallelism: "parallel where independent" …` at `tests/run.js:3455`. An earlier draft of this assertion used a bare `/parallel/i` match and went red against unmutated HEAD (the bullet legitimately narrates *why* parallel rounds were dropped) — fixed here as a test defect, not by weakening the contract: the check now names the three removed instruction phrases |

| `AC-13b: git-strategy.md "Commit before review" names the reviewer agent-memory it commits, and both *-review workflows name that commit at the step that writes the review file` **(entry 2, new)** | two mutations, one per site, because the acting-site assertions sit behind the rule-site ones in the same body. (a) the memory clause deleted from `git-strategy.md`'s bookkeeping sentence → first failure `AC-13b: the memory class must be named in the list the committer reads …` at `tests/run.js:3332`. (b) `asd-phase-design-review.md`'s write step stripped of `, and the commit carrying that file also carries any agent memory that reviewer authored (…)` → first failure `.asd/workflows/asd-phase-design-review.md: the review-file write step is the acting site …` at `tests/run.js:3341` |
| `AC-4/AC-11/AC-14 …` **(entry 2: `<reviewer>.late.md` bound to the path map)** and `T-2/AC-3 …` **(entry 2: map assertions extended to the same variant)** | mutation: `, <reviewer>.late.md` removed from `artifact-layout.md`'s impl reviews row. First failure in each test: `artifact-layout.md path map must name every review-file variant under impl reviews` at `tests/run.js:3079`, and `artifact-layout.md's impl reviews row must carry the artefact name review-policy.md mandates …` at `tests/run.js:3358`. Both sites on purpose: the map must name the file, and the rule's literal is checked against the map rather than only against itself |
| `T-2/T-4: in each agent-memory directory this sprint writes, MEMORY.md and the files beside it are a bijection …` **(entry 2: generalized in place from the `asd-dev-critical`-only link check)** | mutation: an unindexed `zz_unindexed-probe.md` dropped into `asd-tester-critical/`. First failure: `asd-tester-critical/zz_unindexed-probe.md is written but not indexed by its MEMORY.md …` at `tests/run.js:3140`. The pre-existing forward direction (index → file exists) keeps its own coverage; the reverse direction is new and is the half that fires on a real authoring mistake |
| `AC-7: a root .gitattributes normalizes line endings …` **(entry 2: spawn precondition made legible, testing `T-5`)** | proof by environment rather than by mutation: the whole suite re-run with `PATH` reduced to node's own directory. The probe now fails with `this assertion is the suite's only call to the \`git\` binary and additionally needs a git work tree at … Underlying: spawnSync git ENOENT` at `tests/run.js:3405`, instead of throwing an opaque `ENOENT` with no statement of what is missing. Recorded honestly: three pre-existing external-CLI preflight tests also fail under that stripped `PATH` — this is the only `git`-binary call, not the only PATH-dependent test. Entry 1's limitation still stands unchanged: the index-probe half is not mutation-proven, since proving it means committing a CRLF blob |

| `AC-15: checkpoints.md surfaces a criterion's running cost …` **(entry 3: re-pinned in place, correctness `F-1` test side)** | six mutations, one per assertion, each restored before the next. (a) counter reworded — `checkpoints.md`'s tail → `for iter-NN: findings closed` → first failure `the fix-rounds-charged unit must state the literal it matches decisions-log entries on …` at `tests/run.js:3459`. (b) mode-agnostic clause deleted (` however the mode is named`) → `the tail is mode-agnostic on purpose: the orchestrator really writes "impl review-fix for iter-NN: findings resolved" …` at `:3460`. (c) citation deleted → `checkpoints.md must cite the workflow step that emits the entry it counts …` at `:3463`. (d) **the load-bearing one** — emitter reworded, `asd-phase-impl.md:112` → `"impl fix for iter-NN: all findings resolved and committed"` → `the entry asd-phase-impl.md emits (…) must END WITH the tail checkpoints.md matches on …` at `:3467`. (e) a second emitter added to step 11 → `exactly one place in asd-phase-impl.md may emit the per-iteration fix-round entry …` (`2 !== 1`) at `:3466`. (f) citation renumbered to `step 12` → `checkpoints.md cites step 12 as the emitting SSoT, so the emitting line must sit inside that step …` at `:3470`. Note (d): the reworded emitter still contains the words the old equality check used, so a substring-of-either check would have passed it — containment in the stated direction is what catches it |
| `AC-8: external-review.md "Outcome contract" is the sole home …` **(entry 3: abort carve-out bound, testing `T-1`)** | three mutations. (a) rule half — the sentence `The contract scopes a dispatch that reached that invocation: … aborts the dispatch instead …` deleted from `external-review.md` → first failure `the two-outcome contract is scoped to a dispatch that reached the invocation; drop this carve-out and a missing prompt template returns an availability skip …` at `tests/run.js:3386`. (b) agent half, scoping stripped — the `ABORT` signal line reduced to the bare token → `the acting half of the rule's carve-out: the agent's ABORT must be scoped to the pre-invocation window …` at `:3397`. (c) agent half, citation only — the trailing `` (`external-review.md` "Outcome contract") `` removed and the scoping left intact, so (b)'s assertion still passes and the mutation reaches the next one → `the post-invocation half must stay on the signal line AND cite the contract as its home …` at `:3398`. The agent is read through `sync.readNormalized`, so the assertion is on the `{{wraps_cli}}` placeholder both provider views render, not on either rendered form |
| `AC-4/AC-11/AC-14 …` **(entry 3: latch-clearing route + both review workflows bound, testing `T-2`)** | five mutations. (a) `review-policy.md`'s `any APPROVE latch for that reviewer cleared` → `the reviewer unlatched` → first failure `an admitted late return must clear that reviewer's latch, or it stays dispatch-skipped on the strength of an APPROVE its own admitted evidence just overturned` at `tests/run.js:3367`. (b) the citation removed from `sprint-lifecycle.md`'s Late-return-admission line (`` `review-policy.md` "Late duplicate return" `` → `the review policy`) → `sprint-lifecycle.md "APPROVE latch" is the sole home of latch persistence and claims to name EVERY route that clears it …` at `:3370` — deliberately keyed to the citation, so the dev chain's `A THIRD` → `A further` rename does **not** redden it, which was checked directly. (c) that line's blast-radius clause reduced to `clears that reviewer's latch.` → `the route must state its blast radius …` at `:3371`. (d) `asd-phase-design-review.md`'s step-8a sub-bullet stripped of its `` per `review-policy.md` "Late duplicate return" (sole SSoT `` citation → `.asd/workflows/asd-phase-design-review.md must bind the branch at the step that records verdicts …` at `:3362`. (e) the `<reviewer>.late.md` line deleted from `asd-phase-impl-review.md`'s `Artefacts produced` (design's row left intact, so the loop's first iteration passes and the mutation reaches the second) → `.asd/workflows/asd-phase-impl-review.md must name the late-return file in its Artefacts produced list …` at `:3364` |
| `AC-10: asd-phase-impl.md builds fix modes as one ordered chain …` **(entry 3: round-level serialization bound)** | three mutations, each leaving the entry-1 assertions (the `one ordered chain` presence and the three removed-phrase absences) passing, so each reaches the assertion it aims at. (a) the ordering clause replaced by ` as its own chain.` → first failure `one ordered chain per half is not enough: the two halves must also be ordered against each other …` at `tests/run.js:3481`. (b) only `, so exactly one agent is in flight across the whole round` removed → `the round-level invariant is the reviewable claim …` at `:3482`. (c) step 6's appended scope clause removed, leaving `sequential where dependent; parallel where independent` intact → `the surviving parallelism must be scoped where it is stated: unscoped, the dispatch step reads as authorizing in a fix mode precisely what step 5 forbids …` at `:3486`. (c) is the one that matters for the preserved phrase: the entry-1 assertion that step 6 keeps its parallelism was converted from `lines.some(…)` to a `find` + two assertions, so the phrase's survival and its scoping fail separately and neither hides the other |

| `AC-4/AC-11/AC-14 …` **(entry 4: reach carve-out bound at its SSoT and at both acting bullets, correctness's iter-03 recommendation)** | three mutations, each restored with `git checkout -- <file>` before the next, each run against the whole suite. (a) `, External Review included` deleted from `asd-phase-design-review.md`'s step-8a late-duplicate bullet (the re-narrowing the recommendation predicts) → first failure `.asd/workflows/asd-phase-design-review.md: the acting bullet must restate review-policy.md's reach carve-out on its own line, because the step that encloses it scopes itself "internal reviewers only" …` at `tests/run.js:3366`; 169/171, the co-failure being the expected `upstream_hashes` hash-ledger entry for the mutated file. (b) the same deletion in `asd-phase-impl-review.md` instead, design left intact so the loop's first iteration passes and the mutation is only reachable at the second → same assertion, `impl` variant, `tests/run.js:3366`, 169/171. (c) `, External Review included` deleted from `review-policy.md:144`'s section-scope line → first failure `review-policy.md scopes the whole section to the 4 internal reviewers, so the late-duplicate branch only reaches a replaced External Review dispatch while this carve-out stays attached to it …` at `tests/run.js:3361`, 169/171 — it precedes the loop, so it fires before either workflow assertion, which is the intended order: lose the SSoT and the two mirrors have nothing to mirror. Pre-mutation and post-restore runs were 171/171 in every case |
| `AC-4/AC-11/AC-14 …` **(entry 5: both reach sources bound, and the interrupted/split bullets the iter-04 fix created)** | seven mutations, one per assertion touched, each restored with `git checkout -- <file>` **as the next tool call after reading the failure** — `F-5`'s lesson, taken literally — and each run against the whole suite. The co-failing `release-manifest.json: every upstream_hashes entry matches the actual file` is expected noise for any `managed_paths` file, not a second finding. Line stamps are entry-5 line numbers. (a) `, except where a branch states its own reach` deleted from `review-policy.md:144` → first failure `the section default plus its delegation clause are what make every acting bullet below load-bearing: a branch silent on reach is not unscoped, it inherits the 4-internal-reviewers default …` at `tests/run.js:3362`, 169/171. (b) `imported here whole` → `imported here for the 4 internal reviewers` in `external-review.md:51`, the exact byte state `F-5` left on disk → first failure `external-review.md must hand a non-outcome to review-policy.md "Interrupted dispatch" as a WHOLE import …` at `:3364`, 169/171 — the `AC-8` test stayed green throughout, which is the evidence behind that row's entry-5 note. (c) the whole `- Interrupted dispatch` bullet deleted from `asd-phase-impl-review.md` → in this test `.asd/workflows/asd-phase-impl-review.md: the interrupted branch must be written out as its own bullet at the acting step …` at `:3373`, 168/171 — the third failure is the pre-existing file-level routing test co-firing, discussed in Added tests. (d) that bullet's `— applies to any dispatch, External Review included:` → `— internal reviewers only:` → `… the interrupted bullet must carry its own reach on its own line, for the same reason the late-duplicate bullet does …` at `:3374`, 169/171. (e) the bullet's `per \`external-review.md\` "Outcome contract" (which imports that rule whole)` deleted with the reach left intact, so (d)'s assertion still passes and the mutation reaches the next one → `… the reach and the rule it is derived from must be one sentence …` at `:3375`, 169/171. (f) `Split dispatch — internal reviewers only, per that rule's opening scope` → `Split dispatch — applies to any dispatch, External Review included, per that rule's opening scope` → `… the split bullet must keep the section default stated explicitly …` at `:3377`, 169/171. (g) the reworded late-duplicate message re-proven on its own assertion: `Late duplicate return — applies to any replaced dispatch, External Review included:` → `Late duplicate return:` → `… the acting bullet must state review-policy.md's reach carve-out on the same line as its citation. Reach is delegated to each branch and never inherited from the enclosing step header …` at `:3369`, 169/171. Every workflow mutation was applied to `asd-phase-impl-review.md`, the loop's **second** iteration, so the design pass completes first and the mutation is reachable only at the assertion it aims at. Pre-mutation and post-restore runs were 171/171 in every case, with `git status --porcelain` showing only ` M tests/run.js` after each restore |

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
- Entry 3 opened **1 red**, at `tests/run.js:3444`: `the fix-rounds-charged unit must name the
  decisions-log entry it counts`. Not a code defect, so no `D-N`: it asserted whole-heading equality on
  `impl fix for iter-NN: findings resolved`, the literal correctness `F-1` proved wrong on real data
  and the dev chain deliberately replaced with a stable-tail match. Verified before touching the test —
  `checkpoints.md:31` now matches `for iter-NN: findings resolved` "however the mode is named", and
  `decisions-log.md:104` really reads `impl review-fix for iter-01: findings resolved`, which the old
  literal did not select — then reconciled as a **test defect**: re-pinned to containment (emitter ends
  with counter's tail), which is strictly stronger than the equality it replaced, never weakened
- Entry 3 result: **pass — 171/171 passed, 0 failed, 0 skipped** (171 declarations at entry 3's start,
  minus 0 removed, plus 0 new; four existing tests amended in place, +13 assertions). Test count flat
  while coverage rose is the intended shape here — every finding was an addition to a loop or body that
  already read those files
- Lint: `git diff --cached --check` (`lint` from `commands.yaml`, the staged form Task 9 landed) —
  **clean, exit 0**, no output, run against this entry's own staged paths
- Build: `node .asd/sync.js --check` (`build`) — **`"ok": true`**, 72/72 targets `current`, zero
  non-`current`
- HEAD: entry 3's run verified at `25492b0` plus this entry's own authored files (`tests/run.js`,
  `test-plan.md`); the commit sha carrying them is this tester's own commit, not known at authoring
  time. Nothing else in the worktree changed — every mutation above restored its file byte-for-byte
  (`git checkout -- <file>`, never `sync.js --apply`), confirmed by `git status --porcelain` reporting
  only ` M tests/run.js` after each restore, before the next began. One honest qualification to
  "byte-for-byte": the restore is exact in tracked content (index and HEAD unchanged, status clean),
  but on this Windows worktree `git checkout` re-materialised each mutated file with the LF endings
  `.gitattributes` (`* text=auto eol=lf`, AC-7) now mandates, where several canon files still sat as
  CRLF from before that file landed — `git ls-files --eol` shows the eight mutated files at `w/lf`
  and untouched neighbours such as `README.md` still `w/crlf`. Committed content is identical either
  way, which is precisely what AC-7 bought; `tests/run.js` itself was never checked out, so it stays
  `w/crlf` in the worktree and `i/lf` in the index (the `git add` CRLF warning is that normalization,
  not damage — `git diff --cached --check` is clean and the staged diff is 34 insertions / 5
  deletions, not a whole-file rewrite)
- Entry 4 opened **0 red**: the dev chain's iter-03 fix broke no existing assertion (the citation
  substring both workflow lines are pinned by was kept verbatim, which is why the re-narrowing risk
  above was invisible to the suite in the first place). No `D-N`, and nothing to reconcile
- Entry 4 result: **pass — 171/171 passed, 0 failed, 0 skipped** (171 declarations at entry 4's start,
  minus 0 removed, plus 0 new; one existing test amended in place, +2 assertions net). Entry 4 lint:
  `git diff --cached --check` — **clean, exit 0**, no output, against this entry's own staged paths.
  Entry 4 build: `node .asd/sync.js --check` — **`"ok": true`**, 72/72 targets `current`, zero
  non-`current`. Entry 4 HEAD: `6ae1f7a` plus this entry's own two authored files (`tests/run.js`,
  `test-plan.md`); nothing else in the worktree changed, `git status --porcelain` reporting only
  ` M tests/run.js` after each of the three restores above. Entry 3's qualification to "byte-for-byte"
  does **not** apply here: `git ls-files --eol` shows all three mutated files (`review-policy.md`, both
  `*-review` workflows) already at `w/lf` before the mutations, so `git checkout` re-materialised them
  identically, worktree bytes included. `tests/run.js` itself was again never checked out and stays
  `w/crlf` / `i/lf` (the `git add` CRLF warning is that normalization, not damage — the staged diff is
  5 insertions / 1 deletion, not a whole-file rewrite)
- Entry 5 opened **0 red** of its own. The inherited working tree was red, 169/171, and for one reason:
  `F-5`'s unrestored mutation was still on disk at hand-over — `.asd/rules/external-review.md` carrying
  `imported here for the 4 internal reviewers` against the very assertion that same working tree had
  just added. The orchestrator's restore (`79d3f81`) returns 171/171. Recorded because it corrects the
  severity stated in `F-5`: with both halves on disk the suite was **not** green, and reproducing that
  exact state (proof (b) above) fails 169/171 with the new assertion first in this test — the fail-first
  assertion was itself the tripwire that would have stopped the corrupted canon at the suite gate before
  any commit. What `F-5` cost this entry is proofs, not decisions: all seven mutations were re-run from
  scratch because none of the interrupted run's outputs survived, and every inherited assertion was
  re-derived against source rather than trusted. No decision changed, no assertion was dropped, no `D-N`
- Entry 5 result: **pass — 171/171 passed, 0 failed, 0 skipped** (171 declarations at entry 5's start,
  minus 0 removed, plus 0 new; one existing test amended in place, +6 assertions and 2 messages
  reworded). Entry 5 lint: `git diff --cached --check` — **clean, exit 0**, no output, against this
  entry's own staged paths. Entry 5 build: `node .asd/sync.js --check` — **`"ok": true`**, 72/72 targets
  `current`, zero non-`current`. Entry 5 HEAD: `79d3f81` plus this entry's own two authored files
  (`tests/run.js`, `test-plan.md`). Entry 3's qualification to "byte-for-byte" is narrower here:
  `git ls-files --eol` reports all three mutated canon files (`review-policy.md`, `external-review.md`,
  `asd-phase-impl-review.md`) at `i/lf w/lf` after every restore, and `review-policy.md` and
  `asd-phase-impl-review.md` were already `w/lf` before this entry touched them (entry 4 restored both).
  `external-review.md`'s pre-mutation worktree endings cannot be re-verified from here — the interrupted
  run mutated it and the orchestrator's restore ran before this dispatch began — so the honest claim is
  the tracked one: identical index and HEAD content, with `git status --porcelain` reporting only
  ` M tests/run.js` after each restore. `tests/run.js` itself was never checked out and stays `w/crlf`
  in the worktree, `i/lf` in the index; the `git add` CRLF warning is that normalization, not damage
- **Terminal full-suite gate** (`impl-review` step 9) — the sprint cycle's single **unscoped** full-suite
  run, and the one recorded suite result for this sprint. It supersedes the entry-5 impacted-run record
  above as the verdict; the per-entry records are **kept rather than deleted**, because the `Defects`
  section and three `Added tests` rows cite them as evidence and deleting them would leave those
  citations dangling. Verdict below is the runner's exit code and report, not a summary of it
  - HEAD recorded: **`2ab6b57`** (`chore(sprint): impl-review iter-05, reviewer DoD met`). Worktree
    verified clean before the run — `git status --porcelain --untracked-files=all` empty, so the tree
    exercised is exactly the tree at that commit
  - Command: `node tests/run.js` (`test` from `commands.yaml`), no filter and no impacted subset — the
    full flat runner, every declaration
  - Result: **171/171 passed, 0 failed, 0 skipped. Process exit code 0**
  - Lint: `git diff --cached --check` (`lint`) — **exit 0, no output**, run twice: once with an empty
    index before the suite, and again with this file staged, immediately before the commit that carries it
  - Build: `node .asd/sync.js --check` (`build`) — **`"ok": true`**, 72/72 targets `current`, zero
    non-`current`, exit 0
  - `F-5` canon-restoration check (the interrupted dispatch that left a rule file mutated), read
    directly at this HEAD rather than inferred from the clean status: `external-review.md:51` reads
    `imported here whole` (**not** the `DOC4-1` byte state `imported here for the 4 internal
    reviewers`); `review-policy.md:144` carries both the delegation clause and the late-duplicate
    carve-out; each `*-review` workflow carries all three reach bullets, `Interrupted dispatch` and
    `Late duplicate return` at `External Review included` and `Split dispatch` at `internal reviewers
    only`. `git diff main...HEAD --stat` over `.asd/rules/` and `.asd/workflows/` is 11 files,
    +79/−22 — every one a sprint deliverable, no residual mutation
  - Defects opened by this run: **none**. Nothing red to triage, so no `D-N` row was appended
- Skips: none. No entry was added to `.asd/project/stubs.md`
- Manual steps: none. No plan subtask needed a human-only action

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode.

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

None, in any of the five entries. Every failure seen was a test defect and was fixed here: entry 1's
pre-existing copy-count assertion (rewritten, see Removed/Added) and one over-tight `/parallel/i`
match in a first draft of the AC-10 test (see its proof row); entry 2's single red, the
`--write must persist the same digest just printed` assertion that correctness `F-2`'s fix
invalidated by design (re-pinned, see Added tests and Suite run); entry 3's single red, the
whole-heading `impl fix for iter-NN: findings resolved` equality that correctness `F-1`'s fix
invalidated by design (re-pinned to containment, see Added tests and Suite run); entry 4 opened no
red at all; entry 5's only red was inherited — not its own and not a defect in either code or test
(`F-5`'s unrestored canon mutation, restored at `79d3f81` before this entry began, recorded in Suite
run). No production or
canonical source was modified by this phase in any entry — the mutations below/above were all
restored byte-for-byte.

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|

None. No criterion in this sprint has a visual, third-party-live or ux-feel surface — the whole
change surface is rule prose, one Node module and one repository config file, all of which are
either machine-checkable or explicitly recorded as `none` above.
