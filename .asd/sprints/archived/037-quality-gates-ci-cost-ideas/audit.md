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
- `.asd/runtime.js`: context ceiling command (AC-1), bundle bytes on dispatch ops and in `timing-summary` (AC-2), test-line delta (AC-3), stub review dates (AC-5), `retro-candidates` zero-table read (AC-11), `impl-test-close` gap-proof check (AC-13), suite-duration baseline (AC-18).
- `.asd/rules/code-style.md` §17: weakened-check ban (AC-4), seeded-violation proof (AC-9), gap proof and owner test (AC-13), regression-duty carve-out (AC-15), temporary tests (AC-19).
- `.asd/rules/review-policy.md`, `.asd/agents/asd-reviewer-{quality,efficiency,combined}.md`: suppression finding (AC-4), test-request validity (AC-14).
- `.asd/rules/providers.md`, `.asd/agents/*.md`, `.asd/sync.js`: `codex.sandbox_mode` removal (AC-21).
- `.asd/rules/sprint-lifecycle.md`, `git-strategy.md`, `checkpoints.md`, `artifact-layout.md`: friction on a selection miss (AC-7), stub dates (AC-5), open-PR decisions (AC-12), agnix gate under self-hosting (AC-21), "Leftover-term check" (AC-19).
- `.asd/workflows/asd-phase-{scope,impl,impl-test,impl-review,retro}.md`: scope steps (AC-5, AC-12), gate (AC-21), exit records (AC-3, AC-13, AC-16), terminal suite (AC-7), retro Draft homes and suite-revision proposal (AC-6, AC-18).
- `.asd/agents/asd-tester.md`: suite-revision mode (AC-17), admission (AC-13), durations (AC-16).
- `.asd/skills/asd-init/SKILL.md`, `.asd/templates/t_commands.yaml`: absent gate classes (AC-8), test-file pattern key (AC-3), duration-form key (AC-16).
- `.asd/templates/t_test-plan.md`, `t_stubs.md`, `t_retrospective.html`: line deltas, allowance, slowest tests, revision ledger; review date; zero-proposal shape.
- `tests/run.js` (11 555 lines, 430 tests): per-test durations (AC-16), split into per-area files with shared fixtures (AC-20), ceiling test (AC-1).
- `.asd/project/commands.yaml`, `.asd/project/` ceiling file, root `.agnix.toml`: this repo's settings for AC-1, AC-3, AC-16, AC-20, AC-21.
- `README.md`, `CHANGELOG.md`, `.asd/release-manifest.json`: mirrors of the above.
- `docs/architecture/tech-reference/gh-2.90.md`: `gh pr list` and `gh pr view` forms (AC-12).

## Existing docs found
- [gh 2.90 reference](../../../docs/architecture/tech-reference/gh-2.90.md): covers issue and PR create/merge forms; no `gh pr list` or `gh pr view --json` listing form.
- [git 2.56 reference](../../../docs/architecture/tech-reference/git-2.56.md): `git diff --numstat -z -M <base>...<head>` already documented (line 16), enough for AC-3.
- [README.md](../../../README.md): mirrors at lines 182-196, 234-251, 334-359 and FAQ 489-493 (phases, reviewer read-only claims, commands schema, test rules).
- [dev-quality-gates](https://github.com/mokevnin/dev-quality-gates) `docs/adopt.md`, `docs/patterns.md`; [OpenClaw CI cost](https://vincent.build/openclaw-ci-cost-reduction/): sources, summarised in `research.md`.
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents): a subagent inherits the parent turn's sandbox; `sandbox_mode` in a custom agent file does not override it.

## Contradictions
- AC-10 ("No agnix dependency or config file is added") vs user request of 2026-11-18 (agnix mandatory each sprint under self-hosting): conflicting criterion; winner=user: AC-10 retired by AC-21.
- `providers.md:41-42,48` (Codex write blocked by per-agent `sandbox_mode: "read-only"`) vs Codex host documentation and agnix CDX-SUB-002 (11 findings: the key has no effect in a custom agent file): canon states a host fact that does not hold; winner=user: remove `codex.sandbox_mode` from canon and rendering, state Codex read-only for advisor, scout and External Review as policy-bound (AC-21).
- agnix CC-SK-007 (15 findings: unrestricted `Bash` in `allowed-tools`) vs `.asd/skills/*/SKILL.md` `claude.allowed-tools`: a phase skill runs the consumer's `commands.yaml` commands, which canon cannot enumerate; winner=user: exclude the rule in `.agnix.toml` with that reason (quality waiver, AC-21).

