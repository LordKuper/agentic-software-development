'use strict';

const fs = require('fs');
const path = require('path');
const { configEntries } = require('../runtime.js');

const CONFIG = '.asd/project/config.yaml';
const FORMAT = 'project.mockup_format';
const LEGACY = 'project.claude_design';
const UX = 'documents.ux_spec';
const FORMATS = ['none', 'html', 'claude_design', 'figma'];
const TOGGLES = ['enabled', 'disabled'];
const COMMENT = `# ${FORMATS.join(' | ')}`;
const OLD_HEADER = '# Format for UI mockups when they are enabled.';
const HEADER = '# UI mockup format, independent of documents.ux_spec. Use none to skip mockups.';
const LEGACY_COMMENT = '# enabled | disabled';

function rewriteSelection(line, entry, mode) {
  const [, indent, originalKey, gap, scalar, tail] = /^( *)([^:]+):( +[ \t]*)(.*?)([ \t]+#.*|[ \t]*)$/.exec(line);
  const key = entry.path[1] === 'mockup_format' ? originalKey : 'mockup_format';
  const quote = /^['"]/.exec(scalar)?.[0] ?? '';
  const value = entry.value === mode ? scalar : `${quote}${mode}${quote}`;
  const shippedComment = [LEGACY_COMMENT, '# html | claude_design | figma'].includes(tail.trimStart());
  return `${indent}${key}:${gap}${value}${shippedComment ? ` ${COMMENT}` : tail}`;
}

function insertSelection(lines, entries, project, mode) {
  if (project) {
    const child = entries.find(({ path: parts }) => parts[0] === 'project' && parts.length === 2);
    const indent = child ? /^ */.exec(lines[child.line - 1])[0] : '  ';
    lines.splice(project.line, 0, `${indent}mockup_format: ${mode} ${COMMENT}`);
    return;
  }
  const last = lines.findLastIndex((line) => !/^ *(?:#.*)?$/.test(line));
  const insertion = lines[last]?.trimEnd() === '...' ? last : last + 1;
  lines.splice(insertion, 0, 'project:', `  mockup_format: ${mode} ${COMMENT}`);
}

/** Retires the legacy selector while preserving the old UX-gated effective mode. */
module.exports = function migrate({ repoRoot }) {
  const configPath = path.join(repoRoot, CONFIG);
  if (!fs.existsSync(configPath)) return { status: 'absent', changes: [] };
  const raw = fs.readFileSync(configPath, 'utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const body = raw.slice(bom.length);
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  if (/\r(?!\n)/.test(body) || (eol === '\r\n' && /(^|[^\r])\n/.test(body))) {
    throw new Error(`${CONFIG}: use consistent LF or CRLF line endings`);
  }

  // Use the same block-style YAML subset and line numbers as config-check. Fail before writing if
  // the relevant settings cannot be resolved. Unrelated settings are never reserialized.
  const relevant = ['<root>', 'project', 'documents', FORMAT, LEGACY, UX];
  const entries = configEntries(body, CONFIG, ({ path: key, line, reason }) => {
    if (relevant.includes(key)) throw new Error(`${CONFIG}:${line}: ${key}: ${reason}`);
  });
  const byPath = new Map(entries.map((entry) => [JSON.stringify(entry.path), entry]));
  const get = (...parts) => byPath.get(JSON.stringify(parts));
  const project = get('project');
  const documents = get('documents');
  const format = get('project', 'mockup_format');
  const legacy = get('project', 'claude_design');
  const ux = get('documents', 'ux_spec');
  for (const group of [project, documents]) {
    if (group?.kind === 'scalar') throw new Error(`${CONFIG}:${group.line}: ${group.path[0]} must be a mapping`);
  }
  for (const [entry, options] of [[format, FORMATS], [legacy, TOGGLES], [ux, TOGGLES]]) {
    if (entry && !options.includes(entry.value)) {
      throw new Error(`${CONFIG}:${entry.line}: ${entry.path.join('.')} must be ${options.join(' | ')}`);
    }
  }

  const oldUxEnabled = !documents || ux?.value === 'enabled';
  const oldFormat = format?.value ?? (legacy?.value === 'disabled' ? 'html' : 'claude_design');
  const mode = oldUxEnabled ? oldFormat : 'none';
  const lines = body.split(eol);
  const selection = format ?? legacy;
  if (selection) {
    const index = selection.line - 1;
    lines[index] = rewriteSelection(lines[index], selection, mode);
    if (lines[index - 1]?.trim() === OLD_HEADER) lines[index - 1] = lines[index - 1].replace(OLD_HEADER, HEADER);
  } else {
    insertSelection(lines, entries, project, mode);
  }
  if (format && legacy) {
    const index = legacy.line - 1;
    const comment = /[ \t]+(#.*)$/.exec(lines[index])?.[1];
    if (comment && comment !== LEGACY_COMMENT) lines[index] = /^ */.exec(lines[index])[0] + comment;
    else lines.splice(index, 1);
  }

  const next = bom + lines.join(eol);
  if (next === raw) return { status: 'unchanged', changes: [] };
  const tempPath = `${configPath}.asd-migration.tmp`;
  fs.writeFileSync(tempPath, next, { encoding: 'utf8', mode: fs.statSync(configPath).mode });
  fs.renameSync(tempPath, configPath);
  const changes = [`${FORMAT}: ${mode}`];
  if (legacy) changes.push(`removed ${LEGACY}`);
  return { status: 'migrated', changes };
};
