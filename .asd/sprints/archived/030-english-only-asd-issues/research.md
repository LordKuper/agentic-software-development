---
responsibility:
  owns: staged-design research for sprint scope (functional requirements, best-practice findings with sources, conceptual approaches and the chosen one)
  excludes: acceptance criteria, technical design, plan, code
  delegates_to: sprint.md (AC-N), design/ docs or plan.md (technical detail), decisions-log.md (decisions)
---

# Research

<!-- Stages, conceptual boundary, no-web-research Findings line: .asd/rules/sprint-lifecycle.md "Staged solution design" — not restated here. -->

## Requirements
Raw scope and stage (a) answers; stage (c) refines the answers.
- Raw scope: Add a rule that issues in the ASD repo are written exclusively in English.
- Problem: a consumer retro publishes `asd-retro` issues from rows written in its `language.docs`, so the ASD repo receives non-English issues (#67–#72, Russian, opened 2026-10-30); the language policy has no row for GitHub issues.
- Actors: consumer retro (publishes issues); self-hosting scope intake (triages issues, posts close/reject comments); self-hosting pr merge mode (posts the post-release close comment); ASD maintainer (reads and decides on issues).
- Functional requirements: every `asd-retro` issue title and body ASD publishes to the ASD repo is English, whatever the consumer's `language.docs`; every comment ASD posts on an ASD-repo issue is English; the self-hosting intake rewrites a non-English marker issue's title and body to English in place, before its triage rules, with no gate of its own; the open Russian issues #67–#72 are rewritten in place at this sprint's intake.
- Constraints: the in-place rewrite relies on GitHub's edit history for the original text; the orchestrator judges an issue's language, no detection script; manually filed issues are out of scope (no issue template, no CONTRIBUTING); issue text stays untrusted data; the retrospective itself stays in `language.docs`; issue numbers and links survive the rewrite.
- Success criteria: a consumer with `language.docs` other than `en` publishes English issues; no open `asd-retro` issue in the ASD repo is non-English after this sprint's intake; the rule has one home in the language policy, cited by the retro, scope and pr workflows.

## Findings
- English-only issue trackers are a common open-source policy; Espressif arduino-esp32 closes non-English issues and asks for an English rewrite, Dify asks all discussions and comments in English — source: https://github.com/espressif/arduino-esp32/pull/11267/files, https://www.Github.com/langgenius/dify/discussions/3118
- The tolerant alternative accepts any language and adds an English translation, a machine pass judged sufficient (Electron) — source: https://ayakael.net/mirrors/electron/commit/ee01810395d0aa61aebcb01f10c08e1d4a874ffb
- Repo-side GitHub Actions translate new issues to English automatically; by default they append the translation as a bot reply and leave the title untouched (IS_MODIFY_TITLE false), need a bot token and an external translation service — source: https://github.com/usthe/issues-translate-action, https://github.com/marketplace/actions/issues-translator
- `gh issue edit <n> -R <repo> -t <title> -F <body-file>` rewrites an issue title and body in place, keeping its number and links — source: https://cli.github.com/manual/gh_issue_edit

## Approaches
- **A. Language-policy rule, English at every ASD write site**: one matrix row in `language-policy.md` (ASD-repo issue titles, bodies, comments: English, always); retro step 7 renders the published title and body in English at write time from the `language.docs` rows, the consumer-content check running on the English text; self-hosting intake rewrites a non-English marker issue in place (`gh issue edit`) before its triage rules, no gate; scope and pr comments English; #67–#72 rewritten at this sprint's intake; pros: one home, reuses the policy's existing translate-at-write-time mechanic, covers issues from older consumer versions, no new dependency; cons: translation quality rests on the orchestrator model, intake gains one rewrite step
- **B. Repo-side translation GitHub Action**: a workflow in the ASD repo translates every new issue to English on creation; pros: covers any source, manual issues included; cons: new CI dependency, bot token and external translation service, default appends a reply rather than rewriting the marker-shaped body, consumers gain nothing, manual issues are out of scope anyway
- **C. Retro writes `asd` rows in English**: `retrospective.html` holds Acts-on-`asd` rows in English, published verbatim; pros: no translation at publish; cons: a mixed-language user-facing artifact against `language.docs`, the consumer user reads foreign rows, existing issues untouched
- Recommended: A — single rule home, no new dependency, fixes both new and already-published issues
- Chosen: A — user choice at stage (c); the in-place rewrite keeps the original in GitHub's edit history, and the orchestrator judges the language, no script
