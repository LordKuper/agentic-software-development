[REVIEW-impl-implementation]: CONCERNS

## Findings

| # | Severity | AC / Location | Description | Fix |
|---|---|---|---|---|
| 1 | high | AC-3 — `.asd/templates/t_config.yaml:13`, `README.md:227` (also `.asd/project/config.yaml:15`, outside the diff pathspec) | Over-rename of a sprint-local draft reference. The `documents.prd` comment now reads `# docs/prd.html + persistent requirements`; before the sprint it read `# design/prd.html + persistent requirements`, where `design/prd.html` denoted the **sprint-local draft** `<sprint>/design/prd.html`, not the persistent root. Proof from the sibling lines in the same block, whose header is "Optional sprint documents and their persistent docs counterpart": `audit: … # <sprint>/audit.md`, `adr: … # adr.html + persistent ADR`, `c4: … # c4-full + persistent C4` — first item = sprint draft, second = persistent counterpart. The persistent PRD counterpart is `docs/product/requirements/<subsystem>.html` (`artifact-layout.md:48`), and `docs/prd.html` exists nowhere in the layout. So AC-3's "the sprint-local draft folder `<sprint>/design/` … remain[s] literally unchanged" is breached, and the result went from elided-but-correct to actively wrong. Root cause is upstream: `audit.md:38` classified `t_config.yaml:13` as in-scope, `plan.md` Tasks 2/6/8 executed that classification faithfully at all three sites. `t_config.yaml` is the template `/asd-init` writes, so every future consumer inherits the wrong comment. | Restore the sprint-draft sense at all three sites, e.g. `prd: <enabled\|disabled>   # <sprint>/design/prd.html + persistent requirements`. Keep column alignment. No escalation needed — reverting an out-of-scope rename, no scope change, no new abstraction. |

No other over-renames found: `docs/(prd|adr|ux-spec|c4-full|design-md-delta|audit)` returns only this one class, and `docs-review|docs-promote|asd-phase-docs|reviews/docs|<sprint>/docs` returns zero.

## Coverage ledger

### File coverage (49 scoped files)

`.asd/rules/` (8)

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked — line 45 `docs/`, subtree 46-61 intact, lines 31/41 `<sprint>/design/`+`reviews/design/` preserved, 58/59/105/109 `DESIGN.md`/`design-system.html` preserved |
| `.asd/rules/core.md` | checked — glossary l.20 `docs/`, l.22 `docs/architecture/c4/`, `design-promote` phase name intact l.15/22 |
| `.asd/rules/sprint-lifecycle.md` | checked — l.49/105/122/135-137 renamed; l.42/50/51/107/114 `<sprint>/design/`+`reviews/design/` preserved; phase-name column values intact |
| `.asd/rules/checkpoints.md` | checked — `docs/ux/DESIGN.md` gate, `design-promote` row name intact |
| `.asd/rules/language-policy.md` | checked — artifact list renamed; `DESIGN.md` row l.12 intact |
| `.asd/rules/design-system.md` | checked — l.7 `docs/ux/DESIGN.md` SSoT; file name unchanged |
| `.asd/rules/review-policy.md` | checked — l.136 "persistent `docs/` docs"; `design-review` reviewer-table row intact |
| `.asd/rules/external-review.md` | checked — l.44/47/51 renamed incl. R-4 pathspec `':(exclude)docs/**'`; l.43/47/57/77 `<sprint>/design/**`, `reviews/design/` preserved |

`.asd/templates/` (10)

