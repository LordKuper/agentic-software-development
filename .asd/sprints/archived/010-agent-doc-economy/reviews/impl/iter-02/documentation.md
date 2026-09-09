[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Manifest**: [documentation.manifest.json](./documentation.manifest.json) (digest `2928f18d…`)
- **Validated ledger**: [documentation.ledger.json](./documentation.ledger.json) — `validate-ledger` → `{"ok":true}`

## Judgement on the rule correction — sound in both directions, no change needed

**`Never cut`'s `at its home` scoping is correct.** Unscoped, the new class would have shielded every copy of a gate rule in a workflow or agent file from the SSoT iron rule declared four lines above it in the same file — the preserve-list would have silently repealed its neighbour. `at its home` admits only the single-home statement, which is exactly what SSoT mandates be kept, so the two rules compose instead of colliding, and no duplicate is re-protected: a copy is by construction not at its home. The trailing standalone-prohibition clause reads distributively under the same scoping, so a duplicated safety ban stays cuttable while the home statement is protected.

**The narrowed `Cut on sight` prohibition bullet still reaches its targets.** Requiring the positive rule to be stated *beside* the prohibition reaches the class it was written for — the buried-verdict line negating the MUST directly above it — and no longer reaches a standalone ban. The apparent gap, a prohibition negating a positive rule stated in another file, is already covered by the same list's last item, so nothing fell through, and `only` correctly spares a prohibition that adds a case distinction.

**The new class demonstrably worked in this same diff**: two standalone authority and security prohibitions with no paired positive rule survived the round. **No over-application found** — every cut traced removed a second home while the contract literals stayed byte-intact, and nothing on `audit.md` R-1 or the considered-and-cleared list was touched.

**The deliberate non-cut is correctly reasoned.** `providers.md` maps request-user-decision to a frontmatter-gated tool on Claude, which the advisor's grant omits, but to plain chat on Codex, where the sandbox governs the filesystem rather than the conversation. The enforcement test holds on one provider only, a Codex advisor would act differently without the line, removal is false, and under the rule as corrected in the same round the line stays. Recording it rather than skipping it silently is the right disposal.

**Actuality — `README.md` and `AGENTS.md` are correctly absent from this diff.** No fact either states moved: the roster is still eleven agents, no tier changed, and the phase list, folder map and config schema are untouched, the two code changes altering validation behaviour without adding a field. The one line that could have gone stale is still true — the correction reweighted the three tests, it did not change their number.

**Framework mode** — all six edited canonical bodies are mirrored in both provider views, line for line. No orphaned canonical edit.

## Findings

### DOC-1 — medium — SSoT

**Location**: `.asd/rules/review-policy.md:175`; `.asd/workflows/asd-phase-impl-review.md:35,48,62`; `.asd/workflows/asd-phase-design-review.md:28,40`

A "not restated here" declaration now sits above surviving restated text, in three of the files this round edited. `review-policy.md:175` claims the dispatch-skip mechanics and the red-full-suite invalidation are not restated here or in either review workflow; all three clauses are false at HEAD — both workflows restate the dispatch skip, the impl-review workflow restates the invalidation, and `review-policy.md:173`, two lines above the declaration, restates it a third time. Separately, both workflows' verdict-recording steps enumerate the availability-skip carve-out as not restated here and then restate it in the next sentence, literal and trigger alike. This is `audit.md` E-16's class, and by the audit's own E-5 decision these declarations are kept *because* a reviewer uses them as the premise of an SSoT finding — a false one converts a self-declared contract into a trap.

**Suggested fix**: narrow the enumerations, do not cut the text they mis-describe. Drop the workflow clause and the red-full-suite clause from `review-policy.md:175`, and drop the availability-skip carve-out from both workflow enumerations. The skip literal is a validated state value at its writing site and is preserve-list protected there.

### DOC-2 — medium — documentation economy

**Location**: `.asd/agents/asd-reviewer-correctness.md:16,21,64,108,116,117`

Under-application: the round's own fix skipped one of the six agent files. Its siblings were reduced, but this file still states its write prohibition four times — a rule config-enforced on both providers and homed in `review-policy.md`. Removal is false for none of the three copies past the first. It also states the nitpick rule twice, and one of those copies carries a **drifted** version of the nitpick drop list — four of five members, omitting speculative future-proofing — a second home of a list whose completeness is the rule at its home.

**Suggested fix**: keep `:21`, the agent file being the home of its own authority, and cut `:16`'s trailing clause, `:64`'s "report only", `:116`, and `:108`'s parenthetical enumeration, leaving one pointer to the nitpick drop list.

### DOC-3 — medium — persistent actuality

**Location**: `.claude/agent-memory/asd-external-review/reference_codex-invocation.md:12,27`

Sprint-scoped, now-stale specifics accumulating in a per-dispatch reference memory. Line 27 records this sprint's iteration-1 findings verbatim as the illustration of a prompt-seeding technique, quoting two clauses of canon **this very diff deleted** — so from the next dispatch on the example cites text that no longer exists. And because agent memory loads on every dispatch of that agent, it re-supplies prior-iteration verdict content through a channel the clean-context rule reserves for explicit workflow payload, a rule the same file correctly states elsewhere. Line 12's frozen suite count is the same defect one sprint older, inside a sentence whose durable half needs no number at all.

**Suggested fix**: keep the technique sentences, cut the sprint-010 example clauses and the parenthetical count. The rest of the file — measured payload ratios, the sandbox permission tell, the no-disk invocation pattern — is failure-mode-with-symptom and stays.

## Not a finding, recorded for the fix round

`.asd/agents/asd-external-review.md:128` holds the fifth copy of the buried-verdict prohibition, now the only survivor of the four this round cut. It is outside this diff's surface and the change did not make it incorrect, so it is not raised — but it is the natural companion edit.

## Coverage notes for the `pass` rows

**In-code doc comments**: the round's new executable code adds none — the effort-validation helper's comment sits above the function and states the failure mode with its symptom, the `n_a` rejection carries none, and the new test block adds no in-body comment. **Framework mode**: as above. **Custom rules consistency**: the custom common and coding rules' glossary and naming are respected; no term introduced this round conflicts.

## Verdict

CONCERNS: 3

The rule correction itself — removal as the necessary controlling test, the `at its home` scoping, the narrowed prohibition bullet and the new standalone-prohibition preserve class — is sound and needs no further change. All three findings are residual application defects, not defects in the rule.

## Next action

Route to `impl` review-fix mode. Each fix is a text edit inside canon already in this sprint's authorised surface; the agent bodies and both workflows need `node .asd/sync.js --apply` on their generated views afterwards. Verify each premise at HEAD before applying — DOC-1's fix is to narrow the declarations, not to delete the restated literals they mis-describe.
