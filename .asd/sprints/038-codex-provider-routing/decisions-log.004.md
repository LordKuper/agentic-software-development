---
responsibility:
  owns: approved decisions for THIS sprint
  excludes: cross-sprint/durable decisions, sprint state, review notes
  delegates_to: docs/** + adr fold targets (durable design decisions), CHANGELOG.md (releases), .asd/project/stubs.md (standing open defects), .asd/project/retro-backlog.md (retro row dispositions), state.json (state), reviews/ (verdicts)
---

# Decisions Log

Per-sprint, append-only. Never edited or removed. Created at `scope`, rotated at phase entry (`.asd/rules/artifact-layout.md` "Decisions log"), archived with the sprint.

## Entry format

```markdown
## YYYY-MM-DD — <one-line summary>

- **Decision**: <what was decided> (≤3 sentences)
- **Rationale**: <why> (≤3 sentences)
- **Affected docs**: <links> (unrestricted)
```

A no-op skip, other zero-content decision, dispatch routing line or failed-dispatch reconstruction uses the one-line form instead:

```markdown
- YYYY-MM-DD — <phase> skipped: <reason>
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>[; risk <declaration>]
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
- YYYY-MM-DD — stall: <agent> <dispatch ids>
- YYYY-MM-DD — cleanup checkpoint <sha>
- YYYY-MM-DD — cleanup: removed <paths/symbols>; reverted <ids or none>; verified <build, lint, tests @sha>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

- 2026-11-22 — route Task 1: standard, dispatch HEAD 90f3fe593b6dce7f6846fb8d3a3847f305797f70; risk change: public contract
- 2026-11-22 — Task 1 completed AC-25 at `7cb6f6b0`. Build and staged lint passed. Verified staged additions, deletions, case-only renames and tracked, untracked and ignored replacements.
- 2026-11-22 — route Task 2: escalated, dispatch HEAD 36ecc522cd8c2fcee5841c0e6bbc75443a1f063a; risk change: broad-reasoning
- 2026-11-22 — Task 2 completed AC-6 and AC-12 at `cff3b4f4`. Verified the approved role settings, 11 Codex quota alternatives and equivalent role context and permissions with in-memory render checks.
- 2026-11-22 — route Task 3: standard, dispatch HEAD b58d6e5232567fa6793dab1444e10bd05ba039a5; risk change: public contract
- 2026-11-22 — Task 3 completed the shared AC-1/AC-2 validator, schema and init/update contracts at `1e084481`. The template passes. The old config reports the six approved Task 4 additions; seeded malformed and duplicate fields are rejected.
- 2026-11-22 — Task 4 applied the six approved settings at `f36bb900`. Candidate and installed config both pass config-check with zero missing, duplicate or invalid settings.
- 2026-11-22 — route Task 5: standard, dispatch HEAD 3df80e0d711e45b251a8242f4f981d181e162f8f; risk change: workflow gate
- 2026-11-22 — route Task 6: standard, dispatch HEAD 3df80e0d711e45b251a8242f4f981d181e162f8f; risk change: workflow gate
- 2026-11-22 — Tasks 5 and 6 landed at `f9e8e971` and `73bc03d7`. Complete project config is checked before Git changes or dispatch. The design paths cover explicit selection, local previews, deferred publication and safe promotion re-entry. Live Claude Design is unverified in this host.
- 2026-11-22 — route Task 7: standard, dispatch HEAD 93e3965ed0ab445e815c1646e72999323d31e6fd; risk change: authentication
- 2026-11-22 — Task 7 landed profile routing at `203f4ed8`. Local checks cover missing and malformed profiles, existing routes and explicit command overrides. Codex profile resolution pins model, provider and effort in a separate read-only invocation. No RouterAI request was sent.
- 2026-11-22 — route Task 8: standard, dispatch HEAD ee78b590ce40595591fafec1dd2cb7564bf94120; risk change: security
- 2026-11-22 — Task 8 completed AC-18, AC-19, AC-20 and AC-28 at `197ff9e1`. Verified consumer and self-hosted scope, skipped-review parity, a rename across exclusions, atomic memory refusal, numeric coverage IDs and snapshot guards.
- 2026-11-22 — route Task 9: standard, dispatch HEAD b87a83bced206b1510de91cbd4c783338b49b5c4; risk change: public contract
- 2026-11-22 — route Task 10: standard, dispatch HEAD b87a83bced206b1510de91cbd4c783338b49b5c4; risk change: workflow gate
- 2026-11-22 — Tasks 9 and 10 landed at `0f468f17` and `a0e19d5a`. Timing preserves repeated attrs, and the planning, audit and fix workflows incorporate six scope criteria. Scoped build and lint passed.
- 2026-11-22 — route Task 11: standard, dispatch HEAD c821422e494291cf847f31724fdcc05f604169cd; risk change: public contract
- 2026-11-22 — Task 11 completed AC-9, AC-10, AC-13 and AC-27 at `1dbee1bb`. Focused probes verified scoped Entry log, escaped pipes, rotated Added tests, precise Suite run refusals and unchanged files on refusal.
- 2026-11-22 — route Task 12: escalated, dispatch HEAD d6f79e3f8254c73f414b3649226e6838811deb10; risk change: broad-reasoning
- 2026-11-22 — Task 12 landed AC-22, AC-29 and AC-30 at `ac5112eb`. Area checkpoint recovery and the documented prose-only route preserve shared and terminal verification. Context, lint and generated view checks passed after sync.
- 2026-11-22 — route Task 13: standard, dispatch HEAD f1e0c01495f345a4c0f23d458142846bfa7559ba; risk change: public contract
- 2026-11-22 — Task 13 landed self-hosted stale-ledger detection and README/canonical mirrors at `b2265ee4`. Verified read-only reporting, consumer and legacy preservation, invalid-target diagnostics and regenerated sync skills.
- 2026-11-22 — route Task 14: standard, dispatch HEAD 8f7d362ee4c8de4430cd3d34253098b287837815
- 2026-11-22 — route Task 5 repair: standard, dispatch HEAD 8f7d362ee4c8de4430cd3d34253098b287837815; repair shared command inventory formatting and preserve the standalone skill byte cap.
- 2026-11-22 — repaired the runtime/Git command inventory and condensed affected skills at `8299dbd6`. Standalone skill total 61,841 LF bytes against the 62,351-byte cap. Regenerated the eight provider views.
- 2026-11-22 — Task 14 passed 249 named checks at `318511e9`. Profile routing was verified with a local CLI fixture. Runner and resume behavior are tested as declarative contracts; no authenticated provider call or terminal full suite ran.

## 2026-11-22 — Implementation accepted

- **Decision**: Advance to impl-test with all 14 Tasks accepted under the adaptive assessment gate.
- **Rationale**: Plan checkboxes complete and every implementation path accounted for. Scope includes the authorised config write, Git and Codex evidence notes, generated views and sprint artifacts. Build checked 77 current targets, lint and context pass, agnix returned zero errors and warnings, project config is complete. No new stubs or unresolved agent flags.
- **Affected docs**: [plan.md](plan.md), [state.json](state.json)
- 2026-11-22 — route impl-test entry 1: standard, dispatch HEAD 1a75a85d0602094944d0111ea270c9b72b98db32
- 2026-11-22 — route impl-test named-suite smoke: runner, dispatch HEAD 1a75a85d0602094944d0111ea270c9b72b98db32
- 2026-11-22 — AC-7 named-suite smoke: an isolated failing test using byte-identical copies of the repository runner and library produced the named `FAIL` line, the synthetic error, `0/1 passed` and exit 1. Workflow defect routing is covered by the existing contract tests.
- 2026-11-22 — impl-test pre-strategy: 314/314 across 13 named areas at `1a75a85d`. No added, removed or defective tests. Shared runtime and sync widen the suite gate to full.
- 2026-11-22 — route impl-test entry 1 suite: runner, dispatch HEAD 21eccab7e95fdc8bc6468ed8f648cc5e70432be4
- 2026-11-21 — impl-test: impacted set green (316/316; full safety-valve gate), 0/0 tests added/removed during impl-test
- 2026-11-22 — AC-7 external wrapper smoke: the named Codex fixture selected RouterAI's model at medium with read-only and ephemeral flags. The wrapper mapped major, minor and info to high, medium and low, preserving all source IDs. At floor medium, persistence retained high and medium, recorded one drop and kept CONCERNS. No provider request was made. The live RouterAI smoke remains conditional on local credentials.
- 2026-11-22 — external interrupted attempt 1 in wave-1/iter-01 (Claude reported account on hold after two invocations). Recorded authentication failure for the preflight fingerprint.
- 2026-11-22 — external wave-1/iter-01: APPROVE (skipped: external review unavailable: negative-cache (authentication)); 50 files unreviewed, as listed in the report. No APPROVE latch.
- 2026-11-22 — impl-review wave-1/iter-01 routed combined findings 1–6 to impl review-fix. Runtime findings 1–5 share one dev chain. The tester follows with finding 6 and executable regression checks. No terminal gate on this iteration.
- 2026-11-22 — review-fix API references verified in `docs/architecture/tech-reference/git-2.56.md` and the new `node-24.15.md`. Git 2.56 on Windows emitted an addition diff against `/dev/null` and returned 1 as a difference.
- 2026-11-22 — route review-fix wave-1/iter-01: standard, dispatch HEAD 72115d15252a810aacaa520acc639140ff917371; risk change: public-contract
- 2026-11-22 — route 6 and 1–4 regression evidence: standard, dispatch HEAD 6e5b1597952a6a79c4eaaa655679877ef825d9e3
- 2026-11-22 — impl fix for wave-1/iter-01: findings resolved. Runtime fix `148bc232`, regenerated release evidence `6e5b1597`, regression evidence `00996ea3` and verified suite record `984a3a80`. 240/240 impacted tests, nine fail-first cases, complete config, all 77 provider targets current, context, lint and agnix green. The literal-backslash patch assertion awaits native POSIX.
- 2026-11-22 — route impl-test entry 2: standard, dispatch HEAD 03d03af52e61935886ccaa2111be894a1e77393a
- 2026-11-22 — impl-test re-entry 2 pre-strategy: 314/314 at `03d03af5`; nine fail-first records preserved in test-plan.entry-01.md. No new test work or defects. Shared runtime and sync require the full suite gate.
- 2026-11-22 — route impl-test entry 2 suite: runner, dispatch HEAD 8a3b8ad51289b430c1ae038bad040768107b49db
- 2026-11-21 — impl-test: impacted set green (316/316; full safety-valve gate), 0/0 tests added/removed during impl-test re-entry
- 2026-11-22 — external wave-1/iter-02: APPROVE (skipped: external review unavailable: negative-cache (authentication)); 52 files unreviewed, including all 50 carried over. Same cause as F-1. No APPROVE latch.
- 2026-11-22 — impl-review wave-1/iter-02 routed combined findings 1–3 to impl review-fix. The real Git scope command still quoted unusual paths before the repaired selector could see them. No terminal gate on this iteration.
- 2026-11-22 — verified `git diff --name-only -z --output=<scratch>` on Git 2.56 and clarified Node API targets and preload effects in the review-fix references.
- 2026-11-22 — route review-fix wave-1/iter-02: standard, dispatch HEAD 4064683e610163b485ccc90c5749aa0c17825ebb; risk change: public-contract
- 2026-11-22 — route iter-02 finding 1 regression: standard, dispatch HEAD a85c18e8dda79b86f82e2c17ed7c51f2bddd1115
- 2026-11-22 — impl fix for wave-1/iter-02: findings resolved. Exact Git path handoff `eca760ee`, tech references and hashes `a85c18e8`, test proof `5ee9d8e1`/`4bf4a6ee`, and verified suite evidence `308236be`. All 162 affected tests, lint, context, config, sync and agnix passed. The literal-backslash Git patch test remains platform-conditional.
- 2026-11-22 — route impl-test entry 3: standard, dispatch HEAD 4a1cbcfa3b2b9d4488a533fbed9bc504f71608fa
- 2026-11-22 — impl-test re-entry 3 pre-strategy: 314/314 in 13 named areas at `4a1cbcfa`. All proof carried to test-plan.entry-02.md. No test changes or defects. Shared list parsing and sync require the full suite gate.
- 2026-11-22 — route impl-test entry 3 suite: runner, dispatch HEAD ac5a555ad23ab5d08da4e54b9c8819ae80ac4cf7
- 2026-11-22 — impl-test: impacted set green (316/316; full safety-valve gate), 0/0 tests added/removed during impl-test re-entry 3
- 2026-11-22 — external wave-1/iter-03: APPROVE (skipped: external review unavailable: negative-cache (authentication)); 53 files unreviewed, including all 52 carried over. Same cause as F-1. No APPROVE latch.
- 2026-11-22 — impl-review wave-1/iter-03 DoD met. Combined approved with valid coverage; external availability skip recorded. Reused full-suite 316/316 at `ac5a555a` after checking no code, test or stub changes. Green handoff advanced under the accepted Lite scope and adaptive policy.
