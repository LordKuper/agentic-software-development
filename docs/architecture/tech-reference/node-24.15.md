---
responsibility:
  owns: Node.js interfaces used by the review runtime and regression checks
  excludes: deployment commands, configuration schema
  delegates_to: .asd/runtime.js, tests/run.js
---

# Node.js @ 24.15.0

- Verified 2026-11-22 against the installed runtime and release-tagged [path](https://github.com/nodejs/node/blob/v24.15.0/doc/api/path.md), [file system](https://github.com/nodejs/node/blob/v24.15.0/doc/api/fs.md) and [CLI](https://github.com/nodejs/node/blob/v24.15.0/doc/api/cli.md) documentation.
- `path.posix` and `path.win32` select path grammar independently of the host. A backslash is a filename character in POSIX grammar and a separator in Windows grammar. Git's slash-delimited repository paths feed literal pathspecs.
- `fs.existsSync(path)` checks whether a snapshot copy exists. `fs.statSync(path).size` is the output byte count. Test whether the selected delta produced a patch before renaming it into its final location.
- `node --require <module>` preloads a CommonJS test shim before the entry script. Use an isolated fixture when substituting a historical implementation or exercising a different host-path branch.
