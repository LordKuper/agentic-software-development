[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — 8 findings dropped below floor: 3 medium, 5 low)

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| E-1 | critical | simplify | `.claude/agent-memory/asd-reviewer-testing/feedback_no-shell-review-method.md:25` | Checklist `oe-12` (prose that restates its source), plus the repo hard rule "dedup to SSoT — restated facts link to the canonical home". This iteration *grew* the paragraph that duplicates `review-policy.md:99`, a doc `asd-reviewer-testing` already loads on every dispatch as a mandatory rule. Byte-for-byte derivable from it: the status enumeration; the newly added `f`-placement rule ("only `finding` has `f`"); and the newly added "`findings` array must equal the actual finding set". The added `runtime.js` internals are unactionable for a no-shell reviewer that cannot run the validator. Two copies of one contract in one always-loaded pair is the exact silent-drift class corrected elsewhere in this same file: edit `review-policy.md:99` and this memory keeps asserting the old vocabulary with full confidence. | Delete the second copy; keep the behavioural instruction, the incident and the manifest check. A replacement about a third the length with no information lost: "**Ledger row statuses are a closed vocabulary — re-read `review-policy.md` 'Coverage ledger' and copy the status words and the `p`/`f` placement rule from there every time; never paraphrase or recall them.** **Why:** an invalid ledger is not a verdict — the phase rejects it and re-dispatches the whole review fresh (sprint 008 iter-02). **How to apply:** also check every `n/a` predicate is quoted byte-identically from the manifest's `n_a` list for that exact id." Pure deletion; adds nothing. |

## Judgments requested by the dispatch

1. **The rest of `feedback_no-shell-review-method.md`** — earned apart from E-1. The per-tree collateral arithmetic is longer than the wrong one-liner it replaces but is irreducible: three counts, each with its tree list and anchor, none of it in any rule doc, and it is what makes the corroboration technique usable. The correction paragraph earns its length by carrying *why* the previous claim was wrong — that is the part that stops the false claim being re-derived.
2. **The `asd-dev-critical/` set (5 files)** — no material overlap. `project_crlf-canon-edits.md` is a genuine non-derivable environment hazard: no rule doc in canon mentions CRLF or `autocrlf`. The two `--apply` files share one clause and cross-link rather than restate — dropped as low.
3. **`derived_handoff` residue** — proportionate to the standing decision; nothing further is removable without touching it. Post-narrowing footprint is one rule paragraph, one writer clause, one reader clause and `t_state.json: {}`. The one clause deletable without touching the decision is the "One writer, one reader, one handoff edge" sentence, fully implied by the pair it follows — low, dropped.
4. **The three memory-asserting tests** — one sound, two couple to churn. The `computeCanonHashes` test pins behaviour, not prose: keep. The `/\bWrite\b/` ban and the `MEMORY.md` filename-inclusion line pin agent-authored prose the memory system is licensed to rewrite outside any sprint; either would red the suite on a legitimate memory edit, and the former's guarantee is already carried by the citation checks beside it. Both medium, dropped — worth deleting opportunistically in the next round that touches this file.
5. **The deletions** — clean. impl-review's steps run 1–12 contiguous with no gap (13 was last, so no renumbering debt); its artefacts line no longer lists the field; impl-test's still lists it correctly at step 10. "phase-exit re-record" has zero occurrences in canon. The only stale reference is in sprint bookkeeping, quoting a historical fail-first record — the documentation reviewer's surface, not this one's.

**Performance**: no anti-pattern — sync IO in a test runner is correct, no n+1, no unbounded allocation. Complexity linear in file size; no nested iteration over input-sized collections. No regression: three added tests, no baseline defined. The net direction is positive — deleting the impl-review exit re-record removes one `git diff` plus one state write per phase exit, and canon is −594 characters of always-loaded prose.

## Coverage

Validated compact ledger: [`efficiency.ledger.json`](./efficiency.ledger.json) against [`efficiency.manifest.json`](./efficiency.manifest.json), findings [`efficiency.findings.json`](./efficiency.findings.json). `validate-ledger` → `{"ok":true}`. 10/10 files, 14/14 rules, 8/8 sections.

## Verdict

CONCERNS: 1 (critical)

## Next action

Route E-1 to impl review-fix: replace the duplicated paragraph with the shorter formulation. Prose-only edit in a generated-view tree, so no `--apply` and no ledger refresh. Optional same-round cleanups, all below floor and none required: delete the redundant "one writer, one reader" sentence, and drop the two churn-coupled test assertions.

## Escalations

None — the fix is a deletion.
