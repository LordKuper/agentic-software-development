[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-02

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

Review basis: I read the incremental diff `3786b0eed59f5515.diff` (9 files) in full. I checked each iteration-1 finding against the current canon:
- **C1 (fixed):** the phase reopen guard is in `timingAppend` (`.asd/runtime.js:1149`). The asd-sprint "Phase ops" line covers the `QUESTION` user-wait and reuse of the open phase op. The new unit case in `tests/run.js` asserts an empty append and one warning.
- **C2 (fixed):** `sprint-lifecycle.md:300` now says to quote the whole `--attrs` value.
- **C3 (fixed):** the impl-review binding brackets step 8's and step 9's tester dispatches. Both are routed with their own `task_routing` ids (`asd-phase-impl-review.md` steps 8 and 9), so a step-8 test-fix dispatch cannot share an id with step 9's `suite` parent.
- **C4 (fixed):** the pr binding closes the op before step 2's hand-over.
- **C5 (fixed):** id forms are given per kind, `iteration`/`wave` are specified as plain integers, and the source of tier/model for unrouted dispatches is named.
- **C6 (fixed):** `sprint-lifecycle.md:308` is now a pointer. `git-strategy.md` lines 43 and 45 hold the full ledger-commit rule.
- **C7 (fixed):** README rows 329 and 347 are corrected.

External Review's iteration-1 findings 1–3 are resolved by the same changes:
- `slowOps` subtracts each op's clipped user-wait overlap through `unionMs`. Clipped intervals that do not overlap contribute 0 and cannot move `reach` past a real overlap, so the machine time stays between 0 and `op.ms`.
- The leaf filter excludes ops that another machine op names as `parent`. Parallel siblings stay eligible.
- Medians are computed over the same machine-time leaves.
- The new test's three mutations go red according to `test-plan.md`. The adapted `timingSummary` fixture moves the wait to a window with no dispatch; machine-time and phase-union expectations are unchanged.

What I did not recompute:
- The `release-manifest.json` hashes (6 canon files, both `canon_hashes` and `upstream_hashes` for asd-sprint). I have no shell.
- The suite result, 281/281 at entry 2, which I took from `test-plan.md` "Suite run". The tree is clean at `a9d47225`.

`test-plan.md` records no manual-verification rows.

Two residuals, both below the medium floor and not counted:
- **pr open mode step 2 `MERGED` hit:** "writes nothing", yet the binding now commits the ledger alone there. That commit lands on the already-merged sprint branch and never reaches base. It is harmless, but the pr op's close is lost from the archive.
- **asd-sprint "Phase ops":** its user-wait clause partly restates the sprint-lifecycle "Writers" sentence. This is the wording iteration 1 suggested.

```json
{"manifest_digest":"0e5e8214c1363da4c1aac63736c8de507d45b1e8950c0b64fb1158244637a487","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/runtime.js","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-review.md","s":"checked"},{"i":".asd/workflows/asd-phase-impl-test.md","s":"checked"},{"i":".asd/workflows/asd-phase-pr.md","s":"checked"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

AC trace (delta only):
- **AC-2:** met. The id forms and attr formats are specified (C5). The step-9 tester dispatches are bracketed (C3).
- **AC-3:** met. The pr hand-over close is added (C4). impl-test and impl-review pass the dispatch id as the `suite` parent.
- **AC-4:** met. The phase reopen guard stops a `QUESTION` re-delegation from double-opening a phase (C1).
- **AC-5:** met. The slow set measures machine time over true leaves (External 1, 2). The attrs quoting prevents lost tier/model attrs (C2).
- **AC-7:** met. README is corrected (C7) and the hashes are updated (not recomputed, see basis).
- **AC-1, AC-6 and AC-8:** unchanged by this delta.

## Verdict
APPROVE

## Next action
None from this reviewer. Wave 1's combined roster entry is met at iteration 2.

## Escalations (optional)
None.
