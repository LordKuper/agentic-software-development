---
responsibility:
  owns: brownfield findings for sprint scope (existing docs, code, gaps incl. dependencies/migration, risks)
  excludes: requirements, decisions, plan, code
  delegates_to: prd.html (requirements), adr.html (decisions), plan.md (tasks)
---

# Audit

## Scope reference

[sprint.md](./sprint.md)

## Touched areas

**Rules (`.asd/rules/`) — SSoT for the mechanic**

| File | Why it must change |
|---|---|
| `.asd/rules/checkpoints.md` | Primary edit target. "Mandatory pauses" preamble (L5) states approve-before-write as a *global* invariant — contradicts AC-1 unless split into two gate classes. Gate table rows for `scope`, `design` (per-artifact incl. `c4-full/` sub-gate), `design-promote (final mutation)`, `plan` are the literal AC-4 edits. "Pause message format" / "Approval recording" need `accept` vocabulary + AC-5's path-naming rule. |
| `.asd/rules/core.md` | QODDA step 5 ("**Approval** (user confirms; agent translates to `language.docs`, writes file, proceeds)") and "Incremental writing" ("per section draft → user approval → write → next") both hard-code approve-then-write. Glossary defines only Creator/Reviewer agent — needs an Advisor term (AC-6). Natural home for the new autonomy/escalation rule. |
| `.asd/rules/sprint-lifecycle.md` | "Design-promote phase" steps 4 (`Each creator requests user decision before each persistent write.`) and 5 (`PM final user confirmation before persistent mutation.`) dropped; steps 1-2 (decomposition, new subsystem) kept, renumber. Phase-table exit criteria (`scope approved`, `plan approved`) reworded. "No-op phase rule" closing clause re-pointed at the split gate classes. |
| `.asd/rules/providers.md` | "Agent tier matrix" gains an `asd-advisor` row (claude `fable`, codex `sol`). Semantic-op table has no "post artifact link" operation — open decision, see Gap G-1. `model_families` already has both `fable`/`sol` — no change. |
| `.asd/rules/language-policy.md` | L29 ("Free-text approval … is NOT a substitute for a user-decision request at any HARD gate") must be reconciled with `accept` being discrete while revision feedback is deliberately free-text. Quote-translation precedent (L21) is the closest existing analogue to link-posting and should be reconciled with AC-2. |
| `.asd/rules/artifact-layout.md`, `review-policy.md` | Verify-only. Decisions-log section is where AC-5's path-naming rule attaches; `review-policy.md`'s escalation ladder must not contradict the advisor's non-gate-only boundary. |

**Agents (`.asd/agents/`)**

| File | Why |
|---|---|
| `.asd/agents/asd-pm.md` | "Phase-specific approval gates" table mirrors `checkpoints.md` exactly — same four rows move/drop. "Rules common to every gate" (5 bullets) assumes uniform approve-before-write; 3 of 5 become false for moved rows (Risk R-4) — needs splitting, not patching. Authority/Approval-triggers/Behavioral-profile lines also assume old ordering. |
| `.asd/agents/asd-ba.md` | Approval triggers ("per-section PRD approve"), Behavioral profile ("per-section approve before write"). Stop-conditions / Do's clarify-before-guessing lines are advisor-routing candidates (AC-6, non-binding). |
| `.asd/agents/asd-ux-designer.md` | Approval triggers, Behavioral profile (per-section approve before write). `design-md-delta.yaml` per-entry gate is **not** in AC-3/AC-4's list — needs an explicit "stays approve-before-write" note or it'll be swept up by mistake (Gap G-8). |
| `.asd/agents/asd-architect.md` | "One approval covering the complete sprint ADR set" must survive as one `accept` for the whole set, not per-decision. c4 gate removal touches Outputs / diagram-tool phrasing. |
| **New**: `.asd/agents/asd-advisor.md` | AC-6. Read-only both providers (no `Write`/`Edit`/`Bash`, `sandbox_mode: "read-only"`), `claude.model: fable`, `codex.model: sol` — mirrors the 8 existing reviewer agents' read-only contract. Frontmatter shape confirmed against `sync.js`'s parser (see Existing implementation §5). |
| 10 remaining agents (`asd-backend-dev`, `asd-frontend-dev`, `asd-test-engineer`, 7 `asd-reviewer-*`) | Each carries its own "request user decision for ambiguity" line. AC-6 says "dispatchable by any agent" — whether this means one canonical `core.md` rule (SSoT-preferred) or ten file edits is an **open decision**, not resolvable from `sprint.md` alone (see Gap G-3). |

