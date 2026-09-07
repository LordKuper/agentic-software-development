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
| 3 | e8dea4225fcf97efbd8e95de8ea87b7e9ab23853 | Delta since entry 2 carries no production source — only `tests/run.js` (entry 2's own authoring), sprint bookkeeping and agent memory. No new material risk, so no strategy pass: routed `execution: command` / tier `mechanical` by `runtime.js route-task` (reason `deterministic-command`), suite gate re-run directly per the phase's every-entry rule. |
| 4 | a6eb5992c7a0a93d0f42ea10218b75013b648896 | Review-fix wave for iter-02, task W4 (routed `standard`), against `reviews/impl/iter-02/testing.md`. W1 deleted `readSelfHostingField`/`isSelfHostingRepo` as dead code; W2 rewrote the scope-manifest contract (`mode`/`commits[]` dropped, `exclude_paths[]` added); W3 renamed the `-standard` variant path. Delta scope: six now-orphaned unit tests, one stale contract assertion, plus testing F1-F4 from the iter-02 review (AC-7 guard scope bug, `routeTask` negative-case gap, zero coverage on the scope-manifest template, misregistered Windows stub). |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| Compact review ledger | Missing, duplicate, forged `n/a`, or unlinked findings pass | Unit | add | Deterministic validator has security-like completeness semantics. |
| Runtime routing/preflight/cache | Wrong command execution, unsafe probe, stale failure cache, downgrade loop | Unit | add | Pure Node runtime has direct observable contracts. |
| Variant render/sync | Permission drift, collision, invalid metadata | Unit | add | Temp-repo sync plan proves generation and fail-closed branches. |
| PM migration | Consumer-owned or modified generated files deleted | Unit | add | Migration is destructive and idempotence is required. |
| Gate/session prose and workflows | Contract drift | keep | Existing runner and sync/hash checks cover generated views and hooks; no separate prose-only tests. |
| Scope-manifest template (`t_review-scope.json`) | Template ships out of sync with `external-review.md`'s declared field list (as it did this wave: shipped missing `exclude_paths[]`) | Contract test | add | testing F3: the JSON-parse guard was non-recursive and never even parsed this file, let alone asserted its key set; not covered by the blanket "Gate/session prose" row above — this is a data contract, not prose. |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| `isSelfSourcedAgentsMd: no config -> self-sourced; consumer config -> generated; self_hosting:enabled -> self-sourced even though config exists` | Asserted a production function (`sync.isSelfSourcedAgentsMd`) that T1 deleted outright (decisions-log "Escalation 2 resolved: drop the self-sourced carve-out for AGENTS.md" — the carve-out is removed, not completed). No replacement unit is needed for the deleted function itself; its behavior is now covered end-to-end by the two `buildSyncPlan: ... AGENTS.md ...` tests below, which exercise the real plan/check/apply path AGENTS.md now goes through. | yes |
| `` `node .asd/sync.js --check` reports every item current, including AGENTS.md `` — assertion narrowing reversed | testing F1: iter-01 had narrowed the drift filter to `item.target !== 'AGENTS.md' && item.status !== 'current'`, directly contradicting its own preceding comment ("would have silently accepted permanent drift"). AGENTS.md is now a genuine managed-block target and is provably `current` in this repo (`node .asd/sync.js --check` confirmed), so the allowlist is deleted and the assertion restored to the unfiltered `parsed.items.filter((item) => item.status !== 'current')`. The now-false in-body comment block explaining the narrowing is deleted per `code-style.md` §7 (no comments inside function bodies); the residual justification moved into the `assert.deepStrictEqual` message itself. | yes |
| `readSelfHostingField: config.yaml absent -> disabled`, `… field absent -> disabled`, `… self_hosting: disabled -> disabled`, `… self_hosting: enabled -> enabled`, `… malformed/unknown value fails closed to disabled`, `… duplicated top-level key is ambiguous, fails closed to disabled` (6 tests) | W1 (iter-02) deleted `readSelfHostingField` and `isSelfHostingRepo` from `.asd/sync.js` as dead code — their sole production caller went away with the `AGENTS.md` self-sourced carve-out drop. These six tests were the only remaining consumers, i.e. they were keeping dead code alive by testing it directly. No replacement is needed: the carve-out they exercised no longer exists anywhere in production, and the two `buildSyncPlan: ... AGENTS.md ...` tests already cover the surviving ordinary managed-block path. | yes |

## Added tests

| Test | Regression proof |
|---|---|
| `tests/run.js: compact coverage ledger` | Added after implementation; rejects malformed ledger mutations. |
| `tests/run.js: routing/preflight/cache` | Added after implementation; checks deterministic command routing and bounded local-only failure handling. |
| `tests/run.js: variants and PM migration` | Added after implementation; checks inheritance, collision rejection, and protected deletion. |
| `tests/run.js: wrapped model aliases` | Fail-first at HEAD `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` (parent of `d046e01`): renderer emitted literal `{{wraps_model}}`; fixed at `d046e01`. |
| `buildSyncPlan: WITHOUT .asd/project/config.yaml (the framework repo itself), AGENTS.md is an ordinary managed-block target rendered from t_AGENTS.md` (replaces the obsolete self-sourced test above) | Fails against pre-T1 production code (the self-sourced branch reported `current`/no-op instead of `missing`/real render); passes at HEAD `55292d1`. Closes the dev-verified-by-hand gap named in this cycle's dispatch: a no-config repo must report `missing` and `--apply` must actually create the file, not report `applied:false`. |
| `buildSyncPlan: with t_AGENTS.md absent, AGENTS.md drops out of the plan entirely and --apply reports not-found instead of throwing ENOENT` | Fails against pre-T1 production code (`agentsMdTemplatePath` branch didn't exist; a missing template threw `ENOENT` under the old always-present self-sourced plan entry). Passes at HEAD `55292d1`, proving the documented `not-found` contract instead of a crash. |
| `AC-2/4/6/7: review workflow contracts retain Correctness and incremental diff scope` (assertion updated, corrected again in iter-02) | The literal `git diff <state.json ...>...HEAD <pathspec>` string T4/T6 removed no longer exists in `t_prompt-external-impl.md` after the scope-manifest rewrite. Entry-2 authoring asserted a `mode: "files"` literal that never actually existed in the template (the transport is `files[]` + `exclude_paths[]`, with no `mode` field at all — confirmed against `.asd/rules/external-review.md`'s declared field list); this was one of the seven baseline failures this cycle's dispatch called out. Corrected to assert `files[]` and `exclude_paths[]` presence, keeping the surviving `iteration_heads["iter-(N-1)"]` incremental-scope clause. Passes at HEAD `a6eb599`. |
| `AC-3/4/5: preflight ... negative cache is bounded and expires` (assertion updated) | T2 moved negative-cache pruning into `readCache` (in-memory on read, persisted only on the next actual write). The old on-disk-pruned-immediately assertion no longer holds; replaced with an assertion of the actual contract (read-only preflight leaves the stale entry on disk; the next `recordExternalFailure` write prunes it). Verified against the current `.asd/runtime.js` behavior directly (`node -e` probe) before encoding it. |
| `AC-5: negative-cache recovers when the fingerprint changes because model, command, or credential state changed` (testing F4a) | Fails against a hypothetical `cacheKey` that ignores model/command/credential state (would return `negative-cache` for all three mutated inputs); passes at HEAD `55292d1` because `cacheKey` folds `model`, `command`, and `authGeneration(credentialPath mtime/size)` into the fingerprint. |
| `AC-5: the persisted negative-cache entry never carries anything beyond {status, retry_after}` (testing F4b) | Fails if `recordExternalFailure`/`writeCache` ever spread the full input object into the persisted entry; passes at HEAD `55292d1` since `cache.entries[fingerprint] = { status, retry_after }` is an explicit two-key object literal. |
| `AC-10: haiku variant with no unsupported effort override must drop the inherited effort line entirely` (testing F4c) | Fails against a `variantMeta` that always copies `claude.effort` from the base agent; passes at HEAD `55292d1` since `if (spec.claude.effort === undefined) delete claude.effort;` removes it. |
| `AC-21: SessionStart reports "Next phase: await-user-closure" / "Next phase: await-merge"` (testing F2) | Fails against a `nextPhase`-only implementation with no `pr.state` branch (would report the next phase chain entry, e.g. `done`, for both fixtures); passes at HEAD `55292d1` since `session-start.js`'s ternary branches on `state.pr.state === 'closure-pending'`. |
| `AC-7: no canonical rule, workflow, or agent file references the retired asd-pm role` (testing F2, contract-string guard) | Currently true and previously unguarded per the finding; would fail the moment any canonical `.md` under `.asd/{rules,workflows,agents}` reintroduces `asd-pm`. |
| Ledger anti-forgery cases: extra claimed finding, phantom finding with none raised, duplicate finding id (testing F5) | Fails against a `validateCoverageLedger` that never compares `ledger.findings` to `actualFindings` (all three forged ledgers would validate); passes at HEAD `55292d1` via the `stable(findingIds.slice().sort()) !== stable(actualFindings.slice().sort())` check. |
| `runtime.js CLI: validate-ledger` (ok + tampered), `external-preflight` exit-1, `manifest-digest` + `--write` (testing F7) | Fails against a `main()` that swallows errors or reports exit 0 regardless of validity (e.g. no throw/exit-code wiring); passes at HEAD `55292d1` against the real CLI subprocess, exercising `parseFlagArgs`/`inputJson`/exit-code contract that only module-export tests previously left unverified. |
| `AC-7` guard scope fix (iter-02 testing F1): iterate over `['rules','workflows','agents']` labels, resolve the dir inside the loop, push `` `${label}/${f}` `` instead of the out-of-scope arrow-parameter `d` | Fails on the pre-fix code: temporarily reintroducing an `asd-pm` mention in `.asd/rules/core.md` and running the suite threw `ReferenceError: d is not defined` instead of naming the offender (observed, then reverted — working tree confirmed clean). Post-fix, the same mutation makes the test fail cleanly naming `rules/core.md`, proving the diagnostic now works; reverted again after observation. |
| `AC-10/11: routing is monotonic …` — 4 new negative-case assertions (iter-02 testing F2) | Each targets one of the mechanism's clauses in `.asd/runtime.js routeTask`: dropping `objectiveInputs === true` from the `mechanical` guard, dropping it from the `deterministicCommand` guard, dropping the `attempted >= 1` clause, and dropping the `hasRisk` branch. Each mutation applied individually, run, observed to fail exactly this test, then reverted (`git checkout -- .asd/runtime.js`; working tree confirmed clean after each). Closes testing F2: previously every case shared one evidence shape, so deleting any of these clauses left the suite green. |
| `AC-2/4/6/7: t_review-scope.json key set matches external-review.md's declared manifest fields exactly` (testing F3) | Fails against the pre-W2 template shape (`git show 476bd76:.asd/templates/external-review/t_review-scope.json` has `mode`+`commits[]`, no `exclude_paths[]`) — verified directly against the assertion logic; passes at HEAD against the current template. Also asserts `mode`/`commits` are absent so they cannot silently reappear. |
| `every .asd/templates/**/*.json file parses as valid JSON` (renamed, testing F3) | Guard changed from a top-level-only `readdirSync` to `{ recursive: true }`, so `external-review/t_review-scope.json` is now actually parsed — it previously was not, which is exactly how it shipped malformed. |
| `AC-2/4/6/7: review workflow contracts …` extended to `t_prompt-external-design.md` (testing F3) | The design-review prompt was rewritten this wave and had no assertion at all; added `files[]`/`exclude_paths[]` presence plus the empty-`base_ref`/`head_ref` draft-snapshot contract. |

## Explicit skips (registered in stubs.md)

| Test | Reason |
|---|---|
| `AC-4: Windows .cmd preflight executes a metacharacter-containing path literally` | testing F6: the only check for `runLocal`'s Windows `.cmd`/metacharacter PowerShell-fallback branch; guarded by `process.platform !== 'win32'`. Changed from a silent no-op return to an explicit `console.log('(skipped: ...)')` matching this file's existing symlink-skip convention, and registered in `.asd/project/stubs.md`. Corrected in iter-02 (testing F4): the stubs.md row now cites `File:Line` (`tests/run.js:2296`) instead of a test name, and an in-code `// TODO(sprint-006-workflow-cost-routing): …` marker was added at that line so the registry contract (marker + entry) is actually satisfied. Reason deliberately does NOT carry the `(accepted-debt)` prefix — that requires explicit user approval, not asserted here; see production change request below. |

## Suite run

- Command: `node tests/run.js`
- Scope: impacted (unscoped fallback: shared sync/update/migration harness)
- Result (entry 1): pass — 118/118. Initial run at `b31ea6dd297a9fc4fc065ea6d13a324878b41b34` was 103/111 while implementation and generated views were incomplete; rerun passed after runtime, sync, manifest, and README repairs.
- Result (entry 2): pass — 127/127. Entry-2 delta added 9 new tests (F2/F4a/F4b/F4c/F5/F7 coverage: 2 SessionStart closure-branch cases, 1 asd-pm contract-string guard, 2 negative-cache recovery/shape cases, 1 haiku-effort assertion folded into an existing test, 1 forged-finding block folded into an existing test, 4 runtime.js CLI-contract cases) and replaced 2 obsolete tests (see Removed tests). Immediately before this entry's fixes, the same command reported 114/118 (the four baseline failures named in this cycle's dispatch — all four are addressed above, none by production changes).
- Result (entry 3): pass — 127/127, unchanged from entry 2. No test authored, pruned or adjusted: the delta contained no production source. Verified at `e8dea4225fcf97efbd8e95de8ea87b7e9ab23853`.
- Result (entry 4): before fixes, 120/127 (7 expected failures: 6 orphaned `readSelfHostingField`/`isSelfHostingRepo` tests + 1 stale scope-manifest assertion, all named in this cycle's dispatch). Deleted the 6 orphaned tests, corrected the stale assertion, then addressed testing F1-F4: fixed the AC-7 guard's out-of-scope variable bug (proven fail-first by temporary mutation, reverted clean), added 4 `routeTask` negative-case assertions (each proven fail-first by an individual targeted mutation of `.asd/runtime.js`, reverted clean after each), added a recursive JSON-parse scan plus a scope-manifest key-set contract test (proven fail-first against the pre-W2 template shape at commit `476bd76`) and extended the workflow-contract test to the design-review prompt, and corrected the Windows stub's registry row (`File:Line` + in-code TODO marker; no `(accepted-debt)` added — flagged as a production change request, not decided here). Final: pass — 122/122. Verified at `a6eb5992c7a0a93d0f42ea10218b75013b648896`.
- `node .asd/sync.js --check` — clean, exit 0 (verified after entry-4 edits; no production files touched).
- Lint / build: pass before impl-test, per impl completion signal; sync/hash checks are included in the passing runner.
- HEAD: `a6eb5992c7a0a93d0f42ea10218b75013b648896` — analysed HEAD for entry 4, before impl-test's own commits land on top; PR phase must compare its final HEAD before reuse.

### Production change request (testing F4, not applied — out of scope for impl-test)

`.asd/runtime.js`'s `runLocal` constructs the Windows PowerShell-fallback invocation inline, so the only way to assert its shape is the win32-gated end-to-end test above, which is silent on every other host. Extracting invocation construction into a pure helper (`(platform, command, args) -> {file, args, input}`) would let both the direct-spawn and PowerShell-fallback shapes be asserted on any host, after which the stub could be deleted (keeping the win32-only end-to-end check as a bonus, non-blocking assertion). This is production code in `.asd/runtime.js`, outside impl-test's ownership — routed back to `impl` for a decision rather than applied here.

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
