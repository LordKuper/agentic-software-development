---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference
[sprint.md](./sprint.md)

## Touched areas
- `.asd/workflows/asd-phase-scope.md` steps 2, 2a, 4: issue triage (self-hosting only, `-R` from `release-manifest.json` `repo`, rules 1-4, label writes, dispositions) — AC-1..AC-3, AC-5..AC-7.
- `.asd/workflows/asd-phase-pr.md:24,31`, `.asd/templates/t_pr-description.md:19-20`, `.asd/rules/git-strategy.md` "Versioning & Changelog": `Refs #N` only, post-release close under self-hosting — AC-4.
- `.asd/rules/language-policy.md` Matrix (one issue row, ASD repo English) — AC-3; `.asd/rules/checkpoints.md` gate inventory rows on intake dispositions and gate-free closes — AC-1..AC-3, AC-6.
- `.asd/runtime.js` timing (`timingRequest` 1344, `timingCloses` 1359-1370, `timingAppend` 1384-1404, `timingCommand` 1427) — AC-9, AC-13; `persistReview` 593-627 (writes review files only, never `state.json`) — AC-14.
- `.asd/workflows/asd-phase-impl-review.md` L7, 24, 25, 40, 41, 55, 59-61 and `asd-phase-design-review.md` L23, 36, 37: hand-written `verdicts` / `latched` / `iteration` / `iteration_heads` — AC-14.
- `.asd/rules/external-review.md:13,22` and `.asd/agents/asd-external-review.md:58-59,100`: heredoc under Claude Code, prompt "never written to disk" — AC-8.
- `.asd/rules/sprint-lifecycle.md` "Impacted test set" :128 (reuse), "Operation timing" :276, :280, "APPROVE latch" :99-109; `.asd/rules/artifact-layout.md` "Test plan" :201 (review-fix tester grant: Risk and Added tests only); `.asd/templates/t_test-plan.md:49-63` (`Scope: impacted | full`, written by impl-test and impl-review only); `.asd/agents/asd-tester.md:37-38,75`; `asd-phase-impl.md` step 5 — AC-10, AC-11.
- `.asd/rules/agent-protocol.md` "Dispatch payload" reviewer keys (`manifest`, `diff`, `floor`, `iteration`, `interrupted`); review workflows' payload lists; `t_review.md:20` is the header's only home — AC-12.
- `README.md` :15, :245, :254, :345, :485-486; `docs/architecture/tech-reference/gh-2.90.md:15-41`; `tests/run.js` content-contract and unit tests named below — AC-15.

## Existing docs found
- [gh 2.90 tech reference](../../../docs/architecture/tech-reference/gh-2.90.md): command surface; convention "every call names the repo with `-R`, taken from `.asd/release-manifest.json` `repo`, never the current checkout's remote" (:35); "a consumer never labels" (:41).
- [stack.html](../../../docs/architecture/stack.html): stack overview; no issue or timing content in scope.
- [README.md](../../../README.md): FAQ "Do my retro findings about ASD reach the framework?" (:485-486) describes the ASD-repo triage only.

## Existing implementation found
- Issue triage exists for `[asd-retro]` issues of the ASD repo under self-hosting only (`asd-phase-scope.md:41-47`); dispositions and label writes (:53) are reusable for project issues.
- `asd-phase-scope` and `asd-phase-pr` skill grants hold unrestricted `Bash` (`.asd/skills/asd-phase-scope/SKILL.md:5`, `asd-phase-pr/SKILL.md:5`), so consumer-mode `gh` calls need no grant widening.
- Timing already skips an already-closed id and re-closes a recovered one as `continued`; only a never-opened id still appends an unpaired close (`runtime.js:1362-1366`).
- `sync.js` exports `parseCanonicalFrontmatter` (:130-150, :1534) and `VARIANT_SUFFIXES` (:972); `runtime.js` already requires `sync.js` (:1641).
- `persist-review` validates the findings header by column count and `#` first cell, not header text (`runtime.js:551-558`).
- The suite reuse rule exists (`sprint-lifecycle.md:128`); no runtime code parses `Suite run`.

## Gaps
- No step lists non-marker issues or any issue of a consumer project's own repo; no repo resolution from `origin` (AC-1, AC-2, AC-5).
- No closing path for a consumer's included issues: pr writes `Refs #N` only (AC-4).
- Matrix has no row for comments on a consumer project's own issues (AC-3).
- Scope has no user authorisation step before the first triage write, and no deliverability check of retro-derived ACs (AC-6, AC-7).
- External Review has no file-fed stdin form for Claude Code (AC-8).
- `timing --open --kind dispatch` takes attrs verbatim; the runtime reads neither `task_routing` nor agent frontmatter (AC-9).
- `Suite run` Scope is set by invocation, not by what ran (AC-10); the review-fix tester may not write `Suite run` (AC-11).
- No reviewer payload key carries the findings header (AC-12).
- No runtime writer of `verdicts` / `latched` (AC-14).

## Risks
- AC-4 closing keyword: GitHub closes the issue only when the PR merges into the default branch; a `git.base_branch` other than the default leaves it open. Mitigation: plan states a fallback close in consumer merge mode for an issue still open after the merge.
- AC-9 model attr: an agent's frontmatter holds a Claude and a Codex model; the runtime cannot tell the host from the ledger. Mitigation: plan fixes how the host is chosen (a flag or env) and what is recorded when unknown.
- AC-14 latch carve-outs: `"APPROVE (skipped: …)"` never latches, a late admission clears a latch, and red-suite and amendment clears stay elsewhere; a single command must keep each rule (`sprint-lifecycle.md:99-109`). Mitigation: plan enumerates every write site moving to the command and every one staying.
- AC-1 large trackers: a consumer with hundreds of open issues lengthens the scope gate; the existing 200 limit and the `deferred` label bound it.
- AC-8 removes a stated safety property ("never written to disk"); the file sits in git-ignored `.asd/tmp/` and is deleted after the run, which `artifact-layout.md` "Scratch directory" already allows for helper files.
- Planned test changes: `tests/run.js:8796-8799` (no closing keyword), :8886-8888 (exactly one Matrix issue row), :2509 (heredoc rows), :7771-7773 (unmatched close recorded), :6510 (review-fix grant) assert text these criteria change deliberately.
