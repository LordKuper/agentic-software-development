---
responsibility:
  owns: Node.js interfaces used by the review runtime and regression checks
  excludes: deployment commands, configuration schema
  delegates_to: .asd/runtime.js, tests/run.js
---

# Node.js @ 24.15.0

## Canonical source

- Node.js release-tagged documentation for [path](https://github.com/nodejs/node/blob/v24.15.0/doc/api/path.md), [file system](https://github.com/nodejs/node/blob/v24.15.0/doc/api/fs.md) and [CLI](https://github.com/nodejs/node/blob/v24.15.0/doc/api/cli.md).
- Verified 2026-11-22 against the installed Node.js v24.15.0 and its CLI help.

## API surface used in project

- `path.posix` and `path.win32` select path grammar independently of the host. Their string operations act on the supplied path and do not modify the filesystem. Use each grammar's `isAbsolute(file)` for its host.
- `fs.existsSync(path)` and `fs.statSync(path).size` read the explicitly named file or directory without modifying it. Use them to find a previous snapshot copy and verify that the selected drafts produced a patch.
- `fs.readFileSync(list, 'utf8')` reads the explicitly named list without changing it. Git's NUL-delimited records retain the path characters needed by literal pathspecs.
- `node --require <module> <entry>` resolves and executes the named module before the supplied entry point. A test preload can replace an implementation or platform value in the child process. The scope test uses a process-local shim and leaves the shared workspace unchanged.

## Version-specific notes

- These interfaces are available in the tested Node.js runtime. The framework keeps the existing zero-dependency runner.

## Deprecations and breaking changes from prior version

- None relied on.

## Project conventions

- Keep substitutions in isolated test fixtures and name the fixture in the failing command.

## Known issues and workarounds

- A Windows filesystem treats a backslash as a separator. Run literal-backslash filename assertions against a native POSIX fixture and exercise the selector independently on Windows.
