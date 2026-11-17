# Test plan segment — sprint 035-verification-hardening, entry 3

Rotated from `test-plan.md` at entry 4's strategy pass; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `isCommentOnlyChange` decided rule: `*`-led lines never comments, block-edge gate removed, only a self-closed one-line `/* … */` with no trailing code is a block comment, css/scss/less merged into the c-family (AC-15, review-fix combined-1) | the entry-2 test still asserted the superseded block-body rule (test defect); a multi-line block comment or `* x` continuation read as a comment keeps a stale latch (unsafe direction) | unit: the exported function | adapt | the block-comment asserts now state the decided rule: an unclosed `/* open` line and `* text` body lines are code, a self-closed `/* … */` is a comment, trailing code after it is code, plus the reviewer's pair `['/* note */', '  * height;']` on `.java`; AC-15's guard (a doubtful change keeps counting as code) is unchanged |
| `context --base-ref` `sectionAbsent` through `markdownHeadings`, no try/catch (AC-16, review-fix combined-2) | a duplicated granted heading at the ref read as "absent" and silently omitted instead of failing the bundle, which the old catch-all did | component: sandbox repo, committed `review-policy.md` with the granted heading twice | add | the absent-section assert from entry 2 stays green through the rewrite but cannot tell absent from duplicated; one more commit in the same sandbox asserts non-zero exit, the `2 matches` error and no omission note for the section |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test in the delta is redundant or implementation-coupled | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-035 AC-15: a changed file counts as code unless … (adapted: unclosed `/*` line, self-closed `/* … */`, trailing code, java pair, `*` body beside a closing edge) | fail-first on the pre-fix tree (`git archive 8d64971b~1`, new `tests/run.js` copied in): `node tests/run.js --filter "AC-15: a changed file counts as code"` → exit 1, that test (1 matched), `AC-15: an unclosed block-comment opening line is code`; per-assert mutations on a HEAD copy, each `--filter "AC-15: a changed file counts as code"` → exit 1, 1 matched: `/*`-start accepted as comment → `AC-15: an unclosed block-comment opening line is code`; `*`-start accepted → `AC-15: a self-closed comment beside a \`*\`-led code line is code`; `$` anchor dropped from the block-comment regex → `AC-15: a one-line block comment with trailing code is code`; self-closed clause dropped → `AC-15: a self-closed one-line block comment is a comment`; reword control (unclosed-line message reworded) → exit 0, 1 matched; green on HEAD, exit 0; runs: 6 |
| tests/run.js: sprint-035 AC-16: --base-ref reads each reviewer rubric … (extended: a granted heading duplicated at the ref) | fail-first on the pre-fix tree (`git archive 4f96c54e~1`, new `tests/run.js` copied in): `node tests/run.js --filter "sprint-035 AC-16"` → exit 1, that test (1 matched), `AC-16: a granted heading present twice at the ref fails the bundle, it is not read as absent` (pre-fix: status 0, heading omitted); green on HEAD, exit 0; runs: 1 |
