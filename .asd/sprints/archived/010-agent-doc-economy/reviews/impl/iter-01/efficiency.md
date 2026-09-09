[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Manifest**: [efficiency.manifest.json](./efficiency.manifest.json) (digest `1eed9875…0dfe15`)
- **Validated ledger**: [efficiency.ledger.json](./efficiency.ledger.json) — `validate-ledger` → `{"ok":true}`

## Findings

### EF-1 — medium — simplify

**Location**: `.asd/workflows/asd-phase-impl-review.md:44-47`; `.asd/workflows/asd-phase-design-review.md:36-39`; `.asd/rules/review-policy.md:109-113`; `.asd/agents/asd-reviewer-efficiency.md:55,106,116`

Three sites where text added or kept this sprint does not earn its per-dispatch cost, all of the class `audit.md` catalogued as E-16 — a fact whose home is another file.

(a) The E-1 collapse left the interrupted/split/late block self-contradicting: the step header declares `review-policy.md` the sole SSoT and not restated here, then the first bullet restates it near-verbatim, and that bullet is byte-identical between the two workflow files (~430 B). The split and late bullets differ only in step number and `impl`/`design` path, leaving ~1.7 KB of the 2142 B near-duplicate the audit measured. The same defect at sentence scale in `asd-phase-impl.md:73`.

(b) `review-policy.md`'s new `row_example` paragraph adds ~700 B to the section all four internal reviewers read on every dispatch (~24 dispatches per sprint) while carrying no fact the reader lacks: the row shape literal is already at line 115, `p`/`f` placement is already in the `vocabulary` paragraph, and the paragraph concedes "Same four seams as `vocabulary`" before re-listing all four. Sharper: the one published example row is `s:"n/a"`, and this dispatch's manifest has `n_a:{}` — the sole shape the mechanism teaches is a row `validate-ledger` would reject here.

(c) `asd-reviewer-efficiency.md` was edited this sprint under exactly this rule (E-4 cut its duplicated "never autofix") but still states the review-policy-owned critical/undroppable claim at lines 55, 106 and 116.

**Suggested fix**: delete, do not shorten. (a) In both workflows cut the restated clauses, keeping only what the workflow itself does that the rule does not say — part-file paths, the `manifest-digest --write` invocation, step numbers, the request-user-decision binding; if a clause is judged load-bearing for the actor, drop the false "not restated here" instead — one or the other, never both. (b) Reduce `review-policy.md:109-113` to a clause on the `vocabulary` paragraph naming one filled row beside it on the same four seams. Keep the constant, the `--write` injection and the validator check as-is — the drift guard is five lines and earns them; the recurring cost is the prose, not the mechanism. (c) Keep line 55, cut 106 and 116. No new abstraction, no shared-fragment mechanism, no AC change — AC-6b still holds and the example still travels in the manifest.

### EF-2 — critical — simplify

**Location**: `.asd/sync.js:295`, against `168-183` and the new `185-195`

Over-engineering checklist, dead code left in case it is needed. `transformAgentClaude` calls `resolveModelFamily(manifest, 'claude', c.model, { name: meta.name, effort: c.effort })`, but on the `claude` path that fourth argument is unreachable: it is read only inside the `diagnostic` closure, and all three `diagnostic` throw sites are gated on `provider === 'codex'`; the claude branch at `:174` throws its own plain message ignoring `agent`. Task 11 is what makes this provable rather than merely unused — the new `validatedClaudeEffort` at `:296` is now the sole Claude effort validator, and the comment block at `:185-191` asserts the emission-site/family-resolution split as deliberate while the call site still hands `effort` to the resolver that discards it. A reader checking where Claude effort is validated is sent to the wrong function.

**Suggested fix**: one line, either direction — drop the fourth argument from the `:295` call, or make `:174` throw `diagnostic('unknown model family')` like its Codex twin so the argument becomes live and both providers report family, model and effort identically. No test pins the `:174` message. Verify the premise at HEAD before applying (`review-policy.md` "Verify before applying"): the claim is that `agent` is unreachable on the claude path, not that the line was added this sprint.

## Assessed and not raised

The wave table across `sprint-lifecycle.md`, `t_plan.md`, `asd-phase-plan.md` and `asd-phase-impl.md` is four sites for a cross-phase contract and removes a derived topological sort — net simplification, and its legacy fallback is real backward compatibility, not defensive code. `artifact-layout.md`'s AC-7 rule stays inside `audit.md` R-2's budget, and the same file's E-22 section scope in `providers.md` more than pays its bytes back. The `EFFORT_VOCABULARY` pair is two module-scope regexes, not an abstraction. No new rule doc, template, agent, config flag or dependency was added anywhere in scope.

## Coverage

No section `n/a`: the step-5 predicate is conjunctive and its second condition is false — `.asd/runtime.js`, `.asd/sync.js` and `tests/run.js` are executable sources in scope. `custom-coding-rules.md` defines no perf-budgets section, so Perf budget compliance resolves `pass`, not `n/a`; this manifest authorizes no `n/a` predicate for any id, and the row is truthful as `pass` — with no budget defined none is violated, and the sprint's executable changes move no latency, memory or throughput. No n+1, sync IO on a hot path, unbounded allocation or large-collection copy was introduced; `tests/run.js` adds three full-corpus sweeps of roughly 110 files each, bounded and sub-second, O(1) sweeps per sole-home claim rather than nested growth. No prior baseline existed (`audit.md` G-8); this sprint defines one — bytes read per dispatch — and the delta is strongly negative: roughly 18.7 KB cut from canon plus 4753 B removed from every non-HTML-authoring role's `artifact-layout.md` read, against roughly 2.5 KB added. EF-1(b) is the one addition landing in a hot read path without that measurement applied to it. The framework's hot path is per-dispatch rule bytes, and this sprint identifies and measures it explicitly; no unmeasured hot path remains beyond EF-1.

## Verdict

CONCERNS: 2

## Next action

Route to `impl` review-fix mode. Both findings are deletions inside files the sprint already owns — no escalation, no user decision needed. EF-2 is one line in `.asd/sync.js`, non-render canon, so refresh `.asd/release-manifest.json` `upstream_hashes` in the same commit. EF-1 touches two workflows, one rule doc and one agent file; the agent-file edit needs `node .asd/sync.js --apply .claude/agents/asd-reviewer-efficiency.md .codex/agents/asd-reviewer-efficiency.toml`. Grep `tests/run.js` for each sentence before rewording — `:3387` pins the git-strategy citation and `:3361-3365` pins the `review-policy.md` line publishing every `row_example` key, so EF-1(b)'s surviving clause must keep all three key literals on one line.

## Escalations

None required. Cross-reviewer guard: if another reviewer proposes fixing the workflow twinning by hoisting the shared block into a shared fragment, an include, or a new rule doc, that is a new abstraction requiring Complication Approval and should be refused on this sprint's own evidence — Codex supports no imports, no shared-workflow-fragment mechanism exists (`audit.md` R-4), and hoisting into `review-policy.md` grows the file every reviewer reads in full (R-8). EF-1's fix is deletion only.
