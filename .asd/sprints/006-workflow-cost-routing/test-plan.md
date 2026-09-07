---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 006-workflow-cost-routing

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | b31ea6dd297a9fc4fc065ea6d13a324878b41b34 | Full implementation diff; shared sync/update/migration harness requires unscoped `node tests/run.js` fallback. |
| 2 | 55292d115c4374ab609799774457d8da493db18a | Review-fix wave landed (T1 dropped the AGENTS.md self-sourced carve-out, T2 rewrote `runtime.js` probe/cache/routing internals, T3 removed duplicate `-standard` agent variants, T4/T6 rewrote both review workflows around a scope-manifest transport). Delta scope: the four resulting baseline test failures, plus `reviews/impl/iter-01/testing.md` findings F1-F7 (drift-assertion narrowing, untested closure branch, missing fail-first evidence, unasserted AC-5/AC-10 clauses, ledger anti-forgery gap, silent Windows-only skip, untested CLI contract). |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Compact review ledger | Missing, duplicate, forged `n/a`, or unlinked findings pass | Unit | add | Deterministic validator has security-like completeness semantics. |
| Runtime routing/preflight/cache | Wrong command execution, unsafe probe, stale failure cache, downgrade loop | Unit | add | Pure Node runtime has direct observable contracts. |
| Variant render/sync | Permission drift, collision, invalid metadata | Unit | add | Temp-repo sync plan proves generation and fail-closed branches. |
| PM migration | Consumer-owned or modified generated files deleted | Unit | add | Migration is destructive and idempotence is required. |
| Gate/session prose and workflows | Contract drift | keep | Existing runner and sync/hash checks cover generated views and hooks; no separate prose-only tests. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists` | Asserted a production function (`sync.isSelfSourcedAgentsMd`) that T1 deleted outright (decisions-log "Escalation 2 resolved: drop the self-sourced carve-out for AGENTS.md" — the carve-out is removed, not completed). No replacement unit is needed for the deleted function itself; its behavior is now covered end-to-end by the two `buildSyncPlan: ... AGENTS.md ...` tests below, which exercise the real plan/check/apply path AGENTS.md now goes through. | yes |
| `` `node .asd/sync.js --check` reports every item current, including AGENTS.md `` — assertion narrowing reversed | testing F1: iter-01 had narrowed the drift filter to `item.target !== 'AGENTS.md' && item.status !== 'current'`, directly contradicting its own preceding comment ("would have silently accepted permanent drift"). AGENTS.md is now a genuine managed-block target and is provably `current` in this repo (`node .asd/sync.js --check` confirmed), so the allowlist is deleted and the assertion restored to the unfiltered `parsed.items.filter((item) => item.status !== 'current')`. The now-false in-body comment block explaining the narrowing is deleted per `code-style.md` §7 (no comments inside function bodies); the residual justification moved into the `assert.deepStrictEqual` message itself. | yes |

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js: compact coverage ledger` | Added after implementation; rejects malformed ledger mutations. |
| `tests/run.js: routing/preflight/cache` | Added after implementation; checks deterministic command routing and bounded local-only failure handling. |
| `tests/run.js: variants and PM migration` | Added after implementation; checks inheritance, collision rejection, and protected deletion. |
| `tests/run.js: wrapped model aliases` | Fail-first at HEAD `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` (parent of `d046e01`): renderer emitted literal `{{wraps_model}}`; fixed at `d046e01`. |
| `buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md is an ordinary managed-block target rendered from t_AGENTS.md` (replaces the obsolete self-sourced test above) | Fails against pre-T1 production code (the self-sourced branch reported `current`/no-op instead of `missing`/real render); passes at HEAD `55292d1`. Closes the dev-verified-by-hand gap named in this cycle's dispatch: a no-config repo must report `missing` and `--apply` must actually create the file, not report `applied:false`. |
| `buildSyncPlan: with t_AGENTS.md absent, AGENTS.md drops out of the plan entirely and --apply reports not-found instead of throwing ENOENT` | Fails against pre-T1 production code (`agentsMdTemplatePath` branch didn't exist; a missing template threw `ENOENT` under the old always-present self-sourced plan entry). Passes at HEAD `55292d1`, proving the documented `not-found` contract instead of a crash. |
| `AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope` (assertion updated) | The literal `git diff <state.json ...>...HEAD <pathspec>` string T4/T6 removed no longer exists in `t_prompt-external-impl.md` after the scope-manifest rewrite; updated to assert the new `mode: "files"` / `exclude_paths[]` transport plus the surviving `iteration_heads["iter-(N-1)"]` incremental-scope clause. Fails against pre-T4/T6 wording; passes at HEAD `55292d1`. |
| `AC-3/4/5: preflight ... negative cache is bounded and expires` (assertion updated) | T2 moved negative-cache pruning into `readCache` (in-memory on read, persisted only on the next actual write). The old on-disk-pruned-immediately assertion no longer holds; replaced with an assertion of the actual contract (read-only preflight leaves the stale entry on disk; the next `recordExternalFailure` write prunes it). Verified against the current `.asd/runtime.js` behavior directly (`node -e` probe) before encoding it. |
| `AC-5: negative-cache recovers when the fingerprint changes because model, command, or credential state changed` (testing F4a) | Fails against a hypothetical `cacheKey` that ignores model/command/credential state (would return `negative-cache` for all three mutated inputs); passes at HEAD `55292d1` because `cacheKey` folds `model`, `command`, and `authGeneration(credentialPath mtime/size)` into the fingerprint. |
| `AC-5: the persisted negative-cache entry never carries anything beyond {status, retry_after}` (testing F4b) | Fails if `recordExternalFailure`/`writeCache` ever spread the full input object into the persisted entry; passes at HEAD `55292d1` since `cache.entries[fingerprint] = { status, retry_after }` is an explicit two-key object literal. |
| `AC-10: haiku variant with no unsupported effort override must drop the inherited effort line entirely` (testing F4c) | Fails against a `variantMeta` that always copies `claude.effort` from the base agent; passes at HEAD `55292d1` since `if (spec.claude.effort === undefined) delete claude.effort;` removes it. |
| `AC-21: SessionStart reports "Next phase: await-user-closure" / "Next phase: await-merge"` (testing F2) | Fails against a `nextPhase`-only implementation with no `pr.state` branch (would report the next phase chain entry, e.g. `done`, for both fixtures); passes at HEAD `55292d1` since `session-start.js`'s ternary branches on `state.pr.state === 'closure-pending'`. |
| `AC-7: no canonical rule, workflow, or agent file references the retired asd-pm role` (testing F2, contract-string guard) | Currently true and previously unguarded per the finding; would fail the moment any canonical `.md` under `.asd/{rules,workflows,agents}` reintroduces `asd-pm`. |
| Ledger anti-forgery cases: extra claimed finding, phantom finding with none raised, duplicate finding id (testing F5) | Fails against a `validateCoverageLedger` that never compares `ledger.findings` to `actualFindings` (all three forged ledgers would validate); passes at HEAD `55292d1` via the `stable(findingIds.slice().sort()) !== stable(actualFindings.slice().sort())` check. |
| `runtime.js CLI: validate-ledger` (ok + tampered), `external-preflight` exit-1, `manifest-digest` + `--write` (testing F7) | Fails against a `main()` that swallows errors or reports exit 0 regardless of validity (e.g. no throw/exit-code wiring); passes at HEAD `55292d1` against the real CLI subprocess, exercising `parseFlagArgs`/`inputJson`/exit-code contract that only module-export tests previously left unverified. |

## Explicit skips (registered in stubs.md)

| Test | Reason |
|---|---|
| `AC-4: Windows .cmd preflight executes a metacharacter-containing path literally` | testing F6: the only check for `runLocal`'s Windows `.cmd`/metacharacter PowerShell-fallback branch; guarded by `process.platform !== 'win32'`. Changed from a silent no-op return to an explicit `console.log('(skipped: ...)')` matching this file's existing symlink-skip convention, and registered in `.asd/project/stubs.md`. |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (unscoped fallback: shared sync/update/migration harness)
- Result (entry 1): pass — 118/118. Initial run at `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` was 103/111 while implementation and generated views were incomplete; rerun passed after runtime, sync, manifest, and README repairs.
- Result (entry 2): pass — 127/127. Entry-2 delta added 9 new tests (F2/F4a/F4b/F4c/F5/F7 coverage: 2 SessionStart closure-branch cases, 1 asd-pm contract-string guard, 2 negative-cache recovery/shape cases, 1 haiku-effort assertion folded into an existing test, 1 forged-finding block folded into an existing test, 4 runtime.js CLI-contract cases) and replaced 2 obsolete tests (see Removed tests). Immediately before this entry's fixes, the same command reported 114/118 (the four baseline failures named in this cycle's dispatch — all four are addressed above, none by production changes).
- `node .asd/sync.js --check` — clean, exit 0.
- Lint / build: pass before impl-test, per impl completion signal; sync/hash checks are included in the passing runner.
- HEAD: `55292d115c4374ab609799774457d8da493db18a` — analysed HEAD for this entry, before impl-test's own commits land on top; PR phase must compare its final HEAD before reuse.

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| D-1 | `.asd/sync.js` wrapped CLI substitution | Nested `{{wraps_model}}` remained literal in rendered external wrapper. | `AC-3: wrapped model aliases` | fixed | d046e01 |
| D-2 | `.asd/runtime.js` Windows fallback / preflight cache validation | Inspection found shell-sensitive fallback, caller-controlled auth probe, and unbounded retry values; production fix supplied before an automated fail-first run at the time. | Routing/preflight/cache and Windows shim regressions | fixed | d046e01 |

