# Test plan segment — sprint 035-verification-hardening, entry 2

Rotated from `test-plan.md` at entry 3's strategy pass; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `isCommentOnlyChange` `*`-led lines (AC-15, review-fix combined-1) | a css rule or a continued expression opening with `*` read as a comment body, so a code change keeps a stale latch (unsafe direction) | unit: the exported function | add | extends the entry-1 family-edge test with the css `* { … }` rule, a `*`-led code line with no block edge, and body lines beside a closing edge; the CLI path is already covered by the entry-1 latch scenarios |
| `context --base-ref` omitting a ref whose granted section is absent at the base ref (AC-16, review-fix combined-2) | a file present at the ref but lacking a section the role is granted failing the whole bundle, or the section silently kept from the working tree | component: sandbox repo whose committed `review-policy.md` lacks one granted heading | add | extends the entry-1 sandbox with one more commit; asserts exit 0, the stderr note naming the section, that section's marker gone and a sibling section kept |
| smoke-fail routing: base `asd-tester` appends the `D-N`, the runner never does (AC-3, review-fix combined-5) | step 10 and the runner variant contradicting each other on who triages | content contract | none | prose with no literal beyond the `none (smoke)` token and the `Smoke:` line the entry-1 AC-3 test pins; a pin on the routing clause would restate prose |
| `suite` op scope attr cites its home (AC-10, review-fix combined-4) | attr values or the tester duty drifting from the Suite run Scope values | content contract | keep | the `sprint-035 AC-10` test added in the review-fix already pins both lists and the citation; it is in the delta, not re-authored |
| tech-reference `gh` create, `git` merge-base and rev-parse notes; `asd-phase-impl-review.md` step 7b title-strip citation; `release-manifest.json` hash refresh (AC-5, AC-13) | prose and generated ledger with no behaviour beyond what the runtime-subcommand, canon-hash and D13 checks already cover | existing checks | none | the full suite's manifest-hash, README-mirror and load-ceiling checks cover them; a literal pin would only restate prose |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test in the delta is redundant or implementation-coupled | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-035 AC-15: a changed file counts as code unless … (extended: css `*` rule, `*`-led code line, body beside a closing edge) | fail-first on the pre-fix tree (`git archive f7dbf397~1`, new `tests/run.js` copied in): `node tests/run.js --filter "AC-15: a changed file counts as code"` → exit 1, that test (1 matched), `AC-15: a css universal-selector rule is code, not a comment body`; green on HEAD, exit 0; runs: 1 |
| tests/run.js: sprint-035 AC-16: --base-ref reads each reviewer rubric … (extended: a granted section absent at the ref) | fail-first on the pre-fix tree (`git archive 1723e052~1`, new `tests/run.js` copied in): `node tests/run.js --filter "sprint-035 AC-16"` → exit 1, that test (1 matched), `AC-16: a section absent at the ref omits that ref instead of failing the bundle`; green on HEAD, exit 0; runs: 1 |
