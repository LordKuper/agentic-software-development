---
responsibility:
  owns: test approach, removal reasons, suite evidence, defects and manual verification
  excludes: tasks, requirements, review verdicts, code and change surface
  delegates_to: plan.md (tasks), sprint.md (criteria), reviews/impl/ (verdicts)
---

# Test plan — sprint 041-routerai-external-review

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | c822fed5 | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| AC-1–2 RouterAI profile, defaults and availability | Wrong CLI/model or cache identity, leaked configuration | CLI boundary contract | keep | `runtime-routing` exercises the RouterAI alias and provider arguments, absent/invalid/unsupported profile, original default routes and bounded cache identity without network or credentials. |
| AC-3–4 researcher dispatch | Role omission, writes or lost delegation | Agent/phase/renderer contracts | keep | Existing role inventory, read-only tools, canonical schema and renderer tests cover deterministic inputs. Standalone delegates are checked in `contract-workflows`. Inspect scope, design and plan handoffs and both generated views against the role contract. |
| AC-5 and AC-14 external metadata and wrapper host | CRLF breaks normal preflight or the wrapped CLI is mistaken for the invoking host | Runtime boundary contract | add | Scope requires CRLF regression coverage. Existing CRLF render tests exercise `sync`, not the preflight call site. Exercise canonical LF/CRLF metadata through both host defaults in isolation and verify the wrapper host and platform. |
| AC-6–7 decision and triage rules | Missing text numbering or accidental broadening of triage authority | Rule/call-site inspection | none | No machine-parsed token changed. Check the interactive, text fallback, label-only, and rewrite/close branches in the provider and scope rules. |
| AC-8 account-hold skip | Explicit hold retries or loses its reason and scope | Runtime cache contract and workflow inspection | add | Existing negative-cache test has no account-hold status. Extend it to record and surface account-hold without real provider access. Inspect both review workflows for the no-retry branch and use of manifest files. |
| AC-9 and AC-15 terminal Git check | Suite starts after repository discovery fails in its actual process environment | CLI contract | add | `suite-git-check` has no existing runner case. Exercise a temporary checkout and the same command under a deliberately invalid process-local Git environment. Check that the terminal workflow requires the expected SHA before running tests. |
| AC-10 dispatch timing ancestry | Orphan or closed-parent dispatch is appended | Timing contract | add | The existing valid-parent and duplicate-open cases have no refusal for a missing or closed phase ancestor. Extend a timing contract with refusal and a valid nested control, including an external-review dispatch. |
| AC-11 wave timing and shared context | Parallel completion times collapse to one or shared context is double-counted | Timing summary contract | add | No test asserts `impl_waves`. Use explicit intervals and two identical bundles to verify each completion and one shared byte contribution, including an unfinished operation. |
| AC-12 and AC-16 migration brief and reachability text | Lost fixture, provider identity or artifact revision during handoff | Rule/call-site inspection | none | Instruction changes do not add machine-parsed tokens. Review the migration brief and the durable provider evidence through recovery, reconciliation and review. |
| AC-13 suite revision | Removing useful coverage or weakening update checks | Survivor mutations and executable update cases | keep | Task 4 removed two duplicate assertions and proved surviving coverage. Preserve executable update scenarios. The explicit suite-revision pass follows a green impacted gate. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `tests/contract-workflows.test.js`: cleanup predecessor assertion | Redundant: survivor `tests/contract-workflows.test.js: workflow definitions are the single source for the phase set`, branch missing `impl-review → cleanup` | yes — Task 4 |
| `tests/contract-workflows.test.js`: reviewer presence assertion | Redundant: survivor `tests/contract-agents.test.js: read-only agents (AC-3)`, branch missing `asd-reviewer-quality.md` | yes — Task 4 |

Task 4 verified each survivor by an isolated mutation that selected one test and exited 1. Commands and runner-log paths are in the corresponding `decisions-log.md` pruning-proof entry. No further removal proposed in this pass.

## Added tests

