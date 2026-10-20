# Test plan entry 04 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 4, review-fix wave-3 tester rows included; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix b2e4608e E1: conditional input keys (`decisions`, `contracts`, `audit`) moved from `required` to `optional` in dev, correctness, efficiency, documentation | A conditional key listed as unconditionally required again: a dispatch without it reads as a missing required input (ABORT/FAILED) | static/arch (content contract) | add | Stated review finding, no pin: the D2 sweep checks only that `required` is a list; `code-style.md` §17 parsed-literal pin |
| Same commit E2: standalone modes `concept`/`stack`/`design-system` in BA/Architect/UX `## Inputs` `modes`; E3 UX plain FAILED; F1 reviewer design-review clause dropped; F2 BA ABORT/FAILED split | E2: mode dropped, the skill dispatch hits sprint-only top-level required inputs. E3/F1/F2: signal wording and prose | static/arch (E2); none (E3, F1, F2) | add (E2); none (E3, F1, F2) | E2 is a stated finding with no pin (same test). E3/F1/F2 are signal-wording prose; the D2/D3 sweep pins the Escalation and Signals shapes and token set; per-clause wording would restate canon |
| Review-fix wave-3 iter-01 F6: C-4 relay branches (workflow Dispatch `ADVICE_NEEDED` rows) and the sprint-018 AC-8 run-vs-deny relation | A Dispatch row lists `ADVICE_NEEDED` with no "Relay" branch (signal dropped), or a relay branch survives with no sender (plan); a run grant reaching a command the agent's own deny list refuses, once the pin hardcoded one command | static/arch (content contract) | add (sweep); adjust (relation) | Stated review finding; AC-6 (C-4) has no machine pin on the workflow side; the narrowed relation hid any new `<command> (reason)` deny item; `code-style.md` §17 parsed-literal pin |
| Regenerated views, manifest hashes, reviewer memory | Mirror drift; memory prose | build check | none | `node .asd/sync.js --check` and the `release-manifest.json` hash pins cover; memory prose is not testable behaviour |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 4 delta touches no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| tests/run.js: `sprint-026 AC-13 (E1/E2)`: no agent `required` (top-level or mode) names `payload.inputs.decisions|contracts|audit` without "when present"; BA `concept`, Architect `stack`, UX `design-system` modes keep "no sprint required" | mutation E1 (asd-dev: `payload.inputs.decisions` moved back into `required`): `node tests/run.js` → 284/288, the new test fails (plus sync/manifest hash pins, by design); mutation E2 (drop "no sprint required" from asd-ba `concept`): new test fails (same by-design pins); control (asd-dev `required` gains `payload.inputs.contracts when present`): new test stays green, only the 3 hash pins fail; runs: 3. Canon restored by `git checkout`, worktree verified clean |
| tests/run.js: `sprint-026 AC-6 (C-4)` relay sweep; adjusted sprint-018 AC-8 `neverRun` (leading `<command> (` token of every deny item) | mutation (design-review step 12 drops the "Relay" `ADVICE_NEEDED` citation): new test fails, 1 failure; control (impl-test step 12 quote style `'Relay'`, same citation): stays green; mutation (asd-ux run grant gains `designmd-install`): sprint-018 AC-8 relation fails; control (unrelated run grant added): stays green; canon restored by `git checkout`, worktree verified clean |
