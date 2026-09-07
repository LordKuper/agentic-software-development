[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium (all `low`/nitpick findings dropped)
- **Scope**: incremental, 32 paths (`11333cb…60a991a`)

Method note: this reviewer has no shell, so the iteration delta was derived by reading the scope manifest, `tests/run.js`, `.asd/runtime.js`, the changed rules/workflows/templates and the sprint bookkeeping directly. Suite arithmetic corroborated structurally: 118 − 2 replaced + 2 replacements + 9 added = 127, and `tests/run.js` contains exactly 127 top-level `test(` declarations — the reported `127/127` is internally consistent, as is entry 3's "no production source in the delta" claim.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | medium | `tests/run.js:2194` (AC-7 guard) | The offender path pushes `path.join(d, f)`, but `d` is the arrow parameter of `['rules','workflows','agents'].map((d) => …)` on line 2187 and is out of scope in the loop body. The guard's **only** meaningful branch therefore throws `ReferenceError: d is not defined` instead of naming the offending file, and the plan's claim that it "would fail the moment any canonical `.md` reintroduces `asd-pm`" was clearly never exercised even once. | Iterate over labels (`for (const label of ['rules','workflows','agents'])`, resolving the dir inside) and push `` `${label}/${f}` ``; exercise the failure path once (temporarily add an `asd-pm` mention) so the diagnostic is proven, then revert. |
| F2 | medium | `tests/run.js:2251-2258` vs `.asd/runtime.js:130-148` (AC-10, AC-11) | `routeTask` is the sprint's core new mechanism and was rewritten this iteration, but every case shares `base = {objectiveInputs: true, risks: [], failedObjectiveCheck: false}` — there is no negative case at all. Deleting `input.objectiveInputs === true` from lines 141/142, or the `attempted >= 1` clause, or the `hasRisk` branch, leaves the suite green, so AC-10's "objective inputs and checks required; subjective confidence never sufficient" and AC-11's "escalates after one bounded correction attempt" / "emerging risk escalates immediately" clauses are unasserted. | Add negative cases: `{kind:'mechanical', objectiveInputs:false, checks:[…]}` → not `mechanical`; `{kind:'command', checks:[]}` → `execution:'agent'`; `{kind:'standard', failedObjectiveCheck:true, correctionAttempts:0}` → stays `standard`; `{kind:'mechanical', risks:['auth']}` → `critical` with `reason: 'risk:auth'`. |
| F3 | high | `.asd/templates/external-review/t_review-scope.json:1-9` vs `.asd/rules/external-review.md:46`; guard gap at `tests/run.js:2002-2010` | The scope-manifest transport is this iteration's new machine-readable contract (AC-1/AC-3), yet the canonical template has **zero** automated coverage: the JSON-parse guard reads only top-level `.asd/templates/*.json` (`readdirSync`, non-recursive), so `external-review/t_review-scope.json` is never even parsed. The `keep`/"no separate prose-only tests" decision is therefore not honest for this file — it is not prose. The gap is already live: the SSoT and the workflow both require `exclude_paths[]`, the produced manifest carries it, but the template omits it. Only the impl prompt string is asserted; the equally rewritten `t_prompt-external-design.md:20` is unasserted. | Record the decision as `add` in `test-plan.md` and author a contract test: template key set == `external-review.md:46` field list, `mode` placeholder present; recurse the JSON-parse guard into template subdirectories; extend the prompt assertion to the design prompt too. The missing template key itself is a one-line production fix. |
| F4 | medium | `.asd/project/stubs.md:16`; `tests/run.js:2327-2331`; contract `git-strategy.md:27`, gate `asd-phase-pr.md:1` | Stub disposition is only half right. Making the skip explicit beats the silent `return`, but the branch it guards (`runtime.js:36-44`, the PowerShell JSON-stdin fallback) is the D-2 metacharacter-injection fix — it has no coverage on any non-Windows host, and it is also the *only* evidence backing the first D-2 mutation row. The registry row additionally carries a test name instead of `File:Line`, has no matching `// TODO(sprint-006-workflow-cost-routing): …` marker (the registry contract requires marker + entry), and its Reason lacks the `(accepted-debt)` prefix — so the pr-phase stub gate will block this sprint as written. | Preferred: extract the invocation construction into a pure helper (`platform, command, args` → `{file, args, input}`), assert both the direct-spawn and PowerShell-fallback shapes on any host, delete the stub and keep the win32-only end-to-end check as a bonus. Fallback: fix the row to `tests/run.js:2327`, add the in-code marker, and obtain explicit user approval to prefix `(accepted-debt)`. |

Assessed and accepted (no finding): risk→check ladder fit — `T-1`; both removals, including the restored unfiltered drift assertion with `AGENTS.md` provably a real managed-block target — `T-2`; fail-first evidence, where the D-1 per-test stamp correctly supersedes the useless `103/111` run and all three D-2 mutations are genuinely equivalent, each mapping to exactly one assertion — `T-4`; determinism, with no sleeps, injected `now`, explicit `utimesSync` for credential rotation — `T-6`; edge cases on the cache/ledger core path — `T-8`; manual verification, where the `n/a` position is honest — `T-10`.

## Coverage

Manifest: [`testing.manifest.json`](testing.manifest.json) (digest `1c38a3f0…124188`). Validated ledger: [`testing.ledger.json`](testing.ledger.json). Findings: [`testing.findings.json`](testing.findings.json). `validate-ledger` → `{"ok":true}`.

**Manifest note for the orchestrator**: the dispatched manifest authorized `T-9` / `STUB_RESOLUTION` as `n/a: no-stub-change-this-sprint`, but that predicate does not hold — `stubs.md` registers an open sprint-006 stub. Both were therefore reviewed normally and returned as `finding` / `reviewed`. Regenerate the manifest without that predicate for iteration 3.

## Verdict
CONCERNS: 4

## Next action
Route F1-F4 to `impl` fix mode (F3's template key) and `impl-test` (F1, F2, F3's contract tests, F4's host-independent extraction plus stub row cleanup), then update `test-plan.md`: flip the `Gate/session prose and workflows` row so the scope-manifest template is an explicit `add`, and re-stamp the suite run at the reviewed HEAD rather than one commit behind.

## Escalations
- finding F4: escalate **only** if the team chooses to keep the platform-bound check as debt instead of making it host-independent — prefixing the stub Reason with `(accepted-debt)` is accepting known debt and requires explicit user approval (AC-21).
