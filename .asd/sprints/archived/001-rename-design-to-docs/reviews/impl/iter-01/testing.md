[REVIEW-impl-testing]: CONCERNS

# Review — testing

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low (all severities count)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `test-plan.md:37` (Task 9 risk row) + `test-plan.md:54` (Build line); `.asd/sync.js:1339-1342`; `tests/run.js:950-956` | Wrong check picked for the stated risk "drift between canon and generated view" (AC-5). `node .asd/sync.js --check` **cannot fail on drift**: `main()` prints `{ok: true, items: […]}` and returns `0` unconditionally (`sync.js:1341-1342`); drift only shows as a per-item `status` string a human must read. The suite's only live-repo check asserts nothing more than `parsed.ok === true` and `Array.isArray(parsed.items)` (`tests/run.js:954-955`). So the recorded evidence for AC-5 is human inspection, and the risk has no failing check anywhere. (`--check` *does* fail loud on invalid canon frontmatter — `runCheck`→`renderFullFileItem` throws uncaught — so the Task 4 row at `test-plan.md:34` is correct; this finding is only about drift statuses.) | Strengthen the existing fixture, not new infrastructure: in `tests/run.js:950`, assert every reported item `status === 'current'`, allowlisting the self-sourced `AGENTS.md` under `self_hosting: enabled`. Cheap, deterministic, uses the live-repo fixture that already exists. Record it in `test-plan.md`'s Task 9 row instead of "build gate green". |
| 2 | medium | `test-plan.md:29-39` (risk table), `test-plan.md:55` (Suite run); `sprint.md:16-17` (AC-3, AC-4); `plan.md:173` (R-1) | Only the **under-rename** direction is checked. Every recorded check (`design/` grep, `design\\` grep, `exclude)design` grep) detects a rename that was *missed*; nothing detects a rename that went *too far* — yet R-1 ("~180 of 426 raw hits are exclusions", the same-line confusion class) is the plan's top-rated content risk, and AC-3/AC-4 are pure must-NOT-change criteria with no row in the risk table and no entry in Suite run. I ran the inverse check myself (`reviews/docs`, `<sprint>/docs`, `docs-review|docs-promote|docs-system|docs-md-delta|asd-phase-docs|custom-docs-rules|docs-principles`, `DOCS.md`, `docs/iter-`, repo-wide minus `.asd/sprints/**`) → **zero hits**, so no defect shipped; the gap is that the sprint's top risk has no recorded check. | Add a risk-table row for AC-3/AC-4 (over-rename) with the inverse grep as the chosen check, and record its verbatim invocation + result in Suite run alongside the two forward greps. |
| 3 | low | `test-plan.md:29-39`; `plan.md:179` (R-7); `sprint.md:21` (AC-8) | Task 8 (`README.md` + `AGENTS.md` mirrors) has **no row at all** in the risk→check table, despite `plan.md` rating R-7 ("folder map and command table are easy to half-update") as a material risk and AC-8 being a sprint AC. An omitted row is not a `none` decision — every other change-surface group got an explicit decision + reason; this one is silent. | Add a row for the README/AGENTS mirror: risk = folder-map/command-table half-update, chosen check = static (line-for-line diff of README folder map vs final `artifact-layout.md`, per `plan.md` Task 8's last subtask), decision = `none`, reason recorded. |
| 4 | low | `test-plan.md:39` (last risk row, rejection rationale); `tests/run.js:860, 950, 1290, 1301` | The rationale for rejecting a standing content-guard fixture rests on a false premise: "`tests/run.js`'s existing fixtures … do not, and structurally cannot without new test infrastructure, assert content of the live repo tree" (and `test-plan.md:43`'s "the suite's 77 tests all cover `.asd/sync.js`/`update.js` engine behaviour"). Four existing tests already read the live repo tree — `:860` (this repo's manifest/sync-state load), `:950` (spawns `sync.js --check` on `REPO_ROOT`), `:1290`/`:1301` (walk real canon files and hash them). A repo-content grep guard would therefore be an extension of an existing pattern, not a new fixture class, and would not trip Complication Approval. The **decision itself (no guard) is still correct** on value grounds — one-time rename, low recurrence, and the guard would need an exclusion allowlist (`<sprint>/design/`, `reviews/design/`, phase names, `DESIGN.md`/`design-system*` file names) that rots faster than the risk it covers. | Restate the reason honestly: low recurrence value + exclusion-allowlist maintenance cost, not structural impossibility. Otherwise a future sprint inherits a constraint that does not exist. |
| 5 | low | `test-plan.md:14` | Change-surface inventory says `.asd/rules/*.md (9 files)`. The actual scoped rules diff is **8**: `artifact-layout.md`, `core.md`, `sprint-lifecycle.md`, `checkpoints.md`, `language-policy.md`, `design-system.md`, `review-policy.md`, `external-review.md` (`ux-principles.md`, `code-style.md`, `design-principles.md`, `providers.md`, `git-strategy.md` untouched — none contains a doc-root reference). With 8 the group counts reconcile exactly to the 49-file review scope (8+10+14+6+7+3+1); with 9 they do not. The inventory is the basis of the "no engine file was touched" argument, so its arithmetic should be right. | Correct the count to 8. |
| 6 | low | `test-plan.md:55` | Suite run records the completeness greps as prose ("`git grep -n \"design/\"` repo-wide excluding … filtered against the documented exclusion classes") with no verbatim command, no pathspec, no exit status — while `node tests/run.js`, `git diff --check` and `sync.js --check` all get exact commands. Since this grep is the sprint's *only* completeness gate (per `plan.md:172`, R-11), it is the one result a later reader most needs to reproduce, and it is the one that cannot be. | Record the two greps as literal, copy-pasteable commands including the exclusion pathspecs, plus hit count, exactly as the other three commands are recorded. |

## Coverage ledger

### File coverage (49 scoped files)

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked — lines 31/41 correctly retain `<sprint>/design/`, `reviews/design/iter-NN/`; doc-root entries now `docs/`; no test surface beyond the grep gate (findings #2, #6) |
| `.asd/rules/core.md` | checked — 2 `docs/` refs, `design-promote` phase name intact |
| `.asd/rules/sprint-lifecycle.md` | checked — 7 `docs/` refs; rows 42/49/50/51/114 correctly keep phase-scoped `<sprint>/design/`, `reviews/design/` |
| `.asd/rules/checkpoints.md` | checked — doc-root ref renamed, `design-promote` row unchanged |
| `.asd/rules/language-policy.md` | checked — zero residual `design` occurrences; `docs` present |
| `.asd/rules/design-system.md` | checked — file name preserved (AC-4), body ref renamed |
| `.asd/rules/review-policy.md` | checked — line 136 `docs/` docs; `design-review` reviewer row untouched |
| `.asd/rules/external-review.md` | checked — atomic set R-4: zero `exclude)design` hits repo-wide; lines 43/47/57/77 correctly keep phase paths |
| `.asd/templates/t_config.yaml` | checked — no test surface; covered by group grep |
| `.asd/templates/t_plan.md` | checked — `../../` prefixes preserved per G-5 |
| `.asd/templates/t_ux-spec.html` | checked — same relative-prefix rule |
| `.asd/templates/t_audit.md` | checked — migration-plan boilerplate renamed |
| `.asd/templates/t_commands.yaml` | checked — R-10 backslash aliases now `docs\\ux\\DESIGN.md` (lines 21, 23, 27, 29); `@google/design.md` package name correctly preserved |
| `.asd/templates/t_test-plan.md` | checked — frontmatter delegate path renamed |
| `.asd/templates/t_sprint.md` | checked — frontmatter delegate path renamed |
| `.asd/templates/t_design-md-delta.yaml` | checked — file name preserved (AC-4) |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked — line 14 pathspec renamed; line 15 `design/doc content` correctly left (out-of-scope "or" pair) |
| `.asd/templates/t_AGENTS.md` | checked — prose-only G-1 reword; no path occurrence |
| `.asd/agents/asd-architect.md` | checked — write-allowlist line reads `docs/architecture/…` (R-5 closed); `<sprint>/design/adr.html`, `c4-full/` correctly retained |
| `.asd/agents/asd-ux-designer.md` | checked — allowlist reads `docs/ux/DESIGN.md`, `docs/ux/design-system.html`; DESIGN.md/`design.md` package refs correctly untouched |
| `.asd/agents/asd-ba.md` | checked — allowlist renamed; `<sprint>/design/prd.html` correctly retained |
| `.asd/agents/asd-frontend-dev.md` | checked — no residual doc-root ref |
| `.asd/agents/asd-backend-dev.md` | checked — no residual doc-root ref |
| `.asd/agents/asd-test-engineer.md` | checked — no residual doc-root ref; test-authoring rules unchanged |
| `.asd/agents/asd-reviewer-ui.md` | checked — `<sprint>/design/ux-spec.html` and `designmd-lint` correctly retained |
| `.asd/agents/asd-reviewer-documentation.md` | checked — mixed in-scope/out-of-scope lines resolved correctly |
| `.asd/agents/asd-reviewer-quality.md` | checked — no residual doc-root ref |
| `.asd/agents/asd-reviewer-performance.md` | checked — no residual doc-root ref |
| `.asd/agents/asd-reviewer-testing.md` | checked — line 40 doc-root ref renamed; rubric text (incl. stub-resolution item, line 69) intact |
| `.asd/agents/asd-reviewer-implementation.md` | checked — AC-trace line renamed, `<sprint>/design/prd.html` retained |
| `.asd/agents/asd-pm.md` | checked — no residual doc-root ref |
| `.asd/agents/asd-external-review.md` | checked — line 53 pathspec is member of R-4; zero `exclude)design` hits |
| `.asd/skills/asd-init/SKILL.md` | checked — JSON frontmatter parses (proven by `sync.js --check` completing: `runCheck`→`renderFullFileItem` throws on invalid frontmatter); backslash aliases renamed and mirrored to `.claude/skills/asd-init/SKILL.md:100` |
| `.asd/skills/asd-design-system/SKILL.md` | checked — frontmatter parse proven as above |
| `.asd/skills/asd-stack/SKILL.md` | checked — frontmatter parse proven as above |
| `.asd/skills/asd-concept/SKILL.md` | checked — frontmatter parse proven as above |
| `.asd/skills/asd-update/SKILL.md` | checked — "never touched" line now `docs/**`; migration window deferred to CHANGELOG (Task 7) |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked — description only; skill/phase name preserved (AC-3) |
| `.asd/workflows/asd-phase-design-promote.md` | checked — line 45 `docs/architecture/c4/` vs `<sprint>/design/c4-full/` split correct; **no sync target**, so covered only by the grep gate (finding #6 applies most sharply here) |
| `.asd/workflows/asd-phase-design.md` | checked — all residual `design/` are `<sprint>/design/` drafts |
| `.asd/workflows/asd-phase-plan.md` | checked — no residual doc-root ref |
| `.asd/workflows/asd-phase-impl.md` | checked — no residual doc-root ref; stub-marker rules (lines 80-81) unchanged |
| `.asd/workflows/asd-phase-impl-test.md` | checked — no residual doc-root ref |
| `.asd/workflows/asd-phase-impl-review.md` | checked — no residual doc-root ref |
| `.asd/workflows/asd-phase-audit.md` | checked — line 26 correctly keeps `<sprint>/design/prd.html` |
| `README.md` | checked — no residual doc-root ref; `designmd`/`@google/design.md` occurrences are package/CLI names, correctly untouched. No risk-table row → finding #3 |
| `AGENTS.md` | checked — self-sourced under `self_hosting: enabled`; `modified-foreign` status in the Build record is expected engine behaviour (`sync.js` treats self-sourced managed blocks as check-only), so that note is accurate. No risk-table row → finding #3 |
| `CHANGELOG.md` | checked — entry at line 8 carries all four Task 7 elements (BREAKING framing, ordered `git mv design docs` → `commands.yaml` aliases → `/asd-update` → `/asd-sync`, split-brain window, "nothing errors" failure mode). `none` decision correct: no assertable runtime behaviour |
| `.asd/release-manifest.json` | checked — covered by existing `tests/run.js:1290` and `:1301`; `keep` decision is the right call, correct level, no new test needed |

### Rule coverage

| Rubric item | Status |
|---|---|
| Risk fit (cheapest reliable check per risk) | finding #1 (Task 9 row picks a check that cannot fail); otherwise pass — static checks are correctly the chosen tier for a prose/path change per `code-style.md:113` |
| Removals justified | pass — "None" is accurate: no test file appears in the 49-file scope; `tests/run.js` and all 10 files under `tests/fixtures/` are untouched; no live risk lost coverage |
| No-test decisions honest | finding #3 (Task 8 / AC-8 omitted entirely, i.e. a silent rather than stated decision); finding #4 (one stated reason is factually wrong). Remaining `none` rows verified true: the change adds no runtime behaviour, and the named existing checks really do cover their risks |
| Regression proof (fail-first for D-N) | n/a: no defects recorded in `test-plan.md` ("Defects: None found") and none found by me — no `D-N` regression test is owed |
| Coverage: every AC-N has a check | finding #2 (AC-3, AC-4 — no check for the over-rename direction), finding #3 (AC-8). Traced as covered: AC-1 (forward greps, independently re-run: zero doc-root residuals repo-wide), AC-2 (`docs/product|architecture|ux` subtrees intact, verified by grep), AC-5 (partially — see finding #1), AC-6 (`tests/run.js`), AC-7 (forward greps), AC-9 (`CHANGELOG.md:8` inspected) |
| Edge cases (empty/single/many/boundary/invalid/concurrent, where risk is real) | pass — the risk-relevant edge classes for a rename are separator variants (covered: `design\\` grep, zero hits repo-wide), same-line mixed in/out-of-scope occurrences (covered by per-file line-numbered edits), and case variants (I checked: zero `Design/` or `DESIGN/` occurrences repo-wide, so that edge is empty in fact, not just unchecked) |
| Meaningfulness (no test-for-test's-sake) | pass — zero tests added, so no implementation-restating or coverage-number test was introduced; the rejected content guard would not have been a coverage-number test either, but its rejection on value grounds is sound |
| Determinism | pass — no new tests; existing suite has no sleep-based timing and no network (`tests/run.js:961-962` simulates "upstream" as a second local temp dir), so nothing flaky was added or relied on |
| Stub-resolution verification | pass — `.asd/project/stubs.md:16` records "no open stubs"; zero `TODO(sprint-…)` markers exist in any scoped file (all repo hits are rule/agent prose *describing* the marker format), so no orphan marker and no undeleted stub |
| Manual verification necessity | n/a: no visual UI, third-party live integration, or ux-feel surface. `test-plan.md:63` correctly declines it; automation/static checks were possible for every risk, so specifying manual steps here would be wrong |
| Suite run record present + consistent | finding #6 (greps not reproducible) and finding #1 (build line over-credits `ok: true`). Otherwise consistent: I cannot execute shell commands, so I corroborated statically — `tests/run.js` contains exactly **77** top-level `test(` registrations, matching the claimed 77/77; the two cited manifest tests exist at `:1290` and `:1301`; `tests/run.js` and `.asd/sync.js` contain **zero** `design` occurrences, confirming both "no engine code touched" and "no `design` fixture exists" |
| `code-style.md` §17 compliance | pass — §17 line 117 permits skipping new tests when "the change adds no behavior or existing checks already cover the risk", provided the decision and reason are recorded in `test-plan.md`; both conditions are met. §17 line 113's risk tier (static check first) is the right tier here. §17 lines 116/126 (no trivial/coverage-number tests) not violated |
| `.asd/project/custom-coding-rules.md` | pass — the framework-specific rule "any canonical `.asd/agents|skills|hooks` edit MUST be followed by `sync.js --apply`" was honoured (generated views carry the renamed strings, e.g. `.claude/skills/asd-init/SKILL.md:100` reads `docs\\ux\\DESIGN.md`); no YAML-parser dependency and no hand-edited provider view introduced by any test change (there were none) |
| `.asd/project/custom-common-rules.md` | n/a: vocabulary/scope definitions only, no test constraints |
| Change-surface record accuracy | finding #5 |

## Verdict
CONCERNS: 6 (2 medium, 4 low)

**On the central question** — "zero tests added, zero removed" is a **defensible engineering call, not a test gap.** A pure textual rename adds no runtime behaviour, so `code-style.md` §17 line 117's skip condition is satisfied outright; a standing "no bare `design/`" fixture would need an exclusion allowlist covering `<sprint>/design/`, `reviews/design/`, three phase names and five preserved file names — maintenance that decays faster than the one-time, hand-edit-only recurrence risk it guards, and its only durable output would be a coverage-shaped signal (§17 lines 116/126). Discharging the completeness risk with a targeted grep is the correct, cheapest tier (§17 line 113). The concerns are about the *record* (findings #2-#6) and one *check selection* that cannot fail (#1) — not about the decision to add no tests.

## Next action
impl-review routes back to `impl` (review-fix mode): the responsible dev applies #1 (one added assertion inside the existing `tests/run.js:950` fixture — an extension of an existing test, so no Complication Approval needed) and the Test Engineer amends `test-plan.md` for #2-#6 (add the over-rename row + inverse-grep result, add the README/AGENTS row, restate the guard-rejection reason, fix the rules file count, record verbatim grep commands). Sprint re-enters impl-review via `impl-test`. Iteration 2 floor rises to `medium`, so findings #3-#6 will drop out of scope then — fix them now or accept them as recorded.

## Escalations
None — no finding requires user approval (no concept change, no new abstraction, no scope expansion, no contract change).

## Manual verification
Not applicable — no requirement in this sprint resists automation.
</content>
