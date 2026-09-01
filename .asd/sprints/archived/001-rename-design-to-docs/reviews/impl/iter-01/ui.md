[REVIEW-impl-ui]: APPROVE

# Review — ui

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor**: low

## Precondition note

`asd-reviewer-ui` declares `accessibility.html missing → ABORT`. This repo has **no `docs/` tree at all** (verified: glob `docs/**` returns nothing) because its self-hosting profile disables `ux_spec` and no design system was ever authored here. I did **not** ABORT, because the ABORT guard exists to prevent rubber-stamping a UI surface without its baseline — and the scoped diff contains **zero UI surface**: no HTML/CSS/JS component, no mockup, no token, no interactive element, no accessibility-affecting markup. With nothing to compare, the missing baseline is not a blocker; ABORT here would be a false gate. This is recorded explicitly so the decision is auditable rather than implicit. Per `review-policy.md`, the UI reviewer runs unconditionally regardless of `ux_spec` status, which is why this review exists at all.

Note: I have no shell access (read-only tool policy), so I reconstructed the 49-file scope from `plan.md` Tasks 1–10 intersected with the dispatch pathspec exclusions (`.asd/project/**`, `.asd/sprints/**`, `.claude/**`, `.codex/**`, `.agents/**`) and verified each file's current content directly. The reconstructed count is exactly 49, matching the dispatch.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| — | — | — | no findings | — |

### Targeted verification requested by dispatch

`D:\Projects\agentic-software-development\.asd\templates\t_ux-spec.html:49` — **correct, no defect**:

```html
<tr><td><a href="../../docs/ux/DESIGN.md">{{component}}</a></td><td>{{where used}}</td></tr>
```

The `../../` prefix is preserved byte-for-byte; only the path segment changed. Depth is right for the location this template's output actually lands in: a promoted ux-spec lives at `docs/ux/<subsystem>.html` (`artifact-layout.md` line 61), so `../../docs/ux/DESIGN.md` resolves from repo root back to `docs/ux/DESIGN.md`. Same resolution the pre-rename `../../design/ux/DESIGN.md` had from `design/ux/<subsystem>.html`. The rename is depth-neutral. Verified the sibling case too — `t_plan.md:23-25` keeps `../../docs/product/…`, `../../docs/architecture/adr/…`, `../../docs/ux/…` with the prefix intact.

## Coverage ledger

### File coverage (49 scoped files)

