[REVIEW-impl-combined]: APPROVE

# Review — impl-review, combined, sprint 021, wave 1, iteration 06

Severity floor: `critical`. Scope: the manifest's 6 files, range since iteration 5 (AC-14 / Task 11, 13.4.0 bump + CHANGELOG, test rework, tester memory).

## Findings

| # | Severity | Location | Description | Fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

### Dropped below floor (not counted)

- high, `.asd/skills/asd-sprint/SKILL.md:30`: Step 1 now runs `gh pr list --head <state.branch>` on every invocation, at every phase. The existing "a `gh` failure is FAILED naming the fix" rule therefore blocks any mid-sprint resume when the user is offline or `gh` cannot reach the host. Before this change, only a `phase="pr"` sprint needed `gh`. AC-14 mandates the lookup, and FAILED is the conservative outcome, because skipping detection could resume a hand-merged sprint on the base branch. The named fix ("install gh / `gh auth login`") is misleading for a network outage. Possible fix: name "host unreachable, retry online" as the fix for that cause.
- medium, `.asd/rules/sprint-lifecycle.md:321`: the head-branch lookup defines outcomes only for `MERGED`, `OPEN` and "no hit". A `CLOSED` (unmerged) hit is unspecified. This gap existed before, but it is now reachable at every phase. Possible fix: "a `CLOSED` hit counts as no hit".
- medium, `.asd/rules/sprint-lifecycle.md:321`: "Refusal leaves the sprint active and resumable." For a sprint whose PR was merged at an earlier phase, every later invocation goes back to Step 1A. The remaining phases, and Step 2B's abort option, are never reachable again. Consistent with one PR per sprint, but "resumable" overstates it.
- low, `CHANGELOG.md:108`: does not tell consumers that every `/asd-sprint` invocation now makes a `gh` call, whatever the phase.

## Section coverage ledger

```json
{"manifest_digest":"2402d265576b3ee31f42871fab3c8c444479bf5920c9423808ecb6ab7c0deaf3","findings":[],"files":[{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-sprint/SKILL.md","s":"checked"},{"i":".claude/agent-memory/asd-tester-critical/project_testability-envelope.md","s":"checked"},{"i":"CHANGELOG.md","s":"checked"},{"i":"tests/run.js","s":"checked"}],"rules":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"pass"},{"i":"Security [impl-review]","s":"pass"},{"i":"Contracts [impl-review]","s":"pass"},{"i":"Best practices [impl-review]","s":"pass"},{"i":"AC coverage trace [impl-review]","s":"pass"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"pass"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"pass"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"pass"},{"i":"Algorithmic complexity [impl-review]","s":"pass"},{"i":"Regression detection [impl-review]","s":"pass"},{"i":"Hot path identification [impl-review]","s":"pass"},{"i":"SSoT","s":"pass"},{"i":"Template adherence","s":"n/a","p":"no templated artefact in scope"},{"i":"HTML shell wrapping","s":"n/a","p":"no HTML file in scope"},{"i":"Provenance","s":"n/a","p":"no HTML file in scope"},{"i":"Traceability","s":"n/a","p":"no HTML file in scope"},{"i":"Persistent actuality (impl-review)","s":"pass"},{"i":"In-code doc comments (impl-review, `code-style.md` §7)","s":"pass"},{"i":"Stub-resolution verification (impl-review)","s":"pass"},{"i":"Framework mode (`self_hosting: enabled`, impl-review only)","s":"pass"},{"i":"Documentation economy","s":"pass"},{"i":"Custom rules consistency","s":"pass"},{"i":"Overall quality","s":"pass"},{"i":".asd/project/custom-common-rules.md","s":"pass"},{"i":".asd/project/custom-coding-rules.md","s":"pass"}],"sections":[{"i":"Draft correctness [design-review]","s":"n/a","p":"outside phase gate"},{"i":"Bugs [impl-review]","s":"reviewed"},{"i":"Security [impl-review]","s":"reviewed"},{"i":"Contracts [impl-review]","s":"reviewed"},{"i":"Best practices [impl-review]","s":"reviewed"},{"i":"AC coverage trace [impl-review]","s":"reviewed"},{"i":"UI conformance [design-review — `n/a: outside phase gate` without a ux-spec/design-system draft; impl-review — conditional on a UI surface in scope]","s":"n/a","p":"no UI surface in scope"},{"i":"Over-engineering checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Structure / cohesion checklist [design-review, impl-review] — critical, undroppable","s":"reviewed"},{"i":"Complexity-vs-value tradeoff [design-review, impl-review]","s":"reviewed"},{"i":"Perf budget compliance [impl-review]","s":"n/a","p":"no budgets defined"},{"i":"Perf anti-patterns [impl-review]","s":"reviewed"},{"i":"Algorithmic complexity [impl-review]","s":"reviewed"},{"i":"Regression detection [impl-review]","s":"reviewed"},{"i":"Hot path identification [impl-review]","s":"reviewed"},{"i":"Overall quality","s":"reviewed"}]}
```

Coverage notes:
- **AC-14 trace**:
  - The home (`sprint-lifecycle.md:321`) defines the state at any `phase`. It runs the head-branch lookup for every sprint without `pr.number`, treats a `MERGED` hit as merged-unclosed and adopts an `OPEN` hit only at `phase="pr"`.
  - The acting site, `asd-sprint` Step 1 (SKILL.md:30), dropped its phase gate. SKILL.md:33 leaves `OPEN` handling to pr open mode, which runs only at `phase="pr"` (`asd-phase-pr.md` step 2).
  - Plan Task 11's Reachability holds: Step 1A step 2 carries the number, and the scope step 1 closure write reads it.
  - `tests/run.js` pins both sites (M-AK…M-AQ in `test-plan.md`).
- **Consumer search**: no canon line outside the home and Step 1 still gates detection on `phase="pr"`. The `session-start.js` offline check stays `phase="pr"`-only, and the home states that limit. README.md:192/449 stay accurate.
- **Test rework**: the gate value is now derived from the home clause that names `pr.number`. That fixes the accidental re-sourcing the memory edit describes. Adding the absence asserts to the positive-presence asserts avoids vacuous passes.
- **Release**: `asd_version` is 13.4.0 and matches the CHANGELOG heading. The `canon_hashes` and `upstream_hashes` entries were refreshed for the two changed managed files.

## Verdict

APPROVE. No findings at or above the `critical` floor. The Over-engineering and Structure checklists have no hits.

## Next action

The combined reviewer is done for wave 1. The dropped items above are optional follow-ups, candidates for the retro backlog.

## Escalations

None.