| File | Status |
|---|---|
| `.asd/templates/t_config.yaml` | checked — **finding #1** (l.13); l.8 prose + l.54/55 `docs/architecture/c4/…` correct |
| `.asd/templates/t_plan.md` | checked — l.5 delegates_to; l.23-25 `../../docs/…` with `../../` prefix preserved (G-5) |
| `.asd/templates/t_ux-spec.html` | checked — l.49 `../../docs/ux/DESIGN.md`, prefix preserved |
| `.asd/templates/t_audit.md` | checked — l.50/54/56 migration-plan boilerplate all three renamed |
| `.asd/templates/t_commands.yaml` | checked — POSIX l.27/29 `docs/ux/DESIGN.md` **and** backslash l.21/23 `docs\\ux\\DESIGN.md` (R-10); `@google/design.md` package name untouched |
| `.asd/templates/t_test-plan.md` | checked — l.5 |
| `.asd/templates/t_sprint.md` | checked — l.5 |
| `.asd/templates/t_design-md-delta.yaml` | checked — l.1 `docs/ux/DESIGN.md`; file name unchanged (AC-4) |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked — l.14 `docs/**` (R-4 member); l.15 `design/doc content` correctly untouched |
| `.asd/templates/t_AGENTS.md` | checked — l.34 reworded to "persistent docs are organized per subsystem" (G-1) |

`.asd/agents/` (14)

| File | Status |
|---|---|
| `.asd/agents/asd-architect.md` | checked — l.38-40/47-50/106/107/115 renamed; **allowlist l.65** carries `docs/architecture/{stack.html,api/<subsystem>.html,c4/}` (R-5 discharged); `<sprint>/design/adr.html`+`c4-full/` preserved |
| `.asd/agents/asd-ux-designer.md` | checked — l.41-44/52/53 renamed; **allowlist l.70** carries `docs/ux/DESIGN.md`, `docs/ux/design-system.html` (R-5 discharged) |
| `.asd/agents/asd-ba.md` | checked — l.39 `docs/product/`, l.76 "persistent `docs/`"; **allowlist l.61** correctly retains only `<sprint>/design/prd.html` (no persistent path there pre-sprint; not a regression) |
| `.asd/agents/asd-backend-dev.md` | checked — l.40-42/102 renamed; l.23 "required design doc" left as design-phase-artifact sense per G-1 |
| `.asd/agents/asd-frontend-dev.md` | checked — l.42 `docs/ux/DESIGN.md` + l.40-45/106 renamed |
| `.asd/agents/asd-test-engineer.md` | checked — l.41-43/126 renamed |
| `.asd/agents/asd-reviewer-ui.md` | checked — l.43/49/50 `docs/ux/…`; `<sprint>/design/ux-spec.html` l.42 preserved |
| `.asd/agents/asd-reviewer-documentation.md` | checked — l.16/44/48/74/86; mixed-line l.43 keeps `<sprint>/design/` drafts alongside renamed root |
| `.asd/agents/asd-reviewer-quality.md` | checked — l.40/41 |
| `.asd/agents/asd-reviewer-performance.md` | checked — l.39/40 |
| `.asd/agents/asd-reviewer-testing.md` | checked — l.40 |
| `.asd/agents/asd-reviewer-implementation.md` | checked — l.37 `docs/product/requirements/<subsystem>.html` + `<sprint>/design/prd.html` both correct on the mixed line |
| `.asd/agents/asd-pm.md` | checked — l.93/108 |
| `.asd/agents/asd-external-review.md` | checked — l.53 `':(exclude)docs/**'` (R-4 member, consistent with the other two) |

`.asd/skills/` (6)

| File | Status |
|---|---|
| `.asd/skills/asd-init/SKILL.md` | checked — l.4 description, l.58-60 `docs/…`, POSIX l.107/109 **and** backslash l.101/103 `docs\\ux\\DESIGN.md`; JSON frontmatter intact (`sync.js` regenerated both views) |
| `.asd/skills/asd-design-system/SKILL.md` | checked — l.4 + l.28/94/110/142-144 `docs/ux/…`; `design-system.html` name preserved |
| `.asd/skills/asd-stack/SKILL.md` | checked — l.4 + l.15/27/96/104/134/135 `docs/architecture/…` |
| `.asd/skills/asd-concept/SKILL.md` | checked — l.26/82/89/107 `docs/product/…` |
| `.asd/skills/asd-update/SKILL.md` | checked — l.4 description prose, l.20 "Never touched: … `docs/**`" (G-13 resolved as single-root) |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked — l.4 description "promote to persistent docs/"; **skill name + phase name unchanged** (AC-3) |

`.asd/workflows/` (7)

