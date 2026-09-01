[REVIEW-impl-quality]: CONCERNS

# Review — quality

- **Phase**: impl-review
- **Iteration**: 1

> Note on method: no shell access in this reviewer's tool policy, so the diff was reconstructed read-only from the working tree — every scoped file was inspected for both remaining `design`-spelled occurrences and newly introduced `docs`-spelled ones (patterns `design[/\\]`, `docs/`, `docs\\`, `exclude)`, `docs/(prd|adr|ux-spec|c4-full|design-md-delta)`), plus full reads of the highest-risk files. `node tests/run.js` / `sync.js --check` could not be executed here (see rule-coverage rows).

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/templates/t_config.yaml:13` and `README.md:227` (same string also at out-of-scope `.asd/project/config.yaml:15`) | Out-of-scope occurrence was renamed. The comment column of the `documents:` block names *the sprint draft artifact* + its persistent counterpart — siblings are `audit: # <sprint>/audit.md`, `adr: # adr.html + persistent ADR`, `c4: # c4-full + persistent C4`. The original `# design/prd.html + persistent requirements` therefore denoted the sprint draft `<sprint>/design/prd.html`, an AC-3 exclusion, not the persistent root. It now reads `# docs/prd.html + persistent requirements`, which (a) violates AC-3 / sprint.md "Out of scope", (b) names a path that exists nowhere in the new layout (the persistent PRD counterpart is `docs/product/requirements/<subsystem>.html`, per `artifact-layout.md:46-48`), and (c) makes the line self-contradictory by naming a persistent path on both sides of the `+`. Ships to every consumer via `t_config.yaml` and is mirrored in README. | Restore the sprint-draft spelling in all three locations: `prd: enabled  # <sprint>/design/prd.html + persistent requirements` (or bare `prd.html` to match the `adr.html` / `c4-full` sibling style). Keep `.asd/project/config.yaml:15` in the same edit even though it sits outside the review pathspec — otherwise the three copies diverge. |
| 2 | low | `.asd/templates/t_plan.md:23-25` | Relative links now read `../../docs/product/requirements/…`, `../../docs/architecture/adr/…`, `../../docs/ux/…`. From the file these render into — `.asd/sprints/<NNN-slug>/plan.md` — `../../` resolves to `.asd/`, so the targets point at `.asd/docs/…`, not the repo-root `docs/` tree; correct depth is `../../../`. Pre-existing (the pre-rename `../../design/…` was equally broken) and knowingly preserved per audit G-5 / plan Task 2 ("preserve the `../../` prefix exactly"), so this is not a regression introduced by the rename — but the lines are in the diff and the links are dead. `t_ux-spec.html:49` is *correct* and needs no change (it is written relative to the promoted `docs/ux/<subsystem>.html`). | Change the three prefixes to `../../../` in `t_plan.md:23-25`. If PM judges this beyond the pure-rename scope (AC-2 says only the leading segment may differ), defer it to a follow-up sprint and record the deferral — do not silently re-litigate. |

## Coverage ledger (mandatory — verdict INVALID if incomplete; see `review-policy.md`)

### File coverage

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked |
| `.asd/rules/core.md` | checked |
| `.asd/rules/sprint-lifecycle.md` | checked |
| `.asd/rules/checkpoints.md` | checked |
| `.asd/rules/language-policy.md` | checked |
| `.asd/rules/design-system.md` | checked |
| `.asd/rules/review-policy.md` | checked |
| `.asd/rules/external-review.md` | checked |
| `.asd/templates/t_config.yaml` | checked — finding #1 |
| `.asd/templates/t_plan.md` | checked — finding #2 |
| `.asd/templates/t_ux-spec.html` | checked |
| `.asd/templates/t_audit.md` | checked |
| `.asd/templates/t_commands.yaml` | checked |
| `.asd/templates/t_test-plan.md` | checked |
| `.asd/templates/t_sprint.md` | checked |
| `.asd/templates/t_design-md-delta.yaml` | checked |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked |
| `.asd/templates/t_AGENTS.md` | checked |
| `.asd/agents/asd-architect.md` | checked |
| `.asd/agents/asd-ux-designer.md` | checked |
| `.asd/agents/asd-frontend-dev.md` | checked |
| `.asd/agents/asd-backend-dev.md` | checked |
| `.asd/agents/asd-test-engineer.md` | checked |
| `.asd/agents/asd-reviewer-ui.md` | checked |
| `.asd/agents/asd-reviewer-documentation.md` | checked |
| `.asd/agents/asd-reviewer-quality.md` | checked |
| `.asd/agents/asd-reviewer-performance.md` | checked |
| `.asd/agents/asd-reviewer-testing.md` | checked |
| `.asd/agents/asd-reviewer-implementation.md` | checked |
| `.asd/agents/asd-ba.md` | checked |
| `.asd/agents/asd-pm.md` | checked |
| `.asd/agents/asd-external-review.md` | checked |
| `.asd/skills/asd-init/SKILL.md` | checked |
| `.asd/skills/asd-design-system/SKILL.md` | checked |
| `.asd/skills/asd-stack/SKILL.md` | checked |
| `.asd/skills/asd-concept/SKILL.md` | checked |
| `.asd/skills/asd-update/SKILL.md` | checked |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked |
| `.asd/workflows/asd-phase-design-promote.md` | checked |
| `.asd/workflows/asd-phase-design.md` | checked |
| `.asd/workflows/asd-phase-plan.md` | checked |
| `.asd/workflows/asd-phase-impl.md` | checked |
| `.asd/workflows/asd-phase-impl-test.md` | checked |
| `.asd/workflows/asd-phase-impl-review.md` | checked |
| `.asd/workflows/asd-phase-audit.md` | checked |
| `README.md` | checked — finding #1 (mirror) |
| `AGENTS.md` | checked |
| `CHANGELOG.md` | checked |
| `.asd/release-manifest.json` | checked (structure + ledger key completeness; hash *values* not recomputable read-only — see rule coverage) |

