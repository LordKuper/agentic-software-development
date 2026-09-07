[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — `low` and `medium` dropped)

## Findings

| # | Severity | Category | Location | Description | Suggested fix |
|---|---|---|---|---|---|
| EFF-1 | high | simplify | `.asd/workflows/asd-phase-impl-review.md:74` (step 13); supporting `.asd/workflows/asd-phase-impl-test.md:34`, `.asd/rules/sprint-lifecycle.md:316` | `derived_handoff` has exactly two readers in the repo, and the validity rule requires `base`+`head`+`pathspec` to all match. impl-review's step-13 exit write records `base` = `iteration_heads["iter-(NN-1)"]` (or `<base_branch>`); after it, control goes to `retro` or `impl`, neither of which reads the slot, and the next reader reached is impl-test step 2, whose `base` is the prior `Entry log` `HEAD analysed` — a different sha by construction, and overwritten by impl-test step 10 before impl-review reads again. So step 13's mandated diff re-run plus state write is consumed by nobody on every impl-review exit, and its own claim "This is the record the next phase reads" is false. The same root cause makes impl-test's step-2 read dead in both branches: entry 1 sees `{}`, re-entry sees a record keyed on a different base. The only edge that can ever hit is impl-test step 10 → impl-review step 1 at iteration 1 — one cache hit per sprint. | Pure deletion, no new abstraction. (1) Delete step 13 and drop `derived_handoff` from impl-review's Artefacts line. (2) Delete the reuse clause in `asd-phase-impl-test.md:34` — it can never validate; keep the plain diff instruction. (3) In `sprint-lifecycle.md:316` name impl-test's step-10 exit write as the sole writer, read only by impl-review step 1. The field survives with one writer and one reader — the single edge that pays. No test breaks: the AC-11 tests require each workflow only to *reference* the field, which impl-review still does at `:26`. |

Dropped below floor: 6 findings (5 medium, 1 low) — prose and test-structure micro-duplication, none behaviour-affecting.

## Judgment notes

1. **Union property**: holds up. Each surviving condition compares a half against the unpartitioned manifest or against the other half; `validate-ledger` is per-manifest and structurally cannot see any of that, so none is vacuous where it runs. Deleting the digest condition was correct.
2. **`derived_handoff`**: see EFF-1. Inside the decision to keep the field, the deletable residue is the impl-review write and the impl-test read; the bespoke `head` formula is genuinely load-bearing — raw `HEAD` would be invalidated by the exit bookkeeping commit and the one working edge would never hit.
3. **`tests/run.js`**: no test re-exercises an adjacent one's contract and no new helper duplicates an existing one; the six new tests each pin a distinct string contract. Two structural duplications exist, both below floor.
4. **Agent-memory files**: the two dev-side files do not say the same thing and cross-link correctly; the reviewer-testing file is a coherent single playbook, not a god-file — `sc-1` pass.
5. **`providers.md:111`**: the prose copy earns its place — `runtime.js` is not loaded context for a plan author. The real defect is a third copy enumerating the five names twice in one paragraph; below floor.

**Performance sections**: no findings at or above floor. No n+1, unbounded allocation or blocking hot-path work; new regexes are linear with no nested quantifiers; every new loop is over a fixed 2–6 element list. No baselines defined; the suite grew by six file-read tests. The only per-dispatch recurring cost in scope is the three agent-memory files, judged in note 4.

**Cross-reviewer note** (not a finding): `feedback_no-shell-review-method.md:25` states "A file where something was found is still `checked`, carrying the finding id in `f`". `runtime.js:191` rejects `f` on any row whose status is not `finding`, and only `rules` rows may be `finding` — acting on that memory produces an invalid ledger and a wasted re-dispatch.

## Coverage

Validated compact ledger: [`efficiency.ledger.json`](./efficiency.ledger.json) against [`efficiency.manifest.json`](./efficiency.manifest.json), findings [`efficiency.findings.json`](./efficiency.findings.json). `validate-ledger` → `{"ok":true}`. 15/15 files, 14/14 rules, 8/8 sections.

## Verdict

CONCERNS: 1 (high)

## Next action

Route EFF-1 to impl review-fix. Three deletions across two workflows and one rule doc; no test change required, though the three edited canon files need their `release-manifest.json` hashes refreshed.

## Escalations

None — the proposed fix is pure deletion.
