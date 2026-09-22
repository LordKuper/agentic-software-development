---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 015-glings-retro-003-review-scope

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | a201d2881f0e59a59f19134bccbe4f492877d159 | full change surface |
| 2 | 1464b4159d5b0c2c70fc6724743644b1e53bee57 | delta since entry 1 |
| 3 | 685d63932087144cece49ba6bfff0520178efb4d | delta since entry 2 |

## Risk → check decisions

Rows from earlier entries are in `test-plan.entry-01.md` and `test-plan.entry-02.md`.

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `draftSnapshot` / `draft-snapshot` CLI (7566611, EXT-1) | design-review iteration 2+ reviews the wrong drafts: every draft (no narrowing), none after a real change, or none when the previous snapshot is missing. Or the snapshot is never written, so iteration 2 has nothing to compare against | CLI in a temp dir | add | covers iteration 1 (all drafts), unchanged (empty), one changed (only that one), missing `--previous` file (all drafts), and the persisted snapshot's keys. It also pins that design-review step 7 passes `--files`/`--out`/`--previous` |
| `asd-phase-impl-review.md` step 1: `git -c core.quotePath=false diff --name-only` (8ff548e, F-2) | a non-ASCII scope path is printed C-quoted, so it matches nothing as a pathspec and drops out of the reviewers' `.diff` | the canon command, run in a temp git repo | add | the command is taken from step 1 and run over a `docs/résumé.md` commit, with host git config isolated (`GIT_CONFIG_NOSYSTEM`, empty `GIT_CONFIG_GLOBAL`) |
| `asd-phase-design-promote.md` step 4: creator re-dispatch (ba6c232, P2-2) | the pre-fix sequence comes back: a parallel creator is expected to pause mid-run for the orchestrator's git step | static | add | one assert in the sprint-015 AC-6 block: after `` `git rm` `` the step re-dispatches the creator and names step 5 |
| `asd-ba.md` / `asd-ux.md` "propose, never perform" Don'ts line (ba6c232, P2-2) | the line is deleted, and the creator returns no proposal for design-promote to gate | static | add | one assert per agent in the existing AC-6 loop, which checks `- Never` + `rename` + `propos` separately |
| `asd-phase-audit.md` step 5: the audit-exit skip is user-initiated (05888b5, P2-1) | the standalone prompt at every audit exit comes back, against the user's P2-1 decision | static | add | one assert in the AC-8 block, on the step-5 sentence that holds `document skip`. It checks `user request`, `never` and `prompt` separately |
| `runtime.js` `dispatchWaves` / `assertReviewerUnion` deleted (8c0cedd) | stale test or plan rows still point at them | grep | none | no test references either one. Both are recorded `resolved` in `test-plan.entry-01.md`. `review-policy.md` now cites `reviewerFiles`, which the AC-2/AC-3 test covers |
| `runtime.js` `surfaceCheck` comment → doc-comment (8c0cedd) | — | none | none | a comment-only change. The arithmetic it describes is still pinned by the AC-11 test |
| `external-review.md` / `review-policy.md` wording on the snapshot and the reviewer union | prose drift | none | none | no literal token here that any other site mirrors. The executable half (snapshot) is the `draft-snapshot` row above; the union half is a `reviewerFiles` property the AC-2/AC-3 test already asserts |
| `asd-phase-scope.md` step 3a: full `"<doc> skipped this sprint by user"` log line (e3a8801, P2-3) | — | static | extended | the AC-8 assert captured only the suffix, which the pre-fix line also held; the capture now spans the full `<doc> skipped this sprint by user` literal (review-fix iter-02, TST-3) |
| README.md / CHANGELOG.md wording (2d30b99, e3a8801) | — | none | none | release-note and readme prose, with no mirror token. AC-12's version-heading assert still holds |

## Removed tests

None this entry.

## Added tests

In `tests/run.js`. Each proof: mutate, run the suite, restore in the same call, and byte-compare. `upstream_hashes`/`canon_hashes`/`sync --check` ledger noise is not counted. Every mutation also turns the ledger tests red (these are managed_paths files).