### Rule coverage

| Rubric item | Status |
|---|---|
| Bugs — off-by-one | n/a: no executable logic in diff (prose/config/markdown only) |
| Bugs — null/undefined paths | n/a: no executable logic in diff |
| Bugs — race conditions | n/a: no concurrent code in diff |
| Bugs — unhandled errors | n/a: no error-handling code in diff |
| Bugs — resource leaks (handles, sockets, db) | n/a: no resource acquisition in diff |
| Bugs — timezone/locale assumptions | n/a: no date/locale logic in diff |
| Bugs — broken/dangling path & link references (applies here in place of the above) | finding #1, finding #2 |
| Security — secrets in code or logs | pass: no credential, token, or URL-with-secret introduced; only public URLs (`github.com/google-labs-code/design.md`, repo URL in manifest) |
| Security — injection (SQL, command, XSS, path traversal) | pass: the only command text touched is the commented `designmd-*` aliases in `t_commands.yaml` / `asd-init/SKILL.md` — literal, no interpolation, no new shell metacharacters; `external-review.md`'s heredoc/here-string stdin invocation was not modified |
| Security — auth/authorization bypass | n/a: no auth surface in this repo |
| Security — input validation at trust boundary | n/a: no input-parsing code in diff |
| Security — crypto misuse | pass: only sha256 digests in the manifest ledger, unchanged mechanism |
| Contracts — API signature drift from ADR | n/a: `documents.adr: disabled` in this repo's lean profile; no ADR to drift from |
| Contracts — schema migration reversible | pass: rename is reversible; CHANGELOG documents the inverse-able `git mv design docs` step |
| Contracts — breaking change without migration when `backward_compat != none` | pass: `backward_compat: migration`; `CHANGELOG.md:8` marks BREAKING and gives the ordered consumer migration (`git mv` → fix consumer `commands.yaml` aliases → `/asd-update` → `/asd-sync`) plus the split-brain-window warning (AC-9) |
| Contracts — agent write-access allowlist neither narrowed nor widened | pass: `asd-architect.md:65`, `asd-ux-designer.md:70`, `asd-ba.md:61` each retain the identical entry set with only the root segment changed; sprint-draft entries (`<sprint>/design/…`) correctly untouched; generated `.claude/`/`.codex/` mirrors agree |
| Contracts — git pathspec atomic set R-4 consistent across all three homes | pass: `.asd/rules/external-review.md:51`, `.asd/agents/asd-external-review.md:53`, `.asd/templates/external-review/t_prompt-external-impl.md:14` all read `':(exclude)docs/**'` / "`.asd/**` and `docs/**` excluded"; grep `exclude)design` returns zero; generated `.claude/agents/asd-external-review.md:46` and `.codex/agents/asd-external-review.toml:41` match |
| Out-of-scope rename check — `<sprint>/design/` draft folder preserved | pass: all occurrences intact across rules, agents, workflows, templates; no `<sprint>/docs`, `reviews/docs`, `docs-review`, `docs-promote`, `asd-phase-docs*` anywhere |
| Out-of-scope rename check — `design`/`design-review`/`design-promote` phase names and `asd-phase-design*` skill/workflow/dispatch names preserved | pass |
| Out-of-scope rename check — protected file names (`DESIGN.md`, `design-system.html`, `design-principles.md`, `design-system.md`, `custom-design-rules.md`, `t_design-md-delta.yaml`, `@google/design.md`) preserved | pass |
| Out-of-scope rename check — sprint-draft artifact references not converted to persistent-root spelling | finding #1 |
| Completeness — no in-scope `design/` or `design\\` occurrence left behind | pass: every residual hit in scoped files is a documented exclusion (`<sprint>/design/`, `reviews/design/`, the `design/design-review` phase pair, `design/doc content`, protected file names); backslash set (`t_commands.yaml:21,23`, `asd-init/SKILL.md:101,103`) fully converted — grep `design\\ux` returns zero |
| Syntax integrity — JSON frontmatter (skills, agents) | pass: all edited `description` strings remain single-line, correctly quoted, no unescaped quote or brace introduced |
| Syntax integrity — JSON (`.asd/release-manifest.json`) | pass: balanced, well-formed; `managed_paths` untouched and still `.asd/`-only; `upstream_hashes` keys cover every expanded managed path (13 rules, 17 skills + `update.js`, 10 workflows, 15 agents, hooks, `sync.js`, all templates) with no gap |
| Syntax integrity — YAML (`t_config.yaml`, `t_commands.yaml`, `t_design-md-delta.yaml`) | pass: edits confined to comment text and quoted command strings; key/indent structure unchanged |
| Syntax integrity — Markdown tables, code fences, HTML fragments | pass: `artifact-layout.md` tree blocks, `sprint-lifecycle.md` / `external-review.md` / `checkpoints.md` / `README.md` tables and the README folder-map fence all keep column counts and fence pairing; `t_ux-spec.html:49` anchor tag well-formed |
| Best practice — mirror consistency (README folder map vs `artifact-layout.md`) | pass: `README.md:306-320` matches `artifact-layout.md:45-61` segment for segment |
| Best practice — SSoT (no new duplicated statement of the root path) | pass: rename only; no fact copied to a second home |
| Best practice — custom rule "canonical `.asd/agents|skills|hooks` edit followed by `sync.js --apply`" (`custom-coding-rules.md:14`) | pass: generated `.claude/agents/*`, `.codex/agents/*.toml`, `.claude/skills/*`, `.agents/skills/*` all carry the renamed root; no stale `design/architecture|ux|product` in any provider view |
| Best practice — custom rule "never hand-edit `.claude/`/`.codex/`/`.agents/skills/`" (`custom-coding-rules.md:15`) | pass: provider views are byte-consistent with canon in every spot-checked file; no view-only divergence found |
| Best practice — custom rule "zero-dependency Node in `sync.js`/`update.js`" (`custom-coding-rules.md:13`) | n/a: no JS file in scope |
| Nitpick categories deliberately dropped (not raised) | applied: the `"persistent docs/ docs"` / `"seeds infrastructure-only docs/ docs"` phrasing left by the G-1 reword (`t_plan.md:5`, `t_sprint.md:5`, `t_test-plan.md:5`, `review-policy.md:136`, `asd-init/SKILL.md:4`, several workflows) is awkward but unambiguous — pure wording polish, dropped per `review-policy.md` |
| Verification commands (`node tests/run.js`, `node .asd/sync.js --check`) | n/a: reviewer has no shell (read-only tool policy). AC-5/AC-6 evidence belongs to the Testing/Implementation reviewers; manifest hash *values* likewise unverifiable here — flagged for whoever can execute, not raised as a finding |

## Verdict
CONCERNS: 2

## Next action
impl-review routes the sprint back to `impl` in review-fix mode (`review-policy.md` — impl-review never fixes in place). `backend-dev` fixes finding #1 in all three copies of the string (`.asd/templates/t_config.yaml:13`, `README.md:227`, `.asd/project/config.yaml:15`), then re-runs the Task 9 → 10 → 11 tail: `node .asd/sync.js --apply <touched targets>` is not needed for these three files (no agent/skill canon touched), but the bare `node .asd/sync.js --apply` hash-ledger recompute (Task 10) and `node tests/run.js` (AC-6) must be re-run so `.asd/release-manifest.json` is not left stale. For finding #2, either apply the `../../../` fix or record an explicit deferral decision; do not leave it unresolved. Sprint then re-enters impl-review via `impl-test`.

## Escalations
- finding #2: borderline scope. AC-2 mandates that only the leading path segment change, so correcting the link depth is a deviation from the approved sprint scope (audit G-5 explicitly chose to preserve `../../`). PM should either accept it as a trivial in-diff fix or defer it to a follow-up — a user decision, not a dev judgement call.
</content>