| Test | Gap proof | Regression proof |
|---|---|---|
| `tests/runtime-routing.test.js`: preflight resolves LF and CRLF metadata and reports the invoking host | With either `crlf` or `host` seeded, `node tests/run.js runtime-routing --filter "named Codex review profiles"` → exit 0, one match each | Restore raw metadata reads (`crlf`) or omit wrapper host (`host`): `node tests/run.js runtime-routing --filter "sprint-041 AC-5/AC-14"` → exit 1 each, one match each, `sprint-041 AC-5/AC-14: preflight resolves LF and CRLF metadata and reports the invoking host`. Runs: 2 |
| `tests/runtime-routing.test.js`: a reported account hold remains distinct on the next preflight | With `hold` seeded, `node tests/run.js runtime-routing --filter "preflight permits only fixed local probes"` → exit 0, one match | Remove account-hold status (`hold`): `node tests/run.js runtime-routing --filter "sprint-041 AC-8"` → exit 1, one match, `sprint-041 AC-8: a reported account hold remains distinct on the next preflight`. Runs: 1 |
| `tests/runtime-timing.test.js`: dispatch timing requires an open phase ancestor | With `parent` seeded, `node tests/run.js runtime-timing --filter "timingAppend closes before it opens"` → exit 0, one match | Bypass ancestry validation (`parent`): `node tests/run.js runtime-timing --filter "sprint-041 AC-10"` → exit 1, one match, `sprint-041 AC-10: dispatch timing requires an open phase ancestor`. Runs: 1 |
| `tests/runtime-timing.test.js`: a wave reports separate completion times and counts identical context once | With `wave` seeded, `node tests/run.js runtime-timing --filter "a dispatch open takes context_bytes"` → exit 0, one match | Count identical context again (`wave`): `node tests/run.js runtime-timing --filter "sprint-041 AC-11"` → exit 1, one match, `sprint-041 AC-11: a wave reports separate completion times and counts identical context once`. Runs: 1 |
| `tests/runtime-tools.test.js`: suite Git check discovers HEAD in the runner environment and rejects an invalid Git directory | `git grep -n -e suite-git-check HEAD -- tests` → no matching existing test | Ignore inherited `GIT_DIR` (`git`): `node tests/run.js runtime-tools --filter "sprint-041 AC-9/AC-15"` → exit 1, one match, `sprint-041 AC-9/AC-15: suite Git check discovers HEAD in the runner environment and rejects an invalid Git directory`. Runs: 1 |

Mutation setup: `ASD_041_TEST_MUTATION=<key>` with `.asd/tmp/041-impl-test-mutations.cjs` loaded via `node --require` for `crlf`, `hold`, `parent` and `wave` regressions, or via `NODE_OPTIONS=--require` for `host`, `git` and gap runs. It changes runtime source reads in the dedicated runner processes only. Full runner logs are in `.asd/tmp/` with `041-routerai-external-review-impl-test-entry-1-author-suite-impl-test#1-` prefix. All five checks pass without the preload.

## Suite run

Pre-strategy run (step 3): 289/292, exit 1 at `9e615958234fc603184a26d2d3b1401f59698653`, same command. Runner log `.asd/tmp/041-routerai-external-review-impl-test-entry-1-strategy-suite-impl-test#1.runner.log`.

Post-authoring impacted run. D-1 and D-2 remain pending.

- Command: `node tests/run.js contract-agents contract-rules contract-templates contract-workflows runtime-review runtime-routing runtime-timing runtime-tools sync-cli sync-render update`
- Scope: impacted
- Scope evidence: changed test files plus direct agent, runtime, workflow, template and generated-view contract consumers and executable update checks. Safety-valve decision is pending at step 8.
- Result: fail — 295 passed, 2 failed (D-1 and D-2), runner exit 1. All five regressions and the repaired sync CLI test passed.
- Lint / build: pass
- HEAD: f7970f63bf4ac9d8c39281a26053c071c0a0d8a4
- Runner log: `.asd/tmp/041-routerai-external-review-impl-test-entry-1-author-suite-impl-test#1-author-impacted.runner.log`

Test defect repaired in step 7: `tests/sync-cli.test.js` asserted 11 primary Codex roles, actual 12. Derive exact primary paths from canonical roles and task variants. Keep the independent one-to-one quota assertion.

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | `README.md` | `AssertionError [ERR_ASSERTION]: README.md must state "dispatches N specialized agents"` | `README.md agent-count claims match the actual .asd/agents/*.md file count` | fixed | ea193353 |
| D-2 | 1 | `.asd/project/context-ceilings.json` | `AssertionError [ERR_ASSERTION]: the committed ceilings cover exactly the role-phase pairs and project rule files a fresh seed derives - a role or phase added without a ceiling fails here` | `sprint-037 AC-1: context-check exits 0 over the committed ceilings, exits 1 naming the one bundle whose ceiling a seeded edit lowered below its size, and --seed --bundles writes a ceiling for the same role-phase keys the committed file holds, which a clean check then passes` | fixed | 8d6a0839 |

D-1 also affects the old `Eight` claim and the 11 quota/22 generated-view counts. Dev owns the README fix. D-2 is missing 12 fresh-seeded researcher role-phase keys. The orchestrator owns the project configuration change and preserves existing ceilings.