**Skills (`.asd/skills/`)**

| File | Why |
|---|---|
| `.asd/skills/asd-concept/SKILL.md` | `concept.html` is AC-3 in-scope. Phase 4 lock-in loop + Phase 5 "Approve and write" encode approve-before-write. |
| `.asd/skills/asd-stack/SKILL.md` | `stack.html` is AC-3 in-scope. Phase 4 lock-in, Phase 7 "Approve, write". Phase 6's per-tech-reference write gate is **not** in AC-3's list — retain-or-move is an open decision (Gap G-8). |
| `.asd/skills/asd-design-system/SKILL.md` | `DESIGN.md`/`design-system.html`/`accessibility.html` all AC-3 in-scope. Phases 4-7 per-section lock-in + final approve-and-write. `designmd-lint` gate (L137) is a machine gate, unaffected. |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | `description` string says "…gated by a final user confirmation" — stale once the final-mutation gate drops; frontmatter description is copied verbatim into both provider views. |
| `.asd/skills/asd-phase-scope/SKILL.md`, `asd-phase-plan/SKILL.md`, `asd-phase-design/SKILL.md` | Descriptions are gate-neutral — verify-only. |

**Workflows (`.asd/workflows/`) — where the gates are actually implemented**

| File | Exact sites |
|---|---|
| `asd-phase-scope.md` | Step 8 sub-steps 3/4/6 (present → loop → "only after explicit `approve`: write") + "Hard gates" block (independent second copy of the invariant, phrased as a `FAILED` trigger). Must honor this sprint's own Bootstrap note (its scope gate already ran under the old rule). |
| `asd-phase-plan.md` | Step 4 "on approval translate to `language.docs` + write `<sprint>/plan.md`". |
| `asd-phase-design.md` | Steps 6/8/9 each "on approval translate + write"; **step 10 (c4-full)** "on approval write files" → gate dropped entirely, step needs rewriting to pure write + link-post (Gap G-7, not just clause deletion). |
| `asd-phase-design-promote.md` | Step 8's three per-creator "request user decision before each persistent write" lines (`asd-ba`, `asd-architect`, `asd-ux-designer` payloads) → dropped. **Step 10 "Final mutation confirmation"** (whole step) → dropped, but its decisions-log composition + `state.json` finalization must be **relocated**, not deleted (Gap G-6). Step 6 decomposition + new-subsystem → explicitly unchanged. Agents-delegated / References lines go stale. |
| `asd-phase-audit.md` | No mechanical change needed — already a write-then-review precedent (step 6 writes `audit.md`, step 7 presents for approve/request-changes/reject with revise-in-place re-assembly). Useful reference implementation for AC-1's wording. |
| `asd-phase-impl*.md`, `asd-phase-pr.md`, `asd-phase-design-review.md` | Verify-only — gate semantics explicitly unchanged (AC-4), check only for stale phrasing. |

**Root and manifest docs**

