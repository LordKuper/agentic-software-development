# Test plan — sprint 028-cleanup-phase, entry 5 (rotated)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `review-waves --single` (boolean flag registered in `main`) and impl-review step 1c / `sprint-lifecycle.md` "Review iteration counters" (lite = one wave), amendment AC-21 | `--single` rejected as a value-less flag (`flags require values`, exit 2), or a one-wave division over an above-threshold scope refused under lite, or still accepted without the flag for standard | unit (CLI path, sandbox git repo) | keep | Task 14's test (`cd3f63e2`: `sprint-017 AC-1 ... sprint-028 AC-21` review-waves test) pins step 1c naming `--single`, the one-wave division accepted with `waves: 1` and the measured fields kept, and the same division still refused unflagged (standard); its fail-first is in its commit and return, and it exposed the parse defect, fixed in `7e413ea6` before this entry (never reached impl-test, so no `D-N`); not re-authored |
| `core.md` glossary, `asd-phase-impl-review/SKILL.md`, `README.md`, `.asd/release-manifest.json`, regenerated views (AC-21 prose mirrors) | prose drift between mirrors of the lite one-wave rule | none | none | prose with no stable token beyond `--single` (pinned above); existing phase-chain, README, release-manifest integrity checks and `sync.js --check` (exit 0) cover the mirrors; quality review judges the wording |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no test became obsolete by the delta | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| none | n/a: Task 14's test is existing, its fail-first proof is in its commit `cd3f63e2`; no test authored this entry |
