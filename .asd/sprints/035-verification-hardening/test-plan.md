---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/wave-<K>/iter-NN/quality.md (verdict)
---

# Test plan — sprint 035-verification-hardening

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | 4278709f | full change surface |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `latchRefresh` (AC-15) | a changed production file leaves a stale APPROVE latch, or a docs/test/sprint-artefact change wrongly clears one; per-reviewer vs no-manifest clearing; flat legacy node | component: CLI over a sandbox git repo | add | the clear decision rests on git diff, manifests and state layout together; no unit boundary smaller than the CLI shows it |
| `isCommentOnlyChange` (AC-15) | misreading code as a comment keeps a latch (unsafe direction): mixed hunk, unknown extension, shebang, `*/ code` | unit + component | add | one test drives the exported function for each family edge and the CLI for the end-to-end keep/clear |
| `triggerMatches`, `emit-manifest --checklist` (AC-2) | glob grammar (`*`, `**`, `**/`, comma list, anchoring); unmatched item reaching the ledger; absent file | unit + component | add | the grammar is the contract a checklist author relies on; the manifest fields are what the ledger gate reads |
| `--base-ref` in `context` and `emit-manifest` (AC-16) | rubric or bundle file read from the working tree instead of the ref; absent path crashing or silently kept | component: sandbox repo whose committed copy carries a sentinel | add | a sentinel present only in the committed copy proves the read source |
| `persist-review` markers `pre_existing`, `checklist` (AC-5, AC-2) | prefix match too loose; duplicate or missed CL ids | component: external-reviewer persist over a findings table | add | the findings JSON is the input `checklist-hits` and impl-review step 7b read |
| `checklistHits` (AC-4) | Last hit stamp touching other bytes or EOL; the 3-sprint edge off by one; critical item becoming a candidate; absent file created | component: CLI, LF and CRLF files | add | edge `>= 3` and byte preservation are not visible in prose |
| unknown-flag warning (AC-9) | warning changes exit status or output; a documented canon call warns spuriously | component + canon sweep | add | the sweep derives declared flag sets from `COMMAND_FLAGS` and checks every canon invocation against them |
| smoke step, `Smoke:` line, `none (smoke)` token (AC-3) | step, runner line and templates drifting apart | content contract | add | pins only the command, line and token literals |
| `safety_valve` across restating sites (AC-14) | a site still describing the always-on valve | content contract | add | named-site list from the plan; template key and home wording pinned |
| `issue` user-resolved kind (AC-5) | impl-review writing a kind the home does not list | content contract | add | kinds list parsed from the home, not hand-listed |
| Evidence routing differential row (AC-7) | row dropped or de-gated | content contract | add | one row, three literals |
| checklist home: template, section, both Paths maps, README, scope/retro (AC-2, AC-8) | a mirror missing | content contract | add | two Paths lines counted, not enumerated by prose |
| removed terms (mandatory-valve wording, user smoke check, dev-never-prunes parenthetical, second-derivation clause, test-plan non-list clause) | a survivor states the superseded rule | static: leftover-term sweep | add | entry-1 leftover-term check over canon, README, docs and agent memory, memory included: no hit on the tree, no memory hit |
| `asd-dev.md` re-read rule (AC-12); `t_tech-reference.md`, "Tech reference docs" (AC-13); `language-policy.md` row; review-policy `pre-existing`/`CL-N`/base-ref wording (AC-5, AC-2, AC-16); retro and scope intake prose (AC-4); `asd-init` smoke/valve prompts (AC-3, AC-14) | prose behaviour with no machine-checkable literal beyond what is pinned above | existing checks | none | the runtime-subcommand, phase-chain, README-mirror, template-shape and D13 load-ceiling checks already in `tests/run.js` cover the mirrors and byte budget; a further literal pin would only restate prose |
| `suite` op scope attr (AC-10): "Operation timing" `Kinds (attrs):` list vs the Suite run Scope values | the attr values drift from the template's Scope values; the tester definition naming a literal instead of citing the home | content contract | add | two lists that must stay equal, both parsed from their homes; the sprint-034 Suite run scope test checks the Suite run Scope, not the op attr |

