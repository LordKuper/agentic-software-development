[REVIEW-impl-testing]: APPROVE

# Review — testing

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium (low findings listed separately, excluded from verdict)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings at or above the medium floor | — |

### Below-floor observations (low — do NOT count toward verdict, no fix required this iteration)

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| L1 | low | `tests/run.js:962-964` | The allowlist exempts `AGENTS.md` for *any* non-`current` status, not only the expected `modified-foreign`. A future `missing`/`foreign` on `AGENTS.md` (managed-block markers deleted — `sync.js:1197-1201` returns `missing`) would pass silently. | Narrow to `!(item.target === 'AGENTS.md' && item.status === 'modified-foreign')`. |
| L2 | low | `test-plan.md` (Risk→check table) | AC-2 ("subtree under the renamed root unchanged: `docs/product/…`, `docs/architecture/…`, `docs/ux/…`") has no row and no mention anywhere in the document — the only AC without a traced check. Same class as iter-1 finding #3 (missing row), hence low. Factually discharged: I ran the positive-direction grep myself (below) and every `docs/<segment>` in scope is `product`/`architecture`/`ux`. | Add a one-line row citing the positive grep `docs/[A-Za-z0-9._-]+` → only `product`, `architecture`, `ux` second segments. |
| L3 | low | `test-plan.md:60` | Provenance wording is imprecise: "the underlying files were not touched again since that pass, only `test-plan.md`'s own record and `tests/run.js`'s fixture were edited in the review-fix pass" — the review-fix pass edited ~20 other in-scope files (`t_config.yaml`, `README.md`, four workflows, `CHANGELOG.md`, regenerated views, manifest; `decisions-log.md:104`). The grep results themselves are current (I reproduced them against HEAD), so the conclusion is right; only the sentence misstates what changed when. | Reword to "unchanged since the post-fix record committed in `430796f`, which already reflects all content commits `623818b`…`f8b9545`". |

## Verification of iteration-1 findings

| iter-1 finding | Status | Evidence gathered independently this iteration |
|---|---|---|
| #1 (medium) — drift assertion was a no-op | **Resolved, genuine** | `tests/run.js:950-965`: syntactically valid, no new `test(` registration. Field names verified against the producer: `sync.js:1229` pushes `{ target: <repo-relative POSIX path>, status }` for **every** plan item and `sync.js:1341` wraps it as `{ ok: true, items }` — so `item.target`/`item.status` are the right keys and `parsed.items` is never a filtered-to-drift subset. Non-vacuous: `buildSyncPlan` (`sync.js:1132-1166`) unconditionally pushes `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.codex/hooks.json` plus every discovered agent/skill/hook, so `items` cannot be empty. Genuinely fail-open→fail-closed: a stale generated view yields `statusFullFile` → `'stale'` (`sync.js:397-415`), which lands in `drifted` and breaks `assert.deepStrictEqual(drifted, [])`. Not a tautology — the allowlist is a single literal target, not a status wildcard over all items. |
| #2 (medium) — no over-rename inverse check | **Resolved, re-verified** | Row present in the risk table (`test-plan.md:39`) *and* in Suite run (`test-plan.md:63`) with a verbatim reproducible command, recorded in `430796f` — the last of the seven review-fix commits, i.e. after all content fixes `623818b`…`f8b9545` landed (`decisions-log.md:104`). I re-ran the inverse grep myself against HEAD (`reviews/docs|<sprint>/docs|docs-review|docs-promote|docs-system|docs-md-delta|asd-phase-docs|custom-docs-rules|docs-principles|DOCS\.md|docs/iter-`, case-insensitive, repo-wide): the only hits are inside `.asd/sprints/001-rename-design-to-docs/**` (the excluded path — test-plan/review prose quoting the pattern). **Zero hits outside `.asd/sprints/**`**, matching the record exactly. |
| #3 (low, below floor) | **Resolved, not silently dropped** | Task 8 (README/AGENTS mirror) row exists at `test-plan.md:38` with a stated `none` decision, a reason, and the finding-#3 provenance note. |
| #4 (low, below floor) | **Resolved, and the new claim is true** | `test-plan.md:41` now rejects the standing content-guard on value grounds and cites four places where `tests/run.js` already reads the live repo tree. Spot-checked all four: `:860` (repo's own manifest + sync-state load), `:950` (live `sync.js --check` spawn), `:1290`/`:1301` (canon-hash walk over the real tree, test starts `:1299`). Citations accurate, so the "structurally cannot" falsehood is genuinely retracted, not just softened. |
| #5 (low, below floor) | **Resolved, count verified** | `test-plan.md:14` says 8 and names them; `.asd/rules/` holds exactly 13 `.md` files, and the 5 named untouched (`ux-principles`, `code-style`, `design-principles`, `providers`, `git-strategy`) produce zero hits in my repo-wide `design/` sweep. 8 + 5 = 13. Reconciles. |
| #6 (low, below floor) | **Resolved, and reproduced** | Both greps at `test-plan.md:61-62` are now literal `git grep` invocations. I reproduced both: grep 2 (`design\`) returns exactly 4 hits, all in `decisions-log.md:56,80,86,93` — an exact match to the record; grep 1's residual set reconstructs to exactly the 16 listed hits (5 decisions-log, 2 `artifact-layout.md`, 4 `asd-phase-design` skill/manifest name references, 5 sprint-draft-path lines). |

