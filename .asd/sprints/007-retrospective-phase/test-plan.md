---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 007-retrospective-phase

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 78e67f1 | full change surface (`git diff main...HEAD`, minus `.asd/project/**`, `.asd/sprints/**`, generated `.claude/`/`.codex/`/`.agents/skills/`) |
| 2 | cf7b182 | delta since entry 1 — the three impl review-fix commits (`b187059` migration rewrite, `c12e173` retro contract, `46d14be` README/AGENTS/template) plus `reviews/impl/iter-01/testing.md` TST-01..TST-08 |

## Risk → check decisions

Repo ships Markdown/YAML/JSON/HTML plus a few zero-dependency Node scripts. `tests/run.js` is the
only runner and covers `.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/migrations/**`,
`.asd/runtime.js`, `.asd/hooks/session-start.js` and a few static canon-consistency assertions.
Documentation *content* has no test harness and inventing one is out of scope (over-engineering).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/migrations/6.0.0.js` (new, executable) | Strips `escalations` but corrupts the rest of a consumer's active `state.json`: lost sibling members, CRLF flattened to LF, or an archived sprint mutated (immutable history). Non-idempotent re-run. | unit (fixture consumer tree, precedent: 4.0.0/5.0.0 migration tests) | add | Only new executable logic in the change surface; migrations already have a test precedent and fixture helper, so the cheapest reliable check is the existing one. |
| `.asd/migrations/6.0.0.js` boundary paths | `escalations` as the LAST member (no trailing comma) → the preceding comma must be dropped or the file stops parsing. Unparsable / unexpected-shape input must be left byte-for-byte untouched, never half-written. | unit (boundary + negative cases) | add | Boundary and fail-safe branches are where a state-file rewriter destroys consumer data; literal boundary fixtures are the point (§17 hardcoded-data exception). |
| `.asd/migrations/6.0.0.js` stdout warnings | The dropped escalations and the unparsable-file notice are the migration's ONLY data-recovery affordance: after the rewrite the consumer's state file no longer holds them. Tightening the output, moving the warn above the guard, or deleting it as noise leaves every file-bytes assertion green while a consumer's recorded escalations vanish with no pointer to their new home. | unit (stdout captured by stubbing `process.stdout.write`, saved and restored per §17's global-state rule) | add | TST-05. The fixture already exercised the branch; only the assertion was missing. No new infrastructure — one save/restore around the call. |
| `.asd/release-manifest.json` `asd_version` 5.0.0 → 6.0.0 (AC-9 precondition) | The migration filename is the target version: if `pr` bumps to something else, or not at all, `6.0.0.js` is permanently outside every consumer's pending window, the retired key survives in every in-flight sprint state, and AC-9 ships unmet with two green migration tests as apparent evidence. | — | none | TST-06 / CORR-A-06. Owner is the `pr` phase (`git-strategy.md` "Versioning & Changelog", plan.md Task 6 DoD item) — the bump has not landed and cannot be asserted green from `impl-test`. Recorded as an open, owned precondition rather than left silent; the existing forward `upstream_hashes` test fails loudly if the bump lands without a ledger refresh. |
| `.asd/hooks/session-start.js` `PHASE_CHAIN` += `retro` (AC-3/AC-8) | ~20 hand-verified mirror sites (audit G-11): a phase in the chain with no skill/workflow, or a workflow/skill orphaned from the chain, or a prose mirror left listing ten phases. Silent wrong routing / stale user-facing docs. | static/arch (canon-wide consistency assertion; precedent: the existing retired-`asd-pm` canon scan) | add | Clears §17's bar: the risk is real and evidenced (G-11 names it, AC-8 mandates the invariant), the failure mode is silent, and the check is a deterministic derive-from-source assertion with no new infrastructure. |
| Chain prose mirrors (`core.md` glossary, `sprint-lifecycle.md` chain line) | Ordered phase list in the two rule docs drifting from `PHASE_CHAIN`. | static/arch | add | Both mirrors are machine-checkable ordered sequences, not prose judgement — asserting them costs one regex each and closes the largest share of G-11's mirror sites. |
| `.asd/release-manifest.json` `upstream_hashes` refresh + 4 new managed files (AC-5 template registration) | A newly added managed file omitted from `upstream_hashes` is invisible: existing test only checks the forward direction (audit G-12), so consumers would silently never receive `t_friction-log.md`, `t_retrospective.html`, the retro skill or workflow. | static/arch (reverse-direction manifest coverage) | add | Evidenced by this very sprint adding four managed files; forward-only check provably cannot catch the omission. Complements, not duplicates, the existing entry-matches-file test. |
| `.asd/templates/t_state.json` (`escalations` removed) | Template stops parsing; stale hash. | — | none | Already covered: existing `every .asd/templates/**/*.json file parses as valid JSON` test plus the `upstream_hashes` entry-matches-file test. No new behaviour. |
| `checkpoints.md` precondition chain; `README.md` phase table, flowchart nodes, phase-count words (AC-8) | The two mirrors the entry-1 mirror test provably cannot reach: its regex is anchored on the first phase, which `checkpoints.md` omits by construction (it lists only phases that HAVE a predecessor), and README was not read at all. A twelfth phase, or a reverted `retro`, leaves the precondition SSoT and the user-facing entry point describing a workflow that no longer exists, suite green. | static/arch (same rung, same derive-from-`PHASE_CHAIN` helper) | add | Entry 1's blanket `none` for rule docs and README was over-broad (TST-03): these are ordered, machine-checkable sequences and a literal count, not prose judgement. Cost is three regexes on a helper already in use. |
| Rule docs (`sprint-lifecycle.md`, `artifact-layout.md`, `checkpoints.md`, `core.md`, `review-policy.md`), `AGENTS.md`, `README.md` — everything except the ordered chain mirrors above | Wrong or contradictory prose. | — | none | Documentation content, not executable behaviour. No content harness exists and building one is out of scope; correctness here is a reviewer judgement (`impl-review`), not an assertion. Every chain-derived slice is now asserted (rows above); what remains is genuinely prose. |
| `.asd/skills/asd-phase-retro/SKILL.md`, `.asd/workflows/asd-phase-retro.md` (new) | Malformed frontmatter or a view that fails to generate. | — | none | Covered by `build` (`node .asd/sync.js --check`, canonical→provider-view render + orphan detection) and by the new chain-bijection assertion, which requires both files to exist for the `retro` chain entry. |
| `.asd/templates/t_retrospective.html` section contract (AC-4, AC-7, AC-10, AC-5 threshold) | The template is the only written home for the two-branch section split. An unclassified new section leaves the empty-log branch undefined; a dropped systemic section turns an entry-free log into an empty retrospective (AC-10's whole point); a changed `<h2>` count silently flips the `{{TOC_NAV}}` threshold on either branch and invalidates the AC-5 manual step; a dropped `F-N` column loses AC-4's traceability. | static/arch (token/structure assertions on the template file) | add | Closes TST-02's AC-4/AC-7/AC-10 gap at the only machine-checkable layer that exists. Every property is a literal token in a tracked file — same rung as the chain mirrors, no DOM harness, no new infrastructure. |
| `.asd/templates/t_retrospective.html`, `t_friction-log.md` (new) — rendered appearance | Broken shell structure / unregistered template. | — | none | Registration covered by the reverse-manifest test; the section contract by the row above. What is left — rendered layout, chip styling, readability — is visual correctness with no automatable oracle short of a DOM harness (new infrastructure — Simplicity Default). Manual verification spec below. |
| `.asd/templates/t_html-shell.html` (one-line `delegates_to:` addition) | Shell chrome or the TOC threshold changing under every HTML artifact. | — | none | TST-08. The edit adds one name to a `responsibility` comment list; no chrome, placeholder, threshold or structure changed, so there is no behaviour to assert. The threshold itself is asserted from the retrospective-fragment side (row above). Recorded so the ledger stays exhaustive against the change surface. |
| `.asd/workflows/asd-phase-*.md` `NEXT:` return contracts (AC-3/AC-6) | `NEXT:` is authoritative for routing while `PHASE_CHAIN` only drives the session hook's display. A bad revert restoring `NEXT: pr` in `asd-phase-impl-review.md` skips `retro` in every sprint with the whole suite green. | static/arch (successor derived from `PHASE_CHAIN` adjacency) | add | Entry 1's `none` reason — "prose with no executable surface" — was false (TST-01): `NEXT: retro` and `NEXT: pr` are literal tokens in tracked files, exactly as checkable as the rule-doc sentences already asserted, and the successor is derivable from the chain array. Generalised over all eleven phases at no extra cost. |
| `.asd/workflows/asd-phase-*.md` friction-append reference lines (AC-2) | A workflow that never appends, or restates the mechanism instead of referencing it. | — | none | Whether a running agent actually appends is runtime behaviour with no oracle short of executing a sprint; whether the line references rather than restates is exactly the SSoT judgement `impl-review`'s Documentation reviewer owns. Presence of a line proves nothing about either. |
| Retro analysis behaviour (AC-4 "analyses every entry", AC-7 "records and advances without inventing findings", AC-10 proposal quality) | The phase invents findings on an empty log, drops an entry, or emits proposals that are just re-worded friction. | — | none | TST-02. These are agent judgements at runtime — the only oracle is a human reading a real retrospective. The machine-checkable halves are covered: the artefact contract by the template row above, "advances" by the unconditional `NEXT: pr` in the return-contract row (retro offers exactly one successor on both branches). Quality remains reviewer + manual scope. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| — | none: no existing test met §17's prune criteria (nothing trivial, duplicated, mock-confirming, implementation-coupled or flaky was found on the change surface) | — |

## Added tests

All in `tests/run.js` (the repo's only runner; no new dependency or infrastructure).

Every proof below names the assertion that fired **first** under the mutation, transcribed from the
run, not the assertion the mutation was aimed at (TST-04). Entry 2 re-derived all three migration
proofs: `b187059` replaced the line-scanning implementation with parse / `delete` / re-serialize, so
entry 1's `dropTrailingCommaBefore` mutation no longer exists to perform.

| Test | Regression proof |
|---|---|
| `tests/run.js:6.0.0 migration: strips "escalations" from an ACTIVE sprint state, preserving every other member and CRLF line endings; archived sprints untouched; re-run is a no-op` | mutation — `const eol = raw.includes('\r\n') ? '\r\n' : '\n'` → `const eol = '\n'`: first failure is the byte-for-byte assertion `only the escalations line may go - every other byte, CRLF included, must survive`; restored, green. Caveat: the *archived-untouched* assertion is not independently mutation-provable — `activeSprintStatePaths` lists only direct children, so removing the `ARCHIVE_DIR` guard changes nothing observable today. The assertion is kept as the encoded contract against a future recursive refactor, and this limitation is recorded rather than claimed as proof. |
| `tests/run.js:6.0.0 migration: removes "escalations" whatever shape it is written in - last member, or a populated array spanning lines; only unparsable JSON is left byte-for-byte untouched and reported as skipped` | mutation — the presence guard `!Object.prototype.hasOwnProperty.call(state, RETIRED_KEY)` → `!Array.isArray(state[RETIRED_KEY]) \|\| state[RETIRED_KEY].length === 0` (the plausible "only strip it if it has content" mistake): first failure is `dropping the final member must leave the state file parsable, with no dangling comma`, the empty last-member fixture surviving the run; restored, green. Also fails wholesale against the pre-`b187059` line-scanner (below). |
| `tests/run.js:6.0.0 migration: strips the TOP-LEVEL "escalations" even when a nested member of the same name is serialized above it, and leaves that nested member intact` | fail-first vs pre-fix behaviour — restored `git show b187059^:.asd/migrations/6.0.0.js` (the shape-blind line scanner this test was authored against) over the current file: first failure is `the retired key is the top-level one only - a same-named member at any other depth belongs to its owner and must survive`, the scanner having deleted the nested member and left the top-level one; restored, green. |
| `tests/run.js:AC-9: the 6.0.0 migration prints the escalations it dropped and where to re-record them - the run's only data-recovery affordance` | mutation — deleted the `if (Array.isArray(dropped) && dropped.length > 0) { warn(...) }` block (the "drop it as noise" edit this test exists to catch): first failure is `the dropped escalations must be printed verbatim - the rewritten state file was their only other copy and it no longer holds them`; restored, green. Also fails against the pre-`b187059` implementation. |
| `tests/run.js:AC-8/G-11: PHASE_CHAIN is the single source for the phase set - every phase has a skill AND a workflow, every phase skill/workflow is in the chain, and retro sits between impl-review and pr` | mutation ×3, each naming its own first failure — (a) removed `'retro'` from `PHASE_CHAIN`: fails at `retro must be in the chain` (entry 1 credited the bijection assertion 22 lines further down; corrected per TST-04); (b) renamed `.asd/workflows/asd-phase-retro.md`: fails at `a phase in the chain with no dispatch target routes into nothing: workflow for retro`; (c) added an orphan `.asd/workflows/asd-phase-ghost.md`: fails at `phase workflows and PHASE_CHAIN must be in bijection`, the reverse direction. All restored, green. |
| `tests/run.js:AC-3/AC-6/AC-8: every phase workflow offers its PHASE_CHAIN successor as a NEXT target - NEXT is what routes the sprint, PHASE_CHAIN only what the session hook displays` | mutation ×2 — (a) `asd-phase-impl-review.md` return contract `NEXT: <retro\|impl>` → `NEXT: <pr\|impl>` (TST-01's exact bad-revert scenario): fails at `asd-phase-impl-review.md must offer "NEXT: retro"`; (b) `asd-phase-retro.md` `NEXT: pr` → `NEXT: done`: fails at `asd-phase-retro.md must offer "NEXT: pr"`. Both restored, green. |
| `tests/run.js:AC-8/G-11: the ordered phase-chain mirrors in core.md, sprint-lifecycle.md and checkpoints.md match PHASE_CHAIN exactly` | mutation ×3 — deleted `retro` from `core.md`'s glossary sequence (fails `core.md glossary phase list drifted from PHASE_CHAIN`); collapsed `impl-review → retro → pr` to `impl-review → pr` in `checkpoints.md`'s precondition block (fails `checkpoints.md precondition chain drifted from PHASE_CHAIN`); removed `'retro'` from `PHASE_CHAIN` (fails from the other side). All restored, green. |
| `tests/run.js:AC-8: README mirrors PHASE_CHAIN - the phase table, the workflow flowchart and every phase-count word` | mutation ×3, one per mirror — deleted the `retro` phase-table row (fails `README phase table drifted from PHASE_CHAIN`); reduced the flowchart's `retro[...]` declaration to a bare node id (fails `the README flowchart must declare a node for exactly the phases in PHASE_CHAIN`); `eleven mandatory phases` → `ten mandatory phases` (fails `README phase-count word disagrees with PHASE_CHAIN's 11: ten`). All restored, green. |
| `tests/run.js:AC-4/AC-5/AC-7/AC-10: t_retrospective.html classifies every section for the empty-log branch, keeps the systemic class there, and sits on the right side of the TOC threshold on both branches` | mutation ×3 — deleted the `systemic-proposals` section (fails `the systemic-proposals class ships on the empty-log branch too - an entry-free friction log is not an empty retrospective`); appended an unclassified `Cost` section (fails `a section the empty-log branch neither keeps nor omits leaves that branch's output to guesswork: Cost`); replaced the actions table's `F-1` link with `—` (fails `every recommendation traces to the friction entry it addresses (AC-4)`). All restored, green. |
| `tests/run.js:AC-5/G-12: every file under release-manifest managed_paths HAS an upstream_hashes entry (reverse direction - an unregistered new template would otherwise never reach a consumer)` | mutation — deleted the `t_retrospective.html` `upstream_hashes` entry: test failed naming the unregistered file; restored, green |

## Suite run

- Command: `node tests/run.js`
- Scope: full — shared-infrastructure safety valve (`sprint-lifecycle.md` "Impacted test set"): the change touches a hook, a migration and the release manifest, and `commands.yaml` has no `test_affected` selector, so the impacted set degrades to the whole suite
- Result: pass — 137 passed / 0 failed / 0 skipped (entry 1: 132/132; entry 2 opened at 133 after `b187059` added the nested-key migration test, and added 4)
- Lint / build: pass (`git diff --check` clean; `node .asd/sync.js --check` clean)
- HEAD: 9af53e2

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| — | — | none found | — | — | — |

## Manual verification (optional)

**When due, and who confirms**: every row below is executable only downstream of this gate — the
first real `retro` run is this sprint's own, after `impl-review` closes. None of them can be
performed during `impl-review`, so none blocks its DoD; all three are ADVISORY (visual UI / UX feel,
`asd-tester` "Evidence routing per story type"). The user confirms each at the `retro` phase, and
that phase's decisions-log entry is the record. `asd-reviewer-testing` consumes this spec, never
re-authors or executes it.

Both AC-5 rows are branch-scoped: `{{TOC_NAV}}` is filled only at **3 or more** `<h2>` sections
(`artifact-layout.md` "Placeholder fill"). The full branch renders 4, the empty-log branch 2, so an
absent nav on the empty-log branch is compliance, not a defect — never "fix" the shell to always
emit the nav. The `<h2>` counts themselves are asserted, so a template edit that moves either
branch across the threshold fails the suite before it reaches a human here.

| AC | Steps | Expected observation |
|---|---|---|
| AC-5 (full branch) | Reach `retro` with a friction log holding at least one `F-N` entry — or render `t_retrospective.html` with all four sections kept and placeholders filled — and open the resulting `retrospective.html` in a browser | Self-contained single file: sticky TOC sidebar present and linked to all four sections (Outcome, Analysis, Actions, Systemic proposals), status chip reads `final`, no missing stylesheet or broken layout — visual-only, no automatable oracle |
| AC-5 (empty-log branch) | Reach `retro` with an absent or entry-free friction log — or render the fragment per the template's `EMPTY-LOG BRANCH` note, keeping only Outcome and Systemic proposals — and open it in a browser | **No TOC sidebar at all** (2 `<h2>` is below the threshold, so `{{TOC_NAV}}` is correctly empty and the shell renders single-column), Outcome lede reads "No friction recorded this sprint", Systemic proposals still populated, layout unbroken |
| AC-6 | Complete an `impl-review` phase and let the sprint route into `retro` | A short chat summary of friction findings and proposed approaches is posted in `language.chat`, then the phase returns `NEXT: pr` without blocking on user input beyond `checkpoints.md` mandates — UX-feel/interaction, advisory |