| File | Status |
|---|---|
| `.asd/workflows/asd-phase-design-promote.md` | checked — l.11/37/42-45/50-52/67-71 renamed; l.17/45 `<sprint>/design/` preserved; phase name intact |
| `.asd/workflows/asd-phase-design.md` | checked — l.12/28/32/36/40/57/59 renamed; l.11/22/26/33/37/42/43/52-56 `<sprint>/design/` preserved |
| `.asd/workflows/asd-phase-plan.md` | checked — l.7/11/19 |
| `.asd/workflows/asd-phase-impl.md` | checked — l.12/68 |
| `.asd/workflows/asd-phase-impl-test.md` | checked — l.11/28 |
| `.asd/workflows/asd-phase-impl-review.md` | checked — l.12/32 |
| `.asd/workflows/asd-phase-audit.md` | checked — l.24/34 **and l.50** (the occurrence the audit line-list missed); l.26/33/49 `<sprint>/design/` preserved |

Root + manifest (4)

| File | Status |
|---|---|
| `.asd/release-manifest.json` | checked — ledger recomputed; 4/4 sampled `canon_hashes` entries byte-match the `source_digest` embedded in the regenerated `.claude/` views (architect `0c16805c…`, ux-designer `0c554b08…`, external-review `2b4ef66e…`, asd-init skill `8d28fbc5…`). `managed_paths` still `.asd/`-only; every `design`-bearing string is an AC-3/AC-4 file name (`skills/asd-phase-design/SKILL.md`, `t_prompt-external-design.md`, `asd-phase-design.md`) — correctly not hand-edited |
| `README.md` | checked — l.83 never-touched table, l.154 design-promote row, l.172-174 command table, l.176, l.306-320 folder map (subtree line-for-line identical to `artifact-layout.md`); **finding #1** at l.227 config excerpt |
| `AGENTS.md` | checked — l.32 "… and `docs/`"; l.40 `design`/`impl` verdict-token phases preserved |
| `CHANGELOG.md` | checked — new `## Unreleased` → `### Changed` entry (AC-9, see below) |

### Rule coverage (agent rubric + ACs)

