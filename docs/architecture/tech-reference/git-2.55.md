---
responsibility:
  owns: project-vetted reference for one technology version (apis used, version specifics, project conventions)
  excludes: adr rationale, code, full stack overview, build commands
  delegates_to: stack.html (overview), commands.yaml (commands); decisions fold per sprint-lifecycle.md "Design-promote phase" fold rule into whichever persistent doc's owns matches
---

# Git @ 2.55

## Canonical source
- Official docs: https://git-scm.com/docs/git-diff ; `--pathspec-from-file` holders: https://git-scm.com/docs/git-add , https://git-scm.com/docs/git-commit/2.25.0 , https://git-scm.com/docs/git-rm , https://git-scm.com/docs/git-checkout , https://git-scm.com/docs/git-restore , https://git-scm.com/docs/git-stash ; Windows command-line cap: https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw
- Last verified: 2026-11-02 (installed `git version 2.55.0.windows.5`; `git diff --pathspec-from-file=<file>` prints usage and exits non-zero)

## API surface used in project
- `git --literal-pathspecs diff -M --no-color --no-ext-diff --no-textconv <base>...<head> -- <paths…>`: one reviewer patch per commit range (`.asd/runtime.js` `rangePatchInvocations`); each rename passes its source path beside its destination so the patch shows a rename.
- `git diff --raw -z -M --no-abbrev <base>...<head>` and `git diff --numstat -z -M <base>...<head>`: rename map and line counts over a whole range, no path arguments.
- `git diff --no-index --no-color --no-ext-diff --no-textconv -- <old> <new>`: one design-review draft against its snapshot copy; exit 1 means a difference, not an error.

## Version-specific notes
- `git diff` takes no `--pathspec-from-file`; the documented holders are `add`, `rm`, `commit`, `checkout`, `restore` and `stash push`. A long path list reaches `git diff` only as argv.
- On Windows, `CreateProcessW` caps the whole command line at 32,767 characters including the terminating null; Node's `spawnSync` without a shell builds one command line from the executable and every argument, quoting an argument that holds whitespace or a double quote, so an argument can grow to twice its length plus two quotes.

## Deprecations and breaking changes from prior version
- None relied on.

## Project conventions
- Git runs without a shell (`spawnSync('git', args)`, `.asd/runtime.js` `runGit`); several invocations stream in order into one output file (`writeGitOutput`), so a path list split across invocations yields the same concatenated patch.
- Under Git Bash (MSYS), set `MSYS_NO_PATHCONV=1` before `git show <ref>:<path>`, or MSYS rewrites the argument as a path list.

## Known issues and workarounds
- A path list over the Windows cap fails with `spawnSync git ENAMETOOLONG` before git starts: split the list across invocations whose command line stays under the cap, a rename's source and destination in the same invocation.
