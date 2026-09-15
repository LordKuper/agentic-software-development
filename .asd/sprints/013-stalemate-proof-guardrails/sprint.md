---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 013-stalemate-proof-guardrails

## Goal

Three workflow hardenings taken from a review of trace-engineering practice for AI agents. Each replaces an agent's word with deterministic evidence or turns a lesson into a rule an agent actually loads.

1. Stop a degenerate `impl`⇄`impl-test` loop. The rounds stay uncapped, but a repeat of the same code defects is detected and escalated.
2. Ground fail-first regression proof in raw runner evidence, not a claim.
3. Make the retrospective deduplicate its findings first, and only then draft each surviving finding as a one-line guardrail with a named home.
4. Make audit analyse every relevant document under `docs/`, resolve contradictions in favour of canonical ASD documents, and ask the user about whatever still conflicts.

## Acceptance

- AC-1: `sprint-lifecycle.md` states a stalemate rule for the `impl`⇄`impl-test` cycle. When two consecutive `impl-test` entries route the same code-defect set back to `impl`, the phase emits `FAILED: stalemate` and escalates to the user. The rounds stay uncapped otherwise.
- AC-2: Defect-set identity is compared on location, symptom and failing test, never on `D-N` ids, because ids are never reused. The comparison is deterministic and involves no LLM judgment.
- AC-3: `asd-phase-impl-test.md` step 9 applies the AC-1 check before routing code defects to `impl`, reading the previous entry's defects from `test-plan.md`. The check reuses the pattern of `external-review.md` "Stalemate detection" by reference, without restating it.
- AC-4: `code-style.md` §17 (SSoT) requires a fail-first proof record to carry the exact command, its non-zero exit code and the name of the test that failed before the fix. A mutation proof carries the same evidence for the mutated run. A bare claim such as "proved" does not satisfy the rule.
- AC-5: The `Regression proof` column of the `Added tests` table in `t_test-plan.md` takes the AC-4 shape. `asd-reviewer-testing` treats a proof row without that evidence as a finding, citing §17 rather than restating it.
- AC-6: The retro phase deduplicates before it drafts. Friction entries and systemic proposals that share one root cause merge into a single finding that cites every source `F-N`. Each merged finding is then checked against the rules already in its target home, and a finding that an existing rule already covers is dropped with that rule cited.
- AC-7: Only after AC-6, every surviving finding becomes a rule proposal with two fields. `guardrail` is one imperative line stating the prohibition or requirement. `home` is the file it belongs in: `custom-coding-rules.md`, `custom-common-rules.md`, `.claude/agent-memory/<agent>/`, or a `.asd/rules/` doc when `self_hosting` is enabled.
- AC-8: Retro still applies nothing. Promotion of any guardrail stays the user's decision. `sprint-lifecycle.md` "Retro phase", `asd-phase-retro.md` and `t_retrospective.html` state the AC-6 and AC-7 order and shape consistently. The empty-log branch still yields systemic proposals.
- AC-10: Audit reads every document under `docs/` that bears on the sprint's touched areas, not a sample. `sprint-lifecycle.md` "Audit phase", `asd-phase-audit.md` step 2 and the `asd-architect` audit instructions state this, and `audit.md` "Existing docs found" lists each one analysed.
- AC-11: When documents contradict each other, the canonical ASD document wins. A canonical ASD document is a persistent doc at its `artifact-layout.md` path-map location, and under `self_hosting` also a `.asd/rules/` doc. Each contradiction resolved this way is recorded in `audit.md` with both sources and the winning one.
- AC-12: A contradiction that precedence cannot settle, such as two canonical documents disagreeing or no canonical source on either side, is escalated to the user as a hard decision before the audit gate passes. The answer is recorded in `decisions-log.md` and in `audit.md`. `t_audit.md` gains one optional section holding the AC-11 and AC-12 records, and `checkpoints.md` lists the unresolved-contradiction question as hard.
- AC-9: `node tests/run.js` is green, `node .asd/sync.js --check` is clean, README.md is consistent with the changed rules, workflows and templates, and every added line passes `artifact-layout.md` "Documentation economy".

## Out of scope

- Tracing, OpenTelemetry spans, sampling-parameter capture, token-cost accounting, statistical loop breakers. ASD is not a runtime and has no such sensors.
- A cap on `impl`⇄`impl-test` rounds.
- Automatic promotion of retro guardrails into any rule file.
- Hand-edits to generated provider views. Edit canon, then run `sync.js --apply`.
