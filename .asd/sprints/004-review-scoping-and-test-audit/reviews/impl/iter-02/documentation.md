[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2 (severity floor `medium`)
- **Scope**: incremental diff `d94c841...HEAD`, 25 files (self-hosting framework prose + this repo's own Node code)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-design-review.md:32` and `:35` vs `.asd/rules/review-policy.md:138`, `.asd/agents/asd-reviewer-efficiency.md:90` | This delta corrected the DoD table's design-review Efficiency section list to "over-engineering + structure/cohesion + **complexity-vs-value tradeoff** sections" (the agent's real section names), but the workflow that *builds the allowed-section payload* still says "design-principles.md adherence" (:32) and "Efficiency = over-engineering + structure/cohesion + **design-principles** sections" (:35) — while citing `review-policy.md` "DoD per review phase" as its source. The agent has no `design-principles` rubric section (design-principles.md is a mandatory-rule input, not a section), so the payload names a phantom section and omits the real third one; the step-8 section-coverage gate then accepts `Complexity-vs-value tradeoff` as `n/a: outside phase gate` — a rubric section silently dropped from every design-review, which AC-7 forbids. | Replace both workflow mentions with `complexity-vs-value tradeoff`, keeping `design-principles.md` where it belongs (the agent's Mandatory rules), so the three named allowed sections match `asd-reviewer-efficiency.md`'s headings exactly. |
| 2 | high | `.asd/rules/review-policy.md:138,141` vs `.asd/workflows/asd-phase-design-review.md:30,33,62,69`, `.asd/agents/asd-reviewer-correctness.md` (Stop conditions, clause 3), `README.md:214` | The delta introduced a **second, non-latch agent-level dispatch skip** for design-review Correctness (workflow :33 "this dispatch is **skipped entirely** … not counted toward DoD"; agent stop-condition 3 mirrors it), but the DoD SSoT was not amended and now states the opposite twice: :138 "…Documentation — **all dispatched for any non-empty draft set** unless APPROVE-latched" and :141 "Every internal reviewer above **is dispatched** in its listed phase(s) … what used to skip an agent now skips only a rubric SECTION inside a still-dispatched reviewer". The workflow cites review-policy's "a section never applicable is not counted as missing" as authority, but that sentence is about DoD counting, not about suppressing a dispatch. Two contradictory homes for one dispatch rule; a DoD aggregator reading the rule doc would treat the missing `correctness` key as blocking (`sprint-lifecycle.md` "State recovery" absent-key branch). | Amend `review-policy.md` (DoD table row + the "Every internal reviewer above is dispatched…" paragraph) to state the one design-review exception explicitly — Correctness is dispatched only when a ux-spec/design-system draft is in the set, otherwise not dispatched and not counted — and keep the "section-level only" claim scoped to impl-review's `scoped_fan_out`. Re-check `README.md:214` reads unambiguously as impl-review-only. |
| 3 | high | `.asd/hooks/session-start.js:102-108` | New member-level doc comment violates `code-style.md` §8 (references `sprint-lifecycle.md` "APPROVE latch" / "State recovery" and External Review's documented skip form) and carries a sprint-local `AC-2` label — the only surviving `AC-` string in any `.asd/**/*.js`, i.e. exactly what this delta's AC-strip pass was for, left in permanent code shipped to every consumer. It also fails §7's "member-level doc states purpose, never implementation": it narrates the accepted verdict-string forms, the latched-key branch and the legacy carve-out rather than the function's purpose. | Reduce to a purpose-only doc with a standalone rationale, no document reference and no AC id (e.g. "Session-summary verdict colour for one review node; a latched reviewer counts as satisfied even with no verdict entry. Display-only, never a gate; fails silently on any malformed shape."). |
| 4 | high | `tests/run.js:1547-1554, 1682-1683, 1698-1701, 1741-1744, 1833`; doc comment at `:1783-1786` | `code-style.md` §7 bans comments inside method/function bodies outright, and the user's iter-01 escalation decision put this sprint's own code under that rule. The fix cycle cleaned the old ones but the new/rewritten tests add five fresh in-body comment blocks (orphan-prune rationale, "The OLD engine lacks newHelper…", "Poison require.cache…", "A second retired agent's skill target…", "No package.json/pyproject.toml… nothing to detect"). Separately, `realisticCommandsYaml`'s doc comment references `t_commands.yaml` and `/asd-init` — a project-document reference banned by §8 (the new §8 exception permits an `AC-N` **id in a test name/path** only, never prose referencing a document). | Move the rationale into the test names / fixture-helper names (each block's content is already a sentence about what the test proves), delete the in-body comments, and restate the helper doc without naming template or skill files. |
| 5 | medium | `.asd/templates/t_review.md:28,30-33` vs `.asd/rules/review-policy.md:107` (and both review workflows' step 7/8) | The template now instructs the **persisted** review file to carry a full Section-coverage table, "one row per named rubric section, every dispatch" — but the Persistence SSoT drops `reviewed` rows from the written file and routes every section `n/a` row into the shared n/a list, so the table both contradicts the reduction and duplicates the n/a list. The summary-line placeholder on :28 is also unresolvable as written: nested braces are not a valid placeholder form. | Drop the standalone Section-coverage table (section n/a rows already belong in the n/a list) and express the conditional suffix as plain optional text, single brace level. |
| 6 | medium | `.asd/rules/sprint-lifecycle.md` "Impacted test set" item 3 → `.asd/templates/t_test-plan.md:42`, with `.asd/rules/code-style.md:62` | The delta narrowed the AC-citation channel to a test's **name or path** (§8 exception) and repointed the impacted-set definition at `t_test-plan.md` "Added tests" as that convention's home — but that home still reads "Level and AC/risk covered are visible in the test file itself (name, path, **comment**)", sanctioning an in-test comment channel that §7 bans outright and §8's exception excludes. The change made the referenced SSoT incorrect. | Edit `t_test-plan.md:42` to "(name, path)", so the convention's stated home matches §7/§8 and the rule that now cites it. |

## Coverage

**Summary**: `files: 25/25 checked, 0 n/a · rules: 5/9 pass, 6 findings, 3 n/a`

**`n/a` rows (full list)**

| Rubric item | Reason |
|---|---|
| HTML shell wrapping / placeholders / no hand-authored chrome | no HTML artifact or template in the iteration's scope list |
| Provenance flag correctness (`original` / `reverse-engineered` / `migrated`) | no provenance-carrying artifact in scope (`self_hosting`, no consumer `docs/`) |
| Persistent-doc actuality vs implementation | no consumer `docs/` in this repo — the framework-mode check substitutes |
| Section coverage ledger | this reviewer declares no named rubric sections — `review-policy.md` "Coverage ledger" part 3 applies to Correctness and Efficiency only |

**Finding rows (verbatim)**

| Rubric item | Finding |
|---|---|
| SSoT — each fact one home, downstream links not copies | finding #1 |
| SSoT — each fact one home, downstream links not copies | finding #2 |
| SSoT — each fact one home, downstream links not copies | finding #5 |
| SSoT — each fact one home, downstream links not copies | finding #6 |
| In-code doc comments (`code-style.md` §7, severity `high`) | finding #3 |
| In-code doc comments (`code-style.md` §7, severity `high`) | finding #4 |
| Framework mode — README + `.asd/rules/**` vs canonical diff | finding #2 |

## Verdict

CONCERNS: 6 (4 high, 2 medium)

## Next action

All six are creator autofixes inside the change surface (framework prose + this sprint's own comments); none touches a concept, contract, abstraction or sprint scope, so no escalation. Route to `impl` review-fix: findings #1, #2 to the rule/workflow pair (`review-policy.md`, `asd-phase-design-review.md`), #3/#4 to the code owner, #5 to `t_review.md`, #6 to `t_test-plan.md`. Note for the fix pass (out of this iteration's surface, not a finding): `update.js:74-83` and `:263` still carry in-body comments predating this delta — confirm whether they fall inside "code this sprint wrote" before touching them.

## Escalations

None.
