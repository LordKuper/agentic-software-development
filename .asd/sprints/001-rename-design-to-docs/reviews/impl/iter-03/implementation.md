[REVIEW-impl-implementation]: APPROVE

# Review — implementation

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high (low/medium dropped from verdict computation)
- **AC source**: `.asd/sprints/001-rename-design-to-docs/sprint.md` AC-1..AC-9 (`documents.prd` disabled)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above floor | — |

## Coverage ledger

### File coverage

| File | Status |
|---|---|
| `.asd/release-manifest.json` | checked — AC-5. `upstream_hashes` carries entries for both canonical files edited this iteration (`.asd/templates/t_test-plan.md:144`, `.asd/workflows/asd-phase-impl.md:152`); ledger is tool-recomputed (bare `--apply`, commit `191ad36`), never hand-edited (plan Task 10 / audit G-2), and its correctness is machine-asserted by `tests/run.js:1318` (`canon_hashes`) and `tests/run.js:1329` (`upstream_hashes`), both green in the 77/77 run against this HEAD. Recompute ordering is correct (ledger commit lands after the two canon edits). `CHANGELOG.md` and `tests/run.js` are outside `managed_paths`, so their absence from the ledger is correct, not a gap. Only `design`-bearing strings left in the file are `skills/asd-phase-design/SKILL.md` (lines 54, 99) — AC-3/AC-4 preserved names, not paths |
| `.asd/templates/t_test-plan.md` | checked — AC-1, AC-3. Line 5 reads `delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)`. Re-confirmed the classification independently: the template is authored at `impl-test` (file header line 10, "Written in impl-test"), i.e. after design-promote, and the workflow that writes it names the persistent root at that moment — `.asd/workflows/asd-phase-impl-test.md:11` reads "persistent docs (PRD ACs, api, ux-spec)". Corroboration test in AC-1 therefore resolves to the persistent root, and the wording form (not `docs/ docs`) is the correct final state; AC-1's explicit "`t_test-plan.md` is *not* an exception" clause is satisfied. No regression — no `design/`-as-root occurrence remains in the file; nothing sprint-local or phase-named was over-renamed (AC-3 intact) |
| `.asd/workflows/asd-phase-impl.md` | checked — AC-1, AC-3. Vocabulary unified to "persistent docs" at lines 12, 35, 41, 69; the renamed root path at line 68 reads `docs/architecture/tech-reference/<tech>-<version>.md` (AC-1/AC-2 subtree preserved). Line 43 ("unbounded by design") correctly keeps its prose meaning — not a root reference. Self-hosting write-scope list (line 47) is consistent with its SSoT `sprint-lifecycle.md:63`, including `tests/**`, so the `tests/run.js` edit made this iteration falls inside the declared dev write scope. No `design/`-as-root occurrence remains |
| `CHANGELOG.md` | checked — AC-9. Entry sits under `## Unreleased` → `### Changed`, framed `**BREAKING:**`, and states all four migration steps AC-9 requires, in the required order: (1) move the old root, (2) fix the `designmd-lint`/`designmd-export` aliases in the consumer-owned `.asd/project/commands.yaml`, (3) `/asd-update`, (4) `/asd-sync` immediately after. Restructuring into a numbered list preserved both starting-state branches verbatim: no existing `docs/` → `git mv design docs`; existing `docs/` → explicit do-NOT-run warning with the `docs/design/...` nesting failure mode named, the three-subtree alternative, and the collision caveat. The split-brain warning between steps 3 and 4 survived the restructure intact, including the "nothing auto-migrates and nothing errors" framing. The claim that `commands.yaml` is never touched by `/asd-update` checks out against `release-manifest.json` `managed_paths` (`.asd/project/**` is not listed). Complete and unambiguous for a consumer in either starting state |
| `tests/run.js` | checked — AC-5, AC-6. The iter-02 coverage guard (lines 956-974) is real and executes inside the registered `sync.js --check` test, before the drift filter. It builds `targets` from `parsed.items.map(item => item.target)`, then walks `.asd/agents/*.md` and `.asd/skills/*/SKILL.md` **off disk**, asserting each of `.claude/agents/<n>.md`, `.codex/agents/<n>.toml`, `.claude/skills/<n>/SKILL.md`, `.agents/skills/<n>/SKILL.md` is present. Enumeration is independent of `buildSyncPlan()` (`.asd/sync.js:1090-1119`), which is exactly what closes the vacuous-pass gap: dropping a canon dir from `buildSyncPlan` now fails loud instead of shrinking `parsed.items` to a trivially all-`current` set. Constructed target strings match sync's own `target` field (repo-relative, forward-slashed), corroborated by the sibling tests that compare against `.claude/agents/demo-agent.md` / `.claude/settings.json`. Not cosmetic. AC-6 satisfied: suite green 77/77 against this HEAD (gate re-verified independently at impl-test re-entry). No `design`-bearing string in the file, so AC-7 unaffected |

