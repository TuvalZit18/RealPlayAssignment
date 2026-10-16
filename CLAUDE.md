# CLAUDE.md

- `docs/architecture/` is the source of truth for design and behaviour. Read the relevant doc before changing code in that area, and update it in the same PR when behaviour changes.
- Never commit or push to `main`. Work on a branch off `main` (`feat/…`, `fix/…`, `docs/…`, `chore/…`, `test/…`) and open a PR into `main`. There is no `dev` branch.
- Scope is a 1–2 hour take-home. Prefer the simplest implementation that satisfies the docs.
