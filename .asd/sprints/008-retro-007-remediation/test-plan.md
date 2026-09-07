---
responsibility:
  owns: test approach for sprint change scope, removal reasons, no-test decisions, suite run result, code defects found by tests, manual-verification spec (single home — never duplicated in a review file)
  excludes: task breakdown, requirements, review verdicts, code, change surface (derivable from the diff)
  delegates_to: plan.md (tasks), persistent docs (requirements), reviews/impl/iter-NN/testing.md (verdict)
---

# Test plan — sprint 008-retro-007-remediation

## Entry log

| Entry | HEAD analysed | Scope |
|---|---|---|
| 1 | `a0eac63` | full change surface (base `39709446`, head `f886441`, 18 files, self-hosting exclusions applied) |

## Risk → check decisions

| Change | Material risk | Chosen check | Decision | Reason |
|---|---|---|---|---|
| `.asd/runtime.js` `routeTask` typed risks (AC-10) | silent misroute: an artifact-risk wrongly escalates/de-escalates, or a malformed `risks` entry routes lower instead of failing closed | unit (pure function, deterministic) | add | new coverage: `target:"change"` parity with legacy string, `target:"artifact"` never escalates by itself, no-downgrade clamp reason outranks artifact-risk reason, any risk of either kind forces `execution:agent`, every malformed shape throws, mixed change+artifact array picks the change reason. Pre-existing test at line ~2251 already covers the legacy bare-string case (item 1 of the handed-over surface) — kept, not duplicated |
| `.asd/runtime.js` `validateCoverageLedger` + `review-policy.md` split-dispatch partition (AC-1/AC-6) | a malformed partition scheme (two partial ledgers against one unpartitioned manifest) silently passes, or a correct two-manifest partition wrongly rejected | unit | add | new test: each half validates unchanged against its own complete manifest, halves' `files` are disjoint and union to the unpartitioned set, `rules`/`sections` unchanged in each half; counter-check that a partial ledger against the unpartitioned manifest fails `files rows incomplete` |
| `.asd/templates/t_state.json` `derived_handoff` field (AC-11) | template ships the wrong shape (non-empty / wrong type), breaking the pure-cache contract for every new sprint | static (template content) | add | targeted assertion that `derived_handoff` ships as `{}`. Generic "every template JSON parses" is already covered by the existing recursive template-JSON test — not duplicated |
| `.asd/hooks/session-start.js` × `derived_handoff` (AC-11) | future/accidental coupling of the hook to a field it must never read; a malformed value could throw and break a hook that must fail silently | component (subprocess hook run) | add | 3-fixture test (absent / well-formed / malformed `derived_handoff`) asserting byte-identical `additionalContext` — guards the "hook reads no new key" contract as a regression, mirroring the file's existing absent-key-fallback test style (iteration_heads, latched) |
| `sprint-lifecycle.md` "State recovery" `derived_handoff` shape vs. both impl-phase workflows (AC-11 SSoT) | two workflow-file prose copies of the shape drift apart over time | static/architecture (content-contract, mirrors §16's mirror-check style) | add | asserts the shape literal exists once, in `sprint-lifecycle.md`, and that neither `asd-phase-impl-test.md` nor `asd-phase-impl-review.md` inlines it — each only carries the "sole SSoT" citation |
| `.asd/release-manifest.json` hash ledger refresh | stale/incorrect recorded hash for a changed file | static (existing §6b forward + §17 reverse hash-coverage tests) | none | this diff only updates recorded hash values; the check itself (every managed file has a matching, present entry) already runs unconditionally and would fail if any value here were wrong |
| `.asd/rules/artifact-layout.md` "Agent memory" section (AC-3) | none — the carve-out documents behaviour already true: `.claude/agent-memory/` has no canonical source and `sync.js` was never going to plan it (`sync.js` itself is untouched by this diff) | n/a | none | prose-only clarification of existing behaviour; no code changed, nothing to regress |
| `.asd/rules/code-style.md` §1 proactive-checklist line | none — restates an existing `review-policy.md` checklist as an authoring instruction; no new mechanism | n/a | none | prose-only, no observable behaviour |
| `.asd/rules/git-strategy.md` orchestrator-commits-bookkeeping line | none — documents an existing commit-ownership split; no scripted orchestrator exists in this repo to exercise | n/a | none | prose-only process rule; not a surface this test suite can exercise (orchestration is LLM-driven, not scripted code) |
| `.asd/rules/providers.md` typed-risk routing prose | already covered directly — the prose describes the exact contract `routeTask`'s new unit tests pin | n/a | none | duplicate of the `runtime.js` row above; testing the prose separately would only restate the same behaviour |
| `.asd/skills/asd-update/SKILL.md` wording fix (`node .asd/sync.js --apply` targets generated provider-view paths) | none — corrects wording to match already-existing, already-tested `--apply` target resolution | n/a | none | wording-only correction; behaviour already covered by §11's orphan-detection/apply-target tests |
| `.asd/agents/asd-dev.md` matching wording fix | same as above | n/a | none | wording-only |
| `.asd/templates/t_plan.md` `Material risk:` line/examples (AC-2) | a drift between `t_plan.md`'s example grammar and `sprint-lifecycle.md`'s "Plan file format" grammar could teach the wrong syntax | n/a | none | no scripted plan parser exists in this repo (plan parsing is LLM-driven) to validate the grammar against; a script-level check here would only restate the diff text, not exercise real behaviour — no qualifying material risk under `code-style.md` §17 |
| `.asd/workflows/asd-phase-design-review.md`, `asd-phase-impl-review.md`, `asd-phase-impl.md`, `asd-phase-impl-test.md` interrupted/split-dispatch + `derived_handoff` wiring prose | the machine-checkable core (manifest-partition union property) is pinned at the `runtime.js` level (row above); the `derived_handoff` SSoT-citation is pinned separately (row above) | static/architecture | keep (already covered by the two rows above) / none (remaining prose) | further prose-matching of the workflow wiring text would restate the diff rather than exercise behaviour — implementation-coupled, fails the hypothetical-risk bar in `code-style.md` §17 |
| `AGENTS.md`, `README.md` wording touch-ups | already covered generically — no phase added/removed, so `tests/run.js` §16's phase-chain/phase-count mirror tests still pass unchanged and would fail on any actual desync | n/a | none | existing §16 tests already assert these mirrors on every run |

## Removed tests

None. No test in or out of the change scope met a removal criterion (`code-style.md` §17) — nothing trivial, duplicate, mock-confirming, implementation-coupled, or flaky was found among impacted tests.

## Added tests

Level and AC/risk covered are visible in the test file itself (name, path) — not restated here. All nine live in `tests/run.js`, new §19, appended after §18 (existing numbering collisions at `// 7.` and `// 15.` left untouched per instruction).

| Test | Regression proof |
|---|---|
| `tests/run.js`: "AC-1/6: a reviewer split partitions the manifest files list into two disjoint halves..." | n/a — new coverage of new code path (split-dispatch was not previously testable; `review-policy.md`'s partition rule is new this sprint) |
| `tests/run.js`: "AC-10: a typed target:\"change\" risk routes exactly like the legacy bare-string form" | n/a — new coverage of new `riskEntry` typed-object path |
| `tests/run.js`: "AC-10: a typed target:\"artifact\" risk never escalates by itself..." | n/a — new coverage |
| `tests/run.js`: "AC-10: the no-downgrade clamp outranks an artifact-risk reason..." | n/a — new coverage |
| `tests/run.js`: "AC-10: routing fails closed on every malformed risks shape..." | n/a — new coverage |
| `tests/run.js`: "AC-10: a mixed array of one change risk and one artifact risk still routes critical..." | n/a — new coverage |
| `tests/run.js`: "AC-11: t_state.json ships derived_handoff as an empty object..." | n/a — new coverage of new template field |
| `tests/run.js`: "AC-11: SessionStart output is byte-identical whether state.json.derived_handoff is absent, well-formed, or malformed..." | n/a — new coverage, guards against future coupling |
| `tests/run.js`: "AC-11: derived_handoff's shape/validity rule lives ONLY in sprint-lifecycle.md \"State recovery\"..." | n/a — new coverage, mirrors §16's SSoT-mirror style |

## Suite run

- Command: `node tests/run.js` (`test` from commands.yaml) — this repo has no `test_affected` selector and a single flat runner file, so every invocation runs the whole file; the **safety valve independently fires** for this entry regardless, since the change surface touches shared/framework-wide infrastructure (`.asd/runtime.js`, `.asd/rules/**`, `.asd/templates/**`, `.asd/workflows/**`, `.asd/release-manifest.json` — self-hosting means these ARE the framework). Impacted-set definition used: search-derived set (diff test files + reference search + AC-tag search) → safety valve fires on shared-infrastructure touch → degrades to full suite. Mechanically identical outcome to `impl-review`'s later full-suite run, but recorded here as the `impl-test` gate, per `sprint-lifecycle.md` "Impacted test set".
- Scope: impacted (safety valve fired → full suite, 145 tests)
- Result: pass — 145/145 passed, 0 failed, 0 skipped (136 pre-existing + 9 added)
- Lint / build: pass — `git diff --check` clean (only a pre-existing CRLF-normalization warning on an orchestrator-owned file, not an error); `node .asd/sync.js --check` reports `"ok": true` for every generated target
- HEAD: `efd084474743da089ef3e7afddd661b36acf172f` — commit this run was verified at (impl-test's own test/test-plan commit; re-run at this sha after committing confirmed 145/145 unchanged)

## Defects

None. No code defect found — all 145 tests pass against the implementation as delivered.

## Manual verification (optional)

None. This sprint's change surface is entirely rule/workflow/template prose plus three pure-function/data surfaces (`routeTask`, `validateCoverageLedger`, `t_state.json`/hook interaction) — no visual UI, no third-party live integration, no UX-feel surface exists to verify manually.
