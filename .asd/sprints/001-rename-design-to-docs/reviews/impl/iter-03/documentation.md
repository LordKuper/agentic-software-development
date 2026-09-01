[REVIEW-impl-documentation]: APPROVE

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high (low/medium dropped from verdict computation)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above floor | — |

## Coverage ledger (mandatory — verdict INVALID if incomplete; see `review-policy.md`)

### File coverage

| File | Status |
|---|---|
| `.asd/release-manifest.json` | checked — `managed_paths` still covers `.asd/templates` + `.asd/workflows`, so both files edited this pass are tracked; `canon_hashes` carries entries for `.asd/templates/t_test-plan.md` (L144) and `.asd/workflows/asd-phase-impl.md` (L152); every remaining `design`-bearing string is an AC-3/AC-4 file name (`asd-phase-design*`, `design-principles.md`, `design-system.md`, `t_design-md-delta.yaml`, `t_design-system.html`, `t_custom-design-rules.md`, `t_prompt-external-design.md`) — none names the persistent root. `model_families` untouched (README model-tier mirror unaffected); `asd_version` still `1.2.0`, correctly matching CHANGELOG's `## Unreleased` heading (bump is the `pr` phase's job per plan Task 7). Ledger recompute (`191ad36`) ordered after the content commits — correct. |
| `.asd/templates/t_test-plan.md` | checked — iter-2 finding #1 **resolved**. Line 5 now reads `delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)`, matching `asd-phase-impl-test.md:11` (`persistent docs (PRD ACs, api, ux-spec)`). Responsibility frontmatter intact (`owns`/`excludes`/`delegates_to`); body content stays inside the declared `owns` scope (change surface, risk→check, removals, additions, suite run, defects, manual verification) and delegates tasks/requirements/verdict out rather than duplicating them — SSoT clean. No `design/` occurrence remains, so no AC-7 exclusion entry is needed for this file. |
| `.asd/workflows/asd-phase-impl.md` | checked — the "persistent docs" vocabulary is now uniform across all four sites: L12 (`read: … persistent docs`), L35 (`plan + persistent docs`), L41 (`Within plan + persistent docs scope`), L69 (`work autonomously within plan + persistent docs scope`). No residual "persistent design docs" phrasing. L68 correctly reads `docs/architecture/tech-reference/<tech>-<version>.md`, matching `artifact-layout.md`'s tech-reference rule. Self-hosting write-scope list at L47 matches `sprint-lifecycle.md` "Self-hosting" and keeps generated views off-limits. Reviewer-read-only contract preserved (step 6 dispatches devs, not reviewers). No responsibility frontmatter required (workflow body, not a template). |
| `CHANGELOG.md` | checked — restructure into a numbered list is fact-preserving. Every item from plan Task 7 survives: breaking statement (root `design/` → `docs/`); step 1 `git mv design docs` **plus** the pre-existing-`docs/` branch from iter-1 finding #4 verbatim (nesting warning, three-subtree `git mv design/product design/architecture design/ux docs/`, manual collision resolution); step 2 `designmd-lint`/`designmd-export` alias fix with the "never touched by `/asd-update`" caveat; step 3 `/asd-update`; step 4 `/asd-sync`; the split-brain window naming all three generated view roots; and the "nothing auto-migrates, nothing errors — silently split corpus, not a crash" failure-mode note with the `DESIGN.md` example. Ordering preserved. Nothing dropped in the reflow. No SSoT violation: the migration procedure has no other home (option (a) per escalation R-13). Kept under `## Unreleased`, correct placement per Task 7. |
| `tests/run.js` | checked — no `design`/`docs` string anywhere in the file, so it makes no persistent-docs claim and carries no rename drift. Its one documentation-adjacent claim, `SELF_SOURCED_ALLOWLIST = new Set(['AGENTS.md'])` at L981 with its comment at L977-980, is accurate against root `AGENTS.md`'s own documented rule ("`asd-init`/`sync.js` never replace this file's managed block from `t_AGENTS.md` while self-hosting"). Stays zero-dependency Node per `custom-coding-rules.md`. |

### Rule coverage

