'use strict';

// the test runner itself

const { assert, fs, path, execFileSync, spawnSync, REPO_ROOT, test, headingBody, mkTempDir } = require('./lib.js');

test('sprint-027 AC-9 (D9): the runner\'s --filter runs only tests whose name contains the fixed substring, prints the matched count, exits non-zero on zero or empty matches, and code-style.md section 17 names the flag - and an area argument loads only the file of that area and refuses an unknown one', () => {
  const fragment = 'sprint-026 AC-14 (D11): markdownSection returns';
  const run = (...args) => {
    try {
      return { status: 0, stdout: execFileSync(process.execPath, [path.join(REPO_ROOT, 'tests', 'run.js'), ...args], { encoding: 'utf8', stdio: 'pipe' }), stderr: '' };
    } catch (error) {
      return { status: error.status, stdout: String(error.stdout), stderr: String(error.stderr) };
    }
  };
  const hit = run('--filter', fragment);
  const matched = 1;
  assert.ok(hit.status === 0 && new RegExp(`: ${matched}/\\d+ tests matched`).test(hit.stdout) && hit.stdout.includes(`\n${matched}/${matched} passed`), `AC-9: a matching filter runs only the matched tests and prints the matched count. Got: ${JSON.stringify(hit)}`);
  const regex = run('--filter', 'sprint-026 AC-14 (D11): mark.ownSection');
  assert.ok(regex.status === 1 && /: 0\/\d+ tests matched/.test(regex.stdout), `D9: the filter is a fixed substring, not a regex. Got: ${JSON.stringify(regex)}`);
  const none = run('--filter', 'no test carries this name fragment');
  assert.ok(none.status === 1 && none.stderr.includes('no test name contains'), `AC-9: zero matches exit non-zero, or a mistyped fragment reads as a green run. Got: ${JSON.stringify(none)}`);
  const empty = run('--filter', '');
  assert.strictEqual(empty.status, 1, 'AC-9: an empty fragment matches everything, so it is refused rather than running the whole suite as a filtered run');
  const sameArea = run('runtime-timing', '--filter', fragment);
  assert.ok(sameArea.status === 0 && sameArea.stdout.includes(`\n${matched}/${matched} passed`), `AC-20: an area argument runs the tests of that area. Got: ${JSON.stringify(sameArea)}`);
  const otherArea = run('hooks', '--filter', fragment);
  assert.ok(otherArea.status === 1 && otherArea.stderr.includes('no test name contains'), `AC-20: a test of another area is never loaded by an area argument. Got: ${JSON.stringify(otherArea)}`);
  const unknown = run('no-such-area');
  assert.ok(unknown.status === 1 && unknown.stderr.includes('unknown area no-such-area'), `AC-20: an unknown area exits non-zero and names itself, never reading as an empty green run. Got: ${JSON.stringify(unknown)}`);
  assert.ok(headingBody('.asd/rules/code-style.md', '17. Tests').includes('`--filter <substring>`'), 'AC-9: code-style.md section 17 names the runner flag every mutation and control run uses');
});

test('sprint-037 external 11: the runner fails a test that throws or rejects with null and passes one that returns, so a null reason never reads as success', () => {
  const dir = mkTempDir();
  fs.copyFileSync(path.join(REPO_ROOT, 'tests', 'run.js'), path.join(dir, 'run.js'));
  fs.writeFileSync(path.join(dir, 'lib.js'), "const tests = [];\nmodule.exports = { tests, test: (name, fn) => tests.push({ name, fn }) };\n");
  fs.writeFileSync(path.join(dir, 'sample.test.js'), "const { test } = require('./lib.js');\ntest('throws null', () => { throw null; });\ntest('rejects null', () => Promise.reject(null));\ntest('returns', () => undefined);\n");
  const outcome = spawnSync(process.execPath, [path.join(dir, 'run.js')], { encoding: 'utf8' });
  assert.ok(outcome.status === 1 && outcome.stderr.includes('FAIL - throws null') && outcome.stderr.includes('FAIL - rejects null') && outcome.stdout.includes('ok - returns') && outcome.stdout.includes('1/3 passed'), `a null throw is a failure. Got: ${JSON.stringify(outcome)}`);
});
