[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2
- **Evidence**: [manifest](./documentation.manifest.json) · ledger below

I had no shell, so I read the 22 files in the manifest as they are now. To work out what changed, I used the decisions-log entry "impl review-fix for iter-01: findings resolved" and `external.scope.json`. I didn't recompute the release-manifest hashes. I checked them by structure instead: each `canon_hashes` entry matches its `upstream_hashes` twin, `t_subsystem.md` and `t_subsystems.md` are registered, and `t_subsystems.yaml` is gone. A grep confirmed the generated views carry the new sentences in canon, so sync ran.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1 | medium | `.claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md:14`; same stance at `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:8` | Two reviewer memories contradict the refusal rule they cite. `providers.md` "Role-scoped context" "**Declared tool policy**" (line 107) says an agent given an out-of-policy instruction "returns `QUESTION` naming the contradiction and does not comply". That `QUESTION` halts the phase (`asd-phase-impl-review.md` step 11). The correctness memory cites that same rule, then says "state the contradiction in the report instead of halting". The testing memory says "Do not stall or ABORT on that". `artifact-layout.md` "Agent memory" says a practice that contradicts the writer's definition is never recorded. Memory loads on every dispatch, so this is standing advice to break a signal contract. It is the 010 F-5 pattern that AC-5/AC-6 were written to close. | Fix the lines in each owning agent's memory, not in another agent's directory. Keep the valid part: a payload that only names a diff source, or offers a read fallback, is not out-of-policy, so review from reads. For a payload that really tells the agent to run a command it cannot run, point to `providers.md` "Declared tool policy" (`QUESTION`). Delete "instead of halting" and "Do not stall or ABORT". |
| DOC-2 | medium | `.asd/rules/review-policy.md:101` ("Coverage ledger"); sibling claim at `.asd/workflows/asd-phase-impl-review.md:28` (step 5) | The narrowed sole-home claim still says too much. `review-policy.md` says the standing predicates' "text, target ids and classifier member lists live only in `.asd/runtime.js`". Step 5 says "Their member lists and n/a text live only in `.asd/runtime.js`". But predicate text is quoted in canon on purpose: `review-policy.md` itself at 168 and 171 (`n/a: outside phase gate`), `asd-reviewer-correctness.md:20,22,24`, and `asd-reviewer-efficiency.md:24` (`n/a: no budgets defined`). `tests/run.js:4256-4275` even assumes these quotes exist and checks each one against `NA_PREDICATES`. A false "only here" claim is a trap: the next editor may treat those quotes as duplicates and cut them from the reviewer files, which are where the agents actually read them. | In both places, drop "text" from the claim, or say the text is owned by `NA_PREDICATES` and any quote of it in canon must match (the suite checks this). Keep "target ids and classifier member lists live only in `.asd/runtime.js`", which is true. |

Checked and fine at HEAD:
- **noHtml predicate and splitting:** `runtime.js` `noHtml`/`NA_TARGETS.html` agrees with review-policy's "Union property" rules.
- **Settings-change path:** these all agree on step 6, wave 1, and the `t_config.yaml` key check:
  - `sprint-lifecycle.md` "Settings change declaration"
  - `asd-phase-impl.md` step 6 and step 9
  - `asd-init` "Workflow (sprint-mediated)" step 2
  - `asd-sprint` "Skills dispatched"
  - the `t_plan.md` format comment
  - `asd-phase-plan.md` step 4
- **Registry writes:** the audit-phase registry and backfill wording in the architect agent (description, outputs, write access) matches `asd-phase-audit.md` step 3a and `sprint-lifecycle.md` "Audit phase".
- **README:** matches the folder map, the `runtime.js` description and the `/asd-init` row.
- **In-code doc comments:** the new `runtime.js` doc comments and the new `tests/run.js` tests add no comments inside function bodies.
- **Other memory files:** every other claim in the in-scope memory files still holds at HEAD.

## Coverage (internal reviewers only)

The compact ledger is below, tied to manifest digest `9b821206…4727`. HTML shell wrapping, Provenance and Traceability are `n/a` under the manifest's "no HTML file in scope" predicate.

## Verdict
CONCERNS: 2

## Next action
Route to impl review-fix:
- **DOC-2:** a dev edits the canon wording in `review-policy.md` and `asd-phase-impl-review.md` step 5, then re-runs `node tests/run.js`. That suite checks quoted predicates and cited symbols.
- **DOC-1:** only the owning agents may edit their memory files (`sprint-lifecycle.md` "Self-hosting" lets a dev write only its own memory directory). The orchestrator has to send this fix to `asd-reviewer-correctness` and `asd-reviewer-testing`, or decide explicitly who owns it.

## Escalations (optional)
- DOC-1: who is allowed to fix another agent's memory file is not settled by canon, so the orchestrator must route it. No user approval is needed for the fix itself.

```json
{"manifest_digest": "9b821206aa6f892eefa082c3270427e7ecd7c428d27c52a32271f15ad4e4f727", "findings": ["DOC-1", "DOC-2"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/templates/t_plan.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-audit.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-design-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl-review.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-impl.md", "s": "checked"}, {"i": ".asd/workflows/asd-phase-plan.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-correctness/feedback_review-method-no-shell.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-documentation/feedback_no-shell-doc-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/MEMORY.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-reviewer-testing/project_split-part-rubric-rows.md", "s": "checked"}, {"i": ".claude/agent-memory/asd-tester-critical/project_testability-envelope.md", "s": "checked"}, {"i": "tests/run.js", "s": "checked"}], "rules": [{"i": "SSoT", "s": "finding", "f": "DOC-1"}, {"i": "Template adherence", "s": "pass"}, {"i": "HTML shell wrapping", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Provenance", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Traceability", "s": "n/a", "p": "no HTML file in scope"}, {"i": "Persistent actuality (impl-review)", "s": "pass"}, {"i": "In-code doc comments (impl-review, `code-style.md` §7)", "s": "pass"}, {"i": "Framework mode (`self_hosting: enabled`, impl-review only)", "s": "finding", "f": "DOC-2"}, {"i": "Documentation economy", "s": "pass"}, {"i": "Custom rules consistency", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
