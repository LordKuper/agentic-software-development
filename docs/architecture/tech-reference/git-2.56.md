---
responsibility:
  owns: project-vetted reference for one technology version (apis used, version specifics, project conventions)
  excludes: adr rationale, code, full stack overview, build commands
  delegates_to: stack.html (overview), commands.yaml (commands); decisions fold per sprint-lifecycle.md "Design-promote phase" fold rule into whichever persistent doc's owns matches
---

# Git @ 2.56

## Canonical source
- Official docs: https://git-scm.com/docs/git-diff , https://git-scm.com/docs/git-show , https://git-scm.com/docs/gitrevisions ; `--pathspec-from-file` holders: https://git-scm.com/docs/git-add , https://git-scm.com/docs/git-commit/2.25.0 , https://git-scm.com/docs/git-rm , https://git-scm.com/docs/git-checkout , https://git-scm.com/docs/git-restore , https://git-scm.com/docs/git-stash ; Windows command-line cap: https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw
- Last verified: 2026-11-17 (installed `git version 2.56.0.windows.4`, local `git --html-path` docs for `git-show`/`git-diff`; `git show <ref>:<path>` on an absent path run live; `git diff --pathspec-from-file=<file>` prints usage and exits non-zero)

## API surface used in project
- `git --literal-pathspecs diff -M --no-color --no-ext-diff --no-textconv <base>...<head> -- <paths…>`: one reviewer patch per commit range (`.asd/runtime.js` `rangePatchInvocations`); each rename passes its source path beside its destination so the patch shows a rename.
- `git diff --raw -z -M --no-abbrev <base>...<head>` and `git diff --numstat -z -M <base>...<head>`: rename map and line counts over a whole range, no path arguments.
- `git diff --no-index --no-color --no-ext-diff --no-textconv -- <old> <new>`: one design-review draft against its snapshot copy; exit 1 means a difference, not an error.
- `git show <ref>:<path>`: one file's content at a ref (`<rev>:<path>` names a blob; for a plain blob `git show` prints its plain contents). Default target: none — `<ref>` is resolved locally, never fetched, so `origin/<branch>` is the last-fetched remote-tracking ref. A path absent at `<ref>` exits 128 with `fatal: path '<path>' does not exist in '<ref>'`. Mutates nothing.
- `git diff --name-status --no-renames <base>..<head>` and `git diff -U0 --no-color --no-ext-diff --no-textconv <base>..<head> -- <path>`: a fix round's changed files with status letters (`A` marks a file new to the range) and one file's changed lines with zero context (`-U<n>` sets context lines; default `diff.context` or 3). Default target: none beyond the named range. Mutates nothing.
- `git merge-base <base_branch> HEAD`: the best common ancestor of the two commits (`git merge-base -h`); impl-review step 7b diffs from it to tell a pre-existing line. Default target: the named commits only, resolved locally. Mutates nothing.
- `git rev-parse --verify --quiet <ref>^{commit}`: prints the commit sha `<ref>` names, or exits non-zero with no output when it names none (`git rev-parse` `--verify`, `--quiet`); `runtime.js` checks a `--base-ref` before reading from it. Default target: the named ref, resolved locally, never fetched. Mutates nothing.

## Version-specific notes
- `git diff` takes no `--pathspec-from-file`; the documented holders are `add`, `rm`, `commit`, `checkout`, `restore` and `stash push`. A long path list reaches `git diff` only as argv.
- On Windows, `CreateProcessW` caps the whole command line at 32,767 characters including the terminating null; Node's `spawnSync` without a shell builds one command line from the executable and every argument, quoting an argument that holds whitespace or a double quote, so an argument can grow to twice its length plus two quotes.

## Deprecations and breaking changes from prior version
- None relied on.

## Project conventions
- Git runs without a shell (`spawnSync('git', args)`, `.asd/runtime.js` `runGit`); several invocations stream in order into one output file (`writeGitOutput`), so a path list split across invocations yields the same concatenated patch.
- Git Bash (MSYS) rewrites a `<ref>:<path>` argument as a path list; the project rule for it lives in `.asd/project/custom-common-rules.md`.

## Known issues and workarounds
- A path list over the Windows cap fails with `spawnSync git ENAMETOOLONG` before git starts: split the list across invocations whose command line stays under the cap, a rename's source and destination in the same invocation.
