# Test plan entry 05 — sprint 026-structured-specs

Rotated narrative rows of Entry log entry 5; never edited.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Review-fix 558722d8 F1/F2/F3/F5: dispatch payload keys added to design-promote and design-review rows (`inputs.requirements`, `inputs.ux`, `iteration`, `findings`); bare gate markers and reviewer-question gate; retro wording; impl-review Exit split, MEMORY-FIX moved to impl | F1 class: a Dispatch row omits an input the dispatched agent declares required, so the dispatch reads as a missing required input | none | none | Prototype scan of every workflow Dispatch row against agent top-level `required` `payload.inputs.*` keys: 14 hits, all false positives or unresolvable without per-mode and per-row allowlists (mode-replaced `required`, multi-agent rows where one key serves one agent, rows passing the whole `inputs` object); an allowlist would restate canon, so no `code-style.md` §17 parsed-literal pin qualifies. F2/F3/F5 are marker/prose wording already covered by the AC-12 Dispatch/Signals shape sweep, the phase-chain and Exit-route tests |
| Skills asd-update/asd-init/asd-sync F4, regenerated views, manifest hashes | Mirror drift; wording | build check | none | `node .asd/sync.js --check` and the `release-manifest.json` hash pins cover |
| Review-fix tester 6cc4c42b (C-4 relay sweep, sprint-018 AC-8 run-vs-deny relation) | already analysed by that tester | static/arch | add (done) | Rows rotated to `test-plan.entry-04.md`; mutation/control proof stands, suite green below |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | entry 5 delta removes no test; no test fails the hypothetical-risk criterion | n/a |

## Added tests

| Test | Regression proof |
|---|---|
| none | no new test this entry (see Risk → check decisions); the review-fix tester's 6cc4c42b tests are in `test-plan.entry-04.md` | n/a |
