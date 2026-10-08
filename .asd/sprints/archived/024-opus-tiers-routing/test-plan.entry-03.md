# Test plan — sprint 024-opus-tiers-routing, entry 3 (rotated segment, never edited)

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-8 `checkpoints.md` "Gate policy" flagged-choice sentence (D8) | an adaptive gate accepts dropping a plan decision that could not be met in its Task's files, instead of meeting it or escalating | static/arch | add | token pin: the sentence is located by `flagged choice` + `plan decision` and carries the `new or changed scope` class token, and the class matches the "Hard in both modes" head; prose around it stays unpinned |
| AC-9 `code-style.md` §17 fail-first bound for a changed rule (D9) | the bound loses the clause and a proof passes on a token rename the old rule also satisfies | static/arch | add | token pin on `superseded` and `citation` in the content-contract bullet |
| `release-manifest.json` hash refresh, CHANGELOG | hashes stale | static/arch | none | the existing `upstream_hashes` test covers it |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no review-fix removal row to carry; the delta superseded no pinned wording | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-024 AC-2/AC-3/AC-4/AC-5/AC-6/AC-8/AC-9 (extended, retitled) | mutation per added assert, each `node tests/run.js` → exit 1, this test failing: M1 restore the pre-amendment `checkpoints.md` (`888bdf3`, no flagged-choice sentence), M2 `Hard in both modes: new or changed scope` → `changed scope` (new clause kept, its citation broken), M3 restore the pre-amendment `code-style.md` §17 (`888bdf3`); reword control (`meeting` → `fulfilling`, `never` → `not`) stays green; runs: 4 |

Every canon mutation also fails the unrelated `release-manifest.json: every upstream_hashes entry` test (hash of the mutated file); incidental, not evidence. Each mutation was restored (`git checkout -- <file>`) before the next run.
