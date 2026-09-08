[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F-1 | medium | `.asd/rules/artifact-layout.md:43-44` vs `.asd/workflows/asd-phase-impl-review.md` (step 7a, step 8, "Artefacts produced") and `.asd/workflows/asd-phase-design-review.md` (step 8a, step 9, "Artefacts produced") | One-sided mirror update this round: the path map now registers `<reviewer>.late.md` for both phases, and `review-policy.md` "Late duplicate return" assigns every action of that route to the phase workflow (verify against source, write the file, link it, set `verdicts["iter-NN"]` to the more severe token, clear that reviewer's latch, append the decisions-log line). Neither review workflow names the file or the route: both list only `.part-1.md`/`.part-2.md` under "Artefacts produced", both enumerate their `state.json` writes with no late-return branch, and the sibling mechanism from the same rule section (split dispatch) does get an explicit "Phase bindings" sub-step plus its part files. So the exhaustive path map names an artefact no workflow claims to produce, and the workflow's state-write enumeration contradicts the latch-clear and severity-merge the rule mandates. | In both workflows add one binding line beside the existing split-dispatch sub-step — citing `review-policy.md` "Late duplicate return" as sole SSoT, not restating the admission test — naming the part it must execute, and add `<sprint>/reviews/<phase>/iter-NN/<reviewer>.late.md` to each "Artefacts produced" list. |

## Verification notes (no finding)

Every claim of the delta was checked against HEAD and holds:

- **`<reviewer>.late.md` registration** — present in both review rows; the sprint-folder-purity statement intact (the only gap is F-1's workflow side).
- **Reviewer-memory commit obligation** — owner is `git-strategy.md:39`, naming the class, the reason and citing `review-policy.md` "Change-surface rule"; `review-policy.md:42` is a one-clause bridge; both workflows name the commit at the review-file write step. Cited headings exist; no second copy of the bookkeeping list.
- **External-review outcomes** — the agent's Signals are now `REVIEW_DONE | QUESTION | ABORT`, with `ABORT` scoped to "only before any `{{wraps_cli}}` invocation"; "Outcome contract" carries the matching pre-invocation exemption and the interrupted-dispatch import; `review-policy.md:144` hands the whole question to the contract. No file anywhere still associates `FAILED` with external review, generated views included.
- **Third latch-clearing route** — `sprint-lifecycle.md` "APPROVE latch" now names rollback reset, late-return admission and red-full-suite invalidation, mechanics left to `review-policy.md`. The ordinal label above the red-suite paragraph is a low nit, dropped at this floor.
- **`.gitattributes`** — declares `* text=auto eol=lf`, listed in the self-hosting write allowlist, correctly absent from `managed_paths`.
- **`code-style.md` §19** — the false equivalence is gone; `git diff --check HEAD` stated as a superset with its condition; `commands.yaml`'s `lint` is the `--cached` form. Wording stays platform-neutral, correct for a `managed_paths` file.
- **`checkpoints.md` "Criterion cost surfacing"** — unit stated honestly (iterations-charged declared a lower bound, no stored counter); the counted literal is byte-identical to what `asd-phase-impl.md:112` emits.
- **`asd-phase-impl.md`** — the fix-mode chain states one-agent dispatch at step 5 with tier delegated to 5a; no residual fix-mode parallelism wording, while initial-mode parallelism survives at step 6.
- **`coverageManifestDigest`** — digests the manifest as written minus `digest`, so `review-policy.md:101` is now true literally; `--write` still stamps from the one exported constant. No in-body comments in `runtime.js`; doc comments state purpose, not implementation.
- **Agent memory (all four files)** — indexes resolve; `project_crlf-canon-edits.md`'s premise is correctly rewritten for the post-`.gitattributes` reality with the pre-existing-checkout caveat; the tester memory's durable claims verify, including the dangling `asd-pm/MEMORY.md` link (real, pre-existing, out of surface). One parenthetical example is a word off HEAD but its rule and consequence remain true — low, dropped.
- **`README.md` absence from scope re-verified** — nothing this round touches a README mirror: folder map is the consumer-project map, phase list, agent roster and both model-tier columns untouched, config schema and command list unchanged, the `runtime.js` one-liner still accurate. `core.md` "See also" lists all twelve sibling rule docs. `release-manifest.json` carries `upstream_hashes` for every edited canonical file and no `.gitattributes` entry.
- **Custom rules** — the `custom-common-rules.md` vocabulary is used consistently across all edited files.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `validate-ledger` → `{"ok":true}`. 18/18 files, 10/10 rules, 9/9 sections resolved.

## Verdict

CONCERNS: 1 (medium)

## Next action

Creator applies F-1 in both review workflows in review-fix mode; verify the premise against source first. No escalation — no rule ownership changes, no new mechanism, citation-only additions at the acting sites.

## Escalations

None.
