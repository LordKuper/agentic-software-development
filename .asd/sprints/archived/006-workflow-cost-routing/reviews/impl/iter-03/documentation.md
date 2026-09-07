[REVIEW-impl-documentation]: CONCERNS

# Review — documentation

- **Phase**: impl-review
- **Iteration**: 3
- **Severity floor**: high
- **Scope**: incremental, 22 paths (`60a991a…08ea5d1`)

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| F1 | high | home: `.asd/rules/external-review.md:46` (declared SSoT for the manifest contract) — stale copy: `README.md:217` | This wave removed `mode`/`commits[]` from the scope-manifest contract and added `exclude_paths[]` across the template, rule doc, both review workflows, the agent and both prompt templates, but the README mirror still advertises the old shape: `asd-external-review` "reads its own content from a structured scope manifest (**files/commits** + refs, never a rendered diff)". No `commits[]` field exists anywhere in canon now, and `tests/run.js` asserts `mode`/`commits` can never reappear — so README is the only place in the repo still describing a removed contract field, and it omits the newly required `exclude_paths[]` the reviewer must honor. `AGENTS.md` "Hard rules" names README as a mandatory same-change mirror, and this wave did update its `-standard` tier mirror; this one was missed. Rules: D-1 (mirror drifted from its SSoT home), D-8 (framework-mode README consistency). | Replace "(files/commits + refs, never a rendered diff)" with the current shape — the changed-file list plus excluded paths and refs — keeping it a summary that defers to `external-review.md` rather than re-listing the field set a second time. |

## What passed (evidence for the non-finding rows)

- **D-1 / SSoT elsewhere**: the manifest contract is stated once in `external-review.md`; the template, both workflows and the agent agree on one shape and link back rather than re-deriving it. The empty-on-design-review rule for `base_ref`/`head_ref` is owned by the rule doc; the two remaining restatements are justified transport copies (the rendered prompt an external CLI reads, and a one-clause parenthetical citing the home). The preflight cache path is named once and gitignored; both workflows cite it as sole SSoT. The `t_AGENTS.md` managed-block fact now has its home in `providers.md:9`, with `sprint-lifecycle.md` and `README.md` linking to it.
- **D-2**: responsibility frontmatter present and respected on the templates in scope; rule, workflow and agent docs keep their declared section shapes.
- **D-7**: `5.0.0.js`'s header states file-level context only and no longer summarizes its members' docs; member docs state purpose, not implementation; no in-body comments. `.asd/runtime.js` carries zero in-body comments and a doc comment on every exported member, `buildInvocation` included. New test cases carry assertion messages rather than in-body comments.
- **D-8** (beyond F1): phase list, agent roster (11 canonical, 15 generated = 11 + 4 tier variants), model tiers for both providers, `model_families`, config schema and folder map are consistent; README and CHANGELOG no longer advertise a `-standard` variant and both match `providers.md`, which both dispatch workflows now cite verbatim. `providers.md` names `execution` as the selector of record. The impl-review commit clause matches across `git-strategy.md`, the workflow and `asd-tester.md`. Generated views for the two changed agents are in sync with canon.
- **D-9**: framework vocabulary used consistently; the zero-dependency and sync-after-canon-edit rules hold for the changed Node files.

## Sub-floor residual notes (dropped at floor `high`)

The impl prompt says "scope manifest (below, JSON)" while the block renders above it (the design counterpart says "above" correctly); `AGENTS.md` states the managed-block/tail split twice in one file on top of the `providers.md` home; `git-strategy.md:27` writes the stub marker as `// TODO(sprint-NNN)` where `code-style.md` writes `// TODO(sprint-<NNN-slug>)` (unchanged line, outside the change surface).

## Coverage

Manifest: [`documentation.manifest.json`](documentation.manifest.json) (digest `ac684d72…d7f0b5`). Validated ledger: [`documentation.ledger.json`](documentation.ledger.json). `validate-ledger` → `{"ok":true}`. `HTML_SHELL`/`PROVENANCE` are `n/a: no-html-artifact-in-scope`; `TRACEABILITY`/`PERSISTENT_ACTUALITY` are `n/a: documents-disabled`.

## Verdict
CONCERNS: 1

## Next action
Route to `impl` review-fix mode: a documentation-only fix in `README.md`. No escalation triggers — no concept, requirement or contract change, no new abstraction, no scope expansion.

## Escalations
None.