**Additional independent check the record's line-level filter could have masked.** `grep -viE` on whole lines hides an in-scope `design/` that shares a line with an out-of-scope token — exactly plan.md's R-1 confusion class. I re-ran the sweep with `-o` and manually inspected every masked line: `.asd/project/custom-common-rules.md:5` / `custom-coding-rules.md:5` / `t_custom-*-rules.md:5` (`custom-design-rules.md (design/design-review)` = phase pair, correct), `.asd/rules/external-review.md:47` (`design/doc diffs` = prose, correct), `.asd/templates/external-review/t_prompt-external-impl.md:15` (`out of scope: design/doc content`, correct), `.claude/agent-memory/asd-backend-dev/feedback_docs-wording-sibling-vs-root.md:8` (out of sprint scope). Zero missed renames. The backslash aliases are correct in canon **and** both generated views: `.asd/skills/asd-init/SKILL.md:101,103`, `.claude/skills/asd-init/SKILL.md:100,102`, `.agents/skills/asd-init/SKILL.md:99,101`, `.asd/templates/t_commands.yaml:21,23` all read `docs\\ux\\DESIGN.md`.

## Suite gate

I am a read-only reviewer with no shell tool, so I could not execute `node tests/run.js` myself. Strongest available substitute, all confirmed:

- `tests/run.js` registers exactly **77** `test(...)` cases — matches the recorded 77/77 and confirms no new registration was added (the fix strengthened an assertion inside the existing case, as expected).
- The strengthened case is syntactically valid JS and its assumptions about `sync.js`'s output shape are verified against the producer (see #1 above), so it would run rather than throw on a shape mismatch.
- Two independent gate records corroborate the run: `decisions-log.md:104` (impl-completion gate: `--check` exit 0, every target `current` except `AGENTS.md: modified-foreign`) and `decisions-log.md:110` (impl-test re-entry against `56a0c11`: `node tests/run.js` exit 0, 77/77, lint clean, build clean).
- `test-plan.md:53-58`'s Suite run matches those records and my static evidence: same head commit `56a0c11`, same fix commits `7a2d299`/`430796f`, same 77/77, same single `AGENTS.md` exemption. No discrepancy found.
- The `modified-foreign` claim for `AGENTS.md` is consistent with the engine: `AGENTS.md:1`/`:59` carry the `<!-- asd:begin v=1 -->`/`<!-- asd:end -->` markers, `.asd/sync-state.json:5-8` holds its digest entry, and `sync.js:462` returns `modified-foreign` on digest divergence after the hand edit. Either that or `current` leaves the test green, so this record detail is not verdict-material.

