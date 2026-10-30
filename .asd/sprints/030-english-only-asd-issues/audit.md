---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

An absent optional section below means an empty finding set for that section, never an unperformed check (`.asd/workflows/asd-phase-audit.md` "Rules"). Omit any optional section entirely when it has no findings — never emit a placeholder row.

The main orchestrator writes all applicable sections. Product/domain ambiguity a source can resolve is resolved from it; ambiguity only authority or preference can settle goes to the user.

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/rules/language-policy.md` "Matrix": AC-1 row for ASD-repo issue titles, bodies, comments.
- `.asd/workflows/asd-phase-retro.md` step 7: AC-2 English title and body.
- `.asd/workflows/asd-phase-scope.md` step 2 (a): AC-6 term clause; step 2a "Issue triage": AC-3 in-place rewrite before rules 1-4; step 4 reject comment: cites AC-1.
- `.asd/rules/git-strategy.md` "Versioning & Changelog (self-hosting only)": post-release close comment cites AC-1.
- `docs/architecture/tech-reference/gh-2.90.md`: AC-3 adds `gh issue edit -t -F` (orchestrator-owned persistent doc).
- `.asd/project/custom-common-rules.md`: AC-4. `.asd/project/custom-coding-rules.md`: AC-5.
- `.asd/rules/external-review.md` "Detection and negative cache", `.asd/runtime.js` external cache, `.asd/skills/asd-init/SKILL.md`, `.asd/migrations/`: AC-7.
- `.asd/agents/asd-tester.md` "Rules", `.asd/workflows/asd-phase-impl-test.md` "Rules", `.asd/workflows/asd-phase-impl-review.md` "Rules": AC-8.
- `.asd/runtime.js` (new command), `.asd/skills/asd-sprint/SKILL.md` "Rules", `.asd/rules/artifact-layout.md` "Decisions log": AC-9.
- `.asd/rules/sprint-lifecycle.md` "Impacted test set", `.asd/workflows/asd-phase-impl-test.md` steps 2-3, `.asd/agents/asd-tester.md` "Rules": AC-10.
- `README.md` (runtime command list, folder map), `tests/run.js`, `CHANGELOG.md`: AC-11.

## Existing docs found
- [GitHub CLI (gh) @ 2.90](../../../docs/architecture/tech-reference/gh-2.90.md): lists `gh auth status`, `gh issue create`, `gh issue list`, `gh issue close`, `gh issue edit --add-label`; no `gh issue edit -t/-F` entry. The only persistent doc in `docs/` bearing on a touched area.

## Existing implementation found
- `.asd/rules/language-policy.md` "Matrix": no row for GitHub issues; "User-facing artifacts" take `language.docs`, so a consumer retro's issue text follows it.
- `.asd/workflows/asd-phase-retro.md` step 7.1-7.3: body fields and the `[asd-retro] <guardrail cut to 80 chars>` title come from step 6's `language.docs` rows; no language instruction; the consumer-content check (7.2) reads that body.
- `.asd/workflows/asd-phase-scope.md` step 2a "Issue triage": rules 1-4 judge shape, duplicates and resolution; nothing reads an issue's language; close and reject comments (`-c`) are free text.
- `.asd/rules/git-strategy.md:91`: the post-release close comment is the English literal `Released in v<asd_version>: <release url>`.
- `.asd/rules/external-review.md:29`: canonical cache path `.asd/project/external-cache.json`, described as gitignored; this repo's `.gitignore:22` lists it; `asd-init` step 14 seeds `.gitignore` only for likec4 `dist/`; no migration (`4.0.0`-`14.0.0`) adds the cache entry.
- `.asd/runtime.js` `scratchDir()`: `.asd/tmp/` ignores itself through its own `.gitignore` (`*`) — an existing self-ignoring location.
- `tests/run.js:2451-2515`: external-cache tests pass the cache path as input, so a path change does not touch them.
- `.asd/agents/asd-tester.md` "Rules": no suite-op duty; it is stated in `asd-phase-impl-test.md` "Rules" (line 57) and `asd-phase-impl-review.md` "Rules" (line 76, terminal run).
- `.asd/skills/asd-sprint/SKILL.md:61` and `artifact-layout.md` "Decisions log" "Rotation": the rotation condition is prose the orchestrator evaluates by hand; `runtime.js` `main()` has no rotation command.
- `.asd/rules/sprint-lifecycle.md:122` safety valve: degrades every scoped run to the full suite; `asd-phase-impl-test.md` step 2 makes the impacted set the scope of steps 3 and 8; `asd-tester.md:33` applies the valve "before every scoped run", per-batch reruns included.
- `README.md:332`: the folder-map line enumerates every `runtime.js` command; README has no language matrix mirror (only the config sample).
- `tests/run.js:8671-8683`: sprint-029 content contracts pin retro step 7's marker and `-t "[asd-retro] ` literals and scope triage's title-prefix and shape wording.
- `.asd/project/custom-common-rules.md`, `custom-coding-rules.md`: neither holds the 029#A-3 or 029#P-1 rule.
- `.asd/workflows/asd-phase-scope.md` step 2 (a) and `sprint-lifecycle.md` "Staged solution design" (a): no term-definition clause.

## Gaps
- AC-1: the Matrix row; the issue-writing sites cite it.
- AC-2: retro step 7 renders title and body in English and runs 7.2 on that text.
- AC-3: a rewrite step ahead of triage rules 1-4 and the rewritten ids in the triage decisions-log line; `gh-2.90.md` gains `gh issue edit -t -F` — an orchestrator write, its own plan line, not a dev Task subtask.
- AC-7: no mechanism keeps the cache untracked in a consumer.
- AC-8: the tester definition lacks the duty; the two phase-rule statements become cites.
- AC-9: a runtime command, its tests, the `asd-sprint` rule and `artifact-layout.md` citing it, README's command list.
- AC-10: the valve's reach in `sprint-lifecycle.md`, `asd-phase-impl-test.md` and `asd-tester.md`.
- External dependency gaps: none — `gh issue edit -t/-F` exists (https://cli.github.com/manual/gh_issue_edit).
- Migration gaps: AC-7 `.asd/project/external-cache.json` in an existing consumer: untracked → ignored or relocated, by a release migration (`backward_compat: migration`) versioned at or below the bumped `asd_version`.

## Risks
- `.asd/project/**` is outside the impl-review and External Review change surface (`sprint-lifecycle.md` "Self-hosting"), so AC-4/AC-5 edits get no review: impact=an inaccurate rule ships unreviewed; mitigation=plan quotes the retro guardrails verbatim, a `tests/run.js` content-contract assert pins each line.
- AC-7 relocation or removal of a consumer's cache: impact=a lost negative cache costs at most one retry; a migration touching a consumer file it does not own; mitigation=only the ASD-owned cache file is touched, cleanup must not treat a relocated cache as a sprint scratch file.
- AC-10 narrows a mandatory safety valve: impact=a shared-infrastructure regression is caught at step 8 instead of before authoring; mitigation=step 8 and impl-review's terminal full suite stay full.
- AC-2/AC-3 translation: impact=a mistranslated guardrail or consumer detail surviving; mitigation=7.2 checks the English text; issue text stays data, the rewrite keeps the original in GitHub's edit history.
- AC-9 command writes sprint files: impact=a wrong rotation splits or loses the live log; mitigation=rename + recreate only, commit stays with `asd-sprint`, tests cover both cycle and non-cycle transitions and an entry-free live file.
- Content contracts at `tests/run.js:8671-8683`: impact=AC-2/AC-3 edits breaking pinned literals; mitigation=keep the marker, `-t "[asd-retro] ` and triage wording.
