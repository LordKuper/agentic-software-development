[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | 7 `asd-phase-*/SKILL.md` `allowed-tools` vs their workflows | No phase skill grants `Write`/`Edit`, but this sprint moved review-file authoring and mechanical state writes into the phase workflow itself. | Add `Write Edit` to the 7 skills; sync.js --apply; add the write op to the 2 review workflows' Operations-used lists. |
| 2 | high | `asd-external-review.md:53` vs `external-review.md:44-45,51` | Agent copies (rather than links) the pathspec fact, and copies the consumer-only variant — excludes `.asd/**` under self-hosting. | Replace with a link to `external-review.md`'s two-row table. |
| 3 | medium | `t_stack.html:4-5`, `t_tech-reference.md:4-5` | Both still delegate decisions to the removed `adr/` tree; `t_stack.html` also excludes architecture decisions while being named a legitimate fold target. | Repoint `delegates_to`; adjust `owns`/`excludes` so stack.html is a matchable fold target. |
| 4 | medium | `t_config.yaml:15` | Comment still says "adr.html + persistent ADR" — stale vs README's corrected wording. | Sync the comment to README. |
| 5 | medium | `sprint-lifecycle.md:83` + 4 agent files | AC-source phase list omits impl-test; 4 agent files hardcode the PRD path with no sprint.md fallback. | Add impl-test to the phase list; add the fallback clause to the 4 agent files. |
| 6 | medium | `t_prompt-external-design.md:50,52` | External PRD rubric requires Goals/Non-goals the sprint draft never has. | Scope the two bullets to persistent-doc-only. |
| 7 | medium | `asd-phase-scope.md:19` + `t_config.yaml:10` vs `sprint-lifecycle.md:73` | Per-field fail-closed default stated twice outside rules, with no canonical home; the workflow's citation is false. | Add the sentence to `sprint-lifecycle.md` "Optional documents"; reduce the other two to a link. |
| 8 | medium | `core.md:27`, `sprint-lifecycle.md:63`, `asd-pm.md:68` vs `asd-phase-pr.md:40,88` | Self-hosting write allowlist claims to be exhaustive but omits `CHANGELOG.md`/`.gitignore`, both of which this sprint edited. | Add them to the allowlist, or restate the surface as "repo-wide minus generated views". |
| 9 | medium | `CHANGELOG.md:5-8` | Unreleased documents only the decisions-log move; several other consumer-facing (some breaking) changes are undocumented. | Extend at pr open with one bullet per break plus an ADR-tree migration note. |
| 10 | low | `asd-phase-impl-test.md:11` | Residual "api" word. | Replace with "API contract fold target(s)". |
| 11 | low | `t_html-shell.html:171-180` | Dead API CSS block. | Delete. |
| 12 | low | `t_ux-spec.html:50` | Broken relative DESIGN.md link from both possible locations. | Fix the relative path or drop the link. |
| 13 | low | `asd-phase-impl-review.md:26` | Cites review-policy.md "line 136" for text actually on line 140. | Cite by section name instead of line number. |
| 14 | low | `t_review-report.md:14` | Severity-floor enumeration omits `medium`. | Add it. |
| 15 | low | `t_decisions-log.md:12-30` vs `artifact-layout.md:197-210` | Entry-format block duplicated verbatim in two homes. | Keep one, point from the other. |
| 16 | low | `README.md:405` | FAQ cross-reference says "above", entry is below. | Fix direction. |
| 17 | low | `release-manifest.json:2` | `$comment` cites a `plans/` doc that's gitignored and doesn't exist in any copy. | Cite `providers.md` instead. |
| 18 | low | `asd-phase-plan.md:31` vs `:53` | Says "delegate to agent creator" — not a real agent name. | Name `asd-pm`. |
| 19 | low | `core.md:73`(pre-existing), `t_prompt-external-design.md:3`, `t_review-report.md:4` | Stale Codex-only framing for the now-symmetric wrapped-CLI mechanism. | Use "wrapped-CLI" phrasing. |

## Coverage summary (internal reviewers only)

**Summary**: `files: 59/59 checked, 0 n/a · rules: 22/22, 19 findings`

**n/a rows**: none — all 22 rubric rows resolved to pass or a finding (one item, digest-verification, is evidence-limited due to no shell access; noted as such, not n/a).

**Findings rows**:
| Rubric item | Finding |
|---|---|
| SSoT — each fact one home | finding #2, #5, #7, #15 |
| Template adherence — block matches new section set | finding #3, #19 |
| Framework mode — README config schema | finding #4 |
| Framework mode — rules internal consistency | finding #5, #7, #8, #13, #19 |
| Framework mode — agent↔workflow dispatch targets real | finding #18 |

## Verdict
CONCERNS: 19 (2 high, 7 medium, 10 low)

## Next action
Route to `impl` review-fix mode. #1 and #2 must not reach `pr` — as written, phase skills can't perform sprint-mandated writes and External Review would exclude the whole framework diff in this repo.

## Escalations
None.