## Removed tests

| Test | Reason | In change scope |
|---|---|---|
| none | no existing test in the change surface is redundant or implementation-coupled; the sprint changed none | yes |

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here.

| Test | Regression proof |
|---|---|
| tests/run.js: sprint-035 AC-15: latch-refresh clears the latch of each reviewer … | mutation `!isListed(file) ||` removed in `latchRefresh`: `node tests/run.js --filter "AC-15: latch-refresh clears"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-15: a changed file counts as code unless … | mutation `lines.every` → `lines.some` in `isCommentOnlyChange`: `node tests/run.js --filter "AC-15: a changed file counts as code"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-2: a trigger glob keeps * inside a path segment … | mutation `*` → `.*` in `globRegex`: `node tests/run.js --filter "AC-2: a trigger glob"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-2: emit-manifest --checklist adds each item … | mutation `checklist` spread dropped from the manifest: `node tests/run.js --filter "AC-2: emit-manifest --checklist"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-16: --base-ref reads each reviewer rubric … | mutation rubric read forced to the working tree: `node tests/run.js --filter "sprint-035 AC-16"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-5, AC-2: persist-review gives each finding … | mutation `startsWith` → `includes` for `pre-existing:`: `node tests/run.js --filter "AC-5, AC-2: persist-review"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-4: checklist-hits stamps the sprint … | mutation edge `>= 3` → `> 3`: `node tests/run.js --filter "AC-4: checklist-hits"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-9: a flag a command does not read warns once … | mutation warning filter made a no-op: `node tests/run.js --filter "AC-9: a flag a command does not read"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-9: every flag canon passes to a `node .asd/runtime.js` command … | mutation undeclared `--bogus` added to the impl-review `emit-manifest` call: `node tests/run.js --filter "every flag canon passes"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-3: impl-test step 10 runs `smoke` once … | mutation `none (smoke)` → `none` in step 10: `node tests/run.js --filter "AC-3: impl-test step 10"` → exit 1, that test (1 matched); control: reword "runs it once" → "executes it once": `node tests/run.js --filter "sprint-035 AC-3"` → exit 0 (1 matched); runs: 2 |
| tests/run.js: sprint-035 AC-14: safety_valve is read live … | mutation `safety_valve` renamed in `asd-phase-cleanup.md`: `node tests/run.js --filter "AC-14: safety_valve"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-5: the issue resolution kind … | mutation `issue` dropped from the kinds list: `node tests/run.js --filter "AC-5: the issue resolution kind"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-10: the `suite` scope values "Operation timing" lists … | mutation superseded `impacted`\|`full` restored in the `Kinds (attrs):` line: `node tests/run.js --filter "sprint-035 AC-10"` → exit 1, that test (1 matched); control: values reordered `named`\|`impacted`\|`full`: same command → exit 0 (1 matched); runs: 2 |
| tests/run.js: sprint-035 AC-7: the tester's Evidence routing … | mutation oracle wording removed from the row: `node tests/run.js --filter "sprint-035 AC-7"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 AC-2: the reliability checklist has a template … | mutation one Paths-map line stripped of its marker: `node tests/run.js --filter "AC-2: the reliability checklist has"` → exit 1, that test (1 matched); runs: 1 |
| tests/run.js: sprint-035 leftover-term check … | mutation superseded `mandatory, not heuristic` restored in the valve home: `node tests/run.js --filter "sprint-035 leftover"` → exit 1, that test (1 matched); runs: 1 |

## Suite run

- Command: `node tests/run.js`
- Scope: full — review-fix combined-4: the named check `node tests/run.js --filter "sprint-035 AC-10"` passed (1/1), then every test file ran with no filter
- Result: pass — 391/391 passed, 0 failed, 0 skipped
- Lint / build: pass — `git diff --cached --check` and `node .asd/sync.js --check`
- HEAD: b5383e29172d605d1eb5aee920a8d5b9581f1358

## Defects

| ID | Entry | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|---|

## Manual verification (optional)

None: every AC is covered by an automated check.
