[REVIEW-impl-documentation]: APPROVE

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 4 (severity floor: high — 4 findings dropped below floor: 2 medium, 2 low)

## Findings

No findings at or above the `high` severity floor.

## What was verified

**1. `derived_handoff` narrowed to one writer / one reader / one edge — consistent across all three files.** The home states it at `sprint-lifecycle.md:316`; the writer is `asd-phase-impl-test.md:52` (step 10), which writes, cites the rule as sole SSoT and restates no shape or formula, with its artefacts line still naming it correctly; the reader is `asd-phase-impl-review.md:26` (step 1), read-only, and the deleted step 13 leaves no numbering gap — steps run 1–12 with no dangling "step 13" or "phase-exit re-record" reference anywhere in the repo, and the artefacts line no longer lists the field. A repo-wide search confirms the "no other phase writes or reads the slot" claim: the only non-sprint mentions are those three files, `tests/run.js`, and `t_state.json`'s `{}`.

**Deliverability check** — the class that recurred twice. Iteration 1: writer base and reader base are both `git.base_branch`; the pathspec is identical by construction, since impl-test step 2 is specified as using the same `exclude_paths` as impl-review's scoping; the intervening bookkeeping commit touches only `.asd/sprints/**`, out of pathspec, so `head` stays valid — the reuse path can hit. A stale slot cannot produce a false hit: any intervening in-pathspec commit changes `head` and forces re-derivation.

*(Reviewer's note added at write time: the correctness reviewer reached the opposite conclusion for iteration ≥ 2, tracing `H1 ≠ H2` through step 10's bookkeeping commit. That analysis is recorded as C-1 and is the sprint's operative finding on this point; this section's iteration-1 verification stands.)*

**2. Four corrected statements in `feedback_no-shell-review-method.md` — each checked against its home, all four now true.** The tool grant now cites the agent frontmatter instead of enumerating, and no longer claims a `Write` grant. The ledger row encoding matches `review-policy.md:99` and `runtime.js:189-191`, including that a `files` row can never carry `f`. The repo-root `--check` test exists exactly as described, line for line, and the prior inverted claim is gone. The three / two / one arithmetic checks out against `computeCanonHashes`, `managed_paths`, the two §6b freshness tests and `buildSyncPlan`'s render-source list: agents/skills → 3, hooks plus `t_AGENTS.md`/`t_CLAUDE.md` → 2, other ledgered canon → 1. This third version is correct.

**3. The `asd-dev-critical` memory tree.** The index lists exactly the five files present on disk. The `--apply` target list matches `buildSyncPlan`'s fixed targets, and the SSoT claim checks out — the full parenthetical is in `AGENTS.md` alone and the seven citing sites all carry the `providers.md` citation, guarded by a test. The new `t_AGENTS.md`/`t_CLAUDE.md` carve-out is correct: those two do render full-file managed-block targets. `project_crlf-canon-edits.md` states a durable environment hazard with no rule-doc home, so it duplicates nothing, and its vocabulary matches the project glossary.

**4. `tests/run.js` (156 → 159), `code-style.md` §7.** The added test bodies introduce zero in-body comments — all rationale rides in assertion messages, which is the compliant form. The pre-existing comments elsewhere are outside this change surface.

**5. Framework mode.** `README.md` is unaffected: it never mentions `derived_handoff` or impl-review's step numbering, and the phase list, agent roster, model tiers, config schema and folder map are untouched. `core.md` "See also" needs no change. `release-manifest.json` updates exactly the three ledgered canon files edited — `tests/run.js` and `.claude/agent-memory/**` are outside `managed_paths`, so their absence from the ledger diff is correct, and no `canon_hashes` entry is due.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `validate-ledger` → `{"ok":true}`. 10/10 files, 10/10 rules, 9/9 sections; the four pre-authorised `n/a` predicates verified, not assumed.

## Verdict

APPROVE — no `high` or `critical` findings. SSoT holds for `derived_handoff` (one home, both workflows cite rather than redefine), every corrected memory statement matches its verified home, the memory index is consistent with disk, the ledger diff is exactly scoped, and no mirror went stale.

## Next action

Reviewer done for this iteration. No documentation fixes route to impl.

## Escalations

None.
