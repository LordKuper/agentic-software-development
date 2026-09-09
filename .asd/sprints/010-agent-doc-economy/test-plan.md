---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 010-agent-doc-economy

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | af784cc | full change surface |
| 2 | 92e433c | delta `af784cc...92e433c`: D-1's fix (`7501224`), the AC-10 scope addition (`b81fd7e`), sprint bookkeeping |

**Impacted set = full suite** (`sprint-lifecycle.md` "Impacted test set", safety valve). The surface touches `.asd/runtime.js`, `.asd/sync.js`, `.asd/release-manifest.json` and every rule doc — framework-wide files by definition. `commands.yaml` carries no `test_affected`, so no native selector overrides it.

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `runtime.js` `--write` stamps `row_example` | a published manifest field left outside the digest is editable on disk after stamping; every ledger citing that digest still validates | unit | add | the `manifest-digest` CLI test amended: pins the stamped field set through the untouched `fingerprint` primitive, then sweeps *every* field `--write` stamps for digest coverage, so a third constant is covered the day it lands |
| `runtime.js` `row_example` equality + backward-compat branch | adding the second published constant invalidates every manifest stamped when only `vocabulary` existed | unit | add | the `validate-ledger` backward-tolerance test amended: parametrised over both constants, plus the mixed legacy fixture (`vocabulary` present, `row_example` absent) built from `fingerprint`, not from the digester under test |
| `runtime.js` `LEDGER_ROW_EXAMPLE` content | an example the validator rejects teaches every reviewer a ledger shape that fails the blocking gate — visible only as a re-dispatch | unit | add | new test fills the placeholders and validates the row; the status is keyed to `LEDGER_VOCABULARY.p`, not to a literal |
| `sync.js` Claude `effort` validation | an invalid effort renders into a generated view and the host silently ignores it, so canon, README and the tier matrix all claim an effort the agent never ran at | unit | add | new test covers the vocabulary boundary (`ultra` is Codex-only), absence, Codex asymmetry, and the field's emission condition — **found D-1** |
| AC-9 / G-12 rule-doc list | `core.md` "See also" and the `AGENTS.md` copy drifted two entries and stayed green for sprints; Task 10 replaced the copy with a pointer | static | add | new test asserts the index is a bijection with `.asd/rules/*.md` **and** that neither `AGENTS.md` nor `t_AGENTS.md` re-lists the docs beside the pointer — the invariant after Task 10, not the list-against-list check G-12 first described |
| AC-7 economy rule (`artifact-layout.md`) | a second home for the cut-or-keep procedure; or the rubric bullet stated as prose, which never reaches the blocking ledger | static | add | new test: sole-home sweep over canon for the three named tests, both pointer sites, and `Documentation economy` resolving as a rubric **id** under review-policy.md's G-9 derivation |
| AC-1 wave declaration (4 sites) | `impl` re-deriving its own order discards the isolation rule silently — the F-1 failure itself | static | add | new test binds definition → plan workflow → impl steps 5/6 → template slot, keyed on citations and on the inter-wave barrier |
| AC-5b authorised-paths diff read | placed in the fix-mode-only step, initial mode loses the gate; duplicated, the two copies drift | static | add | new test locates it inside the all-modes step 9 block and asserts it appears exactly once in the file |
| AC-2 whole-tree command ban | the `custom-coding-rules.md` mirror silently falls behind as the ban grows | static | add | the staging-prohibition sole-home test amended: the command list is **derived** from git-strategy.md's own clause and each member required in the mirror |
| AC-3 co-author agent memory | an author who cannot stage a co-held file is covered by nobody, so the write never reaches the reviewed diff | static | add | the `AC-13b` agent-memory commit test amended across its three sites (owner, definition, reachability pointer) |
| AC-4 availability skip | a review that never ran is recorded nowhere the retro reads | static | add | the External Review outcome-contract test amended; keyed to the same `sprint-lifecycle.md` "Friction log" citation every phase workflow carries |
| AC-6a enforcement split | one workflow keeps the transcription branch, the other rejects — or an interrupted dispatch is re-encoded into a verdict it never returned | static | add | the interrupted-dispatch test amended: the bounded-at-one and never-supplies-missing-evidence clauses, plus both workflows' acting sites and the interrupted-dispatch exclusion |
| AC-6a partition semantics (which of the eight classes re-encoding can fix) | a wrong partition mislabels a return | — | none | The workflow branches on the re-run, not on the class ("So the re-run, not a failure message, decides which half"), so no code reads the partition. The safety property that makes transcription safe — a re-encode cannot manufacture evidence — is the helper's, and is already covered by the compact-ledger fraud test (identity, completeness, predicate and finding-reference fraud). A test of the partition would assert my own re-encoder |
| AC-5a fail-first mutation must be restored (`code-style.md` §17) | a mutation left on disk ships as authored work | — | none | Single home, no mirror: no file restates the bullet, so there is no drift surface to assert. Whether an agent restored a mutation is runtime behaviour no suite observes; the acting checks are AC-5b's gate (covered above, its diff read is what catches an unrestored mutation) and `asd-reviewer-testing` reading this file |
| AC-8 corpus audit (`audit.md`, 23 `E-N` + 12 `C-N`) | a finding neither applied nor deferred | — | none | Sprint artefact with no enumerable canonical mirror; disposition is recorded per finding in `decisions-log.md` and checked by the impl-review Documentation reviewer. Nothing here is a literal token in a tracked file |
| ~18.7 KB of prose deleted from agents, skills, workflows, README | a deletion takes a load-bearing instruction with it | static | keep | Every literal the suite pins is re-checked by the full run below — that is what a green suite does prove here. It does not prove the deletions safe (`plan.md` Risks, `audit.md` R-6); that judgement is the Documentation reviewer's, now under the rule this sprint landed |
| generated `.claude/`, `.codex/`, `.agents/skills/` views | a canon edit not resynced ships a stale view | static | keep | `node .asd/sync.js --check` (the `build` command) plus the `--check` reports every item current test; 72/72 current |
| `.asd/release-manifest.json` hash updates | a tracked source whose recorded hash no longer matches | static | keep | Existing `canon_hashes` / `upstream_hashes` tests cover both directions |
| **Entry 2** — `sync.js` D-1 fix (`7501224`): the effort check moved to its emission site | the check regresses to a sibling-guarded position and an agent declaring `effort` without `model` renders unvalidated again | unit | keep | Already covered: the entry-1 test's last case *is* the emission-site path (`effortWithoutModel`), and it is what failed at entry 1. Re-proven fail-first at this HEAD against `7501224^`. Amended with a fixture guard only — see Added tests |
| `sync.js` variant render path (`variantMeta`) | a task variant declaring an effort with no model slips past the emission-site check | — | none | No second path exists to test: `variantMeta` rejects a variant whose `claude.model` is not a string, and variants render through the same `transformAgentClaude` line the fix now guards. A test here would assert the fixture, not the code |
| AC-10 authoring reach (`artifact-layout.md` rule body, `code-style.md` §1, `providers.md` role table) | the rule's home is granted to a role that never authors under it — or `code-style.md` §1 goes on naming SSoT alone, leaving the economy rule review-only for the two roles that read §1 at all | static | add | The reach claim is a table sweep, not a judgement: every `providers.md` role row whose context is a fixed list must grant `artifact-layout.md` (the one row that grants per consulting question is the derived exemption), guarded by a row-count assert so a parse miss cannot pass vacuously. Plus the home carrying both sides (authoring obligation and `FAIL` consequence), and §1 enumerating every `(iron rule)` heading the home declares |
| AC-10 obligation restated in the eleven agent bodies | a per-agent copy re-homes the rule the sprint just gave one home | — | none | Declined deliberately, not overlooked: such a copy would be reworded, so a literal sweep would miss it while reporting coverage — the class of assertion `code-style.md` §17 rejects. The copy that would actually drift is the three-test *procedure*, already swept across all canon Markdown by the AC-7/G-9 test |
| `code-style.md` §1 rewording (`b81fd7e`) vs the entry-1 sole-home sweep | the sweep stops reaching the file the AC-10 edit touched | static | keep | Re-proven at this HEAD: inserting a `**removal** —` restatement into §1 still fires `.asd/rules/code-style.md must cite the economy rule rather than restating its three tests`. The new bullet cites the home, it does not copy it |

