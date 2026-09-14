[REVIEW-impl-documentation]: CONCERNS

# Review — documentation (part 1 of 2)

- **Phase**: impl-review
- **Iteration**: 1
- **Evidence**: [manifest](./documentation.part-1.manifest.json) · ledger below

I had no shell in this dispatch, so I could not run `git diff`. I read all 20 manifest files in full or in the relevant sections, and cross-checked them against `sprint.md`, `plan.md`, `audit.md` and `decisions-log.md`. I checked the `release-manifest.json` and `sync-state.json` hashes only by structure, not by recomputing them: `t_subsystem.md`/`t_subsystems.md` are present, `t_subsystems.yaml` is gone, and the `AGENTS.md` digest matches the `t_AGENTS.md` upstream hash. The root `AGENTS.md` managed block carries the new settings-change hard rule; the snapshot loaded at session start is older than the last sync.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| DOC-1-1 | medium | `.asd/rules/review-policy.md` "Coverage ledger" (line 101) vs "DoD per review phase" (lines 168, 171, 177); `.asd/workflows/asd-phase-impl-review.md` step 5 (line 28) | **SSoT: the new "only home" claim says more than its home holds.** Line 101 says the standing n/a predicates' "text and conditions live only in `.asd/runtime.js` `NA_PREDICATES`/`NA_TARGETS`". Three problems with that. (a) Those two constants hold only the predicate strings and the ids they apply to. The conditions are code in `standingPredicates`, `isUiSurface` and `isExecutable` (`runtime.js` 293-320). (b) The same file still states the conditions in prose. Line 168/171 gives the design-review UI rule "no ux-spec/design-system artifact in scope". Line 177 gives the UI-surface rule and the two-part perf rule, and calls `asd-phase-impl-review.md` step 5 "the SSoT". (c) Step 5 makes a narrower claim ("member lists and `n/a` text live only in `runtime.js`") and then states both conditions as the normative prose. So the doc names two different sole homes for the same conditions. A reader who trusts line 101 treats line 177 and step 5 as stale copies. The sprint's own risk note (audit "AC-12 — second home for 'sole SSoT' predicates") warned against exactly this. | Narrow line 101 to what `runtime.js` actually holds, matching step 5's wording: predicate text, the classifiers' member lists and the target ids. Leave the prose conditions at step 5 and keep line 177 pointing there. Alternatively, keep the wide claim and remove the condition prose from lines 168/171/177 and step 5. Do not keep both. |
| DOC-1-2 | low | `.asd/rules/sprint-lifecycle.md` "Impacted test set" (line 93); `.asd/skills/asd-init/SKILL.md` "Always first" 0a (line 25) | **Documentation economy: added lines that change nothing an agent does.** (1) Line 93 states one rule three times. The dash clause "a correct record at the time it was written, not a claim about the tree a later entry produces" repeats the opening clause. The closing "do not read an earlier per-entry record as covering commits added after it" only negates "Only the terminal full-suite run … measures the final tree", which sits right beside it. That is a "cut on sight" case. (2) Line 25, "so impl step 9's authorised paths stay exact", is the reason behind a rule already stated ("`config.yaml` is its only write"). The orchestrator acts the same without it. | Line 93: keep "Each `impl-test` entry's `Suite run` record measures the tree that entry analysed. Only the terminal full-suite run at the end of `impl-review` measures the final tree." and drop the other two clauses. Line 25: end the sentence after "`config.yaml` is its only write". Check first that no `tests/run.js` assertion pins the removed wording. |

## Coverage (internal reviewers only)

The compact ledger is in the fenced block below, bound to the part-1 manifest digest. `SSoT` and `Documentation economy` carry this part's findings. Rules this part holds no evidence for use the manifest's out-of-part predicate: HTML shell wrapping (no HTML files in this part), Provenance, Traceability (PRD and ADR are disabled) and Persistent actuality (no `docs/` files).