### D-1 fail-first stamp (testing F3)

- HEAD `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` (parent of `d046e01`), test `AC-3: wrapped model aliases resolve through the wrapped provider table`: FAILS — renderer emitted the literal substring `{{wraps_model}}` instead of the resolved wrapped model. Fixed at `d046e01`. (The previously recorded `103/111` run at the same HEAD predates all seven entry-1 additions and cannot serve as fail-first evidence for any of them individually — this is the per-test replacement.)

### D-2 equivalent targeted mutations (testing F3 — no fail-first run was captured at the time; recorded now against HEAD `55292d115c4374ab609799774457d8da493db18a`)

Each mutation was applied to `.asd/runtime.js`, run through `node tests/run.js`, observed to fail exactly the named test, then reverted (`git checkout -- .asd/runtime.js`); working tree confirmed clean after each revert.

| Sub-defect | Line reverted to its pre-fix form | Test that then failed |
|---|---|---|
| Shell-sensitive Windows fallback | `runLocal`'s PowerShell branch reverted from the JSON-stdin invocation (`-Command '$ErrorActionPreference = "Stop"; ... $request = [Console]::In.ReadToEnd() | ConvertFrom-Json; ...'`, `input: JSON.stringify({ command, args })`) back to the old string-interpolated form (`-Command '& $args[0] @($args[1..($args.Length - 1)])', command].concat(args)`) | `AC-4: Windows .cmd preflight executes a metacharacter-containing path literally` |
| Caller-controlled auth probe | Removed `if (input.authArgs !== undefined) fail('authArgs are not supported');` and reverted `const authArgs = defaultAuthArgs(provider);` to `const authArgs = input.authArgs \|\| defaultAuthArgs(provider);` | `AC-3/4/5: preflight permits only fixed local probes and negative cache is bounded and expires` (the `authArgs` throw assertion) |
| Unbounded retry | Reverted `recordExternalFailure`'s bound check from `retryAfter > now + MAX_NEGATIVE_TTL_MS` back to no upper bound (`retryAfter <= now` only) | `AC-3/4/5: preflight permits only fixed local probes and negative cache is bounded and expires` (the `1000 + 3600001` case in the bounded-future loop) |

## Manual verification (optional)

| AC | Steps | Expected observation |
|---|---|---|
| AC-3..AC-6, AC-10..AC-12, AC-18..AC-21 | n/a: availability skip is an accepted contract; no live external model request is made for this test pass. | Unit checks validate deterministic helpers and generated contracts only. Independent review must assess model-directed routing and adaptive-gate instructions; local executable/auth probes do not prove model access, quota, or end-to-end dispatch. |
