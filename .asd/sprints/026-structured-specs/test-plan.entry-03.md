# Test plan entry 03 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 3; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix 93160397: `sprint-lifecycle.md` "Input sources" `requirements`/`ux` rows gain the decomposition-disabled flat paths (`requirements.html`, `ux-spec.html`), reviewer finding F-1 | Clause dropped or reworded away: an agent resolving the input in a non-decomposed project has no path | static/arch (content contract) | add | Stated requirement (F-1) with no pin: the existing "Input sources" pin checks only the lite `sprint.md` clause; flat path tokens are parsed literals under `code-style.md` §17 |
| Same commit: release-manifest hash refresh, reviewer agent-memory | Mirror drift; memory prose | build check | none | `release-manifest.json upstream_hashes` pin and `node .asd/sync.js --check` cover; memory prose is not testable behaviour |


## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 3 delta touches no test; no test fails the hypothetical-risk criterion | n/a |


## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-026 AC-4/AC-9/AC-10/AC-11/D9 test, one added assert (AC-7 flat paths) | mutation flat (drop the ` (flat `requirements.html` with decomposition disabled)` clause from the `requirements` row): `node tests/run.js` → exit 1, `sprint-026 AC-4/AC-9/AC-10/AC-11/D9` (plus the `release-manifest.json upstream_hashes` pin, by design); control (reword the clause to `(the non-decomposed form is `requirements.html`)`, token kept): added assert stays green, only the manifest pin fails; runs: 1. Canon restored by `git checkout` in the same command, worktree verified clean |

