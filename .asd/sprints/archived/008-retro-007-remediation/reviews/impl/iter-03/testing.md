[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — `low` and `medium` dropped)
- **Ledger note**: the returned ledger carried finding ids on `files` rows, which the validator rejects (`f` is allowed only on a `finding` row, and `files` rows may only be `checked`/`n/a`). The orchestrator normalized the file-row encoding without altering any coverage claim — every file, rule and section the reviewer resolved is recorded exactly as resolved — and recorded the normalization in the decisions log. Same cause as the iteration-2 rejection: friction log F-5. Findings C-3 and D-2 name the durable memory statement that teaches the wrong rule.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| T-1 | high | `test-plan.md:46` (`derived_handoff` wiring row, decision `keep`); `tests/run.js:3008-3020`, `:3070-3076` | The `keep` claims the wiring risk is "already covered by the dedicated AC-11 SSoT row above", but that test asserts only three things: the shape literal exists in `sprint-lifecycle.md`, each workflow mentions `derived_handoff`, and each carries the citation phrase while not inlining the object literal. It cannot fail on the wiring statement itself — and the wiring is exactly what changed this round: the rule became "Written once per phase … at phase exit", impl-review step 2's write was deleted and step 13 rewritten, impl-test step 2 became "no write here", and the artefacts line dropped "steps 2 and 10". Nothing in the suite fails if a workflow again states a write count or timing that contradicts the rule. The one guard that targets contradiction, `:3070`, matches the backticked-assignment shape that shipped and any variant of it, but not the same contradiction phrased as prose. So the AC-11 contradiction class is guarded against one syntactic shape while the record asserts broader coverage. Materiality is established by the sprint's own `Defects` row D-1: this is the class that already shipped green here. | Either extend AC-11 coverage so a workflow-side statement about *when or how often* `derived_handoff` is written, and any workflow-side definition of `head`, fails when it diverges from `sprint-lifecycle.md` "State recovery" — keying on the semantic contradiction, not the one literal that shipped — or change the row from `keep` to an honest `none`/`add` stating plainly that the wiring statement is unguarded and why. Do not leave a `keep` citing a test that cannot fail on the named risk. |
| T-2 | high | `test-plan.md:18` (Entry 5 scope line) and the risk→check table; the three `.claude/agent-memory/**` scope files | Three of the fifteen scoped files carry no risk→check row at all. The only row naming `.claude/agent-memory/**` is about the *statements in other files* that declare the tree not-excluded — not about these files' own changed content (one new memory file, one index line, one rewritten memory file). Entry 5 characterises the residual delta as "bookkeeping-only", which does not account for them. This is the same record-completeness class entry 4 already remediated once, and it lands precisely on the scope widening this sprint shipped. The content risk is real: the reviewer-testing memory makes checkable factual claims about `tests/run.js`, and iteration 3 found several of them false. | Add a row per changed agent-memory file. An explicit `none` with a reason (hand-authored agent guidance, no scripted consumer, statement accuracy verified by read) is fully acceptable — the defect is the silence, not the absence of a test. Also correct Entry 5's scope line so the entry log matches what the delta actually contained. |

Dropped below floor: 6 findings (5 medium, 1 low) — exact-count pinning in two mirror tests, one mirror assertion coupling the framework suite to `.asd/project/**`, one `none` reason contradicted by a test added in the same round, and one recorded-residual prose↔code mirror.

## Verified clean

- Suite-run record corroborated: `tests/run.js` carries exactly 156 top-level `test(` declarations, matching the reported 156/156 and the stated arithmetic.
- Hash-ledger freshness corroborated structurally: every re-hashed file carries identical hex in both maps where both apply, so no partial re-render desync is visible.
- **AC-14's `keep` verified rather than assumed**: `tests/run.js:969` really does run `--check` as a subprocess with `cwd: REPO_ROOT`, asserts `ok:true`, re-enumerates expected targets from disk, and asserts `drifted` is empty with no narrowing exemption. The row's claim stands, including its honest note that the partial-`--apply` concern is an `update.js`-consumer classification issue, not a hole in this repo's `--check`.
- The four removed assertions are a valid removal: they compared hand-written literal arrays against themselves and could not fail on any source change.
- Fail-first proofs: each of the seven added or extended checks names a specific pre-fix commit and a defect shape consistent with the diff. `Defects` D-1 is correctly `fixed` — the inline formula is gone at HEAD and the guard passes.
- Edge cases on the real risk paths are present: `routeTask` covers malformed shapes, precedence boundaries, clamp non-firing, normalization *and* the negative over-match case; `validateCoverageLedger` covers the incomplete-files rejection; the hook fixture covers absent/well-formed/malformed and is anchored so the three-way equality is not vacuous.
- Determinism: all 20 sprint-added tests are file reads, pure-function calls, or subprocess runs on fixed fixtures — no sleeps, clocks, randomness or order coupling.
- Stub-resolution `n/a` verified: `stubs.md` is empty and every `TODO(sprint-` hit repo-wide is prose describing the marker format. Manual verification `n/a` correct.

## Coverage

Validated compact ledger: [`testing.ledger.json`](./testing.ledger.json) against [`testing.manifest.json`](./testing.manifest.json), findings [`testing.findings.json`](./testing.findings.json). `validate-ledger` → `{"ok":true}` after the file-row normalization noted above. 15/15 files, 14/14 rules, 5/5 sections.

## Verdict

CONCERNS: 2 (both high)

## Next action

Route T-1 and T-2 to impl-test — both are test-record and coverage work, not code fixes. No code defect found; the implementation passes 156/156 and D-1 stays correctly `fixed`.

## Escalations

None. Non-blocking note for the orchestrator: `feedback_no-shell-review-method.md` asserts there is no in-suite `--check` test against the repo root and that a stale generated view is invisible to `node tests/run.js`. Both are false at HEAD (`tests/run.js:969-996`). That stale memory nearly produced a wrong finding against the AC-14 row this iteration.
