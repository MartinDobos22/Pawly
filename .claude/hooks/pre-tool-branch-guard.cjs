#!/usr/bin/env node
/**
 * PreToolUse hook — branch guard.
 * Ak je používateľ na `main` a Claude chce písať/editovať súbor,
 * automaticky vytvorí `claude/<timestamp>` branch a pokračuje.
 * Tichá bezpečnostná sieť — nezabíja tool call, len presmeruje branch.
 */
'use strict';

const { execSync } = require('child_process');

let stdin = '';
process.stdin.on('data', (chunk) => (stdin += chunk));
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(stdin || '{}');
    const tool = payload.tool_name;
    if (tool !== 'Write' && tool !== 'Edit' && tool !== 'NotebookEdit') {
      process.exit(0);
    }

    const filePath = payload.tool_input && payload.tool_input.file_path;
    if (!filePath) process.exit(0);

    // Ignoruj zmeny mimo gitového working tree
    let inRepo = false;
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      inRepo = true;
    } catch {
      process.exit(0);
    }
    if (!inRepo) process.exit(0);

    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (branch !== 'main' && branch !== 'master') {
      process.exit(0);
    }

    // Vytvor branch
    const ts = new Date()
      .toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 12); // YYYYMMDDHHMM
    const newBranch = `claude/${ts}`;
    try {
      execSync(`git checkout -b ${newBranch}`, { stdio: 'pipe' });
      console.error(
        `BRANCH GUARD: bol si na '${branch}'. Automaticky som vytvoril a prepol na '${newBranch}'.`
      );
    } catch (e) {
      console.error(`BRANCH GUARD: nepodarilo sa vytvoriť branch (${e.message}). Pokračujem na ${branch}.`);
    }
    process.exit(0);
  } catch (e) {
    // Hook nesmie blokovať vývoj kvôli vlastnej chybe
    console.error(`BRANCH GUARD warning: ${e.message}`);
    process.exit(0);
  }
});
