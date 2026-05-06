#!/usr/bin/env node
/**
 * PostToolUse hook — auto-format zapísaného/editovaného súboru cez Prettier.
 * Tichý fail ak Prettier nie je nainštalovaný alebo súbor nie je podporovaný.
 * Preskakuje node_modules, .claude, dist, build.
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const SUPPORTED = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs',
  '.json', '.css', '.scss', '.html', '.md', '.yml', '.yaml',
]);

const SKIP_DIRS = ['node_modules', '.claude', 'dist', 'build', '.git'];

let stdin = '';
process.stdin.on('data', (chunk) => (stdin += chunk));
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(stdin || '{}');
    const tool = payload.tool_name;
    if (tool !== 'Write' && tool !== 'Edit') process.exit(0);

    const filePath = payload.tool_input && payload.tool_input.file_path;
    if (!filePath) process.exit(0);

    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED.has(ext)) process.exit(0);

    if (SKIP_DIRS.some((d) => filePath.includes(`/${d}/`))) process.exit(0);

    // Try prettier from client/, server/, alebo globálny
    const tryDirs = [
      path.dirname(filePath),
      path.resolve(__dirname, '..', '..', 'client'),
      path.resolve(__dirname, '..', '..', 'server'),
      path.resolve(__dirname, '..', '..'),
    ];

    let formatted = false;
    for (const dir of tryDirs) {
      try {
        execSync(`npx --no-install prettier --write "${filePath}"`, {
          cwd: dir,
          stdio: 'pipe',
          timeout: 20000,
        });
        formatted = true;
        break;
      } catch {
        // Skús ďalší adresár
      }
    }
    // Tichý exit aj ak prettier neexistuje — neblokuj
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
