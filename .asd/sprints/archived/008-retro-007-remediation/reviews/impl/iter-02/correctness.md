[REVIEW-impl-correctness]: CONCERNS
Interrupted attempts: 1 (session rate limit)

# Review — correctness

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| C-1 | high | `.asd/rules/review-policy.md:144` (merge condition (d)) | Condition (d) — "every rule id and section id resolves non-`n/a` in at least one half" — is **unsatisfiable for any id the unpartitioned manifest itself declares `n/a`**, and it creates a new incentive to manufacture evidence. Concrete: this dispatch's own manifest declares `ac-4` `n/a` and `ui-conformance` `n/a`. If correctness were split, both halves are handed those same authorized predicates (the partition rule at `:142` keeps `n_a` for retained ids and merely *adds* the out-of-half predicate), both halves truthfully return `n/a`, (d) fails, "any check failing blocks the merge — that reviewer counts as incomplete", and the re-dispatch produces the identical result forever; the only exit is user escalation. Mirror hazard: a half that legitimately holds no evidence for a rubric id is now pushed to record a vacuous `reviewed`/`pass` — both valid `validate-ledger` statuses — rather than the truthful `n/a`. The manufactured-evidence hole is moved, not closed. | Restate (d) over the *out-of-half* predicate only: "no rule or section id may carry the out-of-half predicate `evidence outside this half; covered by <reviewer>.part-N` in **both** halves; an id whose unpartitioned manifest authorizes a different `n/a` predicate may be `n/a` in both halves and is not a merge blocker." Carry the same wording into the future `validate-partition` contract. |
| C-2 | high | `.asd/workflows/asd-phase-impl-review.md:74` (step 13) vs `.asd/rules/sprint-lifecycle.md:316-317` | Step 13 contradicts the SSoT it implements, three ways. (i) It stamps `head` = `git rev-parse HEAD` "at that moment", while `:316` says `head` = newest commit in `<base>..HEAD` touching `pathspec`, "**never raw `HEAD`**". Since step 13 runs *after* the exit bookkeeping commit — which touches `.asd/sprints/**`, outside the pathspec — the recorded sha can never equal the pathspec-scoped head the next reader computes, so the record misses on every read and the C-6 fix is inert exactly where it was meant to work. Contrast `asd-phase-impl-test.md:53`, which re-runs the diff *before* its bookkeeping commit and does hit. (ii) It re-records "step 1's scope file list" instead of re-running the diff, while `:317` requires "the same diff re-run in the final bookkeeping write"; step 9's `asd-tester` test-fix commits touch in-pathspec test files after step 1, so the recorded list is short by those files. If (i) were corrected without (ii), the record *will* match a reader's computation while omitting real changed files — silent narrowing of the next phase's scope. (iii) Writing `state.json` after the exit commit leaves the worktree dirty at phase exit. | Mirror `asd-phase-impl-test.md:53`: re-run step 1's diff for the file list, derive `head` with the `:316` formula, write `derived_handoff` **before** the exit bookkeeping commit, and drop the `git rev-parse HEAD` phrasing entirely — cite `sprint-lifecycle.md` "State recovery" instead of restating a formula. |
| C-3 | medium | `.asd/sync.js:1469-1472` × `.asd/project/commands.yaml:16` | The guard is correctly placed (before `runApply` and before `recomputeAndWriteHashLedgers`, after `--force` filtering, so `--apply --force` also aborts) and no automated caller passes an empty list. But the repo's one *registered* command, `custom.sync-apply: "node .asd/sync.js --apply"`, is now a deterministic exit-1: `commands.yaml` is the "machine-only SSoT for project build/test/run commands", and `asd-dev.md:63` limits an agent's run-command to those entries verbatim — nothing defines a `commands.yaml` value as a prefix arguments may be appended to. A dev agent reaching for the only sync command available to it now always fails, and AC-5's sweep corrected the seven prose occurrences but not this machine-readable one. | Delete the `sync-apply` alias (the explicit invocation is now documented at `AGENTS.md:74`, `custom-coding-rules.md:14`, `asd-dev.md:66`), or replace its value with a form that cannot be run bare. Requires a write authorization — see Escalations. |
| C-4 | medium | `.asd/rules/sprint-lifecycle.md:115`, `.asd/templates/external-review/t_prompt-external-impl.md:20`, inherited by `.asd/rules/external-review.md:54,60` | The narrowed exclusion enumerates the generated trees correctly and the three statements agree, but the closing gloss — "everything `sync.js --apply` writes" — is factually broader than the enumeration. `--apply` also writes `AGENTS.md`/`CLAUDE.md` managed blocks (`tests/run.js:480` asserts exactly this), `.asd/release-manifest.json`'s two hash ledgers (`sync.js:1481`) and `.asd/sync-state.json`. An orchestrator building `exclude_paths` from the gloss rather than the list would drop `AGENTS.md` and `.asd/release-manifest.json` — both in this iteration's own 19-file scope — out of the review surface entirely. Same silent-narrowing failure mode the `.claude/agent-memory/**` carve-out was written to prevent. | Bound the gloss ("everything `sync.js --apply` writes **under those trees**") or delete it and let the enumeration stand; the enumeration is already the operative rule in all three files. |

Dropped below floor: 4 `low` findings (not listed).

## Section coverage notes

- **Bugs / Security**: no defect at or above floor. `riskEntry`'s normalization (`runtime.js:40`) is exact-match post-normalization and holds both ways — case, hyphen, underscore and repeated-space variants of the five reserved classes are caught, `security-audit-tool` and `config-file` are not; legacy bare strings still take `target: 'change'` unchanged, and no consumer can hold a typed `artifact` risk today since `target` ships in this same unreleased version. The reject path surfaces as exit 2 on stderr, matching "rejected by `route-task`".
- **Contracts**: `providers.md:111`'s new `reason` precedence list matches `runtime.js:177`'s ternary chain term-for-term. C-1/C-2/C-4 are the contract-drift class.
- **AC coverage trace**: `ac-4` `n/a` **verified** rather than accepted — `sync.js:1400,1420,1475,1483` fail closed on an unmatched `--apply` target and the deliberate `orphan-unmarked` ok-result at `:1416` is untouched. `ac-13`: the union-property assertions removed from the split test are recorded with rationale in `test-plan.md:48`, so the removal is an explicit reviewed decision. Hash freshness is machine-checked by `tests/run.js` §6b/§17 under the step-9 terminal gate.
- **UI conformance**: `n/a: no UI surface in scope file list`, per the dispatch predicate; no UI input loaded.

## Coverage

Validated compact ledger: [`correctness.ledger.json`](./correctness.ledger.json) against immutable manifest [`correctness.manifest.json`](./correctness.manifest.json), findings [`correctness.findings.json`](./correctness.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 19/19 files, 14/14 rules, 6/6 sections resolved.

## Verdict

CONCERNS: 4 (2 high, 2 medium)

## Next action

Route to impl review-fix mode. C-1 and C-2 are rule/workflow text fixes with no architecture change; C-4 is a one-clause edit in two files; C-3 needs the authorization below.

## Escalations

- **C-3**: the fix lands in `.asd/project/commands.yaml`, outside the `sprint-lifecycle.md` "Self-hosting" write allowlist. Requires a one-off user write authorization recorded in `decisions-log.md`, in the same form as those already granted for `.asd/project/custom-coding-rules.md` — or an explicit decision to leave the broken alias and defer.