| File | Why |
|---|---|
| `README.md` | Agent count ("15 specialized agents" / "Fifteen specialized agents") in ≥4 places, creators/reviewers roster tables (16th agent needs its own row + model-tier entry both providers), folder-map "15 agent definitions" lines (×3, one per provider view), phase-table gate prose, "pausing for your approval at every checkpoint" line. |
| `AGENTS.md` (root, self-sourced under `self_hosting: enabled` — hand-edited, `sync.js --apply` no-ops on it) | "**Agents** … — 15: 7 creators …, 8 reviewers …" roster sentence needs a third category; read-only-reviewer contract paragraph is the pattern the advisor's read-only guarantee should mirror. |
| `.asd/release-manifest.json` | `canon_hashes`/`upstream_hashes` auto-recomputed by `sync.js --apply` (`recomputeAndWriteHashLedgers`) — no hand-editing, but the diff must be committed. `managed_paths` already lists `.asd/agents` as a tree — no entry needed for the 16th agent. `model_families` unchanged (`fable`/`sol` already present). |
| `CHANGELOG.md` + `asd_version` | New entry at PR open per self-hosting versioning rule. v3.0.0's entry explicitly claims "no `checkpoints.md` user approval gate was removed" — historical, not retroactively edited; new entry records that this release *does* remove gates. |
| Generated views (`.claude/agents/`, `.codex/agents/`, `.claude/skills/`, `.agents/skills/`) | Never hand-edited — regenerated via `node .asd/sync.js --apply`; `buildSyncPlan()` auto-discovers `.asd/agents/*.md` so the new `asd-advisor` needs zero sync-engine change. |
| `tests/run.js`, `.asd/hooks/session-start.js`, `.claude/settings.json`, `.codex/hooks.json`, `.asd/templates/t_AGENTS.md`, `.asd/templates/t_state.json` | **No change required** — confirmed zero gate/agent-count coverage in `tests/run.js`; `session-start.js` only touches `PHASE_CHAIN` (unchanged) and review-verdict aggregation; the rest have no gate/agent references. |

## Existing docs found

- [.asd/rules/checkpoints.md](../../rules/checkpoints.md) — the gate SSoT. Preamble: *"Every pause is a HARD gate: responsible agent MUST request user decision and receive explicit `approve` (or equivalent discrete option) BEFORE writing the gated artefact or advancing phase. … Batching 'produce + write + advance' into one turn without the intermediate user-decision request is a protocol violation; agent MUST emit `FAILED` and halt if it notices itself doing so."* Rows being changed, verbatim:
  ```
  | scope | sprint.md | BEFORE writing sprint.md / state.json — refined scope presented in chat first |
  | design (per artifact, enabled documents only) | prd.html (if prd enabled), then design-system gate …, then ux-spec.html (if enabled; inline per-entry approval for any design-md-delta.yaml addition), then adr.html (if adr enabled — one approval for the sprint's whole ADR set, not per-decision), then c4-full/ (if effective c4 enabled) |
  | design-promote (final mutation) | final write to persistent docs/ |
  | plan | plan.md |
  ```
  Rows explicitly retained: `design-promote (decomposition)` and `design-promote (new subsystem)`. Also "Approval recording": *"Approval advances `phase` in `state.json` and appends an entry to `<sprint>/decisions-log.md`. No frontmatter status field."*
