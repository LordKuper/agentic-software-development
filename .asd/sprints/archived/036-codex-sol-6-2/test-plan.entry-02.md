# Test plan — sprint 036-codex-sol-6-2, entry 2 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `renderOwnedArray` nests the rebuilt owned array by the indent of its opening line (D-1, AC-15) | The D-1 test only reads a two-space file, where a fixed two-per-level width and the derived indent coincide; a file indented differently (four spaces is a common hand-written layout) would get elements and a closing bracket at the wrong column, and a foreign element's bytes are not to move | component (`renderJsonMerge` over a four-space file with a foreign and a stale owned element) | add | `sprint-036 AC-15 (D-1): a json-merge re-render of an owned array in a four-space file ...` asserts the whole rendered text; both hook targets sit at the same depth (`hooks.SessionStart`), so a deeper-array case has no real caller and is not added |
| D-1 itself (AC-15) | `.claude/settings.json` re-indented on the first `disabled` apply | component | none new | `sprint-036 AC-15 (D-1): a json-merge re-render that only adds the owned attribution key ...` already exists and now passes |
| One-line minified file, tab indent, CRLF file (D-1 delta) | Odd layout around the rebuilt array | component | none | a minified file takes the empty pad and renders as before the fix; no consumer layout of these is a stated requirement, and the contract is the two-space layout nested by depth |
| `.claude/settings.json` re-render (7478e40a) | The view carries a stale or extra key | static | none | a generated view is not behaviour; `node .asd/sync.js --check` (build) proves it current, and `sprint-036 AC-15` covers the key |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. Pre-fix tree = `git archive 2d190ca6^` (the commit before the D-1 fix) extracted to a scratch directory with this entry's `tests/run.js` and `tests/fixtures/expected` copied in; the run is `node tests/run.js --filter "<substring>"`, matched count 1.

| Test | Regression proof |
|---|---|
| tests/run.js:`sprint-036 AC-15 (D-1): a json-merge re-render of an owned array in a four-space file ...` | fail-first vs pre-fix tree: `node tests/run.js --filter "four-space file"` → exit 1, `sprint-036 AC-15 (D-1): a json-merge re-render of an owned array in a four-space file ...` failing `AC-15: the rebuilt array indents by the depth of its own opening line, not by a fixed width` (pre-fix elements at two spaces, closing bracket at column 0); green on the live tree; n/a for mutation (behavioural, the fix commit is the oracle) |