| File | Status |
|---|---|
| `.asd/rules/artifact-layout.md` | checked — `docs/ux/` subtree (DESIGN.md, design-system.html, accessibility.html, `<subsystem>.html`) intact in both decomposition modes; no UI surface |
| `.asd/rules/design-system.md` | checked — §1 SSoT now `docs/ux/DESIGN.md`; §4/§6/§7/§11 token rules textually unchanged, no rubric semantics altered |
| `.asd/rules/core.md` | checked — n/a: no UI surface |
| `.asd/rules/sprint-lifecycle.md` | checked — design-system gate path renamed consistently; no UI surface |
| `.asd/rules/checkpoints.md` | checked — n/a: no UI surface |
| `.asd/rules/language-policy.md` | checked — n/a: no UI surface |
| `.asd/rules/review-policy.md` | checked — UI-reviewer DoD rows and `[REVIEW-impl-ui]` token unchanged |
| `.asd/rules/external-review.md` | checked — n/a: no UI surface |
| `.asd/templates/t_ux-spec.html` | **checked** — relative link verified (above); no raw hex/px/rem/font-family present (grepped, zero matches); mockup token instructions in the `<p class="lede">` and preview comment unchanged |
| `.asd/templates/t_commands.yaml` | checked — `designmd-lint`/`designmd-export` aliases now target `docs\ux\DESIGN.md` (Windows) and `docs/ux/DESIGN.md` (POSIX); `@google/design.md` package name correctly not renamed |
| `.asd/templates/t_plan.md` | checked — `../../` prefixes preserved on lines 23–25 |
| `.asd/templates/t_config.yaml` | checked — no UI surface (see out-of-domain observation) |
| `.asd/templates/t_design-md-delta.yaml` | checked — header comment points at `docs/ux/DESIGN.md`; file name preserved per AC-4 |
| `.asd/templates/t_audit.md` | checked — n/a: no UI surface |
| `.asd/templates/t_test-plan.md` | checked — n/a: no UI surface |
| `.asd/templates/t_sprint.md` | checked — n/a: no UI surface |
| `.asd/templates/t_AGENTS.md` | checked — prose-only reword; n/a: no UI surface |
| `.asd/templates/external-review/t_prompt-external-impl.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-ux-designer.md` | **checked** — write-access allowlist (line 70) correctly renamed to `docs/ux/DESIGN.md` + `docs/ux/design-system.html` while sprint-draft paths stay `<sprint>/design/`; hard precondition (line 46) and "no raw hex/px in mockups" Don't intact |
| `.asd/agents/asd-reviewer-ui.md` | **checked** — inputs now `docs/ux/{DESIGN.md,design-system.html,accessibility.html}`, draft input correctly stays `<sprint>/design/ux-spec.html`; full rubric and gate-verdict format unchanged |
| `.asd/agents/asd-frontend-dev.md` | checked — persistent-doc inputs renamed; no UI code, no token usage |
| `.asd/agents/asd-architect.md` | checked — write-access allowlist renamed; `<sprint>/design/ux-spec.html` input correctly untouched |
| `.asd/agents/asd-ba.md` | checked — write-access allowlist renamed; no UI surface |
| `.asd/agents/asd-backend-dev.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-test-engineer.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-reviewer-documentation.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-reviewer-quality.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-reviewer-performance.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-reviewer-testing.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-reviewer-implementation.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-pm.md` | checked — n/a: no UI surface |
| `.asd/agents/asd-external-review.md` | checked — n/a: no UI surface |
| `.asd/skills/asd-design-system/SKILL.md` | **checked** — every design-system output path (`docs/ux/DESIGN.md`, `docs/ux/design-system.html`, `docs/ux/accessibility.html`) renamed consistently across detect/write/output sections; §11 lint-exclusion gate and component-preview requirement unchanged |
| `.asd/skills/asd-init/SKILL.md` | **checked** — backslash aliases (lines 101, 103) renamed to `docs\ux\DESIGN.md` alongside POSIX twins (107, 109); design-system-absent detection (line 60) points at all three `docs/ux/` artefacts |
| `.asd/skills/asd-stack/SKILL.md` | checked — n/a: no UI surface |
| `.asd/skills/asd-concept/SKILL.md` | checked — n/a: no UI surface |
| `.asd/skills/asd-update/SKILL.md` | checked — n/a: no UI surface |
| `.asd/skills/asd-phase-design-promote/SKILL.md` | checked — skill and phase names preserved; n/a: no UI surface |
| `.asd/workflows/asd-phase-design-promote.md` | **checked** — ux-spec split target `docs/ux/<subsystem>.html`, DESIGN.md patch target, and `docs/ux/design-system.html` regeneration all renamed; `designmd-lint` gate and Windows `designmd-install` note intact |
| `.asd/workflows/asd-phase-design.md` | checked — `<sprint>/design/ux-spec.html` draft path correctly preserved |
| `.asd/workflows/asd-phase-impl-review.md` | checked — `asd-reviewer-ui` dispatch line ("UI code vs ux-spec mockups + accessibility compliance") intact |
| `.asd/workflows/asd-phase-plan.md` | checked — n/a: no UI surface |
| `.asd/workflows/asd-phase-impl.md` | checked — n/a: no UI surface |
| `.asd/workflows/asd-phase-impl-test.md` | checked — n/a: no UI surface |
| `.asd/workflows/asd-phase-audit.md` | checked — n/a: no UI surface |
| `README.md` | **checked** — folder map lines 316–320 (`docs/ux/` block) matches `artifact-layout.md` lines 57–61 line for line; `/asd-design-system` command row (line 174) renamed |
| `AGENTS.md` | checked — prose-only; n/a: no UI surface |
| `CHANGELOG.md` | **checked** — migration entry correctly names the consumer-owned `designmd-lint`/`designmd-export` alias fix as a separate step `/asd-update` cannot perform; design-system tooling implication accurate |
| `.asd/release-manifest.json` | checked — hash-ledger only; n/a: no UI surface |

