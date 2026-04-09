# Zava Storefront — Copilot Instructions

## Project overview

Zava is a fictional premium e-commerce brand selling coffee, accessories, and lifestyle products. This is a TypeScript monorepo with:

- `packages/shared` — Shared types and utility functions
- `apps/api` — Express REST API with Prisma (SQLite)
- `apps/web` — React SPA with Vite

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

### API conventions

- RESTful routes under `/api/`.
- Return JSON with consistent shape: `{ data }` on success, `{ error, message }` on failure.
- Use proper HTTP status codes (200, 201, 400, 401, 404, 500).
- Validate request bodies with Zod schemas.
- Protect routes with the `authenticate` middleware where auth is required.

### React conventions

- Functional components only.
- Custom hooks in `src/hooks/` prefixed with `use`.
- Shared components in `src/components/`, page components in `src/pages/`.
- Use React Router `<Outlet>` for layout composition.
- Co-locate test files next to the source: `Component.test.tsx`.

### Testing

- Use **Vitest** for all tests.
- API tests use **supertest** against the Express app (not a running server).
- React tests use **React Testing Library** with jsdom.
- Test the behaviour, not the implementation.
- Aim for at least one test per route/component.

### Formatting

- Prettier with: single quotes, trailing commas, 100-char print width, 2-space indent.
- Run `npx prettier --check .` to verify.

### Git

- Commit messages: `type(scope): description` (e.g., `feat(api): add product search endpoint`).
- Types: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`.
- One logical change per commit.

## Architecture notes

- Prices are stored as **integers in cents** (e.g., 1899 = $18.99). Use `formatPrice()` from `@zava/shared` to display.
- Auth uses JWT with a `JWT_SECRET` env variable (default in dev: `zava-dev-secret`).
- The Prisma SQLite database is stored at `apps/api/prisma/dev.db`.
- The Vite dev server proxies `/api` requests to `localhost:3001`.
