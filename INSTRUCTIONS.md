# Git Practice Playground — Instructions

Welcome! This repo is your hands-on sandbox for practicing Git and GitHub. Follow the exercises below in order. Each one builds on the last.

---

## Prerequisites

- Git installed → verify with `git --version`
- A GitHub account
- Basic terminal / command prompt familiarity

---

## How to Get Started

### 1. Fork this repository

1. Go to the GitHub page for this repo
2. Click the **Fork** button (top-right corner)
3. GitHub creates a copy at `https://github.com/<your-username>/gitutorial`

### 2. Clone your fork locally

```bash
git clone https://github.com/<your-username>/gitutorial.git
cd gitutorial
```

### 3. Add the original repo as upstream

```bash
git remote add upstream https://github.com/<original-owner>/gitutorial.git
```

Verify your remotes:

```bash
git remote -v
# origin    https://github.com/<your-username>/gitutorial.git (fetch)
# origin    https://github.com/<your-username>/gitutorial.git (push)
# upstream  https://github.com/<original-owner>/gitutorial.git (fetch)
# upstream  https://github.com/<original-owner>/gitutorial.git (push)
```

---

## Exercises

Work through these in order. Check them off as you go.

---

### Exercise 1 — First Commit

**Goal:** Learn staging and committing.

1. Create a new file called `hello.txt` and write your name inside it
2. Stage the file:
   ```bash
   git add hello.txt
   ```
3. Check what's staged:
   ```bash
   git status
   ```
4. Commit it:
   ```bash
   git commit -m "feat: add hello.txt with my name"
   ```
5. View the commit log:
   ```bash
   git log --oneline
   ```

✅ **Done when:** You see your commit in `git log`.

---

### Exercise 2 — Branching

**Goal:** Create and switch between branches.

1. Create a new branch:
   ```bash
   git switch -c feature/my-first-branch
   ```
2. Create a file called `branch-notes.txt` and write something in it
3. Stage and commit:
   ```bash
   git add branch-notes.txt
   git commit -m "feat: add branch-notes"
   ```
4. Switch back to main and confirm `branch-notes.txt` is gone:
   ```bash
   git switch main
   ls   # or dir on Windows
   ```
5. Switch back to your feature branch:
   ```bash
   git switch feature/my-first-branch
   ```

✅ **Done when:** You understand that files on a branch are isolated from main.

---

### Exercise 3 — Pushing a Branch & Opening a PR

**Goal:** Push your branch to GitHub and open a Pull Request.

1. Push your feature branch to your fork:
   ```bash
   git push -u origin feature/my-first-branch
   ```
2. Go to `https://github.com/<your-username>/gitutorial` in your browser
3. GitHub will show a banner: **"Compare & pull request"** — click it
4. Fill in:
   - **Title:** `feat: add branch-notes`
   - **Description:** A short note about what you did
5. Click **Create pull request**

✅ **Done when:** Your PR appears on GitHub.

---

### Exercise 4 — Merging

**Goal:** Merge your branch into main.

> Since this is your personal fork, you can merge your own PR.

1. On your PR page on GitHub, click **Merge pull request → Confirm merge**
2. Locally, pull the updated main:
   ```bash
   git switch main
   git pull origin main
   ```
3. Delete the local and remote feature branch:
   ```bash
   git branch -d feature/my-first-branch
   git push origin --delete feature/my-first-branch
   ```

✅ **Done when:** main contains `branch-notes.txt` and the feature branch is gone.

---

### Exercise 5 — Undoing Changes

**Goal:** Practice the most common undo operations.

**5a — Discard unstaged changes**
1. Edit `hello.txt` — add a line you don't want
2. Discard the change without staging:
   ```bash
   git restore hello.txt
   ```

**5b — Unstage a file**
1. Edit `hello.txt` again
2. Stage it: `git add hello.txt`
3. Change your mind and unstage:
   ```bash
   git restore --staged hello.txt
   ```

**5c — Undo last commit (keep changes)**
1. Commit any small change
2. Undo the commit but keep the file changes:
   ```bash
   git reset --soft HEAD~1
   ```