| Test | Regression proof (first failing assertion) |
|---|---|
| new: sprint-015 AC-2 (EXT-1) draft-snapshot | `filter(before[file] !== hashes[file])` → `return files` → exit 1, `an unchanged draft set leaves iteration 2+ nothing to review` |
| same | filter on `before[file] === undefined` (presence only, ignores content) → exit 1, `iteration 2+ reviews only the draft whose content changed since the previous snapshot` |
| same | missing previous → `hashes` instead of `{}` (with `--previous` given) → exit 1, `a missing previous snapshot widens to every draft, never drops one` |
| same | `fs.writeFileSync(out, …)` removed → exit 1, `ENOENT: … iter-1.json`. The thrown read comes before the keys assert |
| same | `--previous` dropped from design-review step 7 → exit 1, `design-review step 7 must run draft-snapshot with the flags this test drives, or iteration 2+ never narrows` |
| new: sprint-015 AC-4 (F-2) scope-list quotePath | step 1 command back to `` `git diff --name-only` `` → exit 1, `the scope list must carry the raw path: a C-quoted one matches nothing as a pathspec and drops out of the reviewers' .diff` |
| extended: AC-6 re-dispatch | step 4 back to pre-fix "then the creator updates content and inbound links." → exit 1, `AC-6 (P2-2): after the git operation the creator is re-dispatched before step 5 awaits it - a parallel dispatch cannot pause mid-run for git` |
| extended: AC-6 BA/UX Don'ts | line deleted from `asd-ba.md` → exit 1, `AC-6 (P2-2): asd-ba proposes a doc rename or deletion …`. Same for `asd-ux.md` → `… asd-ux proposes …`. Reworded to "Never delete or rename one of your persistent docs; return it as a proposal …" → the test stays green (ledger noise only), so the assert does not lock the wording |
| extended: AC-8 audit exit | step 5 back to pre-fix "First offer the per-sprint document skip …" → exit 1, `AC-8 (P2-1): the audit-exit document skip is user-initiated, never a standalone prompt on an adaptive or mechanical exit`. Reworded to "is applied only when the user requests it or step 4 already awaits a decision; it is never prompted for on its own …" → the test stays green, so the assert does not lock the wording |
| extended: AC-8 scope log line (TST-3) | step 3a back to pre-fix `"skipped this sprint by user"` → exit 1, `AC-8: the skip records the full "<doc> skipped this sprint by user" decisions-log line the scope workflow writes verbatim, doc placeholder included, and never touches config.yaml`. Before the capture fix the same mutation stayed green |

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve: `.asd/runtime.js` is framework-wide infrastructure)
- Pre-strategy (entry 3, HEAD 351dd3ff159744f3b9013ab50f63572580fc9726, before any edit): 211/211 passed, exit 0
- Result: pass. 213/213 passed, 0 failed, 0 skipped, exit 0 (HEAD 351dd3ff159744f3b9013ab50f63572580fc9726 plus this entry's test edits)
- Lint / build: lint (`git diff --cached --check`) pass. Build (`node .asd/sync.js --check`) pass: exit 0, `ok: true`, 0 items not current
- Review-fix iter-02 (TST-3, over c1438ca): 213/213 passed, exit 0; build and lint pass
- Entry 2 record: 211/211 at 9452acf, then 211/211 after review-fix iter-01 over 7566611

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|
| D-1 | 1 | .asd/runtime.js | AssertionError [ERR_ASSERTION]: bound 25: a scope of 25 test files emits 5 internal-review parts plus External Review, above the 5 dispatches the cap-override request tells the user to approve | sprint-015 AC-11: surface-check dispatches bounds the impl-review dispatches its bound implies - every internal reviewer's emitted parts, Testing's --test-plan path included, plus External Review - and the override request quotes that field | fixed | e3baf5b |

No new defect in entry 3.
