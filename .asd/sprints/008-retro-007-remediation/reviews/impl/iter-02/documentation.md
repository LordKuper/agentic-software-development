[REVIEW-impl-documentation]: CONCERNS
Interrupted attempts: 1 (session rate limit)

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2 (severity floor: medium — 5 `low` findings dropped, not listed)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| D-1 | high | `.asd/workflows/asd-phase-impl-review.md:74` (home: `.asd/rules/sprint-lifecycle.md:316-317`) | New step 13 restates the `derived_handoff` derivation rule it should only cite, and contradicts it twice. Rule doc: `head` = the newest commit in `<base>..HEAD` touching `pathspec`, "**never raw `HEAD`**, so a bookkeeping commit never invalidates the record", and "re-recorded at phase exit — **the same diff re-run** in the final bookkeeping write". Step 13 says "rewrite … with **step 1's scope file list** and `head` = **`git rev-parse HEAD`** at that moment", i.e. the sha of the bookkeeping commit. A reader computing `head` per the rule can never match that value, so the exit record is invalid by construction — defeating the very fix the decisions log records. Sibling `asd-phase-impl-test.md:53` does it correctly. The AC-11 SSoT test only pins the object literal, so it does not catch this. Secondary: step 13 writes `state.json` *after* the exit commit, leaving the worktree dirty at COMPLETED, whereas impl-test re-records *before* committing. | Reduce step 13 to a phase binding — "re-record `derived_handoff` by re-running step 1's diff, per `sprint-lifecycle.md` 'State recovery' phase-exit re-record" — drop the `head` clause entirely, and order it before the exit bookkeeping commit as impl-test does. |
| D-2 | high | `.asd/project/commands.yaml:16` (caused by `.asd/sync.js:1469-1472`) | The registered command `sync-apply: "node .asd/sync.js --apply"` is a bare `--apply` with no targets, which this iteration made fail closed (`ok:false`, exit 1). `asd-dev` may run `custom.*` commands verbatim (`asd-dev.md:63`), so the project's only registered sync-apply command now always fails, and it is the one remaining site still using the invocation form the round set out to eliminate. Valid under the change-surface exception: the change made unchanged content incorrect. | Delete the `sync-apply` entry (it cannot be expressed as a fixed string once targets are mandatory), or replace it with the documented form. Needs the orchestrator to extend the existing one-off `.asd/project/**` write authorization to `commands.yaml`. |
| D-3 | medium | `.asd/rules/sprint-lifecycle.md:115`, mirrored `.asd/templates/external-review/t_prompt-external-impl.md:20` | The new gloss defining the excluded generated views as "**everything `sync.js --apply` writes**" is factually wrong and over-reaches the review surface: `--apply` also writes `.asd/sync-state.json` and `.asd/release-manifest.json` — both canon, both in this same section's write allowlist, and `release-manifest.json` is a scoped, reviewed file in this very iteration's manifest. `tests/run.js:3055-3056` asserts exactly those two files are what a normal `--apply` writes. Read literally, the gloss removes canon from framework impl-review and External Review scope. | Replace the gloss with the enumerated globs only — "(`.claude/{agents,skills,hooks}/**`, `.claude/settings.json`, `.codex/**`, `.agents/skills/**` — the generated views, never `.asd/` canon)". Same edit in the prompt-template mirror, keeping the two byte-consistent. |
| D-4 | medium | `.asd/rules/providers.md:111` (duplicate rule: `.asd/rules/sprint-lifecycle.md:232`) | "Those five named classes are reserved" has no resolvable antecedent: the sentence it refers back to names **eight** classes, and an intervening sentence about artifact risks separates them. The precise list exists only in code (`runtime.js:12` `RESERVED_CHANGE_RISKS`) and in `sprint-lifecycle.md:232`, which restates the reservation rule verbatim in substance even though `sprint-lifecycle.md:235` names providers.md as the owner of routing semantics. A plan author reading the owning doc cannot tell whether "ambiguous judgment" may be typed `artifact`. | In providers.md name the five explicitly (or cite `runtime.js`'s `RESERVED_CHANGE_RISKS`); reduce `sprint-lifecycle.md:232` to a citation rather than a second statement. |
| D-5 | medium | `AGENTS.md:74`; also `README.md:38,106,440`, `.asd/agents/asd-dev.md:66`, `.asd/skills/asd-update/SKILL.md:37`, `.asd/workflows/asd-phase-impl.md:49`, `.asd/project/custom-coding-rules.md:14` (home: `.asd/rules/providers.md:12-13`) | The wording fix landed as a ~40-word parenthetical copied verbatim into 8 sites, five of them always-loaded; sync then mirrors it into 6 more generated views. Those four path shapes are exactly the `providers.md` "Canonical path -> per-provider path" rows. This is the fix-round pattern of clarifying by restating at the use site: one home became nine, in the sprint whose subject is removing prose duplication, and against `AGENTS.md`'s "dedup to SSoT (restated facts → link to canonical home)" — the generated-view path shapes are not among the allowed mirrors. | Keep the corrected token `--apply <generated-view-path...>` everywhere, but replace the parenthetical with a link — "(generated view paths only, per `providers.md` 'Canonical path -> per-provider path')" — in the canonical agent/workflow/rule sites; a consumer-facing expansion may stay in README. |

## Verified clean (claims checked independently)

- Both `*-review` workflows are genuinely cut to citation + one "Phase bindings" bullet; trigger, partition recipe, union property and merge layout are deleted from both, and the two files are byte-parallel apart from the phase substitution.
- Self-hosting exclusion: `sprint-lifecycle.md:115` is the home; `external-review.md:54` and `:60` both link to it; `t_prompt-external-impl.md:20` restates it (accepted precedent — external prompts are stdin payload to another CLI). All three agree on the path list and on `.claude/agent-memory/**` not being excluded. The only defect is the shared gloss, D-3.
- `derived_handoff` shape/validity is stated only at `sprint-lifecycle.md:316-318`; both workflows cite without restating `base`/`head`/`pathspec`. Only step 13 breaks it (D-1).
- Agent-memory carve-out consistent across `artifact-layout.md`, `sprint-lifecycle.md`, `custom-coding-rules.md` and the README folder map; the compressed carve-out keeps the load-bearing reason.
- `t_review.md` now describes all three legal shapes (normal, interrupted, split-merged) and its optional line does not displace the first-line verdict token; `review-policy.md:130` carries the matching carve-out.
- In-code doc comments: this diff adds no new in-body comment. `sync.js`'s edit shrinks a pre-existing comment and removes its `AGENTS.md` reference; `runtime.js:34` stays a purpose-level member doc; the new `tests/run.js` cases add none and delete two.
- Framework mode: README phase list, agent roster, model tiers, config schema, folder map and command list need no change from this diff; `core.md` "See also" unaffected; phase chain untouched; `release-manifest.json` carries an entry for every changed canon file and no orphan entry; generated views for `asd-dev` and `asd-update` contain the new wording, so sync was run.
- `custom-coding-rules.md` agrees with both the corrected `--apply` wording and the agent-memory carve-out.
- `review-policy.md:144`'s `validate-partition` helper is correctly labelled as not yet existing — confirmed absent from `runtime.js`, so it is a stated future contract, not drift.

## Coverage

Validated compact ledger: [`documentation.ledger.json`](./documentation.ledger.json) against immutable manifest [`documentation.manifest.json`](./documentation.manifest.json), findings [`documentation.findings.json`](./documentation.findings.json). `node .asd/runtime.js validate-ledger` → `{"ok":true}`. 19/19 files, 10/10 rules, 9/9 sections resolved; the four pre-authorised `n/a` predicates verified rather than assumed.

## Verdict

CONCERNS: 5 (2 high, 3 medium)

## Next action

Route to impl review-fix mode. Suggested grouping: (a) step 13 — D-1; (b) `sprint-lifecycle.md:115` + the prompt-template mirror — D-3; (c) `providers.md:111` + `sprint-lifecycle.md:232` — D-4; (d) the eight `--apply` parenthetical sites — D-5; (e) `commands.yaml:16` — D-2, which needs the write authorization noted below. Every canonical edit is prose-only except (e); re-run `sync.js --apply` for `asd-dev`/`asd-update` if (d) touches them, then `node tests/run.js`.

## Escalations

None required as a reviewer escalation. D-2 is not a concept/abstraction/scope/contract change — it needs only the routine one-off write authorization, handled inline by the orchestrator.
