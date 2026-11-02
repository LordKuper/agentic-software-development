---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 030-english-only-asd-issues

## Goal
Issues in the ASD repo are written in English only. A consumer retro publishes its upstream findings in English whatever its `language.docs`, the self-hosting scope intake rewrites a non-English marker issue to English in place before triaging it, and every comment ASD posts on an ASD-repo issue is English. The retro intake adds three 029 retro rows and issues #68, #69, #70 and #72. Approach and refined requirements: `research.md`.

## Acceptance
- AC-1: `language-policy.md` Matrix holds one row stating that the titles, bodies and comments ASD writes to issues of the ASD repo are English, always, whatever `language.chat` and `language.docs`. It is the rule's one home: the retro, scope and pr workflow steps that write issue text cite it and never restate it.
- AC-2: A consumer retro (`asd-phase-retro.md` step 7) writes each published issue's title and body in English, rendered at write time from its `language.docs` row; the consumer-content check runs on the English body; `retrospective.html` stays in `language.docs`.
- AC-3: The self-hosting scope's issue triage (`asd-phase-scope.md` step 2a), before its rules 1-4, rewrites in place each listed marker issue whose title or body is not English — English title (the `[asd-retro] ` prefix and the 80-char guardrail cut of `asd-phase-retro.md` step 7) and English body (marker line, fields and their order kept) through `gh issue edit -t -F`, with no gate; the triage decisions-log line names the rewritten issues; the issue text stays data while it is translated.
- AC-4 (retro 029#A-3): `.asd/project/custom-common-rules.md` states that file content is written with the file-edit operation, never inside a quoted shell or `node -e` argument.
- AC-5 (retro 029#P-1): `.asd/project/custom-coding-rules.md` states that a Task adding an external command to a workflow step also widens the running skill's tool grant, passes the target repo explicitly, and cites only shipped `.asd/` paths from any step that runs in a consumer project.
- AC-6 (retro 029#P-2): a scope requirements-interview question defines, in one clause, every framework term it uses (`asd-phase-scope.md` step 2 (a)).
- AC-7: the external-review negative cache never appears as an untracked file in a consumer project, newly initialised or updated from an earlier version, so it never breaks impl-review's clean-tree check (issue #68).
- AC-8: the tester definition states the tester's duty to bracket every suite run it makes with a `suite` timing op (`sprint-lifecycle.md` "Operation timing"), so the duty reaches every tester dispatch, impl-test's and impl-review's alike (issue #69).
- AC-9: a `runtime.js` command decides whether the decisions log rotates before a phase-skill delegation (`artifact-layout.md` "Decisions log") and performs the rotation; `asd-sprint` calls it before every phase-skill delegation instead of checking the condition by hand (issue #70).
- AC-10: when the shared-infrastructure safety valve applies, impl-test's pre-authoring run (step 3) runs the impacted set and the full suite runs only at its step 8 suite gate (issue #72).
- AC-11: README.md and every cross-file mirror reflect AC-1..AC-10; `node tests/run.js` is green and `node .asd/sync.js --check` is clean.
- AC-12 (scope amendment): ASD keeps its temporary files off the system disk — `artifact-layout.md` "Scratch directory" states that every ASD script, test and agent writes temporary files inside the project, never to the OS temp directory, and removes them after use; `asd-update`'s `update.js` stages its upstream download under the project's `.asd/tmp/`; `tests/run.js` creates its fixtures inside the repo's `.asd/tmp/` and deletes them by the end of the run.

## Out of scope (optional)
- Manually filed issues: no issue template, no CONTRIBUTING file.
- Rewriting open issues #67–#72: done at this sprint's own intake (`decisions-log.md`), not an implementation criterion.