### Rule coverage

| Rubric item | Status |
|---|---|
| Every AC-N has a corresponding code path | pass — AC-1 → `t_test-plan.md:5`, `asd-phase-impl.md:12,35,41,68,69` (this iteration's slice; full-sprint coverage carried by earlier commits); AC-2 → `docs/architecture/tech-reference/…` subtree preserved verbatim in `asd-phase-impl.md:68`; AC-3 → nothing sprint-local/phase-named altered in any of the 5 files, `asd-phase-design*` keys untouched in `release-manifest.json`; AC-4 → preserved file names untouched; AC-5 → `release-manifest.json` ledger + `tests/run.js` drift/coverage assertions; AC-6 → `tests/run.js`; AC-7 → no in-scope `design/` or `design\` occurrence reintroduced by any of the 5 files (`CHANGELOG.md` is an explicit AC-7 exclusion and its `design`-bearing text is intentional migration prose); AC-8 → `README.md` not touched this iteration and unaffected by the prose-vocabulary change; AC-9 → `CHANGELOG.md:8-16` |
| Every AC-N has at least one test/check asserting it | pass — AC-5: `tests/run.js:950` (drift + new coverage guard), `:1318`/`:1329` (hash-ledger integrity); AC-6: the suite itself; AC-1/2/3/4/7/8: the documented, reproducible static checks in `test-plan.md` "Suite run" (under-rename grep, separator-blind `design\` grep, inverse over-rename grep, README/AGENTS mirror diff), all re-run against this tree; AC-9: recorded as manual-read verification with no runtime behaviour to assert. Check *quality* deferred to asd-reviewer-testing |
| No AC implemented partially without explicit follow-up | pass — no AC left partial. The one deliberate non-implementation (a standing "no bare `design/`" content guard) is an explicit recorded no-test decision in `test-plan.md` "Risk → check decisions", not a silent gap; the AC-1 `t_sprint.md:5` exception and its AC-7 exclusion-set entry are both recorded in `sprint.md` and `decisions-log.md` (2026-09-01) |
| No code change without traceable AC or plan Task | pass — all 5 files trace: `t_test-plan.md` + `asd-phase-impl.md` → AC-1 (plan Tasks 2, 5) plus the iter-02 fix set; `tests/run.js` → AC-6/AC-5 hardening from the iter-02 fix set (dev write scope for `tests/**` declared in `sprint-lifecycle.md:63` and mirrored in `asd-phase-impl.md:47`); `CHANGELOG.md` → AC-9 (plan Task 7); `release-manifest.json` → AC-5 (plan Task 10, tool-recomputed). Fix set is recorded in `.asd/project/decisions-log.md` with per-finding commit attribution (`5f39c1a`, `0e6cd2e`, `0781e9b`, `191ad36`). No unexplained change in scope |

## Verdict

APPROVE

## Next action

Reviewer done. No implementation-side rework required; PM aggregates this verdict with the other iteration-3 reviewers for the impl-review DoD gate.

## Escalations

None.
</content>
