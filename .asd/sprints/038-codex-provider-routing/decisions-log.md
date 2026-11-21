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
