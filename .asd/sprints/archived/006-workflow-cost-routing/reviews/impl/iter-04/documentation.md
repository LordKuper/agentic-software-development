[REVIEW-impl-documentation]: APPROVE

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 4
- **Severity floor**: high
- **Scope**: incremental, 9 paths (`08ea5d1…9ff22c5`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

## Basis (what was verified)

**D-1 SSoT — the four-site question, judged rather than counted.** The home is `external-review.md:46`. The other three sites are consistent with it, not competing definitions:

- `asd-external-review.md:47` states the compressed operational form and explicitly defers ("Full contract, per-phase table and iteration semantics: `external-review.md` § Phase-scoped payload"); `:105` is the behavioural restatement of the same carve-out.
- Both prompt templates carry the sentence because a prompt is a **runtime payload**, not a document: it is piped over stdin into the other provider's CLI, which receives only that text. Deferring by link is not a reliable carrier there, so this is the allowed-mirror case, not a second home.
- No fifth site contradicts it — the workflows describe only how `exclude_paths[]` is populated, never readability.

Drift is now mechanically pinned by the new contract-string guard over the rule doc and both prompts, with placeholder assertions making the carve-out meaningful. Sub-floor residual: the agent file is the one statement site the guard does not pin.

**Deleted-helper cleanup is complete and honest.** `isSelfHostingRepo` occurs nowhere in canon, generated views, tests, README or CHANGELOG. The prose replacements match reality: neither `sync.js` nor `update.js` reads `self_hosting` at all, so stating the fail-closed rule as agent behaviour rather than a code guarantee is the accurate framing. `asd-init`'s step 0a agrees with `providers.md:9` and `AGENTS.md`; the stale "never replace the managed block while self-hosting" claim survives nowhere.

**D-8 framework mode.** README's manifest summary is accurate against the template's key set and defers to the rule doc. No README or CHANGELOG statement mentions `commits[]`, `mode`, or a rendered diff. Phase list, agent roster (11 canonical + 4 tier variants), model tiers, config schema, folder map and command list remain accurate. `release-manifest.json` carries `canon_hashes` and `upstream_hashes` entries for every changed canonical path, with matching digests across both maps.

**D-7 in-code doc comments** (`tests/run.js`): both new hunks are clean — the explanatory block sits at module level above the `test(...)` statement, not inside a function body; neither the new test body nor the extended guard carries in-body comments or TODO markers.

**D-9 custom rules**: generated views resynced across both provider trees, no new dependency, no hand-edited provider view. `asd-pm` survives only in `.asd/migrations/5.0.0.js` (a `.js`, outside the guard's `.md` filter, intentionally) and in sprint history.

## Coverage

Manifest: [`documentation.manifest.json`](documentation.manifest.json) (digest `a766a0ed…a101a2f`). Validated ledger: [`documentation.ledger.json`](documentation.ledger.json). `validate-ledger` → `{"ok":true}`. `HTML_SHELL`/`PROVENANCE` are `n/a: no-html-artifact-in-scope`; `TRACEABILITY`/`PERSISTENT_ACTUALITY` are `n/a: documents-disabled`.

## Verdict
APPROVE

## Next action
Documentation contributes an `APPROVE` to the DoD roster and latches. On full roster approval the phase runs its single full-suite check before `NEXT: pr`.

## Escalations
None.
