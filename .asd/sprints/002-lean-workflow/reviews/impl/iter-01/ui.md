[REVIEW-impl-ui]: CONCERNS

# Review — ui

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/templates/t_html-shell.html:126,131,132,174` | Raw colour literals (`rgba(...)`) duplicate `--ok`/`--danger` token values instead of referencing them. | Add `--ok-tint`/`--danger-tint` custom properties and reference via `var(--…)`. |
| 2 | medium | `.asd/templates/t_html-shell.html:171-180` | Dead `/* API */` CSS block styling the deleted `t_api.html` fragment. | Delete lines 171-180. |
| 3 | medium | `.asd/templates/t_html-shell.html:127-128` | `.status-superseded`/`.status-deprecated` unreachable after Task 9 dropped both ADR statuses. | Delete both rules. |
| 4 | low | `.asd/templates/t_html-shell.html:167` | `.a11y-domain .scope` dead after Task 8 removed per-domain scope paragraphs. | Delete the rule. |
| 5 | medium | `.asd/templates/t_adr.html:14` | Status chip class hardcoded `status-proposed` while label placeholder is `{{proposed \| accepted}}` — an accepted ADR renders in "proposed" colours. | `class="status-chip status-{{proposed \| accepted}}"`. |
| 6 | medium | `.asd/templates/t_adr.html` (multiple) + `t_html-shell.html:226-244` + `artifact-layout.md:128` | Multi-ADR sprint file has duplicate ids across articles (`id="context"` etc.) — TOC/scrollspy resolves only the first ADR. | Prefix ids per article (`id="adr-1-context"`) or wrap each in `<section id="adr-N">`. |
| 7 | medium | `artifact-layout.md:120,126,127`, `asd-architect.md:95`, `t_html-shell.html:52-55` | Doc-level header meta still assumes one ADR per document (title/status/stats). | Make ADR doc meta set-level; keep per-ADR status on the per-article chip only. |
| 8 | medium | `asd-phase-impl-review.md:29` vs `asd-reviewer-ui.md:23` vs `README.md:216` | UI-surface predicate stated with two different definitions across three homes. | Pick one wording, mirror verbatim in all three. |
| 9 | medium | `asd-design-system/SKILL.md:102` | Phase 6 enumerates only 5 domain sections; Overall Commitment/Test Plan/Known Intentional Limitations have no authoring driver. | Extend the enumeration to name every `t_accessibility.html` section. |
| 10 | medium | `.asd/templates/t_ux-spec.html:50` | Broken relative link to DESIGN.md from either the sprint-draft or promoted location. | Drop the link or use a placeholder resolved per output location. |
| 11 | low | `asd-phase-impl-review.md:31` → `t_state.json` | "See t_state.json" pointer dangles — that file is comment-free JSON documenting nothing. | Repoint at `sprint-lifecycle.md` "State recovery". |
| 12 | low | `.asd/templates/t_html-shell.html:32-40` | Dark-mode block doesn't override `--accent`/`--ok`/`--warn`/`--danger`/`--info`; link text falls below WCAG contrast in dark mode. | Add dark-scheme overrides for the six semantic colours. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 55/55 covered, 34 checked, 21 n/a`

**n/a rows** (grouped by reason):
| Item | Reason |
|---|---|
| Dev-agent, PM, review-rubric, skill-dispatch files with no design-system/mockup/a11y surface (`asd-backend-dev.md`, `asd-external-review.md`, `asd-frontend-dev.md`, `asd-pm.md`, `asd-reviewer-{implementation,performance,quality,simplification,testing}.md`, `asd-concept/stack/phase-*/SKILL.md`, `t_prompt-external-design.md`, `t_review-report.md`, `t_audit.md`, `t_config.yaml`(non-UI slice), `t_decisions-log.md`, `t_plan.md`, `t_state.json`(non-slot), `t_stubs.md`, `t_test-plan.md`, most workflow files, `.gitignore`, `CHANGELOG.md`) | outside UI domain — no token, mockup, or a11y content in scope |

**Findings rows**:
| Rubric item | Finding |
|---|---|
| Token usage (raw hex/px in UI/mockup) | finding #1 |
| Design system completeness (styles for non-existent components) | finding #2, #3, #4 |
| UX principles — cross-theme consistency | finding #5, #12 |
| HTML shell self-containment + placeholder consistency | finding #6, #7 |
| Accessibility (rules from accessibility.html, Known Intentional Limitations) | finding #9 |

## Verdict
CONCERNS: 12

## Next action
Route to `impl` review-fix mode. Findings #2,#3,#4 are pure deletions; #5,#10,#11 one-line edits; #8,#9 mirror/enumeration edits; #6,#7 need a small id/meta-shape decision (still autofixable).

## Escalations
None. Findings #1 and #12 graded medium rather than the rubric's nominal high because these are framework artifact templates with no `DESIGN.md` token registry and provenance in-diff is unproven — regrade upward if desired.
