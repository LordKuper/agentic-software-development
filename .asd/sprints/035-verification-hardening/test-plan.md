---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 035-verification-hardening

Entry 1's rows rotated to `test-plan.entry-01.md`, entry 2's to `test-plan.entry-02.md`, entry 3's to `test-plan.entry-03.md`, entry 4's to `test-plan.entry-04.md`.

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 4278709f | full change surface |
| 2 | 7a05ae53 | delta since entry 1 |
| 3 | 113e3066 | delta since entry 2 (review-fix 8d64971b, 4f96c54e) |
| 4 | 87c3a502 | delta since entry 3 (review-fix 68c1bcbe) |
| 5 | d035fb54 | delta since entry 4 (review-fix 260aa5cd) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `isCommentOnlyChange(file, readBlob)`: a changed file is comment-only when its base and head blobs differ yet `projectExecutable` (comments, line-end whitespace outside strings and lines left empty outside a string removed; stop rule at an unterminated `'`/`"` string or a block opened after code) gives the same text; an absent blob, an unknown extension and identical text are code; `patchChangedLines` deleted (AC-15, review-fix combined-1, external-1, external-2) | the entry-4 test called the superseded `(file, changedLines, readBlob)` signature (test defect); real misreads in the unsafe direction, code counted as a comment and a stale latch kept: a regex holding `\/*`, a Kotlin multi-line string holding `//` or `/*`, a comment-boundary shift `/*a*/ x(); /*b*/` to `/*a x(); b*/` that comments out unchanged code, a blank line added inside a template literal, a `#` line changed inside a Python `"""` string | unit: the exported function over base/head blob pairs, one table of comment-only pairs and one of code pairs judged together so a failure lists every misjudged change; the `latch-refresh` sandbox rounds stay (per-side line rules do not apply to them, the cases hold under projection equality) | adapt + add | the `-`/`+`-side, absent-blob-text and `neverRead` asserts belong to the deleted per-line rules and are gone; added the five reviewer repros, the kept comment-only cases (JSDoc body, opener and closer, whole-line `//`, `#`, `--`, trailing `// n`, blank line outside strings, css block) and the code guards (shebang, `http://` after `:`, css `//`, `*`-led continuation, mixed hunk, unknown extension, added and deleted file, identical text) |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test in the delta is redundant or implementation-coupled | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-035 AC-15: a changed file counts as code unless its executable projection is unchanged … (re-authored on `isCommentOnlyChange(file, readBlob)`, comment-only and code tables of base/head pairs) | fail-first on the pre-fix tree (`git archive 260aa5cd~1`, new `tests/run.js` copied in): `node tests/run.js --filter "sprint-035 AC-15: a changed file"` → exit 1, that test (1 matched), `TypeError: changed.every is not a function` (the old `(file, changedLines, readBlob)` signature; this shows the test targets the new shape, the per-assert proof is the mutations); per-assert mutations on a HEAD copy of `.asd/runtime.js`, same filter → exit 1, 1 matched, failing entries as the test lists them: string stop removed (state reset at line end) → `an edit of a \`//\` line inside a Kotlin multi-line string`, `a code edit after a Kotlin multi-line string holding an unclosed \`/*\``, `a \`#\` line changed inside a Python triple-quoted string`; block-opener stop removed → `a code edit after a regex whose \`/*\` opens an unclosed block`; blank lines in a string dropped → `a blank line added inside a template literal`; rest of the line after a closed block read as comment → `a comment-boundary shift that comments out unchanged code`; shebang guard removed → `a shebang edit`; `:` guard before `//` removed → `an edit after \`http://\` in code`; code backslash skip removed → `a code edit between a regex holding \`\/*\` and a later block comment`; stop and backslash skip both removed → also `a code edit after a regex holding \`\/*\` (reviewer combined-1 repro)` (that repro survives either removal alone, each guard covers it); identical-text guard removed → `text identical on both sides`; absent base read as empty → `an added file`; unknown extension lexed as c-family → `AC-15: an unknown extension counts as changed` (latch round); css `//` comments enabled → `a \`//\` line in css`; reword control (one table label reworded) → exit 0, 1 matched; green on HEAD, exit 0; runs: 12 |

## Suite run

- Command: `node tests/run.js`
- Scope: full — safety valve (framework-wide files changed): every test file ran with no filter
- Result: pass — 391/391 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` and `node .asd/sync.js --check` (exit 0)
- HEAD: 7a75ccff413357d5fa711f9b8dbbba84b6f31f1e

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None: every AC is covered by an automated check.
