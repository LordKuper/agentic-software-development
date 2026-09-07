[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium — low findings dropped)
- **Scope**: incremental diff of the iteration-1 review fixes, 12 files
- **Section scoping**: five performance sections in force; *perf budget compliance* alone `n/a` — no perf-budgets section exists in `custom-coding-rules.md`.

## Findings

| # | Sev | Location | Description | Fix |
|---|---|---|---|---|
| EFF2-1 | critical | `.asd/migrations/6.0.0.js:18-24`, duplicated at `:53-54` | Over-engineering checklist hit: comment that restates code. The rewrite shed the line scanner but grew the header to 29 lines (the `5.0.0.js` equivalent is 11), and its third paragraph narrates the implementation — "removal is a parse / delete / re-serialize" restates `JSON.parse` plus `delete`; the sentence about 2-space indent and carried-over line endings is already carried verbatim by `serializeLike`'s own comment below; "a file that does not parse is left byte-for-byte alone and reported for a hand edit" restates the catch branch and its warning string. The parenthetical about what the previous implementation mishandled is archaeology about code that never ships — no future reader can act on it. | Delete `:18-24` and keep the one non-derivable claim: sprint state is machine-written and every reader parses it, so its byte layout is not worth preserving and the rewrite is whole-file. Keep the scope-exception rationale and the retro-phase no-op paragraph — both non-derivable. Net −6 lines, no information lost. |
| EFF2-2 | medium | `AGENTS.md:107` | The "generative rule" rewrite did not shed the enumeration: it kept a five-item site list AND added a sentence asserting that enumerating the sites has proven incomplete twice. The bullet now declares its own list unreliable while still costing roughly 45 words in a file auto-loaded into every agent's context every turn — and it is doubly redundant, because `tests/run.js` §16 now machine-checks `session-start.js`, every workflow `NEXT:`, the skill/workflow bijection, the `core.md`/`sprint-lifecycle.md`/`checkpoints.md` chain lines and README's table, flowchart and count words. None of that is mentioned, so the one load-bearing fact is missing while the stale-prone one is spelled out. | Drop the site enumeration. State the invariant plus the two real instruments: every chain assertion names the same eleven phases in the same order; `tests/run.js` §16 machine-checks the mirrors; for anything it cannot reach, grep the phase names and update every hit together. Net roughly −30 words in an always-loaded file. |
| EFF2-3 | medium | `tests/run.js:2592-2617` | Complexity vs value: a standalone third migration test whose assertion is guaranteed by the language rather than by the code under test — `delete state[RETIRED_KEY]` on a parsed object cannot reach a nested member, so no edit short of replacing the implementation wholesale can break it, and the shape-variance matrix it belongs to was written against the deleted line scanner. It also overlaps the multi-line fixture already present. Twenty-six lines of temp-dir and report boilerplate for zero added discrimination on a one-shot script frozen at release. | Fold the nested fixture into the existing shape-variance test as a fourth sprint directory with one deep-equality assertion, deleting the separate test block, its temp-dir setup and its duplicate `stripped` assertion. Net roughly −20 lines. Straight deletion is also defensible; folding keeps the top-level-only contract written down. |
| EFF2-4 | medium | `.asd/workflows/asd-phase-retro.md:20` | Trimming moved prose rather than removing it here: step 4 cites `sprint-lifecycle.md` "Retro phase" and then restates two of its clauses in the same sentence — the evidence list is the rule's own line verbatim minus "dispatch cost", and the sentence about each row naming its acting side duplicates another rule line. Two statements of one normative fact, already drifting (the missing term), in a file loaded on every retro dispatch. | Reduce to: derive both output classes per the rule — remediation from the step-3 causes, systemic proposals read off the run record above. Net roughly −25 words, drift surface removed. |

### Explicitly judged, not raised

`replaceFileAtomically` stays — it wraps two stdlib calls but adds crash-safety semantics for a consumer's sole sprint recovery point, not a value-free wrapper. The parse catch branch and the non-object guard stay — `state.json` is hand-editable by consumers, so unparsable input is not impossible-by-contract, and the guard prevents a throw. The chain-position triple in the tests stays, borderline: it pins literals against literals, but it is a deliberate spec lock on AC-8 at a cost of four lines. The merged action table strictly dominates the prior split, no residue. The retro skill's narrowed tools are proportionate to a workflow that writes one artifact plus state. The structure/cohesion check passes: `tests/run.js`'s multi-subject spread is the pre-existing single-runner design, outside this iteration's change surface — the sprint only appended sections. Performance: the migration is linear in active sprints with one read and write each, no hot path, no n+1, no unbounded allocation; the tests add four temp-dir cases to a suite with no measured budget.

## Verdict

CONCERNS: 4 (1 critical, 3 medium). All are dev-autofixable trims; none requires escalation and none adds an abstraction, layer or dependency.

## Next action

Route to `impl` review-fix mode.

## Escalations

None.

## Coverage ledger

```json
{"manifest_digest":null,"findings":["EFF2-1","EFF2-2","EFF2-3","EFF2-4"],
"files":[{"i":".asd/migrations/6.0.0.js","s":"checked","f":"EFF2-1"},{"i":".asd/release-manifest.json","s":"checked"},{"i":".asd/rules/artifact-layout.md","s":"checked"},{"i":".asd/rules/sprint-lifecycle.md","s":"checked"},{"i":".asd/skills/asd-phase-retro/SKILL.md","s":"checked"},{"i":".asd/templates/t_friction-log.md","s":"checked"},{"i":".asd/templates/t_retrospective.html","s":"checked"},{"i":".asd/workflows/asd-phase-impl.md","s":"checked"},{"i":".asd/workflows/asd-phase-retro.md","s":"checked","f":"EFF2-4"},{"i":"AGENTS.md","s":"checked","f":"EFF2-2"},{"i":"README.md","s":"checked"},{"i":"tests/run.js","s":"checked","f":"EFF2-3"}],
"rules":[{"i":"OE-single-implementer-interface","s":"pass"},{"i":"OE-single-type-generic","s":"pass"},{"i":"OE-factory-lt3","s":"pass"},{"i":"OE-plugin-no-plugin","s":"pass"},{"i":"OE-abstraction-no-second-use","s":"pass"},{"i":"OE-premature-config-flag","s":"pass"},{"i":"OE-defensive-impossible","s":"pass"},{"i":"OE-stdlib-wrapper-helper","s":"pass"},{"i":"OE-inheritance-depth","s":"pass"},{"i":"OE-framework-wrapping-framework","s":"pass"},{"i":"OE-mock-of-mock","s":"pass"},{"i":"OE-comment-restates-code","s":"finding","f":"EFF2-1"},{"i":"OE-dead-code-just-in-case","s":"pass"},{"i":"SC-1-god-type","s":"pass"}],
"sections":[{"i":"over-engineering-checklist","s":"reviewed"},{"i":"structure-cohesion-checklist","s":"reviewed"},{"i":"complexity-vs-value","s":"reviewed"},{"i":"perf-budget-compliance","s":"n/a","p":"no budgets defined"},{"i":"perf-anti-patterns","s":"reviewed"},{"i":"algorithmic-complexity","s":"reviewed"},{"i":"regression-detection","s":"reviewed"},{"i":"hot-path-identification","s":"reviewed"}]}
```
