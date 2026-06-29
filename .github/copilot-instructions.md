# Zava Storefront — Copilot Instructions

## Project overview

Zava is a fictional premium e-commerce brand selling coffee, accessories, and lifestyle products. This is a TypeScript monorepo with:

- `packages/shared` — Shared types and utility functions
- `apps/api` — Express REST API with Prisma (SQLite)
- `apps/web` — React SPA with Vite

Path-specific rules live in `.github/instructions/`:

- [`api.instructions.md`](instructions/api.instructions.md) — applies to `apps/api/**`
- [`web.instructions.md`](instructions/web.instructions.md) — applies to `apps/web/**`

## Coding standards

### TypeScript

- **Strict mode** is enabled everywhere — no `any` types without an explanatory comment.
- Use `interface` for object shapes, `type` for unions/intersections.
- Prefer `const` over `let`. Never use `var`.
- Export explicit return types on all public functions.
- Use barrel exports (`index.ts`) in each package.

### Naming conventions

- **Files**: `kebab-case.ts` for utilities, `PascalCase.tsx` for React components.
- **Variables/functions**: `camelCase`.
- **Types/interfaces**: `PascalCase`.
- **Constants**: `UPPER_SNAKE_CASE`.
- **Database columns**: `camelCase` (Prisma convention).

### Testing

- Use **Vitest** for all tests.
- Test the behaviour, not the implementation.
- Aim for at least one test per route/component.
- See the path-specific instruction files for API (supertest) and React (Testing Library) specifics.

### Formatting

- Prettier with: single quotes, trailing commas, 100-char print width, 2-space indent.
- Run `npx prettier --check .` to verify.

### Git

- Commit messages: `type(scope): description` (e.g., `feat(api): add product search endpoint`).
- Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- One logical change per commit.

## Architecture notes

- Prices are stored as **integers in cents** (e.g., 1899 = $18.99). Use `formatPrice()` from `@zava/shared` to display.
