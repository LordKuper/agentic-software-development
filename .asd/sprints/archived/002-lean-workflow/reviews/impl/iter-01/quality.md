[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 1

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/skills/asd-phase-design/SKILL.md:5`, `asd-phase-design-review/SKILL.md:5`, `asd-phase-design-promote/SKILL.md:5` vs `.asd/workflows/asd-phase-design.md`, `asd-phase-design-review.md`, `asd-phase-audit.md`, `asd-phase-impl-review.md` | Tasks 15/16/1 make the phase workflow the file writer (inline state.json+decisions-log writes; workflow-assembled audit.md; workflow-written review files), but no phase skill grants a write tool — all seven `asd-phase-*` skills lack `Write`/`Edit`. The inline writes cannot execute under Claude Code's permission model. | Add `Write Edit` to `claude.allowed-tools` of every phase skill the workflows now name as an inline/assembling writer (audit, design, design-review, design-promote, plan, impl, impl-review); run `node .asd/sync.js --apply`. |
| 2 | medium | `.asd/workflows/asd-phase-impl-review.md:29` vs `.asd/agents/asd-reviewer-ui.md:23` | The Task-13 UI-surface predicate has two divergent definitions — workflow excludes `.asd/`, agent carve-out does not. | Give the predicate one home (`review-policy.md` DoD section); have both files link instead of restating. |
| 3 | medium | `.asd/agents/asd-external-review.md:53` vs `.asd/rules/external-review.md:45,51` | Agent hardcodes only the consumer pathspec, no self-hosting branch — in this repo it would exclude the entire change surface. | Replace with a pointer to `external-review.md` "`<pathspec>` for impl-review". |
| 4 | medium | `.asd/rules/external-review.md:22-23`, `.asd/agents/asd-external-review.md:85-86` | Here-doc/here-string delimiter breakout risk: untrusted diff content inlined into a shell heredoc/PowerShell here-string could terminate it and inject commands. | Use a randomized, content-checked delimiter or pipe the payload via stdin rather than inline literal text. |
| 5 | medium | `.asd/workflows/asd-phase-design-promote.md:27`, `asd-phase-impl-test.md:11`, `.asd/agents/asd-architect.md:16` | Residual `api` document-type references after Task 9 deleted it (design-promote domain list, impl-test read list, architect Role line). | Drop `api` from these three sites. |
| 6 | medium | `.asd/templates/t_stack.html:5`, `.asd/templates/t_tech-reference.md:5` | Dangling `delegates_to: … adr/ (decisions)` pointing at the removed persistent ADR tree. | Repoint both to the sprint-lifecycle.md fold rule / owning persistent doc. |
| 7 | medium | `.asd/templates/external-review/t_prompt-external-design.md:50,52` vs `.asd/templates/t_prd.html:10,18,47` | External design-review rubric still requires Goals/Non-goals on the sprint draft, which Task 7 removed. | Mirror the internal Documentation reviewer's carve-out into the prd.html rubric block. |
| 8 | medium | `.asd/workflows/asd-phase-design-promote.md:36,48` vs `.asd/agents/asd-ba.md:76` and `asd-ux-designer.md` | design-promote dispatches BA/UX-designer to write persistent `docs/`, but their write allowlists (and BA's explicit "never write persistent docs directly") forbid it. | Add promote-only targets to both allowlists; qualify the BA prohibition. |
| 9 | medium | `.asd/agents/asd-backend-dev.md:65`, `asd-frontend-dev.md:68` vs `plan.md:25` | plan.md assigns all HTML-template tasks to backend-dev, but backend-dev's write right covers templates "(non-UI/HTML)" only. | Widen backend-dev's self-hosting clause to cover framework HTML templates (documentation artifacts, not product UI) — matches the plan's own AG-6 reasoning. |
| 10 | medium | ~24 sites across `review-policy.md`, `sprint-lifecycle.md`, `checkpoints.md`, 7 workflows, 2 SKILL.md descriptions, `asd-pm.md` | Sprint-local ids ("Task 14", "gap G-11", "audit R-10") leaked into permanent canon that ships to consumers who can never resolve them. | Keep the rationale, drop the id. |
| 11 | medium | `CHANGELOG.md:5-8` vs `backward_compat: migration` | Breaking changes beyond the decisions-log move (deleted t_api.html, removed persistent ADR tree, t_state.json field removal, reshaped templates) have no migration note. | Extend Unreleased with a migration block per break. |
| 12 | low | `review-policy.md:138`, `asd-phase-impl-review.md:31` | Both point to `t_state.json` for the `"skipped: <predicate>"` slot doc, but that file is comment-free JSON with no such documentation. | Repoint to `sprint-lifecycle.md` "State recovery". |
| 13 | low | `.asd/templates/t_html-shell.html:127-128,167,171-180` | Dead CSS left by this sprint's own deletions (API block, superseded/deprecated ADR statuses, a11y scope class). | Delete the three blocks. |
| 14 | low | `asd-phase-design.md:21`, `asd-phase-design-review.md:23`, `asd-phase-design-promote.md:18`, `asd-phase-audit.md:19` | No-op/collapsed-skip paths still dispatch PM for a write the sentence itself calls "no user decision requested" — contradicts Task 15's own inline-write pattern. | Convert to inline workflow writes. |
| 15 | low | `asd-phase-design.md:73` vs step 2 (line 21) | Return contract hardcodes `NEXT: design-review`, but the collapsed path emits `NEXT: plan`. | Change contract to `NEXT: <design-review \| plan>`. |
| 16 | low | `external-review/t_review-report.md:14` | Severity-floor placeholder omits `medium`. | Add `medium` to the enumeration. |
| 17 | low | `asd-test-engineer.md:31` | Cites `review-policy.md` "(manual verification rule)" but that rule's home moved to `artifact-layout.md` in Task 4. | Re-point the citation. |
| 18 | low | `external-review.md:34` | Tells a read-only External Review agent to append to decisions-log itself, contradicting its own no-write contract. | Reword to "the dispatching workflow/PM appends …". |
| 19 | low | `t_ux-spec.html:50` | Relative link to DESIGN.md is wrong from both the sprint-draft and promoted locations. | Use a root-relative or placeholder-resolved path, or drop the link. |
| 20 | low | `asd-architect.md:100` vs `:106-107` and `.gitignore:20` | Output format still instructs authoring `architecture.html` as committed output, contradicting the new gitignored-build-output rule. | Mark it build-command output, never authored/committed by the agent. |
| 21 | low | `AGENTS.md` § Architecture/Conventions | Stale "sticky TOC sidebar" and "every artifact has a t_-prefixed template" claims after Tasks 9/11. | Qualify both sentences. |
| 22 | low | `asd-stack/SKILL.md:129` | Tells authors to park speculative items in ADR future-considerations, which is now sprint-scoped and lost at archival. | Route speculative items to a durable home (stack.html or stubs.md). |
| 23 | low | `asd-phase-pr.md:38` | Task-18 skip condition keys on HEAD-equality that later commits (impl-review artifacts, phase=pr write) immediately invalidate. | Key the skip on content diff instead of HEAD identity. |
| 24 | low | `t_review.md:8`, `external-review/t_review-report.md:8` | `{{PHASE}}` placeholder collides with `core.md`'s definition (phase name) vs `review-policy.md`'s required form (`impl`/`design`). | Use a distinct placeholder name for the verdict-token phase component. |
| 25 | low | `README.md:405` | FAQ cross-reference says "above" but the referenced entry is below. | Change to "below". |

## Coverage summary (internal reviewers only)

**Summary**: `files: 59/59 checked, 0 n/a · rules: 24/24, 25 findings`

**n/a rows**: none — every scoped file and rubric item resolved to checked/pass or a finding.

**Findings rows**:
| Rubric item | Finding |
|---|---|
| Security — injection (command / path / prompt) | finding #4 |
| Security — auth / authorization bypass (write-allowlists, read-only enforcement) | finding #1, #8, #9 |
| Contracts — signature/contract drift between canon homes | finding #2, #3, #5, #6, #7, #10, #12, #17, #18, #24 |
| Contracts — breaking change without migration | finding #11 |
| Best practices — dead code / dead assets | finding #13 |
| Best practices — SSoT | finding #2, #17, #18 |
| Best practices — internal consistency of agent/template contract | finding #14, #20, #21, #22 |
| Best practices — resolvable cross-references | finding #5, #6, #12, #25 |

## Verdict
CONCERNS: 25

## Next action
Route to `impl` review-fix mode. Finding #1 is blocking — until the phase skills can write, the inline-write contract Tasks 1/15/16 depend on is inert.

## Escalations
None. Findings #9 and #11 are judgment calls for the fixing dev (documented resolution given in the Suggested-fix column), not user escalations.