| Item | Result |
|---|---|
| **Rubric: every AC-N has a corresponding code path** | pass — AC-1…AC-9 each trace to named files above |
| **Rubric: every AC-N has ≥1 test asserting it** | pass with note — AC-5 covered by the two existing `tests/run.js` hash-ledger cases (independently corroborated by my 4/4 digest cross-check); AC-6 is the suite run itself; AC-1/2/3/4/7/8/9 are covered by the documented static gate (two grep patterns + two targeted greps) with an explicit, reasoned "no test added" record in `test-plan.md` §Added tests. Presence of a verification mechanism confirmed; its adequacy is `asd-reviewer-testing`'s call, not mine |
| **Rubric: no AC implemented partially without follow-up** | finding #1 — AC-3 partially breached; no `stubs.md` entry and no migration entry covers it |
| **Rubric: no code change without traceable AC or plan Task** | pass — all 49 scoped files map to plan Tasks 1-11 (rules→T1, templates→T2, agents→T3, skills→T4, workflows→T5, CHANGELOG→T7, README/AGENTS→T8, manifest→T10) |
| **AC-1** — every canonical source naming the root says `docs/` | pass — spot-checked across all six canonical trees plus README/AGENTS; the ~180 out-of-scope hits remain correctly untouched |
| **AC-2** — subtree structure intact | pass — `docs/product/{concept.html,requirements/<subsystem>.html}`, `docs/architecture/{stack.html,c4/,adr/,api/,tech-reference/}`, `docs/ux/{DESIGN.md,design-system.html,accessibility.html,<subsystem>.html}` identical to predecessors; `../../` link depth preserved in `t_plan.md:23-25` and `t_ux-spec.html:49` (G-5) |
| **AC-3** — `<sprint>/design/`, `reviews/design/`, phase names, `asd-phase-design*` unchanged | **finding #1** — folder paths, `reviews/design/`, all three phase names, and all `asd-phase-design*` file/skill/dispatch names verified literally unchanged; breached only at the `documents.prd` config comment (3 sites) |
| **AC-4** — `DESIGN.md`, `design-system.html`, `design-principles.md`, `design-system.md`, `custom-design-rules.md` names unchanged | pass — all five verified on disk and in every reference; only the containing root segment moved |
| **AC-5** — provider views regenerated, no drift | pass — verified independently, not from the recorded claim: `.claude/`, `.codex/`, `.agents/skills/` all carry post-rename `docs/` content, and 4/4 sampled generated-file `source_digest` values equal the manifest `canon_hashes` for the same canonical sources, which is only possible if regeneration ran after the canon edits and the ledger was recomputed from the same bytes |
| **AC-6** — `node tests/run.js` passes | pass (corroborated, not re-run — I have no shell). `test-plan.md` records 77/77. Independent corroboration: the rename touched zero engine code (`sync.js`, `update.js`, `tests/run.js` contain no `design` reference), and the two hash-ledger tests' invariant holds on my 4/4 sample |
| **AC-7** — repo-wide `design/` **and** `design\` search clean under the stated exclusion set | pass — **re-run by me, not trusted**. `design/`: every residual hit falls in a documented exclusion class (`<sprint>/design/`, `reviews/design/`, `asd-phase-design*` file names, `design/design-review` phase pair, `design-system*`/`design-principles*`, `t_design-md-delta.yaml`, `.asd/sprints/**`, `decisions-log.md`, `CHANGELOG.md`); zero unexplained. `design\`: zero hits outside `.asd/sprints/**` + `decisions-log.md`. Targeted `exclude)design` → 0 (all three R-4 members now `':(exclude)docs/**'`). Targeted `design\ux` → 0 (all four R-10 members now `docs\\ux\\DESIGN.md`) |
| **AC-8** — README mirrors updated same change | pass on all mirrors (folder map, never-touched table, phase table, command table, agent roster unaffected); the config-schema excerpt is in scope of finding #1 |
| **AC-9** — CHANGELOG migration entry | pass — under `## Unreleased` / `### Changed`, marked **BREAKING**, all four migration steps in the required order (`git mv design docs` → fix consumer-owned `designmd-lint`/`designmd-export` aliases → `/asd-update` → `/asd-sync`), plus the split-brain-window warning and the "nothing auto-migrates, nothing errors" note |
| Severity floor (iter 1 → low; all severities admitted) | applied |
| Nitpick drop list | applied — dropped: "docs/ docs" phrasing in `t_plan.md:5`/`t_sprint.md:5`/`t_test-plan.md:5`/`asd-init` description (wording polish, mirrors pre-existing "design/ docs" construction); residual "design docs" prose in `asd-backend-dev.md:23`, `asd-phase-impl.md:35`, `sprint-lifecycle.md:83` (denote design-*phase* artifacts, correctly retained per G-1) |
| Out-of-scope for this reviewer | bugs/security (Quality), test quality (Testing), doc wording (Documentation), simplification, performance, UI |
| `.asd/project/custom-common-rules.md` / `custom-coding-rules.md` | n/a — not in the diff scope (pathspec excludes `.asd/project/**`); their `design/design-review` phase pair verified untouched anyway |

## Verdict

**CONCERNS:** one high finding — AC-3 breached by an over-rename of the sprint-local `design/prd.html` draft reference to a non-existent `docs/prd.html`, at `.asd/templates/t_config.yaml:13`, `README.md:227`, and `.asd/project/config.yaml:15`. All other ACs (1, 2, 4, 5, 6, 7, 8, 9) verified satisfied, several by independent re-run rather than by trusting `plan.md`/`test-plan.md` records.

## Next action

Route back to `impl` in review-fix mode; `backend-dev` restores the sprint-draft sense of the `documents.prd` comment at the three sites, then re-runs `node .asd/sync.js --apply` (t_config.yaml has no generated view, but `README.md`/`t_config.yaml` edits must be followed by the bare `--apply` ledger recompute for the manifest). No escalation required — the fix reverts an out-of-scope rename and triggers no Complication Approval condition.

## Escalations

None.
</content>