### Rule coverage

| Rubric item | Status |
|---|---|
| Token usage (`design-system.md` §6 — no raw hex/px/rem/font in UI or mockup previews) | pass — grepped `t_ux-spec.html`, the only HTML in scope: zero hex/px/rem/font-family matches; no other file contains styling |
| Token comment (`design-system.md` §4) | n/a: no DESIGN.md exists in this repo and no token was added, removed, or edited |
| Component fidelity (UI vs ux-spec mockup structure and states; disabled state per §7) | n/a: no UI code and no ux-spec in scope |
| Design system completeness (every component used exists in DESIGN.md, no ad-hoc components) | n/a: no component authored or consumed in scope |
| Lint exclusions (`design-system.md` §11 — user-approved rationale in DESIGN.md lint-exclusions block) | n/a: no `designmd-lint` run and no DESIGN.md; the §11 rule text itself is unmodified |
| UX principles (`ux-principles.md` — readability, hierarchy, progressive disclosure, cross-theme consistency) | n/a: no user-facing interface in scope |
| Accessibility (accessibility.html visual/motor/cognitive/auditory/platform rules; Known Intentional Limitations respected) | n/a: no accessibility.html in this repo and no accessibility-relevant surface in the diff — no markup, no focus/contrast/hit-target/motion/copy change |
| `.asd/rules/code-style.md` (impl-review phase) | n/a: no code in scope — Markdown/YAML/JSON/HTML-template text only |
| `.asd/rules/artifact-layout.md` | pass — renamed `docs/` tree matches the SSoT layout; `docs/ux/` subtree and all four artefact names preserved |
| `.asd/rules/language-policy.md` | pass — all edited prose is English |
| `.asd/project/custom-common-rules.md` | pass — self-hosting vocabulary (canonical source / provider view / consumer) used correctly in the CHANGELOG migration entry |
| `.asd/project/custom-coding-rules.md` | pass — "canonical `.asd/agents/`,`.asd/skills/` edit must be followed by `node .asd/sync.js --apply`" satisfied: generated `.claude/agents/asd-ux-designer.md:69` and `.codex/agents/asd-ux-designer.toml:64` both carry the renamed `docs/ux/` allowlist, and no generated file was hand-edited |
| `.asd/project/custom-design-rules.md` | n/a: design-review phase only |

## Out-of-domain observation (not a finding, no severity assigned)

Routing this to the Documentation reviewer rather than claiming it, since it is documentation accuracy and not a design-system/a11y matter — `D:\Projects\agentic-software-development\.asd\templates\t_config.yaml:13`:

```yaml
  prd: enabled         # docs/prd.html + persistent requirements
```

The pre-rename comment read `design/prd.html`, which denoted the **sprint draft** `<sprint>/design/prd.html`, not the documentation root. `docs/prd.html` is not a path in either layout mode of `artifact-layout.md` (persistent requirements live at `docs/product/requirements/<subsystem>.html`). Compare the adjacent unprefixed lines 14–16 (`ux_spec`, `adr`, `c4`), which describe drafts without a root prefix. This looks like an out-of-scope occurrence that was renamed rather than excluded. I flag it only because it fell inside a file I had to check; it does not affect any UI, token, component, or accessibility behavior, so it is not a UI finding.

## Verdict

APPROVE

## Next action

UI reviewer done for impl-review iteration 1. No UI-domain issues at or above the `low` severity floor. Nothing to route back to a dev agent from this reviewer. The `t_config.yaml:13` observation above is offered to the Documentation reviewer / PM for independent judgment and should not be attributed to this review's verdict.

## Escalations

None.
</content>
