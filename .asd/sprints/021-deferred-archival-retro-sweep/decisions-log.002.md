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
- YYYY-MM-DD — route <taskIds>: <tier>, dispatch HEAD <sha>
- YYYY-MM-DD — reconstruction: landed <ids>; re-dispatched <ids>
```

## Durability rule

A decision whose value must survive this sprint's archival is ALSO written into an existing persistent home — a `docs/` fold target, `CHANGELOG.md`, `.asd/project/stubs.md`, or `.asd/project/retro-backlog.md` (retro row dispositions). Never invent a new document type for this. This log records that the decision was made; the persistent home is what a later sprint can still read.

## Entries

<!-- entries appended below this line -->

## 2026-09-29 — Audit contradictions settled by user

- **Decision**: C5: AC-10's designated reviewer return file applies on both hosts. Codex reviewers move to `sandbox_mode: "workspace-write"`, bounded by policy to their memory dir plus the return file. C6: the AC-7 stall excludes an in-flight tool call that is still inside its own declared timeout, with elapsed-vs-per-agent budget as a backstop. C7: AC-7 degrades per host. Claude uses `Monitor`, falling back to `CronCreate`. Codex uses `wait_agent(timeout_ms ≤ 300000)`, best-effort. Where neither is available, the orchestrator checks only at completion notifications and logs the degraded mode once per sprint in friction-log. C1–C4 were settled by canonical precedence (audit.md).
- **Rationale**: Hard audit-contradiction gates (`checkpoints.md` "Gate policy"). C5 knowingly trades the host-enforced read-only guarantee on Codex for identical behaviour on both hosts.
- **Affected docs**: [audit.md](audit.md)

## 2026-09-29 — Audit accepted adaptively

- **Decision**: Audit gate passed by orchestrator, adaptive.
- **Rationale**: Every `t_audit.md` section is present. Every contradiction is settled (C1–C4 by precedence, C5–C7 by the user). No BA-material product ambiguity exists, and there is no subsystem registry because decomposition is disabled. The audit adds no scope beyond the accepted ACs. Its restating-site list and change-surface estimate (about 48–58 paths, under the cap of 100) feed plan. The architect's memory write `reference_host-agent-liveness.md` was checked and is committed by the orchestrator, because the architect holds no commit tool.
- **Affected docs**: [audit.md](audit.md)
