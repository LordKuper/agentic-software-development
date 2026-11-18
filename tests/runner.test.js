'use strict';

// the test runner itself

const { assert, path, execFileSync, REPO_ROOT, tests, test, headingBody } = require('./lib.js');

test('sprint-027 AC-9 (D9): the runner\'s --filter runs only tests whose name contains the fixed substring, prints the matched count, exits non-zero on zero or empty matches, and code-style.md section 17 names the flag', () => {
  const fragment = 'sprint-026 AC-14 (D11): markdownSection returns';
  const run = (...args) => {
    try {
      return { status: 0, stdout: execFileSync(process.execPath, [path.join(REPO_ROOT, 'tests', 'run.js'), ...args], { encoding: 'utf8', stdio: 'pipe' }), stderr: '' };
    } catch (error) {
      return { status: error.status, stdout: String(error.stdout), stderr: String(error.stderr) };
    }
  };
  const matched = tests.filter((candidate) => candidate.name.includes(fragment)).length;
  assert.strictEqual(matched, 1, 'sanity: the fragment names exactly one test');
  const hit = run('--filter', fragment);
  assert.ok(hit.status === 0 && hit.stdout.includes(`${matched}/${tests.length} tests matched`) && hit.stdout.includes(`\n${matched}/${matched} passed`), `AC-9: a matching filter runs only the matched tests and prints the matched count. Got: ${JSON.stringify(hit)}`);
  const regex = run('--filter', 'sprint-026 AC-14 (D11): mark.ownSection');
  assert.ok(regex.status === 1 && regex.stdout.includes(`0/${tests.length} tests matched`), `D9: the filter is a fixed substring, not a regex. Got: ${JSON.stringify(regex)}`);
  const none = run('--filter', 'no test carries this name fragment');
  assert.ok(none.status === 1 && none.stderr.includes('no test name contains'), `AC-9: zero matches exit non-zero, or a mistyped fragment reads as a green run. Got: ${JSON.stringify(none)}`);
  const empty = run('--filter', '');
  assert.strictEqual(empty.status, 1, 'AC-9: an empty fragment matches everything, so it is refused rather than running the whole suite as a filtered run');
  assert.ok(headingBody('.asd/rules/code-style.md', '17. Tests').includes('`--filter <substring>`'), 'AC-9: code-style.md section 17 names the runner flag every mutation and control run uses');
});
