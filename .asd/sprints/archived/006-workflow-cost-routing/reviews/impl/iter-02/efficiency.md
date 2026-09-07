[REVIEW-impl-efficiency]: CONCERNS

# Review — efficiency

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium
- **Scope**: incremental, 32 paths (`11333cb…60a991a`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | critical | `.asd/sync.js:1129-1149`, `:1568-1569`; `.asd/runtime.js:45`, `:103`, `:106` | **OE-13, dead code left behind by this wave's deletions.** (a) `readSelfHostingField`/`isSelfHostingRepo` lost their only production caller when the AGENTS.md self-sourced carve-out was deleted — no `.js` in the tree calls either; the six tests at `tests/run.js:496-541` are their sole remaining consumers, so the tests keep dead code alive. (b) `runLocal` returns `{ok, timedOut, status}` but no caller reads `timedOut` or `status`, and it is not exported — vestiges of the removed caller-settable `timeoutMs`. (c) `cacheKey({ ...input, provider, model, authArgs }, …)` is a no-op object: `provider`/`model` already equal `input`'s values and `cacheKey` recomputes `defaultAuthArgs(input.provider)` itself, ignoring `input.authArgs` — misleadingly implying the fingerprint binds a passed-in auth-arg list. | (a) delete both functions, both export lines, and the six tests. (b) return `{ ok }` from `runLocal`. (c) call `cacheKey(input, false)` / `cacheKey(input, auth.ok)`; keep the `authArgs !== undefined` rejection (a real fail-loud guard on JSON input) and the local `authArgs` used by the probe. |
| F2 | critical | `.asd/sync.js:1312`; plan items `:1246`, `:1247`, `:1261`, `:1262`, `:1274`, `:1275` | **OE-7, defensive code for an impossible-by-contract case.** The `readCanonSource` hoist is a real win, but `renderFullFileItem` kept `const source = item.source \|\| readCanonSource(item.canonPath, item.parse);` for "a hand-built item". `renderFullFileItem` is not exported and its only callers receive items from `buildSyncPlan`, where every full-file item sets `source`. The branch is unreachable, and it is the sole remaining reader of the `parse:` field now duplicated onto all six plan pushes — so the "read once" change left a dead field on every item it created. | `const source = item.source;` and drop `parse: true`/`parse: false` from the six plan pushes (the literal second argument is what actually selects parsing). |
| F3 | critical | `.asd/templates/external-review/t_review-scope.json:6,8`; `.asd/rules/external-review.md:46,48`; `asd-phase-impl-review.md:25`; `asd-phase-design-review.md:35` | **OE-6, premature config flag — no caller chooses the non-default.** The new transport ships a two-valued `mode` enum plus a `commits[]` array that `external-review.md` states outright is "a reserved schema value, not populated by either workflow today". Both workflows hardcode `mode: "files"`, the field-list rule "the array matching `mode` … the other stays empty" exists only to describe the unused branch, and the wording leaks into `asd-external-review.md:15`. Speculative machinery in exactly the place the transport rewrite was meant to simplify. | Drop `mode` and `commits` from the template, from `external-review.md`'s field list and its `mode: "commits"` paragraph, from both workflows' step-1 manifest instructions, and from `asd-external-review.md` prose; the manifest becomes `phase`/`iteration`/`base_ref`/`head_ref`/`files[]`/`exclude_paths[]`. While editing the template, add the `exclude_paths[]` field it is missing. Reintroduce a mode discriminator when a second producer exists. |
| F4 | critical | `.asd/migrations/5.0.0.js:35-38` (called `:78`) | **OE-8, helper wrapping one call with no added value.** `removeIfEmpty(sync, dir)` exists only to guard `typeof sync.removeIfEmptyDir === 'function'` before delegating, with a hand-rolled fallback. `update.js` replaces `managed_paths` files (including `.asd/sync.js`) *before* migrations run, so the export is guaranteed present; and the same file already calls `sync.isSymlink`, `sync.readNormalized`, `sync.parseFullFileMarker`, `sync.sha256Hex` and `sync.hasOwnershipMarker` unguarded — the guard protects one of six symbols of identical vintage, so it cannot rescue an old `sync.js` anyway. | Delete `removeIfEmpty` and call `sync.removeIfEmptyDir(path.dirname(target))` directly. |

Checked and clear: `SC-1` (no new responsibility mixing; `manifest-digest` sits inside `runtime.js`'s existing coverage-ledger responsibility, and the standing single-file decision is respected — split not re-raised); `CV-1` (the `standard`-variant removal is a genuine net simplification; the scope-manifest transport earns its weight for a git-less wrapped CLI, which cannot resolve a base ref); `PA-1`…`PA-7` (negative cache bounded by ≤1h TTL and pruned on write; read-pruning is in-memory only and correctly does not rewrite the file); `ALG-1`…`ALG-3` (set/map-based, linear); `HP-1` (preflight is per-iteration, fingerprint-cached).

## Coverage

Manifest: [`efficiency.manifest.json`](efficiency.manifest.json) (digest `fca483b2…b4c36e`). Validated ledger: [`efficiency.ledger.json`](efficiency.ledger.json). Findings: [`efficiency.findings.json`](efficiency.findings.json). `validate-ledger` → `{"ok":true}`.

`PERF_BUDGET` and rules `PB-1`/`RG-1` are `n/a: no budgets defined`, confirmed against `custom-coding-rules.md`. The other four performance sections were reviewed normally — the conjunctive predicate is false.

## Verdict
CONCERNS: 4

## Next action
Route to `impl` (review-fix mode). All four are `simplify` — pure deletion, no new abstraction, layer or dependency, so the fixes need no Complication Approval. F1(a) also deletes `tests/run.js:493-541`; F3 touches four files plus `asd-external-review.md` and needs `node .asd/sync.js --apply` for the regenerated agent view.

## Escalations
- finding F3: no escalation for the fix, but it reverses a narrowing recorded deliberately in `decisions-log.md` ("`mode: "commits"` stays a reserved value … because the Claude-wrapped CLI has no git access"). That recorded rationale explains why only `files` is *wired*; it does not justify shipping the unused branch. If the dev disagrees, the orchestrator should put it to the user rather than silently re-recording the same narrowing.
