#!/usr/bin/env node
/**
 * Stop hook — review reminder.
 * Informatívny: vypíše zmenené .ts/.tsx súbory a pripomenie code-review.
 * Neblokuje turn.
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

let stdin = '';
process.stdin.on('data', (c) => (stdin += c));
process.stdin.on('end', () => {
  try {
    const tracked = execSync('git diff --name-only HEAD', { cwd: REPO_ROOT, encoding: 'utf8' });
    const untracked = execSync('git ls-files --others --exclude-standard', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    const files = [...tracked.split('\n'), ...untracked.split('\n')]
      .map((s) => s.trim())
      .filter((f) => /\.(ts|tsx)$/.test(f));

    if (files.length === 0) process.exit(0);

    const msg = [
      'REVIEW GATE: zmenené TypeScript súbory:',
      ...files.map((f) => `  - ${f}`),
      '',
      'Pre review spusti code-reviewer subagent (alebo /implement spustí review automaticky).',
    ].join('\n');
    console.error(msg);
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
