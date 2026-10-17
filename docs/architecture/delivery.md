# Delivery

Status: approved · Related: [testing.md](testing.md)

## Git workflow

- `main` is never committed or pushed to directly.
- Every change gets its own branch off `main`, then a pull request into `main`. There is no `dev` branch.
- Branch names describe the change: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `test/…`.
- A PR that changes behaviour updates the matching doc in `docs/architecture/` in the same PR.

### Enforcement for Claude Code

`.claude/settings.json` registers a `PreToolUse` hook, [`.claude/hooks/protect-main.mjs`](../../.claude/hooks/protect-main.mjs), that runs before every shell command Claude Code executes. It blocks:

- `commit`, `merge`, `rebase`, `cherry-pick`, `revert`, `am` and `push` while the current branch is `main`
- any `push` that targets `main` (`git push origin main`, `HEAD:main`, …) from any branch

Reading commands and `git pull` on `main` are allowed, so `main` can still be updated after a PR is merged. The hook only guards Claude Code; GitHub branch protection would be the equivalent for humans.

## npm scripts

| Script | Does |
| --- | --- |
| `dev` | Vite dev server, MSW enabled |
| `build` | Type-check and production build |
| `preview` | Serve the build locally, MSW enabled |
| `typecheck` | `tsc` without emitting |
| `lint` | ESLint |
| `test` | Vitest, single run |
| `test:watch` | Vitest, watch mode |

The root README gets a "Getting Started" section: Node version, `npm ci`, `npm run dev`, `npm test`.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`, **unless the change touches only non-code files**. These paths are ignored with `paths-ignore`:

```yaml
paths-ignore:
  - '**/*.md'      # README, CLAUDE.md, any Markdown
  - 'docs/**'      # task description and architecture docs
  - '.claude/**'   # local Claude Code settings
  - '.vscode/**'   # editor settings
  - 'LICENSE'
  - '.gitignore'
```

A PR that changes both code and docs still runs CI, because at least one changed file isn't ignored.

Steps:

1. Checkout
2. Set up Node (version from `.nvmrc`) with npm cache
3. `npm ci`
4. `npm run typecheck`
5. `npm run lint`
6. `npm test`
7. `npm run build`

Any failing step fails the check. There is no deploy step: reviewers run the app locally.

If branch protection on `main` is ever set to *require* this check, docs-only PRs will wait forever for a check that never starts. In that case, either don't mark the check as required or add a small companion workflow that reports success for ignored paths.
