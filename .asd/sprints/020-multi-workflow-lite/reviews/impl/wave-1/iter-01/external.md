[REVIEW-impl-external]: CONCERNS

# External Review Report

- **Phase**: impl-review
- **Iteration**: wave-1/iter-01
- **Severity floor (this iter)**: low
- **Unreviewed files**: none

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | .asd/runtime.js:513 | `persistReview`'s guard `if (!verdict.startsWith('APPROVE') && findings.length === 0) fail(...)` only rejects a non-APPROVE verdict with an empty findings table. Nothing rejects a plain `APPROVE` (or the external `APPROVE (skipped: ...)` form is explicitly forced to `[]`, but plain `APPROVE` is not) whose body still carries a non-empty findings table — a malformed/contract-violating reviewer return of that shape is persisted as a clean approve, silently discarding the listed findings and letting DoD be satisfied while they remain unresolved. | Add a symmetric check: `verdict === 'APPROVE' && findings.length > 0 → fail(...)`, so any findings table under a bare APPROVE is rejected rather than silently accepted. |
| 2 | high | .asd/agents/asd-reviewer-combined.md:23 (new file, interacts with unchanged .asd/agents/asd-reviewer-documentation.md:64 "Persistent actuality") | Combined (lite's only impl-review reviewer) gates its whole Documentation rubric block only on "any documentation file in scope" (`runtime.js:416`, `isDocumentation` matches any `.md`/templated file) — it does not gate the inherited "Persistent actuality" entry on whether design-promote has already run. In `lite`, design-promote (which is what actually updates stack/commands/requirements/ADR-absorbing docs from the implementation) runs *after* impl-review DoD, not before it (`asd-phase-design-promote.md` line 3, `sprint-lifecycle.md` "Workflows" line 27). So every lite impl-review wave that happens to touch any `.md` file inherits a check asking whether persistent docs already reflect the just-implemented code — structurally unsatisfiable before design-promote has run, for every lite sprint. The existing carve-out on `asd-reviewer-documentation.md:64` ("skip docs never applicable this sprint (documents.* disabled)") only exempts documents.*-toggled docs (prd/ux_spec/adr), not the unconditional stack/commands/requirements artifacts the same sentence names. | Either exempt "Persistent actuality" specifically (not the whole Documentation block) under `lite` pre-design-promote, or reword it to check actuality against the *previous* wave's promoted state rather than the current sprint's not-yet-promoted implementation. |

## Dropped findings (counts only)

- Below severity floor (iter 1, floor low): 0
- Nitpick, by category: 0
- Not kept — verified against SSoT text, judged false positive or already resolved (2): see notes below for PM to overrule if disagreed

**Note on dropped findings** (kept out of the counts-only table per template, but detail given since these were codex's other two `major` findings and the calibration reasoning is non-obvious):
- Codex F1 (`.asd/skills/asd-sprint/SKILL.md:45`, "lite resume at design-promote wrongly dispatches plan under the collapse test"): `sprint-lifecycle.md` line 21 is explicit — "the design-block collapse … applies only to a workflow whose `phases` contain `design`." `lite`'s `phases` never contain `design` (line 24: "No `design`, no `design-review`, no drafts"). So "under the collapse test" in SKILL.md:45 is structurally false for `lite`, and a `lite` resume at `design-promote` falls through to the general rule ("resume re-enters `phase`") — i.e. it re-enters `design-promote`, not `plan`. This reads as already correctly guarded by the SSoT clause codex didn't cross-reference; treating as a false positive.
- Codex F4 (`.asd/workflows/asd-phase-design-promote.md:8` + `asd-dev.md`/`asd-ux.md`, "no path for a lite impl-time missing UI token"): `asd-ux.md`'s "Token decisions" bullet is a general, phase-independent mechanism — dev hits a missing/changed token → `QUESTION` → orchestrator decides via `checkpoints.md` → re-dispatches dev with the decision → dev "record[s] each approved delta before using it" (plausibly a decisions-log entry, not necessarily a `DESIGN.md` patch) → dev proceeds to code the value. `DESIGN.md` itself is only formally patched later at lite design-promote, built from the implemented UI (`asd-ux.md:46`). This reads as a coherent decide-then-defer-the-doc-write path, not a dead end — but it rests on an inference about what "record" means that isn't spelled out anywhere; worth a maintainer sanity check even though I'm not keeping it as a finding.

## Verdict
CONCERNS: 2

## Next action
Dev/architect autofixes the two kept findings (runtime.js validation gap; combined-reviewer Documentation-rubric sequencing for lite) and re-submits for wave-1/iter-02. PM should also skim the two dropped-with-note items above — my reasoning for dropping them rests on cross-referencing SSoT wording rather than a code trace, so a five-minute second look before treating them as fully closed is cheap insurance.

---
Process notes for the dispatching orchestrator (not part of the review content):
- Preflight was `local-ready`; `codex` CLI invoked once via `codex exec --model gpt-6-sol -c model_reasoning_effort="high" --sandbox read-only -`, prompt+scope-manifest on stdin, ran to completion (146,738 tokens, exit 0). No retry needed.
- Scope manifest: `.asd/sprints/020-multi-workflow-lite/reviews/impl/wave-1/iter-01/external.scope.json`; diff: `.asd/sprints/020-multi-workflow-lite/reviews/impl/wave-1/iter-01/594e6fa0d508c46d.diff`.
- Operational note: the first invocation attempt redirected the wrapped CLI's stdout to a scratch file when the Bash tool auto-backgrounded a >120s call — a violation of the "no file writes at all, stdout capture only" contract. Not repeated; the review text above came from the Bash tool's own background-task tracking file. Future dispatches should pass an explicit longer foreground timeout instead of letting an under-timeout call auto-background.
