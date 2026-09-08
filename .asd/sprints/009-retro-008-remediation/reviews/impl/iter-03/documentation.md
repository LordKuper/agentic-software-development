[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3 (severity floor: high — medium and low dropped at source)
- **Method note**: no shell grant; the delta was derived by reading the 12 scoped paths at HEAD and cross-checking claims against `review-policy.md`, `sprint-lifecycle.md`, `checkpoints.md`, `artifact-layout.md`, `external-review.md`, `README.md`, `.asd/sync.js` and `tests/run.js`.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/workflows/asd-phase-impl-review.md` step 7a (header `:48`, bullet `:50`); `.asd/workflows/asd-phase-design-review.md` step 8a (header `:40`, bullet `:42`) | The new `- Late duplicate return:` bullet was placed under a step whose header reads "**Interrupted dispatch / split dispatch** — internal reviewers only". Its cited SSoT states the opposite reach: `review-policy.md:144` — "Applies to the 4 internal reviewers, **except where a branch states its own reach** (**Late duplicate return**, below, holds for any replaced dispatch, **External Review included**)". The bullet defers to the rule only "for the admission test and every action it mandates", not for reach, so an orchestrator that reads the step header and stops is instructed to discard a late **external** return — precisely the AC-14 motivating incident. Consequence: verified above-floor evidence the rule mandates admitting is dropped, and a known-false `APPROVE` is recorded. The rule side is coherent (`external-review.md:51` routes an external non-outcome back into "Interrupted dispatch" whole); only the acting site is narrowed. | Scope the header to what is actually internal-only ("— split and re-dispatch mechanics: internal reviewers only") and state the late-return reach at the bullet ("applies to any replaced dispatch, External Review included"). Keep the SSoT citation; restate no part of the admission test. The existing test matches on the citation substring, so this rewording keeps it green. |

## Verified clean (checked, no finding at floor)

- **`asd-phase-impl.md` serialization** — step 5's fix-mode bullet is one ordered chain with the tester chain dispatched only after the dev chain completes, and step 6's parallelism clause is scoped "initial mode only". No sibling contradicts; `sprint-lifecycle.md` "Impl phase" states no fix-mode parallelism, and the shared-worktree instruction is generic. Step 7's "Wait all task signals" still reads correctly for one or two chain agents.
- **Late-return artefact chain** — `<reviewer>.late.md` appears in both workflows' "Artefacts produced", in `review-policy.md:150`, and in `artifact-layout.md:43-44`'s exhaustive path map. No artefact named by a rule that no workflow declares, and none declared that no step writes.
- **`checkpoints.md:31` fix-round unit** — the tail is contained in step 11's emitted entry, the cited step number is the step that actually emits it, and the tail selects the real decisions-log entries. "however the mode is named" is what makes the mode-name divergence harmless.
- **`sprint-lifecycle.md:72` ordinal** — consistent with its neighbours (Reset, Late-return admission, Red-full-suite invalidation); no other file counts latch-clearing routes.
- **AC-16 / README absence still correct** — the delta touches no phase list, agent roster, model tier, config-schema field, command list or folder-map row, and `README.md` never names `reviews/iter-NN/` artefacts. `core.md` "See also" unchanged.
- **Agent memory (four files)** — durable claims hold at HEAD: the sync helpers are exported, a bare `--apply` exits 1 writing nothing, the ledger recompute is whole-repo, `canon_hashes` covers only agents and skills, `managed_paths` excludes `tests/run.js`, the cited in-suite `--check` test exists, and the ordinal rename and line-ending notes are true. Every index link in scope resolves.
- **`tests/run.js`** — no in-body comments added in the changed regions; reasoning sits in assert messages.
- **`release-manifest.json`** — `managed_paths`, `canon_hashes` shape and `model_families` still mirror `providers.md`; every canonical file this delta edits has an `upstream_hashes` entry. Hash values are not recomputable without a shell — freshness is machine-checked by the suite, not by this review.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `validate-ledger` → `{"ok":true}`. 12/12 files, 10/10 rules, 9/9 sections resolved.

## Verdict

CONCERNS: 1 (high)

## Next action

Route to `impl` review-fix mode (both `*-review` workflow files, one dev, one ordered chain). No escalation — a scoping clarification at the acting site.

## Escalations

None.
