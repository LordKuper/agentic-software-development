[REVIEW-impl-simplification]: CONCERNS

# Review — simplification

- **Phase**: impl-review
- **Iteration**: 2
- **Severity floor**: medium (low findings dropped from verdict computation)

Note on method: I have no shell access (read-only tool policy per my agent definition), so I could not execute the supplied `git diff`. I reconstructed the change set by reading the current state of all 16 scoped files plus the sprint's `sprint.md` acceptance criteria. Findings below are anchored to current file content and line numbers.

## Findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | medium | `.asd/templates/t_sprint.md:5`, `.asd/templates/t_test-plan.md:5`, `.asd/templates/t_plan.md:5`, `.asd/templates/t_config.yaml:13`, `.asd/workflows/asd-phase-impl.md:41,69` | **Revert-vs-reword split is arbitrary and leaves the token ambiguous.** The rename created two distinct referents that now share one word: the sprint-local draft folder `<sprint>/design/` (intentionally kept) and the old persistent root (renamed to `docs/`). The fix pass resolved the identical frontmatter field three different ways across three sibling templates: `t_plan.md:5` → `persistent docs (requirements/design)`; `t_sprint.md:5` → `design/ docs (decisions)`; `t_test-plan.md:5` → `design/ docs (requirements)`. Same class in `t_config.yaml:13` (`# design/prd.html + persistent requirements`, no `<sprint>/` prefix) and `asd-phase-impl.md`, which uses three vocabularies for the referent within one file — `persistent docs` (:12, :35) vs `design-doc scope` (:41, :69). Concrete risk, not wording taste: AC-7 is itself a **grep-based** criterion, and a bare surviving `design/` is now indistinguishable by grep or by a human reader from a missed rename, so a genuinely missed rename passes silently. Evidence the ambiguity already misfires: this sprint's own generated `.asd/sprints/001-rename-design-to-docs/sprint.md:5` reads `docs/ docs (decisions)` — the template's referent was resolved the *other* way by its own consumer (that file is out of diff scope; cited as consequence only). Further evidence of meaning drift: `.asd/agents/asd-reviewer-simplification.md:98` was reworded `design docs` → `persistent docs`, which narrows the prohibition so it no longer covers the `<sprint>/design/` drafts a design-review simplification pass actually looks at (low severity on its own — reviewers have no `Write`/`Edit` tools on either provider, so enforcement is unaffected; listed as evidence, not scored). | Pick one vocabulary and apply it uniformly, no new construct: write `<sprint>/design/` (with the prefix) wherever the phase-local draft folder is meant, and `persistent docs` (or the literal `docs/` path) wherever the project-wide root is meant. Concretely: `t_sprint.md:5` → `<sprint>/design/ drafts (decisions)`; `t_test-plan.md:5` → `<sprint>/design/ drafts (requirements)` — or `persistent docs` in both if the persistent root is what was meant; `t_config.yaml:13` → `<sprint>/design/prd.html + persistent requirements` (mirror the same edit in `README.md:227`); `asd-phase-impl.md:41,69` → `plan + persistent docs scope`, matching :12/:35. Zero abstraction added — this is vocabulary unification, one word per site. |
| 2 | medium | `CHANGELOG.md:8` | **Migration procedure content is proportionate; its delivery form is not.** The existing-`docs/` branch is load-bearing — `git mv design docs` into a pre-existing `docs/` silently produces `docs/design/...`, and the entry correctly says nothing errors. That justification holds for the collision sub-branch and the `/asd-update` → `/asd-sync` split-brain window too. The defect is that a 5-step ordered procedure with 2 conditional branches and a failure-mode note is encoded as a single ~330-word unbroken bullet. A consumer mid-migration cannot track position in it, and the entry is the *only* documentation of this migration (correctly — `README.md` carries no duplicate, SSoT respected). Skipping a step yields a silently split documentation corpus, so density here carries concrete risk rather than being cosmetic. | Keep every branch and warning verbatim — do not trim content. Restructure in place, inside the existing `### Changed` section: one-line breaking-change summary, then a numbered list (1. move the root — with the two `git mv` variants as sub-bullets and the collision caveat under the second; 2. fix `designmd-*` aliases in your own `commands.yaml`; 3. `/asd-update`; 4. `/asd-sync` immediately after), then the split-brain/"nothing errors" note as a closing sentence. No new file, no new section, no new heading level beyond a list. **Cross-reviewer guard:** the fix must NOT become a separate `MIGRATION.md`, a migration script, or an `/asd-migrate` command — any of those is a new artifact/abstraction and would require Complication Approval before implementation. |

## Coverage ledger

