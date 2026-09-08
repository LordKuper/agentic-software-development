---
name: sync-apply-ledger-gotcha
description: node .asd/sync.js --apply recomputes release-manifest.json hash ledgers repo-wide (bites when splitting commits or working in parallel), and how to measure ledger staleness correctly - a raw unnormalized read fakes a repo-wide mismatch
metadata:
  type: project
---

Every `node .asd/sync.js --apply <target>` rewrites `.asd/release-manifest.json`'s `canon_hashes`/`upstream_hashes` for the **whole repo**, not just the requested target.

**Why:** the ledgers are pure functions of on-disk canon content, so the apply step recomputes them unconditionally. `tests/run.js` asserts every `upstream_hashes` entry matches the actual file, so a commit whose canon content and ledger disagree fails the suite.

**How to apply:**
- Splitting one canonical file's changes across two commits: re-run `--apply` between them so each commit carries a ledger matching its own content. Otherwise the intermediate commit is red. Since sprint 008 a bare `--apply` exits 1 and writes nothing, so a ledger-only recompute needs a real (even already-`current`) view target passed to it — see [[sync-apply-target-form]].
- The ledger couples otherwise-unrelated canon edits into one commit: any file in `managed_paths` gets its `upstream_hashes` entry rewritten on every apply, so splitting mixed edits into several commits makes every commit but the last internally inconsistent unless you re-apply between each.
- Working in parallel with sibling agents: your `--apply` sweeps up their uncommitted canon edits into the ledger. Check `git diff .asd/release-manifest.json` before staging and prefer to run it after siblings have committed.
- A non-render canon file — `.asd/rules/*.md`, `.asd/workflows/*.md`, `.asd/migrations/*.js`, `.asd/templates/t_*` EXCEPT `t_AGENTS.md`/`t_CLAUDE.md` (those two DO render the `AGENTS.md`/`CLAUDE.md` managed blocks, so they take the `--apply` path) — is tracked by `managed_paths`/`upstream_hashes` only and has no generated view of its own. Editing one still turns the `upstream_hashes` test red and so needs a ledger refresh, but no `--apply` at all: recompute just that one entry with `sync.sha256Hex(sync.readNormalized(path))` and edit the single line. Keeps the ledger diff scoped to your own change.
- Splitting several non-render canon edits across commits: rebuild the ledger from `git show HEAD:.asd/release-manifest.json` before each commit and refresh only the paths that commit carries. Every intermediate commit then checks out self-consistent (worktree files not yet committed still match their old ledger entry), which a single all-paths recompute up front does not give you.
- Verifying a hand-recomputed ledger: run `--apply` on an already-`current` view target afterwards. `hashLedger.changed: false` in its output proves your hand edit is byte-identical to what sync would have written, and nothing is written. The same call is the cheapest *whole-ledger* refresh when every view is already current: `applied: false` plus `upstreamChanged: true` means it touched only the ledger.
- **Measure ledger staleness with `sync.sha256Hex(sync.readNormalized(p))`, never a raw `readFileSync` hash.** `normalizeText` strips the BOM and folds CRLF/CR to LF before hashing, so a raw read mismatches *every* CRLF file in `upstream_hashes` and reports a repo-wide catastrophe. Sprint 009 lost a task escalation to exactly this: "94 mismatching entries, including files no task touched" turned out to equal the count of tracked files whose worktree copy holds CRLF, while the real count under the test's own hash function was 14. Corollary: `.gitattributes` / `core.autocrlf` / `eol=lf` can never move a ledger entry — if a line-ending change appears to, the measurement is wrong, not the ledger.
