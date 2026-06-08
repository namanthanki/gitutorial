# Git Flow Walkthrough

A hands-on reference for the full Git workflow used by this team. Work through these in order — each one builds on the last.

---

## Prerequisites

- Git installed → verify with `git --version`
- A GitHub account with access to this repo
- A code editor (VS Code recommended)
- Basic terminal familiarity

---

## Exercises

Work through these in order. Check them off as you go.

---

### Exercise 1 — Fork & Clone the Repo

**Goal:** Get a local copy of the repository to work from.

1. Go to the GitHub page for this repo
2. Click the **Fork** button (top-right corner)
3. GitHub creates a copy at `https://github.com/<your-username>/gitutorial`
4. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/gitutorial.git
   cd gitutorial
   ```
5. Add the original repo as upstream:
   ```bash
   git remote add upstream https://github.com/<original-owner>/gitutorial.git
   ```
6. Verify your remotes:
   ```bash
   git remote -v
   # origin    https://github.com/<your-username>/gitutorial.git (fetch)
   # upstream  https://github.com/<original-owner>/gitutorial.git (fetch)
   ```

✅ **Done when:** `git remote -v` shows both `origin` and `upstream`.

---

### Exercise 2 — Create a Feature Branch

**Goal:** Learn the team's branch naming convention and create a branch off `main`.

1. Make sure you're on the latest `main`:
   ```bash
   git switch main
   git pull origin main
   ```
2. Create your feature branch using the naming convention:
   ```bash
   git switch -c feat/AUTH-101-user-login
   ```
   Branch naming format: `<type>/<ticket-id>-<short-description>`

   | Prefix | When to use |
   |--------|-------------|
   | `feat/` | New feature |
   | `fix/` | Bug fix |
   | `hotfix/` | Urgent production fix |
   | `chore/` | Tooling, deps, config |
   | `docs/` | Documentation only |
   | `refactor/` | Code restructure, no behavior change |

3. Confirm you're on the new branch:
   ```bash
   git branch
   ```

✅ **Done when:** Your terminal shows `* feat/AUTH-101-user-login`.

---

### Exercise 3 — Conventional Commits

**Goal:** Write structured, readable commit messages using the Conventional Commits standard.

Commit format:
```
<type>(<scope>): <short description>
```

1. Create a new file and make a small change:
   ```bash
   echo "login logic here" > src/auth/login.txt
   ```
2. Stage the file:
   ```bash
   git add src/auth/login.txt
   ```
3. Review what's staged before committing:
   ```bash
   git status
   git diff --staged
   ```
4. Write a conventional commit:
   ```bash
   git commit -m "feat(auth): add login file with placeholder logic"
   ```
5. Make another small change and commit with a body:
   ```bash
   git commit -m "feat(auth): add JWT token generation

   Implements token signing on successful login.
   Token expires in 1 hour.

   Closes #AUTH-101"
   ```
6. View your commits so far:
   ```bash
   git log --oneline
   ```

> ❌ Avoid: `git commit -m "fix stuff"` / `"wip"` / `"changes"`  
> ✅ Use: `git commit -m "fix(auth): handle null user on login"`

✅ **Done when:** `git log --oneline` shows two clean, descriptive commits.

---

### Exercise 4 — Push the Branch to Remote

**Goal:** Push your local branch to GitHub and set the upstream tracking.

1. Push your branch for the first time:
   ```bash
   git push -u origin feat/AUTH-101-user-login
   ```
2. After the first push, subsequent pushes are just:
   ```bash
   git push
   ```
3. Go to `https://github.com/<your-username>/gitutorial` and confirm your branch appears under **branches**.

> 💡 If someone pushed to `main` while you were working, sync up before pushing:
> ```bash
> git fetch origin
> git rebase origin/main
> ```

✅ **Done when:** Your branch is visible on GitHub.

---

### Exercise 5 — Open a Pull Request with the Team Template

**Goal:** Create a well-structured PR using the team's PR template.

1. On GitHub, you'll see a **"Compare & pull request"** banner — click it
2. Set the **base branch** to `main` (not another feature branch)
3. Fill in the PR title using conventional format:
   ```
   feat(auth): add login endpoint with JWT support
   ```
4. Fill in the PR description using the template below:

   ```markdown
   ## Summary
   Adds the login endpoint that accepts email/password and returns a signed JWT.

   ## Related Issue
   Closes #AUTH-101

   ## Type of Change
   - [x] New feature

   ## Checklist
   - [x] Self-reviewed the diff
   - [x] No console.log / debug code left
   - [x] PR is scoped (not too large)

   ## Notes for Reviewer
   Pay attention to the token expiry logic in auth/login.txt.
   ```

5. Assign **Reviewers** from the right-hand panel
6. Add a **Label** (e.g., `feature`)
7. Click **Create pull request**

✅ **Done when:** Your PR is open on GitHub with a filled-in description and a reviewer assigned.

---

### Exercise 6 — Review a Pull Request

**Goal:** Leave meaningful inline comments as a reviewer.

> For this exercise, swap with a teammate — review each other's PRs.

**As the Reviewer:**

