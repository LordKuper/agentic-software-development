[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium — low findings dropped)
- **Scope**: incremental diff of the iteration-1 review fixes, 12 files

Method note: read-only reviewer with no shell, so the diff was read from the files. The suite record is corroborated structurally — `tests/run.js` holds 137 top-level `test(` declarations, matching the recorded 137/137, and entry 2's arithmetic (132, then 133 after the migration rewrite, plus 4) is internally consistent. Ledger freshness checked structurally: the retro skill's `canon_hashes` and `upstream_hashes` entries carry identical hex, so the re-render was not hand-patched.

## What holds up

**Fail-first proofs — verified plausible and, in most cases, verbatim-consistent with the current test source.** Each recorded first-failure message matches an assertion string at the position the mutation would reach first: the CRLF mutation reaches the byte-for-byte assertion; the presence-guard mutation reaches the final-member assertion; the nested-key test against the restored pre-fix scanner reaches the `stripped` assertion; deleting the stdout warning reaches its capture assertion; the three chain mutations reach `retro must be in the chain` before the bijection assertion, which is exactly the correction iteration 1 forced; the three README mutations and the three template mutations each reach the assertion the record credits. The stdout stub's save and restore sit in a `finally`, satisfying the global-state rule.

**Risk-to-check fit**: every added check is on the cheapest rung — static and structural assertions on tracked files, unit tests on the one executable artifact. Nothing reached for a heavier rung; no DOM harness, no new dependency, no infrastructure.

**The archived-untouched caveat is correct and honestly disclosed**: with the path helper listing only direct children, removing the archive guard changes nothing observable, so the assertion is genuinely unprovable today. Recording that rather than claiming a proof is the right call.

**The AC-9 `none` is defensible**: any assertion coupling the migration filename to `asd_version` would have to be red at `impl-test`, since the manifest is still at the pre-bump version and the bump is `pr`-owned with its own blocking DoD item. Recorded as an open owned precondition, not silence.

**Determinism**: no sleeps, clocks, randomness or ordering reliance; the reverse-manifest walk covers only stable canon trees, never a volatile one, so it cannot flake. No removals to justify and no defects to regress. Stub-resolution verification passes — no stub closed this sprint, and every `TODO(sprint-` hit repo-wide is prose describing the marker format. The three manual rows are correctly last-resort (visual rendering and UX feel, no oracle), their automatable halves were extracted into assertions, and none is due before `retro`.

## Findings

| # | Sev | Location | Description | Failure scenario |
|---|---|---|---|---|
| TST2-01 | medium | `test-plan.md:41` (friction-append reference row); code at `asd-phase-impl.md:16`, `asd-phase-audit.md:8`, `asd-phase-retro.md:12` and eight more | The `none` decision is not honest for the risk it itself names. The row's risk is "a workflow that never appends", but its reason argues only against two things nobody would automate — whether a running agent actually appends, and whether the line references rather than restates. The presence half is a plan-mandated invariant carried today by all eleven workflows as one stable literal token. AC-2 currently has zero automated coverage. | A twelfth phase workflow is authored next sprint exactly as the retro workflow was this one, or a workflow file is reverted to a pre-sprint revision. That phase silently never records friction, the log the retro phase analyses is partial, and the whole suite stays green. Cheapest rung, zero new infrastructure: one substring assertion inside the loop that already reads every workflow source. This is the same correction iteration 1 forced for the `NEXT:` tokens, where "prose with no executable surface" was also false. |
| TST2-02 | medium | `test-plan.md:35` (blanket rule-docs and README `none`); sites `AGENTS.md:70`, `AGENTS.md:107`, `asd-sprint/SKILL.md:47` | The `none` reason overstates completeness: it claims every chain-derived slice is now asserted and what remains is genuinely prose. It is not. `AGENTS.md:70` carries the phase-count word and the ordered tail enumeration — the identical literal class the new README test asserts — and `AGENTS.md:107` explicitly declares the sprint skill and the phase-skill descriptions to be chain-assertion sites. The drift is demonstrated, not hypothetical: `AGENTS.md` sat at a stale "ten phases" through impl and iteration 1 and was corrected only by a review-fix commit — a human found it, and the assertion authored in response covers README while leaving the file that actually drifted unasserted. | A later sprint adds or removes a phase, updates `PHASE_CHAIN`, the workflows, `core.md`, `checkpoints.md` and README — all asserted, all green — and misses `AGENTS.md:70`. The file every agent loads first as project instructions then describes a workflow that no longer exists, and the sprint skill's restated routing contract can go stale independently of the workflow tokens the new test reads. Closing the primary site costs one extra read against the existing count-word assertion. |

Below floor, listed once, no action required: the TOC threshold constant in the tests duplicates the value owned by `artifact-layout.md` rather than deriving it; the entry-2 record for one chain mutation does not name its first-failing assertion as the iteration-1 correction requires; the trailing-comma risk wording in `test-plan.md` is stale relative to the rewritten implementation.

## Verdict

CONCERNS: 2 (both medium). Both are `none`-decision honesty and coverage gaps closable by two assertions inside loops that already exist. No test-quality, determinism, implementation-coupling or fail-first-proof defect found; the rewritten migration tests and the four new assertions are meaningful, deterministic, correctly attributed and on the right ladder rung. Entry 2's record is honest about scope and about what remains unverified, except for the exhaustiveness claim in TST2-02.

## Next action

Route to `impl` review-fix mode. No manual-verification result is requested — every specified row is executable only at `retro`, downstream of this gate.

## Escalations

None.

## Coverage ledger

```json
{"manifest_digest":null,"findings":["TST2-01","TST2-02"],
"files":[{"i":".asd/migrations/6.0.0.js","s":"checked"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked","f":"TST2-01"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked","f":"TST2-01"},{"i":"AGENTS.md","s":"checked","f":"TST2-02"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],
"rules":[{"i":"RS-1-check-ladder-risk-fit","s":"pass"},{"i":"RS-2-removal-reason-validity","s":"n/a","p":"no test removed this entry"},{"i":"RS-3-no-test-decision-honesty","s":"finding","f":["TST2-01","TST2-02"]},{"i":"RS-4-fail-first-regression-proof","s":"pass"},{"i":"RS-5-meaningfulness-and-determinism","s":"pass"},{"i":"COV-1-ac-coverage-AC-1..AC-10","s":"finding","f":"TST2-01"},{"i":"EDGE-1-edge-cases-on-core-paths","s":"pass"},{"i":"STUB-1-stub-resolution-verification","s":"pass"},{"i":"MAN-1-manual-verification-necessity","s":"pass"},{"i":"SUITE-1-suite-run-record","s":"pass"}],
"sections":[{"i":"test-plan/risk-check-decisions","s":"reviewed"},{"i":"test-plan/removed-tests","s":"reviewed"},{"i":"test-plan/added-tests","s":"reviewed"},{"i":"test-plan/suite-run","s":"reviewed"},{"i":"test-plan/defects","s":"reviewed"},{"i":"test-plan/manual-verification","s":"reviewed"}],
"acs":[{"ac":"AC-1","s":"covered-partial"},{"ac":"AC-2","s":"uncovered","f":"TST2-01"},{"ac":"AC-3","s":"covered"},{"ac":"AC-4","s":"covered"},{"ac":"AC-5","s":"covered"},{"ac":"AC-6","s":"covered"},{"ac":"AC-7","s":"covered"},{"ac":"AC-8","s":"covered-partial","f":"TST2-02"},{"ac":"AC-9","s":"covered-partial"},{"ac":"AC-10","s":"covered"}]}
```