- [.asd/agents/asd-pm.md](../../agents/asd-pm.md) — "Phase-specific approval gates" table, header `| Phase | Gate (must happen BEFORE write) | Artefact written after gate |`; rows for `scope`, `design`, `design-promote (final mutation)`, `plan` mirror `checkpoints.md` exactly. "Rules common to every gate": *"A raw user request that 'looks complete' is NOT implicit approval… Never batch 'refine + write + emit COMPLETED' in one turn. The request for user decision MUST sit between refinement and the first write to the artefact."*
- [.asd/rules/core.md](../../rules/core.md) — QODDA: *"**Approval** (user confirms; agent translates to `language.docs`, writes file, proceeds)"*; "Incremental writing": *"Long artifacts: write skeleton first, then per section draft → user approval → write → next."* Glossary defines only "Creator agent"/"Reviewer agent" — no consultative category.
- [.asd/rules/sprint-lifecycle.md](../../rules/sprint-lifecycle.md) — "Design-promote phase" steps to drop: *"4. Parallel promotion: … Each creator requests user decision before each persistent write."* / *"5. PM final user confirmation before persistent mutation (confirm / rollback / partial rollback)."* Steps to keep: *"1. PM proposes per-subsystem decomposition … user approves split."* / *"2. PM proposes new subsystems inferred from drafts; user approves each."*
- [.asd/workflows/asd-phase-scope.md](../../workflows/asd-phase-scope.md) — step 8: *"3. **Present** refined version for explicit approval… 4. If edit/reject → loop… 6. **Only after explicit `approve`**: write `<sprint>/sprint.md`…"*; Hard-gates block: *"No write to sprint.md/state.json before request-for-user-decision approval returned approve. … No batching 'refine + write' into one turn."*
- [.asd/workflows/asd-phase-design-promote.md](../../workflows/asd-phase-design-promote.md) — step 8's three near-identical payload lines ("request user decision before each persistent write[; show diff vs existing]"); step 10 "Final mutation confirmation" in full, including decisions-log composition and `state.json` finalization.
- [.asd/skills/asd-concept/SKILL.md](../../skills/asd-concept/SKILL.md), [asd-stack/SKILL.md](../../skills/asd-stack/SKILL.md), [asd-design-system/SKILL.md](../../skills/asd-design-system/SKILL.md) — each has an identical-shape "Request user decision: A) Approve and write / B) Revise specific section" final gate plus per-section lock-in loops.
- [.asd/skills/asd-phase-design-promote/SKILL.md](../../skills/asd-phase-design-promote/SKILL.md) — `description`: *"…promote to persistent docs/ in parallel, gated by a final user confirmation."*
- [.asd/rules/providers.md](../../rules/providers.md) — semantic-op table has no operation for posting an artifact path/link into chat; "Agent tier matrix" lists five agent groups, `fable`/`sol` already exist as families.
- [.asd/rules/language-policy.md](../../rules/language-policy.md) — *"Free-text approval ('ok', 'да', 'approve') is NOT a substitute for a user-decision request at any HARD gate in checkpoints.md."*
- [README.md](../../../README.md) — *"dispatches 15 specialized agents"*; *"Fifteen specialized agents are canonically defined in .asd/agents/"*; *"pausing for your approval at every checkpoint"*; folder-map "15 canonical agent specs" / "15 agent definitions" ×3.
- [AGENTS.md](../../../AGENTS.md) — *"**Agents** … — 15: 7 creators …, 8 reviewers …"* roster sentence; reviewer read-only contract paragraph (*"a reviewer returns its verdict as final text, the dispatching phase workflow writes the review file"*) — the pattern `asd-advisor` should mirror.
- [.asd/release-manifest.json](../../release-manifest.json) — `managed_paths` already contains `.asd/agents`; hashes regenerated by `sync.js --apply` per the file's own `$comment`; `asd_version: "3.0.0"`.
- [CHANGELOG.md](../../../CHANGELOG.md) — 3.0.0 entry asserts *"no checkpoints.md user approval gate was removed"* — historical, superseded not edited.
- [.claude/agent-memory/asd-pm/feedback_approval-gate-without-askuserquestion.md](../../../.claude/agent-memory/asd-pm/feedback_approval-gate-without-askuserquestion.md) — PM's own memory encoding the old mechanic, goes partially stale for the scope/plan rows once AC-1 lands. Agent-owned, not canon, not a generated view.

*(Documentation migration plan: omitted — no findings. This sprint edits framework canon in place; `documents.prd` disabled; the only non-ASD docs found (`plans/*.md`, agent memory) are historical/agent-owned, not promotion candidates.)*

## Existing implementation found

Verified at audit time: `node tests/run.js` → **80/80 passed**. `node .asd/sync.js --check` → 69 items `current`, **1 item `modified-foreign` (`AGENTS.md`)** — pre-existing drift from sprint 002, unrelated to this sprint's scope but blocks AC-8's "`--check` clean" requirement unless re-baselined (see Gap G-9).

