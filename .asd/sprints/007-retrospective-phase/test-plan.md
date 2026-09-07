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

## Risk → check decisions

Repo ships Markdown/YAML/JSON/HTML plus a few zero-dependency Node scripts. `tests/run.js` is the
only runner and covers `.asd/sync.js`, `.asd/skills/asd-update/update.js`, `.asd/migrations/**`,
`.asd/runtime.js`, `.asd/hooks/session-start.js` and a few static canon-consistency assertions.
Documentation *content* has no test harness and inventing one is out of scope (over-engineering).

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/migrations/6.0.0.js` (new, executable) | Strips `escalations` but corrupts the rest of a consumer's active `state.json`: lost sibling members, CRLF flattened to LF, or an archived sprint mutated (immutable history). Non-idempotent re-run. | unit (fixture consumer tree, precedent: 4.0.0/5.0.0 migration tests) | add | Only new executable logic in the change surface; migrations already have a test precedent and fixture helper, so the cheapest reliable check is the existing one. |
| `.asd/migrations/6.0.0.js` boundary paths | `escalations` as the LAST member (no trailing comma) → the preceding comma must be dropped or the file stops parsing. Unparsable / unexpected-shape input must be left byte-for-byte untouched, never half-written. | unit (boundary + negative cases) | add | Boundary and fail-safe branches are where a state-file rewriter destroys consumer data; literal boundary fixtures are the point (§17 hardcoded-data exception). |
| `.asd/hooks/session-start.js` `PHASE_CHAIN` += `retro` (AC-3/AC-8) | ~20 hand-verified mirror sites (audit G-11): a phase in the chain with no skill/workflow, or a workflow/skill orphaned from the chain, or a prose mirror left listing ten phases. Silent wrong routing / stale user-facing docs. | static/arch (canon-wide consistency assertion; precedent: the existing retired-`asd-pm` canon scan) | add | Clears §17's bar: the risk is real and evidenced (G-11 names it, AC-8 mandates the invariant), the failure mode is silent, and the check is a deterministic derive-from-source assertion with no new infrastructure. |
| Chain prose mirrors (`core.md` glossary, `sprint-lifecycle.md` chain line) | Ordered phase list in the two rule docs drifting from `PHASE_CHAIN`. | static/arch | add | Both mirrors are machine-checkable ordered sequences, not prose judgement — asserting them costs one regex each and closes the largest share of G-11's mirror sites. |
| `.asd/release-manifest.json` `upstream_hashes` refresh + 4 new managed files (AC-5 template registration) | A newly added managed file omitted from `upstream_hashes` is invisible: existing test only checks the forward direction (audit G-12), so consumers would silently never receive `t_friction-log.md`, `t_retrospective.html`, the retro skill or workflow. | static/arch (reverse-direction manifest coverage) | add | Evidenced by this very sprint adding four managed files; forward-only check provably cannot catch the omission. Complements, not duplicates, the existing entry-matches-file test. |
| `.asd/templates/t_state.json` (`escalations` removed) | Template stops parsing; stale hash. | — | none | Already covered: existing `every .asd/templates/**/*.json file parses as valid JSON` test plus the `upstream_hashes` entry-matches-file test. No new behaviour. |
| Rule docs (`sprint-lifecycle.md`, `artifact-layout.md`, `checkpoints.md`, `core.md`, `review-policy.md`), `AGENTS.md`, `README.md` | Wrong or contradictory prose. | — | none | Documentation content, not executable behaviour. No content harness exists and building one is out of scope; correctness here is a reviewer judgement (`impl-review`), not an assertion. Chain-relevant slices ARE covered by the mirror test above. |
| `.asd/skills/asd-phase-retro/SKILL.md`, `.asd/workflows/asd-phase-retro.md` (new) | Malformed frontmatter or a view that fails to generate. | — | none | Covered by `build` (`node .asd/sync.js --check`, canonical→provider-view render + orphan detection) and by the new chain-bijection assertion, which requires both files to exist for the `retro` chain entry. |
| `.asd/templates/t_retrospective.html`, `t_friction-log.md` (new) | Broken shell structure / unregistered template. | — | none | Registration covered by the new reverse-manifest test; HTML structure is visual/content correctness with no automatable oracle short of a DOM harness (new infrastructure — Simplicity Default). Reviewer + rendering check instead. |
| `.asd/workflows/asd-phase-*.md` `NEXT:`/friction-log wiring edits (AC-2/AC-6/AC-7) | A workflow routing to the wrong successor phase. | — | none | Routing is prose contract interpreted by an agent at runtime, not code — no executable surface to assert against. `retro`'s position in the chain and the existence of its workflow are covered; the rest is reviewer scope. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| — | none: no existing test met §17's prune criteria (nothing trivial, duplicated, mock-confirming, implementation-coupled or flaky was found on the change surface) | — |

## Added tests

All in `tests/run.js` (the repo's only runner; no new dependency or infrastructure).

| Test | Regression proof |
|---|---|
| `tests/run.js:6.0.0 migration: strips "escalations" from an ACTIVE sprint state, preserving every other member and CRLF line endings; archived sprints untouched; re-run is a no-op` | mutation ×2 — (a) `const eol = raw.includes('\r\n') ? '\r\n' : '\n'` → `const eol = '\n'`: failed on the byte-for-byte CRLF assertion; (b) rewrote the file on the key-absent path: failed the idempotence assertion. Both restored, green. Caveat: the *archived-untouched* assertion is not independently mutation-provable — `activeSprintStatePaths` lists only direct children, so removing the `ARCHIVE_DIR` guard changes nothing observable today. The assertion is kept as the encoded contract against a future recursive refactor, and this limitation is recorded rather than claimed as proof. |
| `tests/run.js:6.0.0 migration: LAST-member "escalations" (no trailing comma) still parses after removal; unparsable JSON and an unexpected multi-line shape are left byte-for-byte untouched and reported as skipped` | mutation — removed the `dropTrailingCommaBefore` call: the last-member file stopped parsing, test failed on `report.stripped`; restored, green |
| `tests/run.js:AC-8/G-11: PHASE_CHAIN is the single source for the phase set - every phase has a skill AND a workflow, every phase skill/workflow is in the chain, and retro sits between impl-review and pr` | mutation — removed `'retro'` from `PHASE_CHAIN`: test failed on the orphan skill/workflow bijection; restored, green |
| `tests/run.js:AC-8/G-11: the ordered phase-chain mirrors in core.md and sprint-lifecycle.md match PHASE_CHAIN exactly` | mutation ×2 — deleted `retro` from `core.md`'s glossary sequence (failed the ordered-list comparison), and removed `'retro'` from `PHASE_CHAIN` (failed from the other side); restored, green |
| `tests/run.js:AC-5/G-12: every file under release-manifest managed_paths HAS an upstream_hashes entry (reverse direction - an unregistered new template would otherwise never reach a consumer)` | mutation — deleted the `t_retrospective.html` `upstream_hashes` entry: test failed naming the unregistered file; restored, green |

## Suite run

- Command: `node tests/run.js`
- Scope: full — shared-infrastructure safety valve (`sprint-lifecycle.md` "Impacted test set"): the change touches a hook, a migration and the release manifest, and `commands.yaml` has no `test_affected` selector, so the impacted set degrades to the whole suite
- Result: pass — 132 passed / 0 failed / 0 skipped (pre-strategy baseline: 127/127)
- Lint / build: pass (`git diff --check` clean; `node .asd/sync.js --check` clean)
- HEAD: 99e4f9e

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| — | — | none found | — | — | — |

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|
| AC-5 | Run a sprint through `retro` (or render `t_retrospective.html` with placeholders filled) and open the resulting `retrospective.html` in a browser | Shell renders as a self-contained single file: sticky TOC sidebar present and linked to every section, status chip reads `final`, no missing stylesheet or broken layout — visual-only, no automatable oracle |
| AC-6 | Complete an `impl-review` phase and let the sprint route into `retro` | A short chat summary of friction findings and proposed approaches is posted in `language.chat`, then the phase returns `NEXT: pr` without blocking on user input beyond `checkpoints.md` mandates — UX-feel/interaction, advisory |