## Coverage ledger

### File coverage

Scope = the iteration-2 delta (files changed by the seven review-fix commits `623818b`…`430796f` plus `56a0c11`, per `decisions-log.md:104`), with the carried-forward sprint surface re-verified group-wise by my own repo-wide greps.

| File | Status |
|---|---|
| `tests/run.js` | checked — primary target; assertion validated against `sync.js` producer contract |
| `.asd/sprints/001-rename-design-to-docs/test-plan.md` | checked — primary input; every section reviewed against the rubric |
| `.asd/sprints/001-rename-design-to-docs/state.json` | n/a: phase bookkeeping, no test decision content |
| `.asd/templates/t_config.yaml` | checked — AC-3 revert; `:13` correctly reads sprint-draft `design/` |
| `.asd/templates/t_sprint.md` | checked — AC-3 revert; `:5` correctly reads `design/ docs` |
| `.asd/project/config.yaml` | checked — AC-3 revert mirror; `:15` correct |
| `README.md` | checked — `:227` sprint-draft `design/prd.html` correct; `:172-174` docs-root `docs/product|architecture|ux` correct |
| `.asd/templates/t_plan.md` | checked — `:23-25` now `docs/product/requirements`, `docs/architecture/adr`, `docs/ux` |
| `.asd/rules/language-policy.md` | checked — no residual `design/` in sweep |
| `.asd/rules/review-policy.md` | checked — read in full (mandatory rule input); no residual `design/` docs-root reference |
| `.asd/agents/asd-reviewer-simplification.md` | checked — `:41` `<sprint>/design/` preserved (AC-3), docs-root refs renamed |
| `.asd/skills/asd-init/SKILL.md` | checked — `:58-60,101,103` docs-root + backslash aliases correct; JSON frontmatter parses (proved by green `--check`) |
| `.asd/templates/t_test-plan.md` | checked — `:5` sprint-draft `design/` correct |
| `.asd/workflows/asd-phase-impl.md` | checked — `:68` `docs/architecture/tech-reference` |
| `.asd/workflows/asd-phase-impl-test.md` | checked — no residual `design/` in sweep |
| `.asd/workflows/asd-phase-impl-review.md` | checked — no residual `design/` in sweep |
| `.asd/workflows/asd-phase-plan.md` | checked — no residual `design/` in sweep |
| `CHANGELOG.md` | checked — migration-entry risk row (`test-plan.md:40`) judged; excluded from greps by design |
| `.claude/agents/asd-reviewer-simplification.md`, `.codex/agents/asd-reviewer-simplification.toml` | checked — generated views agree with canon in the sweep; no drift signal |
| `.claude/skills/asd-init/SKILL.md`, `.agents/skills/asd-init/SKILL.md` | checked — backslash aliases and docs-root paths match canon exactly |
| `.asd/release-manifest.json` | checked — covered by the two existing hash-ledger cases (`tests/run.js:1299+`); `:54,99` `asd-phase-design` names preserved (AC-4) |
| `.asd/project/decisions-log.md` | checked — grep residuals at `:48,51,57,93,99` and `:56,80,86,93` verified as rename-narrating prose (AC-7 append-only) |
| Carried-forward surface: `.asd/rules/*` (8), `.asd/templates/*` (10), `.asd/agents/*` (14), `.asd/skills/*/SKILL.md` (6), `.asd/workflows/*` (7), regenerated `.claude/`/`.codex/`/`.agents/skills/` views | checked group-wise — re-swept repo-wide for `design/`, `design\`, the 11 over-rename tokens, and positive `docs/<segment>`; every hit classified, zero unexplained |
| `.asd/sprints/001-rename-design-to-docs/reviews/impl/iter-01/*` | n/a: prior-iteration review files — `review-policy.md` forbids reading them (clean-context rule) |

No scoped file omitted.

### Rule coverage

| Rubric item | Status |
|---|---|
| Risk fit (cheapest reliable check per risk) | pass — every row picks static/build/existing-unit; nothing over-reaches to an e2e-equivalent, nothing under-reaches. The one boundary-level risk (canon↔generated view) correctly sits at the build gate + a unit assertion on its output rather than at prose level |
| Removals justified | pass — "Removed tests: None"; verified no test in `tests/run.js` was made obsolete (77 registrations intact, all covering `sync.js`/`update.js` which the rename does not touch) |
| No-test decisions honest | pass — each `none` names a real existing mechanical check. The one previously dishonest rationale (content-guard "structurally cannot") is corrected and its four `tests/run.js` citations verified accurate (iter-1 #4) |
| Regression proof (fail-first for D-N defects) | n/a: `test-plan.md` records zero defects (`## Defects — None`), and none of the review-fix findings were code defects with a regression test; the #1 fix's fail-first equivalent is the producer-contract analysis above (the prior assertion provably could not fail on drift, the new one provably can) |
| Coverage — every AC-N has a check | pass with one below-floor gap: AC-1/AC-7 → grep pair; AC-3/AC-4 → inverse grep; AC-5 → strengthened drift assertion + `--check`; AC-6 → suite run; AC-8 → Task 8 row; AC-9 → CHANGELOG row. AC-2 untraced in the record → observation L2 (verified factually true by my own positive grep) |
| Edge cases (empty/single/many/boundary/invalid/concurrent) | pass — the material boundary case for this change class is separator-blindness (`design\` vs `design/`), and it has a dedicated grep; the invalid case (malformed skill JSON) is covered by `--check`'s parse. No concurrency or cardinality surface exists in a textual rename |
| Meaningfulness (no test-for-test-sake) | pass — zero tests added for a coverage number; the sole test change tightens an assertion that was demonstrably unable to fail, and the candidate standing content-guard was rejected with a defensible cost/benefit argument |
| Determinism | pass — no sleeps, no network, no ordering dependence. `tests/run.js:951-952` spawns `sync.js --check` synchronously against the repo tree: deterministic for a given tree, and it is an intentional build-gate coupling, not a flaky-pattern |
| Stub-resolution verification | pass — `.asd/project/stubs.md:16` records "no open stubs"; every `TODO(sprint-` hit in the repo is rule/agent prose describing the marker format, so there are no orphan markers and no undeleted stubs |
| Manual verification (last resort) | n/a: no visual UI, no third-party live integration, no UX-feel surface — `test-plan.md:71`'s "None" is correct; all risks are statically verifiable |
| `.asd/project/custom-coding-rules.md` (zero-dependency Node; canon edit → `sync.js --apply`; never hand-edit generated) | pass — the new assertion uses only `node:child_process` + `JSON` (no new dependency); the review-fix's canon edits were followed by regeneration (`f8b9545`), and the strengthened assertion is precisely what now proves that regeneration held |
| `.asd/project/custom-common-rules.md` | n/a: vocabulary/glossary rules only, no testing constraint |

## Verdict

APPROVE

## Next action

Reviewer done. All six iteration-1 findings are genuinely resolved, not merely acknowledged — #1's assertion was validated against `sync.js`'s actual output contract rather than taken on trust, and #2's inverse grep was re-run independently against HEAD with zero hits. No medium-or-above findings. PM may count Testing as APPROVE for impl-review iteration 2. The three low observations (L1-L3) are below this iteration's floor and require no fix; L1 and L2 are worth folding into a future sprint's cleanup if the drift assertion is ever revisited.

## Escalations

None.

## Manual verification

Not applicable — no automated-verification gap exists for this sprint.
</content>