Everything else passed:
- **In-code doc comments:** `runtime.js` has no comments inside function bodies, and every exported member's doc states its purpose.
- **Framework mode:** these rule docs, agents and skills agree on the registry move, the settings-change path, flagged choices, tool policy and manifest immutability. README belongs to part 2.
- **Template adherence:** `t_prompt-external-design.md` keeps its responsibility block, and its `c4-full` list matches the new mermaid draft path.
- **Custom rules:** consistent.

## Verdict
CONCERNS: 2

## Next action
The dev resolves DOC-1-1 and DOC-1-2 in impl review-fix mode. One note for the part-2 merge, not a finding here: `.asd/templates/t_test-plan.md` lines 53-55 restate the suite-record rule while citing `sprint-lifecycle.md`. `decisions-log.md` (Wave 2 entry) names `sprint-lifecycle.md` as its only home, so part 2 should check that restatement under SSoT.

## Escalations (optional)
- none

I updated my own memory file (`D:\Projects\agentic-software-development\.claude\agent-memory\asd-reviewer-documentation\feedback_no-shell-doc-review-method.md`) to cover split part manifests and the pattern behind DOC-1-1: an "only home" claim that says more than the home holds. The orchestrator commits it under `git-strategy.md` "Commit before review".

```json
{"manifest_digest": "5368f7a3faab0499868f6e58ae9cd9fc1051946ca78300ed7a20869df1a67b6c", "findings": ["DOC-1-1", "DOC-1-2"], "files": [{"i": ".asd/agents/asd-architect.md", "s": "checked"}, {"i": ".asd/agents/asd-dev.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-correctness.md", "s": "checked"}, {"i": ".asd/agents/asd-reviewer-efficiency.md", "s": "checked"}, {"i": ".asd/release-manifest.json", "s": "checked"}, {"i": ".asd/rules/artifact-layout.md", "s": "checked"}, {"i": ".asd/rules/checkpoints.md", "s": "checked"}, {"i": ".asd/rules/code-style.md", "s": "checked"}, {"i": ".asd/rules/core.md", "s": "checked"}, {"i": ".asd/rules/external-review.md", "s": "checked"}, {"i": ".asd/rules/git-strategy.md", "s": "checked"}, {"i": ".asd/rules/providers.md", "s": "checked"}, {"i": ".asd/rules/review-policy.md", "s": "checked"}, {"i": ".asd/rules/sprint-lifecycle.md", "s": "checked"}, {"i": ".asd/runtime.js", "s": "checked"}, {"i": ".asd/skills/asd-init/SKILL.md", "s": "checked"}, {"i": ".asd/skills/asd-sprint/SKILL.md", "s": "checked"}, {"i": ".asd/sync-state.json", "s": "checked"}, {"i": ".asd/templates/external-review/t_prompt-external-design.md", "s": "checked"}, {"i": ".asd/templates/t_AGENTS.md", "s": "checked"}], "rules": [{"i": "SSoT", "s": "finding", "f": "DOC-1-1"}, {"i": "Template adherence", "s": "pass"}, {"i": "HTML shell wrapping", "s": "n/a", "p": "evidence outside this part; covered by the other parts"}, {"i": "Provenance", "s": "n/a", "p": "evidence outside this part; covered by the other parts"}, {"i": "Traceability", "s": "n/a", "p": "evidence outside this part; covered by the other parts"}, {"i": "Persistent actuality (impl-review)", "s": "n/a", "p": "evidence outside this part; covered by the other parts"}, {"i": "In-code doc comments (impl-review, `code-style.md` §7)", "s": "pass"}, {"i": "Framework mode (`self_hosting: enabled`, impl-review only)", "s": "pass"}, {"i": "Documentation economy", "s": "finding", "f": "DOC-1-2"}, {"i": "Custom rules consistency", "s": "pass"}, {"i": ".asd/project/custom-common-rules.md", "s": "pass"}, {"i": ".asd/project/custom-coding-rules.md", "s": "pass"}], "sections": []}
```