## Removed tests

None. Every test covering the change surface was re-read against `code-style.md` §17's prune criteria: no duplicate, trivial, mock-confirming or implementation-coupled test was found among them, and the sprint's deletions removed no prose any test pinned — evidenced by the entry run, whose single failure was the AC-6b contract change below, not a pin on deleted text.

## Added tests

| Test | Regression proof |
|---|---|
| `runtime.js CLI: manifest-digest … --write stamps every published constant … each digest-covered` (amended) | fail-first at HEAD `af784cc` (the pre-AC-6b field pin, the `--write` field-set assertion); coverage sweep additionally proven by stamping a third field and excluding it from `coverageManifestDigest` — first failure: "--write stamped `extra_note`, so the digest must cover it" |
| `AC-5/AC-6b: validate-ledger tolerates a manifest predating each published constant …` (amended) | mutation: `row_example` excluded from `coverageManifestDigest` — caught, though the identity pin fires first, so the mixed-legacy row is proven by construction from `fingerprint` rather than by mutation |
| `AC-6b: the published row example is a row validateCoverageLedger accepts …` | mutation: dropped `p` from `LEDGER_ROW_EXAMPLE` — first failure: `rejected: files n/a predicate invalid: f-1`. This mutation also caught a defect in the test's own first draft (the fill supplied `p` unconditionally, so the example's key set was never exercised); fixed, then re-proven |
| `sprint-010 AC-9 (C-10): a Claude reasoning effort outside its vocabulary fails the render closed …` | fail-first against current behaviour → **D-1**. Its passing assertions are proven by the same run |
| `sprint-010 AC-9 (G-12): core.md "See also" is the rule-doc index …` | two mutations: (a) a rule doc dropped from "See also" — bijection assertion fires; (b) two rule docs re-listed in `t_AGENTS.md` — no-copy assertion fires |
| `sprint-010 AC-7/G-9: artifact-layout.md "Documentation economy" is the rule's sole home …` | two mutations: (a) rubric lead-in unbolded, so the entry stops being a derivable id — rubric assertion fires; (b) the three tests restated in `code-style.md` — sole-home sweep fires |
| `sprint-010 AC-1: the wave declaration is defined once …` | mutation: impl step 5 reverted to `from Task dependencies; topological sort` — first failure names the re-derivation. The legacy fallback clause is asserted positively, never by absence of the word `topological`, which survives on purpose |
| `sprint-010 AC-5b: the authorised-paths diff read is a condition of … the all-modes completion gate` | mutation: the bullet moved from step 9 into step 11 — gate assertion fires while the once-only count stays 1, so placement is what is proven |
| `AC-1/AC-2: … sole home of the staging prohibition` (amended) | mutation: `git stash` removed from the `custom-coding-rules.md` mirror — first failure names the un-mirrored command |
| `AC-13b/sprint-010 AC-3: … every agent-memory write whose author cannot commit it` (amended) | mutation: co-author clause removed from git-strategy.md's bookkeeping sentence |
| `AC-8/sprint-010 AC-4: … an availability skip reaches the friction log` (amended) | mutation: friction clause removed from external-review.md's skip bullet |
| `AC-6/sprint-010 AC-6a: … the bounded one-transcription enforcement branch` (amended) | mutation: `asd-phase-impl-review.md` step 7 reverted to a bare reject rule — first failure names that workflow as the acting site |

