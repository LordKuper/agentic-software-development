[REVIEW-impl-combined]: APPROVE

# Review — combined

- **Phase**: impl-review
- **Iteration**: wave-1/iter-03 (severity floor: medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Coverage (internal reviewers only)

Manifest digest `f7a897008c0a4d0e37ea1a21072a6cb132de4824855eef6189671ac08de52f6d`. Rows below are the compact ledger. Nothing was found at or above the floor, so `findings` is empty.

```json
{"manifest_digest":"f7a897008c0a4d0e37ea1a21072a6cb132de4824855eef6189671ac08de52f6d","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/git-strategy.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/feedback_fail-first-and-none-honesty.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

Review notes, one line per checked area. None is a finding.

- **git-strategy.md:82 (tag creation).** The tag is created only when absent locally (`refs/tags/v<asd_version>`) and on `origin` (`git ls-remote --tags origin`). It is pushed only when absent on `origin`, and the release is skipped when `gh release view` succeeds. I traced every case:
  - Local tag but no remote tag: creation is skipped and the tag is pushed.
  - Remote tag but no local tag (a second clone): creation and push are both skipped, and `gh release create --verify-tag` resolves against the remote tag.
  - Both present: the tag steps are skipped.
  - Neither present: the tag is created and pushed.
  - The dropped retry sentence is not lost. Its content lives in `sprint-lifecycle.md` "Merged-unclosed" (Release retry) and in `asd-sprint` Step 1, and the release-commit definition stays here. That is one home per fact, so the drop is an SSoT gain and a token saving.
- **sprint-lifecycle.md:323 (Modes).** The DoD-gate skip is now credited only to `asd-sprint`'s release retry. This matches `asd-phase-pr.md` Open mode, where step 1 runs the DoD gate before step 2's `MERGED` head-branch hit. It also matches "Merged-unclosed", where an open-mode `MERGED` hit "continues in merge mode with that number and writes no state". `MERGED` is not the DoD-skipping dispatch in any other canon site: `DoD gate` occurs only at this line, and README line 192 states no skip.
- **tests/run.js.** I traced the changed asserts statically against the current text.
  - `override` and `skipClause`: the sentence contains no `;`, so `skippers` is "A dispatch carrying a confirmed `MERGED` number, `asd-sprint`'s release retry, enters ". The absence regex does not match it. The pre-fix wording "…release retry or open mode's `MERGED` hit" would match, so the assert is live.
  - The open-mode sanity holds: "DoD" is in step 1 and "`MERGED` hit" in step 2.
  - `tagStep` splits at `;` into the clause opening "none is `FAILED`…". `tagCreate` carries both the `refs/tags` span and the `git ls-remote --tags origin` span. `tagPush` carries the `origin` span. All three asserts pass on the current text.
  - The hoisted top-level `spans` (`run.js:3726`) has no remaining local redefinition or shadowing (grepped). `.map(spans)` at `run.js:6952` ignores the extra index and array arguments. The `expand` and `for…of` renames (`text`, `cell`) removed the two shadowing names, and `listed(` has no leftover caller.
  - The removed `retry` and `condition` asserts and the two `each time` locks leave their facts pinned at the home (`homeRetry`) and at the asd-sprint Step 1 condition asserts.
  - The doc comment on `spans` states purpose only (`code-style.md` §7), and the diff adds no in-body comments.
- **release-manifest.json.** Only the two `upstream_hashes` entries for the edited rule docs changed. Each old hash has no remaining occurrence and each file appears once. I have no shell in this role, so I did not recompute the SHA-256 values. I rely on `test-plan.md` "Suite run" (264/264 and `sync.js --check` 74/74 at the analysed HEAD).
- **Memory file.** The addition is hand-authored agent memory (the `artifact-layout.md` "Agent memory" carve-out; the file is edited, not a new file needing an index line). It gives the tester behaviour: a `none` that argues "an absence check would redden a correct reword" is falsifiable, and the absence must be clause-scoped with reword controls. It cites `code-style.md` §17, which exists, and it matches the entry-5 rows in `test-plan.md`. It passes the economy tests.
- **AC trace.**
  - AC-1: tag creation and push are idempotent per step, and the release publishes in merge mode.
  - AC-2 and AC-3: unchanged by this round and consistent with the Modes edit.
  - AC-4 to AC-10: not touched by this round's diff.
- **Manual verification.** `test-plan.md` "Manual verification" records none, so no row is judged failing.
- **Process note.** A repo-wide content grep I ran for `release retry` listed lines from other iterations' review files and `.asd/tmp/` return files in its output. I did not open those files, and every judgement above is derived from the current diff and canon.

## Verdict
APPROVE

## Next action
Reviewer done. No fix is needed. The orchestrator persists this return with `persist-review`.

## Escalations (optional)
None.
