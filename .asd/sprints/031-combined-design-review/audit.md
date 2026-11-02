---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/workflows/asd-phase-audit.md` "Rules"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

The main orchestrator writes all applicable sections. Product/domain ambiguity a source can resolve is resolved from it; ambiguity only authority or preference can settle goes to the user.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/workflows/standard.json`: `reviewers.design` `["quality", "efficiency", "external"]` → `combined`, `external` (AC-1).
- `.asd/workflows/asd-phase-design-review.md`: owner line, step 7 internal-reviewer bullet and `## Dispatch` agent list name quality + efficiency; step 9 keys verdicts `quality`/`efficiency`/`external`; `## Rules` bullet "`asd-reviewer-quality` judges draft correctness … UI section is `n/a: outside phase gate`" (AC-2).
- `.asd/skills/asd-phase-design-review/SKILL.md`: description "always dispatches asd-reviewer-quality + asd-reviewer-efficiency … quality's UI section is n/a" (AC-2).
- `.asd/agents/asd-reviewer-combined.md`: description "Lite impl-review reviewer … Not: design-review"; Role "the one internal reviewer of an impl-review"; `## Inputs` required list is impl-only (`payload.diff`, `plan.md`, `test-plan.md`), optional "the impl-review inputs its home agent file lists"; Rules "impl-review only — never dispatched in design-review", "judge persistent actuality before promotion"; `## Gate Verdict Format` hard-codes `[REVIEW-impl-combined]` and `reviews/impl/wave-<K>/iter-NN/combined.md`; `### Overall quality` names "plan Task" (AC-3).
- `.asd/agents/asd-reviewer-quality.md`, `asd-reviewer-efficiency.md`: descriptions "dispatched in design-review, impl-review"; Role lines "dispatched in design-review and impl-review"; `## Inputs` `design-review` blocks; `[design-review, …]` rubric tags stay (combined composes them) (AC-3).
- `.asd/rules/review-policy.md`: "Reviewer responsibility" table (Quality/Efficiency design-review cells; Combined "n/a (lite has no design-review)"); "DoD per review phase" design-review row and the paragraph under the table ("Quality still dispatches and marks its UI section") (AC-4).
- `.asd/rules/sprint-lifecycle.md`: "Phase table" design-review row "Quality + Efficiency + External Review" (AC-4); "Self-hosting" "after the last canon-editing dispatch of a wave or fix round" (AC-6 restating site); "Scope amendment" (AC-8 home).
- `.asd/rules/providers.md`: line 48 "`quality` and `efficiency` in `standard`, `combined` in lite"; Role-scoped context rows `asd-reviewer-quality`/`efficiency` `design-review`, and `asd-reviewer-combined` `*` row carrying impl-only refs (`asd-phase-impl-review.md#Rules`, `custom-coding-rules.md`, `code-style.md`, `artifact-layout.md#Manual steps`, `#Test plan`) with no design-review row (AC-3, AC-4).
- `.asd/rules/ux-principles.md` line 3: "verified during design-review + impl-review by `asd-reviewer-quality`" (AC-4).
- `README.md`: line 134 `standard` bullet, flowchart node line 162 "Quality · Efficiency · External", phase table line 189, agent roster lines 246-248 (`Phase(s)` cells; combined "impl-review (`lite` only)") (AC-4).
- `tests/run.js`: emit-manifest calls with `quality`/`efficiency` in design-review (≈ lines 4595, 4620-4626, 5438, 5733), the design-review Rules assertion at 2088, the responsibility-table checks at 5345-5360 (AC-4).
- `.asd/rules/review-policy.md` "Verify before applying" (line 87) (AC-5); `.asd/workflows/asd-phase-impl.md` step 7 and line 68 review-fix rule (AC-5, AC-6).
- `.asd/project/custom-common-rules.md` (AC-7).
- `.asd/runtime.js`: `rangePatchInvocations` (one `git diff` per range carrying every path), its callers `writeManifestDiff` and `patchBytes` (review-waves) (AC-9); `reviewFindings` (AC-10).
- `.asd/templates/t_review.md`, `external-review/t_review-report.md`: findings header `| # | Severity | Location | Description | Suggested fix |` (AC-10 reference, unchanged).

