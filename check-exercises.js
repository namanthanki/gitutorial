#!/usr/bin/env node
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

/**
 * Run a git command synchronously.
 * @param {string} args - Arguments to pass to git (e.g. 'log --oneline')
 * @param {string} repoPath - Working directory for the git command
 * @returns {string} Trimmed stdout output
 * @throws {Error} If git exits with a non-zero status
 */
function execGit(args, repoPath) {
  const stdout = execSync(`git ${args}`, {
    cwd: repoPath,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return stdout.trim();
}

/**
 * Run a git command synchronously, returning null on any error.
 * @param {string} args - Arguments to pass to git
 * @param {string} repoPath - Working directory for the git command
 * @returns {string|null} Trimmed stdout, or null if the command failed
 */
function execGitSafe(args, repoPath) {
  try {
    return execGit(args, repoPath);
  } catch (_err) {
    return null;
  }
}

/**
 * Build a CheckContext with git helpers pre-bound to repoPath.
 * @param {string} repoPath - Absolute path to the git repository
 * @returns {{ repoPath: string, git: Function, gitSafe: Function }}
 */
function buildContext(repoPath) {
  return {
    repoPath,
    git: (args) => execGit(args, repoPath),
    gitSafe: (args) => execGitSafe(args, repoPath),
  };
}

// ---------------------------------------------------------------------------
// Exercise title map
// ---------------------------------------------------------------------------

/**
 * Return a human-readable title for exercise index i (1-based).
 * @param {number} i - Exercise number 1–10
 * @returns {string} e.g. "Exercise 1 — First Commit"
 */
function checkerTitle(i) {
  const titles = {
    1:  'First Commit',
    2:  'Branching',
    3:  'Pushing a Branch & Opening a PR',
    4:  'Merging',
    5:  'Undoing Changes',
    6:  'Stashing',
    7:  'Resolving a Merge Conflict',
    8:  'Syncing with Upstream',
    9:  'Tagging a Release',
    10: 'Interactive Rebase (Squash)',
  };
  return `Exercise ${i} — ${titles[i] || 'Unknown'}`;
}

// ---------------------------------------------------------------------------
// Exercise Runner
// ---------------------------------------------------------------------------

/**
 * Run all 10 exercise checkers and return a CheckResult for each.
 *
 * Each checker is wrapped in a try/catch so that one failure can never abort
 * the remaining checks. The returned array always has exactly 10 entries with
 * id values 1–10 in ascending order.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {Array<{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }>}
 */
function runAllChecks(ctx) {
  // References to checker functions defined in later tasks (4.x, 5.x, 7.x).
  // They will be hoisted into scope once those tasks add the function declarations.
  const checkers = [
    checkEx1,
    checkEx2,
    checkEx3,
    checkEx4,
    checkEx5,
    checkEx6,
    checkEx7,
    checkEx8,
    checkEx9,
    checkEx10,
  ];

  const results = [];

  for (let i = 0; i < checkers.length; i++) {
    const id = i + 1;
    try {
      const result = checkers[i](ctx);
      results.push(result);
    } catch (err) {
      results.push({
        id,
        title: checkerTitle(id),
        passed: false,
        isHeuristic: false,
        note: 'Check errored: ' + err.message,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Exercise Checker 1 — First Commit
// ---------------------------------------------------------------------------

/**
 * Check Exercise 1: hello.txt has been committed at least once.
 *
 * Runs `git log --oneline -- hello.txt` and passes if the output has ≥ 1 line.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx1(ctx) {
  const output = ctx.gitSafe('log --oneline -- hello.txt');
  const lines = output ? output.split('\n').filter((l) => l.trim().length > 0) : [];
  const passed = lines.length >= 1;

  return {
    id: 1,
    title: 'Exercise 1 — First Commit',
    passed,
    note: passed
      ? `hello.txt has ${lines.length} commit(s)`
      : 'hello.txt not committed yet',
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 2 — Branching
// ---------------------------------------------------------------------------

/**
 * Check Exercise 2: at least one local branch (other than main/master) has
 * ≥1 commit that is not reachable from main (or master).
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx2(ctx) {
  const branchOut = ctx.gitSafe('branch --list');
  if (!branchOut) {
    return {
      id: 2,
      title: checkerTitle(2),
      passed: false,
      note: 'No feature branch with unique commits found',
      isHeuristic: false,
    };
  }

  // Parse branch list: strip leading "* " (current branch marker) and whitespace
  const branches = branchOut
    .split('\n')
    .map((l) => l.replace(/^\*\s*/, '').trim())
    .filter((l) => l.length > 0 && l !== 'main' && l !== 'master');

  for (const branch of branches) {
    // Try --not main first, then --not master as fallback
    let logOut = ctx.gitSafe(`log ${branch} --not main --oneline`);
    if (!logOut) {
      logOut = ctx.gitSafe(`log ${branch} --not master --oneline`);
    }
    if (logOut) {
      const commits = logOut.split('\n').filter((l) => l.trim().length > 0);
      if (commits.length >= 1) {
        return {
          id: 2,
          title: checkerTitle(2),
          passed: true,
          note: `Branch '${branch}' has ${commits.length} commit(s) not on main`,
          isHeuristic: false,
        };
      }
    }
  }

  return {
    id: 2,
    title: checkerTitle(2),
    passed: false,
    note: 'No feature branch with unique commits found',
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 3 — Pushing a Branch & Opening a PR
// ---------------------------------------------------------------------------

/**
 * Check Exercise 3: A non-main/master remote branch exists on origin.
 *
 * Runs `git branch -r --list 'origin/*'` and passes if any remote branch
 * exists on origin other than origin/main, origin/master, or origin/HEAD
 * (including HEAD aliases like "origin/HEAD -> origin/main").
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx3(ctx) {
  const output = ctx.gitSafe("branch -r --list 'origin/*'");
  const lines = output
    ? output
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    : [];

  const EXCLUDED = ['origin/main', 'origin/master', 'origin/HEAD'];

  const featureBranches = lines.filter((line) => {
    // Exclude HEAD alias lines like "origin/HEAD -> origin/main"
    if (line.includes('-> ')) return false;
    return !EXCLUDED.includes(line);
  });

  if (featureBranches.length >= 1) {
    const branchName = featureBranches[0].replace(/^origin\//, '');
    return {
      id: 3,
      title: 'Exercise 3 — Pushing a Branch & Opening a PR',
      passed: true,
      note: `Remote branch 'origin/${branchName}' found (PR step cannot be auto-verified)`,
      isHeuristic: false,
    };
  }

  return {
    id: 3,
    title: 'Exercise 3 — Pushing a Branch & Opening a PR',
    passed: false,
    note: 'No non-main remote branches found on origin',
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 4 — Merging
// ---------------------------------------------------------------------------

/**
 * Check Exercise 4: branch-notes.txt is tracked on main AND at least one
 * merge commit exists in main's history.
 *
 * Runs:
 *   - `git ls-files branch-notes.txt`   → non-empty means file is tracked
 *   - `git log main --merges --oneline` → ≥1 line means a merge commit exists
 *
 * Both conditions must be true to pass.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx4(ctx) {
  const lsOut = ctx.gitSafe('ls-files branch-notes.txt');
  const fileTracked = typeof lsOut === 'string' && lsOut.trim() === 'branch-notes.txt';

  const mergeOut = ctx.gitSafe('log main --merges --oneline');
  const mergeLines = mergeOut
    ? mergeOut.split('\n').filter((l) => l.trim().length > 0)
    : [];
  const hasMergeCommit = mergeLines.length >= 1;

  const passed = fileTracked && hasMergeCommit;

  return {
    id: 4,
    title: 'Exercise 4 — Merging',
    passed,
    note: passed
      ? 'branch-notes.txt present on main; merge commit found'
      : 'branch-notes.txt not on main or no merge commit found',
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 5 — Undoing Changes (heuristic)
// ---------------------------------------------------------------------------

/**
 * Check Exercise 5: Evidence that git reset was used to undo changes.
 *
 * Runs `git reflog --oneline -100` and scans for lines matching
 * `/reset: moving to HEAD[~^]/`. Because `git restore` leaves no reflog
 * entry, this check is always heuristic — a false negative is possible.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: true }}
 */
function checkEx5(ctx) {
  const output = ctx.gitSafe('reflog --oneline -100');
  const lines = output ? output.split('\n') : [];
  const pattern = /reset: moving to HEAD[~^]/;
  const passed = lines.some((line) => pattern.test(line));

  return {
    id: 5,
    title: 'Exercise 5 — Undoing Changes',
    passed,
    note: passed
      ? '[heuristic] git reset detected in reflog'
      : '[heuristic] No reset/restore evidence found in reflog (may still have been done)',
    isHeuristic: true,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 6 — Stashing
// ---------------------------------------------------------------------------

/**
 * Check Exercise 6: A stash was used at some point.
 *
 * Strategy:
 *  1. Run `git stash list` — if it returns ≥1 entry, a stash exists now.
 *  2. Run `git reflog --oneline refs/stash` — persists even after `stash pop`,
 *     so a non-empty reflog proves the stash was used at some point.
 *
 * Either source is sufficient to pass. isHeuristic is always true because
 * the stash may have been popped and cleared, leaving no current stash entry
 * (though the reflog will usually still show it).
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: true }}
 */
function checkEx6(ctx) {
  // Try git stash list first
  const stashList = ctx.gitSafe('stash list');
  const stashLines = stashList
    ? stashList.split('\n').filter((l) => l.trim().length > 0)
    : [];

  if (stashLines.length >= 1) {
    return {
      id: 6,
      title: 'Exercise 6 — Stashing',
      passed: true,
      note: `[heuristic] Stash history found (${stashLines.length} entries in stash list)`,
      isHeuristic: true,
    };
  }

  // Fall back to reflog for refs/stash (survives stash pop)
  const reflogOut = ctx.gitSafe('reflog --oneline refs/stash');
  const reflogLines = reflogOut
    ? reflogOut.split('\n').filter((l) => l.trim().length > 0)
    : [];

  if (reflogLines.length >= 1) {
    return {
      id: 6,
      title: 'Exercise 6 — Stashing',
      passed: true,
      note: `[heuristic] Stash history found (${reflogLines.length} entries in stash reflog)`,
      isHeuristic: true,
    };
  }

  return {
    id: 6,
    title: 'Exercise 6 — Stashing',
    passed: false,
    note: '[heuristic] No stash history detected',
    isHeuristic: true,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 7 — Resolving a Merge Conflict (heuristic)
// ---------------------------------------------------------------------------

/**
 * Check Exercise 7: A merge conflict on hello.txt was resolved.
 *
 * Strategy: find merge commits via `git log --merges --format="%H %P"`.
 * For each two-parent merge commit, compute the merge base and check whether
 * both parents modified hello.txt relative to that base. The first qualifying
 * merge commit causes a pass.
 *
 * This check is always heuristic — we can only infer the conflict from
 * topology; the actual conflict markers are gone after resolution.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: true }}
 */
function checkEx7(ctx) {
  const logOut = ctx.gitSafe('log --merges --format="%H %P"');
  const lines = logOut
    ? logOut.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    : [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    // Only handle two-parent merges; skip octopus merges (> 2 parents)
    if (parts.length !== 3) continue;

    const [hash, p1, p2] = parts;

    const base = ctx.gitSafe(`merge-base ${p1} ${p2}`);
    if (!base) continue;

    const diffP1 = ctx.gitSafe(`diff --name-only ${base} ${p1}`);
    const diffP2 = ctx.gitSafe(`diff --name-only ${base} ${p2}`);

    const p1Modified = diffP1
      ? diffP1.split('\n').some((f) => f.trim() === 'hello.txt')
      : false;
    const p2Modified = diffP2
      ? diffP2.split('\n').some((f) => f.trim() === 'hello.txt')
      : false;

    if (p1Modified && p2Modified) {
      return {
        id: 7,
        title: 'Exercise 7 — Resolving a Merge Conflict',
        passed: true,
        note: '[heuristic] Merge commit found where both parents modified hello.txt',
        isHeuristic: true,
      };
    }
  }

  return {
    id: 7,
    title: 'Exercise 7 — Resolving a Merge Conflict',
    passed: false,
    note: '[heuristic] No qualifying merge commit found for conflict resolution',
    isHeuristic: true,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 8 — Syncing with Upstream
// ---------------------------------------------------------------------------

/**
 * Check Exercise 8: An `upstream` remote is configured.
 *
 * Runs `git remote -v` and passes if any line has a remote name field
 * exactly equal to `upstream` (i.e. the line starts with "upstream\t").
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx8(ctx) {
  const output = ctx.gitSafe('remote -v');
  const lines = output ? output.split('\n') : [];

  for (const line of lines) {
    if (line.startsWith('upstream\t')) {
      // Line format: "upstream\t<url> (fetch|push)"
      // Extract URL: everything after the tab, up to the space before "(..."
      const afterTab = line.slice('upstream\t'.length);
      const url = afterTab.replace(/\s+\((?:fetch|push)\)\s*$/, '').trim();
      return {
        id: 8,
        title: 'Exercise 8 — Syncing with Upstream',
        passed: true,
        note: `upstream remote configured: ${url}`,
        isHeuristic: false,
      };
    }
  }

  return {
    id: 8,
    title: 'Exercise 8 — Syncing with Upstream',
    passed: false,
    note: "No 'upstream' remote found",
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 9 — Tagging a Release
// ---------------------------------------------------------------------------

/**
 * Check Exercise 9: Tag v0.1.0 exists locally.
 *
 * Runs `git tag --list 'v0.1.0'` and passes if the trimmed output equals `v0.1.0`.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }}
 */
function checkEx9(ctx) {
  const output = ctx.gitSafe("tag --list 'v0.1.0'");
  const passed = typeof output === 'string' && output.trim() === 'v0.1.0';

  return {
    id: 9,
    title: 'Exercise 9 — Tagging a Release',
    passed,
    note: passed ? 'Tag v0.1.0 exists' : 'Tag v0.1.0 not found',
    isHeuristic: false,
  };
}

// ---------------------------------------------------------------------------
// Exercise Checker 10 — Interactive Rebase (heuristic)
// ---------------------------------------------------------------------------

/**
 * Check Exercise 10: An interactive rebase (squash) was performed.
 *
 * Runs `git reflog --oneline -200` and scans for any line containing the
 * word "rebase". This catches entries like "rebase (finish)", "rebase -i",
 * "rebase (start)", etc.
 *
 * isHeuristic is ALWAYS true — the reflog shows rebase activity but cannot
 * confirm that a squash specifically was performed.
 *
 * @param {{ repoPath: string, git: Function, gitSafe: Function }} ctx
 * @returns {{ id: number, title: string, passed: boolean, note: string, isHeuristic: true }}
 */
function checkEx10(ctx) {
  const output = ctx.gitSafe('reflog --oneline -200');
  const lines = output ? output.split('\n') : [];
  const passed = lines.some((line) => /rebase/i.test(line));

  return {
    id: 10,
    title: 'Exercise 10 — Interactive Rebase (Squash)',
    passed,
    note: passed
      ? '[heuristic] Interactive rebase found in reflog'
      : '[heuristic] No rebase activity found in reflog',
    isHeuristic: true,
  };
}

// ---------------------------------------------------------------------------
// Reporter — printResults
// ---------------------------------------------------------------------------

/**
 * Print a colored pass/fail table for all exercise results plus a summary.
 *
 * Color mode: enabled only when NO_COLOR is unset AND stdout is a TTY.
 * ANSI codes used:
 *   green  = \x1b[32m   red  = \x1b[31m   yellow = \x1b[33m   reset = \x1b[0m
 *
 * Output format per result:
 *   <symbol> Ex<id> <title> [heuristic]?
 *      <note>          (only when note is non-empty/non-blank)
 *
 * Summary:
 *   "🎉 Completed: 10 / 10 — All exercises done!"  (all passed)
 *   "Completed: X / 10"                             (otherwise)
 *
 * @param {Array<{ id: number, title: string, passed: boolean, note: string, isHeuristic: boolean }>} results
 */
function printResults(results) {
  const useColor = !process.env.NO_COLOR && !!process.stdout.isTTY;

  function green(s)  { return useColor ? '\x1b[32m' + s + '\x1b[0m' : s; }
  function red(s)    { return useColor ? '\x1b[31m' + s + '\x1b[0m' : s; }
  function yellow(s) { return useColor ? '\x1b[33m' + s + '\x1b[0m' : s; }

  // Header banner
  const title = 'Git Exercise Checker';
  const separator = '='.repeat(title.length + 4);
  console.log(separator);
  console.log('  ' + title);
  console.log(separator);
  console.log('');

  // Per-result lines
  for (const result of results) {
    let symbol;
    if (result.passed) {
      symbol = green('✓');
    } else if (result.isHeuristic) {
      symbol = yellow('~');
    } else {
      symbol = red('✗');
    }

    const heuristicLabel = result.isHeuristic ? ' ' + yellow('[heuristic]') : '';
    console.log(`${symbol} ${result.title}${heuristicLabel}`);

    if (result.note && result.note.trim().length > 0) {
      console.log(`   ${result.note}`);
    }
  }

  console.log('');

  // Summary line
  const passedCount = results.filter((r) => r.passed).length;
  if (passedCount === results.length) {
    console.log(green(`🎉 Completed: ${passedCount} / 10 — All exercises done!`));
  } else {
    console.log(`Completed: ${passedCount} / 10`);
  }
}

// ---------------------------------------------------------------------------
// Entry Point — main()
// ---------------------------------------------------------------------------

/**
 * Main entry point: validates the environment, runs all checks, prints results,
 * and exits with code 0 (all passed) or 1 (any failed).
 */
function main() {
  const repoPath = process.cwd();

  // Preflight check 1: ensure we are inside a Git repository
  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    console.error('Error: Not a Git repository. Run this tool from inside your cloned fork.');
    process.exit(1);
  }

  // Preflight check 2: ensure git is available on PATH
  if (execGitSafe('--version', repoPath) === null) {
    console.error('Error: git not found. Please install Git and ensure it is on your PATH.');
    process.exit(1);
  }

  const ctx = buildContext(repoPath);
  const results = runAllChecks(ctx);
  printResults(results);

  const allPassed = results.every((r) => r.passed === true);
  process.exit(allPassed ? 0 : 1);
}

main();
