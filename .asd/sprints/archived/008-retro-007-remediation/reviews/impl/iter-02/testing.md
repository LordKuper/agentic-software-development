[REVIEW-impl-testing]: CONCERNS
Interrupted attempts: 1 (session rate limit); 1 rejected ledger (invalid row statuses), re-dispatched fresh in this iteration

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium)
- **Method note**: read-only, no shell. `tests/run.js` count corroborated statically at 150 top-level `test(` declarations. Hash-ledger freshness corroborated structurally (§6b recomputes every recorded entry against its file), not re-hashed here.

## Findings

| # | Severity | Location | Description | Required action |
|---|---|---|---|---|
| T-1 | high | `test-plan.md:43` (C-6 row) · `.asd/workflows/asd-phase-impl-review.md:74` vs `.asd/rules/sprint-lifecycle.md:316` | The `derived_handoff.head` redefinition row is decided `keep`, citing "existing AC-11 SSoT-mirror + hook tests" as its check. Those three tests each cover a different contract (`t_state.json` ships `{}`; the hook ignores the key; the *object literal* is not restated in the two workflows) — none asserts anything about how `head` is derived, so the row cites unrelated existing tests as coverage for the risk it names in its own risk column. That risk **materialised inside this same diff**: `sprint-lifecycle.md:316` defines `head` as `git log -1 --format=%H <base>..HEAD -- <pathspec>`, "never raw `HEAD`", while the newly added step 13 writes `head` = `git rev-parse HEAD` *after* the exit bookkeeping commit. A next-phase reader deriving `head` per the rule never matches, so the cross-phase cache is dead on arrival. The suite is green through this, and the AC-11 mirror test at `tests/run.js:3008` is precisely the guard that should have caught it — its assertion set does not reach the `head` formula. The same round *removed* equivalent raw-`HEAD` wording from `asd-phase-impl-test.md`, so one workflow was corrected and the other reintroduced it. | Extend AC-11 coverage so the `head` derivation, not just the object literal, is pinned to its single SSoT: a workflow stating a `head` value at all must be caught when it disagrees with `sprint-lifecycle.md` "State recovery". Record the resulting workflow correction as a defect row — `Defects: None` is currently inaccurate for this surface. |
| T-2 | high | `test-plan.md:20-44` (Risk → check decisions table) | Five of nineteen scoped files have **no row at all**: `.asd/rules/external-review.md` (both hunks), `t_prompt-external-impl.md`, `.asd/templates/t_review.md` (new `Interrupted attempts:` line + split-form comments), `AGENTS.md`, `README.md` (three hunks). Two further in-scope hunks are unrowed inside rowed files: `artifact-layout.md`'s path-map `<reviewer>.part-N.md` addition plus the coverage-evidence sentence (its only row is scoped to "Agent memory", and that row's justification "`sync.js` itself is untouched by this diff" is now false at entry-3 HEAD), and `sprint-lifecycle.md`'s change-surface line. The `.claude/agent-memory/**`-not-excluded change is a **four-file prose mirror** governing what every future External Review even sees; the repo already machine-checks exactly this class at `tests/run.js:2031`, so "prose, nothing to check" is not available as a reason. AC-5's wording fix is rowed for two files though the identical edit landed in five more. | Add a row per unrowed change (`add`/`none`/`keep` with a reason that survives §17), and make the agent-memory/exclude-paths mirror a decided item — either an assertion in the style already at `tests/run.js:2031`, or a `none` whose reason engages with the fact that the mirror is machine-checkable here. |
| T-3 | medium | `test-plan.md:28`, `:31`, `:32` (AC-3, AC-2, AC-7 rows) | Three `none` decisions rest on "prose-only … no dispatcher/loader exists in this repo's Node code to exercise". That misstates the risk: these ACs are *statement-durability* contracts, whose failure mode is a later edit deleting or reversing the sentence — exactly what this sprint exists to prevent. That failure mode is machine-checkable at the cheapest rung, and this very sprint accepted such a check for AC-6 (`tests/run.js:3022-3025` asserts two sentences exist in `review-policy.md`). Same shape, opposite decision, no reason given for the asymmetry. The honest reason, if the decision stands, is a value judgement about single-site presence greps — not "there is nothing for a Node test to call", which the suite contradicts. | Either extend the AC-6-style statement check to AC-2/AC-3 and AC-7's checklist pointer, or rewrite the three reasons so the `none` rests on the real argument rather than on a false claim about what is testable here. |
| T-4 | medium | `test-plan.md:86` (Suite run); no table row for AC-14 | AC-14 ("no generated view left stale") has no row and no automated check: `sync.runCheck` is called only on temp mini-repos, never on `REPO_ROOT`. Its sole evidence is a self-reported `--check` result recorded in prose. The suite's real-repo invariant tests (canon_hashes, upstream_hashes, reverse coverage) show this class of assertion is established and deterministic here, and the sprint's own C-1 risk text names "a stale generated view hiding behind a green ledger" as the hazard — the new guard closes only the *empty* target list; a partial `--apply` target list still refreshes both ledgers whole-repo while leaving another view stale, and the suite stays green. | Add an AC-14 row and cover the invariant at the level the repo already uses for the ledgers, or record `none` with a reason acknowledging that a partial-target `--apply` leaves the gap open. |

Dropped below floor: 3 `low` findings (not listed).

## Checked clean

- **New executable coverage is sound.** The bare-`--apply` CLI test reaches the guard for real — `findRepoRoot` resolves on the presence of `.asd/`, which `makeMiniRepo` creates — and without the guard all five assertions flip. The reserved-class test exercises the normalization in both directions: `SECURITY`, `public-contract`, `public_contract`, `Workflow  Gate` all throw, while `security-audit-tool` and `config-file` do not, so the over-match hazard is genuinely pinned; `{name:'security', target:'change'}` proves no over-rejection.
- **The removal is justified and unpins nothing.** All four deleted lines compared hand-written literals against themselves — `buildManifest` returns the caller's own `rules`/`sections` array objects, so `half1.rules` vs `whole.rules` compared an array with itself. Removal rather than reformulation is correct: no partitioner exists to make the halves an output. The surviving assertions do exercise `validateCoverageLedger`. The union property was unpinned prose before this diff and remains so, which the record states honestly.
- **AC-4's `n/a` predicate verified**: the two existing assertions really do cover the unmatched-`--apply`-target fail-closed behaviour twice.
- **The release-manifest `none` is honest**: §6b recomputes each recorded hash against the actual file.
- **Determinism** across the sprint's 14 added tests: fresh temp roots per test, no shared mutable state, no order dependence, no live `state.json` read, no wall-clock or network. The anchor added at `tests/run.js:3005` closes the vacuity risk in the three-way hook equality.
- **Stub resolution**: `stubs.md` empty, no `TODO(sprint-008-...)` marker anywhere in scope. **Manual verification**: correctly declared unnecessary.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against immutable manifest [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 19/19 files, 14/14 rules, 5/5 sections resolved.

## Verdict

CONCERNS: 4 (2 high, 2 medium)

## Next action

Route to impl review-fix mode for T-1's workflow/SSoT reconciliation, then to impl-test for the `test-plan.md` decision-record corrections and any added coverage.

## Escalations

None.
