# CLAUDE.md

- `docs/architecture/` is the source of truth for design and behaviour. Read the relevant doc before changing code in that area, and update it in the same PR when behaviour changes.
- Never commit or push to `main`. Work on a branch off `main` (`feat/…`, `fix/…`, `docs/…`, `chore/…`, `test/…`) and open a PR into `main`. There is no `dev` branch. A `PreToolUse` hook (`.claude/hooks/protect-main.mjs`) blocks commits and pushes to `main`; if it fires, create a branch instead of working around it.
- Scope is a 1–2 hour take-home. Prefer the simplest implementation that satisfies the docs.