## Existing implementation found
- `.asd/runtime.js:2126-2139` `contextCommand`: writes a bundle and prints `{out, refs, bytes}`; the bundle path derives from the dispatch id (`agent-protocol.md:27`), so the runtime can size a dispatch's bundle without a new argument (AC-1, AC-2).
- `.asd/runtime.js:1787-1799` `fillDispatchAttrs`, `:2022-2048` `timingSummary`, `:1980-1989` `timingBaseline`: dispatch attrs and medians exist; `suite` ops carry `attrs.scope: full|impacted` in archived ledgers, so a full-suite baseline is computable (AC-18).
- `.asd/runtime.js:2182-2192` `implTestClose`: validates the Entry log row only (AC-13 extends it).
- `.asd/runtime.js:84-87, 688-697` `RETRO_TABLES`, `retroRows`: `systemic-proposals` is `required: true` and fails without `<tbody>` (F-1, AC-11).
- `code-style.md` §17 (`:113-129`): hypothetical-risk criterion, regression-test duty, fail-first proof shape, content-contract rule (AC-9, AC-13, AC-15 change these in place).
- `asd-reviewer-quality.md:97-118`, `asd-reviewer-efficiency.md:105`, `review-policy.md:53`: test rubric and the change-surface invalid-finding rule (AC-14 adds one validity condition).
- `checkpoints.md:7`: quality-waiver hard gate (AC-4 and AC-21 exclusions route through it).
- `asd-phase-impl-review.md:61-66`: terminal full suite; no comparison with the impacted set (AC-7).
- `asd-phase-scope.md` step 2a: triages open issues, never open PRs (AC-12).
- `asd-init/SKILL.md:52-67, 89-98`: detects existing commands; diff mode never re-runs detection (AC-8, AC-3, AC-16 need it there).
- `tests/run.js:25-28, 11527-11555`: flat `test(name, fn)` registry, `--filter <fragment>`, no durations; `sandboxGitRepo()` at `:2620` with 18 call sites; 13 leftover-term sweep tests (sprints 021-036).
- agnix 0.61.0, first run 2026-11-18 (`npx --yes agnix@0.61.0 --strict .claude .codex .agents AGENTS.md CLAUDE.md`, 127 files, 2.9 s): 0 errors, 26 warnings (CC-SK-007 ×15, CDX-SUB-002 ×11), 48 info. Whole-repo run: 3 errors, all outside the checked paths and rejected — `archived/001-…/reviews/impl/iter-01/documentation.md:37` and `archived/029-…/research.md:40` (an `@scope/name` inside prose read as an import; archived sprint records, immutable, loaded by no host), `tests/fixtures/canon/skills/demo-skill/SKILL.md:2` (a `sync.js` transform fixture of `tests/run.js`, loaded by no host).

## Gaps
- No runtime reader of `commands.yaml` or `stubs.md`, no calendar-date validator (AC-3, AC-5, AC-16).
- `test-plan.md` `Suite run` records Command/Scope/Result only: no line deltas, allowance, slowest tests, gap-proof column or revision ledger (AC-3, AC-13, AC-16, AC-17).
- No canon text on suppressions or weakened checks (AC-4); no retro Home of kind "check" (AC-6); no zero-proposal shape in `t_retrospective.html` (AC-11).
- This repo's `commands.yaml` omits `test_affected` on purpose (one file, no selector); AC-20's per-area files make it fillable. `.asd/project/**` is outside every agent's write allowlist: the new keys land through `/asd-init` sprint-mediated mode, declared in the plan.
- `.agnix.toml` is a root file outside Dev's allowlist and outside `managed_paths` (repo-local, never shipped): the orchestrator writes it.
- agnix info findings, not gated by AC-21: CC-SK-025 and CX-SK-004 (skill listing metadata 11.4-12.2 KB against an 8 KB host budget; Codex shortens descriptions past it), CC-SK-031 (`asd-update` description holds a `<version>` tag), AS-025 and AMP-SK-002 (one skill in two provider views, by design).
- External dependency gaps: agnix: fetched by `npx` at the gate; needs npm and, on first use of a version, network.
- Migration gaps: `codex.sandbox_mode`: agent frontmatter key and `sync.js:328,335` rendering → removed; five tests pin it (`tests/run.js:137-181, 1039-1070, 3690, 9452`). Thirteen leftover-term tests: permanent → removed under AC-19 and AC-20.

## Risks
- Rules that land mid-sprint bind this sprint's own later phases (AC-3 allowance, AC-13 gap proof in `impl-test-close`): impact=an `impl-test` entry rejected by a check written in the same sprint; mitigation=plan orders the runtime checks before the test work and the tester records proofs from entry 1.
- AC-20 moves 11.5k test lines under `lite`'s single review wave: impact=review scope far over `WAVE_THRESHOLD_LINES` 3000, a reviewer turn-limit stop (sprint 023); mitigation=the split is its own commit, verified mechanically (same test-name set before and after, suite green), revision edits in later commits.
- Twenty criteria add rule text to bundles of 77-115 KB: impact=the cost AC-1 is meant to bound grows first; mitigation=each edit replaces or tightens existing text where a home exists, ceilings are seeded after the sprint's changes.
- Codex read-only for advisor, scout and External Review becomes policy-bound in the docs: impact=none at runtime (the key never took effect), the stated guarantee weakens; mitigation=agent bodies already forbid writes, External Review keeps `--sandbox read-only` on the wrapped CLI.
- The agnix gate depends on an external binary: impact=a gate that cannot run offline or after an upstream rule change; mitigation=version pinned, a run that cannot start is a gate failure put to the user, never a silent pass.
- Section references such as "`tests/run.js` §16" in `AGENTS.md` and README break when the file is split: impact=stale mirrors; mitigation=AC-20's Task greps and updates them.
