---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 035-verification-hardening

Entry 1's rows rotated to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`.

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 4278709f | full change surface |
| 2 | 7a05ae53 | delta since entry 1 |
| 3 | 113e3066 | delta since entry 2 (review-fix 8d64971b, 4f96c54e) |
| 4 | 87c3a502 | delta since entry 3 (review-fix 68c1bcbe) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `isCommentOnlyChange(file, changed, readBlob)` and `patchChangedLines`: c-family lines classified by lexing the blob of their side, `{side, number, text}` entries, hash/dash families keep the line-text rule, an absent blob reads as code (AC-15, review-fix combined-1, user answer: keep AC-15) | the entry-3 test called the old `(file, lines)` signature and pinned block-comment lines as code (test defect against the decided rule); a real JSDoc edit clearing the latch, or a `*`-led code line, code after `*/` or `//` in a string read as a comment (stale latch, the unsafe direction) | unit: the exported function with a blob reader, plus one `latch-refresh` sandbox round per side and per case (`patchChangedLines` is unexported, covered through the CLI) | adapt + add | the old asserts move to the entry shape; added: multi-line opener/body/closer, a lone body line, `*` continuation with no block, css `* { … }`, css `//`, code after `*/` (lines before it stay comment), `//` in a string and in a multi-line template literal, `-` side judged in the base blob, an absent blob, plus the CLI rounds: JSDoc body edit, opener/closer edit and body-line deletion keep the latch, a `* c` continuation and a code edit beside the comment clear it |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test in the delta is redundant or implementation-coupled | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-035 AC-15: a changed file counts as code unless … (re-authored on the blob-backed signature, plus the `src/doc.js` fixture in `LATCH_BASE_FILES`) | fail-first on the pre-fix tree (`git archive 68c1bcbe~1`, new `tests/run.js` copied in): `node tests/run.js --filter "sprint-035 AC-15: a changed file"` → exit 1, that test (1 matched), `AC-15: editing the body of a multi-line block comment leaves the latch` (pre-fix: latch cleared); per-assert mutations on a HEAD copy of `.asd/runtime.js`, same filter → exit 1, 1 matched: `commentOnlyLines` always reads the `+` blob → `AC-15: removing a code line while adding a comment is code`; string state never entered → `AC-15: `//` inside a multi-line template literal is code`; css `hasLineComments` forced true → `AC-15: css has no line comments`; comment-only gate ignoring code (`hasComment` alone) → `AC-15: a one-line block comment with trailing code is code`; reword control (css-rule message reworded) → exit 0, 1 matched; green on HEAD, exit 0; runs: 4 |

## Suite run

- Command: `node tests/run.js`
- Scope: full — safety valve (framework-wide files changed): every test file ran with no filter
- Result: pass — 391/391 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` and `node .asd/sync.js --check` (exit 0)
- HEAD: 982c54f335f823130c222e0709064e846444e02f

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None: every AC is covered by an automated check.
