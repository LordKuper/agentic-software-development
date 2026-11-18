#!/usr/bin/env node
// Zero-dependency test runner. Run: node tests/run.js [area...] [--filter <substring>]
// An area is a tests/<area>.test.js file; no area argument runs every area.

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { tests } = require('./lib.js');

const SLOWEST_COUNT = 10;
const AREA_SUFFIX = '.test.js';

/** Renders the slowest tests of a run, longest first, for the duration summary after the pass count. */
function slowestSummary(timings) {
  const slowest = [...timings].sort((a, b) => b.elapsedMs - a.elapsedMs).slice(0, SLOWEST_COUNT);
  return [`slowest ${slowest.length} tests:`, ...slowest.map((t) => `  ${t.elapsedMs} ms - ${t.name}`)].join('\n');
}

/** Every area name, one per `<area>.test.js` file beside this runner, in name order. */
function listAreas() {
  return fs.readdirSync(__dirname).filter((file) => file.endsWith(AREA_SUFFIX)).map((file) => file.slice(0, -AREA_SUFFIX.length)).sort();
}

/** Splits the command line into the area names and the `--filter` fragment (undefined when the flag is absent or last). */
function parseArgs(argv) {
  const filterAt = argv.indexOf('--filter');
  const areas = filterAt === -1 ? argv : argv.filter((arg, index) => index !== filterAt && index !== filterAt + 1);
  return { areas, filterGiven: filterAt !== -1, fragment: filterAt === -1 ? null : argv[filterAt + 1] };
}

// Test bodies may be sync or async; `await`ing a plain return value is a no-op.
async function runAll() {
  const { areas, filterGiven, fragment } = parseArgs(process.argv.slice(2));
  const known = listAreas();
  const unknown = areas.filter((area) => !known.includes(area));
  if (unknown.length > 0) {
    console.error(`unknown area ${unknown.join(', ')}; areas: ${known.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  for (const area of areas.length > 0 ? areas : known) require(path.join(__dirname, `${area}${AREA_SUFFIX}`));
  const selected = filterGiven ? tests.filter((t) => t.name.includes(fragment)) : tests;
  if (filterGiven) {
    console.log(`filter "${fragment}": ${selected.length}/${tests.length} tests matched`);
    if (!fragment || selected.length === 0) {
      console.error(`no test name contains "${fragment || ''}"`);
      process.exitCode = 1;
      return;
    }
  }
  let failures = 0;
  const timings = [];
  for (const t of selected) {
    const started = performance.now();
    let threw = false;
    let failure;
    try {
      await t.fn();
    } catch (err) {
      threw = true;
      failure = err;
    }
    const elapsedMs = Math.round(performance.now() - started);
    timings.push({ name: t.name, elapsedMs });
    if (!threw) {
      console.log(`ok - ${t.name} (${elapsedMs} ms)`);
      continue;
    }
    failures++;
    console.error(`FAIL - ${t.name} (${elapsedMs} ms)`);
    console.error('   ' + (failure && failure.stack ? failure.stack.split('\n').join('\n   ') : String(failure)));
  }

  console.log(`\n${selected.length - failures}/${selected.length} passed`);
  console.log(slowestSummary(timings));
  process.exitCode = failures > 0 ? 1 : 0;
}

runAll();