## Existing docs found
- [review-policy.md](../../rules/review-policy.md): "Reviewer responsibility" — "each concern below has exactly one reviewer per workflow roster"; "DoD per review phase" design-review (standard) requires Quality, Efficiency, External.
- [sprint-lifecycle.md](../../rules/sprint-lifecycle.md): "Workflows" — `reviewers.design`/`reviewers.impl` are the verdict keys each review phase dispatches; "APPROVE latch" keys `latched` by the same keys; "Self-hosting" sync timing.
- [providers.md](../../rules/providers.md): "Role-scoped context" table and "Conditional grants" (combined already holds the UI grant).
- [README.md](../../../README.md): Workflows section, phase flowchart, phase table, agent roster, verdict token line.
- [gh-2.90.md](../../../docs/architecture/tech-reference/gh-2.90.md): only tech reference; no `docs/` product or architecture doc bears on the touched areas.
- Windows command-line cap: `CreateProcessW` `lpCommandLine` is at most 32,767 characters including the null — https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw.

## Existing implementation found
- `.asd/runtime.js` `reviewerKeys(node)` is the union of every workflow's `reviewers[node]`; `emitManifestCommand` and `persistReview` validate `--reviewer` against it, so AC-1 alone makes `combined` a valid design-review reviewer and rejects `quality`/`efficiency` there.
- `emitCoverageManifest` already composes a combined manifest in design-review: a simulated emit over `s/design/prd.html` n/a's every `[impl-review]` entry `outside phase gate` and gates UI conformance out without a ux-spec/design-system draft; `reviewerFiles` gives design-review combined the scope only (no test-plan paths).
- `.asd/hooks/session-start.js` `lastReviewVerdict` reads verdict values generically — no reviewer-key dependency.
- `rangePatchInvocations` pairs each rename with its source (`patchPaths`); `writeGitOutput` already streams several invocations in order into one file, so chunked invocations need no new writer.
- `reviewFindings` checks only header length ≥ 3 and separator shape, then reads `id, severity, location` by position.

## Gaps
- `asd-reviewer-combined.md` has no design-review inputs, phase-neutral verdict token or output path; a design-review dispatch against its current required inputs (plan.md, test-plan.md) would end `FAILED`/`ABORT`.
- `providers.md` has no `asd-reviewer-combined` `design-review` context row; its `*` row would load impl-only refs into a design-review dispatch and miss `asd-phase-design-review.md#Rules` and `custom-design-rules.md`.
- `### Overall quality` (combined) is phrased for code ("plan Task"); design-review has no plan.
- `rangePatchInvocations` has no command-line length bound (AC-9); `reviewFindings` has no canonical-header check (AC-10).
- External dependency gaps: git: `git diff` takes no `--pathspec-from-file` (live check, git 2.55.0.windows.5), so AC-9 is chunking only; no git tech-reference doc exists.
- Migration gaps: none — in-flight sprints holding `quality`/`efficiency` design-review keys are out of scope (`sprint.md`).

## Risks
- Tests that emit design-review manifests for `quality`/`efficiency` fail once `reviewerKeys('design')` drops them: impact=red suite after AC-1, mitigation=move them to `combined` in the same change.
- This repo never runs design-review (`prd`/`ux_spec`/`adr`/`c4` disabled): impact=the new roster is exercised only by tests, mitigation=a runtime test emitting and persisting a combined design-review manifest/return plus content-contract assertions on the workflow, agent and README.
- Removing quality/efficiency design-review mentions could strip their `[design-review]` rubric entries, which combined composes: impact=design-review loses rubric coverage, mitigation=keep every rubric tag and entry, change only dispatch/description prose.
- AC-6 moves the self-hosting sync point that `sprint-lifecycle.md` "Self-hosting" restates: impact=SSoT drift, mitigation=edit both in one Task (tests/** is not in `managed_paths`, so a tester-only chain needs no second sync).
- AC-9 chunk boundaries: impact=a rename split from its source shows as an add, or a budget ignoring quoting overruns the cap, mitigation=chunk whole `patchPaths` pairs and budget on the quoted command-line length; the `.diff` fingerprint changes with chunking (harmless, recomputed per call).
- AC-7 edits `.asd/project/custom-common-rules.md`, outside the dev write allowlist in `sprint-lifecycle.md` "Self-hosting": impact=dispatch write-scope refusal, mitigation=orchestrator-only plan line or an explicit `write_scope` (sprint 030 handled the same file in a Task).
