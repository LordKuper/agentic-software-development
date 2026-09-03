[REVIEW-impl-correctness]: CONCERNS

# Review — correctness (impl-review, iteration 1, severity floor `low`)

## Findings

| # | Sev | Location / AC-N | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/agents/asd-reviewer-correctness.md:24` (Stop conditions) vs `.asd/workflows/asd-phase-design-review.md:35` — AC-7 | **Deterministic design-review halt when no ux-spec/design-system draft exists.** Step 7 now dispatches `asd-reviewer-correctness` unconditionally in design-review and requires it to return APPROVE with every section `n/a`. But the agent's own Stop conditions read `UI target artefacts missing → ABORT`, with only two exceptions: (1) explicitly scoped **"in impl-review"** when the scope list has no UI surface, and (2) `self_hosting` + `.asd/templates/*.html`. Neither covers *design-review with no ux-spec/design-system draft* — the default for any consumer running `ux_spec: disabled`. A correctness reviewer obeying its own agent file emits `ABORT — precondition not met: docs/ux/accessibility.html`, which `asd-phase-design-review.md:53` relays and **halts the phase**. The predecessor `asd-reviewer-ui.md` never hit this because it simply was not dispatched in that case; the merge removed the agent-level skip without adding the matching carve-out. | Add a third Stop-conditions exception mirroring step 7's wording: "design-review AND no ux-spec/design-system draft in the set → UI conformance section marked `n/a: no ux-spec/design-system draft in scope`, all impl-only sections `n/a: outside phase gate`, verdict APPROVE — never ABORT." Also reconcile the agent `description`/Operating-contract phrase "conditional on such a draft existing in the set" (reads as dispatch-conditional) with the workflow's always-dispatch. |
| 2 | high | `.asd/workflows/asd-phase-impl-review.md:58` — AC-2, AC-5 | **Red-full-suite latch invalidation implemented on only one of the two red paths.** `sprint.md` AC-5 ("Either red path also clears every APPROVE latch for the sprint") and `sprint-lifecycle.md:14` ("Either red path also clears every APPROVE latch sprint-wide") both promise clearing on *test-defect* red as well as *code-defect* red. Step 9's code-defect bullet (line 59) clears `reviews.design.latched`/`reviews.impl.latched`; the **test-defect bullet (line 58) does not** — it fixes in place, re-runs, and on green proceeds to `NEXT: pr` with every latch intact. Net effect: a red full suite can occur, be repaired, and advance to `pr` without any latched reviewer ever re-examining the repair — precisely the hole AC-2's invalidation rule exists to close. | In step 9's `Red, test defect` bullet, add the same inline latch clear as the code-defect bullet (clear BOTH latch maps to `{}` before looping the re-run), or amend `sprint-lifecycle.md:14`/`:54` + AC-5 to scope the guarantee to the code-defect path only. The two must agree; currently the rule doc asserts a guarantee the workflow does not deliver. |
| 3 | medium | `.asd/rules/core.md:18` — AC-7, AC-14, AC-15 | **Retired reviewer roster still in the `core.md` glossary.** `- **Reviewer agent** — evaluates artifacts (Quality, Implementation, Testing, UI, Simplification, Documentation, Performance, External Review).` Line 17 (Creator agent) was updated to `PM, BA, UX, Architect, Dev, Tester`; line 18 was not. Five of the seven names refer to agents deleted this sprint. This is the "descriptive role words, not `asd-` identifiers" class the AC-15 grep cannot see, and `AGENTS.md` "Hard rules" names the core.md glossary as a roster mirror. | Update to `(Correctness, Efficiency, Testing, Documentation, External Review)`; refresh `canon_hashes`/`upstream_hashes`. |
| 4 | medium | `.asd/rules/review-policy.md:97-106`, `.asd/templates/t_review.md:26` vs `asd-phase-impl-review.md:47` / `asd-phase-design-review.md:38` — AC-7, AC-14 | **The section-coverage ledger has no home in the documents that define the ledger contract.** Both review workflows' ledger gates now *reject and re-dispatch* any reviewer whose section-coverage ledger is missing or has an unresolved row. But `review-policy.md` "Coverage ledger" still says "**Two parts**, both required (template `t_review.md`)", its Enforcement paragraph describes only file + rule rows, its Persistence paragraph enumerates only file/rule rows, and `t_review.md` (cited by both merged agents as their Output-format SSoT) has no section-ledger form at all. A reviewer following the cited SSoT emits two ledgers and is deterministically rejected by the gate. The requirement currently lives only as near-duplicate prose inside the two merged agent files. | Add section coverage as a third numbered part in `review-policy.md` "Coverage ledger" (with its `n/a` reason vocabulary), extend Enforcement + Persistence to name it, add the block to `t_review.md`; reduce the two agent files' paragraphs to a cross-link. |
| 5 | medium | `.asd/hooks/session-start.js:102-117` vs `.asd/rules/sprint-lifecycle.md:265` (State recovery) — AC-2, AC-7, AC-14 | **`session-start.js` was not updated for either the latch or the retired `"skipped:"` value.** The new State-recovery text names its `lastReviewVerdict` as a consumer that "treats an absent key for a required reviewer as blocking UNLESS `reviews.impl.latched` carries that key" — the function never reads `latched` (it only walks `node.verdicts`), so the claim is false for that consumer. Conversely it still special-cases `isSkipped = /^skipped:/` for a value the same paragraph says the map "never carries". Consequence: an iteration whose dispatched reviewers all APPROVE while others are latched is scored only from the dispatched subset, and an empty `verdicts["iter-NN"]` falls through to `'mixed'` rather than `'green'`. The file was not in the sprint's touch set at all. | Either pass `node.latched` into `lastReviewVerdict` and count a latched key as approved, or drop `session-start.js` from the State-recovery sentence's consumer list. Remove or re-comment the legacy `isSkipped` branch (see finding #7 first). |
| 6 | medium | `.asd/skills/asd-update/update.js:383`, `:467-472`; `SKILL.md:24-30` — AC-12, AC-13 | **Migrations are destructive but cannot be previewed.** `applyPlan` returns `{ ..., migrations: null }` on `dryRun` and `printPlan` never enumerates pending migrations, so `--dry-run` — which SKILL.md offers as the safety preview and calls "mutates nothing" — shows nothing about the migration stage. Yet `4.0.0.js` performs `fs.rmSync`/`fs.rmdirSync` on nine agents × three provider paths and writes `commands.yaml`, entirely outside `managed_paths` and therefore outside the per-file conflict classification the user actually confirmed. The user confirms a file plan and then, unconfirmed and unpreviewed, arbitrary fetched Node deletes files. | Have `planUpdate`/`printPlan` compute and list `pendingMigrations(...)` so both the dry run and the pre-write confirmation name every migration that will run; optionally give migrations a dry-run `ctx` flag so `4.0.0.js` can report its delete list without executing it. |
| 7 | medium | `.asd/workflows/asd-phase-pr.md:35`, `.asd/rules/sprint-lifecycle.md:265`, `.asd/migrations/4.0.0.js:171-197` — AC-2, AC-7 | **Legacy `"skipped: <predicate>"` verdict values fall into an unhandled branch after the upgrade.** The new pr-gate enumeration is exhaustive-by-construction — `APPROVE` satisfies; absent key satisfies only when latched; `CONCERNS`/`FAIL`/`null` block — with no branch for the string values the previous `scoped_fan_out` design wrote, while `sprint-lifecycle.md:265` asserts the map "never carries" them. A consumer running `scoped_fan_out: enabled` who upgrades mid-sprint has exactly such values persisted. `warnActiveReviewSprints` warns only about retired reviewer *keys*, not retired *values*, and deliberately never rewrites state. | Add an explicit legacy branch to `asd-phase-pr.md` step 4 and `sprint-lifecycle.md` "State recovery" ("a pre-4.0.0 `\"skipped: …\"` string counts as satisfied"), or widen the 4.0.0 warning to name the value form too. |
| 8 | low | `.asd/sync.js:1476-1479` (`main`, `--apply`) | `recomputeAndWriteHashLedgers(repoRoot)` still runs and writes both hash ledgers even when `hasInvalidTarget` aborted every write in the batch. That contradicts the property the abort exists to guarantee ("never half-applies"), and `tests/run.js:4059` asserts "no partial write from an aborted batch" while checking only the provider-view file. | Skip the ledger recompute (or move it after the check) when the batch aborted, and extend the test to assert the manifest/sync-state were untouched. |
| 9 | low | `.asd/sync.js:2851` (orphan branch) vs `.asd/migrations/4.0.0.js` (`removeIfEmptyDir`) | The two deletion paths for the same class of file disagree on empty parent directories: the migration prunes `<name>/` after deleting `.agents/skills/<name>/SKILL.md`, `sync.js --apply` uses a bare `fs.unlinkSync` and leaves it. A stale empty `.claude/skills/<name>/` then survives, invisible to `findOrphans` (which walks files only), so `--check` stays green on it. | Reuse the same empty-parent prune in `runApply`'s orphan branch, or drop it from the migration — pick one behaviour and state it once in `providers.md` "Orphan detection". |
| 10 | low | `.asd/rules/providers.md:21-23` ("Orphan detection") | The contract paragraph states "`--apply` deletes an orphan only when it carries the ASD ownership marker" but omits the other necessary condition the implementation enforces: the orphan must be named explicitly in `--apply <file...>` (`runApply` only inspects the requested list). A caller regenerating changed canon never sweeps orphans, even marker-owned ones — the exact drift the feature targets. README and AGENTS.md inherit the omission. | Add "…and is explicitly named in the `--apply` file list; `--check` is what enumerates them" to the `providers.md` paragraph (sole SSoT); let the mirrors follow. |
| 11 | low | `.asd/skills/asd-update/update.js:365` | `failure.error = e.message` assumes an `Error`. A migration that throws a string/object yields `undefined`, surfacing as `migration 4.0.0 failed: undefined (recorded version stays at 3.1.0)` — the one message AC-12 requires to "report which migration failed". | `String(e && e.message ? e.message : e)`. |
| 12 | low | `.asd/migrations/4.0.0.js` (filename) vs `.asd/release-manifest.json:4` (`asd_version: "3.1.0"`), `git-strategy.md:65` — AC-12, AC-13 | The migration's target version is hard-coded in its filename while the version it must match is produced later, by the `pr` phase's SemVer inference. Nothing asserts `max(migration filenames) <= release-manifest.asd_version` at release time, so a MINOR bump (3.2.0) would leave `pendingMigrations`' `<= newVersion` bound excluding `4.0.0` and ship the release with its cleanup silently dead. Self-heals on the next release reaching ≥4.0.0, so impact is bounded. | Add a `tests/run.js` assertion that every `.asd/migrations/*.js` version is `<=` the manifest's `asd_version`, and/or add the check to `asd-phase-pr.md` step 4's Version+Changelog bullet. |
| 13 | low | `.asd/migrations/4.0.0.js`; contract in `update.js:340-343` and `asd-update/SKILL.md:29` | The documented script contract is `module.exports = (ctx) => void \| Promise<void>`, but `4.0.0.js` returns a structured `report` that four tests assert against (`report.deleted`, `.missing`, `.skippedUnmarked`, `.commandsYaml`, `.activeReviewSprints`). The migration's entire tested surface is an interface the contract says does not exist; the runner discards it, so a future author following the contract writes an untestable script. | Either widen the contract to `(ctx) => Report \| Promise<Report>` with the shape named once and have `runMigrations` surface it, or keep the contract `void` and have the tests assert on-disk effects only. |
| 14 | low | `.claude/agent-memory/asd-reviewer-performance/`, `.claude/agent-memory/asd-pm/feedback_flag-gate-semantics-before-applying.md`; `plan.md:405-410`; `stubs.md:16` — AC-13, AC-15 | Task 15 found and deferred two agent-memory files referencing retired agents ("outside this agent's write access") but recorded no follow-up anywhere: `stubs.md` shows no open stubs, `OTHER_STALE_RELPATHS` is `[]`, and no `manual-steps.md` entry covers it. A memory directory for `asd-reviewer-performance` — deleted by this diff — is left with no owner and no removal path. A knowingly-partial cleanup needs an explicit follow-up. | Register an `(accepted-debt)` row in `stubs.md` naming the two paths and why they are out of migration scope, or delete them this sprint if agent memory is framework-owned. |

**Delegated, not dropped:** the new executable code carries in-body comments throughout (`sync.js` `runApply`/`main`, `update.js` `applyPlan`, several `tests/run.js` bodies), which the §7 rule *this same diff introduces* bans at severity `high`. AC-8 assigns that rubric item exclusively to `asd-reviewer-documentation`, and both merged reviewers' `description` delegate it there, so it is recorded as delegated rather than double-reported. It is *not* covered by AC-8's "Out of scope" clause, which exempts only pre-existing comments.

## Coverage

**Summary**: `files: 58/58 checked, 0 omitted · sections: 6/6, none blank · rules: 31 items, 14 findings`

**Section-coverage ledger**

| Rubric section | Status |
|---|---|
| Bugs | reviewed — findings #8, #11 |
| Security | reviewed — finding #6; no secrets/injection/auth/crypto surface in the diff |
| Contracts | reviewed — findings #1, #2, #4, #5, #7, #10, #13 |
| Best practices | reviewed — no finding at or above floor; §7 in-body-comment item delegated to `asd-reviewer-documentation` per AC-8 |
| AC coverage trace | reviewed — findings #2, #3, #12, #14 |
| UI conformance | reviewed in full (predicate `false`: `scoped_fan_out` absent → disabled) — **zero applicable artefacts**: no `.html`/`.htm`, `.css`/`.scss`/`.less`, `.jsx`/`.tsx`/`.vue`/`.svelte`, nor any `ui`/`components`/`views`/`pages` path segment among the 58 scoped files; no `t_*.html` changed, so the self-hosting templates carve-out is not triggered either. Not an ABORT. |

**`n/a` rows (full list)**

| Rule item | Reason |
|---|---|
| Bugs — resource leaks | no handles, sockets, or connections opened in the diff (sync `fs` only) |
| Bugs — timezone/locale | no date/locale logic in the diff |
| Security — auth/authorization bypass | no auth surface |
| Security — crypto misuse | existing `sha256Hex` reused unchanged |
| UI — Token usage (`design-system.md` §6) | no UI surface in scope |
| UI — Token comment (§4) | no UI surface in scope |
| UI — Component fidelity / states / disabled (§7) | no UI surface in scope |
| UI — Design system completeness | no UI surface in scope |
| UI — Lint exclusions (§11) | no UI surface in scope; no `designmd-lint` run in the diff |
| UI — UX principles | no UI surface in scope |
| UI — Accessibility | no UI surface in scope |
| `custom-common-rules.md` | file carries no rule constraining this diff |

**Finding rows (verbatim)**

| Rule item | Finding |
|---|---|
| Bugs — null/undefined paths | finding #11 |
| Security — input validation at trust boundary | finding #6 |
| Contracts — API signature drift | finding #13 |
| Contracts — breaking change without migration | findings #5, #7 |
| Contracts — deterministic phase behaviour | findings #1, #2 |
| Contracts — ledger contract SSoT | finding #4 |
| Contracts — documented behaviour matches implementation | findings #9, #10 |
| Best practices — atomicity of an aborted batch | finding #8 |
| AC coverage trace — every AC-N has a code path | findings #2, #12 |
| AC coverage trace — no partial AC without follow-up | finding #14 |
| AC coverage trace — roster mirrors | finding #3 |

## AC coverage trace (AC-1..AC-15)

| AC | Delivered | Evidence / gap |
|---|---|---|
| AC-1 | yes | `asd-tester.md:60` authoring bar; `asd-phase-impl-test.md` step 4 bar + `none` as first-class outcome |
| AC-2 | **partial** | Latch storage, rule section, DoD aggregation, rollback reset, both workflows' filter + write present. **Gap: finding #2** (test-defect red path does not clear latches). Secondary: **finding #5** |
| AC-3 | yes | `review-policy.md` change-surface section, sole statement, linked from both merged agents |
| AC-4 | yes | `code-style.md` §17 criterion governing authoring and pruning |
| AC-5 | yes | Impacted-set single home + selector + safety valve; impl-test pre-strategy run and impacted gate; impl-review terminal full suite; `impl` self-verification carve-out |
| AC-6 | yes | All four tier changes in frontmatter, README (both columns) and `providers.md` |
| AC-7 | **partial** | Five agents deleted, two merged carry every predecessor rubric item; tokens/filenames/state keys/DoD/dispatch lists follow. **Gaps: findings #1, #3, #4** |
| AC-8 | yes | §7 all three rules, WHY-allowance reconciled, TODO marker preserved; documentation reviewer rubric item at `high` |
| AC-9 | yes | `core.md` Context hygiene, seven rules verified one-to-one; old Compaction removed |
| AC-10 | yes | `asd-dev` union scope; impl grouping in all three modes; plan/README/manifest/generated views follow |
| AC-11 | yes | Both renames complete across workflows, rules, skills, templates, README, manifest, generated views |
| AC-12 | yes | Migrations tree, contract, runner (ordering, bounds, stop-on-failure, reachedVersion pinning, post-replacement sequencing) — quality issues #6, #11, #13 |
| AC-13 | **partial** | Nine agents × three paths, marker-gated, idempotent, additive yaml, consumer content untouched. **Gaps: findings #14, #12** |
| AC-14 | **partial** | Touch set covered, orphan detection added, `managed_paths` updated, README mirrors. **Gaps: findings #3, #4, #5** |
| AC-15 | **partial** | 96/96 and clean `--check` per `test-plan.md` (not re-run — read-only); nine-name grep verified clean across canon, generated views, README, templates. **Gap: finding #3** — the role-word roster the identifier grep cannot see |

## Verdict

CONCERNS — 2 high, 5 medium, 7 low. Every finding is a localized text or small-code fix inside the sprint's own change surface; none demands a new abstraction, contract break, or scope expansion. Findings #1 and #2 are the blocking pair.

## Next action

Route to `impl` review-fix mode. Suggested grouping: (a) `asd-reviewer-correctness.md` + `asd-phase-design-review.md` — #1; (b) `asd-phase-impl-review.md` + `sprint-lifecycle.md` — #2; (c) `core.md`, `review-policy.md`, `t_review.md`, `session-start.js`, `asd-phase-pr.md` — #3, #4, #5, #7; (d) `sync.js`, `update.js`, `4.0.0.js`, `providers.md` — #6, #8, #9, #10, #11, #12, #13; (e) `stubs.md` — #14. Every canonical edit needs `node .asd/sync.js --apply <targets>` and a hash-ledger refresh.

## Escalations

None.
