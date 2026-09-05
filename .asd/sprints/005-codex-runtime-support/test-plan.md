---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 005-codex-runtime-support

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | ea2fe4fc8ee91e4ae9129ba8e06a0ddc620dbe31 | full change surface |
| 2 | 5c9e546 | impl review-fix: root-relative skill paths and fail-first proof for added AC checks |
| 3 | 09a40fe | impl review-fix: uppercase and underscore command continuations |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/sync.js` Codex agent rendering | An empty, malformed, unsuffixed, mismatched, or unsupported family mapping, effort, or sandbox reaches delegate startup or reports no actionable context. | unit | add | AC-1, AC-3, AC-5, AC-6, AC-7: exercise invalid metadata and mappings directly; assert the diagnostic names agent, family, resolved model, and effort. |
| Canonical `.asd/agents/*.md` with `.asd/release-manifest.json` | A valid fixture can mask an invalid configuration on another dispatched role. | unit | add | AC-3, AC-6, AC-7: render every canonical Codex agent and assert its supported resolved model, effort, and sandbox; this covers PM and the non-`sol` tiers. |
| Codex skill rendering in `.asd/sync.js` | Rewriting `/asd-*` leaves Codex handoffs unusable or corrupts paths, URLs, and unrelated slash-prefixed text; Claude output regresses. | unit/component | add | AC-2, AC-4, AC-5, AC-7, AC-8: render representative commands and non-command text for both providers, asserting only standalone skill invocations change. |
| `.asd/hooks/session-start.js` | An archived non-`done` sprint is hidden, a completed or malformed archive is revived, or an active-folder/archive conflict violates the one-active-sprint invariant. | component | add | AC-2, AC-4, AC-5, AC-6, AC-7: run the hook in isolated temporary repos covering archived active, completed, malformed, and conflicting candidates. |
| Design-review workflow and External Review implementation prompt | Correctness is omitted for non-UI drafts, or iteration 2+ reviews the wrong range. | static contract | add | AC-2, AC-4, AC-6, AC-7: check the canonical workflow requires Correctness for every non-empty draft set and the prompt uses the previous recorded iteration HEAD. |
| External Review configuration and generated agent views | A Codex-primary run probes the wrong CLI or silently hides an unavailable wrapped CLI. | static contract/component | add | AC-2, AC-4, AC-6, AC-8: assert provider-specific generated commands, configured command keys, and the explicit availability-skip contract remain symmetric. |
| Existing generator fixture, placeholder substitution, read-only-agent, manifest-hash, and sync-current checks | Canonical/provider drift, model fixture regression, wrapper permission drift, or stale generated output escapes new targeted coverage. | unit/component | keep | Existing checks already cover fixture rendering, provider substitution, explicit read-only wrapper flags, generated-view current status, and hash completeness. |
| Existing SessionStart provider-command and availability-verdict checks | Provider-specific session hints or an explicit availability skip regresses while archived-sprint coverage is added. | component | keep | Existing isolated-hook tests cover `/asd-*` versus `$asd-*` output and satisfied availability-skip verdict display. |
| README, `AGENTS.md`, templates, and rule prose | Prose may drift, but this change adds no separately executable behavior beyond the generator and contract checks above. | static/architecture | none | AC-8 is covered by generated-view synchronization and impl-review documentation review; a prose-only duplicate test adds no independent failure mode. |
| Unchanged phase semantic mappings and acceptance/resume wording | No implementation boundary changed for generic hard-gate or resume text beyond the session hook and changed workflow contracts above. | static/architecture | none | AC-4 contracts changed in scope are covered above; testing every unchanged prose mapping would be redundant and implementation-coupled. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js: AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context` | E1 fail-first: disable ChatGPT-model validation; legacy `gpt-5.6` no longer throws and this check fails. |
| `tests/run.js: AC-3/6/7: every canonical Codex agent renders a supported delegate config` | E2 fail-first: change `asd-pm` sandbox to `unsafe`; canonical-role rendering fails for `asd-pm`. |
| `tests/run.js: AC-2/4/5/7/8: Codex skill rendering rewrites only standalone invocations` | E3 fail-first: restore the greedy pre-fix matcher; root-relative `/asd-sprint/usage` and `/asd-sprint.md` corrupt. |
| `tests/run.js: AC-2/4/5/6/7: SessionStart recovers only archived active sprints and reports conflicts` | E4 fail-first: return before archived scan; isolated archived `pr` sprint is not recovered. |
| `tests/run.js: AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope` | E5 fail-first: remove the required all-reviewer dispatch clause; static contract check fails. |
| `tests/run.js: AC-2/4/6/8: External Review CLI availability stays provider-symmetric` | E6 fail-first: alter the Claude availability-skip phrase; generated-view symmetry check fails. |

## Fail-first evidence — entry 2

The zero-dependency runner has no single-test filter, so each command below executes `node tests/run.js`; the named failing AC check is the targeted observation. Every mutation was temporary and restored before the final pass.

| Evidence | Temporary mutant and command | Observed fail | Restored result |
|---|---|---|---|
| E1 | In `.asd/sync.js`, replace the ChatGPT-runtime mapping validation branch with `if (false)`; `node tests/run.js`. | `AC-1/3/5/6/7` failed: `Missing expected exception: legacy unsuffixed model` (109/111). | `node tests/run.js`: 111/111 passed. |
| E2 | In `.asd/agents/asd-pm.md`, change `sandbox_mode` from `workspace-write` to `unsafe`; `node tests/run.js`. | `AC-3/6/7` failed: `asd-pm: invalid sandbox mode` (107/111). | `node tests/run.js`: 111/111 passed. |
| E3 | In `.asd/sync.js`, restore the pre-fix matcher without the terminal/path lookahead; `node tests/run.js`. | `AC-2/4/5/7/8` failed: `paths and URLs must remain literal` (109/111). | `node tests/run.js`: 111/111 passed. |
| E4 | In `.asd/hooks/session-start.js`, return before the archived-sprint scan; `node tests/run.js`. | `AC-2/4/5/6/7` SessionStart check failed: expected archived `777-open`, got no active sprint (108/111). | `node tests/run.js`: 111/111 passed. |
| E5 | In `.asd/workflows/asd-phase-design-review.md`, remove `Every internal reviewer is dispatched`; `node tests/run.js`. | `AC-2/4/6/7` workflow check failed on its required dispatch assertion (109/111). | `node tests/run.js`: 111/111 passed. |
| E6 | In generated `.claude/agents/asd-external-review.md`, alter `external review unavailable: <resolved command>`; `node tests/run.js`. | `AC-2/4/6/8` External Review check failed on the Claude availability-skip assertion (109/111). | `node tests/run.js`: 111/111 passed. |

## Fail-first evidence — entry 3

| Evidence | Temporary mutant and command | Observed fail | Restored result |
|---|---|---|---|
| E7 | In `.asd/sync.js`, replace the terminal lookahead `(?=$|[^.\\w/-])` with `(?=$|[^a-z0-9-/.])`; `node tests/run.js`. | `AC-2/4/5/7/8` failed: `paths, continuations, and URLs must remain literal` (109/111); the mutant rewrote uppercase/underscore continuations. | `node tests/run.js`: 111/111 passed. |

## Suite run

- Command: `node tests/run.js`
- Scope: full — safety-valve impacted set (shared framework infrastructure)
- Result: pass — 111/111 passed, 0 failed (two expected fixture warnings)
- Lint / build: pass / pass (`git diff --check`; `node .asd/sync.js --check`, 64/64 current)
- HEAD analysed: `09a40fe` (test delta committed separately)

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

## Manual verification

None. The changed behavior is deterministically covered by automated rendering, contract, and isolated-hook checks.
