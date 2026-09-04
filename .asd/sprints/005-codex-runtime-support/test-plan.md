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
| 1 |  | full change surface |

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
| `tests/run.js: AC-1/3/5/6/7: Codex renderer rejects invalid delegate config with context` | Targeted input mutations: legacy `gpt-5.6`, mismatched family, unknown family, invalid effort/sandbox, and missing Codex block all reject with full diagnostic context. |
| `tests/run.js: AC-3/6/7: every canonical Codex agent renders a supported delegate config` | Broad invariant; all 12 dispatched canonical agents must render a supported model, effort, and sandbox. The legacy unsuffixed mapping is proven rejected by the preceding targeted mutation. |
| `tests/run.js: AC-2/4/5/7/8: Codex skill rendering rewrites only standalone invocations` | Demonstrable pre-fix behavior: identity/Claude rendering leaves `/asd-*`; the check requires `$asd-*` only for standalone invocations and preserves path/URL text. |
| `tests/run.js: AC-2/4/5/6/7: SessionStart recovers only archived active sprints and reports conflicts` | Demonstrable pre-fix behavior: the prior top-level-only scan omitted archived `pr` state; isolated archive fixtures now require recovery and conflict warning. |
| `tests/run.js: AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope` | Demonstrable pre-fix source behavior: Correctness had a non-UI dispatch skip and the prompt used last commit; required canonical clauses reject both regressions. |
| `tests/run.js: AC-2/4/6/8: External Review CLI availability stays provider-symmetric` | Targeted contract mutation: either provider's command key, `--version` probe, or availability-skip text removal fails the generated-view symmetry check. |

## Suite run

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|

## Manual verification

None. The changed behavior is deterministically covered by automated rendering, contract, and isolated-hook checks.
