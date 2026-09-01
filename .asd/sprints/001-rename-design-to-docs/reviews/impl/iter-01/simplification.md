[REVIEW-impl-simplification]: CONCERNS

# Review — Simplification

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | low | `.asd/templates/t_config.yaml:13`, `README.md:227` | Over-rename creating a path that exists in no layout. The `documents:` comment column is a `<sprint draft> + persistent <counterpart>` pair (see `t_config.yaml:8` "Optional sprint documents and their persistent docs counterpart", and the sibling rows `audit → <sprint>/audit.md`, `adr → adr.html + persistent ADR`, `c4 → c4-full + persistent C4`). The first term of the `prd` row was therefore the *sprint draft* `design/prd.html` (i.e. `<sprint>/design/prd.html`), which sprint.md AC-3 / "Out of scope" explicitly freezes. It was renamed to `docs/prd.html`. No `docs/prd.html` exists anywhere: `artifact-layout.md:45-63` — the authoritative path map that `README.md:331` defers to — puts the persistent PRD at `docs/product/requirements/<subsystem>.html`. The comment now asserts a path that is neither the draft nor the persistent doc, so a config-schema mirror contradicts its SSoT (design-principles #5). Category: **simplify** (revert one segment; no abstraction involved). Note: the same edit is mirrored at `.asd/project/config.yaml:15`, outside this diff's pathspec but part of the same fix. | Restore the draft path in all three: `prd: <enabled\|disabled>   # design/prd.html + persistent requirements` (matching the bare-draft style of the `adr.html` / `c4-full` rows). Root cause is upstream in `audit.md:38` / `audit.md:73`, which classified the line as in-scope; the classification, not the implementer's execution, is what was wrong. |

No over-engineering-checklist or structure/cohesion-checklist hit. Positive notes on simplicity, recorded so a later iteration does not "improve" them:

- The rejected consumer-migration options (b) one-shot rename inside `asd-update` and (c) a dual-root config key stayed rejected. Verified by search: no `docs_root` / `design_root` / `legacy_root` / dual-root key, no resolver, and no new `{{...}}` template variable anywhere in `.asd/`. The rename is a literal edit everywhere. This is the correct call under Simplicity Default and design-principles #2.
- `asd-update/SKILL.md:20` lists only `docs/**` in "Never touched", not both roots (G-13). Listing both would have been a permanent back-compat branch carrying a one-release migration window — correctly avoided; the window is documented in `CHANGELOG.md` instead. Not dead code left "in case we need it".
- `backward_compat: migration` is satisfied by documentation alone (one CHANGELOG bullet), with no migration script, no version-detection code, no shim. Minimum ceremony that meets design-principles #8.
- `.asd/release-manifest.json` changed only in its hash ledgers; `managed_paths` gained no `docs/` entry and no new key. No structural complication.

## Coverage ledger

Scope = the 49 files under the dispatch pathspec, reconstructed from `plan.md` Tasks 1-10 (rules 8 + templates 10 + agents 14 + skills 6 + workflows 7 + manifest + CHANGELOG + README + AGENTS = 49; `.asd/project/config.yaml` from Task 6 is excluded by `':(exclude).asd/project/**'`). No Bash tool is available to a read-only reviewer, so each file was verified by direct read/grep of its renamed lines rather than by running the diff command.

### File coverage

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked — full tree read; `docs/` root at 45/67/70/84/141, subtree identical (AC-2); `<sprint>/design/` (31) and `reviews/design/` (41) untouched |
| `.asd/rules/core.md` | checked — 20, 22 renamed; `design-promote` phase name intact |
| `.asd/rules/sprint-lifecycle.md` | checked — 49, 52, 105, 122, 135-137 renamed; 42/50/51/114 draft+review paths and all phase-name cells intact |
| `.asd/rules/checkpoints.md` | checked — 15 renamed, phase name intact |
| `.asd/rules/language-policy.md` | checked — 8 renamed |
| `.asd/rules/design-system.md` | checked — 7 → `docs/ux/DESIGN.md`; file name preserved (AC-4) |
| `.asd/rules/review-policy.md` | checked — 136 renamed; `design-review` DoD row intact |
| `.asd/rules/external-review.md` | checked — 44, 47, 51 renamed incl. the `':(exclude)docs/**'` pathspec (R-4); 43, 57, 77 draft/review paths intact |
| `.asd/templates/t_config.yaml` | checked — **finding #1** (line 13); 54, 55 and prose 8, 48 correct |
| `.asd/templates/t_plan.md` | checked — 5, 23-25; `../../` prefixes preserved (G-5) |
| `.asd/templates/t_ux-spec.html` | checked — 49, `../../docs/ux/DESIGN.md`, relative prefix preserved |
| `.asd/templates/t_audit.md` | checked — 50, 54, 56 |
| `.asd/templates/t_commands.yaml` | checked — POSIX 27, 29 and backslash 21, 23 (`docs\\ux\\DESIGN.md`, R-10); `@google/design.md` package name untouched |
| `.asd/templates/t_test-plan.md` | checked — 5 |
| `.asd/templates/t_sprint.md` | checked — 5 |
| `.asd/templates/t_design-md-delta.yaml` | checked — 1; file name preserved (AC-4) |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked — 14 pathspec (R-4 member, consistent with the other two); 15 `design/doc content` untouched |
| `.asd/templates/t_AGENTS.md` | checked — 34 prose reworded to "persistent docs"; no path occurrence, none invented |
| `.asd/agents/asd-architect.md` | checked — 40, 49, 50, 106, 107, 115 and allowlist 65 all renamed; `<sprint>/design/` entries preserved |
| `.asd/agents/asd-ux-designer.md` | checked — 41-44, 52, 53 and allowlist 70; `design.md` upstream URL (68) untouched |
| `.asd/agents/asd-ba.md` | checked — 39, 76 incl. allowlist |
| `.asd/agents/asd-frontend-dev.md` | checked — 40-45, 106 |
| `.asd/agents/asd-backend-dev.md` | checked — 40-42, 102 |
| `.asd/agents/asd-test-engineer.md` | checked — 41-43, 126 |
| `.asd/agents/asd-reviewer-ui.md` | checked — 43-45, 49-51 |
| `.asd/agents/asd-reviewer-documentation.md` | checked — 4, 16, 44, 48, 74, 86, 87; mixed-scope lines 44/48 split correctly |
| `.asd/agents/asd-reviewer-quality.md` | checked — 40, 41, 81 |
| `.asd/agents/asd-reviewer-performance.md` | checked — 39, 40 |
| `.asd/agents/asd-reviewer-testing.md` | checked — 40 |
| `.asd/agents/asd-reviewer-implementation.md` | checked — 37, 76; `<sprint>/design/prd.html` on 37 correctly preserved alongside the renamed `docs/` path |
| `.asd/agents/asd-pm.md` | checked — 93, 108 |
| `.asd/agents/asd-external-review.md` | checked — 53 pathspec (R-4 member), 113 prose |
| `.asd/skills/asd-init/SKILL.md` | checked — description 4, 58-60, 107, 109, 117 and backslash 101, 103 |
| `.asd/skills/asd-design-system/SKILL.md` | checked — 4, 15, 16, 28, 94, 101, 110, 142-144; JSON frontmatter intact |
| `.asd/skills/asd-stack/SKILL.md` | checked — 4, 15, 27, 96, 104, 134, 135; JSON frontmatter intact |
| `.asd/skills/asd-concept/SKILL.md` | checked — 26, 27, 82, 89, 107 |
| `.asd/skills/asd-update/SKILL.md` | checked — 4, 20; single-root "Never touched" list, no dual-root back-compat |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked — description only; skill and phase names unchanged (AC-3) |
| `.asd/workflows/asd-phase-design-promote.md` | checked — 11, 37, 42-45, 50-52, 67-71; `<sprint>/design/c4-full/` on 45 preserved |
| `.asd/workflows/asd-phase-design.md` | checked — 12, 28, 32, 36, 40, 57, 59; phase name unchanged |
| `.asd/workflows/asd-phase-plan.md` | checked — 7, 11, 19 |
| `.asd/workflows/asd-phase-impl.md` | checked — 12, 68 |
| `.asd/workflows/asd-phase-impl-test.md` | checked — 11, 28 |
| `.asd/workflows/asd-phase-impl-review.md` | checked — 12, 32 |
| `.asd/workflows/asd-phase-audit.md` | checked — 24, 34, 50 |
| `.asd/release-manifest.json` | checked — hash-ledger values only; `managed_paths` unchanged and `.asd/`-only; all residual `design` strings are AC-3/AC-4 file names; no new key, no dual-root entry |
| `CHANGELOG.md` | checked — one `## Unreleased` bullet; see finding-free assessment below |
| `README.md` | checked — **finding #1** (line 227); 83, 154, 172-174, 306-320 folder map verified line-for-line against `artifact-layout.md:45-63`, 329, 18, 176 prose |
| `AGENTS.md` | checked — 32 renamed; no other in-scope occurrence |

Out-of-scope confirmation requested in dispatch, verified independently rather than assumed: `.asd/agents/asd-reviewer-simplification.md` has exactly two `design` occurrences — line 41 `<sprint>/design/prd.html` (sprint draft folder, frozen by AC-3) and line 98 "Never modify code or design docs" (phase-scoped: this reviewer's design-review input is the draft set, and it never writes persistent `docs/` regardless). Both correctly out of scope, so the file's absence from the diff is right. Its two generated mirrors (`.claude/agents/asd-reviewer-simplification.md`, `.codex/agents/asd-reviewer-simplification.toml`) still carry the identical unchanged wording, confirming no rogue hand-edit under a generated tree.

### Rule coverage

| Rubric item | Status |
|---|---|
| Interface with exactly one implementer | n/a: no code changed; diff is prose/config text only |
| Generic with exactly one concrete type parameter | n/a: no code changed |
| Factory for fewer than three classes | n/a: no code changed |
| Plugin system with no plugin | n/a: no code changed |
| Abstraction with no second use case | pass — searched for a rename indirection (`docs_root`/`design_root`/`legacy_root`/`doc_root`, resolver helper, new `{{VAR}}`); none exists. Every one of the 49 files carries the literal `docs/`. The "dual-root config key" option stayed rejected as planned |
| Premature config flag (no caller chooses non-default) | pass — no new config key in `t_config.yaml`, `.asd/project/config.yaml`, or `release-manifest.json`; no compatibility/migration switch introduced |
| Defensive code for impossible-by-contract case | pass — no fallback-to-old-root branch anywhere; `asd-update/SKILL.md:20` names `docs/**` only, so nothing guards against a state the CHANGELOG already handles |
| Helper that wraps one stdlib call without added value | n/a: no code changed; `.asd/sync.js` untouched (zero-dependency custom-coding rule also unaffected) |
| Inheritance depth ≥ 3 without polymorphic dispatch | n/a: no types, no code |
| Framework wrapping a framework | n/a: no dependency added; `package.json` still absent |
| Mock of a mock in tests | n/a: no test authored this sprint (`plan.md` "Out of scope"; `tests/run.js` untouched and not in the 49-file scope) |
| Comment that restates code | pass — the `CHANGELOG.md` bullet and the `t_config.yaml` comment column carry migration/mapping information not derivable from the surrounding text; nothing restates an adjacent line. (The `t_config.yaml:13` comment is *wrong*, per finding #1, but not redundant) |
| Dead code left "in case we need it" | pass — no old-root reference retained as a commented-out or parallel entry; residual `design/` occurrences are all live out-of-scope semantics (sprint draft folder, `reviews/design/`, phase names, `DESIGN.md` / `design-system.html` / `design-principles.md` / `t_design-md-delta.yaml` file names) |
| God / sprawling type (structure/cohesion) | n/a: no type, class, or module added or restructured; the documentation subtree keeps its existing responsibility split (`product/` / `architecture/` / `ux/`), and sprint.md forbids restructuring inside it |
| Generic complexity-vs-value (does the complication earn its weight?) | pass — the change removes a naming ambiguity at zero structural cost. Consumer migration is documented, not automated (option a over b/c): the alternative would have added a one-shot migration path to `update.js` for a single release, which would not earn its weight |
| design-principles #2 KISS / Simplicity Default | pass — direct textual rename throughout, no mechanism introduced |
| design-principles #5 Single Source of Truth | finding #1 — `t_config.yaml:13` and its `README.md:227` mirror now contradict `artifact-layout.md`, the authoritative path map. Elsewhere the SSoT holds: the README folder map matches `artifact-layout.md` line for line |
| design-principles #8 Backward Compatibility (`backward_compat: migration`) | pass — breaking change carries a documented migration path with ordered steps and a named failure mode; no code shim, which is the minimum that satisfies the policy |
| `.asd/project/custom-common-rules.md` | pass — framework-repo vocabulary (canonical source / provider view / consumer) used consistently in the CHANGELOG migration text |
| `.asd/project/custom-coding-rules.md` | pass — no dependency added to `.asd/sync.js`; canon edits followed by sync (generated mirrors match canon, incl. the deliberately unchanged simplification agent); no hand-edit under `.claude/`, `.codex/`, `.agents/skills/` |

## Verdict

CONCERNS: 1

Not raised, deliberately, per the `review-policy.md` nitpick drop list ("pure wording polish", "alternative naming with no concrete bug"): the rename produced a "docs/ docs" stutter in several delegation lines and workflow read-lists (`t_plan.md:5`, `t_sprint.md:5`, `t_test-plan.md:5`, `asd-phase-plan.md:7,11,19`, `asd-phase-impl.md:12`, `asd-phase-impl-test.md:11`, `asd-phase-impl-review.md:12,32`, `asd-init/SKILL.md:4`), which read less cleanly than the former "design/ docs". No defect, no ambiguity, no rubric hit — recorded here only so a future iteration does not treat it as newly discovered.

## Next action

Route to `impl` in review-fix mode. `backend-dev` reverts the `prd` row's first term to the sprint-draft path in `.asd/templates/t_config.yaml:13`, `README.md:227`, and (same edit, outside this diff's pathspec) `.asd/project/config.yaml:15`; then re-run Task 9/10 sync + ledger and the Task 11 AC-7 greps, since restoring a `design/` token requires the AC-7 exclusion set to account for it. Sprint re-enters impl-review via `impl-test`.

## Escalations

None. Finding #1 is `simplify` — a one-segment revert adding no abstraction, layer, or dependency, and it restores rather than changes an ADR/AC-declared boundary, so no Complication Approval is required.
</content>
