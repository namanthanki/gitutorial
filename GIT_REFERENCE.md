# Git Reference Guide

A comprehensive reference for Git commands, concepts, and the standard GitHub workflow.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Setup & Configuration](#setup--configuration)
3. [Repository Basics](#repository-basics)
4. [Staging & Committing](#staging--committing)
5. [Branching](#branching)
6. [Merging & Rebasing](#merging--rebasing)
7. [Remote Repositories](#remote-repositories)
8. [Undoing Changes](#undoing-changes)
9. [Inspecting & Comparing](#inspecting--comparing)
10. [Stashing](#stashing)
11. [Tags](#tags)
12. [GitHub Standard Workflow](#github-standard-workflow)
13. [Common Scenarios & Recipes](#common-scenarios--recipes)

---

## Core Concepts

| Term | Description |
|---|---|
| **Repository (repo)** | A directory tracked by Git, containing your project and its full history |
| **Working directory** | The files you actually edit on disk |
| **Staging area (index)** | A holding area where you prepare changes before committing |
| **Commit** | A saved snapshot of staged changes with a unique SHA hash |
| **Branch** | A lightweight, movable pointer to a commit |
| **HEAD** | A pointer to the currently checked-out branch or commit |
| **Remote** | A version of the repo hosted elsewhere (e.g., GitHub) |
| **Origin** | The conventional name for the default remote |
| **Upstream** | The original repo when you've forked someone else's project |
| **Clone** | A local copy of a remote repository |
| **Fork** | A personal copy of someone else's repo on GitHub |
| **Pull Request (PR)** | A GitHub feature to propose and review changes before merging |

---

## Setup & Configuration

```bash
# Set your identity (stored in ~/.gitconfig)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default branch name to main
git config --global init.defaultBranch main

# Set preferred editor (e.g., VS Code)
git config --global core.editor "code --wait"

# Enable color output
git config --global color.ui auto

# View all config settings
git config --list

# View a specific setting
git config user.name
```

---

## Repository Basics

```bash
# Initialize a new repo in the current directory
git init

# Clone an existing remote repo
git clone https://github.com/user/repo.git

# Clone into a specific folder name
git clone https://github.com/user/repo.git my-folder

# Check the status of your working directory
git status
```

---

## Staging & Committing

```bash
# Stage a specific file
git add filename.txt

# Stage all changes in the current directory
git add .

# Stage parts of a file interactively
git add -p filename.txt

# Unstage a file (keep changes in working directory)
git restore --staged filename.txt

# Commit staged changes with a message
git commit -m "feat: add login page"

# Stage all tracked files and commit in one step
git commit -am "fix: correct typo in header"

# Amend the last commit (message or content)
# Only do this on commits NOT yet pushed
git commit --amend -m "fix: correct typo in header (amended)"
```

### Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <short summary>

Types:
  feat     – new feature
  fix      – bug fix
  docs     – documentation only
  style    – formatting, no logic change
  refactor – code change that's neither feat nor fix
  test     – adding or updating tests
  chore    – build process, tooling updates

Examples:
  feat(auth): add JWT authentication
  fix(api): handle null response from payment gateway
  docs: update README with setup instructions
```

---

## Branching

```bash
# List all local branches
git branch

# List all branches including remote-tracking
git branch -a

# Create a new branch
git branch feature/login

# Switch to a branch
git checkout feature/login
# Modern equivalent:
git switch feature/login

# Create and switch in one command
git checkout -b feature/login
# Modern equivalent:
git switch -c feature/login

# Rename current branch
git branch -m new-name

# Delete a branch (safe — only if merged)
git branch -d feature/login

# Force delete a branch
git branch -D feature/login

# Delete a remote branch
git push origin --delete feature/login
```

### Branch Naming Conventions

```
main              – production-ready code
develop           – integration branch (optional, for Git Flow)
feature/<name>    – new features       e.g. feature/user-profile
fix/<name>        – bug fixes          e.g. fix/login-crash
hotfix/<name>     – urgent prod fixes  e.g. hotfix/null-pointer
release/<version> – release prep       e.g. release/1.2.0
chore/<name>      – tooling/config     e.g. chore/update-deps
```

---

## Merging & Rebasing

### Merge

```bash
# Merge a branch into the current branch
git checkout main
git merge feature/login

# Merge without fast-forward (always creates a merge commit)
git merge --no-ff feature/login

# Abort an in-progress merge
git merge --abort
```

### Rebase

```bash
# Rebase current branch onto main
git checkout feature/login
git rebase main

# Interactive rebase — edit, squash, reorder last N commits
git rebase -i HEAD~3

# Abort an in-progress rebase
git rebase --abort

# Continue after resolving conflicts
git rebase --continue
```

> **Merge vs Rebase:**
> - `merge` preserves full history with a merge commit — good for shared branches.
> - `rebase` rewrites history for a cleaner linear log — good for local feature branches before opening a PR.
> - **Never rebase commits that have been pushed to a shared remote branch.**

---

## Remote Repositories

```bash
# List remotes
git remote -v

# Add a remote
git remote add origin https://github.com/user/repo.git

# Add upstream (for forks)
git remote add upstream https://github.com/original/repo.git

# Remove a remote
git remote remove origin

# Fetch changes from remote (no merge)
git fetch origin

# Fetch from all remotes
git fetch --all

# Pull = fetch + merge into current branch
git pull origin main

# Pull with rebase instead of merge
git pull --rebase origin main

# Push current branch to remote
git push origin feature/login

# Push and set upstream tracking in one go
git push -u origin feature/login

# Force push (use with caution — rewrites remote history)
git push --force-with-lease origin feature/login
```

---

## Undoing Changes

```bash
# Discard unstaged changes in a file
git restore filename.txt

# Discard ALL unstaged changes
git restore .

# Unstage a file without losing changes
git restore --staged filename.txt

# Undo the last commit, keep changes staged
git reset --soft HEAD~1

# Undo the last commit, keep changes unstaged
git reset --mixed HEAD~1

# Undo the last commit AND discard all changes (destructive)
git reset --hard HEAD~1

# Revert a specific commit by creating a new "undo" commit
# Safe for shared/remote branches
git revert <commit-sha>

# Remove untracked files (dry run first)
git clean -n
git clean -f
```

---

## Inspecting & Comparing

```bash
# View commit history
git log

# Compact one-line log
git log --oneline

# Visual branch graph
git log --oneline --graph --all

# Show changes in working directory (unstaged)
git diff

# Show staged changes
git diff --staged

# Compare two branches
git diff main..feature/login

# Show details of a specific commit
git show <commit-sha>

# Search commit messages
git log --grep="login"

# Show who changed each line of a file
git blame filename.txt

# Find which commit introduced a bug (binary search)
git bisect start
git bisect bad                  # current commit is broken
git bisect good <known-good-sha>
git bisect reset                # when done
```

---

## Stashing

Stashing lets you temporarily shelve uncommitted changes so you can switch context.

```bash
# Stash current changes
git stash

# Stash with a descriptive message
git stash push -m "WIP: half-done login form"

# List all stashes
git stash list

# Apply the most recent stash (keeps it in stash list)
git stash apply

# Apply and remove the most recent stash
git stash pop

# Apply a specific stash
git stash apply stash@{2}

# Drop a specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

---

## Tags

```bash
# List all tags
git tag

# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag (recommended for releases)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Tag a specific commit
git tag -a v0.9.0 <commit-sha>

# Push a tag to remote
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete a local tag
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0
```

---

## GitHub Standard Workflow

This is the recommended GitHub workflow for both solo and team projects.

### Overview

```
Fork (if contributing to someone else's repo)
  └─> Clone to local machine
        └─> Create feature branch
              └─> Make changes + commit
                    └─> Push branch to GitHub
                          └─> Open Pull Request
                                └─> Code Review
                                      └─> Merge into main
                                            └─> Delete branch
```

### Step-by-Step

#### 1. Fork (for open-source / external contributions)
- Go to the GitHub repo → click **Fork** → creates `github.com/you/repo`

#### 2. Clone your fork locally
```bash
git clone https://github.com/you/repo.git
cd repo
```

#### 3. Add upstream remote (for forks)
```bash
git remote add upstream https://github.com/original/repo.git
```

#### 4. Keep your fork in sync
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

#### 5. Create a feature branch
```bash
git switch -c feature/my-feature
```

#### 6. Make your changes
```bash
# Edit files...
git add .
git commit -m "feat: add my feature"
```

#### 7. Push branch to GitHub
```bash
git push -u origin feature/my-feature
```

#### 8. Open a Pull Request on GitHub
- Go to your fork on GitHub
- Click **Compare & pull request**
- Write a clear title and description
- Request reviewers if needed
- Submit the PR

#### 9. Address review feedback
```bash
# Make requested changes locally
git add .
git commit -m "fix: address review comments"
git push origin feature/my-feature
# The PR updates automatically
```

#### 10. Merge the PR
- Reviewer (or you) approves on GitHub
- Click **Merge pull request** (prefer "Squash and merge" or "Rebase and merge" for clean history)

#### 11. Clean up branches
```bash
# Delete remote branch (GitHub can do this automatically after merge)
git push origin --delete feature/my-feature

# Delete local branch
git branch -d feature/my-feature

# Pull latest main
git checkout main
git pull origin main
```

---

## Common Scenarios & Recipes

### I committed to main by mistake
```bash
# Move the commit to a new branch, then reset main
git branch feature/oops-fix
git reset --hard HEAD~1
git switch feature/oops-fix
```

### I need to update my feature branch with latest main
```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/main
# resolve any conflicts, then:
git rebase --continue
```

### I want to squash my last 3 commits into one
```bash
git rebase -i HEAD~3
# In the editor, change "pick" to "squash" (or "s") for commits 2 and 3
# Save, then edit the combined commit message
```

### I accidentally deleted a branch
```bash
# Find the SHA from reflog
git reflog
# Recreate the branch at that SHA
git branch recovered-branch <sha>
```

### I want to cherry-pick a commit from another branch
```bash
git cherry-pick <commit-sha>
```

### I need to see what changed between two releases
```bash
git log v1.0.0..v1.1.0 --oneline
git diff v1.0.0 v1.1.0
```

### I staged the wrong file
```bash
git restore --staged wrongfile.txt
```

### Resolve a merge conflict
```bash
# After git merge or git pull shows conflicts:
# 1. Open conflicting files and resolve the <<<<< / ===== / >>>>> markers
# 2. Stage the resolved files
git add resolved-file.txt
# 3. Complete the merge
git commit
```

---

*Last updated: June 2026*
