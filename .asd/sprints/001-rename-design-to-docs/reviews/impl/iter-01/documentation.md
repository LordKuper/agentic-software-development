[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low
- **Scope note**: I am read-only with no shell tool, so I could not execute the `git diff` command myself. I reconstructed the 49-file scope from `plan.md` Tasks 1–8 + `audit.md` §1–7 (8 rules + 10 templates + 14 agents + 6 skills + 7 workflows + `README.md` + `AGENTS.md` + `CHANGELOG.md` + `release-manifest.json` = exactly 49, matching the stated count) and verified each file's **current on-disk content** directly rather than trusting any self-report.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/templates/t_config.yaml:13`, `README.md:227` (and the out-of-diff mirror `.asd/project/config.yaml:15`) | `prd: enabled  # docs/prd.html + persistent requirements` — `docs/prd.html` is a path that exists nowhere in the SSoT (`artifact-layout.md`). The comment column in the `documents:` block follows the pattern *`<sprint draft artifact>` + persistent `<counterpart>`*: `audit → <sprint>/audit.md`, `ux_spec → ux-spec, design-system gate, design-md-delta`, `adr → adr.html + persistent ADR`, `c4 → c4-full + persistent C4`. The `prd` row's first token was therefore the **sprint draft** `<sprint>/design/prd.html`, not the persistent root — its persistent counterpart is already the second half of the same comment ("+ persistent requirements", i.e. `docs/product/requirements/<subsystem>.html`). This is an out-of-scope rename against AC-3 ("`<sprint>/design/` … remains literally unchanged") and it plants a non-existent path into consumer-facing config documentation shipped by `/asd-init` and `/asd-update`, contradicting `artifact-layout.md`. | Restore the sprint-draft spelling in all three files, matching the sibling rows: `prd: enabled  # prd.html + persistent requirements` (or `# <sprint>/design/prd.html + persistent requirements`). |
| 2 | low | `.asd/templates/t_plan.md:5`, `t_sprint.md:5`, `t_test-plan.md:5`; `.asd/workflows/asd-phase-plan.md:11,19`, `asd-phase-impl.md:12`, `asd-phase-impl-test.md:11`, `asd-phase-impl-review.md:12`; `.asd/skills/asd-init/SKILL.md:4`; `.asd/rules/review-policy.md:136`, `language-policy.md:8` | Mechanical segment substitution produced the doubled noun `docs/ docs` (`language-policy.md` variant: `docs/* docs`). `plan.md` Context declares the approved G-1 convention with an explicit target phrasing — *"Target phrasing: 'persistent docs'"* — which these lines do not follow. Worst case is the three `responsibility:` frontmatter `delegates_to:` fields (`t_plan.md:5` `delegates_to: docs/ docs (requirements/design)`), the exact block this reviewer parses for delegation targets: the value now reads as neither a path nor a phrase. `asd-phase-plan.md` is additionally internally inconsistent — line 7 backticks it (`persistent \`docs/\` docs`), lines 11/19 do not. | Apply the declared convention: `delegates_to: persistent docs (requirements/design)` in the three templates; `persistent docs` (or backticked `` `docs/` ``, chosen once) in the workflows, skill description, and the two rule lines. |
| 3 | low | `.asd/agents/asd-reviewer-simplification.md:98`; `.asd/workflows/asd-phase-impl.md:35` | G-1 reword applied inconsistently. All peer reviewer don't-lines were reworded to "persistent docs" (`asd-reviewer-quality.md:81`, `asd-reviewer-implementation.md:76`, `asd-reviewer-documentation.md:87`, `asd-external-review.md:113`), but `asd-reviewer-simplification.md:98` still reads "Never modify code or **design docs**". That reviewer runs in *both* design-review and impl-review, so in impl-review its don't-line can only mean the renamed root — the phase-scoped classification that justified leaving it (audit §3) does not hold for half its dispatches. `plan.md` Task 3 contains the contradiction verbatim: `- [x] Reword the ~8 reviewer "Never modify … design docs" prose lines` alongside `- [x] Do NOT edit asd-reviewer-simplification.md at all`. Same class: `asd-phase-impl.md:35` "requirement ambiguity unresolvable from plan + design docs", where the impl-phase requirements source is the persistent `docs/` (line 12 of the same file already says so). | Reword both to "persistent docs" for parity with the peer reviewers, or record explicitly why these two keep phase-scoped wording. |
| 4 | low | `.asd/templates/t_plan.md:23-25` | The `../../docs/...` links were carried over at a depth that does not resolve: `plan.md` lives at `.asd/sprints/<NNN-slug>/plan.md`, so `../../` lands on `.asd/`, making the target `.asd/docs/product/requirements/…`. Correct prefix is `../../../`. Pre-existing (it was equally broken as `../../design/…`), but audit **G-5** explicitly instructed *"already depth-questionable — verify, don't blindly propagate"*, and `plan.md` Task 2 discharged it as "preserve the `../../` prefix on lines 23–25 exactly", so the verification G-5 asked for never happened. Contrast `t_ux-spec.html:49` `../../docs/ux/DESIGN.md`, which **is** correct from `docs/ux/<subsystem>.html` — the two depths were rightly treated as different, which is why the residual error here is visible. | Fix to `../../../docs/product/requirements/{{subsystem}}.html` etc., or record G-5 as deliberately deferred (it is rename-neutral). |

## Coverage ledger

### File coverage

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked — SSoT for the renamed layout; decomposition-enabled tree (l.45) and flat tree (l.67,70) both `docs/`, registry l.84, tech-reference l.141. Out-of-scope lines correctly untouched: l.31 `<sprint>/design/`, l.41 `reviews/design/iter-NN/`, l.58/59/77 `DESIGN.md`/`design-system.html` |
| `.asd/rules/core.md` | checked — glossary l.20 "living document under `docs/`", l.22 registry `docs/architecture/c4/`; `design-promote` phase name preserved; "See also" list intact and complete (12 entries vs 12 non-`core` rule docs on disk) |
| `.asd/rules/sprint-lifecycle.md` | checked — l.49, 52, 105, 122, 135, 136, 137 renamed; l.42/49–51/107/114 `<sprint>/design/` + `reviews/design/` and all phase-name column values preserved; l.83 "Independent design docs" correctly kept (phase-scoped) |
| `.asd/rules/checkpoints.md` | checked — l.15 "final write to persistent `docs/`"; `design-promote` phase name in the same row preserved |
| `.asd/rules/language-policy.md` | checked — l.8 renamed; contributes to finding #2 (`docs/* docs`) |
| `.asd/rules/design-system.md` | checked — l.7 `docs/ux/DESIGN.md` = SSoT; file name `design-system.md` correctly unchanged (AC-4) |
| `.asd/rules/review-policy.md` | checked — l.136 "independent of persistent `docs/` docs"; `design-review` row of the DoD reviewer table untouched; contributes to finding #2 |
| `.asd/rules/external-review.md` | checked — R-4 atomic set complete: l.44 prose and l.51 pathspec `':(exclude)docs/**'`; l.47 `docs/architecture/c4/` renamed while `<sprint>/design/c4-full/` and the "design/doc" or-pair on the same line correctly preserved; l.43/57/77 `reviews/design/` untouched |
| `.asd/templates/t_config.yaml` | checked — **finding #1** (l.13); prose l.8/48 correctly reworded to "persistent docs"; l.54/55 c4 paths renamed |
| `.asd/templates/t_plan.md` | checked — **finding #2** (l.5), **finding #4** (l.23–25 depth) |
| `.asd/templates/t_ux-spec.html` | checked — l.49 `../../docs/ux/DESIGN.md`, depth correct for the promoted location; fragment invariants hold (no `<html>`/`<head>`/`<body>`/`<style>`/`<script>`); responsibility frontmatter intact |
| `.asd/templates/t_audit.md` | checked — migration-plan boilerplate l.50/54/56 all three renamed (`persistent docs in \`docs/\``, `Proposed target in \`docs/\``, `{{docs/.../*.html}}`); G-4 self-reference resolved |
| `.asd/templates/t_commands.yaml` | checked — R-10 backslash set complete: l.21/23 `docs\\ux\\DESIGN.md` and POSIX l.27/29 `docs/ux/DESIGN.md`; `@google/design.md` package name correctly preserved on all four lines |
| `.asd/templates/t_test-plan.md` | checked — l.5; contributes to finding #2 |
| `.asd/templates/t_sprint.md` | checked — l.5; contributes to finding #2 |
| `.asd/templates/t_design-md-delta.yaml` | checked — l.1 `# proposed changes to docs/ux/DESIGN.md`; file name preserved (AC-4) |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked — l.14 R-4 member (`.asd/**` and `docs/**` excluded); l.15 "design/doc content" or-pair correctly left alone |
| `.asd/templates/t_AGENTS.md` | checked — l.34 G-1 reword applied ("persistent docs are organized per subsystem"); no path occurrence, correctly no other edit |
| `.asd/agents/asd-architect.md` | checked — l.40, 49, 50, 106, 107, 115 renamed; **write-access allowlist l.65 verified**: `docs/architecture/stack.html`/`api/<subsystem>.html`/`c4/` (promote only) alongside preserved `<sprint>/design/adr.html`, `<sprint>/design/c4-full/` (R-5 closed) |
| `.asd/agents/asd-ux-designer.md` | checked — l.41–44, 52, 53 renamed; **write-access allowlist l.70 verified**: `docs/ux/DESIGN.md`, `docs/ux/design-system.html` (promote only) with `<sprint>/design/*` drafts preserved (R-5 closed); l.68 `design.md` spec URL correctly untouched |
| `.asd/agents/asd-frontend-dev.md` | checked — l.40–45, 106 renamed |
| `.asd/agents/asd-backend-dev.md` | checked — l.40–42, 102 renamed |
| `.asd/agents/asd-test-engineer.md` | checked — l.41–43, 126 renamed |
| `.asd/agents/asd-reviewer-ui.md` | checked — l.43–45, 49–51 renamed |
| `.asd/agents/asd-reviewer-documentation.md` | checked — l.16, 44, 48, 74, 86 renamed; the mixed in/out-of-scope lines resolved correctly (own-agent verification) |
| `.asd/agents/asd-reviewer-quality.md` | checked — l.40, 41 renamed; l.81 don't-line reworded to "persistent docs" |
| `.asd/agents/asd-reviewer-performance.md` | checked — l.39, 40 renamed |
| `.asd/agents/asd-reviewer-testing.md` | checked — l.40 renamed |
| `.asd/agents/asd-reviewer-implementation.md` | checked — l.37 renamed (retains the `<sprint>/design/prd.html` alternative correctly); l.76 don't-line reworded |
| `.asd/agents/asd-ba.md` | checked — l.39 renamed, l.76 "Never write to persistent `docs/` directly"; l.61 allowlist correctly needed no rename (it lists only `<sprint>/` targets — audit's R-5 claim for this file was a false positive, not a miss) |
| `.asd/agents/asd-pm.md` | checked — l.93 checkpoint row, l.108 don't-line, both `docs/` |
| `.asd/agents/asd-external-review.md` | checked — l.53 R-4 member: `':(exclude).asd/**' ':(exclude)docs/**'` |
| `.asd/skills/asd-init/SKILL.md` | checked — JSON frontmatter parses; l.4 description renamed (contributes to finding #2); l.58–60 gate paths; R-10 backslash l.101/103 `docs\\ux\\DESIGN.md` + POSIX l.107/109; l.117 c4 path |
| `.asd/skills/asd-design-system/SKILL.md` | checked — l.4 description + l.15, 16, 28, 94, 101, 110, 142–144 all `docs/…`; JSON frontmatter parses |
| `.asd/skills/asd-stack/SKILL.md` | checked — l.4 description + l.15, 27, 96, 104, 134, 135; JSON frontmatter parses |
| `.asd/skills/asd-concept/SKILL.md` | checked — l.26, 82, 89, 107; l.27 brownfield-signal glob `docs/**` consistent |
| `.asd/skills/asd-update/SKILL.md` | checked — l.4 description G-1 reword ("persistent docs"); l.20 "Never touched: … `docs/**`" (G-13 resolved as planned, migration window covered by CHANGELOG) |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked — l.4 description "promote to persistent docs/"; skill name and `design-promote` phase name unchanged (AC-3); JSON frontmatter parses |
| `.asd/workflows/asd-phase-design-promote.md` | checked — l.11, 37, 42–45, 50–52, 67–71 renamed; `<sprint>/design/c4-full/` on l.45 and every `design-promote` phase reference preserved |
| `.asd/workflows/asd-phase-design.md` | checked — l.12, 28, 32, 36, 40, 57, 59 renamed; all 6 `<sprint>/design/*` draft outputs (l.52–56) preserved verbatim |
| `.asd/workflows/asd-phase-plan.md` | checked — l.7, 11, 19 renamed; contributes to finding #2 |
| `.asd/workflows/asd-phase-impl.md` | checked — l.12, 68 renamed; **finding #3** (l.35) |
| `.asd/workflows/asd-phase-impl-test.md` | checked — l.11, 28 renamed; l.28 correctly *links* the pathspec to `external-review.md` rather than restating it (good SSoT hygiene) |
| `.asd/workflows/asd-phase-impl-review.md` | checked — l.12, 32 renamed; contributes to finding #2 |
| `.asd/workflows/asd-phase-audit.md` | checked — l.24, 34 **and l.50** renamed (l.50 was the occurrence audit's line enumeration missed — closed) |
| `README.md` | checked — folder map l.306–320 diffed line-for-line against `artifact-layout.md` (see rule coverage); never-touched table l.83; design-promote row l.154; command table l.172/173/174; G-1 prose l.14/176/306; **finding #1** at l.227. l.331 correctly declares `artifact-layout.md` authoritative, so the map stays a mirror not a second SSoT |
| `AGENTS.md` | checked — l.32 flow line now `.asd/sprints/<NNN-slug>/` and `docs/`; l.40 verdict-token rule and all `design`-phase names untouched |
| `CHANGELOG.md` | checked — `## Unreleased` → `### Changed` entry present; marked BREAKING; migration steps in the required order (`git mv design docs` → consumer `commands.yaml` aliases → `/asd-update` → `/asd-sync`); split-brain window and "nothing errors / silently split corpus" both documented. AC-9 fully satisfied |
| `.asd/release-manifest.json` | checked (no hand edit expected, none found) — `managed_paths` still the 7 `.asd/`-only entries; `schema_version`/`asd_version`/`model_families`/`canon_hashes`/`upstream_hashes` structure intact; G-2 confirmed |

### Rule coverage

| Rubric item | Status |
|---|---|
| SSoT — each fact one home, downstream links not copies | finding #1 (`docs/prd.html` is a doc fact with no home in `artifact-layout.md` and contradicts it) |
| SSoT — no *new* independent restatement of the docs root introduced by the rename | pass — no file gained a second layout declaration. `README.md:331` names `artifact-layout.md` authoritative; `asd-phase-impl-test.md:28` links the pathspec to `external-review.md` instead of copying it. `sprint-lifecycle.md:135–137` enumerates promotion targets, but that duplication is pre-existing and unchanged in shape by this diff |
| Template adherence — responsibility frontmatter present, sections respect `owns`/`excludes` | pass — all 24 templates carrying the block retain it; `t_plan.md`/`t_sprint.md`/`t_test-plan.md` blocks structurally intact (their `delegates_to` *value* is finding #2, not a missing field) |
| HTML shell wrapping / placeholder fill / fragment invariants | pass — only one HTML file in scope (`t_ux-spec.html`); no `<html>`/`<head>`/`<body>`/`<style>`/`<script>` chrome, single line changed, `t_html-shell.html` placeholder table in `artifact-layout.md` untouched |
| Provenance field + badge-omission correctness | n/a — no user-facing artifact with a `provenance` field in scope; `documents.prd/ux_spec/adr/c4` all disabled in this repo's lean profile, so no draft or promoted doc was produced |
| Traceability — PRD ACs → ADRs → code | n/a as PRD/ADR (`documents.prd`/`adr` disabled). Traced against `sprint.md`'s own list instead: AC-1 ✔ (all 49 canon files), AC-2 ✔ (`docs/product|architecture|ux` subtrees byte-identical to predecessors, leading segment only), AC-3 ✔ (`<sprint>/design/`, `reviews/design/`, `design`/`design-review`/`design-promote`, `asd-phase-design*` all literal), AC-4 ✔ (`DESIGN.md`, `design-system.html`, `design-principles.md`, `design-system.md`, `custom-design-rules.md` names intact), AC-8 ✔, AC-9 ✔. AC-5/AC-6/AC-7 belong to the Testing/Implementation reviewers |
| Persistent-docs actuality vs implementation (drift) | n/a — no `docs/` tree exists on disk in this repo; nothing to drift against |
| Framework mode (`self_hosting: enabled`) — README + `.asd/rules/**` consistent with the canonical diff | finding #1 (`README.md:227` config-schema excerpt). Otherwise pass — README folder map l.306–320 verified line-for-line against `artifact-layout.md` l.45–62: `product/{concept.html, requirements/<subsystem>.html}`, `architecture/{stack.html, c4/, adr/<subsystem>/adr-NNNN-<slug>.html, api/<subsystem>.html, tech-reference/<tech>-<version>.md}`, `ux/{DESIGN.md, design-system.html, accessibility.html, <subsystem>.html}` — identical set, identical order, no missing or extra node |
| Framework mode — phase list / `PHASE_CHAIN` mirror | pass, unaffected — `session-start.js:24–30` still `scope, audit, design, design-review, design-promote, plan, …`; `sprint-lifecycle.md`, `core.md:15` glossary, and README's Mermaid flow all unchanged. No accidental edit |
| Framework mode — agent roster / model tiers mirror | pass, unaffected — no agent added, removed, or retiered; README l.193–210 roster untouched by this diff |
| Framework mode — config schema mirror | finding #1 — the schema excerpt is otherwise in sync (`documents`, `language`, `project`, `backward_compat`, `review`, `system`, `git` blocks match `t_config.yaml`) |
| Framework mode — folder map mirror | pass (see above) |
| Framework mode — `core.md` "See also" rule-doc list | pass, unaffected — no rule doc added or removed this sprint; 12 listed entries match the 12 non-`core.md` files under `.asd/rules/` |
| Framework mode — reviewer verdict token format | pass, unaffected — `[REVIEW-<phase>-<reviewer>]` definition identical in `review-policy.md` l.112–125, `AGENTS.md:40`, `README.md:214`, and the agent files |
| Framework mode — `release-manifest.json` `managed_paths` / structure | pass — still `.asd/`-only (7 entries), path-agnostic; only ledger values changed, as G-2 predicted |
| G-1 prose convention applied only where the phrase denotes the root | finding #3 (residual "design docs" in `asd-reviewer-simplification.md:98` and `asd-phase-impl.md:35`) — plus finding #2 for the phrasing it produced where it *was* applied. Correctly-preserved phase-scoped uses verified: `sprint-lifecycle.md:83`, `asd-phase-plan/SKILL.md:4`, `t_prompt-external-impl.md:15`, `t_prompt-external-design.md`, `external-review.md:47` |
| Custom rules — `custom-common-rules.md` domain glossary / naming consistency | pass — file is the unmodified template stub (no project glossary or naming terms that the rename could contradict); correctly left untouched, its l.5 `custom-design-rules.md (design/design-review)` is a phase pair, not a path (G-3 honoured) |
| Custom rules — `custom-coding-rules.md` (impl-review phase-scoped file) | pass — unmodified stub, no coding rule bearing on the docs root; l.5 phase pair correctly preserved (G-3 honoured) |
| Nitpick drop list respected (no wording polish, naming opinion, or speculative future-proofing raised) | pass — findings #2 and #3 are cited against `plan.md`'s own approved G-1 convention ("Target phrasing: 'persistent docs'") and against peer-file parity, not against my preference; #4 is cited against audit G-5's explicit unverified instruction |
| Iteration severity floor (iter 1 → floor = low, all findings admitted) | pass |

## Verdict

CONCERNS: 4 (1 medium, 3 low)

The rename itself is executed to a high standard. Every high-risk item the audit called out is closed and independently verified here: the three-member `':(exclude)docs/**'` pathspec set (R-4), the four separator-blind `docs\\ux\\DESIGN.md` command aliases (R-10), both real write-access allowlists (R-5), all five skill `description` dispatch triggers with parsing frontmatter (R-6), the README folder-map mirror (R-7), the manifest left un-hand-edited (G-2), and the `asd-phase-audit.md:50` occurrence the audit's own line enumeration had missed. Out-of-scope classes are clean: no `<sprint>/design/`, `reviews/design/`, phase name, `asd-phase-design*` path, `design-system*`/`design-principles*`/`t_design-md-delta.yaml` file name, or `@google/design.md` package name was disturbed. The four findings are all autofixable by the responsible dev without escalation.

## Next action

impl-review routes the sprint back to `impl` in review-fix mode (`review-policy.md` "Autofix vs escalation" — impl-review findings are never fixed inside the review phase). `backend-dev` resolves findings #1–#4, then the sprint re-enters impl-review via `impl-test`.

Sequencing note for the fix pass: finding #1 touches `.asd/templates/t_config.yaml`, `README.md`, and `.asd/project/config.yaml` — none of which have a `sync.js` target, so no provider regeneration is needed for it. Findings #2 and #3 touch `.asd/agents/asd-reviewer-simplification.md` and `.asd/skills/asd-init/SKILL.md`, which **do** have generated views, so `node .asd/sync.js --apply <file...>` (explicit file list — the bare form regenerates nothing, audit G-9) plus the final bare `--apply` for the hash ledger (audit R-12) must run again after the fixes.

## Escalations

None. All four findings are creator-autofixable within the existing sprint scope — no concept, requirement, API contract, abstraction, or scope change is implied.
</content>
