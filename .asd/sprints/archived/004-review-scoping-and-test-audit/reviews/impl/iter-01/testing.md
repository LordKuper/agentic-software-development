[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1 (severity floor: `low`)
- **Method note**: this reviewer is read-only (no shell, per `providers.md`); the diff was reviewed by reading `iter-01.diff` and the on-disk files. The reported `96/96` run was corroborated structurally: `tests/run.js` carries exactly 96 top-level `test(` declarations; the recorded stdout contains the two migration `warning:` lines that only real execution of `4.0.0.js` emits, and no `(skipped symlink assertions…)` line — the symlink test really ran non-vacuously. `21d3420…` is the same HEAD in the entry log and the step-8 gate.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `update.js:390` (`await runMigrations` in `applyPlan`) / `update.js:275` (`asd_version: versionOverride`) vs `test-plan.md` row "update.js migration runner" | AC-12's core safety clause — "leave the recorded version at the last successfully applied one … never left at an unrecorded intermediate version" — has **no check at any level**. The five added tests exercise `runMigrations` in isolation (`tests/run.js:1543-1614`); nothing asserts the wiring that *records* it: that `applyPlan` passes `migrations.reachedVersion` into `writeUpdatedManifest`, that the written `.asd/release-manifest.json` carries the pinned version after a failed migration, or that `result.migrations` reaches `main()`. A wrong argument here (e.g. reverting to `newManifest.asd_version`) leaves the suite green and every consumer recorded at a version they never reached — and `main()` writes the manifest *before* `die()`, so the failure is silent. | Extend one existing update-driver fixture (the `mkTempDir` + local-fixture-as-upstream pattern, `tests/run.js:1130+`): ship a throwing `.asd/migrations/<v>.js` in the upstream tree, `await update.applyPlan(...)`, assert `JSON.parse(release-manifest.json).asd_version === <last success>` and `result.migrations.failure.version`. One test, same fixture family, no new infrastructure. |
| 2 | medium | `.asd/migrations/4.0.0.js:76` (`removeIfEmptyDir`) and `:64` (`.agents/skills/<name>/SKILL.md` target) vs `tests/run.js:1618` | The `add` row for `4.0.0.js` names "delete more than the explicit nine-name list" as its material risk, but the directory-deleting branch is untested. `deleteMarkedView` calls `removeIfEmptyDir(path.dirname(absPath))` for **all three** target families, so deleting the last marked file in a consumer's `.claude/agents/` removes the directory itself — behaviour justified in the comment only for the `.agents/skills/<name>/` case. The `.agents/skills/<name>/SKILL.md` delete path is likewise never exercised: the one fixture deliberately leaves that target absent (`tests/run.js:1620-1622`, asserted as `missing`). Both branches are destructive and run in every real consumer update. | Add one fixture case to the existing 4.0.0 delete test: a marked `.agents/skills/asd-test-engineer/SKILL.md` plus a surviving non-retired `.claude/agents/asd-dev.md`; assert the skill directory is gone and `.claude/agents/` (and any sibling file) survives. |
| 3 | medium | `tests/run.js:1164`, `:1226`, `:1260`, `:1301`, `:1348` | The `keep` row correctly triaged the 8 failures as test defects (verified against the diff: `applyClassifications`/`buildNextUpstreamHashes` are pre-`await`, `main()` at `update.js:514` already awaited — no code defect masked). But the fix left five `update.applyPlan(...)` call sites un-awaited on a now-`async` function. Consequences: (a) those tests now only observe the pre-`await` half — `writeUpdatedManifest` and the post-apply `runCheck` execute *after* the test is reported `ok`, so they silently stopped covering the manifest-write path they used to reach; (b) each leaves a floating promise whose continuation races subsequent tests and, on rejection, surfaces as an out-of-band unhandled rejection that can fail the process independently of the runner's own `failures` count. `code-style.md` §17 "Deterministic: no … execution-order reliance". | `await` all five (bodies already run under an awaiting runner, `tests/run.js:1840`), or, where the test intentionally observes only the synchronous half, make that explicit and still `await` the settled promise. Mark the pattern: `// flaky-pattern: un-awaited async production call — continuation outlives the test`. |
| 4 | low | `.asd/release-manifest.json:4` (`"asd_version": "3.1.0"`) vs `.asd/migrations/4.0.0.js`; `test-plan.md` "Manual verification: None" | `pendingMigrations` filters `version <= newVersion`, so with the shipped manifest at `3.1.0` the `4.0.0` migration is never pending — AC-13 is a no-op for every consumer until the `pr` phase bumps `asd_version` to exactly `4.0.0`. `plan.md:352-354` records that dependency; nothing else guards it, and no automated check can be green today (the invariant is deliberately violated at this HEAD). That makes it precisely the case `test-plan.md`'s Manual-verification section exists for, and it currently reads "None". | Record the pr-phase bump as the sprint's one verification item in `test-plan.md` (name the exact assertion: manifest `asd_version` must equal the highest `.asd/migrations/*.js` version), and add the corresponding unit assertion in `tests/run.js` once the bump lands. |
| 5 | low | `test-plan.md` `none` row ("the other ~50 files") | The row is honest about prose semantics, but leans on AC-15's repo-wide retired-name grep as its verification — and that grep's *result* is recorded nowhere (`Suite run` records only `test`/`lint`/`build`). A no-test decision whose stated substitute leaves no evidence is not a complete record. Ran the check read-only: zero retired-agent-name hits in `.asd/rules|workflows|agents|skills|templates`, `.claude/agents`, `.codex/agents`, `.agents/skills`, `README.md`, `AGENTS.md` — the only live hits are the legitimate hardcoded list in `.asd/migrations/4.0.0.js:39-47`, orphan/migration fixture names in `tests/run.js`, sprint records, and two out-of-scope `.claude/agent-memory/` folders. **Result: clean.** | Record that grep result (command + outcome) in `test-plan.md` alongside the suite run, so the `none` row's justification is evidenced rather than asserted. |
| 6 | low | `.asd/sync.js:1453-1455`, `:1483-1485` vs `tests/run.js:1449`, `:1514` | The new CLI red paths are untested: `--check` returning `ok:false`/exit 1 on a marked orphan, and `--apply` returning `ok:false`/exit 1 on a `not-found` target. The added tests assert `runCheck`/`runApply` return values only; the exit-code rule is merely *mirrored* in a comment (`tests/run.js:1454`). The green path is covered (`tests/run.js:959` spawns the real CLI and `execFileSync` throws on non-zero), so only the failing direction is blind — and `node .asd/sync.js --check` is this repo's `build` gate for every phase. | One test calling `sync.main(['node','sync.js','--check'])` in a `makeMiniRepo()` with a marked orphan, asserting return value `1`; optionally the same for `--apply` with a bogus target. |
| 7 | low | `tests/run.js:1590` ("a migration script shipped in this same apply loads fresh…") vs `code-style.md:116` | Judged against the hypothetical-risk criterion this sprint itself wrote: in production a migration path is `require`d at most once per `asd-update` process, so a stale `require.cache` entry is unreachable — `update.js:334-337` concedes it ("there is none yet in practice, since these files are new"). The only way to poison the cache is the test's own `require(migPath)` at `tests/run.js:1596`. Unlike `loadFreshSync` (where `update.js` genuinely holds a module-level `sync` require), the risk here is hypothetical, so the test does not clear the bar the sprint just authored. | Drop it, or restate its risk in real terms (e.g. `loadFreshMigration` must resolve from the freshly written tree rather than the framework repo's own copy) and assert that instead. |
| 8 | low | `tests/run.js:1657-1663` vs `.asd/migrations/4.0.0.js:157` | The `commands.yaml` fixture (`test: "npm test"\n\ncustom:\n…`) is not shaped like the file the migration actually targets: every `/asd-init`-generated `commands.yaml` derives from `t_commands.yaml:15`, which carries a **commented** `# test_affected:` line. The active-vs-comment distinction is exactly what `/^test_affected\s*:/m` encodes, and it is the branch every real consumer hits — untested. Two further report statuses (`undetectable`, `missing`) are also uncovered; only `added` and `already-present` are asserted. | Use a `t_commands.yaml`-shaped fixture (commented field present) and assert the field is still added; add a one-line case each for no-detected-runner (`undetectable`) and absent file (`missing`). |
| 9 | low | `test-plan.md:78-88` vs `.asd/templates/t_test-plan.md:47-58` | The sprint's own record does not follow the `Suite run` shape it authored this sprint: no `- Scope: {{impacted \| full}}` bullet, and `HEAD` sits inside the nested `### Impacted-set suite gate` subsection rather than the section's bullet list the `pr` gate reads. Self-application of a template change is part of the change surface. | Add the `Scope:` bullet and lift `HEAD` into the `Suite run` bullet list (the gate subsection can keep its own copy). |