**1. The gate invariant is stated once, globally**, in `checkpoints.md`'s preamble (quoted above) — it applies to *every* row, so a partial edit leaves the rule contradicting its own table (Risk R-1).

**2. `audit` (this very phase) is already a de-facto write-then-review gate** — the closest existing precedent. `asd-phase-audit.md` step 6 writes `<sprint>/audit.md` from two agents' returned text; step 7 dispatches PM to "present audit.md to user for approval (approve / request changes / reject)"; on request-changes it re-dispatches only the agent(s) whose section needs revision and re-assembles — i.e. revise-in-place, no `-v2` file. What it lacks vs AC-1/AC-2: no rule that the chat message carries a path link + delta summary instead of content, and its `checkpoints.md` row still describes the gate as "BEFORE advancing to design" rather than as an accept loop.

**3. design-promote's four gate classes, exactly as implemented today:**
- **(a) Decomposition** — step 6, `asd-pm`: propose per-subsystem split, request user decision, iterate. *Retained.*
- **(b) New subsystem** — step 6, `asd-pm`: per new subsystem inferred from drafts, request user decision (name, parent container, description). *Retained.*
- **(c) Per-persistent-write** — step 8, three near-identical lines across the `asd-ba`/`asd-architect`/`asd-ux-designer` payloads ("request user decision before each persistent write[; show diff vs existing]"), SSoT'd in `sprint-lifecycle.md`. **Correction to the sprint-scope note**: this gate is not literally duplicated *inside* the three agent files themselves — those carry only weaker generic phrasing ("per-section approve", "one approval covering the complete sprint ADR set") that needs revising alongside it. A fourth, unrelated copy of the same string lives in `asd-stack/SKILL.md:98` (tech-reference writes). *Dropped.*
- **(d) Final mutation** — step 10, `asd-pm`, whole step: present summary of all persistent writes → confirm finalize/rollback/partial rollback → on confirm compose decisions-log entries + update `state.json` (phase=design-promote done) → emit COMPLETED. *Dropped* — but also the **only** site composing design-promote's decisions-log entries and writing the phase-done state (Gap G-6).

**4. The escalation protocol today has no advisory tier.** Every uncertainty resolves either autonomously or straight into a user interrupt (`core.md` Complication Approval, `design-principles.md` "on doubt … request user decision for final choice", `review-policy.md` autofix-vs-escalation, per-agent "request user decision for tradeoff choices; never silently pick" lines). No rule text distinguishes gate uncertainty from non-gate uncertainty.

**5. `sync.js` needs no engine change for a 16th agent.** `buildSyncPlan()` walks `.asd/agents/*.md` dynamically and emits both `.claude/agents/<name>.md` and `.codex/agents/<name>.toml` targets per file; `computeCanonHashes()` does the same walk for the ledger; `recomputeAndWriteHashLedgers()` runs unconditionally after every `--apply`. `resolveModelFamily()` already resolves `fable`/`sol`. Frontmatter is strict JSON (fails closed before any write).

**6. Generated views are pure sync output** (`.claude/agents`, `.codex/agents`, `.claude/skills`, `.agents/skills`) — all carry an ownership marker with content digest; `--check` reports them `current`. Confirms they must never be hand-edited.

## Gaps

