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

- 2026-11-22 — Requirements decisions from scope: editable Figma Design screens; existing destination by URL or creation after approval; offer temporary HTML or wait when Figma writes are unavailable; use the Codex App widget for every structured choice and wait for explicit chat replies where the widget is absent. See research.md Requirements.
- 2026-11-22 — Plan accepted: the user selected "Accept plan and start implementation" for all seven tasks.
- 2026-11-22 — route Task 1: standard, dispatch HEAD 04853137a0d6403ef1f3b6d9531bb6552887d0c7; risk change: workflow gate
- 2026-11-22 — route Task 2: standard, dispatch HEAD 4043256c2f31d7bfefbf21a3d83f26728bb6211e; risk change: public contract
- 2026-11-22 — route Task 4: standard, dispatch HEAD 4043256c2f31d7bfefbf21a3d83f26728bb6211e; risk change: workflow gate
- 2026-11-22 — route Task 5: standard, dispatch HEAD 4043256c2f31d7bfefbf21a3d83f26728bb6211e; risk change: runner evidence
- 2026-11-22 — Wave 2 operated within the host's three child-agent slots. Task 6 started as the first slot reopened.
- 2026-11-22 — route Task 6: standard, dispatch HEAD ba9be28d7b2847ea0a4b4e96fbe1253f77e31ae8
- 2026-11-22 — route Task 7: standard, dispatch HEAD 980f98b44a9fa056ab919400603f92b3c0778f45
- 2026-11-22 — Task 7 accepted at `876ee608dedf29513160d8d8b82374b8090b92e8`. The committed diff adapts the existing config fixture and assertions to the replacement key, with no new or extended behavioral regression coverage. The existing targeted check passed.
- 2026-11-22 — route Task 3: escalated, dispatch HEAD 27249f911026bd6b991b3383977a33eecbd5220a; risk change: cross-domain, Task 3 change: workflow gate
- 2026-11-22 — Implementation accepted under adaptive policy. All seven tasks are complete, the scope diff matches the assignments, and build, lint, context-check and agnix passed. No new stubs.
- 2026-11-22 — route impl-test entry 1: standard, dispatch HEAD 5a7512c
- 2026-11-22 — Figma smoke authorized through the Codex App widget: create one private Design draft named "ASD 039 — проверка Figma" and author one editable test screen in the connected plan.
- 2026-11-22 — Figma smoke passed: remote MCP created the authorized Design draft, wrote one native 480×198 frame, and read back the frame with 1 nested FRAME, 3 editable TEXT layers, no image fills, and a bound background variable. Inspected the composition screenshot. The Codex App delivered the explicit authorization after the widget enqueue. Private file identifiers stay in chat.
- 2026-11-22 — route D-1: standard, dispatch HEAD 94428f22102dbc076ff2236a4770999bc63c5eda; risk artifact: skill byte budget via standalone skills total
- 2026-11-22 — impl test-fix: defects D-1 resolved. The standalone skill set uses 62,226 of 62,351 bytes. Generated views were synchronized, and build, lint, context and agnix passed.
- 2026-11-22 — route impl-test entry 2: standard, dispatch HEAD 2974ba1d5be8dc62930d1b5fbbb3503e8af4cf84
- 2026-11-22 — Manual integration checks passed through live Figma frame read-back and the explicit Codex App widget response. The unavailable-tool paths are rule and fixture checks.
- 2026-11-22 — wave-1/iter-01 combined first dispatch interrupted. Its manifest omitted the framework flag, so it gated out the self-hosting consistency rubric. Re-emitted with `--self-hosting` and dispatched fresh.
- 2026-11-22 — wave-1/iter-01 external first dispatch did not invoke the CLI. The wrapper misapplied the Claude Code Bash requirement on the Codex/PowerShell host. Corrected the host invocation and dispatched fresh.
- 2026-11-22 — wave-1/iter-01 external real invocation failed authentication twice because the Claude account was on hold. Recorded the failure by fingerprint. Rechecking preflight returned negative-cache (authentication), so external review used the configured availability skip.
- 2026-11-22 — wave-1/iter-01 Combined returned CONCERNS 1–5. Route production and documentation findings 1, 2, 3, 5 to impl review-fix, then test finding 4 to the tester chain.
- 2026-11-22 — Review-fix references verified: Figma native write and read-back in figma-mcp-remote.md, existing design-review snapshot command in runtime.js and runtime review tests, and Node/PowerShell stream capture through the existing tester invocation.
- 2026-11-22 — route combined.md F-1, combined.md F-2, combined.md F-3: escalated, dispatch HEAD 385f8c50f5e4916e3985de1a9304f3d4eb283856; risk change: workflow gate, change: cross-domain, change: runner evidence
- 2026-11-22 — Figma revision check passed: changed padding in the existing authorized test frame, then read back the changed value and the same frame ID. In a local index fixture, increasing only the verified revision with the same URL made draft-snapshot include the index and emit-manifest produce the revision diff.
- 2026-11-22 — route combined.md F-4: standard, dispatch HEAD 8afe21b55bf9ddff82fdc509b6fa953d0a7f8d07
- 2026-11-22 — impl fix for wave-1/iter-01: findings resolved
- 2026-11-22 — route impl-test entry 3: standard, dispatch HEAD 4896ebd2f59bf1ae1ac078cbce5ea04b196d8c90
- 2026-11-22 — impl-test: defects D-1 → impl test-fix (digest 6b945f0b7c82d1018f62d85421f01901304e056c4af83c90f97999d66c66137e)
- 2026-11-22 — impl-test: impacted set green (106/106), 0/0 tests
- 2026-11-22 — impl-test: impacted set green (264/264), 0/0 tests
