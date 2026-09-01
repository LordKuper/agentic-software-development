[REVIEW-impl-implementation]: APPROVE

# Review — implementation

- **Phase**: impl-review
- **Iteration**: 2
- **AC source**: `.asd/sprints/001-rename-design-to-docs/sprint.md` AC-1..AC-9 (`documents.prd: disabled`)
- **Severity floor**: medium (low findings dropped from verdict computation)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above floor | — |

### Below-floor observations (not counted toward verdict)

| # | Severity | Location (AC) | Description |
|---|---|---|---|
| o1 | low | AC-2 — `.asd/templates/t_plan.md:23-25` vs `plan.md` Task 2 | The link-depth fix (`../../` → `../../../`) is functionally correct, but plan Task 2's subtask "preserve the `../../` prefix on lines 23–25 exactly" is still checked `[x]` while the code now does the opposite. Plan record and code disagree; no follow-up note recorded. |
| o2 | low | AC-2 — `.asd/templates/t_ux-spec.html:49` (out of iteration diff) | Same class of link (`../../docs/ux/DESIGN.md`) was left at the old depth, so the repo now carries two contradictory conventions for the same repo-root `docs/` reference. Pre-existing defect (the predecessor `../../design/ux/DESIGN.md` was equally wrong) and AC-2 literally required preserving it — not caused by this iteration. |
| o3 | low | AC-3 — `.asd/sprints/001-rename-design-to-docs/sprint.md:5` (excluded from diff pathspec) | The sprint instance's frontmatter reads `docs/ docs (decisions)` while its template `t_sprint.md:5` was correctly reverted to `design/ docs`. Same over-rename class as the three fixed this iteration, leaked into a sprint-local artifact. Out of review scope (`.asd/sprints/**` excluded by the diff pathspec and by AC-7). |

## Coverage ledger

### File coverage (16 scoped files)

| File | Status |
|---|---|
| `.asd/agents/asd-reviewer-simplification.md` | checked — L98 "Never modify code or persistent docs" matches the G-1 wording of all 7 sibling reviewers; L20/28/30/35/40/41/46/50/114/118 keep phase-scoped `design`/`<sprint>/design/` untouched (AC-1, AC-3) |
| `.asd/release-manifest.json` | checked — entries exist for all 12 canonical in-diff files; `canon_hashes` and `upstream_hashes` agree for the two dual-listed files (AC-5) |
| `.asd/rules/language-policy.md` | checked — L8 "persistent docs"; L12 `DESIGN.md` name preserved (AC-1, AC-4) |
| `.asd/rules/review-policy.md` | checked — L136 "independent of persistent docs"; `design-review` phase rows/`reviews/design/` untouched (AC-1, AC-3) |
| `.asd/skills/asd-init/SKILL.md` | checked — L58-60 `docs/product|architecture|ux`, L101/103 backslash `docs\ux\DESIGN.md`, L107/109 POSIX form; `designmd-*` / `design.md` / `design-system` names preserved; JSON frontmatter intact (AC-1, AC-4) |
| `.asd/templates/t_config.yaml` | checked — L13 correctly restored to `design/prd.html` (sprint draft); L54-55 remain `docs/architecture/c4/…`; L8/48 prose "persistent docs" (AC-3, AC-1) |
| `.asd/templates/t_plan.md` | checked — L5 "persistent docs"; L23-25 subtree byte-identical to predecessors, only prefix depth changed (AC-1, AC-2) |
| `.asd/templates/t_sprint.md` | checked — L5 correctly restored to `design/ docs (decisions)`, sibling of `<sprint>/sprint.md` (AC-3) |
| `.asd/templates/t_test-plan.md` | checked — L5 correctly restored to `design/ docs (requirements)` (AC-3) |
| `.asd/workflows/asd-phase-impl-review.md` | checked — L12/32 "persistent docs"; L31/94 `design-principles` and `reviews/<phase>` untouched (AC-1, AC-3) |
| `.asd/workflows/asd-phase-impl-test.md` | checked — L11 "persistent docs" (AC-1) |
| `.asd/workflows/asd-phase-impl.md` | checked — L12/35 "persistent docs", L68 `docs/architecture/tech-reference/…` (AC-1) |
| `.asd/workflows/asd-phase-plan.md` | checked — L7/11/19/21 "persistent docs"; `design-promote` phase name kept (AC-1, AC-3) |
| `CHANGELOG.md` | checked — `## Unreleased` / `### Changed` BREAKING entry, both consumer starting states, alias fix, `/asd-update` → `/asd-sync` order, split-brain window, no-crash failure mode (AC-9) |
| `README.md` | checked — L83/154/172-174/306-320 use `docs/`; L227 config excerpt correctly restored to `design/prd.html`; folder map matches `artifact-layout.md:45-61` line for line (AC-8, AC-2, AC-3) |
| `tests/run.js` | checked — new §6b (L1291-1320) two ledger-integrity tests (AC-5, AC-6) |