| Rubric item | Status |
|---|---|
| SSoT — each fact one home; downstream docs link not copy | pass — CHANGELOG migration procedure has a single home; `t_test-plan.md` delegates requirements/tasks/verdict rather than restating them; `asd-phase-impl.md` references `artifact-layout.md`/`sprint-lifecycle.md` instead of restating the tech-reference and self-hosting rules; `release-manifest.json` `model_families` remains the single mirror of `providers.md`. No duplicated fact introduced this pass. |
| Template adherence — responsibility frontmatter present; sections respect `owns`/`excludes` | pass — `t_test-plan.md` frontmatter complete and content-scoped. `.asd/workflows/`, `release-manifest.json`, `CHANGELOG.md`, `tests/run.js` carry no responsibility block by design. |
| HTML shell wrapping (`t_html-shell.html`, placeholders, no bare fragments/duplicated chrome) | n/a — no HTML artifact or fragment template in this iteration's diff scope |
| Provenance — field correctness, badge omission when `original` | n/a — no user-facing artifact with a `provenance` field in scope |
| Traceability — ACs map to decisions and to code | pass — verified per dispatch request. **AC-1** now states a per-site corroboration rule plus a named `t_sprint.md:5` **Approved exception**; `t_sprint.md` is absent from the "covering" enumeration while `t_test-plan.md` remains in it and is explicitly called out as *not* an exception with its final wording quoted. Confirmed against `.asd/templates/t_sprint.md:5`, which does read `design/ docs (decisions)` as approved. **AC-7**'s exclusion set does include "the AC-1 approved exception `.asd/templates/t_sprint.md:5` (its `delegates_to:` sprint-sibling reference)" and pre-declares it as the sole expected in-scope-looking match, so the `pr`-phase grep gate will not report a false failure. **plan.md Task 2** annotations are accurate: L60 (`t_test-plan.md` — reword, full fix history through iter-01 over-revert to iter-02 correction) and L61 (`t_sprint.md` — "Reverted, not renamed", cites the user-approved iter-01 escalation). The cited authority exists: `decisions-log.md` 2026-09-01 entries at L96-100 (escalation granted) and L102-106 (revert applied). Bookkeeping accurate and complete — iter-2 finding #2 **resolved**. |
| Persistent actuality (impl-review) — persistent docs reflect what code does; skip disabled docs | n/a — no persistent `docs/` tree exists in this repo (`documents.prd`/`ux_spec`/`adr`/`c4` disabled in the lean self-hosting profile, `design`/`design-review`/`design-promote` all recorded as no-op skips), so there is no persistent doc to drift |
| Framework mode (`self_hosting: enabled`) — README.md + `.asd/rules/**` consistent with canonical diff | pass — this iteration touches none of the AGENTS.md "Hard rules" mirrors: no phase-list, agent-roster, model-tier, config-schema, or folder-map change (`model_families` and `managed_paths` both unchanged; the only manifest delta is the hash ledger). Repo-wide grep for `persistent design` / `design docs` / `design/ docs` returns only legitimately out-of-scope hits: the sprint-local draft folder (`asd-phase-plan/SKILL.md:4`, `sprint-lifecycle.md:83`), the design-phase prose in `t_prompt-external-impl.md:15` (explicit do-NOT-touch in plan Task 2), and the approved `t_sprint.md:5` exception. README needs no edit this pass. |
| Custom rules consistency — `custom-common-rules.md` glossary/naming | pass — the "canonical source / provider view / consumer" vocabulary is used correctly in `asd-phase-impl.md:47` and in the CHANGELOG split-brain paragraph |
| Custom rules consistency — `custom-coding-rules.md` (impl-review phase-scoped) | pass — `tests/run.js` remains zero-dependency (`fs`/`path`/`crypto`/`node:child_process` only, no YAML lib); canonical edits were followed by `sync.js --apply`; no hand-edit under `.claude/`/`.codex/`/`.agents/skills/` in scope |

## Verdict

APPROVE

Both iter-2 findings are confirmed resolved, and the two cross-file consistency questions raised in dispatch resolve clean (`asd-phase-impl.md` vocabulary uniform across L12/35/41/69; CHANGELOG reflow fact-preserving against all five plan Task 7 requirements). No high or critical finding.

Two sub-floor observations recorded for transparency only — **not** findings, dropped per the `high` severity floor, and not to be actioned this iteration:

- `.asd/sprints/001-rename-design-to-docs/sprint.md:5`'s own `delegates_to` reads `docs/ docs (decisions)` while the template it instantiates keeps `design/ docs (decisions)` under the approved exception. Zero functional impact (no `<sprint>/design/` folder exists here; `.asd/sprints/**` is excluded from the AC-7 gate and archived at merge).
- `tests/run.js:947`'s section-9 heading comment still says "with no real canon trees yet (Stage 0)", now stale after the coverage guard began enumerating real canon dirs from disk.

## Next action

Reviewer done. No fix routed back to `impl` from Documentation. PM aggregates against the `review-policy.md` impl-review DoD table (all reviewers APPROVE in the same iteration).

## Escalations

None.
</content>
