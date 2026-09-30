---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/testing.md (verdict)
---

# Test plan — sprint 022-release-at-merge

<!--
Written in impl-test, after the implementation exists. First entry writes this file fresh;
every re-entry AMENDS it (append/update rows) — never a full rewrite. Defects rows persist
(resolved ones kept for the record). Narrative rows of prior entries rotate into
test-plan.entry-NN.md: .asd/rules/artifact-layout.md "Test plan". Change surface is not restated here — it's the diff
itself (`git diff --stat`), computed by asd-phase-impl-test.md step 2 (full on entry 1, delta
since the prior entry's `HEAD analysed` on re-entry).
Rules: .asd/rules/sprint-lifecycle.md (impl-test phase), .asd/rules/code-style.md §17.
-->

## Entry log

Appended each entry, never rewritten. `HEAD analysed` is the commit the strategy/prune passes
were scoped through; the next re-entry's delta is `git diff <this sha>...HEAD`.

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 6659c2a | full change surface |
| 2 |  | delta since entry 1 |

## Risk → check decisions

All checks are static canon-consistency assertions in `tests/run.js` unless the row says otherwise; the hook row executes the hook. Mutation ids (`M-N`) are listed under "Added tests".

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| git-strategy.md release commit: merge commit's `asd_version` above its parent's plus a `## v<asd_version>` heading, else the first later base commit passing it, else `FAILED` with recovery (external #1) | a PR merged before open mode's bump reads as released through the previous version's tag | static relation | add (to the `sprint-022 AC-1 (D2)` test) | Parent read derived from the merge-commit `git show` span. Heading derived from open mode's `## v<version>`. Follow-up span needs `--reverse`, the `<merge_commit>..origin/<git.base_branch>` range and the manifest pathspec, since newest-first picks a later sprint's bump. The `FAILED` clause names a follow-up PR bumping `asd_version` with its CHANGELOG section. The retry condition names "release commit" at git-strategy, the home and Step 1. Proofs R1, Ma–Mf, R2, R4 |
| Tag created only when absent locally, pushed only when absent on `origin` (external #2, combined #4) | a tag left by a failed push blocks every retry | static | add (same test) | The create part of the tag clause, before the `git push` span, carries a `refs/tags/v<asd_version>` check and no `ls-remote`. The push part keeps the entry-1 `ls-remote` assert. Proof R1 |
| Release retry becomes a user decision each time: retry, or continue recorded `decision_actor: user` in the closing sprint's decisions log (combined #1 plus user answer) | a failing release holds every new sprint; a continue goes unrecorded | static relation | add (same test) | Home: the retry sentence requests a user decision each time, its continue clause names the decisions log with `decision_actor: user`, and the next sentence sends continue to the new-sprint flow. Scope step 1's decisions-log clause carries that actor span. Step 1: user decision each time, a continue clause, and Step 2A on the next line. Operations: Request user decision names Step 1's route (`release retry`), and Run command names the follow-up search's `git log`. Proofs R2, R4, R6, Mf–Mm; rewords Gs, Gt stay green |
| `floor_base` A scoped to the current `waves.json` division (combined #2) | a pre-rollback record rebases the re-divided wave: floor pinned low, cap extended | static relation | add (to the `sprint-022 AC-7 (D4)` test) | The "latest" clause of "Scope amendment" step 3 names a `waves.json` span and the division. The rollback reset line must name that same span; re-division itself is already the sprint-017 D3 assert. review-policy may restate the selection only with that scope. Proofs R2, R3, Mq, Mr |
| Merge mode step 2 split: self-hosting release, then every-project no-write, then `NEXT: done` (combined #3) | a consumer project reads no no-write rule and no terminal emit | static order | add (to the `sprint-021 AC-1/AC-2 (D1), sprint-022 AC-1/AC-2/AC-3` test) | Order: release, then the `archive move` sentence, then `NEXT: done`. Scope: under a step that opens with the `self_hosting: enabled` label, the no-write sentence says every project. A restructure that drops the label passes. Proofs R5, Mo |
| Merge step 1 `MERGED` → step 2, and "PR phase" Modes: a confirmed `MERGED` number enters merge mode whatever `pr` holds, skipping open mode's DoD (combined #5) | `gh pr merge` on a merged PR ends `FAILED`; a `pr=null` retry fails open mode's DoD | static | add (same test) | Step 1's `MERGED` sentence names step 2. The Modes sentence carrying `MERGED` and merge mode names `pr` and the DoD. Proofs Mn, Mp, R2 |
| asd-phase-pr step 2 "which first confirms a base commit carries this sprint's version bump" | — | — | none | A pointer into the release paragraph, whose check is pinned above. Nothing is decided at this site |
| sprint-lifecycle "Self-hosting" Versioning line "on the base commit carrying that bump"; "State recovery" "its release retry" | — | — | none | Summary pointers citing the pinned homes (git-strategy, "Merged-unclosed"). A literal pin would lock the summary's wording |
| README pr row "while it is missing, each `/asd-sprint` asks to retry it or continue without it" | README drifts from the retry decision | — | none | The row shares no token with the home: it does not name the release commit, the route or `decision_actor`. Any relation would compare prose. It becomes assertable if the row names the route (`release retry`). Its exits stay pinned by the entry-1 README assert |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|

## Added tests

The mutation ids are `node .asd/tmp/mutate2.js` runs. Each is one canon edit → `node tests/run.js` → exit 1 → a byte-equal restore in the same process. `R-N` restores the whole file from `git show ca370c3~1:<path>`, the pre-fix blob. The failing test and message are the first FAIL line after the expected ledger noise (`upstream_hashes`/`canon_hashes`, `sync.js --check`). Every run restored byte-equal, and the suite was 262/262 after them.

| Test | Regression proof |
|---|---|
| `sprint-022 AC-1 (D2), iter-01 external #1/#2, combined #1: …` (added asserts) | R1 git-strategy.md = pre-fix → "external #2: the tag is created only when it is absent locally (refs/tags/v<asd_version>)…"; Ma parent read removed → "external #1: … the release commit's asd_version must be compared with its parent's"; Mb `## v<asd_version>` → "a matching heading" → "…must also carry the CHANGELOG heading open mode adds"; Mc `--reverse` dropped → "…yields to the FIRST later base commit touching the manifest…"; Md recovery text dropped → "…FAILED naming the recovery, a follow-up PR…"; Me "the release commit, " dropped from the retry condition → "external #1: \"no release commit\" is a missing release…"; R2 sprint-lifecycle.md = pre-fix and Mf (home "no release commit" clause dropped) → "\"Merged-unclosed\": external #1: \"no release commit\"…"; Mg "requests a user decision, each time: retry" → "routes it" → "\"Merged-unclosed\": combined #1 (user answer 2026-09-30)…"; Mh `decision_actor: user` → `orchestrator` → "\"Merged-unclosed\": the continue option is recorded in the decisions log as the user's decision"; Mi "and on continue, " dropped → "a continue choice enters the new-sprint flow"; R4 asd-sprint SKILL = pre-fix → "asd-sprint Step 1: external #1: \"no release commit\"…"; Mj "request user decision, each time — " dropped → "asd-sprint Step 1: combined #1…"; Mk continue clause dropped → "the continue option takes the next route, the new-sprint flow (Step 2A)"; Ml Operations "release retry or continue" dropped → "Request user decision must list the release retry choice"; Mm Operations `git log` dropped → "Run command must list git log…"; R6 asd-phase-scope.md = pre-fix → "asd-phase-scope.md step 1: the closure write's decisions-log entry names a continue choice… (decision_actor: user)". Reword Gs ("each time, request user decision") → only ledger noise, test green. Reword Gt ("On continue, and otherwise,") → same |
| `sprint-022 AC-7 (D4), iter-01 combined #2: …` (added asserts) | R2 → "AC-7: \"Scope amendment\" step 3 takes A from the latest record accepted since the current waves.json division…"; Mq the division clause dropped → same message; Mr "and a fresh `waves.json` overwrites the old" dropped → "the division-scoped A retires pre-rollback records only because the rollback reset overwrites waves.json…". The first Mr, which also cut "re-divides", fired the sprint-017 D3 assert too, so the duplicate `re-divides` half was dropped from the new assert. R3 review-policy.md = pre-fix → "review-policy.md points at \"Scope amendment\" for A; a restated selection must carry its waves.json division scope" |
| `sprint-021 AC-1/AC-2 (D1), sprint-022 AC-1/AC-2/AC-3: …` (added asserts) | R5 asd-phase-pr.md = pre-fix → "sprint-022 iter-01 combined #3: under a step opening with the self_hosting condition, the no-write rule and NEXT: done must be re-scoped to every project"; Mo `NEXT: done` emitted before "Then, every project:" → "combined #3: pr merge mode step 2 publishes the self-hosting release, then states the no-write rule, then emits NEXT: done"; Mn "go to step 2" → "go to the release" → "combined #5: … merge step 1 must send an already-MERGED PR straight to step 2"; Mp ", skipping open mode's DoD gate" dropped, and R2 → "combined #5: … \"PR phase\" Modes: a dispatch carrying a confirmed MERGED number enters merge mode whatever pr holds…" |

## Suite run

Written twice per cycle: `impl-test`'s suite gate records an **impacted-set** run here each entry
(`.asd/rules/sprint-lifecycle.md` "Impacted test set"); `impl-review`'s terminal step overwrites
it with the cycle's one **full-suite** run once the last review wave's reviewers are
APPROVE/latched. The `pr` gate always reads whatever is recorded here last — the full-suite
record, by the time `pr` runs. Each per-entry record measures only the tree that entry
analysed, not any tree produced later
(`.asd/rules/sprint-lifecycle.md` "Impacted test set").

- Command: `node tests/run.js`, unscoped: the shared-infrastructure safety valve fires on the runtime, hook and rule-doc changes
- Scope: full
- Result (entry 2): pass — 262/262 (exit 0). The pre-strategy run at the same HEAD was also 262/262, exit 0: the review fix left every entry-1 pin green, so none of its changes was pinned until this entry. The count is unchanged because entry 2 only adds assertions to existing tests
- Lint / build: pass — `git diff --cached --check` clean on the commit's paths; `node .asd/sync.js --check` `ok: true`, 74/74 `current`
- HEAD: f82b573 plus this entry's uncommitted `tests/run.js`. The entry's own test commit lands after this record, so the terminal full suite is the first run at a HEAD that contains it

## Defects

Code defects found by the suite. Resolved in `impl` test-fix mode. `Entry` through `Failing test` are never edited once written — the stalemate check compares them (`.asd/rules/sprint-lifecycle.md` "Impl-test phase"). One table only: append rows, never a second `## Defects` section — the check fails on one.

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None. Every AC is a canon or executable contract, pinned above. The live release is owned by this sprint's `pr` merge mode.
