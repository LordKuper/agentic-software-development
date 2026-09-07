[REVIEW-impl-correctness]: APPROVE

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 4
- **Severity floor**: high
- **Scope**: incremental, 9 paths (`08ea5d1…9ff22c5`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above the `high` floor | — |

## Basis (what was verified)

**The contradiction is resolved end-to-end.** The four statements of the scope-vs-readability rule are mutually consistent, with no residual "may not read" claim anywhere: the SSoT sentence in `external-review.md:46`; the identical carve-out in both prompt templates, which still pass the placeholders that make it meaningful; and `asd-external-review.md:47`/`:105`, which phrase the bound as scope and finding location, never as a read prohibition, while Tool policy still permits reading the reference paths.

**The fix reaches the case that was actually broken**: in self-hosting impl-review the AC list lives in `.asd/sprints/**` and custom rules in `.asd/project/**`, both inside `exclude_paths`.

**The loosening does not re-open prior review files**: it is scoped to the prompt's named project-context paths, and the independent prohibition on reading prior `iter-*/` files is untouched.

**No change-induced dangling references**: `isSelfHostingRepo` appears in no canonical rule, workflow, agent, skill or template — remaining hits are sprint history and archived test-plans. Both skill files state the fail-closed rule in prose.

**Sync parity held**: the new agent sentence is present in both generated views, the new skill prose in both provider trees, and `canon_hashes` entries exist for all three changed render sources. Byte-exact hash currency is only verifiable by `sync.js --check`/`tests/run.js`, out-of-band for a no-shell reviewer — noted, not claimed as a defect.

**New tests are sound and not vacuous**: every asserted literal is present verbatim in its target file; the extended AC-7 roster reaches `asd-*/SKILL.md` recursively, and no canonical `.md` under the scanned roots contains `asd-pm`, so the guard passes without being vacuous.

**AC trace**: all nine paths map to plan Tasks 1, 3, 4 and 6. No untraceable change, no partial AC left without a follow-up; `stubs.md` is empty.

**Security / contracts**: no executable behaviour changed; no secrets in the loosened read surface; no manifest field-set drift, so `backward_compat: migration` is not engaged.

## Sub-floor residuals (recorded, not findings)

- `t_prompt-external-impl.md:20` says the manifest is "below" while the block sits above it; the design prompt says "above" correctly. Pre-existing.
- Two sites cite the reference paths as coming from the "Phase-scoped payload table", where they are actually prose beneath it. Pointer precision, pre-existing.
- Latent overlap: under self-hosting the whole repo is in scope, so a named reference path not in `exclude_paths` could land in `files[]` while the new clause says it is never a valid finding location. Hypothetical today — this repo has no `docs/` tree, and in consumer mode every reference path is inside `exclude_paths`.

## Coverage

Manifest: [`correctness.manifest.json`](correctness.manifest.json) (digest `27d88491…47e1c4`). Validated ledger: [`correctness.ledger.json`](correctness.ledger.json). `validate-ledger` → `{"ok":true}`. `UI_CONFORMANCE` and `UI-1`..`UI-7` are `n/a: no-ui-surface-in-scope`.

## Verdict
APPROVE

## Next action
Correctness contributes an `APPROVE` to the DoD roster and latches. No fix routing to `impl`.

## Escalations
None.
