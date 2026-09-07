[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium (all `low` findings and nitpick categories dropped)
- **Scope**: incremental, 32 paths (`11333cb…60a991a`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | high | `.asd/templates/external-review/t_review-scope.json:1-9` (home: `.asd/rules/external-review.md:46`) | The new scope-manifest template omits `exclude_paths[]`. `external-review.md` "Phase-scoped payload" declares it a manifest field, both review workflows say they emit it, `asd-external-review.md:47,105` requires the agent to honour it, and both prompt templates instruct the wrapped CLI to read it. The one artifact that defines the emitted shape is missing the field that enforces the read boundary. | Add `"exclude_paths": ["{{PATH}}"]` to the template so the declared schema matches the SSoT rule doc and both emitters. |
| F2 | high | `.asd/workflows/asd-phase-impl-test.md:29`; also `.asd/workflows/asd-phase-impl.md:61` | Post-removal of the `standard` variants, impl-test still says `execution="agent"` selects `asd-tester-<tier>`. `routeTask` returns `tier` ∈ `mechanical\|standard\|critical`, so the default path resolves to `asd-tester-standard`, which no longer exists (`.claude/agents/`, `.codex/agents/` hold 15 files = 11 roles + 4 variants). `providers.md:65,101` had to add "(standard: no variant, dispatches base)" precisely for this; neither workflow carries it. | In both workflows state the mapping explicitly: `mechanical`/`critical` → `asd-<role>-<tier>`; `standard` → the base agent id, linking `providers.md` "Task-class variants and routing". |
| F3 | high | `.asd/migrations/5.0.0.js:1-24` vs `:40-41`, `:53-54` (`code-style.md` §7) | The new module header duplicates its members' docs. Lines 10-15 restate `skippedModified` ("carries the ownership marker but whose body digest no longer matches it") and `skippedUnsafe` ("real path resolves outside the repo root (symlink escape)") — the exact facts `intactGeneratedView`'s and `staysWithinRepo`'s docs already own. §7: "Type-level doc: short, states the type's purpose ONLY — never duplicates or summarizes its members' docs." | Cut the MigrationReport field-by-field gloss and the "Scope"/"Never touches" restatement from the header; keep only the module's purpose and let the member docs own their semantics. |
| F4 | medium | `README.md:205`; `CHANGELOG.md:10` | Both still advertise a generated `-standard` tier variant that this wave removed, while `README.md:321`/`:327` simultaneously state "11 roles + 4 tier variants" — README contradicts itself, and the changelog promises consumers an agent that will not exist in v5.0.0. | README → "`-mechanical` Haiku (no effort)/Luna low, `-critical` Opus/Sol high; the `standard` tier has no variant and dispatches the base `asd-dev`/`asd-tester`." Same correction in CHANGELOG (no `### Removed` entry needed — the variants never shipped outside unreleased v5.0.0). |
| F5 | medium | `.asd/rules/sprint-lifecycle.md:273`; `.asd/workflows/asd-phase-impl-test.md:31` | Two citations point at `external-review.md` sections the contract rewrite renamed or deleted. `sprint-lifecycle.md:273` cites "Iteration-aware diff" — now "Iteration semantics". `asd-phase-impl-test.md:31` cites "`<pathspec>` for impl-review" — no such section exists; the scoping now lives in "Phase-scoped payload" and is expressed as `exclude_paths`, not `<pathspec>`. Both dangling links defeat the link-don't-copy rule they exist to serve. | Retarget to "Iteration semantics" and "Phase-scoped payload" respectively, and align impl-test's `<pathspec>` vocabulary with the `exclude_paths` terminology. |
| F6 | medium | `.asd/workflows/asd-phase-design-review.md:35` vs `.asd/rules/external-review.md:46,48` | The design-review manifest field list is `phase`, `iteration`, `mode`, `files[]`, `exclude_paths[]` — no `base_ref`/`head_ref`. The rule doc states "`base_ref`/`head_ref` still travel on every manifest" and `t_review-scope.json:4-5` declares both as required keys. A design-review manifest built to this step is schema-incomplete against its own template. | Either add `base_ref`/`head_ref` to step 7's field list, or amend "Phase-scoped payload" to scope the "every manifest" claim to impl-review — one home, one statement. |
| F7 | medium | `AGENTS.md:76` and `AGENTS.md:96`; also `sprint-lifecycle.md:110`, `README.md:437`, `.asd/sync.js:1158-1160` (home: `providers.md:9`) | The fact "root `AGENTS.md`'s managed block generates from `t_AGENTS.md` in every repo; this repo's prose lives below `<!-- asd:end -->` where sync never reaches" is stated five times, twice inside the restructured `AGENTS.md` tail alone. The explicit deliverable for this wave was that no fact is stated twice in the merged document. | Keep the statement once in `AGENTS.md`'s Override section (`:76`) and reduce `:96` to the template-role sentence without repeating the block/tail split; trim `README.md:437` and `sprint-lifecycle.md:110` to links to `providers.md`'s ownership table. |
| F8 | medium | `.asd/workflows/asd-phase-impl-review.md:7` vs `.asd/rules/sprint-lifecycle.md:26` | The precondition declares "(`sprint-lifecycle.md`'s impl-review contract, sole SSoT — **not restated here**)" and then restates it, including the carve-out near-verbatim with the identical parenthetical list. A self-contradicting SSoT claim over normative text that will drift. | Keep only the mechanic in the workflow (`git status --porcelain` non-empty → `FAILED` naming dirty paths, measured once before step 1) and delete the duplicated carve-out sentence, leaving the link. |

## Coverage

Manifest: [`documentation.manifest.json`](documentation.manifest.json) (digest `787d415f…9677f5`). Validated ledger: [`documentation.ledger.json`](documentation.ledger.json). Findings: [`documentation.findings.json`](documentation.findings.json). `validate-ledger` → `{"ok":true}`.

`HTML_SHELL`/`PROVENANCE` (`D-3`/`D-4`) `n/a: no-html-artifact-in-scope` — verified: none of the 32 scoped paths carries an `.html` extension. `TRACEABILITY`/`PERSISTENT_ACTUALITY` (`D-5`/`D-6`) `n/a: documents-disabled`. All other rules and sections reviewed in full.

## Verdict
CONCERNS: 8 (3 high, 5 medium)

All eight are autofixable by the responsible creator inside scope — no concept, requirement, contract or abstraction change is implied, so none meets the `review-policy.md` escalation bar.

## Next action
Route to `impl` in review-fix mode. Priority: F1 (the read boundary is unenforceable until the template declares it), F2 (dispatch resolves to a nonexistent agent on the default tier), F3 (`code-style.md` §7 violation in newly added code), then F4-F8.

## Escalations
None.