✅ **Done when:** You've tried all three undo scenarios.

---

### Exercise 6 — Stashing

**Goal:** Stash work-in-progress, switch context, then restore it.

1. Start editing `hello.txt` (don't commit)
2. Realize you need to switch to main quickly:
   ```bash
   git stash push -m "WIP: hello edits"
   git switch main
   ```
3. Do something on main (e.g., check `git log`)
4. Switch back and restore your stash:
   ```bash
   git switch feature/stash-test   # or whatever branch you were on
   git stash pop
   ```

✅ **Done when:** Your in-progress edits are back after `git stash pop`.

---

### Exercise 7 — Resolving a Merge Conflict

**Goal:** Experience and resolve a merge conflict.

1. On `main`, edit the first line of `hello.txt` and commit:
   ```bash
   git switch main
   # Edit hello.txt line 1
   git add hello.txt
   git commit -m "edit: update hello from main"
   ```
2. Create a new branch and edit the **same line** differently:
   ```bash
   git switch -c feature/conflict-test
   # Edit hello.txt line 1 to something different
   git add hello.txt
   git commit -m "edit: update hello from feature branch"
   ```
3. Try to merge into main:
   ```bash
   git switch main
   git merge feature/conflict-test
   # Git reports a conflict!
   ```
4. Open `hello.txt` — you'll see conflict markers:
   ```
   <<<<<<< HEAD
   Your main version
   =======
   Your feature version
   >>>>>>> feature/conflict-test
   ```
5. Edit the file to keep the version you want (remove all `<<<<`, `====`, `>>>>` markers)
6. Stage and complete the merge:
   ```bash
   git add hello.txt
   git commit
   ```

✅ **Done when:** The merge commit exists and `hello.txt` has no conflict markers.

---

### Exercise 8 — Syncing with Upstream

**Goal:** Keep your fork up to date with the original repo.

1. Fetch changes from upstream:
   ```bash
   git fetch upstream
   ```
2. Merge upstream's main into your local main:
   ```bash
   git switch main
   git merge upstream/main
   ```
3. Push the updated main to your fork:
   ```bash
   git push origin main
   ```

✅ **Done when:** Your fork's main is up to date with the original.

---

### Exercise 9 — Tagging a Release

**Goal:** Create and push a tag.

1. Create an annotated tag on main:
   ```bash
   git switch main
   git tag -a v0.1.0 -m "First practice release"
   ```
2. View it:
   ```bash
   git tag
   git show v0.1.0
   ```
3. Push the tag to your fork:
   ```bash
   git push origin v0.1.0
   ```

✅ **Done when:** The tag appears on your GitHub repo under **Releases / Tags**.

---

### Exercise 10 — Interactive Rebase (Squash)

**Goal:** Clean up multiple commits into one before merging.

1. Create a branch and make 3 small commits:
   ```bash
   git switch -c feature/squash-me
   echo "change 1" >> scratch.txt && git add . && git commit -m "wip: change 1"
   echo "change 2" >> scratch.txt && git add . && git commit -m "wip: change 2"
   echo "change 3" >> scratch.txt && git add . && git commit -m "wip: change 3"
   ```
2. Squash all 3 into one:
   ```bash
   git rebase -i HEAD~3
   ```
   In the editor that opens:
   - Keep the first line as `pick`
   - Change the other two to `squash` (or just `s`)
   - Save and close
   - Edit the combined commit message, save and close
3. Verify:
   ```bash
   git log --oneline
   ```

✅ **Done when:** The 3 "wip" commits are replaced by a single clean commit.

---

## Quick Reference

Refer to [GIT_REFERENCE.md](./GIT_REFERENCE.md) at any time for command syntax and explanations.

---

## Tips

- Run `git status` constantly — it tells you exactly where you are
- Run `git log --oneline --graph --all` to visualize your branch history
- When in doubt, **don't force push to shared branches**
- Use `git stash` before switching branches if you have uncommitted work

---

*Happy practicing! The best way to learn Git is to break things and fix them.*