### File coverage
| File | Status |
|---|---|
| `.asd/agents/asd-reviewer-simplification.md` | checked — `design docs` → `persistent docs` at :98 is a one-word reword, no structural change; narrowed prohibition scope noted as evidence under finding #1 (low, dropped by floor) |
| `.asd/release-manifest.json` | checked — only surviving `design` tokens are `asd-phase-design/SKILL.md` hash keys (:54, :99), correct per AC-3; no new managed path, key, or schema field added; hash-ledger shape unchanged |
| `.asd/rules/language-policy.md` | checked — `:8` matrix row now reads `persistent docs`; row count and matrix structure unchanged, no new rule or clause added |
| `.asd/rules/review-policy.md` | checked — `:136` `independent of persistent docs`; checklists, severity table, ledger rules structurally unchanged; no new policy mechanism |
| `.asd/skills/asd-init/SKILL.md` | checked — `docs/product/concept.html`, `docs/architecture/stack.html`, `docs/ux/…` path updates (:58-60, :101-109) are literal path swaps; step count unchanged; no new detection step, tool, or config key added |
| `.asd/templates/t_config.yaml` | checked — no new config key or flag introduced by the rename (checked against the premature-config-flag item); `:13` comment ambiguity → finding #1 |
| `.asd/templates/t_plan.md` | checked — `:5` reworded to `persistent docs`, `:23-25` links repointed to `docs/…`; template structure unchanged → finding #1 (consistency) |
| `.asd/templates/t_sprint.md` | checked — `:5` retains `design/ docs (decisions)` → finding #1 |
| `.asd/templates/t_test-plan.md` | checked — `:5` retains `design/ docs (requirements)` → finding #1; table structure and column set unchanged |
| `.asd/workflows/asd-phase-impl-review.md` | checked — `:32` reviewer line and `:12` read-list reworded to `persistent docs`; reviewer roster, payload shape, ledger gate, and verdict aggregation unchanged; no new reviewer, gate, or branch added |
| `.asd/workflows/asd-phase-impl-test.md` | checked — `:11`, `:29` path/vocabulary updates only; no new strategy step or delegation added |
| `.asd/workflows/asd-phase-impl.md` | checked — `:68` `docs/architecture/tech-reference/…` path swap; self-hosting write-scope list (:47) unchanged in shape; mixed vocabulary at `:41`, `:69` → finding #1 |
| `.asd/workflows/asd-phase-plan.md` | checked — `:7`, `:11`, `:19`, `:21` reworded to `persistent docs` consistently within the file; no new step or payload field |
| `CHANGELOG.md` | checked → finding #2 |
| `README.md` | checked — folder map `:306-320` renamed root with subtree intact (AC-2); `:83`, `:154`, `:172-176`, `:329` updated; **no duplicated migration prose** (SSoT preserved, correctly deferred to `CHANGELOG.md`); `:227` mirrors `t_config.yaml:13` including its ambiguity → covered by finding #1's fix |
| `tests/run.js` | checked — the strengthened assertion at `:1310-1320` (`upstream_hashes` integrity) adds exactly one inline guard, `if (!fs.existsSync(abs)) { stale.push(\`${relToRepo} (missing on disk)\`); continue; }`, plus the existing `deepStrictEqual(stale, [])` aggregation. No helper function, no fixture, no config flag, no new dependency (`node:fs` only, satisfying `custom-coding-rules.md`'s zero-dependency rule). It is not defensive-code-for-impossible-case: a manifest path pointing at a file the rename moved is exactly the reachable failure this sprint can produce, and the guard converts an ENOENT throw that aborts at the first bad entry into a complete, actionable list of all bad entries. Proportionate — keep as is |

### Rule coverage
| Rubric item | Status |
|---|---|
| Interface with exactly one implementer | n/a: no interfaces/types introduced — diff is Markdown/YAML/JSON prose plus one inline test guard |
| Generic with exactly one concrete type parameter | n/a: no generics in scope |
| Factory for fewer than three classes | n/a: no factories in scope |
| Plugin system with no plugin | pass — no extension point added; `asd-init` tool-detection and `release-manifest` managed-path lists gained no new pluggable slot |
| Abstraction with no second use case | pass — `tests/run.js` guard is inline at its single call site, not extracted; no new template, rule doc, workflow step, or shared helper introduced anywhere in the diff |
| Premature config flag (no caller chooses non-default) | pass — `t_config.yaml` gained no key; the rename introduced no `docs_root`/path-override/compat toggle, correctly treating the rename as a hard break documented in `CHANGELOG.md` |
| Defensive code for impossible-by-contract case | pass — `tests/run.js:1315` existence check guards a reachable state (manifest entry vs. moved file) and improves diagnostics by aggregating all failures; earns its two lines |
| Helper that wraps one stdlib call without added value | pass — no new helper in `tests/run.js`; existing `loadManifest`/`readRaw`/`mkTempDir` untouched, guard written inline |
| Inheritance depth ≥ 3 without polymorphic dispatch | n/a: no class hierarchies in scope |
| Framework wrapping a framework | pass — test file remains plain Node with zero deps; no runner or assertion wrapper added |
| Mock of a mock in tests | pass — the strengthened assertion checks real files on disk against real manifest entries; no mock introduced or layered |
| Comment that restates code | pass — the one inline comment retained at `tests/run.js:1316` (`upstream_hashes are bare hex, no "sha256:" prefix`) explains a non-obvious format asymmetry vs. `canon_hashes`, not the code; section banner at `:1292-1297` states rationale, not mechanics |
| Dead code left "in case we need it" | pass — no commented-out blocks, no retained `design/` compatibility branch, no unused export left behind by the rename |
| Structure/cohesion: god / sprawling type | pass — no type or module gained responsibilities. `tests/run.js` is a flat registry of independent `test()` closures, not a type; the two changed workflow files kept their existing phase-scoped responsibilities; the three templates each keep one `responsibility.owns` clause |
| Generic complexity-vs-value (does the complication earn its weight?) | finding #2 — `CHANGELOG.md` migration content earns its weight, its single-bullet delivery form does not; all other changes are 1:1 substitutions with no weight added |
| `design-principles.md` #2 KISS / `core.md` Simplicity Default | pass — no new abstraction, layer, interface, dependency, or config flag anywhere in the diff; no Complication Approval owed |
| `design-principles.md` #5 SSoT | pass — migration procedure lives only in `CHANGELOG.md`; `README.md` links/mirrors rather than restating it; `t_config.yaml:13` ↔ `README.md:227` is an allowed sanctioned mirror per `AGENTS.md` |
| `design-principles.md` #4 loose coupling / high cohesion | finding #1 — one referent expressed in three vocabularies across sibling templates and within a single workflow file is a cohesion defect in the documentation surface |
| `.asd/project/custom-common-rules.md` | pass — framework-repo vocabulary (canonical source / provider view / consumer) used correctly; `CHANGELOG.md` entry addresses the consumer, the right audience for a breaking-change note |
| `.asd/project/custom-coding-rules.md` | pass — `tests/run.js` change stays zero-dependency (`node:fs`/`node:path` only), no YAML library introduced. Sync-after-canon-edit rule: n/a — generated views are excluded from this diff scope by the supplied pathspec |

## Verdict
CONCERNS: 2

Both findings are `simplify` (no new abstraction, layer, or dependency in either fix). Neither requires escalation. No `keep-as-is` finding was suppressed; one low-severity observation (`asd-reviewer-simplification.md:98` scope narrowing) is recorded as evidence under finding #1 and excluded from the count per the medium floor.

## Next action
impl-review routes back to `impl` in review-fix mode (`review-policy.md`). The responsible dev:
1. Unifies the `design`-referent vocabulary across `t_sprint.md:5`, `t_test-plan.md:5`, `t_config.yaml:13` (+ `README.md:227` mirror), and `asd-phase-impl.md:41,69` — `<sprint>/design/` for the phase-local drafts, `persistent docs`/`docs/` for the root.
2. Restructures `CHANGELOG.md:8` into a numbered procedure in place, preserving all branches and the split-brain warning verbatim.
3. Re-runs `node .asd/sync.js --apply <targets>` for any canonical edit and `node tests/run.js`, then re-enters `impl-review` via `impl-test`.

## Escalations
None. Both fixes are decomposition/rewording within existing files; neither adds an abstraction, layer, interface, dependency, or config flag, so no Complication Approval is owed. Guard for the fix pass: finding #2 must not be resolved by creating a `MIGRATION.md`, a migration script, or a new command — that would convert a `simplify` fix into a complication requiring user approval.

---

Files referenced (absolute paths): `D:\Projects\agentic-software-development\CHANGELOG.md`, `D:\Projects\agentic-software-development\README.md`, `D:\Projects\agentic-software-development\tests\run.js`, `D:\Projects\agentic-software-development\.asd\templates\t_plan.md`, `D:\Projects\agentic-software-development\.asd\templates\t_sprint.md`, `D:\Projects\agentic-software-development\.asd\templates\t_test-plan.md`, `D:\Projects\agentic-software-development\.asd\templates\t_config.yaml`, `D:\Projects\agentic-software-development\.asd\workflows\asd-phase-impl.md`, `D:\Projects\agentic-software-development\.asd\agents\asd-reviewer-simplification.md`.
</content>
