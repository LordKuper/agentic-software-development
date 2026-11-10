---
responsibility:
  owns: sprint scope, goal, top-level acceptance criteria
  excludes: task breakdown, design decisions, code, audit findings
  delegates_to: plan.md (tasks), design/ docs (decisions), audit.md (audit)
---

# Sprint 032-auto-sync-auto-merge

## Goal
Make an update through `asd-update` immediately run `asd-sync` with no user confirmation, and make the branch merge after PR creation run immediately too, with no confirmation and no additional `asd-sprint` invocation.

## Acceptance
- AC-1: `asd-sync` applies every `missing` and `stale` target with no user question; only a `modified-foreign` target takes a per-file decision (overwrite, keep, show diff) with the overwrite risk flagged. Standalone `/asd-sync` and the post-update run are one behaviour, no mode.
- AC-2: `asd-update`, interactive and sprint-mediated, delegates to `asd-sync` right after its own run, a partial update included and `--dry-run` excluded; no step leaves regeneration to a later manual `/asd-sync`, and the scope workflow's own post-update `--apply` goes.
- AC-3: `pr` open mode, once the PR exists and its bookkeeping is pushed, continues into merge mode in the same run: no user question, no halt and no further `/asd-sprint`, under `adaptive` and `strict` alike, `strict` keeping only its PR publication approval.
- AC-4: Merge mode merges only after the PR's checks finish green, allowing up to 60 s for checks to register and up to 30 min for them to finish; a PR with no checks after the grace merges.
- AC-5: A merge blocked by a failing check, a conflict, a branch-protection rule or the exceeded wait is reported, never forced; the PR stays open, the phase exits `await-merge`, and a later `/asd-sprint` resumes merge mode. No config key is added.
- AC-6: `pr` open mode deletes every `<scratch-dir>/<NNN-slug>-*` file the sprint wrote (retro 031#A-2).
- AC-7: `asd-external-review` renders Kept findings with the template's five-column header verbatim, the wrapped CLI's finding id and source inside the Description cell, and takes the severity floor only from the payload (retro 031#A-3, issue #83).
- AC-8: `.asd/project/custom-coding-rules.md` states that a runtime parser of a `language.docs` artifact checks its structure (column count, id column, machine tokens), never translated heading text (retro 031#P-1).
- AC-9: Audit writes `phase="audit"` on both the run path and the skip path (issue #80).
- AC-10: A sprint criterion that deliberately changes a canonical document is a planned change, not an audit contradiction, and a step 3b answer that changes a sprint criterion goes through Scope amendment with a new id (issue #81).
- AC-11: The story connectives in `t_prd.html` are placeholders rendered in `language.docs` (issue #82).
- AC-12: `memory-check` runs on every commit touching agent-memory files, a dev's or tester's own memory commit included (issue #84).
- AC-13: Below-floor observations stay out of the Findings table and the findings ledger; an APPROVE report carries an empty Findings table (issue #85).

## Out of scope
- GitHub auto-merge (`gh pr merge --auto`) and any config key for the merge or the sync.
- The `strict` PR publication approval.
- Cleaning scratch files left by earlier sprints.
