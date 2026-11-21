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
