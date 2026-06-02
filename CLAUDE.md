# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for agent orientation and [CODEBASE.md](./CODEBASE.md) for the full codebase map.

## Development

```bash
npm run dev      # start dev server (Turbopack)
npm run lint     # ESLint check — run before declaring a feature done
npm run build    # production build
```

## Rules

- Run `npm run lint` before marking any task complete.
- No backend — localStorage only. Do not add API routes or a database.
- Use Chakra UI components. Tailwind utility classes are available but secondary.
- Touch only what the task requires; do not refactor surrounding code.
