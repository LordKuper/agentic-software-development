[REVIEW-impl-correctness]: CONCERNS

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — `low` and `medium` dropped)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| C-1 | high | `.asd/workflows/asd-phase-impl-review.md:74`, with `.asd/rules/sprint-lifecycle.md:316` and `.asd/workflows/asd-phase-impl-test.md:34` | Step 13 writes `derived_handoff` at impl-review exit and claims "This is the record the next phase reads"; `sprint-lifecycle.md:316` repeats it ("Written once per phase, by `asd-phase-impl-test.md` and `asd-phase-impl-review.md`"). **No reader can ever match that record**, so the write is unreachable work and both statements are false. Only two readers exist, and reuse requires `base`, `head` and `pathspec` to all equal what the reader computes. impl-review's `base` is `base_branch` (iter 1) or `iteration_heads["iter-(NN-1)"]` (iter 2+); the next reader is either impl-test re-entry, whose `base` is the prior `Entry log` `HEAD analysed`, or impl-review iteration NN+1, whose `base` is `iteration_heads["iter-NN"]` — both structurally different shas. Concrete run: impl-test entry 1 writes `{base: main, …}` → impl-review iter 1 legitimately reuses it → impl-review iter 1 exit overwrites the slot with its own record → route to impl fix → impl-test re-entry reads `base=main` but computes the entry-1 `HEAD analysed` → mismatch → re-derives. The overwrite is never read by anyone. AC-11's stated outcome ("a **cycle re-entry** reads the derived scope list … instead of rebuilding") is delivered only for the single entry-1→iter-1 handoff and never for a cycle re-entry, while every impl-review exit pays a full-repo diff re-run plus a state write for a record with no consumer. | Either **(a)** delete the impl-review-side write (step 13 and its Artefacts line) and state in `sprint-lifecycle.md` "State recovery" that only `impl-test` writes the slot, at its green exit, and only `impl-review` step 1 reads it — one handoff, one direction, which is what the code paths actually support; or **(b)** keep the write and make it reachable by recording `base` = the sha just written to `iteration_heads["iter-NN"]`, aligning impl-test re-entry's `base` to the same convention. Under (a), `asd-phase-impl-review.md:74`'s "the record the next phase reads" must not be left standing. |
| C-2 | high | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:12` | Durable review heuristic states false arithmetic for the example it names: "A temporary revert of canonical *ledgered* source (e.g. `.asd/hooks/session-start.js`) must produce **exactly two** collateral failures … the `canon_hashes` freshness test and the `upstream_hashes` freshness test". `canon_hashes` is computed only over `.asd/agents/*.md` and `.asd/skills/*/SKILL.md` (`sync.js:914-932`), and `release-manifest.json` carries `session-start.js` only in `upstream_hashes` — there is no `hooks/…` key in `canon_hashes`. Reverting that file trips exactly **one** ledger test (`tests/run.js:1930`). Failure scenario: a future Testing reviewer corroborating an honest fail-first run over a hooks change counts 1 collateral failure, concludes the prediction failed and — per the same line — "probes harder" or raises a fabrication finding against a truthful tester; symmetrically it would accept a fabricated two-failure report as verified. This is the same defect class the previous wording had (it named a non-existent test); the correction swapped one wrong test name for another. | Restate per-tree: a revert of `.asd/agents/**` or `.asd/skills/**` canon trips **two** ledger tests (`tests/run.js:1919` + `:1930`); a revert of any other ledgered canon (`.asd/hooks/**`, `rules/**`, `templates/**`, `workflows/**`, `runtime.js`, `sync.js`) trips **one** (`:1930` only), because `canon_hashes` covers only the two render trees. |
| C-3 | high | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:25` | The "closed vocabulary" paragraph ends: "A file where something was found is still `checked`, carrying the finding id in `f`." That contradicts its own cited SSoT (`review-policy.md:99`: "only `finding` has `f`") and is rejected by the validator: `runtime.js:191` fails any row whose status is not `finding` but carries `f`, and `files` rows may only be `checked`/`n/a`. Failure scenario: a Testing reviewer follows this memory, emits `{"i":"tests/run.js","s":"checked","f":"T-1"}`, `validate-ledger` fails, the phase rejects the ledger and re-dispatches the whole review fresh — precisely the loss this paragraph was written to prevent, now caused by it. **This has already happened twice in this sprint** (friction log F-5). | Replace the last sentence: a file where something was found stays `checked` with **no** `f`; finding ids are carried only on `rules` rows whose status is `finding`, and every finding id must also appear in the ledger's top-level `findings` array, which `runtime.js:230` requires to equal the actual finding set exactly. |

Dropped below floor: 6 findings (2 medium, 4 low), not listed — including impl-test's non-green exit routes not writing the slot the rule describes as written "at phase exit", and the indirection of the `--apply` citation target.

## Verified clean

- **Union property** (`review-policy.md:144`): satisfiable and still blocking. Under the partition recipe every half manifest authorizes both the out-of-half predicate and every predicate the unpartitioned manifest already allowed, so an id such as `ac-4` or `ui-conformance` can be `n/a` in both halves under its own predicate without tripping; a genuinely unreviewed id is `n/a` under the *out-of-half* predicate in both halves and is blocked. The deleted digest condition is genuinely redundant — `validate-ledger` rejects a mismatch first. No dangling reference to `validate-partition` anywhere.
- **Reserved risk classes** (`providers.md:111`) match `RESERVED_CHANGE_RISKS` at `runtime.js:12` exactly, including the two-word forms that `riskEntry` normalizes; `sprint-lifecycle.md:299` is now a pointer to a heading that exists.
- **`--apply` consolidation**: sole full copy at `AGENTS.md:74`, below `<!-- asd:end -->` so `t_AGENTS.md` is untouched and no managed block drifts. All other sites carry the citation and none restates it; no site documents a non-working form.
- **`commands.yaml` `sync-apply` deletion**: no remaining reference in any non-sprint file.
- **New `tests/run.js` assertions are true at HEAD**, not merely green-looking: the agent-memory statement count really is 4; the `head`-formula guard cannot false-match impl-test's `` `HEAD analysed` ``; every asserted string is present where claimed.
- **AC-14 / sync state**: all eight generated views for the two edited render sources carry the new wording, none carries the old parenthetical, and both hash maps hold identical hex.

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `validate-ledger` → `{"ok":true}`. 15/15 files, 14/14 rules, 6/6 sections. `ac-4` `n/a` verified rather than accepted.

## Verdict

CONCERNS: 3 (all high)

## Next action

Route to impl review-fix. C-1 touches the AC-11 mirror set — fix once at the SSoT and re-check every mirror. C-2 and C-3 are single-file edits to one agent-memory doc with no canonical source to re-sync.

## Escalations

None. C-1's option (a) narrows a documented field's scope to what its code paths already support — a correction inside AC-11, not a retirement of it.
