[REVIEW-impl-simplification]: CONCERNS

# Review — simplification

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | critical | `.asd/templates/t_html-shell.html:127-128,171-180` | Dead code left "in case we need it" — API CSS block and superseded/deprecated status styles, both unreachable after this sprint's own deletions. | Delete. |
| 2 | critical | `.asd/templates/external-review/t_prompt-external-design.md:50,52` | Check for a case impossible by contract — rubric demands Goals/Non-goals the sprint draft never carries. | Delete both bullets. |
| 3 | critical | `.asd/templates/t_html-shell.html:202,206,208` | Comments restating a rule already SSoT'd in `artifact-layout.md`'s placeholder table (and a third time in the Documentation reviewer's rubric). | Delete the three comments. |
| 4 | medium | `t_html-shell.html:207`; `artifact-layout.md:129` | `{{LAYOUT_CLASS}}` is a pure function of `{{TOC_NAV}}` — two hand-computed placeholders encoding one fact. | Drop `{{LAYOUT_CLASS}}`; derive via CSS `:has()`. |
| 5 | medium | `.asd/templates/t_plan.md:23` | Restates the standing DoD that Task 3 moved to `sprint-lifecycle.md` "never restated in plan.md". | Replace with a pointer only. |
| 6 | medium | `.asd/agents/asd-external-review.md:53` | Inline copy of the pathspec rule that `external-review.md:51` already owns, and the copy is wrong for self-hosting. | Delete the inline copy; cite the rule. |
| 7 | medium | `asd-phase-design.md:21,63`, `asd-phase-design-review.md:23`, `asd-phase-design-promote.md:18` | Opus-tier PM dispatch wrapping a write the step itself calls "no user decision needed" — helper wrapping one call without added value. | Make inline, per Task 15's own pattern. |
| 8 | medium | `asd-phase-impl-review.md:29` vs `asd-reviewer-ui.md:23` | UI-surface predicate stated normatively twice — drift risk. | State once in `review-policy.md`, both sites cite it. |
| 9 | low | `.gitignore:18-20`, `asd-init/SKILL.md:54-55`, `artifact-layout.md:51,82-83`, `README.md:350` | C4 ignore entries landed in the one repo where the paths can't exist; `.gitignore` isn't in `managed_paths` so no consumer ever receives them. | Reword the claims to "do not commit"; do NOT add `.gitignore` to `managed_paths` or introduce a `t_gitignore` template (Complication Approval class). |
| 10 | low | ~15 canon sites | Sprint-local task/gap/risk ids leaked into permanent canon (unresolvable for any consumer). | Strip ids, keep the behavioural prose. |
| 11 | low | `asd-phase-impl-test.md:11` | Residual bare "api" word after Task 9's sweep. | Delete `api, ` from the read list. |
| 12 | low | `artifact-layout.md:199-209` vs `t_decisions-log.md:14-30` | Entry-format block and durability rule duplicated near-verbatim in two homes. | Keep the format in the template, reduce the rule doc to rule + pointer. |
| 13 | low | `AGENTS.md` § Architecture | "Sticky TOC sidebar" claim now stale — TOC is conditional. | Qualify the sentence. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 55/55 checked, 0 n/a · rules: 11 pass / 5 n/a / 6 resolved to findings`

**n/a rows**:
| Item | Reason |
|---|---|
| Generic with exactly one concrete type parameter | no type system in scope |
| Factory for fewer than three classes | no object construction in scope |
| Inheritance depth ≥3 without polymorphic dispatch | no type hierarchy in scope |
| Framework wrapping a framework | no dependency added or wrapped |
| Mock of a mock in tests | no tests in this diff |

**Findings rows**:
| Rubric item | Finding |
|---|---|
| Defensive code for impossible-by-contract case | finding #2 |
| Helper that wraps one call without added value | finding #7 |
| Comment that restates code | finding #3 |
| Dead code left "in case we need it" | finding #1, #9, #10, #11, #13 |
| Generic complexity-vs-value | finding #4, #5, #6, #8, #12 |

## Verdict
CONCERNS: 13 (3 critical checklist hits — over-engineering/dead-code class, all pure deletions)

## Next action
Route to `impl` review-fix mode; every fix is a deletion or a pointer, none adds an abstraction.

## Escalations
None.
