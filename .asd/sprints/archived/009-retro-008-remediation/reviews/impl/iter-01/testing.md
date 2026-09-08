[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: low — all severities reported)
- **Method note**: read-only reviewer, no shell. The diff was derived by reading every scoped file directly; no command was run. Run records corroborated structurally, not re-executed: `tests/run.js` carries exactly **170** top-level `test(` declarations, matching the reported `170/170` and the arithmetic `160 − 0 removed + 10 new`. All **12 transcribed first-firing assertions** (`2449`, `3055`, `3270`, `3287`, `3310`, `3330`, `3349`, `3369`, `3373`, `3398`, `3415`, `3424`) resolve to exactly the assertion quoted — strong evidence the mutation runs were performed rather than reconstructed. Hash freshness was not recomputed.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| T-1 | high | `test-plan.md` AC-14 and AC-16 rows; `tests/run.js:3330-3331`; `review-policy.md:150` vs `artifact-layout.md:43-44`, `:68` | Something material went untested, and the `none` reason that waived it is factually wrong. AC-14 introduces `<sprint>/reviews/<phase>/iter-NN/<reviewer>.late.md`; `artifact-layout.md` is the SSoT path map and states the folder's contents are exhaustive, naming only `<reviewer>.md, <reviewer>.part-N.md`. `late.md` appears exactly once in the entire framework, so as shipped the artefact AC-14 mandates is a file the layout contract forbids. The AC-14 test asserts `policy.includes('<reviewer>.late.md')` and stops — it pins the token in one file and never binds it to the map, though this sprint edited `artifact-layout.md` and `tests/run.js:3081-3083` already asserts that map's rows. The AC-16 row waives the mirror class with "no change surface: this sprint touched none of the mirrored facts" — a new sprint-artefact path name IS a mirrored fact. Same two-site coupling the tester tested well for AC-15 and AC-13a, applied here as a one-site presence check. | Add the missing token in the AC-15 idiom: the `<reviewer>.late.md` literal in `review-policy.md` must equal a name carried by `artifact-layout.md`'s reviews rows. It will be red at HEAD — that is the point; the map is the thing to fix in review-fix mode. Correct the AC-16 row's reason. |
| T-2 | medium | `test-plan.md` "Risk → check decisions" (all 15 rows) vs `plan.md:46`, `review-policy.md:42` | **`AC-13b` has no row at all** — neither `add` nor `none`. AC-13 has two halves and Task 2 landed the second as `review-policy.md:42` "Diff reachability"; the table's only AC-13 row is `AC-13a`, and the agent-memory row covers memory content, not this rule paragraph. `code-style.md` §17 requires every criterion to carry a check or an explicitly recorded `none` with reason; an unlisted change is indistinguishable from an overlooked one. Not cosmetic: `review-policy.md:42` assigns the act to "the phase workflow that writes a reviewer's review file", and neither review workflow contains the string `memory` — this sprint's own friction entry `F-3` is the live instance. | Add an explicit AC-13b row. If the honest decision is `none`, say so with a real reason; if `add`, bind the obligation to whichever site the acting agent reads, in the AC-11 idiom. |
| T-3 | low | `tests/run.js:3048-3055` | The restatement regex cannot cross a `.`, so a restatement split over a sentence boundary passes unnoticed — narrower than the assertion message claims. The rewrite itself is sound and strictly wider than the retired copy count, so this is a boundary note, not a weakening. | Loosen the separator class (bound by newline instead of `.`), or state the sentence-scope limit in the assertion message. |
| T-4 | low | `test-plan.md` agent-memory row | The row names `.claude/agent-memory/asd-dev-critical/**` only; the scope also contains `asd-tester-critical/project_testability-envelope.md`, which no row mentions and the cited index-link test does not reach. The decision would be the same, but it is unrecorded. | Widen the row to `.claude/agent-memory/**` or add the second path. |
| T-5 | low | `tests/run.js:3375` | The AC-7 index probe is the suite's only invocation of the `git` binary and additionally requires the suite to run inside a git work tree. In an export/tarball or a `git`-less container it throws `ENOENT` rather than reporting a line-ending verdict. The check itself is right, and the recorded limitation (index-probe half not mutation-proven) is honest and the correct trade. | Keep the probe; catch the spawn failure and fail with a message naming the requirement. |
| T-6 | low | `test-plan.md` Entry log (`HEAD analysed 5e7451b`) vs Suite run (`verified at aae30d1`) | Two different HEAD stamps in one entry with no stated relation, so a reader cannot confirm the analysed surface and the exercised tree are the same. The green run is otherwise well corroborated. | State the relation in the Suite-run bullet, or stamp one HEAD for both. |

