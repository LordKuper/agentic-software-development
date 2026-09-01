[REVIEW-impl-external]: FAIL

# External Review Report

- **Phase**: impl-review
- **Iteration**: 1
- **Severity floor (this iter)**: low
- **Wrapped CLI**: codex-cli 0.150.1, `codex exec --sandbox read-only -`, prompt+diff via stdin (windows), verdict `FAIL: 4` (all `major` → ASD `high`)

## Kept findings

| # | Severity | Location | Description | Suggested fix |
|---|---|---|---|---|
| 1 | high | `.asd/templates/t_config.yaml:13` (repeated at `README.md:227`) | Codex #1 (major): out-of-scope occurrence wrongly renamed — the `documents.prd` comment was `design/prd.html + persistent requirements`, where `design/prd.html` is the **sprint draft** `<sprint>/design/prd.html` (AC-3 protected). Now reads `docs/prd.html`, a nonexistent artifact — the persistent counterpart is `docs/product/requirements/*.html`, never `docs/prd.html`. Verified: `main` shows the sprint-draft meaning; same defect mirrored to `README.md:227`. Same wording also sits in this repo's own `.asd/project/config.yaml:15` (outside payload — fix in the same pass). | Restore the sprint-draft reading in both places, e.g. `<sprint>/design/prd.html + persistent requirements` (unambiguous), or revert to `design/prd.html` |
| 2 | high | `.asd/templates/t_sprint.md:5` | Codex #2 (major): `delegates_to` was `plan.md (tasks), design/ docs (decisions), audit.md (audit)` — all three are **siblings inside the sprint folder**; `design/` here is the protected `<sprint>/design/` draft folder holding the decision drafts (adr.html), not the persistent root. Renamed to `docs/`, redirecting sprint decisions to the repo-level root — an AC-3 misclassification (plan Task 2 listed this line as in-scope; audit classification appears wrong). | Restore `design/ docs (decisions)` (or clarify as `<sprint>/design/`) |
| 3 | high | `.asd/templates/t_plan.md:23-25` | Codex #3 (major): the three generated Context links use `../../docs/...`; rendered plan.md lives at `.asd/sprints/<NNN-slug>/plan.md`, so `../../` resolves to `.asd/` — links point at nonexistent `.asd/docs/`. **Pre-existing on `main`** (`../../design/...`, same wrong depth); the sprint preserved the prefix deliberately per plan convention G-5, so this is surfaced, not introduced, by the diff. | Change targets to `../../../docs/...` — but see Next action: correcting depth contradicts approved plan convention G-5 ("preserve the `../../` prefix exactly"), so needs a decision, not silent autofix |
| 4 | high | `CHANGELOG.md:8` | Codex #4 (major): migration step `git mv design docs` is wrong for any consumer that already has a `docs/` directory — git moves `design/` **into** it, yielding `docs/design/…`, a silently invalid layout (exactly the split-corpus failure mode the entry itself warns about). Violates `backward_compat: migration` (documented migration path must be correct). | Document both cases: no existing `docs/` → `git mv design docs`; existing `docs/` → move children (`git mv design/product design/architecture design/ux docs/` style) with explicit collision handling |

## Dropped findings (below severity floor)

| # | Severity | Location | Description | Drop reason |
|---|---|---|---|---|
| — | | | none — floor is low on iter 1 | |

## Dropped findings (nitpick)

| # | Location | Description | Drop reason |
|---|---|---|---|
| — | | none raised | |

## Verdict
FAIL: 4

## Next action
Route sprint back to `impl` (review-fix mode, per review-policy "Autofix vs escalation"):
- Findings 1, 2, 4 — creator (backend-dev) autofix: revert the two AC-3 mis-renames in canon + README mirror + `.asd/project/config.yaml:15`, rewrite the CHANGELOG migration step for the existing-`docs/` case, then re-run sync/hash-ledger steps (plan Tasks 9-10) since canon templates change.
- Finding 3 — escalate to user before fixing: the correct fix (`../../../docs/...`) contradicts the plan-approved G-5 "preserve `../../` exactly" convention and exceeds the pure-rename scope; options: fix the pre-existing broken depth in this sprint, or defer to a follow-up and keep the rename pure.
- Caveat: two of the wrapped CLI's whole-repo verification greps failed to spawn in its sandbox (Windows error 1920, logged in stdout); its AC-7 completeness sweep was file-read-based rather than exhaustive grep — internal reviewers' coverage ledgers should not assume external grep confirmation of rename completeness.
</content>

## Escalation resolution

User decision (2026-09-01, Complication Approval, impl-review iter-01):

- **Findings #1, #2, #4 — accepted, no override.** Kept in the fix set: revert the two over-renamed sprint-draft references in `t_config.yaml:13` / `README.md:227` / `t_sprint.md:5` plus the mirror at `.asd/project/config.yaml:15` (outside the review diff pathspec, but in scope for the fix), and rewrite the `CHANGELOG.md:8` migration step so `git mv design docs` handles consumers who already have a `docs/` directory.
- **Finding #3 — accepted, fix now (not deferred).** `t_plan.md:23-25` relative-link depth `../../` → `../../../`. Pre-existing bug exposed but not caused by this rename; also raised independently by the Quality reviewer as its own finding #2. User chose to include it in this sprint's fix pass rather than defer to a follow-up, overriding the plan-approved G-5 "preserve `../../` exactly" convention for these lines only.

Net: 4 of 4 FAIL findings survive into the impl review-fix set; none overridden.