1. Open the PR → go to the **"Files changed"** tab
2. Click the `+` icon on any line to leave an inline comment
3. Try leaving a **suggestion** (the reviewer can apply it with one click):
   ````
   ```suggestion
   const token = jwt.sign(payload, secret, { expiresIn: '1h' });
   ```
   ````
4. Practice these comment types:
   - 🔴 **Blocking** — must fix: `"This will fail if user is null"`
   - 🟡 **Non-blocking (nit)** — optional: `"nit: prefer const over let"`
   - ❓ **Question**: `"Why are we using X here instead of Y?"`
5. Submit your review:
   - Click **"Review changes"** (top-right of Files Changed tab)
   - Choose **Approve**, **Request changes**, or **Comment**
   - Click **Submit review**

**As the PR Author (responding):**

1. Reply to each comment — either agree and fix, or push back with reasoning
2. Push the fix:
   ```bash
   git add .
   git commit -m "fix(auth): handle null user case in login"
   git push
   ```
3. Mark each conversation as **Resolved** once addressed
4. Click **Re-request review** if needed

✅ **Done when:** All conversations are resolved and the PR is approved.

---

### Exercise 7 — Merge a Clean PR

**Goal:** Merge an approved, conflict-free PR using the correct strategy.

| Strategy | When to use | Result |
|----------|-------------|--------|
| **Merge commit** | Preserve full branch history | Merge commit added |
| **Squash and merge** | Clean up messy commits into one | Single clean commit on main |
| **Rebase and merge** | Linear history, no merge commit | Commits replayed linearly |

1. Confirm the PR is ready:
   - ✅ Approved by reviewer
   - ✅ All CI checks pass (green)
   - ✅ No conflicts
2. Click **"Squash and merge"** (team default for feature branches)
3. Edit the squash commit message:
   ```
   feat(auth): add login endpoint with JWT support (#101)
   ```
4. Click **"Confirm squash and merge"**
5. Click **"Delete branch"** when prompted

✅ **Done when:** The PR shows "Merged" and the branch is deleted on GitHub.

---

### Exercise 8 — Resolve a Merge Conflict

**Goal:** Experience and resolve a merge conflict — the most important skill.

**Setup (simulate the conflict):**

1. On `main`, edit the first line of `hello.txt` and commit:
   ```bash
   git switch main
   git pull origin main
   # Edit hello.txt — change line 1 to "Hello from main"
   git add hello.txt
   git commit -m "edit: update greeting from main"
   git push
   ```
2. Create a new branch and edit the **same line** differently:
   ```bash
   git switch -c feat/DASH-203-update-greeting
   # Edit hello.txt — change line 1 to "Hello from feature"
   git add hello.txt
   git commit -m "feat(dash): update greeting text"
   git push -u origin feat/DASH-203-update-greeting
   ```

**Trigger and resolve the conflict:**

3. Open a PR for this branch — GitHub will show a conflict warning
4. Locally, rebase your branch on the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   # Git reports: CONFLICT in hello.txt
   ```
5. Open `hello.txt` — you'll see conflict markers:
   ```
   <<<<<<< HEAD
   Hello from main
   =======
   Hello from feature
   >>>>>>> feat/DASH-203-update-greeting
   ```
6. Edit the file — keep the correct version, remove all markers:
   ```
   Hello from feature
   ```
7. Stage the resolved file and continue the rebase:
   ```bash
   git add hello.txt
   git rebase --continue
   ```
8. Push the resolved branch:
   ```bash
   git push --force-with-lease
   ```
   > ⚠️ Use `--force-with-lease` (not `--force`) after a rebase. Never force-push to `main`.

9. The PR on GitHub will now show no conflicts — merge it.

✅ **Done when:** The PR is merged and `hello.txt` on `main` has no conflict markers.

---

### Exercise 9 — Post-Merge Cleanup

**Goal:** Keep your local workspace clean after a merge.

1. Switch back to main and pull the latest:
   ```bash
   git switch main
   git pull origin main
   ```
2. Delete your local feature branch:
   ```bash
   git branch -d feat/AUTH-101-user-login
   ```
3. Delete the remote branch (if not auto-deleted by GitHub):
   ```bash
   git push origin --delete feat/AUTH-101-user-login
   ```
4. Remove stale remote-tracking refs:
   ```bash
   git fetch --prune
   ```
5. Verify everything is clean:
   ```bash
   git branch -a
   git log --oneline --graph -10
   ```

✅ **Done when:** `git branch -a` no longer shows your feature branch locally or remotely.

---

## Quick Reference

```bash
# Start a feature
git switch main && git pull && git switch -c feat/TICKET-id-description

# During development
git add .
git commit -m "feat(scope): description"

# Stay up to date with main
git fetch origin && git rebase origin/main

# First push
git push -u origin feat/TICKET-id-description

# After merge — cleanup
git switch main && git pull && git branch -d feat/TICKET-id-description
```

---

## Tips

- Run `git status` constantly — it tells you exactly where you are
- Run `git log --oneline --graph --all` to visualize your branch history
- When in doubt, **don't force push to shared branches**
- Use `git stash` before switching branches if you have uncommitted work
- Keep PRs small and focused — easier to review, faster to merge

---

*The best way to learn Git is to break things and fix them.*
