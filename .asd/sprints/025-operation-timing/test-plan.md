---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 025-operation-timing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | | full change surface |

## Risk → check decisions

Pre-strategy run: change surface touches `.asd/runtime.js`, `release-manifest.json` and rule docs (shared framework files), so the safety valve degraded the impacted set to the full suite: `node tests/run.js` → 272/273, the one failure the §18 empty-log pin (test defect, below). No `test_affected` in `commands.yaml`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `timingAppend` (AC-1, AC-4, D2/D4) | wrong pairing, ordinal, parent or close-before-open order corrupts every duration; duplicate open or torn tail corrupts the ledger | unit (pure core, fixed fixture, injected `now`) | add | pure function, cheapest reliable check, no clock |
| `runtime.js` kinds vs `sprint-lifecycle.md` "Operation timing" (AC-2) | rule lists a kind the runtime rejects (or the reverse) and a mark is silently lost | contract (kinds derived from the rule, run through the core) | add | derives the set from its source, no hand enumeration |
| `runtime.js` `timingRecover` (AC-4, D4) | interrupted op closed before recorded activity, or a closed ledger rewritten | unit | add | pure core, fixed dates |
| `runtime.js` `timingSummary` (AC-5, D5, D6) | wrong wall/machine/user-wait/unaccounted maths, slow set missing the top-N or the over-limit rule, user wait flagged slow, gaps and baseline wrong | unit on fixed ledgers built from `SLOW_TOP_N`/`SLOW_MINUTES` | add | deterministic, no clock read |
| `runtime.js` `timing*` CLI wrappers (AC-1, AC-4, Windows quoting) | no-op rule, exit 0 on any failure, ISO stamps, pairing, archive scan, usage line | component (spawn, shape and pairing only) | add | real argv path including an id with spaces; asserts shape, never values |
| `update.js` `compareManifestVersions` (AC-8, D8) | lexical compare, trusting remote fields, accepting a non-numeric version | unit | add | pure helper; the `get` fix (timeout, redirect cap, body cap) needs a live or TLS server, so `none` (no network call in tests; new infrastructure would need Complication Approval) |
| `update.js` `--check-version` / `get` | offline crash, hang, redirect loop | none | none | only reachable over the network; covered indirectly by the pure helper; recorded as a residual risk, not a defect |
| Rule/workflow/skill/README/template text (AC-3, AC-7, AC-8) | a phase workflow loses its timing binding, a phase skill loses the runtime pre-approval, a mirror drops a command, the update choice leaves the hard list | contract (derives workflow and skill sets from disk) | add | AC-7 names these pins |
| `t_retrospective.html` duration section (D9, AC-6) | empty-log branch loses Duration or the TOC comment contradicts the h2 count | contract | keep (adapted) | the §18 pin asserted the superseded `< threshold`; now asserts Duration is kept and the count reaches the TOC threshold |
| `release-manifest.json`, generated views, other rule prose | hash ledger drift | existing integrity/sync pins | none | already covered by existing hash and sync checks; green |

## Removed tests

None.

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js`: sprint-025 AC-1/AC-4 (D2, D4) timingAppend … | mutation parent dropped in `timingAppend`: `node tests/run.js` → exit 1, `sprint-025 AC-1/AC-4 (D2, D4): timingAppend closes before it opens …`; runs: 1 |
| `tests/run.js`: sprint-025 AC-2 (D2) every kind the rule lists … | mutation `external-review` removed from `TIMING_KINDS`: exit 1, `sprint-025 AC-2 (D2): every kind sprint-lifecycle.md "Operation timing" lists …`; runs: 1 |
| `tests/run.js`: sprint-025 AC-4 (D4) timingRecover … | mutation ledger timestamps ignored in the end computation: exit 1, `sprint-025 AC-4 (D4): timingRecover closes every open op …`; runs: 1 |
| `tests/run.js`: sprint-025 AC-5 (D5, D6) timingSummary … | mutations top-N rank cut to 1 and minutes limit removed: each exit 1, `sprint-025 AC-5 (D5, D6): timingSummary reports totals …`; runs: 3 (the first top-N run passed, the fixture could not distinguish top-N from the limit; a short-ops ledger was added and the mutation rerun failed) |
| `tests/run.js`: sprint-025 AC-1/AC-4/AC-5 (D4) timing commands CLI … | mutation catch returns 1 in `timingCommand`: exit 1, `sprint-025 AC-1/AC-4/AC-5 (D4): the timing commands write ISO-stamped, paired lines …`; runs: 1 |
| `tests/run.js`: sprint-025 AC-8 (D8) compareManifestVersions … | mutation lexical `remote > local` in place of `compareVersions`: exit 1, `sprint-025 AC-8 (D8): compareManifestVersions orders versions numerically …`; runs: 1 |
| `tests/run.js`: sprint-025 AC-3/AC-7/AC-8 bindings, approvals and homes | mutations `"Operation timing"` renamed in `asd-phase-audit.md` and runtime approval removed from `asd-phase-plan/SKILL.md`: each exit 1, `sprint-025 AC-3/AC-7/AC-8: every phase workflow states its timing ops …`; reword control (`agent dispatches` → `agent calls` in the same workflow): no content-contract failure; runs: 3 (the entry's single control counted here) |
| `tests/run.js`: AC-4/AC-5/AC-7/AC-10 `t_retrospective.html` empty-log pin (adapted, new Duration assert) | superseded template restored (`<section id="duration">` removed and the comment's Duration dropped): exit 1, `AC-4/AC-5/AC-7/AC-10: t_retrospective.html classifies every section for the empty-log branch …`; runs: 1 |

Every canon-file mutation also trips the existing `upstream_hashes`/`canon_hashes` integrity pins; the named test above is the one that proves the new assert. Every mutation was restored in the same command; `git status` shows only the committed test file.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: shared framework files in the change surface)
- Result: pass — 280 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check`, `node .asd/sync.js --check` (exit 0)
- HEAD: e0f319ca

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every behaviour is automatable; the `update.js` network path is unverified by a test and is recorded above as a residual risk.
