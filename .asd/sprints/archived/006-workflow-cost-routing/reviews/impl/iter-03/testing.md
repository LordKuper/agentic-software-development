[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high
- **Scope**: incremental, 22 paths (`60a991a…08ea5d1`)

Method note: no shell available; the delta, suite state and fail-first claims were corroborated by direct file reads and static arithmetic only.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above floor `high` | — |

## Rule-by-rule basis (evidence, not narrative)

- **T-2 removals** verified against production rather than taken on trust: a grep for `readSelfHostingField|isSelfHostingRepo|self_hosting` in `.asd/sync.js` returns zero hits, so the six deleted tests were indeed the last consumers of deleted code. The claimed reversal of the iter-01 drift-filter narrowing is confirmed: the filter is the unfiltered `parsed.items.filter((item) => item.status !== 'current')`, and the expected-target list is enumerated from disk so it cannot pass vacuously. The only `.filter(... !== ...)` in the whole file is that line — no new exemption was introduced elsewhere.
- **T-4 fail-first**: each of the four `buildInvocation` mutations and the four `routeTask` clause mutations was re-derived against the real guards. All eight are load-bearing and mutually distinguishable — each lands on exactly one test. The recorded evidence is genuinely equivalent to a fail-first run, not a narrative.
- **T-5/T-7 meaningfulness**: the new assertions test the exported contract, not internals — that the command never appears interpolated in any PowerShell argument and travels only in the JSON stdin payload, i.e. the D-2 security property itself. The template key-set test pins the field list both ways, including the absence of `mode`/`commits`.
- **T-9 stub resolution**: the stubs table is empty, no `(accepted-debt)` waiver was introduced, and a repo-wide grep finds zero in-code `TODO(sprint-` markers — row and marker went together. The retirement is earned, not waived: the previously win32-locked branch is now a pure exported function asserted on any host, and the surviving win32-only end-to-end test is honestly demoted to a bonus with an announced skip.
- **T-6 determinism**: all added tests are pure or temp-dir scoped; no sleeps, clocks, seeds or ordering dependence. The recursive template scan cannot silently degrade — a count sanity assertion fails loudly if the recursive option is ignored.
- **T-1/T-3/T-8**: every risk row picks the cheapest sufficient level. `routeTask` now has real negative cases where it previously had none; the migration's five report branches are each exercised.

## Residual notes (below floor, not findings)

- `runLocal`'s ENOENT-detect → retry wiring is still unasserted on any host — the shape is covered, only the trigger condition is not. Failure mode is degraded availability, not unsafe execution.
- The template key-set test hardcodes the expected field list rather than deriving it from the rule doc, so doc-side-first drift still escapes; template-side drift is caught both ways.
- The AC-7 `asd-pm` guard scans only `*.md` directly under `.asd/{rules,workflows,agents}`; nested `.asd/skills/*/SKILL.md` is unscanned. Currently harmless.
- `.asd/skills/asd-init/SKILL.md:23` and `asd-update/SKILL.md:14` still point at the deleted `isSelfHostingRepo`. Documentation lane, flagged as the downstream trace of the six-test removal.

## Coverage

Manifest: [`testing.manifest.json`](testing.manifest.json) (digest `080465ef…da75ef`). Validated ledger: [`testing.ledger.json`](testing.ledger.json). `validate-ledger` → `{"ok":true}`. `T-10`/`MANUAL_VERIFICATION` use the authorized `automation-possible` predicate; `T-9`/`STUB_RESOLUTION` were reviewed normally, as this iteration's manifest authorized no predicate for them.

## Verdict
APPROVE

## Next action
Testing contributes an `APPROVE` to the DoD roster and latches. No residual note above blocks `NEXT: pr`.

## Escalations
None.