## Verified without finding

- **Check-ladder fit** is right throughout: executable behaviour got unit + CLI-contract tests; every rule/prose coupling got the cheapest static check. No e2e, nothing above its risk level.
- **Fail-first proofs** are the strongest part of this entry: twelve targeted mutations, each naming the assertion that fired first, each line verified. The two recorded limitations are honest — AC-7's index probe (unprovable without rewriting the index) and the AC-12 mutation that touched only Task 2 and was correctly NOT caught. Recording a mutation that failed to fire is exactly the discipline the rubric wants. The `managed_paths` hash co-failure is correctly identified as mutation artefact.
- **The `T-2` rewrite did not weaken.** `tests/run.js:3039-3057` replaces `totalMatches === 4` with owner-existence + mode-independence + sole-ownership + owner-self-cleanliness + per-citer checks over all three citers. Strictly wider, property-keyed rather than count-keyed. Classifying it as a rewrite rather than a removal is correct; the removal gate genuinely did not fire.
- **The rejected recommendation was rejected correctly.** `routeTask` takes a structured object and contains no plan-file parser; the `Material risk` extraction is the orchestrator's. Verifying a proposed check against source before transcribing it is "Verify before applying" applied to this reviewer's own advice.
- **The other four `none` decisions are honest.** AC-9 is manifest-authorized; AC-16/`release-manifest.json` is covered by `tests/run.js:1930`; the agent-memory index-link claim resolves to a live test; AC-18 is understated in the tester's favour — `tests/run.js:969-979` already runs `sync.js --check` in-suite and rejects any non-`current` item.
- **AC-5 edge coverage is genuinely thorough**: absent `vocabulary`, divergent `vocabulary` with a recomputed digest (the case the digest check alone can never catch), foreign statuses per row type, missing and stray `p`/`f`, and the widening probe proving the validator reads the constant. Identity preservation proven at `:2438`/`:2444`, byte-idempotency at `:2451`.
- **Determinism / isolation**: the constant mutation at `:3267-3275` saves, restores in `finally` and asserts restoration. No sleep, clock, randomness or cross-test state in §20.
- **Over-tight wording**: handled well — the tester caught its own `/parallel/i` over-match during authoring and fixed it by naming the three removed phrases rather than weakening the contract, keeping the positive assertion so both directions of the mistake fail.
- **Suite / lint / build record** is internally consistent with `commands.yaml`. The impacted→full degradation via the safety valve is correctly justified.
- **Stub resolution**: `stubs.md` holds no rows and no sprint-009 TODO marker exists — the `n/a` predicate holds. **Manual verification**: correctly `none` — the surface is rule prose, one Node module and one config file.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `validate-ledger` → `{"ok":true}`. 21/21 files, 18/18 rules, 5/5 sections resolved; `ac-9`, `stub-resolution` and `manual-verification` n/a on their manifest-authorized predicates.

## Verdict

CONCERNS: 6 (1 high, 1 medium, 4 low)

## Next action

Route to `impl` review-fix mode. Two groups, no dependency between them:

- **`tests/run.js` §20 edits** (T-1, T-3, T-5): bind the `<reviewer>.late.md` literal to `artifact-layout.md`'s reviews rows in the AC-15 cross-file idiom — expect it red at HEAD, then fix the map; widen the AC-13a restatement separator; make the `git ls-files --eol` precondition fail legibly.
- **`test-plan.md` decision-record edits** (T-1's AC-16 reason, T-2, T-4, T-6): add the AC-13b row with an honest decision, correct the AC-16 `none` reason, widen the agent-memory row, reconcile the two HEAD stamps. Where a `none` still stands after restatement it stands — the requirement is an honest reason, not a new test.

## Escalations

None. No concept, contract or scope change is implied.