- **G-1 — no "post artifact link" semantic operation** exists in `providers.md`'s semantic-op table. Posting an openable absolute path maps to no host tool on either provider — it's ordinary final-message text. Recommendation: `checkpoints.md` owns the mechanic in prose; add a `providers.md` row only if the link format genuinely differs per provider (it doesn't — a near-empty mirror row would itself be an SSoT violation).
- **G-2 — no `asd-advisor` agent exists** (verified: zero matches for "advisor" anywhere in canon). Needs authoring from scratch: operating contract (what counts as "non-gate uncertainty"), input contract (does the caller pass file paths, or does the advisor read the repo itself?), output contract (free text vs structured recommendation vs verdict token).
- **G-3 — "dispatchable by any agent" has no dispatch path defined.** Two mutually exclusive designs, sprint scope doesn't pick one: **(a)** agent→agent — every agent gains `Task` in `claude.tools`, direct delegation; nesting depth / Codex-side subagent-of-subagent support unverified (Risk R-7). **(b)** workflow-mediated — consulting agent emits a new signal, dispatching phase workflow catches it and relays an `asd-advisor` dispatch back; needs a new token in "Signal vocabulary" + a relay branch in all 10 `asd-phase-*.md` files. (a) is fewer files but changes every agent's tool surface and complicates the reviewer read-only guarantee; (b) preserves the existing "workflows delegate, agents return text" topology. **Architectural tradeoff for the user, not to be picked silently.**
- **G-4 — no agent currently holds a delegation tool.** Verified across all 15 `claude.tools` arrays: `Task` appears zero times (`asd-pm` alone has `Skill`). Design (a) from G-3 requires 15 frontmatter edits and regenerates all 15 Claude views.
- **G-5 — "revise in place" vs decisions-log provenance is unspecified.** AC-5 says each `accept` appends one entry, but not how multi-round feedback is recorded: one entry per artifact (loses revision history) or one per round (some non-accepting, which contradicts `artifact-layout.md`'s "every *approved* decision" wording)? Needs an explicit rule in `checkpoints.md` "Approval recording".
- **G-6 — dropping design-promote step 10 orphans two non-gate responsibilities**: composing that phase's decisions-log entries and writing `state.json` (phase=design-promote done). Must be relocated as an inline mechanical write (established pattern, `sprint-lifecycle.md` "State recovery" two-writers rule), not deleted with the gate. Same for the "partial rollback" affordance, which disappears entirely with no replacement.
- **G-7 — `c4-full/` losing all gating leaves `asd-phase-design.md` step 10 with no terminating signal.** "discuss overall view in `language.chat`; on approval write files" needs rewriting to a pure write + link-post, not a mere deleted clause (a bare content dump would also violate AC-2).
- **G-8 — AC-3's artifact list doesn't cover every artifact the touched skills gate.** `/asd-stack` Phase 6 gates each tech-reference write separately; `/asd-design-system` gates `design-system.html` regeneration (Phase 5) separately from the final three-file write (Phase 7); `design-md-delta.yaml`'s per-entry token gate is unlisted. Default reading: unlisted ⇒ unchanged (stays approve-before-write) — worth explicit confirmation, since leaving `stack.html` write-then-review while its sibling tech-reference writes stay approve-before-write is internally inconsistent within one skill run.
- **G-9 — `.asd/sync.js --check` is not currently clean** (pre-existing, unrelated to this sprint): `AGENTS.md`'s managed-block digest in `.asd/sync-state.json` is stale from sprint 002's hand-edit (commit `317aa50`). Because `AGENTS.md` is self-sourced under `self_hosting: enabled`, `runApply` deliberately no-ops on it. AC-8 requires `--check` clean, so this sprint must additionally re-baseline the digest (via `/asd-sync`'s `keep-local` path) — unavoidable since this sprint edits `AGENTS.md` anyway (15→16).
- **G-10 — no external dependency or migration gaps.** Zero-dependency Node scripts; no `docs/` tree in this repo (all optional documents disabled); no consumer-state migration needed. Only propagation vector is `/asd-update`/`/asd-sync` on the next release.

## Risks

- **R-1 (high) — stale approve-before-write phrasing surviving in an unedited mirror.** The mechanic is restated across ≥6 rule/agent files, 5 workflows, 4 skills. Highest-risk stragglers: `asd-phase-scope.md`'s "Hard gates" block (independent second copy, phrased as a `FAILED` trigger), `asd-pm.md`'s "Rules common to every gate" (see R-4), `asd-phase-design-promote/SKILL.md`'s **description string** (gate prose hidden in frontmatter), `core.md` QODDA + Incremental writing, `language-policy.md`. Mitigation: AC-8's dangling-reference sweep should be an explicit plan task running a literal grep over `before writ|BEFORE writ|on approval|after explicit .approve|approve before` across `.asd/**` + `README.md` + `AGENTS.md`, not a reviewer's discretionary check.
- **R-2 (high) — advisor recommendations followed with no audit trail.** Every other decision-influencing event in ASD lands somewhere durable (decisions-log, review file, `state.json.escalations[]`). An advisor consult, as scoped, lands nowhere — a silent authority channel that could move an artifact away from what the user accepted, and weakens `asd-reviewer-documentation`'s traceability check. Mitigation options for the user: require a one-line decisions-log entry per consult; persist consults to `<sprint>/advisories/`; or restrict the advisor to read-only analysis with an explicit "never authorizes, never substitutes for a HARD gate" clause. At minimum the last clause is mandatory — implied by AC-6 but not structurally enforced yet.
- **R-3 (medium) — dropping the design-promote final-mutation gate removes the only rollback point** for fold-target *selection* (which persistent doc an ADR/PRD fragment lands in) — that selection happens after the design gate and is never re-opened by it. A mis-fold would previously surface at confirm/rollback; after this change nothing catches it before `plan`. Mitigation: keep a non-blocking post-promotion summary (link + per-domain file list, no decision requested) — also satisfies AC-2's shape.
- **R-4 (medium) — `asd-pm.md`'s "Rules common to every gate" block breaks under a mixed model.** Three of five bullets assume write always follows approval; under write-then-review the write legitimately *precedes* the decision, so an agent obeying this block literally would self-emit `FAILED` on correct behavior. Needs splitting into "gates that precede the write" vs "gates that follow it," not bullet-by-bullet patching. `asd-phase-scope.md`'s Hard-gates block carries the same hazard.
- **R-5 (medium) — no-content-dumps vs `language.chat`.** This project runs `language.chat: ru`, `language.docs: en`. Under write-then-review the user reviews the file in `language.docs`, not the language they interact in — a real UX regression for `chat != docs` configs, unaddressed by AC-1/AC-2. Needs at minimum a `language-policy.md` note (e.g. delta summary self-sufficient for review, or key changed passages quoted-and-translated per the existing quote-translation rule, without dumping the body).
- **R-6 (medium) — AC-8's "`--check` clean" cannot be met without the G-9 re-baseline**, which requires touching `.asd/sync-state.json` — not in `sprint-lifecycle.md` "Self-hosting"'s exhaustive write allowlist as written. Route through `/asd-sync`'s `keep-local` path, or the allowlist needs an explicit amendment — flag before impl, not during.
- **R-7 (low-medium) — Codex-side advisor dispatch (design G-3a) is unverified.** Whether a Codex subagent may itself spawn another subagent isn't established anywhere in canon. If Codex forbids nesting, design (a) silently degrades to "advisor unavailable under Codex," breaking provider symmetry. Verify before committing to (a); design (b) is nesting-free by construction.
- **R-8 (low) — README/`providers.md` model-tier drift.** Per `AGENTS.md`'s own hard rule, a new agent's frontmatter tier requires the same-change README model-tier table update, plus a third roster category (`asd-advisor` fits neither "Creators" nor "Reviewers"), plus ≥4 count references across README and 1 in `AGENTS.md` moving together.
- **R-9 (low) — `asd-external-review`'s prompt templates may embed gate assumptions.** If either external-review prompt template describes the approval model, an external reviewer will judge new artifacts against the old contract — worth a targeted read during the impl sweep.

*(Subsystems map omitted — `project.subsystem_decomposition: disabled`. Related open stubs omitted — `.asd/project/stubs.md` holds no open entries.)*