| **Entry 2** — `sprint-010 AC-10: the documentation economy rule carries both its authoring obligation and its review consequence in its own home …` | three mutations, each the test's first failure: (a) `artifact-layout.md` reverted to `b81fd7e^` — "the authoring obligation belongs in the rule's own home"; (b) `code-style.md` reverted to `b81fd7e^` — "naming one of 2 in the singular implies the other is review-only"; (c) the grant deleted from the `asd-ba` row — the per-role assert names `` `asd-ba` `` |
| `sprint-010 AC-9 (C-10): … wherever the field is emitted` (amended: fixture guard) | fail-first re-derived at this HEAD against `7501224^` — first failure "Missing expected exception: the emitted `effort:` line is guarded by `claude.effort` alone …", the new guard passing ahead of it, so the record stands. The guard exists because the case is a literal `replace` over the shared canon: reformat the canon and it silently re-runs the model-present path and stays green. Its own first draft (`!includes('"model"')`) went red at HEAD on the Codex `"model": "sol"` line — caught by the run, corrected before this record |

Every mutation was restored in the same tool call that read its failure; `git status` was clean of canon after each. Mutating any `managed_paths` file also reddens the `upstream_hashes` test — expected noise, not a second finding. Entry 2 restored from a scratchpad copy rather than `git checkout --`, so the bytes return exactly.

## Suite run

- Command: `node tests/run.js`
- Scope: full (safety valve, above — this repo's runner has no scoped mode either way)
- Result: pass — 178 passed / 0 failed / 0 skipped
- Lint / build: pass (`git diff --cached --check` clean on the staged set; `node .asd/sync.js --check` exit 0, 72/72 current)
- HEAD: 86398b2 — the entry-2 test commit; `92e433c` is the HEAD the delta was analysed through, and the run was re-verified green at `c36691f`, which changes no test

Entry 1 ran at `af784cc`: 176 passed / 1 failed, that failure being D-1 below. The suite has grown 171 → 178 across both entries; no test was removed.

## Defects

| ID | Location | Symptom | Failing test | Status | Fix commit |
|---|---|---|---|---|---|
| D-1 | `.asd/sync.js:286` (`transformAgentClaude`) / `:168` (`resolveModelFamily`) | The Claude `effort` vocabulary check runs only inside `if (c.model)`, but the `effort:` line is emitted under `if (c.effort)`. Canon declaring `claude.effort` without `claude.model` renders `effort: bogus` into `.claude/agents/<name>.md` unvalidated — the silent-ignore failure C-10 asked to close, and an asymmetry with the Codex side, where model and effort are both mandatory and always validated. Latent today (all eleven agents declare both), so no shipped view is currently wrong | `sprint-010 AC-9 (C-10): a Claude reasoning effort outside its vocabulary fails the render closed wherever the field is emitted, symmetrically with the Codex check` | fixed | `7501224` |
| D-2 | `.asd/runtime.js` `validateCoverageLedger` | `allowedNa` reads `manifest.n_a[<row-type label>]`, so a manifest keying `n_a` any other way degrades silently: every id resolves to an empty predicate set, each truthful `n/a` row is rejected as unauthorized, and the malformed manifest itself passes because the unknown-id guard iterates an empty object. Realized this iteration on all four manifests (`friction-log.md` F-1), visible only as three reviewer returns nobody could validate | T-1(b) — regression test authored by `asd-tester` in the following `impl-test` entry | fixed | `a8f4dcd` |

## Manual verification

None. No visual UI, third-party live integration or ux-feel surface in this change; every acceptance criterion resolved to an automated check or to a recorded `none` above.