### AC coverage (trace)

| AC | Status | Evidence |
|---|---|---|
| AC-1 | pass | Persistent root reads `docs/` in every in-diff canonical source; prose reworded to "persistent docs" consistently across all 7 reviewer agents (`Never modify` grep), 4 workflows, `language-policy.md:8`, `review-policy.md:136`, `t_config.yaml:8,48`, `t_plan.md:5` |
| AC-2 | pass (see o1/o2) | `t_plan.md:23-25` keeps `product/requirements/{{subsystem}}.html`, `architecture/adr/{{subsystem}}/adr-…`, `ux/{{subsystem}}.html` unchanged under the new root. `../../../` verified correct: `plan.md` resolves at `.asd/sprints/<NNN-slug>/plan.md`, i.e. 3 levels below the repo root where `docs/` lives (`artifact-layout.md:14,45`). Subtree in `README.md:306-320` = `artifact-layout.md:45-61` |
| AC-3 | pass | All four iter-1 over-renames genuinely reverted, not superficially patched: `t_config.yaml:13`, `t_sprint.md:5`, `t_test-plan.md:5`, `.asd/project/config.yaml:15` (out-of-diff, verified directly), plus the mirror at `README.md:227`. Each reverted reference is semantically a `<sprint>/`-sibling draft path, so `design/` is the correct reading. `design`/`design-review`/`design-promote` phase names, `asd-phase-design*` files and their dispatch untouched (`asd-phase-impl-review.md:31`, `asd-phase-plan.md:7-8,18`) |
| AC-4 | pass | `DESIGN.md`, `design-system.html`, `design-principles.md`, `design-system.md`, `custom-design-rules.md` names intact (`README.md:288,317-318`, `asd-init/SKILL.md:50,60,101-109`, `language-policy.md:12`) |
| AC-5 | pass | `upstream_hashes` carries an entry for each of the 12 canonical in-diff files (manifest L74,88,90,95,125,134,138,144,150-153); `canon_hashes["agents/asd-reviewer-simplification.md"]` == `upstream_hashes[".asd/agents/…"]` == `5db7d136…`, so both ledgers were recomputed in the same run; `.claude/agents/asd-reviewer-simplification.md:2` marker `source_digest=sha256:5db7d136…` equals that value → the provider view was regenerated *from the current canon*, not left stale. `.claude/` + `.codex/` + `.agents/skills/` all carry the reworded/renamed text. No unrelated churn found: `CHANGELOG.md`, `README.md`, `tests/run.js`, `release-manifest.json` are outside `managed_paths`, so correctly have no ledger entry |
| AC-6 | pass (execution deferred) | New §6b assertions are real, executing Node and **not** always-true: both loops iterate a non-empty map (33 `canon_hashes`, 100+ `upstream_hashes` entries), recompute from actual file bytes with the *same* primitives the engine uses (`digestTag(readNormalized)` vs `computeCanonHashes` L889-907; bare `sha256Hex(readNormalized)` vs `computeUpstreamHashes` L913-925), collect mismatches into `stale`, and `assert.deepStrictEqual(stale, [])`. Key/prefix conventions match the manifest exactly (`sha256:`-tagged relative-to-`.asd/` vs bare-hex relative-to-repo-root); a missing file is pushed to `stale` rather than skipped. Any stale ledger entry for the files edited this iteration fails the suite. Actual suite execution not independently runnable (reviewer is read-only, no shell) — relies on the impl-test run |
| AC-7 | pass | No residual root-denoting `design/` or `design\` in any scoped file; remaining `design` tokens in scope are phase names, rule/file names (`design-principles.md`, `design-system.html`), `designmd-*`/`@google/design.md` package names, or `<sprint>/design/` drafts |
| AC-8 | pass | `README.md` folder map, phase table (L154), command table (L172-174), never-touched table (L83) and config-schema excerpt (L227) all mirror the final canon state |
| AC-9 | pass | Entry is correct and unambiguous in both starting states: no `docs/` → `git mv design docs`; existing `docs/` → explicitly forbids that command (names the `docs/design/...` nesting failure) and gives `git mv design/product design/architecture design/ux docs/` with the collision precondition. The three enumerated subtrees are exactly the documentation root's contents per `artifact-layout.md:45-61`. Alias list verified accurate: only `designmd-lint` and `designmd-export` embed a `DESIGN.md` path (`t_commands.yaml:21,23,27,29`); `-install`/`-diff` do not. "Never touched by `/asd-update`" verified against `asd-update/SKILL.md:20` (`.asd/project/**`). Split-brain window and non-crashing failure mode both stated |

### Rule coverage (agent rubric)

| Rubric item | Status |
|---|---|
| Every AC-N has a corresponding code path | pass — AC-1..AC-9 all traced above |
| Every AC-N has at least one test asserting it (presence only) | pass for AC-5/AC-6 (`tests/run.js` §6b + §9 `--check` all-current assertion). AC-1/2/3/4/7/8/9 are prose/reference ACs with no automated fixture; per `plan.md` Task 11 their gate is the manual grep set, which `test-plan.md` records — test *adequacy* deferred to asd-reviewer-testing |
| No AC implemented partially without explicit follow-up | pass at floor — only partial item is the link-depth class (o1/o2), both below floor |
| No code change without traceable AC or plan Task | pass at floor — every in-diff change maps to AC-1/2/3/5/6/8/9 or a plan Task; `asd-reviewer-simplification.md:98` deviates from plan Task 3's "do NOT edit" but is a correct AC-1/G-1 reword making it consistent with all 7 sibling reviewers; `t_plan.md:23-25` deviates from plan Task 2's preserve-prefix subtask (recorded as o1) |
| Iteration severity floor applied | pass — 3 low findings identified and excluded from verdict |
| Cite AC-N + file:line for every finding | pass |
| Bugs / security / test quality / UI / perf | n/a: other reviewers |
| Nitpick drop list | pass — CHANGELOG entry's run-on sentence structure and the `impl.md:41,69` "design-doc scope" phrasing were both judged pure wording polish and not raised |
| `.asd/project/custom-common-rules.md` / `custom-coding-rules.md` | n/a: both are template stubs in this repo, no project-specific rules to apply |

## Verdict
APPROVE

## Next action
Reviewer done. Iter-1's implementation findings are genuinely resolved, not superficially patched: the four AC-3 over-renames are semantically correct reverts, the AC-2 link-depth fix resolves to the right target, the AC-9 entry is correct for both consumer starting states, and the AC-6 ledger tests are non-vacuous and fail on real drift. The three low observations (o1-o3) are below this iteration's floor — record o1/o2 in `stubs.md` or fold into a later sprint if the team wants the `t_ux-spec.html:49` depth aligned; no impl round is required for them.

## Escalations
None.
</content>