## Coverage

**Summary**: `files: 12/58 checked, 46 n/a · rules: 12 rubric items, 9 findings`

**`n/a` rows (full list)**

| Item | Reason |
|---|---|
| `.asd/agents/asd-advisor.md` | frontmatter tier bump only; no executable behaviour — testing scope covered via the `none` row (finding #5) |
| `.asd/agents/asd-architect.md` | prose/delegation rename; no executable behaviour |
| `.asd/agents/asd-ba.md` | prose/delegation rename; no executable behaviour |
| `.asd/agents/asd-backend-dev.md` | deleted agent prose; roster count asserted by `tests/run.js:1002`/`:1052` |
| `.asd/agents/asd-dev.md` | new agent prose; roster count asserted by existing checks |
| `.asd/agents/asd-frontend-dev.md` | deleted agent prose; roster count asserted by existing checks |
| `.asd/agents/asd-pm.md` | frontmatter tier + prose; no executable behaviour |
| `.asd/agents/asd-reviewer-correctness.md` | new reviewer prose; read-only contract asserted by `tests/run.js:1002` |
| `.asd/agents/asd-reviewer-documentation.md` | prose rubric addition; no executable behaviour |
| `.asd/agents/asd-reviewer-efficiency.md` | new reviewer prose; read-only contract asserted by `tests/run.js:1002` |
| `.asd/agents/asd-reviewer-implementation.md` | deleted agent prose |
| `.asd/agents/asd-reviewer-performance.md` | deleted agent prose |
| `.asd/agents/asd-reviewer-quality.md` | deleted agent prose |
| `.asd/agents/asd-reviewer-simplification.md` | deleted agent prose |
| `.asd/agents/asd-reviewer-testing.md` | prose (own agent def); no executable behaviour |
| `.asd/agents/asd-reviewer-ui.md` | deleted agent prose |
| `.asd/agents/asd-tester.md` | authoring-bar prose; its normative SSoT is `code-style.md` §17, checked above |
| `.asd/agents/asd-ux.md` | rename only; no executable behaviour |
| `.asd/rules/artifact-layout.md` | prose; reviewer-file naming, no executable behaviour |
| `.asd/rules/checkpoints.md` | prose; no executable behaviour |
| `.asd/rules/core.md` | prose (Context hygiene section); no executable behaviour |
| `.asd/rules/design-system.md` | prose rename; no executable behaviour |
| `.asd/rules/git-strategy.md` | prose rename; no executable behaviour |
| `.asd/rules/providers.md` | prose; model-family table mirrored in manifest (existing check) |
| `.asd/rules/ux-principles.md` | prose rename; no executable behaviour |
| `.asd/skills/asd-design-system/SKILL.md` | prose rename; no executable behaviour |
| `.asd/skills/asd-init/SKILL.md` | prose (command detection); no executable behaviour in this repo |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | prose; no executable behaviour |
| `.asd/skills/asd-phase-design-review/SKILL.md` | prose; no executable behaviour |
| `.asd/skills/asd-phase-design/SKILL.md` | prose; no executable behaviour |
| `.asd/skills/asd-phase-impl-review/SKILL.md` | prose; no executable behaviour |
| `.asd/skills/asd-phase-impl-test/SKILL.md` | prose; authoring-bar SSoT checked via `code-style.md` §17 |
| `.asd/skills/asd-update/SKILL.md` | prose (migration contract doc); the contract itself is checked in `update.js` |
| `.asd/templates/t_config.yaml` | template prose/config keys; covered by existing template-parse checks |
| `.asd/templates/t_custom-coding-rules.md` | prose rename; no executable behaviour |
| `.asd/templates/t_custom-design-rules.md` | prose rename; no executable behaviour |
| `.asd/workflows/asd-phase-design-promote.md` | orchestration prose; no executable behaviour |
| `.asd/workflows/asd-phase-design-review.md` | orchestration prose; no executable behaviour |
| `.asd/workflows/asd-phase-design.md` | orchestration prose; no executable behaviour |
| `.asd/workflows/asd-phase-impl-review.md` | orchestration prose (full-suite step); no executable behaviour |
| `.asd/workflows/asd-phase-impl-test.md` | orchestration prose (authoring bar); no executable behaviour |
| `.asd/workflows/asd-phase-impl.md` | orchestration prose; no executable behaviour |
| `.asd/workflows/asd-phase-plan.md` | orchestration prose; no executable behaviour |
| `.asd/workflows/asd-phase-pr.md` | orchestration prose; the `asd_version` bump it owns is finding #4 |
| `AGENTS.md` | prose; agent-count claim asserted by `tests/run.js:1052` |
| `README.md` | prose; agent-count claim asserted by `tests/run.js:1052` |

**Finding rows (verbatim)**

| Rubric item | Finding |
|---|---|
| No-test-decision honesty (the `none` row) | finding #5 |
| Meaningfulness / no test-for-test-sake | finding #7 |
| Determinism | finding #3 |
| AC coverage AC-1..AC-15 | finding #1 |
| AC coverage AC-1..AC-15 | finding #2 |
| AC coverage AC-1..AC-15 | finding #4 |
| Edge cases | finding #8 |
| Manual-verification judgment | finding #4 |
| Suite-run record integrity | finding #9 |
| CLI contract coverage (`sync.js main()`) | finding #6 |

## Verdict

CONCERNS: 9 (3 medium, 6 low)

## Next action

`asd-tester` addresses findings #1, #2, #3 (medium) in `tests/run.js` and #5, #9 in `test-plan.md`; #6, #7, #8 are low-cost test edits in the same pass. Finding #4 needs a recorded verification item in `test-plan.md` plus confirmation that the `pr` phase bumps `.asd/release-manifest.json` `asd_version` to exactly `4.0.0` — without it the sprint's cleanup migration never executes in any consumer. No finding routes to `impl`: no code defect was found, and every `keep`-row triage held up against the diff.

## Escalations

None.
